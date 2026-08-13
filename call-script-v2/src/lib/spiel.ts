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
 * Counts everything after the opening, including the fixed close, because that is what
 * the rep actually says in one breath. It excluded the close for a while, by filtering
 * on `fixed`, and reported 77s for a script that took 107s: a rep on the floor caught
 * that before this number did.
 *
 * Measured builds now land at 90-92s, so 95 leaves the amber flag meaning "this one is
 * actually bloated" rather than lighting on every build. That band came back down from
 * 99-105s when the close was cut to 41 words, which is the same complaint the floor
 * raised: the fix for "it got long" was connective tissue in the close, not the beats.
 */
export const WINDOW = 95

/**
 * The eight beats, in the order the house screenplay runs them.
 *
 * The first six are written for this lead. The last two are the close, and they are
 * fixed: see CLOSING_BEATS below for why the floor's own wording beats a generated
 * paraphrase of it.
 */
export const BEATS: Array<Omit<Beat, 'text'>> = [
  { id: 'thumbnail',  label: 'Status thumbnail', hint: 'Who we are, in one breath, with someone recognisable to stand on' },
  { id: 'homework',   label: 'The homework',   hint: 'Proof the rep actually looked them up, one real detail' },
  { id: 'observation',label: 'Change in the world', hint: 'What shifted, why it is worse than the last shift, and the part nobody can see' },
  { id: 'question',   label: 'The big question', hint: "The reframe, in this role's own metrics" },
  { id: 'superpower', label: 'Our edge',       hint: 'The outcome in one word, then why we are different' },
  { id: 'howitlands', label: 'How it lands',   hint: 'What it feels like, tied to their operation' },
  { id: 'ask',        label: 'The close',      hint: 'Disarm, 14-15 minutes, coffee break, back pocket or not' },
  { id: 'calendar',   label: 'The ask',        hint: 'Would it be ridiculous, two days' },
]

/** Only these are written for the lead. The rest is the floor's fixed wording. */
export const GENERATED_BEATS = BEATS.slice(0, 6)

/**
 * The close, word for word from the house screenplay.
 *
 * Held in code rather than asked of the model, for three reasons. It carries no
 * information about this lead, so generating it buys nothing. It is the most
 * load-bearing wording in the call and the least tolerant of paraphrase: the disarm,
 * the 14-then-15 correction that makes the number sound counted rather than scripted,
 * the back-pocket exit that removes the commitment, and "would it be ridiculous",
 * which is answered by "no" from someone who means yes. And the model demonstrably
 * does paraphrase it: while the calendar line was generated it drifted to "does
 * Thursday or Friday work better for you?", losing the negative frame entirely.
 *
 * Fixing it also pays for the Change in the World beat, which genuinely does need
 * this lead's industry.
 */
export function closingBeats(days: string): Beat[] {
  return [
    {
      ...BEATS[6],
      fixed: true,
      // 41 words, down from 77 in the reference doc and 65 after the first trim.
      //
      // Every cut here was to connective tissue, never to a move. What makes this close
      // work is four pattern interrupts, and all four are still in it: "completely
      // opposed", which is answered "no" by someone who means yes; "14, 15" landing as a
      // number that was counted rather than rounded; the coffee-break framing that makes
      // it small; and the back-pocket exit that removes the commitment entirely. What
      // went was "carving out", "More of a", "walk through what this looks like", "who
      // look like you guys" and "from there" - phrases a rep has to get through rather
      // than land on.
      text:
        "But super simple, (Name)... I know my timing's probably off. Would you be " +
        'completely opposed to 14, 15 minutes? Coffee-break style, just what this looks ' +
        "like for folks like you. Then you keep us in the back pocket or you don't.",
    },
    {
      ...BEATS[7],
      fixed: true,
      text: `Would it be ridiculous to loop up... say... ${days}?`,
    },
  ]
}

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
  // "enterprise-grade infrastructure" is four-and-five syllables back to back and the
  // writer quotes this line almost verbatim, so it went straight into the rep's mouth.
  // A rep reading at pace on a live call stumbled on it. Same meaning, sayable.
  proof:
    'real systems, real data security, managed teams, not random freelancers',
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

/** Proof lines retired for the same reason, here because they were hard to say aloud. */
export const SUPERSEDED_PROOF = [
  'enterprise-grade infrastructure, data security, and managed teams, not random remote freelancers',
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
  // Same rule for the proof line, which was retired for being hard to say out loud. A
  // rep who never edited it should get the sayable version rather than keep the old one
  // forever just because it is sitting in their localStorage.
  if (SUPERSEDED_PROOF.some(old => norm(old) === norm(merged.proof))) {
    merged.proof = DEFAULT_OA.proof
  }
  return merged
}

export const TONES: Record<Tone, string> = {
  measured: 'Calm, consultative, senior to senior. Fewer fillers, steadier pace.',
  house: 'The house voice in the exemplar. Conversational fillers, ellipsis pacing, light swagger.',
  high: 'High energy, faster cadence, more pattern interrupt, still not salesy.',
}


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

/**
 * The part of the positioning the writer has to say word for word.
 *
 * Cutting at the first comma threw away "built specifically for", and with it the hinge
 * the floor uses to aim the sentence at this particular company. The writer then had to
 * invent its own bridge and reached for filler: "which basically means we're the place
 * where founders like you plug into world-class teams offshore".
 *
 * Keeping the stem through that phrase fixes both problems at once. The approved wording
 * survives further, and the writer's own words now start exactly where the
 * personalisation belongs, which is immediately after "for".
 *
 * Falls back to the identity clause when a rep has edited the phrase out of their
 * positioning, so nothing is forced on a profile that no longer says it.
 */
export function positioningStem(positioning: string): string {
  const p = (positioning || '').trim()
  const m = /^(.*?\bbuilt specifically for)\b/i.exec(p)
  return m ? m[1].trim() : identityClause(p)
}

const flatten = (s: string) =>
  (s || '').toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim()

/**
 * Whatever the writer added after the approved stem, i.e. everything past "for".
 * Empty when the stem is missing, which keepsIdentityClause already catches.
 */
export function thumbnailTail(thumbnail: string, positioning: string): string {
  const stem = flatten(positioningStem(positioning))
  const flat = flatten(thumbnail)
  const at = flat.indexOf(stem)
  if (at === -1 || stem.length < 8) return ''
  return (thumbnail.slice(at + stem.length) || '').replace(/^[\s,]+/, '').trim()
}

/**
 * True when the thumbnail's tail sells at them instead of naming them.
 *
 * "built specifically for agencies and service firms scaling offshore" describes what we
 * want them to do, not what they are. They are an agency; the offshoring is the thing we
 * are calling to propose. Putting it here claims a plan they have not made, and it is the
 * third time the writer has reached for our vocabulary to describe their world, after the
 * homework beat's offshore team and its hiring day.
 *
 * Reuses the two guards already written for that beat, so the same word lists and the
 * same stand-down for staffing and recruitment firms apply here without a third copy.
 */
export function tailPitchesAtThem(thumbnail: string, positioning: string, lead = ''): boolean {
  const tail = thumbnailTail(thumbnail, positioning)
  if (!tail) return false
  // "digital agencies scaling their teams" got past the offshore and hiring lists by
  // dropping the giveaway words while keeping the projection: growing the team is the
  // outcome we sell, not a description of who they are. Narrow on purpose, so a company
  // that genuinely is "a scaling fintech" still reads as a description of itself.
  if (/\b(?:scal|grow|expand|build)\w*\s+(?:their|its|your|out)?\s*(?:teams?|headcount|capacity|operations?|ops)\b/i.test(tail)) {
    return true
  }
  return presumesOffshore(tail, lead) || describesHiring(tail, lead)
}

/** True when the thumbnail still carries the approved stem of the positioning line. */
export function keepsIdentityClause(thumbnail: string, positioning: string): boolean {
  const clause = flatten(positioningStem(positioning))
  if (clause.length < 8) return true // nothing distinctive to check against
  return flatten(thumbnail).includes(clause)
}

/**
 * Faster models sometimes paraphrase the identity clause away. Rather than accept
 * that, or pay for a slower model on every beat, rewrite just the thumbnail.
 */
export function buildIntroRepairPrompt(thumbnail: string, positioning: string, tone: Tone, pacing: boolean): string {
  return `Rewrite one line of a cold call opener. It must contain this word for word:

"${positioningStem(positioning)}"

The current version dropped or reworded it:
"${thumbnail}"

Keep the same job: say who we are in one breath, then finish the sentence by naming what
THIS company actually is, in five or six words. Whatever follows "for" is the only part
you invent. It must be specific to them, never "businesses" or "companies like yours",
and it must describe what they already are rather than what we want them to become:
"agencies and service firms scaling offshore" is wrong, "independent creative agencies"
is right. Nothing about offshore, outsourcing, hiring or scaling after "for".

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

/**
 * Words that make the homework beat about staffing rather than about their work.
 *
 * A sibling of the offshore problem and the same root cause: the writer knows what we
 * sell, so it describes their day in our vocabulary. "You're most likely spending your
 * days hunting down the right clinical ops people" is not their day. Their day is
 * clinical trials and regulatory submissions; the hiring squeeze is beat 3's job, and
 * saying it in beat 2 announces the pitch before the call has been earned.
 *
 * Bare "talent" and "sourcing" are deliberately absent: a video producer books talent
 * and a partnerships lead sources partners, and both are legitimately their day. The
 * finding/hunting patterns below only fire when the object is people.
 */
export const HIRING_PATTERNS: RegExp[] = [
  /\bhir(?:e|es|ing|ed)\b/i,
  /\brecruit\w*/i,
  /\bhead[- ]?count\b/i,
  /\bstaffing\b|\bstaff(?:ing)? up\b/i,
  /\bcandidates?\b/i,
  /\bvacan\w+/i,
  /\bbackfill\w*/i,
  /\b(?:finding|hunting|chasing|sourcing|scouting)\s+(?:down\s+)?(?:the\s+)?(?:right\s+)?[\w\s]{0,20}?(?:people|staff|specialists|professionals|hires)\b/i,
  /\bfill(?:ing)?\s+(?:the\s+|those\s+|a\s+)?(?:seat|seats|role|roles|position|positions)\b/i,
]

/**
 * True when the homework beat describes staffing instead of the job.
 *
 * Stands down for the same reason presumesOffshore does: a recruitment or staffing firm
 * really does spend its days on hiring, so the guard would be the thing introducing the
 * error.
 */
export function describesHiring(text: string, lead = ''): boolean {
  if (/\b(?:out-?sourc\w*|off-?shor\w*|near-?shor\w*|BPOs?|staffing|recruit\w*|talent)\b/i.test(lead)) {
    return false
  }
  return HIRING_PATTERNS.some(re => re.test(text || ''))
}

/** Rewrite a homework beat that described staffing rather than the work itself. */
export function buildRefocusPrompt(
  beatText: string, raw: string, tone: Tone, pacing: boolean,
): string {
  return `Rewrite one line of a cold call opener. It guesses at the prospect's working day
but describes hiring rather than the work itself:

"${beatText}"

Their day is the job, not the staffing of it. A clinical operations lead runs trials and
regulatory submissions; they do not spend their days hunting for clinical ops people.
Naming the hiring problem here announces the pitch before the call has been earned, and
it belongs two beats later anyway.

LEAD: ${raw}

Keep the exact opening "I made some research about your company... so correct me if I'm
off, but you're most likely spending your days on" and the exact ending "right?".
Between them, name two concrete things this title actually does hour to hour, joined by
"and then", in the order the work happens. Their vocabulary, one sentence. Do not mention
hiring, recruiting, headcount, candidates, vacancies or filling seats.

${styleRules(tone, pacing)}

Respond with the rewritten line only. No labels, no quotes, no commentary.`
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

Keep the exact opening "I made some research about your company... so correct me if I'm
off, but you're most likely spending your days on" and the exact ending "right?".
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
/**
 * The opening words of each written beat, which the house script fixes.
 *
 * Splitting on these rather than on paragraph position is what makes the parse
 * survive a model that merges two beats or breaks one across lines: an anchor is
 * where the beat actually starts, whereas position is only a guess about it.
 */
const BEAT_ANCHORS: Array<[string, RegExp]> = [
  ['thumbnail',   /so yeah,?\s*quick thumbnail on us/i],
  ['homework',    /i made some research about your company/i],
  ['observation', /and so what we are seeing from a high[- ]?level/i],
  ['question',    /so the big question is/i],
  ['superpower',  /so in response to this,?\s*our edge/i],
  ['howitlands',  /and we do it in a way where/i],
]

/**
 * Cut the response at the frames. Returns null unless every beat was found, so a
 * partial match falls through to the positional split rather than silently
 * dropping whichever beat the writer phrased differently.
 */
function splitByAnchors(raw: string): Record<string, string> | null {
  const hits: Array<{ id: string; at: number }> = []
  for (const [id, re] of BEAT_ANCHORS) {
    const m = re.exec(raw)
    if (!m) return null
    hits.push({ id, at: m.index })
  }
  hits.sort((a, b) => a.at - b.at)
  const out: Record<string, string> = {}
  hits.forEach((h, i) => {
    const end = i + 1 < hits.length ? hits[i + 1].at : raw.length
    out[h.id] = oneParagraph(raw.slice(h.at, end).trim())
  })
  return out
}

export function parseLeanSpiel(raw: string, days: string): Beat[] {
  const clean = (raw || '').trim()

  const anchored = splitByAnchors(clean)
  if (anchored) {
    return [
      ...GENERATED_BEATS.map(b => ({ ...b, text: anchored[b.id] || '' })),
      ...closingBeats(days),
    ]
  }

  let parts = clean.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
  if (parts.length < GENERATED_BEATS.length) {
    parts = clean.split(/\n+/).map(p => p.trim()).filter(Boolean)
  }
  parts = parts.map(p => p.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean)
  // Six from the model, then the floor's own close. If the model wrote an ask anyway
  // despite being told not to, the extra paragraphs fall off here rather than competing
  // with the real close.
  return [
    ...GENERATED_BEATS.map((b, i) => ({ ...b, text: oneParagraph(parts[i] || '') })),
    ...closingBeats(days),
  ]
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
  const clause = positioningStem(oa.positioning)
  return `Write a cold call opener for an SDR at Outsource Accelerator, ${clause}.

LEAD: ${raw}
${
  grounded
    ? `THE ONLY FACTS YOU MAY CLAIM:\n"""\n${source.slice(0, 2500)}\n"""`
    : 'No research and no web access: you know nothing checkable about this company.'
}

6 short paragraphs, one blank line between each. No labels, numbering, JSON or preamble.
Keep each opening phrase word for word, that is how the floor talks, and fill the rest
with this person's world. One or two short sentences per beat, never three, except beat 3.

Stop after beat 6. The close is already written: no ask, no meeting request, no sign-off.

1. "So yeah quick thumbnail on us." + this word for word, ending on the word "for":
   "${clause}" + then name what THIS company actually is, in five or six words, the way
   someone there would describe the place. Not "businesses", not "companies like yours",
   not "founders like you": their industry, their kind of firm. No bridge phrases like
   "which basically means", the sentence already runs straight into it.
   Say what they ARE today, never what we want them to become. "agencies and service
   firms scaling offshore" is wrong: they are an agency, the offshoring is the thing we
   are ringing to propose. Nothing about offshore, outsourcing, hiring or scaling here.
2. THE HOMEWORK, the beat that buys the call. Word for word: "I made some research about
   your company... so correct me if I'm off, but you're most likely spending your days
   on" + what this title in this industry does hour to hour, in their vocabulary: two
   concrete activities joined by "and then", in the order the work happens. Then word for
   word: "right?"
   Their day is the WORK, never the staffing of it: a clinical ops lead runs trials and
   submissions, they do not hunt for clinical ops people. Beat 3 owns hiring, so naming it
   here announces the pitch before you have earned the call. Nothing about hiring,
   headcount or filling seats, and nothing about offshore, outsourced, BPO or nearshore
   either: they have done none of it, which is why we are calling.
   Shape only, never reuse the words, the industries, or "across the X markets":
     Head of Partnerships: "carrier and partner deals across the SEA markets... getting
     them signed, and then getting them actually live."
     Practice Manager, dental: "the surgery rota across both sites, and then the insurance
     claims nobody else has time to chase."${
     grounded
       ? ' Ground it in the facts above, claim nothing beyond them.'
       : ' You have seen nothing, so this is inference: that is why it hedges and ends in a question.'
   }
3. CHANGE IN THE WORLD, the beat that earns the call. Three short sentences, 45 words at
   the very most. "And so what we are seeing from a high level... is that..." then: what
   filling this seat used to take, what it takes now and why this squeeze is worse, and
   the part nobody costs, an open seat or a hire that does not work out. About the market,
   never their failing.
4. "So the big question is" + can they secure world class talent, naming two or three
   roles this company would really hire offshore, at ${oa.savings}, without sacrificing
   quality? Ends in a question mark. The cost comparison IS this beat: the number and
   what they pay locally must both appear, or the beat has failed.
5. "So in response to this, our edge lies in our access to pre-vetted firms." +
   name in one word what they get back, then ${oa.proof}.
6. "And we do it in a way where," + ${oa.mechanic}. End by saying the team feels like
   theirs, not a vendor.

VOICE: spoken, short clauses, contractions${pacing ? ', and ellipses as pacing marks, but at most ONE per beat' : ', no ellipses'}. ${TONES[tone]} No em dashes, corporate filler, feature lists or pricing. Curiosity, not authority. Sell the meeting, not the service. Their words, nothing that could appear on a website.

SAY IT ALOUD. A rep reads this at pace on a live call, so every word has to be easy to
get out of your mouth. Short, common, spoken words. Nothing anyone could trip over: not
"operationalised", "shepherding", "consolidation", "methodologies", "infrastructure".
Where a plainer word exists, use the plainer one. Industry nouns are fine when they are
what the person actually says; long Latin verbs never are.

LENGTH overrides everything above, and you keep running long. Hard budget, in words:
beat 1 is 20, beat 2 is 35, beat 3 is 30, beat 4 is 25, beat 5 is 16, beat 6 is 20. That
totals 146 and going over it is a failure, not a stylistic choice. Beats 1, 4, 5 and 6
are ONE short sentence each, no subclauses, no lists, no "and then" chains. Beat 3 is
three very short sentences. Count the words in each beat as you finish it, and cut back
to the budget before you move on.`
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

