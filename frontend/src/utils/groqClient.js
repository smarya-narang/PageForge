import { SYSTEM_PROMPT, buildUserPrompt } from './prompts.js'
import { buildHTML } from './buildHTML.js'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
export const GROQ_MODEL = 'llama-3.3-70b-versatile'

/**
 * callGroq(idea, options) → { data, html }
 * Shared by useGenerate and useABGenerate.
 * @param {string} idea
 * @param {{ styleHint?: string, temperature?: number }} options
 */
export async function callGroq(idea, { styleHint = '', temperature = 0.9 } = {}) {
  if (!GROQ_API_KEY) throw new Error('VITE_GROQ_API_KEY is not set. Add it to .env and restart Vite.')

  const userContent = styleHint
    ? `${buildUserPrompt(idea)}\n\nStyle directive: ${styleHint}`
    : buildUserPrompt(idea)

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 2048,
      temperature,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userContent },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Groq API error ${res.status}`)
  }

  const payload = await res.json()
  const raw     = payload.choices?.[0]?.message?.content || ''

  let cleaned = raw.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.split('```')[1]
    if (cleaned.startsWith('json')) cleaned = cleaned.slice(4)
    cleaned = cleaned.split('```')[0].trim()
  }

  const data = JSON.parse(cleaned)
  const html = buildHTML(data)
  return { data, html }
}

/**
 * callGroqSection(idea, section, currentData)
 * Regenerates ONLY the specified section of the page data.
 */
export async function callGroqSection(idea, section, currentData) {
  if (!GROQ_API_KEY) throw new Error('VITE_GROQ_API_KEY is not set.')

  // Strip the section being regenerated so the model can't just copy it back.
  // Hero is special — its data lives at top level (tagline/subheadline/cta).
  const contextData = { ...currentData }
  if (section === 'hero') {
    delete contextData.tagline
    delete contextData.subheadline
    delete contextData.cta
  } else {
    delete contextData[section]
  }

  // Per-section exact schema so the model returns the right shape
  const schemaExamples = {
    hero:         `{ "tagline": "Bold 4-8 word headline", "subheadline": "One value sentence", "cta": "2-4 word button" }`,
    features:     `{ "features": [{"icon":"🚀","title":"Name","desc":"One sentence."},{"icon":"⚡","title":"Name","desc":"One sentence."},{"icon":"🎯","title":"Name","desc":"One sentence."}] }`,
    testimonials: `{ "testimonials": [{"name":"Full Name","role":"Title at Co","quote":"Inspiring quote."},{"name":"Full Name","role":"Title at Co","quote":"Inspiring quote."}] }`,
    pricing:      `{ "pricing": [{"plan":"Free","price":"0","features":["f1","f2","f3"]},{"plan":"Pro","price":"29","features":["f1","f2","f3","f4"]},{"plan":"Enterprise","price":"99","features":["f1","f2","f3","f4","f5"]}] }`,
    howItWorks:   `{ "howItWorks": [{"step":"1","title":"Step","desc":"Short desc."},{"step":"2","title":"Step","desc":"Short desc."},{"step":"3","title":"Step","desc":"Short desc."}] }`,
    faq:          `{ "faq": [{"q":"Question?","a":"Answer."},{"q":"Question?","a":"Answer."},{"q":"Question?","a":"Answer."}] }`,
  }
  const schema = schemaExamples[section] || `{ "${section}": [] }`

  const userContent =
`You are an expert landing page copywriter.
Product idea: ${idea}
Brand: ${currentData.brand || ''}
Other sections for brand context only: ${JSON.stringify(contextData)}

Task: Write a COMPLETELY NEW "${section}" section.
- Be creative and noticeably different from any existing copy above.
- Do NOT repeat any existing phrase, headline, or description.
- Return ONLY valid JSON in this exact shape — no markdown fences, no explanation:
${schema}`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 1024,
      temperature: 1.1,
      messages: [
        { role: 'system', content: 'You are an expert landing page copywriter. Return ONLY valid JSON — no markdown, no extra text.' },
        { role: 'user',   content: userContent },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || 'Groq API error ' + res.status)
  }

  const payload = await res.json()
  const raw     = payload.choices?.[0]?.message?.content || ''

  let cleaned = raw.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.split('```')[1]
    if (cleaned.startsWith('json')) cleaned = cleaned.slice(4)
    cleaned = cleaned.split('```')[0].trim()
  }

  return JSON.parse(cleaned)
}
