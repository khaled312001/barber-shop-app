import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

const menuItems = [
  { icon: 'person-outline' as const, label: 'Edit Profile', route: '/edit-profile' },
  { icon: 'notifications-outline' as const, label: 'Notification', route: '/settings' },
  { icon: 'card-outline' as const, label: 'Payment', route: '/settings' },
  { icon: 'shield-checkmark-outline' as const, label: 'Security', route: '/settings' },
  { icon: 'language-outline' as const, label: 'Language', route: '/settings' },
  { icon: 'eye-outline' as const, label: 'Privacy Policy', route: '/settings' },
  { icon: 'people-outline' as const, label: 'Invite Friends', route: '/settings' },
  { icon: 'help-circle-outline' as const, label: 'Help Center', route: '/settings' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Logout',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
          router.replace('/welcome');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <Image source={{ uri: user?.avatar }} style={styles.avatar} contentFit="cover" />
          <Text style={[styles.profileName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{user?.fullName}</Text>
          <Text style={[styles.profileEmail, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{user?.email}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {menuItems.map((item, i) => (
          <Pressable
            key={i}
            onPress={() => router.push(item.route as any)}
            style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name={item.icon as any} size={24} color={theme.text} />
            <Text style={[styles.menuLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </Pressable>
        ))}

        <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="log-out-outline" size={24} color={theme.error} />
          <Text style={[styles.logoutText, { color: theme.error, fontFamily: 'Urbanist_600SemiBold' }]}>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 16 },
  title: { fontSize: 24 },
  profileSection: { alignItems: 'center', paddingVertical: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  profileName: { fontSize: 22, marginBottom: 4 },
  profileEmail: { fontSize: 14 },
  divider: { height: 1, marginHorizontal: 24, marginVertical: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, gap: 16 },
  menuLabel: { flex: 1, fontSize: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, gap: 16, marginTop: 8 },
  logoutText: { fontSize: 16 },
});
