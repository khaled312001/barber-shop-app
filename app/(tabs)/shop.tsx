import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, Modal, TextInput, Platform, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { apiRequest } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';

type CartItem = { id: string; name: string; price: number; qty: number; image?: string; salonId: string; salonName?: string };

const CATEGORY_META: Record<string, { icon: string; color: string; gradient: [string, string] }> = {
  all: { icon: 'sparkles', color: '#F4A460', gradient: ['#F4A46033', '#F4A46011'] },
  hair: { icon: 'cut', color: '#8B5CF6', gradient: ['#8B5CF633', '#8B5CF611'] },
  beard: { icon: 'man', color: '#F59E0B', gradient: ['#F59E0B33', '#F59E0B11'] },
  skin: { icon: 'happy', color: '#EC4899', gradient: ['#EC489933', '#EC489911'] },
  tools: { icon: 'hammer', color: '#3B82F6', gradient: ['#3B82F633', '#3B82F611'] },
  accessories: { icon: 'pricetag', color: '#10B981', gradient: ['#10B98133', '#10B98111'] },
  general: { icon: 'cube', color: '#6366F1', gradient: ['#6366F133', '#6366F111'] },
};

export default function ShopScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const [shipping, setShipping] = useState({ phone: '', address: '', notes: '', paymentMethod: 'cash' });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const topPad = Platform.OS === 'web' ? 16 : insets.top;

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handler = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handler);
      return () => window.removeEventListener('resize', handler);
    }
  }, []);

  // Responsive: 4 cols on wide screens, 3 on tablet, always 2 on mobile (never 1)
  const cols = windowWidth >= 1100 ? 4 : windowWidth >= 800 ? 3 : 2;
  const cardW = (Math.min(windowWidth, 1280) - 40 - (cols - 1) * 16) / cols;

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['shop-products'],
    queryFn: async () => { const res = await apiRequest('GET', '/api/products'); return res.json(); },
  });

  const categories = useMemo(() => {
    const cats = new Set<string>(products.map((p: any) => p.category || 'general'));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const filtered = useMemo(() => {
    let list = filter === 'all' ? products : products.filter((p: any) => p.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p: any) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.salonName || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }
    return list.filter((p: any) => p.stock > 0);
  }, [products, filter, search]);

  const addToCart = (p: any) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id);
      if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: Math.min(c.qty + 1, p.stock) } : c);
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1, image: p.image, salonId: p.salonId, salonName: p.salonName }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  };

  const toggleFav = (id: string) => {
    setFavorites(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const totalQty = cart.reduce((s, c) => s + c.qty, 0);
  const totalPrice = cart.reduce((s, c) => s + c.price * c.qty, 0);

  const placeOrder = useMutation({
    mutationFn: async () => {
      const bySalon: Record<string, CartItem[]> = {};
      for (const item of cart) { (bySalon[item.salonId] ||= []).push(item); }
      const results = [];
      for (const [salonId, items] of Object.entries(bySalon)) {
        const total = items.reduce((s, c) => s + c.price * c.qty, 0);
        const res = await apiRequest('POST', '/api/product-orders', {
          salonId, items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, image: i.image })),
          totalPrice: total, paymentMethod: shipping.paymentMethod,
          shippingAddress: shipping.address, phone: shipping.phone, notes: shipping.notes,
        });
        results.push(await res.json());
      }
      return results;
    },
    onSuccess: () => {
      setCart([]); setShowCheckout(false); setShowCart(false);
      if (Platform.OS === 'web') alert(t('order_placed') + '\n' + (t('order_success_msg') || 'Your order has been placed.'));
      else Alert.alert(t('order_placed') || 'Order Placed!', t('order_success_msg') || 'Your order has been placed.');
    },
    onError: (e: any) => {
      const msg = e?.message || 'Failed to place order';
      if (Platform.OS === 'web') alert(msg); else Alert.alert(t('error') || 'Error', msg);
    },
  });

  const PRIMARY = theme.primary;
  const isDark = theme.background === '#181A20' || theme.background === '#0a0e17';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Hero Section (scrolls naturally) */}
        <View style={{ backgroundColor: theme.background }}>
          <LinearGradient
            colors={[PRIMARY + '20', theme.background]}
            style={[styles.hero, { paddingTop: topPad + 20 }]}
          >
            <View style={styles.heroTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.heroBadge, { color: PRIMARY }]}>
                  <MaterialCommunityIcons name="lightning-bolt" size={11} /> {t('shop') || 'Shop'}
                </Text>
                <Text style={[styles.heroTitle, { color: theme.text }]}>
                  {t('discover_products') || 'Discover Premium'}
                </Text>
                <Text style={[styles.heroTitle, { color: PRIMARY }]}>
                  {t('salon_products') || 'Salon Products'}
                </Text>
              </View>
              <Pressable onPress={() => setShowCart(true)} style={[styles.cartBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="bag-outline" size={20} color={theme.text} />
                {totalQty > 0 && (
                  <View style={[styles.cartBadge, { backgroundColor: PRIMARY }]}>
                    <Text style={styles.cartBadgeText}>{totalQty}</Text>
                  </View>
                )}
              </Pressable>
            </View>

            {/* Search */}
            <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="search-outline" size={18} color={theme.textTertiary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder={t('search_products') || 'Search products, brands...'}
                placeholderTextColor={theme.textTertiary}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={theme.textTertiary} /></Pressable>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statIcon, { backgroundColor: PRIMARY + '20' }]}>
              <Ionicons name="cube" size={16} color={PRIMARY} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: theme.text }]}>{products.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('products') || 'Products'}</Text>
            </View>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="storefront" size={16} color="#10B981" />
            </View>
            <View>
              <Text style={[styles.statValue, { color: theme.text }]}>{new Set(products.map((p: any) => p.salonId)).size}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('salons') || 'Salons'}</Text>
            </View>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statIcon, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="flash" size={16} color="#F59E0B" />
            </View>
            <View>
              <Text style={[styles.statValue, { color: theme.text }]}>{t('fast_delivery') || 'Fast'}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('delivery') || 'Delivery'}</Text>
            </View>
          </View>
        </View>

        {/* Category Pills */}
        <View style={styles.catSection}>
          <View style={styles.catHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('categories') || 'Categories'}</Text>
            {filter !== 'all' && (
              <Pressable onPress={() => setFilter('all')} style={styles.clearBtn}>
                <Text style={[styles.clearText, { color: PRIMARY }]}>{t('clear') || 'Clear'}</Text>
              </Pressable>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {categories.map(c => {
              const meta = CATEGORY_META[c] || CATEGORY_META.general;
              const isActive = filter === c;
              const count = c === 'all' ? products.length : products.filter((p: any) => p.category === c).length;
              return (
                <Pressable
                  key={c}
                  onPress={() => setFilter(c)}
                  style={[
                    styles.catPill,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    isActive && { backgroundColor: meta.color + '20', borderColor: meta.color },
                  ]}
                >
                  <View style={[styles.catPillIcon, { backgroundColor: isActive ? meta.color : meta.color + '20' }]}>
                    <Ionicons name={meta.icon as any} size={14} color={isActive ? '#fff' : meta.color} />
                  </View>
                  <Text style={[styles.catPillText, { color: isActive ? theme.text : theme.textSecondary, fontFamily: isActive ? 'Urbanist_700Bold' : 'Urbanist_600SemiBold' }]}>
                    {c === 'all' ? (t('all') || 'All') : c.charAt(0).toUpperCase() + c.slice(1)}
                  </Text>
                  {count > 0 && (
                    <View style={[styles.catPillCount, { backgroundColor: isActive ? meta.color : theme.border }]}>
                      <Text style={[styles.catPillCountText, { color: isActive ? '#fff' : theme.textSecondary }]}>{count}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View style={styles.gridContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 60 }} />
          ) : filtered.length === 0 ? (
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.card }]}>
                <Ionicons name="bag-outline" size={40} color={theme.textTertiary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('no_products_found') || 'No products found'}</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>{t('try_other_filter') || 'Try a different category or search term'}</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filtered.map((item: any) => {
                const inCart = cart.find(c => c.id === item.id);
                const isFav = favorites.has(item.id);
                const meta = CATEGORY_META[item.category || 'general'] || CATEGORY_META.general;
                return (
                  <View key={item.id} style={[styles.productCard, { width: cardW, backgroundColor: theme.card, borderColor: theme.border }]}>
                    {/* Image */}
                    <View style={[styles.imgWrap, { backgroundColor: meta.color + '08' }]}>
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.productImg} contentFit="cover" />
                      ) : (
                        <View style={styles.imgPlaceholder}>
                          <Ionicons name={meta.icon as any} size={36} color={meta.color} />
                        </View>
                      )}
                      {/* Top badges */}
                      <View style={styles.imgBadges}>
                        <View style={[styles.catBadgeImg, { backgroundColor: meta.color }]}>
                          <Ionicons name={meta.icon as any} size={10} color="#fff" />
                          <Text style={styles.catBadgeImgText}>{(item.category || 'general').toUpperCase()}</Text>
                        </View>
                        {item.stock <= 5 && (
                          <View style={styles.lowStockBadge}>
                            <Text style={styles.lowStockBadgeText}>Only {item.stock}</Text>
                          </View>
                        )}
                      </View>
                      {/* Fav button */}
                      <Pressable onPress={() => toggleFav(item.id)} style={styles.favBtn}>
                        <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={16} color={isFav ? '#EF4444' : '#fff'} />
                      </Pressable>
                    </View>

                    {/* Body */}
                    <View style={styles.cardBody}>
                      <View style={styles.salonRow}>
                        <Ionicons name="storefront-outline" size={11} color={PRIMARY} />
                        <Text style={[styles.salonName, { color: PRIMARY }]} numberOfLines={1}>{item.salonName}</Text>
                      </View>
                      <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
                      {item.description && (
                        <Text style={[styles.productDesc, { color: theme.textSecondary }]} numberOfLines={2}>{item.description}</Text>
                      )}

                      {/* Price + action */}
                      <View style={styles.priceRow}>
                        <View>
                          <Text style={[styles.priceLabel, { color: theme.textTertiary }]}>{t('price') || 'Price'}</Text>
                          <Text style={[styles.price, { color: PRIMARY }]}>CHF {item.price}</Text>
                        </View>
                        {inCart ? (
                          <View style={[styles.qtyControls, { backgroundColor: PRIMARY + '15', borderColor: PRIMARY + '40' }]}>
                            <Pressable onPress={() => updateQty(item.id, -1)} style={styles.qtyBtn}>
                              <Ionicons name="remove" size={14} color={PRIMARY} />
                            </Pressable>
                            <Text style={[styles.qtyText, { color: PRIMARY }]}>{inCart.qty}</Text>
                            <Pressable onPress={() => updateQty(item.id, 1)} style={styles.qtyBtn}>
                              <Ionicons name="add" size={14} color={PRIMARY} />
                            </Pressable>
                          </View>
                        ) : (
                          <Pressable onPress={() => addToCart(item)} style={[styles.addBtn, { backgroundColor: PRIMARY }]}>
                            <Ionicons name="add" size={16} color="#fff" />
                            <Text style={styles.addBtnText}>{t('add') || 'Add'}</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Cart */}
      {totalQty > 0 && (
        <Pressable onPress={() => setShowCart(true)} style={[styles.floatingCart, { bottom: insets.bottom + 80 }]}>
          <LinearGradient colors={[PRIMARY, PRIMARY + 'DD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.floatingCartInner}>
            <View style={styles.floatingCartLeft}>
              <View style={styles.floatingCartIcon}>
                <Ionicons name="bag" size={18} color="#fff" />
                <View style={styles.floatingCartBadge}>
                  <Text style={styles.floatingCartBadgeText}>{totalQty}</Text>
                </View>
              </View>
              <View>
                <Text style={styles.floatingCartLabel}>{t('your_cart') || 'View Cart'}</Text>
                <Text style={styles.floatingCartItems}>{totalQty} {t('items') || 'items'}</Text>
              </View>
            </View>
            <View style={styles.floatingCartRight}>
              <Text style={styles.floatingCartTotal}>CHF {totalPrice.toFixed(2)}</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </LinearGradient>
        </Pressable>
      )}

      {/* Cart Modal */}
      <Modal visible={showCart} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowCart(false)} />
          <View style={[styles.modalCard, { backgroundColor: theme.card, paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{t('your_cart') || 'Your Cart'}</Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>{totalQty} {t('items') || 'items'}</Text>
              </View>
              <Pressable onPress={() => setShowCart(false)} style={[styles.modalCloseBtn, { backgroundColor: theme.background }]}>
                <Ionicons name="close" size={20} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {cart.length === 0 ? (
                <View style={styles.emptyCart}>
                  <Ionicons name="bag-outline" size={48} color={theme.textTertiary} />
                  <Text style={[styles.emptyCartText, { color: theme.textSecondary }]}>{t('cart_empty') || 'Your cart is empty'}</Text>
                </View>
              ) : (
                cart.map(item => (
                  <View key={item.id} style={[styles.cartItem, { borderBottomColor: theme.divider, backgroundColor: theme.background }]}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.cartItemImg} contentFit="cover" />
                    ) : (
                      <View style={[styles.cartItemImg, { backgroundColor: PRIMARY + '15', alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="image-outline" size={20} color={PRIMARY} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cartSalon, { color: PRIMARY }]} numberOfLines={1}>{item.salonName}</Text>
                      <Text style={[styles.cartItemName, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
                      <Text style={[styles.cartItemPrice, { color: PRIMARY }]}>CHF {(item.price * item.qty).toFixed(2)}</Text>
                    </View>
                    <View style={[styles.qtyControls, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <Pressable onPress={() => updateQty(item.id, -1)} style={styles.qtyBtn}>
                        <Ionicons name="remove" size={14} color={theme.text} />
                      </Pressable>
                      <Text style={[styles.qtyText, { color: theme.text }]}>{item.qty}</Text>
                      <Pressable onPress={() => updateQty(item.id, 1)} style={styles.qtyBtn}>
                        <Ionicons name="add" size={14} color={PRIMARY} />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {cart.length > 0 && (
              <View style={[styles.cartFooter, { borderTopColor: theme.divider }]}>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>{t('subtotal') || 'Subtotal'}</Text>
                  <Text style={[styles.totalValue, { color: theme.text }]}>CHF {totalPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>{t('delivery_fee') || 'Delivery'}</Text>
                  <Text style={[styles.totalValue, { color: '#10B981' }]}>{t('free') || 'FREE'}</Text>
                </View>
                <View style={[styles.totalRowFinal, { borderTopColor: theme.divider }]}>
                  <Text style={[styles.totalFinalLabel, { color: theme.text }]}>{t('total') || 'Total'}</Text>
                  <Text style={[styles.totalFinalValue, { color: PRIMARY }]}>CHF {totalPrice.toFixed(2)}</Text>
                </View>
                <Pressable onPress={() => { setShowCart(false); setShowCheckout(true); }} style={[styles.checkoutBtn, { backgroundColor: PRIMARY }]}>
                  <Ionicons name="card-outline" size={18} color="#fff" />
                  <Text style={styles.checkoutBtnText}>{t('checkout') || 'Checkout'} • CHF {totalPrice.toFixed(2)}</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Checkout Modal */}
      <Modal visible={showCheckout} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowCheckout(false)} />
          <View style={[styles.modalCard, { backgroundColor: theme.card, paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{t('checkout') || 'Checkout'}</Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>{t('shipping_payment') || 'Shipping & Payment'}</Text>
              </View>
              <Pressable onPress={() => setShowCheckout(false)} style={[styles.modalCloseBtn, { backgroundColor: theme.background }]}>
                <Ionicons name="close" size={20} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
              <Text style={[styles.formSectionTitle, { color: theme.text }]}>
                <Ionicons name="location" size={14} color={PRIMARY} /> {t('shipping_details') || 'Shipping'}
              </Text>
              <View style={[styles.formInput, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Ionicons name="call-outline" size={16} color={theme.textTertiary} />
                <TextInput style={[styles.formInputText, { color: theme.text }]} placeholder={t('phone') || 'Phone number'} placeholderTextColor={theme.textTertiary} value={shipping.phone} onChangeText={v => setShipping(p => ({ ...p, phone: v }))} keyboardType="phone-pad" />
              </View>
              <View style={[styles.formInput, { backgroundColor: theme.background, borderColor: theme.border, height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
                <Ionicons name="home-outline" size={16} color={theme.textTertiary} />
                <TextInput style={[styles.formInputText, { color: theme.text, textAlignVertical: 'top' }]} placeholder={t('shipping_address') || 'Shipping address'} placeholderTextColor={theme.textTertiary} value={shipping.address} onChangeText={v => setShipping(p => ({ ...p, address: v }))} multiline />
              </View>
              <View style={[styles.formInput, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Ionicons name="document-text-outline" size={16} color={theme.textTertiary} />
                <TextInput style={[styles.formInputText, { color: theme.text }]} placeholder={t('order_notes') || 'Order notes (optional)'} placeholderTextColor={theme.textTertiary} value={shipping.notes} onChangeText={v => setShipping(p => ({ ...p, notes: v }))} />
              </View>

              <Text style={[styles.formSectionTitle, { color: theme.text, marginTop: 16 }]}>
                <Ionicons name="card" size={14} color={PRIMARY} /> {t('payment_method') || 'Payment'}
              </Text>
              <View style={styles.paymentRow}>
                {[
                  { id: 'cash', label: t('pay_on_delivery') || 'Cash on Delivery', icon: 'cash-outline' },
                  { id: 'card', label: t('credit_card') || 'Credit Card', icon: 'card-outline' },
                ].map(m => (
                  <Pressable key={m.id} onPress={() => setShipping(p => ({ ...p, paymentMethod: m.id }))}
                    style={[styles.paymentBtn, { borderColor: theme.border, backgroundColor: theme.background }, shipping.paymentMethod === m.id && { borderColor: PRIMARY, backgroundColor: PRIMARY + '10' }]}>
                    <Ionicons name={m.icon as any} size={20} color={shipping.paymentMethod === m.id ? PRIMARY : theme.textSecondary} />
                    <Text style={[styles.paymentText, { color: shipping.paymentMethod === m.id ? theme.text : theme.textSecondary, fontFamily: shipping.paymentMethod === m.id ? 'Urbanist_700Bold' : 'Urbanist_600SemiBold' }]}>{m.label}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={[styles.totalRowFinal, { borderTopColor: theme.divider, marginTop: 20 }]}>
                <Text style={[styles.totalFinalLabel, { color: theme.text }]}>{t('total') || 'Total'}</Text>
                <Text style={[styles.totalFinalValue, { color: PRIMARY }]}>CHF {totalPrice.toFixed(2)}</Text>
              </View>

              <Pressable onPress={() => placeOrder.mutate()} disabled={!shipping.phone || !shipping.address || placeOrder.isPending} style={[styles.checkoutBtn, { backgroundColor: PRIMARY, marginTop: 16, opacity: (!shipping.phone || !shipping.address || placeOrder.isPending) ? 0.5 : 1 }]}>
                {placeOrder.isPending ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.checkoutBtnText}>{t('place_order') || 'Place Order'}</Text>
                  </>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Hero
  hero: { paddingHorizontal: 20, paddingBottom: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  heroBadge: { fontFamily: 'Urbanist_700Bold', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  heroTitle: { fontFamily: 'Urbanist_700Bold', fontSize: 28, lineHeight: 32 },
  cartBtn: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cartBadge: { position: 'absolute', top: -4, right: -4, minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, borderWidth: 2, borderColor: '#181A20' },
  cartBadgeText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 11 },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, height: 50, gap: 10 },
  searchInput: { flex: 1, fontFamily: 'Urbanist_500Medium', fontSize: 15, height: '100%' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: -8, marginBottom: 8 },
  statBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, borderWidth: 1 },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  statLabel: { fontFamily: 'Urbanist_400Regular', fontSize: 11 },

  // Categories
  catSection: { marginTop: 16 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  sectionTitle: { fontFamily: 'Urbanist_700Bold', fontSize: 18 },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  clearText: { fontFamily: 'Urbanist_700Bold', fontSize: 13 },
  catRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 8 },
  catPill: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, minHeight: 44 },
  catPillIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  catPillText: { fontSize: 13 },
  catPillCount: { minWidth: 22, height: 22, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  catPillCountText: { fontFamily: 'Urbanist_700Bold', fontSize: 10 },

  // Grid
  gridContainer: { paddingHorizontal: 20, marginTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'flex-start' },
  productCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  imgWrap: { width: '100%', aspectRatio: 1, position: 'relative' },
  productImg: { width: '100%', height: '100%' },
  imgPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imgBadges: { position: 'absolute', top: 10, left: 10, gap: 4 },
  catBadgeImg: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  catBadgeImgText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 9, letterSpacing: 0.5 },
  lowStockBadge: { backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  lowStockBadgeText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 9 },
  favBtn: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' as any },

  cardBody: { padding: 14 },
  salonRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  salonName: { fontFamily: 'Urbanist_600SemiBold', fontSize: 11 },
  productName: { fontFamily: 'Urbanist_700Bold', fontSize: 15, lineHeight: 19, marginBottom: 4, minHeight: 38 },
  productDesc: { fontFamily: 'Urbanist_400Regular', fontSize: 12, lineHeight: 16, marginBottom: 12, minHeight: 32 },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  priceLabel: { fontFamily: 'Urbanist_500Medium', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  price: { fontFamily: 'Urbanist_700Bold', fontSize: 18 },

  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 13 },

  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4, borderRadius: 12, borderWidth: 1 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontFamily: 'Urbanist_700Bold', fontSize: 14, minWidth: 16, textAlign: 'center' },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { width: 88, height: 88, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontFamily: 'Urbanist_700Bold', fontSize: 18, marginBottom: 6 },
  emptySub: { fontFamily: 'Urbanist_400Regular', fontSize: 14, textAlign: 'center' },

  // Floating cart
  floatingCart: { position: 'absolute', left: 20, right: 20, borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  floatingCartInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14 },
  floatingCartLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  floatingCartIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  floatingCartBadge: { position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  floatingCartBadgeText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 10 },
  floatingCartLabel: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 14 },
  floatingCartItems: { color: 'rgba(255,255,255,0.85)', fontFamily: 'Urbanist_500Medium', fontSize: 11 },
  floatingCartRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  floatingCartTotal: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, paddingTop: 14, maxHeight: '88%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#444', alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  modalTitle: { fontFamily: 'Urbanist_700Bold', fontSize: 22 },
  modalSubtitle: { fontFamily: 'Urbanist_400Regular', fontSize: 13, marginTop: 2 },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  // Cart items
  emptyCart: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyCartText: { fontFamily: 'Urbanist_500Medium', fontSize: 15 },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, marginBottom: 8 },
  cartItemImg: { width: 60, height: 60, borderRadius: 12 },
  cartSalon: { fontFamily: 'Urbanist_600SemiBold', fontSize: 11, marginBottom: 2 },
  cartItemName: { fontFamily: 'Urbanist_600SemiBold', fontSize: 14, marginBottom: 4 },
  cartItemPrice: { fontFamily: 'Urbanist_700Bold', fontSize: 15 },

  // Cart footer
  cartFooter: { paddingTop: 16, borderTopWidth: 1, marginTop: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalLabel: { fontFamily: 'Urbanist_500Medium', fontSize: 14 },
  totalValue: { fontFamily: 'Urbanist_700Bold', fontSize: 14 },
  totalRowFinal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, marginTop: 8 },
  totalFinalLabel: { fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  totalFinalValue: { fontFamily: 'Urbanist_700Bold', fontSize: 22 },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, borderRadius: 16, marginTop: 16 },
  checkoutBtnText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },

  // Forms
  formSectionTitle: { fontFamily: 'Urbanist_700Bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  formInput: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 52, marginBottom: 10 },
  formInputText: { flex: 1, fontFamily: 'Urbanist_500Medium', fontSize: 14, height: '100%' },
  paymentRow: { gap: 10 },
  paymentBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  paymentText: { fontSize: 14, flex: 1 },
});
