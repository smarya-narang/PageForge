// ── Word lists ────────────────────────────────────────────────
const DOMAIN = new Set([
  'saas','app','platform','tool','service','marketplace','api','dashboard',
  'software','plugin','extension','bot','ai','ml','mobile','web','desktop',
  'crm','erp','analytics','automation','health','fitness','finance','legal',
  'education','ecommerce','retail','logistics','hr','marketing','sales',
  'design','dev','startup','product','business','agency','studio',
])

const BENEFIT = new Set([
  'helps','enables','allows','makes','turns','converts','transforms',
  'automates','simplifies','speeds','saves','reduces','improves',
  'generates','creates','builds','manages','tracks','analyzes','replaces',
  'streamlines','connects','integrates','monitors','predicts','schedules',
])

const AUDIENCE = new Set([
  'for','teams','developers','designers','founders','managers','creators',
  'entrepreneurs','freelancers','agencies','companies','businesses',
  'students','teachers','doctors','lawyers','coaches','startups','users',
  'professionals','writers','engineers','marketers','owners','clients',
])

/**
 * scorePrompt(text) → { score: 0-100, level: 'low'|'medium'|'high', tips: string[] }
 */
export function scorePrompt(text) {
  if (!text || !text.trim()) return { score: 0, level: 'low', tips: [] }

  const words = text.toLowerCase().trim().split(/\s+/)
  const count = words.length
  const tips  = []
  let score   = 0

  // 1. Length (0–30)
  if (count >= 10)      score += 30
  else if (count >= 6)  score += 20
  else if (count >= 3)  score += 10
  else                  tips.push('Add more detail — at least 6 words works best')

  // 2. Domain / product type (0–20)
  if (words.some(w => DOMAIN.has(w))) score += 20
  else tips.push('Mention the product type (app, SaaS, marketplace…)')

  // 3. Benefit / action verb (0–25)
  if (words.some(w => BENEFIT.has(w))) score += 25
  else tips.push('Describe what it does (helps, automates, converts…)')

  // 4. Target audience (0–25)
  if (words.some(w => AUDIENCE.has(w))) score += 25
  else tips.push('Mention who it\'s for (teams, designers, founders…)')

  const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'
  return { score, level, tips }
}
