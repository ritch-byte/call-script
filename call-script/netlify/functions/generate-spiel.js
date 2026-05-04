exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not set in Netlify environment variables' }),
    }
  }

  let rawInput
  try {
    ;({ rawInput } = JSON.parse(event.body))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  if (!rawInput) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Input is required' }) }
  }

  const prompt = `Role: You are an expert B2B Sales Development Representative specializing in offshore staffing solutions.

Goal: Write a short, hyper-personalized outreach message based on a prospect's Job Title and Company.

The following is raw information about the prospect (may include job title, company name, website, or other details in any format):
${rawInput}

Instructions & Guidelines:
Analyze the Company: Briefly infer their industry and verify their prestige (e.g., "leader in...").
Analyze the Role: Based strictly on their Job Title, identify 2 high-level complexities or responsibilities they likely face.
Positive Framing (Crucial): Do not frame these as "problems" or "pain points." Frame them as "complexities" that lead to a desire for enhancement or growth.
The Solution: Suggest 2 specific offshore roles that would logically support the complexities you identified. Briefly state what each role does.
Length: Keep it under 80 words.
Tone: Professional, knowledgeable, and helpful.

Output Format:
Output ONLY the message itself, no preamble, no quotes around it. Use this exact structure:
I researched [Company] and know you're a leader in the [Industry/Niche]. Given the [Complexity 1] and [Complexity 2] you face as a [Job Title], you're most likely focused on [Positive Goal 1] and [Positive Goal 2]. A great starting point to help is an offshore [Role 1] to [Task 1] or a [Role 2] to [Task 2]. Aside from the roles I've mentioned, what type of role do you think might also be suitable for offshore?`

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
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `API error: ${errText}` }),
      }
    }

    const data = await response.json()
    const spiel = data.content[0].text.trim()

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spiel }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Generation failed' }),
    }
  }
}
