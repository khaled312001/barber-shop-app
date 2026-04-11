import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { router, Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import { useLanguage, Language } from '@/contexts/LanguageContext';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'ar', label: 'العربية', flag: 'AR' },
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'de', label: 'Deutsch', flag: 'DE' },
];

export default function WelcomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { handleGooglePress } = useSocialAuth();
  const { t, isRTL, language, setLanguage } = useLanguage();
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const bottomPad = Platform.OS === 'web' ? webBottomInset : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=700&fit=crop' }}
        style={styles.bgImage}
        contentFit="cover"
      />
      <LinearGradient
        colors={['transparent', theme.isDark ? 'rgba(24,26,32,0.9)' : 'rgba(255,255,255,0.95)', theme.background]}
        style={styles.gradient}
      />

      {/* Logo badge at top */}
      <View style={[styles.logoBadge, { top: Platform.OS === 'web' ? 40 : insets.top + 20 }]}>
        <View style={styles.logoIcon}>
          <Ionicons name="cut" size={18} color="#181A20" />
        </View>
        <Text style={styles.logoLabel}>Barmagly</Text>
      </View>

      {/* Language switcher */}
      <View style={[styles.langSwitcher, { top: Platform.OS === 'web' ? 36 : insets.top + 16 }]}>
        {LANGUAGES.map((lang) => (
          <Pressable
            key={lang.code}
            onPress={() => setLanguage(lang.code)}
            style={[
              styles.langBtn,
              language === lang.code && styles.langBtnActive,
            ]}
          >
            <Text style={[styles.langFlag, language === lang.code && styles.langFlagActive]}>
              {lang.flag}
            </Text>
            {language === lang.code && (
              <Text style={styles.langLabel}>{lang.label}</Text>
            )}
          </Pressable>
        ))}
      </View>

      <View style={[styles.content, { paddingBottom: bottomPad + 20 }]}>
        <Text style={[styles.welcomeText, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
          {'Welcome to '}
          <Text style={{ color: theme.primary }}>Barmagly!</Text>{'\n'}
          <Text style={[styles.subText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
            Smart Barber Management Platform
          </Text>
        </Text>

        <View style={styles.socialContainer}>
          <Pressable onPress={handleGooglePress} style={({ pressed }) => [styles.socialBtn, { borderColor: theme.border, backgroundColor: theme.surface, opacity: pressed ? 0.7 : 1 }]}>
            <Ionicons name="logo-google" size={24} color="#EA4335" />
          </Pressable>
        </View>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>{t('or') || 'or'}</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        <Pressable
          onPress={() => router.push('/signin')}
          style={({ pressed }) => [styles.signInBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}
        >
          <Text style={[styles.signInText, { fontFamily: 'Urbanist_700Bold' }]}>
            {t('sign_in_password') || 'Sign in with password'}
          </Text>
        </Pressable>

        <View style={styles.bottomRow}>
          <Text style={[styles.bottomText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
            {t('no_account') || "Don't have an account?"}{' '}
          </Text>
          <Pressable onPress={() => router.push('/signup')}>
            <Text style={[styles.linkText, { color: theme.primary, fontFamily: 'Urbanist_600SemiBold' }]}>
              {t('sign_up') || 'Sign Up'}
            </Text>
          </Pressable>
        </View>

        {/* License / Admin link */}
        <Pressable onPress={() => router.push('/license' as Href)} style={styles.licenseLink}>
          <Ionicons name="key-outline" size={14} color="#555" />
          <Text style={[styles.licenseText, { fontFamily: 'Urbanist_500Medium' }]}>
            {t('admin_staff_login_license') || 'Admin / Staff? Login with License'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgImage: { width: '100%', height: '50%', position: 'absolute', top: 0 },
  gradient: { position: 'absolute', top: '25%', left: 0, right: 0, height: '75%' },
  logoBadge: { position: 'absolute', left: 24, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 10 },
  logoIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F4A460', alignItems: 'center', justifyContent: 'center' },
  logoLabel: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  content: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24 },
  welcomeText: { fontSize: 36, lineHeight: 46, marginBottom: 8, textAlign: 'center' },
  subText: { fontSize: 16, lineHeight: 24 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24, marginTop: 24 },
  socialBtn: { width: 80, height: 56, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 16 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 16, fontSize: 16 },
  signInBtn: { height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  signInText: { fontSize: 16, color: '#fff' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 12 },
  bottomText: { fontSize: 14 },
  linkText: { fontSize: 14 },
  licenseLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: 8 },
  licenseText: { fontSize: 12, color: '#555' },
  langSwitcher: { position: 'absolute', right: 16, flexDirection: 'row', alignItems: 'center', gap: 6, zIndex: 10 },
  langBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,0,0.25)' },
  langBtnActive: { backgroundColor: '#F4A460', borderColor: '#F4A460' },
  langFlag: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },
  langFlagActive: { color: '#181A20' },
  langLabel: { fontSize: 11, fontWeight: '600', color: '#181A20' },
});
