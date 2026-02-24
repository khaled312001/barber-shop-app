import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import MapView, { Marker, Callout } from 'react-native-maps';

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
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 40.7128,
        longitude: -74.006,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {salons.map(salon => (
        <Marker
          key={salon.id}
          coordinate={{ latitude: salon.latitude, longitude: salon.longitude }}
          title={salon.name}
          description={`${salon.rating}\u2605 - ${salon.address}`}
        >
          <Callout onPress={() => router.push({ pathname: '/salon/[id]', params: { id: salon.id } })}>
            <View style={styles.callout}>
              <Text style={styles.calloutTitle}>{salon.name}</Text>
              <Text style={styles.calloutSub}>{salon.rating}{'\u2605'} {'\u00b7'} {salon.distance}</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  callout: { padding: 8, minWidth: 150 },
  calloutTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  calloutSub: { fontSize: 12, color: '#666' },
});
