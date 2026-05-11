import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useGenerate }    from '../hooks/useGenerate.js'
import { useABGenerate }  from '../hooks/useABGenerate.js'
import { callGroqSection } from '../utils/groqClient.js'
import PreviewFrame       from '../components/PreviewFrame.jsx'
import CodeViewer         from '../components/CodeViewer.jsx'
import BrandStrip         from '../components/BrandStrip.jsx'
import HistoryDrawer      from '../components/HistoryDrawer.jsx'
import ViewportToggle     from '../components/ViewportToggle.jsx'
import PresetPicker, { applyPreset } from '../components/PresetPicker.jsx'
import ABComparison       from '../components/ABComparison.jsx'
import SidebarEditor      from '../components/SidebarEditor.jsx'
import { scorePrompt }    from '../utils/promptScorer.js'
import { buildHTML }      from '../utils/buildHTML.js'
import { buildShareURL }  from '../utils/shareLink.js'

const EXAMPLES = [
  'A SaaS tool that turns messy Notion pages into clean client proposals',
  'An app for gym owners to manage memberships and class schedules',
  'AI-powered interview coach for software engineering jobs',
  'A marketplace for freelance comic book artists',
  'Subscription service for curated indie coffee from around the world',
  'A browser extension that blocks distractions and tracks deep work sessions',
]

// ── Prompt scorer UI ─────────────────────────────────────────────
function ScoreBadge({ score, level, tips }) {
  const color = level === 'high' ? '#22d3a0' : level === 'medium' ? '#f7c325' : '#f06474'
  const label = level === 'high' ? 'Strong prompt' : level === 'medium' ? 'Could be clearer' : 'Too vague'

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: `${color}18`, border: `1px solid ${color}44`,
        borderRadius: 'var(--r-pill)', padding: '2px 10px',
        fontSize: '0.72rem', fontWeight: 600, color, flexShrink: 0,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block',
        }} />
        {score}/100 · {label}
      </div>
      {tips.slice(0, 2).map((t, i) => (
        <div key={i} style={{
          fontSize: '0.7rem', color: 'var(--clr-text-3)',
          background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
          borderRadius: 'var(--r-pill)', padding: '2px 9px',
        }}>
          💡 {t}
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function Generator() {
  const [prompt, setPrompt]             = useState('')
  const [viewMode, setViewMode]         = useState('preview')
  const [viewport, setViewport]         = useState('desktop')
  const [activePreset, setActivePreset] = useState(null)
  const [copied, setCopied]             = useState(false)
  const [shareCopied, setShareCopied]   = useState(false)
  const [showAB, setShowAB]             = useState(false)

  // Builder Mode State
  const [editingSection, setEditingSection] = useState(null)
  const [regenSection, setRegenSection]     = useState(null)
  const [regenToast, setRegenToast]         = useState('')   // visible feedback

  // Core data
  const { loading, pageData, setPageData, generatedHTML, error, generate, reset, loadEntry } = useGenerate()
  const { abLoading, abVariants, generateAB, clearAB } = useABGenerate()

  const inputRef    = useRef(null)
  const exampleIdx  = useRef(0)
  // Refs so the stable message listener always reads the latest values
  const pageDataRef     = useRef(null)
  const promptRef       = useRef('')
  const regenSectionRef = useRef(null)

  useEffect(() => { pageDataRef.current = pageData },     [pageData])
  useEffect(() => { promptRef.current = prompt },         [prompt])
  useEffect(() => { regenSectionRef.current = regenSection }, [regenSection])

  // ── Iframe Message Listener (Builder events) — stable, never re-registers ──
  useEffect(() => {
    async function handleMessage(e) {
      if (e.data?.type === 'SELECT_SECTION') {
        setEditingSection(e.data.section)
      } else if (e.data?.type === 'REGENERATE_SECTION') {
        const section = e.data.section
        const currentPrompt  = promptRef.current
        const currentData    = pageDataRef.current
        const currentRegen   = regenSectionRef.current

        if (!currentPrompt?.trim() || !currentData || currentRegen) return

        setRegenSection(section)
        setRegenToast(`↻ Regenerating "${section}"…`)
        try {
          const newSectionData = await callGroqSection(currentPrompt.trim(), section, currentData)
          setPageData(prev => ({ ...prev, ...newSectionData }))
          setRegenToast(`✓ "${section}" updated!`)
          setTimeout(() => setRegenToast(''), 2000)
        } catch (err) {
          console.error('Failed to regenerate section:', err)
          setRegenToast(`⚠ Failed: ${err.message}`)
          setTimeout(() => setRegenToast(''), 4000)
        } finally {
          setRegenSection(null)
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, []) // stable — reads state via refs

  // ── Prompt score (live) ───────────────────────────────────────
  const score = useMemo(() => scorePrompt(prompt), [prompt])
  const showScore = prompt.trim().length > 3

  // ── Reset builder states when a new FULL generation arrives ───
  useEffect(() => {
    setActivePreset(null)
    setViewport('desktop')
    setEditingSection(null)
    setRegenSection(null)
  }, [generatedHTML])

  // ── Derived display HTML ──────────────────────────────────────
  const displayData = useMemo(() => {
    if (!pageData || !activePreset) return pageData
    return applyPreset(pageData, activePreset)
  }, [pageData, activePreset])

  // The iframe preview gets builderMode: true so you can click to edit/regen
  const displayHTMLPreview = useMemo(() => {
    if (!displayData) return ''
    try {
      return buildHTML(displayData, { builderMode: true })
    } catch (e) {
      console.error('[buildHTML preview error]', e)
      return ''
    }
  }, [displayData])

  // The code export / download does NOT include the builder script
  const displayHTMLExport = useMemo(() => {
    if (!displayData) return ''
    try {
      return buildHTML(displayData, { builderMode: false })
    } catch (e) {
      console.error('[buildHTML export error]', e)
      return ''
    }
  }, [displayData])

  // ── Handlers ─────────────────────────────────────────────────
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate(prompt) }
  }

  function useExample() {
    const next = EXAMPLES[exampleIdx.current % EXAMPLES.length]
    setPrompt(next)
    exampleIdx.current++
    inputRef.current?.focus()
  }

  function copyCode() {
    navigator.clipboard.writeText(displayHTMLExport)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareLink() {
    if (!displayData) return

    // Build the real ?share= URL — works on ANY device when deployed
    const shareUrl = buildShareURL(displayData)

    // Open it in a new tab so the user can verify it works
    window.open(shareUrl, '_blank')

    // Also copy it to clipboard so they can send it anywhere
    navigator.clipboard.writeText(shareUrl).catch(() => {})

    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 3000)
  }

  function downloadHTML() {
    const blob = new Blob([displayHTMLExport], { type: 'text/html' })
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `${displayData?.brand?.toLowerCase().replace(/\s+/g, '-') || 'landing'}-page.html`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function handleLoadEntry(entry) {
    setPrompt(entry.prompt)
    loadEntry(entry)
    setViewMode('preview')
    setShowAB(false)
    clearAB()
    setEditingSection(null)
  }

  function handleABGenerate() {
    if (!prompt.trim()) return
    setShowAB(true)
    generateAB(prompt)
  }

  function handlePickVariant(variant) {
    loadEntry({ data: variant.data, html: variant.html, prompt })
    setShowAB(false)
    clearAB()
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="fade-up" style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: '1rem',
        flexWrap: 'wrap', marginBottom: '1.75rem',
      }}>
        <div>
          <span className="badge badge-accent" style={{ marginBottom: 10 }}>AI Builder</span>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800,
            letterSpacing: '-0.02em', lineHeight: 1.1,
          }}>
            One sentence →<br />
            <span className="text-gradient">full landing page</span>
          </h1>
          <p style={{ color: 'var(--clr-text-3)', fontSize: '0.875rem', marginTop: 6 }}>
            Describe your product. Groq (Llama 3.3) generates copy, branding &amp; layout.
          </p>
        </div>
        <HistoryDrawer onLoad={handleLoadEntry} />
      </div>

      {/* ── Input ──────────────────────────────────────────────── */}
      <div className="fade-up" style={{ marginBottom: '0.75rem', animationDelay: '0.05s' }}>
        <div className="input-group">
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. A SaaS tool that converts messy Notion pages into client proposals…"
            rows={2}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignSelf: 'flex-end', flexShrink: 0 }}>
            <button
              className="btn btn-primary"
              onClick={() => generate(prompt)}
              disabled={loading || !prompt.trim()}
            >
              {loading
                ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} /> Generating…</>
                : 'Generate ↗'}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleABGenerate}
              disabled={loading || abLoading || !prompt.trim()}
              title="Generate two style variants side by side"
            >
              {abLoading ? '⚡ Testing…' : '⚡ A/B Test'}
            </button>
          </div>
        </div>

        {/* Prompt score badge */}
        {showScore && <ScoreBadge {...score} />}

        {/* Example picker */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)' }}>Try an example:</span>
          <button className="btn btn-ghost btn-sm" onClick={useExample}>Random idea ↻</button>
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && <div className="error-box fade-up" style={{ marginBottom: '1rem' }}>⚠ {error}</div>}

      {/* ── A/B Comparison panel ───────────────────────────────── */}
      {showAB && (
        <ABComparison
          variantA={abVariants?.a ?? null}
          variantB={abVariants?.b ?? null}
          loading={abLoading}
          onPick={handlePickVariant}
          onClose={() => { setShowAB(false); clearAB() }}
        />
      )}

      {/* ── Loading skeleton ────────────────────────────────────── */}
      {loading && (
        <div className="card fade-up" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12, animation: 'pulse 1.5s ease infinite' }}>✦</div>
          <div style={{ color: 'var(--clr-text-2)', fontSize: '0.95rem', fontWeight: 500 }}>
            Designing your landing page…
          </div>
          <div style={{ color: 'var(--clr-text-3)', fontSize: '0.8rem', marginTop: 6 }}>
            Picking fonts, palette, copy &amp; layout
          </div>
          <div style={{ maxWidth: 320, margin: '1.75rem auto 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[80, 60, 40].map((w, i) => (
              <div key={i} className="shimmer" style={{ height: 10, borderRadius: 5, width: `${w}%`, margin: '0 auto' }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Result ─────────────────────────────────────────────── */}
      {pageData && displayHTMLPreview && !loading && (
        <div className="fade-up">

          {/* Brand strip row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'stretch' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <BrandStrip data={displayData} />
            </div>
            {/* Controls */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
              <ViewportToggle value={viewport} onChange={setViewport} />
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setViewMode(v => v === 'preview' ? 'code' : 'preview')}
              >
                {viewMode === 'preview' ? '< > Code' : '⬡ Preview'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={shareLink} title="Opens a live preview in a new tab + copies shareable URL">
                {shareCopied ? '✓ Opened + URL copied!' : '🔗 Live Share ↗'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={copyCode}>
                {copied ? '✓ Copied!' : 'Copy HTML'}
              </button>
              <button className="btn btn-primary btn-sm" onClick={downloadHTML}>
                Download ↓
              </button>
            </div>
          </div>

          {/* Preset picker */}
          <div style={{ marginBottom: 10 }}>
            <PresetPicker
              activePreset={activePreset?.id ?? null}
              onApply={(preset) => setActivePreset(preset)}
            />
          </div>

          {/* Regen toast */}
          {regenToast && (
            <div style={{
              background: 'var(--clr-accent)', color: '#fff',
              padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem',
              fontWeight: 600, marginBottom: 8, display: 'inline-block',
            }}>
              {regenToast}
            </div>
          )}

          {/* Preview or code + Sidebar */}
          <div style={{ display: 'flex', height: 600, border: '1px solid var(--clr-border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
            
            {/* Left side: Iframe or Code */}
            <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
              {viewMode === 'preview'
                ? <PreviewFrame html={displayHTMLPreview} viewport={viewport} height="100%" />
                : <CodeViewer html={displayHTMLExport} height="100%" />
              }
              
              {/* Regen overlay loader */}
              {regenSection && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
                }}>
                  <div style={{ background: 'var(--clr-bg)', padding: '1rem 2rem', borderRadius: 12, fontWeight: 600 }}>
                    <span style={{ animation: 'pulse 1s infinite', display: 'inline-block' }}>⚡</span> Regenerating {regenSection}...
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Sidebar Editor */}
            {editingSection && (
              <SidebarEditor
                section={editingSection}
                data={pageData}
                onChange={setPageData}
                onClose={() => setEditingSection(null)}
              />
            )}
          </div>

          {/* Bottom actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { reset(); setPrompt(''); setShowAB(false); clearAB(); setEditingSection(null) }}>
              ← Start over
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => generate(prompt)}>
              Regenerate All ↻
            </button>
          </div>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {!loading && !pageData && !error && (
        <div className="fade-up" style={{
          border: '1px dashed var(--clr-border)',
          borderRadius: 'var(--r-lg)',
          padding: '3.5rem',
          textAlign: 'center',
          animationDelay: '0.1s',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 14, opacity: 0.15 }}>⬡</div>
          <div style={{ color: 'var(--clr-text-2)', fontSize: '0.95rem', fontWeight: 500 }}>
            Your landing page will appear here
          </div>
          <div style={{ color: 'var(--clr-text-3)', fontSize: '0.8rem', marginTop: 6 }}>
            Type a product idea above and hit{' '}
            <strong style={{ color: 'var(--clr-text-2)' }}>Generate ↗</strong>
            {' '}or try{' '}
            <strong style={{ color: 'var(--clr-text-2)' }}>⚡ A/B Test</strong>{' '}for two variants
          </div>
        </div>
      )}
    </div>
  )
}
