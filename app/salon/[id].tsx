import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, Dimensions, FlatList, ActivityIndicator, Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { goBack } from '@/lib/navigation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn, getImageUrl } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');
type DetailTab = 'about' | 'services' | 'package' | 'products' | 'gallery' | 'review';

function getServiceIcon(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('haircut') || n.includes('cut') || n.includes('trim')) return 'cut';
  if (n.includes('shave') || n.includes('beard')) return 'razor-sharp';
  if (n.includes('color') || n.includes('dye') || n.includes('balayage') || n.includes('highlight')) return 'color-palette';
  if (n.includes('massage') || n.includes('relax') || n.includes('spa')) return 'leaf';
  if (n.includes('facial') || n.includes('face') || n.includes('skin')) return 'happy';
  if (n.includes('nail') || n.includes('manicure') || n.includes('pedicure')) return 'hand-left';
  if (n.includes('blow') || n.includes('dry') || n.includes('style')) return 'bonfire';
  if (n.includes('wash') || n.includes('shampoo') || n.includes('condition')) return 'water';
  if (n.includes('treatment') || n.includes('therapy') || n.includes('deep')) return 'medkit';
  if (n.includes('makeup') || n.includes('make up')) return 'brush';
  return 'cut';
}

function hapticLight() {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

interface Service { id: string; name: string; price: number; duration: string; image: string; category: string; }
interface Package { id: string; name: string; price: number; originalPrice: number; services: string[]; image: string; }
interface Review { id: string; userName: string; userImage: string; rating: number; comment: string; date: string; }
interface Specialist { id: string; name: string; role: string; image: string; rating: number; }
interface Salon {
  id: string; name: string; image: string; address: string; distance: string; rating: number;
  reviewCount: number; isOpen: boolean; openHours: string; phone: string; about: string; website: string;
  latitude: number; longitude: number; gallery: string[]; services: Service[];
  packages: Package[]; reviews: Review[]; specialists: Specialist[];
}

function ReviewItem({ review }: { review: Review }) {
  const theme = useTheme();
  return (
    <View style={[rstyles.reviewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={rstyles.reviewHeader}>
        <Image source={{ uri: getImageUrl(review.userImage) }} style={rstyles.reviewAvatar} contentFit="cover" />
        <View style={rstyles.reviewInfo}>
          <Text style={[rstyles.reviewName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{review.userName}</Text>
          <View style={rstyles.starsRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <Ionicons key={s} name={s <= review.rating ? 'star' : 'star-outline'} size={13} color={theme.star} />
            ))}
            <Text style={[rstyles.ratingSmall, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>{review.rating}.0</Text>
          </View>
        </View>
        <Text style={[rstyles.reviewDate, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>{review.date}</Text>
      </View>
      <Text style={[rstyles.reviewText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{review.comment}</Text>
    </View>
  );
}

function SpecialistItem({ specialist, salonId, salonName }: { specialist: Specialist; salonId: string; salonName: string }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => {
        hapticLight();
        router.push({ pathname: '/specialist/[id]' as any, params: { id: specialist.id, salonId, salonName } });
      }}
      style={({ pressed }) => [rstyles.specialistCard, pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] }]}
    >
      <View style={rstyles.specialistImageWrap}>
        <Image source={{ uri: getImageUrl(specialist.image) }} style={[rstyles.specialistImage, { borderColor: theme.primary }]} contentFit="cover" />
        <View style={[rstyles.ratingBadge, { backgroundColor: theme.primary, borderColor: theme.background }]}>
          <Ionicons name="star" size={10} color="#fff" />
          <Text style={rstyles.ratingText}>{specialist.rating}</Text>
        </View>
      </View>
      <Text style={[rstyles.specialistName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>{specialist.name}</Text>
      <Text style={[rstyles.specialistRole, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]} numberOfLines={1}>{specialist.role}</Text>
    </Pressable>
  );
}

export default function SalonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const { toggleBookmark, isBookmarked } = useApp();
  const [activeTab, setActiveTab] = useState<DetailTab>('about');
  const { data: salon, isLoading } = useQuery<Salon>({ queryKey: ['/api/salons', id], queryFn: getQueryFn({ on401: 'throw' }) });
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;
  const bottomPad = Platform.OS === 'web' ? webBottomInset : insets.bottom;

  const tabs: DetailTab[] = ['about', 'services', 'package', 'products', 'gallery', 'review'];

  // Salon products (only this salon's items)
  const { data: salonProducts } = useQuery<any[]>({
    queryKey: ['/api/products', { salonId: id }],
    queryFn: async () => {
      const r = await fetch(`/api/products?salonId=${id}`, { credentials: 'include' });
      if (!r.ok) return [];
      return r.json();
    },
    enabled: !!id,
  });

  if (isLoading || !salon) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const lowestPrice = salon.services && salon.services.length > 0
    ? Math.min(...salon.services.map(s => s.price))
    : null;

  const openMap = () => {
    const query = encodeURIComponent(salon.address);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      web: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    if (url) Linking.openURL(url);
  };

  const callPhone = () => {
    if (salon.phone) Linking.openURL(`tel:${salon.phone}`);
  };

  const renderAbout = () => (
    <View style={dstyles.section}>
      <Text style={[dstyles.aboutText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
        {salon.about || t('no_description_yet') || 'No description available.'}
      </Text>

      {/* Contact & hours card */}
      <View style={[dstyles.contactCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={dstyles.contactRow}>
          <View style={[dstyles.contactIconWrap, { backgroundColor: theme.primary + '18' }]}>
            <Ionicons name="time-outline" size={18} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[dstyles.contactLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>{t('working_hours')}</Text>
            <Text style={[dstyles.contactValue, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{salon.openHours}</Text>
          </View>
        </View>
        {!!salon.phone && (
          <Pressable onPress={callPhone} style={({ pressed }) => [dstyles.contactRow, { opacity: pressed ? 0.6 : 1 }]}>
            <View style={[dstyles.contactIconWrap, { backgroundColor: theme.success + '18' }]}>
              <Ionicons name="call" size={18} color={theme.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[dstyles.contactLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>{t('phone')}</Text>
              <Text style={[dstyles.contactValue, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>{salon.phone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </Pressable>
        )}
        <Pressable onPress={openMap} style={({ pressed }) => [dstyles.contactRow, { opacity: pressed ? 0.6 : 1, borderBottomWidth: 0 }]}>
          <View style={[dstyles.contactIconWrap, { backgroundColor: '#3B82F6' + '18' }]}>
            <Ionicons name="location" size={18} color="#3B82F6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[dstyles.contactLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>{t('address') || 'Address'}</Text>
            <Text style={[dstyles.contactValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]} numberOfLines={2}>{salon.address}</Text>
          </View>
          <Ionicons name="navigate-outline" size={18} color={theme.primary} />
        </Pressable>
      </View>

      {/* Map */}
      {Platform.OS === 'web' && salon.latitude && salon.longitude && (salon.latitude !== 0 || salon.address) && (
        <View style={{ marginTop: 20 }}>
          <Text style={[dstyles.subHeader, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('location') || 'Location'}</Text>
          <View style={{ borderRadius: 16, overflow: 'hidden', height: 220, borderWidth: 1, borderColor: theme.border, marginTop: 12 }}>
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${(salon.longitude || 8.54) - 0.005}%2C${(salon.latitude || 47.37) - 0.003}%2C${(salon.longitude || 8.54) + 0.005}%2C${(salon.latitude || 47.37) + 0.003}&layer=mapnik&marker=${salon.latitude || 47.37}%2C${salon.longitude || 8.54}`}
              style={{ width: '100%', height: '100%', border: 'none' } as any}
            />
          </View>
          <Pressable onPress={openMap} style={({ pressed }) => [dstyles.directionsBtn, { borderColor: theme.primary, opacity: pressed ? 0.7 : 1 }]}>
            <Ionicons name="navigate" size={16} color={theme.primary} />
            <Text style={{ color: theme.primary, fontFamily: 'Urbanist_700Bold', fontSize: 14 }}>{t('get_directions') || 'Get Directions'}</Text>
          </Pressable>
        </View>
      )}

      {/* Specialists */}
      {(salon.specialists || []).length > 0 && (
        <>
          <View style={dstyles.specialistHeader}>
            <Text style={[dstyles.subHeader, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('our_specialists')}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingRight: 16 }}>
            {(salon.specialists || []).map(sp => <SpecialistItem key={sp.id} specialist={sp} salonId={salon.id} salonName={salon.name} />)}
          </ScrollView>
        </>
      )}
    </View>
  );

  const renderServices = () => (
    <View style={dstyles.section}>
      {(salon.services || []).length === 0 ? (
        <View style={dstyles.emptyBox}>
          <Ionicons name="cut-outline" size={40} color={theme.textTertiary} />
          <Text style={[dstyles.emptyText, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
            {t('no_services_yet') || 'No services yet'}
          </Text>
        </View>
      ) : (
        (salon.services || []).map(service => (
          <Pressable
            key={service.id}
            onPress={() => {
              hapticLight();
              router.push({ pathname: '/booking/[id]', params: { id: salon.id } });
            }}
            style={({ pressed }) => [
              dstyles.serviceCard,
              { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.96 : 1 },
            ]}
          >
            {service.image ? (
              <Image source={{ uri: getImageUrl(service.image) }} style={dstyles.serviceImage} contentFit="cover" />
            ) : (
              <LinearGradient
                colors={[theme.primary + '25', theme.primary + '08']}
                style={dstyles.serviceImage}
              >
                <Ionicons name={getServiceIcon(service.name) as any} size={28} color={theme.primary} />
              </LinearGradient>
            )}
            <View style={dstyles.serviceInfo}>
              <Text style={[dstyles.serviceName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>{service.name}</Text>
              <View style={dstyles.serviceMetaRow}>
                <Ionicons name="time-outline" size={13} color={theme.textTertiary} />
                <Text style={[dstyles.serviceDuration, { color: theme.textTertiary, fontFamily: 'Urbanist_500Medium' }]}>{service.duration}</Text>
              </View>
            </View>
            <View style={dstyles.servicePriceWrap}>
              <Text style={[dstyles.servicePrice, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>CHF {service.price}</Text>
              <View style={[dstyles.bookChip, { backgroundColor: theme.primary + '18' }]}>
                <Text style={[dstyles.bookChipText, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>
                  {t('book') || 'Book'}
                </Text>
              </View>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );

  const renderPackages = () => (
    <View style={dstyles.section}>
      {(salon.packages || []).length === 0 ? (
        <View style={dstyles.emptyBox}>
          <Ionicons name="gift-outline" size={40} color={theme.textTertiary} />
          <Text style={[dstyles.emptyText, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
            {t('no_packages_yet') || 'No packages yet'}
          </Text>
        </View>
      ) : (
        (salon.packages || []).map(pkg => {
          const discount = pkg.originalPrice > pkg.price
            ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
            : 0;
          return (
            <Pressable
              key={pkg.id}
              onPress={() => {
                hapticLight();
                router.push({ pathname: '/booking/[id]', params: { id: salon.id } });
              }}
              style={({ pressed }) => [
                dstyles.packageCard,
                { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.96 : 1 },
              ]}
            >
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: getImageUrl(pkg.image) }} style={dstyles.packageImage} contentFit="cover" />
                {discount > 0 && (
                  <View style={[dstyles.discountTag, { backgroundColor: theme.error }]}>
                    <Text style={[dstyles.discountTagText, { fontFamily: 'Urbanist_700Bold' }]}>-{discount}%</Text>
                  </View>
                )}
              </View>
              <View style={dstyles.packageInfo}>
                <Text style={[dstyles.packageName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>{pkg.name}</Text>
                <Text style={[dstyles.packageServices, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]} numberOfLines={2}>
                  {(Array.isArray(pkg.services) ? pkg.services : []).join(' • ')}
                </Text>
                <View style={dstyles.packagePricing}>
                  <Text style={[dstyles.packagePrice, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>CHF {pkg.price}</Text>
                  {pkg.originalPrice > pkg.price && (
                    <Text style={[dstyles.packageOriginal, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>CHF {pkg.originalPrice}</Text>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })
      )}
    </View>
  );

  const renderProducts = () => {
    const items = (salonProducts || []).filter((p: any) => p.isActive !== false);
    if (items.length === 0) {
      return (
        <View style={{ paddingVertical: 32, alignItems: 'center' }}>
          <Ionicons name="bag-handle-outline" size={48} color={theme.border} />
          <Text style={{ color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold', marginTop: 12 }}>
            {t('no_products') || 'No products yet'}
          </Text>
          <Text style={{ color: theme.textSecondary, fontFamily: 'Urbanist_400Regular', fontSize: 12, marginTop: 4 }}>
            {t('salon_no_products_desc') || "This salon hasn't added products yet"}
          </Text>
        </View>
      );
    }
    return (
      <View style={dstyles.productsGrid}>
        {items.map((p: any) => (
          <Pressable
            key={p.id}
            onPress={() => router.push({ pathname: '/(tabs)/shop', params: { salonId: id, productId: p.id } } as any)}
            style={({ pressed }) => [dstyles.productCard, { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 }]}
          >
            {p.image ? (
              <Image source={{ uri: getImageUrl(p.image) }} style={dstyles.productImage} contentFit="cover" />
            ) : (
              <View style={[dstyles.productImage, { backgroundColor: theme.primary + '15', alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="bag-handle" size={28} color={theme.primary} />
              </View>
            )}
            <View style={{ padding: 10 }}>
              {p.category ? (
                <Text style={{ color: theme.primary, fontFamily: 'Urbanist_700Bold', fontSize: 10, marginBottom: 2 }} numberOfLines={1}>
                  {String(p.category).toUpperCase()}
                </Text>
              ) : null}
              <Text style={{ color: theme.text, fontFamily: 'Urbanist_600SemiBold', fontSize: 13 }} numberOfLines={2}>
                {p.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                <Text style={{ color: theme.primary, fontFamily: 'Urbanist_700Bold', fontSize: 14 }}>CHF {p.price}</Text>
                {typeof p.stock === 'number' && (
                  <Text style={{ color: p.stock > 0 ? theme.textSecondary : '#EF4444', fontFamily: 'Urbanist_500Medium', fontSize: 10 }}>
                    {p.stock > 0 ? `${p.stock} ${t('in_stock') || 'in stock'}` : (t('out_of_stock') || 'Out of stock')}
                  </Text>
                )}
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderGallery = () => {
    const galleryArr = Array.isArray(salon.gallery) ? salon.gallery : [];
    return (
      <View style={dstyles.galleryGrid}>
        {galleryArr.map((img, i) => (
          <Pressable key={i} onPress={hapticLight} style={({ pressed }) => [pressed && { opacity: 0.8 }]}>
            <Image source={{ uri: getImageUrl(img) }} style={dstyles.galleryImage} contentFit="cover" />
          </Pressable>
        ))}
        {galleryArr.length === 0 && (
          <View style={dstyles.emptyBox}>
            <Ionicons name="images-outline" size={40} color={theme.textTertiary} />
            <Text style={[dstyles.emptyText, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
              {t('no_gallery') || 'No gallery images yet'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderReviews = () => {
    const reviews = salon.reviews || [];
    return (
      <View style={dstyles.section}>
        <View style={[dstyles.reviewSummaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={dstyles.reviewScoreLeft}>
            <Text style={[dstyles.scoreText, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{salon.rating.toFixed(1)}</Text>
            <View style={dstyles.scoreStars}>
              {[1, 2, 3, 4, 5].map(s => (
                <Ionicons key={s} name={s <= Math.round(salon.rating) ? 'star' : 'star-outline'} size={14} color={theme.star} />
              ))}
            </View>
            <Text style={[dstyles.reviewTotal, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
              {salon.reviewCount} {t('reviews') || 'reviews'}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push({ pathname: '/salon/[id]/reviews' as any, params: { id: salon.id } })}
            style={({ pressed }) => [dstyles.seeAllBtn, { backgroundColor: theme.primary + '18', opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={{ color: theme.primary, fontFamily: 'Urbanist_700Bold', fontSize: 13 }}>{t('see_all')}</Text>
            <Ionicons name="chevron-forward" size={14} color={theme.primary} />
          </Pressable>
        </View>
        {reviews.length === 0 ? (
          <View style={dstyles.emptyBox}>
            <Ionicons name="star-outline" size={40} color={theme.textTertiary} />
            <Text style={[dstyles.emptyText, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
              {t('no_reviews_yet') || 'No reviews yet'}
            </Text>
          </View>
        ) : (
          reviews.slice(0, 5).map(r => <ReviewItem key={r.id} review={r} />)
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ paddingBottom: 120 + bottomPad }}>
        {/* Hero */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: getImageUrl(salon.image) }} style={styles.heroImage} contentFit="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)', theme.background]}
            locations={[0, 0.35, 0.6, 1]}
            style={styles.heroGradient}
          />
          <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
            <Pressable onPress={() => { hapticLight(); goBack(); }} style={({ pressed }) => [styles.topBtn, { opacity: pressed ? 0.6 : 1 }]}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
            <View style={styles.topRight}>
              <Pressable
                onPress={() => {
                  hapticLight();
                  const url = `https://barber.barmagly.tech/salon/${salon.id}`;
                  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && (navigator as any).share) {
                    (navigator as any).share({ title: salon.name, url });
                  } else if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
                    (navigator as any).clipboard?.writeText(url);
                  } else {
                    Linking.openURL(url);
                  }
                }}
                style={({ pressed }) => [styles.topBtn, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Ionicons name="share-social-outline" size={22} color="#fff" />
              </Pressable>
              <Pressable
                onPress={() => { hapticLight(); toggleBookmark(salon.id); }}
                style={({ pressed }) => [styles.topBtn, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Ionicons name={isBookmarked(salon.id) ? 'bookmark' : 'bookmark-outline'} size={22} color="#fff" />
              </Pressable>
            </View>
          </View>

          {/* Floating status badge */}
          <View style={[styles.floatingBadge, { backgroundColor: salon.isOpen ? theme.success : theme.error }]}>
            <View style={styles.liveDot} />
            <Text style={[styles.floatingBadgeText, { fontFamily: 'Urbanist_700Bold' }]}>
              {salon.isOpen ? (t('open_now') || 'Open Now') : (t('closed_now') || 'Closed')}
            </Text>
          </View>
        </View>

        {/* Info section */}
        <View style={styles.infoSection}>
          <Text style={[styles.salonName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{salon.name}</Text>

          {/* Quick stats row */}
          <View style={styles.statsRow}>
            <View style={[styles.statChip, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="star" size={14} color={theme.star} />
              <Text style={[styles.statChipValue, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{salon.rating.toFixed(1)}</Text>
              <Text style={[styles.statChipLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>({salon.reviewCount})</Text>
            </View>
            <View style={[styles.statChip, { backgroundColor: '#3B82F6' + '15' }]}>
              <Ionicons name="location" size={14} color="#3B82F6" />
              <Text style={[styles.statChipValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{salon.distance}</Text>
            </View>
            <View style={[styles.statChip, { backgroundColor: theme.success + '15' }]}>
              <Ionicons name="time" size={14} color={theme.success} />
              <Text style={[styles.statChipValue, { color: theme.success, fontFamily: 'Urbanist_600SemiBold' }]} numberOfLines={1}>
                {salon.openHours.split('-')[0]?.trim() || '9:00'}
              </Text>
            </View>
          </View>

          {/* Address pressable */}
          <Pressable
            onPress={openMap}
            style={({ pressed }) => [styles.addressRow, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="navigate-circle-outline" size={20} color={theme.primary} />
            <Text style={[styles.address, { color: theme.text, fontFamily: 'Urbanist_500Medium' }]} numberOfLines={1}>{salon.address}</Text>
            <Ionicons name="open-outline" size={16} color={theme.primary} />
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.detailTabs}>
            {tabs.map(tab => {
              const active = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => { hapticLight(); setActiveTab(tab); }}
                  style={({ pressed }) => [
                    styles.detailTab,
                    active && { backgroundColor: theme.primary },
                    !active && { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={[
                    styles.detailTabText,
                    { color: active ? '#fff' : theme.text, fontFamily: active ? 'Urbanist_700Bold' : 'Urbanist_600SemiBold' }
                  ]}>
                    {tab === 'about' ? t('about') : tab === 'services' ? t('services') : tab === 'package' ? t('package') : tab === 'products' ? (t('products') || 'Products') : tab === 'gallery' ? t('gallery') : t('reviews')}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          {activeTab === 'about' && renderAbout()}
          {activeTab === 'services' && renderServices()}
          {activeTab === 'package' && renderPackages()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'gallery' && renderGallery()}
          {activeTab === 'review' && renderReviews()}
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 12, backgroundColor: theme.background, borderTopColor: theme.border }]}>
        {lowestPrice !== null && (
          <View style={styles.priceWrap}>
            <Text style={[styles.priceLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
              {t('starting_from') || 'From'}
            </Text>
            <Text style={[styles.priceValue, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
              CHF {lowestPrice}
            </Text>
          </View>
        )}
        <Pressable
          onPress={() => {
            hapticLight();
            router.push({ pathname: '/booking/[id]', params: { id: salon.id } });
          }}
          style={({ pressed }) => [styles.bookBtn, { opacity: pressed ? 0.9 : 1 }]}
        >
          <LinearGradient
            colors={[theme.primary, '#E8924A']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.bookBtnGradient}
          >
            <Text style={[styles.bookBtnText, { fontFamily: 'Urbanist_700Bold' }]}>{t('book_now')}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { position: 'relative' },
  heroImage: { width: '100%', height: 320 },
  heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  topBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)' as any },
  topRight: { flexDirection: 'row', gap: 10 },
  floatingBadge: { position: 'absolute', bottom: 20, right: 20, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  floatingBadgeText: { color: '#fff', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },

  infoSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  salonName: { fontSize: 26, marginBottom: 12, lineHeight: 32 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statChipValue: { fontSize: 13 },
  statChipLabel: { fontSize: 12 },

  addressRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 14, borderWidth: 1,
  },
  address: { flex: 1, fontSize: 13 },

  tabsContainer: { borderBottomWidth: 1, marginTop: 8 },
  detailTabs: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  detailTab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  detailTabText: { fontSize: 13 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 14,
    borderTopWidth: 1,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  priceWrap: { flexShrink: 0 },
  priceLabel: { fontSize: 11, marginBottom: 2 },
  priceValue: { fontSize: 18 },
  bookBtn: { flex: 1, height: 54, borderRadius: 16, overflow: 'hidden', shadowColor: '#F4A460', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  bookBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  bookBtnText: { fontSize: 16, color: '#fff' },
});

const dstyles = StyleSheet.create({
  section: { gap: 14, paddingBottom: 20 },
  aboutText: { fontSize: 14, lineHeight: 22 },

  contactCard: { borderRadius: 16, borderWidth: 1, padding: 4, marginTop: 4 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  contactIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: 11, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  contactValue: { fontSize: 14 },

  subHeader: { fontSize: 18, marginTop: 10, marginBottom: 4 },
  directionsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },

  specialistHeader: { marginTop: 8, marginBottom: 10 },

  serviceCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, gap: 12 },
  serviceImage: { width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  serviceInfo: { flex: 1, gap: 4 },
  serviceName: { fontSize: 15 },
  serviceMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  serviceDuration: { fontSize: 12 },
  servicePriceWrap: { alignItems: 'flex-end', gap: 6 },
  servicePrice: { fontSize: 17 },
  bookChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  bookChipText: { fontSize: 11 },

  packageCard: { flexDirection: 'row', borderRadius: 16, overflow: 'hidden', gap: 12, borderWidth: 1, minHeight: 120 },
  packageImage: { width: 110, height: '100%', minHeight: 120 },
  discountTag: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  discountTagText: { color: '#fff', fontSize: 11 },
  packageInfo: { flex: 1, paddingVertical: 14, paddingRight: 14, justifyContent: 'center' },
  packageName: { fontSize: 15, marginBottom: 4 },
  packageServices: { fontSize: 12, marginBottom: 10, lineHeight: 16 },
  packagePricing: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  packagePrice: { fontSize: 18 },
  packageOriginal: { fontSize: 13, textDecorationLine: 'line-through' },

  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  galleryImage: { width: (width - 52) / 2, height: 160, borderRadius: 14 },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productCard: { width: (width - 52) / 2, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  productImage: { width: '100%', height: 120 },

  reviewSummaryCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, justifyContent: 'space-between' },
  reviewScoreLeft: { alignItems: 'flex-start', gap: 4 },
  scoreStars: { flexDirection: 'row', gap: 2 },
  scoreText: { fontSize: 32, lineHeight: 36 },
  reviewTotal: { fontSize: 13 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },

  emptyBox: { alignItems: 'center', paddingVertical: 36, gap: 10 },
  emptyText: { fontSize: 13 },
});

const rstyles = StyleSheet.create({
  reviewCard: { padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  reviewAvatar: { width: 44, height: 44, borderRadius: 22 },
  reviewInfo: { flex: 1 },
  reviewName: { fontSize: 14, marginBottom: 3 },
  starsRow: { flexDirection: 'row', gap: 2, alignItems: 'center' },
  ratingSmall: { fontSize: 12, marginLeft: 4 },
  reviewDate: { fontSize: 11 },
  reviewText: { fontSize: 13, lineHeight: 20 },

  specialistCard: { width: 100, alignItems: 'center', gap: 4, padding: 6 },
  specialistImageWrap: { position: 'relative', marginBottom: 6 },
  specialistImage: { width: 76, height: 76, borderRadius: 38, borderWidth: 2 },
  ratingBadge: { position: 'absolute', bottom: -2, right: -2, flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 2 },
  ratingText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 10 },
  specialistName: { fontSize: 12, textAlign: 'center' },
  specialistRole: { fontSize: 10, textAlign: 'center' },
});
