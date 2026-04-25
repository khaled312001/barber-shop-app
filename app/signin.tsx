import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, Platform, ScrollView, ActivityIndicator, Dimensions,
} from 'react-native';
import { router, Href } from 'expo-router';
import { goBack } from '@/lib/navigation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/query-client';

// Google OAuth client ID — public by design (safe to hardcode)
const GOOGLE_CLIENT_ID = '450663876039-smh1g09vbdgt0f6397oltn0e40lobtop.apps.googleusercontent.com';

const { width } = Dimensions.get('window');

// Route to correct home based on role (used by email + Google login)
export function routeByRole(role?: string) {
  if (role === 'salon_admin') return router.replace('/dashboard');
  if (role === 'staff') return router.replace('/schedule');
  if (role === 'admin' || role === 'super_admin') return router.replace('/(admin)' as Href);
  return router.replace('/home');
}

export default function SignInScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const { handleGooglePress, initGoogleOneTap, renderGoogleButton } = useSocialAuth();
  const { t, isRTL } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Device license state (Salon/Barber quick sign-in)
  const [deviceLicense, setDeviceLicense] = useState<{
    active: boolean;
    loading: boolean;
    salonName?: string;
    email?: string;
  }>({ active: false, loading: true });

  // Web: load Google Identity Services on mount → show One Tap + render official button
  useEffect(() => {
    if (Platform.OS === 'web') {
      initGoogleOneTap(GOOGLE_CLIENT_ID);
      const timer = setTimeout(() => {
        renderGoogleButton('google-signin-btn-container', GOOGLE_CLIENT_ID);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Check if this device already has an active salon license
  useEffect(() => {
    (async () => {
      try {
        let deviceId: string | null = null;
        try {
          deviceId = await AsyncStorage.getItem('device_id');
        } catch {}
        if (!deviceId && Platform.OS === 'web' && typeof window !== 'undefined') {
          deviceId = window.localStorage.getItem('device_id');
        }
        if (!deviceId) {
          setDeviceLicense({ active: false, loading: false });
          return;
        }
        const res = await apiRequest('POST', '/api/auth/check-device-license', { deviceId });
        if (!res.ok) {
          setDeviceLicense({ active: false, loading: false });
          return;
        }
        const data = await res.json();
        if (data.active && Array.isArray(data.activations) && data.activations.length > 0) {
          const first = data.activations[0];
          setDeviceLicense({
            active: true,
            loading: false,
            salonName: first.salonName || '',
            email: first.email || '',
          });
        } else {
          setDeviceLicense({ active: false, loading: false });
        }
      } catch {
        setDeviceLicense({ active: false, loading: false });
      }
    })();
  }, []);
  const webTopInset = Platform.OS === 'web' ? 30 : 0;
  const webBottomInset = Platform.OS === 'web' ? 20 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;
  const bottomPad = Platform.OS === 'web' ? webBottomInset : insets.bottom;

  const handleSignIn = async () => {
    if (loading) return;
    setError('');
    if (!email.trim() || !password.trim()) {
      setError(t('email_password_required') || 'Email and password are required');
      return;
    }
    setLoading(true);
    try {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const loggedUser = await login(email, password);
      routeByRole((loggedUser as any)?.role);
    } catch (e: any) {
      const msg = e?.message || '';
      let translated = t('check_credentials') || 'Please check your credentials';
      if (msg.includes('No account found')) translated = t('no_account_found') || 'No account found with this email';
      else if (msg.includes('Incorrect password')) translated = t('incorrect_password') || 'Incorrect password';
      setError(translated);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    setError('');
    try {
      await handleGooglePress();
      // Note: handleGooglePress internally navigates based on role via routeByRole wrapper
    } catch (e: any) {
      setError(e?.message || t('google_signin_failed') || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPad + 12, paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.replace('/role-select')}
            style={({ pressed }) => [styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="chevron-back" size={22} color={theme.text} />
          </Pressable>
          <View style={[styles.logoBadge, { backgroundColor: theme.primary + '18', borderColor: theme.primary + '30' }]}>
            <MaterialCommunityIcons name="content-cut" size={14} color={theme.primary} />
            <Text style={[styles.logoBadgeText, { color: theme.primary }]}>Casca</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient
            colors={[theme.primary + '25', theme.primary + '05']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.heroIconCircle, { borderColor: theme.primary + '30' }]}
          >
            <MaterialCommunityIcons name="account-circle-outline" size={36} color={theme.primary} />
          </LinearGradient>
          <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
            {t('welcome_back_title') || 'Welcome Back'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
            {t('login_to_account') || 'Sign in to continue your experience'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>{t('email') || 'Email'}</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.fieldIconWrap, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="mail-outline" size={16} color={theme.primary} />
              </View>
              <TextInput
                style={[styles.input, { color: theme.text, fontFamily: 'Urbanist_500Medium', textAlign: isRTL ? 'right' : 'left' }]}
                placeholder={t('email_placeholder') || 'you@example.com'}
                placeholderTextColor={theme.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <View style={styles.fieldLabelRow}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>{t('password') || 'Password'}</Text>
              <Pressable onPress={() => router.push('/forgot-password')}>
                <Text style={[styles.forgotInline, { color: theme.primary }]}>
                  {t('forgot_password') || 'Forgot?'}
                </Text>
              </Pressable>
            </View>
            <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.fieldIconWrap, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="lock-closed-outline" size={16} color={theme.primary} />
              </View>
              <TextInput
                style={[styles.input, { color: theme.text, fontFamily: 'Urbanist_500Medium', textAlign: isRTL ? 'right' : 'left' }]}
                placeholder={t('password_placeholder') || '••••••••'}
                placeholderTextColor={theme.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={18} color={theme.textTertiary} />
              </Pressable>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <View style={styles.errorIconWrap}>
                <Ionicons name="alert-circle" size={14} color="#EF4444" />
              </View>
              <Text style={styles.errorText} numberOfLines={2}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={() => setRememberMe(!rememberMe)}
            style={({ pressed }) => [styles.rememberRow, pressed && { opacity: 0.7 }]}
          >
            <View style={[styles.checkbox, { borderColor: rememberMe ? theme.primary : theme.border, backgroundColor: rememberMe ? theme.primary : 'transparent' }]}>
              {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={[styles.rememberText, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>
              {t('remember_me') || 'Remember me'}
            </Text>
          </Pressable>

          {/* Sign in button - gradient */}
          <Pressable
            onPress={handleSignIn}
            disabled={loading}
            style={({ pressed }) => [styles.signInBtn, pressed && { opacity: 0.9 }, loading && { opacity: 0.7 }]}
          >
            <LinearGradient
              colors={[theme.primary, '#E8924A']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.signInGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#181A20" />
              ) : (
                <>
                  <Text style={styles.signInText}>{t('sign_in') || 'Sign In'}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#181A20" />
                </>
              )}
            </LinearGradient>
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
              {t('or_continue_with') || 'Or continue with'}
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          {/* Google button — official GIS button on web, fallback button on native */}
          {Platform.OS === 'web' ? (
            <View style={styles.gisButtonWrap}>
              <View nativeID="google-signin-btn-container" style={{ width: '100%', minHeight: 44, alignItems: 'center' }} />
              {/* Fallback button (shown until GIS loads) */}
              <Pressable
                onPress={handleGoogle}
                disabled={googleLoading}
                style={({ pressed }) => [
                  styles.googleBtnFallback,
                  { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
                  googleLoading && { opacity: 0.7 },
                ]}
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <>
                    <View style={styles.googleIconWrap}>
                      <Ionicons name="logo-google" size={18} color="#EA4335" />
                    </View>
                    <Text style={[styles.googleTextFallback, { color: theme.textSecondary }]}>
                      {t('continue_with_popup') || 'Continue with popup (fallback)'}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handleGoogle}
              disabled={googleLoading}
              style={({ pressed }) => [
                styles.googleBtn,
                { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
                googleLoading && { opacity: 0.7 },
              ]}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <>
                  <View style={styles.googleIconWrap}>
                    <Ionicons name="logo-google" size={20} color="#EA4335" />
                  </View>
                  <Text style={[styles.googleText, { color: theme.text }]}>
                    {t('continue_with_google') || 'Continue with Google'}
                  </Text>
                </>
              )}
            </Pressable>
          )}

          {/* Helper text for Google */}
          <View style={[styles.infoBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.infoIconWrap, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="information-circle" size={14} color={theme.primary} />
            </View>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {t('google_role_hint') || 'Google sign-in will log you in as your existing role if registered, or as a customer.'}
            </Text>
          </View>

          {/* ══════════ Salon / Barber Section ══════════ */}
          <View style={styles.salonSection}>
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <View style={[styles.businessBadge, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '35' }]}>
                <MaterialCommunityIcons name="store" size={12} color={theme.primary} />
                <Text style={[styles.businessBadgeText, { color: theme.primary }]}>
                  {t('for_business') || 'For Business'}
                </Text>
              </View>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            {deviceLicense.loading ? (
              <View style={[styles.salonCheckBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.salonCheckText, { color: theme.textSecondary }]}>
                  {t('checking_license') || 'Checking device license...'}
                </Text>
              </View>
            ) : deviceLicense.active ? (
              // License already activated on this device
              <Pressable
                onPress={() => router.replace('/dashboard')}
                style={({ pressed }) => [
                  styles.licenseActiveBtn,
                  { borderColor: '#10B98150', opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <LinearGradient
                  colors={['rgba(16,185,129,0.2)', 'rgba(16,185,129,0.05)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.licenseActiveInner}
                >
                  <View style={[styles.licenseIcon, { backgroundColor: '#10B981' }]}>
                    <Ionicons name="checkmark-circle" size={22} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.licenseTopRow}>
                      <Text style={[styles.licenseTitle, { color: '#10B981' }]}>
                        {t('license_active') || 'License Active'}
                      </Text>
                      <View style={styles.licenseLiveDot} />
                    </View>
                    {deviceLicense.salonName ? (
                      <Text style={[styles.licenseSub, { color: theme.text }]} numberOfLines={1}>
                        {deviceLicense.salonName}
                      </Text>
                    ) : null}
                    <Text style={[styles.licenseHint, { color: theme.textSecondary }]} numberOfLines={1}>
                      {t('device_activated_tap_continue') || 'Tap to continue as salon admin'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#10B981" />
                </LinearGradient>
              </Pressable>
            ) : (
              // No active license on device → go to /license to activate
              <Pressable
                onPress={() => router.push('/license' as Href)}
                style={({ pressed }) => [
                  styles.salonBtn,
                  { backgroundColor: theme.card, borderColor: theme.primary + '40', opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <View style={[styles.salonIconWrap, { backgroundColor: theme.primary + '20' }]}>
                  <MaterialCommunityIcons name="content-cut" size={20} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.salonBtnTitle, { color: theme.text }]}>
                    {t('salon_owner_or_barber') || 'Salon Owner or Barber?'}
                  </Text>
                  <Text style={[styles.salonBtnSub, { color: theme.textSecondary }]} numberOfLines={1}>
                    {t('activate_license_to_signin') || 'Activate your license key to sign in'}
                  </Text>
                </View>
                <View style={[styles.salonArrowWrap, { backgroundColor: theme.primary }]}>
                  <Ionicons name="arrow-forward" size={14} color="#181A20" />
                </View>
              </Pressable>
            )}
          </View>
        </View>

        {/* Bottom sign up link */}
        <View style={styles.bottomRow}>
          <Text style={[styles.bottomText, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
            {t('no_account') || "Don't have an account?"}
          </Text>
          <Pressable onPress={() => router.push('/signup')}>
            <Text style={[styles.linkText, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>
              {' '}{t('sign_up') || 'Sign Up'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, minHeight: '100%', maxWidth: Math.min(width, 440), width: '100%', alignSelf: 'center' },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  logoBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  logoBadgeText: { fontFamily: 'Urbanist_700Bold', fontSize: 13 },

  hero: { alignItems: 'center', marginBottom: 28 },
  heroIconCircle: { width: 80, height: 80, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 16 },
  title: { fontSize: 28, marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },

  form: { gap: 14 },
  fieldWrap: { gap: 8 },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldLabel: { fontFamily: 'Urbanist_700Bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  forgotInline: { fontFamily: 'Urbanist_700Bold', fontSize: 12 },
  inputContainer: { alignItems: 'center', height: 56, borderRadius: 14, paddingHorizontal: 12, borderWidth: 1, gap: 10 },
  fieldIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, fontSize: 14, paddingVertical: 0 },
  eyeBtn: { padding: 6 },

  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: 10 },
  errorIconWrap: { width: 26, height: 26, borderRadius: 9, backgroundColor: 'rgba(239,68,68,0.2)', alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#EF4444', fontFamily: 'Urbanist_600SemiBold', fontSize: 12, flex: 1 },

  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  rememberText: { fontSize: 13 },

  signInBtn: {
    height: 54, borderRadius: 14, overflow: 'hidden', marginTop: 8,
    shadowColor: '#F4A460', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 6,
  },
  signInGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  signInText: { fontFamily: 'Urbanist_700Bold', fontSize: 16, color: '#181A20' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 12 },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    height: 54, borderRadius: 14, borderWidth: 1.5,
  },
  googleIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  googleText: { fontFamily: 'Urbanist_700Bold', fontSize: 14 },
  gisButtonWrap: { alignItems: 'center', gap: 10 },
  googleBtnFallback: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 44, borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 16, alignSelf: 'stretch',
  },
  googleTextFallback: { fontFamily: 'Urbanist_500Medium', fontSize: 12 },

  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  infoIconWrap: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  infoText: { flex: 1, fontFamily: 'Urbanist_500Medium', fontSize: 11, lineHeight: 15 },

  // Salon / Barber section
  salonSection: { gap: 12, marginTop: 8 },
  businessBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, borderWidth: 1 },
  businessBadgeText: { fontFamily: 'Urbanist_700Bold', fontSize: 11, letterSpacing: 0.3 },

  salonCheckBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  salonCheckText: { fontFamily: 'Urbanist_500Medium', fontSize: 12, flex: 1 },

  salonBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1.5 },
  salonIconWrap: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  salonBtnTitle: { fontFamily: 'Urbanist_700Bold', fontSize: 13, marginBottom: 3 },
  salonBtnSub: { fontFamily: 'Urbanist_500Medium', fontSize: 11 },
  salonArrowWrap: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },

  licenseActiveBtn: { borderRadius: 14, borderWidth: 1.5, overflow: 'hidden' },
  licenseActiveInner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  licenseIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  licenseTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  licenseTitle: { fontFamily: 'Urbanist_700Bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
  licenseLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  licenseSub: { fontFamily: 'Urbanist_700Bold', fontSize: 15, marginTop: 2 },
  licenseHint: { fontFamily: 'Urbanist_500Medium', fontSize: 11, marginTop: 2 },

  bottomRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  bottomText: { fontSize: 13 },
  linkText: { fontSize: 13 },
});
