import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { goBack } from '@/lib/navigation';
import { useTheme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { DEFAULT_AVATAR } from '@/constants/images';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn, getImageUrl } from '@/lib/query-client';

export default function TopBarbersScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { t, isRTL } = useLanguage();

    const topPad = Platform.OS === 'web' ? 24 : Math.max(insets.top, 24);

    // Fetch specialists from salons API and aggregate them
    const { data: salons = [], isLoading } = useQuery<any[]>({
        queryKey: ['/api/salons'],
        queryFn: getQueryFn({ on401: 'returnNull' }),
    });

    // Aggregate all specialists from all salons
    const barbers = React.useMemo(() => {
        const allSpecialists: any[] = [];
        salons.forEach((salon: any) => {
            (salon.specialists || []).forEach((sp: any) => {
                allSpecialists.push({
                    ...sp,
                    salonName: salon.name,
                    salonId: salon.id,
                });
            });
        });
        // Sort by rating descending
        return allSpecialists.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 20);
    }, [salons]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { paddingTop: topPad, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Pressable onPress={() => goBack()} style={styles.backBtn}>
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text} />
                </Pressable>
                <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('top_barbers')}</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>{t('loading') || 'Loading...'}</Text>
                ) : barbers.length === 0 ? (
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t('no_results')}</Text>
                ) : (
                    barbers.map((barber: any) => (
                        <View
                            key={barber.id}
                            style={[
                                styles.barberCard,
                                { backgroundColor: theme.card, borderColor: theme.border }
                            ]}
                        >
                            <Image source={{ uri: getImageUrl(barber.image) }} style={styles.barberAvatar} contentFit="cover" />

                            <View style={styles.barberInfo}>
                                <Text style={[styles.barberName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{barber.name}</Text>
                                <Text style={[styles.barberRole, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>{barber.role}</Text>
                                <Text style={[styles.barberSalon, { color: theme.primary, fontFamily: 'Urbanist_600SemiBold' }]}>{barber.salonName}</Text>
                            </View>

                            <View style={styles.ratingContainer}>
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" size={16} color={theme.star} />
                                    <Text style={[styles.ratingText, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{barber.rating?.toFixed(1) || '0.0'}</Text>
                                </View>
                            </View>
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
    },
    ratingText: {
        fontSize: 16,
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
});
