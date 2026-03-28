import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
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
    const loop = () => {
      anim.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
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
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {particles.map(p => (
          <Particle key={p.id} size={p.size} left={p.left} color={p.color} duration={p.duration} delay={p.delay} />
        ))}
      </View>

      <View style={styles.content}>
        <View style={styles.logoRow}>
          <Text style={styles.logoIcon}>✨</Text>
          <Text style={styles.logoText}>StoryNook</Text>
        </View>

        <Text style={styles.title}>
          Every child deserves{'\n'}
          <Text style={styles.titleHighlight}>to be the hero</Text>
        </Text>

        <Text style={styles.subtitle}>
          AI-powered personalized storybooks where your child is the star —
          with illustrations that actually look like them.
        </Text>

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

        {/* Auth buttons */}
        <View style={styles.authRow}>
          <TouchableOpacity style={styles.signUpBtn} onPress={() => router.push('/signuppage')}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logInBtn} onPress={() => router.push('/login')}>
            <Text style={styles.logInText}>Log In</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cta} onPress={() => router.push('/onboarding')}>
          <Text style={styles.ctaText}>Start Your Story ✨</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Free to try · No account required · Powered by Google Gemini & Imagen
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0a2e',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 70,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: { fontSize: 28 },
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
  },
  titleHighlight: { color: '#FFD93D' },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    width: 105,
    minHeight: 175,
    justifyContent: 'center',
  },
  stepImgWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepEmoji: { fontSize: 24 },
  stepTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 13,
  },
  arrow: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 4,
  },
  authRow: {
    flexDirection: 'row',
    gap: 12,
  },
  signUpBtn: {
    backgroundColor: '#C77DFF',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 32,
    shadowColor: '#C77DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  signUpText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  logInBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logInText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  cta: {
    backgroundColor: '#FFD93D',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 48,
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