import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, Pressable, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { goBack } from '@/lib/navigation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { categories } from '@/constants/data';
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

export default function SearchScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { toggleBookmark, isBookmarked } = useApp();
  const { t, isRTL } = useLanguage();
  const params = useLocalSearchParams<{ category?: string; q?: string }>();
  const incomingCategory = typeof params.category === 'string' ? params.category : '';
  const incomingQuery = typeof params.q === 'string' ? params.q : '';

  const [query, setQuery] = useState(incomingQuery);
  const [activeCategory, setActiveCategory] = useState<string>(incomingCategory || 'all');
  const [filterRating, setFilterRating] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  // Build API URL with category param for server-side filter (matches home behavior)
  const salonUrl = activeCategory !== 'all'
    ? `/api/salons?category=${encodeURIComponent(activeCategory)}`
    : '/api/salons';

  const { data: salons = [] } = useQuery<Salon[]>({
    queryKey: [salonUrl],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  const filtered = useMemo(() => {
    let result = salons;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));
    }
    if (filterRating > 0) {
      result = result.filter(s => s.rating >= filterRating);
    }
    return result;
  }, [salons, query, filterRating]);

  // Category chips data — with All + all categories
  const allCategoryChips = [
    { id: 'all', name: 'All', icon: null as any, iconSet: null as any },
    ...categories,
  ];

  const activeCategoryLabel = activeCategory === 'all' ? null : (categories.find(c => c.name === activeCategory)?.name || activeCategory);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable
          onPress={() => goBack()}
          style={({ pressed }) => [styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.searchIconWrap, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="search" size={14} color={theme.primary} />
          </View>
          <TextInput
            style={[styles.searchInput, { color: theme.text, fontFamily: 'Urbanist_500Medium' }]}
            placeholder={t('search_salons') || 'Search salons...'}
            placeholderTextColor={theme.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoFocus={!incomingCategory}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={styles.searchClearBtn}>
              <Ionicons name="close" size={14} color={theme.textTertiary} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          style={({ pressed }) => [styles.iconBtn, { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}
        >
          <Ionicons name={viewMode === 'list' ? 'map' : 'list'} size={18} color={theme.text} />
        </Pressable>
        <Pressable
          onPress={() => setShowFilter(!showFilter)}
          style={({ pressed }) => [styles.iconBtn, { backgroundColor: showFilter ? theme.primary : theme.primary + '20', borderColor: theme.primary + '40', opacity: pressed ? 0.8 : 1 }]}
        >
          <Ionicons name="options" size={18} color={showFilter ? '#fff' : theme.primary} />
        </Pressable>
      </View>

      {/* Active category banner */}
      {activeCategory !== 'all' && (
        <View style={[styles.activeBanner, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '35' }]}>
          <View style={[styles.activeIcon, { backgroundColor: theme.primary }]}>
            {(() => {
              const cat = categories.find(c => c.name === activeCategory);
              if (cat?.iconSet === 'MaterialCommunityIcons') {
                return <MaterialCommunityIcons name={cat.icon as any} size={14} color="#fff" />;
              }
              if (cat?.icon) {
                return <MaterialCommunityIcons name={cat.icon as any} size={14} color="#fff" />;
              }
              return <MaterialCommunityIcons name="shape" size={14} color="#fff" />;
            })()}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.activeTitle, { color: theme.text }]}>
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'} · {activeCategoryLabel}
            </Text>
            <Text style={[styles.activeSub, { color: theme.textSecondary }]}>
              {t('filtering_by_category') || 'Filtering by category'}
            </Text>
          </View>
          <Pressable
            onPress={() => setActiveCategory('all')}
            style={({ pressed }) => [styles.clearBannerBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="close" size={14} color="#181A20" />
            <Text style={styles.clearBannerText}>{t('clear') || 'Clear'}</Text>
          </Pressable>
        </View>
      )}

      {/* Category filter chips */}
      <View style={styles.chipsWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={allCategoryChips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chipsRow}
          renderItem={({ item }) => {
            const isActive = (item.id === 'all' && activeCategory === 'all') || activeCategory === item.name;
            return (
              <Pressable
                onPress={() => setActiveCategory(item.id === 'all' ? 'all' : item.name)}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: isActive ? theme.primary : theme.card, borderColor: isActive ? theme.primary : theme.border },
                  pressed && { opacity: 0.85 },
                ]}
              >
                {item.id === 'all' ? (
                  <MaterialCommunityIcons name="view-grid" size={13} color={isActive ? '#fff' : theme.primary} />
                ) : (
                  <MaterialCommunityIcons name={item.icon as any} size={13} color={isActive ? '#fff' : theme.primary} />
                )}
                <Text style={[styles.chipText, { color: isActive ? '#fff' : theme.text }]}>{item.name}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Rating filter bar */}
      {showFilter && (
        <View style={[styles.filterBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.filterLabel, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
            {t('min_rating') || 'Min Rating'}
          </Text>
          <View style={styles.ratingChipsRow}>
            {[0, 4, 4.5, 4.8].map(r => (
              <Pressable
                key={r}
                onPress={() => setFilterRating(r)}
                style={[styles.filterChip, { backgroundColor: filterRating === r ? theme.primary : 'transparent', borderColor: filterRating === r ? theme.primary : theme.border }]}
              >
                {r > 0 && <Ionicons name="star" size={11} color={filterRating === r ? '#fff' : '#FFC107'} />}
                <Text style={[styles.filterChipText, { color: filterRating === r ? '#fff' : theme.text }]}>
                  {r === 0 ? (t('all') || 'All') : `${r}+`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {viewMode === 'list' ? (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          scrollEnabled={filtered.length > 0}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconWrap, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="search" size={36} color={theme.primary} />
              </View>
              <Text style={[styles.emptyText, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                {t('no_results') || 'No results found'}
              </Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
                {activeCategory !== 'all'
                  ? `${t('no_salons_in_category') || 'No salons in this category'}`
                  : `${t('try_different_search') || 'Try a different search term'}`}
              </Text>
              {activeCategory !== 'all' && (
                <Pressable
                  onPress={() => setActiveCategory('all')}
                  style={({ pressed }) => [styles.emptyCta, pressed && { opacity: 0.85 }]}
                >
                  <Text style={styles.emptyCtaText}>{t('show_all') || 'Show all salons'}</Text>
                </Pressable>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/salon/[id]', params: { id: item.id } })}
              style={({ pressed }) => [
                styles.resultCard,
                { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.95 : 1 },
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.resultImage} contentFit="cover" />
              <View style={styles.resultInfo}>
                <Text style={[styles.resultName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>{item.name}</Text>
                <View style={styles.resultAddrRow}>
                  <Ionicons name="location-outline" size={11} color={theme.textTertiary} />
                  <Text style={[styles.resultAddr, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]} numberOfLines={1}>{item.address}</Text>
                </View>
                <View style={styles.resultMeta}>
                  <View style={styles.metaChip}>
                    <Ionicons name="star" size={10} color="#FFC107" />
                    <Text style={[styles.metaChipText, { color: theme.text }]}>{item.rating}</Text>
                  </View>
                  <View style={[styles.metaChip, { backgroundColor: item.isOpen ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', borderColor: item.isOpen ? '#10B98140' : '#EF444440' }]}>
                    <View style={[styles.statusDot, { backgroundColor: item.isOpen ? '#10B981' : '#EF4444' }]} />
                    <Text style={[styles.metaChipText, { color: item.isOpen ? '#10B981' : '#EF4444' }]}>
                      {item.isOpen ? (t('open') || 'Open') : (t('closed') || 'Closed')}
                    </Text>
                  </View>
                  <View style={[styles.metaChip, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}>
                    <Ionicons name="location" size={10} color={theme.primary} />
                    <Text style={[styles.metaChipText, { color: theme.primary }]}>{item.distance}</Text>
                  </View>
                </View>
              </View>
              <Pressable
                onPress={(e) => { e.stopPropagation(); toggleBookmark(item.id); }}
                style={[styles.bookmarkBtn, { backgroundColor: isBookmarked(item.id) ? theme.primary + '22' : 'transparent', borderColor: isBookmarked(item.id) ? theme.primary + '40' : theme.border }]}
              >
                <Ionicons name={isBookmarked(item.id) ? 'bookmark' : 'bookmark-outline'} size={16} color={isBookmarked(item.id) ? theme.primary : theme.textTertiary} />
              </Pressable>
            </Pressable>
          )}
        />
      ) : (
        <SalonMap salons={filtered} onSalonPress={(id: string) => router.push({ pathname: '/salon/[id]', params: { id } })} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  backBtn: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 46, borderRadius: 13, paddingHorizontal: 10, borderWidth: 1, gap: 8 },
  searchIconWrap: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  searchClearBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#ffffff10', alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  // Active banner
  activeBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, padding: 10, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  activeIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  activeTitle: { fontFamily: 'Urbanist_700Bold', fontSize: 12 },
  activeSub: { fontFamily: 'Urbanist_500Medium', fontSize: 10, marginTop: 1 },
  clearBannerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F4A460', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9 },
  clearBannerText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 11 },

  // Category chips — uniform fixed width
  chipsWrap: { marginBottom: 12 },
  chipsRow: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    width: 120,
    height: 44,
  },
  chipText: { fontFamily: 'Urbanist_700Bold', fontSize: 12, flexShrink: 1 },

  // Rating filter
  filterBar: { marginHorizontal: 16, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  filterLabel: { fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  ratingChipsRow: { flexDirection: 'row', gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  filterChipText: { fontFamily: 'Urbanist_700Bold', fontSize: 11 },

  // List
  list: { paddingHorizontal: 16, paddingBottom: 80, gap: 10 },
  resultCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 14, gap: 12, borderWidth: 1 },
  resultImage: { width: 74, height: 74, borderRadius: 13 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 14, marginBottom: 4 },
  resultAddrRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 7 },
  resultAddr: { flex: 1, fontSize: 11 },
  resultMeta: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: 'transparent', backgroundColor: 'rgba(255,255,255,0.04)' },
  metaChipText: { fontFamily: 'Urbanist_700Bold', fontSize: 10 },
  statusDot: { width: 4, height: 4, borderRadius: 2 },
  bookmarkBtn: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  // Empty
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 10, paddingHorizontal: 24 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16 },
  emptySub: { fontSize: 13, textAlign: 'center', maxWidth: 280 },
  emptyCta: { backgroundColor: '#F4A460', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 10 },
  emptyCtaText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 13 },
});
