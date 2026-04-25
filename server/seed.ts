import { db } from "./db";
import { salons, services, packages, specialists, reviews, messages, notifications, users, coupons, bookings, plans, subscriptions, licenseKeys, salonStaff, inventory, expenses, shifts, commissions, tips, customerNotes, loyaltyTransactions, activityLogs, appSettings } from "@shared/schema";

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

// ============================
// Swiss & European Salon Data
// ============================
const salonData = [
  {
    id: '1',
    name: 'Alpine Groom',
    image: salonHeroImages[0],
    address: 'Bahnhofstrasse 42, 8001 Zurich, Switzerland',
    distance: '0.8 km',
    rating: 4.9,
    reviewCount: 3742,
    isOpen: true,
    openHours: '9:00 AM - 7:00 PM',
    phone: '+41 44 123 4567',
    about: 'Alpine Groom is a premier barbershop in the heart of Zurich, blending Swiss precision with modern grooming. Our skilled stylists deliver impeccable cuts, classic shaves, and tailored grooming experiences in an elegant, welcoming atmosphere.',
    website: 'www.alpinegroom.ch',
    latitude: 47.3769,
    longitude: 8.5417,
    gallery: makeGallery(0),
  },
  {
    id: '2',
    name: 'Geneva Elegance',
    image: salonHeroImages[1],
    address: 'Rue du Rhone 58, 1204 Geneva, Switzerland',
    distance: '1.5 km',
    rating: 4.7,
    reviewCount: 2890,
    isOpen: true,
    openHours: '8:30 AM - 7:30 PM',
    phone: '+41 22 765 4321',
    about: 'Geneva Elegance brings together the finest in European beauty and grooming. From luxurious hair treatments to revitalizing facials, our French-trained specialists craft an experience of refinement in the heart of Geneva.',
    website: 'www.genevaelegance.ch',
    latitude: 46.2044,
    longitude: 6.1432,
    gallery: makeGallery(2),
  },
  {
    id: '3',
    name: 'Bern Classic Barbers',
    image: salonHeroImages[2],
    address: 'Marktgasse 15, 3011 Bern, Switzerland',
    distance: '2.1 km',
    rating: 4.8,
    reviewCount: 4156,
    isOpen: true,
    openHours: '9:00 AM - 6:30 PM',
    phone: '+41 31 890 1234',
    about: 'Bern Classic Barbers is a traditional barbershop offering old-world craftsmanship in the Swiss capital. Our master barbers specialize in precision fades, straight-razor shaves, and meticulous beard grooming in a warm, vintage setting.',
    website: 'www.bernclassicbarbers.ch',
    latitude: 46.9480,
    longitude: 7.4474,
    gallery: makeGallery(4),
  },
  {
    id: '4',
    name: 'Lausanne Luxe Spa',
    image: salonHeroImages[3],
    address: 'Avenue de la Gare 12, 1003 Lausanne, Switzerland',
    distance: '3.0 km',
    rating: 4.9,
    reviewCount: 3520,
    isOpen: true,
    openHours: '8:00 AM - 9:00 PM',
    phone: '+41 21 456 7890',
    about: 'Lausanne Luxe Spa offers a five-star wellness experience overlooking Lake Geneva. Our award-winning therapists provide signature treatments including hot stone massages, anti-aging facials, and premium hair styling in a tranquil lakeside retreat.',
    website: 'www.lausanneluxespa.ch',
    latitude: 46.5197,
    longitude: 6.6323,
    gallery: makeGallery(6),
  },
  {
    id: '5',
    name: 'Munich Edge Studio',
    image: salonHeroImages[5],
    address: 'Maximilianstrasse 28, 80539 Munich, Germany',
    distance: '4.2 km',
    rating: 4.6,
    reviewCount: 2680,
    isOpen: true,
    openHours: '9:00 AM - 8:00 PM',
    phone: '+49 89 234 5678',
    about: 'Munich Edge Studio is a cutting-edge barbershop and salon in the heart of Munich. Combining Bavarian tradition with contemporary trends, our team delivers bold styles, sharp fades, and creative color work that sets you apart.',
    website: 'www.munichedgestudio.de',
    latitude: 48.1351,
    longitude: 11.5820,
    gallery: makeGallery(1),
  },
  {
    id: '6',
    name: 'Vienna Heritage Salon',
    image: salonHeroImages[6],
    address: 'Karntner Strasse 34, 1010 Vienna, Austria',
    distance: '1.0 km',
    rating: 4.8,
    reviewCount: 3210,
    isOpen: true,
    openHours: '8:00 AM - 7:00 PM',
    phone: '+43 1 567 8901',
    about: 'Vienna Heritage Salon is a family-run establishment celebrating over 30 years of excellence in grooming. Our warm, classic interior and expert stylists deliver timeless cuts, elegant updos, and personalized beauty services for all ages.',
    website: 'www.viennaheritagesalon.at',
    latitude: 48.2082,
    longitude: 16.3738,
    gallery: makeGallery(3),
  },
  {
    id: '7',
    name: 'Basel Wellness Studio',
    image: salonHeroImages[4],
    address: 'Freie Strasse 22, 4001 Basel, Switzerland',
    distance: '1.8 km',
    rating: 4.9,
    reviewCount: 3890,
    isOpen: true,
    openHours: '9:00 AM - 8:30 PM',
    phone: '+41 61 345 6789',
    about: 'Basel Wellness Studio is a holistic beauty and wellness destination in the cultural heart of Basel. From deep tissue massages to organic hair treatments and rejuvenating facials, every service is crafted for total relaxation and renewal.',
    website: 'www.baselwellness.ch',
    latitude: 47.5596,
    longitude: 7.5886,
    gallery: makeGallery(5),
  },
  {
    id: '8',
    name: 'Lucerne Style House',
    image: salonHeroImages[7],
    address: 'Hertensteinstrasse 8, 6004 Lucerne, Switzerland',
    distance: '2.5 km',
    rating: 4.5,
    reviewCount: 1980,
    isOpen: true,
    openHours: '10:00 AM - 7:00 PM',
    phone: '+41 41 678 9012',
    about: 'Lucerne Style House is a modern salon in the picturesque city of Lucerne, specializing in trend-forward cuts, vivid colors, and creative styling. Our passionate team brings international flair to every appointment.',
    website: 'www.lucernestylehouse.ch',
    latitude: 47.0502,
    longitude: 8.3093,
    gallery: makeGallery(7),
  },
];

const salonServices: Record<string, { name: string; price: number; duration: string; image: string; category: string }[]> = {
  '1': [
    { name: 'Precision Haircut', price: 55, duration: '30 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Blow Dry & Style', price: 40, duration: '25 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Full Hair Color', price: 120, duration: '90 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Balayage Highlights', price: 180, duration: '120 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Deep Conditioning', price: 60, duration: '30 min', image: serviceImages.hairColor, category: 'Hair Treatment' },
    { name: 'Classic Facial', price: 75, duration: '45 min', image: serviceImages.facial, category: 'Facial' },
    { name: 'Hot Towel Shave', price: 45, duration: '30 min', image: serviceImages.haircut, category: 'Shave' },
    { name: 'Gel Manicure', price: 50, duration: '35 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Spa Pedicure', price: 60, duration: '45 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Relaxation Massage', price: 95, duration: '60 min', image: serviceImages.massage, category: 'Massage' },
  ],
  '2': [
    { name: 'Women\'s Haircut', price: 65, duration: '35 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Children\'s Haircut', price: 35, duration: '20 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Root Touch Up', price: 85, duration: '60 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Ombre Color', price: 160, duration: '120 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Keratin Treatment', price: 220, duration: '150 min', image: serviceImages.hairColor, category: 'Hair Treatment' },
    { name: 'Hydrating Facial', price: 80, duration: '50 min', image: serviceImages.facial, category: 'Facial' },
    { name: 'Evening Makeup', price: 90, duration: '60 min', image: serviceImages.facialMakeup, category: 'Make Up' },
    { name: 'Acrylic Nails', price: 65, duration: '60 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Swedish Massage', price: 100, duration: '60 min', image: serviceImages.massage, category: 'Massage' },
    { name: 'Eyebrow Shaping', price: 25, duration: '15 min', image: serviceImages.facialMakeup, category: 'Make Up' },
  ],
  '3': [
    { name: 'Classic Haircut', price: 45, duration: '25 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Buzz Cut', price: 30, duration: '15 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Hot Towel Shave', price: 40, duration: '30 min', image: serviceImages.haircut, category: 'Shave' },
    { name: 'Beard Trim', price: 25, duration: '15 min', image: serviceImages.haircut, category: 'Beard' },
    { name: 'Fade & Design', price: 55, duration: '40 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Hair & Beard Combo', price: 65, duration: '45 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Scalp Treatment', price: 40, duration: '20 min', image: serviceImages.massage, category: 'Hair Treatment' },
    { name: 'Gray Blending', price: 60, duration: '40 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Head Massage', price: 35, duration: '15 min', image: serviceImages.massage, category: 'Massage' },
    { name: 'Straight Razor Lineup', price: 20, duration: '10 min', image: serviceImages.haircut, category: 'Shave' },
  ],
  '4': [
    { name: 'Luxury Haircut', price: 80, duration: '40 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Diamond Facial', price: 130, duration: '60 min', image: serviceImages.facial, category: 'Facial' },
    { name: 'Gold Mask Treatment', price: 150, duration: '75 min', image: serviceImages.facial, category: 'Facial' },
    { name: 'Full Color & Gloss', price: 200, duration: '120 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Hot Stone Massage', price: 160, duration: '90 min', image: serviceImages.massage, category: 'Massage' },
    { name: 'Aromatherapy Massage', price: 140, duration: '75 min', image: serviceImages.massage, category: 'Massage' },
    { name: 'Deluxe Manicure', price: 70, duration: '45 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Deluxe Pedicure', price: 80, duration: '50 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Lash Extensions', price: 110, duration: '90 min', image: serviceImages.facialMakeup, category: 'Make Up' },
  ],
  '5': [
    { name: 'Men\'s Haircut', price: 45, duration: '25 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Skin Fade', price: 50, duration: '35 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Beard Sculpting', price: 35, duration: '20 min', image: serviceImages.haircut, category: 'Beard' },
    { name: 'Razor Shave', price: 40, duration: '25 min', image: serviceImages.haircut, category: 'Shave' },
    { name: 'Hair Design', price: 60, duration: '45 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Color Camo', price: 55, duration: '30 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Scalp Massage', price: 30, duration: '15 min', image: serviceImages.massage, category: 'Massage' },
    { name: 'Face Mask', price: 45, duration: '25 min', image: serviceImages.facial, category: 'Facial' },
  ],
  '6': [
    { name: 'Family Haircut', price: 40, duration: '25 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Children\'s Cut', price: 28, duration: '20 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Senior\'s Cut', price: 32, duration: '20 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Basic Color', price: 75, duration: '60 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Highlights', price: 110, duration: '90 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Express Facial', price: 50, duration: '30 min', image: serviceImages.facial, category: 'Facial' },
    { name: 'Quick Makeup', price: 55, duration: '30 min', image: serviceImages.facialMakeup, category: 'Make Up' },
    { name: 'Classic Manicure', price: 35, duration: '25 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Classic Pedicure', price: 40, duration: '30 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Back & Shoulder Massage', price: 65, duration: '30 min', image: serviceImages.massage, category: 'Massage' },
  ],
  '7': [
    { name: 'Signature Haircut', price: 65, duration: '35 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Anti-Aging Facial', price: 110, duration: '60 min', image: serviceImages.facial, category: 'Facial' },
    { name: 'Vitamin C Facial', price: 95, duration: '50 min', image: serviceImages.facial, category: 'Facial' },
    { name: 'Deep Tissue Massage', price: 140, duration: '90 min', image: serviceImages.massage, category: 'Massage' },
    { name: 'Thai Massage', price: 120, duration: '75 min', image: serviceImages.massage, category: 'Massage' },
    { name: 'Body Scrub & Wrap', price: 170, duration: '90 min', image: serviceImages.massage, category: 'Spa' },
    { name: 'Luxury Manicure', price: 55, duration: '40 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Luxury Pedicure', price: 65, duration: '50 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Organic Color', price: 130, duration: '90 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Scalp Detox', price: 75, duration: '40 min', image: serviceImages.massage, category: 'Hair Treatment' },
  ],
  '8': [
    { name: 'Trendy Cut', price: 55, duration: '30 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Undercut Design', price: 65, duration: '40 min', image: serviceImages.haircut, category: 'Haircut' },
    { name: 'Vivid Color', price: 150, duration: '120 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Pastel Tones', price: 170, duration: '150 min', image: serviceImages.hairColor, category: 'Hair Color' },
    { name: 'Creative Braids', price: 85, duration: '60 min', image: serviceImages.haircut, category: 'Hair Styling' },
    { name: 'Festival Makeup', price: 70, duration: '45 min', image: serviceImages.facialMakeup, category: 'Make Up' },
    { name: 'Nail Art', price: 65, duration: '60 min', image: serviceImages.nails, category: 'Nails' },
    { name: 'Express Facial', price: 55, duration: '30 min', image: serviceImages.facial, category: 'Facial' },
    { name: 'Head & Neck Massage', price: 50, duration: '25 min', image: serviceImages.massage, category: 'Massage' },
  ],
};

const salonPackages: Record<string, { name: string; price: number; originalPrice: number; services: string[]; image: string }[]> = {
  '1': [
    { name: 'Swiss Signature', price: 130, originalPrice: 170, services: ['Precision Haircut', 'Blow Dry & Style', 'Classic Facial'], image: serviceImages.haircut },
    { name: 'Color & Care', price: 200, originalPrice: 255, services: ['Full Hair Color', 'Deep Conditioning', 'Relaxation Massage'], image: serviceImages.hairColor },
    { name: 'Alpine Retreat', price: 300, originalPrice: 380, services: ['Balayage Highlights', 'Gel Manicure', 'Spa Pedicure', 'Relaxation Massage'], image: serviceImages.massage },
  ],
  '2': [
    { name: 'Quick Refresh', price: 110, originalPrice: 140, services: ['Women\'s Haircut', 'Hydrating Facial', 'Eyebrow Shaping'], image: serviceImages.haircut },
    { name: 'Color Queen', price: 210, originalPrice: 260, services: ['Ombre Color', 'Keratin Treatment'], image: serviceImages.hairColor },
    { name: 'Total Makeover', price: 280, originalPrice: 350, services: ['Women\'s Haircut', 'Evening Makeup', 'Acrylic Nails', 'Swedish Massage'], image: serviceImages.facialMakeup },
  ],
  '3': [
    { name: 'Gentleman\'s Classic', price: 85, originalPrice: 110, services: ['Classic Haircut', 'Hot Towel Shave', 'Head Massage'], image: serviceImages.haircut },
    { name: 'Sharp & Clean', price: 95, originalPrice: 120, services: ['Fade & Design', 'Beard Trim', 'Straight Razor Lineup'], image: serviceImages.haircut },
    { name: 'Executive Grooming', price: 140, originalPrice: 175, services: ['Hair & Beard Combo', 'Scalp Treatment', 'Gray Blending'], image: serviceImages.hairColor },
  ],
  '4': [
    { name: 'Royal Treatment', price: 280, originalPrice: 350, services: ['Luxury Haircut', 'Diamond Facial', 'Aromatherapy Massage'], image: serviceImages.facial },
    { name: 'Gold Experience', price: 350, originalPrice: 430, services: ['Full Color & Gloss', 'Gold Mask Treatment', 'Deluxe Manicure'], image: serviceImages.hairColor },
    { name: 'Ultimate Indulgence', price: 420, originalPrice: 530, services: ['Luxury Haircut', 'Hot Stone Massage', 'Lash Extensions', 'Deluxe Pedicure'], image: serviceImages.massage },
  ],
  '5': [
    { name: 'Quick Trim', price: 75, originalPrice: 95, services: ['Men\'s Haircut', 'Beard Sculpting', 'Scalp Massage'], image: serviceImages.haircut },
    { name: 'Fresh Fade', price: 90, originalPrice: 115, services: ['Skin Fade', 'Razor Shave', 'Face Mask'], image: serviceImages.haircut },
    { name: 'Style Master', price: 120, originalPrice: 150, services: ['Hair Design', 'Color Camo', 'Scalp Massage'], image: serviceImages.hairColor },
  ],
  '6': [
    { name: 'Family Bundle', price: 60, originalPrice: 75, services: ['Family Haircut', 'Children\'s Cut'], image: serviceImages.haircut },
    { name: 'Pamper Day', price: 130, originalPrice: 165, services: ['Family Haircut', 'Express Facial', 'Classic Manicure', 'Classic Pedicure'], image: serviceImages.facial },
    { name: 'Full Glow Up', price: 190, originalPrice: 240, services: ['Highlights', 'Quick Makeup', 'Classic Manicure', 'Back & Shoulder Massage'], image: serviceImages.hairColor },
  ],
  '7': [
    { name: 'Zen Retreat', price: 240, originalPrice: 300, services: ['Anti-Aging Facial', 'Deep Tissue Massage', 'Scalp Detox'], image: serviceImages.massage },
    { name: 'Beauty & Bliss', price: 190, originalPrice: 240, services: ['Signature Haircut', 'Vitamin C Facial', 'Luxury Manicure'], image: serviceImages.facial },
    { name: 'Total Wellness', price: 400, originalPrice: 500, services: ['Thai Massage', 'Body Scrub & Wrap', 'Luxury Pedicure', 'Organic Color'], image: serviceImages.massage },
  ],
  '8': [
    { name: 'Street Style', price: 110, originalPrice: 140, services: ['Trendy Cut', 'Undercut Design', 'Head & Neck Massage'], image: serviceImages.haircut },
    { name: 'Color Pop', price: 220, originalPrice: 280, services: ['Vivid Color', 'Creative Braids', 'Express Facial'], image: serviceImages.hairColor },
    { name: 'Festival Ready', price: 270, originalPrice: 340, services: ['Pastel Tones', 'Festival Makeup', 'Nail Art'], image: serviceImages.facialMakeup },
  ],
};

const salonSpecialists: Record<string, { name: string; role: string; image: string; rating: number }[]> = {
  '1': [
    { name: 'Lukas Meier', role: 'Senior Stylist', image: specialistImages[0], rating: 4.9 },
    { name: 'Anna Keller', role: 'Color Specialist', image: specialistImages[1], rating: 4.8 },
    { name: 'Marc Huber', role: 'Master Barber', image: specialistImages[2], rating: 4.9 },
    { name: 'Sophie Brunner', role: 'Nail Technician', image: specialistImages[3], rating: 4.7 },
    { name: 'Thomas Widmer', role: 'Massage Therapist', image: specialistImages[4], rating: 4.8 },
  ],
  '2': [
    { name: 'Claire Dupont', role: 'Lead Stylist', image: specialistImages[5], rating: 4.8 },
    { name: 'Pierre Laurent', role: 'Hair Colorist', image: specialistImages[0], rating: 4.7 },
    { name: 'Isabelle Martin', role: 'Esthetician', image: specialistImages[1], rating: 4.9 },
    { name: 'Jean-Luc Bernard', role: 'Makeup Artist', image: specialistImages[2], rating: 4.6 },
    { name: 'Marie Favre', role: 'Nail Artist', image: specialistImages[3], rating: 4.8 },
  ],
  '3': [
    { name: 'Stefan Berger', role: 'Master Barber', image: specialistImages[4], rating: 4.9 },
    { name: 'Reto Schwarz', role: 'Senior Barber', image: specialistImages[0], rating: 4.8 },
    { name: 'Niklaus Fischer', role: 'Fade Specialist', image: specialistImages[2], rating: 4.9 },
    { name: 'Daniel Gerber', role: 'Beard Expert', image: specialistImages[4], rating: 4.7 },
  ],
  '4': [
    { name: 'Camille Blanc', role: 'Luxury Stylist', image: specialistImages[5], rating: 4.9 },
    { name: 'Philippe Rochat', role: 'Spa Director', image: specialistImages[0], rating: 4.8 },
    { name: 'Valentina Rossi', role: 'Esthetician', image: specialistImages[1], rating: 4.9 },
    { name: 'Nicolas Aubert', role: 'Massage Specialist', image: specialistImages[2], rating: 4.7 },
    { name: 'Elena Bianchi', role: 'Lash Technician', image: specialistImages[3], rating: 4.8 },
  ],
  '5': [
    { name: 'Maximilian Braun', role: 'Head Barber', image: specialistImages[4], rating: 4.7 },
    { name: 'Felix Wagner', role: 'Fade Artist', image: specialistImages[0], rating: 4.6 },
    { name: 'Tobias Schmidt', role: 'Style Expert', image: specialistImages[2], rating: 4.5 },
    { name: 'Markus Bauer', role: 'Beard Specialist', image: specialistImages[4], rating: 4.8 },
  ],
  '6': [
    { name: 'Elisabeth Gruber', role: 'Family Stylist', image: specialistImages[5], rating: 4.8 },
    { name: 'Franz Hofer', role: 'Senior Barber', image: specialistImages[0], rating: 4.7 },
    { name: 'Maria Steiner', role: 'Children\'s Specialist', image: specialistImages[1], rating: 4.9 },
    { name: 'Wolfgang Pichler', role: 'Colorist', image: specialistImages[2], rating: 4.6 },
    { name: 'Sabine Winkler', role: 'Nail Technician', image: specialistImages[3], rating: 4.8 },
  ],
  '7': [
    { name: 'Dr. Lena Roth', role: 'Spa Therapist', image: specialistImages[5], rating: 4.9 },
    { name: 'Oliver Schneider', role: 'Senior Stylist', image: specialistImages[0], rating: 4.8 },
    { name: 'Yuki Tanaka', role: 'Massage Expert', image: specialistImages[1], rating: 4.9 },
    { name: 'Andreas Frey', role: 'Hair Colorist', image: specialistImages[2], rating: 4.7 },
    { name: 'Katarina Novak', role: 'Esthetician', image: specialistImages[3], rating: 4.9 },
  ],
  '8': [
    { name: 'Lea Zimmermann', role: 'Creative Director', image: specialistImages[5], rating: 4.6 },
    { name: 'Patrick Mueller', role: 'Color Innovator', image: specialistImages[0], rating: 4.5 },
    { name: 'Nina Weber', role: 'Braid Specialist', image: specialistImages[1], rating: 4.7 },
    { name: 'Sandra Vogel', role: 'Nail Artist', image: specialistImages[3], rating: 4.4 },
    { name: 'Jan Kessler', role: 'Trend Stylist', image: specialistImages[4], rating: 4.5 },
  ],
};

const salonReviews: Record<string, { userName: string; userImage: string; rating: number; comment: string; date: string }[]> = {
  '1': [
    { userName: 'Emma Hofmann', userImage: reviewerImages[0], rating: 5, comment: 'Absolutely love Alpine Groom! My balayage turned out stunning and the team was so attentive.', date: '2 days ago' },
    { userName: 'Michael Weber', userImage: reviewerImages[1], rating: 5, comment: 'Best facial I have ever had. My skin is glowing! Will definitely be back.', date: '5 days ago' },
    { userName: 'Robert Fischer', userImage: reviewerImages[2], rating: 4, comment: 'Great haircut and very relaxing atmosphere. Swiss quality at its finest.', date: '1 week ago' },
    { userName: 'Laura Schmid', userImage: reviewerImages[3], rating: 5, comment: 'The hot towel shave was incredible. True craftmanship in every detail.', date: '2 weeks ago' },
    { userName: 'David Schneider', userImage: reviewerImages[4], rating: 4, comment: 'Clean salon, professional staff. The massage was incredibly relaxing.', date: '3 weeks ago' },
    { userName: 'Jessica Mueller', userImage: reviewerImages[5], rating: 5, comment: 'Sophie did an amazing job on my nails. So detailed and long-lasting!', date: '1 month ago' },
  ],
  '2': [
    { userName: 'Marie Lefevre', userImage: reviewerImages[1], rating: 5, comment: 'Claire is a genius with color! My ombre looks so natural and beautiful.', date: '1 day ago' },
    { userName: 'Christian Favre', userImage: reviewerImages[2], rating: 4, comment: 'Wonderful ambiance and friendly staff. The keratin treatment made my hair silky smooth.', date: '4 days ago' },
    { userName: 'Nicole Perrin', userImage: reviewerImages[3], rating: 5, comment: 'Brought my daughter for her first haircut here. They were so patient and sweet with her!', date: '1 week ago' },
    { userName: 'Matthieu Blanc', userImage: reviewerImages[0], rating: 4, comment: 'Solid haircut and good conversation. Excellent quality for the price.', date: '2 weeks ago' },
    { userName: 'Laura Girard', userImage: reviewerImages[4], rating: 5, comment: 'The Swedish massage melted all my stress away. Marie\'s nail work is art!', date: '3 weeks ago' },
  ],
  '3': [
    { userName: 'Marco Bieri', userImage: reviewerImages[5], rating: 5, comment: 'Best barbershop in Bern, hands down. Stefan gave me the cleanest fade I have ever had.', date: '3 days ago' },
    { userName: 'Florian Keller', userImage: reviewerImages[0], rating: 5, comment: 'The hot towel shave is an experience every man needs. Old-school quality at its finest.', date: '1 week ago' },
    { userName: 'Peter Brunner', userImage: reviewerImages[2], rating: 5, comment: 'Been coming here for years. Consistent, quality work every single time.', date: '2 weeks ago' },
    { userName: 'Jonas Huber', userImage: reviewerImages[4], rating: 4, comment: 'Great barbers but it can get crowded on weekends. Book ahead if you can.', date: '3 weeks ago' },
    { userName: 'Kevin Frei', userImage: reviewerImages[1], rating: 5, comment: 'Niklaus did an incredible design on my fade. Getting compliments everywhere!', date: '1 month ago' },
    { userName: 'Samuel Wyss', userImage: reviewerImages[3], rating: 5, comment: 'My go-to spot for a clean lineup. Professional and efficient every time.', date: '1 month ago' },
  ],
  '4': [
    { userName: 'Victoria Rochat', userImage: reviewerImages[3], rating: 5, comment: 'The Gold Mask Treatment was divine. My skin feels 10 years younger!', date: '2 days ago' },
    { userName: 'Catherine Morel', userImage: reviewerImages[1], rating: 5, comment: 'Hot stone massage was absolutely heavenly. The lakeside ambiance is so luxurious.', date: '5 days ago' },
    { userName: 'Richard Bonvin', userImage: reviewerImages[2], rating: 4, comment: 'Premium experience with premium prices. You get what you pay for here.', date: '1 week ago' },
    { userName: 'Diana Favre', userImage: reviewerImages[4], rating: 5, comment: 'Camille is the best stylist I have ever had. She understands exactly what I want.', date: '2 weeks ago' },
    { userName: 'William Aubert', userImage: reviewerImages[0], rating: 4, comment: 'Excellent service and beautiful space. Lash extensions look very natural.', date: '1 month ago' },
  ],
  '5': [
    { userName: 'Jakob Hoffmann', userImage: reviewerImages[0], rating: 5, comment: 'Maximilian gives the best fades in Munich. Quick, clean, and reliable.', date: '1 day ago' },
    { userName: 'Tobias Richter', userImage: reviewerImages[2], rating: 4, comment: 'Good barbershop with a cool modern vibe. The face mask was a nice touch.', date: '3 days ago' },
    { userName: 'Erik Becker', userImage: reviewerImages[5], rating: 5, comment: 'Been to many barbers but Munich Edge is something special. Highly recommend!', date: '1 week ago' },
    { userName: 'Niklas Lang', userImage: reviewerImages[4], rating: 4, comment: 'Solid haircut at a fair price. The guys here really know their craft.', date: '2 weeks ago' },
    { userName: 'Alexander Wolf', userImage: reviewerImages[1], rating: 4, comment: 'My beard has never looked this good. Markus is a true beard specialist.', date: '3 weeks ago' },
    { userName: 'Benjamin Klein', userImage: reviewerImages[3], rating: 5, comment: 'Tobias gave me exactly the style I wanted. Great attention to detail.', date: '1 month ago' },
  ],
  '6': [
    { userName: 'Angela Huber', userImage: reviewerImages[3], rating: 5, comment: 'We bring the whole family here! Elisabeth is wonderful with the kids.', date: '2 days ago' },
    { userName: 'Patricia Gruber', userImage: reviewerImages[1], rating: 5, comment: 'Affordable and high quality. My highlights look amazing! Best value in Vienna.', date: '4 days ago' },
    { userName: 'Thomas Berger', userImage: reviewerImages[0], rating: 4, comment: 'Good neighborhood salon. Franz always gives me a great cut.', date: '1 week ago' },
    { userName: 'Linda Pichler', userImage: reviewerImages[4], rating: 5, comment: 'Maria is the best with children\'s haircuts. My toddler actually enjoyed it!', date: '2 weeks ago' },
    { userName: 'Georg Moser', userImage: reviewerImages[2], rating: 4, comment: 'Friendly staff and clean shop. The back massage was a nice surprise bonus.', date: '3 weeks ago' },
    { userName: 'Rosa Bauer', userImage: reviewerImages[5], rating: 5, comment: 'Love this place! The whole family leaves happy every single visit.', date: '1 month ago' },
  ],
  '7': [
    { userName: 'Sophia Keller', userImage: reviewerImages[4], rating: 5, comment: 'The deep tissue massage was transformative. Dr. Roth has healing hands.', date: '1 day ago' },
    { userName: 'Olivia Brandt', userImage: reviewerImages[1], rating: 5, comment: 'Best spa experience in Basel! The body scrub and wrap left me feeling reborn.', date: '3 days ago' },
    { userName: 'Emma Weber', userImage: reviewerImages[3], rating: 5, comment: 'The anti-aging facial is worth every penny. Visible results after just one session!', date: '1 week ago' },
    { userName: 'James Foster', userImage: reviewerImages[0], rating: 4, comment: 'Oliver gave me an excellent haircut. The whole spa atmosphere is very calming.', date: '2 weeks ago' },
    { userName: 'Rachel Maurer', userImage: reviewerImages[5], rating: 5, comment: 'Yuki\'s Thai massage is absolutely incredible. I come back every month now.', date: '3 weeks ago' },
    { userName: 'Daniel Schafer', userImage: reviewerImages[2], rating: 5, comment: 'Organic color turned out beautifully. Katarina\'s facials are magical too.', date: '1 month ago' },
  ],
  '8': [
    { userName: 'Megan Ritter', userImage: reviewerImages[4], rating: 5, comment: 'Lea is a creative genius! My vivid purple turned out insanely good.', date: '1 day ago' },
    { userName: 'Sarah Graf', userImage: reviewerImages[1], rating: 4, comment: 'Trendy salon with great energy. The undercut design was exactly what I wanted.', date: '3 days ago' },
    { userName: 'Taylor Kuhn', userImage: reviewerImages[3], rating: 4, comment: 'Love the vibe here. Pastel tones came out perfectly. A bit pricey though.', date: '1 week ago' },
    { userName: 'Jordan Lenz', userImage: reviewerImages[0], rating: 5, comment: 'Nina\'s braids are absolute works of art. Got so many compliments!', date: '2 weeks ago' },
    { userName: 'Chris Ernst', userImage: reviewerImages[2], rating: 4, comment: 'Cool spot with talented stylists. Nail art by Sandra was stunning.', date: '3 weeks ago' },
    { userName: 'Morgan Baumann', userImage: reviewerImages[5], rating: 4, comment: 'Great atmosphere and music. Jan nailed the trendy cut I was going for.', date: '1 month ago' },
  ],
};

export async function seedDatabase() {
  // Check if we should skip seeding
  if (process.env.FORCE_SEED !== "true") {
    const existingSalons = await db.select().from(salons).limit(1);
    if (existingSalons.length > 0) {
      console.log("Database already contains data, skipping seed. Use FORCE_SEED=true to override.");
      return;
    }
  }

  console.log("Seeding database with European/Swiss data...");

  // Clear all tables
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

  // Seed Admin & Demo Users
  const bcrypt = require('bcryptjs');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const demoPassword = await bcrypt.hash('demo123', 10);

  await db.insert(users).values([
    {
      id: '00000000-0000-0000-0000-000000000000',
      fullName: 'Platform Admin',
      email: 'admin@barber.com',
      password: adminPassword,
      role: 'super_admin',
      phone: '+41 44 000 0001',
      loyaltyPoints: 1000,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    },
    {
      id: '00000000-0000-0000-0000-000000000001',
      fullName: 'Lukas Meier',
      email: 'lukas@alpinegroom.ch',
      password: demoPassword,
      role: 'salon_admin',
      phone: '+41 44 123 4567',
      avatar: specialistImages[0],
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      fullName: 'Claire Dupont',
      email: 'claire@genevaelegance.ch',
      password: demoPassword,
      role: 'salon_admin',
      phone: '+41 22 765 4321',
      avatar: specialistImages[5],
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      fullName: 'Stefan Berger',
      email: 'stefan@bernclassic.ch',
      password: demoPassword,
      role: 'salon_admin',
      phone: '+41 31 890 1234',
      avatar: specialistImages[4],
    },
    {
      id: '00000000-0000-0000-0000-000000000010',
      fullName: 'Emma Hofmann',
      email: 'emma@example.com',
      password: demoPassword,
      role: 'user',
      phone: '+41 78 111 2233',
      avatar: reviewerImages[0],
      loyaltyPoints: 250,
    },
    {
      id: '00000000-0000-0000-0000-000000000011',
      fullName: 'Michael Weber',
      email: 'michael@example.com',
      password: demoPassword,
      role: 'user',
      phone: '+41 79 222 3344',
      avatar: reviewerImages[1],
      loyaltyPoints: 180,
    },
    {
      id: '00000000-0000-0000-0000-000000000012',
      fullName: 'Robert Fischer',
      email: 'robert@example.com',
      password: demoPassword,
      role: 'user',
      phone: '+49 170 333 4455',
      avatar: reviewerImages[2],
      loyaltyPoints: 420,
    },
    {
      id: '00000000-0000-0000-0000-000000000020',
      fullName: 'Marc Huber',
      email: 'marc@alpinegroom.ch',
      password: demoPassword,
      role: 'staff',
      phone: '+41 44 123 4568',
      avatar: specialistImages[2],
    },
    {
      id: '00000000-0000-0000-0000-000000000021',
      fullName: 'Anna Keller',
      email: 'anna@alpinegroom.ch',
      password: demoPassword,
      role: 'staff',
      phone: '+41 44 123 4569',
      avatar: specialistImages[1],
    },
  ]);

  // Seed Salons
  await db.insert(salons).values(salonData.map(s => ({
    ...s,
    ownerId: s.id === '1' ? '00000000-0000-0000-0000-000000000001'
           : s.id === '2' ? '00000000-0000-0000-0000-000000000002'
           : s.id === '3' ? '00000000-0000-0000-0000-000000000003'
           : '',
  })));

  // Seed Salon Staff links
  await db.insert(salonStaff).values([
    { userId: '00000000-0000-0000-0000-000000000001', salonId: '1', role: 'salon_admin' },
    { userId: '00000000-0000-0000-0000-000000000020', salonId: '1', role: 'staff' },
    { userId: '00000000-0000-0000-0000-000000000021', salonId: '1', role: 'staff' },
    { userId: '00000000-0000-0000-0000-000000000002', salonId: '2', role: 'salon_admin' },
    { userId: '00000000-0000-0000-0000-000000000003', salonId: '3', role: 'salon_admin' },
  ]);

  // Seed Plans
  await db.insert(plans).values([
    {
      id: 'plan-basic',
      name: 'Basic',
      price: 29,
      billingCycle: 'monthly',
      features: ['Up to 50 bookings per month', 'Basic analytics', 'Email support', '1 staff member'],
      commissionRate: 8,
      maxBookings: 50,
      maxStaff: 1,
      isActive: true,
    },
    {
      id: 'plan-pro',
      name: 'Pro',
      price: 79,
      billingCycle: 'monthly',
      features: ['Unlimited bookings', 'Advanced analytics', 'Priority support', 'Up to 5 staff', 'Custom landing page', 'Inventory management'],
      commissionRate: 5,
      maxBookings: 0,
      maxStaff: 5,
      isActive: true,
    },
    {
      id: 'plan-enterprise',
      name: 'Enterprise',
      price: 149,
      billingCycle: 'monthly',
      features: ['Unlimited everything', 'Dedicated account manager', 'API access', 'White-label options', 'Custom integrations', 'Multi-location support'],
      commissionRate: 3,
      maxBookings: 0,
      maxStaff: 0,
      isActive: true,
    },
  ]);

  // Seed Subscriptions
  await db.insert(subscriptions).values([
    { salonId: '1', planId: 'plan-pro', status: 'active', startDate: '2025-01-01', endDate: '2026-01-01' },
    { salonId: '2', planId: 'plan-enterprise', status: 'active', startDate: '2025-02-01', endDate: '2026-02-01' },
    { salonId: '3', planId: 'plan-basic', status: 'active', startDate: '2025-03-01', endDate: '2026-03-01' },
    { salonId: '4', planId: 'plan-pro', status: 'active', startDate: '2025-01-15', endDate: '2026-01-15' },
    { salonId: '5', planId: 'plan-basic', status: 'active', startDate: '2025-04-01', endDate: '2026-04-01' },
    { salonId: '6', planId: 'plan-pro', status: 'active', startDate: '2025-02-15', endDate: '2026-02-15' },
    { salonId: '7', planId: 'plan-enterprise', status: 'active', startDate: '2025-01-01', endDate: '2026-01-01' },
    { salonId: '8', planId: 'plan-basic', status: 'active', startDate: '2025-05-01', endDate: '2026-05-01' },
  ]);

  // Seed License Keys
  await db.insert(licenseKeys).values([
    { key: 'ALPINE-GROOM-2025-XXXX', salonId: '1', planId: 'plan-pro', status: 'active', expiresAt: '2026-01-01', maxActivations: 3, activationCount: 1 },
    { key: 'GENEVA-ELEG-2025-XXXX', salonId: '2', planId: 'plan-enterprise', status: 'active', expiresAt: '2026-02-01', maxActivations: 5, activationCount: 2 },
    { key: 'BERN-CLASSIC-2025-XXXX', salonId: '3', planId: 'plan-basic', status: 'active', expiresAt: '2026-03-01', maxActivations: 1, activationCount: 1 },
    { key: 'DEMO-FREE-TRIAL-2025', salonId: '', planId: '', status: 'unused', expiresAt: '2026-12-31', maxActivations: 0, activationCount: 0 },
  ]);

  // Seed Services, Packages, Specialists, Reviews per salon
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

  // Seed Coupons
  await db.insert(coupons).values([
    { code: 'WELCOME10', discount: 10, type: 'percentage', expiryDate: '2026-12-31', usageLimit: 100, active: true },
    { code: 'SWISS20', discount: 20, type: 'percentage', expiryDate: '2026-06-30', usageLimit: 50, active: true },
    { code: 'SAVE15', discount: 15, type: 'fixed', expiryDate: '2026-09-30', usageLimit: 200, active: true },
    { code: 'SUMMER25', discount: 25, type: 'percentage', expiryDate: '2026-08-31', usageLimit: 100, active: true },
  ]);

  // Seed Messages
  await db.insert(messages).values([
    { userId: '00000000-0000-0000-0000-000000000010', salonId: '1', salonName: 'Alpine Groom', content: 'Hello, I would like to confirm my appointment for Saturday.', sender: 'user' },
    { userId: '00000000-0000-0000-0000-000000000010', salonId: '1', salonName: 'Alpine Groom', content: 'Of course! Your appointment on Saturday at 10:00 AM is confirmed. See you then!', sender: 'salon' },
    { userId: '00000000-0000-0000-0000-000000000011', salonId: '2', salonName: 'Geneva Elegance', content: 'Do you offer keratin treatment for men?', sender: 'user' },
    { userId: '00000000-0000-0000-0000-000000000011', salonId: '2', salonName: 'Geneva Elegance', content: 'Absolutely! Our keratin treatment works great for all hair types. Would you like to book?', sender: 'salon' },
    { userId: '00000000-0000-0000-0000-000000000012', salonId: '3', salonName: 'Bern Classic Barbers', content: 'What are your available slots for tomorrow?', sender: 'user' },
    { userId: '00000000-0000-0000-0000-000000000012', salonId: '3', salonName: 'Bern Classic Barbers', content: 'We have openings at 11:00 AM, 2:00 PM, and 4:30 PM. Which works best for you?', sender: 'salon' },
  ]);

  // Seed Notifications
  await db.insert(notifications).values([
    { userId: '00000000-0000-0000-0000-000000000010', title: 'Booking Confirmed', message: 'Your appointment at Alpine Groom on Saturday at 10:00 AM has been confirmed.', type: 'booking', read: false },
    { userId: '00000000-0000-0000-0000-000000000010', title: 'Welcome Bonus', message: 'You have earned 50 loyalty points as a welcome bonus! Use them on your next visit.', type: 'loyalty', read: true },
    { userId: '00000000-0000-0000-0000-000000000011', title: 'Special Offer', message: 'Get 20% off your next visit to Geneva Elegance with code SWISS20.', type: 'promotion', read: false },
    { userId: '00000000-0000-0000-0000-000000000012', title: 'Review Reminder', message: 'How was your visit to Bern Classic Barbers? Leave a review and earn 10 loyalty points.', type: 'system', read: false },
  ]);

  // Seed Bookings (mix of completed, pending, upcoming, cancelled)
  await db.insert(bookings).values([
    {
      userId: '00000000-0000-0000-0000-000000000010',
      salonId: '1', salonName: 'Alpine Groom', salonImage: salonHeroImages[0],
      services: ['Precision Haircut', 'Hot Towel Shave'],
      date: '2025-12-15', time: '10:00 AM', totalPrice: 100, status: 'completed', paymentMethod: 'card',
      specialistId: '1_sp1',
    },
    {
      userId: '00000000-0000-0000-0000-000000000010',
      salonId: '1', salonName: 'Alpine Groom', salonImage: salonHeroImages[0],
      services: ['Relaxation Massage'],
      date: '2026-01-10', time: '2:00 PM', totalPrice: 95, status: 'completed', paymentMethod: 'card',
      specialistId: '1_sp5',
    },
    {
      userId: '00000000-0000-0000-0000-000000000011',
      salonId: '2', salonName: 'Geneva Elegance', salonImage: salonHeroImages[1],
      services: ['Women\'s Haircut', 'Hydrating Facial'],
      date: '2026-02-05', time: '11:00 AM', totalPrice: 145, status: 'completed', paymentMethod: 'cash',
      specialistId: '2_sp1',
    },
    {
      userId: '00000000-0000-0000-0000-000000000012',
      salonId: '3', salonName: 'Bern Classic Barbers', salonImage: salonHeroImages[2],
      services: ['Classic Haircut', 'Beard Trim'],
      date: '2026-03-01', time: '9:30 AM', totalPrice: 70, status: 'completed', paymentMethod: 'card',
      specialistId: '3_sp1',
    },
    {
      userId: '00000000-0000-0000-0000-000000000010',
      salonId: '4', salonName: 'Lausanne Luxe Spa', salonImage: salonHeroImages[3],
      services: ['Diamond Facial', 'Hot Stone Massage'],
      date: '2026-03-20', time: '1:00 PM', totalPrice: 290, status: 'completed', paymentMethod: 'card',
      specialistId: '4_sp3',
    },
    {
      userId: '00000000-0000-0000-0000-000000000011',
      salonId: '5', salonName: 'Munich Edge Studio', salonImage: salonHeroImages[5],
      services: ['Men\'s Haircut', 'Skin Fade'],
      date: '2026-04-05', time: '3:00 PM', totalPrice: 95, status: 'pending', paymentMethod: 'card',
      specialistId: '5_sp1',
    },
    {
      userId: '00000000-0000-0000-0000-000000000012',
      salonId: '6', salonName: 'Vienna Heritage Salon', salonImage: salonHeroImages[6],
      services: ['Family Haircut', 'Children\'s Cut'],
      date: '2026-04-10', time: '10:00 AM', totalPrice: 68, status: 'upcoming', paymentMethod: 'cash',
      specialistId: '6_sp1',
    },
    {
      userId: '00000000-0000-0000-0000-000000000010',
      salonId: '7', salonName: 'Basel Wellness Studio', salonImage: salonHeroImages[4],
      services: ['Deep Tissue Massage', 'Anti-Aging Facial'],
      date: '2026-04-15', time: '11:00 AM', totalPrice: 250, status: 'upcoming', paymentMethod: 'card',
      specialistId: '7_sp1',
    },
    {
      userId: '00000000-0000-0000-0000-000000000011',
      salonId: '1', salonName: 'Alpine Groom', salonImage: salonHeroImages[0],
      services: ['Full Hair Color'],
      date: '2026-02-20', time: '2:00 PM', totalPrice: 120, status: 'cancelled', paymentMethod: 'card',
      specialistId: '1_sp2',
    },
    {
      userId: '00000000-0000-0000-0000-000000000012',
      salonId: '8', salonName: 'Lucerne Style House', salonImage: salonHeroImages[7],
      services: ['Vivid Color', 'Express Facial'],
      date: '2026-03-10', time: '4:00 PM', totalPrice: 205, status: 'completed', paymentMethod: 'card',
      specialistId: '8_sp1',
    },
  ]);

  // Seed Inventory for salon 1
  await db.insert(inventory).values([
    { salonId: '1', name: 'Professional Scissors Set', category: 'tools', quantity: 8, minQuantity: 3, unit: 'pcs', price: 120 },
    { salonId: '1', name: 'Hair Clipper Blades', category: 'tools', quantity: 15, minQuantity: 5, unit: 'pcs', price: 25 },
    { salonId: '1', name: 'Shampoo (Professional)', category: 'products', quantity: 24, minQuantity: 10, unit: 'bottles', price: 18 },
    { salonId: '1', name: 'Conditioner (Professional)', category: 'products', quantity: 20, minQuantity: 10, unit: 'bottles', price: 22 },
    { salonId: '1', name: 'Hair Color Tubes', category: 'supplies', quantity: 45, minQuantity: 15, unit: 'tubes', price: 12 },
    { salonId: '1', name: 'Disposable Towels', category: 'supplies', quantity: 200, minQuantity: 50, unit: 'pcs', price: 0.5 },
    { salonId: '1', name: 'Styling Gel', category: 'products', quantity: 30, minQuantity: 10, unit: 'jars', price: 15 },
    { salonId: '1', name: 'Straight Razors', category: 'tools', quantity: 6, minQuantity: 2, unit: 'pcs', price: 85 },
  ]);

  // Seed Expenses for salon 1
  await db.insert(expenses).values([
    { salonId: '1', description: 'Monthly rent - Bahnhofstrasse location', amount: 4500, category: 'rent', date: '2026-03-01' },
    { salonId: '1', description: 'Electricity and water utilities', amount: 380, category: 'utilities', date: '2026-03-01' },
    { salonId: '1', description: 'Hair product restocking from supplier', amount: 850, category: 'supplies', date: '2026-03-05' },
    { salonId: '1', description: 'Staff salaries - March', amount: 8200, category: 'salaries', date: '2026-03-15' },
    { salonId: '1', description: 'Equipment maintenance and repair', amount: 250, category: 'general', date: '2026-03-10' },
    { salonId: '1', description: 'Monthly rent - Bahnhofstrasse location', amount: 4500, category: 'rent', date: '2026-02-01' },
    { salonId: '1', description: 'Staff salaries - February', amount: 8200, category: 'salaries', date: '2026-02-15' },
    { salonId: '1', description: 'Marketing and advertising', amount: 600, category: 'general', date: '2026-02-20' },
  ]);

  // Seed Shifts for salon 1 staff
  const staffIds = ['00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000021'];
  const shiftEntries: any[] = [];
  for (const staffId of staffIds) {
    for (let day = 1; day <= 5; day++) { // Monday-Friday
      shiftEntries.push({ salonId: '1', staffId, dayOfWeek: day, startTime: '09:00', endTime: '17:00' });
    }
    shiftEntries.push({ salonId: '1', staffId, dayOfWeek: 6, startTime: '10:00', endTime: '15:00' }); // Saturday
  }
  await db.insert(shifts).values(shiftEntries);

  // Seed Commissions
  await db.insert(commissions).values([
    { bookingId: 'booking-1', salonId: '1', amount: 5.0, rate: 5, status: 'paid' },
    { bookingId: 'booking-2', salonId: '1', amount: 4.75, rate: 5, status: 'paid' },
    { bookingId: 'booking-3', salonId: '2', amount: 4.35, rate: 3, status: 'paid' },
    { bookingId: 'booking-4', salonId: '3', amount: 5.60, rate: 8, status: 'pending' },
    { bookingId: 'booking-5', salonId: '4', amount: 14.50, rate: 5, status: 'pending' },
  ]);

  // Seed App Settings
  await db.insert(appSettings).values([
    { key: 'platform_name', value: 'Barmagly', description: 'Platform display name' },
    { key: 'platform_currency', value: 'CHF', description: 'Default currency' },
    { key: 'default_commission_rate', value: '5', description: 'Default platform commission percentage' },
    { key: 'booking_advance_days', value: '30', description: 'Max days in advance for bookings' },
    { key: 'loyalty_points_per_booking', value: '10', description: 'Loyalty points earned per completed booking' },
    { key: 'maintenance_mode', value: 'false', description: 'Enable maintenance mode' },
  ]);

  // Seed Activity Logs
  await db.insert(activityLogs).values([
    { userId: '00000000-0000-0000-0000-000000000000', userRole: 'super_admin', action: 'platform.seed', entityType: 'system', entityId: '', metadata: { message: 'Database seeded with European/Swiss data' } },
    { userId: '00000000-0000-0000-0000-000000000001', userRole: 'salon_admin', action: 'salon.login', entityType: 'salon', entityId: '1', metadata: { salonName: 'Alpine Groom' } },
    { userId: '00000000-0000-0000-0000-000000000010', userRole: 'user', action: 'booking.created', entityType: 'booking', entityId: 'booking-1', metadata: { salonName: 'Alpine Groom', services: ['Precision Haircut'] } },
    { userId: '00000000-0000-0000-0000-000000000010', userRole: 'user', action: 'booking.completed', entityType: 'booking', entityId: 'booking-1', metadata: { salonName: 'Alpine Groom' } },
    { userId: '00000000-0000-0000-0000-000000000011', userRole: 'user', action: 'user.registered', entityType: 'user', entityId: '00000000-0000-0000-0000-000000000011', metadata: { source: 'web' } },
  ]);

  console.log("Database seeded successfully with European/Swiss data!");
}
