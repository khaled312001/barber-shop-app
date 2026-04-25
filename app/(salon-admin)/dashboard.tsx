import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, useColorScheme, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { apiRequest } from '@/lib/query-client';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const CARD_ALT = '#262A35';
const BORDER = '#35383F';

export default function SalonDashboard() {
  const { t, isRTL } = useLanguage();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { user, logout } = useApp();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['salon-dashboard'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/stats');
      return res.json();
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['salon-today-bookings'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/bookings');
      const all = await res.json();
      const today = new Date().toISOString().split('T')[0];
      return all.filter((b: any) => b.date?.startsWith(today)).slice(0, 5);
    },
  });

  const statCards = [
    { label: t('todays_bookings'), value: stats?.todayBookings ?? 0, icon: 'calendar', color: '#6C63FF', gradient: ['#6C63FF', '#5046E4'] as [string, string] },
    { label: t('todays_revenue'), value: `CHF ${(stats?.todayRevenue ?? 0).toFixed(0)}`, icon: 'cash', color: '#10B981', gradient: ['#10B981', '#0D8F66'] as [string, string] },
    { label: t('total_clients'), value: stats?.totalCustomers ?? 0, icon: 'people', color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] as [string, string] },
    { label: t('active_staff'), value: stats?.staffCount ?? 0, icon: 'person', color: PRIMARY, gradient: [PRIMARY, '#E8924A'] as [string, string] },
  ];

  const quickActions = [
    { label: t('appointments') || 'Appointments', icon: 'calendar-clock', color: '#6C63FF', route: '/(salon-admin)/appointments' },
    { label: t('services') || 'Services', icon: 'scissors-cutting', color: '#10B981', route: '/(salon-admin)/services' },
    { label: t('staff') || 'Staff', icon: 'account-group', color: '#3B82F6', route: '/(salon-admin)/staff' },
    { label: t('analytics') || 'Analytics', icon: 'chart-line', color: PRIMARY, route: '/(salon-admin)/analytics' },
  ];

  const statusColor: Record<string, string> = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    completed: '#10B981',
    cancelled: '#EF4444',
  };

  const statusLabel = (status: string) => {
    const key = `status_${status}`;
    const translated = t(key as any);
    return translated && translated !== key ? translated : status;
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? BG : colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header Hero ─── */}
        <LinearGradient
          colors={['rgba(244,164,96,0.15)', 'rgba(244,164,96,0.02)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <View style={styles.greetingRow}>
                <Text style={styles.greeting}>{t('welcome_back')}</Text>
                <MaterialCommunityIcons name="hand-wave" size={16} color={PRIMARY} />
              </View>
              <Text style={styles.name} numberOfLines={1}>{user?.fullName}</Text>
              <View style={styles.roleBadge}>
                <View style={styles.roleDot} />
                <Text style={styles.roleBadgeText}>{t('salon_admin') || 'Salon Admin'}</Text>
              </View>
            </View>
            <Pressable onPress={logout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={22} color={PRIMARY} />
            </Pressable>
          </View>
        </LinearGradient>

        {isLoading ? (
          <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* ─── Stat Cards with Gradients ─── */}
            <View style={styles.grid}>
              {statCards.map((card, i) => (
                <LinearGradient
                  key={i}
                  colors={[`${card.color}20`, `${card.color}05`]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.statCard}
                >
                  <View style={[styles.iconCircle, { backgroundColor: card.color }]}>
                    <Ionicons name={card.icon as any} size={20} color="#fff" />
                  </View>
                  <Text style={styles.statValue} numberOfLines={1}>{card.value}</Text>
                  <Text style={styles.statLabel} numberOfLines={1}>{card.label}</Text>
                </LinearGradient>
              ))}
            </View>

            {/* ─── Quick Actions ─── */}
            <Text style={styles.sectionTitle}>{t('quick_actions') || 'Quick Actions'}</Text>
            <View style={styles.quickGrid}>
              {quickActions.map((a, i) => (
                <Pressable
                  key={i}
                  onPress={() => router.push(a.route as any)}
                  style={({ pressed }) => [styles.quickCard, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}
                >
                  <View style={[styles.quickIconWrap, { backgroundColor: `${a.color}20` }]}>
                    <MaterialCommunityIcons name={a.icon as any} size={22} color={a.color} />
                  </View>
                  <Text style={styles.quickLabel} numberOfLines={1}>{a.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* ─── Today's Bookings ─── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('todays_bookings')}</Text>
              {bookings.length > 0 && (
                <Pressable onPress={() => router.push('/(salon-admin)/appointments')}>
                  <Text style={styles.seeAll}>{t('see_all') || 'See all'} →</Text>
                </Pressable>
              )}
            </View>
            {bookings.length === 0 ? (
              <View style={styles.emptyBox}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="calendar-outline" size={36} color={PRIMARY} />
                </View>
                <Text style={styles.emptyTitle}>{t('no_bookings_today') || 'No bookings today'}</Text>
                <Text style={styles.emptySub}>{t('no_bookings_sub') || 'New appointments will appear here.'}</Text>
              </View>
            ) : (
              bookings.map((b: any) => (
                <View key={b.id} style={styles.bookingCard}>
                  <View style={[styles.bookingTimeLine, { backgroundColor: statusColor[b.status] || '#888' }]} />
                  <View style={styles.bookingLeft}>
                    <View style={styles.bookingTopRow}>
                      <Text style={styles.bookingClient} numberOfLines={1}>{b.clientName || t('client_label')}</Text>
                      <Text style={styles.bookingTimeLabel}>{b.time}</Text>
                    </View>
                    <Text style={styles.bookingService} numberOfLines={1}>{b.serviceName || t('service_label')}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor[b.status] || '#888'}22` }]}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor[b.status] || '#888' }]} />
                      <Text style={[styles.statusText, { color: statusColor[b.status] || '#888' }]}>{statusLabel(b.status)}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },

  /* Hero */
  heroCard: { borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(244,164,96,0.15)' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  greeting: { color: '#B0B0B0', fontFamily: 'Urbanist_500Medium', fontSize: 14 },
  name: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 24, marginTop: 2 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(244,164,96,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  roleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: PRIMARY },
  roleBadgeText: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 11 },
  logoutBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER },

  /* Stat Cards */
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard: { backgroundColor: CARD, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 16, flex: 1, minWidth: Platform.OS === 'web' ? 170 : '45%' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 22, marginBottom: 4 },
  statLabel: { color: '#B0B0B0', fontFamily: 'Urbanist_500Medium', fontSize: 12 },

  /* Quick Actions */
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28, marginTop: 14 },
  quickCard: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, paddingVertical: 16, paddingHorizontal: 12, alignItems: 'center', gap: 10, flex: 1, minWidth: Platform.OS === 'web' ? 140 : '45%' },
  quickIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 12, textAlign: 'center' },

  /* Sections */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18, marginBottom: 14 },
  seeAll: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },

  /* Booking Cards */
  bookingCard: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'stretch', gap: 14 },
  bookingTimeLine: { width: 3, borderRadius: 2, minHeight: 60 },
  bookingLeft: { flex: 1 },
  bookingTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  bookingClient: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15, flex: 1 },
  bookingTimeLabel: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  bookingService: { color: '#B0B0B0', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginBottom: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: 'Urbanist_600SemiBold', fontSize: 11, textTransform: 'capitalize' },

  /* Empty */
  emptyBox: { alignItems: 'center', paddingVertical: 50, gap: 12, backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, borderStyle: 'dashed' },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(244,164,96,0.12)', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  emptySub: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
});
