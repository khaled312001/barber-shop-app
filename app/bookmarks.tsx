import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { goBack } from '@/lib/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

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

export default function BookmarksScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { bookmarks, toggleBookmark } = useApp();
  const { t, isRTL } = useLanguage();
  const { data: allSalons = [] } = useQuery<Salon[]>({
    queryKey: ['/api/salons'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  const bookmarkedSalons = allSalons.filter(s => bookmarks.includes(s.id));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => goBack()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('my_bookmarks')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={bookmarkedSalons}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={bookmarkedSalons.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={64} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>{t('no_bookmarks')}</Text>
            <Text style={[styles.emptySubText, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>{t('save_favorites')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/salon/[id]', params: { id: item.id } })}
            style={({ pressed }) => [styles.card, { backgroundColor: theme.card, opacity: pressed ? 0.95 : 1 }]}
          >
            <Image source={{ uri: item.image }} style={styles.cardImage} contentFit="cover" />
            <View style={styles.cardInfo}>
              <Text style={[styles.cardName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{item.name}</Text>
              <Text style={[styles.cardAddr, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]} numberOfLines={1}>{item.address}</Text>
              <View style={styles.cardMeta}>
                <Ionicons name="star" size={14} color={theme.star} />
                <Text style={[styles.cardRating, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{item.rating}</Text>
                <Text style={[styles.cardDistance, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>{item.distance}</Text>
              </View>
            </View>
            <Pressable onPress={(e) => { e.stopPropagation(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleBookmark(item.id); }}>
              <Ionicons name="bookmark" size={24} color={theme.primary} />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 20, textAlign: 'center' },
  list: { paddingHorizontal: 24, paddingBottom: 20, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardImage: { width: 80, height: 80, borderRadius: 14 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, marginBottom: 2 },
  cardAddr: { fontSize: 13, marginBottom: 6 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardRating: { fontSize: 13, marginRight: 8 },
  cardDistance: { fontSize: 12 },
  emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 18 },
  emptySubText: { fontSize: 14 },
});
