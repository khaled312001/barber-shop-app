import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, Image, Modal, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

export default function SalonStaff() {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', staffRole: 'barber' });

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['salon-staff'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/staff');
      return res.json();
    },
  });

  const addStaff = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest('POST', '/api/salon/staff', data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-staff'] });
      setShowForm(false);
      setForm({ fullName: '', email: '', password: '', staffRole: 'barber' });
    },
    onError: () => Alert.alert(t('error'), t('failed_add_staff')),
  });

  const updateStaff = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PUT', `/api/salon/staff/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-staff'] });
      setShowForm(false);
      setEditing(null);
      setForm({ fullName: '', email: '', password: '', staffRole: 'barber' });
    },
  });

  const removeStaff = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/salon/staff/${id}`);
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salon-staff'] }),
    onError: () => Alert.alert(t('error'), t('failed_delete_staff')),
  });

  const handleAdd = () => {
    if (editing) {
      // Edit mode - password is optional
      if (!form.fullName || !form.email) {
        Alert.alert(t('warning'), t('fill_all_fields'));
        return;
      }
      const data: any = { fullName: form.fullName, email: form.email, staffRole: form.staffRole };
      if (form.password) data.password = form.password;
      updateStaff.mutate({ id: editing.id, data });
      return;
    }
    if (!form.fullName || !form.email || !form.password) {
      Alert.alert(t('warning'), t('fill_all_fields'));
      return;
    }
    addStaff.mutate(form);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>{t('staff_title')}</Text>
        <Pressable onPress={() => {
          if (showForm) { setShowForm(false); setEditing(null); setForm({ fullName: '', email: '', password: '', staffRole: 'barber' }); }
          else { setEditing(null); setShowForm(true); }
        }} style={styles.addBtn}>
          <Ionicons name={showForm ? 'close' : 'add'} size={20} color="#181A20" />
          <Text style={styles.addBtnText}>{showForm ? t('cancel') : t('add')}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Add Form */}
        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>{editing ? (t('edit_staff') || 'Edit Staff') : t('add_staff_form')}</Text>
            {[
              { key: 'fullName', placeholder: t('full_name'), icon: 'person-outline' },
              { key: 'email', placeholder: t('staff_email'), icon: 'mail-outline' },
              { key: 'password', placeholder: t('staff_password'), icon: 'lock-closed-outline' },
            ].map(field => (
              <View key={field.key} style={styles.inputRow}>
                <Ionicons name={field.icon as any} size={18} color="#888" />
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor="#555"
                  value={(form as any)[field.key]}
                  onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                  secureTextEntry={field.key === 'password'}
                  autoCapitalize="none"
                />
              </View>
            ))}

            <View style={styles.roleRow}>
              {['barber', 'receptionist', 'manager'].map(role => (
                <Pressable
                  key={role}
                  onPress={() => setForm(f => ({ ...f, staffRole: role }))}
                  style={[styles.roleChip, form.staffRole === role && styles.roleChipActive]}
                >
                  <Text style={[styles.roleChipText, form.staffRole === role && styles.roleChipTextActive]}>
                    {role === 'barber' ? t('role_barber') : role === 'receptionist' ? t('role_receptionist') : t('role_manager')}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleAdd}
              style={styles.submitBtn}
              disabled={addStaff.isPending}
            >
              {(addStaff.isPending || updateStaff.isPending) ? (
                <ActivityIndicator size="small" color="#181A20" />
              ) : (
                <Text style={styles.submitBtnText}>{editing ? (t('save_changes') || 'Save Changes') : t('add_staff_btn')}</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Staff List */}
        {isLoading ? (
          <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
        ) : staff.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={BORDER} />
            <Text style={styles.emptyText}>{t('no_staff_salon')}</Text>
          </View>
        ) : (
          staff.map((s: any) => (
            <Pressable
              key={s.id}
              onPress={() => {
                if (Platform.OS === 'web') {
                  window.location.href = `/staff-profile?id=${s.id}`;
                }
              }}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.96 }]}
            >
              <Image
                source={{ uri: s.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop' }}
                style={styles.avatar}
              />
              <View style={styles.info}>
                <Text style={styles.staffName}>{s.fullName}</Text>
                <Text style={styles.staffEmail}>{s.email}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{s.staffRole || s.role || 'barber'}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Pressable
                  onPress={(e: any) => {
                    e.stopPropagation?.();
                    setEditing(s);
                    setForm({ fullName: s.fullName, email: s.email, password: '', staffRole: s.staffRole || s.role || 'barber' });
                    setShowForm(true);
                  }}
                  style={styles.editBtn}
                >
                  <Ionicons name="create-outline" size={18} color={PRIMARY} />
                </Pressable>
                <Pressable
                  onPress={(e: any) => {
                    e.stopPropagation?.();
                    if (Platform.OS === 'web') {
                      if (window.confirm(`${t('delete_staff')}\n${t('delete_staff_confirm_salon')}`)) removeStaff.mutate(s.linkId || s.id);
                    } else {
                      Alert.alert(t('delete_staff'), t('delete_staff_confirm_salon'), [
                        { text: t('cancel'), style: 'cancel' },
                        { text: t('delete'), style: 'destructive', onPress: () => removeStaff.mutate(s.linkId || s.id) },
                      ]);
                    }
                  }}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 8, marginBottom: 16 },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 24 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PRIMARY, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  addBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 14 },
  content: { paddingHorizontal: 20 },
  form: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 20, marginBottom: 20 },
  formTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16, marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#13151B', borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, marginBottom: 12, gap: 10 },
  input: { flex: 1, height: 48, color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 14 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  roleChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: BORDER },
  roleChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  roleChipText: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  roleChipTextActive: { color: '#181A20' },
  submitBtn: { backgroundColor: PRIMARY, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 15 },
  card: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: BORDER },
  info: { flex: 1 },
  staffName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15, marginBottom: 2 },
  staffEmail: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 12, marginBottom: 6 },
  roleBadge: { backgroundColor: `${PRIMARY}22`, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  roleBadgeText: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 11, textTransform: 'capitalize' },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EF444422', alignItems: 'center', justifyContent: 'center' },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: `${PRIMARY}22`, alignItems: 'center', justifyContent: 'center' },
});
