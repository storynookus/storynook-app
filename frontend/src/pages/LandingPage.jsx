import { useState, useRef } from "react";
import "./LandingPage.css";

const MORAL_OPTIONS = [
  { key: "sharing", emoji: "🤝", label: "Sharing" },
  { key: "kindness", emoji: "💛", label: "Kindness" },
  { key: "brushing_teeth", emoji: "🦷", label: "Brushing Teeth" },
  { key: "collaboration", emoji: "🌟", label: "Teamwork" },
  { key: "courage", emoji: "🦁", label: "Courage" },
  { key: "honesty", emoji: "✨", label: "Honesty" },
  { key: "patience", emoji: "🌱", label: "Patience" },
];

const LANGUAGES = ["English", "Spanish", "French", "Arabic", "Urdu", "Mandarin", "Hindi"];

const INTERESTS_SUGGESTIONS = [
  "🦕 Dinosaurs", "🚀 Space", "🧜 Mermaids", "🦸 Superheroes",
  "🐉 Dragons", "🏔️ Mountains", "🌊 Ocean", "🦋 Nature",
  "⚽ Sports", "🎨 Art", "🎵 Music", "🍕 Food Adventures"
];

export default function LandingPage({ selectedKids = [], onGenerate, onBack }) {
  const isMultiKid = selectedKids.length > 1;
  const names = selectedKids.map(k => k.name).join(" & ");

  // Per-kid photo state
  const [kidPhotos, setKidPhotos] = useState(
    selectedKids.reduce((acc, kid) => ({
      ...acc,
      [kid.id]: { photo: kid.photo || null, photoPreview: kid.photoPreview || null }
    }), {})
  );

  const [interests, setInterests] = useState("");
  const [selectedMoral, setSelectedMoral] = useState("kindness");
  const [customLesson, setCustomLesson] = useState("");
  const [language, setLanguage] = useState("English");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [pageCount, setPageCount] = useState(7);
  const fileRefs = useRef({});

  const handlePhotoChange = (kidId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setKidPhotos(prev => ({
        ...prev,
        [kidId]: {
          photoPreview: ev.target.result,
          photo: ev.target.result.split(",")[1]
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const toggleInterest = (interest) => {
    const clean = interest.replace(/^[^\s]+\s/, "");
    if (selectedInterests.includes(clean)) {
      setSelectedInterests(selectedInterests.filter(i => i !== clean));
    } else {
      setSelectedInterests([...selectedInterests, clean]);
    }
  };

  const handleSubmit = () => {
    const allInterests = [
      ...selectedInterests,
      ...(interests ? [interests] : [])
    ].join(", ") || "adventure and friendship";

    // Use first kid's photo for story generation, combine names
    const primaryKid = selectedKids[0];
    const primaryPhoto = kidPhotos[primaryKid.id];

    onGenerate({
      childName: names,
      childAge: primaryKid.age,
      interests: allInterests,
      moral: selectedMoral,
      customPrompt: customLesson,
      language,
      photoBase64: primaryPhoto?.photo || null,
      pageCount,
      kidsData: selectedKids.map(kid => ({
        name: kid.name,
        age: kid.age,
        photo: kidPhotos[kid.id]?.photo || kid.photo || null,
      })),
    });
  };

  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 12 + 6,
    left: Math.random() * 100,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 10,
    color: ["#FFD93D","#FF6B6B","#6BCB77","#4D96FF","#C77DFF"][Math.floor(Math.random()*5)],
  }));

  return (
    <div className="landing">
      <div className="stars-bg">
        {stars.map(s => (
          <div key={s.id} className="star" style={{
            width: s.size, height: s.size,
            left: `${s.left}%`,
            bottom: `-20px`,
            top: `auto`,
            background: s.color,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }} />
        ))}
      </div>
      <div className="landing-content">
        <div className="landing-back-row">
          <button className="landing-back-btn" onClick={onBack}>← Change reader</button>
        </div>

        {/* Hero */}
        <div className="hero fade-in-up">
          <div className="hero-badge">✨ AI-Powered Storytelling</div>
          <h1 className="hero-title">
            <span className="title-your">{names}</span>
            <span className="title-is"> {isMultiKid ? "are" : "is"} the</span>
            <br />
            <span className="title-hero">Hero{isMultiKid ? "es" : ""} ⭐</span>
          </h1>
          <p className="hero-subtitle">
            Create a magical, personalized storybook in seconds.
          </p>
        </div>

        <div className="form-card fade-in-up" style={{ animationDelay: "0.2s" }}>

          {/* Per-kid photo sections */}
          {selectedKids.map(kid => (
            <div className="section" key={kid.id}>
              <label className="field-label">
                📸 {kid.name}'s Photo <span className="optional">(optional)</span>
              </label>
              <div className="photo-upload" onClick={() => fileRefs.current[kid.id]?.click()}>
                {kidPhotos[kid.id]?.photoPreview ? (
                  <div className="photo-preview-wrap">
                    <img src={kidPhotos[kid.id].photoPreview} alt={kid.name} className="photo-preview" />
                    <div className="photo-overlay">Add New Photo</div>
                  </div>
                ) : (
                  <div className="photo-placeholder">
                    <div className="photo-icon">📸</div>
                    <div className="photo-text">Add a new photo of {kid.name}</div>
                    <div className="photo-subtext">Makes illustrations look like {kid.name}!</div>
                  </div>
                )}
              </div>
              <input
                ref={el => fileRefs.current[kid.id] = el}
                type="file"
                accept="image/*"
                onChange={e => handlePhotoChange(kid.id, e)}
                style={{ display: "none" }}
              />

              {/* Name + Age per kid */}
              <div className="row-2" style={{ marginTop: "12px" }}>
                <div className="field">
                  <label className="field-label" style={{ fontSize: "0.85rem" }}>✏️ Name</label>
                  <input className="field-input" value={kid.name} readOnly style={{ background: "#F5F5F5" }} />
                </div>
                <div className="field">
                  <label className="field-label" style={{ fontSize: "0.85rem" }}>🎂 Age</label>
                  <input className="field-input" value={`${kid.age} years old`} readOnly style={{ background: "#F5F5F5" }} />
                </div>
              </div>
            </div>
          ))}

          {/* Interests */}
          <div className="section">
            <label className="field-label">
              🌟 What do {names} love? <span className="optional">scroll to pick any</span>
            </label>
            <div className="conveyor-wrap">
              <div className="conveyor-track">
                <div className="conveyor-belt">
                  {[...INTERESTS_SUGGESTIONS, ...INTERESTS_SUGGESTIONS, ...INTERESTS_SUGGESTIONS].map((interest, idx) => {
                    const clean = interest.replace(/^[^\s]+\s/, "");
                    return (
                      <button
                        key={idx}
                        className={`conveyor-item ${selectedInterests.includes(clean) ? "conveyor-active" : ""}`}
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <input
              className="field-input"
              style={{ marginTop: "12px" }}
              placeholder="Or type something custom... (e.g. trains, ballet, cooking)"
              value={interests}
              onChange={e => setInterests(e.target.value)}
            />
          </div>

          {/* Moral Lesson */}
          <div className="section">
            <label className="field-label">💡 Story Lesson <span className="optional">scroll to pick one</span></label>
            <div className="conveyor-wrap">
              <div className="conveyor-track">
                <div className="conveyor-belt conveyor-slow">
                  {[...MORAL_OPTIONS, ...MORAL_OPTIONS, ...MORAL_OPTIONS].map((m, idx) => (
                    <button
                      key={idx}
                      className={`conveyor-item conveyor-moral ${selectedMoral === m.key ? "conveyor-active" : ""}`}
                      onClick={() => setSelectedMoral(m.key)}
                    >
                      <span className="conveyor-emoji">{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <input
              className="field-input"
              style={{ marginTop: "12px" }}
              placeholder="Or type your own lesson... (e.g. 'respecting elders')"
              value={customLesson}
              onChange={e => setCustomLesson(e.target.value)}
            />
          </div>

          {/* Language */}
          <div className="section">
            <label className="field-label">🌍 Story Language <span className="optional">scroll to pick one</span></label>
            <div className="conveyor-wrap">
              <div className="conveyor-track">
                <div className="conveyor-belt conveyor-reverse">
                  {[...LANGUAGES, ...LANGUAGES, ...LANGUAGES].map((lang, idx) => (
                    <button
                      key={idx}
                      className={`conveyor-item ${language === lang ? "conveyor-active" : ""}`}
                      onClick={() => setLanguage(lang)}
                    >
                      🌍 {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Page Slider */}
          <div className="section">
            <label className="field-label">
              📚 Story Length <span className="optional">— {pageCount} pages</span>
            </label>
            <div className="slider-wrap">
              <span className="slider-label">7</span>
              <input
                type="range" min="7" max="15" value={pageCount}
                onChange={e => setPageCount(Number(e.target.value))}
                className="page-slider"
              />
              <span className="slider-label">15</span>
            </div>
            <div className="slider-hint">
              {pageCount === 7 && "⚡ Quick bedtime story"}
              {pageCount >= 8 && pageCount <= 10 && "📖 Perfect length"}
              {pageCount >= 11 && pageCount <= 13 && "🌟 Extended adventure"}
              {pageCount >= 14 && "🏆 Epic tale!"}
            </div>
          </div>

          {/* Submit */}
          <button className="btn-generate" onClick={handleSubmit}>
            <span className="btn-generate-icon">✨</span>
            Create {names}'s Story
            <span className="btn-generate-icon">📖</span>
          </button>
        </div>

        <div className="trust-row fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="trust-item">🎨 AI-generated illustrations</div>
          <div className="trust-item">📚 {pageCount} magical pages</div>
          <div className="trust-item">🖨️ Order a physical copy</div>
        </div>
      </div>
    </div>
  );
}
