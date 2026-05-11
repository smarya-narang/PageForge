# PageForge — AI Landing Page Generator
> 
 sentence → full, styled landing page. Built by Smarya Narang.

---

## What it does
Type a single sentence describing your product. The app uses Claude AI to generate:
- A brand name + tagline
- Hero section, features, testimonials, pricing
- A unique color palette and font (never the same twice)
- Fully downloadable HTML — no dependencies, works offline

---

## Project Structure

```
pageforge/
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── App.jsx             # Root with routing
│   │   ├── pages/
│   │   │   ├── Generator.jsx   # Main generator UI (the file above)
│   │   │   └── Gallery.jsx     # Saved pages gallery
│   │   ├── components/
│   │   │   ├── PreviewFrame.jsx     # Sandboxed iframe wrapper
│   │   │   ├── CodeViewer.jsx       # Syntax-highlighted HTML view
│   │   │   ├── BrandStrip.jsx       # Font/color metadata bar
│   │   │   └── HistoryDrawer.jsx    # Saved generations drawer
│   │   ├── hooks/
│   │   │   ├── useGenerate.js       # API call + state logic
│   │   │   └── useHistory.js        # localStorage for past pages
│   │   ├── utils/
│   │   │   ├── buildHTML.js         # Assembles HTML from JSON data
│   │   │   ├── prompts.js           # System + user prompts
│   │   │   └── colorUtils.js        # isDark(), contrastColor()
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                    # FastAPI proxy (protects API key)
│   ├── main.py                 # /api/generate endpoint
│   ├── schemas.py              # Pydantic request/response models
│   ├── prompt_builder.py       # Builds Claude prompt from user input
│   ├── html_builder.py         # Python-side HTML generation (fallback)
│   ├── rate_limiter.py         # Simple IP-based rate limiting
│   └── requirements.txt
│
├── docker-compose.yml          # One command to run everything
├── Dockerfile.frontend
├── Dockerfile.backend
└── README.md
```

---

## Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| Frontend | React + Vite | Fast, familiar from Saravi internship |
| Styling | Pure CSS variables | Zero deps, fast load |
| AI | Claude API (claude-sonnet) | JSON mode, reliable structure |
| Backend | FastAPI (Python) | Hides API key, adds rate limiting |
| Deploy | Docker + Docker Compose | One-command local + cloud deploy |
| Hosting | Vercel (frontend) + Railway (backend) | Free tier, fast |

---

## Key Files Explained

### `frontend/src/utils/prompts.js`
```js
export const SYSTEM_PROMPT = `You are an expert landing page designer...
Return ONLY valid JSON with: brand, tagline, subheadline, cta, 
features[], testimonials[], pricing[], palette{}, font`;

export const buildUserPrompt = (idea) =>
  `Product idea: ${idea}`;
```

### `frontend/src/utils/buildHTML.js`
Pure function: `buildHTML(data) → htmlString`
- Takes the JSON from Claude
- Injects brand colors, font from Google Fonts, copy
- Returns a self-contained HTML file with no external deps

### `backend/main.py`
```python
@app.post("/api/generate")
async def generate(req: GenerateRequest):
    # Rate limit check
    # Build prompt
    # Call Anthropic API
    # Validate JSON response
    # Return structured data
```

### `backend/rate_limiter.py`
Simple in-memory rate limiter: 10 generations per IP per hour.
Swap for Redis in production.

---

## Running Locally

```bash
# Clone and install
git clone https://github.com/smarya-narang/pageforge
cd pageforge

# With Docker (recommended)
docker-compose up

# Manual
cd backend && pip install -r requirements.txt && uvicorn main:app --reload
cd frontend && npm install && npm run dev
```

Set `ANTHROPIC_API_KEY` in `.env`.

---

## Resume Bullets (copy-paste ready)

**PageForge — AI Landing Page Generator** | React, FastAPI, Claude API, Docker
- Built a generative AI tool that converts a one-sentence product description into a 
  complete, styled landing page with unique branding, copy, and color palette per generation
- Engineered a structured JSON prompt pipeline with Claude claude-sonnet; HTML template engine 
  assembles hero, features, testimonials, and pricing sections from AI output
- Deployed with Docker Compose; FastAPI backend proxies Anthropic API with IP-based 
  rate limiting; frontend on Vercel with sub-200ms perceived load

---

## Interview talking points

**"How does it work?"**
> "User types one sentence. I send it to Claude with a strict JSON schema in the system prompt — 
  brand name, tagline, color palette, font, features, pricing. The response gets validated and 
  fed into a template engine that assembles the final HTML. The whole round trip is under 3 seconds."

**"Why is this hard?"**
> "Getting Claude to consistently return structured JSON with semantically meaningful palette choices — 
  not just random colors — required careful prompt engineering. I also had to handle the HTML being 
  self-contained: no Tailwind, no React, no external CSS — just a single file that works offline."

**"What would you add next?"**
> "Streaming generation so sections appear as they're written. A gallery of saved pages. 
  And RAGAS-style evals to score the quality of generated copy — essentially grounding the 
  output quality in measurable metrics."
