import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { Image } from 'expo-image';
import { DEFAULT_AVATAR } from '@/constants/images';

export default function SalonReviewsScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [filter, setFilter] = useState('All');

    const topPad = Platform.OS === 'web' ? 24 : Math.max(insets.top, 24);

    const reviews = [
        { id: '1', user: 'Ali Ahmed', rating: 5, date: '2 days ago', text: 'Best haircut I have ever had! The barber was very professional and the salon is extremely clean.', image: DEFAULT_AVATAR },
        { id: '2', user: 'Omar Hassan', rating: 4, date: '1 week ago', text: 'Great service, but I had to wait 10 minutes past my appointment time. Otherwise, perfect.', image: DEFAULT_AVATAR },
        { id: '3', user: 'Ziad Tariq', rating: 5, date: '2 weeks ago', text: 'Fantastic fade and beard lineup. Highly recommended.', image: DEFAULT_AVATAR },
        { id: '4', user: 'Karim Mostafa', rating: 3, date: '1 month ago', text: 'Average experience. The cut was okay, but the music was a bit too loud for me.', image: DEFAULT_AVATAR },
    ];

    const filters = ['All', '5', '4', '3', '2', '1'];

    const filteredReviews = filter === 'All'
        ? reviews
        : reviews.filter(r => r.rating.toString() === filter);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { paddingTop: topPad }]}>
                <Pressable onPress={() => goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </Pressable>
                <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Reviews</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={[styles.summaryStats, { borderBottomColor: theme.border }]}>
                <Text style={[styles.averageRating, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>4.8</Text>
                <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <Ionicons key={i} name="star" size={20} color={theme.star} />
                    ))}
                </View>
                <Text style={[styles.totalReviews, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
                    Based on 124 reviews
                </Text>
            </View>

            <View style={[styles.filterScrollWrapper, { borderBottomColor: theme.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterDiv}>
                    {filters.map(f => (
                        <Pressable
                            key={f}
                            onPress={() => setFilter(f)}
                            style={[
                                styles.filterBadge,
                                {
                                    backgroundColor: filter === f ? theme.primary : 'transparent',
                                    borderColor: filter === f ? theme.primary : theme.primary + '50'
                                }
                            ]}
                        >
                            <View style={styles.filterContent}>
                                {f !== 'All' && <Ionicons name="star" size={14} color={filter === f ? '#fff' : theme.primary} style={{ marginRight: 4 }} />}
                                <Text style={[
                                    styles.filterText,
                                    {
                                        color: filter === f ? '#fff' : theme.primary,
                                        fontFamily: 'Urbanist_600SemiBold'
                                    }
                                ]}>{f === 'All' ? 'All Reviews' : f}</Text>
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {filteredReviews.length === 0 ? (
                    <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
                        No reviews found for this rating.
                    </Text>
                ) : (
                    filteredReviews.map((review) => (
                        <View key={review.id} style={[styles.reviewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <View style={styles.reviewHeader}>
                                <Image source={{ uri: review.image }} style={styles.reviewerAvatar} />
                                <View style={styles.reviewerInfo}>
                                    <Text style={[styles.reviewerName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{review.user}</Text>
                                    <Text style={[styles.reviewDate, { color: theme.textTertiary, fontFamily: 'Urbanist_500Medium' }]}>{review.date}</Text>
                                </View>
                                <View style={[styles.ratingBadge, { borderColor: theme.border }]}>
                                    <Ionicons name="star" size={12} color={theme.star} />
                                    <Text style={[styles.badgeText, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{review.rating}</Text>
                                </View>
                            </View>
                            <Text style={[styles.reviewText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
                                {review.text}
                            </Text>
                        </View>
                    ))
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
    summaryStats: {
        alignItems: 'center',
        paddingVertical: 24,
        borderBottomWidth: 1,
    },
    averageRating: {
        fontSize: 48,
        marginBottom: 8,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 8,
    },
    totalReviews: {
        fontSize: 14,
    },
    filterScrollWrapper: {
        borderBottomWidth: 1,
    },
    filterDiv: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 12,
    },
    filterBadge: {
        borderWidth: 1.5,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    filterContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterText: {
        fontSize: 14,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
    reviewCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    reviewerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    reviewerInfo: {
        flex: 1,
    },
    reviewerName: {
        fontSize: 16,
        marginBottom: 2,
    },
    reviewDate: {
        fontSize: 12,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 14,
    },
    reviewText: {
        fontSize: 14,
        lineHeight: 22,
    }
});
