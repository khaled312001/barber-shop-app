import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTheme } from '@/constants/theme';

interface Salon {
  id: string;
  name: string;
  image?: string;
  address: string;
  rating: number;
  distance: string;
  latitude: number;
  longitude: number;
  isOpen?: boolean;
}

export default function SalonMap({ salons, onSalonPress }: { salons: Salon[]; onSalonPress?: (id: string) => void }) {
  const theme = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);

  const centerLat = salons.length > 0
    ? salons.reduce((sum, s) => sum + (s.latitude || 0), 0) / salons.length
    : 40.7128;
  const centerLng = salons.length > 0
    ? salons.reduce((sum, s) => sum + (s.longitude || 0), 0) / salons.length
    : -74.006;

  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #map { width: 100%; height: 100%; }
  .salon-popup { font-family: 'Urbanist', sans-serif; min-width: 180px; }
  .salon-popup .name { font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #1a1a2e; }
  .salon-popup .addr { font-size: 12px; color: #666; margin-bottom: 4px; }
  .salon-popup .meta { display: flex; align-items: center; gap: 4px; font-size: 12px; }
  .salon-popup .star { color: #FFC107; }
  .leaflet-popup-content-wrapper { border-radius: 12px !important; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map').setView([${centerLat}, ${centerLng}], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  var salons = ${JSON.stringify(salons.map(s => ({
    id: s.id,
    name: s.name,
    address: s.address,
    rating: s.rating,
    distance: s.distance,
    lat: s.latitude,
    lng: s.longitude,
    isOpen: s.isOpen,
  })))};

  var customIcon = L.divIcon({
    html: '<div style="width:32px;height:32px;background:#F4A460;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>',
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  salons.forEach(function(s) {
    if (!s.lat || !s.lng) return;
    var marker = L.marker([s.lat, s.lng], { icon: customIcon }).addTo(map);
    var openBadge = s.isOpen
      ? '<span style="color:#4CAF50;font-size:11px;font-weight:600">● Open</span>'
      : '<span style="color:#F44336;font-size:11px;font-weight:600">● Closed</span>';
    marker.bindPopup(
      '<div class="salon-popup">' +
        '<div class="name">' + s.name + '</div>' +
        '<div class="addr">' + s.address + '</div>' +
        '<div class="meta"><span class="star">★</span> ' + s.rating + ' &nbsp;·&nbsp; ' + s.distance + ' &nbsp;' + openBadge + '</div>' +
      '</div>'
    );
    marker.on('click', function() {
      window.parent.postMessage({ type: 'salon-select', id: s.id }, '*');
    });
  });

  if (salons.length > 0) {
    var bounds = L.latLngBounds(salons.filter(function(s) { return s.lat && s.lng; }).map(function(s) { return [s.lat, s.lng]; }));
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
  }
</script>
</body>
</html>`;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'salon-select') {
        const salon = salons.find(s => s.id === event.data.id);
        if (salon) {
          setSelectedSalon(salon);
          if (onSalonPress) onSalonPress(salon.id);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [salons, onSalonPress]);

  if (salons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="map-outline" size={48} color={theme.textTertiary} />
        <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>No salons found</Text>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <iframe
        ref={iframeRef}
        srcDoc={mapHtml}
        style={{ width: '100%', height: '100%', border: 'none', borderRadius: 0 } as any}
        title="Salon Map"
      />
      {selectedSalon && (
        <Pressable
          onPress={() => router.push({ pathname: '/salon/[id]', params: { id: selectedSalon.id } })}
          style={[styles.selectedCard, { backgroundColor: theme.card }]}
        >
          {selectedSalon.image && (
            <Image source={{ uri: selectedSalon.image }} style={styles.selectedImage} contentFit="cover" />
          )}
          <View style={styles.selectedInfo}>
            <Text style={[styles.selectedName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{selectedSalon.name}</Text>
            <Text style={[styles.selectedAddr, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]} numberOfLines={1}>{selectedSalon.address}</Text>
            <View style={styles.selectedMeta}>
              <Ionicons name="star" size={14} color="#FFC107" />
              <Text style={[styles.selectedRating, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{selectedSalon.rating}</Text>
              <Text style={[styles.selectedDist, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>{selectedSalon.distance}</Text>
            </View>
          </View>
          <Pressable onPress={() => setSelectedSalon(null)} style={styles.closeBtn}>
            <Ionicons name="close" size={18} color={theme.textTertiary} />
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { flex: 1, position: 'relative' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16 },
  selectedCard: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  selectedImage: { width: 64, height: 64, borderRadius: 12 },
  selectedInfo: { flex: 1 },
  selectedName: { fontSize: 16, marginBottom: 2 },
  selectedAddr: { fontSize: 12, marginBottom: 4 },
  selectedMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  selectedRating: { fontSize: 13, marginRight: 8 },
  selectedDist: { fontSize: 12 },
  closeBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
