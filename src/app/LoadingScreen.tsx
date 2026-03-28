import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoadingScreenProps {
  childName?: string;
  pageCount?: number;
  onComplete?: () => void;
}

// ─── Constants (mirror LoadingPage.jsx exactly) ───────────────────────────────
const LOADING_MESSAGES = [
  '✨ Sprinkling magic on your story...',
  '🎨 Painting illustrations just for them...',
  '📖 Writing the perfect adventure...',
  '🌟 Making your child the hero...',
  '🦄 Adding a sprinkle of wonder...',
  '🎭 Bringing characters to life...',
  '🌈 Mixing the perfect colors...',
  '⭐ Almost ready for the big reveal...',
];

const BUBBLE_COLORS = ['#FFD93D', '#FF6B6B', '#6BCB77', '#4D96FF', '#C77DFF', '#FFB347'];

const { width: SW, height: SH } = Dimensions.get('window');

// Generated once at module level — same pattern as the JSX original
const BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 40 + 20,
  leftPct: Math.random() * 90 + 5,
  duration: (Math.random() * 4 + 3) * 1000, // s → ms
  delay: Math.random() * 5 * 1000,
  color: BUBBLE_COLORS[Math.floor(Math.random() * 6)],
}));

// ─── SVG circle constants ─────────────────────────────────────────────────────
const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SVG_SIZE = 120;

// ─── Bubble ───────────────────────────────────────────────────────────────────
function Bubble({ size, leftPct, duration, delay, color }: (typeof BUBBLES)[0]) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      anim.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(SH + size + 40)],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 0.08, 0.85, 1],
    outputRange: [0, 0.75, 0.75, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: -size - 10,
        left: (leftPct / 100) * SW,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color + '40',  // ~25% opacity fill
        borderWidth: 2,
        borderColor: color + '99',      // ~60% opacity border
        transform: [{ translateY }],
        opacity,
      }}
    />
  );
}

// ─── Step row ─────────────────────────────────────────────────────────────────
type StepState = 'idle' | 'active' | 'done';

function StepRow({ emoji, label, state }: { emoji: string; label: string; state: StepState }) {
  return (
    <View style={[styles.step, state === 'active' && styles.stepActive, state === 'done' && styles.stepDone]}>
      <Text style={styles.stepEmoji}>{emoji}</Text>
      <Text style={[styles.stepText, state === 'active' && styles.stepTextActive, state === 'done' && styles.stepTextDone]}>
        {label}
      </Text>
      {state === 'done' && <Text style={styles.checkmark}>✓</Text>}
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LoadingScreen({ childName, pageCount = 7, onComplete }: LoadingScreenProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'writing' | 'illustrating' | 'finalizing'>('writing');

  const msgOpacity = useRef(new Animated.Value(1)).current;
  const startTimeRef = useRef(Date.now());
  const totalIllustrationTime = pageCount * 5000;

  // Rotate messages with fade — 2500ms interval matches the JSX
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(msgOpacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length);
        Animated.timing(msgOpacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Progress — same timing logic as the JSX original
  useEffect(() => {
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      let newProgress: number;

      if (elapsed < 5000) {
        newProgress = (elapsed / 5000) * 20;
        setStage('writing');
      } else if (elapsed < 5000 + totalIllustrationTime) {
        newProgress = 20 + ((elapsed - 5000) / totalIllustrationTime) * 70;
        setStage('illustrating');
      } else {
        newProgress = Math.min(90 + ((elapsed - 5000 - totalIllustrationTime) / 3000) * 9, 99);
        setStage('finalizing');
        if (newProgress >= 99) onComplete?.();
      }

      setProgress(Math.round(newProgress));
    }, 200);
    return () => clearInterval(interval);
  }, [pageCount]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress / 100);

  const stageLabel = {
    writing: '✍️ Writing your story...',
    illustrating: `🎨 Painting illustrations (${pageCount} pages)...`,
    finalizing: '📚 Putting it all together...',
  }[stage];

  // Mirror the JSX className logic exactly
  const writingState: StepState = stage !== 'writing' ? 'done' : 'active';
  const illustState: StepState  = stage === 'finalizing' ? 'done' : stage === 'illustrating' ? 'active' : 'idle';
  const finalState: StepState   = stage === 'finalizing' ? 'active' : 'idle';

  return (
    <View style={styles.container}>

      {/* Floating bubbles — pointerEvents none so touches pass through */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {BUBBLES.map(b => <Bubble key={b.id} {...b} />)}
      </View>

      <View style={styles.content}>

        {/* Circle progress */}
        <View style={styles.circleWrap}>
          <Svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}>
            <Defs>
              <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%"   stopColor="#FFD93D" />
                <Stop offset="100%" stopColor="#FF6B6B" />
              </LinearGradient>
            </Defs>
            {/* Track ring */}
            <Circle cx="60" cy="60" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            {/* Progress arc */}
            <Circle
              cx="60" cy="60" r={RADIUS}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              rotation="-90"
              origin="60, 60"
            />
          </Svg>
          <View style={styles.circleInner}>
            <Text style={styles.circlePercent}>{progress}%</Text>
            <Text style={styles.circleEmoji}>✨</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {'Creating '}
          <Text style={styles.nameHighlight}>{childName ?? "Your Child's"}</Text>
          {childName ? "'s Story!" : ' Story!'}
        </Text>

        {/* Stage */}
        <Text style={styles.stageLabel}>{stageLabel}</Text>

        {/* Rotating message */}
        <Animated.Text style={[styles.rotatingMsg, { opacity: msgOpacity }]}>
          {LOADING_MESSAGES[msgIndex]}
        </Animated.Text>

        {/* Steps */}
        <View style={styles.steps}>
          <StepRow emoji="📝" label="Writing story"                           state={writingState} />
          <StepRow emoji="🎨" label={`Generating ${pageCount} illustrations`} state={illustState}  />
          <StepRow emoji="📚" label="Building your book"                      state={finalState}   />
        </View>

      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D2B', // dark purple, matches web LoadingPage bg
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 18,
    width: '100%',
  },

  // Circle
  circleWrap: {
    width: SVG_SIZE,
    height: SVG_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  circleInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePercent: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  circleEmoji: {
    fontSize: 16,
    marginTop: 2,
  },

  // Text
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 30,
  },
  nameHighlight: {
    color: '#FFD93D', // matches .name-highlight in web CSS
  },
  stageLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  rotatingMsg: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    fontStyle: 'italic',
    minHeight: 22,
  },

  // Steps
  steps: {
    width: '100%',
    gap: 10,
    marginTop: 6,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stepActive: {
    backgroundColor: 'rgba(255,217,61,0.15)',
    borderColor: 'rgba(255,217,61,0.45)',
  },
  stepDone: {
    backgroundColor: 'rgba(107,203,119,0.13)',
    borderColor: 'rgba(107,203,119,0.35)',
  },
  stepEmoji: { fontSize: 17 },
  stepText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  stepTextActive: { color: '#FFD93D' },
  stepTextDone:   { color: '#6BCB77' },
  checkmark: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6BCB77',
  },
});