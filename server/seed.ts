import { db } from "./db";
import { salons, services, packages, specialists, reviews, messages, notifications } from "@shared/schema";
import { eq } from "drizzle-orm";

const salonHeroImages = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop',
];

const serviceImages = {
  haircut: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop',
  hairColor: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=200&h=200&fit=crop',
  facialMakeup: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200&h=200&fit=crop',
  nails: 'https://images.unsplash.com/photo-1519823551278-64ac92734314?w=200&h=200&fit=crop',
  massage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&h=200&fit=crop',
  facial: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&h=200&fit=crop',
};

const specialistImages = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
];

const reviewerImages = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
];

const galleryBase = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519823551278-64ac92734314?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop',
];

function makeGallery(startIndex: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < 6; i++) {
    result.push(galleryBase[(startIndex + i) % galleryBase.length]);
  }
  return result;
}

const salonData = [
  {
    id: '1',
    name: 'Belle Curls',
    image: salonHeroImages[0],
    address: '6993 Meadow Valley Terrace, New York, NY 10001',
    distance: '1.2 km',
    rating: 4.8,
    reviewCount: 4279,
    isOpen: true,
    openHours: '9:00 AM - 9:00 PM',
    phone: '+1 212 555 0101',
    about: 'Belle Curls is a premium salon nestled in the heart of Manhattan, offering top-notch grooming services with a warm, inviting atmosphere. Our experienced professionals specialize in precision cuts, vibrant color treatments, and luxurious spa services. Step in and let us transform your look with personalized care and attention to detail.',
    website: 'www.bellecurls.com',
    latitude: 40.7128,
    longitude: -74.006,
    gallery: makeGallery(0),
  },
  {
    id: '2',
    name: 'Pretty Parlour',
    image: salonHeroImages[1],
    address: '2871 Heron Way, New York, NY 10002',
    distance: '1.8 km',
    rating: 4.6,
    reviewCount: 3187,
    isOpen: true,
    openHours: '8:00 AM - 8:00 PM',
    phone: '+1 212 555 0102',
    about: 'Pretty Parlour brings together elegance and comfort for an unforgettable beauty experience. From classic updos to contemporary styling, our talented team creates looks that turn heads. We pride ourselves on using only premium, cruelty-free products for every service.',
    website: 'www.prettyparlour.com',
    latitude: 40.7200,
    longitude: -74.010,
    gallery: makeGallery(2),
  },
  {
    id: '3',
    name: 'Clip & Trim',
    image: salonHeroImages[2],
    address: '4598 Lincoln Drive, New York, NY 10003',
    distance: '2.4 km',
    rating: 4.9,
    reviewCount: 5621,
    isOpen: false,
    openHours: '10:00 AM - 7:00 PM',
    phone: '+1 212 555 0103',
    about: 'Clip & Trim is the go-to destination for precision cuts and classic barbering in the city. Our master barbers bring decades of combined experience to every fade, taper, and straight-razor shave. Whether you want a timeless look or a modern edge, we deliver excellence every time.',
    website: 'www.clipandtrim.com',
    latitude: 40.7300,
    longitude: -74.020,
    gallery: makeGallery(4),
  },
  {
    id: '4',
    name: 'Luxe Lounge',
    image: salonHeroImages[3],
    address: '1256 Park Avenue, New York, NY 10004',
    distance: '3.1 km',
    rating: 4.7,
    reviewCount: 2985,
    isOpen: true,
    openHours: '9:00 AM - 10:00 PM',
    phone: '+1 212 555 0104',
    about: 'Luxe Lounge offers a luxury spa and salon experience with premium products and highly skilled stylists. Indulge in our signature treatments designed to rejuvenate your body and elevate your style. Our serene environment is the perfect escape from the hustle of city life.',
    website: 'www.luxelounge.com',
    latitude: 40.7400,
    longitude: -74.030,
    gallery: makeGallery(6),
  },
  {
    id: '5',
    name: 'The Razor Edge',
    image: salonHeroImages[5],
    address: '789 Broadway Blvd, New York, NY 10005',
    distance: '4.0 km',
    rating: 4.5,
    reviewCount: 1856,
    isOpen: true,
    openHours: '8:30 AM - 8:30 PM',
    phone: '+1 212 555 0105',
    about: 'The Razor Edge combines traditional barbering techniques with modern styling for a truly unique grooming experience. Our skilled barbers are masters of the craft, delivering sharp fades, clean lines, and impeccable beard work. Walk in confident, walk out unstoppable.',
    website: 'www.therazoredge.com',
    latitude: 40.7500,
    longitude: -74.040,
    gallery: makeGallery(1),
  },
  {
    id: '6',
    name: 'Golden Scissors',
    image: salonHeroImages[6],
    address: '145 Cherry Blossom Lane, New York, NY 10006',
    distance: '0.8 km',
    rating: 4.8,
    reviewCount: 3842,
    isOpen: true,
    openHours: '8:00 AM - 9:00 PM',
    phone: '+1 212 555 0106',
    about: 'Golden Scissors is a family-friendly salon where everyone from kids to grandparents feels welcome. We offer a wide range of services at affordable prices without compromising on quality. Our cheerful team ensures every visit is a delightful experience for the whole family.',
    website: 'www.goldenscissors.com',
    latitude: 40.7080,
    longitude: -74.001,
    gallery: makeGallery(3),
  },
  {
    id: '7',
    name: 'Velvet Touch Spa',
    image: salonHeroImages[4],
    address: '320 Riverside Terrace, New York, NY 10007',
    distance: '2.2 km',
    rating: 4.9,
    reviewCount: 4156,
    isOpen: true,
    openHours: '9:00 AM - 10:00 PM',
    phone: '+1 212 555 0107',
    about: 'Velvet Touch Spa is a full-service wellness destination offering the ultimate in relaxation and beauty. From deep-tissue massages to rejuvenating facials and expert hair styling, every treatment is tailored to your needs. Surrender to tranquility in our award-winning spa environment.',
    website: 'www.velvettouchspa.com',
    latitude: 40.7350,
    longitude: -74.015,
    gallery: makeGallery(5),
  },
  {
    id: '8',
    name: 'Urban Style Studio',
    image: salonHeroImages[7],
    address: '58 Greenwich Village Ave, New York, NY 10008',
    distance: '1.5 km',
    rating: 4.4,
    reviewCount: 2234,
    isOpen: true,
    openHours: '10:00 AM - 9:00 PM',
    phone: '+1 212 555 0108',
    about: 'Urban Style Studio is the trendiest salon in the Village, specializing in bold colors, creative cuts, and fashion-forward styles. Our edgy team stays ahead of every trend so you can express your unique personality. Come for the vibe, stay for the transformation.',
    website: 'www.urbanstylestudio.com',
    latitude: 40.7250,
    longitude: -74.008,
    gallery: makeGallery(7),
  },
];

const salonServices: Record<string, { name: string; price: number; duration: string; image: string; category: string }[]> = {
  '1': [
    { name: 'Precision Haircut', price: 35, duration: '30 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Blow Dry & Style', price: 25, duration: '25 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Full Hair Color', price: 90, duration: '90 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Balayage Highlights', price: 150, duration: '120 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Deep Conditioning', price: 40, duration: '30 min', image: serviceImages.hairColor, category: 'Hair Treatment' },
    { name: 'Classic Facial', price: 55, duration: '45 min', image: serviceImages.facial, category: 'Facial' },
    { name: 'Bridal Makeup', price: 120, duration: '90 min', image: serviceImages.facialMakeup, category: 'Make Up' },
    { name: 'Gel Manicure', price: 30, duration: '35 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Spa Pedicure', price: 40, duration: '45 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Relaxation Massage', price: 75, duration: '60 min', image: serviceImages.massage, category: 'Massage' },
  ],
  '2': [
    { name: 'Women\'s Haircut', price: 40, duration: '35 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Kids Haircut', price: 20, duration: '20 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Root Touch Up', price: 65, duration: '60 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Ombre Color', price: 130, duration: '120 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Keratin Treatment', price: 180, duration: '150 min', image: serviceImages.hairColor, category: 'Hair Treatment' },
    { name: 'Hydrating Facial', price: 60, duration: '50 min', image: serviceImages.facial, category: 'Facial' },
    { name: 'Evening Makeup', price: 75, duration: '60 min', image: serviceImages.facialMakeup, category: 'Make Up' },
    { name: 'Acrylic Nails', price: 45, duration: '60 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Swedish Massage', price: 80, duration: '60 min', image: serviceImages.massage, category: 'Massage' },
    { name: 'Eyebrow Threading', price: 15, duration: '15 min', image: serviceImages.facialMakeup, category: 'Make Up' },
  ],
  '3': [
    { name: 'Classic Haircut', price: 25, duration: '25 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Buzz Cut', price: 18, duration: '15 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Hot Towel Shave', price: 30, duration: '30 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Beard Trim', price: 15, duration: '15 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Fade & Design', price: 35, duration: '40 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Hair & Beard Combo', price: 40, duration: '45 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Scalp Treatment', price: 25, duration: '20 min', image: serviceImages.massage, category: 'Hair Treatment' },
    { name: 'Gray Blending', price: 45, duration: '40 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Head Massage', price: 20, duration: '15 min', image: serviceImages.massage, category: 'Massage' },
    { name: 'Straight Razor Lineup', price: 12, duration: '10 min', image: serviceImages.haircut, category: 'Haircut' },
  ],
  '4': [
    { name: 'Luxury Haircut', price: 55, duration: '40 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Diamond Facial', price: 95, duration: '60 min', image: serviceImages.facial, category: 'Facial' },
    { name: 'Gold Mask Treatment', price: 110, duration: '75 min', image: serviceImages.facial, category: 'Facial' },
    { name: 'Full Color & Gloss', price: 160, duration: '120 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Hot Stone Massage', price: 120, duration: '90 min', image: serviceImages.massage, category: 'Massage' },
    { name: 'Aromatherapy Massage', price: 100, duration: '75 min', image: serviceImages.massage, category: 'Massage' },
    { name: 'Deluxe Manicure', price: 50, duration: '45 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Deluxe Pedicure', price: 60, duration: '50 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Lash Extensions', price: 85, duration: '90 min', image: serviceImages.facialMakeup, category: 'Make Up' },
  ],
  '5': [
    { name: 'Men\'s Haircut', price: 28, duration: '25 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Skin Fade', price: 32, duration: '35 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Beard Sculpting', price: 22, duration: '20 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Razor Shave', price: 25, duration: '25 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Hair Design', price: 40, duration: '45 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Color Camo', price: 35, duration: '30 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Scalp Massage', price: 20, duration: '15 min', image: serviceImages.massage, category: 'Massage' },
    { name: 'Face Mask', price: 30, duration: '25 min', image: serviceImages.facial, category: 'Facial' },
  ],
  '6': [
    { name: 'Family Haircut', price: 22, duration: '25 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Children\'s Cut', price: 15, duration: '20 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Senior\'s Cut', price: 18, duration: '20 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Basic Color', price: 55, duration: '60 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Highlights', price: 80, duration: '90 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Express Facial', price: 35, duration: '30 min', image: serviceImages.facial, category: 'Facial' },
    { name: 'Quick Makeup', price: 40, duration: '30 min', image: serviceImages.facialMakeup, category: 'Make Up' },
    { name: 'Classic Manicure', price: 20, duration: '25 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Classic Pedicure', price: 25, duration: '30 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Back & Shoulder Massage', price: 45, duration: '30 min', image: serviceImages.massage, category: 'Massage' },
  ],
  '7': [
    { name: 'Signature Haircut', price: 45, duration: '35 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Anti-Aging Facial', price: 85, duration: '60 min', image: serviceImages.facial, category: 'Facial' },
    { name: 'Vitamin C Facial', price: 75, duration: '50 min', image: serviceImages.facial, category: 'Facial' },
    { name: 'Deep Tissue Massage', price: 110, duration: '90 min', image: serviceImages.massage, category: 'Massage' },
    { name: 'Thai Massage', price: 95, duration: '75 min', image: serviceImages.massage, category: 'Massage' },
    { name: 'Body Scrub & Wrap', price: 130, duration: '90 min', image: serviceImages.massage, category: 'Spa' },
    { name: 'Luxury Manicure', price: 40, duration: '40 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Luxury Pedicure', price: 50, duration: '50 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Organic Color', price: 100, duration: '90 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Scalp Detox', price: 55, duration: '40 min', image: serviceImages.massage, category: 'Hair Treatment' },
  ],
  '8': [
    { name: 'Trendy Cut', price: 38, duration: '30 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Undercut Design', price: 45, duration: '40 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Vivid Color', price: 120, duration: '120 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Pastel Tones', price: 140, duration: '150 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Creative Braids', price: 65, duration: '60 min', image: serviceImages.haircut, category: 'Hair Styling' },
    { name: 'Festival Makeup', price: 55, duration: '45 min', image: serviceImages.facialMakeup, category: 'Make Up' },
    { name: 'Nail Art', price: 50, duration: '60 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Express Facial', price: 40, duration: '30 min', image: serviceImages.facial, category: 'Facial' },
    { name: 'Head & Neck Massage', price: 35, duration: '25 min', image: serviceImages.massage, category: 'Massage' },
  ],
};

const salonPackages: Record<string, { name: string; price: number; originalPrice: number; services: string[]; image: string }[]> = {
  '1': [
    { name: 'Signature Glam', price: 85, originalPrice: 110, services: ['Precision Haircut', 'Blow Dry & Style', 'Classic Facial'], image: serviceImages.haircut },
    { name: 'Color & Care', price: 160, originalPrice: 205, services: ['Full Hair Color', 'Deep Conditioning', 'Relaxation Massage'], image: serviceImages.hairColor },
    { name: 'Bridal Package', price: 280, originalPrice: 350, services: ['Balayage Highlights', 'Bridal Makeup', 'Gel Manicure', 'Spa Pedicure'], image: serviceImages.facialMakeup },
  ],
  '2': [
    { name: 'Quick Refresh', price: 70, originalPrice: 90, services: ['Women\'s Haircut', 'Hydrating Facial', 'Eyebrow Threading'], image: serviceImages.haircut },
    { name: 'Color Queen', price: 170, originalPrice: 215, services: ['Ombre Color', 'Keratin Treatment'], image: serviceImages.hairColor },
    { name: 'Total Makeover', price: 220, originalPrice: 280, services: ['Women\'s Haircut', 'Evening Makeup', 'Acrylic Nails', 'Swedish Massage'], image: serviceImages.facialMakeup },
  ],
  '3': [
    { name: 'Gentleman\'s Classic', price: 50, originalPrice: 65, services: ['Classic Haircut', 'Hot Towel Shave', 'Head Massage'], image: serviceImages.haircut },
    { name: 'Sharp & Clean', price: 65, originalPrice: 82, services: ['Fade & Design', 'Beard Trim', 'Straight Razor Lineup'], image: serviceImages.haircut },
    { name: 'Executive Grooming', price: 95, originalPrice: 120, services: ['Hair & Beard Combo', 'Scalp Treatment', 'Gray Blending'], image: serviceImages.hairColor },
  ],
  '4': [
    { name: 'Royal Treatment', price: 200, originalPrice: 260, services: ['Luxury Haircut', 'Diamond Facial', 'Aromatherapy Massage'], image: serviceImages.facial },
    { name: 'Gold Experience', price: 280, originalPrice: 355, services: ['Full Color & Gloss', 'Gold Mask Treatment', 'Deluxe Manicure'], image: serviceImages.hairColor },
    { name: 'Ultimate Indulgence', price: 350, originalPrice: 440, services: ['Luxury Haircut', 'Hot Stone Massage', 'Lash Extensions', 'Deluxe Pedicure'], image: serviceImages.massage },
  ],
  '5': [
    { name: 'Quick Trim', price: 42, originalPrice: 55, services: ['Men\'s Haircut', 'Beard Sculpting', 'Scalp Massage'], image: serviceImages.haircut },
    { name: 'Fresh Fade', price: 55, originalPrice: 72, services: ['Skin Fade', 'Razor Shave', 'Face Mask'], image: serviceImages.haircut },
    { name: 'Style Master', price: 80, originalPrice: 100, services: ['Hair Design', 'Color Camo', 'Scalp Massage'], image: serviceImages.hairColor },
  ],
  '6': [
    { name: 'Family Bundle', price: 45, originalPrice: 55, services: ['Family Haircut', 'Children\'s Cut'], image: serviceImages.haircut },
    { name: 'Pamper Day', price: 100, originalPrice: 125, services: ['Family Haircut', 'Express Facial', 'Classic Manicure', 'Classic Pedicure'], image: serviceImages.facial },
    { name: 'Full Glow Up', price: 150, originalPrice: 195, services: ['Highlights', 'Quick Makeup', 'Classic Manicure', 'Back & Shoulder Massage'], image: serviceImages.hairColor },
  ],
  '7': [
    { name: 'Zen Retreat', price: 180, originalPrice: 230, services: ['Anti-Aging Facial', 'Deep Tissue Massage', 'Scalp Detox'], image: serviceImages.massage },
    { name: 'Beauty & Bliss', price: 150, originalPrice: 190, services: ['Signature Haircut', 'Vitamin C Facial', 'Luxury Manicure'], image: serviceImages.facial },
    { name: 'Total Wellness', price: 320, originalPrice: 410, services: ['Thai Massage', 'Body Scrub & Wrap', 'Luxury Pedicure', 'Organic Color'], image: serviceImages.massage },
  ],
  '8': [
    { name: 'Street Style', price: 75, originalPrice: 95, services: ['Trendy Cut', 'Undercut Design', 'Head & Neck Massage'], image: serviceImages.haircut },
    { name: 'Color Pop', price: 180, originalPrice: 225, services: ['Vivid Color', 'Creative Braids', 'Express Facial'], image: serviceImages.hairColor },
    { name: 'Festival Ready', price: 220, originalPrice: 285, services: ['Pastel Tones', 'Festival Makeup', 'Nail Art'], image: serviceImages.facialMakeup },
  ],
};

const salonSpecialists: Record<string, { name: string; role: string; image: string; rating: number }[]> = {
  '1': [
    { name: 'James Rivera', role: 'Senior Stylist', image: specialistImages[0], rating: 4.9 },
    { name: 'Lisa Park', role: 'Color Specialist', image: specialistImages[1], rating: 4.8 },
    { name: 'Daniel Brooks', role: 'Makeup Artist', image: specialistImages[2], rating: 4.7 },
    { name: 'Sophie Laurent', role: 'Nail Technician', image: specialistImages[3], rating: 4.9 },
    { name: 'Marcus Chen', role: 'Massage Therapist', image: specialistImages[4], rating: 4.8 },
  ],
  '2': [
    { name: 'Natasha Petrov', role: 'Lead Stylist', image: specialistImages[5], rating: 4.8 },
    { name: 'Oliver Grant', role: 'Hair Colorist', image: specialistImages[0], rating: 4.7 },
    { name: 'Mia Tanaka', role: 'Esthetician', image: specialistImages[1], rating: 4.9 },
    { name: 'Rafael Santos', role: 'Makeup Artist', image: specialistImages[2], rating: 4.6 },
    { name: 'Hannah Kim', role: 'Nail Artist', image: specialistImages[3], rating: 4.8 },
  ],
  '3': [
    { name: 'Victor Stone', role: 'Master Barber', image: specialistImages[4], rating: 4.9 },
    { name: 'Tony DeMarco', role: 'Senior Barber', image: specialistImages[0], rating: 4.8 },
    { name: 'Adrian Wells', role: 'Fade Specialist', image: specialistImages[2], rating: 4.9 },
    { name: 'Jamal Washington', role: 'Beard Expert', image: specialistImages[4], rating: 4.7 },
  ],
  '4': [
    { name: 'Camille Dubois', role: 'Luxury Stylist', image: specialistImages[5], rating: 4.9 },
    { name: 'Edward Kingsley', role: 'Spa Director', image: specialistImages[0], rating: 4.8 },
    { name: 'Priya Sharma', role: 'Esthetician', image: specialistImages[1], rating: 4.9 },
    { name: 'Nicolas Blanc', role: 'Massage Specialist', image: specialistImages[2], rating: 4.7 },
    { name: 'Isabella Romano', role: 'Lash Technician', image: specialistImages[3], rating: 4.8 },
  ],
  '5': [
    { name: 'Derek Coleman', role: 'Head Barber', image: specialistImages[4], rating: 4.7 },
    { name: 'Ryan O\'Brien', role: 'Fade Artist', image: specialistImages[0], rating: 4.6 },
    { name: 'Kai Nakamura', role: 'Style Expert', image: specialistImages[2], rating: 4.5 },
    { name: 'Andre Mitchell', role: 'Beard Specialist', image: specialistImages[4], rating: 4.8 },
  ],
  '6': [
    { name: 'Maria Gonzalez', role: 'Family Stylist', image: specialistImages[5], rating: 4.8 },
    { name: 'David Thompson', role: 'Senior Barber', image: specialistImages[0], rating: 4.7 },
    { name: 'Jenny Liu', role: 'Kids Specialist', image: specialistImages[1], rating: 4.9 },
    { name: 'Carlos Mendez', role: 'Colorist', image: specialistImages[2], rating: 4.6 },
    { name: 'Sarah Bennett', role: 'Nail Technician', image: specialistImages[3], rating: 4.8 },
  ],
  '7': [
    { name: 'Dr. Anita Patel', role: 'Spa Therapist', image: specialistImages[5], rating: 4.9 },
    { name: 'Liam Fitzgerald', role: 'Senior Stylist', image: specialistImages[0], rating: 4.8 },
    { name: 'Yuki Yamamoto', role: 'Massage Expert', image: specialistImages[1], rating: 4.9 },
    { name: 'Omar Hassan', role: 'Hair Colorist', image: specialistImages[2], rating: 4.7 },
    { name: 'Elena Volkov', role: 'Esthetician', image: specialistImages[3], rating: 4.9 },
  ],
  '8': [
    { name: 'Zoe Martinez', role: 'Creative Director', image: specialistImages[5], rating: 4.6 },
    { name: 'Ash Keller', role: 'Color Innovator', image: specialistImages[0], rating: 4.5 },
    { name: 'Luna Chang', role: 'Braid Specialist', image: specialistImages[1], rating: 4.7 },
    { name: 'Raven Black', role: 'Nail Artist', image: specialistImages[3], rating: 4.4 },
    { name: 'Jake Nolan', role: 'Trend Stylist', image: specialistImages[4], rating: 4.5 },
  ],
};

const salonReviews: Record<string, { userName: string; userImage: string; rating: number; comment: string; date: string }[]> = {
  '1': [
    { userName: 'Sarah Johnson', userImage: reviewerImages[0], rating: 5, comment: 'Absolutely love Belle Curls! My balayage turned out stunning and the team was so attentive.', date: '2 days ago' },
    { userName: 'Michelle Lee', userImage: reviewerImages[1], rating: 5, comment: 'Best facial I\'ve ever had. My skin is glowing! Will definitely be back.', date: '5 days ago' },
    { userName: 'Robert Chen', userImage: reviewerImages[2], rating: 4, comment: 'Great haircut and very relaxing atmosphere. Prices are a bit high but worth it.', date: '1 week ago' },
    { userName: 'Amanda Foster', userImage: reviewerImages[3], rating: 5, comment: 'My bridal makeup was flawless. Everyone at the wedding commented on how beautiful I looked!', date: '2 weeks ago' },
    { userName: 'David Kim', userImage: reviewerImages[4], rating: 4, comment: 'Clean salon, professional staff. The massage was incredibly relaxing.', date: '3 weeks ago' },
    { userName: 'Jessica Brown', userImage: reviewerImages[5], rating: 5, comment: 'Sophie did an amazing job on my nails. So detailed and long-lasting!', date: '1 month ago' },
  ],
  '2': [
    { userName: 'Emily Watson', userImage: reviewerImages[1], rating: 5, comment: 'Natasha is a genius with color! My ombre looks so natural and beautiful.', date: '1 day ago' },
    { userName: 'Chris Taylor', userImage: reviewerImages[2], rating: 4, comment: 'Nice ambiance and friendly staff. The keratin treatment made my hair silky smooth.', date: '4 days ago' },
    { userName: 'Nicole Garcia', userImage: reviewerImages[3], rating: 5, comment: 'Got my daughter\'s first haircut here. They were so patient and sweet with her!', date: '1 week ago' },
    { userName: 'Mark Patterson', userImage: reviewerImages[0], rating: 4, comment: 'Solid haircut and good conversation. Reasonable prices for the quality.', date: '2 weeks ago' },
    { userName: 'Laura Martinez', userImage: reviewerImages[4], rating: 5, comment: 'The Swedish massage melted all my stress away. Hannah\'s nail work is art!', date: '3 weeks ago' },
  ],
  '3': [
    { userName: 'Tony Moretti', userImage: reviewerImages[5], rating: 5, comment: 'Best barbershop in NYC, hands down. Victor gave me the cleanest fade I\'ve ever had.', date: '3 days ago' },
    { userName: 'Brandon Harris', userImage: reviewerImages[0], rating: 5, comment: 'The hot towel shave is an experience every man needs. Old-school quality at its finest.', date: '1 week ago' },
    { userName: 'Michael Brooks', userImage: reviewerImages[2], rating: 5, comment: 'Been coming here for years. Consistent, quality work every single time.', date: '2 weeks ago' },
    { userName: 'Jason Lee', userImage: reviewerImages[4], rating: 4, comment: 'Great barbers but it can get crowded on weekends. Book ahead if you can.', date: '3 weeks ago' },
    { userName: 'Kevin Wright', userImage: reviewerImages[1], rating: 5, comment: 'Adrian did an incredible design on my fade. Getting compliments everywhere!', date: '1 month ago' },
    { userName: 'Samuel Carter', userImage: reviewerImages[3], rating: 5, comment: 'My go-to spot for a clean lineup. Professional and efficient every time.', date: '1 month ago' },
  ],
  '4': [
    { userName: 'Victoria Palmer', userImage: reviewerImages[3], rating: 5, comment: 'The Gold Mask Treatment was divine. My skin feels 10 years younger!', date: '2 days ago' },
    { userName: 'Catherine Blake', userImage: reviewerImages[1], rating: 5, comment: 'Hot stone massage was absolutely heavenly. The ambiance is so luxurious.', date: '5 days ago' },
    { userName: 'Richard Sterling', userImage: reviewerImages[2], rating: 4, comment: 'Premium experience with premium prices. You get what you pay for here.', date: '1 week ago' },
    { userName: 'Diana Ross', userImage: reviewerImages[4], rating: 5, comment: 'Camille is the best stylist I\'ve ever had. She understands exactly what I want.', date: '2 weeks ago' },
    { userName: 'William Hayes', userImage: reviewerImages[0], rating: 4, comment: 'Excellent service and beautiful space. Lash extensions look very natural.', date: '1 month ago' },
  ],
  '5': [
    { userName: 'Jake Morrison', userImage: reviewerImages[0], rating: 5, comment: 'Derek gives the best fades in the city. Quick, clean, and affordable.', date: '1 day ago' },
    { userName: 'Tyler Nash', userImage: reviewerImages[2], rating: 4, comment: 'Good barbershop with a cool modern vibe. The face mask was a nice touch.', date: '3 days ago' },
    { userName: 'Eric Simmons', userImage: reviewerImages[5], rating: 5, comment: 'Been to many barbers but The Razor Edge is something special. Highly recommend!', date: '1 week ago' },
    { userName: 'Nathan Cole', userImage: reviewerImages[4], rating: 4, comment: 'Solid haircut at a fair price. The guys here really know their craft.', date: '2 weeks ago' },
    { userName: 'Alex Turner', userImage: reviewerImages[1], rating: 4, comment: 'My beard has never looked this good. Andre is a true beard specialist.', date: '3 weeks ago' },
    { userName: 'Ben Cooper', userImage: reviewerImages[3], rating: 5, comment: 'Kai gave me exactly the style I wanted. Great attention to detail.', date: '1 month ago' },
  ],
  '6': [
    { userName: 'Angela Torres', userImage: reviewerImages[3], rating: 5, comment: 'We bring the whole family here! Maria is wonderful with the kids.', date: '2 days ago' },
    { userName: 'Patricia Nguyen', userImage: reviewerImages[1], rating: 5, comment: 'Affordable and high quality. My highlights look amazing! Best value in the area.', date: '4 days ago' },
    { userName: 'Thomas Green', userImage: reviewerImages[0], rating: 4, comment: 'Good neighborhood salon. David always gives me a great cut.', date: '1 week ago' },
    { userName: 'Linda Chang', userImage: reviewerImages[4], rating: 5, comment: 'Jenny is the best with kids\' haircuts. My toddler actually enjoyed it!', date: '2 weeks ago' },
    { userName: 'George Miller', userImage: reviewerImages[2], rating: 4, comment: 'Friendly staff and clean shop. The back massage was a nice surprise bonus.', date: '3 weeks ago' },
    { userName: 'Rosa Hernandez', userImage: reviewerImages[5], rating: 5, comment: 'Love this place! The whole family leaves happy every single visit.', date: '1 month ago' },
  ],
  '7': [
    { userName: 'Sophia Anderson', userImage: reviewerImages[4], rating: 5, comment: 'The deep tissue massage was transformative. Dr. Patel has healing hands.', date: '1 day ago' },
    { userName: 'Olivia White', userImage: reviewerImages[1], rating: 5, comment: 'Best spa experience in the city! The body scrub and wrap left me feeling reborn.', date: '3 days ago' },
    { userName: 'Emma Davis', userImage: reviewerImages[3], rating: 5, comment: 'The anti-aging facial is worth every penny. Visible results after just one session!', date: '1 week ago' },
    { userName: 'James Foster', userImage: reviewerImages[0], rating: 4, comment: 'Liam gave me an excellent haircut. The whole spa atmosphere is very calming.', date: '2 weeks ago' },
    { userName: 'Rachel Kim', userImage: reviewerImages[5], rating: 5, comment: 'Yuki\'s Thai massage is absolutely incredible. I come back every month now.', date: '3 weeks ago' },
    { userName: 'Daniel Park', userImage: reviewerImages[2], rating: 5, comment: 'Organic color turned out beautifully. Elena\'s facials are magical too.', date: '1 month ago' },
  ],
  '8': [
    { userName: 'Megan Scott', userImage: reviewerImages[4], rating: 5, comment: 'Zoe is a creative genius! My vivid purple turned out insanely good.', date: '1 day ago' },
    { userName: 'Riley Jackson', userImage: reviewerImages[1], rating: 4, comment: 'Trendy salon with great energy. The undercut design was exactly what I wanted.', date: '3 days ago' },
    { userName: 'Taylor Brooks', userImage: reviewerImages[3], rating: 4, comment: 'Love the vibe here. Pastel tones came out perfectly. A bit pricey though.', date: '1 week ago' },
    { userName: 'Jordan Price', userImage: reviewerImages[0], rating: 5, comment: 'Luna\'s braids are absolute works of art. Got so many compliments at the festival!', date: '2 weeks ago' },
    { userName: 'Casey Miller', userImage: reviewerImages[2], rating: 4, comment: 'Cool spot with talented stylists. Nail art by Raven was stunning.', date: '3 weeks ago' },
    { userName: 'Morgan Ellis', userImage: reviewerImages[5], rating: 4, comment: 'Great atmosphere and music. Jake nailed the trendy cut I was going for.', date: '1 month ago' },
  ],
};

export async function seedDatabase() {
  console.log("Seeding database...");

  await db.delete(reviews);
  await db.delete(specialists);
  await db.delete(packages);
  await db.delete(services);
  await db.delete(salons);

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

  console.log("Database seeded successfully!");
}
