import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { apiRequest } from '@/lib/query-client';
import { useLanguage } from '@/contexts/LanguageContext';
import { goBack } from '@/lib/navigation';

const PRIMARY = '#F4A460';
const BG = '#181A20';
const CARD = '#1F222A';
const BORDER = '#35383F';

export default function NewReelScreen() {
  const { salonId, bookingId } = useLocalSearchParams<{ salonId: string; bookingId?: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [rating, setRating] = useState(5);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  const pickVideo = () => {
    if (Platform.OS !== 'web') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      // Client-side size check (60MB)
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
          setVideoUrl(data.url);
          // Generate a thumbnail from the video using a temporary <video> element
          try {
            const v = document.createElement('video');
            v.src = data.url;
            v.muted = true;
            v.playsInline = true;
            v.crossOrigin = 'anonymous';
            v.onloadeddata = () => {
              const c = document.createElement('canvas');
              c.width = v.videoWidth || 480;
              c.height = v.videoHeight || 720;
              const ctx = c.getContext('2d');
              if (ctx) {
                ctx.drawImage(v, 0, 0, c.width, c.height);
                setThumbnailUrl(c.toDataURL('image/jpeg', 0.8));
              }
            };
          } catch { }
        }
      } catch { alert(t('upload_failed') || 'Upload failed'); }
      finally { setUploading(false); }
    };
    input.click();
  };

  const handlePost = async () => {
    if (!videoUrl) {
      alert(t('select_video_first') || 'Please select a video first');
      return;
    }
    setPosting(true);
    try {
      const r = await apiRequest('POST', '/api/reels', {
        salonId,
        bookingId: bookingId || undefined,
        videoUrl,
        thumbnailUrl: thumbnailUrl || undefined,
        caption,
        rating,
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({} as any));
        alert(err.message || t('reel_post_failed') || 'Failed to post reel');
        setPosting(false);
        return;
      }
      alert(t('reel_pending_review') || 'Your reel is pending review by the salon admin.');
      router.replace('/(tabs)/reels' as any);
    } catch (e: any) {
      alert(e?.message || 'Failed');
      setPosting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('post_reel') || 'Post a Reel'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>{t('video') || 'Video'}</Text>
        {videoUrl ? (
          <View style={styles.videoPreview}>
            {Platform.OS === 'web' && (
              <video src={videoUrl} controls style={{ width: '100%', height: '100%', borderRadius: 14, backgroundColor: '#000' } as any} />
            )}
            <Pressable onPress={() => { setVideoUrl(''); setThumbnailUrl(''); }} style={styles.changeBtn}>
              <Ionicons name="trash" size={14} color="#EF4444" />
              <Text style={styles.changeBtnText}>{t('remove') || 'Remove'}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={pickVideo} style={styles.uploadBox} disabled={uploading}>
            {uploading ? (
              <>
                <ActivityIndicator color={PRIMARY} />
                <Text style={styles.uploadText}>{t('uploading') || 'Uploading...'}</Text>
              </>
            ) : (
              <>
                <Ionicons name="videocam" size={36} color={PRIMARY} />
                <Text style={styles.uploadText}>{t('tap_select_video') || 'Tap to select a short video'}</Text>
                <Text style={styles.uploadHint}>{t('video_hint') || 'Up to 50MB · MP4/WebM'}</Text>
              </>
            )}
          </Pressable>
        )}

        <Text style={[styles.sectionLabel, { marginTop: 18 }]}>{t('rating') || 'Rating'}</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <Pressable key={n} onPress={() => setRating(n)}>
              <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={32} color="#FBBF24" />
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 18 }]}>{t('caption') || 'Caption'}</Text>
        <TextInput
          style={styles.captionInput}
          placeholder={t('caption_placeholder') || 'Tell others about your experience...'}
          placeholderTextColor="#666"
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={500}
        />
        <Text style={styles.charCount}>{caption.length}/500</Text>

        <View style={styles.notice}>
          <Ionicons name="information-circle" size={16} color={PRIMARY} />
          <Text style={styles.noticeText}>{t('reel_review_notice') || 'The salon admin will review your video before it goes live.'}</Text>
        </View>

        <Pressable onPress={handlePost} disabled={posting || !videoUrl} style={[styles.postBtn, (!videoUrl || posting) && { opacity: 0.5 }]}>
          <LinearGradient colors={[PRIMARY, '#E8924A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.postBtnGradient}>
            {posting ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="send" size={16} color="#fff" />
                <Text style={styles.postBtnText}>{t('submit_for_review') || 'Submit for review'}</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff10', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 17 },

  sectionLabel: { color: '#aaa', fontFamily: 'Urbanist_700Bold', fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },

  uploadBox: { height: 220, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: BORDER, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center', gap: 8 },
  uploadText: { color: '#fff', fontFamily: 'Urbanist_600SemiBold', fontSize: 14 },
  uploadHint: { color: '#888', fontFamily: 'Urbanist_400Regular', fontSize: 11 },

  videoPreview: { height: 320, backgroundColor: '#000', borderRadius: 16, overflow: 'hidden', position: 'relative' },
  changeBtn: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#181A20cc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  changeBtnText: { color: '#EF4444', fontFamily: 'Urbanist_700Bold', fontSize: 11 },

  starsRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', paddingVertical: 8 },

  captionInput: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 14, padding: 14, color: '#fff', fontFamily: 'Urbanist_500Medium', fontSize: 14, minHeight: 100, textAlignVertical: 'top' },
  charCount: { color: '#666', fontFamily: 'Urbanist_500Medium', fontSize: 11, marginTop: 4, textAlign: 'right' },

  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: `${PRIMARY}10`, borderWidth: 1, borderColor: `${PRIMARY}40`, padding: 12, borderRadius: 12, marginTop: 18 },
  noticeText: { color: '#ddd', fontFamily: 'Urbanist_500Medium', fontSize: 12, flex: 1 },

  postBtn: { marginTop: 22, borderRadius: 14, overflow: 'hidden' },
  postBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  postBtnText: { color: '#fff', fontFamily: 'Urbanist_700Bold', fontSize: 15 },
});
