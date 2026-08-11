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
// what not to say. Then the prompt was cut 16% with every rule kept, and this is where
// it landed.
//
// MEASURED, five leads: 0.232, 0.235, 0.234, 0.223 and 0.219, mean 0.229, from
// usage.input_tokens and usage.output_tokens on the real responses (~960 in, ~265 out).
// Rounded up to 0.23 because understating what the floor spends is the worse error.
// $1.14 per 500 builds.
//
// The house screenplay landed here without moving the number, which is the point of
// fixing the close in code. Change in the World grew from one line to three sentences
// and the close and calendar ask stopped being generated at all, so the prompt got
// longer and the output got shorter. A first attempt did move it, to 0.238, because the
// length rule still budgeted 205 words across eight beats when only six are written now.
// Per-beat word budgets fixed that: written output fell from 204-232 words to 193-216.
//
// Note the char-count estimate made before the run said ~754 input tokens against an
// actual ~840, about 9% low. Estimating prompt tokens from characters is fine for
// deciding whether a cut is worth making and not fine for the number on screen.
//
// The repair calls are not in this figure because they did not fire: intro, reframe and
// offshore guards, zero out of five builds, both before and after the trim. That was the
// live risk in trimming, since the offshore rule lost its emphasis to get here. Each
// repair costs about another 0.05, so if that rate ever climbs to one build in five it
// gives the whole saving back. Re-measure if the prompt or the model changes.
export const BUILD_COST_CENTS = 0.23

/** Dollars for a day of dialling at this rate. */
export const dailyCost = (cents: number, builds: number) => (cents * builds) / 100

export const money = (dollars: number) =>
  dollars < 1 ? `${Math.round(dollars * 100)}c` : `$${dollars.toFixed(2)}`
