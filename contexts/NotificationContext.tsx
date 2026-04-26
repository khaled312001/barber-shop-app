import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '@/lib/query-client';
import { useApp } from './AppContext';

type ServerNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

type Toast = {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'booking' | 'review' | 'system' | 'order';
  onPress?: () => void;
};

type Ctx = {
  unreadCount: number;
  notifications: ServerNotification[];
  refresh: () => Promise<void>;
  showToast: (t: Omit<Toast, 'id'>) => void;
  setSoundEnabled: (v: boolean) => void;
  soundEnabled: boolean;
};

const NotificationContext = createContext<Ctx | null>(null);

const POLL_MS = 15000; // 15s

// Persistent AudioContext + warm-up on user gesture.
// Browsers block AudioContext until a user clicks/keys somewhere; we create the
// context on the first user gesture and reuse it for all subsequent beeps.
let _audioCtx: any = null;
let _gestureAttached = false;

function ensureAudioCtxOnGesture() {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || _gestureAttached) return;
  _gestureAttached = true;
  const init = () => {
    try {
      const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return;
      if (!_audioCtx) _audioCtx = new Ctor();
      if (_audioCtx.state === 'suspended') _audioCtx.resume().catch(() => {});
    } catch {}
  };
  ['pointerdown', 'keydown', 'touchstart', 'click'].forEach(ev =>
    window.addEventListener(ev, init, { once: false, passive: true })
  );
}

function playBeep() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return;
    if (!_audioCtx) _audioCtx = new Ctor();
    const ctx = _audioCtx;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    if (ctx.state !== 'running') return;
    // Two-tone "ding" — rises then falls, sounds more like a notification
    const now = ctx.currentTime;
    const make = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.22, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    };
    make(880, 0, 0.18);
    make(1320, 0.12, 0.22);
  } catch {}
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, user } = useApp();
  const [notifications, setNotifications] = useState<ServerNotification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  // Restore sound pref
  useEffect(() => {
    AsyncStorage.getItem('notif_sound').then(v => {
      if (v === '0') setSoundEnabledState(false);
    }).catch(() => {});
  }, []);
  const setSoundEnabled = useCallback((v: boolean) => {
    setSoundEnabledState(v);
    AsyncStorage.setItem('notif_sound', v ? '1' : '0').catch(() => {});
  }, []);

  const showToast = useCallback((t: Omit<Toast, 'id'>) => {
    const toast: Toast = { ...t, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== toast.id));
    }, 5000);
    if (soundEnabled) playBeep();
  }, [soundEnabled]);

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn || !user) return;
    try {
      const res = await apiRequest('GET', '/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;

      // Detect new ones (skip toasts on first load)
      if (!initialLoadRef.current) {
        for (const n of data) {
          if (!seenIdsRef.current.has(n.id) && !n.read) {
            // New unread notification → toast
            const type: Toast['type'] = (n.type === 'message' || n.type === 'booking' || n.type === 'review' || n.type === 'order') ? n.type : 'system';
            showToast({ title: n.title, message: n.message, type });
          }
        }
      }
      // Update seen set
      seenIdsRef.current = new Set(data.map((n: ServerNotification) => n.id));
      initialLoadRef.current = false;
      setNotifications(data);
    } catch {}
  }, [isLoggedIn, user, showToast]);

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      seenIdsRef.current.clear();
      initialLoadRef.current = true;
      return;
    }
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_MS);
    return () => clearInterval(id);
  }, [isLoggedIn, fetchNotifications]);

  // Also poll messages — show a toast on new salon→user reply
  const lastMsgIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isLoggedIn || !user) return;
    const role = (user as any).role;
    let endpoint = '/api/messages';
    if (role === 'salon_admin') endpoint = '/api/salon/messages';
    else if (role === 'staff') endpoint = '/api/staff/messages';
    let cancelled = false;
    let firstRun = true;
    const tick = async () => {
      try {
        const r = await apiRequest('GET', endpoint);
        if (!r.ok) return;
        const list = await r.json();
        if (!Array.isArray(list) || cancelled) return;
        // Find newest unread
        const unread = list.filter((c: any) => (c.unread > 0 || c.unreadCount > 0));
        if (!firstRun && unread.length > 0) {
          const top = unread[0];
          const key = `${top.salonId || top.userId}::${top.lastMessage}`;
          if (lastMsgIdRef.current !== key) {
            lastMsgIdRef.current = key;
            showToast({
              title: top.chatName || top.salonName || top.userName || 'New message',
              message: String(top.lastMessage || '').slice(0, 100),
              type: 'message',
            });
          }
        }
        firstRun = false;
      } catch {}
    };
    tick();
    const id = setInterval(tick, 20000);
    return () => { cancelled = true; clearInterval(id); };
  }, [isLoggedIn, user, showToast]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const value = useMemo(() => ({
    unreadCount,
    notifications,
    refresh: fetchNotifications,
    showToast,
    setSoundEnabled,
    soundEnabled,
  }), [unreadCount, notifications, fetchNotifications, showToast, setSoundEnabled, soundEnabled]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Toast stack */}
      <View pointerEvents="box-none" style={styles.toastWrap}>
        {toasts.slice(-3).map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
        ))}
      </View>
    </NotificationContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const slide = useRef(new Animated.Value(-50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  const meta = TOAST_META[toast.type];

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY: slide }], opacity }]}>
      <View style={[styles.toastIcon, { backgroundColor: meta.color + '22' }]}>
        <Ionicons name={meta.icon as any} size={18} color={meta.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.toastTitle} numberOfLines={1}>{toast.title}</Text>
        {!!toast.message && <Text style={styles.toastMessage} numberOfLines={2}>{toast.message}</Text>}
      </View>
      <Pressable onPress={onDismiss} style={styles.toastClose}>
        <Ionicons name="close" size={16} color="#888" />
      </Pressable>
    </Animated.View>
  );
}

const TOAST_META: Record<Toast['type'], { color: string; icon: string }> = {
  message: { color: '#3B82F6', icon: 'chatbubble' },
  booking: { color: '#F4A460', icon: 'calendar' },
  review: { color: '#FBBF24', icon: 'star' },
  order: { color: '#10B981', icon: 'bag' },
  system: { color: '#888', icon: 'notifications' },
};

const styles = StyleSheet.create({
  toastWrap: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 16 : 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1F222A',
    borderColor: '#35383F',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    width: 360,
    maxWidth: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  toastIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  toastTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 13 },
  toastMessage: { color: '#aaa', fontFamily: 'Urbanist_400Regular', fontSize: 12, marginTop: 1 },
  toastClose: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
});

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
}
