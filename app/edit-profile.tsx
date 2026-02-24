import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { DEFAULT_AVATAR } from '@/constants/images';
import { apiRequest } from '@/lib/query-client';

export default function EditProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useApp();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [gender, setGender] = useState(user?.gender ?? '');
  const [dob, setDob] = useState(user?.dob ?? '');
  const [saving, setSaving] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;
  const bottomPad = Platform.OS === 'web' ? webBottomInset : insets.bottom;

  const cycleGender = () => {
    const options = ['Male', 'Female', 'Other'];
    const idx = options.indexOf(gender);
    setGender(options[(idx + 1) % options.length]);
  };

  const formatDobInput = (text: string) => {
    const digits = text.replace(/\D/g, '');
    let formatted = '';
    if (digits.length > 0) formatted = digits.substring(0, 2);
    if (digits.length > 2) formatted += '/' + digits.substring(2, 4);
    if (digits.length > 4) formatted += '/' + digits.substring(4, 8);
    setDob(formatted);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await apiRequest('PUT', '/api/auth/profile', { fullName, nickname, phone, gender, dob });
      const data = await res.json();
      setUser(data.user || data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}>
        <View style={styles.avatarSection}>
          <Image source={user?.avatar ? { uri: user.avatar } : DEFAULT_AVATAR} style={styles.avatar} contentFit="cover" />
          <Pressable style={[styles.editAvatarBtn, { backgroundColor: theme.primary }]}>
            <Ionicons name="camera" size={18} color="#fff" />
          </Pressable>
        </View>

        <Text style={[styles.label, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>Full Name</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <TextInput
            style={[styles.input, { color: theme.text, fontFamily: 'Urbanist_400Regular' }]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full Name"
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        <Text style={[styles.label, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>Nickname</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <TextInput
            style={[styles.input, { color: theme.text, fontFamily: 'Urbanist_400Regular' }]}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Nickname"
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        <Text style={[styles.label, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>Email</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.surfaceAlt, borderColor: theme.inputBorder, opacity: 0.7 }]}>
          <Ionicons name="mail-outline" size={20} color={theme.textTertiary} />
          <TextInput
            style={[styles.input, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}
            value={user?.email ?? ''}
            editable={false}
            selectTextOnFocus={false}
          />
          <Ionicons name="lock-closed" size={18} color={theme.textTertiary} />
        </View>

        <Text style={[styles.label, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>Phone Number</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Text style={{ fontSize: 18 }}>🇺🇸</Text>
          <TextInput
            style={[styles.input, { color: theme.text, fontFamily: 'Urbanist_400Regular' }]}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+1 (555) 000-0000"
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        <Text style={[styles.label, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>Gender</Text>
        <View style={styles.genderRow}>
          {['Male', 'Female', 'Other'].map(g => (
            <Pressable
              key={g}
              onPress={() => setGender(g)}
              style={[styles.genderChip, { backgroundColor: gender === g ? theme.primary : theme.surface, borderColor: gender === g ? theme.primary : theme.border }]}
            >
              <Text style={[styles.genderText, { color: gender === g ? '#fff' : theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{g}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>Date of Birth</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Ionicons name="calendar-outline" size={20} color={theme.textTertiary} />
          <TextInput
            style={[styles.input, { color: theme.text, fontFamily: 'Urbanist_400Regular' }]}
            value={dob}
            onChangeText={formatDobInput}
            keyboardType="number-pad"
            placeholder="MM/DD/YYYY"
            placeholderTextColor={theme.textTertiary}
            maxLength={10}
          />
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 12, backgroundColor: theme.background, borderTopColor: theme.borderLight }]}>
        <Pressable onPress={handleSave} disabled={saving} style={({ pressed }) => [styles.saveBtn, { backgroundColor: theme.primary, opacity: saving ? 0.7 : pressed ? 0.9 : 1 }]}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.saveBtnText, { fontFamily: 'Urbanist_700Bold' }]}>Update Profile</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 20, textAlign: 'center' },
  content: { paddingHorizontal: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: '35%', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, marginBottom: 8, marginTop: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', height: 56, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, gap: 10 },
  input: { flex: 1, fontSize: 14 },
  genderRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  genderChip: { flex: 1, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  genderText: { fontSize: 14 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 12, borderTopWidth: 1 },
  saveBtn: { height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 16, color: '#fff' },
});
