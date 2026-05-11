import React from 'react'

/**
 * SidebarEditor — manual text editor for the selected section.
 * Props:
 *   section: string (e.g. 'hero', 'features')
 *   data: the full pageData object
 *   onChange: (newData) => void
 *   onClose: () => void
 */
export default function SidebarEditor({ section, data, onChange, onClose }) {
  if (!section || !data) return null

  // Helper to update top-level strings (e.g. tagline)
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value })
  }

  // Helper to update an array item (e.g. features[0].title)
  const updateArrayField = (arrayName, index, field, value) => {
    const newArray = [...(data[arrayName] || [])]
    newArray[index] = { ...newArray[index], [field]: value }
    onChange({ ...data, [arrayName]: newArray })
  }

  return (
    <div style={{
      width: 340,
      background: 'var(--clr-bg)',
      borderLeft: '1px solid var(--clr-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid var(--clr-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: 'var(--clr-bg)',
        zIndex: 10
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'capitalize' }}>
          ✏️ Edit {section}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '4px 8px' }}>
          ✕
        </button>
      </div>

      {/* Form Fields */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {section === 'hero' && (
          <>
            <div>
              <label style={labelStyle}>Tagline</label>
              <textarea
                style={inputStyle} rows={3}
                value={data.tagline || ''}
                onChange={e => updateField('tagline', e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Subheadline</label>
              <textarea
                style={inputStyle} rows={3}
                value={data.subheadline || ''}
                onChange={e => updateField('subheadline', e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Button Text (CTA)</label>
              <input
                type="text" style={inputStyle}
                value={data.cta || ''}
                onChange={e => updateField('cta', e.target.value)}
              />
            </div>
          </>
        )}

        {section === 'features' && (data.features || []).map((f, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 8, opacity: 0.5 }}>Feature {i + 1}</div>
            <input
              type="text" style={{ ...inputStyle, marginBottom: 8 }}
              value={f.title || ''}
              onChange={e => updateArrayField('features', i, 'title', e.target.value)}
            />
            <textarea
              style={inputStyle} rows={2}
              value={f.desc || ''}
              onChange={e => updateArrayField('features', i, 'desc', e.target.value)}
            />
          </div>
        ))}

        {section === 'howItWorks' && (data.howItWorks || []).map((s, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 8, opacity: 0.5 }}>Step {i + 1}</div>
            <input
              type="text" style={{ ...inputStyle, marginBottom: 8 }}
              value={s.title || ''}
              onChange={e => updateArrayField('howItWorks', i, 'title', e.target.value)}
            />
            <textarea
              style={inputStyle} rows={2}
              value={s.desc || ''}
              onChange={e => updateArrayField('howItWorks', i, 'desc', e.target.value)}
            />
          </div>
        ))}

        {section === 'testimonials' && (data.testimonials || []).map((t, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 8, opacity: 0.5 }}>Review {i + 1}</div>
            <textarea
              style={{ ...inputStyle, marginBottom: 8 }} rows={3}
              value={t.quote || ''}
              onChange={e => updateArrayField('testimonials', i, 'quote', e.target.value)}
            />
            <input
              type="text" style={{ ...inputStyle, marginBottom: 8 }} placeholder="Name"
              value={t.name || ''}
              onChange={e => updateArrayField('testimonials', i, 'name', e.target.value)}
            />
            <input
              type="text" style={inputStyle} placeholder="Role"
              value={t.role || ''}
              onChange={e => updateArrayField('testimonials', i, 'role', e.target.value)}
            />
          </div>
        ))}

        {section === 'pricing' && (data.pricing || []).map((p, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 8, opacity: 0.5 }}>Plan {i + 1}</div>
            <input
              type="text" style={{ ...inputStyle, marginBottom: 8 }} placeholder="Plan Name"
              value={p.plan || ''}
              onChange={e => updateArrayField('pricing', i, 'plan', e.target.value)}
            />
            <input
              type="text" style={{ ...inputStyle, marginBottom: 8 }} placeholder="Price"
              value={p.price || ''}
              onChange={e => updateArrayField('pricing', i, 'price', e.target.value)}
            />
          </div>
        ))}

        {section === 'faq' && (data.faq || []).map((f, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 8, opacity: 0.5 }}>Question {i + 1}</div>
            <textarea
              style={{ ...inputStyle, marginBottom: 8, fontWeight: 600 }} rows={2}
              value={f.q || ''}
              onChange={e => updateArrayField('faq', i, 'q', e.target.value)}
            />
            <textarea
              style={inputStyle} rows={3}
              value={f.a || ''}
              onChange={e => updateArrayField('faq', i, 'a', e.target.value)}
            />
          </div>
        ))}
        
        {/* Placeholder if unknown section */}
        {!['hero','features','howItWorks','testimonials','pricing','faq'].includes(section) && (
          <div style={{ opacity: 0.5, fontSize: '0.85rem' }}>Select a valid section to edit.</div>
        )}

      </div>
    </div>
  )
}

// ── Shared Styles ─────────────────────────────────────────────
const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  marginBottom: '0.4rem',
  opacity: 0.7,
}

const inputStyle = {
  width: '100%',
  background: 'var(--clr-surface)',
  border: '1px solid var(--clr-border)',
  color: 'var(--clr-text)',
  padding: '0.6rem 0.8rem',
  borderRadius: '6px',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  resize: 'vertical',
}

const cardStyle = {
  background: 'var(--clr-surface-2)',
  padding: '1rem',
  borderRadius: '8px',
  border: '1px solid var(--clr-border)',
}
