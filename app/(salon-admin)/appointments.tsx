import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, TextInput, Platform, Modal, Linking } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import BookingsCalendar from '@/components/BookingsCalendar';

function confirmAction(title: string, msg: string, okLabel: string, cancelLabel: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${msg}`)) onOk();
  } else {
    Alert.alert(title, msg, [
      { text: cancelLabel, style: 'cancel' },
      { text: okLabel, onPress: onOk },
    ]);
  }
}

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

const FILTERS = [
  { key: 'all', icon: 'grid-outline' as const, color: PRIMARY },
  { key: 'pending', icon: 'time-outline' as const, color: '#F59E0B' },
  { key: 'confirmed', icon: 'checkmark-circle-outline' as const, color: '#3B82F6' },
  { key: 'completed', icon: 'checkmark-done-outline' as const, color: '#10B981' },
  { key: 'cancelled', icon: 'close-circle-outline' as const, color: '#EF4444' },
];

const statusConfig: Record<string, { color: string; bg: string; icon: string }> = {
  pending: { color: '#F59E0B', bg: '#F59E0B15', icon: 'time-outline' },
  confirmed: { color: '#3B82F6', bg: '#3B82F615', icon: 'checkmark-circle-outline' },
  completed: { color: '#10B981', bg: '#10B98115', icon: 'checkmark-done-outline' },
  cancelled: { color: '#EF4444', bg: '#EF444415', icon: 'close-circle-outline' },
};

export default function SalonAppointments() {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [detailBooking, setDetailBooking] = useState<any>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ clientName: '', clientPhone: '', serviceName: '', date: '', time: '', totalPrice: '', notes: '' });
  const [editBooking, setEditBooking] = useState<any>(null);
  const [editForm, setEditForm] = useState<{ clientName: string; clientPhone: string; selectedServices: string[]; date: string; time: string; totalPrice: string; notes: string }>({ clientName: '', clientPhone: '', selectedServices: [], date: '', time: '', totalPrice: '', notes: '' });

  const fallback = (k: string, fb: string) => { const s = t(k as any); return s && s !== k ? s : fb; };

  // Normalize service display — combines serviceName + services[] array
  const getServiceDisplay = (b: any): string => {
    if (!b) return '—';
    if (b.serviceName) return b.serviceName;
    if (Array.isArray(b.services) && b.services.length > 0) {
      return b.services.filter((s: any) => s && typeof s === 'string').join(' · ') || '—';
    }
    return '—';
  };

  const openEdit = (b: any) => {
    setDetailBooking(null);
    // Extract services as array
    let svcs: string[] = [];
    if (b.serviceName) svcs = [b.serviceName];
    if (Array.isArray(b.services) && b.services.length > 0) {
      svcs = b.services.filter((s: any) => s && typeof s === 'string');
    }
    setEditForm({
      clientName: b.clientName || '',
      clientPhone: b.clientPhone || '',
      selectedServices: svcs,
      date: b.date || '',
      time: b.time || '',
      totalPrice: String(b.totalPrice ?? ''),
      notes: b.notes || '',
    });
    setEditBooking(b);
  };

  const toggleEditService = (serviceName: string, servicePrice?: number) => {
    setEditForm(p => {
      const isSelected = p.selectedServices.includes(serviceName);
      const newSelected = isSelected
        ? p.selectedServices.filter(s => s !== serviceName)
        : [...p.selectedServices, serviceName];
      // Auto-recalculate total price from selected services
      const total = newSelected.reduce((sum, sname) => {
        const svc = salonServices.find((s: any) => s.name === sname);
        return sum + (svc?.price ?? 0);
      }, 0);
      return { ...p, selectedServices: newSelected, totalPrice: String(total || p.totalPrice) };
    });
  };

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['salon-bookings'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/bookings');
      return res.json();
    },
  });

  // Load salon services for picker in forms
  const { data: salonServices = [] } = useQuery({
    queryKey: ['salon-services-for-booking'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/services');
      return res.json();
    },
  });

  // Load customers for client picker
  const { data: salonCustomers = [] } = useQuery({
    queryKey: ['salon-customers-for-booking'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/customers');
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest('PUT', `/api/salon/bookings/${id}`, { status });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salon-bookings'] }),
    onError: () => {
      if (Platform.OS === 'web') window.alert(t('failed_update_booking'));
      else Alert.alert(t('error'), t('failed_update_booking'));
    },
  });

  const reschedule = useMutation({
    mutationFn: async ({ id, date, time }: { id: string; date: string; time: string }) => {
      const res = await apiRequest('PUT', `/api/salon/bookings/${id}`, { date, time });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-bookings'] });
      setRescheduleBooking(null);
      setNewDate('');
      setNewTime('');
    },
    onError: () => {
      if (Platform.OS === 'web') window.alert(t('failed_update_booking'));
    },
  });

  const editBookingMutation = useMutation({
    mutationFn: async (data: typeof editForm & { id: string }) => {
      const res = await apiRequest('PUT', `/api/salon/bookings/${data.id}`, {
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        serviceName: data.selectedServices.join(', '),
        services: data.selectedServices,
        date: data.date,
        time: data.time,
        totalPrice: parseFloat(data.totalPrice) || 0,
        notes: data.notes,
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-bookings'] });
      setEditBooking(null);
    },
    onError: () => {
      if (Platform.OS === 'web') window.alert(fallback('failed_update_booking', 'Failed to update booking'));
    },
  });

  const createBooking = useMutation({
    mutationFn: async (data: typeof addForm) => {
      const res = await apiRequest('POST', '/api/salon/bookings', {
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        serviceName: data.serviceName,
        date: data.date,
        time: data.time,
        totalPrice: parseFloat(data.totalPrice) || 0,
        notes: data.notes,
        status: 'confirmed',
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-bookings'] });
      setShowAdd(false);
      setAddForm({ clientName: '', clientPhone: '', serviceName: '', date: '', time: '', totalPrice: '', notes: '' });
    },
    onError: (err: any) => {
      const msg = err?.message || t('failed_create_booking') || 'Failed to create booking';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert(t('error'), msg);
    },
  });

  const deleteBooking = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/salon/bookings/${id}`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-bookings'] });
      setDetailBooking(null);
    },
    onError: () => {
      if (Platform.OS === 'web') window.alert(t('failed_delete_booking') || 'Failed to delete booking');
    },
  });

  const openReschedule = (b: any) => {
    setNewDate(b.date || '');
    setNewTime(b.time || '');
    setRescheduleBooking(b);
  };

  const callClient = (phone?: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    bookings.forEach((b: any) => { if (c[b.status] !== undefined) c[b.status]++; });
    return c;
  }, [bookings]);

  const filtered = useMemo(() => {
    let list = filter === 'all' ? bookings : bookings.filter((b: any) => b.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b: any) =>
        (b.clientName || '').toLowerCase().includes(q) ||
        (b.serviceName || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, filter, search]);

  const getFilterLabel = (key: string) => {
    switch (key) {
      case 'all': return t('all');
      case 'pending': return t('status_pending');
      case 'confirmed': return t('status_confirmed');
      case 'completed': return t('status_completed');
      case 'cancelled': return t('status_cancelled');
      default: return key;
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = bookings.filter((b: any) => b.date?.startsWith(todayStr)).length;
  const totalRevenue = bookings.filter((b: any) => b.status === 'completed').reduce((s: number, b: any) => s + (b.totalPrice || 0), 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>{t('bookings_label')}</Text>
          <Text style={styles.subtitle}>
            {(() => {
              const s = t('manage_your_appointments');
              return s && s !== 'manage_your_appointments' ? s : 'Manage your appointments';
            })()}
          </Text>
        </View>
        <Pressable
          onPress={() => setShowAdd(true)}
          style={({ pressed }) => [styles.addBookingBtn, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="add" size={22} color="#181A20" />
        </Pressable>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: PRIMARY }]}>
          <Ionicons name="calendar" size={18} color={PRIMARY} />
          <Text style={styles.statValue}>{todayCount}</Text>
          <Text style={styles.statLabel}>{t('today') || 'Today'}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
          <Ionicons name="time-outline" size={18} color="#F59E0B" />
          <Text style={styles.statValue}>{counts.pending}</Text>
          <Text style={styles.statLabel}>{t('status_pending')}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
          <Ionicons name="cash-outline" size={18} color="#10B981" />
          <Text style={styles.statValue}>CHF {totalRevenue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>{t('revenue') || 'Revenue'}</Text>
        </View>
      </View>

      {/* Search + calendar toggle */}
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 10 }}>
        <View style={[styles.searchContainer, { flex: 1, marginHorizontal: 0, marginBottom: 0 }]}>
          <View style={styles.searchIconWrap}>
            <Ionicons name="search" size={16} color={PRIMARY} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_bookings') || 'Search by client or service...'}
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
        <Pressable
          onPress={() => setShowCalendar(v => !v)}
          style={({ pressed }) => [
            { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, backgroundColor: showCalendar ? PRIMARY + '22' : CARD, borderColor: showCalendar ? PRIMARY : BORDER, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name={showCalendar ? 'list' : 'calendar'} size={20} color={PRIMARY} />
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterScrollWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => {
            const isActive = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={({ pressed }) => [
                  styles.filterBtn,
                  isActive && { backgroundColor: f.color, borderColor: f.color },
                  !isActive && { borderColor: f.color + '40' },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Ionicons name={f.icon as any} size={14} color={isActive ? '#fff' : f.color} />
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {getFilterLabel(f.key)}
                </Text>
                {counts[f.key] > 0 && (
                  <View style={[styles.countBadge, isActive && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                    <Text style={[styles.countText, isActive && { color: '#fff' }]}>{counts[f.key]}</Text>
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
      ) : showCalendar ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
          <BookingsCalendar
            bookings={bookings.map((b: any) => ({
              id: b.id,
              date: b.date,
              time: b.time,
              status: b.status,
              customerName: b.clientName || b.userName,
              serviceName: Array.isArray(b.services) ? b.services.join(', ') : (b.serviceName || ''),
              totalPrice: b.totalPrice,
            }))}
            theme={{ card: CARD, border: BORDER, text: '#fff', textSecondary: '#888', background: BG, primary: PRIMARY }}
          />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={40} color={BORDER} />
              </View>
              <Text style={styles.emptyTitle}>{t('no_bookings_staff')}</Text>
              <Text style={styles.emptySubtitle}>
                {search ? (t('try_different_search') || 'Try a different search term') : (t('no_appointments_yet') || 'No appointments to display')}
              </Text>
            </View>
          ) : (
            filtered.map((b: any, index: number) => {
              const sc = statusConfig[b.status] || statusConfig.pending;
              return (
                <Pressable key={b.id} style={({ pressed }) => [styles.card, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}>
                  {/* Status indicator line */}
                  <View style={[styles.statusLine, { backgroundColor: sc.color }]} />

                  <View style={styles.cardContent}>
                    <View style={styles.cardTop}>
                      <View style={styles.clientSection}>
                        <View style={[styles.avatar, { backgroundColor: sc.bg }]}>
                          <Text style={[styles.avatarText, { color: sc.color }]}>
                            {(b.clientName || 'C')[0].toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.clientName}>{b.clientName || t('client_label')}</Text>
                          <Text style={styles.serviceName} numberOfLines={1}>{getServiceDisplay(b) !== '—' ? getServiceDisplay(b) : t('service_label')}</Text>
                        </View>
                      </View>
                      <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                        <Ionicons name={sc.icon as any} size={11} color={sc.color} />
                        <Text style={[styles.badgeText, { color: sc.color }]}>{b.status}</Text>
                      </View>
                    </View>

                    {/* Meta info */}
                    <View style={styles.cardMeta}>
                      <View style={styles.metaItem}>
                        <View style={styles.metaIcon}>
                          <Ionicons name="calendar-outline" size={13} color={PRIMARY} />
                        </View>
                        <Text style={styles.metaText}>{b.date || '—'}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <View style={styles.metaIcon}>
                          <Ionicons name="time-outline" size={13} color="#3B82F6" />
                        </View>
                        <Text style={styles.metaText}>{b.time || '—'}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <View style={styles.metaIcon}>
                          <Ionicons name="cash-outline" size={13} color="#10B981" />
                        </View>
                        <Text style={[styles.metaText, styles.priceText]}>CHF {b.totalPrice || 0}</Text>
                      </View>
                    </View>

                    {/* Quick action icons row */}
                    <View style={styles.quickActions}>
                      <Pressable
                        onPress={() => setDetailBooking(b)}
                        style={({ pressed }) => [styles.quickIconBtn, pressed && { opacity: 0.7 }]}
                      >
                        <Ionicons name="eye-outline" size={16} color={PRIMARY} />
                        <Text style={styles.quickIconText}>{t('view_details') || 'Details'}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => openEdit(b)}
                        style={({ pressed }) => [styles.quickIconBtn, pressed && { opacity: 0.7 }]}
                      >
                        <Ionicons name="create-outline" size={16} color="#3B82F6" />
                        <Text style={[styles.quickIconText, { color: '#3B82F6' }]}>{t('edit') || 'Edit'}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => confirmAction(
                          t('delete_booking') || 'Delete Booking',
                          t('delete_booking_confirm') || 'Are you sure you want to delete this booking?',
                          t('delete') || 'Delete',
                          t('cancel') || 'Cancel',
                          () => deleteBooking.mutate(b.id)
                        )}
                        style={({ pressed }) => [styles.quickIconBtn, pressed && { opacity: 0.7 }]}
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        <Text style={[styles.quickIconText, { color: '#EF4444' }]}>{t('delete') || 'Delete'}</Text>
                      </Pressable>
                      {b.status !== 'cancelled' && b.status !== 'completed' && (
                        <Pressable
                          onPress={() => openReschedule(b)}
                          style={({ pressed }) => [styles.quickIconBtn, pressed && { opacity: 0.7 }]}
                        >
                          <MaterialCommunityIcons name="calendar-edit" size={16} color="#6366F1" />
                          <Text style={[styles.quickIconText, { color: '#6366F1' }]}>{t('reschedule') || 'Reschedule'}</Text>
                        </Pressable>
                      )}
                      {b.clientPhone && (
                        <Pressable
                          onPress={() => callClient(b.clientPhone)}
                          style={({ pressed }) => [styles.quickIconBtn, pressed && { opacity: 0.7 }]}
                        >
                          <Ionicons name="call-outline" size={16} color="#10B981" />
                          <Text style={[styles.quickIconText, { color: '#10B981' }]}>{t('call') || 'Call'}</Text>
                        </Pressable>
                      )}
                    </View>

                    {/* Primary Actions */}
                    {b.status === 'pending' && (
                      <View style={styles.actions}>
                        <Pressable
                          style={({ pressed }) => [styles.actionBtn, styles.confirmBtn, pressed && { opacity: 0.85 }]}
                          onPress={() => updateStatus.mutate({ id: b.id, status: 'confirmed' })}
                        >
                          <Ionicons name="checkmark-circle" size={16} color="#fff" />
                          <Text style={styles.actionTextLight}>{t('accept') || 'Accept'}</Text>
                        </Pressable>
                        <Pressable
                          style={({ pressed }) => [styles.actionBtn, styles.rejectBtn, pressed && { opacity: 0.85 }]}
                          onPress={() => confirmAction(
                            t('reject_booking') || 'Reject Booking',
                            t('reject_confirm') || 'Are you sure you want to reject this booking?',
                            t('reject') || 'Reject',
                            t('cancel') || 'Cancel',
                            () => updateStatus.mutate({ id: b.id, status: 'cancelled' }),
                          )}
                        >
                          <Ionicons name="close-circle" size={16} color="#EF4444" />
                          <Text style={[styles.actionText, { color: '#EF4444' }]}>{t('reject') || 'Reject'}</Text>
                        </Pressable>
                      </View>
                    )}
                    {b.status === 'confirmed' && (
                      <View style={styles.actions}>
                        <Pressable
                          style={({ pressed }) => [styles.actionBtn, styles.completeBtn, pressed && { opacity: 0.85 }]}
                          onPress={() => updateStatus.mutate({ id: b.id, status: 'completed' })}
                        >
                          <Ionicons name="checkmark-done" size={16} color="#fff" />
                          <Text style={styles.actionTextLight}>{t('complete') || 'Complete'}</Text>
                        </Pressable>
                        <Pressable
                          style={({ pressed }) => [styles.actionBtn, styles.cancelBtn, pressed && { opacity: 0.85 }]}
                          onPress={() => confirmAction(
                            t('cancel_booking') || 'Cancel Booking',
                            t('cancel_confirm') || 'Cancel this booking?',
                            t('yes_cancel') || 'Yes, Cancel',
                            t('keep') || 'Keep',
                            () => updateStatus.mutate({ id: b.id, status: 'cancelled' }),
                          )}
                        >
                          <Ionicons name="close-circle" size={16} color="#EF4444" />
                          <Text style={[styles.actionText, { color: '#EF4444' }]}>{t('cancel')}</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Details Modal */}
      <Modal visible={!!detailBooking} transparent animationType="fade" onRequestClose={() => setDetailBooking(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{t('booking_details') || 'Booking Details'}</Text>
                <Text style={styles.modalSubtitle}>#{detailBooking?.id?.slice(0, 8) || ''}</Text>
              </View>
              <Pressable onPress={() => setDetailBooking(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#888" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {detailBooking && (() => {
                const sc = statusConfig[detailBooking.status] || statusConfig.pending;
                return (
                  <>
                    <View style={styles.modalStatusRow}>
                      <View style={[styles.modalBadge, { backgroundColor: sc.bg, borderColor: sc.color + '40' }]}>
                        <Ionicons name={sc.icon as any} size={14} color={sc.color} />
                        <Text style={[styles.modalBadgeText, { color: sc.color }]}>{detailBooking.status}</Text>
                      </View>
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>{t('client_info') || 'Client Information'}</Text>
                      <View style={styles.modalField}>
                        <Ionicons name="person-outline" size={14} color={PRIMARY} />
                        <Text style={styles.modalFieldLabel}>{t('client_name') || 'Name'}:</Text>
                        <Text style={styles.modalFieldValue}>{detailBooking.clientName || '—'}</Text>
                      </View>
                      {detailBooking.clientPhone && (
                        <Pressable onPress={() => callClient(detailBooking.clientPhone)} style={styles.modalField}>
                          <Ionicons name="call-outline" size={14} color="#10B981" />
                          <Text style={styles.modalFieldLabel}>{t('phone') || 'Phone'}:</Text>
                          <Text style={[styles.modalFieldValue, { color: '#10B981', textDecorationLine: 'underline' }]}>
                            {detailBooking.clientPhone}
                          </Text>
                        </Pressable>
                      )}
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>{t('appointment_info') || 'Appointment'}</Text>
                      <View style={styles.modalField}>
                        <Ionicons name="cut-outline" size={14} color={PRIMARY} />
                        <Text style={styles.modalFieldLabel}>{t('service') || 'Service'}:</Text>
                        <Text style={styles.modalFieldValue}>{getServiceDisplay(detailBooking)}</Text>
                      </View>
                      <View style={styles.modalField}>
                        <Ionicons name="calendar-outline" size={14} color="#3B82F6" />
                        <Text style={styles.modalFieldLabel}>{t('date') || 'Date'}:</Text>
                        <Text style={styles.modalFieldValue}>{detailBooking.date || '—'}</Text>
                      </View>
                      <View style={styles.modalField}>
                        <Ionicons name="time-outline" size={14} color="#3B82F6" />
                        <Text style={styles.modalFieldLabel}>{t('time') || 'Time'}:</Text>
                        <Text style={styles.modalFieldValue}>{detailBooking.time || '—'}</Text>
                      </View>
                      <View style={styles.modalField}>
                        <MaterialCommunityIcons name="currency-usd" size={14} color="#10B981" />
                        <Text style={styles.modalFieldLabel}>{t('price') || 'Price'}:</Text>
                        <Text style={[styles.modalFieldValue, { color: '#10B981', fontFamily: 'Urbanist_700Bold' }]}>
                          ${detailBooking.totalPrice || 0}
                        </Text>
                      </View>
                    </View>

                    {detailBooking.notes && (
                      <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>{t('notes') || 'Notes'}</Text>
                        <View style={styles.modalNoteBox}>
                          <Text style={styles.modalNoteText}>{detailBooking.notes}</Text>
                        </View>
                      </View>
                    )}
                  </>
                );
              })()}
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  confirmAction(
                    t('delete_booking') || 'Delete Booking',
                    t('delete_booking_confirm') || 'Are you sure? This cannot be undone.',
                    t('delete') || 'Delete',
                    t('cancel') || 'Cancel',
                    () => deleteBooking.mutate(detailBooking.id),
                  );
                }}
                style={({ pressed }) => [styles.modalActionBtn, { borderColor: '#EF4444', backgroundColor: '#EF444418', flex: 0, paddingHorizontal: 14 }, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </Pressable>
              <Pressable
                onPress={() => openEdit(detailBooking)}
                style={({ pressed }) => [styles.modalActionBtn, { borderColor: PRIMARY, backgroundColor: PRIMARY + '15', flex: 1.2 }, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="create-outline" size={16} color={PRIMARY} />
                <Text style={[styles.modalActionText, { color: PRIMARY }]}>{t('edit') || 'Edit'}</Text>
              </Pressable>
              {detailBooking?.status !== 'cancelled' && detailBooking?.status !== 'completed' && (
                <Pressable
                  onPress={() => { setDetailBooking(null); openReschedule(detailBooking); }}
                  style={({ pressed }) => [styles.modalActionBtn, { borderColor: '#6366F1', backgroundColor: '#6366F115' }, pressed && { opacity: 0.85 }]}
                >
                  <MaterialCommunityIcons name="calendar-edit" size={16} color="#6366F1" />
                  <Text style={[styles.modalActionText, { color: '#6366F1' }]}>{t('reschedule') || 'Reschedule'}</Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => setDetailBooking(null)}
                style={({ pressed }) => [styles.modalActionBtn, styles.modalPrimaryBtn, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.modalPrimaryBtnText}>{t('close') || 'Close'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reschedule Modal */}
      <Modal visible={!!rescheduleBooking} transparent animationType="fade" onRequestClose={() => setRescheduleBooking(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 380 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{t('reschedule_booking') || 'Reschedule Booking'}</Text>
                <Text style={styles.modalSubtitle}>{rescheduleBooking?.clientName}</Text>
              </View>
              <Pressable onPress={() => setRescheduleBooking(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#888" />
              </Pressable>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>{t('new_date') || 'New Date'}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="calendar-outline" size={18} color={PRIMARY} />
                <TextInput
                  value={newDate}
                  onChangeText={setNewDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#555"
                  style={styles.modalInput}
                />
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>{t('new_time') || 'New Time'}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="time-outline" size={18} color={PRIMARY} />
                <TextInput
                  value={newTime}
                  onChangeText={setNewTime}
                  placeholder="HH:MM"
                  placeholderTextColor="#555"
                  style={styles.modalInput}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setRescheduleBooking(null)}
                style={({ pressed }) => [styles.modalActionBtn, { borderColor: BORDER }, pressed && { opacity: 0.7 }]}
              >
                <Text style={[styles.modalActionText, { color: '#888' }]}>{t('cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={() => reschedule.mutate({ id: rescheduleBooking.id, date: newDate, time: newTime })}
                disabled={!newDate || !newTime || reschedule.isPending}
                style={({ pressed }) => [styles.modalActionBtn, styles.modalPrimaryBtn, (!newDate || !newTime) && { opacity: 0.5 }, pressed && { opacity: 0.85 }]}
              >
                {reschedule.isPending ? (
                  <ActivityIndicator size="small" color="#181A20" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check" size={16} color="#181A20" />
                    <Text style={styles.modalPrimaryBtnText}>{t('save') || 'Save'}</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Booking Modal */}
      <Modal visible={!!editBooking} transparent animationType="fade" onRequestClose={() => setEditBooking(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 440 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{t('edit_booking') || 'Edit Booking'}</Text>
                <Text style={styles.modalSubtitle}>#{editBooking?.id?.slice(0, 8)}</Text>
              </View>
              <Pressable onPress={() => setEditBooking(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#888" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
              {/* Client Name */}
              <View style={[styles.modalSection, { marginBottom: 10 }]}>
                <Text style={styles.modalSectionTitle}>{t('client_name') || 'Client Name'}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={16} color={PRIMARY} />
                  <TextInput style={styles.modalInput} value={editForm.clientName}
                    onChangeText={v => setEditForm(p => ({ ...p, clientName: v }))}
                    placeholder={t('client_name') || 'Client Name'} placeholderTextColor="#555" />
                </View>
              </View>

              {/* Phone */}
              <View style={[styles.modalSection, { marginBottom: 10 }]}>
                <Text style={styles.modalSectionTitle}>{t('phone') || 'Phone'}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="call-outline" size={16} color={PRIMARY} />
                  <TextInput style={styles.modalInput} value={editForm.clientPhone}
                    onChangeText={v => setEditForm(p => ({ ...p, clientPhone: v }))}
                    placeholder="+41 79 ..." placeholderTextColor="#555" keyboardType="phone-pad" />
                </View>
              </View>

              {/* Service Picker — multi-select */}
              <View style={[styles.modalSection, { marginBottom: 10 }]}>
                <Text style={styles.modalSectionTitle}>
                  {t('services') || 'Services'} {editForm.selectedServices.length > 0 && `(${editForm.selectedServices.length})`}
                </Text>
                {salonServices.length > 0 ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {salonServices.map((svc: any) => {
                      const isSelected = editForm.selectedServices.includes(svc.name);
                      return (
                        <Pressable
                          key={svc.id}
                          onPress={() => toggleEditService(svc.name)}
                          style={[{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: isSelected ? PRIMARY : BORDER, backgroundColor: isSelected ? PRIMARY + '20' : '#13151B' }]}
                        >
                          <Ionicons name={isSelected ? 'checkmark-circle' : 'add-circle-outline'} size={14} color={isSelected ? PRIMARY : '#888'} />
                          <Text style={{ color: isSelected ? '#fff' : '#aaa', fontFamily: 'Urbanist_600SemiBold', fontSize: 12 }}>{svc.name}</Text>
                          <Text style={{ color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 11 }}>{svc.price}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
                {editForm.selectedServices.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#13151B', borderRadius: 10, borderWidth: 1, borderColor: BORDER }}>
                    {editForm.selectedServices.map((s, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: PRIMARY + '22', borderRadius: 8 }}>
                        <Ionicons name="cut" size={12} color={PRIMARY} />
                        <Text style={{ color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 11 }}>{s}</Text>
                        <Pressable onPress={() => toggleEditService(s)}>
                          <Ionicons name="close-circle" size={14} color="#888" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Date + Time row */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalSectionTitle}>{t('date') || t('date_ymd') || 'Date'}</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="calendar-outline" size={16} color={PRIMARY} />
                    {Platform.OS === 'web' ? (
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e: any) => setEditForm(p => ({ ...p, date: e.target.value }))}
                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 14, padding: '8px 4px' } as any}
                      />
                    ) : (
                      <TextInput style={styles.modalInput} value={editForm.date}
                        onChangeText={v => setEditForm(p => ({ ...p, date: v }))}
                        placeholder="YYYY-MM-DD" placeholderTextColor="#555" />
                    )}
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalSectionTitle}>{t('time') || t('time_hm') || 'Time'}</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="time-outline" size={16} color={PRIMARY} />
                    {Platform.OS === 'web' ? (
                      <input
                        type="time"
                        value={editForm.time}
                        onChange={(e: any) => setEditForm(p => ({ ...p, time: e.target.value }))}
                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 14, padding: '8px 4px' } as any}
                      />
                    ) : (
                      <TextInput style={styles.modalInput} value={editForm.time}
                        onChangeText={v => setEditForm(p => ({ ...p, time: v }))}
                        placeholder="HH:MM" placeholderTextColor="#555" />
                    )}
                  </View>
                </View>
              </View>

              {/* Price */}
              <View style={[styles.modalSection, { marginBottom: 10 }]}>
                <Text style={styles.modalSectionTitle}>{t('price_chf') || 'Price (CHF)'}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="cash-outline" size={16} color="#10B981" />
                  <TextInput style={styles.modalInput} value={editForm.totalPrice}
                    onChangeText={v => setEditForm(p => ({ ...p, totalPrice: v }))}
                    placeholder="0.00" placeholderTextColor="#555" keyboardType="decimal-pad" />
                </View>
              </View>

              {/* Notes */}
              <View style={[styles.modalSection, { marginBottom: 10 }]}>
                <Text style={styles.modalSectionTitle}>{t('notes') || 'Notes'}</Text>
                <View style={[styles.inputWrap, { height: 60, alignItems: 'flex-start', paddingTop: 10 }]}>
                  <Ionicons name="document-text-outline" size={16} color={PRIMARY} />
                  <TextInput style={[styles.modalInput, { textAlignVertical: 'top' }]} value={editForm.notes}
                    onChangeText={v => setEditForm(p => ({ ...p, notes: v }))}
                    placeholder={t('optional_notes') || 'Optional notes...'} placeholderTextColor="#555" multiline />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setEditBooking(null)}
                style={({ pressed }) => [styles.modalActionBtn, { borderColor: BORDER }, pressed && { opacity: 0.7 }]}
              >
                <Text style={[styles.modalActionText, { color: '#888' }]}>{t('cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={() => editBookingMutation.mutate({ ...editForm, id: editBooking.id })}
                disabled={editBookingMutation.isPending}
                style={({ pressed }) => [styles.modalActionBtn, styles.modalPrimaryBtn, pressed && { opacity: 0.85 }]}
              >
                {editBookingMutation.isPending ? (
                  <ActivityIndicator size="small" color="#181A20" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color="#181A20" />
                    <Text style={styles.modalPrimaryBtnText}>{t('save_changes') || 'Save Changes'}</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add New Booking Modal */}
      <Modal visible={showAdd} transparent animationType="fade" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 440 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{t('add_booking') || 'Add New Booking'}</Text>
                <Text style={styles.modalSubtitle}>{t('create_manual_booking') || 'Create a walk-in booking'}</Text>
              </View>
              <Pressable onPress={() => setShowAdd(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#888" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
              {/* Client name with quick pick from existing customers */}
              <View style={[styles.modalSection, { marginBottom: 10 }]}>
                <Text style={styles.modalSectionTitle}>{t('client_name') || 'Client Name'} *</Text>
                {salonCustomers.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', gap: 6, paddingVertical: 4 }}>
                      {salonCustomers.slice(0, 12).map((c: any) => (
                        <Pressable key={c.id} onPress={() => setAddForm(p => ({ ...p, clientName: c.fullName, clientPhone: c.phone || p.clientPhone }))}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#13151B', borderWidth: 1, borderColor: BORDER }}>
                          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: PRIMARY + '30', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 10 }}>{(c.fullName || 'U')[0]}</Text>
                          </View>
                          <Text style={{ color: '#ccc', fontFamily: 'Urbanist_500Medium', fontSize: 11 }}>{c.fullName}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                )}
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={16} color={PRIMARY} />
                  <TextInput style={styles.modalInput} value={addForm.clientName}
                    onChangeText={v => setAddForm(p => ({ ...p, clientName: v }))}
                    placeholder={t('client_name') || 'Client Name'} placeholderTextColor="#555" />
                </View>
              </View>

              {/* Phone */}
              <View style={[styles.modalSection, { marginBottom: 10 }]}>
                <Text style={styles.modalSectionTitle}>{t('phone') || 'Phone'}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="call-outline" size={16} color={PRIMARY} />
                  <TextInput style={styles.modalInput} value={addForm.clientPhone}
                    onChangeText={v => setAddForm(p => ({ ...p, clientPhone: v }))}
                    placeholder="+41 79 ..." placeholderTextColor="#555" keyboardType="phone-pad" />
                </View>
              </View>

              {/* Service Picker */}
              <View style={[styles.modalSection, { marginBottom: 10 }]}>
                <Text style={styles.modalSectionTitle}>{t('service') || 'Service'} *</Text>
                {salonServices.length > 0 ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {salonServices.map((svc: any) => {
                      const isSelected = addForm.serviceName === svc.name;
                      return (
                        <Pressable key={svc.id} onPress={() => setAddForm(p => ({
                          ...p, serviceName: svc.name,
                          totalPrice: String(svc.price ?? p.totalPrice),
                        }))}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: isSelected ? PRIMARY : BORDER, backgroundColor: isSelected ? PRIMARY + '20' : '#13151B' }}>
                          <Ionicons name="cut" size={13} color={isSelected ? PRIMARY : '#888'} />
                          <Text style={{ color: isSelected ? '#fff' : '#aaa', fontFamily: 'Urbanist_600SemiBold', fontSize: 12 }}>{svc.name}</Text>
                          <Text style={{ color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 11 }}>{svc.price}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={{ color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 12, marginBottom: 6 }}>{t('no_services_yet') || 'Add services first or type custom'}</Text>
                )}
                <View style={styles.inputWrap}>
                  <Ionicons name="cut-outline" size={16} color={PRIMARY} />
                  <TextInput style={styles.modalInput} value={addForm.serviceName}
                    onChangeText={v => setAddForm(p => ({ ...p, serviceName: v }))}
                    placeholder={t('select_or_type_service') || 'Or type custom'} placeholderTextColor="#555" />
                </View>
              </View>

              {/* Date + Time row */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalSectionTitle}>{t('date') || t('date_ymd') || 'Date'} *</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="calendar-outline" size={16} color={PRIMARY} />
                    {Platform.OS === 'web' ? (
                      <input
                        type="date"
                        value={addForm.date}
                        onChange={(e: any) => setAddForm(p => ({ ...p, date: e.target.value }))}
                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 14, padding: '8px 4px' } as any}
                      />
                    ) : (
                      <TextInput style={styles.modalInput} value={addForm.date}
                        onChangeText={v => setAddForm(p => ({ ...p, date: v }))}
                        placeholder="YYYY-MM-DD" placeholderTextColor="#555" />
                    )}
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalSectionTitle}>{t('time') || t('time_hm') || 'Time'} *</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="time-outline" size={16} color={PRIMARY} />
                    {Platform.OS === 'web' ? (
                      <input
                        type="time"
                        value={addForm.time}
                        onChange={(e: any) => setAddForm(p => ({ ...p, time: e.target.value }))}
                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 14, padding: '8px 4px' } as any}
                      />
                    ) : (
                      <TextInput style={styles.modalInput} value={addForm.time}
                        onChangeText={v => setAddForm(p => ({ ...p, time: v }))}
                        placeholder="HH:MM" placeholderTextColor="#555" />
                    )}
                  </View>
                </View>
              </View>

              {/* Quick today/tomorrow buttons */}
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
                <Pressable onPress={() => setAddForm(p => ({ ...p, date: new Date().toISOString().split('T')[0] }))}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: PRIMARY + '20', borderWidth: 1, borderColor: PRIMARY + '40' }}>
                  <Text style={{ color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 11 }}>{t('today') || 'Today'}</Text>
                </Pressable>
                <Pressable onPress={() => { const d = new Date(); d.setDate(d.getDate() + 1); setAddForm(p => ({ ...p, date: d.toISOString().split('T')[0] })); }}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: PRIMARY + '20', borderWidth: 1, borderColor: PRIMARY + '40' }}>
                  <Text style={{ color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 11 }}>{t('tomorrow') || 'Tomorrow'}</Text>
                </Pressable>
                {['09:00', '10:00', '14:00', '16:00'].map(time => (
                  <Pressable key={time} onPress={() => setAddForm(p => ({ ...p, time }))}
                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#13151B', borderWidth: 1, borderColor: BORDER }}>
                    <Text style={{ color: '#ccc', fontFamily: 'Urbanist_600SemiBold', fontSize: 11 }}>{time}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Price */}
              <View style={[styles.modalSection, { marginBottom: 10 }]}>
                <Text style={styles.modalSectionTitle}>{t('price_chf') || 'Price (CHF)'}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="cash-outline" size={16} color="#10B981" />
                  <TextInput style={styles.modalInput} value={addForm.totalPrice}
                    onChangeText={v => setAddForm(p => ({ ...p, totalPrice: v }))}
                    placeholder="0.00" placeholderTextColor="#555" keyboardType="decimal-pad" />
                </View>
              </View>

              {/* Notes */}
              <View style={[styles.modalSection, { marginBottom: 10 }]}>
                <Text style={styles.modalSectionTitle}>{t('notes') || 'Notes'}</Text>
                <View style={[styles.inputWrap, { height: 60, alignItems: 'flex-start', paddingTop: 10 }]}>
                  <Ionicons name="document-text-outline" size={16} color={PRIMARY} />
                  <TextInput style={[styles.modalInput, { textAlignVertical: 'top' }]} value={addForm.notes}
                    onChangeText={v => setAddForm(p => ({ ...p, notes: v }))}
                    placeholder={t('optional_notes') || 'Optional notes...'} placeholderTextColor="#555" multiline />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowAdd(false)}
                style={({ pressed }) => [styles.modalActionBtn, { borderColor: BORDER }, pressed && { opacity: 0.7 }]}
              >
                <Text style={[styles.modalActionText, { color: '#888' }]}>{t('cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!addForm.clientName || !addForm.serviceName || !addForm.date || !addForm.time) {
                    if (Platform.OS === 'web') window.alert(t('fill_required_fields') || 'Please fill required fields');
                    else Alert.alert(t('error'), t('fill_required_fields') || 'Please fill required fields');
                    return;
                  }
                  createBooking.mutate(addForm);
                }}
                disabled={createBooking.isPending}
                style={({ pressed }) => [styles.modalActionBtn, styles.modalPrimaryBtn, pressed && { opacity: 0.85 }]}
              >
                {createBooking.isPending ? (
                  <ActivityIndicator size="small" color="#181A20" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="plus-circle" size={16} color="#181A20" />
                    <Text style={styles.modalPrimaryBtnText}>{t('add_booking_btn') || 'Add Booking'}</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, marginTop: 8, marginBottom: 16 },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 28 },
  subtitle: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 14, marginTop: 2 },

  // Stats — compact
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 10 },
  statCard: {
    flex: 1, flexDirection: 'row', backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8,
    borderWidth: 1, borderColor: BORDER, borderLeftWidth: 3,
    alignItems: 'center', gap: 8,
  },
  statValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  statLabel: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 10 },

  // Search — compact
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: CARD,
    borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    marginHorizontal: 20, paddingHorizontal: 12, height: 40, gap: 8, marginBottom: 10,
  },
  searchIconWrap: { width: 24, height: 24, borderRadius: 8, backgroundColor: 'rgba(244,164,96,0.12)', alignItems: 'center', justifyContent: 'center' },
  searchInput: { flex: 1, color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 13, height: '100%', paddingVertical: 0 },
  searchClearBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#13151B', alignItems: 'center', justifyContent: 'center' },

  // Filters — compact
  filterScrollWrap: { paddingVertical: 2, marginBottom: 10 },
  filterRow: { paddingHorizontal: 20, gap: 6, paddingVertical: 2 },
  filterBtn: {
    flexShrink: 0,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD,
    minHeight: 40,
  },
  filterText: { color: '#ccc', fontFamily: 'Urbanist_700Bold', fontSize: 12 },
  filterTextActive: { color: '#fff' },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 1, minWidth: 20, alignItems: 'center',
  },
  countText: { color: '#aaa', fontFamily: 'Urbanist_700Bold', fontSize: 10 },

  // Header badge — compact
  headerBadge: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(244,164,96,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(244,164,96,0.3)' },
  addBookingBtn: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },

  // Loading
  loadingContainer: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  loadingText: { color: '#666', fontFamily: 'Urbanist_500Medium', fontSize: 14 },

  // List
  list: { paddingHorizontal: 20 },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: `${CARD}`, borderWidth: 1, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { color: '#aaa', fontFamily: 'Urbanist_600SemiBold', fontSize: 16, marginBottom: 4 },
  emptySubtitle: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 13 },

  // Card
  card: {
    backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    marginBottom: 12, overflow: 'hidden', flexDirection: 'row',
  },
  statusLine: { width: 4, alignSelf: 'stretch' },
  cardContent: { flex: 1, padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  clientSection: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Urbanist_700Bold', fontSize: 18 },
  clientName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16, marginBottom: 2 },
  serviceName: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  badgeText: { fontFamily: 'Urbanist_600SemiBold', fontSize: 11, textTransform: 'capitalize' },

  // Meta
  cardMeta: { flexDirection: 'row', gap: 14, marginBottom: 14, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaIcon: {
    width: 26, height: 26, borderRadius: 8, backgroundColor: '#ffffff08',
    alignItems: 'center', justifyContent: 'center',
  },
  metaText: { color: '#999', fontFamily: 'Urbanist_500Medium', fontSize: 12 },
  priceText: { color: '#10B981', fontFamily: 'Urbanist_700Bold' },

  // Actions
  actions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#ffffff08', paddingTop: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10,
  },
  confirmBtn: { backgroundColor: '#10B981', flex: 1, justifyContent: 'center' },
  cancelBtn: { backgroundColor: '#EF444418', borderWidth: 1, borderColor: '#EF444430', flex: 1, justifyContent: 'center' },
  rejectBtn: { backgroundColor: '#EF444418', borderWidth: 1, borderColor: '#EF444430', flex: 1, justifyContent: 'center' },
  completeBtn: { backgroundColor: '#10B981', flex: 1, justifyContent: 'center' },
  actionText: { fontFamily: 'Urbanist_700Bold', fontSize: 13 },
  actionTextLight: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 13 },

  // Quick action icons row
  quickActions: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  quickIconBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: '#13151B', borderWidth: 1, borderColor: BORDER },
  quickIconText: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 11 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, padding: 20, width: '100%', maxWidth: 440, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18 },
  modalSubtitle: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 12, marginTop: 2 },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#13151B', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER },

  modalStatusRow: { flexDirection: 'row', marginBottom: 14 },
  modalBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  modalBadgeText: { fontFamily: 'Urbanist_700Bold', fontSize: 12, textTransform: 'capitalize' },

  modalSection: { marginBottom: 14, backgroundColor: '#13151B', borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 12 },
  modalSectionTitle: { color: '#888', fontFamily: 'Urbanist_700Bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  modalField: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  modalFieldLabel: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13 },
  modalFieldValue: { flex: 1, color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  modalNoteBox: { backgroundColor: '#000', padding: 10, borderRadius: 8 },
  modalNoteText: { color: '#ccc', fontFamily: 'Urbanist_400Regular', fontSize: 12, lineHeight: 18 },

  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#000', borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: BORDER },
  modalInput: { flex: 1, color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 14, height: 44 },

  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
  modalActionText: { fontFamily: 'Urbanist_700Bold', fontSize: 13 },
  modalPrimaryBtn: { backgroundColor: PRIMARY, borderColor: PRIMARY, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  modalPrimaryBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 14 },
});
