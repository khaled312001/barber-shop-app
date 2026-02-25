import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn, apiRequest } from '@/lib/query-client';
import { useTheme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  image: string;
  category: string;
  salonId: string;
}

const paymentMethods = [
  { id: 'stripe', name: 'Pay with Card', icon: 'card-outline', description: 'Secure payment via Stripe' },
  { id: 'google', name: 'Google Pay', icon: 'logo-google', description: 'Fast checkout' },
  { id: 'cash', name: 'Pay at Salon', icon: 'cash-outline', description: 'Pay when you arrive' },
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();
  const { data: salon, isLoading } = useQuery<any>({
    queryKey: ['/api/salons', id],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  const [step, setStep] = useState<'services' | 'datetime' | 'payment' | 'review' | 'processing' | 'success'>('services');
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
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
      Alert.alert('Invalid Code', err.message || 'The promo code you entered is invalid or expired.');
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

  const processStripePayment = async () => {
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
      Alert.alert('Payment Failed', err.message || 'Something went wrong with your payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processCashPayment = async () => {
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
      Alert.alert('Booking Failed', err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step === 'services' && selectedServices.length > 0) setStep('datetime');
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

  const handleBack = () => {
    if (step === 'services') router.back();
    else if (step === 'datetime') setStep('services');
    else if (step === 'payment') setStep('datetime');
    else if (step === 'review') setStep('payment');
  };

  const titles: Record<string, string> = { services: 'Select Services', datetime: 'Select Date & Time', payment: 'Payment Method', review: 'Review Summary', processing: 'Processing Payment', success: '' };
  const canContinue = (step === 'services' && selectedServices.length > 0)
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
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: theme.primary }]}>
            <Ionicons name="checkmark" size={60} color="#fff" />
          </View>
          <Text style={[styles.successTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Booking Successful!</Text>
          <Text style={[styles.successSub, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
            {selectedPayment === 'cash'
              ? 'Your appointment has been booked. Please pay at the salon.'
              : 'Your appointment has been booked and payment processed successfully.'}
          </Text>
          {selectedPayment !== 'cash' && (
            <View style={[styles.paymentConfirmCard, { backgroundColor: theme.surface }]}>
              <Ionicons name="shield-checkmark" size={20} color={theme.success} />
              <Text style={[styles.paymentConfirmText, { color: theme.success, fontFamily: 'Urbanist_600SemiBold' }]}>
                Payment of ${total.toFixed(2)} processed via Stripe
              </Text>
            </View>
          )}
          <Pressable onPress={() => router.replace('/(tabs)/bookings')} style={({ pressed }) => [styles.continueBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}>
            <Text style={[styles.continueBtnText, { fontFamily: 'Urbanist_700Bold' }]}>View My Bookings</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/(tabs)')} style={({ pressed }) => [styles.homeBtn, { borderColor: theme.primary, opacity: pressed ? 0.7 : 1 }]}>
            <Text style={[styles.homeBtnText, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>Back to Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={handleBack} disabled={isProcessing} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{titles[step]}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressBar}>
        {['services', 'datetime', 'payment', 'review'].map((s, i) => (
          <View key={s} style={[styles.progressDot, { backgroundColor: ['services', 'datetime', 'payment', 'review'].indexOf(step) >= i ? theme.primary : theme.border }]} />
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
                  <View style={styles.serviceLeft}>
                    <Text style={[styles.serviceName, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{service.name}</Text>
                    <Text style={[styles.serviceDuration, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{service.duration}</Text>
                  </View>
                  <Text style={[styles.servicePrice, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>${service.price}</Text>
                  <Ionicons name={isSelected ? 'checkbox' : 'square-outline'} size={24} color={isSelected ? theme.primary : theme.textTertiary} />
                </Pressable>
              );
            })}
          </View>
        )}

        {step === 'datetime' && (
          <View style={styles.content}>
            <Text style={[styles.subTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {days.map((d, i) => (
                <Pressable key={i} onPress={() => { Haptics.selectionAsync(); setSelectedDate(i); }} style={[styles.dateCard, { backgroundColor: i === selectedDate ? theme.primary : theme.surface, borderColor: i === selectedDate ? theme.primary : theme.border }]}>
                  <Text style={[styles.dateDay, { color: i === selectedDate ? '#fff' : theme.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>{d.day}</Text>
                  <Text style={[styles.dateNum, { color: i === selectedDate ? '#fff' : theme.text, fontFamily: 'Urbanist_700Bold' }]}>{d.date}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={[styles.subTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold', marginTop: 24 }]}>Select Time</Text>
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
                All card payments are processed securely through Stripe
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
                <Text style={[styles.reviewLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>Salon</Text>
                <Text style={[styles.reviewValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{salon.name}</Text>
              </View>
              <View style={[styles.reviewDivider, { backgroundColor: theme.divider }]} />
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>Services</Text>
                <Text style={[styles.reviewValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{selectedServices.map(s => s.name).join(', ')}</Text>
              </View>
              <View style={[styles.reviewDivider, { backgroundColor: theme.divider }]} />
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>Date</Text>
                <Text style={[styles.reviewValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{days[selectedDate].full}</Text>
              </View>
              <View style={[styles.reviewDivider, { backgroundColor: theme.divider }]} />
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>Time</Text>
                <Text style={[styles.reviewValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{selectedTime}</Text>
              </View>
              <View style={[styles.reviewDivider, { backgroundColor: theme.divider }]} />
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>Payment</Text>
                <Text style={[styles.reviewValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{paymentMethods.find(p => p.id === selectedPayment)?.name}</Text>
              </View>
            </View>

            <View style={[styles.promoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.promoInputRow}>
                <View style={[styles.promoInputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                  <Ionicons name="pricetag-outline" size={20} color={theme.textTertiary} />
                  <input
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: theme.text,
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontFamily: 'Urbanist_600SemiBold',
                      outline: 'none',
                    }}
                    placeholder="Enter Promo Code"
                    value={promoCode}
                    onChange={(e: any) => setPromoCode(e.target.value.toUpperCase())}
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
                    <Text style={[styles.applyBtnText, { fontFamily: 'Urbanist_700Bold' }]}>Apply</Text>
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
                <Text style={[styles.reviewLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>Subtotal</Text>
                <Text style={[styles.reviewValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>${subtotal.toFixed(2)}</Text>
              </View>
              {appliedCoupon && (
                <View style={styles.reviewRow}>
                  <Text style={[styles.reviewLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>Discount</Text>
                  <Text style={[styles.reviewValue, { color: theme.error, fontFamily: 'Urbanist_600SemiBold' }]}>-${discountAmount.toFixed(2)}</Text>
                </View>
              )}
              <View style={[styles.reviewDivider, { backgroundColor: theme.divider }]} />
              <View style={styles.reviewRow}>
                <Text style={[styles.totalLabel, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Total</Text>
                <Text style={[styles.totalValue, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>${total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 12, backgroundColor: theme.background }]}>
        {step !== 'success' && total > 0 && step !== 'review' && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalSmallLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>Total</Text>
            <Text style={[styles.totalSmallValue, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>${total.toFixed(2)}</Text>
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
              <Text style={[styles.continueBtnText, { fontFamily: 'Urbanist_700Bold', color: '#fff', marginLeft: 8 }]}>Processing Payment...</Text>
            </View>
          ) : (
            <Text style={[styles.continueBtnText, { fontFamily: 'Urbanist_700Bold', color: canContinue ? '#fff' : theme.textTertiary }]}>
              {step === 'review'
                ? selectedPayment === 'cash' ? 'Confirm Booking' : `Pay $${total.toFixed(2)} & Book`
                : 'Continue'}
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
  serviceItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1.5, gap: 12 },
  serviceLeft: { flex: 1 },
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
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successIcon: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  successTitle: { fontSize: 28, marginBottom: 12, textAlign: 'center' },
  successSub: { fontSize: 16, textAlign: 'center', marginBottom: 20, lineHeight: 24 },
  paymentConfirmCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, gap: 10, marginBottom: 24 },
  paymentConfirmText: { fontSize: 14 },
  promoCard: { borderRadius: 20, padding: 20, marginTop: 12, borderWidth: 1 },
  promoInputRow: { flexDirection: 'row', gap: 12 },
  promoInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  applyBtn: { paddingHorizontal: 20, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  applyBtnText: { color: '#fff', fontSize: 14 },
  appliedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  appliedText: { flex: 1, fontSize: 13 },
});
