// Renders every prompt the Spiel Builder sends, straight from the real builders, into
// PROMPTS.md. Run `npm run prompts` after changing a prompt so the doc cannot drift.
import { writeFileSync } from 'fs'
import {
  buildLeanSpielPrompt, buildRerollPrompt, buildIntroRepairPrompt, buildReframePrompt,
  openingParagraphs, DEFAULT_OA, BEATS,
} from '../src/lib/spiel'
import { BUILD_COST_CENTS, dailyCost, money } from '../src/data/costs'

const OA = DEFAULT_OA
const DAYS = 'Thursday or Friday afternoon'
const LEAD = 'Northbeam Logistics, VP of Customer Operations, northbeam.com'
const SOURCE = [
  'Northbeam Logistics is a third-party logistics provider for mid-market e-commerce',
  'brands in the UK and Ireland, with fulfilment centres in Manchester, Leeds and Dublin.',
  'Careers: hiring a Customer Support Advisor (Manchester, 2 positions).',
].join('\n')

const TICK = '`'
const fence = (s: string) => '```text\n' + s.trim() + '\n```'
const code = (s: string) => TICK + s + TICK
const out: string[] = []

out.push(`# Spiel Builder prompts

Generated from the real prompt builders in ${code('src/lib/spiel.ts')}. Regenerate with
${code('npm run prompts')} rather than hand-editing, so this cannot drift from what the app
actually sends.

## How a build works

One button, one path, one price. The rep pastes a line (company, job title, website) and
presses Build spiel. That is a single call on Haiku 4.5 costing ${BUILD_COST_CENTS} cents,
so 500 builds a day is ${money(dailyCost(BUILD_COST_CENTS, 500))}. There is no research
pass and no model choice, so a rep cannot land on an expensive setting.

The eight beats come back as plain paragraphs rather than JSON, because the JSON
scaffolding costs output tokens for nothing.

### What runs in the browser, not the prompt

Enforced in code after the model replies, which is what keeps a cheap single call honest:

| Guard | What it does |
|---|---|
| ${code('keepsIdentityClause')} | The positioning clause must appear word for word. If the writer paraphrased it, one repair call fixes that beat only. |
| ${code('readsAccusatory')} | Catches lines telling the prospect they are failing, and reframes that beat structurally. |
| ${code('stripEmDash')} | No em dashes reach the prompter, including on hand edits. |
| ${code('parseLeanSpiel')} | Handles blank-line or single-newline separation and strips numbering, so a formatting wobble cannot hand the rep one unusable block. |
| ${code('remapParagraphs')} | Keeps the single edit box round-tripping onto beats, so per-beat reroll survives editing. |
| ${code('speakSeconds')} vs ${code('WINDOW')} | Flags a spiel that runs long, measured on the written part only. |

### The eight beats

${BEATS.map((b, i) => `${i + 1}. **${b.label}** — ${b.hint}`).join('\n')}

### The opening

Not generated at all. It is read from the live call script (${code('data/flow.ts')}: the
${code('opening')} node plus the first paragraph of ${code('pitch_q1')}), so the floor
maintains one copy of the approved wording. It costs nothing and is on screen before any
build:

${fence(openingParagraphs('[Lead Name]', '[BDR Name]').join('\n\n'))}
`)

out.push(`
---

## 1. The build prompt

Sent as a single user message. With **no** pasted source text:

${fence(buildLeanSpielPrompt(LEAD, '', OA, 'house', true, DAYS))}

### With pasted source text

The lead block and the homework instruction change; everything else is identical:

${fence(buildLeanSpielPrompt(LEAD, SOURCE, OA, 'house', true, DAYS))}
`)

out.push(`
---

## 2. Reroll one beat

Only fires when the rep taps a beat in the reroll strip. It carries the pasted source, so a
rerolled homework beat stays as grounded as the original.

${fence(buildRerollPrompt({ ...BEATS[1], text: 'I was on your careers page and saw you are hiring two support advisors.' }, '(the full script so far)', LEAD, SOURCE, OA, 'house', true))}
`)

out.push(`
---

## 3. Repair prompts

These only fire when a guard catches something, so most builds never pay for them.

### The intro clause was paraphrased

${fence(buildIntroRepairPrompt('So quick thumbnail on us. We are the top offshore staffing site around.', OA.positioning, 'house', true))}

### A beat read as a verdict on their performance

${fence(buildReframePrompt("Either way, you're not hitting the numbers you're measured on.", "The tension inside this exact role's remit", 'VP of Customer Operations', 'house', true))}
`)

const doc = out.join('\n')
writeFileSync('PROMPTS.md', doc, 'utf-8')
console.log(`PROMPTS.md written, ${doc.length} chars`)
