import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';
import { languages } from '@/constants/data';

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState({
    general: true, sound: true, vibrate: false, specialOffers: true, payments: true, cashback: false, updates: true,
  });
  const [selectedLang, setSelectedLang] = useState('en');
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Notifications</Text>
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

        <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Language</Text>
        {languages.map(lang => (
          <Pressable key={lang.id} onPress={() => setSelectedLang(lang.id)} style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{lang.name}</Text>
            <Ionicons
              name={selectedLang === lang.id ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selectedLang === lang.id ? theme.primary : theme.textTertiary}
            />
          </Pressable>
        ))}

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Security</Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>Face ID</Text>
          <Switch value={false} trackColor={{ false: theme.border, true: theme.primary }} thumbColor="#fff" />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>Biometric ID</Text>
          <Switch value={true} trackColor={{ false: theme.border, true: theme.primary }} thumbColor="#fff" />
        </View>
        <Pressable style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </Pressable>
        <Pressable style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>Change PIN</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </Pressable>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Privacy Policy</Text>
        <Text style={[styles.policyText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
          Your privacy is important to us. We collect and process your personal information in accordance with applicable data protection regulations. By using Casca, you agree to our collection, use, and sharing of your data as described in our full privacy policy.{'\n\n'}
          We implement appropriate security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
        </Text>
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
