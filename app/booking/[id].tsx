import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/query-client';
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
  { id: 'pm1', name: 'Credit Card', icon: 'card-outline' },
  { id: 'pm2', name: 'PayPal', icon: 'logo-paypal' },
  { id: 'pm3', name: 'Apple Pay', icon: 'logo-apple' },
  { id: 'pm4', name: 'Google Pay', icon: 'logo-google' },
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
  const [step, setStep] = useState<'services' | 'datetime' | 'payment' | 'review' | 'success'>('services');
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('pm1');
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;
  const bottomPad = Platform.OS === 'web' ? webBottomInset : insets.bottom;

  const total = selectedServices.reduce((sum, s) => sum + s.price, 0);

  const toggleService = (service: Service) => {
    Haptics.selectionAsync();
    setSelectedServices(prev =>
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step === 'services' && selectedServices.length > 0) setStep('datetime');
    else if (step === 'datetime' && selectedTime) setStep('payment');
    else if (step === 'payment') setStep('review');
    else if (step === 'review') {
      const bookingData = {
        salonId: salon.id,
        salonName: salon.name,
        salonImage: salon.image,
        services: selectedServices.map(s => s.name),
        date: days[selectedDate].full,
        time: selectedTime,
        totalPrice: total,
        status: 'upcoming',
        paymentMethod: paymentMethods.find(p => p.id === selectedPayment)?.name || 'Credit Card',
      };
      addBooking(bookingData).then(() => setStep('success')).catch(() => {});
    }
  };

  const handleBack = () => {
    if (step === 'services') router.back();
    else if (step === 'datetime') setStep('services');
    else if (step === 'payment') setStep('datetime');
    else if (step === 'review') setStep('payment');
  };

  const titles = { services: 'Select Services', datetime: 'Select Date & Time', payment: 'Payment Method', review: 'Review Summary', success: '' };
  const canContinue = (step === 'services' && selectedServices.length > 0)
    || (step === 'datetime' && !!selectedTime)
    || step === 'payment'
    || step === 'review';

  if (step !== 'success' && (isLoading || !salon)) {
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
            Your appointment has been booked successfully.
          </Text>
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
        <Pressable onPress={handleBack} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
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
            {salon.services.map(service => {
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
            {paymentMethods.map(pm => (
              <Pressable key={pm.id} onPress={() => { Haptics.selectionAsync(); setSelectedPayment(pm.id); }} style={[styles.paymentItem, { borderColor: pm.id === selectedPayment ? theme.primary : theme.border, backgroundColor: pm.id === selectedPayment ? theme.primary + '08' : 'transparent' }]}>
                <Ionicons name={pm.icon as any} size={28} color={theme.text} />
                <Text style={[styles.paymentName, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{pm.name}</Text>
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
            <View style={[styles.totalCard, { backgroundColor: theme.surface }]}>
              {selectedServices.map(s => (
                <View key={s.id} style={styles.reviewRow}>
                  <Text style={[styles.reviewLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{s.name}</Text>
                  <Text style={[styles.reviewValue, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>${s.price}</Text>
                </View>
              ))}
              <View style={[styles.reviewDivider, { backgroundColor: theme.divider }]} />
              <View style={styles.reviewRow}>
                <Text style={[styles.totalLabel, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Total</Text>
                <Text style={[styles.totalValue, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>${total}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 12, backgroundColor: theme.background }]}>
        {step !== 'success' && total > 0 && step !== 'review' && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalSmallLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>Total</Text>
            <Text style={[styles.totalSmallValue, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>${total}</Text>
          </View>
        )}
        <Pressable
          onPress={handleNext}
          disabled={!canContinue}
          style={({ pressed }) => [styles.continueBtn, { backgroundColor: canContinue ? theme.primary : theme.border, opacity: pressed && canContinue ? 0.9 : 1 }]}
        >
          <Text style={[styles.continueBtnText, { fontFamily: 'Urbanist_700Bold', color: canContinue ? '#fff' : theme.textTertiary }]}>
            {step === 'review' ? 'Confirm Booking' : 'Continue'}
          </Text>
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
  paymentItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1.5, gap: 16 },
  paymentName: { flex: 1, fontSize: 16 },
  reviewCard: { borderRadius: 20, padding: 20, gap: 12 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewLabel: { fontSize: 14 },
  reviewValue: { fontSize: 14, textAlign: 'right', flex: 1, marginLeft: 16 },
  reviewDivider: { height: 1 },
  totalCard: { borderRadius: 20, padding: 20, gap: 10 },
  totalLabel: { fontSize: 16 },
  totalValue: { fontSize: 20 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalSmallLabel: { fontSize: 14 },
  totalSmallValue: { fontSize: 20 },
  continueBtn: { height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  continueBtnText: { fontSize: 16 },
  homeBtn: { height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginTop: 12 },
  homeBtnText: { fontSize: 16 },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successIcon: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  successTitle: { fontSize: 28, marginBottom: 12, textAlign: 'center' },
  successSub: { fontSize: 16, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
});
