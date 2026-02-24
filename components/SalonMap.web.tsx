import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/constants/theme';

interface Salon {
  id: string;
  name: string;
  address: string;
  rating: number;
  distance: string;
  latitude: number;
  longitude: number;
}

export default function SalonMap({ salons }: { salons: Salon[] }) {
  const theme = useTheme();
  return (
    <FlatList
      data={salons}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      scrollEnabled={salons.length > 0}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={48} color={theme.textTertiary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>No salons found</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: '/salon/[id]', params: { id: item.id } })}
          style={({ pressed }) => [styles.mapCard, { backgroundColor: theme.card, opacity: pressed ? 0.95 : 1 }]}
        >
          <View style={[styles.mapPin, { backgroundColor: theme.primary }]}>
            <Ionicons name="location" size={16} color="#fff" />
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{item.name}</Text>
            <Text style={[styles.addr, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]} numberOfLines={1}>{item.address}</Text>
            <View style={styles.meta}>
              <Ionicons name="star" size={14} color={theme.star} />
              <Text style={[styles.rating, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{item.rating}</Text>
              <Text style={[styles.distance, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>{item.distance}</Text>
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 24, paddingBottom: 20, gap: 12 },
  mapCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  mapPin: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontSize: 16, marginBottom: 2 },
  addr: { fontSize: 13, marginBottom: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 13, marginRight: 8 },
  distance: { fontSize: 12 },
  emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
