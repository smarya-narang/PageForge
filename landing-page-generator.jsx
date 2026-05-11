import { useState, useEffect, useRef } from "react";

const SYSTEM_PROMPT = `You are an expert landing page designer and copywriter. Given a one-sentence product description, generate a complete, beautiful HTML landing page.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "brand": "Company name (infer a catchy 1-2 word name from the description)",
  "tagline": "Bold 4-8 word hero headline",
  "subheadline": "One compelling sentence explaining the value proposition",
  "cta": "CTA button text (2-4 words)",
  "features": [
    {"icon": "emoji", "title": "Feature name", "desc": "One sentence description"},
    {"icon": "emoji", "title": "Feature name", "desc": "One sentence description"},
    {"icon": "emoji", "title": "Feature name", "desc": "One sentence description"}
  ],
  "testimonials": [
    {"name": "Full Name", "role": "Job Title at Company", "quote": "Short compelling testimonial"},
    {"name": "Full Name", "role": "Job Title at Company", "quote": "Short compelling testimonial"}
  ],
  "pricing": [
    {"plan": "Free", "price": "0", "features": ["feature1", "feature2", "feature3"]},
    {"plan": "Pro", "price": "29", "features": ["feature1", "feature2", "feature3", "feature4"]},
    {"plan": "Enterprise", "price": "99", "features": ["feature1", "feature2", "feature3", "feature4", "feature5"]}
  ],
  "palette": {
    "accent": "#hex (a bold, unique brand color - NOT purple or blue)",
    "bg": "#hex (a very dark or very light bg color)",
    "text": "#hex (contrasting text color)"
  },
  "font": "Google Fonts font name — pick something distinctive (e.g. Syne, DM Serif Display, Playfair Display, Cabinet Grotesk, Outfit, Space Mono)"
}`;

const EXAMPLES = [
  "A SaaS tool that turns messy Notion pages into clean client proposals",
  "An app for gym owners to manage memberships and class schedules",
  "AI-powered interview coach for software engineering jobs",
  "A marketplace for freelance comic book artists",
  "Subscription service for curated indie coffee from around the world"
];

export default function LandingPageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageData, setPageData] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("preview"); // preview | code
  const [generatedHTML, setGeneratedHTML] = useState("");
  const iframeRef = useRef(null);
  const inputRef = useRef(null);

  const exampleRef = useRef(0);

  function buildHTML(data) {
    const gfont = data.font ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(data.font)}:wght@400;600;700;800&display=swap` : "";
    const fontStack = data.font ? `'${data.font}', sans-serif` : "system-ui, sans-serif";
    const accent = data.palette?.accent || "#e85d04";
    const bg = data.palette?.bg || "#0a0a0a";
    const text = data.palette?.text || "#f0f0f0";
    const isDark = bg < "#888";
    const cardBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${data.brand}</title>
${gfont ? `<link href="${gfont}" rel="stylesheet"/>` : ""}
<style>
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --accent: ${accent};
    --bg: ${bg};
    --text: ${text};
    --card: ${cardBg};
    --border: ${border};
    --font: ${fontStack};
  }
  html { scroll-behavior: smooth; }
  body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.6; }

  /* NAV */
  nav { position: sticky; top: 0; z-index: 100; backdrop-filter: blur(16px); background: ${isDark ? "rgba(10,10,10,0.85)" : "rgba(255,255,255,0.85)"}; border-bottom: 1px solid var(--border); padding: 0 5%; display: flex; align-items: center; justify-content: space-between; height: 60px; }
  .logo { font-weight: 800; font-size: 1.15rem; letter-spacing: -0.03em; color: var(--accent); }
  .nav-links { display: flex; gap: 2rem; list-style: none; }
  .nav-links a { text-decoration: none; color: var(--text); opacity: 0.6; font-size: 0.875rem; transition: opacity 0.2s; }
  .nav-links a:hover { opacity: 1; }
  .nav-cta { background: var(--accent); color: #fff; padding: 0.45rem 1.2rem; border-radius: 6px; font-size: 0.875rem; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
  .nav-cta:hover { opacity: 0.85; }

  /* HERO */
  .hero { min-height: 88vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 6rem 5% 4rem; position: relative; overflow: hidden; }
  .hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% -10%, ${accent}22 0%, transparent 70%); pointer-events: none; }
  .hero-badge { display: inline-block; background: var(--card); border: 1px solid var(--border); padding: 0.3rem 1rem; border-radius: 999px; font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1.5rem; opacity: 0.7; }
  .hero h1 { font-size: clamp(2.5rem, 7vw, 5rem); font-weight: 800; line-height: 1.05; letter-spacing: -0.04em; max-width: 700px; margin-bottom: 1.25rem; }
  .hero h1 span { color: var(--accent); }
  .hero p { font-size: 1.125rem; opacity: 0.65; max-width: 500px; margin-bottom: 2.5rem; }
  .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }
  .btn-primary { background: var(--accent); color: #fff; padding: 0.75rem 2rem; border-radius: 8px; font-size: 1rem; font-weight: 700; text-decoration: none; transition: transform 0.15s, opacity 0.15s; }
  .btn-primary:hover { transform: translateY(-1px); opacity: 0.9; }
  .btn-ghost { border: 1px solid var(--border); color: var(--text); padding: 0.75rem 1.75rem; border-radius: 8px; font-size: 1rem; text-decoration: none; opacity: 0.7; transition: opacity 0.15s; }
  .btn-ghost:hover { opacity: 1; }
  .hero-note { margin-top: 1.25rem; font-size: 0.8rem; opacity: 0.4; }

  /* FEATURES */
  section { padding: 5rem 5%; }
  .section-label { text-align: center; font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.5; margin-bottom: 0.75rem; }
  .section-title { text-align: center; font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.75rem; }
  .section-sub { text-align: center; opacity: 0.55; max-width: 480px; margin: 0 auto 3.5rem; }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; max-width: 900px; margin: 0 auto; }
  .feature-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 1.75rem; transition: border-color 0.2s; }
  .feature-card:hover { border-color: var(--accent); }
  .feat-icon { font-size: 2rem; margin-bottom: 1rem; }
  .feat-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.4rem; }
  .feat-desc { font-size: 0.9rem; opacity: 0.6; line-height: 1.6; }

  /* TESTIMONIALS */
  .testimonials-bg { background: var(--card); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; max-width: 800px; margin: 0 auto; }
  .testimonial-card { background: var(--bg); border: 1px solid var(--border); border-radius: 14px; padding: 1.75rem; }
  .quote { font-size: 1rem; line-height: 1.7; opacity: 0.8; margin-bottom: 1.25rem; font-style: italic; }
  .quote::before { content: '"'; color: var(--accent); font-size: 1.5rem; line-height: 0; vertical-align: -0.3em; margin-right: 4px; }
  .tname { font-weight: 700; font-size: 0.875rem; }
  .trole { font-size: 0.8rem; opacity: 0.5; }

  /* PRICING */
  .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; max-width: 820px; margin: 0 auto; }
  .pricing-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 2rem 1.5rem; position: relative; }
  .pricing-card.featured { border-color: var(--accent); background: ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}; }
  .plan-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--accent); color: #fff; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.25rem 0.75rem; border-radius: 999px; white-space: nowrap; }
  .plan-name { font-size: 0.875rem; font-weight: 600; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.5rem; }
  .plan-price { font-size: 2.5rem; font-weight: 800; letter-spacing: -0.04em; margin-bottom: 0.25rem; }
  .plan-price span { font-size: 1rem; opacity: 0.5; font-weight: 400; }
  .plan-feats { list-style: none; margin: 1.25rem 0 1.75rem; display: flex; flex-direction: column; gap: 0.6rem; }
  .plan-feats li { font-size: 0.875rem; opacity: 0.75; display: flex; align-items: flex-start; gap: 0.5rem; }
  .plan-feats li::before { content: '✓'; color: var(--accent); font-weight: 700; flex-shrink: 0; }
  .plan-btn { display: block; text-align: center; padding: 0.65rem; border-radius: 8px; font-weight: 700; font-size: 0.9rem; text-decoration: none; transition: opacity 0.15s; }
  .plan-btn-filled { background: var(--accent); color: #fff; }
  .plan-btn-outline { border: 1px solid var(--border); color: var(--text); }
  .plan-btn:hover { opacity: 0.8; }

  /* FOOTER */
  footer { border-top: 1px solid var(--border); padding: 2.5rem 5%; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
  .footer-logo { font-weight: 800; font-size: 1rem; color: var(--accent); }
  footer p { font-size: 0.8rem; opacity: 0.4; }
</style>
</head>
<body>

<nav>
  <div class="logo">${data.brand}</div>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#pricing">Pricing</a></li>
    <li><a href="#testimonials">Reviews</a></li>
  </ul>
  <a href="#pricing" class="nav-cta">${data.cta}</a>
</nav>

<section class="hero">
  <div class="hero-badge">Launching 2024 · Join the waitlist</div>
  <h1>${data.tagline.split(" ").map((w, i) => i === Math.floor(data.tagline.split(" ").length / 2) ? `<span>${w}</span>` : w).join(" ")}</h1>
  <p>${data.subheadline}</p>
  <div class="hero-actions">
    <a href="#pricing" class="btn-primary">${data.cta} — it's free</a>
    <a href="#features" class="btn-ghost">See how it works</a>
  </div>
  <p class="hero-note">No credit card required · 14-day free trial</p>
</section>

<section id="features">
  <p class="section-label">Why ${data.brand}</p>
  <h2 class="section-title">Everything you need</h2>
  <p class="section-sub">Built for people who want results, not complexity.</p>
  <div class="features-grid">
    ${data.features.map(f => `
    <div class="feature-card">
      <div class="feat-icon">${f.icon}</div>
      <div class="feat-title">${f.title}</div>
      <p class="feat-desc">${f.desc}</p>
    </div>`).join("")}
  </div>
</section>

<section id="testimonials" class="testimonials-bg">
  <p class="section-label">Real people, real results</p>
  <h2 class="section-title">Loved by thousands</h2>
  <p class="section-sub">Don't take our word for it.</p>
  <div class="testimonials-grid">
    ${data.testimonials.map(t => `
    <div class="testimonial-card">
      <p class="quote">${t.quote}</p>
      <div class="tname">${t.name}</div>
      <div class="trole">${t.role}</div>
    </div>`).join("")}
  </div>
</section>

<section id="pricing">
  <p class="section-label">Simple pricing</p>
  <h2 class="section-title">Start for free</h2>
  <p class="section-sub">Upgrade anytime. Cancel anytime.</p>
  <div class="pricing-grid">
    ${data.pricing.map((p, i) => `
    <div class="pricing-card ${i === 1 ? "featured" : ""}">
      ${i === 1 ? '<span class="plan-badge">Most popular</span>' : ""}
      <div class="plan-name">${p.plan}</div>
      <div class="plan-price">$${p.price}<span>/mo</span></div>
      <ul class="plan-feats">
        ${p.features.map(f => `<li>${f}</li>`).join("")}
      </ul>
      <a href="#" class="plan-btn ${i === 1 ? "plan-btn-filled" : "plan-btn-outline"}">${data.cta}</a>
    </div>`).join("")}
  </div>
</section>

<footer>
  <div class="footer-logo">${data.brand}</div>
  <p>© 2024 ${data.brand}. All rights reserved.</p>
  <p>Built with ❤️ for makers</p>
</footer>

</body>
</html>`;
  }

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setPageData(null);
    setGeneratedHTML("");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Product idea: ${prompt}` }]
        })
      });

      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setPageData(parsed);
      const html = buildHTML(parsed);
      setGeneratedHTML(html);
      setViewMode("preview");
    } catch (e) {
      setError("Something went wrong. Make sure your idea is descriptive enough and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generate();
    }
  }

  function useExample() {
    const i = exampleRef.current % EXAMPLES.length;
    setPrompt(EXAMPLES[i]);
    exampleRef.current++;
    inputRef.current?.focus();
  }

  function copyCode() {
    navigator.clipboard.writeText(generatedHTML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadHTML() {
    const blob = new Blob([generatedHTML], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${pageData?.brand?.toLowerCase().replace(/\s+/g, "-") || "landing"}-page.html`;
    a.click();
  }

  return (
    <div style={{ fontFamily: "var(--font-sans)", paddingBottom: "2rem" }}>

      {/* Header */}
      <div style={{ padding: "1.5rem 0 1rem", borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-secondary)", marginBottom: 6 }}>
          AI Landing Page Generator
        </div>
        <div style={{ fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.2 }}>
          One sentence → full landing page
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
          Describe your product idea and watch a complete, styled landing page generate in seconds.
        </div>
      </div>

      {/* Input */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{
          display: "flex",
          gap: 8,
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-lg)",
          padding: "10px 12px",
          alignItems: "flex-start"
        }}>
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. A SaaS tool that converts messy Notion pages into client proposals..."
            rows={2}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              resize: "none",
              fontSize: 14,
              color: "var(--color-text-primary)",
              outline: "none",
              fontFamily: "var(--font-sans)",
              lineHeight: 1.6
            }}
          />
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            style={{
              background: loading || !prompt.trim() ? "var(--color-background-secondary)" : "var(--color-text-primary)",
              color: loading || !prompt.trim() ? "var(--color-text-tertiary)" : "var(--color-background-primary)",
              border: "none",
              borderRadius: "var(--border-radius-md)",
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 500,
              cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
              flexShrink: 0,
              transition: "all 0.15s"
            }}
          >
            {loading ? "Generating..." : "Generate ↗"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>Try an example:</span>
          <button
            onClick={useExample}
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              background: "var(--color-background-secondary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-md)",
              padding: "3px 10px",
              cursor: "pointer"
            }}
          >
            Random idea ↻
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: "var(--color-background-danger)",
          color: "var(--color-text-danger)",
          border: "0.5px solid var(--color-border-danger)",
          borderRadius: "var(--border-radius-md)",
          padding: "10px 14px",
          fontSize: 13,
          marginBottom: "1rem"
        }}>
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          padding: "3rem",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>✦</div>
          <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Designing your landing page...</div>
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 4 }}>Picking fonts, colors, copy, and layout</div>
        </div>
      )}

      {/* Result */}
      {pageData && generatedHTML && (
        <div>
          {/* Metadata strip */}
          <div style={{
            background: "var(--color-background-secondary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            padding: "12px 16px",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: pageData.palette?.accent || "#e85d04"
              }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
                  {pageData.brand}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
                  {pageData.font} · {pageData.palette?.accent}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setViewMode(v => v === "preview" ? "code" : "preview")}
                style={{
                  fontSize: 12, padding: "5px 12px",
                  border: "0.5px solid var(--color-border-secondary)",
                  borderRadius: "var(--border-radius-md)",
                  background: "transparent",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer"
                }}
              >
                {viewMode === "preview" ? "View code" : "Preview"}
              </button>
              <button
                onClick={copyCode}
                style={{
                  fontSize: 12, padding: "5px 12px",
                  border: "0.5px solid var(--color-border-secondary)",
                  borderRadius: "var(--border-radius-md)",
                  background: "transparent",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer"
                }}
              >
                {copied ? "Copied!" : "Copy HTML"}
              </button>
              <button
                onClick={downloadHTML}
                style={{
                  fontSize: 12, padding: "5px 12px",
                  border: "0.5px solid var(--color-border-secondary)",
                  borderRadius: "var(--border-radius-md)",
                  background: "var(--color-text-primary)",
                  color: "var(--color-background-primary)",
                  cursor: "pointer",
                  fontWeight: 500
                }}
              >
                Download ↓
              </button>
            </div>
          </div>

          {viewMode === "preview" ? (
            <div style={{
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              overflow: "hidden",
              height: 560
            }}>
              <iframe
                ref={iframeRef}
                srcDoc={generatedHTML}
                style={{ width: "100%", height: "100%", border: "none" }}
                title="Generated landing page preview"
              />
            </div>
          ) : (
            <div style={{
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              overflow: "auto",
              height: 560,
              background: "var(--color-background-secondary)"
            }}>
              <pre style={{
                fontSize: 11,
                lineHeight: 1.6,
                padding: "1rem",
                color: "var(--color-text-secondary)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                fontFamily: "var(--font-mono)"
              }}>
                {generatedHTML}
              </pre>
            </div>
          )}

          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button
              onClick={() => { setPageData(null); setGeneratedHTML(""); setPrompt(""); }}
              style={{
                fontSize: 12, padding: "5px 14px",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-md)",
                background: "transparent",
                color: "var(--color-text-tertiary)",
                cursor: "pointer"
              }}
            >
              ← Start over
            </button>
            <button
              onClick={generate}
              style={{
                fontSize: 12, padding: "5px 14px",
                border: "0.5px solid var(--color-border-secondary)",
                borderRadius: "var(--border-radius-md)",
                background: "transparent",
                color: "var(--color-text-secondary)",
                cursor: "pointer"
              }}
            >
              Regenerate with same idea ↻
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !pageData && !error && (
        <div style={{
          border: "0.5px dashed var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          padding: "3rem",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>⬡</div>
          <div style={{ fontSize: 14, color: "var(--color-text-tertiary)" }}>Your landing page will appear here</div>
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 4, opacity: 0.6 }}>Type a product idea above and hit Generate</div>
        </div>
      )}
    </div>
  );
}
