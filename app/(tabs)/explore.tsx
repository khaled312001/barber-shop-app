import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, FlatList, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import SalonMap from '@/components/SalonMap';

interface Salon {
  id: string;
  name: string;
  image: string;
  address: string;
  distance: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  latitude: number;
  longitude: number;
}

function ExploreSalonCard({ salon, t, theme }: { salon: Salon; t: (key: string) => string; theme: any }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/salon/[id]', params: { id: salon.id } })}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={styles.cardImageWrap}>
        <Image source={{ uri: salon.image }} style={styles.cardImage} contentFit="cover" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.cardGradient} />
        <View style={[styles.openBadge, { backgroundColor: salon.isOpen ? '#10B981' : '#EF4444' }]}>
          <View style={styles.openDot} />
          <Text style={styles.openText}>{salon.isOpen ? t('open_now') || 'Open' : t('closed') || 'Closed'}</Text>
        </View>
        <View style={styles.ratingFloat}>
          <Ionicons name="star" size={11} color="#FFC107" />
          <Text style={styles.ratingFloatText}>{salon.rating}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={1}>{salon.name}</Text>
        <View style={styles.cardMetaRow}>
          <View style={[styles.metaChip, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="location" size={11} color={theme.primary} />
            <Text style={[styles.metaChipText, { color: theme.primary }]}>{salon.distance}</Text>
          </View>
          <Text style={[styles.reviewCount, { color: theme.textTertiary }]}>({salon.reviewCount})</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;
  const bottomPad = Platform.OS === 'web' ? webBottomInset : insets.bottom;
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);

  const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleFindNearest = () => {
    if (Platform.OS !== 'web' || !navigator.geolocation) {
      if (Platform.OS === 'web') alert(t('gps_unsupported') || 'Geolocation is not supported in your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setSortByDistance(true);
        setLocating(false);
        // Auto-open the nearest salon if within 50km
        if (Array.isArray(salons) && salons.length > 0) {
          const withDist = salons
            .filter(s => s.latitude && s.longitude)
            .map(s => ({ ...s, _km: distanceKm(latitude, longitude, s.latitude, s.longitude) }))
            .sort((a, b) => a._km - b._km);
          if (withDist.length > 0) {
            const nearest = withDist[0];
            // Don't auto-navigate; just scroll user attention by expanding map
            setIsMapExpanded(true);
          }
        }
      },
      (err) => {
        setLocating(false);
        const msg = err.code === 1
          ? (t('gps_permission_denied') || 'Permission denied. Please allow location access.')
          : (t('gps_unavailable') || 'Unable to determine your location.');
        if (Platform.OS === 'web') alert(msg);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  const { data: salons = [] } = useQuery<Salon[]>({
    queryKey: ['/api/salons'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  const filtered = useMemo(() => {
    let list: Salon[] = salons;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));
    }
    if (sortByDistance && userLocation) {
      list = [...list]
        .filter(s => s.latitude && s.longitude)
        .map(s => ({ ...s, _km: distanceKm(userLocation.lat, userLocation.lng, s.latitude, s.longitude) }))
        .sort((a, b) => (a as any)._km - (b as any)._km)
        .map(s => ({ ...s, distance: `${(s as any)._km.toFixed(1)} km` }));
    }
    return list;
  }, [salons, searchQuery, sortByDistance, userLocation]);

  const openCount = filtered.filter(s => s.isOpen).length;

  const ListHeader = () => (
    <>
      {/* Map section with border */}
      <View style={[styles.mapSection, { borderColor: theme.border, height: isMapExpanded ? 360 : 160 }]}>
        <View style={styles.mapInner}>
          <SalonMap
            salons={filtered}
            onSalonPress={(id: string) => router.push({ pathname: '/salon/[id]', params: { id } })}
          />
        </View>
        <Pressable
          onPress={() => setIsMapExpanded(!isMapExpanded)}
          style={({ pressed }) => [
            styles.toggleMapBtn,
            { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Ionicons name={isMapExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={theme.primary} />
          <Text style={[styles.toggleMapText, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>
            {isMapExpanded ? t('collapse') : t('expand')} {t('map')}
          </Text>
        </Pressable>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.statIconWrap, { backgroundColor: theme.primary + '15' }]}>
            <MaterialCommunityIcons name="store-outline" size={16} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.statValue, { color: theme.text }]}>{filtered.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('total') || 'Total'}</Text>
          </View>
        </View>
        <View style={[styles.statChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.statIconWrap, { backgroundColor: '#10B981' + '18' }]}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          </View>
          <View>
            <Text style={[styles.statValue, { color: theme.text }]}>{openCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('open_now') || 'Open'}</Text>
          </View>
        </View>
        <View style={[styles.statChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.statIconWrap, { backgroundColor: '#FFC107' + '18' }]}>
            <Ionicons name="star" size={16} color="#FFC107" />
          </View>
          <View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {filtered.length > 0 ? (filtered.reduce((sum, s) => sum + s.rating, 0) / filtered.length).toFixed(1) : '—'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('avg_rating') || 'Avg'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('nearby_salons')}</Text>
        <View style={[styles.countBadge, { backgroundColor: theme.primary + '18' }]}>
          <Text style={[styles.countBadgeText, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>{filtered.length}</Text>
        </View>
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Hero header with gradient */}
      <LinearGradient
        colors={[theme.primary + '22', 'transparent']}
        style={[styles.heroBox, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('explore_nearby') || 'Explore Nearby'}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
              {t('find_perfect_salon') || 'Find your perfect salon'}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/search')}
            style={({ pressed }) => [
              styles.headerBtn,
              { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="options" size={20} color={theme.primary} />
          </Pressable>
        </View>

        {/* Search + Find nearest row */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="search" size={18} color={theme.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text, fontFamily: 'Urbanist_500Medium' }]}
              placeholder={t('search_salons_nearby') || 'Search salons nearby...'}
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={handleFindNearest}
            disabled={locating}
            style={({ pressed }) => [styles.nearestBtn, { opacity: pressed || locating ? 0.85 : 1 }]}
            {...({ title: t('find_nearest_salon') || 'Find nearest salon' } as any)}
          >
            <LinearGradient
              colors={[theme.primary, '#E8924A']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.nearestBtnGradient}
            >
              {locating ? (
                <Ionicons name="navigate" size={18} color="#fff" />
              ) : (
                <Ionicons name="locate" size={18} color="#fff" />
              )}
            </LinearGradient>
          </Pressable>
        </View>

        {/* Sort/filter chips */}
        <View style={styles.chipsRow}>
          <Pressable
            onPress={() => {
              if (sortByDistance) {
                setSortByDistance(false);
              } else if (userLocation) {
                setSortByDistance(true);
              } else {
                handleFindNearest();
              }
            }}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: sortByDistance ? theme.primary : theme.card,
                borderColor: sortByDistance ? theme.primary : theme.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name="navigate" size={13} color={sortByDistance ? '#fff' : theme.primary} />
            <Text style={[styles.chipText, { color: sortByDistance ? '#fff' : theme.text }]}>
              {t('nearest_to_me') || 'Nearest to me'}
            </Text>
          </Pressable>
          {userLocation && (
            <View style={[styles.chip, { backgroundColor: '#10B98115', borderColor: '#10B98155' }]}>
              <Ionicons name="checkmark-circle" size={13} color="#10B981" />
              <Text style={[styles.chipText, { color: '#10B981' }]}>{t('location_found') || 'Location found'}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={[styles.gridContent, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconWrap, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="search" size={44} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('no_salons_found')}</Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
              {t('try_different_search') || 'Try a different search term.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => <ExploreSalonCard salon={item} t={t} theme={theme} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 12 },
  heroBox: { paddingHorizontal: 24, paddingBottom: 14, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 12 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14 },
  title: { fontSize: 26 },
  subtitle: { fontSize: 13, marginTop: 2 },
  headerBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 50, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, gap: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  nearestBtn: { width: 50, height: 50, borderRadius: 14, overflow: 'hidden' },
  nearestBtnGradient: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },

  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontFamily: 'Urbanist_600SemiBold', fontSize: 12 },

  mapSection: { marginHorizontal: 24, borderRadius: 20, overflow: 'hidden', marginBottom: 16, position: 'relative', borderWidth: 1 },
  mapInner: { flex: 1 },
  toggleMapBtn: {
    position: 'absolute', bottom: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  toggleMapText: { fontSize: 12 },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 24, marginBottom: 20 },
  statChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, borderWidth: 1 },
  statIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 15, fontFamily: 'Urbanist_700Bold' },
  statLabel: { fontSize: 10, fontFamily: 'Urbanist_500Medium', marginTop: 1 },

  listHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24, marginBottom: 12 },
  listTitle: { fontSize: 20 },
  countBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, minWidth: 26, alignItems: 'center' },
  countBadgeText: { fontSize: 12 },

  gridRow: { paddingHorizontal: 24, gap: 12, marginBottom: 12 },
  gridContent: {},

  card: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImageWrap: { position: 'relative' },
  cardImage: { width: '100%', height: 130 },
  cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  openBadge: {
    position: 'absolute', top: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 12,
  },
  openDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' },
  openText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 9, textTransform: 'uppercase' },
  ratingFloat: {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 10,
  },
  ratingFloatText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 10 },
  cardBody: { padding: 12 },
  cardName: { fontSize: 14, fontFamily: 'Urbanist_700Bold', marginBottom: 6 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  metaChipText: { fontSize: 10, fontFamily: 'Urbanist_700Bold' },
  reviewCount: { fontSize: 11, fontFamily: 'Urbanist_500Medium' },

  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 10, paddingHorizontal: 24 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 17 },
  emptySubtext: { fontSize: 13, textAlign: 'center' },
});
