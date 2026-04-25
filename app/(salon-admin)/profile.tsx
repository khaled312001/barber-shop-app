import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { apiRequest } from '@/lib/query-client';
import { useApp } from '@/contexts/AppContext';
import { useLanguage, type Language } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

export default function SalonProfile() {
  const insets = useSafeAreaInsets();
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { user, logout } = useApp();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', description: '' });

  const { data: salon, isLoading } = useQuery({
    queryKey: ['my-salon'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/me');
      const data = await res.json();
      setForm({
        name: data.name || '',
        phone: data.phone || '',
        address: data.address || '',
        description: data.description || '',
      });
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('PUT', '/api/salon/me', form);
      return res.json();
    },
    onSuccess: () => {
      Alert.alert(t('success'), t('settings_saved_success'));
      setEditing(false);
    },
    onError: () => Alert.alert(t('error'), t('failed_save_settings')),
  });

  const fields = [
    { key: 'name', label: t('salon_name_label'), icon: 'business-outline' },
    { key: 'phone', label: t('phone'), icon: 'call-outline' },
    { key: 'whatsappNumber', label: 'WhatsApp', icon: 'logo-whatsapp' },
    { key: 'address', label: t('salon_address_label'), icon: 'location-outline' },
    { key: 'description', label: t('description'), icon: 'document-text-outline' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.pageTitle}>{t('settings')}</Text>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Info */}
        <View style={styles.card}>
          <View style={styles.userIconBox}>
            <Ionicons name="person" size={28} color={PRIMARY} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Salon Admin</Text>
            </View>
          </View>
        </View>

        {/* Salon Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('salon_data')}</Text>
            <Pressable onPress={() => setEditing(!editing)}>
              <Ionicons name={editing ? 'close-outline' : 'create-outline'} size={22} color={PRIMARY} />
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color={PRIMARY} />
          ) : (
            fields.map(f => (
              <View key={f.key} style={styles.field}>
                <View style={styles.fieldLabel}>
                  <Ionicons name={f.icon as any} size={16} color="#888" />
                  <Text style={styles.fieldLabelText}>{f.label}</Text>
                </View>
                {editing ? (
                  <TextInput
                    style={styles.fieldInput}
                    value={(form as any)[f.key]}
                    onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                    placeholderTextColor="#555"
                  />
                ) : (
                  <Text style={styles.fieldValue}>{(salon as any)?.[f.key] || '—'}</Text>
                )}
              </View>
            ))
          )}

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

        {/* Language Switcher */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('language') || 'Language'}</Text>
            <Ionicons name="language-outline" size={20} color={PRIMARY} />
          </View>
          <View style={styles.langRow}>
            {([
              { code: 'en' as Language, label: 'English', flag: '🇺🇸' },
              { code: 'ar' as Language, label: 'العربية', flag: '🇸🇦' },
              { code: 'de' as Language, label: 'Deutsch', flag: '🇩🇪' },
            ]).map(lang => (
              <Pressable
                key={lang.code}
                onPress={() => setLanguage(lang.code)}
                style={[styles.langBtn, language === lang.code && styles.langBtnActive]}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.langLabel, language === lang.code && styles.langLabelActive]}>{lang.label}</Text>
                {language === lang.code && <Ionicons name="checkmark-circle" size={16} color={PRIMARY} />}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Logout */}
        <Pressable
          onPress={async () => {
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
          }}
          style={styles.logoutBtn}
        >
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
  card: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  userIconBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: `${PRIMARY}22`, alignItems: 'center', justifyContent: 'center' },
  userInfo: { flex: 1 },
  userName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18, marginBottom: 2 },
  userEmail: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginBottom: 8 },
  roleBadge: { backgroundColor: `${PRIMARY}22`, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  roleText: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 11 },
  section: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 20, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  field: { marginBottom: 14 },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  fieldLabelText: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 12 },
  fieldValue: { color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 15 },
  fieldInput: { color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 15, backgroundColor: '#13151B', borderRadius: 10, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 12, paddingVertical: 10 },
  saveBtn: { backgroundColor: PRIMARY, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  langRow: { gap: 8 },
  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#13151B', borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 16, paddingVertical: 12, marginBottom: 0,
  },
  langBtnActive: { borderColor: PRIMARY, backgroundColor: `${PRIMARY}12` },
  langFlag: { fontSize: 20 },
  langLabel: { flex: 1, color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 14 },
  langLabelActive: { color: '#fff' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#EF444422', borderRadius: 14, padding: 16, marginTop: 4 },
  logoutText: { color: '#EF4444', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
});
