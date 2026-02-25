import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { goBack } from '@/lib/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

const shareOptions = [
  { id: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp' as const, color: '#25D366' },
  { id: 'facebook', label: 'Facebook', icon: 'logo-facebook' as const, color: '#1877F2' },
  { id: 'twitter', label: 'Twitter', icon: 'logo-twitter' as const, color: '#1DA1F2' },
  { id: 'email', label: 'Email', icon: 'mail-outline' as const, color: '#F4A460' },
  { id: 'sms', label: 'SMS', icon: 'chatbubble-outline' as const, color: '#4CAF50' },
];

export default function InviteFriendsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const { t, isRTL } = useLanguage();

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  const referralCode = user?.id
    ? `CASCA${user.id.slice(-6).toUpperCase()}`
    : 'CASCA000000';

  const shareMessage = `Join me on Casca! Use my referral code ${referralCode} to get a discount on your first booking. Download now!`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralCode);
    Alert.alert(t('copied'), t('code_copied'));
  };

  const handleShare = async () => {
    if (Platform.OS === 'web') {
      await Clipboard.setStringAsync(shareMessage);
      Alert.alert(t('copied'), t('link_copied'));
    } else {
      try {
        const Sharing = require('expo-sharing');
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(shareMessage);
        } else {
          await Clipboard.setStringAsync(shareMessage);
          Alert.alert(t('copied'), t('link_copied'));
        }
      } catch {
        await Clipboard.setStringAsync(shareMessage);
        Alert.alert(t('copied'), t('link_copied'));
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => goBack()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('invite_friends')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: webBottomInset + 40, paddingHorizontal: 24 }}>
        <Text style={[styles.description, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
          {t('invite_friends_desc')}
        </Text>

        <View style={[styles.codeCard, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
          <Text style={[styles.codeLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>{t('your_referral_code')}</Text>
          <Text style={[styles.codeText, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>{referralCode}</Text>
          <Pressable
            onPress={handleCopy}
            style={({ pressed }) => [styles.copyBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.7 : 1, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            <Ionicons name="copy-outline" size={18} color="#fff" />
            <Text style={[styles.copyText, { fontFamily: 'Urbanist_600SemiBold' }]}>{t('copy_code')}</Text>
          </Pressable>
        </View>

        <Text style={[styles.shareTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold', textAlign: isRTL ? 'right' : 'left' }]}>{t('share_via')}</Text>

        <View style={[styles.shareGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {shareOptions.map((option) => (
            <Pressable
              key={option.id}
              onPress={handleShare}
              style={({ pressed }) => [styles.shareItem, { opacity: pressed ? 0.6 : 1 }]}
            >
              <View style={[styles.shareIcon, { backgroundColor: theme.surface }]}>
                <Ionicons name={option.icon} size={28} color={option.color} />
              </View>
              <Text style={[styles.shareLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>{option.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [styles.shareBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.7 : 1, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
        >
          <Ionicons name="share-social-outline" size={20} color="#fff" />
          <Text style={[styles.shareBtnText, { fontFamily: 'Urbanist_700Bold' }]}>{t('share_link')}</Text>
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
  description: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  codeCard: { alignItems: 'center', padding: 24, borderRadius: 20, borderWidth: 1.5, marginBottom: 32 },
  codeLabel: { fontSize: 14, marginBottom: 8 },
  codeText: { fontSize: 32, letterSpacing: 4, marginBottom: 16 },
  copyBtn: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, gap: 6 },
  copyText: { color: '#fff', fontSize: 14 },
  shareTitle: { fontSize: 18, marginBottom: 16 },
  shareGrid: { flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 32 },
  shareItem: { alignItems: 'center', width: '18%', marginBottom: 16 },
  shareIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  shareLabel: { fontSize: 11 },
  shareBtn: { height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', gap: 8 },
  shareBtnText: { color: '#fff', fontSize: 16 },
});
