// What a press of Build spiel costs.
//
// There is one path now, so there is one number. It is measured, not estimated: taken
// from usage.input_tokens / output_tokens on real responses (~775 in, ~290 out) at the
// Haiku 4.5 rate of $1 per million in and $5 per million out, across builds that came out
// at 0.213, 0.225, 0.227, 0.231 and 0.237 cents, mean 0.227. Rounded up rather than
// down: understating what the floor spends is the worse error.
//
// It was 0.19 before the house frames and the homework beat went in. Those made the
// prompt and the script longer, which is where the extra 0.03 goes.
//
// If the prompt or the model changes, re-measure. A stale figure here is worse than none,
// because the whole point is that the floor can trust the number on screen.

export const BUILD_COST_CENTS = 0.23

/** Dollars for a day of dialling at this rate. */
export const dailyCost = (cents: number, builds: number) => (cents * builds) / 100

export const money = (dollars: number) =>
  dollars < 1 ? `${Math.round(dollars * 100)}c` : `$${dollars.toFixed(2)}`
