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
  senderRole?: string;
  createdAt: string;
  isRead?: number;
  messageType?: string;
};

const EMOJIS = ['😀','😂','😍','🥰','😊','👍','❤️','🔥','💯','🎉','👋','🙏','💪','✨','💈','✂️','💇','💇‍♂️','📅','⏰','💰','🏠','📍','📸','🎵','👏','😎','🤩','😢','😡','🤔','👀','💬','📞','✅','❌'];

export default function ChatScreen() {
  const { id, name, image, role, salonId: salonIdParam, recipientUserId } = useLocalSearchParams<{
    id: string; name: string; image?: string; role?: string;
    salonId?: string; recipientUserId?: string;
  }>();
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
  const [showMenu, setShowMenu] = useState(false);
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactProfileId, setContactProfileId] = useState<string>('');
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
      let endpoint: string;
      if (role === 'salon_admin' || role === 'staff') {
        endpoint = `${getApiBase()}/${id}`;
      } else {
        // Customer: open thread for (salonId, recipientUserId)
        const targetSalon = salonIdParam || id;
        const params = recipientUserId ? `?recipientUserId=${encodeURIComponent(recipientUserId)}` : '';
        endpoint = `/api/messages/${targetSalon}${params}`;
      }
      const res = await apiRequest('GET', endpoint);
      const data = await res.json();
      if (Array.isArray(data)) setMsgs(data);
    } catch { } finally { setLoading(false); }
  }, [id, role, getApiBase, salonIdParam, recipientUserId]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages]);

  // Fetch the chat partner's phone for the call button
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (role === 'salon_admin' || role === 'staff') {
          // chat target is a customer (userId)
          const r = await apiRequest('GET', `/api/salon/users/${id}`);
          if (!r.ok) return;
          const u = await r.json();
          if (cancelled) return;
          setContactPhone(u?.phone || '');
          setContactProfileId(u?.id || '');
        } else {
          // chat target is a salon
          const r = await apiRequest('GET', `/api/salons/${id}`);
          if (!r.ok) return;
          const s = await r.json();
          if (cancelled) return;
          setContactPhone(s?.phone || s?.contactPhone || '');
          setContactProfileId(s?.id || '');
        }
      } catch { }
    })();
    return () => { cancelled = true; };
  }, [id, role]);

  const handleCall = () => {
    if (!contactPhone) {
      if (Platform.OS === 'web') {
        alert(t('no_phone_available') || 'No phone number available for this contact');
      }
      return;
    }
    const tel = `tel:${contactPhone.replace(/\s+/g, '')}`;
    if (Platform.OS === 'web') {
      window.location.href = tel;
    } else {
      Linking.openURL(tel).catch(() => {});
    }
  };

  const handleViewProfile = () => {
    setShowMenu(false);
    if (role === 'salon_admin' || role === 'staff') {
      // For admin/staff viewer, we don't have a public customer page; close menu.
      return;
    }
    if (contactProfileId) {
      // Customer viewer -> open the salon page
      if (Platform.OS === 'web') {
        window.location.href = `/salon/${contactProfileId}`;
      }
    }
  };

  const handleClearChat = async () => {
    setShowMenu(false);
    setMsgs([]);
  };

  const sendMessage = async (content: string, type: string = 'text') => {
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      if (role === 'salon_admin' || role === 'staff') {
        await apiRequest('POST', `${getApiBase()}/${id}`, { content: content.trim(), messageType: type });
      } else {
        const targetSalon = salonIdParam || id;
        await apiRequest('POST', '/api/messages', {
          salonId: targetSalon, salonName: name || 'Salon', salonImage: image || '',
          content: content.trim(), messageType: type,
          recipientUserId: recipientUserId || undefined,
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

  // The role of the OTHER person in the conversation (the one I'm chatting with)
  const otherRoleLabel = (() => {
    // role param represents the viewer's role context, not the other party's.
    // - If viewer is salon_admin or staff (chatting from admin/staff side) -> other party is the customer
    // - If viewer is a customer (default), the other side is identified by the chat target.
    //   For customer chats with a salon, the salon staff/admin sends back. We use senderName +
    //   the explicit role on incoming messages where present, falling back to "Salon".
    if (role === 'salon_admin' || role === 'staff') return t('customer') || 'Customer';
    return t('salon_team') || 'Salon Team';
  })();

  // Role label for an INCOMING message (one I didn't send)
  const senderRoleLabel = (msg: Message): string => {
    // Server may stamp messageType-like role in senderName; we derive from context:
    if (role === 'salon_admin' || role === 'staff') {
      // Viewer is admin/staff side -> incoming msgs are from the customer
      return t('customer') || 'Customer';
    }
    // Viewer is a customer -> incoming is from the salon side.
    // Prefer the salon-side role passed via the chat URL when available.
    const m = (msg as any);
    const explicit = (m.senderRole || '').toString().toLowerCase();
    if (explicit === 'staff') return t('staff') || 'Staff';
    if (explicit === 'salon_admin' || explicit === 'salon-admin' || explicit === 'salonadmin') return t('salon_admin') || 'Salon Admin';
    if (explicit === 'salon') return t('salon_team') || 'Salon Team';
    // Fallback: rely on the chat thread role param
    if (role === 'staff') return t('staff') || 'Staff';
    if (role === 'salon_admin') return t('salon_admin') || 'Salon Admin';
    return t('salon_team') || 'Salon Team';
  };

  const headerSubtitleRole = (() => {
    if (role === 'staff') return t('staff') || 'Staff';
    if (role === 'salon_admin') return t('salon_admin') || 'Salon Admin';
    if (role === 'customer' || (user && user.role !== 'salon_admin' && user.role !== 'staff' && (role === 'salon_admin' || role === 'staff'))) return t('customer') || 'Customer';
    return '';
  })();

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
          <View style={styles.mediaImage}>
            <Image
              source={{ uri: mediaData.url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
              onError={() => console.warn('Image failed to load:', mediaData.url)}
            />
          </View>
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
            {!mine ? (
              <View style={styles.senderHeader}>
                {item.senderName ? <Text style={styles.senderLabel}>{item.senderName}</Text> : null}
                {(() => {
                  const rl = senderRoleLabel(item);
                  const isStaff = rl === (t('staff') || 'Staff');
                  const isAdmin = rl === (t('salon_admin') || 'Salon Admin');
                  return (
                    <View style={[
                      styles.senderRoleChip,
                      isStaff ? styles.roleBadgeStaff : isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeCustomer,
                    ]}>
                      <Ionicons
                        name={isStaff ? 'cut' : isAdmin ? 'storefront' : 'person'}
                        size={9}
                        color={isStaff ? '#10B981' : isAdmin ? PRIMARY : '#3B82F6'}
                      />
                      <Text style={[styles.senderRoleChipText, { color: isStaff ? '#10B981' : isAdmin ? PRIMARY : '#3B82F6' }]}>{rl}</Text>
                    </View>
                  );
                })()}
              </View>
            ) : null}
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Text style={styles.headerName} numberOfLines={1}>{name || 'Chat'}</Text>
            {headerSubtitleRole ? (
              <View style={[styles.roleBadge, role === 'staff' ? styles.roleBadgeStaff : role === 'salon_admin' ? styles.roleBadgeAdmin : styles.roleBadgeCustomer]}>
                <Ionicons
                  name={role === 'staff' ? 'cut' : role === 'salon_admin' ? 'storefront' : 'person'}
                  size={10}
                  color={role === 'staff' ? '#10B981' : role === 'salon_admin' ? PRIMARY : '#3B82F6'}
                />
                <Text style={[styles.roleBadgeText, role === 'staff' ? { color: '#10B981' } : role === 'salon_admin' ? { color: PRIMARY } : { color: '#3B82F6' }]}>{headerSubtitleRole}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.headerStatus}>{t('online') || 'Online'}</Text>
        </View>
        <Pressable
          onPress={handleCall}
          style={({ pressed }) => [styles.headerAction, pressed && { opacity: 0.6 }]}
          {...({ title: contactPhone ? `Call ${contactPhone}` : 'Call' } as any)}
        >
          <Ionicons name="call-outline" size={20} color={contactPhone ? PRIMARY : '#666'} />
        </Pressable>
        <Pressable
          onPress={() => setShowMenu(true)}
          style={({ pressed }) => [styles.headerAction, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#888" />
        </Pressable>
      </View>

      {/* Top-bar menu */}
      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setShowMenu(false)}>
          <View style={styles.menuPopover}>
            <Pressable onPress={() => { setShowMenu(false); handleCall(); }} style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: '#ffffff08' }]}>
              <Ionicons name="call-outline" size={18} color={PRIMARY} />
              <Text style={styles.menuItemText}>{t('call') || 'Call'}{contactPhone ? `  •  ${contactPhone}` : ''}</Text>
            </Pressable>
            {(role !== 'salon_admin' && role !== 'staff') && (
              <Pressable onPress={handleViewProfile} style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: '#ffffff08' }]}>
                <Ionicons name="person-outline" size={18} color="#fff" />
                <Text style={styles.menuItemText}>{t('view_profile') || 'View profile'}</Text>
              </Pressable>
            )}
            <Pressable onPress={() => { setShowMenu(false); fetchMessages(); }} style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: '#ffffff08' }]}>
              <Ionicons name="refresh-outline" size={18} color="#fff" />
              <Text style={styles.menuItemText}>{t('refresh') || 'Refresh'}</Text>
            </Pressable>
            <Pressable onPress={handleClearChat} style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: '#ffffff08' }]}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>{t('clear_chat') || 'Clear chat'}</Text>
            </Pressable>
            <Pressable onPress={() => setShowMenu(false)} style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: '#ffffff08' }]}>
              <Ionicons name="close-outline" size={18} color="#888" />
              <Text style={styles.menuItemText}>{t('close') || 'Close'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

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
  senderHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, paddingHorizontal: 10, flexWrap: 'wrap' },
  senderLabel: { color: PRIMARY, fontFamily: 'Urbanist_600SemiBold', fontSize: 11 },
  senderRoleChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  senderRoleChipText: { fontFamily: 'Urbanist_700Bold', fontSize: 9, letterSpacing: 0.3 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  roleBadgeText: { fontFamily: 'Urbanist_700Bold', fontSize: 9, letterSpacing: 0.3 },
  roleBadgeStaff: { backgroundColor: '#10B98115', borderColor: '#10B98155' },
  roleBadgeAdmin: { backgroundColor: `${PRIMARY}15`, borderColor: `${PRIMARY}55` },
  roleBadgeCustomer: { backgroundColor: '#3B82F615', borderColor: '#3B82F655' },
  msgText: { color: '#ddd', fontFamily: 'Urbanist_400Regular', fontSize: 15, lineHeight: 21 },
  msgTextMine: { color: '#181A20' },
  msgMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, paddingHorizontal: 6 },
  timeText: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 10 },
  timeTextMine: { color: '#181A20aa' },
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyText: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 16 },
  emptySubtext: { color: '#555', fontFamily: 'Urbanist_400Regular', fontSize: 13 },

  // Media
  mediaImage: { width: SCREEN_W * 0.6, maxWidth: 280, height: 200, borderRadius: 14, backgroundColor: '#0008', overflow: 'hidden' },
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

  // Top-bar menu
  menuOverlay: { flex: 1, backgroundColor: '#00000055', alignItems: 'flex-end', paddingTop: 70, paddingHorizontal: 12 },
  menuPopover: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 14, paddingVertical: 6, minWidth: 220, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  menuItemText: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 14 },

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
