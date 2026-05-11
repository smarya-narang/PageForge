/**
 * shareLink.js — base64 URL encoding for shareable page links
 * Uses `?share=` query param (not hash, so it's copy-pasteable).
 */

function encode(data) {
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(data))))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decode(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) b64 += '='
  return JSON.parse(decodeURIComponent(escape(atob(b64))))
}

/** Build a full shareable URL from pageData JSON */
export function buildShareURL(data) {
  const url = new URL(window.location.origin + '/view')
  url.searchParams.set('share', encode(data))
  return url.toString()
}

/** Read and decode shared data from the current URL, or return null */
export function getSharedData() {
  try {
    const param = new URLSearchParams(window.location.search).get('share')
    return param ? decode(param) : null
  } catch {
    return null
  }
}

/** Remove the ?share= param from the browser address bar without reloading */
export function clearShareParam() {
  const url = new URL(window.location.href)
  url.searchParams.delete('share')
  window.history.replaceState({}, '', url.toString())
}
