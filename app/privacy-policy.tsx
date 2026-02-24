import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';

const sections = [
  {
    title: 'Information Collection',
    body: 'We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support. This includes your name, email address, phone number, payment information, and any other information you choose to provide.\n\nWe also automatically collect certain information when you use our services, including your IP address, device type, operating system, and usage data.',
  },
  {
    title: 'How We Use Your Information',
    body: 'We use the information we collect to provide, maintain, and improve our services. This includes processing bookings, sending confirmations and reminders, personalizing your experience, and communicating with you about promotions and updates.\n\nWe may also use your information for analytics purposes to better understand how our users interact with our services and to detect and prevent fraud.',
  },
  {
    title: 'Information Sharing',
    body: 'We do not sell your personal information to third parties. We may share your information with service providers who assist us in operating our platform, processing payments, or delivering services.\n\nWe may also share information when required by law, to protect our rights, or in connection with a business transfer such as a merger or acquisition.',
  },
  {
    title: 'Data Security',
    body: 'We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.\n\nWhile we strive to protect your personal information, no method of transmission over the internet or electronic storage is completely secure. We cannot guarantee absolute security.',
  },
  {
    title: 'Your Rights',
    body: 'You have the right to access, update, or delete your personal information at any time through your account settings. You may also request a copy of your data or ask us to restrict certain processing activities.\n\nYou can opt out of marketing communications by following the unsubscribe instructions in our emails or adjusting your notification settings within the app.',
  },
  {
    title: 'Contact Us',
    body: 'If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:\n\nEmail: privacy@casca.app\nPhone: +1 (800) 123-4567\nAddress: 123 Barber Street, Suite 100, New York, NY 10001',
  },
];

export default function PrivacyPolicyScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: webBottomInset + 40, paddingHorizontal: 24 }}>
        <Text style={[styles.lastUpdated, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>
          Last updated: January 1, 2026
        </Text>

        {sections.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{section.title}</Text>
            <Text style={[styles.sectionBody, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{section.body}</Text>
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
