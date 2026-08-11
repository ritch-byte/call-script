// Spiel builder: one line in, researched cold-open out.
// Prompt construction and scoring live here so the component stays presentational.

import { flow } from '../data/flow'
import { GLENCOCO_WRITING_RULES } from '../data/glencoco'

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
 * Seconds the written part can run before it drags.
 *
 * Moved 80 -> 95 when the house frames and the homework beat went in. That is not the
 * threshold chasing the output: the structure genuinely got longer. The floor's own
 * exemplar is ~175 words and the homework beat adds ~40, so a correct spiel is now
 * 210-235 words, or 81-90 seconds. Measured builds land in that band, so 95 leaves the
 * amber flag meaning "this one is actually bloated" rather than lighting on every build.
 */
export const WINDOW = 95

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

/**
 * Words that put an offshore team in the prospect's day.
 *
 * The homework beat guesses what this person does hour to hour. If the guess includes
 * "managing the offshore teams that handle it", the rep has just told someone who has
 * never offshored that they already have. It is wrong about the one thing we are calling
 * about, and it is the sort of wrong a prospect notices immediately.
 *
 * The prompt forbids this, but a guess is exactly where a writer reaches for the seller's
 * vocabulary, so it is enforced here too. Scoped to the homework beat only: beat 4 has to
 * say "hire offshore" and beat 5 has to say "pre-vetted firms", and both are correct.
 */
export const PRESUMED_OFFSHORE_PATTERNS: RegExp[] = [
  /\boff-?shor(?:e|ing|ed)\b/i,
  /\bout-?sourc(?:e|ed|ing)\b/i,
  /\bnear-?shor(?:e|ing|ed)\b/i,
  /\bBPOs?\b/,
  /\byour\s+remote\s+teams?\b/i,
]

/**
 * True when the homework beat credits them with a team they probably do not have.
 *
 * `lead` is the rep's pasted line. When the company is itself in this business, an
 * outsourcing firm or a BPO, then offshore work genuinely is their day and the guard
 * would be the thing introducing the error, so it stands down.
 */
export function presumesOffshore(text: string, lead = ''): boolean {
  if (/\b(?:out-?sourc\w*|off-?shor\w*|near-?shor\w*|BPOs?|staffing|recruit\w*)\b/i.test(lead)) {
    return false
  }
  return PRESUMED_OFFSHORE_PATTERNS.some(re => re.test(text || ''))
}

/** Rewrite a homework beat that handed them an offshore team they never built. */
export function buildDeoffshorePrompt(
  beatText: string, raw: string, tone: Tone, pacing: boolean,
): string {
  return `Rewrite one line of a cold call opener. It guesses at the prospect's working day
and puts an offshore or outsourced team in it:

"${beatText}"

This person has not offshored anything. That is the entire reason we are calling them, so
describing a team they do not have gets the rep caught guessing in the first thirty seconds.

LEAD: ${raw}

Keep the exact opening "I did do a bit of homework before I dialled... so correct me if I'm
off, but you're most likely spending your days on" and the exact ending "am I close?".
Between them, name two concrete activities this title really does with the team they have
in house today, joined by "and then", in the order the work happens. Their vocabulary, one
sentence. The words offshore, offshoring, outsourced, outsourcing, BPO and nearshore must
not appear.

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

1. Only claim what you were actually shown. If there is source text above, use one real detail from it, said the way a person who looked would say it: "I was on your careers page and saw you're hiring three more support reps", not "I noticed your commitment to excellence".
2. If there is no source text, you have seen nothing about this company. Do not write "I saw" or "I noticed". Hedge out loud and invite the correction: "correct me if I'm off, but it looks like most of your delivery team sits in Manchester". A hedge that invites correction builds more credibility than false certainty, and it opens the conversation.
3. Speak to the ROLE, not the company. This person owns a specific remit and gets measured on specific things. Use their vocabulary and their numbers, not generic business language. A support leader hears backlog, response time, cost per ticket. An engineering leader hears velocity, hiring pipeline, burn.
4. Do not flatter. No "impressive growth", no "love what you're building". Observation, then tension, then question.
5. Do not reveal how you found the information. No "according to your LinkedIn". Just say what you saw.
6. This person has not offshored anything, which is why we are calling. Describe the work they do with the team they have in house today. Never put an offshore, outsourced, BPO or nearshore team in their day. Naming a team they do not have is the fastest way to be caught guessing.`

const oaBlock = (oa: OAProfile) => `OUTSOURCE ACCELERATOR, the seller:
- Positioning: ${oa.positioning}
- Network: ${oa.network}
- Cost angle: ${oa.savings}
- Credibility: ${oa.proof}
- How it works: ${oa.mechanic}`

// ── Prompts ───────────────────────────────────────────────────────────────

/**
 * Turn a lean, plain-text spiel into beats.
 *
 * The model is asked for blank-line separated paragraphs, but it sometimes uses single
 * newlines, so fall back to those rather than handing the rep one giant block. Numbering
 * is stripped in case it labels them despite being told not to.
 */
export function parseLeanSpiel(raw: string): Beat[] {
  const clean = (raw || '').trim()
  let parts = clean.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
  if (parts.length < BEATS.length) {
    parts = clean.split(/\n+/).map(p => p.trim()).filter(Boolean)
  }
  parts = parts.map(p => p.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean)
  return BEATS.map((b, i) => ({ ...b, text: oneParagraph(parts[i] || '') }))
}

/**
 * One-call spiel, no research pass, no JSON.
 *
 * The full path runs two calls and a ~2000 token prompt because it produces receipts the
 * rep can defend and a brief they read before dialling. When all you want is the spiel,
 * that is most of the bill for output nobody looks at. This asks for the eight beats as
 * plain paragraphs and nothing else: no exemplar, no brief, no JSON scaffolding.
 *
 * The guarantees that survive are the ones enforced in code afterwards, plus the two
 * rules that keep a rep out of trouble: never claim to have seen something we were not
 * shown, and never tell the prospect they are failing.
 *
 * Known and accepted: when a lead shares a title with one of the two homework examples,
 * the writer adapts that example rather than inventing from scratch. Telling it not to
 * did not work. Left alone, because two examples cover almost none of the titles the
 * floor dials, and when it does fire the line it produces is a correct description of
 * that job. Adding examples would widen the exposure, not narrow it.
 */
export function buildLeanSpielPrompt(
  raw: string,
  source: string,
  oa: OAProfile,
  tone: Tone,
  pacing: boolean,
  days: string,
): string {
  const grounded = source.trim().length > 0
  const clause = identityClause(oa.positioning)
  return `Write a cold call opener for an SDR at Outsource Accelerator, ${clause}.

LEAD: ${raw}
${
  grounded
    ? `THE ONLY FACTS YOU MAY CLAIM:\n"""\n${source.slice(0, 2500)}\n"""`
    : 'No research and no web access: you know nothing checkable about this company.'
}

8 short paragraphs, one blank line between each. No labels, numbering, JSON or preamble.
Keep each opening phrase word for word, that is how the floor talks, and fill the rest
with this person's world. One or two short sentences per beat, never three.

1. "So yeah quick thumbnail on us." + word for word "${clause}" + one clause framing it
   for their industry.
2. THE HOMEWORK, the beat that buys the call. Word for word: "I did do a bit of homework
   before I dialled... so correct me if I'm off, but you're most likely spending your days
   on" + what this title in this industry does hour to hour, in their vocabulary: two
   concrete activities joined by "and then", in the order the work happens. Then word for
   word: "am I close?"
   They have not offshored anything, that is why we are calling, so describe the in-house
   day. Never write offshore, outsourced, BPO or nearshore in this beat.
   Shape only, never reuse the words, the industries, or "across the X markets":
     Head of Partnerships: "carrier and partner deals across the SEA markets... getting
     them signed, and then getting them actually live."
     Practice Manager, dental: "the surgery rota across both sites, and then the insurance
     claims nobody else has time to chase."${
     grounded
       ? ' Ground it in the facts above, claim nothing beyond them.'
       : ' You have seen nothing, so this is inference: that is why it hedges and ends in a question.'
   }
3. "And so what we are seeing from a high level... is that..." + the squeeze firms like
   theirs live with, premium local talent against unverified freelancers, in their terms.
   Never imply THEY are failing.
4. "So the big question is" + can they secure world class talent, naming two or three
   roles this company would really hire offshore, at ${oa.savings}, without sacrificing
   quality? The cost set against local pay must appear. Ends in a question mark.
5. "So in response to this, our superpower lies in our access to pre-vetted firms." +
   ${oa.proof}.
6. "And we do it in a way where," + ${oa.mechanic}.
7. "But super simple, (Name)," + the objection you expect from this title + would they be
   completely opposed to carving out 15 minutes for a coffee-break style chat.
8. "Does ${days} work for you?"

VOICE: spoken, short clauses, contractions${pacing ? ', ellipses as pacing marks' : ', no ellipses'}. ${TONES[tone]} No em dashes, corporate filler, feature lists or pricing. Curiosity, not authority. Sell the meeting, not the service. Their words, nothing that could appear on a website.

LENGTH overrides everything above: 205 words across the eight beats is the ceiling, 180
the target. Count before answering. The homework beat earns its words, take them off
beats 3 to 7, one sentence each.`
}

export function buildRerollPrompt(
  beat: Beat,
  fullScript: string,
  raw: string,
  /** The rep's pasted source, so a rerolled homework beat stays grounded in it. */
  source: string,
  oa: OAProfile,
  tone: Tone,
  pacing: boolean,
): string {
  const seen = source.trim()
    ? `WHAT THE REP ACTUALLY SAW, the only facts you may claim:\n${source.slice(0, 2500)}`
    : 'The rep saw nothing about this company, so claim nothing about it.'
  return `Rewrite one beat of a cold call spiel. Same job, different angle. Do not repeat the current wording.

${oaBlock(oa)}

LEAD: ${raw}
${seen}

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

