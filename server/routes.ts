import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import crypto from "node:crypto";
import session from "express-session";
import mysqlSessionFactory from "express-mysql-session";
import { pool, db } from "./db";
import { seedDatabase } from "./seed";
import * as storage from "./storage";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { registerAdminRoutes } from "./adminRoutes";
import { logActivity } from "./activityLogger";
import { z } from "zod";
import { messages, users, coupons, salons } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

// Helper to safely parse JSON fields that MySQL may return as strings
function safeJsonArray(val: unknown): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  }
  return [];
}

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const bookingSchema = z.object({
  salonId: z.string().min(1, "Salon ID is required"),
  salonName: z.string().min(1, "Salon name is required"),
  salonImage: z.string().optional().default(""),
  services: z.array(z.string()).default([]),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  totalPrice: z.number().min(0, "Price must be non-negative"),
  paymentMethod: z.string().optional().default(""),
  couponId: z.string().optional(),
});

const reviewSchema = z.object({
  salonId: z.string().min(1, "Salon ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().default(""),
});

const MySQLStore = mysqlSessionFactory(session as any);

export async function registerRoutes(app: Express): Promise<Server> {
  const sessionStore = new (MySQLStore as any)({
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 30 * 24 * 60 * 60 * 1000,
    createDatabaseTable: true,
  }, pool);

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
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
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { fullName, email, password } = parsed.data;
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
      const parsed = signinSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { email, password } = parsed.data;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "No account found with this email" });
      }
      const valid = await storage.verifyPassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Incorrect password" });
      }
      (req.session as any).userId = user.id;
      await logActivity({ userId: user.id, userRole: user.role || "user", action: "user.login", entityType: "user", entityId: user.id });
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
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Sign-in Complete</title></head><body style="background:#181A20;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><div style="width:80px;height:80px;border-radius:50%;background:#10B981;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;box-shadow:0 10px 40px rgba(16,185,129,0.4)"><svg width="40" height="40" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="10 22 18 30 32 14"/></svg></div><h2 style="margin:0 0 8px;font-size:22px">Signed in successfully!</h2><p style="color:#888;margin:0" id="msg">Closing window...</p></div><script>
(function(){
  // Notify parent window (for SPA popup flow)
  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: 'google-auth-success', ts: Date.now() }, '*');
    }
  } catch(e) {}
  // Try via BroadcastChannel too (works across tabs on same origin)
  try {
    var bc = new BroadcastChannel('casca-auth');
    bc.postMessage({ type: 'google-auth-success', ts: Date.now() });
    setTimeout(function(){ bc.close(); }, 100);
  } catch(e) {}
  // Close the popup. If it was opened by window.open, this works.
  // If it's the same tab (mobile/no opener), redirect to app root.
  var closed = false;
  setTimeout(function(){
    try { window.close(); closed = true; } catch(e) {}
    setTimeout(function(){
      if (!window.closed) {
        document.getElementById('msg').textContent = 'Redirecting...';
        window.location.replace('/');
      }
    }, 400);
  }, 350);
})();
</script></body></html>`);
  });

  // Google Identity Services (One Tap + Sign-In With Google button)
  // Client sends the JWT credential. We verify it with Google, find/create the user,
  // and reuse the stored role (salon_admin / staff / admin / user) for session login.
  app.post("/api/auth/google/token", async (req: Request, res: Response) => {
    try {
      const { credential } = req.body || {};
      if (!credential || typeof credential !== "string") {
        return res.status(400).json({ message: "credential is required" });
      }

      // Verify ID token against Google's tokeninfo endpoint
      const tokenInfoRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );
      const payload = (await tokenInfoRes.json()) as any;

      if (!tokenInfoRes.ok || payload.error_description || !payload.email) {
        return res.status(401).json({ message: payload.error_description || "Invalid Google token" });
      }

      // Verify audience (client ID) matches
      const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
      if (clientId && payload.aud !== clientId) {
        return res.status(401).json({ message: "Token audience mismatch" });
      }

      // Find existing user — reuses stored role if email is already registered.
      let user = await storage.getUserByEmail(payload.email);
      if (!user) {
        user = await storage.createUser({
          fullName: payload.name || payload.email.split("@")[0],
          email: payload.email,
          password: "__google_oauth__" + Date.now(),
        });
        if (payload.picture) {
          user = await storage.updateUser(user.id, { avatar: payload.picture });
        }
        try {
          await storage.createNotification({
            userId: user.id,
            title: "Welcome to Casca!",
            message: "Your account has been created with Google. Start exploring salons near you!",
            type: "system",
          });
        } catch {}
      } else if (payload.picture && !user.avatar) {
        user = await storage.updateUser(user.id, { avatar: payload.picture });
      }

      (req.session as any).userId = user.id;
      req.session.save((err) => {
        if (err) console.error("Session save error:", err);
        res.json({ user });
      });
    } catch (err: any) {
      console.error("Google token verify error:", err);
      res.status(500).json({ message: err?.message || "Token verification failed" });
    }
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

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    const userId = (req.session as any)?.userId;
    if (userId) await logActivity({ userId, action: "user.logout", entityType: "user", entityId: userId });
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.json({ authenticated: false, user: null });
      }
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.json({ authenticated: false, user: null });
      }
      const { password: _, ...safeUser } = user;
      res.json({ authenticated: true, user: safeUser });
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
      // Ensure JSON fields are always parsed arrays
      const fixedSalons = allSalons.map((s: any) => ({ ...s, gallery: safeJsonArray(s.gallery) }));
      res.json(fixedSalons);
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
      const idOrSlug = String(req.params.id);
      let salon = await storage.getSalonById(idOrSlug);
      // If not found by ID, try by slug
      if (!salon) {
        const { salons: salonsTable } = require("@shared/schema");
        const { eq: eqOp } = require("drizzle-orm");
        const [bySlug] = await db.select().from(salonsTable).where(eqOp(salonsTable.landingSlug, idOrSlug));
        salon = bySlug || null;
      }
      if (!salon) {
        return res.status(404).json({ message: "Salon not found" });
      }
      const salonId = salon.id;
      const [salonServices, salonPackages, salonSpecialists, salonReviews] = await Promise.all([
        storage.getSalonServices(salonId),
        storage.getSalonPackages(salonId),
        storage.getSalonSpecialists(salonId),
        storage.getSalonReviews(salonId),
      ]);
      // Ensure JSON fields are always parsed arrays (MySQL JSON columns may return strings)
      const gallery = safeJsonArray(salon.gallery);
      const fixedPackages = salonPackages.map((pkg: any) => ({
        ...pkg,
        services: safeJsonArray(pkg.services),
      }));
      res.json({ ...salon, gallery, services: salonServices, packages: fixedPackages, specialists: salonSpecialists, reviews: salonReviews });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/bookings", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const userBookings = await storage.getUserBookings(userId);
      // Parse services JSON strings from MySQL
      const parsed = userBookings.map(b => ({
        ...b,
        services: safeJsonArray(b.services),
      }));
      res.json(parsed);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/bookings", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const parsed = bookingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { salonId, salonName, salonImage, services, date, time, totalPrice, paymentMethod, couponId } = parsed.data;
      const booking = await storage.createBooking({
        userId, salonId, salonName, salonImage,
        services, date, time, totalPrice, paymentMethod,
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

      // Notify salon admin and staff about new booking
      try {
        const { salonStaff: salonStaffTable } = require("@shared/schema");
        const staffLinks = await db.select().from(salonStaffTable).where(eq(salonStaffTable.salonId, salonId));
        const [customer] = await db.select().from(users).where(eq(users.id, userId));
        const customerName = customer?.fullName || 'Customer';
        for (const link of staffLinks) {
          await storage.createNotification({
            userId: link.userId,
            title: "New Booking",
            message: `${customerName} booked at ${salonName} on ${date} at ${time} — CHF ${totalPrice}`,
            type: "booking",
          });
        }
        // Also notify via WhatsApp
        try {
          const { notifySalonViaWhatsApp, notifySuperAdminViaWhatsApp } = require("./whatsappService");
          const waMsg = `New Booking!\n${customerName} at ${salonName}\nDate: ${date} at ${time}\nTotal: CHF ${totalPrice}`;
          await notifySalonViaWhatsApp(salonId, waMsg);
          await notifySuperAdminViaWhatsApp(waMsg);
        } catch (waErr) { console.warn('WhatsApp notification failed:', waErr); }
      } catch (e) { console.warn('Failed to notify staff:', e); }

      await logActivity({ userId, action: "booking.created", entityType: "booking", entityId: booking.id, metadata: { salonId, date, time, totalPrice } });

      res.status(201).json(booking);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/bookings/:id/cancel", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const booking = await storage.cancelBooking(String(req.params.id), userId);
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
            sender: m.sender,
            unread: msgs.filter(x => x.salonId === m.salonId && x.sender === 'salon' && !x.isRead).length,
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
      const salonId = String(req.params.salonId);
      const msgs = await storage.getConversation(userId, salonId);
      // Mark salon messages as read
      await db.update(messages).set({ isRead: 1 }).where(
        and(eq(messages.userId, userId), eq(messages.salonId, salonId), eq(messages.sender, 'salon'))
      );
      res.json(msgs);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/messages", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
      const { salonId, salonName, salonImage, content, messageType } = req.body;
      const msgId = crypto.randomUUID();
      await db.insert(messages).values({
        id: msgId, userId, salonId, salonName, salonImage: salonImage || "",
        content, sender: "user", senderName: currentUser?.fullName || '', isRead: 0,
        messageType: messageType || 'text',
      });
      const [msg] = await db.select().from(messages).where(eq(messages.id, msgId));
      // Notify salon admin about new message
      try {
        const { salonStaff: salonStaffTable } = require("@shared/schema");
        const staffLinks = await db.select().from(salonStaffTable).where(eq(salonStaffTable.salonId, salonId));
        for (const link of staffLinks) {
          await storage.createNotification({
            userId: link.userId,
            title: "New Message",
            message: `${currentUser?.fullName || 'Customer'}: ${content.substring(0, 80)}`,
            type: "message",
          });
        }
      } catch (e) { console.warn('Failed to notify staff about message:', e); }
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
      await storage.markNotificationRead(String(req.params.id), userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/reviews", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const parsed = reviewSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { salonId, rating, comment } = parsed.data;
      const user = await storage.getUserById(userId);
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

  // Get salons that have active discount coupons right now
  app.get("/api/salons-with-discounts", async (_req: Request, res: Response) => {
    try {
      const now = new Date().toISOString().split('T')[0];
      const activeCouponsList = await db.select()
        .from(coupons)
        .where(and(
          eq(coupons.active, true),
          sql`${coupons.expiryDate} >= ${now}`,
          sql`${coupons.salonId} IS NOT NULL AND ${coupons.salonId} != ''`
        ));

      // Group coupons by salonId
      const salonIds = [...new Set(activeCouponsList.map(c => c.salonId!).filter(Boolean))];
      if (salonIds.length === 0) return res.json([]);

      const salonsList = await db.select().from(salons)
        .where(sql`${salons.id} IN (${sql.join(salonIds.map(id => sql`${id}`), sql`, `)})`);

      // Attach coupons to each salon
      const result = salonsList.map(salon => ({
        ...salon,
        coupons: activeCouponsList.filter(c => c.salonId === salon.id),
        bestDiscount: Math.max(...activeCouponsList.filter(c => c.salonId === salon.id).map(c => c.discount)),
      }));

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/coupons/validate", async (req: Request, res: Response) => {
    try {
      const { code, salonId } = req.body;
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

      // If coupon is salon-specific, check it matches the booking salon
      if (coupon.salonId && coupon.salonId !== "" && salonId && coupon.salonId !== salonId) {
        return res.status(400).json({ message: "This coupon is not valid for this salon" });
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

  // Trial request - public endpoint for new salons to request a free trial
  app.post("/api/trial-request", async (req: Request, res: Response) => {
    try {
      const { salonName, ownerName, email, phone, city, country, message } = req.body;

      if (!salonName || !ownerName || !email || !phone) {
        return res.status(400).json({ message: "Salon name, owner name, email, and phone are required" });
      }

      // Save to database
      const { trialRequests } = require("@shared/schema");
      const id = require("node:crypto").randomUUID();
      await db.insert(trialRequests).values({
        id,
        salonName,
        ownerName,
        email,
        phone,
        city: city || "",
        country: country || "",
        message: message || "",
        status: "pending",
      });

      // Notify super admin via WhatsApp
      try {
        const { notifySuperAdminViaWhatsApp } = require("./whatsappService");
        const waMsg = `New Trial Request!\nSalon: ${salonName}\nOwner: ${ownerName}\nEmail: ${email}\nPhone: ${phone}\nCity: ${city || '-'}\nCountry: ${country || '-'}${message ? `\nMessage: ${message}` : ''}`;
        await notifySuperAdminViaWhatsApp(waMsg);
      } catch (e) { console.warn('WhatsApp trial notification failed:', e); }

      // Notify via email
      try {
        const { sendTrialRequestNotification } = require("./emailService");
        await sendTrialRequestNotification({ salonName, ownerName, email, phone, city: city || '', country: country || '', message: message || '' });
      } catch (e) { console.warn('Email trial notification failed:', e); }

      // Create admin notification
      try {
        const superAdmins = await db.select().from(users).where(eq(users.role, 'super_admin'));
        for (const admin of superAdmins) {
          await storage.createNotification({
            userId: admin.id,
            title: "New Trial Request",
            message: `${ownerName} from "${salonName}" requested a 14-day free trial. Phone: ${phone}`,
            type: "system",
          });
        }
      } catch (e) { console.warn('Admin notification failed:', e); }

      await logActivity({ userId: '', action: "trial.requested", entityType: "trial_request", entityId: id, metadata: { salonName, ownerName, email, phone } });

      res.status(201).json({ message: "Trial request submitted successfully", id });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Get trial requests (admin)
  app.get("/api/admin/trial-requests", requireAuth, async (req: Request, res: Response) => {
    try {
      const { trialRequests } = require("@shared/schema");
      const { desc: descOrder } = require("drizzle-orm");
      const requests = await db.select().from(trialRequests).orderBy(descOrder(trialRequests.createdAt));
      res.json(requests);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Update trial request status (admin)
  app.put("/api/admin/trial-requests/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { trialRequests } = require("@shared/schema");
      await db.update(trialRequests).set({ status: req.body.status }).where(eq(trialRequests.id, req.params.id));
      res.json({ message: "Updated" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // AI STYLE ADVISOR - Personalized hairstyle recommendations
  // ══════════════════════════════════════════════════════════════════════════════

  app.get("/api/ai/style-advisor", (_req: Request, res: Response) => {
    res.json({ status: "ok", message: "AI Style Advisor API. Send a POST request with { skinTone, hairType, faceShape, gender } to get recommendations." });
  });

  app.post("/api/ai/style-advisor", async (req: Request, res: Response) => {
    try {
      const { skinTone, hairType, faceShape, gender, photoBase64 } = req.body;

      if (!skinTone || !hairType) {
        return res.status(400).json({ message: "Skin tone and hair type are required" });
      }

      // Try Claude AI first, fallback to rule-based engine
      const apiKey = process.env.ANTHROPIC_API_KEY;

      if (apiKey) {
        try {
          const Anthropic = (await import("@anthropic-ai/sdk")).default;
          const client = new Anthropic({ apiKey });

          const userProfile = `Gender: ${gender || 'male'}\nSkin Tone: ${skinTone}\nHair Type: ${hairType}\nFace Shape: ${faceShape || 'unknown'}`;

          const messageContent: any[] = [];

          if (photoBase64) {
            messageContent.push({
              type: "image" as const,
              source: {
                type: "base64" as const,
                media_type: "image/jpeg" as const,
                data: photoBase64.replace(/^data:image\/\w+;base64,/, ''),
              },
            });
          }

          messageContent.push({
            type: "text" as const,
            text: `You are an expert hairstylist and color consultant. Analyze this client's profile and provide personalized hairstyle recommendations.

Client Profile:
${userProfile}
${photoBase64 ? '\nA photo of the client is attached. Use it to refine your recommendations based on their actual features.' : ''}

Respond ONLY in valid JSON format with this exact structure (no markdown, no code blocks):
{
  "analysis": {
    "skinToneAnalysis": "Brief analysis of their skin undertone (warm/cool/neutral)",
    "hairTypeAnalysis": "Brief analysis of their hair texture and what it can handle",
    "faceShapeAnalysis": "Brief analysis of face shape and best proportions"
  },
  "recommendedStyles": [
    {
      "name": "Style Name",
      "description": "Why this style works for them",
      "difficulty": "easy|medium|hard",
      "maintenanceLevel": "low|medium|high",
      "bestFor": "What occasions or lifestyles"
    }
  ],
  "recommendedColors": [
    {
      "name": "Color Name",
      "hex": "#hexcode",
      "reason": "Why this color complements their skin tone"
    }
  ],
  "avoidStyles": ["Style names to avoid and why"],
  "avoidColors": ["Color names to avoid and why"],
  "stylingTips": ["3-4 personalized styling tips"],
  "productRecommendations": ["2-3 product type recommendations based on hair type"]
}

Give exactly 4-5 recommended styles, 3-4 recommended colors, 2 styles to avoid, 2 colors to avoid, 3-4 styling tips, and 2-3 product recommendations. Be specific and practical.`,
          });

          const response = await client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2000,
            messages: [{ role: "user", content: messageContent }],
          });

          const textBlock = response.content.find((b: any) => b.type === "text");
          if (textBlock && textBlock.type === "text") {
            const jsonStr = textBlock.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const aiResult = JSON.parse(jsonStr);
            return res.json({ source: "ai", ...aiResult });
          }
        } catch (aiErr: any) {
          console.warn("AI Style Advisor: Claude API failed, using fallback:", aiErr.message);
        }
      }

      // ── Fallback: Comprehensive rule-based recommendation engine ──
      const result = generateStyleRecommendations(skinTone, hairType, faceShape || "oval", gender || "male");
      res.json({ source: "engine", ...result });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  registerAdminRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}

// ══════════════════════════════════════════════════════════════════════════════
// Rule-based Style Recommendation Engine
// ══════════════════════════════════════════════════════════════════════════════

interface StyleRec { name: string; description: string; difficulty: string; maintenanceLevel: string; bestFor: string; }
interface ColorRec { name: string; hex: string; reason: string; }

function generateStyleRecommendations(skinTone: string, hairType: string, faceShape: string, gender: string) {
  const allStyles: Record<string, StyleRec[]> = {
    straight: [
      { name: "Classic Side Part", description: "A timeless look that works great with straight hair. Clean lines and easy to maintain.", difficulty: "easy", maintenanceLevel: "low", bestFor: "Professional settings and daily wear" },
      { name: "Textured Crop", description: "Short sides with textured top adds dimension to straight hair.", difficulty: "easy", maintenanceLevel: "medium", bestFor: "Casual and modern everyday look" },
      { name: "Slick Back", description: "Straight hair holds a slick back perfectly for a polished look.", difficulty: "easy", maintenanceLevel: "medium", bestFor: "Formal events and business" },
      { name: "Pompadour", description: "Volume on top with tapered sides. Straight hair creates clean lines.", difficulty: "medium", maintenanceLevel: "high", bestFor: "Special occasions and statement looks" },
      { name: "Buzz Cut", description: "Ultra low maintenance with a clean, masculine look.", difficulty: "easy", maintenanceLevel: "low", bestFor: "Active lifestyle and hot climates" },
      { name: "French Crop", description: "Short textured fringe with faded sides. Adds character to straight hair.", difficulty: "easy", maintenanceLevel: "low", bestFor: "Trendy casual look" },
    ],
    wavy: [
      { name: "Medium Length Waves", description: "Let your natural waves shine at medium length for effortless style.", difficulty: "easy", maintenanceLevel: "low", bestFor: "Casual everyday and beach vibes" },
      { name: "Wavy Undercut", description: "Shaved sides with wavy top creates a bold contrast.", difficulty: "medium", maintenanceLevel: "medium", bestFor: "Edgy modern look" },
      { name: "Textured Quiff", description: "Wavy hair adds natural texture to a quiff for volume.", difficulty: "medium", maintenanceLevel: "medium", bestFor: "Going out and social events" },
      { name: "Messy Fringe", description: "A relaxed look that embraces your natural wave pattern.", difficulty: "easy", maintenanceLevel: "low", bestFor: "Casual and artistic settings" },
      { name: "Classic Taper", description: "Gradual fade with wavy top kept at 2-3 inches.", difficulty: "easy", maintenanceLevel: "medium", bestFor: "Professional yet stylish" },
    ],
    curly: [
      { name: "Curly Fringe", description: "Embrace your curls with a defined fringe that frames your face.", difficulty: "easy", maintenanceLevel: "medium", bestFor: "Everyday stylish look" },
      { name: "High Top Fade", description: "Faded sides with volume on top showcases curls beautifully.", difficulty: "medium", maintenanceLevel: "medium", bestFor: "Bold statement and streetwear" },
      { name: "Curly Taper", description: "Tapered sides with natural curls on top for a balanced look.", difficulty: "easy", maintenanceLevel: "medium", bestFor: "Professional and casual" },
      { name: "Medium Curly Flow", description: "Grown out curls at medium length for maximum texture.", difficulty: "easy", maintenanceLevel: "high", bestFor: "Creative and artistic settings" },
      { name: "Defined Twist Out", description: "Twisted curls create defined patterns with great volume.", difficulty: "medium", maintenanceLevel: "high", bestFor: "Special occasions and events" },
    ],
    coily: [
      { name: "High Fade with Coils", description: "Clean faded sides highlight your natural coil pattern on top.", difficulty: "easy", maintenanceLevel: "medium", bestFor: "Clean modern everyday look" },
      { name: "TWA (Teeny Weeny Afro)", description: "Short natural coils for a clean, confident look.", difficulty: "easy", maintenanceLevel: "low", bestFor: "Low maintenance lifestyle" },
      { name: "Flat Top", description: "Shaped flat top celebrates coily texture with a bold silhouette.", difficulty: "hard", maintenanceLevel: "high", bestFor: "Statement and retro style" },
      { name: "Coil Out", description: "Defined coils at medium length with proper moisture routine.", difficulty: "medium", maintenanceLevel: "high", bestFor: "Natural hair enthusiasts" },
      { name: "Taper with Line Up", description: "Sharp line up with tapered sides and coily top.", difficulty: "easy", maintenanceLevel: "medium", bestFor: "Clean professional look" },
    ],
  };

  // Face shape adjustments
  const faceShapeNotes: Record<string, string> = {
    oval: "Your oval face shape is versatile — most styles will complement you well.",
    round: "Styles with height on top and shorter sides will elongate your round face shape.",
    square: "Softer styles with some length work well to complement your strong jawline.",
    heart: "Styles with more volume at the jaw level will balance your heart-shaped face.",
    oblong: "Avoid too much height on top. Styles with side volume suit your face shape best.",
    diamond: "Fringes and chin-length styles balance the widest point at your cheekbones.",
  };

  // Color recommendations based on skin tone
  const colorMap: Record<string, ColorRec[]> = {
    fair: [
      { name: "Ash Brown", hex: "#8B7355", reason: "Cool-toned brown creates a soft contrast with fair skin without looking harsh." },
      { name: "Honey Blonde", hex: "#DEB887", reason: "Warm blonde tones add warmth to fair complexions beautifully." },
      { name: "Caramel Highlights", hex: "#C68E4E", reason: "Subtle caramel streaks add dimension and warmth." },
      { name: "Soft Black", hex: "#2C2C2C", reason: "A softer black creates a striking but not overwhelming contrast." },
    ],
    light: [
      { name: "Golden Brown", hex: "#996515", reason: "Warm golden tones complement light skin with warm undertones." },
      { name: "Copper", hex: "#B87333", reason: "Copper tones add richness and vibrancy to light complexions." },
      { name: "Chestnut", hex: "#954535", reason: "Rich chestnut creates a beautiful warm-toned contrast." },
      { name: "Dark Blonde", hex: "#B8860B", reason: "A natural dark blonde enhances light skin beautifully." },
    ],
    medium: [
      { name: "Dark Chocolate", hex: "#3B2F2F", reason: "Rich dark brown enhances medium skin tones with a natural look." },
      { name: "Burgundy", hex: "#800020", reason: "Deep burgundy adds dimension and complements warm medium tones." },
      { name: "Espresso", hex: "#4A2C2A", reason: "Espresso brown creates a polished, sophisticated look." },
      { name: "Auburn", hex: "#A52A2A", reason: "Warm auburn tones bring out the warmth in medium complexions." },
    ],
    olive: [
      { name: "Warm Brown", hex: "#795548", reason: "Warm brown tones harmonize beautifully with olive undertones." },
      { name: "Mahogany", hex: "#C04000", reason: "Rich mahogany brings out golden undertones in olive skin." },
      { name: "Toffee", hex: "#755139", reason: "Toffee tones add subtle warmth without overpowering olive skin." },
      { name: "Dark Auburn", hex: "#6E2C00", reason: "Deep auburn creates a rich, dimensional look on olive skin." },
    ],
    brown: [
      { name: "Jet Black", hex: "#1A1A1A", reason: "Classic black creates a polished and powerful look on brown skin." },
      { name: "Dark Burgundy", hex: "#4A0E0E", reason: "Subtle burgundy adds dimension without looking unnatural." },
      { name: "Blue Black", hex: "#1A1A2E", reason: "Blue-black tones add a beautiful sheen on brown complexions." },
      { name: "Copper Highlights", hex: "#B87333", reason: "Strategic copper highlights add warmth and dimension." },
    ],
    dark: [
      { name: "Rich Black", hex: "#0A0A0A", reason: "Deep black looks strikingly beautiful on dark skin." },
      { name: "Deep Burgundy", hex: "#3C0008", reason: "Subtle burgundy tones catch the light beautifully on dark skin." },
      { name: "Blue Black Sheen", hex: "#16162E", reason: "Creates an elegant reflective quality on dark complexions." },
      { name: "Dark Copper", hex: "#8B4513", reason: "Warm copper creates a striking, head-turning contrast." },
    ],
  };

  // Colors to avoid
  const avoidColorsMap: Record<string, string[]> = {
    fair: ["Very light blonde (washes out your complexion)", "Orange tones (can make fair skin look sallow)"],
    light: ["Jet black (too harsh of a contrast)", "Platinum blonde (can look washed out)"],
    medium: ["Very light blonde (unnatural contrast)", "Ashy grey (can make skin look dull)"],
    olive: ["Golden blonde (clashes with olive undertones)", "Ashy platinum (fights warm undertones)"],
    brown: ["Very light blonde (extreme unnatural contrast)", "Ashy light brown (can appear dull)"],
    dark: ["Light blonde (extreme contrast looks unnatural)", "Light ashy brown (doesn't complement dark skin)"],
  };

  // Styling tips by hair type
  const tipsMap: Record<string, string[]> = {
    straight: [
      "Use a lightweight texturizing spray to add volume and movement to straight hair",
      "Blow dry with a round brush to add body and direction",
      "Apply a matte clay or paste for a natural, textured finish",
      "Get trims every 4-6 weeks to maintain sharp lines and shape",
    ],
    wavy: [
      "Apply a sea salt spray on damp hair to enhance your natural wave pattern",
      "Scrunch your hair gently while air drying for defined waves",
      "Use a diffuser attachment when blow drying to avoid frizz",
      "A light hold cream will keep waves defined without crunchiness",
    ],
    curly: [
      "Always apply styling products to wet hair for best curl definition",
      "Use the 'plopping' technique with a microfiber towel to reduce frizz",
      "Deep condition weekly to keep curls hydrated and bouncy",
      "Never brush curly hair when dry — use a wide-tooth comb on wet hair only",
    ],
    coily: [
      "Moisture is your best friend — use leave-in conditioner daily",
      "The LOC method (Liquid, Oil, Cream) locks in hydration for coily hair",
      "Protective styles help retain length and reduce daily manipulation",
      "Use a satin pillowcase or bonnet to protect your hair while sleeping",
    ],
  };

  // Product recommendations
  const productsMap: Record<string, string[]> = {
    straight: ["Matte texture paste for hold without shine", "Volumizing spray for body and lift", "Lightweight pomade for sleek styles"],
    wavy: ["Sea salt spray for enhanced wave definition", "Anti-frizz cream for humidity protection", "Light-hold mousse for volume and shape"],
    curly: ["Curl-defining cream for shape and moisture", "Deep conditioning mask for weekly treatment", "Microfiber towel to reduce frizz while drying"],
    coily: ["Leave-in conditioner for daily moisture", "Natural oils (jojoba, argan) for sealing", "Edge control gel for polished line-ups"],
  };

  const styles = allStyles[hairType] || allStyles.straight;
  const colors = colorMap[skinTone] || colorMap.medium;
  const avoidColors = avoidColorsMap[skinTone] || avoidColorsMap.medium;
  const tips = tipsMap[hairType] || tipsMap.straight;
  const products = productsMap[hairType] || productsMap.straight;

  // Filter styles by face shape preference
  let recommended = [...styles];
  if (faceShape === "round") {
    recommended = recommended.filter(s => !s.name.includes("Buzz Cut"));
  } else if (faceShape === "oblong") {
    recommended = recommended.filter(s => !s.name.includes("Pompadour") && !s.name.includes("High Top"));
  }

  const avoidStyles: string[] = [];
  if (faceShape === "round") avoidStyles.push("Very short buzz cuts — they emphasize roundness. Go for styles with height on top.");
  else if (faceShape === "oblong") avoidStyles.push("Tall pompadours or high tops — they add more length to an already long face.");
  else avoidStyles.push("Styles that fight against your natural hair texture");

  if (hairType === "curly" || hairType === "coily") {
    avoidStyles.push("Tight slick-back styles — they strain your natural curl pattern and require excessive heat");
  } else {
    avoidStyles.push("Styles requiring texture you don't naturally have — embrace your hair type instead");
  }

  return {
    analysis: {
      skinToneAnalysis: `Your ${skinTone} skin tone has ${["fair", "light"].includes(skinTone) ? "cool to neutral" : "warm"} undertones. Colors that complement your tone will create a harmonious look.`,
      hairTypeAnalysis: `Your ${hairType} hair has ${hairType === "straight" ? "smooth texture ideal for sleek styles" : hairType === "wavy" ? "natural movement perfect for textured styles" : hairType === "curly" ? "beautiful natural volume and pattern" : "tight coils with incredible versatility when properly moisturized"}.`,
      faceShapeAnalysis: faceShapeNotes[faceShape] || faceShapeNotes.oval,
    },
    recommendedStyles: recommended.slice(0, 5),
    recommendedColors: colors,
    avoidStyles,
    avoidColors,
    stylingTips: tips,
    productRecommendations: products,
  };
}
