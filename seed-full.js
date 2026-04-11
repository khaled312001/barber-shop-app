#!/usr/bin/env node
/**
 * Full seed script - creates accounts for every role + comprehensive dummy data
 * Run on server: node seed-full.js
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const DB = {
  host: '127.0.0.1',
  user: 'u492425110_barber',
  password: 'K68$~Tf6=',
  database: 'u492425110_barber',
};

function uuid() { return crypto.randomUUID(); }

async function main() {
  const conn = await mysql.createConnection(DB);
  console.log('Connected to MySQL');

  // Clear all existing data (order matters for FK-like logic)
  const tables = [
    'loyalty_transactions','customer_notes','tips','inventory','coupons',
    'notifications','messages','bookmarks','bookings','reviews','specialists',
    'packages','services','shifts','expenses','commissions','activity_logs',
    'license_activations','license_keys','subscriptions','plans','salon_staff',
    'app_settings','salons','users'
  ];
  for (const t of tables) {
    await conn.execute(`DELETE FROM \`${t}\``);
  }
  console.log('Cleared all tables');

  // ========== USERS ==========
  const pw = await bcrypt.hash('123456', 10);

  const superAdminId = uuid();
  const adminId = uuid();
  const salonAdmin1Id = uuid();
  const salonAdmin2Id = uuid();
  const staff1Id = uuid();
  const staff2Id = uuid();
  const staff3Id = uuid();
  const staff4Id = uuid();
  const user1Id = uuid();
  const user2Id = uuid();
  const user3Id = uuid();
  const user4Id = uuid();
  const user5Id = uuid();

  const usersData = [
    [superAdminId, 'خالد المدير العام', 'superadmin@casca.com', pw, '+201000000001', '', 'خالد', 'male', '1985-03-15', 'super_admin', 0],
    [adminId, 'أحمد المشرف', 'admin@casca.com', pw, '+201000000002', '', 'أحمد', 'male', '1988-07-22', 'admin', 0],
    [salonAdmin1Id, 'محمد صاحب الصالون', 'salon1@casca.com', pw, '+201000000003', '', 'محمد', 'male', '1990-01-10', 'salon_admin', 0],
    [salonAdmin2Id, 'فاطمة صاحبة الصالون', 'salon2@casca.com', pw, '+201000000004', '', 'فاطمة', 'female', '1992-05-18', 'salon_admin', 0],
    [staff1Id, 'علي الحلاق', 'staff1@casca.com', pw, '+201000000005', '', 'علي', 'male', '1995-11-03', 'staff', 0],
    [staff2Id, 'حسن المصفف', 'staff2@casca.com', pw, '+201000000006', '', 'حسن', 'male', '1993-08-25', 'staff', 0],
    [staff3Id, 'سارة المتخصصة', 'staff3@casca.com', pw, '+201000000007', '', 'سارة', 'female', '1996-02-14', 'staff', 0],
    [staff4Id, 'ياسمين الخبيرة', 'staff4@casca.com', pw, '+201000000008', '', 'ياسمين', 'female', '1994-09-30', 'staff', 0],
    [user1Id, 'عمر العميل', 'user1@casca.com', pw, '+201000000009', '', 'عمر', 'male', '1998-04-12', 'user', 150],
    [user2Id, 'يوسف الزبون', 'user2@casca.com', pw, '+201000000010', '', 'يوسف', 'male', '1997-06-08', 'user', 230],
    [user3Id, 'نورة العميلة', 'user3@casca.com', pw, '+201000000011', '', 'نورة', 'female', '1999-12-20', 'user', 80],
    [user4Id, 'ليلى الزبونة', 'user4@casca.com', pw, '+201000000012', '', 'ليلى', 'female', '2000-03-05', 'user', 310],
    [user5Id, 'كريم المستخدم', 'user5@casca.com', pw, '+201000000013', '', 'كريم', 'male', '1996-10-17', 'user', 45],
  ];

  for (const u of usersData) {
    await conn.execute(
      'INSERT INTO users (id, full_name, email, password, phone, avatar, nickname, gender, dob, role, loyalty_points) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      u
    );
  }
  console.log(`Created ${usersData.length} users`);

  // ========== SALONS ==========
  const salon1Id = uuid();
  const salon2Id = uuid();
  const salon3Id = uuid();
  const salon4Id = uuid();

  const salonsData = [
    [salon1Id, 'Casca Barber Shop', 'https://images.unsplash.com/photo-1585747860019-8e7e18da7a7c?w=800&h=600&fit=crop',
     'شارع التحرير، وسط البلد، القاهرة', '1.2 km', 4.8, 342, true, '9:00 AM - 11:00 PM', '+201100000001',
     'صالون كاسكا هو وجهتك المثالية للعناية بالشعر واللحية. نقدم خدمات احترافية مع أحدث صيحات الموضة في أجواء فاخرة.',
     'https://casca-barber.com', 30.0444, 31.2357,
     JSON.stringify(['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800','https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800','https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800']),
     'active', salonAdmin1Id, true, 'casca-barber', 1250, 'dark', '#F4A460', ''],
    [salon2Id, 'Glamour Ladies Salon', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop',
     'شارع المعز، الحسين، القاهرة', '2.5 km', 4.6, 218, true, '10:00 AM - 9:00 PM', '+201100000002',
     'صالون جلامور للسيدات يقدم أرقى خدمات التجميل والعناية بالبشرة والشعر مع فريق من المتخصصات المحترفات.',
     'https://glamour-salon.com', 30.0500, 31.2615,
     JSON.stringify(['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800','https://images.unsplash.com/photo-1633681122657-1b3b9e604e0e?w=800']),
     'active', salonAdmin2Id, true, 'glamour-ladies', 890, 'light', '#E91E63', ''],
    [salon3Id, 'Royal Cuts', 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=600&fit=crop',
     'شارع فيصل، الجيزة', '4.1 km', 4.3, 156, true, '8:00 AM - 10:00 PM', '+201100000003',
     'رويال كتس - صالون الرجال العصري. قصات شعر كلاسيكية وحديثة مع خدمة لحية متميزة.',
     '', 30.0131, 31.2089, JSON.stringify([]), 'active', '', false, '', 0, 'dark', '#4CAF50', ''],
    [salon4Id, 'Beauty Palace', 'https://images.unsplash.com/photo-1633681122657-1b3b9e604e0e?w=800&h=600&fit=crop',
     'مدينة نصر، القاهرة', '3.7 km', 4.5, 189, false, '9:00 AM - 8:00 PM', '+201100000004',
     'قصر الجمال - صالون متكامل للرجال والسيدات. خدمات تجميل شاملة بأعلى جودة.',
     '', 30.0626, 31.3400, JSON.stringify([]), 'suspended', '', false, '', 0, 'dark', '#9C27B0', ''],
  ];

  for (const s of salonsData) {
    await conn.execute(
      `INSERT INTO salons (id, name, image, address, distance, rating, review_count, is_open, open_hours, phone,
       \`about\`, website, latitude, longitude, gallery, status, owner_id, landing_enabled, landing_slug, landing_views,
       landing_theme, landing_accent_color, landing_booking_url)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, s
    );
  }
  console.log(`Created ${salonsData.length} salons`);

  // ========== SALON STAFF ==========
  const salonStaffData = [
    [uuid(), salonAdmin1Id, salon1Id, 'salon_admin'],
    [uuid(), staff1Id, salon1Id, 'staff'],
    [uuid(), staff2Id, salon1Id, 'staff'],
    [uuid(), salonAdmin2Id, salon2Id, 'salon_admin'],
    [uuid(), staff3Id, salon2Id, 'staff'],
    [uuid(), staff4Id, salon2Id, 'staff'],
  ];
  for (const ss of salonStaffData) {
    await conn.execute('INSERT INTO salon_staff (id, user_id, salon_id, role) VALUES (?,?,?,?)', ss);
  }
  console.log(`Created ${salonStaffData.length} salon_staff entries`);

  // ========== PLANS ==========
  const plan1Id = uuid();
  const plan2Id = uuid();
  const plan3Id = uuid();

  const plansData = [
    [plan1Id, 'Basic', 99, 'monthly', JSON.stringify(['حتى 50 حجز شهرياً','2 موظفين','دعم بالإيميل']), 10, 50, 2, true],
    [plan2Id, 'Pro', 249, 'monthly', JSON.stringify(['حجوزات غير محدودة','10 موظفين','دعم أولوية','تقارير متقدمة','صفحة هبوط']), 5, 0, 10, true],
    [plan3Id, 'Enterprise', 499, 'monthly', JSON.stringify(['كل مميزات Pro','موظفين غير محدودين','مدير حساب مخصص','API كامل','تدريب الفريق']), 3, 0, 0, true],
  ];
  for (const p of plansData) {
    await conn.execute('INSERT INTO plans (id, name, price, billing_cycle, features, commission_rate, max_bookings, max_staff, is_active) VALUES (?,?,?,?,?,?,?,?,?)', p);
  }
  console.log(`Created ${plansData.length} plans`);

  // ========== SUBSCRIPTIONS ==========
  const sub1Id = uuid();
  const sub2Id = uuid();
  const subsData = [
    [sub1Id, salon1Id, plan2Id, 'active', '2026-01-01', '2026-12-31'],
    [sub2Id, salon2Id, plan1Id, 'active', '2026-03-01', '2026-09-01'],
  ];
  for (const s of subsData) {
    await conn.execute('INSERT INTO subscriptions (id, salon_id, plan_id, status, start_date, end_date) VALUES (?,?,?,?,?,?)', s);
  }
  console.log(`Created ${subsData.length} subscriptions`);

  // ========== LICENSE KEYS ==========
  const lk1Id = uuid();
  const lk2Id = uuid();
  const lk3Id = uuid();
  const lkData = [
    [lk1Id, 'CASCA-PRO-2026-XXAA', salon1Id, plan2Id, 'active', '2026-12-31', 3, 1],
    [lk2Id, 'CASCA-BASIC-2026-YYZZ', salon2Id, plan1Id, 'active', '2026-09-01', 2, 1],
    [lk3Id, 'CASCA-ENT-2026-FREE', '', plan3Id, 'unused', '2027-01-01', 5, 0],
  ];
  for (const l of lkData) {
    await conn.execute('INSERT INTO license_keys (id, `key`, salon_id, plan_id, status, expires_at, max_activations, activation_count) VALUES (?,?,?,?,?,?,?,?)', l);
  }
  console.log(`Created ${lkData.length} license_keys`);

  // ========== LICENSE ACTIVATIONS ==========
  const laData = [
    [uuid(), lk1Id, 'device-iphone-14-pro-max', 'salon1@casca.com'],
    [uuid(), lk2Id, 'device-samsung-s24-ultra', 'salon2@casca.com'],
  ];
  for (const la of laData) {
    await conn.execute('INSERT INTO license_activations (id, license_key_id, device_id, email) VALUES (?,?,?,?)', la);
  }
  console.log(`Created ${laData.length} license_activations`);

  // ========== SERVICES ==========
  const svc = [];
  // Salon 1 services
  const s1Services = [
    [uuid(), salon1Id, 'قص شعر كلاسيك', 50, '30 min', 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400', 'قص شعر'],
    [uuid(), salon1Id, 'قص شعر فرنسي', 80, '45 min', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400', 'قص شعر'],
    [uuid(), salon1Id, 'حلاقة لحية', 40, '20 min', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400', 'لحية'],
    [uuid(), salon1Id, 'تشكيل لحية ديزاين', 70, '35 min', '', 'لحية'],
    [uuid(), salon1Id, 'صبغة شعر', 120, '60 min', 'https://images.unsplash.com/photo-1562004760-aceed7bb0fe3?w=400', 'صبغة'],
    [uuid(), salon1Id, 'علاج كيراتين', 250, '90 min', '', 'علاج'],
    [uuid(), salon1Id, 'غسيل + سشوار', 35, '20 min', '', 'غسيل'],
    [uuid(), salon1Id, 'ماسك شعر بروتين', 150, '45 min', '', 'علاج'],
    [uuid(), salon1Id, 'تنظيف بشرة', 100, '40 min', '', 'بشرة'],
    [uuid(), salon1Id, 'مساج رأس', 60, '25 min', '', 'مساج'],
  ];
  // Salon 2 services
  const s2Services = [
    [uuid(), salon2Id, 'قص شعر سيدات', 100, '45 min', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400', 'قص شعر'],
    [uuid(), salon2Id, 'صبغة شعر كاملة', 200, '90 min', '', 'صبغة'],
    [uuid(), salon2Id, 'هايلايت', 180, '75 min', '', 'صبغة'],
    [uuid(), salon2Id, 'سشوار + تسريحة', 80, '40 min', '', 'تصفيف'],
    [uuid(), salon2Id, 'مكياج سهرة', 250, '60 min', '', 'مكياج'],
    [uuid(), salon2Id, 'مكياج عروس', 500, '120 min', '', 'مكياج'],
    [uuid(), salon2Id, 'تنظيف بشرة عميق', 150, '50 min', '', 'بشرة'],
    [uuid(), salon2Id, 'مانيكير', 70, '30 min', '', 'أظافر'],
    [uuid(), salon2Id, 'بديكير', 80, '35 min', '', 'أظافر'],
    [uuid(), salon2Id, 'إزالة شعر بالشمع', 120, '40 min', '', 'إزالة شعر'],
  ];
  // Salon 3 services
  const s3Services = [
    [uuid(), salon3Id, 'قص شعر', 40, '25 min', '', 'قص شعر'],
    [uuid(), salon3Id, 'حلاقة ذقن', 30, '15 min', '', 'لحية'],
    [uuid(), salon3Id, 'قص + حلاقة', 60, '40 min', '', 'كومبو'],
    [uuid(), salon3Id, 'صبغة رجالي', 90, '50 min', '', 'صبغة'],
    [uuid(), salon3Id, 'غسيل شعر', 20, '15 min', '', 'غسيل'],
  ];

  const allServices = [...s1Services, ...s2Services, ...s3Services];
  for (const sv of allServices) {
    await conn.execute('INSERT INTO services (id, salon_id, name, price, duration, image, category) VALUES (?,?,?,?,?,?,?)', sv);
  }
  console.log(`Created ${allServices.length} services`);

  // ========== PACKAGES ==========
  const pkgData = [
    [uuid(), salon1Id, 'باكج العريس', 200, 300, JSON.stringify(['قص شعر فرنسي','تشكيل لحية ديزاين','تنظيف بشرة','مساج رأس']), 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400'],
    [uuid(), salon1Id, 'باكج VIP', 350, 500, JSON.stringify(['قص شعر فرنسي','حلاقة لحية','صبغة شعر','علاج كيراتين','مساج رأس']), ''],
    [uuid(), salon1Id, 'باكج سريع', 80, 120, JSON.stringify(['قص شعر كلاسيك','غسيل + سشوار']), ''],
    [uuid(), salon2Id, 'باكج العروس الذهبي', 900, 1300, JSON.stringify(['مكياج عروس','سشوار + تسريحة','مانيكير','بديكير','تنظيف بشرة عميق']), ''],
    [uuid(), salon2Id, 'باكج السهرة', 350, 500, JSON.stringify(['مكياج سهرة','سشوار + تسريحة','مانيكير']), ''],
    [uuid(), salon3Id, 'باكج الرجل الأنيق', 100, 150, JSON.stringify(['قص + حلاقة','غسيل شعر']), ''],
  ];
  for (const p of pkgData) {
    await conn.execute('INSERT INTO packages (id, salon_id, name, price, original_price, services, image) VALUES (?,?,?,?,?,?,?)', p);
  }
  console.log(`Created ${pkgData.length} packages`);

  // ========== SPECIALISTS ==========
  const spec1Id = uuid();
  const spec2Id = uuid();
  const spec3Id = uuid();
  const spec4Id = uuid();
  const specData = [
    [spec1Id, salon1Id, 'علي الحلاق', 'حلاق رئيسي', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 4.9],
    [spec2Id, salon1Id, 'حسن المصفف', 'مصفف شعر', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 4.7],
    [uuid(), salon1Id, 'كريم المتخصص', 'خبير صبغات', '', 4.5],
    [spec3Id, salon2Id, 'سارة المتخصصة', 'خبيرة تجميل', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 4.8],
    [spec4Id, salon2Id, 'ياسمين الخبيرة', 'مصففة شعر', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 4.6],
    [uuid(), salon3Id, 'أحمد الحلاق', 'حلاق', '', 4.4],
    [uuid(), salon3Id, 'محمود', 'حلاق مبتدئ', '', 4.0],
  ];
  for (const sp of specData) {
    await conn.execute('INSERT INTO specialists (id, salon_id, name, role, image, rating) VALUES (?,?,?,?,?,?)', sp);
  }
  console.log(`Created ${specData.length} specialists`);

  // ========== REVIEWS ==========
  const reviewsData = [
    [uuid(), salon1Id, user1Id, 'عمر العميل', '', 5, 'صالون ممتاز! قص الشعر كان رائع والجو مريح جداً. أنصح الجميع بزيارته.', '2026-03-15'],
    [uuid(), salon1Id, user2Id, 'يوسف الزبون', '', 4, 'خدمة جيدة جداً، الأسعار معقولة. لكن أحياناً الانتظار طويل.', '2026-03-20'],
    [uuid(), salon1Id, user5Id, 'كريم المستخدم', '', 5, 'أفضل حلاق في المنطقة! علي يد ذهبية ماشاء الله.', '2026-04-01'],
    [uuid(), salon1Id, user3Id, 'نورة العميلة', '', 4, 'المكان نظيف ومرتب. خدمة تنظيف البشرة كانت ممتازة.', '2026-04-05'],
    [uuid(), salon2Id, user3Id, 'نورة العميلة', '', 5, 'صالون رائع للسيدات! سارة شغلها تحفة بجد.', '2026-03-10'],
    [uuid(), salon2Id, user4Id, 'ليلى الزبونة', '', 5, 'عملتلي مكياج عروس خيالي! كل الناس مدحت. شكراً جلامور ❤️', '2026-03-25'],
    [uuid(), salon2Id, user4Id, 'ليلى الزبونة', '', 4, 'المانيكير والبديكير كانوا ممتازين. بس المكان كان مزحوم شوية.', '2026-04-02'],
    [uuid(), salon3Id, user1Id, 'عمر العميل', '', 3, 'صالون عادي، الخدمة مقبولة بس مش مميزة.', '2026-04-08'],
    [uuid(), salon3Id, user2Id, 'يوسف الزبون', '', 4, 'أسعار ممتازة وقص شعر محترم. يستاهل الزيارة.', '2026-04-10'],
    [uuid(), salon3Id, user5Id, 'كريم المستخدم', '', 4, 'سريعين ومحترفين. بحب الباكج بتاع قص + حلاقة.', '2026-03-28'],
  ];
  for (const r of reviewsData) {
    await conn.execute('INSERT INTO reviews (id, salon_id, user_id, user_name, user_image, rating, comment, date) VALUES (?,?,?,?,?,?,?,?)', r);
  }
  console.log(`Created ${reviewsData.length} reviews`);

  // ========== BOOKINGS ==========
  const booking1Id = uuid();
  const booking2Id = uuid();
  const booking3Id = uuid();
  const booking4Id = uuid();
  const booking5Id = uuid();
  const booking6Id = uuid();
  const booking7Id = uuid();
  const booking8Id = uuid();
  const booking9Id = uuid();
  const booking10Id = uuid();

  const bookingsData = [
    [booking1Id, user1Id, salon1Id, 'Casca Barber Shop', '', JSON.stringify(['قص شعر فرنسي','حلاقة لحية']), '2026-04-15', '10:00 AM', 120, 'completed', 'cash', spec1Id],
    [booking2Id, user2Id, salon1Id, 'Casca Barber Shop', '', JSON.stringify(['باكج العريس']), '2026-04-18', '2:00 PM', 200, 'completed', 'visa', spec2Id],
    [booking3Id, user5Id, salon1Id, 'Casca Barber Shop', '', JSON.stringify(['قص شعر كلاسيك','مساج رأس']), '2026-04-20', '11:30 AM', 110, 'upcoming', 'cash', spec1Id],
    [booking4Id, user1Id, salon1Id, 'Casca Barber Shop', '', JSON.stringify(['صبغة شعر','علاج كيراتين']), '2026-04-22', '3:00 PM', 370, 'upcoming', 'visa', ''],
    [booking5Id, user3Id, salon2Id, 'Glamour Ladies Salon', '', JSON.stringify(['قص شعر سيدات','سشوار + تسريحة']), '2026-04-12', '1:00 PM', 180, 'completed', 'cash', spec3Id],
    [booking6Id, user4Id, salon2Id, 'Glamour Ladies Salon', '', JSON.stringify(['باكج العروس الذهبي']), '2026-04-25', '9:00 AM', 900, 'upcoming', 'visa', spec3Id],
    [booking7Id, user4Id, salon2Id, 'Glamour Ladies Salon', '', JSON.stringify(['مانيكير','بديكير']), '2026-04-10', '4:00 PM', 150, 'completed', 'cash', spec4Id],
    [booking8Id, user3Id, salon2Id, 'Glamour Ladies Salon', '', JSON.stringify(['تنظيف بشرة عميق']), '2026-04-28', '12:00 PM', 150, 'upcoming', 'visa', spec4Id],
    [booking9Id, user1Id, salon3Id, 'Royal Cuts', '', JSON.stringify(['قص + حلاقة']), '2026-04-08', '5:00 PM', 60, 'completed', 'cash', ''],
    [booking10Id, user2Id, salon3Id, 'Royal Cuts', '', JSON.stringify(['صبغة رجالي','غسيل شعر']), '2026-04-30', '10:00 AM', 110, 'upcoming', 'cash', ''],
    [uuid(), user5Id, salon1Id, 'Casca Barber Shop', '', JSON.stringify(['قص شعر كلاسيك']), '2026-03-15', '9:00 AM', 50, 'completed', 'cash', spec1Id],
    [uuid(), user2Id, salon1Id, 'Casca Barber Shop', '', JSON.stringify(['حلاقة لحية']), '2026-03-20', '4:00 PM', 40, 'completed', 'visa', spec2Id],
    [uuid(), user1Id, salon2Id, 'Glamour Ladies Salon', '', JSON.stringify(['تنظيف بشرة عميق']), '2026-03-18', '11:00 AM', 150, 'cancelled', 'cash', spec3Id],
    [uuid(), user4Id, salon3Id, 'Royal Cuts', '', JSON.stringify(['قص شعر','حلاقة ذقن']), '2026-03-25', '2:30 PM', 70, 'completed', 'cash', ''],
    [uuid(), user3Id, salon1Id, 'Casca Barber Shop', '', JSON.stringify(['تنظيف بشرة','مساج رأس']), '2026-04-05', '1:00 PM', 160, 'completed', 'visa', spec1Id],
  ];
  for (const b of bookingsData) {
    await conn.execute(
      'INSERT INTO bookings (id, user_id, salon_id, salon_name, salon_image, services_list, date, time, total_price, status, payment_method, specialist_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', b
    );
  }
  console.log(`Created ${bookingsData.length} bookings`);

  // ========== COMMISSIONS ==========
  const completedBookings = [
    [booking1Id, salon1Id, 120], [booking2Id, salon1Id, 200], [booking5Id, salon2Id, 180],
    [booking7Id, salon2Id, 150], [booking9Id, salon3Id, 60],
  ];
  for (const [bId, sId, amount] of completedBookings) {
    const rate = sId === salon1Id ? 5 : 10;
    const commission = (amount * rate) / 100;
    await conn.execute('INSERT INTO commissions (id, booking_id, salon_id, amount, rate, status) VALUES (?,?,?,?,?,?)',
      [uuid(), bId, sId, commission, rate, 'pending']);
  }
  console.log(`Created ${completedBookings.length} commissions`);

  // ========== EXPENSES ==========
  const expensesData = [
    [uuid(), salon1Id, 'إيجار الشهر - أبريل', 5000, 'rent', '2026-04-01'],
    [uuid(), salon1Id, 'فاتورة كهرباء', 800, 'utilities', '2026-04-05'],
    [uuid(), salon1Id, 'مستلزمات حلاقة (شفرات، كريمات)', 1200, 'supplies', '2026-04-03'],
    [uuid(), salon1Id, 'راتب علي', 4000, 'salaries', '2026-04-01'],
    [uuid(), salon1Id, 'راتب حسن', 3500, 'salaries', '2026-04-01'],
    [uuid(), salon1Id, 'صيانة كرسي حلاقة', 500, 'general', '2026-04-10'],
    [uuid(), salon2Id, 'إيجار الشهر - أبريل', 7000, 'rent', '2026-04-01'],
    [uuid(), salon2Id, 'فاتورة كهرباء ومياه', 1100, 'utilities', '2026-04-05'],
    [uuid(), salon2Id, 'مستحضرات تجميل', 3000, 'supplies', '2026-04-02'],
    [uuid(), salon2Id, 'راتب سارة', 4500, 'salaries', '2026-04-01'],
    [uuid(), salon2Id, 'راتب ياسمين', 4000, 'salaries', '2026-04-01'],
    [uuid(), salon2Id, 'ديكور جديد للاستقبال', 2500, 'general', '2026-04-08'],
    [uuid(), salon3Id, 'إيجار', 3000, 'rent', '2026-04-01'],
    [uuid(), salon3Id, 'كهرباء', 500, 'utilities', '2026-04-05'],
    [uuid(), salon3Id, 'أدوات حلاقة', 600, 'supplies', '2026-04-07'],
  ];
  for (const e of expensesData) {
    await conn.execute('INSERT INTO expenses (id, salon_id, description, amount, category, date) VALUES (?,?,?,?,?,?)', e);
  }
  console.log(`Created ${expensesData.length} expenses`);

  // ========== SHIFTS ==========
  const shiftsData = [];
  // Staff 1 & 2 at salon 1 (Sun-Thu)
  for (let day = 0; day <= 4; day++) {
    shiftsData.push([uuid(), salon1Id, staff1Id, day, '09:00', '17:00']);
    shiftsData.push([uuid(), salon1Id, staff2Id, day, '13:00', '21:00']);
  }
  // Staff 3 & 4 at salon 2 (Sun-Thu)
  for (let day = 0; day <= 4; day++) {
    shiftsData.push([uuid(), salon2Id, staff3Id, day, '10:00', '18:00']);
    shiftsData.push([uuid(), salon2Id, staff4Id, day, '12:00', '20:00']);
  }
  // Weekend shifts
  shiftsData.push([uuid(), salon1Id, staff1Id, 5, '10:00', '16:00']);
  shiftsData.push([uuid(), salon2Id, staff3Id, 5, '10:00', '16:00']);

  for (const sh of shiftsData) {
    await conn.execute('INSERT INTO shifts (id, salon_id, staff_id, day_of_week, start_time, end_time) VALUES (?,?,?,?,?,?)', sh);
  }
  console.log(`Created ${shiftsData.length} shifts`);

  // ========== BOOKMARKS ==========
  const bmData = [
    [uuid(), user1Id, salon1Id], [uuid(), user1Id, salon2Id],
    [uuid(), user2Id, salon1Id], [uuid(), user3Id, salon2Id],
    [uuid(), user4Id, salon2Id], [uuid(), user4Id, salon1Id],
    [uuid(), user5Id, salon3Id], [uuid(), user5Id, salon1Id],
  ];
  for (const bm of bmData) {
    await conn.execute('INSERT INTO bookmarks (id, user_id, salon_id) VALUES (?,?,?)', bm);
  }
  console.log(`Created ${bmData.length} bookmarks`);

  // ========== MESSAGES ==========
  const msgsData = [
    [uuid(), user1Id, salon1Id, 'Casca Barber Shop', '', 'مرحباً عمر! حجزك يوم الثلاثاء الساعة 10 صباحاً مؤكد. نراك قريباً!', 'salon'],
    [uuid(), user1Id, salon1Id, 'Casca Barber Shop', '', 'شكراً! هل ممكن أغير الموعد للساعة 11؟', 'user'],
    [uuid(), user1Id, salon1Id, 'Casca Barber Shop', '', 'طبعاً، تم تغيير الموعد. تفضل في أي وقت يناسبك.', 'salon'],
    [uuid(), user2Id, salon1Id, 'Casca Barber Shop', '', 'مرحباً يوسف! عندنا عرض خاص هذا الأسبوع: خصم 20% على باكج العريس!', 'salon'],
    [uuid(), user2Id, salon1Id, 'Casca Barber Shop', '', 'ممتاز! أريد أحجز يوم الخميس لو سمحت.', 'user'],
    [uuid(), user3Id, salon2Id, 'Glamour Ladies Salon', '', 'مرحباً نورة! شكراً لزيارتك. نتمنى إن الخدمة عجبتك 💕', 'salon'],
    [uuid(), user3Id, salon2Id, 'Glamour Ladies Salon', '', 'كانت ممتازة! بس حابة أسأل عن أسعار الهايلايت؟', 'user'],
    [uuid(), user3Id, salon2Id, 'Glamour Ladies Salon', '', 'الهايلايت يبدأ من 180 جنيه. ممكن نحددلك موعد استشارة مجانية!', 'salon'],
    [uuid(), user4Id, salon2Id, 'Glamour Ladies Salon', '', 'أهلاً ليلى! تذكير: موعد مكياج العروس يوم 25 أبريل الساعة 9 صباحاً.', 'salon'],
    [uuid(), user4Id, salon2Id, 'Glamour Ladies Salon', '', 'تمام جداً! أنا متحمسة جداً 😍', 'user'],
  ];
  for (const m of msgsData) {
    await conn.execute('INSERT INTO messages (id, user_id, salon_id, salon_name, salon_image, content, sender) VALUES (?,?,?,?,?,?,?)', m);
  }
  console.log(`Created ${msgsData.length} messages`);

  // ========== NOTIFICATIONS ==========
  const notifsData = [
    [uuid(), user1Id, 'تأكيد الحجز', 'تم تأكيد حجزك في Casca Barber Shop يوم 15 أبريل الساعة 10:00 صباحاً', 'booking', false],
    [uuid(), user1Id, 'تذكير بالموعد', 'تذكير: موعدك غداً في Casca Barber Shop الساعة 10:00 صباحاً', 'reminder', true],
    [uuid(), user2Id, 'عرض خاص! 🎉', 'خصم 20% على باكج العريس في Casca Barber Shop لفترة محدودة!', 'promo', false],
    [uuid(), user2Id, 'تم إكمال الحجز', 'شكراً لزيارتك! نتمنى إن الخدمة عجبتك. قيّم تجربتك الآن.', 'booking', true],
    [uuid(), user3Id, 'مرحباً بك!', 'أهلاً وسهلاً نورة! اكتشفي أقرب الصالونات وأحجزي موعدك الأول.', 'system', true],
    [uuid(), user3Id, 'حجز مؤكد', 'حجزك في Glamour Ladies Salon يوم 28 أبريل تم تأكيده ✓', 'booking', false],
    [uuid(), user4Id, 'تهانينا! 🎊', 'مبروك! حصلتي على 50 نقطة ولاء إضافية.', 'loyalty', false],
    [uuid(), user4Id, 'تذكير مهم', 'لا تنسي موعد مكياج العروس يوم 25 أبريل!', 'reminder', false],
    [uuid(), user5Id, 'حجز جديد', 'تم حجز موعد قص شعر في Casca Barber Shop', 'booking', false],
    [uuid(), salonAdmin1Id, 'حجز جديد وارد', 'حجز جديد من عمر العميل - قص شعر فرنسي + حلاقة لحية', 'booking', false],
    [uuid(), salonAdmin1Id, 'تقييم جديد', 'حصلت على تقييم 5 نجوم من كريم المستخدم! ⭐', 'review', false],
    [uuid(), salonAdmin2Id, 'تقييم جديد', 'حصلتِ على تقييم 5 نجوم من ليلى الزبونة! ⭐', 'review', true],
  ];
  for (const n of notifsData) {
    await conn.execute('INSERT INTO notifications (id, user_id, title, message, type, `read`) VALUES (?,?,?,?,?,?)', n);
  }
  console.log(`Created ${notifsData.length} notifications`);

  // ========== COUPONS ==========
  const couponsData = [
    [uuid(), 'WELCOME20', 20, 'percentage', '2026-06-30', 100, 15, true],
    [uuid(), 'SUMMER50', 50, 'fixed', '2026-08-31', 50, 3, true],
    [uuid(), 'VIP10', 10, 'percentage', '2026-12-31', 0, 28, true],
    [uuid(), 'BRIDE100', 100, 'fixed', '2026-05-31', 20, 5, true],
    [uuid(), 'EXPIRED2025', 30, 'percentage', '2025-12-31', 100, 45, false],
  ];
  for (const c of couponsData) {
    await conn.execute('INSERT INTO coupons (id, code, discount, type, expiry_date, usage_limit, used_count, active) VALUES (?,?,?,?,?,?,?,?)', c);
  }
  console.log(`Created ${couponsData.length} coupons`);

  // ========== INVENTORY ==========
  const invData = [
    [uuid(), salon1Id, 'شفرات حلاقة', 'tools', 50, 10, 'pcs', 5],
    [uuid(), salon1Id, 'كريم حلاقة', 'products', 15, 5, 'bottle', 25],
    [uuid(), salon1Id, 'شامبو احترافي', 'products', 20, 5, 'bottle', 45],
    [uuid(), salon1Id, 'منشفة', 'supplies', 30, 10, 'pcs', 15],
    [uuid(), salon1Id, 'جل شعر', 'products', 25, 5, 'pcs', 18],
    [uuid(), salon1Id, 'ماكينة حلاقة', 'tools', 3, 1, 'pcs', 350],
    [uuid(), salon1Id, 'صبغة شعر أسود', 'products', 12, 5, 'box', 35],
    [uuid(), salon1Id, 'صبغة شعر بني', 'products', 8, 5, 'box', 35],
    [uuid(), salon2Id, 'فرشاة مكياج (طقم)', 'tools', 10, 3, 'set', 200],
    [uuid(), salon2Id, 'كريم أساس', 'products', 20, 5, 'pcs', 80],
    [uuid(), salon2Id, 'طلاء أظافر (ألوان متنوعة)', 'products', 40, 10, 'bottle', 25],
    [uuid(), salon2Id, 'شمع إزالة شعر', 'supplies', 15, 5, 'kg', 60],
    [uuid(), salon2Id, 'قطن طبي', 'supplies', 30, 10, 'pack', 10],
    [uuid(), salon2Id, 'شامبو كيراتين', 'products', 8, 3, 'bottle', 120],
    [uuid(), salon3Id, 'شفرات', 'tools', 40, 10, 'pcs', 3],
    [uuid(), salon3Id, 'كريم بعد الحلاقة', 'products', 10, 3, 'bottle', 20],
  ];
  for (const inv of invData) {
    await conn.execute('INSERT INTO inventory (id, salon_id, name, category, quantity, min_quantity, unit, price) VALUES (?,?,?,?,?,?,?,?)', inv);
  }
  console.log(`Created ${invData.length} inventory items`);

  // ========== TIPS ==========
  const tipsData = [
    [uuid(), booking1Id, staff1Id, salon1Id, 20],
    [uuid(), booking2Id, staff2Id, salon1Id, 50],
    [uuid(), booking5Id, staff3Id, salon2Id, 30],
    [uuid(), booking7Id, staff4Id, salon2Id, 25],
    [uuid(), booking9Id, staff1Id, salon3Id, 10],
  ];
  for (const t of tipsData) {
    await conn.execute('INSERT INTO tips (id, booking_id, staff_id, salon_id, amount) VALUES (?,?,?,?,?)', t);
  }
  console.log(`Created ${tipsData.length} tips`);

  // ========== CUSTOMER NOTES ==========
  const cnData = [
    [uuid(), salon1Id, user1Id, 'يفضل القص القصير جداً - درجة 2 على الجوانب. حساسية خفيفة من بعض أنواع الجل.'],
    [uuid(), salon1Id, user2Id, 'عريس - يبحث عن ستايل كلاسيكي. الموعد القادم باكج العريس الكامل.'],
    [uuid(), salon1Id, user5Id, 'عميل منتظم - يأتي كل أسبوعين. يحب قص الشعر الفرنسي.'],
    [uuid(), salon2Id, user3Id, 'بشرة حساسة - يجب استخدام مستحضرات خالية من العطور.'],
    [uuid(), salon2Id, user4Id, 'عروسة - الزفاف يوم 26 أبريل. تحب المكياج الطبيعي الفخم. لون الفستان أبيض عاجي.'],
  ];
  for (const cn of cnData) {
    await conn.execute('INSERT INTO customer_notes (id, salon_id, customer_id, note) VALUES (?,?,?,?)', cn);
  }
  console.log(`Created ${cnData.length} customer_notes`);

  // ========== LOYALTY TRANSACTIONS ==========
  const ltData = [
    [uuid(), user1Id, salon1Id, 50, 'earned', 'حجز مكتمل - Casca Barber Shop'],
    [uuid(), user1Id, salon3Id, 20, 'earned', 'حجز مكتمل - Royal Cuts'],
    [uuid(), user1Id, '', -20, 'redeemed', 'استبدال نقاط - خصم على الخدمة'],
    [uuid(), user2Id, salon1Id, 80, 'earned', 'حجز باكج العريس'],
    [uuid(), user2Id, salon1Id, 30, 'earned', 'حجز حلاقة لحية'],
    [uuid(), user2Id, '', -50, 'redeemed', 'استبدال نقاط'],
    [uuid(), user3Id, salon2Id, 60, 'earned', 'حجز قص + سشوار'],
    [uuid(), user3Id, '', -10, 'redeemed', 'استبدال نقاط'],
    [uuid(), user4Id, salon2Id, 150, 'earned', 'حجز باكج العروس'],
    [uuid(), user4Id, salon2Id, 50, 'earned', 'حجز مانيكير + بديكير'],
    [uuid(), user4Id, '', -40, 'redeemed', 'استبدال نقاط'],
    [uuid(), user5Id, salon1Id, 25, 'earned', 'حجز قص شعر'],
    [uuid(), user5Id, salon3Id, 20, 'earned', 'حجز قص + حلاقة'],
  ];
  for (const lt of ltData) {
    await conn.execute('INSERT INTO loyalty_transactions (id, user_id, salon_id, points, type, description) VALUES (?,?,?,?,?,?)', lt);
  }
  console.log(`Created ${ltData.length} loyalty_transactions`);

  // ========== ACTIVITY LOGS ==========
  const alData = [
    [uuid(), superAdminId, 'super_admin', 'system.seed', 'system', '', JSON.stringify({message: 'Full database seed completed'})],
    [uuid(), superAdminId, 'super_admin', 'salon.created', 'salon', salon1Id, JSON.stringify({salonName: 'Casca Barber Shop'})],
    [uuid(), superAdminId, 'super_admin', 'salon.created', 'salon', salon2Id, JSON.stringify({salonName: 'Glamour Ladies Salon'})],
    [uuid(), superAdminId, 'super_admin', 'salon.created', 'salon', salon3Id, JSON.stringify({salonName: 'Royal Cuts'})],
    [uuid(), superAdminId, 'super_admin', 'salon.suspended', 'salon', salon4Id, JSON.stringify({salonName: 'Beauty Palace', reason: 'عدم الدفع'})],
    [uuid(), salonAdmin1Id, 'salon_admin', 'user.login', 'user', salonAdmin1Id, JSON.stringify({ip: '41.33.xx.xx'})],
    [uuid(), salonAdmin2Id, 'salon_admin', 'user.login', 'user', salonAdmin2Id, JSON.stringify({ip: '41.44.xx.xx'})],
    [uuid(), user1Id, 'user', 'booking.created', 'booking', booking1Id, JSON.stringify({salon: 'Casca Barber Shop', total: 120})],
    [uuid(), user4Id, 'user', 'booking.created', 'booking', booking6Id, JSON.stringify({salon: 'Glamour Ladies Salon', total: 900})],
    [uuid(), adminId, 'admin', 'coupon.created', 'coupon', '', JSON.stringify({code: 'SUMMER50', discount: 50})],
    [uuid(), user2Id, 'user', 'user.register', 'user', user2Id, JSON.stringify({method: 'email'})],
    [uuid(), staff1Id, 'staff', 'user.login', 'user', staff1Id, JSON.stringify({ip: '41.55.xx.xx'})],
  ];
  for (const al of alData) {
    await conn.execute('INSERT INTO activity_logs (id, user_id, user_role, action, entity_type, entity_id, metadata) VALUES (?,?,?,?,?,?,?)', al);
  }
  console.log(`Created ${alData.length} activity_logs`);

  // ========== APP SETTINGS ==========
  const settingsData = [
    [uuid(), 'app_name', 'Casca - حجز صالونات', 'اسم التطبيق'],
    [uuid(), 'app_version', '2.0.0', 'إصدار التطبيق'],
    [uuid(), 'default_commission_rate', '5', 'نسبة العمولة الافتراضية (%)'],
    [uuid(), 'loyalty_points_per_booking', '10', 'نقاط الولاء لكل حجز'],
    [uuid(), 'loyalty_points_value', '0.5', 'قيمة كل نقطة بالجنيه'],
    [uuid(), 'max_booking_advance_days', '30', 'أقصى عدد أيام للحجز المسبق'],
    [uuid(), 'cancellation_hours', '24', 'ساعات الإلغاء المسموحة قبل الموعد'],
    [uuid(), 'support_email', 'support@casca.com', 'إيميل الدعم الفني'],
    [uuid(), 'support_phone', '+201000000000', 'رقم الدعم الفني'],
    [uuid(), 'whatsapp_enabled', 'true', 'تفعيل إشعارات الواتساب'],
  ];
  for (const s of settingsData) {
    await conn.execute('INSERT INTO app_settings (id, `key`, value, description) VALUES (?,?,?,?)', s);
  }
  console.log(`Created ${settingsData.length} app_settings`);

  await conn.end();

  console.log('\n========================================');
  console.log('  SEED COMPLETE - ALL TABLES POPULATED');
  console.log('========================================\n');
  console.log('=== ACCOUNTS (password: 123456 for all) ===\n');
  console.log('Super Admin:  superadmin@casca.com');
  console.log('Admin:        admin@casca.com');
  console.log('Salon Admin:  salon1@casca.com  (Casca Barber Shop)');
  console.log('Salon Admin:  salon2@casca.com  (Glamour Ladies Salon)');
  console.log('Staff:        staff1@casca.com  (علي - Casca Barber)');
  console.log('Staff:        staff2@casca.com  (حسن - Casca Barber)');
  console.log('Staff:        staff3@casca.com  (سارة - Glamour Ladies)');
  console.log('Staff:        staff4@casca.com  (ياسمين - Glamour Ladies)');
  console.log('User:         user1@casca.com   (عمر)');
  console.log('User:         user2@casca.com   (يوسف)');
  console.log('User:         user3@casca.com   (نورة)');
  console.log('User:         user4@casca.com   (ليلى)');
  console.log('User:         user5@casca.com   (كريم)');
}

main().catch(err => { console.error('SEED ERROR:', err); process.exit(1); });
