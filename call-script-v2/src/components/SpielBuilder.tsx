/**
 * OA Spiel Builder, ported into v2 from the floor's own standalone build.
 *
 * WHAT CHANGED IN THE PORT, and nothing else did:
 *   - JSX is compiled by Vite rather than Babel in the browser, and React comes from
 *     the app rather than a CDN. The integration brief says to do exactly this when the
 *     host has a build step.
 *   - The fetch goes through the app's existing relay (lib/ai.ts) instead of a second
 *     Apps Script deployment. Same one-call-per-click shape, and the key still lives
 *     server side. The model is named once, at MODEL below, rather than in the proxy.
 *   - Two characters were repaired: the dash class in the response cleanup and the dot
 *     separator in the parsed-lead line had both been mangled to latin-1 in transit.
 *
 * THE PROMPT IN buildPrompt IS THE ORIGINAL, including its indentation, with THREE
 * additions recorded below. Every phrase in it was tuned against live calls: the word for word
 * locks, the word caps, the banned words, the delivery marks. Do not reformat it, do not
 * "improve" it, and do not let a formatter re-wrap the template literal.
 *
 * THE ADDITIONS, and the reasons.
 *
 * ONE, beat 4. A rep ran three leads and every spiel
 * named roles that cannot be done offshore: a hotel's GM, front office manager and
 * housekeeping lead; a restaurant's kitchen staff and floor managers. Beat 4 asked for
 * "roles this company would really hire offshore" but never said how to tell, so the
 * writer named the roles the company obviously hires, which for anywhere physical are all
 * on site. It now carries the test - could this person do the whole job on a laptop, with
 * nobody needing them in the building - and the failing examples from those calls.
 *
 * TWO, beat 4. The beat now has to name three roles, one or two on this person's own remit and
 * then one that any firm in the industry needs whatever seat is on the phone: the
 * bookkeeping, the admin, the payroll, the support behind the operation. It goes last and
 * it is the safety net, because the specific roles are a guess about what they are short
 * of and the general one is not.
 *
 * THREE, beat 3 and one paragraph of context. The read now stops after beat 2 and asks
 * what roles the team prioritises. A lead who names one goes straight to the offer, so
 * beats 3 to 7 are the fallback rather than the main path, and beat 3 opens "I see," so it
 * picks the conversation up from a shrug instead of continuing a monologue. The writer is
 * told this, because a beat written as the middle of a monologue reads wrong as the thing
 * you say after silence.
 *
 * Nothing else in the string moved, and the checks confirm it.
 *
 * There is deliberately no regenerate button. A rep finishes the call and moves to the
 * next lead.
 */
import { useState, useMemo } from 'react'
import { callAI } from '../lib/ai'
import { flow } from '../data/flow'

/** Pinned here rather than in a proxy. One click, one call, about 0.36c a spiel. */
const MODEL = 'claude-haiku-4-5-20251001'

const NAVY = '#0f1729'
const MAGENTA = '#d6006e'
const PINK = '#ff5fa8'
const PAPER = '#f7f8fb'
const LINE = '#dfe3ec'

const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
const SANS = '"Helvetica Neue", Helvetica, Arial, system-ui, -apple-system, sans-serif'

/* ------------------------- reading the pasted line -------------------------
   Order does not matter. Each piece is classified on what it looks like.
--------------------------------------------------------------------------- */

const URL_RE =
  /^(https?:\/\/|www\.)|\.(com|net|org|io|co|ai|ph|au|uk|us|ca|nz|sg|de|fr|es|it|nl|se|dk|in|jp|biz|info|dev|app|xyz|group|build)\b/i

const ROLE_RE =
  /\b(chief|head|vp|svp|evp|vice president|director|manager|managing|officer|founder|co-?founder|owner|proprietor|president|principal|partner|lead|supervisor|coordinator|specialist|executive|superintendent|estimator|controller|comptroller|treasurer|counsel|attorney|foreman|buyer|planner|scheduler|dispatcher|recruiter|analyst|engineer|architect|surveyor|producer|editor|admin|c[eftmoi]o|cmo|cro|cpo|chro|cco|gm|md)\b/i

const SUFFIX_RE =
  /\b(inc|llc|l\.l\.c|ltd|limited|corp|corporation|company|group|holdings|partners|associates|enterprises|industries|international|global|plc|pty|gmbh|bv|srl|ag|sons|co)\b\.?$/i

const JOIN_RE =
  /^(inc|llc|ltd|limited|corp|corporation|plc|pty|gmbh|bv|srl|sa|ag|co|company)\b\.?$/i

const ORG_RE =
  /\b(group|holdings|partners|associates|enterprises|industries|solutions|services|systems|technologies|construction|builders|contracting|contractors|studios?|labs?|agency|media|capital|ventures|works|clinic|dental|medical|health|logistics|freight|realty|properties|developments?|engineering|consulting|design|foods?|farms?|motors|automotive|electric|plumbing|roofing|interiors|supply|trading|manufacturing|academy|college|school|bank|insurance|law|legal|hotels?|resorts?|travel|retail|stores?|market|brewing|apparel|fitness|salon|spa|security|cleaning|landscaping|transport|shipping|marine|energy|solar|mining|telecom|software|digital)\b/i

const LABELS: Record<string, RegExp> = {
  title: /^(job\s*)?(title|role|position|designation)$/i,
  company: /^(company|account|org|organisation|organization|business|firm)$/i,
  industry: /^(industry|sector|vertical|niche|space)$/i,
  url: /^(url|site|website|web|domain|link)$/i,
  contact: /^(contact|lead|name|first ?name|prospect|person)$/i,
}

interface Lead {
  title: string
  company: string
  industry: string
  url: string
  contact: string
}

function segments(line: string): string[] {
  const raw = line
    .split(/[,\t|;\n]+/)
    .map(p => p.trim())
    .filter(Boolean)
  const out: string[] = []
  raw.forEach(p => {
    if (out.length && JOIN_RE.test(p)) out[out.length - 1] += ', ' + p
    else out.push(p)
  })
  return out
}

function companyScore(seg: string, url: string): number {
  let s = 0
  if (SUFFIX_RE.test(seg)) s += 3
  if (url) {
    const stem = url
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split(/[/?]/)[0]
      .split('.')[0]
      .toLowerCase()
    const flat = seg.toLowerCase().replace(/[^a-z]/g, '')
    if (stem.length > 3 && (flat.includes(stem) || stem.includes(flat.slice(0, 6)))) s += 4
  }
  const parts = seg.split(/\s+/)
  const caps = parts.filter(w => /^[A-Z]/.test(w)).length
  if (caps >= 1) s += 1
  if (caps >= 2) s += 1
  if (parts.length > 1) s += 1
  if (seg === seg.toLowerCase()) s -= 2
  return s
}

const isUrl = (s: string) => !/\s/.test(s) && URL_RE.test(s)

const urlStem = (url: string) =>
  url
    ? url
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .split(/[/?]/)[0]
        .split('.')[0]
        .toLowerCase()
    : ''

const flatten = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/* A line pasted with no commas: work it out word by word. */
function splitFreeform(text: string, url: string) {
  const toks = text.split(/\s+/).filter(Boolean)
  const stem = urlStem(url)

  const stemRun = (arr: string[]) => {
    if (!stem) return 0
    let acc = ''
    let take = 0
    for (let i = 0; i < arr.length; i++) {
      acc += flatten(arr[i])
      if (stem.startsWith(acc) || stem.includes(acc)) take = i + 1
      else break
    }
    return take
  }

  let company = ''
  let title = ''

  /* the company may sit at the front, if the domain says so */
  const front = stemRun(toks)
  let head = 0
  if (front) {
    company = toks.slice(0, front).join(' ')
    head = front
  }
  const rest1 = toks.slice(head)

  let roleAt = -1
  rest1.slice(0, 6).forEach((t, i) => {
    if (ROLE_RE.test(t)) roleAt = i
  })

  let used = 0
  if (roleAt !== -1) {
    let end = roleAt
    if (/^(of|for|at)$/i.test(rest1[end + 1] || '')) {
      end += 2
      while (
        rest1[end + 1] &&
        /^[A-Z]/.test(rest1[end + 1]) &&
        stem &&
        !stem.startsWith(flatten(rest1[end + 1]))
      )
        end++
    }
    title = rest1.slice(0, end + 1).join(' ')
    used = end + 1
  }

  const rest2 = rest1.slice(used)
  let take = 0
  if (!company) {
    take = stemRun(rest2)
    if (!take) while (rest2[take] && /^[A-Z0-9&]/.test(rest2[take])) take++
    company = rest2.slice(0, take).join(' ')
  }

  /* if the title swallowed the company, hand words back until one turns up */
  const titleToks = title.split(/\s+/).filter(Boolean)
  while (!company && titleToks.length > 1) {
    rest2.unshift(titleToks.pop() as string)
    take = stemRun(rest2)
    if (!take) while (rest2[take] && /^[A-Z0-9&]/.test(rest2[take])) take++
    company = rest2.slice(0, take).join(' ')
  }
  title = titleToks.join(' ')

  return { title, company, industry: rest2.slice(take).join(' ') }
}

export function parseLead(line: string): Lead {
  const found: Lead = { title: '', company: '', industry: '', url: '', contact: '' }
  const left: string[] = []

  segments(line).forEach(segment => {
    let seg = segment
    const kv = /^https?:\/\//i.test(seg)
      ? null
      : seg.match(/^([A-Za-z ]{2,20})\s*[:=]\s*(.+)$/)
    if (kv) {
      const key = Object.keys(LABELS).find(k => LABELS[k].test(kv[1].trim())) as
        | keyof Lead
        | undefined
      if (key && !found[key]) {
        found[key] = kv[2].trim()
        return
      }
      seg = kv[2].trim()
    }
    const toks = seg.split(/\s+/)
    const at = toks.findIndex(isUrl)
    if (at !== -1 && !found.url) {
      found.url = toks.splice(at, 1)[0]
      seg = toks.join(' ').trim()
      if (!seg) return
    }
    left.push(seg)
  })

  if (left.length === 1 && /\s/.test(left[0]) && !found.title && !found.company) {
    const ff = splitFreeform(left[0], found.url)
    if (ff.title && ff.company) {
      found.title = ff.title
      found.company = ff.company
      if (!found.industry) found.industry = ff.industry
      return found
    }
  }

  const rest: string[] = []
  left.forEach(seg => {
    if (!found.title && ROLE_RE.test(seg)) found.title = seg
    else rest.push(seg)
  })

  /* CRM rows often lead with the contact's name. If the website already
     points at one segment, a bare two word name is not the company. */
  let pool = rest
  if (found.url && rest.length > 1) {
    const anchored = rest.some(s => companyScore(s, found.url) >= 4)
    if (anchored)
      pool = rest.filter(s => {
        const person =
          companyScore(s, found.url) < 4 &&
          /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(s.trim()) &&
          !ORG_RE.test(s)
        if (person && !found.contact) found.contact = s.trim()
        return !person
      })
  }

  if (pool.length) {
    const ranked = [...pool].sort(
      (a, b) => companyScore(b, found.url) - companyScore(a, found.url),
    )
    if (!found.company) found.company = ranked.shift() || ''
    if (!found.industry) found.industry = ranked.shift() || ''
    if (!found.title) found.title = ranked.shift() || ''
  }
  return found
}

/** "VP of Marketing" reads back as "VPs of Marketing" */
export function pluralTitle(title: string): string {
  const t = title.trim()
  if (!t) return ''
  const add = (w: string) => (/s$/i.test(w) ? w : w + 's')
  const m = t.match(/^(.*?)(\s+(?:of|for|at)\s+.*)$/i)
  return m ? add(m[1]) + m[2] : add(t)
}

/** The two days the rep can actually offer, counted from today. */
export function offerWindow(now = new Date()) {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const picks: Array<{ name: string; out: number }> = []
  for (let i = 2; i <= 10 && picks.length < 2; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    picks.push({ name: names[d.getDay()], out: i })
  }
  const toSunday = 7 - now.getDay()
  const thisWeek = (p: { out: number }) => p.out < toSunday
  const [a, b] = picks
  const taken = [a.name, b.name]
  const fallbackDay = ['Tuesday', 'Wednesday', 'Thursday'].find(d => !taken.includes(d))
  return {
    offer: `${a.name} or ${b.name}`,
    fallback:
      thisWeek(a) && thisWeek(b)
        ? `next week ${fallbackDay}`
        : `the week after on ${fallbackDay}`,
  }
}

/** The opener is fixed. It is never sent to the model, so it never gets reworded. */
export function buildIntro(contact: string): string[] {
  const lead = (contact || '').split(/\s+/)[0] || '[Lead Name]'
  return [
    `Hey ${lead}? (Pause)`,
    `Oh hey uhh, ${lead}, it's [Your Name] here over at Outsource Accelerator. I know I called you out of the blue here, mind if I grab half a minute? Then you can let me know if it's relevant or not (pause)`,
    `Appreciate that, yeah remind me uhh, have you heard of Outsource Accelerator just by the off chance?`,
    `No? Oh okay, feel free to cut me off if it's not in your wheelhouse.`,
  ]
}

/* ------------------------------- the prompt -------------------------------
   DO NOT EDIT THE STRING BELOW. See the file header.
--------------------------------------------------------------------------- */

export function buildPrompt({
  company,
  title,
  industry,
  url,
}: {
  company: string
  title: string
  industry: string
  url: string
}): string {
  const plural = pluralTitle(title)
  const { offer, fallback } = offerWindow()
  return `Write a cold call opener for an SDR at Outsource Accelerator, the leading marketplace for offshore staffing firms.

  LEAD: ${title}, ${company}${industry ? `, ${industry}` : ''}${url ? `, ${url}` : ''}
  No research and no web access: you know nothing checkable about this company. The website address is there for the kind of firm it signals, nothing more. Do not claim anything you would have had to read on it.${
    industry
      ? ''
      : '\nThe industry was not given. Work it out from the company name and the website address. If it is still unclear, keep beat 1 to the plainest true description of the firm.'
  }

  7 short paragraphs, one blank line between each. No labels, numbering, JSON or preamble. Keep each opening phrase word for word, that is how the floor talks, and fill the rest with this person's world. One or two short sentences per beat, never three, except beat 3.

  It is one continuous read, start to finish. Beats 1 to 6 carry no ask, no meeting request and no sign-off. The ask lives in beat 7 and nowhere else.

  The rep stops after beat 2 and asks what roles the team prioritises. If the lead names one, the rep goes straight to the offer and beats 3 to 7 are never read. Beats 3 to 7 are what the rep falls back on when the answer is vague or there is no role, so beat 3 has to pick the conversation up from a shrug rather than continue a monologue.

  The rep has ALREADY opened the call before beat 1: they greeted the lead by name, gave their own name, said they are from Outsource Accelerator, asked for half a minute and got it. So do not greet, do not introduce yourself, do not name Outsource Accelerator again, do not ask for permission or for time. Start cold on the thumbnail.

  ONE STORY, NOT SIX CLAIMS. The company name is context for you only. Do not say it anywhere in the spiel: the rep refers to "your company". After the thumbnail, THEY are the subject and we do not appear again until beat 5. Each beat picks up what the last one put down: 2 names their day, 3 says what changed about that day, 4 prices it, and only then do we turn up as the answer to something already on the table. Never restart on a new topic. Concrete nouns from their world, never adjectives.

  1. 18 WORDS MAX. "So yeah quick thumbnail on us..." + this word for word, ending on "for": "we're the leading marketplace for offshore staffing firms, built specifically for" + then name what THIS company actually is, in five or six words, the way someone there would describe the place. Not "businesses", not "companies like yours", not "founders like you": their industry, their kind of firm. No bridge phrases like "which basically means". The tail is a NOUN PHRASE naming what they ARE, and it ends there. "post-production studios" is right; "post-production studios scaling their teams" is wrong, because that is what we are ringing to propose.

  2. THE HOMEWORK, the beat that buys the call. 32 WORDS MAX. Word for word, saying "your company" and never the company's actual name: "I made some research about your company... so correct me if I'm off, but ${plural} like you are most likely" + the two activities. Say the title back exactly like that, plural and unchanged. Saying the title back is what makes it land. Then two concrete things that title does hour to hour, joined by "and then". Then word for word: "right?" Pick the two a team could take off their hands, the operational work. Their day is the WORK, never the staffing of it. Beat 3 owns hiring, so nothing about hiring, recruiting, headcount or filling seats, and nothing about offshore, outsourced, BPO or nearshore either. Shape only, never reuse the words or "across the X markets": Head of Partnerships: "carrier and partner deals across the SEA markets... getting them signed, and then getting them actually live."

  3. CHANGE IN THE WORLD, the beat that earns the call and the turn in the story. THREE SHORT SENTENCES, 40 WORDS MAX. "I see, and so what we are seeing from a high level... is that..." then the before and the after, told about THEIR operation: what filling this seat used to take, what it takes now, and the part nobody puts a number on. THE BEFORE AND AFTER MUST BE ACTUAL NUMBERS. "three weeks, now it's eight" works. "weeks, now months" does not, and neither does "harder".

  4. 22 WORDS MAX. "So the big question is" + can they secure world class talent, naming two or three roles this company would really hire offshore, at up to 70% less than local hiring cost, without sacrificing quality? The cost comparison IS this beat.
  THE ROLES MUST BE DOABLE FROM ANOTHER COUNTRY. Put every role through that test before you name it: could this person do the whole job on a laptop, with nobody needing them in the building? A hotel's GM, front office manager and housekeeping lead all fail it; its reservations agents, revenue analysts and accounts payable clerks pass. A restaurant's kitchen staff and floor managers fail; its bookkeeping, payroll admin, supplier ordering and social media pass. Where the work itself is physical, on site or hands on, the offshorable roles are the back office behind it and never the floor.
  NAME THREE, AND MAKE ONE OF THEM GENERAL. One or two tied to this person's own remit, and then one that any firm in this industry needs whatever seat you are talking to: the bookkeeping, the admin support, the payroll, the customer support sitting behind the operation. Say the general one last. It is the safety net, because if the specific roles are not the ones they happen to be short of, that one still lands.

  5. 14 WORDS MAX. "So in response to this, our edge lies in our access to pre-vetted firms." + name in one word what they get back, then real systems, real data security, managed teams, not random freelancers.

  6. 16 WORDS MAX. "And we do it in a way where," + we shortlist and introduce the firms that already run teams like the one you need. End inside THEIR operation: the team feels like theirs, not a vendor.

  7. THE ASK. This beat is already written except for one thing. Say it word for word:
  "I know ${plural} like you [HESITATION]. But would you be opposed to a coffee break style chat just to see if this could work or not, I'm thinking ${offer}? If not maybe ${fallback}?"
  The ONLY words you write are the hesitation, and it is 10 WORDS MAX, one short clause, no full stop inside it. It is the one thing that would really make THIS person pause before saying yes: what they are protecting, what they got burned on, what they think this is going to be. Their words, not ours. Never a generic objection like being busy or not having budget.
  Change nothing else in that beat. No filler words, no stage directions or pauses inside it, no pitching, no recap, no thanks, no extra sentence after it.

  VOICE: spoken, short clauses, contractions, ellipses as pacing marks but at most ONE per beat. No em dashes, corporate filler, feature lists or pricing. Curiosity, not authority. Sell the meeting, not the service.

  DELIVERY MARKS. Write it the way a screenplay is written, so the rep can see the pacing on the page.
  Put [PAUSE] on its own where the rep should stop and let it land: after the thumbnail, after the number in beat 3, and before the ask in beat 7. Two or three across the whole spiel, no more.
  Put a direction in round brackets before the phrase it governs, one word: (slow), (deliberate), (softer). At most one per beat, and only on the line that carries the weight.
  Drop in a spoken filler where a person actually would, like y'know or uh or you know. At most one per beat, and never in beat 1 or beat 7.
  The marks, the directions and the fillers are stage directions and breath. They do NOT count toward the word caps. Count only the words the rep says as content.

  SAY IT ALOUD. A rep reads this at pace on a live call. Short, common, spoken words. Nothing anyone could trip over: not "operationalised", "shepherding", "consolidation", "methodologies", "infrastructure".

  Beats 1, 4, 5 and 6 are ONE short sentence each. No subclauses, no lists.`
}

/* Pauses and directions read as stage marks, not as words to say. */
const MARK_RE =
  /(\[[^\]]{2,20}\]|\((?:slow|slower|slowly|deliberate|softer|soft|warm|warmer|faster|beat|smile|pause|lighter|drop)\))/gi
const IS_PAUSE = /^(pause|beat|silence|long pause)$/i

function ScriptLine({ text, size = 18, dim = NAVY }: { text: string; size?: number; dim?: string }) {
  return (
    <>
      {text.split(MARK_RE).map((part, i) => {
        if (!part) return null
        if (/^\[/.test(part)) {
          const inner = part.slice(1, -1).trim()
          if (IS_PAUSE.test(inner))
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  margin: '0 4px',
                  padding: '1px 7px',
                  borderRadius: 3,
                  background: '#fce7f0',
                  color: MAGENTA,
                  fontFamily: MONO,
                  fontSize: size * 0.6,
                  letterSpacing: '0.1em',
                  verticalAlign: 'middle',
                }}
              >
                {inner.toUpperCase()}
              </span>
            )
          return (
            <span key={i} style={{ color: MAGENTA, fontWeight: 600, borderBottom: `1px dashed ${PINK}` }}>
              {part}
            </span>
          )
        }
        if (/^\(/.test(part))
          return (
            <span key={i} style={{ color: '#9aa3b2', fontStyle: 'italic', fontSize: size * 0.8 }}>
              {part}{' '}
            </span>
          )
        return (
          <span key={i} style={{ color: dim }}>
            {part}
          </span>
        )
      })}
    </>
  )
}

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
  border: 'none',
  padding: 0,
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.04em',
  color: '#6b7280',
  cursor: 'pointer',
  textDecoration: 'underline',
  textUnderlineOffset: 3,
}

export default function SpielBuilder() {
  const [leadLine, setLeadLine] = useState('')
  const [spiel, setSpiel] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  /** Which way the roles question went. '' until the rep says. */
  const [path, setPath] = useState<'' | 'role' | 'vague'>('')

  const { title, company, industry, url, contact } = useMemo(() => parseLead(leadLine), [leadLine])
  const ready = Boolean(title.trim() && company.trim())
  const intro = useMemo(() => buildIntro(contact), [contact])

  /**
   * The read stops here and waits. Beats 1 and 2 have done their job, and what the lead
   * says next decides whether the rest of the pitch is needed at all.
   *
   * Fixed rather than generated: it carries nothing about this lead, and the whole branch
   * hangs off the exact question, so it is not the model's to reword.
   */
  const rolesQuestion = useMemo(() => {
    const lead = (contact || '').split(/\s+/)[0] || '[Lead Name]'
    return `But I'm just curious ${lead}, what type of roles does your team currently prioritize?`
  }, [contact])

  /* Beats 1 and 2, then the question. Beats 3 to 7 only if the answer was a shrug. */
  const opening = spiel.slice(0, 2)
  const rest = spiel.slice(2)
  /* The offer, read from the call script so this and the live flow cannot drift apart. */
  const offer = (flow.value_offer?.script ?? '').split(/\n{2,}/).map(s => s.trim()).filter(Boolean)

  /* Everything up to the question, then the buttons, then whichever branch was tapped. */
  const head = [...intro, ...opening, ...(opening.length ? [rolesQuestion] : [])]
  const tail = path === 'role' ? offer : path === 'vague' ? rest : []
  const onScreen = [...head, ...tail]

  async function generate() {
    if (!ready || loading || spiel.length) return
    setLoading(true)
    setError('')
    try {
      const text = await callAI({
        prompt: buildPrompt({ company, title, industry, url }),
        model: MODEL,
        maxTokens: 900,
      })
      const parts: string[] = []
      let pending = ''
      text
        .split(/\n\s*\n/)
        .map(p =>
          p
            .replace(/^\s*\d+[.)]\s*/, '')
            .replace(/\s*[—–]\s*/g, ', ')
            .replace(/\s+/g, ' ')
            .trim(),
        )
        .filter(Boolean)
        .forEach(p => {
          /* a line that is only a pause or a direction belongs to a beat, not to itself */
          const bare = p.replace(MARK_RE, '').trim()
          if (!bare) {
            if (parts.length) parts[parts.length - 1] += ' ' + p
            else pending += p + ' '
          } else {
            parts.push(pending + p)
            pending = ''
          }
        })
      if (!parts.length) throw new Error('empty')
      setSpiel(parts)
    } catch {
      setError('That did not come back clean. Run it again.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setLeadLine('')
    setSpiel([])
    setError('')
    setCopied(false)
    setPath('')
  }

  function copy() {
    navigator.clipboard?.writeText(onScreen.join('\n\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div style={{ fontFamily: SANS, background: PAPER, minHeight: '100%', color: NAVY, paddingBottom: 48 }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '18px 24px 0' }}>
        <div style={{ background: '#fff', border: `1px solid ${LINE}`, padding: 18 }}>
          <input
            style={inputStyle}
            value={leadLine}
            onChange={e => setLeadLine(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') generate()
              if (e.key === 'Escape') reset()
            }}
            placeholder="Job title, company, industry, website. Any order."
          />
          {leadLine.trim() && (
            <div
              style={{
                marginTop: 9,
                fontFamily: MONO,
                fontSize: 11,
                color: ready ? '#8b94a5' : MAGENTA,
                letterSpacing: '0.02em',
                lineHeight: 1.5,
              }}
            >
              {ready
                ? [title, company, industry, url].filter(Boolean).join('  ·  ')
                : 'Could not read a job title and a company. Try commas between them.'}
            </div>
          )}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
            <button
              onClick={spiel.length ? reset : generate}
              disabled={loading || (!ready && !spiel.length)}
              style={{
                background: ready || spiel.length ? MAGENTA : '#c9cfda',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '10px 20px',
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: '0.08em',
                cursor: ready || spiel.length ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'WRITING' : spiel.length ? 'NEXT LEAD' : 'WRITE THE SPIEL'}
            </button>
            {spiel.length > 0 && !loading && (
              <button onClick={copy} style={ghostBtn}>
                {copied ? 'Copied' : 'Copy the spiel'}
              </button>
            )}
            {leadLine && !spiel.length && !loading && (
              <button onClick={reset} style={ghostBtn}>
                Clear
              </button>
            )}
          </div>
          {error && <div style={{ marginTop: 10, fontSize: 12, color: MAGENTA }}>{error}</div>}
        </div>

        <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderTop: 'none', padding: '26px 26px 22px' }}>
          {head.map((p, i) => (
            <p
              key={i}
              style={{
                margin: i ? '20px 0 0' : 0,
                fontSize: 18,
                lineHeight: 1.65,
                letterSpacing: '-0.01em',
                opacity: i < intro.length && !spiel.length ? 0.75 : 1,
              }}
            >
              <ScriptLine text={p} size={18} />
            </p>
          ))}

          {/* The read stops on the roles question and waits for a human answer. Both
              branches are already written, so whichever the rep taps is instant. */}
          {spiel.length > 0 && (
            <div style={{ marginTop: 26, borderTop: `1px solid ${LINE}`, paddingTop: 18 }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  color: '#8b94a5',
                  marginBottom: 10,
                }}
              >
                WHAT DID THEY SAY?
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {([
                  ['role', 'They named a role'],
                  ['vague', 'Vague, or no role'],
                ] as Array<['role' | 'vague', string]>).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setPath(p => (p === key ? '' : key))}
                    style={{
                      background: path === key ? MAGENTA : '#fff',
                      color: path === key ? '#fff' : NAVY,
                      border: `1px solid ${path === key ? MAGENTA : LINE}`,
                      borderRadius: 4,
                      padding: '9px 16px',
                      fontFamily: MONO,
                      fontSize: 11,
                      letterSpacing: '0.06em',
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tail.length > 0 && (
                <div style={{ marginTop: 22 }}>
                  {tail.map((p, i) => (
                    <p
                      key={i}
                      style={{
                        margin: i ? '20px 0 0' : 0,
                        fontSize: 18,
                        lineHeight: 1.65,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      <ScriptLine text={p} size={18} />
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {!spiel.length && (
            <p style={{ marginTop: 20, fontFamily: MONO, fontSize: 11, color: '#b6bdc9', letterSpacing: '0.06em' }}>
              THE REST LANDS HERE
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
