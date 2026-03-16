import { useEffect, useState, useRef } from "react";
import "./LoadingPage.css";

const LOADING_MESSAGES = [
  "✨ Sprinkling magic on your story...",
  "🎨 Painting illustrations just for them...",
  "📖 Writing the perfect adventure...",
  "🌟 Making your child the hero...",
  "🦄 Adding a sprinkle of wonder...",
  "🎭 Bringing characters to life...",
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

export default function LoadingPage({ childName, pageCount = 7 }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("writing"); // writing | illustrating | finalizing
  const progressRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  // Realistic timing:
  // 0-20%: Writing story (~5 seconds)
  // 20-90%: Generating illustrations (~5 seconds per page)
  // 90-100%: Finalizing (~3 seconds)
  const totalIllustrationTime = pageCount * 5000; // 5s per page
  const totalTime = 5000 + totalIllustrationTime + 3000;

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);

    const progInterval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      let newProgress;

      if (elapsed < 5000) {
        // Writing stage: 0-20%
        newProgress = (elapsed / 5000) * 20;
        setStage("writing");
      } else if (elapsed < 5000 + totalIllustrationTime) {
        // Illustration stage: 20-90%
        const illustrationElapsed = elapsed - 5000;
        newProgress = 20 + (illustrationElapsed / totalIllustrationTime) * 70;
        setStage("illustrating");
      } else {
        // Finalizing: 90-99%
        const finalElapsed = elapsed - 5000 - totalIllustrationTime;
        newProgress = Math.min(90 + (finalElapsed / 3000) * 9, 99);
        setStage("finalizing");
      }

      progressRef.current = newProgress;
      setProgress(Math.round(newProgress));
    }, 200);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, [pageCount]);

  const stageLabel = {
    writing: "✍️ Writing your story...",
    illustrating: `🎨 Painting illustrations (${pageCount} pages)...`,
    finalizing: "📚 Putting it all together...",
  }[stage];

  return (
    <div className="loading-page">
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
        <div className="circle-progress-wrap">
          <svg className="circle-svg" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 0.2s ease" }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFD93D" />
                <stop offset="100%" stopColor="#FF6B6B" />
              </linearGradient>
            </defs>
          </svg>
          <div className="circle-inner">
            <div className="circle-percent">{progress}%</div>
            <div className="circle-emoji">✨</div>
          </div>
        </div>

        <h2 className="loading-title">
          Creating{" "}
          {childName ? <><span className="name-highlight">{childName}</span>'s</> : "Your Child's"}{" "}
          Story!
        </h2>

        <p className="loading-stage">{stageLabel}</p>
        <p className="loading-msg">{LOADING_MESSAGES[msgIndex]}</p>

        <div className="loading-steps">
          <div className={`step ${stage !== "writing" ? "step-done" : "step-active"}`}>
            <span>📝</span> Writing story
          </div>
          <div className={`step ${stage === "finalizing" ? "step-done" : stage === "illustrating" ? "step-active" : ""}`}>
            <span>🎨</span> Generating {pageCount} illustrations
          </div>
          <div className={`step ${stage === "finalizing" ? "step-active" : ""}`}>
            <span>📚</span> Building your book
          </div>
        </div>
      </div>
    </div>
  );
}
