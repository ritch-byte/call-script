// Renders every prompt the Spiel Builder sends, straight from the real builders, into
// PROMPTS.md. Run it again after changing a prompt so the doc cannot drift from the code.
import { writeFileSync } from 'fs'
import {
  buildLeanSpielPrompt, spielStablePrefix, spielLeadBlock, buildBriefPrompt,
  buildRerollPrompt, buildIntroRepairPrompt, buildReframePrompt,
  openingParagraphs, DEFAULT_OA, BEATS,
} from '../src/lib/spiel'
import type { Brief } from '../src/lib/spiel'

const OA = DEFAULT_OA
const DAYS = 'Thursday or Friday afternoon'
const LEAD = 'Northbeam Logistics, VP of Customer Operations, northbeam.com'
const SOURCE = `Northbeam Logistics is a third-party logistics provider for mid-market e-commerce
brands in the UK and Ireland, with fulfilment centres in Manchester, Leeds and Dublin.
Careers: hiring a Customer Support Advisor (Manchester, 2 positions).`

const BRIEF: Brief = {
  company: 'Northbeam Logistics',
  title: 'VP of Customer Operations',
  what_they_do: 'A third-party logistics provider for mid-market e-commerce brands.',
  size_signal: 'three fulfilment centres, UK and Ireland',
  role_scope: 'Owns support headcount, response times and cost per enquiry.',
  role_kpis: ['cost per enquiry', 'first response time', 'CSAT'],
  offshore_roles: ['customer support advisor', 'billing administrator', 'order processor'],
  role_pain: 'Enquiry volume grows faster than the headcount budget.',
  avoid: 'Do not assume they are unhappy with their current team.',
  receipts: [
    { fact: "You're hiring two Customer Support Advisors in Manchester", where: 'careers page', confidence: 'verified', quote: 'Customer Support Advisor (Manchester, 2 positions)' },
  ],
}

const fence = (s: string) => '```text\n' + s.trim() + '\n```'
const out: string[] = []

out.push(`# Spiel Builder prompts

Generated from the real prompt builders in \`src/lib/spiel.ts\`. Regenerate rather than
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
| \`verifyReceipts\` | A receipt may only say "seen" if its quote literally appears in the pasted text. Everything else is downgraded to "hedge it". |
| \`keepsIdentityClause\` | The positioning clause must appear word for word. If the writer paraphrased it, one repair call fixes that beat only. |
| \`readsAccusatory\` | Catches lines telling the prospect they are failing, and reframes that beat structurally. |
| \`stripEmDash\` | No em dashes reach the prompter, including on hand edits. |
| \`oneParagraph\` / \`remapParagraphs\` | Keeps the single edit box round-tripping onto beats, so per-beat reroll survives editing. |
| \`speakSeconds\` vs \`WINDOW\` | Flags a spiel that runs long, measured on the written part only. |

### The eight beats

${BEATS.map((b, i) => `${i + 1}. **${b.label}** — ${b.hint}`).join('\n')}

### The opening

Not generated at all. It is read from the live call script (\`data/flow.ts\`: the
\`opening\` node plus the first paragraph of \`pitch_q1\`), so the floor maintains one copy
of the approved wording. Costs nothing and appears before any build:

${fence(openingParagraphs('[Lead Name]', '[BDR Name]').join('\n\n'))}
`)

out.push(`\n---\n\n## 1. Spiel only prompt (the default path)

Sent as a single user message. Shown here for a lead with **no** pasted source text.

${fence(buildLeanSpielPrompt(LEAD, '', OA, 'house', true, DAYS))}

### With pasted source text

Only the second block and the homework instruction change:

${fence(buildLeanSpielPrompt(LEAD, SOURCE, OA, 'house', true, DAYS))}
`)

out.push(`\n---\n\n## 2. Researched path, stage one: the brief

With no source text, it asks for less, because there is nothing to verify:

${fence(buildBriefPrompt(LEAD, ''))}

### With pasted source text

${fence(buildBriefPrompt(LEAD, SOURCE))}
`)

out.push(`\n---\n\n## 3. Researched path, stage two: the spiel

Sent as two content blocks. Block A is identical on every build and is marked
\`cache_control: {type: "ephemeral", ttl: "1h"}\`.

### Block A, the cached prefix

${fence(spielStablePrefix(OA, 'house', true, DAYS))}

### Block B, the lead

${fence(spielLeadBlock(LEAD, BRIEF))}
`)

out.push(`\n---\n\n## 4. Reroll one beat

${fence(buildRerollPrompt({ ...BEATS[1], text: 'I was on your careers page and saw you are hiring two support advisors.' }, '(the full script so far)', BRIEF, LEAD, OA, 'house', true))}
`)

out.push(`\n---\n\n## 5. Repair prompts

These only fire when a guard catches something.

### Intro clause was paraphrased

${fence(buildIntroRepairPrompt('So quick thumbnail on us. We are the top offshore staffing site around.', OA.positioning, 'house', true))}

### A beat read as a verdict on their performance

${fence(buildReframePrompt("Either way, you're not hitting the numbers you're measured on.", "The tension inside this exact role's remit", 'VP of Customer Operations', 'house', true))}
`)

writeFileSync('PROMPTS.md', out.join('\n'), 'utf-8')
console.log(`PROMPTS.md written, ${out.join('\n').length} chars`)
