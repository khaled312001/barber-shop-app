import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

export default function SalonCustomers() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState('');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['salon-customers'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/customers');
      return res.json();
    },
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['customer-notes', selected?.id],
    enabled: !!selected?.id,
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/salon/customers/${selected.id}/notes`);
      return res.json();
    },
  });

  const addNote = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/salon/customers/${selected.id}/notes`, { note });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-notes', selected?.id] });
      setNote('');
    },
    onError: () => Alert.alert('خطأ', 'فشل إضافة الملاحظة'),
  });

  const filtered = customers.filter((c: any) =>
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => setSelected(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.pageTitle}>{selected.fullName}</Text>
        </View>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
          {/* Customer Card */}
          <View style={styles.customerCard}>
            <Image
              source={{ uri: selected.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop' }}
              style={styles.bigAvatar}
            />
            <View style={styles.customerCardInfo}>
              <Text style={styles.bigName}>{selected.fullName}</Text>
              <Text style={styles.bigEmail}>{selected.email}</Text>
              <View style={styles.loyaltyRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.loyaltyText}>{selected.loyaltyPoints ?? 0} نقطة ولاء</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{selected.bookingCount ?? 0}</Text>
              <Text style={styles.statLbl}>زيارة</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>${(selected.totalSpent ?? 0).toFixed(0)}</Text>
              <Text style={styles.statLbl}>إجمالي الإنفاق</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{selected.lastVisit ? selected.lastVisit.slice(0, 10) : '—'}</Text>
              <Text style={styles.statLbl}>آخر زيارة</Text>
            </View>
          </View>

          {/* Notes */}
          <Text style={styles.sectionTitle}>الملاحظات</Text>
          <View style={styles.noteInput}>
            <TextInput
              style={styles.noteField}
              placeholder="إضافة ملاحظة عن العميل..."
              placeholderTextColor="#555"
              value={note}
              onChangeText={setNote}
              multiline
            />
            <Pressable
              onPress={() => { if (note.trim()) addNote.mutate(); }}
              style={styles.noteBtn}
              disabled={addNote.isPending}
            >
              <Ionicons name="send" size={18} color="#181A20" />
            </Pressable>
          </View>

          {notes.map((n: any) => (
            <View key={n.id} style={styles.noteCard}>
              <Ionicons name="document-text-outline" size={14} color="#888" />
              <View style={{ flex: 1 }}>
                <Text style={styles.noteText}>{n.note}</Text>
                <Text style={styles.noteDate}>{new Date(n.createdAt).toLocaleDateString('ar')}</Text>
              </View>
            </View>
          ))}
          {notes.length === 0 && (
            <Text style={styles.noNotes}>لا توجد ملاحظات بعد</Text>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.pageTitle}>العملاء</Text>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="بحث بالاسم أو البريد..."
          placeholderTextColor="#444"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={BORDER} />
              <Text style={styles.emptyText}>لا يوجد عملاء</Text>
            </View>
          ) : (
            filtered.map((c: any) => (
              <Pressable key={c.id} onPress={() => setSelected(c)} style={styles.card}>
                <Image
                  source={{ uri: c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop' }}
                  style={styles.avatar}
                />
                <View style={styles.cardInfo}>
                  <Text style={styles.name}>{c.fullName}</Text>
                  <Text style={styles.email}>{c.email}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={12} color="#666" />
                      <Text style={styles.metaText}>{c.bookingCount ?? 0} زيارة</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.metaText}>{c.loyaltyPoints ?? 0} نقطة</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#444" />
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, marginBottom: 16, marginTop: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 22, paddingHorizontal: 20, marginTop: 8, marginBottom: 14 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, marginHorizontal: 20, marginBottom: 14, gap: 10 },
  searchInput: { flex: 1, height: 44, color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 14 },
  list: { paddingHorizontal: 20 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 15 },
  card: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: BORDER },
  cardInfo: { flex: 1 },
  name: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15, marginBottom: 2 },
  email: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 12, marginBottom: 4 },
  metaRow: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 11 },
  content: { paddingHorizontal: 20 },
  customerCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  bigAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: BORDER },
  customerCardInfo: { flex: 1 },
  bigName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18, marginBottom: 2 },
  bigEmail: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginBottom: 8 },
  loyaltyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  loyaltyText: { color: '#F59E0B', fontFamily: 'Urbanist_600SemiBold', fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 12, alignItems: 'center' },
  statNum: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16, marginBottom: 4 },
  statLbl: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 10, textAlign: 'center' },
  sectionTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16, marginBottom: 12 },
  noteInput: { flexDirection: 'row', backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 12, gap: 10, marginBottom: 12, alignItems: 'flex-end' },
  noteField: { flex: 1, color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 14, minHeight: 44, maxHeight: 100 },
  noteBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },
  noteCard: { backgroundColor: CARD, borderRadius: 10, borderWidth: 1, borderColor: BORDER, padding: 12, marginBottom: 8, flexDirection: 'row', gap: 10 },
  noteText: { color: '#ccc', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginBottom: 4 },
  noteDate: { color: '#555', fontFamily: 'Urbanist_400Regular', fontSize: 11 },
  noNotes: { color: '#555', fontFamily: 'Urbanist_400Regular', fontSize: 13, textAlign: 'center', marginTop: 8 },
});
