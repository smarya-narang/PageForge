/**
 * STYLE PRESETS
 * Each preset overrides palette + font from the original Groq response.
 * Applied client-side (no API call) via buildHTML.
 */
export const PRESETS = [
  {
    id:     'obsidian',
    name:   'Obsidian',
    emoji:  '🌌',
    palette: { accent: '#6ee7f7', bg: '#070b14', text: '#e2eeff' },
    font:   'Syne',
  },
  {
    id:     'solar',
    name:   'Solar',
    emoji:  '☀️',
    palette: { accent: '#e85d04', bg: '#faf7f2', text: '#1a1207' },
    font:   'Plus Jakarta Sans',
  },
  {
    id:     'forest',
    name:   'Forest',
    emoji:  '🌿',
    palette: { accent: '#22d3a0', bg: '#0d1f1a', text: '#e2f4ef' },
    font:   'DM Serif Display',
  },
  {
    id:     'slate',
    name:   'Slate',
    emoji:  '🏙',
    palette: { accent: '#f7c325', bg: '#0f1729', text: '#e8eaf6' },
    font:   'Space Mono',
  },
  {
    id:     'candy',
    name:   'Candy',
    emoji:  '🍬',
    palette: { accent: '#e91e8c', bg: '#fff0f8', text: '#1a0014' },
    font:   'Outfit',
  },
]

/**
 * applyPreset(pageData, preset) → new pageData with overridden palette + font.
 * Returns null if either arg is missing.
 */
export function applyPreset(pageData, preset) {
  if (!pageData || !preset) return pageData
  return { ...pageData, palette: preset.palette, font: preset.font }
}

// ── Component ────────────────────────────────────────────────

/**
 * PresetPicker — 5 one-click style themes.
 * Props: activePreset (id string | null), onApply(preset | null)
 */
export default function PresetPicker({ activePreset, onApply }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-3)', whiteSpace: 'nowrap' }}>
        Style preset:
      </span>

      {/* None / Reset */}
      <button
        onClick={() => onApply(null)}
        style={{
          display:      'inline-flex',
          alignItems:   'center',
          gap:          4,
          padding:      '4px 10px',
          borderRadius: 'var(--r-pill)',
          border:       `1px solid ${activePreset === null ? 'var(--clr-border-2)' : 'var(--clr-border)'}`,
          background:   activePreset === null ? 'var(--clr-surface-2)' : 'transparent',
          color:        activePreset === null ? 'var(--clr-text)' : 'var(--clr-text-3)',
          fontSize:     '0.75rem',
          fontWeight:   activePreset === null ? 600 : 400,
          cursor:       'pointer',
          transition:   'all 0.15s',
        }}
      >
        Auto
      </button>

      {PRESETS.map(p => {
        const active = activePreset === p.id
        return (
          <button
            key={p.id}
            title={p.name}
            onClick={() => onApply(active ? null : p)}
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          5,
              padding:      '4px 11px',
              borderRadius: 'var(--r-pill)',
              border:       `1px solid ${active ? p.palette.accent : 'var(--clr-border)'}`,
              background:   active ? `${p.palette.accent}22` : 'transparent',
              color:        active ? p.palette.accent : 'var(--clr-text-3)',
              fontSize:     '0.75rem',
              fontWeight:   active ? 700 : 400,
              cursor:       'pointer',
              transition:   'all 0.15s',
            }}
          >
            {/* Color swatch */}
            <span style={{
              display:      'inline-block',
              width:        9,
              height:       9,
              borderRadius: '50%',
              background:   p.palette.accent,
              flexShrink:   0,
            }} />
            {p.emoji} {p.name}
          </button>
        )
      })}
    </div>
  )
}
