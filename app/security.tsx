import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Platform } from 'react-native';
import { router } from 'expo-router';
import { goBack } from '@/lib/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SecurityScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLanguage();

  const [faceId, setFaceId] = useState(false);
  const [biometricId, setBiometricId] = useState(true);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => goBack()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="close" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('security')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: webBottomInset + 40 }}>
        <View style={[styles.settingRow, { borderBottomColor: theme.divider, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[styles.settingLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold', textAlign: isRTL ? 'right' : 'left' }]}>{t('face_id')}</Text>
          <Switch
            value={faceId}
            onValueChange={setFaceId}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        </View>
        <View style={[styles.settingRow, { borderBottomColor: theme.divider, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[styles.settingLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold', textAlign: isRTL ? 'right' : 'left' }]}>{t('biometric_id')}</Text>
          <Switch
            value={biometricId}
            onValueChange={setBiometricId}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        </View>

        <Pressable
          onPress={() => router.push('/change-password')}
          style={({ pressed }) => [styles.settingRow, { borderBottomColor: theme.divider, opacity: pressed ? 0.6 : 1, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
        >
          <Text style={[styles.settingLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold', textAlign: isRTL ? 'right' : 'left' }]}>{t('change_password')}</Text>
          <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={theme.textTertiary} />
        </Pressable>

        <Pressable
          onPress={() => { }}
          style={({ pressed }) => [styles.settingRow, { borderBottomColor: theme.divider, opacity: pressed ? 0.6 : 1, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
        >
          <Text style={[styles.settingLabel, { color: theme.text, fontFamily: 'Urbanist_600SemiBold', textAlign: isRTL ? 'right' : 'left' }]}>{t('change_pin')}</Text>
          <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={theme.textTertiary} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 20, textAlign: 'center' },
  settingRow: { justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  settingLabel: { fontSize: 16, flex: 1 },
});
