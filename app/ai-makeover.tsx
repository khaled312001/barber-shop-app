import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/query-client';

const { width } = Dimensions.get('window');

const SKIN_TONES = [
  { id: 'fair', color: '#FDEBD0', label: 'fair_skin' },
  { id: 'light', color: '#F5CBA7', label: 'light_skin' },
  { id: 'medium', color: '#D4A574', label: 'medium_skin' },
  { id: 'olive', color: '#C4A882', label: 'olive_skin' },
  { id: 'brown', color: '#8B6914', label: 'brown_skin' },
  { id: 'dark', color: '#5C3A1E', label: 'dark_skin' },
];

const HAIR_TYPES = [
  { id: 'straight', icon: 'arrow-down', label: 'hair_straight', desc: 'hair_straight_desc' },
  { id: 'wavy', icon: 'water', label: 'hair_wavy', desc: 'hair_wavy_desc' },
  { id: 'curly', icon: 'sync', label: 'hair_curly', desc: 'hair_curly_desc' },
  { id: 'coily', icon: 'radio-button-on', label: 'hair_coily', desc: 'hair_coily_desc' },
];

const FACE_SHAPES = [
  { id: 'oval', icon: 'ellipse-outline', label: 'face_oval' },
  { id: 'round', icon: 'ellipse', label: 'face_round' },
  { id: 'square', icon: 'square-outline', label: 'face_square' },
  { id: 'heart', icon: 'heart-outline', label: 'face_heart' },
  { id: 'oblong', icon: 'tablet-portrait-outline', label: 'face_oblong' },
];

type Step = 'skin' | 'hair' | 'face' | 'photo' | 'loading' | 'results';

interface StyleRec {
  name: string; description: string; difficulty: string; maintenanceLevel: string; bestFor: string;
}
interface ColorRec {
  name: string; hex: string; reason: string;
}
interface AIResult {
  source: string;
  analysis: { skinToneAnalysis: string; hairTypeAnalysis: string; faceShapeAnalysis: string; };
  recommendedStyles: StyleRec[];
  recommendedColors: ColorRec[];
  avoidStyles: string[];
  avoidColors: string[];
  stylingTips: string[];
  productRecommendations: string[];
}

export default function AIMakeoverScreen() {
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : Math.max(insets.top, 24);

  const [step, setStep] = useState<Step>('skin');
  const [skinTone, setSkinTone] = useState<string | null>(null);
  const [hairType, setHairType] = useState<string | null>(null);
  const [faceShape, setFaceShape] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'styles' | 'colors' | 'tips'>('styles');
  const [previewColorHex, setPreviewColorHex] = useState<string | null>(null);

  const pickImage = async (fromCamera: boolean) => {
    try {
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('permission_required'), t('camera_permission_msg'));
          return;
        }
      }
      const res = fromCamera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [3, 4], quality: 0.6 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [3, 4], quality: 0.6 });

      if (!res.canceled && res.assets[0]) {
        setPhoto(res.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const getRecommendations = async () => {
    if (!skinTone || !hairType) return;
    setStep('loading');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      let photoBase64: string | undefined;
      if (photo && Platform.OS !== 'web') {
        try {
          const FileSystem = await import('expo-file-system');
          const base64 = await FileSystem.readAsStringAsync(photo, { encoding: FileSystem.EncodingType.Base64 });
          photoBase64 = base64;
        } catch { /* photo is optional */ }
      }

      const res = await apiRequest('POST', '/api/ai/style-advisor', {
        skinTone,
        hairType,
        faceShape: faceShape || 'oval',
        gender: 'male',
        photoBase64,
      });
      const data = await res.json();
      setResult(data);
      setStep('results');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setStep('photo');
      Alert.alert('Error', err.message || 'Failed to get recommendations');
    }
  };

  const resetAll = () => {
    setStep('skin');
    setSkinTone(null);
    setHairType(null);
    setFaceShape(null);
    setPhoto(null);
    setResult(null);
    setActiveResultTab('styles');
  };

  const goNext = () => {
    if (step === 'skin' && skinTone) setStep('hair');
    else if (step === 'hair' && hairType) setStep('face');
    else if (step === 'face') setStep('photo');
    else if (step === 'photo') getRecommendations();
  };

  const goBack = () => {
    if (step === 'hair') setStep('skin');
    else if (step === 'face') setStep('hair');
    else if (step === 'photo') setStep('face');
    else if (step === 'results') setStep('photo');
    else router.back();
  };

  const canProceed =
    (step === 'skin' && skinTone) ||
    (step === 'hair' && hairType) ||
    (step === 'face') ||
    (step === 'photo');

  const stepIndex = ['skin', 'hair', 'face', 'photo'].indexOf(step);
  const totalSteps = 4;

  // ── LOADING SCREEN ──
  if (step === 'loading') {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.loadingContainer}>
          <View style={[styles.loadingIconWrap, { backgroundColor: theme.primary + '20' }]}>
            <MaterialCommunityIcons name="auto-fix" size={48} color={theme.primary} />
          </View>
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 24 }} />
          <Text style={[styles.loadingTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
            {t('ai_analyzing')}
          </Text>
          <Text style={[styles.loadingSub, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
            {t('ai_analyzing_desc')}
          </Text>
        </View>
      </View>
    );
  }

  // ── RESULTS SCREEN ──
  if (step === 'results' && result) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Pressable onPress={resetAll} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <Ionicons name="refresh" size={24} color={theme.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
            {t('your_style_guide')}
          </Text>
          <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <Ionicons name="close" size={24} color={theme.text} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* User Photo with Color Preview */}
          {photo && (
            <View style={styles.resultPhotoSection}>
              <View style={styles.resultPhotoRow}>
                {/* Original */}
                <View style={styles.resultPhotoCol}>
                  <Text style={[styles.resultPhotoLabel, { color: theme.textSecondary, fontFamily: 'Urbanist_600SemiBold' }]}>
                    {t('original')}
                  </Text>
                  <Image source={{ uri: photo }} style={styles.resultPhotoImg} contentFit="cover" />
                </View>
                {/* AI Preview with color tint */}
                <View style={styles.resultPhotoCol}>
                  <Text style={[styles.resultPhotoLabel, { color: theme.primary, fontFamily: 'Urbanist_600SemiBold' }]}>
                    {t('ai_preview')}
                  </Text>
                  <View style={styles.resultPhotoPreviewWrap}>
                    <Image source={{ uri: photo }} style={styles.resultPhotoImg} contentFit="cover" />
                    {previewColorHex && (
                      <LinearGradient
                        colors={[previewColorHex + '60', previewColorHex + '30', 'transparent']}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 0.65 }}
                        style={styles.colorOverlay}
                      />
                    )}
                    <View style={styles.aiPreviewBadge}>
                      <MaterialCommunityIcons name="auto-fix" size={12} color="#fff" />
                      <Text style={[styles.aiPreviewBadgeText, { fontFamily: 'Urbanist_600SemiBold' }]}>AI</Text>
                    </View>
                  </View>
                </View>
              </View>
              {/* Color swatches for quick preview */}
              {result && result.recommendedColors.length > 0 && (
                <View style={styles.previewColorRow}>
                  <Text style={[styles.previewColorLabel, { color: theme.textTertiary, fontFamily: 'Urbanist_500Medium' }]}>
                    {t('tap_color_preview')}
                  </Text>
                  <View style={styles.previewSwatches}>
                    {result.recommendedColors.map((c, i) => (
                      <Pressable
                        key={i}
                        onPress={() => { setPreviewColorHex(previewColorHex === c.hex ? null : c.hex); Haptics.selectionAsync(); }}
                        style={[styles.previewSwatch, {
                          backgroundColor: c.hex,
                          borderWidth: previewColorHex === c.hex ? 3 : 0,
                          borderColor: theme.primary,
                        }]}
                      >
                        {previewColorHex === c.hex && (
                          <Ionicons name="checkmark" size={14} color={isLightColor(c.hex) ? '#333' : '#fff'} />
                        )}
                      </Pressable>
                    ))}
                    {previewColorHex && (
                      <Pressable onPress={() => setPreviewColorHex(null)} style={[styles.previewSwatch, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}>
                        <Ionicons name="close" size={14} color={theme.textSecondary} />
                      </Pressable>
                    )}
                  </View>
                </View>
              )}
              {/* Profile chips */}
              <View style={styles.resultProfileChips}>
                <View style={[styles.resultChip, { backgroundColor: theme.primary + '20' }]}>
                  <View style={[styles.miniSkinDot, { backgroundColor: SKIN_TONES.find(s => s.id === skinTone)?.color }]} />
                  <Text style={[styles.resultChipText, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>
                    {t(SKIN_TONES.find(s => s.id === skinTone)?.label || '')}
                  </Text>
                </View>
                <View style={[styles.resultChip, { backgroundColor: theme.primary + '20' }]}>
                  <MaterialCommunityIcons name="hair-dryer" size={14} color={theme.primary} />
                  <Text style={[styles.resultChipText, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>
                    {t(HAIR_TYPES.find(h => h.id === hairType)?.label || '')}
                  </Text>
                </View>
                {faceShape && (
                  <View style={[styles.resultChip, { backgroundColor: theme.primary + '20' }]}>
                    <Ionicons name="person-circle" size={14} color={theme.primary} />
                    <Text style={[styles.resultChipText, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>
                      {t(FACE_SHAPES.find(f => f.id === faceShape)?.label || '')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Analysis Summary */}
          <LinearGradient colors={[theme.primary + '20', theme.primary + '05']} style={styles.analysisBanner}>
            <View style={[styles.aiBadge, { backgroundColor: theme.primary }]}>
              <MaterialCommunityIcons name="auto-fix" size={16} color="#fff" />
              <Text style={[styles.aiBadgeText, { fontFamily: 'Urbanist_700Bold' }]}>
                {result.source === 'ai' ? t('ai_powered') : t('smart_engine')}
              </Text>
            </View>
            <Text style={[styles.analysisTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
              {t('personal_analysis')}
            </Text>
            <Text style={[styles.analysisText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
              {result.analysis.skinToneAnalysis}
            </Text>
            <Text style={[styles.analysisText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
              {result.analysis.hairTypeAnalysis}
            </Text>
            <Text style={[styles.analysisText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
              {result.analysis.faceShapeAnalysis}
            </Text>
          </LinearGradient>

          {/* Tab Selector */}
          <View style={styles.tabRow}>
            {(['styles', 'colors', 'tips'] as const).map(tab => (
              <Pressable
                key={tab}
                onPress={() => { setActiveResultTab(tab); Haptics.selectionAsync(); }}
                style={[styles.tab, activeResultTab === tab && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}
              >
                <Ionicons
                  name={tab === 'styles' ? 'cut' : tab === 'colors' ? 'color-palette' : 'bulb'}
                  size={18}
                  color={activeResultTab === tab ? theme.primary : theme.textTertiary}
                />
                <Text style={[styles.tabText, {
                  color: activeResultTab === tab ? theme.primary : theme.textTertiary,
                  fontFamily: activeResultTab === tab ? 'Urbanist_700Bold' : 'Urbanist_500Medium',
                }]}>
                  {t(tab === 'styles' ? 'recommended_styles' : tab === 'colors' ? 'recommended_colors' : 'styling_tips')}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Styles Tab */}
          {activeResultTab === 'styles' && (
            <View style={styles.resultSection}>
              <Text style={[styles.resultSectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                {t('best_styles_for_you')}
              </Text>
              {result.recommendedStyles.map((style, i) => (
                <View key={i} style={[styles.styleCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.styleCardHeader}>
                    <View style={[styles.styleNum, { backgroundColor: theme.primary }]}>
                      <Text style={[styles.styleNumText, { fontFamily: 'Urbanist_700Bold' }]}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.styleCardName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{style.name}</Text>
                      <Text style={[styles.styleCardDesc, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{style.description}</Text>
                    </View>
                  </View>
                  <View style={styles.styleTags}>
                    <View style={[styles.tag, { backgroundColor: style.difficulty === 'easy' ? '#4CAF5015' : style.difficulty === 'medium' ? '#FF980015' : '#F4433615' }]}>
                      <Text style={[styles.tagText, {
                        color: style.difficulty === 'easy' ? '#4CAF50' : style.difficulty === 'medium' ? '#FF9800' : '#F44336',
                        fontFamily: 'Urbanist_600SemiBold',
                      }]}>
                        {t(`difficulty_${style.difficulty}`)}
                      </Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: theme.primary + '10' }]}>
                      <Ionicons name="time-outline" size={12} color={theme.primary} />
                      <Text style={[styles.tagText, { color: theme.primary, fontFamily: 'Urbanist_600SemiBold' }]}>
                        {t(`maintenance_${style.maintenanceLevel}`)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.bestForText, { color: theme.textTertiary, fontFamily: 'Urbanist_400Regular' }]}>
                    {style.bestFor}
                  </Text>
                </View>
              ))}

              {/* Avoid Section */}
              <Text style={[styles.avoidTitle, { color: theme.error || '#F44336', fontFamily: 'Urbanist_700Bold' }]}>
                {t('styles_to_avoid')}
              </Text>
              {result.avoidStyles.map((avoid, i) => (
                <View key={i} style={[styles.avoidRow, { borderColor: (theme.error || '#F44336') + '20' }]}>
                  <Ionicons name="close-circle" size={18} color={theme.error || '#F44336'} />
                  <Text style={[styles.avoidText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{avoid}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Colors Tab */}
          {activeResultTab === 'colors' && (
            <View style={styles.resultSection}>
              <Text style={[styles.resultSectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                {t('best_colors_for_you')}
              </Text>
              {result.recommendedColors.map((color, i) => (
                <View key={i} style={[styles.colorCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={[styles.colorSwatch, { backgroundColor: color.hex }]}>
                    <Ionicons name="checkmark" size={20} color={isLightColor(color.hex) ? '#333' : '#fff'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.colorCardName, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{color.name}</Text>
                    <Text style={[styles.colorCardReason, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{color.reason}</Text>
                  </View>
                </View>
              ))}

              <Text style={[styles.avoidTitle, { color: theme.error || '#F44336', fontFamily: 'Urbanist_700Bold' }]}>
                {t('colors_to_avoid')}
              </Text>
              {result.avoidColors.map((avoid, i) => (
                <View key={i} style={[styles.avoidRow, { borderColor: (theme.error || '#F44336') + '20' }]}>
                  <Ionicons name="close-circle" size={18} color={theme.error || '#F44336'} />
                  <Text style={[styles.avoidText, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>{avoid}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Tips Tab */}
          {activeResultTab === 'tips' && (
            <View style={styles.resultSection}>
              <Text style={[styles.resultSectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                {t('your_styling_tips')}
              </Text>
              {result.stylingTips.map((tip, i) => (
                <View key={i} style={[styles.tipCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={[styles.tipIcon, { backgroundColor: theme.primary + '15' }]}>
                    <Ionicons name="bulb" size={20} color={theme.primary} />
                  </View>
                  <Text style={[styles.tipCardText, { color: theme.text, fontFamily: 'Urbanist_400Regular' }]}>{tip}</Text>
                </View>
              ))}

              <Text style={[styles.resultSectionTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold', marginTop: 24 }]}>
                {t('recommended_products')}
              </Text>
              {result.productRecommendations.map((prod, i) => (
                <View key={i} style={[styles.productRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={[styles.productIcon, { backgroundColor: theme.primary + '15' }]}>
                    <Ionicons name="flask" size={18} color={theme.primary} />
                  </View>
                  <Text style={[styles.productText, { color: theme.text, fontFamily: 'Urbanist_500Medium' }]}>{prod}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Book Button */}
          <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
            <Pressable
              onPress={() => router.push('/(tabs)/explore')}
              style={({ pressed }) => [styles.bookResultBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}
            >
              <Ionicons name="calendar" size={22} color="#fff" />
              <Text style={[styles.bookResultText, { fontFamily: 'Urbanist_700Bold' }]}>{t('book_this_look')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── STEP SCREENS ──
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={goBack} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={26} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
          {t('ai_style_advisor')}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Progress Bar */}
      {stepIndex >= 0 && (
        <View style={styles.progressRow}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View key={i} style={[styles.progressDot, {
              backgroundColor: i <= stepIndex ? theme.primary : theme.border,
              flex: 1,
            }]} />
          ))}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* ── STEP 1: Skin Tone ── */}
        {step === 'skin' && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeaderArea}>
              <View style={[styles.stepIconCircle, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="sunny" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.stepTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                {t('select_skin_tone')}
              </Text>
              <Text style={[styles.stepDesc, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
                {t('skin_tone_desc')}
              </Text>
            </View>

            <View style={styles.skinGrid}>
              {SKIN_TONES.map(tone => (
                <Pressable
                  key={tone.id}
                  onPress={() => { setSkinTone(tone.id); Haptics.selectionAsync(); }}
                  style={({ pressed }) => [styles.skinItem, {
                    borderColor: skinTone === tone.id ? theme.primary : theme.border,
                    borderWidth: skinTone === tone.id ? 2.5 : 1,
                    backgroundColor: theme.card,
                    opacity: pressed ? 0.8 : 1,
                  }]}
                >
                  <View style={[styles.skinCircle, { backgroundColor: tone.color }]}>
                    {skinTone === tone.id && <Ionicons name="checkmark-circle" size={24} color={theme.primary} />}
                  </View>
                  <Text style={[styles.skinLabel, {
                    color: skinTone === tone.id ? theme.primary : theme.text,
                    fontFamily: skinTone === tone.id ? 'Urbanist_700Bold' : 'Urbanist_500Medium',
                  }]}>{t(tone.label)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ── STEP 2: Hair Type ── */}
        {step === 'hair' && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeaderArea}>
              <View style={[styles.stepIconCircle, { backgroundColor: theme.primary + '15' }]}>
                <MaterialCommunityIcons name="hair-dryer" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.stepTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                {t('select_hair_type')}
              </Text>
              <Text style={[styles.stepDesc, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
                {t('hair_type_desc')}
              </Text>
            </View>

            <View style={styles.hairGrid}>
              {HAIR_TYPES.map(ht => (
                <Pressable
                  key={ht.id}
                  onPress={() => { setHairType(ht.id); Haptics.selectionAsync(); }}
                  style={({ pressed }) => [styles.hairItem, {
                    borderColor: hairType === ht.id ? theme.primary : theme.border,
                    borderWidth: hairType === ht.id ? 2.5 : 1,
                    backgroundColor: hairType === ht.id ? theme.primary + '10' : theme.card,
                    opacity: pressed ? 0.8 : 1,
                  }]}
                >
                  <View style={[styles.hairIcon, { backgroundColor: hairType === ht.id ? theme.primary : theme.primary + '15' }]}>
                    <Ionicons name={ht.icon as any} size={24} color={hairType === ht.id ? '#fff' : theme.primary} />
                  </View>
                  <Text style={[styles.hairLabel, {
                    color: hairType === ht.id ? theme.primary : theme.text,
                    fontFamily: 'Urbanist_700Bold',
                  }]}>{t(ht.label)}</Text>
                  <Text style={[styles.hairDesc, {
                    color: theme.textSecondary,
                    fontFamily: 'Urbanist_400Regular',
                  }]}>{t(ht.desc)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ── STEP 3: Face Shape ── */}
        {step === 'face' && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeaderArea}>
              <View style={[styles.stepIconCircle, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="person-circle" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.stepTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                {t('select_face_shape')}
              </Text>
              <Text style={[styles.stepDesc, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
                {t('face_shape_desc')}
              </Text>
            </View>

            <View style={styles.faceGrid}>
              {FACE_SHAPES.map(fs => (
                <Pressable
                  key={fs.id}
                  onPress={() => { setFaceShape(faceShape === fs.id ? null : fs.id); Haptics.selectionAsync(); }}
                  style={({ pressed }) => [styles.faceItem, {
                    borderColor: faceShape === fs.id ? theme.primary : theme.border,
                    borderWidth: faceShape === fs.id ? 2.5 : 1,
                    backgroundColor: faceShape === fs.id ? theme.primary + '10' : theme.card,
                    opacity: pressed ? 0.8 : 1,
                  }]}
                >
                  <Ionicons name={fs.icon as any} size={32} color={faceShape === fs.id ? theme.primary : theme.textSecondary} />
                  <Text style={[styles.faceLabel, {
                    color: faceShape === fs.id ? theme.primary : theme.text,
                    fontFamily: faceShape === fs.id ? 'Urbanist_700Bold' : 'Urbanist_500Medium',
                  }]}>{t(fs.label)}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable onPress={goNext} style={{ paddingHorizontal: 24, marginTop: 8 }}>
              <Text style={[styles.skipText, { color: theme.textTertiary, fontFamily: 'Urbanist_500Medium' }]}>
                {t('skip_optional')}
              </Text>
            </Pressable>
          </View>
        )}

        {/* ── STEP 4: Photo (Optional) ── */}
        {step === 'photo' && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeaderArea}>
              <View style={[styles.stepIconCircle, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="camera" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.stepTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>
                {t('add_photo_optional')}
              </Text>
              <Text style={[styles.stepDesc, { color: theme.textSecondary, fontFamily: 'Urbanist_400Regular' }]}>
                {t('photo_desc')}
              </Text>
            </View>

            {photo ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photo }} style={styles.photoImage} contentFit="cover" />
                <Pressable
                  onPress={() => setPhoto(null)}
                  style={[styles.removePhotoBtn, { backgroundColor: theme.error || '#F44336' }]}
                >
                  <Ionicons name="close" size={18} color="#fff" />
                </Pressable>
              </View>
            ) : (
              <View style={styles.photoOptions}>
                <Pressable
                  onPress={() => pickImage(true)}
                  style={({ pressed }) => [styles.photoBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}
                >
                  <Ionicons name="camera" size={28} color="#fff" />
                  <Text style={[styles.photoBtnText, { fontFamily: 'Urbanist_700Bold' }]}>{t('take_selfie')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => pickImage(false)}
                  style={({ pressed }) => [styles.photoBtn, { backgroundColor: theme.card, borderWidth: 2, borderColor: theme.primary + '40', opacity: pressed ? 0.9 : 1 }]}
                >
                  <Ionicons name="image" size={28} color={theme.primary} />
                  <Text style={[styles.photoBtnText, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('choose_photo')}</Text>
                </Pressable>
              </View>
            )}

            {/* Summary of selections */}
            <View style={[styles.summaryBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.summaryTitle, { color: theme.text, fontFamily: 'Urbanist_700Bold' }]}>{t('your_profile')}</Text>
              <View style={styles.summaryRow}>
                <View style={[styles.summaryChip, { backgroundColor: theme.primary + '15' }]}>
                  <View style={[styles.miniSkinDot, { backgroundColor: SKIN_TONES.find(s => s.id === skinTone)?.color }]} />
                  <Text style={[styles.summaryChipText, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>
                    {t(SKIN_TONES.find(s => s.id === skinTone)?.label || '')}
                  </Text>
                </View>
                <View style={[styles.summaryChip, { backgroundColor: theme.primary + '15' }]}>
                  <MaterialCommunityIcons name="hair-dryer" size={14} color={theme.primary} />
                  <Text style={[styles.summaryChipText, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>
                    {t(HAIR_TYPES.find(h => h.id === hairType)?.label || '')}
                  </Text>
                </View>
                {faceShape && (
                  <View style={[styles.summaryChip, { backgroundColor: theme.primary + '15' }]}>
                    <Ionicons name="person-circle" size={14} color={theme.primary} />
                    <Text style={[styles.summaryChipText, { color: theme.text, fontFamily: 'Urbanist_600SemiBold' }]}>
                      {t(FACE_SHAPES.find(f => f.id === faceShape)?.label || '')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      {stepIndex >= 0 && (
        <View style={[styles.bottomBar, { backgroundColor: theme.background, paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable
            onPress={goNext}
            disabled={!canProceed}
            style={({ pressed }) => [styles.ctaBtn, {
              backgroundColor: canProceed ? theme.primary : theme.textTertiary,
              opacity: pressed && canProceed ? 0.9 : 1,
            }]}
          >
            <Text style={[styles.ctaText, { fontFamily: 'Urbanist_700Bold' }]}>
              {step === 'photo' ? t('get_recommendations') : t('continue')}
            </Text>
            <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={20} color="#fff" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingBottom: 12,
  },
  headerTitle: { fontSize: 20 },

  // Progress
  progressRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 24, marginBottom: 16 },
  progressDot: { height: 4, borderRadius: 2 },

  // Steps
  stepContent: { paddingHorizontal: 0 },
  stepHeaderArea: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 28, gap: 10 },
  stepIconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepTitle: { fontSize: 24, textAlign: 'center' },
  stepDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },

  // Skin Tone
  skinGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, justifyContent: 'center' },
  skinItem: { width: (width - 64) / 3, borderRadius: 16, padding: 16, alignItems: 'center', gap: 10 },
  skinCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  skinLabel: { fontSize: 12, textAlign: 'center' },

  // Hair Type
  hairGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, justifyContent: 'center' },
  hairItem: { width: (width - 56) / 2, borderRadius: 16, padding: 20, alignItems: 'center', gap: 8 },
  hairIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  hairLabel: { fontSize: 16 },
  hairDesc: { fontSize: 12, textAlign: 'center', lineHeight: 17 },

  // Face Shape
  faceGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, justifyContent: 'center' },
  faceItem: { width: (width - 68) / 3, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 },
  faceLabel: { fontSize: 12, textAlign: 'center' },
  skipText: { textAlign: 'center', fontSize: 14, textDecorationLine: 'underline' },

  // Photo
  photoOptions: { paddingHorizontal: 24, gap: 14 },
  photoBtn: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 8 },
  photoBtnText: { fontSize: 16, color: '#fff' },
  photoPreview: { marginHorizontal: 24, borderRadius: 20, overflow: 'hidden', height: width * 0.8, position: 'relative' },
  photoImage: { width: '100%', height: '100%' },
  removePhotoBtn: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  // Summary
  summaryBox: { marginHorizontal: 24, marginTop: 20, borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  summaryTitle: { fontSize: 14 },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  summaryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  summaryChipText: { fontSize: 13 },
  miniSkinDot: { width: 16, height: 16, borderRadius: 8 },

  // Bottom Bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 12 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingVertical: 18 },
  ctaText: { fontSize: 17, color: '#fff' },

  // Loading
  loadingContainer: { alignItems: 'center', gap: 8, paddingHorizontal: 40 },
  loadingIconWrap: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  loadingTitle: { fontSize: 22, textAlign: 'center', marginTop: 8 },
  loadingSub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },

  // Results
  analysisBanner: { marginHorizontal: 24, borderRadius: 20, padding: 20, gap: 10, marginBottom: 16 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  aiBadgeText: { color: '#fff', fontSize: 12 },
  analysisTitle: { fontSize: 18, marginTop: 4 },
  analysisText: { fontSize: 13, lineHeight: 20 },

  // Tabs
  tabRow: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16, gap: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 13 },

  // Results Cards
  resultSection: { paddingHorizontal: 24 },
  resultSectionTitle: { fontSize: 18, marginBottom: 14 },

  styleCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12, gap: 10 },
  styleCardHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  styleNum: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  styleNumText: { color: '#fff', fontSize: 14 },
  styleCardName: { fontSize: 16, marginBottom: 2 },
  styleCardDesc: { fontSize: 13, lineHeight: 19 },
  styleTags: { flexDirection: 'row', gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  tagText: { fontSize: 11 },
  bestForText: { fontSize: 12, lineHeight: 17, fontStyle: 'italic' },

  colorCard: { flexDirection: 'row', borderRadius: 16, padding: 14, borderWidth: 1, marginBottom: 12, gap: 14, alignItems: 'center' },
  colorSwatch: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  colorCardName: { fontSize: 16, marginBottom: 3 },
  colorCardReason: { fontSize: 13, lineHeight: 19 },

  avoidTitle: { fontSize: 16, marginTop: 20, marginBottom: 10 },
  avoidRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 12, borderWidth: 1, borderRadius: 12, marginBottom: 8 },
  avoidText: { fontSize: 13, lineHeight: 19, flex: 1 },

  tipCard: { flexDirection: 'row', borderRadius: 16, padding: 14, borderWidth: 1, marginBottom: 10, gap: 12, alignItems: 'flex-start' },
  tipIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tipCardText: { flex: 1, fontSize: 14, lineHeight: 21 },

  productRow: { flexDirection: 'row', borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 8, gap: 12, alignItems: 'center' },
  productIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  productText: { flex: 1, fontSize: 14 },

  bookResultBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 18 },
  bookResultText: { fontSize: 17, color: '#fff' },

  // Result photo section
  resultPhotoSection: { paddingHorizontal: 24, marginBottom: 16, gap: 12 },
  resultPhotoRow: { flexDirection: 'row', gap: 12 },
  resultPhotoCol: { flex: 1, gap: 6 },
  resultPhotoLabel: { fontSize: 12, textAlign: 'center' },
  resultPhotoImg: { width: '100%', height: width * 0.5, borderRadius: 16 },
  resultPhotoPreviewWrap: { position: 'relative', overflow: 'hidden', borderRadius: 16 },
  colorOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 },
  aiPreviewBadge: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  aiPreviewBadgeText: { color: '#fff', fontSize: 11 },
  previewColorRow: { alignItems: 'center', gap: 8 },
  previewColorLabel: { fontSize: 11 },
  previewSwatches: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  previewSwatch: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  resultProfileChips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  resultChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  resultChipText: { fontSize: 12 },
});
