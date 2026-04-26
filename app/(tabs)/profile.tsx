import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { DEFAULT_AVATAR } from '@/constants/images';

const LANGS: { code: Language; label: string; name: string }[] = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ar', label: 'AR', name: 'العربية' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout } = useApp();
  const { t, isRTL, language, setLanguage } = useLanguage();

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('logout_confirm_msg') || 'Are you sure you want to logout?')) {
        (async () => { await logout(); router.replace('/signin'); })();
      }
      return;
    }
    Alert.alert(t('logout_confirm_title'), t('logout_confirm_msg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('yes_logout') || 'Logout',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
          router.replace('/signin');
        },
      },
    ]);
  };

  const menuSections = [
    {
      title: t('account') || 'Account',
      items: [
        { icon: 'person-outline' as const, label: t('edit_profile'), route: '/edit-profile', color: '#6C63FF' },
        { icon: 'bag-handle-outline' as const, label: t('my_orders') || 'My Orders', route: '/my-orders', color: '#F4A460' },
        { icon: 'gift-outline' as const, label: t('loyalty_rewards'), route: '/loyalty', color: '#F59E0B' },
        { icon: 'card-outline' as const, label: t('payment'), route: '/payment-methods', color: '#10B981' },
      ],
    },
    {
      title: t('preferences') || 'Preferences',
      items: [
        { icon: 'notifications-outline' as const, label: t('notification'), route: '/notification-settings', color: '#3B82F6' },
        { icon: 'shield-checkmark-outline' as const, label: t('security'), route: '/security', color: '#8B5CF6' },
      ],
    },
    {
      title: t('support') || 'Support',
      items: [
        { icon: 'eye-outline' as const, label: t('privacy_policy'), route: '/privacy-policy', color: '#64748B' },
        { icon: 'people-outline' as const, label: t('invite_friends'), route: '/invite-friends', color: '#EC4899' },
        { icon: 'help-circle-outline' as const, label: t('help_center'), route: '/help-center', color: '#0EA5E9' },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold', textAlign: isRTL ? 'right' : 'left' }]}>{t('profile')}</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View style={styles.profileTop}>
            <View style={styles.avatarContainer}>
              <Image source={user?.avatar ? { uri: user.avatar } : DEFAULT_AVATAR} style={styles.avatar} contentFit="cover" />
              <Pressable
                onPress={() => router.push('/edit-profile' as any)}
                style={[styles.editAvatarBtn, { backgroundColor: theme.primary }]}
              >
                <Ionicons name="camera" size={14} color="#fff" />
              </Pressable>
            </View>
            <View style={[styles.profileInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.profileName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{user?.fullName}</Text>
              <Text style={[styles.profileEmail, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{user?.email}</Text>
              {user?.phone && (
                <Text style={[styles.profilePhone, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{user.phone}</Text>
              )}
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statItem, { borderRightWidth: 1, borderRightColor: theme.divider }]}>
              <Ionicons name="star" size={18} color="#F59E0B" />
              <Text style={[styles.statValue, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{user?.loyaltyPoints ?? 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{t('points')}</Text>
            </View>
            <View style={[styles.statItem, { borderRightWidth: 1, borderRightColor: theme.divider }]}>
              <Ionicons name="calendar" size={18} color="#3B82F6" />
              <Text style={[styles.statValue, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>—</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{t('tab_bookings')}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={18} color="#EF4444" />
              <Text style={[styles.statValue, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>—</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{t('favorites') || 'Favorites'}</Text>
            </View>
          </View>
        </View>

        {/* Language Switcher */}
        <View style={[styles.langSection, { backgroundColor: theme.card }]}>
          <View style={[styles.langHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="language-outline" size={20} color={theme.primary} />
            <Text style={[styles.langTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold', textAlign: isRTL ? 'right' : 'left' }]}>{t('language')}</Text>
          </View>
          <View style={styles.langRow}>
            {LANGS.map(lang => {
              const isActive = language === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => setLanguage(lang.code)}
                  style={[styles.langBtn, isActive && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                >
                  <View style={[styles.langBadge, { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : theme.primary + '20' }]}>
                    <Text style={[styles.langBadgeText, { color: isActive ? '#fff' : theme.primary, fontFamily: 'Urbanist_700Bold' }]}>
                      {lang.label}
                    </Text>
                  </View>
                  <Text style={[styles.langLabel, { color: isActive ? '#fff' : theme.text, fontFamily: isActive ? 'Urbanist_700Bold' : 'Urbanist_500Medium' }]}>
                    {lang.name}
                  </Text>
                  {isActive && <Ionicons name="checkmark-circle" size={16} color="#fff" />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, si) => (
          <View key={si} style={[styles.menuSection, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold', textAlign: isRTL ? 'right' : 'left' }]}>
              {section.title}
            </Text>
            {section.items.map((item, i) => (
              <Pressable
                key={i}
                onPress={() => router.push(item.route as any)}
                style={({ pressed }) => [
                  styles.menuItem,
                  { opacity: pressed ? 0.7 : 1, flexDirection: isRTL ? 'row-reverse' : 'row' },
                  i < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.divider },
                ]}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={[styles.menuLabel, {
                  color: theme.text,
                  fontFamily: 'Urbanist_600SemiBold',
                  textAlign: isRTL ? 'right' : 'left',
                }]}>{item.label}</Text>
                <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={18} color={theme.textTertiary} />
              </Pressable>
            ))}
          </View>
        ))}

        {/* Admin Dashboard */}
        {(user as any)?.role === 'admin' && (
          <View style={[styles.menuSection, { backgroundColor: theme.card }]}>
            <Pressable
              onPress={() => router.push('/admin' as any)}
              style={({ pressed }) => [
                styles.menuItem,
                { opacity: pressed ? 0.7 : 1, flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="shield-half-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.menuLabel, {
                color: theme.primary,
                fontFamily: 'Urbanist_700Bold',
                textAlign: isRTL ? 'right' : 'left',
              }]}>{t('admin_dashboard')}</Text>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={18} color={theme.primary} />
            </Pressable>
          </View>
        )}

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            { opacity: pressed ? 0.8 : 1, flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={[styles.logoutText, { fontFamily: 'Urbanist_700Bold' }]}>{t('logout')}</Text>
        </Pressable>

        {/* App Version */}
        <Text style={[styles.version, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>
          Barmagly v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 8 },
  title: { fontSize: 28 },

  // Profile Card
  profileCard: { marginHorizontal: 20, borderRadius: 20, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(244,164,96,0.15)' },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: -2,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#1F222A',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, marginBottom: 4 },
  profileEmail: { fontSize: 13, marginBottom: 2 },
  profilePhone: { fontSize: 13 },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#35383F', paddingTop: 16 },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18 },
  statLabel: { fontSize: 11 },

  // Language
  langSection: { marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  langHeader: { alignItems: 'center', gap: 8, marginBottom: 12 },
  langTitle: { fontSize: 15, flex: 1 },
  langRow: { flexDirection: 'column', gap: 8 },
  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#35383F', backgroundColor: 'transparent',
  },
  langBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, minWidth: 40, alignItems: 'center' },
  langBadgeText: { fontSize: 11 },
  langLabel: { fontSize: 14, flex: 1 },

  // Menu
  menuSection: { marginHorizontal: 20, borderRadius: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  sectionTitle: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  menuItem: { alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 14 },
  menuIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15 },

  // Logout
  logoutBtn: {
    alignItems: 'center', justifyContent: 'center', gap: 10,
    marginHorizontal: 20, marginTop: 4, marginBottom: 8,
    backgroundColor: '#EF444415', borderRadius: 16, paddingVertical: 16,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
  },
  logoutText: { fontSize: 16, color: '#EF4444' },

  // Version
  version: { textAlign: 'center', fontSize: 12, marginTop: 8, marginBottom: 20 },
});
