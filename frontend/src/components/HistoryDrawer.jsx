import { useState } from 'react'
import { useHistory } from '../hooks/useHistory.js'

/**
 * HistoryDrawer — sliding panel showing past generations.
 * Clicking an entry loads it back into the generator.
 */
export default function HistoryDrawer({ onLoad }) {
  const [open, setOpen]           = useState(false)
  const { history, removeEntry, clearHistory } = useHistory()

  return (
    <>
      {/* Toggle button */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setOpen(o => !o)}
        title="View history"
      >
        ☰ History {history.length > 0 && `(${history.length})`}
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 200,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 360,
        background: 'var(--clr-bg-2)',
        borderLeft: '1px solid var(--clr-border)',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.25rem 1rem',
          borderBottom: '1px solid var(--clr-border)'
        }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>History</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {history.length > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={clearHistory}
              >
                Clear all
              </button>
            )}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Entries */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {history.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'var(--clr-text-3)',
              fontSize: '0.875rem',
              padding: '3rem 1rem'
            }}>
              No generations yet.<br/>Create your first landing page!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.map(entry => (
                <div
                  key={entry.id}
                  style={{
                    background: 'var(--clr-surface)',
                    border: '1px solid var(--clr-border)',
                    borderRadius: 'var(--r-md)',
                    padding: '0.9rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s'
                  }}
                  onClick={() => { onLoad(entry); setOpen(false) }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--clr-border-2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--clr-border)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    {/* Color dot */}
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%',
                      background: entry.data?.palette?.accent || '#999',
                      flexShrink: 0
                    }} />
                    <span style={{
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: 'var(--clr-text)',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {entry.data?.brand || 'Untitled'}
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '2px 7px', fontSize: '0.7rem' }}
                      onClick={e => { e.stopPropagation(); removeEntry(entry.id) }}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--clr-text-3)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {entry.prompt}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'var(--clr-text-3)',
                    marginTop: 4,
                    opacity: 0.6
                  }}>
                    {new Date(entry.ts).toLocaleDateString()} · {entry.data?.font}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
