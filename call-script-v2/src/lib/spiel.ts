// Spiel builder: one line in, researched cold-open out.
// Prompt construction and scoring live here so the component stays presentational.

import { flow } from '../data/flow'
import { GLENCOCO_WRITING_RULES } from '../data/glencoco'

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
  /** Approved call-script wording, not model output. Never rerolled, never regenerated. */
  fixed?: boolean
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

/**
 * The opening the rep reads before the spiel: the dial, the half-a-minute permission
 * ask, "have you heard of us", and the cut-me-off line.
 *
 * Taken from the live call script rather than copied, so the floor only maintains one
 * version of the approved wording. It is the `opening` node plus the first paragraph of
 * `pitch_q1`, which is where the cut-me-off line lives. Everything after that in
 * pitch_q1 is the old value hook, which the generated spiel replaces.
 */
export function openingParagraphs(leadName: string, yourName: string): string[] {
  const open = flow.opening?.script ?? ''
  const cutMeOff = (flow.pitch_q1?.script ?? '').split(/\n{2,}/)[0] ?? ''
  return [...open.split(/\n{2,}/), cutMeOff]
    .map(p => p.trim())
    .filter(Boolean)
    .map(p =>
      p
        .replace(/\{leadName\}/g, leadName.trim() || '[Lead Name]')
        .replace(/\{yourName\}/g, yourName.trim() || '[BDR Name]'),
    )
}

/**
 * The writer is told to address the person as (Name) so the rep fills it in live. Once
 * the opening is using a real name, leaving (Name) in the ask reads like a mailmerge
 * miss, so fill it in too when we know it.
 */
export const fillLeadName = (text: string, leadName: string) =>
  leadName.trim() ? (text || '').replace(/\(Name\)/g, leadName.trim()) : text || ''

const OPENING_LABELS = ['The dial', 'Permission', 'Heard of us', 'Cut me off']

/** The opening as fixed beats, so it sits in the same box as the spiel and edits cleanly. */
export function openingBeats(leadName: string, yourName: string): Beat[] {
  return openingParagraphs(leadName, yourName).map((text, i) => ({
    id: `opening_${i + 1}`,
    label: OPENING_LABELS[i] ?? `Opening ${i + 1}`,
    hint: 'Approved call-script opening',
    text,
    fixed: true,
  }))
}

export const DEFAULT_OA: OAProfile = {
  positioning:
    'the leading marketplace for global talent networks, built specifically for connecting businesses to vetted offshore firms',
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
  "the world's leading marketplace for offshore staffing, built specifically for connecting businesses to vetted offshore firms",
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

// ── Intro wording guard ───────────────────────────────────────────────────

/**
 * The identity clause is everything up to the first comma of the positioning line,
 * e.g. "the world's leading marketplace for offshore staffing". That exact wording
 * is a deliberate choice, so it must survive into the thumbnail beat regardless of
 * which model wrote it.
 */
export const identityClause = (positioning: string) =>
  (positioning || '').split(',')[0].trim()

const flatten = (s: string) =>
  (s || '').toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim()

/** True when the thumbnail still carries the positioning line's own identity clause. */
export function keepsIdentityClause(thumbnail: string, positioning: string): boolean {
  const clause = flatten(identityClause(positioning))
  if (clause.length < 8) return true // nothing distinctive to check against
  return flatten(thumbnail).includes(clause)
}

/**
 * Faster models sometimes paraphrase the identity clause away. Rather than accept
 * that, or pay for a slower model on every beat, rewrite just the thumbnail.
 */
export function buildIntroRepairPrompt(thumbnail: string, positioning: string, tone: Tone, pacing: boolean): string {
  return `Rewrite one line of a cold call opener. It must contain this clause word for word:

"${identityClause(positioning)}"

The current version dropped or reworded it:
"${thumbnail}"

Keep the same job: say who we are in one breath, then frame it for this company's
industry in the same sentence. Keep the industry framing that is already there.

${styleRules(tone, pacing)}

Respond with the rewritten line only. No labels, no quotes, no commentary.`
}

// ── Negative-framing guard ────────────────────────────────────────────────

/**
 * Lines that tell the prospect they are failing, e.g. "either way, you're not hitting
 * the numbers you're measured on". A stranger's verdict on their performance kills the
 * call, and it contradicts OA's positive-framing rule: complexities to solve, never
 * shortfalls to admit.
 *
 * Deliberately narrow. These match an assertion about THEIR results, not any negative
 * word, so legitimate house phrasing ("without slipping SLAs", "not cheap hires")
 * does not trip a needless repair.
 */
export const ACCUSATORY_PATTERNS: RegExp[] = [
  /\b(?:you(?:'re| are)|your team(?:'s| is)?)\s+(?:not|never)\s+(?:\w+\s+){0,2}(?:hitting|meeting|making|reaching)\b/i,
  /\bnot\s+(?:hitting|meeting|reaching)\s+(?:the|your|those)\s+(?:numbers|targets|kpis|goals|metrics)\b/i,
  /\byou(?:'re| are)\s+(?:falling|slipping)\s+(?:behind|short)\b/i,
  /\b(?:falling|fallen)\s+short\s+of\s+(?:your|the)\b/i,
  /\byou(?:'re| are)\s+(?:behind|underperforming|failing|struggling)\b/i,
  /\byou(?:'re| are)\s+(?:losing|missing)\s+(?:ground|out on|your)\b/i,
  /\byou\s+can'?t\s+keep\s+up\b/i,
  /\byour\s+(?:numbers|targets|kpis|metrics)\s+(?:are|have been)\s+(?:slipping|suffering|down)\b/i,
]

/** True when a beat asserts the prospect is failing at their job. */
export const readsAccusatory = (text: string) =>
  ACCUSATORY_PATTERNS.some(re => re.test(text || ''))

/**
 * Rewrite one beat that landed as a verdict on their performance.
 * `title` matters: without it the writer invents a peer group, and telling a VP of
 * Customer Operations what "heads of sales" say reads as a mailmerge miss.
 */
export function buildReframePrompt(
  beatText: string, hint: string, title: string, tone: Tone, pacing: boolean,
): string {
  return `Rewrite one line of a cold call opener. It currently tells the prospect they are
failing at their job, which is the fastest way to get hung up on:

"${beatText}"

Keep its job: ${hint}. Keep the same specifics, roles and metrics it already names.
Change only the framing: make the squeeze structural, something everyone in this seat
runs into because of what local hiring costs and how long it takes, or something peers
in the same role report. Do not claim to know their results. Do not say or imply they
are behind, missing targets, not hitting their numbers, struggling, or stretched too
thin. Point at the upside they want instead.

${title ? `The person on the phone is a ${title}. If you attribute the tension to peers, they must be people in THAT role, not some other function.` : 'Do not name a peer job title, you were not told theirs.'}

${styleRules(tone, pacing)}

Respond with the rewritten line only. No labels, no quotes, no commentary.`
}

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
- NEVER tell this person they are failing. Do not write that they are not hitting their
  numbers, missing targets, falling behind, struggling, stretched too thin, or losing
  ground. You do not know their results, and a stranger opening with a verdict on their
  performance gets hung up on.
- Frame the tension as a structural constraint everyone in their position faces, not as
  a personal shortfall. The problem is what local salaries cost and how long hiring
  takes, not how well they are doing their job. Attribute it to the market, the cost
  structure, or what peers in the same seat report, never to them.
- Aim at the upside they want, not the failure they should fear.
- Do not narrate the framing itself. Never say things like "it's a structural squeeze,
  not a you problem" or "this isn't a criticism". Just say the structural thing and move on.
- Tone: ${TONES[tone]}

${GLENCOCO_WRITING_RULES}`

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

/**
 * With no source text there is nothing to verify, so every receipt would come back
 * as hedged inference and the reference-only fields (size signal, hook) come back
 * empty or guessed. Asking for them anyway costs about 460 output tokens and ~5.5
 * seconds of the rep's time for no gain, so the ungrounded brief asks only for what
 * the writer and the rep actually use.
 *
 * Role scope, KPIs and pain are kept: they are what make the "their world" beat
 * specific to the title, and dropping them made the writer fabricate an observed
 * fact instead of hedging. "Do not say" is kept for the same reason.
 */
export function buildSlimBriefPrompt(raw: string): string {
  return `An outbound SDR at Outsource Accelerator, an offshore staffing marketplace, is about to cold call this target. It contains a company name, a job title, and maybe a website, in some order:

"""
${raw}
"""

You have NO web access and the rep pasted no source material, so you know nothing
checkable about this specific company. Work out which part is the company and which is
the title, then give the rep what they can honestly work from.

Answer ONLY with JSON, no preamble, no fences:

{
 "company": "clean company name",
 "title": "the job title of the person being called",
 "what_they_do": "one plain sentence a rep can say out loud, hedged if you are inferring it from the name alone",
 "role_scope": "what someone with this exact title actually owns day to day, one sentence",
 "role_kpis": ["2 to 4 things this person is personally measured on"],
 "offshore_roles": ["3 to 5 specific roles this company plausibly hires offshore, based on the title and what the name suggests"],
 "role_pain": "the operational tension this person feels between their targets and their headcount budget, one sentence",
 "avoid": "anything a rep should not say or assume about this company, one sentence"
}

Do not invent open roles, headcount, office locations, funding, client names, or
anything else you were not shown. Everything here is role-level inference and the rep
will hedge it out loud, so keep it defensible rather than specific.`
}

export function buildBriefPrompt(raw: string, sourceText: string): string {
  const grounded = sourceText.trim().length > 0
  if (!grounded) return buildSlimBriefPrompt(raw)
  return `An outbound SDR at Outsource Accelerator, an offshore staffing marketplace, pasted this cold call target. It contains a company name, a job title, and a website in some order:

"""
${raw}
"""

The rep also pasted raw text they copied from the company's own site or profile. This is your ONLY source of checkable fact:
"""
${sourceText.slice(0, 6000)}
"""

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
- If the source text is thin, return fewer verified receipts. Never pad.
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
${
  brief && !(brief.receipts || []).length
    ? `
NO RECEIPTS WERE FOUND FOR THIS COMPANY. This is the case that gets reps caught, so it
overrides anything above that sounds like permission to be specific:
- You have not seen anything. Do not write "I was looking at your careers page and saw",
  "I noticed", or any phrasing that claims you observed a fact about this company.
- Do not state their staffing mix, headcount, locations, tooling, clients or open roles
  as fact. The offshore roles in the brief are your inference, not something they told you.
- Open the homework beat with an explicit hedge that invites correction, for example
  "correct me if I'm off, but it looks like...", and build it from the role's remit
  rather than from the company.
`
    : ''
}
${styleRules(tone, pacing)}

Beat requirements:
1. thumbnail: who Outsource Accelerator is, one breath. This beat MUST contain the
   following clause character for character, with nothing swapped, shortened or
   pluralised: "${identityClause(oa.positioning)}"
   Do not substitute a synonym for what kind of marketplace we are. After that clause,
   in the same breath, frame it for this company's industry so it lands as specific
   rather than boilerplate.
2. homework: the proof the rep did the work. Lead with the strongest receipt, said plainly, and hedge it if it is marked inferred. Two sentences maximum. This is the beat that buys the next thirty seconds.
3. observation: the tension inside this person's specific remit, using role_scope and
   role_kpis. Not a generic market statement, and not a verdict on their performance.
   Name the squeeze structurally, what the role is accountable for versus what local
   headcount costs, or what peers in the same seat say. Never assert that they are
   behind, missing targets, or not hitting the numbers they are measured on.
4. question: the reframe. Name the actual roles from offshore_roles and the cost angle, and tie it to a metric this person is measured on. Ends in a question mark.
5. superpower: why pre-vetted firms beats the alternative this person is currently stuck with.
6. howitlands: what it feels like in practice, one short line, tied to their actual operation.
7. ask: soft permission for 15 minutes. Name the objection you expect from this role first, then ask. Address the person as (Name) so the rep fills it in live.
8. calendar: close with these options: ${days}.

Respond ONLY with JSON, no preamble, no fences:
{"beats":[{"id":"thumbnail","text":"..."},{"id":"homework","text":"..."},{"id":"observation","text":"..."},{"id":"question","text":"..."},{"id":"superpower","text":"..."},{"id":"howitlands","text":"..."},{"id":"ask","text":"..."},{"id":"calendar","text":"..."}]}

Length: aim for 150 to 185 words across all eight beats combined, and never exceed 190.
That is roughly a minute of speech. Count before you answer. If you are over, cut adjectives
and subordinate clauses from the middle beats, not from the homework beat.

LAST THING, AND IT OVERRIDES EVERY RULE ABOVE: the eight beats together must total no
more than 190 words. Count them. A rep reads this out loud on a cold call and anything
longer gets cut off by the prospect, so a shorter spiel that follows the rules beats a
richer one that runs long. If obeying a craft rule would push you over, drop the rule.`
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

