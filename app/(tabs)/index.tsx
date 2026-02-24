import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Dimensions, Platform, FlatList, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { DEFAULT_AVATAR } from '@/constants/images';
import { categories } from '@/constants/data';

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
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

function CategoryIcon({ iconName, iconSet, color, size }: { iconName: string; iconSet: string; color: string; size: number }) {
  if (iconSet === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
  }
  return <MaterialIcons name={iconName as any} size={size} color={color} />;
}

function SalonCard({ salon, onBookmark, isBookmarked }: { salon: Salon; onBookmark: () => void; isBookmarked: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/salon/[id]', params: { id: salon.id } })}
      style={({ pressed }) => [styles.salonCard, { backgroundColor: theme.card, opacity: pressed ? 0.95 : 1 }]}
    >
      <View style={styles.salonImageContainer}>
        <Image source={{ uri: salon.image }} style={styles.salonImage} contentFit="cover" />
        <Pressable
          onPress={(e) => { e.stopPropagation(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onBookmark(); }}
          style={[styles.bookmarkBtn, { backgroundColor: theme.primary }]}
        >
          <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={16} color="#fff" />
        </Pressable>
      </View>
      <View style={styles.salonInfo}>
        <Text style={[styles.salonName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>{salon.name}</Text>
        <Text style={[styles.salonAddress, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]} numberOfLines={1}>{salon.address}</Text>
        <View style={styles.salonMeta}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={theme.star} />
            <Text style={[styles.ratingText, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{salon.rating}</Text>
            <Text style={[styles.reviewCount, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>({salon.reviewCount})</Text>
          </View>
          <View style={[styles.distanceBadge, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="location" size={12} color={theme.primary} />
            <Text style={[styles.distanceText, { color: theme.primary, fontFamily: 'Urbanist_500Medium' }]}>{salon.distance}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function NearbySalonRow({ salon, onBookmark, isBookmarked }: { salon: Salon; onBookmark: () => void; isBookmarked: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/salon/[id]', params: { id: salon.id } })}
      style={({ pressed }) => [styles.nearbyCard, { backgroundColor: theme.card, opacity: pressed ? 0.95 : 1 }]}
    >
      <Image source={{ uri: salon.image }} style={styles.nearbyImage} contentFit="cover" />
      <View style={styles.nearbyInfo}>
        <Text style={[styles.nearbyName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>{salon.name}</Text>
        <Text style={[styles.nearbyAddr, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]} numberOfLines={1}>{salon.address}</Text>
        <View style={styles.nearbyMeta}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={theme.star} />
            <Text style={[styles.ratingSmall, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{salon.rating}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: salon.isOpen ? theme.success + '15' : theme.error + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: salon.isOpen ? theme.success : theme.error }]} />
            <Text style={[styles.statusText, { color: salon.isOpen ? theme.success : theme.error, fontFamily: 'Urbanist_500Medium' }]}>
              {salon.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </View>
      <Pressable onPress={(e) => { e.stopPropagation(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onBookmark(); }}>
        <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={isBookmarked ? theme.primary : theme.textTertiary} />
      </Pressable>
    </Pressable>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, toggleBookmark, isBookmarked } = useApp();
  const { data: salons = [] } = useQuery<Salon[]>({ queryKey: ['/api/salons'], queryFn: getQueryFn({ on401: 'throw' }) });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <View style={styles.headerLeft}>
            <Image source={user?.avatar ? { uri: user.avatar } : DEFAULT_AVATAR} style={styles.avatar} contentFit="cover" />
            <View>
              <Text style={[styles.greeting, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>Good Morning</Text>
              <Text style={[styles.userName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{user?.fullName}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={() => router.push('/notifications')} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <Ionicons name="notifications-outline" size={26} color={theme.text} />
            </Pressable>
            <Pressable onPress={() => router.push('/bookmarks')} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <Ionicons name="bookmark-outline" size={26} color={theme.text} />
            </Pressable>
          </View>
        </View>

        <Pressable onPress={() => router.push('/search')} style={[styles.searchBar, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Ionicons name="search" size={20} color={theme.textTertiary} />
          <Text style={[styles.searchPlaceholder, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>Search</Text>
          <View style={[styles.filterBtn, { backgroundColor: theme.primary }]}>
            <Ionicons name="options" size={18} color="#fff" />
          </View>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Categories</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => { Haptics.selectionAsync(); setSelectedCategory(cat.id === selectedCategory ? 'all' : cat.id); }}
              style={({ pressed }) => [styles.categoryItem, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={[styles.categoryCircle, { backgroundColor: selectedCategory === cat.id ? theme.primary : theme.primary + '15' }]}>
                <CategoryIcon iconName={cat.icon} iconSet={cat.iconSet} color={selectedCategory === cat.id ? '#fff' : theme.primary} size={28} />
              </View>
              <Text style={[styles.categoryName, { color: selectedCategory === cat.id ? theme.primary : theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{cat.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Popular Salons</Text>
          <Pressable onPress={() => router.push('/search')}>
            <Text style={[styles.seeAll, { color: theme.primary, fontFamily: 'Urbanist_600SemiBold' }]}>See All</Text>
          </Pressable>
        </View>
        <FlatList
          data={salons.slice(0, 3)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
          keyExtractor={(item) => item.id}
          scrollEnabled={salons.length > 0}
          renderItem={({ item }) => (
            <SalonCard salon={item} onBookmark={() => toggleBookmark(item.id)} isBookmarked={isBookmarked(item.id)} />
          )}
        />

        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Nearby Your Location</Text>
          <Pressable onPress={() => router.push('/search')}>
            <Text style={[styles.seeAll, { color: theme.primary, fontFamily: 'Urbanist_600SemiBold' }]}>See All</Text>
          </Pressable>
        </View>
        {salons.map((salon) => (
          <View key={salon.id} style={{ paddingHorizontal: 24, marginBottom: 12 }}>
            <NearbySalonRow salon={salon} onBookmark={() => toggleBookmark(salon.id)} isBookmarked={isBookmarked(salon.id)} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  greeting: { fontSize: 14 },
  userName: { fontSize: 18 },
  headerRight: { flexDirection: 'row', gap: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', height: 52, borderRadius: 16, paddingHorizontal: 16, marginHorizontal: 24, marginBottom: 20, borderWidth: 1, gap: 10 },
  searchPlaceholder: { flex: 1, fontSize: 14 },
  filterBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 20 },
  seeAll: { fontSize: 16 },
  categoriesRow: { paddingHorizontal: 24, gap: 20, marginBottom: 24 },
  categoryItem: { alignItems: 'center', gap: 8 },
  categoryCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  categoryName: { fontSize: 12 },
  salonCard: { width: CARD_WIDTH, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  salonImageContainer: { position: 'relative' },
  salonImage: { width: '100%', height: 160 },
  bookmarkBtn: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  salonInfo: { padding: 14 },
  salonName: { fontSize: 18, marginBottom: 4 },
  salonAddress: { fontSize: 13, marginBottom: 8 },
  salonMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14 },
  reviewCount: { fontSize: 12 },
  distanceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  distanceText: { fontSize: 12 },
  nearbyCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  nearbyImage: { width: 80, height: 80, borderRadius: 14 },
  nearbyInfo: { flex: 1 },
  nearbyName: { fontSize: 16, marginBottom: 2 },
  nearbyAddr: { fontSize: 13, marginBottom: 6 },
  nearbyMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ratingSmall: { fontSize: 13 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11 },
});
