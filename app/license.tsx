import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, Animated, Dimensions,
} from 'react-native';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '@/lib/query-client';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';

const PRIMARY = '#F4A460';
const PRIMARY_DARK = '#e8923c';
const BG = '#0F1117';
const CARD = '#1A1D26';
const CARD_LIGHT = '#222633';
const BORDER = '#2A2D3A';
const SUCCESS = '#10B981';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const FEATURES = [
  { icon: 'calendar-outline', key: 'trial_feature_bookings' },
  { icon: 'people-outline', key: 'trial_feature_staff' },
  { icon: 'bar-chart-outline', key: 'trial_feature_analytics' },
  { icon: 'person-circle-outline', key: 'trial_feature_customers' },
  { icon: 'card-outline', key: 'trial_feature_payments' },
  { icon: 'logo-whatsapp', key: 'trial_feature_whatsapp' },
] as const;

async function getOrCreateDeviceId(): Promise<string> {
  const stored = await AsyncStorage.getItem('device_id');
  if (stored) return stored;
  const id = `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem('device_id', id);
  return id;
}

type ActiveView = 'main' | 'license' | 'trial';

function FeatureItem({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={s.featureItem}>
      <View style={s.featureIcon}>
        <Ionicons name={icon as any} size={20} color={PRIMARY} />
      </View>
      <Text style={s.featureLabel}>{label}</Text>
    </View>
  );
}

function FormInput({
  icon, placeholder, value, onChangeText, isRTL, keyboardType, autoCapitalize, multiline,
}: {
  icon: string; placeholder: string; value: string; onChangeText: (v: string) => void;
  isRTL: boolean; keyboardType?: any; autoCapitalize?: any; multiline?: boolean;
}) {
  return (
    <View style={[s.inputRow, isRTL && s.rtlRow, multiline && { alignItems: 'flex-start', paddingTop: 14 }]}>
      <Ionicons name={icon as any} size={18} color="#555" style={multiline ? { marginTop: 2 } : undefined} />
      <TextInput
        style={[s.input, isRTL && s.rtlInput, multiline && { height: 80, textAlignVertical: 'top' }]}
        placeholder={placeholder}
        placeholderTextColor="#444"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || 'none'}
        textAlign={isRTL ? 'right' : 'left'}
        multiline={multiline}
      />
    </View>
  );
}

export default function LicenseScreen() {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const [activeView, setActiveView] = useState<ActiveView>('main');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // License form
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseLoading, setLicenseLoading] = useState(false);

  // Trial form
  const [trialForm, setTrialForm] = useState({
    salonName: '', ownerName: '', email: '', phone: '', city: '', country: '', message: '',
  });
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialSuccess, setTrialSuccess] = useState(false);

  const switchView = (view: ActiveView) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setActiveView(view);
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const handleVerify = async () => {
    if (!email.trim() || !licenseKey.trim()) {
      Alert.alert(t('license_required_alert'), t('license_required_msg'));
      return;
    }
    setLicenseLoading(true);
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
        Alert.alert(t('license_limit_alert') || 'Activation Limit Reached', t('license_limit_msg') || msg);
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
      setLicenseLoading(false);
    }
  };

  const handleTrialSubmit = async () => {
    const { salonName, ownerName, email: trialEmail, phone } = trialForm;
    if (!salonName.trim() || !ownerName.trim() || !trialEmail.trim() || !phone.trim()) {
      Alert.alert(t('trial_error_title'), t('trial_required_msg'));
      return;
    }
    setTrialLoading(true);
    try {
      const res = await apiRequest('POST', '/api/trial-request', trialForm);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      setTrialSuccess(true);
    } catch (e: any) {
      Alert.alert(t('trial_error_title'), t('trial_error_msg'));
    } finally {
      setTrialLoading(false);
    }
  };

  const updateTrialField = (field: string, value: string) => {
    setTrialForm(prev => ({ ...prev, [field]: value }));
  };

  const renderMain = () => (
    <>
      {/* Hero Section */}
      <View style={s.heroSection}>
        <View style={s.logoOuter}>
          <LinearGradient colors={[PRIMARY, PRIMARY_DARK]} style={s.logoGradient}>
            <Ionicons name="cut" size={40} color="#fff" />
          </LinearGradient>
        </View>
        <Text style={s.brandName}>Barmagly</Text>
        <Text style={s.brandTagline}>{t('smart_barber_platform')}</Text>
      </View>

      {/* Action Cards */}
      <View style={s.actionCards}>
        {/* Activate License Card */}
        <Pressable
          onPress={() => switchView('license')}
          style={({ pressed }) => [s.actionCard, pressed && { transform: [{ scale: 0.98 }] }]}
        >
          <LinearGradient colors={['rgba(244,164,96,0.15)', 'rgba(244,164,96,0.05)']} style={s.actionCardGradient}>
            <View style={s.actionCardIcon}>
              <Ionicons name="key" size={24} color={PRIMARY} />
            </View>
            <View style={s.actionCardContent}>
              <Text style={[s.actionCardTitle, isRTL && s.rtlText]}>{t('activate_license')}</Text>
              <Text style={[s.actionCardSub, isRTL && s.rtlText]}>{t('enter_license_desc')}</Text>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color="#555" />
          </LinearGradient>
        </Pressable>

        {/* Free Trial Card */}
        <Pressable
          onPress={() => switchView('trial')}
          style={({ pressed }) => [s.actionCard, s.trialCard, pressed && { transform: [{ scale: 0.98 }] }]}
        >
          <LinearGradient colors={[`${SUCCESS}20`, `${SUCCESS}08`]} style={s.actionCardGradient}>
            <View style={[s.actionCardIcon, { backgroundColor: `${SUCCESS}20` }]}>
              <Ionicons name="rocket" size={24} color={SUCCESS} />
            </View>
            <View style={s.actionCardContent}>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[s.actionCardTitle, isRTL && s.rtlText]}>{t('trial_section_title')}</Text>
                <View style={s.freeBadge}>
                  <Text style={s.freeBadgeText}>{t('trial_free_days')}</Text>
                </View>
              </View>
              <Text style={[s.actionCardSub, isRTL && s.rtlText]}>{t('trial_section_subtitle')}</Text>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color="#555" />
          </LinearGradient>
        </Pressable>
      </View>

      {/* Features Grid */}
      <View style={s.featuresSection}>
        <Text style={[s.featuresTitle, isRTL && s.rtlText]}>{t('trial_features_title')}</Text>
        <View style={s.featuresGrid}>
          {FEATURES.map((f, i) => (
            <FeatureItem key={i} icon={f.icon} label={t(f.key)} />
          ))}
        </View>
      </View>

      {/* Status indicators */}
      <View style={s.statusRow}>
        {[
          { icon: 'checkmark-circle', color: SUCCESS, label: t('license_active') },
          { icon: 'time-outline', color: '#F59E0B', label: t('license_expired_label') },
          { icon: 'ban-outline', color: '#EF4444', label: t('license_suspended_label') },
        ].map((item, i) => (
          <View key={i} style={s.statusItem}>
            <Ionicons name={item.icon as any} size={14} color={item.color} />
            <Text style={[s.statusLabel, { color: item.color }]}>{item.label}</Text>
          </View>
        ))}
      </View>

      <Pressable onPress={() => router.push('/welcome')} style={s.skipLink}>
        <Text style={s.skipText}>{t('skip_to_customer')}</Text>
        <Ionicons name="arrow-forward" size={14} color={PRIMARY} />
      </Pressable>
    </>
  );

  const renderLicenseForm = () => (
    <>
      <Pressable onPress={() => switchView('main')} style={s.backBtn}>
        <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color="#fff" />
      </Pressable>

      <View style={s.formHeader}>
        <View style={[s.formHeaderIcon, { backgroundColor: `${PRIMARY}20` }]}>
          <Ionicons name="key" size={28} color={PRIMARY} />
        </View>
        <Text style={[s.formTitle, isRTL && s.rtlText]}>{t('activate_license')}</Text>
        <Text style={[s.formSubtitle, isRTL && s.rtlText]}>{t('enter_license_desc')}</Text>
      </View>

      <View style={s.formCard}>
        <View style={s.inputGroup}>
          <Text style={[s.label, isRTL && s.rtlText]}>{t('email')}</Text>
          <FormInput
            icon="mail-outline"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            isRTL={isRTL}
            keyboardType="email-address"
          />
        </View>

        <View style={s.inputGroup}>
          <Text style={[s.label, isRTL && s.rtlText]}>{t('license_key_label')}</Text>
          <FormInput
            icon="key-outline"
            placeholder="BRMG-XXXX-XXXX"
            value={licenseKey}
            onChangeText={setLicenseKey}
            isRTL={isRTL}
            autoCapitalize="characters"
          />
        </View>

        <Pressable
          onPress={handleVerify}
          style={({ pressed }) => [s.primaryBtn, { opacity: pressed ? 0.85 : 1 }]}
          disabled={licenseLoading}
        >
          {licenseLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={20} color="#fff" />
              <Text style={s.primaryBtnText}>{t('activate_btn')}</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Status indicators */}
      <View style={s.statusRow}>
        {[
          { icon: 'checkmark-circle', color: SUCCESS, label: t('license_active') },
          { icon: 'time-outline', color: '#F59E0B', label: t('license_expired_label') },
          { icon: 'ban-outline', color: '#EF4444', label: t('license_suspended_label') },
        ].map((item, i) => (
          <View key={i} style={s.statusItem}>
            <Ionicons name={item.icon as any} size={14} color={item.color} />
            <Text style={[s.statusLabel, { color: item.color }]}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={s.dividerRow}>
        <View style={s.dividerLine} />
        <Text style={s.dividerText}>{t('trial_or_divider')}</Text>
        <View style={s.dividerLine} />
      </View>

      <Pressable onPress={() => switchView('trial')} style={s.switchLink}>
        <Text style={s.switchLinkText}>{t('trial_section_title')}</Text>
        <Text style={[s.switchLinkSub, { color: PRIMARY }]}>{t('trial_submit')} →</Text>
      </Pressable>
    </>
  );

  const renderTrialForm = () => {
    if (trialSuccess) {
      return (
        <>
          <View style={s.successSection}>
            <View style={s.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color={SUCCESS} />
            </View>
            <Text style={s.successTitle}>{t('trial_success_title')}</Text>
            <Text style={s.successMsg}>{t('trial_success_msg')}</Text>
            <Pressable
              onPress={() => { setTrialSuccess(false); switchView('main'); }}
              style={({ pressed }) => [s.primaryBtn, { marginTop: 24, opacity: pressed ? 0.85 : 1 }]}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
              <Text style={s.primaryBtnText}>{t('trial_have_license')}</Text>
            </Pressable>
          </View>
        </>
      );
    }

    return (
      <>
        <Pressable onPress={() => switchView('main')} style={s.backBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color="#fff" />
        </Pressable>

        <View style={s.formHeader}>
          <View style={[s.formHeaderIcon, { backgroundColor: `${SUCCESS}20` }]}>
            <Ionicons name="rocket" size={28} color={SUCCESS} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <Text style={s.formTitle}>{t('trial_section_title')}</Text>
            <View style={s.freeBadge}>
              <Text style={s.freeBadgeText}>{t('trial_free_days')}</Text>
            </View>
          </View>
          <Text style={[s.formSubtitle, isRTL && s.rtlText]}>{t('trial_section_subtitle')}</Text>
          <View style={s.noCreditCard}>
            <Ionicons name="card-outline" size={14} color="#888" />
            <Text style={s.noCreditCardText}>{t('trial_no_credit_card')}</Text>
          </View>
        </View>

        <View style={s.formCard}>
          <View style={s.inputGroup}>
            <Text style={[s.label, isRTL && s.rtlText]}>{t('trial_salon_name')} *</Text>
            <FormInput icon="cut-outline" placeholder={t('trial_salon_name')} value={trialForm.salonName} onChangeText={v => updateTrialField('salonName', v)} isRTL={isRTL} autoCapitalize="words" />
          </View>

          <View style={s.inputGroup}>
            <Text style={[s.label, isRTL && s.rtlText]}>{t('trial_owner_name')} *</Text>
            <FormInput icon="person-outline" placeholder={t('trial_owner_name')} value={trialForm.ownerName} onChangeText={v => updateTrialField('ownerName', v)} isRTL={isRTL} autoCapitalize="words" />
          </View>

          <View style={s.twoCol}>
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={[s.label, isRTL && s.rtlText]}>{t('trial_email')} *</Text>
              <FormInput icon="mail-outline" placeholder="email@example.com" value={trialForm.email} onChangeText={v => updateTrialField('email', v)} isRTL={isRTL} keyboardType="email-address" />
            </View>
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={[s.label, isRTL && s.rtlText]}>{t('trial_phone')} *</Text>
              <FormInput icon="call-outline" placeholder="+41 79 123 4567" value={trialForm.phone} onChangeText={v => updateTrialField('phone', v)} isRTL={isRTL} keyboardType="phone-pad" />
            </View>
          </View>

          <View style={s.twoCol}>
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={[s.label, isRTL && s.rtlText]}>{t('trial_city')}</Text>
              <FormInput icon="location-outline" placeholder={t('trial_city')} value={trialForm.city} onChangeText={v => updateTrialField('city', v)} isRTL={isRTL} autoCapitalize="words" />
            </View>
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={[s.label, isRTL && s.rtlText]}>{t('trial_country')}</Text>
              <FormInput icon="globe-outline" placeholder={t('trial_country')} value={trialForm.country} onChangeText={v => updateTrialField('country', v)} isRTL={isRTL} autoCapitalize="words" />
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={[s.label, isRTL && s.rtlText]}>{t('trial_message')}</Text>
            <FormInput icon="chatbubble-outline" placeholder={t('trial_message')} value={trialForm.message} onChangeText={v => updateTrialField('message', v)} isRTL={isRTL} multiline />
          </View>

          <Pressable
            onPress={handleTrialSubmit}
            style={({ pressed }) => [s.trialBtn, { opacity: pressed ? 0.85 : 1 }]}
            disabled={trialLoading}
          >
            {trialLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="rocket" size={20} color="#fff" />
                <Text style={s.primaryBtnText}>{t('trial_submit')}</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>{t('trial_or_divider')}</Text>
          <View style={s.dividerLine} />
        </View>

        <Pressable onPress={() => switchView('license')} style={s.switchLink}>
          <Text style={s.switchLinkText}>{t('trial_have_license')}</Text>
          <Text style={[s.switchLinkSub, { color: PRIMARY }]}>{t('trial_activate_here')} →</Text>
        </Pressable>
      </>
    );
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Language Switcher */}
        <View style={s.langRow}>
          {LANGUAGES.map((lang) => (
            <Pressable
              key={lang.code}
              onPress={() => setLanguage(lang.code)}
              style={[s.langBtn, language === lang.code && s.langBtnActive]}
            >
              <Text style={s.langFlag}>{lang.flag}</Text>
              <Text style={[s.langLabel, language === lang.code && s.langLabelActive]}>{lang.label}</Text>
            </Pressable>
          ))}
        </View>

        <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
          {activeView === 'main' && renderMain()}
          {activeView === 'license' && renderLicenseForm()}
          {activeView === 'trial' && renderTrialForm()}
        </Animated.View>

        <Text style={s.footer}>© {new Date().getFullYear()} Barmagly. All rights reserved.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: Platform.OS === 'web' ? 40 : 60, paddingBottom: 40, alignItems: 'center', maxWidth: 520, alignSelf: 'center', width: '100%' },

  // Language
  langRow: { flexDirection: 'row', gap: 6, marginBottom: 36, backgroundColor: CARD, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: BORDER, alignSelf: 'center' },
  langBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, gap: 6 },
  langBtnActive: { backgroundColor: CARD_LIGHT },
  langFlag: { fontSize: 16 },
  langLabel: { color: '#666', fontFamily: 'Urbanist_500Medium', fontSize: 13 },
  langLabelActive: { color: '#fff', fontFamily: 'Urbanist_600SemiBold' },

  // Hero
  heroSection: { alignItems: 'center', marginBottom: 36 },
  logoOuter: { marginBottom: 16 },
  logoGradient: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: PRIMARY, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  brandName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 32, letterSpacing: 1 },
  brandTagline: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 14, marginTop: 4, textAlign: 'center' },

  // Action Cards
  actionCards: { width: '100%', gap: 12, marginBottom: 32 },
  actionCard: { width: '100%', borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
  trialCard: { borderColor: `${SUCCESS}30` },
  actionCardGradient: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  actionCardIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: `${PRIMARY}15`, alignItems: 'center', justifyContent: 'center' },
  actionCardContent: { flex: 1, gap: 4 },
  actionCardTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  actionCardSub: { color: '#777', fontFamily: 'Urbanist_400Regular', fontSize: 12, lineHeight: 18 },

  // Free badge
  freeBadge: { backgroundColor: `${SUCCESS}20`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  freeBadgeText: { color: SUCCESS, fontFamily: 'Urbanist_700Bold', fontSize: 11 },

  // Features
  featuresSection: { width: '100%', marginBottom: 28 },
  featuresTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18, marginBottom: 16 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '48%', backgroundColor: CARD, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: BORDER },
  featureIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: `${PRIMARY}12`, alignItems: 'center', justifyContent: 'center' },
  featureLabel: { flex: 1, color: '#ccc', fontFamily: 'Urbanist_500Medium', fontSize: 12 },

  // Status
  statusRow: { flexDirection: 'row', gap: 16, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' },
  statusItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusLabel: { fontFamily: 'Urbanist_500Medium', fontSize: 11 },

  // Skip
  skipLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingVertical: 8 },
  skipText: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 14 },

  // Back button
  backBtn: { alignSelf: 'flex-start', width: 40, height: 40, borderRadius: 12, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER, marginBottom: 20 },

  // Form header
  formHeader: { alignItems: 'center', marginBottom: 24, gap: 8 },
  formHeaderIcon: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  formTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 24, textAlign: 'center' },
  formSubtitle: { color: '#777', fontFamily: 'Urbanist_400Regular', fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 320 },

  // No credit card
  noCreditCard: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  noCreditCardText: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 12 },

  // Form card
  formCard: { width: '100%', backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, padding: 24, marginBottom: 20 },

  // Inputs
  inputGroup: { marginBottom: 14 },
  label: { color: '#999', fontFamily: 'Urbanist_500Medium', fontSize: 13, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#13151B', borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, gap: 10 },
  rtlRow: { flexDirection: 'row-reverse' },
  input: { flex: 1, height: 48, color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 14 },
  rtlInput: { textAlign: 'right' },
  rtlText: { textAlign: 'right' },
  twoCol: { flexDirection: 'row', gap: 10 },

  // Buttons
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: PRIMARY, borderRadius: 14, height: 54, marginTop: 8 },
  primaryBtnText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  trialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: SUCCESS, borderRadius: 14, height: 54, marginTop: 8 },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { color: '#555', fontFamily: 'Urbanist_500Medium', fontSize: 13 },

  // Switch link
  switchLink: { alignItems: 'center', gap: 4, marginBottom: 20 },
  switchLinkText: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13 },
  switchLinkSub: { fontFamily: 'Urbanist_700Bold', fontSize: 14 },

  // Success
  successSection: { alignItems: 'center', paddingVertical: 60, gap: 16 },
  successIcon: { marginBottom: 8 },
  successTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 28, textAlign: 'center' },
  successMsg: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 15, textAlign: 'center', lineHeight: 24, maxWidth: 300 },

  // Footer
  footer: { color: '#333', fontFamily: 'Urbanist_400Regular', fontSize: 11, marginTop: 24, textAlign: 'center' },
});
