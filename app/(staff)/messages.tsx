import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

export default function StaffMessages() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const router = useRouter();
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['staff-messages'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/staff/messages');
      return res.json();
    },
    refetchInterval: 10000,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['staff-bookings-for-chat'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/staff/bookings');
      return res.json();
    },
    enabled: showNewChat,
  });

  const uniqueCustomers = Array.from(
    new Map(bookings.map((b: any) => [b.userId, { id: b.userId, fullName: b.clientName || 'Customer', email: '' }])).values()
  );

  const filteredCustomers = searchQuery.trim()
    ? uniqueCustomers.filter((c: any) => (c.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : uniqueCustomers;

  const filteredConversations = filterSearch.trim()
    ? conversations.filter((c: any) =>
        (c.userName || '').toLowerCase().includes(filterSearch.toLowerCase()) ||
        (c.lastMessage || '').toLowerCase().includes(filterSearch.toLowerCase())
      )
    : conversations;

  const existingUserIds = new Set(conversations.map((c: any) => c.userId));
  const totalUnread = conversations.reduce((s: number, c: any) => s + (c.unreadCount || 0), 0);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const openChat = (conv: any) => {
    router.push({ pathname: '/chat/[id]', params: { id: conv.userId, name: conv.userName, image: conv.userAvatar || '', role: 'staff' } });
  };

  const startNewChat = (customer: any) => {
    setShowNewChat(false);
    setSearchQuery('');
    router.push({ pathname: '/chat/[id]', params: { id: customer.id, name: customer.fullName, image: '', role: 'staff' } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>{t('messages') || 'Messages'}</Text>
          <View style={styles.subtitleRow}>
            <View style={styles.statusDot} />
            <Text style={styles.subtitle}>
              {conversations.length} {t('conversations') || 'conversations'}
              {totalUnread > 0 && `  •  ${totalUnread} ${t('unread') || 'unread'}`}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => setShowNewChat(true)}
          style={({ pressed }) => [styles.newChatBtn, pressed && { opacity: 0.85 }]}
        >
          <MaterialCommunityIcons name="message-plus" size={20} color="#181A20" />
        </Pressable>
      </View>

      {/* Search bar */}
      {conversations.length > 0 && (
        <View style={styles.searchContainer}>
          <View style={styles.searchIconWrap}>
            <Ionicons name="search" size={16} color={PRIMARY} />
          </View>
          <TextInput
            style={styles.searchInputMain}
            placeholder={t('search_conversations') || 'Search conversations...'}
            placeholderTextColor="#555"
            value={filterSearch}
            onChangeText={setFilterSearch}
          />
          {filterSearch.length > 0 && (
            <Pressable onPress={() => setFilterSearch('')} style={styles.searchClearBtn}>
              <Ionicons name="close" size={14} color="#aaa" />
            </Pressable>
          )}
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingWrap}><ActivityIndicator size="large" color={PRIMARY} /></View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <MaterialCommunityIcons name="chat-outline" size={40} color={PRIMARY} />
              </View>
              <Text style={styles.emptyText}>{t('no_messages') || 'No messages yet'}</Text>
              <Text style={styles.emptySubtext}>{t('start_new_chat_hint') || 'Tap + to start a new chat with a client'}</Text>
              <Pressable
                onPress={() => setShowNewChat(true)}
                style={({ pressed }) => [styles.emptyCta, pressed && { opacity: 0.85 }]}
              >
                <MaterialCommunityIcons name="message-plus" size={16} color="#181A20" />
                <Text style={styles.emptyCtaText}>{t('start_chat') || 'Start a Chat'}</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openChat(item)}
              style={({ pressed }) => [
                styles.chatRow,
                item.unreadCount > 0 && { borderColor: PRIMARY + '40' },
                pressed && { opacity: 0.9 },
              ]}
            >
              <View style={styles.avatarWrap}>
                {item.userAvatar ? (
                  <Image source={{ uri: item.userAvatar }} style={styles.avatar} contentFit="cover" />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarLetter}>{(item.userName || 'U')[0].toUpperCase()}</Text>
                  </View>
                )}
                {item.unreadCount > 0 && <View style={styles.onlineDot} />}
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.chatNameRow}>
                  <Text style={styles.chatName} numberOfLines={1}>{item.userName}</Text>
                  <Text style={[styles.chatTime, item.unreadCount > 0 && { color: PRIMARY, fontFamily: 'Urbanist_700Bold' }]}>
                    {formatTime(item.lastMessageAt)}
                  </Text>
                </View>
                <View style={styles.chatMsgRow}>
                  {item.sender === 'salon' && (
                    <Ionicons name="checkmark-done" size={14} color={item.unreadCount > 0 ? PRIMARY : '#666'} />
                  )}
                  <Text style={[styles.chatMsg, item.unreadCount > 0 && styles.chatMsgUnread]} numberOfLines={1}>
                    {item.lastMessage}
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
              <View style={styles.modalIconBadge}>
                <MaterialCommunityIcons name="message-plus" size={20} color={PRIMARY} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{t('new_chat') || 'New Chat'}</Text>
                <Text style={styles.modalSubtitle}>{t('start_chat_with_client') || 'Start a chat with a client'}</Text>
              </View>
            </View>
            <View style={styles.searchBarModal}>
              <Ionicons name="search" size={16} color={PRIMARY} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('search_clients') || 'Search clients...'}
                placeholderTextColor="#555"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item: any) => item.id}
              style={{ maxHeight: 350 }}
              ListEmptyComponent={
                <View style={styles.emptySearchWrap}>
                  <Ionicons name="person-outline" size={32} color={BORDER} />
                  <Text style={styles.emptySearchText}>{t('no_clients') || 'No clients found'}</Text>
                </View>
              }
              renderItem={({ item }: any) => (
                <Pressable
                  onPress={() => startNewChat(item)}
                  style={({ pressed }) => [styles.customerRow, pressed && { backgroundColor: '#ffffff08' }]}
                >
                  <View style={styles.customerAvatarPlaceholder}>
                    <Text style={styles.customerAvatarLetter}>{(item.fullName || 'U')[0].toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.customerName}>{item.fullName}</Text>
                    {existingUserIds.has(item.id) && (
                      <Text style={styles.existingChat}>{t('existing_chat') || 'Existing conversation'}</Text>
                    )}
                  </View>
                  {existingUserIds.has(item.id) && <Ionicons name="chatbubble" size={14} color={PRIMARY} />}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 8, marginBottom: 18 },
  pageTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 26 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  subtitle: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 12 },
  newChatBtn: { width: 46, height: 46, borderRadius: 14, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, marginHorizontal: 20, paddingHorizontal: 16, height: 52, gap: 12, marginBottom: 16 },
  searchIconWrap: { width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(244,164,96,0.12)', alignItems: 'center', justifyContent: 'center' },
  searchInputMain: { flex: 1, color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 14, height: '100%', paddingVertical: 0 },
  searchClearBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#13151B', alignItems: 'center', justifyContent: 'center' },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12, paddingHorizontal: 24 },
  emptyIconWrap: { width: 96, height: 96, borderRadius: 32, backgroundColor: 'rgba(244,164,96,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 4, borderWidth: 1, borderColor: 'rgba(244,164,96,0.25)' },
  emptyText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18 },
  emptySubtext: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13, textAlign: 'center', maxWidth: 260, lineHeight: 18 },
  emptyCta: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: PRIMARY, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, marginTop: 10, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  emptyCtaText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 14 },

  chatRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, marginBottom: 8 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: 18 },
  avatarPlaceholder: { width: 52, height: 52, borderRadius: 18, backgroundColor: PRIMARY + '25', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: PRIMARY + '40' },
  avatarLetter: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 20 },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: PRIMARY, borderWidth: 3, borderColor: CARD },

  chatInfo: { flex: 1 },
  chatNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  chatName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15, flex: 1 },
  chatTime: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 11 },
  chatMsgRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chatMsg: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 13, flex: 1 },
  chatMsgUnread: { color: '#fff', fontFamily: 'Urbanist_700Bold' },
  unreadBadge: { backgroundColor: PRIMARY, borderRadius: 12, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 11 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: CARD, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12, borderWidth: 1, borderColor: BORDER, borderBottomWidth: 0 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#444', alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  modalIconBadge: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(244,164,96,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(244,164,96,0.3)' },
  modalTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18 },
  modalSubtitle: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 12, marginTop: 2 },
  searchBarModal: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#13151B', borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, height: 48, gap: 10, marginBottom: 16 },
  searchInput: { flex: 1, color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 14, height: '100%' },

  emptySearchWrap: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptySearchText: { color: '#666', fontFamily: 'Urbanist_500Medium', fontSize: 13 },

  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12 },
  customerAvatarPlaceholder: { width: 42, height: 42, borderRadius: 14, backgroundColor: PRIMARY + '22', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: PRIMARY + '40' },
  customerAvatarLetter: { color: PRIMARY, fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  customerName: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 14 },
  existingChat: { color: PRIMARY, fontFamily: 'Urbanist_500Medium', fontSize: 11, marginTop: 2 },
});
