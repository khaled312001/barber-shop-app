import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';

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

const statusIcon: Record<string, any> = {
  pending: 'time-outline',
  confirmed: 'checkmark-circle-outline',
  completed: 'checkmark-done-circle',
  cancelled: 'close-circle-outline',
};

const STATUS_KEYS: Record<string, string> = {
  all: 'all', pending: 'status_pending', confirmed: 'status_confirmed', completed: 'status_completed', cancelled: 'status_cancelled',
};

function confirmAction(title: string, msg: string, okLabel: string, cancelLabel: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${msg}`)) onOk();
  } else {
    Alert.alert(title, msg, [
      { text: cancelLabel, style: 'cancel' },
      { text: okLabel, onPress: onOk },
    ]);
  }
}

export default function StaffAppointments() {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const statusLabel = Object.fromEntries(Object.entries(STATUS_KEYS).map(([k, v]) => [k, t(v as any)]));

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
    onError: () => {
      if (Platform.OS === 'web') window.alert(t('failed_update_booking'));
      else Alert.alert(t('error'), t('failed_update_booking'));
    },
  });

  const filtered = filter === 'all' ? bookings : bookings.filter((b: any) => b.status === filter);
  const counts: Record<string, number> = {
    all: bookings.length,
    pending: bookings.filter((b: any) => b.status === 'pending').length,
    confirmed: bookings.filter((b: any) => b.status === 'confirmed').length,
    completed: bookings.filter((b: any) => b.status === 'completed').length,
    cancelled: bookings.filter((b: any) => b.status === 'cancelled').length,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>{t('my_appointments')}</Text>
          <Text style={styles.pageSubtitle}>{bookings.length} {t('total') || 'total'}</Text>
        </View>
        <View style={styles.iconBadge}>
          <Ionicons name="calendar" size={22} color={PRIMARY} />
        </View>
      </View>

      <View style={styles.filterScrollWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => {
            const active = filter === f;
            const color = f === 'all' ? PRIMARY : statusColor[f] || PRIMARY;
            const icon = f === 'all' ? 'view-grid' : (f === 'pending' ? 'clock-outline' : f === 'confirmed' ? 'check-circle-outline' : f === 'completed' ? 'check-all' : 'close-circle-outline');
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={({ pressed }) => [
                  styles.filterBtn,
                  active && { backgroundColor: color, borderColor: color },
                  !active && { borderColor: color + '40' },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <MaterialCommunityIcons name={icon as any} size={14} color={active ? '#fff' : color} />
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{statusLabel[f]}</Text>
                {counts[f] > 0 && (
                  <View style={[styles.countPill, active && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                    <Text style={[styles.countPillText, active && { color: '#fff' }]}>{counts[f]}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="calendar-outline" size={40} color={PRIMARY} />
              </View>
              <Text style={styles.emptyTitle}>{t('no_bookings_staff') && t('no_bookings_staff') !== 'no_bookings_staff' ? t('no_bookings_staff') : 'No bookings'}</Text>
              <Text style={styles.emptySub}>{t('new_bookings_here') && t('new_bookings_here') !== 'new_bookings_here' ? t('new_bookings_here') : 'New bookings will appear here.'}</Text>
            </View>
          ) : (
            filtered.map((b: any) => {
              const color = statusColor[b.status] || '#888';
              return (
                <View key={b.id} style={styles.card}>
                  <View style={[styles.statusStrip, { backgroundColor: color }]} />
                  <View style={styles.cardBody}>
                    <View style={styles.cardRow}>
                      <View style={styles.cardLeft}>
                        <Text style={styles.clientName} numberOfLines={1}>{b.clientName || t('client_label')}</Text>
                        <Text style={styles.serviceName} numberOfLines={1}>{b.serviceName || t('service_label')}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
                        <Ionicons name={statusIcon[b.status] || 'ellipse-outline'} size={11} color={color} />
                        <Text style={[styles.badgeText, { color }]}>{statusLabel[b.status] || b.status}</Text>
                      </View>
                    </View>

                    <View style={styles.metaRow}>
                      <View style={styles.metaChip}>
                        <Ionicons name="calendar-outline" size={13} color={PRIMARY} />
                        <Text style={styles.metaText}>{b.date || '—'}</Text>
                      </View>
                      <View style={styles.metaChip}>
                        <Ionicons name="time-outline" size={13} color={PRIMARY} />
                        <Text style={styles.metaText}>{b.time || '—'}</Text>
                      </View>
                      <View style={[styles.metaChip, styles.priceChip]}>
                        <MaterialCommunityIcons name="currency-usd" size={13} color="#10B981" />
                        <Text style={[styles.metaText, { color: '#10B981', fontFamily: 'Urbanist_700Bold' }]}>{b.totalPrice || 0}</Text>
                      </View>
                    </View>

                    {b.status === 'confirmed' && (
                      <Pressable
                        onPress={() => confirmAction(
                          t('complete_booking'),
                          t('complete_booking_confirm'),
                          t('yes'),
                          t('cancel'),
                          () => complete.mutate(b.id),
                        )}
                        style={({ pressed }) => [styles.completeBtn, pressed && { opacity: 0.8 }]}
                      >
                        <Ionicons name="checkmark-done" size={16} color="#10B981" />
                        <Text style={styles.completeBtnText}>{t('complete')}</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 8, marginBottom: 18 },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 24 },
  pageSubtitle: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13, marginTop: 2 },
  iconBadge: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(244,164,96,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(244,164,96,0.3)' },

  filterScrollWrap: { marginBottom: 16, paddingVertical: 4 },
  filterRow: { paddingHorizontal: 20, gap: 10, paddingVertical: 4 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD, minHeight: 44 },
  filterText: { color: '#ccc', fontFamily: 'Urbanist_700Bold', fontSize: 13 },
  filterTextActive: { color: '#fff' },
  countPill: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, minWidth: 26, alignItems: 'center' },
  countPillText: { color: '#aaa', fontFamily: 'Urbanist_700Bold', fontSize: 11 },

  list: { paddingHorizontal: 20 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12, backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, borderStyle: 'dashed' },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(244,164,96,0.15)', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  emptySub: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 12, textAlign: 'center', paddingHorizontal: 40 },

  card: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, marginBottom: 12, flexDirection: 'row', overflow: 'hidden' },
  statusStrip: { width: 4 },
  cardBody: { flex: 1, padding: 14 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 10 },
  cardLeft: { flex: 1 },
  clientName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15, marginBottom: 3 },
  serviceName: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontFamily: 'Urbanist_700Bold', fontSize: 10, textTransform: 'capitalize' },

  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: BG, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: BORDER },
  priceChip: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' },
  metaText: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 12 },

  completeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  completeBtnText: { color: '#10B981', fontFamily: 'Urbanist_700Bold', fontSize: 13 },
});
