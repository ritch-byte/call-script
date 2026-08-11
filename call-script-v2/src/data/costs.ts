// What a press of Build spiel costs, at the Haiku 4.5 rate of $1 per million tokens in
// and $5 per million out.
//
// WHERE THE MONEY GOES. Output is five times the price of input, so the ~300 tokens of
// spiel cost 0.150 and the prompt costs the rest. That sets a floor: even a zero-length
// prompt lands at 0.150, or $0.75 per 500 builds. Nothing gets under that without
// shortening the eight-beat script itself, which is the one thing the floor asked for.
//
// THE HISTORY, all metered off real responses. 0.19 before the house frames. 0.23 once
// the frames and the homework beat went in. 0.24 once the homework beat had to be told
// what not to say. Then the prompt was cut 16% with every rule kept, 3908 -> 3271 chars
// and ~900 -> ~754 input tokens.
//
// THIS FIGURE IS DERIVED, NOT METERED. 754 input plus 300 output comes to 0.225, rounded
// up to 0.23 because understating what the floor spends is the worse error. It is
// computed from the character count against a measured 4.34 chars/token rather than read
// off usage.input_tokens, because probes now spend a development key that does not exist
// yet. Re-measure and correct the moment it does.
//
// The repair calls are not in this figure. The intro, reframe and offshore guards each
// add about 0.05 when they fire, and none fired across the last five-lead runs. Watch
// that rate after this trim: the offshore rule lost its emphasis, and a repair firing on
// one build in five would give back the whole saving.
export const BUILD_COST_CENTS = 0.23

/** Dollars for a day of dialling at this rate. */
export const dailyCost = (cents: number, builds: number) => (cents * builds) / 100

export const money = (dollars: number) =>
  dollars < 1 ? `${Math.round(dollars * 100)}c` : `$${dollars.toFixed(2)}`
