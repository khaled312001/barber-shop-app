import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

// Icon per service type (matches POS)
function getServiceIcon(name: string, category?: string): { icon: string; color: string } {
  const n = ((name || '') + ' ' + (category || '')).toLowerCase();
  if (n.includes('haircut') || n.includes('cut') || n.includes('trim')) return { icon: 'content-cut', color: '#F4A460' };
  if (n.includes('shave') || n.includes('beard')) return { icon: 'razor-double-edge', color: '#8B5CF6' };
  if (n.includes('color') || n.includes('dye') || n.includes('balayage') || n.includes('highlight')) return { icon: 'palette', color: '#EC4899' };
  if (n.includes('massage') || n.includes('relax')) return { icon: 'spa', color: '#10B981' };
  if (n.includes('spa')) return { icon: 'flower', color: '#06B6D4' };
  if (n.includes('facial') || n.includes('face') || n.includes('skin')) return { icon: 'face-woman-shimmer', color: '#F59E0B' };
  if (n.includes('nail') || n.includes('manicure') || n.includes('pedicure')) return { icon: 'hand-heart', color: '#F43F5E' };
  if (n.includes('blow') || n.includes('dry')) return { icon: 'hair-dryer', color: '#3B82F6' };
  if (n.includes('style') || n.includes('styling')) return { icon: 'auto-fix', color: '#6366F1' };
  if (n.includes('wash') || n.includes('shampoo') || n.includes('condition') || n.includes('treatment') || n.includes('therapy') || n.includes('deep')) return { icon: 'water', color: '#0EA5E9' };
  if (n.includes('braid') || n.includes('extension')) return { icon: 'hair-dryer-outline', color: '#A855F7' };
  if (n.includes('wax') || n.includes('thread')) return { icon: 'fire', color: '#EF4444' };
  if (n.includes('makeup') || n.includes('make up')) return { icon: 'brush', color: '#EC4899' };
  if (n.includes('eye') || n.includes('brow') || n.includes('lash')) return { icon: 'eye', color: '#7C3AED' };
  return { icon: 'scissors-cutting', color: '#F4A460' };
}

function confirmAction(title: string, msg: string, okLabel: string, cancelLabel: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${msg}`)) onOk();
  } else {
    Alert.alert(title, msg, [
      { text: cancelLabel, style: 'cancel' },
      { text: okLabel, style: 'destructive', onPress: onOk },
    ]);
  }
}

const CATEGORIES = ['general', 'haircut', 'color', 'styling', 'treatment', 'facial', 'massage', 'nails', 'makeup', 'beard'];

export default function SalonServices() {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', duration: '', description: '', category: 'general' });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['salon-services'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/services');
      return res.json();
    },
  });

  const addService = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest('POST', '/api/salon/services', {
        name: data.name,
        price: parseFloat(data.price) || 0,
        duration: parseInt(data.duration) || 30,
        description: data.description,
        category: data.category,
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-services'] });
      setShowForm(false);
      setForm({ name: '', price: '', duration: '', description: '', category: 'general' });
    },
    onError: () => {
      if (Platform.OS === 'web') window.alert(t('failed_add_service'));
      else Alert.alert(t('error'), t('failed_add_service'));
    },
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/salon/services/${id}`);
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salon-services'] }),
  });

  const totalRevenue = services.reduce((sum: number, s: any) => sum + (parseFloat(s.price) || 0), 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.pageTitle}>{t('services_title')}</Text>
          <Text style={styles.pageSubtitle}>{services.length} {t('services_count_suffix') || 'services'}</Text>
        </View>
        <Pressable
          onPress={() => setShowForm(!showForm)}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name={showForm ? 'close' : 'add'} size={18} color="#181A20" />
          <Text style={styles.addBtnText}>{showForm ? t('cancel') : t('add')}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary cards */}
        {!showForm && services.length > 0 && (
          <View style={styles.summaryRow}>
            <View style={[styles.sumCard, { borderColor: PRIMARY + '35' }]}>
              <View style={[styles.sumIconWrap, { backgroundColor: PRIMARY + '22' }]}>
                <MaterialCommunityIcons name="scissors-cutting" size={18} color={PRIMARY} />
              </View>
              <View>
                <Text style={styles.sumValue}>{services.length}</Text>
                <Text style={styles.sumLabel}>{t('total_services') || 'Services'}</Text>
              </View>
            </View>
            <View style={[styles.sumCard, { borderColor: '#10B98135' }]}>
              <View style={[styles.sumIconWrap, { backgroundColor: '#10B98122' }]}>
                <MaterialCommunityIcons name="currency-usd" size={18} color="#10B981" />
              </View>
              <View>
                <Text style={styles.sumValue}>${totalRevenue.toFixed(0)}</Text>
                <Text style={styles.sumLabel}>{t('total_value') || 'Catalog'}</Text>
              </View>
            </View>
            <View style={[styles.sumCard, { borderColor: '#3B82F635' }]}>
              <View style={[styles.sumIconWrap, { backgroundColor: '#3B82F622' }]}>
                <Ionicons name="pricetag" size={18} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.sumValue}>
                  ${services.length > 0 ? (totalRevenue / services.length).toFixed(0) : '0'}
                </Text>
                <Text style={styles.sumLabel}>{t('avg_price') || 'Avg'}</Text>
              </View>
            </View>
          </View>
        )}

        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>{t('add_new_service_form')}</Text>
            {[
              { key: 'name', placeholder: t('service_name_label'), icon: 'cut-outline' },
              { key: 'price', placeholder: t('price_usd'), icon: 'cash-outline', numeric: true },
              { key: 'duration', placeholder: t('duration_minutes'), icon: 'time-outline', numeric: true },
              { key: 'description', placeholder: t('description'), icon: 'document-text-outline' },
            ].map(f => (
              <View key={f.key} style={styles.inputRow}>
                <Ionicons name={f.icon as any} size={18} color="#888" />
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  placeholderTextColor="#555"
                  value={(form as any)[f.key]}
                  onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                  keyboardType={f.numeric ? 'numeric' : 'default'}
                />
              </View>
            ))}

            {/* Category picker */}
            <Text style={styles.catPickerLabel}>{t('category') || 'Category'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catPickerRow}>
              {CATEGORIES.map(cat => {
                const active = form.category === cat;
                const info = getServiceIcon(cat, cat);
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setForm(p => ({ ...p, category: cat }))}
                    style={[styles.catPickerChip, active && { backgroundColor: info.color, borderColor: info.color }]}
                  >
                    <MaterialCommunityIcons name={info.icon as any} size={14} color={active ? '#fff' : info.color} />
                    <Text style={[styles.catPickerText, active && { color: '#fff' }]}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              onPress={() => addService.mutate(form)}
              style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85 }]}
              disabled={addService.isPending}
            >
              {addService.isPending ? (
                <ActivityIndicator size="small" color="#181A20" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={18} color="#181A20" />
                  <Text style={styles.submitBtnText}>{t('add_service_btn')}</Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
        ) : services.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <MaterialCommunityIcons name="scissors-cutting" size={40} color={PRIMARY} />
            </View>
            <Text style={styles.emptyTitle}>{t('no_services_salon')}</Text>
            <Text style={styles.emptySub}>{t('add_first_service') || 'Add your first service to get started.'}</Text>
          </View>
        ) : (
          services.map((s: any) => {
            const info = getServiceIcon(s.name, s.category);
            return (
              <View key={s.id} style={[styles.card, { borderColor: info.color + '30' }]}>
                <View style={[styles.iconBox, { backgroundColor: info.color + '22', borderColor: info.color + '40' }]}>
                  <MaterialCommunityIcons name={info.icon as any} size={22} color={info.color} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.serviceName} numberOfLines={1}>{s.name}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaChip}>
                      <Ionicons name="time-outline" size={11} color="#888" />
                      <Text style={styles.metaText}>{s.duration || 30} min</Text>
                    </View>
                    <View style={[styles.metaChip, { backgroundColor: '#10B98118', borderColor: '#10B98130' }]}>
                      <MaterialCommunityIcons name="currency-usd" size={11} color="#10B981" />
                      <Text style={[styles.metaText, { color: '#10B981', fontFamily: 'Urbanist_700Bold' }]}>{s.price}</Text>
                    </View>
                    {s.category && s.category !== 'general' && (
                      <View style={[styles.metaChip, { backgroundColor: info.color + '18', borderColor: info.color + '30' }]}>
                        <Text style={[styles.metaText, { color: info.color, fontFamily: 'Urbanist_700Bold' }]}>{s.category}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Pressable
                  onPress={() => confirmAction(
                    t('delete'),
                    t('delete_service_confirm_salon'),
                    t('delete'),
                    t('cancel'),
                    () => deleteService.mutate(s.id),
                  )}
                  style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.6 }]}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 8, marginBottom: 16 },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 24 },
  pageSubtitle: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PRIMARY, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  addBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 14 },

  content: { paddingHorizontal: 20 },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  sumCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: CARD, borderRadius: 14, borderWidth: 1, padding: 12 },
  sumIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sumValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  sumLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 10 },

  form: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 20, marginBottom: 20 },
  formTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16, marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#13151B', borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, marginBottom: 12, gap: 10 },
  input: { flex: 1, height: 48, color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 14 },

  catPickerLabel: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 12, marginBottom: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  catPickerRow: { gap: 8, paddingBottom: 16 },
  catPickerChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: BORDER, backgroundColor: '#13151B' },
  catPickerText: { color: '#ccc', fontFamily: 'Urbanist_600SemiBold', fontSize: 12 },

  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: PRIMARY, borderRadius: 12, height: 50, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 15 },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 12, backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, borderStyle: 'dashed' },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(244,164,96,0.15)', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  emptySub: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13, textAlign: 'center', paddingHorizontal: 30 },

  card: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  info: { flex: 1 },
  serviceName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15, marginBottom: 6 },
  metaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: BORDER },
  metaText: { color: '#aaa', fontFamily: 'Urbanist_600SemiBold', fontSize: 11 },
  deleteBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
});
