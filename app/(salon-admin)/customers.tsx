import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Image, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

const fallback = (k: string, fb: string, t: any) => { const s = t(k); return s && s !== k ? s : fb; };

export default function SalonCustomers() {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
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
    onError: () => {
      if (Platform.OS === 'web') window.alert(fallback('failed_save_item', 'Failed to save', t));
      else Alert.alert(t('error'), t('failed_save_item'));
    },
  });

  const filtered = customers.filter((c: any) =>
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const topCustomers = [...filtered].sort((a: any, b: any) => (b.totalSpent || 0) - (a.totalSpent || 0));
  const totalRevenue = customers.reduce((s: number, c: any) => s + (c.totalSpent || 0), 0);
  const totalVisits = customers.reduce((s: number, c: any) => s + (c.bookingCount || 0), 0);

  if (selected) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => setSelected(null)} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <Text style={styles.detailTitle} numberOfLines={1}>{selected.fullName}</Text>
        </View>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
          {/* Hero Card */}
          <LinearGradient
            colors={['rgba(244,164,96,0.2)', 'rgba(244,164,96,0.04)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.customerCard}
          >
            <View style={styles.bigAvatarWrap}>
              <Image
                source={{ uri: selected.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop' }}
                style={styles.bigAvatar}
              />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              </View>
            </View>
            <View style={styles.customerCardInfo}>
              <Text style={styles.bigName} numberOfLines={1}>{selected.fullName}</Text>
              <Text style={styles.bigEmail} numberOfLines={1}>{selected.email}</Text>
              <View style={styles.loyaltyRow}>
                <MaterialCommunityIcons name="crown" size={14} color="#F59E0B" />
                <Text style={styles.loyaltyText}>{selected.loyaltyPoints ?? 0} {fallback('loyalty_points', 'points', t)}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Stats gradient cards */}
          <View style={styles.statsRow}>
            <LinearGradient
              colors={['rgba(108,99,255,0.2)', 'rgba(108,99,255,0.04)']}
              style={[styles.statBox, { borderColor: '#6C63FF30' }]}
            >
              <View style={[styles.statIconBox, { backgroundColor: '#6C63FF' }]}>
                <Ionicons name="calendar" size={14} color="#fff" />
              </View>
              <Text style={styles.statNum}>{selected.bookingCount ?? 0}</Text>
              <Text style={styles.statLbl}>{fallback('visit', 'Visits', t)}</Text>
            </LinearGradient>
            <LinearGradient
              colors={['rgba(16,185,129,0.2)', 'rgba(16,185,129,0.04)']}
              style={[styles.statBox, { borderColor: '#10B98130' }]}
            >
              <View style={[styles.statIconBox, { backgroundColor: '#10B981' }]}>
                <MaterialCommunityIcons name="cash" size={14} color="#fff" />
              </View>
              <Text style={styles.statNum}>${(selected.totalSpent ?? 0).toFixed(0)}</Text>
              <Text style={styles.statLbl}>{fallback('total_spent_label', 'Total Spent', t)}</Text>
            </LinearGradient>
            <LinearGradient
              colors={['rgba(244,164,96,0.2)', 'rgba(244,164,96,0.04)']}
              style={[styles.statBox, { borderColor: 'rgba(244,164,96,0.3)' }]}
            >
              <View style={[styles.statIconBox, { backgroundColor: PRIMARY }]}>
                <Ionicons name="time" size={14} color="#fff" />
              </View>
              <Text style={styles.statNum} numberOfLines={1}>{selected.lastVisit ? selected.lastVisit.slice(5, 10) : '—'}</Text>
              <Text style={styles.statLbl}>{fallback('last_visit_label', 'Last Visit', t)}</Text>
            </LinearGradient>
          </View>

          {/* Notes */}
          <View style={styles.sectionHead}>
            <MaterialCommunityIcons name="note-text-outline" size={18} color={PRIMARY} />
            <Text style={styles.sectionTitle}>{fallback('notes_label', 'Notes', t)}</Text>
            {notes.length > 0 && (
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{notes.length}</Text>
              </View>
            )}
          </View>

          <View style={styles.noteInput}>
            <TextInput
              style={styles.noteField}
              placeholder={fallback('add_customer_note', 'Add a note...', t)}
              placeholderTextColor="#555"
              value={note}
              onChangeText={setNote}
              multiline
            />
            <Pressable
              onPress={() => { if (note.trim()) addNote.mutate(); }}
              style={({ pressed }) => [styles.noteBtn, !note.trim() && { opacity: 0.4 }, pressed && { opacity: 0.7 }]}
              disabled={!note.trim() || addNote.isPending}
            >
              {addNote.isPending ? (
                <ActivityIndicator size="small" color="#181A20" />
              ) : (
                <Ionicons name="send" size={16} color="#181A20" />
              )}
            </Pressable>
          </View>

          {notes.map((n: any) => (
            <View key={n.id} style={styles.noteCard}>
              <View style={styles.noteIconWrap}>
                <Ionicons name="document-text" size={12} color={PRIMARY} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.noteText}>{n.note}</Text>
                <Text style={styles.noteDate}>{new Date(n.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
          ))}
          {notes.length === 0 && (
            <View style={styles.emptyNotes}>
              <MaterialCommunityIcons name="note-plus-outline" size={32} color={BORDER} />
              <Text style={styles.noNotes}>{fallback('no_notes', 'No notes yet', t)}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>{fallback('customers_title', 'Customers', t)}</Text>
          <Text style={styles.pageSubtitle}>{customers.length} {fallback('total_customers', 'total', t)}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="people" size={22} color={PRIMARY} />
        </View>
      </View>

      {/* Summary cards */}
      {customers.length > 0 && (
        <View style={styles.summaryRow}>
          <View style={[styles.sumCard, { borderColor: PRIMARY + '35' }]}>
            <View style={[styles.sumIconWrap, { backgroundColor: PRIMARY + '22' }]}>
              <Ionicons name="people" size={16} color={PRIMARY} />
            </View>
            <View>
              <Text style={styles.sumValue}>{customers.length}</Text>
              <Text style={styles.sumLabel}>{fallback('clients', 'Clients', t)}</Text>
            </View>
          </View>
          <View style={[styles.sumCard, { borderColor: '#10B98135' }]}>
            <View style={[styles.sumIconWrap, { backgroundColor: '#10B98122' }]}>
              <MaterialCommunityIcons name="cash" size={16} color="#10B981" />
            </View>
            <View>
              <Text style={styles.sumValue}>${totalRevenue.toFixed(0)}</Text>
              <Text style={styles.sumLabel}>{fallback('revenue', 'Revenue', t)}</Text>
            </View>
          </View>
          <View style={[styles.sumCard, { borderColor: '#3B82F635' }]}>
            <View style={[styles.sumIconWrap, { backgroundColor: '#3B82F622' }]}>
              <Ionicons name="calendar" size={16} color="#3B82F6" />
            </View>
            <View>
              <Text style={styles.sumValue}>{totalVisits}</Text>
              <Text style={styles.sumLabel}>{fallback('visit', 'Visits', t)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchIconWrap}>
          <Ionicons name="search" size={16} color={PRIMARY} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder={fallback('search_customers', 'Search customers...', t)}
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} style={styles.searchClearBtn}>
            <Ionicons name="close" size={14} color="#aaa" />
          </Pressable>
        )}
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
              <View style={styles.emptyIconWrap}>
                <Ionicons name="people-outline" size={40} color={PRIMARY} />
              </View>
              <Text style={styles.emptyTitle}>{fallback('no_customers', 'No customers yet', t)}</Text>
              <Text style={styles.emptySubtext}>{fallback('customers_will_appear', 'Customers will appear here after bookings.', t)}</Text>
            </View>
          ) : (
            filtered.map((c: any, idx: number) => {
              const isTop = idx < 3 && c.totalSpent > 0;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setSelected(c)}
                  style={({ pressed }) => [
                    styles.card,
                    isTop && { borderColor: '#F59E0B40' },
                    pressed && { opacity: 0.95 },
                  ]}
                >
                  <View style={styles.avatarWrap}>
                    <Image
                      source={{ uri: c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop' }}
                      style={styles.avatar}
                    />
                    {isTop && (
                      <View style={styles.topBadge}>
                        <MaterialCommunityIcons name="crown" size={10} color="#fff" />
                      </View>
                    )}
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.name} numberOfLines={1}>{c.fullName}</Text>
                    <Text style={styles.email} numberOfLines={1}>{c.email}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={11} color="#3B82F6" />
                        <Text style={styles.metaText}>{c.bookingCount ?? 0}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons name="cash" size={11} color="#10B981" />
                        <Text style={[styles.metaText, { color: '#10B981', fontFamily: 'Urbanist_700Bold' }]}>
                          ${(c.totalSpent ?? 0).toFixed(0)}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons name="crown-outline" size={11} color="#F59E0B" />
                        <Text style={[styles.metaText, { color: '#F59E0B' }]}>{c.loyaltyPoints ?? 0}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={PRIMARY} />
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // List header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 8, marginBottom: 14 },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 24 },
  pageSubtitle: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 12, marginTop: 2 },
  headerBadge: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(244,164,96,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(244,164,96,0.3)' },

  summaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 14 },
  sumCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: CARD, borderRadius: 14, borderWidth: 1, padding: 12 },
  sumIconWrap: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sumValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  sumLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 10 },

  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, marginHorizontal: 20, paddingHorizontal: 16, height: 52, gap: 12, marginBottom: 14 },
  searchIconWrap: { width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(244,164,96,0.12)', alignItems: 'center', justifyContent: 'center' },
  searchInput: { flex: 1, height: '100%', color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 14, paddingVertical: 0 },
  searchClearBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#13151B', alignItems: 'center', justifyContent: 'center' },

  list: { paddingHorizontal: 20 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12, backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, borderStyle: 'dashed', paddingHorizontal: 24 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(244,164,96,0.15)', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  emptySubtext: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13, textAlign: 'center' },

  card: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: BORDER },
  topBadge: { position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: CARD },
  cardInfo: { flex: 1 },
  name: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  email: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 12, marginTop: 2, marginBottom: 6 },
  metaRow: { flexDirection: 'row', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { color: '#aaa', fontFamily: 'Urbanist_600SemiBold', fontSize: 11 },

  // Detail view
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, marginBottom: 16, marginTop: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER },
  detailTitle: { flex: 1, color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20 },
  content: { paddingHorizontal: 20 },

  customerCard: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(244,164,96,0.2)', marginBottom: 16 },
  bigAvatarWrap: { position: 'relative' },
  bigAvatar: { width: 76, height: 76, borderRadius: 20, backgroundColor: BORDER, borderWidth: 2, borderColor: PRIMARY },
  verifiedBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: CARD, borderRadius: 12, padding: 2 },
  customerCardInfo: { flex: 1 },
  bigName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18, marginBottom: 3 },
  bigEmail: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 12, marginBottom: 10 },
  loyaltyRow: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  loyaltyText: { color: '#F59E0B', fontFamily: 'Urbanist_700Bold', fontSize: 11 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: CARD, borderRadius: 14, borderWidth: 1, padding: 12, gap: 8 },
  statIconBox: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statNum: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  statLbl: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 10 },

  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  countPill: { backgroundColor: 'rgba(244,164,96,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, minWidth: 22, alignItems: 'center' },
  countPillText: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 11 },

  noteInput: { flexDirection: 'row', backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 10, gap: 10, marginBottom: 12, alignItems: 'flex-end' },
  noteField: { flex: 1, color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 13, minHeight: 40, maxHeight: 100, paddingHorizontal: 6 },
  noteBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },

  noteCard: { backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 12, marginBottom: 8, flexDirection: 'row', gap: 10 },
  noteIconWrap: { width: 26, height: 26, borderRadius: 8, backgroundColor: 'rgba(244,164,96,0.15)', alignItems: 'center', justifyContent: 'center' },
  noteText: { color: '#ccc', fontFamily: 'Urbanist_500Medium', fontSize: 13, marginBottom: 4 },
  noteDate: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 10 },

  emptyNotes: { alignItems: 'center', paddingVertical: 30, gap: 8, backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, borderStyle: 'dashed' },
  noNotes: { color: '#666', fontFamily: 'Urbanist_500Medium', fontSize: 13 },
});
