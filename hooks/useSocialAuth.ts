import { useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { apiRequest } from '@/lib/query-client';

WebBrowser.maybeCompleteAuthSession();

function getApiBase() {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return 'http://localhost:5000';
}

export function useSocialAuth() {
  const { setUser } = useApp();

  const handleGooglePress = useCallback(async () => {
    try {
      const apiBase = getApiBase();
      const completeUrl = `${apiBase}/api/auth/google/complete`;

      if (Platform.OS === 'android') {
        await WebBrowser.warmUpAsync();
      }

      const authUrl = `${apiBase}/api/auth/google/start`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, completeUrl, {
        showInRecents: false,
        preferEphemeralSession: true,
      });

      if (Platform.OS === 'android') {
        await WebBrowser.coolDownAsync();
      }

      if (result.type === 'success' || result.type === 'dismiss') {
        try {
          const meRes = await apiRequest('GET', '/api/auth/me');
          if (meRes.ok) {
            const data = await meRes.json();
            if (data.user) {
              setUser(data.user);
              router.replace('/(tabs)');
              return;
            }
          }
        } catch {}
      }
    } catch (e: any) {
      console.error('Google Sign-In error:', e);
      Alert.alert('Google Sign-In Failed', e?.message || 'Please try again.');
    }
  }, [setUser]);

  const handleFacebookPress = useCallback(() => {
    Alert.alert('Not Available', 'Facebook Sign-In is not available at this time. Please use Google or email to sign in.');
  }, []);

  const handleApplePress = useCallback(() => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Sign-In is only available on iOS devices.');
      return;
    }
    Alert.alert('Not Available', 'Apple Sign-In is not configured yet. Please use Google or email to sign in.');
  }, []);

  return {
    handleGooglePress,
    handleFacebookPress,
    handleApplePress,
  };
}
