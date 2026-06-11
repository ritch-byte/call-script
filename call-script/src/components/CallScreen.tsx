import { useState, useEffect, useRef } from 'react'
import { flow, QUICK_OBJECTIONS, DEEP_OBJECTIONS, SALARY_TABLE } from '../data/flow'
import type { FlowOption } from '../data/flow'
import type { CallData } from '../App'
import IntroEmailSection from './IntroEmailSection'
import FollowUpCadence from './FollowUpCadence'

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
  'discovery_q3',
  'value_prop',
  'booking',
  'end_booked',
]

const NETLIFY_BASE = 'https://silver-cuchufli-071209.netlify.app'

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

  const isGitHubPages = window.location.hostname.includes('github.io')

  const functionUrl = (name: string) =>
    isGitHubPages
      ? `${NETLIFY_BASE}/.netlify/functions/${name}`
      : `/.netlify/functions/${name}`

  const generateSpiel = async () => {
    setIsGenerating(true)
    setGenError('')
    try {
      const res = await fetch(functionUrl('generate-spiel'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput: rawInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setGeminiResearch(data.spiel)
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
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeIdx])

  const currentNode = flow[steps[activeIdx]?.nodeId ?? 'opening']

  // ── Sync SP name + link from intro email panels back to shared booking state ──
  const extractLink = (text: string) =>
    text.match(/https?:\/\/[^\s]+/)?.[0]?.replace(/[.,;!?]$/, '') ?? ''

  const handleSp1Sync = (name: string, bookingText: string) => {
    if (name) setSharedSp(name)
    const lk = extractLink(bookingText)
    if (lk) setSharedLink(lk)
  }

  const handleSp2Sync = (name: string, bookingText: string) => {
    if (name) setSharedSp2(name)
    const lk = extractLink(bookingText)
    if (lk) setSharedLink2(lk)
  }

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

          {/* ── Shared booking fields ── */}
          <div className="email-booking-block">
            <div className="email-booking-header-row">
              <div className="email-booking-title">Booking Details</div>
              <div className="cad-fg" style={{ width: 130, flexShrink: 0 }}>
                <label className="cad-lbl">Lead's Timezone</label>
                <input className="cad-input" value={sharedTz} onChange={e => setSharedTz(e.target.value)} placeholder="e.g. EST" />
              </div>
            </div>

            <div className="email-booking-sp-section">
              <div className="email-booking-sp-label">Source Partner 1</div>
              <div className="email-booking-sp-row">
                <div className="cad-fg">
                  <label className="cad-lbl">SP Name</label>
                  <input className="cad-input" value={sharedSp} onChange={e => setSharedSp(e.target.value)} placeholder="e.g. ConnectOS" />
                </div>
                <div className="cad-fg">
                  <label className="cad-lbl">Date</label>
                  <input className="cad-input" value={sharedDate} onChange={e => setSharedDate(e.target.value)} placeholder="e.g. June 14, 2026" />
                </div>
                <div className="cad-fg">
                  <label className="cad-lbl">Time</label>
                  <input className="cad-input" value={sharedTime} onChange={e => setSharedTime(e.target.value)} placeholder="e.g. 10:00 AM" />
                </div>
                <div className="cad-fg">
                  <label className="cad-lbl">Meeting Link</label>
                  <input className="cad-input" value={sharedLink} onChange={e => setSharedLink(e.target.value)} placeholder="https://meet.google.com/..." />
                </div>
              </div>
            </div>

            <div className="email-booking-sp-section email-booking-sp-section--optional">
              <div className="email-booking-sp-label">Source Partner 2 <span className="email-booking-optional">(optional)</span></div>
              <div className="email-booking-sp-row">
                <div className="cad-fg">
                  <label className="cad-lbl">SP Name</label>
                  <input className="cad-input" value={sharedSp2} onChange={e => setSharedSp2(e.target.value)} placeholder="e.g. Sourcefit" />
                </div>
                <div className="cad-fg">
                  <label className="cad-lbl">Date</label>
                  <input className="cad-input" value={sharedDate2} onChange={e => setSharedDate2(e.target.value)} placeholder="same as SP1 if blank" />
                </div>
                <div className="cad-fg">
                  <label className="cad-lbl">Time</label>
                  <input className="cad-input" value={sharedTime2} onChange={e => setSharedTime2(e.target.value)} placeholder="same as SP1 if blank" />
                </div>
                <div className="cad-fg">
                  <label className="cad-lbl">Meeting Link</label>
                  <input className="cad-input" value={sharedLink2} onChange={e => setSharedLink2(e.target.value)} placeholder="https://meet.google.com/..." />
                </div>
              </div>
            </div>
          </div>

          {/* ── Intro Email ── */}
          <div className="email-section-hd">
            <span className="email-section-title">Intro Email</span>
            <span className="email-section-sub">Paste the conversation once — generate for up to 2 Source Partners</span>
          </div>
          <IntroEmailSection
            leadName={leadName}
            rawInput={rawInput}
            geminiResearch={geminiResearch}
            sp1BookingPrefill={sp1Prefill}
            sp2BookingPrefill={sp2Prefill}
            onSp1SyncBack={handleSp1Sync}
            onSp2SyncBack={handleSp2Sync}
          />

          {/* ── Follow Up Cadence ── */}
          <div className="email-section-divider">
            <span className="email-section-divider-label">Follow Up Cadence</span>
            <span className="email-section-sub">Templates auto-fill from Booking Details above</span>
          </div>
          <FollowUpCadence
            leadName={leadName}
            yourName={yourName}
            sp={sharedSp}
            date={sharedDate}
            time={sharedTime}
            tz={sharedTz}
            link={sharedLink}
            sp2={sharedSp2}
            date2={sharedDate2}
            time2={sharedTime2}
            link2={sharedLink2}
          />

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
            onClick={() => { setShowRates(v => !v); setShowResearch(false) }}
          >
            Rates
          </button>
          <button
            className={`btn-header-ghost${showResearch ? ' btn-header-active' : ''}`}
            onClick={() => { setShowResearch(v => !v); setShowRates(false) }}
          >
            Research
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

      {/* ── Full call script — all steps visible ── */}
      <div className="call-flow">
        {steps.map((step, idx) => {
          const node = flow[step.nodeId]
          if (!node) return null

          const isDone     = idx < activeIdx
          const isActive   = idx === activeIdx
          const isUpcoming = idx > activeIdx
          const script     = interpolate(node.script, leadName, yourName, geminiResearch, context)

          const stepEndLabel =
            step.nodeId === 'end_booked'   ? 'BOOKED' :
            step.nodeId === 'end_callback' ? 'CALLBACK SET' : 'CALL ENDED'

          const cardClass = [
            'step-card',
            isActive   ? 'step-card--active'   : '',
            isDone     ? 'step-card--done'     : '',
            isUpcoming ? 'step-card--upcoming' : '',
            node.isObjection ? 'step-card--objection' : '',
            node.isEnd       ? 'step-card--end'       : '',
          ].filter(Boolean).join(' ')

          return (
            <div
              key={`${step.nodeId}-${idx}`}
              className={cardClass}
              ref={isActive ? activeRef : null}
            >
              <div className="step-header-row">
                <span className="step-num">{idx + 1}</span>
                <span className="step-label">
                  {node.isObjection ? 'OBJECTION HANDLER'
                    : node.isEnd ? stepEndLabel
                    : node.title}
                </span>
                {isDone && step.chosenLabel && (
                  <span className="chosen-pill">{step.chosenLabel}</span>
                )}
                {isUpcoming && (
                  <span className="upcoming-badge">UPCOMING</span>
                )}
              </div>

              {node.waitForAnswer && isActive && (
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

              {(['value_prop', 'obj_no_role'].includes(step.nodeId)) && isActive && (
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

              {node.tip && isActive && (
                <div className="coach-tip">
                  <div className="coach-tip-label">Coach Tip</div>
                  {node.tip}
                </div>
              )}

              {isActive && !node.isEnd && (
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

              {isActive && node.isEnd && (
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
