import React, { useEffect, useState } from 'react';
import { Slot, useRouter, usePathname } from 'expo-router';
import { Platform, View, StyleSheet, Pressable, Text, ScrollView, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';
const SIDEBAR_WIDTH = 240;

const { width: SCREEN_W } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function SalonAdminLayout() {
  const { user, isLoggedIn, authLoading } = useApp();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(SCREEN_W);

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
    { route: '/pos', label: t('pos') || 'POS', icon: 'receipt' },
    { route: '/appointments', label: t('tab_bookings') || 'Bookings', icon: 'calendar' },
    { route: '/staff', label: t('staff_title') || 'Staff', icon: 'people' },
    { route: '/services', label: t('services') || 'Services', icon: 'cut' },
    { route: '/products', label: t('products') || 'Products', icon: 'bag-handle' },
    { route: '/inventory', label: t('inventory_title') || 'Inventory', icon: 'cube' },
    { route: '/customers', label: t('clients') || 'Clients', icon: 'person' },
    { route: '/messages', label: t('messages') || 'Messages', icon: 'chatbubbles' },
    { route: '/analytics', label: t('tab_analytics') || 'Analytics', icon: 'bar-chart' },
    { route: '/notifications', label: t('notifications') || 'Notifications', icon: 'notifications' },
    { route: '/profile', label: t('tab_settings') || 'Settings', icon: 'settings' },
  ];

  const handleNav = (route: string) => {
    setDrawerOpen(false);
    router.push(route as any);
  };

  const renderSidebar = (isDrawer: boolean) => (
    <View style={[styles.sidebar, !isDrawer && styles.sidebarFixed]}>
      {/* Logo */}
      <View style={styles.logoBox}>
        <View style={styles.logoIcon}>
          <Ionicons name="cut" size={20} color="#181A20" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.logoText}>Barmagly</Text>
          <Text style={styles.logoSubtext}>Salon Admin</Text>
        </View>
        {isDrawer && (
          <Pressable onPress={() => setDrawerOpen(false)} style={styles.closeIcon}>
            <Ionicons name="close" size={22} color="#888" />
          </Pressable>
        )}
      </View>

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
                  isActive && styles.navItemActive,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={[styles.navIconWrap, isActive && styles.navIconWrapActive]}>
                  <Ionicons
                    name={(isActive ? item.icon : `${item.icon}-outline`) as any}
                    size={18}
                    color={isActive ? PRIMARY : '#888'}
                  />
                </View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]} numberOfLines={1}>
                  {item.label}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* User profile footer */}
      <View style={styles.userFooter}>
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={18} color={PRIMARY} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName} numberOfLines={1}>{user?.fullName || 'Admin'}</Text>
          <Text style={styles.userRole}>Salon Admin</Text>
        </View>
      </View>
    </View>
  );

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
  navItemActive: { backgroundColor: `${PRIMARY}12` },
  navIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  navIconWrapActive: { backgroundColor: `${PRIMARY}20` },
  navLabel: { color: '#aaa', fontFamily: 'Urbanist_600SemiBold', fontSize: 14, flex: 1 },
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
