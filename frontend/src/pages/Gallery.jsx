import { useState } from 'react'
import { useHistory } from '../hooks/useHistory.js'
import PreviewFrame from '../components/PreviewFrame.jsx'
import BrandStrip from '../components/BrandStrip.jsx'
import { useNavigate } from 'react-router-dom'

export default function Gallery() {
  const { history, removeEntry, clearHistory } = useHistory()
  const navigate = useNavigate()
  const [selected, setSelected]               = useState(null)

  if (selected) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>
            ← Back to gallery
          </button>
        </div>
        <BrandStrip data={selected.data} />
        <div style={{ marginTop: 8 }}>
          <PreviewFrame html={selected.html} height={640} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <span className="badge badge-accent" style={{ marginBottom: 10 }}>Saved Pages</span>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.1
          }}>
            Your Gallery
          </h1>
          <p style={{ color: 'var(--clr-text-3)', fontSize: '0.875rem', marginTop: 6 }}>
            All previously generated landing pages, stored locally.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {history.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearHistory}>
              Clear all
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>
            + Generate new
          </button>
        </div>
      </div>

      {/* Empty */}
      {history.length === 0 && (
        <div className="fade-up" style={{
          border: '1px dashed var(--clr-border)',
          borderRadius: 'var(--r-lg)',
          padding: '4rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 14, opacity: 0.15 }}>⬡</div>
          <div style={{ color: 'var(--clr-text-2)', fontWeight: 500 }}>No saved pages yet</div>
          <div style={{ color: 'var(--clr-text-3)', fontSize: '0.825rem', marginTop: 6 }}>
            Generate your first landing page to see it here
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: '1.5rem' }}
            onClick={() => navigate('/')}
          >
            Start generating →
          </button>
        </div>
      )}

      {/* Grid */}
      {history.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}>
          {history.map(entry => (
            <div
              key={entry.id}
              className="card"
              style={{
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'border-color 0.2s, transform 0.2s',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={() => setSelected(entry)}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--clr-border-2)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--clr-border)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Mini preview thumbnail */}
              <div style={{
                height: 160,
                overflow: 'hidden',
                position: 'relative',
                background: entry.data?.palette?.bg || '#0a0a0a',
                pointerEvents: 'none'
              }}>
                <iframe
                  srcDoc={entry.html}
                  sandbox="allow-scripts"
                  title={entry.data?.brand}
                  style={{
                    width: '200%',
                    height: '200%',
                    border: 'none',
                    transform: 'scale(0.5)',
                    transformOrigin: 'top left',
                    pointerEvents: 'none'
                  }}
                />
              </div>

              {/* Info */}
              <div style={{ padding: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: entry.data?.palette?.accent || '#999',
                    flexShrink: 0
                  }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--clr-text)' }}>
                    {entry.data?.brand}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--clr-text-3)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 8
                }}>
                  {entry.prompt}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-3)', opacity: 0.6 }}>
                    {new Date(entry.ts).toLocaleDateString()}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                    onClick={e => { e.stopPropagation(); removeEntry(entry.id) }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
