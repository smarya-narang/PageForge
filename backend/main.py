"""
PageForge FastAPI Backend — powered by Groq
===========================================
Single endpoint: POST /api/generate
- Validates request
- Rate limits by IP
- Builds prompt and calls Groq (Llama 3.3 70B)
- Validates + returns structured JSON
"""

import json
import os

from groq import Groq
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from prompt_builder import SYSTEM_PROMPT, build_prompt
from rate_limiter import is_rate_limited
from schemas import GenerateRequest, GenerateResponse

load_dotenv()

app = FastAPI(
    title="PageForge API",
    description="AI landing page generator — proxies Groq API with rate limiting",
    version="1.0.0",
)

# ── CORS ────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://pageforge.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Groq client ─────────────────────────────────────────────────
# Accept either GROQ_API_KEY or VITE_GROQ_API_KEY (so you don't
# need two separate vars in .env for local dev)
api_key = os.getenv("GROQ_API_KEY") or os.getenv("VITE_GROQ_API_KEY")
if not api_key:
    raise RuntimeError(
        "Neither GROQ_API_KEY nor VITE_GROQ_API_KEY is set. Add one to your .env file."
    )

client = Groq(api_key=api_key)
GROQ_MODEL = "llama-3.3-70b-versatile"


# ── Health check ─────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "model": GROQ_MODEL}


# ── Generate endpoint ────────────────────────────────────────────
@app.post("/api/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest, request: Request):
    # Get client IP
    ip = request.headers.get("x-forwarded-for", request.client.host or "unknown")
    ip = ip.split(",")[0].strip()

    # Rate limit check
    if is_rate_limited(ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. You can generate up to 10 pages per hour. Try again later."
        )

    # Call Groq
    try:
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            max_tokens=2048,
            temperature=0.9,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": build_prompt(req.idea)},
            ],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq API error: {str(e)}")

    # Extract and parse JSON
    raw = completion.choices[0].message.content or ""

    # Strip accidental markdown fences
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```", 2)[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.rsplit("```", 1)[0].strip()

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=422,
            detail=f"Model returned invalid JSON: {str(e)}. Raw: {raw[:200]}"
        )

    # Validate with Pydantic
    try:
        result = GenerateResponse(**parsed)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Response schema mismatch: {str(e)}"
        )

    return result
