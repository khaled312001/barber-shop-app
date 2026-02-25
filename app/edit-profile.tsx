import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DEFAULT_AVATAR } from '@/constants/images';
import { apiRequest } from '@/lib/query-client';

export default function EditProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useApp();
  const { t, isRTL } = useLanguage();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [gender, setGender] = useState(user?.gender ?? '');
  const [dob, setDob] = useState(user?.dob ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [saving, setSaving] = useState(false);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;
  const bottomPad = Platform.OS === 'web' ? webBottomInset : insets.bottom;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    if (!fullName) {
      Alert.alert(t('error'), t('full_name_required') || 'Full name is required');
      return;
    }

    setSaving(true);
    try {
      const res = await apiRequest('PUT', '/api/auth/profile', {
        fullName, nickname, phone, gender, dob, avatar
      });
      const data = await res.json();
      setUser(data.user || data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('success'), t('profile_updated_success') || 'Profile updated successfully!');
      router.back();
    } catch (e: any) {
      Alert.alert(t('error'), e?.message || t('fail_update_profile') || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('edit_profile')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}>
        <View style={styles.avatarSection}>
          <Image source={avatar ? { uri: avatar } : DEFAULT_AVATAR} style={styles.avatar} contentFit="cover" />
          <Pressable onPress={pickImage} style={[styles.editAvatarBtn, { backgroundColor: theme.primary, right: isRTL ? undefined : '35%', left: isRTL ? '35%' : undefined }]}>
            <Ionicons name="camera" size={18} color="#fff" />
          </Pressable>
        </View>

        <Text style={[styles.label, { color: theme.text, fontFamily: 'Urbanist_600SemiBold', textAlign: isRTL ? 'right' : 'left' }]}>{t('full_name')}</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TextInput
            style={[styles.input, { color: theme.text, fontFamily: 'Urbanist_400Regular', textAlign: isRTL ? 'right' : 'left' }]}
            value={fullName}
            onChangeText={setFullName}
            placeholder={t('full_name')}
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        <Text style={[styles.label, { color: theme.text, fontFamily: 'Urbanist_600SemiBold', textAlign: isRTL ? 'right' : 'left' }]}>{t('nickname')}</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TextInput
            style={[styles.input, { color: theme.text, fontFamily: 'Urbanist_400Regular', textAlign: isRTL ? 'right' : 'left' }]}
            value={nickname}
            onChangeText={setNickname}
            placeholder={t('nickname')}
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        <Text style={[styles.label, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold', textAlign: isRTL ? 'right' : 'left' }]}>{t('email')}</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.surfaceAlt, borderColor: theme.inputBorder, opacity: 0.7, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="mail-outline" size={20} color={theme.textTertiary} />
          <TextInput
            style={[styles.input, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular', textAlign: isRTL ? 'right' : 'left' }]}
            value={user?.email ?? ''}
            editable={false}
            selectTextOnFocus={false}
          />
          <Ionicons name="lock-closed" size={18} color={theme.textTertiary} />
        </View>

        <Text style={[styles.label, { color: theme.text, fontFamily: 'Urbanist_600SemiBold', textAlign: isRTL ? 'right' : 'left' }]}>{t('phone_number')}</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={{ fontSize: 18 }}>🇺🇸</Text>
          <TextInput
            style={[styles.input, { color: theme.text, fontFamily: 'Urbanist_400Regular', textAlign: isRTL ? 'right' : 'left' }]}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+1 (555) 000-0000"
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        <Text style={[styles.label, { color: theme.text, fontFamily: 'Urbanist_600SemiBold', textAlign: isRTL ? 'right' : 'left' }]}>{t('gender')}</Text>
        <View style={[styles.genderRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {[t('male') || 'Male', t('female') || 'Female', t('other') || 'Other'].map(g => (
            <Pressable
              key={g}
              onPress={() => setGender(g)}
              style={[styles.genderChip, { backgroundColor: (gender === g || (g === 'Male' && gender === 'Male') || (g === 'Female' && gender === 'Female')) ? theme.primary : theme.surface, borderColor: theme.border }]}
            >
              <Text style={[styles.genderText, { color: (gender === g) ? '#fff' : theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{g}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.text, fontFamily: 'Urbanist_600SemiBold', textAlign: isRTL ? 'right' : 'left' }]}>{t('dob')}</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="calendar-outline" size={20} color={theme.textTertiary} />
          <TextInput
            style={[styles.input, { color: theme.text, fontFamily: 'Urbanist_400Regular', textAlign: isRTL ? 'right' : 'left' }]}
            value={dob}
            onChangeText={setDob}
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
            <Text style={[styles.saveBtnText, { fontFamily: 'Urbanist_700Bold' }]}>{t('update_profile')}</Text>
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
