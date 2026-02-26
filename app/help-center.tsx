import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, Linking } from 'react-native';
import { router } from 'expo-router';
import { goBack } from '@/lib/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HelpCenterScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();

  const [search, setSearch] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  const faqData = useMemo(() => [
    {
      category: isRTL ? 'عام' : 'General',
      items: [
        {
          q: isRTL ? 'ما هو Casca؟' : 'What is Casca?',
          a: isRTL
            ? 'Casca هي منصة متميزة لحجز الحلاقين والصالونات تربطك بأفضل الحلاقين والمصففين في منطقتك. يمكنك تصفح الصالونات وعرض الخدمات وحجز المواعيد وإدارة حجوزاتك كلها في مكان واحد.'
            : 'Casca is a premium barber and salon booking platform that connects you with top-rated barbers and stylists in your area. You can browse salons, view services, book appointments, and manage your bookings all in one place.'
        },
        {
          q: isRTL ? 'هل Casca متاح في منطقتي؟' : 'Is Casca available in my area?',
          a: isRTL
            ? 'Casca متاح حالياً في المدن الكبرى. نحن نتوسع بسرعة ونضيف مواقع جديدة كل أسبوع. تحقق من التطبيق لرؤية الصالونات القريبة منك.'
            : 'Casca is currently available in major cities. We are expanding rapidly and adding new locations every week. Check the app to see salons near you.'
        },
      ],
    },
    {
      category: isRTL ? 'الحساب' : 'Account',
      items: [
        {
          q: isRTL ? 'كيف أنشئ حساباً؟' : 'How do I create an account?',
          a: isRTL
            ? 'يمكنك إنشاء حساب عن طريق التسجيل ببريدك الإلكتروني، أو باستخدام جوجل أو فيسبوك أو آبل. ما عليك سوى النقر على "إنشاء حساب" في شاشة الترحيب واتباع التعليمات.'
            : 'You can create an account by signing up with your email address, or by using Google, Facebook, or Apple sign-in. Simply tap "Sign Up" on the welcome screen and follow the prompts.'
        },
        {
          q: isRTL ? 'كيف أعيد تعيين كلمة المرور؟' : 'How do I reset my password?',
          a: isRTL
            ? 'انتقل إلى شاشة تسجيل الدخول وانقر على "نسيت كلمة المرور". أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.'
            : 'Go to the Sign In screen and tap "Forgot Password". Enter your email address and we will send you a link to reset your password.'
        },
      ],
    },
    {
      category: isRTL ? 'الحجز' : 'Booking',
      items: [
        {
          q: isRTL ? 'كيف أحجز موعداً؟' : 'How do I book an appointment?',
          a: isRTL
            ? 'تصفح الصالونات، اختر صالوناً، اختر الخدمات المرغوبة، اختر التاريخ والوقت، وأكد حجزك. ستتلقى إشعار تأكيد بمجرد إتمام الحجز.'
            : 'Browse salons, select a salon, choose your desired services, pick a date and time, and confirm your booking. You will receive a confirmation notification once your booking is placed.'
        },
        {
          q: isRTL ? 'هل يمكنني إلغاء أو إعادة جدولة الحجز؟' : 'Can I cancel or reschedule a booking?',
          a: isRTL
            ? 'نعم، يمكنك إلغاء أو إعادة جدولة الحجز من تبويب "حجوزاتي". يرجى ملاحظة أن سياسات الإلغاء قد تختلف حسب الصالون. نوصي بالإلغاء قبل 24 ساعة على الأقل.'
            : 'Yes, you can cancel or reschedule a booking from the Bookings tab. Please note that cancellation policies may vary by salon. We recommend canceling at least 24 hours in advance.'
        },
      ],
    },
    {
      category: isRTL ? 'الدفع' : 'Payment',
      items: [
        {
          q: isRTL ? 'ما هي طرق الدفع المقبولة؟' : 'What payment methods are accepted?',
          a: isRTL
            ? 'نقبل جميع البطاقات الائتمانية والخصم الرئيسية (فيزا، ماستركارد، أمريكان إكسبريس)، بالإضافة إلى باي بال وآبل باي. يمكنك إدارة طرق الدفع في إعدادات ملفك الشخصي.'
            : 'We accept all major credit and debit cards (Visa, Mastercard, American Express), as well as PayPal and Apple Pay. You can manage your payment methods in your profile settings.'
        },
        {
          q: isRTL ? 'هل معلومات الدفع الخاصة بي آمنة؟' : 'Is my payment information secure?',
          a: isRTL
            ? 'نعم، يتم تشفير جميع معلومات الدفع ومعالجتها من خلال Stripe، وهو معالج دفع متوافق مع معايير PCI. نحن لا نخزن تفاصيل بطاقتك الكاملة على خوادمنا أبداً.'
            : 'Yes, all payment information is encrypted and processed through Stripe, a PCI-compliant payment processor. We never store your full card details on our servers.'
        },
      ],
    },
  ], [isRTL]);

  const toggleItem = (key: string) => {
    setExpandedItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const filteredData = faqData.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => goBack()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="close" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('help_center')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Ionicons name="search-outline" size={20} color={theme.textTertiary} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('search')}
          placeholderTextColor={theme.textTertiary}
          style={[styles.searchInput, { color: theme.text, fontFamily: 'Urbanist_400Regular', textAlign: isRTL ? 'right' : 'left' }]}
        />
        {search ? (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: webBottomInset + 40 }}>
        {filteredData.map((category) => (
          <View key={category.category} style={styles.categorySection}>
            <Text style={[styles.categoryTitle, { color: theme.primary, fontFamily: 'Urbanist_700Bold', textAlign: isRTL ? 'right' : 'left' }]}>
              {category.category}
            </Text>
            {category.items.map((item, idx) => {
              const key = `${category.category}-${idx}`;
              const isExpanded = expandedItems.includes(key);
              return (
                <Pressable
                  key={key}
                  onPress={() => toggleItem(key)}
                  style={[styles.faqItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  <View style={[styles.faqHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={[styles.faqQuestion, { color: theme.text, fontFamily: 'Urbanist_600SemiBold', textAlign: isRTL ? 'right' : 'left' }]}>{item.q}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={theme.textTertiary}
                    />
                  </View>
                  {isExpanded ? (
                    <Text style={[styles.faqAnswer, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular', textAlign: isRTL ? 'right' : 'left' }]}>
                      {item.a}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}

        <View style={[styles.contactSection, { borderTopColor: theme.divider }]}>
          <Text style={[styles.contactTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold', textAlign: isRTL ? 'right' : 'left' }]}>{t('contact_us')}</Text>

          <Pressable
            onPress={() => Linking.openURL('mailto:support@casca.app')}
            style={({ pressed }) => [styles.contactItem, { backgroundColor: theme.surface, opacity: pressed ? 0.7 : 1, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            <View style={[styles.contactIcon, { backgroundColor: theme.surfaceAlt, marginRight: isRTL ? 0 : 14, marginLeft: isRTL ? 14 : 0 }]}>
              <Ionicons name="mail-outline" size={22} color={theme.primary} />
            </View>
            <View style={[styles.contactInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.contactLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Text>
              <Text style={[styles.contactValue, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>support@casca.app</Text>
            </View>
            <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={theme.textTertiary} />
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL('tel:+18001234567')}
            style={({ pressed }) => [styles.contactItem, { backgroundColor: theme.surface, opacity: pressed ? 0.7 : 1, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            <View style={[styles.contactIcon, { backgroundColor: theme.surfaceAlt, marginRight: isRTL ? 0 : 14, marginLeft: isRTL ? 14 : 0 }]}>
              <Ionicons name="call-outline" size={22} color={theme.primary} />
            </View>
            <View style={[styles.contactInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.contactLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{isRTL ? 'الهاتف' : 'Phone'}</Text>
              <Text style={[styles.contactValue, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>+1 (800) 123-4567</Text>
            </View>
            <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={theme.textTertiary} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 20, textAlign: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, marginBottom: 16, paddingHorizontal: 16, height: 48, borderRadius: 12, borderWidth: 1, gap: 10 },
  searchInput: { flex: 1, fontSize: 15, height: '100%' },
  categorySection: { marginBottom: 8, paddingHorizontal: 24 },
  categoryTitle: { fontSize: 16, marginBottom: 10, marginTop: 8 },
  faqItem: { borderRadius: 12, borderWidth: 1, marginBottom: 10, padding: 16 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { flex: 1, fontSize: 15, marginRight: 8 },
  faqAnswer: { fontSize: 14, lineHeight: 21, marginTop: 12 },
  contactSection: { paddingHorizontal: 24, paddingTop: 24, marginTop: 8, borderTopWidth: 1 },
  contactTitle: { fontSize: 18, marginBottom: 16 },
  contactItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12 },
  contactIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  contactInfo: { flex: 1 },
  contactLabel: { fontSize: 15, marginBottom: 2 },
  contactValue: { fontSize: 13 },
});
