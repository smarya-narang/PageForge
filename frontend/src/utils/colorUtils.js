/**
 * isDark(hex) → true if the hex color is perceived as dark.
 */
export function isDark(hex = '#000000') {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  // Perceived luminance (WCAG formula)
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum < 140
}

/**
 * contrastColor(hex) → '#fff' or '#000' depending on which
 * contrasts better against the given background hex.
 */
export function contrastColor(hex = '#000000') {
  return isDark(hex) ? '#ffffff' : '#0a0a0a'
}

/**
 * hexToRgba(hex, alpha) → 'rgba(r, g, b, alpha)'
 */
export function hexToRgba(hex = '#000000', alpha = 1) {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
