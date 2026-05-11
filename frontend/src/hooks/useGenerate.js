import { useState, useCallback } from 'react'
import { callGroq } from '../utils/groqClient.js'
import { useHistory } from './useHistory.js'

/**
 * useGenerate() — main generate hook (refactored to use callGroq)
 */
export function useGenerate() {
  const [loading, setLoading]             = useState(false)
  const [pageData, setPageData]           = useState(null)
  const [generatedHTML, setGeneratedHTML] = useState('')
  const [error, setError]                 = useState('')
  const { addEntry }                      = useHistory()

  const generate = useCallback(async (prompt) => {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setPageData(null)
    setGeneratedHTML('')

    try {
      const { data, html } = await callGroq(prompt.trim())
      setPageData(data)
      setGeneratedHTML(html)
      addEntry({ prompt: prompt.trim(), data, html, ts: Date.now() })
    } catch (e) {
      setError(e.message || 'Something went wrong. Check your Groq API key and try again.')
    } finally {
      setLoading(false)
    }
  }, [addEntry])

  const reset = useCallback(() => {
    setPageData(null)
    setGeneratedHTML('')
    setError('')
  }, [])

  const loadEntry = useCallback((entry) => {
    setPageData(entry.data)
    setGeneratedHTML(entry.html)
    setError('')
  }, [])

  return { loading, pageData, setPageData, generatedHTML, error, generate, reset, loadEntry }
}
