# Spiel Builder prompts

Generated from the real prompt builders in `src/lib/spiel.ts`. Regenerate with
`npm run prompts` rather than hand-editing, so this cannot drift from what the app
actually sends.

## How a build works

One button, one path, one price. The rep pastes a line (company, job title, website) and
presses Build spiel. That is a single call on Haiku 4.5 costing 0.23 cents,
so 500 builds a day is $1.15. There is no research
pass and no model choice, so a rep cannot land on an expensive setting.

The eight beats come back as plain paragraphs rather than JSON, because the JSON
scaffolding costs output tokens for nothing.

### What runs in the browser, not the prompt

Enforced in code after the model replies, which is what keeps a cheap single call honest:

| Guard | What it does |
|---|---|
| `keepsIdentityClause` | The positioning clause must appear word for word. If the writer paraphrased it, one repair call fixes that beat only. |
| `readsAccusatory` | Catches lines telling the prospect they are failing, and reframes that beat structurally. |
| `stripEmDash` | No em dashes reach the prompter, including on hand edits. |
| `parseLeanSpiel` | Handles blank-line or single-newline separation and strips numbering, so a formatting wobble cannot hand the rep one unusable block. |
| `remapParagraphs` | Keeps the single edit box round-tripping onto beats, so per-beat reroll survives editing. |
| `speakSeconds` vs `WINDOW` | Flags a spiel that runs long, measured on the written part only. |

### The eight beats

1. **Thumbnail** — Who we are, in one breath
2. **The homework** — Proof the rep actually looked them up, one real detail
3. **Their world** — The tension inside this exact role's remit
4. **The big question** — The reframe, in this role's own metrics
5. **Our superpower** — Why we are different
6. **How it lands** — What it feels like, tied to their operation
7. **The ask** — Soft permission for 15 minutes
8. **Calendar** — Two options, close it

### The opening

Not generated at all. It is read from the live call script (`data/flow.ts`: the
`opening` node plus the first paragraph of `pitch_q1`), so the floor
maintains one copy of the approved wording. It costs nothing and is on screen before any
build:

```text
Hey [Lead Name]? (Pause)

Oh hey uhh, [Lead Name], it's [BDR Name] here over at Outsource Accelerator. I know I called you out of the blue here, mind if I grab half a minute? Then you can let me know if it's relevant or not? (pause)

Appreciate that, yeah remind me uhh, have you heard of Outsource Accelerator just by the off chance?

No? Oh okay, feel free to cut me off if it's not in your wheelhouse.
```


---

## 1. The build prompt

Sent as a single user message. With **no** pasted source text:

```text
Write a cold call opener for an SDR at Outsource Accelerator, the leading marketplace for global talent networks, built specifically for connecting businesses to vetted offshore firms.

LEAD: Northbeam Logistics, VP of Customer Operations, northbeam.com
The rep has no research and you have no web access, so you know nothing checkable about this company.

Write exactly 8 short paragraphs, one blank line between each. No labels, no numbering, no JSON, no preamble.

House script. Keep each opening phrase exactly as written, that is how the floor talks.
Fill the rest with this person's world. One or two short sentences per beat, never three:

1. "So yeah quick thumbnail on us." + this clause word for word:
   "the leading marketplace for global talent networks" + one clause framing it for their industry.
2. THE HOMEWORK, the beat that buys the call. Exactly:
   "I did do a bit of homework before I dialled... so correct me if I'm off, but you're
   most likely spending your days on" + what someone with THIS title in THIS industry
   does hour to hour, in their vocabulary: two concrete activities joined by "and then",
   in the order the work really happens. End with exactly "am I close?"
   Shape to copy, content to replace: "carrier and partner deals across the SEA
   markets... getting them signed, and then getting them actually live." You have seen nothing, so this is inference. That is why it hedges and ends in a question.
3. "And so what we are seeing from a high level... is that..." + the squeeze firms like
   theirs live with, premium local talent against unverified freelancers, in their
   industry's terms. Never imply THEY are failing or behind.
4. "So the big question is" + is it possible to secure world class talent, naming two or
   three roles this company would really hire offshore, at up to 70% less than local hiring cost, without
   sacrificing quality? Ends in a question mark.
5. "So in response to this, our superpower lies in our access to pre-vetted firms." +
   enterprise-grade infrastructure, data security, and managed teams, not random remote freelancers.
6. "And we do it in a way where," + we shortlist and introduce the firms that already run teams like the one you need, so you plug into a high-performing team instead of building one.
7. "But super simple, (Name)," + the objection you expect from this title + would they be
   completely opposed to carving out 15 minutes for a coffee-break style chat.
8. "Does Thursday or Friday afternoon work for you?"

VOICE: spoken, short clauses, contractions, ellipses as pacing marks. The house voice in the exemplar. Conversational fillers, ellipsis pacing, light swagger. No em dashes, no corporate filler, no feature lists, no pricing. Curiosity, not authority. Sell the meeting, not the service. Their vocabulary, nothing that could appear on a website.

LENGTH, this overrides everything above: 205 words across all eight beats is the hard
ceiling and 180 is the target. Count before you answer. The homework beat earns its
words; take them off beats 3 to 7, which should be one sentence each.
```

### With pasted source text

The lead block and the homework instruction change; everything else is identical:

```text
Write a cold call opener for an SDR at Outsource Accelerator, the leading marketplace for global talent networks, built specifically for connecting businesses to vetted offshore firms.

LEAD: Northbeam Logistics, VP of Customer Operations, northbeam.com
WHAT THE REP ACTUALLY SAW, the only facts you may claim:
"""
Northbeam Logistics is a third-party logistics provider for mid-market e-commerce
brands in the UK and Ireland, with fulfilment centres in Manchester, Leeds and Dublin.
Careers: hiring a Customer Support Advisor (Manchester, 2 positions).
"""

Write exactly 8 short paragraphs, one blank line between each. No labels, no numbering, no JSON, no preamble.

House script. Keep each opening phrase exactly as written, that is how the floor talks.
Fill the rest with this person's world. One or two short sentences per beat, never three:

1. "So yeah quick thumbnail on us." + this clause word for word:
   "the leading marketplace for global talent networks" + one clause framing it for their industry.
2. THE HOMEWORK, the beat that buys the call. Exactly:
   "I did do a bit of homework before I dialled... so correct me if I'm off, but you're
   most likely spending your days on" + what someone with THIS title in THIS industry
   does hour to hour, in their vocabulary: two concrete activities joined by "and then",
   in the order the work really happens. End with exactly "am I close?"
   Shape to copy, content to replace: "carrier and partner deals across the SEA
   markets... getting them signed, and then getting them actually live." Use WHAT THE REP SAW where it fits. Claim nothing beyond that text.
3. "And so what we are seeing from a high level... is that..." + the squeeze firms like
   theirs live with, premium local talent against unverified freelancers, in their
   industry's terms. Never imply THEY are failing or behind.
4. "So the big question is" + is it possible to secure world class talent, naming two or
   three roles this company would really hire offshore, at up to 70% less than local hiring cost, without
   sacrificing quality? Ends in a question mark.
5. "So in response to this, our superpower lies in our access to pre-vetted firms." +
   enterprise-grade infrastructure, data security, and managed teams, not random remote freelancers.
6. "And we do it in a way where," + we shortlist and introduce the firms that already run teams like the one you need, so you plug into a high-performing team instead of building one.
7. "But super simple, (Name)," + the objection you expect from this title + would they be
   completely opposed to carving out 15 minutes for a coffee-break style chat.
8. "Does Thursday or Friday afternoon work for you?"

VOICE: spoken, short clauses, contractions, ellipses as pacing marks. The house voice in the exemplar. Conversational fillers, ellipsis pacing, light swagger. No em dashes, no corporate filler, no feature lists, no pricing. Curiosity, not authority. Sell the meeting, not the service. Their vocabulary, nothing that could appear on a website.

LENGTH, this overrides everything above: 205 words across all eight beats is the hard
ceiling and 180 is the target. Count before you answer. The homework beat earns its
words; take them off beats 3 to 7, which should be one sentence each.
```


---

## 2. Reroll one beat

Only fires when the rep taps a beat in the reroll strip. It carries the pasted source, so a
rerolled homework beat stays as grounded as the original.

```text
Rewrite one beat of a cold call spiel. Same job, different angle. Do not repeat the current wording.

OUTSOURCE ACCELERATOR, the seller:
- Positioning: the leading marketplace for global talent networks, built specifically for connecting businesses to vetted offshore firms
- Network: 4,000+ pre-vetted BPO and staffing firms
- Cost angle: up to 70% less than local hiring cost
- Credibility: enterprise-grade infrastructure, data security, and managed teams, not random remote freelancers
- How it works: we shortlist and introduce the firms that already run teams like the one you need, so you plug into a high-performing team instead of building one

LEAD: Northbeam Logistics, VP of Customer Operations, northbeam.com
WHAT THE REP ACTUALLY SAW, the only facts you may claim:
Northbeam Logistics is a third-party logistics provider for mid-market e-commerce
brands in the UK and Ireland, with fulfilment centres in Manchester, Leeds and Dublin.
Careers: hiring a Customer Support Advisor (Manchester, 2 positions).

HOMEWORK RULES, these are what make the call land:

The rep must sound like someone who spent ten minutes on this company before dialling, not someone reading a template. That means:

1. Only claim what you were actually shown. If there is source text above, use one real detail from it, said the way a person who looked would say it: "I was on your careers page and saw you're hiring three more support reps", not "I noticed your commitment to excellence".
2. If there is no source text, you have seen nothing about this company. Do not write "I saw" or "I noticed". Hedge out loud and invite the correction: "correct me if I'm off, but it looks like most of your delivery team sits in Manchester". A hedge that invites correction builds more credibility than false certainty, and it opens the conversation.
3. Speak to the ROLE, not the company. This person owns a specific remit and gets measured on specific things. Use their vocabulary and their numbers, not generic business language. A support leader hears backlog, response time, cost per ticket. An engineering leader hears velocity, hiring pipeline, burn.
4. Do not flatter. No "impressive growth", no "love what you're building". Observation, then tension, then question.
5. Do not reveal how you found the information. No "according to your LinkedIn". Just say what you saw.

FULL CURRENT SPIEL, for continuity:
"""
(the full script so far)
"""

Rewrite this beat only. Its job: Proof the rep actually looked them up, one real detail.
Current version: "I was on your careers page and saw you are hiring two support advisors."

Use a DIFFERENT receipt from the brief than the one currently used. Same rules apply: nothing outside the receipts list, hedge anything inferred.
STYLE RULES, non negotiable:
- Never use em dashes. Use commas, periods, or ellipses instead.
- Use ellipses (...) as spoken pacing marks the way the exemplar does. They mark where the rep breathes.
- Write for the ear. Short clauses, contractions, sounds like a person talking.
- No corporate filler, no feature lists, no pricing.
- Sell the meeting, not the service.
- NEVER tell this person they are failing. Do not write that they are not hitting their
  numbers, missing targets, falling behind, struggling, stretched too thin, or losing
  ground. You do not know their results, and a stranger opening with a verdict on their
  performance gets hung up on.
- Frame the tension as a structural constraint everyone in their position faces, not as
  a personal shortfall. The problem is what local salaries cost and how long hiring
  takes, not how well they are doing their job. Attribute it to the market, the cost
  structure, or what peers in the same seat report, never to them.
- Aim at the upside they want, not the failure they should fear.
- Do not narrate the framing itself. Never say things like "it's a structural squeeze,
  not a you problem" or "this isn't a criticism". Just say the structural thing and move on.
- Tone: The house voice in the exemplar. Conversational fillers, ellipsis pacing, light swagger.

CRAFT RULES (Glencoco, Micah Vu). These shape the
writing, they are not extra content to add, so honouring them must not add a single word:
- Curiosity, not authority. Asking about their world, not announcing you have the answer.
- A conversation opener, not a monologue. It should sound like someone who expects to be
  interrupted and would welcome it.
- Their name once, where it lands naturally. Repeating it reads robotic.
- Their vocabulary, not ours. Nothing that could appear on a website.

Respond with the new line of spoken script and nothing else. No labels, no quotes, no commentary.
```


---

## 3. Repair prompts

These only fire when a guard catches something, so most builds never pay for them.

### The intro clause was paraphrased

```text
Rewrite one line of a cold call opener. It must contain this clause word for word:

"the leading marketplace for global talent networks"

The current version dropped or reworded it:
"So quick thumbnail on us. We are the top offshore staffing site around."

Keep the same job: say who we are in one breath, then frame it for this company's
industry in the same sentence. Keep the industry framing that is already there.

STYLE RULES, non negotiable:
- Never use em dashes. Use commas, periods, or ellipses instead.
- Use ellipses (...) as spoken pacing marks the way the exemplar does. They mark where the rep breathes.
- Write for the ear. Short clauses, contractions, sounds like a person talking.
- No corporate filler, no feature lists, no pricing.
- Sell the meeting, not the service.
- NEVER tell this person they are failing. Do not write that they are not hitting their
  numbers, missing targets, falling behind, struggling, stretched too thin, or losing
  ground. You do not know their results, and a stranger opening with a verdict on their
  performance gets hung up on.
- Frame the tension as a structural constraint everyone in their position faces, not as
  a personal shortfall. The problem is what local salaries cost and how long hiring
  takes, not how well they are doing their job. Attribute it to the market, the cost
  structure, or what peers in the same seat report, never to them.
- Aim at the upside they want, not the failure they should fear.
- Do not narrate the framing itself. Never say things like "it's a structural squeeze,
  not a you problem" or "this isn't a criticism". Just say the structural thing and move on.
- Tone: The house voice in the exemplar. Conversational fillers, ellipsis pacing, light swagger.

CRAFT RULES (Glencoco, Micah Vu). These shape the
writing, they are not extra content to add, so honouring them must not add a single word:
- Curiosity, not authority. Asking about their world, not announcing you have the answer.
- A conversation opener, not a monologue. It should sound like someone who expects to be
  interrupted and would welcome it.
- Their name once, where it lands naturally. Repeating it reads robotic.
- Their vocabulary, not ours. Nothing that could appear on a website.

Respond with the rewritten line only. No labels, no quotes, no commentary.
```

### A beat read as a verdict on their performance

```text
Rewrite one line of a cold call opener. It currently tells the prospect they are
failing at their job, which is the fastest way to get hung up on:

"Either way, you're not hitting the numbers you're measured on."

Keep its job: The tension inside this exact role's remit. Keep the same specifics, roles and metrics it already names.
Change only the framing: make the squeeze structural, something everyone in this seat
runs into because of what local hiring costs and how long it takes, or something peers
in the same role report. Do not claim to know their results. Do not say or imply they
are behind, missing targets, not hitting their numbers, struggling, or stretched too
thin. Point at the upside they want instead.

The person on the phone is a VP of Customer Operations. If you attribute the tension to peers, they must be people in THAT role, not some other function.

STYLE RULES, non negotiable:
- Never use em dashes. Use commas, periods, or ellipses instead.
- Use ellipses (...) as spoken pacing marks the way the exemplar does. They mark where the rep breathes.
- Write for the ear. Short clauses, contractions, sounds like a person talking.
- No corporate filler, no feature lists, no pricing.
- Sell the meeting, not the service.
- NEVER tell this person they are failing. Do not write that they are not hitting their
  numbers, missing targets, falling behind, struggling, stretched too thin, or losing
  ground. You do not know their results, and a stranger opening with a verdict on their
  performance gets hung up on.
- Frame the tension as a structural constraint everyone in their position faces, not as
  a personal shortfall. The problem is what local salaries cost and how long hiring
  takes, not how well they are doing their job. Attribute it to the market, the cost
  structure, or what peers in the same seat report, never to them.
- Aim at the upside they want, not the failure they should fear.
- Do not narrate the framing itself. Never say things like "it's a structural squeeze,
  not a you problem" or "this isn't a criticism". Just say the structural thing and move on.
- Tone: The house voice in the exemplar. Conversational fillers, ellipsis pacing, light swagger.

CRAFT RULES (Glencoco, Micah Vu). These shape the
writing, they are not extra content to add, so honouring them must not add a single word:
- Curiosity, not authority. Asking about their world, not announcing you have the answer.
- A conversation opener, not a monologue. It should sound like someone who expects to be
  interrupted and would welcome it.
- Their name once, where it lands naturally. Repeating it reads robotic.
- Their vocabulary, not ours. Nothing that could appear on a website.

Respond with the rewritten line only. No labels, no quotes, no commentary.
```
