import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator, Platform, Image as RNImage } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

const CATEGORIES = ['hair', 'skin', 'beard', 'tools', 'accessories', 'general'];
const EMPTY_FORM = { name: '', description: '', category: 'hair', price: '', stock: '10', image: '', isActive: true };

export default function SalonProducts() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['salon-products'],
    queryFn: async () => { const res = await apiRequest('GET', '/api/salon/products'); return res.json(); },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        stock: parseInt(form.stock) || 0,
      };
      if (editing) {
        const res = await apiRequest('PUT', `/api/salon/products/${editing.id}`, payload);
        return res.json();
      }
      const res = await apiRequest('POST', '/api/salon/products', payload);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-products'] });
      setShowForm(false); setEditing(null); setForm({ ...EMPTY_FORM });
    },
    onError: () => Alert.alert(t('error') || 'Error', 'Failed to save product'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/salon/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salon-products'] }),
  });

  const handleImageUpload = async () => {
    if (Platform.OS !== 'web') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append('image', file);
      try {
        const res = await fetch('/api/salon/upload', { method: 'POST', body: fd, credentials: 'include' });
        const data = await res.json();
        if (data.url) setForm(p => ({ ...p, image: data.url }));
      } catch { Alert.alert('Error', 'Upload failed'); }
    };
    input.click();
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      name: item.name, description: item.description || '', category: item.category || 'general',
      price: String(item.price), stock: String(item.stock), image: item.image || '', isActive: item.isActive ?? true,
    });
    setShowForm(true);
  };

  const filtered = useMemo(() => {
    let list = filter === 'all' ? items : items.filter((i: any) => i.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i: any) => (i.name || '').toLowerCase().includes(q));
    }
    return list;
  }, [items, filter, search]);

  const totalValue = items.reduce((s: number, i: any) => s + (i.price * i.stock), 0);
  const lowStock = items.filter((i: any) => i.stock <= 5).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>{t('products') || 'Products'}</Text>
          <Text style={styles.subtitle}>{t('products_desc') || 'Sell retail products to customers'}</Text>
        </View>
        <Pressable onPress={() => { setEditing(null); setForm({ ...EMPTY_FORM }); setShowForm(true); }} style={styles.addBtn}>
          <Ionicons name="add" size={18} color="#181A20" />
          <Text style={styles.addBtnText}>{t('add') || 'Add'}</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: PRIMARY }]}>
          <Ionicons name="cube-outline" size={18} color={PRIMARY} />
          <Text style={styles.statValue}>{items.length}</Text>
          <Text style={styles.statLabel}>{t('total_products') || 'Products'}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: lowStock > 0 ? '#EF4444' : '#10B981' }]}>
          <Ionicons name="alert-circle-outline" size={18} color={lowStock > 0 ? '#EF4444' : '#10B981'} />
          <Text style={[styles.statValue, lowStock > 0 && { color: '#EF4444' }]}>{lowStock}</Text>
          <Text style={styles.statLabel}>{t('low_stock') || 'Low Stock'}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
          <Ionicons name="cash-outline" size={18} color="#10B981" />
          <Text style={styles.statValue}>CHF {totalValue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>{t('total_value') || 'Value'}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#666" />
        <TextInput style={styles.searchInput} placeholder={t('search_products') || 'Search products...'} placeholderTextColor="#555" value={search} onChangeText={setSearch} />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
        {['all', ...CATEGORIES].map(c => {
          const isActive = filter === c;
          const iconMap: Record<string, string> = {
            all: 'apps',
            hair: 'cut',
            skin: 'happy',
            beard: 'man',
            tools: 'hammer',
            accessories: 'pricetag',
            general: 'cube',
          };
          const colorMap: Record<string, string> = {
            all: PRIMARY,
            hair: '#8B5CF6',
            skin: '#EC4899',
            beard: '#F59E0B',
            tools: '#3B82F6',
            accessories: '#10B981',
            general: '#6366F1',
          };
          const itemColor = colorMap[c] || PRIMARY;
          const count = c === 'all' ? items.length : items.filter((i: any) => i.category === c).length;
          return (
            <Pressable
              key={c}
              onPress={() => setFilter(c)}
              style={[
                styles.catChip,
                isActive && { backgroundColor: itemColor + '20', borderColor: itemColor }
              ]}
            >
              <View style={[styles.catChipIcon, { backgroundColor: isActive ? itemColor : itemColor + '18' }]}>
                <Ionicons name={(iconMap[c] || 'cube') as any} size={14} color={isActive ? '#fff' : itemColor} />
              </View>
              <Text style={[styles.catText, isActive && { color: '#fff' }]}>
                {c === 'all' ? (t('all') || 'All') : c.charAt(0).toUpperCase() + c.slice(1)}
              </Text>
              {count > 0 && (
                <View style={[styles.catBadge, isActive && { backgroundColor: itemColor }]}>
                  <Text style={[styles.catBadgeText, isActive && { color: '#fff' }]}>{count}</Text>
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
              <Text style={styles.emptyText}>{t('no_products') || 'No products yet'}</Text>
              <Text style={styles.emptySubtext}>{t('add_first_product') || 'Tap + Add to start selling products'}</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filtered.map((item: any) => (
                <Pressable key={item.id} onPress={() => openEdit(item)} style={styles.productCard}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.productImage} contentFit="cover" />
                  ) : (
                    <View style={[styles.productImage, { backgroundColor: PRIMARY + '15', alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name="image-outline" size={32} color={PRIMARY} />
                    </View>
                  )}
                  {item.stock <= 5 && (
                    <View style={styles.stockBadge}>
                      <Text style={styles.stockBadgeText}>{item.stock === 0 ? 'OUT OF STOCK' : `Only ${item.stock} left`}</Text>
                    </View>
                  )}
                  {!item.isActive && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveBadgeText}>HIDDEN</Text>
                    </View>
                  )}
                  <View style={styles.productInfo}>
                    <Text style={styles.productCat}>{item.category?.toUpperCase()}</Text>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.productBottom}>
                      <Text style={styles.productPrice}>CHF {item.price}</Text>
                      <Text style={styles.productStock}>{item.stock} in stock</Text>
                    </View>
                  </View>
                  <Pressable onPress={(e: any) => { e.stopPropagation?.(); Alert.alert('Delete?', `Delete ${item.name}?`, [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove.mutate(item.id) }]); }} style={styles.deleteBtn}>
                    <Ionicons name="trash" size={14} color="#EF4444" />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Form Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? (t('edit_product') || 'Edit Product') : (t('add_new_product') || 'Add New Product')}</Text>
              <Pressable onPress={() => { setShowForm(false); setEditing(null); }} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#888" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Image */}
              <Pressable onPress={handleImageUpload} style={styles.imageUpload}>
                {form.image ? (
                  <Image source={{ uri: form.image }} style={styles.uploadedImage} contentFit="cover" />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="cloud-upload-outline" size={32} color={PRIMARY} />
                    <Text style={styles.imagePlaceholderText}>{t('upload_image') || 'Upload Image'}</Text>
                  </View>
                )}
              </Pressable>

              {[
                { label: t('product_name') || 'Name', key: 'name', placeholder: 'e.g. Organic Hair Cream', icon: 'pricetag-outline' },
                { label: t('description') || 'Description', key: 'description', placeholder: 'Brief description...', icon: 'document-text-outline', multiline: true },
                { label: t('price') || 'Price (CHF)', key: 'price', placeholder: '0.00', icon: 'cash-outline', type: 'decimal-pad' },
                { label: t('stock') || 'Stock', key: 'stock', placeholder: '10', icon: 'cube-outline', type: 'number-pad' },
              ].map(f => (
                <View key={f.key} style={styles.formField}>
                  <Text style={styles.formLabel}>{f.label}</Text>
                  <View style={[styles.inputWrap, f.multiline && { height: 80, alignItems: 'flex-start', paddingVertical: 10 }]}>
                    <Ionicons name={f.icon as any} size={16} color="#666" />
                    <TextInput style={[styles.formInput, f.multiline && { textAlignVertical: 'top' }]} placeholder={f.placeholder} placeholderTextColor="#444"
                      value={(form as any)[f.key]} onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                      keyboardType={(f.type as any) || 'default'} multiline={f.multiline} />
                  </View>
                </View>
              ))}

              <View style={styles.formField}>
                <Text style={styles.formLabel}>{t('category') || 'Category'}</Text>
                <View style={styles.catPicker}>
                  {CATEGORIES.map(c => (
                    <Pressable key={c} onPress={() => setForm(p => ({ ...p, category: c }))}
                      style={[styles.catOption, form.category === c && styles.catOptionActive]}>
                      <Text style={[styles.catOptionText, form.category === c && styles.catOptionTextActive]}>{c.charAt(0).toUpperCase() + c.slice(1)}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable onPress={() => setForm(p => ({ ...p, isActive: !p.isActive }))} style={styles.activeToggle}>
                <View style={[styles.checkbox, form.isActive && { backgroundColor: PRIMARY, borderColor: PRIMARY }]}>
                  {form.isActive && <Ionicons name="checkmark" size={14} color="#181A20" />}
                </View>
                <Text style={styles.activeText}>{t('show_in_shop') || 'Visible in customer shop'}</Text>
              </Pressable>

              <View style={styles.formActions}>
                <Pressable onPress={() => { setShowForm(false); setEditing(null); }} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>{t('cancel') || 'Cancel'}</Text>
                </Pressable>
                <Pressable onPress={() => save.mutate()} disabled={save.isPending} style={styles.saveBtn}>
                  {save.isPending ? <ActivityIndicator size="small" color="#181A20" /> : <Text style={styles.saveBtnText}>{editing ? (t('save') || 'Save') : (t('add') || 'Add')}</Text>}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginTop: 8, marginBottom: 14 },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 28 },
  subtitle: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PRIMARY, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  addBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 14 },

  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: BORDER, borderLeftWidth: 3, alignItems: 'center', gap: 4 },
  statValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18 },
  statLabel: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 11 },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, marginHorizontal: 20, paddingHorizontal: 14, height: 46, gap: 10, marginBottom: 12 },
  searchInput: { flex: 1, color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 14, height: '100%' },

  catRow: { paddingHorizontal: 20, paddingBottom: 14, gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD },
  catChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  catText: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  catTextActive: { color: '#181A20' },

  list: { paddingHorizontal: 20 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { color: '#aaa', fontFamily: 'Urbanist_600SemiBold', fontSize: 16 },
  emptySubtext: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 13 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productCard: { width: Platform.OS === 'web' ? 200 : '47%', backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: 'hidden', position: 'relative' },
  productImage: { width: '100%', height: 140 },
  stockBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  stockBadgeText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 10 },
  inactiveBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#666', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  inactiveBadgeText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 10 },
  productInfo: { padding: 12 },
  productCat: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 10, marginBottom: 4 },
  productName: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 14, marginBottom: 8, minHeight: 36 },
  productBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  productStock: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 11 },
  deleteBtn: { position: 'absolute', bottom: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: '#EF444420', alignItems: 'center', justifyContent: 'center' },

  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: CARD, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12, maxHeight: '90%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#444', alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff10', alignItems: 'center', justifyContent: 'center' },
  modalTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20 },
  imageUpload: { height: 160, borderRadius: 14, borderWidth: 2, borderColor: BORDER, borderStyle: 'dashed', overflow: 'hidden', marginBottom: 14 },
  uploadedImage: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePlaceholderText: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  formField: { marginBottom: 14 },
  formLabel: { color: '#999', fontFamily: 'Urbanist_600SemiBold', fontSize: 13, marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#13151B', borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, height: 46 },
  formInput: { flex: 1, color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 14, height: '100%' },
  catPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: BORDER, backgroundColor: '#13151B' },
  catOptionActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  catOptionText: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 12 },
  catOptionTextActive: { color: '#181A20' },
  activeToggle: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, marginBottom: 14 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  activeText: { color: '#ccc', fontFamily: 'Urbanist_500Medium', fontSize: 14 },
  formActions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: '#aaa', fontFamily: 'Urbanist_600SemiBold', fontSize: 15 },
  saveBtn: { flex: 1, height: 48, backgroundColor: PRIMARY, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
});
