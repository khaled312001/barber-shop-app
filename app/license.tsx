import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '@/lib/query-client';
import { useLanguage, Language } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'ar', label: 'العربية', flag: 'AR' },
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'de', label: 'Deutsch', flag: 'DE' },
];

async function getOrCreateDeviceId(): Promise<string> {
  const stored = await AsyncStorage.getItem('device_id');
  if (stored) return stored;
  const id = `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem('device_id', id);
  return id;
}

export default function LicenseScreen() {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email.trim() || !licenseKey.trim()) {
      Alert.alert(t('license_required_alert'), t('license_required_msg'));
      return;
    }
    setLoading(true);
    try {
      const deviceId = await getOrCreateDeviceId();
      const res = await apiRequest('POST', '/api/auth/verify-license', {
        email: email.trim(),
        licenseKey: licenseKey.trim().toUpperCase(),
        deviceId,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid license');

      await AsyncStorage.setItem('license_verified', 'true');
      await AsyncStorage.setItem('license_salon_id', data.salonId || '');
      await AsyncStorage.setItem('license_salon_name', data.salonName || '');
      await AsyncStorage.setItem('license_key', licenseKey.trim().toUpperCase());

      router.replace('/role-select' as Href);
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('Activation limit reached') || msg.includes('activation limit')) {
        Alert.alert(
          t('license_limit_alert') || 'Activation Limit Reached',
          t('license_limit_msg') || msg,
        );
      } else if (msg.includes('expired')) {
        Alert.alert(t('license_expired_alert'), t('license_expired_msg'));
      } else if (msg.includes('suspended')) {
        Alert.alert(t('license_suspended_alert'), t('license_suspended_msg'));
      } else if (msg.includes('revoked')) {
        Alert.alert(t('license_revoked_alert'), t('license_revoked_msg'));
      } else {
        Alert.alert(t('license_invalid_alert'), t('license_invalid_msg'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Language Switcher */}
        <View style={styles.langRow}>
          {LANGUAGES.map((lang) => (
            <Pressable
              key={lang.code}
              onPress={() => setLanguage(lang.code)}
              style={[
                styles.langBtn,
                language === lang.code && styles.langBtnActive,
              ]}
            >
              <Text style={[
                styles.langFlag,
                language === lang.code && styles.langFlagActive,
              ]}>
                {lang.flag}
              </Text>
              <Text style={[
                styles.langLabel,
                language === lang.code && styles.langLabelActive,
              ]}>
                {lang.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Logo */}
        <View style={styles.logoBox}>
          <View style={styles.logoCircle}>
            <Ionicons name="cut" size={36} color="#181A20" />
          </View>
          <Text style={styles.logoText}>Barmagly</Text>
          <Text style={styles.logoSub}>{t('smart_barber_platform')}</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('activate_license')}</Text>
          <Text style={[styles.cardSub, isRTL && styles.rtlText]}>{t('enter_license_desc')}</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('email')}</Text>
            <View style={[styles.inputRow, isRTL && styles.rtlRow]}>
              <Ionicons name="mail-outline" size={18} color="#666" />
              <TextInput
                style={[styles.input, isRTL && styles.rtlInput]}
                placeholder="your@email.com"
                placeholderTextColor="#444"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('license_key_label')}</Text>
            <View style={[styles.inputRow, isRTL && styles.rtlRow]}>
              <Ionicons name="key-outline" size={18} color="#666" />
              <TextInput
                style={[styles.input, isRTL && styles.rtlInput]}
                placeholder="BRMG-XXXX-XXXX"
                placeholderTextColor="#444"
                value={licenseKey}
                onChangeText={setLicenseKey}
                autoCapitalize="characters"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>

          <Pressable
            onPress={handleVerify}
            style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.85 : 1 }]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#181A20" />
            ) : (
              <>
                <Ionicons name="shield-checkmark-outline" size={18} color="#181A20" />
                <Text style={styles.btnText}>{t('activate_btn')}</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Status indicators */}
        <View style={styles.statusRow}>
          {[
            { icon: 'checkmark-circle', color: '#10B981', label: t('license_active') },
            { icon: 'time-outline', color: '#F59E0B', label: t('license_expired_label') },
            { icon: 'ban-outline', color: '#EF4444', label: t('license_suspended_label') },
          ].map((s, i) => (
            <View key={i} style={styles.statusItem}>
              <Ionicons name={s.icon as any} size={14} color={s.color} />
              <Text style={[styles.statusLabel, { color: s.color }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={() => router.push('/welcome')} style={styles.skipLink}>
          <Text style={styles.skipText}>{t('skip_to_customer')}</Text>
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, alignItems: 'center' },

  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: BORDER,
    alignSelf: 'center',
  },
  langBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 2,
    minWidth: 72,
  },
  langBtnActive: {
    backgroundColor: PRIMARY,
  },
  langFlag: {
    color: '#666',
    fontFamily: 'Urbanist_700Bold',
    fontSize: 13,
  },
  langFlagActive: {
    color: '#181A20',
  },
  langLabel: {
    color: '#555',
    fontFamily: 'Urbanist_400Regular',
    fontSize: 10,
  },
  langLabelActive: {
    color: '#181A20',
    fontFamily: 'Urbanist_600SemiBold',
  },

  logoBox: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 80, height: 80, borderRadius: 22, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  logoText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 28 },
  logoSub: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginTop: 4, textAlign: 'center' },

  card: { width: '100%', backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, padding: 24, marginBottom: 24 },
  cardTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20, marginBottom: 6 },
  cardSub: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginBottom: 24 },
  rtlText: { textAlign: 'right' },

  inputGroup: { marginBottom: 16 },
  label: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#13151B', borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, gap: 10 },
  rtlRow: { flexDirection: 'row-reverse' },
  input: { flex: 1, height: 50, color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 15 },
  rtlInput: { textAlign: 'right' },

  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: PRIMARY, borderRadius: 14, height: 54, marginTop: 8 },
  btnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 16 },

  statusRow: { flexDirection: 'row', gap: 16, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' },
  statusItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusLabel: { fontFamily: 'Urbanist_500Medium', fontSize: 11 },

  skipLink: { marginTop: 8, paddingVertical: 8 },
  skipText: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
});
