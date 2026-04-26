import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, Alert, ActivityIndicator } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

export default function SalonCheckinScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [bookingCode, setBookingCode] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanning, setScanning] = useState(false);

  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ['salon-bookings'],
    queryFn: async () => { const res = await apiRequest('GET', '/api/salon/bookings'); return res.json(); },
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date?.includes(todayStr) || b.date?.startsWith(todayStr));
  const upcomingToday = todayBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
  const arrivedToday = todayBookings.filter(b => b.arrivedAt || b.status === 'arrived' || b.status === 'completed');

  const checkin = useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await apiRequest('POST', `/api/salon/bookings/${bookingId}/checkin`);
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['salon-bookings'] });
      setScanResult({ success: true, booking: data });
      setBookingCode('');
    },
    onError: (err: any) => {
      const msg = err?.message?.includes('404') ? (t('booking_not_found') || 'Booking not found in your salon')
        : err?.message?.includes('already') ? (t('already_checked_in') || 'Customer already checked in')
        : (t('checkin_failed') || 'Check-in failed');
      setScanResult({ success: false, error: msg });
    },
  });

  const submitCode = () => {
    if (!bookingCode.trim()) return;
    setScanResult(null);
    // Try to parse as JSON QR data first, then as plain ID
    let bookingId = bookingCode.trim();
    try {
      const parsed = JSON.parse(bookingCode);
      if (parsed?.id) bookingId = parsed.id;
    } catch { /* not JSON, treat as ID */ }
    checkin.mutate(bookingId);
  };

  const handleScanFromCamera = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert(t('coming_soon') || 'Coming soon', 'Camera scanning available on mobile soon');
      return;
    }
    // Try camera first
    const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    if (hasCamera && 'BarcodeDetector' in window) {
      try {
        setScanning(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        await video.play();

        // @ts-ignore
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const detectInterval = setInterval(async () => {
          try {
            const codes = await detector.detect(video);
            if (codes.length > 0) {
              clearInterval(detectInterval);
              stream.getTracks().forEach(t => t.stop());
              setScanning(false);
              setBookingCode(codes[0].rawValue);
              setTimeout(() => submitCode(), 100);
            }
          } catch { }
        }, 500);
        setTimeout(() => {
          clearInterval(detectInterval);
          stream.getTracks().forEach(t => t.stop());
          setScanning(false);
        }, 30000);
        return;
      } catch (e) {
        setScanning(false);
        // Fall through to image upload
      }
    }
    // Desktop fallback: upload an image and decode it with BarcodeDetector
    handleUploadImage();
  };

  const handleUploadImage = () => {
    if (Platform.OS !== 'web') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setScanning(true);
      try {
        if ('BarcodeDetector' in window) {
          // Decode via BarcodeDetector + ImageBitmap
          const bitmap = await (window as any).createImageBitmap(file);
          // @ts-ignore
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const codes = await detector.detect(bitmap);
          if (codes.length > 0) {
            setBookingCode(codes[0].rawValue);
            setTimeout(() => submitCode(), 100);
          } else {
            alert(t('qr_not_found') || 'No QR code found in this image');
          }
        } else {
          // Browser doesn't support BarcodeDetector at all — graceful message
          alert(t('qr_not_supported') || 'QR detection not supported in this browser. Please use the latest Chrome/Edge or enter the booking ID manually.');
        }
      } catch (err: any) {
        alert(t('qr_decode_failed') || 'Failed to read QR code from image');
      } finally {
        setScanning(false);
      }
    };
    input.click();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>{t('checkin') || 'Check-in'}</Text>
          <Text style={styles.subtitle}>{t('scan_qr_to_checkin') || 'Scan customer QR or enter booking ID'}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: PRIMARY }]}>
            <Ionicons name="calendar" size={18} color={PRIMARY} />
            <Text style={styles.statValue}>{todayBookings.length}</Text>
            <Text style={styles.statLabel}>{t('today_bookings') || 'Today'}</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
            <Ionicons name="checkmark-done" size={18} color="#10B981" />
            <Text style={styles.statValue}>{arrivedToday.length}</Text>
            <Text style={styles.statLabel}>{t('arrived') || 'Arrived'}</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
            <Ionicons name="time" size={18} color="#F59E0B" />
            <Text style={styles.statValue}>{upcomingToday.length}</Text>
            <Text style={styles.statLabel}>{t('waiting') || 'Waiting'}</Text>
          </View>
        </View>

        {/* QR Scanner */}
        <LinearGradient
          colors={[PRIMARY + '25', PRIMARY + '08']}
          style={styles.scanCard}
        >
          <View style={styles.scanIconBox}>
            <MaterialCommunityIcons name="qrcode-scan" size={40} color={PRIMARY} />
          </View>
          <Text style={styles.scanTitle}>{t('scan_customer_qr') || 'Scan Customer QR'}</Text>
          <Text style={styles.scanSub}>{t('scan_qr_desc') || 'Use camera to scan or enter booking ID below'}</Text>

          <View style={{ flexDirection: 'row', gap: 8, width: '100%' }}>
            <Pressable onPress={handleScanFromCamera} disabled={scanning} style={[styles.scanBtn, { flex: 1 }]}>
              {scanning ? (
                <>
                  <ActivityIndicator color="#181A20" />
                  <Text style={styles.scanBtnText}>{t('scanning') || 'Scanning...'}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="scan" size={18} color="#181A20" />
                  <Text style={styles.scanBtnText}>{t('open_camera') || 'Open Camera'}</Text>
                </>
              )}
            </Pressable>
            <Pressable
              onPress={handleUploadImage}
              disabled={scanning}
              style={[styles.scanBtn, { flex: 1, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: PRIMARY }]}
            >
              <Ionicons name="image" size={18} color={PRIMARY} />
              <Text style={[styles.scanBtnText, { color: PRIMARY }]}>{t('upload_image') || 'Upload Image'}</Text>
            </Pressable>
          </View>

          <Text style={styles.orText}>{t('or') || 'OR'}</Text>

          <View style={styles.codeInputWrap}>
            <Ionicons name="keypad-outline" size={18} color={PRIMARY} />
            <TextInput
              style={styles.codeInput}
              placeholder={t('enter_booking_id') || 'Enter booking ID...'}
              placeholderTextColor="#666"
              value={bookingCode}
              onChangeText={setBookingCode}
              onSubmitEditing={submitCode}
              autoCapitalize="characters"
            />
            <Pressable onPress={submitCode} disabled={!bookingCode.trim() || checkin.isPending} style={[styles.submitBtn, (!bookingCode.trim() || checkin.isPending) && { opacity: 0.5 }]}>
              {checkin.isPending ? <ActivityIndicator size="small" color="#181A20" /> : <Ionicons name="checkmark" size={18} color="#181A20" />}
            </Pressable>
          </View>
        </LinearGradient>

        {/* Result */}
        {scanResult && (
          <View style={[styles.resultCard, { borderColor: scanResult.success ? '#10B981' : '#EF4444' }]}>
            <View style={[styles.resultIcon, { backgroundColor: scanResult.success ? '#10B98120' : '#EF444420' }]}>
              <Ionicons name={scanResult.success ? 'checkmark-circle' : 'close-circle'} size={32} color={scanResult.success ? '#10B981' : '#EF4444'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.resultTitle, { color: scanResult.success ? '#10B981' : '#EF4444' }]}>
                {scanResult.success ? (t('checkin_success') || 'Check-in Successful!') : (t('checkin_failed') || 'Check-in Failed')}
              </Text>
              {scanResult.success && scanResult.booking ? (
                <>
                  <Text style={styles.resultText}>{scanResult.booking.clientName || 'Customer'}</Text>
                  <Text style={styles.resultSub}>{scanResult.booking.serviceName || ''} · {scanResult.booking.time || ''}</Text>
                </>
              ) : (
                <Text style={styles.resultText}>{scanResult.error}</Text>
              )}
            </View>
          </View>
        )}

        {/* Today's Bookings */}
        <View style={{ marginTop: 16 }}>
          <Text style={styles.listTitle}>{t('todays_bookings') || "Today's Bookings"}</Text>
          {upcomingToday.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={32} color="#444" />
              <Text style={styles.emptyText}>{t('no_upcoming_today') || 'No upcoming bookings today'}</Text>
            </View>
          ) : (
            upcomingToday.map(b => (
              <Pressable
                key={b.id}
                onPress={() => checkin.mutate(b.id)}
                style={styles.bookingItem}
              >
                <View style={[styles.bookingAvatar, { backgroundColor: PRIMARY + '20' }]}>
                  <Text style={styles.bookingInitial}>{(b.clientName || 'C')[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookingName}>{b.clientName || 'Customer'}</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 2 }}>
                    <Text style={styles.bookingTime}><Ionicons name="time-outline" size={11} /> {b.time}</Text>
                    <Text style={styles.bookingPrice}>CHF {b.totalPrice}</Text>
                  </View>
                </View>
                <View style={styles.checkinIconBtn}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, marginTop: 8, marginBottom: 14 },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 26 },
  subtitle: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginTop: 2 },

  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: BORDER, borderLeftWidth: 3, alignItems: 'center', gap: 4 },
  statValue: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 22 },
  statLabel: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 11 },

  scanCard: { marginHorizontal: 20, padding: 24, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: PRIMARY + '40' },
  scanIconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: PRIMARY + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  scanTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20, marginBottom: 4 },
  scanSub: { color: '#aaa', fontFamily: 'Urbanist_400Regular', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  scanBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: PRIMARY, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, minWidth: 200, justifyContent: 'center' },
  scanBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  orText: { color: '#666', fontFamily: 'Urbanist_700Bold', fontSize: 12, letterSpacing: 2, marginVertical: 16 },
  codeInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#13151B', borderRadius: 14, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, height: 52, width: '100%' },
  codeInput: { flex: 1, color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 14, height: '100%' },
  submitBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },

  resultCard: { marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: 16, borderWidth: 2, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD },
  resultIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontFamily: 'Urbanist_700Bold', fontSize: 16, marginBottom: 2 },
  resultText: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 14 },
  resultSub: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 12, marginTop: 2 },

  listTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16, marginHorizontal: 20, marginBottom: 10 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { color: '#666', fontFamily: 'Urbanist_500Medium', fontSize: 13 },
  bookingItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, marginBottom: 8, padding: 12, backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER },
  bookingAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  bookingInitial: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 18 },
  bookingName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  bookingTime: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 12 },
  bookingPrice: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 12 },
  checkinIconBtn: { padding: 4 },
});
