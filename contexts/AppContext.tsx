import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  nickname: string;
  gender: string;
  dob: string;
  createdAt: string;
}

interface Booking {
  id: string;
  userId: string;
  salonId: string;
  salonName: string;
  salonImage: string;
  services: string[];
  date: string;
  time: string;
  totalPrice: number;
  status: string;
  paymentMethod: string;
  createdAt: string | null;
}

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string | null;
}

interface AppContextValue {
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
  isLoggedIn: boolean;
  authLoading: boolean;
  user: User | null;
  setUser: (u: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  bookmarks: string[];
  toggleBookmark: (salonId: string) => void;
  isBookmarked: (salonId: string) => boolean;
  bookings: Booking[];
  refreshBookings: () => Promise<void>;
  addBooking: (data: any) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  notifications: NotificationItem[];
  refreshNotifications: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isOnboarded, setIsOnboardedState] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const setIsOnboarded = useCallback((v: boolean) => {
    setIsOnboardedState(v);
    AsyncStorage.setItem('onboarded', v ? 'true' : 'false');
  }, []);

  const fetchBookmarks = useCallback(async () => {
    try {
      const res = await apiRequest('GET', '/api/bookmarks');
      const data = await res.json();
      setBookmarks(data);
    } catch (e) {
      console.warn('Failed to fetch bookmarks:', e);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await apiRequest('GET', '/api/bookings');
      const data = await res.json();
      setBookings(data);
    } catch (e) {
      console.warn('Failed to fetch bookings:', e);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiRequest('GET', '/api/notifications');
      const data = await res.json();
      setNotifications(data);
    } catch (e) {
      console.warn('Failed to fetch notifications:', e);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    await Promise.all([fetchBookmarks(), fetchBookings(), fetchNotifications()]);
  }, [fetchBookmarks, fetchBookings, fetchNotifications]);

  useEffect(() => {
    (async () => {
      try {
        const ob = await AsyncStorage.getItem('onboarded');
        if (ob === 'true') setIsOnboardedState(true);
      } catch {}

      try {
        const res = await apiRequest('GET', '/api/auth/me');
        const userData = await res.json();
        setUser(userData);
        setIsLoggedIn(true);
        await fetchUserData();
      } catch {
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiRequest('POST', '/api/auth/signin', { email, password });
    const userData = await res.json();
    setUser(userData);
    setIsLoggedIn(true);
    await fetchUserData();
  }, [fetchUserData]);

  const signup = useCallback(async (fullName: string, email: string, password: string) => {
    const res = await apiRequest('POST', '/api/auth/signup', { fullName, email, password });
    const userData = await res.json();
    setUser(userData);
    setIsLoggedIn(true);
    await fetchUserData();
  }, [fetchUserData]);

  const logout = useCallback(async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
    } catch (e) {
      console.warn('Logout request failed:', e);
    }
    setUser(null);
    setIsLoggedIn(false);
    setBookmarks([]);
    setBookings([]);
    setNotifications([]);
  }, []);

  const toggleBookmark = useCallback(async (salonId: string) => {
    try {
      await apiRequest('POST', '/api/bookmarks/toggle', { salonId });
      setBookmarks(prev =>
        prev.includes(salonId) ? prev.filter(id => id !== salonId) : [...prev, salonId]
      );
    } catch (e) {
      console.warn('Failed to toggle bookmark:', e);
    }
  }, []);

  const isBookmarked = useCallback((salonId: string) => bookmarks.includes(salonId), [bookmarks]);

  const refreshBookings = useCallback(async () => {
    await fetchBookings();
  }, [fetchBookings]);

  const addBooking = useCallback(async (data: any) => {
    try {
      const res = await apiRequest('POST', '/api/bookings', data);
      const newBooking = await res.json();
      setBookings(prev => [newBooking, ...prev]);
    } catch (e) {
      console.warn('Failed to add booking:', e);
      throw e;
    }
  }, []);

  const cancelBooking = useCallback(async (id: string) => {
    try {
      await apiRequest('PUT', `/api/bookings/${id}/cancel`);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (e) {
      console.warn('Failed to cancel booking:', e);
      throw e;
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  const value = useMemo(() => ({
    isOnboarded, setIsOnboarded,
    isLoggedIn, authLoading,
    user, setUser,
    login, signup, logout,
    bookmarks, toggleBookmark, isBookmarked,
    bookings, refreshBookings, addBooking, cancelBooking,
    notifications, refreshNotifications,
  }), [isOnboarded, setIsOnboarded, isLoggedIn, authLoading, user, login, signup, logout, bookmarks, toggleBookmark, isBookmarked, bookings, refreshBookings, addBooking, cancelBooking, notifications, refreshNotifications]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

export type { Booking, NotificationItem, User };
