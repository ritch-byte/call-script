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
// MEASURED, four leads: 0.309, 0.311, 0.327 and 0.302, mean 0.312, from
// usage.input_tokens and usage.output_tokens. Rounded up to 0.32. $1.56 per 500 builds.
//
// The branch costs about 0.043 of that. Beat 7, the suggestion for a lead who cannot
// name a role, is written on every build but read on maybe a third of them. Generating
// it on demand instead would average cheaper, and would put a pause in the middle of a
// live call at the exact moment the lead is deciding whether to stay on the phone. That
// trade was made deliberately in favour of the rep.
//
// WHERE THE MONEY IS. The prompt is still larger than the spiel it produces. Every fix
// asked for during the day became a rule, and a rule is input tokens on every build
// forever, which is why the cost rose while the script got shorter. A cut in the other
// direction is always available: the length rules were deleted once for being 122 tokens
// of instruction that four separate versions had failed to make work, and the guards
// fired 0 of 5 afterwards, which is the honest test of whether prompt text was load
// bearing.
//
// SPEAK TIME finally moved, and not by asking. Five attempts at word budgets all landed
// at 89-102 seconds. Replacing the 41-word screenplay close with a 12-word question took
// it to 75. The length was never in the beats.
//
// The number has crept all day: 0.19, 0.23, 0.24, 0.227 after the trim, 0.244, 0.25,
// now 0.264. Every step is a rule added to the prompt, and a rule is input tokens on
// every build forever. The last one bought the most: the story rule, which made the
// beats one narrative about the lead rather than six separate claims, and which is what
// finally got a real before-and-after into beat 3 and the company's name into beat 2.
// At the floor's ~550 builds a day this is about $44 a month against $31 at 0.19.
//
// This is 3c per 500 above the $1.15 the floor asked for, and the reason is prompt
// tokens, not waste. Two rules were added to beat 2 after it was caught describing the
// staffing of the job rather than the job, and the Change in the World beat carries the
// screenplay's three moves. Both are instructions, so both are input. Fixing the close
// in code paid for most of it: the model writes six beats instead of eight, so output
// fell even as the prompt grew.
//
// Getting back under $1.15 means cutting one of those rules or shortening a beat, which
// is a product decision rather than an optimisation, and it is worth about 50c a month
// at the floor's ~550 builds a day. Left as is deliberately.
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
export const BUILD_COST_CENTS = 0.32

/** Dollars for a day of dialling at this rate. */
export const dailyCost = (cents: number, builds: number) => (cents * builds) / 100

export const money = (dollars: number) =>
  dollars < 1 ? `${Math.round(dollars * 100)}c` : `$${dollars.toFixed(2)}`
