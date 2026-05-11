/**
 * ABComparison — side-by-side 50%-scaled previews of two generated variants.
 * Props:
 *   variantA  { data, html } | null
 *   variantB  { data, html } | null
 *   loading   boolean
 *   onPick    (variant: {data,html}) => void
 *   onClose   () => void
 */
export default function ABComparison({ variantA, variantB, loading, onPick, onClose }) {
  const SCALE      = 0.46
  const INNER_W    = 900
  const INNER_H    = 680
  const OUTER_W    = Math.round(INNER_W * SCALE)
  const OUTER_H    = Math.round(INNER_H * SCALE)

  function MiniPreview({ html, label, accent, onChoose }) {
    return (
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text)',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: accent || 'var(--clr-accent)', display: 'inline-block',
            }} />
            {label}
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ background: accent || 'var(--clr-accent)' }}
            onClick={onChoose}
          >
            Use this ↗
          </button>
        </div>

        {/* Scaled thumbnail */}
        <div style={{
          width:        '100%',
          height:       OUTER_H,
          overflow:     'hidden',
          borderRadius: 'var(--r-md)',
          border:       `1px solid ${accent || 'var(--clr-border)'}`,
          background:   '#fff',
          position:     'relative',
          flexShrink:   0,
        }}>
          {html ? (
            <div style={{
              width:           INNER_W,
              height:          INNER_H,
              transform:       `scale(${SCALE})`,
              transformOrigin: 'top left',
              pointerEvents:   'none',
            }}>
              <iframe
                srcDoc={html}
                sandbox="allow-scripts"
                title={label}
                style={{ width: INNER_W, height: INNER_H, border: 'none', display: 'block' }}
              />
            </div>
          ) : (
            <div className="shimmer" style={{ width: '100%', height: '100%' }} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="card fade-up" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '1rem',
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
          ⚡ A/B Variants
          {loading && <span style={{
            marginLeft: 10, fontSize: '0.72rem',
            color: 'var(--clr-text-3)', fontWeight: 400,
          }}>Generating two variants…</span>}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Close</button>
      </div>

      {/* Two previews */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <MiniPreview
          html={variantA?.html}
          label={`Variant A${variantA?.data?.brand ? ` — ${variantA.data.brand}` : ''}`}
          accent={variantA?.data?.palette?.accent}
          onChoose={() => onPick(variantA)}
        />
        <MiniPreview
          html={variantB?.html}
          label={`Variant B${variantB?.data?.brand ? ` — ${variantB.data.brand}` : ''}`}
          accent={variantB?.data?.palette?.accent}
          onChoose={() => onPick(variantB)}
        />
      </div>
    </div>
  )
}
