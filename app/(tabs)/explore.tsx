import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/constants/theme';
import { salons } from '@/constants/data';

function ExploreSalonCard({ salon }: { salon: typeof salons[0] }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/salon/[id]', params: { id: salon.id } })}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}
    >
      <Image source={{ uri: salon.image }} style={styles.cardImage} contentFit="cover" />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.cardGradient} />
      <View style={styles.cardContent}>
        <Text style={[styles.cardName, { fontFamily: 'Urbanist_700Bold' }]}>{salon.name}</Text>
        <View style={styles.cardMeta}>
          <Ionicons name="location" size={14} color="#F4A460" />
          <Text style={[styles.cardDistance, { fontFamily: 'Urbanist_400Regular' }]}>{salon.distance}</Text>
          <Ionicons name="star" size={14} color="#FFC107" />
          <Text style={[styles.cardRating, { fontFamily: 'Urbanist_600SemiBold' }]}>{salon.rating}</Text>
        </View>
        <View style={[styles.openBadge, { backgroundColor: salon.isOpen ? '#4CAF5030' : '#F4433630' }]}>
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
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Explore Nearby</Text>
        <Pressable onPress={() => router.push('/search')} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Ionicons name="search" size={24} color={theme.text} />
        </Pressable>
      </View>

      <View style={[styles.mapPlaceholder, { backgroundColor: theme.surface }]}>
        <Ionicons name="map" size={48} color={theme.textTertiary} />
        <Text style={[styles.mapText, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
          Nearby salons in your area
        </Text>
        <View style={styles.locationPills}>
          {salons.slice(0, 3).map(s => (
            <Pressable key={s.id} onPress={() => router.push({ pathname: '/salon/[id]', params: { id: s.id } })} style={[styles.locationPill, { backgroundColor: theme.primary + '20', borderColor: theme.primary + '40' }]}>
              <Ionicons name="location" size={14} color={theme.primary} />
              <Text style={[styles.pillText, { color: theme.primary, fontFamily: 'Urbanist_600SemiBold' }]}>{s.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Nearby Salons</Text>
      </View>

      <FlatList
        data={salons}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={salons.length > 0}
        renderItem={({ item }) => <ExploreSalonCard salon={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16 },
  title: { fontSize: 24 },
  mapPlaceholder: { marginHorizontal: 24, borderRadius: 20, padding: 24, alignItems: 'center', gap: 8, marginBottom: 16 },
  mapText: { fontSize: 14 },
  locationPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, justifyContent: 'center' },
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  pillText: { fontSize: 12 },
  listHeader: { paddingHorizontal: 24, marginBottom: 12 },
  listTitle: { fontSize: 20 },
  gridRow: { paddingHorizontal: 24, gap: 12, marginBottom: 12 },
  gridContent: { paddingBottom: 100 },
  card: { flex: 1, height: 180, borderRadius: 16, overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%' },
  cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  cardContent: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  cardName: { fontSize: 16, color: '#fff', marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  cardDistance: { fontSize: 12, color: '#fff', marginRight: 8 },
  cardRating: { fontSize: 12, color: '#fff' },
  openBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  openDot: { width: 6, height: 6, borderRadius: 3 },
  openText: { fontSize: 10 },
});
