import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme, Platform, ScrollView } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function AdminLayout() {
    const { user } = useApp();
    const router = useRouter();
    const pathname = usePathname();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;

    useEffect(() => {
        // Basic redirect if not admin
        // Note: If user data is fully parsed and role exists, check here.
        if (!user) {
            router.replace('/signin');
        } else if ((user as any).role !== 'admin') {
            router.replace('/(tabs)');
        }
    }, [user]);

    const navItems = [
        { name: 'Dashboard', route: '/(admin)', icon: 'grid-outline' },
        { name: 'Users', route: '/(admin)/users', icon: 'people-outline' },
        { name: 'Salons', route: '/(admin)/salons', icon: 'business-outline' },
        { name: 'Bookings', route: '/(admin)/bookings', icon: 'calendar-outline' },
        { name: 'Services', route: '/(admin)/services', icon: 'cut-outline' },
        { name: 'Staff', route: '/(admin)/staff', icon: 'id-card-outline' },
        { name: 'Exit Admin', route: '/(tabs)', icon: 'exit-outline' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Sidebar */}
            {Platform.OS === 'web' && (
                <View style={[styles.sidebar, { borderRightColor: colors.border, backgroundColor: colors.surface }]}>
                    <View style={styles.logoContainer}>
                        <View style={[styles.logoDot, { backgroundColor: colors.primary }]} />
                        <Text style={[styles.logoText, { color: colors.text }]}>Admin Panel</Text>
                    </View>

                    <ScrollView style={styles.navConfig}>
                        {navItems.map((item) => {
                            const isActive = item.route === '/(admin)' ? pathname === '/(admin)' || pathname === '/(admin)/' : pathname.startsWith(item.route);
                            return (
                                <Pressable
                                    key={item.name}
                                    onPress={() => router.push(item.route as any)}
                                    style={[
                                        styles.navItem,
                                        isActive && { backgroundColor: `${colors.primary}20` },
                                    ]}
                                >
                                    <Ionicons
                                        name={item.icon as any}
                                        size={22}
                                        color={isActive ? colors.primary : colors.textSecondary}
                                    />
                                    <Text style={[styles.navText, { color: isActive ? colors.primary : colors.textSecondary }]}>
                                        {item.name}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* Main Content Area */}
            <View style={styles.content}>
                <Slot />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    },
    sidebar: {
        width: 260,
        borderRightWidth: 1,
        height: '100%',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        gap: 12,
    },
    logoDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    logoText: {
        fontFamily: 'Urbanist_700Bold',
        fontSize: 22,
    },
    navConfig: {
        flex: 1,
        paddingHorizontal: 16,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
        gap: 16,
    },
    navText: {
        fontFamily: 'Urbanist_600SemiBold',
        fontSize: 16,
    },
    content: {
        flex: 1,
        overflow: 'hidden',
    },
});
