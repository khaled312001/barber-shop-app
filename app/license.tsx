import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '@/lib/query-client';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

export default function LicenseScreen() {
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email.trim() || !licenseKey.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال البريد الإلكتروني ومفتاح الترخيص');
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest('POST', '/api/auth/verify-license', {
        email: email.trim(),
        licenseKey: licenseKey.trim().toUpperCase(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid license');

      await AsyncStorage.setItem('license_verified', 'true');
      await AsyncStorage.setItem('license_salon_id', data.salonId || '');
      await AsyncStorage.setItem('license_salon_name', data.salonName || '');
      await AsyncStorage.setItem('license_key', licenseKey.trim().toUpperCase());

      router.replace('/role-select');
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('expired')) {
        Alert.alert('منتهي الصلاحية', 'مفتاح الترخيص منتهي الصلاحية. تواصل مع الدعم.');
      } else if (msg.includes('suspended')) {
        Alert.alert('موقوف', 'مفتاح الترخيص موقوف. تواصل مع الدعم.');
      } else if (msg.includes('revoked')) {
        Alert.alert('ملغي', 'مفتاح الترخيص ملغي.');
      } else {
        Alert.alert('خطأ', 'مفتاح الترخيص غير صحيح. تحقق من المعلومات وأعد المحاولة.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoBox}>
          <View style={styles.logoCircle}>
            <Ionicons name="cut" size={36} color="#181A20" />
          </View>
          <Text style={styles.logoText}>Barmagly</Text>
          <Text style={styles.logoSub}>Smart Barber Management Platform</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>تفعيل الترخيص</Text>
          <Text style={styles.cardSub}>أدخل بياناتك للوصول إلى النظام</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#444"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>مفتاح الترخيص</Text>
            <View style={styles.inputRow}>
              <Ionicons name="key-outline" size={18} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="BRMG-XXXX-XXXX"
                placeholderTextColor="#444"
                value={licenseKey}
                onChangeText={setLicenseKey}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <Pressable
            onPress={handleVerify}
            style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.85 : 1 }]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#181A20" />
            ) : (
              <>
                <Ionicons name="shield-checkmark-outline" size={18} color="#181A20" />
                <Text style={styles.btnText}>تفعيل</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Status indicators */}
        <View style={styles.statusRow}>
          {[
            { icon: 'checkmark-circle', color: '#10B981', label: 'License Active' },
            { icon: 'time-outline', color: '#F59E0B', label: 'License Expired' },
            { icon: 'ban-outline', color: '#EF4444', label: 'License Suspended' },
          ].map((s, i) => (
            <View key={i} style={styles.statusItem}>
              <Ionicons name={s.icon as any} size={14} color={s.color} />
              <Text style={[styles.statusLabel, { color: s.color }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={() => router.push('/welcome')} style={styles.skipLink}>
          <Text style={styles.skipText}>تسجيل دخول كعميل بدون ترخيص ←</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40, alignItems: 'center' },
  logoBox: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 22, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  logoText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 28 },
  logoSub: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginTop: 4, textAlign: 'center' },
  card: { width: '100%', backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, padding: 24, marginBottom: 24 },
  cardTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20, marginBottom: 6 },
  cardSub: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#13151B', borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, gap: 10 },
  input: { flex: 1, height: 50, color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 15 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: PRIMARY, borderRadius: 14, height: 54, marginTop: 8 },
  btnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  statusRow: { flexDirection: 'row', gap: 16, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' },
  statusItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusLabel: { fontFamily: 'Urbanist_500Medium', fontSize: 11 },
  skipLink: { marginTop: 8 },
  skipText: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
});
