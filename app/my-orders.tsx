import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { apiRequest } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { goBack } from '@/lib/navigation';

const STATUS_META: Record<string, { color: string; icon: string; bg: string }> = {
  pending: { color: '#F59E0B', icon: 'time-outline', bg: '#F59E0B20' },
  confirmed: { color: '#3B82F6', icon: 'checkmark-circle-outline', bg: '#3B82F620' },
  shipped: { color: '#6366F1', icon: 'paper-plane-outline', bg: '#6366F120' },
  delivered: { color: '#10B981', icon: 'checkmark-done-outline', bg: '#10B98120' },
  cancelled: { color: '#EF4444', icon: 'close-circle-outline', bg: '#EF444420' },
};

export default function MyOrdersScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const topPad = Platform.OS === 'web' ? 16 : insets.top;
  const PRIMARY = theme.primary;

  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ['my-product-orders'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/product-orders/my');
      return res.json();
    },
  });

  const activeOrders = orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  const formatDate = (d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const renderOrder = (order: any) => {
    const meta = STATUS_META[order.status] || STATUS_META.pending;
    const items: any[] = Array.isArray(order.items) ? order.items : (() => { try { return JSON.parse(order.items); } catch { return []; } })();
    return (
      <View key={order.id} style={[styles.orderCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.orderHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.orderNum, { color: theme.textSecondary }]}>
              <Ionicons name="receipt-outline" size={11} /> #{order.id?.slice(0, 8)?.toUpperCase()}
            </Text>
            <Text style={[styles.orderDate, { color: theme.text }]}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
            <Ionicons name={meta.icon as any} size={11} color={meta.color} />
            <Text style={[styles.statusText, { color: meta.color }]}>
              {t(`order_${order.status}`) || order.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Items preview */}
        <View style={styles.itemsRow}>
          {items.slice(0, 4).map((item: any, i: number) => (
            <View key={i} style={[styles.itemThumb, { backgroundColor: theme.background }]}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              ) : (
                <Ionicons name="cube-outline" size={20} color={theme.textTertiary} />
              )}
              <View style={[styles.itemQty, { backgroundColor: PRIMARY }]}>
                <Text style={styles.itemQtyText}>{item.qty}</Text>
              </View>
            </View>
          ))}
          {items.length > 4 && (
            <View style={[styles.itemThumb, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={[styles.moreItems, { color: theme.text }]}>+{items.length - 4}</Text>
            </View>
          )}
        </View>

        {/* Order info */}
        <View style={[styles.orderFooter, { borderTopColor: theme.divider }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.footerLabel, { color: theme.textTertiary }]}>{t('items') || 'Items'}</Text>
            <Text style={[styles.footerValue, { color: theme.text }]}>{items.length}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.footerLabel, { color: theme.textTertiary }]}>{t('payment') || 'Payment'}</Text>
            <Text style={[styles.footerValue, { color: theme.text }]} numberOfLines={1}>{order.paymentMethod?.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={[styles.footerLabel, { color: theme.textTertiary }]}>{t('total') || 'Total'}</Text>
            <Text style={[styles.footerTotal, { color: PRIMARY }]}>CHF {order.totalPrice}</Text>
          </View>
        </View>

        {/* Track button */}
        {order.status !== 'cancelled' && (
          <View style={styles.trackingBar}>
            {['pending', 'confirmed', 'shipped', 'delivered'].map((step, i, arr) => {
              const stepIdx = arr.indexOf(order.status);
              const isActive = i <= stepIdx;
              return (
                <React.Fragment key={step}>
                  <View style={[styles.trackDot, { backgroundColor: isActive ? PRIMARY : theme.border }]} />
                  {i < arr.length - 1 && <View style={[styles.trackLine, { backgroundColor: isActive && i < stepIdx ? PRIMARY : theme.border }]} />}
                </React.Fragment>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Header */}
        <LinearGradient colors={[PRIMARY + '20', theme.background]} style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Pressable onPress={() => goBack()} style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={20} color={theme.text} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.title, { color: theme.text }]}>{t('my_orders') || 'My Orders'}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {orders.length} {t('total_orders') || 'orders total'}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </LinearGradient>

        {isLoading ? (
          <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 60 }} />
        ) : orders.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.card }]}>
              <Ionicons name="bag-outline" size={48} color={theme.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('no_orders_yet') || 'No orders yet'}</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>{t('start_shopping_msg') || 'Start shopping for premium salon products'}</Text>
            <Pressable onPress={() => router.push('/(tabs)/shop' as any)} style={[styles.shopBtn, { backgroundColor: PRIMARY }]}>
              <Ionicons name="bag-handle" size={18} color="#fff" />
              <Text style={styles.shopBtnText}>{t('go_to_shop') || 'Go to Shop'}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionDot, { backgroundColor: PRIMARY }]} />
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    {t('active_orders') || 'Active Orders'}
                  </Text>
                  <View style={[styles.countBadge, { backgroundColor: PRIMARY + '20' }]}>
                    <Text style={[styles.countText, { color: PRIMARY }]}>{activeOrders.length}</Text>
                  </View>
                </View>
                {activeOrders.map(renderOrder)}
              </View>
            )}

            {/* Past Orders */}
            {pastOrders.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionDot, { backgroundColor: '#10B981' }]} />
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    {t('past_orders') || 'Past Orders'}
                  </Text>
                  <View style={[styles.countBadge, { backgroundColor: '#10B98120' }]}>
                    <Text style={[styles.countText, { color: '#10B981' }]}>{pastOrders.length}</Text>
                  </View>
                </View>
                {pastOrders.map(renderOrder)}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Urbanist_700Bold', fontSize: 22 },
  subtitle: { fontFamily: 'Urbanist_400Regular', fontSize: 12, marginTop: 2 },

  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { width: 96, height: 96, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontFamily: 'Urbanist_700Bold', fontSize: 18, marginBottom: 6 },
  emptySub: { fontFamily: 'Urbanist_400Regular', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  shopBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  shopBtnText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 14 },

  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { flex: 1, fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  countBadge: { minWidth: 26, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  countText: { fontFamily: 'Urbanist_700Bold', fontSize: 12 },

  orderCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderNum: { fontFamily: 'Urbanist_500Medium', fontSize: 11, marginBottom: 2 },
  orderDate: { fontFamily: 'Urbanist_700Bold', fontSize: 14 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontFamily: 'Urbanist_700Bold', fontSize: 10, letterSpacing: 0.5 },

  itemsRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  itemThumb: { width: 50, height: 50, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  itemQty: { position: 'absolute', bottom: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  itemQtyText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 9 },
  moreItems: { fontFamily: 'Urbanist_700Bold', fontSize: 13 },

  orderFooter: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, borderTopWidth: 1 },
  footerLabel: { fontFamily: 'Urbanist_500Medium', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  footerValue: { fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  footerTotal: { fontFamily: 'Urbanist_700Bold', fontSize: 16 },

  trackingBar: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, gap: 4 },
  trackDot: { width: 10, height: 10, borderRadius: 5 },
  trackLine: { flex: 1, height: 2 },
});
