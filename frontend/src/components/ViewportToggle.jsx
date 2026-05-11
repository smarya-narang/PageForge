const VIEWPORTS = [
  { id: 'desktop', label: 'Desktop', icon: '🖥' },
  { id: 'tablet',  label: 'Tablet',  icon: '▭' },
  { id: 'mobile',  label: 'Mobile',  icon: '📱' },
]

/**
 * ViewportToggle — switches between desktop / tablet / mobile preview modes.
 * Props: value ('desktop'|'tablet'|'mobile'), onChange(value)
 */
export default function ViewportToggle({ value, onChange }) {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'var(--clr-bg-3)',
      border: '1px solid var(--clr-border)',
      borderRadius: 'var(--r-md)',
      padding: 3,
      gap: 2,
    }}>
      {VIEWPORTS.map(vp => {
        const active = value === vp.id
        return (
          <button
            key={vp.id}
            title={vp.label}
            onClick={() => onChange(vp.id)}
            style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:           4,
              padding:       '4px 10px',
              borderRadius:  6,
              border:        'none',
              cursor:        'pointer',
              fontSize:      '0.75rem',
              fontWeight:    active ? 600 : 400,
              background:    active ? 'var(--clr-surface-2)' : 'transparent',
              color:         active ? 'var(--clr-text)'      : 'var(--clr-text-3)',
              transition:    'all 0.15s',
            }}
          >
            <span>{vp.icon}</span>
            <span style={{ display: 'none' }}>{vp.label}</span>
          </button>
        )
      })}
    </div>
  )
}
