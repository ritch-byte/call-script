// The qualification gates, in one place.
//
// Two surfaces read this: the "3 Gates — say it out loud" reference panel and the
// Spiel Builder's post-booking qualifier. Keeping the spoken wording, the accepted
// phrasings and the score ids together means those two can never drift apart, and
// the asks stay in the same voice as the call script in data/flow.ts.
//
// `banks` mirrors the flow node that owns each gate, so confirming a gate here
// credits exactly what answering it inside the call script would credit.

import { flow } from './flow'

export interface GateCopy {
  label: string
  /** Spoken ask. {role} is filled in with whatever role the lead named. */
  ask: string
  /** Phrasings from the buyer that count. The analyzer credits their voice, not ours. */
  say: string[]
  /** Phrasings that kill the gate. */
  not: string[]
  /** Confirmation + BANT ids to bank when the buyer confirms this out loud. */
  banks: string[]
  /** The node in the live call script that owns this gate. */
  node: string
  /** The call script's recovery node, shown when the buyer rules this gate out. */
  recovery: string
}

export const GATE_COPY: Record<string, GateCopy> = {
  hiring: {
    label: 'Near-term need',
    ask: 'And if the right {role} showed up, would you be looking to bring them on within a few weeks, or more like one to two months?',
    say: ['“one to two months”', '“thirty to sixty days”'],
    not: ['“2–3 months”', '“90 days”', '“next year”'],
    banks: ['timeline', 'hiring'],
    node: 'qualify_timeline',
    recovery: 'obj_timeline_disco',
  },
  offshore: {
    label: 'Open to offshore',
    ask: "And you're open to an offshore setup, talent typically based in the Philippines, right?",
    say: ['“yes, open to that”', '“the Philippines is fine”', '“we already use offshore”'],
    not: ['“must be local”', '“on-site only”'],
    banks: ['offshore'],
    node: 'qualify_offshore',
    recovery: 'obj_offshore',
  },
  full_time: {
    label: 'Full-time dedicated',
    ask: "For the {role} seat, I assume this'd be full-time, like thirty to forty hours a week, right?",
    say: ['“full-time”', '“dedicated, just for us”', '“forty hours”'],
    not: ['“part-time”', '“project / shared”', '“ad hoc”'],
    banks: ['full_time'],
    node: 'qualify_fulltime',
    recovery: 'obj_parttime',
  },
  decision_maker: {
    label: 'Decision maker',
    ask: "And you're one of the decision makers for this, right?",
    say: ['“I sign off on it”', '“it’s me and my co-founder”', '“I’d be involved in that call”'],
    not: ['“that’s someone else entirely”', '“I’d have to pass it on”'],
    banks: ['decision_maker', 'authority'],
    node: 'qualify_dm',
    recovery: 'obj_wrong_person',
  },
}

/** The three gates the buyer has to say out loud, in reference-panel order. */
export const SPOKEN_GATE_ORDER = ['hiring', 'offshore', 'full_time'] as const

export const GATE_TITLES: Record<string, string> = {
  hiring: 'Gate 1 · Near-term need',
  offshore: 'Gate 2 · Open to offshore',
  full_time: 'Gate 3 · Full-time dedicated',
}

/**
 * The four core criteria, in the order the call script asks them.
 * Same set as CORE_GATES in lib/score.ts — all four banked means bookable.
 */
export const CORE_ORDER = ['full_time', 'offshore', 'hiring', 'decision_maker'] as const

/** Fill the role into a gate's ask, with a neutral fallback if none was named. */
export const gateAsk = (id: string, role: string) =>
  GATE_COPY[id].ask.replace(/\{role\}/g, role.trim() || 'role')

export type GateAnswer = 'unset' | 'yes' | 'no'

const clean = (s: string, role: string, leadName: string) =>
  (s || '')
    // Swallow the spaces around the dash too, otherwise "Done — sending" becomes
    // "Done ,  sending" with a stray space before the comma.
    .replace(/\s*—\s*/g, ', ')
    .replace(/\{leadName\}/g, leadName.trim() || '[Lead Name]')
    .replace(/\{yourName\}/g, '[BDR Name]')
    .replace(/\{role\}/g, role.trim() || 'that role')
    .replace(/\[their exact timeline\]/g, 'that timeline you mentioned')

/**
 * The call script's own recovery line for a gate the buyer just ruled out, so the rep
 * gets the approved comeback in the moment instead of improvising or going quiet.
 */
export const gateRecovery = (id: string, role: string) =>
  clean(flow[GATE_COPY[id].recovery]?.script ?? '', role, '')

/**
 * The incentive for accepting the calendar invite, in one place so the amount is a
 * single edit.
 *
 * NOTE: this is not the $100 voucher in the email offer hook (EmailComposer's
 * OFFER_HOOK), which is a sweetener for the discovery call itself. These are two
 * different numbers said at two different moments, so if they are ever meant to be the
 * same figure, change both.
 */
export const INVITE_INCENTIVE = {
  amount: '$10 Amazon voucher',
  line: 'And once you accept the invite, we will send over a $10 Amazon voucher, just as a thanks for your time.',
}

/**
 * The closing sequence: recap the four criteria, ask for the commitment, then send the
 * invite and mention the voucher. Built from the call script's close_recap and
 * end_booked nodes so the wording stays the approved one.
 */
export function closingLines(role: string, slot: string, leadName: string): string[] {
  const recap = clean(flow.close_recap?.script ?? '', role, leadName)
  const booked = clean(flow.end_booked?.script ?? '', role, leadName)
  const slotLine = slot.trim() ? `So that's ${slot.trim()}, locked in.` : ''
  return [...recap.split(/\n{2,}/), slotLine, booked, INVITE_INCENTIVE.line]
    .map(s => s.trim())
    .filter(Boolean)
}

/**
 * Translate the qualifier's ticks into scorecard credit.
 *
 * Confirming a gate here has to credit exactly what answering it inside the call
 * script credits, otherwise the live scorecard and the qualifier disagree about
 * the same call. An unset gate credits nothing: silence is not a yes.
 */
export function qualificationBanks(
  gates: Record<string, GateAnswer>,
  role: string,
  when: string,
): { banks: string[]; refuses: string[] } {
  const banks: string[] = []
  const refuses: string[] = []
  for (const id of CORE_ORDER) {
    if (gates[id] === 'yes') banks.push(...GATE_COPY[id].banks)
    else if (gates[id] === 'no') refuses.push(id)
  }
  // A slot they actually agreed to is the DC-agreed confirmation; naming a role is
  // what the call script's Role Fit step banks.
  if (when.trim()) banks.push('dc_agreed')
  if (role.trim()) banks.push('offshorable')
  return { banks, refuses }
}
