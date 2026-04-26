import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, TextInput, Modal } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

type Status = 'pending' | 'approved' | 'rejected' | 'all';

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
  rejectionReason?: string;
  createdAt: string;
};

export default function SalonReelsScreen() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Status>('pending');
  const [rejectFor, setRejectFor] = useState<Reel | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({
    customerUserId: '',
    customerName: '',
    videoUrl: '',
    thumbnailUrl: '',
    caption: '',
    rating: 5,
  });
  const [uploading, setUploading] = useState(false);

  const { data: salonCustomers = [] } = useQuery<any[]>({
    queryKey: ['/api/salon/customers'],
    queryFn: async () => {
      const r = await apiRequest('GET', '/api/salon/customers');
      if (!r.ok) return [];
      return r.json();
    },
  });

  const postReel = useMutation({
    mutationFn: async () => {
      const r = await apiRequest('POST', '/api/salon/reels', postForm);
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/salon/reels'] });
      setShowPostForm(false);
      setPostForm({ customerUserId: '', customerName: '', videoUrl: '', thumbnailUrl: '', caption: '', rating: 5 });
      // Switch to "Approved" tab so the user sees the new reel (auto-approved)
      setTab('approved');
    },
  });

  const pickVideo = () => {
    if (Platform.OS !== 'web') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 60 * 1024 * 1024) {
        alert(t('video_too_large') || 'Video must be 60MB or less');
        return;
      }
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        const r = await fetch('/api/reels/upload', { method: 'POST', body: fd, credentials: 'include' });
        const data = await r.json();
        if (data.url) {
          setPostForm(p => ({ ...p, videoUrl: data.url }));
        }
      } catch { alert(t('upload_failed') || 'Upload failed'); }
      finally { setUploading(false); }
    };
    input.click();
  };

  const { data: reels = [], isLoading } = useQuery<Reel[]>({
    queryKey: ['/api/salon/reels', tab],
    queryFn: async () => {
      const url = tab === 'all' ? '/api/salon/reels' : `/api/salon/reels?status=${tab}`;
      const r = await apiRequest('GET', url);
      if (!r.ok) return [];
      return r.json();
    },
  });

  // Separate query for the full set used for tab counts (independent of current tab filter)
  const { data: allReels = [] } = useQuery<Reel[]>({
    queryKey: ['/api/salon/reels', 'all-for-counts'],
    queryFn: async () => {
      const r = await apiRequest('GET', '/api/salon/reels');
      if (!r.ok) return [];
      return r.json();
    },
  });

  const approve = useMutation({
    mutationFn: async (id: string) => {
      const r = await apiRequest('POST', `/api/salon/reels/${id}/approve`);
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/salon/reels'] }),
  });

  const reject = useMutation({
    mutationFn: async (args: { id: string; reason: string }) => {
      const r = await apiRequest('POST', `/api/salon/reels/${args.id}/reject`, { reason: args.reason });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/salon/reels'] });
      setRejectFor(null);
      setRejectReason('');
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const r = await apiRequest('DELETE', `/api/salon/reels/${id}`);
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/salon/reels'] }),
  });

  const counts = useMemo(() => {
    const all = Array.isArray(allReels) ? allReels : [];
    return {
      pending: all.filter(r => r.status === 'pending').length,
      approved: all.filter(r => r.status === 'approved').length,
      rejected: all.filter(r => r.status === 'rejected').length,
    };
  }, [allReels]);

  const tabs: { key: Status; label: string; color: string }[] = [
    { key: 'pending', label: t('pending') || 'Pending', color: '#FBBF24' },
    { key: 'approved', label: t('approved') || 'Approved', color: '#10B981' },
    { key: 'rejected', label: t('rejected') || 'Rejected', color: '#EF4444' },
    { key: 'all', label: t('all') || 'All', color: PRIMARY },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{t('reels') || 'Reels'}</Text>
          <Text style={styles.subtitle}>{t('reels_review_desc') || 'Review and approve customer videos'}</Text>
        </View>
        <Pressable
          onPress={() => setShowPostForm(true)}
          style={({ pressed }) => [styles.postBtnHeader, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="add" size={16} color="#181A20" />
          <Text style={styles.postBtnHeaderText}>{t('post_on_behalf') || 'Post on behalf'}</Text>
        </Pressable>
      </View>

      <View style={styles.tabsRow}>
        {tabs.map(tt => (
          <Pressable
            key={tt.key}
            onPress={() => setTab(tt.key)}
            style={[styles.tab, tab === tt.key && { backgroundColor: tt.color + '22', borderColor: tt.color }]}
          >
            <Text style={[styles.tabText, tab === tt.key && { color: tt.color }]}>
              {tt.label}
            </Text>
            {tt.key !== 'all' && (
              <View style={[styles.tabBadge, { backgroundColor: tab === tt.key ? tt.color : BORDER }]}>
                <Text style={styles.tabBadgeText}>{(counts as any)[tt.key]}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={PRIMARY} /></View>
      ) : reels.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="play-circle-outline" size={56} color={BORDER} />
          <Text style={styles.emptyText}>{t('no_reels_in_status') || 'No reels in this status'}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {reels.map(reel => (
            <View key={reel.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.userRow}>
                  {reel.userAvatar ? (
                    <Image source={{ uri: reel.userAvatar }} style={styles.userAvatar} contentFit="cover" />
                  ) : (
                    <View style={[styles.userAvatar, { backgroundColor: PRIMARY + '20', alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name="person" size={16} color={PRIMARY} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName} numberOfLines={1}>{reel.userName || 'Customer'}</Text>
                    <Text style={styles.timestamp}>
                      {new Date(reel.createdAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge,
                  reel.status === 'pending' && { backgroundColor: '#FBBF2418', borderColor: '#FBBF24' },
                  reel.status === 'approved' && { backgroundColor: '#10B98118', borderColor: '#10B981' },
                  reel.status === 'rejected' && { backgroundColor: '#EF444418', borderColor: '#EF4444' },
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    reel.status === 'pending' && { color: '#FBBF24' },
                    reel.status === 'approved' && { color: '#10B981' },
                    reel.status === 'rejected' && { color: '#EF4444' },
                  ]}>
                    {reel.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Video preview */}
              <View style={styles.videoBox}>
                {Platform.OS === 'web' ? (
                  <video
                    src={reel.videoUrl}
                    poster={reel.thumbnailUrl || undefined}
                    controls
                    style={{ width: '100%', height: '100%', backgroundColor: '#000' } as any}
                  />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
                    {reel.thumbnailUrl ? <Image source={{ uri: reel.thumbnailUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}
                    <Ionicons name="play-circle" size={56} color="#fff" style={{ position: 'absolute' }} />
                  </View>
                )}
              </View>

              {/* Rating + caption */}
              {reel.rating ? (
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <Ionicons key={n} name={n <= (reel.rating || 0) ? 'star' : 'star-outline'} size={14} color="#FBBF24" />
                  ))}
                  <Text style={styles.statText}>· {reel.likes || 0} {t('likes') || 'likes'} · {reel.views || 0} {t('views') || 'views'}</Text>
                </View>
              ) : null}
              {reel.caption ? <Text style={styles.caption}>{reel.caption}</Text> : null}
              {reel.status === 'rejected' && reel.rejectionReason ? (
                <View style={styles.rejectionBox}>
                  <Ionicons name="alert-circle" size={14} color="#EF4444" />
                  <Text style={styles.rejectionText}>{reel.rejectionReason}</Text>
                </View>
              ) : null}

              {/* Actions */}
              <View style={styles.actions}>
                {reel.status === 'pending' && (
                  <>
                    <Pressable
                      onPress={() => approve.mutate(reel.id)}
                      disabled={approve.isPending}
                      style={[styles.btn, styles.btnApprove]}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      <Text style={styles.btnApproveText}>{t('approve') || 'Approve'}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setRejectFor(reel)}
                      style={[styles.btn, styles.btnReject]}
                    >
                      <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
                      <Text style={styles.btnRejectText}>{t('reject') || 'Reject'}</Text>
                    </Pressable>
                  </>
                )}
                {reel.status !== 'pending' && (
                  <Pressable
                    onPress={() => {
                      const ok = Platform.OS === 'web' ? window.confirm(t('delete_reel_confirm') || 'Delete this reel?') : true;
                      if (ok) remove.mutate(reel.id);
                    }}
                    style={[styles.btn, styles.btnReject]}
                  >
                    <Ionicons name="trash" size={14} color="#EF4444" />
                    <Text style={styles.btnRejectText}>{t('delete') || 'Delete'}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Post-on-behalf modal */}
      <Modal visible={showPostForm} transparent animationType="slide" onRequestClose={() => setShowPostForm(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowPostForm(false)}>
          <Pressable onPress={() => {}} style={[styles.modalCard, { maxHeight: '90%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{t('post_reel_on_behalf') || 'Post reel on behalf of customer'}</Text>
              <Text style={styles.modalSubtitle}>{t('post_reel_on_behalf_desc') || 'Upload a video and assign it to a customer. Will be auto-approved.'}</Text>

              <Text style={styles.formLabel}>{t('select_customer') || 'Select customer'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {salonCustomers.slice(0, 30).map((c: any) => {
                  const cid = c.id || c.userId;
                  const cname = c.fullName || c.userName;
                  const cavatar = c.avatar || c.userAvatar;
                  const isActive = postForm.customerUserId === cid;
                  return (
                    <Pressable
                      key={cid}
                      onPress={() => setPostForm(p => ({ ...p, customerUserId: cid, customerName: cname }))}
                      style={[
                        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, marginRight: 6 },
                        isActive ? { backgroundColor: PRIMARY + '22', borderColor: PRIMARY } : { borderColor: BORDER, backgroundColor: BG },
                      ]}
                    >
                      {cavatar ? (
                        <Image source={{ uri: cavatar }} style={{ width: 22, height: 22, borderRadius: 11 }} contentFit="cover" />
                      ) : (
                        <Ionicons name="person" size={14} color="#888" />
                      )}
                      <Text style={{ color: isActive ? PRIMARY : '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 12 }}>
                        {cname}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={styles.formLabel}>{t('customer_name') || 'Customer name'}</Text>
              <TextInput
                value={postForm.customerName}
                onChangeText={v => setPostForm(p => ({ ...p, customerName: v }))}
                placeholder={t('enter_customer_name') || 'Enter customer name'}
                placeholderTextColor="#666"
                style={[styles.modalInput, { minHeight: 40 }]}
              />

              <Text style={[styles.formLabel, { marginTop: 12 }]}>{t('video') || 'Video'}</Text>
              {postForm.videoUrl ? (
                <View style={{ height: 200, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', position: 'relative' }}>
                  {Platform.OS === 'web' && (
                    <video src={postForm.videoUrl} controls style={{ width: '100%', height: '100%' } as any} />
                  )}
                  <Pressable
                    onPress={() => setPostForm(p => ({ ...p, videoUrl: '' }))}
                    style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#181A20cc', padding: 6, borderRadius: 8 }}
                  >
                    <Ionicons name="trash" size={14} color="#EF4444" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={pickVideo}
                  disabled={uploading}
                  style={{ height: 140, borderRadius: 12, borderWidth: 2, borderColor: BORDER, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  {uploading ? <ActivityIndicator color={PRIMARY} /> : (
                    <>
                      <Ionicons name="videocam" size={28} color={PRIMARY} />
                      <Text style={{ color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 13 }}>
                        {t('tap_select_video') || 'Tap to select video'}
                      </Text>
                    </>
                  )}
                </Pressable>
              )}

              <Text style={[styles.formLabel, { marginTop: 12 }]}>{t('caption') || 'Caption'}</Text>
              <TextInput
                value={postForm.caption}
                onChangeText={v => setPostForm(p => ({ ...p, caption: v }))}
                placeholder={t('caption_placeholder') || 'Optional caption...'}
                placeholderTextColor="#666"
                style={styles.modalInput}
                multiline
                maxLength={500}
              />

              <Text style={[styles.formLabel, { marginTop: 12 }]}>{t('rating') || 'Rating'}</Text>
              <View style={{ flexDirection: 'row', gap: 4, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <Pressable key={n} onPress={() => setPostForm(p => ({ ...p, rating: n }))}>
                    <Ionicons name={n <= postForm.rating ? 'star' : 'star-outline'} size={26} color="#FBBF24" />
                  </Pressable>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => setShowPostForm(false)}
                  style={[styles.btn, { flex: 1, backgroundColor: '#ffffff10' }]}
                >
                  <Text style={{ color: '#fff', fontFamily: 'Urbanist_700Bold' }}>{t('cancel') || 'Cancel'}</Text>
                </Pressable>
                <Pressable
                  onPress={() => postReel.mutate()}
                  disabled={!postForm.videoUrl || !postForm.customerName || postReel.isPending}
                  style={[styles.btn, { flex: 1, backgroundColor: (!postForm.videoUrl || !postForm.customerName) ? '#888' : PRIMARY }]}
                >
                  {postReel.isPending ? (
                    <ActivityIndicator size="small" color="#181A20" />
                  ) : (
                    <Text style={{ color: '#181A20', fontFamily: 'Urbanist_700Bold' }}>{t('post') || 'Post'}</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Reject modal */}
      <Modal visible={!!rejectFor} transparent animationType="slide" onRequestClose={() => setRejectFor(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setRejectFor(null)}>
          <Pressable onPress={() => {}} style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('reject_reel') || 'Reject Reel'}</Text>
            <Text style={styles.modalSubtitle}>{t('reject_reason_hint') || 'Why are you rejecting this reel? The customer will be notified.'}</Text>
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder={t('reason') || 'Reason'}
              placeholderTextColor="#666"
              style={styles.modalInput}
              multiline
              maxLength={300}
            />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <Pressable onPress={() => setRejectFor(null)} style={[styles.btn, { flex: 1, backgroundColor: '#ffffff10' }]}>
                <Text style={{ color: '#fff', fontFamily: 'Urbanist_700Bold' }}>{t('cancel') || 'Cancel'}</Text>
              </Pressable>
              <Pressable
                onPress={() => rejectFor && reject.mutate({ id: rejectFor.id, reason: rejectReason })}
                disabled={reject.isPending}
                style={[styles.btn, { flex: 1, backgroundColor: '#EF4444' }]}
              >
                <Text style={{ color: '#fff', fontFamily: 'Urbanist_700Bold' }}>{t('reject') || 'Reject'}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: 20, paddingBottom: 8 },
  title: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 24 },
  subtitle: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 13, marginTop: 2 },
  postBtnHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PRIMARY, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  postBtnHeaderText: { color: '#181A20', fontFamily: 'Urbanist_700Bold', fontSize: 12 },
  formLabel: { color: '#aaa', fontFamily: 'Urbanist_700Bold', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },

  tabsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 8, paddingTop: 6, flexWrap: 'wrap' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  tabText: { color: '#aaa', fontFamily: 'Urbanist_700Bold', fontSize: 12 },
  tabBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, minWidth: 22, alignItems: 'center' },
  tabBadgeText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 10 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  emptyText: { color: '#888', fontFamily: 'Urbanist_600SemiBold', fontSize: 14 },

  card: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 14, gap: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  userAvatar: { width: 36, height: 36, borderRadius: 18 },
  userName: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 14 },
  timestamp: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 11 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusBadgeText: { fontFamily: 'Urbanist_700Bold', fontSize: 10, letterSpacing: 0.5 },

  videoBox: { height: 280, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { color: '#888', fontFamily: 'Urbanist_500Medium', fontSize: 12, marginLeft: 4 },
  caption: { color: '#ddd', fontFamily: 'Urbanist_500Medium', fontSize: 13, lineHeight: 18 },
  rejectionBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EF444415', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#EF444444' },
  rejectionText: { color: '#FCA5A5', fontFamily: 'Urbanist_500Medium', fontSize: 12, flex: 1 },

  actions: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10 },
  btnApprove: { backgroundColor: '#10B981' },
  btnApproveText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 13 },
  btnReject: { backgroundColor: '#EF444415', borderWidth: 1, borderColor: '#EF444455' },
  btnRejectText: { color: '#EF4444', fontFamily: 'Urbanist_700Bold', fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  modalTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 18, marginBottom: 6 },
  modalSubtitle: { color: '#aaa', fontFamily: 'Urbanist_400Regular', fontSize: 13, marginBottom: 12 },
  modalInput: { backgroundColor: BG, borderWidth: 1, borderColor: BORDER, borderRadius: 12, padding: 12, color: '#fff', fontFamily: 'Urbanist_500Medium', minHeight: 80, textAlignVertical: 'top' },
});
