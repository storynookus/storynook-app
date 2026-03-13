import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import StoryBook from "./pages/StoryBook";
import LoadingPage from "./pages/LoadingPage";
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [storyData, setStoryData] = useState(null);
  const [formData, setFormData] = useState(null);

  const handleGenerate = async (data) => {
    setFormData(data);
    setScreen("loading");
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
    setScreen("landing");
    setStoryData(null);
    setFormData(null);
  };

  return (
    <div className="app">
      {screen === "landing" && <LandingPage onGenerate={handleGenerate} />}
      {screen === "loading" && <LoadingPage childName={formData?.childName} />}
      {screen === "storybook" && <StoryBook story={storyData} onRestart={handleRestart} />}
    </div>
  );
}
