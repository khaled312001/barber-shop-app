import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, ActivityIndicator, Platform, KeyboardAvoidingView, Modal, Linking, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { apiRequest } from '@/lib/query-client';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { goBack } from '@/lib/navigation';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';
const { width: SCREEN_W } = Dimensions.get('window');

type Message = {
  id: string;
  content: string;
  sender: string;
  senderName?: string;
  createdAt: string;
  isRead?: number;
  messageType?: string;
};

const EMOJIS = ['😀','😂','😍','🥰','😊','👍','❤️','🔥','💯','🎉','👋','🙏','💪','✨','💈','✂️','💇','💇‍♂️','📅','⏰','💰','🏠','📍','📸','🎵','👏','😎','🤩','😢','😡','🤔','👀','💬','📞','✅','❌'];

export default function ChatScreen() {
  const { id, name, image, role } = useLocalSearchParams<{ id: string; name: string; image?: string; role?: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const { t } = useLanguage();
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const pollRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getApiBase = useCallback(() => {
    if (role === 'salon_admin') return '/api/salon/messages';
    if (role === 'staff') return '/api/staff/messages';
    return '/api/messages';
  }, [role]);

  const fetchMessages = useCallback(async () => {
    try {
      const endpoint = role === 'salon_admin' || role === 'staff' ? `${getApiBase()}/${id}` : `/api/messages/${id}`;
      const res = await apiRequest('GET', endpoint);
      const data = await res.json();
      if (Array.isArray(data)) setMsgs(data);
    } catch { } finally { setLoading(false); }
  }, [id, role, getApiBase]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages]);

  const sendMessage = async (content: string, type: string = 'text') => {
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      if (role === 'salon_admin' || role === 'staff') {
        await apiRequest('POST', `${getApiBase()}/${id}`, { content: content.trim(), messageType: type });
      } else {
        await apiRequest('POST', '/api/messages', {
          salonId: id, salonName: name || 'Salon', salonImage: image || '',
          content: content.trim(), messageType: type,
        });
      }
      setText('');
      setShowEmoji(false);
      await fetchMessages();
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    } catch { } finally { setSending(false); }
  };

  const handleSend = () => sendMessage(text);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setShowAttach(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/chat/upload', { method: 'POST', body: formData, credentials: 'include' });
      const data = await res.json();
      if (data.url) {
        const msgContent = JSON.stringify({ url: data.url, type: data.type, name: data.name, size: data.size });
        await sendMessage(msgContent, data.type);
      }
    } catch (e) { console.warn('Upload failed:', e); }
    finally { setUploading(false); }
  };

  const pickFile = (accept: string) => {
    if (Platform.OS !== 'web') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
    };
    input.click();
  };

  const sendLocation = () => {
    setShowAttach(false);
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const locData = JSON.stringify({ lat: latitude, lng: longitude, type: 'location' });
        sendMessage(locData, 'location');
      },
      () => alert('Unable to get location'),
      { enableHighAccuracy: true }
    );
  };

  const isMine = (msg: Message) => {
    if (role === 'salon_admin' || role === 'staff') return msg.sender === 'salon';
    return msg.sender === 'user';
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return time;
    return `${d.getMonth() + 1}/${d.getDate()} ${time}`;
  };

  const parseMediaContent = (content: string) => {
    try { return JSON.parse(content); } catch { return null; }
  };

  const renderMessageContent = (item: Message, mine: boolean) => {
    const mediaData = parseMediaContent(item.content);

    // Location message
    if (item.messageType === 'location' && mediaData?.lat) {
      return (
        <Pressable onPress={() => Linking.openURL(`https://www.google.com/maps?q=${mediaData.lat},${mediaData.lng}`)}>
          <View style={styles.locationBubble}>
            <View style={styles.locationMap}>
              {Platform.OS === 'web' && (
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${mediaData.lng - 0.003}%2C${mediaData.lat - 0.002}%2C${mediaData.lng + 0.003}%2C${mediaData.lat + 0.002}&layer=mapnik&marker=${mediaData.lat}%2C${mediaData.lng}`}
                  style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 } as any}
                />
              )}
            </View>
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={14} color={mine ? '#181A20' : PRIMARY} />
              <Text style={[styles.locationText, mine && { color: '#181A20' }]}>{t('shared_location') || 'Shared Location'}</Text>
              <Ionicons name="open-outline" size={12} color={mine ? '#181A20aa' : '#888'} />
            </View>
          </View>
        </Pressable>
      );
    }

    // Image message
    if (item.messageType === 'image' && mediaData?.url) {
      return (
        <Pressable onPress={() => { if (Platform.OS === 'web') window.open(mediaData.url, '_blank'); }}>
          <Image source={{ uri: mediaData.url }} style={styles.mediaImage} contentFit="cover" />
        </Pressable>
      );
    }

    // Video message
    if (item.messageType === 'video' && mediaData?.url) {
      return (
        <View style={styles.mediaVideo}>
          {Platform.OS === 'web' ? (
            <video src={mediaData.url} controls style={{ width: '100%', maxHeight: 200, borderRadius: 12 } as any} />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Ionicons name="play-circle" size={40} color="#fff" />
            </View>
          )}
        </View>
      );
    }

    // File message
    if (item.messageType === 'file' && mediaData?.url) {
      return (
        <Pressable onPress={() => { if (Platform.OS === 'web') window.open(mediaData.url, '_blank'); }} style={styles.fileMsg}>
          <Ionicons name="document-outline" size={20} color={mine ? '#181A20' : PRIMARY} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.fileName, mine && { color: '#181A20' }]} numberOfLines={1}>{mediaData.name || 'File'}</Text>
            <Text style={[styles.fileSize, mine && { color: '#181A20aa' }]}>{mediaData.size ? `${(mediaData.size / 1024).toFixed(0)} KB` : ''}</Text>
          </View>
          <Ionicons name="download-outline" size={16} color={mine ? '#181A20' : '#888'} />
        </Pressable>
      );
    }

    // Text message (default)
    return <Text style={[styles.msgText, mine && styles.msgTextMine]}>{item.content}</Text>;
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const mine = isMine(item);
    const showDate = index === 0 || new Date(msgs[index - 1].createdAt).toDateString() !== new Date(item.createdAt).toDateString();

    return (
      <View>
        {showDate && (
          <View style={styles.dateRow}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
            </View>
          </View>
        )}
        <View style={[styles.msgRow, mine ? styles.msgRowMine : styles.msgRowTheirs]}>
          <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs,
            (item.messageType === 'image' || item.messageType === 'video' || item.messageType === 'location') && styles.mediaBubble]}>
            {!mine && item.senderName ? <Text style={styles.senderLabel}>{item.senderName}</Text> : null}
            {renderMessageContent(item, mine)}
            <View style={styles.msgMeta}>
              <Text style={[styles.timeText, mine && styles.timeTextMine]}>{formatTime(item.createdAt)}</Text>
              {mine && <Ionicons name={item.isRead ? 'checkmark-done' : 'checkmark'} size={14} color={item.isRead ? '#3B82F6' : mine ? '#181A20aa' : '#999'} style={{ marginLeft: 4 }} />}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={22} color="#fff" /></Pressable>
        {image ? <Image source={{ uri: image }} style={styles.headerAvatar} contentFit="cover" /> :
          <View style={styles.headerAvatarPlaceholder}><Ionicons name="person" size={20} color={PRIMARY} /></View>}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName} numberOfLines={1}>{name || 'Chat'}</Text>
          <Text style={styles.headerStatus}>{t('online') || 'Online'}</Text>
        </View>
        <Pressable style={styles.headerAction}><Ionicons name="call-outline" size={20} color={PRIMARY} /></Pressable>
        <Pressable style={styles.headerAction}><Ionicons name="ellipsis-vertical" size={20} color="#888" /></Pressable>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.loadingWrap}><ActivityIndicator size="large" color={PRIMARY} /></View>
      ) : (
        <FlatList ref={flatListRef} data={msgs} keyExtractor={item => item.id} renderItem={renderMessage}
          contentContainerStyle={styles.messagesList} showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="chatbubbles-outline" size={48} color={BORDER} />
              <Text style={styles.emptyText}>{t('no_messages') || 'No messages yet'}</Text>
              <Text style={styles.emptySubtext}>{t('start_conversation') || 'Send a message to start'}</Text>
            </View>
          }
        />
      )}

      {/* Emoji Picker */}
      {showEmoji && (
        <View style={styles.emojiPicker}>
          <View style={styles.emojiGrid}>
            {EMOJIS.map((emoji, i) => (
              <Pressable key={i} onPress={() => setText(prev => prev + emoji)} style={styles.emojiBtn}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Uploading indicator */}
      {uploading && (
        <View style={styles.uploadingBar}>
          <ActivityIndicator size="small" color={PRIMARY} />
          <Text style={styles.uploadingText}>{t('uploading') || 'Uploading...'}</Text>
        </View>
      )}

      {/* Input Bar */}
      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <Pressable onPress={() => { setShowEmoji(!showEmoji); setShowAttach(false); }} style={styles.inputAction}>
          <Ionicons name={showEmoji ? 'keypad' : 'happy-outline'} size={22} color={showEmoji ? PRIMARY : '#888'} />
        </Pressable>
        <View style={styles.inputWrap}>
          <TextInput style={styles.textInput} placeholder={t('type_message') || 'Type a message...'}
            placeholderTextColor="#666" value={text} onChangeText={setText} multiline maxLength={2000}
            onSubmitEditing={handleSend} onFocus={() => setShowEmoji(false)} />
        </View>
        <Pressable onPress={() => { setShowAttach(!showAttach); setShowEmoji(false); }} style={styles.inputAction}>
          <Ionicons name="attach" size={22} color={showAttach ? PRIMARY : '#888'} />
        </Pressable>
        {text.trim() ? (
          <Pressable onPress={handleSend} disabled={sending} style={[styles.sendBtn, sending && { opacity: 0.5 }]}>
            {sending ? <ActivityIndicator size="small" color="#181A20" /> : <Ionicons name="send" size={18} color="#181A20" />}
          </Pressable>
        ) : (
          <Pressable onPress={() => setShowAttach(!showAttach)} style={[styles.sendBtn, { backgroundColor: '#333' }]}>
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        )}
      </View>

      {/* Attachment Menu */}
      <Modal visible={showAttach} transparent animationType="slide">
        <Pressable style={styles.attachOverlay} onPress={() => setShowAttach(false)}>
          <View style={styles.attachMenu}>
            <View style={styles.attachHandle} />
            <Text style={styles.attachTitle}>{t('share') || 'Share'}</Text>
            <View style={styles.attachGrid}>
              {[
                { icon: 'image', label: t('photo') || 'Photo', color: '#3B82F6', onPress: () => pickFile('image/*') },
                { icon: 'videocam', label: t('video') || 'Video', color: '#10B981', onPress: () => pickFile('video/*') },
                { icon: 'document', label: t('file') || 'File', color: '#F59E0B', onPress: () => pickFile('*/*') },
                { icon: 'location', label: t('location') || 'Location', color: '#EF4444', onPress: sendLocation },
                { icon: 'camera', label: t('camera') || 'Camera', color: '#8B5CF6', onPress: () => pickFile('image/*;capture=camera') },
                { icon: 'person', label: t('contact') || 'Contact', color: '#EC4899', onPress: () => setShowAttach(false) },
              ].map((item, i) => (
                <Pressable key={i} onPress={item.onPress} style={styles.attachItem}>
                  <View style={[styles.attachIcon, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon as any} size={24} color={item.color} />
                  </View>
                  <Text style={styles.attachLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: CARD },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff08', alignItems: 'center', justifyContent: 'center' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerAvatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${PRIMARY}20`, alignItems: 'center', justifyContent: 'center' },
  headerName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  headerStatus: { color: '#10B981', fontFamily: 'Urbanist_400Regular', fontSize: 12 },
  headerAction: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messagesList: { padding: 16, paddingBottom: 8 },
  dateRow: { alignItems: 'center', marginVertical: 12 },
  dateBadge: { backgroundColor: '#ffffff10', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4 },
  dateText: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 12 },
  msgRow: { marginBottom: 6 },
  msgRowMine: { alignItems: 'flex-end' },
  msgRowTheirs: { alignItems: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, paddingBottom: 6 },
  mediaBubble: { paddingHorizontal: 4, paddingTop: 4, overflow: 'hidden' },
  bubbleMine: { backgroundColor: PRIMARY, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderBottomLeftRadius: 4 },
  senderLabel: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 11, marginBottom: 2, paddingHorizontal: 10 },
  msgText: { color: '#ddd', fontFamily: 'Urbanist_400Regular', fontSize: 15, lineHeight: 21 },
  msgTextMine: { color: '#181A20' },
  msgMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, paddingHorizontal: 6 },
  timeText: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 10 },
  timeTextMine: { color: '#181A20aa' },
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyText: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 16 },
  emptySubtext: { color: '#555', fontFamily: 'Urbanist_400Regular', fontSize: 13 },

  // Media
  mediaImage: { width: SCREEN_W * 0.6, maxWidth: 280, height: 200, borderRadius: 14 },
  mediaVideo: { width: SCREEN_W * 0.6, maxWidth: 280, borderRadius: 14, overflow: 'hidden' },
  videoPlaceholder: { width: '100%', height: 150, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  fileMsg: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  fileName: { color: '#ddd', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },
  fileSize: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 11 },
  locationBubble: { width: SCREEN_W * 0.6, maxWidth: 260, borderRadius: 14, overflow: 'hidden' },
  locationMap: { width: '100%', height: 120 },
  locationInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8 },
  locationText: { color: '#ddd', fontFamily: 'Urbanist_600SemiBold', fontSize: 13, flex: 1 },

  // Emoji
  emojiPicker: { backgroundColor: CARD, borderTopWidth: 1, borderTopColor: BORDER, paddingVertical: 8 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 8 },
  emojiBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 22 },

  // Uploading
  uploadingBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: CARD, paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: BORDER },
  uploadingText: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 13 },

  // Input
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingHorizontal: 8, paddingTop: 8, backgroundColor: CARD, borderTopWidth: 1, borderTopColor: BORDER },
  inputAction: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  inputWrap: { flex: 1, backgroundColor: '#181A20', borderRadius: 22, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, minHeight: 40, maxHeight: 120, justifyContent: 'center' },
  textInput: { color: '#fff', fontFamily: 'Urbanist_400Regular', fontSize: 15, paddingVertical: Platform.OS === 'web' ? 8 : 6 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginBottom: 1 },

  // Attachment menu
  attachOverlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  attachMenu: { backgroundColor: CARD, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingTop: 12 },
  attachHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#444', alignSelf: 'center', marginBottom: 16 },
  attachTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18, marginBottom: 20 },
  attachGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  attachItem: { width: 80, alignItems: 'center', gap: 8 },
  attachIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  attachLabel: { color: '#ccc', fontFamily: 'Urbanist_500Medium', fontSize: 12 },
});
