import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
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

export default function SalonAppointments() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['salon-bookings'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/bookings');
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest('PUT', `/api/salon/bookings/${id}`, { status });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salon-bookings'] }),
    onError: () => Alert.alert('خطأ', 'فشل تحديث الحجز'),
  });

  const filtered = filter === 'all' ? bookings : bookings.filter((b: any) => b.status === filter);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.pageTitle}>الحجوزات</Text>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(f => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'الكل' : f === 'pending' ? 'معلق' : f === 'confirmed' ? 'مؤكد' : f === 'completed' ? 'مكتمل' : 'ملغي'}
            </Text>
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
              <Ionicons name="calendar-outline" size={48} color={BORDER} />
              <Text style={styles.emptyText}>لا توجد حجوزات</Text>
            </View>
          ) : (
            filtered.map((b: any) => (
              <View key={b.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.clientName}>{b.clientName || 'عميل'}</Text>
                    <Text style={styles.serviceName}>{b.serviceName || 'خدمة'}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: `${statusColor[b.status] || '#888'}22` }]}>
                    <Text style={[styles.badgeText, { color: statusColor[b.status] || '#888' }]}>{b.status}</Text>
                  </View>
                </View>
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color="#888" />
                    <Text style={styles.metaText}>{b.date || '—'}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color="#888" />
                    <Text style={styles.metaText}>{b.time || '—'}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="cash-outline" size={14} color="#888" />
                    <Text style={styles.metaText}>${b.totalPrice || 0}</Text>
                  </View>
                </View>
                {/* Actions */}
                {b.status === 'pending' && (
                  <View style={styles.actions}>
                    <Pressable
                      style={[styles.actionBtn, { backgroundColor: '#3B82F622' }]}
                      onPress={() => updateStatus.mutate({ id: b.id, status: 'confirmed' })}
                    >
                      <Ionicons name="checkmark-circle-outline" size={16} color="#3B82F6" />
                      <Text style={[styles.actionText, { color: '#3B82F6' }]}>تأكيد</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionBtn, { backgroundColor: '#EF444422' }]}
                      onPress={() => updateStatus.mutate({ id: b.id, status: 'cancelled' })}
                    >
                      <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
                      <Text style={[styles.actionText, { color: '#EF4444' }]}>إلغاء</Text>
                    </Pressable>
                  </View>
                )}
                {b.status === 'confirmed' && (
                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: '#10B98122', alignSelf: 'flex-start' }]}
                    onPress={() => updateStatus.mutate({ id: b.id, status: 'completed' })}
                  >
                    <Ionicons name="checkmark-done-outline" size={16} color="#10B981" />
                    <Text style={[styles.actionText, { color: '#10B981' }]}>إتمام</Text>
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
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 24, paddingHorizontal: 20, marginBottom: 16, marginTop: 8 },
  filterRow: { paddingHorizontal: 20, gap: 8, marginBottom: 16, paddingBottom: 4 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD },
  filterBtnActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  filterText: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  filterTextActive: { color: '#181A20' },
  list: { paddingHorizontal: 20 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 15 },
  card: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  clientName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16, marginBottom: 2 },
  serviceName: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontFamily: 'Urbanist_600SemiBold', fontSize: 11, textTransform: 'capitalize' },
  cardMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  actionText: { fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
});
