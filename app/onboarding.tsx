import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, FlatList, Pressable, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { onboardingSlides } from '@/constants/data';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { setIsOnboarded } = useApp();
  const { t, isRTL } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const handleNext = () => {
    if (activeIndex < onboardingSlides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      setIsOnboarded(true);
      router.replace('/welcome');
    }
  };

  const handleSkip = () => {
    setIsOnboarded(true);
    router.replace('/welcome');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={{ uri: item.image }} style={styles.slideImage} contentFit="cover" />
            <LinearGradient
              colors={['transparent', theme.isDark ? 'rgba(24,26,32,0.8)' : 'rgba(255,255,255,0.8)', theme.background]}
              style={styles.gradient}
            />
            <View style={[styles.textContainer, { paddingBottom: 180 + (Platform.OS === 'web' ? webBottomInset : insets.bottom) }]}>
              <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{item.title}</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />
      <View style={[styles.bottomContainer, { paddingBottom: (Platform.OS === 'web' ? webBottomInset : insets.bottom) + 20 }]}>
        <View style={styles.dotsContainer}>
          {onboardingSlides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === activeIndex ? theme.primary : theme.border },
                i === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
        <View style={styles.buttonsRow}>
          <Pressable onPress={handleSkip} style={({ pressed }) => [styles.skipBtn, { backgroundColor: theme.isDark ? theme.surfaceAlt : theme.surface, opacity: pressed ? 0.8 : 1 }]}>
            <Text style={[styles.skipText, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{t('skip')}</Text>
          </Pressable>
          <Pressable onPress={handleNext} style={({ pressed }) => [styles.nextBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}>
            <Text style={[styles.nextText, { fontFamily: 'Urbanist_600SemiBold' }]}>
              {activeIndex === onboardingSlides.length - 1 ? t('get_started') : t('next')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { width, height, position: 'relative' },
  slideImage: { width: '100%', height: '65%' },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' },
  textContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, alignItems: 'center' },
  title: { fontSize: 36, textAlign: 'center', marginBottom: 12, lineHeight: 44 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24 },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
  buttonsRow: { flexDirection: 'row', gap: 12 },
  skipBtn: { flex: 1, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  skipText: { fontSize: 16 },
  nextBtn: { flex: 1, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  nextText: { fontSize: 16, color: '#fff' },
});
