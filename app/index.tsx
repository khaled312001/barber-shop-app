import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '@/contexts/AppContext';

export default function IndexScreen() {
  const { isOnboarded, isLoggedIn, authLoading, user } = useApp();
  const [licenseChecked, setLicenseChecked] = useState(false);
  const [licenseVerified, setLicenseVerified] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('license_verified').then(val => {
      setLicenseVerified(val === 'true');
      setLicenseChecked(true);
    });
  }, []);

  useEffect(() => {
    if (authLoading || !licenseChecked) return;

    const timer = setTimeout(() => {
      // 1. Not onboarded yet → show onboarding first
      if (!isOnboarded) {
        router.replace('/onboarding');
        return;
      }
      // 2. Already logged in → route by role
      if (isLoggedIn && user) {
        if (user.role === 'salon_admin') {
          router.replace('/(salon-admin)');
        } else if (user.role === 'staff') {
          router.replace('/(staff)');
        } else if (user.role === 'super_admin' || user.role === 'admin') {
          router.replace('/(tabs)');
        } else {
          router.replace('/(tabs)');
        }
        return;
      }
      // 3. Not logged in + no license → license screen first
      if (!licenseVerified) {
        router.replace('/license');
        return;
      }
      // 4. License verified but no session → role select
      router.replace('/role-select');
    }, 100);

    return () => clearTimeout(timer);
  }, [isOnboarded, isLoggedIn, authLoading, user, licenseChecked, licenseVerified]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#F4A460" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181A20', alignItems: 'center', justifyContent: 'center' },
});
