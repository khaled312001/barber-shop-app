import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Platform, FlatList, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn, getImageUrl } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DEFAULT_AVATAR } from '@/constants/images';
import { categories } from '@/constants/data';
import { getUserLocation, sortByNearest, type Coords } from '@/lib/geo';

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
  services?: any[];
  specialists?: any[];
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.56, 240); // smaller than before (0.7)
const TOP_SALON_WIDTH = Math.min(width * 0.44, 200);

const hapticLight = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

function CategoryIcon({ iconName, iconSet, color, size }: { iconName: string; iconSet: string; color: string; size: number }) {
  if (iconSet === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
  }
  return <MaterialIcons name={iconName as any} size={size} color={color} />;
}

// Featured salon — large card at top
function FeaturedSalonCard({ salon, onBookmark, isBookmarked, t }: { salon: Salon; onBookmark: () => void; isBookmarked: boolean; t: (k: string) => string }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/salon/[id]', params: { id: salon.id } })}
      style={({ pressed }) => [
        styles.featuredCard,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.96 : 1 },
      ]}
    >
      <View style={styles.featuredImageWrap}>
        <Image source={{ uri: getImageUrl(salon.image) }} style={styles.featuredImage} contentFit="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.featuredGradient}
        />
        <View style={styles.featuredBadges}>
          <View style={[styles.featuredBadge, { backgroundColor: '#F4A460' }]}>
            <Ionicons name="flame" size={10} color="#fff" />
            <Text style={styles.featuredBadgeText}>FEATURED</Text>
          </View>
          <View style={[styles.featuredBadge, { backgroundColor: salon.isOpen ? '#10B981' : '#EF4444' }]}>
            <View style={styles.dotWhite} />
            <Text style={styles.featuredBadgeText}>{salon.isOpen ? (t('open') || 'Open') : (t('closed') || 'Closed')}</Text>
          </View>
        </View>
        <Pressable
          onPress={(e) => { e.stopPropagation(); hapticLight(); onBookmark(); }}
          style={styles.featuredBookmark}
        >
          <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={16} color="#fff" />
        </Pressable>
        <View style={styles.featuredInfo}>
          <Text style={styles.featuredName} numberOfLines={1}>{salon.name}</Text>
          <View style={styles.featuredMeta}>
            <View style={styles.featuredMetaItem}>
              <Ionicons name="star" size={12} color="#FFC107" />
              <Text style={styles.featuredMetaText}>{salon.rating}</Text>
              <Text style={[styles.featuredMetaText, { opacity: 0.7 }]}>({salon.reviewCount})</Text>
            </View>
            <View style={styles.featuredMetaItem}>
              <Ionicons name="location" size={12} color="#F4A460" />
              <Text style={styles.featuredMetaText}>{salon.distance}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// Compact salon card — horizontal scroll
function TopSalonCard({ salon, onBookmark, isBookmarked, t }: { salon: Salon; onBookmark: () => void; isBookmarked: boolean; t: (k: string) => string }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/salon/[id]', params: { id: salon.id } })}
      style={({ pressed }) => [
        styles.topSalonCard,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.95 : 1 },
      ]}
    >
      <View style={styles.topSalonImgWrap}>
        <Image source={{ uri: getImageUrl(salon.image) }} style={styles.topSalonImg} contentFit="cover" />
        <Pressable
          onPress={(e) => { e.stopPropagation(); hapticLight(); onBookmark(); }}
          style={[styles.topSalonBookmark, { backgroundColor: isBookmarked ? theme.primary : 'rgba(0,0,0,0.5)' }]}
        >
          <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={13} color="#fff" />
        </Pressable>
        <View style={[styles.topSalonStatus, { backgroundColor: salon.isOpen ? '#10B981' : '#EF4444' }]}>
          <View style={styles.dotWhite} />
        </View>
      </View>
      <View style={styles.topSalonBody}>
        <Text style={[styles.topSalonName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>{salon.name}</Text>
        <View style={styles.topSalonMetaRow}>
          <Ionicons name="star" size={11} color="#FFC107" />
          <Text style={[styles.topSalonRating, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{salon.rating}</Text>
          <Text style={[styles.topSalonReviews, { color: theme.textTertiary }]}>({salon.reviewCount})</Text>
          <View style={[styles.topSalonDot, { backgroundColor: theme.textTertiary }]} />
          <Text style={[styles.topSalonDistance, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]} numberOfLines={1}>
            {salon.distance}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// Nearby salon row — compact list item
function NearbySalonRow({ salon, onBookmark, isBookmarked, t }: { salon: Salon; onBookmark: () => void; isBookmarked: boolean; t: (k: string) => string }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/salon/[id]', params: { id: salon.id } })}
      style={({ pressed }) => [
        styles.nearbyCard,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.95 : 1 },
      ]}
    >
      <Image source={{ uri: getImageUrl(salon.image) }} style={styles.nearbyImage} contentFit="cover" />
      <View style={styles.nearbyInfo}>
        <Text style={[styles.nearbyName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>{salon.name}</Text>
        <View style={styles.nearbyAddrRow}>
          <Ionicons name="location-outline" size={11} color={theme.textTertiary} />
          <Text style={[styles.nearbyAddr, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]} numberOfLines={1}>{salon.address}</Text>
        </View>
        <View style={styles.nearbyMeta}>
          <View style={styles.nearbyChip}>
            <Ionicons name="star" size={10} color="#FFC107" />
            <Text style={[styles.chipText, { color: theme.text }]}>{salon.rating}</Text>
          </View>
          <View style={[styles.nearbyChip, { backgroundColor: salon.isOpen ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', borderColor: salon.isOpen ? '#10B98140' : '#EF444440' }]}>
            <View style={[styles.statusDot, { backgroundColor: salon.isOpen ? '#10B981' : '#EF4444' }]} />
            <Text style={[styles.chipText, { color: salon.isOpen ? '#10B981' : '#EF4444' }]}>
              {salon.isOpen ? (t('open') || 'Open') : (t('closed') || 'Closed')}
            </Text>
          </View>
          <View style={[styles.nearbyChip, { backgroundColor: 'rgba(244,164,96,0.15)', borderColor: 'rgba(244,164,96,0.3)' }]}>
            <Ionicons name="location" size={10} color="#F4A460" />
            <Text style={[styles.chipText, { color: '#F4A460' }]}>{salon.distance}</Text>
          </View>
        </View>
      </View>
      <Pressable
        onPress={(e) => { e.stopPropagation(); hapticLight(); onBookmark(); }}
        style={[styles.nearbyBookmark, { backgroundColor: isBookmarked ? theme.primary + '22' : 'transparent', borderColor: isBookmarked ? theme.primary + '40' : theme.border }]}
      >
        <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={16} color={isBookmarked ? theme.primary : theme.textTertiary} />
      </Pressable>
    </Pressable>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, toggleBookmark, isBookmarked, bookings } = useApp();
  const { t, isRTL } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userLocation, setUserLocation] = useState<Coords | null>(null);
  const [locationState, setLocationState] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const categoryName = selectedCategory === 'all' ? 'all' : categories.find(c => c.id === selectedCategory)?.name || 'all';
  const salonUrl = `/api/salons${categoryName !== 'all' ? `?category=${encodeURIComponent(categoryName)}` : ''}`;

  const { data: salons = [] } = useQuery<Salon[]>({
    queryKey: [salonUrl],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  const { data: discountSalons = [] } = useQuery<any[]>({
    queryKey: ['/api/salons-with-discounts'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  const webTopInset = Platform.OS === 'web' ? 20 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  const upcomingBookings = (bookings || []).filter((b: any) => b.status === 'upcoming');
  const loyaltyPoints = (user as any)?.loyaltyPoints ?? 0;

  // Apply nearest sort if user location granted
  const sortedSalons = userLocation ? sortByNearest(salons, userLocation) : salons;
  const featured = sortedSalons[0];
  const rest = sortedSalons.slice(1);

  const requestLocation = async () => {
    if (locationState === 'loading') return;
    hapticLight();
    setLocationState('loading');
    const loc = await getUserLocation();
    if (loc) {
      setUserLocation(loc);
      setLocationState('granted');
    } else {
      setLocationState('denied');
    }
  };

  // Quick actions
  const quickActions = [
    { icon: 'calendar', color: '#6C63FF', label: t('book_now') || 'Book Now', route: '/search' },
    { icon: 'bag-handle', color: '#F4A460', label: t('shop') || 'Shop', route: '/shop' },
    { icon: 'map', color: '#10B981', label: t('on_map') || 'On Map', route: '/(tabs)/explore' },
    { icon: 'pricetag', color: '#EC4899', label: t('offers') || 'Offers', route: '/offers' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* ──────── HEADER ──────── */}
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={({ pressed }) => [styles.headerLeft, pressed && { opacity: 0.8 }]}
          >
            <View style={[styles.avatarWrap, { borderColor: theme.primary }]}>
              <Image source={user?.avatar ? { uri: user.avatar } : DEFAULT_AVATAR} style={styles.avatar} contentFit="cover" />
            </View>
            <View>
              <Text style={[styles.greeting, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
                {t('good_morning') || 'Good morning'}
              </Text>
              <Text style={[styles.userName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>
                {user?.fullName || t('guest') || 'Guest'}
              </Text>
            </View>
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push('/bookmarks')}
              style={({ pressed }) => [styles.iconBtn, { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons name="bookmark-outline" size={18} color={theme.text} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/notifications')}
              style={({ pressed }) => [styles.iconBtn, { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons name="notifications-outline" size={18} color={theme.text} />
              <View style={styles.notificationDot} />
            </Pressable>
          </View>
        </View>

        {/* ──────── SEARCH ──────── */}
        <Pressable
          onPress={() => router.push('/search')}
          style={({ pressed }) => [
            styles.searchBar,
            { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.92 : 1 },
          ]}
        >
          <View style={[styles.searchIconWrap, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="search" size={16} color={theme.primary} />
          </View>
          <Text style={[styles.searchPlaceholder, { color: theme.textTertiary, fontFamily: 'Urbanist_500Medium' }]} numberOfLines={1}>
            {t('search') || 'Search salons, services, specialists...'}
          </Text>
          <View style={[styles.filterBtn, { backgroundColor: theme.primary }]}>
            <Ionicons name="options" size={14} color="#fff" />
          </View>
        </Pressable>

        {/* ──────── HERO STATS CARD (vertical cells — mobile-safe) ──────── */}
        <LinearGradient
          colors={[theme.primary + '22', theme.primary + '08']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.heroCard, { borderColor: theme.primary + '35' }]}
        >
          <View style={styles.heroRow}>
            <View style={styles.heroCell}>
              <View style={[styles.heroIconWrap, { backgroundColor: theme.primary }]}>
                <MaterialCommunityIcons name="crown" size={16} color="#fff" />
              </View>
              <Text style={[styles.heroValue, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>
                {loyaltyPoints}
              </Text>
              <Text style={[styles.heroLabel, { color: theme.textSecondary }]} numberOfLines={1}>
                {(() => { const s = t('points'); return s && s !== 'points' ? s : 'Points'; })()}
              </Text>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: theme.border }]} />
            <View style={styles.heroCell}>
              <View style={[styles.heroIconWrap, { backgroundColor: '#3B82F6' }]}>
                <Ionicons name="calendar" size={14} color="#fff" />
              </View>
              <Text style={[styles.heroValue, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>
                {upcomingBookings.length}
              </Text>
              <Text style={[styles.heroLabel, { color: theme.textSecondary }]} numberOfLines={1}>
                {(() => { const s = t('upcoming'); return s && s !== 'upcoming' ? s : 'Upcoming'; })()}
              </Text>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: theme.border }]} />
            <View style={styles.heroCell}>
              <View style={[styles.heroIconWrap, { backgroundColor: '#10B981' }]}>
                <Ionicons name="bookmark" size={14} color="#fff" />
              </View>
              <Text style={[styles.heroValue, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>
                {(bookings || []).length}
              </Text>
              <Text style={[styles.heroLabel, { color: theme.textSecondary }]} numberOfLines={1}>
                {(() => { const s = t('total'); return s && s !== 'total' ? s : 'Total'; })()}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ──────── QUICK ACTIONS ──────── */}
        <View style={styles.quickActionsRow}>
          {quickActions.map((a, i) => (
            <Pressable
              key={i}
              onPress={() => { hapticLight(); router.push(a.route as any); }}
              style={({ pressed }) => [
                styles.quickActionBtn,
                { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: a.color + '22', borderColor: a.color + '40' }]}>
                <Ionicons name={a.icon as any} size={18} color={a.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]} numberOfLines={1}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ──────── CATEGORIES ──────── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '15' }]}>
              <MaterialCommunityIcons name="shape" size={14} color={theme.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
              {t('categories') || 'Categories'}
            </Text>
          </View>
          {selectedCategory !== 'all' && (
            <Pressable onPress={() => { hapticLight(); setSelectedCategory('all'); }} style={styles.clearFilterBtn}>
              <Ionicons name="close" size={12} color={theme.primary} />
              <Text style={[styles.clearFilterText, { color: theme.primary }]}>{t('clear') || 'Clear'}</Text>
            </Pressable>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          <Pressable
            onPress={() => { hapticLight(); setSelectedCategory('all'); }}
            style={[styles.categoryItem]}
          >
            <View style={[styles.categoryCircle, { backgroundColor: selectedCategory === 'all' ? theme.primary : theme.card, borderColor: selectedCategory === 'all' ? theme.primary : theme.border }]}>
              <MaterialCommunityIcons name="view-grid" size={24} color={selectedCategory === 'all' ? '#fff' : theme.primary} />
            </View>
            <Text style={[styles.categoryName, { color: selectedCategory === 'all' ? theme.primary : theme.text, fontFamily: 'Urbanist_700Bold' }]}>
              {t('all') || 'All'}
            </Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => { hapticLight(); setSelectedCategory(cat.id === selectedCategory ? 'all' : cat.id); }}
              style={[styles.categoryItem]}
            >
              <View style={[
                styles.categoryCircle,
                { backgroundColor: selectedCategory === cat.id ? theme.primary : theme.card, borderColor: selectedCategory === cat.id ? theme.primary : theme.border },
              ]}>
                <CategoryIcon iconName={cat.icon} iconSet={cat.iconSet} color={selectedCategory === cat.id ? '#fff' : theme.primary} size={24} />
              </View>
              <Text style={[styles.categoryName, { color: selectedCategory === cat.id ? theme.primary : theme.text, fontFamily: 'Urbanist_600SemiBold' }]} numberOfLines={1}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Active filter banner */}
        {selectedCategory !== 'all' && (
          <View style={[styles.filterBanner, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '35' }]}>
            <View style={[styles.filterBannerIcon, { backgroundColor: theme.primary }]}>
              {(() => {
                const cat = categories.find(c => c.id === selectedCategory);
                if (!cat) return <MaterialCommunityIcons name="shape" size={14} color="#fff" />;
                return <CategoryIcon iconName={cat.icon} iconSet={cat.iconSet} color="#fff" size={14} />;
              })()}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.filterBannerTitle, { color: theme.text }]}>
                {(() => {
                  const s = salons.length === 1 ? t('salon_singular') : t('salons_plural');
                  const word = s && s !== 'salon_singular' && s !== 'salons_plural'
                    ? s
                    : (salons.length === 1 ? 'salon' : 'salons');
                  return `${salons.length} ${word} · ${categoryName}`;
                })()}
              </Text>
              <Text style={[styles.filterBannerSub, { color: theme.textSecondary }]} numberOfLines={1}>
                {(() => {
                  const s = t('filtering_by_category');
                  return s && s !== 'filtering_by_category' ? s : 'Showing results for this category';
                })()}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                hapticLight();
                router.push({ pathname: '/search', params: { category: categoryName } });
              }}
              style={({ pressed }) => [styles.filterBannerBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.filterBannerBtnText}>{t('view_all') || 'View all'}</Text>
              <Ionicons name="arrow-forward" size={12} color="#181A20" />
            </Pressable>
          </View>
        )}

        {/* ──────── PROMO BANNER ──────── */}
        <Pressable
          onPress={() => { hapticLight(); router.push('/offers'); }}
          style={({ pressed }) => [styles.promoBanner, pressed && { opacity: 0.9 }]}
        >
          <LinearGradient
            colors={[theme.primary, '#E8924A']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.promoGradient}
          >
            <View style={styles.promoContent}>
              <View style={styles.promoBadgePill}>
                <Ionicons name="sparkles" size={11} color="#fff" />
                <Text style={styles.promoBadgeText}>NEW</Text>
              </View>
              <Text style={styles.promoTitle}>{t('special_offers_banner') || 'Special Offers'}</Text>
              <Text style={styles.promoDesc}>{t('check_deals') || 'Exclusive deals this week'}</Text>
              <View style={styles.promoCtaRow}>
                <Text style={styles.promoCta}>{t('view_all') || 'View all'}</Text>
                <Ionicons name="arrow-forward" size={13} color="#fff" />
              </View>
            </View>
            <View style={styles.promoIconBg}>
              <Ionicons name="pricetag" size={80} color="#ffffff22" />
            </View>
          </LinearGradient>
        </Pressable>

        {/* ──────── AI MAKEOVER ──────── */}
        <Pressable
          onPress={() => { hapticLight(); router.push('/ai-makeover'); }}
          style={({ pressed }) => [
            styles.aiMakeoverBtn,
            { backgroundColor: theme.card, borderColor: theme.primary + '40', opacity: pressed ? 0.92 : 1 },
          ]}
        >
          <LinearGradient
            colors={[theme.primary + '25', theme.primary + '08']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.aiMakeoverGradient}
          >
            <View style={[styles.aiMakeoverIconCircle, { backgroundColor: theme.primary }]}>
              <MaterialCommunityIcons name="face-man-shimmer" size={22} color="#fff" />
            </View>
            <View style={styles.aiMakeoverTextWrap}>
              <View style={styles.aiBadgeRow}>
                <View style={[styles.aiBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.aiBadgeText}>AI</Text>
                </View>
                <Text style={[styles.aiMakeoverTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                  {t('ai_hair_makeover') || 'Hair Makeover'}
                </Text>
              </View>
              <Text style={[styles.aiMakeoverSub, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]} numberOfLines={1}>
                {t('try_new_hairstyle') || 'Preview styles before booking'}
              </Text>
            </View>
            <View style={[styles.aiArrowWrap, { backgroundColor: theme.primary + '22' }]}>
              <Ionicons name="chevron-forward" size={18} color={theme.primary} />
            </View>
          </LinearGradient>
        </Pressable>

        {/* ──────── DISCOUNTS ──────── */}
        {discountSalons.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionIcon, { backgroundColor: '#EC489915' }]}>
                  <Ionicons name="pricetag" size={14} color="#EC4899" />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                  {t('discounts_now') || 'Deals Now'}
                </Text>
              </View>
              <Pressable onPress={() => router.push('/offers')}>
                <Text style={[styles.seeAll, { color: theme.primary }]}>{t('see_all') || 'See all'} →</Text>
              </Pressable>
            </View>
            <FlatList
              data={discountSalons}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push({ pathname: '/salon/[id]', params: { id: item.id } })}
                  style={({ pressed }) => [
                    styles.discountCard,
                    { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.95 : 1 },
                  ]}
                >
                  <View style={styles.discountImgWrap}>
                    <Image source={{ uri: getImageUrl(item.image) }} style={styles.discountImage} contentFit="cover" />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.discountGradient} />
                    <View style={[styles.discountBadge, { backgroundColor: '#EC4899' }]}>
                      <Ionicons name="pricetag" size={10} color="#fff" />
                      <Text style={styles.discountBadgeText}>
                        {item.coupons?.[0]?.type === 'percentage'
                          ? `${item.bestDiscount}% ${t('off') || 'OFF'}`
                          : `$${item.bestDiscount} ${t('off') || 'OFF'}`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.discountBody}>
                    <Text style={[styles.discountName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.discountMeta}>
                      <Ionicons name="star" size={11} color="#FFC107" />
                      <Text style={[styles.discountRating, { color: theme.text }]}>{item.rating}</Text>
                    </View>
                  </View>
                </Pressable>
              )}
            />
          </>
        )}

        {/* ──────── FEATURED SALON (large) ──────── */}
        {featured && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionIcon, { backgroundColor: '#F59E0B15' }]}>
                  <Ionicons name="flame" size={14} color="#F59E0B" />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                  {t('featured_salon') || 'Featured Salon'}
                </Text>
              </View>
            </View>
            <View style={{ paddingHorizontal: 20 }}>
              <FeaturedSalonCard
                salon={featured}
                onBookmark={() => toggleBookmark(featured.id)}
                isBookmarked={isBookmarked(featured.id)}
                t={t}
              />
            </View>
          </>
        )}

        {/* ──────── TOP SALONS (horizontal, compact) ──────── */}
        {rest.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionIcon, { backgroundColor: '#10B98115' }]}>
                  <MaterialCommunityIcons name="trophy" size={14} color="#10B981" />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                  {t('top_salons') || 'Top Rated'}
                </Text>
              </View>
              <Pressable onPress={() => router.push('/(tabs)/explore')}>
                <Text style={[styles.seeAll, { color: theme.primary }]}>{t('see_all') || 'See all'} →</Text>
              </Pressable>
            </View>
            <FlatList
              data={rest.slice(0, 8)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TopSalonCard
                  salon={item}
                  onBookmark={() => toggleBookmark(item.id)}
                  isBookmarked={isBookmarked(item.id)}
                  t={t}
                />
              )}
            />
          </>
        )}

        {/* ──────── POPULAR SPECIALISTS ──────── */}
        {salons.some((s: any) => (s.specialists || []).length > 0) && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionIcon, { backgroundColor: '#6C63FF15' }]}>
                  <Ionicons name="person" size={14} color="#6C63FF" />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                  {t('top_specialists') || 'Top Specialists'}
                </Text>
              </View>
              <Pressable onPress={() => router.push('/top-barbers')}>
                <Text style={[styles.seeAll, { color: theme.primary }]}>{t('see_all') || 'See all'} →</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
              {salons.flatMap((s: any) => (s.specialists || []).map((sp: any) => ({ ...sp, salonId: s.id, salonName: s.name })))
                .slice(0, 10)
                .map((sp: any) => (
                  <Pressable
                    key={sp.id}
                    onPress={() => router.push({ pathname: '/specialist/[id]' as any, params: { id: sp.id, salonId: sp.salonId, salonName: sp.salonName } })}
                    style={({ pressed }) => [
                      styles.specialistCard,
                      { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.92 : 1 },
                    ]}
                  >
                    <View style={styles.specialistImgWrap}>
                      <Image source={{ uri: getImageUrl(sp.image) }} style={[styles.specialistImg, { borderColor: theme.primary }]} contentFit="cover" />
                      <View style={[styles.specialistRatingBadge, { backgroundColor: theme.primary }]}>
                        <Ionicons name="star" size={8} color="#fff" />
                        <Text style={styles.specialistRatingText}>{sp.rating}</Text>
                      </View>
                    </View>
                    <Text style={[styles.specialistName, { color: theme.text }]} numberOfLines={1}>{sp.name}</Text>
                    <Text style={[styles.specialistRole, { color: theme.textSecondary }]} numberOfLines={1}>{sp.role}</Text>
                  </Pressable>
                ))}
            </ScrollView>
          </>
        )}

        {/* ──────── NEARBY SALONS (vertical list) ──────── */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="location" size={14} color={theme.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
              {t('nearby_location') || 'Nearby You'}
            </Text>
          </View>
          <Pressable onPress={() => router.push('/search')}>
            <Text style={[styles.seeAll, { color: theme.primary }]}>{t('see_all') || 'See all'} →</Text>
          </Pressable>
        </View>

        {/* Find Nearest — geolocation CTA */}
        {locationState !== 'granted' ? (
          <Pressable
            onPress={requestLocation}
            disabled={locationState === 'loading'}
            style={({ pressed }) => [styles.findNearestBtn, { borderColor: theme.primary + '40', backgroundColor: theme.card, opacity: pressed ? 0.92 : 1 }]}
          >
            <LinearGradient
              colors={[theme.primary + '22', theme.primary + '08']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.findNearestInner}
            >
              <View style={[styles.findNearestIcon, { backgroundColor: theme.primary }]}>
                {locationState === 'loading'
                  ? <ActivityIndicator size="small" color="#181A20" />
                  : <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#181A20" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.findNearestTitle, { color: theme.text }]}>
                  {locationState === 'loading'
                    ? (t('detecting_location') || 'Detecting your location...')
                    : (t('find_nearest_salons') || 'Find Nearest Salons')}
                </Text>
                <Text style={[styles.findNearestSub, { color: theme.textSecondary }]} numberOfLines={1}>
                  {locationState === 'denied'
                    ? (t('location_denied_try_again') || 'Permission denied. Tap to retry.')
                    : (t('sort_by_distance_hint') || 'Sort salons by distance from you')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.primary} />
            </LinearGradient>
          </Pressable>
        ) : (
          <View style={[styles.locationActiveBar, { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: '#10B98140' }]}>
            <MaterialCommunityIcons name="crosshairs-gps" size={14} color="#10B981" />
            <Text style={[styles.locationActiveText, { color: '#10B981' }]}>
              {t('location_active_sorted') || 'Sorted by nearest to you'}
            </Text>
            <Pressable onPress={() => { setUserLocation(null); setLocationState('idle'); }}>
              <Ionicons name="close" size={14} color="#10B981" />
            </Pressable>
          </View>
        )}

        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          {sortedSalons.slice(0, 6).map((salon) => (
            <NearbySalonRow key={salon.id} salon={salon} onBookmark={() => toggleBookmark(salon.id)} isBookmarked={isBookmarked(salon.id)} t={t} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 18 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatarWrap: { width: 46, height: 46, borderRadius: 16, borderWidth: 2, padding: 2 },
  avatar: { width: '100%', height: '100%', borderRadius: 12 },
  greeting: { fontSize: 12 },
  userName: { fontSize: 17, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 10 },
  iconBtn: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, position: 'relative' },
  notificationDot: { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#181A20' },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', height: 54, borderRadius: 16, paddingHorizontal: 14, marginHorizontal: 20, marginBottom: 20, borderWidth: 1, gap: 12 },
  searchIconWrap: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  searchPlaceholder: { flex: 1, fontSize: 13 },
  filterBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  // Hero card — vertical cells (mobile-safe)
  heroCard: { marginHorizontal: 20, padding: 14, borderRadius: 18, borderWidth: 1, marginBottom: 18 },
  heroRow: { flexDirection: 'row', alignItems: 'stretch' },
  heroCell: { flex: 1, alignItems: 'center', gap: 6, paddingHorizontal: 4, paddingVertical: 4 },
  heroDivider: { width: 1, alignSelf: 'stretch', marginVertical: 4 },
  heroIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  heroValue: { fontFamily: 'Urbanist_700Bold', fontSize: 18, textAlign: 'center' },
  heroLabel: { fontFamily: 'Urbanist_600SemiBold', fontSize: 11, textAlign: 'center' },

  // Quick actions
  quickActionsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  quickActionBtn: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 8, borderRadius: 16, borderWidth: 1 },
  quickActionIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  quickActionLabel: { fontSize: 11 },

  // Sections
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionIcon: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 17 },
  seeAll: { fontFamily: 'Urbanist_700Bold', fontSize: 12 },

  // Categories
  categoriesRow: { paddingHorizontal: 20, gap: 14, marginBottom: 14 },
  categoryItem: { alignItems: 'center', gap: 6, width: 70 },
  categoryCircle: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  categoryName: { fontSize: 11 },
  clearFilterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(244,164,96,0.15)', borderWidth: 1, borderColor: 'rgba(244,164,96,0.3)' },
  clearFilterText: { fontFamily: 'Urbanist_700Bold', fontSize: 11 },
  filterBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 20 },
  filterBannerIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  filterBannerTitle: { fontFamily: 'Urbanist_700Bold', fontSize: 13 },
  filterBannerSub: { fontFamily: 'Urbanist_500Medium', fontSize: 11, marginTop: 2 },
  filterBannerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F4A460', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  filterBannerBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 11 },

  // Promo
  promoBanner: { marginHorizontal: 20, borderRadius: 20, marginBottom: 18, overflow: 'hidden', shadowColor: '#F4A460', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 5 },
  promoGradient: { flexDirection: 'row', padding: 18, minHeight: 120, position: 'relative' },
  promoContent: { flex: 1, zIndex: 1 },
  promoBadgePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 6 },
  promoBadgeText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 9, letterSpacing: 0.8 },
  promoTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20, marginBottom: 4 },
  promoDesc: { color: 'rgba(255,255,255,0.85)', fontFamily: 'Urbanist_500Medium', fontSize: 12, marginBottom: 12 },
  promoCtaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  promoCta: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 12 },
  promoIconBg: { position: 'absolute', right: -10, bottom: -20, transform: [{ rotate: '-15deg' }] },

  // AI Makeover
  aiMakeoverBtn: { marginHorizontal: 20, borderRadius: 18, borderWidth: 1, overflow: 'hidden', marginBottom: 22 },
  aiMakeoverGradient: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  aiMakeoverIconCircle: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  aiMakeoverTextWrap: { flex: 1 },
  aiBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  aiBadge: { backgroundColor: '#F4A460', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5 },
  aiBadgeText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 9, letterSpacing: 0.5 },
  aiMakeoverTitle: { fontSize: 15 },
  aiMakeoverSub: { fontSize: 12 },
  aiArrowWrap: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },

  // Featured salon (large)
  featuredCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, marginBottom: 22 },
  featuredImageWrap: { position: 'relative' },
  featuredImage: { width: '100%', height: 200 },
  featuredGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%' },
  featuredBadges: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 6 },
  featuredBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  featuredBadgeText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 9, letterSpacing: 0.5 },
  dotWhite: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' },
  featuredBookmark: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' as any },
  featuredInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 },
  featuredName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18, marginBottom: 6 },
  featuredMeta: { flexDirection: 'row', gap: 12 },
  featuredMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featuredMetaText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 12 },

  // Top salon (compact horizontal)
  topSalonCard: { width: TOP_SALON_WIDTH, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  topSalonImgWrap: { position: 'relative' },
  topSalonImg: { width: '100%', height: 120 },
  topSalonBookmark: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  topSalonStatus: { position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  topSalonBody: { padding: 10 },
  topSalonName: { fontSize: 13, marginBottom: 4 },
  topSalonMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flexWrap: 'wrap' },
  topSalonRating: { fontSize: 11 },
  topSalonReviews: { fontSize: 10, fontFamily: 'Urbanist_500Medium' },
  topSalonDot: { width: 2, height: 2, borderRadius: 1, marginHorizontal: 2 },
  topSalonDistance: { fontSize: 11, flex: 1 },

  // Discounts
  discountCard: { width: 180, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  discountImgWrap: { position: 'relative' },
  discountImage: { width: '100%', height: 110 },
  discountGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  discountBadge: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  discountBadgeText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 10, letterSpacing: 0.3 },
  discountBody: { padding: 10 },
  discountName: { fontSize: 13, marginBottom: 4 },
  discountMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  discountRating: { fontFamily: 'Urbanist_700Bold', fontSize: 12 },

  // Specialists
  specialistCard: { width: 110, padding: 10, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  specialistImgWrap: { position: 'relative', marginBottom: 8 },
  specialistImg: { width: 60, height: 60, borderRadius: 20, borderWidth: 2 },
  specialistRatingBadge: { position: 'absolute', bottom: -3, right: -3, flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 8, borderWidth: 2, borderColor: '#181A20' },
  specialistRatingText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 9 },
  specialistName: { fontFamily: 'Urbanist_700Bold', fontSize: 12, textAlign: 'center' },
  specialistRole: { fontFamily: 'Urbanist_400Regular', fontSize: 10, textAlign: 'center', marginTop: 2 },

  // Nearby (vertical list)
  nearbyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 16, borderWidth: 1 },
  nearbyImage: { width: 78, height: 78, borderRadius: 14 },
  nearbyInfo: { flex: 1 },
  nearbyName: { fontSize: 14, marginBottom: 4 },
  nearbyAddrRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 },
  nearbyAddr: { fontSize: 11, flex: 1 },
  nearbyMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  nearbyChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: 'transparent', backgroundColor: 'rgba(255,255,255,0.04)' },
  chipText: { fontFamily: 'Urbanist_700Bold', fontSize: 10 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  nearbyBookmark: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  // Find Nearest CTA (mobile-safe + clean card)
  findNearestBtn: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  findNearestInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  findNearestIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  findNearestTitle: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 14,
    marginBottom: 3,
  },
  findNearestSub: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 11,
    lineHeight: 14,
  },

  // Location Active bar (when granted)
  locationActiveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  locationActiveText: {
    flex: 1,
    fontFamily: 'Urbanist_700Bold',
    fontSize: 12,
  },
});
