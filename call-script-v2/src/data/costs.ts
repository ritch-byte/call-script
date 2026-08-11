// What a press of Build spiel costs.
//
// There is one path now, so there is one number. It is measured, not estimated: taken
// from usage.input_tokens / output_tokens on real responses at the Haiku 4.5 rate of $1
// per million in and $5 per million out, averaged over five leads a run: 0.240, 0.241,
// 0.242 and 0.240 cents. Rounded to 0.24 rather than down: understating what the floor
// spends is the worse error.
//
// The climb: 0.19 before the house frames, 0.23 once the frames and the homework beat
// went in, 0.24 once the homework beat had to be told what NOT to say. Longer prompt,
// longer script.
//
// The repair calls do not show up here because they almost never fire. The intro,
// reframe and offshore guards each cost about another 0.05 when they do, and across the
// last five-lead runs none of them fired at all.
//
// If the prompt or the model changes, re-measure. A stale figure here is worse than none,
// because the whole point is that the floor can trust the number on screen.

export const BUILD_COST_CENTS = 0.24

/** Dollars for a day of dialling at this rate. */
export const dailyCost = (cents: number, builds: number) => (cents * builds) / 100

export const money = (dollars: number) =>
  dollars < 1 ? `${Math.round(dollars * 100)}c` : `$${dollars.toFixed(2)}`
