import { useState, useRef } from "react";
import "./StoryBook.css";

const PAGE_ROLES = {
  1: "🌅 Once Upon a Time...",
  2: "🌟 The Adventure Begins",
  3: "⚡ A Challenge Appears",
  4: "💥 The Big Moment!",
  5: "🔑 Finding the Way",
  6: "🌈 Victory!",
  7: "🏆 Happily Ever After",
};

export default function StoryBook({ story, onRestart }) {
  const [currentPage, setCurrentPage] = useState(0); // 0 = cover
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState("next");
  const [kidInput, setKidInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const recognitionRef = useRef(null);

  const pages = story?.story || [];
  const totalPages = pages.length;
  const isCover = currentPage === 0;
  const isEnd = currentPage === totalPages + 1;

  const goTo = (dir) => {
    if (flipping) return;
    setFlipDir(dir);
    setFlipping(true);
    setTimeout(() => {
      if (dir === "next") setCurrentPage(p => Math.min(p + 1, totalPages + 1));
      else setCurrentPage(p => Math.max(p - 1, 0));
      setFlipping(false);
    }, 350);
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input not supported in this browser. Please type your idea!");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = story?.language === "Spanish" ? "es-ES" : "en-US";
    rec.onresult = (e) => {
      setKidInput(e.results[0][0].transcript);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  };

  const currentPageData = pages[currentPage - 1];

  return (
    <div className="storybook-page">
      {/* Header */}
      <div className="sb-header">
        <button className="sb-back-btn" onClick={onRestart}>← New Story</button>
        <div className="sb-title">
          ⭐ {story?.childName}'s Story
        </div>
        <div className="sb-page-counter">
          {isCover ? "Cover" : isEnd ? "The End" : `Page ${currentPage} of ${totalPages}`}
        </div>
      </div>

      {/* Book */}
      <div className="book-stage">
        <div className={`book-spread ${flipping ? (flipDir === "next" ? "flip-next" : "flip-prev") : ""}`}>

          {/* Cover */}
          {isCover && (
            <div className="book-spread-inner cover-page">
              <div className="cover-bg">
                <div className="cover-stars">
                  {[...Array(12)].map((_, i) => (
                    <span key={i} className="cover-star" style={{
                      top: `${Math.random() * 80}%`,
                      left: `${Math.random() * 90}%`,
                      animationDelay: `${Math.random() * 2}s`
                    }}>⭐</span>
                  ))}
                </div>
                <div className="cover-content">
                  <div className="cover-subtitle">A Magical Story About</div>
                  <div className="cover-hero-name">{story?.childName}</div>
                  <div className="cover-divider" />
                  <div className="cover-moral">
                    Learning about {story?.moral?.replace(/_/g, " ")} ✨
                  </div>
                  {pages[0]?.image_base64 && (
                    <img
                      src={`data:image/png;base64,${pages[0].image_base64}`}
                      alt="Story cover"
                      className="cover-image"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Story Pages */}
          {!isCover && !isEnd && currentPageData && (
            <div className="book-spread-inner story-page">
              {/* Left — illustration */}
              <div className="page-left">
                {currentPageData.image_base64 ? (
                  <img
                    src={`data:image/png;base64,${currentPageData.image_base64}`}
                    alt={`Page ${currentPage}`}
                    className="page-illustration"
                  />
                ) : (
                  <div className="page-illustration-placeholder">
                    <div className="illus-loading">🎨</div>
                    <div>Illustration generating...</div>
                  </div>
                )}
                <div className="page-number-badge">{currentPage}</div>
              </div>

              {/* Right — text */}
              <div className="page-right">
                <div className="page-role-label">{PAGE_ROLES[currentPage]}</div>
                <p className="page-text">{currentPageData.text}</p>

                {/* Kid co-creation on pages 3-5 */}
                {currentPage >= 3 && currentPage <= 5 && (
                  <div className="cocreate-section">
                    <div className="cocreate-label">🎤 What happens next, {story?.childName}?</div>
                    <div className="cocreate-input-row">
                      <input
                        className="cocreate-input"
                        placeholder="Type or speak your idea..."
                        value={kidInput}
                        onChange={e => setKidInput(e.target.value)}
                      />
                      <button
                        className={`mic-btn ${isListening ? "mic-active" : ""}`}
                        onClick={startListening}
                      >
                        {isListening ? "🔴" : "🎤"}
                      </button>
                    </div>
                    {kidInput && (
                      <div className="cocreate-idea">
                        💭 Great idea: "{kidInput}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* End Page */}
          {isEnd && (
            <div className="book-spread-inner end-page">
              <div className="end-content">
                <div className="end-trophy">🏆</div>
                <h2 className="end-title">The End!</h2>
                <p className="end-msg">
                  {story?.childName} learned that <strong>{story?.moral?.replace(/_/g, " ")}</strong> makes the world a better place. ✨
                </p>

                <div className="end-actions">
                  <button className="btn-buy" onClick={() => setShowBuyModal(true)}>
                    📚 Buy Physical Book — $25
                  </button>
                  <button className="btn-share" onClick={() => setShowShareModal(true)}>
                    📤 Share Story
                  </button>
                  <button className="btn-new" onClick={onRestart}>
                    ✨ Create Another Story
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="nav-buttons">
          {!isCover && (
            <button className="nav-btn nav-prev" onClick={() => goTo("prev")}>
              ← Prev
            </button>
          )}
          {!isEnd && (
            <button className="nav-btn nav-next" onClick={() => goTo("next")}>
              {isCover ? "Open Book ✨" : "Next →"}
            </button>
          )}
        </div>

        {/* Page dots */}
        <div className="page-dots">
          {[0, ...pages.map((_, i) => i + 1), totalPages + 1].map((p) => (
            <div
              key={p}
              className={`dot ${currentPage === p ? "dot-active" : ""}`}
              onClick={() => !flipping && setCurrentPage(p)}
            />
          ))}
        </div>
      </div>

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="modal-overlay" onClick={() => setShowBuyModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">📚</div>
            <h3>Order {story?.childName}'s Book!</h3>
            <p>A beautifully printed hardcover storybook delivered to your door.</p>
            <div className="modal-price">$25 <span>+ shipping</span></div>
            <div className="modal-features">
              <div>✅ High-quality hardcover print</div>
              <div>✅ Full color AI illustrations</div>
              <div>✅ Delivered in 5-7 days</div>
              <div>✅ Perfect gift for any occasion</div>
            </div>
            <button className="btn-primary" style={{width:"100%", marginTop:"20px"}}>
              Order Now — $25
            </button>
            <button className="modal-close" onClick={() => setShowBuyModal(false)}>
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">📤</div>
            <h3>Share {story?.childName}'s Story!</h3>
            <p>Share this magical story with family and friends.</p>
            <div className="share-buttons">
              <button className="share-btn share-copy">📋 Copy Link</button>
              <button className="share-btn share-whatsapp">💬 WhatsApp</button>
              <button className="share-btn share-email">📧 Email</button>
            </div>
            <button className="modal-close" onClick={() => setShowShareModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
