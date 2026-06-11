import { useState } from 'react'
import SPEmailPanel from './SPEmailPanel'

interface Props {
  leadName: string
  rawInput: string
  geminiResearch: string
  sp1BookingPrefill: string
  sp2BookingPrefill: string
  onSp1SyncBack?: (name: string, bookingText: string) => void
  onSp2SyncBack?: (name: string, bookingText: string) => void
}

export default function IntroEmailSection({ leadName, rawInput, geminiResearch, sp1BookingPrefill, sp2BookingPrefill, onSp1SyncBack, onSp2SyncBack }: Props) {
  const [conversation, setConversation] = useState(() => {
    const parts: string[] = []
    if (leadName) parts.push(`Lead name: ${leadName}`)
    if (rawInput) parts.push(`Lead info: ${rawInput}`)
    if (geminiResearch) parts.push(`Research spiel used: ${geminiResearch}`)
    return parts.join('\n')
  })

  return (
    <div className="intro-email-section">
      <label className="sp-label" style={{ marginBottom: 5 }}>Conversation / Call Notes</label>
      <textarea
        className="gen-paste-input"
        style={{ width: '100%', boxSizing: 'border-box', minHeight: 90 }}
        placeholder="Paste call notes or transcript — include lead name, job title, company and what they want to outsource."
        value={conversation}
        onChange={e => setConversation(e.target.value)}
        rows={4}
      />

      <div className="intro-email-cols">
        <div className="intro-email-col">
          <div className="intro-email-col-title">Source Partner 1</div>
          <SPEmailPanel conversation={conversation} bookingPrefill={sp1BookingPrefill} onSyncBack={onSp1SyncBack} />
        </div>
        <div className="intro-email-col">
          <div className="intro-email-col-title">Source Partner 2</div>
          <SPEmailPanel conversation={conversation} bookingPrefill={sp2BookingPrefill} onSyncBack={onSp2SyncBack} />
        </div>
      </div>
    </div>
  )
}
