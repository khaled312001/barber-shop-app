import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { apiRequest } from '@/lib/query-client';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

const PERIOD_KEYS = ['day', 'week', 'month'];

export default function StaffEarnings() {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const { user } = useApp();
  const [period, setPeriod] = useState('month');
  const PERIODS = PERIOD_KEYS.map(key => ({ key, label: key === 'day' ? t('period_today') : t(`period_${key}` as any) }));

  const { data: earnings, isLoading } = useQuery({
    queryKey: ['staff-earnings', period],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/staff/earnings?period=${period}`);
      return res.json();
    },
  });

  const summaryCards = [
    { label: t('earnings'), value: `$${(earnings?.totalEarnings ?? 0).toFixed(0)}`, icon: 'cash' as const, color: '#10B981' },
    { label: t('tips'), value: `$${(earnings?.totalTips ?? 0).toFixed(0)}`, icon: 'heart' as const, color: PRIMARY },
    { label: t('bookings_count'), value: earnings?.completedBookings ?? 0, icon: 'calendar' as const, color: '#6C63FF' },
    { label: t('avg_booking'), value: `$${(earnings?.avgPerBooking ?? 0).toFixed(0)}`, icon: 'trending-up' as const, color: '#3B82F6' },
  ];

  const bookings = earnings?.recentBookings || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>{t('my_earnings_title')}</Text>
          <Text style={styles.pageSubtitle}>{t('track_earnings_sub') || 'Track your income & tips'}</Text>
        </View>
        <View style={styles.iconBadge}>
          <MaterialCommunityIcons name="wallet" size={22} color={PRIMARY} />
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

      {isLoading ? (
        <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Cards with gradient */}
          <View style={styles.grid}>
            {summaryCards.map((c, i) => (
              <LinearGradient
                key={i}
                colors={[`${c.color}22`, `${c.color}05`]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                <View style={[styles.iconBox, { backgroundColor: c.color }]}>
                  <Ionicons name={c.icon} size={18} color="#fff" />
                </View>
                <Text style={styles.statValue} numberOfLines={1}>{c.value}</Text>
                <Text style={styles.statLabel}>{c.label}</Text>
              </LinearGradient>
            ))}
          </View>

          {/* Progress indicator */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressLeft}>
                <View style={styles.progressIcon}>
                  <MaterialCommunityIcons name="gift" size={16} color={PRIMARY} />
                </View>
                <Text style={styles.progressTitle}>{t('tips_ratio')}</Text>
              </View>
              <Text style={styles.progressPct}>
                {earnings?.totalEarnings > 0
                  ? `${((earnings.totalTips / earnings.totalEarnings) * 100).toFixed(1)}%`
                  : '0%'}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[PRIMARY, '#E8924A']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.progressFill, {
                  width: `${earnings?.totalEarnings > 0
                    ? Math.min((earnings.totalTips / earnings.totalEarnings) * 100, 100)
                    : 0}%`,
                }]}
              />
            </View>
            <Text style={styles.progressHint}>
              {t('tips_hint') || 'Tips boost your total earnings'}
            </Text>
          </View>

          {/* Recent Bookings */}
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{t('recent_completed')}</Text>
            {bookings.length > 0 && (
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{bookings.length}</Text>
              </View>
            )}
          </View>

          {bookings.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="cash-outline" size={36} color={PRIMARY} />
              </View>
              <Text style={styles.emptyTitle}>{t('no_completed_period')}</Text>
              <Text style={styles.emptySub}>{t('complete_bookings_see') || 'Complete bookings to see earnings here.'}</Text>
            </View>
          ) : (
            bookings.map((b: any) => (
              <View key={b.id} style={styles.bookingRow}>
                <View style={styles.bookingIconWrap}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingClient} numberOfLines={1}>{b.clientName || t('client_label')}</Text>
                  <View style={styles.bookingDateRow}>
                    <Ionicons name="calendar-outline" size={11} color="#888" />
                    <Text style={styles.bookingDate}>{b.date} · {b.time}</Text>
                  </View>
                </View>
                <View style={styles.bookingAmounts}>
                  <Text style={styles.amountMain}>${(b.totalPrice || 0).toFixed(0)}</Text>
                  {b.tip > 0 && (
                    <View style={styles.tipChip}>
                      <MaterialCommunityIcons name="gift-outline" size={10} color={PRIMARY} />
                      <Text style={styles.amountTip}>+${b.tip.toFixed(0)}</Text>
                    </View>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  statCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 14, flex: 1, minWidth: '45%', alignItems: 'flex-start' },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20, marginBottom: 4 },
  statLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 11 },

  progressCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 24 },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  progressLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressIcon: { width: 28, height: 28, borderRadius: 10, backgroundColor: 'rgba(244,164,96,0.15)', alignItems: 'center', justifyContent: 'center' },
  progressTitle: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  progressPct: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  progressBar: { height: 10, backgroundColor: BORDER, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  progressHint: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 11, marginTop: 10 },

  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  countPill: { backgroundColor: 'rgba(244,164,96,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, minWidth: 22, alignItems: 'center' },
  countPillText: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 11 },

  empty: { alignItems: 'center', paddingVertical: 50, gap: 10, backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, borderStyle: 'dashed' },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 24, backgroundColor: 'rgba(244,164,96,0.15)', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  emptySub: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 12, paddingHorizontal: 30, textAlign: 'center' },

  bookingRow: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bookingIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.15)', alignItems: 'center', justifyContent: 'center' },
  bookingInfo: { flex: 1 },
  bookingClient: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 14, marginBottom: 3 },
  bookingDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bookingDate: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 11 },
  bookingAmounts: { alignItems: 'flex-end', gap: 4 },
  amountMain: { color: '#10B981', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  tipChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(244,164,96,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  amountTip: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 10 },
});
