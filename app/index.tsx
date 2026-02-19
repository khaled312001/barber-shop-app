import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/constants/theme';

export default function IndexScreen() {
  const { isOnboarded, isLoggedIn } = useApp();
  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOnboarded) {
        router.replace('/onboarding');
      } else if (!isLoggedIn) {
        router.replace('/welcome');
      } else {
        router.replace('/(tabs)');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isOnboarded, isLoggedIn]);

  return <View style={[styles.container, { backgroundColor: theme.background }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
