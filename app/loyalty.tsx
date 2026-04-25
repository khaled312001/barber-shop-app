import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { goBack } from '@/lib/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/query-client';

export default function LoyaltyScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { user } = useApp();
    const { t, isRTL } = useLanguage();
    const qc = useQueryClient();

    const topPad = Platform.OS === 'web' ? 24 : Math.max(insets.top, 24);

    const { data: loyaltyData, isLoading } = useQuery({
        queryKey: ['loyalty-wallet'],
        queryFn: async () => {
            const res = await apiRequest('GET', '/api/loyalty/my-transactions');
            return res.json();
        },
    });

    const currentPoints = loyaltyData?.points ?? user?.loyaltyPoints ?? 0;
    const transactions = loyaltyData?.transactions ?? [];

    const redeemMutation = useMutation({
        mutationFn: async (pts: number) => {
            const res = await apiRequest('POST', '/api/loyalty/redeem', { points: pts });
            return res.json();
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['loyalty-wallet'] });
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const msg = (() => { const s = t('redeem_success'); return s && s !== 'redeem_success' ? s : 'Reward redeemed successfully!'; })();
            if (Platform.OS === 'web') window.alert(msg);
            else Alert.alert(t('success') || 'Success', msg);
        },
        onError: (e: any) => {
            const msg = e?.message || t('failed_redeem') || 'Failed to redeem points';
            if (Platform.OS === 'web') window.alert(msg);
            else Alert.alert(t('error') || 'Error', msg);
        },
    });

    // Fallback-safe labels (never show raw translation keys)
    const fb = (key: string, fallback: string) => {
        const s = t(key as any);
        return s && s !== key ? s : fallback;
    };

    const REWARDS = [
        { id: '1', title: fb('free_hair_wash', 'Free Hair Wash'), points: 150, icon: 'water' as const, color: '#0EA5E9' },
        { id: '2', title: fb('beard_trim_discount', '50% Off Beard Trim'), points: 300, icon: 'razor-double-edge' as const, color: '#8B5CF6' },
        { id: '3', title: fb('free_premium_haircut', 'Free Premium Haircut'), points: 800, icon: 'content-cut' as const, color: '#F4A460' },
        { id: '4', title: fb('vip_barber_choice', 'VIP Barber Choice'), points: 1500, icon: 'crown' as const, color: '#FFC107' },
    ];

    const handleRedeem = (item: typeof REWARDS[0]) => {
        if (currentPoints < item.points) return;
        const title = fb('redeem_reward', 'Redeem Reward');
        const msg = fb('redeem_confirm_msg', `Redeem ${item.points} points for: ${item.title}?`)
            .replace('{points}', String(item.points))
            .replace('{title}', item.title);
        // Web: use window.confirm (Alert.alert doesn't render on web reliably)
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${msg}`)) {
                redeemMutation.mutate(item.points);
            }
            return;
        }
        Alert.alert(title, msg, [
            { text: t('cancel') || 'Cancel', style: 'cancel' },
            { text: t('confirm') || 'Confirm', onPress: () => redeemMutation.mutate(item.points) },
        ]);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { paddingTop: topPad, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Pressable onPress={() => goBack()} style={styles.backBtn}>
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text} />
                </Pressable>
                <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                    {t('loyalty_rewards') || 'محفظة النقاط'}
                </Text>
                <View style={styles.placeholder} />
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
            ) : (
                <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>

                    {/* Points Card */}
                    <View style={[styles.pointsCard, { backgroundColor: theme.primary }]}>
                        <Text style={[styles.pointsLabel, { fontFamily: 'Urbanist_500Medium' }]}>
                            {fb('points_balance', 'Your Points Balance')}
                        </Text>
                        <View style={styles.pointsRow}>
                            <Ionicons name="star" size={36} color="#FFE169" />
                            <Text style={[styles.pointsValue, { fontFamily: 'Urbanist_700Bold' }]}>{currentPoints}</Text>
                        </View>
                        <Text style={[styles.pointsDesc, { fontFamily: 'Urbanist_400Regular' }]}>
                            {fb('earn_points_info', 'Earn 10 points for every $1 spent on services')}
                        </Text>
                        {/* Mini progress to next reward */}
                        <View style={styles.progressRow}>
                            <Text style={styles.progressText}>
                                {currentPoints < 150
                                    ? fb('points_to_next', `${150 - currentPoints} points to next reward`).replace('{n}', String(150 - currentPoints))
                                    : fb('rewards_available', 'You have rewards available!')}
                            </Text>
                        </View>
                    </View>

                    {/* Rewards */}
                    <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold', textAlign: isRTL ? 'right' : 'left' }]}>
                        {t('available_rewards') || 'المكافآت المتاحة'}
                    </Text>
                    <View style={styles.rewardsList}>
                        {REWARDS.map((reward) => {
                            const locked = currentPoints < reward.points;
                            return (
                                <View
                                    key={reward.id}
                                    style={[
                                        styles.rewardItem,
                                        { backgroundColor: theme.surface, borderColor: locked ? theme.border : theme.primary + '55', flexDirection: isRTL ? 'row-reverse' : 'row' },
                                        locked && { opacity: 0.6 }
                                    ]}
                                >
                                    <View style={[styles.rewardIcon, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}>
                                        <Ionicons name="gift-outline" size={28} color={locked ? theme.textTertiary : theme.primary} />
                                    </View>
                                    <View style={[styles.rewardInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                                        <Text style={[styles.rewardTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{reward.title}</Text>
                                        <Text style={[styles.rewardPoints, { color: theme.primary, fontFamily: 'Urbanist_600SemiBold' }]}>
                                            {reward.points} {t('points') || 'نقطة'}
                                        </Text>
                                    </View>
                                    <Pressable
                                        onPress={() => handleRedeem(reward)}
                                        style={[styles.redeemBtn, { backgroundColor: locked ? theme.inputBg : theme.primary }]}
                                        disabled={locked || redeemMutation.isPending}
                                    >
                                        {locked
                                            ? <Ionicons name="lock-closed" size={16} color={theme.textTertiary} />
                                            : <Text style={[styles.redeemText, { fontFamily: 'Urbanist_600SemiBold' }]}>{t('redeem') || 'استبدل'}</Text>
                                        }
                                    </Pressable>
                                </View>
                            );
                        })}
                    </View>

                    {/* Transaction History */}
                    {transactions.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold', textAlign: isRTL ? 'right' : 'left', marginTop: 24 }]}>
                                {fb('transactions_history', 'Transactions History')}
                            </Text>
                            {transactions.slice(0, 10).map((txn: any) => (
                                <View key={txn.id} style={[styles.txnRow, { backgroundColor: theme.surface, borderColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <View style={[styles.txnIcon, { backgroundColor: txn.points > 0 ? '#10B98120' : '#EF444420' }]}>
                                        <Ionicons
                                            name={txn.points > 0 ? 'add-circle' : 'remove-circle'}
                                            size={20}
                                            color={txn.points > 0 ? '#10B981' : '#EF4444'}
                                        />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }}>
                                        <Text style={[styles.txnDesc, { color: theme.text }]}>{txn.description || txn.type}</Text>
                                        <Text style={[styles.txnDate, { color: theme.textSecondary }]}>
                                            {new Date(txn.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <Text style={[styles.txnPoints, { color: txn.points > 0 ? '#10B981' : '#EF4444' }]}>
                                        {txn.points > 0 ? '+' : ''}{txn.points}
                                    </Text>
                                </View>
                            ))}
                        </>
                    )}

                </ScrollView>
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
    pointsCard: { borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 20 },
    pointsLabel: { color: '#FFFFFF80', fontSize: 16, marginBottom: 8 },
    pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    pointsValue: { color: '#fff', fontSize: 48 },
    pointsDesc: { color: '#FFFFFFcc', fontSize: 14, textAlign: 'center', marginBottom: 12 },
    progressRow: { backgroundColor: '#ffffff22', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
    progressText: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 12, textAlign: 'center' },
    sectionTitle: { fontSize: 20, marginBottom: 16 },
    rewardsList: { gap: 12 },
    rewardItem: { alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
    rewardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#00000008', alignItems: 'center', justifyContent: 'center' },
    rewardInfo: { flex: 1 },
    rewardTitle: { fontSize: 16, marginBottom: 4 },
    rewardPoints: { fontSize: 14 },
    redeemBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 80, alignItems: 'center' },
    redeemText: { color: '#fff', fontSize: 14 },
    txnRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
    txnIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    txnDesc: { fontFamily: 'Urbanist_600SemiBold', fontSize: 13, marginBottom: 2 },
    txnDate: { fontFamily: 'Urbanist_400Regular', fontSize: 11 },
    txnPoints: { fontFamily: 'Urbanist_700Bold', fontSize: 16 },
});
