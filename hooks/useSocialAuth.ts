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
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://localhost:5000';
}

// Route to correct home based on stored user role.
function routeByRole(role?: string) {
  if (role === 'salon_admin') return router.replace('/(salon-admin)' as any);
  if (role === 'staff') return router.replace('/(staff)' as any);
  if (role === 'admin' || role === 'super_admin') return router.replace('/(admin)' as any);
  return router.replace('/(tabs)');
}

async function fetchMeAndRoute(setUser: (u: any) => void): Promise<boolean> {
  try {
    const meRes = await apiRequest('GET', '/api/auth/me');
    if (meRes.ok) {
      const data = await meRes.json();
      if (data.user) {
        setUser(data.user);
        routeByRole(data.user.role);
        return true;
      }
    }
  } catch (err) {
    console.warn('fetchMeAndRoute failed:', err);
  }
  return false;
}

export function useSocialAuth() {
  const { setUser } = useApp();

  const handleGooglePress = useCallback(async () => {
    const apiBase = getApiBase();
    const authUrl = `${apiBase}/api/auth/google/start`;
    const completeUrl = `${apiBase}/api/auth/google/complete`;

    // Web: open popup and listen for postMessage/BroadcastChannel signal
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Attach listeners BEFORE opening the popup
      let done = false;
      let popup: Window | null = null;
      let bc: BroadcastChannel | null = null;

      const cleanup = () => {
        window.removeEventListener('message', onMessage);
        if (bc) { try { bc.close(); } catch {} bc = null; }
        if (pollInterval) clearInterval(pollInterval);
      };

      const finish = async () => {
        if (done) return;
        done = true;
        cleanup();
        try { popup?.close(); } catch {}
        await fetchMeAndRoute(setUser);
      };

      const onMessage = (e: MessageEvent) => {
        if (e.data && e.data.type === 'google-auth-success') {
          finish();
        }
      };
      window.addEventListener('message', onMessage);

      // BroadcastChannel — works even if postMessage blocked by COOP
      try {
        bc = new BroadcastChannel('casca-auth');
        bc.onmessage = (e) => {
          if (e.data && e.data.type === 'google-auth-success') finish();
        };
      } catch {}

      // Open popup (or new tab as fallback)
      const w = 520, h = 600;
      const left = (window.screen.width - w) / 2;
      const top = (window.screen.height - h) / 2;
      popup = window.open(
        authUrl,
        'google-signin',
        `width=${w},height=${h},left=${left},top=${top},toolbar=0,menubar=0,location=1,status=0`
      );

      // If popup blocked — redirect this window (no popup)
      if (!popup) {
        window.location.href = authUrl;
        return;
      }

      // Poll as fallback — some browsers/COOP still allow window.closed
      // We also poll /api/auth/me periodically (in case postMessage never arrives)
      let tries = 0;
      const pollInterval = setInterval(async () => {
        tries++;
        // Try closed check (may throw due to COOP)
        try {
          if (popup && popup.closed) {
            clearInterval(pollInterval);
            // Give session a moment, then check /me
            setTimeout(async () => {
              const ok = await fetchMeAndRoute(setUser);
              if (!ok && !done) {
                // User probably cancelled; just cleanup.
                cleanup();
              } else {
                done = true;
                cleanup();
              }
            }, 600);
            return;
          }
        } catch {
          // COOP blocked — ignore, keep polling /me instead
        }
        // Every 2 seconds, try /me
        if (tries % 2 === 0 && !done) {
          const ok = await fetchMeAndRoute(setUser);
          if (ok) {
            done = true;
            cleanup();
            try { popup?.close(); } catch {}
          }
        }
        // Timeout after 120s
        if (tries > 60) {
          clearInterval(pollInterval);
          cleanup();
        }
      }, 1000);
      return;
    }

    // Native (iOS/Android): use WebBrowser.openAuthSessionAsync
    try {
      if (Platform.OS === 'android') await WebBrowser.warmUpAsync();
      const result = await WebBrowser.openAuthSessionAsync(authUrl, completeUrl, {
        showInRecents: false,
        preferEphemeralSession: true,
      });
      if (Platform.OS === 'android') await WebBrowser.coolDownAsync();
      if (result.type === 'success' || result.type === 'dismiss') {
        await fetchMeAndRoute(setUser);
      }
    } catch (e: any) {
      console.error('Google Sign-In error:', e);
      Alert.alert('Google Sign-In Failed', e?.message || 'Please try again.');
    }
  }, [setUser]);

  // Google One Tap (web only) — shows the floating popup in top-right
  const initGoogleOneTap = useCallback((clientId: string) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof document === 'undefined') return;
    const w: any = window;
    if (w.__cascaGisInit) return; // already initialized
    w.__cascaGisInit = true;

    const load = () => new Promise<void>((resolve, reject) => {
      if (w.google && w.google.accounts && w.google.accounts.id) return resolve();
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = reject;
      document.head.appendChild(s);
    });

    load().then(() => {
      if (!w.google?.accounts?.id) return;
      w.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            const res = await apiRequest('POST', '/api/auth/google/token', { credential: response.credential });
            if (res.ok) {
              const data = await res.json();
              if (data.user) {
                setUser(data.user);
                routeByRole(data.user.role);
              }
            }
          } catch (e) {
            console.error('One Tap auth failed:', e);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: false,
        itp_support: true,
      });
      // Show One Tap prompt (floating popup top-right)
      try {
        w.google.accounts.id.prompt();
      } catch (e) {
        console.warn('One Tap prompt failed:', e);
      }
    }).catch(err => console.warn('Google GIS load failed:', err));
  }, [setUser]);

  const renderGoogleButton = useCallback((elementId: string, clientId: string) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof document === 'undefined') return;
    const w: any = window;
    const tryRender = () => {
      const el = document.getElementById(elementId);
      if (el && w.google?.accounts?.id) {
        try {
          el.innerHTML = '';
          w.google.accounts.id.renderButton(el, {
            theme: 'filled_black',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: Math.min(el.clientWidth || 320, 400),
          });
        } catch (e) { console.warn('Render button failed:', e); }
      } else {
        setTimeout(tryRender, 300);
      }
    };
    tryRender();
  }, []);

  const handleFacebookPress = useCallback(() => {
    const msg = 'Facebook Sign-In is not available. Please use Google or email.';
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.alert(msg);
    else Alert.alert('Not Available', msg);
  }, []);

  const handleApplePress = useCallback(() => {
    const msg = Platform.OS !== 'ios'
      ? 'Apple Sign-In is only available on iOS devices.'
      : 'Apple Sign-In is not configured yet. Please use Google or email.';
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.alert(msg);
    else Alert.alert('Not Available', msg);
  }, []);

  return {
    handleGooglePress,
    handleFacebookPress,
    handleApplePress,
    initGoogleOneTap,
    renderGoogleButton,
  };
}
