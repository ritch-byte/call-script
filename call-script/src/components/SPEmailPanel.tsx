import { useState } from 'react'
import { SP_TEMPLATES } from '../data/spTemplates'

const NETLIFY_BASE = 'https://silver-cuchufli-071209.netlify.app'
const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g

function mdToHtml(text: string): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const linked = escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener" style="color:#1a73e8;">$1</a>'
  )
  return linked.replace(/\n/g, '<br>')
}

function mdToPlain(text: string): string {
  return text.replace(LINK_RE, '$1 ($2)')
}

function buildPrompt(variant: { subject: string; body: string }, conversation: string, booking: string): string {
  return `You personalize a fixed meeting-confirmation email template for Outsource Accelerator using the SDR's conversation with the lead.

<template_subject>
${variant.subject}
</template_subject>

<template_body>
${variant.body}
</template_body>

<conversation_with_lead>
${conversation}
</conversation_with_lead>

<booking_details>
${booking || '(none provided)'}
</booking_details>

RULES — follow all exactly:
1. The template is the skeleton. Keep its paragraph order, fixed sentences, partner description and closing exactly as written. Do not rewrite, shorten or embellish fixed copy.
2. The template contains markdown hyperlinks in the form [link text](url). Preserve every one character for character. Never drop, alter or rewrite a link or its text.
3. Replace every merge tag and bracket placeholder using only facts from the conversation or booking details:
   - {{ contact.firstname }} = lead's first name
   - [Lead's First Name], [Lead's First and Last name] = lead's name as appropriate
   - [Job Title] = lead's job title
   - [Company] = lead's company name
   - {{ contact.quote_role_to_outsource }} = a short specific phrase describing the role/function the lead wants to outsource (e.g. "2 customer support reps for their e-commerce store"). Keep it factual and specific.
4. The sentence introducing the lead to the partner POC may be lightly extended with 1 short factual clause from the conversation (team size, timeline, pain) if clearly stated. Never invent details.
5. Date:, Time:, Meeting Location/Link: fill from booking details if available. If not available, keep the label followed by a blank and list it in "missing".
6. In the subject line, replace "Date of Appointment" with the actual appointment date if known, otherwise keep the placeholder and add it to "missing".
7. Any placeholder you cannot fill: leave it visibly as [PLACEHOLDER] and add to "missing". Never guess names, titles, companies, dates or roles.
8. Style: plain, warm, professional. No hype, no pressure. Never use em dashes.
9. Respond with ONLY a JSON object, no markdown fences, no preamble. Escape newlines as \\n:
{"subject": "...", "body": "...", "missing": ["items SDR still needs to fill in, empty array if none"]}`
}

interface SPResult {
  subject: string
  body: string
  missing: string[]
}

interface Props {
  leadName: string
  rawInput: string
  geminiResearch: string
}

export default function SPEmailPanel({ leadName, rawInput, geminiResearch }: Props) {
  const isGitHubPages = window.location.hostname.includes('github.io')
  const fnUrl = (name: string) =>
    isGitHubPages ? `${NETLIFY_BASE}/.netlify/functions/${name}` : `/.netlify/functions/${name}`

  const [partnerIdx, setPartnerIdx] = useState(0)
  const [variantIdx, setVariantIdx] = useState(0)
  const [conversation, setConversation] = useState(() => {
    const parts: string[] = []
    if (leadName) parts.push(`Lead name: ${leadName}`)
    if (rawInput) parts.push(`Lead info: ${rawInput}`)
    if (geminiResearch) parts.push(`Research spiel used: ${geminiResearch}`)
    return parts.join('\n')
  })
  const [booking, setBooking] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SPResult | null>(null)
  const [copied, setCopied] = useState('')
  const [editing, setEditing] = useState(false)

  const partner = SP_TEMPLATES[partnerIdx]
  const variant = partner.variants[Math.min(variantIdx, partner.variants.length - 1)]
  const canGenerate = conversation.trim().length > 20 && !loading

  const flash = (key: string) => {
    setCopied(key)
    setTimeout(() => setCopied(''), 1500)
  }

  const copyPlain = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    flash(key)
  }

  const copyRich = async (mdText: string, key: string) => {
    const html = mdToHtml(mdText)
    const plain = mdToPlain(mdText)
    try {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' }),
      })
      await navigator.clipboard.write([item])
    } catch {
      const div = document.createElement('div')
      div.contentEditable = 'true'
      div.innerHTML = html
      div.style.cssText = 'position:fixed;left:-9999px'
      document.body.appendChild(div)
      const range = document.createRange()
      range.selectNodeContents(div)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      document.execCommand('copy')
      sel?.removeAllRanges()
      document.body.removeChild(div)
    }
    flash(key)
  }

  const generate = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    setEditing(false)
    try {
      const prompt = buildPrompt(variant, conversation, booking)
      const res = await fetch(fnUrl('sp-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult({ subject: data.subject, body: data.body, missing: data.missing || [] })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    }
    setLoading(false)
  }

  return (
    <div className="sp-email-panel">
      {/* Partner + variant selection */}
      <div className="sp-form-row">
        <div className="sp-form-col">
          <label className="sp-label">Source Partner</label>
          <select
            className="sp-select"
            value={partnerIdx}
            onChange={e => { setPartnerIdx(Number(e.target.value)); setVariantIdx(0); setResult(null) }}
          >
            {SP_TEMPLATES.map((p, i) => (
              <option key={p.partner} value={i}>{p.partner}</option>
            ))}
          </select>
        </div>

        {partner.variants.length > 1 && (
          <div className="sp-form-col">
            <label className="sp-label">POC</label>
            <div className="sp-variant-pills">
              {partner.variants.map((v, i) => (
                <button
                  key={v.label}
                  className={`sp-variant-pill${i === variantIdx ? ' sp-variant-pill--active' : ''}`}
                  onClick={() => { setVariantIdx(i); setResult(null) }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Inputs */}
      <label className="sp-label" style={{ marginTop: 10 }}>Conversation / call notes</label>
      <textarea
        className="gen-paste-input"
        style={{ width: '100%', boxSizing: 'border-box', minHeight: 90 }}
        placeholder="Paste call notes or transcript — include lead name, job title, company and what they want to outsource."
        value={conversation}
        onChange={e => setConversation(e.target.value)}
        rows={4}
      />

      <label className="sp-label" style={{ marginTop: 8 }}>Booking details <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span></label>
      <textarea
        className="gen-paste-input"
        style={{ width: '100%', boxSizing: 'border-box' }}
        placeholder="Date, time, meeting link — e.g. June 13, 2026, 10:00 AM PHT, Google Meet link"
        value={booking}
        onChange={e => setBooking(e.target.value)}
        rows={2}
      />

      <button
        className="btn-generate"
        style={{ marginTop: 10, width: '100%' }}
        onClick={generate}
        disabled={!canGenerate}
      >
        {loading ? `Generating ${partner.partner} email...` : 'Generate Confirmation Email'}
      </button>
      {error && <div className="gen-error">{error}</div>}

      {/* Result */}
      {result && (
        <div className="sp-result">
          {result.missing.length > 0 && (
            <div className="sp-missing-warning">
              <strong>Fill in before sending:</strong> {result.missing.join('; ')}
            </div>
          )}

          {/* To */}
          <div className="sp-result-field">
            <div className="sp-result-field-left">
              <span className="sp-field-label">TO</span>
              <span className="sp-field-value">
                {variant.to || <em style={{ color: '#B3003C' }}>not set — add manually</em>}
              </span>
            </div>
            {variant.to && (
              <button className="sp-copy-btn" onClick={() => copyPlain(variant.to, 'to')}>
                {copied === 'to' ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>

          {/* CC */}
          {variant.cc && (
            <div className="sp-result-field">
              <div className="sp-result-field-left">
                <span className="sp-field-label">CC</span>
                <span className="sp-field-value">{variant.cc}</span>
              </div>
              <button className="sp-copy-btn" onClick={() => copyPlain(variant.cc, 'cc')}>
                {copied === 'cc' ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}

          {/* Subject */}
          <div className="sp-result-field">
            <div className="sp-result-field-left">
              <span className="sp-field-label">SUBJECT</span>
              <span className="sp-field-value">{result.subject}</span>
            </div>
            <button className="sp-copy-btn" onClick={() => copyPlain(result.subject, 'subj')}>
              {copied === 'subj' ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Body */}
          <div className="sp-body-section">
            <div className="sp-body-header">
              <span className="sp-field-label">BODY</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="sp-copy-btn" onClick={() => setEditing(!editing)}>
                  {editing ? 'Preview' : 'Edit'}
                </button>
                <button className="sp-copy-btn sp-copy-btn--primary" onClick={() => copyRich(result.body, 'body')}>
                  {copied === 'body' ? 'Copied!' : 'Copy for Gmail'}
                </button>
              </div>
            </div>
            {editing ? (
              <textarea
                className="gen-paste-input"
                style={{ width: '100%', boxSizing: 'border-box', minHeight: 260, fontSize: 13 }}
                value={result.body}
                onChange={e => setResult({ ...result, body: e.target.value })}
                rows={10}
              />
            ) : (
              <div
                className="sp-body-preview"
                dangerouslySetInnerHTML={{ __html: mdToHtml(result.body) }}
              />
            )}
            {editing && (
              <div style={{ fontSize: 11, color: '#8A90A8', marginTop: 4 }}>
                Keep links as [text](url) — they stay clickable when you copy.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
