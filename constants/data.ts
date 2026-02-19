export interface Salon {
  id: string;
  name: string;
  image: string;
  address: string;
  distance: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  openHours: string;
  phone: string;
  about: string;
  website: string;
  latitude: number;
  longitude: number;
  services: Service[];
  packages: Package[];
  gallery: string[];
  reviews: Review[];
  specialists: Specialist[];
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  image: string;
  category: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  services: string[];
  image: string;
}

export interface Review {
  id: string;
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Specialist {
  id: string;
  name: string;
  role: string;
  image: string;
  rating: number;
}

export interface Booking {
  id: string;
  salonId: string;
  salonName: string;
  salonImage: string;
  services: string[];
  date: string;
  time: string;
  totalPrice: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  paymentMethod: string;
}

export interface ChatItem {
  id: string;
  salonName: string;
  salonImage: string;
  lastMessage: string;
  time: string;
  unread: number;
}

export interface CallItem {
  id: string;
  salonName: string;
  salonImage: string;
  type: 'incoming' | 'outgoing' | 'missed';
  date: string;
  duration: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'booking' | 'promo' | 'system';
  read: boolean;
}

export const categories = [
  { id: '1', name: 'Haircut', icon: 'content-cut' as const, iconSet: 'MaterialCommunityIcons' as const },
  { id: '2', name: 'Make Up', icon: 'brush' as const, iconSet: 'MaterialIcons' as const },
  { id: '3', name: 'Manicure', icon: 'hand-heart' as const, iconSet: 'MaterialCommunityIcons' as const },
  { id: '4', name: 'Massage', icon: 'spa' as const, iconSet: 'MaterialIcons' as const },
];

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

function makeServices(): Service[] {
  return [
    { id: 's1', name: 'Haircut', price: 30, duration: '30 min', image: serviceImages[0], category: 'Haircut' },
    { id: 's2', name: 'Hair Wash', price: 15, duration: '20 min', image: serviceImages[1], category: 'Haircut' },
    { id: 's3', name: 'Shaving', price: 20, duration: '20 min', image: serviceImages[0], category: 'Haircut' },
    { id: 's4', name: 'Hair Color', price: 80, duration: '90 min', image: serviceImages[1], category: 'Haircut' },
    { id: 's5', name: 'Facial', price: 45, duration: '45 min', image: serviceImages[2], category: 'Make Up' },
    { id: 's6', name: 'Makeup', price: 60, duration: '60 min', image: serviceImages[2], category: 'Make Up' },
    { id: 's7', name: 'Manicure', price: 25, duration: '30 min', image: serviceImages[3], category: 'Manicure' },
    { id: 's8', name: 'Pedicure', price: 30, duration: '40 min', image: serviceImages[3], category: 'Manicure' },
    { id: 's9', name: 'Body Massage', price: 70, duration: '60 min', image: serviceImages[2], category: 'Massage' },
    { id: 's10', name: 'Head Massage', price: 35, duration: '30 min', image: serviceImages[2], category: 'Massage' },
  ];
}

function makePackages(): Package[] {
  return [
    {
      id: 'p1', name: 'Basic Grooming', price: 55, originalPrice: 65,
      services: ['Haircut', 'Hair Wash', 'Shaving'], image: serviceImages[0],
    },
    {
      id: 'p2', name: 'Premium Package', price: 120, originalPrice: 155,
      services: ['Haircut', 'Hair Color', 'Facial', 'Head Massage'], image: serviceImages[1],
    },
    {
      id: 'p3', name: 'Full Body Care', price: 180, originalPrice: 225,
      services: ['Haircut', 'Facial', 'Manicure', 'Pedicure', 'Body Massage'], image: serviceImages[2],
    },
  ];
}

function makeReviews(): Review[] {
  return [
    { id: 'r1', userName: 'Sarah Johnson', userImage: reviewerImages[0], rating: 5, comment: 'Excellent service! The haircut was exactly what I wanted. Will definitely come back.', date: '2 days ago' },
    { id: 'r2', userName: 'Mike Davis', userImage: reviewerImages[1], rating: 4, comment: 'Great atmosphere and friendly staff. The massage was very relaxing.', date: '1 week ago' },
    { id: 'r3', userName: 'Emily Chen', userImage: reviewerImages[2], rating: 5, comment: 'Best salon in the area! Love the attention to detail and the clean environment.', date: '2 weeks ago' },
    { id: 'r4', userName: 'James Wilson', userImage: reviewerImages[3], rating: 4, comment: 'Good experience overall. A bit pricey but the quality makes up for it.', date: '3 weeks ago' },
  ];
}

function makeSpecialists(): Specialist[] {
  return [
    { id: 'sp1', name: 'James Rivera', role: 'Senior Barber', image: specialistImages[0], rating: 4.9 },
    { id: 'sp2', name: 'Lisa Park', role: 'Hair Stylist', image: specialistImages[1], rating: 4.8 },
    { id: 'sp3', name: 'Alex Morgan', role: 'Colorist', image: specialistImages[2], rating: 4.7 },
    { id: 'sp4', name: 'Emma Taylor', role: 'Makeup Artist', image: specialistImages[3], rating: 4.9 },
  ];
}

export const salons: Salon[] = [
  {
    id: '1', name: 'Belle Curls', image: salonImages[0],
    address: '6993 Meadow Valley Terrace', distance: '1.2 km',
    rating: 4.8, reviewCount: 4279, isOpen: true, openHours: '9:00 AM - 9:00 PM',
    phone: '+1 234 567 890', about: 'Belle Curls is a premium salon offering top-notch grooming services with a warm atmosphere and experienced professionals. Our team is dedicated to making you look and feel your best with personalized care.',
    website: 'www.bellecurls.com', latitude: 40.7128, longitude: -74.0060,
    services: makeServices(), packages: makePackages(), gallery: salonImages,
    reviews: makeReviews(), specialists: makeSpecialists(),
  },
  {
    id: '2', name: 'Pretty Parlour', image: salonImages[1],
    address: '2871 Heron Way', distance: '1.8 km',
    rating: 4.6, reviewCount: 3187, isOpen: true, openHours: '8:00 AM - 8:00 PM',
    phone: '+1 234 567 891', about: 'Pretty Parlour brings together style and comfort for an unforgettable beauty experience. Specializing in hair care and makeup artistry.',
    website: 'www.prettyparlour.com', latitude: 40.7200, longitude: -74.0100,
    services: makeServices(), packages: makePackages(), gallery: salonImages,
    reviews: makeReviews(), specialists: makeSpecialists(),
  },
  {
    id: '3', name: 'Clip & Trim', image: salonImages[2],
    address: '4598 Lincoln Drive', distance: '2.4 km',
    rating: 4.9, reviewCount: 5621, isOpen: false, openHours: '10:00 AM - 7:00 PM',
    phone: '+1 234 567 892', about: 'Clip & Trim is the go-to destination for precision cuts and classic barbering. Our master barbers deliver exceptional results every time.',
    website: 'www.clipandtrim.com', latitude: 40.7300, longitude: -74.0200,
    services: makeServices(), packages: makePackages(), gallery: salonImages,
    reviews: makeReviews(), specialists: makeSpecialists(),
  },
  {
    id: '4', name: 'Luxe Lounge', image: salonImages[3],
    address: '1256 Park Avenue', distance: '3.1 km',
    rating: 4.7, reviewCount: 2985, isOpen: true, openHours: '9:00 AM - 10:00 PM',
    phone: '+1 234 567 893', about: 'Luxe Lounge offers a luxury grooming experience with premium products and skilled stylists in an elegant setting.',
    website: 'www.luxelounge.com', latitude: 40.7400, longitude: -74.0300,
    services: makeServices(), packages: makePackages(), gallery: salonImages,
    reviews: makeReviews(), specialists: makeSpecialists(),
  },
  {
    id: '5', name: 'The Razor Edge', image: salonImages[4],
    address: '789 Broadway Blvd', distance: '4.0 km',
    rating: 4.5, reviewCount: 1856, isOpen: true, openHours: '8:30 AM - 8:30 PM',
    phone: '+1 234 567 894', about: 'The Razor Edge combines traditional barbering with modern techniques. We pride ourselves on clean fades, sharp lines, and attention to detail.',
    website: 'www.therazoredge.com', latitude: 40.7500, longitude: -74.0400,
    services: makeServices(), packages: makePackages(), gallery: salonImages,
    reviews: makeReviews(), specialists: makeSpecialists(),
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'b1', salonId: '1', salonName: 'Belle Curls', salonImage: salonImages[0],
    services: ['Haircut', 'Hair Wash'], date: 'Mar 15, 2026', time: '10:00 AM',
    totalPrice: 45, status: 'upcoming', paymentMethod: 'Apple Pay',
  },
  {
    id: 'b2', salonId: '2', salonName: 'Pretty Parlour', salonImage: salonImages[1],
    services: ['Facial', 'Makeup'], date: 'Mar 20, 2026', time: '2:00 PM',
    totalPrice: 105, status: 'upcoming', paymentMethod: 'Credit Card',
  },
  {
    id: 'b3', salonId: '3', salonName: 'Clip & Trim', salonImage: salonImages[2],
    services: ['Haircut', 'Shaving'], date: 'Feb 10, 2026', time: '11:00 AM',
    totalPrice: 50, status: 'completed', paymentMethod: 'Google Pay',
  },
  {
    id: 'b4', salonId: '4', salonName: 'Luxe Lounge', salonImage: salonImages[3],
    services: ['Body Massage'], date: 'Jan 28, 2026', time: '3:00 PM',
    totalPrice: 70, status: 'completed', paymentMethod: 'Credit Card',
  },
  {
    id: 'b5', salonId: '5', salonName: 'The Razor Edge', salonImage: salonImages[4],
    services: ['Haircut'], date: 'Jan 15, 2026', time: '9:00 AM',
    totalPrice: 30, status: 'cancelled', paymentMethod: 'Apple Pay',
  },
];

export const mockChats: ChatItem[] = [
  { id: 'c1', salonName: 'Belle Curls', salonImage: salonImages[0], lastMessage: 'Your appointment is confirmed for tomorrow!', time: '2m ago', unread: 2 },
  { id: 'c2', salonName: 'Pretty Parlour', salonImage: salonImages[1], lastMessage: 'Thank you for choosing us!', time: '1h ago', unread: 0 },
  { id: 'c3', salonName: 'Clip & Trim', salonImage: salonImages[2], lastMessage: 'We have a special offer this weekend.', time: '3h ago', unread: 1 },
  { id: 'c4', salonName: 'Luxe Lounge', salonImage: salonImages[3], lastMessage: 'See you next week!', time: 'Yesterday', unread: 0 },
];

export const mockCalls: CallItem[] = [
  { id: 'cl1', salonName: 'Belle Curls', salonImage: salonImages[0], type: 'incoming', date: 'Today, 10:30 AM', duration: '5 min' },
  { id: 'cl2', salonName: 'Pretty Parlour', salonImage: salonImages[1], type: 'outgoing', date: 'Today, 9:15 AM', duration: '3 min' },
  { id: 'cl3', salonName: 'Clip & Trim', salonImage: salonImages[2], type: 'missed', date: 'Yesterday, 4:20 PM', duration: '' },
  { id: 'cl4', salonName: 'Luxe Lounge', salonImage: salonImages[3], type: 'incoming', date: 'Yesterday, 11:00 AM', duration: '8 min' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', title: 'Booking Confirmed', message: 'Your appointment at Belle Curls on Mar 15 is confirmed.', time: '2 min ago', type: 'booking', read: false },
  { id: 'n2', title: '30% Off Weekend Special', message: 'Get 30% off all services this weekend at Pretty Parlour!', time: '1 hour ago', type: 'promo', read: false },
  { id: 'n3', title: 'Rate Your Visit', message: 'How was your experience at Clip & Trim? Leave a review!', time: '2 hours ago', type: 'system', read: true },
  { id: 'n4', title: 'New Service Available', message: 'Luxe Lounge now offers aromatherapy massages!', time: 'Yesterday', type: 'promo', read: true },
  { id: 'n5', title: 'Payment Received', message: 'Payment of $50.00 received for your booking at Clip & Trim.', time: '2 days ago', type: 'booking', read: true },
];

export const onboardingSlides = [
  {
    id: '1',
    title: 'The Best Barbers &\nSalons at Your\nFingertips',
    subtitle: 'Discover top-rated barbers and salons near you with just a few taps.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=500&fit=crop',
  },
  {
    id: '2',
    title: 'Book Your\nAppointment\nAnytime, Anywhere',
    subtitle: 'Schedule your next grooming session instantly and hassle-free.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=500&fit=crop',
  },
  {
    id: '3',
    title: 'Get the Perfect\nLook You\nDeserve',
    subtitle: 'Choose from a variety of services and find the perfect style for you.',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=500&fit=crop',
  },
];

export const paymentMethods = [
  { id: 'pm1', name: 'Apple Pay', icon: 'logo-apple' as const, iconSet: 'Ionicons' as const },
  { id: 'pm2', name: 'Google Pay', icon: 'logo-google' as const, iconSet: 'Ionicons' as const },
  { id: 'pm3', name: 'Credit Card', icon: 'card' as const, iconSet: 'Ionicons' as const },
  { id: 'pm4', name: 'PayPal', icon: 'logo-paypal' as const, iconSet: 'Ionicons' as const },
];

export const languages = [
  { id: 'en', name: 'English (US)', selected: true },
  { id: 'es', name: 'Spanish', selected: false },
  { id: 'fr', name: 'French', selected: false },
  { id: 'de', name: 'German', selected: false },
  { id: 'ja', name: 'Japanese', selected: false },
  { id: 'ko', name: 'Korean', selected: false },
  { id: 'zh', name: 'Chinese', selected: false },
  { id: 'ar', name: 'Arabic', selected: false },
];
