import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';
const W = Dimensions.get('window').width - 40;

const PERIODS_KEYS = ['week', 'month', 'year'];

function getServiceColor(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('haircut') || n.includes('cut')) return '#F4A460';
  if (n.includes('shave') || n.includes('beard')) return '#8B5CF6';
  if (n.includes('color') || n.includes('dye')) return '#EC4899';
  if (n.includes('massage') || n.includes('spa')) return '#10B981';
  if (n.includes('facial') || n.includes('face')) return '#F59E0B';
  if (n.includes('nail')) return '#F43F5E';
  if (n.includes('style') || n.includes('blow')) return '#3B82F6';
  if (n.includes('treatment')) return '#0EA5E9';
  if (n.includes('makeup')) return '#EC4899';
  return PRIMARY;
}

function getServiceIconName(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('haircut') || n.includes('cut')) return 'content-cut';
  if (n.includes('shave') || n.includes('beard')) return 'razor-double-edge';
  if (n.includes('color') || n.includes('dye')) return 'palette';
  if (n.includes('massage') || n.includes('spa')) return 'spa';
  if (n.includes('facial') || n.includes('face')) return 'face-woman-shimmer';
  if (n.includes('nail')) return 'hand-heart';
  if (n.includes('style') || n.includes('blow')) return 'hair-dryer';
  if (n.includes('treatment')) return 'water';
  if (n.includes('makeup')) return 'brush';
  return 'scissors-cutting';
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const h = max > 0 ? Math.max((value / max) * 100, 4) : 4;
  return (
    <View style={{ height: 100, justifyContent: 'flex-end', alignItems: 'center', flex: 1 }}>
      <View style={{ width: '60%', height: `${h}%`, borderRadius: 6, overflow: 'hidden' }}>
        <LinearGradient
          colors={[color, color + 'aa']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={{ width: '100%', height: '100%' }}
        />
      </View>
    </View>
  );
}

// Modern horizontal bar row — readable at any width, supports many data points
function HBarRow({
  label, value, max, color, prefix, suffix, highlight,
}: { label: string; value: number; max: number; color: string; prefix?: string; suffix?: string; highlight?: boolean }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 2) : 0;
  return (
    <View style={hbStyles.row}>
      <Text style={[hbStyles.label, highlight && { color: '#10B981', fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>{label}</Text>
      <View style={hbStyles.track}>
        <LinearGradient
          colors={[color, color + 'cc']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[hbStyles.fill, { width: `${pct}%` }]}
        />
      </View>
      <Text style={[hbStyles.value, { color }]} numberOfLines={1}>
        {prefix || ''}{Number(value).toLocaleString()}{suffix || ''}
      </Text>
    </View>
  );
}

const hbStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  label: { width: 56, color: '#aaa', fontFamily: 'Urbanist_600SemiBold', fontSize: 11 },
  track: { flex: 1, height: 18, backgroundColor: '#13151B', borderRadius: 9, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 9 },
  value: { width: 70, textAlign: 'right', fontFamily: 'Urbanist_700Bold', fontSize: 12 },
});

export default function SalonAnalytics() {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const [period, setPeriod] = useState('month');
  const PERIODS = PERIODS_KEYS.map(key => ({ key, label: t(`period_${key}` as any) }));

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['salon-analytics', period],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/salon/analytics?period=${period}`);
      return res.json();
    },
  });

  // Also fetch recent bookings for richer metrics
  const { data: allBookings = [] } = useQuery({
    queryKey: ['salon-all-bookings-analytics'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/bookings');
      return res.json();
    },
  });

  const bookings = analytics?.bookingsByPeriod || [];
  const topServices = analytics?.topServices || [];
  const maxBookings = Math.max(...bookings.map((b: any) => b.count || 0), 1);
  const maxRevenue = Math.max(...bookings.map((b: any) => b.revenue || 0), 1);

  // Computed metrics from allBookings
  const totalCompleted = allBookings.filter((b: any) => b.status === 'completed').length;
  const totalCancelled = allBookings.filter((b: any) => b.status === 'cancelled').length;
  const totalPending = allBookings.filter((b: any) => b.status === 'pending').length;
  const totalBookingsCount = allBookings.length || 1;
  const completionRate = Math.round((totalCompleted / totalBookingsCount) * 100);
  const cancellationRate = Math.round((totalCancelled / totalBookingsCount) * 100);

  // Peak hours analysis
  const hourCounts: Record<number, number> = {};
  allBookings.forEach((b: any) => {
    if (b.time) {
      const h = parseInt(b.time.split(':')[0]);
      if (!isNaN(h)) hourCounts[h] = (hourCounts[h] || 0) + 1;
    }
  });
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  const peakHourLabel = peakHour ? `${peakHour[0]}:00` : '—';

  // Day of week analysis
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayCounts = Array(7).fill(0);
  allBookings.forEach((b: any) => {
    if (b.date) {
      const d = new Date(b.date);
      if (!isNaN(d.getTime())) dayCounts[d.getDay()]++;
    }
  });
  const maxDayCount = Math.max(...dayCounts, 1);
  const peakDayIdx = dayCounts.indexOf(Math.max(...dayCounts));

  const summaryCards = [
    { label: t('total_bookings_stat') || 'Bookings', value: analytics?.totalBookings ?? totalBookingsCount, icon: 'calendar' as const, color: '#6C63FF', mcIcon: false },
    { label: t('total_revenue_stat') || 'Revenue', value: `CHF ${(analytics?.totalRevenue ?? 0).toFixed(0)}`, icon: 'cash' as const, color: '#10B981', mcIcon: false },
    { label: t('avg_booking_value') || 'Avg Value', value: `$${(analytics?.avgBookingValue ?? 0).toFixed(0)}`, icon: 'trending-up' as const, color: PRIMARY, mcIcon: false },
    { label: t('new_customers') || 'New Clients', value: analytics?.newCustomers ?? 0, icon: 'person-add' as const, color: '#3B82F6', mcIcon: false },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>{t('analytics_title') || 'Analytics'}</Text>
          <Text style={styles.pageSubtitle}>{t('salon_insights') || 'Insights & performance'}</Text>
        </View>
        <View style={styles.iconBadge}>
          <MaterialCommunityIcons name="chart-line" size={22} color={PRIMARY} />
        </View>
      </View>

      {/* Period Filter */}
      <View style={styles.periodRow}>
        {PERIODS.map(p => (
          <Pressable
            key={p.key}
            onPress={() => setPeriod(p.key)}
            style={({ pressed }) => [
              styles.periodBtn,
              period === p.key && styles.periodBtnActive,
              pressed && { opacity: 0.8 },
            ]}
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
            {/* Main Summary Cards with gradient */}
            <View style={styles.grid}>
              {summaryCards.map((c, i) => (
                <LinearGradient
                  key={i}
                  colors={[c.color + '22', c.color + '05']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={[styles.statCard, { borderColor: c.color + '30' }]}
                >
                  <View style={[styles.iconBox, { backgroundColor: c.color }]}>
                    <Ionicons name={c.icon} size={18} color="#fff" />
                  </View>
                  <Text style={styles.statValue} numberOfLines={1}>{c.value}</Text>
                  <Text style={styles.statLabel} numberOfLines={1}>{c.label}</Text>
                </LinearGradient>
              ))}
            </View>

            {/* KPIs Row — Completion/Cancellation/Peak */}
            <View style={styles.kpiGrid}>
              <View style={[styles.kpiCard, { borderColor: '#10B98130' }]}>
                <View style={styles.kpiTop}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                  <Text style={styles.kpiLabel}>{t('completion_rate') || 'Completion'}</Text>
                </View>
                <Text style={[styles.kpiValue, { color: '#10B981' }]}>{completionRate}%</Text>
                <View style={styles.kpiBar}>
                  <View style={[styles.kpiBarFill, { width: `${completionRate}%`, backgroundColor: '#10B981' }]} />
                </View>
                <Text style={styles.kpiHint}>{totalCompleted} completed</Text>
              </View>

              <View style={[styles.kpiCard, { borderColor: '#EF444430' }]}>
                <View style={styles.kpiTop}>
                  <MaterialCommunityIcons name="close-circle" size={16} color="#EF4444" />
                  <Text style={styles.kpiLabel}>{t('cancel_rate') || 'Cancelled'}</Text>
                </View>
                <Text style={[styles.kpiValue, { color: '#EF4444' }]}>{cancellationRate}%</Text>
                <View style={styles.kpiBar}>
                  <View style={[styles.kpiBarFill, { width: `${cancellationRate}%`, backgroundColor: '#EF4444' }]} />
                </View>
                <Text style={styles.kpiHint}>{totalCancelled} cancelled</Text>
              </View>

              <View style={[styles.kpiCard, { borderColor: '#F59E0B30' }]}>
                <View style={styles.kpiTop}>
                  <MaterialCommunityIcons name="clock-time-four" size={16} color="#F59E0B" />
                  <Text style={styles.kpiLabel}>{t('peak_hour') || 'Peak Hour'}</Text>
                </View>
                <Text style={[styles.kpiValue, { color: '#F59E0B' }]}>{peakHourLabel}</Text>
                <View style={styles.kpiPill}>
                  <Ionicons name="flash" size={10} color="#F59E0B" />
                  <Text style={styles.kpiPillText}>{peakHour ? peakHour[1] : 0} bookings</Text>
                </View>
              </View>

              <View style={[styles.kpiCard, { borderColor: '#3B82F630' }]}>
                <View style={styles.kpiTop}>
                  <MaterialCommunityIcons name="calendar-star" size={16} color="#3B82F6" />
                  <Text style={styles.kpiLabel}>{t('peak_day') || 'Peak Day'}</Text>
                </View>
                <Text style={[styles.kpiValue, { color: '#3B82F6' }]}>{dayNames[peakDayIdx]}</Text>
                <View style={styles.kpiPill}>
                  <Ionicons name="star" size={10} color="#3B82F6" />
                  <Text style={styles.kpiPillText}>{dayCounts[peakDayIdx]} bookings</Text>
                </View>
              </View>
            </View>

            {/* Revenue Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View style={styles.chartTitleRow}>
                  <View style={[styles.chartIconWrap, { backgroundColor: PRIMARY + '22' }]}>
                    <MaterialCommunityIcons name="currency-usd" size={16} color={PRIMARY} />
                  </View>
                  <Text style={styles.chartTitle}>{t('revenue_chart') || 'Revenue Trend'}</Text>
                </View>
                {bookings.length > 0 && (
                  <Text style={styles.chartTotal}>
                    ${bookings.reduce((s: number, b: any) => s + (b.revenue || 0), 0).toFixed(0)}
                  </Text>
                )}
              </View>
              {bookings.length > 0 ? (
                <View style={{ marginTop: 12 }}>
                  {bookings.map((b: any, i: number) => (
                    <HBarRow
                      key={i}
                      label={b.label || `${i + 1}`}
                      value={Number(b.revenue || 0)}
                      max={maxRevenue}
                      color={PRIMARY}
                      prefix="CHF "
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.noDataBox}>
                  <MaterialCommunityIcons name="chart-line-variant" size={32} color={BORDER} />
                  <Text style={styles.noData}>{t('no_data') || 'No data yet'}</Text>
                </View>
              )}
            </View>

            {/* Bookings Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View style={styles.chartTitleRow}>
                  <View style={[styles.chartIconWrap, { backgroundColor: '#6C63FF22' }]}>
                    <Ionicons name="calendar" size={16} color="#6C63FF" />
                  </View>
                  <Text style={styles.chartTitle}>{t('bookings_chart') || 'Bookings Trend'}</Text>
                </View>
                {bookings.length > 0 && (
                  <Text style={[styles.chartTotal, { color: '#6C63FF' }]}>
                    {bookings.reduce((s: number, b: any) => s + (b.count || 0), 0)}
                  </Text>
                )}
              </View>
              {bookings.length > 0 ? (
                <View style={{ marginTop: 12 }}>
                  {bookings.map((b: any, i: number) => (
                    <HBarRow
                      key={i}
                      label={b.label || `${i + 1}`}
                      value={Number(b.count || 0)}
                      max={maxBookings}
                      color="#6C63FF"
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.noDataBox}>
                  <Ionicons name="calendar-outline" size={32} color={BORDER} />
                  <Text style={styles.noData}>{t('no_data') || 'No data yet'}</Text>
                </View>
              )}
            </View>

            {/* Day of Week Distribution */}
            {allBookings.length > 0 && (
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View style={styles.chartTitleRow}>
                    <View style={[styles.chartIconWrap, { backgroundColor: '#3B82F622' }]}>
                      <MaterialCommunityIcons name="calendar-week" size={16} color="#3B82F6" />
                    </View>
                    <Text style={styles.chartTitle}>{t('weekly_distribution') || 'Weekly Distribution'}</Text>
                  </View>
                  <Text style={[styles.chartTotal, { color: '#3B82F6' }]}>
                    {dayNames[peakDayIdx]} · {t('peak_day') || 'peak'}
                  </Text>
                </View>
                <View style={{ marginTop: 12 }}>
                  {dayCounts.map((count, i) => (
                    <HBarRow
                      key={i}
                      label={dayNames[i]}
                      value={count}
                      max={maxDayCount}
                      color={i === peakDayIdx ? '#10B981' : '#3B82F6'}
                      highlight={i === peakDayIdx}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Top Services with icons */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View style={styles.chartTitleRow}>
                  <View style={[styles.chartIconWrap, { backgroundColor: '#F59E0B22' }]}>
                    <Ionicons name="trophy" size={16} color="#F59E0B" />
                  </View>
                  <Text style={styles.chartTitle}>{t('top_services_chart') || 'Top Services'}</Text>
                </View>
              </View>
              {topServices.length > 0 ? (
                topServices.map((s: any, i: number) => {
                  const color = getServiceColor(s.name);
                  const iconName = getServiceIconName(s.name);
                  const pct = (s.count / (topServices[0]?.count || 1)) * 100;
                  return (
                    <View key={i} style={styles.serviceCard}>
                      <View style={[styles.serviceRank, { backgroundColor: i === 0 ? '#F59E0B22' : color + '22' }]}>
                        {i === 0 ? (
                          <Ionicons name="trophy" size={14} color="#F59E0B" />
                        ) : (
                          <Text style={[styles.rankText, { color }]}>{i + 1}</Text>
                        )}
                      </View>
                      <View style={[styles.serviceIconBox, { backgroundColor: color + '22' }]}>
                        <MaterialCommunityIcons name={iconName as any} size={18} color={color} />
                      </View>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName} numberOfLines={1}>{s.name}</Text>
                        <View style={styles.serviceBar}>
                          <LinearGradient
                            colors={[color, color + 'aa']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={[styles.serviceBarFill, { width: `${pct}%` }]}
                          />
                        </View>
                      </View>
                      <View style={styles.serviceCountBox}>
                        <Text style={[styles.serviceCount, { color }]}>{s.count}</Text>
                        <Text style={styles.serviceCountLabel}>booked</Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.noDataBox}>
                  <MaterialCommunityIcons name="trophy-variant-outline" size={32} color={BORDER} />
                  <Text style={styles.noData}>{t('no_services_recorded') || 'No services yet'}</Text>
                </View>
              )}
            </View>

            {/* Status Breakdown */}
            {allBookings.length > 0 && (
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View style={styles.chartTitleRow}>
                    <View style={[styles.chartIconWrap, { backgroundColor: '#06B6D422' }]}>
                      <MaterialCommunityIcons name="chart-donut" size={16} color="#06B6D4" />
                    </View>
                    <Text style={styles.chartTitle}>{t('status_breakdown') || 'Bookings Status'}</Text>
                  </View>
                </View>
                <View style={styles.statusGrid}>
                  {[
                    { label: t('status_completed') || 'Completed', count: totalCompleted, color: '#10B981', icon: 'checkmark-done-circle' as const },
                    { label: t('status_pending') || 'Pending', count: totalPending, color: '#F59E0B', icon: 'time' as const },
                    { label: t('status_cancelled') || 'Cancelled', count: totalCancelled, color: '#EF4444', icon: 'close-circle' as const },
                  ].map((item, i) => (
                    <View key={i} style={[styles.statusCell, { borderColor: item.color + '30' }]}>
                      <View style={[styles.statusIconWrap, { backgroundColor: item.color + '22' }]}>
                        <Ionicons name={item.icon} size={18} color={item.color} />
                      </View>
                      <Text style={[styles.statusCount, { color: item.color }]}>{item.count}</Text>
                      <Text style={styles.statusLabel}>{item.label}</Text>
                      <Text style={styles.statusPct}>
                        {totalBookingsCount > 0 ? Math.round((item.count / totalBookingsCount) * 100) : 0}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 8, marginBottom: 18 },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 24 },
  pageSubtitle: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13, marginTop: 2 },
  iconBadge: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(244,164,96,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(244,164,96,0.3)' },

  periodRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 20 },
  periodBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD },
  periodBtnActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  periodText: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  periodTextActive: { color: '#181A20' },

  content: { paddingHorizontal: 20 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, padding: 14, flex: 1, minWidth: '45%' },
  iconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20, marginBottom: 2 },
  statLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 11 },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  kpiCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, padding: 14, flex: 1, minWidth: '45%', gap: 8 },
  kpiTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kpiLabel: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiValue: { fontFamily: 'Urbanist_700Bold', fontSize: 22 },
  kpiBar: { height: 6, backgroundColor: '#13151B', borderRadius: 3, overflow: 'hidden' },
  kpiBarFill: { height: '100%', borderRadius: 3 },
  kpiHint: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 10 },
  kpiPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#13151B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: BORDER },
  kpiPillText: { color: '#ccc', fontFamily: 'Urbanist_600SemiBold', fontSize: 10 },

  chartCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 14 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  chartTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chartIconWrap: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  chartTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  chartTotal: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 18 },

  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barLabel: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 10, marginTop: 4 },
  barValue: { color: '#ccc', fontFamily: 'Urbanist_700Bold', fontSize: 10 },

  noDataBox: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  noData: { color: '#555', fontFamily: 'Urbanist_500Medium', fontSize: 13 },

  serviceCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, padding: 10, backgroundColor: '#13151B', borderRadius: 12, borderWidth: 1, borderColor: BORDER },
  serviceRank: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontFamily: 'Urbanist_700Bold', fontSize: 12 },
  serviceIconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  serviceInfo: { flex: 1, gap: 4 },
  serviceName: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  serviceBar: { height: 5, backgroundColor: BORDER, borderRadius: 3, overflow: 'hidden' },
  serviceBarFill: { height: '100%', borderRadius: 3 },
  serviceCountBox: { alignItems: 'flex-end' },
  serviceCount: { fontFamily: 'Urbanist_700Bold', fontSize: 18 },
  serviceCountLabel: { color: '#666', fontFamily: 'Urbanist_500Medium', fontSize: 9 },

  statusGrid: { flexDirection: 'row', gap: 10 },
  statusCell: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, backgroundColor: '#13151B', gap: 6 },
  statusIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statusCount: { fontFamily: 'Urbanist_700Bold', fontSize: 20 },
  statusLabel: { color: '#ccc', fontFamily: 'Urbanist_500Medium', fontSize: 10, textAlign: 'center' },
  statusPct: { color: '#888', fontFamily: 'Urbanist_700Bold', fontSize: 11 },
});
