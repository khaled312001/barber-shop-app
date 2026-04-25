import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, ActivityIndicator, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';

interface Stats {
    totalUsers: number;
    totalSalons: number;
    totalBookings: number;
    totalRevenue: number;
}

export default function AdminDashboard() {
    const { t, isRTL } = useLanguage();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;

    const { data: stats, isLoading, error } = useQuery<Stats>({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await apiRequest('GET', '/api/admin/stats');
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={PRIMARY} />
            </View>
        );
    }

    if (error || !stats) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <View style={styles.errorIconWrap}>
                    <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
                </View>
                <Text style={[styles.errorText, { color: colors.error }]}>{t('failed_load_dashboard') || 'Failed to load dashboard'}</Text>
            </View>
        );
    }

    const chartBars = [120, 200, 150, 80, 70, 110, 130];
    const maxBar = Math.max(...chartBars);
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const statCards = [
        { title: t('total_users') || 'Users', value: stats.totalUsers, icon: 'people' as const, color: '#6C63FF', mcIcon: null },
        { title: t('registered_salons') || 'Salons', value: stats.totalSalons, icon: 'business' as const, color: '#3B82F6', mcIcon: null },
        { title: t('total_bookings') || 'Bookings', value: stats.totalBookings, icon: 'calendar' as const, color: '#10B981', mcIcon: null },
        { title: t('gross_revenue') || 'Revenue', value: `$${stats.totalRevenue.toFixed(0)}`, icon: 'cash' as const, color: PRIMARY, mcIcon: null },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>{t('admin_overview') || 'Super Admin'}</Text>
                    <View style={styles.subtitleRow}>
                        <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {t('platform_overview') || 'Platform overview'}
                        </Text>
                    </View>
                </View>
                <View style={[styles.headerBadge, { backgroundColor: PRIMARY + '15', borderColor: PRIMARY + '30' }]}>
                    <MaterialCommunityIcons name="shield-crown" size={22} color={PRIMARY} />
                </View>
            </View>

            {/* Stat cards with gradient */}
            <View style={styles.gridContainer}>
                {statCards.map((card, i) => (
                    <LinearGradient
                        key={i}
                        colors={[card.color + '20', card.color + '05']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={[styles.statCard, { borderColor: card.color + '30' }]}
                    >
                        <View style={[styles.iconBox, { backgroundColor: card.color }]}>
                            <Ionicons name={card.icon} size={20} color="#fff" />
                        </View>
                        <View style={styles.statContent}>
                            <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{card.title}</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>{card.value}</Text>
                        </View>
                    </LinearGradient>
                ))}
            </View>

            {/* Weekly activity chart */}
            <View style={[styles.chartContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.chartHeader}>
                    <View style={styles.chartTitleRow}>
                        <View style={[styles.chartIconWrap, { backgroundColor: PRIMARY + '22' }]}>
                            <MaterialCommunityIcons name="chart-bar" size={18} color={PRIMARY} />
                        </View>
                        <Text style={[styles.chartTitle, { color: colors.text }]}>{t('weekly_activity') || 'Weekly Activity'}</Text>
                    </View>
                    <Text style={[styles.chartTotal, { color: PRIMARY }]}>
                        {chartBars.reduce((a, b) => a + b, 0)}
                    </Text>
                </View>
                <View style={styles.chartBars}>
                    {chartBars.map((val, idx) => {
                        const pct = (val / maxBar) * 100;
                        return (
                            <View key={idx} style={styles.barItem}>
                                <Text style={[styles.barValue, { color: colors.textSecondary }]}>{val}</Text>
                                <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                                    <LinearGradient
                                        colors={[PRIMARY, '#E8924A']}
                                        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                                        style={[styles.barFill, { height: `${pct}%` }]}
                                    />
                                </View>
                                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{weekDays[idx]}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    content: { padding: Platform.OS === 'web' ? 40 : 20, paddingBottom: 80 },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
    title: { fontSize: 28, fontFamily: 'Urbanist_700Bold' },
    subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    subtitle: { fontSize: 13, fontFamily: 'Urbanist_500Medium' },
    headerBadge: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

    errorIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(239,68,68,0.15)', alignItems: 'center', justifyContent: 'center' },
    errorText: { fontSize: 15, fontFamily: 'Urbanist_700Bold' },

    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 20,
    },
    statCard: {
        padding: 18,
        borderRadius: 18,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
        minWidth: Platform.OS === 'web' ? 230 : '45%',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statContent: { flex: 1 },
    statTitle: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    statValue: { fontSize: 22, fontFamily: 'Urbanist_700Bold' },

    chartContainer: {
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
    },
    chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    chartTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    chartIconWrap: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    chartTitle: { fontSize: 16, fontFamily: 'Urbanist_700Bold' },
    chartTotal: { fontSize: 20, fontFamily: 'Urbanist_700Bold' },

    chartBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 220,
        gap: 8,
    },
    barItem: { alignItems: 'center', flex: 1, gap: 6, justifyContent: 'flex-end' },
    barValue: { fontSize: 10, fontFamily: 'Urbanist_700Bold' },
    barBg: { width: Platform.OS === 'web' ? '70%' : '80%', height: 170, borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
    barFill: { width: '100%', borderRadius: 8 },
    barLabel: { fontFamily: 'Urbanist_600SemiBold', fontSize: 11 },
});
