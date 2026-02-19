import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, Platform, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [method, setMethod] = useState<'sms' | 'email'>('sms');
  const [step, setStep] = useState<'method' | 'otp' | 'newpass' | 'success'>('method');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;
  const bottomPad = Platform.OS === 'web' ? webBottomInset : insets.bottom;

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 'method') setStep('otp');
    else if (step === 'otp') setStep('newpass');
    else if (step === 'newpass') setStep('success');
  };

  const renderMethod = () => (
    <>
      <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
        Select which contact details should we use to reset your password
      </Text>
      <Pressable
        onPress={() => setMethod('sms')}
        style={[styles.methodCard, { borderColor: method === 'sms' ? theme.primary : theme.border, backgroundColor: theme.surface }]}
      >
        <View style={[styles.methodIcon, { backgroundColor: theme.primary + '20' }]}>
          <MaterialIcons name="chat" size={28} color={theme.primary} />
        </View>
        <View style={styles.methodInfo}>
          <Text style={[styles.methodLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>via SMS:</Text>
          <Text style={[styles.methodValue, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>+1 *** *** 890</Text>
        </View>
      </Pressable>
      <Pressable
        onPress={() => setMethod('email')}
        style={[styles.methodCard, { borderColor: method === 'email' ? theme.primary : theme.border, backgroundColor: theme.surface }]}
      >
        <View style={[styles.methodIcon, { backgroundColor: theme.primary + '20' }]}>
          <MaterialIcons name="email" size={28} color={theme.primary} />
        </View>
        <View style={styles.methodInfo}>
          <Text style={[styles.methodLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>via Email:</Text>
          <Text style={[styles.methodValue, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>an***@example.com</Text>
        </View>
      </Pressable>
    </>
  );

  const renderOtp = () => (
    <>
      <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
        Code has been sent to {method === 'sms' ? '+1 *** *** 890' : 'an***@example.com'}
      </Text>
      <View style={styles.otpRow}>
        {otp.map((digit, i) => (
          <View key={i} style={[styles.otpBox, { backgroundColor: theme.inputBg, borderColor: digit ? theme.primary : theme.inputBorder }]}>
            <TextInput
              style={[styles.otpInput, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(val) => {
                const newOtp = [...otp];
                newOtp[i] = val;
                setOtp(newOtp);
              }}
            />
          </View>
        ))}
      </View>
      <Text style={[styles.resendText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
        Resend code in <Text style={{ color: theme.primary }}>55</Text> s
      </Text>
    </>
  );

  const renderNewPassword = () => (
    <>
      <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
        Create your new password
      </Text>
      <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.textTertiary} />
        <TextInput style={[styles.input, { color: theme.text, fontFamily: 'Urbanist_400Regular' }]} placeholder="New Password" placeholderTextColor={theme.textTertiary} value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showNew} />
        <Pressable onPress={() => setShowNew(!showNew)}>
          <Ionicons name={showNew ? 'eye-outline' : 'eye-off-outline'} size={20} color={theme.textTertiary} />
        </Pressable>
      </View>
      <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.textTertiary} />
        <TextInput style={[styles.input, { color: theme.text, fontFamily: 'Urbanist_400Regular' }]} placeholder="Confirm Password" placeholderTextColor={theme.textTertiary} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirm} />
        <Pressable onPress={() => setShowConfirm(!showConfirm)}>
          <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={20} color={theme.textTertiary} />
        </Pressable>
      </View>
    </>
  );

  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <View style={[styles.successIcon, { backgroundColor: theme.primary }]}>
        <Ionicons name="checkmark" size={60} color="#fff" />
      </View>
      <Text style={[styles.successTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Password Changed!</Text>
      <Text style={[styles.successSub, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
        Your password has been changed successfully.
      </Text>
      <Pressable onPress={() => router.replace('/signin')} style={({ pressed }) => [styles.continueBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}>
        <Text style={[styles.continueBtnText, { fontFamily: 'Urbanist_700Bold' }]}>Back to Sign In</Text>
      </Pressable>
    </View>
  );

  const titles: Record<string, string> = {
    method: 'Forgot Password',
    otp: 'Forgot Password',
    newpass: 'Create New\nPassword',
    success: '',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: topPad + 16, paddingBottom: bottomPad + 20 }]} showsVerticalScrollIndicator={false}>
        {step !== 'success' && (
          <>
            <Pressable onPress={() => step === 'method' ? router.back() : setStep(step === 'otp' ? 'method' : 'otp')} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{titles[step]}</Text>
          </>
        )}
        {step === 'method' && renderMethod()}
        {step === 'otp' && renderOtp()}
        {step === 'newpass' && renderNewPassword()}
        {step === 'success' && renderSuccess()}
      </ScrollView>
      {step !== 'success' && (
        <View style={[styles.bottomBar, { paddingBottom: bottomPad + 12 }]}>
          <Pressable onPress={handleContinue} style={({ pressed }) => [styles.continueBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}>
            <Text style={[styles.continueBtnText, { fontFamily: 'Urbanist_700Bold' }]}>Continue</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, flex: 1 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 36, lineHeight: 44, marginTop: 16, marginBottom: 20 },
  subtitle: { fontSize: 16, lineHeight: 24, marginBottom: 24 },
  methodCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, borderWidth: 2, marginBottom: 16, gap: 16 },
  methodIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  methodInfo: { flex: 1 },
  methodLabel: { fontSize: 12, marginBottom: 4 },
  methodValue: { fontSize: 14 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24, marginTop: 16 },
  otpBox: { width: 64, height: 64, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  otpInput: { fontSize: 24, textAlign: 'center', width: '100%', height: '100%' },
  resendText: { fontSize: 16, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', height: 56, borderRadius: 16, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1 },
  input: { flex: 1, fontSize: 14, marginLeft: 12 },
  bottomBar: { paddingHorizontal: 24, paddingTop: 12 },
  continueBtn: { height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  continueBtnText: { fontSize: 16, color: '#fff' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  successIcon: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  successTitle: { fontSize: 28, marginBottom: 12 },
  successSub: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
});
