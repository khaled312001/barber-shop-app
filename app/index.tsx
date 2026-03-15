import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/constants/theme';

export default function IndexScreen() {
  const { isOnboarded, isLoggedIn, authLoading, user } = useApp();
  const theme = useTheme();

  useEffect(() => {
    if (authLoading) return;
    const timer = setTimeout(() => {
      if (!isOnboarded) {
        router.replace('/onboarding');
      } else if (!isLoggedIn) {
        router.replace('/welcome');
      } else if (user?.role === 'salon_admin') {
        router.replace('/(salon-admin)');
      } else if (user?.role === 'staff') {
        router.replace('/(staff)');
      } else {
        router.replace('/(tabs)');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isOnboarded, isLoggedIn, authLoading, user]);

  return <View style={[styles.container, { backgroundColor: theme.background }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
