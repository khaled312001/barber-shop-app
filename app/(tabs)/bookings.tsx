import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, FlatList, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp, type Booking } from '@/contexts/AppContext';

type TabType = 'upcoming' | 'completed' | 'cancelled';

// Cross-platform confirm (Alert.alert doesn't always fire on web)
function confirmDialog(title: string, message: string, confirmLabel: string, cancelLabel: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    // Use window.confirm on web
    const ok = typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`);
    if (ok) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel' },
      { text: confirmLabel, style: 'destructive', onPress: onConfirm },
    ]);
  }
}

function BookingCard({ booking, onCancel, onViewDetails, onRebook, t }: {
  booking: Booking;
  onCancel?: () => void;
  onViewDetails: () => void;
  onRebook?: () => void;
  t: (key: string) => string;
}) {
  const theme = useTheme();
  const statusColors: Record<string, string> = {
    upcoming: theme.primary,
    completed: theme.success,
    cancelled: theme.error,
  };
  const statusIcons: Record<string, any> = {
    upcoming: 'time-outline',
    completed: 'checkmark-circle',
    cancelled: 'close-circle',
  };

  return (
    <Pressable
      onPress={onViewDetails}
      style={({ pressed }) => [styles.bookingCard, { backgroundColor: theme.card, opacity: pressed ? 0.97 : 1 }]}
    >
      <View style={styles.cardTop}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: booking.salonImage }} style={styles.cardImage} contentFit="cover" />
          <View style={[styles.statusBadge, { backgroundColor: statusColors[booking.status] }]}>
            <Ionicons name={statusIcons[booking.status]} size={12} color="#fff" />
          </View>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>
            {booking.salonName}
          </Text>
          <Text style={[styles.cardServices, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]} numberOfLines={2}>
            {(Array.isArray(booking.services) ? booking.services : []).join(' • ') || t('service_label')}
          </Text>
          <View style={[styles.statusPill, { backgroundColor: statusColors[booking.status] + '18' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColors[booking.status] }]} />
            <Text style={[styles.statusPillText, { color: statusColors[booking.status], fontFamily: 'Urbanist_600SemiBold' }]}>
              {t(booking.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.cardDivider, { backgroundColor: theme.divider }]} />

      <View style={styles.cardBottom}>
        <View style={styles.cardDetail}>
          <View style={[styles.detailIconWrap, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="calendar-outline" size={14} color={theme.primary} />
          </View>
          <Text style={[styles.cardDetailText, { color: theme.text, fontFamily: 'Urbanist_500Medium' }]} numberOfLines={1}>
            {booking.date}
          </Text>
        </View>
        <View style={styles.cardDetail}>
          <View style={[styles.detailIconWrap, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="time-outline" size={14} color={theme.primary} />
          </View>
          <Text style={[styles.cardDetailText, { color: theme.text, fontFamily: 'Urbanist_500Medium' }]} numberOfLines={1}>
            {booking.time}
          </Text>
        </View>
        <Text style={[styles.cardPrice, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>
          CHF {booking.totalPrice}
        </Text>
      </View>

      {booking.status === 'upcoming' && onCancel && (
        <View style={styles.cardActions}>
          <Pressable
            onPress={(e) => { e.stopPropagation(); onCancel(); }}
            style={({ pressed }) => [styles.cancelBtn, { borderColor: theme.primary, opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="close-outline" size={16} color={theme.primary} />
            <Text style={[styles.cancelBtnText, { color: theme.primary, fontFamily: 'Urbanist_600SemiBold' }]}>
              {t('cancel_booking') || 'Cancel'}
            </Text>
          </Pressable>
          <Pressable
            onPress={(e) => { e.stopPropagation(); onViewDetails(); }}
            style={({ pressed }) => [styles.viewBtn, { opacity: pressed ? 0.85 : 1 }]}
          >
            <LinearGradient
              colors={[theme.primary, '#E8924A']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.viewBtnGradient}
            >
              <Text style={[styles.viewBtnText, { fontFamily: 'Urbanist_700Bold' }]}>
                {t('view_details') || t('view_receipt') || 'View Details'}
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {booking.status === 'completed' && onRebook && (
        <View style={styles.cardActions}>
          <Pressable
            onPress={(e) => { e.stopPropagation(); onViewDetails(); }}
            style={({ pressed }) => [styles.cancelBtn, { borderColor: theme.border, opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="receipt-outline" size={16} color={theme.text} />
            <Text style={[styles.cancelBtnText, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>
              {t('view_receipt') || 'Receipt'}
            </Text>
          </Pressable>
          <Pressable
            onPress={(e) => { e.stopPropagation(); onRebook(); }}
            style={({ pressed }) => [styles.viewBtn, { opacity: pressed ? 0.85 : 1 }]}
          >
            <LinearGradient
              colors={[theme.primary, '#E8924A']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.viewBtnGradient}
            >
              <Ionicons name="refresh" size={14} color="#fff" />
              <Text style={[styles.viewBtnText, { fontFamily: 'Urbanist_700Bold' }]}>
                {t('book_again') || 'Book Again'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

export default function BookingsScreen() {
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const { bookings, cancelBooking } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  const filtered = bookings.filter(b => b.status === activeTab);
  const tabs: TabType[] = ['upcoming', 'completed', 'cancelled'];

  const tabCounts = {
    upcoming: bookings.filter(b => b.status === 'upcoming').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const handleCancel = (id: string) => {
    confirmDialog(
      t('cancel_booking') || 'Cancel Booking',
      t('cancel_booking_confirm') || 'Are you sure you want to cancel this booking?',
      t('yes_cancel') || 'Yes, Cancel',
      t('no_cancel') || 'Keep',
      () => {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        cancelBooking(id);
      }
    );
  };

  const handleViewDetails = (booking: Booking) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    // Open the booking details page
    if (booking.id) {
      router.push({ pathname: '/my-booking/[id]', params: { id: booking.id } });
    }
  };

  const handleRebook = (booking: Booking) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    if (booking.salonId) {
      router.push({ pathname: '/salon/[id]', params: { id: booking.salonId } });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
          {t('my_bookings') || 'My Bookings'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
          {bookings.length > 0
            ? (t('bookings_count') || '{n} total').replace('{n}', String(bookings.length))
            : (t('no_bookings_yet') || 'Your bookings will appear here')}
        </Text>
      </View>

      {/* Tabs with counts */}
      <View style={[styles.tabBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {tabs.map(tab => (
          <Pressable
            key={tab}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              setActiveTab(tab);
            }}
            style={({ pressed }) => [
              styles.tab,
              activeTab === tab && { backgroundColor: theme.primary },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab ? '#fff' : theme.textSecondary,
                  fontFamily: activeTab === tab ? 'Urbanist_700Bold' : 'Urbanist_600SemiBold',
                },
              ]}
            >
              {t(tab).charAt(0).toUpperCase() + t(tab).slice(1)}
            </Text>
            {tabCounts[tab] > 0 && (
              <View style={[
                styles.tabBadge,
                { backgroundColor: activeTab === tab ? 'rgba(255,255,255,0.25)' : theme.primary + '20' }
              ]}>
                <Text style={[
                  styles.tabBadgeText,
                  {
                    color: activeTab === tab ? '#fff' : theme.primary,
                    fontFamily: 'Urbanist_700Bold',
                  }
                ]}>
                  {tabCounts[tab]}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        scrollEnabled={filtered.length > 0}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconWrap, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="calendar-outline" size={48} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
              {(t('no_bookings') || 'No {status} bookings').replace('{status}', t(activeTab).toLowerCase())}
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
              {activeTab === 'upcoming'
                ? (t('book_first_appointment') || 'Explore salons and book your first appointment.')
                : (t('history_will_appear') || 'Your history will appear here.')}
            </Text>
            {activeTab === 'upcoming' && (
              <Pressable
                onPress={() => router.push('/(tabs)')}
                style={({ pressed }) => [styles.ctaBtn, { opacity: pressed ? 0.85 : 1 }]}
              >
                <LinearGradient
                  colors={[theme.primary, '#E8924A']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.ctaBtnGradient}
                >
                  <Ionicons name="search" size={16} color="#fff" />
                  <Text style={[styles.ctaBtnText, { fontFamily: 'Urbanist_700Bold' }]}>
                    {t('explore_salons') || 'Explore Salons'}
                  </Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onCancel={item.status === 'upcoming' ? () => handleCancel(item.id) : undefined}
            onViewDetails={() => handleViewDetails(item)}
            onRebook={item.status === 'completed' ? () => handleRebook(item) : undefined}
            t={t}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 16 },
  title: { fontSize: 28, marginBottom: 4 },
  subtitle: { fontSize: 13 },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  tabText: { fontSize: 13 },
  tabBadge: {
    paddingHorizontal: 7,
    minWidth: 22,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: { fontSize: 11 },

  list: { paddingHorizontal: 24, paddingBottom: 120, gap: 14 },

  bookingCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTop: { flexDirection: 'row', gap: 14 },
  imageWrap: { position: 'relative' },
  cardImage: { width: 88, height: 88, borderRadius: 16 },
  statusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardName: { fontSize: 17, marginBottom: 4 },
  cardServices: { fontSize: 13, marginBottom: 8 },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusPillText: { fontSize: 11, textTransform: 'capitalize' },

  cardDivider: { height: 1, marginVertical: 14 },

  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  cardDetail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetailText: { fontSize: 12 },
  cardPrice: { marginLeft: 'auto', fontSize: 17 },

  cardActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  cancelBtnText: { fontSize: 13 },
  viewBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewBtnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  viewBtnText: { fontSize: 13, color: '#fff' },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', maxWidth: 280, lineHeight: 20 },
  ctaBtn: { marginTop: 16, borderRadius: 14, overflow: 'hidden' },
  ctaBtnGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaBtnText: { color: '#fff', fontSize: 14 },
});
