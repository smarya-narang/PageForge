"""
html_builder.py — Python-side HTML generation (fallback / server-side export).

Mirrors the logic in frontend/src/utils/buildHTML.js so the backend
can produce a self-contained HTML file without involving the browser.
"""

from typing import Any


def _is_dark(hex_color: str) -> bool:
    h = hex_color.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140


def _hex_to_rgba(hex_color: str, alpha: float) -> str:
    h = hex_color.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f"rgba({r},{g},{b},{alpha})"


def build_html(data: dict[str, Any]) -> str:
    font        = data.get("font", "")
    font_stack  = f"'{font}', sans-serif" if font else "system-ui, sans-serif"
    gfont_url   = (
        f"https://fonts.googleapis.com/css2?family={font.replace(' ', '+')}:wght@400;600;700;800&display=swap"
        if font else ""
    )

    palette     = data.get("palette", {})
    accent      = palette.get("accent", "#e85d04")
    bg          = palette.get("bg", "#0a0a0a")
    text        = palette.get("text", "#f0f0f0")
    dark        = _is_dark(bg)
    card_bg     = _hex_to_rgba("#ffffff", 0.05) if dark else _hex_to_rgba("#000000", 0.04)
    border      = _hex_to_rgba("#ffffff", 0.08) if dark else _hex_to_rgba("#000000", 0.08)
    nav_bg      = _hex_to_rgba("#0a0a0a", 0.85) if dark else _hex_to_rgba("#ffffff", 0.85)
    feat_bg     = _hex_to_rgba("#ffffff", 0.08) if dark else _hex_to_rgba("#000000", 0.06)

    tagline     = data.get("tagline", "")
    words       = tagline.split()
    mid         = len(words) // 2
    highlighted = " ".join(
        f"<span>{w}</span>" if i == mid else w for i, w in enumerate(words)
    )

    features_html = "".join(
        f"""
        <div class="feature-card">
          <div class="feat-icon">{f['icon']}</div>
          <div class="feat-title">{f['title']}</div>
          <p class="feat-desc">{f['desc']}</p>
        </div>"""
        for f in data.get("features", [])
    )

    testimonials_html = "".join(
        f"""
        <div class="testimonial-card">
          <p class="quote">{t['quote']}</p>
          <div class="tname">{t['name']}</div>
          <div class="trole">{t['role']}</div>
        </div>"""
        for t in data.get("testimonials", [])
    )

    pricing_html = "".join(
        f"""
        <div class="pricing-card {'featured' if i == 1 else ''}">
          {'<span class="plan-badge">Most popular</span>' if i == 1 else ''}
          <div class="plan-name">{p['plan']}</div>
          <div class="plan-price">${p['price']}<span>/mo</span></div>
          <ul class="plan-feats">
            {''.join(f'<li>{feat}</li>' for feat in p['features'])}
          </ul>
          <a href="#" class="plan-btn {'plan-btn-filled' if i == 1 else 'plan-btn-outline'}">{data['cta']}</a>
        </div>"""
        for i, p in enumerate(data.get("pricing", []))
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{data.get('brand', 'Landing Page')}</title>
{f'<link href="{gfont_url}" rel="stylesheet"/>' if gfont_url else ''}
<style>
  *,*::before,*::after{{margin:0;padding:0;box-sizing:border-box;}}
  :root{{--accent:{accent};--bg:{bg};--text:{text};--card:{card_bg};--border:{border};--font:{font_stack};}}
  html{{scroll-behavior:smooth;}}
  body{{font-family:var(--font);background:var(--bg);color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased;}}
  nav{{position:sticky;top:0;z-index:100;backdrop-filter:blur(16px);background:{nav_bg};border-bottom:1px solid var(--border);padding:0 5%;display:flex;align-items:center;justify-content:space-between;height:60px;}}
  .logo{{font-weight:800;font-size:1.15rem;letter-spacing:-0.04em;color:var(--accent);}}
  .nav-links{{display:flex;gap:2rem;list-style:none;}}
  .nav-links a{{text-decoration:none;color:var(--text);opacity:.6;font-size:.875rem;transition:opacity .2s;}}
  .nav-links a:hover{{opacity:1;}}
  .nav-cta{{background:var(--accent);color:#fff;padding:.45rem 1.2rem;border-radius:7px;font-size:.875rem;font-weight:700;text-decoration:none;}}
  .hero{{min-height:88vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6rem 5% 4rem;position:relative;overflow:hidden;}}
  .hero::before{{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% -10%,{_hex_to_rgba(accent, 0.18)} 0%,transparent 70%);pointer-events:none;}}
  .hero-badge{{display:inline-block;background:var(--card);border:1px solid var(--border);padding:.3rem 1rem;border-radius:9999px;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;margin-bottom:1.5rem;opacity:.75;}}
  .hero h1{{font-size:clamp(2.5rem,7vw,5rem);font-weight:800;line-height:1.05;letter-spacing:-0.04em;max-width:720px;margin-bottom:1.25rem;}}
  .hero h1 span{{color:var(--accent);}}
  .hero p{{font-size:1.125rem;opacity:.65;max-width:520px;margin-bottom:2.5rem;}}
  .hero-actions{{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;margin-bottom:1.25rem;}}
  .btn-primary{{background:var(--accent);color:#fff;padding:.8rem 2rem;border-radius:9px;font-size:1rem;font-weight:700;text-decoration:none;}}
  .btn-ghost{{border:1px solid var(--border);color:var(--text);padding:.8rem 1.75rem;border-radius:9px;font-size:1rem;text-decoration:none;opacity:.7;}}
  .hero-note{{font-size:.8rem;opacity:.38;}}
  section{{padding:5rem 5%;}}
  .section-label{{text-align:center;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;opacity:.45;margin-bottom:.75rem;}}
  .section-title{{text-align:center;font-size:clamp(1.75rem,4vw,2.5rem);font-weight:800;letter-spacing:-0.03em;margin-bottom:.75rem;}}
  .section-sub{{text-align:center;opacity:.5;max-width:480px;margin:0 auto 3.5rem;}}
  .features-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.25rem;max-width:900px;margin:0 auto;}}
  .feature-card{{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:1.75rem;}}
  .feat-icon{{font-size:2rem;margin-bottom:1rem;}}
  .feat-title{{font-size:1rem;font-weight:700;margin-bottom:.4rem;}}
  .feat-desc{{font-size:.875rem;opacity:.6;line-height:1.65;}}
  .testimonials-bg{{background:var(--card);border-top:1px solid var(--border);border-bottom:1px solid var(--border);}}
  .testimonials-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.25rem;max-width:800px;margin:0 auto;}}
  .testimonial-card{{background:var(--bg);border:1px solid var(--border);border-radius:16px;padding:1.75rem;}}
  .quote{{font-size:1rem;line-height:1.75;opacity:.8;margin-bottom:1.25rem;font-style:italic;}}
  .tname{{font-weight:700;font-size:.875rem;}}
  .trole{{font-size:.8rem;opacity:.45;}}
  .pricing-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.25rem;max-width:820px;margin:0 auto;}}
  .pricing-card{{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:2rem 1.5rem;position:relative;}}
  .pricing-card.featured{{border-color:var(--accent);background:{feat_bg};}}
  .plan-badge{{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;font-size:.7rem;font-weight:700;text-transform:uppercase;padding:.25rem .75rem;border-radius:9999px;white-space:nowrap;}}
  .plan-name{{font-size:.8rem;font-weight:600;opacity:.55;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem;}}
  .plan-price{{font-size:2.75rem;font-weight:800;letter-spacing:-0.04em;margin-bottom:.25rem;}}
  .plan-price span{{font-size:1rem;opacity:.45;font-weight:400;}}
  .plan-feats{{list-style:none;margin:1.25rem 0 1.75rem;display:flex;flex-direction:column;gap:.65rem;}}
  .plan-feats li{{font-size:.875rem;opacity:.75;display:flex;align-items:flex-start;gap:.5rem;}}
  .plan-feats li::before{{content:'✓';color:var(--accent);font-weight:700;flex-shrink:0;}}
  .plan-btn{{display:block;text-align:center;padding:.7rem;border-radius:9px;font-weight:700;font-size:.9rem;text-decoration:none;}}
  .plan-btn-filled{{background:var(--accent);color:#fff;}}
  .plan-btn-outline{{border:1px solid var(--border);color:var(--text);}}
  footer{{border-top:1px solid var(--border);padding:2.5rem 5%;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;}}
  .footer-logo{{font-weight:800;font-size:1rem;color:var(--accent);}}
  footer p{{font-size:.8rem;opacity:.38;}}
</style>
</head>
<body>

<nav>
  <div class="logo">{data.get('brand')}</div>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#pricing">Pricing</a></li>
    <li><a href="#testimonials">Reviews</a></li>
  </ul>
  <a href="#pricing" class="nav-cta">{data.get('cta')}</a>
</nav>

<section class="hero">
  <div class="hero-badge">✦ New · Join the waitlist</div>
  <h1>{highlighted}</h1>
  <p>{data.get('subheadline')}</p>
  <div class="hero-actions">
    <a href="#pricing" class="btn-primary">{data.get('cta')} — it's free</a>
    <a href="#features" class="btn-ghost">See how it works →</a>
  </div>
  <p class="hero-note">No credit card required · Cancel anytime</p>
</section>

<section id="features">
  <p class="section-label">Why {data.get('brand')}</p>
  <h2 class="section-title">Everything you need</h2>
  <p class="section-sub">Built for people who want results, not complexity.</p>
  <div class="features-grid">{features_html}</div>
</section>

<section id="testimonials" class="testimonials-bg">
  <p class="section-label">Real people, real results</p>
  <h2 class="section-title">Loved by thousands</h2>
  <p class="section-sub">Don't take our word for it.</p>
  <div class="testimonials-grid">{testimonials_html}</div>
</section>

<section id="pricing">
  <p class="section-label">Simple pricing</p>
  <h2 class="section-title">Start for free</h2>
  <p class="section-sub">Upgrade anytime. Cancel anytime.</p>
  <div class="pricing-grid">{pricing_html}</div>
</section>

<footer>
  <div class="footer-logo">{data.get('brand')}</div>
  <p>© 2025 {data.get('brand')}. All rights reserved.</p>
  <p>Built with ❤️ for makers</p>
</footer>

</body>
</html>"""
