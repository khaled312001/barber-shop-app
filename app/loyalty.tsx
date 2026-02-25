import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoyaltyScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useApp();
    const { t, isRTL } = useLanguage();

    const topPad = Platform.OS === 'web' ? 24 : Math.max(insets.top, 24);

    const rewards = [
        { id: '1', title: t('free_hair_wash') || 'Free Hair Wash', points: 150, locked: (user?.loyaltyPoints || 0) < 150 },
        { id: '2', title: t('beard_trim_discount') || '50% Off Beard Trim', points: 300, locked: (user?.loyaltyPoints || 0) < 300 },
        { id: '3', title: t('free_premium_haircut') || 'Free Premium Haircut', points: 800, locked: (user?.loyaltyPoints || 0) < 800 },
        { id: '4', title: t('vip_barber_choice') || 'VIP Barber Choice', points: 1500, locked: (user?.loyaltyPoints || 0) < 1500 },
    ];

    const handleRedeem = (item: any) => {
        if (item.locked) return;

        Alert.alert(t('redeem_reward') || 'Redeem Reward', `${t('confirm_redeem') || 'Are you sure you want to redeem'}: ${item.title}?`, [
            { text: t('cancel'), style: 'cancel' },
            {
                text: t('confirm') || 'Confirm',
                onPress: () => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert(t('success') || 'Success', `${t('you_redeemed') || 'You redeemed'}: ${item.title}`);
                }
            }
        ]);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { paddingTop: topPad, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Pressable onPress={() => goBack()} style={styles.backBtn}>
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text} />
                </Pressable>
                <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('loyalty_rewards')}</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Points Card */}
                <View style={[styles.pointsCard, { backgroundColor: theme.primary }]}>
                    <Text style={[styles.pointsLabel, { fontFamily: 'Urbanist_500Medium' }]}>{t('points_balance')}</Text>
                    <View style={styles.pointsRow}>
                        <Ionicons name="star" size={36} color="#FFE169" />
                        <Text style={[styles.pointsValue, { fontFamily: 'Urbanist_700Bold' }]}>{user?.loyaltyPoints || 0}</Text>
                    </View>
                    <Text style={[styles.pointsDesc, { fontFamily: 'Urbanist_400Regular' }]}>
                        {t('earn_points_info') || 'Earn points for every booking!'}
                    </Text>
                </View>

                {/* Info Text */}
                <Text style={[styles.infoText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular', textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('loyalty_info') || 'Earn 10 points for every $1 spent on salon services.'}
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold', textAlign: isRTL ? 'right' : 'left' }]}>{t('available_rewards') || 'Available Rewards'}</Text>

                {/* Rewards List */}
                <View style={styles.rewardsList}>
                    {rewards.map((reward) => (
                        <View
                            key={reward.id}
                            style={[
                                styles.rewardItem,
                                { backgroundColor: theme.surface, borderColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
                                reward.locked && { opacity: 0.6 }
                            ]}
                        >
                            <View style={[styles.rewardIcon, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}>
                                <Ionicons name="gift-outline" size={28} color={reward.locked ? theme.textTertiary : theme.primary} />
                            </View>

                            <View style={[styles.rewardInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                                <Text style={[styles.rewardTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{reward.title}</Text>
                                <Text style={[styles.rewardPoints, { color: theme.primary, fontFamily: 'Urbanist_600SemiBold' }]}>
                                    {reward.points} {t('points')}
                                </Text>
                            </View>

                            <Pressable
                                onPress={() => handleRedeem(reward)}
                                style={[
                                    styles.redeemBtn,
                                    { backgroundColor: reward.locked ? theme.inputBg : theme.primary }
                                ]}
                                disabled={reward.locked}
                            >
                                {reward.locked ? (
                                    <Ionicons name="lock-closed" size={16} color={theme.textTertiary} />
                                ) : (
                                    <Text style={[styles.redeemText, { fontFamily: 'Urbanist_600SemiBold' }]}>{t('redeem')}</Text>
                                )}
                            </Pressable>
                        </View>
                    ))}
                </View>

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
    pointsCard: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
    },
    pointsLabel: {
        color: '#FFFFFF80',
        fontSize: 16,
        marginBottom: 8,
    },
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    pointsValue: {
        color: '#fff',
        fontSize: 48,
    },
    pointsDesc: {
        color: '#FFFFFFcc',
        fontSize: 14,
        textAlign: 'center',
    },
    infoText: {
        fontSize: 14,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        marginBottom: 16,
    },
    rewardsList: {
        gap: 12,
    },
    rewardItem: {
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    rewardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#00000008', // very subtle dark overlay
        alignItems: 'center',
        justifyContent: 'center',
    },
    rewardInfo: {
        flex: 1,
    },
    rewardTitle: {
        fontSize: 16,
        marginBottom: 4,
    },
    rewardPoints: {
        fontSize: 14,
    },
    redeemBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        minWidth: 80,
        alignItems: 'center',
    },
    redeemText: {
        color: '#fff',
        fontSize: 14,
    },
});
