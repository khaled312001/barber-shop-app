import { Platform } from 'react-native';
import * as Location from 'expo-location';

export interface Coords { latitude: number; longitude: number }
export interface SalonLike { id: string; latitude?: number; longitude?: number; [k: string]: any }

/** Haversine distance in kilometers. */
export function distanceKm(a: Coords, b: Coords): number {
  const R = 6371; // km
  const dLat = (b.latitude - a.latitude) * Math.PI / 180;
  const dLon = (b.longitude - a.longitude) * Math.PI / 180;
  const la1 = a.latitude * Math.PI / 180;
  const la2 = b.latitude * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/**
 * Get the user's current coordinates. Prompts permission if needed.
 * On web uses the Geolocation API; on native uses expo-location.
 * Returns null if permission denied or error.
 */
export async function getUserLocation(): Promise<Coords | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof navigator === 'undefined' || !navigator.geolocation) return null;
      return await new Promise<Coords | null>((resolve) => {
        const timer = setTimeout(() => resolve(null), 10000);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timer);
            resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          },
          () => { clearTimeout(timer); resolve(null); },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
        );
      });
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
  } catch {
    return null;
  }
}

/** Sort salons by distance from user. Returns salons augmented with `_distanceKm` and `distance` string. */
export function sortByNearest<T extends SalonLike>(salons: T[], user: Coords | null): (T & { _distanceKm?: number })[] {
  if (!user) return salons;
  return [...salons]
    .map((s) => {
      if (typeof s.latitude !== 'number' || typeof s.longitude !== 'number' || (s.latitude === 0 && s.longitude === 0)) {
        return s;
      }
      const km = distanceKm(user, { latitude: s.latitude, longitude: s.longitude });
      return { ...s, _distanceKm: km, distance: formatDistance(km) };
    })
    .sort((a: any, b: any) => {
      if (a._distanceKm == null) return 1;
      if (b._distanceKm == null) return -1;
      return a._distanceKm - b._distanceKm;
    });
}
