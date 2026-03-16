import { useState, useEffect } from "react";
import { getKids } from "./kidsService";
import OnboardingPage from "./pages/OnboardingPage";
import WelcomePage from "./pages/WelcomePage";
import KidSelectorPage from "./pages/KidSelectorPage";
import LandingPage from "./pages/LandingPage";
import StoryBook from "./pages/StoryBook";
import LoadingPage from "./pages/LoadingPage";
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState("loading_app");
  const [hasVisited, setHasVisited] = useState(false);
  const [kids, setKids] = useState([]);
  const [selectedKids, setSelectedKids] = useState([]);
  const [storyData, setStoryData] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const savedKids = await getKids();
      setKids(savedKids);
      const visited = localStorage.getItem("storyspark_visited");
      if (!visited) {
        setScreen("welcome");
      } else if (savedKids.length === 0) {
        setScreen("onboarding");
      } else {
        setScreen("kid_selector");
      }
    } catch (err) {
      console.error("Init error:", err);
      setScreen("onboarding");
    }
  };

  const handleGetStarted = () => {
    localStorage.setItem("storyspark_visited", "true");
    setScreen("onboarding");
  };

  const handleOnboardingDone = async () => {
    const updatedKids = await getKids();
    setKids(updatedKids);
    setScreen("kid_selector");
  };

  const handleKidSelected = (selected) => {
    setSelectedKids(selected);
    setScreen("landing");
  };

  const handleGenerate = async (data) => {
    setFormData(data);
    setScreen("loading_story");
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const res = await fetch(`${API_URL}/api/generate-story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setStoryData(result);
        setScreen("storybook");
      } else {
        alert("Story generation failed: " + result.error);
        setScreen("landing");
      }
    } catch (err) {
      alert("Connection error: " + err.message);
      setScreen("landing");
    }
  };

  const handleRestart = () => {
    setScreen("kid_selector");
    setStoryData(null);
    setFormData(null);
    setSelectedKids([]);
  };

  if (screen === "loading_app") {
    return (
      <div className="app" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "linear-gradient(160deg, #1a0a2e, #2d1b4e)"
      }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>✨</div>
          <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: "1.5rem", fontWeight: 800 }}>
            StorySpark
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {screen === "welcome" && (
        <WelcomePage onGetStarted={handleGetStarted} />
      )}
      {screen === "onboarding" && (
        <OnboardingPage
          onDone={handleOnboardingDone}
          hasKids={kids.length > 0}
          onBack={() => setScreen("kid_selector")}
        />
      )}
      {screen === "kid_selector" && (
        <KidSelectorPage
          kids={kids}
          onSelect={handleKidSelected}
          onAddKid={() => setScreen("onboarding")}
          onKidsUpdated={setKids}
        />
      )}
      {screen === "landing" && (
        <LandingPage
          selectedKids={selectedKids}
          onGenerate={handleGenerate}
          onBack={() => setScreen("kid_selector")}
        />
      )}
      {screen === "loading_story" && (
        <LoadingPage childName={formData?.childName} />
      )}
      {screen === "storybook" && (
        <StoryBook story={storyData} onRestart={handleRestart} />
      )}
    </div>
  );
}
