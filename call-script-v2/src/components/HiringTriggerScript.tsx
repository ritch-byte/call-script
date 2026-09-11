/*
 * Hiring Trigger Script.
 *
 * Dropped in from HiringTriggerScript.jsx. Three things changed in the port and nothing else:
 *
 *   1. callModel() now goes through lib/ai.ts, the app's single relay path. See the seam below.
 *   2. Tailwind classes became inline style objects, because this app has no Tailwind and every
 *      other generator is styled this way. Layout and colours follow the Personalised Script.
 *   3. .jsx became .tsx with types, because the build runs `tsc && vite build` under strict and
 *      there is no allowJs.
 *
 * UNTOUCHED, because they are content rather than implementation: RATES, COUNTRY, KILL_TLDS,
 * HOLD_WORDS, DEPARTMENTS, GIFT_SENSITIVE, the SYSTEM prompt string, parseLead, runGates,
 * computeRates and buildScript.
 */

import { useState, useMemo, useRef, useEffect } from 'react'
import { callAI } from '../lib/ai'

/* ---------- 1. INTEGRATION SEAM ---------- */

/*
 * This module needs a stronger model than the other generators. The relay takes a `model` and
 * honours it - tested live: claude-sonnet-4-6 comes back as claude-sonnet-4-6.
 *
 * IT IS NOT claude-sonnet-5, AND THAT IS NOT A TYPO. The deployed relay holds an allowlist and
 * silently falls back to Haiku for anything not on it. Asked for claude-sonnet-5 it returned
 * claude-haiku-4-5-20251001 with no error. So the newest Sonnet would quietly give this module
 * exactly the small-model output it exists to avoid. Until the relay's allowlist is updated,
 * claude-sonnet-4-6 is the strongest model that actually arrives.
 */
const MODEL = 'claude-sonnet-4-6'

/*
 * THE SYSTEM PROMPT TRAVELS INSIDE THE USER MESSAGE, and that is the relay's doing rather than
 * a preference. The deployed relay forwards only { model, max_tokens, messages }: an
 * instruction placed in `system` is dropped. Tested both ways - "reply with exactly BANANA" in
 * `system` returned "OK.", the same sentence in the user message returned "BANANA".
 *
 * The SYSTEM string itself is unchanged. It is concatenated, not edited.
 *
 * The proper fix is one line in the relay, `if (req.system) payload.system = req.system`, which
 * is already written in relay/Code.gs and needs someone with Apps Script access to deploy. When
 * that lands, this becomes callAIRaw with a real system field and the concatenation goes.
 */
async function callModel(systemPrompt: string, userPrompt: string): Promise<string> {
  return callAI({
    prompt: `${systemPrompt}\n\n---\n\n${userPrompt}`,
    model: MODEL,
    maxTokens: 1600,
  })
}

/* ---------- 2. RATE TABLE (code-side, never generated) ---------- */

const RATES = {
  admin_support: { local: [30, 36], off: [7, 11] },
  customer_service: { local: [24, 30], off: [6, 10] },
  bookkeeping_accounting: { local: [32, 40], off: [8, 14] },
  payroll_hr_admin: { local: [32, 40], off: [8, 13] },
  sales_development: { local: [32, 40], off: [8, 13] },
  marketing_content: { local: [34, 44], off: [8, 15] },
  ecommerce_marketplace: { local: [36, 46], off: [9, 15] },
  graphic_design: { local: [33, 42], off: [7, 14] },
  architectural_cad_bim: { local: [44, 56], off: [10, 18] },
  software_engineering: { local: [58, 80], off: [17, 30] },
  qa_testing: { local: [45, 60], off: [12, 22] },
  data_analytics: { local: [45, 58], off: [10, 17] },
  recruitment_sourcing: { local: [34, 44], off: [8, 14] },
  legal_support: { local: [37, 48], off: [9, 14] },
  medical_admin_billing: { local: [27, 34], off: [8, 14] },
  logistics_dispatch: { local: [28, 36], off: [7, 12] },
}

// REFRESH THESE. The date renders on screen so reps can see staleness.
const FX_UPDATED = '12 Sep 2026'
const COUNTRY = {
  US: { mult: 1.0, hours: 2080, sym: '$', fx: 1.0, source: 'Indeed' },
  UK: { mult: 0.85, hours: 2080, sym: '£', fx: 0.79, source: 'Glassdoor' },
  AU: { mult: 1.1, hours: 1976, sym: 'A$', fx: 1.45, source: 'SEEK' },
  NZ: { mult: 1.0, hours: 2080, sym: 'NZ$', fx: 1.62, source: 'SEEK' },
  CA: { mult: 0.9, hours: 2080, sym: 'C$', fx: 1.37, source: 'Indeed' },
}

type RateCategory = keyof typeof RATES
type CountryCode = keyof typeof COUNTRY

/* ---------- 3. GATES ---------- */

const KILL_TLDS: Record<string, string> = {
  '.in': 'India', '.ph': 'Philippines', '.vn': 'Vietnam', '.id': 'Indonesia',
  '.bd': 'Bangladesh', '.pk': 'Pakistan', '.lk': 'Sri Lanka', '.eg': 'Egypt',
  '.ke': 'Kenya', '.ng': 'Nigeria', '.ua': 'Ukraine', '.pl': 'Poland',
  '.ro': 'Romania', '.bg': 'Bulgaria', '.rs': 'Serbia', '.co': 'Colombia',
  '.mx': 'Mexico', '.br': 'Brazil', '.ar': 'Argentina',
}

const HOLD_WORDS = ['cannabis', 'marijuana', 'dispensary', 'adult', 'firearm', 'ammunition',
  'gambling', 'casino', 'betting', 'crypto', 'payday', 'tobacco', 'vape']

const DEPARTMENTS = ['design', 'engineering', 'marketing', 'operations', 'finance',
  'sales', 'technology', 'admin', 'it', 'hr', 'legal', 'product', 'support']

const GIFT_SENSITIVE = ['government', 'public sector', 'council', 'defence', 'defense', 'military']

/* ---------- 4. PARSER ---------- */

export interface TriggerFields {
  jobTitle: string
  website: string
  industry: string
  seats: string
  country: CountryCode
}

const URL_RE = /((?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?)/i

export function parseLead(raw: string): TriggerFields {
  // Normalise first. This is what was breaking on multi-line pastes.
  const text = (raw || '')
    .replace(/[\r\n\t|·•,;]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()

  const out: TriggerFields = { jobTitle: '', website: '', industry: '', seats: '', country: 'US' }
  if (!text) return out

  const m = text.match(URL_RE)
  if (!m || m.index === undefined) {
    out.jobTitle = text
    return out
  }

  out.website = m[1]
  out.jobTitle = text.slice(0, m.index).trim()

  const tail = text.slice(m.index + m[1].length).trim()
  if (tail) {
    const words = tail.split(' ')
    // Industry is the shorter leading fragment; seats is the rest.
    // Two words is the common case ("financial services", "marketing advertising").
    const cut = Math.min(words.length > 3 ? 2 : 1, words.length - 1)
    out.industry = words.slice(0, Math.max(cut, 1)).join(' ')
    out.seats = words.slice(Math.max(cut, 1)).join(' ')
    if (!out.seats) {
      out.seats = ''
      out.industry = tail
    }
  }

  const host = out.website.replace(/^https?:\/\//, '').split('/')[0].toLowerCase()
  if (/\.(com\.au|au)$/.test(host)) out.country = 'AU'
  else if (/\.(co\.uk|uk)$/.test(host)) out.country = 'UK'
  else if (/\.(co\.nz|nz)$/.test(host)) out.country = 'NZ'
  else if (/\.ca$/.test(host)) out.country = 'CA'
  else out.country = 'US'

  return out
}

interface Gate {
  stop: string
  msg: string
}

export function runGates(f: TriggerFields): Gate | null {
  const host = f.website.replace(/^https?:\/\//, '').split('/')[0].toLowerCase()
  for (const [tld, name] of Object.entries(KILL_TLDS)) {
    if (host.endsWith(tld)) {
      return { stop: 'KILL', msg: `No cost gap. ${name}-based company already sits in a low-cost delivery market. Skip it.` }
    }
  }
  const ind = f.industry.toLowerCase()
  if (HOLD_WORDS.some(w => ind.includes(w))) {
    return { stop: 'HOLD', msg: 'Restricted industry. Partner acceptance must be confirmed before you dial. Do not book this.' }
  }
  const seat = f.seats.trim().toLowerCase()
  if (seat && DEPARTMENTS.includes(seat)) {
    return { stop: 'BLOCK', msg: "That's a department, not a seat. Go back to the posting and get the job title. The number is the whole pitch and a department name can't be priced." }
  }
  return null
}

/* ---------- 5. RATE MATH ---------- */

interface ComputedRates {
  thin: boolean
  localBand: string
  offBand: string
  gapSpoken: string
  source: string
}

export function computeRates(category: string, countryCode: CountryCode): ComputedRates {
  const r = RATES[category as RateCategory] || RATES.admin_support
  const c = COUNTRY[countryCode] || COUNTRY.US
  const localLo = r.local[0] * c.mult * c.fx
  const localHi = r.local[1] * c.mult * c.fx
  const offLo = r.off[0] * c.fx
  const offHi = r.off[1] * c.fx
  const gapRaw = ((localLo + localHi) / 2 - (offLo + offHi) / 2) * c.hours
  const gap = Math.floor(gapRaw / 5000) * 5000
  const thin = (localLo + localHi) / 2 < ((offLo + offHi) / 2) * 2
  const fmt = (n: number) => `${c.sym}${Math.round(n)}`
  return {
    thin,
    localBand: `${fmt(localLo)} to ${fmt(localHi)}`,
    offBand: `${fmt(offLo)} to ${fmt(offHi)}`,
    gapSpoken: `${c.sym}${gap.toLocaleString()}`,
    source: c.source,
  }
}

/* ---------- 6. SYSTEM PROMPT ---------- */

const SYSTEM = `You generate variable fields for a cold call script. You do not write the script. Return JSON only, no markdown fences, no preamble.

Never wrap any field value in quote marks. Never mention money, rates, percentages, savings or timeframes in any field. Those come from elsewhere.

INPUTS: job title, industry, the seats they are hiring for, optionally a note the rep read on the company's site.

PERSONA MODE.
OWNER if the title is Owner, Founder, Co-Founder, Proprietor, or President/Managing Director of a small firm. They are the economic buyer, pitch directly.
GATEKEEPER if the title is HR, People, Talent Acquisition, Recruiter, Sourcer, Office Manager or Executive Assistant. They own the req and cannot convert it. The ask names a second person. Also write gatekeeper_line, one short line pre-empting the thought that this replaces their function, because a recruiter hears this as a threat before they hear it as help.
MANAGER for everything else including all C-suite. Build on the function in the title. For C-suite the reframe is about the team's time, never the executive's own diary.

audience_descriptor: the specific kind of business they work in. Four to ten words, narrow enough that a competitor in a different niche would not recognise themselves. Good: dance and gymnastics apparel brands releasing several ranges a year. Bad: retail teams. Bad: businesses like yours.

industry_context: two to four concrete nouns an operator there touches daily, real product names where they exist. Must read naturally inside "someone who already knows ___ doesn't need six months of ramp". Good: your MLS, transaction coordination, ISA follow-up. Bad: your systems.

reframe: one spoken sentence recasting hiring as a rate question rather than a recruiting question. Must contradict what they assume, not extend it. If a prospect could nod along to both without noticing a difference it has failed, write a different one. Must read naturally after "Most [job title]s I speak to in [industry]...".

split_needed: true when the posted seat touches what the company sells itself on, or carries licensed, regulated or jurisdiction-specific judgement. A founder's own voice, a locally-made brand's design direction, government or health data, a licensed compliance decision.
split_stays: the part they would never hand over.
split_moves: concrete production work, at least three named tasks.
Both empty when split_needed is false.

problem_question: one short question about the posted seat, answerable in a sentence. Default to how long it has been open.
implication_question: one follow-up making them say what the open seat costs them, in their own words, answerable without a number. Good: and what's not getting done while it sits there. Bad: and how much revenue has that cost you.

talent_line: one spoken sentence on who these people are, built on the posted seat. Seniority, English, years in that exact role. Must end with the fact that the client interviews and chooses. Never promise a replacement window or a time to fill.

constraint: type is brand, regulatory or none.
brand means positioning or identity, a rep can reframe it, so name it before the prospect does.
regulatory means contractual or legal, a rep must never argue it. Hand it to the advisor, in the shape of "I'm not going to guess at that, it's exactly what the longer call is for". Never write a compliance assurance.
Weight the research note heavily if supplied. Without one, only flag what the industry itself makes obvious, else none. A wrongly guessed constraint makes the rep sound like they researched a different company.

objections: four this lead will actually raise, each with a spoken response. First is the constraint objection if flagged. One is "that's not my decision" when mode is GATEKEEPER or MANAGER. One is a version of "isn't offshore worse quality", answered by the fact they interview and choose, never by arguing.

conflict: detected true when the contact's function does not contain the posted seat. note is one line the rep says out loud, in the shape of "I'm guessing that one's not yours". When true, pitch a seat inside the contact's own function and treat the posted seat as evidence the company is scaling.

rate_category: exactly one of admin_support, customer_service, bookkeeping_accounting, payroll_hr_admin, sales_development, marketing_content, ecommerce_marketplace, graphic_design, architectural_cad_bim, software_engineering, qa_testing, data_analytics, recruitment_sourcing, legal_support, medical_admin_billing, logistics_dispatch. Choose on the posted seat, not the contact's title.

BACK-OFFICE TITLES: if the function in the title is already administrative, do not say those people are buried in admin. That is their job description and they will agree without hearing a problem. Move up a level and name the higher-value work the admin displaced.

STAFFING FIRMS: if the company is itself staffing, recruiting or outsourcing, build on billable versus non-billable recruiter time and name sourcing, CV screening, formatting and submissions, compliance checks, database hygiene.

VAGUE INDUSTRY: if the industry is too broad to name concrete tasks (information technology, services, business services, consulting, technology, retail alone), ignore it and build on the function and the seats.

VOICE: spoken English. Short clauses. Plain words said out loud on a phone. No jargon, no buzzwords, no em dashes. Never promise savings, percentages, outcomes, timeframes or replacement terms. Never name a client or customer.

Keys: persona_mode, audience_descriptor, industry_context, reframe, split_needed, split_stays, split_moves, problem_question, implication_question, talent_line, constraint{type,line}, objections[{objection,response}], conflict{detected,note}, rate_category, gatekeeper_line`

/* ---------- 7. SCRIPT ASSEMBLY ---------- */

interface Generated {
  persona_mode?: string
  audience_descriptor: string
  industry_context: string
  reframe: string
  split_needed?: boolean
  split_stays?: string
  split_moves?: string
  problem_question: string
  implication_question: string
  talent_line: string
  constraint?: { type?: string; line?: string }
  objections?: Array<{ objection: string; response: string }>
  conflict?: { detected?: boolean; note?: string }
  rate_category: string
  gatekeeper_line?: string
}

interface Block {
  h: string
  t: string
  stop?: boolean
}

function buildScript(
  f: TriggerFields,
  g: Generated,
  rates: ComputedRates,
  leadName: string,
  myName: string,
  suppressVoucher: boolean,
): Block[] {
  const L = leadName || '[name]'
  const M = myName || '[you]'
  const second = g.conflict?.detected || g.persona_mode === 'GATEKEEPER'
  const blocks: Block[] = []

  blocks.push({ h: 'The open', t:
`Hi ${L}, this is ${M} from Outsource Accelerator. I'll be upfront, this is a cold call, but it's a specific one. Can I have 30 seconds and you can decide if it's worth the rest?

[pause. Let them answer.]

I saw you're hiring ${f.seats}. That's actually why I'm calling.` })

  if (g.conflict?.detected) blocks.push({ h: 'Name the mismatch', t: g.conflict.note || '' })
  if (g.constraint?.type && g.constraint.type !== 'none')
    blocks.push({ h: `Raise it first (${g.constraint.type})`, t: g.constraint.line || '' })

  blocks.push({ h: 'The reframe and the number', t:
`Most ${f.jobTitle}s I speak to in ${f.industry} ${g.reframe}

That seat costs about ${rates.localBand} an hour once you add benefits and overhead. ${rates.source} has the band about where you'd expect, so you'd know better than me where you've pitched it. The same role, dedicated and full time, is about ${rates.offBand} an hour offshore. On one seat that's roughly ${rates.gapSpoken} a year.

That's a range, not a quote. Where you land depends on seniority, and that's what the twenty minutes is for.` })

  blocks.push({ h: 'One question, then stop', t:
`${g.problem_question}

[STOP. Let them answer. Do not fill the silence.]

${g.implication_question}

[STOP.]`, stop: true })

  let why = `Here's why I called you specifically. We're not an agency and we're not a call centre. We're a marketplace of vetted outsourcing partners, and the ones I'd put in front of you work in ${g.audience_descriptor}. Someone who already knows ${g.industry_context} doesn't need six months of ramp.

${g.talent_line}`
  if (g.split_needed)
    why += `\n\nThe point isn't to replace ${g.split_stays}. It's to take ${g.split_moves} off them.`
  blocks.push({ h: 'Why us', t: why })

  blocks.push({ h: 'The ask', t:
`I'm not asking you to change anything today. What I'd like is twenty minutes with you${second ? ', and whoever owns that decision,' : ''} and one of our advisors, to show you what that seat actually looks like and what it costs.

Is Thursday at ten better for you, or Friday after lunch?${g.gatekeeper_line ? '\n\n' + g.gatekeeper_line : ''}` })

  blocks.push({ h: suppressVoucher ? 'Voucher: ask first' : 'The voucher, last', t: suppressVoucher
    ? `Gift policy risk on this one. Ask before offering: "Does your company have a policy on incentives? If so we'll just skip it."`
    : `And so you know I'm serious about not wasting your time, we send a hundred dollar Amazon voucher just for attending. Not for buying anything, not for signing anything. You show up, you get it, even if you tell us it's not for you.` })

  return blocks
}

/* ---------- 8. CACHE (feature-detected, never crashes) ---------- */

const store = {
  get(k: string): any {
    try { const v = window.localStorage.getItem(k); return v ? JSON.parse(v) : null } catch { return null }
  },
  set(k: string, v: unknown) {
    try { window.localStorage.setItem(k, JSON.stringify(v)) } catch { /* no-op */ }
  },
}

/* ---------- 9. COMPONENT ---------- */

const NAVY = '#0f1729'
const MAGENTA = '#d6006e'
const PAPER = '#f7f8fb'
const LINE = '#dfe3ec'
const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
const SANS = '"Helvetica Neue", Helvetica, Arial, system-ui, -apple-system, sans-serif'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px',
  border: `1px solid ${LINE}`,
  borderRadius: 4,
  fontFamily: SANS,
  fontSize: 15,
  color: NAVY,
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
}

const ghostBtn: React.CSSProperties = {
  background: 'none',
  border: `1px solid ${LINE}`,
  borderRadius: 3,
  padding: '6px 12px',
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.04em',
  color: '#4b5563',
  cursor: 'pointer',
}

const LABELS: Record<string, string> = {
  jobTitle: 'job title',
  website: 'website',
  industry: 'industry',
  seats: 'seats',
}
const FIELD_KEYS = ['jobTitle', 'website', 'industry', 'seats'] as const

export default function HiringTriggerScript() {
  const [raw, setRaw] = useState('')
  const [leadName, setLeadName] = useState('')
  const [myName, setMyName] = useState('')
  const [note, setNote] = useState('')
  const [override, setOverride] = useState<TriggerFields | null>(null)
  const [busy, setBusy] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [err, setErr] = useState('')
  const [result, setResult] = useState<{ blocks: Block[]; objections: Array<{ objection: string; response: string }>; rates: ComputedRates } | null>(null)
  const boxRef = useRef<HTMLTextAreaElement>(null)

  const parsed = useMemo(() => parseLead(raw), [raw])
  const fields = override || parsed
  const gate = useMemo(() => (fields.website ? runGates(fields) : null), [fields])

  const missing = FIELD_KEYS.filter(k => !fields[k])
  const ready = missing.length === 0 && !gate

  const found = FIELD_KEYS.filter(k => fields[k]).map(k => LABELS[k]).join(' and ')
  const diag = !raw.trim()
    ? 'Paste the lead above.'
    : missing.length === 0
      ? `Calling a ${fields.jobTitle} in ${fields.industry} who are hiring ${fields.seats}. Based in ${fields.country}.`
      : `Found ${found || 'nothing yet'}. Still need ${missing.map(k => LABELS[k]).join(' and ')}.`

  useEffect(() => { boxRef.current?.focus() }, [])

  /* Same second counter as the other generators: a frozen word with no number reads as broken. */
  useEffect(() => {
    if (!busy) { setElapsed(0); return }
    const started = Date.now()
    const id = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 250)
    return () => clearInterval(id)
  }, [busy])

  async function generate() {
    setErr(''); setBusy(true); setResult(null)
    const key = `hts:${fields.jobTitle}|${fields.industry}|${fields.seats}`.toLowerCase()
    try {
      let g: Generated | null = store.get(key)
      if (!g) {
        const user = `Job title: ${fields.jobTitle}\nIndustry: ${fields.industry}\nSeats they are hiring for: ${fields.seats}\nResearch note from the rep: ${note || 'none supplied'}`
        const txt = await callModel(SYSTEM, user)
        const clean = txt.replace(/```json/gi, '').replace(/```/g, '').trim()
        g = JSON.parse(clean) as Generated
        store.set(key, g)
        const idx: string[] = store.get('hts:index') || []
        store.set('hts:index', [key, ...idx.filter(x => x !== key)].slice(0, 500))
      }
      const rates = computeRates(g.rate_category, fields.country)
      if (rates.thin) { setErr('Gap too thin to motivate a meeting. Skip this lead.'); setBusy(false); return }
      const suppress = GIFT_SENSITIVE.some(w => fields.industry.toLowerCase().includes(w))
      setResult({ blocks: buildScript(fields, g, rates, leadName, myName, suppress), objections: g.objections || [], rates })
    } catch (e) {
      setErr(String((e as Error)?.message || e))
    }
    setBusy(false)
  }

  function nextLead() {
    setRaw(''); setNote(''); setResult(null); setErr(''); setOverride(null)
    boxRef.current?.focus()
  }

  function copyAll() {
    if (!result) return
    navigator.clipboard?.writeText(result.blocks.map(b => b.t).join('\n\n'))
  }

  return (
    <div style={{ fontFamily: SANS, color: NAVY, background: PAPER, minHeight: '100%' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '22px 20px 60px' }}>
        <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: '4px 4px 0 0', padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', color: '#6b7280' }}>
              HIRING TRIGGER SCRIPT
            </span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: '#b6bdc9' }}>
              Rates checked {FX_UPDATED}
            </span>
          </div>

          <textarea
            ref={boxRef}
            rows={4}
            value={raw}
            onChange={e => { setRaw(e.target.value); setOverride(null) }}
            placeholder="Job title, then the website, then the industry, then the seats they're hiring for"
            style={{ ...inputStyle, fontFamily: MONO, fontSize: 13, resize: 'vertical' }}
          />

          <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.5, color: ready ? '#3f9c5a' : '#8b94a5' }}>
            {diag}
          </p>

          {raw.trim() && missing.length > 0 && (
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {FIELD_KEYS.map(k => (
                <input
                  key={k}
                  style={inputStyle}
                  placeholder={LABELS[k]}
                  value={fields[k]}
                  onChange={e => setOverride({ ...fields, [k]: e.target.value })}
                />
              ))}
            </div>
          )}

          {fields.website && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ color: '#8b94a5' }}>Country</span>
              <select
                style={{ border: `1px solid ${LINE}`, borderRadius: 3, padding: '5px 8px', fontFamily: SANS, fontSize: 13, color: NAVY }}
                value={fields.country}
                onChange={e => setOverride({ ...fields, country: e.target.value as CountryCode })}
              >
                {(Object.keys(COUNTRY) as CountryCode[]).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}

          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input style={inputStyle} placeholder="Lead first name" value={leadName} onChange={e => setLeadName(e.target.value)} />
            <input style={inputStyle} placeholder="Your name" value={myName} onChange={e => setMyName(e.target.value)} />
          </div>
          <input
            style={{ ...inputStyle, marginTop: 8 }}
            placeholder="Anything you found on their site (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          {gate && (
            <div style={{ marginTop: 14, borderLeft: `3px solid ${MAGENTA}`, background: '#fdf2f7', padding: '10px 12px' }}>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em', color: MAGENTA }}>{gate.stop}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5, color: '#4b5563', marginTop: 4 }}>{gate.msg}</div>
            </div>
          )}

          <button
            onClick={generate}
            disabled={!ready || busy}
            style={{
              marginTop: 14,
              width: '100%',
              background: ready && !busy ? MAGENTA : '#c9cfda',
              color: '#fff',
              border: 'none',
              borderRadius: 3,
              padding: '11px 20px',
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: '0.08em',
              cursor: ready && !busy ? 'pointer' : 'not-allowed',
            }}
          >
            {busy ? `WRITING ${elapsed}s` : 'WRITE THE SCRIPT'}
          </button>

          {err && (
            <div style={{ marginTop: 12, borderLeft: '3px solid #c98a00', background: '#fdf8ec', padding: '10px 12px', fontSize: 13.5, lineHeight: 1.5, color: '#4b5563' }}>
              {err}
            </div>
          )}
        </div>

        {result && (
          <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderTop: 'none', padding: '22px 26px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button style={ghostBtn} onClick={copyAll}>Copy script</button>
              <button style={ghostBtn} onClick={nextLead}>Next lead</button>
            </div>

            {result.blocks.map((b, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: '#b6bdc9', marginBottom: 5 }}>
                  {b.h.toUpperCase()}
                </div>
                <div
                  style={{
                    whiteSpace: 'pre-wrap',
                    fontSize: 15.5,
                    lineHeight: 1.65,
                    padding: '10px 12px',
                    borderRadius: 3,
                    background: b.stop ? '#fdf8ec' : PAPER,
                    borderLeft: b.stop ? '3px solid #c98a00' : `3px solid ${LINE}`,
                  }}
                >
                  {b.t}
                </div>
              </div>
            ))}

            {result.objections.length > 0 && (
              <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${LINE}` }}>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: '#b6bdc9', marginBottom: 10 }}>
                  IF THEY SAY
                </div>
                {result.objections.map((o, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#4b5563' }}>{o.objection}</div>
                    <div style={{ fontSize: 15, lineHeight: 1.6, color: NAVY, marginTop: 2 }}>{o.response}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 22, paddingTop: 14, borderTop: `1px solid ${LINE}`, fontSize: 12, lineHeight: 1.55, color: '#8b94a5' }}>
              Do not say: a client name, a time to fill, a replacement guarantee, a compliance
              assurance, the staff member's salary, or a percentage saving. Rates are a range, not
              a quote.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
