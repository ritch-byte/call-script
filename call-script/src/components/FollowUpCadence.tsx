import { useState } from 'react'

interface Props {
  leadName: string
  yourName: string
}

const CHANNEL_COLOR: Record<string, string> = {
  TEXT: '#16a34a',
  EMAIL: '#1a54e8',
  LinkedIn: '#0077b5',
  CALL: '#dc2626',
}

function Badge({ ch }: { ch: string }) {
  return (
    <span className="cad-badge" style={{ background: CHANNEL_COLOR[ch] ?? '#6b7280' }}>
      {ch}
    </span>
  )
}

export default function FollowUpCadence({ leadName: initLead, yourName: initYou }: Props) {
  const [lead, setLead]   = useState(initLead || '')
  const [you, setYou]     = useState(initYou || '')
  const [sp, setSp]       = useState('')
  const [date, setDate]   = useState('')
  const [time, setTime]   = useState('')
  const [tz, setTz]       = useState('')
  const [link, setLink]   = useState('')
  const [p2n, setP2n]     = useState('')
  const [p2dt, setP2dt]   = useState('')
  const [p2lk, setP2lk]   = useState('')
  const [copied, setCopied] = useState('')
  const [showP2, setShowP2] = useState(false)

  const L  = lead || '[Lead Name]'
  const Y  = you  || '[Your Name]'
  const SP = sp   || '[SP Company Name]'
  const D  = date || '[Date]'
  const T  = time || '[Time]'
  const TZ = tz   || "[Lead's Timezone]"
  const LK = link || '[Meeting Link]'

  const partnerBlock = () => {
    let out = `${SP} - ${T} on ${D}: ${LK}`
    if (p2n) out += `\n${p2n} - ${p2dt || '[Time and Date]'}: ${p2lk || '[Link]'}`
    return out
  }

  const flash = (key: string) => {
    setCopied(key)
    setTimeout(() => setCopied(''), 1800)
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    })
    flash(key)
  }

  const steps = [
    {
      id: 's1',
      title: 'Step 1 — Immediately After Booking',
      timing: 'Right after successfully booking the lead',
      channels: ['TEXT'],
      text: `Hi ${L}, this is ${Y} again from Outsource Accelerator. Thank you so much for your time earlier.\n\nI've successfully sent the calendar invites and would appreciate it if you'll accept them by clicking "yes" to confirm your attendance.\n\nPlease refer to your meeting details below:\n${SP}\n${D} at ${T} ${TZ}\n${LK}\n\nLooking forward to our meeting on ${D}!`,
    },
    {
      id: 's2',
      title: 'Step 2 — 3 Days Before Meeting',
      timing: '72 hours prior',
      channels: ['EMAIL'],
      text: `Hi ${L},\n\nJust sending a friendly reminder about our upcoming business meeting with ${SP} scheduled at ${T} on ${D}.\n\nFor easy access, you can use this link to join: ${LK}\n\nLooking forward to our quick chat on ${D}.`,
    },
    {
      id: 's3',
      title: 'Step 3 — 1 Day Before Meeting',
      timing: '24 hours prior',
      channels: ['TEXT', 'EMAIL', 'LinkedIn'],
      text: `Hi ${L},\n\nI hope you've been well. This is just a gentle reminder for your upcoming meeting/s tomorrow, ${D}.\n\n${partnerBlock()}\n\nWe're looking forward to speaking with you!`,
    },
    {
      id: 's4',
      title: 'Step 4 — 1 Hour Before Meeting',
      timing: '60 minutes prior',
      channels: ['TEXT', 'EMAIL'],
      text: `Hi ${L},\n\nWe're thrilled about your upcoming meetings with our top outsourcing partners today! This is an incredible opportunity for you to explore tailored outsourcing solutions for your business.\n\nHere's the schedule:\n${partnerBlock()}\n\nWe're confident you'll find these discovery calls insightful and valuable.\n\nSee you later!`,
    },
    {
      id: 's5',
      title: 'Step 5 — 3 Minutes Before Meeting',
      timing: '3 minutes prior — you MUST be in the virtual meeting room',
      channels: ['TEXT', 'EMAIL'],
      text: `Hi ${L},\n\nJust wanted to let you know that I'm in the meeting room now.\n\nFeel free to join the meeting using this link: ${LK}\n\nLooking forward to speaking with you soon!`,
    },
  ]

  const noShow = [
    {
      id: 'ns1',
      label: 'Action 1 — Minute 0',
      channels: ['CALL'],
      text: `Hi ${L}, this is ${Y} from Outsource Accelerator. Just giving you a quick call — our meeting was scheduled for right now, and I'm in the meeting room waiting for you. The link is in your email, or I can text it to you again. Hope to see you in there!`,
    },
    {
      id: 'ns2',
      label: 'Action 2 — Minute 1',
      channels: ['TEXT', 'EMAIL'],
      text: `Hi ${L}, I'm in the meeting room for our scheduled call. Just checking to see if you're still able to join?`,
    },
    {
      id: 'ns3',
      label: 'Action 3 — Minute 5',
      channels: ['TEXT', 'EMAIL'],
      text: `Hi ${L}, just following up. Our meeting was scheduled for 5 minutes ago. Are you having any trouble with the link? ${LK}`,
    },
    {
      id: 'ns4',
      label: 'Action 4 — Minute 10',
      channels: ['CALL', 'EMAIL'],
      text: `Hi ${L}, it looks like we missed each other. I'll wait in the room for another 5 minutes, but if you're unable to make it, please let me know when would be a good time to reschedule.`,
    },
  ]

  return (
    <div className="cad-wrap">

      {/* ── Fields ── */}
      <div className="cad-fields">
        <div className="cad-fg">
          <label className="cad-lbl">Lead Name</label>
          <input className="cad-input" value={lead} onChange={e => setLead(e.target.value)} placeholder="e.g. John" />
        </div>
        <div className="cad-fg">
          <label className="cad-lbl">Your Name</label>
          <input className="cad-input" value={you} onChange={e => setYou(e.target.value)} placeholder="e.g. Maria" />
        </div>
        <div className="cad-fg">
          <label className="cad-lbl">SP / Partner Name</label>
          <input className="cad-input" value={sp} onChange={e => setSp(e.target.value)} placeholder="e.g. ConnectOS" />
        </div>
        <div className="cad-fg">
          <label className="cad-lbl">Date</label>
          <input className="cad-input" value={date} onChange={e => setDate(e.target.value)} placeholder="e.g. June 14, 2026" />
        </div>
        <div className="cad-fg">
          <label className="cad-lbl">Time</label>
          <input className="cad-input" value={time} onChange={e => setTime(e.target.value)} placeholder="e.g. 10:00 AM" />
        </div>
        <div className="cad-fg">
          <label className="cad-lbl">Lead's Timezone</label>
          <input className="cad-input" value={tz} onChange={e => setTz(e.target.value)} placeholder="e.g. EST" />
        </div>
        <div className="cad-fg cad-fg--wide">
          <label className="cad-lbl">Meeting Link</label>
          <input className="cad-input" value={link} onChange={e => setLink(e.target.value)} placeholder="https://meet.google.com/..." />
        </div>
      </div>

      {/* ── 2nd partner (optional) ── */}
      <button className="cad-p2-toggle" onClick={() => setShowP2(v => !v)}>
        {showP2 ? '− Hide' : '+ Add'} 2nd Partner <span className="cad-p2-hint">(for Steps 3 & 4)</span>
      </button>
      {showP2 && (
        <div className="cad-fields cad-fields--p2">
          <div className="cad-fg">
            <label className="cad-lbl">Partner 2 Name</label>
            <input className="cad-input" value={p2n} onChange={e => setP2n(e.target.value)} placeholder="e.g. Sourcefit" />
          </div>
          <div className="cad-fg">
            <label className="cad-lbl">P2 Time & Date</label>
            <input className="cad-input" value={p2dt} onChange={e => setP2dt(e.target.value)} placeholder="e.g. 11:00 AM, June 14" />
          </div>
          <div className="cad-fg cad-fg--wide">
            <label className="cad-lbl">P2 Meeting Link</label>
            <input className="cad-input" value={p2lk} onChange={e => setP2lk(e.target.value)} placeholder="https://..." />
          </div>
        </div>
      )}

      {/* ── Steps 1–5 ── */}
      <div className="cad-steps">
        {steps.map(step => (
          <div key={step.id} className="cad-step">
            <div className="cad-step-hd">
              <div className="cad-step-meta">
                <span className="cad-step-title">{step.title}</span>
                <span className="cad-step-timing">{step.timing}</span>
              </div>
              <div className="cad-step-actions">
                <div className="cad-badges">
                  {step.channels.map(c => <Badge key={c} ch={c} />)}
                </div>
                <button className="cad-copy" onClick={() => copy(step.text, step.id)}>
                  {copied === step.id ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <pre className="cad-tpl">{step.text}</pre>
          </div>
        ))}

        {/* ── Step 6 — No-Show Protocol ── */}
        <div className="cad-step cad-step--noshow">
          <div className="cad-step-hd">
            <div className="cad-step-meta">
              <span className="cad-step-title">Step 6 — No-Show Protocol</span>
              <span className="cad-step-timing cad-step-timing--warn">
                If lead is not in the meeting at the scheduled start time
              </span>
            </div>
          </div>
          <div className="cad-noshow-list">
            {noShow.map(a => (
              <div key={a.id} className="cad-noshow-action">
                <div className="cad-noshow-hd">
                  <span className="cad-noshow-label">{a.label}</span>
                  <div className="cad-step-actions">
                    <div className="cad-badges">
                      {a.channels.map(c => <Badge key={c} ch={c} />)}
                    </div>
                    <button className="cad-copy cad-copy--sm" onClick={() => copy(a.text, a.id)}>
                      {copied === a.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <pre className="cad-tpl cad-tpl--sm">{a.text}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
