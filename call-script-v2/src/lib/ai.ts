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
export async function callAIRaw(body: {
  model?: string
  maxTokens?: number
  messages: Array<{ role: string; content: string }>
  tools?: unknown[]
}): Promise<AIResponse> {
  const payload: Record<string, unknown> = {
    model: body.model || 'claude-sonnet-4-6',
    max_tokens: body.maxTokens ?? 1200,
    messages: body.messages,
  }
  if (body.tools) payload.tools = body.tools

  const res = await fetch(AI_RELAY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })
  const data: AIResponse = await res.json()
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

/** House style: em dashes never survive to the prompter. */
export function stripEmDash(s: string): string {
  return (s || '').replace(/—/g, ', ').replace(/\s*--\s*/g, ', ')
}

/** Send a single-user-message prompt to the relay and return the model's text. */
export async function callAI({ prompt, model, maxTokens }: CallAIOptions): Promise<string> {
  const res = await fetch(AI_RELAY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      model: model || 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens ?? 700,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  if (data && data.error) {
    throw new Error(typeof data.error === 'string' ? data.error : data.error.message || 'AI request failed')
  }
  const text = data && data.content && data.content[0] && data.content[0].text
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
