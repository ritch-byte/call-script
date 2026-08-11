// AI proxy for the coaching-log generator.
//
// This forwarded the client's request body verbatim: no model allowlist, no token
// ceiling, and `Access-Control-Allow-Origin: *` from a public static site. One call
// could ask for the most expensive model at its full output length. Nothing has
// abused it (August shows only Haiku and Sonnet 4.6), but it is what made a surge
// unbounded, so the body is clamped before it reaches Anthropic.
const { keyFor, clamp, logUsage } = require('./_spend.cjs')

const APP = 'coach'

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

  const apiKey = keyFor(APP)
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
    }
  }

  try {
    const body = clamp(JSON.parse(event.body))
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    logUsage(APP, data)
    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      body: JSON.stringify(data),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      body: JSON.stringify({ error: err.message || 'Generation failed' }),
    }
  }
}
