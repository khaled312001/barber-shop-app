import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { goBack } from '@/lib/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';
import { useApp, type NotificationItem } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

function NotificationRow({ item }: { item: NotificationItem }) {
  const theme = useTheme();
  const iconMap: Record<string, any> = { booking: 'calendar', promo: 'pricetag', system: 'settings' };
  const colorMap: Record<string, string> = { booking: theme.primary, promo: theme.warning, system: theme.textSecondary };
  const timeStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';

  return (
    <View style={[styles.notifItem, { backgroundColor: item.read ? 'transparent' : theme.primary + '08' }]}>
      <View style={[styles.notifIcon, { backgroundColor: (colorMap[item.type] || theme.textSecondary) + '20' }]}>
        <Ionicons name={iconMap[item.type] || 'notifications'} size={22} color={colorMap[item.type] || theme.textSecondary} />
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{item.title}</Text>
        <Text style={[styles.notifMessage, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]} numberOfLines={2}>{item.message}</Text>
        <Text style={[styles.notifTime, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>{timeStr}</Text>
      </View>
      {!item.read && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
    </View>
  );
}

export default function NotificationsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { notifications, refreshNotifications } = useApp();
  const { t, isRTL } = useLanguage();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  useEffect(() => {
    refreshNotifications();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => goBack()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('notifications')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!notifications.length}
        renderItem={({ item }) => <NotificationRow item={item} />}
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
