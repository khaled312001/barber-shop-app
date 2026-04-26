import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Platform, Pressable, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';

interface UserData {
    id: string;
    fullName: string;
    email: string;
    role: string | null;
    createdAt: string;
    phone?: string;
    avatar?: string;
}

const roleConfig: Record<string, { color: string; icon: string; label: string }> = {
    admin: { color: '#EC4899', icon: 'shield-crown', label: 'Admin' },
    super_admin: { color: '#EC4899', icon: 'shield-crown', label: 'Super Admin' },
    salon_admin: { color: PRIMARY, icon: 'store', label: 'Salon' },
    staff: { color: '#8B5CF6', icon: 'content-cut', label: 'Staff' },
    user: { color: '#3B82F6', icon: 'account', label: 'Customer' },
};

export default function AdminUsers() {
    const { t, isRTL } = useLanguage();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const { data: users = [], isLoading } = useQuery<UserData[]>({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res = await apiRequest('GET', '/api/admin/users');
            return res.json();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest('DELETE', `/api/admin/users/${id}`);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
        onError: (err: any) => {
            if (Platform.OS === 'web') window.alert(err.message);
            else Alert.alert(t('error'), err.message);
        },
    });

    const handleDelete = (id: string, name: string) => {
        const msg = `${t('delete_user_confirm') || 'Delete user'} "${name}"?`;
        if (Platform.OS === 'web') {
            if (window.confirm(msg)) deleteMutation.mutate(id);
        } else {
            Alert.alert(t('delete'), msg, [
                { text: t('cancel') },
                { text: t('delete'), onPress: () => deleteMutation.mutate(id), style: 'destructive' }
            ]);
        }
    };

    const roleCounts: Record<string, number> = { all: users.length };
    users.forEach(u => { const r = u.role || 'user'; roleCounts[r] = (roleCounts[r] || 0) + 1; });

    const filtered = users.filter(u => {
        if (roleFilter !== 'all' && (u.role || 'user') !== roleFilter) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            return (u.fullName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
        }
        return true;
    });

    const filters = ['all', 'user', 'salon_admin', 'staff', 'admin'];

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>{t('manage_users') || 'Users'}</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{users.length} {t('total') || 'total'}</Text>
                </View>
                <View style={[styles.headerBadge, { backgroundColor: PRIMARY + '15', borderColor: PRIMARY + '30' }]}>
                    <Ionicons name="people" size={22} color={PRIMARY} />
                </View>
            </View>

            {/* Search */}
            <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.searchIconWrap, { backgroundColor: PRIMARY + '15' }]}>
                    <Ionicons name="search" size={16} color={PRIMARY} />
                </View>
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder={t('search_users') || 'Search users...'}
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

            {/* Role filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {filters.map(f => {
                    const active = roleFilter === f;
                    const cfg = f === 'all' ? { color: PRIMARY, icon: 'view-grid', label: t('all') || 'All' } : roleConfig[f];
                    return (
                        <Pressable
                            key={f}
                            onPress={() => setRoleFilter(f)}
                            style={({ pressed }) => [
                                styles.filterBtn,
                                { backgroundColor: active ? cfg.color : colors.surface, borderColor: active ? cfg.color : cfg.color + '40' },
                                pressed && { opacity: 0.85 },
                            ]}
                        >
                            <MaterialCommunityIcons name={cfg.icon as any} size={14} color={active ? '#fff' : cfg.color} />
                            <Text style={[styles.filterText, { color: active ? '#fff' : colors.text }]}>{cfg.label}</Text>
                            {roleCounts[f] > 0 && (
                                <View style={[styles.filterCountPill, active && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                                    <Text style={[styles.filterCountText, active && { color: '#fff' }]}>{roleCounts[f]}</Text>
                                </View>
                            )}
                        </Pressable>
                    );
                })}
            </ScrollView>

            {/* User list */}
            {isLoading ? (
                <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
            ) : filtered.length === 0 ? (
                <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.emptyIconWrap, { backgroundColor: PRIMARY + '15' }]}>
                        <Ionicons name="people-outline" size={40} color={PRIMARY} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('no_users_found') || 'No users found'}</Text>
                </View>
            ) : (
                filtered.map((u) => {
                    const cfg = roleConfig[u.role || 'user'] || roleConfig.user;
                    const initials = (u.fullName || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
                    return (
                        <View key={u.id} style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={[styles.avatar, { backgroundColor: cfg.color + '22', borderColor: cfg.color + '40' }]}>
                                <Text style={[styles.avatarText, { color: cfg.color }]}>{initials}</Text>
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>{u.fullName}</Text>
                                <Text style={[styles.userEmail, { color: colors.textTertiary }]} numberOfLines={1}>{u.email}</Text>
                                <View style={[styles.roleBadge, { backgroundColor: cfg.color + '18', borderColor: cfg.color + '30' }]}>
                                    <MaterialCommunityIcons name={cfg.icon as any} size={10} color={cfg.color} />
                                    <Text style={[styles.roleText, { color: cfg.color }]}>{cfg.label}</Text>
                                </View>
                            </View>
                            <Pressable
                                onPress={() => handleDelete(u.id, u.fullName)}
                                style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.6 }]}
                            >
                                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                            </Pressable>
                        </View>
                    );
                })
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

    searchBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, height: 52, borderRadius: 14, borderWidth: 1, marginBottom: 14 },
    searchIconWrap: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    searchInput: { flex: 1, height: '100%', fontFamily: 'Urbanist_500Medium', fontSize: 14, paddingVertical: 0 },
    searchClear: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },

    filterRow: { gap: 10, paddingVertical: 6, marginBottom: 14, paddingRight: 20 },
    filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, minHeight: 40 },
    filterText: { fontFamily: 'Urbanist_700Bold', fontSize: 12 },
    filterCountPill: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 9, minWidth: 22, alignItems: 'center' },
    filterCountText: { fontFamily: 'Urbanist_700Bold', fontSize: 10, color: '#aaa' },

    userCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
    avatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    avatarText: { fontFamily: 'Urbanist_700Bold', fontSize: 16 },
    userInfo: { flex: 1, gap: 4 },
    userName: { fontSize: 14, fontFamily: 'Urbanist_700Bold' },
    userEmail: { fontSize: 12, fontFamily: 'Urbanist_400Regular' },
    roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start', marginTop: 2 },
    roleText: { fontFamily: 'Urbanist_700Bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3 },
    deleteBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' },

    empty: { alignItems: 'center', paddingVertical: 50, gap: 10, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', paddingHorizontal: 24 },
    emptyIconWrap: { width: 76, height: 76, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { fontSize: 16, fontFamily: 'Urbanist_700Bold' },
});
