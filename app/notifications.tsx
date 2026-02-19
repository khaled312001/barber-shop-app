import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';
import { mockNotifications, type Notification } from '@/constants/data';

function NotificationItem({ item }: { item: Notification }) {
  const theme = useTheme();
  const iconMap = { booking: 'calendar' as const, promo: 'pricetag' as const, system: 'settings' as const };
  const colorMap = { booking: theme.primary, promo: theme.warning, system: theme.textSecondary };

  return (
    <View style={[styles.notifItem, { backgroundColor: item.read ? 'transparent' : theme.primary + '08' }]}>
      <View style={[styles.notifIcon, { backgroundColor: colorMap[item.type] + '20' }]}>
        <Ionicons name={iconMap[item.type]} size={22} color={colorMap[item.type]} />
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{item.title}</Text>
        <Text style={[styles.notifMessage, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]} numberOfLines={2}>{item.message}</Text>
        <Text style={[styles.notifTime, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>{item.time}</Text>
      </View>
      {!item.read && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
    </View>
  );
}

export default function NotificationsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={mockNotifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={mockNotifications.length > 0}
        renderItem={({ item }) => <NotificationItem item={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 20, textAlign: 'center' },
  list: { paddingHorizontal: 24, paddingBottom: 20 },
  notifItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14, gap: 12, borderRadius: 12, paddingHorizontal: 8, marginBottom: 4 },
  notifIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 16, marginBottom: 2 },
  notifMessage: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 12 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
});
