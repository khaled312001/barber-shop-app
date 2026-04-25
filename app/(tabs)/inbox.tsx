import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, FlatList, Modal, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/query-client';

interface ChatItem {
  salonId: string;
  salonName: string;
  salonImage: string;
  lastMessage: string;
  time: string | null;
  sender?: string;
  unread: number;
}

export default function InboxScreen() {
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [salons, setSalons] = useState<any[]>([]);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  const fetchChats = async () => {
    try {
      const res = await apiRequest('GET', '/api/messages');
      const data = await res.json();
      setChats(data);
    } catch (e) { console.warn('Failed to fetch messages:', e); }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSalons = async () => {
    try {
      const res = await apiRequest('GET', '/api/salons');
      const data = await res.json();
      setSalons(Array.isArray(data) ? data : []);
    } catch { }
  };

  const openNewChat = () => {
    fetchSalons();
    setShowNewChat(true);
  };

  const openChat = (salonId: string, salonName: string, salonImage: string) => {
    router.push({ pathname: '/chat/[id]', params: { id: salonId, name: salonName, image: salonImage } });
  };

  const startNewChat = (salon: any) => {
    setShowNewChat(false);
    setSearchQuery('');
    openChat(salon.id, salon.name, salon.image || '');
  };

  const filteredSalons = searchQuery.trim()
    ? salons.filter((s: any) => (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : salons;

  const existingSalonIds = new Set(chats.map(c => c.salonId));

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000 * 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('inbox')}</Text>
        <Pressable onPress={openNewChat} style={[styles.newChatBtn, { backgroundColor: theme.primary }]}>
          <Ionicons name="create-outline" size={18} color="#181A20" />
        </Pressable>
      </View>

      {/* Chat List */}
      <FlatList
        data={chats}
        keyExtractor={(item) => item.salonId}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.card }]}>
              <Ionicons name="chatbubbles-outline" size={40} color={theme.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>
              {t('no_messages') || 'No messages yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>
              {t('start_chat_with_salon') || 'Start a conversation with a salon'}
            </Text>
            <Pressable onPress={openNewChat} style={[styles.startChatBtn, { backgroundColor: theme.primary }]}>
              <Ionicons name="chatbubble-outline" size={16} color="#181A20" />
              <Text style={[styles.startChatBtnText, { fontFamily: 'Urbanist_700Bold' }]}>{t('new_chat') || 'New Chat'}</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openChat(item.salonId, item.salonName, item.salonImage)}
            style={({ pressed }) => [styles.chatRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            {item.salonImage ? (
              <Image source={{ uri: item.salonImage }} style={styles.chatAvatar} contentFit="cover" />
            ) : (
              <View style={[styles.chatAvatarPlaceholder, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="cut" size={22} color={theme.primary} />
              </View>
            )}
            <View style={styles.chatInfo}>
              <View style={styles.chatNameRow}>
                <Text style={[styles.chatName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]} numberOfLines={1}>{item.salonName}</Text>
                <Text style={[styles.chatTime, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>{formatTime(item.time)}</Text>
              </View>
              <View style={styles.chatMsgRow}>
                <Text style={[styles.chatMessage, { color: item.unread > 0 ? theme.text : theme.textSecondary, fontFamily: item.unread > 0 ? 'Urbanist_600SemiBold' : 'Urbanist_400Regular' }]} numberOfLines={1}>
                  {item.sender === 'user' ? `${t('you') || 'You'}: ` : ''}{item.lastMessage}
                </Text>
                {item.unread > 0 && (
                  <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                    <Text style={[styles.unreadText, { fontFamily: 'Urbanist_700Bold' }]}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        )}
      />

      {/* New Chat Modal */}
      <Modal visible={showNewChat} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => { setShowNewChat(false); setSearchQuery(''); }} />
          <View style={[styles.modalCard, { backgroundColor: theme.card, paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
              {t('choose_salon') || 'Choose a Salon'}
            </Text>
            <View style={[styles.searchBar, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Ionicons name="search-outline" size={18} color="#666" />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder={t('search_salons') || 'Search salons...'}
                placeholderTextColor="#555"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <FlatList
              data={filteredSalons}
              keyExtractor={(item: any) => item.id}
              style={{ maxHeight: 400 }}
              ListEmptyComponent={
                <Text style={[styles.emptySearchText, { color: theme.textTertiary }]}>{t('no_salons_found') || 'No salons found'}</Text>
              }
              renderItem={({ item }: any) => (
                <Pressable onPress={() => startNewChat(item)} style={({ pressed }) => [styles.salonRow, pressed && { backgroundColor: '#ffffff08' }]}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.salonAvatar} contentFit="cover" />
                  ) : (
                    <View style={[styles.salonAvatarPlaceholder, { backgroundColor: theme.primary + '18' }]}>
                      <Ionicons name="cut" size={18} color={theme.primary} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.salonName, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>{item.name}</Text>
                    {item.address && <Text style={[styles.salonAddress, { color: theme.textSecondary }]} numberOfLines={1}>{item.address}</Text>}
                  </View>
                  {existingSalonIds.has(item.id) ? (
                    <View style={[styles.existingBadge, { backgroundColor: theme.primary + '18' }]}>
                      <Ionicons name="chatbubble" size={12} color={theme.primary} />
                    </View>
                  ) : (
                    <Ionicons name="chatbubble-outline" size={18} color={theme.textTertiary} />
                  )}
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
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16 },
  title: { fontSize: 28 },
  newChatBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 0 },
  chatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, gap: 14 },
  chatAvatar: { width: 54, height: 54, borderRadius: 27 },
  chatAvatarPlaceholder: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  chatInfo: { flex: 1 },
  chatNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { fontSize: 16, flex: 1 },
  chatTime: { fontSize: 12, marginLeft: 8 },
  chatMsgRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chatMessage: { fontSize: 14, flex: 1 },
  unreadBadge: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadText: { fontSize: 11, color: '#181A20' },
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 8, paddingHorizontal: 40 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 17, marginBottom: 2 },
  emptySubtitle: { fontSize: 13, textAlign: 'center', marginBottom: 16 },
  startChatBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
  startChatBtnText: { color: '#181A20', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#444', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 46, gap: 10, marginBottom: 16 },
  searchInput: { flex: 1, fontFamily: 'Urbanist_400Regular', fontSize: 14, height: '100%' },
  emptySearchText: { fontFamily: 'Urbanist_500Medium', fontSize: 14, textAlign: 'center', paddingVertical: 30 },
  salonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  salonAvatar: { width: 46, height: 46, borderRadius: 14 },
  salonAvatarPlaceholder: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  salonName: { fontSize: 15 },
  salonAddress: { fontFamily: 'Urbanist_400Regular', fontSize: 12 },
  existingBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
