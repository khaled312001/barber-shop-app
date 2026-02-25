import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/query-client';

export default function OffersScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const topPad = Platform.OS === 'web' ? 24 : Math.max(insets.top, 24);

    const { data: coupons, isLoading } = useQuery<any[]>({
        queryKey: ['/api/coupons'],
        queryFn: getQueryFn({ on401: 'returnNull' }),
    });

    const copyCode = async (code: string) => {
        await Clipboard.setStringAsync(code);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Toast notification could go here
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { paddingTop: topPad }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </Pressable>
                <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Special Offers</Text>
                <View style={styles.placeholder} />
            </View>

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {coupons && coupons.length > 0 ? (
                        coupons.map((coupon) => (
                            <View key={coupon.id} style={[styles.offerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <View style={styles.offerIconContainer}>
                                    <Ionicons
                                        name={coupon.type === 'percentage' ? 'pricetag' : 'gift'}
                                        size={32}
                                        color={theme.primary}
                                    />
                                </View>
                                <View style={styles.offerInfo}>
                                    <Text style={[styles.offerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                                        {coupon.type === 'percentage' ? `${coupon.discount}% Off` : `$${coupon.discount} Discount`}
                                    </Text>
                                    <View style={{ height: 8 }} />
                                    <Text style={[styles.offerDesc, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
                                        Use code {coupon.code} to get a {coupon.type === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`} discount on your next booking!
                                    </Text>
                                    <Text style={[styles.offerValid, { color: theme.textTertiary, fontFamily: 'Urbanist_500Medium' }]}>
                                        Valid until: {coupon.expiryDate}
                                    </Text>
                                </View>

                                <View style={[styles.codeSection, { borderTopColor: theme.border, backgroundColor: theme.inputBg }]}>
                                    <Text style={[styles.codeText, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{coupon.code}</Text>
                                    <Pressable
                                        style={[styles.copyBtn, { backgroundColor: theme.primary }]}
                                        onPress={() => copyCode(coupon.code)}
                                    >
                                        <Text style={[styles.copyBtnText, { fontFamily: 'Urbanist_600SemiBold' }]}>Copy Code</Text>
                                    </Pressable>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="ticket-outline" size={80} color={theme.textTertiary} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>No offers available right now.</Text>
                            <Text style={[styles.emptySub, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>Check back later for special discounts!</Text>
                        </View>
                    )}
                </ScrollView>
            )}
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
    offerCard: {
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 20,
        overflow: 'hidden',
    },
    offerIconContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    offerInfo: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        alignItems: 'center',
    },
    offerTitle: {
        fontSize: 20,
        marginBottom: 8,
        textAlign: 'center',
    },
    offerDesc: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 20,
    },
    offerValid: {
        fontSize: 12,
    },
    codeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
    },
    codeText: {
        fontSize: 18,
        letterSpacing: 2,
    },
    copyBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    copyBtnText: {
        color: '#fff',
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 20,
        marginTop: 20,
        textAlign: 'center',
    },
    emptySub: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});
