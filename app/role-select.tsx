import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

const ROLE_DEFS = [
  { key: 'admin', icon: 'shield-checkmark', labelKey: 'role_admin_label', descKey: 'role_admin_desc', subKey: '', color: '#6C63FF', route: '/dashboard' },
  { key: 'barber', icon: 'cut', labelKey: 'role_barber_label', descKey: 'role_barber_desc', subKey: 'role_barber_sub', color: PRIMARY, route: '/schedule' },
  { key: 'customer', icon: 'person', labelKey: 'role_customer_label', descKey: 'role_customer_desc', subKey: '', color: '#10B981', route: '/(tabs)' },
];

export default function RoleSelectScreen() {
  const { user, authLoading } = useApp();
  const { t, isRTL } = useLanguage();
  const [salonName, setSalonName] = useState('');
  const [loading, setLoading] = useState(false);
  const ROLES = ROLE_DEFS.map(r => ({
    ...r,
    label: t(r.labelKey as any),
    labelAr: r.subKey ? t(r.subKey as any) : '',
    desc: t(r.descKey as any),
  }));

  useEffect(() => {
    AsyncStorage.getItem('license_salon_name').then(n => {
      if (n) setSalonName(n);
    });
  }, []);

  const handleSelect = async (role: typeof ROLES[0]) => {
    setLoading(true);
    await AsyncStorage.setItem('selected_role', role.key);
    setTimeout(() => {
      if (role.key === 'customer') {
        if (user) {
          router.replace('/home');
        } else {
          router.replace('/signin');
        }
      } else if (role.key === 'admin') {
        if (user?.role === 'salon_admin') {
          router.replace('/dashboard');
        } else {
          router.replace('/signin');
        }
      } else if (role.key === 'barber') {
        if (user?.role === 'staff') {
          router.replace('/schedule');
        } else {
          router.replace('/signin');
        }
      }
      setLoading(false);
    }, 200);
  };

  if (authLoading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={PRIMARY} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Ionicons name="cut" size={26} color="#181A20" />
        </View>
        <Text style={styles.title}>{t('select_your_role')}</Text>
        {salonName ? (
          <View style={styles.salonNameRow}>
            <Ionicons name="location" size={14} color={PRIMARY} />
            <Text style={styles.salonName}>{salonName}</Text>
          </View>
        ) : null}
        <Text style={styles.subtitle}>{t('role_subtitle')}</Text>
      </View>

      {/* Role Cards */}
      <View style={styles.cards}>
        {ROLES.map(role => (
          <Pressable
            key={role.key}
            onPress={() => handleSelect(role)}
            style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1, borderColor: `${role.color}44` }]}
            disabled={loading}
          >
            <View style={[styles.iconBox, { backgroundColor: `${role.color}22` }]}>
              <Ionicons name={role.icon as any} size={30} color={role.color} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.roleName}>{role.label}</Text>
              <Text style={styles.roleAr}>{role.labelAr}</Text>
              <Text style={styles.roleDesc}>{role.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#444" />
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => router.replace('/license' as Href)} style={styles.back}>
        <Ionicons name="arrow-back" size={16} color="#666" />
        <Text style={styles.backText}>{t('change_license_key')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, paddingHorizontal: 24, paddingTop: 80 },
  header: { alignItems: 'center', marginBottom: 36 },
  logoCircle: { width: 60, height: 60, borderRadius: 18, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 26, marginBottom: 6 },
  salonNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  salonName: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 14 },
  subtitle: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 13, textAlign: 'center' },
  cards: { gap: 14 },
  card: { backgroundColor: CARD, borderRadius: 18, borderWidth: 1, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1 },
  roleName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 17, marginBottom: 2 },
  roleAr: { color: '#aaa', fontFamily: 'Urbanist_500Medium', fontSize: 13, marginBottom: 4 },
  roleDesc: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 12 },
  back: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 32 },
  backText: { color: '#666', fontFamily: 'Urbanist_500Medium', fontSize: 13 },
});
