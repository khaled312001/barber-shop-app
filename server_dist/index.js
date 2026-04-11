"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc3) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc3 = __getOwnPropDesc(from, key)) || desc3.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server/index.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"));
var import_express_rate_limit = __toESM(require("express-rate-limit"));

// server/routes.ts
var import_node_http = require("node:http");
var import_node_crypto = __toESM(require("node:crypto"));
var import_express_session = __toESM(require("express-session"));
var import_express_mysql_session = __toESM(require("express-mysql-session"));

// server/db.ts
var dotenv = __toESM(require("dotenv"));
var import_path = __toESM(require("path"));
var import_mysql2 = require("drizzle-orm/mysql2");
var import_promise = __toESM(require("mysql2/promise"));

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activityLogs: () => activityLogs,
  appSettings: () => appSettings,
  bookings: () => bookings,
  bookmarkTable: () => bookmarkTable,
  commissions: () => commissions,
  coupons: () => coupons,
  customerNotes: () => customerNotes,
  expenses: () => expenses,
  insertUserSchema: () => insertUserSchema,
  inventory: () => inventory,
  licenseActivations: () => licenseActivations,
  licenseKeys: () => licenseKeys,
  loyaltyTransactions: () => loyaltyTransactions,
  messages: () => messages,
  notifications: () => notifications,
  packages: () => packages,
  plans: () => plans,
  reviews: () => reviews,
  salonStaff: () => salonStaff,
  salons: () => salons,
  services: () => services,
  shifts: () => shifts,
  specialists: () => specialists,
  subscriptions: () => subscriptions,
  tips: () => tips,
  users: () => users
});
var import_crypto = __toESM(require("crypto"));
var import_mysql_core = require("drizzle-orm/mysql-core");
var import_drizzle_zod = require("drizzle-zod");
var users = (0, import_mysql_core.mysqlTable)("users", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  fullName: (0, import_mysql_core.text)("full_name").notNull(),
  email: (0, import_mysql_core.varchar)("email", { length: 255 }).notNull().unique(),
  password: (0, import_mysql_core.text)("password").notNull(),
  phone: (0, import_mysql_core.text)("phone").default(""),
  avatar: (0, import_mysql_core.text)("avatar").default(""),
  nickname: (0, import_mysql_core.text)("nickname").default(""),
  gender: (0, import_mysql_core.text)("gender").default(""),
  dob: (0, import_mysql_core.text)("dob").default(""),
  role: (0, import_mysql_core.text)("role").default("user"),
  // user | admin | super_admin | salon_admin | staff
  loyaltyPoints: (0, import_mysql_core.int)("loyalty_points").default(0),
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var salons = (0, import_mysql_core.mysqlTable)("salons", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  name: (0, import_mysql_core.text)("name").notNull(),
  image: (0, import_mysql_core.text)("image").notNull(),
  address: (0, import_mysql_core.text)("address").notNull(),
  distance: (0, import_mysql_core.text)("distance").default("0 km"),
  rating: (0, import_mysql_core.double)("rating").default(0),
  reviewCount: (0, import_mysql_core.int)("review_count").default(0),
  isOpen: (0, import_mysql_core.boolean)("is_open").default(true),
  openHours: (0, import_mysql_core.text)("open_hours").default("9:00 AM - 9:00 PM"),
  phone: (0, import_mysql_core.text)("phone").default(""),
  about: (0, import_mysql_core.text)("about").default(""),
  website: (0, import_mysql_core.text)("website").default(""),
  latitude: (0, import_mysql_core.double)("latitude").default(0),
  longitude: (0, import_mysql_core.double)("longitude").default(0),
  gallery: (0, import_mysql_core.json)("gallery").$type().default([]),
  status: (0, import_mysql_core.text)("status").default("active"),
  // active | suspended | deactivated
  ownerId: (0, import_mysql_core.varchar)("owner_id", { length: 255 }).default(""),
  // salon_admin user id
  landingEnabled: (0, import_mysql_core.boolean)("landing_enabled").default(false),
  landingSlug: (0, import_mysql_core.text)("landing_slug").default(""),
  landingViews: (0, import_mysql_core.int)("landing_views").default(0),
  landingTheme: (0, import_mysql_core.text)("landing_theme").default("dark"),
  // dark | light
  landingAccentColor: (0, import_mysql_core.text)("landing_accent_color").default("#F4A460"),
  landingBookingUrl: (0, import_mysql_core.text)("landing_booking_url").default("")
});
var salonStaff = (0, import_mysql_core.mysqlTable)("salon_staff", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  userId: (0, import_mysql_core.varchar)("user_id", { length: 255 }).notNull(),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
  role: (0, import_mysql_core.text)("role").notNull().default("staff"),
  // salon_admin | staff
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var plans = (0, import_mysql_core.mysqlTable)("plans", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  name: (0, import_mysql_core.text)("name").notNull(),
  // Basic | Pro | Enterprise
  price: (0, import_mysql_core.double)("price").notNull().default(0),
  billingCycle: (0, import_mysql_core.text)("billing_cycle").notNull().default("monthly"),
  // monthly | annual
  features: (0, import_mysql_core.json)("features").$type().default([]),
  commissionRate: (0, import_mysql_core.double)("commission_rate").default(5),
  // platform commission %
  maxBookings: (0, import_mysql_core.int)("max_bookings").default(0),
  // 0 = unlimited
  maxStaff: (0, import_mysql_core.int)("max_staff").default(0),
  // 0 = unlimited
  isActive: (0, import_mysql_core.boolean)("is_active").default(true),
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var subscriptions = (0, import_mysql_core.mysqlTable)("subscriptions", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
  planId: (0, import_mysql_core.varchar)("plan_id", { length: 255 }).notNull(),
  status: (0, import_mysql_core.text)("status").notNull().default("active"),
  // active | expired | suspended | cancelled
  startDate: (0, import_mysql_core.text)("start_date").notNull(),
  endDate: (0, import_mysql_core.text)("end_date").notNull(),
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_mysql_core.timestamp)("updated_at").defaultNow()
});
var licenseKeys = (0, import_mysql_core.mysqlTable)("license_keys", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  key: (0, import_mysql_core.varchar)("key", { length: 255 }).notNull().unique(),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).default(""),
  // empty = unassigned
  planId: (0, import_mysql_core.varchar)("plan_id", { length: 255 }).default(""),
  status: (0, import_mysql_core.text)("status").notNull().default("unused"),
  // unused | active | revoked
  expiresAt: (0, import_mysql_core.text)("expires_at").default(""),
  maxActivations: (0, import_mysql_core.int)("max_activations").default(0),
  // 0 = unlimited
  activationCount: (0, import_mysql_core.int)("activation_count").default(0),
  // how many devices activated
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var licenseActivations = (0, import_mysql_core.mysqlTable)("license_activations", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  licenseKeyId: (0, import_mysql_core.varchar)("license_key_id", { length: 255 }).notNull(),
  deviceId: (0, import_mysql_core.text)("device_id").notNull(),
  email: (0, import_mysql_core.text)("email").default(""),
  activatedAt: (0, import_mysql_core.timestamp)("activated_at").defaultNow()
});
var activityLogs = (0, import_mysql_core.mysqlTable)("activity_logs", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  userId: (0, import_mysql_core.varchar)("user_id", { length: 255 }).default(""),
  userRole: (0, import_mysql_core.text)("user_role").default(""),
  action: (0, import_mysql_core.text)("action").notNull(),
  // e.g. "user.login", "booking.created", "salon.deactivated"
  entityType: (0, import_mysql_core.text)("entity_type").default(""),
  // user | salon | booking | subscription
  entityId: (0, import_mysql_core.varchar)("entity_id", { length: 255 }).default(""),
  metadata: (0, import_mysql_core.json)("metadata").$type().default({}),
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var commissions = (0, import_mysql_core.mysqlTable)("commissions", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  bookingId: (0, import_mysql_core.varchar)("booking_id", { length: 255 }).notNull(),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
  amount: (0, import_mysql_core.double)("amount").notNull().default(0),
  rate: (0, import_mysql_core.double)("rate").notNull().default(5),
  status: (0, import_mysql_core.text)("status").notNull().default("pending"),
  // pending | paid
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var expenses = (0, import_mysql_core.mysqlTable)("expenses", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
  description: (0, import_mysql_core.text)("description").notNull(),
  amount: (0, import_mysql_core.double)("amount").notNull(),
  category: (0, import_mysql_core.text)("category").default("general"),
  // rent | supplies | utilities | salaries | general
  date: (0, import_mysql_core.text)("date").notNull(),
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var shifts = (0, import_mysql_core.mysqlTable)("shifts", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
  staffId: (0, import_mysql_core.varchar)("staff_id", { length: 255 }).notNull(),
  // references users.id
  dayOfWeek: (0, import_mysql_core.int)("day_of_week").notNull(),
  // 0=Sunday, 6=Saturday
  startTime: (0, import_mysql_core.text)("start_time").notNull(),
  // "09:00"
  endTime: (0, import_mysql_core.text)("end_time").notNull(),
  // "17:00"
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var services = (0, import_mysql_core.mysqlTable)("services", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
  name: (0, import_mysql_core.text)("name").notNull(),
  price: (0, import_mysql_core.double)("price").notNull(),
  duration: (0, import_mysql_core.text)("duration").notNull(),
  image: (0, import_mysql_core.text)("image").default(""),
  category: (0, import_mysql_core.text)("category").default("")
});
var packages = (0, import_mysql_core.mysqlTable)("packages", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
  name: (0, import_mysql_core.text)("name").notNull(),
  price: (0, import_mysql_core.double)("price").notNull(),
  originalPrice: (0, import_mysql_core.double)("original_price").notNull(),
  services: (0, import_mysql_core.json)("services").$type().default([]),
  image: (0, import_mysql_core.text)("image").default("")
});
var specialists = (0, import_mysql_core.mysqlTable)("specialists", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
  name: (0, import_mysql_core.text)("name").notNull(),
  role: (0, import_mysql_core.text)("role").notNull(),
  image: (0, import_mysql_core.text)("image").default(""),
  rating: (0, import_mysql_core.double)("rating").default(0)
});
var reviews = (0, import_mysql_core.mysqlTable)("reviews", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
  userId: (0, import_mysql_core.varchar)("user_id", { length: 255 }),
  userName: (0, import_mysql_core.text)("user_name").notNull(),
  userImage: (0, import_mysql_core.text)("user_image").default(""),
  rating: (0, import_mysql_core.int)("rating").notNull(),
  comment: (0, import_mysql_core.text)("comment").default(""),
  date: (0, import_mysql_core.text)("date").default(""),
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var bookings = (0, import_mysql_core.mysqlTable)("bookings", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  userId: (0, import_mysql_core.varchar)("user_id", { length: 255 }).notNull(),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
  salonName: (0, import_mysql_core.text)("salon_name").notNull(),
  salonImage: (0, import_mysql_core.text)("salon_image").default(""),
  services: (0, import_mysql_core.json)("services_list").$type().default([]),
  date: (0, import_mysql_core.text)("date").notNull(),
  time: (0, import_mysql_core.text)("time").notNull(),
  totalPrice: (0, import_mysql_core.double)("total_price").notNull(),
  status: (0, import_mysql_core.text)("status").notNull().default("upcoming"),
  paymentMethod: (0, import_mysql_core.text)("payment_method").default(""),
  specialistId: (0, import_mysql_core.varchar)("specialist_id", { length: 255 }).default(""),
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var bookmarkTable = (0, import_mysql_core.mysqlTable)("bookmarks", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  userId: (0, import_mysql_core.varchar)("user_id", { length: 255 }).notNull(),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var messages = (0, import_mysql_core.mysqlTable)("messages", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  userId: (0, import_mysql_core.varchar)("user_id", { length: 255 }).notNull(),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
  salonName: (0, import_mysql_core.text)("salon_name").notNull(),
  salonImage: (0, import_mysql_core.text)("salon_image").default(""),
  content: (0, import_mysql_core.text)("content").notNull(),
  sender: (0, import_mysql_core.text)("sender").notNull().default("salon"),
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var notifications = (0, import_mysql_core.mysqlTable)("notifications", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  userId: (0, import_mysql_core.varchar)("user_id", { length: 255 }).notNull(),
  title: (0, import_mysql_core.text)("title").notNull(),
  message: (0, import_mysql_core.text)("message").notNull(),
  type: (0, import_mysql_core.text)("type").notNull().default("system"),
  read: (0, import_mysql_core.boolean)("read").default(false),
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var coupons = (0, import_mysql_core.mysqlTable)("coupons", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  code: (0, import_mysql_core.varchar)("code", { length: 255 }).notNull().unique(),
  discount: (0, import_mysql_core.double)("discount").notNull(),
  type: (0, import_mysql_core.text)("type").notNull().default("percentage"),
  expiryDate: (0, import_mysql_core.text)("expiry_date").notNull(),
  usageLimit: (0, import_mysql_core.int)("usage_limit").default(0),
  usedCount: (0, import_mysql_core.int)("used_count").default(0),
  active: (0, import_mysql_core.boolean)("active").default(true),
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var inventory = (0, import_mysql_core.mysqlTable)("inventory", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
  name: (0, import_mysql_core.text)("name").notNull(),
  category: (0, import_mysql_core.text)("category").default("general"),
  // tools | products | supplies
  quantity: (0, import_mysql_core.int)("quantity").default(0),
  minQuantity: (0, import_mysql_core.int)("min_quantity").default(5),
  unit: (0, import_mysql_core.text)("unit").default("pcs"),
  price: (0, import_mysql_core.double)("price").default(0),
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var tips = (0, import_mysql_core.mysqlTable)("tips", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  bookingId: (0, import_mysql_core.varchar)("booking_id", { length: 255 }).notNull(),
  staffId: (0, import_mysql_core.varchar)("staff_id", { length: 255 }).notNull(),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
  amount: (0, import_mysql_core.double)("amount").notNull(),
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var customerNotes = (0, import_mysql_core.mysqlTable)("customer_notes", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
  customerId: (0, import_mysql_core.varchar)("customer_id", { length: 255 }).notNull(),
  note: (0, import_mysql_core.text)("note").notNull(),
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var loyaltyTransactions = (0, import_mysql_core.mysqlTable)("loyalty_transactions", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  userId: (0, import_mysql_core.varchar)("user_id", { length: 255 }).notNull(),
  salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).default(""),
  points: (0, import_mysql_core.int)("points").notNull(),
  // positive = earned, negative = redeemed
  type: (0, import_mysql_core.text)("type").notNull().default("earned"),
  // earned | redeemed
  description: (0, import_mysql_core.text)("description").default(""),
  createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
});
var appSettings = (0, import_mysql_core.mysqlTable)("app_settings", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  key: (0, import_mysql_core.varchar)("key", { length: 255 }).notNull().unique(),
  value: (0, import_mysql_core.text)("value").notNull(),
  description: (0, import_mysql_core.text)("description").default(""),
  updatedAt: (0, import_mysql_core.timestamp)("updated_at").defaultNow()
});
var insertUserSchema = (0, import_drizzle_zod.createInsertSchema)(users).pick({
  fullName: true,
  email: true,
  password: true
});

// server/db.ts
dotenv.config({ path: import_path.default.resolve(process.cwd(), ".env") });
var pool = import_promise.default.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});
var db = (0, import_mysql2.drizzle)(pool, { schema: schema_exports, mode: "default" });

// server/seed.ts
var salonHeroImages = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop"
];
var serviceImages = {
  haircut: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop",
  hairColor: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=200&h=200&fit=crop",
  facialMakeup: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200&h=200&fit=crop",
  nails: "https://images.unsplash.com/photo-1519823551278-64ac92734314?w=200&h=200&fit=crop",
  massage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&h=200&fit=crop",
  facial: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&h=200&fit=crop"
};
var specialistImages = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
];
var reviewerImages = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
];
var galleryBase = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519823551278-64ac92734314?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop"
];
function makeGallery(startIndex) {
  const result = [];
  for (let i = 0; i < 6; i++) {
    result.push(galleryBase[(startIndex + i) % galleryBase.length]);
  }
  return result;
}
var salonData = [
  {
    id: "1",
    name: "Belle Curls",
    image: salonHeroImages[0],
    address: "6993 Meadow Valley Terrace, New York, NY 10001",
    distance: "1.2 km",
    rating: 4.8,
    reviewCount: 4279,
    isOpen: true,
    openHours: "9:00 AM - 9:00 PM",
    phone: "+1 212 555 0101",
    about: "Belle Curls is a premium salon nestled in the heart of Manhattan, offering top-notch grooming services with a warm, inviting atmosphere. Our experienced professionals specialize in precision cuts, vibrant color treatments, and luxurious spa services. Step in and let us transform your look with personalized care and attention to detail.",
    website: "www.bellecurls.com",
    latitude: 40.7128,
    longitude: -74.006,
    gallery: makeGallery(0)
  },
  {
    id: "2",
    name: "Pretty Parlour",
    image: salonHeroImages[1],
    address: "2871 Heron Way, New York, NY 10002",
    distance: "1.8 km",
    rating: 4.6,
    reviewCount: 3187,
    isOpen: true,
    openHours: "8:00 AM - 8:00 PM",
    phone: "+1 212 555 0102",
    about: "Pretty Parlour brings together elegance and comfort for an unforgettable beauty experience. From classic updos to contemporary styling, our talented team creates looks that turn heads. We pride ourselves on using only premium, cruelty-free products for every service.",
    website: "www.prettyparlour.com",
    latitude: 40.72,
    longitude: -74.01,
    gallery: makeGallery(2)
  },
  {
    id: "3",
    name: "Clip & Trim",
    image: salonHeroImages[2],
    address: "4598 Lincoln Drive, New York, NY 10003",
    distance: "2.4 km",
    rating: 4.9,
    reviewCount: 5621,
    isOpen: false,
    openHours: "10:00 AM - 7:00 PM",
    phone: "+1 212 555 0103",
    about: "Clip & Trim is the go-to destination for precision cuts and classic barbering in the city. Our master barbers bring decades of combined experience to every fade, taper, and straight-razor shave. Whether you want a timeless look or a modern edge, we deliver excellence every time.",
    website: "www.clipandtrim.com",
    latitude: 40.73,
    longitude: -74.02,
    gallery: makeGallery(4)
  },
  {
    id: "4",
    name: "Luxe Lounge",
    image: salonHeroImages[3],
    address: "1256 Park Avenue, New York, NY 10004",
    distance: "3.1 km",
    rating: 4.7,
    reviewCount: 2985,
    isOpen: true,
    openHours: "9:00 AM - 10:00 PM",
    phone: "+1 212 555 0104",
    about: "Luxe Lounge offers a luxury spa and salon experience with premium products and highly skilled stylists. Indulge in our signature treatments designed to rejuvenate your body and elevate your style. Our serene environment is the perfect escape from the hustle of city life.",
    website: "www.luxelounge.com",
    latitude: 40.74,
    longitude: -74.03,
    gallery: makeGallery(6)
  },
  {
    id: "5",
    name: "The Razor Edge",
    image: salonHeroImages[5],
    address: "789 Broadway Blvd, New York, NY 10005",
    distance: "4.0 km",
    rating: 4.5,
    reviewCount: 1856,
    isOpen: true,
    openHours: "8:30 AM - 8:30 PM",
    phone: "+1 212 555 0105",
    about: "The Razor Edge combines traditional barbering techniques with modern styling for a truly unique grooming experience. Our skilled barbers are masters of the craft, delivering sharp fades, clean lines, and impeccable beard work. Walk in confident, walk out unstoppable.",
    website: "www.therazoredge.com",
    latitude: 40.75,
    longitude: -74.04,
    gallery: makeGallery(1)
  },
  {
    id: "6",
    name: "Golden Scissors",
    image: salonHeroImages[6],
    address: "145 Cherry Blossom Lane, New York, NY 10006",
    distance: "0.8 km",
    rating: 4.8,
    reviewCount: 3842,
    isOpen: true,
    openHours: "8:00 AM - 9:00 PM",
    phone: "+1 212 555 0106",
    about: "Golden Scissors is a family-friendly salon where everyone from kids to grandparents feels welcome. We offer a wide range of services at affordable prices without compromising on quality. Our cheerful team ensures every visit is a delightful experience for the whole family.",
    website: "www.goldenscissors.com",
    latitude: 40.708,
    longitude: -74.001,
    gallery: makeGallery(3)
  },
  {
    id: "7",
    name: "Velvet Touch Spa",
    image: salonHeroImages[4],
    address: "320 Riverside Terrace, New York, NY 10007",
    distance: "2.2 km",
    rating: 4.9,
    reviewCount: 4156,
    isOpen: true,
    openHours: "9:00 AM - 10:00 PM",
    phone: "+1 212 555 0107",
    about: "Velvet Touch Spa is a full-service wellness destination offering the ultimate in relaxation and beauty. From deep-tissue massages to rejuvenating facials and expert hair styling, every treatment is tailored to your needs. Surrender to tranquility in our award-winning spa environment.",
    website: "www.velvettouchspa.com",
    latitude: 40.735,
    longitude: -74.015,
    gallery: makeGallery(5)
  },
  {
    id: "8",
    name: "Urban Style Studio",
    image: salonHeroImages[7],
    address: "58 Greenwich Village Ave, New York, NY 10008",
    distance: "1.5 km",
    rating: 4.4,
    reviewCount: 2234,
    isOpen: true,
    openHours: "10:00 AM - 9:00 PM",
    phone: "+1 212 555 0108",
    about: "Urban Style Studio is the trendiest salon in the Village, specializing in bold colors, creative cuts, and fashion-forward styles. Our edgy team stays ahead of every trend so you can express your unique personality. Come for the vibe, stay for the transformation.",
    website: "www.urbanstylestudio.com",
    latitude: 40.725,
    longitude: -74.008,
    gallery: makeGallery(7)
  }
];
var salonServices = {
  "1": [
    { name: "Precision Haircut", price: 35, duration: "30 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Blow Dry & Style", price: 25, duration: "25 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Full Hair Color", price: 90, duration: "90 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Balayage Highlights", price: 150, duration: "120 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Deep Conditioning", price: 40, duration: "30 min", image: serviceImages.hairColor, category: "Hair Treatment" },
    { name: "Classic Facial", price: 55, duration: "45 min", image: serviceImages.facial, category: "Facial" },
    { name: "Bridal Makeup", price: 120, duration: "90 min", image: serviceImages.facialMakeup, category: "Make Up" },
    { name: "Gel Manicure", price: 30, duration: "35 min", image: serviceImages.nails, category: "Nails" },
    { name: "Spa Pedicure", price: 40, duration: "45 min", image: serviceImages.nails, category: "Nails" },
    { name: "Relaxation Massage", price: 75, duration: "60 min", image: serviceImages.massage, category: "Massage" }
  ],
  "2": [
    { name: "Women's Haircut", price: 40, duration: "35 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Kids Haircut", price: 20, duration: "20 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Root Touch Up", price: 65, duration: "60 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Ombre Color", price: 130, duration: "120 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Keratin Treatment", price: 180, duration: "150 min", image: serviceImages.hairColor, category: "Hair Treatment" },
    { name: "Hydrating Facial", price: 60, duration: "50 min", image: serviceImages.facial, category: "Facial" },
    { name: "Evening Makeup", price: 75, duration: "60 min", image: serviceImages.facialMakeup, category: "Make Up" },
    { name: "Acrylic Nails", price: 45, duration: "60 min", image: serviceImages.nails, category: "Nails" },
    { name: "Swedish Massage", price: 80, duration: "60 min", image: serviceImages.massage, category: "Massage" },
    { name: "Eyebrow Threading", price: 15, duration: "15 min", image: serviceImages.facialMakeup, category: "Make Up" }
  ],
  "3": [
    { name: "Classic Haircut", price: 25, duration: "25 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Buzz Cut", price: 18, duration: "15 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Hot Towel Shave", price: 30, duration: "30 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Beard Trim", price: 15, duration: "15 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Fade & Design", price: 35, duration: "40 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Hair & Beard Combo", price: 40, duration: "45 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Scalp Treatment", price: 25, duration: "20 min", image: serviceImages.massage, category: "Hair Treatment" },
    { name: "Gray Blending", price: 45, duration: "40 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Head Massage", price: 20, duration: "15 min", image: serviceImages.massage, category: "Massage" },
    { name: "Straight Razor Lineup", price: 12, duration: "10 min", image: serviceImages.haircut, category: "Haircut" }
  ],
  "4": [
    { name: "Luxury Haircut", price: 55, duration: "40 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Diamond Facial", price: 95, duration: "60 min", image: serviceImages.facial, category: "Facial" },
    { name: "Gold Mask Treatment", price: 110, duration: "75 min", image: serviceImages.facial, category: "Facial" },
    { name: "Full Color & Gloss", price: 160, duration: "120 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Hot Stone Massage", price: 120, duration: "90 min", image: serviceImages.massage, category: "Massage" },
    { name: "Aromatherapy Massage", price: 100, duration: "75 min", image: serviceImages.massage, category: "Massage" },
    { name: "Deluxe Manicure", price: 50, duration: "45 min", image: serviceImages.nails, category: "Nails" },
    { name: "Deluxe Pedicure", price: 60, duration: "50 min", image: serviceImages.nails, category: "Nails" },
    { name: "Lash Extensions", price: 85, duration: "90 min", image: serviceImages.facialMakeup, category: "Make Up" }
  ],
  "5": [
    { name: "Men's Haircut", price: 28, duration: "25 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Skin Fade", price: 32, duration: "35 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Beard Sculpting", price: 22, duration: "20 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Razor Shave", price: 25, duration: "25 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Hair Design", price: 40, duration: "45 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Color Camo", price: 35, duration: "30 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Scalp Massage", price: 20, duration: "15 min", image: serviceImages.massage, category: "Massage" },
    { name: "Face Mask", price: 30, duration: "25 min", image: serviceImages.facial, category: "Facial" }
  ],
  "6": [
    { name: "Family Haircut", price: 22, duration: "25 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Children's Cut", price: 15, duration: "20 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Senior's Cut", price: 18, duration: "20 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Basic Color", price: 55, duration: "60 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Highlights", price: 80, duration: "90 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Express Facial", price: 35, duration: "30 min", image: serviceImages.facial, category: "Facial" },
    { name: "Quick Makeup", price: 40, duration: "30 min", image: serviceImages.facialMakeup, category: "Make Up" },
    { name: "Classic Manicure", price: 20, duration: "25 min", image: serviceImages.nails, category: "Nails" },
    { name: "Classic Pedicure", price: 25, duration: "30 min", image: serviceImages.nails, category: "Nails" },
    { name: "Back & Shoulder Massage", price: 45, duration: "30 min", image: serviceImages.massage, category: "Massage" }
  ],
  "7": [
    { name: "Signature Haircut", price: 45, duration: "35 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Anti-Aging Facial", price: 85, duration: "60 min", image: serviceImages.facial, category: "Facial" },
    { name: "Vitamin C Facial", price: 75, duration: "50 min", image: serviceImages.facial, category: "Facial" },
    { name: "Deep Tissue Massage", price: 110, duration: "90 min", image: serviceImages.massage, category: "Massage" },
    { name: "Thai Massage", price: 95, duration: "75 min", image: serviceImages.massage, category: "Massage" },
    { name: "Body Scrub & Wrap", price: 130, duration: "90 min", image: serviceImages.massage, category: "Spa" },
    { name: "Luxury Manicure", price: 40, duration: "40 min", image: serviceImages.nails, category: "Nails" },
    { name: "Luxury Pedicure", price: 50, duration: "50 min", image: serviceImages.nails, category: "Nails" },
    { name: "Organic Color", price: 100, duration: "90 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Scalp Detox", price: 55, duration: "40 min", image: serviceImages.massage, category: "Hair Treatment" }
  ],
  "8": [
    { name: "Trendy Cut", price: 38, duration: "30 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Undercut Design", price: 45, duration: "40 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Vivid Color", price: 120, duration: "120 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Pastel Tones", price: 140, duration: "150 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Creative Braids", price: 65, duration: "60 min", image: serviceImages.haircut, category: "Hair Styling" },
    { name: "Festival Makeup", price: 55, duration: "45 min", image: serviceImages.facialMakeup, category: "Make Up" },
    { name: "Nail Art", price: 50, duration: "60 min", image: serviceImages.nails, category: "Nails" },
    { name: "Express Facial", price: 40, duration: "30 min", image: serviceImages.facial, category: "Facial" },
    { name: "Head & Neck Massage", price: 35, duration: "25 min", image: serviceImages.massage, category: "Massage" }
  ]
};
var salonPackages = {
  "1": [
    { name: "Signature Glam", price: 85, originalPrice: 110, services: ["Precision Haircut", "Blow Dry & Style", "Classic Facial"], image: serviceImages.haircut },
    { name: "Color & Care", price: 160, originalPrice: 205, services: ["Full Hair Color", "Deep Conditioning", "Relaxation Massage"], image: serviceImages.hairColor },
    { name: "Bridal Package", price: 280, originalPrice: 350, services: ["Balayage Highlights", "Bridal Makeup", "Gel Manicure", "Spa Pedicure"], image: serviceImages.facialMakeup }
  ],
  "2": [
    { name: "Quick Refresh", price: 70, originalPrice: 90, services: ["Women's Haircut", "Hydrating Facial", "Eyebrow Threading"], image: serviceImages.haircut },
    { name: "Color Queen", price: 170, originalPrice: 215, services: ["Ombre Color", "Keratin Treatment"], image: serviceImages.hairColor },
    { name: "Total Makeover", price: 220, originalPrice: 280, services: ["Women's Haircut", "Evening Makeup", "Acrylic Nails", "Swedish Massage"], image: serviceImages.facialMakeup }
  ],
  "3": [
    { name: "Gentleman's Classic", price: 50, originalPrice: 65, services: ["Classic Haircut", "Hot Towel Shave", "Head Massage"], image: serviceImages.haircut },
    { name: "Sharp & Clean", price: 65, originalPrice: 82, services: ["Fade & Design", "Beard Trim", "Straight Razor Lineup"], image: serviceImages.haircut },
    { name: "Executive Grooming", price: 95, originalPrice: 120, services: ["Hair & Beard Combo", "Scalp Treatment", "Gray Blending"], image: serviceImages.hairColor }
  ],
  "4": [
    { name: "Royal Treatment", price: 200, originalPrice: 260, services: ["Luxury Haircut", "Diamond Facial", "Aromatherapy Massage"], image: serviceImages.facial },
    { name: "Gold Experience", price: 280, originalPrice: 355, services: ["Full Color & Gloss", "Gold Mask Treatment", "Deluxe Manicure"], image: serviceImages.hairColor },
    { name: "Ultimate Indulgence", price: 350, originalPrice: 440, services: ["Luxury Haircut", "Hot Stone Massage", "Lash Extensions", "Deluxe Pedicure"], image: serviceImages.massage }
  ],
  "5": [
    { name: "Quick Trim", price: 42, originalPrice: 55, services: ["Men's Haircut", "Beard Sculpting", "Scalp Massage"], image: serviceImages.haircut },
    { name: "Fresh Fade", price: 55, originalPrice: 72, services: ["Skin Fade", "Razor Shave", "Face Mask"], image: serviceImages.haircut },
    { name: "Style Master", price: 80, originalPrice: 100, services: ["Hair Design", "Color Camo", "Scalp Massage"], image: serviceImages.hairColor }
  ],
  "6": [
    { name: "Family Bundle", price: 45, originalPrice: 55, services: ["Family Haircut", "Children's Cut"], image: serviceImages.haircut },
    { name: "Pamper Day", price: 100, originalPrice: 125, services: ["Family Haircut", "Express Facial", "Classic Manicure", "Classic Pedicure"], image: serviceImages.facial },
    { name: "Full Glow Up", price: 150, originalPrice: 195, services: ["Highlights", "Quick Makeup", "Classic Manicure", "Back & Shoulder Massage"], image: serviceImages.hairColor }
  ],
  "7": [
    { name: "Zen Retreat", price: 180, originalPrice: 230, services: ["Anti-Aging Facial", "Deep Tissue Massage", "Scalp Detox"], image: serviceImages.massage },
    { name: "Beauty & Bliss", price: 150, originalPrice: 190, services: ["Signature Haircut", "Vitamin C Facial", "Luxury Manicure"], image: serviceImages.facial },
    { name: "Total Wellness", price: 320, originalPrice: 410, services: ["Thai Massage", "Body Scrub & Wrap", "Luxury Pedicure", "Organic Color"], image: serviceImages.massage }
  ],
  "8": [
    { name: "Street Style", price: 75, originalPrice: 95, services: ["Trendy Cut", "Undercut Design", "Head & Neck Massage"], image: serviceImages.haircut },
    { name: "Color Pop", price: 180, originalPrice: 225, services: ["Vivid Color", "Creative Braids", "Express Facial"], image: serviceImages.hairColor },
    { name: "Festival Ready", price: 220, originalPrice: 285, services: ["Pastel Tones", "Festival Makeup", "Nail Art"], image: serviceImages.facialMakeup }
  ]
};
var salonSpecialists = {
  "1": [
    { name: "James Rivera", role: "Senior Stylist", image: specialistImages[0], rating: 4.9 },
    { name: "Lisa Park", role: "Color Specialist", image: specialistImages[1], rating: 4.8 },
    { name: "Daniel Brooks", role: "Makeup Artist", image: specialistImages[2], rating: 4.7 },
    { name: "Sophie Laurent", role: "Nail Technician", image: specialistImages[3], rating: 4.9 },
    { name: "Marcus Chen", role: "Massage Therapist", image: specialistImages[4], rating: 4.8 }
  ],
  "2": [
    { name: "Natasha Petrov", role: "Lead Stylist", image: specialistImages[5], rating: 4.8 },
    { name: "Oliver Grant", role: "Hair Colorist", image: specialistImages[0], rating: 4.7 },
    { name: "Mia Tanaka", role: "Esthetician", image: specialistImages[1], rating: 4.9 },
    { name: "Rafael Santos", role: "Makeup Artist", image: specialistImages[2], rating: 4.6 },
    { name: "Hannah Kim", role: "Nail Artist", image: specialistImages[3], rating: 4.8 }
  ],
  "3": [
    { name: "Victor Stone", role: "Master Barber", image: specialistImages[4], rating: 4.9 },
    { name: "Tony DeMarco", role: "Senior Barber", image: specialistImages[0], rating: 4.8 },
    { name: "Adrian Wells", role: "Fade Specialist", image: specialistImages[2], rating: 4.9 },
    { name: "Jamal Washington", role: "Beard Expert", image: specialistImages[4], rating: 4.7 }
  ],
  "4": [
    { name: "Camille Dubois", role: "Luxury Stylist", image: specialistImages[5], rating: 4.9 },
    { name: "Edward Kingsley", role: "Spa Director", image: specialistImages[0], rating: 4.8 },
    { name: "Priya Sharma", role: "Esthetician", image: specialistImages[1], rating: 4.9 },
    { name: "Nicolas Blanc", role: "Massage Specialist", image: specialistImages[2], rating: 4.7 },
    { name: "Isabella Romano", role: "Lash Technician", image: specialistImages[3], rating: 4.8 }
  ],
  "5": [
    { name: "Derek Coleman", role: "Head Barber", image: specialistImages[4], rating: 4.7 },
    { name: "Ryan O'Brien", role: "Fade Artist", image: specialistImages[0], rating: 4.6 },
    { name: "Kai Nakamura", role: "Style Expert", image: specialistImages[2], rating: 4.5 },
    { name: "Andre Mitchell", role: "Beard Specialist", image: specialistImages[4], rating: 4.8 }
  ],
  "6": [
    { name: "Maria Gonzalez", role: "Family Stylist", image: specialistImages[5], rating: 4.8 },
    { name: "David Thompson", role: "Senior Barber", image: specialistImages[0], rating: 4.7 },
    { name: "Jenny Liu", role: "Kids Specialist", image: specialistImages[1], rating: 4.9 },
    { name: "Carlos Mendez", role: "Colorist", image: specialistImages[2], rating: 4.6 },
    { name: "Sarah Bennett", role: "Nail Technician", image: specialistImages[3], rating: 4.8 }
  ],
  "7": [
    { name: "Dr. Anita Patel", role: "Spa Therapist", image: specialistImages[5], rating: 4.9 },
    { name: "Liam Fitzgerald", role: "Senior Stylist", image: specialistImages[0], rating: 4.8 },
    { name: "Yuki Yamamoto", role: "Massage Expert", image: specialistImages[1], rating: 4.9 },
    { name: "Omar Hassan", role: "Hair Colorist", image: specialistImages[2], rating: 4.7 },
    { name: "Elena Volkov", role: "Esthetician", image: specialistImages[3], rating: 4.9 }
  ],
  "8": [
    { name: "Zoe Martinez", role: "Creative Director", image: specialistImages[5], rating: 4.6 },
    { name: "Ash Keller", role: "Color Innovator", image: specialistImages[0], rating: 4.5 },
    { name: "Luna Chang", role: "Braid Specialist", image: specialistImages[1], rating: 4.7 },
    { name: "Raven Black", role: "Nail Artist", image: specialistImages[3], rating: 4.4 },
    { name: "Jake Nolan", role: "Trend Stylist", image: specialistImages[4], rating: 4.5 }
  ]
};
var salonReviews = {
  "1": [
    { userName: "Sarah Johnson", userImage: reviewerImages[0], rating: 5, comment: "Absolutely love Belle Curls! My balayage turned out stunning and the team was so attentive.", date: "2 days ago" },
    { userName: "Michelle Lee", userImage: reviewerImages[1], rating: 5, comment: "Best facial I've ever had. My skin is glowing! Will definitely be back.", date: "5 days ago" },
    { userName: "Robert Chen", userImage: reviewerImages[2], rating: 4, comment: "Great haircut and very relaxing atmosphere. Prices are a bit high but worth it.", date: "1 week ago" },
    { userName: "Amanda Foster", userImage: reviewerImages[3], rating: 5, comment: "My bridal makeup was flawless. Everyone at the wedding commented on how beautiful I looked!", date: "2 weeks ago" },
    { userName: "David Kim", userImage: reviewerImages[4], rating: 4, comment: "Clean salon, professional staff. The massage was incredibly relaxing.", date: "3 weeks ago" },
    { userName: "Jessica Brown", userImage: reviewerImages[5], rating: 5, comment: "Sophie did an amazing job on my nails. So detailed and long-lasting!", date: "1 month ago" }
  ],
  "2": [
    { userName: "Emily Watson", userImage: reviewerImages[1], rating: 5, comment: "Natasha is a genius with color! My ombre looks so natural and beautiful.", date: "1 day ago" },
    { userName: "Chris Taylor", userImage: reviewerImages[2], rating: 4, comment: "Nice ambiance and friendly staff. The keratin treatment made my hair silky smooth.", date: "4 days ago" },
    { userName: "Nicole Garcia", userImage: reviewerImages[3], rating: 5, comment: "Got my daughter's first haircut here. They were so patient and sweet with her!", date: "1 week ago" },
    { userName: "Mark Patterson", userImage: reviewerImages[0], rating: 4, comment: "Solid haircut and good conversation. Reasonable prices for the quality.", date: "2 weeks ago" },
    { userName: "Laura Martinez", userImage: reviewerImages[4], rating: 5, comment: "The Swedish massage melted all my stress away. Hannah's nail work is art!", date: "3 weeks ago" }
  ],
  "3": [
    { userName: "Tony Moretti", userImage: reviewerImages[5], rating: 5, comment: "Best barbershop in NYC, hands down. Victor gave me the cleanest fade I've ever had.", date: "3 days ago" },
    { userName: "Brandon Harris", userImage: reviewerImages[0], rating: 5, comment: "The hot towel shave is an experience every man needs. Old-school quality at its finest.", date: "1 week ago" },
    { userName: "Michael Brooks", userImage: reviewerImages[2], rating: 5, comment: "Been coming here for years. Consistent, quality work every single time.", date: "2 weeks ago" },
    { userName: "Jason Lee", userImage: reviewerImages[4], rating: 4, comment: "Great barbers but it can get crowded on weekends. Book ahead if you can.", date: "3 weeks ago" },
    { userName: "Kevin Wright", userImage: reviewerImages[1], rating: 5, comment: "Adrian did an incredible design on my fade. Getting compliments everywhere!", date: "1 month ago" },
    { userName: "Samuel Carter", userImage: reviewerImages[3], rating: 5, comment: "My go-to spot for a clean lineup. Professional and efficient every time.", date: "1 month ago" }
  ],
  "4": [
    { userName: "Victoria Palmer", userImage: reviewerImages[3], rating: 5, comment: "The Gold Mask Treatment was divine. My skin feels 10 years younger!", date: "2 days ago" },
    { userName: "Catherine Blake", userImage: reviewerImages[1], rating: 5, comment: "Hot stone massage was absolutely heavenly. The ambiance is so luxurious.", date: "5 days ago" },
    { userName: "Richard Sterling", userImage: reviewerImages[2], rating: 4, comment: "Premium experience with premium prices. You get what you pay for here.", date: "1 week ago" },
    { userName: "Diana Ross", userImage: reviewerImages[4], rating: 5, comment: "Camille is the best stylist I've ever had. She understands exactly what I want.", date: "2 weeks ago" },
    { userName: "William Hayes", userImage: reviewerImages[0], rating: 4, comment: "Excellent service and beautiful space. Lash extensions look very natural.", date: "1 month ago" }
  ],
  "5": [
    { userName: "Jake Morrison", userImage: reviewerImages[0], rating: 5, comment: "Derek gives the best fades in the city. Quick, clean, and affordable.", date: "1 day ago" },
    { userName: "Tyler Nash", userImage: reviewerImages[2], rating: 4, comment: "Good barbershop with a cool modern vibe. The face mask was a nice touch.", date: "3 days ago" },
    { userName: "Eric Simmons", userImage: reviewerImages[5], rating: 5, comment: "Been to many barbers but The Razor Edge is something special. Highly recommend!", date: "1 week ago" },
    { userName: "Nathan Cole", userImage: reviewerImages[4], rating: 4, comment: "Solid haircut at a fair price. The guys here really know their craft.", date: "2 weeks ago" },
    { userName: "Alex Turner", userImage: reviewerImages[1], rating: 4, comment: "My beard has never looked this good. Andre is a true beard specialist.", date: "3 weeks ago" },
    { userName: "Ben Cooper", userImage: reviewerImages[3], rating: 5, comment: "Kai gave me exactly the style I wanted. Great attention to detail.", date: "1 month ago" }
  ],
  "6": [
    { userName: "Angela Torres", userImage: reviewerImages[3], rating: 5, comment: "We bring the whole family here! Maria is wonderful with the kids.", date: "2 days ago" },
    { userName: "Patricia Nguyen", userImage: reviewerImages[1], rating: 5, comment: "Affordable and high quality. My highlights look amazing! Best value in the area.", date: "4 days ago" },
    { userName: "Thomas Green", userImage: reviewerImages[0], rating: 4, comment: "Good neighborhood salon. David always gives me a great cut.", date: "1 week ago" },
    { userName: "Linda Chang", userImage: reviewerImages[4], rating: 5, comment: "Jenny is the best with kids' haircuts. My toddler actually enjoyed it!", date: "2 weeks ago" },
    { userName: "George Miller", userImage: reviewerImages[2], rating: 4, comment: "Friendly staff and clean shop. The back massage was a nice surprise bonus.", date: "3 weeks ago" },
    { userName: "Rosa Hernandez", userImage: reviewerImages[5], rating: 5, comment: "Love this place! The whole family leaves happy every single visit.", date: "1 month ago" }
  ],
  "7": [
    { userName: "Sophia Anderson", userImage: reviewerImages[4], rating: 5, comment: "The deep tissue massage was transformative. Dr. Patel has healing hands.", date: "1 day ago" },
    { userName: "Olivia White", userImage: reviewerImages[1], rating: 5, comment: "Best spa experience in the city! The body scrub and wrap left me feeling reborn.", date: "3 days ago" },
    { userName: "Emma Davis", userImage: reviewerImages[3], rating: 5, comment: "The anti-aging facial is worth every penny. Visible results after just one session!", date: "1 week ago" },
    { userName: "James Foster", userImage: reviewerImages[0], rating: 4, comment: "Liam gave me an excellent haircut. The whole spa atmosphere is very calming.", date: "2 weeks ago" },
    { userName: "Rachel Kim", userImage: reviewerImages[5], rating: 5, comment: "Yuki's Thai massage is absolutely incredible. I come back every month now.", date: "3 weeks ago" },
    { userName: "Daniel Park", userImage: reviewerImages[2], rating: 5, comment: "Organic color turned out beautifully. Elena's facials are magical too.", date: "1 month ago" }
  ],
  "8": [
    { userName: "Megan Scott", userImage: reviewerImages[4], rating: 5, comment: "Zoe is a creative genius! My vivid purple turned out insanely good.", date: "1 day ago" },
    { userName: "Riley Jackson", userImage: reviewerImages[1], rating: 4, comment: "Trendy salon with great energy. The undercut design was exactly what I wanted.", date: "3 days ago" },
    { userName: "Taylor Brooks", userImage: reviewerImages[3], rating: 4, comment: "Love the vibe here. Pastel tones came out perfectly. A bit pricey though.", date: "1 week ago" },
    { userName: "Jordan Price", userImage: reviewerImages[0], rating: 5, comment: "Luna's braids are absolute works of art. Got so many compliments at the festival!", date: "2 weeks ago" },
    { userName: "Casey Miller", userImage: reviewerImages[2], rating: 4, comment: "Cool spot with talented stylists. Nail art by Raven was stunning.", date: "3 weeks ago" },
    { userName: "Morgan Ellis", userImage: reviewerImages[5], rating: 4, comment: "Great atmosphere and music. Jake nailed the trendy cut I was going for.", date: "1 month ago" }
  ]
};
async function seedDatabase() {
  if (process.env.FORCE_SEED !== "true") {
    const existingSalons = await db.select().from(salons).limit(1);
    if (existingSalons.length > 0) {
      console.log("Database already contains data, skipping seed. Use FORCE_SEED=true to override.");
      return;
    }
  }
  console.log("Seeding database...");
  await db.delete(bookings);
  await db.delete(messages);
  await db.delete(coupons);
  await db.delete(reviews);
  await db.delete(specialists);
  await db.delete(packages);
  await db.delete(services);
  await db.delete(salons);
  await db.delete(users);
  const bcrypt3 = require("bcryptjs");
  const adminPassword = await bcrypt3.hash("admin123", 10);
  await db.insert(users).values({
    id: "00000000-0000-0000-0000-000000000000",
    fullName: "Admin User",
    email: "admin@barber.com",
    password: adminPassword,
    role: "admin",
    loyaltyPoints: 1e3,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
  });
  await db.insert(salons).values(salonData);
  for (const salon of salonData) {
    const sId = salon.id;
    const svcData = salonServices[sId];
    if (svcData) {
      await db.insert(services).values(
        svcData.map((s, i) => ({ id: `${sId}_s${i + 1}`, salonId: sId, ...s }))
      );
    }
    const pkgData = salonPackages[sId];
    if (pkgData) {
      await db.insert(packages).values(
        pkgData.map((p, i) => ({ id: `${sId}_p${i + 1}`, salonId: sId, ...p }))
      );
    }
    const specData = salonSpecialists[sId];
    if (specData) {
      await db.insert(specialists).values(
        specData.map((sp, i) => ({ id: `${sId}_sp${i + 1}`, salonId: sId, ...sp }))
      );
    }
    const revData = salonReviews[sId];
    if (revData) {
      await db.insert(reviews).values(
        revData.map((r, i) => ({ id: `${sId}_r${i + 1}`, salonId: sId, ...r }))
      );
    }
  }
  const couponData = [
    { code: "WELCOME10", discount: 10, type: "percentage", expiryDate: "2025-12-31", usageLimit: 100, active: true },
    { code: "SAVE5", discount: 5, type: "fixed", expiryDate: "2025-06-30", usageLimit: 50, active: true }
  ];
  await db.insert(coupons).values(couponData);
  const messageData = [
    { userId: "00000000-0000-0000-0000-000000000000", salonId: "1", salonName: "Belle Curls", content: "Hello, I have a question about my booking.", sender: "user" },
    { userId: "00000000-0000-0000-0000-000000000000", salonId: "1", salonName: "Belle Curls", content: "Sure, how can we help you?", sender: "salon" }
  ];
  await db.insert(messages).values(messageData);
  const bookingData = [
    {
      userId: "00000000-0000-0000-0000-000000000000",
      salonId: "1",
      salonName: "Belle Curls",
      salonImage: "",
      services: ["Precision Haircut"],
      date: "2025-03-01",
      time: "10:00 AM",
      totalPrice: 35,
      status: "completed",
      paymentMethod: "cash"
    },
    {
      userId: "00000000-0000-0000-0000-000000000000",
      salonId: "2",
      salonName: "Pretty Parlour",
      salonImage: "",
      services: ["Women's Haircut"],
      date: "2025-03-02",
      time: "11:00 AM",
      totalPrice: 40,
      status: "pending",
      paymentMethod: "card"
    }
  ];
  await db.insert(bookings).values(bookingData);
  console.log("Database seeded successfully!");
}

// server/storage.ts
var import_crypto2 = __toESM(require("crypto"));
var import_drizzle_orm = require("drizzle-orm");
var import_bcryptjs = __toESM(require("bcryptjs"));
async function createUser(data) {
  const hashed = await import_bcryptjs.default.hash(data.password, 10);
  const id = import_crypto2.default.randomUUID();
  await db.insert(users).values({ ...data, password: hashed, id });
  const [user] = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.id, id));
  return user;
}
async function getUserByEmail(email) {
  const [user] = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.email, email));
  return user;
}
async function getUserById(id) {
  const [user] = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.id, id));
  return user;
}
async function updateUser(id, data) {
  await db.update(users).set(data).where((0, import_drizzle_orm.eq)(users.id, id));
  const [user] = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.id, id));
  return user;
}
async function verifyPassword(plaintext, hashed) {
  return import_bcryptjs.default.compare(plaintext, hashed);
}
async function getAllSalons() {
  return db.select().from(salons);
}
async function getSalonById(id) {
  const [salon] = await db.select().from(salons).where((0, import_drizzle_orm.eq)(salons.id, id));
  return salon;
}
async function searchSalons(query) {
  return db.select().from(salons).where(
    (0, import_drizzle_orm.or)((0, import_drizzle_orm.like)(salons.name, `%${query}%`), (0, import_drizzle_orm.like)(salons.address, `%${query}%`))
  );
}
async function getSalonServices(salonId) {
  return db.select().from(services).where((0, import_drizzle_orm.eq)(services.salonId, salonId));
}
async function getSalonsByCategory(category) {
  const matchingServices = await db.select({ salonId: services.salonId }).from(services).where((0, import_drizzle_orm.like)(services.category, category));
  const salonIds = [...new Set(matchingServices.map((s) => s.salonId))];
  if (salonIds.length === 0) return [];
  return db.select().from(salons).where((0, import_drizzle_orm.inArray)(salons.id, salonIds));
}
async function getSalonPackages(salonId) {
  return db.select().from(packages).where((0, import_drizzle_orm.eq)(packages.salonId, salonId));
}
async function getSalonSpecialists(salonId) {
  return db.select().from(specialists).where((0, import_drizzle_orm.eq)(specialists.salonId, salonId));
}
async function getSalonReviews(salonId) {
  return db.select().from(reviews).where((0, import_drizzle_orm.eq)(reviews.salonId, salonId));
}
async function createReview(data) {
  const id = import_crypto2.default.randomUUID();
  await db.insert(reviews).values({ ...data, date: "Just now", id });
  const [review] = await db.select().from(reviews).where((0, import_drizzle_orm.eq)(reviews.id, id));
  return review;
}
async function getUserBookings(userId) {
  return db.select().from(bookings).where((0, import_drizzle_orm.eq)(bookings.userId, userId)).orderBy((0, import_drizzle_orm.desc)(bookings.createdAt));
}
async function createBooking(data) {
  const id = import_crypto2.default.randomUUID();
  await db.insert(bookings).values({ ...data, id });
  const [booking] = await db.select().from(bookings).where((0, import_drizzle_orm.eq)(bookings.id, id));
  return booking;
}
async function cancelBooking(id, userId) {
  await db.update(bookings).set({ status: "cancelled" }).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(bookings.id, id), (0, import_drizzle_orm.eq)(bookings.userId, userId)));
  const [booking] = await db.select().from(bookings).where((0, import_drizzle_orm.eq)(bookings.id, id));
  return booking;
}
async function getUserBookmarks(userId) {
  const bm = await db.select().from(bookmarkTable).where((0, import_drizzle_orm.eq)(bookmarkTable.userId, userId));
  return bm.map((b) => b.salonId);
}
async function toggleBookmark(userId, salonId) {
  const [existing] = await db.select().from(bookmarkTable).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(bookmarkTable.userId, userId), (0, import_drizzle_orm.eq)(bookmarkTable.salonId, salonId)));
  if (existing) {
    await db.delete(bookmarkTable).where((0, import_drizzle_orm.eq)(bookmarkTable.id, existing.id));
    return false;
  } else {
    await db.insert(bookmarkTable).values({ userId, salonId });
    return true;
  }
}
async function getUserMessages(userId) {
  return db.select().from(messages).where((0, import_drizzle_orm.eq)(messages.userId, userId)).orderBy((0, import_drizzle_orm.desc)(messages.createdAt));
}
async function getConversation(userId, salonId) {
  return db.select().from(messages).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(messages.userId, userId), (0, import_drizzle_orm.eq)(messages.salonId, salonId))).orderBy(messages.createdAt);
}
async function sendMessage(data) {
  const id = import_crypto2.default.randomUUID();
  await db.insert(messages).values({ ...data, id });
  const [msg] = await db.select().from(messages).where((0, import_drizzle_orm.eq)(messages.id, id));
  return msg;
}
async function getUserNotifications(userId) {
  return db.select().from(notifications).where((0, import_drizzle_orm.eq)(notifications.userId, userId)).orderBy((0, import_drizzle_orm.desc)(notifications.createdAt));
}
async function markNotificationRead(id, userId) {
  await db.update(notifications).set({ read: true }).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(notifications.id, id), (0, import_drizzle_orm.eq)(notifications.userId, userId)));
}
async function createNotification(data) {
  const id = import_crypto2.default.randomUUID();
  await db.insert(notifications).values({ ...data, id });
  const [notif] = await db.select().from(notifications).where((0, import_drizzle_orm.eq)(notifications.id, id));
  return notif;
}
async function getActiveCoupons() {
  const now = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  return db.select().from(coupons).where(
    (0, import_drizzle_orm.and)(
      (0, import_drizzle_orm.eq)(coupons.active, true),
      import_drizzle_orm.sql`${coupons.expiryDate} >= ${now}`
    )
  );
}
async function getCouponByCode(code) {
  const [coupon] = await db.select().from(coupons).where((0, import_drizzle_orm.eq)(import_drizzle_orm.sql`upper(${coupons.code})`, code.toUpperCase()));
  return coupon;
}
async function updateCouponUsage(id) {
  await db.update(coupons).set({ usedCount: import_drizzle_orm.sql`${coupons.usedCount} + 1` }).where((0, import_drizzle_orm.eq)(coupons.id, id));
}

// server/stripeClient.ts
var import_stripe = __toESM(require("stripe"));
var connectionSettings;
async function getCredentials() {
  if (process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY) {
    return {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY
    };
  }
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("Stripe credentials not found. Set STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY in .env for local development.");
  }
  const connectorName = "stripe";
  const isProduction = process.env.REPLIT_DEPLOYMENT === "1";
  const targetEnvironment = isProduction ? "production" : "development";
  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set("include_secrets", "true");
  url.searchParams.set("connector_names", connectorName);
  url.searchParams.set("environment", targetEnvironment);
  const response = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
      "X-Replit-Token": xReplitToken
    }
  });
  const data = await response.json();
  connectionSettings = data.items?.[0];
  if (!connectionSettings || (!connectionSettings.settings.publishable || !connectionSettings.settings.secret)) {
    throw new Error(`Stripe ${targetEnvironment} connection not found`);
  }
  return {
    publishableKey: connectionSettings.settings.publishable,
    secretKey: connectionSettings.settings.secret
  };
}
async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();
  return new import_stripe.default(secretKey);
}
async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}
async function getStripeSync() {
  return null;
}

// server/adminRoutes.ts
var import_crypto3 = __toESM(require("crypto"));
var import_drizzle_orm2 = require("drizzle-orm");
var import_bcryptjs2 = __toESM(require("bcryptjs"));
var import_multer = __toESM(require("multer"));
var import_path2 = __toESM(require("path"));
var import_fs = __toESM(require("fs"));

// server/activityLogger.ts
async function logActivity(params) {
  try {
    await db.insert(activityLogs).values({
      userId: params.userId || "",
      userRole: params.userRole || "",
      action: params.action,
      entityType: params.entityType || "",
      entityId: params.entityId || "",
      metadata: params.metadata || {}
    });
  } catch {
  }
}

// server/adminRoutes.ts
var import_os = __toESM(require("os"));
async function requireSuperAdmin(req, res, next) {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  const [user] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, userId));
  if (!user || user.role !== "super_admin" && user.role !== "admin") {
    return res.status(403).json({ message: "Super admin access required" });
  }
  req.currentUser = user;
  next();
}
async function requireSalonAdmin(req, res, next) {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  const [user] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, userId));
  if (!user || user.role !== "salon_admin") {
    return res.status(403).json({ message: "Salon admin access required" });
  }
  const [link] = await db.select().from(salonStaff).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(salonStaff.userId, userId), (0, import_drizzle_orm2.eq)(salonStaff.role, "salon_admin")));
  if (!link) return res.status(403).json({ message: "No salon linked to this admin" });
  const [salon] = await db.select().from(salons).where((0, import_drizzle_orm2.eq)(salons.id, link.salonId));
  if (salon && salon.status === "deactivated") {
    return res.status(403).json({ message: "Your salon has been deactivated. Contact support." });
  }
  req.currentUser = user;
  req.salonId = link.salonId;
  next();
}
async function requireStaff(req, res, next) {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  const [user] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, userId));
  if (!user || user.role !== "staff") {
    return res.status(403).json({ message: "Staff access required" });
  }
  const [link] = await db.select().from(salonStaff).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(salonStaff.userId, userId), (0, import_drizzle_orm2.eq)(salonStaff.role, "staff")));
  req.currentUser = user;
  req.salonId = link?.salonId || "";
  next();
}
function getPagination(req) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
function registerAdminRoutes(app2) {
  const uploadsDir = import_path2.default.join(process.cwd(), "public", "uploads");
  if (!import_fs.default.existsSync(uploadsDir)) import_fs.default.mkdirSync(uploadsDir, { recursive: true });
  const storage = import_multer.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + import_path2.default.extname(file.originalname));
    }
  });
  const upload = (0, import_multer.default)({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
  app2.get("/api/admin/stats", requireSuperAdmin, async (req, res) => {
    try {
      const [usersCount] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(users);
      const [salonsCount] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(salons);
      const [bookingsCount] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(bookings);
      const [revenue] = await db.select({ sum: import_drizzle_orm2.sql`coalesce(sum(${bookings.totalPrice}),0)` }).from(bookings);
      const [couponsCount] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(coupons);
      const [servicesCount] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(services);
      const [messagesCount] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(messages);
      const [pendingBookings] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(bookings).where((0, import_drizzle_orm2.eq)(bookings.status, "pending"));
      const [completedBookings] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(bookings).where((0, import_drizzle_orm2.eq)(bookings.status, "completed"));
      const [activeSubscriptions] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(subscriptions).where((0, import_drizzle_orm2.eq)(subscriptions.status, "active"));
      const [commissionTotal] = await db.select({ sum: import_drizzle_orm2.sql`coalesce(sum(${commissions.amount}),0)` }).from(commissions);
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
        totalCommissions: Number(commissionTotal.sum) || 0
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/weekly-activity", requireSuperAdmin, async (_req, res) => {
    try {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const now = /* @__PURE__ */ new Date();
      const weekData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const [count] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(bookings).where((0, import_drizzle_orm2.eq)(bookings.date, dateStr));
        weekData.push({ name: days[date.getDay()], bookings: Number(count.count) || 0, date: dateStr });
      }
      res.json(weekData);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/system-health", requireSuperAdmin, async (req, res) => {
    const start = Date.now();
    let dbStatus = "ok";
    let dbLatency = 0;
    try {
      const t0 = Date.now();
      await db.execute(import_drizzle_orm2.sql`SELECT 1`);
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
      totalMemoryMB: Math.round(import_os.default.totalmem() / 1024 / 1024),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.get("/api/admin/users", requireSuperAdmin, async (req, res) => {
    try {
      const { page, limit, offset } = getPagination(req);
      const [countResult] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(users);
      const allUsers = await db.select().from(users).limit(limit).offset(offset).orderBy((0, import_drizzle_orm2.desc)(users.createdAt));
      res.json({ data: allUsers, total: Number(countResult.count), page, limit });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/users", requireSuperAdmin, async (req, res) => {
    try {
      const { fullName, email, password, role } = req.body;
      const hashed = await import_bcryptjs2.default.hash(password || "password123", 10);
      const userId = import_crypto3.default.randomUUID();
      await db.insert(users).values({ fullName, email, password: hashed, role: role || "user", id: userId });
      const [user] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, userId));
      await logActivity({ userId: req.currentUser?.id, userRole: "super_admin", action: "user.created", entityType: "user", entityId: user.id });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/users/:id", requireSuperAdmin, async (req, res) => {
    try {
      const { fullName, email, role } = req.body;
      await db.update(users).set({ fullName, email, role }).where((0, import_drizzle_orm2.eq)(users.id, String(req.params.id)));
      const [user] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, String(req.params.id)));
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/users/:id", requireSuperAdmin, async (req, res) => {
    try {
      const targetId = String(req.params.id);
      const currentUserId = req.currentUser?.id;
      if (targetId === currentUserId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      const [target] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, targetId));
      if (target?.role === "super_admin" && target.id !== currentUserId) {
        return res.status(403).json({ message: "Cannot delete another super admin" });
      }
      await db.delete(users).where((0, import_drizzle_orm2.eq)(users.id, targetId));
      await logActivity({ userId: currentUserId, userRole: "super_admin", action: "user.deleted", entityType: "user", entityId: targetId });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/salons", requireSuperAdmin, async (_req, res) => {
    try {
      const allSalons = await db.select().from(salons);
      const allStaff = await db.select().from(salonStaff);
      const allUsers = await db.select({ id: users.id, email: users.email, fullName: users.fullName }).from(users);
      const result = allSalons.map((s) => {
        const ownerEntry = allStaff.find((st) => st.salonId === s.id && st.role === "salon_admin") || (s.ownerId ? { userId: s.ownerId } : null);
        const owner = ownerEntry ? allUsers.find((u) => u.id === ownerEntry.userId) : null;
        return { ...s, ownerEmail: owner?.email || "", ownerName: owner?.fullName || "" };
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/salons", requireSuperAdmin, async (req, res) => {
    try {
      const { ownerEmail, ...salonData2 } = req.body;
      if (ownerEmail) {
        const [ownerUser] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.email, ownerEmail)).limit(1);
        if (!ownerUser) return res.status(400).json({ message: `No user found with email "${ownerEmail}". Ask them to register first.` });
        salonData2.ownerId = ownerUser.id;
      }
      const salonId2 = import_crypto3.default.randomUUID();
      await db.insert(salons).values({ ...salonData2, id: salonId2 });
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm2.eq)(salons.id, salonId2));
      if (salonData2.ownerId) {
        const existing = await db.select().from(salonStaff).where((0, import_drizzle_orm2.eq)(salonStaff.salonId, salon.id)).limit(1);
        if (existing.length === 0) {
          await db.insert(salonStaff).values({ salonId: salon.id, userId: salonData2.ownerId, role: "salon_admin" });
        }
      }
      await logActivity({ userId: req.currentUser?.id, userRole: "super_admin", action: "salon.created", entityType: "salon", entityId: salon.id, metadata: { name: salon.name } });
      res.json(salon);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/salons/:id", requireSuperAdmin, async (req, res) => {
    try {
      const salonId = String(req.params.id);
      const { ownerEmail, ...salonData2 } = req.body;
      if (ownerEmail !== void 0) {
        if (ownerEmail === "") {
          salonData2.ownerId = null;
          await db.delete(salonStaff).where((0, import_drizzle_orm2.eq)(salonStaff.salonId, salonId));
        } else {
          const [ownerUser] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.email, ownerEmail)).limit(1);
          if (!ownerUser) return res.status(400).json({ message: `No user found with email "${ownerEmail}". Ask them to register first.` });
          salonData2.ownerId = ownerUser.id;
          const existing = await db.select().from(salonStaff).where((0, import_drizzle_orm2.eq)(salonStaff.salonId, salonId)).limit(1);
          if (existing.length === 0) {
            await db.insert(salonStaff).values({ salonId, userId: ownerUser.id, role: "salon_admin" });
          } else {
            await db.update(salonStaff).set({ userId: ownerUser.id, role: "salon_admin" }).where((0, import_drizzle_orm2.eq)(salonStaff.salonId, salonId));
          }
        }
      }
      await db.update(salons).set(salonData2).where((0, import_drizzle_orm2.eq)(salons.id, salonId));
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm2.eq)(salons.id, salonId));
      if (req.body.status) {
        await logActivity({ userId: req.currentUser?.id, userRole: "super_admin", action: `salon.${req.body.status}`, entityType: "salon", entityId: salonId });
      }
      res.json(salon);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/salons/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(salons).where((0, import_drizzle_orm2.eq)(salons.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/salons/:id/create-default-account", requireSuperAdmin, async (req, res) => {
    try {
      const salonId = String(req.params.id);
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm2.eq)(salons.id, salonId));
      if (!salon) return res.status(404).json({ message: "Salon not found" });
      const slug = salon.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
      const email = `${slug}@barmagly.com`;
      const defaultPassword = "salon123";
      const existing = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.email, email)).limit(1);
      let user = existing[0];
      if (!user) {
        const hashed = await import_bcryptjs2.default.hash(defaultPassword, 10);
        const newUserId = import_crypto3.default.randomUUID();
        await db.insert(users).values({
          id: newUserId,
          fullName: salon.name,
          email,
          password: hashed,
          role: "salon_admin",
          phone: "",
          avatar: ""
        });
        const [created] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, newUserId));
        user = created;
      }
      const staffExisting = await db.select().from(salonStaff).where((0, import_drizzle_orm2.eq)(salonStaff.salonId, salonId)).limit(1);
      if (staffExisting.length === 0) {
        await db.insert(salonStaff).values({ salonId, userId: user.id, role: "salon_admin" });
      } else {
        await db.update(salonStaff).set({ userId: user.id, role: "salon_admin" }).where((0, import_drizzle_orm2.eq)(salonStaff.salonId, salonId));
      }
      await db.update(salons).set({ ownerId: user.id }).where((0, import_drizzle_orm2.eq)(salons.id, salonId));
      await logActivity({ userId: req.currentUser?.id, userRole: "super_admin", action: "salon.owner.created", entityType: "salon", entityId: salonId, metadata: { email } });
      res.json({ email, password: defaultPassword, userId: user.id });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/tenants", requireSuperAdmin, async (_req, res) => {
    try {
      const allSalons = await db.select().from(salons);
      const allStaff = await db.select().from(salonStaff);
      const allSubs = await db.select().from(subscriptions);
      const tenants = allSalons.map((s) => {
        const owner = allStaff.find((st) => st.salonId === s.id && st.role === "salon_admin");
        const sub = allSubs.find((su) => su.salonId === s.id && su.status === "active");
        return { ...s, ownerId: owner?.userId || "", hasActiveSubscription: !!sub, subscriptionStatus: sub?.status || "none" };
      });
      res.json(tenants);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/bookings", requireSuperAdmin, async (req, res) => {
    try {
      const { page, limit, offset } = getPagination(req);
      const [countResult] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(bookings);
      const all = await db.select().from(bookings).orderBy((0, import_drizzle_orm2.desc)(bookings.createdAt)).limit(limit).offset(offset);
      res.json({ data: all, total: Number(countResult.count), page, limit });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/bookings", requireSuperAdmin, async (req, res) => {
    try {
      const bookingId = import_crypto3.default.randomUUID();
      await db.insert(bookings).values({ ...req.body, status: req.body.status || "upcoming", id: bookingId });
      const [booking] = await db.select().from(bookings).where((0, import_drizzle_orm2.eq)(bookings.id, bookingId));
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/bookings/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(bookings).set(req.body).where((0, import_drizzle_orm2.eq)(bookings.id, String(req.params.id)));
      const [booking] = await db.select().from(bookings).where((0, import_drizzle_orm2.eq)(bookings.id, String(req.params.id)));
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/bookings/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(bookings).where((0, import_drizzle_orm2.eq)(bookings.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/coupons", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(coupons));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/coupons", requireSuperAdmin, async (req, res) => {
    try {
      const couponId = import_crypto3.default.randomUUID();
      await db.insert(coupons).values({ ...req.body, id: couponId });
      const [c] = await db.select().from(coupons).where((0, import_drizzle_orm2.eq)(coupons.id, couponId));
      res.json(c);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/coupons/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(coupons).set(req.body).where((0, import_drizzle_orm2.eq)(coupons.id, String(req.params.id)));
      const [c] = await db.select().from(coupons).where((0, import_drizzle_orm2.eq)(coupons.id, String(req.params.id)));
      res.json(c);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/coupons/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(coupons).where((0, import_drizzle_orm2.eq)(coupons.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/payments", requireSuperAdmin, async (_req, res) => {
    try {
      const payments = await db.select().from(bookings).where(import_drizzle_orm2.sql`${bookings.paymentMethod} != ''`);
      res.json(payments);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/messages", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(messages));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/messages/broadcast", requireSuperAdmin, async (req, res) => {
    try {
      const { targetUserId, content } = req.body;
      const adminIdentity = { salonId: "admin", salonName: "Barmagly Platform", salonImage: "" };
      if (targetUserId === "all") {
        const allUsers = await db.select().from(users);
        await Promise.all(allUsers.map(
          (u) => db.insert(messages).values({ userId: u.id, ...adminIdentity, content, sender: "salon" })
        ));
        res.json({ success: true, count: allUsers.length });
      } else {
        const msgId = import_crypto3.default.randomUUID();
        await db.insert(messages).values({ id: msgId, userId: targetUserId, ...adminIdentity, content, sender: "salon" });
        const [msg] = await db.select().from(messages).where((0, import_drizzle_orm2.eq)(messages.id, msgId));
        res.json(msg);
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/messages/reply", requireSuperAdmin, async (req, res) => {
    try {
      const { userId, salonId, salonName, salonImage, content } = req.body;
      const replyMsgId = import_crypto3.default.randomUUID();
      await db.insert(messages).values({ id: replyMsgId, userId, salonId, salonName, salonImage, content, sender: "salon" });
      const [msg] = await db.select().from(messages).where((0, import_drizzle_orm2.eq)(messages.id, replyMsgId));
      res.json(msg);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/settings", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(appSettings));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/settings", requireSuperAdmin, async (req, res) => {
    try {
      const { key, value, description } = req.body;
      const existing = await db.select().from(appSettings).where((0, import_drizzle_orm2.eq)(appSettings.key, key));
      if (existing.length > 0) {
        await db.update(appSettings).set({ value, description, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(appSettings.key, key));
      } else {
        await db.insert(appSettings).values({ key, value, description });
      }
      const [setting] = await db.select().from(appSettings).where((0, import_drizzle_orm2.eq)(appSettings.key, key));
      res.json(setting);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/services", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(services));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/services", requireSuperAdmin, async (req, res) => {
    try {
      const svcId = import_crypto3.default.randomUUID();
      await db.insert(services).values({ ...req.body, id: svcId });
      const [s] = await db.select().from(services).where((0, import_drizzle_orm2.eq)(services.id, svcId));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/services/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(services).set(req.body).where((0, import_drizzle_orm2.eq)(services.id, String(req.params.id)));
      const [s] = await db.select().from(services).where((0, import_drizzle_orm2.eq)(services.id, String(req.params.id)));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/services/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(services).where((0, import_drizzle_orm2.eq)(services.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/upload", requireSuperAdmin, upload.single("image"), (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No image file provided" });
      res.json({ url: `/uploads/${req.file.filename}` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/plans", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(plans));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/plans", requireSuperAdmin, async (req, res) => {
    try {
      const planId = import_crypto3.default.randomUUID();
      await db.insert(plans).values({ ...req.body, id: planId });
      const [plan] = await db.select().from(plans).where((0, import_drizzle_orm2.eq)(plans.id, planId));
      res.json(plan);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/plans/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(plans).set(req.body).where((0, import_drizzle_orm2.eq)(plans.id, String(req.params.id)));
      const [plan] = await db.select().from(plans).where((0, import_drizzle_orm2.eq)(plans.id, String(req.params.id)));
      res.json(plan);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/plans/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(plans).where((0, import_drizzle_orm2.eq)(plans.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/subscriptions", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(subscriptions).orderBy((0, import_drizzle_orm2.desc)(subscriptions.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/subscriptions", requireSuperAdmin, async (req, res) => {
    try {
      const subId = import_crypto3.default.randomUUID();
      await db.insert(subscriptions).values({ ...req.body, id: subId });
      const [sub] = await db.select().from(subscriptions).where((0, import_drizzle_orm2.eq)(subscriptions.id, subId));
      await logActivity({ userId: req.currentUser?.id, userRole: "super_admin", action: "subscription.created", entityType: "subscription", entityId: sub.id, metadata: { salonId: sub.salonId, planId: sub.planId } });
      res.json(sub);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/subscriptions/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(subscriptions).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(subscriptions.id, String(req.params.id)));
      const [sub] = await db.select().from(subscriptions).where((0, import_drizzle_orm2.eq)(subscriptions.id, String(req.params.id)));
      await logActivity({ userId: req.currentUser?.id, userRole: "super_admin", action: "subscription.updated", entityType: "subscription", entityId: String(req.params.id) });
      res.json(sub);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/subscriptions/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(subscriptions).where((0, import_drizzle_orm2.eq)(subscriptions.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/license-keys", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(licenseKeys).orderBy((0, import_drizzle_orm2.desc)(licenseKeys.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/license-keys", requireSuperAdmin, async (req, res) => {
    try {
      const key = req.body.key || `BRMG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const lkId = import_crypto3.default.randomUUID();
      await db.insert(licenseKeys).values({ ...req.body, key, id: lkId });
      const [lk] = await db.select().from(licenseKeys).where((0, import_drizzle_orm2.eq)(licenseKeys.id, lkId));
      res.json(lk);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/license-keys/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(licenseKeys).set(req.body).where((0, import_drizzle_orm2.eq)(licenseKeys.id, String(req.params.id)));
      const [lk] = await db.select().from(licenseKeys).where((0, import_drizzle_orm2.eq)(licenseKeys.id, String(req.params.id)));
      res.json(lk);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/license-keys/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(licenseKeys).where((0, import_drizzle_orm2.eq)(licenseKeys.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/activity-logs", requireSuperAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const logs = await db.select().from(activityLogs).orderBy((0, import_drizzle_orm2.desc)(activityLogs.createdAt)).limit(limit);
      res.json(logs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/commissions", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(commissions).orderBy((0, import_drizzle_orm2.desc)(commissions.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/commissions/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(commissions).set(req.body).where((0, import_drizzle_orm2.eq)(commissions.id, String(req.params.id)));
      const [c] = await db.select().from(commissions).where((0, import_drizzle_orm2.eq)(commissions.id, String(req.params.id)));
      res.json(c);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/expenses", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(expenses).orderBy((0, import_drizzle_orm2.desc)(expenses.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/shifts", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(shifts));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/salon-staff", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(salonStaff));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/salon-staff", requireSuperAdmin, async (req, res) => {
    try {
      const linkId = import_crypto3.default.randomUUID();
      await db.insert(salonStaff).values({ ...req.body, id: linkId });
      const [link] = await db.select().from(salonStaff).where((0, import_drizzle_orm2.eq)(salonStaff.id, linkId));
      res.json(link);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/salon-staff/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(salonStaff).where((0, import_drizzle_orm2.eq)(salonStaff.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/backup", requireSuperAdmin, async (_req, res) => {
    res.json({ message: "Backup endpoint ready. Configure pg_dump with DATABASE_URL for production backups.", databaseUrl: !!process.env.DATABASE_URL });
  });
  app2.get("/api/salon/me", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm2.eq)(salons.id, salonId));
      res.json(salon);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/me", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.update(salons).set(req.body).where((0, import_drizzle_orm2.eq)(salons.id, salonId));
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm2.eq)(salons.id, salonId));
      res.json(salon);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/subscription", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const [sub] = await db.select().from(subscriptions).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(subscriptions.salonId, salonId), (0, import_drizzle_orm2.eq)(subscriptions.status, "active")));
      if (!sub) return res.json(null);
      const [plan] = await db.select().from(plans).where((0, import_drizzle_orm2.eq)(plans.id, sub.planId));
      res.json({ ...sub, plan });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/stats", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const [todayBookings] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(bookings).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(bookings.salonId, salonId), (0, import_drizzle_orm2.eq)(bookings.date, today)));
      const [totalBookings] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(bookings).where((0, import_drizzle_orm2.eq)(bookings.salonId, salonId));
      const [revenue] = await db.select({ sum: import_drizzle_orm2.sql`coalesce(sum(${bookings.totalPrice}),0)` }).from(bookings).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(bookings.salonId, salonId), (0, import_drizzle_orm2.eq)(bookings.status, "completed")));
      const [staffCount] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(salonStaff).where((0, import_drizzle_orm2.eq)(salonStaff.salonId, salonId));
      const [pendingCount] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(bookings).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(bookings.salonId, salonId), (0, import_drizzle_orm2.eq)(bookings.status, "upcoming")));
      res.json({
        todayBookings: todayBookings.count,
        totalBookings: totalBookings.count,
        totalRevenue: Number(revenue.sum) || 0,
        staffCount: staffCount.count,
        pendingBookings: pendingCount.count
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/bookings", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const all = await db.select().from(bookings).where((0, import_drizzle_orm2.eq)(bookings.salonId, salonId)).orderBy((0, import_drizzle_orm2.desc)(bookings.createdAt));
      res.json(all);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/bookings/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.update(bookings).set(req.body).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(bookings.id, String(req.params.id)), (0, import_drizzle_orm2.eq)(bookings.salonId, salonId)));
      const [booking] = await db.select().from(bookings).where((0, import_drizzle_orm2.eq)(bookings.id, String(req.params.id)));
      if (req.body.status === "completed" && booking) {
        const sub = await db.select().from(subscriptions).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(subscriptions.salonId, salonId), (0, import_drizzle_orm2.eq)(subscriptions.status, "active")));
        const planId = sub[0]?.planId;
        let rate = 5;
        if (planId) {
          const [plan] = await db.select().from(plans).where((0, import_drizzle_orm2.eq)(plans.id, planId));
          if (plan) rate = plan.commissionRate ?? 5;
        }
        await db.insert(commissions).values({ bookingId: booking.id, salonId, amount: booking.totalPrice * (rate / 100), rate });
      }
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/services", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(services).where((0, import_drizzle_orm2.eq)(services.salonId, salonId)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/services", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const svcId2 = import_crypto3.default.randomUUID();
      await db.insert(services).values({ ...req.body, salonId, id: svcId2 });
      const [s] = await db.select().from(services).where((0, import_drizzle_orm2.eq)(services.id, svcId2));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/services/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.update(services).set(req.body).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(services.id, String(req.params.id)), (0, import_drizzle_orm2.eq)(services.salonId, salonId)));
      const [s] = await db.select().from(services).where((0, import_drizzle_orm2.eq)(services.id, String(req.params.id)));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/services/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.delete(services).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(services.id, String(req.params.id)), (0, import_drizzle_orm2.eq)(services.salonId, salonId)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/staff", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const links = await db.select().from(salonStaff).where((0, import_drizzle_orm2.eq)(salonStaff.salonId, salonId));
      const staffUsers = await Promise.all(links.map(async (l) => {
        const [u] = await db.select({ id: users.id, fullName: users.fullName, email: users.email, phone: users.phone, avatar: users.avatar, role: users.role }).from(users).where((0, import_drizzle_orm2.eq)(users.id, l.userId));
        return { ...u, linkId: l.id, staffRole: l.role };
      }));
      res.json(staffUsers.filter(Boolean));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/staff", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const { fullName, email, password, staffRole = "staff" } = req.body;
      const hashed = await import_bcryptjs2.default.hash(password || "password123", 10);
      const newUserId2 = import_crypto3.default.randomUUID();
      await db.insert(users).values({ id: newUserId2, fullName, email, password: hashed, role: staffRole === "salon_admin" ? "salon_admin" : "staff" });
      const [newUser] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, newUserId2));
      const linkId2 = import_crypto3.default.randomUUID();
      await db.insert(salonStaff).values({ id: linkId2, userId: newUser.id, salonId, role: staffRole });
      const [link] = await db.select().from(salonStaff).where((0, import_drizzle_orm2.eq)(salonStaff.id, linkId2));
      res.json({ ...newUser, linkId: link.id, staffRole: link.role });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/staff/:linkId", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.delete(salonStaff).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(salonStaff.id, String(req.params.linkId)), (0, import_drizzle_orm2.eq)(salonStaff.salonId, salonId)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/customers", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const rows = await db.select({
        userId: bookings.userId,
        count: import_drizzle_orm2.sql`count(*)`,
        lastVisit: import_drizzle_orm2.sql`max(${bookings.date})`,
        totalSpent: import_drizzle_orm2.sql`sum(${bookings.totalPrice})`
      }).from(bookings).where((0, import_drizzle_orm2.eq)(bookings.salonId, salonId)).groupBy(bookings.userId);
      const customers = await Promise.all(rows.map(async (r) => {
        const [u] = await db.select({ id: users.id, fullName: users.fullName, email: users.email, phone: users.phone, avatar: users.avatar, loyaltyPoints: users.loyaltyPoints }).from(users).where((0, import_drizzle_orm2.eq)(users.id, r.userId));
        return u ? { ...u, bookingCount: r.count, lastVisit: r.lastVisit, totalSpent: r.totalSpent } : null;
      }));
      res.json(customers.filter(Boolean));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/expenses", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(expenses).where((0, import_drizzle_orm2.eq)(expenses.salonId, salonId)).orderBy((0, import_drizzle_orm2.desc)(expenses.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/expenses", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const expId = import_crypto3.default.randomUUID();
      await db.insert(expenses).values({ ...req.body, salonId, id: expId });
      const [e] = await db.select().from(expenses).where((0, import_drizzle_orm2.eq)(expenses.id, expId));
      res.json(e);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/expenses/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.update(expenses).set(req.body).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(expenses.id, String(req.params.id)), (0, import_drizzle_orm2.eq)(expenses.salonId, salonId)));
      const [e] = await db.select().from(expenses).where((0, import_drizzle_orm2.eq)(expenses.id, String(req.params.id)));
      res.json(e);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/expenses/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.delete(expenses).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(expenses.id, String(req.params.id)), (0, import_drizzle_orm2.eq)(expenses.salonId, salonId)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/shifts", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(shifts).where((0, import_drizzle_orm2.eq)(shifts.salonId, salonId)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/shifts", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const shiftId = import_crypto3.default.randomUUID();
      await db.insert(shifts).values({ ...req.body, salonId, id: shiftId });
      const [s] = await db.select().from(shifts).where((0, import_drizzle_orm2.eq)(shifts.id, shiftId));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/shifts/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.update(shifts).set(req.body).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(shifts.id, String(req.params.id)), (0, import_drizzle_orm2.eq)(shifts.salonId, salonId)));
      const [s] = await db.select().from(shifts).where((0, import_drizzle_orm2.eq)(shifts.id, String(req.params.id)));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/shifts/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.delete(shifts).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(shifts.id, String(req.params.id)), (0, import_drizzle_orm2.eq)(shifts.salonId, salonId)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/upload", requireSalonAdmin, upload.single("image"), (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No image file provided" });
      res.json({ url: `/uploads/${req.file.filename}` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/staff/schedule", requireStaff, async (req, res) => {
    try {
      const userId = req.session?.userId;
      const salonId = req.salonId;
      const all = await db.select().from(bookings).where(
        salonId ? (0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(bookings.salonId, salonId), (0, import_drizzle_orm2.eq)(bookings.specialistId, userId)) : (0, import_drizzle_orm2.eq)(bookings.specialistId, userId)
      ).orderBy((0, import_drizzle_orm2.desc)(bookings.date));
      res.json(all);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/staff/bookings/:id", requireStaff, async (req, res) => {
    try {
      const userId = req.session?.userId;
      const allowed = ["completed", "no-show"];
      if (!allowed.includes(req.body.status)) {
        return res.status(400).json({ message: "Staff can only mark bookings as completed or no-show" });
      }
      await db.update(bookings).set({ status: req.body.status }).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(bookings.id, String(req.params.id)), (0, import_drizzle_orm2.eq)(bookings.specialistId, userId)));
      const [booking] = await db.select().from(bookings).where((0, import_drizzle_orm2.eq)(bookings.id, String(req.params.id)));
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/staff/bookings", requireStaff, async (req, res) => {
    try {
      const userId = req.session?.userId;
      const salonId = req.salonId;
      const all = await db.select().from(bookings).where(
        salonId ? (0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(bookings.salonId, salonId), (0, import_drizzle_orm2.eq)(bookings.specialistId, userId)) : (0, import_drizzle_orm2.eq)(bookings.specialistId, userId)
      ).orderBy((0, import_drizzle_orm2.desc)(bookings.date));
      res.json(all);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/staff/profile", requireStaff, async (req, res) => {
    try {
      const userId = req.session?.userId;
      const { name, email, phone } = req.body;
      await db.update(users).set({ fullName: name, email, phone }).where((0, import_drizzle_orm2.eq)(users.id, userId));
      const [user] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, userId));
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/staff/shifts", requireStaff, async (req, res) => {
    try {
      const userId = req.session?.userId;
      const salonId = req.salonId;
      res.json(await db.select().from(shifts).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(shifts.staffId, userId), (0, import_drizzle_orm2.eq)(shifts.salonId, salonId))));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/staff/earnings", requireStaff, async (req, res) => {
    try {
      const userId = req.session?.userId;
      const salonId = req.salonId;
      const period = req.query.period || "month";
      const now = /* @__PURE__ */ new Date();
      let start;
      if (period === "day") {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (period === "week") {
        start = new Date(now.getTime() - 7 * 24 * 3600 * 1e3);
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      const myBookings = await db.select().from(bookings).where(
        (0, import_drizzle_orm2.and)(
          (0, import_drizzle_orm2.eq)(bookings.specialistId, userId),
          (0, import_drizzle_orm2.eq)(bookings.status, "completed"),
          (0, import_drizzle_orm2.gte)(bookings.createdAt, start)
        )
      );
      const myTips = await db.select().from(tips).where(
        (0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(tips.staffId, userId), (0, import_drizzle_orm2.gte)(tips.createdAt, start))
      );
      const totalEarnings = myBookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
      const totalTips = myTips.reduce((s, t) => s + (t.amount || 0), 0);
      const tipMap = {};
      myTips.forEach((t) => {
        tipMap[t.bookingId] = (tipMap[t.bookingId] || 0) + t.amount;
      });
      const recentBookings = myBookings.slice(0, 20).map((b) => ({
        ...b,
        tip: tipMap[b.id] || 0
      }));
      res.json({
        totalEarnings,
        totalTips,
        completedBookings: myBookings.length,
        avgPerBooking: myBookings.length > 0 ? totalEarnings / myBookings.length : 0,
        recentBookings
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/auth/verify-license", async (req, res) => {
    try {
      const { email, licenseKey, deviceId } = req.body;
      if (!email || !licenseKey) return res.status(400).json({ message: "Email and license key are required" });
      const [lk] = await db.select().from(licenseKeys).where((0, import_drizzle_orm2.eq)(licenseKeys.key, licenseKey.toUpperCase()));
      if (!lk) return res.status(404).json({ message: "Invalid license key" });
      if (lk.status === "revoked") return res.status(403).json({ message: "License key has been revoked" });
      if (lk.status === "suspended") return res.status(403).json({ message: "License key is suspended" });
      if (lk.expiresAt && new Date(lk.expiresAt) < /* @__PURE__ */ new Date()) {
        return res.status(403).json({ message: "License key has expired" });
      }
      const effectiveDeviceId = deviceId || `web-${email}`;
      const existingActivations = await db.select().from(licenseActivations).where((0, import_drizzle_orm2.eq)(licenseActivations.licenseKeyId, lk.id));
      const alreadyActivated = existingActivations.some((a) => a.deviceId === effectiveDeviceId);
      if (!alreadyActivated) {
        const maxAct = lk.maxActivations ?? 0;
        const currentCount = lk.activationCount ?? 0;
        if (maxAct > 0 && currentCount >= maxAct) {
          return res.status(403).json({ message: `Activation limit reached (${maxAct}/${maxAct} devices)` });
        }
        await db.insert(licenseActivations).values({ licenseKeyId: lk.id, deviceId: effectiveDeviceId, email });
        await db.update(licenseKeys).set({
          activationCount: currentCount + 1,
          status: "active"
        }).where((0, import_drizzle_orm2.eq)(licenseKeys.id, lk.id));
      }
      let salonName = "";
      if (lk.salonId) {
        const [salon] = await db.select().from(salons).where((0, import_drizzle_orm2.eq)(salons.id, lk.salonId));
        if (salon) salonName = salon.name;
      }
      const updatedCount = alreadyActivated ? lk.activationCount ?? 0 : (lk.activationCount ?? 0) + 1;
      res.json({
        valid: true,
        salonId: lk.salonId,
        salonName,
        planId: lk.planId,
        status: "active",
        activationCount: updatedCount,
        maxActivations: lk.maxActivations ?? 0
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/store-analytics", requireSuperAdmin, async (_req, res) => {
    try {
      const allSalons = await db.select().from(salons);
      const allBookings = await db.select().from(bookings);
      const totalRevenue = allBookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
      const avgRating = allSalons.length > 0 ? allSalons.reduce((s, s2) => s + (s2.rating || 0), 0) / allSalons.length : 0;
      const months = {};
      const bookingsPerMonth = {};
      allBookings.forEach((b) => {
        if (b.createdAt) {
          const d = new Date(b.createdAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          months[key] = (months[key] || 0) + (b.totalPrice || 0);
          bookingsPerMonth[key] = (bookingsPerMonth[key] || 0) + 1;
        }
      });
      const sortedKeys = Object.keys(months).sort().slice(-6);
      const revenueByMonth = sortedKeys.map((k) => ({ month: k, revenue: months[k] }));
      const bookingsByMonth = sortedKeys.map((k) => ({ month: k, bookings: bookingsPerMonth[k] || 0 }));
      const salonBookings = {};
      allBookings.forEach((b) => {
        if (!salonBookings[b.salonId]) salonBookings[b.salonId] = { count: 0, revenue: 0 };
        salonBookings[b.salonId].count++;
        salonBookings[b.salonId].revenue += b.totalPrice || 0;
      });
      const topSalons = allSalons.map((s) => ({
        ...s,
        bookingCount: salonBookings[s.id]?.count || 0,
        revenue: salonBookings[s.id]?.revenue || 0
      })).sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 10);
      res.json({ totalSalons: allSalons.length, totalBookings: allBookings.length, totalRevenue, avgRating, revenueByMonth, bookingsByMonth, topSalons });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/analytics", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const period = req.query.period || "month";
      const now = /* @__PURE__ */ new Date();
      let start;
      if (period === "week") start = new Date(now.getTime() - 7 * 24 * 3600 * 1e3);
      else if (period === "year") start = new Date(now.getFullYear(), 0, 1);
      else start = new Date(now.getFullYear(), now.getMonth(), 1);
      const myBookings = await db.select().from(bookings).where(
        (0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(bookings.salonId, salonId), (0, import_drizzle_orm2.gte)(bookings.createdAt, start))
      );
      const prevStart = new Date(start.getTime() - (now.getTime() - start.getTime()));
      const prevBookings = await db.select().from(bookings).where(
        (0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(bookings.salonId, salonId), (0, import_drizzle_orm2.gte)(bookings.createdAt, prevStart), (0, import_drizzle_orm2.lte)(bookings.createdAt, start))
      );
      const totalRevenue = myBookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
      const avgBookingValue = myBookings.length > 0 ? totalRevenue / myBookings.length : 0;
      const grouped = {};
      myBookings.forEach((b) => {
        if (!b.date) return;
        let key = b.date;
        if (period === "year") key = b.date.slice(0, 7);
        else if (period === "month") key = b.date.slice(5);
        else key = b.date;
        if (!grouped[key]) grouped[key] = { count: 0, revenue: 0 };
        grouped[key].count++;
        grouped[key].revenue += b.totalPrice || 0;
      });
      const bookingsByPeriod = Object.entries(grouped).sort().map(([label, v]) => ({ label, ...v }));
      const serviceCount = {};
      myBookings.forEach((b) => {
        (b.services || []).forEach((svc) => {
          serviceCount[svc] = (serviceCount[svc] || 0) + 1;
        });
      });
      const topServices = Object.entries(serviceCount).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, count]) => ({ name, count }));
      const customerIds = new Set(myBookings.map((b) => b.userId));
      const prevIds = new Set(prevBookings.map((b) => b.userId));
      const newCustomers = [...customerIds].filter((id) => !prevIds.has(id)).length;
      res.json({ totalBookings: myBookings.length, totalRevenue, avgBookingValue, newCustomers, bookingsByPeriod, topServices });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/customers/:customerId/notes", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const notes = await db.select().from(customerNotes).where(
        (0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(customerNotes.salonId, salonId), (0, import_drizzle_orm2.eq)(customerNotes.customerId, String(req.params.customerId)))
      ).orderBy((0, import_drizzle_orm2.desc)(customerNotes.createdAt));
      res.json(notes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/customers/:customerId/notes", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const noteId = import_crypto3.default.randomUUID();
      await db.insert(customerNotes).values({
        id: noteId,
        salonId,
        customerId: String(req.params.customerId),
        note: req.body.note
      });
      const [note] = await db.select().from(customerNotes).where((0, import_drizzle_orm2.eq)(customerNotes.id, noteId));
      res.json(note);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/inventory", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(inventory).where((0, import_drizzle_orm2.eq)(inventory.salonId, salonId)).orderBy((0, import_drizzle_orm2.desc)(inventory.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/inventory", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const invId = import_crypto3.default.randomUUID();
      await db.insert(inventory).values({ ...req.body, salonId, id: invId });
      const [item] = await db.select().from(inventory).where((0, import_drizzle_orm2.eq)(inventory.id, invId));
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/inventory/:id", requireSalonAdmin, async (req, res) => {
    try {
      await db.update(inventory).set(req.body).where((0, import_drizzle_orm2.eq)(inventory.id, String(req.params.id)));
      const [item] = await db.select().from(inventory).where((0, import_drizzle_orm2.eq)(inventory.id, String(req.params.id)));
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/inventory/:id", requireSalonAdmin, async (req, res) => {
    try {
      await db.delete(inventory).where((0, import_drizzle_orm2.eq)(inventory.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/tips", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const tipId = import_crypto3.default.randomUUID();
      await db.insert(tips).values({ ...req.body, salonId, id: tipId });
      const [tip] = await db.select().from(tips).where((0, import_drizzle_orm2.eq)(tips.id, tipId));
      res.json(tip);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/tips", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(tips).where((0, import_drizzle_orm2.eq)(tips.salonId, salonId)).orderBy((0, import_drizzle_orm2.desc)(tips.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/loyalty/my-transactions", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const txns = await db.select().from(loyaltyTransactions).where((0, import_drizzle_orm2.eq)(loyaltyTransactions.userId, userId)).orderBy((0, import_drizzle_orm2.desc)(loyaltyTransactions.createdAt));
      const [user] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, userId));
      res.json({ points: user?.loyaltyPoints ?? 0, transactions: txns });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/loyalty/redeem", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const { points } = req.body;
      if (!points || points <= 0) return res.status(400).json({ message: "Invalid points amount" });
      const [user] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, userId));
      if (!user || (user.loyaltyPoints ?? 0) < points) {
        return res.status(400).json({ message: "Insufficient loyalty points" });
      }
      await db.update(users).set({ loyaltyPoints: (user.loyaltyPoints ?? 0) - points }).where((0, import_drizzle_orm2.eq)(users.id, userId));
      await db.insert(loyaltyTransactions).values({
        userId,
        points: -points,
        type: "redeemed",
        description: `Redeemed ${points} points`
      });
      res.json({ success: true, remainingPoints: (user.loyaltyPoints ?? 0) - points });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/landing-pages", requireSuperAdmin, async (_req, res) => {
    try {
      const rows = await db.select().from(salons).orderBy(salons.name);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/landing-pages/:salonId", requireSuperAdmin, async (req, res) => {
    try {
      const salonId = String(req.params.salonId);
      const { landingEnabled, landingSlug, landingTheme, landingAccentColor, landingBookingUrl } = req.body;
      if (landingSlug !== void 0) {
        const slug = String(landingSlug).trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        const [existing] = await db.select().from(salons).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(salons.landingSlug, slug), import_drizzle_orm2.sql`id != ${salonId}`));
        if (existing) return res.status(400).json({ message: "This slug is already in use by another salon." });
        const updates = { landingSlug: slug };
        if (landingEnabled !== void 0) updates.landingEnabled = landingEnabled;
        if (landingTheme !== void 0) updates.landingTheme = landingTheme;
        if (landingAccentColor !== void 0) updates.landingAccentColor = landingAccentColor;
        if (landingBookingUrl !== void 0) updates.landingBookingUrl = landingBookingUrl;
        await db.update(salons).set(updates).where((0, import_drizzle_orm2.eq)(salons.id, salonId));
      } else {
        const updates = {};
        if (landingEnabled !== void 0) updates.landingEnabled = landingEnabled;
        if (landingTheme !== void 0) updates.landingTheme = landingTheme;
        if (landingAccentColor !== void 0) updates.landingAccentColor = landingAccentColor;
        if (landingBookingUrl !== void 0) updates.landingBookingUrl = landingBookingUrl;
        if (Object.keys(updates).length) await db.update(salons).set(updates).where((0, import_drizzle_orm2.eq)(salons.id, salonId));
      }
      const [updated] = await db.select().from(salons).where((0, import_drizzle_orm2.eq)(salons.id, salonId));
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/landing-pages/:salonId/reset-views", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(salons).set({ landingViews: 0 }).where((0, import_drizzle_orm2.eq)(salons.id, String(req.params.salonId)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/salon/:slug", async (req, res) => {
    try {
      const slug = String(req.params.slug).toLowerCase();
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(salons.landingSlug, slug), (0, import_drizzle_orm2.eq)(salons.landingEnabled, true)));
      if (!salon) {
        return res.status(404).send(`<!DOCTYPE html><html><head><title>Not Found</title><style>body{background:#181A20;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column}</style></head><body><h1 style="font-size:3rem">404</h1><p>Salon page not found or not yet published.</p></body></html>`);
      }
      await db.update(salons).set({ landingViews: (salon.landingViews ?? 0) + 1 }).where((0, import_drizzle_orm2.eq)(salons.id, salon.id));
      const isDark = (salon.landingTheme || "dark") === "dark";
      const accent = salon.landingAccentColor || "#F4A460";
      const bg = isDark ? "#181A20" : "#f5f5f5";
      const card = isDark ? "#1F222A" : "#ffffff";
      const border = isDark ? "#35383F" : "#e0e0e0";
      const text2 = isDark ? "#ffffff" : "#111111";
      const textSub = isDark ? "#9a9a9a" : "#555555";
      const gallery = Array.isArray(salon.gallery) ? salon.gallery : [];
      const rating = Number(salon.rating || 0).toFixed(1);
      const stars = "\u2605".repeat(Math.round(Number(salon.rating || 0))) + "\u2606".repeat(5 - Math.round(Number(salon.rating || 0)));
      const bookingUrl = salon.landingBookingUrl || "";
      const galleryHtml = gallery.slice(0, 6).map((src) => `<img src="${src}" alt="Gallery" style="width:100%;height:180px;object-fit:cover;border-radius:12px;border:1px solid ${border}">`).join("");
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${salon.name} \u2014 Powered by Barmagly</title>
  <meta name="description" content="${(salon.about || "").replace(/"/g, "&quot;")}">
  <meta property="og:title" content="${salon.name}">
  <meta property="og:image" content="${salon.image}">
  <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:${bg};color:${text2};font-family:'Urbanist',sans-serif;min-height:100vh}
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
    .info-row{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid ${border};font-size:15px;color:${text2}}
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
        <span class="open-badge">${salon.isOpen ? "\u25CF Open" : "\u25CF Closed"}</span>
      </div>

      ${salon.address ? `<div class="info-row"><span class="info-icon">\u{1F4CD}</span><div><div class="info-label">Address</div>${salon.address}</div></div>` : ""}
      ${salon.phone ? `<div class="info-row"><span class="info-icon">\u{1F4DE}</span><div><div class="info-label">Phone</div><a href="tel:${salon.phone}" style="color:${text2};text-decoration:none">${salon.phone}</a></div></div>` : ""}
      ${salon.openHours ? `<div class="info-row"><span class="info-icon">\u{1F550}</span><div><div class="info-label">Hours</div>${salon.openHours}</div></div>` : ""}
      ${salon.website ? `<div class="info-row"><span class="info-icon">\u{1F310}</span><div><div class="info-label">Website</div><a href="${salon.website}" target="_blank" style="color:${accent};text-decoration:none">${salon.website}</a></div></div>` : ""}
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
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
}

// server/routes.ts
var import_zod = require("zod");
var signupSchema = import_zod.z.object({
  fullName: import_zod.z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: import_zod.z.string().email("Invalid email address"),
  password: import_zod.z.string().min(8, "Password must be at least 8 characters")
});
var signinSchema = import_zod.z.object({
  email: import_zod.z.string().email("Invalid email address"),
  password: import_zod.z.string().min(1, "Password is required")
});
var bookingSchema = import_zod.z.object({
  salonId: import_zod.z.string().min(1, "Salon ID is required"),
  salonName: import_zod.z.string().min(1, "Salon name is required"),
  salonImage: import_zod.z.string().optional().default(""),
  services: import_zod.z.array(import_zod.z.string()).default([]),
  date: import_zod.z.string().min(1, "Date is required"),
  time: import_zod.z.string().min(1, "Time is required"),
  totalPrice: import_zod.z.number().min(0, "Price must be non-negative"),
  paymentMethod: import_zod.z.string().optional().default(""),
  couponId: import_zod.z.string().optional()
});
var reviewSchema = import_zod.z.object({
  salonId: import_zod.z.string().min(1, "Salon ID is required"),
  rating: import_zod.z.number().int().min(1).max(5),
  comment: import_zod.z.string().max(1e3).optional().default("")
});
var MySQLStore = (0, import_express_mysql_session.default)(import_express_session.default);
async function registerRoutes(app2) {
  const sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 9e5,
    expiration: 30 * 24 * 60 * 60 * 1e3,
    createDatabaseTable: true
  }, pool);
  app2.use(
    (0, import_express_session.default)({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || import_node_crypto.default.randomBytes(32).toString("hex"),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1e3,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        httpOnly: true
      }
    })
  );
  await seedDatabase();
  function requireAuth(req, res, next) {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  }
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { fullName, email, password } = parsed.data;
      const existing = await getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }
      const user = await createUser({ fullName, email, password });
      req.session.userId = user.id;
      await createNotification({
        userId: user.id,
        title: "Welcome to Casca!",
        message: "Your account has been created successfully. Start exploring salons near you!",
        type: "system"
      });
      const { password: _, ...safeUser } = user;
      res.status(201).json({ user: safeUser });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/auth/signin", async (req, res) => {
    try {
      const parsed = signinSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { email, password } = parsed.data;
      const user = await getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "No account found with this email" });
      }
      const valid = await verifyPassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Incorrect password" });
      }
      req.session.userId = user.id;
      await logActivity({ userId: user.id, userRole: user.role || "user", action: "user.login", entityType: "user", entityId: user.id });
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/auth/google", async (req, res) => {
    try {
      const { email, fullName, avatar } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      let user = await getUserByEmail(email);
      if (!user) {
        user = await createUser({
          fullName: fullName || email.split("@")[0],
          email,
          password: "__google_oauth__" + Date.now()
        });
        if (avatar) {
          user = await updateUser(user.id, { avatar });
        }
        await createNotification({
          userId: user.id,
          title: "Welcome to Casca!",
          message: "Your account has been created with Google. Start exploring salons near you!",
          type: "system"
        });
      } else if (avatar && !user.avatar) {
        user = await updateUser(user.id, { avatar });
      }
      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/auth/google/start", (req, res) => {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return res.status(500).send("Google OAuth not configured");
    }
    const returnUrl = req.query.returnUrl || "/";
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
      prompt: "consent"
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  });
  app2.get("/api/auth/google/callback", async (req, res) => {
    const { code, state, error } = req.query;
    let returnUrl = "/";
    try {
      if (state) {
        const parsed = JSON.parse(Buffer.from(state, "base64url").toString());
        returnUrl = parsed.returnUrl || "/";
      }
    } catch {
    }
    if (error || !code) {
      const errorPage = `<!DOCTYPE html><html><body style="background:#1F222A;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><h2>Sign-in Failed</h2><p>${error || "No authorization code received"}</p><p>You can close this window and try again.</p></div></body></html>`;
      return res.status(400).send(errorPage);
    }
    try {
      const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const domains = process.env.REPLIT_DOMAINS?.split(",") || [];
      const primaryDomain = domains[0] || process.env.REPLIT_DEV_DOMAIN || "localhost:5000";
      const callbackUrl = `https://${primaryDomain}/api/auth/google/callback`;
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: callbackUrl,
          grant_type: "authorization_code"
        })
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        throw new Error(tokenData.error_description || "Failed to exchange code for token");
      }
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const userInfo = await userInfoRes.json();
      if (!userInfo.email) {
        throw new Error("Could not retrieve email from Google");
      }
      let user = await getUserByEmail(userInfo.email);
      if (!user) {
        user = await createUser({
          fullName: userInfo.name || userInfo.email.split("@")[0],
          email: userInfo.email,
          password: "__google_oauth__" + Date.now()
        });
        if (userInfo.picture) {
          user = await updateUser(user.id, { avatar: userInfo.picture });
        }
        await createNotification({
          userId: user.id,
          title: "Welcome to Casca!",
          message: "Your account has been created with Google. Start exploring salons near you!",
          type: "system"
        });
      } else if (userInfo.picture && !user.avatar) {
        user = await updateUser(user.id, { avatar: userInfo.picture });
      }
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) console.error("Session save error:", err);
        const domains2 = process.env.REPLIT_DOMAINS?.split(",") || [];
        const completeDomain = domains2[0] || process.env.REPLIT_DEV_DOMAIN || "localhost:5000";
        const completeUrl = `https://${completeDomain}/api/auth/google/complete?status=success`;
        res.redirect(completeUrl);
      });
    } catch (err) {
      console.error("Google OAuth callback error:", err);
      const errorPage = `<!DOCTYPE html><html><body style="background:#1F222A;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><h2>Sign-in Failed</h2><p>${err.message}</p><p>You can close this window and try again.</p></div></body></html>`;
      res.status(500).send(errorPage);
    }
  });
  app2.get("/api/auth/google/complete", (_req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Sign-in Complete</title></head><body style="background:#1F222A;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><div style="width:80px;height:80px;border-radius:50%;background:#F4A460;display:flex;align-items:center;justify-content:center;margin:0 auto 20px"><svg width="40" height="40" fill="none" stroke="#fff" stroke-width="3"><polyline points="10,22 18,30 32,14"/></svg></div><h2>Signed in successfully!</h2><p>Returning to app...</p></div></body></html>`);
  });
  app2.post("/api/auth/facebook", async (req, res) => {
    try {
      const { email, fullName, avatar } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      let user = await getUserByEmail(email);
      if (!user) {
        user = await createUser({
          fullName: fullName || email.split("@")[0],
          email,
          password: "__facebook_oauth__" + Date.now()
        });
        if (avatar) {
          user = await updateUser(user.id, { avatar });
        }
        await createNotification({
          userId: user.id,
          title: "Welcome to Casca!",
          message: "Your account has been created with Facebook. Start exploring salons near you!",
          type: "system"
        });
      } else if (avatar && !user.avatar) {
        user = await updateUser(user.id, { avatar });
      }
      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/auth/apple", async (req, res) => {
    try {
      const { email, fullName } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      let user = await getUserByEmail(email);
      if (!user) {
        user = await createUser({
          fullName: fullName || "Apple User",
          email,
          password: "__apple_oauth__" + Date.now()
        });
        await createNotification({
          userId: user.id,
          title: "Welcome to Casca!",
          message: "Your account has been created with Apple. Start exploring salons near you!",
          type: "system"
        });
      }
      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    const userId = req.session?.userId;
    if (userId) await logActivity({ userId, action: "user.logout", entityType: "user", entityId: userId });
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });
  app2.get("/api/auth/me", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { fullName, phone, nickname, gender, dob, avatar } = req.body;
      const user = await updateUser(userId, { fullName, phone, nickname, gender, dob, avatar });
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salons", async (req, res) => {
    try {
      const category = req.query.category;
      let allSalons;
      if (category && category !== "all") {
        allSalons = await getSalonsByCategory(category);
      } else {
        allSalons = await getAllSalons();
      }
      res.json(allSalons);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salons/search", async (req, res) => {
    try {
      const query = req.query.q || "";
      const results = await searchSalons(query);
      res.json(results);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salons/:id", async (req, res) => {
    try {
      const salon = await getSalonById(String(req.params.id));
      if (!salon) {
        return res.status(404).json({ message: "Salon not found" });
      }
      const [salonServices2, salonPackages2, salonSpecialists2, salonReviews2] = await Promise.all([
        getSalonServices(String(req.params.id)),
        getSalonPackages(String(req.params.id)),
        getSalonSpecialists(String(req.params.id)),
        getSalonReviews(String(req.params.id))
      ]);
      res.json({ ...salon, services: salonServices2, packages: salonPackages2, specialists: salonSpecialists2, reviews: salonReviews2 });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/bookings", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const userBookings = await getUserBookings(userId);
      res.json(userBookings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/bookings", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const parsed = bookingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { salonId, salonName, salonImage, services: services2, date, time, totalPrice, paymentMethod, couponId } = parsed.data;
      const booking = await createBooking({
        userId,
        salonId,
        salonName,
        salonImage,
        services: services2,
        date,
        time,
        totalPrice,
        paymentMethod
      });
      if (couponId) {
        await updateCouponUsage(couponId);
      }
      await createNotification({
        userId,
        title: "Booking Confirmed",
        message: `Your appointment at ${salonName} on ${date} at ${time} is confirmed.`,
        type: "booking"
      });
      await logActivity({ userId, action: "booking.created", entityType: "booking", entityId: booking.id, metadata: { salonId, date, time, totalPrice } });
      res.status(201).json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/bookings/:id/cancel", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const booking = await cancelBooking(String(req.params.id), userId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      await createNotification({
        userId,
        title: "Booking Cancelled",
        message: `Your appointment at ${booking.salonName} has been cancelled.`,
        type: "booking"
      });
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/bookmarks", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const salonIds = await getUserBookmarks(userId);
      res.json(salonIds);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/bookmarks/toggle", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { salonId } = req.body;
      const isBookmarked = await toggleBookmark(userId, salonId);
      res.json({ isBookmarked });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const msgs = await getUserMessages(userId);
      const grouped = {};
      for (const m of msgs) {
        if (!grouped[m.salonId]) {
          grouped[m.salonId] = {
            salonId: m.salonId,
            salonName: m.salonName,
            salonImage: m.salonImage,
            lastMessage: m.content,
            time: m.createdAt,
            unread: 0
          };
        }
      }
      res.json(Object.values(grouped));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/messages/:salonId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const msgs = await getConversation(userId, String(req.params.salonId));
      res.json(msgs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { salonId, salonName, salonImage, content } = req.body;
      const msg = await sendMessage({ userId, salonId, salonName, salonImage: salonImage || "", content, sender: "user" });
      setTimeout(async () => {
        try {
          await sendMessage({
            userId,
            salonId,
            salonName,
            salonImage: salonImage || "",
            content: "Thanks for your message! We'll get back to you shortly.",
            sender: "salon"
          });
        } catch {
        }
      }, 2e3);
      res.status(201).json(msg);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const notifs = await getUserNotifications(userId);
      res.json(notifs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      await markNotificationRead(String(req.params.id), userId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/reviews", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const parsed = reviewSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { salonId, rating, comment } = parsed.data;
      const user = await getUserById(userId);
      const review = await createReview({
        salonId,
        userId,
        userName: user?.fullName || "Anonymous",
        userImage: user?.avatar || "",
        rating,
        comment
      });
      res.status(201).json(review);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/stripe/publishable-key", async (_req, res) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (err) {
      res.status(500).json({ message: "Stripe not configured" });
    }
  });
  app2.post("/api/stripe/create-payment-intent", requireAuth, async (req, res) => {
    try {
      const { amount, currency, bookingData } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      const stripe = await getUncachableStripeClient();
      const userId = req.session.userId;
      const user = await getUserById(userId);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency || "usd",
        metadata: {
          userId,
          userEmail: user?.email || "",
          salonId: bookingData?.salonId || "",
          salonName: bookingData?.salonName || "",
          services: JSON.stringify(bookingData?.services || []),
          date: bookingData?.date || "",
          time: bookingData?.time || ""
        }
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (err) {
      console.error("Payment intent error:", err);
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/stripe/confirm-payment", requireAuth, async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      const stripe = await getUncachableStripeClient();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      res.json({
        status: paymentIntent.status,
        amount: paymentIntent.amount
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password required" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }
      const user = await getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.password.startsWith("__google_oauth__") || user.password.startsWith("__facebook_oauth__") || user.password.startsWith("__apple_oauth__")) {
        return res.status(400).json({ message: "Password change not available for social login accounts" });
      }
      const valid = await verifyPassword(currentPassword, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      const bcrypt3 = await import("bcryptjs");
      const hashed = await bcrypt3.hash(newPassword, 10);
      await updateUser(userId, { password: hashed });
      res.json({ message: "Password changed successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/coupons", async (req, res) => {
    try {
      const activeCoupons = await getActiveCoupons();
      res.json(activeCoupons);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Coupon code is required" });
      }
      const coupon = await getCouponByCode(code);
      if (!coupon) {
        return res.status(404).json({ message: "Invalid coupon code" });
      }
      if (!coupon.active) {
        return res.status(400).json({ message: "This coupon is no longer active" });
      }
      const now = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
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
        type: coupon.type
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  registerAdminRoutes(app2);
  const httpServer = (0, import_node_http.createServer)(app2);
  return httpServer;
}

// server/webhookHandlers.ts
var WebhookHandlers = class {
  static async processWebhook(payload, signature) {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        "STRIPE WEBHOOK ERROR: Payload must be a Buffer. Received type: " + typeof payload + ". "
      );
    }
    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);
  }
};

// server/index.ts
var fs2 = __toESM(require("fs"));
var path3 = __toESM(require("path"));
var app = (0, import_express.default)();
app.set("trust proxy", 1);
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    origins.add("https://barber.barmagly.tech");
    origins.add("http://barber.barmagly.tech");
    const origin = req.header("origin");
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    import_express.default.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(import_express.default.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path4 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path4.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path3.resolve(process.cwd(), "app.json");
    const appJsonContent = fs2.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path3.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs2.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs2.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path3.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs2.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      const staticBuildIdx = path3.resolve(process.cwd(), "static-build", "index.html");
      if (fs2.existsSync(staticBuildIdx)) {
        return res.sendFile(staticBuildIdx);
      }
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName
      });
    }
    next();
  });
  app2.use("/assets", import_express.default.static(path3.resolve(process.cwd(), "assets")));
  app2.use(import_express.default.static(path3.resolve(process.cwd(), "static-build")));
  const staticBuildIndex = path3.resolve(process.cwd(), "static-build", "index.html");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/super_admin") || req.path.startsWith("/uploads") || req.path.startsWith("/assets") || req.path.startsWith("/salon/")) {
      return next();
    }
    if (fs2.existsSync(staticBuildIndex)) {
      return res.sendFile(staticBuildIndex);
    }
    next();
  });
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}
async function initStripe() {
  const hasLocalKeys = process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY;
  if (hasLocalKeys) {
    log("Stripe API keys found \u2014 payments enabled (sync disabled for MySQL)");
  } else {
    log("Stripe keys not found, skipping Stripe initialization");
  }
}
(async () => {
  log("Starting server initialization...");
  setupCors(app);
  const apiLimiter = (0, import_express_rate_limit.default)({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later" }
  });
  app.use("/api/", apiLimiter);
  const authLimiter = (0, import_express_rate_limit.default)({
    windowMs: 15 * 60 * 1e3,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many authentication attempts, please try again later" }
  });
  app.use("/api/auth/signin", authLimiter);
  app.use("/api/auth/signup", authLimiter);
  app.use("/uploads", import_express.default.static(path3.join(process.cwd(), "public", "uploads")));
  app.get("/health", (req, res) => res.json({ status: "ok", version: "v2" }));
  const adminDistPath = path3.join(process.cwd(), "admin-dist");
  if (fs2.existsSync(adminDistPath)) {
    app.use("/super_admin", import_express.default.static(adminDistPath));
    app.get("/super_admin/{*path}", (req, res) => {
      res.sendFile(path3.join(adminDistPath, "index.html"));
    });
    log("Super Admin portal serving from /super_admin");
  } else {
    log("Super Admin build not found at admin-dist/. Run: cd admin-panel && npm run build");
  }
  app.post(
    "/api/stripe/webhook",
    import_express.default.raw({ type: "application/json" }),
    async (req, res) => {
      const signature = req.headers["stripe-signature"];
      if (!signature) {
        return res.status(400).json({ error: "Missing stripe-signature" });
      }
      try {
        const sig = Array.isArray(signature) ? signature[0] : signature;
        await WebhookHandlers.processWebhook(req.body, sig);
        res.status(200).json({ received: true });
      } catch (error) {
        console.error("Webhook error:", error.message);
        res.status(400).json({ error: "Webhook processing error" });
      }
    }
  );
  setupBodyParsing(app);
  setupRequestLogging(app);
  log("Configuring Expo and Landing...");
  configureExpoAndLanding(app);
  log("Initializing Stripe...");
  await initStripe();
  log("Registering routes...");
  const server = await registerRoutes(app);
  log("Setting up error handler...");
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0"
    },
    () => {
      log(`express server serving on port ${port}`);
    }
  );
})();
