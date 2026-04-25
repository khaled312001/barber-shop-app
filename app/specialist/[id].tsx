import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, getImageUrl } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { goBack } from '@/lib/navigation';

const PRIMARY = '#F4A460';

export default function SpecialistProfile() {
  const { id, salonId, salonName } = useLocalSearchParams<{ id: string; salonId: string; salonName: string }>();
  const theme = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  // Fetch salon data to get specialist details + services + reviews
  const { data: salon, isLoading } = useQuery({
    queryKey: ['salon-detail', salonId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/salons/${salonId}`);
      return res.json();
    },
  });

  const specialist = salon?.specialists?.find((s: any) => s.id === id);
  const salonServices = salon?.services || [];
  const salonReviews = (salon?.reviews || []).slice(0, 3);

  if (isLoading || !specialist) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <Pressable onPress={() => goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('specialist_profile') || 'Specialist Profile'}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: getImageUrl(specialist.image) }} style={styles.avatar} contentFit="cover" />
            <View style={[styles.onlineIndicator, { borderColor: theme.card }]} />
          </View>
          <Text style={[styles.name, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{specialist.name}</Text>
          <Text style={[styles.role, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>{specialist.role}</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <Ionicons key={s} name={s <= Math.round(specialist.rating) ? 'star' : 'star-outline'} size={18} color="#F59E0B" />
            ))}
            <Text style={[styles.ratingNum, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{specialist.rating}</Text>
          </View>
          <Text style={[styles.salonLink, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
            <Ionicons name="cut" size={14} color={PRIMARY} /> {salonName || salon?.name || 'Salon'}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <Pressable
              onPress={() => router.push({ pathname: '/booking/[id]', params: { id: salonId || salon?.id, specialistId: specialist?.id, specialistName: specialist?.name } })}
              style={[styles.actionBtn, { backgroundColor: PRIMARY }]}
            >
              <Ionicons name="calendar-outline" size={18} color="#181A20" />
              <Text style={[styles.actionText, { color: '#181A20', fontFamily: 'Urbanist_700Bold' }]}>{t('book_now') || 'Book Now'}</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push({ pathname: '/chat/[id]', params: { id: salonId || salon?.id, name: salonName || salon?.name, image: salon?.image || '' } })}
              style={[styles.actionBtnOutline, { borderColor: PRIMARY }]}
            >
              <Ionicons name="chatbubble-outline" size={18} color={PRIMARY} />
              <Text style={[styles.actionText, { color: PRIMARY, fontFamily: 'Urbanist_700Bold' }]}>{t('chat') || 'Chat'}</Text>
            </Pressable>
            <Pressable
              onPress={() => { if (salon?.phone) { const Linking = require('react-native').Linking; Linking.openURL(`tel:${salon.phone}`); } }}
              style={[styles.actionBtnSmall, { backgroundColor: `${PRIMARY}18` }]}
            >
              <Ionicons name="call-outline" size={20} color={PRIMARY} />
            </Pressable>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={[styles.statValue, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{specialist.rating}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{t('rating') || 'Rating'}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Ionicons name="people-outline" size={20} color="#3B82F6" />
            <Text style={[styles.statValue, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>120+</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{t('clients') || 'Clients'}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Ionicons name="ribbon-outline" size={20} color="#10B981" />
            <Text style={[styles.statValue, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>5+</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{t('years') || 'Years'}</Text>
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('services') || 'Services'}</Text>
          {salonServices.slice(0, 5).map((svc: any) => (
            <View key={svc.id} style={[styles.serviceRow, { borderBottomColor: theme.divider }]}>
              <View style={[styles.serviceIcon, { backgroundColor: `${PRIMARY}15` }]}>
                <Ionicons name="cut" size={16} color={PRIMARY} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.serviceName, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{svc.name}</Text>
                <Text style={[styles.serviceDuration, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{svc.duration}</Text>
              </View>
              <Text style={[styles.servicePrice, { color: PRIMARY, fontFamily: 'Urbanist_700Bold' }]}>CHF {svc.price}</Text>
            </View>
          ))}
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('reviews') || 'Reviews'}</Text>
          {salonReviews.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t('no_reviews') || 'No reviews yet'}</Text>
          ) : (
            salonReviews.map((r: any) => (
              <View key={r.id} style={[styles.reviewCard, { backgroundColor: theme.card }]}>
                <View style={styles.reviewHeader}>
                  <Image source={{ uri: getImageUrl(r.userImage) }} style={styles.reviewAvatar} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reviewName, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{r.userName}</Text>
                    <View style={{ flexDirection: 'row', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Ionicons key={s} name={s <= r.rating ? 'star' : 'star-outline'} size={12} color="#F59E0B" />
                      ))}
                    </View>
                  </View>
                  <Text style={[styles.reviewDate, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>{r.date}</Text>
                </View>
                <Text style={[styles.reviewText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{r.comment}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Book Button */}
      <View style={[styles.bottomBar, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 12, backgroundColor: theme.background }]}>
        <Pressable
          onPress={() => router.push({ pathname: '/booking/[id]', params: { id: salonId || salon?.id, specialistId: specialist?.id, specialistName: specialist?.name } })}
          style={({ pressed }) => [styles.bookBtn, { backgroundColor: PRIMARY, opacity: pressed ? 0.9 : 1 }]}
        >
          <Ionicons name="calendar" size={20} color="#181A20" />
          <Text style={[styles.bookBtnText, { fontFamily: 'Urbanist_700Bold' }]}>
            {t('book_with') || 'Book with'} {specialist.name.split(' ')[0]}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 18, textAlign: 'center' },
  profileCard: { marginHorizontal: 20, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#F4A460' },
  onlineIndicator: { position: 'absolute', bottom: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#10B981', borderWidth: 3 },
  name: { fontSize: 24, marginBottom: 4 },
  role: { fontSize: 15, marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  ratingNum: { fontSize: 16, marginLeft: 4 },
  salonLink: { fontSize: 14, marginBottom: 20 },
  actionsRow: { flexDirection: 'row', gap: 8, width: '100%' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14 },
  actionBtnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5 },
  actionBtnSmall: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: 6 },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 12 },
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, marginBottom: 12 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  serviceIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  serviceName: { fontSize: 15, marginBottom: 2 },
  serviceDuration: { fontSize: 12 },
  servicePrice: { fontSize: 16 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  reviewCard: { borderRadius: 14, padding: 16, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18 },
  reviewName: { fontSize: 14, marginBottom: 2 },
  reviewDate: { fontSize: 11 },
  reviewText: { fontSize: 13, lineHeight: 20 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  bookBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, borderRadius: 28 },
  bookBtnText: { fontSize: 16, color: '#181A20' },
});
