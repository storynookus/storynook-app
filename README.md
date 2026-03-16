# ✨ StoryNook — Every Child Deserves to Be the Hero

> AI-powered personalized storybooks built for the **Google Gemini Live Agent Challenge 2026** — Creative Storyteller Track.

🌐 **Live Demo:** https://storyspark-frontend-393907506265.us-central1.run.app

---

## 🌟 What is StoryNook?

StoryNook creates truly personalized AI-generated storybooks where your child is the hero — with illustrations that actually look like them. Parents upload a photo, select interests and a life lesson, and StoryNook generates a beautiful illustrated storybook in minutes.

### Key Features
- 📸 **Photo-personalized characters** — Gemini analyzes the child's photo and creates a consistent Pixar-style cartoon character matching their exact features
- 👨‍👩‍👧‍👦 **Multi-kid support** — siblings and friends can all be heroes together
- 🎨 **Imagen 4 illustrations** — one per page, consistent character across all pages
- 💡 **Moral lesson weaving** — kindness, sharing, courage woven naturally into narrative
- 🌍 **Multilingual** — 7 languages including Arabic, Urdu, Mandarin
- 📚 **7-15 page stories** — adjustable length slider
- 🖨️ **Physical book ordering** option

---

## 🏗️ Architecture

```
User (Browser)
    ↓
Cloud Run Frontend (React)
    ↓
Cloud Run Backend (Flask API)
    ↓                    ↓
Gemini 2.5 Flash    Imagen 4
(Vertex AI)         (Vertex AI)
Story + Character   Illustrations
Description         Per Page
```

**Google Cloud Services:**
- ✅ Cloud Run (frontend + backend hosting)
- ✅ Vertex AI — Gemini 2.5 Flash (story generation + multimodal photo analysis)
- ✅ Vertex AI — Imagen 4 (illustration rendering with person generation)
- ✅ Cloud Build (CI/CD)
- ✅ Cloud Storage (assets)

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.11+
- Google Cloud SDK
- GCP project with Vertex AI enabled

## 🧪 Quick Test for Judges

**Use the live app directly — no setup needed:**
👉 https://storyspark-frontend-393907506265.us-central1.run.app

**Test photos are included in `/demo-assets/` folder:**
- `maya-test-photo.jpg` — Maya (already set up in the demo)
- `leo-test-photo.jpg` — Leo (add as a second child to test multi-kid stories)

**Suggested test flow:**
1. Visit the live URL above
2. Click "Start Your Story"
3. Maya's profile is already set up — select her
4. Click "+ Add Another Child" → upload `leo-test-photo.jpg`, name "Leo", age 6
5. Select both Maya and Leo → "All together!"
6. Pick "Dinosaurs" as interest, "Kindness" as lesson
7. Hit "Create Maya & Leo's Story" and watch the magic! ✨

---

### 1. Clone the repo
```bash
git clone https://github.com/zafeerlambe/storyspark-ai.git
cd storyspark-ai
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export GCP_PROJECT="your-gcp-project-id"
export GCP_LOCATION="us-central1"
export GCS_BUCKET="your-bucket-name"

# Authenticate with GCP
gcloud auth application-default login

# Run backend
python main.py
# Backend runs at http://localhost:8080
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create env file
echo "VITE_API_URL=http://localhost:8080" > .env.local

# Run frontend
npm run dev
# Frontend runs at http://localhost:5173
```

### 4. Test it works
```bash
curl http://localhost:8080/health
# Should return: {"status":"ok","service":"StoryNook API"}
```

---

## ☁️ Deploy to Google Cloud (One Command)

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📹 Demo Video
[Watch the demo on YouTube](#)

---

## 🎯 Built for Google Gemini Live Agent Challenge 2026
**Track:** Creative Storyteller ✍️
**Hashtag:** #GeminiLiveAgentChallenge

*Created with Google Gemini 2.5 Flash, Imagen 4, and Google Cloud Run.*
