import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Modal, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

const STATUS_META: Record<string, { color: string; bg: string; icon: string }> = {
  pending: { color: '#F59E0B', bg: '#F59E0B20', icon: 'time-outline' },
  confirmed: { color: '#3B82F6', bg: '#3B82F620', icon: 'checkmark-circle-outline' },
  shipped: { color: '#6366F1', bg: '#6366F120', icon: 'paper-plane-outline' },
  delivered: { color: '#10B981', bg: '#10B98120', icon: 'checkmark-done-outline' },
  cancelled: { color: '#EF4444', bg: '#EF444420', icon: 'close-circle-outline' },
};

export default function SalonOrders() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [detailOrder, setDetailOrder] = useState<any>(null);

  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ['salon-product-orders'],
    queryFn: async () => { const res = await apiRequest('GET', '/api/salon/product-orders'); return res.json(); },
    refetchInterval: 15000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest('PUT', `/api/salon/product-orders/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-product-orders'] });
      setDetailOrder(null);
    },
  });

  const filtered = useMemo(() => {
    let list = filter === 'all' ? orders : orders.filter(o => o.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.id?.toLowerCase().includes(q) ||
        o.phone?.toLowerCase().includes(q) ||
        o.shippingAddress?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, filter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    STATUS_FLOW.forEach(s => { c[s] = orders.filter(o => o.status === s).length; });
    return c;
  }, [orders]);

  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.totalPrice || 0), 0);
  const pendingRevenue = orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)).reduce((s, o) => s + (o.totalPrice || 0), 0);

  const formatDate = (d: string) => new Date(d).toLocaleString();

  const parseItems = (items: any) => {
    if (Array.isArray(items)) return items;
    try { return JSON.parse(items); } catch { return []; }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>{t('product_orders') || 'Product Orders'}</Text>
          <Text style={styles.subtitle}>
            {orders.length} {t('total_orders') || 'orders'} · {counts.pending || 0} {t('pending') || 'pending'}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: PRIMARY }]}>
          <Ionicons name="cube" size={18} color={PRIMARY} />
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>{t('total_orders') || 'Orders'}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
          <Ionicons name="cash" size={18} color="#10B981" />
          <Text style={styles.statValue}>CHF {totalRevenue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>{t('revenue') || 'Revenue'}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
          <Ionicons name="hourglass-outline" size={18} color="#F59E0B" />
          <Text style={styles.statValue}>CHF {pendingRevenue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>{t('pending') || 'Pending'}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#666" />
        <TextInput style={styles.searchInput} placeholder={t('search_orders') || 'Search by ID, phone, address...'} placeholderTextColor="#555" value={search} onChangeText={setSearch} />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={{ flexGrow: 0, maxHeight: 64, marginBottom: 12 }}
      >
        {['all', ...STATUS_FLOW].map(f => {
          const isActive = filter === f;
          const meta = f === 'all' ? { color: PRIMARY, bg: PRIMARY + '20', icon: 'apps' } : STATUS_META[f];
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, isActive && { backgroundColor: meta.bg, borderColor: meta.color }]}
            >
              <Ionicons name={meta.icon as any} size={13} color={isActive ? meta.color : '#888'} />
              <Text style={[styles.filterText, isActive && { color: '#fff' }]}>
                {f === 'all' ? (t('all') || 'All') : t(`order_${f}`) || f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
              {counts[f] > 0 && (
                <View style={[styles.countBadge, isActive && { backgroundColor: meta.color }]}>
                  <Text style={[styles.countText, isActive && { color: '#fff' }]}>{counts[f]}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={48} color={BORDER} />
              <Text style={styles.emptyText}>{t('no_orders') || 'No orders yet'}</Text>
              <Text style={styles.emptySub}>{t('orders_will_appear') || 'Customer orders will appear here'}</Text>
            </View>
          ) : (
            filtered.map(order => {
              const meta = STATUS_META[order.status] || STATUS_META.pending;
              const items = parseItems(order.items);
              return (
                <Pressable key={order.id} onPress={() => setDetailOrder(order)} style={styles.orderCard}>
                  <View style={styles.orderTop}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.orderIdRow}>
                        <Ionicons name="receipt" size={11} color={PRIMARY} />
                        <Text style={styles.orderId}>#{order.id?.slice(0, 8)?.toUpperCase()}</Text>
                        <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
                          <Ionicons name={meta.icon as any} size={10} color={meta.color} />
                          <Text style={[styles.statusText, { color: meta.color }]}>{order.status?.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                    </View>
                    <Text style={styles.orderTotal}>CHF {order.totalPrice}</Text>
                  </View>

                  {/* Items thumbs */}
                  <View style={styles.itemsRow}>
                    {items.slice(0, 5).map((item: any, i: number) => (
                      <View key={i} style={styles.itemThumb}>
                        {item.image ? (
                          <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                        ) : (
                          <Ionicons name="cube-outline" size={16} color="#666" />
                        )}
                        <View style={styles.itemQty}><Text style={styles.itemQtyText}>{item.qty}</Text></View>
                      </View>
                    ))}
                    {items.length > 5 && (
                      <View style={[styles.itemThumb, { alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={styles.moreItems}>+{items.length - 5}</Text>
                      </View>
                    )}
                  </View>

                  {/* Customer info */}
                  <View style={styles.customerRow}>
                    {order.phone && (
                      <View style={styles.infoChip}>
                        <Ionicons name="call-outline" size={11} color="#10B981" />
                        <Text style={styles.infoText}>{order.phone}</Text>
                      </View>
                    )}
                    {order.shippingAddress && (
                      <View style={[styles.infoChip, { flex: 1 }]}>
                        <Ionicons name="location-outline" size={11} color="#3B82F6" />
                        <Text style={styles.infoText} numberOfLines={1}>{order.shippingAddress}</Text>
                      </View>
                    )}
                  </View>

                  {/* Quick actions */}
                  <View style={styles.actionsRow}>
                    {order.status === 'pending' && (
                      <Pressable onPress={(e: any) => { e.stopPropagation?.(); updateStatus.mutate({ id: order.id, status: 'confirmed' }); }} style={[styles.quickBtn, { backgroundColor: '#3B82F620', borderColor: '#3B82F640' }]}>
                        <Ionicons name="checkmark-circle" size={13} color="#3B82F6" />
                        <Text style={[styles.quickBtnText, { color: '#3B82F6' }]}>{t('confirm') || 'Confirm'}</Text>
                      </Pressable>
                    )}
                    {order.status === 'confirmed' && (
                      <Pressable onPress={(e: any) => { e.stopPropagation?.(); updateStatus.mutate({ id: order.id, status: 'shipped' }); }} style={[styles.quickBtn, { backgroundColor: '#6366F120', borderColor: '#6366F140' }]}>
                        <Ionicons name="paper-plane" size={13} color="#6366F1" />
                        <Text style={[styles.quickBtnText, { color: '#6366F1' }]}>{t('ship') || 'Ship'}</Text>
                      </Pressable>
                    )}
                    {order.status === 'shipped' && (
                      <Pressable onPress={(e: any) => { e.stopPropagation?.(); updateStatus.mutate({ id: order.id, status: 'delivered' }); }} style={[styles.quickBtn, { backgroundColor: '#10B98120', borderColor: '#10B98140' }]}>
                        <Ionicons name="checkmark-done" size={13} color="#10B981" />
                        <Text style={[styles.quickBtnText, { color: '#10B981' }]}>{t('mark_delivered') || 'Mark Delivered'}</Text>
                      </Pressable>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <Pressable onPress={(e: any) => { e.stopPropagation?.();
                        if (Platform.OS === 'web') { if (window.confirm(t('cancel_order_confirm') || 'Cancel this order?')) updateStatus.mutate({ id: order.id, status: 'cancelled' }); }
                        else Alert.alert(t('cancel_order') || 'Cancel Order', t('cancel_order_confirm') || 'Cancel this order?', [{ text: t('no') || 'No', style: 'cancel' }, { text: t('yes') || 'Yes', style: 'destructive', onPress: () => updateStatus.mutate({ id: order.id, status: 'cancelled' }) }]);
                      }} style={[styles.quickBtn, { backgroundColor: '#EF444420', borderColor: '#EF444440' }]}>
                        <Ionicons name="close-circle" size={13} color="#EF4444" />
                        <Text style={[styles.quickBtnText, { color: '#EF4444' }]}>{t('cancel') || 'Cancel'}</Text>
                      </Pressable>
                    )}
                    <Pressable onPress={() => setDetailOrder(order)} style={[styles.quickBtn, { backgroundColor: PRIMARY + '20', borderColor: PRIMARY + '40' }]}>
                      <Ionicons name="eye" size={13} color={PRIMARY} />
                      <Text style={[styles.quickBtnText, { color: PRIMARY }]}>{t('details') || 'Details'}</Text>
                    </Pressable>
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Order Detail Modal */}
      <Modal visible={!!detailOrder} transparent animationType="slide" onRequestClose={() => setDetailOrder(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setDetailOrder(null)} />
          <View style={[styles.modalCard, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHandle} />
            {detailOrder && (() => {
              const meta = STATUS_META[detailOrder.status] || STATUS_META.pending;
              const items = parseItems(detailOrder.items);
              return (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={styles.modalTitle}>{t('order_details') || 'Order Details'}</Text>
                      <Text style={styles.modalSubtitle}>#{detailOrder.id?.slice(0, 8)?.toUpperCase()}</Text>
                    </View>
                    <Pressable onPress={() => setDetailOrder(null)} style={styles.closeBtn}>
                      <Ionicons name="close" size={20} color="#888" />
                    </Pressable>
                  </View>

                  {/* Status Hero */}
                  <View style={[styles.statusHero, { backgroundColor: meta.bg }]}>
                    <View style={[styles.statusHeroIcon, { backgroundColor: meta.color }]}>
                      <Ionicons name={meta.icon as any} size={24} color="#fff" />
                    </View>
                    <Text style={[styles.statusHeroText, { color: meta.color }]}>
                      {t(`order_${detailOrder.status}`) || detailOrder.status?.toUpperCase()}
                    </Text>
                  </View>

                  {/* Items */}
                  <Text style={styles.modalSectionTitle}>{t('items') || 'Items'}</Text>
                  {items.map((item: any, i: number) => (
                    <View key={i} style={styles.modalItem}>
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.modalItemImg} contentFit="cover" />
                      ) : (
                        <View style={[styles.modalItemImg, { alignItems: 'center', justifyContent: 'center' }]}>
                          <Ionicons name="cube" size={24} color={PRIMARY} />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalItemName}>{item.name}</Text>
                        <Text style={styles.modalItemQty}>{item.qty} × CHF {item.price}</Text>
                      </View>
                      <Text style={styles.modalItemTotal}>CHF {(item.qty * item.price).toFixed(2)}</Text>
                    </View>
                  ))}

                  {/* Customer */}
                  <Text style={styles.modalSectionTitle}>{t('customer') || 'Customer'}</Text>
                  {detailOrder.phone && (
                    <View style={styles.detailRow}>
                      <Ionicons name="call" size={14} color="#10B981" />
                      <Text style={styles.detailText}>{detailOrder.phone}</Text>
                    </View>
                  )}
                  {detailOrder.shippingAddress && (
                    <View style={styles.detailRow}>
                      <Ionicons name="location" size={14} color="#3B82F6" />
                      <Text style={styles.detailText}>{detailOrder.shippingAddress}</Text>
                    </View>
                  )}
                  {detailOrder.notes && (
                    <View style={styles.detailRow}>
                      <Ionicons name="document-text" size={14} color="#888" />
                      <Text style={styles.detailText}>{detailOrder.notes}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Ionicons name="card" size={14} color={PRIMARY} />
                    <Text style={styles.detailText}>{detailOrder.paymentMethod?.toUpperCase()}</Text>
                  </View>

                  {/* Total */}
                  <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>{t('total') || 'TOTAL'}</Text>
                    <Text style={styles.totalValue}>CHF {detailOrder.totalPrice}</Text>
                  </View>

                  {/* Status update */}
                  <Text style={styles.modalSectionTitle}>{t('update_status') || 'Update Status'}</Text>
                  <View style={styles.statusBtns}>
                    {STATUS_FLOW.map(s => {
                      const m = STATUS_META[s];
                      const isCurrent = detailOrder.status === s;
                      return (
                        <Pressable key={s} onPress={() => !isCurrent && updateStatus.mutate({ id: detailOrder.id, status: s })}
                          style={[styles.statusBtn, { borderColor: m.color, backgroundColor: isCurrent ? m.color : 'transparent' }]}
                          disabled={isCurrent || updateStatus.isPending}>
                          <Ionicons name={m.icon as any} size={13} color={isCurrent ? '#fff' : m.color} />
                          <Text style={[styles.statusBtnText, { color: isCurrent ? '#fff' : m.color }]}>
                            {s.toUpperCase()}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, marginTop: 8, marginBottom: 14 },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 26 },
  subtitle: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginTop: 2 },

  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: BORDER, borderLeftWidth: 3, alignItems: 'center', gap: 4 },
  statValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18 },
  statLabel: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 11 },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, marginHorizontal: 20, paddingHorizontal: 14, height: 46, gap: 10, marginBottom: 12 },
  searchInput: { flex: 1, color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 14, height: '100%' },

  filterRow: { paddingHorizontal: 20, gap: 8, marginBottom: 14 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD },
  filterText: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 12 },
  countBadge: { minWidth: 20, height: 18, borderRadius: 9, backgroundColor: '#35383F', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  countText: { color: '#aaa', fontFamily: 'Urbanist_700Bold', fontSize: 10 },

  list: { paddingHorizontal: 20 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { color: '#aaa', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  emptySub: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 13 },

  orderCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 12 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  orderId: { color: '#ccc', fontFamily: 'Urbanist_700Bold', fontSize: 13 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontFamily: 'Urbanist_700Bold', fontSize: 9, letterSpacing: 0.5 },
  orderDate: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 12 },
  orderTotal: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 18 },

  itemsRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  itemThumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#13151B', overflow: 'hidden', position: 'relative' },
  itemQty: { position: 'absolute', bottom: 2, right: 2, minWidth: 16, height: 14, borderRadius: 7, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  itemQtyText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 8 },
  moreItems: { color: '#aaa', fontFamily: 'Urbanist_700Bold', fontSize: 12 },

  customerRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#13151B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  infoText: { color: '#aaa', fontFamily: 'Urbanist_500Medium', fontSize: 11 },

  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  quickBtnText: { fontFamily: 'Urbanist_700Bold', fontSize: 11 },

  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: CARD, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingTop: 12, maxHeight: '90%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#444', alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  modalTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 22 },
  modalSubtitle: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13, marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#13151B', alignItems: 'center', justifyContent: 'center' },

  statusHero: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, marginBottom: 16 },
  statusHeroIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statusHeroText: { fontFamily: 'Urbanist_700Bold', fontSize: 16 },

  modalSectionTitle: { color: '#888', fontFamily: 'Urbanist_700Bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 8 },
  modalItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  modalItemImg: { width: 56, height: 56, borderRadius: 10, backgroundColor: PRIMARY + '15' },
  modalItemName: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 14 },
  modalItemQty: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 12 },
  modalItemTotal: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 14 },

  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  detailText: { color: '#ccc', fontFamily: 'Urbanist_500Medium', fontSize: 13 },

  totalSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTopWidth: 1, borderTopColor: BORDER, marginTop: 12, marginBottom: 8 },
  totalLabel: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  totalValue: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 22 },

  statusBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statusBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  statusBtnText: { fontFamily: 'Urbanist_700Bold', fontSize: 11 },
});
