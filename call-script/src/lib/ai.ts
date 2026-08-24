// Client-side AI relay — routes through a Google Apps Script web app instead of Netlify.
// The script relays { model, max_tokens, messages } to Claude and returns the raw
// Anthropic response. A text/plain content-type keeps this a CORS-simple request
// (no preflight), which is what lets it work straight from the browser.
export const AI_RELAY_URL =
  'https://script.google.com/macros/s/AKfycby2akMg_lgj-eKdRsmylzVCnzPG_GOFrW1992Xb7rQNkQESzu7F_I2WY4CFk4jPPAoY/exec'

interface CallAIOptions {
  prompt: string
  model?: string
  maxTokens?: number
}

/** A single content block as returned by the Anthropic API. */
export interface AIBlock {
  type: string
  text?: string
}

export interface AIResponse {
  content?: AIBlock[]
  error?: unknown
}

/**
 * Lower-level relay call. Returns the raw Anthropic response so callers can
 * inspect the whole content array, not just the first text block.
 *
 * `tools` is passed through for forward compatibility: the current Apps Script
 * relay only forwards { model, max_tokens, messages }, so a tools array is
 * silently dropped and the model answers without searching. Callers must treat
 * the absence of web_search_tool_result blocks as "no live evidence" rather
 * than assuming a search happened. See relay/Code.gs to enable passthrough.
 */
/**
 * A message's content may be a plain string, or content blocks when we want to mark part
 * of the prompt as cacheable. The relay forwards `messages` verbatim, so cache_control
 * reaches Anthropic untouched.
 */
export type AIContent = string | Array<Record<string, unknown>>

/** Mark a block of prompt text as cacheable for an hour. */
export const cached = (text: string) => ({
  type: 'text',
  text,
  cache_control: { type: 'ephemeral', ttl: '1h' },
})

export async function callAIRaw(body: {
  model?: string
  maxTokens?: number
  messages: Array<{ role: string; content: AIContent }>
  tools?: unknown[]
}): Promise<AIResponse> {
  const payload: Record<string, unknown> = {
    model: body.model || 'claude-sonnet-4-6',
    max_tokens: body.maxTokens ?? 1200,
    messages: body.messages,
  }
  if (body.tools) payload.tools = body.tools

  return postRelay(payload)
}

/**
 * POST to the relay and parse the reply defensively.
 *
 * Apps Script does not always answer with JSON: under bursts, or mid-redeploy, it
 * serves an HTML error page. Calling res.json() on that throws "Unexpected token
 * '<'", which tells a rep nothing. Read the body as text first so we can say what
 * actually happened.
 */
async function postRelay(payload: Record<string, unknown>): Promise<AIResponse> {
  // Apps Script intermittently fails to serve the script at all, answering with a
  // Google "unable to open the file at this time" page (usually a 404). Measured at
  // roughly one request in six, and independent of payload size. The script never runs
  // in that case, so retrying once costs nothing and turns most of these into a slightly
  // slower build rather than a failed one the rep has to notice and repeat by hand.
  const attempt = async () => {
    let res: Response
    try {
      res = await fetch(AI_RELAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      })
    } catch {
      return { unreachable: true as const }
    }
    const body = await res.text()
    return { body, notServed: /^\s*</.test(body) || !body.trim() }
  }

  let out = await attempt()
  if ('unreachable' in out || out.notServed) {
    await new Promise(r => setTimeout(r, 1500))
    out = await attempt()
  }

  if ('unreachable' in out) {
    throw new Error('Could not reach the AI relay. Check your connection and try again.')
  }
  if (out.notServed) {
    throw new Error(
      'The AI relay did not answer, twice in a row. Google sometimes drops these for a few seconds. Press Build spiel again.',
    )
  }
  const body = out.body as string

  let data: AIResponse
  try {
    data = JSON.parse(body)
  } catch {
    throw new Error('The AI relay sent something unreadable. Try again in a moment.')
  }

  if (data && data.error) {
    const e = data.error as { message?: string }
    throw new Error(typeof data.error === 'string' ? data.error : e.message || 'AI request failed')
  }
  return data
}

/** Join every text block in a response. */
export function textFrom(data: AIResponse): string {
  return (data.content || [])
    .filter(b => b.type === 'text' && typeof b.text === 'string')
    .map(b => b.text as string)
    .join('\n')
    .trim()
}

/** True when the model actually ran a server-side web search on this response. */
export function usedWebSearch(data: AIResponse): boolean {
  return (data.content || []).some(
    b => b.type === 'web_search_tool_result' || b.type === 'server_tool_use',
  )
}

/** Pull the first JSON object out of a model reply, tolerating fences/preamble. */
export function parseJSON<T>(raw: string): T {
  const clean = (raw || '').replace(/```json|```/g, '').trim()
  const a = clean.indexOf('{')
  const b = clean.lastIndexOf('}')
  if (a === -1 || b === -1) throw new Error('no JSON in response')
  return JSON.parse(clean.slice(a, b + 1)) as T
}

/**
 * House style: em dashes never survive to the prompter.
 * Consumes the spaces either side, otherwise "Done — sending" reads back as
 * "Done ,  sending" with a stray space in front of the comma.
 */
export function stripEmDash(s: string): string {
  return (s || '').replace(/\s*[—–]\s*/g, ', ').replace(/\s*--\s*/g, ', ')
}

/** Send a single-user-message prompt to the relay and return the model's text. */
export async function callAI({ prompt, model, maxTokens }: CallAIOptions): Promise<string> {
  const data = await postRelay({
    model: model || 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens ?? 700,
    messages: [{ role: 'user', content: prompt }],
  })
  const text = data.content?.[0]?.text
  if (typeof text !== 'string') throw new Error('Unexpected AI response')
  return text.trim()
}

/** Prompt for the call-screen research/spiel generator. */
export function buildResearchPrompt(rawInput: string): string {
  return `Role: You are an expert B2B Sales Development Representative specializing in offshore staffing solutions.

Goal: Write a short, hyper-personalized outreach message based on a prospect's Job Title and Company.

The following is raw information about the prospect (may include job title, company name, website, or other details in any format — extract the company name and job title from it):
${rawInput}

Instructions & Guidelines:
Analyze the Company: Briefly infer their industry and verify their prestige (e.g., "leader in...").
Analyze the Role: Based strictly on their Job Title, identify 2 high-level complexities or responsibilities they likely face.
Positive Framing (Crucial): Do not frame these as "problems" or "pain points." Frame them as "complexities" that lead to a desire for enhancement or growth (e.g., instead of "struggling with workload," use "focused on enhancing operational efficiency").
The Solution: Suggest 2 specific offshore roles that would logically support the complexities you identified. Briefly state what each role does.
Length: Keep it under 80 words.
Tone: Professional, knowledgeable, and helpful.

Output Format:
Output ONLY the message itself, no preamble, no quotes around it. Use this exact structure:
I researched [Company] and know you're a leader in the [Industry/Niche]. Given the [Complexity 1] and [Complexity 2] you face as a [Job Title], you're most likely focused on [Positive Goal 1] and [Positive Goal 2]. A great starting point to help is an offshore [Role 1] to [Task 1] or a [Role 2] to [Task 2]. Aside from the roles I've mentioned, what type of role do you think might also be suitable for offshore?`
}
