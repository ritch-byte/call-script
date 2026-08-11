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
// MEASURED, five leads: 0.224, 0.234, 0.220, 0.232 and 0.226, mean 0.227, from
// usage.input_tokens and usage.output_tokens on the real responses (~840 in, ~285 out).
// Rounded up to 0.23 because understating what the floor spends is the worse error.
// $1.13 per 500 builds.
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
