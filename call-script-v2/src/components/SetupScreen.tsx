import { useState } from 'react'
import type { CallData } from '../App'

interface Props {
  onStart: (data: CallData) => void
}

export default function SetupScreen({ onStart }: Props) {
  const [leadName, setLeadName] = useState('')
  const [yourName, setYourName] = useState('')
  const [geminiResearch, setGeminiResearch] = useState('')

  const canStart = leadName.trim().length > 0 && yourName.trim().length > 0

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <div className="setup-header">
          <h1>Outsource Accelerator</h1>
          <p>Live Call Script</p>
        </div>
        <div className="form-group">
          <label>Your Name</label>
          <input
            type="text"
            placeholder="e.g. John Santos"
            value={yourName}
            onChange={e => setYourName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Lead's Name</label>
          <input
            type="text"
            placeholder="e.g. Sarah Miller"
            value={leadName}
            onChange={e => setLeadName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>
            Gemini Research
            <span className="optional-tag">optional — can add before value prop</span>
          </label>
          <textarea
            placeholder="Paste your research about this lead / their company here..."
            value={geminiResearch}
            onChange={e => setGeminiResearch(e.target.value)}
            rows={5}
          />
        </div>
        <button
          className="btn-primary"
          onClick={() =>
            onStart({
              leadName: leadName.trim(),
              yourName: yourName.trim(),
              geminiResearch: geminiResearch.trim(),
            })
          }
          disabled={!canStart}
        >
          Start Call
        </button>
      </div>
    </div>
  )
}
