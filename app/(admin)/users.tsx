import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Platform, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { apiRequest } from '@/lib/query-client';

interface UserData {
    id: string;
    fullName: string;
    email: string;
    role: string | null;
    createdAt: string;
}

export default function AdminUsers() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;
    const qc = useQueryClient();

    const { data: users, isLoading } = useQuery<UserData[]>({
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
        onError: (err: any) => alert(err.message),
    });

    const handleDelete = (id: string) => {
        if (Platform.OS === 'web') {
            if (window.confirm('Delete this user?')) deleteMutation.mutate(id);
        } else {
            Alert.alert('Delete', 'Delete user?', [
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
            <Text style={[styles.title, { color: colors.text }]}>Manage Users & Roles</Text>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.rowHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.colName, styles.bold, { color: colors.textSecondary }]}>Full Name</Text>
                    <Text style={[styles.colEmail, styles.bold, { color: colors.textSecondary }]}>Email</Text>
                    <Text style={[styles.colRole, styles.bold, { color: colors.textSecondary }]}>Role</Text>
                    <Text style={[styles.colAction, styles.bold, { color: colors.textSecondary }]}>Actions</Text>
                </View>

                {users?.map((u) => (
                    <View key={u.id} style={[styles.row, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.colName, { color: colors.text }]} numberOfLines={1}>{u.fullName}</Text>
                        <Text style={[styles.colEmail, { color: colors.textTertiary }]} numberOfLines={1}>{u.email}</Text>

                        <View style={styles.colRole}>
                            <View style={[styles.roleBadge, { backgroundColor: u.role === 'admin' ? `${colors.primary}30` : `${colors.border}50` }]}>
                                <Text style={[styles.roleText, { color: u.role === 'admin' ? colors.primary : colors.text }]}>
                                    {u.role?.toUpperCase() || 'USER'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.colAction}>
                            <TouchableOpacity onPress={() => handleDelete(u.id)}>
                                <Ionicons name="trash-outline" size={20} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                {users?.length === 0 && (
                    <Text style={{ textAlign: 'center', padding: 30, color: colors.textSecondary }}>No users found.</Text>
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
    rowHeader: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, backgroundColor: 'rgba(0,0,0,0.02)' },
    row: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, alignItems: 'center' },
    bold: { fontFamily: 'Urbanist_600SemiBold' },
    colName: { flex: 2, fontFamily: 'Urbanist_500Medium', fontSize: 15 },
    colEmail: { flex: 3, fontFamily: 'Urbanist_500Medium', fontSize: 14 },
    colRole: { flex: 1, alignItems: 'flex-start' },
    colAction: { width: 80, alignItems: 'center', justifyContent: 'center' },
    roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
    roleText: { fontFamily: 'Urbanist_700Bold', fontSize: 11 },
});
