import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { DEFAULT_AVATAR } from '@/constants/images';

export default function TopBarbersScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const topPad = Platform.OS === 'web' ? 24 : Math.max(insets.top, 24);

    const barbers = [
        { id: '1', name: 'James Wilson', role: 'Master Barber', rating: 4.9, reviews: 124, salon: 'Elite Cuts', image: DEFAULT_AVATAR },
        { id: '2', name: 'Michael Chen', role: 'Senior Stylist', rating: 4.8, reviews: 98, salon: 'The Grooming Lounge', image: DEFAULT_AVATAR },
        { id: '3', name: 'David Smith', role: 'Barber Specialist', rating: 4.7, reviews: 156, salon: 'Classic Barbershop', image: DEFAULT_AVATAR },
        { id: '4', name: 'Robert Davis', role: 'Beard Expert', rating: 4.9, reviews: 210, salon: 'Urban Gentlemen', image: DEFAULT_AVATAR },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { paddingTop: topPad }]}>
                <Pressable onPress={() => goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </Pressable>
                <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Top Specialists</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {barbers.map((barber) => (
                    <Pressable
                        key={barber.id}
                        style={({ pressed }) => [
                            styles.barberCard,
                            { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.9 : 1 }
                        ]}
                    >
                        <Image source={{ uri: barber.image }} style={styles.barberAvatar} contentFit="cover" />

                        <View style={styles.barberInfo}>
                            <Text style={[styles.barberName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{barber.name}</Text>
                            <Text style={[styles.barberRole, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>{barber.role}</Text>
                            <Text style={[styles.barberSalon, { color: theme.primary, fontFamily: 'Urbanist_600SemiBold' }]}>{barber.salon}</Text>
                        </View>

                        <View style={styles.ratingContainer}>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={16} color={theme.star} />
                                <Text style={[styles.ratingText, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{barber.rating}</Text>
                            </View>
                            <Text style={[styles.reviewsText, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>{barber.reviews} reviews</Text>
                        </View>
                    </Pressable>
                ))}
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
    },
    placeholder: {
        width: 40,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 8,
    },
    barberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    barberAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    barberInfo: {
        flex: 1,
        paddingHorizontal: 16,
    },
    barberName: {
        fontSize: 18,
        marginBottom: 4,
    },
    barberRole: {
        fontSize: 14,
        marginBottom: 4,
    },
    barberSalon: {
        fontSize: 13,
    },
    ratingContainer: {
        alignItems: 'flex-end',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    ratingText: {
        fontSize: 16,
    },
    reviewsText: {
        fontSize: 12,
    },
});
