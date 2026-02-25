import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
import { DEFAULT_AVATAR } from '@/constants/images';

export default function AdminStaffScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // Simulating staff data fetch
    const { data: staff = [], isLoading } = useQuery({
        queryKey: ['/api/staff'],
        queryFn: getQueryFn({ on401: 'throw' }),
        initialData: [
            { id: '1', name: 'John Doe', role: 'Senior Barber', rating: 4.9, bookings: 120, image: DEFAULT_AVATAR },
            { id: '2', name: 'Mike Smith', role: 'Barber', rating: 4.7, bookings: 85, image: DEFAULT_AVATAR },
            { id: '3', name: 'Alen Walker', role: 'Junior Barber', rating: 4.5, bookings: 40, image: DEFAULT_AVATAR },
        ]
    });

    const [isAdding, setIsAdding] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', role: '', email: '' });

    const handleAddStaff = () => {
        if (!newStaff.name || !newStaff.role) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsAdding(false);
        setNewStaff({ name: '', role: '', email: '' });
    };

    const topPad = Platform.OS === 'web' ? 24 : Math.max(insets.top, 24);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { paddingTop: topPad }]}>
                <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Salon Staff</Text>
                <Pressable
                    onPress={() => setIsAdding(!isAdding)}
                    style={[styles.addButton, { backgroundColor: theme.primary }]}
                >
                    <Ionicons name={isAdding ? "close" : "person-add"} size={18} color="#fff" />
                    <Text style={[styles.addButtonText, { fontFamily: 'Urbanist_600SemiBold' }]}>
                        {isAdding ? 'Cancel' : 'Add Staff'}
                    </Text>
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {isAdding && (
                    <View style={[styles.addForm, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.formTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Add New Staff Member</Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>Full Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                                placeholder="e.g. David Brown"
                                placeholderTextColor={theme.textTertiary}
                                value={newStaff.name}
                                onChangeText={(t) => setNewStaff({ ...newStaff, name: t })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>Email (for login)</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                                placeholder="david@salon.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor={theme.textTertiary}
                                value={newStaff.email}
                                onChangeText={(t) => setNewStaff({ ...newStaff, email: t })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>Role</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                                placeholder="e.g. Master Barber"
                                placeholderTextColor={theme.textTertiary}
                                value={newStaff.role}
                                onChangeText={(t) => setNewStaff({ ...newStaff, role: t })}
                            />
                        </View>

                        <Pressable
                            onPress={handleAddStaff}
                            style={[styles.submitButton, { backgroundColor: theme.primary, opacity: (!newStaff.name || !newStaff.role) ? 0.5 : 1 }]}
                            disabled={!newStaff.name || !newStaff.role}
                        >
                            <Text style={[styles.submitButtonText, { fontFamily: 'Urbanist_700Bold' }]}>Save Staff Member</Text>
                        </Pressable>
                    </View>
                )}

                {isLoading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : (
                    <View style={styles.gridContainer}>
                        {staff.map((person: any) => (
                            <View key={person.id} style={[styles.staffCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <View style={styles.staffHeader}>
                                    <Image source={{ uri: person.image }} style={styles.avatar} contentFit="cover" />
                                    <View style={styles.staffInfo}>
                                        <Text style={[styles.staffName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{person.name}</Text>
                                        <Text style={[styles.staffRole, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>{person.role}</Text>
                                    </View>
                                    <Pressable style={styles.moreBtn}>
                                        <Ionicons name="ellipsis-vertical" size={20} color={theme.textSecondary} />
                                    </Pressable>
                                </View>

                                <View style={[styles.statsRow, { borderTopColor: theme.border }]}>
                                    <View style={styles.stat}>
                                        <Ionicons name="star" size={16} color={theme.star} />
                                        <Text style={[styles.statValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{person.rating}</Text>
                                        <Text style={[styles.statLabel, { color: theme.textTertiary, fontFamily: 'Urbanist_500Medium' }]}>Rating</Text>
                                    </View>
                                    <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                                    <View style={styles.stat}>
                                        <Ionicons name="calendar-outline" size={16} color={theme.primary} />
                                        <Text style={[styles.statValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{person.bookings}</Text>
                                        <Text style={[styles.statLabel, { color: theme.textTertiary, fontFamily: 'Urbanist_500Medium' }]}>Bookings</Text>
                                    </View>
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
    gridContainer: {
        gap: 16,
    },
    staffCard: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    staffHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    staffInfo: {
        flex: 1,
    },
    staffName: {
        fontSize: 18,
        marginBottom: 4,
    },
    staffRole: {
        fontSize: 14,
    },
    moreBtn: {
        padding: 4,
    },
    statsRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingVertical: 12,
    },
    stat: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    statDivider: {
        width: 1,
        height: '100%',
    },
    statValue: {
        fontSize: 15,
    },
    statLabel: {
        fontSize: 12,
    },
});
