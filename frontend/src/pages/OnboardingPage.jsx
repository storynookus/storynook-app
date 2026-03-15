import { useState, useRef } from "react";
import { saveKid } from "../kidsService";
import "./OnboardingPage.css";

export default function OnboardingPage({ onDone, hasKids, onBack }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("5");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result);
      setPhoto(ev.target.result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter your child's name!");
      return;
    }
    setSaving(true);
    try {
      await saveKid({ name: name.trim(), age, photo, photoPreview });
      onDone();
    } catch (err) {
      alert("Error saving profile: " + err.message);
    }
    setSaving(false);
  };

  return (
    <div className="onboarding">
      <div className="onboarding-content">
        {/* Header */}
        <div className="onboarding-header">
          {hasKids && (
            <button className="back-btn" onClick={onBack}>← Back</button>
          )}
          <div className="onboarding-badge">✨ StorySpark</div>
        </div>

        <h1 className="onboarding-title">
          Let's meet your<br />
          <span className="onboarding-highlight">little hero!</span>
        </h1>
        <p className="onboarding-subtitle">
          Add your child's profile to create personalized stories just for them.
        </p>

        <div className="onboarding-card">
          {/* Photo */}
          <div className="ob-photo-wrap" onClick={() => fileRef.current.click()}>
            {photoPreview ? (
              <div className="ob-photo-preview-wrap">
                <img src={photoPreview} alt="Child" className="ob-photo-preview" />
                <div className="ob-photo-overlay">Change Photo</div>
              </div>
            ) : (
              <div className="ob-photo-placeholder">
                <div className="ob-photo-icon">📸</div>
                <div className="ob-photo-text">Add a photo</div>
                <div className="ob-photo-sub">Optional but makes illustrations magical!</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />

          {/* Name */}
          <div className="ob-field">
            <label className="ob-label">✏️ Child's Name</label>
            <input
              className="ob-input"
              placeholder="e.g. Amaya, Zeb, Leo..."
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Age */}
          <div className="ob-field">
            <label className="ob-label">🎂 Age</label>
            <select className="ob-input" value={age} onChange={e => setAge(e.target.value)}>
              {[2,3,4,5,6,7,8,9,10,11,12].map(a => (
                <option key={a} value={a}>{a} years old</option>
              ))}
            </select>
          </div>

          {/* Save */}
          <button className="ob-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : `Add ${name || "Child"} ✨`}
          </button>
        </div>
      </div>
    </div>
  );
}
