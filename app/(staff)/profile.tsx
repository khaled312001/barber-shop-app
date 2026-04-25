import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { apiRequest } from '@/lib/query-client';
import { useApp } from '@/contexts/AppContext';
import { useLanguage, type Language } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

export default function StaffProfile() {
  const insets = useSafeAreaInsets();
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { user, setUser, logout } = useApp();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    nickname: user?.nickname || '',
  });

  const save = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('PUT', '/api/staff/profile', form);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.user) setUser(data.user);
      if (Platform.OS === 'web') {
        alert(t('profile_updated_success') || 'Profile updated successfully');
      } else {
        Alert.alert(t('success'), t('profile_updated_success'));
      }
      setEditing(false);
    },
    onError: () => {
      if (Platform.OS === 'web') {
        alert(t('fail_update_profile') || 'Failed to update profile');
      } else {
        Alert.alert(t('error'), t('fail_update_profile'));
      }
    },
  });

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('confirm_logout') || 'Are you sure you want to logout?')) {
        await logout();
        router.replace('/signin');
      }
    } else {
      Alert.alert(t('logout'), t('confirm_logout'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('logout_btn') || 'Logout', style: 'destructive', onPress: async () => {
          await logout();
          router.replace('/signin');
        }},
      ]);
    }
  };

  const fields = [
    { key: 'fullName', label: t('full_name'), icon: 'person-outline' },
    { key: 'phone', label: t('phone_number'), icon: 'call-outline' },
    { key: 'nickname', label: t('nickname'), icon: 'happy-outline' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.pageTitle}>{t('staff_profile') || 'My Profile'}</Text>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Profile Card */}
        <LinearGradient
          colors={['rgba(244,164,96,0.18)', 'rgba(244,164,96,0.03)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color={PRIMARY} />
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </View>
          <Text style={styles.userName} numberOfLines={1}>{user?.fullName}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <MaterialCommunityIcons name="content-cut" size={12} color={PRIMARY} />
            <Text style={styles.roleText}>{t('staff_member') || 'Staff / Barber'}</Text>
          </View>
        </LinearGradient>

        {/* Edit Form */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('account_data')}</Text>
            <Pressable onPress={() => setEditing(!editing)}>
              <Ionicons name={editing ? 'close-outline' : 'create-outline'} size={22} color={PRIMARY} />
            </Pressable>
          </View>

          {fields.map(f => (
            <View key={f.key} style={styles.field}>
              <View style={styles.fieldLabelRow}>
                <Ionicons name={f.icon as any} size={15} color="#888" />
                <Text style={styles.fieldLabel}>{f.label}</Text>
              </View>
              {editing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={(form as any)[f.key]}
                  onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                  placeholderTextColor="#555"
                />
              ) : (
                <Text style={styles.fieldValue}>{(user as any)?.[f.key] || '—'}</Text>
              )}
            </View>
          ))}

          {editing && (
            <Pressable
              onPress={() => save.mutate()}
              style={styles.saveBtn}
              disabled={save.isPending}
            >
              {save.isPending ? (
                <ActivityIndicator size="small" color="#181A20" />
              ) : (
                <Text style={styles.saveBtnText}>{t('save_changes')}</Text>
              )}
            </Pressable>
          )}
        </View>

        {/* Stats — gradient cards */}
        <View style={styles.statsRow}>
          <LinearGradient
            colors={['rgba(245,158,11,0.2)', 'rgba(245,158,11,0.04)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.statCard, { borderColor: '#F59E0B30' }]}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#F59E0B' }]}>
              <Ionicons name="star" size={16} color="#fff" />
            </View>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>{t('rating') || 'Rating'}</Text>
          </LinearGradient>
          <LinearGradient
            colors={['rgba(59,130,246,0.2)', 'rgba(59,130,246,0.04)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.statCard, { borderColor: '#3B82F630' }]}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#3B82F6' }]}>
              <Ionicons name="calendar" size={16} color="#fff" />
            </View>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>{t('this_month') || 'This Month'}</Text>
          </LinearGradient>
          <LinearGradient
            colors={['rgba(16,185,129,0.2)', 'rgba(16,185,129,0.04)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.statCard, { borderColor: '#10B98130' }]}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#10B981' }]}>
              <Ionicons name="checkmark-done" size={16} color="#fff" />
            </View>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>{t('status_completed') || 'Completed'}</Text>
          </LinearGradient>
        </View>

        {/* Language Switcher */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('language') || 'Language'}</Text>
            <Ionicons name="language-outline" size={20} color={PRIMARY} />
          </View>
          <View style={styles.langRow}>
            {([
              { code: 'en' as Language, label: 'English', short: 'EN' },
              { code: 'ar' as Language, label: 'العربية', short: 'AR' },
              { code: 'de' as Language, label: 'Deutsch', short: 'DE' },
            ]).map(lang => {
              const active = language === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => setLanguage(lang.code)}
                  style={({ pressed }) => [styles.langBtn, active && styles.langBtnActive, pressed && { opacity: 0.85 }]}
                >
                  <View style={[styles.langBadge, { backgroundColor: active ? PRIMARY : 'rgba(244,164,96,0.15)' }]}>
                    <Text style={[styles.langBadgeText, { color: active ? '#181A20' : PRIMARY }]}>{lang.short}</Text>
                  </View>
                  <Text style={[styles.langLabel, active && styles.langLabelActive]}>{lang.label}</Text>
                  {active && <Ionicons name="checkmark-circle" size={18} color={PRIMARY} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Logout */}
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 24, paddingHorizontal: 20, marginTop: 8, marginBottom: 20 },
  content: { paddingHorizontal: 20 },

  heroCard: { alignItems: 'center', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(244,164,96,0.2)', marginBottom: 20 },
  avatarCircle: { width: 96, height: 96, borderRadius: 28, backgroundColor: `${PRIMARY}22`, alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 2, borderColor: PRIMARY, position: 'relative' },
  avatarEditBadge: { position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: 14, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: BG },
  userName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20, marginBottom: 4 },
  userEmail: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13, marginBottom: 10 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(244,164,96,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(244,164,96,0.3)' },
  roleText: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 11, letterSpacing: 0.5 },

  section: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 20, marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  field: { marginBottom: 14 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  fieldLabel: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldValue: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 15, paddingVertical: 6 },
  fieldInput: { color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 15, backgroundColor: '#13151B', borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: 12 },
  saveBtn: { backgroundColor: PRIMARY, borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 6, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 15 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 16, borderWidth: 1, padding: 14, alignItems: 'flex-start', gap: 8 },
  statIconBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20 },
  statLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 11 },

  langRow: { gap: 8 },
  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#13151B', borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  langBtnActive: { borderColor: PRIMARY, backgroundColor: `${PRIMARY}12` },
  langBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, minWidth: 40, alignItems: 'center' },
  langBadgeText: { fontFamily: 'Urbanist_700Bold', fontSize: 11 },
  langLabel: { flex: 1, color: '#ccc', fontFamily: 'Urbanist_600SemiBold', fontSize: 14 },
  langLabelActive: { color: '#fff' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  logoutText: { color: '#EF4444', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
});
