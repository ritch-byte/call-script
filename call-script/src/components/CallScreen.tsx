import { useState, useEffect, useRef } from 'react'
import { flow, QUICK_OBJECTIONS, DEEP_OBJECTIONS, SALARY_TABLE } from '../data/flow'
import type { FlowOption } from '../data/flow'
import type { CallData } from '../App'
import EmailComposer from './EmailComposer'
import { callAI, buildResearchPrompt } from '../lib/ai'

interface Props {
  callData: CallData
  onReset: () => void
}

type Context = Record<string, string>

type StepEntry = {
  nodeId: string
  chosenLabel?: string
}

const MAIN_FLOW = [
  'opening',
  'pitch_q1',
  'discovery_q2',
  'discovery_priority',
  'qualify_role',
  'priority_cta',
  'qualify_fulltime',
  'qualify_volume',
  'qualify_timeline',
  'qualify_dm',
  'value_offer',
  'two_meeting',
  'booking',
  'close_recap',
  'end_booked',
]

function interpolate(text: string, leadName: string, yourName: string, geminiResearch: string, ctx: Context): string {
  return text
    .replace(/{leadName}/g, leadName || '[Lead Name]')
    .replace(/{yourName}/g, yourName || '[BDR Name]')
    .replace(/{geminiResearch}/g, geminiResearch)
    .replace(/{hiringSetup}/g, ctx.hiringSetup ?? 'team')
    .trimEnd()
}

export default function CallScreen({ onReset }: Props) {
  const [steps, setSteps] = useState<StepEntry[]>(
    MAIN_FLOW.map(id => ({ nodeId: id }))
  )
  const [activeIdx, setActiveIdx] = useState(0)
  const [context, setContext] = useState<Context>({})
  const [showObjections, setShowObjections] = useState(false)
  const [showRates, setShowRates] = useState(false)
  const [showResearch, setShowResearch] = useState(false)
  const [showGates, setShowGates] = useState(false)
  const [emailPageOpen, setEmailPageOpen] = useState(false)
  const [leadName, setLeadName] = useState('')
  const [yourName, setYourName] = useState('')
  const [geminiResearch, setGeminiResearch] = useState('')
  const [rawInput, setRawInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [sharedSp, setSharedSp]       = useState('')
  const [sharedDate, setSharedDate]   = useState('')
  const [sharedTime, setSharedTime]   = useState('')
  const [sharedTz, setSharedTz]       = useState('')
  const [sharedLink, setSharedLink]   = useState('')
  const [sharedSp2, setSharedSp2]     = useState('')
  const [sharedDate2, setSharedDate2] = useState('')
  const [sharedTime2, setSharedTime2] = useState('')
  const [sharedLink2, setSharedLink2] = useState('')
  const activeRef = useRef<HTMLDivElement>(null)

  const generateSpiel = async () => {
    setIsGenerating(true)
    setGenError('')
    try {
      const spiel = await callAI({
        prompt: buildResearchPrompt(rawInput.trim()),
        model: 'claude-haiku-4-5-20251001',
        maxTokens: 400,
      })
      setGeminiResearch(spiel)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const goTo = (option: FlowOption) => {
    if (option.capture) setContext(prev => ({ ...prev, ...option.capture }))
    const nextId = option.next
    const updatedSteps = [...steps]
    updatedSteps[activeIdx] = { ...updatedSteps[activeIdx], chosenLabel: option.label }
    const aheadIdx = updatedSteps.findIndex((s, i) => i > activeIdx && s.nodeId === nextId)
    let nextActive: number
    if (aheadIdx !== -1) {
      nextActive = aheadIdx
    } else {
      updatedSteps.splice(activeIdx + 1, 0, { nodeId: nextId })
      nextActive = activeIdx + 1
    }
    setSteps(updatedSteps)
    setActiveIdx(nextActive)
    setShowObjections(false)
    setShowRates(false)
  }

  const goBack = () => {
    if (activeIdx <= 0) return
    const updatedSteps = [...steps]
    const isInjected = !MAIN_FLOW.includes(updatedSteps[activeIdx].nodeId)
    if (isInjected) updatedSteps.splice(activeIdx, 1)
    const prevIdx = activeIdx - 1
    updatedSteps[prevIdx] = { ...updatedSteps[prevIdx], chosenLabel: undefined }
    setSteps(updatedSteps)
    setActiveIdx(prevIdx)
    setShowObjections(false)
  }

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [activeIdx])

  const currentNode = flow[steps[activeIdx]?.nodeId ?? 'opening']

  // ── Sync SP name, date, time, link from intro email panels back to shared booking state ──
  const extractLink = (text: string) =>
    text.match(/https?:\/\/[^\s]+/)?.[0]?.replace(/[.,;!?]$/, '') ?? ''

  const extractTime = (text: string) =>
    text.match(/\b\d{1,2}:\d{2}\s*(?:am|pm)(?:\s+[A-Z]{2,5})?\b/i)?.[0]?.trim() ?? ''

  const extractDate = (text: string) =>
    text.match(/\b(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\w*[,\s]+)?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*[\s.]+\d{1,2}(?:[,\s]+\d{4})?\b/i)?.[0]?.trim() ?? ''

  const syncBooking = (
    name: string, bookingText: string,
    setName: (v: string) => void, setLk: (v: string) => void,
    setT: (v: string) => void, setD: (v: string) => void,
  ) => {
    if (name) setName(name)
    const lk = extractLink(bookingText); if (lk) setLk(lk)
    const t  = extractTime(bookingText);  if (t)  setT(t)
    const d  = extractDate(bookingText);  if (d)  setD(d)
  }

  const handleSp1Sync = (name: string, bt: string) =>
    syncBooking(name, bt, setSharedSp, setSharedLink, setSharedTime, setSharedDate)

  const handleSp2Sync = (name: string, bt: string) =>
    syncBooking(name, bt, setSharedSp2, setSharedLink2, setSharedTime2, setSharedDate2)

  // ── Email Generator full-page view ──────────────────────────────────────
  const mkPrefill = (d: string, t: string, lk: string) => [
    [d, t, sharedTz].filter(Boolean).join(' '),
    lk ? `Meeting Link: ${lk}` : '',
  ].filter(Boolean).join('\n')

  const sp1Prefill = mkPrefill(sharedDate, sharedTime, sharedLink)
  const sp2Prefill = mkPrefill(sharedDate2 || sharedDate, sharedTime2 || sharedTime, sharedLink2)

  if (emailPageOpen) {
    return (
      <div className="call-screen">
        <div className="email-page-header">
          <button className="email-page-back" onClick={() => setEmailPageOpen(false)}>
            ← Back to Call
          </button>
          <span className="email-page-title">Email Generator</span>
        </div>

        <div className="email-page-body">
          <EmailComposer />
        </div>
      </div>
    )
  }

  // ── Normal call screen ───────────────────────────────────────────────────
  return (
    <div className="call-screen">

      {/* ── Header ── */}
      <div className="call-header">
        <div className="header-brand">
          <span className="brand-mark">OA</span>
        </div>
        <div className="call-info">
          <input
            className="lead-name-input"
            type="text"
            placeholder="BDR name..."
            value={yourName}
            onChange={e => setYourName(e.target.value)}
          />
          <input
            className="lead-name-input"
            type="text"
            placeholder="Lead's name..."
            value={leadName}
            onChange={e => setLeadName(e.target.value)}
          />
        </div>
        <div className="header-actions">
          <button
            className={`btn-header-ghost${showRates ? ' btn-header-active' : ''}`}
            onClick={() => { setShowRates(v => !v); setShowResearch(false); setShowGates(false) }}
          >
            Rates
          </button>
          <button
            className={`btn-header-ghost${showResearch ? ' btn-header-active' : ''}`}
            onClick={() => { setShowResearch(v => !v); setShowRates(false); setShowGates(false) }}
          >
            Research
          </button>
          <button
            className={`btn-header-ghost${showGates ? ' btn-header-active' : ''}`}
            onClick={() => { setShowGates(v => !v); setShowRates(false); setShowResearch(false) }}
          >
            Gates
          </button>
          <button
            className="btn-header-ghost"
            onClick={() => setEmailPageOpen(true)}
          >
            Email Generator
          </button>
          <button className="btn-header-ghost" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>

      {/* ── Rates Panel ── */}
      {showRates && (
        <div className="reference-bar">
          <div className="reference-bar-header">
            <span className="reference-bar-title">US Salary vs Offshore (Philippines)</span>
            <button className="btn-ref-close" onClick={() => setShowRates(false)}>Close</button>
          </div>
          <div className="salary-table-wrap">
            <table className="salary-table">
              <thead>
                <tr><th>Role</th><th>US/yr</th><th>Offshore/yr</th><th>Savings</th></tr>
              </thead>
              <tbody>
                {SALARY_TABLE.map(row => (
                  <tr key={row.role}>
                    <td>{row.role}</td>
                    <td>{row.us}</td>
                    <td>{row.offshore}</td>
                    <td className="savings-cell">{row.savings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Research Panel ── */}
      {showResearch && (
        <div className="reference-bar">
          <div className="reference-bar-header">
            <span className="reference-bar-title">Research Generator</span>
            <button className="btn-ref-close" onClick={() => setShowResearch(false)}>Close</button>
          </div>
          <div className="generator-form">
            <div className="gen-fields">
              <textarea
                className="gen-paste-input"
                placeholder="Paste lead info here — Job Title, Company Name, Website"
                value={rawInput}
                onChange={e => setRawInput(e.target.value)}
                rows={2}
              />
              <button
                className="btn-generate"
                onClick={generateSpiel}
                disabled={isGenerating || !rawInput.trim()}
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
            {genError && <div className="gen-error">{genError}</div>}
          </div>
          <textarea
            className="research-input"
            placeholder="Generated spiel appears here — or paste your own research..."
            value={geminiResearch}
            onChange={e => setGeminiResearch(e.target.value)}
            rows={4}
          />
        </div>
      )}

      {/* ── Gates Cheat Card ── */}
      {showGates && (
        <div className="reference-bar">
          <div className="reference-bar-header">
            <span className="reference-bar-title">The 3 Gates — say it out loud</span>
            <button className="btn-ref-close" onClick={() => setShowGates(false)}>Close</button>
          </div>
          <p style={{ margin: '0 0 12px', fontSize: 12.5, color: '#5b6379' }}>
            The analyzer credits what the <strong style={{ color: '#15213f' }}>buyer</strong> says out loud — not your summary. Get a spoken &ldquo;yes&rdquo; on all three.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { g: 'Gate 1 · Near-term need', ask: '“When would you want someone starting?”', say: ['“one to two months”', '“thirty to sixty days”'], not: ['“2–3 months”', '“90 days”', '“next year”'] },
              { g: 'Gate 2 · Open to offshore', ask: '“Offshore, on your hours — open to that?”', say: ['“yes, open to that”', '“the Philippines is fine”', '“we already use offshore”'], not: ['“must be local”', '“on-site only”'] },
              { g: 'Gate 3 · Full-time dedicated', ask: '“Full-time dedicated, or part-time?”', say: ['“full-time”', '“dedicated, just for us”', '“forty hours”'], not: ['“part-time”', '“project / shared”', '“ad hoc”'] },
            ].map(c => (
              <div key={c.g} style={{ background: '#fff', border: '1px solid #e5e8f1', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.02em', color: '#d6006e', marginBottom: 6 }}>{c.g}</div>
                <div style={{ fontSize: 12.5, color: '#5b6379', fontStyle: 'italic', marginBottom: 10 }}>{c.ask}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {c.say.map(s => (
                    <div key={s} style={{ fontSize: 13, color: '#15213f' }}>
                      <span style={{ color: '#0f9e78', fontWeight: 800, marginRight: 6 }}>✓</span>{s}
                    </div>
                  ))}
                  {c.not.map(n => (
                    <div key={n} style={{ fontSize: 12.5, color: '#98a0b3' }}>
                      <span style={{ color: '#c0364a', fontWeight: 800, marginRight: 6 }}>✕</span>{n}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, background: '#f2f4fa', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: '#3f4a5f' }}>
            <strong style={{ color: '#15213f' }}>Recap &amp; lock:</strong> end on a question, wait for an audible &ldquo;yes.&rdquo; A nod isn&rsquo;t proof. &ldquo;Maybe / possibly / probably&rdquo; reads as <strong style={{ color: '#c0364a' }}>unclear</strong> and flags — convert it to an explicit yes before you book.
          </div>
        </div>
      )}

      {/* ── Full call script — all steps visible ── */}
      <div className="call-flow">
        {steps.map((step, idx) => {
          if (idx !== activeIdx) return null

          const node = flow[step.nodeId]
          if (!node) return null

          const script = interpolate(node.script, leadName, yourName, geminiResearch, context)

          const stepEndLabel =
            step.nodeId === 'end_booked'   ? 'BOOKED' :
            step.nodeId === 'end_callback' ? 'CALLBACK SET' : 'CALL ENDED'

          const cardClass = [
            'step-card step-card--active',
            node.isObjection ? 'step-card--objection' : '',
            node.isEnd       ? 'step-card--end'       : '',
          ].filter(Boolean).join(' ')

          return (
            <div
              key={`${step.nodeId}-${idx}`}
              className={cardClass}
              ref={activeRef}
            >
              <div className="step-header-row">
                <span className="step-num">{idx + 1}</span>
                <span className="step-label">
                  {node.isObjection ? 'OBJECTION HANDLER'
                    : node.isEnd ? stepEndLabel
                    : node.title}
                </span>
              </div>

              {node.waitForAnswer && (
                <div className="wait-indicator">
                  <span className="pulse" />
                  Waiting for answer...
                </div>
              )}

              <div className="script-text">
                {script.split('\n').map((line, i) =>
                  line ? <p key={i}>{line}</p> : <br key={i} />
                )}
              </div>

              {(['value_prop', 'obj_no_role'].includes(step.nodeId)) && (
                <div className="inline-research-form">
                  {!geminiResearch ? (
                    <>
                      <div className="inline-research-label">Paste lead info — Job Title, Company Name, Website:</div>
                      <div className="gen-fields">
                        <textarea
                          className="gen-paste-input"
                          placeholder="e.g. Head of Sales · Acme Corp · acme.com"
                          value={rawInput}
                          onChange={e => setRawInput(e.target.value)}
                          rows={2}
                        />
                        <button
                          className="btn-generate"
                          onClick={generateSpiel}
                          disabled={isGenerating || !rawInput.trim()}
                        >
                          {isGenerating ? 'Generating...' : 'Generate'}
                        </button>
                      </div>
                      {genError && <div className="gen-error">{genError}</div>}
                    </>
                  ) : (
                    <button className="btn-regenerate" onClick={() => setGeminiResearch('')}>
                      Regenerate Research
                    </button>
                  )}
                </div>
              )}

              {node.tip && (
                <div className="coach-tip">
                  <div className="coach-tip-label">Coach Tip</div>
                  {node.tip}
                </div>
              )}

              {!node.isEnd && (
                <div className="options-section">
                  <div className="options-label">Lead responds:</div>
                  <div className="options-grid">
                    {node.options.map(opt => {
                      const cls =
                        opt.type === 'end'       ? ' btn-option--danger'
                        : opt.type === 'objection' ? ' btn-option--warn'
                        : opt.type === 'positive'  ? ' btn-option--positive'
                        : ''
                      return (
                        <button
                          key={opt.next}
                          className={`btn-option${cls}`}
                          onClick={() => goTo(opt)}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {node.isEnd && (
                <div className="end-actions">
                  <button
                    className="btn-primary"
                    onClick={() => setEmailPageOpen(true)}
                  >
                    Follow Up Cadence
                  </button>
                  <button className="btn-secondary" onClick={onReset}>
                    Start New Call
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Bottom Bar ── */}
      <div className="bottom-bar">
        <button className="btn-back" onClick={goBack} disabled={activeIdx === 0}>
          ← Back
        </button>
        {!currentNode.isEnd && (
          <button
            className={`btn-objections${showObjections ? ' btn-objections--active' : ''}`}
            onClick={() => setShowObjections(v => !v)}
          >
            Objections
          </button>
        )}
        <span className="step-counter">Step {activeIdx + 1} of {steps.length}</span>
      </div>

      {/* ── Objections Overlay ── */}
      {showObjections && (
        <div className="overlay" onClick={() => setShowObjections(false)}>
          <div className="objections-panel" onClick={e => e.stopPropagation()}>
            <div className="objections-header">
              <h3>Objection Handlers</h3>
              <button className="btn-panel-close" onClick={() => setShowObjections(false)}>
                Close
              </button>
            </div>

            <div className="objections-section-label">Common</div>
            <div className="objections-list">
              {QUICK_OBJECTIONS.map(obj => (
                <button key={obj.next} className="btn-objection-item" onClick={() => goTo(obj)}>
                  {obj.label}
                </button>
              ))}
            </div>

            <div className="objections-section-label objections-section-label--deep">Offshore-Specific</div>
            <div className="objections-list">
              {DEEP_OBJECTIONS.map(obj => (
                <button key={obj.next} className="btn-objection-item btn-objection-item--deep" onClick={() => goTo(obj)}>
                  {obj.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
