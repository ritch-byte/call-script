import { useState } from 'react'
import type { CSSProperties } from 'react'
import { callAI } from '../lib/ai'

// ---------------------------------------------------------------
// OA BRAND TOKENS
// ---------------------------------------------------------------
const NAVY = '#15213f'
const NAVY_DEEP = '#0f1729'
const MAGENTA = '#d6006e'
const MAGENTA_SOFT = '#ff5fa8'
const PAPER = '#f6f7fb'

// ---------------------------------------------------------------
// BEST-PRACTICES KNOWLEDGE BASE (from the internal field guide)
// ---------------------------------------------------------------
const BEST_PRACTICES = `
EMAIL BEST PRACTICES (apply ALL of these strictly):

PERSONALIZATION (the biggest lever):
- Open with a trigger-based "why now" pulled from the conversation: a real recent event, statement, pain point, or buying signal the prospect mentioned.
- Situational relevance over name-dropping. Never write a line that could be copy-pasted to 500 other people.
- Speak to their role's specific pain, their industry, their stage. Show homework was done.
- Use 2+ specific references from the conversation.

FRAMEWORK (pick silently, based on the prospect's awareness level):
- Problem-aware buyer: PAS (name the problem, show the cost of living with it, present the solution as relief).
- Cold contact: BAB (current struggle, then the fixed better world, then position as the bridge with proof).
- Unaware or lightly aware: AIDA.

SUBJECT LINES:
- 2 to 7 words. Casual, lowercase, no formal language, NO emojis.
- Promise the result, not the content.

CTA:
- ONE email, ONE ask. Never two asks.
- Focus on the transformation after the click, not the click.
- Warm prospect with clear value: a specific-time ask wins.
- Colder or early-stage: a low-friction yes/no question wins. Match friction to warmth.

STRUCTURE AND LENGTH:
1. Specific context (personalized hook, the why now)
2. Evidence of their problem (you understand their world)
3. Cost of inaction (gentle agitation)
4. Social proof (one like-them result, briefly)
5. One low-friction CTA
- Body length: 50 to 125 words total. Plain text feel, no bullet walls, no fancy formatting.
- Confident, direct benefit statements backed with proof.

STYLE RULE (hard requirement):
- NEVER use em dashes or en dashes anywhere in the subject or body. Use commas, periods, or the word "to" instead.
`

// ---------------------------------------------------------------
// OA OFFER HOOK (woven into every generated email)
// ---------------------------------------------------------------
const OFFER_HOOK = `
THE OFFER HOOK (weave this into the email):
Core hook: Get three matched offshore candidates, ready to interview.
Supporting sweeteners:
1. Two free consultations explaining how offshoring works
2. A $100 Amazon voucher
3. No commitment, no catches

HOW TO USE IT:
- The hook supports the ONE CTA, it does not replace it. Never turn it into a second ask.
- Lead with the core hook (three matched, interview-ready candidates) as the tangible value; use at most one or two sweeteners naturally in prose, whichever fits the prospect best. Do not paste all three as a bullet list.
- Frame it as the transformation: they walk away with interview-ready candidates and clarity on offshoring, at zero risk.
- Keep the whole email inside the 50 to 125 word limit even with the hook included.
`

const CHECKLIST_KEYS = [
  { key: 'opener_unique', label: 'Opener only sendable to this person' },
  { key: 'why_now', label: 'Clear “why now” trigger' },
  { key: 'one_cta', label: 'One ask, one CTA' },
  { key: 'length_ok', label: 'Body 50 to 125 words, plain text' },
  { key: 'subject_ok', label: 'Subject 2 to 7 words, no emoji, promises result' },
] as const

interface Variant {
  label: string
  subject: string
  body: string
  checklist?: Record<string, boolean>
  followUp?: string
}

interface ComposerResult {
  trigger: string
  variants: Variant[]
}

const wordCount = (s: string) => (s || '').trim().split(/\s+/).filter(Boolean).length
const stripDashes = (s: string) => (s || '').replace(/—|–/g, ', ').replace(/ ,/g, ',')

export default function EmailComposer() {
  const [conversation, setConversation] = useState('')
  const [includeHook, setIncludeHook] = useState(true)
  const [showGuide, setShowGuide] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ComposerResult | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const canGenerate = conversation.trim().length > 30

  const generate = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    setCopiedIdx(null)

    const prompt = `You are an elite BDR email copywriter. Using the conversation below, write the TWO best possible outbound emails, strictly following this field guide:

${BEST_PRACTICES}
${includeHook ? OFFER_HOOK : ''}

CONVERSATION / SOURCE MATERIAL (mine this for triggers, pains, names, quotes, buying signals):
"""
${conversation.trim()}
"""

SENDER AND GOAL: Infer both from the conversation itself. Identify who the sender is (the seller/SDR side) and sign off with their name if it appears; otherwise sign off with [Your name]. Infer the most natural next-step goal for the email (e.g. book a meeting, follow up, re-engage) from where the conversation left off.

You decide everything: framework, CTA friction, angle. Just produce the two strongest emails you can, each taking a genuinely different angle so the sender can pick. Extract the single strongest "why now" trigger you found.

Self-grade each email against the pre-send checklist honestly (true/false per item).

REMINDER: absolutely no em dashes or en dashes in any subject or body.

Respond with ONLY valid JSON, no markdown fences, no preamble, in exactly this shape:
{
  "trigger": "the strongest why-now trigger found, one sentence",
  "variants": [
    {
      "label": "2-4 word label for this angle",
      "subject": "the subject line",
      "body": "the full email body with real line breaks, ending with a sign-off using the sender's name",
      "checklist": {"opener_unique": true, "why_now": true, "one_cta": true, "length_ok": true, "subject_ok": true},
      "followUp": "one sentence suggesting the follow-up plan on a 3-7-7 cadence"
    }
  ]
}`

    try {
      const text = await callAI({ prompt, model: 'claude-sonnet-4-6', maxTokens: 1500 })
      const clean = text.replace(/```json|```/g, '').trim()
      const data = JSON.parse(clean)
      if (!data.variants || !data.variants.length) throw new Error('No variants returned')

      // Safety net: strip any dash that slipped through
      data.trigger = stripDashes(data.trigger)
      data.variants = data.variants.map((v: Variant) => ({
        ...v,
        subject: stripDashes(v.subject),
        body: stripDashes(v.body),
        followUp: stripDashes(v.followUp || ''),
      }))
      setResult(data)
    } catch (e) {
      console.error(e)
      setError(
        e instanceof Error && e.message !== 'Generation failed'
          ? e.message
          : 'Generation failed. Try again, or trim the conversation to the key exchange.'
      )
    } finally {
      setLoading(false)
    }
  }

  const copyEmail = (v: Variant, idx: number) => {
    const txt = `Subject: ${v.subject}\n\n${v.body}`
    navigator.clipboard.writeText(txt).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1600)
    })
  }

  // -------------------------------------------------------------
  // Reusable inline styles
  // -------------------------------------------------------------
  const card: CSSProperties = {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    padding: 16,
  }
  const labelStyle: CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: NAVY,
  }
  const pill = (bg: string, color: string): CSSProperties => ({
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 999,
    background: bg,
    color,
  })

  return (
    <div style={{ background: PAPER, borderRadius: 12, overflow: 'hidden', fontFamily: 'Calibri, Arial, sans-serif' }}>
      <style>{'@keyframes ec-spin{to{transform:rotate(360deg)}} .ec-spin{display:inline-block;animation:ec-spin 0.9s linear infinite}'}</style>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(120deg, ${NAVY_DEEP} 0%, ${NAVY} 70%)`, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>Conversation to Email Composer</span>
              <span style={pill(MAGENTA, '#fff')}>BDR</span>
            </div>
            <p style={{ fontSize: 12, marginTop: 4, color: '#9aa4c4' }}>
              Paste any conversation. Get the two best emails, graded against the pre-send checklist.
            </p>
          </div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #2a3558',
              background: 'transparent',
              color: MAGENTA_SOFT,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {showGuide ? 'Hide' : 'Show'} field guide {showGuide ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* FIELD GUIDE STRIP */}
      {showGuide && (
        <div style={{ background: NAVY, padding: '16px 24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              fontSize: 12,
              color: '#c3cae0',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4, color: MAGENTA_SOFT }}>Personalize or die</div>
              Trigger-based "why now" from the conversation. If a line could go to 500 people, it isn't personalization.
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4, color: MAGENTA_SOFT }}>Framework by awareness</div>
              Problem-aware gets PAS. Cold gets BAB. Unaware gets AIDA. Picked for the buyer, automatically.
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4, color: MAGENTA_SOFT }}>Subject and length</div>
              Subject 2 to 7 words, lowercase, no emoji, promise the result. Body 50 to 125 words, plain text.
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4, color: MAGENTA_SOFT }}>One ask</div>
              One CTA only. Specific time when warm, low-friction yes/no when cold. Follow up on 3-7-7.
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 2fr) minmax(320px, 3fr)',
          gap: 24,
          padding: 24,
          alignItems: 'start',
        }}
      >
        {/* LEFT: INPUTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={card}>
            <label style={labelStyle}>Paste the conversation</label>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 8px' }}>
              Call transcript, email thread, chat log, or LinkedIn exchange. The composer mines it for triggers and pains.
            </p>
            <textarea
              value={conversation}
              onChange={(e) => setConversation(e.target.value)}
              rows={10}
              placeholder={
                'e.g.\nProspect: We just opened a second office in Cebu and support tickets are piling up...\nSDR: How is the team handling volume today?\nProspect: Honestly, two people are drowning...'
              }
              style={{
                width: '100%',
                boxSizing: 'border-box',
                fontSize: 13,
                border: '1px solid #d1d5db',
                borderRadius: 8,
                padding: 12,
                resize: 'vertical',
                minHeight: 180,
                fontFamily: 'inherit',
              }}
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
              {wordCount(conversation)} words
            </div>
          </div>

          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <label style={labelStyle}>Offer hook</label>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4, color: MAGENTA }}>
                  Get three matched offshore candidates, ready to interview
                </div>
                <ul style={{ fontSize: 12, color: '#4b5563', margin: '6px 0 0', paddingLeft: 18 }}>
                  <li>Two free consultations explaining how offshoring works</li>
                  <li>Get a $100 Amazon voucher</li>
                  <li>No commitment, no catches</li>
                </ul>
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                  Woven naturally into the email in support of the single CTA, never as a second ask.
                </p>
              </div>
              <button
                onClick={() => setIncludeHook(!includeHook)}
                aria-label="Toggle offer hook"
                style={{
                  flexShrink: 0,
                  width: 44,
                  height: 24,
                  borderRadius: 999,
                  position: 'relative',
                  border: 'none',
                  cursor: 'pointer',
                  background: includeHook ? MAGENTA : '#c4c9d8',
                  transition: 'background 0.15s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: includeHook ? 22 : 2,
                    width: 20,
                    height: 20,
                    background: '#fff',
                    borderRadius: '50%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    transition: 'left 0.15s',
                  }}
                />
              </button>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={!canGenerate || loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 0',
              borderRadius: 12,
              fontWeight: 700,
              color: '#fff',
              fontSize: 14,
              border: 'none',
              cursor: !canGenerate || loading ? 'default' : 'pointer',
              opacity: !canGenerate || loading ? 0.4 : 1,
              background: `linear-gradient(90deg, ${MAGENTA} 0%, ${MAGENTA_SOFT} 100%)`,
            }}
          >
            {loading ? (
              <>
                <span className="ec-spin">↻</span> Mining the conversation...
              </>
            ) : (
              <>✨ Generate the 2 best emails</>
            )}
          </button>
          {error && <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{error}</div>}
        </div>

        {/* RIGHT: OUTPUT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!result && !loading && (
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                border: '2px dashed #d1d5db',
                padding: 40,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 8 }}>⚡</div>
              <div style={{ fontWeight: 700, color: NAVY }}>Your 2 best emails will appear here</div>
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
                The composer picks the framework, CTA style, and angle for you, then grades each email against the 5-point
                pre-send checklist.
              </p>
            </div>
          )}

          {loading && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 40, textAlign: 'center' }}>
              <div className="ec-spin" style={{ fontSize: 22, color: MAGENTA }}>
                ↻
              </div>
              <p style={{ fontSize: 14, marginTop: 12, fontWeight: 600, color: NAVY }}>Extracting triggers and drafting...</p>
            </div>
          )}

          {result && (
            <>
              {/* TRIGGER BANNER */}
              <div style={{ borderRadius: 12, padding: 16, color: '#fff', background: NAVY }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: MAGENTA_SOFT }}>
                  Strongest "why now" trigger found
                </div>
                <div style={{ fontSize: 14, marginTop: 4, fontWeight: 600 }}>{result.trigger}</div>
              </div>

              {result.variants.map((v, idx) => {
                const wc = wordCount(v.body)
                const lengthOk = wc >= 50 && wc <= 125
                const passed = CHECKLIST_KEYS.filter((c) => v.checklist?.[c.key]).length
                return (
                  <div key={idx} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderBottom: '1px solid #f3f4f6',
                        background: '#fafbff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ ...pill(MAGENTA, '#fff'), borderRadius: 4 }}>Email {idx + 1}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{v.label}</span>
                      </div>
                      <button
                        onClick={() => copyEmail(v, idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '6px 10px',
                          borderRadius: 6,
                          border: '1px solid #d6d9e4',
                          background: '#fff',
                          color: NAVY,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedIdx === idx ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>

                    <div style={{ padding: 16 }}>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>Subject</div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: NAVY }}>{v.subject}</div>
                      <div
                        style={{
                          fontSize: 14,
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.6,
                          color: '#1f2937',
                          borderLeft: `4px solid ${MAGENTA_SOFT}`,
                          paddingLeft: 12,
                        }}
                      >
                        {v.body}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 16 }}>
                        <span style={lengthOk ? pill('#e8f7ef', '#137a45') : pill('#fdecec', '#b42318')}>
                          {wc} words {lengthOk ? '· in range' : '· outside 50 to 125'}
                        </span>
                      </div>

                      {/* CHECKLIST */}
                      <div style={{ marginTop: 16, borderRadius: 8, border: '1px solid #e5e7eb', padding: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, marginBottom: 8, color: NAVY }}>
                          Pre-send checklist · {passed}/{CHECKLIST_KEYS.length}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 6 }}>
                          {CHECKLIST_KEYS.map((c) => {
                            const ok = c.key === 'length_ok' ? lengthOk && v.checklist?.[c.key] : v.checklist?.[c.key]
                            return (
                              <div key={c.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12 }}>
                                <span
                                  style={{
                                    marginTop: 2,
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    flexShrink: 0,
                                    fontSize: 9,
                                    background: ok ? MAGENTA : '#c4c9d8',
                                  }}
                                >
                                  {ok ? '✓' : '✕'}
                                </span>
                                <span style={ok ? { color: '#374151' } : { color: '#9ca3af', textDecoration: 'line-through' }}>
                                  {c.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {v.followUp && (
                        <div style={{ marginTop: 12, fontSize: 12, color: '#4b5563' }}>
                          <span style={{ fontWeight: 700, color: MAGENTA }}>Follow-up plan (3-7-7): </span>
                          {v.followUp}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={generate}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #d6d9e4',
                    background: '#fff',
                    color: NAVY,
                    cursor: 'pointer',
                  }}
                >
                  ↻ Regenerate
                </button>
              </div>
            </>
          )}

          {/* TIMING FOOTER */}
          <div
            style={{
              borderRadius: 12,
              padding: '12px 16px',
              fontSize: 12,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px 24px',
              background: '#eef0f7',
              color: NAVY,
            }}
          >
            <span>
              <b>Launch sequences:</b> Monday
            </span>
            <span>
              <b>Peak engagement:</b> Wednesday
            </span>
            <span>
              <b>Send window:</b> 9:30 to 11:30 AM recipient's local time
            </span>
            <span>
              <b>Cadence:</b> 3-7-7 captures ~93% of replies by Day 10
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
