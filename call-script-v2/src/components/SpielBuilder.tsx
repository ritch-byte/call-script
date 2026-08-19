import { useState, useMemo, useRef, useEffect } from 'react'
import { callAIRaw, textFrom, stripEmDash } from '../lib/ai'
import {
  BEATS, GENERATED_BEATS, DEFAULT_OA, TONES, WINDOW,
  buildLeanSpielPrompt, parseLeanSpiel,
  wordCount, speakSeconds, fmtTime,
  oneParagraph, joinBeats, remapParagraphs, migrateProfile, normalizeLead,
  keepsIdentityClause, buildIntroRepairPrompt, readsAccusatory, buildReframePrompt,
  presumesOffshore, buildDeoffshorePrompt, describesHiring, buildRefocusPrompt, tailPitchesAtThem,
  openingBeats, fillLeadName,
} from '../lib/spiel'
import type { Beat, OAProfile, Tone } from '../lib/spiel'
import { GATE_COPY, CORE_ORDER, gateAsk, gateRecovery, closingLines, qualificationBanks } from '../data/gates'
import type { GateAnswer } from '../data/gates'
import { flow } from '../data/flow'
import { BUILD_COST_CENTS, dailyCost, money } from '../data/costs'

const OA_STORE = 'oa-spiel-profile'

// One model, one path. Every press of Build spiel is a single call on the fast model,
// so the cost per build is fixed and a rep cannot land on an expensive setting.
const MODEL = 'claude-haiku-4-5-20251001'

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
  const [pacing, setPacing] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  // The opening is fixed wording that needs no model call, so it is on the prompter
  // from the moment the page opens. The rep can start reading it while the spiel builds.
  const [beats, setBeats] = useState<Beat[] | null>(() => openingBeats(leadName, yourName))
  /**
   * The spiel shows as one editable block. Beats stay the source of truth so
   * editing round-trips; freeText only takes over when a hand edit changes the
   * paragraph count and we can no longer map text back onto beats.
   */
  const [freeText, setFreeText] = useState<string | null>(null)

  // ── Post-booking qualification ──
  const [qualOpen, setQualOpen] = useState(false)
  /** Which way the closing question went: '' until the rep says. */
  const [rolePath, setRolePath] = useState<'' | 'named' | 'none'>('')
  const [bookedWhen, setBookedWhen] = useState('')
  const [roleWanted, setRoleWanted] = useState('')
  const [gates, setGates] = useState<Record<string, GateAnswer>>({})
  /** 0 = capture what just happened, 1..4 = one gate each, 5 = recap and close. */
  const [qualStep, setQualStep] = useState(0)
  /** The gate the buyer just ruled out, so its recovery line stays on screen. */
  const [showRecovery, setShowRecovery] = useState('')

  const [stage, setStage] = useState('')
  const [busy, setBusy] = useState('')
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

  // The aside is generated with the spiel but is a branch, not part of it, so it stays
  // out of the prompter, the copy and the word count.
  const activeBeats = useMemo(
    () => (beats ? beats.filter(b => b.text.trim() && !b.aside) : []),
    [beats],
  )
  const noRoleAside = useMemo(
    () => (beats || []).find(b => b.aside && b.text.trim())?.text ?? '',
    [beats],
  )
  const inSync = freeText === null
  const fullScript = inSync ? joinBeats(activeBeats) : (freeText as string)
  const totalSeconds = speakSeconds(fullScript)
  // Exclude the OPENING only, not everything fixed. The opening is a back-and-forth
  // before the pitch and the rep cannot shorten it, so counting it would leave the
  // warning permanently lit. The close is different: it is spoken in the same breath as
  // the spiel and it is 30 seconds long. Filtering on `fixed` dropped it from the meter
  // the moment the close stopped being generated, so the app reported 77s for a script
  // that took 107s to say, and a rep on the floor noticed before this number did.
  const writtenSeconds = speakSeconds(
    activeBeats.filter(b => !b.id.startsWith('opening_')).map(b => b.text).join(' '),
  )
  /** False while the box holds only the fixed opening and nothing has been generated. */
  const hasSpiel = activeBeats.some(b => !b.fixed)
  /** Is there anything from this lead worth clearing? Hides Reset on a fresh page. */
  const dirty = !!(raw.trim() || source.trim() || hasSpiel || qualOpen)

  // Same rule as readyToBook() in lib/score.ts: all four core gates confirmed, none refused.
  const missingGates = CORE_ORDER.filter(id => gates[id] !== 'yes')
  const refusedGates = CORE_ORDER.filter(id => gates[id] === 'no')
  const qcMet = missingGates.length === 0

  /**
   * Clear the call and start on the next lead.
   *
   * Everything about THIS lead goes: the paste, the source text, the brief, the spiel,
   * and the whole qualifier. What survives is configuration rather than
   * call data: the OA positioning, the voice, the pacing and the calendar options, since
   * a rep sets those once for the floor and would not want them wiped between dials.
   * The opening comes back fresh from the call script because the next lead has a
   * different name in it.
   */
  function resetForNewLead() {
    setRaw('')
    setSource('')
    setShowSource(false)
    setFreeText(null)
    setBeats(openingBeats(leadName, yourName))
    setQualOpen(false)
    setRolePath('')
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
   * matches the beats we map each paragraph back onto its beat, so editing and
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
    setErr(''); setWarn('')
    // Drop back to the opening rather than an empty box: the rep keeps something to
    // read while the two calls run, and a failed build still leaves them the opener.
    // Keep their edits to it, a rebuild should not undo a hand-tweaked opener.
    setBeats(prev => {
      const kept = (prev || []).filter(b => b.fixed)
      return kept.length ? kept : openingBeats(leadName, yourName)
    })
    setBusy('run'); setSent(false); setFreeText(null)

    try {
      setStage('Writing the spiel')
      const res = await callAIRaw({
        model: MODEL,
        maxTokens: 700,
        messages: [{ role: 'user', content: buildLeanSpielPrompt(raw, source, oa, tone, pacing) }],
      })
      let parsed = parseLeanSpiel(stripEmDash(textFrom(res)))

      // Roughly one build in five comes back with a beat missing, usually because the
      // writer rephrased a frame so the anchors do not all match and the positional
      // fallback shifts. A gap in the script is worse than anything else here: the rep
      // is mid-call reading a hole. One retry costs about 0.25 and fixes it; if it
      // fails twice, say so rather than hand over a broken script.
      const missing = () => GENERATED_BEATS.filter(b => !(parsed.find(x => x.id === b.id)?.text || '').trim())
      if (missing().length) {
        setStage('A beat came back empty, rewriting')
        try {
          const again = await callAIRaw({
            model: MODEL,
            maxTokens: 700,
            messages: [{ role: 'user', content: buildLeanSpielPrompt(raw, source, oa, tone, pacing) }],
          })
          const retry = parseLeanSpiel(stripEmDash(textFrom(again)))
          if (!GENERATED_BEATS.some(b => !(retry.find(x => x.id === b.id)?.text || '').trim())) parsed = retry
        } catch { /* keep what we have and warn below */ }
      }
      const stillMissing = missing()
      if (stillMissing.length) {
        setWarn(`${stillMissing.map(b => b.label).join(' and ')} came back empty. Press Rebuild.`)
      }

      const map = Object.fromEntries(parsed.map(x => [x.id, x.text]))

      // The positioning wording is a deliberate choice, and the fast writer sometimes
      // paraphrases it away. Repair that one line rather than lose it or pay for the
      // slower model on all eight beats.
      // Two ways the thumbnail goes wrong, one repair. Either it paraphrases the
      // approved stem away, or it keeps the stem and then finishes the sentence with our
      // pitch instead of their business ("...for agencies and service firms scaling
      // offshore"). Same rewrite fixes both.
      if (map.thumbnail && (
        !keepsIdentityClause(map.thumbnail, oa.positioning) ||
        tailPitchesAtThem(map.thumbnail, oa.positioning, raw)
      )) {
        setStage('Fixing the intro wording')
        try {
          const fix = await callAIRaw({
            model: MODEL,
            maxTokens: 300,
            messages: [{ role: 'user', content: buildIntroRepairPrompt(map.thumbnail, oa.positioning, tone, pacing) }],
          })
          const repaired = oneParagraph(stripEmDash(textFrom(fix).replace(/^["']|["']$/g, '')))
          if (repaired && keepsIdentityClause(repaired, oa.positioning) && !tailPitchesAtThem(repaired, oa.positioning, raw)) map.thumbnail = repaired
        } catch { /* keep the original line rather than fail the whole build */ }
      }

      // A beat that tells the prospect they are failing gets the rep hung up on. Reframe
      // the offending line structurally rather than shipping a verdict on their numbers.
      // Only the written beats: the house close is fixed and known good, and "repairing"
      // it would rewrite approved wording.
      const accusing = GENERATED_BEATS.filter(x => map[x.id] && readsAccusatory(map[x.id]))
      if (accusing.length) {
        setStage('Reframing the negative line')
        for (const x of accusing) {
          try {
            const fix = await callAIRaw({
              model: MODEL,
              maxTokens: 400,
              messages: [{ role: 'user', content: buildReframePrompt(map[x.id], x.hint, '', tone, pacing) }],
            })
            const reframed = oneParagraph(stripEmDash(textFrom(fix).replace(/^["']|["']$/g, '')))
            if (reframed && !readsAccusatory(reframed)) map[x.id] = reframed
          } catch { /* keep the original rather than fail the whole build */ }
        }
      }

      // The close and the calendar ask are no longer the model's to write: closingBeats()
      // supplies the house wording, so there is nothing to overwrite or police here.

      // The homework beat guesses at their day. If the guess hands them an offshore team,
      // it is wrong about the one thing we are calling about, so rewrite that line.
      if (map.homework && presumesOffshore(map.homework, raw)) {
        setStage('Fixing the homework line')
        try {
          const fix = await callAIRaw({
            model: MODEL,
            maxTokens: 400,
            messages: [{ role: 'user', content: buildDeoffshorePrompt(map.homework, raw, tone, pacing) }],
          })
          const fixed = oneParagraph(stripEmDash(textFrom(fix).replace(/^["']|["']$/g, '')))
          if (fixed && !presumesOffshore(fixed, raw)) map.homework = fixed
        } catch { /* keep the original rather than fail the whole build */ }
      }

      // Same beat, sibling problem: describing the staffing of their job instead of the
      // job. That is beat 3's material, and hearing it here tells them we are selling.
      if (map.homework && describesHiring(map.homework, raw)) {
        setStage('Refocusing the homework line')
        try {
          const fix = await callAIRaw({
            model: MODEL,
            maxTokens: 400,
            messages: [{ role: 'user', content: buildRefocusPrompt(map.homework, raw, tone, pacing) }],
          })
          const fixed = oneParagraph(stripEmDash(textFrom(fix).replace(/^["']|["']$/g, '')))
          if (fixed && !describesHiring(fixed, raw)) map.homework = fixed
        } catch { /* keep the original rather than fail the whole build */ }
      }

      // The opening leads, the generated spiel follows, all in the one box. Reuse the
      // opening already on screen so any edit the rep made to it survives the build.
      //
      // Match the opening on its id, not on `fixed`: the close is fixed too now, and
      // filtering on the flag would carry it up to the top alongside the opening.
      setBeats(prev => {
        const opening = (prev || []).filter(b => b.id.startsWith('opening_'))
        return [
          ...(opening.length ? opening : openingBeats(leadName, yourName)),
          // Keep the parsed beats rather than rebuilding from BEATS, so the close keeps
          // its fixed flag and the house wording stays marked as approved.
          ...parsed.map(x => ({ ...x, text: fillLeadName(map[x.id] || '', leadName) })),
        ]
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setErr(`Could not write the spiel: ${msg}. Press build again.`)
    } finally {
      setBusy(''); setStage('')
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
          onChange={e => setRaw(normalizeLead(e.target.value))}
          onPaste={e => {
            // Three adjacent cells copy as tab-separated text. Normalise on the way in
            // rather than leaving tabs in the string the prompt reads.
            const text = e.clipboardData.getData('text')
            if (!/[\t\r\n]/.test(text)) return
            e.preventDefault()
            setRaw(prev => normalizeLead(prev ? `${prev}, ${text}` : text))
          }}
          onKeyDown={e => { if (e.key === 'Enter' && raw.trim() && !busy) run() }}
          placeholder="VP of Customer Operations, Northbeam Logistics, logistics"
        />
        <button className="spiel-btn-primary" onClick={run} disabled={!raw.trim() || !!busy}>
          {busy === 'run' ? 'Working...' : 'Build spiel'}
        </button>
      </div>
      <div className="spiel-hint">Paste job title, company and industry straight from the sheet. Any order, any separator. Enter to build.</div>

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
        {/* The cost rides on the collapsed row too. Hiding it inside the panel meant
            nobody saw which setting they were on until they went looking. */}
        <span className="spiel-cost-chip">
          {BUILD_COST_CENTS}c per build · 500 a day ≈ {money(dailyCost(BUILD_COST_CENTS, 500))}
        </span>
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
              opening. Trim the longest beat by hand before the rep dials.
            </div>
          )}

          {/* The whole spiel in one editable block, read top to bottom on the call. */}
          <textarea
            className="spiel-script"
            value={fullScript}
            onChange={e => editScript(e.target.value)}
            // Count the lines the box will actually render: each paragraph wraps to at
            // least one row, blank lines are one row. The old formula added the newline
            // count to a whole-string wrap estimate, which counted every paragraph twice
            // and left a screen of dead space under a short spiel.
            rows={Math.max(
              8,
              fullScript.split('\n').reduce((n, line) => n + Math.max(1, Math.ceil(line.length / 74)), 0) + 1,
            )}
            spellCheck={false}
          />

          {!hasSpiel && (
            <div className="spiel-await">
              {busy === 'run'
                ? 'Start reading. The rest of the spiel drops in underneath as soon as it is written.'
                : 'This opening is ready to read now. Paste a lead above and press Build spiel to add the rest.'}
            </div>
          )}

          {/* The spiel ends on "what talent does your team normally prioritize", so the
              next thing on the call is whichever way they answered. Both scripts are
              ready before the rep asks, because the pause while something loads is the
              pause the lead uses to get off the phone. */}
          {hasSpiel && !qualOpen && (
            <div className="spiel-branch">
              <div className="spiel-branch-q">They answered the question. Which way?</div>
              <div className="spiel-branch-buttons">
                <button
                  className={`spiel-branch-btn${rolePath === 'named' ? ' is-on' : ''}`}
                  onClick={() => setRolePath(p => (p === 'named' ? '' : 'named'))}
                >
                  They named a role
                </button>
                <button
                  className={`spiel-branch-btn${rolePath === 'none' ? ' is-on' : ''}`}
                  onClick={() => setRolePath(p => (p === 'none' ? '' : 'none'))}
                >
                  They couldn't name one
                </button>
              </div>

              {rolePath === 'named' && (
                <div className="spiel-branch-script">
                  {/* Read from the call script rather than copied, so the offer the floor
                      reads here and the offer in the live call tool cannot drift apart. */}
                  {(flow.value_offer?.script ?? '').split(/\n{2,}/).map((line, i) => (
                    <p key={i}>{fillLeadName(line, leadName)}</p>
                  ))}
                  <button
                    className="spiel-branch-copy"
                    onClick={() => copy(fillLeadName(flow.value_offer?.script ?? '', leadName), 'offer')}
                  >
                    {copied === 'offer' ? 'Copied' : 'Copy this'}
                  </button>
                </div>
              )}

              {rolePath === 'none' && (
                <div className="spiel-branch-script">
                  {noRoleAside
                    ? <p>{fillLeadName(noRoleAside, leadName)}</p>
                    : <p className="spiel-branch-empty">
                        No suggestion was written for this lead. Press Rebuild, or name two
                        roles their kind of firm hands over first.
                      </p>}
                  {noRoleAside && (
                    <button
                      className="spiel-branch-copy"
                      onClick={() => copy(fillLeadName(noRoleAside, leadName), 'norole')}
                    >
                      {copied === 'norole' ? 'Copied' : 'Copy this'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {hasSpiel && !qualOpen && (
            <button className="spiel-qual-open" onClick={() => setQualOpen(true)}>
              They're interested, or they gave me a date. Qualify now
              <span>Get the role, step the four criteria, then close</span>
            </button>
          )}

          {!inSync && hasSpiel && (
            <div className="spiel-reroll-off">
              Your edits changed the paragraph count, so the beats no longer map onto the
              text. That only matters if you Rebuild, which starts fresh anyway.
            </div>
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

        </div>
      )}

    </div>
  )
}
