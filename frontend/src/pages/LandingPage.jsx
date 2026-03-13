import { useState, useRef, useEffect } from "react";
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

export default function LandingPage({ onGenerate }) {
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("5");
  const [interests, setInterests] = useState("");
  const [selectedMoral, setSelectedMoral] = useState("kindness");
  const [customPrompt, setCustomPrompt] = useState("");
  const [language, setLanguage] = useState("English");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const fileRef = useRef();

  // Generate floating stars
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 12 + 6,
    left: Math.random() * 100,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 10,
    color: ["#FFD93D", "#FF6B6B", "#6BCB77", "#4D96FF", "#C77DFF"][Math.floor(Math.random() * 5)],
  }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result);
      // Strip data:image/...;base64, prefix
      const base64 = ev.target.result.split(",")[1];
      setPhoto(base64);
    };
    reader.readAsDataURL(file);
  };

  const toggleInterest = (interest) => {
    const clean = interest.replace(/^[^\s]+\s/, ""); // remove emoji
    if (selectedInterests.includes(clean)) {
      setSelectedInterests(selectedInterests.filter(i => i !== clean));
    } else {
      setSelectedInterests([...selectedInterests, clean]);
    }
  };

  const handleSubmit = () => {
    if (!childName.trim()) {
      alert("Please enter your child's name! ✨");
      return;
    }
    const allInterests = [
      ...selectedInterests,
      ...(interests ? [interests] : [])
    ].join(", ") || "adventure and friendship";

    onGenerate({
      childName: childName.trim(),
      childAge,
      interests: allInterests,
      moral: selectedMoral,
      customPrompt,
      language,
      photoBase64: photo,
    });
  };

  return (
    <div className="landing">
      {/* Floating background */}
      <div className="stars-bg">
        {stars.map(s => (
          <div key={s.id} className="star" style={{
            width: s.size, height: s.size,
            left: `${s.left}%`,
            background: s.color,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }} />
        ))}
      </div>

      <div className="landing-content">
        {/* Hero */}
        <div className="hero fade-in-up">
          <div className="hero-badge">✨ AI-Powered Storytelling</div>
          <h1 className="hero-title">
            <span className="title-your">Your child</span>
            <span className="title-is"> is the</span>
            <br />
            <span className="title-hero">Hero ⭐</span>
          </h1>
          <p className="hero-subtitle">
            Create a magical, personalized storybook in seconds — with your child as the star of every page.
          </p>
        </div>

        {/* Form Card */}
        <div className="form-card fade-in-up" style={{ animationDelay: "0.2s" }}>

          {/* Photo Upload */}
          <div className="section">
            <div className="photo-upload" onClick={() => fileRef.current.click()}>
              {photoPreview ? (
                <div className="photo-preview-wrap">
                  <img src={photoPreview} alt="Child" className="photo-preview" />
                  <div className="photo-overlay">Change Photo</div>
                </div>
              ) : (
                <div className="photo-placeholder">
                  <div className="photo-icon">📸</div>
                  <div className="photo-text">Add a photo of your child</div>
                  <div className="photo-subtext">Optional — makes illustrations more personal</div>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
          </div>

          {/* Name + Age */}
          <div className="section row-2">
            <div className="field">
              <label className="field-label">✏️ Child's Name</label>
              <input
                className="field-input"
                placeholder="e.g. Zara, Leo, Maya..."
                value={childName}
                onChange={e => setChildName(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">🎂 Age</label>
              <select
                className="field-input"
                value={childAge}
                onChange={e => setChildAge(e.target.value)}
              >
                {[3,4,5,6,7,8,9,10].map(a => (
                  <option key={a} value={a}>{a} years old</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interests - Conveyor Belt */}
          <div className="section">
            <label className="field-label">🌟 What do they love? <span className="optional">scroll to pick any</span></label>
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

          {/* Moral Lesson - Conveyor Belt */}
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
              placeholder="Or type your own lesson... (e.g. 'respecting elders' or 'trying new foods')"
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
            />
          </div>

          {/* Language - Conveyor Belt */}
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

          {/* Submit */}
          <button className="btn-generate" onClick={handleSubmit}>
            <span className="btn-generate-icon">✨</span>
            Create {childName ? `${childName}'s` : "Their"} Story
            <span className="btn-generate-icon">📖</span>
          </button>
        </div>

        {/* Trust badges */}
        <div className="trust-row fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="trust-item">🎨 AI-generated illustrations</div>
          <div className="trust-item">📚 7 magical pages</div>
          <div className="trust-item">🖨️ Order a physical copy</div>
        </div>
      </div>
    </div>
  );
}
