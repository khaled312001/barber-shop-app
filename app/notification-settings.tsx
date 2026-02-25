import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Platform } from 'react-native';
import { router } from 'expo-router';
import { goBack } from '@/lib/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';

const STORAGE_KEY = 'notification_settings';

const defaultSettings = {
  general: true,
  sound: true,
  vibrate: false,
  specialOffers: true,
  payments: true,
  cashback: false,
  appUpdates: true,
};

export default function NotificationSettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();

  const [settings, setSettings] = useState(defaultSettings);

  const labels: Record<string, string> = {
    general: t('general'),
    sound: t('sound'),
    vibrate: t('vibrate'),
    specialOffers: t('special_offers'),
    payments: t('payments'),
    cashback: t('cashback'),
    appUpdates: t('app_updates'),
  };

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setSettings(JSON.parse(stored));
      } catch { }
    })();
  }, []);

  const toggleSetting = async (key: string, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch { }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => goBack()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('notification_settings')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: webBottomInset + 40 }}>
        {Object.entries(settings).map(([key, value]) => (
          <View key={key} style={[styles.settingRow, { borderBottomColor: theme.divider, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.settingLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold', textAlign: isRTL ? 'right' : 'left' }]}>
              {labels[key] || key}
            </Text>
            <Switch
              value={value}
              onValueChange={(v) => toggleSetting(key, v)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
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
  settingRow: { justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  settingLabel: { fontSize: 16 },
});
