import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { seedDatabase } from "./seed";
import * as storage from "./storage";

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
        secure: true,
        sameSite: "none",
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
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const valid = await storage.verifyPassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
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

  app.get("/api/salons", async (_req: Request, res: Response) => {
    try {
      const allSalons = await storage.getAllSalons();
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
      const { salonId, salonName, salonImage, services, date, time, totalPrice, paymentMethod } = req.body;
      const booking = await storage.createBooking({
        userId, salonId, salonName, salonImage: salonImage || "",
        services: services || [], date, time, totalPrice, paymentMethod: paymentMethod || "",
      });

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
        } catch {}
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

  const httpServer = createServer(app);
  return httpServer;
}
