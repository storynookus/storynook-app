import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const PARTICLE_COLORS = ['#FFD93D', '#FF6B6B', '#6BCB77', '#4D96FF', '#C77DFF', '#FFB347'];

function Particle({ size, left, color, duration, delay }: {
  size: number; left: number; color: string; duration: number; delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height - 40],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        left: left * width / 100,
        bottom: -20,
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
}

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 12 + 6,
  left: Math.random() * 100,
  color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  duration: (Math.random() * 12 + 8) * 1000,
  delay: Math.random() * 8 * 1000,
}));

const STEPS = [
  { emoji: '📸', title: 'Add your child', desc: 'Upload a photo and tell us about them' },
  { emoji: '✨', title: 'AI generates', desc: 'Gemini writes a story, Imagen paints it' },
  { emoji: '📚', title: 'Read together', desc: 'A magical book just for your family' },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Floating particles */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {particles.map(p => (
          <Particle key={p.id} size={p.size} left={p.left} color={p.color} duration={p.duration} delay={p.delay} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <Text style={styles.logoIcon}>✨</Text>
          <Text style={styles.logoText}>StoryNook</Text>
        </View>

        {/* Hero */}
        <Text style={styles.title}>
          Every child deserves{'\n'}
          <Text style={styles.titleHighlight}>to be the hero</Text>
        </Text>

        <Text style={styles.subtitle}>
          AI-powered personalized storybooks where your child is the star —
          with illustrations that actually look like them.
        </Text>

        {/* Steps */}
        <View style={styles.stepsRow}>
          {STEPS.map((step, i) => (
            <View key={i} style={styles.stepWrapper}>
              <View style={styles.stepCard}>
                <View style={styles.stepImgWrap}>
                  <Text style={styles.stepEmoji}>{step.emoji}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
              {i < STEPS.length - 1 && <Text style={styles.arrow}>→</Text>}
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.cta} onPress={() => router.push('/onboarding')}>
          <Text style={styles.ctaText}>Start Your Story ✨</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Free to try · No account required · Powered by Google Gemini & Imagen
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0a2e',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 48,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  logoIcon: {
    fontSize: 28,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 16,
  },
  titleHighlight: {
    color: '#FFD93D',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    maxWidth: 320,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    flexWrap: 'wrap',
    gap: 8,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: 100,
  },
  stepImgWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  stepEmoji: {
    fontSize: 28,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 14,
  },
  arrow: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.4)',
  },
  cta: {
    backgroundColor: '#FFD93D',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 16,
    shadowColor: '#FFD93D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a0a2e',
  },
  note: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
  },
});
