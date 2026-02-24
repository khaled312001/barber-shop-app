import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, FlatList, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
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

function ExploreSalonCard({ salon, isLarge }: { salon: Salon; isLarge?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/salon/[id]', params: { id: salon.id } })}
      style={({ pressed }) => [styles.card, isLarge && styles.cardLarge, { opacity: pressed ? 0.9 : 1 }]}
    >
      <Image source={{ uri: salon.image }} style={styles.cardImage} contentFit="cover" />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.cardGradient} />
      <View style={styles.cardContent}>
        <Text style={[styles.cardName, { fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>{salon.name}</Text>
        <View style={styles.cardMeta}>
          <Ionicons name="location" size={12} color="#F4A460" />
          <Text style={[styles.cardDistance, { fontFamily: 'Urbanist_400Regular' }]}>{salon.distance}</Text>
          <Ionicons name="star" size={12} color="#FFC107" />
          <Text style={[styles.cardRating, { fontFamily: 'Urbanist_600SemiBold' }]}>{salon.rating}</Text>
        </View>
        <View style={[styles.openBadge, { backgroundColor: salon.isOpen ? '#4CAF5025' : '#F4433625' }]}>
          <View style={[styles.openDot, { backgroundColor: salon.isOpen ? '#4CAF50' : '#F44336' }]} />
          <Text style={[styles.openText, { color: salon.isOpen ? '#4CAF50' : '#F44336', fontFamily: 'Urbanist_500Medium' }]}>
            {salon.isOpen ? 'Open Now' : 'Closed'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;
  const bottomPad = Platform.OS === 'web' ? webBottomInset : insets.bottom;
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: salons = [] } = useQuery<Salon[]>({
    queryKey: ['/api/salons'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return salons;
    const q = searchQuery.toLowerCase();
    return salons.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));
  }, [salons, searchQuery]);

  const renderGridItem = ({ item, index }: { item: Salon; index: number }) => {
    return <ExploreSalonCard salon={item} />;
  };

  const ListHeader = () => (
    <>
      {viewMode === 'list' && (
        <View style={[styles.mapSection, { backgroundColor: theme.surface }]}>
          <Pressable
            onPress={() => setViewMode('map')}
            style={styles.mapPreview}
          >
            <View style={styles.mapIconContainer}>
              <View style={[styles.mapIconOuter, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="map" size={28} color={theme.primary} />
              </View>
            </View>
            <Text style={[styles.mapText, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
              Nearby salons in your area
            </Text>
            <View style={styles.locationPills}>
              {salons.slice(0, 3).map(s => (
                <Pressable
                  key={s.id}
                  onPress={() => router.push({ pathname: '/salon/[id]', params: { id: s.id } })}
                  style={[styles.locationPill, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}
                >
                  <Ionicons name="location" size={12} color={theme.primary} />
                  <Text style={[styles.pillText, { color: theme.primary, fontFamily: 'Urbanist_600SemiBold' }]}>{s.name}</Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.viewMapBtn, { backgroundColor: theme.primary }]}>
              <Text style={[styles.viewMapText, { fontFamily: 'Urbanist_600SemiBold' }]}>View on Map</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </Pressable>
        </View>
      )}

      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Nearby Salons</Text>
        <Text style={[styles.listCount, { color: theme.textTertiary, fontFamily: 'Urbanist_500Medium' }]}>
          {filtered.length} found
        </Text>
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Explore Nearby</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            style={({ pressed }) => [styles.headerBtn, { backgroundColor: theme.surface, opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name={viewMode === 'list' ? 'map-outline' : 'list-outline'} size={20} color={theme.text} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/search')}
            style={({ pressed }) => [styles.headerBtn, { backgroundColor: theme.surface, opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="search" size={20} color={theme.text} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.searchContainer, { paddingHorizontal: 24 }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Ionicons name="search" size={18} color={theme.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text, fontFamily: 'Urbanist_400Regular' }]}
            placeholder="Search salons nearby..."
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
      </View>

      {viewMode === 'map' ? (
        <View style={styles.mapFullContainer}>
          <SalonMap
            salons={filtered}
            onSalonPress={(id: string) => router.push({ pathname: '/salon/[id]', params: { id } })}
          />
        </View>
      ) : (
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
              <Ionicons name="search" size={48} color={theme.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>No salons found</Text>
            </View>
          }
          renderItem={renderGridItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 12 },
  title: { fontSize: 24 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  searchContainer: { marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  mapSection: { marginHorizontal: 24, borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  mapPreview: { padding: 20, alignItems: 'center', gap: 10 },
  mapIconContainer: { marginBottom: 4 },
  mapIconOuter: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  mapText: { fontSize: 14, textAlign: 'center' },
  locationPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 },
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  pillText: { fontSize: 12 },
  viewMapBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 8 },
  viewMapText: { fontSize: 13, color: '#fff' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 12 },
  listTitle: { fontSize: 20 },
  listCount: { fontSize: 14 },
  gridRow: { paddingHorizontal: 24, gap: 12, marginBottom: 12 },
  gridContent: { },
  card: { flex: 1, height: 180, borderRadius: 16, overflow: 'hidden' },
  cardLarge: { height: 220 },
  cardImage: { width: '100%', height: '100%' },
  cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%' },
  cardContent: { position: 'absolute', bottom: 10, left: 10, right: 10 },
  cardName: { fontSize: 15, color: '#fff', marginBottom: 3 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 5 },
  cardDistance: { fontSize: 11, color: '#ddd', marginRight: 6 },
  cardRating: { fontSize: 11, color: '#fff' },
  openBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  openDot: { width: 5, height: 5, borderRadius: 3 },
  openText: { fontSize: 9 },
  mapFullContainer: { flex: 1 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16 },
});
