import crypto from "crypto";
import { mysqlTable, text, varchar, int, boolean, timestamp, double, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  fullName: text("full_name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone").default(""),
  avatar: text("avatar").default(""),
  nickname: text("nickname").default(""),
  gender: text("gender").default(""),
  dob: text("dob").default(""),
  role: text("role").default("user"), // user | admin | super_admin | salon_admin | staff
  loyaltyPoints: int("loyalty_points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const salons = mysqlTable("salons", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  image: text("image").notNull(),
  address: text("address").notNull(),
  distance: text("distance").default("0 km"),
  rating: double("rating").default(0),
  reviewCount: int("review_count").default(0),
  isOpen: boolean("is_open").default(true),
  openHours: text("open_hours").default("9:00 AM - 9:00 PM"),
  phone: text("phone").default(""),
  about: text("about").default(""),
  website: text("website").default(""),
  latitude: double("latitude").default(0),
  longitude: double("longitude").default(0),
  gallery: json("gallery").$type<string[]>().default([]),
  status: text("status").default("active"), // active | suspended | deactivated
  ownerId: varchar("owner_id", { length: 255 }).default(""), // salon_admin user id
  landingEnabled: boolean("landing_enabled").default(false),
  landingSlug: text("landing_slug").default(""),
  landingViews: int("landing_views").default(0),
  whatsappNumber: text("whatsapp_number").default(""),
  landingTheme: text("landing_theme").default("dark"), // dark | light
  landingAccentColor: text("landing_accent_color").default("#F4A460"),
  landingBookingUrl: text("landing_booking_url").default(""),
});

// Links users to salons as salon_admin or staff
export const salonStaff = mysqlTable("salon_staff", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  role: text("role").notNull().default("staff"), // salon_admin | staff
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscription plans
export const plans = mysqlTable("plans", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(), // Basic | Pro | Enterprise
  price: double("price").notNull().default(0),
  billingCycle: text("billing_cycle").notNull().default("monthly"), // monthly | annual
  features: json("features").$type<string[]>().default([]),
  commissionRate: double("commission_rate").default(5), // platform commission %
  maxBookings: int("max_bookings").default(0), // 0 = unlimited
  maxStaff: int("max_staff").default(0), // 0 = unlimited
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Salon subscriptions
export const subscriptions = mysqlTable("subscriptions", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  planId: varchar("plan_id", { length: 255 }).notNull(),
  status: text("status").notNull().default("active"), // active | expired | suspended | cancelled
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// License keys for salon access
export const licenseKeys = mysqlTable("license_keys", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: varchar("key", { length: 255 }).notNull().unique(),
  salonId: varchar("salon_id", { length: 255 }).default(""), // empty = unassigned
  planId: varchar("plan_id", { length: 255 }).default(""),
  status: text("status").notNull().default("unused"), // unused | active | revoked
  expiresAt: text("expires_at").default(""),
  maxActivations: int("max_activations").default(0), // 0 = unlimited
  activationCount: int("activation_count").default(0), // how many devices activated
  createdAt: timestamp("created_at").defaultNow(),
});

// Tracks which device IDs have activated a license key
export const licenseActivations = mysqlTable("license_activations", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  licenseKeyId: varchar("license_key_id", { length: 255 }).notNull(),
  deviceId: text("device_id").notNull(),
  email: text("email").default(""),
  activatedAt: timestamp("activated_at").defaultNow(),
});

// Platform activity logs
export const activityLogs = mysqlTable("activity_logs", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 }).default(""),
  userRole: text("user_role").default(""),
  action: text("action").notNull(), // e.g. "user.login", "booking.created", "salon.deactivated"
  entityType: text("entity_type").default(""), // user | salon | booking | subscription
  entityId: varchar("entity_id", { length: 255 }).default(""),
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Platform commissions per booking
export const commissions = mysqlTable("commissions", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: varchar("booking_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  amount: double("amount").notNull().default(0),
  rate: double("rate").notNull().default(5),
  status: text("status").notNull().default("pending"), // pending | paid
  createdAt: timestamp("created_at").defaultNow(),
});

// Salon expenses
export const expenses = mysqlTable("expenses", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  description: text("description").notNull(),
  amount: double("amount").notNull(),
  category: text("category").default("general"), // rent | supplies | utilities | salaries | general
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Staff shifts
export const shifts = mysqlTable("shifts", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  staffId: varchar("staff_id", { length: 255 }).notNull(), // references users.id
  dayOfWeek: int("day_of_week").notNull(), // 0=Sunday, 6=Saturday
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "17:00"
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = mysqlTable("services", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  name: text("name").notNull(),
  price: double("price").notNull(),
  duration: text("duration").notNull(),
  image: text("image").default(""),
  category: text("category").default(""),
});

export const packages = mysqlTable("packages", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  name: text("name").notNull(),
  price: double("price").notNull(),
  originalPrice: double("original_price").notNull(),
  services: json("services").$type<string[]>().default([]),
  image: text("image").default(""),
});

export const specialists = mysqlTable("specialists", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  image: text("image").default(""),
  rating: double("rating").default(0),
});

export const reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }),
  userName: text("user_name").notNull(),
  userImage: text("user_image").default(""),
  rating: int("rating").notNull(),
  comment: text("comment").default(""),
  date: text("date").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = mysqlTable("bookings", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  salonName: text("salon_name").notNull(),
  salonImage: text("salon_image").default(""),
  services: json("services_list").$type<string[]>().default([]),
  date: text("date").notNull(),
  time: text("time").notNull(),
  totalPrice: double("total_price").notNull(),
  status: text("status").notNull().default("upcoming"),
  paymentMethod: text("payment_method").default(""),
  specialistId: varchar("specialist_id", { length: 255 }).default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookmarkTable = mysqlTable("bookmarks", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = mysqlTable("messages", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  salonName: text("salon_name").notNull(),
  salonImage: text("salon_image").default(""),
  content: text("content").notNull(),
  sender: text("sender").notNull().default("salon"),
  senderName: text("sender_name").default(""),
  isRead: int("is_read").default(0),
  messageType: text("message_type").default("text"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("system"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coupons = mysqlTable("coupons", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: varchar("code", { length: 255 }).notNull().unique(),
  discount: double("discount").notNull(),
  type: text("type").notNull().default("percentage"),
  expiryDate: text("expiry_date").notNull(),
  usageLimit: int("usage_limit").default(0),
  usedCount: int("used_count").default(0),
  active: boolean("active").default(true),
  salonId: varchar("salon_id", { length: 255 }).default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory items per salon
export const inventory = mysqlTable("inventory", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  name: text("name").notNull(),
  category: text("category").default("general"), // tools | products | supplies
  quantity: int("quantity").default(0),
  minQuantity: int("min_quantity").default(5),
  unit: text("unit").default("pcs"),
  price: double("price").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Retail products sold to customers
export const products = mysqlTable("products", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  salonName: text("salon_name").default(""),
  name: text("name").notNull(),
  description: text("description").default(""),
  price: double("price").notNull(),
  image: text("image").default(""),
  category: text("category").default("general"),
  stock: int("stock").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product orders (customer purchases)
export const productOrders = mysqlTable("product_orders", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  items: json("items").$type<{ id: string; name: string; price: number; qty: number; image?: string }[]>().default([]),
  totalPrice: double("total_price").notNull(),
  status: text("status").default("pending"),
  paymentMethod: text("payment_method").default("cash"),
  shippingAddress: text("shipping_address").default(""),
  phone: text("phone").default(""),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tips per booking
export const tips = mysqlTable("tips", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: varchar("booking_id", { length: 255 }).notNull(),
  staffId: varchar("staff_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  amount: double("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer notes (per salon)
export const customerNotes = mysqlTable("customer_notes", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  customerId: varchar("customer_id", { length: 255 }).notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Loyalty point transactions
export const loyaltyTransactions = mysqlTable("loyalty_transactions", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).default(""),
  points: int("points").notNull(), // positive = earned, negative = redeemed
  type: text("type").notNull().default("earned"), // earned | redeemed
  description: text("description").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appSettings = mysqlTable("app_settings", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description").default(""),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trial requests from new salons
export const trialRequests = mysqlTable("trial_requests", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  salonName: text("salon_name").notNull(),
  ownerName: text("owner_name").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: text("phone").notNull(),
  city: text("city").default(""),
  country: text("country").default(""),
  message: text("message").default(""),
  status: text("status").default("pending"), // pending | contacted | approved | rejected
  createdAt: timestamp("created_at").defaultNow(),
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
export type Inventory = typeof inventory.$inferSelect;
export type Tip = typeof tips.$inferSelect;
export type CustomerNote = typeof customerNotes.$inferSelect;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type TrialRequest = typeof trialRequests.$inferSelect;
