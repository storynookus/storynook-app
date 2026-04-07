import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const MORAL_OPTIONS = [
  { key: 'sharing',        emoji: '🤝', label: 'Sharing' },
  { key: 'kindness',       emoji: '💛', label: 'Kindness' },
  { key: 'brushing_teeth', emoji: '🦷', label: 'Brushing Teeth' },
  { key: 'collaboration',  emoji: '🌟', label: 'Teamwork' },
  { key: 'courage',        emoji: '🦁', label: 'Courage' },
  { key: 'honesty',        emoji: '✨', label: 'Honesty' },
  { key: 'patience',       emoji: '🌱', label: 'Patience' },
];

const LANGUAGES = ['English', 'Spanish', 'French', 'Arabic', 'Urdu', 'Mandarin', 'Hindi'];

const INTERESTS_SUGGESTIONS = [
  '🦕 Dinosaurs', '🚀 Space', '🧜 Mermaids', '🦸 Superheroes',
  '🐉 Dragons', '🏔️ Mountains', '🌊 Ocean', '🦋 Nature',
  '⚽ Sports', '🎨 Art', '🎵 Music', '🍕 Food Adventures',
];

const PARTICLE_COLORS = ['#FFD93D', '#FF6B6B', '#6BCB77', '#4D96FF', '#C77DFF', '#FFB347'];

const particles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  size: Math.random() * 14 + 6,
  left: Math.random() * 100,
  color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  duration: (Math.random() * 12 + 8) * 1000,
  delay: Math.random() * 8 * 1000,
}));

// ─── Particle ─────────────────────────────────────────────────────────────────
function Particle({ size, left, color, duration, delay }: {
  size: number; left: number; color: string; duration: number; delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = () => {
      anim.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
      ]).start(() => loop());
    };
    loop();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -height - 40] });
  const opacity    = anim.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.6, 0.6, 0] });
  return (
    <Animated.View style={{
      position: 'absolute', width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, left: left * width / 100, bottom: -20,
      opacity, transform: [{ translateY }],
    }} />
  );
}

// ─── ChipRow — simple horizontal scroll, user swipes themselves ───────────────
function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRowContent}
      style={styles.chipRow}
    >
      {children}
    </ScrollView>
  );
}

// ─── PageSlider ───────────────────────────────────────────────────────────────
function PageSlider({ value, min, max, onChange }: {
  value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  const sliderWidth = width - 20 * 2 - 24 * 2 - 48;
  const percent = (value - min) / (max - min);
  const handleTouch = (e: any) => {
    const x = e.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, x / sliderWidth));
    onChange(Math.round(min + ratio * (max - min)));
  };
  return (
    <View style={sliderStyles.wrap}>
      <Text style={sliderStyles.label}>{min}</Text>
      <View style={[sliderStyles.track, { width: sliderWidth }]} onTouchStart={handleTouch} onTouchMove={handleTouch}>
        <View style={[sliderStyles.fill, { width: `${percent * 100}%` as any }]} />
        <View style={[sliderStyles.thumb, { left: `${percent * 100}%` as any }]} />
      </View>
      <Text style={sliderStyles.label}>{max}</Text>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { color: '#888', fontWeight: '700', fontSize: 14 },
  track: { height: 8, backgroundColor: '#E8E8E8', borderRadius: 4, position: 'relative', justifyContent: 'center' },
  fill:  { height: 8, backgroundColor: '#FF6B6B', borderRadius: 4, position: 'absolute', left: 0 },
  thumb: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#FF6B6B',
    position: 'absolute', marginLeft: -11, borderWidth: 3, borderColor: '#fff',
    shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 4, elevation: 4,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LandingScreen() {
  const router    = useRouter();
  const params    = useLocalSearchParams();
  const childName = (params.childName as string) || 'Your Child';
  const childAge = (params.childAge as string) || '5';
  const photoUri = (params.photoUri as string) || '';

  const [interests,         setInterests]         = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMoral,     setSelectedMoral]     = useState('kindness');
  const [customLesson,      setCustomLesson]      = useState('');
  const [language,          setLanguage]          = useState('English');
  const [pageCount,         setPageCount]         = useState(7);

  const toggleInterest = useCallback((key: string) => {
    setSelectedInterests(prev =>
      prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]
    );
  }, []);

  const handleGenerate = () => {
    const allInterests = [...selectedInterests, ...(interests ? [interests] : [])].join(', ') || 'adventure and friendship';
    router.push({
      pathname: '/loading',
      params: { childName, childAge, photoUri, interests: allInterests, moral: selectedMoral, customLesson, language, pageCount: String(pageCount) },
    });
  };

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {particles.map(p => (
          <Particle key={p.id} size={p.size} left={p.left} color={p.color} duration={p.duration} delay={p.delay} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✨ AI-Powered Storytelling</Text>
          </View>
        </View>

        {/* Hero */}
        <Text style={styles.title}>
          <Text style={styles.titleHighlight}>{childName}</Text>
          <Text style={styles.titleIs}> is the{'\n'}</Text>
          <Text style={styles.titleHero}>Hero ⭐</Text>
        </Text>
        <Text style={styles.subtitle}>Create a magical, personalized storybook in seconds.</Text>

        <View style={styles.card}>

          {/* Interests */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              🌟 What does {childName} love?{' '}
              <Text style={styles.optional}>scroll to pick any</Text>
            </Text>
            <View style={styles.chipBox}>
              <ChipRow>
                {INTERESTS_SUGGESTIONS.map((item) => {
                  const key = item.replace(/^[^\s]+\s/, '');
                  const active = selectedInterests.includes(key);
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => toggleInterest(key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ChipRow>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Or type something custom... (e.g. trains, ballet, cooking)"
              placeholderTextColor="#bbb"
              value={interests}
              onChangeText={setInterests}
            />
          </View>

          {/* Moral */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              💡 Story Lesson{' '}
              <Text style={styles.optional}>scroll to pick one</Text>
            </Text>
            <View style={styles.chipBox}>
              <ChipRow>
                {MORAL_OPTIONS.map((m) => {
                  const active = selectedMoral === m.key;
                  return (
                    <TouchableOpacity
                      key={m.key}
                      style={[styles.moralChip, active && styles.moralChipActive]}
                      onPress={() => setSelectedMoral(m.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.moralEmoji}>{m.emoji}</Text>
                      <Text style={[styles.chipText, active && styles.moralChipTextActive]}>{m.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ChipRow>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Or type your own lesson... (e.g. 'respecting elders')"
              placeholderTextColor="#bbb"
              value={customLesson}
              onChangeText={setCustomLesson}
            />
          </View>

          {/* Language */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              🌍 Story Language{' '}
              <Text style={styles.optional}>scroll to pick one</Text>
            </Text>
            <View style={styles.chipBox}>
              <ChipRow>
                {LANGUAGES.map((lang) => {
                  const active = language === lang;
                  return (
                    <TouchableOpacity
                      key={lang}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setLanguage(lang)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>🌍 {lang}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ChipRow>
            </View>
          </View>

          {/* Page Slider */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              📚 Story Length{' '}
              <Text style={styles.optional}>— {pageCount} pages</Text>
            </Text>
            <PageSlider value={pageCount} min={7} max={15} onChange={setPageCount} />
            <Text style={styles.sliderHint}>
              {pageCount === 7 ? '⚡ Quick bedtime story' :
               pageCount <= 10 ? '📖 Perfect length' :
               pageCount <= 13 ? '🌟 Extended adventure' : '🏆 Epic tale!'}
            </Text>
          </View>

          {/* Generate */}
          <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate}>
            <Text style={styles.generateText}>✨ Create {childName}'s Story 📖</Text>
          </TouchableOpacity>
        </View>

        {/* Trust row */}
        <View style={styles.trustRow}>
          <Text style={styles.trustItem}>🎨 AI-generated illustrations</Text>
          <Text style={styles.trustItem}>📚 {pageCount} magical pages</Text>
          <Text style={styles.trustItem}>🖨️ Order a physical copy</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#FFF8EE' },
  content:        { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 48 },
  header:         { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  backBtn:        { backgroundColor: '#fff', borderRadius: 30, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1.5, borderColor: '#E8E8E8' },
  backText:       { color: '#555', fontWeight: '700', fontSize: 14 },
  badge:          { backgroundColor: 'rgba(255,107,107,0.1)', borderRadius: 30, paddingVertical: 6, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)' },
  badgeText:      { color: '#FF6B6B', fontWeight: '700', fontSize: 12 },
  title:          { fontSize: 30, fontWeight: '800', color: '#2D2D2D', lineHeight: 42, marginBottom: 8 },
  titleHighlight: { color: '#FF6B6B' },
  titleIs:        { color: '#2D2D2D', fontWeight: '800' },
  titleHero:      { color: '#FFB347', fontWeight: '800' },
  subtitle:       { fontSize: 14, color: '#888', marginBottom: 28 },
  card:           { backgroundColor: '#fff', borderRadius: 28, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 4, marginBottom: 24, marginHorizontal: -5 },
  section:        { marginBottom: 24 },
  sectionLabel:   { color: '#2D2D2D', fontWeight: '700', fontSize: 14, marginBottom: 10 },
  optional:       { color: '#aaa', fontWeight: '400', fontSize: 12 },
  chipBox:        { backgroundColor: '#FAFAFA', borderRadius: 14, borderWidth: 1, borderColor: '#E8E8E8', marginBottom: 10, overflow: 'hidden' },
  chipRow:        { paddingVertical: 12 },
  chipRowContent: { paddingHorizontal: 8, gap: 8, flexDirection: 'row', alignItems: 'center' },
  chip:           { backgroundColor: '#fff', borderRadius: 30, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1.5, borderColor: '#E8E8E8' },
  chipActive:     { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  chipText:       { color: '#555', fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '800' },
  moralChip:      { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1.5, borderColor: '#E8E8E8', alignItems: 'center', minWidth: 80 },
  moralChipActive:     { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  moralEmoji:          { fontSize: 22, marginBottom: 4 },
  moralChipTextActive: { color: '#fff', fontWeight: '800' },
  input:        { backgroundColor: '#FAFAFA', borderRadius: 12, borderWidth: 1.5, borderColor: '#E8E8E8', paddingVertical: 12, paddingHorizontal: 14, color: '#2D2D2D', fontSize: 14 },
  sliderHint:   { color: '#aaa', fontSize: 12, marginTop: 8 },
  generateBtn:  { backgroundColor: '#FF6B6B', borderRadius: 30, paddingVertical: 18, alignItems: 'center', shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  generateText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  trustRow:     { flexDirection: 'row', justifyContent: 'center', gap: 12, flexWrap: 'wrap' },
  trustItem:    { color: '#aaa', fontSize: 11 },
});