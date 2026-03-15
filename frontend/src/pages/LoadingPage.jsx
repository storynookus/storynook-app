import { useEffect, useState } from "react";
import "./LoadingPage.css";

const LOADING_MESSAGES = [
  "✨ Sprinkling magic on your story...",
  "🎨 Painting illustrations just for them...",
  "📖 Writing the perfect adventure...",
  "🌟 Making your child the hero...",
  "🦄 Adding a sprinkle of wonder...",
  "🎭 Setting the scene...",
  "🌈 Mixing the perfect colors...",
  "⭐ Almost ready for the big reveal...",
];

const BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 40 + 20,
  left: Math.random() * 90 + 5,
  duration: Math.random() * 4 + 3,
  delay: Math.random() * 5,
  color: ["#FFD93D","#FF6B6B","#6BCB77","#4D96FF","#C77DFF","#FFB347"][Math.floor(Math.random()*6)],
}));

export default function LoadingPage({ childName }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);
    const progInterval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 6, 92));
    }, 800);
    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, []);

  return (
    <div className="loading-page">
      {/* Bubbles */}
      <div className="bubbles-container">
        {BUBBLES.map(b => (
          <div key={b.id} className="bubble" style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            background: `radial-gradient(circle at 30% 30%, ${b.color}99, ${b.color}33)`,
            border: `2px solid ${b.color}66`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }} />
        ))}
      </div>

      <div className="loading-content">
        {/* Circular progress */}
        <div className="circle-progress-wrap">
          <svg className="circle-svg" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFD93D" />
                <stop offset="100%" stopColor="#FF6B6B" />
              </linearGradient>
            </defs>
          </svg>
          <div className="circle-inner">
            <div className="circle-percent">{Math.round(progress)}%</div>
            <div className="circle-emoji">✨</div>
          </div>
        </div>

        <h2 className="loading-title">
          Creating{" "}
          {childName
            ? <><span className="name-highlight">{childName}</span>'s</>
            : "Your Child's"
          }{" "}Story!
        </h2>

        <p className="loading-msg">{LOADING_MESSAGES[msgIndex]}</p>

        <div className="loading-steps">
          <div className={`step ${progress > 10 ? "step-done" : "step-active"}`}>
            <span>📝</span> Writing story
          </div>
          <div className={`step ${progress > 30 ? "step-done" : progress > 10 ? "step-active" : ""}`}>
            <span>🎨</span> Generating illustrations
          </div>
          <div className={`step ${progress > 90 ? "step-done" : progress > 30 ? "step-active" : ""}`}>
            <span>📚</span> Building your book
          </div>
        </div>
      </div>
    </div>
  );
}
