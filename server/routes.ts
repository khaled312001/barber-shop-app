import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { seedDatabase } from "./seed";
import * as storage from "./storage";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { registerAdminRoutes } from "./adminRoutes";

const PgSession = connectPgSimple(session);

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(
    session({
      store: new PgSession({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "casca-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        httpOnly: true,
      },
    })
  );

  await seedDatabase();

  function requireAuth(req: Request, res: Response, next: Function) {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  }

  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { fullName, email, password } = req.body;
      if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }
      const user = await storage.createUser({ fullName, email, password });
      (req.session as any).userId = user.id;

      await storage.createNotification({
        userId: user.id,
        title: "Welcome to Casca!",
        message: "Your account has been created successfully. Start exploring salons near you!",
        type: "system",
      });

      const { password: _, ...safeUser } = user;
      res.status(201).json({ user: safeUser });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "No account found with this email" });
      }
      const valid = await storage.verifyPassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Incorrect password" });
      }
      (req.session as any).userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/google", async (req: Request, res: Response) => {
    try {
      const { email, fullName, avatar } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({
          fullName: fullName || email.split("@")[0],
          email,
          password: "__google_oauth__" + Date.now(),
        });
        if (avatar) {
          user = await storage.updateUser(user.id, { avatar });
        }
        await storage.createNotification({
          userId: user.id,
          title: "Welcome to Casca!",
          message: "Your account has been created with Google. Start exploring salons near you!",
          type: "system",
        });
      } else if (avatar && !user.avatar) {
        user = await storage.updateUser(user.id, { avatar });
      }
      (req.session as any).userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/auth/google/start", (req: Request, res: Response) => {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return res.status(500).send("Google OAuth not configured");
    }

    const returnUrl = (req.query.returnUrl as string) || "/";
    const domains = process.env.REPLIT_DOMAINS?.split(",") || [];
    const primaryDomain = domains[0] || process.env.REPLIT_DEV_DOMAIN || "localhost:5000";
    const callbackUrl = `https://${primaryDomain}/api/auth/google/callback`;

    const state = Buffer.from(JSON.stringify({ returnUrl })).toString("base64url");

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      state,
      prompt: "consent",
    });

    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  });

  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const { code, state, error } = req.query;

    let returnUrl = "/";
    try {
      if (state) {
        const parsed = JSON.parse(Buffer.from(state as string, "base64url").toString());
        returnUrl = parsed.returnUrl || "/";
      }
    } catch { }

    if (error || !code) {
      const errorPage = `<!DOCTYPE html><html><body style="background:#1F222A;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><h2>Sign-in Failed</h2><p>${error || "No authorization code received"}</p><p>You can close this window and try again.</p></div></body></html>`;
      return res.status(400).send(errorPage);
    }

    try {
      const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
      const domains = process.env.REPLIT_DOMAINS?.split(",") || [];
      const primaryDomain = domains[0] || process.env.REPLIT_DEV_DOMAIN || "localhost:5000";
      const callbackUrl = `https://${primaryDomain}/api/auth/google/callback`;

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: callbackUrl,
          grant_type: "authorization_code",
        }),
      });
      const tokenData = await tokenRes.json() as any;

      if (!tokenData.access_token) {
        throw new Error(tokenData.error_description || "Failed to exchange code for token");
      }

      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userInfo = await userInfoRes.json() as any;

      if (!userInfo.email) {
        throw new Error("Could not retrieve email from Google");
      }

      let user = await storage.getUserByEmail(userInfo.email);
      if (!user) {
        user = await storage.createUser({
          fullName: userInfo.name || userInfo.email.split("@")[0],
          email: userInfo.email,
          password: "__google_oauth__" + Date.now(),
        });
        if (userInfo.picture) {
          user = await storage.updateUser(user.id, { avatar: userInfo.picture });
        }
        await storage.createNotification({
          userId: user.id,
          title: "Welcome to Casca!",
          message: "Your account has been created with Google. Start exploring salons near you!",
          type: "system",
        });
      } else if (userInfo.picture && !user.avatar) {
        user = await storage.updateUser(user.id, { avatar: userInfo.picture });
      }

      (req.session as any).userId = user.id;

      req.session.save((err) => {
        if (err) console.error("Session save error:", err);

        const domains = process.env.REPLIT_DOMAINS?.split(",") || [];
        const completeDomain = domains[0] || process.env.REPLIT_DEV_DOMAIN || "localhost:5000";
        const completeUrl = `https://${completeDomain}/api/auth/google/complete?status=success`;
        res.redirect(completeUrl);
      });
    } catch (err: any) {
      console.error("Google OAuth callback error:", err);
      const errorPage = `<!DOCTYPE html><html><body style="background:#1F222A;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><h2>Sign-in Failed</h2><p>${err.message}</p><p>You can close this window and try again.</p></div></body></html>`;
      res.status(500).send(errorPage);
    }
  });

  app.get("/api/auth/google/complete", (_req: Request, res: Response) => {
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Sign-in Complete</title></head><body style="background:#1F222A;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><div style="width:80px;height:80px;border-radius:50%;background:#F4A460;display:flex;align-items:center;justify-content:center;margin:0 auto 20px"><svg width="40" height="40" fill="none" stroke="#fff" stroke-width="3"><polyline points="10,22 18,30 32,14"/></svg></div><h2>Signed in successfully!</h2><p>Returning to app...</p></div></body></html>`);
  });

  app.post("/api/auth/facebook", async (req: Request, res: Response) => {
    try {
      const { email, fullName, avatar } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({
          fullName: fullName || email.split("@")[0],
          email,
          password: "__facebook_oauth__" + Date.now(),
        });
        if (avatar) {
          user = await storage.updateUser(user.id, { avatar });
        }
        await storage.createNotification({
          userId: user.id,
          title: "Welcome to Casca!",
          message: "Your account has been created with Facebook. Start exploring salons near you!",
          type: "system",
        });
      } else if (avatar && !user.avatar) {
        user = await storage.updateUser(user.id, { avatar });
      }
      (req.session as any).userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/apple", async (req: Request, res: Response) => {
    try {
      const { email, fullName } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({
          fullName: fullName || "Apple User",
          email,
          password: "__apple_oauth__" + Date.now(),
        });
        await storage.createNotification({
          userId: user.id,
          title: "Welcome to Casca!",
          message: "Your account has been created with Apple. Start exploring salons near you!",
          type: "system",
        });
      }
      (req.session as any).userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/auth/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { fullName, phone, nickname, gender, dob, avatar } = req.body;
      const user = await storage.updateUser(userId, { fullName, phone, nickname, gender, dob, avatar });
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/salons", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      let allSalons;
      if (category && category !== 'all') {
        allSalons = await storage.getSalonsByCategory(category);
      } else {
        allSalons = await storage.getAllSalons();
      }
      res.json(allSalons);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/salons/search", async (req: Request, res: Response) => {
    try {
      const query = (req.query.q as string) || "";
      const results = await storage.searchSalons(query);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/salons/:id", async (req: Request, res: Response) => {
    try {
      const salon = await storage.getSalonById(req.params.id);
      if (!salon) {
        return res.status(404).json({ message: "Salon not found" });
      }
      const [salonServices, salonPackages, salonSpecialists, salonReviews] = await Promise.all([
        storage.getSalonServices(req.params.id),
        storage.getSalonPackages(req.params.id),
        storage.getSalonSpecialists(req.params.id),
        storage.getSalonReviews(req.params.id),
      ]);
      res.json({ ...salon, services: salonServices, packages: salonPackages, specialists: salonSpecialists, reviews: salonReviews });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/bookings", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const userBookings = await storage.getUserBookings(userId);
      res.json(userBookings);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/bookings", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { salonId, salonName, salonImage, services, date, time, totalPrice, paymentMethod, couponId } = req.body;
      const booking = await storage.createBooking({
        userId, salonId, salonName, salonImage: salonImage || "",
        services: services || [], date, time, totalPrice, paymentMethod: paymentMethod || "",
      });

      if (couponId) {
        await storage.updateCouponUsage(couponId);
      }

      await storage.createNotification({
        userId,
        title: "Booking Confirmed",
        message: `Your appointment at ${salonName} on ${date} at ${time} is confirmed.`,
        type: "booking",
      });

      res.status(201).json(booking);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/bookings/:id/cancel", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const booking = await storage.cancelBooking(req.params.id, userId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      await storage.createNotification({
        userId,
        title: "Booking Cancelled",
        message: `Your appointment at ${booking.salonName} has been cancelled.`,
        type: "booking",
      });

      res.json(booking);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/bookmarks", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const salonIds = await storage.getUserBookmarks(userId);
      res.json(salonIds);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/bookmarks/toggle", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { salonId } = req.body;
      const isBookmarked = await storage.toggleBookmark(userId, salonId);
      res.json({ isBookmarked });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/messages", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const msgs = await storage.getUserMessages(userId);
      const grouped: Record<string, any> = {};
      for (const m of msgs) {
        if (!grouped[m.salonId]) {
          grouped[m.salonId] = {
            salonId: m.salonId,
            salonName: m.salonName,
            salonImage: m.salonImage,
            lastMessage: m.content,
            time: m.createdAt,
            unread: 0,
          };
        }
      }
      res.json(Object.values(grouped));
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/messages/:salonId", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const msgs = await storage.getConversation(userId, req.params.salonId);
      res.json(msgs);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/messages", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { salonId, salonName, salonImage, content } = req.body;
      const msg = await storage.sendMessage({ userId, salonId, salonName, salonImage: salonImage || "", content, sender: "user" });

      setTimeout(async () => {
        try {
          await storage.sendMessage({
            userId, salonId, salonName, salonImage: salonImage || "",
            content: "Thanks for your message! We'll get back to you shortly.",
            sender: "salon",
          });
        } catch { }
      }, 2000);

      res.status(201).json(msg);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/notifications", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const notifs = await storage.getUserNotifications(userId);
      res.json(notifs);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/notifications/:id/read", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      await storage.markNotificationRead(req.params.id, userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/reviews", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUserById(userId);
      const { salonId, rating, comment } = req.body;
      const review = await storage.createReview({
        salonId, userId, userName: user?.fullName || "Anonymous",
        userImage: user?.avatar || "", rating, comment,
      });
      res.status(201).json(review);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/stripe/publishable-key", async (_req: Request, res: Response) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (err: any) {
      res.status(500).json({ message: "Stripe not configured" });
    }
  });

  app.post("/api/stripe/create-payment-intent", requireAuth, async (req: Request, res: Response) => {
    try {
      const { amount, currency, bookingData } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      const stripe = await getUncachableStripeClient();
      const userId = (req.session as any).userId;
      const user = await storage.getUserById(userId);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency || 'usd',
        metadata: {
          userId,
          userEmail: user?.email || '',
          salonId: bookingData?.salonId || '',
          salonName: bookingData?.salonName || '',
          services: JSON.stringify(bookingData?.services || []),
          date: bookingData?.date || '',
          time: bookingData?.time || '',
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (err: any) {
      console.error('Payment intent error:', err);
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/stripe/confirm-payment", requireAuth, async (req: Request, res: Response) => {
    try {
      const { paymentIntentId } = req.body;
      const stripe = await getUncachableStripeClient();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      res.json({
        status: paymentIntent.status,
        amount: paymentIntent.amount,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/auth/change-password", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password required" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.password.startsWith("__google_oauth__") || user.password.startsWith("__facebook_oauth__") || user.password.startsWith("__apple_oauth__")) {
        return res.status(400).json({ message: "Password change not available for social login accounts" });
      }

      const valid = await storage.verifyPassword(currentPassword, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      const bcrypt = await import("bcryptjs");
      const hashed = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(userId, { password: hashed });

      res.json({ message: "Password changed successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/coupons", async (req: Request, res: Response) => {
    try {
      const activeCoupons = await storage.getActiveCoupons();
      res.json(activeCoupons);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/coupons/validate", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Coupon code is required" });
      }

      const coupon = await storage.getCouponByCode(code);
      if (!coupon) {
        return res.status(404).json({ message: "Invalid coupon code" });
      }

      if (!coupon.active) {
        return res.status(400).json({ message: "This coupon is no longer active" });
      }

      const now = new Date().toISOString().split('T')[0];
      if (coupon.expiryDate < now) {
        return res.status(400).json({ message: "This coupon has expired" });
      }

      if (coupon.usageLimit && coupon.usageLimit > 0 && coupon.usedCount !== null && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "This coupon has reached its usage limit" });
      }

      res.json({
        id: coupon.id,
        code: coupon.code,
        discount: coupon.discount,
        type: coupon.type,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  registerAdminRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
