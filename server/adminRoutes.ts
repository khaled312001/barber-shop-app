import { Express, Request, Response } from "express";
import { db } from "./db";
import { users, salons, bookings, reviews, coupons, appSettings, messages, services } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";

export function registerAdminRoutes(app: Express) {
    // Middleware to ensure user is admin
    async function requireAdmin(req: Request, res: Response, next: Function) {
        const userId = (req.session as any)?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized as admin" });
        }
        next();
    }

    app.post("/api/admin/messages/broadcast", requireAdmin, async (req: Request, res: Response) => {
        try {
            const { targetUserId, content } = req.body;
            const adminIdentity = {
                salonId: "admin",
                salonName: "System Admin",
                salonImage: "",
            };

            if (targetUserId === "all") {
                const allUsers = await db.select().from(users);
                const msgs = await Promise.all(allUsers.map(user =>
                    db.insert(messages).values({
                        userId: user.id,
                        ...adminIdentity,
                        content,
                        sender: "salon"
                    }).returning()
                ));
                res.json({ success: true, count: msgs.length });
            } else {
                const [msg] = await db.insert(messages).values({
                    userId: targetUserId,
                    ...adminIdentity,
                    content,
                    sender: "salon"
                }).returning();
                res.json(msg);
            }
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    // Dashboard Stats
    app.get("/api/admin/stats", requireAdmin, async (req: Request, res: Response) => {
        try {
            const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
            const [salonsCount] = await db.select({ count: sql<number>`count(*)` }).from(salons);
            const [bookingsCount] = await db.select({ count: sql<number>`count(*)` }).from(bookings);
            const [revenue] = await db.select({ sum: sql<number>`sum(${bookings.totalPrice})` }).from(bookings);
            const [couponsCount] = await db.select({ count: sql<number>`count(*)` }).from(coupons);
            const [servicesCount] = await db.select({ count: sql<number>`count(*)` }).from(services);
            const [messagesCount] = await db.select({ count: sql<number>`count(*)` }).from(messages);
            const [pendingBookings] = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(eq(bookings.status, 'pending'));
            const [completedBookings] = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(eq(bookings.status, 'completed'));

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
            });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    // Users CRUD
    app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
        try {
            const allUsers = await db.select().from(users);
            res.json(allUsers);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.post("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
        try {
            const { fullName, email, password, role } = req.body;
            const hashed = await bcrypt.hash(password || "password123", 10);
            const [user] = await db.insert(users).values({ fullName, email, password: hashed, role: role || "user" }).returning();
            res.json(user);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.put("/api/admin/users/:id", requireAdmin, async (req: Request, res: Response) => {
        try {
            const { fullName, email, role } = req.body;
            const [user] = await db.update(users).set({ fullName, email, role }).where(eq(users.id, req.params.id as string)).returning();
            res.json(user);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.delete("/api/admin/users/:id", requireAdmin, async (req: Request, res: Response) => {
        try {
            await db.delete(users).where(eq(users.id, req.params.id as string));
            res.json({ success: true });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    // Salons CRUD
    app.get("/api/admin/salons", requireAdmin, async (req: Request, res: Response) => {
        try {
            const allSalons = await db.select().from(salons);
            res.json(allSalons);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.post("/api/admin/salons", requireAdmin, async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const [salon] = await db.insert(salons).values(data).returning();
            res.json(salon);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.put("/api/admin/salons/:id", requireAdmin, async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const [salon] = await db.update(salons).set(data).where(eq(salons.id, req.params.id as string)).returning();
            res.json(salon);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.delete("/api/admin/salons/:id", requireAdmin, async (req: Request, res: Response) => {
        try {
            await db.delete(salons).where(eq(salons.id, req.params.id as string));
            res.json({ success: true });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    // Bookings CRUD
    app.get("/api/admin/bookings", requireAdmin, async (req: Request, res: Response) => {
        try {
            const allBookings = await db.select().from(bookings);
            res.json(allBookings);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.post("/api/admin/bookings", requireAdmin, async (req: Request, res: Response) => {
        try {
            const data = req.body;
            // Provide sensible defaults for a created booking if not provided
            const [booking] = await db.insert(bookings).values({
                ...data,
                status: data.status || 'upcoming'
            }).returning();
            res.json(booking);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.put("/api/admin/bookings/:id", requireAdmin, async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const [booking] = await db.update(bookings).set(data).where(eq(bookings.id, req.params.id as string)).returning();
            res.json(booking);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.delete("/api/admin/bookings/:id", requireAdmin, async (req: Request, res: Response) => {
        try {
            await db.delete(bookings).where(eq(bookings.id, req.params.id as string));
            res.json({ success: true });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    // --- Image Upload Configurations ---
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: function (req: any, file: any, cb: any) {
            cb(null, uploadsDir);
        },
        filename: function (req: any, file: any, cb: any) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            cb(null, file.fieldname + '-' + uniqueSuffix + ext);
        }
    });

    const upload = multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
    });

    // Image Upload API (Accessible to admins)
    app.post("/api/admin/upload", requireAdmin, upload.single('image'), (req: any, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No image file provided" });
            }

            // Return the public URL for the uploaded file
            // Note: Since Express serves 'public' statically via setupVite or static middleware usually, 
            // the client accesses it via /uploads/filename.ext
            const fileUrl = `/uploads/${req.file.filename}`;
            res.json({ url: fileUrl });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    // --- Coupons Management ---
    app.get("/api/admin/coupons", requireAdmin, async (req: Request, res: Response) => {
        try {
            const allCoupons = await db.select().from(coupons);
            res.json(allCoupons);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.post("/api/admin/coupons", requireAdmin, async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const [coupon] = await db.insert(coupons).values(data).returning();
            res.json(coupon);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.put("/api/admin/coupons/:id", requireAdmin, async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const [coupon] = await db.update(coupons).set(data).where(eq(coupons.id, req.params.id as string)).returning();
            res.json(coupon);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.delete("/api/admin/coupons/:id", requireAdmin, async (req: Request, res: Response) => {
        try {
            await db.delete(coupons).where(eq(coupons.id, req.params.id as string));
            res.json({ success: true });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    // --- Payments / Transactions ---
    // Note: We use bookings table for now as it contains payment info
    app.get("/api/admin/payments", requireAdmin, async (req: Request, res: Response) => {
        try {
            const payments = await db.select().from(bookings).where(sql`${bookings.paymentMethod} != ''`);
            res.json(payments);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    // --- Messages Management ---
    app.get("/api/admin/messages", requireAdmin, async (req: Request, res: Response) => {
        try {
            const allMessages = await db.select().from(messages);
            res.json(allMessages);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.post("/api/admin/messages/reply", requireAdmin, async (req: Request, res: Response) => {
        try {
            const { userId, salonId, salonName, salonImage, content } = req.body;
            const [msg] = await db.insert(messages).values({
                userId, salonId, salonName, salonImage, content, sender: "salon"
            }).returning();
            res.json(msg);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });


    // --- Settings Management ---
    app.get("/api/admin/settings", requireAdmin, async (req: Request, res: Response) => {
        try {
            const settings = await db.select().from(appSettings);
            res.json(settings);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.post("/api/admin/settings", requireAdmin, async (req: Request, res: Response) => {
        try {
            const { key, value, description } = req.body;
            // Upsert setting
            const existing = await db.select().from(appSettings).where(eq(appSettings.key, key));
            let setting;
            if (existing.length > 0) {
                [setting] = await db.update(appSettings).set({ value, description, updatedAt: new Date() }).where(eq(appSettings.key, key)).returning();
            } else {
                [setting] = await db.insert(appSettings).values({ key, value, description }).returning();
            }
            res.json(setting);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    // --- Services Management ---
    app.get("/api/admin/services", requireAdmin, async (req: Request, res: Response) => {
        try {
            const allServices = await db.select().from(services);
            res.json(allServices);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.post("/api/admin/services", requireAdmin, async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const [service] = await db.insert(services).values(data).returning();
            res.json(service);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.put("/api/admin/services/:id", requireAdmin, async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const [service] = await db.update(services).set(data).where(eq(services.id, req.params.id as string)).returning();
            res.json(service);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });

    app.delete("/api/admin/services/:id", requireAdmin, async (req: Request, res: Response) => {
        try {
            await db.delete(services).where(eq(services.id, req.params.id as string));
            res.json({ success: true });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    });
}
