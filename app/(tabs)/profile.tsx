import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, I18nManager } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DEFAULT_AVATAR } from '@/constants/images';

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout } = useApp();
  const { t, isRTL } = useLanguage();

  const menuItems = [
    { icon: 'person-outline' as const, label: t('edit_profile'), route: '/edit-profile' },
    { icon: 'gift-outline' as const, label: t('loyalty_rewards'), route: '/loyalty' },
    { icon: 'notifications-outline' as const, label: t('notification'), route: '/notification-settings' },
    { icon: 'card-outline' as const, label: t('payment'), route: '/payment-methods' },
    { icon: 'shield-checkmark-outline' as const, label: t('security'), route: '/security' },
    { icon: 'language-outline' as const, label: t('language'), route: '/settings' },
    { icon: 'eye-outline' as const, label: t('privacy_policy'), route: '/privacy-policy' },
    { icon: 'people-outline' as const, label: t('invite_friends'), route: '/invite-friends' },
    { icon: 'help-circle-outline' as const, label: t('help_center'), route: '/help-center' },
  ];

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  const handleLogout = () => {
    Alert.alert(t('logout_confirm_title'), t('logout_confirm_msg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('yes_logout'),
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
        <View style={[styles.header, { paddingTop: topPad + 12, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold', textAlign: isRTL ? 'right' : 'left' }]}>{t('profile')}</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={user?.avatar ? { uri: user.avatar } : DEFAULT_AVATAR} style={styles.avatar} contentFit="cover" />
            {user?.role === 'admin' && (
              <View style={[styles.adminBadge, { backgroundColor: theme.primary }]}>
                <Ionicons name="shield-checkmark" size={12} color="#fff" />
              </View>
            )}
          </View>
          <Text style={[styles.profileName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{user?.fullName}</Text>
          <Text style={[styles.profileEmail, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{user?.email}</Text>
          {user?.loyaltyPoints !== undefined && (
            <View style={[styles.loyaltyBadge, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="star" size={14} color={theme.primary} />
              <Text style={[styles.loyaltyText, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>{user.loyaltyPoints} {t('points')}</Text>
            </View>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {menuItems.map((item, i) => (
          <Pressable
            key={i}
            onPress={() => router.push(item.route as any)}
            style={({ pressed }) => [
              styles.menuItem,
              { opacity: pressed ? 0.6 : 1, flexDirection: isRTL ? 'row-reverse' : 'row' }
            ]}
          >
            <Ionicons name={item.icon as any} size={24} color={theme.text} />
            <Text style={[styles.menuLabel, {
              color: theme.text,
              fontFamily: 'Urbanist_600SemiBold',
              textAlign: isRTL ? 'right' : 'left',
              marginHorizontal: 16
            }]}>{item.label}</Text>
            <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={theme.textTertiary} />
          </Pressable>
        ))}

        {(user as any)?.role === 'admin' && (
          <Pressable
            onPress={() => router.push('/(admin)' as any)}
            style={({ pressed }) => [
              styles.menuItem,
              { opacity: pressed ? 0.6 : 1, flexDirection: isRTL ? 'row-reverse' : 'row' }
            ]}
          >
            <Ionicons name="shield-half-outline" size={24} color={theme.primary} />
            <Text style={[styles.menuLabel, {
              color: theme.primary,
              fontFamily: 'Urbanist_700Bold',
              textAlign: isRTL ? 'right' : 'left',
              marginHorizontal: 16
            }]}>Admin Dashboard</Text>
            <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={theme.primary} />
          </Pressable>
        )}

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            { opacity: pressed ? 0.6 : 1, flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}
        >
          <Ionicons name="log-out-outline" size={24} color={theme.error} />
          <Text style={[styles.logoutText, {
            color: theme.error,
            fontFamily: 'Urbanist_600SemiBold',
            textAlign: isRTL ? 'right' : 'left',
            marginHorizontal: 16
          }]}>{t('logout')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 16 },
  title: { fontSize: 24, flex: 1 },
  profileSection: { alignItems: 'center', paddingVertical: 16 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  adminBadge: { position: 'absolute', bottom: 15, right: 0, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  profileName: { fontSize: 22, marginBottom: 4 },
  profileEmail: { fontSize: 14, marginBottom: 8 },
  loyaltyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  loyaltyText: { fontSize: 12 },
  divider: { height: 1, marginHorizontal: 24, marginVertical: 16 },
  menuItem: { alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24 },
  menuLabel: { flex: 1, fontSize: 16 },
  logoutBtn: { alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, marginTop: 8 },
  logoutText: { fontSize: 16, flex: 1 },
});
