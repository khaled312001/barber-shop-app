import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WelcomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { handleGooglePress } = useSocialAuth();
  const { t, isRTL } = useLanguage();
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
        <Pressable onPress={() => router.push('/license')} style={styles.licenseLink}>
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
});
