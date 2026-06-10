const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not set in Netlify environment variables' }),
    }
  }

  let leadName, yourName, rawInput, spiel
  try {
    ;({ leadName, yourName, rawInput, spiel } = JSON.parse(event.body))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  const prompt = `You are a B2B Sales Development Representative at Outsource Accelerator, a leading offshore staffing advisory firm.

You just finished a cold call with a prospect and need to write a short follow-up email.

Context:
- Lead name: ${leadName || 'the prospect'}
- BDR name: ${yourName || 'the BDR'}
- Lead info (company / role / website): ${rawInput || 'not provided'}
- Research spiel used on the call: ${spiel || 'not provided'}

Write a follow-up email to send immediately after the call. The email should:
1. Thank them briefly for their time
2. Reinforce the value of what Outsource Accelerator offers (offshore staffing, significant cost savings, pre-vetted talent)
3. Reference their specific company/role if info was provided — keep it personalized
4. Include a clear next step: confirm the Discovery Call booking or invite them to pick a time
5. Be concise — 4 to 6 sentences max
6. Tone: professional, warm, not pushy

Output format — respond with ONLY valid JSON, no markdown, no preamble:
{"subject": "...", "body": "..."}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        body: JSON.stringify({ error: `API error: ${errText}` }),
      }
    }

    const data = await response.json()
    const text = data.content[0].text.trim()

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        body: JSON.stringify({ error: 'Failed to parse email response' }),
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      body: JSON.stringify({ subject: parsed.subject, body: parsed.body }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      body: JSON.stringify({ error: err.message || 'Generation failed' }),
    }
  }
}
