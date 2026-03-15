import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone").default(""),
  avatar: text("avatar").default(""),
  nickname: text("nickname").default(""),
  gender: text("gender").default(""),
  dob: text("dob").default(""),
  role: text("role").default("user"), // user | admin | super_admin | salon_admin | staff
  loyaltyPoints: integer("loyalty_points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const salons = pgTable("salons", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  image: text("image").notNull(),
  address: text("address").notNull(),
  distance: text("distance").default("0 km"),
  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),
  isOpen: boolean("is_open").default(true),
  openHours: text("open_hours").default("9:00 AM - 9:00 PM"),
  phone: text("phone").default(""),
  about: text("about").default(""),
  website: text("website").default(""),
  latitude: doublePrecision("latitude").default(0),
  longitude: doublePrecision("longitude").default(0),
  gallery: jsonb("gallery").$type<string[]>().default([]),
  status: text("status").default("active"), // active | suspended | deactivated
  ownerId: varchar("owner_id", { length: 255 }).default(""), // salon_admin user id
});

// Links users to salons as salon_admin or staff
export const salonStaff = pgTable("salon_staff", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  role: text("role").notNull().default("staff"), // salon_admin | staff
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscription plans
export const plans = pgTable("plans", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // Basic | Pro | Enterprise
  price: doublePrecision("price").notNull().default(0),
  billingCycle: text("billing_cycle").notNull().default("monthly"), // monthly | annual
  features: jsonb("features").$type<string[]>().default([]),
  commissionRate: doublePrecision("commission_rate").default(5), // platform commission %
  maxBookings: integer("max_bookings").default(0), // 0 = unlimited
  maxStaff: integer("max_staff").default(0), // 0 = unlimited
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Salon subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  planId: varchar("plan_id", { length: 255 }).notNull(),
  status: text("status").notNull().default("active"), // active | expired | suspended | cancelled
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// License keys for salon access
export const licenseKeys = pgTable("license_keys", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  salonId: varchar("salon_id", { length: 255 }).default(""), // empty = unassigned
  planId: varchar("plan_id", { length: 255 }).default(""),
  status: text("status").notNull().default("unused"), // unused | active | revoked
  expiresAt: text("expires_at").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

// Platform activity logs
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).default(""),
  userRole: text("user_role").default(""),
  action: text("action").notNull(), // e.g. "user.login", "booking.created", "salon.deactivated"
  entityType: text("entity_type").default(""), // user | salon | booking | subscription
  entityId: varchar("entity_id", { length: 255 }).default(""),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Platform commissions per booking
export const commissions = pgTable("commissions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  amount: doublePrecision("amount").notNull().default(0),
  rate: doublePrecision("rate").notNull().default(5),
  status: text("status").notNull().default("pending"), // pending | paid
  createdAt: timestamp("created_at").defaultNow(),
});

// Salon expenses
export const expenses = pgTable("expenses", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  description: text("description").notNull(),
  amount: doublePrecision("amount").notNull(),
  category: text("category").default("general"), // rent | supplies | utilities | salaries | general
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Staff shifts
export const shifts = pgTable("shifts", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  staffId: varchar("staff_id", { length: 255 }).notNull(), // references users.id
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 6=Saturday
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "17:00"
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  duration: text("duration").notNull(),
  image: text("image").default(""),
  category: text("category").default(""),
});

export const packages = pgTable("packages", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  originalPrice: doublePrecision("original_price").notNull(),
  services: jsonb("services").$type<string[]>().default([]),
  image: text("image").default(""),
});

export const specialists = pgTable("specialists", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  image: text("image").default(""),
  rating: doublePrecision("rating").default(0),
});

export const reviews = pgTable("reviews", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }),
  userName: text("user_name").notNull(),
  userImage: text("user_image").default(""),
  rating: integer("rating").notNull(),
  comment: text("comment").default(""),
  date: text("date").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  salonName: text("salon_name").notNull(),
  salonImage: text("salon_image").default(""),
  services: jsonb("services_list").$type<string[]>().default([]),
  date: text("date").notNull(),
  time: text("time").notNull(),
  totalPrice: doublePrecision("total_price").notNull(),
  status: text("status").notNull().default("upcoming"),
  paymentMethod: text("payment_method").default(""),
  specialistId: varchar("specialist_id", { length: 255 }).default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookmarkTable = pgTable("bookmarks", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  salonName: text("salon_name").notNull(),
  salonImage: text("salon_image").default(""),
  content: text("content").notNull(),
  sender: text("sender").notNull().default("salon"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("system"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const session = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const coupons = pgTable("coupons", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  discount: doublePrecision("discount").notNull(),
  type: text("type").notNull().default("percentage"),
  expiryDate: text("expiry_date").notNull(),
  usageLimit: integer("usage_limit").default(0),
  usedCount: integer("used_count").default(0),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appSettings = pgTable("app_settings", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description").default(""),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  fullName: true,
  email: true,
  password: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Salon = typeof salons.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Package = typeof packages.$inferSelect;
export type Specialist = typeof specialists.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Bookmark = typeof bookmarkTable.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type AppSetting = typeof appSettings.$inferSelect;
export type SalonStaff = typeof salonStaff.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type LicenseKey = typeof licenseKeys.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type Commission = typeof commissions.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Shift = typeof shifts.$inferSelect;
