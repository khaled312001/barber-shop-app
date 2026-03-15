import { Express, Request, Response } from "express";
import { db } from "./db";
import {
  users, salons, bookings, reviews, coupons, appSettings, messages, services,
  salonStaff, plans, subscriptions, licenseKeys, licenseActivations, activityLogs, commissions, expenses, shifts,
  inventory, tips, customerNotes, loyaltyTransactions,
} from "@shared/schema";
import { eq, sql, and, desc, gte, lte } from "drizzle-orm";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { logActivity } from "./activityLogger";
import os from "os";

// ─── Auth middleware ──────────────────────────────────────────────────────────

/** Super Admin: role must be 'super_admin' or legacy 'admin' */
export async function requireSuperAdmin(req: Request, res: Response, next: Function) {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user || (user.role !== "super_admin" && user.role !== "admin")) {
    return res.status(403).json({ message: "Super admin access required" });
  }
  (req as any).currentUser = user;
  next();
}

/** Salon Admin: role must be 'salon_admin'. Attaches salonId via salon_staff table. */
export async function requireSalonAdmin(req: Request, res: Response, next: Function) {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user || user.role !== "salon_admin") {
    return res.status(403).json({ message: "Salon admin access required" });
  }
  const [link] = await db.select().from(salonStaff)
    .where(and(eq(salonStaff.userId, userId), eq(salonStaff.role, "salon_admin")));
  if (!link) return res.status(403).json({ message: "No salon linked to this admin" });
  (req as any).currentUser = user;
  (req as any).salonId = link.salonId;
  next();
}

/** Staff: role must be 'staff'. Attaches salonId via salon_staff table. */
export async function requireStaff(req: Request, res: Response, next: Function) {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user || user.role !== "staff") {
    return res.status(403).json({ message: "Staff access required" });
  }
  const [link] = await db.select().from(salonStaff)
    .where(and(eq(salonStaff.userId, userId), eq(salonStaff.role, "staff")));
  (req as any).currentUser = user;
  (req as any).salonId = link?.salonId || "";
  next();
}

// Keep legacy alias so existing code still compiles
export const requireAdmin = requireSuperAdmin;

// ─── Register all routes ──────────────────────────────────────────────────────

export function registerAdminRoutes(app: Express) {

  // ── Upload setup ────────────────────────────────────────────────────────────
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

  // ── Super Admin: Dashboard stats ────────────────────────────────────────────
  app.get("/api/admin/stats", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [salonsCount] = await db.select({ count: sql<number>`count(*)` }).from(salons);
      const [bookingsCount] = await db.select({ count: sql<number>`count(*)` }).from(bookings);
      const [revenue] = await db.select({ sum: sql<number>`coalesce(sum(${bookings.totalPrice}),0)` }).from(bookings);
      const [couponsCount] = await db.select({ count: sql<number>`count(*)` }).from(coupons);
      const [servicesCount] = await db.select({ count: sql<number>`count(*)` }).from(services);
      const [messagesCount] = await db.select({ count: sql<number>`count(*)` }).from(messages);
      const [pendingBookings] = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(eq(bookings.status, "pending"));
      const [completedBookings] = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(eq(bookings.status, "completed"));
      const [activeSubscriptions] = await db.select({ count: sql<number>`count(*)` }).from(subscriptions).where(eq(subscriptions.status, "active"));
      const [commissionTotal] = await db.select({ sum: sql<number>`coalesce(sum(${commissions.amount}),0)` }).from(commissions);

      res.json({
        totalUsers: usersCount.count,
        totalSalons: salonsCount.count,
        totalBookings: bookingsCount.count,
        totalRevenue: Number(revenue.sum) || 0,
        totalCoupons: couponsCount.count,
        totalServices: servicesCount.count,
        totalMessages: messagesCount.count,
        pendingBookings: pendingBookings.count,
        completedBookings: completedBookings.count,
        activeSubscriptions: activeSubscriptions.count,
        totalCommissions: Number(commissionTotal.sum) || 0,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ── System Health ───────────────────────────────────────────────────────────
  app.get("/api/admin/system-health", requireSuperAdmin, async (req: Request, res: Response) => {
    const start = Date.now();
    let dbStatus = "ok";
    let dbLatency = 0;
    try {
      const t0 = Date.now();
      await db.execute(sql`SELECT 1`);
      dbLatency = Date.now() - t0;
    } catch {
      dbStatus = "error";
    }
    res.json({
      status: "ok",
      uptime: Math.floor(process.uptime()),
      dbStatus,
      dbLatencyMs: dbLatency,
      memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    });
  });

  // ── Users CRUD ──────────────────────────────────────────────────────────────
  app.get("/api/admin/users", requireSuperAdmin, async (_req, res) => {
    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/admin/users", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { fullName, email, password, role } = req.body;
      const hashed = await bcrypt.hash(password || "password123", 10);
      const [user] = await db.insert(users).values({ fullName, email, password: hashed, role: role || "user" }).returning();
      await logActivity({ userId: (req as any).currentUser?.id, userRole: "super_admin", action: "user.created", entityType: "user", entityId: user.id });
      res.json(user);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.put("/api/admin/users/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { fullName, email, role } = req.body;
      const [user] = await db.update(users).set({ fullName, email, role }).where(eq(users.id, String(req.params.id))).returning();
      res.json(user);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/admin/users/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(users).where(eq(users.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ── Salons CRUD (Super Admin - sees all) ────────────────────────────────────
  app.get("/api/admin/salons", requireSuperAdmin, async (_req, res) => {
    try {
      const allSalons = await db.select().from(salons);
      const allStaff = await db.select().from(salonStaff);
      const allUsers = await db.select({ id: users.id, email: users.email, fullName: users.fullName }).from(users);
      const result = allSalons.map(s => {
        const ownerEntry = allStaff.find(st => st.salonId === s.id && st.role === "salon_admin")
          || (s.ownerId ? { userId: s.ownerId } : null);
        const owner = ownerEntry ? allUsers.find(u => u.id === ownerEntry.userId) : null;
        return { ...s, ownerEmail: owner?.email || '', ownerName: owner?.fullName || '' };
      });
      res.json(result);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/admin/salons", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [salon] = await db.insert(salons).values(req.body).returning();
      await logActivity({ userId: (req as any).currentUser?.id, userRole: "super_admin", action: "salon.created", entityType: "salon", entityId: salon.id, metadata: { name: salon.name } });
      res.json(salon);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.put("/api/admin/salons/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [salon] = await db.update(salons).set(req.body).where(eq(salons.id, String(req.params.id))).returning();
      if (req.body.status) {
        await logActivity({ userId: (req as any).currentUser?.id, userRole: "super_admin", action: `salon.${req.body.status}`, entityType: "salon", entityId: String(req.params.id) });
      }
      res.json(salon);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/admin/salons/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(salons).where(eq(salons.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ── Tenants (alias for salons with staff info) ──────────────────────────────
  app.get("/api/admin/tenants", requireSuperAdmin, async (_req, res) => {
    try {
      const allSalons = await db.select().from(salons);
      const allStaff = await db.select().from(salonStaff);
      const allSubs = await db.select().from(subscriptions);
      const tenants = allSalons.map(s => {
        const owner = allStaff.find(st => st.salonId === s.id && st.role === "salon_admin");
        const sub = allSubs.find(su => su.salonId === s.id && su.status === "active");
        return { ...s, ownerId: owner?.userId || "", hasActiveSubscription: !!sub, subscriptionStatus: sub?.status || "none" };
      });
      res.json(tenants);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ── Bookings CRUD ───────────────────────────────────────────────────────────
  app.get("/api/admin/bookings", requireSuperAdmin, async (_req, res) => {
    try {
      const all = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
      res.json(all);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/admin/bookings", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [booking] = await db.insert(bookings).values({ ...req.body, status: req.body.status || "upcoming" }).returning();
      res.json(booking);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.put("/api/admin/bookings/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [booking] = await db.update(bookings).set(req.body).where(eq(bookings.id, String(req.params.id))).returning();
      res.json(booking);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/admin/bookings/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(bookings).where(eq(bookings.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ── Coupons CRUD ────────────────────────────────────────────────────────────
  app.get("/api/admin/coupons", requireSuperAdmin, async (_req, res) => {
    try { res.json(await db.select().from(coupons)); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/admin/coupons", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [c] = await db.insert(coupons).values(req.body).returning();
      res.json(c);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.put("/api/admin/coupons/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [c] = await db.update(coupons).set(req.body).where(eq(coupons.id, String(req.params.id))).returning();
      res.json(c);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/admin/coupons/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(coupons).where(eq(coupons.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ── Payments ────────────────────────────────────────────────────────────────
  app.get("/api/admin/payments", requireSuperAdmin, async (_req, res) => {
    try {
      const payments = await db.select().from(bookings).where(sql`${bookings.paymentMethod} != ''`);
      res.json(payments);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ── Messages ────────────────────────────────────────────────────────────────
  app.get("/api/admin/messages", requireSuperAdmin, async (_req, res) => {
    try { res.json(await db.select().from(messages)); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/admin/messages/broadcast", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { targetUserId, content } = req.body;
      const adminIdentity = { salonId: "admin", salonName: "Barmagly Platform", salonImage: "" };
      if (targetUserId === "all") {
        const allUsers = await db.select().from(users);
        const msgs = await Promise.all(allUsers.map(u =>
          db.insert(messages).values({ userId: u.id, ...adminIdentity, content, sender: "salon" }).returning()
        ));
        res.json({ success: true, count: msgs.length });
      } else {
        const [msg] = await db.insert(messages).values({ userId: targetUserId, ...adminIdentity, content, sender: "salon" }).returning();
        res.json(msg);
      }
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/admin/messages/reply", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { userId, salonId, salonName, salonImage, content } = req.body;
      const [msg] = await db.insert(messages).values({ userId, salonId, salonName, salonImage, content, sender: "salon" }).returning();
      res.json(msg);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ── Settings ────────────────────────────────────────────────────────────────
  app.get("/api/admin/settings", requireSuperAdmin, async (_req, res) => {
    try { res.json(await db.select().from(appSettings)); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/admin/settings", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { key, value, description } = req.body;
      const existing = await db.select().from(appSettings).where(eq(appSettings.key, key));
      let setting;
      if (existing.length > 0) {
        [setting] = await db.update(appSettings).set({ value, description, updatedAt: new Date() }).where(eq(appSettings.key, key)).returning();
      } else {
        [setting] = await db.insert(appSettings).values({ key, value, description }).returning();
      }
      res.json(setting);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ── Services CRUD ───────────────────────────────────────────────────────────
  app.get("/api/admin/services", requireSuperAdmin, async (_req, res) => {
    try { res.json(await db.select().from(services)); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/admin/services", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [s] = await db.insert(services).values(req.body).returning();
      res.json(s);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.put("/api/admin/services/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [s] = await db.update(services).set(req.body).where(eq(services.id, String(req.params.id))).returning();
      res.json(s);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/admin/services/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(services).where(eq(services.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ── Upload ──────────────────────────────────────────────────────────────────
  app.post("/api/admin/upload", requireSuperAdmin, upload.single("image"), (req: any, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No image file provided" });
      res.json({ url: `/uploads/${req.file.filename}` });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Plans CRUD
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/api/admin/plans", requireSuperAdmin, async (_req, res) => {
    try { res.json(await db.select().from(plans)); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/admin/plans", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [plan] = await db.insert(plans).values(req.body).returning();
      res.json(plan);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.put("/api/admin/plans/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [plan] = await db.update(plans).set(req.body).where(eq(plans.id, String(req.params.id))).returning();
      res.json(plan);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/admin/plans/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(plans).where(eq(plans.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Subscriptions CRUD
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/api/admin/subscriptions", requireSuperAdmin, async (_req, res) => {
    try { res.json(await db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt))); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/admin/subscriptions", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [sub] = await db.insert(subscriptions).values(req.body).returning();
      await logActivity({ userId: (req as any).currentUser?.id, userRole: "super_admin", action: "subscription.created", entityType: "subscription", entityId: sub.id, metadata: { salonId: sub.salonId, planId: sub.planId } });
      res.json(sub);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.put("/api/admin/subscriptions/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [sub] = await db.update(subscriptions).set({ ...req.body, updatedAt: new Date() }).where(eq(subscriptions.id, String(req.params.id))).returning();
      await logActivity({ userId: (req as any).currentUser?.id, userRole: "super_admin", action: "subscription.updated", entityType: "subscription", entityId: String(req.params.id) });
      res.json(sub);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/admin/subscriptions/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(subscriptions).where(eq(subscriptions.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // License Keys CRUD
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/api/admin/license-keys", requireSuperAdmin, async (_req, res) => {
    try { res.json(await db.select().from(licenseKeys).orderBy(desc(licenseKeys.createdAt))); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/admin/license-keys", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const key = req.body.key || `BRMG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const [lk] = await db.insert(licenseKeys).values({ ...req.body, key }).returning();
      res.json(lk);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.put("/api/admin/license-keys/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [lk] = await db.update(licenseKeys).set(req.body).where(eq(licenseKeys.id, String(req.params.id))).returning();
      res.json(lk);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/admin/license-keys/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(licenseKeys).where(eq(licenseKeys.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Activity Logs
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/api/admin/activity-logs", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
      res.json(logs);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Commissions (super admin view)
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/api/admin/commissions", requireSuperAdmin, async (_req, res) => {
    try { res.json(await db.select().from(commissions).orderBy(desc(commissions.createdAt))); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.put("/api/admin/commissions/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [c] = await db.update(commissions).set(req.body).where(eq(commissions.id, String(req.params.id))).returning();
      res.json(c);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Expenses (super admin sees all; salon admin sees own)
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/api/admin/expenses", requireSuperAdmin, async (_req, res) => {
    try { res.json(await db.select().from(expenses).orderBy(desc(expenses.createdAt))); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Shifts (super admin sees all)
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/api/admin/shifts", requireSuperAdmin, async (_req, res) => {
    try { res.json(await db.select().from(shifts)); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Salon Staff management (super admin)
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/api/admin/salon-staff", requireSuperAdmin, async (_req, res) => {
    try { res.json(await db.select().from(salonStaff)); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/admin/salon-staff", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const [link] = await db.insert(salonStaff).values(req.body).returning();
      res.json(link);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/admin/salon-staff/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(salonStaff).where(eq(salonStaff.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Backup endpoint (triggers a pg_dump via env DATABASE_URL)
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/api/admin/backup", requireSuperAdmin, async (_req, res) => {
    res.json({ message: "Backup endpoint ready. Configure pg_dump with DATABASE_URL for production backups.", databaseUrl: !!process.env.DATABASE_URL });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // SALON ADMIN ROUTES  (/api/salon/*)
  // ════════════════════════════════════════════════════════════════════════════

  // Current salon info
  app.get("/api/salon/me", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const [salon] = await db.select().from(salons).where(eq(salons.id, salonId));
      res.json(salon);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.put("/api/salon/me", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const [salon] = await db.update(salons).set(req.body).where(eq(salons.id, salonId)).returning();
      res.json(salon);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // Salon subscription
  app.get("/api/salon/subscription", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const [sub] = await db.select().from(subscriptions).where(and(eq(subscriptions.salonId, salonId), eq(subscriptions.status, "active")));
      if (!sub) return res.json(null);
      const [plan] = await db.select().from(plans).where(eq(plans.id, sub.planId));
      res.json({ ...sub, plan });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // Salon stats
  app.get("/api/salon/stats", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const today = new Date().toISOString().split("T")[0];
      const [todayBookings] = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(and(eq(bookings.salonId, salonId), eq(bookings.date, today)));
      const [totalBookings] = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(eq(bookings.salonId, salonId));
      const [revenue] = await db.select({ sum: sql<number>`coalesce(sum(${bookings.totalPrice}),0)` }).from(bookings).where(and(eq(bookings.salonId, salonId), eq(bookings.status, "completed")));
      const [staffCount] = await db.select({ count: sql<number>`count(*)` }).from(salonStaff).where(eq(salonStaff.salonId, salonId));
      const [pendingCount] = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(and(eq(bookings.salonId, salonId), eq(bookings.status, "upcoming")));
      res.json({
        todayBookings: todayBookings.count,
        totalBookings: totalBookings.count,
        totalRevenue: Number(revenue.sum) || 0,
        staffCount: staffCount.count,
        pendingBookings: pendingCount.count,
      });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // Salon bookings
  app.get("/api/salon/bookings", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const all = await db.select().from(bookings).where(eq(bookings.salonId, salonId)).orderBy(desc(bookings.createdAt));
      res.json(all);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.put("/api/salon/bookings/:id", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const [booking] = await db.update(bookings).set(req.body).where(and(eq(bookings.id, String(req.params.id)), eq(bookings.salonId, salonId))).returning();
      // Auto-create commission on completion
      if (req.body.status === "completed" && booking) {
        const sub = await db.select().from(subscriptions).where(and(eq(subscriptions.salonId, salonId), eq(subscriptions.status, "active")));
        const planId = sub[0]?.planId;
        let rate = 5;
        if (planId) {
          const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
          if (plan) rate = plan.commissionRate ?? 5;
        }
        await db.insert(commissions).values({ bookingId: booking.id, salonId, amount: booking.totalPrice * (rate / 100), rate }).returning();
      }
      res.json(booking);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // Salon services
  app.get("/api/salon/services", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      res.json(await db.select().from(services).where(eq(services.salonId, salonId)));
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/salon/services", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const [s] = await db.insert(services).values({ ...req.body, salonId }).returning();
      res.json(s);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.put("/api/salon/services/:id", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const [s] = await db.update(services).set(req.body).where(and(eq(services.id, String(req.params.id)), eq(services.salonId, salonId))).returning();
      res.json(s);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/salon/services/:id", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      await db.delete(services).where(and(eq(services.id, String(req.params.id)), eq(services.salonId, salonId)));
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // Salon staff management
  app.get("/api/salon/staff", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const links = await db.select().from(salonStaff).where(eq(salonStaff.salonId, salonId));
      const staffUsers = await Promise.all(links.map(async l => {
        const [u] = await db.select({ id: users.id, fullName: users.fullName, email: users.email, phone: users.phone, avatar: users.avatar, role: users.role }).from(users).where(eq(users.id, l.userId));
        return { ...u, linkId: l.id, staffRole: l.role };
      }));
      res.json(staffUsers.filter(Boolean));
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/salon/staff", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const { fullName, email, password, staffRole = "staff" } = req.body;
      const hashed = await bcrypt.hash(password || "password123", 10);
      const [newUser] = await db.insert(users).values({ fullName, email, password: hashed, role: staffRole === "salon_admin" ? "salon_admin" : "staff" }).returning();
      const [link] = await db.insert(salonStaff).values({ userId: newUser.id, salonId, role: staffRole }).returning();
      res.json({ ...newUser, linkId: link.id, staffRole: link.role });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/salon/staff/:linkId", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      await db.delete(salonStaff).where(and(eq(salonStaff.id, String(req.params.linkId)), eq(salonStaff.salonId, salonId)));
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // Salon customers (unique users from bookings)
  app.get("/api/salon/customers", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const rows = await db.select({
        userId: bookings.userId,
        count: sql<number>`count(*)`,
        lastVisit: sql<string>`max(${bookings.date})`,
        totalSpent: sql<number>`sum(${bookings.totalPrice})`,
      }).from(bookings).where(eq(bookings.salonId, salonId)).groupBy(bookings.userId);
      const customers = await Promise.all(rows.map(async r => {
        const [u] = await db.select({ id: users.id, fullName: users.fullName, email: users.email, phone: users.phone, avatar: users.avatar, loyaltyPoints: users.loyaltyPoints }).from(users).where(eq(users.id, r.userId));
        return u ? { ...u, bookingCount: r.count, lastVisit: r.lastVisit, totalSpent: r.totalSpent } : null;
      }));
      res.json(customers.filter(Boolean));
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // Salon expenses
  app.get("/api/salon/expenses", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      res.json(await db.select().from(expenses).where(eq(expenses.salonId, salonId)).orderBy(desc(expenses.createdAt)));
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/salon/expenses", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const [e] = await db.insert(expenses).values({ ...req.body, salonId }).returning();
      res.json(e);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.put("/api/salon/expenses/:id", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const [e] = await db.update(expenses).set(req.body).where(and(eq(expenses.id, String(req.params.id)), eq(expenses.salonId, salonId))).returning();
      res.json(e);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/salon/expenses/:id", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      await db.delete(expenses).where(and(eq(expenses.id, String(req.params.id)), eq(expenses.salonId, salonId)));
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // Salon shifts
  app.get("/api/salon/shifts", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      res.json(await db.select().from(shifts).where(eq(shifts.salonId, salonId)));
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/salon/shifts", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const [s] = await db.insert(shifts).values({ ...req.body, salonId }).returning();
      res.json(s);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.put("/api/salon/shifts/:id", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const [s] = await db.update(shifts).set(req.body).where(and(eq(shifts.id, String(req.params.id)), eq(shifts.salonId, salonId))).returning();
      res.json(s);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/salon/shifts/:id", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      await db.delete(shifts).where(and(eq(shifts.id, String(req.params.id)), eq(shifts.salonId, salonId)));
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // Salon upload
  app.post("/api/salon/upload", requireSalonAdmin, upload.single("image"), (req: any, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No image file provided" });
      res.json({ url: `/uploads/${req.file.filename}` });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // STAFF ROUTES  (/api/staff/*)
  // ════════════════════════════════════════════════════════════════════════════

  // Staff: my schedule (bookings for my salonId where specialistId = my userId)
  app.get("/api/staff/schedule", requireStaff, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any)?.userId;
      const salonId = (req as any).salonId;
      const all = await db.select().from(bookings).where(
        salonId
          ? and(eq(bookings.salonId, salonId), eq(bookings.specialistId, userId))
          : eq(bookings.specialistId, userId)
      ).orderBy(desc(bookings.date));
      res.json(all);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // Staff: update booking status (complete / no-show)
  app.put("/api/staff/bookings/:id", requireStaff, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any)?.userId;
      const allowed = ["completed", "no-show"];
      if (!allowed.includes(req.body.status)) {
        return res.status(400).json({ message: "Staff can only mark bookings as completed or no-show" });
      }
      const [booking] = await db.update(bookings).set({ status: req.body.status }).where(and(eq(bookings.id, String(req.params.id)), eq(bookings.specialistId, userId))).returning();
      res.json(booking);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // Staff: my bookings
  app.get("/api/staff/bookings", requireStaff, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any)?.userId;
      const salonId = (req as any).salonId;
      const all = await db.select().from(bookings).where(
        salonId
          ? and(eq(bookings.salonId, salonId), eq(bookings.specialistId, userId))
          : eq(bookings.specialistId, userId)
      ).orderBy(desc(bookings.date));
      res.json(all);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // Staff: update own profile
  app.put("/api/staff/profile", requireStaff, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any)?.userId;
      const { name, email, phone } = req.body;
      const [user] = await db.update(users).set({ fullName: name, email, phone }).where(eq(users.id, userId)).returning();
      res.json(user);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // Staff: my shifts
  app.get("/api/staff/shifts", requireStaff, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any)?.userId;
      const salonId = (req as any).salonId;
      res.json(await db.select().from(shifts).where(and(eq(shifts.staffId, userId), eq(shifts.salonId, salonId))));
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // Staff: earnings breakdown
  app.get("/api/staff/earnings", requireStaff, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any)?.userId;
      const salonId = (req as any).salonId;
      const period = (req.query.period as string) || 'month';
      const now = new Date();
      let start: Date;
      if (period === 'day') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (period === 'week') {
        start = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      const myBookings = await db.select().from(bookings).where(
        and(
          eq(bookings.specialistId, userId),
          eq(bookings.status, 'completed'),
          gte(bookings.createdAt, start)
        )
      );
      const myTips = await db.select().from(tips).where(
        and(eq(tips.staffId, userId), gte(tips.createdAt, start))
      );
      const totalEarnings = myBookings.reduce((s: number, b: any) => s + (b.totalPrice || 0), 0);
      const totalTips = myTips.reduce((s: number, t: any) => s + (t.amount || 0), 0);
      const tipMap: Record<string, number> = {};
      myTips.forEach((t: any) => { tipMap[t.bookingId] = (tipMap[t.bookingId] || 0) + t.amount; });
      const recentBookings = myBookings.slice(0, 20).map((b: any) => ({
        ...b, tip: tipMap[b.id] || 0,
      }));
      res.json({
        totalEarnings,
        totalTips,
        completedBookings: myBookings.length,
        avgPerBooking: myBookings.length > 0 ? totalEarnings / myBookings.length : 0,
        recentBookings,
      });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Verify License (public)
  // ════════════════════════════════════════════════════════════════════════════
  app.post("/api/auth/verify-license", async (req: Request, res: Response) => {
    try {
      const { email, licenseKey, deviceId } = req.body;
      if (!email || !licenseKey) return res.status(400).json({ message: "Email and license key are required" });

      const [lk] = await db.select().from(licenseKeys).where(eq(licenseKeys.key, licenseKey.toUpperCase()));
      if (!lk) return res.status(404).json({ message: "Invalid license key" });
      if (lk.status === 'revoked') return res.status(403).json({ message: "License key has been revoked" });
      if (lk.status === 'suspended') return res.status(403).json({ message: "License key is suspended" });
      if (lk.expiresAt && new Date(lk.expiresAt) < new Date()) {
        return res.status(403).json({ message: "License key has expired" });
      }

      // Device activation tracking
      const effectiveDeviceId = deviceId || `web-${email}`;
      const existingActivations = await db.select().from(licenseActivations).where(eq(licenseActivations.licenseKeyId, lk.id));
      const alreadyActivated = existingActivations.some(a => a.deviceId === effectiveDeviceId);

      if (!alreadyActivated) {
        // Check activation limit
        const maxAct = lk.maxActivations ?? 0;
        const currentCount = lk.activationCount ?? 0;
        if (maxAct > 0 && currentCount >= maxAct) {
          return res.status(403).json({ message: `Activation limit reached (${maxAct}/${maxAct} devices)` });
        }
        // Register this new device
        await db.insert(licenseActivations).values({ licenseKeyId: lk.id, deviceId: effectiveDeviceId, email });
        await db.update(licenseKeys).set({
          activationCount: currentCount + 1,
          status: 'active',
        }).where(eq(licenseKeys.id, lk.id));
      }

      let salonName = '';
      if (lk.salonId) {
        const [salon] = await db.select().from(salons).where(eq(salons.id, lk.salonId));
        if (salon) salonName = salon.name;
      }

      const updatedCount = alreadyActivated ? (lk.activationCount ?? 0) : (lk.activationCount ?? 0) + 1;
      res.json({
        valid: true, salonId: lk.salonId, salonName, planId: lk.planId, status: 'active',
        activationCount: updatedCount, maxActivations: lk.maxActivations ?? 0,
      });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Super Admin: Store Analytics
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/api/admin/store-analytics", requireSuperAdmin, async (_req: Request, res: Response) => {
    try {
      const allSalons = await db.select().from(salons);
      const allBookings = await db.select().from(bookings);
      const totalRevenue = allBookings.reduce((s: number, b: any) => s + (b.totalPrice || 0), 0);
      const avgRating = allSalons.length > 0
        ? allSalons.reduce((s: number, s2: any) => s + (s2.rating || 0), 0) / allSalons.length
        : 0;
      // Revenue by month (last 6 months)
      const months: Record<string, number> = {};
      const bookingsPerMonth: Record<string, number> = {};
      allBookings.forEach((b: any) => {
        if (b.createdAt) {
          const d = new Date(b.createdAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          months[key] = (months[key] || 0) + (b.totalPrice || 0);
          bookingsPerMonth[key] = (bookingsPerMonth[key] || 0) + 1;
        }
      });
      const sortedKeys = Object.keys(months).sort().slice(-6);
      const revenueByMonth = sortedKeys.map(k => ({ month: k, revenue: months[k] }));
      const bookingsByMonth = sortedKeys.map(k => ({ month: k, bookings: bookingsPerMonth[k] || 0 }));
      // Top salons by booking count
      const salonBookings: Record<string, { count: number; revenue: number }> = {};
      allBookings.forEach((b: any) => {
        if (!salonBookings[b.salonId]) salonBookings[b.salonId] = { count: 0, revenue: 0 };
        salonBookings[b.salonId].count++;
        salonBookings[b.salonId].revenue += b.totalPrice || 0;
      });
      const topSalons = allSalons.map((s: any) => ({
        ...s,
        bookingCount: salonBookings[s.id]?.count || 0,
        revenue: salonBookings[s.id]?.revenue || 0,
      })).sort((a: any, b: any) => b.bookingCount - a.bookingCount).slice(0, 10);
      res.json({ totalSalons: allSalons.length, totalBookings: allBookings.length, totalRevenue, avgRating, revenueByMonth, bookingsByMonth, topSalons });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Salon Analytics
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/api/salon/analytics", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const period = (req.query.period as string) || 'month';
      const now = new Date();
      let start: Date;
      if (period === 'week') start = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      else if (period === 'year') start = new Date(now.getFullYear(), 0, 1);
      else start = new Date(now.getFullYear(), now.getMonth(), 1);
      const myBookings = await db.select().from(bookings).where(
        and(eq(bookings.salonId, salonId), gte(bookings.createdAt, start))
      );
      const prevStart = new Date(start.getTime() - (now.getTime() - start.getTime()));
      const prevBookings = await db.select().from(bookings).where(
        and(eq(bookings.salonId, salonId), gte(bookings.createdAt, prevStart), lte(bookings.createdAt, start))
      );
      const totalRevenue = myBookings.reduce((s: number, b: any) => s + (b.totalPrice || 0), 0);
      const avgBookingValue = myBookings.length > 0 ? totalRevenue / myBookings.length : 0;
      // Group by period label
      const grouped: Record<string, { count: number; revenue: number }> = {};
      myBookings.forEach((b: any) => {
        if (!b.date) return;
        let key = b.date;
        if (period === 'year') key = b.date.slice(0, 7);
        else if (period === 'month') key = b.date.slice(5);
        else key = b.date;
        if (!grouped[key]) grouped[key] = { count: 0, revenue: 0 };
        grouped[key].count++;
        grouped[key].revenue += b.totalPrice || 0;
      });
      const bookingsByPeriod = Object.entries(grouped).sort().map(([label, v]) => ({ label, ...v }));
      // Top services
      const serviceCount: Record<string, number> = {};
      myBookings.forEach((b: any) => {
        (b.services || []).forEach((svc: string) => {
          serviceCount[svc] = (serviceCount[svc] || 0) + 1;
        });
      });
      const topServices = Object.entries(serviceCount).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, count]) => ({ name, count }));
      // New customers this period
      const customerIds = new Set(myBookings.map((b: any) => b.userId));
      const prevIds = new Set(prevBookings.map((b: any) => b.userId));
      const newCustomers = [...customerIds].filter(id => !prevIds.has(id)).length;
      res.json({ totalBookings: myBookings.length, totalRevenue, avgBookingValue, newCustomers, bookingsByPeriod, topServices });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Customer Notes (Salon Admin)
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/api/salon/customers/:customerId/notes", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const notes = await db.select().from(customerNotes).where(
        and(eq(customerNotes.salonId, salonId), eq(customerNotes.customerId, String(req.params.customerId)))
      ).orderBy(desc(customerNotes.createdAt));
      res.json(notes);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/salon/customers/:customerId/notes", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const [note] = await db.insert(customerNotes).values({
        salonId, customerId: String(req.params.customerId), note: req.body.note
      }).returning();
      res.json(note);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Inventory (Salon Admin)
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/api/salon/inventory", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      res.json(await db.select().from(inventory).where(eq(inventory.salonId, salonId)).orderBy(desc(inventory.createdAt)));
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/salon/inventory", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const [item] = await db.insert(inventory).values({ ...req.body, salonId }).returning();
      res.json(item);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.put("/api/salon/inventory/:id", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const [item] = await db.update(inventory).set(req.body).where(eq(inventory.id, String(req.params.id))).returning();
      res.json(item);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/salon/inventory/:id", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(inventory).where(eq(inventory.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Tips (Salon Admin adds tip per booking)
  // ════════════════════════════════════════════════════════════════════════════
  app.post("/api/salon/tips", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      const [tip] = await db.insert(tips).values({ ...req.body, salonId }).returning();
      res.json(tip);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.get("/api/salon/tips", requireSalonAdmin, async (req: Request, res: Response) => {
    try {
      const salonId = (req as any).salonId;
      res.json(await db.select().from(tips).where(eq(tips.salonId, salonId)).orderBy(desc(tips.createdAt)));
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Loyalty (Customer App)
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/api/loyalty/my-transactions", async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const txns = await db.select().from(loyaltyTransactions).where(eq(loyaltyTransactions.userId, userId)).orderBy(desc(loyaltyTransactions.createdAt));
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      res.json({ points: user?.loyaltyPoints ?? 0, transactions: txns });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/loyalty/redeem", async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const { points } = req.body;
      if (!points || points <= 0) return res.status(400).json({ message: "Invalid points amount" });
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user || (user.loyaltyPoints ?? 0) < points) {
        return res.status(400).json({ message: "Insufficient loyalty points" });
      }
      await db.update(users).set({ loyaltyPoints: (user.loyaltyPoints ?? 0) - points }).where(eq(users.id, userId));
      await db.insert(loyaltyTransactions).values({
        userId, points: -points, type: 'redeemed', description: `Redeemed ${points} points`
      });
      res.json({ success: true, remainingPoints: (user.loyaltyPoints ?? 0) - points });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Landing Pages (Super Admin)
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/api/admin/landing-pages", async (req: Request, res: Response) => {
    try {
      const role = (req.session as any)?.role;
      if (role !== "super_admin" && role !== "admin") return res.status(403).json({ message: "Forbidden" });
      const rows = await db.select().from(salons).orderBy(salons.name);
      res.json(rows);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.put("/api/admin/landing-pages/:salonId", async (req: Request, res: Response) => {
    try {
      const role = (req.session as any)?.role;
      if (role !== "super_admin" && role !== "admin") return res.status(403).json({ message: "Forbidden" });
      const salonId = String(req.params.salonId);
      const { landingEnabled, landingSlug, landingTheme, landingAccentColor, landingBookingUrl } = req.body;

      if (landingSlug !== undefined) {
        const slug = String(landingSlug).trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        const [existing] = await db.select().from(salons).where(and(eq(salons.landingSlug, slug), sql`id != ${salonId}`));
        if (existing) return res.status(400).json({ message: "This slug is already in use by another salon." });
        const updates: any = { landingSlug: slug };
        if (landingEnabled !== undefined) updates.landingEnabled = landingEnabled;
        if (landingTheme !== undefined) updates.landingTheme = landingTheme;
        if (landingAccentColor !== undefined) updates.landingAccentColor = landingAccentColor;
        if (landingBookingUrl !== undefined) updates.landingBookingUrl = landingBookingUrl;
        await db.update(salons).set(updates).where(eq(salons.id, salonId));
      } else {
        const updates: any = {};
        if (landingEnabled !== undefined) updates.landingEnabled = landingEnabled;
        if (landingTheme !== undefined) updates.landingTheme = landingTheme;
        if (landingAccentColor !== undefined) updates.landingAccentColor = landingAccentColor;
        if (landingBookingUrl !== undefined) updates.landingBookingUrl = landingBookingUrl;
        if (Object.keys(updates).length) await db.update(salons).set(updates).where(eq(salons.id, salonId));
      }

      const [updated] = await db.select().from(salons).where(eq(salons.id, salonId));
      res.json(updated);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  app.post("/api/admin/landing-pages/:salonId/reset-views", async (req: Request, res: Response) => {
    try {
      const role = (req.session as any)?.role;
      if (role !== "super_admin" && role !== "admin") return res.status(403).json({ message: "Forbidden" });
      await db.update(salons).set({ landingViews: 0 }).where(eq(salons.id, String(req.params.salonId)));
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Public Salon Landing Page
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/salon/:slug", async (req: Request, res: Response) => {
    try {
      const slug = String(req.params.slug).toLowerCase();
      const [salon] = await db.select().from(salons).where(and(eq(salons.landingSlug, slug), eq(salons.landingEnabled, true)));
      if (!salon) {
        return res.status(404).send(`<!DOCTYPE html><html><head><title>Not Found</title><style>body{background:#181A20;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column}</style></head><body><h1 style="font-size:3rem">404</h1><p>Salon page not found or not yet published.</p></body></html>`);
      }
      await db.update(salons).set({ landingViews: (salon.landingViews ?? 0) + 1 }).where(eq(salons.id, salon.id));

      const isDark = (salon.landingTheme || "dark") === "dark";
      const accent = salon.landingAccentColor || "#F4A460";
      const bg = isDark ? "#181A20" : "#f5f5f5";
      const card = isDark ? "#1F222A" : "#ffffff";
      const border = isDark ? "#35383F" : "#e0e0e0";
      const text = isDark ? "#ffffff" : "#111111";
      const textSub = isDark ? "#9a9a9a" : "#555555";
      const gallery: string[] = Array.isArray(salon.gallery) ? salon.gallery : [];
      const rating = Number(salon.rating || 0).toFixed(1);
      const stars = "★".repeat(Math.round(Number(salon.rating || 0))) + "☆".repeat(5 - Math.round(Number(salon.rating || 0)));
      const bookingUrl = salon.landingBookingUrl || "";
      const galleryHtml = gallery.slice(0, 6).map(src => `<img src="${src}" alt="Gallery" style="width:100%;height:180px;object-fit:cover;border-radius:12px;border:1px solid ${border}">`).join("");

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${salon.name} — Powered by Barmagly</title>
  <meta name="description" content="${(salon.about || "").replace(/"/g, "&quot;")}">
  <meta property="og:title" content="${salon.name}">
  <meta property="og:image" content="${salon.image}">
  <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:${bg};color:${text};font-family:'Urbanist',sans-serif;min-height:100vh}
    .hero{position:relative;height:320px;overflow:hidden}
    .hero img{width:100%;height:100%;object-fit:cover}
    .hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.7))}
    .hero-badge{position:absolute;top:20px;right:20px;background:${accent};color:#000;font-size:12px;font-weight:700;padding:6px 14px;border-radius:999px}
    .container{max-width:760px;margin:0 auto;padding:0 20px 60px}
    .card{background:${card};border:1px solid ${border};border-radius:20px;padding:24px;margin-top:20px}
    .salon-name{font-size:28px;font-weight:800;margin-bottom:4px}
    .rating-row{display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap}
    .stars{color:${accent};font-size:18px;letter-spacing:1px}
    .rating-num{font-weight:700;font-size:16px}
    .review-count{color:${textSub};font-size:14px}
    .open-badge{background:${salon.isOpen ? "#22c55e" : "#ef4444"};color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px}
    .info-row{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid ${border};font-size:15px;color:${text}}
    .info-row:last-child{border-bottom:none}
    .info-icon{font-size:18px;width:24px;flex-shrink:0;margin-top:1px}
    .info-label{color:${textSub};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;margin-bottom:2px}
    .section-title{font-size:18px;font-weight:700;margin-bottom:16px}
    .about-text{color:${textSub};line-height:1.7;font-size:15px}
    .gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
    .book-btn{display:block;width:100%;background:${accent};color:#000;font-family:'Urbanist',sans-serif;font-size:17px;font-weight:800;padding:17px;border-radius:14px;border:none;cursor:pointer;text-align:center;text-decoration:none;margin-top:20px;letter-spacing:.3px;transition:opacity .2s}
    .book-btn:hover{opacity:.88}
    .powered{text-align:center;color:${textSub};font-size:13px;margin-top:28px}
    .powered span{color:${accent};font-weight:700}
    @media(max-width:480px){.hero{height:220px}.salon-name{font-size:22px}}
  </style>
</head>
<body>
  <div class="hero">
    <img src="${salon.image}" alt="${salon.name}">
    <div class="hero-overlay"></div>
    <div class="hero-badge">${salon.isOpen ? "Open Now" : "Closed"}</div>
  </div>

  <div class="container">
    <div class="card">
      <h1 class="salon-name">${salon.name}</h1>
      <div class="rating-row">
        <span class="stars">${stars}</span>
        <span class="rating-num">${rating}</span>
        <span class="review-count">(${salon.reviewCount ?? 0} reviews)</span>
        <span class="open-badge">${salon.isOpen ? "● Open" : "● Closed"}</span>
      </div>

      ${salon.address ? `<div class="info-row"><span class="info-icon">📍</span><div><div class="info-label">Address</div>${salon.address}</div></div>` : ""}
      ${salon.phone ? `<div class="info-row"><span class="info-icon">📞</span><div><div class="info-label">Phone</div><a href="tel:${salon.phone}" style="color:${text};text-decoration:none">${salon.phone}</a></div></div>` : ""}
      ${salon.openHours ? `<div class="info-row"><span class="info-icon">🕐</span><div><div class="info-label">Hours</div>${salon.openHours}</div></div>` : ""}
      ${salon.website ? `<div class="info-row"><span class="info-icon">🌐</span><div><div class="info-label">Website</div><a href="${salon.website}" target="_blank" style="color:${accent};text-decoration:none">${salon.website}</a></div></div>` : ""}
    </div>

    ${salon.about ? `<div class="card"><p class="section-title">About</p><p class="about-text">${salon.about}</p></div>` : ""}

    ${gallery.length > 0 ? `<div class="card"><p class="section-title">Gallery</p><div class="gallery-grid">${galleryHtml}</div></div>` : ""}

    ${bookingUrl ? `<a class="book-btn" href="${bookingUrl}" target="_blank">Book Appointment</a>` : ""}

    <p class="powered">Powered by <span>Barmagly</span></p>
  </div>
</body>
</html>`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });
}
