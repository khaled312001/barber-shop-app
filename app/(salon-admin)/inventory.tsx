import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

const CATEGORIES = ['tools', 'products', 'supplies', 'general'];
const CAT_LABELS: Record<string, string> = { tools: 'أدوات', products: 'منتجات', supplies: 'مستلزمات', general: 'عام' };
const CAT_ICONS: Record<string, any> = { tools: 'cut', products: 'flask', supplies: 'bag', general: 'cube' };

const EMPTY_FORM = { name: '', category: 'products', quantity: '', minQuantity: '5', unit: 'pcs', price: '' };

export default function SalonInventory() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [catFilter, setCatFilter] = useState('all');

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
    onError: () => Alert.alert('خطأ', 'فشل حفظ العنصر'),
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

  const filtered = catFilter === 'all' ? items : items.filter((i: any) => i.category === catFilter);
  const lowStock = items.filter((i: any) => i.quantity <= i.minQuantity).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>المخزون</Text>
        <Pressable onPress={() => { setEditing(null); setForm({ ...EMPTY_FORM }); setShowForm(true); }} style={styles.addBtn}>
          <Ionicons name="add" size={20} color="#181A20" />
          <Text style={styles.addBtnText}>إضافة</Text>
        </Pressable>
      </View>

      {/* Low stock warning */}
      {lowStock > 0 && (
        <View style={styles.warning}>
          <Ionicons name="warning-outline" size={16} color="#F59E0B" />
          <Text style={styles.warningText}>{lowStock} عنصر في مستوى منخفض</Text>
        </View>
      )}

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
        {['all', ...CATEGORIES].map(c => (
          <Pressable key={c} onPress={() => setCatFilter(c)} style={[styles.catChip, catFilter === c && styles.catChipActive]}>
            <Text style={[styles.catText, catFilter === c && styles.catTextActive]}>
              {c === 'all' ? 'الكل' : CAT_LABELS[c]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={48} color={BORDER} />
              <Text style={styles.emptyText}>لا توجد عناصر في هذه الفئة</Text>
            </View>
          ) : (
            filtered.map((item: any) => {
              const low = item.quantity <= item.minQuantity;
              return (
                <View key={item.id} style={[styles.card, low && styles.cardLow]}>
                  <View style={[styles.catIcon, { backgroundColor: low ? '#EF444422' : `${PRIMARY}22` }]}>
                    <Ionicons name={CAT_ICONS[item.category] || 'cube'} size={20} color={low ? '#EF4444' : PRIMARY} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCat}>{CAT_LABELS[item.category] || item.category}</Text>
                    <View style={styles.qtyRow}>
                      <View style={[styles.qtyBadge, { backgroundColor: low ? '#EF444420' : '#10B98120' }]}>
                        <Text style={[styles.qtyText, { color: low ? '#EF4444' : '#10B981' }]}>
                          {item.quantity} {item.unit}
                        </Text>
                      </View>
                      {low && <Text style={styles.lowText}>مخزون منخفض!</Text>}
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <Text style={styles.price}>${item.price}</Text>
                    <View style={styles.btnRow}>
                      <Pressable onPress={() => openEdit(item)} style={styles.editBtn}>
                        <Ionicons name="pencil" size={14} color={PRIMARY} />
                      </Pressable>
                      <Pressable
                        onPress={() => Alert.alert('حذف', `هل تريد حذف "${item.name}"؟`, [
                          { text: 'إلغاء', style: 'cancel' },
                          { text: 'حذف', style: 'destructive', onPress: () => deleteItem.mutate(item.id) },
                        ])}
                        style={styles.delBtn}
                      >
                        <Ionicons name="trash" size={14} color="#EF4444" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'تعديل عنصر' : 'إضافة عنصر جديد'}</Text>
              <Pressable onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={22} color="#888" />
              </Pressable>
            </View>

            {[
              { label: 'اسم العنصر', key: 'name', placeholder: 'مثال: شامبو للشعر' },
              { label: 'الكمية', key: 'quantity', placeholder: '0', type: 'number' },
              { label: 'الحد الأدنى للتنبيه', key: 'minQuantity', placeholder: '5', type: 'number' },
              { label: 'الوحدة', key: 'unit', placeholder: 'pcs / liter / kg' },
              { label: 'السعر ($)', key: 'price', placeholder: '0.00', type: 'decimal-pad' },
            ].map(f => (
              <View key={f.key} style={styles.formField}>
                <Text style={styles.formLabel}>{f.label}</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={f.placeholder}
                  placeholderTextColor="#444"
                  value={(form as any)[f.key]}
                  onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                  keyboardType={(f.type as any) || 'default'}
                />
              </View>
            ))}

            <View style={styles.formField}>
              <Text style={styles.formLabel}>الفئة</Text>
              <View style={styles.catPicker}>
                {CATEGORIES.map(c => (
                  <Pressable
                    key={c}
                    onPress={() => setForm(prev => ({ ...prev, category: c }))}
                    style={[styles.catOption, form.category === c && styles.catOptionActive]}
                  >
                    <Text style={[styles.catOptionText, form.category === c && styles.catOptionTextActive]}>
                      {CAT_LABELS[c]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable onPress={() => save.mutate()} style={styles.saveBtn} disabled={save.isPending}>
              <Text style={styles.saveBtnText}>{save.isPending ? 'جاري الحفظ...' : 'حفظ'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 8, marginBottom: 14 },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 24 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PRIMARY, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 14 },
  warning: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F59E0B22', borderRadius: 12, marginHorizontal: 20, padding: 10, marginBottom: 10 },
  warningText: { color: '#F59E0B', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  catRow: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD },
  catChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  catText: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  catTextActive: { color: '#181A20' },
  list: { paddingHorizontal: 20 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 15 },
  card: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardLow: { borderColor: '#EF444444' },
  catIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  itemName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15, marginBottom: 2 },
  itemCat: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 12, marginBottom: 6 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  qtyText: { fontFamily: 'Urbanist_600SemiBold', fontSize: 12 },
  lowText: { color: '#EF4444', fontFamily: 'Urbanist_600SemiBold', fontSize: 11 },
  actions: { alignItems: 'flex-end', gap: 6 },
  price: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 14 },
  btnRow: { flexDirection: 'row', gap: 6 },
  editBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: `${PRIMARY}22`, alignItems: 'center', justifyContent: 'center' },
  delBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EF444422', alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: BORDER },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18 },
  formField: { marginBottom: 14 },
  formLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13, marginBottom: 6 },
  formInput: { backgroundColor: '#13151B', borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, height: 46, color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 14 },
  catPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catOption: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: BORDER, backgroundColor: '#13151B' },
  catOptionActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  catOptionText: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 12 },
  catOptionTextActive: { color: '#181A20' },
  saveBtn: { backgroundColor: PRIMARY, borderRadius: 14, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
});
