import { isDark, hexToRgba } from './colorUtils.js'

/**
 * buildHTML(data, options) → self-contained HTML string
 * Assembles a full landing page from the JSON returned by Claude/Groq.
 */
export function buildHTML(data, options = {}) {
  const { builderMode = false } = options;

  const gfont = data.font
    ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(data.font)}:wght@400;600;700;800&display=swap`
    : ''
  const fontStack = data.font ? `'${data.font}', sans-serif` : 'system-ui, sans-serif'
  const accent  = data.palette?.accent || '#e85d04'
  const bg      = data.palette?.bg     || '#0a0a0a'
  const text    = data.palette?.text   || '#f0f0f0'
  const dark    = isDark(bg)
  const cardBg  = dark ? hexToRgba('#ffffff', 0.05)  : hexToRgba('#000000', 0.04)
  const border  = dark ? hexToRgba('#ffffff', 0.08)  : hexToRgba('#000000', 0.08)
  const navBg   = dark ? hexToRgba('#0a0a0a', 0.85)  : hexToRgba('#ffffff', 0.85)
  const featuredCard = dark ? hexToRgba('#ffffff', 0.08) : hexToRgba('#000000', 0.06)

  // Highlight one word in tagline (guard against missing tagline)
  const taglineSafe = data.tagline || data.brand || 'Your product, reimagined'
  const words = taglineSafe.split(' ')
  const midIdx = Math.floor(words.length / 2)
  const highlightedTagline = words
    .map((w, i) => i === midIdx ? `<span>${w}</span>` : w)
    .join(' ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="description" content="${data.subheadline}"/>
<title>${data.brand}</title>
${gfont ? `<link href="${gfont}" rel="stylesheet"/>` : ''}
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
  body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.6; -webkit-font-smoothing: antialiased; }

  /* NAV */
  nav { position: sticky; top: 0; z-index: 100; backdrop-filter: blur(16px); background: ${navBg}; border-bottom: 1px solid var(--border); padding: 0 5%; display: flex; align-items: center; justify-content: space-between; height: 60px; }
  .logo { font-weight: 800; font-size: 1.15rem; letter-spacing: -0.04em; color: var(--accent); }
  .nav-links { display: flex; gap: 2rem; list-style: none; }
  .nav-links a { text-decoration: none; color: var(--text); opacity: 0.6; font-size: 0.875rem; transition: opacity 0.2s; }
  .nav-links a:hover { opacity: 1; }
  .nav-cta { background: var(--accent); color: #fff; padding: 0.45rem 1.2rem; border-radius: 7px; font-size: 0.875rem; font-weight: 700; text-decoration: none; transition: opacity 0.2s; }
  .nav-cta:hover { opacity: 0.85; }

  /* HERO */
  .hero { min-height: 88vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 6rem 5% 4rem; position: relative; overflow: hidden; }
  .hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% -10%, ${hexToRgba(accent, 0.18)} 0%, transparent 70%); pointer-events: none; }
  .hero-badge { display: inline-block; background: var(--card); border: 1px solid var(--border); padding: 0.3rem 1rem; border-radius: 9999px; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1.5rem; opacity: 0.75; }
  .hero h1 { font-size: clamp(2.5rem, 7vw, 5rem); font-weight: 800; line-height: 1.05; letter-spacing: -0.04em; max-width: 720px; margin-bottom: 1.25rem; }
  .hero h1 span { color: var(--accent); }
  .hero p { font-size: 1.125rem; opacity: 0.65; max-width: 520px; margin-bottom: 2.5rem; }
  .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; margin-bottom: 1.25rem; }
  .btn-primary { background: var(--accent); color: #fff; padding: 0.8rem 2rem; border-radius: 9px; font-size: 1rem; font-weight: 700; text-decoration: none; transition: transform 0.15s, opacity 0.15s; box-shadow: 0 4px 24px ${hexToRgba(accent, 0.35)}; }
  .btn-primary:hover { transform: translateY(-2px); opacity: 0.9; }
  .btn-ghost { border: 1px solid var(--border); color: var(--text); padding: 0.8rem 1.75rem; border-radius: 9px; font-size: 1rem; text-decoration: none; opacity: 0.7; transition: opacity 0.15s; }
  .btn-ghost:hover { opacity: 1; }
  .hero-note { font-size: 0.8rem; opacity: 0.38; }

  /* SECTIONS */
  section { padding: 5rem 5%; }
  .section-label { text-align: center; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.45; margin-bottom: 0.75rem; }
  .section-title { text-align: center; font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.75rem; }
  .section-sub { text-align: center; opacity: 0.5; max-width: 480px; margin: 0 auto 3.5rem; }

  /* FEATURES */
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; max-width: 900px; margin: 0 auto; }
  .feature-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 1.75rem; transition: border-color 0.2s, transform 0.2s; }
  .feature-card:hover { border-color: var(--accent); transform: translateY(-2px); }
  .feat-icon { font-size: 2rem; margin-bottom: 1rem; }
  .feat-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.4rem; }
  .feat-desc { font-size: 0.875rem; opacity: 0.6; line-height: 1.65; }

  /* TESTIMONIALS */
  .testimonials-bg { background: var(--card); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; max-width: 800px; margin: 0 auto; }
  .testimonial-card { background: var(--bg); border: 1px solid var(--border); border-radius: 16px; padding: 1.75rem; }
  .quote { font-size: 1rem; line-height: 1.75; opacity: 0.8; margin-bottom: 1.25rem; font-style: italic; }
  .quote::before { content: '"'; color: var(--accent); font-size: 1.5rem; line-height: 0; vertical-align: -0.3em; margin-right: 4px; font-style: normal; }
  .tname { font-weight: 700; font-size: 0.875rem; }
  .trole { font-size: 0.8rem; opacity: 0.45; }

  /* PRICING */
  .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; max-width: 820px; margin: 0 auto; }
  .pricing-card { background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 2rem 1.5rem; position: relative; }
  .pricing-card.featured { border-color: var(--accent); background: ${featuredCard}; box-shadow: 0 0 40px ${hexToRgba(accent, 0.12)}; }
  .plan-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--accent); color: #fff; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.25rem 0.75rem; border-radius: 9999px; white-space: nowrap; }
  .plan-name { font-size: 0.8rem; font-weight: 600; opacity: 0.55; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
  .plan-price { font-size: 2.75rem; font-weight: 800; letter-spacing: -0.04em; margin-bottom: 0.25rem; }
  .plan-price span { font-size: 1rem; opacity: 0.45; font-weight: 400; }
  .plan-feats { list-style: none; margin: 1.25rem 0 1.75rem; display: flex; flex-direction: column; gap: 0.65rem; }
  .plan-feats li { font-size: 0.875rem; opacity: 0.75; display: flex; align-items: flex-start; gap: 0.5rem; }
  .plan-feats li::before { content: '✓'; color: var(--accent); font-weight: 700; flex-shrink: 0; }
  .plan-btn { display: block; text-align: center; padding: 0.7rem; border-radius: 9px; font-weight: 700; font-size: 0.9rem; text-decoration: none; transition: opacity 0.15s, transform 0.15s; }
  .plan-btn-filled { background: var(--accent); color: #fff; }
  .plan-btn-outline { border: 1px solid var(--border); color: var(--text); }
  .plan-btn:hover { opacity: 0.82; transform: translateY(-1px); }

  /* FAQ */
  .faq-grid { display: flex; flex-direction: column; gap: 1rem; max-width: 720px; margin: 0 auto; }
  .faq-item { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; }
  .faq-q { font-weight: 700; font-size: 1.05rem; margin-bottom: 0.5rem; color: var(--accent); }
  .faq-a { font-size: 0.9rem; opacity: 0.75; line-height: 1.6; }

  /* HOW IT WORKS */
  .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2rem; max-width: 900px; margin: 0 auto; position: relative; }
  .step-card { background: var(--bg); border: 1px solid var(--border); border-radius: 16px; padding: 2rem 1.5rem; text-align: center; position: relative; z-index: 2; }
  .step-num { width: 48px; height: 48px; background: var(--accent); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 800; margin: 0 auto 1.25rem; }
  .step-title { font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem; }
  .step-desc { font-size: 0.875rem; opacity: 0.65; }

  /* FOOTER */
  footer { border-top: 1px solid var(--border); padding: 2.5rem 5%; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
  .footer-logo { font-weight: 800; font-size: 1rem; color: var(--accent); }
  footer p { font-size: 0.8rem; opacity: 0.38; }
  .footer-credit { width: 100%; text-align: center; padding-top: 1rem; border-top: 1px solid var(--border); margin-top: 0.5rem; font-size: 0.72rem; opacity: 0.35; }
  .footer-credit a { color: inherit; text-decoration: underline; opacity: 0.7; }
  .footer-credit a:hover { opacity: 1; }

  /* RESPONSIVE */
  @media (max-width: 640px) {
    .nav-links { display: none; }
    .hero h1 { font-size: 2.4rem; }
  }
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

<section class="hero" data-section="hero">
  <div class="hero-badge">✦ New · Join the waitlist</div>
  <h1>${highlightedTagline}</h1>
  <p>${data.subheadline}</p>
  <div class="hero-actions">
    <a href="#pricing" class="btn-primary">${data.cta} — it's free</a>
    <a href="#features" class="btn-ghost">See how it works →</a>
  </div>
  <p class="hero-note">No credit card required · Cancel anytime</p>
</section>

<section id="features" data-section="features">
  <p class="section-label">Why ${data.brand}</p>
  <h2 class="section-title">Everything you need</h2>
  <p class="section-sub">Built for people who want results, not complexity.</p>
  <div class="features-grid">
    ${(data.features || []).map(f => `
    <div class="feature-card">
      <div class="feat-icon">${f.icon}</div>
      <div class="feat-title">${f.title}</div>
      <p class="feat-desc">${f.desc}</p>
    </div>`).join('')}
  </div>
</section>

<section id="how-it-works" data-section="howItWorks">
  <p class="section-label">How it works</p>
  <h2 class="section-title">In three simple steps</h2>
  <p class="section-sub">Get started in minutes, not days.</p>
  <div class="steps-grid">
    ${(data.howItWorks || []).map((s, i) => `
    <div class="step-card">
      <div class="step-num">${s.step || (i + 1)}</div>
      <div class="step-title">${s.title}</div>
      <p class="step-desc">${s.desc}</p>
    </div>`).join('')}
  </div>
</section>

<section id="testimonials" class="testimonials-bg" data-section="testimonials">
  <p class="section-label">Real people, real results</p>
  <h2 class="section-title">Loved by thousands</h2>
  <p class="section-sub">Don't take our word for it.</p>
  <div class="testimonials-grid">
    ${(data.testimonials || []).map(t => `
    <div class="testimonial-card">
      <p class="quote">${t.quote}</p>
      <div class="tname">${t.name}</div>
      <div class="trole">${t.role}</div>
    </div>`).join('')}
  </div>
</section>

<section id="pricing" data-section="pricing">
  <p class="section-label">Simple pricing</p>
  <h2 class="section-title">Start for free</h2>
  <p class="section-sub">Upgrade anytime. Cancel anytime.</p>
  <div class="pricing-grid">
    ${(data.pricing || []).map((p, i) => `
    <div class="pricing-card ${i === 1 ? 'featured' : ''}">
      ${i === 1 ? '<span class="plan-badge">Most popular</span>' : ''}
      <div class="plan-name">${p.plan}</div>
      <div class="plan-price">$${p.price}<span>/mo</span></div>
      <ul class="plan-feats">
        ${(p.features || []).map(f => `<li>${f}</li>`).join('')}
      </ul>
      <a href="#" class="plan-btn ${i === 1 ? 'plan-btn-filled' : 'plan-btn-outline'}">${data.cta}</a>
    </div>`).join('')}
  </div>
</section>

<section id="faq" class="testimonials-bg" data-section="faq">
  <p class="section-label">FAQ</p>
  <h2 class="section-title">Common questions</h2>
  <p class="section-sub">Everything you need to know.</p>
  <div class="faq-grid">
    ${(data.faq || []).map(f => `
    <div class="faq-item">
      <div class="faq-q">${f.q}</div>
      <div class="faq-a">${f.a}</div>
    </div>`).join('')}
  </div>
</section>

<footer>
  <div class="footer-logo">${data.brand}</div>
  <p>© ${new Date().getFullYear()} ${data.brand}. All rights reserved.</p>
  <p>Built with ❤️ for makers</p>
  <div class="footer-credit">
    Page generated by <a href="https://github.com/smaryanarang" target="_blank" rel="noopener">Smarya Narang</a> using <strong>PageForge</strong> — AI Landing Page Generator
  </div>
</footer>

${builderMode ? `
<style>
  [data-section] { position: relative; transition: outline 0.2s; outline: 2px solid transparent; outline-offset: -2px; cursor: default; }
  [data-section]:hover { outline: 2px solid var(--accent); }
  .pf-builder-overlay {
    position: absolute; top: 12px; right: 12px; z-index: 9999;
    display: none; gap: 8px;
  }
  [data-section]:hover > .pf-builder-overlay { display: flex; }
  .pf-btn {
    background: var(--accent); color: #fff; border: none; padding: 6px 12px; border-radius: 6px;
    font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    display: flex; align-items: center; gap: 6px; font-family: system-ui, sans-serif;
  }
  .pf-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
</style>
<script>
  document.querySelectorAll('[data-section]').forEach(sec => {
    const sectionName = sec.getAttribute('data-section');
    
    const overlay = document.createElement('div');
    overlay.className = 'pf-builder-overlay';
    
    const regenBtn = document.createElement('button');
    regenBtn.className = 'pf-btn';
    regenBtn.innerHTML = '↻ Regenerate';
    regenBtn.onclick = (e) => {
      e.stopPropagation();
      window.parent.postMessage({ type: 'REGENERATE_SECTION', section: sectionName }, '*');
    };
    
    const editBtn = document.createElement('button');
    editBtn.className = 'pf-btn';
    editBtn.innerHTML = '✏️ Edit';
    editBtn.onclick = (e) => {
      e.stopPropagation();
      window.parent.postMessage({ type: 'SELECT_SECTION', section: sectionName }, '*');
    };
    
    overlay.appendChild(editBtn);
    overlay.appendChild(regenBtn);
    sec.appendChild(overlay);
  });
</script>
` : ''}

</body>
</html>`
}
