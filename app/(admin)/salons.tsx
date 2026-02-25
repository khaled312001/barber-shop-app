import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Platform, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { apiRequest } from '@/lib/query-client';
import { Salon } from '@shared/schema';

export default function AdminSalons() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;
    const qc = useQueryClient();

    const { data: salons, isLoading } = useQuery<Salon[]>({
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
        onError: (err: any) => alert(err.message),
    });

    const handleDelete = (id: string, name: string) => {
        if (Platform.OS === 'web') {
            if (window.confirm(`Delete salon "${name}"?`)) deleteMutation.mutate(id);
        } else {
            Alert.alert('Delete', `Delete salon "${name}"?`, [
                { text: 'Cancel' },
                { text: 'Delete', onPress: () => deleteMutation.mutate(id), style: 'destructive' }
            ]);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>Manage Salons</Text>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.rowHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.colImage, styles.bold, { color: colors.textSecondary }]}>Image</Text>
                    <Text style={[styles.colName, styles.bold, { color: colors.textSecondary }]}>Salon Name & Address</Text>
                    <Text style={[styles.colRating, styles.bold, { color: colors.textSecondary }]}>Rating</Text>
                    <Text style={[styles.colAction, styles.bold, { color: colors.textSecondary }]}>Actions</Text>
                </View>

                {salons?.map((s) => (
                    <View key={s.id} style={[styles.row, { borderBottomColor: colors.border }]}>
                        <View style={styles.colImage}>
                            <Image source={{ uri: s.image }} style={styles.image} />
                        </View>
                        <View style={styles.colName}>
                            <Text style={[styles.salonName, { color: colors.text }]}>{s.name}</Text>
                            <Text style={{ color: colors.textTertiary, fontFamily: 'Urbanist_500Medium', fontSize: 13 }} numberOfLines={1}>{s.address}</Text>
                        </View>

                        <View style={[styles.colRating, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                            <Ionicons name="star" size={14} color={colors.star} />
                            <Text style={{ color: colors.text, fontFamily: 'Urbanist_700Bold' }}>{s.rating}</Text>
                        </View>

                        <View style={styles.colAction}>
                            <TouchableOpacity onPress={() => handleDelete(s.id, s.name)}>
                                <Ionicons name="trash-outline" size={20} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                {salons?.length === 0 && (
                    <Text style={{ textAlign: 'center', padding: 30, color: colors.textSecondary }}>No salons found.</Text>
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
    colImage: { width: 60, alignItems: 'flex-start' },
    image: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#333' },
    colName: { flex: 1, paddingRight: 16, justifyContent: 'center' },
    salonName: { fontFamily: 'Urbanist_700Bold', fontSize: 16, marginBottom: 2 },
    colRating: { width: 80 },
    colAction: { width: 80, alignItems: 'center', justifyContent: 'center' },
});
