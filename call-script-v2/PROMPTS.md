# Spiel Builder prompts

Generated from the real prompt builders in `src/lib/spiel.ts`. Regenerate rather than
hand-edit, so this cannot drift from what the app actually sends.

## How a build works

The rep pastes one line (company, job title, website) and presses Build spiel. What
happens next depends on the **Spiel only** toggle in Voice and positioning.

### Spiel only (default, ~0.18 cents)

One call. No research pass, no exemplar in the prompt, and the eight beats come back as
plain paragraphs rather than JSON, because the JSON scaffolding costs output tokens for
nothing.

### Researched (toggle off, ~0.37 cents)

Two calls:

1. **The brief** on Haiku. Extracts the company, the title, what the role owns, what it is
   measured on, likely offshore roles, and receipts. If the rep pasted source text, each
   receipt must carry a quote from it.
2. **The spiel** on Haiku or Sonnet. Sent as two content blocks: a stable prefix marked
   cacheable for an hour, then the lead-specific brief. The prefix is identical on every
   build, so after the first one it bills at a tenth of the rate.

### What runs in the browser, not the prompt

These are enforced in code after the model replies, which is why they survive on the
cheap path too:

| Guard | What it does |
|---|---|
| `verifyReceipts` | A receipt may only say "seen" if its quote literally appears in the pasted text. Everything else is downgraded to "hedge it". |
| `keepsIdentityClause` | The positioning clause must appear word for word. If the writer paraphrased it, one repair call fixes that beat only. |
| `readsAccusatory` | Catches lines telling the prospect they are failing, and reframes that beat structurally. |
| `stripEmDash` | No em dashes reach the prompter, including on hand edits. |
| `oneParagraph` / `remapParagraphs` | Keeps the single edit box round-tripping onto beats, so per-beat reroll survives editing. |
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
`opening` node plus the first paragraph of `pitch_q1`), so the floor maintains one copy
of the approved wording. Costs nothing and appears before any build:

```text
Hey [Lead Name]? (Pause)

Oh hey uhh, [Lead Name], it's [BDR Name] here over at Outsource Accelerator. I know I called you out of the blue here, mind if I grab half a minute? Then you can let me know if it's relevant or not? (pause)

Appreciate that, yeah remind me uhh, have you heard of Outsource Accelerator just by the off chance?

No? Oh okay, feel free to cut me off if it's not in your wheelhouse.
```


---

## 1. Spiel only prompt (the default path)

Sent as a single user message. Shown here for a lead with **no** pasted source text.

```text
Write a cold call opener for an SDR at Outsource Accelerator, the leading marketplace for global talent networks, built specifically for connecting businesses to vetted offshore firms.

LEAD: Northbeam Logistics, VP of Customer Operations, northbeam.com
The rep has no research and you have no web access, so you know nothing checkable about this company.

Write exactly 8 short paragraphs, one blank line between each. No labels, no numbering, no JSON, no preamble:

1. Who we are, one breath. Must contain this clause word for word: "the leading marketplace for global talent networks". Then frame it for their industry.
2. The homework. You have seen nothing. Do not write "I saw" or "I noticed". Open with a hedge that invites correction, like "correct me if I'm off, but it looks like...", built from what this role owns rather than from the company.
3. Their world: the squeeze this role lives with, what they are accountable for against what local headcount costs. Structural, or what peers in the same seat report. Never say or imply they are failing, behind, missing targets or stretched thin.
4. The big question: name two or three roles they could plausibly hire offshore, tie it to up to 70% less than local hiring cost and a metric this role owns. Ends in a question mark.
5. Our edge: enterprise-grade infrastructure, data security, and managed teams, not random remote freelancers.
6. What it feels like in practice, one short line: we shortlist and introduce the firms that already run teams like the one you need, so you plug into a high-performing team instead of building one.
7. The ask: name the objection you expect from this title, then ask for 15 minutes. Address them as (Name).
8. Close with these options: Thursday or Friday afternoon.

VOICE: spoken, short clauses, contractions, ellipses as pacing marks. The house voice in the exemplar. Conversational fillers, ellipsis pacing, light swagger. No em dashes, no corporate filler, no feature lists, no pricing. Curiosity, not authority. Sell the meeting, not the service. Their vocabulary, nothing that could appear on a website.

LENGTH: 150 to 185 words across all eight, never more than 190. Count before answering.
```

### With pasted source text

Only the second block and the homework instruction change:

```text
Write a cold call opener for an SDR at Outsource Accelerator, the leading marketplace for global talent networks, built specifically for connecting businesses to vetted offshore firms.

LEAD: Northbeam Logistics, VP of Customer Operations, northbeam.com
WHAT THE REP ACTUALLY SAW, the only facts you may claim:
"""
Northbeam Logistics is a third-party logistics provider for mid-market e-commerce
brands in the UK and Ireland, with fulfilment centres in Manchester, Leeds and Dublin.
Careers: hiring a Customer Support Advisor (Manchester, 2 positions).
"""

Write exactly 8 short paragraphs, one blank line between each. No labels, no numbering, no JSON, no preamble:

1. Who we are, one breath. Must contain this clause word for word: "the leading marketplace for global talent networks". Then frame it for their industry.
2. The homework. Lead with the single strongest thing from WHAT THE REP SAW, said the way someone who looked would say it. Nothing outside that text.
3. Their world: the squeeze this role lives with, what they are accountable for against what local headcount costs. Structural, or what peers in the same seat report. Never say or imply they are failing, behind, missing targets or stretched thin.
4. The big question: name two or three roles they could plausibly hire offshore, tie it to up to 70% less than local hiring cost and a metric this role owns. Ends in a question mark.
5. Our edge: enterprise-grade infrastructure, data security, and managed teams, not random remote freelancers.
6. What it feels like in practice, one short line: we shortlist and introduce the firms that already run teams like the one you need, so you plug into a high-performing team instead of building one.
7. The ask: name the objection you expect from this title, then ask for 15 minutes. Address them as (Name).
8. Close with these options: Thursday or Friday afternoon.

VOICE: spoken, short clauses, contractions, ellipses as pacing marks. The house voice in the exemplar. Conversational fillers, ellipsis pacing, light swagger. No em dashes, no corporate filler, no feature lists, no pricing. Curiosity, not authority. Sell the meeting, not the service. Their vocabulary, nothing that could appear on a website.

LENGTH: 150 to 185 words across all eight, never more than 190. Count before answering.
```


---

## 2. Researched path, stage one: the brief

With no source text, it asks for less, because there is nothing to verify:

```text
An outbound SDR at Outsource Accelerator, an offshore staffing marketplace, is about to cold call this target. It contains a company name, a job title, and maybe a website, in some order:

"""
Northbeam Logistics, VP of Customer Operations, northbeam.com
"""

You have NO web access and the rep pasted no source material, so you know nothing
checkable about this specific company. Work out which part is the company and which is
the title, then give the rep what they can honestly work from.

Answer ONLY with JSON, no preamble, no fences:

{
 "company": "clean company name",
 "title": "the job title of the person being called",
 "what_they_do": "one plain sentence a rep can say out loud, hedged if you are inferring it from the name alone",
 "role_scope": "what someone with this exact title actually owns day to day, one sentence",
 "role_kpis": ["2 to 4 things this person is personally measured on"],
 "offshore_roles": ["3 to 5 specific roles this company plausibly hires offshore, based on the title and what the name suggests"],
 "role_pain": "the operational tension this person feels between their targets and their headcount budget, one sentence",
 "avoid": "anything a rep should not say or assume about this company, one sentence"
}

Do not invent open roles, headcount, office locations, funding, client names, or
anything else you were not shown. Everything here is role-level inference and the rep
will hedge it out loud, so keep it defensible rather than specific.
```

### With pasted source text

```text
An outbound SDR at Outsource Accelerator, an offshore staffing marketplace, pasted this cold call target. It contains a company name, a job title, and a website in some order:

"""
Northbeam Logistics, VP of Customer Operations, northbeam.com
"""

The rep also pasted raw text they copied from the company's own site or profile. This is your ONLY source of checkable fact:
"""
Northbeam Logistics is a third-party logistics provider for mid-market e-commerce
brands in the UK and Ireland, with fulfilment centres in Manchester, Leeds and Dublin.
Careers: hiring a Customer Support Advisor (Manchester, 2 positions).
"""

Work out which part of the paste is the company, the title, and the website, then build a brief the rep can dial from.

Answer ONLY with JSON, no preamble, no fences:

{
 "company": "clean company name",
 "title": "the job title of the person being called",
 "website": "url or empty string",
 "what_they_do": "one plain sentence a rep can say out loud, hedged if you are inferring it from the name alone",
 "size_signal": "headcount, offices or growth signal ONLY if it appears in the source text, else 'not found'",
 "receipts": [
   {"fact": "a specific checkable detail phrased so a rep can say it out loud on a call", "where": "where it came from, or your reasoning if inferred", "confidence": "verified", "quote": "the exact words from the source text that prove this"}
 ],
 "role_scope": "what someone with this exact title actually owns day to day at a company this size and shape, one sentence",
 "role_kpis": ["2 to 4 things this person is personally measured on"],
 "offshore_roles": ["3 to 5 specific roles this company plausibly hires offshore, based on what they actually do"],
 "role_pain": "the operational tension this person feels between their targets and their headcount budget, one sentence",
 "hook": "the single most specific non generic observation that could open this call",
 "avoid": "anything a rep should not say to this company, one sentence"
}

Rules for receipts, these matter more than anything else:
- Give 3 to 5 receipts. Order them most specific first.
- Mark confidence "verified" ONLY for a fact that appears in the source text above, and include the exact proving words in "quote". A verified receipt with no quote will be rejected.
- Mark confidence "inferred" for anything that is a reasonable read on the role or industry rather than something you were shown. Leave "quote" empty and put your reasoning in "where".
- If the source text is thin, return fewer verified receipts. Never pad.
- Never invent a receipt. An empty receipts list is far better than a wrong one, because the rep will be caught on the call.
- Prefer receipts that touch headcount: open roles, team locations, recent expansion, service lines that need people.
```


---

## 3. Researched path, stage two: the spiel

Sent as two content blocks. Block A is identical on every build and is marked
`cache_control: {type: "ephemeral", ttl: "1h"}`.

### Block A, the cached prefix

```text
You write cold call spiels for outbound SDRs at Outsource Accelerator.

Reproduce the STRUCTURE and VOICE of this exemplar, but rewrite every line so it is specific to the company and role you are given below. Do not reuse the exemplar's phrasing verbatim. Never reuse "Pretty bananas".

EXEMPLAR:
"""
So yeah quick thumbnail on us. we are the leading Global Marketplace built specifically for connecting businesses to global talent networks...

And so what we are seeing from a high-level... is that... most firms are stuck choosing between paying premium for local talents or gambling on unverified freelancers.

So the big question is is it possible to secure world-class talent (if you're going after support/dev/admin) at 80% less than local hiring costs, without sacrificing quality?

So in response to this, our superpower, lies in our access to pre-vetted firms. Think enterprise-grade infrastructure, data security, and managed teams... not just random remote workers.

And we do it in a way where, you can plug into high-performing teams instantly... Pretty bananas in this space...

But super simple (Name), I know people worry about risk of new partners, but I wanted to see if you'd be completely opposed to carving out 15 minutes for a coffee-break style chat, just to share our lesser-known approach to high-caliber staffing."

Does Thursday or Friday afternoon work for you?
"""

OUTSOURCE ACCELERATOR, the seller:
- Positioning: the leading marketplace for global talent networks, built specifically for connecting businesses to vetted offshore firms
- Network: 4,000+ pre-vetted BPO and staffing firms
- Cost angle: up to 70% less than local hiring cost
- Credibility: enterprise-grade infrastructure, data security, and managed teams, not random remote freelancers
- How it works: we shortlist and introduce the firms that already run teams like the one you need, so you plug into a high-performing team instead of building one

HOMEWORK RULES, these are what make the call land:

The rep must sound like someone who spent ten minutes on this company before dialling, not someone reading a template. That means:

1. Reference something real and checkable. Use only facts from the receipts list in the brief. Say them the way a person who actually looked would say them, for example "I was on your careers page and saw you're hiring three more support reps", not "I noticed your commitment to excellence".
2. Never state a fact that is not in the receipts list. Any receipt marked inferred MUST be hedged out loud and invite the correction: "correct me if I'm off, but it looks like most of your delivery team sits in Manchester". A hedge that invites correction builds more credibility than false certainty, and it opens the conversation.
3. Speak to the ROLE, not the company. This person owns a specific remit and gets measured on specific things. Use their vocabulary and their numbers, not generic business language. A support leader hears backlog, response time, cost per ticket. An engineering leader hears velocity, hiring pipeline, burn. Match the vocabulary to the title in the brief.
4. Do not flatter. No "impressive growth", no "love what you're building". Observation, then tension, then question.
5. Do not reveal how you found the information. No "according to your LinkedIn". Just say what you saw.

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

Beat requirements:
1. thumbnail: who Outsource Accelerator is, one breath. This beat MUST contain the
   following clause character for character, with nothing swapped, shortened or
   pluralised: "the leading marketplace for global talent networks"
   Do not substitute a synonym for what kind of marketplace we are. After that clause,
   in the same breath, frame it for this company's industry so it lands as specific
   rather than boilerplate.
2. homework: the proof the rep did the work. Lead with the strongest receipt, said plainly, and hedge it if it is marked inferred. Two sentences maximum. This is the beat that buys the next thirty seconds.
3. observation: the tension inside this person's specific remit, using role_scope and
   role_kpis. Not a generic market statement, and not a verdict on their performance.
   Name the squeeze structurally, what the role is accountable for versus what local
   headcount costs, or what peers in the same seat say. Never assert that they are
   behind, missing targets, or not hitting the numbers they are measured on.
4. question: the reframe. Name the actual roles from offshore_roles and the cost angle, and tie it to a metric this person is measured on. Ends in a question mark.
5. superpower: why pre-vetted firms beats the alternative this person is currently stuck with.
6. howitlands: what it feels like in practice, one short line, tied to their actual operation.
7. ask: soft permission for 15 minutes. Name the objection you expect from this role first, then ask. Address the person as (Name) so the rep fills it in live.
8. calendar: close with these options: Thursday or Friday afternoon.

Respond ONLY with JSON, no preamble, no fences:
{"beats":[{"id":"thumbnail","text":"..."},{"id":"homework","text":"..."},{"id":"observation","text":"..."},{"id":"question","text":"..."},{"id":"superpower","text":"..."},{"id":"howitlands","text":"..."},{"id":"ask","text":"..."},{"id":"calendar","text":"..."}]}

Length: aim for 150 to 185 words across all eight beats combined, and never exceed 190.
That is roughly a minute of speech. Count before you answer. If you are over, cut adjectives
and subordinate clauses from the middle beats, not from the homework beat.
```

### Block B, the lead

```text
RESEARCH BRIEF:
{"company":"Northbeam Logistics","title":"VP of Customer Operations","what_they_do":"A third-party logistics provider for mid-market e-commerce brands.","size_signal":"three fulfilment centres, UK and Ireland","role_scope":"Owns support headcount, response times and cost per enquiry.","role_kpis":["cost per enquiry","first response time","CSAT"],"offshore_roles":["customer support advisor","billing administrator","order processor"],"role_pain":"Enquiry volume grows faster than the headcount budget.","avoid":"Do not assume they are unhappy with their current team.","receipts":[{"fact":"You're hiring two Customer Support Advisors in Manchester","confidence":"verified"}]}

Write the eight beats for this lead now, as JSON only.

AND IT OVERRIDES EVERY RULE ABOVE: the eight beats together must total no more than 190
words. Count them. A rep reads this out loud on a cold call and anything longer gets cut
off by the prospect, so a shorter spiel that follows the rules beats a richer one that
runs long. If obeying a craft rule would push you over, drop the rule.
```


---

## 4. Reroll one beat

```text
Rewrite one beat of a cold call spiel. Same job, different angle. Do not repeat the current wording.

OUTSOURCE ACCELERATOR, the seller:
- Positioning: the leading marketplace for global talent networks, built specifically for connecting businesses to vetted offshore firms
- Network: 4,000+ pre-vetted BPO and staffing firms
- Cost angle: up to 70% less than local hiring cost
- Credibility: enterprise-grade infrastructure, data security, and managed teams, not random remote freelancers
- How it works: we shortlist and introduce the firms that already run teams like the one you need, so you plug into a high-performing team instead of building one

RESEARCH BRIEF:
{
  "company": "Northbeam Logistics",
  "title": "VP of Customer Operations",
  "what_they_do": "A third-party logistics provider for mid-market e-commerce brands.",
  "size_signal": "three fulfilment centres, UK and Ireland",
  "role_scope": "Owns support headcount, response times and cost per enquiry.",
  "role_kpis": [
    "cost per enquiry",
    "first response time",
    "CSAT"
  ],
  "offshore_roles": [
    "customer support advisor",
    "billing administrator",
    "order processor"
  ],
  "role_pain": "Enquiry volume grows faster than the headcount budget.",
  "avoid": "Do not assume they are unhappy with their current team.",
  "receipts": [
    {
      "fact": "You're hiring two Customer Support Advisors in Manchester",
      "where": "careers page",
      "confidence": "verified",
      "quote": "Customer Support Advisor (Manchester, 2 positions)"
    }
  ]
}

HOMEWORK RULES, these are what make the call land:

The rep must sound like someone who spent ten minutes on this company before dialling, not someone reading a template. That means:

1. Reference something real and checkable. Use only facts from the receipts list in the brief. Say them the way a person who actually looked would say them, for example "I was on your careers page and saw you're hiring three more support reps", not "I noticed your commitment to excellence".
2. Never state a fact that is not in the receipts list. Any receipt marked inferred MUST be hedged out loud and invite the correction: "correct me if I'm off, but it looks like most of your delivery team sits in Manchester". A hedge that invites correction builds more credibility than false certainty, and it opens the conversation.
3. Speak to the ROLE, not the company. This person owns a specific remit and gets measured on specific things. Use their vocabulary and their numbers, not generic business language. A support leader hears backlog, response time, cost per ticket. An engineering leader hears velocity, hiring pipeline, burn. Match the vocabulary to the title in the brief.
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

## 5. Repair prompts

These only fire when a guard catches something.

### Intro clause was paraphrased

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
