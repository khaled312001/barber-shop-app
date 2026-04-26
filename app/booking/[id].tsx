import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { goBack } from '@/lib/navigation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn, apiRequest, getImageUrl } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  image: string;
  category: string;
  salonId: string;
}

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
  return 'cut';
}

const PAYMENT_METHOD_DEFS = [
  { id: 'stripe', nameKey: 'pay_with_card', icon: 'card-outline', descKey: 'pay_card_desc' },
  { id: 'google', nameKey: 'google_pay', icon: 'logo-google', descKey: 'fast_checkout' },
  { id: 'cash', nameKey: 'pay_at_salon', icon: 'cash-outline', descKey: 'pay_salon_desc' },
];

const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

const days = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    date: d.getDate(),
    day: d.toLocaleDateString('en', { weekday: 'short' }),
    month: d.toLocaleDateString('en', { month: 'short' }),
    year: d.getFullYear(),
    full: d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }),
  };
});

export default function BookingScreen() {
  const { id, specialistId, specialistName, services: rebookServices, rebookFrom } = useLocalSearchParams<{ id: string; specialistId?: string; specialistName?: string; services?: string; rebookFrom?: string }>();
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const { addBooking, user, authLoading: _authLoading, isLoggedIn: _isLoggedIn } = useApp();
  const paymentMethods = PAYMENT_METHOD_DEFS.map(pm => ({ ...pm, name: t(pm.nameKey as any), description: t(pm.descKey as any) }));
  const { data: salon, isLoading } = useQuery<any>({
    queryKey: ['/api/salons', id],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  // Auto-select specialist if passed via URL params
  React.useEffect(() => {
    if (specialistId && salon?.specialists) {
      const found = salon.specialists.find((s: any) => s.id === specialistId);
      if (found) setSelectedSpecialist(found);
    }
  }, [specialistId, salon]);

  // Auto-select services on rebook
  React.useEffect(() => {
    if (rebookServices && salon?.services) {
      const wanted = rebookServices.split(',').map(s => s.trim()).filter(Boolean);
      const list = (salon.services as any[]).filter(s => wanted.includes(s.name));
      if (list.length) setSelectedServices(list);
    }
  }, [rebookServices, salon]);
  const [step, setStep] = useState<'services' | 'specialist' | 'datetime' | 'payment' | 'review' | 'processing' | 'success'>('services');
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;
  const bottomPad = Platform.OS === 'web' ? webBottomInset : insets.bottom;

  const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const discountAmount = appliedCoupon
    ? (appliedCoupon.type === 'percentage' ? (subtotal * appliedCoupon.discount / 100) : appliedCoupon.discount)
    : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async () => {
    if (!promoCode) return;
    setIsValidating(true);
    try {
      const res = await apiRequest('POST', '/api/coupons/validate', { code: promoCode });
      const coupon = await res.json();
      setAppliedCoupon(coupon);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Alert.alert(t('invalid_code'), err.message || t('invalid_coupon_msg'));
      setAppliedCoupon(null);
    } finally {
      setIsValidating(false);
    }
  };

  const toggleService = (service: Service) => {
    Haptics.selectionAsync();
    setSelectedServices(prev =>
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const ensureAuth = (): boolean => {
    // While auth is still loading, wait — don't force a redirect to signin
    if (_authLoading) return false;
    if (!user || !_isLoggedIn) {
      const msg = t('login_required_to_book') || 'Please sign in to confirm your booking';
      if (Platform.OS === 'web') {
        if (window.confirm(msg + '\n\n' + (t('go_to_signin') || 'Go to Sign In?'))) {
          router.push('/signin');
        }
      } else {
        Alert.alert(t('login_required') || 'Login Required', msg, [
          { text: t('cancel') || 'Cancel', style: 'cancel' },
          { text: t('sign_in') || 'Sign In', onPress: () => router.push('/signin') },
        ]);
      }
      return false;
    }
    return true;
  };

  const processStripePayment = async () => {
    if (!ensureAuth()) return;
    setIsProcessing(true);
    try {
      const bookingData = {
        salonId: salon.id,
        salonName: salon.name,
        salonImage: salon.image,
        services: selectedServices.map(s => s.name),
        date: days[selectedDate].full,
        time: selectedTime,
        totalPrice: total,
      };

      const res = await apiRequest('POST', '/api/stripe/create-payment-intent', {
        amount: total,
        currency: 'usd',
        bookingData,
      });
      const { paymentIntentId } = await res.json();

      await addBooking({
        ...bookingData,
        status: 'upcoming',
        paymentMethod: 'Stripe (Card)',
        stripePaymentIntentId: paymentIntentId,
        couponId: appliedCoupon?.id,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('success');
    } catch (err: any) {
      Alert.alert(t('payment_failed'), err.message || t('payment_failed_msg'));
    } finally {
      setIsProcessing(false);
    }
  };

  const processCashPayment = async () => {
    if (!ensureAuth()) return;
    setIsProcessing(true);
    try {
      const bookingData = {
        salonId: salon.id,
        salonName: salon.name,
        salonImage: salon.image,
        services: selectedServices.map(s => s.name),
        date: days[selectedDate].full,
        time: selectedTime,
        totalPrice: total,
        status: 'upcoming',
        paymentMethod: 'Pay at Salon',
        couponId: appliedCoupon?.id,
      };

      await addBooking(bookingData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('success');
    } catch (err: any) {
      Alert.alert(t('booking_failed'), err.message || t('booking_failed_msg'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step === 'services' && selectedServices.length > 0) setStep('specialist');
    else if (step === 'specialist') setStep('datetime');
    else if (step === 'datetime' && selectedTime) setStep('payment');
    else if (step === 'payment') setStep('review');
    else if (step === 'review') {
      if (selectedPayment === 'stripe' || selectedPayment === 'google') {
        processStripePayment();
      } else {
        processCashPayment();
      }
    }
  };

  const handleStepBack = () => {
    if (step === 'specialist') setStep('services');
    else if (step === 'datetime') setStep('specialist');
    else if (step === 'payment') setStep('datetime');
    else if (step === 'review') setStep('payment');
  };

  const handleExit = () => {
    goBack();
  };

  const titles: Record<string, string> = { services: t('select_services'), specialist: t('choose_specialist') || 'Choose Specialist', datetime: t('select_date_time'), payment: t('payment_method'), review: t('review_summary'), processing: t('processing_payment'), success: '' };
  const canContinue = (step === 'services' && selectedServices.length > 0)
    || step === 'specialist'
    || (step === 'datetime' && !!selectedTime)
    || step === 'payment'
    || step === 'review';

  if (step !== 'success' && step !== 'processing' && (isLoading || !salon)) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (step === 'success') {
    const bookingRef = `#${Date.now().toString(36).toUpperCase().slice(-8)}`;
    const isPaid = selectedPayment !== 'cash';
    const servicesNames = (salon?.services || []).filter((s: any) => selectedServices.includes(s.id)).map((s: any) => s.name);
    const paymentLabels: Record<string, string> = {
      cash: t('pay_cash') || 'Cash at salon',
      card: t('card') || 'Credit Card',
      stripe: t('card') || 'Credit Card',
    };
    const paymentIcons: Record<string, any> = { cash: 'cash-outline', card: 'card-outline', stripe: 'card-outline' };

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView
          contentContainerStyle={[styles.successScroll, { paddingTop: topPad + 8, paddingBottom: bottomPad + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Success hero — gradient circle + title */}
          <View style={styles.successHero}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.successIconCircle}
            >
              <Ionicons name="checkmark" size={54} color="#fff" />
            </LinearGradient>
            <View style={[styles.confirmedBadge, { backgroundColor: '#10B98120', borderColor: '#10B98140' }]}>
              <View style={styles.liveDot} />
              <Text style={[styles.confirmedBadgeText, { color: '#10B981' }]}>
                {isPaid ? (t('paid_confirmed') || 'PAID & CONFIRMED') : (t('confirmed') || 'CONFIRMED')}
              </Text>
            </View>
            <Text style={[styles.successTitle, { color: theme.text }]}>
              {t('booking_successful') || 'Booking Successful!'}
            </Text>
            <Text style={[styles.successSub, { color: theme.textSecondary }]}>
              {isPaid
                ? (t('booking_success_paid') || 'Your appointment has been confirmed and paid.')
                : (t('booking_success_cash') || 'Your appointment is booked. Pay at the salon.')}
            </Text>
            <Text style={[styles.bookingRef, { color: theme.textTertiary }]}>
              {t('booking_ref') || 'Booking'} {bookingRef}
            </Text>
          </View>

          {/* Salon card */}
          {salon && (
            <View style={[styles.salonCardWrap, { backgroundColor: theme.card || theme.surface, borderColor: theme.border }]}>
              {salon.image ? (
                <Image source={{ uri: getImageUrl(salon.image) }} style={styles.salonImg} contentFit="cover" />
              ) : (
                <View style={[styles.salonImg, { backgroundColor: theme.primary + '22', alignItems: 'center', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name="content-cut" size={22} color={theme.primary} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.salonCardName, { color: theme.text }]} numberOfLines={1}>{salon.name}</Text>
                {!!salon.address && (
                  <View style={styles.salonCardAddrRow}>
                    <Ionicons name="location-outline" size={11} color={theme.textTertiary} />
                    <Text style={[styles.salonCardAddr, { color: theme.textSecondary }]} numberOfLines={1}>{salon.address}</Text>
                  </View>
                )}
                <View style={styles.salonCardMeta}>
                  <Ionicons name="star" size={10} color="#FFC107" />
                  <Text style={[styles.salonCardMetaText, { color: theme.text }]}>{salon.rating || '—'}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Booking details card */}
          <View style={[styles.detailsCard, { backgroundColor: theme.card || theme.surface, borderColor: theme.border }]}>
            <View style={styles.detailsHeader}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={16} color={theme.primary} />
              <Text style={[styles.detailsTitle, { color: theme.text }]}>
                {t('booking_details') || 'Booking Details'}
              </Text>
            </View>

            {servicesNames.length > 0 && (
              <View style={styles.detailRow}>
                <View style={[styles.detailIcon, { backgroundColor: theme.primary + '20' }]}>
                  <MaterialCommunityIcons name="scissors-cutting" size={14} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                    {t('services') || 'Services'}
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={2}>
                    {servicesNames.join(' • ')}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: '#3B82F620' }]}>
                <Ionicons name="calendar" size={14} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  {t('date') || 'Date'}
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{days[selectedDate]?.full}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: '#6366F120' }]}>
                <Ionicons name="time" size={14} color="#6366F1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  {t('time') || 'Time'}
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{selectedTime}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name={paymentIcons[selectedPayment] || 'cash-outline'} size={14} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  {t('payment_method') || 'Payment'}
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {paymentLabels[selectedPayment] || selectedPayment}
                </Text>
              </View>
              {isPaid && (
                <View style={styles.paidBadge}>
                  <Ionicons name="checkmark-circle" size={10} color="#10B981" />
                  <Text style={styles.paidBadgeText}>PAID</Text>
                </View>
              )}
            </View>

            {/* Total highlighted */}
            <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
                {t('total') || 'Total'}
              </Text>
              <Text style={[styles.totalValue, { color: '#10B981' }]}>CHF {total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Info callout — what's next */}
          <View style={[styles.infoCallout, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
            <View style={[styles.infoIcon, { backgroundColor: theme.primary }]}>
              <Ionicons name="information" size={14} color="#181A20" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>
                {t('whats_next') || "What's next?"}
              </Text>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                {isPaid
                  ? (t('arrive_at_time') || 'Arrive 5-10 minutes before your appointment. You can view or cancel from My Bookings.')
                  : (t('arrive_and_pay') || 'Arrive on time and pay at the salon. You can view or cancel from My Bookings.')}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.successActions}>
            <Pressable
              onPress={() => router.replace('/(tabs)/bookings')}
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
            >
              <LinearGradient
                colors={[theme.primary, '#E8924A']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.primaryBtnGradient}
              >
                <Ionicons name="calendar" size={18} color="#181A20" />
                <Text style={styles.primaryBtnText}>
                  {t('view_my_bookings') || 'View My Bookings'}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#181A20" />
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => router.replace('/home')}
              style={({ pressed }) => [
                styles.secondaryBtn,
                { borderColor: theme.border, backgroundColor: theme.card || theme.surface, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Ionicons name="home-outline" size={18} color={theme.text} />
              <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
                {t('back_to_home') || 'Back to Home'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        {step !== 'services' ? (
          <Pressable onPress={handleStepBack} disabled={isProcessing} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{titles[step]}</Text>
        <Pressable onPress={handleExit} disabled={isProcessing} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="close" size={24} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.progressBar}>
        {['services', 'specialist', 'datetime', 'payment', 'review'].map((s, i) => (
          <View key={s} style={[styles.progressDot, { backgroundColor: ['services', 'specialist', 'datetime', 'payment', 'review'].indexOf(step) >= i ? theme.primary : theme.border }]} />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {step === 'services' && (
          <View style={styles.content}>
            {salon.services.map((service: Service) => {
              const isSelected = !!selectedServices.find(s => s.id === service.id);
              return (
                <Pressable
                  key={service.id}
                  onPress={() => toggleService(service)}
                  style={[styles.serviceItem, { borderColor: isSelected ? theme.primary : theme.border, backgroundColor: isSelected ? theme.primary + '08' : 'transparent' }]}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isSelected ? theme.primary + '25' : theme.primary + '10', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={getServiceIcon(service.name) as any} size={18} color={theme.primary} />
                  </View>
                  <View style={styles.serviceLeft}>
                    <Text style={[styles.serviceName, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{service.name}</Text>
                    <Text style={[styles.serviceDuration, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{service.duration}</Text>
                  </View>
                  <Text style={[styles.servicePrice, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>CHF {service.price}</Text>
                  <Ionicons name={isSelected ? 'checkbox' : 'square-outline'} size={24} color={isSelected ? theme.primary : theme.textTertiary} />
                </Pressable>
              );
            })}
          </View>
        )}

        {step === 'specialist' && (
          <View style={styles.content}>
            <Text style={[styles.subTitle, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular', fontSize: 14, marginBottom: 16 }]}>
              {t('specialist_optional') || 'Choose a specialist or skip for any available'}
            </Text>

            {/* Any Available option */}
            <Pressable
              onPress={() => { setSelectedSpecialist(null); }}
              style={[styles.serviceItem, {
                borderColor: !selectedSpecialist ? theme.primary : theme.border,
                backgroundColor: !selectedSpecialist ? theme.primary + '08' : 'transparent',
              }]}
            >
              <View style={[styles.specialistAvatar, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="shuffle-outline" size={24} color={theme.primary} />
              </View>
              <View style={styles.serviceLeft}>
                <Text style={[styles.serviceName, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{t('any_specialist') || 'Any Available Specialist'}</Text>
                <Text style={[styles.serviceDuration, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{t('auto_assign') || 'Automatically assigned'}</Text>
              </View>
              <Ionicons name={!selectedSpecialist ? 'radio-button-on' : 'radio-button-off'} size={22} color={!selectedSpecialist ? theme.primary : theme.textTertiary} />
            </Pressable>

            {/* Specialist list */}
            {(salon?.specialists || []).map((sp: any) => {
              const isSelected = selectedSpecialist?.id === sp.id;
              return (
                <Pressable
                  key={sp.id}
                  onPress={() => setSelectedSpecialist(sp)}
                  style={[styles.serviceItem, {
                    borderColor: isSelected ? theme.primary : theme.border,
                    backgroundColor: isSelected ? theme.primary + '08' : 'transparent',
                  }]}
                >
                  {sp.image ? (
                    <View style={styles.specialistAvatarImg}>
                      <Ionicons name="person" size={20} color={theme.primary} />
                    </View>
                  ) : (
                    <View style={[styles.specialistAvatar, { backgroundColor: theme.primary + '20' }]}>
                      <Text style={{ color: theme.primary, fontFamily: 'Urbanist_700Bold', fontSize: 18 }}>{sp.name[0]}</Text>
                    </View>
                  )}
                  <View style={styles.serviceLeft}>
                    <Text style={[styles.serviceName, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{sp.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={[styles.serviceDuration, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{sp.role}</Text>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={[styles.serviceDuration, { color: '#F59E0B', fontFamily: 'Urbanist_600SemiBold' }]}>{sp.rating}</Text>
                    </View>
                  </View>
                  <Ionicons name={isSelected ? 'radio-button-on' : 'radio-button-off'} size={22} color={isSelected ? theme.primary : theme.textTertiary} />
                </Pressable>
              );
            })}
          </View>
        )}

        {step === 'datetime' && (
          <View style={styles.content}>
            <Text style={[styles.subTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('select_date')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {days.map((d, i) => (
                <Pressable key={i} onPress={() => { Haptics.selectionAsync(); setSelectedDate(i); }} style={[styles.dateCard, { backgroundColor: i === selectedDate ? theme.primary : theme.surface, borderColor: i === selectedDate ? theme.primary : theme.border }]}>
                  <Text style={[styles.dateDay, { color: i === selectedDate ? '#fff' : theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>{d.day}</Text>
                  <Text style={[styles.dateNum, { color: i === selectedDate ? '#fff' : theme.text, fontFamily: 'Urbanist_700Bold' }]}>{d.date}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={[styles.subTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold', marginTop: 24 }]}>{t('select_time')}</Text>
            <View style={styles.timeGrid}>
              {timeSlots.map(time => (
                <Pressable key={time} onPress={() => { Haptics.selectionAsync(); setSelectedTime(time); }} style={[styles.timeChip, { backgroundColor: time === selectedTime ? theme.primary : theme.surface, borderColor: time === selectedTime ? theme.primary : theme.border }]}>
                  <Text style={[styles.timeText, { color: time === selectedTime ? '#fff' : theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{time}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 'payment' && (
          <View style={styles.content}>
            <View style={[styles.stripeInfoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="shield-checkmark" size={20} color={theme.success} />
              <Text style={[styles.stripeInfoText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
                {t('secure_stripe')}
              </Text>
            </View>
            {paymentMethods.map(pm => (
              <Pressable key={pm.id} onPress={() => { Haptics.selectionAsync(); setSelectedPayment(pm.id); }} style={[styles.paymentItem, { borderColor: pm.id === selectedPayment ? theme.primary : theme.border, backgroundColor: pm.id === selectedPayment ? theme.primary + '08' : 'transparent' }]}>
                <View style={[styles.paymentIcon, { backgroundColor: theme.surfaceAlt }]}>
                  <Ionicons name={pm.icon as any} size={24} color={pm.id === selectedPayment ? theme.primary : theme.text} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentName, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{pm.name}</Text>
                  <Text style={[styles.paymentDesc, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>{pm.description}</Text>
                </View>
                <Ionicons name={pm.id === selectedPayment ? 'radio-button-on' : 'radio-button-off'} size={22} color={pm.id === selectedPayment ? theme.primary : theme.textTertiary} />
              </Pressable>
            ))}
          </View>
        )}

        {step === 'review' && (
          <View style={styles.content}>
            <View style={[styles.reviewCard, { backgroundColor: theme.surface }]}>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{t('salon')}</Text>
                <Text style={[styles.reviewValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{salon.name}</Text>
              </View>
              <View style={[styles.reviewDivider, { backgroundColor: theme.divider }]} />
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{t('services')}</Text>
                <Text style={[styles.reviewValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{selectedServices.map(s => s.name).join(', ')}</Text>
              </View>
              <View style={[styles.reviewDivider, { backgroundColor: theme.divider }]} />
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{t('date')}</Text>
                <Text style={[styles.reviewValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{days[selectedDate].full}</Text>
              </View>
              <View style={[styles.reviewDivider, { backgroundColor: theme.divider }]} />
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{t('time')}</Text>
                <Text style={[styles.reviewValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{selectedTime}</Text>
              </View>
              <View style={[styles.reviewDivider, { backgroundColor: theme.divider }]} />
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{t('specialist') || 'Specialist'}</Text>
                <Text style={[styles.reviewValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{selectedSpecialist?.name || (t('any_specialist') || 'Any Available')}</Text>
              </View>
              <View style={[styles.reviewDivider, { backgroundColor: theme.divider }]} />
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{t('payment')}</Text>
                <Text style={[styles.reviewValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{paymentMethods.find(p => p.id === selectedPayment)?.name}</Text>
              </View>
            </View>

            <View style={[styles.promoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.promoInputRow}>
                <View style={[styles.promoInputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                  <Ionicons name="pricetag-outline" size={20} color={theme.textTertiary} />
                  <TextInput
                    style={[styles.promoInput, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}
                    placeholder={t('enter_promo_code')}
                    placeholderTextColor={theme.textTertiary}
                    value={promoCode}
                    onChangeText={(text) => setPromoCode(text.toUpperCase())}
                    autoCapitalize="characters"
                  />
                </View>
                <Pressable
                  onPress={handleApplyCoupon}
                  disabled={!promoCode || isValidating}
                  style={[styles.applyBtn, { backgroundColor: theme.primary, opacity: (!promoCode || isValidating) ? 0.6 : 1 }]}
                >
                  {isValidating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={[styles.applyBtnText, { fontFamily: 'Urbanist_700Bold' }]}>{t('apply')}</Text>
                  )}
                </Pressable>
              </View>
              {appliedCoupon && (
                <View style={styles.appliedRow}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                  <Text style={[styles.appliedText, { color: theme.success, fontFamily: 'Urbanist_600SemiBold' }]}>
                    Applied: {appliedCoupon.code} ({appliedCoupon.type === 'percentage' ? `${appliedCoupon.discount}% Off` : `$${appliedCoupon.discount} Off`})
                  </Text>
                  <Pressable onPress={() => { setAppliedCoupon(null); setPromoCode(''); }}>
                    <Ionicons name="close-circle" size={18} color={theme.error} />
                  </Pressable>
                </View>
              )}
            </View>

            <View style={[styles.totalCard, { backgroundColor: theme.surface }]}>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{t('subtotal')}</Text>
                <Text style={[styles.reviewValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>CHF {subtotal.toFixed(2)}</Text>
              </View>
              {appliedCoupon && (
                <View style={styles.reviewRow}>
                  <Text style={[styles.reviewLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{t('discount')}</Text>
                  <Text style={[styles.reviewValue, { color: theme.error, fontFamily: 'Urbanist_600SemiBold' }]}>-${discountAmount.toFixed(2)}</Text>
                </View>
              )}
              <View style={[styles.reviewDivider, { backgroundColor: theme.divider }]} />
              <View style={styles.reviewRow}>
                <Text style={[styles.totalLabel, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('total')}</Text>
                <Text style={[styles.totalValue, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>CHF {total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 12, backgroundColor: theme.background }]}>
        {(step as string) !== 'success' && total > 0 && step !== 'review' && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalSmallLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{t('total')}</Text>
            <Text style={[styles.totalSmallValue, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>CHF {total.toFixed(2)}</Text>
          </View>
        )}
        <Pressable
          onPress={handleNext}
          disabled={!canContinue || isProcessing}
          style={({ pressed }) => [styles.continueBtn, { backgroundColor: canContinue && !isProcessing ? theme.primary : theme.border, opacity: pressed && canContinue ? 0.9 : 1 }]}
        >
          {isProcessing ? (
            <View style={styles.processingRow}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={[styles.continueBtnText, { fontFamily: 'Urbanist_700Bold', color: '#fff', marginLeft: 8 }]}>{t('processing_payment')}</Text>
            </View>
          ) : (
            <Text style={[styles.continueBtnText, { fontFamily: 'Urbanist_700Bold', color: canContinue ? '#fff' : theme.textTertiary }]}>
              {step === 'review'
                ? selectedPayment === 'cash' ? t('confirm_booking') : `${t('pay_and_book')} CHF {total.toFixed(2)}`
                : t('continue')}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 20, textAlign: 'center' },
  progressBar: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  progressDot: { width: 40, height: 4, borderRadius: 2 },
  content: { paddingHorizontal: 24, gap: 12 },
  subTitle: { fontSize: 18, marginBottom: 4 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1.5, gap: 12, marginBottom: 8 },
  serviceLeft: { flex: 1 },
  specialistAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  specialistAvatarImg: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F4A46020', alignItems: 'center', justifyContent: 'center' },
  serviceName: { fontSize: 16, marginBottom: 2 },
  serviceDuration: { fontSize: 13 },
  servicePrice: { fontSize: 18, marginRight: 8 },
  dateCard: { width: 64, height: 80, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, gap: 4 },
  dateDay: { fontSize: 13 },
  dateNum: { fontSize: 22 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  timeText: { fontSize: 14 },
  stripeInfoCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 10 },
  stripeInfoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  paymentItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1.5, gap: 14 },
  paymentIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  paymentInfo: { flex: 1 },
  paymentName: { fontSize: 16, marginBottom: 2 },
  paymentDesc: { fontSize: 12 },
  reviewCard: { borderRadius: 20, padding: 20, gap: 12 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewLabel: { fontSize: 14 },
  reviewValue: { fontSize: 14, textAlign: 'right', flex: 1, marginLeft: 16 },
  reviewDivider: { height: 1 },
  totalCard: { borderRadius: 20, padding: 20, gap: 10, marginTop: 12 },
  totalLabel: { fontSize: 16 },
  totalValue: { fontSize: 20 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalSmallLabel: { fontSize: 14 },
  totalSmallValue: { fontSize: 20 },
  continueBtn: { height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  continueBtnText: { fontSize: 16 },
  processingRow: { flexDirection: 'row', alignItems: 'center' },
  homeBtn: { height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginTop: 12 },
  homeBtnText: { fontSize: 16 },

  /* ───── Success page (redesigned) ───── */
  successScroll: { paddingHorizontal: 20, maxWidth: 500, width: '100%', alignSelf: 'center' },
  successHero: { alignItems: 'center', marginBottom: 22, marginTop: 12 },
  successIconCircle: {
    width: 110, height: 110, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 8,
  },
  confirmedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, marginBottom: 14,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  confirmedBadgeText: { fontFamily: 'Urbanist_700Bold', fontSize: 11, letterSpacing: 0.8 },
  successTitle: { fontSize: 26, textAlign: 'center', fontFamily: 'Urbanist_700Bold', marginBottom: 8 },
  successSub: { fontSize: 13, textAlign: 'center', lineHeight: 19, fontFamily: 'Urbanist_500Medium', maxWidth: 340, marginBottom: 8 },
  bookingRef: { fontSize: 11, fontFamily: 'Urbanist_600SemiBold', letterSpacing: 0.5 },

  /* Salon card */
  salonCardWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 14 },
  salonImg: { width: 56, height: 56, borderRadius: 14 },
  salonCardName: { fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  salonCardAddrRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  salonCardAddr: { flex: 1, fontFamily: 'Urbanist_500Medium', fontSize: 11 },
  salonCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  salonCardMetaText: { fontFamily: 'Urbanist_700Bold', fontSize: 11 },

  /* Details card */
  detailsCard: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 14 },
  detailsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  detailsTitle: { fontFamily: 'Urbanist_700Bold', fontSize: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  detailIcon: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  detailLabel: { fontFamily: 'Urbanist_500Medium', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  detailValue: { fontFamily: 'Urbanist_700Bold', fontSize: 13 },
  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#10B98140' },
  paidBadgeText: { color: '#10B981', fontFamily: 'Urbanist_700Bold', fontSize: 9, letterSpacing: 0.5 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 14, borderTopWidth: 1 },
  totalLabel: { fontFamily: 'Urbanist_600SemiBold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  totalValue: { fontFamily: 'Urbanist_700Bold', fontSize: 22 },

  /* Info callout */
  infoCallout: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 18 },
  infoIcon: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoTitle: { fontFamily: 'Urbanist_700Bold', fontSize: 13, marginBottom: 4 },
  infoText: { fontFamily: 'Urbanist_500Medium', fontSize: 12, lineHeight: 18 },

  /* Actions */
  successActions: { gap: 10 },
  primaryBtn: { height: 54, borderRadius: 16, overflow: 'hidden', shadowColor: '#F4A460', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  primaryBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primaryBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  secondaryBtn: { height: 52, borderRadius: 16, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryBtnText: { fontFamily: 'Urbanist_700Bold', fontSize: 14 },

  /* (Kept for compatibility with older usage) */
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successIcon: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  successSummary: { width: '100%', borderRadius: 16, padding: 16, gap: 10, marginBottom: 20 },
  successSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  successSummaryText: { fontSize: 14 },
  paymentConfirmCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, gap: 10, marginBottom: 24 },
  paymentConfirmText: { fontSize: 14 },
  promoCard: { borderRadius: 20, padding: 20, marginTop: 12, borderWidth: 1 },
  promoInputRow: { flexDirection: 'row', gap: 12 },
  promoInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  promoInput: { flex: 1, height: 48, marginLeft: 8, fontSize: 15 },
  applyBtn: { paddingHorizontal: 20, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  applyBtnText: { color: '#fff', fontSize: 14 },
  appliedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  appliedText: { flex: 1, fontSize: 13 },
});
