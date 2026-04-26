import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#F4A460';

export type CalendarBooking = {
  id: string;
  date: string; // any string parseable by Date or "YYYY-MM-DD" or display formats like "Apr 26, 2026"
  time?: string;
  status?: string;
  salonName?: string;
  serviceName?: string;
  customerName?: string;
  totalPrice?: number;
};

const STATUS_COLOR: Record<string, string> = {
  pending: '#F59E0B',
  upcoming: '#3B82F6',
  confirmed: '#3B82F6',
  completed: '#10B981',
  cancelled: '#EF4444',
};

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  return null;
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function BookingsCalendar({
  bookings,
  onSelectBooking,
  theme,
}: {
  bookings: CalendarBooking[];
  onSelectBooking?: (b: CalendarBooking) => void;
  theme: { card: string; border: string; text: string; textSecondary: string; background: string; primary?: string };
}) {
  const today = new Date();
  const [view, setView] = useState<{ year: number; month: number }>({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDay, setSelectedDay] = useState<string | null>(ymd(today));
  const accent = theme.primary || PRIMARY;

  const byDay = useMemo(() => {
    const map: Record<string, CalendarBooking[]> = {};
    for (const b of bookings) {
      const d = parseDate(b.date);
      if (!d) continue;
      const k = ymd(d);
      (map[k] ||= []).push(b);
    }
    return map;
  }, [bookings]);

  const monthInfo = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const lastDay = new Date(view.year, view.month + 1, 0).getDate();
    const startDow = first.getDay(); // 0=Sun
    return { startDow, lastDay };
  }, [view]);

  const monthName = new Date(view.year, view.month, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const cells: Array<{ day: number | null; key: string }> = [];
  for (let i = 0; i < monthInfo.startDow; i++) cells.push({ day: null, key: `pad-${i}` });
  for (let d = 1; d <= monthInfo.lastDay; d++) cells.push({ day: d, key: `d-${d}` });
  // pad to multiple of 7
  while (cells.length % 7 !== 0) cells.push({ day: null, key: `tail-${cells.length}` });

  const goPrev = () => {
    const m = view.month - 1;
    setView(m < 0 ? { year: view.year - 1, month: 11 } : { year: view.year, month: m });
  };
  const goNext = () => {
    const m = view.month + 1;
    setView(m > 11 ? { year: view.year + 1, month: 0 } : { year: view.year, month: m });
  };
  const goToday = () => {
    const t = new Date();
    setView({ year: t.getFullYear(), month: t.getMonth() });
    setSelectedDay(ymd(t));
  };

  const dayList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedBookings = selectedDay ? (byDay[selectedDay] || []) : [];

  return (
    <View style={[styles.wrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.header}>
        <Pressable onPress={goPrev} style={[styles.navBtn, { backgroundColor: theme.background }]}>
          <Ionicons name="chevron-back" size={18} color={theme.text} />
        </Pressable>
        <Pressable onPress={goToday}>
          <Text style={[styles.title, { color: theme.text }]}>{monthName}</Text>
        </Pressable>
        <Pressable onPress={goNext} style={[styles.navBtn, { backgroundColor: theme.background }]}>
          <Ionicons name="chevron-forward" size={18} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.dowRow}>
        {dayList.map(d => (
          <Text key={d} style={[styles.dowText, { color: theme.textSecondary }]}>{d}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map(c => {
          if (c.day == null) {
            return <View key={c.key} style={styles.cell} />;
          }
          const dayKey = `${view.year}-${String(view.month + 1).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`;
          const dayBookings = byDay[dayKey] || [];
          const isToday = dayKey === ymd(today);
          const isSelected = dayKey === selectedDay;
          const dotColor = dayBookings.length > 0 ? (STATUS_COLOR[dayBookings[0].status || 'pending'] || accent) : null;
          return (
            <Pressable
              key={c.key}
              onPress={() => setSelectedDay(dayKey)}
              style={({ pressed }) => [
                styles.cell,
                isSelected && { backgroundColor: accent + '22', borderColor: accent },
                isToday && !isSelected && { borderColor: accent + '88' },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[
                styles.cellNum,
                { color: theme.text },
                isToday && { color: accent, fontFamily: 'Urbanist_700Bold' },
              ]}>{c.day}</Text>
              {dayBookings.length > 0 && (
                <View style={styles.dotsRow}>
                  {dayBookings.slice(0, 3).map((b, i) => (
                    <View
                      key={i}
                      style={[styles.dot, { backgroundColor: STATUS_COLOR[b.status || 'pending'] || accent }]}
                    />
                  ))}
                  {dayBookings.length > 3 && (
                    <Text style={[styles.dotMore, { color: theme.textSecondary }]}>+{dayBookings.length - 3}</Text>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Selected day bookings */}
      {selectedDay && (
        <View style={[styles.dayList, { borderTopColor: theme.border }]}>
          <Text style={[styles.dayListTitle, { color: theme.text }]}>
            {new Date(selectedDay).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
          {selectedBookings.length === 0 ? (
            <Text style={[styles.empty, { color: theme.textSecondary }]}>No bookings</Text>
          ) : (
            selectedBookings
              .slice()
              .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
              .map(b => (
                <Pressable
                  key={b.id}
                  onPress={() => onSelectBooking?.(b)}
                  style={({ pressed }) => [
                    styles.bookingRow,
                    { borderColor: theme.border, backgroundColor: theme.background, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <View style={[styles.timePill, { backgroundColor: (STATUS_COLOR[b.status || 'pending'] || accent) + '22' }]}>
                    <Text style={[styles.timeText, { color: STATUS_COLOR[b.status || 'pending'] || accent }]}>
                      {b.time || '--:--'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bookingTitle, { color: theme.text }]} numberOfLines={1}>
                      {b.customerName || b.salonName || 'Booking'}
                    </Text>
                    {b.serviceName ? (
                      <Text style={[styles.bookingSub, { color: theme.textSecondary }]} numberOfLines={1}>
                        {b.serviceName}
                      </Text>
                    ) : null}
                  </View>
                  {typeof b.totalPrice === 'number' && (
                    <Text style={[styles.price, { color: accent }]}>CHF {b.totalPrice}</Text>
                  )}
                </Pressable>
              ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  navBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dowRow: { flexDirection: 'row', marginBottom: 6 },
  dowText: { flex: 1, textAlign: 'center', fontFamily: 'Urbanist_700Bold', fontSize: 11, letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: 'transparent' },
  cellNum: { fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  dotsRow: { flexDirection: 'row', gap: 2, marginTop: 3, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  dotMore: { fontFamily: 'Urbanist_500Medium', fontSize: 8, marginLeft: 2 },

  dayList: { marginTop: 14, paddingTop: 12, borderTopWidth: 1 },
  dayListTitle: { fontFamily: 'Urbanist_700Bold', fontSize: 14, marginBottom: 8 },
  empty: { fontFamily: 'Urbanist_500Medium', fontSize: 12, textAlign: 'center', paddingVertical: 16 },
  bookingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, marginBottom: 6 },
  timePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, minWidth: 60, alignItems: 'center' },
  timeText: { fontFamily: 'Urbanist_700Bold', fontSize: 12 },
  bookingTitle: { fontFamily: 'Urbanist_700Bold', fontSize: 13 },
  bookingSub: { fontFamily: 'Urbanist_400Regular', fontSize: 11, marginTop: 1 },
  price: { fontFamily: 'Urbanist_700Bold', fontSize: 13 },
});

export default BookingsCalendar;
