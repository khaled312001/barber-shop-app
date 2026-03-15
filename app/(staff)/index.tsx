import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';
import { useApp } from '@/contexts/AppContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function StaffSchedule() {
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const today = new Date();
  const todayName = DAYS[today.getDay()];

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>أهلاً 👋</Text>
            <Text style={styles.name}>{user?.fullName}</Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{todayName}</Text>
            <Text style={styles.dateNum}>{today.getDate()}</Text>
          </View>
        </View>

        {/* Today's Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="calendar" size={22} color="#3B82F6" />
            <Text style={styles.summaryValue}>{todayBookings.length}</Text>
            <Text style={styles.summaryLabel}>حجز اليوم</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="checkmark-circle" size={22} color="#10B981" />
            <Text style={styles.summaryValue}>{todayBookings.filter((b: any) => b.status === 'completed').length}</Text>
            <Text style={styles.summaryLabel}>مكتمل</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="time" size={22} color={PRIMARY} />
            <Text style={styles.summaryValue}>{todayBookings.filter((b: any) => b.status === 'pending' || b.status === 'confirmed').length}</Text>
            <Text style={styles.summaryLabel}>قادم</Text>
          </View>
        </View>

        {/* Today's Bookings */}
        <Text style={styles.sectionTitle}>حجوزات اليوم</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 24 }} />
        ) : todayBookings.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="sunny-outline" size={44} color={BORDER} />
            <Text style={styles.emptyText}>لا توجد حجوزات اليوم 🎉</Text>
          </View>
        ) : (
          todayBookings.map((b: any) => (
            <View key={b.id} style={styles.bookingCard}>
              <View style={[styles.timeLine, { backgroundColor: statusColor[b.status] || '#888' }]} />
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingTime}>{b.time || '—'}</Text>
                <Text style={styles.bookingClient}>{b.clientName || 'عميل'}</Text>
                <Text style={styles.bookingService}>{b.serviceName || 'خدمة'}</Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: statusColor[b.status] || '#888' }]} />
            </View>
          ))
        )}

        {/* Weekly Shifts */}
        {shifts.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>جدول الوردايات</Text>
            {shifts.map((s: any, i: number) => (
              <View key={i} style={styles.shiftCard}>
                <View style={styles.shiftDay}>
                  <Text style={styles.shiftDayText}>{s.day || `يوم ${i + 1}`}</Text>
                </View>
                <Text style={styles.shiftTime}>{s.startTime || '09:00'} — {s.endTime || '17:00'}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, marginTop: 8 },
  greeting: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 14 },
  name: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 22, marginTop: 2 },
  dateBadge: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 12, alignItems: 'center', minWidth: 60 },
  dateText: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 12 },
  dateNum: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 22 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  summaryCard: { flex: 1, backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, alignItems: 'center', gap: 6 },
  summaryValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 22 },
  summaryLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 11, textAlign: 'center' },
  sectionTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18, marginBottom: 14 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 14 },
  bookingCard: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 14 },
  timeLine: { width: 4, height: 50, borderRadius: 2 },
  bookingInfo: { flex: 1 },
  bookingTime: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 13, marginBottom: 2 },
  bookingClient: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15, marginBottom: 2 },
  bookingService: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  shiftCard: { backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 16 },
  shiftDay: { backgroundColor: `${PRIMARY}22`, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  shiftDayText: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 13 },
  shiftTime: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 14 },
});
