import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions, Platform, ActivityIndicator, Modal, TextInput, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/query-client';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type Reel = {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  salonId: string;
  salonName: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  rating?: number;
  views?: number;
  likes?: number;
  status: string;
  createdAt: string;
};

export default function ReelsFeedScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [muted, setMuted] = useState(true);
  const [commentsFor, setCommentsFor] = useState<Reel | null>(null);

  const { data: reels, isLoading, refetch } = useQuery<Reel[]>({
    queryKey: ['/api/reels'],
    queryFn: async () => {
      const r = await fetch('/api/reels', { credentials: 'include' });
      if (!r.ok) return [];
      return r.json();
    },
  });

  const list = useMemo(() => Array.isArray(reels) ? reels : [], [reels]);
  const reelHeight = SCREEN_H - (Platform.OS === 'web' ? 72 : 80);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  // Mark view on active reel
  useEffect(() => {
    const r = list[activeIndex];
    if (r) {
      fetch(`/api/reels/${r.id}/view`, { method: 'POST', credentials: 'include' }).catch(() => {});
    }
  }, [activeIndex, list]);

  const handleLike = async (reel: Reel) => {
    try {
      const r = await apiRequest('POST', `/api/reels/${reel.id}/like`);
      const data = await r.json();
      setLikedIds(prev => {
        const next = new Set(prev);
        if (data.liked) next.add(reel.id);
        else next.delete(reel.id);
        return next;
      });
    } catch { }
  };

  const goToSalon = (salonId: string) => router.push({ pathname: '/salon/[id]', params: { id: salonId } });

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: '#000' }]}>
        <ActivityIndicator size="large" color="#F4A460" />
      </View>
    );
  }

  if (list.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: '#000' }]}>
        <Ionicons name="play-circle-outline" size={64} color="#444" />
        <Text style={styles.emptyText}>{t('no_reels_yet') || 'No reels yet'}</Text>
        <Text style={styles.emptySubtext}>{t('be_first_reel') || 'Be the first to share your salon experience'}</Text>
        <Pressable
          onPress={() => router.push('/(tabs)/bookings' as any)}
          style={styles.ctaBtn}
        >
          <LinearGradient colors={['#F4A460', '#E8924A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
            <Ionicons name="videocam" size={16} color="#fff" />
            <Text style={styles.ctaText}>{t('post_reel_after_service') || 'Post after a completed service'}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={reelHeight}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
        renderItem={({ item, index }) => (
          <ReelItem
            reel={item}
            active={index === activeIndex}
            height={reelHeight}
            liked={likedIds.has(item.id)}
            onLike={() => handleLike(item)}
            onSalonPress={() => goToSalon(item.salonId)}
            muted={muted}
            onToggleMute={() => setMuted(m => !m)}
            t={t}
            onOpenComments={() => setCommentsFor(item)}
          />
        )}
      />

      {/* Top header overlay */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.topTitle}>{t('reels') || 'Reels'}</Text>
        <Pressable
          onPress={() => {
            // Open the post-a-reel page using the most recent completed booking's salon if available
            const reel = list[0];
            const salonId = reel?.salonId || '';
            router.push({ pathname: '/reels/new', params: { salonId } } as any);
          }}
          style={styles.topAction}
        >
          <Ionicons name="add-circle-outline" size={28} color="#fff" />
        </Pressable>
      </View>

      {/* Comments modal */}
      <CommentsModal reel={commentsFor} onClose={() => setCommentsFor(null)} t={t} />
    </View>
  );
}

function CommentsModal({ reel, onClose, t }: { reel: Reel | null; onClose: () => void; t: (k: string) => string }) {
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const { data: comments = [], refetch } = useQuery<any[]>({
    queryKey: ['/api/reels', reel?.id, 'comments'],
    queryFn: async () => {
      if (!reel) return [];
      const r = await apiRequest('GET', `/api/reels/${reel.id}/comments`);
      if (!r.ok) return [];
      return r.json();
    },
    enabled: !!reel,
  });
  const handlePost = async () => {
    if (!text.trim() || !reel) return;
    setPosting(true);
    try {
      await apiRequest('POST', `/api/reels/${reel.id}/comments`, { text: text.trim() });
      setText('');
      await refetch();
    } catch { } finally { setPosting(false); }
  };

  return (
    <Modal visible={!!reel} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.commentsOverlay} onPress={onClose}>
        <Pressable onPress={() => {}} style={styles.commentsCard}>
          <View style={styles.commentsHandle} />
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>
              {t('comments') || 'Comments'} ({comments.length})
            </Text>
            <Pressable onPress={onClose} style={styles.closeIcon}>
              <Ionicons name="close" size={20} color="#888" />
            </Pressable>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
            {comments.length === 0 ? (
              <View style={styles.commentEmpty}>
                <Ionicons name="chatbubble-ellipses-outline" size={36} color="#444" />
                <Text style={styles.commentEmptyText}>{t('no_comments') || 'No comments yet'}</Text>
                <Text style={styles.commentEmptySub}>{t('be_first_comment') || 'Be the first to comment'}</Text>
              </View>
            ) : (
              comments.map((c: any) => (
                <View key={c.id} style={styles.commentRow}>
                  {c.userAvatar ? (
                    <Image source={{ uri: c.userAvatar }} style={styles.commentAvatar} contentFit="cover" />
                  ) : (
                    <View style={[styles.commentAvatar, { backgroundColor: '#35383F', alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name="person" size={14} color="#888" />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.commentName}>{c.userName || 'User'}</Text>
                      <Text style={styles.commentTime}>{new Date(c.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          <View style={styles.commentInputBar}>
            <TextInput
              style={styles.commentInput}
              placeholder={t('add_comment') || 'Add a comment...'}
              placeholderTextColor="#666"
              value={text}
              onChangeText={setText}
              maxLength={500}
              onSubmitEditing={handlePost}
            />
            <Pressable onPress={handlePost} disabled={!text.trim() || posting} style={[styles.commentSend, (!text.trim() || posting) && { opacity: 0.4 }]}>
              {posting ? <ActivityIndicator size="small" color="#181A20" /> : <Ionicons name="send" size={16} color="#181A20" />}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ReelItem({
  reel, active, height, liked, onLike, onSalonPress, muted, onToggleMute, t, onOpenComments,
}: {
  reel: Reel;
  active: boolean;
  height: number;
  liked: boolean;
  onLike: () => void;
  onSalonPress: () => void;
  muted: boolean;
  onToggleMute: () => void;
  t: (k: string) => string;
  onOpenComments: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !videoRef.current) return;
    if (active) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [active]);

  return (
    <View style={[styles.reelCard, { height }]}>
      {Platform.OS === 'web' ? (
        <video
          ref={videoRef as any}
          src={reel.videoUrl}
          poster={reel.thumbnailUrl || undefined}
          muted={muted}
          loop
          playsInline
          preload="auto"
          autoPlay={active}
          style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#000' } as any}
          onClick={onToggleMute}
        />
      ) : (
        // Native fallback: show a thumbnail with a play badge — full video player can be added later
        <View style={{ width: '100%', height: '100%', backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
          {reel.thumbnailUrl ? (
            <Image source={{ uri: reel.thumbnailUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : null}
          <View style={styles.playBadge}>
            <Ionicons name="play" size={36} color="#fff" />
          </View>
        </View>
      )}

      {/* Bottom-left info */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.bottomGradient}
        pointerEvents="box-none"
      >
        <Pressable onPress={onSalonPress} style={styles.salonRow}>
          <View style={styles.salonAvatar}>
            <Ionicons name="cut" size={18} color="#181A20" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.salonName} numberOfLines={1}>{reel.salonName || 'Salon'}</Text>
            <Text style={styles.byUser} numberOfLines={1}>
              {t('by') || 'by'} {reel.userName || 'Customer'}
            </Text>
          </View>
          <View style={styles.visitBtn}>
            <Text style={styles.visitBtnText}>{t('visit') || 'Visit'}</Text>
            <Ionicons name="chevron-forward" size={14} color="#181A20" />
          </View>
        </Pressable>

        {!!reel.caption && (
          <Text style={styles.caption} numberOfLines={3}>{reel.caption}</Text>
        )}

        {reel.rating ? (
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <Ionicons key={n} name={n <= (reel.rating || 0) ? 'star' : 'star-outline'} size={14} color="#FBBF24" />
            ))}
          </View>
        ) : null}
      </LinearGradient>

      {/* Right actions */}
      <View style={styles.rightActions}>
        <Pressable onPress={onLike} style={styles.actionBtn}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={28} color={liked ? '#EF4444' : '#fff'} />
          <Text style={styles.actionCount}>{reel.likes || 0}</Text>
        </Pressable>
        <Pressable onPress={onOpenComments} style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={26} color="#fff" />
          <Text style={styles.actionCount}>{t('comments') || 'Comments'}</Text>
        </Pressable>
        <Pressable onPress={onSalonPress} style={styles.actionBtn}>
          <Ionicons name="storefront-outline" size={26} color="#fff" />
          <Text style={styles.actionCount}>{t('salon') || 'Salon'}</Text>
        </Pressable>
        <Pressable onPress={onToggleMute} style={styles.actionBtn}>
          <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={26} color="#fff" />
        </Pressable>
        <Pressable
          onPress={() => {
            if (Platform.OS === 'web' && (navigator as any).share) {
              (navigator as any).share({ title: reel.salonName, url: window.location.href }).catch(() => {});
            }
          }}
          style={styles.actionBtn}
        >
          <Ionicons name="share-social-outline" size={26} color="#fff" />
        </Pressable>
      </View>

      {/* View count */}
      <View style={styles.viewBadge}>
        <Ionicons name="eye-outline" size={12} color="#fff" />
        <Text style={styles.viewBadgeText}>{reel.views || 0}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18, marginTop: 12 },
  emptySubtext: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13, marginTop: 4, textAlign: 'center' },
  ctaBtn: { marginTop: 18 },
  ctaGradient: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14 },
  ctaText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 13 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  topTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 22, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
  topAction: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  reelCard: { width: SCREEN_W, position: 'relative', backgroundColor: '#000' },
  playBadge: { position: 'absolute', width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },

  bottomGradient: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingTop: 32, paddingBottom: 24,
    gap: 8,
  },
  salonRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  salonAvatar: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#F4A460',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff',
  },
  salonName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
  byUser: { color: '#ddd', fontFamily: 'Urbanist_500Medium', fontSize: 12 },
  visitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#fff',
  },
  visitBtnText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 12 },
  caption: { color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 13, lineHeight: 18 },
  ratingRow: { flexDirection: 'row', gap: 2 },

  rightActions: {
    position: 'absolute', right: 12, bottom: 110,
    alignItems: 'center', gap: 18,
  },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionCount: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 11, textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 4 },

  viewBadge: {
    position: 'absolute', top: 60, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  viewBadgeText: { color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 11 },

  commentsOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  commentsCard: { backgroundColor: '#1F222A', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '70%', padding: 16 },
  commentsHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#444', alignSelf: 'center', marginBottom: 12 },
  commentsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#35383F' },
  commentsTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 16 },
  closeIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#181A20' },
  commentEmpty: { alignItems: 'center', paddingVertical: 50, gap: 6 },
  commentEmptyText: { color: '#aaa', fontFamily: 'Urbanist_700Bold', fontSize: 14 },
  commentEmptySub: { color: '#666', fontFamily: 'Urbanist_400Regular', fontSize: 12 },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#35383F' },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden' },
  commentName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 12 },
  commentTime: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 10 },
  commentText: { color: '#ddd', fontFamily: 'Urbanist_500Medium', fontSize: 13, marginTop: 3 },
  commentInputBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#35383F', paddingBottom: 4 },
  commentInput: { flex: 1, backgroundColor: '#181A20', borderRadius: 18, paddingHorizontal: 14, height: 40, color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 13, borderWidth: 1, borderColor: '#35383F' },
  commentSend: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F4A460', alignItems: 'center', justifyContent: 'center' },
});
