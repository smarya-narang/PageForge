/**
 * CodeViewer — scrollable syntax-highlighted HTML view.
 */
export default function CodeViewer({ html, height = 560 }) {
  if (!html) return null

  return (
    <div style={{
      border: '1px solid var(--clr-border)',
      borderRadius: 'var(--r-lg)',
      overflow: 'auto',
      height,
      background: 'var(--clr-bg-2)'
    }}>
      <pre style={{
        fontSize: '0.72rem',
        lineHeight: 1.7,
        padding: '1.25rem',
        color: 'var(--clr-text-2)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        fontFamily: 'var(--font-mono)',
        margin: 0
      }}>
        {html}
      </pre>
    </div>
  )
}
