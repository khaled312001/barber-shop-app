import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, Pressable, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

interface Salon {
  id: string;
  name: string;
  image: string;
  address: string;
  distance: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
}

export default function SearchScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { toggleBookmark, isBookmarked } = useApp();
  const { data: salons = [] } = useQuery<Salon[]>({
    queryKey: ['/api/salons'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  const [query, setQuery] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <View style={[styles.searchBar, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Ionicons name="search" size={18} color={theme.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text, fontFamily: 'Urbanist_400Regular' }]}
            placeholder="Search salons..."
            placeholderTextColor={theme.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
            </Pressable>
          )}
        </View>
        <Pressable onPress={() => setShowFilter(!showFilter)} style={({ pressed }) => [styles.filterButton, { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 }]}>
          <Ionicons name="options" size={20} color="#fff" />
        </Pressable>
      </View>

      {showFilter && (
        <View style={[styles.filterBar, { backgroundColor: theme.surface }]}>
          <Text style={[styles.filterLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>Min Rating:</Text>
          {[0, 4, 4.5, 4.8].map(r => (
            <Pressable
              key={r}
              onPress={() => setFilterRating(r)}
              style={[styles.filterChip, { backgroundColor: filterRating === r ? theme.primary : 'transparent', borderColor: filterRating === r ? theme.primary : theme.border }]}
            >
              <Text style={[styles.filterChipText, { color: filterRating === r ? '#fff' : theme.text, fontFamily: 'Urbanist_500Medium' }]}>
                {r === 0 ? 'All' : `${r}+`}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={filtered.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>No results found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/salon/[id]', params: { id: item.id } })}
            style={({ pressed }) => [styles.resultCard, { backgroundColor: theme.card, opacity: pressed ? 0.95 : 1 }]}
          >
            <Image source={{ uri: item.image }} style={styles.resultImage} contentFit="cover" />
            <View style={styles.resultInfo}>
              <Text style={[styles.resultName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{item.name}</Text>
              <Text style={[styles.resultAddr, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]} numberOfLines={1}>{item.address}</Text>
              <View style={styles.resultMeta}>
                <Ionicons name="star" size={14} color={theme.star} />
                <Text style={[styles.resultRating, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{item.rating}</Text>
                <Text style={[styles.resultDistance, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>{item.distance}</Text>
              </View>
            </View>
            <Pressable onPress={() => toggleBookmark(item.id)}>
              <Ionicons name={isBookmarked(item.id) ? 'bookmark' : 'bookmark-outline'} size={22} color={isBookmarked(item.id) ? theme.primary : theme.textTertiary} />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  backBtn: { width: 36, height: 40, justifyContent: 'center' },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 14, paddingHorizontal: 12, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  filterButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  filterBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, gap: 8, marginBottom: 8 },
  filterLabel: { fontSize: 14, marginRight: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterChipText: { fontSize: 13 },
  list: { paddingHorizontal: 24, paddingBottom: 20, gap: 12 },
  resultCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  resultImage: { width: 80, height: 80, borderRadius: 14 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 16, marginBottom: 2 },
  resultAddr: { fontSize: 13, marginBottom: 6 },
  resultMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resultRating: { fontSize: 13, marginRight: 8 },
  resultDistance: { fontSize: 12 },
  emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
