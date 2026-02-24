import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';

const paymentMethods = [
  { id: '1', type: 'mastercard', name: 'Mastercard', last4: '4679', icon: 'card' as const },
  { id: '2', type: 'visa', name: 'Visa', last4: '5567', icon: 'card-outline' as const },
  { id: '3', type: 'paypal', name: 'PayPal', last4: 'Linked', icon: 'logo-paypal' as const },
];

export default function PaymentMethodsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState('1');
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: webBottomInset + 40 }}>
        {paymentMethods.map((method) => (
          <Pressable
            key={method.id}
            onPress={() => setSelectedId(method.id)}
            style={({ pressed }) => [
              styles.methodCard,
              { backgroundColor: theme.surface, borderColor: selectedId === method.id ? theme.primary : theme.border, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.surfaceAlt }]}>
              <Ionicons name={method.icon} size={24} color={theme.primary} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={[styles.methodName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{method.name}</Text>
              <Text style={[styles.methodDetail, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
                {method.last4 === 'Linked' ? 'Linked' : `•••• •••• •••• ${method.last4}`}
              </Text>
            </View>
            <Ionicons
              name={selectedId === method.id ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selectedId === method.id ? theme.primary : theme.textTertiary}
            />
          </Pressable>
        ))}

        <Pressable
          onPress={() => {}}
          style={({ pressed }) => [
            styles.addCard,
            { borderColor: theme.primary, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="add" size={24} color={theme.primary} />
          <Text style={[styles.addCardText, { color: theme.primary, fontFamily: 'Urbanist_700Bold' }]}>Add New Card</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 20, textAlign: 'center' },
  methodCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, marginBottom: 16, padding: 16, borderRadius: 16, borderWidth: 1.5 },
  iconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 16, marginBottom: 2 },
  methodDetail: { fontSize: 13 },
  addCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 24, marginTop: 8, paddingVertical: 16, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', gap: 8 },
  addCardText: { fontSize: 16 },
});
