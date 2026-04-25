import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { router, Href } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');
const useNative = Platform.OS !== 'web';

export default function SplashIntroScreen() {
  const { isOnboarded, isLoggedIn, authLoading, user } = useApp();
  const [licenseChecked, setLicenseChecked] = useState(false);
  const [licenseVerified, setLicenseVerified] = useState(false);
  const [ready, setReady] = useState(false);

  // Animations
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem('license_verified').then(val => {
      setLicenseVerified(val === 'true');
      setLicenseChecked(true);
    });
  }, []);

  // Run splash animation
  useEffect(() => {
    // Logo bounce in
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: useNative,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: useNative,
        }),
      ]),
      // Text fade in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: useNative,
      }),
      // Subtitle fade in
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: useNative,
      }),
    ]).start();

    // Shimmer loop on logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: useNative,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: useNative,
        }),
      ])
    ).start();

    // Mark ready after splash duration
    const timer = setTimeout(() => setReady(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  // Navigate after splash + data ready
  useEffect(() => {
    if (!ready || authLoading || !licenseChecked) return;

    const timer = setTimeout(() => {
      if (!isOnboarded) {
        router.replace('/onboarding');
        return;
      }
      if (isLoggedIn && user) {
        if (user.role === 'salon_admin') {
          router.replace('/dashboard');
        } else if (user.role === 'staff') {
          router.replace('/schedule');
        } else {
          router.replace('/home');
        }
        return;
      }
      if (!licenseVerified) {
        router.replace('/license' as Href);
        return;
      }
      router.replace('/role-select' as Href);
    }, 200);

    return () => clearTimeout(timer);
  }, [ready, isOnboarded, isLoggedIn, authLoading, user, licenseChecked, licenseVerified]);

  const glowOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      {/* Background decorative circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          },
        ]}
      >
        <Animated.View style={[styles.logoGlow, { opacity: glowOpacity }]} />
        <View style={styles.logoInner}>
          <Ionicons name="cut" size={48} color="#181A20" />
        </View>
      </Animated.View>

      {/* App Name */}
      <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
        Barmagly
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: subtitleOpacity }]}>
        Smart Salon Management
      </Animated.Text>

      {/* Bottom loading indicator */}
      <View style={styles.bottomSection}>
        <Animated.View style={[styles.loadingBar, { opacity: subtitleOpacity }]}>
          <Animated.View
            style={[
              styles.loadingBarFill,
              {
                transform: [
                  {
                    scaleX: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.2, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(244, 164, 96, 0.03)',
    top: -width * 0.5,
    left: -width * 0.25,
  },
  bgCircle2: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width * 0.5,
    backgroundColor: 'rgba(244, 164, 96, 0.02)',
    bottom: -width * 0.3,
    right: -width * 0.2,
  },
  logoContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(244, 164, 96, 0.15)',
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#F4A460',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(244, 164, 96, 0.4)',
      },
      default: {
        shadowColor: '#F4A460',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 20,
      },
    }),
  },
  appName: {
    fontSize: 42,
    fontFamily: 'Urbanist_700Bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Urbanist_400Regular',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    width: '100%',
  },
  loadingBar: {
    width: 120,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBarFill: {
    height: '100%',
    backgroundColor: '#F4A460',
    borderRadius: 2,
    transformOrigin: 'left',
  },
});
