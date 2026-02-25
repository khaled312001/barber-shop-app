import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { apiRequest } from '@/lib/query-client';
import { Booking } from '@shared/schema';

export default function AdminBookings() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;

    const { data: bookings, isLoading } = useQuery<Booking[]>({
        queryKey: ['admin-bookings'],
        queryFn: async () => {
            const res = await apiRequest('GET', '/api/admin/bookings');
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>All Bookings</Text>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.rowHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.colSalon, styles.bold, { color: colors.textSecondary }]}>Salon</Text>
                    <Text style={[styles.colDate, styles.bold, { color: colors.textSecondary }]}>Date & Time</Text>
                    <Text style={[styles.colPrice, styles.bold, { color: colors.textSecondary }]}>Total</Text>
                    <Text style={[styles.colStatus, styles.bold, { color: colors.textSecondary }]}>Status</Text>
                </View>

                {bookings?.reverse().map((b) => (
                    <View key={b.id} style={[styles.row, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.colSalon, { color: colors.text, fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>
                            {b.salonName}
                        </Text>

                        <View style={styles.colDate}>
                            <Text style={{ color: colors.text, fontFamily: 'Urbanist_600SemiBold', fontSize: 13 }}>{b.date}</Text>
                            <Text style={{ color: colors.textTertiary, fontFamily: 'Urbanist_500Medium', fontSize: 12 }}>{b.time}</Text>
                        </View>

                        <Text style={[styles.colPrice, { color: colors.primary, fontFamily: 'Urbanist_700Bold' }]}>
                            ${b.totalPrice.toFixed(2)}
                        </Text>

                        <View style={styles.colStatus}>
                            <View style={[styles.statusBadge, {
                                backgroundColor: b.status === 'completed' ? `${colors.success}30` :
                                    b.status === 'cancelled' ? `${colors.error}30` : `${colors.warning}30`
                            }]}>
                                <Text style={[styles.statusText, {
                                    color: b.status === 'completed' ? colors.success :
                                        b.status === 'cancelled' ? colors.error : colors.warning
                                }]}>{b.status.toUpperCase()}</Text>
                            </View>
                        </View>

                    </View>
                ))}
                {bookings?.length === 0 && (
                    <Text style={{ textAlign: 'center', padding: 30, color: colors.textSecondary }}>No bookings found.</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: Platform.OS === 'web' ? 40 : 20 },
    title: { fontSize: 28, fontFamily: 'Urbanist_700Bold', marginBottom: 24 },
    card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
    rowHeader: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, backgroundColor: 'rgba(0,0,0,0.02)', alignItems: 'center' },
    row: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, alignItems: 'center' },
    bold: { fontFamily: 'Urbanist_600SemiBold' },
    colSalon: { flex: 1, paddingRight: 16, fontSize: 15 },
    colDate: { flex: 1 },
    colPrice: { width: 80, fontSize: 16 },
    colStatus: { width: 110, alignItems: 'flex-start' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
    statusText: { fontFamily: 'Urbanist_700Bold', fontSize: 10, letterSpacing: 0.5 },
});
