/*
 * OA Spiel Builder, ported into v2 from the floor's own standalone build.
 *
 * WHAT CHANGED IN THE PORT, and nothing else did:
 *   - JSX is compiled by Vite rather than Babel in the browser, and React comes from
 *     the app rather than a CDN. The integration brief says to do exactly this when the
 *     host has a build step.
 *   - The IIFE and window.mountSpielBuilder are gone. Vite modules already scope every
 *     name, which is what the closure was for, so this is a default export instead.
 *   - The fetch goes through the app's existing relay (lib/ai.ts) instead of a second
 *     Apps Script deployment. spiel-proxy.gs came with this build and is kept at
 *     relay/spiel-proxy.gs, but PROXY_URL in it is still PASTE_YOUR_EXEC_URL_HERE, so
 *     there is nothing to point at yet and the model is named once at MODEL below. That
 *     is the one place the port is weaker than the brief intends: a pinned proxy cannot
 *     be talked into a bigger model, a client constant can. maxTokens here matches the
 *     proxy's MAX_TOKENS of 800 so the two cannot disagree later.
 *
 *     ONE THING TO WATCH BEFORE DEPLOYING THAT PROXY. It refuses any prompt over
 *     MAX_PROMPT_CHARS, which is 9000. Measured: 8309 for the brief's own test lead, 8407
 *     when the industry is blank because that adds a paragraph, and 8603 for a
 *     deliberately long CRM row (a 74 character title, a five word company, and a URL
 *     with a path). All under, so nothing is broken today, but the headroom is about 400
 *     characters and the lead's own fields are what eat it. Past the line the proxy
 *     answers "Bad request.", which reaches the rep as "That did not come back clean. Run
 *     it again." Running it again cannot help, since the prompt is the same length every
 *     time. Raising MAX_PROMPT_CHARS to 12000 costs nothing and removes the class.
 *   - The panel's own navy header is dropped. v2 already puts "Spiel Builder" in the page
 *     header above it, and two stacked titles read like a mistake.
 *   - Two characters were repaired: the dash class in the response cleanup and the dot
 *     separator in the parsed-lead line had both been mangled to latin-1 in transit.
 *
 * THE PROMPT IN buildPrompt IS THE ORIGINAL, byte for byte, including its indentation and
 * its trailing blank line. Every phrase in it was tuned against live calls: the word for
 * word locks, the word caps, the banned words, the delivery marks. Do not reformat it, do
 * not "improve" it, and do not let a formatter re-wrap the template literal.
 *
 * TWO ADDITIONS TO THE PROMPT, and why they are there anyway.
 *
 * TWO, beat 2. Reps reported the duties reading true but saying nothing: "managing day to
 * day operations", "overseeing the team". The beat already had a specificity test - swap in
 * a different job title and see if it still makes sense - but it was abstract, and the
 * writer graded its own homework generously every time. Beat 3's brochure bans work because
 * they name the actual phrases, so beat 2 now does the same: a ban list of twelve, a
 * requirement that each activity carry a noun only this industry would use, and a second
 * test asking whether the phrase could sit in a job ad for a firm in another industry. A
 * second worked example was added, because one example calibrates the shape but not how
 * specific to be. The parse was audited first and cleared: 16 realistic CRM rows all hand
 * the prompt the exact title that was pasted, so the wrong duties were never a wrong title.
 *
 * ONE, beat 3, and why it is there anyway.
 *
 * Two reps reported the same defect from two different builds. Bedier ran three leads, a
 * hotel and two restaurants, and got the GM, the front office manager, the housekeeping
 * lead, the kitchen staff and the floor managers. Rommel ran a logistics lead on this
 * build and got "an offshore Operations Coordinator to take logistics scheduling off your
 * plate, or a Warehouse Manager to handle the receiving side and keep the warehouse
 * running while you're out in the field". The first role is fine. The second cannot be
 * done from another country, and the sentence even says the lead is out in the field while
 * it happens.
 *
 * Beat 3 asked for titles a lead would recognise on an org chart and never said the roles
 * had to be doable from another country, so the writer named the seats the company
 * obviously has, which for anything physical are all on site. The new second-role rule
 * makes it worse rather than better: told to point at the wider operation, the writer
 * points at the floor, because on a logistics firm the wider operation IS the floor.
 *
 * So beat 3 now carries the laptop test, the failing titles from both reports, the back
 * office that passes instead, and a line aiming the second role at the desk work behind
 * the operation. This edits the string the brief says not to edit. It is here because the
 * alternative is a rep reading an unofferable role aloud on a live call, twice reported,
 * and because the caps, the locks and the delivery marks it protects are all untouched.
 *
 * There is deliberately no regenerate button. A rep finishes the call and moves to the
 * next lead.
 */

import { useState, useMemo } from 'react'
import { callAI } from '../lib/ai'

/** Pinned here until relay/spiel-proxy.gs is deployed and has an /exec URL. */
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
    const kv = /^https?:\/\//i.test(seg) ? null : seg.match(/^([A-Za-z ]{2,20})\s*[:=]\s*(.+)$/)
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
      thisWeek(a) && thisWeek(b) ? `${fallbackDay} next week` : `${fallbackDay} the week after`,
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

  4 short paragraphs, one blank line between each. No labels, numbering, JSON or preamble. Keep each opening phrase word for word, that is how the floor talks, and fill the rest with this person's world. One or two short sentences per beat, never three, except beat 3.

  It is one continuous read. Beats 1 to 3 carry no ask, no question, no meeting request and no sign-off. The only question in the whole spiel is beat 2's "right?", and the ask lives in beat 4 and nowhere else.

  The rep has ALREADY opened the call: they greeted the lead by name, gave their own name, said they are from Outsource Accelerator, asked for half a minute and got it. So do not greet, do not introduce yourself, do not name Outsource Accelerator again, do not ask for permission or for time. Start cold on the thumbnail.

  ONE STORY, NOT FOUR CLAIMS. The company name is context for you only. Do not say it anywhere: the rep refers to "your company". After the thumbnail, THEY are the subject and we barely appear again. Each beat picks up what the last one put down: 2 names their day, 3 names the seats that would take the weight off that day, 4 asks. Never restart on a new topic. Concrete nouns from their world, never adjectives.

  1. 18 WORDS MAX. "So yeah quick thumbnail on us..." + this word for word, ending on "for": "we're the leading marketplace for offshore staffing firms, built specifically for" + then name what THIS company actually is, in five or six words, the way someone there would describe the place. Not "businesses", not "companies like yours", not "founders like you": their industry, their kind of firm. No bridge phrases like "which basically means". The tail is a NOUN PHRASE naming what they ARE, and it ends there. "post-production studios" is right; "post-production studios scaling their teams" is wrong, because that is what we are ringing to propose.

  2. THE HOMEWORK, the beat that buys the call. 50 WORDS MAX. Say "your company", never the company's actual name. The shape is word for word, and the only words you write are the two bracketed parts:
  "I made some research about your company... and it looks like you're doing a really good job with [WHAT THEY ARE PLAINLY GOOD AT], so correct me if I'm off, but ${plural} like you are most likely [ACTIVITY ONE] and then [ACTIVITY TWO], right?"

  THE COMPLIMENT, four to seven words. Something a firm like theirs is visibly doing right, said plainly. It has to be true of them without you having checked anything, so no awards, no numbers, no client names, no claims about growth. Nothing gushing, nothing that sounds read off a page: one warm line and move on.

  THE TWO ACTIVITIES. Both must belong to THIS exact title, not to the industry in general and not to the person's boss. Say the title back exactly as given, plural and unchanged, because that is what makes it land.
  EACH ACTIVITY NEEDS A NOUN ONLY THIS INDUSTRY WOULD USE, the thing they are actually handling: carrier contracts, shop drawings, reservation inventory, specimen batches, freight invoices, case files, retainer scopes. That noun is what puts the sentence in one industry and nowhere else, and it is the whole job of this beat.
  THE TEST, and run both on both activities. One: could this phrase sit word for word in a job ad for a firm in a completely different industry? Two: could you swap in a different job title at this same firm and have it still make sense? Either one yes and you rewrite it. True is not the bar. A lead who hears their own job described in words that would fit anyone learns nothing about whether this call is worth taking.
  BANNED, because every one of them is true and says nothing: "managing day to day operations", "overseeing the team", "running the business", "handling the workload", "keeping things on track", "managing multiple priorities", "coordinating across teams", "ensuring smooth operations", "managing stakeholders", "overseeing projects", "handling the admin", "driving results".
  Pick the two a team could take off their hands, the operational work. Their day is the WORK, never the staffing of it. Nothing about hiring, recruiting, headcount or filling seats, and nothing about offshore, outsourced, BPO or nearshore either. Shape only, never reuse the words or "across the X markets": Head of Partnerships: "carrier and partner deals across the SEA markets... getting them signed, and then getting them actually live." Head of Supply Chain at a dealer group: "parts ordering across the dealerships... getting the stock forecast right, and then chasing the back orders."

  3. THE ROLES. 55 WORDS MAX, two or three short sentences. This is the beat that has to sound like a person, not a proposal.

  Open word for word, always this exact line, never a variation of it: "Here's where it gets interesting..." It comes straight off beat 2's "right?", so it lands as a turn in the call, not as a new topic. Do not put anything in front of it and do not add a sentence between it and the roles.

  Then suggest the roles, lightly, the way you would float an idea rather than present a finding. Word for word: "so yeah I think a great starting point to help is" + an offshore role + "to" + what it takes off them, then "or a" + a second role + "to" + what that one takes off them. Two roles, that is all. Keep it easy, keep it short, and let it sound like a thought rather than a recommendation.
  THE TWO ROLES DO DIFFERENT JOBS. The FIRST one is theirs: it sits directly under this person's own remit and takes work off the desk you described in beat 2, so they feel it personally. The SECOND one is the company's: a seat a firm in their industry carries regardless of who is in this person's chair, and it should point at the wider operation rather than at their own queue. Two roles, one close in and one further out, never two versions of the same seat.
  BOTH ROLES MUST BE DOABLE FROM ANOTHER COUNTRY. The test, before you name either one: could this person do the whole job on a laptop, with nobody needing them in the building? A warehouse manager, a site foreman, a front office manager, a housekeeping lead, kitchen staff, floor managers all fail it, because the job is where the work is. The back office behind them passes: purchasing and inventory coordinators, order processing, freight and customs documentation, dispatch scheduling, bookkeeping, payroll, customer support. Watch the SECOND role hardest. Pointing at the wider operation is exactly what pulls you onto the floor, so aim it at the desk work behind the operation, never at the operation itself.
  Real job titles a lead would recognise on an org chart. End the beat there, on the second role. No question, no follow up, no handing it back to them.

  WE ARE NOT IN THIS BEAT. The subject is them, their desk, or the role itself. Never us and never what we do. BANNED outright: "we typically place", "we provide", "we can give you", "we work with", "we help", "what we do is", "our clients", "our partners", and any sentence at all whose subject is we, our, us or I. If a sentence could be moved onto a company website unchanged, rewrite it.

  Say offshore plainly here, that is the whole point of the beat. No costs, no percentages, no promises about quality, no pitching us. BANNED, they are what makes this sound like a brochure: "focus on strategy", "scale", "scaling", "time to market", "cross-functional", "bandwidth", "streamline", "leverage", "end to end", "solutions", "drive growth".

  4. THE ASK. This beat is already written except for one thing. Say it word for word:
  "I know great ${plural} like you [HESITATION], but I wanted to see if you'd be completely opposed to carving out 15 minutes for a coffee-break style chat, just to see if this could work or not, maybe this coming ${offer}? If you're busy we can do it on ${fallback}?"
  The ONLY words you write are the hesitation, and it is 10 WORDS MAX, one short clause, no full stop inside it. It is the one thing that would really make THIS person pause before saying yes: what they are protecting, what they got burned on, what they think this is going to be. Their words, not ours. Never a generic objection like being busy or not having budget.
  Change nothing else in that beat. No filler words, no stage directions or pauses inside it, no pitching, no recap, no thanks, no extra sentence after it.

  VOICE: spoken, short clauses, contractions, ellipses as pacing marks but at most ONE per beat. No em dashes, corporate filler, feature lists or pricing. Curiosity, not authority. Sell the meeting, not the service.

  DELIVERY MARKS. Write it the way a screenplay is written, so the rep can see the pacing on the page.
  Put [PAUSE] on its own after the thumbnail and again before the ask in beat 4, where the rep should stop and let it land. Two, no more.
  Put a direction in round brackets before the phrase it governs, one word: (slow), (deliberate), (softer). At most one across the whole spiel, and never anywhere inside beat 2, beat 3 or beat 4. Those three run clean, with no direction in front of them and none in the middle of them. A direction dropped between "or a" and a job title breaks the line the rep is saying.
  Drop in a spoken filler where a person actually would, like y'know or uh. At most one per beat, and never in beat 1 or beat 4.
  The marks, the directions and the fillers are stage directions and breath. They do NOT count toward the word caps. Count only the words the rep says as content.

  SAY IT ALOUD. A rep reads this at pace on a live call. Short, common, spoken words. Nothing anyone could trip over: not "operationalised", "shepherding", "consolidation", "methodologies", "infrastructure".

  Beat 1 is ONE short sentence. No subclauses, no lists.

  `
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
            <span
              key={i}
              style={{ color: MAGENTA, fontWeight: 600, borderBottom: `1px dashed ${PINK}` }}
            >
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

/* --------------------------------- app --------------------------------- */

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

  const { title, company, industry, url, contact } = useMemo(() => parseLead(leadLine), [leadLine])
  const ready = Boolean(title.trim() && company.trim())
  const intro = useMemo(() => buildIntro(contact), [contact])

  async function generate() {
    if (!ready || loading || spiel.length) return
    setLoading(true)
    setError('')
    try {
      const text = await callAI({
        prompt: buildPrompt({ company, title, industry, url }),
        model: MODEL,
        maxTokens: 800,
      })
      const toParas = (chunk: string) => {
        const out: string[] = []
        let pending = ''
        chunk
          .split(/\n\s*\n/)
          .map(p =>
            p
              .replace(/^\s*\d+[.)]\s*/, '')
              .replace(/^\s*[A-E][.)]\s+/, '')
              .replace(/\s*[—–]\s*/g, ', ')
              .replace(/\s+/g, ' ')
              .trim(),
          )
          .filter(Boolean)
          .forEach(p => {
            /* a line that is only a pause or a direction belongs to a beat, not to itself */
            const bare = p.replace(MARK_RE, '').trim()
            if (!bare) {
              if (out.length) out[out.length - 1] += ' ' + p
              else pending += p + ' '
            } else {
              out.push(pending + p)
              pending = ''
            }
          })
        return out
      }
      const parts = toParas(text)
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
  }

  const script = useMemo(() => (spiel.length ? [...intro, ...spiel] : intro), [intro, spiel])

  function copy() {
    navigator.clipboard?.writeText(script.join('\n\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div
      style={{
        fontFamily: SANS,
        background: PAPER,
        minHeight: '100%',
        color: NAVY,
        paddingBottom: 48,
      }}
    >
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
          <div
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'center',
              flexWrap: 'wrap',
              marginTop: 14,
            }}
          >
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

        <div
          style={{
            background: '#fff',
            border: `1px solid ${LINE}`,
            borderTop: 'none',
            padding: '26px 26px 22px',
          }}
        >
          {script.map((p, i) => (
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

          {!spiel.length && (
            <p
              style={{
                marginTop: 20,
                fontFamily: MONO,
                fontSize: 11,
                color: '#b6bdc9',
                letterSpacing: '0.06em',
              }}
            >
              THE REST LANDS HERE
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
