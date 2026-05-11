import { useEffect } from 'react'
import { getSharedData } from '../utils/shareLink.js'
import { buildHTML } from '../utils/buildHTML.js'

/**
 * ViewPage — full-screen standalone view of a shared landing page.
 * Reads ?share= from URL, builds the HTML, and completely replaces
 * the document so the user sees ONLY the landing page — no PageForge UI.
 */
export default function ViewPage() {
  useEffect(() => {
    const data = getSharedData()

    if (!data) {
      // No valid share data — redirect home
      window.location.href = '/'
      return
    }

    try {
      const html = buildHTML(data, { builderMode: false })
      // Replace the entire document with the clean landing page
      document.open('text/html', 'replace')
      document.write(html)
      document.close()
    } catch (e) {
      console.error('Failed to render shared page:', e)
      window.location.href = '/'
    }
  }, [])

  // Render nothing — the useEffect takes over the whole document
  return null
}
