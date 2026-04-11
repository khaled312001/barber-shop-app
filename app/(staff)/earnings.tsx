import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';
import { useApp } from '@/contexts/AppContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

const PERIODS = [
  { key: 'day', label: 'اليوم' },
  { key: 'week', label: 'الأسبوع' },
  { key: 'month', label: 'الشهر' },
];

export default function StaffEarnings() {
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const [period, setPeriod] = useState('month');

  const { data: earnings, isLoading } = useQuery({
    queryKey: ['staff-earnings', period],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/staff/earnings?period=${period}`);
      return res.json();
    },
  });

  const summaryCards = [
    { label: 'الأرباح', value: `$${(earnings?.totalEarnings ?? 0).toFixed(0)}`, icon: 'cash', color: '#10B981' },
    { label: 'الإكراميات', value: `$${(earnings?.totalTips ?? 0).toFixed(0)}`, icon: 'heart', color: PRIMARY },
    { label: 'عدد الحجوزات', value: earnings?.completedBookings ?? 0, icon: 'calendar', color: '#6C63FF' },
    { label: 'متوسط الحجز', value: `$${(earnings?.avgPerBooking ?? 0).toFixed(0)}`, icon: 'trending-up', color: '#3B82F6' },
  ];

  const bookings = earnings?.recentBookings || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.pageTitle}>أرباحي</Text>

      {/* Period Filter */}
      <View style={styles.periodRow}>
        {PERIODS.map(p => (
          <Pressable
            key={p.key}
            onPress={() => setPeriod(p.key)}
            style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
          >
            <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Cards */}
          <View style={styles.grid}>
            {summaryCards.map((c, i) => (
              <View key={i} style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: `${c.color}22` }]}>
                  <Ionicons name={c.icon as any} size={20} color={c.color} />
                </View>
                <Text style={styles.statValue}>{c.value}</Text>
                <Text style={styles.statLabel}>{c.label}</Text>
              </View>
            ))}
          </View>

          {/* Progress indicator */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>نسبة الإكراميات من الإيراد</Text>
              <Text style={styles.progressPct}>
                {earnings?.totalEarnings > 0
                  ? `${((earnings.totalTips / earnings.totalEarnings) * 100).toFixed(1)}%`
                  : '0%'}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {
                width: `${earnings?.totalEarnings > 0
                  ? Math.min((earnings.totalTips / earnings.totalEarnings) * 100, 100)
                  : 0}%`
              }]} />
            </View>
          </View>

          {/* Recent Bookings */}
          <Text style={styles.sectionTitle}>آخر الحجوزات المكتملة</Text>
          {bookings.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="cash-outline" size={44} color={BORDER} />
              <Text style={styles.emptyText}>لا توجد حجوزات مكتملة في هذه الفترة</Text>
            </View>
          ) : (
            bookings.map((b: any) => (
              <View key={b.id} style={styles.bookingRow}>
                <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingClient}>{b.clientName || 'عميل'}</Text>
                  <Text style={styles.bookingDate}>{b.date} {b.time}</Text>
                </View>
                <View style={styles.bookingAmounts}>
                  <Text style={styles.amountMain}>${(b.totalPrice || 0).toFixed(0)}</Text>
                  {b.tip > 0 && (
                    <Text style={styles.amountTip}>+${b.tip.toFixed(0)} 💰</Text>
                  )}
                </View>
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
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 24, paddingHorizontal: 20, marginTop: 8, marginBottom: 14 },
  periodRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  periodBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD },
  periodBtnActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  periodText: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  periodTextActive: { color: '#181A20' },
  content: { paddingHorizontal: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, flex: 1, minWidth: '45%', alignItems: 'flex-start' },
  iconBox: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20, marginBottom: 4 },
  statLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 11 },
  progressCard: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressTitle: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13 },
  progressPct: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 14 },
  progressBar: { height: 8, backgroundColor: BORDER, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: PRIMARY, borderRadius: 4 },
  sectionTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16, marginBottom: 14 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13, textAlign: 'center' },
  bookingRow: { backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  bookingInfo: { flex: 1 },
  bookingClient: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 14, marginBottom: 2 },
  bookingDate: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 12 },
  bookingAmounts: { alignItems: 'flex-end' },
  amountMain: { color: '#10B981', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  amountTip: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 11 },
});
