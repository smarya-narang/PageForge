import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'pageforge_history'
const MAX_ENTRIES = 20

/**
 * useHistory() — persists past generations to localStorage
 * Each entry: { id, prompt, data, html, ts }
 */
export function useHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch {
      // Storage full — silently fail
    }
  }, [history])

  const addEntry = useCallback((entry) => {
    const newEntry = { id: Date.now().toString(), ...entry }
    setHistory(prev => [newEntry, ...prev].slice(0, MAX_ENTRIES))
  }, [])

  const removeEntry = useCallback((id) => {
    setHistory(prev => prev.filter(e => e.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return { history, addEntry, removeEntry, clearHistory }
}
