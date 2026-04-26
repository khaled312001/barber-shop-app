import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';
import { goBack } from '@/lib/navigation';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

const STATUS_COLOR: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  upcoming: '#3B82F6',
  completed: '#10B981',
  cancelled: '#EF4444',
};

export default function StaffProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const { data, isLoading } = useQuery<any>({
    queryKey: ['salon-staff-profile', id],
    queryFn: async () => {
      const r = await apiRequest('GET', `/api/salon/staff/${id}/profile`);
      if (!r.ok) return null;
      return r.json();
    },
    enabled: !!id,
  });

  if (isLoading || !data) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 60 }} />
      </View>
    );
  }

  const { user, staffRole, bookings: staffBookings = [], stats = {} } = data;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('staff_profile') || 'Staff Profile'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 60 }} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, { backgroundColor: `${PRIMARY}22`, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="person" size={36} color={PRIMARY} />
            </View>
          )}
          <Text style={styles.name}>{user?.fullName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{staffRole === 'salon_admin' ? (t('salon_admin') || 'Salon Admin') : (t('staff') || 'Staff')}</Text>
          </View>
          <View style={styles.contactRow}>
            {user?.email ? (
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={14} color="#888" />
                <Text style={styles.contactText}>{user.email}</Text>
              </View>
            ) : null}
            {user?.phone ? (
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={14} color="#888" />
                <Text style={styles.contactText}>{user.phone}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: PRIMARY }]}>
            <Text style={[styles.statValue, { color: PRIMARY }]}>{stats.totalBookings || 0}</Text>
            <Text style={styles.statLabel}>{t('total_bookings') || 'Total'}</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.completed || 0}</Text>
            <Text style={styles.statLabel}>{t('status_completed') || 'Completed'}</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#EF4444' }]}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.cancelled || 0}</Text>
            <Text style={styles.statLabel}>{t('status_cancelled') || 'Cancelled'}</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}>
            <Text style={[styles.statValue, { color: '#3B82F6' }]}>CHF {Number(stats.totalRevenue || 0).toFixed(0)}</Text>
            <Text style={styles.statLabel}>{t('revenue') || 'Revenue'}</Text>
          </View>
        </View>

        {/* Bookings history */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Text style={styles.sectionTitle}>{t('bookings_history') || 'Bookings History'}</Text>
          {staffBookings.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={36} color={BORDER} />
              <Text style={styles.emptyText}>{t('no_bookings') || 'No bookings yet'}</Text>
            </View>
          ) : (
            staffBookings.map((b: any) => {
              const color = STATUS_COLOR[b.status] || PRIMARY;
              return (
                <View key={b.id} style={[styles.bookingCard, { borderLeftColor: color }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookingClient}>
                      {Array.isArray(b.services) ? b.services.join(', ') : (b.serviceName || '—')}
                    </Text>
                    <View style={styles.bookingMeta}>
                      <Ionicons name="calendar-outline" size={12} color="#888" />
                      <Text style={styles.bookingMetaText}>{b.date}</Text>
                      <Ionicons name="time-outline" size={12} color="#888" style={{ marginLeft: 8 }} />
                      <Text style={styles.bookingMetaText}>{b.time}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: color + '22', borderColor: color }]}>
                    <Text style={[styles.statusText, { color }]}>{b.status}</Text>
                  </View>
                  <Text style={[styles.bookingPrice, { color: PRIMARY }]}>CHF {b.totalPrice}</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff10', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 17 },

  profileCard: { backgroundColor: CARD, marginHorizontal: 20, marginTop: 20, padding: 24, borderRadius: 18, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 14 },
  name: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 22, marginBottom: 6 },
  roleBadge: { backgroundColor: `${PRIMARY}22`, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 12 },
  roleText: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 11, letterSpacing: 0.5 },
  contactRow: { gap: 8, alignItems: 'center' },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactText: { color: '#aaa', fontFamily: 'Urbanist_500Medium', fontSize: 12 },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, marginTop: 16 },
  statCard: { flex: 1, minWidth: 140, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderLeftWidth: 4, borderRadius: 12, padding: 12 },
  statValue: { fontFamily: 'Urbanist_700Bold', fontSize: 20 },
  statLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 11, marginTop: 2 },

  sectionTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16, marginBottom: 12 },
  empty: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13 },
  bookingCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderLeftWidth: 4, padding: 12, borderRadius: 12, marginBottom: 8 },
  bookingClient: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 13 },
  bookingMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  bookingMetaText: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 11 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusText: { fontFamily: 'Urbanist_700Bold', fontSize: 10, textTransform: 'uppercase' },
  bookingPrice: { fontFamily: 'Urbanist_700Bold', fontSize: 13 },
});
