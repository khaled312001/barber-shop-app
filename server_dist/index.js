"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

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
  productOrders: () => productOrders,
  products: () => products,
  reviews: () => reviews,
  salonStaff: () => salonStaff,
  salons: () => salons,
  services: () => services,
  shifts: () => shifts,
  specialists: () => specialists,
  subscriptions: () => subscriptions,
  tips: () => tips,
  trialRequests: () => trialRequests,
  users: () => users
});
var import_crypto, import_mysql_core, import_drizzle_zod, users, salons, salonStaff, plans, subscriptions, licenseKeys, licenseActivations, activityLogs, commissions, expenses, shifts, services, packages, specialists, reviews, bookings, bookmarkTable, messages, notifications, coupons, inventory, products, productOrders, tips, customerNotes, loyaltyTransactions, appSettings, trialRequests, insertUserSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    import_crypto = __toESM(require("crypto"));
    import_mysql_core = require("drizzle-orm/mysql-core");
    import_drizzle_zod = require("drizzle-zod");
    users = (0, import_mysql_core.mysqlTable)("users", {
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
    salons = (0, import_mysql_core.mysqlTable)("salons", {
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
      whatsappNumber: (0, import_mysql_core.text)("whatsapp_number").default(""),
      landingTheme: (0, import_mysql_core.text)("landing_theme").default("dark"),
      // dark | light
      landingAccentColor: (0, import_mysql_core.text)("landing_accent_color").default("#F4A460"),
      landingBookingUrl: (0, import_mysql_core.text)("landing_booking_url").default("")
    });
    salonStaff = (0, import_mysql_core.mysqlTable)("salon_staff", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      userId: (0, import_mysql_core.varchar)("user_id", { length: 255 }).notNull(),
      salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
      role: (0, import_mysql_core.text)("role").notNull().default("staff"),
      // salon_admin | staff
      createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
    });
    plans = (0, import_mysql_core.mysqlTable)("plans", {
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
    subscriptions = (0, import_mysql_core.mysqlTable)("subscriptions", {
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
    licenseKeys = (0, import_mysql_core.mysqlTable)("license_keys", {
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
    licenseActivations = (0, import_mysql_core.mysqlTable)("license_activations", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      licenseKeyId: (0, import_mysql_core.varchar)("license_key_id", { length: 255 }).notNull(),
      deviceId: (0, import_mysql_core.text)("device_id").notNull(),
      email: (0, import_mysql_core.text)("email").default(""),
      activatedAt: (0, import_mysql_core.timestamp)("activated_at").defaultNow()
    });
    activityLogs = (0, import_mysql_core.mysqlTable)("activity_logs", {
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
    commissions = (0, import_mysql_core.mysqlTable)("commissions", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      bookingId: (0, import_mysql_core.varchar)("booking_id", { length: 255 }).notNull(),
      salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
      amount: (0, import_mysql_core.double)("amount").notNull().default(0),
      rate: (0, import_mysql_core.double)("rate").notNull().default(5),
      status: (0, import_mysql_core.text)("status").notNull().default("pending"),
      // pending | paid
      createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
    });
    expenses = (0, import_mysql_core.mysqlTable)("expenses", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
      description: (0, import_mysql_core.text)("description").notNull(),
      amount: (0, import_mysql_core.double)("amount").notNull(),
      category: (0, import_mysql_core.text)("category").default("general"),
      // rent | supplies | utilities | salaries | general
      date: (0, import_mysql_core.text)("date").notNull(),
      createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
    });
    shifts = (0, import_mysql_core.mysqlTable)("shifts", {
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
    services = (0, import_mysql_core.mysqlTable)("services", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
      name: (0, import_mysql_core.text)("name").notNull(),
      price: (0, import_mysql_core.double)("price").notNull(),
      duration: (0, import_mysql_core.text)("duration").notNull(),
      image: (0, import_mysql_core.text)("image").default(""),
      category: (0, import_mysql_core.text)("category").default("")
    });
    packages = (0, import_mysql_core.mysqlTable)("packages", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
      name: (0, import_mysql_core.text)("name").notNull(),
      price: (0, import_mysql_core.double)("price").notNull(),
      originalPrice: (0, import_mysql_core.double)("original_price").notNull(),
      services: (0, import_mysql_core.json)("services").$type().default([]),
      image: (0, import_mysql_core.text)("image").default("")
    });
    specialists = (0, import_mysql_core.mysqlTable)("specialists", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
      name: (0, import_mysql_core.text)("name").notNull(),
      role: (0, import_mysql_core.text)("role").notNull(),
      image: (0, import_mysql_core.text)("image").default(""),
      rating: (0, import_mysql_core.double)("rating").default(0)
    });
    reviews = (0, import_mysql_core.mysqlTable)("reviews", {
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
    bookings = (0, import_mysql_core.mysqlTable)("bookings", {
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
    bookmarkTable = (0, import_mysql_core.mysqlTable)("bookmarks", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      userId: (0, import_mysql_core.varchar)("user_id", { length: 255 }).notNull(),
      salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
      createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
    });
    messages = (0, import_mysql_core.mysqlTable)("messages", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      userId: (0, import_mysql_core.varchar)("user_id", { length: 255 }).notNull(),
      salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
      salonName: (0, import_mysql_core.text)("salon_name").notNull(),
      salonImage: (0, import_mysql_core.text)("salon_image").default(""),
      content: (0, import_mysql_core.text)("content").notNull(),
      sender: (0, import_mysql_core.text)("sender").notNull().default("salon"),
      senderName: (0, import_mysql_core.text)("sender_name").default(""),
      isRead: (0, import_mysql_core.int)("is_read").default(0),
      messageType: (0, import_mysql_core.text)("message_type").default("text"),
      createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
    });
    notifications = (0, import_mysql_core.mysqlTable)("notifications", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      userId: (0, import_mysql_core.varchar)("user_id", { length: 255 }).notNull(),
      title: (0, import_mysql_core.text)("title").notNull(),
      message: (0, import_mysql_core.text)("message").notNull(),
      type: (0, import_mysql_core.text)("type").notNull().default("system"),
      read: (0, import_mysql_core.boolean)("read").default(false),
      createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
    });
    coupons = (0, import_mysql_core.mysqlTable)("coupons", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      code: (0, import_mysql_core.varchar)("code", { length: 255 }).notNull().unique(),
      discount: (0, import_mysql_core.double)("discount").notNull(),
      type: (0, import_mysql_core.text)("type").notNull().default("percentage"),
      expiryDate: (0, import_mysql_core.text)("expiry_date").notNull(),
      usageLimit: (0, import_mysql_core.int)("usage_limit").default(0),
      usedCount: (0, import_mysql_core.int)("used_count").default(0),
      active: (0, import_mysql_core.boolean)("active").default(true),
      salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).default(""),
      createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
    });
    inventory = (0, import_mysql_core.mysqlTable)("inventory", {
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
    products = (0, import_mysql_core.mysqlTable)("products", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
      salonName: (0, import_mysql_core.text)("salon_name").default(""),
      name: (0, import_mysql_core.text)("name").notNull(),
      description: (0, import_mysql_core.text)("description").default(""),
      price: (0, import_mysql_core.double)("price").notNull(),
      image: (0, import_mysql_core.text)("image").default(""),
      category: (0, import_mysql_core.text)("category").default("general"),
      stock: (0, import_mysql_core.int)("stock").default(0),
      isActive: (0, import_mysql_core.boolean)("is_active").default(true),
      createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
    });
    productOrders = (0, import_mysql_core.mysqlTable)("product_orders", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      userId: (0, import_mysql_core.varchar)("user_id", { length: 255 }).notNull(),
      salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
      items: (0, import_mysql_core.json)("items").$type().default([]),
      totalPrice: (0, import_mysql_core.double)("total_price").notNull(),
      status: (0, import_mysql_core.text)("status").default("pending"),
      paymentMethod: (0, import_mysql_core.text)("payment_method").default("cash"),
      shippingAddress: (0, import_mysql_core.text)("shipping_address").default(""),
      phone: (0, import_mysql_core.text)("phone").default(""),
      notes: (0, import_mysql_core.text)("notes").default(""),
      createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
    });
    tips = (0, import_mysql_core.mysqlTable)("tips", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      bookingId: (0, import_mysql_core.varchar)("booking_id", { length: 255 }).notNull(),
      staffId: (0, import_mysql_core.varchar)("staff_id", { length: 255 }).notNull(),
      salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
      amount: (0, import_mysql_core.double)("amount").notNull(),
      createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
    });
    customerNotes = (0, import_mysql_core.mysqlTable)("customer_notes", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      salonId: (0, import_mysql_core.varchar)("salon_id", { length: 255 }).notNull(),
      customerId: (0, import_mysql_core.varchar)("customer_id", { length: 255 }).notNull(),
      note: (0, import_mysql_core.text)("note").notNull(),
      createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
    });
    loyaltyTransactions = (0, import_mysql_core.mysqlTable)("loyalty_transactions", {
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
    appSettings = (0, import_mysql_core.mysqlTable)("app_settings", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      key: (0, import_mysql_core.varchar)("key", { length: 255 }).notNull().unique(),
      value: (0, import_mysql_core.text)("value").notNull(),
      description: (0, import_mysql_core.text)("description").default(""),
      updatedAt: (0, import_mysql_core.timestamp)("updated_at").defaultNow()
    });
    trialRequests = (0, import_mysql_core.mysqlTable)("trial_requests", {
      id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
      salonName: (0, import_mysql_core.text)("salon_name").notNull(),
      ownerName: (0, import_mysql_core.text)("owner_name").notNull(),
      email: (0, import_mysql_core.varchar)("email", { length: 255 }).notNull(),
      phone: (0, import_mysql_core.text)("phone").notNull(),
      city: (0, import_mysql_core.text)("city").default(""),
      country: (0, import_mysql_core.text)("country").default(""),
      message: (0, import_mysql_core.text)("message").default(""),
      status: (0, import_mysql_core.text)("status").default("pending"),
      // pending | contacted | approved | rejected
      createdAt: (0, import_mysql_core.timestamp)("created_at").defaultNow()
    });
    insertUserSchema = (0, import_drizzle_zod.createInsertSchema)(users).pick({
      fullName: true,
      email: true,
      password: true
    });
  }
});

// server/db.ts
var dotenv, import_path, import_mysql2, import_promise, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    dotenv = __toESM(require("dotenv"));
    import_path = __toESM(require("path"));
    import_mysql2 = require("drizzle-orm/mysql2");
    import_promise = __toESM(require("mysql2/promise"));
    init_schema();
    dotenv.config({ path: import_path.default.resolve(process.cwd(), ".env") });
    pool = import_promise.default.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10
    });
    db = (0, import_mysql2.drizzle)(pool, { schema: schema_exports, mode: "default" });
  }
});

// server/whatsappService.ts
var whatsappService_exports = {};
__export(whatsappService_exports, {
  getWhatsAppLink: () => getWhatsAppLink,
  notifySalonViaWhatsApp: () => notifySalonViaWhatsApp,
  notifySuperAdminViaWhatsApp: () => notifySuperAdminViaWhatsApp,
  sendWhatsAppMessage: () => sendWhatsAppMessage
});
async function getSettings() {
  const now = Date.now();
  if (now - lastCacheFetch < 6e4 && Object.keys(settingsCache).length > 0) return settingsCache;
  try {
    const settings = await db.select().from(appSettings);
    const map = {};
    for (const s of settings) map[s.key] = s.value;
    settingsCache = map;
    lastCacheFetch = now;
    return map;
  } catch {
    return settingsCache;
  }
}
async function sendWhatsAppMessage(msg) {
  const settings = await getSettings();
  if (settings.whatsapp_enabled !== "true") {
    console.log(`[WhatsApp] Disabled - skipping message to ${msg.to}`);
    return false;
  }
  const phone = msg.to.replace(/[^0-9+]/g, "");
  if (!phone || phone.length < 8) return false;
  if (settings.whatsapp_api_token && settings.whatsapp_phone_id) {
    return sendViaCloudAPI(phone, msg.message, settings);
  }
  if (settings.whatsapp_webhook_url) {
    return sendViaWebhook(phone, msg.message, settings.whatsapp_webhook_url);
  }
  console.log(`[WhatsApp] No provider configured - message to ${phone}: ${msg.message.substring(0, 50)}...`);
  return false;
}
async function sendViaCloudAPI(phone, message, settings) {
  try {
    const phoneId = settings.whatsapp_phone_id;
    const token = settings.whatsapp_api_token;
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone.replace("+", ""),
        type: "text",
        text: { body: message }
      })
    });
    if (response.ok) {
      console.log(`[WhatsApp Cloud API] Message sent to ${phone}`);
      return true;
    } else {
      const err = await response.text();
      console.error(`[WhatsApp Cloud API] Failed: ${err}`);
      return false;
    }
  } catch (err) {
    console.error("[WhatsApp Cloud API] Error:", err);
    return false;
  }
}
async function sendViaWebhook(phone, message, webhookUrl) {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message, timestamp: Date.now() })
    });
    if (response.ok) {
      console.log(`[WhatsApp Webhook] Message sent to ${phone}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error("[WhatsApp Webhook] Error:", err);
    return false;
  }
}
function getWhatsAppLink(phone, message) {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}
async function notifySalonViaWhatsApp(salonId, message) {
  try {
    const { salons: salons2 } = (init_schema(), __toCommonJS(schema_exports));
    const [salon] = await db.select().from(salons2).where((0, import_drizzle_orm2.eq)(salons2.id, salonId));
    if (salon?.whatsappNumber) {
      await sendWhatsAppMessage({ to: salon.whatsappNumber, message });
    }
  } catch (err) {
    console.warn("[WhatsApp] Failed to notify salon:", err);
  }
}
async function notifySuperAdminViaWhatsApp(message) {
  const settings = await getSettings();
  const adminPhone = settings.whatsapp_admin_number;
  if (adminPhone) {
    await sendWhatsAppMessage({ to: adminPhone, message });
  }
}
var import_drizzle_orm2, settingsCache, lastCacheFetch;
var init_whatsappService = __esm({
  "server/whatsappService.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm2 = require("drizzle-orm");
    settingsCache = {};
    lastCacheFetch = 0;
  }
});

// server/emailService.ts
var emailService_exports = {};
__export(emailService_exports, {
  sendEmail: () => sendEmail,
  sendTrialRequestNotification: () => sendTrialRequestNotification
});
async function getSettings2() {
  const now = Date.now();
  if (now - lastCacheFetch2 < 6e4 && Object.keys(settingsCache2).length > 0) return settingsCache2;
  try {
    const settings = await db.select().from(appSettings);
    const map = {};
    for (const s of settings) map[s.key] = s.value;
    settingsCache2 = map;
    lastCacheFetch2 = now;
    return map;
  } catch {
    return settingsCache2;
  }
}
async function sendEmail(to, subject, html) {
  const settings = await getSettings2();
  if (settings.smtp_enabled !== "true") {
    console.log(`[Email] SMTP disabled - skipping email to ${to}: ${subject}`);
    return false;
  }
  const host = settings.smtp_host;
  const port = parseInt(settings.smtp_port || "587");
  const user = settings.smtp_user;
  const pass = settings.smtp_pass;
  const from = settings.smtp_from || user;
  if (!host || !user || !pass) {
    console.log("[Email] SMTP not configured - missing host/user/pass");
    return false;
  }
  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    await transporter.sendMail({
      from: `"Barmagly Platform" <${from}>`,
      to,
      subject,
      html
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
    return true;
  } catch (err) {
    console.error("[Email] Failed:", err);
    return false;
  }
}
async function sendTrialRequestNotification(data) {
  const settings = await getSettings2();
  const adminEmail = settings.smtp_admin_email || settings.smtp_user;
  if (!adminEmail) {
    console.log("[Email] No admin email configured");
    return false;
  }
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F4A460, #e8923c); padding: 24px 32px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; color: #181A20;">New Trial Request</h1>
        <p style="margin: 8px 0 0; color: #181A20; opacity: 0.8;">A new salon wants to join Barmagly</p>
      </div>
      <div style="padding: 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #999; width: 130px;">Salon Name</td><td style="padding: 8px 0; color: #fff; font-weight: 600;">${data.salonName}</td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Owner Name</td><td style="padding: 8px 0; color: #fff; font-weight: 600;">${data.ownerName}</td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Email</td><td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #F4A460;">${data.email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Phone</td><td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #F4A460;">${data.phone}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Location</td><td style="padding: 8px 0; color: #fff;">${data.city}${data.country ? ", " + data.country : ""}</td></tr>
          ${data.message ? `<tr><td style="padding: 8px 0; color: #999; vertical-align: top;">Message</td><td style="padding: 8px 0; color: #fff;">${data.message}</td></tr>` : ""}
        </table>
        <div style="margin-top: 24px; padding: 16px; background: rgba(244, 164, 96, 0.1); border-radius: 12px; border-left: 4px solid #F4A460;">
          <p style="margin: 0; color: #F4A460; font-size: 14px;">This salon requested a 14-day free trial. Please review and follow up.</p>
        </div>
      </div>
    </div>
  `;
  return sendEmail(adminEmail, `New Trial Request: ${data.salonName}`, html);
}
var settingsCache2, lastCacheFetch2;
var init_emailService = __esm({
  "server/emailService.ts"() {
    "use strict";
    init_db();
    init_schema();
    settingsCache2 = {};
    lastCacheFetch2 = 0;
  }
});

// server/index.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"));
var import_express_rate_limit = __toESM(require("express-rate-limit"));

// server/routes.ts
var import_node_http = require("node:http");
var import_node_crypto = __toESM(require("node:crypto"));
var import_express_session = __toESM(require("express-session"));
var import_express_mysql_session = __toESM(require("express-mysql-session"));
init_db();

// server/seed.ts
init_db();
init_schema();
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
    name: "Alpine Groom",
    image: salonHeroImages[0],
    address: "Bahnhofstrasse 42, 8001 Zurich, Switzerland",
    distance: "0.8 km",
    rating: 4.9,
    reviewCount: 3742,
    isOpen: true,
    openHours: "9:00 AM - 7:00 PM",
    phone: "+41 44 123 4567",
    about: "Alpine Groom is a premier barbershop in the heart of Zurich, blending Swiss precision with modern grooming. Our skilled stylists deliver impeccable cuts, classic shaves, and tailored grooming experiences in an elegant, welcoming atmosphere.",
    website: "www.alpinegroom.ch",
    latitude: 47.3769,
    longitude: 8.5417,
    gallery: makeGallery(0)
  },
  {
    id: "2",
    name: "Geneva Elegance",
    image: salonHeroImages[1],
    address: "Rue du Rhone 58, 1204 Geneva, Switzerland",
    distance: "1.5 km",
    rating: 4.7,
    reviewCount: 2890,
    isOpen: true,
    openHours: "8:30 AM - 7:30 PM",
    phone: "+41 22 765 4321",
    about: "Geneva Elegance brings together the finest in European beauty and grooming. From luxurious hair treatments to revitalizing facials, our French-trained specialists craft an experience of refinement in the heart of Geneva.",
    website: "www.genevaelegance.ch",
    latitude: 46.2044,
    longitude: 6.1432,
    gallery: makeGallery(2)
  },
  {
    id: "3",
    name: "Bern Classic Barbers",
    image: salonHeroImages[2],
    address: "Marktgasse 15, 3011 Bern, Switzerland",
    distance: "2.1 km",
    rating: 4.8,
    reviewCount: 4156,
    isOpen: true,
    openHours: "9:00 AM - 6:30 PM",
    phone: "+41 31 890 1234",
    about: "Bern Classic Barbers is a traditional barbershop offering old-world craftsmanship in the Swiss capital. Our master barbers specialize in precision fades, straight-razor shaves, and meticulous beard grooming in a warm, vintage setting.",
    website: "www.bernclassicbarbers.ch",
    latitude: 46.948,
    longitude: 7.4474,
    gallery: makeGallery(4)
  },
  {
    id: "4",
    name: "Lausanne Luxe Spa",
    image: salonHeroImages[3],
    address: "Avenue de la Gare 12, 1003 Lausanne, Switzerland",
    distance: "3.0 km",
    rating: 4.9,
    reviewCount: 3520,
    isOpen: true,
    openHours: "8:00 AM - 9:00 PM",
    phone: "+41 21 456 7890",
    about: "Lausanne Luxe Spa offers a five-star wellness experience overlooking Lake Geneva. Our award-winning therapists provide signature treatments including hot stone massages, anti-aging facials, and premium hair styling in a tranquil lakeside retreat.",
    website: "www.lausanneluxespa.ch",
    latitude: 46.5197,
    longitude: 6.6323,
    gallery: makeGallery(6)
  },
  {
    id: "5",
    name: "Munich Edge Studio",
    image: salonHeroImages[5],
    address: "Maximilianstrasse 28, 80539 Munich, Germany",
    distance: "4.2 km",
    rating: 4.6,
    reviewCount: 2680,
    isOpen: true,
    openHours: "9:00 AM - 8:00 PM",
    phone: "+49 89 234 5678",
    about: "Munich Edge Studio is a cutting-edge barbershop and salon in the heart of Munich. Combining Bavarian tradition with contemporary trends, our team delivers bold styles, sharp fades, and creative color work that sets you apart.",
    website: "www.munichedgestudio.de",
    latitude: 48.1351,
    longitude: 11.582,
    gallery: makeGallery(1)
  },
  {
    id: "6",
    name: "Vienna Heritage Salon",
    image: salonHeroImages[6],
    address: "Karntner Strasse 34, 1010 Vienna, Austria",
    distance: "1.0 km",
    rating: 4.8,
    reviewCount: 3210,
    isOpen: true,
    openHours: "8:00 AM - 7:00 PM",
    phone: "+43 1 567 8901",
    about: "Vienna Heritage Salon is a family-run establishment celebrating over 30 years of excellence in grooming. Our warm, classic interior and expert stylists deliver timeless cuts, elegant updos, and personalized beauty services for all ages.",
    website: "www.viennaheritagesalon.at",
    latitude: 48.2082,
    longitude: 16.3738,
    gallery: makeGallery(3)
  },
  {
    id: "7",
    name: "Basel Wellness Studio",
    image: salonHeroImages[4],
    address: "Freie Strasse 22, 4001 Basel, Switzerland",
    distance: "1.8 km",
    rating: 4.9,
    reviewCount: 3890,
    isOpen: true,
    openHours: "9:00 AM - 8:30 PM",
    phone: "+41 61 345 6789",
    about: "Basel Wellness Studio is a holistic beauty and wellness destination in the cultural heart of Basel. From deep tissue massages to organic hair treatments and rejuvenating facials, every service is crafted for total relaxation and renewal.",
    website: "www.baselwellness.ch",
    latitude: 47.5596,
    longitude: 7.5886,
    gallery: makeGallery(5)
  },
  {
    id: "8",
    name: "Lucerne Style House",
    image: salonHeroImages[7],
    address: "Hertensteinstrasse 8, 6004 Lucerne, Switzerland",
    distance: "2.5 km",
    rating: 4.5,
    reviewCount: 1980,
    isOpen: true,
    openHours: "10:00 AM - 7:00 PM",
    phone: "+41 41 678 9012",
    about: "Lucerne Style House is a modern salon in the picturesque city of Lucerne, specializing in trend-forward cuts, vivid colors, and creative styling. Our passionate team brings international flair to every appointment.",
    website: "www.lucernestylehouse.ch",
    latitude: 47.0502,
    longitude: 8.3093,
    gallery: makeGallery(7)
  }
];
var salonServices = {
  "1": [
    { name: "Precision Haircut", price: 55, duration: "30 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Blow Dry & Style", price: 40, duration: "25 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Full Hair Color", price: 120, duration: "90 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Balayage Highlights", price: 180, duration: "120 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Deep Conditioning", price: 60, duration: "30 min", image: serviceImages.hairColor, category: "Hair Treatment" },
    { name: "Classic Facial", price: 75, duration: "45 min", image: serviceImages.facial, category: "Facial" },
    { name: "Hot Towel Shave", price: 45, duration: "30 min", image: serviceImages.haircut, category: "Shave" },
    { name: "Gel Manicure", price: 50, duration: "35 min", image: serviceImages.nails, category: "Nails" },
    { name: "Spa Pedicure", price: 60, duration: "45 min", image: serviceImages.nails, category: "Nails" },
    { name: "Relaxation Massage", price: 95, duration: "60 min", image: serviceImages.massage, category: "Massage" }
  ],
  "2": [
    { name: "Women's Haircut", price: 65, duration: "35 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Children's Haircut", price: 35, duration: "20 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Root Touch Up", price: 85, duration: "60 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Ombre Color", price: 160, duration: "120 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Keratin Treatment", price: 220, duration: "150 min", image: serviceImages.hairColor, category: "Hair Treatment" },
    { name: "Hydrating Facial", price: 80, duration: "50 min", image: serviceImages.facial, category: "Facial" },
    { name: "Evening Makeup", price: 90, duration: "60 min", image: serviceImages.facialMakeup, category: "Make Up" },
    { name: "Acrylic Nails", price: 65, duration: "60 min", image: serviceImages.nails, category: "Nails" },
    { name: "Swedish Massage", price: 100, duration: "60 min", image: serviceImages.massage, category: "Massage" },
    { name: "Eyebrow Shaping", price: 25, duration: "15 min", image: serviceImages.facialMakeup, category: "Make Up" }
  ],
  "3": [
    { name: "Classic Haircut", price: 45, duration: "25 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Buzz Cut", price: 30, duration: "15 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Hot Towel Shave", price: 40, duration: "30 min", image: serviceImages.haircut, category: "Shave" },
    { name: "Beard Trim", price: 25, duration: "15 min", image: serviceImages.haircut, category: "Beard" },
    { name: "Fade & Design", price: 55, duration: "40 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Hair & Beard Combo", price: 65, duration: "45 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Scalp Treatment", price: 40, duration: "20 min", image: serviceImages.massage, category: "Hair Treatment" },
    { name: "Gray Blending", price: 60, duration: "40 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Head Massage", price: 35, duration: "15 min", image: serviceImages.massage, category: "Massage" },
    { name: "Straight Razor Lineup", price: 20, duration: "10 min", image: serviceImages.haircut, category: "Shave" }
  ],
  "4": [
    { name: "Luxury Haircut", price: 80, duration: "40 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Diamond Facial", price: 130, duration: "60 min", image: serviceImages.facial, category: "Facial" },
    { name: "Gold Mask Treatment", price: 150, duration: "75 min", image: serviceImages.facial, category: "Facial" },
    { name: "Full Color & Gloss", price: 200, duration: "120 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Hot Stone Massage", price: 160, duration: "90 min", image: serviceImages.massage, category: "Massage" },
    { name: "Aromatherapy Massage", price: 140, duration: "75 min", image: serviceImages.massage, category: "Massage" },
    { name: "Deluxe Manicure", price: 70, duration: "45 min", image: serviceImages.nails, category: "Nails" },
    { name: "Deluxe Pedicure", price: 80, duration: "50 min", image: serviceImages.nails, category: "Nails" },
    { name: "Lash Extensions", price: 110, duration: "90 min", image: serviceImages.facialMakeup, category: "Make Up" }
  ],
  "5": [
    { name: "Men's Haircut", price: 45, duration: "25 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Skin Fade", price: 50, duration: "35 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Beard Sculpting", price: 35, duration: "20 min", image: serviceImages.haircut, category: "Beard" },
    { name: "Razor Shave", price: 40, duration: "25 min", image: serviceImages.haircut, category: "Shave" },
    { name: "Hair Design", price: 60, duration: "45 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Color Camo", price: 55, duration: "30 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Scalp Massage", price: 30, duration: "15 min", image: serviceImages.massage, category: "Massage" },
    { name: "Face Mask", price: 45, duration: "25 min", image: serviceImages.facial, category: "Facial" }
  ],
  "6": [
    { name: "Family Haircut", price: 40, duration: "25 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Children's Cut", price: 28, duration: "20 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Senior's Cut", price: 32, duration: "20 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Basic Color", price: 75, duration: "60 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Highlights", price: 110, duration: "90 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Express Facial", price: 50, duration: "30 min", image: serviceImages.facial, category: "Facial" },
    { name: "Quick Makeup", price: 55, duration: "30 min", image: serviceImages.facialMakeup, category: "Make Up" },
    { name: "Classic Manicure", price: 35, duration: "25 min", image: serviceImages.nails, category: "Nails" },
    { name: "Classic Pedicure", price: 40, duration: "30 min", image: serviceImages.nails, category: "Nails" },
    { name: "Back & Shoulder Massage", price: 65, duration: "30 min", image: serviceImages.massage, category: "Massage" }
  ],
  "7": [
    { name: "Signature Haircut", price: 65, duration: "35 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Anti-Aging Facial", price: 110, duration: "60 min", image: serviceImages.facial, category: "Facial" },
    { name: "Vitamin C Facial", price: 95, duration: "50 min", image: serviceImages.facial, category: "Facial" },
    { name: "Deep Tissue Massage", price: 140, duration: "90 min", image: serviceImages.massage, category: "Massage" },
    { name: "Thai Massage", price: 120, duration: "75 min", image: serviceImages.massage, category: "Massage" },
    { name: "Body Scrub & Wrap", price: 170, duration: "90 min", image: serviceImages.massage, category: "Spa" },
    { name: "Luxury Manicure", price: 55, duration: "40 min", image: serviceImages.nails, category: "Nails" },
    { name: "Luxury Pedicure", price: 65, duration: "50 min", image: serviceImages.nails, category: "Nails" },
    { name: "Organic Color", price: 130, duration: "90 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Scalp Detox", price: 75, duration: "40 min", image: serviceImages.massage, category: "Hair Treatment" }
  ],
  "8": [
    { name: "Trendy Cut", price: 55, duration: "30 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Undercut Design", price: 65, duration: "40 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Vivid Color", price: 150, duration: "120 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Pastel Tones", price: 170, duration: "150 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Creative Braids", price: 85, duration: "60 min", image: serviceImages.haircut, category: "Hair Styling" },
    { name: "Festival Makeup", price: 70, duration: "45 min", image: serviceImages.facialMakeup, category: "Make Up" },
    { name: "Nail Art", price: 65, duration: "60 min", image: serviceImages.nails, category: "Nails" },
    { name: "Express Facial", price: 55, duration: "30 min", image: serviceImages.facial, category: "Facial" },
    { name: "Head & Neck Massage", price: 50, duration: "25 min", image: serviceImages.massage, category: "Massage" }
  ]
};
var salonPackages = {
  "1": [
    { name: "Swiss Signature", price: 130, originalPrice: 170, services: ["Precision Haircut", "Blow Dry & Style", "Classic Facial"], image: serviceImages.haircut },
    { name: "Color & Care", price: 200, originalPrice: 255, services: ["Full Hair Color", "Deep Conditioning", "Relaxation Massage"], image: serviceImages.hairColor },
    { name: "Alpine Retreat", price: 300, originalPrice: 380, services: ["Balayage Highlights", "Gel Manicure", "Spa Pedicure", "Relaxation Massage"], image: serviceImages.massage }
  ],
  "2": [
    { name: "Quick Refresh", price: 110, originalPrice: 140, services: ["Women's Haircut", "Hydrating Facial", "Eyebrow Shaping"], image: serviceImages.haircut },
    { name: "Color Queen", price: 210, originalPrice: 260, services: ["Ombre Color", "Keratin Treatment"], image: serviceImages.hairColor },
    { name: "Total Makeover", price: 280, originalPrice: 350, services: ["Women's Haircut", "Evening Makeup", "Acrylic Nails", "Swedish Massage"], image: serviceImages.facialMakeup }
  ],
  "3": [
    { name: "Gentleman's Classic", price: 85, originalPrice: 110, services: ["Classic Haircut", "Hot Towel Shave", "Head Massage"], image: serviceImages.haircut },
    { name: "Sharp & Clean", price: 95, originalPrice: 120, services: ["Fade & Design", "Beard Trim", "Straight Razor Lineup"], image: serviceImages.haircut },
    { name: "Executive Grooming", price: 140, originalPrice: 175, services: ["Hair & Beard Combo", "Scalp Treatment", "Gray Blending"], image: serviceImages.hairColor }
  ],
  "4": [
    { name: "Royal Treatment", price: 280, originalPrice: 350, services: ["Luxury Haircut", "Diamond Facial", "Aromatherapy Massage"], image: serviceImages.facial },
    { name: "Gold Experience", price: 350, originalPrice: 430, services: ["Full Color & Gloss", "Gold Mask Treatment", "Deluxe Manicure"], image: serviceImages.hairColor },
    { name: "Ultimate Indulgence", price: 420, originalPrice: 530, services: ["Luxury Haircut", "Hot Stone Massage", "Lash Extensions", "Deluxe Pedicure"], image: serviceImages.massage }
  ],
  "5": [
    { name: "Quick Trim", price: 75, originalPrice: 95, services: ["Men's Haircut", "Beard Sculpting", "Scalp Massage"], image: serviceImages.haircut },
    { name: "Fresh Fade", price: 90, originalPrice: 115, services: ["Skin Fade", "Razor Shave", "Face Mask"], image: serviceImages.haircut },
    { name: "Style Master", price: 120, originalPrice: 150, services: ["Hair Design", "Color Camo", "Scalp Massage"], image: serviceImages.hairColor }
  ],
  "6": [
    { name: "Family Bundle", price: 60, originalPrice: 75, services: ["Family Haircut", "Children's Cut"], image: serviceImages.haircut },
    { name: "Pamper Day", price: 130, originalPrice: 165, services: ["Family Haircut", "Express Facial", "Classic Manicure", "Classic Pedicure"], image: serviceImages.facial },
    { name: "Full Glow Up", price: 190, originalPrice: 240, services: ["Highlights", "Quick Makeup", "Classic Manicure", "Back & Shoulder Massage"], image: serviceImages.hairColor }
  ],
  "7": [
    { name: "Zen Retreat", price: 240, originalPrice: 300, services: ["Anti-Aging Facial", "Deep Tissue Massage", "Scalp Detox"], image: serviceImages.massage },
    { name: "Beauty & Bliss", price: 190, originalPrice: 240, services: ["Signature Haircut", "Vitamin C Facial", "Luxury Manicure"], image: serviceImages.facial },
    { name: "Total Wellness", price: 400, originalPrice: 500, services: ["Thai Massage", "Body Scrub & Wrap", "Luxury Pedicure", "Organic Color"], image: serviceImages.massage }
  ],
  "8": [
    { name: "Street Style", price: 110, originalPrice: 140, services: ["Trendy Cut", "Undercut Design", "Head & Neck Massage"], image: serviceImages.haircut },
    { name: "Color Pop", price: 220, originalPrice: 280, services: ["Vivid Color", "Creative Braids", "Express Facial"], image: serviceImages.hairColor },
    { name: "Festival Ready", price: 270, originalPrice: 340, services: ["Pastel Tones", "Festival Makeup", "Nail Art"], image: serviceImages.facialMakeup }
  ]
};
var salonSpecialists = {
  "1": [
    { name: "Lukas Meier", role: "Senior Stylist", image: specialistImages[0], rating: 4.9 },
    { name: "Anna Keller", role: "Color Specialist", image: specialistImages[1], rating: 4.8 },
    { name: "Marc Huber", role: "Master Barber", image: specialistImages[2], rating: 4.9 },
    { name: "Sophie Brunner", role: "Nail Technician", image: specialistImages[3], rating: 4.7 },
    { name: "Thomas Widmer", role: "Massage Therapist", image: specialistImages[4], rating: 4.8 }
  ],
  "2": [
    { name: "Claire Dupont", role: "Lead Stylist", image: specialistImages[5], rating: 4.8 },
    { name: "Pierre Laurent", role: "Hair Colorist", image: specialistImages[0], rating: 4.7 },
    { name: "Isabelle Martin", role: "Esthetician", image: specialistImages[1], rating: 4.9 },
    { name: "Jean-Luc Bernard", role: "Makeup Artist", image: specialistImages[2], rating: 4.6 },
    { name: "Marie Favre", role: "Nail Artist", image: specialistImages[3], rating: 4.8 }
  ],
  "3": [
    { name: "Stefan Berger", role: "Master Barber", image: specialistImages[4], rating: 4.9 },
    { name: "Reto Schwarz", role: "Senior Barber", image: specialistImages[0], rating: 4.8 },
    { name: "Niklaus Fischer", role: "Fade Specialist", image: specialistImages[2], rating: 4.9 },
    { name: "Daniel Gerber", role: "Beard Expert", image: specialistImages[4], rating: 4.7 }
  ],
  "4": [
    { name: "Camille Blanc", role: "Luxury Stylist", image: specialistImages[5], rating: 4.9 },
    { name: "Philippe Rochat", role: "Spa Director", image: specialistImages[0], rating: 4.8 },
    { name: "Valentina Rossi", role: "Esthetician", image: specialistImages[1], rating: 4.9 },
    { name: "Nicolas Aubert", role: "Massage Specialist", image: specialistImages[2], rating: 4.7 },
    { name: "Elena Bianchi", role: "Lash Technician", image: specialistImages[3], rating: 4.8 }
  ],
  "5": [
    { name: "Maximilian Braun", role: "Head Barber", image: specialistImages[4], rating: 4.7 },
    { name: "Felix Wagner", role: "Fade Artist", image: specialistImages[0], rating: 4.6 },
    { name: "Tobias Schmidt", role: "Style Expert", image: specialistImages[2], rating: 4.5 },
    { name: "Markus Bauer", role: "Beard Specialist", image: specialistImages[4], rating: 4.8 }
  ],
  "6": [
    { name: "Elisabeth Gruber", role: "Family Stylist", image: specialistImages[5], rating: 4.8 },
    { name: "Franz Hofer", role: "Senior Barber", image: specialistImages[0], rating: 4.7 },
    { name: "Maria Steiner", role: "Children's Specialist", image: specialistImages[1], rating: 4.9 },
    { name: "Wolfgang Pichler", role: "Colorist", image: specialistImages[2], rating: 4.6 },
    { name: "Sabine Winkler", role: "Nail Technician", image: specialistImages[3], rating: 4.8 }
  ],
  "7": [
    { name: "Dr. Lena Roth", role: "Spa Therapist", image: specialistImages[5], rating: 4.9 },
    { name: "Oliver Schneider", role: "Senior Stylist", image: specialistImages[0], rating: 4.8 },
    { name: "Yuki Tanaka", role: "Massage Expert", image: specialistImages[1], rating: 4.9 },
    { name: "Andreas Frey", role: "Hair Colorist", image: specialistImages[2], rating: 4.7 },
    { name: "Katarina Novak", role: "Esthetician", image: specialistImages[3], rating: 4.9 }
  ],
  "8": [
    { name: "Lea Zimmermann", role: "Creative Director", image: specialistImages[5], rating: 4.6 },
    { name: "Patrick Mueller", role: "Color Innovator", image: specialistImages[0], rating: 4.5 },
    { name: "Nina Weber", role: "Braid Specialist", image: specialistImages[1], rating: 4.7 },
    { name: "Sandra Vogel", role: "Nail Artist", image: specialistImages[3], rating: 4.4 },
    { name: "Jan Kessler", role: "Trend Stylist", image: specialistImages[4], rating: 4.5 }
  ]
};
var salonReviews = {
  "1": [
    { userName: "Emma Hofmann", userImage: reviewerImages[0], rating: 5, comment: "Absolutely love Alpine Groom! My balayage turned out stunning and the team was so attentive.", date: "2 days ago" },
    { userName: "Michael Weber", userImage: reviewerImages[1], rating: 5, comment: "Best facial I have ever had. My skin is glowing! Will definitely be back.", date: "5 days ago" },
    { userName: "Robert Fischer", userImage: reviewerImages[2], rating: 4, comment: "Great haircut and very relaxing atmosphere. Swiss quality at its finest.", date: "1 week ago" },
    { userName: "Laura Schmid", userImage: reviewerImages[3], rating: 5, comment: "The hot towel shave was incredible. True craftmanship in every detail.", date: "2 weeks ago" },
    { userName: "David Schneider", userImage: reviewerImages[4], rating: 4, comment: "Clean salon, professional staff. The massage was incredibly relaxing.", date: "3 weeks ago" },
    { userName: "Jessica Mueller", userImage: reviewerImages[5], rating: 5, comment: "Sophie did an amazing job on my nails. So detailed and long-lasting!", date: "1 month ago" }
  ],
  "2": [
    { userName: "Marie Lefevre", userImage: reviewerImages[1], rating: 5, comment: "Claire is a genius with color! My ombre looks so natural and beautiful.", date: "1 day ago" },
    { userName: "Christian Favre", userImage: reviewerImages[2], rating: 4, comment: "Wonderful ambiance and friendly staff. The keratin treatment made my hair silky smooth.", date: "4 days ago" },
    { userName: "Nicole Perrin", userImage: reviewerImages[3], rating: 5, comment: "Brought my daughter for her first haircut here. They were so patient and sweet with her!", date: "1 week ago" },
    { userName: "Matthieu Blanc", userImage: reviewerImages[0], rating: 4, comment: "Solid haircut and good conversation. Excellent quality for the price.", date: "2 weeks ago" },
    { userName: "Laura Girard", userImage: reviewerImages[4], rating: 5, comment: "The Swedish massage melted all my stress away. Marie's nail work is art!", date: "3 weeks ago" }
  ],
  "3": [
    { userName: "Marco Bieri", userImage: reviewerImages[5], rating: 5, comment: "Best barbershop in Bern, hands down. Stefan gave me the cleanest fade I have ever had.", date: "3 days ago" },
    { userName: "Florian Keller", userImage: reviewerImages[0], rating: 5, comment: "The hot towel shave is an experience every man needs. Old-school quality at its finest.", date: "1 week ago" },
    { userName: "Peter Brunner", userImage: reviewerImages[2], rating: 5, comment: "Been coming here for years. Consistent, quality work every single time.", date: "2 weeks ago" },
    { userName: "Jonas Huber", userImage: reviewerImages[4], rating: 4, comment: "Great barbers but it can get crowded on weekends. Book ahead if you can.", date: "3 weeks ago" },
    { userName: "Kevin Frei", userImage: reviewerImages[1], rating: 5, comment: "Niklaus did an incredible design on my fade. Getting compliments everywhere!", date: "1 month ago" },
    { userName: "Samuel Wyss", userImage: reviewerImages[3], rating: 5, comment: "My go-to spot for a clean lineup. Professional and efficient every time.", date: "1 month ago" }
  ],
  "4": [
    { userName: "Victoria Rochat", userImage: reviewerImages[3], rating: 5, comment: "The Gold Mask Treatment was divine. My skin feels 10 years younger!", date: "2 days ago" },
    { userName: "Catherine Morel", userImage: reviewerImages[1], rating: 5, comment: "Hot stone massage was absolutely heavenly. The lakeside ambiance is so luxurious.", date: "5 days ago" },
    { userName: "Richard Bonvin", userImage: reviewerImages[2], rating: 4, comment: "Premium experience with premium prices. You get what you pay for here.", date: "1 week ago" },
    { userName: "Diana Favre", userImage: reviewerImages[4], rating: 5, comment: "Camille is the best stylist I have ever had. She understands exactly what I want.", date: "2 weeks ago" },
    { userName: "William Aubert", userImage: reviewerImages[0], rating: 4, comment: "Excellent service and beautiful space. Lash extensions look very natural.", date: "1 month ago" }
  ],
  "5": [
    { userName: "Jakob Hoffmann", userImage: reviewerImages[0], rating: 5, comment: "Maximilian gives the best fades in Munich. Quick, clean, and reliable.", date: "1 day ago" },
    { userName: "Tobias Richter", userImage: reviewerImages[2], rating: 4, comment: "Good barbershop with a cool modern vibe. The face mask was a nice touch.", date: "3 days ago" },
    { userName: "Erik Becker", userImage: reviewerImages[5], rating: 5, comment: "Been to many barbers but Munich Edge is something special. Highly recommend!", date: "1 week ago" },
    { userName: "Niklas Lang", userImage: reviewerImages[4], rating: 4, comment: "Solid haircut at a fair price. The guys here really know their craft.", date: "2 weeks ago" },
    { userName: "Alexander Wolf", userImage: reviewerImages[1], rating: 4, comment: "My beard has never looked this good. Markus is a true beard specialist.", date: "3 weeks ago" },
    { userName: "Benjamin Klein", userImage: reviewerImages[3], rating: 5, comment: "Tobias gave me exactly the style I wanted. Great attention to detail.", date: "1 month ago" }
  ],
  "6": [
    { userName: "Angela Huber", userImage: reviewerImages[3], rating: 5, comment: "We bring the whole family here! Elisabeth is wonderful with the kids.", date: "2 days ago" },
    { userName: "Patricia Gruber", userImage: reviewerImages[1], rating: 5, comment: "Affordable and high quality. My highlights look amazing! Best value in Vienna.", date: "4 days ago" },
    { userName: "Thomas Berger", userImage: reviewerImages[0], rating: 4, comment: "Good neighborhood salon. Franz always gives me a great cut.", date: "1 week ago" },
    { userName: "Linda Pichler", userImage: reviewerImages[4], rating: 5, comment: "Maria is the best with children's haircuts. My toddler actually enjoyed it!", date: "2 weeks ago" },
    { userName: "Georg Moser", userImage: reviewerImages[2], rating: 4, comment: "Friendly staff and clean shop. The back massage was a nice surprise bonus.", date: "3 weeks ago" },
    { userName: "Rosa Bauer", userImage: reviewerImages[5], rating: 5, comment: "Love this place! The whole family leaves happy every single visit.", date: "1 month ago" }
  ],
  "7": [
    { userName: "Sophia Keller", userImage: reviewerImages[4], rating: 5, comment: "The deep tissue massage was transformative. Dr. Roth has healing hands.", date: "1 day ago" },
    { userName: "Olivia Brandt", userImage: reviewerImages[1], rating: 5, comment: "Best spa experience in Basel! The body scrub and wrap left me feeling reborn.", date: "3 days ago" },
    { userName: "Emma Weber", userImage: reviewerImages[3], rating: 5, comment: "The anti-aging facial is worth every penny. Visible results after just one session!", date: "1 week ago" },
    { userName: "James Foster", userImage: reviewerImages[0], rating: 4, comment: "Oliver gave me an excellent haircut. The whole spa atmosphere is very calming.", date: "2 weeks ago" },
    { userName: "Rachel Maurer", userImage: reviewerImages[5], rating: 5, comment: "Yuki's Thai massage is absolutely incredible. I come back every month now.", date: "3 weeks ago" },
    { userName: "Daniel Schafer", userImage: reviewerImages[2], rating: 5, comment: "Organic color turned out beautifully. Katarina's facials are magical too.", date: "1 month ago" }
  ],
  "8": [
    { userName: "Megan Ritter", userImage: reviewerImages[4], rating: 5, comment: "Lea is a creative genius! My vivid purple turned out insanely good.", date: "1 day ago" },
    { userName: "Sarah Graf", userImage: reviewerImages[1], rating: 4, comment: "Trendy salon with great energy. The undercut design was exactly what I wanted.", date: "3 days ago" },
    { userName: "Taylor Kuhn", userImage: reviewerImages[3], rating: 4, comment: "Love the vibe here. Pastel tones came out perfectly. A bit pricey though.", date: "1 week ago" },
    { userName: "Jordan Lenz", userImage: reviewerImages[0], rating: 5, comment: "Nina's braids are absolute works of art. Got so many compliments!", date: "2 weeks ago" },
    { userName: "Chris Ernst", userImage: reviewerImages[2], rating: 4, comment: "Cool spot with talented stylists. Nail art by Sandra was stunning.", date: "3 weeks ago" },
    { userName: "Morgan Baumann", userImage: reviewerImages[5], rating: 4, comment: "Great atmosphere and music. Jan nailed the trendy cut I was going for.", date: "1 month ago" }
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
  console.log("Seeding database with European/Swiss data...");
  await db.delete(tips);
  await db.delete(customerNotes);
  await db.delete(loyaltyTransactions);
  await db.delete(commissions);
  await db.delete(shifts);
  await db.delete(inventory);
  await db.delete(expenses);
  await db.delete(activityLogs);
  await db.delete(subscriptions);
  await db.delete(licenseKeys);
  await db.delete(salonStaff);
  await db.delete(bookings);
  await db.delete(messages);
  await db.delete(notifications);
  await db.delete(coupons);
  await db.delete(reviews);
  await db.delete(specialists);
  await db.delete(packages);
  await db.delete(services);
  await db.delete(salons);
  await db.delete(plans);
  await db.delete(users);
  const bcrypt3 = require("bcryptjs");
  const adminPassword = await bcrypt3.hash("admin123", 10);
  const demoPassword = await bcrypt3.hash("demo123", 10);
  await db.insert(users).values([
    {
      id: "00000000-0000-0000-0000-000000000000",
      fullName: "Platform Admin",
      email: "admin@barber.com",
      password: adminPassword,
      role: "super_admin",
      phone: "+41 44 000 0001",
      loyaltyPoints: 1e3,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
    },
    {
      id: "00000000-0000-0000-0000-000000000001",
      fullName: "Lukas Meier",
      email: "lukas@alpinegroom.ch",
      password: demoPassword,
      role: "salon_admin",
      phone: "+41 44 123 4567",
      avatar: specialistImages[0]
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      fullName: "Claire Dupont",
      email: "claire@genevaelegance.ch",
      password: demoPassword,
      role: "salon_admin",
      phone: "+41 22 765 4321",
      avatar: specialistImages[5]
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      fullName: "Stefan Berger",
      email: "stefan@bernclassic.ch",
      password: demoPassword,
      role: "salon_admin",
      phone: "+41 31 890 1234",
      avatar: specialistImages[4]
    },
    {
      id: "00000000-0000-0000-0000-000000000010",
      fullName: "Emma Hofmann",
      email: "emma@example.com",
      password: demoPassword,
      role: "user",
      phone: "+41 78 111 2233",
      avatar: reviewerImages[0],
      loyaltyPoints: 250
    },
    {
      id: "00000000-0000-0000-0000-000000000011",
      fullName: "Michael Weber",
      email: "michael@example.com",
      password: demoPassword,
      role: "user",
      phone: "+41 79 222 3344",
      avatar: reviewerImages[1],
      loyaltyPoints: 180
    },
    {
      id: "00000000-0000-0000-0000-000000000012",
      fullName: "Robert Fischer",
      email: "robert@example.com",
      password: demoPassword,
      role: "user",
      phone: "+49 170 333 4455",
      avatar: reviewerImages[2],
      loyaltyPoints: 420
    },
    {
      id: "00000000-0000-0000-0000-000000000020",
      fullName: "Marc Huber",
      email: "marc@alpinegroom.ch",
      password: demoPassword,
      role: "staff",
      phone: "+41 44 123 4568",
      avatar: specialistImages[2]
    },
    {
      id: "00000000-0000-0000-0000-000000000021",
      fullName: "Anna Keller",
      email: "anna@alpinegroom.ch",
      password: demoPassword,
      role: "staff",
      phone: "+41 44 123 4569",
      avatar: specialistImages[1]
    }
  ]);
  await db.insert(salons).values(salonData.map((s) => ({
    ...s,
    ownerId: s.id === "1" ? "00000000-0000-0000-0000-000000000001" : s.id === "2" ? "00000000-0000-0000-0000-000000000002" : s.id === "3" ? "00000000-0000-0000-0000-000000000003" : ""
  })));
  await db.insert(salonStaff).values([
    { userId: "00000000-0000-0000-0000-000000000001", salonId: "1", role: "salon_admin" },
    { userId: "00000000-0000-0000-0000-000000000020", salonId: "1", role: "staff" },
    { userId: "00000000-0000-0000-0000-000000000021", salonId: "1", role: "staff" },
    { userId: "00000000-0000-0000-0000-000000000002", salonId: "2", role: "salon_admin" },
    { userId: "00000000-0000-0000-0000-000000000003", salonId: "3", role: "salon_admin" }
  ]);
  await db.insert(plans).values([
    {
      id: "plan-basic",
      name: "Basic",
      price: 29,
      billingCycle: "monthly",
      features: ["Up to 50 bookings per month", "Basic analytics", "Email support", "1 staff member"],
      commissionRate: 8,
      maxBookings: 50,
      maxStaff: 1,
      isActive: true
    },
    {
      id: "plan-pro",
      name: "Pro",
      price: 79,
      billingCycle: "monthly",
      features: ["Unlimited bookings", "Advanced analytics", "Priority support", "Up to 5 staff", "Custom landing page", "Inventory management"],
      commissionRate: 5,
      maxBookings: 0,
      maxStaff: 5,
      isActive: true
    },
    {
      id: "plan-enterprise",
      name: "Enterprise",
      price: 149,
      billingCycle: "monthly",
      features: ["Unlimited everything", "Dedicated account manager", "API access", "White-label options", "Custom integrations", "Multi-location support"],
      commissionRate: 3,
      maxBookings: 0,
      maxStaff: 0,
      isActive: true
    }
  ]);
  await db.insert(subscriptions).values([
    { salonId: "1", planId: "plan-pro", status: "active", startDate: "2025-01-01", endDate: "2026-01-01" },
    { salonId: "2", planId: "plan-enterprise", status: "active", startDate: "2025-02-01", endDate: "2026-02-01" },
    { salonId: "3", planId: "plan-basic", status: "active", startDate: "2025-03-01", endDate: "2026-03-01" },
    { salonId: "4", planId: "plan-pro", status: "active", startDate: "2025-01-15", endDate: "2026-01-15" },
    { salonId: "5", planId: "plan-basic", status: "active", startDate: "2025-04-01", endDate: "2026-04-01" },
    { salonId: "6", planId: "plan-pro", status: "active", startDate: "2025-02-15", endDate: "2026-02-15" },
    { salonId: "7", planId: "plan-enterprise", status: "active", startDate: "2025-01-01", endDate: "2026-01-01" },
    { salonId: "8", planId: "plan-basic", status: "active", startDate: "2025-05-01", endDate: "2026-05-01" }
  ]);
  await db.insert(licenseKeys).values([
    { key: "ALPINE-GROOM-2025-XXXX", salonId: "1", planId: "plan-pro", status: "active", expiresAt: "2026-01-01", maxActivations: 3, activationCount: 1 },
    { key: "GENEVA-ELEG-2025-XXXX", salonId: "2", planId: "plan-enterprise", status: "active", expiresAt: "2026-02-01", maxActivations: 5, activationCount: 2 },
    { key: "BERN-CLASSIC-2025-XXXX", salonId: "3", planId: "plan-basic", status: "active", expiresAt: "2026-03-01", maxActivations: 1, activationCount: 1 },
    { key: "DEMO-FREE-TRIAL-2025", salonId: "", planId: "", status: "unused", expiresAt: "2026-12-31", maxActivations: 0, activationCount: 0 }
  ]);
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
  await db.insert(coupons).values([
    { code: "WELCOME10", discount: 10, type: "percentage", expiryDate: "2026-12-31", usageLimit: 100, active: true },
    { code: "SWISS20", discount: 20, type: "percentage", expiryDate: "2026-06-30", usageLimit: 50, active: true },
    { code: "SAVE15", discount: 15, type: "fixed", expiryDate: "2026-09-30", usageLimit: 200, active: true },
    { code: "SUMMER25", discount: 25, type: "percentage", expiryDate: "2026-08-31", usageLimit: 100, active: true }
  ]);
  await db.insert(messages).values([
    { userId: "00000000-0000-0000-0000-000000000010", salonId: "1", salonName: "Alpine Groom", content: "Hello, I would like to confirm my appointment for Saturday.", sender: "user" },
    { userId: "00000000-0000-0000-0000-000000000010", salonId: "1", salonName: "Alpine Groom", content: "Of course! Your appointment on Saturday at 10:00 AM is confirmed. See you then!", sender: "salon" },
    { userId: "00000000-0000-0000-0000-000000000011", salonId: "2", salonName: "Geneva Elegance", content: "Do you offer keratin treatment for men?", sender: "user" },
    { userId: "00000000-0000-0000-0000-000000000011", salonId: "2", salonName: "Geneva Elegance", content: "Absolutely! Our keratin treatment works great for all hair types. Would you like to book?", sender: "salon" },
    { userId: "00000000-0000-0000-0000-000000000012", salonId: "3", salonName: "Bern Classic Barbers", content: "What are your available slots for tomorrow?", sender: "user" },
    { userId: "00000000-0000-0000-0000-000000000012", salonId: "3", salonName: "Bern Classic Barbers", content: "We have openings at 11:00 AM, 2:00 PM, and 4:30 PM. Which works best for you?", sender: "salon" }
  ]);
  await db.insert(notifications).values([
    { userId: "00000000-0000-0000-0000-000000000010", title: "Booking Confirmed", message: "Your appointment at Alpine Groom on Saturday at 10:00 AM has been confirmed.", type: "booking", read: false },
    { userId: "00000000-0000-0000-0000-000000000010", title: "Welcome Bonus", message: "You have earned 50 loyalty points as a welcome bonus! Use them on your next visit.", type: "loyalty", read: true },
    { userId: "00000000-0000-0000-0000-000000000011", title: "Special Offer", message: "Get 20% off your next visit to Geneva Elegance with code SWISS20.", type: "promotion", read: false },
    { userId: "00000000-0000-0000-0000-000000000012", title: "Review Reminder", message: "How was your visit to Bern Classic Barbers? Leave a review and earn 10 loyalty points.", type: "system", read: false }
  ]);
  await db.insert(bookings).values([
    {
      userId: "00000000-0000-0000-0000-000000000010",
      salonId: "1",
      salonName: "Alpine Groom",
      salonImage: salonHeroImages[0],
      services: ["Precision Haircut", "Hot Towel Shave"],
      date: "2025-12-15",
      time: "10:00 AM",
      totalPrice: 100,
      status: "completed",
      paymentMethod: "card",
      specialistId: "1_sp1"
    },
    {
      userId: "00000000-0000-0000-0000-000000000010",
      salonId: "1",
      salonName: "Alpine Groom",
      salonImage: salonHeroImages[0],
      services: ["Relaxation Massage"],
      date: "2026-01-10",
      time: "2:00 PM",
      totalPrice: 95,
      status: "completed",
      paymentMethod: "card",
      specialistId: "1_sp5"
    },
    {
      userId: "00000000-0000-0000-0000-000000000011",
      salonId: "2",
      salonName: "Geneva Elegance",
      salonImage: salonHeroImages[1],
      services: ["Women's Haircut", "Hydrating Facial"],
      date: "2026-02-05",
      time: "11:00 AM",
      totalPrice: 145,
      status: "completed",
      paymentMethod: "cash",
      specialistId: "2_sp1"
    },
    {
      userId: "00000000-0000-0000-0000-000000000012",
      salonId: "3",
      salonName: "Bern Classic Barbers",
      salonImage: salonHeroImages[2],
      services: ["Classic Haircut", "Beard Trim"],
      date: "2026-03-01",
      time: "9:30 AM",
      totalPrice: 70,
      status: "completed",
      paymentMethod: "card",
      specialistId: "3_sp1"
    },
    {
      userId: "00000000-0000-0000-0000-000000000010",
      salonId: "4",
      salonName: "Lausanne Luxe Spa",
      salonImage: salonHeroImages[3],
      services: ["Diamond Facial", "Hot Stone Massage"],
      date: "2026-03-20",
      time: "1:00 PM",
      totalPrice: 290,
      status: "completed",
      paymentMethod: "card",
      specialistId: "4_sp3"
    },
    {
      userId: "00000000-0000-0000-0000-000000000011",
      salonId: "5",
      salonName: "Munich Edge Studio",
      salonImage: salonHeroImages[5],
      services: ["Men's Haircut", "Skin Fade"],
      date: "2026-04-05",
      time: "3:00 PM",
      totalPrice: 95,
      status: "pending",
      paymentMethod: "card",
      specialistId: "5_sp1"
    },
    {
      userId: "00000000-0000-0000-0000-000000000012",
      salonId: "6",
      salonName: "Vienna Heritage Salon",
      salonImage: salonHeroImages[6],
      services: ["Family Haircut", "Children's Cut"],
      date: "2026-04-10",
      time: "10:00 AM",
      totalPrice: 68,
      status: "upcoming",
      paymentMethod: "cash",
      specialistId: "6_sp1"
    },
    {
      userId: "00000000-0000-0000-0000-000000000010",
      salonId: "7",
      salonName: "Basel Wellness Studio",
      salonImage: salonHeroImages[4],
      services: ["Deep Tissue Massage", "Anti-Aging Facial"],
      date: "2026-04-15",
      time: "11:00 AM",
      totalPrice: 250,
      status: "upcoming",
      paymentMethod: "card",
      specialistId: "7_sp1"
    },
    {
      userId: "00000000-0000-0000-0000-000000000011",
      salonId: "1",
      salonName: "Alpine Groom",
      salonImage: salonHeroImages[0],
      services: ["Full Hair Color"],
      date: "2026-02-20",
      time: "2:00 PM",
      totalPrice: 120,
      status: "cancelled",
      paymentMethod: "card",
      specialistId: "1_sp2"
    },
    {
      userId: "00000000-0000-0000-0000-000000000012",
      salonId: "8",
      salonName: "Lucerne Style House",
      salonImage: salonHeroImages[7],
      services: ["Vivid Color", "Express Facial"],
      date: "2026-03-10",
      time: "4:00 PM",
      totalPrice: 205,
      status: "completed",
      paymentMethod: "card",
      specialistId: "8_sp1"
    }
  ]);
  await db.insert(inventory).values([
    { salonId: "1", name: "Professional Scissors Set", category: "tools", quantity: 8, minQuantity: 3, unit: "pcs", price: 120 },
    { salonId: "1", name: "Hair Clipper Blades", category: "tools", quantity: 15, minQuantity: 5, unit: "pcs", price: 25 },
    { salonId: "1", name: "Shampoo (Professional)", category: "products", quantity: 24, minQuantity: 10, unit: "bottles", price: 18 },
    { salonId: "1", name: "Conditioner (Professional)", category: "products", quantity: 20, minQuantity: 10, unit: "bottles", price: 22 },
    { salonId: "1", name: "Hair Color Tubes", category: "supplies", quantity: 45, minQuantity: 15, unit: "tubes", price: 12 },
    { salonId: "1", name: "Disposable Towels", category: "supplies", quantity: 200, minQuantity: 50, unit: "pcs", price: 0.5 },
    { salonId: "1", name: "Styling Gel", category: "products", quantity: 30, minQuantity: 10, unit: "jars", price: 15 },
    { salonId: "1", name: "Straight Razors", category: "tools", quantity: 6, minQuantity: 2, unit: "pcs", price: 85 }
  ]);
  await db.insert(expenses).values([
    { salonId: "1", description: "Monthly rent - Bahnhofstrasse location", amount: 4500, category: "rent", date: "2026-03-01" },
    { salonId: "1", description: "Electricity and water utilities", amount: 380, category: "utilities", date: "2026-03-01" },
    { salonId: "1", description: "Hair product restocking from supplier", amount: 850, category: "supplies", date: "2026-03-05" },
    { salonId: "1", description: "Staff salaries - March", amount: 8200, category: "salaries", date: "2026-03-15" },
    { salonId: "1", description: "Equipment maintenance and repair", amount: 250, category: "general", date: "2026-03-10" },
    { salonId: "1", description: "Monthly rent - Bahnhofstrasse location", amount: 4500, category: "rent", date: "2026-02-01" },
    { salonId: "1", description: "Staff salaries - February", amount: 8200, category: "salaries", date: "2026-02-15" },
    { salonId: "1", description: "Marketing and advertising", amount: 600, category: "general", date: "2026-02-20" }
  ]);
  const staffIds = ["00000000-0000-0000-0000-000000000020", "00000000-0000-0000-0000-000000000021"];
  const shiftEntries = [];
  for (const staffId of staffIds) {
    for (let day = 1; day <= 5; day++) {
      shiftEntries.push({ salonId: "1", staffId, dayOfWeek: day, startTime: "09:00", endTime: "17:00" });
    }
    shiftEntries.push({ salonId: "1", staffId, dayOfWeek: 6, startTime: "10:00", endTime: "15:00" });
  }
  await db.insert(shifts).values(shiftEntries);
  await db.insert(commissions).values([
    { bookingId: "booking-1", salonId: "1", amount: 5, rate: 5, status: "paid" },
    { bookingId: "booking-2", salonId: "1", amount: 4.75, rate: 5, status: "paid" },
    { bookingId: "booking-3", salonId: "2", amount: 4.35, rate: 3, status: "paid" },
    { bookingId: "booking-4", salonId: "3", amount: 5.6, rate: 8, status: "pending" },
    { bookingId: "booking-5", salonId: "4", amount: 14.5, rate: 5, status: "pending" }
  ]);
  await db.insert(appSettings).values([
    { key: "platform_name", value: "Barmagly", description: "Platform display name" },
    { key: "platform_currency", value: "CHF", description: "Default currency" },
    { key: "default_commission_rate", value: "5", description: "Default platform commission percentage" },
    { key: "booking_advance_days", value: "30", description: "Max days in advance for bookings" },
    { key: "loyalty_points_per_booking", value: "10", description: "Loyalty points earned per completed booking" },
    { key: "maintenance_mode", value: "false", description: "Enable maintenance mode" }
  ]);
  await db.insert(activityLogs).values([
    { userId: "00000000-0000-0000-0000-000000000000", userRole: "super_admin", action: "platform.seed", entityType: "system", entityId: "", metadata: { message: "Database seeded with European/Swiss data" } },
    { userId: "00000000-0000-0000-0000-000000000001", userRole: "salon_admin", action: "salon.login", entityType: "salon", entityId: "1", metadata: { salonName: "Alpine Groom" } },
    { userId: "00000000-0000-0000-0000-000000000010", userRole: "user", action: "booking.created", entityType: "booking", entityId: "booking-1", metadata: { salonName: "Alpine Groom", services: ["Precision Haircut"] } },
    { userId: "00000000-0000-0000-0000-000000000010", userRole: "user", action: "booking.completed", entityType: "booking", entityId: "booking-1", metadata: { salonName: "Alpine Groom" } },
    { userId: "00000000-0000-0000-0000-000000000011", userRole: "user", action: "user.registered", entityType: "user", entityId: "00000000-0000-0000-0000-000000000011", metadata: { source: "web" } }
  ]);
  console.log("Database seeded successfully with European/Swiss data!");
}

// server/storage.ts
var import_crypto2 = __toESM(require("crypto"));
init_db();
var import_drizzle_orm = require("drizzle-orm");
init_schema();
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
  const activeCoupons = await db.select().from(coupons).where(
    (0, import_drizzle_orm.and)(
      (0, import_drizzle_orm.eq)(coupons.active, true),
      import_drizzle_orm.sql`${coupons.expiryDate} >= ${now}`
    )
  );
  const salonIds = [...new Set(activeCoupons.map((c) => c.salonId).filter(Boolean).filter((id) => id !== ""))];
  if (salonIds.length === 0) return activeCoupons;
  const salonList = await db.select({ id: salons.id, name: salons.name }).from(salons).where(import_drizzle_orm.sql`${salons.id} IN (${import_drizzle_orm.sql.join(salonIds.map((id) => import_drizzle_orm.sql`${id}`), import_drizzle_orm.sql`, `)})`);
  const salonMap = Object.fromEntries(salonList.map((s) => [s.id, s.name]));
  return activeCoupons.map((c) => ({
    ...c,
    salonName: c.salonId ? salonMap[c.salonId] || null : null
  }));
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
init_db();
init_schema();
var import_drizzle_orm3 = require("drizzle-orm");
var import_bcryptjs2 = __toESM(require("bcryptjs"));
var import_multer = __toESM(require("multer"));
var import_path2 = __toESM(require("path"));
var import_fs = __toESM(require("fs"));

// server/activityLogger.ts
init_db();
init_schema();
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
  const [user] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, userId));
  if (!user || user.role !== "super_admin" && user.role !== "admin") {
    return res.status(403).json({ message: "Super admin access required" });
  }
  req.currentUser = user;
  next();
}
async function requireSalonAdmin(req, res, next) {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  const [user] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, userId));
  if (!user || user.role !== "salon_admin") {
    return res.status(403).json({ message: "Salon admin access required" });
  }
  const [link] = await db.select().from(salonStaff).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(salonStaff.userId, userId), (0, import_drizzle_orm3.eq)(salonStaff.role, "salon_admin")));
  if (!link) return res.status(403).json({ message: "No salon linked to this admin" });
  const [salon] = await db.select().from(salons).where((0, import_drizzle_orm3.eq)(salons.id, link.salonId));
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
  const [user] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, userId));
  if (!user || user.role !== "staff") {
    return res.status(403).json({ message: "Staff access required" });
  }
  const [link] = await db.select().from(salonStaff).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(salonStaff.userId, userId), (0, import_drizzle_orm3.eq)(salonStaff.role, "staff")));
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
  const chatUpload = (0, import_multer.default)({ storage, limits: { fileSize: 20 * 1024 * 1024 } });
  app2.post("/api/chat/upload", chatUpload.single("file"), (req, res) => {
    if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const ext = import_path2.default.extname(req.file.originalname).toLowerCase();
    const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const videoExts = [".mp4", ".webm", ".mov"];
    let mediaType = "file";
    if (imageExts.includes(ext)) mediaType = "image";
    else if (videoExts.includes(ext)) mediaType = "video";
    res.json({ url: `/uploads/${req.file.filename}`, type: mediaType, name: req.file.originalname, size: req.file.size });
  });
  app2.get("/api/admin/stats", requireSuperAdmin, async (req, res) => {
    try {
      const [usersCount] = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(users);
      const [salonsCount] = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(salons);
      const [bookingsCount] = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(bookings);
      const [revenue] = await db.select({ sum: import_drizzle_orm3.sql`coalesce(sum(${bookings.totalPrice}),0)` }).from(bookings);
      const [couponsCount] = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(coupons);
      const [servicesCount] = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(services);
      const [messagesCount] = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(messages);
      const [pendingBookings] = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(bookings).where((0, import_drizzle_orm3.eq)(bookings.status, "pending"));
      const [completedBookings] = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(bookings).where((0, import_drizzle_orm3.eq)(bookings.status, "completed"));
      const [activeSubscriptions] = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(subscriptions).where((0, import_drizzle_orm3.eq)(subscriptions.status, "active"));
      const [commissionTotal] = await db.select({ sum: import_drizzle_orm3.sql`coalesce(sum(${commissions.amount}),0)` }).from(commissions);
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
        const [count] = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(bookings).where((0, import_drizzle_orm3.eq)(bookings.date, dateStr));
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
      await db.execute(import_drizzle_orm3.sql`SELECT 1`);
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
      const [countResult] = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(users);
      const allUsers = await db.select().from(users).limit(limit).offset(offset).orderBy((0, import_drizzle_orm3.desc)(users.createdAt));
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
      const [user] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, userId));
      await logActivity({ userId: req.currentUser?.id, userRole: "super_admin", action: "user.created", entityType: "user", entityId: user.id });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/users/:id", requireSuperAdmin, async (req, res) => {
    try {
      const { fullName, email, role } = req.body;
      await db.update(users).set({ fullName, email, role }).where((0, import_drizzle_orm3.eq)(users.id, String(req.params.id)));
      const [user] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, String(req.params.id)));
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
      const [target] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, targetId));
      if (target?.role === "super_admin" && target.id !== currentUserId) {
        return res.status(403).json({ message: "Cannot delete another super admin" });
      }
      await db.delete(users).where((0, import_drizzle_orm3.eq)(users.id, targetId));
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
        const [ownerUser] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.email, ownerEmail)).limit(1);
        if (!ownerUser) return res.status(400).json({ message: `No user found with email "${ownerEmail}". Ask them to register first.` });
        salonData2.ownerId = ownerUser.id;
      }
      const salonId2 = import_crypto3.default.randomUUID();
      await db.insert(salons).values({ ...salonData2, id: salonId2 });
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm3.eq)(salons.id, salonId2));
      if (salonData2.ownerId) {
        const existing = await db.select().from(salonStaff).where((0, import_drizzle_orm3.eq)(salonStaff.salonId, salon.id)).limit(1);
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
          await db.delete(salonStaff).where((0, import_drizzle_orm3.eq)(salonStaff.salonId, salonId));
        } else {
          const [ownerUser] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.email, ownerEmail)).limit(1);
          if (!ownerUser) return res.status(400).json({ message: `No user found with email "${ownerEmail}". Ask them to register first.` });
          salonData2.ownerId = ownerUser.id;
          const existing = await db.select().from(salonStaff).where((0, import_drizzle_orm3.eq)(salonStaff.salonId, salonId)).limit(1);
          if (existing.length === 0) {
            await db.insert(salonStaff).values({ salonId, userId: ownerUser.id, role: "salon_admin" });
          } else {
            await db.update(salonStaff).set({ userId: ownerUser.id, role: "salon_admin" }).where((0, import_drizzle_orm3.eq)(salonStaff.salonId, salonId));
          }
        }
      }
      await db.update(salons).set(salonData2).where((0, import_drizzle_orm3.eq)(salons.id, salonId));
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm3.eq)(salons.id, salonId));
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
      await db.delete(salons).where((0, import_drizzle_orm3.eq)(salons.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/salons/:id/create-default-account", requireSuperAdmin, async (req, res) => {
    try {
      const salonId = String(req.params.id);
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm3.eq)(salons.id, salonId));
      if (!salon) return res.status(404).json({ message: "Salon not found" });
      const slug = salon.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
      const email = `${slug}@barmagly.com`;
      const defaultPassword = "salon123";
      const existing = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.email, email)).limit(1);
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
        const [created] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, newUserId));
        user = created;
      }
      const staffExisting = await db.select().from(salonStaff).where((0, import_drizzle_orm3.eq)(salonStaff.salonId, salonId)).limit(1);
      if (staffExisting.length === 0) {
        await db.insert(salonStaff).values({ salonId, userId: user.id, role: "salon_admin" });
      } else {
        await db.update(salonStaff).set({ userId: user.id, role: "salon_admin" }).where((0, import_drizzle_orm3.eq)(salonStaff.salonId, salonId));
      }
      await db.update(salons).set({ ownerId: user.id }).where((0, import_drizzle_orm3.eq)(salons.id, salonId));
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
      const [countResult] = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(bookings);
      const all = await db.select().from(bookings).orderBy((0, import_drizzle_orm3.desc)(bookings.createdAt)).limit(limit).offset(offset);
      res.json({ data: all, total: Number(countResult.count), page, limit });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/bookings", requireSuperAdmin, async (req, res) => {
    try {
      const bookingId = import_crypto3.default.randomUUID();
      await db.insert(bookings).values({ ...req.body, status: req.body.status || "upcoming", id: bookingId });
      const [booking] = await db.select().from(bookings).where((0, import_drizzle_orm3.eq)(bookings.id, bookingId));
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/bookings/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(bookings).set(req.body).where((0, import_drizzle_orm3.eq)(bookings.id, String(req.params.id)));
      const [booking] = await db.select().from(bookings).where((0, import_drizzle_orm3.eq)(bookings.id, String(req.params.id)));
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/bookings/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(bookings).where((0, import_drizzle_orm3.eq)(bookings.id, String(req.params.id)));
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
      const [c] = await db.select().from(coupons).where((0, import_drizzle_orm3.eq)(coupons.id, couponId));
      res.json(c);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/coupons/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(coupons).set(req.body).where((0, import_drizzle_orm3.eq)(coupons.id, String(req.params.id)));
      const [c] = await db.select().from(coupons).where((0, import_drizzle_orm3.eq)(coupons.id, String(req.params.id)));
      res.json(c);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/coupons/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(coupons).where((0, import_drizzle_orm3.eq)(coupons.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/payments", requireSuperAdmin, async (_req, res) => {
    try {
      const payments = await db.select().from(bookings).where(import_drizzle_orm3.sql`${bookings.paymentMethod} != ''`);
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
        const [msg] = await db.select().from(messages).where((0, import_drizzle_orm3.eq)(messages.id, msgId));
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
      const [msg] = await db.select().from(messages).where((0, import_drizzle_orm3.eq)(messages.id, replyMsgId));
      res.json(msg);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/whatsapp/config", requireSuperAdmin, async (_req, res) => {
    try {
      const allSettings = await db.select().from(appSettings);
      const waSettings = {};
      for (const s of allSettings) {
        if (s.key.startsWith("whatsapp_")) waSettings[s.key] = s.value;
      }
      res.json(waSettings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/whatsapp/config", requireSuperAdmin, async (req, res) => {
    try {
      const updates = req.body;
      for (const [key, value] of Object.entries(updates)) {
        if (!key.startsWith("whatsapp_")) continue;
        const existing = await db.select().from(appSettings).where((0, import_drizzle_orm3.eq)(appSettings.key, key));
        if (existing.length > 0) {
          await db.update(appSettings).set({ value: String(value), updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(appSettings.key, key));
        } else {
          await db.insert(appSettings).values({ key, value: String(value), description: `WhatsApp config: ${key}` });
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/whatsapp/test", requireSuperAdmin, async (req, res) => {
    try {
      const { phone, message } = req.body;
      const { sendWhatsAppMessage: sendWhatsAppMessage2 } = (init_whatsappService(), __toCommonJS(whatsappService_exports));
      const result = await sendWhatsAppMessage2({ to: phone, message: message || "Test message from Barmagly Salon!" });
      res.json({ success: result, message: result ? "Message sent successfully" : "Message queued (check WhatsApp config)" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/whatsapp/broadcast", requireSuperAdmin, async (req, res) => {
    try {
      const { content, targetUserId } = req.body;
      const { sendWhatsAppMessage: sendWhatsAppMessage2, notifySuperAdminViaWhatsApp: notifySuperAdminViaWhatsApp2 } = (init_whatsappService(), __toCommonJS(whatsappService_exports));
      const adminIdentity = { salonId: "admin", salonName: "Barmagly Platform", salonImage: "" };
      if (targetUserId === "all") {
        const allUsers = await db.select().from(users);
        await Promise.all(allUsers.map(
          (u) => db.insert(messages).values({ userId: u.id, ...adminIdentity, content, sender: "salon" })
        ));
        await notifySuperAdminViaWhatsApp2(`[Broadcast] ${content}`);
        res.json({ success: true, count: allUsers.length });
      } else {
        const msgId = import_crypto3.default.randomUUID();
        await db.insert(messages).values({ id: msgId, userId: targetUserId, ...adminIdentity, content, sender: "salon" });
        const [msg] = await db.select().from(messages).where((0, import_drizzle_orm3.eq)(messages.id, msgId));
        res.json(msg);
      }
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
      const existing = await db.select().from(appSettings).where((0, import_drizzle_orm3.eq)(appSettings.key, key));
      if (existing.length > 0) {
        await db.update(appSettings).set({ value, description, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(appSettings.key, key));
      } else {
        await db.insert(appSettings).values({ key, value, description });
      }
      const [setting] = await db.select().from(appSettings).where((0, import_drizzle_orm3.eq)(appSettings.key, key));
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
      const [s] = await db.select().from(services).where((0, import_drizzle_orm3.eq)(services.id, svcId));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/services/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(services).set(req.body).where((0, import_drizzle_orm3.eq)(services.id, String(req.params.id)));
      const [s] = await db.select().from(services).where((0, import_drizzle_orm3.eq)(services.id, String(req.params.id)));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/services/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(services).where((0, import_drizzle_orm3.eq)(services.id, String(req.params.id)));
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
      const [plan] = await db.select().from(plans).where((0, import_drizzle_orm3.eq)(plans.id, planId));
      res.json(plan);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/plans/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(plans).set(req.body).where((0, import_drizzle_orm3.eq)(plans.id, String(req.params.id)));
      const [plan] = await db.select().from(plans).where((0, import_drizzle_orm3.eq)(plans.id, String(req.params.id)));
      res.json(plan);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/plans/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(plans).where((0, import_drizzle_orm3.eq)(plans.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/subscriptions", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(subscriptions).orderBy((0, import_drizzle_orm3.desc)(subscriptions.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/subscriptions", requireSuperAdmin, async (req, res) => {
    try {
      const subId = import_crypto3.default.randomUUID();
      await db.insert(subscriptions).values({ ...req.body, id: subId });
      const [sub] = await db.select().from(subscriptions).where((0, import_drizzle_orm3.eq)(subscriptions.id, subId));
      await logActivity({ userId: req.currentUser?.id, userRole: "super_admin", action: "subscription.created", entityType: "subscription", entityId: sub.id, metadata: { salonId: sub.salonId, planId: sub.planId } });
      res.json(sub);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/subscriptions/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(subscriptions).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(subscriptions.id, String(req.params.id)));
      const [sub] = await db.select().from(subscriptions).where((0, import_drizzle_orm3.eq)(subscriptions.id, String(req.params.id)));
      await logActivity({ userId: req.currentUser?.id, userRole: "super_admin", action: "subscription.updated", entityType: "subscription", entityId: String(req.params.id) });
      res.json(sub);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/subscriptions/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(subscriptions).where((0, import_drizzle_orm3.eq)(subscriptions.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/license-keys", requireSuperAdmin, async (_req, res) => {
    try {
      const keys = await db.select().from(licenseKeys).orderBy((0, import_drizzle_orm3.desc)(licenseKeys.createdAt));
      const activations = await db.select().from(licenseActivations);
      const keysWithEmails = keys.map((k) => ({
        ...k,
        activatedEmails: activations.filter((a) => a.licenseKeyId === k.id).map((a) => a.email).filter(Boolean),
        activations: activations.filter((a) => a.licenseKeyId === k.id).map((a) => ({ id: a.id, email: a.email, deviceId: a.deviceId, activatedAt: a.activatedAt }))
      }));
      res.json(keysWithEmails);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/license-keys", requireSuperAdmin, async (req, res) => {
    try {
      const key = req.body.key || `BRMG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const lkId = import_crypto3.default.randomUUID();
      await db.insert(licenseKeys).values({ ...req.body, key, id: lkId });
      const [lk] = await db.select().from(licenseKeys).where((0, import_drizzle_orm3.eq)(licenseKeys.id, lkId));
      res.json(lk);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/license-keys/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(licenseKeys).set(req.body).where((0, import_drizzle_orm3.eq)(licenseKeys.id, String(req.params.id)));
      const [lk] = await db.select().from(licenseKeys).where((0, import_drizzle_orm3.eq)(licenseKeys.id, String(req.params.id)));
      res.json(lk);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/license-keys/:id/activations", requireSuperAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });
      await db.insert(licenseActivations).values({
        licenseKeyId: String(req.params.id),
        deviceId: "manual-admin",
        email
      });
      await db.update(licenseKeys).set({ activationCount: import_drizzle_orm3.sql`activation_count + 1` }).where((0, import_drizzle_orm3.eq)(licenseKeys.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/license-keys/:id/activations/:activationId", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(licenseActivations).where((0, import_drizzle_orm3.eq)(licenseActivations.id, String(req.params.activationId)));
      await db.update(licenseKeys).set({ activationCount: import_drizzle_orm3.sql`GREATEST(activation_count - 1, 0)` }).where((0, import_drizzle_orm3.eq)(licenseKeys.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/license-keys/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(licenseKeys).where((0, import_drizzle_orm3.eq)(licenseKeys.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/activity-logs", requireSuperAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const logs = await db.select().from(activityLogs).orderBy((0, import_drizzle_orm3.desc)(activityLogs.createdAt)).limit(limit);
      res.json(logs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/commissions", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(commissions).orderBy((0, import_drizzle_orm3.desc)(commissions.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/commissions/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(commissions).set(req.body).where((0, import_drizzle_orm3.eq)(commissions.id, String(req.params.id)));
      const [c] = await db.select().from(commissions).where((0, import_drizzle_orm3.eq)(commissions.id, String(req.params.id)));
      res.json(c);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/expenses", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(expenses).orderBy((0, import_drizzle_orm3.desc)(expenses.createdAt)));
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
      const [link] = await db.select().from(salonStaff).where((0, import_drizzle_orm3.eq)(salonStaff.id, linkId));
      res.json(link);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/salon-staff/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(salonStaff).where((0, import_drizzle_orm3.eq)(salonStaff.id, String(req.params.id)));
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
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm3.eq)(salons.id, salonId));
      res.json(salon);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/me", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.update(salons).set(req.body).where((0, import_drizzle_orm3.eq)(salons.id, salonId));
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm3.eq)(salons.id, salonId));
      res.json(salon);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/subscription", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const [sub] = await db.select().from(subscriptions).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(subscriptions.salonId, salonId), (0, import_drizzle_orm3.eq)(subscriptions.status, "active")));
      if (!sub) return res.json(null);
      const [plan] = await db.select().from(plans).where((0, import_drizzle_orm3.eq)(plans.id, sub.planId));
      res.json({ ...sub, plan });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/stats", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const [todayBookings] = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(bookings).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(bookings.salonId, salonId), (0, import_drizzle_orm3.eq)(bookings.date, today)));
      const [totalBookings] = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(bookings).where((0, import_drizzle_orm3.eq)(bookings.salonId, salonId));
      const [revenue] = await db.select({ sum: import_drizzle_orm3.sql`coalesce(sum(${bookings.totalPrice}),0)` }).from(bookings).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(bookings.salonId, salonId), (0, import_drizzle_orm3.eq)(bookings.status, "completed")));
      const [staffCount] = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(salonStaff).where((0, import_drizzle_orm3.eq)(salonStaff.salonId, salonId));
      const [pendingCount] = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(bookings).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(bookings.salonId, salonId), (0, import_drizzle_orm3.eq)(bookings.status, "upcoming")));
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
      const all = await db.select().from(bookings).where((0, import_drizzle_orm3.eq)(bookings.salonId, salonId)).orderBy((0, import_drizzle_orm3.desc)(bookings.createdAt));
      const parsed = all.map((b) => {
        let svcs = b.services;
        if (typeof svcs === "string") {
          try {
            svcs = JSON.parse(svcs);
          } catch {
            svcs = [];
          }
        }
        if (!Array.isArray(svcs)) svcs = [];
        return { ...b, services: svcs };
      });
      res.json(parsed);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/bookings/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.update(bookings).set(req.body).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(bookings.id, String(req.params.id)), (0, import_drizzle_orm3.eq)(bookings.salonId, salonId)));
      const [booking] = await db.select().from(bookings).where((0, import_drizzle_orm3.eq)(bookings.id, String(req.params.id)));
      if (req.body.status === "completed" && booking) {
        let rate = 5;
        const [rateSetting] = await db.select().from(appSettings).where((0, import_drizzle_orm3.eq)(appSettings.key, "default_commission_rate"));
        if (rateSetting) rate = parseFloat(rateSetting.value) || 5;
        const amount = Math.ceil(booking.totalPrice * (rate / 100));
        await db.insert(commissions).values({ bookingId: booking.id, salonId, amount, rate });
      }
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/bookings", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm3.eq)(salons.id, salonId));
      const id = import_crypto3.default.randomUUID();
      const payload = {
        id,
        salonId,
        salonName: salon?.name || "Salon",
        salonImage: salon?.image || "",
        userId: req.body.userId || "",
        clientName: req.body.clientName || "Walk-in",
        clientPhone: req.body.clientPhone || "",
        serviceName: req.body.serviceName || "",
        services: req.body.services || (req.body.serviceName ? [req.body.serviceName] : []),
        date: req.body.date,
        time: req.body.time,
        totalPrice: req.body.totalPrice || 0,
        status: req.body.status || "confirmed",
        paymentMethod: req.body.paymentMethod || "cash",
        notes: req.body.notes || ""
      };
      await db.insert(bookings).values(payload);
      const [created] = await db.select().from(bookings).where((0, import_drizzle_orm3.eq)(bookings.id, id));
      res.json(created);
    } catch (err) {
      console.error("POST /api/salon/bookings error:", err);
      res.status(500).json({ message: err?.message || "Failed to create booking" });
    }
  });
  app2.delete("/api/salon/bookings/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.delete(bookings).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(bookings.id, String(req.params.id)), (0, import_drizzle_orm3.eq)(bookings.salonId, salonId)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err?.message || "Failed to delete booking" });
    }
  });
  app2.get("/api/salon/services", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(services).where((0, import_drizzle_orm3.eq)(services.salonId, salonId)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/services", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const svcId2 = import_crypto3.default.randomUUID();
      await db.insert(services).values({ ...req.body, salonId, id: svcId2 });
      const [s] = await db.select().from(services).where((0, import_drizzle_orm3.eq)(services.id, svcId2));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/services/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.update(services).set(req.body).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(services.id, String(req.params.id)), (0, import_drizzle_orm3.eq)(services.salonId, salonId)));
      const [s] = await db.select().from(services).where((0, import_drizzle_orm3.eq)(services.id, String(req.params.id)));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/services/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.delete(services).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(services.id, String(req.params.id)), (0, import_drizzle_orm3.eq)(services.salonId, salonId)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/staff", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const links = await db.select().from(salonStaff).where((0, import_drizzle_orm3.eq)(salonStaff.salonId, salonId));
      const staffUsers = await Promise.all(links.map(async (l) => {
        const [u] = await db.select({ id: users.id, fullName: users.fullName, email: users.email, phone: users.phone, avatar: users.avatar, role: users.role }).from(users).where((0, import_drizzle_orm3.eq)(users.id, l.userId));
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
      const [newUser] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, newUserId2));
      const linkId2 = import_crypto3.default.randomUUID();
      await db.insert(salonStaff).values({ id: linkId2, userId: newUser.id, salonId, role: staffRole });
      const [link] = await db.select().from(salonStaff).where((0, import_drizzle_orm3.eq)(salonStaff.id, linkId2));
      res.json({ ...newUser, linkId: link.id, staffRole: link.role });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/staff/:linkId", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.delete(salonStaff).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(salonStaff.id, String(req.params.linkId)), (0, import_drizzle_orm3.eq)(salonStaff.salonId, salonId)));
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
        count: import_drizzle_orm3.sql`count(*)`,
        lastVisit: import_drizzle_orm3.sql`max(${bookings.date})`,
        totalSpent: import_drizzle_orm3.sql`sum(${bookings.totalPrice})`
      }).from(bookings).where((0, import_drizzle_orm3.eq)(bookings.salonId, salonId)).groupBy(bookings.userId);
      const customers = await Promise.all(rows.map(async (r) => {
        const [u] = await db.select({ id: users.id, fullName: users.fullName, email: users.email, phone: users.phone, avatar: users.avatar, loyaltyPoints: users.loyaltyPoints }).from(users).where((0, import_drizzle_orm3.eq)(users.id, r.userId));
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
      res.json(await db.select().from(expenses).where((0, import_drizzle_orm3.eq)(expenses.salonId, salonId)).orderBy((0, import_drizzle_orm3.desc)(expenses.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/expenses", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const expId = import_crypto3.default.randomUUID();
      await db.insert(expenses).values({ ...req.body, salonId, id: expId });
      const [e] = await db.select().from(expenses).where((0, import_drizzle_orm3.eq)(expenses.id, expId));
      res.json(e);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/expenses/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.update(expenses).set(req.body).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(expenses.id, String(req.params.id)), (0, import_drizzle_orm3.eq)(expenses.salonId, salonId)));
      const [e] = await db.select().from(expenses).where((0, import_drizzle_orm3.eq)(expenses.id, String(req.params.id)));
      res.json(e);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/expenses/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.delete(expenses).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(expenses.id, String(req.params.id)), (0, import_drizzle_orm3.eq)(expenses.salonId, salonId)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/coupons", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(coupons).where((0, import_drizzle_orm3.eq)(coupons.salonId, salonId)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/coupons", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const couponId = import_crypto3.default.randomUUID();
      await db.insert(coupons).values({ ...req.body, salonId, id: couponId });
      const [c] = await db.select().from(coupons).where((0, import_drizzle_orm3.eq)(coupons.id, couponId));
      res.json(c);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/coupons/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.update(coupons).set(req.body).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(coupons.id, String(req.params.id)), (0, import_drizzle_orm3.eq)(coupons.salonId, salonId)));
      const [c] = await db.select().from(coupons).where((0, import_drizzle_orm3.eq)(coupons.id, String(req.params.id)));
      res.json(c);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/coupons/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.delete(coupons).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(coupons.id, String(req.params.id)), (0, import_drizzle_orm3.eq)(coupons.salonId, salonId)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/shifts", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(shifts).where((0, import_drizzle_orm3.eq)(shifts.salonId, salonId)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/shifts", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const shiftId = import_crypto3.default.randomUUID();
      await db.insert(shifts).values({ ...req.body, salonId, id: shiftId });
      const [s] = await db.select().from(shifts).where((0, import_drizzle_orm3.eq)(shifts.id, shiftId));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/shifts/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.update(shifts).set(req.body).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(shifts.id, String(req.params.id)), (0, import_drizzle_orm3.eq)(shifts.salonId, salonId)));
      const [s] = await db.select().from(shifts).where((0, import_drizzle_orm3.eq)(shifts.id, String(req.params.id)));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/shifts/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.delete(shifts).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(shifts.id, String(req.params.id)), (0, import_drizzle_orm3.eq)(shifts.salonId, salonId)));
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
        salonId ? (0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(bookings.salonId, salonId), (0, import_drizzle_orm3.eq)(bookings.specialistId, userId)) : (0, import_drizzle_orm3.eq)(bookings.specialistId, userId)
      ).orderBy((0, import_drizzle_orm3.desc)(bookings.date));
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
      await db.update(bookings).set({ status: req.body.status }).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(bookings.id, String(req.params.id)), (0, import_drizzle_orm3.eq)(bookings.specialistId, userId)));
      const [booking] = await db.select().from(bookings).where((0, import_drizzle_orm3.eq)(bookings.id, String(req.params.id)));
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
        salonId ? (0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(bookings.salonId, salonId), (0, import_drizzle_orm3.eq)(bookings.specialistId, userId)) : (0, import_drizzle_orm3.eq)(bookings.specialistId, userId)
      ).orderBy((0, import_drizzle_orm3.desc)(bookings.date));
      res.json(all);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/staff/profile", requireStaff, async (req, res) => {
    try {
      const userId = req.session?.userId;
      const { name, email, phone } = req.body;
      await db.update(users).set({ fullName: name, email, phone }).where((0, import_drizzle_orm3.eq)(users.id, userId));
      const [user] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, userId));
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/staff/shifts", requireStaff, async (req, res) => {
    try {
      const userId = req.session?.userId;
      const salonId = req.salonId;
      res.json(await db.select().from(shifts).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(shifts.staffId, userId), (0, import_drizzle_orm3.eq)(shifts.salonId, salonId))));
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
        (0, import_drizzle_orm3.and)(
          (0, import_drizzle_orm3.eq)(bookings.specialistId, userId),
          (0, import_drizzle_orm3.eq)(bookings.status, "completed"),
          (0, import_drizzle_orm3.gte)(bookings.createdAt, start)
        )
      );
      const myTips = await db.select().from(tips).where(
        (0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(tips.staffId, userId), (0, import_drizzle_orm3.gte)(tips.createdAt, start))
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
  app2.post("/api/auth/check-device-license", async (req, res) => {
    try {
      const { deviceId } = req.body || {};
      if (!deviceId) return res.json({ active: false, activations: [] });
      const activations = await db.select().from(licenseActivations).where((0, import_drizzle_orm3.eq)(licenseActivations.deviceId, deviceId));
      if (activations.length === 0) return res.json({ active: false, activations: [] });
      const now = /* @__PURE__ */ new Date();
      const results = [];
      for (const act of activations) {
        const [lk] = await db.select().from(licenseKeys).where((0, import_drizzle_orm3.eq)(licenseKeys.id, act.licenseKeyId));
        if (!lk) continue;
        if (lk.status === "revoked" || lk.status === "suspended") continue;
        if (lk.expiresAt && new Date(lk.expiresAt) < now) continue;
        let salonName = "";
        if (lk.salonId) {
          const [salon] = await db.select().from(salons).where((0, import_drizzle_orm3.eq)(salons.id, lk.salonId));
          if (salon) salonName = salon.name;
        }
        results.push({
          activationId: act.id,
          licenseKeyId: lk.id,
          email: act.email || "",
          salonId: lk.salonId || "",
          salonName,
          activatedAt: act.activatedAt
        });
      }
      res.json({ active: results.length > 0, activations: results });
    } catch (err) {
      res.status(500).json({ active: false, message: err?.message });
    }
  });
  app2.post("/api/auth/verify-license", async (req, res) => {
    try {
      const { email, licenseKey, deviceId } = req.body;
      if (!email || !licenseKey) return res.status(400).json({ message: "Email and license key are required" });
      const [lk] = await db.select().from(licenseKeys).where((0, import_drizzle_orm3.eq)(licenseKeys.key, licenseKey.toUpperCase()));
      if (!lk) return res.status(404).json({ message: "Invalid license key" });
      if (lk.status === "revoked") return res.status(403).json({ message: "License key has been revoked" });
      if (lk.status === "suspended") return res.status(403).json({ message: "License key is suspended" });
      if (lk.expiresAt && new Date(lk.expiresAt) < /* @__PURE__ */ new Date()) {
        return res.status(403).json({ message: "License key has expired" });
      }
      const effectiveDeviceId = deviceId || `web-${email}`;
      const existingActivations = await db.select().from(licenseActivations).where((0, import_drizzle_orm3.eq)(licenseActivations.licenseKeyId, lk.id));
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
        }).where((0, import_drizzle_orm3.eq)(licenseKeys.id, lk.id));
      }
      let salonName = "";
      if (lk.salonId) {
        const [salon] = await db.select().from(salons).where((0, import_drizzle_orm3.eq)(salons.id, lk.salonId));
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
        (0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(bookings.salonId, salonId), (0, import_drizzle_orm3.gte)(bookings.createdAt, start))
      );
      const prevStart = new Date(start.getTime() - (now.getTime() - start.getTime()));
      const prevBookings = await db.select().from(bookings).where(
        (0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(bookings.salonId, salonId), (0, import_drizzle_orm3.gte)(bookings.createdAt, prevStart), (0, import_drizzle_orm3.lte)(bookings.createdAt, start))
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
        let svcs = b.services || [];
        if (typeof svcs === "string") {
          try {
            svcs = JSON.parse(svcs);
          } catch {
            svcs = [];
          }
        }
        if (!Array.isArray(svcs)) svcs = [];
        svcs.forEach((svc) => {
          const name = typeof svc === "object" ? svc.name || String(svc) : String(svc);
          serviceCount[name] = (serviceCount[name] || 0) + 1;
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
        (0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(customerNotes.salonId, salonId), (0, import_drizzle_orm3.eq)(customerNotes.customerId, String(req.params.customerId)))
      ).orderBy((0, import_drizzle_orm3.desc)(customerNotes.createdAt));
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
      const [note] = await db.select().from(customerNotes).where((0, import_drizzle_orm3.eq)(customerNotes.id, noteId));
      res.json(note);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/inventory", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(inventory).where((0, import_drizzle_orm3.eq)(inventory.salonId, salonId)).orderBy((0, import_drizzle_orm3.desc)(inventory.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/inventory", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const invId = import_crypto3.default.randomUUID();
      await db.insert(inventory).values({ ...req.body, salonId, id: invId });
      const [item] = await db.select().from(inventory).where((0, import_drizzle_orm3.eq)(inventory.id, invId));
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/inventory/:id", requireSalonAdmin, async (req, res) => {
    try {
      await db.update(inventory).set(req.body).where((0, import_drizzle_orm3.eq)(inventory.id, String(req.params.id)));
      const [item] = await db.select().from(inventory).where((0, import_drizzle_orm3.eq)(inventory.id, String(req.params.id)));
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/inventory/:id", requireSalonAdmin, async (req, res) => {
    try {
      await db.delete(inventory).where((0, import_drizzle_orm3.eq)(inventory.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/products", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(products).where((0, import_drizzle_orm3.eq)(products.salonId, salonId)).orderBy((0, import_drizzle_orm3.desc)(products.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/products", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm3.eq)(salons.id, salonId));
      const productId = import_crypto3.default.randomUUID();
      await db.insert(products).values({ ...req.body, salonId, salonName: salon?.name || "", id: productId });
      const [p] = await db.select().from(products).where((0, import_drizzle_orm3.eq)(products.id, productId));
      res.json(p);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/products/:id", requireSalonAdmin, async (req, res) => {
    try {
      await db.update(products).set(req.body).where((0, import_drizzle_orm3.eq)(products.id, String(req.params.id)));
      const [p] = await db.select().from(products).where((0, import_drizzle_orm3.eq)(products.id, String(req.params.id)));
      res.json(p);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/products/:id", requireSalonAdmin, async (req, res) => {
    try {
      await db.delete(products).where((0, import_drizzle_orm3.eq)(products.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/product-orders", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const orders = await db.select().from(productOrders).where((0, import_drizzle_orm3.eq)(productOrders.salonId, salonId)).orderBy((0, import_drizzle_orm3.desc)(productOrders.createdAt));
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/product-orders/:id", requireSalonAdmin, async (req, res) => {
    try {
      await db.update(productOrders).set(req.body).where((0, import_drizzle_orm3.eq)(productOrders.id, String(req.params.id)));
      const [o] = await db.select().from(productOrders).where((0, import_drizzle_orm3.eq)(productOrders.id, String(req.params.id)));
      res.json(o);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/products", async (_req, res) => {
    try {
      const allProducts = await db.select().from(products).where((0, import_drizzle_orm3.eq)(products.isActive, true));
      res.json(allProducts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const [p] = await db.select().from(products).where((0, import_drizzle_orm3.eq)(products.id, String(req.params.id)));
      if (!p) return res.status(404).json({ message: "Product not found" });
      res.json(p);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/product-orders", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const orderId = import_crypto3.default.randomUUID();
      const { items, salonId, totalPrice, paymentMethod, shippingAddress, phone, notes } = req.body;
      await db.insert(productOrders).values({
        id: orderId,
        userId,
        salonId,
        items,
        totalPrice,
        paymentMethod: paymentMethod || "cash",
        shippingAddress: shippingAddress || "",
        phone: phone || "",
        notes: notes || "",
        status: "pending"
      });
      for (const item of items || []) {
        await db.update(products).set({ stock: import_drizzle_orm3.sql`GREATEST(stock - ${item.qty || 1}, 0)` }).where((0, import_drizzle_orm3.eq)(products.id, item.id));
      }
      try {
        const { salonStaff: salonStaffTable } = (init_schema(), __toCommonJS(schema_exports));
        const staffLinks = await db.select().from(salonStaffTable).where((0, import_drizzle_orm3.eq)(salonStaffTable.salonId, salonId));
        for (const link of staffLinks) {
          await db.insert(notifications).values({
            userId: link.userId,
            title: "New Product Order",
            message: `New order \u2014 ${items.length} items, total CHF ${totalPrice}`,
            type: "booking"
          });
        }
      } catch {
      }
      const [order] = await db.select().from(productOrders).where((0, import_drizzle_orm3.eq)(productOrders.id, orderId));
      res.status(201).json(order);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/product-orders/my", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const myOrders = await db.select().from(productOrders).where((0, import_drizzle_orm3.eq)(productOrders.userId, userId)).orderBy((0, import_drizzle_orm3.desc)(productOrders.createdAt));
      res.json(myOrders);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/messages", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const allMsgs = await db.select().from(messages).where((0, import_drizzle_orm3.eq)(messages.salonId, salonId)).orderBy((0, import_drizzle_orm3.desc)(messages.createdAt));
      const convMap = /* @__PURE__ */ new Map();
      for (const m of allMsgs) {
        if (!convMap.has(m.userId)) {
          const [u] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, m.userId));
          convMap.set(m.userId, {
            userId: m.userId,
            userName: u?.fullName || "Unknown",
            userAvatar: u?.avatar || "",
            userEmail: u?.email || "",
            lastMessage: m.content,
            lastMessageAt: m.createdAt,
            sender: m.sender,
            unreadCount: allMsgs.filter((x) => x.userId === m.userId && x.sender === "user" && !x.isRead).length
          });
        }
      }
      res.json(Array.from(convMap.values()));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/messages/:userId", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const userId = String(req.params.userId);
      const msgs = await db.select().from(messages).where(
        (0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(messages.salonId, salonId), (0, import_drizzle_orm3.eq)(messages.userId, userId))
      ).orderBy(messages.createdAt);
      await db.update(messages).set({ isRead: 1 }).where(
        (0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(messages.salonId, salonId), (0, import_drizzle_orm3.eq)(messages.userId, userId), (0, import_drizzle_orm3.eq)(messages.sender, "user"))
      );
      res.json(msgs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/messages/:userId", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const userId = String(req.params.userId);
      const currentUser = req.currentUser;
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm3.eq)(salons.id, salonId));
      const msgId = import_crypto3.default.randomUUID();
      await db.insert(messages).values({
        id: msgId,
        userId,
        salonId,
        salonName: salon?.name || "Salon",
        salonImage: salon?.image || "",
        content: req.body.content,
        sender: "salon",
        senderName: currentUser?.fullName || "Salon Admin",
        messageType: req.body.messageType || "text",
        isRead: 0
      });
      const [msg] = await db.select().from(messages).where((0, import_drizzle_orm3.eq)(messages.id, msgId));
      res.json(msg);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/staff/messages", requireStaff, async (req, res) => {
    try {
      const salonId = req.salonId;
      const allMsgs = await db.select().from(messages).where((0, import_drizzle_orm3.eq)(messages.salonId, salonId)).orderBy((0, import_drizzle_orm3.desc)(messages.createdAt));
      const convMap = /* @__PURE__ */ new Map();
      for (const m of allMsgs) {
        if (!convMap.has(m.userId)) {
          const [u] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, m.userId));
          convMap.set(m.userId, {
            userId: m.userId,
            userName: u?.fullName || "Unknown",
            userAvatar: u?.avatar || "",
            lastMessage: m.content,
            lastMessageAt: m.createdAt,
            sender: m.sender,
            unreadCount: allMsgs.filter((x) => x.userId === m.userId && x.sender === "user" && !x.isRead).length
          });
        }
      }
      res.json(Array.from(convMap.values()));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/staff/messages/:userId", requireStaff, async (req, res) => {
    try {
      const salonId = req.salonId;
      const userId = String(req.params.userId);
      const msgs = await db.select().from(messages).where(
        (0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(messages.salonId, salonId), (0, import_drizzle_orm3.eq)(messages.userId, userId))
      ).orderBy(messages.createdAt);
      await db.update(messages).set({ isRead: 1 }).where(
        (0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(messages.salonId, salonId), (0, import_drizzle_orm3.eq)(messages.userId, userId), (0, import_drizzle_orm3.eq)(messages.sender, "user"))
      );
      res.json(msgs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/staff/messages/:userId", requireStaff, async (req, res) => {
    try {
      const salonId = req.salonId;
      const userId = String(req.params.userId);
      const currentUser = req.currentUser;
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm3.eq)(salons.id, salonId));
      const msgId = import_crypto3.default.randomUUID();
      await db.insert(messages).values({
        id: msgId,
        userId,
        salonId,
        salonName: salon?.name || "Salon",
        salonImage: salon?.image || "",
        content: req.body.content,
        sender: "salon",
        senderName: currentUser?.fullName || "Staff",
        messageType: req.body.messageType || "text",
        isRead: 0
      });
      const [msg] = await db.select().from(messages).where((0, import_drizzle_orm3.eq)(messages.id, msgId));
      res.json(msg);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/pos-checkout", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const currentUser = req.currentUser;
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm3.eq)(salons.id, salonId));
      const { customerName, items, subtotal, discount, tax, total, paymentMethod, note, invoiceNo } = req.body;
      const bookingId = import_crypto3.default.randomUUID();
      await db.insert(bookings).values({
        id: bookingId,
        userId: currentUser.id,
        salonId,
        salonName: salon?.name || "Salon",
        salonImage: salon?.image || "",
        services: items.map((i) => i.name),
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        totalPrice: total,
        status: "completed",
        paymentMethod: paymentMethod || "cash",
        specialistId: currentUser.id
      });
      let posRate = 5;
      const [posRateSetting] = await db.select().from(appSettings).where((0, import_drizzle_orm3.eq)(appSettings.key, "default_commission_rate"));
      if (posRateSetting) posRate = parseFloat(posRateSetting.value) || 5;
      const posCommissionAmount = Math.ceil(total * (posRate / 100));
      await db.insert(commissions).values({ bookingId, salonId, amount: posCommissionAmount, rate: posRate });
      await logActivity({
        userId: currentUser.id,
        action: "pos.checkout",
        entityType: "booking",
        entityId: bookingId,
        details: { invoiceNo, customerName, items: items.length, total, paymentMethod }
      });
      res.json({ success: true, bookingId, invoiceNo });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/tips", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const tipId = import_crypto3.default.randomUUID();
      await db.insert(tips).values({ ...req.body, salonId, id: tipId });
      const [tip] = await db.select().from(tips).where((0, import_drizzle_orm3.eq)(tips.id, tipId));
      res.json(tip);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/tips", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(tips).where((0, import_drizzle_orm3.eq)(tips.salonId, salonId)).orderBy((0, import_drizzle_orm3.desc)(tips.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/notifications", requireSalonAdmin, async (req, res) => {
    try {
      const userId = req.currentUser.id;
      const notifs = await db.select().from(notifications).where((0, import_drizzle_orm3.eq)(notifications.userId, userId)).orderBy((0, import_drizzle_orm3.desc)(notifications.createdAt)).limit(50);
      res.json(notifs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/notifications/:id/read", requireSalonAdmin, async (req, res) => {
    try {
      await db.update(notifications).set({ read: true }).where((0, import_drizzle_orm3.eq)(notifications.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/notifications/read-all", requireSalonAdmin, async (req, res) => {
    try {
      const userId = req.currentUser.id;
      await db.update(notifications).set({ read: true }).where((0, import_drizzle_orm3.eq)(notifications.userId, userId));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/staff/notifications", requireStaff, async (req, res) => {
    try {
      const userId = req.currentUser.id;
      const notifs = await db.select().from(notifications).where((0, import_drizzle_orm3.eq)(notifications.userId, userId)).orderBy((0, import_drizzle_orm3.desc)(notifications.createdAt)).limit(50);
      res.json(notifs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/staff/notifications/:id/read", requireStaff, async (req, res) => {
    try {
      await db.update(notifications).set({ read: true }).where((0, import_drizzle_orm3.eq)(notifications.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/loyalty/my-transactions", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const txns = await db.select().from(loyaltyTransactions).where((0, import_drizzle_orm3.eq)(loyaltyTransactions.userId, userId)).orderBy((0, import_drizzle_orm3.desc)(loyaltyTransactions.createdAt));
      const [user] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, userId));
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
      const [user] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, userId));
      if (!user || (user.loyaltyPoints ?? 0) < points) {
        return res.status(400).json({ message: "Insufficient loyalty points" });
      }
      await db.update(users).set({ loyaltyPoints: (user.loyaltyPoints ?? 0) - points }).where((0, import_drizzle_orm3.eq)(users.id, userId));
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
        const [existing] = await db.select().from(salons).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(salons.landingSlug, slug), import_drizzle_orm3.sql`id != ${salonId}`));
        if (existing) return res.status(400).json({ message: "This slug is already in use by another salon." });
        const updates = { landingSlug: slug };
        if (landingEnabled !== void 0) updates.landingEnabled = landingEnabled;
        if (landingTheme !== void 0) updates.landingTheme = landingTheme;
        if (landingAccentColor !== void 0) updates.landingAccentColor = landingAccentColor;
        if (landingBookingUrl !== void 0) updates.landingBookingUrl = landingBookingUrl;
        await db.update(salons).set(updates).where((0, import_drizzle_orm3.eq)(salons.id, salonId));
      } else {
        const updates = {};
        if (landingEnabled !== void 0) updates.landingEnabled = landingEnabled;
        if (landingTheme !== void 0) updates.landingTheme = landingTheme;
        if (landingAccentColor !== void 0) updates.landingAccentColor = landingAccentColor;
        if (landingBookingUrl !== void 0) updates.landingBookingUrl = landingBookingUrl;
        if (Object.keys(updates).length) await db.update(salons).set(updates).where((0, import_drizzle_orm3.eq)(salons.id, salonId));
      }
      const [updated] = await db.select().from(salons).where((0, import_drizzle_orm3.eq)(salons.id, salonId));
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/landing-pages/:salonId/reset-views", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(salons).set({ landingViews: 0 }).where((0, import_drizzle_orm3.eq)(salons.id, String(req.params.salonId)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/salon/:slug", async (req, res) => {
    try {
      const slug = String(req.params.slug).toLowerCase();
      const [salon] = await db.select().from(salons).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(salons.landingSlug, slug), (0, import_drizzle_orm3.eq)(salons.landingEnabled, true)));
      if (!salon) {
        return res.status(404).send(`<!DOCTYPE html><html><head><title>Not Found</title><style>body{background:#181A20;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column}</style></head><body><h1 style="font-size:3rem">404</h1><p>Salon page not found or not yet published.</p></body></html>`);
      }
      await db.update(salons).set({ landingViews: (salon.landingViews ?? 0) + 1 }).where((0, import_drizzle_orm3.eq)(salons.id, salon.id));
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
init_schema();
var import_drizzle_orm4 = require("drizzle-orm");
function safeJsonArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}
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
  app2.post("/api/auth/google/token", async (req, res) => {
    try {
      const { credential } = req.body || {};
      if (!credential || typeof credential !== "string") {
        return res.status(400).json({ message: "credential is required" });
      }
      const tokenInfoRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );
      const payload = await tokenInfoRes.json();
      if (!tokenInfoRes.ok || payload.error_description || !payload.email) {
        return res.status(401).json({ message: payload.error_description || "Invalid Google token" });
      }
      const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
      if (clientId && payload.aud !== clientId) {
        return res.status(401).json({ message: "Token audience mismatch" });
      }
      let user = await getUserByEmail(payload.email);
      if (!user) {
        user = await createUser({
          fullName: payload.name || payload.email.split("@")[0],
          email: payload.email,
          password: "__google_oauth__" + Date.now()
        });
        if (payload.picture) {
          user = await updateUser(user.id, { avatar: payload.picture });
        }
        try {
          await createNotification({
            userId: user.id,
            title: "Welcome to Casca!",
            message: "Your account has been created with Google. Start exploring salons near you!",
            type: "system"
          });
        } catch {
        }
      } else if (payload.picture && !user.avatar) {
        user = await updateUser(user.id, { avatar: payload.picture });
      }
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) console.error("Session save error:", err);
        res.json({ user });
      });
    } catch (err) {
      console.error("Google token verify error:", err);
      res.status(500).json({ message: err?.message || "Token verification failed" });
    }
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
        return res.json({ authenticated: false, user: null });
      }
      const user = await getUserById(userId);
      if (!user) {
        return res.json({ authenticated: false, user: null });
      }
      const { password: _, ...safeUser } = user;
      res.json({ authenticated: true, user: safeUser });
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
      const fixedSalons = allSalons.map((s) => ({ ...s, gallery: safeJsonArray(s.gallery) }));
      res.json(fixedSalons);
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
      const idOrSlug = String(req.params.id);
      let salon = await getSalonById(idOrSlug);
      if (!salon) {
        const { salons: salonsTable } = (init_schema(), __toCommonJS(schema_exports));
        const { eq: eqOp } = require("drizzle-orm");
        const [bySlug] = await db.select().from(salonsTable).where(eqOp(salonsTable.landingSlug, idOrSlug));
        salon = bySlug || null;
      }
      if (!salon) {
        return res.status(404).json({ message: "Salon not found" });
      }
      const salonId = salon.id;
      const [salonServices2, salonPackages2, salonSpecialists2, salonReviews2] = await Promise.all([
        getSalonServices(salonId),
        getSalonPackages(salonId),
        getSalonSpecialists(salonId),
        getSalonReviews(salonId)
      ]);
      const gallery = safeJsonArray(salon.gallery);
      const fixedPackages = salonPackages2.map((pkg) => ({
        ...pkg,
        services: safeJsonArray(pkg.services)
      }));
      res.json({ ...salon, gallery, services: salonServices2, packages: fixedPackages, specialists: salonSpecialists2, reviews: salonReviews2 });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/bookings", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const userBookings = await getUserBookings(userId);
      const parsed = userBookings.map((b) => ({
        ...b,
        services: safeJsonArray(b.services)
      }));
      res.json(parsed);
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
      try {
        const { salonStaff: salonStaffTable } = (init_schema(), __toCommonJS(schema_exports));
        const staffLinks = await db.select().from(salonStaffTable).where((0, import_drizzle_orm4.eq)(salonStaffTable.salonId, salonId));
        const [customer] = await db.select().from(users).where((0, import_drizzle_orm4.eq)(users.id, userId));
        const customerName = customer?.fullName || "Customer";
        for (const link of staffLinks) {
          await createNotification({
            userId: link.userId,
            title: "New Booking",
            message: `${customerName} booked at ${salonName} on ${date} at ${time} \u2014 CHF ${totalPrice}`,
            type: "booking"
          });
        }
        try {
          const { notifySalonViaWhatsApp: notifySalonViaWhatsApp2, notifySuperAdminViaWhatsApp: notifySuperAdminViaWhatsApp2 } = (init_whatsappService(), __toCommonJS(whatsappService_exports));
          const waMsg = `New Booking!
${customerName} at ${salonName}
Date: ${date} at ${time}
Total: CHF ${totalPrice}`;
          await notifySalonViaWhatsApp2(salonId, waMsg);
          await notifySuperAdminViaWhatsApp2(waMsg);
        } catch (waErr) {
          console.warn("WhatsApp notification failed:", waErr);
        }
      } catch (e) {
        console.warn("Failed to notify staff:", e);
      }
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
            sender: m.sender,
            unread: msgs.filter((x) => x.salonId === m.salonId && x.sender === "salon" && !x.isRead).length
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
      const salonId = String(req.params.salonId);
      const msgs = await getConversation(userId, salonId);
      await db.update(messages).set({ isRead: 1 }).where(
        (0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(messages.userId, userId), (0, import_drizzle_orm4.eq)(messages.salonId, salonId), (0, import_drizzle_orm4.eq)(messages.sender, "salon"))
      );
      res.json(msgs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const [currentUser] = await db.select().from(users).where((0, import_drizzle_orm4.eq)(users.id, userId));
      const { salonId, salonName, salonImage, content, messageType } = req.body;
      const msgId = import_node_crypto.default.randomUUID();
      await db.insert(messages).values({
        id: msgId,
        userId,
        salonId,
        salonName,
        salonImage: salonImage || "",
        content,
        sender: "user",
        senderName: currentUser?.fullName || "",
        isRead: 0,
        messageType: messageType || "text"
      });
      const [msg] = await db.select().from(messages).where((0, import_drizzle_orm4.eq)(messages.id, msgId));
      try {
        const { salonStaff: salonStaffTable } = (init_schema(), __toCommonJS(schema_exports));
        const staffLinks = await db.select().from(salonStaffTable).where((0, import_drizzle_orm4.eq)(salonStaffTable.salonId, salonId));
        for (const link of staffLinks) {
          await createNotification({
            userId: link.userId,
            title: "New Message",
            message: `${currentUser?.fullName || "Customer"}: ${content.substring(0, 80)}`,
            type: "message"
          });
        }
      } catch (e) {
        console.warn("Failed to notify staff about message:", e);
      }
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
  app2.get("/api/salons-with-discounts", async (_req, res) => {
    try {
      const now = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const activeCouponsList = await db.select().from(coupons).where((0, import_drizzle_orm4.and)(
        (0, import_drizzle_orm4.eq)(coupons.active, true),
        import_drizzle_orm4.sql`${coupons.expiryDate} >= ${now}`,
        import_drizzle_orm4.sql`${coupons.salonId} IS NOT NULL AND ${coupons.salonId} != ''`
      ));
      const salonIds = [...new Set(activeCouponsList.map((c) => c.salonId).filter(Boolean))];
      if (salonIds.length === 0) return res.json([]);
      const salonsList = await db.select().from(salons).where(import_drizzle_orm4.sql`${salons.id} IN (${import_drizzle_orm4.sql.join(salonIds.map((id) => import_drizzle_orm4.sql`${id}`), import_drizzle_orm4.sql`, `)})`);
      const result = salonsList.map((salon) => ({
        ...salon,
        coupons: activeCouponsList.filter((c) => c.salonId === salon.id),
        bestDiscount: Math.max(...activeCouponsList.filter((c) => c.salonId === salon.id).map((c) => c.discount))
      }));
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, salonId } = req.body;
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
      if (coupon.salonId && coupon.salonId !== "" && salonId && coupon.salonId !== salonId) {
        return res.status(400).json({ message: "This coupon is not valid for this salon" });
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
  app2.post("/api/trial-request", async (req, res) => {
    try {
      const { salonName, ownerName, email, phone, city, country, message } = req.body;
      if (!salonName || !ownerName || !email || !phone) {
        return res.status(400).json({ message: "Salon name, owner name, email, and phone are required" });
      }
      const { trialRequests: trialRequests2 } = (init_schema(), __toCommonJS(schema_exports));
      const id = require("node:crypto").randomUUID();
      await db.insert(trialRequests2).values({
        id,
        salonName,
        ownerName,
        email,
        phone,
        city: city || "",
        country: country || "",
        message: message || "",
        status: "pending"
      });
      try {
        const { notifySuperAdminViaWhatsApp: notifySuperAdminViaWhatsApp2 } = (init_whatsappService(), __toCommonJS(whatsappService_exports));
        const waMsg = `New Trial Request!
Salon: ${salonName}
Owner: ${ownerName}
Email: ${email}
Phone: ${phone}
City: ${city || "-"}
Country: ${country || "-"}${message ? `
Message: ${message}` : ""}`;
        await notifySuperAdminViaWhatsApp2(waMsg);
      } catch (e) {
        console.warn("WhatsApp trial notification failed:", e);
      }
      try {
        const { sendTrialRequestNotification: sendTrialRequestNotification2 } = (init_emailService(), __toCommonJS(emailService_exports));
        await sendTrialRequestNotification2({ salonName, ownerName, email, phone, city: city || "", country: country || "", message: message || "" });
      } catch (e) {
        console.warn("Email trial notification failed:", e);
      }
      try {
        const superAdmins = await db.select().from(users).where((0, import_drizzle_orm4.eq)(users.role, "super_admin"));
        for (const admin of superAdmins) {
          await createNotification({
            userId: admin.id,
            title: "New Trial Request",
            message: `${ownerName} from "${salonName}" requested a 14-day free trial. Phone: ${phone}`,
            type: "system"
          });
        }
      } catch (e) {
        console.warn("Admin notification failed:", e);
      }
      await logActivity({ userId: "", action: "trial.requested", entityType: "trial_request", entityId: id, metadata: { salonName, ownerName, email, phone } });
      res.status(201).json({ message: "Trial request submitted successfully", id });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/trial-requests", requireAuth, async (req, res) => {
    try {
      const { trialRequests: trialRequests2 } = (init_schema(), __toCommonJS(schema_exports));
      const { desc: descOrder } = require("drizzle-orm");
      const requests = await db.select().from(trialRequests2).orderBy(descOrder(trialRequests2.createdAt));
      res.json(requests);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/trial-requests/:id", requireAuth, async (req, res) => {
    try {
      const { trialRequests: trialRequests2 } = (init_schema(), __toCommonJS(schema_exports));
      await db.update(trialRequests2).set({ status: req.body.status }).where((0, import_drizzle_orm4.eq)(trialRequests2.id, req.params.id));
      res.json({ message: "Updated" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/ai/style-advisor", (_req, res) => {
    res.json({ status: "ok", message: "AI Style Advisor API. Send a POST request with { skinTone, hairType, faceShape, gender } to get recommendations." });
  });
  app2.post("/api/ai/style-advisor", async (req, res) => {
    try {
      const { skinTone, hairType, faceShape, gender, photoBase64 } = req.body;
      if (!skinTone || !hairType) {
        return res.status(400).json({ message: "Skin tone and hair type are required" });
      }
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (apiKey) {
        try {
          const Anthropic = (await import("@anthropic-ai/sdk")).default;
          const client = new Anthropic({ apiKey });
          const userProfile = `Gender: ${gender || "male"}
Skin Tone: ${skinTone}
Hair Type: ${hairType}
Face Shape: ${faceShape || "unknown"}`;
          const messageContent = [];
          if (photoBase64) {
            messageContent.push({
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: photoBase64.replace(/^data:image\/\w+;base64,/, "")
              }
            });
          }
          messageContent.push({
            type: "text",
            text: `You are an expert hairstylist and color consultant. Analyze this client's profile and provide personalized hairstyle recommendations.

Client Profile:
${userProfile}
${photoBase64 ? "\nA photo of the client is attached. Use it to refine your recommendations based on their actual features." : ""}

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

Give exactly 4-5 recommended styles, 3-4 recommended colors, 2 styles to avoid, 2 colors to avoid, 3-4 styling tips, and 2-3 product recommendations. Be specific and practical.`
          });
          const response = await client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2e3,
            messages: [{ role: "user", content: messageContent }]
          });
          const textBlock = response.content.find((b) => b.type === "text");
          if (textBlock && textBlock.type === "text") {
            const jsonStr = textBlock.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            const aiResult = JSON.parse(jsonStr);
            return res.json({ source: "ai", ...aiResult });
          }
        } catch (aiErr) {
          console.warn("AI Style Advisor: Claude API failed, using fallback:", aiErr.message);
        }
      }
      const result = generateStyleRecommendations(skinTone, hairType, faceShape || "oval", gender || "male");
      res.json({ source: "engine", ...result });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  registerAdminRoutes(app2);
  const httpServer = (0, import_node_http.createServer)(app2);
  return httpServer;
}
function generateStyleRecommendations(skinTone, hairType, faceShape, gender) {
  const allStyles = {
    straight: [
      { name: "Classic Side Part", description: "A timeless look that works great with straight hair. Clean lines and easy to maintain.", difficulty: "easy", maintenanceLevel: "low", bestFor: "Professional settings and daily wear" },
      { name: "Textured Crop", description: "Short sides with textured top adds dimension to straight hair.", difficulty: "easy", maintenanceLevel: "medium", bestFor: "Casual and modern everyday look" },
      { name: "Slick Back", description: "Straight hair holds a slick back perfectly for a polished look.", difficulty: "easy", maintenanceLevel: "medium", bestFor: "Formal events and business" },
      { name: "Pompadour", description: "Volume on top with tapered sides. Straight hair creates clean lines.", difficulty: "medium", maintenanceLevel: "high", bestFor: "Special occasions and statement looks" },
      { name: "Buzz Cut", description: "Ultra low maintenance with a clean, masculine look.", difficulty: "easy", maintenanceLevel: "low", bestFor: "Active lifestyle and hot climates" },
      { name: "French Crop", description: "Short textured fringe with faded sides. Adds character to straight hair.", difficulty: "easy", maintenanceLevel: "low", bestFor: "Trendy casual look" }
    ],
    wavy: [
      { name: "Medium Length Waves", description: "Let your natural waves shine at medium length for effortless style.", difficulty: "easy", maintenanceLevel: "low", bestFor: "Casual everyday and beach vibes" },
      { name: "Wavy Undercut", description: "Shaved sides with wavy top creates a bold contrast.", difficulty: "medium", maintenanceLevel: "medium", bestFor: "Edgy modern look" },
      { name: "Textured Quiff", description: "Wavy hair adds natural texture to a quiff for volume.", difficulty: "medium", maintenanceLevel: "medium", bestFor: "Going out and social events" },
      { name: "Messy Fringe", description: "A relaxed look that embraces your natural wave pattern.", difficulty: "easy", maintenanceLevel: "low", bestFor: "Casual and artistic settings" },
      { name: "Classic Taper", description: "Gradual fade with wavy top kept at 2-3 inches.", difficulty: "easy", maintenanceLevel: "medium", bestFor: "Professional yet stylish" }
    ],
    curly: [
      { name: "Curly Fringe", description: "Embrace your curls with a defined fringe that frames your face.", difficulty: "easy", maintenanceLevel: "medium", bestFor: "Everyday stylish look" },
      { name: "High Top Fade", description: "Faded sides with volume on top showcases curls beautifully.", difficulty: "medium", maintenanceLevel: "medium", bestFor: "Bold statement and streetwear" },
      { name: "Curly Taper", description: "Tapered sides with natural curls on top for a balanced look.", difficulty: "easy", maintenanceLevel: "medium", bestFor: "Professional and casual" },
      { name: "Medium Curly Flow", description: "Grown out curls at medium length for maximum texture.", difficulty: "easy", maintenanceLevel: "high", bestFor: "Creative and artistic settings" },
      { name: "Defined Twist Out", description: "Twisted curls create defined patterns with great volume.", difficulty: "medium", maintenanceLevel: "high", bestFor: "Special occasions and events" }
    ],
    coily: [
      { name: "High Fade with Coils", description: "Clean faded sides highlight your natural coil pattern on top.", difficulty: "easy", maintenanceLevel: "medium", bestFor: "Clean modern everyday look" },
      { name: "TWA (Teeny Weeny Afro)", description: "Short natural coils for a clean, confident look.", difficulty: "easy", maintenanceLevel: "low", bestFor: "Low maintenance lifestyle" },
      { name: "Flat Top", description: "Shaped flat top celebrates coily texture with a bold silhouette.", difficulty: "hard", maintenanceLevel: "high", bestFor: "Statement and retro style" },
      { name: "Coil Out", description: "Defined coils at medium length with proper moisture routine.", difficulty: "medium", maintenanceLevel: "high", bestFor: "Natural hair enthusiasts" },
      { name: "Taper with Line Up", description: "Sharp line up with tapered sides and coily top.", difficulty: "easy", maintenanceLevel: "medium", bestFor: "Clean professional look" }
    ]
  };
  const faceShapeNotes = {
    oval: "Your oval face shape is versatile \u2014 most styles will complement you well.",
    round: "Styles with height on top and shorter sides will elongate your round face shape.",
    square: "Softer styles with some length work well to complement your strong jawline.",
    heart: "Styles with more volume at the jaw level will balance your heart-shaped face.",
    oblong: "Avoid too much height on top. Styles with side volume suit your face shape best.",
    diamond: "Fringes and chin-length styles balance the widest point at your cheekbones."
  };
  const colorMap = {
    fair: [
      { name: "Ash Brown", hex: "#8B7355", reason: "Cool-toned brown creates a soft contrast with fair skin without looking harsh." },
      { name: "Honey Blonde", hex: "#DEB887", reason: "Warm blonde tones add warmth to fair complexions beautifully." },
      { name: "Caramel Highlights", hex: "#C68E4E", reason: "Subtle caramel streaks add dimension and warmth." },
      { name: "Soft Black", hex: "#2C2C2C", reason: "A softer black creates a striking but not overwhelming contrast." }
    ],
    light: [
      { name: "Golden Brown", hex: "#996515", reason: "Warm golden tones complement light skin with warm undertones." },
      { name: "Copper", hex: "#B87333", reason: "Copper tones add richness and vibrancy to light complexions." },
      { name: "Chestnut", hex: "#954535", reason: "Rich chestnut creates a beautiful warm-toned contrast." },
      { name: "Dark Blonde", hex: "#B8860B", reason: "A natural dark blonde enhances light skin beautifully." }
    ],
    medium: [
      { name: "Dark Chocolate", hex: "#3B2F2F", reason: "Rich dark brown enhances medium skin tones with a natural look." },
      { name: "Burgundy", hex: "#800020", reason: "Deep burgundy adds dimension and complements warm medium tones." },
      { name: "Espresso", hex: "#4A2C2A", reason: "Espresso brown creates a polished, sophisticated look." },
      { name: "Auburn", hex: "#A52A2A", reason: "Warm auburn tones bring out the warmth in medium complexions." }
    ],
    olive: [
      { name: "Warm Brown", hex: "#795548", reason: "Warm brown tones harmonize beautifully with olive undertones." },
      { name: "Mahogany", hex: "#C04000", reason: "Rich mahogany brings out golden undertones in olive skin." },
      { name: "Toffee", hex: "#755139", reason: "Toffee tones add subtle warmth without overpowering olive skin." },
      { name: "Dark Auburn", hex: "#6E2C00", reason: "Deep auburn creates a rich, dimensional look on olive skin." }
    ],
    brown: [
      { name: "Jet Black", hex: "#1A1A1A", reason: "Classic black creates a polished and powerful look on brown skin." },
      { name: "Dark Burgundy", hex: "#4A0E0E", reason: "Subtle burgundy adds dimension without looking unnatural." },
      { name: "Blue Black", hex: "#1A1A2E", reason: "Blue-black tones add a beautiful sheen on brown complexions." },
      { name: "Copper Highlights", hex: "#B87333", reason: "Strategic copper highlights add warmth and dimension." }
    ],
    dark: [
      { name: "Rich Black", hex: "#0A0A0A", reason: "Deep black looks strikingly beautiful on dark skin." },
      { name: "Deep Burgundy", hex: "#3C0008", reason: "Subtle burgundy tones catch the light beautifully on dark skin." },
      { name: "Blue Black Sheen", hex: "#16162E", reason: "Creates an elegant reflective quality on dark complexions." },
      { name: "Dark Copper", hex: "#8B4513", reason: "Warm copper creates a striking, head-turning contrast." }
    ]
  };
  const avoidColorsMap = {
    fair: ["Very light blonde (washes out your complexion)", "Orange tones (can make fair skin look sallow)"],
    light: ["Jet black (too harsh of a contrast)", "Platinum blonde (can look washed out)"],
    medium: ["Very light blonde (unnatural contrast)", "Ashy grey (can make skin look dull)"],
    olive: ["Golden blonde (clashes with olive undertones)", "Ashy platinum (fights warm undertones)"],
    brown: ["Very light blonde (extreme unnatural contrast)", "Ashy light brown (can appear dull)"],
    dark: ["Light blonde (extreme contrast looks unnatural)", "Light ashy brown (doesn't complement dark skin)"]
  };
  const tipsMap = {
    straight: [
      "Use a lightweight texturizing spray to add volume and movement to straight hair",
      "Blow dry with a round brush to add body and direction",
      "Apply a matte clay or paste for a natural, textured finish",
      "Get trims every 4-6 weeks to maintain sharp lines and shape"
    ],
    wavy: [
      "Apply a sea salt spray on damp hair to enhance your natural wave pattern",
      "Scrunch your hair gently while air drying for defined waves",
      "Use a diffuser attachment when blow drying to avoid frizz",
      "A light hold cream will keep waves defined without crunchiness"
    ],
    curly: [
      "Always apply styling products to wet hair for best curl definition",
      "Use the 'plopping' technique with a microfiber towel to reduce frizz",
      "Deep condition weekly to keep curls hydrated and bouncy",
      "Never brush curly hair when dry \u2014 use a wide-tooth comb on wet hair only"
    ],
    coily: [
      "Moisture is your best friend \u2014 use leave-in conditioner daily",
      "The LOC method (Liquid, Oil, Cream) locks in hydration for coily hair",
      "Protective styles help retain length and reduce daily manipulation",
      "Use a satin pillowcase or bonnet to protect your hair while sleeping"
    ]
  };
  const productsMap = {
    straight: ["Matte texture paste for hold without shine", "Volumizing spray for body and lift", "Lightweight pomade for sleek styles"],
    wavy: ["Sea salt spray for enhanced wave definition", "Anti-frizz cream for humidity protection", "Light-hold mousse for volume and shape"],
    curly: ["Curl-defining cream for shape and moisture", "Deep conditioning mask for weekly treatment", "Microfiber towel to reduce frizz while drying"],
    coily: ["Leave-in conditioner for daily moisture", "Natural oils (jojoba, argan) for sealing", "Edge control gel for polished line-ups"]
  };
  const styles = allStyles[hairType] || allStyles.straight;
  const colors = colorMap[skinTone] || colorMap.medium;
  const avoidColors = avoidColorsMap[skinTone] || avoidColorsMap.medium;
  const tips2 = tipsMap[hairType] || tipsMap.straight;
  const products2 = productsMap[hairType] || productsMap.straight;
  let recommended = [...styles];
  if (faceShape === "round") {
    recommended = recommended.filter((s) => !s.name.includes("Buzz Cut"));
  } else if (faceShape === "oblong") {
    recommended = recommended.filter((s) => !s.name.includes("Pompadour") && !s.name.includes("High Top"));
  }
  const avoidStyles = [];
  if (faceShape === "round") avoidStyles.push("Very short buzz cuts \u2014 they emphasize roundness. Go for styles with height on top.");
  else if (faceShape === "oblong") avoidStyles.push("Tall pompadours or high tops \u2014 they add more length to an already long face.");
  else avoidStyles.push("Styles that fight against your natural hair texture");
  if (hairType === "curly" || hairType === "coily") {
    avoidStyles.push("Tight slick-back styles \u2014 they strain your natural curl pattern and require excessive heat");
  } else {
    avoidStyles.push("Styles requiring texture you don't naturally have \u2014 embrace your hair type instead");
  }
  return {
    analysis: {
      skinToneAnalysis: `Your ${skinTone} skin tone has ${["fair", "light"].includes(skinTone) ? "cool to neutral" : "warm"} undertones. Colors that complement your tone will create a harmonious look.`,
      hairTypeAnalysis: `Your ${hairType} hair has ${hairType === "straight" ? "smooth texture ideal for sleek styles" : hairType === "wavy" ? "natural movement perfect for textured styles" : hairType === "curly" ? "beautiful natural volume and pattern" : "tight coils with incredible versatility when properly moisturized"}.`,
      faceShapeAnalysis: faceShapeNotes[faceShape] || faceShapeNotes.oval
    },
    recommendedStyles: recommended.slice(0, 5),
    recommendedColors: colors,
    avoidStyles,
    avoidColors,
    stylingTips: tips2,
    productRecommendations: products2
  };
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
