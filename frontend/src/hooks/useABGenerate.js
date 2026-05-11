import { useState, useCallback } from 'react'
import { callGroq } from '../utils/groqClient.js'

const STYLE_B_HINT =
  'Use a completely different color scheme and aesthetic than the obvious choice. ' +
  'Be bold and unconventional — surprise the user. Different font, different mood.'

/**
 * useABGenerate() — fires two parallel Groq calls to produce two distinct variants.
 * Returns { abLoading, abVariants: {a,b} | null, generateAB, clearAB }
 */
export function useABGenerate() {
  const [abLoading,  setAbLoading]  = useState(false)
  const [abVariants, setAbVariants] = useState(null)

  const generateAB = useCallback(async (prompt) => {
    if (!prompt.trim()) return
    setAbLoading(true)
    setAbVariants(null)

    try {
      const [a, b] = await Promise.all([
        callGroq(prompt.trim(), { temperature: 0.85 }),
        callGroq(prompt.trim(), { styleHint: STYLE_B_HINT, temperature: 1.0 }),
      ])
      setAbVariants({ a, b })
    } catch (e) {
      console.error('A/B generation failed:', e)
    } finally {
      setAbLoading(false)
    }
  }, [])

  const clearAB = useCallback(() => setAbVariants(null), [])

  return { abLoading, abVariants, generateAB, clearAB }
}
