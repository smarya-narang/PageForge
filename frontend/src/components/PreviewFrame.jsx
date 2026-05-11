/**
 * PreviewFrame — renders generated HTML in an iframe.
 * Supports desktop / tablet / mobile viewport modes.
 *
 * Props:
 *   html     {string}  — srcDoc HTML
 *   viewport {'desktop'|'tablet'|'mobile'}
 *   height   {number}  — outer container height (desktop/tablet only)
 */
export default function PreviewFrame({ html, viewport = 'desktop', height = 560 }) {
  if (!html) return null

  /* ── MOBILE — CSS phone frame ─────────────────────────────── */
  if (viewport === 'mobile') {
    return (
      <div style={{
        display:        'flex',
        justifyContent: 'center',
        alignItems:     'flex-start',
        padding:        '1.5rem 0',
        background:     'var(--clr-bg-2)',
        border:         '1px solid var(--clr-border)',
        borderRadius:   'var(--r-lg)',
        minHeight:      height,
        overflowY:      'auto',
      }}>
        {/* Phone shell */}
        <div style={{
          position:     'relative',
          width:        390,
          height:       760,
          flexShrink:   0,
          borderRadius: 52,
          border:       '8px solid #1c1c2e',
          background:   '#000',
          boxShadow:    '0 0 0 2px #2a2a3e, 0 32px 64px rgba(0,0,0,0.7), inset 0 0 0 1px #0d0d1a',
          overflow:     'hidden',
        }}>
          {/* Dynamic island */}
          <div style={{
            position:     'absolute',
            top:          14,
            left:         '50%',
            transform:    'translateX(-50%)',
            width:        126,
            height:       36,
            background:   '#000',
            borderRadius: 18,
            zIndex:       20,
            boxShadow:    '0 2px 8px rgba(0,0,0,0.8)',
          }} />

          {/* Iframe — full shell */}
          <iframe
            srcDoc={html}
            sandbox="allow-scripts allow-same-origin"
            title="Mobile preview"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />

          {/* Home indicator */}
          <div style={{
            position:     'absolute',
            bottom:       10,
            left:         '50%',
            transform:    'translateX(-50%)',
            width:        120,
            height:       5,
            background:   'rgba(255,255,255,0.28)',
            borderRadius: 3,
            zIndex:       20,
          }} />
        </div>
      </div>
    )
  }

  /* ── TABLET — centered 768 px frame ──────────────────────── */
  if (viewport === 'tablet') {
    return (
      <div style={{
        display:        'flex',
        justifyContent: 'center',
        background:     'var(--clr-bg-2)',
        border:         '1px solid var(--clr-border)',
        borderRadius:   'var(--r-lg)',
        padding:        '1.25rem',
        height,
        overflow:       'hidden',
      }}>
        <div style={{
          width:        768,
          height:       '100%',
          borderRadius: 10,
          overflow:     'hidden',
          boxShadow:    '0 4px 32px rgba(0,0,0,0.4)',
          flexShrink:   0,
        }}>
          <iframe
            srcDoc={html}
            sandbox="allow-scripts allow-same-origin"
            title="Tablet preview"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        </div>
      </div>
    )
  }

  /* ── DESKTOP — full width ─────────────────────────────────── */
  return (
    <div style={{
      border:       '1px solid var(--clr-border)',
      borderRadius: 'var(--r-lg)',
      overflow:     'hidden',
      height,
      background:   '#fff',
    }}>
      <iframe
        srcDoc={html}
        sandbox="allow-scripts allow-same-origin"
        title="Desktop preview"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </div>
  )
}
