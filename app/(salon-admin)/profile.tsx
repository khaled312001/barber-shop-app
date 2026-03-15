import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';
import { useApp } from '@/contexts/AppContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

export default function SalonProfile() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useApp();
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
      Alert.alert('تم', 'تم حفظ إعدادات الصالون');
      setEditing(false);
    },
    onError: () => Alert.alert('خطأ', 'فشل حفظ الإعدادات'),
  });

  const fields = [
    { key: 'name', label: 'اسم الصالون', icon: 'business-outline' },
    { key: 'phone', label: 'رقم الهاتف', icon: 'call-outline' },
    { key: 'address', label: 'العنوان', icon: 'location-outline' },
    { key: 'description', label: 'الوصف', icon: 'document-text-outline' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.pageTitle}>الإعدادات</Text>

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
            <Text style={styles.sectionTitle}>بيانات الصالون</Text>
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
                <Text style={styles.saveBtnText}>حفظ التغييرات</Text>
              )}
            </Pressable>
          )}
        </View>

        {/* Logout */}
        <Pressable
          onPress={() => Alert.alert('تسجيل خروج', 'هل تريد تسجيل الخروج؟', [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'خروج', style: 'destructive', onPress: logout },
          ])}
          style={styles.logoutBtn}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
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
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#EF444422', borderRadius: 14, padding: 16, marginTop: 4 },
  logoutText: { color: '#EF4444', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
});
