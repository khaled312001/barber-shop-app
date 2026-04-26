import React, { useEffect, useState } from 'react';
import { Slot, useRouter, usePathname } from 'expo-router';
import { Platform, View, StyleSheet, Pressable, Text, ScrollView, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/contexts/NotificationContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';
const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 72;
const COLLAPSED_KEY = 'salonAdmin.sidebarCollapsed';

const { width: SCREEN_W } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function SalonAdminLayout() {
  const { user, isLoggedIn, authLoading } = useApp();
  const { t } = useLanguage();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(SCREEN_W);
  // Default to collapsed; only expand if the user has explicitly opened it before.
  const [collapsed, setCollapsed] = useState(true);

  // Load collapsed state
  useEffect(() => {
    AsyncStorage.getItem(COLLAPSED_KEY).then(v => {
      // Stored '0' = expanded, '1' (or unset) = collapsed
      if (v === '0') setCollapsed(false);
    }).catch(() => {});
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      AsyncStorage.setItem(COLLAPSED_KEY, next ? '1' : '0').catch(() => {});
      return next;
    });
  };

  // Track window resize on web
  useEffect(() => {
    if (isWeb && typeof window !== 'undefined') {
      const handler = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handler);
      return () => window.removeEventListener('resize', handler);
    }
  }, []);

  const isCompact = windowWidth < 900;

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || !user) {
      router.replace('/signin');
      return;
    }
    if (user.role !== 'salon_admin') {
      router.replace('/home');
    }
  }, [user, isLoggedIn, authLoading]);

  const navItems = [
    { route: '/dashboard', label: t('dashboard') || 'Dashboard', icon: 'grid' },
    { route: '/checkin', label: t('checkin') || 'Check-in', icon: 'qr-code' },
    { route: '/pos', label: t('pos') || 'POS', icon: 'receipt' },
    { route: '/appointments', label: t('tab_bookings') || 'Bookings', icon: 'calendar' },
    { route: '/staff', label: t('staff_title') || 'Staff', icon: 'people' },
    { route: '/services', label: t('services') || 'Services', icon: 'cut' },
    { route: '/products', label: t('products') || 'Products', icon: 'bag-handle' },
    { route: '/orders', label: t('orders') || 'Orders', icon: 'receipt' },
    { route: '/inventory', label: t('inventory_title') || 'Inventory', icon: 'cube' },
    { route: '/customers', label: t('clients') || 'Clients', icon: 'person' },
    { route: '/messages', label: t('messages') || 'Messages', icon: 'chatbubbles' },
    { route: '/reels', label: t('reels') || 'Reels', icon: 'play-circle' },
    { route: '/analytics', label: t('tab_analytics') || 'Analytics', icon: 'bar-chart' },
    { route: '/notifications', label: t('notifications') || 'Notifications', icon: 'notifications' },
    { route: '/profile', label: t('tab_settings') || 'Settings', icon: 'settings' },
  ];

  const handleNav = (route: string) => {
    setDrawerOpen(false);
    router.push(route as any);
  };

  const renderSidebar = (isDrawer: boolean) => {
    // In drawer (mobile), always show full width with labels
    const isCollapsed = !isDrawer && collapsed;
    return (
    <View style={[
      styles.sidebar,
      !isDrawer && styles.sidebarFixed,
      { width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH },
    ]}>
      {/* Header — combines logo + current user (frees up footer space) */}
      <View style={[styles.logoBox, isCollapsed && styles.logoBoxCollapsed]}>
        <View style={styles.logoIcon}>
          <Ionicons name="cut" size={20} color="#181A20" />
        </View>
        {!isCollapsed && (
          <View style={{ flex: 1 }}>
            <Text style={styles.logoText} numberOfLines={1}>{user?.fullName || 'Barmagly'}</Text>
            <Text style={styles.logoSubtext}>{t('salon_admin_role') || 'Salon Admin'}</Text>
          </View>
        )}
        {isDrawer ? (
          <Pressable onPress={() => setDrawerOpen(false)} style={styles.closeIcon}>
            <Ionicons name="close" size={22} color="#888" />
          </Pressable>
        ) : (
          !isCollapsed && (
            <Pressable onPress={toggleCollapsed} style={styles.closeIcon} {...({ title: 'Collapse' } as any)}>
              <Ionicons name="chevron-back" size={20} color="#888" />
            </Pressable>
          )
        )}
      </View>

      {/* Collapsed expand button */}
      {isCollapsed && (
        <Pressable onPress={toggleCollapsed} style={styles.expandBtn} {...({ title: 'Expand' } as any)}>
          <Ionicons name="chevron-forward" size={18} color="#888" />
        </Pressable>
      )}

      {/* Nav items */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.navSection}>
          {navItems.map((item) => {
            const isActive = pathname === item.route || pathname.startsWith(item.route + '/');
            return (
              <Pressable
                key={item.route}
                onPress={() => handleNav(item.route)}
                style={({ pressed }) => [
                  styles.navItem,
                  isCollapsed && styles.navItemCollapsed,
                  isActive && styles.navItemActive,
                  pressed && { opacity: 0.7 },
                ]}
                {...({ title: isCollapsed ? item.label : undefined } as any)}
              >
                <View style={[styles.navIconWrap, isActive && styles.navIconWrapActive]}>
                  <Ionicons
                    name={(isActive ? item.icon : `${item.icon}-outline`) as any}
                    size={18}
                    color={isActive ? PRIMARY : '#888'}
                  />
                </View>
                {!isCollapsed && (
                  <Text style={[styles.navLabel, isActive && styles.navLabelActive]} numberOfLines={1}>
                    {item.label}
                  </Text>
                )}
                {item.route === '/notifications' && unreadCount > 0 && (
                  <View style={[styles.navBadge, isCollapsed && { position: 'absolute', top: 4, right: 8 }]}>
                    <Text style={styles.navBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                  </View>
                )}
                {item.route === '/messages' && (() => {
                  // could add unread message count here too
                  return null;
                })()}
                {isActive && <View style={styles.activeIndicator} />}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

    </View>
    );
  };

  // Mobile / Compact: Top bar + drawer
  if (isCompact) {
    const currentNav = navItems.find(n => pathname === n.route || pathname.startsWith(n.route + '/'));
    return (
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => setDrawerOpen(true)} style={styles.menuBtn}>
            <Ionicons name="menu" size={24} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.topBarTitle}>{currentNav?.label || 'Salon'}</Text>
          </View>
          <Pressable onPress={() => router.push('/notifications' as any)} style={styles.menuBtn}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Slot />
        </View>

        {/* Drawer */}
        <Modal visible={drawerOpen} transparent animationType="slide" onRequestClose={() => setDrawerOpen(false)}>
          <Pressable style={styles.drawerOverlay} onPress={() => setDrawerOpen(false)}>
            <Pressable onPress={(e) => e.stopPropagation?.()}>
              {renderSidebar(true)}
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  }

  // Web large screen: side-by-side layout
  return (
    <View style={[styles.container, { flexDirection: 'row' }]}>
      {renderSidebar(false)}
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Top bar (mobile)
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  topBarTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18 },
  menuBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  // Sidebar
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: CARD,
    borderRightWidth: 1, borderRightColor: BORDER,
    height: '100%',
  },
  sidebarFixed: {
    height: '100vh' as any,
  },

  // Logo
  logoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 16, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  logoBoxCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  expandBtn: {
    alignSelf: 'center',
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: BG, borderWidth: 1, borderColor: BORDER,
    marginTop: 8,
  },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  logoSubtext: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 11 },
  closeIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  // Nav
  navSection: { padding: 8 },
  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 12, paddingVertical: 11,
    borderRadius: 10, marginBottom: 2, position: 'relative',
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  navItemActive: { backgroundColor: `${PRIMARY}12` },
  navIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  navIconWrapActive: { backgroundColor: `${PRIMARY}20` },
  navLabel: { color: '#aaa', fontFamily: 'Urbanist_600SemiBold', fontSize: 14, flex: 1 },
  navBadge: { backgroundColor: '#EF4444', minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  navBadgeText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 10 },
  navLabelActive: { color: '#fff', fontFamily: 'Urbanist_700Bold' },
  activeIndicator: {
    position: 'absolute', right: 0, top: '20%', bottom: '20%',
    width: 3, borderRadius: 2, backgroundColor: PRIMARY,
  },

  // User footer
  userFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderTopWidth: 1, borderTopColor: BORDER,
  },
  userFooterCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  userAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${PRIMARY}20`, alignItems: 'center', justifyContent: 'center',
  },
  userName: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  userRole: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 11 },

  // Drawer overlay (mobile)
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
  },
});
