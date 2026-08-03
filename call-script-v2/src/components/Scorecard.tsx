import type { CSSProperties } from 'react'
import {
  CONFIRMATIONS, BANT, band, projectedC2, estimatedC3, projectedOverall,
  nextBestAction, readyToBook, c3DriversHit,
} from '../lib/score'
import type { ScoreState } from '../lib/score'

const NAVY = '#15213f'
const LINE = '#e5e8f1'
const MUTED = '#6b7385'
const GREEN = '#0f9e78'
const GREEN_BG = '#e3f6ef'
const AMBER = '#c9820a'
const AMBER_BG = '#fdf3e3'
const RED = '#c0364a'
const RED_BG = '#fbe9ec'

const bandColor = (b: string) => (b === 'good' ? GREEN : b === 'watch' ? AMBER : RED)
const bandBg = (b: string) => (b === 'good' ? GREEN_BG : b === 'watch' ? AMBER_BG : RED_BG)

const CONFIRM_ORDER = ['company', 'dc_agreed', 'hiring', 'offshorable', 'offshore', 'decision_maker', 'full_time']
const BANT_ORDER = ['authority', 'timeline', 'budget', 'need']
const TOTAL_TOPICS = 7

export default function Scorecard({ state, onClose }: { state: ScoreState; onClose: () => void }) {
  const c2 = projectedC2(state)
  const c3 = estimatedC3(state)
  const overall = projectedOverall(state)
  const ob = band(overall)
  const ready = readyToBook(state)
  const gap = nextBestAction(state)
  const drivers = c3DriversHit(state)

  const wrap: CSSProperties = {
    position: 'fixed',
    top: 72,
    right: 14,
    width: 306,
    maxHeight: 'calc(100vh - 90px)',
    overflowY: 'auto',
    background: '#fff',
    border: `1px solid ${LINE}`,
    borderRadius: 14,
    boxShadow: '0 12px 40px rgba(21,33,63,0.16)',
    zIndex: 40,
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  }
  const mono: CSSProperties = { fontFamily: '"SFMono-Regular","SF Mono",ui-monospace,Menlo,Consolas,monospace' }
  const secLabel: CSSProperties = { ...mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: MUTED, margin: '0 0 8px' }

  const statusColor = ready ? GREEN : bandColor(ob)
  const statusBg = ready ? GREEN_BG : bandBg(ob)
  const statusText = ready ? 'QC MET · READY TO BOOK' : ob === 'good' ? 'ON TRACK' : ob === 'watch' ? 'WATCH' : 'AT RISK'

  const Tile = ({ label, value, tilde }: { label: string; value: number; tilde?: boolean }) => {
    const b = band(value)
    return (
      <div style={{ flex: 1, textAlign: 'center', padding: '4px 2px' }}>
        <div style={{ ...mono, fontSize: 9.5, letterSpacing: '.06em', color: MUTED, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: bandColor(b), lineHeight: 1 }}>
          {tilde ? '~' : ''}{value.toFixed(2)}
        </div>
      </div>
    )
  }

  return (
    <div style={wrap}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 8px' }}>
        <span style={{ ...mono, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: NAVY }}>LIVE SCORECARD</span>
        <button
          onClick={onClose}
          style={{ ...mono, fontSize: 11, color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          hide
        </button>
      </div>

      {/* Status banner */}
      <div style={{ margin: '0 14px 12px', background: statusBg, borderRadius: 9, padding: '8px 12px', textAlign: 'center' }}>
        <span style={{ ...mono, fontSize: 12, fontWeight: 800, letterSpacing: '.04em', color: statusColor }}>{statusText}</span>
      </div>

      {/* Three scores */}
      <div style={{ display: 'flex', margin: '0 12px', borderTop: `2px solid ${bandColor(ob)}`, borderBottom: `1px solid ${LINE}`, paddingTop: 8, paddingBottom: 8 }}>
        <Tile label="C2 · 45%" value={c2} />
        <div style={{ width: 1, background: LINE }} />
        <Tile label="C3 · 30%" value={c3} tilde />
        <div style={{ width: 1, background: LINE }} />
        <Tile label="PROJECTED" value={overall} />
      </div>

      {/* Seven confirmations */}
      <div style={{ padding: '12px 14px 4px' }}>
        <div style={secLabel}>Confirmations</div>
        {CONFIRM_ORDER.map(id => {
          const c = CONFIRMATIONS[id]
          const isBanked = state.banked.has(id)
          const isRefused = state.refused.has(id)
          const dot = isBanked ? GREEN : isRefused ? RED : '#c7ccd8'
          const right = isBanked
            ? { t: 'banked', col: GREEN }
            : isRefused
              ? { t: c.refused.toFixed(2), col: RED }
              : { t: c.unclear.toFixed(2), col: MUTED }
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0', fontSize: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: isBanked ? NAVY : MUTED }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flex: '0 0 auto' }} />
                {c.label}
              </span>
              <span style={{ ...mono, fontSize: 12, fontWeight: 700, color: right.col }}>{right.t}</span>
            </div>
          )
        })}
      </div>

      {/* Four BANT */}
      <div style={{ padding: '10px 14px 4px', borderTop: `1px solid ${LINE}` }}>
        <div style={secLabel}>BANT (scores either way)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 12px' }}>
          {BANT_ORDER.map(id => {
            const b = BANT[id]
            const banked = state.banked.has(id)
            const val = banked ? b.confirmed : b.unclear
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: banked ? NAVY : MUTED }}>
                <span>{b.label}</span>
                <span style={{ ...mono, fontSize: 12, fontWeight: 700, color: banked ? GREEN : MUTED }}>{val.toFixed(1)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Counters */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderTop: `1px solid ${LINE}` }}>
        <div style={{ flex: 1, background: '#f4f6fb', borderRadius: 8, padding: '6px 10px' }}>
          <div style={{ ...mono, fontSize: 9.5, color: MUTED, letterSpacing: '.04em' }}>C3 DRIVERS</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: NAVY }}>{drivers}<span style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}> / 5</span></div>
        </div>
        <div style={{ flex: 1, background: '#f4f6fb', borderRadius: 8, padding: '6px 10px' }}>
          <div style={{ ...mono, fontSize: 9.5, color: MUTED, letterSpacing: '.04em' }}>TOPICS</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: NAVY }}>{state.topics.size}<span style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}> / {TOTAL_TOPICS}</span></div>
        </div>
      </div>

      {/* Biggest gap */}
      <div style={{ margin: '0 14px 14px', background: gap ? '#fff5fa' : GREEN_BG, border: `1px solid ${gap ? '#f4c7dd' : '#bfe8d9'}`, borderRadius: 9, padding: '9px 12px' }}>
        <div style={{ ...mono, fontSize: 9.5, letterSpacing: '.08em', color: MUTED, marginBottom: 3 }}>BIGGEST GAP OPEN</div>
        {gap ? (
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, display: 'flex', justifyContent: 'space-between' }}>
            <span>{gap.label}</span>
            <span style={{ color: '#d6006e' }}>+{gap.gain.toFixed(2)}</span>
          </div>
        ) : (
          <div style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>All gates closed</div>
        )}
      </div>

      <div style={{ padding: '0 14px 12px', fontSize: 10.5, color: MUTED, lineHeight: 1.4 }}>
        C2 is exact. C3 (~) is an estimate of how the lead sounded, not the rubric. This is a coaching prompt, not a reported metric.
      </div>
    </div>
  )
}
