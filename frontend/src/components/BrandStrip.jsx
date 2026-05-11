/**
 * BrandStrip — shows generated brand name, font, and color palette.
 */
export default function BrandStrip({ data }) {
  if (!data) return null

  const { brand, font, palette } = data
  const colors = palette ? [palette.accent, palette.bg, palette.text] : []

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.75rem 1rem',
      background: 'var(--clr-surface)',
      border: '1px solid var(--clr-border)',
      borderRadius: 'var(--r-lg)',
      flexWrap: 'wrap'
    }}>
      {/* Color swatches */}
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {colors.map((hex, i) => (
          <div
            key={i}
            title={hex}
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: hex,
              border: '1px solid rgba(255,255,255,0.12)',
              flexShrink: 0
            }}
          />
        ))}
      </div>

      {/* Brand + font */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.9rem',
          fontWeight: 700,
          color: 'var(--clr-text)',
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {brand}
        </div>
        <div style={{
          fontSize: '0.72rem',
          color: 'var(--clr-text-3)',
          marginTop: 1
        }}>
          {font} · {palette?.accent}
        </div>
      </div>
    </div>
  )
}
