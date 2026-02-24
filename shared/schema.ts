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

export const insertUserSchema = createInsertSchema(users).pick({
  fullName: true,
  email: true,
  password: true,
});

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
