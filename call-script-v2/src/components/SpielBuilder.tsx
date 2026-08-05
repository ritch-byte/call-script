import { useState, useMemo, useRef, useEffect } from 'react'
import { callAIRaw, textFrom, usedWebSearch, parseJSON, stripEmDash } from '../lib/ai'
import {
  BEATS, DEFAULT_OA, TONES, WINDOW,
  buildBriefPrompt, buildSpielPrompt, buildRerollPrompt, buildObjectionPrompt,
  verifyReceipts, wordCount, speakSeconds, fmtTime,
  oneParagraph, joinBeats, remapParagraphs,
} from '../lib/spiel'
import type { Beat, Brief, Objection, OAProfile, Tone } from '../lib/spiel'

const OA_STORE = 'oa-spiel-profile'

interface Props {
  /** Push the researched lines into the live call script's {geminiResearch} slot. */
  onUseInCall?: (research: string) => void
}

export default function SpielBuilder({ onUseInCall }: Props) {
  const [raw, setRaw] = useState('')
  const [source, setSource] = useState('')
  const [showSource, setShowSource] = useState(false)
  const [oa, setOa] = useState<OAProfile>(() => {
    try {
      const saved = localStorage.getItem(OA_STORE)
      if (saved) return { ...DEFAULT_OA, ...JSON.parse(saved) }
    } catch { /* ignore unreadable storage */ }
    return DEFAULT_OA
  })
  const [tone, setTone] = useState<Tone>('house')
  const [pacing, setPacing] = useState(true)
  const [days, setDays] = useState('Thursday or Friday afternoon')
  const [showSettings, setShowSettings] = useState(false)

  const [brief, setBrief] = useState<Brief | null>(null)
  const [beats, setBeats] = useState<Beat[] | null>(null)
  const [objections, setObjections] = useState<Objection[] | null>(null)
  /**
   * The spiel shows as one editable block. Beats stay the source of truth so
   * reroll keeps working; freeText only takes over when a hand edit changes the
   * paragraph count and we can no longer map text back onto beats.
   */
  const [freeText, setFreeText] = useState<string | null>(null)

  const [stage, setStage] = useState('')
  const [busy, setBusy] = useState('')
  const [rolling, setRolling] = useState('')
  const [err, setErr] = useState('')
  const [warn, setWarn] = useState('')
  const [copied, setCopied] = useState('')
  const [sent, setSent] = useState(false)
  const hidden = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try { localStorage.setItem(OA_STORE, JSON.stringify(oa)) } catch { /* ignore */ }
  }, [oa])

  const activeBeats = useMemo(() => (beats ? beats.filter(b => b.text.trim()) : []), [beats])
  const inSync = freeText === null
  const fullScript = inSync ? joinBeats(activeBeats) : (freeText as string)
  const totalSeconds = speakSeconds(fullScript)
  const verified = (brief?.receipts || []).filter(r => r.confidence === 'verified')

  /**
   * Rewrite the whole spiel from one textarea. If the paragraph count still
   * matches the beats we map each paragraph back onto its beat, so reroll and
   * the call-script hand-off keep working through ordinary edits.
   */
  function editScript(value: string) {
    const clean = stripEmDash(value)
    const remapped = remapParagraphs(activeBeats, clean)
    if (remapped) {
      const next = new Map(remapped.map(b => [b.id, b.text]))
      setBeats(prev => (prev ? prev.map(b => (next.has(b.id) ? { ...b, text: next.get(b.id) as string } : b)) : prev))
      setFreeText(null)
    } else {
      setFreeText(clean)
    }
  }

  // The research insert the call script expects: proof + the tension it opens up.
  // Once paragraphs no longer line up with beats we can't isolate those lines,
  // so we hand over the whole script rather than silently sending stale text.
  const researchInsert = useMemo(() => {
    if (!inSync) return fullScript
    return activeBeats
      .filter(b => b.id === 'homework' || b.id === 'observation' || b.id === 'question')
      .map(b => b.text)
      .join('\n\n')
  }, [inSync, fullScript, activeBeats])

  async function run() {
    setErr(''); setWarn(''); setObjections(null); setBeats(null); setBrief(null)
    setBusy('run'); setSent(false); setFreeText(null)

    let b: Brief | null = null
    try {
      setStage('Reading the company')
      const res = await callAIRaw({
        model: 'claude-sonnet-4-6',
        maxTokens: 1400,
        messages: [{ role: 'user', content: buildBriefPrompt(raw, source) }],
        // Forwarded only if the relay supports tool passthrough. Harmless if dropped.
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 4 }],
      })
      const parsed = parseJSON<Brief>(textFrom(res))
      parsed.receipts = verifyReceipts(parsed.receipts, source, usedWebSearch(res))
      b = parsed
      setBrief(parsed)

      const v = parsed.receipts.filter(r => r.confidence === 'verified')
      if (v.length === 0) {
        setWarn(
          source.trim()
            ? 'Nothing in the text you pasted could be matched to a hard fact, so every line below is role-level inference. Read it before you dial and cut anything you cannot defend.'
            : 'No source material and no live search, so nothing here is a checked fact about this company. The homework beat is written as hedged, role-level inference on purpose. Paste text from their site or careers page to get something you can actually claim you saw.',
        )
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setErr(`Could not build the brief (${msg}). Writing from the paste alone, so the spiel will contain no company specifics.`)
    }

    try {
      setStage('Writing the spiel')
      const res = await callAIRaw({
        model: 'claude-sonnet-4-6',
        maxTokens: 1400,
        messages: [{ role: 'user', content: buildSpielPrompt(raw, b, oa, tone, pacing, days) }],
      })
      const parsed = parseJSON<{ beats?: Array<{ id: string; text: string }> }>(textFrom(res))
      const map = Object.fromEntries((parsed.beats || []).map(x => [x.id, oneParagraph(stripEmDash(x.text))]))
      setBeats(BEATS.map(x => ({ ...x, text: map[x.id] || '' })))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setErr(`Could not write the spiel: ${msg}. Press build again.`)
    } finally {
      setBusy(''); setStage('')
    }
  }

  async function reroll(id: string) {
    if (!beats) return
    setErr(''); setRolling(id)
    try {
      const beat = beats.find(x => x.id === id)!
      const res = await callAIRaw({
        model: 'claude-sonnet-4-6',
        maxTokens: 500,
        messages: [{ role: 'user', content: buildRerollPrompt(beat, fullScript, brief, raw, oa, tone, pacing) }],
      })
      const next = oneParagraph(stripEmDash(textFrom(res).replace(/^["']|["']$/g, '')))
      setBeats(prev => (prev ? prev.map(x => (x.id === id ? { ...x, text: next } : x)) : prev))
      setFreeText(null)
    } catch (e) {
      setErr(`Reroll failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setRolling('')
    }
  }

  async function prepObjections() {
    setErr(''); setBusy('obj')
    try {
      const res = await callAIRaw({
        model: 'claude-sonnet-4-6',
        maxTokens: 1200,
        messages: [{ role: 'user', content: buildObjectionPrompt(fullScript, brief, raw) }],
      })
      const parsed = parseJSON<{ objections?: Objection[] }>(textFrom(res))
      setObjections(parsed.objections || [])
    } catch (e) {
      setErr(`Objection prep failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setBusy('')
    }
  }

  function copy(text: string, tag: string) {
    const done = () => { setCopied(tag); setTimeout(() => setCopied(''), 1600) }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done))
    } else fallbackCopy(text, done)
  }

  function fallbackCopy(text: string, done: () => void) {
    const el = hidden.current
    if (!el) return
    el.value = text
    el.select()
    try {
      document.execCommand('copy')
      done()
    } catch {
      setErr('Copy blocked by the browser. Select the text manually.')
    }
  }

  return (
    <div className="spiel">
      <textarea ref={hidden} className="spiel-hidden-copy" readOnly />

      {/* ── Lead input ── */}
      <div className="spiel-input-row">
        <input
          className="spiel-lead-input"
          value={raw}
          onChange={e => setRaw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && raw.trim() && !busy) run() }}
          placeholder="Northbeam Logistics, VP of Customer Operations, northbeam.com"
        />
        <button className="spiel-btn-primary" onClick={run} disabled={!raw.trim() || !!busy}>
          {busy === 'run' ? 'Working...' : 'Build spiel'}
        </button>
      </div>
      <div className="spiel-hint">Company, job title, website. Any order, any separator. Enter to build.</div>

      {/* ── Source paste: the only way to get a claimable fact ── */}
      <button className="spiel-disclosure" onClick={() => setShowSource(v => !v)}>
        Paste what you saw {source.trim() ? '· in use' : '· recommended'} {showSource ? '−' : '+'}
      </button>
      {showSource && (
        <div className="spiel-panel">
          <div className="spiel-panel-note">
            There is no live web search on this page, so anything the model "knows" about a company
            is a guess. Paste real text here, their About page, careers page, or LinkedIn blurb, and
            only facts it can quote from your paste get marked as seen.
          </div>
          <textarea
            className="spiel-source"
            rows={6}
            value={source}
            onChange={e => setSource(e.target.value)}
            placeholder="Paste copy from their website, careers page, or profile..."
          />
        </div>
      )}

      {/* ── Settings ── */}
      <button className="spiel-disclosure" onClick={() => setShowSettings(v => !v)}>
        Voice and positioning {showSettings ? '−' : '+'}
      </button>
      {showSettings && (
        <div className="spiel-panel">
          <label className="spiel-label">Voice</label>
          <div className="spiel-tone-row">
            {(Object.keys(TONES) as Tone[]).map(k => (
              <button
                key={k}
                className={`spiel-tone${tone === k ? ' spiel-tone-active' : ''}`}
                onClick={() => setTone(k)}
              >
                {k}
              </button>
            ))}
          </div>

          <label className="spiel-check">
            <input type="checkbox" checked={pacing} onChange={() => setPacing(v => !v)} />
            <span>Ellipsis pacing marks</span>
          </label>

          <label className="spiel-label">Calendar options</label>
          <input className="spiel-field" value={days} onChange={e => setDays(e.target.value)} />

          <div className="spiel-panel-note spiel-panel-note-warn">
            The partner network figure is inconsistent across our assets. Set the correct number here
            before the floor uses this.
          </div>

          {([
            ['Positioning', 'positioning'],
            ['Network size', 'network'],
            ['Cost angle', 'savings'],
            ['Credibility', 'proof'],
            ['How it works', 'mechanic'],
          ] as Array<[string, keyof OAProfile]>).map(([label, key]) => (
            <div key={key}>
              <label className="spiel-label">{label}</label>
              <textarea
                className="spiel-field"
                rows={2}
                value={oa[key]}
                onChange={e => setOa({ ...oa, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
      )}

      {err && <div className="spiel-err">{err}</div>}
      {warn && <div className="spiel-warn">{warn}</div>}
      {busy === 'run' && <div className="spiel-stage">{stage}...</div>}

      {!beats && !busy && (
        <div className="spiel-empty">
          <div className="spiel-empty-title">Nothing on the prompter yet</div>
          <div className="spiel-empty-body">
            Paste a lead above. It works out the company and the role, builds a brief you can defend,
            then writes the cold open around it.
          </div>
        </div>
      )}

      {/* ── The prompter ── */}
      {beats && (
        <div className="spiel-out">
          <div className="spiel-bar">
            <div className="spiel-bar-time">
              <span className={`spiel-clock${totalSeconds > WINDOW ? ' spiel-clock-long' : ''}`}>
                {fmtTime(totalSeconds)}
              </span>
              <span className="spiel-bar-meta">to speak · {wordCount(fullScript)} words</span>
            </div>
            <div className="spiel-bar-actions">
              <button className="spiel-btn-ghost" onClick={() => copy(fullScript, 'all')}>
                {copied === 'all' ? 'Copied' : 'Copy spiel'}
              </button>
              <button className="spiel-btn-ghost" onClick={prepObjections} disabled={!!busy}>
                {busy === 'obj' ? 'Thinking...' : 'Objection prep'}
              </button>
              {onUseInCall && (
                <button
                  className="spiel-btn-ghost"
                  onClick={() => { onUseInCall(researchInsert); setSent(true); setTimeout(() => setSent(false), 2000) }}
                >
                  {sent ? 'Sent to script' : 'Use in call script'}
                </button>
              )}
              <button className="spiel-btn-primary spiel-btn-small" onClick={run} disabled={!!busy}>
                Rebuild
              </button>
            </div>
          </div>

          {totalSeconds > WINDOW && (
            <div className="spiel-warn">
              Running long for a cold open. Reroll the longest beat or trim it by hand before the rep dials.
            </div>
          )}

          {/* The whole spiel in one editable block, read top to bottom on the call. */}
          <textarea
            className="spiel-script"
            value={fullScript}
            onChange={e => editScript(e.target.value)}
            rows={Math.max(14, fullScript.split('\n').length + Math.ceil(fullScript.length / 74))}
            spellCheck={false}
          />

          <div className="spiel-reroll">
            <span className="spiel-reroll-label">Reroll a beat</span>
            {inSync ? (
              <div className="spiel-reroll-row">
                {activeBeats.map(b => (
                  <button
                    key={b.id}
                    className="spiel-btn-ghost spiel-btn-small"
                    onClick={() => reroll(b.id)}
                    disabled={!!rolling || !!busy}
                    title={b.hint}
                  >
                    {rolling === b.id ? '...' : b.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="spiel-reroll-off">
                Your edits changed the paragraph count, so single beats can no longer be
                rerolled. Put it back to {activeBeats.length} paragraphs separated by a blank
                line, or hit Rebuild to start fresh.
              </div>
            )}
          </div>

          {objections && (
            <div className="spiel-obj">
              <div className="spiel-obj-head">Objection prep</div>
              <div className="spiel-hint">Agree, inform, question back. Never argue the objection.</div>
              {objections.map((o, i) => (
                <div key={i} className="spiel-obj-card">
                  <div className="spiel-obj-said">"{o.objection}"</div>
                  {([['Agree', o.agree], ['Inform', o.inform], ['Question back', o.question]] as Array<[string, string]>).map(
                    ([k, v]) => (
                      <div key={k} className="spiel-obj-row">
                        <span className="spiel-obj-key">{k}</span>
                        <span className="spiel-obj-val">{v}</span>
                      </div>
                    ),
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Lead details: what the rep checks before dialling, kept under the spiel ── */}
      {brief && (
        <div className="spiel-brief">
          <div className="spiel-brief-heading">Lead details</div>
          <div className="spiel-brief-head">
            <span className="spiel-brief-company">{brief.company}</span>
            <span className="spiel-brief-title">{brief.title}</span>
          </div>
          {brief.what_they_do && <div className="spiel-brief-what">{brief.what_they_do}</div>}

          {(brief.receipts || []).length > 0 && (
            <div className="spiel-receipts">
              <label className="spiel-label">
                What you can say you saw · {verified.length} of {brief.receipts!.length} checked
              </label>
              {brief.receipts!.map((r, i) => (
                <div key={i} className="spiel-receipt">
                  <span className={`spiel-chip${r.confidence === 'verified' ? ' spiel-chip-ok' : ''}`}>
                    {r.confidence === 'verified' ? 'seen' : 'hedge it'}
                  </span>
                  <div>
                    <div className="spiel-receipt-fact">{r.fact}</div>
                    {r.where && <div className="spiel-receipt-where">{r.where}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="spiel-brief-grid">
            {([
              ['What this role owns', brief.role_scope],
              ['Measured on', (brief.role_kpis || []).join(', ')],
              ['Pain to pull on', brief.role_pain],
              ['Likely offshore roles', (brief.offshore_roles || []).join(', ')],
              ['Size signal', brief.size_signal],
              ['Do not say', brief.avoid],
            ] as Array<[string, string | undefined]>).map(([k, v]) =>
              v && v !== 'not found' ? (
                <div key={k}>
                  <label className="spiel-label">{k}</label>
                  <div className="spiel-brief-val">{v}</div>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  )
}
