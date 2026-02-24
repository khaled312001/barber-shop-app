import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, Platform, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { signup, googleLogin } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;
  const bottomPad = Platform.OS === 'web' ? webBottomInset : insets.bottom;

  const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: clientId || 'placeholder',
    redirectUri: undefined,
  });

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      const fetchUserInfo = async () => {
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.authentication!.accessToken}` },
          });
          const userInfo = await res.json();
          await googleLogin(userInfo.email, userInfo.name, userInfo.picture);
          router.replace('/(tabs)');
        } catch (e: any) {
          Alert.alert('Google Sign-In Failed', e?.message || 'Please try again.');
        }
      };
      fetchUserInfo();
    }
  }, [response]);

  const handleSignUp = async () => {
    if (loading) return;
    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signup(fullName, email, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Sign Up Failed', e?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePress = () => {
    if (!clientId) {
      Alert.alert('Google Sign-In requires configuration. Please set up a Google OAuth Client ID.');
      return;
    }
    promptAsync();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: topPad + 16, paddingBottom: bottomPad + 20 }]} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>

        <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Create your{'\n'}Account</Text>

        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Ionicons name="person-outline" size={20} color={theme.textTertiary} />
          <TextInput
            style={[styles.input, { color: theme.text, fontFamily: 'Urbanist_400Regular' }]}
            placeholder="Full Name"
            placeholderTextColor={theme.textTertiary}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Ionicons name="mail-outline" size={20} color={theme.textTertiary} />
          <TextInput
            style={[styles.input, { color: theme.text, fontFamily: 'Urbanist_400Regular' }]}
            placeholder="Email"
            placeholderTextColor={theme.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Ionicons name="lock-closed-outline" size={20} color={theme.textTertiary} />
          <TextInput
            style={[styles.input, { color: theme.text, fontFamily: 'Urbanist_400Regular' }]}
            placeholder="Password"
            placeholderTextColor={theme.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={theme.textTertiary} />
          </Pressable>
        </View>

        <Pressable onPress={handleSignUp} style={({ pressed }) => [styles.signUpBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}>
          <Text style={[styles.signUpText, { fontFamily: 'Urbanist_700Bold' }]}>Sign up</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>or continue with</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        <View style={styles.socialRow}>
          <Pressable style={({ pressed }) => [styles.socialBtn, { borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}>
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          </Pressable>
          <Pressable style={({ pressed }) => [styles.socialBtn, { borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}>
            <Ionicons name="logo-google" size={24} color="#EA4335" />
          </Pressable>
          <Pressable style={({ pressed }) => [styles.socialBtn, { borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}>
            <Ionicons name="logo-apple" size={24} color={theme.text} />
          </Pressable>
        </View>

        <Pressable
          onPress={handleGooglePress}
          style={({ pressed }) => [styles.googleBtn, { borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}
        >
          <Ionicons name="logo-google" size={22} color={theme.text} />
          <Text style={[styles.googleBtnText, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>Continue with Google</Text>
        </Pressable>

        <View style={[styles.bottomRow, { marginTop: 16 }]}>
          <Text style={[styles.bottomText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>Already have an account? </Text>
          <Pressable onPress={() => router.push('/signin')}>
            <Text style={[styles.linkText, { color: theme.primary, fontFamily: 'Urbanist_600SemiBold' }]}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 40, lineHeight: 50, marginTop: 16, marginBottom: 32 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', height: 56, borderRadius: 16, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1 },
  input: { flex: 1, fontSize: 14, marginLeft: 12 },
  signUpBtn: { height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', marginBottom: 24, marginTop: 8 },
  signUpText: { fontSize: 16, color: '#fff' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 16, fontSize: 14 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24 },
  socialBtn: { width: 80, height: 56, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 58, borderRadius: 29, borderWidth: 2, gap: 12, marginTop: 12 },
  googleBtnText: { fontSize: 16 },
  bottomRow: { flexDirection: 'row', justifyContent: 'center' },
  bottomText: { fontSize: 14 },
  linkText: { fontSize: 14 },
});
