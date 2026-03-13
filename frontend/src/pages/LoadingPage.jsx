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

export default function LoadingPage({ childName }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);
    const progInterval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 8, 92));
    }, 800);
    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, []);

  return (
    <div className="loading-page">
      <div className="loading-content">
        <div className="book-animation">
          <div className="book">
            <div className="book-cover">
              <div className="book-star">⭐</div>
            </div>
          </div>
        </div>
        <h2 className="loading-title">
          Creating {childName ? <><span className="name-highlight">{childName}</span>'s</> : "Your Child's"} Story!
        </h2>
        <p className="loading-msg">{LOADING_MESSAGES[msgIndex]}</p>
        <div className="progress-bar-wrap">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-label">{Math.round(progress)}%</div>
        </div>
        <div className="loading-emojis">
          {["🦕","🚀","🌊","🦋","🐉","🌈","⭐","🎨"].map((e, i) => (
            <span key={i} className="float-emoji" style={{
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2 + i * 0.3}s`
            }}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
