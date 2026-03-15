import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const statusColor: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  completed: '#10B981',
  cancelled: '#EF4444',
};

const statusLabel: Record<string, string> = {
  all: 'الكل', pending: 'معلق', confirmed: 'مؤكد', completed: 'مكتمل', cancelled: 'ملغي',
};

export default function StaffAppointments() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['staff-bookings'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/staff/bookings');
      return res.json();
    },
  });

  const complete = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('PUT', `/api/staff/bookings/${id}`, { status: 'completed' });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff-bookings'] }),
    onError: () => Alert.alert('خطأ', 'فشل تحديث الحجز'),
  });

  const filtered = filter === 'all' ? bookings : bookings.filter((b: any) => b.status === filter);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.pageTitle}>حجوزاتي</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(f => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{statusLabel[f]}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="list-outline" size={48} color={BORDER} />
              <Text style={styles.emptyText}>لا توجد حجوزات</Text>
            </View>
          ) : (
            filtered.map((b: any) => (
              <View key={b.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.clientName}>{b.clientName || 'عميل'}</Text>
                    <Text style={styles.serviceName}>{b.serviceName || 'خدمة'}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: `${statusColor[b.status] || '#888'}22` }]}>
                    <Text style={[styles.badgeText, { color: statusColor[b.status] || '#888' }]}>{statusLabel[b.status] || b.status}</Text>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <View style={styles.meta}>
                    <Ionicons name="calendar-outline" size={13} color="#888" />
                    <Text style={styles.metaText}>{b.date || '—'}</Text>
                  </View>
                  <View style={styles.meta}>
                    <Ionicons name="time-outline" size={13} color="#888" />
                    <Text style={styles.metaText}>{b.time || '—'}</Text>
                  </View>
                  <View style={styles.meta}>
                    <Ionicons name="cash-outline" size={13} color="#888" />
                    <Text style={styles.metaText}>${b.totalPrice || 0}</Text>
                  </View>
                </View>
                {b.status === 'confirmed' && (
                  <Pressable
                    onPress={() => Alert.alert('إتمام الحجز', 'هل انتهيت من هذا الحجز؟', [
                      { text: 'إلغاء', style: 'cancel' },
                      { text: 'نعم', onPress: () => complete.mutate(b.id) },
                    ])}
                    style={styles.completeBtn}
                  >
                    <Ionicons name="checkmark-done-outline" size={16} color="#10B981" />
                    <Text style={styles.completeBtnText}>إتمام</Text>
                  </Pressable>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 24, paddingHorizontal: 20, marginTop: 8, marginBottom: 16 },
  filterRow: { paddingHorizontal: 20, gap: 8, marginBottom: 16, paddingBottom: 4 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD },
  filterBtnActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  filterText: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  filterTextActive: { color: '#181A20' },
  list: { paddingHorizontal: 20 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 15 },
  card: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 12 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardLeft: { flex: 1 },
  clientName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15, marginBottom: 2 },
  serviceName: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontFamily: 'Urbanist_600SemiBold', fontSize: 11 },
  metaRow: { flexDirection: 'row', gap: 14, marginBottom: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 12 },
  completeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#10B98122', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start' },
  completeBtnText: { color: '#10B981', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
});
