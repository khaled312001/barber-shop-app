import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';

export default function StaffLayout() {
  const { user, isLoggedIn, authLoading } = useApp();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || !user) {
      router.replace('/signin');
      return;
    }
    if (user.role !== 'staff') {
      router.replace('/(tabs)');
    }
  }, [user, isLoggedIn, authLoading]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#F4A460',
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: 'Urbanist_600SemiBold', fontSize: 11, marginTop: -2 },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.select({
            ios: 'transparent',
            android: colors.background,
            web: colors.background,
          }),
          borderTopWidth: 1,
          borderTopColor: '#35383F',
          height: Platform.OS === 'web' ? 84 : 85,
          paddingBottom: Platform.OS === 'web' ? 34 : 30,
          paddingTop: 8,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'جدولي',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'حجوزاتي',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'ملفي',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
