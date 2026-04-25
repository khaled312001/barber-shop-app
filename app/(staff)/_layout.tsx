import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';

export default function StaffLayout() {
  const { user, isLoggedIn, authLoading } = useApp();
  const { t, isRTL } = useLanguage();
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
      router.replace('/home');
    }
  }, [user, isLoggedIn, authLoading]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#F4A460',
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: 'Urbanist_700Bold', fontSize: 11, marginTop: 2, marginBottom: 4 },
        tabBarIconStyle: { marginTop: 4 },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.select({
            ios: 'transparent',
            android: colors.background,
            web: colors.background,
          }),
          borderTopWidth: 1,
          borderTopColor: '#35383F',
          height: Platform.OS === 'web' ? 72 : 80,
          paddingBottom: Platform.OS === 'web' ? 10 : 20,
          paddingTop: 8,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          ) : null,
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="schedule"
        options={{
          title: (() => { const s = t('staff_schedule'); return s && s !== 'staff_schedule' ? s : 'Schedule'; })(),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: (() => { const s = t('staff_appointments'); return s && s !== 'staff_appointments' ? s : 'Appointments'; })(),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: (() => { const s = t('staff_earnings'); return s && s !== 'staff_earnings' ? s : 'Earnings'; })(),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cash' : 'cash-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: (() => { const s = t('messages'); return s && s !== 'messages' ? s : 'Messages'; })(),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: (() => { const s = t('staff_profile'); return s && s !== 'staff_profile' ? s : 'Profile'; })(),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
