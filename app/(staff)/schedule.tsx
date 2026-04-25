import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { apiRequest } from '@/lib/query-client';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const CARD_ALT = '#262A35';
const BORDER = '#35383F';

const DAY_KEYS = ['day_sunday', 'day_monday', 'day_tuesday', 'day_wednesday', 'day_thursday', 'day_friday', 'day_saturday'];

export default function StaffSchedule() {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const { user, logout } = useApp();
  const today = new Date();
  const todayName = t(DAY_KEYS[today.getDay()] as any);
  const monthName = today.toLocaleString('default', { month: 'short' });

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ['staff-schedule'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/staff/schedule');
      return res.json();
    },
  });

  const { data: todayBookings = [] } = useQuery({
    queryKey: ['staff-today-bookings'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/staff/bookings');
      const all = await res.json();
      const todayStr = today.toISOString().split('T')[0];
      return all.filter((b: any) => b.date?.startsWith(todayStr));
    },
  });

  const statusColor: Record<string, string> = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    completed: '#10B981',
    cancelled: '#EF4444',
  };

  const completedCount = todayBookings.filter((b: any) => b.status === 'completed').length;
  const upcomingCount = todayBookings.filter((b: any) => b.status === 'pending' || b.status === 'confirmed').length;
  const progress = todayBookings.length > 0 ? (completedCount / todayBookings.length) * 100 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero Header with Gradient ─── */}
        <LinearGradient
          colors={['rgba(244,164,96,0.18)', 'rgba(244,164,96,0.02)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <View style={styles.greetingRow}>
                <Text style={styles.greeting}>{t('greeting_hello')}</Text>
                <MaterialCommunityIcons name="hand-wave" size={16} color={PRIMARY} />
              </View>
              <Text style={styles.name} numberOfLines={1}>{user?.fullName}</Text>
              <View style={styles.roleBadge}>
                <MaterialCommunityIcons name="content-cut" size={12} color={PRIMARY} />
                <Text style={styles.roleBadgeText}>{t('staff_member') || 'Staff Member'}</Text>
              </View>
            </View>
            <View style={styles.dateBadge}>
              <Text style={styles.dateMonth}>{monthName.toUpperCase()}</Text>
              <Text style={styles.dateNum}>{today.getDate()}</Text>
              <Text style={styles.dateDay}>{todayName}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          {todayBookings.length > 0 && (
            <View style={styles.progressWrap}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>
                  {t('daily_progress') || 'Daily Progress'}
                </Text>
                <Text style={styles.progressValue}>{completedCount}/{todayBookings.length}</Text>
              </View>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[PRIMARY, '#E8924A']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
            </View>
          )}
        </LinearGradient>

        {/* ─── Summary Cards ─── */}
        <View style={styles.summaryRow}>
          <LinearGradient
            colors={['rgba(59,130,246,0.18)', 'rgba(59,130,246,0.04)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.summaryCard}
          >
            <View style={[styles.summaryIconWrap, { backgroundColor: '#3B82F6' }]}>
              <Ionicons name="calendar" size={18} color="#fff" />
            </View>
            <Text style={styles.summaryValue}>{todayBookings.length}</Text>
            <Text style={styles.summaryLabel}>{t('todays_booking_count')}</Text>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(16,185,129,0.18)', 'rgba(16,185,129,0.04)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.summaryCard}
          >
            <View style={[styles.summaryIconWrap, { backgroundColor: '#10B981' }]}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
            </View>
            <Text style={styles.summaryValue}>{completedCount}</Text>
            <Text style={styles.summaryLabel}>{t('status_completed')}</Text>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(244,164,96,0.18)', 'rgba(244,164,96,0.04)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.summaryCard}
          >
            <View style={[styles.summaryIconWrap, { backgroundColor: PRIMARY }]}>
              <Ionicons name="time" size={18} color="#fff" />
            </View>
            <Text style={styles.summaryValue}>{upcomingCount}</Text>
            <Text style={styles.summaryLabel}>{t('upcoming_label')}</Text>
          </LinearGradient>
        </View>

        {/* ─── Today's Bookings Timeline ─── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('todays_bookings')}</Text>
          {todayBookings.length > 0 && (
            <Pressable onPress={() => router.push('/(staff)/appointments')}>
              <Text style={styles.seeAll}>{t('see_all') || 'See all'} →</Text>
            </Pressable>
          )}
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 24 }} />
        ) : todayBookings.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="sunny-outline" size={44} color={PRIMARY} />
            </View>
            <Text style={styles.emptyTitle}>{t('no_bookings_today_staff') || 'Free day ahead!'}</Text>
            <Text style={styles.emptySub}>{t('enjoy_your_day') || 'No appointments scheduled for today.'}</Text>
          </View>
        ) : (
          todayBookings.map((b: any, idx: number) => (
            <View key={b.id} style={styles.bookingCard}>
              <View style={styles.bookingTimeCol}>
                <Text style={styles.bookingTime}>{b.time || '—'}</Text>
                <View style={[styles.timeDot, { backgroundColor: statusColor[b.status] || '#888' }]} />
                {idx < todayBookings.length - 1 && <View style={styles.timeLineConnector} />}
              </View>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingClient} numberOfLines={1}>{b.clientName || t('client_label')}</Text>
                <Text style={styles.bookingService} numberOfLines={1}>{b.serviceName || t('service_label')}</Text>
                <View style={[styles.miniStatus, { backgroundColor: `${statusColor[b.status] || '#888'}22` }]}>
                  <Text style={[styles.miniStatusText, { color: statusColor[b.status] || '#888' }]}>
                    {b.status || 'pending'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* ─── Weekly Shifts ─── */}
        {shifts.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 28 }]}>{t('shifts_schedule') || 'Your Schedule'}</Text>
            {shifts.map((s: any, i: number) => (
              <View key={i} style={styles.shiftCard}>
                <View style={styles.shiftDayWrap}>
                  <Text style={styles.shiftDayText}>{(s.day || `Day ${i + 1}`).substring(0, 3)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shiftDayFull}>{s.day || `Day ${i + 1}`}</Text>
                  <Text style={styles.shiftTime}>{s.startTime || '09:00'} — {s.endTime || '17:00'}</Text>
                </View>
                <Ionicons name="time-outline" size={20} color={PRIMARY} />
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { paddingHorizontal: 20 },

  /* Hero */
  heroCard: { borderRadius: 20, padding: 20, marginBottom: 20, marginTop: 8, borderWidth: 1, borderColor: 'rgba(244,164,96,0.15)' },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  greeting: { color: '#B0B0B0', fontFamily: 'Urbanist_500Medium', fontSize: 14 },
  name: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 22, marginTop: 2 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(244,164,96,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  roleBadgeText: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 11 },
  dateBadge: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center', minWidth: 64 },
  dateMonth: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 10, letterSpacing: 1 },
  dateNum: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 22, lineHeight: 26 },
  dateDay: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 10 },

  /* Progress */
  progressWrap: { marginTop: 20 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: '#B0B0B0', fontFamily: 'Urbanist_500Medium', fontSize: 12 },
  progressValue: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 12 },
  progressBar: { height: 8, backgroundColor: CARD, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },

  /* Summary */
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  summaryCard: { flex: 1, backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 14, alignItems: 'flex-start' },
  summaryIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  summaryValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 22 },
  summaryLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 11, marginTop: 2 },

  /* Sections */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18, marginBottom: 14 },
  seeAll: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },

  /* Empty */
  empty: { alignItems: 'center', paddingVertical: 50, gap: 12, backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, borderStyle: 'dashed' },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(244,164,96,0.12)', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  emptySub: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },

  /* Booking Timeline */
  bookingCard: { flexDirection: 'row', marginBottom: 2, gap: 14 },
  bookingTimeCol: { alignItems: 'center', width: 70, paddingTop: 4 },
  bookingTime: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 13, marginBottom: 6 },
  timeDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 3, borderColor: BG },
  timeLineConnector: { width: 2, flex: 1, backgroundColor: BORDER, marginTop: 4, minHeight: 20 },
  bookingInfo: { flex: 1, backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 10 },
  bookingClient: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15, marginBottom: 2 },
  bookingService: { color: '#B0B0B0', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginBottom: 8 },
  miniStatus: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  miniStatusText: { fontFamily: 'Urbanist_600SemiBold', fontSize: 10, textTransform: 'capitalize' },

  /* Shifts */
  shiftCard: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 14 },
  shiftDayWrap: { backgroundColor: 'rgba(244,164,96,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, minWidth: 50, alignItems: 'center' },
  shiftDayText: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 12, textTransform: 'uppercase' },
  shiftDayFull: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 14, marginBottom: 2 },
  shiftTime: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 12 },
});
