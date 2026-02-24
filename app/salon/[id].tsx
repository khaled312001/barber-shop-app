import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, Dimensions, FlatList, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');
type DetailTab = 'about' | 'services' | 'package' | 'gallery' | 'review';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  image: string;
  category: string;
}

interface Package {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  services: string[];
  image: string;
}

interface Review {
  id: string;
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  date: string;
}

interface Specialist {
  id: string;
  name: string;
  role: string;
  image: string;
  rating: number;
}

interface Salon {
  id: string;
  name: string;
  image: string;
  address: string;
  distance: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  openHours: string;
  phone: string;
  about: string;
  website: string;
  latitude: number;
  longitude: number;
  gallery: string[];
  services: Service[];
  packages: Package[];
  reviews: Review[];
  specialists: Specialist[];
}

function ReviewItem({ review }: { review: Review }) {
  const theme = useTheme();
  return (
    <View style={rstyles.reviewCard}>
      <View style={rstyles.reviewHeader}>
        <Image source={{ uri: review.userImage }} style={rstyles.reviewAvatar} contentFit="cover" />
        <View style={rstyles.reviewInfo}>
          <Text style={[rstyles.reviewName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{review.userName}</Text>
          <View style={rstyles.starsRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <Ionicons key={s} name={s <= review.rating ? 'star' : 'star-outline'} size={14} color={theme.star} />
            ))}
          </View>
        </View>
        <Text style={[rstyles.reviewDate, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>{review.date}</Text>
      </View>
      <Text style={[rstyles.reviewText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{review.comment}</Text>
    </View>
  );
}

function SpecialistItem({ specialist }: { specialist: Specialist }) {
  const theme = useTheme();
  return (
    <View style={rstyles.specialistCard}>
      <Image source={{ uri: specialist.image }} style={rstyles.specialistImage} contentFit="cover" />
      <Text style={[rstyles.specialistName, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]} numberOfLines={1}>{specialist.name}</Text>
      <Text style={[rstyles.specialistRole, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{specialist.role}</Text>
    </View>
  );
}

export default function SalonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { toggleBookmark, isBookmarked } = useApp();
  const [activeTab, setActiveTab] = useState<DetailTab>('about');
  const { data: salon, isLoading } = useQuery<Salon>({ queryKey: ['/api/salons', id], queryFn: getQueryFn({ on401: 'throw' }) });
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;
  const bottomPad = Platform.OS === 'web' ? webBottomInset : insets.bottom;

  const tabs: DetailTab[] = ['about', 'services', 'package', 'gallery', 'review'];

  if (isLoading || !salon) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const renderAbout = () => (
    <View style={dstyles.section}>
      <Text style={[dstyles.aboutText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{salon.about}</Text>
      <View style={[dstyles.infoRow, { borderTopColor: theme.divider }]}>
        <View style={dstyles.infoItem}>
          <Ionicons name="time-outline" size={18} color={theme.primary} />
          <Text style={[dstyles.infoLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>Working Hours</Text>
          <Text style={[dstyles.infoValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{salon.openHours}</Text>
        </View>
        <View style={dstyles.infoItem}>
          <Ionicons name="call-outline" size={18} color={theme.primary} />
          <Text style={[dstyles.infoLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>Phone</Text>
          <Text style={[dstyles.infoValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{salon.phone}</Text>
        </View>
      </View>
      <Text style={[dstyles.subHeader, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Our Specialists</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
        {(salon.specialists || []).map(sp => <SpecialistItem key={sp.id} specialist={sp} />)}
      </ScrollView>
    </View>
  );

  const renderServices = () => (
    <View style={dstyles.section}>
      {(salon.services || []).map(service => (
        <View key={service.id} style={[dstyles.serviceRow, { borderBottomColor: theme.divider }]}>
          <Image source={{ uri: service.image }} style={dstyles.serviceImage} contentFit="cover" />
          <View style={dstyles.serviceInfo}>
            <Text style={[dstyles.serviceName, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{service.name}</Text>
            <Text style={[dstyles.serviceDuration, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{service.duration}</Text>
          </View>
          <Text style={[dstyles.servicePrice, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>${service.price}</Text>
        </View>
      ))}
    </View>
  );

  const renderPackages = () => (
    <View style={dstyles.section}>
      {(salon.packages || []).map(pkg => (
        <View key={pkg.id} style={[dstyles.packageCard, { backgroundColor: theme.surface }]}>
          <Image source={{ uri: pkg.image }} style={dstyles.packageImage} contentFit="cover" />
          <View style={dstyles.packageInfo}>
            <Text style={[dstyles.packageName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{pkg.name}</Text>
            <Text style={[dstyles.packageServices, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
              {pkg.services.join(' + ')}
            </Text>
            <View style={dstyles.packagePricing}>
              <Text style={[dstyles.packagePrice, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>${pkg.price}</Text>
              <Text style={[dstyles.packageOriginal, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>${pkg.originalPrice}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderGallery = () => (
    <View style={dstyles.galleryGrid}>
      {(salon.gallery || []).map((img, i) => (
        <Image key={i} source={{ uri: img }} style={dstyles.galleryImage} contentFit="cover" />
      ))}
    </View>
  );

  const renderReviews = () => (
    <View style={dstyles.section}>
      <View style={dstyles.reviewSummary}>
        <View style={dstyles.reviewScore}>
          <Ionicons name="star" size={28} color={theme.star} />
          <Text style={[dstyles.scoreText, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{salon.rating}</Text>
        </View>
        <Text style={[dstyles.reviewTotal, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
          ({salon.reviewCount} reviews)
        </Text>
      </View>
      {(salon.reviews || []).map(r => <ReviewItem key={r.id} review={r} />)}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: salon.image }} style={styles.heroImage} contentFit="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', theme.background]} style={styles.heroGradient} />
          <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.topBtn, { backgroundColor: 'rgba(0,0,0,0.3)', opacity: pressed ? 0.6 : 1 }]}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <View style={styles.topRight}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleBookmark(salon.id); }}
                style={({ pressed }) => [styles.topBtn, { backgroundColor: 'rgba(0,0,0,0.3)', opacity: pressed ? 0.6 : 1 }]}
              >
                <Ionicons name={isBookmarked(salon.id) ? 'bookmark' : 'bookmark-outline'} size={22} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.namePriceRow}>
            <Text style={[styles.salonName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{salon.name}</Text>
            <View style={[styles.openBadge, { backgroundColor: salon.isOpen ? theme.success + '15' : theme.error + '15' }]}>
              <Text style={[styles.openText, { color: salon.isOpen ? theme.success : theme.error, fontFamily: 'Urbanist_600SemiBold' }]}>
                {salon.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location" size={16} color={theme.primary} />
            <Text style={[styles.address, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{salon.address}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={16} color={theme.star} />
            <Text style={[styles.rating, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{salon.rating}</Text>
            <Text style={[styles.reviewCount, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>({salon.reviewCount} reviews)</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.detailTabs}>
          {tabs.map(tab => (
            <Pressable
              key={tab}
              onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
              style={[styles.detailTab, activeTab === tab && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}
            >
              <Text style={[styles.detailTabText, { color: activeTab === tab ? theme.primary : theme.textTertiary, fontFamily: activeTab === tab ? 'Urbanist_700Bold' : 'Urbanist_500Medium' }]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 24, paddingBottom: 120 }}>
          {activeTab === 'about' && renderAbout()}
          {activeTab === 'services' && renderServices()}
          {activeTab === 'package' && renderPackages()}
          {activeTab === 'gallery' && renderGallery()}
          {activeTab === 'review' && renderReviews()}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 12, backgroundColor: theme.background }]}>
        <Pressable
          onPress={() => router.push({ pathname: '/booking/[id]', params: { id: salon.id } })}
          style={({ pressed }) => [styles.bookBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}
        >
          <Text style={[styles.bookBtnText, { fontFamily: 'Urbanist_700Bold' }]}>Book Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { position: 'relative' },
  heroImage: { width: '100%', height: 300 },
  heroGradient: { position: 'absolute', inset: 0 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  topBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topRight: { flexDirection: 'row', gap: 8 },
  infoSection: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  namePriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  salonName: { fontSize: 26, flex: 1 },
  openBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  openText: { fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  address: { fontSize: 14 },
  rating: { fontSize: 14 },
  reviewCount: { fontSize: 13 },
  detailTabs: { paddingHorizontal: 24, gap: 24, borderBottomWidth: 1, borderBottomColor: 'transparent', marginBottom: 16 },
  detailTab: { paddingBottom: 12 },
  detailTabText: { fontSize: 16 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  bookBtn: { height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  bookBtnText: { fontSize: 16, color: '#fff' },
});

const dstyles = StyleSheet.create({
  section: { gap: 16 },
  aboutText: { fontSize: 14, lineHeight: 22 },
  infoRow: { flexDirection: 'row', gap: 16, paddingTop: 16, borderTopWidth: 1, marginTop: 8 },
  infoItem: { flex: 1, gap: 4 },
  infoLabel: { fontSize: 12 },
  infoValue: { fontSize: 14 },
  subHeader: { fontSize: 18, marginTop: 8 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  serviceImage: { width: 56, height: 56, borderRadius: 12 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, marginBottom: 2 },
  serviceDuration: { fontSize: 13 },
  servicePrice: { fontSize: 18 },
  packageCard: { flexDirection: 'row', borderRadius: 16, overflow: 'hidden', gap: 12 },
  packageImage: { width: 100, height: 100 },
  packageInfo: { flex: 1, paddingVertical: 12, paddingRight: 12 },
  packageName: { fontSize: 16, marginBottom: 4 },
  packageServices: { fontSize: 12, marginBottom: 8 },
  packagePricing: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  packagePrice: { fontSize: 18 },
  packageOriginal: { fontSize: 14, textDecorationLine: 'line-through' },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  galleryImage: { width: (width - 56) / 2, height: 150, borderRadius: 12 },
  reviewSummary: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  reviewScore: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scoreText: { fontSize: 24 },
  reviewTotal: { fontSize: 14 },
});

const rstyles = StyleSheet.create({
  reviewCard: { marginBottom: 8 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 44, height: 44, borderRadius: 22 },
  reviewInfo: { flex: 1 },
  reviewName: { fontSize: 15, marginBottom: 2 },
  starsRow: { flexDirection: 'row', gap: 2 },
  reviewDate: { fontSize: 12 },
  reviewText: { fontSize: 14, lineHeight: 20 },
  specialistCard: { width: 100, alignItems: 'center', gap: 6 },
  specialistImage: { width: 80, height: 80, borderRadius: 40 },
  specialistName: { fontSize: 13, textAlign: 'center' },
  specialistRole: { fontSize: 11, textAlign: 'center' },
});
