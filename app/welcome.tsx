import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';
import { useSocialAuth } from '@/hooks/useSocialAuth';

export default function WelcomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { handleGooglePress, handleFacebookPress, handleApplePress } = useSocialAuth();
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
      <View style={[styles.content, { paddingBottom: bottomPad + 20 }]}>
        <Text style={[styles.welcomeText, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
          Welcome to Casca! {'\n'}
          <Text style={{ color: theme.primary }}>Your beauty,</Text> our priority.
        </Text>

        <View style={styles.socialContainer}>
          <Pressable onPress={handleFacebookPress} style={({ pressed }) => [styles.socialBtn, { borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}>
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          </Pressable>
          <Pressable onPress={handleGooglePress} style={({ pressed }) => [styles.socialBtn, { borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}>
            <Ionicons name="logo-google" size={24} color="#EA4335" />
          </Pressable>
          <Pressable onPress={handleApplePress} style={({ pressed }) => [styles.socialBtn, { borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}>
            <Ionicons name="logo-apple" size={24} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        <Pressable
          onPress={() => router.push('/signin')}
          style={({ pressed }) => [styles.signInBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}
        >
          <Text style={[styles.signInText, { fontFamily: 'Urbanist_700Bold' }]}>Sign in with password</Text>
        </Pressable>

        <View style={styles.bottomRow}>
          <Text style={[styles.bottomText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
            Don't have an account?{' '}
          </Text>
          <Pressable onPress={() => router.push('/signup')}>
            <Text style={[styles.linkText, { color: theme.primary, fontFamily: 'Urbanist_600SemiBold' }]}>Sign up</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgImage: { width: '100%', height: '50%', position: 'absolute', top: 0 },
  gradient: { position: 'absolute', top: '25%', left: 0, right: 0, height: '75%' },
  content: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24 },
  welcomeText: { fontSize: 40, lineHeight: 50, marginBottom: 32, textAlign: 'center' },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24 },
  socialBtn: { width: 80, height: 56, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 16 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 16, fontSize: 16 },
  signInBtn: { height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  signInText: { fontSize: 16, color: '#fff' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 8 },
  bottomText: { fontSize: 14 },
  linkText: { fontSize: 14 },
});
