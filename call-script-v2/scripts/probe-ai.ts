/**
 * Transport for throwaway probes, kept separate from the floor's transport.
 *
 * WHY THIS EXISTS
 * Probes used to call the same Apps Script relay the app uses, so every test run
 * billed the key the floor bills. On Aug 6 that meant 28 probe scripts, most re-run
 * repeatedly while profiling, landing on the same line of the usage page as the reps'
 * real builds: ~3.7M tokens against a ~600k baseline, and no way to tell afterwards
 * which was which.
 *
 * This posts straight to Anthropic with a development key instead. The split is by
 * construction rather than by convention: the relay's key is now only ever spent by
 * the floor, and this file refuses to run without its own key rather than quietly
 * falling back to the shared one. A spike on the usage page is then self-explanatory
 * once you group by API key.
 *
 * Going direct also drops the ~1-in-6 Google HTML failure the relay suffers, so
 * probes stop needing the retry and run faster.
 *
 * SETUP, ONCE
 * 1. console.anthropic.com -> API keys -> create one named oa-dev.
 * 2. Save it as call-script-v2/.env.probe:  ANTHROPIC_API_KEY_DEV=sk-ant-...
 *    That file is gitignored. An exported ANTHROPIC_API_KEY_DEV works too, but a
 *    file survives between shells, which an env var on Windows often does not.
 */
import { readFileSync } from 'fs'
import { join } from 'path'

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

/** Cents per million tokens, [input, output]. */
const RATES: Record<string, [number, number]> = {
  'claude-haiku-4-5-20251001': [100, 500],
  'claude-haiku-4-5': [100, 500],
  'claude-sonnet-4-6': [300, 1500],
  'claude-sonnet-5': [300, 1500],
  'claude-opus-5': [500, 2500],
}

/**
 * The development key, or a loud failure.
 *
 * Deliberately no fallback to the relay or to ANTHROPIC_API_KEY. A fallback would
 * quietly put test spend back on the floor's key, which is the exact thing this file
 * exists to prevent, and it would do so invisibly.
 */
function devKey(): string {
  const fromEnv = process.env.ANTHROPIC_API_KEY_DEV
  if (fromEnv) return fromEnv.trim()

  // A probe's bundle usually lands outside the project, so cwd varies by how it was
  // launched. Check the places a run can reasonably start from rather than assuming
  // one, otherwise a key that exists looks missing.
  const candidates = [
    join(process.cwd(), '.env.probe'),
    join(process.cwd(), 'call-script-v2', '.env.probe'),
    join(process.cwd(), '..', 'call-script-v2', '.env.probe'),
  ]
  for (const path of candidates) {
    try {
      const text = readFileSync(path, 'utf8')
      const line = text.split(/\r?\n/).find((l: string) => l.trim().startsWith('ANTHROPIC_API_KEY_DEV='))
      const value = line?.split('=').slice(1).join('=').trim()
      if (value) return value
    } catch { /* try the next one */ }
  }

  throw new Error(
    'No development key. Probes must not spend the floor\'s key.\n' +
    '  Create one at console.anthropic.com (name it oa-dev), then either:\n' +
    '    write call-script-v2/.env.probe  ->  ANTHROPIC_API_KEY_DEV=sk-ant-...\n' +
    '    or export ANTHROPIC_API_KEY_DEV in this shell.'
  )
}

export type ProbeBody = {
  model: string
  maxTokens?: number
  messages: { role: 'user' | 'assistant'; content: string }[]
  system?: unknown
  tools?: unknown[]
}

/** Running total for the process, so a probe can report what it just spent. */
let spentCents = 0
let calls = 0

/** Same call shape as the app's callAIRaw, so probes read the same way. */
export async function probeAI(body: ProbeBody): Promise<any> {
  const payload: Record<string, unknown> = {
    model: body.model,
    max_tokens: body.maxTokens ?? 1000,
    messages: body.messages,
  }
  if (body.system) payload.system = body.system
  if (body.tools?.length) payload.tools = body.tools

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': devKey(),
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Anthropic sent unreadable body (${res.status}): ${text.slice(0, 200)}`)
  }
  if (data?.error) throw new Error(data.error.message || `Anthropic returned ${res.status}`)

  spentCents += costCents(data)
  calls += 1
  return data
}

/** What one response cost, from its own usage numbers rather than an estimate. */
export function costCents(data: any): number {
  const u = data?.usage || {}
  const rate = RATES[data?.model] || RATES['claude-haiku-4-5-20251001']
  return ((u.input_tokens || 0) * rate[0] + (u.output_tokens || 0) * rate[1]) / 1e6
}

/** Print what this probe run cost. Call it last so a run is never silently expensive. */
export function reportSpend(): void {
  console.log(
    `\nprobe spend: ${spentCents.toFixed(3)}c across ${calls} call${calls === 1 ? '' : 's'}` +
    ' (development key, not the floor\'s)'
  )
}