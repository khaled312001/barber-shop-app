import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/constants/theme';
import { mockChats, mockCalls, type ChatItem, type CallItem } from '@/constants/data';

function ChatRow({ item }: { item: ChatItem }) {
  const theme = useTheme();
  return (
    <Pressable style={({ pressed }) => [styles.chatRow, { opacity: pressed ? 0.7 : 1 }]}>
      <Image source={{ uri: item.salonImage }} style={styles.chatAvatar} contentFit="cover" />
      <View style={styles.chatInfo}>
        <Text style={[styles.chatName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{item.salonName}</Text>
        <Text style={[styles.chatMessage, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={[styles.chatTime, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>{item.time}</Text>
        {item.unread > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
            <Text style={[styles.unreadText, { fontFamily: 'Urbanist_700Bold' }]}>{item.unread}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function CallRow({ item }: { item: CallItem }) {
  const theme = useTheme();
  const iconName = item.type === 'incoming' ? 'call-received' : item.type === 'outgoing' ? 'call-made' : 'call-missed';
  const iconColor = item.type === 'missed' ? theme.error : theme.success;

  return (
    <View style={styles.callRow}>
      <Image source={{ uri: item.salonImage }} style={styles.chatAvatar} contentFit="cover" />
      <View style={styles.chatInfo}>
        <Text style={[styles.chatName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{item.salonName}</Text>
        <View style={styles.callTypeRow}>
          <Ionicons name={item.type === 'incoming' ? 'call' : item.type === 'outgoing' ? 'call' : 'call'} size={14} color={iconColor} />
          <Text style={[styles.callType, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)} {item.duration ? `- ${item.duration}` : ''}
          </Text>
        </View>
      </View>
      <Text style={[styles.callDate, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>{item.date}</Text>
    </View>
  );
}

export default function InboxScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'chats' | 'calls'>('chats');
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = Platform.OS === 'web' ? webTopInset : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>Inbox</Text>
        <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Ionicons name="search" size={24} color={theme.text} />
        </Pressable>
      </View>

      <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
        {(['chats', 'calls'] as const).map(tab => (
          <Pressable
            key={tab}
            onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
            style={[styles.tab, activeTab === tab && { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? '#fff' : theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'chats' ? (
        <FlatList
          data={mockChats}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          scrollEnabled={mockChats.length > 0}
          renderItem={({ item }) => <ChatRow item={item} />}
        />
      ) : (
        <FlatList
          data={mockCalls}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          scrollEnabled={mockCalls.length > 0}
          renderItem={({ item }) => <CallRow item={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16 },
  title: { fontSize: 24 },
  tabBar: { flexDirection: 'row', marginHorizontal: 24, borderRadius: 16, padding: 4, marginBottom: 16 },
  tab: { flex: 1, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 14 },
  list: { paddingHorizontal: 24, paddingBottom: 100 },
  chatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  chatAvatar: { width: 56, height: 56, borderRadius: 28 },
  chatInfo: { flex: 1 },
  chatName: { fontSize: 16, marginBottom: 2 },
  chatMessage: { fontSize: 14 },
  chatMeta: { alignItems: 'flex-end', gap: 6 },
  chatTime: { fontSize: 12 },
  unreadBadge: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadText: { fontSize: 11, color: '#fff' },
  callRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  callTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  callType: { fontSize: 13 },
  callDate: { fontSize: 12 },
});
