import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

const CATEGORIES = ['tools', 'products', 'supplies', 'general'];

const CAT_CONFIG: Record<string, { icon: string; color: string }> = {
  tools: { icon: 'cut', color: '#6C63FF' },
  products: { icon: 'flask', color: '#3B82F6' },
  supplies: { icon: 'bag', color: '#10B981' },
  general: { icon: 'cube', color: PRIMARY },
};

const EMPTY_FORM = { name: '', category: 'products', quantity: '', minQuantity: '5', unit: 'pcs', price: '' };

export default function SalonInventory() {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const qc = useQueryClient();
  const CAT_LABELS: Record<string, string> = { tools: t('tools'), products: t('products'), supplies: t('supplies'), general: t('general_category') || 'General' };
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/inventory');
      return res.json();
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, quantity: parseInt(form.quantity) || 0, minQuantity: parseInt(form.minQuantity) || 5, price: parseFloat(form.price) || 0 };
      if (editing) {
        const res = await apiRequest('PUT', `/api/salon/inventory/${editing.id}`, payload);
        return res.json();
      }
      const res = await apiRequest('POST', '/api/salon/inventory', payload);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      setShowForm(false);
      setEditing(null);
      setForm({ ...EMPTY_FORM });
    },
    onError: () => Alert.alert(t('error'), t('failed_save_item')),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/salon/inventory/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      name: item.name, category: item.category, quantity: String(item.quantity),
      minQuantity: String(item.minQuantity), unit: item.unit, price: String(item.price),
    });
    setShowForm(true);
  };

  const filtered = useMemo(() => {
    let list = catFilter === 'all' ? items : items.filter((i: any) => i.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i: any) => (i.name || '').toLowerCase().includes(q));
    }
    return list;
  }, [items, catFilter, search]);

  const lowStock = items.filter((i: any) => i.quantity <= i.minQuantity).length;
  const totalValue = items.reduce((s: number, i: any) => s + ((i.price || 0) * (i.quantity || 0)), 0);
  const catCounts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    CATEGORIES.forEach(cat => { c[cat] = items.filter((i: any) => i.category === cat).length; });
    return c;
  }, [items]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>{t('inventory_title')}</Text>
          <Text style={styles.subtitle}>{t('manage_stock') || 'Track & manage your stock'}</Text>
        </View>
        <Pressable
          onPress={() => { setEditing(null); setForm({ ...EMPTY_FORM }); setShowForm(true); }}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={18} color="#181A20" />
          <Text style={styles.addBtnText}>{t('add')}</Text>
        </Pressable>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: PRIMARY }]}>
          <Ionicons name="cube-outline" size={18} color={PRIMARY} />
          <Text style={styles.statValue}>{items.length}</Text>
          <Text style={styles.statLabel}>{t('total_items') || 'Items'}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: lowStock > 0 ? '#EF4444' : '#10B981' }]}>
          <Ionicons name="alert-circle-outline" size={18} color={lowStock > 0 ? '#EF4444' : '#10B981'} />
          <Text style={[styles.statValue, lowStock > 0 && { color: '#EF4444' }]}>{lowStock}</Text>
          <Text style={styles.statLabel}>{t('low_stock') || 'Low Stock'}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
          <Ionicons name="cash-outline" size={18} color="#10B981" />
          <Text style={styles.statValue}>${totalValue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>{t('total_value') || 'Value'}</Text>
        </View>
      </View>

      {/* Low stock warning */}
      {lowStock > 0 && (
        <Pressable
          style={styles.warning}
          onPress={() => setCatFilter('all')}
        >
          <View style={styles.warningIconWrap}>
            <Ionicons name="warning" size={16} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>{t('low_stock_alert') || 'Low Stock Alert'}</Text>
            <Text style={styles.warningText}>{lowStock} {t('low_stock_warning')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#F59E0B" />
        </Pressable>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder={t('search_items') || 'Search items...'}
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#666" />
          </Pressable>
        )}
      </View>

      {/* Category filter — wrapped in fixed-height container so chips don't overlap the list */}
      <View style={styles.catScrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
          style={{ flexGrow: 0, maxHeight: 70 }}
        >
          {['all', ...CATEGORIES].map(c => {
            const isActive = catFilter === c;
            const conf = CAT_CONFIG[c];
            const activeColor = conf?.color || PRIMARY;
            return (
              <Pressable
                key={c}
                onPress={() => setCatFilter(c)}
                style={({ pressed }) => [
                  styles.catChip,
                  isActive && { backgroundColor: activeColor, borderColor: activeColor },
                  !isActive && { borderColor: activeColor + '40' },
                  pressed && { opacity: 0.85 },
                ]}
              >
                {conf && <Ionicons name={conf.icon as any} size={15} color={isActive ? '#fff' : activeColor} />}
                {c === 'all' && <Ionicons name="grid-outline" size={15} color={isActive ? '#fff' : activeColor} />}
                <Text style={[styles.catText, isActive && { color: '#fff' }]} numberOfLines={1}>
                  {c === 'all' ? t('all') : CAT_LABELS[c]}
                </Text>
                {catCounts[c] > 0 && (
                  <View style={[styles.countBadge, isActive && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                    <Text style={[styles.countText, isActive && { color: '#fff' }]}>{catCounts[c]}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>{t('loading') || 'Loading...'}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="cube-outline" size={40} color={BORDER} />
              </View>
              <Text style={styles.emptyTitle}>{t('no_items_category')}</Text>
              <Text style={styles.emptySubtitle}>
                {search ? (t('try_different_search') || 'Try a different search term') : (t('add_items_hint') || 'Tap + Add to add items')}
              </Text>
            </View>
          ) : (
            filtered.map((item: any) => {
              const low = item.quantity <= item.minQuantity;
              const conf = CAT_CONFIG[item.category] || CAT_CONFIG.general;
              const stockPct = item.minQuantity > 0 ? Math.min((item.quantity / (item.minQuantity * 3)) * 100, 100) : 100;

              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.card, low && styles.cardLow, pressed && { opacity: 0.95 }]}
                  onPress={() => openEdit(item)}
                >
                  <View style={[styles.catIconWrap, { backgroundColor: low ? '#EF444418' : `${conf.color}18` }]}>
                    <Ionicons name={conf.icon as any} size={22} color={low ? '#EF4444' : conf.color} />
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardNameRow}>
                      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.price}>${item.price}</Text>
                    </View>
                    <Text style={[styles.itemCat, { color: conf.color }]}>{CAT_LABELS[item.category] || item.category}</Text>

                    {/* Stock bar */}
                    <View style={styles.stockSection}>
                      <View style={styles.stockBarBg}>
                        <View
                          style={[
                            styles.stockBarFill,
                            {
                              width: `${stockPct}%`,
                              backgroundColor: low ? '#EF4444' : stockPct > 60 ? '#10B981' : '#F59E0B',
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.stockInfo}>
                        <View style={[styles.qtyBadge, { backgroundColor: low ? '#EF444418' : '#10B98118' }]}>
                          <Text style={[styles.qtyText, { color: low ? '#EF4444' : '#10B981' }]}>
                            {item.quantity} {item.unit}
                          </Text>
                        </View>
                        {low && (
                          <View style={styles.lowBadge}>
                            <Ionicons name="alert-circle" size={11} color="#EF4444" />
                            <Text style={styles.lowText}>{t('low_stock_alert') || 'Low'}!</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <Pressable onPress={() => openEdit(item)} style={styles.editBtn}>
                      <Ionicons name="pencil" size={14} color={PRIMARY} />
                    </Pressable>
                    <Pressable
                      onPress={() => Alert.alert(t('delete'), t('delete_item_confirm'), [
                        { text: t('cancel'), style: 'cancel' },
                        { text: t('delete'), style: 'destructive', onPress: () => deleteItem.mutate(item.id) },
                      ])}
                      style={styles.delBtn}
                    >
                      <Ionicons name="trash" size={14} color="#EF4444" />
                    </Pressable>
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowForm(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{editing ? t('edit_item_form') : t('add_new_item')}</Text>
                <Text style={styles.modalSubtitle}>{editing ? (t('update_details') || 'Update item details') : (t('add_to_inventory') || 'Add item to inventory')}</Text>
              </View>
              <Pressable onPress={() => setShowForm(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#888" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { label: t('item_name_label'), key: 'name', placeholder: t('example_item'), icon: 'text-outline' },
                { label: t('quantity_label'), key: 'quantity', placeholder: '0', type: 'number-pad', icon: 'layers-outline' },
                { label: t('min_alert'), key: 'minQuantity', placeholder: '5', type: 'number-pad', icon: 'alert-circle-outline' },
                { label: t('unit_label'), key: 'unit', placeholder: t('unit_hint'), icon: 'resize-outline' },
                { label: t('price_label'), key: 'price', placeholder: '0.00', type: 'decimal-pad', icon: 'cash-outline' },
              ].map(f => (
                <View key={f.key} style={styles.formField}>
                  <Text style={styles.formLabel}>{f.label}</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name={f.icon as any} size={16} color="#666" />
                    <TextInput
                      style={styles.formInput}
                      placeholder={f.placeholder}
                      placeholderTextColor="#444"
                      value={(form as any)[f.key]}
                      onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                      keyboardType={(f.type as any) || 'default'}
                    />
                  </View>
                </View>
              ))}

              <View style={styles.formField}>
                <Text style={styles.formLabel}>{t('category_label')}</Text>
                <View style={styles.catPicker}>
                  {CATEGORIES.map(c => {
                    const conf = CAT_CONFIG[c];
                    const isActive = form.category === c;
                    return (
                      <Pressable
                        key={c}
                        onPress={() => setForm(prev => ({ ...prev, category: c }))}
                        style={[styles.catOption, isActive && { backgroundColor: conf.color, borderColor: conf.color }]}
                      >
                        <Ionicons name={conf.icon as any} size={14} color={isActive ? '#fff' : '#888'} />
                        <Text style={[styles.catOptionText, isActive && { color: '#fff' }]}>
                          {CAT_LABELS[c]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable onPress={() => save.mutate()} style={styles.saveBtn} disabled={save.isPending}>
                <Ionicons name={editing ? 'checkmark-circle' : 'add-circle'} size={20} color="#181A20" />
                <Text style={styles.saveBtnText}>{save.isPending ? t('saving') : editing ? t('save') : t('add')}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginTop: 8, marginBottom: 14 },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 28 },
  subtitle: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 14, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PRIMARY, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  addBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 14 },

  // Stats — compact
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 10 },
  statCard: {
    flex: 1, flexDirection: 'row', backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8,
    borderWidth: 1, borderColor: BORDER, borderLeftWidth: 3,
    alignItems: 'center', gap: 8,
  },
  statValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  statLabel: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 10 },

  // Warning
  warning: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F59E0B12', borderRadius: 14, borderWidth: 1, borderColor: '#F59E0B30',
    marginHorizontal: 20, padding: 12, marginBottom: 12,
  },
  warningIconWrap: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#F59E0B20',
    alignItems: 'center', justifyContent: 'center',
  },
  warningTitle: { color: '#F59E0B', fontFamily: 'Urbanist_700Bold', fontSize: 13 },
  warningText: { color: '#F59E0BAA', fontFamily: 'Urbanist_400Regular', fontSize: 12 },

  // Search
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: CARD,
    borderRadius: 14, borderWidth: 1, borderColor: BORDER,
    marginHorizontal: 20, paddingHorizontal: 14, height: 46, gap: 10, marginBottom: 12,
  },
  searchInput: { flex: 1, color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 14, height: '100%' },

  // Category filter — wrapped in fixed-height container
  catScrollWrap: { height: 68, marginBottom: 14, paddingVertical: 6 },
  catRow: { paddingHorizontal: 20, gap: 10, alignItems: 'center' },
  catChip: {
    flexShrink: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingHorizontal: 16,
    borderRadius: 14, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD,
    height: 50,
  },
  catText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 13 },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3, minWidth: 26, alignItems: 'center',
  },
  countText: { color: '#ccc', fontFamily: 'Urbanist_700Bold', fontSize: 11 },

  // Loading
  loadingContainer: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  loadingText: { color: '#666', fontFamily: 'Urbanist_500Medium', fontSize: 14 },

  // List
  list: { paddingHorizontal: 20 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { color: '#aaa', fontFamily: 'Urbanist_600SemiBold', fontSize: 16, marginBottom: 4 },
  emptySubtitle: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 13 },

  // Card
  card: {
    backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  cardLow: { borderColor: '#EF444440' },
  catIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  itemName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15, flex: 1 },
  price: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  itemCat: { fontFamily: 'Urbanist_500Medium', fontSize: 11, marginBottom: 8, textTransform: 'capitalize' },

  // Stock bar
  stockSection: { gap: 6 },
  stockBarBg: { height: 4, backgroundColor: '#ffffff10', borderRadius: 2, overflow: 'hidden' },
  stockBarFill: { height: '100%', borderRadius: 2 },
  stockInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  qtyText: { fontFamily: 'Urbanist_600SemiBold', fontSize: 12 },
  lowBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  lowText: { color: '#EF4444', fontFamily: 'Urbanist_600SemiBold', fontSize: 11 },

  // Actions
  cardActions: { gap: 6 },
  editBtn: { width: 34, height: 34, borderRadius: 12, backgroundColor: `${PRIMARY}18`, alignItems: 'center', justifyContent: 'center' },
  delBtn: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#EF444418', alignItems: 'center', justifyContent: 'center' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: CARD, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12, borderWidth: 1, borderColor: BORDER, maxHeight: '85%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#444', alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20 },
  modalSubtitle: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff08', alignItems: 'center', justifyContent: 'center' },
  formField: { marginBottom: 16 },
  formLabel: { color: '#999', fontFamily: 'Urbanist_600SemiBold', fontSize: 13, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#13151B', borderRadius: 14, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, height: 50,
  },
  formInput: { flex: 1, color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 14, height: '100%' },
  catPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catOption: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: '#13151B',
  },
  catOptionText: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 12 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: PRIMARY, borderRadius: 14, height: 52, marginTop: 8, marginBottom: 20,
  },
  saveBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
});
