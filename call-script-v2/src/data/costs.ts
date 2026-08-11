// What a press of Build spiel costs.
//
// There is one path now, so there is one number. It is measured, not estimated: taken
// from usage.input_tokens / output_tokens on real responses (~540 in, ~255 out) at the
// Haiku 4.5 rate of $1 per million in and $5 per million out, across four builds that
// came out at 0.183, 0.185, 0.192 and 0.192 cents.
//
// If the prompt or the model changes, re-measure. A stale figure here is worse than none,
// because the whole point is that the floor can trust the number on screen.

export const BUILD_COST_CENTS = 0.19

/** Dollars for a day of dialling at this rate. */
export const dailyCost = (cents: number, builds: number) => (cents * builds) / 100

export const money = (dollars: number) =>
  dollars < 1 ? `${Math.round(dollars * 100)}c` : `$${dollars.toFixed(2)}`
