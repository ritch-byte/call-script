import { useState, useMemo, useRef, useEffect } from 'react'
import { callAIRaw, textFrom, usedWebSearch, parseJSON, stripEmDash } from '../lib/ai'
import {
  BEATS, DEFAULT_OA, TONES, WINDOW,
  buildBriefPrompt, buildSpielPrompt, buildRerollPrompt, buildObjectionPrompt,
  verifyReceipts, wordCount, speakSeconds, fmtTime,
  oneParagraph, joinBeats, remapParagraphs, migrateProfile,
  keepsIdentityClause, buildIntroRepairPrompt, readsAccusatory, buildReframePrompt,
  openingBeats, fillLeadName, parseObjections,
} from '../lib/spiel'
import type { Beat, Brief, Objection, OAProfile, Tone } from '../lib/spiel'
import { GATE_COPY, CORE_ORDER, gateAsk, gateRecovery, closingLines, qualificationBanks } from '../data/gates'
import type { GateAnswer } from '../data/gates'
import { flow } from '../data/flow'

const OA_STORE = 'oa-spiel-profile'
const FAST_STORE = 'oa-spiel-fast'

const FAST_MODEL = 'claude-haiku-4-5-20251001'
const VOICE_MODEL = 'claude-sonnet-4-6'

export interface QualifyHandoff {
  /** The role the lead said they want to add. */
  role: string
  /** Whatever slot they agreed to, free text as the rep heard it. */
  when: string
  /** Confirmation + BANT ids the buyer confirmed out loud. */
  banks: string[]
  /** Ids the buyer ruled out. */
  refuses: string[]
}

interface Props {
  /** Names from the call header, dropped into the fixed opening. */
  leadName?: string
  yourName?: string
  /** Push the researched lines into the live call script's {geminiResearch} slot. */
  onUseInCall?: (research: string) => void
  /** Carry the booked role, the slot, and the confirmed gates into the call script. */
  onQualify?: (payload: QualifyHandoff) => void
}

export default function SpielBuilder({ leadName = '', yourName = '', onUseInCall, onQualify }: Props) {
  const [raw, setRaw] = useState('')
  const [source, setSource] = useState('')
  const [showSource, setShowSource] = useState(false)
  const [oa, setOa] = useState<OAProfile>(() => {
    try {
      const saved = localStorage.getItem(OA_STORE)
      // migrateProfile moves retired default wording forward but keeps real edits.
      if (saved) return migrateProfile(JSON.parse(saved))
    } catch { /* ignore unreadable storage */ }
    return DEFAULT_OA
  })
  const [tone, setTone] = useState<Tone>('house')
  /** Write the spiel on the fast model. Default on: it is ~8s quicker per build. */
  const [fastSpiel, setFastSpiel] = useState<boolean>(() => {
    try { return localStorage.getItem(FAST_STORE) !== 'off' } catch { return true }
  })
  const [pacing, setPacing] = useState(true)
  const [days, setDays] = useState('Thursday or Friday afternoon')
  const [showSettings, setShowSettings] = useState(false)

  const [brief, setBrief] = useState<Brief | null>(null)
  // The opening is fixed wording that needs no model call, so it is on the prompter
  // from the moment the page opens. The rep can start reading it while the spiel builds.
  const [beats, setBeats] = useState<Beat[] | null>(() => openingBeats(leadName, yourName))
  const [objections, setObjections] = useState<Objection[] | null>(null)
  /**
   * The spiel shows as one editable block. Beats stay the source of truth so
   * reroll keeps working; freeText only takes over when a hand edit changes the
   * paragraph count and we can no longer map text back onto beats.
   */
  const [freeText, setFreeText] = useState<string | null>(null)

  // ── Post-booking qualification ──
  const [qualOpen, setQualOpen] = useState(false)
  const [bookedWhen, setBookedWhen] = useState('')
  const [roleWanted, setRoleWanted] = useState('')
  const [gates, setGates] = useState<Record<string, GateAnswer>>({})
  /** 0 = capture what just happened, 1..4 = one gate each, 5 = recap and close. */
  const [qualStep, setQualStep] = useState(0)
  /** The gate the buyer just ruled out, so its recovery line stays on screen. */
  const [showRecovery, setShowRecovery] = useState('')

  const [stage, setStage] = useState('')
  const [busy, setBusy] = useState('')
  const [rolling, setRolling] = useState('')
  const [err, setErr] = useState('')
  const [warn, setWarn] = useState('')
  const [copied, setCopied] = useState('')
  const [sent, setSent] = useState(false)
  /** Reset wipes real work, so it takes two taps rather than one stray click. */
  const [confirmReset, setConfirmReset] = useState(false)
  const hidden = useRef<HTMLTextAreaElement>(null)
  const leadInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try { localStorage.setItem(OA_STORE, JSON.stringify(oa)) } catch { /* ignore */ }
  }, [oa])

  // Never leave Reset sitting armed: a rep who taps it, gets distracted by the call and
  // taps again minutes later should not lose the lead they are working.
  useEffect(() => {
    if (!confirmReset) return
    const t = setTimeout(() => setConfirmReset(false), 4000)
    return () => clearTimeout(t)
  }, [confirmReset])

  // A generate is two model calls and takes roughly 20 seconds. Counting up beats a
  // static "working..." that leaves the rep wondering whether it has hung.
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (busy !== 'run') { setElapsed(0); return }
    const started = Date.now()
    const t = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 500)
    return () => clearInterval(t)
  }, [busy])

  const activeBeats = useMemo(() => (beats ? beats.filter(b => b.text.trim()) : []), [beats])
  const inSync = freeText === null
  const fullScript = inSync ? joinBeats(activeBeats) : (freeText as string)
  const totalSeconds = speakSeconds(fullScript)
  // The window governs the part we can actually shorten. The fixed opening is approved
  // wording, so counting it would leave the warning permanently lit and meaningless.
  const writtenSeconds = speakSeconds(activeBeats.filter(b => !b.fixed).map(b => b.text).join(' '))
  const rerollable = activeBeats.filter(b => !b.fixed)
  /** False while the box holds only the fixed opening and nothing has been generated. */
  const hasSpiel = rerollable.length > 0
  /** Is there anything from this lead worth clearing? Hides Reset on a fresh page. */
  const dirty = !!(raw.trim() || source.trim() || brief || hasSpiel || qualOpen)
  const verified = (brief?.receipts || []).filter(r => r.confidence === 'verified')

  // Same rule as readyToBook() in lib/score.ts: all four core gates confirmed, none refused.
  const missingGates = CORE_ORDER.filter(id => gates[id] !== 'yes')
  const refusedGates = CORE_ORDER.filter(id => gates[id] === 'no')
  const qcMet = missingGates.length === 0

  /**
   * Clear the call and start on the next lead.
   *
   * Everything about THIS lead goes: the paste, the source text, the brief, the spiel,
   * the objections and the whole qualifier. What survives is configuration rather than
   * call data: the OA positioning, the voice, the pacing and the calendar options, since
   * a rep sets those once for the floor and would not want them wiped between dials.
   * The opening comes back fresh from the call script because the next lead has a
   * different name in it.
   */
  function resetForNewLead() {
    setRaw('')
    setSource('')
    setShowSource(false)
    setBrief(null)
    setObjections(null)
    setFreeText(null)
    setBeats(openingBeats(leadName, yourName))
    setQualOpen(false)
    setQualStep(0)
    setGates({})
    setRoleWanted('')
    setBookedWhen('')
    setShowRecovery('')
    setErr('')
    setWarn('')
    setStage('')
    setSent(false)
    setCopied('')
    setConfirmReset(false)
    leadInput.current?.focus()
  }

  function handOffQualification() {
    if (!onQualify) return
    const { banks, refuses } = qualificationBanks(gates, roleWanted, bookedWhen)
    onQualify({ role: roleWanted.trim(), when: bookedWhen.trim(), banks, refuses })
  }

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
    setErr(''); setWarn(''); setObjections(null); setBrief(null)
    // Drop back to the opening rather than an empty box: the rep keeps something to
    // read while the two calls run, and a failed build still leaves them the opener.
    // Keep their edits to it, a rebuild should not undo a hand-tweaked opener.
    setBeats(prev => {
      const kept = (prev || []).filter(b => b.fixed)
      return kept.length ? kept : openingBeats(leadName, yourName)
    })
    setBusy('run'); setSent(false); setFreeText(null)

    let b: Brief | null = null
    try {
      setStage('Reading the company')
      const res = await callAIRaw({
        // The brief is structured extraction, not prose, and the receipt check that
        // decides "seen" vs "hedge it" runs here on the client either way. Haiku is
        // ~11s faster than Sonnet on this stage with the same field coverage, so the
        // rep waits about a third less for the same guarantees.
        model: 'claude-haiku-4-5-20251001',
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
      const writer = fastSpiel ? FAST_MODEL : VOICE_MODEL
      const res = await callAIRaw({
        model: writer,
        maxTokens: 1400,
        messages: [{ role: 'user', content: buildSpielPrompt(raw, b, oa, tone, pacing, days) }],
      })
      const parsed = parseJSON<{ beats?: Array<{ id: string; text: string }> }>(textFrom(res))
      const map = Object.fromEntries((parsed.beats || []).map(x => [x.id, oneParagraph(stripEmDash(x.text))]))

      // The positioning wording is a deliberate choice, and the fast writer sometimes
      // paraphrases it away. Repair that one line rather than lose it or pay for the
      // slower model on all eight beats.
      if (map.thumbnail && !keepsIdentityClause(map.thumbnail, oa.positioning)) {
        setStage('Fixing the intro wording')
        try {
          const fix = await callAIRaw({
            model: writer,
            maxTokens: 300,
            messages: [{ role: 'user', content: buildIntroRepairPrompt(map.thumbnail, oa.positioning, tone, pacing) }],
          })
          const repaired = oneParagraph(stripEmDash(textFrom(fix).replace(/^["']|["']$/g, '')))
          if (repaired && keepsIdentityClause(repaired, oa.positioning)) map.thumbnail = repaired
        } catch { /* keep the original line rather than fail the whole build */ }
      }

      // A beat that tells the prospect they are failing gets the rep hung up on. Reframe
      // the offending line structurally rather than shipping a verdict on their numbers.
      const accusing = BEATS.filter(x => map[x.id] && readsAccusatory(map[x.id]))
      if (accusing.length) {
        setStage('Reframing the negative line')
        for (const x of accusing) {
          try {
            const fix = await callAIRaw({
              model: writer,
              maxTokens: 400,
              messages: [{ role: 'user', content: buildReframePrompt(map[x.id], x.hint, b?.title || '', tone, pacing) }],
            })
            const reframed = oneParagraph(stripEmDash(textFrom(fix).replace(/^["']|["']$/g, '')))
            if (reframed && !readsAccusatory(reframed)) map[x.id] = reframed
          } catch { /* keep the original rather than fail the whole build */ }
        }
      }

      // The opening leads, the generated spiel follows, all in the one box. Reuse the
      // opening already on screen so any edit the rep made to it survives the build.
      setBeats(prev => {
        const opening = (prev || []).filter(b => b.fixed)
        return [
          ...(opening.length ? opening : openingBeats(leadName, yourName)),
          ...BEATS.map(x => ({ ...x, text: fillLeadName(map[x.id] || '', leadName) })),
        ]
      })
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
      let next = fillLeadName(oneParagraph(stripEmDash(textFrom(res).replace(/^["']|["']$/g, ''))), leadName)
      // Same guard as on a full build: a reroll must not land a verdict either.
      if (readsAccusatory(next)) {
        try {
          const fix = await callAIRaw({
            model: fastSpiel ? FAST_MODEL : VOICE_MODEL,
            maxTokens: 400,
            messages: [{ role: 'user', content: buildReframePrompt(next, beat.hint, brief?.title || '', tone, pacing) }],
          })
          const reframed = oneParagraph(stripEmDash(textFrom(fix).replace(/^["']|["']$/g, '')))
          if (reframed && !readsAccusatory(reframed)) next = reframed
        } catch { /* keep what we have */ }
      }
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
        // Four objections with four fields each, plus the playbook context. 1200 was
        // tight enough to truncate the JSON mid-value and fail the parse.
        maxTokens: 1800,
        messages: [{ role: 'user', content: buildObjectionPrompt(fullScript, brief, raw) }],
      })
      const found = parseObjections(textFrom(res))
      if (!found.length) throw new Error('the reply came back in a shape we could not read')
      setObjections(found)
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
          ref={leadInput}
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

          <label className="spiel-check">
            <input
              type="checkbox"
              checked={fastSpiel}
              onChange={() => {
                const next = !fastSpiel
                setFastSpiel(next)
                try { localStorage.setItem(FAST_STORE, next ? 'on' : 'off') } catch { /* ignore */ }
              }}
            />
            <span>
              Fast writing
              <span className="spiel-check-note">
                About 8 seconds quicker per build. The house voice is a little plainer,
                fewer pacing marks and less swagger. Turn it off when you want the best
                copy and can wait.
              </span>
            </span>
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
      {busy === 'run' && (
        <div className="spiel-stage">
          {stage}... {elapsed}s
          <span className="spiel-stage-note">usually about 20 seconds for both steps</span>
        </div>
      )}

      {/* ── The prompter ── */}
      {beats && (
        <div className="spiel-out">
          <div className="spiel-bar">
            <div className="spiel-bar-time">
              <span className={`spiel-clock${writtenSeconds > WINDOW ? ' spiel-clock-long' : ''}`}>
                {fmtTime(totalSeconds)}
              </span>
              <span className="spiel-bar-meta">
                to speak · {wordCount(fullScript)} words · {hasSpiel ? 'opening + spiel' : 'opening only'}
              </span>
            </div>
            <div className="spiel-bar-actions">
              <button className="spiel-btn-ghost" onClick={() => copy(fullScript, 'all')}>
                {copied === 'all' ? 'Copied' : hasSpiel ? 'Copy spiel' : 'Copy opening'}
              </button>
              {hasSpiel && (
              <button className="spiel-btn-ghost" onClick={prepObjections} disabled={!!busy}>
                {busy === 'obj' ? 'Thinking...' : 'Objection prep'}
              </button>
              )}
              {hasSpiel && onUseInCall && (
                <button
                  className="spiel-btn-ghost"
                  onClick={() => { onUseInCall(researchInsert); setSent(true); setTimeout(() => setSent(false), 2000) }}
                >
                  {sent ? 'Sent to script' : 'Use in call script'}
                </button>
              )}
              {hasSpiel && (
                <button className="spiel-btn-primary spiel-btn-small" onClick={run} disabled={!!busy}>
                  Rebuild
                </button>
              )}
              {dirty && (
                <button
                  className={`spiel-btn-ghost spiel-btn-small${confirmReset ? ' spiel-btn-no' : ''}`}
                  onClick={() => (confirmReset ? resetForNewLead() : setConfirmReset(true))}
                  disabled={!!busy}
                  title="Clear this lead and start the next call"
                >
                  {confirmReset ? 'Tap again to clear' : 'Reset'}
                </button>
              )}
            </div>
          </div>

          {writtenSeconds > WINDOW && (
            <div className="spiel-warn">
              The written part is running long for a cold open, {fmtTime(writtenSeconds)} after the
              opening. Reroll the longest beat or trim it by hand before the rep dials.
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

          {!hasSpiel && (
            <div className="spiel-await">
              {busy === 'run'
                ? 'Start reading. The rest of the spiel drops in underneath as soon as it is written.'
                : 'This opening is ready to read now. Paste a lead above and press Build spiel to add the rest.'}
            </div>
          )}

          {hasSpiel && (
          <div className="spiel-reroll">
            <span className="spiel-reroll-label">Reroll a beat</span>
            {inSync ? (
              <div className="spiel-reroll-row">
                {rerollable.map(b => (
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
          )}

          {/* ── The qualification hand-off sits under the spiel, where the call is by now ── */}
          {hasSpiel && !qualOpen && (
            <button className="spiel-qual-open" onClick={() => setQualOpen(true)}>
              They gave me a date, or they're interested
              <span>Step through the four criteria, then close</span>
            </button>
          )}

          {qualOpen && (
            <div className="spiel-qual">
              <div className="spiel-qual-top">
                <div className="spiel-qual-head">Qualify the booking</div>
                <span className="spiel-qual-step">
                  {qualStep === 0 ? 'What just happened' : qualStep <= CORE_ORDER.length ? `Criterion ${qualStep} of ${CORE_ORDER.length}` : 'Recap and close'}
                </span>
              </div>

              {/* Step 0: the slot and the role, in their words. */}
              {qualStep === 0 && (
                <>
                  <div className="spiel-hint">
                    A slot on its own is not a qualified call. Get the role in their words first, it
                    drives every question after this.
                  </div>
                  <div className="spiel-qual-fields">
                    <div>
                      <label className="spiel-label">Slot they agreed to</label>
                      <input
                        className="spiel-field"
                        value={bookedWhen}
                        onChange={e => setBookedWhen(e.target.value)}
                        placeholder="Thursday 2pm their time"
                      />
                    </div>
                    <div>
                      <label className="spiel-label">Role they want to add</label>
                      <input
                        className="spiel-field"
                        value={roleWanted}
                        onChange={e => setRoleWanted(e.target.value)}
                        placeholder="Type what they actually said..."
                      />
                    </div>
                  </div>
                  <div className="spiel-gate-ask">“{flow.qualify_role?.script}”</div>
                  {(brief?.offshore_roles || []).length > 0 && (
                    <div className="spiel-qual-suggest">
                      <span className="spiel-qual-suggest-label">Likely, tap to fill</span>
                      {brief!.offshore_roles!.map(r => (
                        <button key={r} className="spiel-chip-btn" onClick={() => setRoleWanted(r)}>
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    className="spiel-btn-primary"
                    onClick={() => setQualStep(1)}
                    disabled={!roleWanted.trim()}
                  >
                    Start qualifying
                  </button>
                  {!roleWanted.trim() && (
                    <div className="spiel-hint">Name the role first, it drives the rest of the call.</div>
                  )}
                </>
              )}

              {/* Steps 1..4: one criterion at a time, read it, mark what they said. */}
              {qualStep >= 1 && qualStep <= CORE_ORDER.length && (() => {
                const id = CORE_ORDER[qualStep - 1]
                const g = GATE_COPY[id]
                const state = gates[id] || 'unset'
                const answer = (v: GateAnswer) => {
                  setGates(p => ({ ...p, [id]: v }))
                  setShowRecovery(v === 'no' ? id : '')
                  if (v === 'yes') setQualStep(s => s + 1)
                }
                return (
                  <div className={`spiel-gate spiel-gate-${state}`}>
                    <div className="spiel-gate-top">
                      <span className="spiel-gate-n">{qualStep}</span>
                      <span className="spiel-gate-label">{g.label}</span>
                    </div>
                    <div className="spiel-gate-ask">“{gateAsk(id, roleWanted)}”</div>
                    <div className="spiel-gate-phrases">
                      {g.say.map(s => <span key={s} className="spiel-yes">✓ {s}</span>)}
                      {g.not.map(n => <span key={n} className="spiel-no">✕ {n}</span>)}
                    </div>

                    {showRecovery === id && (
                      <div className="spiel-recover">
                        <span className="spiel-recover-label">They ruled it out, say this</span>
                        <div className="spiel-recover-line">“{gateRecovery(id, roleWanted)}”</div>
                        <div className="spiel-recover-note">
                          If they come round, mark it yes. If not, it stays unmet and the booking
                          gets flagged on review.
                        </div>
                      </div>
                    )}

                    <div className="spiel-gate-btns">
                      <button className="spiel-btn-ghost spiel-btn-yes" onClick={() => answer('yes')}>
                        They said yes
                      </button>
                      <button className="spiel-btn-ghost spiel-btn-no" onClick={() => answer('no')}>
                        They ruled it out
                      </button>
                      {state === 'no' && (
                        <button className="spiel-btn-ghost spiel-btn-small" onClick={() => { setShowRecovery(''); setQualStep(s => s + 1) }}>
                          Move on
                        </button>
                      )}
                      <button
                        className="spiel-btn-ghost spiel-btn-small"
                        onClick={() => { setShowRecovery(''); setQualStep(s => Math.max(0, s - 1)) }}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )
              })()}

              {/* Step 5: recap, commitment, invite, voucher. */}
              {qualStep > CORE_ORDER.length && (
                <>
                  <div className={`spiel-qual-status${qcMet ? ' spiel-qual-met' : ''}`}>
                    {qcMet
                      ? 'All four criteria confirmed. This one is bookable.'
                      : refusedGates.length > 0
                        ? `Ruled out: ${refusedGates.map(id => GATE_COPY[id].label).join(', ')}. A booking that fails these gets flagged on review.`
                        : `Still no spoken yes on: ${missingGates.map(id => GATE_COPY[id].label).join(', ')}.`}
                  </div>

                  <label className="spiel-label">Read this to close</label>
                  {closingLines(roleWanted, bookedWhen, leadName).map((line, i) => (
                    <div key={i} className="spiel-close-line">{line}</div>
                  ))}

                  <div className="spiel-qual-actions">
                    {onQualify && (
                      <button className="spiel-btn-primary" onClick={handOffQualification}>
                        Continue in call script
                      </button>
                    )}
                    <button
                      className="spiel-btn-ghost"
                      onClick={() => copy(closingLines(roleWanted, bookedWhen, leadName).join('\n\n'), 'close')}
                    >
                      {copied === 'close' ? 'Copied' : 'Copy close'}
                    </button>
                    <button className="spiel-btn-ghost spiel-btn-small" onClick={() => setQualStep(CORE_ORDER.length)}>
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {objections && (
            <div className="spiel-obj">
              <div className="spiel-obj-head">Objection prep</div>
              <div className="spiel-hint">Agree, inform, question back. Never argue the objection.</div>
              {objections.map((o, i) => (
                <div key={i} className="spiel-obj-card">
                  <div className="spiel-obj-said">
                    "{o.objection}"
                    {o.playbook && o.playbook.toLowerCase() !== 'custom' && (
                      <span className="spiel-obj-tag">comes up on most calls</span>
                    )}
                  </div>
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
