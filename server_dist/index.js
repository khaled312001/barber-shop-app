var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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
  reelComments: () => reelComments,
  reelLikes: () => reelLikes,
  reels: () => reels,
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
import crypto2 from "crypto";
import { mysqlTable, text, varchar, int, boolean, timestamp, double, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
var users, salons, salonStaff, plans, subscriptions, licenseKeys, licenseActivations, activityLogs, commissions, expenses, shifts, services, packages, specialists, reviews, bookings, bookmarkTable, messages, notifications, coupons, inventory, products, reels, reelComments, reelLikes, productOrders, tips, customerNotes, loyaltyTransactions, appSettings, trialRequests, insertUserSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      fullName: text("full_name").notNull(),
      email: varchar("email", { length: 255 }).notNull().unique(),
      password: text("password").notNull(),
      phone: text("phone").default(""),
      avatar: text("avatar").default(""),
      nickname: text("nickname").default(""),
      gender: text("gender").default(""),
      dob: text("dob").default(""),
      role: text("role").default("user"),
      // user | admin | super_admin | salon_admin | staff
      loyaltyPoints: int("loyalty_points").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    salons = mysqlTable("salons", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
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
      gallery: json("gallery").$type().default([]),
      status: text("status").default("active"),
      // active | suspended | deactivated
      ownerId: varchar("owner_id", { length: 255 }).default(""),
      // salon_admin user id
      landingEnabled: boolean("landing_enabled").default(false),
      landingSlug: text("landing_slug").default(""),
      landingViews: int("landing_views").default(0),
      whatsappNumber: text("whatsapp_number").default(""),
      landingTheme: text("landing_theme").default("dark"),
      // dark | light
      landingAccentColor: text("landing_accent_color").default("#F4A460"),
      landingBookingUrl: text("landing_booking_url").default("")
    });
    salonStaff = mysqlTable("salon_staff", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      userId: varchar("user_id", { length: 255 }).notNull(),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      role: text("role").notNull().default("staff"),
      // salon_admin | staff
      createdAt: timestamp("created_at").defaultNow()
    });
    plans = mysqlTable("plans", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      name: text("name").notNull(),
      // Basic | Pro | Enterprise
      price: double("price").notNull().default(0),
      billingCycle: text("billing_cycle").notNull().default("monthly"),
      // monthly | annual
      features: json("features").$type().default([]),
      commissionRate: double("commission_rate").default(5),
      // platform commission %
      maxBookings: int("max_bookings").default(0),
      // 0 = unlimited
      maxStaff: int("max_staff").default(0),
      // 0 = unlimited
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    subscriptions = mysqlTable("subscriptions", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      planId: varchar("plan_id", { length: 255 }).notNull(),
      status: text("status").notNull().default("active"),
      // active | expired | suspended | cancelled
      startDate: text("start_date").notNull(),
      endDate: text("end_date").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    licenseKeys = mysqlTable("license_keys", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      key: varchar("key", { length: 255 }).notNull().unique(),
      salonId: varchar("salon_id", { length: 255 }).default(""),
      // empty = unassigned
      planId: varchar("plan_id", { length: 255 }).default(""),
      status: text("status").notNull().default("unused"),
      // unused | active | revoked
      expiresAt: text("expires_at").default(""),
      maxActivations: int("max_activations").default(0),
      // 0 = unlimited
      activationCount: int("activation_count").default(0),
      // how many devices activated
      createdAt: timestamp("created_at").defaultNow()
    });
    licenseActivations = mysqlTable("license_activations", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      licenseKeyId: varchar("license_key_id", { length: 255 }).notNull(),
      deviceId: text("device_id").notNull(),
      email: text("email").default(""),
      activatedAt: timestamp("activated_at").defaultNow()
    });
    activityLogs = mysqlTable("activity_logs", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      userId: varchar("user_id", { length: 255 }).default(""),
      userRole: text("user_role").default(""),
      action: text("action").notNull(),
      // e.g. "user.login", "booking.created", "salon.deactivated"
      entityType: text("entity_type").default(""),
      // user | salon | booking | subscription
      entityId: varchar("entity_id", { length: 255 }).default(""),
      metadata: json("metadata").$type().default({}),
      createdAt: timestamp("created_at").defaultNow()
    });
    commissions = mysqlTable("commissions", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      bookingId: varchar("booking_id", { length: 255 }).notNull(),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      amount: double("amount").notNull().default(0),
      rate: double("rate").notNull().default(5),
      status: text("status").notNull().default("pending"),
      // pending | paid
      createdAt: timestamp("created_at").defaultNow()
    });
    expenses = mysqlTable("expenses", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      description: text("description").notNull(),
      amount: double("amount").notNull(),
      category: text("category").default("general"),
      // rent | supplies | utilities | salaries | general
      date: text("date").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    shifts = mysqlTable("shifts", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      staffId: varchar("staff_id", { length: 255 }).notNull(),
      // references users.id
      dayOfWeek: int("day_of_week").notNull(),
      // 0=Sunday, 6=Saturday
      startTime: text("start_time").notNull(),
      // "09:00"
      endTime: text("end_time").notNull(),
      // "17:00"
      createdAt: timestamp("created_at").defaultNow()
    });
    services = mysqlTable("services", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      name: text("name").notNull(),
      price: double("price").notNull(),
      duration: text("duration").notNull(),
      image: text("image").default(""),
      category: text("category").default("")
    });
    packages = mysqlTable("packages", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      name: text("name").notNull(),
      price: double("price").notNull(),
      originalPrice: double("original_price").notNull(),
      services: json("services").$type().default([]),
      image: text("image").default("")
    });
    specialists = mysqlTable("specialists", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      name: text("name").notNull(),
      role: text("role").notNull(),
      image: text("image").default(""),
      rating: double("rating").default(0)
    });
    reviews = mysqlTable("reviews", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      userId: varchar("user_id", { length: 255 }),
      userName: text("user_name").notNull(),
      userImage: text("user_image").default(""),
      rating: int("rating").notNull(),
      comment: text("comment").default(""),
      date: text("date").default(""),
      createdAt: timestamp("created_at").defaultNow()
    });
    bookings = mysqlTable("bookings", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      userId: varchar("user_id", { length: 255 }).notNull(),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      salonName: text("salon_name").notNull(),
      salonImage: text("salon_image").default(""),
      services: json("services_list").$type().default([]),
      date: text("date").notNull(),
      time: text("time").notNull(),
      totalPrice: double("total_price").notNull(),
      status: text("status").notNull().default("upcoming"),
      paymentMethod: text("payment_method").default(""),
      specialistId: varchar("specialist_id", { length: 255 }).default(""),
      createdAt: timestamp("created_at").defaultNow()
    });
    bookmarkTable = mysqlTable("bookmarks", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      userId: varchar("user_id", { length: 255 }).notNull(),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    messages = mysqlTable("messages", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      userId: varchar("user_id", { length: 255 }).notNull(),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      salonName: text("salon_name").notNull(),
      salonImage: text("salon_image").default(""),
      content: text("content").notNull(),
      sender: text("sender").notNull().default("salon"),
      senderName: text("sender_name").default(""),
      senderRole: text("sender_role").default(""),
      // Specific salon-side recipient (staff or admin user id) — when set, isolates the thread
      recipientUserId: varchar("recipient_user_id", { length: 255 }).default(""),
      isRead: int("is_read").default(0),
      messageType: text("message_type").default("text"),
      createdAt: timestamp("created_at").defaultNow()
    });
    notifications = mysqlTable("notifications", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      userId: varchar("user_id", { length: 255 }).notNull(),
      title: text("title").notNull(),
      message: text("message").notNull(),
      type: text("type").notNull().default("system"),
      read: boolean("read").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    coupons = mysqlTable("coupons", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      code: varchar("code", { length: 255 }).notNull().unique(),
      discount: double("discount").notNull(),
      type: text("type").notNull().default("percentage"),
      expiryDate: text("expiry_date").notNull(),
      usageLimit: int("usage_limit").default(0),
      usedCount: int("used_count").default(0),
      active: boolean("active").default(true),
      salonId: varchar("salon_id", { length: 255 }).default(""),
      createdAt: timestamp("created_at").defaultNow()
    });
    inventory = mysqlTable("inventory", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      name: text("name").notNull(),
      category: text("category").default("general"),
      // tools | products | supplies
      quantity: int("quantity").default(0),
      minQuantity: int("min_quantity").default(5),
      unit: text("unit").default("pcs"),
      price: double("price").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    products = mysqlTable("products", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      salonName: text("salon_name").default(""),
      name: text("name").notNull(),
      description: text("description").default(""),
      price: double("price").notNull(),
      image: text("image").default(""),
      category: text("category").default("general"),
      stock: int("stock").default(0),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    reels = mysqlTable("reels", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      userId: varchar("user_id", { length: 255 }).notNull(),
      userName: text("user_name").default(""),
      userAvatar: text("user_avatar").default(""),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      salonName: text("salon_name").default(""),
      bookingId: varchar("booking_id", { length: 255 }).default(""),
      videoUrl: text("video_url").notNull(),
      thumbnailUrl: text("thumbnail_url").default(""),
      caption: text("caption").default(""),
      rating: int("rating").default(5),
      status: text("status").notNull().default("pending"),
      // pending | approved | rejected
      rejectionReason: text("rejection_reason").default(""),
      views: int("views").default(0),
      likes: int("likes").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      approvedAt: timestamp("approved_at")
    });
    reelComments = mysqlTable("reel_comments", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      reelId: varchar("reel_id", { length: 255 }).notNull(),
      userId: varchar("user_id", { length: 255 }).notNull(),
      userName: text("user_name").default(""),
      userAvatar: text("user_avatar").default(""),
      text: text("text").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    reelLikes = mysqlTable("reel_likes", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      reelId: varchar("reel_id", { length: 255 }).notNull(),
      userId: varchar("user_id", { length: 255 }).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    productOrders = mysqlTable("product_orders", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      userId: varchar("user_id", { length: 255 }).notNull(),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      items: json("items").$type().default([]),
      totalPrice: double("total_price").notNull(),
      status: text("status").default("pending"),
      paymentMethod: text("payment_method").default("cash"),
      shippingAddress: text("shipping_address").default(""),
      phone: text("phone").default(""),
      notes: text("notes").default(""),
      createdAt: timestamp("created_at").defaultNow()
    });
    tips = mysqlTable("tips", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      bookingId: varchar("booking_id", { length: 255 }).notNull(),
      staffId: varchar("staff_id", { length: 255 }).notNull(),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      amount: double("amount").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    customerNotes = mysqlTable("customer_notes", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      salonId: varchar("salon_id", { length: 255 }).notNull(),
      customerId: varchar("customer_id", { length: 255 }).notNull(),
      note: text("note").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    loyaltyTransactions = mysqlTable("loyalty_transactions", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      userId: varchar("user_id", { length: 255 }).notNull(),
      salonId: varchar("salon_id", { length: 255 }).default(""),
      points: int("points").notNull(),
      // positive = earned, negative = redeemed
      type: text("type").notNull().default("earned"),
      // earned | redeemed
      description: text("description").default(""),
      createdAt: timestamp("created_at").defaultNow()
    });
    appSettings = mysqlTable("app_settings", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      key: varchar("key", { length: 255 }).notNull().unique(),
      value: text("value").notNull(),
      description: text("description").default(""),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    trialRequests = mysqlTable("trial_requests", {
      id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto2.randomUUID()),
      salonName: text("salon_name").notNull(),
      ownerName: text("owner_name").notNull(),
      email: varchar("email", { length: 255 }).notNull(),
      phone: text("phone").notNull(),
      city: text("city").default(""),
      country: text("country").default(""),
      message: text("message").default(""),
      status: text("status").default("pending"),
      // pending | contacted | approved | rejected
      createdAt: timestamp("created_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).pick({
      fullName: true,
      email: true,
      password: true
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  pool: () => pool
});
import * as dotenv from "dotenv";
import path from "path";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    dotenv.config({ path: path.resolve(process.cwd(), ".env") });
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10
    });
    db = drizzle(pool, { schema: schema_exports, mode: "default" });
  }
});

// node_modules/bcryptjs/umd/index.js
var require_umd = __commonJS({
  "node_modules/bcryptjs/umd/index.js"(exports, module) {
    (function(global, factory) {
      function preferDefault(exports2) {
        return exports2.default || exports2;
      }
      if (typeof define === "function" && define.amd) {
        define(["crypto"], function(_crypto) {
          var exports2 = {};
          factory(exports2, _crypto);
          return preferDefault(exports2);
        });
      } else if (typeof exports === "object") {
        factory(exports, __require("crypto"));
        if (typeof module === "object") module.exports = preferDefault(exports);
      } else {
        (function() {
          var exports2 = {};
          factory(exports2, global.crypto);
          global.bcrypt = preferDefault(exports2);
        })();
      }
    })(
      typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : exports,
      function(_exports, _crypto) {
        "use strict";
        Object.defineProperty(_exports, "__esModule", {
          value: true
        });
        _exports.compare = compare2;
        _exports.compareSync = compareSync2;
        _exports.decodeBase64 = decodeBase642;
        _exports.default = void 0;
        _exports.encodeBase64 = encodeBase642;
        _exports.genSalt = genSalt2;
        _exports.genSaltSync = genSaltSync2;
        _exports.getRounds = getRounds2;
        _exports.getSalt = getSalt2;
        _exports.hash = hash2;
        _exports.hashSync = hashSync2;
        _exports.setRandomFallback = setRandomFallback2;
        _exports.truncates = truncates2;
        _crypto = _interopRequireDefault(_crypto);
        function _interopRequireDefault(e) {
          return e && e.__esModule ? e : { default: e };
        }
        var randomFallback2 = null;
        function randomBytes2(len) {
          try {
            return crypto.getRandomValues(new Uint8Array(len));
          } catch {
          }
          try {
            return _crypto.default.randomBytes(len);
          } catch {
          }
          if (!randomFallback2) {
            throw Error(
              "Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative"
            );
          }
          return randomFallback2(len);
        }
        function setRandomFallback2(random) {
          randomFallback2 = random;
        }
        function genSaltSync2(rounds, seed_length) {
          rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS2;
          if (typeof rounds !== "number")
            throw Error(
              "Illegal arguments: " + typeof rounds + ", " + typeof seed_length
            );
          if (rounds < 4) rounds = 4;
          else if (rounds > 31) rounds = 31;
          var salt = [];
          salt.push("$2b$");
          if (rounds < 10) salt.push("0");
          salt.push(rounds.toString());
          salt.push("$");
          salt.push(base64_encode2(randomBytes2(BCRYPT_SALT_LEN2), BCRYPT_SALT_LEN2));
          return salt.join("");
        }
        function genSalt2(rounds, seed_length, callback) {
          if (typeof seed_length === "function")
            callback = seed_length, seed_length = void 0;
          if (typeof rounds === "function")
            callback = rounds, rounds = void 0;
          if (typeof rounds === "undefined") rounds = GENSALT_DEFAULT_LOG2_ROUNDS2;
          else if (typeof rounds !== "number")
            throw Error("illegal arguments: " + typeof rounds);
          function _async(callback2) {
            nextTick2(function() {
              try {
                callback2(null, genSaltSync2(rounds));
              } catch (err) {
                callback2(err);
              }
            });
          }
          if (callback) {
            if (typeof callback !== "function")
              throw Error("Illegal callback: " + typeof callback);
            _async(callback);
          } else
            return new Promise(function(resolve2, reject) {
              _async(function(err, res) {
                if (err) {
                  reject(err);
                  return;
                }
                resolve2(res);
              });
            });
        }
        function hashSync2(password, salt) {
          if (typeof salt === "undefined") salt = GENSALT_DEFAULT_LOG2_ROUNDS2;
          if (typeof salt === "number") salt = genSaltSync2(salt);
          if (typeof password !== "string" || typeof salt !== "string")
            throw Error(
              "Illegal arguments: " + typeof password + ", " + typeof salt
            );
          return _hash2(password, salt);
        }
        function hash2(password, salt, callback, progressCallback) {
          function _async(callback2) {
            if (typeof password === "string" && typeof salt === "number")
              genSalt2(salt, function(err, salt2) {
                _hash2(password, salt2, callback2, progressCallback);
              });
            else if (typeof password === "string" && typeof salt === "string")
              _hash2(password, salt, callback2, progressCallback);
            else
              nextTick2(
                callback2.bind(
                  this,
                  Error(
                    "Illegal arguments: " + typeof password + ", " + typeof salt
                  )
                )
              );
          }
          if (callback) {
            if (typeof callback !== "function")
              throw Error("Illegal callback: " + typeof callback);
            _async(callback);
          } else
            return new Promise(function(resolve2, reject) {
              _async(function(err, res) {
                if (err) {
                  reject(err);
                  return;
                }
                resolve2(res);
              });
            });
        }
        function safeStringCompare2(known, unknown) {
          var diff = known.length ^ unknown.length;
          for (var i = 0; i < known.length; ++i) {
            diff |= known.charCodeAt(i) ^ unknown.charCodeAt(i);
          }
          return diff === 0;
        }
        function compareSync2(password, hash3) {
          if (typeof password !== "string" || typeof hash3 !== "string")
            throw Error(
              "Illegal arguments: " + typeof password + ", " + typeof hash3
            );
          if (hash3.length !== 60) return false;
          return safeStringCompare2(
            hashSync2(password, hash3.substring(0, hash3.length - 31)),
            hash3
          );
        }
        function compare2(password, hashValue, callback, progressCallback) {
          function _async(callback2) {
            if (typeof password !== "string" || typeof hashValue !== "string") {
              nextTick2(
                callback2.bind(
                  this,
                  Error(
                    "Illegal arguments: " + typeof password + ", " + typeof hashValue
                  )
                )
              );
              return;
            }
            if (hashValue.length !== 60) {
              nextTick2(callback2.bind(this, null, false));
              return;
            }
            hash2(
              password,
              hashValue.substring(0, 29),
              function(err, comp) {
                if (err) callback2(err);
                else callback2(null, safeStringCompare2(comp, hashValue));
              },
              progressCallback
            );
          }
          if (callback) {
            if (typeof callback !== "function")
              throw Error("Illegal callback: " + typeof callback);
            _async(callback);
          } else
            return new Promise(function(resolve2, reject) {
              _async(function(err, res) {
                if (err) {
                  reject(err);
                  return;
                }
                resolve2(res);
              });
            });
        }
        function getRounds2(hash3) {
          if (typeof hash3 !== "string")
            throw Error("Illegal arguments: " + typeof hash3);
          return parseInt(hash3.split("$")[2], 10);
        }
        function getSalt2(hash3) {
          if (typeof hash3 !== "string")
            throw Error("Illegal arguments: " + typeof hash3);
          if (hash3.length !== 60)
            throw Error("Illegal hash length: " + hash3.length + " != 60");
          return hash3.substring(0, 29);
        }
        function truncates2(password) {
          if (typeof password !== "string")
            throw Error("Illegal arguments: " + typeof password);
          return utf8Length2(password) > 72;
        }
        var nextTick2 = typeof setImmediate === "function" ? setImmediate : typeof scheduler === "object" && typeof scheduler.postTask === "function" ? scheduler.postTask.bind(scheduler) : setTimeout;
        function utf8Length2(string) {
          var len = 0, c = 0;
          for (var i = 0; i < string.length; ++i) {
            c = string.charCodeAt(i);
            if (c < 128) len += 1;
            else if (c < 2048) len += 2;
            else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
              ++i;
              len += 4;
            } else len += 3;
          }
          return len;
        }
        function utf8Array2(string) {
          var offset = 0, c1, c2;
          var buffer = new Array(utf8Length2(string));
          for (var i = 0, k = string.length; i < k; ++i) {
            c1 = string.charCodeAt(i);
            if (c1 < 128) {
              buffer[offset++] = c1;
            } else if (c1 < 2048) {
              buffer[offset++] = c1 >> 6 | 192;
              buffer[offset++] = c1 & 63 | 128;
            } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
              c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
              ++i;
              buffer[offset++] = c1 >> 18 | 240;
              buffer[offset++] = c1 >> 12 & 63 | 128;
              buffer[offset++] = c1 >> 6 & 63 | 128;
              buffer[offset++] = c1 & 63 | 128;
            } else {
              buffer[offset++] = c1 >> 12 | 224;
              buffer[offset++] = c1 >> 6 & 63 | 128;
              buffer[offset++] = c1 & 63 | 128;
            }
          }
          return buffer;
        }
        var BASE64_CODE2 = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(
          ""
        );
        var BASE64_INDEX2 = [
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          0,
          1,
          54,
          55,
          56,
          57,
          58,
          59,
          60,
          61,
          62,
          63,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          -1,
          -1,
          -1,
          -1,
          -1,
          -1,
          28,
          29,
          30,
          31,
          32,
          33,
          34,
          35,
          36,
          37,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          46,
          47,
          48,
          49,
          50,
          51,
          52,
          53,
          -1,
          -1,
          -1,
          -1,
          -1
        ];
        function base64_encode2(b, len) {
          var off = 0, rs = [], c1, c2;
          if (len <= 0 || len > b.length) throw Error("Illegal len: " + len);
          while (off < len) {
            c1 = b[off++] & 255;
            rs.push(BASE64_CODE2[c1 >> 2 & 63]);
            c1 = (c1 & 3) << 4;
            if (off >= len) {
              rs.push(BASE64_CODE2[c1 & 63]);
              break;
            }
            c2 = b[off++] & 255;
            c1 |= c2 >> 4 & 15;
            rs.push(BASE64_CODE2[c1 & 63]);
            c1 = (c2 & 15) << 2;
            if (off >= len) {
              rs.push(BASE64_CODE2[c1 & 63]);
              break;
            }
            c2 = b[off++] & 255;
            c1 |= c2 >> 6 & 3;
            rs.push(BASE64_CODE2[c1 & 63]);
            rs.push(BASE64_CODE2[c2 & 63]);
          }
          return rs.join("");
        }
        function base64_decode2(s, len) {
          var off = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
          if (len <= 0) throw Error("Illegal len: " + len);
          while (off < slen - 1 && olen < len) {
            code = s.charCodeAt(off++);
            c1 = code < BASE64_INDEX2.length ? BASE64_INDEX2[code] : -1;
            code = s.charCodeAt(off++);
            c2 = code < BASE64_INDEX2.length ? BASE64_INDEX2[code] : -1;
            if (c1 == -1 || c2 == -1) break;
            o = c1 << 2 >>> 0;
            o |= (c2 & 48) >> 4;
            rs.push(String.fromCharCode(o));
            if (++olen >= len || off >= slen) break;
            code = s.charCodeAt(off++);
            c3 = code < BASE64_INDEX2.length ? BASE64_INDEX2[code] : -1;
            if (c3 == -1) break;
            o = (c2 & 15) << 4 >>> 0;
            o |= (c3 & 60) >> 2;
            rs.push(String.fromCharCode(o));
            if (++olen >= len || off >= slen) break;
            code = s.charCodeAt(off++);
            c4 = code < BASE64_INDEX2.length ? BASE64_INDEX2[code] : -1;
            o = (c3 & 3) << 6 >>> 0;
            o |= c4;
            rs.push(String.fromCharCode(o));
            ++olen;
          }
          var res = [];
          for (off = 0; off < olen; off++) res.push(rs[off].charCodeAt(0));
          return res;
        }
        var BCRYPT_SALT_LEN2 = 16;
        var GENSALT_DEFAULT_LOG2_ROUNDS2 = 10;
        var BLOWFISH_NUM_ROUNDS2 = 16;
        var MAX_EXECUTION_TIME2 = 100;
        var P_ORIG2 = [
          608135816,
          2242054355,
          320440878,
          57701188,
          2752067618,
          698298832,
          137296536,
          3964562569,
          1160258022,
          953160567,
          3193202383,
          887688300,
          3232508343,
          3380367581,
          1065670069,
          3041331479,
          2450970073,
          2306472731
        ];
        var S_ORIG2 = [
          3509652390,
          2564797868,
          805139163,
          3491422135,
          3101798381,
          1780907670,
          3128725573,
          4046225305,
          614570311,
          3012652279,
          134345442,
          2240740374,
          1667834072,
          1901547113,
          2757295779,
          4103290238,
          227898511,
          1921955416,
          1904987480,
          2182433518,
          2069144605,
          3260701109,
          2620446009,
          720527379,
          3318853667,
          677414384,
          3393288472,
          3101374703,
          2390351024,
          1614419982,
          1822297739,
          2954791486,
          3608508353,
          3174124327,
          2024746970,
          1432378464,
          3864339955,
          2857741204,
          1464375394,
          1676153920,
          1439316330,
          715854006,
          3033291828,
          289532110,
          2706671279,
          2087905683,
          3018724369,
          1668267050,
          732546397,
          1947742710,
          3462151702,
          2609353502,
          2950085171,
          1814351708,
          2050118529,
          680887927,
          999245976,
          1800124847,
          3300911131,
          1713906067,
          1641548236,
          4213287313,
          1216130144,
          1575780402,
          4018429277,
          3917837745,
          3693486850,
          3949271944,
          596196993,
          3549867205,
          258830323,
          2213823033,
          772490370,
          2760122372,
          1774776394,
          2652871518,
          566650946,
          4142492826,
          1728879713,
          2882767088,
          1783734482,
          3629395816,
          2517608232,
          2874225571,
          1861159788,
          326777828,
          3124490320,
          2130389656,
          2716951837,
          967770486,
          1724537150,
          2185432712,
          2364442137,
          1164943284,
          2105845187,
          998989502,
          3765401048,
          2244026483,
          1075463327,
          1455516326,
          1322494562,
          910128902,
          469688178,
          1117454909,
          936433444,
          3490320968,
          3675253459,
          1240580251,
          122909385,
          2157517691,
          634681816,
          4142456567,
          3825094682,
          3061402683,
          2540495037,
          79693498,
          3249098678,
          1084186820,
          1583128258,
          426386531,
          1761308591,
          1047286709,
          322548459,
          995290223,
          1845252383,
          2603652396,
          3431023940,
          2942221577,
          3202600964,
          3727903485,
          1712269319,
          422464435,
          3234572375,
          1170764815,
          3523960633,
          3117677531,
          1434042557,
          442511882,
          3600875718,
          1076654713,
          1738483198,
          4213154764,
          2393238008,
          3677496056,
          1014306527,
          4251020053,
          793779912,
          2902807211,
          842905082,
          4246964064,
          1395751752,
          1040244610,
          2656851899,
          3396308128,
          445077038,
          3742853595,
          3577915638,
          679411651,
          2892444358,
          2354009459,
          1767581616,
          3150600392,
          3791627101,
          3102740896,
          284835224,
          4246832056,
          1258075500,
          768725851,
          2589189241,
          3069724005,
          3532540348,
          1274779536,
          3789419226,
          2764799539,
          1660621633,
          3471099624,
          4011903706,
          913787905,
          3497959166,
          737222580,
          2514213453,
          2928710040,
          3937242737,
          1804850592,
          3499020752,
          2949064160,
          2386320175,
          2390070455,
          2415321851,
          4061277028,
          2290661394,
          2416832540,
          1336762016,
          1754252060,
          3520065937,
          3014181293,
          791618072,
          3188594551,
          3933548030,
          2332172193,
          3852520463,
          3043980520,
          413987798,
          3465142937,
          3030929376,
          4245938359,
          2093235073,
          3534596313,
          375366246,
          2157278981,
          2479649556,
          555357303,
          3870105701,
          2008414854,
          3344188149,
          4221384143,
          3956125452,
          2067696032,
          3594591187,
          2921233993,
          2428461,
          544322398,
          577241275,
          1471733935,
          610547355,
          4027169054,
          1432588573,
          1507829418,
          2025931657,
          3646575487,
          545086370,
          48609733,
          2200306550,
          1653985193,
          298326376,
          1316178497,
          3007786442,
          2064951626,
          458293330,
          2589141269,
          3591329599,
          3164325604,
          727753846,
          2179363840,
          146436021,
          1461446943,
          4069977195,
          705550613,
          3059967265,
          3887724982,
          4281599278,
          3313849956,
          1404054877,
          2845806497,
          146425753,
          1854211946,
          1266315497,
          3048417604,
          3681880366,
          3289982499,
          290971e4,
          1235738493,
          2632868024,
          2414719590,
          3970600049,
          1771706367,
          1449415276,
          3266420449,
          422970021,
          1963543593,
          2690192192,
          3826793022,
          1062508698,
          1531092325,
          1804592342,
          2583117782,
          2714934279,
          4024971509,
          1294809318,
          4028980673,
          1289560198,
          2221992742,
          1669523910,
          35572830,
          157838143,
          1052438473,
          1016535060,
          1802137761,
          1753167236,
          1386275462,
          3080475397,
          2857371447,
          1040679964,
          2145300060,
          2390574316,
          1461121720,
          2956646967,
          4031777805,
          4028374788,
          33600511,
          2920084762,
          1018524850,
          629373528,
          3691585981,
          3515945977,
          2091462646,
          2486323059,
          586499841,
          988145025,
          935516892,
          3367335476,
          2599673255,
          2839830854,
          265290510,
          3972581182,
          2759138881,
          3795373465,
          1005194799,
          847297441,
          406762289,
          1314163512,
          1332590856,
          1866599683,
          4127851711,
          750260880,
          613907577,
          1450815602,
          3165620655,
          3734664991,
          3650291728,
          3012275730,
          3704569646,
          1427272223,
          778793252,
          1343938022,
          2676280711,
          2052605720,
          1946737175,
          3164576444,
          3914038668,
          3967478842,
          3682934266,
          1661551462,
          3294938066,
          4011595847,
          840292616,
          3712170807,
          616741398,
          312560963,
          711312465,
          1351876610,
          322626781,
          1910503582,
          271666773,
          2175563734,
          1594956187,
          70604529,
          3617834859,
          1007753275,
          1495573769,
          4069517037,
          2549218298,
          2663038764,
          504708206,
          2263041392,
          3941167025,
          2249088522,
          1514023603,
          1998579484,
          1312622330,
          694541497,
          2582060303,
          2151582166,
          1382467621,
          776784248,
          2618340202,
          3323268794,
          2497899128,
          2784771155,
          503983604,
          4076293799,
          907881277,
          423175695,
          432175456,
          1378068232,
          4145222326,
          3954048622,
          3938656102,
          3820766613,
          2793130115,
          2977904593,
          26017576,
          3274890735,
          3194772133,
          1700274565,
          1756076034,
          4006520079,
          3677328699,
          720338349,
          1533947780,
          354530856,
          688349552,
          3973924725,
          1637815568,
          332179504,
          3949051286,
          53804574,
          2852348879,
          3044236432,
          1282449977,
          3583942155,
          3416972820,
          4006381244,
          1617046695,
          2628476075,
          3002303598,
          1686838959,
          431878346,
          2686675385,
          1700445008,
          1080580658,
          1009431731,
          832498133,
          3223435511,
          2605976345,
          2271191193,
          2516031870,
          1648197032,
          4164389018,
          2548247927,
          300782431,
          375919233,
          238389289,
          3353747414,
          2531188641,
          2019080857,
          1475708069,
          455242339,
          2609103871,
          448939670,
          3451063019,
          1395535956,
          2413381860,
          1841049896,
          1491858159,
          885456874,
          4264095073,
          4001119347,
          1565136089,
          3898914787,
          1108368660,
          540939232,
          1173283510,
          2745871338,
          3681308437,
          4207628240,
          3343053890,
          4016749493,
          1699691293,
          1103962373,
          3625875870,
          2256883143,
          3830138730,
          1031889488,
          3479347698,
          1535977030,
          4236805024,
          3251091107,
          2132092099,
          1774941330,
          1199868427,
          1452454533,
          157007616,
          2904115357,
          342012276,
          595725824,
          1480756522,
          206960106,
          497939518,
          591360097,
          863170706,
          2375253569,
          3596610801,
          1814182875,
          2094937945,
          3421402208,
          1082520231,
          3463918190,
          2785509508,
          435703966,
          3908032597,
          1641649973,
          2842273706,
          3305899714,
          1510255612,
          2148256476,
          2655287854,
          3276092548,
          4258621189,
          236887753,
          3681803219,
          274041037,
          1734335097,
          3815195456,
          3317970021,
          1899903192,
          1026095262,
          4050517792,
          356393447,
          2410691914,
          3873677099,
          3682840055,
          3913112168,
          2491498743,
          4132185628,
          2489919796,
          1091903735,
          1979897079,
          3170134830,
          3567386728,
          3557303409,
          857797738,
          1136121015,
          1342202287,
          507115054,
          2535736646,
          337727348,
          3213592640,
          1301675037,
          2528481711,
          1895095763,
          1721773893,
          3216771564,
          62756741,
          2142006736,
          835421444,
          2531993523,
          1442658625,
          3659876326,
          2882144922,
          676362277,
          1392781812,
          170690266,
          3921047035,
          1759253602,
          3611846912,
          1745797284,
          664899054,
          1329594018,
          3901205900,
          3045908486,
          2062866102,
          2865634940,
          3543621612,
          3464012697,
          1080764994,
          553557557,
          3656615353,
          3996768171,
          991055499,
          499776247,
          1265440854,
          648242737,
          3940784050,
          980351604,
          3713745714,
          1749149687,
          3396870395,
          4211799374,
          3640570775,
          1161844396,
          3125318951,
          1431517754,
          545492359,
          4268468663,
          3499529547,
          1437099964,
          2702547544,
          3433638243,
          2581715763,
          2787789398,
          1060185593,
          1593081372,
          2418618748,
          4260947970,
          69676912,
          2159744348,
          86519011,
          2512459080,
          3838209314,
          1220612927,
          3339683548,
          133810670,
          1090789135,
          1078426020,
          1569222167,
          845107691,
          3583754449,
          4072456591,
          1091646820,
          628848692,
          1613405280,
          3757631651,
          526609435,
          236106946,
          48312990,
          2942717905,
          3402727701,
          1797494240,
          859738849,
          992217954,
          4005476642,
          2243076622,
          3870952857,
          3732016268,
          765654824,
          3490871365,
          2511836413,
          1685915746,
          3888969200,
          1414112111,
          2273134842,
          3281911079,
          4080962846,
          172450625,
          2569994100,
          980381355,
          4109958455,
          2819808352,
          2716589560,
          2568741196,
          3681446669,
          3329971472,
          1835478071,
          660984891,
          3704678404,
          4045999559,
          3422617507,
          3040415634,
          1762651403,
          1719377915,
          3470491036,
          2693910283,
          3642056355,
          3138596744,
          1364962596,
          2073328063,
          1983633131,
          926494387,
          3423689081,
          2150032023,
          4096667949,
          1749200295,
          3328846651,
          309677260,
          2016342300,
          1779581495,
          3079819751,
          111262694,
          1274766160,
          443224088,
          298511866,
          1025883608,
          3806446537,
          1145181785,
          168956806,
          3641502830,
          3584813610,
          1689216846,
          3666258015,
          3200248200,
          1692713982,
          2646376535,
          4042768518,
          1618508792,
          1610833997,
          3523052358,
          4130873264,
          2001055236,
          3610705100,
          2202168115,
          4028541809,
          2961195399,
          1006657119,
          2006996926,
          3186142756,
          1430667929,
          3210227297,
          1314452623,
          4074634658,
          4101304120,
          2273951170,
          1399257539,
          3367210612,
          3027628629,
          1190975929,
          2062231137,
          2333990788,
          2221543033,
          2438960610,
          1181637006,
          548689776,
          2362791313,
          3372408396,
          3104550113,
          3145860560,
          296247880,
          1970579870,
          3078560182,
          3769228297,
          1714227617,
          3291629107,
          3898220290,
          166772364,
          1251581989,
          493813264,
          448347421,
          195405023,
          2709975567,
          677966185,
          3703036547,
          1463355134,
          2715995803,
          1338867538,
          1343315457,
          2802222074,
          2684532164,
          233230375,
          2599980071,
          2000651841,
          3277868038,
          1638401717,
          4028070440,
          3237316320,
          6314154,
          819756386,
          300326615,
          590932579,
          1405279636,
          3267499572,
          3150704214,
          2428286686,
          3959192993,
          3461946742,
          1862657033,
          1266418056,
          963775037,
          2089974820,
          2263052895,
          1917689273,
          448879540,
          3550394620,
          3981727096,
          150775221,
          3627908307,
          1303187396,
          508620638,
          2975983352,
          2726630617,
          1817252668,
          1876281319,
          1457606340,
          908771278,
          3720792119,
          3617206836,
          2455994898,
          1729034894,
          1080033504,
          976866871,
          3556439503,
          2881648439,
          1522871579,
          1555064734,
          1336096578,
          3548522304,
          2579274686,
          3574697629,
          3205460757,
          3593280638,
          3338716283,
          3079412587,
          564236357,
          2993598910,
          1781952180,
          1464380207,
          3163844217,
          3332601554,
          1699332808,
          1393555694,
          1183702653,
          3581086237,
          1288719814,
          691649499,
          2847557200,
          2895455976,
          3193889540,
          2717570544,
          1781354906,
          1676643554,
          2592534050,
          3230253752,
          1126444790,
          2770207658,
          2633158820,
          2210423226,
          2615765581,
          2414155088,
          3127139286,
          673620729,
          2805611233,
          1269405062,
          4015350505,
          3341807571,
          4149409754,
          1057255273,
          2012875353,
          2162469141,
          2276492801,
          2601117357,
          993977747,
          3918593370,
          2654263191,
          753973209,
          36408145,
          2530585658,
          25011837,
          3520020182,
          2088578344,
          530523599,
          2918365339,
          1524020338,
          1518925132,
          3760827505,
          3759777254,
          1202760957,
          3985898139,
          3906192525,
          674977740,
          4174734889,
          2031300136,
          2019492241,
          3983892565,
          4153806404,
          3822280332,
          352677332,
          2297720250,
          60907813,
          90501309,
          3286998549,
          1016092578,
          2535922412,
          2839152426,
          457141659,
          509813237,
          4120667899,
          652014361,
          1966332200,
          2975202805,
          55981186,
          2327461051,
          676427537,
          3255491064,
          2882294119,
          3433927263,
          1307055953,
          942726286,
          933058658,
          2468411793,
          3933900994,
          4215176142,
          1361170020,
          2001714738,
          2830558078,
          3274259782,
          1222529897,
          1679025792,
          2729314320,
          3714953764,
          1770335741,
          151462246,
          3013232138,
          1682292957,
          1483529935,
          471910574,
          1539241949,
          458788160,
          3436315007,
          1807016891,
          3718408830,
          978976581,
          1043663428,
          3165965781,
          1927990952,
          4200891579,
          2372276910,
          3208408903,
          3533431907,
          1412390302,
          2931980059,
          4132332400,
          1947078029,
          3881505623,
          4168226417,
          2941484381,
          1077988104,
          1320477388,
          886195818,
          18198404,
          3786409e3,
          2509781533,
          112762804,
          3463356488,
          1866414978,
          891333506,
          18488651,
          661792760,
          1628790961,
          3885187036,
          3141171499,
          876946877,
          2693282273,
          1372485963,
          791857591,
          2686433993,
          3759982718,
          3167212022,
          3472953795,
          2716379847,
          445679433,
          3561995674,
          3504004811,
          3574258232,
          54117162,
          3331405415,
          2381918588,
          3769707343,
          4154350007,
          1140177722,
          4074052095,
          668550556,
          3214352940,
          367459370,
          261225585,
          2610173221,
          4209349473,
          3468074219,
          3265815641,
          314222801,
          3066103646,
          3808782860,
          282218597,
          3406013506,
          3773591054,
          379116347,
          1285071038,
          846784868,
          2669647154,
          3771962079,
          3550491691,
          2305946142,
          453669953,
          1268987020,
          3317592352,
          3279303384,
          3744833421,
          2610507566,
          3859509063,
          266596637,
          3847019092,
          517658769,
          3462560207,
          3443424879,
          370717030,
          4247526661,
          2224018117,
          4143653529,
          4112773975,
          2788324899,
          2477274417,
          1456262402,
          2901442914,
          1517677493,
          1846949527,
          2295493580,
          3734397586,
          2176403920,
          1280348187,
          1908823572,
          3871786941,
          846861322,
          1172426758,
          3287448474,
          3383383037,
          1655181056,
          3139813346,
          901632758,
          1897031941,
          2986607138,
          3066810236,
          3447102507,
          1393639104,
          373351379,
          950779232,
          625454576,
          3124240540,
          4148612726,
          2007998917,
          544563296,
          2244738638,
          2330496472,
          2058025392,
          1291430526,
          424198748,
          50039436,
          29584100,
          3605783033,
          2429876329,
          2791104160,
          1057563949,
          3255363231,
          3075367218,
          3463963227,
          1469046755,
          985887462
        ];
        var C_ORIG2 = [
          1332899944,
          1700884034,
          1701343084,
          1684370003,
          1668446532,
          1869963892
        ];
        function _encipher2(lr, off, P, S) {
          var n, l = lr[off], r = lr[off + 1];
          l ^= P[0];
          n = S[l >>> 24];
          n += S[256 | l >> 16 & 255];
          n ^= S[512 | l >> 8 & 255];
          n += S[768 | l & 255];
          r ^= n ^ P[1];
          n = S[r >>> 24];
          n += S[256 | r >> 16 & 255];
          n ^= S[512 | r >> 8 & 255];
          n += S[768 | r & 255];
          l ^= n ^ P[2];
          n = S[l >>> 24];
          n += S[256 | l >> 16 & 255];
          n ^= S[512 | l >> 8 & 255];
          n += S[768 | l & 255];
          r ^= n ^ P[3];
          n = S[r >>> 24];
          n += S[256 | r >> 16 & 255];
          n ^= S[512 | r >> 8 & 255];
          n += S[768 | r & 255];
          l ^= n ^ P[4];
          n = S[l >>> 24];
          n += S[256 | l >> 16 & 255];
          n ^= S[512 | l >> 8 & 255];
          n += S[768 | l & 255];
          r ^= n ^ P[5];
          n = S[r >>> 24];
          n += S[256 | r >> 16 & 255];
          n ^= S[512 | r >> 8 & 255];
          n += S[768 | r & 255];
          l ^= n ^ P[6];
          n = S[l >>> 24];
          n += S[256 | l >> 16 & 255];
          n ^= S[512 | l >> 8 & 255];
          n += S[768 | l & 255];
          r ^= n ^ P[7];
          n = S[r >>> 24];
          n += S[256 | r >> 16 & 255];
          n ^= S[512 | r >> 8 & 255];
          n += S[768 | r & 255];
          l ^= n ^ P[8];
          n = S[l >>> 24];
          n += S[256 | l >> 16 & 255];
          n ^= S[512 | l >> 8 & 255];
          n += S[768 | l & 255];
          r ^= n ^ P[9];
          n = S[r >>> 24];
          n += S[256 | r >> 16 & 255];
          n ^= S[512 | r >> 8 & 255];
          n += S[768 | r & 255];
          l ^= n ^ P[10];
          n = S[l >>> 24];
          n += S[256 | l >> 16 & 255];
          n ^= S[512 | l >> 8 & 255];
          n += S[768 | l & 255];
          r ^= n ^ P[11];
          n = S[r >>> 24];
          n += S[256 | r >> 16 & 255];
          n ^= S[512 | r >> 8 & 255];
          n += S[768 | r & 255];
          l ^= n ^ P[12];
          n = S[l >>> 24];
          n += S[256 | l >> 16 & 255];
          n ^= S[512 | l >> 8 & 255];
          n += S[768 | l & 255];
          r ^= n ^ P[13];
          n = S[r >>> 24];
          n += S[256 | r >> 16 & 255];
          n ^= S[512 | r >> 8 & 255];
          n += S[768 | r & 255];
          l ^= n ^ P[14];
          n = S[l >>> 24];
          n += S[256 | l >> 16 & 255];
          n ^= S[512 | l >> 8 & 255];
          n += S[768 | l & 255];
          r ^= n ^ P[15];
          n = S[r >>> 24];
          n += S[256 | r >> 16 & 255];
          n ^= S[512 | r >> 8 & 255];
          n += S[768 | r & 255];
          l ^= n ^ P[16];
          lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS2 + 1];
          lr[off + 1] = l;
          return lr;
        }
        function _streamtoword2(data, offp) {
          for (var i = 0, word = 0; i < 4; ++i)
            word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
          return {
            key: word,
            offp
          };
        }
        function _key2(key, P, S) {
          var offset = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
          for (var i = 0; i < plen; i++)
            sw = _streamtoword2(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
          for (i = 0; i < plen; i += 2)
            lr = _encipher2(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
          for (i = 0; i < slen; i += 2)
            lr = _encipher2(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
        }
        function _ekskey2(data, key, P, S) {
          var offp = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
          for (var i = 0; i < plen; i++)
            sw = _streamtoword2(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
          offp = 0;
          for (i = 0; i < plen; i += 2)
            sw = _streamtoword2(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword2(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher2(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
          for (i = 0; i < slen; i += 2)
            sw = _streamtoword2(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword2(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher2(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
        }
        function _crypt2(b, salt, rounds, callback, progressCallback) {
          var cdata = C_ORIG2.slice(), clen = cdata.length, err;
          if (rounds < 4 || rounds > 31) {
            err = Error("Illegal number of rounds (4-31): " + rounds);
            if (callback) {
              nextTick2(callback.bind(this, err));
              return;
            } else throw err;
          }
          if (salt.length !== BCRYPT_SALT_LEN2) {
            err = Error(
              "Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN2
            );
            if (callback) {
              nextTick2(callback.bind(this, err));
              return;
            } else throw err;
          }
          rounds = 1 << rounds >>> 0;
          var P, S, i = 0, j;
          if (typeof Int32Array === "function") {
            P = new Int32Array(P_ORIG2);
            S = new Int32Array(S_ORIG2);
          } else {
            P = P_ORIG2.slice();
            S = S_ORIG2.slice();
          }
          _ekskey2(salt, b, P, S);
          function next() {
            if (progressCallback) progressCallback(i / rounds);
            if (i < rounds) {
              var start = Date.now();
              for (; i < rounds; ) {
                i = i + 1;
                _key2(b, P, S);
                _key2(salt, P, S);
                if (Date.now() - start > MAX_EXECUTION_TIME2) break;
              }
            } else {
              for (i = 0; i < 64; i++)
                for (j = 0; j < clen >> 1; j++) _encipher2(cdata, j << 1, P, S);
              var ret = [];
              for (i = 0; i < clen; i++)
                ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
              if (callback) {
                callback(null, ret);
                return;
              } else return ret;
            }
            if (callback) nextTick2(next);
          }
          if (typeof callback !== "undefined") {
            next();
          } else {
            var res;
            while (true)
              if (typeof (res = next()) !== "undefined") return res || [];
          }
        }
        function _hash2(password, salt, callback, progressCallback) {
          var err;
          if (typeof password !== "string" || typeof salt !== "string") {
            err = Error("Invalid string / salt: Not a string");
            if (callback) {
              nextTick2(callback.bind(this, err));
              return;
            } else throw err;
          }
          var minor, offset;
          if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
            err = Error("Invalid salt version: " + salt.substring(0, 2));
            if (callback) {
              nextTick2(callback.bind(this, err));
              return;
            } else throw err;
          }
          if (salt.charAt(2) === "$")
            minor = String.fromCharCode(0), offset = 3;
          else {
            minor = salt.charAt(2);
            if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
              err = Error("Invalid salt revision: " + salt.substring(2, 4));
              if (callback) {
                nextTick2(callback.bind(this, err));
                return;
              } else throw err;
            }
            offset = 4;
          }
          if (salt.charAt(offset + 2) > "$") {
            err = Error("Missing salt rounds");
            if (callback) {
              nextTick2(callback.bind(this, err));
              return;
            } else throw err;
          }
          var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
          password += minor >= "a" ? "\0" : "";
          var passwordb = utf8Array2(password), saltb = base64_decode2(real_salt, BCRYPT_SALT_LEN2);
          function finish(bytes) {
            var res = [];
            res.push("$2");
            if (minor >= "a") res.push(minor);
            res.push("$");
            if (rounds < 10) res.push("0");
            res.push(rounds.toString());
            res.push("$");
            res.push(base64_encode2(saltb, saltb.length));
            res.push(base64_encode2(bytes, C_ORIG2.length * 4 - 1));
            return res.join("");
          }
          if (typeof callback == "undefined")
            return finish(_crypt2(passwordb, saltb, rounds));
          else {
            _crypt2(
              passwordb,
              saltb,
              rounds,
              function(err2, bytes) {
                if (err2) callback(err2, null);
                else callback(null, finish(bytes));
              },
              progressCallback
            );
          }
        }
        function encodeBase642(bytes, length) {
          return base64_encode2(bytes, length);
        }
        function decodeBase642(string, length) {
          return base64_decode2(string, length);
        }
        var _default = _exports.default = {
          setRandomFallback: setRandomFallback2,
          genSaltSync: genSaltSync2,
          genSalt: genSalt2,
          hashSync: hashSync2,
          hash: hash2,
          compareSync: compareSync2,
          compare: compare2,
          getRounds: getRounds2,
          getSalt: getSalt2,
          truncates: truncates2,
          encodeBase64: encodeBase642,
          decodeBase64: decodeBase642
        };
      }
    );
  }
});

// node_modules/bcryptjs/index.js
var bcryptjs_exports = {};
__export(bcryptjs_exports, {
  compare: () => compare,
  compareSync: () => compareSync,
  decodeBase64: () => decodeBase64,
  default: () => bcryptjs_default,
  encodeBase64: () => encodeBase64,
  genSalt: () => genSalt,
  genSaltSync: () => genSaltSync,
  getRounds: () => getRounds,
  getSalt: () => getSalt,
  hash: () => hash,
  hashSync: () => hashSync,
  setRandomFallback: () => setRandomFallback,
  truncates: () => truncates
});
import nodeCrypto from "crypto";
function randomBytes(len) {
  try {
    return crypto.getRandomValues(new Uint8Array(len));
  } catch {
  }
  try {
    return nodeCrypto.randomBytes(len);
  } catch {
  }
  if (!randomFallback) {
    throw Error(
      "Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative"
    );
  }
  return randomFallback(len);
}
function setRandomFallback(random) {
  randomFallback = random;
}
function genSaltSync(rounds, seed_length) {
  rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof rounds !== "number")
    throw Error(
      "Illegal arguments: " + typeof rounds + ", " + typeof seed_length
    );
  if (rounds < 4) rounds = 4;
  else if (rounds > 31) rounds = 31;
  var salt = [];
  salt.push("$2b$");
  if (rounds < 10) salt.push("0");
  salt.push(rounds.toString());
  salt.push("$");
  salt.push(base64_encode(randomBytes(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
  return salt.join("");
}
function genSalt(rounds, seed_length, callback) {
  if (typeof seed_length === "function")
    callback = seed_length, seed_length = void 0;
  if (typeof rounds === "function") callback = rounds, rounds = void 0;
  if (typeof rounds === "undefined") rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
  else if (typeof rounds !== "number")
    throw Error("illegal arguments: " + typeof rounds);
  function _async(callback2) {
    nextTick(function() {
      try {
        callback2(null, genSaltSync(rounds));
      } catch (err) {
        callback2(err);
      }
    });
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve2, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve2(res);
      });
    });
}
function hashSync(password, salt) {
  if (typeof salt === "undefined") salt = GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof salt === "number") salt = genSaltSync(salt);
  if (typeof password !== "string" || typeof salt !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof salt);
  return _hash(password, salt);
}
function hash(password, salt, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password === "string" && typeof salt === "number")
      genSalt(salt, function(err, salt2) {
        _hash(password, salt2, callback2, progressCallback);
      });
    else if (typeof password === "string" && typeof salt === "string")
      _hash(password, salt, callback2, progressCallback);
    else
      nextTick(
        callback2.bind(
          this,
          Error("Illegal arguments: " + typeof password + ", " + typeof salt)
        )
      );
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve2, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve2(res);
      });
    });
}
function safeStringCompare(known, unknown) {
  var diff = known.length ^ unknown.length;
  for (var i = 0; i < known.length; ++i) {
    diff |= known.charCodeAt(i) ^ unknown.charCodeAt(i);
  }
  return diff === 0;
}
function compareSync(password, hash2) {
  if (typeof password !== "string" || typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof hash2);
  if (hash2.length !== 60) return false;
  return safeStringCompare(
    hashSync(password, hash2.substring(0, hash2.length - 31)),
    hash2
  );
}
function compare(password, hashValue, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password !== "string" || typeof hashValue !== "string") {
      nextTick(
        callback2.bind(
          this,
          Error(
            "Illegal arguments: " + typeof password + ", " + typeof hashValue
          )
        )
      );
      return;
    }
    if (hashValue.length !== 60) {
      nextTick(callback2.bind(this, null, false));
      return;
    }
    hash(
      password,
      hashValue.substring(0, 29),
      function(err, comp) {
        if (err) callback2(err);
        else callback2(null, safeStringCompare(comp, hashValue));
      },
      progressCallback
    );
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve2, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve2(res);
      });
    });
}
function getRounds(hash2) {
  if (typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof hash2);
  return parseInt(hash2.split("$")[2], 10);
}
function getSalt(hash2) {
  if (typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof hash2);
  if (hash2.length !== 60)
    throw Error("Illegal hash length: " + hash2.length + " != 60");
  return hash2.substring(0, 29);
}
function truncates(password) {
  if (typeof password !== "string")
    throw Error("Illegal arguments: " + typeof password);
  return utf8Length(password) > 72;
}
function utf8Length(string) {
  var len = 0, c = 0;
  for (var i = 0; i < string.length; ++i) {
    c = string.charCodeAt(i);
    if (c < 128) len += 1;
    else if (c < 2048) len += 2;
    else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
      ++i;
      len += 4;
    } else len += 3;
  }
  return len;
}
function utf8Array(string) {
  var offset = 0, c1, c2;
  var buffer = new Array(utf8Length(string));
  for (var i = 0, k = string.length; i < k; ++i) {
    c1 = string.charCodeAt(i);
    if (c1 < 128) {
      buffer[offset++] = c1;
    } else if (c1 < 2048) {
      buffer[offset++] = c1 >> 6 | 192;
      buffer[offset++] = c1 & 63 | 128;
    } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
      c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
      ++i;
      buffer[offset++] = c1 >> 18 | 240;
      buffer[offset++] = c1 >> 12 & 63 | 128;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    } else {
      buffer[offset++] = c1 >> 12 | 224;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    }
  }
  return buffer;
}
function base64_encode(b, len) {
  var off = 0, rs = [], c1, c2;
  if (len <= 0 || len > b.length) throw Error("Illegal len: " + len);
  while (off < len) {
    c1 = b[off++] & 255;
    rs.push(BASE64_CODE[c1 >> 2 & 63]);
    c1 = (c1 & 3) << 4;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 4 & 15;
    rs.push(BASE64_CODE[c1 & 63]);
    c1 = (c2 & 15) << 2;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 6 & 3;
    rs.push(BASE64_CODE[c1 & 63]);
    rs.push(BASE64_CODE[c2 & 63]);
  }
  return rs.join("");
}
function base64_decode(s, len) {
  var off = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
  if (len <= 0) throw Error("Illegal len: " + len);
  while (off < slen - 1 && olen < len) {
    code = s.charCodeAt(off++);
    c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    code = s.charCodeAt(off++);
    c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c1 == -1 || c2 == -1) break;
    o = c1 << 2 >>> 0;
    o |= (c2 & 48) >> 4;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c3 == -1) break;
    o = (c2 & 15) << 4 >>> 0;
    o |= (c3 & 60) >> 2;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    o = (c3 & 3) << 6 >>> 0;
    o |= c4;
    rs.push(String.fromCharCode(o));
    ++olen;
  }
  var res = [];
  for (off = 0; off < olen; off++) res.push(rs[off].charCodeAt(0));
  return res;
}
function _encipher(lr, off, P, S) {
  var n, l = lr[off], r = lr[off + 1];
  l ^= P[0];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[1];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[2];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[3];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[4];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[5];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[6];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[7];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[8];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[9];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[10];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[11];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[12];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[13];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[14];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[15];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[16];
  lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
  lr[off + 1] = l;
  return lr;
}
function _streamtoword(data, offp) {
  for (var i = 0, word = 0; i < 4; ++i)
    word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
  return { key: word, offp };
}
function _key(key, P, S) {
  var offset = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
  for (i = 0; i < plen; i += 2)
    lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
function _ekskey(data, key, P, S) {
  var offp = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
  offp = 0;
  for (i = 0; i < plen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
function _crypt(b, salt, rounds, callback, progressCallback) {
  var cdata = C_ORIG.slice(), clen = cdata.length, err;
  if (rounds < 4 || rounds > 31) {
    err = Error("Illegal number of rounds (4-31): " + rounds);
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.length !== BCRYPT_SALT_LEN) {
    err = Error(
      "Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN
    );
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  rounds = 1 << rounds >>> 0;
  var P, S, i = 0, j;
  if (typeof Int32Array === "function") {
    P = new Int32Array(P_ORIG);
    S = new Int32Array(S_ORIG);
  } else {
    P = P_ORIG.slice();
    S = S_ORIG.slice();
  }
  _ekskey(salt, b, P, S);
  function next() {
    if (progressCallback) progressCallback(i / rounds);
    if (i < rounds) {
      var start = Date.now();
      for (; i < rounds; ) {
        i = i + 1;
        _key(b, P, S);
        _key(salt, P, S);
        if (Date.now() - start > MAX_EXECUTION_TIME) break;
      }
    } else {
      for (i = 0; i < 64; i++)
        for (j = 0; j < clen >> 1; j++) _encipher(cdata, j << 1, P, S);
      var ret = [];
      for (i = 0; i < clen; i++)
        ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
      if (callback) {
        callback(null, ret);
        return;
      } else return ret;
    }
    if (callback) nextTick(next);
  }
  if (typeof callback !== "undefined") {
    next();
  } else {
    var res;
    while (true) if (typeof (res = next()) !== "undefined") return res || [];
  }
}
function _hash(password, salt, callback, progressCallback) {
  var err;
  if (typeof password !== "string" || typeof salt !== "string") {
    err = Error("Invalid string / salt: Not a string");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var minor, offset;
  if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
    err = Error("Invalid salt version: " + salt.substring(0, 2));
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.charAt(2) === "$") minor = String.fromCharCode(0), offset = 3;
  else {
    minor = salt.charAt(2);
    if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
      err = Error("Invalid salt revision: " + salt.substring(2, 4));
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else throw err;
    }
    offset = 4;
  }
  if (salt.charAt(offset + 2) > "$") {
    err = Error("Missing salt rounds");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
  password += minor >= "a" ? "\0" : "";
  var passwordb = utf8Array(password), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
  function finish(bytes) {
    var res = [];
    res.push("$2");
    if (minor >= "a") res.push(minor);
    res.push("$");
    if (rounds < 10) res.push("0");
    res.push(rounds.toString());
    res.push("$");
    res.push(base64_encode(saltb, saltb.length));
    res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
    return res.join("");
  }
  if (typeof callback == "undefined")
    return finish(_crypt(passwordb, saltb, rounds));
  else {
    _crypt(
      passwordb,
      saltb,
      rounds,
      function(err2, bytes) {
        if (err2) callback(err2, null);
        else callback(null, finish(bytes));
      },
      progressCallback
    );
  }
}
function encodeBase64(bytes, length) {
  return base64_encode(bytes, length);
}
function decodeBase64(string, length) {
  return base64_decode(string, length);
}
var randomFallback, nextTick, BASE64_CODE, BASE64_INDEX, BCRYPT_SALT_LEN, GENSALT_DEFAULT_LOG2_ROUNDS, BLOWFISH_NUM_ROUNDS, MAX_EXECUTION_TIME, P_ORIG, S_ORIG, C_ORIG, bcryptjs_default;
var init_bcryptjs = __esm({
  "node_modules/bcryptjs/index.js"() {
    randomFallback = null;
    nextTick = typeof setImmediate === "function" ? setImmediate : typeof scheduler === "object" && typeof scheduler.postTask === "function" ? scheduler.postTask.bind(scheduler) : setTimeout;
    BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
    BASE64_INDEX = [
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      0,
      1,
      54,
      55,
      56,
      57,
      58,
      59,
      60,
      61,
      62,
      63,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      -1,
      -1,
      -1,
      -1,
      -1
    ];
    BCRYPT_SALT_LEN = 16;
    GENSALT_DEFAULT_LOG2_ROUNDS = 10;
    BLOWFISH_NUM_ROUNDS = 16;
    MAX_EXECUTION_TIME = 100;
    P_ORIG = [
      608135816,
      2242054355,
      320440878,
      57701188,
      2752067618,
      698298832,
      137296536,
      3964562569,
      1160258022,
      953160567,
      3193202383,
      887688300,
      3232508343,
      3380367581,
      1065670069,
      3041331479,
      2450970073,
      2306472731
    ];
    S_ORIG = [
      3509652390,
      2564797868,
      805139163,
      3491422135,
      3101798381,
      1780907670,
      3128725573,
      4046225305,
      614570311,
      3012652279,
      134345442,
      2240740374,
      1667834072,
      1901547113,
      2757295779,
      4103290238,
      227898511,
      1921955416,
      1904987480,
      2182433518,
      2069144605,
      3260701109,
      2620446009,
      720527379,
      3318853667,
      677414384,
      3393288472,
      3101374703,
      2390351024,
      1614419982,
      1822297739,
      2954791486,
      3608508353,
      3174124327,
      2024746970,
      1432378464,
      3864339955,
      2857741204,
      1464375394,
      1676153920,
      1439316330,
      715854006,
      3033291828,
      289532110,
      2706671279,
      2087905683,
      3018724369,
      1668267050,
      732546397,
      1947742710,
      3462151702,
      2609353502,
      2950085171,
      1814351708,
      2050118529,
      680887927,
      999245976,
      1800124847,
      3300911131,
      1713906067,
      1641548236,
      4213287313,
      1216130144,
      1575780402,
      4018429277,
      3917837745,
      3693486850,
      3949271944,
      596196993,
      3549867205,
      258830323,
      2213823033,
      772490370,
      2760122372,
      1774776394,
      2652871518,
      566650946,
      4142492826,
      1728879713,
      2882767088,
      1783734482,
      3629395816,
      2517608232,
      2874225571,
      1861159788,
      326777828,
      3124490320,
      2130389656,
      2716951837,
      967770486,
      1724537150,
      2185432712,
      2364442137,
      1164943284,
      2105845187,
      998989502,
      3765401048,
      2244026483,
      1075463327,
      1455516326,
      1322494562,
      910128902,
      469688178,
      1117454909,
      936433444,
      3490320968,
      3675253459,
      1240580251,
      122909385,
      2157517691,
      634681816,
      4142456567,
      3825094682,
      3061402683,
      2540495037,
      79693498,
      3249098678,
      1084186820,
      1583128258,
      426386531,
      1761308591,
      1047286709,
      322548459,
      995290223,
      1845252383,
      2603652396,
      3431023940,
      2942221577,
      3202600964,
      3727903485,
      1712269319,
      422464435,
      3234572375,
      1170764815,
      3523960633,
      3117677531,
      1434042557,
      442511882,
      3600875718,
      1076654713,
      1738483198,
      4213154764,
      2393238008,
      3677496056,
      1014306527,
      4251020053,
      793779912,
      2902807211,
      842905082,
      4246964064,
      1395751752,
      1040244610,
      2656851899,
      3396308128,
      445077038,
      3742853595,
      3577915638,
      679411651,
      2892444358,
      2354009459,
      1767581616,
      3150600392,
      3791627101,
      3102740896,
      284835224,
      4246832056,
      1258075500,
      768725851,
      2589189241,
      3069724005,
      3532540348,
      1274779536,
      3789419226,
      2764799539,
      1660621633,
      3471099624,
      4011903706,
      913787905,
      3497959166,
      737222580,
      2514213453,
      2928710040,
      3937242737,
      1804850592,
      3499020752,
      2949064160,
      2386320175,
      2390070455,
      2415321851,
      4061277028,
      2290661394,
      2416832540,
      1336762016,
      1754252060,
      3520065937,
      3014181293,
      791618072,
      3188594551,
      3933548030,
      2332172193,
      3852520463,
      3043980520,
      413987798,
      3465142937,
      3030929376,
      4245938359,
      2093235073,
      3534596313,
      375366246,
      2157278981,
      2479649556,
      555357303,
      3870105701,
      2008414854,
      3344188149,
      4221384143,
      3956125452,
      2067696032,
      3594591187,
      2921233993,
      2428461,
      544322398,
      577241275,
      1471733935,
      610547355,
      4027169054,
      1432588573,
      1507829418,
      2025931657,
      3646575487,
      545086370,
      48609733,
      2200306550,
      1653985193,
      298326376,
      1316178497,
      3007786442,
      2064951626,
      458293330,
      2589141269,
      3591329599,
      3164325604,
      727753846,
      2179363840,
      146436021,
      1461446943,
      4069977195,
      705550613,
      3059967265,
      3887724982,
      4281599278,
      3313849956,
      1404054877,
      2845806497,
      146425753,
      1854211946,
      1266315497,
      3048417604,
      3681880366,
      3289982499,
      290971e4,
      1235738493,
      2632868024,
      2414719590,
      3970600049,
      1771706367,
      1449415276,
      3266420449,
      422970021,
      1963543593,
      2690192192,
      3826793022,
      1062508698,
      1531092325,
      1804592342,
      2583117782,
      2714934279,
      4024971509,
      1294809318,
      4028980673,
      1289560198,
      2221992742,
      1669523910,
      35572830,
      157838143,
      1052438473,
      1016535060,
      1802137761,
      1753167236,
      1386275462,
      3080475397,
      2857371447,
      1040679964,
      2145300060,
      2390574316,
      1461121720,
      2956646967,
      4031777805,
      4028374788,
      33600511,
      2920084762,
      1018524850,
      629373528,
      3691585981,
      3515945977,
      2091462646,
      2486323059,
      586499841,
      988145025,
      935516892,
      3367335476,
      2599673255,
      2839830854,
      265290510,
      3972581182,
      2759138881,
      3795373465,
      1005194799,
      847297441,
      406762289,
      1314163512,
      1332590856,
      1866599683,
      4127851711,
      750260880,
      613907577,
      1450815602,
      3165620655,
      3734664991,
      3650291728,
      3012275730,
      3704569646,
      1427272223,
      778793252,
      1343938022,
      2676280711,
      2052605720,
      1946737175,
      3164576444,
      3914038668,
      3967478842,
      3682934266,
      1661551462,
      3294938066,
      4011595847,
      840292616,
      3712170807,
      616741398,
      312560963,
      711312465,
      1351876610,
      322626781,
      1910503582,
      271666773,
      2175563734,
      1594956187,
      70604529,
      3617834859,
      1007753275,
      1495573769,
      4069517037,
      2549218298,
      2663038764,
      504708206,
      2263041392,
      3941167025,
      2249088522,
      1514023603,
      1998579484,
      1312622330,
      694541497,
      2582060303,
      2151582166,
      1382467621,
      776784248,
      2618340202,
      3323268794,
      2497899128,
      2784771155,
      503983604,
      4076293799,
      907881277,
      423175695,
      432175456,
      1378068232,
      4145222326,
      3954048622,
      3938656102,
      3820766613,
      2793130115,
      2977904593,
      26017576,
      3274890735,
      3194772133,
      1700274565,
      1756076034,
      4006520079,
      3677328699,
      720338349,
      1533947780,
      354530856,
      688349552,
      3973924725,
      1637815568,
      332179504,
      3949051286,
      53804574,
      2852348879,
      3044236432,
      1282449977,
      3583942155,
      3416972820,
      4006381244,
      1617046695,
      2628476075,
      3002303598,
      1686838959,
      431878346,
      2686675385,
      1700445008,
      1080580658,
      1009431731,
      832498133,
      3223435511,
      2605976345,
      2271191193,
      2516031870,
      1648197032,
      4164389018,
      2548247927,
      300782431,
      375919233,
      238389289,
      3353747414,
      2531188641,
      2019080857,
      1475708069,
      455242339,
      2609103871,
      448939670,
      3451063019,
      1395535956,
      2413381860,
      1841049896,
      1491858159,
      885456874,
      4264095073,
      4001119347,
      1565136089,
      3898914787,
      1108368660,
      540939232,
      1173283510,
      2745871338,
      3681308437,
      4207628240,
      3343053890,
      4016749493,
      1699691293,
      1103962373,
      3625875870,
      2256883143,
      3830138730,
      1031889488,
      3479347698,
      1535977030,
      4236805024,
      3251091107,
      2132092099,
      1774941330,
      1199868427,
      1452454533,
      157007616,
      2904115357,
      342012276,
      595725824,
      1480756522,
      206960106,
      497939518,
      591360097,
      863170706,
      2375253569,
      3596610801,
      1814182875,
      2094937945,
      3421402208,
      1082520231,
      3463918190,
      2785509508,
      435703966,
      3908032597,
      1641649973,
      2842273706,
      3305899714,
      1510255612,
      2148256476,
      2655287854,
      3276092548,
      4258621189,
      236887753,
      3681803219,
      274041037,
      1734335097,
      3815195456,
      3317970021,
      1899903192,
      1026095262,
      4050517792,
      356393447,
      2410691914,
      3873677099,
      3682840055,
      3913112168,
      2491498743,
      4132185628,
      2489919796,
      1091903735,
      1979897079,
      3170134830,
      3567386728,
      3557303409,
      857797738,
      1136121015,
      1342202287,
      507115054,
      2535736646,
      337727348,
      3213592640,
      1301675037,
      2528481711,
      1895095763,
      1721773893,
      3216771564,
      62756741,
      2142006736,
      835421444,
      2531993523,
      1442658625,
      3659876326,
      2882144922,
      676362277,
      1392781812,
      170690266,
      3921047035,
      1759253602,
      3611846912,
      1745797284,
      664899054,
      1329594018,
      3901205900,
      3045908486,
      2062866102,
      2865634940,
      3543621612,
      3464012697,
      1080764994,
      553557557,
      3656615353,
      3996768171,
      991055499,
      499776247,
      1265440854,
      648242737,
      3940784050,
      980351604,
      3713745714,
      1749149687,
      3396870395,
      4211799374,
      3640570775,
      1161844396,
      3125318951,
      1431517754,
      545492359,
      4268468663,
      3499529547,
      1437099964,
      2702547544,
      3433638243,
      2581715763,
      2787789398,
      1060185593,
      1593081372,
      2418618748,
      4260947970,
      69676912,
      2159744348,
      86519011,
      2512459080,
      3838209314,
      1220612927,
      3339683548,
      133810670,
      1090789135,
      1078426020,
      1569222167,
      845107691,
      3583754449,
      4072456591,
      1091646820,
      628848692,
      1613405280,
      3757631651,
      526609435,
      236106946,
      48312990,
      2942717905,
      3402727701,
      1797494240,
      859738849,
      992217954,
      4005476642,
      2243076622,
      3870952857,
      3732016268,
      765654824,
      3490871365,
      2511836413,
      1685915746,
      3888969200,
      1414112111,
      2273134842,
      3281911079,
      4080962846,
      172450625,
      2569994100,
      980381355,
      4109958455,
      2819808352,
      2716589560,
      2568741196,
      3681446669,
      3329971472,
      1835478071,
      660984891,
      3704678404,
      4045999559,
      3422617507,
      3040415634,
      1762651403,
      1719377915,
      3470491036,
      2693910283,
      3642056355,
      3138596744,
      1364962596,
      2073328063,
      1983633131,
      926494387,
      3423689081,
      2150032023,
      4096667949,
      1749200295,
      3328846651,
      309677260,
      2016342300,
      1779581495,
      3079819751,
      111262694,
      1274766160,
      443224088,
      298511866,
      1025883608,
      3806446537,
      1145181785,
      168956806,
      3641502830,
      3584813610,
      1689216846,
      3666258015,
      3200248200,
      1692713982,
      2646376535,
      4042768518,
      1618508792,
      1610833997,
      3523052358,
      4130873264,
      2001055236,
      3610705100,
      2202168115,
      4028541809,
      2961195399,
      1006657119,
      2006996926,
      3186142756,
      1430667929,
      3210227297,
      1314452623,
      4074634658,
      4101304120,
      2273951170,
      1399257539,
      3367210612,
      3027628629,
      1190975929,
      2062231137,
      2333990788,
      2221543033,
      2438960610,
      1181637006,
      548689776,
      2362791313,
      3372408396,
      3104550113,
      3145860560,
      296247880,
      1970579870,
      3078560182,
      3769228297,
      1714227617,
      3291629107,
      3898220290,
      166772364,
      1251581989,
      493813264,
      448347421,
      195405023,
      2709975567,
      677966185,
      3703036547,
      1463355134,
      2715995803,
      1338867538,
      1343315457,
      2802222074,
      2684532164,
      233230375,
      2599980071,
      2000651841,
      3277868038,
      1638401717,
      4028070440,
      3237316320,
      6314154,
      819756386,
      300326615,
      590932579,
      1405279636,
      3267499572,
      3150704214,
      2428286686,
      3959192993,
      3461946742,
      1862657033,
      1266418056,
      963775037,
      2089974820,
      2263052895,
      1917689273,
      448879540,
      3550394620,
      3981727096,
      150775221,
      3627908307,
      1303187396,
      508620638,
      2975983352,
      2726630617,
      1817252668,
      1876281319,
      1457606340,
      908771278,
      3720792119,
      3617206836,
      2455994898,
      1729034894,
      1080033504,
      976866871,
      3556439503,
      2881648439,
      1522871579,
      1555064734,
      1336096578,
      3548522304,
      2579274686,
      3574697629,
      3205460757,
      3593280638,
      3338716283,
      3079412587,
      564236357,
      2993598910,
      1781952180,
      1464380207,
      3163844217,
      3332601554,
      1699332808,
      1393555694,
      1183702653,
      3581086237,
      1288719814,
      691649499,
      2847557200,
      2895455976,
      3193889540,
      2717570544,
      1781354906,
      1676643554,
      2592534050,
      3230253752,
      1126444790,
      2770207658,
      2633158820,
      2210423226,
      2615765581,
      2414155088,
      3127139286,
      673620729,
      2805611233,
      1269405062,
      4015350505,
      3341807571,
      4149409754,
      1057255273,
      2012875353,
      2162469141,
      2276492801,
      2601117357,
      993977747,
      3918593370,
      2654263191,
      753973209,
      36408145,
      2530585658,
      25011837,
      3520020182,
      2088578344,
      530523599,
      2918365339,
      1524020338,
      1518925132,
      3760827505,
      3759777254,
      1202760957,
      3985898139,
      3906192525,
      674977740,
      4174734889,
      2031300136,
      2019492241,
      3983892565,
      4153806404,
      3822280332,
      352677332,
      2297720250,
      60907813,
      90501309,
      3286998549,
      1016092578,
      2535922412,
      2839152426,
      457141659,
      509813237,
      4120667899,
      652014361,
      1966332200,
      2975202805,
      55981186,
      2327461051,
      676427537,
      3255491064,
      2882294119,
      3433927263,
      1307055953,
      942726286,
      933058658,
      2468411793,
      3933900994,
      4215176142,
      1361170020,
      2001714738,
      2830558078,
      3274259782,
      1222529897,
      1679025792,
      2729314320,
      3714953764,
      1770335741,
      151462246,
      3013232138,
      1682292957,
      1483529935,
      471910574,
      1539241949,
      458788160,
      3436315007,
      1807016891,
      3718408830,
      978976581,
      1043663428,
      3165965781,
      1927990952,
      4200891579,
      2372276910,
      3208408903,
      3533431907,
      1412390302,
      2931980059,
      4132332400,
      1947078029,
      3881505623,
      4168226417,
      2941484381,
      1077988104,
      1320477388,
      886195818,
      18198404,
      3786409e3,
      2509781533,
      112762804,
      3463356488,
      1866414978,
      891333506,
      18488651,
      661792760,
      1628790961,
      3885187036,
      3141171499,
      876946877,
      2693282273,
      1372485963,
      791857591,
      2686433993,
      3759982718,
      3167212022,
      3472953795,
      2716379847,
      445679433,
      3561995674,
      3504004811,
      3574258232,
      54117162,
      3331405415,
      2381918588,
      3769707343,
      4154350007,
      1140177722,
      4074052095,
      668550556,
      3214352940,
      367459370,
      261225585,
      2610173221,
      4209349473,
      3468074219,
      3265815641,
      314222801,
      3066103646,
      3808782860,
      282218597,
      3406013506,
      3773591054,
      379116347,
      1285071038,
      846784868,
      2669647154,
      3771962079,
      3550491691,
      2305946142,
      453669953,
      1268987020,
      3317592352,
      3279303384,
      3744833421,
      2610507566,
      3859509063,
      266596637,
      3847019092,
      517658769,
      3462560207,
      3443424879,
      370717030,
      4247526661,
      2224018117,
      4143653529,
      4112773975,
      2788324899,
      2477274417,
      1456262402,
      2901442914,
      1517677493,
      1846949527,
      2295493580,
      3734397586,
      2176403920,
      1280348187,
      1908823572,
      3871786941,
      846861322,
      1172426758,
      3287448474,
      3383383037,
      1655181056,
      3139813346,
      901632758,
      1897031941,
      2986607138,
      3066810236,
      3447102507,
      1393639104,
      373351379,
      950779232,
      625454576,
      3124240540,
      4148612726,
      2007998917,
      544563296,
      2244738638,
      2330496472,
      2058025392,
      1291430526,
      424198748,
      50039436,
      29584100,
      3605783033,
      2429876329,
      2791104160,
      1057563949,
      3255363231,
      3075367218,
      3463963227,
      1469046755,
      985887462
    ];
    C_ORIG = [
      1332899944,
      1700884034,
      1701343084,
      1684370003,
      1668446532,
      1869963892
    ];
    bcryptjs_default = {
      setRandomFallback,
      genSaltSync,
      genSalt,
      hashSync,
      hash,
      compareSync,
      compare,
      getRounds,
      getSalt,
      truncates,
      encodeBase64,
      decodeBase64
    };
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
import { eq as eq2 } from "drizzle-orm";
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
    const [salon] = await db.select().from(salons2).where(eq2(salons2.id, salonId));
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
var settingsCache, lastCacheFetch;
var init_whatsappService = __esm({
  "server/whatsappService.ts"() {
    "use strict";
    init_db();
    init_schema();
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
    const nodemailer = __require("nodemailer");
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

// node_modules/@anthropic-ai/sdk/internal/tslib.mjs
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m")
    throw new TypeError("Private method is not writable");
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
var init_tslib = __esm({
  "node_modules/@anthropic-ai/sdk/internal/tslib.mjs"() {
  }
});

// node_modules/@anthropic-ai/sdk/internal/utils/uuid.mjs
var uuid4;
var init_uuid = __esm({
  "node_modules/@anthropic-ai/sdk/internal/utils/uuid.mjs"() {
    uuid4 = function() {
      const { crypto: crypto6 } = globalThis;
      if (crypto6?.randomUUID) {
        uuid4 = crypto6.randomUUID.bind(crypto6);
        return crypto6.randomUUID();
      }
      const u8 = new Uint8Array(1);
      const randomByte = crypto6 ? () => crypto6.getRandomValues(u8)[0] : () => Math.random() * 255 & 255;
      return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (+c ^ randomByte() & 15 >> +c / 4).toString(16));
    };
  }
});

// node_modules/@anthropic-ai/sdk/internal/errors.mjs
function isAbortError(err) {
  return typeof err === "object" && err !== null && // Spec-compliant fetch implementations
  ("name" in err && err.name === "AbortError" || // Expo fetch
  "message" in err && String(err.message).includes("FetchRequestCanceledException"));
}
var castToError;
var init_errors = __esm({
  "node_modules/@anthropic-ai/sdk/internal/errors.mjs"() {
    castToError = (err) => {
      if (err instanceof Error)
        return err;
      if (typeof err === "object" && err !== null) {
        try {
          if (Object.prototype.toString.call(err) === "[object Error]") {
            const error = new Error(err.message, err.cause ? { cause: err.cause } : {});
            if (err.stack)
              error.stack = err.stack;
            if (err.cause && !error.cause)
              error.cause = err.cause;
            if (err.name)
              error.name = err.name;
            return error;
          }
        } catch {
        }
        try {
          return new Error(JSON.stringify(err));
        } catch {
        }
      }
      return new Error(err);
    };
  }
});

// node_modules/@anthropic-ai/sdk/core/error.mjs
var AnthropicError, APIError, APIUserAbortError, APIConnectionError, APIConnectionTimeoutError, BadRequestError, AuthenticationError, PermissionDeniedError, NotFoundError, ConflictError, UnprocessableEntityError, RateLimitError, InternalServerError;
var init_error = __esm({
  "node_modules/@anthropic-ai/sdk/core/error.mjs"() {
    init_errors();
    AnthropicError = class extends Error {
    };
    APIError = class _APIError extends AnthropicError {
      constructor(status, error, message, headers, type) {
        super(`${_APIError.makeMessage(status, error, message)}`);
        this.status = status;
        this.headers = headers;
        this.requestID = headers?.get("request-id");
        this.error = error;
        this.type = type ?? null;
      }
      static makeMessage(status, error, message) {
        const msg = error?.message ? typeof error.message === "string" ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message;
        if (status && msg) {
          return `${status} ${msg}`;
        }
        if (status) {
          return `${status} status code (no body)`;
        }
        if (msg) {
          return msg;
        }
        return "(no status code or body)";
      }
      static generate(status, errorResponse, message, headers) {
        if (!status || !headers) {
          return new APIConnectionError({ message, cause: castToError(errorResponse) });
        }
        const error = errorResponse;
        const type = error?.["error"]?.["type"];
        if (status === 400) {
          return new BadRequestError(status, error, message, headers, type);
        }
        if (status === 401) {
          return new AuthenticationError(status, error, message, headers, type);
        }
        if (status === 403) {
          return new PermissionDeniedError(status, error, message, headers, type);
        }
        if (status === 404) {
          return new NotFoundError(status, error, message, headers, type);
        }
        if (status === 409) {
          return new ConflictError(status, error, message, headers, type);
        }
        if (status === 422) {
          return new UnprocessableEntityError(status, error, message, headers, type);
        }
        if (status === 429) {
          return new RateLimitError(status, error, message, headers, type);
        }
        if (status >= 500) {
          return new InternalServerError(status, error, message, headers, type);
        }
        return new _APIError(status, error, message, headers, type);
      }
    };
    APIUserAbortError = class extends APIError {
      constructor({ message } = {}) {
        super(void 0, void 0, message || "Request was aborted.", void 0);
      }
    };
    APIConnectionError = class extends APIError {
      constructor({ message, cause }) {
        super(void 0, void 0, message || "Connection error.", void 0);
        if (cause)
          this.cause = cause;
      }
    };
    APIConnectionTimeoutError = class extends APIConnectionError {
      constructor({ message } = {}) {
        super({ message: message ?? "Request timed out." });
      }
    };
    BadRequestError = class extends APIError {
    };
    AuthenticationError = class extends APIError {
    };
    PermissionDeniedError = class extends APIError {
    };
    NotFoundError = class extends APIError {
    };
    ConflictError = class extends APIError {
    };
    UnprocessableEntityError = class extends APIError {
    };
    RateLimitError = class extends APIError {
    };
    InternalServerError = class extends APIError {
    };
  }
});

// node_modules/@anthropic-ai/sdk/internal/utils/values.mjs
function maybeObj(x) {
  if (typeof x !== "object") {
    return {};
  }
  return x ?? {};
}
function isEmptyObj(obj) {
  if (!obj)
    return true;
  for (const _k in obj)
    return false;
  return true;
}
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
var startsWithSchemeRegexp, isAbsoluteURL, isArray, isReadonlyArray, validatePositiveInteger, safeJSON;
var init_values = __esm({
  "node_modules/@anthropic-ai/sdk/internal/utils/values.mjs"() {
    init_error();
    startsWithSchemeRegexp = /^[a-z][a-z0-9+.-]*:/i;
    isAbsoluteURL = (url) => {
      return startsWithSchemeRegexp.test(url);
    };
    isArray = (val) => (isArray = Array.isArray, isArray(val));
    isReadonlyArray = isArray;
    validatePositiveInteger = (name, n) => {
      if (typeof n !== "number" || !Number.isInteger(n)) {
        throw new AnthropicError(`${name} must be an integer`);
      }
      if (n < 0) {
        throw new AnthropicError(`${name} must be a positive integer`);
      }
      return n;
    };
    safeJSON = (text2) => {
      try {
        return JSON.parse(text2);
      } catch (err) {
        return void 0;
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/internal/utils/sleep.mjs
var sleep;
var init_sleep = __esm({
  "node_modules/@anthropic-ai/sdk/internal/utils/sleep.mjs"() {
    sleep = (ms) => new Promise((resolve2) => setTimeout(resolve2, ms));
  }
});

// node_modules/@anthropic-ai/sdk/version.mjs
var VERSION;
var init_version = __esm({
  "node_modules/@anthropic-ai/sdk/version.mjs"() {
    VERSION = "0.88.0";
  }
});

// node_modules/@anthropic-ai/sdk/internal/detect-platform.mjs
function getDetectedPlatform() {
  if (typeof Deno !== "undefined" && Deno.build != null) {
    return "deno";
  }
  if (typeof EdgeRuntime !== "undefined") {
    return "edge";
  }
  if (Object.prototype.toString.call(typeof globalThis.process !== "undefined" ? globalThis.process : 0) === "[object process]") {
    return "node";
  }
  return "unknown";
}
function getBrowserInfo() {
  if (typeof navigator === "undefined" || !navigator) {
    return null;
  }
  const browserPatterns = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key, pattern } of browserPatterns) {
    const match = pattern.exec(navigator.userAgent);
    if (match) {
      const major = match[1] || 0;
      const minor = match[2] || 0;
      const patch = match[3] || 0;
      return { browser: key, version: `${major}.${minor}.${patch}` };
    }
  }
  return null;
}
var isRunningInBrowser, getPlatformProperties, normalizeArch, normalizePlatform, _platformHeaders, getPlatformHeaders;
var init_detect_platform = __esm({
  "node_modules/@anthropic-ai/sdk/internal/detect-platform.mjs"() {
    init_version();
    isRunningInBrowser = () => {
      return (
        // @ts-ignore
        typeof window !== "undefined" && // @ts-ignore
        typeof window.document !== "undefined" && // @ts-ignore
        typeof navigator !== "undefined"
      );
    };
    getPlatformProperties = () => {
      const detectedPlatform = getDetectedPlatform();
      if (detectedPlatform === "deno") {
        return {
          "X-Stainless-Lang": "js",
          "X-Stainless-Package-Version": VERSION,
          "X-Stainless-OS": normalizePlatform(Deno.build.os),
          "X-Stainless-Arch": normalizeArch(Deno.build.arch),
          "X-Stainless-Runtime": "deno",
          "X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : Deno.version?.deno ?? "unknown"
        };
      }
      if (typeof EdgeRuntime !== "undefined") {
        return {
          "X-Stainless-Lang": "js",
          "X-Stainless-Package-Version": VERSION,
          "X-Stainless-OS": "Unknown",
          "X-Stainless-Arch": `other:${EdgeRuntime}`,
          "X-Stainless-Runtime": "edge",
          "X-Stainless-Runtime-Version": globalThis.process.version
        };
      }
      if (detectedPlatform === "node") {
        return {
          "X-Stainless-Lang": "js",
          "X-Stainless-Package-Version": VERSION,
          "X-Stainless-OS": normalizePlatform(globalThis.process.platform ?? "unknown"),
          "X-Stainless-Arch": normalizeArch(globalThis.process.arch ?? "unknown"),
          "X-Stainless-Runtime": "node",
          "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
        };
      }
      const browserInfo = getBrowserInfo();
      if (browserInfo) {
        return {
          "X-Stainless-Lang": "js",
          "X-Stainless-Package-Version": VERSION,
          "X-Stainless-OS": "Unknown",
          "X-Stainless-Arch": "unknown",
          "X-Stainless-Runtime": `browser:${browserInfo.browser}`,
          "X-Stainless-Runtime-Version": browserInfo.version
        };
      }
      return {
        "X-Stainless-Lang": "js",
        "X-Stainless-Package-Version": VERSION,
        "X-Stainless-OS": "Unknown",
        "X-Stainless-Arch": "unknown",
        "X-Stainless-Runtime": "unknown",
        "X-Stainless-Runtime-Version": "unknown"
      };
    };
    normalizeArch = (arch) => {
      if (arch === "x32")
        return "x32";
      if (arch === "x86_64" || arch === "x64")
        return "x64";
      if (arch === "arm")
        return "arm";
      if (arch === "aarch64" || arch === "arm64")
        return "arm64";
      if (arch)
        return `other:${arch}`;
      return "unknown";
    };
    normalizePlatform = (platform) => {
      platform = platform.toLowerCase();
      if (platform.includes("ios"))
        return "iOS";
      if (platform === "android")
        return "Android";
      if (platform === "darwin")
        return "MacOS";
      if (platform === "win32")
        return "Windows";
      if (platform === "freebsd")
        return "FreeBSD";
      if (platform === "openbsd")
        return "OpenBSD";
      if (platform === "linux")
        return "Linux";
      if (platform)
        return `Other:${platform}`;
      return "Unknown";
    };
    getPlatformHeaders = () => {
      return _platformHeaders ?? (_platformHeaders = getPlatformProperties());
    };
  }
});

// node_modules/@anthropic-ai/sdk/internal/shims.mjs
function getDefaultFetch() {
  if (typeof fetch !== "undefined") {
    return fetch;
  }
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function makeReadableStream(...args) {
  const ReadableStream = globalThis.ReadableStream;
  if (typeof ReadableStream === "undefined") {
    throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  }
  return new ReadableStream(...args);
}
function ReadableStreamFrom(iterable) {
  let iter = Symbol.asyncIterator in iterable ? iterable[Symbol.asyncIterator]() : iterable[Symbol.iterator]();
  return makeReadableStream({
    start() {
    },
    async pull(controller) {
      const { done, value } = await iter.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
    async cancel() {
      await iter.return?.();
    }
  });
}
function ReadableStreamToAsyncIterable(stream) {
  if (stream[Symbol.asyncIterator])
    return stream;
  const reader = stream.getReader();
  return {
    async next() {
      try {
        const result = await reader.read();
        if (result?.done)
          reader.releaseLock();
        return result;
      } catch (e) {
        reader.releaseLock();
        throw e;
      }
    },
    async return() {
      const cancelPromise = reader.cancel();
      reader.releaseLock();
      await cancelPromise;
      return { done: true, value: void 0 };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
async function CancelReadableStream(stream) {
  if (stream === null || typeof stream !== "object")
    return;
  if (stream[Symbol.asyncIterator]) {
    await stream[Symbol.asyncIterator]().return?.();
    return;
  }
  const reader = stream.getReader();
  const cancelPromise = reader.cancel();
  reader.releaseLock();
  await cancelPromise;
}
var init_shims = __esm({
  "node_modules/@anthropic-ai/sdk/internal/shims.mjs"() {
  }
});

// node_modules/@anthropic-ai/sdk/internal/request-options.mjs
var FallbackEncoder;
var init_request_options = __esm({
  "node_modules/@anthropic-ai/sdk/internal/request-options.mjs"() {
    FallbackEncoder = ({ headers, body }) => {
      return {
        bodyHeaders: {
          "content-type": "application/json"
        },
        body: JSON.stringify(body)
      };
    };
  }
});

// node_modules/@anthropic-ai/sdk/internal/utils/query.mjs
function stringifyQuery(query) {
  return Object.entries(query).filter(([_, value]) => typeof value !== "undefined").map(([key, value]) => {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
    if (value === null) {
      return `${encodeURIComponent(key)}=`;
    }
    throw new AnthropicError(`Cannot stringify type ${typeof value}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var init_query = __esm({
  "node_modules/@anthropic-ai/sdk/internal/utils/query.mjs"() {
    init_error();
  }
});

// node_modules/@anthropic-ai/sdk/internal/utils/bytes.mjs
function concatBytes(buffers) {
  let length = 0;
  for (const buffer of buffers) {
    length += buffer.length;
  }
  const output = new Uint8Array(length);
  let index = 0;
  for (const buffer of buffers) {
    output.set(buffer, index);
    index += buffer.length;
  }
  return output;
}
function encodeUTF8(str) {
  let encoder;
  return (encodeUTF8_ ?? (encoder = new globalThis.TextEncoder(), encodeUTF8_ = encoder.encode.bind(encoder)))(str);
}
function decodeUTF8(bytes) {
  let decoder;
  return (decodeUTF8_ ?? (decoder = new globalThis.TextDecoder(), decodeUTF8_ = decoder.decode.bind(decoder)))(bytes);
}
var encodeUTF8_, decodeUTF8_;
var init_bytes = __esm({
  "node_modules/@anthropic-ai/sdk/internal/utils/bytes.mjs"() {
  }
});

// node_modules/@anthropic-ai/sdk/internal/decoders/line.mjs
function findNewlineIndex(buffer, startIndex) {
  const newline = 10;
  const carriage = 13;
  for (let i = startIndex ?? 0; i < buffer.length; i++) {
    if (buffer[i] === newline) {
      return { preceding: i, index: i + 1, carriage: false };
    }
    if (buffer[i] === carriage) {
      return { preceding: i, index: i + 1, carriage: true };
    }
  }
  return null;
}
function findDoubleNewlineIndex(buffer) {
  const newline = 10;
  const carriage = 13;
  for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i] === newline && buffer[i + 1] === newline) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === carriage) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === newline && i + 3 < buffer.length && buffer[i + 2] === carriage && buffer[i + 3] === newline) {
      return i + 4;
    }
  }
  return -1;
}
var _LineDecoder_buffer, _LineDecoder_carriageReturnIndex, LineDecoder;
var init_line = __esm({
  "node_modules/@anthropic-ai/sdk/internal/decoders/line.mjs"() {
    init_tslib();
    init_bytes();
    LineDecoder = class {
      constructor() {
        _LineDecoder_buffer.set(this, void 0);
        _LineDecoder_carriageReturnIndex.set(this, void 0);
        __classPrivateFieldSet(this, _LineDecoder_buffer, new Uint8Array(), "f");
        __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
      }
      decode(chunk) {
        if (chunk == null) {
          return [];
        }
        const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? encodeUTF8(chunk) : chunk;
        __classPrivateFieldSet(this, _LineDecoder_buffer, concatBytes([__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), binaryChunk]), "f");
        const lines = [];
        let patternIndex;
        while ((patternIndex = findNewlineIndex(__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f"))) != null) {
          if (patternIndex.carriage && __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") == null) {
            __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, patternIndex.index, "f");
            continue;
          }
          if (__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") != null && (patternIndex.index !== __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") + 1 || patternIndex.carriage)) {
            lines.push(decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(0, __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") - 1)));
            __classPrivateFieldSet(this, _LineDecoder_buffer, __classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f")), "f");
            __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
            continue;
          }
          const endIndex = __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") !== null ? patternIndex.preceding - 1 : patternIndex.preceding;
          const line = decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(0, endIndex));
          lines.push(line);
          __classPrivateFieldSet(this, _LineDecoder_buffer, __classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(patternIndex.index), "f");
          __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
        }
        return lines;
      }
      flush() {
        if (!__classPrivateFieldGet(this, _LineDecoder_buffer, "f").length) {
          return [];
        }
        return this.decode("\n");
      }
    };
    _LineDecoder_buffer = /* @__PURE__ */ new WeakMap(), _LineDecoder_carriageReturnIndex = /* @__PURE__ */ new WeakMap();
    LineDecoder.NEWLINE_CHARS = /* @__PURE__ */ new Set(["\n", "\r"]);
    LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
  }
});

// node_modules/@anthropic-ai/sdk/internal/utils/log.mjs
function noop() {
}
function makeLogFn(fnLevel, logger, logLevel) {
  if (!logger || levelNumbers[fnLevel] > levelNumbers[logLevel]) {
    return noop;
  } else {
    return logger[fnLevel].bind(logger);
  }
}
function loggerFor(client) {
  const logger = client.logger;
  const logLevel = client.logLevel ?? "off";
  if (!logger) {
    return noopLogger;
  }
  const cachedLogger = cachedLoggers.get(logger);
  if (cachedLogger && cachedLogger[0] === logLevel) {
    return cachedLogger[1];
  }
  const levelLogger = {
    error: makeLogFn("error", logger, logLevel),
    warn: makeLogFn("warn", logger, logLevel),
    info: makeLogFn("info", logger, logLevel),
    debug: makeLogFn("debug", logger, logLevel)
  };
  cachedLoggers.set(logger, [logLevel, levelLogger]);
  return levelLogger;
}
var levelNumbers, parseLogLevel, noopLogger, cachedLoggers, formatRequestDetails;
var init_log = __esm({
  "node_modules/@anthropic-ai/sdk/internal/utils/log.mjs"() {
    init_values();
    levelNumbers = {
      off: 0,
      error: 200,
      warn: 300,
      info: 400,
      debug: 500
    };
    parseLogLevel = (maybeLevel, sourceName, client) => {
      if (!maybeLevel) {
        return void 0;
      }
      if (hasOwn(levelNumbers, maybeLevel)) {
        return maybeLevel;
      }
      loggerFor(client).warn(`${sourceName} was set to ${JSON.stringify(maybeLevel)}, expected one of ${JSON.stringify(Object.keys(levelNumbers))}`);
      return void 0;
    };
    noopLogger = {
      error: noop,
      warn: noop,
      info: noop,
      debug: noop
    };
    cachedLoggers = /* @__PURE__ */ new WeakMap();
    formatRequestDetails = (details) => {
      if (details.options) {
        details.options = { ...details.options };
        delete details.options["headers"];
      }
      if (details.headers) {
        details.headers = Object.fromEntries((details.headers instanceof Headers ? [...details.headers] : Object.entries(details.headers)).map(([name, value]) => [
          name,
          name.toLowerCase() === "x-api-key" || name.toLowerCase() === "authorization" || name.toLowerCase() === "cookie" || name.toLowerCase() === "set-cookie" ? "***" : value
        ]));
      }
      if ("retryOfRequestLogID" in details) {
        if (details.retryOfRequestLogID) {
          details.retryOf = details.retryOfRequestLogID;
        }
        delete details.retryOfRequestLogID;
      }
      return details;
    };
  }
});

// node_modules/@anthropic-ai/sdk/core/streaming.mjs
async function* _iterSSEMessages(response, controller) {
  if (!response.body) {
    controller.abort();
    if (typeof globalThis.navigator !== "undefined" && globalThis.navigator.product === "ReactNative") {
      throw new AnthropicError(`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
    }
    throw new AnthropicError(`Attempted to iterate over a response with no body`);
  }
  const sseDecoder = new SSEDecoder();
  const lineDecoder = new LineDecoder();
  const iter = ReadableStreamToAsyncIterable(response.body);
  for await (const sseChunk of iterSSEChunks(iter)) {
    for (const line of lineDecoder.decode(sseChunk)) {
      const sse = sseDecoder.decode(line);
      if (sse)
        yield sse;
    }
  }
  for (const line of lineDecoder.flush()) {
    const sse = sseDecoder.decode(line);
    if (sse)
      yield sse;
  }
}
async function* iterSSEChunks(iterator) {
  let data = new Uint8Array();
  for await (const chunk of iterator) {
    if (chunk == null) {
      continue;
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? encodeUTF8(chunk) : chunk;
    let newData = new Uint8Array(data.length + binaryChunk.length);
    newData.set(data);
    newData.set(binaryChunk, data.length);
    data = newData;
    let patternIndex;
    while ((patternIndex = findDoubleNewlineIndex(data)) !== -1) {
      yield data.slice(0, patternIndex);
      data = data.slice(patternIndex);
    }
  }
  if (data.length > 0) {
    yield data;
  }
}
function partition(str, delimiter) {
  const index = str.indexOf(delimiter);
  if (index !== -1) {
    return [str.substring(0, index), delimiter, str.substring(index + delimiter.length)];
  }
  return [str, "", ""];
}
var _Stream_client, Stream, SSEDecoder;
var init_streaming = __esm({
  "node_modules/@anthropic-ai/sdk/core/streaming.mjs"() {
    init_tslib();
    init_error();
    init_shims();
    init_line();
    init_shims();
    init_errors();
    init_values();
    init_bytes();
    init_log();
    init_error();
    Stream = class _Stream {
      constructor(iterator, controller, client) {
        this.iterator = iterator;
        _Stream_client.set(this, void 0);
        this.controller = controller;
        __classPrivateFieldSet(this, _Stream_client, client, "f");
      }
      static fromSSEResponse(response, controller, client) {
        let consumed = false;
        const logger = client ? loggerFor(client) : console;
        async function* iterator() {
          if (consumed) {
            throw new AnthropicError("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
          }
          consumed = true;
          let done = false;
          try {
            for await (const sse of _iterSSEMessages(response, controller)) {
              if (sse.event === "completion") {
                try {
                  yield JSON.parse(sse.data);
                } catch (e) {
                  logger.error(`Could not parse message into JSON:`, sse.data);
                  logger.error(`From chunk:`, sse.raw);
                  throw e;
                }
              }
              if (sse.event === "message_start" || sse.event === "message_delta" || sse.event === "message_stop" || sse.event === "content_block_start" || sse.event === "content_block_delta" || sse.event === "content_block_stop" || sse.event === "message") {
                try {
                  yield JSON.parse(sse.data);
                } catch (e) {
                  logger.error(`Could not parse message into JSON:`, sse.data);
                  logger.error(`From chunk:`, sse.raw);
                  throw e;
                }
              }
              if (sse.event === "ping") {
                continue;
              }
              if (sse.event === "error") {
                const body = safeJSON(sse.data) ?? sse.data;
                const type = body?.error?.type;
                throw new APIError(void 0, body, void 0, response.headers, type);
              }
            }
            done = true;
          } catch (e) {
            if (isAbortError(e))
              return;
            throw e;
          } finally {
            if (!done)
              controller.abort();
          }
        }
        return new _Stream(iterator, controller, client);
      }
      /**
       * Generates a Stream from a newline-separated ReadableStream
       * where each item is a JSON value.
       */
      static fromReadableStream(readableStream, controller, client) {
        let consumed = false;
        async function* iterLines() {
          const lineDecoder = new LineDecoder();
          const iter = ReadableStreamToAsyncIterable(readableStream);
          for await (const chunk of iter) {
            for (const line of lineDecoder.decode(chunk)) {
              yield line;
            }
          }
          for (const line of lineDecoder.flush()) {
            yield line;
          }
        }
        async function* iterator() {
          if (consumed) {
            throw new AnthropicError("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
          }
          consumed = true;
          let done = false;
          try {
            for await (const line of iterLines()) {
              if (done)
                continue;
              if (line)
                yield JSON.parse(line);
            }
            done = true;
          } catch (e) {
            if (isAbortError(e))
              return;
            throw e;
          } finally {
            if (!done)
              controller.abort();
          }
        }
        return new _Stream(iterator, controller, client);
      }
      [(_Stream_client = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
        return this.iterator();
      }
      /**
       * Splits the stream into two streams which can be
       * independently read from at different speeds.
       */
      tee() {
        const left = [];
        const right = [];
        const iterator = this.iterator();
        const teeIterator = (queue) => {
          return {
            next: () => {
              if (queue.length === 0) {
                const result = iterator.next();
                left.push(result);
                right.push(result);
              }
              return queue.shift();
            }
          };
        };
        return [
          new _Stream(() => teeIterator(left), this.controller, __classPrivateFieldGet(this, _Stream_client, "f")),
          new _Stream(() => teeIterator(right), this.controller, __classPrivateFieldGet(this, _Stream_client, "f"))
        ];
      }
      /**
       * Converts this stream to a newline-separated ReadableStream of
       * JSON stringified values in the stream
       * which can be turned back into a Stream with `Stream.fromReadableStream()`.
       */
      toReadableStream() {
        const self2 = this;
        let iter;
        return makeReadableStream({
          async start() {
            iter = self2[Symbol.asyncIterator]();
          },
          async pull(ctrl) {
            try {
              const { value, done } = await iter.next();
              if (done)
                return ctrl.close();
              const bytes = encodeUTF8(JSON.stringify(value) + "\n");
              ctrl.enqueue(bytes);
            } catch (err) {
              ctrl.error(err);
            }
          },
          async cancel() {
            await iter.return?.();
          }
        });
      }
    };
    SSEDecoder = class {
      constructor() {
        this.event = null;
        this.data = [];
        this.chunks = [];
      }
      decode(line) {
        if (line.endsWith("\r")) {
          line = line.substring(0, line.length - 1);
        }
        if (!line) {
          if (!this.event && !this.data.length)
            return null;
          const sse = {
            event: this.event,
            data: this.data.join("\n"),
            raw: this.chunks
          };
          this.event = null;
          this.data = [];
          this.chunks = [];
          return sse;
        }
        this.chunks.push(line);
        if (line.startsWith(":")) {
          return null;
        }
        let [fieldname, _, value] = partition(line, ":");
        if (value.startsWith(" ")) {
          value = value.substring(1);
        }
        if (fieldname === "event") {
          this.event = value;
        } else if (fieldname === "data") {
          this.data.push(value);
        }
        return null;
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/internal/parse.mjs
async function defaultParseResponse(client, props) {
  const { response, requestLogID, retryOfRequestLogID, startTime } = props;
  const body = await (async () => {
    if (props.options.stream) {
      loggerFor(client).debug("response", response.status, response.url, response.headers, response.body);
      if (props.options.__streamClass) {
        return props.options.__streamClass.fromSSEResponse(response, props.controller);
      }
      return Stream.fromSSEResponse(response, props.controller);
    }
    if (response.status === 204) {
      return null;
    }
    if (props.options.__binaryResponse) {
      return response;
    }
    const contentType = response.headers.get("content-type");
    const mediaType = contentType?.split(";")[0]?.trim();
    const isJSON = mediaType?.includes("application/json") || mediaType?.endsWith("+json");
    if (isJSON) {
      const contentLength = response.headers.get("content-length");
      if (contentLength === "0") {
        return void 0;
      }
      const json2 = await response.json();
      return addRequestID(json2, response);
    }
    const text2 = await response.text();
    return text2;
  })();
  loggerFor(client).debug(`[${requestLogID}] response parsed`, formatRequestDetails({
    retryOfRequestLogID,
    url: response.url,
    status: response.status,
    body,
    durationMs: Date.now() - startTime
  }));
  return body;
}
function addRequestID(value, response) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  return Object.defineProperty(value, "_request_id", {
    value: response.headers.get("request-id"),
    enumerable: false
  });
}
var init_parse = __esm({
  "node_modules/@anthropic-ai/sdk/internal/parse.mjs"() {
    init_streaming();
    init_log();
  }
});

// node_modules/@anthropic-ai/sdk/core/api-promise.mjs
var _APIPromise_client, APIPromise;
var init_api_promise = __esm({
  "node_modules/@anthropic-ai/sdk/core/api-promise.mjs"() {
    init_tslib();
    init_parse();
    APIPromise = class _APIPromise extends Promise {
      constructor(client, responsePromise, parseResponse = defaultParseResponse) {
        super((resolve2) => {
          resolve2(null);
        });
        this.responsePromise = responsePromise;
        this.parseResponse = parseResponse;
        _APIPromise_client.set(this, void 0);
        __classPrivateFieldSet(this, _APIPromise_client, client, "f");
      }
      _thenUnwrap(transform) {
        return new _APIPromise(__classPrivateFieldGet(this, _APIPromise_client, "f"), this.responsePromise, async (client, props) => addRequestID(transform(await this.parseResponse(client, props), props), props.response));
      }
      /**
       * Gets the raw `Response` instance instead of parsing the response
       * data.
       *
       * If you want to parse the response body but still get the `Response`
       * instance, you can use {@link withResponse()}.
       *
       * 👋 Getting the wrong TypeScript type for `Response`?
       * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
       * to your `tsconfig.json`.
       */
      asResponse() {
        return this.responsePromise.then((p) => p.response);
      }
      /**
       * Gets the parsed response data, the raw `Response` instance and the ID of the request,
       * returned via the `request-id` header which is useful for debugging requests and resporting
       * issues to Anthropic.
       *
       * If you just want to get the raw `Response` instance without parsing it,
       * you can use {@link asResponse()}.
       *
       * 👋 Getting the wrong TypeScript type for `Response`?
       * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
       * to your `tsconfig.json`.
       */
      async withResponse() {
        const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
        return { data, response, request_id: response.headers.get("request-id") };
      }
      parse() {
        if (!this.parsedPromise) {
          this.parsedPromise = this.responsePromise.then((data) => this.parseResponse(__classPrivateFieldGet(this, _APIPromise_client, "f"), data));
        }
        return this.parsedPromise;
      }
      then(onfulfilled, onrejected) {
        return this.parse().then(onfulfilled, onrejected);
      }
      catch(onrejected) {
        return this.parse().catch(onrejected);
      }
      finally(onfinally) {
        return this.parse().finally(onfinally);
      }
    };
    _APIPromise_client = /* @__PURE__ */ new WeakMap();
  }
});

// node_modules/@anthropic-ai/sdk/core/pagination.mjs
var _AbstractPage_client, AbstractPage, PagePromise, Page, PageCursor;
var init_pagination = __esm({
  "node_modules/@anthropic-ai/sdk/core/pagination.mjs"() {
    init_tslib();
    init_error();
    init_parse();
    init_api_promise();
    init_values();
    AbstractPage = class {
      constructor(client, response, body, options) {
        _AbstractPage_client.set(this, void 0);
        __classPrivateFieldSet(this, _AbstractPage_client, client, "f");
        this.options = options;
        this.response = response;
        this.body = body;
      }
      hasNextPage() {
        const items = this.getPaginatedItems();
        if (!items.length)
          return false;
        return this.nextPageRequestOptions() != null;
      }
      async getNextPage() {
        const nextOptions = this.nextPageRequestOptions();
        if (!nextOptions) {
          throw new AnthropicError("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
        }
        return await __classPrivateFieldGet(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
      }
      async *iterPages() {
        let page = this;
        yield page;
        while (page.hasNextPage()) {
          page = await page.getNextPage();
          yield page;
        }
      }
      async *[(_AbstractPage_client = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
        for await (const page of this.iterPages()) {
          for (const item of page.getPaginatedItems()) {
            yield item;
          }
        }
      }
    };
    PagePromise = class extends APIPromise {
      constructor(client, request, Page2) {
        super(client, request, async (client2, props) => new Page2(client2, props.response, await defaultParseResponse(client2, props), props.options));
      }
      /**
       * Allow auto-paginating iteration on an unawaited list call, eg:
       *
       *    for await (const item of client.items.list()) {
       *      console.log(item)
       *    }
       */
      async *[Symbol.asyncIterator]() {
        const page = await this;
        for await (const item of page) {
          yield item;
        }
      }
    };
    Page = class extends AbstractPage {
      constructor(client, response, body, options) {
        super(client, response, body, options);
        this.data = body.data || [];
        this.has_more = body.has_more || false;
        this.first_id = body.first_id || null;
        this.last_id = body.last_id || null;
      }
      getPaginatedItems() {
        return this.data ?? [];
      }
      hasNextPage() {
        if (this.has_more === false) {
          return false;
        }
        return super.hasNextPage();
      }
      nextPageRequestOptions() {
        if (this.options.query?.["before_id"]) {
          const first_id = this.first_id;
          if (!first_id) {
            return null;
          }
          return {
            ...this.options,
            query: {
              ...maybeObj(this.options.query),
              before_id: first_id
            }
          };
        }
        const cursor = this.last_id;
        if (!cursor) {
          return null;
        }
        return {
          ...this.options,
          query: {
            ...maybeObj(this.options.query),
            after_id: cursor
          }
        };
      }
    };
    PageCursor = class extends AbstractPage {
      constructor(client, response, body, options) {
        super(client, response, body, options);
        this.data = body.data || [];
        this.next_page = body.next_page || null;
      }
      getPaginatedItems() {
        return this.data ?? [];
      }
      nextPageRequestOptions() {
        const cursor = this.next_page;
        if (!cursor) {
          return null;
        }
        return {
          ...this.options,
          query: {
            ...maybeObj(this.options.query),
            page: cursor
          }
        };
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/internal/uploads.mjs
function makeFile(fileBits, fileName, options) {
  checkFileSupport();
  return new File(fileBits, fileName ?? "unknown_file", options);
}
function getName(value, stripPath) {
  const val = typeof value === "object" && value !== null && ("name" in value && value.name && String(value.name) || "url" in value && value.url && String(value.url) || "filename" in value && value.filename && String(value.filename) || "path" in value && value.path && String(value.path)) || "";
  return stripPath ? val.split(/[\\/]/).pop() || void 0 : val;
}
function supportsFormData(fetchObject) {
  const fetch2 = typeof fetchObject === "function" ? fetchObject : fetchObject.fetch;
  const cached = supportsFormDataMap.get(fetch2);
  if (cached)
    return cached;
  const promise = (async () => {
    try {
      const FetchResponse = "Response" in fetch2 ? fetch2.Response : (await fetch2("data:,")).constructor;
      const data = new FormData();
      if (data.toString() === await new FetchResponse(data).text()) {
        return false;
      }
      return true;
    } catch {
      return true;
    }
  })();
  supportsFormDataMap.set(fetch2, promise);
  return promise;
}
var checkFileSupport, isAsyncIterable, multipartFormRequestOptions, supportsFormDataMap, createForm, isNamedBlob, addFormValue;
var init_uploads = __esm({
  "node_modules/@anthropic-ai/sdk/internal/uploads.mjs"() {
    init_shims();
    checkFileSupport = () => {
      if (typeof File === "undefined") {
        const { process: process2 } = globalThis;
        const isOldNode = typeof process2?.versions?.node === "string" && parseInt(process2.versions.node.split(".")) < 20;
        throw new Error("`File` is not defined as a global, which is required for file uploads." + (isOldNode ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
      }
    };
    isAsyncIterable = (value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function";
    multipartFormRequestOptions = async (opts, fetch2, stripFilenames = true) => {
      return { ...opts, body: await createForm(opts.body, fetch2, stripFilenames) };
    };
    supportsFormDataMap = /* @__PURE__ */ new WeakMap();
    createForm = async (body, fetch2, stripFilenames = true) => {
      if (!await supportsFormData(fetch2)) {
        throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
      }
      const form = new FormData();
      await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value, stripFilenames)));
      return form;
    };
    isNamedBlob = (value) => value instanceof Blob && "name" in value;
    addFormValue = async (form, key, value, stripFilenames) => {
      if (value === void 0)
        return;
      if (value == null) {
        throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
      }
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        form.append(key, String(value));
      } else if (value instanceof Response) {
        let options = {};
        const contentType = value.headers.get("Content-Type");
        if (contentType) {
          options = { type: contentType };
        }
        form.append(key, makeFile([await value.blob()], getName(value, stripFilenames), options));
      } else if (isAsyncIterable(value)) {
        form.append(key, makeFile([await new Response(ReadableStreamFrom(value)).blob()], getName(value, stripFilenames)));
      } else if (isNamedBlob(value)) {
        form.append(key, makeFile([value], getName(value, stripFilenames), { type: value.type }));
      } else if (Array.isArray(value)) {
        await Promise.all(value.map((entry) => addFormValue(form, key + "[]", entry, stripFilenames)));
      } else if (typeof value === "object") {
        await Promise.all(Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop, stripFilenames)));
      } else {
        throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/internal/to-file.mjs
async function toFile(value, name, options) {
  checkFileSupport();
  value = await value;
  name || (name = getName(value, true));
  if (isFileLike(value)) {
    if (value instanceof File && name == null && options == null) {
      return value;
    }
    return makeFile([await value.arrayBuffer()], name ?? value.name, {
      type: value.type,
      lastModified: value.lastModified,
      ...options
    });
  }
  if (isResponseLike(value)) {
    const blob = await value.blob();
    name || (name = new URL(value.url).pathname.split(/[\\/]/).pop());
    return makeFile(await getBytes(blob), name, options);
  }
  const parts = await getBytes(value);
  if (!options?.type) {
    const type = parts.find((part) => typeof part === "object" && "type" in part && part.type);
    if (typeof type === "string") {
      options = { ...options, type };
    }
  }
  return makeFile(parts, name, options);
}
async function getBytes(value) {
  let parts = [];
  if (typeof value === "string" || ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
  value instanceof ArrayBuffer) {
    parts.push(value);
  } else if (isBlobLike(value)) {
    parts.push(value instanceof Blob ? value : await value.arrayBuffer());
  } else if (isAsyncIterable(value)) {
    for await (const chunk of value) {
      parts.push(...await getBytes(chunk));
    }
  } else {
    const constructor = value?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof value}${constructor ? `; constructor: ${constructor}` : ""}${propsForError(value)}`);
  }
  return parts;
}
function propsForError(value) {
  if (typeof value !== "object" || value === null)
    return "";
  const props = Object.getOwnPropertyNames(value);
  return `; props: [${props.map((p) => `"${p}"`).join(", ")}]`;
}
var isBlobLike, isFileLike, isResponseLike;
var init_to_file = __esm({
  "node_modules/@anthropic-ai/sdk/internal/to-file.mjs"() {
    init_uploads();
    init_uploads();
    isBlobLike = (value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function";
    isFileLike = (value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike(value);
    isResponseLike = (value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function";
  }
});

// node_modules/@anthropic-ai/sdk/core/uploads.mjs
var init_uploads2 = __esm({
  "node_modules/@anthropic-ai/sdk/core/uploads.mjs"() {
    init_to_file();
  }
});

// node_modules/@anthropic-ai/sdk/resources/shared.mjs
var init_shared = __esm({
  "node_modules/@anthropic-ai/sdk/resources/shared.mjs"() {
  }
});

// node_modules/@anthropic-ai/sdk/core/resource.mjs
var APIResource;
var init_resource = __esm({
  "node_modules/@anthropic-ai/sdk/core/resource.mjs"() {
    APIResource = class {
      constructor(client) {
        this._client = client;
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/internal/headers.mjs
function* iterateHeaders(headers) {
  if (!headers)
    return;
  if (brand_privateNullableHeaders in headers) {
    const { values, nulls } = headers;
    yield* values.entries();
    for (const name of nulls) {
      yield [name, null];
    }
    return;
  }
  let shouldClear = false;
  let iter;
  if (headers instanceof Headers) {
    iter = headers.entries();
  } else if (isReadonlyArray(headers)) {
    iter = headers;
  } else {
    shouldClear = true;
    iter = Object.entries(headers ?? {});
  }
  for (let row of iter) {
    const name = row[0];
    if (typeof name !== "string")
      throw new TypeError("expected header name to be a string");
    const values = isReadonlyArray(row[1]) ? row[1] : [row[1]];
    let didClear = false;
    for (const value of values) {
      if (value === void 0)
        continue;
      if (shouldClear && !didClear) {
        didClear = true;
        yield [name, null];
      }
      yield [name, value];
    }
  }
}
var brand_privateNullableHeaders, buildHeaders;
var init_headers = __esm({
  "node_modules/@anthropic-ai/sdk/internal/headers.mjs"() {
    init_values();
    brand_privateNullableHeaders = Symbol.for("brand.privateNullableHeaders");
    buildHeaders = (newHeaders) => {
      const targetHeaders = new Headers();
      const nullHeaders = /* @__PURE__ */ new Set();
      for (const headers of newHeaders) {
        const seenHeaders = /* @__PURE__ */ new Set();
        for (const [name, value] of iterateHeaders(headers)) {
          const lowerName = name.toLowerCase();
          if (!seenHeaders.has(lowerName)) {
            targetHeaders.delete(name);
            seenHeaders.add(lowerName);
          }
          if (value === null) {
            targetHeaders.delete(name);
            nullHeaders.add(lowerName);
          } else {
            targetHeaders.append(name, value);
            nullHeaders.delete(lowerName);
          }
        }
      }
      return { [brand_privateNullableHeaders]: true, values: targetHeaders, nulls: nullHeaders };
    };
  }
});

// node_modules/@anthropic-ai/sdk/internal/utils/path.mjs
function encodeURIPath(str) {
  return str.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var EMPTY, createPathTagFunction, path3;
var init_path = __esm({
  "node_modules/@anthropic-ai/sdk/internal/utils/path.mjs"() {
    init_error();
    EMPTY = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null));
    createPathTagFunction = (pathEncoder = encodeURIPath) => function path5(statics, ...params) {
      if (statics.length === 1)
        return statics[0];
      let postPath = false;
      const invalidSegments = [];
      const path6 = statics.reduce((previousValue, currentValue, index) => {
        if (/[?#]/.test(currentValue)) {
          postPath = true;
        }
        const value = params[index];
        let encoded = (postPath ? encodeURIComponent : pathEncoder)("" + value);
        if (index !== params.length && (value == null || typeof value === "object" && // handle values from other realms
        value.toString === Object.getPrototypeOf(Object.getPrototypeOf(value.hasOwnProperty ?? EMPTY) ?? EMPTY)?.toString)) {
          encoded = value + "";
          invalidSegments.push({
            start: previousValue.length + currentValue.length,
            length: encoded.length,
            error: `Value of type ${Object.prototype.toString.call(value).slice(8, -1)} is not a valid path parameter`
          });
        }
        return previousValue + currentValue + (index === params.length ? "" : encoded);
      }, "");
      const pathOnly = path6.split(/[?#]/, 1)[0];
      const invalidSegmentPattern = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
      let match;
      while ((match = invalidSegmentPattern.exec(pathOnly)) !== null) {
        invalidSegments.push({
          start: match.index,
          length: match[0].length,
          error: `Value "${match[0]}" can't be safely passed as a path parameter`
        });
      }
      invalidSegments.sort((a, b) => a.start - b.start);
      if (invalidSegments.length > 0) {
        let lastEnd = 0;
        const underline = invalidSegments.reduce((acc, segment) => {
          const spaces = " ".repeat(segment.start - lastEnd);
          const arrows = "^".repeat(segment.length);
          lastEnd = segment.start + segment.length;
          return acc + spaces + arrows;
        }, "");
        throw new AnthropicError(`Path parameters result in path with invalid segments:
${invalidSegments.map((e) => e.error).join("\n")}
${path6}
${underline}`);
      }
      return path6;
    };
    path3 = /* @__PURE__ */ createPathTagFunction(encodeURIPath);
  }
});

// node_modules/@anthropic-ai/sdk/resources/beta/environments.mjs
var Environments;
var init_environments = __esm({
  "node_modules/@anthropic-ai/sdk/resources/beta/environments.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_path();
    Environments = class extends APIResource {
      /**
       * Create a new environment with the specified configuration.
       *
       * @example
       * ```ts
       * const betaEnvironment =
       *   await client.beta.environments.create({
       *     name: 'python-data-analysis',
       *   });
       * ```
       */
      create(params, options) {
        const { betas, ...body } = params;
        return this._client.post("/v1/environments?beta=true", {
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Retrieve a specific environment by ID.
       *
       * @example
       * ```ts
       * const betaEnvironment =
       *   await client.beta.environments.retrieve(
       *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
       *   );
       * ```
       */
      retrieve(environmentID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path3`/v1/environments/${environmentID}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Update an existing environment's configuration.
       *
       * @example
       * ```ts
       * const betaEnvironment =
       *   await client.beta.environments.update(
       *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
       *   );
       * ```
       */
      update(environmentID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path3`/v1/environments/${environmentID}?beta=true`, {
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * List environments with pagination support.
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const betaEnvironment of client.beta.environments.list()) {
       *   // ...
       * }
       * ```
       */
      list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList("/v1/environments?beta=true", PageCursor, {
          query,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Delete an environment by ID. Returns a confirmation of the deletion.
       *
       * @example
       * ```ts
       * const betaEnvironmentDeleteResponse =
       *   await client.beta.environments.delete(
       *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
       *   );
       * ```
       */
      delete(environmentID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(path3`/v1/environments/${environmentID}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Archive an environment by ID. Archived environments cannot be used to create new
       * sessions.
       *
       * @example
       * ```ts
       * const betaEnvironment =
       *   await client.beta.environments.archive(
       *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
       *   );
       * ```
       */
      archive(environmentID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(path3`/v1/environments/${environmentID}/archive?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/lib/stainless-helper-header.mjs
function wasCreatedByStainlessHelper(value) {
  return typeof value === "object" && value !== null && SDK_HELPER_SYMBOL in value;
}
function collectStainlessHelpers(tools, messages2) {
  const helpers = /* @__PURE__ */ new Set();
  if (tools) {
    for (const tool of tools) {
      if (wasCreatedByStainlessHelper(tool)) {
        helpers.add(tool[SDK_HELPER_SYMBOL]);
      }
    }
  }
  if (messages2) {
    for (const message of messages2) {
      if (wasCreatedByStainlessHelper(message)) {
        helpers.add(message[SDK_HELPER_SYMBOL]);
      }
      if (Array.isArray(message.content)) {
        for (const block of message.content) {
          if (wasCreatedByStainlessHelper(block)) {
            helpers.add(block[SDK_HELPER_SYMBOL]);
          }
        }
      }
    }
  }
  return Array.from(helpers);
}
function stainlessHelperHeader(tools, messages2) {
  const helpers = collectStainlessHelpers(tools, messages2);
  if (helpers.length === 0)
    return {};
  return { "x-stainless-helper": helpers.join(", ") };
}
function stainlessHelperHeaderFromFile(file) {
  if (wasCreatedByStainlessHelper(file)) {
    return { "x-stainless-helper": file[SDK_HELPER_SYMBOL] };
  }
  return {};
}
var SDK_HELPER_SYMBOL;
var init_stainless_helper_header = __esm({
  "node_modules/@anthropic-ai/sdk/lib/stainless-helper-header.mjs"() {
    SDK_HELPER_SYMBOL = Symbol("anthropic.sdk.stainlessHelper");
  }
});

// node_modules/@anthropic-ai/sdk/resources/beta/files.mjs
var Files;
var init_files = __esm({
  "node_modules/@anthropic-ai/sdk/resources/beta/files.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_stainless_helper_header();
    init_uploads();
    init_path();
    Files = class extends APIResource {
      /**
       * List Files
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const fileMetadata of client.beta.files.list()) {
       *   // ...
       * }
       * ```
       */
      list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList("/v1/files", Page, {
          query,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "files-api-2025-04-14"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Delete File
       *
       * @example
       * ```ts
       * const deletedFile = await client.beta.files.delete(
       *   'file_id',
       * );
       * ```
       */
      delete(fileID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(path3`/v1/files/${fileID}`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "files-api-2025-04-14"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Download File
       *
       * @example
       * ```ts
       * const response = await client.beta.files.download(
       *   'file_id',
       * );
       *
       * const content = await response.blob();
       * console.log(content);
       * ```
       */
      download(fileID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path3`/v1/files/${fileID}/content`, {
          ...options,
          headers: buildHeaders([
            {
              "anthropic-beta": [...betas ?? [], "files-api-2025-04-14"].toString(),
              Accept: "application/binary"
            },
            options?.headers
          ]),
          __binaryResponse: true
        });
      }
      /**
       * Get File Metadata
       *
       * @example
       * ```ts
       * const fileMetadata =
       *   await client.beta.files.retrieveMetadata('file_id');
       * ```
       */
      retrieveMetadata(fileID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path3`/v1/files/${fileID}`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "files-api-2025-04-14"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Upload File
       *
       * @example
       * ```ts
       * const fileMetadata = await client.beta.files.upload({
       *   file: fs.createReadStream('path/to/file'),
       * });
       * ```
       */
      upload(params, options) {
        const { betas, ...body } = params;
        return this._client.post("/v1/files", multipartFormRequestOptions({
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "files-api-2025-04-14"].toString() },
            stainlessHelperHeaderFromFile(body.file),
            options?.headers
          ])
        }, this._client));
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/resources/beta/models.mjs
var Models;
var init_models = __esm({
  "node_modules/@anthropic-ai/sdk/resources/beta/models.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_path();
    Models = class extends APIResource {
      /**
       * Get a specific model.
       *
       * The Models API response can be used to determine information about a specific
       * model or resolve a model alias to a model ID.
       *
       * @example
       * ```ts
       * const betaModelInfo = await client.beta.models.retrieve(
       *   'model_id',
       * );
       * ```
       */
      retrieve(modelID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path3`/v1/models/${modelID}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 },
            options?.headers
          ])
        });
      }
      /**
       * List available models.
       *
       * The Models API response can be used to determine which models are available for
       * use in the API. More recently released models are listed first.
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const betaModelInfo of client.beta.models.list()) {
       *   // ...
       * }
       * ```
       */
      list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList("/v1/models?beta=true", Page, {
          query,
          ...options,
          headers: buildHeaders([
            { ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 },
            options?.headers
          ])
        });
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/resources/beta/agents/versions.mjs
var Versions;
var init_versions = __esm({
  "node_modules/@anthropic-ai/sdk/resources/beta/agents/versions.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_path();
    Versions = class extends APIResource {
      /**
       * List Agent Versions
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const betaManagedAgentsAgent of client.beta.agents.versions.list(
       *   'agent_011CZkYpogX7uDKUyvBTophP',
       * )) {
       *   // ...
       * }
       * ```
       */
      list(agentID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path3`/v1/agents/${agentID}/versions?beta=true`, PageCursor, {
          query,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/resources/beta/agents/agents.mjs
var Agents;
var init_agents = __esm({
  "node_modules/@anthropic-ai/sdk/resources/beta/agents/agents.mjs"() {
    init_resource();
    init_versions();
    init_versions();
    init_pagination();
    init_headers();
    init_path();
    Agents = class extends APIResource {
      constructor() {
        super(...arguments);
        this.versions = new Versions(this._client);
      }
      /**
       * Create Agent
       *
       * @example
       * ```ts
       * const betaManagedAgentsAgent =
       *   await client.beta.agents.create({
       *     model: 'claude-sonnet-4-6',
       *     name: 'My First Agent',
       *   });
       * ```
       */
      create(params, options) {
        const { betas, ...body } = params;
        return this._client.post("/v1/agents?beta=true", {
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Get Agent
       *
       * @example
       * ```ts
       * const betaManagedAgentsAgent =
       *   await client.beta.agents.retrieve(
       *     'agent_011CZkYpogX7uDKUyvBTophP',
       *   );
       * ```
       */
      retrieve(agentID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.get(path3`/v1/agents/${agentID}?beta=true`, {
          query,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Update Agent
       *
       * @example
       * ```ts
       * const betaManagedAgentsAgent =
       *   await client.beta.agents.update(
       *     'agent_011CZkYpogX7uDKUyvBTophP',
       *     { version: 1 },
       *   );
       * ```
       */
      update(agentID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path3`/v1/agents/${agentID}?beta=true`, {
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * List Agents
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const betaManagedAgentsAgent of client.beta.agents.list()) {
       *   // ...
       * }
       * ```
       */
      list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList("/v1/agents?beta=true", PageCursor, {
          query,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Archive Agent
       *
       * @example
       * ```ts
       * const betaManagedAgentsAgent =
       *   await client.beta.agents.archive(
       *     'agent_011CZkYpogX7uDKUyvBTophP',
       *   );
       * ```
       */
      archive(agentID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(path3`/v1/agents/${agentID}/archive?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
    };
    Agents.Versions = Versions;
  }
});

// node_modules/@anthropic-ai/sdk/error.mjs
var init_error2 = __esm({
  "node_modules/@anthropic-ai/sdk/error.mjs"() {
    init_error();
  }
});

// node_modules/@anthropic-ai/sdk/internal/constants.mjs
var MODEL_NONSTREAMING_TOKENS;
var init_constants = __esm({
  "node_modules/@anthropic-ai/sdk/internal/constants.mjs"() {
    MODEL_NONSTREAMING_TOKENS = {
      "claude-opus-4-20250514": 8192,
      "claude-opus-4-0": 8192,
      "claude-4-opus-20250514": 8192,
      "anthropic.claude-opus-4-20250514-v1:0": 8192,
      "claude-opus-4@20250514": 8192,
      "claude-opus-4-1-20250805": 8192,
      "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
      "claude-opus-4-1@20250805": 8192
    };
  }
});

// node_modules/@anthropic-ai/sdk/lib/beta-parser.mjs
function getOutputFormat(params) {
  return params?.output_format ?? params?.output_config?.format;
}
function maybeParseBetaMessage(message, params, opts) {
  const outputFormat = getOutputFormat(params);
  if (!params || !("parse" in (outputFormat ?? {}))) {
    return {
      ...message,
      content: message.content.map((block) => {
        if (block.type === "text") {
          const parsedBlock = Object.defineProperty({ ...block }, "parsed_output", {
            value: null,
            enumerable: false
          });
          return Object.defineProperty(parsedBlock, "parsed", {
            get() {
              opts.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead.");
              return null;
            },
            enumerable: false
          });
        }
        return block;
      }),
      parsed_output: null
    };
  }
  return parseBetaMessage(message, params, opts);
}
function parseBetaMessage(message, params, opts) {
  let firstParsedOutput = null;
  const content = message.content.map((block) => {
    if (block.type === "text") {
      const parsedOutput = parseBetaOutputFormat(params, block.text);
      if (firstParsedOutput === null) {
        firstParsedOutput = parsedOutput;
      }
      const parsedBlock = Object.defineProperty({ ...block }, "parsed_output", {
        value: parsedOutput,
        enumerable: false
      });
      return Object.defineProperty(parsedBlock, "parsed", {
        get() {
          opts.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead.");
          return parsedOutput;
        },
        enumerable: false
      });
    }
    return block;
  });
  return {
    ...message,
    content,
    parsed_output: firstParsedOutput
  };
}
function parseBetaOutputFormat(params, content) {
  const outputFormat = getOutputFormat(params);
  if (outputFormat?.type !== "json_schema") {
    return null;
  }
  try {
    if ("parse" in outputFormat) {
      return outputFormat.parse(content);
    }
    return JSON.parse(content);
  } catch (error) {
    throw new AnthropicError(`Failed to parse structured output: ${error}`);
  }
}
var init_beta_parser = __esm({
  "node_modules/@anthropic-ai/sdk/lib/beta-parser.mjs"() {
    init_error();
  }
});

// node_modules/@anthropic-ai/sdk/_vendor/partial-json-parser/parser.mjs
var tokenize, strip, unstrip, generate, partialParse;
var init_parser = __esm({
  "node_modules/@anthropic-ai/sdk/_vendor/partial-json-parser/parser.mjs"() {
    tokenize = (input) => {
      let current = 0;
      let tokens = [];
      while (current < input.length) {
        let char = input[current];
        if (char === "\\") {
          current++;
          continue;
        }
        if (char === "{") {
          tokens.push({
            type: "brace",
            value: "{"
          });
          current++;
          continue;
        }
        if (char === "}") {
          tokens.push({
            type: "brace",
            value: "}"
          });
          current++;
          continue;
        }
        if (char === "[") {
          tokens.push({
            type: "paren",
            value: "["
          });
          current++;
          continue;
        }
        if (char === "]") {
          tokens.push({
            type: "paren",
            value: "]"
          });
          current++;
          continue;
        }
        if (char === ":") {
          tokens.push({
            type: "separator",
            value: ":"
          });
          current++;
          continue;
        }
        if (char === ",") {
          tokens.push({
            type: "delimiter",
            value: ","
          });
          current++;
          continue;
        }
        if (char === '"') {
          let value = "";
          let danglingQuote = false;
          char = input[++current];
          while (char !== '"') {
            if (current === input.length) {
              danglingQuote = true;
              break;
            }
            if (char === "\\") {
              current++;
              if (current === input.length) {
                danglingQuote = true;
                break;
              }
              value += char + input[current];
              char = input[++current];
            } else {
              value += char;
              char = input[++current];
            }
          }
          char = input[++current];
          if (!danglingQuote) {
            tokens.push({
              type: "string",
              value
            });
          }
          continue;
        }
        let WHITESPACE = /\s/;
        if (char && WHITESPACE.test(char)) {
          current++;
          continue;
        }
        let NUMBERS = /[0-9]/;
        if (char && NUMBERS.test(char) || char === "-" || char === ".") {
          let value = "";
          if (char === "-") {
            value += char;
            char = input[++current];
          }
          while (char && NUMBERS.test(char) || char === ".") {
            value += char;
            char = input[++current];
          }
          tokens.push({
            type: "number",
            value
          });
          continue;
        }
        let LETTERS = /[a-z]/i;
        if (char && LETTERS.test(char)) {
          let value = "";
          while (char && LETTERS.test(char)) {
            if (current === input.length) {
              break;
            }
            value += char;
            char = input[++current];
          }
          if (value == "true" || value == "false" || value === "null") {
            tokens.push({
              type: "name",
              value
            });
          } else {
            current++;
            continue;
          }
          continue;
        }
        current++;
      }
      return tokens;
    };
    strip = (tokens) => {
      if (tokens.length === 0) {
        return tokens;
      }
      let lastToken = tokens[tokens.length - 1];
      switch (lastToken.type) {
        case "separator":
          tokens = tokens.slice(0, tokens.length - 1);
          return strip(tokens);
          break;
        case "number":
          let lastCharacterOfLastToken = lastToken.value[lastToken.value.length - 1];
          if (lastCharacterOfLastToken === "." || lastCharacterOfLastToken === "-") {
            tokens = tokens.slice(0, tokens.length - 1);
            return strip(tokens);
          }
        case "string":
          let tokenBeforeTheLastToken = tokens[tokens.length - 2];
          if (tokenBeforeTheLastToken?.type === "delimiter") {
            tokens = tokens.slice(0, tokens.length - 1);
            return strip(tokens);
          } else if (tokenBeforeTheLastToken?.type === "brace" && tokenBeforeTheLastToken.value === "{") {
            tokens = tokens.slice(0, tokens.length - 1);
            return strip(tokens);
          }
          break;
        case "delimiter":
          tokens = tokens.slice(0, tokens.length - 1);
          return strip(tokens);
          break;
      }
      return tokens;
    };
    unstrip = (tokens) => {
      let tail = [];
      tokens.map((token) => {
        if (token.type === "brace") {
          if (token.value === "{") {
            tail.push("}");
          } else {
            tail.splice(tail.lastIndexOf("}"), 1);
          }
        }
        if (token.type === "paren") {
          if (token.value === "[") {
            tail.push("]");
          } else {
            tail.splice(tail.lastIndexOf("]"), 1);
          }
        }
      });
      if (tail.length > 0) {
        tail.reverse().map((item) => {
          if (item === "}") {
            tokens.push({
              type: "brace",
              value: "}"
            });
          } else if (item === "]") {
            tokens.push({
              type: "paren",
              value: "]"
            });
          }
        });
      }
      return tokens;
    };
    generate = (tokens) => {
      let output = "";
      tokens.map((token) => {
        switch (token.type) {
          case "string":
            output += '"' + token.value + '"';
            break;
          default:
            output += token.value;
            break;
        }
      });
      return output;
    };
    partialParse = (input) => JSON.parse(generate(unstrip(strip(tokenize(input)))));
  }
});

// node_modules/@anthropic-ai/sdk/streaming.mjs
var init_streaming2 = __esm({
  "node_modules/@anthropic-ai/sdk/streaming.mjs"() {
    init_streaming();
  }
});

// node_modules/@anthropic-ai/sdk/lib/BetaMessageStream.mjs
function tracksToolInput(content) {
  return content.type === "tool_use" || content.type === "server_tool_use" || content.type === "mcp_tool_use";
}
function checkNever(x) {
}
var _BetaMessageStream_instances, _BetaMessageStream_currentMessageSnapshot, _BetaMessageStream_params, _BetaMessageStream_connectedPromise, _BetaMessageStream_resolveConnectedPromise, _BetaMessageStream_rejectConnectedPromise, _BetaMessageStream_endPromise, _BetaMessageStream_resolveEndPromise, _BetaMessageStream_rejectEndPromise, _BetaMessageStream_listeners, _BetaMessageStream_ended, _BetaMessageStream_errored, _BetaMessageStream_aborted, _BetaMessageStream_catchingPromiseCreated, _BetaMessageStream_response, _BetaMessageStream_request_id, _BetaMessageStream_logger, _BetaMessageStream_getFinalMessage, _BetaMessageStream_getFinalText, _BetaMessageStream_handleError, _BetaMessageStream_beginRequest, _BetaMessageStream_addStreamEvent, _BetaMessageStream_endRequest, _BetaMessageStream_accumulateMessage, JSON_BUF_PROPERTY, BetaMessageStream;
var init_BetaMessageStream = __esm({
  "node_modules/@anthropic-ai/sdk/lib/BetaMessageStream.mjs"() {
    init_tslib();
    init_parser();
    init_error2();
    init_errors();
    init_streaming2();
    init_beta_parser();
    JSON_BUF_PROPERTY = "__json_buf";
    BetaMessageStream = class _BetaMessageStream {
      constructor(params, opts) {
        _BetaMessageStream_instances.add(this);
        this.messages = [];
        this.receivedMessages = [];
        _BetaMessageStream_currentMessageSnapshot.set(this, void 0);
        _BetaMessageStream_params.set(this, null);
        this.controller = new AbortController();
        _BetaMessageStream_connectedPromise.set(this, void 0);
        _BetaMessageStream_resolveConnectedPromise.set(this, () => {
        });
        _BetaMessageStream_rejectConnectedPromise.set(this, () => {
        });
        _BetaMessageStream_endPromise.set(this, void 0);
        _BetaMessageStream_resolveEndPromise.set(this, () => {
        });
        _BetaMessageStream_rejectEndPromise.set(this, () => {
        });
        _BetaMessageStream_listeners.set(this, {});
        _BetaMessageStream_ended.set(this, false);
        _BetaMessageStream_errored.set(this, false);
        _BetaMessageStream_aborted.set(this, false);
        _BetaMessageStream_catchingPromiseCreated.set(this, false);
        _BetaMessageStream_response.set(this, void 0);
        _BetaMessageStream_request_id.set(this, void 0);
        _BetaMessageStream_logger.set(this, void 0);
        _BetaMessageStream_handleError.set(this, (error) => {
          __classPrivateFieldSet(this, _BetaMessageStream_errored, true, "f");
          if (isAbortError(error)) {
            error = new APIUserAbortError();
          }
          if (error instanceof APIUserAbortError) {
            __classPrivateFieldSet(this, _BetaMessageStream_aborted, true, "f");
            return this._emit("abort", error);
          }
          if (error instanceof AnthropicError) {
            return this._emit("error", error);
          }
          if (error instanceof Error) {
            const anthropicError = new AnthropicError(error.message);
            anthropicError.cause = error;
            return this._emit("error", anthropicError);
          }
          return this._emit("error", new AnthropicError(String(error)));
        });
        __classPrivateFieldSet(this, _BetaMessageStream_connectedPromise, new Promise((resolve2, reject) => {
          __classPrivateFieldSet(this, _BetaMessageStream_resolveConnectedPromise, resolve2, "f");
          __classPrivateFieldSet(this, _BetaMessageStream_rejectConnectedPromise, reject, "f");
        }), "f");
        __classPrivateFieldSet(this, _BetaMessageStream_endPromise, new Promise((resolve2, reject) => {
          __classPrivateFieldSet(this, _BetaMessageStream_resolveEndPromise, resolve2, "f");
          __classPrivateFieldSet(this, _BetaMessageStream_rejectEndPromise, reject, "f");
        }), "f");
        __classPrivateFieldGet(this, _BetaMessageStream_connectedPromise, "f").catch(() => {
        });
        __classPrivateFieldGet(this, _BetaMessageStream_endPromise, "f").catch(() => {
        });
        __classPrivateFieldSet(this, _BetaMessageStream_params, params, "f");
        __classPrivateFieldSet(this, _BetaMessageStream_logger, opts?.logger ?? console, "f");
      }
      get response() {
        return __classPrivateFieldGet(this, _BetaMessageStream_response, "f");
      }
      get request_id() {
        return __classPrivateFieldGet(this, _BetaMessageStream_request_id, "f");
      }
      /**
       * Returns the `MessageStream` data, the raw `Response` instance and the ID of the request,
       * returned vie the `request-id` header which is useful for debugging requests and resporting
       * issues to Anthropic.
       *
       * This is the same as the `APIPromise.withResponse()` method.
       *
       * This method will raise an error if you created the stream using `MessageStream.fromReadableStream`
       * as no `Response` is available.
       */
      async withResponse() {
        __classPrivateFieldSet(this, _BetaMessageStream_catchingPromiseCreated, true, "f");
        const response = await __classPrivateFieldGet(this, _BetaMessageStream_connectedPromise, "f");
        if (!response) {
          throw new Error("Could not resolve a `Response` object");
        }
        return {
          data: this,
          response,
          request_id: response.headers.get("request-id")
        };
      }
      /**
       * Intended for use on the frontend, consuming a stream produced with
       * `.toReadableStream()` on the backend.
       *
       * Note that messages sent to the model do not appear in `.on('message')`
       * in this context.
       */
      static fromReadableStream(stream) {
        const runner = new _BetaMessageStream(null);
        runner._run(() => runner._fromReadableStream(stream));
        return runner;
      }
      static createMessage(messages2, params, options, { logger } = {}) {
        const runner = new _BetaMessageStream(params, { logger });
        for (const message of params.messages) {
          runner._addMessageParam(message);
        }
        __classPrivateFieldSet(runner, _BetaMessageStream_params, { ...params, stream: true }, "f");
        runner._run(() => runner._createMessage(messages2, { ...params, stream: true }, { ...options, headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" } }));
        return runner;
      }
      _run(executor) {
        executor().then(() => {
          this._emitFinal();
          this._emit("end");
        }, __classPrivateFieldGet(this, _BetaMessageStream_handleError, "f"));
      }
      _addMessageParam(message) {
        this.messages.push(message);
      }
      _addMessage(message, emit = true) {
        this.receivedMessages.push(message);
        if (emit) {
          this._emit("message", message);
        }
      }
      async _createMessage(messages2, params, options) {
        const signal = options?.signal;
        let abortHandler;
        if (signal) {
          if (signal.aborted)
            this.controller.abort();
          abortHandler = this.controller.abort.bind(this.controller);
          signal.addEventListener("abort", abortHandler);
        }
        try {
          __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_beginRequest).call(this);
          const { response, data: stream } = await messages2.create({ ...params, stream: true }, { ...options, signal: this.controller.signal }).withResponse();
          this._connected(response);
          for await (const event of stream) {
            __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_addStreamEvent).call(this, event);
          }
          if (stream.controller.signal?.aborted) {
            throw new APIUserAbortError();
          }
          __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_endRequest).call(this);
        } finally {
          if (signal && abortHandler) {
            signal.removeEventListener("abort", abortHandler);
          }
        }
      }
      _connected(response) {
        if (this.ended)
          return;
        __classPrivateFieldSet(this, _BetaMessageStream_response, response, "f");
        __classPrivateFieldSet(this, _BetaMessageStream_request_id, response?.headers.get("request-id"), "f");
        __classPrivateFieldGet(this, _BetaMessageStream_resolveConnectedPromise, "f").call(this, response);
        this._emit("connect");
      }
      get ended() {
        return __classPrivateFieldGet(this, _BetaMessageStream_ended, "f");
      }
      get errored() {
        return __classPrivateFieldGet(this, _BetaMessageStream_errored, "f");
      }
      get aborted() {
        return __classPrivateFieldGet(this, _BetaMessageStream_aborted, "f");
      }
      abort() {
        this.controller.abort();
      }
      /**
       * Adds the listener function to the end of the listeners array for the event.
       * No checks are made to see if the listener has already been added. Multiple calls passing
       * the same combination of event and listener will result in the listener being added, and
       * called, multiple times.
       * @returns this MessageStream, so that calls can be chained
       */
      on(event, listener) {
        const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] = []);
        listeners.push({ listener });
        return this;
      }
      /**
       * Removes the specified listener from the listener array for the event.
       * off() will remove, at most, one instance of a listener from the listener array. If any single
       * listener has been added multiple times to the listener array for the specified event, then
       * off() must be called multiple times to remove each instance.
       * @returns this MessageStream, so that calls can be chained
       */
      off(event, listener) {
        const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event];
        if (!listeners)
          return this;
        const index = listeners.findIndex((l) => l.listener === listener);
        if (index >= 0)
          listeners.splice(index, 1);
        return this;
      }
      /**
       * Adds a one-time listener function for the event. The next time the event is triggered,
       * this listener is removed and then invoked.
       * @returns this MessageStream, so that calls can be chained
       */
      once(event, listener) {
        const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] = []);
        listeners.push({ listener, once: true });
        return this;
      }
      /**
       * This is similar to `.once()`, but returns a Promise that resolves the next time
       * the event is triggered, instead of calling a listener callback.
       * @returns a Promise that resolves the next time given event is triggered,
       * or rejects if an error is emitted.  (If you request the 'error' event,
       * returns a promise that resolves with the error).
       *
       * Example:
       *
       *   const message = await stream.emitted('message') // rejects if the stream errors
       */
      emitted(event) {
        return new Promise((resolve2, reject) => {
          __classPrivateFieldSet(this, _BetaMessageStream_catchingPromiseCreated, true, "f");
          if (event !== "error")
            this.once("error", reject);
          this.once(event, resolve2);
        });
      }
      async done() {
        __classPrivateFieldSet(this, _BetaMessageStream_catchingPromiseCreated, true, "f");
        await __classPrivateFieldGet(this, _BetaMessageStream_endPromise, "f");
      }
      get currentMessage() {
        return __classPrivateFieldGet(this, _BetaMessageStream_currentMessageSnapshot, "f");
      }
      /**
       * @returns a promise that resolves with the the final assistant Message response,
       * or rejects if an error occurred or the stream ended prematurely without producing a Message.
       * If structured outputs were used, this will be a ParsedMessage with a `parsed` field.
       */
      async finalMessage() {
        await this.done();
        return __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalMessage).call(this);
      }
      /**
       * @returns a promise that resolves with the the final assistant Message's text response, concatenated
       * together if there are more than one text blocks.
       * Rejects if an error occurred or the stream ended prematurely without producing a Message.
       */
      async finalText() {
        await this.done();
        return __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalText).call(this);
      }
      _emit(event, ...args) {
        if (__classPrivateFieldGet(this, _BetaMessageStream_ended, "f"))
          return;
        if (event === "end") {
          __classPrivateFieldSet(this, _BetaMessageStream_ended, true, "f");
          __classPrivateFieldGet(this, _BetaMessageStream_resolveEndPromise, "f").call(this);
        }
        const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event];
        if (listeners) {
          __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
          listeners.forEach(({ listener }) => listener(...args));
        }
        if (event === "abort") {
          const error = args[0];
          if (!__classPrivateFieldGet(this, _BetaMessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
            Promise.reject(error);
          }
          __classPrivateFieldGet(this, _BetaMessageStream_rejectConnectedPromise, "f").call(this, error);
          __classPrivateFieldGet(this, _BetaMessageStream_rejectEndPromise, "f").call(this, error);
          this._emit("end");
          return;
        }
        if (event === "error") {
          const error = args[0];
          if (!__classPrivateFieldGet(this, _BetaMessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
            Promise.reject(error);
          }
          __classPrivateFieldGet(this, _BetaMessageStream_rejectConnectedPromise, "f").call(this, error);
          __classPrivateFieldGet(this, _BetaMessageStream_rejectEndPromise, "f").call(this, error);
          this._emit("end");
        }
      }
      _emitFinal() {
        const finalMessage = this.receivedMessages.at(-1);
        if (finalMessage) {
          this._emit("finalMessage", __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalMessage).call(this));
        }
      }
      async _fromReadableStream(readableStream, options) {
        const signal = options?.signal;
        let abortHandler;
        if (signal) {
          if (signal.aborted)
            this.controller.abort();
          abortHandler = this.controller.abort.bind(this.controller);
          signal.addEventListener("abort", abortHandler);
        }
        try {
          __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_beginRequest).call(this);
          this._connected(null);
          const stream = Stream.fromReadableStream(readableStream, this.controller);
          for await (const event of stream) {
            __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_addStreamEvent).call(this, event);
          }
          if (stream.controller.signal?.aborted) {
            throw new APIUserAbortError();
          }
          __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_endRequest).call(this);
        } finally {
          if (signal && abortHandler) {
            signal.removeEventListener("abort", abortHandler);
          }
        }
      }
      [(_BetaMessageStream_currentMessageSnapshot = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_params = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_connectedPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_resolveConnectedPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_rejectConnectedPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_endPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_resolveEndPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_rejectEndPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_listeners = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_ended = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_errored = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_aborted = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_catchingPromiseCreated = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_response = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_request_id = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_logger = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_handleError = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_instances = /* @__PURE__ */ new WeakSet(), _BetaMessageStream_getFinalMessage = function _BetaMessageStream_getFinalMessage2() {
        if (this.receivedMessages.length === 0) {
          throw new AnthropicError("stream ended without producing a Message with role=assistant");
        }
        return this.receivedMessages.at(-1);
      }, _BetaMessageStream_getFinalText = function _BetaMessageStream_getFinalText2() {
        if (this.receivedMessages.length === 0) {
          throw new AnthropicError("stream ended without producing a Message with role=assistant");
        }
        const textBlocks = this.receivedMessages.at(-1).content.filter((block) => block.type === "text").map((block) => block.text);
        if (textBlocks.length === 0) {
          throw new AnthropicError("stream ended without producing a content block with type=text");
        }
        return textBlocks.join(" ");
      }, _BetaMessageStream_beginRequest = function _BetaMessageStream_beginRequest2() {
        if (this.ended)
          return;
        __classPrivateFieldSet(this, _BetaMessageStream_currentMessageSnapshot, void 0, "f");
      }, _BetaMessageStream_addStreamEvent = function _BetaMessageStream_addStreamEvent2(event) {
        if (this.ended)
          return;
        const messageSnapshot = __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_accumulateMessage).call(this, event);
        this._emit("streamEvent", event, messageSnapshot);
        switch (event.type) {
          case "content_block_delta": {
            const content = messageSnapshot.content.at(-1);
            switch (event.delta.type) {
              case "text_delta": {
                if (content.type === "text") {
                  this._emit("text", event.delta.text, content.text || "");
                }
                break;
              }
              case "citations_delta": {
                if (content.type === "text") {
                  this._emit("citation", event.delta.citation, content.citations ?? []);
                }
                break;
              }
              case "input_json_delta": {
                if (tracksToolInput(content) && content.input) {
                  this._emit("inputJson", event.delta.partial_json, content.input);
                }
                break;
              }
              case "thinking_delta": {
                if (content.type === "thinking") {
                  this._emit("thinking", event.delta.thinking, content.thinking);
                }
                break;
              }
              case "signature_delta": {
                if (content.type === "thinking") {
                  this._emit("signature", content.signature);
                }
                break;
              }
              case "compaction_delta": {
                if (content.type === "compaction" && content.content) {
                  this._emit("compaction", content.content);
                }
                break;
              }
              default:
                checkNever(event.delta);
            }
            break;
          }
          case "message_stop": {
            this._addMessageParam(messageSnapshot);
            this._addMessage(maybeParseBetaMessage(messageSnapshot, __classPrivateFieldGet(this, _BetaMessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _BetaMessageStream_logger, "f") }), true);
            break;
          }
          case "content_block_stop": {
            this._emit("contentBlock", messageSnapshot.content.at(-1));
            break;
          }
          case "message_start": {
            __classPrivateFieldSet(this, _BetaMessageStream_currentMessageSnapshot, messageSnapshot, "f");
            break;
          }
          case "content_block_start":
          case "message_delta":
            break;
        }
      }, _BetaMessageStream_endRequest = function _BetaMessageStream_endRequest2() {
        if (this.ended) {
          throw new AnthropicError(`stream has ended, this shouldn't happen`);
        }
        const snapshot = __classPrivateFieldGet(this, _BetaMessageStream_currentMessageSnapshot, "f");
        if (!snapshot) {
          throw new AnthropicError(`request ended without sending any chunks`);
        }
        __classPrivateFieldSet(this, _BetaMessageStream_currentMessageSnapshot, void 0, "f");
        return maybeParseBetaMessage(snapshot, __classPrivateFieldGet(this, _BetaMessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _BetaMessageStream_logger, "f") });
      }, _BetaMessageStream_accumulateMessage = function _BetaMessageStream_accumulateMessage2(event) {
        let snapshot = __classPrivateFieldGet(this, _BetaMessageStream_currentMessageSnapshot, "f");
        if (event.type === "message_start") {
          if (snapshot) {
            throw new AnthropicError(`Unexpected event order, got ${event.type} before receiving "message_stop"`);
          }
          return event.message;
        }
        if (!snapshot) {
          throw new AnthropicError(`Unexpected event order, got ${event.type} before "message_start"`);
        }
        switch (event.type) {
          case "message_stop":
            return snapshot;
          case "message_delta":
            snapshot.container = event.delta.container;
            snapshot.stop_reason = event.delta.stop_reason;
            snapshot.stop_sequence = event.delta.stop_sequence;
            snapshot.usage.output_tokens = event.usage.output_tokens;
            snapshot.context_management = event.context_management;
            if (event.usage.input_tokens != null) {
              snapshot.usage.input_tokens = event.usage.input_tokens;
            }
            if (event.usage.cache_creation_input_tokens != null) {
              snapshot.usage.cache_creation_input_tokens = event.usage.cache_creation_input_tokens;
            }
            if (event.usage.cache_read_input_tokens != null) {
              snapshot.usage.cache_read_input_tokens = event.usage.cache_read_input_tokens;
            }
            if (event.usage.server_tool_use != null) {
              snapshot.usage.server_tool_use = event.usage.server_tool_use;
            }
            if (event.usage.iterations != null) {
              snapshot.usage.iterations = event.usage.iterations;
            }
            return snapshot;
          case "content_block_start":
            snapshot.content.push(event.content_block);
            return snapshot;
          case "content_block_delta": {
            const snapshotContent = snapshot.content.at(event.index);
            switch (event.delta.type) {
              case "text_delta": {
                if (snapshotContent?.type === "text") {
                  snapshot.content[event.index] = {
                    ...snapshotContent,
                    text: (snapshotContent.text || "") + event.delta.text
                  };
                }
                break;
              }
              case "citations_delta": {
                if (snapshotContent?.type === "text") {
                  snapshot.content[event.index] = {
                    ...snapshotContent,
                    citations: [...snapshotContent.citations ?? [], event.delta.citation]
                  };
                }
                break;
              }
              case "input_json_delta": {
                if (snapshotContent && tracksToolInput(snapshotContent)) {
                  let jsonBuf = snapshotContent[JSON_BUF_PROPERTY] || "";
                  jsonBuf += event.delta.partial_json;
                  const newContent = { ...snapshotContent };
                  Object.defineProperty(newContent, JSON_BUF_PROPERTY, {
                    value: jsonBuf,
                    enumerable: false,
                    writable: true
                  });
                  if (jsonBuf) {
                    try {
                      newContent.input = partialParse(jsonBuf);
                    } catch (err) {
                      const error = new AnthropicError(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${err}. JSON: ${jsonBuf}`);
                      __classPrivateFieldGet(this, _BetaMessageStream_handleError, "f").call(this, error);
                    }
                  }
                  snapshot.content[event.index] = newContent;
                }
                break;
              }
              case "thinking_delta": {
                if (snapshotContent?.type === "thinking") {
                  snapshot.content[event.index] = {
                    ...snapshotContent,
                    thinking: snapshotContent.thinking + event.delta.thinking
                  };
                }
                break;
              }
              case "signature_delta": {
                if (snapshotContent?.type === "thinking") {
                  snapshot.content[event.index] = {
                    ...snapshotContent,
                    signature: event.delta.signature
                  };
                }
                break;
              }
              case "compaction_delta": {
                if (snapshotContent?.type === "compaction") {
                  snapshot.content[event.index] = {
                    ...snapshotContent,
                    content: (snapshotContent.content || "") + event.delta.content
                  };
                }
                break;
              }
              default:
                checkNever(event.delta);
            }
            return snapshot;
          }
          case "content_block_stop":
            return snapshot;
        }
      }, Symbol.asyncIterator)]() {
        const pushQueue = [];
        const readQueue = [];
        let done = false;
        this.on("streamEvent", (event) => {
          const reader = readQueue.shift();
          if (reader) {
            reader.resolve(event);
          } else {
            pushQueue.push(event);
          }
        });
        this.on("end", () => {
          done = true;
          for (const reader of readQueue) {
            reader.resolve(void 0);
          }
          readQueue.length = 0;
        });
        this.on("abort", (err) => {
          done = true;
          for (const reader of readQueue) {
            reader.reject(err);
          }
          readQueue.length = 0;
        });
        this.on("error", (err) => {
          done = true;
          for (const reader of readQueue) {
            reader.reject(err);
          }
          readQueue.length = 0;
        });
        return {
          next: async () => {
            if (!pushQueue.length) {
              if (done) {
                return { value: void 0, done: true };
              }
              return new Promise((resolve2, reject) => readQueue.push({ resolve: resolve2, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: void 0, done: true });
            }
            const chunk = pushQueue.shift();
            return { value: chunk, done: false };
          },
          return: async () => {
            this.abort();
            return { value: void 0, done: true };
          }
        };
      }
      toReadableStream() {
        const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
        return stream.toReadableStream();
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/lib/tools/ToolError.mjs
var ToolError;
var init_ToolError = __esm({
  "node_modules/@anthropic-ai/sdk/lib/tools/ToolError.mjs"() {
    ToolError = class extends Error {
      constructor(content) {
        const message = typeof content === "string" ? content : content.map((block) => {
          if (block.type === "text")
            return block.text;
          return `[${block.type}]`;
        }).join(" ");
        super(message);
        this.name = "ToolError";
        this.content = content;
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/lib/tools/CompactionControl.mjs
var DEFAULT_TOKEN_THRESHOLD, DEFAULT_SUMMARY_PROMPT;
var init_CompactionControl = __esm({
  "node_modules/@anthropic-ai/sdk/lib/tools/CompactionControl.mjs"() {
    DEFAULT_TOKEN_THRESHOLD = 1e5;
    DEFAULT_SUMMARY_PROMPT = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
1. Task Overview
The user's core request and success criteria
Any clarifications or constraints they specified
2. Current State
What has been completed so far
Files created, modified, or analyzed (with paths if relevant)
Key outputs or artifacts produced
3. Important Discoveries
Technical constraints or requirements uncovered
Decisions made and their rationale
Errors encountered and how they were resolved
What approaches were tried that didn't work (and why)
4. Next Steps
Specific actions needed to complete the task
Any blockers or open questions to resolve
Priority order if multiple steps remain
5. Context to Preserve
User preferences or style requirements
Domain-specific details that aren't obvious
Any promises made to the user
Be concise but complete\u2014err on the side of including information that would prevent duplicate work or repeated mistakes. Write in a way that enables immediate resumption of the task.
Wrap your summary in <summary></summary> tags.`;
  }
});

// node_modules/@anthropic-ai/sdk/lib/tools/BetaToolRunner.mjs
function promiseWithResolvers() {
  let resolve2;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve2 = res;
    reject = rej;
  });
  return { promise, resolve: resolve2, reject };
}
async function generateToolResponse(params, lastMessage = params.messages.at(-1), requestOptions) {
  if (!lastMessage || lastMessage.role !== "assistant" || !lastMessage.content || typeof lastMessage.content === "string") {
    return null;
  }
  const toolUseBlocks = lastMessage.content.filter((content) => content.type === "tool_use");
  if (toolUseBlocks.length === 0) {
    return null;
  }
  const toolResults = await Promise.all(toolUseBlocks.map(async (toolUse) => {
    const tool = params.tools.find((t) => ("name" in t ? t.name : t.mcp_server_name) === toolUse.name);
    if (!tool || !("run" in tool)) {
      return {
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: `Error: Tool '${toolUse.name}' not found`,
        is_error: true
      };
    }
    try {
      let input = toolUse.input;
      if ("parse" in tool && tool.parse) {
        input = tool.parse(input);
      }
      const result = await tool.run(input, {
        toolUseBlock: toolUse,
        signal: requestOptions?.signal
      });
      return {
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: result
      };
    } catch (error) {
      return {
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: error instanceof ToolError ? error.content : `Error: ${error instanceof Error ? error.message : String(error)}`,
        is_error: true
      };
    }
  }));
  return {
    role: "user",
    content: toolResults
  };
}
var _BetaToolRunner_instances, _BetaToolRunner_consumed, _BetaToolRunner_mutated, _BetaToolRunner_state, _BetaToolRunner_options, _BetaToolRunner_message, _BetaToolRunner_toolResponse, _BetaToolRunner_completion, _BetaToolRunner_iterationCount, _BetaToolRunner_checkAndCompact, _BetaToolRunner_generateToolResponse, BetaToolRunner;
var init_BetaToolRunner = __esm({
  "node_modules/@anthropic-ai/sdk/lib/tools/BetaToolRunner.mjs"() {
    init_tslib();
    init_ToolError();
    init_error();
    init_headers();
    init_CompactionControl();
    init_stainless_helper_header();
    BetaToolRunner = class {
      constructor(client, params, options) {
        _BetaToolRunner_instances.add(this);
        this.client = client;
        _BetaToolRunner_consumed.set(this, false);
        _BetaToolRunner_mutated.set(this, false);
        _BetaToolRunner_state.set(this, void 0);
        _BetaToolRunner_options.set(this, void 0);
        _BetaToolRunner_message.set(this, void 0);
        _BetaToolRunner_toolResponse.set(this, void 0);
        _BetaToolRunner_completion.set(this, void 0);
        _BetaToolRunner_iterationCount.set(this, 0);
        __classPrivateFieldSet(this, _BetaToolRunner_state, {
          params: {
            // You can't clone the entire params since there are functions as handlers.
            // You also don't really need to clone params.messages, but it probably will prevent a foot gun
            // somewhere.
            ...params,
            messages: structuredClone(params.messages)
          }
        }, "f");
        const helpers = collectStainlessHelpers(params.tools, params.messages);
        const helperValue = ["BetaToolRunner", ...helpers].join(", ");
        __classPrivateFieldSet(this, _BetaToolRunner_options, {
          ...options,
          headers: buildHeaders([{ "x-stainless-helper": helperValue }, options?.headers])
        }, "f");
        __classPrivateFieldSet(this, _BetaToolRunner_completion, promiseWithResolvers(), "f");
        if (params.compactionControl?.enabled) {
          console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
        }
      }
      async *[(_BetaToolRunner_consumed = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_mutated = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_state = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_options = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_message = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_toolResponse = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_completion = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_iterationCount = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_instances = /* @__PURE__ */ new WeakSet(), _BetaToolRunner_checkAndCompact = async function _BetaToolRunner_checkAndCompact2() {
        const compactionControl = __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.compactionControl;
        if (!compactionControl || !compactionControl.enabled) {
          return false;
        }
        let tokensUsed = 0;
        if (__classPrivateFieldGet(this, _BetaToolRunner_message, "f") !== void 0) {
          try {
            const message = await __classPrivateFieldGet(this, _BetaToolRunner_message, "f");
            const totalInputTokens = message.usage.input_tokens + (message.usage.cache_creation_input_tokens ?? 0) + (message.usage.cache_read_input_tokens ?? 0);
            tokensUsed = totalInputTokens + message.usage.output_tokens;
          } catch {
            return false;
          }
        }
        const threshold = compactionControl.contextTokenThreshold ?? DEFAULT_TOKEN_THRESHOLD;
        if (tokensUsed < threshold) {
          return false;
        }
        const model = compactionControl.model ?? __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.model;
        const summaryPrompt = compactionControl.summaryPrompt ?? DEFAULT_SUMMARY_PROMPT;
        const messages2 = __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages;
        if (messages2[messages2.length - 1].role === "assistant") {
          const lastMessage = messages2[messages2.length - 1];
          if (Array.isArray(lastMessage.content)) {
            const nonToolBlocks = lastMessage.content.filter((block) => block.type !== "tool_use");
            if (nonToolBlocks.length === 0) {
              messages2.pop();
            } else {
              lastMessage.content = nonToolBlocks;
            }
          }
        }
        const response = await this.client.beta.messages.create({
          model,
          messages: [
            ...messages2,
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: summaryPrompt
                }
              ]
            }
          ],
          max_tokens: __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.max_tokens
        }, {
          signal: __classPrivateFieldGet(this, _BetaToolRunner_options, "f").signal,
          headers: buildHeaders([__classPrivateFieldGet(this, _BetaToolRunner_options, "f").headers, { "x-stainless-helper": "compaction" }])
        });
        if (response.content[0]?.type !== "text") {
          throw new AnthropicError("Expected text response for compaction");
        }
        __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages = [
          {
            role: "user",
            content: response.content
          }
        ];
        return true;
      }, Symbol.asyncIterator)]() {
        var _a2;
        if (__classPrivateFieldGet(this, _BetaToolRunner_consumed, "f")) {
          throw new AnthropicError("Cannot iterate over a consumed stream");
        }
        __classPrivateFieldSet(this, _BetaToolRunner_consumed, true, "f");
        __classPrivateFieldSet(this, _BetaToolRunner_mutated, true, "f");
        __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, void 0, "f");
        try {
          while (true) {
            let stream;
            try {
              if (__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.max_iterations && __classPrivateFieldGet(this, _BetaToolRunner_iterationCount, "f") >= __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.max_iterations) {
                break;
              }
              __classPrivateFieldSet(this, _BetaToolRunner_mutated, false, "f");
              __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, void 0, "f");
              __classPrivateFieldSet(this, _BetaToolRunner_iterationCount, (_a2 = __classPrivateFieldGet(this, _BetaToolRunner_iterationCount, "f"), _a2++, _a2), "f");
              __classPrivateFieldSet(this, _BetaToolRunner_message, void 0, "f");
              const { max_iterations, compactionControl, ...params } = __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params;
              if (params.stream) {
                stream = this.client.beta.messages.stream({ ...params }, __classPrivateFieldGet(this, _BetaToolRunner_options, "f"));
                __classPrivateFieldSet(this, _BetaToolRunner_message, stream.finalMessage(), "f");
                __classPrivateFieldGet(this, _BetaToolRunner_message, "f").catch(() => {
                });
                yield stream;
              } else {
                __classPrivateFieldSet(this, _BetaToolRunner_message, this.client.beta.messages.create({ ...params, stream: false }, __classPrivateFieldGet(this, _BetaToolRunner_options, "f")), "f");
                yield __classPrivateFieldGet(this, _BetaToolRunner_message, "f");
              }
              const isCompacted = await __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_checkAndCompact).call(this);
              if (!isCompacted) {
                if (!__classPrivateFieldGet(this, _BetaToolRunner_mutated, "f")) {
                  const { role, content } = await __classPrivateFieldGet(this, _BetaToolRunner_message, "f");
                  __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.push({ role, content });
                }
                const toolMessage = await __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_generateToolResponse).call(this, __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.at(-1));
                if (toolMessage) {
                  __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.push(toolMessage);
                } else if (!__classPrivateFieldGet(this, _BetaToolRunner_mutated, "f")) {
                  break;
                }
              }
            } finally {
              if (stream) {
                stream.abort();
              }
            }
          }
          if (!__classPrivateFieldGet(this, _BetaToolRunner_message, "f")) {
            throw new AnthropicError("ToolRunner concluded without a message from the server");
          }
          __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").resolve(await __classPrivateFieldGet(this, _BetaToolRunner_message, "f"));
        } catch (error) {
          __classPrivateFieldSet(this, _BetaToolRunner_consumed, false, "f");
          __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").promise.catch(() => {
          });
          __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").reject(error);
          __classPrivateFieldSet(this, _BetaToolRunner_completion, promiseWithResolvers(), "f");
          throw error;
        }
      }
      setMessagesParams(paramsOrMutator) {
        if (typeof paramsOrMutator === "function") {
          __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params = paramsOrMutator(__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params);
        } else {
          __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params = paramsOrMutator;
        }
        __classPrivateFieldSet(this, _BetaToolRunner_mutated, true, "f");
        __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, void 0, "f");
      }
      setRequestOptions(optionsOrMutator) {
        if (typeof optionsOrMutator === "function") {
          __classPrivateFieldSet(this, _BetaToolRunner_options, optionsOrMutator(__classPrivateFieldGet(this, _BetaToolRunner_options, "f")), "f");
        } else {
          __classPrivateFieldSet(this, _BetaToolRunner_options, { ...__classPrivateFieldGet(this, _BetaToolRunner_options, "f"), ...optionsOrMutator }, "f");
        }
      }
      /**
       * Get the tool response for the last message from the assistant.
       * Avoids redundant tool executions by caching results.
       *
       * @returns A promise that resolves to a BetaMessageParam containing tool results, or null if no tools need to be executed
       *
       * @example
       * const toolResponse = await runner.generateToolResponse();
       * if (toolResponse) {
       *   console.log('Tool results:', toolResponse.content);
       * }
       */
      async generateToolResponse(signal = __classPrivateFieldGet(this, _BetaToolRunner_options, "f").signal) {
        const message = await __classPrivateFieldGet(this, _BetaToolRunner_message, "f") ?? this.params.messages.at(-1);
        if (!message) {
          return null;
        }
        return __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_generateToolResponse).call(this, message, signal);
      }
      /**
       * Wait for the async iterator to complete. This works even if the async iterator hasn't yet started, and
       * will wait for an instance to start and go to completion.
       *
       * @returns A promise that resolves to the final BetaMessage when the iterator completes
       *
       * @example
       * // Start consuming the iterator
       * for await (const message of runner) {
       *   console.log('Message:', message.content);
       * }
       *
       * // Meanwhile, wait for completion from another part of the code
       * const finalMessage = await runner.done();
       * console.log('Final response:', finalMessage.content);
       */
      done() {
        return __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").promise;
      }
      /**
       * Returns a promise indicating that the stream is done. Unlike .done(), this will eagerly read the stream:
       * * If the iterator has not been consumed, consume the entire iterator and return the final message from the
       * assistant.
       * * If the iterator has been consumed, waits for it to complete and returns the final message.
       *
       * @returns A promise that resolves to the final BetaMessage from the conversation
       * @throws {AnthropicError} If no messages were processed during the conversation
       *
       * @example
       * const finalMessage = await runner.runUntilDone();
       * console.log('Final response:', finalMessage.content);
       */
      async runUntilDone() {
        if (!__classPrivateFieldGet(this, _BetaToolRunner_consumed, "f")) {
          for await (const _ of this) {
          }
        }
        return this.done();
      }
      /**
       * Get the current parameters being used by the ToolRunner.
       *
       * @returns A readonly view of the current ToolRunnerParams
       *
       * @example
       * const currentParams = runner.params;
       * console.log('Current model:', currentParams.model);
       * console.log('Message count:', currentParams.messages.length);
       */
      get params() {
        return __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params;
      }
      /**
       * Add one or more messages to the conversation history.
       *
       * @param messages - One or more BetaMessageParam objects to add to the conversation
       *
       * @example
       * runner.pushMessages(
       *   { role: 'user', content: 'Also, what about the weather in NYC?' }
       * );
       *
       * @example
       * // Adding multiple messages
       * runner.pushMessages(
       *   { role: 'user', content: 'What about NYC?' },
       *   { role: 'user', content: 'And Boston?' }
       * );
       */
      pushMessages(...messages2) {
        this.setMessagesParams((params) => ({
          ...params,
          messages: [...params.messages, ...messages2]
        }));
      }
      /**
       * Makes the ToolRunner directly awaitable, equivalent to calling .runUntilDone()
       * This allows using `await runner` instead of `await runner.runUntilDone()`
       */
      then(onfulfilled, onrejected) {
        return this.runUntilDone().then(onfulfilled, onrejected);
      }
    };
    _BetaToolRunner_generateToolResponse = async function _BetaToolRunner_generateToolResponse2(lastMessage, signal = __classPrivateFieldGet(this, _BetaToolRunner_options, "f").signal) {
      if (__classPrivateFieldGet(this, _BetaToolRunner_toolResponse, "f") !== void 0) {
        return __classPrivateFieldGet(this, _BetaToolRunner_toolResponse, "f");
      }
      __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, generateToolResponse(__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params, lastMessage, {
        ...__classPrivateFieldGet(this, _BetaToolRunner_options, "f"),
        signal
      }), "f");
      return __classPrivateFieldGet(this, _BetaToolRunner_toolResponse, "f");
    };
  }
});

// node_modules/@anthropic-ai/sdk/internal/decoders/jsonl.mjs
var JSONLDecoder;
var init_jsonl = __esm({
  "node_modules/@anthropic-ai/sdk/internal/decoders/jsonl.mjs"() {
    init_error();
    init_shims();
    init_line();
    JSONLDecoder = class _JSONLDecoder {
      constructor(iterator, controller) {
        this.iterator = iterator;
        this.controller = controller;
      }
      async *decoder() {
        const lineDecoder = new LineDecoder();
        for await (const chunk of this.iterator) {
          for (const line of lineDecoder.decode(chunk)) {
            yield JSON.parse(line);
          }
        }
        for (const line of lineDecoder.flush()) {
          yield JSON.parse(line);
        }
      }
      [Symbol.asyncIterator]() {
        return this.decoder();
      }
      static fromResponse(response, controller) {
        if (!response.body) {
          controller.abort();
          if (typeof globalThis.navigator !== "undefined" && globalThis.navigator.product === "ReactNative") {
            throw new AnthropicError(`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
          }
          throw new AnthropicError(`Attempted to iterate over a response with no body`);
        }
        return new _JSONLDecoder(ReadableStreamToAsyncIterable(response.body), controller);
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/resources/beta/messages/batches.mjs
var Batches;
var init_batches = __esm({
  "node_modules/@anthropic-ai/sdk/resources/beta/messages/batches.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_jsonl();
    init_error2();
    init_path();
    Batches = class extends APIResource {
      /**
       * Send a batch of Message creation requests.
       *
       * The Message Batches API can be used to process multiple Messages API requests at
       * once. Once a Message Batch is created, it begins processing immediately. Batches
       * can take up to 24 hours to complete.
       *
       * Learn more about the Message Batches API in our
       * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
       *
       * @example
       * ```ts
       * const betaMessageBatch =
       *   await client.beta.messages.batches.create({
       *     requests: [
       *       {
       *         custom_id: 'my-custom-id-1',
       *         params: {
       *           max_tokens: 1024,
       *           messages: [
       *             { content: 'Hello, world', role: 'user' },
       *           ],
       *           model: 'claude-opus-4-6',
       *         },
       *       },
       *     ],
       *   });
       * ```
       */
      create(params, options) {
        const { betas, ...body } = params;
        return this._client.post("/v1/messages/batches?beta=true", {
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * This endpoint is idempotent and can be used to poll for Message Batch
       * completion. To access the results of a Message Batch, make a request to the
       * `results_url` field in the response.
       *
       * Learn more about the Message Batches API in our
       * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
       *
       * @example
       * ```ts
       * const betaMessageBatch =
       *   await client.beta.messages.batches.retrieve(
       *     'message_batch_id',
       *   );
       * ```
       */
      retrieve(messageBatchID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path3`/v1/messages/batches/${messageBatchID}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * List all Message Batches within a Workspace. Most recently created batches are
       * returned first.
       *
       * Learn more about the Message Batches API in our
       * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const betaMessageBatch of client.beta.messages.batches.list()) {
       *   // ...
       * }
       * ```
       */
      list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList("/v1/messages/batches?beta=true", Page, {
          query,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Delete a Message Batch.
       *
       * Message Batches can only be deleted once they've finished processing. If you'd
       * like to delete an in-progress batch, you must first cancel it.
       *
       * Learn more about the Message Batches API in our
       * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
       *
       * @example
       * ```ts
       * const betaDeletedMessageBatch =
       *   await client.beta.messages.batches.delete(
       *     'message_batch_id',
       *   );
       * ```
       */
      delete(messageBatchID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(path3`/v1/messages/batches/${messageBatchID}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Batches may be canceled any time before processing ends. Once cancellation is
       * initiated, the batch enters a `canceling` state, at which time the system may
       * complete any in-progress, non-interruptible requests before finalizing
       * cancellation.
       *
       * The number of canceled requests is specified in `request_counts`. To determine
       * which requests were canceled, check the individual results within the batch.
       * Note that cancellation may not result in any canceled requests if they were
       * non-interruptible.
       *
       * Learn more about the Message Batches API in our
       * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
       *
       * @example
       * ```ts
       * const betaMessageBatch =
       *   await client.beta.messages.batches.cancel(
       *     'message_batch_id',
       *   );
       * ```
       */
      cancel(messageBatchID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(path3`/v1/messages/batches/${messageBatchID}/cancel?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Streams the results of a Message Batch as a `.jsonl` file.
       *
       * Each line in the file is a JSON object containing the result of a single request
       * in the Message Batch. Results are not guaranteed to be in the same order as
       * requests. Use the `custom_id` field to match results to requests.
       *
       * Learn more about the Message Batches API in our
       * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
       *
       * @example
       * ```ts
       * const betaMessageBatchIndividualResponse =
       *   await client.beta.messages.batches.results(
       *     'message_batch_id',
       *   );
       * ```
       */
      async results(messageBatchID, params = {}, options) {
        const batch = await this.retrieve(messageBatchID);
        if (!batch.results_url) {
          throw new AnthropicError(`No batch \`results_url\`; Has it finished processing? ${batch.processing_status} - ${batch.id}`);
        }
        const { betas } = params ?? {};
        return this._client.get(batch.results_url, {
          ...options,
          headers: buildHeaders([
            {
              "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString(),
              Accept: "application/binary"
            },
            options?.headers
          ]),
          stream: true,
          __binaryResponse: true
        })._thenUnwrap((_, props) => JSONLDecoder.fromResponse(props.response, props.controller));
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/resources/beta/messages/messages.mjs
function transformOutputFormat(params) {
  if (!params.output_format) {
    return params;
  }
  if (params.output_config?.format) {
    throw new AnthropicError("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  }
  const { output_format, ...rest } = params;
  return {
    ...rest,
    output_config: {
      ...params.output_config,
      format: output_format
    }
  };
}
var DEPRECATED_MODELS, MODELS_TO_WARN_WITH_THINKING_ENABLED, Messages;
var init_messages = __esm({
  "node_modules/@anthropic-ai/sdk/resources/beta/messages/messages.mjs"() {
    init_error2();
    init_resource();
    init_constants();
    init_headers();
    init_stainless_helper_header();
    init_beta_parser();
    init_BetaMessageStream();
    init_BetaToolRunner();
    init_ToolError();
    init_batches();
    init_batches();
    init_BetaToolRunner();
    init_ToolError();
    DEPRECATED_MODELS = {
      "claude-1.3": "November 6th, 2024",
      "claude-1.3-100k": "November 6th, 2024",
      "claude-instant-1.1": "November 6th, 2024",
      "claude-instant-1.1-100k": "November 6th, 2024",
      "claude-instant-1.2": "November 6th, 2024",
      "claude-3-sonnet-20240229": "July 21st, 2025",
      "claude-3-opus-20240229": "January 5th, 2026",
      "claude-2.1": "July 21st, 2025",
      "claude-2.0": "July 21st, 2025",
      "claude-3-7-sonnet-latest": "February 19th, 2026",
      "claude-3-7-sonnet-20250219": "February 19th, 2026"
    };
    MODELS_TO_WARN_WITH_THINKING_ENABLED = ["claude-opus-4-6"];
    Messages = class extends APIResource {
      constructor() {
        super(...arguments);
        this.batches = new Batches(this._client);
      }
      create(params, options) {
        const modifiedParams = transformOutputFormat(params);
        const { betas, ...body } = modifiedParams;
        if (body.model in DEPRECATED_MODELS) {
          console.warn(`The model '${body.model}' is deprecated and will reach end-of-life on ${DEPRECATED_MODELS[body.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
        }
        if (body.model in MODELS_TO_WARN_WITH_THINKING_ENABLED && body.thinking && body.thinking.type === "enabled") {
          console.warn(`Using Claude with ${body.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
        }
        let timeout = this._client._options.timeout;
        if (!body.stream && timeout == null) {
          const maxNonstreamingTokens = MODEL_NONSTREAMING_TOKENS[body.model] ?? void 0;
          timeout = this._client.calculateNonstreamingTimeout(body.max_tokens, maxNonstreamingTokens);
        }
        const helperHeader = stainlessHelperHeader(body.tools, body.messages);
        return this._client.post("/v1/messages?beta=true", {
          body,
          timeout: timeout ?? 6e5,
          ...options,
          headers: buildHeaders([
            { ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 },
            helperHeader,
            options?.headers
          ]),
          stream: modifiedParams.stream ?? false
        });
      }
      /**
       * Send a structured list of input messages with text and/or image content, along with an expected `output_format` and
       * the response will be automatically parsed and available in the `parsed_output` property of the message.
       *
       * @example
       * ```ts
       * const message = await client.beta.messages.parse({
       *   model: 'claude-3-5-sonnet-20241022',
       *   max_tokens: 1024,
       *   messages: [{ role: 'user', content: 'What is 2+2?' }],
       *   output_format: zodOutputFormat(z.object({ answer: z.number() }), 'math'),
       * });
       *
       * console.log(message.parsed_output?.answer); // 4
       * ```
       */
      parse(params, options) {
        options = {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...params.betas ?? [], "structured-outputs-2025-12-15"].toString() },
            options?.headers
          ])
        };
        return this.create(params, options).then((message) => parseBetaMessage(message, params, { logger: this._client.logger ?? console }));
      }
      /**
       * Create a Message stream
       */
      stream(body, options) {
        return BetaMessageStream.createMessage(this, body, options);
      }
      /**
       * Count the number of tokens in a Message.
       *
       * The Token Count API can be used to count the number of tokens in a Message,
       * including tools, images, and documents, without creating it.
       *
       * Learn more about token counting in our
       * [user guide](https://docs.claude.com/en/docs/build-with-claude/token-counting)
       *
       * @example
       * ```ts
       * const betaMessageTokensCount =
       *   await client.beta.messages.countTokens({
       *     messages: [{ content: 'Hello, world', role: 'user' }],
       *     model: 'claude-opus-4-6',
       *   });
       * ```
       */
      countTokens(params, options) {
        const modifiedParams = transformOutputFormat(params);
        const { betas, ...body } = modifiedParams;
        return this._client.post("/v1/messages/count_tokens?beta=true", {
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "token-counting-2024-11-01"].toString() },
            options?.headers
          ])
        });
      }
      toolRunner(body, options) {
        return new BetaToolRunner(this._client, body, options);
      }
    };
    Messages.Batches = Batches;
    Messages.BetaToolRunner = BetaToolRunner;
    Messages.ToolError = ToolError;
  }
});

// node_modules/@anthropic-ai/sdk/resources/beta/sessions/events.mjs
var Events;
var init_events = __esm({
  "node_modules/@anthropic-ai/sdk/resources/beta/sessions/events.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_path();
    Events = class extends APIResource {
      /**
       * List Events
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const betaManagedAgentsSessionEvent of client.beta.sessions.events.list(
       *   'sesn_011CZkZAtmR3yMPDzynEDxu7',
       * )) {
       *   // ...
       * }
       * ```
       */
      list(sessionID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path3`/v1/sessions/${sessionID}/events?beta=true`, PageCursor, {
          query,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Send Events
       *
       * @example
       * ```ts
       * const betaManagedAgentsSendSessionEvents =
       *   await client.beta.sessions.events.send(
       *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
       *     {
       *       events: [
       *         {
       *           content: [
       *             {
       *               text: 'Where is my order #1234?',
       *               type: 'text',
       *             },
       *           ],
       *           type: 'user.message',
       *         },
       *       ],
       *     },
       *   );
       * ```
       */
      send(sessionID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path3`/v1/sessions/${sessionID}/events?beta=true`, {
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Stream Events
       *
       * @example
       * ```ts
       * const betaManagedAgentsStreamSessionEvents =
       *   await client.beta.sessions.events.stream(
       *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
       *   );
       * ```
       */
      stream(sessionID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path3`/v1/sessions/${sessionID}/events/stream?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ]),
          stream: true
        });
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/resources/beta/sessions/resources.mjs
var Resources;
var init_resources = __esm({
  "node_modules/@anthropic-ai/sdk/resources/beta/sessions/resources.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_path();
    Resources = class extends APIResource {
      /**
       * Get Session Resource
       *
       * @example
       * ```ts
       * const resource =
       *   await client.beta.sessions.resources.retrieve(
       *     'sesrsc_011CZkZBJq5dWxk9fVLNcPht',
       *     { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
       *   );
       * ```
       */
      retrieve(resourceID, params, options) {
        const { session_id, betas } = params;
        return this._client.get(path3`/v1/sessions/${session_id}/resources/${resourceID}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Update Session Resource
       *
       * @example
       * ```ts
       * const resource =
       *   await client.beta.sessions.resources.update(
       *     'sesrsc_011CZkZBJq5dWxk9fVLNcPht',
       *     {
       *       session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7',
       *       authorization_token: 'ghp_exampletoken',
       *     },
       *   );
       * ```
       */
      update(resourceID, params, options) {
        const { session_id, betas, ...body } = params;
        return this._client.post(path3`/v1/sessions/${session_id}/resources/${resourceID}?beta=true`, {
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * List Session Resources
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const betaManagedAgentsSessionResource of client.beta.sessions.resources.list(
       *   'sesn_011CZkZAtmR3yMPDzynEDxu7',
       * )) {
       *   // ...
       * }
       * ```
       */
      list(sessionID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path3`/v1/sessions/${sessionID}/resources?beta=true`, PageCursor, {
          query,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Delete Session Resource
       *
       * @example
       * ```ts
       * const betaManagedAgentsDeleteSessionResource =
       *   await client.beta.sessions.resources.delete(
       *     'sesrsc_011CZkZBJq5dWxk9fVLNcPht',
       *     { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
       *   );
       * ```
       */
      delete(resourceID, params, options) {
        const { session_id, betas } = params;
        return this._client.delete(path3`/v1/sessions/${session_id}/resources/${resourceID}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Add Session Resource
       *
       * @example
       * ```ts
       * const betaManagedAgentsFileResource =
       *   await client.beta.sessions.resources.add(
       *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
       *     {
       *       file_id: 'file_011CNha8iCJcU1wXNR6q4V8w',
       *       type: 'file',
       *     },
       *   );
       * ```
       */
      add(sessionID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path3`/v1/sessions/${sessionID}/resources?beta=true`, {
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/resources/beta/sessions/sessions.mjs
var Sessions;
var init_sessions = __esm({
  "node_modules/@anthropic-ai/sdk/resources/beta/sessions/sessions.mjs"() {
    init_resource();
    init_events();
    init_events();
    init_resources();
    init_resources();
    init_pagination();
    init_headers();
    init_path();
    Sessions = class extends APIResource {
      constructor() {
        super(...arguments);
        this.events = new Events(this._client);
        this.resources = new Resources(this._client);
      }
      /**
       * Create Session
       *
       * @example
       * ```ts
       * const betaManagedAgentsSession =
       *   await client.beta.sessions.create({
       *     agent: 'agent_011CZkYpogX7uDKUyvBTophP',
       *     environment_id: 'env_011CZkZ9X2dpNyB7HsEFoRfW',
       *   });
       * ```
       */
      create(params, options) {
        const { betas, ...body } = params;
        return this._client.post("/v1/sessions?beta=true", {
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Get Session
       *
       * @example
       * ```ts
       * const betaManagedAgentsSession =
       *   await client.beta.sessions.retrieve(
       *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
       *   );
       * ```
       */
      retrieve(sessionID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path3`/v1/sessions/${sessionID}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Update Session
       *
       * @example
       * ```ts
       * const betaManagedAgentsSession =
       *   await client.beta.sessions.update(
       *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
       *   );
       * ```
       */
      update(sessionID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path3`/v1/sessions/${sessionID}?beta=true`, {
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * List Sessions
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const betaManagedAgentsSession of client.beta.sessions.list()) {
       *   // ...
       * }
       * ```
       */
      list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList("/v1/sessions?beta=true", PageCursor, {
          query,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Delete Session
       *
       * @example
       * ```ts
       * const betaManagedAgentsDeletedSession =
       *   await client.beta.sessions.delete(
       *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
       *   );
       * ```
       */
      delete(sessionID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(path3`/v1/sessions/${sessionID}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Archive Session
       *
       * @example
       * ```ts
       * const betaManagedAgentsSession =
       *   await client.beta.sessions.archive(
       *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
       *   );
       * ```
       */
      archive(sessionID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(path3`/v1/sessions/${sessionID}/archive?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
    };
    Sessions.Events = Events;
    Sessions.Resources = Resources;
  }
});

// node_modules/@anthropic-ai/sdk/resources/beta/skills/versions.mjs
var Versions2;
var init_versions2 = __esm({
  "node_modules/@anthropic-ai/sdk/resources/beta/skills/versions.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_uploads();
    init_path();
    Versions2 = class extends APIResource {
      /**
       * Create Skill Version
       *
       * @example
       * ```ts
       * const version = await client.beta.skills.versions.create(
       *   'skill_id',
       * );
       * ```
       */
      create(skillID, params = {}, options) {
        const { betas, ...body } = params ?? {};
        return this._client.post(path3`/v1/skills/${skillID}/versions?beta=true`, multipartFormRequestOptions({
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() },
            options?.headers
          ])
        }, this._client));
      }
      /**
       * Get Skill Version
       *
       * @example
       * ```ts
       * const version = await client.beta.skills.versions.retrieve(
       *   'version',
       *   { skill_id: 'skill_id' },
       * );
       * ```
       */
      retrieve(version, params, options) {
        const { skill_id, betas } = params;
        return this._client.get(path3`/v1/skills/${skill_id}/versions/${version}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * List Skill Versions
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const versionListResponse of client.beta.skills.versions.list(
       *   'skill_id',
       * )) {
       *   // ...
       * }
       * ```
       */
      list(skillID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path3`/v1/skills/${skillID}/versions?beta=true`, PageCursor, {
          query,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Delete Skill Version
       *
       * @example
       * ```ts
       * const version = await client.beta.skills.versions.delete(
       *   'version',
       *   { skill_id: 'skill_id' },
       * );
       * ```
       */
      delete(version, params, options) {
        const { skill_id, betas } = params;
        return this._client.delete(path3`/v1/skills/${skill_id}/versions/${version}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() },
            options?.headers
          ])
        });
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/resources/beta/skills/skills.mjs
var Skills;
var init_skills = __esm({
  "node_modules/@anthropic-ai/sdk/resources/beta/skills/skills.mjs"() {
    init_resource();
    init_versions2();
    init_versions2();
    init_pagination();
    init_headers();
    init_uploads();
    init_path();
    Skills = class extends APIResource {
      constructor() {
        super(...arguments);
        this.versions = new Versions2(this._client);
      }
      /**
       * Create Skill
       *
       * @example
       * ```ts
       * const skill = await client.beta.skills.create();
       * ```
       */
      create(params = {}, options) {
        const { betas, ...body } = params ?? {};
        return this._client.post("/v1/skills?beta=true", multipartFormRequestOptions({
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() },
            options?.headers
          ])
        }, this._client, false));
      }
      /**
       * Get Skill
       *
       * @example
       * ```ts
       * const skill = await client.beta.skills.retrieve('skill_id');
       * ```
       */
      retrieve(skillID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path3`/v1/skills/${skillID}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * List Skills
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const skillListResponse of client.beta.skills.list()) {
       *   // ...
       * }
       * ```
       */
      list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList("/v1/skills?beta=true", PageCursor, {
          query,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Delete Skill
       *
       * @example
       * ```ts
       * const skill = await client.beta.skills.delete('skill_id');
       * ```
       */
      delete(skillID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(path3`/v1/skills/${skillID}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() },
            options?.headers
          ])
        });
      }
    };
    Skills.Versions = Versions2;
  }
});

// node_modules/@anthropic-ai/sdk/resources/beta/vaults/credentials.mjs
var Credentials;
var init_credentials = __esm({
  "node_modules/@anthropic-ai/sdk/resources/beta/vaults/credentials.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_path();
    Credentials = class extends APIResource {
      /**
       * Create Credential
       *
       * @example
       * ```ts
       * const betaManagedAgentsCredential =
       *   await client.beta.vaults.credentials.create(
       *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
       *     {
       *       auth: {
       *         token: 'bearer_exampletoken',
       *         mcp_server_url:
       *           'https://example-server.modelcontextprotocol.io/sse',
       *         type: 'static_bearer',
       *       },
       *     },
       *   );
       * ```
       */
      create(vaultID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path3`/v1/vaults/${vaultID}/credentials?beta=true`, {
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Get Credential
       *
       * @example
       * ```ts
       * const betaManagedAgentsCredential =
       *   await client.beta.vaults.credentials.retrieve(
       *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
       *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
       *   );
       * ```
       */
      retrieve(credentialID, params, options) {
        const { vault_id, betas } = params;
        return this._client.get(path3`/v1/vaults/${vault_id}/credentials/${credentialID}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Update Credential
       *
       * @example
       * ```ts
       * const betaManagedAgentsCredential =
       *   await client.beta.vaults.credentials.update(
       *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
       *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
       *   );
       * ```
       */
      update(credentialID, params, options) {
        const { vault_id, betas, ...body } = params;
        return this._client.post(path3`/v1/vaults/${vault_id}/credentials/${credentialID}?beta=true`, {
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * List Credentials
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const betaManagedAgentsCredential of client.beta.vaults.credentials.list(
       *   'vlt_011CZkZDLs7fYzm1hXNPeRjv',
       * )) {
       *   // ...
       * }
       * ```
       */
      list(vaultID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path3`/v1/vaults/${vaultID}/credentials?beta=true`, PageCursor, {
          query,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Delete Credential
       *
       * @example
       * ```ts
       * const betaManagedAgentsDeletedCredential =
       *   await client.beta.vaults.credentials.delete(
       *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
       *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
       *   );
       * ```
       */
      delete(credentialID, params, options) {
        const { vault_id, betas } = params;
        return this._client.delete(path3`/v1/vaults/${vault_id}/credentials/${credentialID}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Archive Credential
       *
       * @example
       * ```ts
       * const betaManagedAgentsCredential =
       *   await client.beta.vaults.credentials.archive(
       *     'vcrd_011CZkZEMt8gZan2iYOQfSkw',
       *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
       *   );
       * ```
       */
      archive(credentialID, params, options) {
        const { vault_id, betas } = params;
        return this._client.post(path3`/v1/vaults/${vault_id}/credentials/${credentialID}/archive?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/resources/beta/vaults/vaults.mjs
var Vaults;
var init_vaults = __esm({
  "node_modules/@anthropic-ai/sdk/resources/beta/vaults/vaults.mjs"() {
    init_resource();
    init_credentials();
    init_credentials();
    init_pagination();
    init_headers();
    init_path();
    Vaults = class extends APIResource {
      constructor() {
        super(...arguments);
        this.credentials = new Credentials(this._client);
      }
      /**
       * Create Vault
       *
       * @example
       * ```ts
       * const betaManagedAgentsVault =
       *   await client.beta.vaults.create({
       *     display_name: 'Example vault',
       *   });
       * ```
       */
      create(params, options) {
        const { betas, ...body } = params;
        return this._client.post("/v1/vaults?beta=true", {
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Get Vault
       *
       * @example
       * ```ts
       * const betaManagedAgentsVault =
       *   await client.beta.vaults.retrieve(
       *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
       *   );
       * ```
       */
      retrieve(vaultID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path3`/v1/vaults/${vaultID}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Update Vault
       *
       * @example
       * ```ts
       * const betaManagedAgentsVault =
       *   await client.beta.vaults.update(
       *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
       *   );
       * ```
       */
      update(vaultID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path3`/v1/vaults/${vaultID}?beta=true`, {
          body,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * List Vaults
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const betaManagedAgentsVault of client.beta.vaults.list()) {
       *   // ...
       * }
       * ```
       */
      list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList("/v1/vaults?beta=true", PageCursor, {
          query,
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Delete Vault
       *
       * @example
       * ```ts
       * const betaManagedAgentsDeletedVault =
       *   await client.beta.vaults.delete(
       *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
       *   );
       * ```
       */
      delete(vaultID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(path3`/v1/vaults/${vaultID}?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
      /**
       * Archive Vault
       *
       * @example
       * ```ts
       * const betaManagedAgentsVault =
       *   await client.beta.vaults.archive(
       *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
       *   );
       * ```
       */
      archive(vaultID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(path3`/v1/vaults/${vaultID}/archive?beta=true`, {
          ...options,
          headers: buildHeaders([
            { "anthropic-beta": [...betas ?? [], "managed-agents-2026-04-01"].toString() },
            options?.headers
          ])
        });
      }
    };
    Vaults.Credentials = Credentials;
  }
});

// node_modules/@anthropic-ai/sdk/resources/beta/beta.mjs
var Beta;
var init_beta = __esm({
  "node_modules/@anthropic-ai/sdk/resources/beta/beta.mjs"() {
    init_resource();
    init_environments();
    init_environments();
    init_files();
    init_files();
    init_models();
    init_models();
    init_agents();
    init_agents();
    init_messages();
    init_messages();
    init_sessions();
    init_sessions();
    init_skills();
    init_skills();
    init_vaults();
    init_vaults();
    Beta = class extends APIResource {
      constructor() {
        super(...arguments);
        this.models = new Models(this._client);
        this.messages = new Messages(this._client);
        this.agents = new Agents(this._client);
        this.environments = new Environments(this._client);
        this.sessions = new Sessions(this._client);
        this.vaults = new Vaults(this._client);
        this.files = new Files(this._client);
        this.skills = new Skills(this._client);
      }
    };
    Beta.Models = Models;
    Beta.Messages = Messages;
    Beta.Agents = Agents;
    Beta.Environments = Environments;
    Beta.Sessions = Sessions;
    Beta.Vaults = Vaults;
    Beta.Files = Files;
    Beta.Skills = Skills;
  }
});

// node_modules/@anthropic-ai/sdk/resources/completions.mjs
var Completions;
var init_completions = __esm({
  "node_modules/@anthropic-ai/sdk/resources/completions.mjs"() {
    init_resource();
    init_headers();
    Completions = class extends APIResource {
      create(params, options) {
        const { betas, ...body } = params;
        return this._client.post("/v1/complete", {
          body,
          timeout: this._client._options.timeout ?? 6e5,
          ...options,
          headers: buildHeaders([
            { ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 },
            options?.headers
          ]),
          stream: params.stream ?? false
        });
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/lib/parser.mjs
function getOutputFormat2(params) {
  return params?.output_config?.format;
}
function maybeParseMessage(message, params, opts) {
  const outputFormat = getOutputFormat2(params);
  if (!params || !("parse" in (outputFormat ?? {}))) {
    return {
      ...message,
      content: message.content.map((block) => {
        if (block.type === "text") {
          const parsedBlock = Object.defineProperty({ ...block }, "parsed_output", {
            value: null,
            enumerable: false
          });
          return parsedBlock;
        }
        return block;
      }),
      parsed_output: null
    };
  }
  return parseMessage(message, params, opts);
}
function parseMessage(message, params, opts) {
  let firstParsedOutput = null;
  const content = message.content.map((block) => {
    if (block.type === "text") {
      const parsedOutput = parseOutputFormat(params, block.text);
      if (firstParsedOutput === null) {
        firstParsedOutput = parsedOutput;
      }
      const parsedBlock = Object.defineProperty({ ...block }, "parsed_output", {
        value: parsedOutput,
        enumerable: false
      });
      return parsedBlock;
    }
    return block;
  });
  return {
    ...message,
    content,
    parsed_output: firstParsedOutput
  };
}
function parseOutputFormat(params, content) {
  const outputFormat = getOutputFormat2(params);
  if (outputFormat?.type !== "json_schema") {
    return null;
  }
  try {
    if ("parse" in outputFormat) {
      return outputFormat.parse(content);
    }
    return JSON.parse(content);
  } catch (error) {
    throw new AnthropicError(`Failed to parse structured output: ${error}`);
  }
}
var init_parser2 = __esm({
  "node_modules/@anthropic-ai/sdk/lib/parser.mjs"() {
    init_error();
  }
});

// node_modules/@anthropic-ai/sdk/lib/MessageStream.mjs
function tracksToolInput2(content) {
  return content.type === "tool_use" || content.type === "server_tool_use";
}
function checkNever2(x) {
}
var _MessageStream_instances, _MessageStream_currentMessageSnapshot, _MessageStream_params, _MessageStream_connectedPromise, _MessageStream_resolveConnectedPromise, _MessageStream_rejectConnectedPromise, _MessageStream_endPromise, _MessageStream_resolveEndPromise, _MessageStream_rejectEndPromise, _MessageStream_listeners, _MessageStream_ended, _MessageStream_errored, _MessageStream_aborted, _MessageStream_catchingPromiseCreated, _MessageStream_response, _MessageStream_request_id, _MessageStream_logger, _MessageStream_getFinalMessage, _MessageStream_getFinalText, _MessageStream_handleError, _MessageStream_beginRequest, _MessageStream_addStreamEvent, _MessageStream_endRequest, _MessageStream_accumulateMessage, JSON_BUF_PROPERTY2, MessageStream;
var init_MessageStream = __esm({
  "node_modules/@anthropic-ai/sdk/lib/MessageStream.mjs"() {
    init_tslib();
    init_errors();
    init_error2();
    init_streaming2();
    init_parser();
    init_parser2();
    JSON_BUF_PROPERTY2 = "__json_buf";
    MessageStream = class _MessageStream {
      constructor(params, opts) {
        _MessageStream_instances.add(this);
        this.messages = [];
        this.receivedMessages = [];
        _MessageStream_currentMessageSnapshot.set(this, void 0);
        _MessageStream_params.set(this, null);
        this.controller = new AbortController();
        _MessageStream_connectedPromise.set(this, void 0);
        _MessageStream_resolveConnectedPromise.set(this, () => {
        });
        _MessageStream_rejectConnectedPromise.set(this, () => {
        });
        _MessageStream_endPromise.set(this, void 0);
        _MessageStream_resolveEndPromise.set(this, () => {
        });
        _MessageStream_rejectEndPromise.set(this, () => {
        });
        _MessageStream_listeners.set(this, {});
        _MessageStream_ended.set(this, false);
        _MessageStream_errored.set(this, false);
        _MessageStream_aborted.set(this, false);
        _MessageStream_catchingPromiseCreated.set(this, false);
        _MessageStream_response.set(this, void 0);
        _MessageStream_request_id.set(this, void 0);
        _MessageStream_logger.set(this, void 0);
        _MessageStream_handleError.set(this, (error) => {
          __classPrivateFieldSet(this, _MessageStream_errored, true, "f");
          if (isAbortError(error)) {
            error = new APIUserAbortError();
          }
          if (error instanceof APIUserAbortError) {
            __classPrivateFieldSet(this, _MessageStream_aborted, true, "f");
            return this._emit("abort", error);
          }
          if (error instanceof AnthropicError) {
            return this._emit("error", error);
          }
          if (error instanceof Error) {
            const anthropicError = new AnthropicError(error.message);
            anthropicError.cause = error;
            return this._emit("error", anthropicError);
          }
          return this._emit("error", new AnthropicError(String(error)));
        });
        __classPrivateFieldSet(this, _MessageStream_connectedPromise, new Promise((resolve2, reject) => {
          __classPrivateFieldSet(this, _MessageStream_resolveConnectedPromise, resolve2, "f");
          __classPrivateFieldSet(this, _MessageStream_rejectConnectedPromise, reject, "f");
        }), "f");
        __classPrivateFieldSet(this, _MessageStream_endPromise, new Promise((resolve2, reject) => {
          __classPrivateFieldSet(this, _MessageStream_resolveEndPromise, resolve2, "f");
          __classPrivateFieldSet(this, _MessageStream_rejectEndPromise, reject, "f");
        }), "f");
        __classPrivateFieldGet(this, _MessageStream_connectedPromise, "f").catch(() => {
        });
        __classPrivateFieldGet(this, _MessageStream_endPromise, "f").catch(() => {
        });
        __classPrivateFieldSet(this, _MessageStream_params, params, "f");
        __classPrivateFieldSet(this, _MessageStream_logger, opts?.logger ?? console, "f");
      }
      get response() {
        return __classPrivateFieldGet(this, _MessageStream_response, "f");
      }
      get request_id() {
        return __classPrivateFieldGet(this, _MessageStream_request_id, "f");
      }
      /**
       * Returns the `MessageStream` data, the raw `Response` instance and the ID of the request,
       * returned vie the `request-id` header which is useful for debugging requests and resporting
       * issues to Anthropic.
       *
       * This is the same as the `APIPromise.withResponse()` method.
       *
       * This method will raise an error if you created the stream using `MessageStream.fromReadableStream`
       * as no `Response` is available.
       */
      async withResponse() {
        __classPrivateFieldSet(this, _MessageStream_catchingPromiseCreated, true, "f");
        const response = await __classPrivateFieldGet(this, _MessageStream_connectedPromise, "f");
        if (!response) {
          throw new Error("Could not resolve a `Response` object");
        }
        return {
          data: this,
          response,
          request_id: response.headers.get("request-id")
        };
      }
      /**
       * Intended for use on the frontend, consuming a stream produced with
       * `.toReadableStream()` on the backend.
       *
       * Note that messages sent to the model do not appear in `.on('message')`
       * in this context.
       */
      static fromReadableStream(stream) {
        const runner = new _MessageStream(null);
        runner._run(() => runner._fromReadableStream(stream));
        return runner;
      }
      static createMessage(messages2, params, options, { logger } = {}) {
        const runner = new _MessageStream(params, { logger });
        for (const message of params.messages) {
          runner._addMessageParam(message);
        }
        __classPrivateFieldSet(runner, _MessageStream_params, { ...params, stream: true }, "f");
        runner._run(() => runner._createMessage(messages2, { ...params, stream: true }, { ...options, headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" } }));
        return runner;
      }
      _run(executor) {
        executor().then(() => {
          this._emitFinal();
          this._emit("end");
        }, __classPrivateFieldGet(this, _MessageStream_handleError, "f"));
      }
      _addMessageParam(message) {
        this.messages.push(message);
      }
      _addMessage(message, emit = true) {
        this.receivedMessages.push(message);
        if (emit) {
          this._emit("message", message);
        }
      }
      async _createMessage(messages2, params, options) {
        const signal = options?.signal;
        let abortHandler;
        if (signal) {
          if (signal.aborted)
            this.controller.abort();
          abortHandler = this.controller.abort.bind(this.controller);
          signal.addEventListener("abort", abortHandler);
        }
        try {
          __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_beginRequest).call(this);
          const { response, data: stream } = await messages2.create({ ...params, stream: true }, { ...options, signal: this.controller.signal }).withResponse();
          this._connected(response);
          for await (const event of stream) {
            __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_addStreamEvent).call(this, event);
          }
          if (stream.controller.signal?.aborted) {
            throw new APIUserAbortError();
          }
          __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_endRequest).call(this);
        } finally {
          if (signal && abortHandler) {
            signal.removeEventListener("abort", abortHandler);
          }
        }
      }
      _connected(response) {
        if (this.ended)
          return;
        __classPrivateFieldSet(this, _MessageStream_response, response, "f");
        __classPrivateFieldSet(this, _MessageStream_request_id, response?.headers.get("request-id"), "f");
        __classPrivateFieldGet(this, _MessageStream_resolveConnectedPromise, "f").call(this, response);
        this._emit("connect");
      }
      get ended() {
        return __classPrivateFieldGet(this, _MessageStream_ended, "f");
      }
      get errored() {
        return __classPrivateFieldGet(this, _MessageStream_errored, "f");
      }
      get aborted() {
        return __classPrivateFieldGet(this, _MessageStream_aborted, "f");
      }
      abort() {
        this.controller.abort();
      }
      /**
       * Adds the listener function to the end of the listeners array for the event.
       * No checks are made to see if the listener has already been added. Multiple calls passing
       * the same combination of event and listener will result in the listener being added, and
       * called, multiple times.
       * @returns this MessageStream, so that calls can be chained
       */
      on(event, listener) {
        const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] = []);
        listeners.push({ listener });
        return this;
      }
      /**
       * Removes the specified listener from the listener array for the event.
       * off() will remove, at most, one instance of a listener from the listener array. If any single
       * listener has been added multiple times to the listener array for the specified event, then
       * off() must be called multiple times to remove each instance.
       * @returns this MessageStream, so that calls can be chained
       */
      off(event, listener) {
        const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event];
        if (!listeners)
          return this;
        const index = listeners.findIndex((l) => l.listener === listener);
        if (index >= 0)
          listeners.splice(index, 1);
        return this;
      }
      /**
       * Adds a one-time listener function for the event. The next time the event is triggered,
       * this listener is removed and then invoked.
       * @returns this MessageStream, so that calls can be chained
       */
      once(event, listener) {
        const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] = []);
        listeners.push({ listener, once: true });
        return this;
      }
      /**
       * This is similar to `.once()`, but returns a Promise that resolves the next time
       * the event is triggered, instead of calling a listener callback.
       * @returns a Promise that resolves the next time given event is triggered,
       * or rejects if an error is emitted.  (If you request the 'error' event,
       * returns a promise that resolves with the error).
       *
       * Example:
       *
       *   const message = await stream.emitted('message') // rejects if the stream errors
       */
      emitted(event) {
        return new Promise((resolve2, reject) => {
          __classPrivateFieldSet(this, _MessageStream_catchingPromiseCreated, true, "f");
          if (event !== "error")
            this.once("error", reject);
          this.once(event, resolve2);
        });
      }
      async done() {
        __classPrivateFieldSet(this, _MessageStream_catchingPromiseCreated, true, "f");
        await __classPrivateFieldGet(this, _MessageStream_endPromise, "f");
      }
      get currentMessage() {
        return __classPrivateFieldGet(this, _MessageStream_currentMessageSnapshot, "f");
      }
      /**
       * @returns a promise that resolves with the the final assistant Message response,
       * or rejects if an error occurred or the stream ended prematurely without producing a Message.
       * If structured outputs were used, this will be a ParsedMessage with a `parsed_output` field.
       */
      async finalMessage() {
        await this.done();
        return __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_getFinalMessage).call(this);
      }
      /**
       * @returns a promise that resolves with the the final assistant Message's text response, concatenated
       * together if there are more than one text blocks.
       * Rejects if an error occurred or the stream ended prematurely without producing a Message.
       */
      async finalText() {
        await this.done();
        return __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_getFinalText).call(this);
      }
      _emit(event, ...args) {
        if (__classPrivateFieldGet(this, _MessageStream_ended, "f"))
          return;
        if (event === "end") {
          __classPrivateFieldSet(this, _MessageStream_ended, true, "f");
          __classPrivateFieldGet(this, _MessageStream_resolveEndPromise, "f").call(this);
        }
        const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event];
        if (listeners) {
          __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
          listeners.forEach(({ listener }) => listener(...args));
        }
        if (event === "abort") {
          const error = args[0];
          if (!__classPrivateFieldGet(this, _MessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
            Promise.reject(error);
          }
          __classPrivateFieldGet(this, _MessageStream_rejectConnectedPromise, "f").call(this, error);
          __classPrivateFieldGet(this, _MessageStream_rejectEndPromise, "f").call(this, error);
          this._emit("end");
          return;
        }
        if (event === "error") {
          const error = args[0];
          if (!__classPrivateFieldGet(this, _MessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
            Promise.reject(error);
          }
          __classPrivateFieldGet(this, _MessageStream_rejectConnectedPromise, "f").call(this, error);
          __classPrivateFieldGet(this, _MessageStream_rejectEndPromise, "f").call(this, error);
          this._emit("end");
        }
      }
      _emitFinal() {
        const finalMessage = this.receivedMessages.at(-1);
        if (finalMessage) {
          this._emit("finalMessage", __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_getFinalMessage).call(this));
        }
      }
      async _fromReadableStream(readableStream, options) {
        const signal = options?.signal;
        let abortHandler;
        if (signal) {
          if (signal.aborted)
            this.controller.abort();
          abortHandler = this.controller.abort.bind(this.controller);
          signal.addEventListener("abort", abortHandler);
        }
        try {
          __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_beginRequest).call(this);
          this._connected(null);
          const stream = Stream.fromReadableStream(readableStream, this.controller);
          for await (const event of stream) {
            __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_addStreamEvent).call(this, event);
          }
          if (stream.controller.signal?.aborted) {
            throw new APIUserAbortError();
          }
          __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_endRequest).call(this);
        } finally {
          if (signal && abortHandler) {
            signal.removeEventListener("abort", abortHandler);
          }
        }
      }
      [(_MessageStream_currentMessageSnapshot = /* @__PURE__ */ new WeakMap(), _MessageStream_params = /* @__PURE__ */ new WeakMap(), _MessageStream_connectedPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_resolveConnectedPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_rejectConnectedPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_endPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_resolveEndPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_rejectEndPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_listeners = /* @__PURE__ */ new WeakMap(), _MessageStream_ended = /* @__PURE__ */ new WeakMap(), _MessageStream_errored = /* @__PURE__ */ new WeakMap(), _MessageStream_aborted = /* @__PURE__ */ new WeakMap(), _MessageStream_catchingPromiseCreated = /* @__PURE__ */ new WeakMap(), _MessageStream_response = /* @__PURE__ */ new WeakMap(), _MessageStream_request_id = /* @__PURE__ */ new WeakMap(), _MessageStream_logger = /* @__PURE__ */ new WeakMap(), _MessageStream_handleError = /* @__PURE__ */ new WeakMap(), _MessageStream_instances = /* @__PURE__ */ new WeakSet(), _MessageStream_getFinalMessage = function _MessageStream_getFinalMessage2() {
        if (this.receivedMessages.length === 0) {
          throw new AnthropicError("stream ended without producing a Message with role=assistant");
        }
        return this.receivedMessages.at(-1);
      }, _MessageStream_getFinalText = function _MessageStream_getFinalText2() {
        if (this.receivedMessages.length === 0) {
          throw new AnthropicError("stream ended without producing a Message with role=assistant");
        }
        const textBlocks = this.receivedMessages.at(-1).content.filter((block) => block.type === "text").map((block) => block.text);
        if (textBlocks.length === 0) {
          throw new AnthropicError("stream ended without producing a content block with type=text");
        }
        return textBlocks.join(" ");
      }, _MessageStream_beginRequest = function _MessageStream_beginRequest2() {
        if (this.ended)
          return;
        __classPrivateFieldSet(this, _MessageStream_currentMessageSnapshot, void 0, "f");
      }, _MessageStream_addStreamEvent = function _MessageStream_addStreamEvent2(event) {
        if (this.ended)
          return;
        const messageSnapshot = __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_accumulateMessage).call(this, event);
        this._emit("streamEvent", event, messageSnapshot);
        switch (event.type) {
          case "content_block_delta": {
            const content = messageSnapshot.content.at(-1);
            switch (event.delta.type) {
              case "text_delta": {
                if (content.type === "text") {
                  this._emit("text", event.delta.text, content.text || "");
                }
                break;
              }
              case "citations_delta": {
                if (content.type === "text") {
                  this._emit("citation", event.delta.citation, content.citations ?? []);
                }
                break;
              }
              case "input_json_delta": {
                if (tracksToolInput2(content) && content.input) {
                  this._emit("inputJson", event.delta.partial_json, content.input);
                }
                break;
              }
              case "thinking_delta": {
                if (content.type === "thinking") {
                  this._emit("thinking", event.delta.thinking, content.thinking);
                }
                break;
              }
              case "signature_delta": {
                if (content.type === "thinking") {
                  this._emit("signature", content.signature);
                }
                break;
              }
              default:
                checkNever2(event.delta);
            }
            break;
          }
          case "message_stop": {
            this._addMessageParam(messageSnapshot);
            this._addMessage(maybeParseMessage(messageSnapshot, __classPrivateFieldGet(this, _MessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _MessageStream_logger, "f") }), true);
            break;
          }
          case "content_block_stop": {
            this._emit("contentBlock", messageSnapshot.content.at(-1));
            break;
          }
          case "message_start": {
            __classPrivateFieldSet(this, _MessageStream_currentMessageSnapshot, messageSnapshot, "f");
            break;
          }
          case "content_block_start":
          case "message_delta":
            break;
        }
      }, _MessageStream_endRequest = function _MessageStream_endRequest2() {
        if (this.ended) {
          throw new AnthropicError(`stream has ended, this shouldn't happen`);
        }
        const snapshot = __classPrivateFieldGet(this, _MessageStream_currentMessageSnapshot, "f");
        if (!snapshot) {
          throw new AnthropicError(`request ended without sending any chunks`);
        }
        __classPrivateFieldSet(this, _MessageStream_currentMessageSnapshot, void 0, "f");
        return maybeParseMessage(snapshot, __classPrivateFieldGet(this, _MessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _MessageStream_logger, "f") });
      }, _MessageStream_accumulateMessage = function _MessageStream_accumulateMessage2(event) {
        let snapshot = __classPrivateFieldGet(this, _MessageStream_currentMessageSnapshot, "f");
        if (event.type === "message_start") {
          if (snapshot) {
            throw new AnthropicError(`Unexpected event order, got ${event.type} before receiving "message_stop"`);
          }
          return event.message;
        }
        if (!snapshot) {
          throw new AnthropicError(`Unexpected event order, got ${event.type} before "message_start"`);
        }
        switch (event.type) {
          case "message_stop":
            return snapshot;
          case "message_delta":
            snapshot.stop_reason = event.delta.stop_reason;
            snapshot.stop_sequence = event.delta.stop_sequence;
            snapshot.usage.output_tokens = event.usage.output_tokens;
            if (event.usage.input_tokens != null) {
              snapshot.usage.input_tokens = event.usage.input_tokens;
            }
            if (event.usage.cache_creation_input_tokens != null) {
              snapshot.usage.cache_creation_input_tokens = event.usage.cache_creation_input_tokens;
            }
            if (event.usage.cache_read_input_tokens != null) {
              snapshot.usage.cache_read_input_tokens = event.usage.cache_read_input_tokens;
            }
            if (event.usage.server_tool_use != null) {
              snapshot.usage.server_tool_use = event.usage.server_tool_use;
            }
            return snapshot;
          case "content_block_start":
            snapshot.content.push({ ...event.content_block });
            return snapshot;
          case "content_block_delta": {
            const snapshotContent = snapshot.content.at(event.index);
            switch (event.delta.type) {
              case "text_delta": {
                if (snapshotContent?.type === "text") {
                  snapshot.content[event.index] = {
                    ...snapshotContent,
                    text: (snapshotContent.text || "") + event.delta.text
                  };
                }
                break;
              }
              case "citations_delta": {
                if (snapshotContent?.type === "text") {
                  snapshot.content[event.index] = {
                    ...snapshotContent,
                    citations: [...snapshotContent.citations ?? [], event.delta.citation]
                  };
                }
                break;
              }
              case "input_json_delta": {
                if (snapshotContent && tracksToolInput2(snapshotContent)) {
                  let jsonBuf = snapshotContent[JSON_BUF_PROPERTY2] || "";
                  jsonBuf += event.delta.partial_json;
                  const newContent = { ...snapshotContent };
                  Object.defineProperty(newContent, JSON_BUF_PROPERTY2, {
                    value: jsonBuf,
                    enumerable: false,
                    writable: true
                  });
                  if (jsonBuf) {
                    newContent.input = partialParse(jsonBuf);
                  }
                  snapshot.content[event.index] = newContent;
                }
                break;
              }
              case "thinking_delta": {
                if (snapshotContent?.type === "thinking") {
                  snapshot.content[event.index] = {
                    ...snapshotContent,
                    thinking: snapshotContent.thinking + event.delta.thinking
                  };
                }
                break;
              }
              case "signature_delta": {
                if (snapshotContent?.type === "thinking") {
                  snapshot.content[event.index] = {
                    ...snapshotContent,
                    signature: event.delta.signature
                  };
                }
                break;
              }
              default:
                checkNever2(event.delta);
            }
            return snapshot;
          }
          case "content_block_stop":
            return snapshot;
        }
      }, Symbol.asyncIterator)]() {
        const pushQueue = [];
        const readQueue = [];
        let done = false;
        this.on("streamEvent", (event) => {
          const reader = readQueue.shift();
          if (reader) {
            reader.resolve(event);
          } else {
            pushQueue.push(event);
          }
        });
        this.on("end", () => {
          done = true;
          for (const reader of readQueue) {
            reader.resolve(void 0);
          }
          readQueue.length = 0;
        });
        this.on("abort", (err) => {
          done = true;
          for (const reader of readQueue) {
            reader.reject(err);
          }
          readQueue.length = 0;
        });
        this.on("error", (err) => {
          done = true;
          for (const reader of readQueue) {
            reader.reject(err);
          }
          readQueue.length = 0;
        });
        return {
          next: async () => {
            if (!pushQueue.length) {
              if (done) {
                return { value: void 0, done: true };
              }
              return new Promise((resolve2, reject) => readQueue.push({ resolve: resolve2, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: void 0, done: true });
            }
            const chunk = pushQueue.shift();
            return { value: chunk, done: false };
          },
          return: async () => {
            this.abort();
            return { value: void 0, done: true };
          }
        };
      }
      toReadableStream() {
        const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
        return stream.toReadableStream();
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/resources/messages/batches.mjs
var Batches2;
var init_batches2 = __esm({
  "node_modules/@anthropic-ai/sdk/resources/messages/batches.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_jsonl();
    init_error2();
    init_path();
    Batches2 = class extends APIResource {
      /**
       * Send a batch of Message creation requests.
       *
       * The Message Batches API can be used to process multiple Messages API requests at
       * once. Once a Message Batch is created, it begins processing immediately. Batches
       * can take up to 24 hours to complete.
       *
       * Learn more about the Message Batches API in our
       * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
       *
       * @example
       * ```ts
       * const messageBatch = await client.messages.batches.create({
       *   requests: [
       *     {
       *       custom_id: 'my-custom-id-1',
       *       params: {
       *         max_tokens: 1024,
       *         messages: [
       *           { content: 'Hello, world', role: 'user' },
       *         ],
       *         model: 'claude-opus-4-6',
       *       },
       *     },
       *   ],
       * });
       * ```
       */
      create(body, options) {
        return this._client.post("/v1/messages/batches", { body, ...options });
      }
      /**
       * This endpoint is idempotent and can be used to poll for Message Batch
       * completion. To access the results of a Message Batch, make a request to the
       * `results_url` field in the response.
       *
       * Learn more about the Message Batches API in our
       * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
       *
       * @example
       * ```ts
       * const messageBatch = await client.messages.batches.retrieve(
       *   'message_batch_id',
       * );
       * ```
       */
      retrieve(messageBatchID, options) {
        return this._client.get(path3`/v1/messages/batches/${messageBatchID}`, options);
      }
      /**
       * List all Message Batches within a Workspace. Most recently created batches are
       * returned first.
       *
       * Learn more about the Message Batches API in our
       * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const messageBatch of client.messages.batches.list()) {
       *   // ...
       * }
       * ```
       */
      list(query = {}, options) {
        return this._client.getAPIList("/v1/messages/batches", Page, { query, ...options });
      }
      /**
       * Delete a Message Batch.
       *
       * Message Batches can only be deleted once they've finished processing. If you'd
       * like to delete an in-progress batch, you must first cancel it.
       *
       * Learn more about the Message Batches API in our
       * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
       *
       * @example
       * ```ts
       * const deletedMessageBatch =
       *   await client.messages.batches.delete('message_batch_id');
       * ```
       */
      delete(messageBatchID, options) {
        return this._client.delete(path3`/v1/messages/batches/${messageBatchID}`, options);
      }
      /**
       * Batches may be canceled any time before processing ends. Once cancellation is
       * initiated, the batch enters a `canceling` state, at which time the system may
       * complete any in-progress, non-interruptible requests before finalizing
       * cancellation.
       *
       * The number of canceled requests is specified in `request_counts`. To determine
       * which requests were canceled, check the individual results within the batch.
       * Note that cancellation may not result in any canceled requests if they were
       * non-interruptible.
       *
       * Learn more about the Message Batches API in our
       * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
       *
       * @example
       * ```ts
       * const messageBatch = await client.messages.batches.cancel(
       *   'message_batch_id',
       * );
       * ```
       */
      cancel(messageBatchID, options) {
        return this._client.post(path3`/v1/messages/batches/${messageBatchID}/cancel`, options);
      }
      /**
       * Streams the results of a Message Batch as a `.jsonl` file.
       *
       * Each line in the file is a JSON object containing the result of a single request
       * in the Message Batch. Results are not guaranteed to be in the same order as
       * requests. Use the `custom_id` field to match results to requests.
       *
       * Learn more about the Message Batches API in our
       * [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
       *
       * @example
       * ```ts
       * const messageBatchIndividualResponse =
       *   await client.messages.batches.results('message_batch_id');
       * ```
       */
      async results(messageBatchID, options) {
        const batch = await this.retrieve(messageBatchID);
        if (!batch.results_url) {
          throw new AnthropicError(`No batch \`results_url\`; Has it finished processing? ${batch.processing_status} - ${batch.id}`);
        }
        return this._client.get(batch.results_url, {
          ...options,
          headers: buildHeaders([{ Accept: "application/binary" }, options?.headers]),
          stream: true,
          __binaryResponse: true
        })._thenUnwrap((_, props) => JSONLDecoder.fromResponse(props.response, props.controller));
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/resources/messages/messages.mjs
var Messages2, DEPRECATED_MODELS2, MODELS_TO_WARN_WITH_THINKING_ENABLED2;
var init_messages2 = __esm({
  "node_modules/@anthropic-ai/sdk/resources/messages/messages.mjs"() {
    init_resource();
    init_headers();
    init_stainless_helper_header();
    init_MessageStream();
    init_parser2();
    init_batches2();
    init_batches2();
    init_constants();
    Messages2 = class extends APIResource {
      constructor() {
        super(...arguments);
        this.batches = new Batches2(this._client);
      }
      create(body, options) {
        if (body.model in DEPRECATED_MODELS2) {
          console.warn(`The model '${body.model}' is deprecated and will reach end-of-life on ${DEPRECATED_MODELS2[body.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
        }
        if (body.model in MODELS_TO_WARN_WITH_THINKING_ENABLED2 && body.thinking && body.thinking.type === "enabled") {
          console.warn(`Using Claude with ${body.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
        }
        let timeout = this._client._options.timeout;
        if (!body.stream && timeout == null) {
          const maxNonstreamingTokens = MODEL_NONSTREAMING_TOKENS[body.model] ?? void 0;
          timeout = this._client.calculateNonstreamingTimeout(body.max_tokens, maxNonstreamingTokens);
        }
        const helperHeader = stainlessHelperHeader(body.tools, body.messages);
        return this._client.post("/v1/messages", {
          body,
          timeout: timeout ?? 6e5,
          ...options,
          headers: buildHeaders([helperHeader, options?.headers]),
          stream: body.stream ?? false
        });
      }
      /**
       * Send a structured list of input messages with text and/or image content, along with an expected `output_config.format` and
       * the response will be automatically parsed and available in the `parsed_output` property of the message.
       *
       * @example
       * ```ts
       * const message = await client.messages.parse({
       *   model: 'claude-sonnet-4-5-20250929',
       *   max_tokens: 1024,
       *   messages: [{ role: 'user', content: 'What is 2+2?' }],
       *   output_config: {
       *     format: zodOutputFormat(z.object({ answer: z.number() })),
       *   },
       * });
       *
       * console.log(message.parsed_output?.answer); // 4
       * ```
       */
      parse(params, options) {
        return this.create(params, options).then((message) => parseMessage(message, params, { logger: this._client.logger ?? console }));
      }
      /**
       * Create a Message stream.
       *
       * If `output_config.format` is provided with a parseable format (like `zodOutputFormat()`),
       * the final message will include a `parsed_output` property with the parsed content.
       *
       * @example
       * ```ts
       * const stream = client.messages.stream({
       *   model: 'claude-sonnet-4-5-20250929',
       *   max_tokens: 1024,
       *   messages: [{ role: 'user', content: 'What is 2+2?' }],
       *   output_config: {
       *     format: zodOutputFormat(z.object({ answer: z.number() })),
       *   },
       * });
       *
       * const message = await stream.finalMessage();
       * console.log(message.parsed_output?.answer); // 4
       * ```
       */
      stream(body, options) {
        return MessageStream.createMessage(this, body, options, { logger: this._client.logger ?? console });
      }
      /**
       * Count the number of tokens in a Message.
       *
       * The Token Count API can be used to count the number of tokens in a Message,
       * including tools, images, and documents, without creating it.
       *
       * Learn more about token counting in our
       * [user guide](https://docs.claude.com/en/docs/build-with-claude/token-counting)
       *
       * @example
       * ```ts
       * const messageTokensCount =
       *   await client.messages.countTokens({
       *     messages: [{ content: 'Hello, world', role: 'user' }],
       *     model: 'claude-opus-4-6',
       *   });
       * ```
       */
      countTokens(body, options) {
        return this._client.post("/v1/messages/count_tokens", { body, ...options });
      }
    };
    DEPRECATED_MODELS2 = {
      "claude-1.3": "November 6th, 2024",
      "claude-1.3-100k": "November 6th, 2024",
      "claude-instant-1.1": "November 6th, 2024",
      "claude-instant-1.1-100k": "November 6th, 2024",
      "claude-instant-1.2": "November 6th, 2024",
      "claude-3-sonnet-20240229": "July 21st, 2025",
      "claude-3-opus-20240229": "January 5th, 2026",
      "claude-2.1": "July 21st, 2025",
      "claude-2.0": "July 21st, 2025",
      "claude-3-7-sonnet-latest": "February 19th, 2026",
      "claude-3-7-sonnet-20250219": "February 19th, 2026",
      "claude-3-5-haiku-latest": "February 19th, 2026",
      "claude-3-5-haiku-20241022": "February 19th, 2026"
    };
    MODELS_TO_WARN_WITH_THINKING_ENABLED2 = ["claude-opus-4-6"];
    Messages2.Batches = Batches2;
  }
});

// node_modules/@anthropic-ai/sdk/resources/models.mjs
var Models2;
var init_models2 = __esm({
  "node_modules/@anthropic-ai/sdk/resources/models.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_path();
    Models2 = class extends APIResource {
      /**
       * Get a specific model.
       *
       * The Models API response can be used to determine information about a specific
       * model or resolve a model alias to a model ID.
       */
      retrieve(modelID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path3`/v1/models/${modelID}`, {
          ...options,
          headers: buildHeaders([
            { ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 },
            options?.headers
          ])
        });
      }
      /**
       * List available models.
       *
       * The Models API response can be used to determine which models are available for
       * use in the API. More recently released models are listed first.
       */
      list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList("/v1/models", Page, {
          query,
          ...options,
          headers: buildHeaders([
            { ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 },
            options?.headers
          ])
        });
      }
    };
  }
});

// node_modules/@anthropic-ai/sdk/resources/index.mjs
var init_resources2 = __esm({
  "node_modules/@anthropic-ai/sdk/resources/index.mjs"() {
    init_shared();
    init_beta();
    init_completions();
    init_messages2();
    init_models2();
  }
});

// node_modules/@anthropic-ai/sdk/internal/utils/env.mjs
var readEnv;
var init_env = __esm({
  "node_modules/@anthropic-ai/sdk/internal/utils/env.mjs"() {
    readEnv = (env) => {
      if (typeof globalThis.process !== "undefined") {
        return globalThis.process.env?.[env]?.trim() || void 0;
      }
      if (typeof globalThis.Deno !== "undefined") {
        return globalThis.Deno.env?.get?.(env)?.trim() || void 0;
      }
      return void 0;
    };
  }
});

// node_modules/@anthropic-ai/sdk/client.mjs
var _BaseAnthropic_instances, _a, _BaseAnthropic_encoder, _BaseAnthropic_baseURLOverridden, HUMAN_PROMPT, AI_PROMPT, BaseAnthropic, Anthropic;
var init_client = __esm({
  "node_modules/@anthropic-ai/sdk/client.mjs"() {
    init_tslib();
    init_uuid();
    init_values();
    init_sleep();
    init_errors();
    init_detect_platform();
    init_shims();
    init_request_options();
    init_query();
    init_version();
    init_error();
    init_pagination();
    init_uploads2();
    init_resources2();
    init_api_promise();
    init_completions();
    init_models2();
    init_beta();
    init_messages2();
    init_detect_platform();
    init_headers();
    init_env();
    init_log();
    init_values();
    HUMAN_PROMPT = "\\n\\nHuman:";
    AI_PROMPT = "\\n\\nAssistant:";
    BaseAnthropic = class {
      /**
       * API Client for interfacing with the Anthropic API.
       *
       * @param {string | null | undefined} [opts.apiKey=process.env['ANTHROPIC_API_KEY'] ?? null]
       * @param {string | null | undefined} [opts.authToken=process.env['ANTHROPIC_AUTH_TOKEN'] ?? null]
       * @param {string} [opts.baseURL=process.env['ANTHROPIC_BASE_URL'] ?? https://api.anthropic.com] - Override the default base URL for the API.
       * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
       * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
       * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
       * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
       * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
       * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
       * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
       */
      constructor({ baseURL = readEnv("ANTHROPIC_BASE_URL"), apiKey = readEnv("ANTHROPIC_API_KEY") ?? null, authToken = readEnv("ANTHROPIC_AUTH_TOKEN") ?? null, ...opts } = {}) {
        _BaseAnthropic_instances.add(this);
        _BaseAnthropic_encoder.set(this, void 0);
        const options = {
          apiKey,
          authToken,
          ...opts,
          baseURL: baseURL || `https://api.anthropic.com`
        };
        if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) {
          throw new AnthropicError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew Anthropic({ apiKey, dangerouslyAllowBrowser: true });\n");
        }
        this.baseURL = options.baseURL;
        this.timeout = options.timeout ?? _a.DEFAULT_TIMEOUT;
        this.logger = options.logger ?? console;
        const defaultLogLevel = "warn";
        this.logLevel = defaultLogLevel;
        this.logLevel = parseLogLevel(options.logLevel, "ClientOptions.logLevel", this) ?? parseLogLevel(readEnv("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? defaultLogLevel;
        this.fetchOptions = options.fetchOptions;
        this.maxRetries = options.maxRetries ?? 2;
        this.fetch = options.fetch ?? getDefaultFetch();
        __classPrivateFieldSet(this, _BaseAnthropic_encoder, FallbackEncoder, "f");
        this._options = options;
        this.apiKey = typeof apiKey === "string" ? apiKey : null;
        this.authToken = authToken;
      }
      /**
       * Create a new client instance re-using the same options given to the current client with optional overriding.
       */
      withOptions(options) {
        const client = new this.constructor({
          ...this._options,
          baseURL: this.baseURL,
          maxRetries: this.maxRetries,
          timeout: this.timeout,
          logger: this.logger,
          logLevel: this.logLevel,
          fetch: this.fetch,
          fetchOptions: this.fetchOptions,
          apiKey: this.apiKey,
          authToken: this.authToken,
          ...options
        });
        return client;
      }
      defaultQuery() {
        return this._options.defaultQuery;
      }
      validateHeaders({ values, nulls }) {
        if (values.get("x-api-key") || values.get("authorization")) {
          return;
        }
        if (this.apiKey && values.get("x-api-key")) {
          return;
        }
        if (nulls.has("x-api-key")) {
          return;
        }
        if (this.authToken && values.get("authorization")) {
          return;
        }
        if (nulls.has("authorization")) {
          return;
        }
        throw new Error('Could not resolve authentication method. Expected either apiKey or authToken to be set. Or for one of the "X-Api-Key" or "Authorization" headers to be explicitly omitted');
      }
      async authHeaders(opts) {
        return buildHeaders([await this.apiKeyAuth(opts), await this.bearerAuth(opts)]);
      }
      async apiKeyAuth(opts) {
        if (this.apiKey == null) {
          return void 0;
        }
        return buildHeaders([{ "X-Api-Key": this.apiKey }]);
      }
      async bearerAuth(opts) {
        if (this.authToken == null) {
          return void 0;
        }
        return buildHeaders([{ Authorization: `Bearer ${this.authToken}` }]);
      }
      /**
       * Basic re-implementation of `qs.stringify` for primitive types.
       */
      stringifyQuery(query) {
        return stringifyQuery(query);
      }
      getUserAgent() {
        return `${this.constructor.name}/JS ${VERSION}`;
      }
      defaultIdempotencyKey() {
        return `stainless-node-retry-${uuid4()}`;
      }
      makeStatusError(status, error, message, headers) {
        return APIError.generate(status, error, message, headers);
      }
      buildURL(path5, query, defaultBaseURL) {
        const baseURL = !__classPrivateFieldGet(this, _BaseAnthropic_instances, "m", _BaseAnthropic_baseURLOverridden).call(this) && defaultBaseURL || this.baseURL;
        const url = isAbsoluteURL(path5) ? new URL(path5) : new URL(baseURL + (baseURL.endsWith("/") && path5.startsWith("/") ? path5.slice(1) : path5));
        const defaultQuery = this.defaultQuery();
        const pathQuery = Object.fromEntries(url.searchParams);
        if (!isEmptyObj(defaultQuery) || !isEmptyObj(pathQuery)) {
          query = { ...pathQuery, ...defaultQuery, ...query };
        }
        if (typeof query === "object" && query && !Array.isArray(query)) {
          url.search = this.stringifyQuery(query);
        }
        return url.toString();
      }
      _calculateNonstreamingTimeout(maxTokens) {
        const defaultTimeout = 10 * 60;
        const expectedTimeout = 60 * 60 * maxTokens / 128e3;
        if (expectedTimeout > defaultTimeout) {
          throw new AnthropicError("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
        }
        return defaultTimeout * 1e3;
      }
      /**
       * Used as a callback for mutating the given `FinalRequestOptions` object.
       */
      async prepareOptions(options) {
      }
      /**
       * Used as a callback for mutating the given `RequestInit` object.
       *
       * This is useful for cases where you want to add certain headers based off of
       * the request properties, e.g. `method` or `url`.
       */
      async prepareRequest(request, { url, options }) {
      }
      get(path5, opts) {
        return this.methodRequest("get", path5, opts);
      }
      post(path5, opts) {
        return this.methodRequest("post", path5, opts);
      }
      patch(path5, opts) {
        return this.methodRequest("patch", path5, opts);
      }
      put(path5, opts) {
        return this.methodRequest("put", path5, opts);
      }
      delete(path5, opts) {
        return this.methodRequest("delete", path5, opts);
      }
      methodRequest(method, path5, opts) {
        return this.request(Promise.resolve(opts).then((opts2) => {
          return { method, path: path5, ...opts2 };
        }));
      }
      request(options, remainingRetries = null) {
        return new APIPromise(this, this.makeRequest(options, remainingRetries, void 0));
      }
      async makeRequest(optionsInput, retriesRemaining, retryOfRequestLogID) {
        const options = await optionsInput;
        const maxRetries = options.maxRetries ?? this.maxRetries;
        if (retriesRemaining == null) {
          retriesRemaining = maxRetries;
        }
        await this.prepareOptions(options);
        const { req, url, timeout } = await this.buildRequest(options, {
          retryCount: maxRetries - retriesRemaining
        });
        await this.prepareRequest(req, { url, options });
        const requestLogID = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0");
        const retryLogStr = retryOfRequestLogID === void 0 ? "" : `, retryOf: ${retryOfRequestLogID}`;
        const startTime = Date.now();
        loggerFor(this).debug(`[${requestLogID}] sending request`, formatRequestDetails({
          retryOfRequestLogID,
          method: options.method,
          url,
          options,
          headers: req.headers
        }));
        if (options.signal?.aborted) {
          throw new APIUserAbortError();
        }
        const controller = new AbortController();
        const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
        const headersTime = Date.now();
        if (response instanceof globalThis.Error) {
          const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
          if (options.signal?.aborted) {
            throw new APIUserAbortError();
          }
          const isTimeout = isAbortError(response) || /timed? ?out/i.test(String(response) + ("cause" in response ? String(response.cause) : ""));
          if (retriesRemaining) {
            loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - ${retryMessage}`);
            loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (${retryMessage})`, formatRequestDetails({
              retryOfRequestLogID,
              url,
              durationMs: headersTime - startTime,
              message: response.message
            }));
            return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
          }
          loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - error; no more retries left`);
          loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (error; no more retries left)`, formatRequestDetails({
            retryOfRequestLogID,
            url,
            durationMs: headersTime - startTime,
            message: response.message
          }));
          if (isTimeout) {
            throw new APIConnectionTimeoutError();
          }
          throw new APIConnectionError({ cause: response });
        }
        const specialHeaders = [...response.headers.entries()].filter(([name]) => name === "request-id").map(([name, value]) => ", " + name + ": " + JSON.stringify(value)).join("");
        const responseInfo = `[${requestLogID}${retryLogStr}${specialHeaders}] ${req.method} ${url} ${response.ok ? "succeeded" : "failed"} with status ${response.status} in ${headersTime - startTime}ms`;
        if (!response.ok) {
          const shouldRetry = await this.shouldRetry(response);
          if (retriesRemaining && shouldRetry) {
            const retryMessage2 = `retrying, ${retriesRemaining} attempts remaining`;
            await CancelReadableStream(response.body);
            loggerFor(this).info(`${responseInfo} - ${retryMessage2}`);
            loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage2})`, formatRequestDetails({
              retryOfRequestLogID,
              url: response.url,
              status: response.status,
              headers: response.headers,
              durationMs: headersTime - startTime
            }));
            return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID, response.headers);
          }
          const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;
          loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
          const errText = await response.text().catch((err2) => castToError(err2).message);
          const errJSON = safeJSON(errText);
          const errMessage = errJSON ? void 0 : errText;
          loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
            retryOfRequestLogID,
            url: response.url,
            status: response.status,
            headers: response.headers,
            message: errMessage,
            durationMs: Date.now() - startTime
          }));
          const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
          throw err;
        }
        loggerFor(this).info(responseInfo);
        loggerFor(this).debug(`[${requestLogID}] response start`, formatRequestDetails({
          retryOfRequestLogID,
          url: response.url,
          status: response.status,
          headers: response.headers,
          durationMs: headersTime - startTime
        }));
        return { response, options, controller, requestLogID, retryOfRequestLogID, startTime };
      }
      getAPIList(path5, Page2, opts) {
        return this.requestAPIList(Page2, opts && "then" in opts ? opts.then((opts2) => ({ method: "get", path: path5, ...opts2 })) : { method: "get", path: path5, ...opts });
      }
      requestAPIList(Page2, options) {
        const request = this.makeRequest(options, null, void 0);
        return new PagePromise(this, request, Page2);
      }
      async fetchWithTimeout(url, init, ms, controller) {
        const { signal, method, ...options } = init || {};
        const abort = this._makeAbort(controller);
        if (signal)
          signal.addEventListener("abort", abort, { once: true });
        const timeout = setTimeout(abort, ms);
        const isReadableBody = globalThis.ReadableStream && options.body instanceof globalThis.ReadableStream || typeof options.body === "object" && options.body !== null && Symbol.asyncIterator in options.body;
        const fetchOptions = {
          signal: controller.signal,
          ...isReadableBody ? { duplex: "half" } : {},
          method: "GET",
          ...options
        };
        if (method) {
          fetchOptions.method = method.toUpperCase();
        }
        try {
          return await this.fetch.call(void 0, url, fetchOptions);
        } finally {
          clearTimeout(timeout);
        }
      }
      async shouldRetry(response) {
        const shouldRetryHeader = response.headers.get("x-should-retry");
        if (shouldRetryHeader === "true")
          return true;
        if (shouldRetryHeader === "false")
          return false;
        if (response.status === 408)
          return true;
        if (response.status === 409)
          return true;
        if (response.status === 429)
          return true;
        if (response.status >= 500)
          return true;
        return false;
      }
      async retryRequest(options, retriesRemaining, requestLogID, responseHeaders) {
        let timeoutMillis;
        const retryAfterMillisHeader = responseHeaders?.get("retry-after-ms");
        if (retryAfterMillisHeader) {
          const timeoutMs = parseFloat(retryAfterMillisHeader);
          if (!Number.isNaN(timeoutMs)) {
            timeoutMillis = timeoutMs;
          }
        }
        const retryAfterHeader = responseHeaders?.get("retry-after");
        if (retryAfterHeader && !timeoutMillis) {
          const timeoutSeconds = parseFloat(retryAfterHeader);
          if (!Number.isNaN(timeoutSeconds)) {
            timeoutMillis = timeoutSeconds * 1e3;
          } else {
            timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
          }
        }
        if (timeoutMillis === void 0) {
          const maxRetries = options.maxRetries ?? this.maxRetries;
          timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
        }
        await sleep(timeoutMillis);
        return this.makeRequest(options, retriesRemaining - 1, requestLogID);
      }
      calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
        const initialRetryDelay = 0.5;
        const maxRetryDelay = 8;
        const numRetries = maxRetries - retriesRemaining;
        const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
        const jitter = 1 - Math.random() * 0.25;
        return sleepSeconds * jitter * 1e3;
      }
      calculateNonstreamingTimeout(maxTokens, maxNonstreamingTokens) {
        const maxTime = 60 * 60 * 1e3;
        const defaultTime = 60 * 10 * 1e3;
        const expectedTime = maxTime * maxTokens / 128e3;
        if (expectedTime > defaultTime || maxNonstreamingTokens != null && maxTokens > maxNonstreamingTokens) {
          throw new AnthropicError("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
        }
        return defaultTime;
      }
      async buildRequest(inputOptions, { retryCount = 0 } = {}) {
        const options = { ...inputOptions };
        const { method, path: path5, query, defaultBaseURL } = options;
        const url = this.buildURL(path5, query, defaultBaseURL);
        if ("timeout" in options)
          validatePositiveInteger("timeout", options.timeout);
        options.timeout = options.timeout ?? this.timeout;
        const { bodyHeaders, body } = this.buildBody({ options });
        const reqHeaders = await this.buildHeaders({ options: inputOptions, method, bodyHeaders, retryCount });
        const req = {
          method,
          headers: reqHeaders,
          ...options.signal && { signal: options.signal },
          ...globalThis.ReadableStream && body instanceof globalThis.ReadableStream && { duplex: "half" },
          ...body && { body },
          ...this.fetchOptions ?? {},
          ...options.fetchOptions ?? {}
        };
        return { req, url, timeout: options.timeout };
      }
      async buildHeaders({ options, method, bodyHeaders, retryCount }) {
        let idempotencyHeaders = {};
        if (this.idempotencyHeader && method !== "get") {
          if (!options.idempotencyKey)
            options.idempotencyKey = this.defaultIdempotencyKey();
          idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
        }
        const headers = buildHeaders([
          idempotencyHeaders,
          {
            Accept: "application/json",
            "User-Agent": this.getUserAgent(),
            "X-Stainless-Retry-Count": String(retryCount),
            ...options.timeout ? { "X-Stainless-Timeout": String(Math.trunc(options.timeout / 1e3)) } : {},
            ...getPlatformHeaders(),
            ...this._options.dangerouslyAllowBrowser ? { "anthropic-dangerous-direct-browser-access": "true" } : void 0,
            "anthropic-version": "2023-06-01"
          },
          await this.authHeaders(options),
          this._options.defaultHeaders,
          bodyHeaders,
          options.headers
        ]);
        this.validateHeaders(headers);
        return headers.values;
      }
      _makeAbort(controller) {
        return () => controller.abort();
      }
      buildBody({ options: { body, headers: rawHeaders } }) {
        if (!body) {
          return { bodyHeaders: void 0, body: void 0 };
        }
        const headers = buildHeaders([rawHeaders]);
        if (
          // Pass raw type verbatim
          ArrayBuffer.isView(body) || body instanceof ArrayBuffer || body instanceof DataView || typeof body === "string" && // Preserve legacy string encoding behavior for now
          headers.values.has("content-type") || // `Blob` is superset of `File`
          globalThis.Blob && body instanceof globalThis.Blob || // `FormData` -> `multipart/form-data`
          body instanceof FormData || // `URLSearchParams` -> `application/x-www-form-urlencoded`
          body instanceof URLSearchParams || // Send chunked stream (each chunk has own `length`)
          globalThis.ReadableStream && body instanceof globalThis.ReadableStream
        ) {
          return { bodyHeaders: void 0, body };
        } else if (typeof body === "object" && (Symbol.asyncIterator in body || Symbol.iterator in body && "next" in body && typeof body.next === "function")) {
          return { bodyHeaders: void 0, body: ReadableStreamFrom(body) };
        } else if (typeof body === "object" && headers.values.get("content-type") === "application/x-www-form-urlencoded") {
          return {
            bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
            body: this.stringifyQuery(body)
          };
        } else {
          return __classPrivateFieldGet(this, _BaseAnthropic_encoder, "f").call(this, { body, headers });
        }
      }
    };
    _a = BaseAnthropic, _BaseAnthropic_encoder = /* @__PURE__ */ new WeakMap(), _BaseAnthropic_instances = /* @__PURE__ */ new WeakSet(), _BaseAnthropic_baseURLOverridden = function _BaseAnthropic_baseURLOverridden2() {
      return this.baseURL !== "https://api.anthropic.com";
    };
    BaseAnthropic.Anthropic = _a;
    BaseAnthropic.HUMAN_PROMPT = HUMAN_PROMPT;
    BaseAnthropic.AI_PROMPT = AI_PROMPT;
    BaseAnthropic.DEFAULT_TIMEOUT = 6e5;
    BaseAnthropic.AnthropicError = AnthropicError;
    BaseAnthropic.APIError = APIError;
    BaseAnthropic.APIConnectionError = APIConnectionError;
    BaseAnthropic.APIConnectionTimeoutError = APIConnectionTimeoutError;
    BaseAnthropic.APIUserAbortError = APIUserAbortError;
    BaseAnthropic.NotFoundError = NotFoundError;
    BaseAnthropic.ConflictError = ConflictError;
    BaseAnthropic.RateLimitError = RateLimitError;
    BaseAnthropic.BadRequestError = BadRequestError;
    BaseAnthropic.AuthenticationError = AuthenticationError;
    BaseAnthropic.InternalServerError = InternalServerError;
    BaseAnthropic.PermissionDeniedError = PermissionDeniedError;
    BaseAnthropic.UnprocessableEntityError = UnprocessableEntityError;
    BaseAnthropic.toFile = toFile;
    Anthropic = class extends BaseAnthropic {
      constructor() {
        super(...arguments);
        this.completions = new Completions(this);
        this.messages = new Messages2(this);
        this.models = new Models2(this);
        this.beta = new Beta(this);
      }
    };
    Anthropic.Completions = Completions;
    Anthropic.Messages = Messages2;
    Anthropic.Models = Models2;
    Anthropic.Beta = Beta;
  }
});

// node_modules/@anthropic-ai/sdk/index.mjs
var sdk_exports = {};
__export(sdk_exports, {
  AI_PROMPT: () => AI_PROMPT,
  APIConnectionError: () => APIConnectionError,
  APIConnectionTimeoutError: () => APIConnectionTimeoutError,
  APIError: () => APIError,
  APIPromise: () => APIPromise,
  APIUserAbortError: () => APIUserAbortError,
  Anthropic: () => Anthropic,
  AnthropicError: () => AnthropicError,
  AuthenticationError: () => AuthenticationError,
  BadRequestError: () => BadRequestError,
  BaseAnthropic: () => BaseAnthropic,
  ConflictError: () => ConflictError,
  HUMAN_PROMPT: () => HUMAN_PROMPT,
  InternalServerError: () => InternalServerError,
  NotFoundError: () => NotFoundError,
  PagePromise: () => PagePromise,
  PermissionDeniedError: () => PermissionDeniedError,
  RateLimitError: () => RateLimitError,
  UnprocessableEntityError: () => UnprocessableEntityError,
  default: () => Anthropic,
  toFile: () => toFile
});
var init_sdk = __esm({
  "node_modules/@anthropic-ai/sdk/index.mjs"() {
    init_client();
    init_uploads2();
    init_api_promise();
    init_client();
    init_pagination();
    init_error();
  }
});

// server/index.ts
import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";

// server/routes.ts
init_db();
import { createServer } from "node:http";
import crypto5 from "node:crypto";
import session from "express-session";
import mysqlSessionFactory from "express-mysql-session";

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
  const bcrypt = require_umd();
  const adminPassword = await bcrypt.hash("admin123", 10);
  const demoPassword = await bcrypt.hash("demo123", 10);
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
init_db();
init_schema();
init_bcryptjs();
import crypto3 from "crypto";
import { eq, and, like, or, desc, inArray, sql } from "drizzle-orm";
async function createUser(data) {
  const hashed = await bcryptjs_default.hash(data.password, 10);
  const id = crypto3.randomUUID();
  await db.insert(users).values({ ...data, password: hashed, id });
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}
async function getUserByEmail(email) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}
async function getUserById(id) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}
async function updateUser(id, data) {
  await db.update(users).set(data).where(eq(users.id, id));
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}
async function verifyPassword(plaintext, hashed) {
  return bcryptjs_default.compare(plaintext, hashed);
}
async function getAllSalons() {
  return db.select().from(salons);
}
async function getSalonById(id) {
  const [salon] = await db.select().from(salons).where(eq(salons.id, id));
  return salon;
}
async function searchSalons(query) {
  return db.select().from(salons).where(
    or(like(salons.name, `%${query}%`), like(salons.address, `%${query}%`))
  );
}
async function getSalonServices(salonId) {
  return db.select().from(services).where(eq(services.salonId, salonId));
}
async function getSalonsByCategory(category) {
  const matchingServices = await db.select({ salonId: services.salonId }).from(services).where(like(services.category, category));
  const salonIds = [...new Set(matchingServices.map((s) => s.salonId))];
  if (salonIds.length === 0) return [];
  return db.select().from(salons).where(inArray(salons.id, salonIds));
}
async function getSalonPackages(salonId) {
  return db.select().from(packages).where(eq(packages.salonId, salonId));
}
async function getSalonSpecialists(salonId) {
  return db.select().from(specialists).where(eq(specialists.salonId, salonId));
}
async function getSalonReviews(salonId) {
  return db.select().from(reviews).where(eq(reviews.salonId, salonId));
}
async function createReview(data) {
  const id = crypto3.randomUUID();
  await db.insert(reviews).values({ ...data, date: "Just now", id });
  const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
  return review;
}
async function getUserBookings(userId) {
  return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
}
async function createBooking(data) {
  const id = crypto3.randomUUID();
  await db.insert(bookings).values({ ...data, id });
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
  return booking;
}
async function cancelBooking(id, userId) {
  await db.update(bookings).set({ status: "cancelled" }).where(and(eq(bookings.id, id), eq(bookings.userId, userId)));
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
  return booking;
}
async function getUserBookmarks(userId) {
  const bm = await db.select().from(bookmarkTable).where(eq(bookmarkTable.userId, userId));
  return bm.map((b) => b.salonId);
}
async function toggleBookmark(userId, salonId) {
  const [existing] = await db.select().from(bookmarkTable).where(and(eq(bookmarkTable.userId, userId), eq(bookmarkTable.salonId, salonId)));
  if (existing) {
    await db.delete(bookmarkTable).where(eq(bookmarkTable.id, existing.id));
    return false;
  } else {
    await db.insert(bookmarkTable).values({ userId, salonId });
    return true;
  }
}
async function getUserMessages(userId) {
  return db.select().from(messages).where(eq(messages.userId, userId)).orderBy(desc(messages.createdAt));
}
async function getUserNotifications(userId) {
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}
async function markNotificationRead(id, userId) {
  await db.update(notifications).set({ read: true }).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}
async function createNotification(data) {
  const id = crypto3.randomUUID();
  await db.insert(notifications).values({ ...data, id });
  const [notif] = await db.select().from(notifications).where(eq(notifications.id, id));
  return notif;
}
async function getActiveCoupons() {
  const now = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const activeCoupons = await db.select().from(coupons).where(
    and(
      eq(coupons.active, true),
      sql`${coupons.expiryDate} >= ${now}`
    )
  );
  const salonIds = [...new Set(activeCoupons.map((c) => c.salonId).filter(Boolean).filter((id) => id !== ""))];
  if (salonIds.length === 0) return activeCoupons;
  const salonList = await db.select({ id: salons.id, name: salons.name }).from(salons).where(sql`${salons.id} IN (${sql.join(salonIds.map((id) => sql`${id}`), sql`, `)})`);
  const salonMap = Object.fromEntries(salonList.map((s) => [s.id, s.name]));
  return activeCoupons.map((c) => ({
    ...c,
    salonName: c.salonId ? salonMap[c.salonId] || null : null
  }));
}
async function getCouponByCode(code) {
  const [coupon] = await db.select().from(coupons).where(eq(sql`upper(${coupons.code})`, code.toUpperCase()));
  return coupon;
}
async function updateCouponUsage(id) {
  await db.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.id, id));
}

// server/stripeClient.ts
import Stripe from "stripe";
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
  return new Stripe(secretKey);
}
async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}
async function getStripeSync() {
  return null;
}

// server/adminRoutes.ts
init_db();
init_schema();
init_bcryptjs();
import crypto4 from "crypto";
import { eq as eq3, sql as sql2, and as and2, desc as desc2, gte, lte } from "drizzle-orm";
import multer from "multer";
import path2 from "path";
import fs from "fs";

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
import os from "os";
async function requireSuperAdmin(req, res, next) {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  const [user] = await db.select().from(users).where(eq3(users.id, userId));
  if (!user || user.role !== "super_admin" && user.role !== "admin") {
    return res.status(403).json({ message: "Super admin access required" });
  }
  req.currentUser = user;
  next();
}
async function requireSalonAdmin(req, res, next) {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  const [user] = await db.select().from(users).where(eq3(users.id, userId));
  if (!user || user.role !== "salon_admin") {
    return res.status(403).json({ message: "Salon admin access required" });
  }
  const [link] = await db.select().from(salonStaff).where(and2(eq3(salonStaff.userId, userId), eq3(salonStaff.role, "salon_admin")));
  if (!link) return res.status(403).json({ message: "No salon linked to this admin" });
  const [salon] = await db.select().from(salons).where(eq3(salons.id, link.salonId));
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
  const [user] = await db.select().from(users).where(eq3(users.id, userId));
  if (!user || user.role !== "staff") {
    return res.status(403).json({ message: "Staff access required" });
  }
  const [link] = await db.select().from(salonStaff).where(and2(eq3(salonStaff.userId, userId), eq3(salonStaff.role, "staff")));
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
  const uploadsDir = path2.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path2.extname(file.originalname));
    }
  });
  const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
  const chatUpload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });
  const reelUpload = multer({ storage, limits: { fileSize: 60 * 1024 * 1024 } });
  app2.post("/api/reels/upload", reelUpload.single("file"), (req, res) => {
    if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const ext = path2.extname(req.file.originalname).toLowerCase();
    const videoExts = [".mp4", ".webm", ".mov", ".m4v"];
    if (!videoExts.includes(ext)) return res.status(400).json({ message: "Only video files are allowed" });
    res.json({ url: `/uploads/${req.file.filename}`, name: req.file.originalname, size: req.file.size });
  });
  app2.post("/api/chat/upload", chatUpload.single("file"), (req, res) => {
    if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const ext = path2.extname(req.file.originalname).toLowerCase();
    const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const videoExts = [".mp4", ".webm", ".mov"];
    let mediaType = "file";
    if (imageExts.includes(ext)) mediaType = "image";
    else if (videoExts.includes(ext)) mediaType = "video";
    res.json({ url: `/uploads/${req.file.filename}`, type: mediaType, name: req.file.originalname, size: req.file.size });
  });
  app2.get("/api/admin/stats", requireSuperAdmin, async (req, res) => {
    try {
      const [usersCount] = await db.select({ count: sql2`count(*)` }).from(users);
      const [salonsCount] = await db.select({ count: sql2`count(*)` }).from(salons);
      const [bookingsCount] = await db.select({ count: sql2`count(*)` }).from(bookings);
      const [revenue] = await db.select({ sum: sql2`coalesce(sum(${bookings.totalPrice}),0)` }).from(bookings);
      const [couponsCount] = await db.select({ count: sql2`count(*)` }).from(coupons);
      const [servicesCount] = await db.select({ count: sql2`count(*)` }).from(services);
      const [messagesCount] = await db.select({ count: sql2`count(*)` }).from(messages);
      const [pendingBookings] = await db.select({ count: sql2`count(*)` }).from(bookings).where(eq3(bookings.status, "pending"));
      const [completedBookings] = await db.select({ count: sql2`count(*)` }).from(bookings).where(eq3(bookings.status, "completed"));
      const [activeSubscriptions] = await db.select({ count: sql2`count(*)` }).from(subscriptions).where(eq3(subscriptions.status, "active"));
      const [commissionTotal] = await db.select({ sum: sql2`coalesce(sum(${commissions.amount}),0)` }).from(commissions);
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
        const [count] = await db.select({ count: sql2`count(*)` }).from(bookings).where(eq3(bookings.date, dateStr));
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
      await db.execute(sql2`SELECT 1`);
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
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.get("/api/admin/users", requireSuperAdmin, async (req, res) => {
    try {
      const { page, limit, offset } = getPagination(req);
      const [countResult] = await db.select({ count: sql2`count(*)` }).from(users);
      const allUsers = await db.select().from(users).limit(limit).offset(offset).orderBy(desc2(users.createdAt));
      res.json({ data: allUsers, total: Number(countResult.count), page, limit });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/users", requireSuperAdmin, async (req, res) => {
    try {
      const { fullName, email, password, role } = req.body;
      const hashed = await bcryptjs_default.hash(password || "password123", 10);
      const userId = crypto4.randomUUID();
      await db.insert(users).values({ fullName, email, password: hashed, role: role || "user", id: userId });
      const [user] = await db.select().from(users).where(eq3(users.id, userId));
      await logActivity({ userId: req.currentUser?.id, userRole: "super_admin", action: "user.created", entityType: "user", entityId: user.id });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/users/:id", requireSuperAdmin, async (req, res) => {
    try {
      const { fullName, email, role } = req.body;
      await db.update(users).set({ fullName, email, role }).where(eq3(users.id, String(req.params.id)));
      const [user] = await db.select().from(users).where(eq3(users.id, String(req.params.id)));
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
      const [target] = await db.select().from(users).where(eq3(users.id, targetId));
      if (target?.role === "super_admin" && target.id !== currentUserId) {
        return res.status(403).json({ message: "Cannot delete another super admin" });
      }
      await db.delete(users).where(eq3(users.id, targetId));
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
        const [ownerUser] = await db.select().from(users).where(eq3(users.email, ownerEmail)).limit(1);
        if (!ownerUser) return res.status(400).json({ message: `No user found with email "${ownerEmail}". Ask them to register first.` });
        salonData2.ownerId = ownerUser.id;
      }
      const salonId2 = crypto4.randomUUID();
      await db.insert(salons).values({ ...salonData2, id: salonId2 });
      const [salon] = await db.select().from(salons).where(eq3(salons.id, salonId2));
      if (salonData2.ownerId) {
        const existing = await db.select().from(salonStaff).where(eq3(salonStaff.salonId, salon.id)).limit(1);
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
          await db.delete(salonStaff).where(eq3(salonStaff.salonId, salonId));
        } else {
          const [ownerUser] = await db.select().from(users).where(eq3(users.email, ownerEmail)).limit(1);
          if (!ownerUser) return res.status(400).json({ message: `No user found with email "${ownerEmail}". Ask them to register first.` });
          salonData2.ownerId = ownerUser.id;
          const existing = await db.select().from(salonStaff).where(eq3(salonStaff.salonId, salonId)).limit(1);
          if (existing.length === 0) {
            await db.insert(salonStaff).values({ salonId, userId: ownerUser.id, role: "salon_admin" });
          } else {
            await db.update(salonStaff).set({ userId: ownerUser.id, role: "salon_admin" }).where(eq3(salonStaff.salonId, salonId));
          }
        }
      }
      await db.update(salons).set(salonData2).where(eq3(salons.id, salonId));
      const [salon] = await db.select().from(salons).where(eq3(salons.id, salonId));
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
      await db.delete(salons).where(eq3(salons.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/salons/:id/create-default-account", requireSuperAdmin, async (req, res) => {
    try {
      const salonId = String(req.params.id);
      const [salon] = await db.select().from(salons).where(eq3(salons.id, salonId));
      if (!salon) return res.status(404).json({ message: "Salon not found" });
      const slug = salon.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
      const email = `${slug}@barmagly.com`;
      const defaultPassword = "salon123";
      const existing = await db.select().from(users).where(eq3(users.email, email)).limit(1);
      let user = existing[0];
      if (!user) {
        const hashed = await bcryptjs_default.hash(defaultPassword, 10);
        const newUserId = crypto4.randomUUID();
        await db.insert(users).values({
          id: newUserId,
          fullName: salon.name,
          email,
          password: hashed,
          role: "salon_admin",
          phone: "",
          avatar: ""
        });
        const [created] = await db.select().from(users).where(eq3(users.id, newUserId));
        user = created;
      }
      const staffExisting = await db.select().from(salonStaff).where(eq3(salonStaff.salonId, salonId)).limit(1);
      if (staffExisting.length === 0) {
        await db.insert(salonStaff).values({ salonId, userId: user.id, role: "salon_admin" });
      } else {
        await db.update(salonStaff).set({ userId: user.id, role: "salon_admin" }).where(eq3(salonStaff.salonId, salonId));
      }
      await db.update(salons).set({ ownerId: user.id }).where(eq3(salons.id, salonId));
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
      const [countResult] = await db.select({ count: sql2`count(*)` }).from(bookings);
      const all = await db.select().from(bookings).orderBy(desc2(bookings.createdAt)).limit(limit).offset(offset);
      res.json({ data: all, total: Number(countResult.count), page, limit });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/bookings", requireSuperAdmin, async (req, res) => {
    try {
      const bookingId = crypto4.randomUUID();
      await db.insert(bookings).values({ ...req.body, status: req.body.status || "upcoming", id: bookingId });
      const [booking] = await db.select().from(bookings).where(eq3(bookings.id, bookingId));
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/bookings/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(bookings).set(req.body).where(eq3(bookings.id, String(req.params.id)));
      const [booking] = await db.select().from(bookings).where(eq3(bookings.id, String(req.params.id)));
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/bookings/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(bookings).where(eq3(bookings.id, String(req.params.id)));
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
      const couponId = crypto4.randomUUID();
      await db.insert(coupons).values({ ...req.body, id: couponId });
      const [c] = await db.select().from(coupons).where(eq3(coupons.id, couponId));
      res.json(c);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/coupons/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(coupons).set(req.body).where(eq3(coupons.id, String(req.params.id)));
      const [c] = await db.select().from(coupons).where(eq3(coupons.id, String(req.params.id)));
      res.json(c);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/coupons/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(coupons).where(eq3(coupons.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/payments", requireSuperAdmin, async (_req, res) => {
    try {
      const payments = await db.select().from(bookings).where(sql2`${bookings.paymentMethod} != ''`);
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
        const msgId = crypto4.randomUUID();
        await db.insert(messages).values({ id: msgId, userId: targetUserId, ...adminIdentity, content, sender: "salon" });
        const [msg] = await db.select().from(messages).where(eq3(messages.id, msgId));
        res.json(msg);
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/messages/reply", requireSuperAdmin, async (req, res) => {
    try {
      const { userId, salonId, salonName, salonImage, content } = req.body;
      const replyMsgId = crypto4.randomUUID();
      await db.insert(messages).values({ id: replyMsgId, userId, salonId, salonName, salonImage, content, sender: "salon" });
      const [msg] = await db.select().from(messages).where(eq3(messages.id, replyMsgId));
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
        const existing = await db.select().from(appSettings).where(eq3(appSettings.key, key));
        if (existing.length > 0) {
          await db.update(appSettings).set({ value: String(value), updatedAt: /* @__PURE__ */ new Date() }).where(eq3(appSettings.key, key));
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
        const msgId = crypto4.randomUUID();
        await db.insert(messages).values({ id: msgId, userId: targetUserId, ...adminIdentity, content, sender: "salon" });
        const [msg] = await db.select().from(messages).where(eq3(messages.id, msgId));
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
      const existing = await db.select().from(appSettings).where(eq3(appSettings.key, key));
      if (existing.length > 0) {
        await db.update(appSettings).set({ value, description, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(appSettings.key, key));
      } else {
        await db.insert(appSettings).values({ key, value, description });
      }
      const [setting] = await db.select().from(appSettings).where(eq3(appSettings.key, key));
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
      const svcId = crypto4.randomUUID();
      await db.insert(services).values({ ...req.body, id: svcId });
      const [s] = await db.select().from(services).where(eq3(services.id, svcId));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/services/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(services).set(req.body).where(eq3(services.id, String(req.params.id)));
      const [s] = await db.select().from(services).where(eq3(services.id, String(req.params.id)));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/services/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(services).where(eq3(services.id, String(req.params.id)));
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
      const planId = crypto4.randomUUID();
      await db.insert(plans).values({ ...req.body, id: planId });
      const [plan] = await db.select().from(plans).where(eq3(plans.id, planId));
      res.json(plan);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/plans/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(plans).set(req.body).where(eq3(plans.id, String(req.params.id)));
      const [plan] = await db.select().from(plans).where(eq3(plans.id, String(req.params.id)));
      res.json(plan);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/plans/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(plans).where(eq3(plans.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/subscriptions", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(subscriptions).orderBy(desc2(subscriptions.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/subscriptions", requireSuperAdmin, async (req, res) => {
    try {
      const subId = crypto4.randomUUID();
      await db.insert(subscriptions).values({ ...req.body, id: subId });
      const [sub] = await db.select().from(subscriptions).where(eq3(subscriptions.id, subId));
      await logActivity({ userId: req.currentUser?.id, userRole: "super_admin", action: "subscription.created", entityType: "subscription", entityId: sub.id, metadata: { salonId: sub.salonId, planId: sub.planId } });
      res.json(sub);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/subscriptions/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(subscriptions).set({ ...req.body, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(subscriptions.id, String(req.params.id)));
      const [sub] = await db.select().from(subscriptions).where(eq3(subscriptions.id, String(req.params.id)));
      await logActivity({ userId: req.currentUser?.id, userRole: "super_admin", action: "subscription.updated", entityType: "subscription", entityId: String(req.params.id) });
      res.json(sub);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/subscriptions/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(subscriptions).where(eq3(subscriptions.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/license-keys", requireSuperAdmin, async (_req, res) => {
    try {
      const keys = await db.select().from(licenseKeys).orderBy(desc2(licenseKeys.createdAt));
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
      const lkId = crypto4.randomUUID();
      await db.insert(licenseKeys).values({ ...req.body, key, id: lkId });
      const [lk] = await db.select().from(licenseKeys).where(eq3(licenseKeys.id, lkId));
      res.json(lk);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/license-keys/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(licenseKeys).set(req.body).where(eq3(licenseKeys.id, String(req.params.id)));
      const [lk] = await db.select().from(licenseKeys).where(eq3(licenseKeys.id, String(req.params.id)));
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
      await db.update(licenseKeys).set({ activationCount: sql2`activation_count + 1` }).where(eq3(licenseKeys.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/license-keys/:id/activations/:activationId", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(licenseActivations).where(eq3(licenseActivations.id, String(req.params.activationId)));
      await db.update(licenseKeys).set({ activationCount: sql2`GREATEST(activation_count - 1, 0)` }).where(eq3(licenseKeys.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/license-keys/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(licenseKeys).where(eq3(licenseKeys.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/activity-logs", requireSuperAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const logs = await db.select().from(activityLogs).orderBy(desc2(activityLogs.createdAt)).limit(limit);
      res.json(logs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/commissions", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(commissions).orderBy(desc2(commissions.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/commissions/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(commissions).set(req.body).where(eq3(commissions.id, String(req.params.id)));
      const [c] = await db.select().from(commissions).where(eq3(commissions.id, String(req.params.id)));
      res.json(c);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/admin/expenses", requireSuperAdmin, async (_req, res) => {
    try {
      res.json(await db.select().from(expenses).orderBy(desc2(expenses.createdAt)));
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
      const linkId = crypto4.randomUUID();
      await db.insert(salonStaff).values({ ...req.body, id: linkId });
      const [link] = await db.select().from(salonStaff).where(eq3(salonStaff.id, linkId));
      res.json(link);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/admin/salon-staff/:id", requireSuperAdmin, async (req, res) => {
    try {
      await db.delete(salonStaff).where(eq3(salonStaff.id, String(req.params.id)));
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
      const [salon] = await db.select().from(salons).where(eq3(salons.id, salonId));
      res.json(salon);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/me", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.update(salons).set(req.body).where(eq3(salons.id, salonId));
      const [salon] = await db.select().from(salons).where(eq3(salons.id, salonId));
      res.json(salon);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/subscription", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const [sub] = await db.select().from(subscriptions).where(and2(eq3(subscriptions.salonId, salonId), eq3(subscriptions.status, "active")));
      if (!sub) return res.json(null);
      const [plan] = await db.select().from(plans).where(eq3(plans.id, sub.planId));
      res.json({ ...sub, plan });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/stats", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const [todayBookings] = await db.select({ count: sql2`count(*)` }).from(bookings).where(and2(eq3(bookings.salonId, salonId), eq3(bookings.date, today)));
      const [totalBookings] = await db.select({ count: sql2`count(*)` }).from(bookings).where(eq3(bookings.salonId, salonId));
      const [revenue] = await db.select({ sum: sql2`coalesce(sum(${bookings.totalPrice}),0)` }).from(bookings).where(and2(eq3(bookings.salonId, salonId), eq3(bookings.status, "completed")));
      const [staffCount] = await db.select({ count: sql2`count(*)` }).from(salonStaff).where(eq3(salonStaff.salonId, salonId));
      const [pendingCount] = await db.select({ count: sql2`count(*)` }).from(bookings).where(and2(eq3(bookings.salonId, salonId), eq3(bookings.status, "upcoming")));
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
      const all = await db.select().from(bookings).where(eq3(bookings.salonId, salonId)).orderBy(desc2(bookings.createdAt));
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
      await db.update(bookings).set(req.body).where(and2(eq3(bookings.id, String(req.params.id)), eq3(bookings.salonId, salonId)));
      const [booking] = await db.select().from(bookings).where(eq3(bookings.id, String(req.params.id)));
      if (req.body.status === "completed" && booking) {
        let rate = 5;
        const [rateSetting] = await db.select().from(appSettings).where(eq3(appSettings.key, "default_commission_rate"));
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
      const [salon] = await db.select().from(salons).where(eq3(salons.id, salonId));
      const id = crypto4.randomUUID();
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
      const [created] = await db.select().from(bookings).where(eq3(bookings.id, id));
      res.json(created);
    } catch (err) {
      console.error("POST /api/salon/bookings error:", err);
      res.status(500).json({ message: err?.message || "Failed to create booking" });
    }
  });
  app2.post("/api/salon/bookings/:id/checkin", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const bookingId = String(req.params.id);
      const [booking] = await db.select().from(bookings).where(and2(eq3(bookings.id, bookingId), eq3(bookings.salonId, salonId)));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found in this salon" });
      }
      if (booking.status === "completed" || booking.status === "cancelled") {
        return res.status(400).json({ message: `Booking is already ${booking.status}` });
      }
      await db.update(bookings).set({ status: "confirmed" }).where(eq3(bookings.id, bookingId));
      try {
        await db.insert(notifications).values({
          userId: booking.userId,
          title: "Welcome! You've checked in",
          message: `You're all set at the salon. Your stylist will be ready shortly.`,
          type: "booking"
        });
      } catch {
      }
      const [updated] = await db.select().from(bookings).where(eq3(bookings.id, bookingId));
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err?.message || "Check-in failed" });
    }
  });
  app2.delete("/api/salon/bookings/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.delete(bookings).where(and2(eq3(bookings.id, String(req.params.id)), eq3(bookings.salonId, salonId)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err?.message || "Failed to delete booking" });
    }
  });
  app2.get("/api/salon/services", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(services).where(eq3(services.salonId, salonId)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/services", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const svcId2 = crypto4.randomUUID();
      await db.insert(services).values({ ...req.body, salonId, id: svcId2 });
      const [s] = await db.select().from(services).where(eq3(services.id, svcId2));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/services/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.update(services).set(req.body).where(and2(eq3(services.id, String(req.params.id)), eq3(services.salonId, salonId)));
      const [s] = await db.select().from(services).where(eq3(services.id, String(req.params.id)));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/services/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.delete(services).where(and2(eq3(services.id, String(req.params.id)), eq3(services.salonId, salonId)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/staff", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const links = await db.select().from(salonStaff).where(eq3(salonStaff.salonId, salonId));
      const staffUsers = await Promise.all(links.map(async (l) => {
        const [u] = await db.select({ id: users.id, fullName: users.fullName, email: users.email, phone: users.phone, avatar: users.avatar, role: users.role }).from(users).where(eq3(users.id, l.userId));
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
      const hashed = await bcryptjs_default.hash(password || "password123", 10);
      const newUserId2 = crypto4.randomUUID();
      await db.insert(users).values({ id: newUserId2, fullName, email, password: hashed, role: staffRole === "salon_admin" ? "salon_admin" : "staff" });
      const [newUser] = await db.select().from(users).where(eq3(users.id, newUserId2));
      const linkId2 = crypto4.randomUUID();
      await db.insert(salonStaff).values({ id: linkId2, userId: newUser.id, salonId, role: staffRole });
      const [link] = await db.select().from(salonStaff).where(eq3(salonStaff.id, linkId2));
      res.json({ ...newUser, linkId: link.id, staffRole: link.role });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/staff/:linkId", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.delete(salonStaff).where(and2(eq3(salonStaff.id, String(req.params.linkId)), eq3(salonStaff.salonId, salonId)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/staff/:userId", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const userId = String(req.params.userId);
      const [link] = await db.select().from(salonStaff).where(and2(eq3(salonStaff.userId, userId), eq3(salonStaff.salonId, salonId)));
      if (!link) return res.status(404).json({ message: "Staff not found" });
      const { fullName, email, password, staffRole, phone, avatar } = req.body || {};
      const update = {};
      if (fullName) update.fullName = fullName;
      if (email) update.email = email;
      if (phone !== void 0) update.phone = phone;
      if (avatar !== void 0) update.avatar = avatar;
      if (password) update.password = await bcryptjs_default.hash(password, 10);
      if (staffRole === "salon_admin" || staffRole === "staff") update.role = staffRole;
      if (Object.keys(update).length > 0) {
        await db.update(users).set(update).where(eq3(users.id, userId));
      }
      if (staffRole) {
        await db.update(salonStaff).set({ role: staffRole }).where(eq3(salonStaff.id, link.id));
      }
      const [u] = await db.select().from(users).where(eq3(users.id, userId));
      const [updatedLink] = await db.select().from(salonStaff).where(eq3(salonStaff.id, link.id));
      res.json({ ...u, linkId: updatedLink.id, staffRole: updatedLink.role });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/staff/:userId/profile", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const userId = String(req.params.userId);
      const [link] = await db.select().from(salonStaff).where(and2(eq3(salonStaff.userId, userId), eq3(salonStaff.salonId, salonId)));
      if (!link) return res.status(404).json({ message: "Staff not found" });
      const [u] = await db.select().from(users).where(eq3(users.id, userId));
      const staffBookings = await db.select().from(bookings).where(and2(eq3(bookings.salonId, salonId), eq3(bookings.specialistId, userId))).orderBy(desc2(bookings.createdAt));
      res.json({
        user: { id: u?.id, fullName: u?.fullName, email: u?.email, phone: u?.phone, avatar: u?.avatar, role: u?.role },
        staffRole: link.role,
        bookings: staffBookings,
        stats: {
          totalBookings: staffBookings.length,
          completed: staffBookings.filter((b) => b.status === "completed").length,
          cancelled: staffBookings.filter((b) => b.status === "cancelled").length,
          totalRevenue: staffBookings.filter((b) => b.status === "completed").reduce((s, b) => s + (Number(b.totalPrice) || 0), 0)
        }
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/customers", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const rows = await db.select({
        userId: bookings.userId,
        count: sql2`count(*)`,
        lastVisit: sql2`max(${bookings.date})`,
        totalSpent: sql2`sum(${bookings.totalPrice})`
      }).from(bookings).where(eq3(bookings.salonId, salonId)).groupBy(bookings.userId);
      const customers = await Promise.all(rows.map(async (r) => {
        const [u] = await db.select({ id: users.id, fullName: users.fullName, email: users.email, phone: users.phone, avatar: users.avatar, loyaltyPoints: users.loyaltyPoints }).from(users).where(eq3(users.id, r.userId));
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
      res.json(await db.select().from(expenses).where(eq3(expenses.salonId, salonId)).orderBy(desc2(expenses.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/expenses", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const expId = crypto4.randomUUID();
      await db.insert(expenses).values({ ...req.body, salonId, id: expId });
      const [e] = await db.select().from(expenses).where(eq3(expenses.id, expId));
      res.json(e);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/expenses/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.update(expenses).set(req.body).where(and2(eq3(expenses.id, String(req.params.id)), eq3(expenses.salonId, salonId)));
      const [e] = await db.select().from(expenses).where(eq3(expenses.id, String(req.params.id)));
      res.json(e);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/expenses/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.delete(expenses).where(and2(eq3(expenses.id, String(req.params.id)), eq3(expenses.salonId, salonId)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/coupons", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(coupons).where(eq3(coupons.salonId, salonId)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/coupons", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const couponId = crypto4.randomUUID();
      await db.insert(coupons).values({ ...req.body, salonId, id: couponId });
      const [c] = await db.select().from(coupons).where(eq3(coupons.id, couponId));
      res.json(c);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/coupons/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.update(coupons).set(req.body).where(and2(eq3(coupons.id, String(req.params.id)), eq3(coupons.salonId, salonId)));
      const [c] = await db.select().from(coupons).where(eq3(coupons.id, String(req.params.id)));
      res.json(c);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/coupons/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.delete(coupons).where(and2(eq3(coupons.id, String(req.params.id)), eq3(coupons.salonId, salonId)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/shifts", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(shifts).where(eq3(shifts.salonId, salonId)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/shifts", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const shiftId = crypto4.randomUUID();
      await db.insert(shifts).values({ ...req.body, salonId, id: shiftId });
      const [s] = await db.select().from(shifts).where(eq3(shifts.id, shiftId));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/shifts/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.update(shifts).set(req.body).where(and2(eq3(shifts.id, String(req.params.id)), eq3(shifts.salonId, salonId)));
      const [s] = await db.select().from(shifts).where(eq3(shifts.id, String(req.params.id)));
      res.json(s);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/shifts/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      await db.delete(shifts).where(and2(eq3(shifts.id, String(req.params.id)), eq3(shifts.salonId, salonId)));
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
        salonId ? and2(eq3(bookings.salonId, salonId), eq3(bookings.specialistId, userId)) : eq3(bookings.specialistId, userId)
      ).orderBy(desc2(bookings.date));
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
      await db.update(bookings).set({ status: req.body.status }).where(and2(eq3(bookings.id, String(req.params.id)), eq3(bookings.specialistId, userId)));
      const [booking] = await db.select().from(bookings).where(eq3(bookings.id, String(req.params.id)));
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
        salonId ? and2(eq3(bookings.salonId, salonId), eq3(bookings.specialistId, userId)) : eq3(bookings.specialistId, userId)
      ).orderBy(desc2(bookings.date));
      res.json(all);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/staff/profile", requireStaff, async (req, res) => {
    try {
      const userId = req.session?.userId;
      const { name, email, phone } = req.body;
      await db.update(users).set({ fullName: name, email, phone }).where(eq3(users.id, userId));
      const [user] = await db.select().from(users).where(eq3(users.id, userId));
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/staff/shifts", requireStaff, async (req, res) => {
    try {
      const userId = req.session?.userId;
      const salonId = req.salonId;
      res.json(await db.select().from(shifts).where(and2(eq3(shifts.staffId, userId), eq3(shifts.salonId, salonId))));
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
        and2(
          eq3(bookings.specialistId, userId),
          eq3(bookings.status, "completed"),
          gte(bookings.createdAt, start)
        )
      );
      const myTips = await db.select().from(tips).where(
        and2(eq3(tips.staffId, userId), gte(tips.createdAt, start))
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
      const activations = await db.select().from(licenseActivations).where(eq3(licenseActivations.deviceId, deviceId));
      if (activations.length === 0) return res.json({ active: false, activations: [] });
      const now = /* @__PURE__ */ new Date();
      const results = [];
      for (const act of activations) {
        const [lk] = await db.select().from(licenseKeys).where(eq3(licenseKeys.id, act.licenseKeyId));
        if (!lk) continue;
        if (lk.status === "revoked" || lk.status === "suspended") continue;
        if (lk.expiresAt && new Date(lk.expiresAt) < now) continue;
        let salonName = "";
        if (lk.salonId) {
          const [salon] = await db.select().from(salons).where(eq3(salons.id, lk.salonId));
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
      const [lk] = await db.select().from(licenseKeys).where(eq3(licenseKeys.key, licenseKey.toUpperCase()));
      if (!lk) return res.status(404).json({ message: "Invalid license key" });
      if (lk.status === "revoked") return res.status(403).json({ message: "License key has been revoked" });
      if (lk.status === "suspended") return res.status(403).json({ message: "License key is suspended" });
      if (lk.expiresAt && new Date(lk.expiresAt) < /* @__PURE__ */ new Date()) {
        return res.status(403).json({ message: "License key has expired" });
      }
      const effectiveDeviceId = deviceId || `web-${email}`;
      const existingActivations = await db.select().from(licenseActivations).where(eq3(licenseActivations.licenseKeyId, lk.id));
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
        }).where(eq3(licenseKeys.id, lk.id));
      }
      let salonName = "";
      if (lk.salonId) {
        const [salon] = await db.select().from(salons).where(eq3(salons.id, lk.salonId));
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
        and2(eq3(bookings.salonId, salonId), gte(bookings.createdAt, start))
      );
      const prevStart = new Date(start.getTime() - (now.getTime() - start.getTime()));
      const prevBookings = await db.select().from(bookings).where(
        and2(eq3(bookings.salonId, salonId), gte(bookings.createdAt, prevStart), lte(bookings.createdAt, start))
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
        and2(eq3(customerNotes.salonId, salonId), eq3(customerNotes.customerId, String(req.params.customerId)))
      ).orderBy(desc2(customerNotes.createdAt));
      res.json(notes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/customers/:customerId/notes", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const noteId = crypto4.randomUUID();
      await db.insert(customerNotes).values({
        id: noteId,
        salonId,
        customerId: String(req.params.customerId),
        note: req.body.note
      });
      const [note] = await db.select().from(customerNotes).where(eq3(customerNotes.id, noteId));
      res.json(note);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/inventory", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(inventory).where(eq3(inventory.salonId, salonId)).orderBy(desc2(inventory.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/inventory", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const invId = crypto4.randomUUID();
      await db.insert(inventory).values({ ...req.body, salonId, id: invId });
      const [item] = await db.select().from(inventory).where(eq3(inventory.id, invId));
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/inventory/:id", requireSalonAdmin, async (req, res) => {
    try {
      await db.update(inventory).set(req.body).where(eq3(inventory.id, String(req.params.id)));
      const [item] = await db.select().from(inventory).where(eq3(inventory.id, String(req.params.id)));
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/inventory/:id", requireSalonAdmin, async (req, res) => {
    try {
      await db.delete(inventory).where(eq3(inventory.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/products", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(products).where(eq3(products.salonId, salonId)).orderBy(desc2(products.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/products", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const [salon] = await db.select().from(salons).where(eq3(salons.id, salonId));
      const productId = crypto4.randomUUID();
      await db.insert(products).values({ ...req.body, salonId, salonName: salon?.name || "", id: productId });
      const [p] = await db.select().from(products).where(eq3(products.id, productId));
      res.json(p);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/products/:id", requireSalonAdmin, async (req, res) => {
    try {
      await db.update(products).set(req.body).where(eq3(products.id, String(req.params.id)));
      const [p] = await db.select().from(products).where(eq3(products.id, String(req.params.id)));
      res.json(p);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/products/:id", requireSalonAdmin, async (req, res) => {
    try {
      await db.delete(products).where(eq3(products.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/product-orders", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const orders = await db.select().from(productOrders).where(eq3(productOrders.salonId, salonId)).orderBy(desc2(productOrders.createdAt));
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/product-orders/:id", requireSalonAdmin, async (req, res) => {
    try {
      await db.update(productOrders).set(req.body).where(eq3(productOrders.id, String(req.params.id)));
      const [o] = await db.select().from(productOrders).where(eq3(productOrders.id, String(req.params.id)));
      res.json(o);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const salonId = req.query.salonId ? String(req.query.salonId) : void 0;
      const allProducts = salonId ? await db.select().from(products).where(and2(eq3(products.isActive, true), eq3(products.salonId, salonId))) : await db.select().from(products).where(eq3(products.isActive, true));
      res.json(allProducts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const [p] = await db.select().from(products).where(eq3(products.id, String(req.params.id)));
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
      const orderId = crypto4.randomUUID();
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
        await db.update(products).set({ stock: sql2`GREATEST(stock - ${item.qty || 1}, 0)` }).where(eq3(products.id, item.id));
      }
      try {
        const { salonStaff: salonStaffTable } = (init_schema(), __toCommonJS(schema_exports));
        const staffLinks = await db.select().from(salonStaffTable).where(eq3(salonStaffTable.salonId, salonId));
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
      const [order] = await db.select().from(productOrders).where(eq3(productOrders.id, orderId));
      res.status(201).json(order);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/product-orders/my", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const myOrders = await db.select().from(productOrders).where(eq3(productOrders.userId, userId)).orderBy(desc2(productOrders.createdAt));
      res.json(myOrders);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/users/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const id = String(req.params.id);
      const [u] = await db.select().from(users).where(eq3(users.id, id));
      if (!u) return res.status(404).json({ message: "User not found" });
      res.json({ id: u.id, fullName: u.fullName, phone: u.phone, avatar: u.avatar, email: u.email });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/messages", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const me = req.currentUser;
      const myId = me?.id;
      const allMsgs = await db.select().from(messages).where(eq3(messages.salonId, salonId)).orderBy(desc2(messages.createdAt));
      const filtered = allMsgs.filter((m) => {
        const r = m.recipientUserId || "";
        return r === "" || r === myId;
      });
      const convMap = /* @__PURE__ */ new Map();
      for (const m of filtered) {
        if (!convMap.has(m.userId)) {
          const [u] = await db.select().from(users).where(eq3(users.id, m.userId));
          convMap.set(m.userId, {
            userId: m.userId,
            userName: u?.fullName || "Unknown",
            userAvatar: u?.avatar || "",
            userEmail: u?.email || "",
            lastMessage: m.content,
            lastMessageAt: m.createdAt,
            sender: m.sender,
            unreadCount: filtered.filter((x) => x.userId === m.userId && x.sender === "user" && !x.isRead).length
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
      const me = req.currentUser;
      const myId = me?.id;
      const msgs = await db.select().from(messages).where(
        and2(eq3(messages.salonId, salonId), eq3(messages.userId, userId))
      ).orderBy(messages.createdAt);
      const own = msgs.filter((m) => {
        const r = m.recipientUserId || "";
        return r === "" || r === myId;
      });
      await db.update(messages).set({ isRead: 1 }).where(
        and2(eq3(messages.salonId, salonId), eq3(messages.userId, userId), eq3(messages.sender, "user"))
      );
      res.json(own);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/messages/:userId", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const userId = String(req.params.userId);
      const currentUser = req.currentUser;
      const [salon] = await db.select().from(salons).where(eq3(salons.id, salonId));
      const msgId = crypto4.randomUUID();
      await db.insert(messages).values({
        id: msgId,
        userId,
        salonId,
        salonName: salon?.name || "Salon",
        salonImage: salon?.image || "",
        content: req.body.content,
        sender: "salon",
        senderName: currentUser?.fullName || "Salon Admin",
        senderRole: "salon_admin",
        recipientUserId: currentUser?.id || "",
        messageType: req.body.messageType || "text",
        isRead: 0
      });
      const [msg] = await db.select().from(messages).where(eq3(messages.id, msgId));
      res.json(msg);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/staff/messages", requireStaff, async (req, res) => {
    try {
      const salonId = req.salonId;
      const me = req.currentUser;
      const myId = me?.id;
      const allMsgs = await db.select().from(messages).where(eq3(messages.salonId, salonId)).orderBy(desc2(messages.createdAt));
      const filtered = allMsgs.filter((m) => (m.recipientUserId || "") === myId);
      const convMap = /* @__PURE__ */ new Map();
      for (const m of filtered) {
        if (!convMap.has(m.userId)) {
          const [u] = await db.select().from(users).where(eq3(users.id, m.userId));
          convMap.set(m.userId, {
            userId: m.userId,
            userName: u?.fullName || "Unknown",
            userAvatar: u?.avatar || "",
            lastMessage: m.content,
            lastMessageAt: m.createdAt,
            sender: m.sender,
            unreadCount: filtered.filter((x) => x.userId === m.userId && x.sender === "user" && !x.isRead).length
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
      const me = req.currentUser;
      const myId = me?.id;
      const msgs = await db.select().from(messages).where(
        and2(eq3(messages.salonId, salonId), eq3(messages.userId, userId))
      ).orderBy(messages.createdAt);
      const own = msgs.filter((m) => (m.recipientUserId || "") === myId);
      await db.update(messages).set({ isRead: 1 }).where(
        and2(eq3(messages.salonId, salonId), eq3(messages.userId, userId), eq3(messages.sender, "user"))
      );
      res.json(own);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/staff/messages/:userId", requireStaff, async (req, res) => {
    try {
      const salonId = req.salonId;
      const userId = String(req.params.userId);
      const currentUser = req.currentUser;
      const [salon] = await db.select().from(salons).where(eq3(salons.id, salonId));
      const msgId = crypto4.randomUUID();
      await db.insert(messages).values({
        id: msgId,
        userId,
        salonId,
        salonName: salon?.name || "Salon",
        salonImage: salon?.image || "",
        content: req.body.content,
        sender: "salon",
        senderName: currentUser?.fullName || "Staff",
        senderRole: "staff",
        recipientUserId: currentUser?.id || "",
        messageType: req.body.messageType || "text",
        isRead: 0
      });
      const [msg] = await db.select().from(messages).where(eq3(messages.id, msgId));
      res.json(msg);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/pos-checkout", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const currentUser = req.currentUser;
      const [salon] = await db.select().from(salons).where(eq3(salons.id, salonId));
      const { customerName, items, subtotal, discount, tax, total, paymentMethod, note, invoiceNo } = req.body;
      const bookingId = crypto4.randomUUID();
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
      const [posRateSetting] = await db.select().from(appSettings).where(eq3(appSettings.key, "default_commission_rate"));
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
      const tipId = crypto4.randomUUID();
      await db.insert(tips).values({ ...req.body, salonId, id: tipId });
      const [tip] = await db.select().from(tips).where(eq3(tips.id, tipId));
      res.json(tip);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/tips", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      res.json(await db.select().from(tips).where(eq3(tips.salonId, salonId)).orderBy(desc2(tips.createdAt)));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/notifications", requireSalonAdmin, async (req, res) => {
    try {
      const userId = req.currentUser.id;
      const notifs = await db.select().from(notifications).where(eq3(notifications.userId, userId)).orderBy(desc2(notifications.createdAt)).limit(50);
      res.json(notifs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/notifications/:id/read", requireSalonAdmin, async (req, res) => {
    try {
      await db.update(notifications).set({ read: true }).where(eq3(notifications.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/salon/notifications/read-all", requireSalonAdmin, async (req, res) => {
    try {
      const userId = req.currentUser.id;
      await db.update(notifications).set({ read: true }).where(eq3(notifications.userId, userId));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/staff/notifications", requireStaff, async (req, res) => {
    try {
      const userId = req.currentUser.id;
      const notifs = await db.select().from(notifications).where(eq3(notifications.userId, userId)).orderBy(desc2(notifications.createdAt)).limit(50);
      res.json(notifs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/staff/notifications/:id/read", requireStaff, async (req, res) => {
    try {
      await db.update(notifications).set({ read: true }).where(eq3(notifications.id, String(req.params.id)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/loyalty/my-transactions", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const txns = await db.select().from(loyaltyTransactions).where(eq3(loyaltyTransactions.userId, userId)).orderBy(desc2(loyaltyTransactions.createdAt));
      const [user] = await db.select().from(users).where(eq3(users.id, userId));
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
      const [user] = await db.select().from(users).where(eq3(users.id, userId));
      if (!user || (user.loyaltyPoints ?? 0) < points) {
        return res.status(400).json({ message: "Insufficient loyalty points" });
      }
      await db.update(users).set({ loyaltyPoints: (user.loyaltyPoints ?? 0) - points }).where(eq3(users.id, userId));
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
        const [existing] = await db.select().from(salons).where(and2(eq3(salons.landingSlug, slug), sql2`id != ${salonId}`));
        if (existing) return res.status(400).json({ message: "This slug is already in use by another salon." });
        const updates = { landingSlug: slug };
        if (landingEnabled !== void 0) updates.landingEnabled = landingEnabled;
        if (landingTheme !== void 0) updates.landingTheme = landingTheme;
        if (landingAccentColor !== void 0) updates.landingAccentColor = landingAccentColor;
        if (landingBookingUrl !== void 0) updates.landingBookingUrl = landingBookingUrl;
        await db.update(salons).set(updates).where(eq3(salons.id, salonId));
      } else {
        const updates = {};
        if (landingEnabled !== void 0) updates.landingEnabled = landingEnabled;
        if (landingTheme !== void 0) updates.landingTheme = landingTheme;
        if (landingAccentColor !== void 0) updates.landingAccentColor = landingAccentColor;
        if (landingBookingUrl !== void 0) updates.landingBookingUrl = landingBookingUrl;
        if (Object.keys(updates).length) await db.update(salons).set(updates).where(eq3(salons.id, salonId));
      }
      const [updated] = await db.select().from(salons).where(eq3(salons.id, salonId));
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/admin/landing-pages/:salonId/reset-views", requireSuperAdmin, async (req, res) => {
    try {
      await db.update(salons).set({ landingViews: 0 }).where(eq3(salons.id, String(req.params.salonId)));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/salon/:slug", async (req, res) => {
    try {
      const slug = String(req.params.slug).toLowerCase();
      const [salon] = await db.select().from(salons).where(and2(eq3(salons.landingSlug, slug), eq3(salons.landingEnabled, true)));
      if (!salon) {
        return res.status(404).send(`<!DOCTYPE html><html><head><title>Not Found</title><style>body{background:#181A20;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column}</style></head><body><h1 style="font-size:3rem">404</h1><p>Salon page not found or not yet published.</p></body></html>`);
      }
      await db.update(salons).set({ landingViews: (salon.landingViews ?? 0) + 1 }).where(eq3(salons.id, salon.id));
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
  app2.get("/api/reels", async (req, res) => {
    try {
      const salonId = req.query.salonId ? String(req.query.salonId) : void 0;
      const conds = [eq3(reels.status, "approved")];
      if (salonId) conds.push(eq3(reels.salonId, salonId));
      const list = await db.select().from(reels).where(and2(...conds)).orderBy(desc2(reels.createdAt));
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/reels/mine", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const list = await db.select().from(reels).where(eq3(reels.userId, userId)).orderBy(desc2(reels.createdAt));
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/reels", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const [u] = await db.select().from(users).where(eq3(users.id, userId));
      const { salonId, bookingId, videoUrl, thumbnailUrl, caption, rating } = req.body || {};
      if (!salonId || !videoUrl) return res.status(400).json({ message: "salonId and videoUrl required" });
      const completed = await db.select().from(bookings).where(and2(
        eq3(bookings.userId, userId),
        eq3(bookings.salonId, String(salonId)),
        eq3(bookings.status, "completed")
      ));
      if (completed.length === 0) {
        return res.status(403).json({ message: "You can only post a reel after a completed service at this salon" });
      }
      const [salon] = await db.select().from(salons).where(eq3(salons.id, String(salonId)));
      const reelId = crypto4.randomUUID();
      await db.insert(reels).values({
        id: reelId,
        userId,
        userName: u?.fullName || "",
        userAvatar: u?.avatar || "",
        salonId: String(salonId),
        salonName: salon?.name || "",
        bookingId: bookingId ? String(bookingId) : "",
        videoUrl: String(videoUrl),
        thumbnailUrl: thumbnailUrl ? String(thumbnailUrl) : "",
        caption: caption ? String(caption).slice(0, 500) : "",
        rating: typeof rating === "number" ? Math.max(1, Math.min(5, rating)) : 5,
        status: "pending"
      });
      try {
        const staffLinks = await db.select().from(salonStaff).where(eq3(salonStaff.salonId, String(salonId)));
        for (const link of staffLinks) {
          await db.insert(notifications).values({
            userId: link.userId,
            title: "New Reel \u2014 Pending Review",
            message: `${u?.fullName || "A customer"} posted a video review`,
            type: "review"
          });
        }
      } catch {
      }
      const [r] = await db.select().from(reels).where(eq3(reels.id, reelId));
      res.status(201).json(r);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/reels/:id/comments", async (req, res) => {
    try {
      const reelId = String(req.params.id);
      const list = await db.select().from(reelComments).where(eq3(reelComments.reelId, reelId)).orderBy(desc2(reelComments.createdAt));
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/reels/:id/comments", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const reelId = String(req.params.id);
      const text2 = String(req.body && req.body.text || "").trim();
      if (!text2) return res.status(400).json({ message: "Empty comment" });
      const [u] = await db.select().from(users).where(eq3(users.id, userId));
      const id = crypto4.randomUUID();
      await db.insert(reelComments).values({
        id,
        reelId,
        userId,
        userName: u?.fullName || "",
        userAvatar: u?.avatar || "",
        text: text2.slice(0, 500)
      });
      const [c] = await db.select().from(reelComments).where(eq3(reelComments.id, id));
      res.status(201).json(c);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/reels/:reelId/comments/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const id = String(req.params.id);
      const [c] = await db.select().from(reelComments).where(eq3(reelComments.id, id));
      if (!c) return res.status(404).json({ message: "Not found" });
      let allowed = c.userId === userId;
      if (!allowed) {
        const [r] = await db.select().from(reels).where(eq3(reels.id, c.reelId));
        if (r) {
          const [link] = await db.select().from(salonStaff).where(and2(eq3(salonStaff.salonId, r.salonId), eq3(salonStaff.userId, userId), eq3(salonStaff.role, "salon_admin")));
          if (link) allowed = true;
        }
      }
      if (!allowed) return res.status(403).json({ message: "Forbidden" });
      await db.delete(reelComments).where(eq3(reelComments.id, id));
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/reels/:id/like", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const reelId = String(req.params.id);
      const existing = await db.select().from(reelLikes).where(and2(eq3(reelLikes.reelId, reelId), eq3(reelLikes.userId, userId)));
      if (existing.length > 0) {
        await db.delete(reelLikes).where(and2(eq3(reelLikes.reelId, reelId), eq3(reelLikes.userId, userId)));
        await db.update(reels).set({ likes: sql2`GREATEST(${reels.likes} - 1, 0)` }).where(eq3(reels.id, reelId));
        const [r2] = await db.select().from(reels).where(eq3(reels.id, reelId));
        return res.json({ liked: false, likes: r2?.likes || 0 });
      }
      await db.insert(reelLikes).values({ id: crypto4.randomUUID(), reelId, userId });
      await db.update(reels).set({ likes: sql2`${reels.likes} + 1` }).where(eq3(reels.id, reelId));
      const [r] = await db.select().from(reels).where(eq3(reels.id, reelId));
      res.json({ liked: true, likes: r?.likes || 0 });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/reels/:id/view", async (req, res) => {
    try {
      await db.update(reels).set({ views: sql2`${reels.views} + 1` }).where(eq3(reels.id, String(req.params.id)));
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/reels", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const { customerUserId, customerName: customerNameInput, videoUrl, thumbnailUrl, caption, rating, autoApprove } = req.body || {};
      if (!videoUrl) return res.status(400).json({ message: "videoUrl required" });
      let resolvedUserId = customerUserId ? String(customerUserId) : "";
      let resolvedUserName = customerNameInput ? String(customerNameInput) : "";
      let resolvedUserAvatar = "";
      if (resolvedUserId) {
        const [u] = await db.select().from(users).where(eq3(users.id, resolvedUserId));
        if (u) {
          resolvedUserName = u.fullName || resolvedUserName;
          resolvedUserAvatar = u.avatar || "";
        }
      }
      if (!resolvedUserName) resolvedUserName = "Customer";
      const [salon] = await db.select().from(salons).where(eq3(salons.id, salonId));
      const reelId = crypto4.randomUUID();
      const status = autoApprove === false ? "pending" : "approved";
      await db.insert(reels).values({
        id: reelId,
        userId: resolvedUserId || (req.currentUser?.id || ""),
        userName: resolvedUserName,
        userAvatar: resolvedUserAvatar,
        salonId,
        salonName: salon?.name || "",
        bookingId: "",
        videoUrl: String(videoUrl),
        thumbnailUrl: thumbnailUrl ? String(thumbnailUrl) : "",
        caption: caption ? String(caption).slice(0, 500) : "",
        rating: typeof rating === "number" ? Math.max(1, Math.min(5, rating)) : 5,
        status,
        approvedAt: status === "approved" ? /* @__PURE__ */ new Date() : null
      });
      const [r] = await db.select().from(reels).where(eq3(reels.id, reelId));
      res.status(201).json(r);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/salon/reels", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const status = req.query.status ? String(req.query.status) : void 0;
      const conds = [eq3(reels.salonId, salonId)];
      if (status) conds.push(eq3(reels.status, status));
      const list = await db.select().from(reels).where(and2(...conds)).orderBy(desc2(reels.createdAt));
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/reels/:id/approve", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const reelId = String(req.params.id);
      const [existing] = await db.select().from(reels).where(eq3(reels.id, reelId));
      if (!existing || existing.salonId !== salonId) return res.status(404).json({ message: "Reel not found" });
      await db.update(reels).set({ status: "approved", approvedAt: /* @__PURE__ */ new Date() }).where(eq3(reels.id, reelId));
      try {
        await db.insert(notifications).values({
          userId: existing.userId,
          title: "Your reel was approved!",
          message: `Your video review for ${existing.salonName || "the salon"} is now live.`,
          type: "review"
        });
      } catch {
      }
      const [r] = await db.select().from(reels).where(eq3(reels.id, reelId));
      res.json(r);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/salon/reels/:id/reject", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const reelId = String(req.params.id);
      const reason = req.body && req.body.reason ? String(req.body.reason) : "";
      const [existing] = await db.select().from(reels).where(eq3(reels.id, reelId));
      if (!existing || existing.salonId !== salonId) return res.status(404).json({ message: "Reel not found" });
      await db.update(reels).set({ status: "rejected", rejectionReason: reason }).where(eq3(reels.id, reelId));
      try {
        await db.insert(notifications).values({
          userId: existing.userId,
          title: "Your reel was not approved",
          message: reason || "Please review the salon's reel guidelines.",
          type: "review"
        });
      } catch {
      }
      const [r] = await db.select().from(reels).where(eq3(reels.id, reelId));
      res.json(r);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.delete("/api/salon/reels/:id", requireSalonAdmin, async (req, res) => {
    try {
      const salonId = req.salonId;
      const reelId = String(req.params.id);
      const [existing] = await db.select().from(reels).where(eq3(reels.id, reelId));
      if (!existing || existing.salonId !== salonId) return res.status(404).json({ message: "Reel not found" });
      await db.delete(reelLikes).where(eq3(reelLikes.reelId, reelId));
      await db.delete(reels).where(eq3(reels.id, reelId));
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
}

// server/routes.ts
init_schema();
import { z } from "zod";
import { eq as eq4, and as and3, sql as sql3 } from "drizzle-orm";
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
var signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});
var signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});
var bookingSchema = z.object({
  salonId: z.string().min(1, "Salon ID is required"),
  salonName: z.string().min(1, "Salon name is required"),
  salonImage: z.string().optional().default(""),
  services: z.array(z.string()).default([]),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  totalPrice: z.number().min(0, "Price must be non-negative"),
  paymentMethod: z.string().optional().default(""),
  couponId: z.string().optional()
});
var reviewSchema = z.object({
  salonId: z.string().min(1, "Salon ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1e3).optional().default("")
});
var MySQLStore = mysqlSessionFactory(session);
async function registerRoutes(app2) {
  const sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 9e5,
    expiration: 30 * 24 * 60 * 60 * 1e3,
    createDatabaseTable: true
  }, pool);
  app2.set("trust proxy", 1);
  app2.use(
    session({
      name: "barmagly.sid",
      store: sessionStore,
      secret: process.env.SESSION_SECRET || crypto5.randomBytes(32).toString("hex"),
      resave: false,
      saveUninitialized: false,
      // Refresh expiration on every authenticated request so the cookie doesn't expire mid-session
      rolling: true,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1e3,
        // For same-origin web traffic, "lax" is the most reliable across browsers.
        // Native apps don't send same-site at all, so this only affects web.
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        path: "/"
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
        const { eq: eqOp } = __require("drizzle-orm");
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
        const staffLinks = await db.select().from(salonStaffTable).where(eq4(salonStaffTable.salonId, salonId));
        const [customer] = await db.select().from(users).where(eq4(users.id, userId));
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
      msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const grouped = {};
      for (const m of msgs) {
        const recipient = m.recipientUserId || "";
        const key = `${m.salonId}::${recipient}`;
        if (!grouped[key]) {
          let chatName = m.salonName;
          let chatImage = m.salonImage;
          let chatRole = "";
          if (recipient) {
            try {
              const [u] = await db.select().from(users).where(eq4(users.id, recipient));
              if (u) {
                chatName = `${u.fullName}${m.salonName ? ` \u2014 ${m.salonName}` : ""}`;
                chatImage = u.avatar || m.salonImage;
                chatRole = u.role || "";
              }
            } catch {
            }
          }
          grouped[key] = {
            salonId: m.salonId,
            recipientUserId: recipient,
            salonName: m.salonName,
            chatName,
            chatImage,
            chatRole,
            salonImage: m.salonImage,
            lastMessage: m.content,
            time: m.createdAt,
            sender: m.sender,
            unread: msgs.filter((x) => x.salonId === m.salonId && (x.recipientUserId || "") === recipient && x.sender === "salon" && !x.isRead).length
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
      const recipientUserId = req.query.recipientUserId ? String(req.query.recipientUserId) : "";
      const conds = [eq4(messages.userId, userId), eq4(messages.salonId, salonId)];
      if (recipientUserId) {
        conds.push(eq4(messages.recipientUserId, recipientUserId));
      } else {
        conds.push(eq4(messages.recipientUserId, ""));
      }
      const msgs = await db.select().from(messages).where(and3(...conds)).orderBy(messages.createdAt);
      const readConds = [eq4(messages.userId, userId), eq4(messages.salonId, salonId), eq4(messages.sender, "salon")];
      if (recipientUserId) readConds.push(eq4(messages.recipientUserId, recipientUserId));
      else readConds.push(eq4(messages.recipientUserId, ""));
      await db.update(messages).set({ isRead: 1 }).where(and3(...readConds));
      res.json(msgs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const [currentUser] = await db.select().from(users).where(eq4(users.id, userId));
      const { salonId, salonName, salonImage, content, messageType, recipientUserId } = req.body;
      const msgId = crypto5.randomUUID();
      const recipient = recipientUserId ? String(recipientUserId) : "";
      await db.insert(messages).values({
        id: msgId,
        userId,
        salonId,
        salonName,
        salonImage: salonImage || "",
        content,
        sender: "user",
        senderName: currentUser?.fullName || "",
        senderRole: "customer",
        recipientUserId: recipient,
        isRead: 0,
        messageType: messageType || "text"
      });
      const [msg] = await db.select().from(messages).where(eq4(messages.id, msgId));
      try {
        if (recipient) {
          await createNotification({
            userId: recipient,
            title: "New Message",
            message: `${currentUser?.fullName || "Customer"}: ${content.substring(0, 80)}`,
            type: "message"
          });
        } else {
          const { salonStaff: salonStaffTable } = (init_schema(), __toCommonJS(schema_exports));
          const staffLinks = await db.select().from(salonStaffTable).where(eq4(salonStaffTable.salonId, salonId));
          for (const link of staffLinks) {
            await createNotification({
              userId: link.userId,
              title: "New Message",
              message: `${currentUser?.fullName || "Customer"}: ${content.substring(0, 80)}`,
              type: "message"
            });
          }
        }
      } catch (e) {
        console.warn("Failed to notify about message:", e);
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
      const bcrypt = await Promise.resolve().then(() => (init_bcryptjs(), bcryptjs_exports));
      const hashed = await bcrypt.hash(newPassword, 10);
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
      const activeCouponsList = await db.select().from(coupons).where(and3(
        eq4(coupons.active, true),
        sql3`${coupons.expiryDate} >= ${now}`,
        sql3`${coupons.salonId} IS NOT NULL AND ${coupons.salonId} != ''`
      ));
      const salonIds = [...new Set(activeCouponsList.map((c) => c.salonId).filter(Boolean))];
      if (salonIds.length === 0) return res.json([]);
      const salonsList = await db.select().from(salons).where(sql3`${salons.id} IN (${sql3.join(salonIds.map((id) => sql3`${id}`), sql3`, `)})`);
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
      const id = __require("node:crypto").randomUUID();
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
        const superAdmins = await db.select().from(users).where(eq4(users.role, "super_admin"));
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
      const { desc: descOrder } = __require("drizzle-orm");
      const requests = await db.select().from(trialRequests2).orderBy(descOrder(trialRequests2.createdAt));
      res.json(requests);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.put("/api/admin/trial-requests/:id", requireAuth, async (req, res) => {
    try {
      const { trialRequests: trialRequests2 } = (init_schema(), __toCommonJS(schema_exports));
      await db.update(trialRequests2).set({ status: req.body.status }).where(eq4(trialRequests2.id, req.params.id));
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
          const Anthropic2 = (await Promise.resolve().then(() => (init_sdk(), sdk_exports))).default;
          const client = new Anthropic2({ apiKey });
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
  const httpServer = createServer(app2);
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
import * as fs2 from "fs";
import * as path4 from "path";
var app = express();
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
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path5 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path5.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
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
    const appJsonPath = path4.resolve(process.cwd(), "app.json");
    const appJsonContent = fs2.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path4.resolve(
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
  const templatePath = path4.resolve(
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
      const staticBuildIdx = path4.resolve(process.cwd(), "static-build", "index.html");
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
  app2.use("/assets", express.static(path4.resolve(process.cwd(), "assets")));
  app2.use(express.static(path4.resolve(process.cwd(), "static-build")));
  const staticBuildIndex = path4.resolve(process.cwd(), "static-build", "index.html");
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
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later" }
  });
  app.use("/api/", apiLimiter);
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many authentication attempts, please try again later" }
  });
  app.use("/api/auth/signin", authLimiter);
  app.use("/api/auth/signup", authLimiter);
  app.use("/uploads", express.static(path4.join(process.cwd(), "public", "uploads")));
  app.get("/health", (req, res) => res.json({ status: "ok", version: "v2" }));
  const adminDistPath = path4.join(process.cwd(), "admin-dist");
  if (fs2.existsSync(adminDistPath)) {
    app.use("/super_admin", express.static(adminDistPath));
    app.get("/super_admin/{*path}", (req, res) => {
      res.sendFile(path4.join(adminDistPath, "index.html"));
    });
    log("Super Admin portal serving from /super_admin");
  } else {
    log("Super Admin build not found at admin-dist/. Run: cd admin-panel && npm run build");
  }
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
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
  log("Ensuring schema...");
  try {
    const { pool: pool2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const [cols] = await pool2.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'sender_role'"
    );
    if (!cols || cols.length === 0) {
      await pool2.query("ALTER TABLE messages ADD COLUMN sender_role TEXT DEFAULT ''");
      log("Added messages.sender_role column");
    }
    const [cols2] = await pool2.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'recipient_user_id'"
    );
    if (!cols2 || cols2.length === 0) {
      await pool2.query("ALTER TABLE messages ADD COLUMN recipient_user_id VARCHAR(255) DEFAULT ''");
      log("Added messages.recipient_user_id column");
    }
    await pool2.query(`CREATE TABLE IF NOT EXISTS reels (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      user_name TEXT,
      user_avatar TEXT,
      salon_id VARCHAR(255) NOT NULL,
      salon_name TEXT,
      booking_id VARCHAR(255) DEFAULT '',
      video_url TEXT NOT NULL,
      thumbnail_url TEXT,
      caption TEXT,
      rating INT DEFAULT 5,
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      rejection_reason TEXT,
      views INT DEFAULT 0,
      likes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at TIMESTAMP NULL,
      INDEX idx_reels_salon (salon_id),
      INDEX idx_reels_user (user_id),
      INDEX idx_reels_status (status)
    )`);
    await pool2.query(`CREATE TABLE IF NOT EXISTS reel_likes (
      id VARCHAR(255) PRIMARY KEY,
      reel_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_reel_user (reel_id, user_id)
    )`);
    await pool2.query(`CREATE TABLE IF NOT EXISTS reel_comments (
      id VARCHAR(255) PRIMARY KEY,
      reel_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      user_name TEXT,
      user_avatar TEXT,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_comments_reel (reel_id)
    )`);
  } catch (e) {
    console.warn("Schema ensure warning:", e?.message || e);
  }
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
