import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator, Platform, useWindowDimensions } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

type CartItem = { id: string; name: string; price: number; qty: number; category?: string };

// Map service names to icons (MaterialCommunityIcons for richer selection)
function getServiceIcon(name: string, category?: string): { set: 'mc' | 'io'; icon: string; color: string } {
  const n = ((name || '') + ' ' + (category || '')).toLowerCase();
  if (n.includes('haircut') || n.includes('cut') || n.includes('trim')) return { set: 'mc', icon: 'content-cut', color: '#F4A460' };
  if (n.includes('shave') || n.includes('beard')) return { set: 'mc', icon: 'razor-double-edge', color: '#8B5CF6' };
  if (n.includes('color') || n.includes('dye') || n.includes('balayage') || n.includes('highlight')) return { set: 'mc', icon: 'palette', color: '#EC4899' };
  if (n.includes('massage') || n.includes('relax')) return { set: 'mc', icon: 'spa', color: '#10B981' };
  if (n.includes('spa')) return { set: 'mc', icon: 'flower', color: '#06B6D4' };
  if (n.includes('facial') || n.includes('face') || n.includes('skin')) return { set: 'mc', icon: 'face-woman-shimmer', color: '#F59E0B' };
  if (n.includes('nail') || n.includes('manicure') || n.includes('pedicure')) return { set: 'mc', icon: 'hand-heart', color: '#F43F5E' };
  if (n.includes('blow') || n.includes('dry')) return { set: 'mc', icon: 'hair-dryer', color: '#3B82F6' };
  if (n.includes('style') || n.includes('styling')) return { set: 'mc', icon: 'auto-fix', color: '#6366F1' };
  if (n.includes('wash') || n.includes('shampoo') || n.includes('condition') || n.includes('treatment') || n.includes('therapy') || n.includes('deep')) return { set: 'mc', icon: 'water', color: '#0EA5E9' };
  if (n.includes('braid') || n.includes('extension')) return { set: 'mc', icon: 'hair-dryer-outline', color: '#A855F7' };
  if (n.includes('wax') || n.includes('thread')) return { set: 'mc', icon: 'fire', color: '#EF4444' };
  if (n.includes('makeup') || n.includes('make up')) return { set: 'mc', icon: 'brush', color: '#EC4899' };
  if (n.includes('eye') || n.includes('brow') || n.includes('lash')) return { set: 'mc', icon: 'eye', color: '#7C3AED' };
  if (n.includes('tattoo') || n.includes('piercing')) return { set: 'mc', icon: 'needle', color: '#DC2626' };
  return { set: 'mc', icon: 'scissors-cutting', color: '#F4A460' };
}

function ServiceIcon({ name, category, size = 20, forcedColor }: { name: string; category?: string; size?: number; forcedColor?: string }) {
  const info = getServiceIcon(name, category);
  const color = forcedColor || info.color;
  if (info.set === 'mc') return <MaterialCommunityIcons name={info.icon as any} size={size} color={color} />;
  return <Ionicons name={info.icon as any} size={size} color={color} />;
}

// Category metadata with icons + colors
function getCategoryIcon(cat: string): { set: 'mc' | 'io'; icon: string; color: string } {
  const c = (cat || '').toLowerCase();
  if (c === 'all') return { set: 'mc', icon: 'view-grid', color: '#F4A460' };
  if (c.includes('haircut') || c.includes('cut')) return { set: 'mc', icon: 'content-cut', color: '#F4A460' };
  if (c.includes('shave') || c.includes('beard')) return { set: 'mc', icon: 'razor-double-edge', color: '#8B5CF6' };
  if (c.includes('color') || c.includes('dye')) return { set: 'mc', icon: 'palette', color: '#EC4899' };
  if (c.includes('massage') || c.includes('relax')) return { set: 'mc', icon: 'spa', color: '#10B981' };
  if (c.includes('spa')) return { set: 'mc', icon: 'flower', color: '#06B6D4' };
  if (c.includes('facial') || c.includes('face') || c.includes('skin')) return { set: 'mc', icon: 'face-woman-shimmer', color: '#F59E0B' };
  if (c.includes('nail') || c.includes('manicure') || c.includes('pedicure')) return { set: 'mc', icon: 'hand-heart', color: '#F43F5E' };
  if (c.includes('treatment')) return { set: 'mc', icon: 'water', color: '#0EA5E9' };
  if (c.includes('style') || c.includes('styling') || c.includes('blow')) return { set: 'mc', icon: 'auto-fix', color: '#6366F1' };
  if (c.includes('makeup')) return { set: 'mc', icon: 'brush', color: '#EC4899' };
  if (c.includes('eye') || c.includes('brow') || c.includes('lash')) return { set: 'mc', icon: 'eye', color: '#7C3AED' };
  return { set: 'mc', icon: 'star-four-points', color: '#F4A460' };
}

function CategoryIcon({ cat, size = 16, forcedColor }: { cat: string; size?: number; forcedColor?: string }) {
  const info = getCategoryIcon(cat);
  const color = forcedColor || info.color;
  if (info.set === 'mc') return <MaterialCommunityIcons name={info.icon as any} size={size} color={color} />;
  return <Ionicons name={info.icon as any} size={size} color={color} />;
}

export default function POSScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { user } = useApp();
  const qc = useQueryClient();
  const { width: winWidth } = useWindowDimensions();
  const isWide = winWidth >= 900; // show 2-column layout only on tablet/desktop
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState('');
  const [note, setNote] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['salon-services-pos'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/services');
      return res.json();
    },
  });

  const categories = useMemo(() => {
    const cats = new Set(services.map((s: any) => s.category || 'general').filter(Boolean));
    return ['all', ...Array.from(cats)] as string[];
  }, [services]);

  const filteredServices = useMemo(() => {
    let list = services;
    if (activeCategory !== 'all') list = list.filter((s: any) => (s.category || 'general') === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s: any) => (s.name || '').toLowerCase().includes(q));
    }
    return list;
  }, [services, activeCategory, searchQuery]);

  const addToCart = (service: any) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === service.id);
      if (existing) return prev.map(c => c.id === service.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: service.id, name: service.name, price: service.price, qty: 1, category: service.category }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id));
  const clearCart = () => { setCart([]); setCustomerName(''); setDiscount(''); setNote(''); setPaymentMethod('cash'); };

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discountAmount = discount ? (discount.includes('%') ? subtotal * (parseFloat(discount) / 100) : parseFloat(discount) || 0) : 0;
  const tax = 0;
  const total = Math.max(0, subtotal - discountAmount + tax);

  const checkout = useMutation({
    mutationFn: async () => {
      const invoiceData = {
        customerName: customerName || 'Walk-in Customer',
        items: cart,
        subtotal,
        discount: discountAmount,
        tax,
        total,
        paymentMethod,
        note,
        date: new Date().toISOString(),
        invoiceNo: `INV-${Date.now().toString(36).toUpperCase()}`,
      };
      // Create a booking record for tracking
      await apiRequest('POST', '/api/salon/pos-checkout', invoiceData);
      return invoiceData;
    },
    onSuccess: (data) => {
      setLastInvoice(data);
      setShowInvoice(true);
      clearCart();
      qc.invalidateQueries({ queryKey: ['salon-bookings'] });
    },
    onError: (err: any) => {
      // Still show invoice even if API fails
      const invoiceData = {
        customerName: customerName || 'Walk-in Customer',
        items: cart, subtotal, discount: discountAmount, tax, total, paymentMethod, note,
        date: new Date().toISOString(),
        invoiceNo: `INV-${Date.now().toString(36).toUpperCase()}`,
      };
      setLastInvoice(invoiceData);
      setShowInvoice(true);
      clearCart();
    },
  });

  const printInvoice = () => {
    if (Platform.OS !== 'web' || !lastInvoice) return;
    const inv = lastInvoice;
    const itemsHtml = inv.items.map((i: CartItem) =>
      `<tr><td>${i.name}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">CHF ${i.price.toFixed(2)}</td><td style="text-align:right">CHF ${(i.price * i.qty).toFixed(2)}</td></tr>`
    ).join('');

    const html = `<!DOCTYPE html><html><head><style>
      body{font-family:Arial,sans-serif;max-width:350px;margin:0 auto;padding:20px;color:#333}
      .header{text-align:center;border-bottom:2px dashed #ccc;padding-bottom:16px;margin-bottom:16px}
      .header h1{font-size:20px;margin:0 0 4px}
      .header p{font-size:12px;color:#666;margin:2px 0}
      table{width:100%;border-collapse:collapse;margin:12px 0}
      th{border-bottom:1px solid #ccc;padding:6px 0;font-size:12px;text-align:left}
      td{padding:5px 0;font-size:13px}
      .totals{border-top:1px dashed #ccc;padding-top:12px;margin-top:8px}
      .totals div{display:flex;justify-content:space-between;padding:3px 0;font-size:13px}
      .totals .total{font-size:18px;font-weight:bold;border-top:2px solid #333;padding-top:8px;margin-top:8px}
      .footer{text-align:center;margin-top:20px;padding-top:12px;border-top:2px dashed #ccc;font-size:11px;color:#888}
      @media print{body{margin:0;padding:10px}}
    </style></head><body>
      <div class="header">
        <h1>&#9986; Barmagly Salon</h1>
        <p>Invoice: ${inv.invoiceNo}</p>
        <p>${new Date(inv.date).toLocaleString()}</p>
        <p>Customer: ${inv.customerName}</p>
      </div>
      <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${itemsHtml}</tbody></table>
      <div class="totals">
        <div><span>Subtotal</span><span>CHF ${inv.subtotal.toFixed(2)}</span></div>
        ${inv.discount > 0 ? `<div><span>Discount</span><span>-CHF ${inv.discount.toFixed(2)}</span></div>` : ''}
        <div class="total"><span>TOTAL</span><span>CHF ${inv.total.toFixed(2)}</span></div>
        <div><span>Payment</span><span>${inv.paymentMethod.toUpperCase()}</span></div>
      </div>
      ${inv.note ? `<p style="margin-top:12px;font-size:12px;color:#666">Note: ${inv.note}</p>` : ''}
      <div class="footer">
        <p>Thank you for your visit!</p>
        <p>www.barmagly.tech</p>
      </div>
    </body></html>`;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 300);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>{t('pos') || 'Point of Sale'}</Text>
          <Text style={styles.subtitle}>{t('pos_desc') || 'Quick checkout & invoicing'}</Text>
        </View>
        {cart.length > 0 && (
          <Pressable onPress={clearCart} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={styles.clearBtnText}>{t('clear') || 'Clear'}</Text>
          </Pressable>
        )}
      </View>

      <View style={[styles.mainLayout, !isWide && styles.mainLayoutStacked]}>
        {/* Left: Services */}
        <View style={[styles.servicesPanel, !isWide && { flex: undefined, width: '100%' }]}>
          {/* Search */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#666" />
            <TextInput style={styles.searchInput} placeholder={t('search_services') || 'Search services...'} placeholderTextColor="#555" value={searchQuery} onChangeText={setSearchQuery} />
          </View>

          {/* Categories — wrapped in fixed-height container so cards don't overlap */}
          <View style={styles.catScrollWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catRow}
              style={{ flexGrow: 0 }}
            >
              {categories.map(cat => {
                const active = activeCategory === cat;
                const info = getCategoryIcon(cat);
                return (
                  <Pressable key={cat} onPress={() => setActiveCategory(cat)}
                    style={[styles.catChip, active && styles.catChipActive, !active && { borderColor: info.color + '40' }]}>
                    <View style={[styles.catIconWrap, { backgroundColor: active ? 'rgba(24,26,32,0.2)' : info.color + '22' }]}>
                      <CategoryIcon cat={cat} size={14} forcedColor={active ? '#181A20' : info.color} />
                    </View>
                    <Text style={[styles.catText, active && styles.catTextActive]} numberOfLines={1}>
                      {cat === 'all' ? (t('all') || 'All') : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Services Grid */}
          {isLoading ? (
            <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.servicesGrid}>
              {filteredServices.map((s: any) => {
                const inCart = cart.find(c => c.id === s.id);
                const info = getServiceIcon(s.name, s.category);
                return (
                  <Pressable key={s.id} onPress={() => addToCart(s)}
                    style={[styles.serviceCard, inCart && styles.serviceCardActive, !inCart && { borderColor: info.color + '35' }]}>
                    <View style={[styles.serviceIconWrap, { backgroundColor: inCart ? PRIMARY + '30' : info.color + '22' }]}>
                      <ServiceIcon name={s.name} category={s.category} size={20} forcedColor={inCart ? PRIMARY : info.color} />
                    </View>
                    <Text style={[styles.serviceName, inCart && { color: '#fff' }]} numberOfLines={2}>{s.name}</Text>
                    <Text style={[styles.servicePrice, inCart && { color: PRIMARY }]}>CHF {s.price}</Text>
                    {s.duration && <Text style={[styles.serviceDuration, inCart && { color: '#bbb' }]}>{s.duration}</Text>}
                    {inCart && (
                      <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{inCart.qty}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
              {filteredServices.length === 0 && (
                <View style={styles.emptyServices}>
                  <Ionicons name="cut-outline" size={40} color={BORDER} />
                  <Text style={styles.emptyText}>{t('no_services') || 'No services found'}</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Right (or bottom on mobile): Cart & Checkout */}
        <View style={[styles.cartPanel, !isWide && { flex: undefined, width: '100%', maxHeight: undefined }]}>
          <Text style={styles.cartTitle}>
            <Ionicons name="cart" size={18} color={PRIMARY} /> {t('cart') || 'Cart'} ({cart.length})
          </Text>

          {/* Customer */}
          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <TextInput style={styles.cartInput} placeholder={t('customer_name') || 'Customer name (optional)'} placeholderTextColor="#555" value={customerName} onChangeText={setCustomerName} />
          </View>

          {/* Cart Items */}
          <ScrollView style={styles.cartItems} showsVerticalScrollIndicator={false}>
            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <Ionicons name="bag-outline" size={32} color={BORDER} />
                <Text style={styles.emptyCartText}>{t('empty_cart') || 'Tap services to add'}</Text>
              </View>
            ) : (
              cart.map(item => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>CHF {item.price} x {item.qty}</Text>
                  </View>
                  <View style={styles.qtyControls}>
                    <Pressable onPress={() => updateQty(item.id, -1)} style={styles.qtyBtn}>
                      <Ionicons name="remove" size={16} color="#fff" />
                    </Pressable>
                    <Text style={styles.qtyText}>{item.qty}</Text>
                    <Pressable onPress={() => updateQty(item.id, 1)} style={styles.qtyBtn}>
                      <Ionicons name="add" size={16} color="#fff" />
                    </Pressable>
                  </View>
                  <Text style={styles.cartItemTotal}>CHF {(item.price * item.qty).toFixed(2)}</Text>
                  <Pressable onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                    <Ionicons name="close" size={14} color="#EF4444" />
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>

          {/* Discount */}
          <View style={styles.inputGroup}>
            <Ionicons name="pricetag-outline" size={16} color="#666" />
            <TextInput style={styles.cartInput} placeholder={t('discount_hint') || 'Discount (e.g. 10 or 10%)'} placeholderTextColor="#555" value={discount} onChangeText={setDiscount} />
          </View>

          {/* Note */}
          <View style={styles.inputGroup}>
            <Ionicons name="document-text-outline" size={16} color="#666" />
            <TextInput style={styles.cartInput} placeholder={t('note') || 'Note (optional)'} placeholderTextColor="#555" value={note} onChangeText={setNote} />
          </View>

          {/* Payment Method */}
          <View style={styles.paymentRow}>
            {['cash', 'card', 'mobile'].map(m => (
              <Pressable key={m} onPress={() => setPaymentMethod(m)}
                style={[styles.paymentBtn, paymentMethod === m && styles.paymentBtnActive]}>
                <Ionicons name={m === 'cash' ? 'cash-outline' : m === 'card' ? 'card-outline' : 'phone-portrait-outline'} size={16} color={paymentMethod === m ? '#fff' : '#888'} />
                <Text style={[styles.paymentText, paymentMethod === m && styles.paymentTextActive]}>{m.charAt(0).toUpperCase() + m.slice(1)}</Text>
              </Pressable>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('subtotal') || 'Subtotal'}</Text>
              <Text style={styles.totalValue}>CHF {subtotal.toFixed(2)}</Text>
            </View>
            {discountAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: '#10B981' }]}>{t('discount') || 'Discount'}</Text>
                <Text style={[styles.totalValue, { color: '#10B981' }]}>-CHF {discountAmount.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.totalRowFinal]}>
              <Text style={styles.totalFinal}>{t('total') || 'TOTAL'}</Text>
              <Text style={styles.totalFinalValue}>CHF {total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Checkout Button */}
          <Pressable onPress={() => { if (cart.length > 0) checkout.mutate(); }}
            disabled={cart.length === 0 || checkout.isPending}
            style={[styles.checkoutBtn, cart.length === 0 && { opacity: 0.5 }]}>
            {checkout.isPending ? (
              <ActivityIndicator size="small" color="#181A20" />
            ) : (
              <>
                <Ionicons name="receipt-outline" size={20} color="#181A20" />
                <Text style={styles.checkoutText}>{t('checkout') || 'Checkout'} - CHF {total.toFixed(2)}</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {/* Invoice Modal — Premium Design */}
      <Modal visible={showInvoice} transparent animationType="fade">
        <View style={styles.invoiceOverlay}>
          <View style={styles.invoiceCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Success header with gradient */}
              <View style={styles.invoiceHeaderBox}>
                <View style={styles.invoiceSuccessIcon}>
                  <Ionicons name="checkmark" size={36} color="#fff" />
                </View>
                <Text style={styles.invoiceSuccess}>{t('payment_success') || 'Payment Successful'}</Text>
                <Text style={styles.invoiceSuccessSub}>{t('invoice_generated') || 'Invoice generated'}</Text>
              </View>

              {/* Salon branding */}
              <View style={styles.invoiceBrand}>
                <View style={styles.invoiceBrandLogo}>
                  <MaterialCommunityIcons name="scissors-cutting" size={22} color={PRIMARY} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.invoiceBrandName}>Barmagly Salon</Text>
                  <Text style={styles.invoiceBrandAddr}>barber.barmagly.tech</Text>
                </View>
                <View style={styles.invoicePaidBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                  <Text style={styles.invoicePaidText}>PAID</Text>
                </View>
              </View>

              {/* Invoice info grid */}
              <View style={styles.invoiceInfoGrid}>
                <View style={styles.invoiceInfoCell}>
                  <Text style={styles.invoiceInfoLabel}>{t('invoice_no') || 'Invoice No.'}</Text>
                  <Text style={styles.invoiceInfoValue} numberOfLines={1}>{lastInvoice?.invoiceNo}</Text>
                </View>
                <View style={styles.invoiceInfoCell}>
                  <Text style={styles.invoiceInfoLabel}>{t('date') || 'Date'}</Text>
                  <Text style={styles.invoiceInfoValue} numberOfLines={1}>{lastInvoice ? new Date(lastInvoice.date).toLocaleDateString() : ''}</Text>
                </View>
                <View style={styles.invoiceInfoCell}>
                  <Text style={styles.invoiceInfoLabel}>{t('customer') || 'Customer'}</Text>
                  <Text style={styles.invoiceInfoValue} numberOfLines={1}>{lastInvoice?.customerName}</Text>
                </View>
                <View style={styles.invoiceInfoCell}>
                  <Text style={styles.invoiceInfoLabel}>{t('payment_method') || 'Payment'}</Text>
                  <View style={styles.invoiceInfoRow}>
                    <Ionicons
                      name={lastInvoice?.paymentMethod === 'cash' ? 'cash-outline' : lastInvoice?.paymentMethod === 'card' ? 'card-outline' : 'phone-portrait-outline'}
                      size={13} color={PRIMARY} />
                    <Text style={styles.invoiceInfoValue}>{lastInvoice?.paymentMethod?.toUpperCase()}</Text>
                  </View>
                </View>
              </View>

              {/* Items table */}
              <View style={styles.invoiceItemsBox}>
                <View style={styles.invoiceItemsHead}>
                  <Text style={[styles.invoiceItemsHeadText, { flex: 1 }]}>{t('item') || 'Item'}</Text>
                  <Text style={[styles.invoiceItemsHeadText, { width: 40, textAlign: 'center' }]}>{t('qty') || 'Qty'}</Text>
                  <Text style={[styles.invoiceItemsHeadText, { width: 80, textAlign: 'right' }]}>{t('total') || 'Total'}</Text>
                </View>
                {lastInvoice?.items?.map((item: CartItem, i: number) => {
                  const info = getServiceIcon(item.name, item.category);
                  return (
                    <View key={i} style={styles.invoiceItem}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={[styles.invoiceItemIcon, { backgroundColor: info.color + '22' }]}>
                          <ServiceIcon name={item.name} category={item.category} size={14} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.invoiceItemName} numberOfLines={1}>{item.name}</Text>
                          <Text style={styles.invoiceItemUnit}>CHF {item.price.toFixed(2)} each</Text>
                        </View>
                      </View>
                      <Text style={[styles.invoiceItemQty, { width: 40 }]}>×{item.qty}</Text>
                      <Text style={[styles.invoiceItemPrice, { width: 80 }]}>CHF {(item.price * item.qty).toFixed(2)}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Totals */}
              <View style={styles.invoiceTotals}>
                <View style={styles.invoiceTotalRow}>
                  <Text style={styles.invoiceTotalLabel}>{t('subtotal') || 'Subtotal'}</Text>
                  <Text style={styles.invoiceTotalValue}>CHF {lastInvoice?.subtotal?.toFixed(2)}</Text>
                </View>
                {(lastInvoice?.discount || 0) > 0 && (
                  <View style={styles.invoiceTotalRow}>
                    <View style={styles.invoiceTotalLabelRow}>
                      <Ionicons name="pricetag" size={12} color="#10B981" />
                      <Text style={[styles.invoiceTotalLabel, { color: '#10B981' }]}>{t('discount') || 'Discount'}</Text>
                    </View>
                    <Text style={[styles.invoiceTotalValue, { color: '#10B981' }]}>-CHF {lastInvoice?.discount?.toFixed(2)}</Text>
                  </View>
                )}
                <View style={styles.invoiceFinalRow}>
                  <Text style={styles.invoiceFinalLabel}>{t('total') || 'TOTAL'}</Text>
                  <Text style={styles.invoiceFinalValue}>CHF {lastInvoice?.total?.toFixed(2)}</Text>
                </View>
              </View>

              {lastInvoice?.note && (
                <View style={styles.invoiceNoteBox}>
                  <Ionicons name="document-text-outline" size={14} color={PRIMARY} />
                  <Text style={styles.invoiceNoteText}>{lastInvoice.note}</Text>
                </View>
              )}

              {/* Thank you */}
              <View style={styles.invoiceFooter}>
                <Text style={styles.invoiceFooterText}>{t('thank_you_visit') || 'Thank you for your visit!'}</Text>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.invoiceActions}>
              <Pressable onPress={printInvoice} style={({ pressed }) => [styles.printBtn, pressed && { opacity: 0.85 }]}>
                <Ionicons name="print-outline" size={18} color={PRIMARY} />
                <Text style={styles.printBtnText}>{t('print_invoice') || 'Print'}</Text>
              </Pressable>
              <Pressable onPress={() => setShowInvoice(false)} style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.85 }]}>
                <Ionicons name="checkmark" size={18} color="#181A20" />
                <Text style={styles.doneBtnText}>{t('done') || 'Done'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginTop: 8, marginBottom: 12 },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 28 },
  subtitle: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginTop: 2 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EF444418', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  clearBtnText: { color: '#EF4444', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },

  // Main Layout — side-by-side on desktop, stacked column on mobile
  mainLayout: { flex: 1, flexDirection: 'row', gap: 16, paddingHorizontal: 20, paddingBottom: 100 },
  mainLayoutStacked: { flexDirection: 'column', paddingHorizontal: 14, gap: 14, paddingBottom: 120 },
  servicesPanel: { flex: 3 },
  cartPanel: { flex: 2, backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16 },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 12, height: 42, gap: 8, marginBottom: 12 },
  searchInput: { flex: 1, color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 14, height: '100%' },

  // Categories — fixed width chips (All-size) for uniform appearance
  catScrollWrap: { height: 60, marginBottom: 14, paddingVertical: 4 },
  catRow: { gap: 8, paddingBottom: 2, paddingHorizontal: 2, alignItems: 'center' },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
    width: 120,
    height: 48,
  },
  catIconWrap: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  catChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  catText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 12, flexShrink: 1 },
  catTextActive: { color: '#181A20' },

  // Services Grid — flex items scale to fit all screen widths
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 20 },
  serviceCard: { width: 140, flexGrow: 1, maxWidth: '48%', backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 12, alignItems: 'center', position: 'relative' },
  serviceCardActive: { borderColor: PRIMARY, backgroundColor: `${PRIMARY}12` },
  serviceIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: `${PRIMARY}18`, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  serviceName: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 12, textAlign: 'center', marginBottom: 4 },
  servicePrice: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 14 },
  serviceDuration: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 10, marginTop: 2 },
  cartBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: PRIMARY, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  cartBadgeText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 11 },
  emptyServices: { width: '100%', alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { color: '#666', fontFamily: 'Urbanist_500Medium', fontSize: 14 },

  // Cart
  cartTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 17, marginBottom: 12 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#13151B', borderRadius: 10, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 12, height: 40, marginBottom: 10 },
  cartInput: { flex: 1, color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 13, height: '100%' },
  cartItems: { maxHeight: 260, marginBottom: 10 },
  emptyCart: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyCartText: { color: '#555', fontFamily: 'Urbanist_400Regular', fontSize: 13 },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  cartItemName: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  cartItemPrice: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 11 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  qtyText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 14, minWidth: 18, textAlign: 'center' },
  cartItemTotal: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 13, minWidth: 60, textAlign: 'right' },
  removeBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#EF444418', alignItems: 'center', justifyContent: 'center' },

  // Payment
  paymentRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  paymentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: BORDER, backgroundColor: '#13151B' },
  paymentBtnActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  paymentText: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 11 },
  paymentTextActive: { color: '#fff' },

  // Totals
  totals: { backgroundColor: '#13151B', borderRadius: 12, padding: 14, marginBottom: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, gap: 10 },
  totalLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13, flexShrink: 1 },
  totalValue: { color: '#ccc', fontFamily: 'Urbanist_600SemiBold', fontSize: 13, textAlign: 'right' },
  totalRowFinal: { borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 10, marginTop: 6 },
  totalFinal: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15, flexShrink: 1 },
  totalFinalValue: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 20, textAlign: 'right' },

  // Checkout
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: PRIMARY, borderRadius: 14, height: 50 },
  checkoutText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 16 },

  // Invoice Modal - Premium
  invoiceOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  invoiceCard: { backgroundColor: CARD, borderRadius: 28, borderWidth: 1, borderColor: BORDER, padding: 20, width: '100%', maxWidth: 440, maxHeight: '92%' },

  invoiceHeaderBox: { alignItems: 'center', gap: 8, marginBottom: 16, paddingVertical: 12 },
  invoiceSuccessIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  invoiceSuccess: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20, marginTop: 8 },
  invoiceSuccessSub: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13 },

  invoiceBrand: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#13151B', borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 12, marginBottom: 16 },
  invoiceBrandLogo: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(244,164,96,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(244,164,96,0.3)' },
  invoiceBrandName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  invoiceBrandAddr: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 11 },
  invoicePaidBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  invoicePaidText: { color: '#10B981', fontFamily: 'Urbanist_700Bold', fontSize: 10, letterSpacing: 0.5 },

  invoiceInfoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  invoiceInfoCell: { flex: 1, minWidth: '45%', backgroundColor: '#13151B', borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 10 },
  invoiceInfoLabel: { color: '#666', fontFamily: 'Urbanist_500Medium', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  invoiceInfoValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 12 },
  invoiceInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  invoiceItemsBox: { backgroundColor: '#13151B', borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 12, marginBottom: 14 },
  invoiceItemsHead: { flexDirection: 'row', alignItems: 'center', paddingBottom: 8, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: BORDER, borderStyle: 'dashed' },
  invoiceItemsHeadText: { color: '#666', fontFamily: 'Urbanist_700Bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  invoiceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  invoiceItemIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  invoiceItemName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 13 },
  invoiceItemUnit: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 10 },
  invoiceItemQty: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 13, textAlign: 'center' },
  invoiceItemPrice: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 13, textAlign: 'right' },

  invoiceTotals: { backgroundColor: '#13151B', borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 12 },
  invoiceTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  invoiceTotalLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  invoiceTotalLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13 },
  invoiceTotalValue: { color: '#ccc', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  invoiceFinalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 6, borderTopWidth: 1, borderTopColor: PRIMARY + '40' },
  invoiceFinalLabel: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16, letterSpacing: 1 },
  invoiceFinalValue: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 24 },

  invoiceNoteBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(244,164,96,0.08)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(244,164,96,0.2)', padding: 10, marginBottom: 10 },
  invoiceNoteText: { flex: 1, color: '#ccc', fontFamily: 'Urbanist_400Regular', fontSize: 12, lineHeight: 16 },

  invoiceFooter: { alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: BORDER, borderStyle: 'dashed', marginTop: 4 },
  invoiceFooterText: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 12 },

  invoiceActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  printBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: PRIMARY, backgroundColor: 'rgba(244,164,96,0.08)' },
  printBtnText: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 14 },
  doneBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: PRIMARY, paddingVertical: 14, borderRadius: 14, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  doneBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 14 },
});
