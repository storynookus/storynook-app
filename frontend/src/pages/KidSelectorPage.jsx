import { useState } from "react";
import { deleteKid } from "../kidsService";
import "./KidSelectorPage.css";

export default function KidSelectorPage({ kids, onSelect, onAddKid, onKidsUpdated }) {
  const [selected, setSelected] = useState([]);

  const toggleKid = (kid) => {
    if (selected.find(k => k.id === kid.id)) {
      setSelected(selected.filter(k => k.id !== kid.id));
    } else {
      setSelected([...selected, kid]);
    }
  };

  const handleAll = () => {
    if (selected.length === kids.length) {
      setSelected([]);
    } else {
      setSelected([...kids]);
    }
  };

  const handleContinue = () => {
    if (selected.length === 0) {
      alert("Please select who we're reading to tonight!");
      return;
    }
    onSelect(selected);
  };

  const handleDelete = async (e, kidId) => {
    e.stopPropagation();
    if (!confirm("Remove this profile?")) return;
    await deleteKid(kidId);
    const updated = kids.filter(k => k.id !== kidId);
    onKidsUpdated(updated);
    setSelected(selected.filter(k => k.id !== kidId));
  };

  const allSelected = selected.length === kids.length && kids.length > 0;

  return (
    <div className="kid-selector">
      <div className="stars-bg">
        {Array.from({ length: 15 }, (_, i) => (
          <div key={i} className="star" style={{
            width: Math.random() * 10 + 6,
            height: Math.random() * 10 + 6,
            left: `${Math.random() * 100}%`,
            bottom: `-20px`,
            background: ["#FFD93D","#FF6B6B","#6BCB77","#4D96FF","#C77DFF"][Math.floor(Math.random()*5)],
            animationDuration: `${Math.random()*15+10}s`,
            animationDelay: `${Math.random()*10}s`,
          }} />
        ))}
      </div>

      <div className="ks-content">
        <div className="ks-header">
          <div className="ks-logo">✨ StoryNook</div>
        </div>

        <h1 className="ks-title">
          Who are we<br />
          <span className="ks-title-highlight">reading to tonight?</span>
        </h1>

        {/* All Kid Cards */}
        <div className="ks-kids-grid">
          {kids.map(kid => (
            <div
              key={kid.id}
              className={`ks-kid-card ${selected.find(k => k.id === kid.id) ? "ks-selected" : ""}`}
              onClick={() => toggleKid(kid)}
            >
              <button className="ks-delete-btn" onClick={(e) => handleDelete(e, kid.id)}>×</button>
              <div className="ks-kid-photo-wrap">
                {kid.photoPreview ? (
                  <img src={kid.photoPreview} alt={kid.name} className="ks-kid-photo" />
                ) : (
                  <div className="ks-kid-photo-placeholder">
                    {kid.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {selected.find(k => k.id === kid.id) && (
                  <div className="ks-check">✓</div>
                )}
              </div>
              <div className="ks-kid-name">{kid.name}</div>
              <div className="ks-kid-age">{kid.age} years old</div>
            </div>
          ))}
        </div>

        {/* All together option — show if 2+ kids */}
        {kids.length >= 2 && (
          <div
            className={`ks-both-card ${allSelected ? "ks-selected" : ""}`}
            onClick={handleAll}
          >
            <div className="ks-both-photos">
              {kids.map((kid, i) => (
                kid.photoPreview ? (
                  <img
                    key={kid.id}
                    src={kid.photoPreview}
                    alt={kid.name}
                    className="ks-both-photo"
                    style={{ marginLeft: i > 0 ? "-20px" : "0", zIndex: kids.length - i }}
                  />
                ) : (
                  <div
                    key={kid.id}
                    className="ks-both-photo-placeholder"
                    style={{ marginLeft: i > 0 ? "-20px" : "0", zIndex: kids.length - i }}
                  >
                    {kid.name.charAt(0)}
                  </div>
                )
              ))}
            </div>
            <div className="ks-both-text">
              <div className="ks-both-label">
                {allSelected ? "Everyone selected! 🎉" : `All together! 🎉`}
              </div>
              <div className="ks-both-names">
                {kids.map(k => k.name).join(", ")}
              </div>
            </div>
            {allSelected && <div className="ks-both-check">✓</div>}
          </div>
        )}

        {/* Actions */}
        <div className="ks-actions">
          <button
            className="ks-continue-btn"
            onClick={handleContinue}
            disabled={selected.length === 0}
          >
            {selected.length === 0
              ? "Select who's reading tonight"
              : `Start ${selected.map(k => k.name).join(" & ")}'s Story ✨`
            }
          </button>
          <button className="ks-add-btn" onClick={onAddKid}>
            + Add Another Child
          </button>
        </div>
      </div>
    </div>
  );
}
