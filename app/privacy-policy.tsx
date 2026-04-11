import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { goBack } from '@/lib/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrivacyPolicyScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();

  const sections = useMemo(() => [
    {
      title: t('info_collection'),
      body: isRTL
        ? 'نقوم بجمع المعلومات التي تقدمها لنا مباشرة، مثل عندما تقوم بإنشاء حساب أو إجراء حجز أو الاتصال بنا للدعم. يتضمن ذلك اسمك وعنوان بريدك الإلكتروني ورقم هاتفك ومعلومات الدفع وأي معلومات أخرى تختار تقديمها.'
        : 'We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support. This includes your name, email address, phone number, payment information, and any other information you choose to provide.',
    },
    {
      title: t('how_we_use'),
      body: isRTL
        ? 'نستخدم المعلومات التي نجمعها لتوفير خدماتنا وصيانتها وتحسينها. يتضمن ذلك معالجة الحجوزات وإرسال التأكيدات والتذكيرات وتخصيص تجربتك والتواصل معك بشأن العروض الترويجية والتحديثات.'
        : 'We use the information we collect to provide, maintain, and improve our services. This includes processing bookings, sending confirmations and reminders, personalizing your experience, and communicating with you about promotions and updates.',
    },
    {
      title: t('info_sharing'),
      body: isRTL
        ? 'نحن لا نبيع معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع مزودي الخدمة الذين يساعدوننا في تشغيل منصتنا أو معالجة المدفوعات أو تقديم الخدمات.'
        : 'We do not sell your personal information to third parties. We may share your information with service providers who assist us in operating our platform, processing payments, or delivering services.',
    },
    {
      title: t('data_security'),
      body: isRTL
        ? 'نحن ننفذ إجراءات أمنية فنية وتنظيمية مناسبة لحماية بياناتك الشخصية من الوصول غير المصرح به أو التعديل أو الإفصاح أو التدمير.'
        : 'We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.',
    },
    {
      title: t('your_rights'),
      body: isRTL
        ? 'لديك الحق في الوصول إلى معلوماتك الشخصية أو تحديثها أو حذفها في أي وقت من خلال إعدادات حسابك. يمكنك أيضًا طلب نسخة من بياناتك أو الطلب منا تقييد أنشطة معالجة معينة.'
        : 'You have the right to access, update, or delete your personal information at any time through your account settings. You may also request a copy of your data or ask us to restrict certain processing activities.',
    },
    {
      title: t('contact_us'),
      body: isRTL
        ? 'إذا كان لديك أي أسئلة أو مخاوف بشأن سياسة الخصوصية هذه أو ممارسات البيانات الخاصة بنا ، يرجى الاتصال بنا على:\n\nالبريد الإلكتروني: privacy@casca.app\nالهاتف: +1 (800) 123-4567'
        : 'If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:\n\nEmail: privacy@casca.app\nPhone: +1 (800) 123-4567',
    },
  ], [isRTL, t]);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => goBack()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="close" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('privacy_policy')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: webBottomInset + 40, paddingHorizontal: 24 }}>
        <Text style={[styles.lastUpdated, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular', textAlign: isRTL ? 'right' : 'left' }]}>
          {t('last_updated')}: January 1, 2026
        </Text>

        {sections.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold', textAlign: isRTL ? 'right' : 'left' }]}>{section.title}</Text>
            <Text style={[styles.sectionBody, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular', textAlign: isRTL ? 'right' : 'left' }]}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 20, textAlign: 'center' },
  lastUpdated: { fontSize: 13, marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, marginBottom: 8 },
  sectionBody: { fontSize: 14, lineHeight: 22 },
});
