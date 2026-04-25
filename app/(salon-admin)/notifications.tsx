import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

const typeConfig: Record<string, { icon: string; color: string }> = {
  booking: { icon: 'calendar', color: '#3B82F6' },
  message: { icon: 'chatbubble', color: '#10B981' },
  system: { icon: 'information-circle', color: '#6C63FF' },
  payment: { icon: 'cash', color: '#F59E0B' },
  review: { icon: 'star', color: '#EC4899' },
  cancel: { icon: 'close-circle', color: '#EF4444' },
  promotion: { icon: 'pricetag', color: PRIMARY },
};

export default function SalonNotifications() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const qc = useQueryClient();

  const { data: notifs = [], isLoading } = useQuery({
    queryKey: ['salon-notifications'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/notifications');
      return res.json();
    },
    refetchInterval: 15000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => apiRequest('PUT', `/api/salon/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salon-notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => apiRequest('PUT', '/api/salon/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salon-notifications'] }),
  });

  const unreadCount = notifs.filter((n: any) => !n.read).length;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return t('just_now') || 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>{t('notifications') || 'Notifications'}</Text>
          <View style={styles.subtitleRow}>
            <View style={[styles.statusDot, { backgroundColor: unreadCount > 0 ? PRIMARY : '#10B981' }]} />
            <Text style={styles.subtitle}>
              {unreadCount > 0
                ? `${unreadCount} ${t('unread') || 'unread'} · ${notifs.length} ${t('total') || 'total'}`
                : `${notifs.length} ${t('notifications_count') || 'notifications'}`}
            </Text>
          </View>
        </View>
        {unreadCount > 0 ? (
          <Pressable onPress={() => markAllRead.mutate()} style={({ pressed }) => [styles.readAllBtn, pressed && { opacity: 0.85 }]}>
            <Ionicons name="checkmark-done" size={16} color="#181A20" />
            <Text style={styles.readAllText}>{t('mark_all_read') || 'Mark all read'}</Text>
          </Pressable>
        ) : (
          <View style={styles.headerBadge}>
            <Ionicons name="notifications" size={22} color={PRIMARY} />
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}><ActivityIndicator size="large" color={PRIMARY} /></View>
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons name="bell-off-outline" size={40} color={PRIMARY} />
              </View>
              <Text style={styles.emptyTitle}>{t('no_notifications') || 'No notifications'}</Text>
              <Text style={styles.emptySubtitle}>{t('notifications_will_appear') || 'New alerts will appear here'}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const conf = typeConfig[item.type] || typeConfig.system;
            return (
              <Pressable
                onPress={() => { if (!item.read) markRead.mutate(item.id); }}
                style={({ pressed }) => [
                  styles.notifRow,
                  !item.read && styles.notifUnread,
                  !item.read && { borderColor: conf.color + '40' },
                  pressed && { opacity: 0.92 },
                ]}
              >
                <View style={[styles.notifIcon, { backgroundColor: conf.color + '22', borderColor: conf.color + '40' }]}>
                  <Ionicons name={conf.icon as any} size={18} color={conf.color} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTopRow}>
                    <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.notifTime, !item.read && { color: conf.color, fontFamily: 'Urbanist_700Bold' }]}>
                      {formatTime(item.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.notifMsg} numberOfLines={2}>{item.message}</Text>
                </View>
                {!item.read && <View style={[styles.unreadDot, { backgroundColor: conf.color }]} />}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 8, marginBottom: 18 },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 26 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  subtitle: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 12 },
  headerBadge: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(244,164,96,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(244,164,96,0.3)' },
  readAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: PRIMARY, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  readAllText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 12 },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, gap: 10 },
  emptyIcon: { width: 96, height: 96, borderRadius: 32, backgroundColor: 'rgba(244,164,96,0.15)', borderWidth: 1, borderColor: 'rgba(244,164,96,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 17 },
  emptySubtitle: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13, textAlign: 'center' },

  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, marginBottom: 8 },
  notifUnread: { backgroundColor: 'rgba(244,164,96,0.06)' },
  notifIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  notifContent: { flex: 1 },
  notifTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 8 },
  notifTitle: { color: '#ccc', fontFamily: 'Urbanist_600SemiBold', fontSize: 14, flex: 1 },
  notifTitleUnread: { color: '#fff', fontFamily: 'Urbanist_700Bold' },
  notifTime: { color: '#666', fontFamily: 'Urbanist_500Medium', fontSize: 11 },
  notifMsg: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 12, lineHeight: 17 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
});
