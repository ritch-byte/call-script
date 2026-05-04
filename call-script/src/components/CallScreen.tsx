import { useState } from 'react'
import { flow, QUICK_OBJECTIONS } from '../data/flow'
import type { FlowOption } from '../data/flow'
import type { CallData } from '../App'

interface Props {
  callData: CallData
  onReset: () => void
}

type Context = Record<string, string>

function interpolate(text: string, leadName: string, geminiResearch: string, ctx: Context): string {
  return text
    .replace(/{leadName}/g, leadName || 'there')
    .replace(/{yourName}/g, 'I')
    .replace(/{geminiResearch}/g, geminiResearch || '[No research added]')
    .replace(/{hiringSetup}/g, ctx.hiringSetup ?? 'team')
}

export default function CallScreen({ onReset }: Props) {
  const [currentId, setCurrentId] = useState('opening')
  const [history, setHistory] = useState<string[]>([])
  const [context, setContext] = useState<Context>({})
  const [showObjections, setShowObjections] = useState(false)
  const [leadName, setLeadName] = useState('')
  const [geminiResearch, setGeminiResearch] = useState('')
  const [showResearch, setShowResearch] = useState(false)

  const node = flow[currentId]

  const goTo = (option: FlowOption) => {
    setHistory(prev => [...prev, currentId])
    if (option.capture) setContext(prev => ({ ...prev, ...option.capture }))
    setCurrentId(option.next)
    setShowObjections(false)
  }

  const goBack = () => {
    if (history.length === 0) return
    setCurrentId(history[history.length - 1])
    setHistory(h => h.slice(0, -1))
    setShowObjections(false)
  }

  const script = interpolate(node.script, leadName, geminiResearch, context)
  const breadcrumbPath = [...history, currentId]

  const cardClass = [
    'script-card',
    node.isObjection ? 'script-card--objection' : '',
    node.isEnd ? 'script-card--end' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const endLabel =
    currentId === 'end_booked'
      ? 'BOOKED'
      : currentId === 'end_callback'
      ? 'CALLBACK SET'
      : 'CALL ENDED'

  return (
    <div className="call-screen">
      <div className="call-header">
        <div className="call-info">
          <input
            className="lead-name-input"
            type="text"
            placeholder="Lead's name..."
            value={leadName}
            onChange={e => setLeadName(e.target.value)}
          />
          <span className="call-step">Step {history.length + 1}</span>
        </div>
        <div className="header-actions">
          <button
            className="btn-header-ghost"
            onClick={() => setShowResearch(v => !v)}
          >
            Research
          </button>
          <button className="btn-header-ghost" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>

      {showResearch && (
        <div className="research-bar">
          <textarea
            className="research-input"
            placeholder="Paste Gemini research here before the value prop..."
            value={geminiResearch}
            onChange={e => setGeminiResearch(e.target.value)}
            rows={4}
          />
        </div>
      )}

      <div className="breadcrumb">
        {breadcrumbPath.map((id, i) => (
          <span key={i}>
            {i > 0 && <span className="crumb-sep"> / </span>}
            <span className={i === breadcrumbPath.length - 1 ? 'crumb crumb--active' : 'crumb'}>
              {flow[id]?.title ?? id}
            </span>
          </span>
        ))}
      </div>

      <div className={cardClass}>
        {node.isObjection && (
          <div className="card-tag card-tag--objection">OBJECTION HANDLER</div>
        )}
        {node.isEnd && <div className="card-tag card-tag--end">{endLabel}</div>}

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
      </div>

      {!node.isEnd && (
        <div className="options-section">
          <div className="options-label">Lead responds:</div>
          <div className="options-grid">
            {node.options.map(opt => {
              const cls =
                opt.type === 'end' ? ' btn-option--danger'
                : opt.type === 'objection' ? ' btn-option--warn'
                : opt.type === 'positive' ? ' btn-option--positive'
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
          <button className="btn-primary" onClick={onReset}>
            Start New Call
          </button>
        </div>
      )}

      <div className="bottom-bar">
        <button className="btn-back" onClick={goBack} disabled={history.length === 0}>
          Back
        </button>
        {!node.isEnd && (
          <button
            className={`btn-objections${showObjections ? ' btn-objections--active' : ''}`}
            onClick={() => setShowObjections(v => !v)}
          >
            Objections
          </button>
        )}
      </div>

      {showObjections && (
        <div className="overlay" onClick={() => setShowObjections(false)}>
          <div className="objections-panel" onClick={e => e.stopPropagation()}>
            <div className="objections-header">
              <h3>Quick Objection Handlers</h3>
              <button className="btn-panel-close" onClick={() => setShowObjections(false)}>
                Close
              </button>
            </div>
            <div className="objections-list">
              {QUICK_OBJECTIONS.map(obj => (
                <button
                  key={obj.next}
                  className="btn-objection-item"
                  onClick={() => goTo(obj)}
                >
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
