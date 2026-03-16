import "./WelcomePage.css";

export default function WelcomePage({ onGetStarted }) {
  return (
    <div className="welcome">
      {/* Floating particles */}
      <div className="welcome-particles">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="particle" style={{
            width: Math.random() * 12 + 6,
            height: Math.random() * 12 + 6,
            left: `${Math.random() * 100}%`,
            bottom: `-20px`,
            background: ["#FFD93D","#FF6B6B","#6BCB77","#4D96FF","#C77DFF","#FFB347"][Math.floor(Math.random()*6)],
            animationDuration: `${Math.random()*12+8}s`,
            animationDelay: `${Math.random()*8}s`,
          }} />
        ))}
      </div>

      <div className="welcome-content">
        {/* Logo */}
        <div className="welcome-logo">
          <span className="welcome-logo-icon">✨</span>
          <span className="welcome-logo-text">StorySpark</span>
        </div>

        {/* Hero */}
        <h1 className="welcome-title">
          Every child deserves<br />
          <span className="welcome-title-highlight">to be the hero</span>
        </h1>

        <p className="welcome-subtitle">
          AI-powered personalized storybooks where your child is the star —
          with illustrations that actually look like them.
        </p>

        {/* How it works */}
        <div className="welcome-steps">
          <div className="welcome-step">
            <div className="welcome-step-icon">📸</div>
            <div className="welcome-step-text">
              <div className="welcome-step-title">Add your child</div>
              <div className="welcome-step-desc">Upload a photo and tell us about them</div>
            </div>
          </div>
          <div className="welcome-step-arrow">→</div>
          <div className="welcome-step">
            <div className="welcome-step-icon">✨</div>
            <div className="welcome-step-text">
              <div className="welcome-step-title">AI generates</div>
              <div className="welcome-step-desc">Gemini writes a story, Imagen paints it</div>
            </div>
          </div>
          <div className="welcome-step-arrow">→</div>
          <div className="welcome-step">
            <div className="welcome-step-icon">📚</div>
            <div className="welcome-step-text">
              <div className="welcome-step-title">Read together</div>
              <div className="welcome-step-desc">A magical book just for your family</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button className="welcome-cta" onClick={onGetStarted}>
          Start Your Story ✨
        </button>

        <p className="welcome-note">
          Free to try · No account required · Powered by Google Gemini & Imagen
        </p>
      </div>
    </div>
  );
}
