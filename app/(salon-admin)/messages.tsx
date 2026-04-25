import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

export default function SalonMessages() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const router = useRouter();
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['salon-messages'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/messages');
      return res.json();
    },
    refetchInterval: 10000,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['salon-customers'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/salon/customers');
      return res.json();
    },
    enabled: showNewChat,
  });

  const filteredCustomers = searchQuery.trim()
    ? customers.filter((c: any) =>
        (c.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : customers;

  // Filter out customers who already have conversations
  const existingUserIds = new Set(conversations.map((c: any) => c.userId));
  const newCustomers = filteredCustomers.filter((c: any) => !existingUserIds.has(c.id));
  const existingCustomers = filteredCustomers.filter((c: any) => existingUserIds.has(c.id));

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000 * 7) {
      return d.toLocaleDateString([], { weekday: 'short' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const openChat = (conv: any) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id: conv.userId, name: conv.userName, image: conv.userAvatar || '', role: 'salon_admin' },
    });
  };

  const startNewChat = (customer: any) => {
    setShowNewChat(false);
    setSearchQuery('');
    router.push({
      pathname: '/chat/[id]',
      params: { id: customer.id, name: customer.fullName, image: customer.avatar || '', role: 'salon_admin' },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>{t('messages') || 'Messages'}</Text>
          <Text style={styles.subtitle}>
            {conversations.length} {t('conversations') || 'conversations'}
          </Text>
        </View>
        <Pressable onPress={() => setShowNewChat(true)} style={styles.newChatBtn}>
          <Ionicons name="create-outline" size={18} color="#181A20" />
          <Text style={styles.newChatBtnText}>{t('new_chat') || 'New Chat'}</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Ionicons name="chatbubbles-outline" size={40} color={BORDER} />
              </View>
              <Text style={styles.emptyTitle}>{t('no_messages') || 'No messages yet'}</Text>
              <Text style={styles.emptySubtitle}>{t('start_new_chat_hint') || 'Tap "New Chat" to message a customer'}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openChat(item)}
              style={({ pressed }) => [styles.chatRow, pressed && { backgroundColor: '#ffffff08' }]}
            >
              {item.userAvatar ? (
                <Image source={{ uri: item.userAvatar }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarLetter}>{(item.userName || 'U')[0].toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.chatInfo}>
                <View style={styles.chatNameRow}>
                  <Text style={styles.chatName} numberOfLines={1}>{item.userName}</Text>
                  <Text style={styles.chatTime}>{formatTime(item.lastMessageAt)}</Text>
                </View>
                <View style={styles.chatMsgRow}>
                  <Text style={[styles.chatMsg, item.unreadCount > 0 && styles.chatMsgUnread]} numberOfLines={1}>
                    {item.sender === 'salon' ? `${t('you') || 'You'}: ` : ''}{item.lastMessage}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* New Chat Modal */}
      <Modal visible={showNewChat} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => { setShowNewChat(false); setSearchQuery(''); }} />
          <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('new_chat') || 'New Chat'}</Text>
              <Pressable onPress={() => { setShowNewChat(false); setSearchQuery(''); }} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#888" />
              </Pressable>
            </View>

            {/* Search */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder={t('search_customers') || 'Search customers...'}
                placeholderTextColor="#555"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#666" />
                </Pressable>
              )}
            </View>

            <FlatList
              data={[...newCustomers, ...existingCustomers]}
              keyExtractor={(item: any) => item.id}
              style={{ maxHeight: 400 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptySearch}>
                  <Ionicons name="people-outline" size={32} color={BORDER} />
                  <Text style={styles.emptySearchText}>{t('no_customers_found') || 'No customers found'}</Text>
                </View>
              }
              renderItem={({ item }: any) => {
                const hasConversation = existingUserIds.has(item.id);
                return (
                  <Pressable
                    onPress={() => startNewChat(item)}
                    style={({ pressed }) => [styles.customerRow, pressed && { backgroundColor: '#ffffff08' }]}
                  >
                    {item.avatar ? (
                      <Image source={{ uri: item.avatar }} style={styles.customerAvatar} contentFit="cover" />
                    ) : (
                      <View style={styles.customerAvatarPlaceholder}>
                        <Text style={styles.customerAvatarLetter}>{(item.fullName || 'U')[0].toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.customerName}>{item.fullName}</Text>
                      <Text style={styles.customerEmail}>{item.email}</Text>
                    </View>
                    {hasConversation ? (
                      <View style={styles.existingBadge}>
                        <Ionicons name="chatbubble" size={12} color={PRIMARY} />
                      </View>
                    ) : (
                      <Ionicons name="chatbubble-outline" size={18} color="#666" />
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginTop: 8, marginBottom: 16 },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 28 },
  subtitle: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginTop: 2 },
  newChatBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PRIMARY, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  newChatBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 14 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { color: '#aaa', fontFamily: 'Urbanist_600SemiBold', fontSize: 16, marginBottom: 4 },
  emptySubtitle: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 13 },
  chatRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarPlaceholder: { width: 52, height: 52, borderRadius: 26, backgroundColor: `${PRIMARY}20`, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 22 },
  chatInfo: { flex: 1 },
  chatNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16, flex: 1 },
  chatTime: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 12, marginLeft: 8 },
  chatMsgRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chatMsg: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 14, flex: 1 },
  chatMsgUnread: { color: '#ccc', fontFamily: 'Urbanist_600SemiBold' },
  unreadBadge: { backgroundColor: PRIMARY, borderRadius: 12, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 12 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: CARD, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12, borderWidth: 1, borderColor: BORDER },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#444', alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 20 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff08', alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#181A20', borderRadius: 14, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, height: 46, gap: 10, marginBottom: 16 },
  searchInput: { flex: 1, color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 14, height: '100%' },
  emptySearch: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptySearchText: { color: '#666', fontFamily: 'Urbanist_500Medium', fontSize: 14 },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  customerAvatar: { width: 44, height: 44, borderRadius: 22 },
  customerAvatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${PRIMARY}18`, alignItems: 'center', justifyContent: 'center' },
  customerAvatarLetter: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 18 },
  customerName: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 15 },
  customerEmail: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 12 },
  existingBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: `${PRIMARY}18`, alignItems: 'center', justifyContent: 'center' },
});
