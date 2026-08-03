// Live QC scorecard scoring engine.
// Derived from the OA Live Scorecard Scoring Spec v1.1 (451 QC analyses, OA Hub Jul 2026).
// C2 + BANT reproduce OA Hub's stored criterion scores exactly. C3 is an estimate (label it ~).

export const CONFIRMATIONS: Record<string, { unclear: number; refused: number; label: string }> = {
  company:        { unclear: -2.0,  refused: -3.5,  label: 'Company confirmed' },
  dc_agreed:      { unclear: -2.0,  refused: -3.4,  label: 'DC agreed' },
  hiring:         { unclear: -1.0,  refused: -2.0,  label: 'Hiring in 1–2 months' },
  offshorable:    { unclear: -1.0,  refused: -2.0,  label: 'Role offshorable' },
  offshore:       { unclear: -1.0,  refused: -2.0,  label: 'Open to offshore' },
  decision_maker: { unclear: -0.75, refused: -1.5,  label: 'Decision maker' },
  full_time:      { unclear: -0.5,  refused: -1.0,  label: 'Full-time seat' },
}

export const BANT: Record<string, { unclear: number; confirmed: number; label: string }> = {
  authority: { unclear: 4.3, confirmed: 8.4, label: 'Authority' },
  timeline:  { unclear: 4.4, confirmed: 6.9, label: 'Timeline' },
  budget:    { unclear: 3.8, confirmed: 6.1, label: 'Budget' },
  need:      { unclear: 4.6, confirmed: 6.5, label: 'Need' },
}

export const FLOOR = { c1: 7.15, c2: 6.87, c3: 6.41, overall: 6.85 }

// The four core gates that mean a lead is qualified enough to book.
export const CORE_GATES = ['hiring', 'offshore', 'full_time', 'decision_maker'] as const

export interface ScoreState {
  banked: Set<string>
  refused: Set<string>
  topics: Set<string>
  elaborated: boolean
  buyingSignal: boolean
  objectionHandled: boolean
  passiveWarnings: number
}

export const newState = (): ScoreState => ({
  banked: new Set(),
  refused: new Set(),
  topics: new Set(),
  elaborated: false,
  buyingSignal: false,
  objectionHandled: false,
  passiveWarnings: 0,
})

export const cloneState = (s: ScoreState): ScoreState => ({
  banked: new Set(s.banked),
  refused: new Set(s.refused),
  topics: new Set(s.topics),
  elaborated: s.elaborated,
  buyingSignal: s.buyingSignal,
  objectionHandled: s.objectionHandled,
  passiveWarnings: s.passiveWarnings,
})

const r2 = (n: number) => Math.round(n * 100) / 100

export function activeCriteria(s: ScoreState): number {
  let v = 10
  for (const id in CONFIRMATIONS) {
    if (s.refused.has(id)) v += CONFIRMATIONS[id].refused
    else if (!s.banked.has(id)) v += CONFIRMATIONS[id].unclear
  }
  return Math.max(0, r2(v))
}

export function bantAverage(s: ScoreState): number {
  const ids = Object.keys(BANT)
  const t = ids.reduce((a, id) => a + (s.banked.has(id) ? BANT[id].confirmed : BANT[id].unclear), 0)
  return r2(t / ids.length)
}

export const projectedC2 = (s: ScoreState) => r2((bantAverage(s) + activeCriteria(s)) / 2)

// C3 cannot be computed live — start at the floor and move with what the rep influenced.
export function estimatedC3(s: ScoreState): number {
  let v = FLOOR.c3
  if (s.elaborated) v += 0.45
  if (s.buyingSignal) v += 0.45
  if (s.topics.size >= 6) v += 0.3
  else if (s.topics.size <= 3) v -= 0.35
  if (s.objectionHandled) v += 0.2
  v -= s.passiveWarnings * 0.4
  return Math.max(2, Math.min(8.2, r2(v)))
}

export const projectedOverall = (s: ScoreState) =>
  r2(FLOOR.c1 * 0.25 + projectedC2(s) * 0.45 + estimatedC3(s) * 0.3)

export type Band = 'good' | 'watch' | 'risk'
export function band(n: number): Band {
  if (n >= 7.5) return 'good'
  if (n >= 6.5) return 'watch'
  return 'risk'
}

// QC met = all four core gates banked and none refused. This is the green / ready-to-book signal.
export function readyToBook(s: ScoreState): boolean {
  return CORE_GATES.every(id => s.banked.has(id) && !s.refused.has(id))
}

// Tags a response button can carry (all optional).
export interface AnswerTags {
  banks?: string[]
  refuses?: string[]
  elaborated?: boolean
  buyingSignal?: boolean
  passiveRisk?: boolean
  vague?: boolean
}

export function applyAnswer(state: ScoreState, opt: AnswerTags, topic?: string, isObjection?: boolean): ScoreState {
  const s = cloneState(state)
  ;(opt.banks || []).forEach(id => { s.banked.add(id); s.refused.delete(id) })
  ;(opt.refuses || []).forEach(id => { s.refused.add(id); s.banked.delete(id) })
  if (topic && !opt.vague) s.topics.add(topic)
  if (opt.elaborated) s.elaborated = true
  if (opt.buyingSignal) s.buyingSignal = true
  if (opt.passiveRisk) s.passiveWarnings++
  if (isObjection && !opt.vague) s.objectionHandled = true
  return s
}

export interface Gap { id: string; label: string; gain: number }
export function nextBestAction(s: ScoreState): Gap | null {
  let best: Gap | null = null
  for (const id in CONFIRMATIONS) {
    if (s.banked.has(id) || s.refused.has(id)) continue
    const gain = r2(Math.abs(CONFIRMATIONS[id].unclear) * 0.225)
    if (!best || gain > best.gain) best = { id, label: CONFIRMATIONS[id].label, gain }
  }
  for (const id in BANT) {
    if (s.banked.has(id)) continue
    const gain = r2((BANT[id].confirmed - BANT[id].unclear) * 0.05625)
    if (!best || gain > best.gain) best = { id, label: BANT[id].label, gain }
  }
  return best
}

// How many of the five C3 drivers are currently "hit" (for the counter block).
export function c3DriversHit(s: ScoreState): number {
  let n = 0
  if (s.elaborated) n++            // engagement
  if (s.buyingSignal) n++          // buying signals
  if (s.passiveWarnings === 0) n++ // sentiment (no passive/rude warnings)
  if (s.topics.size >= 6) n++      // conversation depth
  if (s.objectionHandled) n++      // objection handling
  return n
}
