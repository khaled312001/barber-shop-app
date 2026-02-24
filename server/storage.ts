import { db } from "./db";
import { eq, and, ilike, or, desc } from "drizzle-orm";
import {
  users, salons, services, packages, specialists, reviews,
  bookings, bookmarkTable, messages, notifications,
  type User, type InsertUser, type Salon, type Service,
  type Package, type Specialist, type Review, type Booking,
  type Message, type Notification
} from "@shared/schema";
import bcrypt from "bcryptjs";

export async function createUser(data: { fullName: string; email: string; password: string }): Promise<User> {
  const hashed = await bcrypt.hash(data.password, 10);
  const [user] = await db.insert(users).values({ ...data, password: hashed }).returning();
  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function updateUser(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
  const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return user;
}

export async function verifyPassword(plaintext: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hashed);
}

export async function getAllSalons(): Promise<Salon[]> {
  return db.select().from(salons);
}

export async function getSalonById(id: string): Promise<Salon | undefined> {
  const [salon] = await db.select().from(salons).where(eq(salons.id, id));
  return salon;
}

export async function searchSalons(query: string): Promise<Salon[]> {
  return db.select().from(salons).where(
    or(ilike(salons.name, `%${query}%`), ilike(salons.address, `%${query}%`))
  );
}

export async function getSalonServices(salonId: string): Promise<Service[]> {
  return db.select().from(services).where(eq(services.salonId, salonId));
}

export async function getSalonPackages(salonId: string): Promise<Package[]> {
  return db.select().from(packages).where(eq(packages.salonId, salonId));
}

export async function getSalonSpecialists(salonId: string): Promise<Specialist[]> {
  return db.select().from(specialists).where(eq(specialists.salonId, salonId));
}

export async function getSalonReviews(salonId: string): Promise<Review[]> {
  return db.select().from(reviews).where(eq(reviews.salonId, salonId));
}

export async function createReview(data: { salonId: string; userId?: string; userName: string; userImage?: string; rating: number; comment: string }): Promise<Review> {
  const [review] = await db.insert(reviews).values({ ...data, date: 'Just now' }).returning();
  return review;
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
}

export async function createBooking(data: {
  userId: string; salonId: string; salonName: string; salonImage: string;
  services: string[]; date: string; time: string; totalPrice: number; paymentMethod: string;
}): Promise<Booking> {
  const [booking] = await db.insert(bookings).values(data).returning();
  return booking;
}

export async function cancelBooking(id: string, userId: string): Promise<Booking | undefined> {
  const [booking] = await db.update(bookings)
    .set({ status: 'cancelled' })
    .where(and(eq(bookings.id, id), eq(bookings.userId, userId)))
    .returning();
  return booking;
}

export async function getUserBookmarks(userId: string): Promise<string[]> {
  const bm = await db.select().from(bookmarkTable).where(eq(bookmarkTable.userId, userId));
  return bm.map(b => b.salonId);
}

export async function toggleBookmark(userId: string, salonId: string): Promise<boolean> {
  const [existing] = await db.select().from(bookmarkTable)
    .where(and(eq(bookmarkTable.userId, userId), eq(bookmarkTable.salonId, salonId)));
  if (existing) {
    await db.delete(bookmarkTable).where(eq(bookmarkTable.id, existing.id));
    return false;
  } else {
    await db.insert(bookmarkTable).values({ userId, salonId });
    return true;
  }
}

export async function getUserMessages(userId: string): Promise<Message[]> {
  return db.select().from(messages).where(eq(messages.userId, userId)).orderBy(desc(messages.createdAt));
}

export async function getConversation(userId: string, salonId: string): Promise<Message[]> {
  return db.select().from(messages)
    .where(and(eq(messages.userId, userId), eq(messages.salonId, salonId)))
    .orderBy(messages.createdAt);
}

export async function sendMessage(data: { userId: string; salonId: string; salonName: string; salonImage: string; content: string; sender: string }): Promise<Message> {
  const [msg] = await db.insert(messages).values(data).returning();
  return msg;
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function markNotificationRead(id: string, userId: string): Promise<void> {
  await db.update(notifications).set({ read: true }).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function createNotification(data: { userId: string; title: string; message: string; type: string }): Promise<Notification> {
  const [notif] = await db.insert(notifications).values(data).returning();
  return notif;
}
