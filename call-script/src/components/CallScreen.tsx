import { useState, useEffect, useRef } from 'react'
import { flow, QUICK_OBJECTIONS, DEEP_OBJECTIONS, SALARY_TABLE } from '../data/flow'
import type { FlowOption } from '../data/flow'
import type { CallData } from '../App'

interface Props {
  callData: CallData
  onReset: () => void
}

type Context = Record<string, string>

type StepEntry = {
  nodeId: string
  chosenLabel?: string
}

// The main positive call path — always pre-rendered so the caller can see the full script
const MAIN_FLOW = [
  'opening',
  'pitch_q1',
  'discovery_q2',
  'discovery_q3',
  'value_prop',
  'booking',
  'end_booked',
]

function interpolate(text: string, leadName: string, geminiResearch: string, ctx: Context): string {
  return text
    .replace(/{leadName}/g, leadName || 'there')
    .replace(/{yourName}/g, 'I')
    .replace(/{geminiResearch}/g, geminiResearch || '[No research added — paste it via the Research button]')
    .replace(/{hiringSetup}/g, ctx.hiringSetup ?? 'team')
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
  const [leadName, setLeadName] = useState('')
  const [geminiResearch, setGeminiResearch] = useState('')
  const [rawInput, setRawInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const activeRef = useRef<HTMLDivElement>(null)

  const generateSpiel = async () => {
    setIsGenerating(true)
    setGenError('')
    try {
      const res = await fetch('/.netlify/functions/generate-spiel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput: rawInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setGeminiResearch(data.spiel)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Generation failed — check API key is set in Netlify')
    } finally {
      setIsGenerating(false)
    }
  }

  const goTo = (option: FlowOption) => {
    if (option.capture) setContext(prev => ({ ...prev, ...option.capture }))

    const nextId = option.next
    const updatedSteps = [...steps]

    // Record the choice on the current step
    updatedSteps[activeIdx] = { ...updatedSteps[activeIdx], chosenLabel: option.label }

    // Is the next node already pre-rendered ahead of us?
    const aheadIdx = updatedSteps.findIndex((s, i) => i > activeIdx && s.nodeId === nextId)

    let nextActive: number
    if (aheadIdx !== -1) {
      // Jump to the pre-rendered step (positive flow advance)
      nextActive = aheadIdx
    } else {
      // Inject new step right after current (objection handler or alternate branch)
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

    // If the current step was injected (not in the original main flow), remove it
    const isInjected = !MAIN_FLOW.includes(updatedSteps[activeIdx].nodeId)
    if (isInjected) {
      updatedSteps.splice(activeIdx, 1)
    }

    // Clear the chosen label on the step we're returning to
    const prevIdx = activeIdx - 1
    updatedSteps[prevIdx] = { ...updatedSteps[prevIdx], chosenLabel: undefined }

    setSteps(updatedSteps)
    setActiveIdx(prevIdx)
    setShowObjections(false)
  }

  // Scroll active step into view whenever it changes
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeIdx])

  const currentNode = flow[steps[activeIdx]?.nodeId ?? 'opening']

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
            <div className="gen-row">
              <input
                className="gen-input"
                type="text"
                placeholder="e.g. CEO, Acme Corp, acme.com"
                value={rawInput}
                onChange={e => setRawInput(e.target.value)}
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
          const script     = interpolate(node.script, leadName, geminiResearch, context)

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
              {/* Step header */}
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

              {/* Wait indicator */}
              {node.waitForAnswer && isActive && (
                <div className="wait-indicator">
                  <span className="pulse" />
                  Waiting for answer...
                </div>
              )}

              {/* Script text — always visible */}
              <div className="script-text">
                {script.split('\n').map((line, i) =>
                  line ? <p key={i}>{line}</p> : <br key={i} />
                )}
              </div>

              {/* Coach tip — active only */}
              {node.tip && isActive && (
                <div className="coach-tip">
                  <div className="coach-tip-label">Coach Tip</div>
                  {node.tip}
                </div>
              )}

              {/* Response buttons — active non-end steps only */}
              {isActive && !node.isEnd && (
                <div className="options-section">
                  <div className="options-label">Lead responds:</div>
                  <div className="options-grid">
                    {node.options.map(opt => {
                      const cls =
                        opt.type === 'end'      ? ' btn-option--danger'
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

              {/* End state */}
              {isActive && node.isEnd && (
                <div className="end-actions">
                  <button className="btn-primary" onClick={onReset}>
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