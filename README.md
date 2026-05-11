# PageForge — AI Landing Page Generator

> **One sentence → full, styled landing page.** Built by Smarya Narang.

**[Live Demo](https://pageforge.vercel.app)**

Type a single sentence describing your product. Groq AI generates a complete, downloadable landing page with unique branding, copy, and color palette — every time.

---

## ✦ Features

- 🎨 **Unique brand identity** — name, tagline, color palette, Google Font
- 📄 **Full landing page** — hero, features, testimonials, pricing
- 💾 **Download HTML** — zero dependencies, works offline
- 🗂️ **Gallery** — browse all past generations (stored locally)
- 🔒 **Secure** — API key never leaves the backend; IP rate limiting included

---

## 🗂 Project Structure

```
pageforge/
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── App.jsx             # Root with routing
│   │   ├── pages/
│   │   │   ├── Generator.jsx   # Main generator UI
│   │   │   └── Gallery.jsx     # Saved pages gallery
│   │   ├── components/
│   │   │   ├── PreviewFrame.jsx
│   │   │   ├── CodeViewer.jsx
│   │   │   ├── BrandStrip.jsx
│   │   │   └── HistoryDrawer.jsx
│   │   ├── hooks/
│   │   │   ├── useGenerate.js
│   │   │   └── useHistory.js
│   │   └── utils/
│   │       ├── buildHTML.js
│   │       ├── prompts.js
│   │       └── colorUtils.js
│   └── ...
│
├── backend/                    # FastAPI proxy
│   ├── main.py
│   ├── schemas.py
│   ├── prompt_builder.py
│   ├── html_builder.py
│   ├── rate_limiter.py
│   └── requirements.txt
│
├── docker-compose.yml
├── Dockerfile.frontend
├── Dockerfile.backend
└── nginx.conf
```

---

## 🚀 Running Locally

### 1. Set your API key

```bash
# Edit .env in the project root
GROQ_API_KEY=gsk_...
```

### 2. With Docker (recommended — one command)

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173  
- Backend:  http://localhost:8000/docs

### 3. Manual (two terminals)

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Styling | Pure CSS variables |
| AI | Groq API (`llama-3.3-70b-versatile`) |
| Backend | FastAPI (Python 3.12) |
| Deploy | Docker + Docker Compose |
| Hosting | Vercel (frontend) + Railway (backend) |

---

## 📋 Rate Limiting

10 generations per IP per hour (in-memory). Swap `rate_limiter.py`'s `_store` for Redis in production.

---

## 🌐 Deploying

**Frontend → Vercel**
```bash
cd frontend && npm run build
# Push to GitHub and connect Vercel
# Set env var: VITE_API_URL=https://your-railway-backend.railway.app
```

**Backend → Railway**
- Point to `Dockerfile.backend`
- Add `GROQ_API_KEY` in Railway env vars
- Update CORS origins in `backend/main.py`

---

## License

MIT — built for learning and portfolio purposes.
