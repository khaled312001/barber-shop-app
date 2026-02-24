import { db } from "./db";
import { salons, services, packages, specialists, reviews, messages, notifications } from "@shared/schema";
import { eq } from "drizzle-orm";

const salonImages = [
  'https://images.unsplash.com/photo-1585747860019-8e64e38f8586?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=300&fit=crop',
];

const serviceImages = [
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1519823551278-64ac92734314?w=200&h=200&fit=crop',
];

const specialistImages = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
];

const reviewerImages = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
];

const salonData = [
  { id: '1', name: 'Belle Curls', image: salonImages[0], address: '6993 Meadow Valley Terrace', distance: '1.2 km', rating: 4.8, reviewCount: 4279, isOpen: true, openHours: '9:00 AM - 9:00 PM', phone: '+1 234 567 890', about: 'Belle Curls is a premium salon offering top-notch grooming services with a warm atmosphere and experienced professionals.', website: 'www.bellecurls.com', latitude: 40.7128, longitude: -74.0060, gallery: salonImages },
  { id: '2', name: 'Pretty Parlour', image: salonImages[1], address: '2871 Heron Way', distance: '1.8 km', rating: 4.6, reviewCount: 3187, isOpen: true, openHours: '8:00 AM - 8:00 PM', phone: '+1 234 567 891', about: 'Pretty Parlour brings together style and comfort for an unforgettable beauty experience.', website: 'www.prettyparlour.com', latitude: 40.7200, longitude: -74.0100, gallery: salonImages },
  { id: '3', name: 'Clip & Trim', image: salonImages[2], address: '4598 Lincoln Drive', distance: '2.4 km', rating: 4.9, reviewCount: 5621, isOpen: false, openHours: '10:00 AM - 7:00 PM', phone: '+1 234 567 892', about: 'Clip & Trim is the go-to destination for precision cuts and classic barbering.', website: 'www.clipandtrim.com', latitude: 40.7300, longitude: -74.0200, gallery: salonImages },
  { id: '4', name: 'Luxe Lounge', image: salonImages[3], address: '1256 Park Avenue', distance: '3.1 km', rating: 4.7, reviewCount: 2985, isOpen: true, openHours: '9:00 AM - 10:00 PM', phone: '+1 234 567 893', about: 'Luxe Lounge offers a luxury grooming experience with premium products and skilled stylists.', website: 'www.luxelounge.com', latitude: 40.7400, longitude: -74.0300, gallery: salonImages },
  { id: '5', name: 'The Razor Edge', image: salonImages[4], address: '789 Broadway Blvd', distance: '4.0 km', rating: 4.5, reviewCount: 1856, isOpen: true, openHours: '8:30 AM - 8:30 PM', phone: '+1 234 567 894', about: 'The Razor Edge combines traditional barbering with modern techniques.', website: 'www.therazoredge.com', latitude: 40.7500, longitude: -74.0400, gallery: salonImages },
];

function makeServicesForSalon(salonId: string) {
  return [
    { id: `${salonId}_s1`, salonId, name: 'Haircut', price: 30, duration: '30 min', image: serviceImages[0], category: 'Haircut' },
    { id: `${salonId}_s2`, salonId, name: 'Hair Wash', price: 15, duration: '20 min', image: serviceImages[1], category: 'Haircut' },
    { id: `${salonId}_s3`, salonId, name: 'Shaving', price: 20, duration: '20 min', image: serviceImages[0], category: 'Haircut' },
    { id: `${salonId}_s4`, salonId, name: 'Hair Color', price: 80, duration: '90 min', image: serviceImages[1], category: 'Haircut' },
    { id: `${salonId}_s5`, salonId, name: 'Facial', price: 45, duration: '45 min', image: serviceImages[2], category: 'Make Up' },
    { id: `${salonId}_s6`, salonId, name: 'Makeup', price: 60, duration: '60 min', image: serviceImages[2], category: 'Make Up' },
    { id: `${salonId}_s7`, salonId, name: 'Manicure', price: 25, duration: '30 min', image: serviceImages[3], category: 'Manicure' },
    { id: `${salonId}_s8`, salonId, name: 'Pedicure', price: 30, duration: '40 min', image: serviceImages[3], category: 'Manicure' },
    { id: `${salonId}_s9`, salonId, name: 'Body Massage', price: 70, duration: '60 min', image: serviceImages[2], category: 'Massage' },
    { id: `${salonId}_s10`, salonId, name: 'Head Massage', price: 35, duration: '30 min', image: serviceImages[2], category: 'Massage' },
  ];
}

function makePackagesForSalon(salonId: string) {
  return [
    { id: `${salonId}_p1`, salonId, name: 'Basic Grooming', price: 55, originalPrice: 65, services: ['Haircut', 'Hair Wash', 'Shaving'], image: serviceImages[0] },
    { id: `${salonId}_p2`, salonId, name: 'Premium Package', price: 120, originalPrice: 155, services: ['Haircut', 'Hair Color', 'Facial', 'Head Massage'], image: serviceImages[1] },
    { id: `${salonId}_p3`, salonId, name: 'Full Body Care', price: 180, originalPrice: 225, services: ['Haircut', 'Facial', 'Manicure', 'Pedicure', 'Body Massage'], image: serviceImages[2] },
  ];
}

function makeSpecialistsForSalon(salonId: string) {
  return [
    { id: `${salonId}_sp1`, salonId, name: 'James Rivera', role: 'Senior Barber', image: specialistImages[0], rating: 4.9 },
    { id: `${salonId}_sp2`, salonId, name: 'Lisa Park', role: 'Hair Stylist', image: specialistImages[1], rating: 4.8 },
    { id: `${salonId}_sp3`, salonId, name: 'Alex Morgan', role: 'Colorist', image: specialistImages[2], rating: 4.7 },
    { id: `${salonId}_sp4`, salonId, name: 'Emma Taylor', role: 'Makeup Artist', image: specialistImages[3], rating: 4.9 },
  ];
}

function makeReviewsForSalon(salonId: string) {
  return [
    { id: `${salonId}_r1`, salonId, userName: 'Sarah Johnson', userImage: reviewerImages[0], rating: 5, comment: 'Excellent service! The haircut was exactly what I wanted.', date: '2 days ago' },
    { id: `${salonId}_r2`, salonId, userName: 'Mike Davis', userImage: reviewerImages[1], rating: 4, comment: 'Great atmosphere and friendly staff. The massage was very relaxing.', date: '1 week ago' },
    { id: `${salonId}_r3`, salonId, userName: 'Emily Chen', userImage: reviewerImages[2], rating: 5, comment: 'Best salon in the area! Love the attention to detail.', date: '2 weeks ago' },
    { id: `${salonId}_r4`, salonId, userName: 'James Wilson', userImage: reviewerImages[3], rating: 4, comment: 'Good experience overall. A bit pricey but the quality makes up for it.', date: '3 weeks ago' },
  ];
}

export async function seedDatabase() {
  const existing = await db.select().from(salons).limit(1);
  if (existing.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database...");

  await db.insert(salons).values(salonData);

  for (const s of salonData) {
    await db.insert(services).values(makeServicesForSalon(s.id));
    await db.insert(packages).values(makePackagesForSalon(s.id));
    await db.insert(specialists).values(makeSpecialistsForSalon(s.id));
    await db.insert(reviews).values(makeReviewsForSalon(s.id));
  }

  console.log("Database seeded successfully!");
}
