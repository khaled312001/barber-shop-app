import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

export default function AdminServicesScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { user } = useApp();
    const queryClient = useQueryClient();

    // In a real app, you'd fetch services based on the admin's salon
    // For now, we simulate basic fetching
    const { data: services = [], isLoading } = useQuery({
        queryKey: ['/api/services'],
        queryFn: getQueryFn({ on401: 'throw' }),
        // Dummy data for visual presentation since we don't have a services endpoint yet
        initialData: [
            { id: '1', name: 'Classic Haircut', duration: '30 min', price: 25, category: 'Hair' },
            { id: '2', name: 'Beard Trim', duration: '15 min', price: 15, category: 'Beard' },
            { id: '3', name: 'Hair & Beard Combo', duration: '45 min', price: 35, category: 'Combo' },
            { id: '4', name: 'Kids Haircut', duration: '20 min', price: 18, category: 'Hair' },
        ]
    });

    const [isAdding, setIsAdding] = useState(false);
    const [newService, setNewService] = useState({ name: '', duration: '', price: '', category: '' });

    const handleAddService = () => {
        if (!newService.name || !newService.price) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsAdding(false);
        setNewService({ name: '', duration: '', price: '', category: '' });
        // In reality, this would trigger a mutation
    };

    const topPad = Platform.OS === 'web' ? 24 : Math.max(insets.top, 24);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { paddingTop: topPad }]}>
                <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Manage Services</Text>
                <Pressable
                    onPress={() => setIsAdding(!isAdding)}
                    style={[styles.addButton, { backgroundColor: theme.primary }]}
                >
                    <Ionicons name={isAdding ? "close" : "add"} size={20} color="#fff" />
                    <Text style={[styles.addButtonText, { fontFamily: 'Urbanist_600SemiBold' }]}>
                        {isAdding ? 'Cancel' : 'Add New'}
                    </Text>
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {isAdding && (
                    <View style={[styles.addForm, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.formTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Add New Service</Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>Service Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                                placeholder="e.g. Skin Fade"
                                placeholderTextColor={theme.textTertiary}
                                value={newService.name}
                                onChangeText={(t) => setNewService({ ...newService, name: t })}
                            />
                        </View>

                        <View style={styles.rowInputs}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>Duration</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                                    placeholder="e.g. 30 min"
                                    placeholderTextColor={theme.textTertiary}
                                    value={newService.duration}
                                    onChangeText={(t) => setNewService({ ...newService, duration: t })}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>Price ($)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                                    placeholder="e.g. 25"
                                    keyboardType="numeric"
                                    placeholderTextColor={theme.textTertiary}
                                    value={newService.price}
                                    onChangeText={(t) => setNewService({ ...newService, price: t })}
                                />
                            </View>
                        </View>

                        <Pressable
                            onPress={handleAddService}
                            style={[styles.submitButton, { backgroundColor: theme.primary, opacity: (!newService.name || !newService.price) ? 0.5 : 1 }]}
                            disabled={!newService.name || !newService.price}
                        >
                            <Text style={[styles.submitButtonText, { fontFamily: 'Urbanist_700Bold' }]}>Save Service</Text>
                        </Pressable>
                    </View>
                )}

                {isLoading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : (
                    <View style={styles.listContainer}>
                        {services.map((service: any) => (
                            <View key={service.id} style={[styles.serviceCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <View style={styles.serviceInfo}>
                                    <Text style={[styles.serviceName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{service.name}</Text>
                                    <View style={styles.serviceMeta}>
                                        <Text style={[styles.metaText, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
                                            {service.category} • {service.duration}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.priceContainer}>
                                    <Text style={[styles.servicePrice, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>${service.price}</Text>
                                    <Pressable style={styles.editBtn}>
                                        <Ionicons name="pencil" size={18} color={theme.textTertiary} />
                                    </Pressable>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 24,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    addForm: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    formTitle: {
        fontSize: 18,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        fontSize: 15,
    },
    rowInputs: {
        flexDirection: 'row',
        gap: 16,
    },
    submitButton: {
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    listContainer: {
        gap: 12,
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 16,
        marginBottom: 4,
    },
    serviceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 13,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    servicePrice: {
        fontSize: 18,
    },
    editBtn: {
        padding: 8,
    },
});
