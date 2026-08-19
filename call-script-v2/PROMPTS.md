# Spiel Builder prompts

Generated from the real prompt builders in `src/lib/spiel.ts`. Regenerate with
`npm run prompts` rather than hand-editing, so this cannot drift from what the app
actually sends.

## How a build works

One button, one path, one price. The rep pastes a line (company, job title, website) and
presses Build spiel. That is a single call on Haiku 4.5 costing 0.32 cents,
so 500 builds a day is $1.60. There is no research
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

1. **Status thumbnail** — Who we are, in one breath, with someone recognisable to stand on
2. **The homework** — Proof the rep actually looked them up, one real detail
3. **Change in the world** — What shifted, why it is worse than the last shift, and the part nobody can see
4. **The big question** — The reframe, in this role's own metrics
5. **Our edge** — The outcome in one word, then why we are different
6. **How it lands** — What it feels like, tied to their operation
7. **The question** — What talent they prioritise. One ask, and it opens the branch

### The opening

Not generated at all. It is read from the live call script (`data/flow.ts`: the
`opening` node plus the first paragraph of `pitch_q1`), so the floor
maintains one copy of the approved wording. It costs nothing and is on screen before any
build:

```text
Hey [Lead Name]? (Pause)

Oh hey uhh, [Lead Name], it's [BDR Name] here over at Outsource Accelerator. I know I called you out of the blue here, mind if I grab half a minute? Then you can let me know if it's relevant or not (pause)

Appreciate that, yeah remind me uhh, have you heard of Outsource Accelerator just by the off chance?

No? Oh okay, feel free to cut me off if it's not in your wheelhouse.
```


---

## 1. The build prompt

Sent as a single user message. With **no** pasted source text:

```text
Write a cold call opener for an SDR at Outsource Accelerator, the leading marketplace for global talent networks, built specifically for.

LEAD: Northbeam Logistics, VP of Customer Operations, northbeam.com
No research and no web access: you know nothing checkable about this company.

7 short paragraphs, one blank line between each. No labels, numbering, JSON or preamble.
Keep each opening phrase word for word, that is how the floor talks, and fill the rest
with this person's world. One or two short sentences per beat, never three, except beat 3.

Beats 1 to 6 are the spiel. Beat 7 is a branch the rep may never read, written now so it
is there if they need it. The closing question is already written: no ask, no meeting
request, no sign-off anywhere.

ONE STORY, NOT SIX CLAIMS. After the thumbnail, THEY are the subject and we do not
appear again until beat 5. Each beat picks up what the last one put down: 2 names their
day, 3 says what changed about that day, 4 prices it, and only then do we turn up as the
answer to something already on the table. Never restart on a new topic. Concrete nouns
from their world, never adjectives.

1. "So yeah quick thumbnail on us." 18 WORDS MAX. + this word for word, ending on the word "for":
   "the leading marketplace for global talent networks, built specifically for" + then name what THIS company actually is, in five or six words, the way
   someone there would describe the place. Not "businesses", not "companies like yours",
   not "founders like you": their industry, their kind of firm. No bridge phrases like
   "which basically means", the sentence already runs straight into it.
   The tail is a NOUN PHRASE naming what they ARE, and it ends there. "post-production
   studios" is right; "post-production studios scaling their teams" is wrong, because that
   is what we are ringing to propose, not what they are.
2. THE HOMEWORK, the beat that buys the call. 32 WORDS MAX. Word for word, using the real company name
   from the lead line rather than "your company": "I made some research about [company]...
   so correct me if I'm off, but [their job title]s like you are most likely" + the two
   activities. Saying the title back is what makes it land: they hear someone who knows
   the seat, not someone reading a list.
   Then two concrete things that title does hour to hour, joined by "and then", in their
   vocabulary and in the order the work happens. Then word for word: "right?"
   Pick the two a team could take off their hands, the operational work. Their day is the
   WORK, never the staffing of it. Beat 3 owns hiring, and naming it here announces the
   pitch before you have earned the call, so nothing about hiring, recruiting, headcount
   or filling seats, and nothing about offshore, outsourced, BPO or nearshore either.
   Shape only, never reuse the words, the industries, or "across the X markets":
     Head of Partnerships: "carrier and partner deals across the SEA markets... getting
     them signed, and then getting them actually live." You have seen nothing, so this is inference: that is why it hedges and ends in a question.
3. CHANGE IN THE WORLD, the beat that earns the call, 28 WORDS MAX. and the turn in the story. Three
   short sentences, 45 words at the very most. "And so what we are seeing from a high
   level... is that..." then the before and the after, told about THEIR operation rather
   than their industry in general: what filling this seat used to take, what it takes now,
   and the part nobody puts a number on, a seat sitting open or a hire that does not
   stick.
   THE BEFORE AND AFTER MUST BE ACTUAL NUMBERS. "three weeks, now it's eight" works.
   "weeks, now months" does not, and neither does "harder" or "tougher" - those are the
   same sentence every other caller makes. Pick figures that are true of this kind of
   role in this kind of firm and say them.
4. "So the big question is" 22 WORDS MAX. + can they secure world class talent, naming two or three
   roles this company would really hire offshore, at up to 70% less than local hiring cost, without sacrificing
   quality? Ends in a question mark. The cost comparison IS this beat: the number and
   what they pay locally must both appear, or the beat has failed.
5. "So in response to this, our edge lies in our access to pre-vetted firms." 14 WORDS MAX. +
   name in one word what they get back, then real systems, real data security, managed teams, not random freelancers. Aim it at the exact problem
   beat 3 just described, not at us in general.
6. "And we do it in a way where," 16 WORDS MAX. + we shortlist and introduce the firms that already run teams like the one you need, so you plug into a high-performing team instead of building one. End inside THEIR operation, on what
   it feels like once it is running: the team feels like theirs, not a vendor.

7. IF THEY CANNOT NAME A ROLE. 30 WORDS MAX. Not part of the spiel: the rep reads this
   only when the answer to the closing question is a shrug. Name two or three roles a
   firm like theirs really does hand over first, the ones from beat 4, and say what it
   frees up for the person on the phone in their own terms. Speak TO them as "you", never
   about them in the third person: this is read aloud to their face. Do NOT end on a
   question and do not ask about bottlenecks; the question that follows is already
   written.

VOICE: spoken, short clauses, contractions, and ellipses as pacing marks, but at most ONE per beat. The house voice in the exemplar. Conversational fillers, ellipsis pacing, light swagger. No em dashes, corporate filler, feature lists or pricing. Curiosity, not authority. Sell the meeting, not the service. Their words, nothing that could appear on a website.

SAY IT ALOUD. A rep reads this at pace on a live call, so every word has to be easy to
get out of your mouth. Short, common, spoken words. Nothing anyone could trip over: not
"operationalised", "shepherding", "consolidation", "methodologies", "infrastructure".
Where a plainer word exists, use the plainer one. Industry nouns are fine when they are
what the person actually says; long Latin verbs never are.

Beats 1, 4, 5 and 6 are ONE short sentence each. No subclauses, no lists.
```

### With pasted source text

The lead block and the homework instruction change; everything else is identical:

```text
Write a cold call opener for an SDR at Outsource Accelerator, the leading marketplace for global talent networks, built specifically for.

LEAD: Northbeam Logistics, VP of Customer Operations, northbeam.com
THE ONLY FACTS YOU MAY CLAIM:
"""
Northbeam Logistics is a third-party logistics provider for mid-market e-commerce
brands in the UK and Ireland, with fulfilment centres in Manchester, Leeds and Dublin.
Careers: hiring a Customer Support Advisor (Manchester, 2 positions).
"""

7 short paragraphs, one blank line between each. No labels, numbering, JSON or preamble.
Keep each opening phrase word for word, that is how the floor talks, and fill the rest
with this person's world. One or two short sentences per beat, never three, except beat 3.

Beats 1 to 6 are the spiel. Beat 7 is a branch the rep may never read, written now so it
is there if they need it. The closing question is already written: no ask, no meeting
request, no sign-off anywhere.

ONE STORY, NOT SIX CLAIMS. After the thumbnail, THEY are the subject and we do not
appear again until beat 5. Each beat picks up what the last one put down: 2 names their
day, 3 says what changed about that day, 4 prices it, and only then do we turn up as the
answer to something already on the table. Never restart on a new topic. Concrete nouns
from their world, never adjectives.

1. "So yeah quick thumbnail on us." 18 WORDS MAX. + this word for word, ending on the word "for":
   "the leading marketplace for global talent networks, built specifically for" + then name what THIS company actually is, in five or six words, the way
   someone there would describe the place. Not "businesses", not "companies like yours",
   not "founders like you": their industry, their kind of firm. No bridge phrases like
   "which basically means", the sentence already runs straight into it.
   The tail is a NOUN PHRASE naming what they ARE, and it ends there. "post-production
   studios" is right; "post-production studios scaling their teams" is wrong, because that
   is what we are ringing to propose, not what they are.
2. THE HOMEWORK, the beat that buys the call. 32 WORDS MAX. Word for word, using the real company name
   from the lead line rather than "your company": "I made some research about [company]...
   so correct me if I'm off, but [their job title]s like you are most likely" + the two
   activities. Saying the title back is what makes it land: they hear someone who knows
   the seat, not someone reading a list.
   Then two concrete things that title does hour to hour, joined by "and then", in their
   vocabulary and in the order the work happens. Then word for word: "right?"
   Pick the two a team could take off their hands, the operational work. Their day is the
   WORK, never the staffing of it. Beat 3 owns hiring, and naming it here announces the
   pitch before you have earned the call, so nothing about hiring, recruiting, headcount
   or filling seats, and nothing about offshore, outsourced, BPO or nearshore either.
   Shape only, never reuse the words, the industries, or "across the X markets":
     Head of Partnerships: "carrier and partner deals across the SEA markets... getting
     them signed, and then getting them actually live." Ground it in the facts above, claim nothing beyond them.
3. CHANGE IN THE WORLD, the beat that earns the call, 28 WORDS MAX. and the turn in the story. Three
   short sentences, 45 words at the very most. "And so what we are seeing from a high
   level... is that..." then the before and the after, told about THEIR operation rather
   than their industry in general: what filling this seat used to take, what it takes now,
   and the part nobody puts a number on, a seat sitting open or a hire that does not
   stick.
   THE BEFORE AND AFTER MUST BE ACTUAL NUMBERS. "three weeks, now it's eight" works.
   "weeks, now months" does not, and neither does "harder" or "tougher" - those are the
   same sentence every other caller makes. Pick figures that are true of this kind of
   role in this kind of firm and say them.
4. "So the big question is" 22 WORDS MAX. + can they secure world class talent, naming two or three
   roles this company would really hire offshore, at up to 70% less than local hiring cost, without sacrificing
   quality? Ends in a question mark. The cost comparison IS this beat: the number and
   what they pay locally must both appear, or the beat has failed.
5. "So in response to this, our edge lies in our access to pre-vetted firms." 14 WORDS MAX. +
   name in one word what they get back, then real systems, real data security, managed teams, not random freelancers. Aim it at the exact problem
   beat 3 just described, not at us in general.
6. "And we do it in a way where," 16 WORDS MAX. + we shortlist and introduce the firms that already run teams like the one you need, so you plug into a high-performing team instead of building one. End inside THEIR operation, on what
   it feels like once it is running: the team feels like theirs, not a vendor.

7. IF THEY CANNOT NAME A ROLE. 30 WORDS MAX. Not part of the spiel: the rep reads this
   only when the answer to the closing question is a shrug. Name two or three roles a
   firm like theirs really does hand over first, the ones from beat 4, and say what it
   frees up for the person on the phone in their own terms. Speak TO them as "you", never
   about them in the third person: this is read aloud to their face. Do NOT end on a
   question and do not ask about bottlenecks; the question that follows is already
   written.

VOICE: spoken, short clauses, contractions, and ellipses as pacing marks, but at most ONE per beat. The house voice in the exemplar. Conversational fillers, ellipsis pacing, light swagger. No em dashes, corporate filler, feature lists or pricing. Curiosity, not authority. Sell the meeting, not the service. Their words, nothing that could appear on a website.

SAY IT ALOUD. A rep reads this at pace on a live call, so every word has to be easy to
get out of your mouth. Short, common, spoken words. Nothing anyone could trip over: not
"operationalised", "shepherding", "consolidation", "methodologies", "infrastructure".
Where a plainer word exists, use the plainer one. Industry nouns are fine when they are
what the person actually says; long Latin verbs never are.

Beats 1, 4, 5 and 6 are ONE short sentence each. No subclauses, no lists.
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
- Credibility: real systems, real data security, managed teams, not random freelancers
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
6. This person has not offshored anything, which is why we are calling. Describe the work they do with the team they have in house today. Never put an offshore, outsourced, BPO or nearshore team in their day. Naming a team they do not have is the fastest way to be caught guessing.

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
Rewrite one line of a cold call opener. It must contain this word for word:

"the leading marketplace for global talent networks, built specifically for"

The current version dropped or reworded it:
"So quick thumbnail on us. We are the top offshore staffing site around."

Keep the same job: say who we are in one breath, then finish the sentence by naming what
THIS company actually is, in five or six words. Whatever follows "for" is the only part
you invent. It must be specific to them, never "businesses" or "companies like yours",
and it must describe what they already are rather than what we want them to become:
"agencies and service firms scaling offshore" is wrong, "independent creative agencies"
is right. Nothing about offshore, outsourcing, hiring or scaling after "for".

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
