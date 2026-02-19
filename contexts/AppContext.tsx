import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Booking, type Salon, mockBookings, salons } from '@/constants/data';

interface User {
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  nickname: string;
  gender: string;
  dob: string;
}

interface AppContextValue {
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  user: User;
  setUser: (u: User) => void;
  bookmarks: string[];
  toggleBookmark: (salonId: string) => void;
  isBookmarked: (salonId: string) => boolean;
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  cancelBooking: (id: string) => void;
}

const defaultUser: User = {
  fullName: 'Andrew Ainsley',
  email: 'andrew@example.com',
  phone: '+1 234 567 890',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  nickname: 'andrew_ainsley',
  gender: 'Male',
  dob: '12/27/1995',
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User>(defaultUser);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);

  useEffect(() => {
    (async () => {
      try {
        const [ob, li, bk, bkgs] = await Promise.all([
          AsyncStorage.getItem('onboarded'),
          AsyncStorage.getItem('loggedIn'),
          AsyncStorage.getItem('bookmarks'),
          AsyncStorage.getItem('bookings'),
        ]);
        if (ob === 'true') setIsOnboarded(true);
        if (li === 'true') setIsLoggedIn(true);
        if (bk) setBookmarks(JSON.parse(bk));
        if (bkgs) setBookings(JSON.parse(bkgs));
      } catch {}
    })();
  }, []);

  const handleSetOnboarded = (v: boolean) => {
    setIsOnboarded(v);
    AsyncStorage.setItem('onboarded', v ? 'true' : 'false');
  };

  const handleSetLoggedIn = (v: boolean) => {
    setIsLoggedIn(v);
    AsyncStorage.setItem('loggedIn', v ? 'true' : 'false');
  };

  const toggleBookmark = (salonId: string) => {
    setBookmarks(prev => {
      const next = prev.includes(salonId) ? prev.filter(id => id !== salonId) : [...prev, salonId];
      AsyncStorage.setItem('bookmarks', JSON.stringify(next));
      return next;
    });
  };

  const isBookmarked = (salonId: string) => bookmarks.includes(salonId);

  const addBooking = (b: Booking) => {
    setBookings(prev => {
      const next = [b, ...prev];
      AsyncStorage.setItem('bookings', JSON.stringify(next));
      return next;
    });
  };

  const cancelBooking = (id: string) => {
    setBookings(prev => {
      const next = prev.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b);
      AsyncStorage.setItem('bookings', JSON.stringify(next));
      return next;
    });
  };

  const value = useMemo(() => ({
    isOnboarded, setIsOnboarded: handleSetOnboarded,
    isLoggedIn, setIsLoggedIn: handleSetLoggedIn,
    user, setUser,
    bookmarks, toggleBookmark, isBookmarked,
    bookings, addBooking, cancelBooking,
  }), [isOnboarded, isLoggedIn, user, bookmarks, bookings]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
