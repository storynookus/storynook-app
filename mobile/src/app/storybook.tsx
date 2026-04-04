import { useRouter } from 'expo-router';
import { storyStore } from './storyStore';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StoryPage {
  text: string;
  image_base64?: string;
}

interface Story {
  childName: string;
  moral: string;
  language?: string;
  story: StoryPage[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_ROLES: Record<number, string> = {
  1: '🌅 Once Upon a Time...',
  2: '🌟 The Adventure Begins',
  3: '⚡ A Challenge Appears',
  4: '💥 The Big Moment!',
  5: '🔑 Finding the Way',
  6: '🌈 Victory!',
  7: '🏆 Happily Ever After',
};

const COVER_STARS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  top: Math.random() * 75,
  left: Math.random() * 85,
}));

const { width: SW } = Dimensions.get('window');

// ─── Cover ────────────────────────────────────────────────────────────────────
function CoverPage({ story }: { story: Story }) {
  const coverImage = story.story[0]?.image_base64;
  return (
    <View style={styles.coverBg}>
      {COVER_STARS.map(s => (
        <Text key={s.id} style={[styles.coverStar, { top: `${s.top}%` as any, left: `${s.left}%` as any }]}>⭐</Text>
      ))}
      <View style={styles.coverContent}>
        <Text style={styles.coverSubtitle}>A Magical Story About</Text>
        <Text style={styles.coverHeroName}>{story.childName}</Text>
        <View style={styles.coverDivider} />
        <Text style={styles.coverMoral}>Learning about {story.moral.replace(/_/g, ' ')} ✨</Text>
        {coverImage ? (
          <Image
            source={{ uri: `data:image/png;base64,${coverImage}` }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🎨</Text>
            <Text style={styles.placeholderText}>Illustration loading...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Story page ───────────────────────────────────────────────────────────────
function StoryPageView({ pageData, pageNum }: { pageData: StoryPage; pageNum: number }) {
  return (
    <View style={styles.storyPage}>
      <View style={styles.pageLeft}>
        {pageData.image_base64 ? (
          <Image
            source={{ uri: `data:image/png;base64,${pageData.image_base64}` }}
            style={styles.pageIllustration}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🎨</Text>
            <Text style={styles.placeholderText}>Illustration generating...</Text>
          </View>
        )}
        <View style={styles.pageNumberBadge}>
          <Text style={styles.pageNumberText}>{pageNum}</Text>
        </View>
      </View>
      <View style={styles.pageRight}>
        <Text style={styles.pageRoleLabel}>{PAGE_ROLES[pageNum] ?? '📖 Story'}</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.pageText}>{pageData.text}</Text>
        </ScrollView>
      </View>
    </View>
  );
}

// ─── End page ─────────────────────────────────────────────────────────────────
function EndPage({ story, onBuy, onShare, onRestart }: {
  story: Story; onBuy: () => void; onShare: () => void; onRestart: () => void;
}) {
  return (
    <View style={styles.endPage}>
      <Text style={styles.endTrophy}>🏆</Text>
      <Text style={styles.endTitle}>The End!</Text>
      <Text style={styles.endMsg}>
        <Text style={styles.endChildName}>{story.childName}</Text>
        {' learned that '}
        <Text style={styles.endMoral}>{story.moral.replace(/_/g, ' ')}</Text>
        {' makes the world a better place. ✨'}
      </Text>
      <View style={styles.endActions}>
        <TouchableOpacity style={styles.btnBuy} onPress={onBuy}>
          <Text style={styles.btnBuyText}>📚 Buy Physical Book — $25</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnShare} onPress={onShare}>
          <Text style={styles.btnShareText}>📤 Share Story</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnNew} onPress={onRestart}>
          <Text style={styles.btnNewText}>✨ Create Another Story</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Buy Modal ────────────────────────────────────────────────────────────────
function BuyModal({ visible, childName, onClose }: { visible: boolean; childName: string; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.modal} activeOpacity={1}>
          <Text style={styles.modalIcon}>📚</Text>
          <Text style={styles.modalTitle}>Order {childName}'s Book!</Text>
          <Text style={styles.modalDesc}>A beautifully printed hardcover storybook delivered to your door.</Text>
          <Text style={styles.modalPrice}>$25 <Text style={styles.modalPriceSub}>+ shipping</Text></Text>
          <View style={styles.modalFeatures}>
            {['High-quality hardcover print', 'Full color AI illustrations', 'Delivered in 5-7 days', 'Perfect gift for any occasion'].map(f => (
              <Text key={f} style={styles.modalFeature}>✅  {f}</Text>
            ))}
          </View>
          <TouchableOpacity style={styles.modalOrderBtn}>
            <Text style={styles.modalOrderText}>🛒 Order Now — $25</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalMaybeBtn} onPress={onClose}>
            <Text style={styles.modalMaybeText}>Maybe later 💭</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────
function ShareModal({ visible, childName, onClose }: { visible: boolean; childName: string; onClose: () => void }) {
  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out ${childName}'s magical storybook from StoryNook! ✨` });
    } catch {}
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.modal} activeOpacity={1}>
          <Text style={styles.modalIcon}>📤</Text>
          <Text style={styles.modalTitle}>Share {childName}'s Story!</Text>
          <Text style={styles.modalDesc}>Share this magical story with family and friends.</Text>
          <View style={styles.shareButtons}>
            <TouchableOpacity style={[styles.shareBtn, styles.shareCopy]} onPress={handleShare}>
              <Text style={styles.shareBtnText}>📋 Copy Link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareBtn, styles.shareWhatsapp]} onPress={handleShare}>
              <Text style={styles.shareBtnText}>💬 WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareBtn, styles.shareEmail]} onPress={handleShare}>
              <Text style={styles.shareBtnText}>📧 Email</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Main Route ───────────────────────────────────────────────────────────────
export default function StorybookPage() {
  const router = useRouter();

  // Read from in-memory store — avoids Expo Router param size limits
  const parsed = storyStore.get();

  let story: Story;
  if (parsed?.success && parsed?.story?.length > 0) {
    story = {
      childName: parsed.childName,
      moral:     parsed.moral,
      language:  parsed.language,
      story:     parsed.story,
    };
  } else {
    story = {
      childName: 'Your Child',
      moral: 'kindness',
      language: 'English',
      story: [
        { text: 'Once upon a time, there was a brave little hero who loved going on adventures...' },
        { text: 'One sunny morning, they discovered something magical in the forest...' },
        { text: 'A big challenge appeared! But the hero remembered what was important...' },
        { text: 'With courage and a kind heart, they faced the challenge head on...' },
        { text: 'Slowly, they found a way through by being true to themselves...' },
        { text: 'And just like that — victory! Everyone celebrated together...' },
        { text: 'And they all lived happily ever after, knowing that kindness always wins. The End!' },
      ],
    };
  }

  const [currentPage, setCurrentPage] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const pages = story.story;
  const totalPages = pages.length;
  const isCover = currentPage === 0;
  const isEnd = currentPage === totalPages + 1;
  const currentPageData = pages[currentPage - 1];

  const goTo = (dir: 'next' | 'prev') => {
    if (flipping) return;
    setFlipping(true);
    Animated.timing(flipAnim, {
      toValue: dir === 'next' ? -SW : SW,
      duration: 180,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      if (dir === 'next') setCurrentPage(p => Math.min(p + 1, totalPages + 1));
      else setCurrentPage(p => Math.max(p - 1, 0));
      flipAnim.setValue(dir === 'next' ? SW : -SW);
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => setFlipping(false));
    });
  };

  const pageCounter = isCover ? 'Cover' : isEnd ? 'The End' : `Page ${currentPage} of ${totalPages}`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
          <Text style={styles.backText}>← New Story</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>⭐ {story.childName}'s Story</Text>
        <Text style={styles.pageCounter}>{pageCounter}</Text>
      </View>

      {/* Book */}
      <Animated.View style={[styles.bookStage, { transform: [{ translateX: flipAnim }] }]}>
        {isCover && <CoverPage story={story} />}
        {!isCover && !isEnd && currentPageData && <StoryPageView pageData={currentPageData} pageNum={currentPage} />}
        {isEnd && <EndPage story={story} onBuy={() => setShowBuyModal(true)} onShare={() => setShowShareModal(true)} onRestart={() => router.replace('/')} />}
      </Animated.View>

      {/* Nav */}
      <View style={styles.navButtons}>
        {!isCover && (
          <TouchableOpacity style={styles.navBtn} onPress={() => goTo('prev')}>
            <Text style={styles.navBtnText}>← Prev</Text>
          </TouchableOpacity>
        )}
        {!isEnd && (
          <TouchableOpacity style={[styles.navBtn, styles.navBtnNext]} onPress={() => goTo('next')}>
            <Text style={[styles.navBtnText, styles.navBtnNextText]}>
              {isCover ? 'Open Book ✨' : 'Next →'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dots */}
      <View style={styles.pageDots}>
        {[0, ...pages.map((_: any, i: number) => i + 1), totalPages + 1].map((p: number) => (
          <TouchableOpacity key={p} onPress={() => { if (!flipping) setCurrentPage(p); }}
            style={[styles.dot, currentPage === p && styles.dotActive]} />
        ))}
      </View>

      <BuyModal visible={showBuyModal} childName={story.childName} onClose={() => setShowBuyModal(false)} />
      <ShareModal visible={showShareModal} childName={story.childName} onClose={() => setShowShareModal(false)} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8EE' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12,
    backgroundColor: '#FFF8EE', borderBottomWidth: 1, borderBottomColor: '#E8E8E8', gap: 8,
  },
  backBtn: {
    backgroundColor: '#fff', borderRadius: 30,
    paddingVertical: 7, paddingHorizontal: 14,
    borderWidth: 1.5, borderColor: '#E8E8E8',
  },
  backText: { color: '#555', fontWeight: '700', fontSize: 13 },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: '#2D2D2D', textAlign: 'center' },
  pageCounter: { fontSize: 12, color: '#aaa', fontWeight: '600', minWidth: 70, textAlign: 'right' },

  bookStage: {
    flex: 1, marginHorizontal: 16, marginTop: 14,
    borderRadius: 20, overflow: 'hidden', backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 6,
  },

  // Cover
  coverBg: { flex: 1, backgroundColor: '#1A0A2E', alignItems: 'center', justifyContent: 'center', padding: 24 },
  coverStar: { position: 'absolute', fontSize: 14, opacity: 0.7 },
  coverContent: { alignItems: 'center', width: '100%' },
  coverSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  coverHeroName: { fontSize: 38, fontWeight: '900', color: '#FFD93D', textAlign: 'center', marginBottom: 12 },
  coverDivider: { width: 60, height: 3, backgroundColor: '#FF6B6B', borderRadius: 2, marginBottom: 12 },
  coverMoral: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginBottom: 24 },
  coverImage: { width: '90%', height: 200, borderRadius: 16 },

  // Story page
  storyPage: { flex: 1, flexDirection: 'column' },
  pageLeft: { flex: 1, backgroundColor: '#FAFAFA', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  pageIllustration: { width: '100%', height: '100%' },
  pageNumberBadge: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: '#FF6B6B', width: 30, height: 30,
    borderRadius: 15, alignItems: 'center', justifyContent: 'center',
  },
  pageNumberText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  pageRight: { flex: 1, padding: 20, backgroundColor: '#fff' },
  pageRoleLabel: { fontSize: 12, color: '#FF6B6B', fontWeight: '800', letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' },
  pageText: { fontSize: 16, color: '#2D2D2D', lineHeight: 26 },

  // End page
  endPage: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: '#FFF8EE' },
  endTrophy: { fontSize: 56, marginBottom: 12 },
  endTitle: { fontSize: 32, fontWeight: '900', color: '#2D2D2D', marginBottom: 14 },
  endMsg: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 24, marginBottom: 28 },
  endChildName: { color: '#FF6B6B', fontWeight: '800' },
  endMoral: { color: '#FFB347', fontWeight: '800' },
  endActions: { width: '100%', gap: 12 },
  btnBuy: {
    backgroundColor: '#FF6B6B', borderRadius: 30, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  btnBuyText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  btnShare: { backgroundColor: '#fff', borderRadius: 30, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#E8E8E8' },
  btnShareText: { color: '#555', fontWeight: '700', fontSize: 15 },
  btnNew: { backgroundColor: '#FFF8EE', borderRadius: 30, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#FFD93D' },
  btnNewText: { color: '#FFB347', fontWeight: '700', fontSize: 15 },

  // Nav
  navButtons: { flexDirection: 'row', justifyContent: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  navBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 30, paddingVertical: 13, alignItems: 'center', borderWidth: 1.5, borderColor: '#E8E8E8' },
  navBtnNext: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  navBtnText: { color: '#555', fontWeight: '700', fontSize: 15 },
  navBtnNextText: { color: '#fff' },

  // Dots
  pageDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 24 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#E0E0E0' },
  dotActive: { backgroundColor: '#FF6B6B', width: 18 },

  // Shared
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' },
  placeholderEmoji: { fontSize: 28, marginBottom: 8 },
  placeholderText: { fontSize: 13, color: '#aaa' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: '#fff', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center' },
  modalIcon: { fontSize: 40, marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#2D2D2D', textAlign: 'center', marginBottom: 8 },
  modalDesc: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 14, lineHeight: 20 },
  modalPrice: { fontSize: 32, fontWeight: '900', color: '#FF6B6B', marginBottom: 14 },
  modalPriceSub: { fontSize: 14, color: '#aaa', fontWeight: '400' },
  modalFeatures: { width: '100%', gap: 6, marginBottom: 20 },
  modalFeature: { fontSize: 14, color: '#444', lineHeight: 20 },
  modalOrderBtn: {
    backgroundColor: '#FF6B6B', borderRadius: 30, paddingVertical: 15,
    paddingHorizontal: 32, width: '100%', alignItems: 'center', marginBottom: 10,
  },
  modalOrderText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  modalMaybeBtn: { paddingVertical: 10 },
  modalMaybeText: { color: '#aaa', fontSize: 14 },
  shareButtons: { width: '100%', gap: 10, marginBottom: 16 },
  shareBtn: { borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1.5 },
  shareCopy: { borderColor: '#E8E8E8', backgroundColor: '#FAFAFA' },
  shareWhatsapp: { borderColor: '#25D366', backgroundColor: '#F0FFF4' },
  shareEmail: { borderColor: '#4D96FF', backgroundColor: '#EEF4FF' },
  shareBtnText: { fontWeight: '700', fontSize: 14, color: '#333' },
  modalCloseBtn: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 30, borderWidth: 1.5, borderColor: '#E8E8E8' },
  modalCloseText: { color: '#888', fontWeight: '600', fontSize: 14 },
});