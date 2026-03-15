import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';
import { useApp } from '@/contexts/AppContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

export default function StaffProfile() {
  const insets = useSafeAreaInsets();
  const { user, setUser, logout } = useApp();
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
      Alert.alert('تم', 'تم حفظ بياناتك');
      setEditing(false);
    },
    onError: () => Alert.alert('خطأ', 'فشل حفظ البيانات'),
  });

  const fields = [
    { key: 'fullName', label: 'الاسم الكامل', icon: 'person-outline' },
    { key: 'phone', label: 'رقم الهاتف', icon: 'call-outline' },
    { key: 'nickname', label: 'اللقب', icon: 'happy-outline' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.pageTitle}>ملفي الشخصي</Text>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar & Info */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={44} color={PRIMARY} />
          </View>
          <Text style={styles.userName}>{user?.fullName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="cut-outline" size={12} color={PRIMARY} />
            <Text style={styles.roleText}>Staff / Barber</Text>
          </View>
        </View>

        {/* Edit Form */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>بيانات الحساب</Text>
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
                <Text style={styles.saveBtnText}>حفظ التغييرات</Text>
              )}
            </Pressable>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>التقييم</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>هذا الشهر</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>مكتمل</Text>
          </View>
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
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: `${PRIMARY}22`, alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 2, borderColor: PRIMARY },
  userName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20, marginBottom: 4 },
  userEmail: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 14, marginBottom: 10 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: `${PRIMARY}22`, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  roleText: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 12 },
  section: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 20, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  field: { marginBottom: 16 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  fieldLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 12 },
  fieldValue: { color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 15 },
  fieldInput: { color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 15, backgroundColor: '#13151B', borderRadius: 10, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 12, paddingVertical: 10 },
  saveBtn: { backgroundColor: PRIMARY, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  saveBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, alignItems: 'center', gap: 6 },
  statValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20 },
  statLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 11, textAlign: 'center' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#EF444422', borderRadius: 14, padding: 16 },
  logoutText: { color: '#EF4444', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
});
