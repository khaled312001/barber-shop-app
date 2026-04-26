import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Platform, Linking, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { goBack } from '@/lib/navigation';

const STATUS_META: Record<string, { color: string; icon: string; label: string }> = {
  upcoming: { color: '#F4A460', icon: 'time-outline', label: 'Upcoming' },
  pending: { color: '#F59E0B', icon: 'time-outline', label: 'Pending' },
  confirmed: { color: '#3B82F6', icon: 'checkmark-circle-outline', label: 'Confirmed' },
  completed: { color: '#10B981', icon: 'checkmark-done-outline', label: 'Completed' },
  cancelled: { color: '#EF4444', icon: 'close-circle-outline', label: 'Cancelled' },
};

export default function MyBookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const { bookings, cancelBooking } = useApp();

  const topPad = Platform.OS === 'web' ? 16 : insets.top;
  const booking = bookings.find((b: any) => b.id === id);
  const status = booking?.status || 'upcoming';
  const meta = STATUS_META[status] || STATUS_META.upcoming;

  // Fetch salon details for address, phone, lat/lng
  const { data: salon } = useQuery<any>({
    queryKey: ['salon-detail-for-booking', booking?.salonId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/salons/${booking?.salonId}`);
      return res.json();
    },
    enabled: !!booking?.salonId,
  });

  if (!booking) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: theme.textSecondary }}>{t('booking_not_found') || 'Booking not found'}</Text>
      </View>
    );
  }

  const services: string[] = Array.isArray((booking as any).services) ? (booking as any).services : (booking as any).serviceName ? [(booking as any).serviceName] : [];

  const [cancelling, setCancelling] = useState(false);
  const handleCancel = () => {
    const doCancel = async () => {
      if (cancelling) return;
      setCancelling(true);
      try {
        await cancelBooking(booking.id);
        if (Platform.OS === 'web') {
          alert(t('booking_cancelled') || 'Booking cancelled');
        } else {
          Alert.alert(t('booking_cancelled') || 'Booking cancelled');
        }
      } catch (err: any) {
        console.warn('cancel error', err);
        const msg = (err?.message || t('cancel_failed') || 'Failed to cancel booking');
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert(msg);
      } finally {
        setCancelling(false);
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm(t('cancel_booking_confirm') || 'Cancel this booking?')) doCancel();
    } else {
      Alert.alert(t('cancel_booking') || 'Cancel Booking', t('cancel_booking_confirm') || 'Cancel this booking?', [
        { text: t('no') || 'No', style: 'cancel' },
        { text: t('yes_cancel') || 'Yes, cancel', style: 'destructive', onPress: doCancel },
      ]);
    }
  };

  const handleCallSalon = () => {
    const phone = salon?.phone || (booking as any).salonPhone;
    if (phone) {
      if (Platform.OS === 'web') window.location.href = `tel:${phone}`;
      else Linking.openURL(`tel:${phone}`);
    } else {
      const msg = t('phone_not_available') || 'Phone number not available';
      if (Platform.OS === 'web') alert(msg); else Alert.alert(msg);
    }
  };

  const handleOpenMap = () => {
    const addr = salon?.address || (booking as any).salonAddress || booking?.salonName;
    const lat = salon?.latitude;
    const lng = salon?.longitude;
    let url = '';
    if (lat && lng && lat !== 0 && lng !== 0) {
      url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    } else if (addr) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
    } else {
      const msg = t('location_not_available') || 'Location not available';
      if (Platform.OS === 'web') alert(msg); else Alert.alert(msg);
      return;
    }
    if (Platform.OS === 'web') window.open(url, '_blank');
    else Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Pressable onPress={() => goBack()} style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={20} color={theme.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
            {t('booking_details') || 'Booking Details'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Status Hero */}
        <LinearGradient
          colors={[meta.color + '25', meta.color + '08']}
          style={styles.statusHero}
        >
          <View style={[styles.statusIcon, { backgroundColor: meta.color }]}>
            <Ionicons name={meta.icon as any} size={28} color="#fff" />
          </View>
          <Text style={[styles.statusTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
            {t(`status_${status}`) || meta.label}
          </Text>
          <Text style={[styles.statusSub, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
            #{booking.id?.slice(0, 8)?.toUpperCase()}
          </Text>
        </LinearGradient>

        {/* Salon Info Card */}
        <Pressable
          onPress={() => booking.salonId && router.push({ pathname: '/salon/[id]', params: { id: booking.salonId } })}
          style={[styles.salonCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          {booking.salonImage ? (
            <Image source={{ uri: booking.salonImage }} style={styles.salonImg} contentFit="cover" />
          ) : (
            <View style={[styles.salonImg, { backgroundColor: theme.primary + '15', alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="cut" size={28} color={theme.primary} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.salonLabel, { color: theme.primary, fontFamily: 'Urbanist_600SemiBold' }]}>
              {t('salon') || 'Salon'}
            </Text>
            <Text style={[styles.salonName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>
              {booking.salonName}
            </Text>
            {(booking as any).salonAddress && (
              <View style={styles.salonAddrRow}>
                <Ionicons name="location-outline" size={12} color={theme.textTertiary} />
                <Text style={[styles.salonAddr, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]} numberOfLines={1}>
                  {(booking as any).salonAddress}
                </Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
        </Pressable>

        {/* Date/Time/Price Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border, borderLeftColor: '#3B82F6' }]}>
            <Ionicons name="calendar" size={16} color="#3B82F6" />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('date') || 'Date'}</Text>
            <Text style={[styles.statValue, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>{booking.date}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border, borderLeftColor: '#F4A460' }]}>
            <Ionicons name="time" size={16} color="#F4A460" />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('time') || 'Time'}</Text>
            <Text style={[styles.statValue, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{booking.time}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border, borderLeftColor: '#10B981' }]}>
            <Ionicons name="cash" size={16} color="#10B981" />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('total') || 'Total'}</Text>
            <Text style={[styles.statValue, { color: '#10B981', fontFamily: 'Urbanist_700Bold' }]}>CHF {booking.totalPrice}</Text>
          </View>
        </View>

        {/* Services */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '20' }]}>
              <MaterialCommunityIcons name="content-cut" size={16} color={theme.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
              {t('services') || 'Services'}
            </Text>
            <View style={[styles.countBadge, { backgroundColor: theme.primary + '20' }]}>
              <Text style={[styles.countText, { color: theme.primary }]}>{services.length}</Text>
            </View>
          </View>
          {services.map((svc: string, i: number) => (
            <View key={i} style={[styles.serviceRow, i < services.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.divider }]}>
              <View style={[styles.serviceDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.serviceName, { color: theme.text, fontFamily: 'Urbanist_500Medium' }]}>{svc}</Text>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            </View>
          ))}
        </View>

        {/* QR Code for Check-in */}
        {(status === 'upcoming' || status === 'confirmed' || status === 'pending') && (
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border, alignItems: 'center' }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#10B98120' }]}>
                <MaterialCommunityIcons name="qrcode-scan" size={16} color="#10B981" />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                {t('checkin_qr') || 'Check-in QR Code'}
              </Text>
            </View>
            <Text style={[{ color: theme.textSecondary, fontSize: 12, fontFamily: 'Urbanist_400Regular', textAlign: 'center', marginBottom: 12, paddingHorizontal: 8 }]}>
              {t('show_qr_at_salon') || 'Show this QR code at the salon for fast check-in'}
            </Text>
            <View style={{ width: 200, height: 200, backgroundColor: '#fff', padding: 12, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
              <Image
                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({ type: 'booking', id: booking.id, salonId: booking.salonId }))}` }}
                style={{ width: 176, height: 176 }}
                contentFit="contain"
              />
            </View>
            <Text style={[{ color: theme.text, fontFamily: 'Urbanist_700Bold', fontSize: 13, marginTop: 12, letterSpacing: 1 }]}>
              #{booking.id?.slice(0, 8)?.toUpperCase()}
            </Text>
            <Text style={[{ color: theme.textTertiary, fontFamily: 'Urbanist_400Regular', fontSize: 11, marginTop: 2 }]}>
              {t('booking_id') || 'Booking ID'}
            </Text>
          </View>
        )}

        {/* Payment */}
        {(booking as any).paymentMethod && (
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="card" size={16} color="#10B981" />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                {t('payment') || 'Payment'}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentMethod, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>
                {(booking as any).paymentMethod}
              </Text>
              <View style={[styles.paidBadge, { backgroundColor: status === 'completed' ? '#10B98120' : theme.primary + '20' }]}>
                <Text style={[styles.paidBadgeText, { color: status === 'completed' ? '#10B981' : theme.primary }]}>
                  {status === 'completed' ? (t('paid') || 'Paid') : (t('pending') || 'Pending')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          {(booking as any).salonPhone && (
            <Pressable onPress={handleCallSalon} style={[styles.quickActionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="call" size={18} color="#10B981" />
              <Text style={[styles.quickActionText, { color: theme.text }]}>{t('call_salon') || 'Call'}</Text>
            </Pressable>
          )}
          <Pressable onPress={handleOpenMap} style={[styles.quickActionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="map" size={18} color="#3B82F6" />
            <Text style={[styles.quickActionText, { color: theme.text }]}>{t('directions') || 'Directions'}</Text>
          </Pressable>
          <Pressable
            onPress={() => booking.salonId && router.push({ pathname: '/chat/[id]', params: { id: booking.salonId, name: booking.salonName, image: booking.salonImage || '' } })}
            style={[styles.quickActionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Ionicons name="chatbubble" size={18} color={theme.primary} />
            <Text style={[styles.quickActionText, { color: theme.text }]}>{t('chat') || 'Chat'}</Text>
          </Pressable>
        </View>

        {/* Cancel button if upcoming */}
        {(status === 'upcoming' || status === 'pending' || status === 'confirmed') && (
          <Pressable onPress={handleCancel} style={[styles.cancelBtn, { borderColor: '#EF4444' }]}>
            <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
            <Text style={styles.cancelBtnText}>{t('cancel_booking') || 'Cancel Booking'}</Text>
          </Pressable>
        )}

        {/* Rebook button — available for any past or current booking with a salon */}
        {booking.salonId && (
          <Pressable
            onPress={() => {
              const params: Record<string, string> = { id: booking.salonId };
              if (services.length) params.services = services.join(',');
              const anyB: any = booking as any;
              if (anyB.specialistId) params.specialistId = String(anyB.specialistId);
              if (anyB.specialist) params.specialist = String(anyB.specialist);
              if (anyB.totalPrice) params.price = String(anyB.totalPrice);
              if (anyB.duration) params.duration = String(anyB.duration);
              params.rebookFrom = booking.id;
              router.push({ pathname: '/booking/[id]', params });
            }}
            style={[styles.rebookBtn, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.rebookBtnText}>{t('rebook') || t('book_again') || 'Book Again'}</Text>
          </Pressable>
        )}

        {/* Post a reel — available for completed bookings */}
        {status === 'completed' && booking.salonId && (
          <Pressable
            onPress={() => router.push({ pathname: '/reels/new', params: { salonId: booking.salonId, bookingId: booking.id } } as any)}
            style={[styles.rebookBtn, { backgroundColor: '#181A20', borderColor: theme.primary, borderWidth: 1.5 }]}
          >
            <Ionicons name="videocam" size={18} color={theme.primary} />
            <Text style={[styles.rebookBtnText, { color: theme.primary }]}>{t('post_reel') || 'Post a Reel'}</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 18, textAlign: 'center' },

  statusHero: { alignItems: 'center', paddingVertical: 28, marginHorizontal: 16, borderRadius: 20, marginBottom: 16 },
  statusIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  statusTitle: { fontSize: 20, marginBottom: 4 },
  statusSub: { fontSize: 12, letterSpacing: 1 },

  salonCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  salonImg: { width: 56, height: 56, borderRadius: 14 },
  salonLabel: { fontSize: 11, marginBottom: 2 },
  salonName: { fontSize: 16, marginBottom: 4 },
  salonAddrRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  salonAddr: { fontSize: 12 },

  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  statBox: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, borderLeftWidth: 3, gap: 4 },
  statLabel: { fontFamily: 'Urbanist_400Regular', fontSize: 11 },
  statValue: { fontSize: 14 },

  section: { marginHorizontal: 16, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, flex: 1 },
  countBadge: { minWidth: 24, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  countText: { fontFamily: 'Urbanist_700Bold', fontSize: 12 },

  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  serviceDot: { width: 6, height: 6, borderRadius: 3 },
  serviceName: { flex: 1, fontSize: 14 },

  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentMethod: { fontSize: 14 },
  paidBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  paidBadgeText: { fontFamily: 'Urbanist_700Bold', fontSize: 11 },

  quickActionsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  quickActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  quickActionText: { fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },

  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginTop: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  cancelBtnText: { color: '#EF4444', fontFamily: 'Urbanist_700Bold', fontSize: 14 },

  rebookBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginTop: 8, paddingVertical: 14, borderRadius: 14 },
  rebookBtnText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 14 },
});
