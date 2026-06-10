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
  const [showEmail, setShowEmail] = useState(false)
  const [leadName, setLeadName] = useState('')
  const [yourName, setYourName] = useState('')
  const [geminiResearch, setGeminiResearch] = useState('')
  const [rawInput, setRawInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailCopied, setEmailCopied] = useState(false)
  const activeRef = useRef<HTMLDivElement>(null)

  const isGitHubPages = window.location.hostname.includes('github.io')
  const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY as string | undefined

  const SPIEL_PROMPT = (input: string) => `Role: You are an expert B2B Sales Development Representative specializing in offshore staffing solutions.

Goal: Write a short, hyper-personalized outreach message based on a prospect's Job Title and Company.

The following is raw information about the prospect (may include job title, company name, website, or other details in any format — extract the company name and job title from it):
${input}

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

  const functionUrl = (name: string) =>
    isGitHubPages
      ? `${NETLIFY_BASE}/.netlify/functions/${name}`
      : `/.netlify/functions/${name}`

  const generateSpiel = async () => {
    setIsGenerating(true)
    setGenError('')
    try {
      if (isGitHubPages) {
        if (!GEMINI_KEY) {
          setGenError('Gemini key not configured — contact your admin')
          setIsGenerating(false)
          return
        }
        const res = await fetch(functionUrl('generate-spiel'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawInput: rawInput.trim() }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Generation failed')
        setGeminiResearch(data.spiel)
      } else {
        const res = await fetch(functionUrl('generate-spiel'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawInput: rawInput.trim() }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Generation failed')
        setGeminiResearch(data.spiel)
      }
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateEmail = async () => {
    setIsGeneratingEmail(true)
    setEmailError('')
    setEmailSubject('')
    setEmailBody('')
    try {
      const res = await fetch(functionUrl('generate-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName: leadName.trim(),
          yourName: yourName.trim(),
          rawInput: rawInput.trim(),
          spiel: geminiResearch.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setEmailSubject(data.subject)
      setEmailBody(data.body)
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGeneratingEmail(false)
    }
  }

  const copyEmail = () => {
    const full = `Subject: ${emailSubject}\n\n${emailBody}`
    navigator.clipboard.writeText(full).then(() => {
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    })
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

  const closeAllPanels = () => {
    setShowRates(false)
    setShowResearch(false)
    setShowEmail(false)
  }

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
            onClick={() => { setShowRates(v => !v); setShowResearch(false); setShowEmail(false) }}
          >
            Rates
          </button>
          <button
            className={`btn-header-ghost${showResearch ? ' btn-header-active' : ''}`}
            onClick={() => { setShowResearch(v => !v); setShowRates(false); setShowEmail(false) }}
          >
            Research
          </button>
          <button
            className={`btn-header-ghost${showEmail ? ' btn-header-active' : ''}`}
            onClick={() => { setShowEmail(v => !v); setShowRates(false); setShowResearch(false) }}
          >
            Email
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
                placeholder={"Paste lead info here — Job Title, Company Name, Website"}
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

      {/* ── Email Panel ── */}
      {showEmail && (
        <div className="reference-bar">
          <div className="reference-bar-header">
            <span className="reference-bar-title">Follow-Up Email Generator</span>
            <button className="btn-ref-close" onClick={() => setShowEmail(false)}>Close</button>
          </div>
          <div className="generator-form">
            <div className="email-meta-row">
              <span className="email-meta-hint">
                Uses lead info, BDR name, and research already entered above.
              </span>
              <button
                className="btn-generate"
                onClick={generateEmail}
                disabled={isGeneratingEmail}
              >
                {isGeneratingEmail ? 'Generating...' : emailBody ? 'Regenerate' : 'Generate Email'}
              </button>
            </div>
            {emailError && <div className="gen-error">{emailError}</div>}
          </div>
          {emailBody && (
            <div className="email-output">
              <div className="email-subject-row">
                <span className="email-field-label">Subject</span>
                <input
                  className="email-subject-input"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                />
              </div>
              <div className="email-field-label" style={{ marginTop: 8 }}>Body</div>
              <textarea
                className="research-input"
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                rows={6}
              />
              <button className="btn-copy-email" onClick={copyEmail}>
                {emailCopied ? 'Copied!' : 'Copy Email'}
              </button>
            </div>
          )}
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

              {/* Inline research form — value_prop and obj_no_role steps, active only */}
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
                    <button
                      className="btn-regenerate"
                      onClick={() => setGeminiResearch('')}
                    >
                      Regenerate Research
                    </button>
                  )}
                </div>
              )}

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
                  <button
                    className="btn-primary"
                    onClick={() => { setShowEmail(true); closeAllPanels(); setShowEmail(true) }}
                  >
                    Generate Follow-Up Email
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
