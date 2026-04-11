import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

export default function SalonServices() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', duration: '', description: '' });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['salon-services'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/services');
      return res.json();
    },
  });

  const addService = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest('POST', '/api/salon/services', {
        name: data.name,
        price: parseFloat(data.price) || 0,
        duration: parseInt(data.duration) || 30,
        description: data.description,
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-services'] });
      setShowForm(false);
      setForm({ name: '', price: '', duration: '', description: '' });
    },
    onError: () => Alert.alert('خطأ', 'فشل إضافة الخدمة'),
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/salon/services/${id}`);
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salon-services'] }),
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>الخدمات</Text>
        <Pressable onPress={() => setShowForm(!showForm)} style={styles.addBtn}>
          <Ionicons name={showForm ? 'close' : 'add'} size={20} color="#181A20" />
          <Text style={styles.addBtnText}>{showForm ? 'إلغاء' : 'إضافة'}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>إضافة خدمة جديدة</Text>
            {[
              { key: 'name', placeholder: 'اسم الخدمة', icon: 'cut-outline' },
              { key: 'price', placeholder: 'السعر ($)', icon: 'cash-outline', numeric: true },
              { key: 'duration', placeholder: 'المدة (دقيقة)', icon: 'time-outline', numeric: true },
              { key: 'description', placeholder: 'الوصف', icon: 'document-text-outline' },
            ].map(f => (
              <View key={f.key} style={styles.inputRow}>
                <Ionicons name={f.icon as any} size={18} color="#888" />
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  placeholderTextColor="#555"
                  value={(form as any)[f.key]}
                  onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                  keyboardType={f.numeric ? 'numeric' : 'default'}
                />
              </View>
            ))}
            <Pressable
              onPress={() => addService.mutate(form)}
              style={styles.submitBtn}
              disabled={addService.isPending}
            >
              {addService.isPending ? (
                <ActivityIndicator size="small" color="#181A20" />
              ) : (
                <Text style={styles.submitBtnText}>إضافة الخدمة</Text>
              )}
            </Pressable>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
        ) : services.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="cut-outline" size={48} color={BORDER} />
            <Text style={styles.emptyText}>لا توجد خدمات</Text>
          </View>
        ) : (
          services.map((s: any) => (
            <View key={s.id} style={styles.card}>
              <View style={styles.iconBox}>
                <Ionicons name="cut-outline" size={22} color={PRIMARY} />
              </View>
              <View style={styles.info}>
                <Text style={styles.serviceName}>{s.name}</Text>
                <Text style={styles.serviceMeta}>{s.duration || 30} دقيقة • ${s.price}</Text>
              </View>
              <Pressable
                onPress={() => Alert.alert('حذف', `هل تريد حذف "${s.name}"؟`, [
                  { text: 'إلغاء', style: 'cancel' },
                  { text: 'حذف', style: 'destructive', onPress: () => deleteService.mutate(s.id) },
                ])}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </Pressable>
            </View>
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
  submitBtn: { backgroundColor: PRIMARY, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 15 },
  card: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 46, height: 46, borderRadius: 23, backgroundColor: `${PRIMARY}22`, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  serviceName: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 15, marginBottom: 4 },
  serviceMeta: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13 },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EF444422', alignItems: 'center', justifyContent: 'center' },
});
