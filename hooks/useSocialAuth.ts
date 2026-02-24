import { useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export function useSocialAuth() {
  const { googleLogin, facebookLogin, appleLogin } = useApp();

  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const facebookAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: googleClientId || 'placeholder',
    webClientId: googleClientId || 'placeholder',
  });

  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: facebookAppId || 'placeholder',
  });

  useEffect(() => {
    if (googleResponse?.type === 'success' && googleResponse.authentication?.accessToken) {
      (async () => {
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${googleResponse.authentication!.accessToken}` },
          });
          const userInfo = await res.json();
          await googleLogin(userInfo.email, userInfo.name, userInfo.picture);
          router.replace('/(tabs)');
        } catch (e: any) {
          Alert.alert('Google Sign-In Failed', e?.message || 'Please try again.');
        }
      })();
    }
  }, [googleResponse]);

  useEffect(() => {
    if (fbResponse?.type === 'success' && fbResponse.authentication?.accessToken) {
      (async () => {
        try {
          const res = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${fbResponse.authentication!.accessToken}`);
          const userInfo = await res.json();
          await facebookLogin(
            userInfo.email || `${userInfo.id}@facebook.com`,
            userInfo.name,
            userInfo.picture?.data?.url || ''
          );
          router.replace('/(tabs)');
        } catch (e: any) {
          Alert.alert('Facebook Sign-In Failed', e?.message || 'Please try again.');
        }
      })();
    }
  }, [fbResponse]);

  const handleGooglePress = useCallback(() => {
    if (!googleClientId) {
      Alert.alert('Setup Required', 'Google Sign-In requires a Google OAuth Client ID. Please configure EXPO_PUBLIC_GOOGLE_CLIENT_ID in your environment.');
      return;
    }
    googlePromptAsync();
  }, [googleClientId, googlePromptAsync]);

  const handleFacebookPress = useCallback(() => {
    if (!facebookAppId) {
      Alert.alert('Setup Required', 'Facebook Login requires a Facebook App ID. Please configure EXPO_PUBLIC_FACEBOOK_APP_ID in your environment.');
      return;
    }
    fbPromptAsync();
  }, [facebookAppId, fbPromptAsync]);

  const handleApplePress = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Sign-In is only available on iOS devices. Please use Google or Facebook to sign in on this platform.');
      return;
    }
    try {
      const AppleAuth = require('expo-apple-authentication');
      const isAvailable = await AppleAuth.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Not Available', 'Apple Sign-In is not available on this device. It requires iOS 13 or later.');
        return;
      }
      const credential = await AppleAuth.signInAsync({
        requestedScopes: [
          AppleAuth.AppleAuthenticationScope.FULL_NAME,
          AppleAuth.AppleAuthenticationScope.EMAIL,
        ],
      });
      const email = credential.email || `apple_${credential.user}@privaterelay.appleid.com`;
      const fullName = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(' ')
        : '';
      await appleLogin(email, fullName || 'Apple User');
      router.replace('/(tabs)');
    } catch (e: any) {
      if (e?.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple Sign-In Failed', e?.message || 'Please try again.');
      }
    }
  }, [appleLogin]);

  return {
    handleGooglePress,
    handleFacebookPress,
    handleApplePress,
  };
}
