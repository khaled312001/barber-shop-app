import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { goBack } from '@/lib/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { language, setLanguage, t } = useLanguage();

  const [notifications, setNotifications] = useState({
    general: true, sound: true, vibrate: false, specialOffers: true, payments: true, cashback: false, updates: true,
  });

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  const languages = [
    { id: 'en' as const, name: t('english') },
    { id: 'ar' as const, name: t('arabic') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => goBack()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('language')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('language')}</Text>
        {languages.map(lang => (
          <Pressable
            key={lang.id}
            onPress={() => setLanguage(lang.id)}
            style={styles.settingRow}
          >
            <Text style={[styles.settingLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{lang.name}</Text>
            <Ionicons
              name={language === lang.id ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={language === lang.id ? theme.primary : theme.textTertiary}
            />
          </Pressable>
        ))}

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('notification')}</Text>
        {Object.entries(notifications).map(([key, value]) => (
          <View key={key} style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
            </Text>
            <Switch
              value={value}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, [key]: v }))}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
        ))}

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('security')}</Text>
        <Pressable
          onPress={() => router.push('/change-password')}
          style={styles.settingRow}
        >
          <Text style={[styles.settingLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{t('change_password')}</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </Pressable>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('privacy_policy')}</Text>
        <Pressable
          onPress={() => router.push('/privacy-policy')}
          style={styles.settingRow}
        >
          <Text style={[styles.settingLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{t('privacy_policy')}</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 20, textAlign: 'center' },
  sectionTitle: { fontSize: 18, paddingHorizontal: 24, marginBottom: 12, marginTop: 8 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14 },
  settingLabel: { fontSize: 16 },
  divider: { height: 1, marginHorizontal: 24, marginVertical: 16 },
  policyText: { fontSize: 14, lineHeight: 22, paddingHorizontal: 24 },
});
