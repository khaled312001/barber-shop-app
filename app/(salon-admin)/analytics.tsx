import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';
const W = Dimensions.get('window').width - 40;

const PERIODS = [
  { key: 'week', label: 'أسبوع' },
  { key: 'month', label: 'شهر' },
  { key: 'year', label: 'سنة' },
];

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const h = max > 0 ? Math.max((value / max) * 100, 4) : 4;
  return (
    <View style={{ height: 80, justifyContent: 'flex-end', alignItems: 'center', flex: 1 }}>
      <View style={{ width: 24, height: `${h}%`, backgroundColor: color, borderRadius: 4 }} />
    </View>
  );
}

export default function SalonAnalytics() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState('month');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['salon-analytics', period],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/salon/analytics?period=${period}`);
      return res.json();
    },
  });

  const bookings = analytics?.bookingsByPeriod || [];
  const topServices = analytics?.topServices || [];
  const maxBookings = Math.max(...bookings.map((b: any) => b.count || 0), 1);
  const maxRevenue = Math.max(...bookings.map((b: any) => b.revenue || 0), 1);

  const summaryCards = [
    { label: 'إجمالي الحجوزات', value: analytics?.totalBookings ?? 0, icon: 'calendar', color: '#6C63FF' },
    { label: 'إجمالي الإيراد', value: `$${(analytics?.totalRevenue ?? 0).toFixed(0)}`, icon: 'cash', color: '#10B981' },
    { label: 'متوسط قيمة الحجز', value: `$${(analytics?.avgBookingValue ?? 0).toFixed(0)}`, icon: 'trending-up', color: PRIMARY },
    { label: 'عملاء جدد', value: analytics?.newCustomers ?? 0, icon: 'person-add', color: '#3B82F6' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.pageTitle}>التحليلات</Text>

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

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.grid}>
              {summaryCards.map((c, i) => (
                <View key={i} style={styles.statCard}>
                  <View style={[styles.iconBox, { backgroundColor: `${c.color}22` }]}>
                    <Ionicons name={c.icon as any} size={18} color={c.color} />
                  </View>
                  <Text style={styles.statValue}>{c.value}</Text>
                  <Text style={styles.statLabel}>{c.label}</Text>
                </View>
              ))}
            </View>

            {/* Bookings Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>الحجوزات</Text>
              {bookings.length > 0 ? (
                <View style={styles.barsRow}>
                  {bookings.map((b: any, i: number) => (
                    <View key={i} style={styles.barCol}>
                      <MiniBar value={b.count || 0} max={maxBookings} color="#6C63FF" />
                      <Text style={styles.barLabel}>{b.label || `${i + 1}`}</Text>
                      <Text style={styles.barValue}>{b.count || 0}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noData}>لا توجد بيانات</Text>
              )}
            </View>

            {/* Revenue Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>الإيراد</Text>
              {bookings.length > 0 ? (
                <View style={styles.barsRow}>
                  {bookings.map((b: any, i: number) => (
                    <View key={i} style={styles.barCol}>
                      <MiniBar value={b.revenue || 0} max={maxRevenue} color={PRIMARY} />
                      <Text style={styles.barLabel}>{b.label || `${i + 1}`}</Text>
                      <Text style={styles.barValue}>${(b.revenue || 0).toFixed(0)}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noData}>لا توجد بيانات</Text>
              )}
            </View>

            {/* Top Services */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>أكثر الخدمات طلباً</Text>
              {topServices.length > 0 ? (
                topServices.map((s: any, i: number) => (
                  <View key={i} style={styles.serviceRow}>
                    <View style={styles.serviceRank}>
                      <Text style={styles.rankText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.serviceName}>{s.name}</Text>
                    <View style={styles.serviceBar}>
                      <View style={[styles.serviceBarFill, { width: `${(s.count / (topServices[0]?.count || 1)) * 100}%` }]} />
                    </View>
                    <Text style={styles.serviceCount}>{s.count}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noData}>لا توجد خدمات مسجلة</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
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
  statCard: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, flex: 1, minWidth: '45%' },
  iconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20, marginBottom: 2 },
  statLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 11 },
  chartCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 14 },
  chartTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16, marginBottom: 16 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  barCol: { flex: 1, alignItems: 'center' },
  barLabel: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 9, marginTop: 4 },
  barValue: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 9 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  serviceRank: { width: 24, height: 24, borderRadius: 12, backgroundColor: `${PRIMARY}22`, alignItems: 'center', justifyContent: 'center' },
  rankText: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 11 },
  serviceName: { color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 13, width: 100 },
  serviceBar: { flex: 1, height: 6, backgroundColor: BORDER, borderRadius: 3, overflow: 'hidden' },
  serviceBarFill: { height: '100%', backgroundColor: PRIMARY, borderRadius: 3 },
  serviceCount: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 12, width: 24, textAlign: 'right' },
  noData: { color: '#555', fontFamily: 'Urbanist_400Regular', fontSize: 13, textAlign: 'center', paddingVertical: 20 },
});
