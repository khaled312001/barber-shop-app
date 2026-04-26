import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Platform, Pressable, ActivityIndicator, Alert, Image, TextInput } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { apiRequest } from '@/lib/query-client';
import { Salon } from '@shared/schema';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';

export default function AdminSalons() {
    const { t, isRTL } = useLanguage();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;
    const qc = useQueryClient();
    const [search, setSearch] = useState('');

    const { data: salons = [], isLoading } = useQuery<Salon[]>({
        queryKey: ['admin-salons'],
        queryFn: async () => {
            const res = await apiRequest('GET', '/api/admin/salons');
            return res.json();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest('DELETE', `/api/admin/salons/${id}`);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-salons'] }),
        onError: (err: any) => {
            if (Platform.OS === 'web') window.alert(err.message);
            else Alert.alert(t('error'), err.message);
        },
    });

    const handleDelete = (id: string, name: string) => {
        const msg = `${t('delete_salon_confirm') || 'Delete salon'} "${name}"?`;
        if (Platform.OS === 'web') {
            if (window.confirm(msg)) deleteMutation.mutate(id);
        } else {
            Alert.alert(t('delete'), msg, [
                { text: t('cancel') },
                { text: t('delete'), onPress: () => deleteMutation.mutate(id), style: 'destructive' }
            ]);
        }
    };

    const filtered = search.trim()
        ? salons.filter(s => (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.address || '').toLowerCase().includes(search.toLowerCase()))
        : salons;

    const activeSalons = salons.filter((s: any) => s.isOpen).length;
    const avgRating = salons.length > 0 ? (salons.reduce((s: number, x: any) => s + (x.rating || 0), 0) / salons.length).toFixed(1) : '—';

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>{t('manage_salons') || 'Salons'}</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        {salons.length} {t('total') || 'total'} · {activeSalons} {t('active') || 'active'}
                    </Text>
                </View>
                <View style={[styles.headerBadge, { backgroundColor: PRIMARY + '15', borderColor: PRIMARY + '30' }]}>
                    <MaterialCommunityIcons name="store" size={22} color={PRIMARY} />
                </View>
            </View>

            {/* Summary */}
            <View style={styles.summaryRow}>
                <LinearGradient
                    colors={[PRIMARY + '20', PRIMARY + '05']}
                    style={[styles.sumCard, { borderColor: PRIMARY + '30' }]}
                >
                    <View style={[styles.sumIcon, { backgroundColor: PRIMARY }]}>
                        <MaterialCommunityIcons name="store" size={16} color="#fff" />
                    </View>
                    <View>
                        <Text style={[styles.sumValue, { color: colors.text }]}>{salons.length}</Text>
                        <Text style={[styles.sumLabel, { color: colors.textSecondary }]}>{t('total_salons') || 'Total'}</Text>
                    </View>
                </LinearGradient>
                <LinearGradient
                    colors={['#10B98120', '#10B98105']}
                    style={[styles.sumCard, { borderColor: '#10B98130' }]}
                >
                    <View style={[styles.sumIcon, { backgroundColor: '#10B981' }]}>
                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    </View>
                    <View>
                        <Text style={[styles.sumValue, { color: colors.text }]}>{activeSalons}</Text>
                        <Text style={[styles.sumLabel, { color: colors.textSecondary }]}>{t('active') || 'Active'}</Text>
                    </View>
                </LinearGradient>
                <LinearGradient
                    colors={['#F59E0B20', '#F59E0B05']}
                    style={[styles.sumCard, { borderColor: '#F59E0B30' }]}
                >
                    <View style={[styles.sumIcon, { backgroundColor: '#F59E0B' }]}>
                        <Ionicons name="star" size={16} color="#fff" />
                    </View>
                    <View>
                        <Text style={[styles.sumValue, { color: colors.text }]}>{avgRating}</Text>
                        <Text style={[styles.sumLabel, { color: colors.textSecondary }]}>{t('avg_rating') || 'Avg'}</Text>
                    </View>
                </LinearGradient>
            </View>

            {/* Search */}
            <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.searchIconWrap, { backgroundColor: PRIMARY + '15' }]}>
                    <Ionicons name="search" size={16} color={PRIMARY} />
                </View>
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder={t('search_salons') || 'Search salons...'}
                    placeholderTextColor={colors.textTertiary}
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <Pressable onPress={() => setSearch('')} style={styles.searchClear}>
                        <Ionicons name="close" size={14} color={colors.textTertiary} />
                    </Pressable>
                )}
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
            ) : filtered.length === 0 ? (
                <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.emptyIconWrap, { backgroundColor: PRIMARY + '15' }]}>
                        <MaterialCommunityIcons name="store-off" size={36} color={PRIMARY} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('no_salons_admin') || 'No salons found'}</Text>
                    <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                        {search ? (t('try_different_search') || 'Try a different search.') : (t('salons_will_appear_here') || 'Salons will appear here.')}
                    </Text>
                </View>
            ) : (
                filtered.map((s: any) => (
                    <View key={s.id} style={[styles.salonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Image source={{ uri: s.image }} style={styles.salonImage} />
                        <View style={styles.salonInfo}>
                            <View style={styles.salonTop}>
                                <Text style={[styles.salonName, { color: colors.text }]} numberOfLines={1}>{s.name}</Text>
                                <View style={[styles.statusPill, { backgroundColor: s.isOpen ? '#10B98120' : '#EF444420', borderColor: s.isOpen ? '#10B98140' : '#EF444440' }]}>
                                    <View style={[styles.statusDot, { backgroundColor: s.isOpen ? '#10B981' : '#EF4444' }]} />
                                    <Text style={[styles.statusText, { color: s.isOpen ? '#10B981' : '#EF4444' }]}>
                                        {s.isOpen ? (t('open') || 'Open') : (t('closed') || 'Closed')}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.addressRow}>
                                <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
                                <Text style={[styles.salonAddr, { color: colors.textSecondary }]} numberOfLines={1}>{s.address}</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <View style={styles.metaChip}>
                                    <Ionicons name="star" size={11} color="#F59E0B" />
                                    <Text style={[styles.metaText, { color: colors.text }]}>{s.rating}</Text>
                                    <Text style={[styles.metaText, { color: colors.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>({s.reviewCount || 0})</Text>
                                </View>
                                <View style={styles.metaChip}>
                                    <Ionicons name="call-outline" size={11} color={PRIMARY} />
                                    <Text style={[styles.metaText, { color: colors.textSecondary, fontFamily: 'Urbanist_500Medium' }]} numberOfLines={1}>
                                        {s.phone || '—'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <Pressable
                            onPress={() => handleDelete(s.id, s.name)}
                            style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.6 }]}
                        >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </Pressable>
                    </View>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: Platform.OS === 'web' ? 40 : 20, paddingBottom: 80 },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
    title: { fontSize: 28, fontFamily: 'Urbanist_700Bold' },
    subtitle: { fontSize: 13, fontFamily: 'Urbanist_500Medium', marginTop: 4 },
    headerBadge: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

    summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    sumCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
    sumIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    sumValue: { fontSize: 18, fontFamily: 'Urbanist_700Bold' },
    sumLabel: { fontSize: 11, fontFamily: 'Urbanist_500Medium' },

    searchBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, height: 52, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
    searchIconWrap: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    searchInput: { flex: 1, height: '100%', fontFamily: 'Urbanist_500Medium', fontSize: 14, paddingVertical: 0 },
    searchClear: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },

    salonCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
    salonImage: { width: 64, height: 64, borderRadius: 14, backgroundColor: '#222' },
    salonInfo: { flex: 1 },
    salonTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 },
    salonName: { flex: 1, fontSize: 15, fontFamily: 'Urbanist_700Bold' },
    statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
    statusDot: { width: 5, height: 5, borderRadius: 3 },
    statusText: { fontSize: 10, fontFamily: 'Urbanist_700Bold', textTransform: 'uppercase' },
    addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
    salonAddr: { flex: 1, fontSize: 12, fontFamily: 'Urbanist_400Regular' },
    metaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontFamily: 'Urbanist_700Bold', fontSize: 11 },
    deleteBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' },

    empty: { alignItems: 'center', paddingVertical: 50, gap: 10, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', paddingHorizontal: 24 },
    emptyIconWrap: { width: 76, height: 76, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { fontSize: 16, fontFamily: 'Urbanist_700Bold' },
    emptySub: { fontSize: 12, fontFamily: 'Urbanist_400Regular', textAlign: 'center' },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
