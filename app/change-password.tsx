import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { goBack } from '@/lib/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ChangePasswordScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError(t('password_length_error') || 'New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('passwords_not_match') || 'Passwords do not match');
      return;
    }
    if (!currentPassword) {
      setError(t('enter_current_password') || 'Please enter your current password');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('PUT', '/api/auth/change-password', {
        currentPassword, // Backend expects currentPassword
        newPassword,
      });
      setSuccess(t('password_changed_success') || 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setError(e.message || t('fail_change_password') || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    show: boolean,
    toggleShow: () => void,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold', textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
      <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TextInput
          value={value}
          onChangeText={onChange}
          secureTextEntry={!show}
          style={[styles.input, { color: theme.text, fontFamily: 'Urbanist_400Regular', textAlign: isRTL ? 'right' : 'left' }]}
          placeholderTextColor={theme.textTertiary}
          placeholder={label}
        />
        <Pressable onPress={toggleShow} hitSlop={8}>
          <Ionicons name={show ? 'eye-outline' : 'eye-off-outline'} size={20} color={theme.textTertiary} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => goBack()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('change_password')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: webBottomInset + 40, paddingHorizontal: 24 }}>
        {renderInput(t('current_password'), currentPassword, setCurrentPassword, showCurrent, () => setShowCurrent(!showCurrent))}
        {renderInput(t('new_password'), newPassword, setNewPassword, showNew, () => setShowNew(!showNew))}
        {renderInput(t('confirm_new_password'), confirmPassword, setConfirmPassword, showConfirm, () => setShowConfirm(!showConfirm))}

        {error ? (
          <Text style={[styles.feedback, { color: theme.error, fontFamily: 'Urbanist_500Medium' }]}>{error}</Text>
        ) : null}
        {success ? (
          <Text style={[styles.feedback, { color: theme.success, fontFamily: 'Urbanist_500Medium' }]}>{success}</Text>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={({ pressed }) => [
            styles.submitBtn,
            { backgroundColor: theme.primary, opacity: pressed || loading ? 0.7 : 1 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.submitText, { fontFamily: 'Urbanist_700Bold' }]}>{t('update_password')}</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 20, textAlign: 'center' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, marginBottom: 8 },
  inputContainer: { alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 52 },
  input: { flex: 1, fontSize: 15, height: '100%' },
  feedback: { fontSize: 14, marginBottom: 16, textAlign: 'center' },
  submitBtn: { height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 16 },
});
