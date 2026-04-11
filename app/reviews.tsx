import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { goBack } from '@/lib/navigation';
import { useTheme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQueryFn, apiRequest, getImageUrl } from '@/lib/query-client';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function ReviewsScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { t, isRTL } = useLanguage();
    const { user } = useApp();
    const qc = useQueryClient();
    const { salonId, salonName } = useLocalSearchParams<{ salonId: string; salonName: string }>();

    const topPad = Platform.OS === 'web' ? 24 : Math.max(insets.top, 24);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [showForm, setShowForm] = useState(false);

    const { data: salon, isLoading } = useQuery<any>({
        queryKey: [`/api/salons/${salonId}`],
        queryFn: getQueryFn({ on401: 'returnNull' }),
        enabled: !!salonId,
    });

    const reviews = salon?.reviews ?? [];

    const submitMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest('POST', '/api/reviews', {
                salonId,
                rating,
                comment,
            });
            return res.json();
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [`/api/salons/${salonId}`] });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setComment('');
            setRating(5);
            setShowForm(false);
            Alert.alert(t('success') || 'Success', t('review_submitted') || 'تم إرسال التقييم بنجاح!');
        },
        onError: (e: any) => Alert.alert(t('error') || 'Error', e.message || 'فشل إرسال التقييم'),
    });

    const renderStars = (count: number, interactive = false, size = 20) => (
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 4 }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                    key={star}
                    onPress={interactive ? () => setRating(star) : undefined}
                    disabled={!interactive}
                >
                    <Ionicons
                        name={star <= count ? 'star' : 'star-outline'}
                        size={size}
                        color={star <= count ? '#FFB800' : theme.textTertiary}
                    />
                </Pressable>
            ))}
        </View>
    );

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter((r: any) => r.rating === star).length,
        pct: reviews.length > 0 ? (reviews.filter((r: any) => r.rating === star).length / reviews.length) * 100 : 0,
    }));

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { paddingTop: topPad, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Pressable onPress={() => goBack()} style={styles.backBtn}>
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text} />
                </Pressable>
                <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                    {t('reviews') || 'التقييمات'}
                </Text>
                <View style={styles.placeholder} />
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={reviews}
                    keyExtractor={(item: any) => item.id}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View>
                            {/* Rating Summary */}
                            <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <View style={styles.summaryLeft}>
                                    <Text style={[styles.avgRating, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{avgRating}</Text>
                                    {renderStars(Math.round(Number(avgRating)))}
                                    <Text style={[styles.totalReviews, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
                                        {reviews.length} {t('reviews') || 'تقييم'}
                                    </Text>
                                </View>
                                <View style={styles.summaryRight}>
                                    {ratingDistribution.map(({ star, count, pct }) => (
                                        <View key={star} style={styles.distRow}>
                                            <Text style={[styles.distStar, { color: theme.textSecondary }]}>{star}</Text>
                                            <Ionicons name="star" size={12} color="#FFB800" />
                                            <View style={[styles.distBarBg, { backgroundColor: theme.inputBg }]}>
                                                <View style={[styles.distBarFill, { width: `${pct}%`, backgroundColor: theme.primary }]} />
                                            </View>
                                            <Text style={[styles.distCount, { color: theme.textTertiary }]}>{count}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Add Review Button */}
                            {user && !showForm && (
                                <Pressable
                                    onPress={() => setShowForm(true)}
                                    style={[styles.addReviewBtn, { backgroundColor: theme.primary }]}
                                >
                                    <Ionicons name="create-outline" size={20} color="#fff" />
                                    <Text style={[styles.addReviewText, { fontFamily: 'Urbanist_600SemiBold' }]}>
                                        {t('write_review') || 'اكتب تقييم'}
                                    </Text>
                                </Pressable>
                            )}

                            {/* Review Form */}
                            {showForm && (
                                <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                    <Text style={[styles.formLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>
                                        {t('your_rating') || 'تقييمك'}
                                    </Text>
                                    {renderStars(rating, true, 32)}
                                    <TextInput
                                        style={[styles.commentInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border, textAlign: isRTL ? 'right' : 'left' }]}
                                        placeholder={t('write_comment') || 'اكتب تعليقك هنا...'}
                                        placeholderTextColor={theme.textTertiary}
                                        value={comment}
                                        onChangeText={setComment}
                                        multiline
                                        numberOfLines={4}
                                    />
                                    <View style={styles.formActions}>
                                        <Pressable onPress={() => setShowForm(false)} style={[styles.cancelBtn, { borderColor: theme.border }]}>
                                            <Text style={[styles.cancelBtnText, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>
                                                {t('cancel') || 'إلغاء'}
                                            </Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => submitMutation.mutate()}
                                            style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                                            disabled={submitMutation.isPending}
                                        >
                                            {submitMutation.isPending ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Text style={[styles.submitBtnText, { fontFamily: 'Urbanist_600SemiBold' }]}>
                                                    {t('submit') || 'إرسال'}
                                                </Text>
                                            )}
                                        </Pressable>
                                    </View>
                                </View>
                            )}

                            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold', textAlign: isRTL ? 'right' : 'left' }]}>
                                {t('all_reviews') || 'جميع التقييمات'}
                            </Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubble-ellipses-outline" size={64} color={theme.textTertiary} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>
                                {t('no_reviews') || 'لا توجد تقييمات بعد'}
                            </Text>
                            <Text style={[styles.emptySubText, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>
                                {t('be_first_reviewer') || 'كن أول من يكتب تقييم!'}
                            </Text>
                        </View>
                    }
                    renderItem={({ item }: { item: any }) => (
                        <View style={[styles.reviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={[styles.reviewHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                <Image
                                    source={{ uri: item.userImage ? getImageUrl(item.userImage) : 'https://via.placeholder.com/40' }}
                                    style={styles.reviewAvatar}
                                    contentFit="cover"
                                />
                                <View style={[styles.reviewUserInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                                    <Text style={[styles.reviewUserName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                                        {item.userName}
                                    </Text>
                                    <Text style={[styles.reviewDate, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>
                                        {item.date || new Date(item.createdAt).toLocaleDateString('ar')}
                                    </Text>
                                </View>
                                <View style={{ marginLeft: isRTL ? 0 : 'auto', marginRight: isRTL ? 'auto' : 0 }}>
                                    {renderStars(item.rating, false, 14)}
                                </View>
                            </View>
                            {item.comment ? (
                                <Text style={[styles.reviewComment, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular', textAlign: isRTL ? 'right' : 'left' }]}>
                                    {item.comment}
                                </Text>
                            ) : null}
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 16 },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    title: { fontSize: 24 },
    placeholder: { width: 40 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 },
    summaryCard: { borderRadius: 20, borderWidth: 1, padding: 20, flexDirection: 'row', marginBottom: 20 },
    summaryLeft: { alignItems: 'center', justifyContent: 'center', paddingRight: 20, borderRightWidth: 1, borderRightColor: '#35383F' },
    avgRating: { fontSize: 48, marginBottom: 4 },
    totalReviews: { fontSize: 13, marginTop: 6 },
    summaryRight: { flex: 1, paddingLeft: 20, justifyContent: 'center', gap: 6 },
    distRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    distStar: { fontSize: 12, width: 12, textAlign: 'center' },
    distBarBg: { flex: 1, height: 6, borderRadius: 3 },
    distBarFill: { height: 6, borderRadius: 3 },
    distCount: { fontSize: 11, width: 20, textAlign: 'right' },
    addReviewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, marginBottom: 20 },
    addReviewText: { color: '#fff', fontSize: 16 },
    formCard: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 20, gap: 16 },
    formLabel: { fontSize: 16 },
    commentInput: { borderRadius: 14, borderWidth: 1, padding: 16, fontSize: 15, minHeight: 100, textAlignVertical: 'top' },
    formActions: { flexDirection: 'row', gap: 12 },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
    cancelBtnText: { fontSize: 15 },
    submitBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
    submitBtnText: { color: '#fff', fontSize: 15 },
    sectionTitle: { fontSize: 20, marginBottom: 16 },
    emptyContainer: { alignItems: 'center', paddingTop: 40, gap: 8 },
    emptyText: { fontSize: 18, marginTop: 12 },
    emptySubText: { fontSize: 14 },
    reviewCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
    reviewHeader: { alignItems: 'center', gap: 12, marginBottom: 10 },
    reviewAvatar: { width: 40, height: 40, borderRadius: 20 },
    reviewUserInfo: { flex: 1 },
    reviewUserName: { fontSize: 15 },
    reviewDate: { fontSize: 12, marginTop: 2 },
    reviewComment: { fontSize: 14, lineHeight: 22 },
});
