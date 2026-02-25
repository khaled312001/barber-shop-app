import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, ActivityIndicator, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { apiRequest } from '@/lib/query-client';

interface Stats {
    totalUsers: number;
    totalSalons: number;
    totalBookings: number;
    totalRevenue: number;
}

export default function AdminDashboard() {
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
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error || !stats) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>Failed to load admin dashboard.</Text>
            </View>
        );
    }

    // Fake chart data for demo purposes
    const chartBars = [120, 200, 150, 80, 70, 110, 130];
    const maxBar = Math.max(...chartBars);

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>Dashboard Overview</Text>

            <View style={styles.gridContainer}>
                {[
                    { title: 'Total Users', value: stats.totalUsers, icon: 'people' },
                    { title: 'Registered Salons', value: stats.totalSalons, icon: 'business' },
                    { title: 'Total Bookings', value: stats.totalBookings, icon: 'calendar' },
                    { title: 'Gross Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: 'cash' },
                ].map((card, i) => (
                    <View key={i} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.iconBox, { backgroundColor: `${colors.primary}20` }]}>
                            <Ionicons name={card.icon as any} size={24} color={colors.primary} />
                        </View>
                        <View style={styles.statContent}>
                            <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{card.title}</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>{card.value}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={[styles.chartContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>Weekly Activity Report</Text>
                <View style={styles.chartBars}>
                    {chartBars.map((val, idx) => (
                        <View key={idx} style={styles.barItem}>
                            <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                                <View style={[styles.barFill, { backgroundColor: colors.primary, height: `${(val / maxBar) * 100}%` }]} />
                            </View>
                            <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'][idx]}</Text>
                        </View>
                    ))}
                </View>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: Platform.OS === 'web' ? 40 : 20 },
    title: { fontSize: 28, fontFamily: 'Urbanist_700Bold', marginBottom: 24 },
    errorText: { fontSize: 16, fontFamily: 'Urbanist_600SemiBold' },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
        marginBottom: 40,
    },
    statCard: {
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
        minWidth: Platform.OS === 'web' ? 250 : '100%',
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statContent: { flex: 1 },
    statTitle: { fontSize: 14, fontFamily: 'Urbanist_500Medium', marginBottom: 8 },
    statValue: { fontSize: 24, fontFamily: 'Urbanist_700Bold' },
    chartContainer: {
        padding: 30,
        borderRadius: 20,
        borderWidth: 1,
    },
    chartTitle: {
        fontSize: 20,
        fontFamily: 'Urbanist_700Bold',
        marginBottom: 30,
    },
    chartBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 250,
        paddingTop: 10,
    },
    barItem: {
        alignItems: 'center',
        flex: 1,
    },
    barBg: {
        width: Platform.OS === 'web' ? 40 : 20,
        height: 200,
        borderRadius: 8,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    barFill: {
        width: '100%',
        borderRadius: 8,
    },
    barLabel: {
        marginTop: 12,
        fontFamily: 'Urbanist_600SemiBold',
        fontSize: 14,
    }
});
