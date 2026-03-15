import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, useColorScheme, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

export default function SalonDashboard() {
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
    { label: "Today's Bookings", value: stats?.todayBookings ?? 0, icon: 'calendar', color: '#6C63FF' },
    { label: "Today's Revenue", value: `$${(stats?.todayRevenue ?? 0).toFixed(0)}`, icon: 'cash', color: '#4CAF50' },
    { label: 'Total Clients', value: stats?.totalCustomers ?? 0, icon: 'people', color: '#2196F3' },
    { label: 'Active Staff', value: stats?.staffCount ?? 0, icon: 'person', color: PRIMARY },
  ];

  const statusColor: Record<string, string> = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    completed: '#10B981',
    cancelled: '#EF4444',
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? BG : colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>مرحباً بك 👋</Text>
            <Text style={styles.name}>{user?.fullName}</Text>
          </View>
          <Pressable onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={PRIMARY} />
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Stat Cards */}
            <View style={styles.grid}>
              {statCards.map((card, i) => (
                <View key={i} style={styles.statCard}>
                  <View style={[styles.iconCircle, { backgroundColor: `${card.color}22` }]}>
                    <Ionicons name={card.icon as any} size={22} color={card.color} />
                  </View>
                  <Text style={styles.statValue}>{card.value}</Text>
                  <Text style={styles.statLabel}>{card.label}</Text>
                </View>
              ))}
            </View>

            {/* Today's Bookings */}
            <Text style={styles.sectionTitle}>حجوزات اليوم</Text>
            {bookings.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="calendar-outline" size={40} color={BORDER} />
                <Text style={styles.emptyText}>لا يوجد حجوزات اليوم</Text>
              </View>
            ) : (
              bookings.map((b: any) => (
                <View key={b.id} style={styles.bookingCard}>
                  <View style={styles.bookingLeft}>
                    <Text style={styles.bookingClient}>{b.clientName || 'عميل'}</Text>
                    <Text style={styles.bookingService}>{b.serviceName || 'خدمة'}</Text>
                    <Text style={styles.bookingTime}>{b.time}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor[b.status] || '#888'}22` }]}>
                    <Text style={[styles.statusText, { color: statusColor[b.status] || '#888' }]}>{b.status}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  greeting: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 14 },
  name: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 22, marginTop: 2 },
  logoutBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, flex: 1, minWidth: Platform.OS === 'web' ? 180 : '45%', alignItems: 'flex-start' },
  iconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 22, marginBottom: 4 },
  statLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 12 },
  sectionTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18, marginBottom: 14 },
  bookingCard: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bookingLeft: { flex: 1 },
  bookingClient: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 15, marginBottom: 2 },
  bookingService: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginBottom: 4 },
  bookingTime: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontFamily: 'Urbanist_600SemiBold', fontSize: 12, textTransform: 'capitalize' },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 14 },
});
