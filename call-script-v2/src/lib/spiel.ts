// Spiel builder: one line in, researched cold-open out.
// Prompt construction and scoring live here so the component stays presentational.

export interface Receipt {
  fact: string
  where: string
  /** 'verified' only survives if we could check it (search evidence or a quote we matched). */
  confidence: 'verified' | 'inferred'
  /** Verbatim span from the pasted source text. Used to prove a 'verified' claim. */
  quote?: string
}

export interface Brief {
  company: string
  title: string
  website?: string
  what_they_do?: string
  size_signal?: string
  receipts?: Receipt[]
  role_scope?: string
  role_kpis?: string[]
  offshore_roles?: string[]
  role_pain?: string
  hook?: string
  avoid?: string
}

export interface Beat {
  id: string
  label: string
  hint: string
  text: string
}

export interface Objection {
  objection: string
  agree: string
  inform: string
  question: string
}

export interface OAProfile {
  positioning: string
  network: string
  savings: string
  proof: string
  mechanic: string
}

export type Tone = 'measured' | 'house' | 'high'

/**
 * Seconds a researched cold open can run before it drags.
 * Kept consistent with the 150-190 word target below: 190 words at 2.6 words
 * per second is ~73s, so a spiel that obeys the brief must read green.
 */
export const WINDOW = 80

export const BEATS: Array<Omit<Beat, 'text'>> = [
  { id: 'thumbnail',  label: 'Thumbnail',      hint: 'Who we are, in one breath' },
  { id: 'homework',   label: 'The homework',   hint: 'Proof the rep actually looked them up, one real detail' },
  { id: 'observation',label: 'Their world',    hint: "The tension inside this exact role's remit" },
  { id: 'question',   label: 'The big question', hint: "The reframe, in this role's own metrics" },
  { id: 'superpower', label: 'Our superpower', hint: 'Why we are different' },
  { id: 'howitlands', label: 'How it lands',   hint: 'What it feels like, tied to their operation' },
  { id: 'ask',        label: 'The ask',        hint: 'Soft permission for 15 minutes' },
  { id: 'calendar',   label: 'Calendar',       hint: 'Two options, close it' },
]

export const DEFAULT_OA: OAProfile = {
  positioning:
    "the world's leading marketplace for offshore staffing, built specifically for connecting businesses to vetted offshore firms",
  network: '4,000+ pre-vetted BPO and staffing firms',
  savings: 'up to 70% less than local hiring cost',
  proof:
    'enterprise-grade infrastructure, data security, and managed teams, not random remote freelancers',
  mechanic:
    'we shortlist and introduce the firms that already run teams like the one you need, so you plug into a high-performing team instead of building one',
}

/**
 * Positioning lines we have shipped as the default and since replaced.
 *
 * The profile is saved per browser, so a rep who has already opened the builder
 * keeps whatever was default at the time. Without this list, changing the wording
 * above would only affect brand new browsers and the floor would keep reading the
 * retired line.
 */
export const SUPERSEDED_POSITIONING = [
  "the world's leading outsourcing marketplace, built specifically for connecting businesses to vetted offshore staffing firms",
]

/**
 * Bring a saved profile up to date. A field the rep never touched (still equal to
 * a retired default) is moved to the current default; anything they actually
 * edited is left alone, since that edit was deliberate.
 */
export function migrateProfile(saved: Partial<OAProfile> | null | undefined): OAProfile {
  const merged: OAProfile = { ...DEFAULT_OA, ...(saved || {}) }
  const norm = (s: string) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase()
  if (SUPERSEDED_POSITIONING.some(old => norm(old) === norm(merged.positioning))) {
    merged.positioning = DEFAULT_OA.positioning
  }
  return merged
}

export const TONES: Record<Tone, string> = {
  measured: 'Calm, consultative, senior to senior. Fewer fillers, steadier pace.',
  house: 'The house voice in the exemplar. Conversational fillers, ellipsis pacing, light swagger.',
  high: 'High energy, faster cadence, more pattern interrupt, still not salesy.',
}

const EXEMPLAR = `So yeah quick thumbnail on us. we are the leading Global Marketplace built specifically for connecting businesses to global talent networks...

And so what we are seeing from a high-level... is that... most firms are stuck choosing between paying premium for local talents or gambling on unverified freelancers.

So the big question is is it possible to secure world-class talent (if you're going after support/dev/admin) at 80% less than local hiring costs, without sacrificing quality?

So in response to this, our superpower, lies in our access to pre-vetted firms. Think enterprise-grade infrastructure, data security, and managed teams... not just random remote workers.

And we do it in a way where, you can plug into high-performing teams instantly... Pretty bananas in this space...

But super simple (Name), I know people worry about risk of new partners, but I wanted to see if you'd be completely opposed to carving out 15 minutes for a coffee-break style chat, just to share our lesser-known approach to high-caliber staffing."

Does Thursday or Friday afternoon work for you?`

// ── Timing ────────────────────────────────────────────────────────────────

export const wordCount = (s: string) => (s || '').trim().split(/\s+/).filter(Boolean).length
export const speakSeconds = (s: string) => Math.round(wordCount(s) / 2.6)
export const fmtTime = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

// ── Single-box editing ────────────────────────────────────────────────────

/**
 * Beat text must stay a single paragraph, otherwise joining beats into one box
 * and splitting them back apart would not round-trip.
 */
export const oneParagraph = (s: string) => (s || '').replace(/\n{2,}/g, '\n').trim()

/** The spiel as it appears in the single edit box. */
export const joinBeats = (beats: Beat[]) =>
  beats.map(b => b.text.trim()).filter(Boolean).join('\n\n')

/**
 * Map hand-edited text back onto beats so reroll survives ordinary editing.
 * Returns null when the paragraph count no longer matches, which is the signal
 * to fall back to free text rather than guess which paragraph is which beat.
 */
export function remapParagraphs(beats: Beat[], text: string): Beat[] | null {
  const parts = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
  if (beats.length === 0 || parts.length !== beats.length) return null
  return beats.map((b, i) => ({ ...b, text: parts[i] }))
}

// ── Evidence checking ─────────────────────────────────────────────────────

const normalize = (s: string) =>
  (s || '').toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim()

/**
 * A receipt may only claim 'verified' if we can actually check it:
 *   - the model ran a live web search on this response, or
 *   - it supplied a quote that really appears in the source text the rep pasted.
 * Everything else is downgraded to 'inferred' so the rep hedges it on the call.
 */
export function verifyReceipts(
  receipts: Receipt[] | undefined,
  sourceText: string,
  searchEvidence: boolean,
): Receipt[] {
  const haystack = normalize(sourceText)
  return (receipts || []).map(r => {
    if (r.confidence !== 'verified') return { ...r, confidence: 'inferred' as const }
    if (searchEvidence) return r
    const quote = normalize(r.quote || '')
    if (quote.length >= 8 && haystack.includes(quote)) return r
    return { ...r, confidence: 'inferred' as const }
  })
}

// ── Prompt fragments ──────────────────────────────────────────────────────

const styleRules = (tone: Tone, pacing: boolean) => `STYLE RULES, non negotiable:
- Never use em dashes. Use commas, periods, or ellipses instead.
- ${
  pacing
    ? 'Use ellipses (...) as spoken pacing marks the way the exemplar does. They mark where the rep breathes.'
    : 'Do not use ellipses. Clean punctuation only.'
}
- Write for the ear. Short clauses, contractions, sounds like a person talking.
- No corporate filler, no feature lists, no pricing.
- Sell the meeting, not the service.
- Tone: ${TONES[tone]}`

const HOMEWORK_RULES = `HOMEWORK RULES, these are what make the call land:

The rep must sound like someone who spent ten minutes on this company before dialling, not someone reading a template. That means:

1. Reference something real and checkable. Use only facts from the receipts list in the brief. Say them the way a person who actually looked would say them, for example "I was on your careers page and saw you're hiring three more support reps", not "I noticed your commitment to excellence".
2. Never state a fact that is not in the receipts list. Any receipt marked inferred MUST be hedged out loud and invite the correction: "correct me if I'm off, but it looks like most of your delivery team sits in Manchester". A hedge that invites correction builds more credibility than false certainty, and it opens the conversation.
3. Speak to the ROLE, not the company. This person owns a specific remit and gets measured on specific things. Use their vocabulary and their numbers, not generic business language. A support leader hears backlog, response time, cost per ticket. An engineering leader hears velocity, hiring pipeline, burn. Match the vocabulary to the title in the brief.
4. Do not flatter. No "impressive growth", no "love what you're building". Observation, then tension, then question.
5. Do not reveal how you found the information. No "according to your LinkedIn". Just say what you saw.`

const oaBlock = (oa: OAProfile) => `OUTSOURCE ACCELERATOR, the seller:
- Positioning: ${oa.positioning}
- Network: ${oa.network}
- Cost angle: ${oa.savings}
- Credibility: ${oa.proof}
- How it works: ${oa.mechanic}`

// ── Prompts ───────────────────────────────────────────────────────────────

export function buildBriefPrompt(raw: string, sourceText: string): string {
  const grounded = sourceText.trim().length > 0
  return `An outbound SDR at Outsource Accelerator, an offshore staffing marketplace, pasted this cold call target. It contains a company name, a job title, and a website in some order:

"""
${raw}
"""
${
  grounded
    ? `\nThe rep also pasted raw text they copied from the company's own site or profile. This is your ONLY source of checkable fact:\n"""\n${sourceText.slice(0, 6000)}\n"""\n`
    : `\nThe rep pasted no source material, and you have NO web access. You therefore know nothing checkable about this specific company.\n`
}
Work out which part of the paste is the company, the title, and the website, then build a brief the rep can dial from.

Answer ONLY with JSON, no preamble, no fences:

{
 "company": "clean company name",
 "title": "the job title of the person being called",
 "website": "url or empty string",
 "what_they_do": "one plain sentence a rep can say out loud, hedged if you are inferring it from the name alone",
 "size_signal": "headcount, offices or growth signal ONLY if it appears in the source text, else 'not found'",
 "receipts": [
   {"fact": "a specific checkable detail phrased so a rep can say it out loud on a call", "where": "where it came from, or your reasoning if inferred", "confidence": "verified", "quote": "the exact words from the source text that prove this"}
 ],
 "role_scope": "what someone with this exact title actually owns day to day at a company this size and shape, one sentence",
 "role_kpis": ["2 to 4 things this person is personally measured on"],
 "offshore_roles": ["3 to 5 specific roles this company plausibly hires offshore, based on what they actually do"],
 "role_pain": "the operational tension this person feels between their targets and their headcount budget, one sentence",
 "hook": "the single most specific non generic observation that could open this call",
 "avoid": "anything a rep should not say to this company, one sentence"
}

Rules for receipts, these matter more than anything else:
- Give 3 to 5 receipts. Order them most specific first.
- Mark confidence "verified" ONLY for a fact that appears in the source text above, and include the exact proving words in "quote". A verified receipt with no quote will be rejected.
- Mark confidence "inferred" for anything that is a reasonable read on the role or industry rather than something you were shown. Leave "quote" empty and put your reasoning in "where".
- ${grounded ? 'If the source text is thin, return fewer verified receipts. Never pad.' : 'You were given no source text, so EVERY receipt must be "inferred" with an empty quote. Do not invent open roles, headcount, locations, funding, or client names.'}
- Never invent a receipt. An empty receipts list is far better than a wrong one, because the rep will be caught on the call.
- Prefer receipts that touch headcount: open roles, team locations, recent expansion, service lines that need people.`
}

export function buildSpielPrompt(
  raw: string,
  brief: Brief | null,
  oa: OAProfile,
  tone: Tone,
  pacing: boolean,
  days: string,
): string {
  return `You write cold call spiels for outbound SDRs at Outsource Accelerator.

Reproduce the STRUCTURE and VOICE of this exemplar, but rewrite every line so it is specific to this company and this person's role. Do not reuse the exemplar's phrasing verbatim. Never reuse "Pretty bananas".

EXEMPLAR:
"""
${EXEMPLAR}
"""

${oaBlock(oa)}

${
  brief
    ? `RESEARCH BRIEF:\n${JSON.stringify(brief, null, 2)}`
    : `LEAD, unparsed, work out the company and title yourself: ${raw}\nYou have NO research. Do not state any specific fact about this company. Write the homework beat as an honest role level observation instead, with no invented details.`
}

${HOMEWORK_RULES}

${styleRules(tone, pacing)}

Beat requirements:
1. thumbnail: who Outsource Accelerator is, one breath. Use the Positioning line's own
   words for the identity clause. Do not reword it, shorten it to a synonym, or swap in
   your own phrase for what kind of marketplace we are. Then, in the same breath, frame
   it for this company's industry, so it lands as specific rather than boilerplate.
2. homework: the proof the rep did the work. Lead with the strongest receipt, said plainly, and hedge it if it is marked inferred. Two sentences maximum. This is the beat that buys the next thirty seconds.
3. observation: the tension inside this person's specific remit, using role_scope and role_kpis. Not a generic market statement.
4. question: the reframe. Name the actual roles from offshore_roles and the cost angle, and tie it to a metric this person is measured on. Ends in a question mark.
5. superpower: why pre-vetted firms beats the alternative this person is currently stuck with.
6. howitlands: what it feels like in practice, one short line, tied to their actual operation.
7. ask: soft permission for 15 minutes. Name the objection you expect from this role first, then ask. Address the person as (Name) so the rep fills it in live.
8. calendar: close with these options: ${days}.

Respond ONLY with JSON, no preamble, no fences:
{"beats":[{"id":"thumbnail","text":"..."},{"id":"homework","text":"..."},{"id":"observation","text":"..."},{"id":"question","text":"..."},{"id":"superpower","text":"..."},{"id":"howitlands","text":"..."},{"id":"ask","text":"..."},{"id":"calendar","text":"..."}]}

Length: aim for 150 to 185 words across all eight beats combined, and never exceed 190.
That is roughly a minute of speech. Count before you answer. If you are over, cut adjectives
and subordinate clauses from the middle beats, not from the homework beat.`
}

export function buildRerollPrompt(
  beat: Beat,
  fullScript: string,
  brief: Brief | null,
  raw: string,
  oa: OAProfile,
  tone: Tone,
  pacing: boolean,
): string {
  return `Rewrite one beat of a cold call spiel. Same job, different angle. Do not repeat the current wording.

${oaBlock(oa)}

${brief ? `RESEARCH BRIEF:\n${JSON.stringify(brief, null, 2)}` : `LEAD, unparsed: ${raw}`}

${HOMEWORK_RULES}

FULL CURRENT SPIEL, for continuity:
"""
${fullScript}
"""

Rewrite this beat only. Its job: ${beat.hint}.
Current version: "${beat.text}"

${
  beat.id === 'homework'
    ? 'Use a DIFFERENT receipt from the brief than the one currently used. Same rules apply: nothing outside the receipts list, hedge anything inferred.\n'
    : ''
}${styleRules(tone, pacing)}

Respond with the new line of spoken script and nothing else. No labels, no quotes, no commentary.`
}

export function buildObjectionPrompt(
  fullScript: string,
  brief: Brief | null,
  raw: string,
): string {
  return `An SDR is about to run this spiel on a cold call.

${brief ? `RESEARCH BRIEF:\n${JSON.stringify(brief, null, 2)}` : `LEAD, unparsed: ${raw}`}

SPIEL:
"""
${fullScript}
"""

Predict the 4 objections THIS person is most likely to raise, given their exact title, what they are measured on, and their company. For each, write a response using Agree, then Inform, then Question Back. Validate the objection, give a short honest answer, then ask an open question that re-engages and pulls on something in their remit.

No em dashes. Spoken language. Each field one short sentence.

Respond ONLY with JSON:
{"objections":[{"objection":"what they say","agree":"...","inform":"...","question":"..."}]}`
}
