import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, FlatList, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { type Booking } from '@/constants/data';

type TabType = 'upcoming' | 'completed' | 'cancelled';

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel?: () => void }) {
  const theme = useTheme();
  const statusColors = {
    upcoming: theme.primary,
    completed: theme.success,
    cancelled: theme.error,
  };

  return (
    <View style={[styles.bookingCard, { backgroundColor: theme.card }]}>
      <View style={styles.cardTop}>
        <Image source={{ uri: booking.salonImage }} style={styles.cardImage} contentFit="cover" />
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{booking.salonName}</Text>
          <Text style={[styles.cardServices, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{booking.services.join(', ')}</Text>
          <View style={[styles.statusPill, { backgroundColor: statusColors[booking.status] + '15' }]}>
            <Text style={[styles.statusPillText, { color: statusColors[booking.status], fontFamily: 'Urbanist_600SemiBold' }]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.cardDivider, { backgroundColor: theme.divider }]} />
      <View style={styles.cardBottom}>
        <View style={styles.cardDetail}>
          <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.cardDetailText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{booking.date}</Text>
        </View>
        <View style={styles.cardDetail}>
          <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.cardDetailText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{booking.time}</Text>
        </View>
        <Text style={[styles.cardPrice, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>${booking.totalPrice}</Text>
      </View>
      {booking.status === 'upcoming' && onCancel && (
        <View style={styles.cardActions}>
          <Pressable onPress={onCancel} style={({ pressed }) => [styles.cancelBtn, { borderColor: theme.primary, opacity: pressed ? 0.7 : 1 }]}>
            <Text style={[styles.cancelBtnText, { color: theme.primary, fontFamily: 'Urbanist_600SemiBold' }]}>Cancel Booking</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.viewBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}>
            <Text style={[styles.viewBtnText, { fontFamily: 'Urbanist_600SemiBold' }]}>View E-Receipt</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function BookingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { bookings, cancelBooking } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  const filtered = bookings.filter(b => b.status === activeTab);
  const tabs: TabType[] = ['upcoming', 'completed', 'cancelled'];

  const handleCancel = (id: string) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); cancelBooking(id); } },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>My Bookings</Text>
      </View>

      <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
        {tabs.map(tab => (
          <Pressable
            key={tab}
            onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
            style={[styles.tab, activeTab === tab && { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? '#fff' : theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
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
            <Ionicons name="calendar-outline" size={64} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>
              No {activeTab} bookings
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <BookingCard booking={item} onCancel={item.status === 'upcoming' ? () => handleCancel(item.id) : undefined} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 16 },
  title: { fontSize: 24 },
  tabBar: { flexDirection: 'row', marginHorizontal: 24, borderRadius: 16, padding: 4, marginBottom: 16 },
  tab: { flex: 1, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 14 },
  list: { paddingHorizontal: 24, paddingBottom: 100, gap: 16 },
  bookingCard: { borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: 'row', gap: 14 },
  cardImage: { width: 90, height: 90, borderRadius: 14 },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardName: { fontSize: 18, marginBottom: 4 },
  cardServices: { fontSize: 13, marginBottom: 8 },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusPillText: { fontSize: 11 },
  cardDivider: { height: 1, marginVertical: 14 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  cardDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardDetailText: { fontSize: 13 },
  cardPrice: { marginLeft: 'auto', fontSize: 18 },
  cardActions: { flexDirection: 'row', gap: 12, marginTop: 14 },
  cancelBtn: { flex: 1, height: 42, borderRadius: 21, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 14 },
  viewBtn: { flex: 1, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  viewBtnText: { fontSize: 14, color: '#fff' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
