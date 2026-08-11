// What a Build spiel press actually costs, per settings combination.
//
// These are measured, not estimated: each figure came from reading usage.input_tokens /
// output_tokens off a real response and applying the published per-million rates
// (Haiku 4.5 $1/$5, Sonnet 4.6 $3/$15). Re-measure with scripts/render-prompts.ts style
// probes if a prompt or a model changes, because a stale number here is worse than none.

export interface BuildCost {
  /** Cents per press of Build spiel. */
  cents: number
  /** What the rep gets for it. */
  label: string
  note?: string
}

export function buildCost(leanMode: boolean, fastSpiel: boolean): BuildCost {
  if (leanMode && fastSpiel) {
    return { cents: 0.19, label: 'one call, fast writer' }
  }
  if (leanMode && !fastSpiel) {
    return { cents: 0.53, label: 'one call, Sonnet voice' }
  }
  if (!leanMode && fastSpiel) {
    return { cents: 0.37, label: 'research pass plus spiel, fast writer' }
  }
  return {
    cents: 0.8,
    label: 'research pass plus spiel, Sonnet voice',
    note: 'first build of each hour is 1.83c while the prompt cache is written',
  }
}

/** Cheapest combination, for the one-click reset. */
export const CHEAPEST = { leanMode: true, fastSpiel: true }

export const isCheapest = (leanMode: boolean, fastSpiel: boolean) =>
  leanMode === CHEAPEST.leanMode && fastSpiel === CHEAPEST.fastSpiel

/** Dollars for a day of dialling at this setting. */
export const dailyCost = (cents: number, builds: number) => (cents * builds) / 100

export const money = (dollars: number) =>
  dollars < 1 ? `${Math.round(dollars * 100)}c` : `$${dollars.toFixed(2)}`
