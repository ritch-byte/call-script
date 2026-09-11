/*
 * Personalised script, aligned to the job title and industry of the lead.
 *
 * The third generator, and the one that inverts the order of the call.
 *
 * The Spiel Builder opens on us: "quick thumbnail on us, we're the leading marketplace
 * for..." and only reaches the lead's world in beat 2. That is the shape Weinberg calls the
 * blunt weapon, a company-features monologue, and Stefanie's script review reached the same
 * conclusion from a recording: cold calls die in monologues. Both say the same thing, which
 * is to lead with the customer's problem rather than the product.
 *
 * So beats 2 to 4 are entirely about them, and the greeting still drops the company name: the
 * Spiel Builder's opener said "over at Outsource Accelerator" twice before the pitch started,
 * which gives the whole thing away before there is any reason to care.
 *
 * V2 ONLY, FROM 2026-09-11: WE GO FIRST, IN ONE BREATH. This originally opened on the lead's
 * INDUSTRY and did not name Outsource Accelerator until beat 3, on the reasoning above. It now
 * opens with a short background on us - "quick background on us... we're Outsource Accelerator,
 * the marketplace [industry] firms use..." - and the industry line becomes beat 2.
 *
 * That reverses the founding decision of this generator, so it is worth writing down what
 * protects the original reasoning. The monologue problem was never that we get named early; it
 * was that the caller talks about themselves for several sentences before the lead hears a
 * problem of their own. Beat 1 is capped at 32 words, is a single locked sentence with nothing
 * added, and is the ONLY place we appear - beats 2 and 3 ban us as a subject outright. So the
 * lead knows who is calling in one breath and is back in their own world by the second.
 *
 * The savings figure moved with it, but not to beat 1. It now hangs off the two roles in beat
 * 4 rather than off the company, where it is a fact about their seats rather than about our
 * business.
 *
 * v1 keeps the original shape. components/IndustryScript.tsx is on the DIVERGED list in
 * tools/sync-from-v2.sh, so the two do not sync.
 *
 * WHERE THE HONESTY LINE SITS, and it is the guard that matters most here. Beat 1 is a claim
 * about a SECTOR, never about this firm. "Dental practices are losing reception hours to
 * health-fund claims" is a market observation a rep can defend. "Your clinic is drowning in
 * claims" is invented, and the lead knows it is invented because we have never spoken to
 * them. The prompt draws that line explicitly, because a generator that opens on the lead's
 * problem is under constant pressure to cross it.
 *
 * The rest of the guards are carried over rather than rediscovered. Both suggested roles must
 * pass the laptop test, after two reps caught the Spiel Builder naming seats that cannot be
 * done from another country. Beat 1 and 2 ban us as a subject. The industry-noun requirement
 * and the ban list of true-but-empty phrases come from the same feedback that fixed the
 * Spiel Builder's homework beat.
 *
 * The savings figure and the meeting length are imported from data/flow, so this cannot drift
 * from the call script the way two hardcoded copies of a number always eventually do.
 */

import { useEffect, useMemo, useState } from 'react'
import { callAI } from '../lib/ai'
import { MEETING_ONE, SAVINGS_CLAIM } from '../data/flow'
import { ScriptLine } from './ScriptLine'
import { offerWindow, parseIndustryLead, pluralTitle, type IndustryLead } from '../lib/leadText'
export type { IndustryLead } from '../lib/leadText'
export { parseIndustryLead } from '../lib/leadText'

/** Same model and the same one-call-per-click shape as the other two generators. */
const MODEL = 'claude-haiku-4-5-20251001'

const NAVY = '#0f1729'
const MAGENTA = '#d6006e'
const PAPER = '#f7f8fb'
const LINE = '#dfe3ec'
const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
const SANS = '"Helvetica Neue", Helvetica, Arial, system-ui, -apple-system, sans-serif'

/**
 * The greeting, fixed and local so the model can never reword it. It deliberately does NOT
 * name the company: the whole design is that the lead hears about their own world first.
 */
export function buildIndustryIntro(): string[] {
  return [
    `Hey [Lead Name]? (Pause)`,
    `Oh hey [Lead Name], it's [Your Name] here. I know I've caught you out of the blue, mind if I grab half a minute? Then you can tell me if it's relevant or not (pause)`,
  ]
}

/* ------------------------------- the prompt ------------------------------- */

export function buildIndustryPrompt({ title, industry, url }: IndustryLead): string {
  const plural = pluralTitle(title)
  const { offer, fallback } = offerWindow()
  return `Write a cold call opener for an SDR at Outsource Accelerator, an outsourcing marketplace. The lead has NOT heard of us, so beat 1 says who we are in one breath and every beat after it is about them.

  LEAD: ${title}${industry ? `, in ${industry}` : ''}${url ? `, ${url}` : ''}

  NO RESEARCH AND NO WEB ACCESS. You know nothing checkable about this company. The website address is there for the kind of firm it signals, nothing more. Never say the company's name: the rep says "your company" or nothing at all.

  4 short paragraphs, one blank line between each. No labels, numbering, JSON or preamble. Keep every phrase marked word for word exactly as written. One or two short sentences per beat, never three.

  THE REP HAS SAID ONE LINE ALREADY: they greeted the lead by name, gave their own name, said they had caught them out of the blue and asked for half a minute, and got it. They did NOT say the company name. So do not greet, do not say the rep's own name again, and do not ask for permission or for time. They know a person is calling. What they do not know is who from, and that is exactly what beat 1 answers.

  It is one continuous read until beat 4. Beats 1 to 3 carry no ask and no question at all. Beat 4 carries two questions, in a fixed order: which role could go offshore, then the meeting.

  1. QUICK BACKGROUND ON US, AND IT IS THE ONLY TIME. 32 WORDS MAX. Word for word, nothing added: "so yeah, quick background on us... (deliberate) we're Outsource Accelerator, the marketplace ${industry || 'firms like theirs'} firms use to get this kind of work done offshore, without going near a recruitment agency."
  THAT IS THE WHOLE BEAT. Do not explain the marketplace, do not say what we charge, do not mention roles or savings or hiring, and do not add a sentence of your own. The lead has just been told who is calling; everything after that is about them.
  THE PROOF IS THE CATEGORY, AND THE CATEGORY IS THEIRS. "The marketplace ${industry || 'firms like theirs'} firms use" does a reference's job without being one: it says people in their world already do this, which is what a lead wants to know before agreeing to anything.
  NEVER NAME A COMPANY. Not a client, not a customer, not a competitor, not a well-known firm in their sector, and never "companies like X and Y". This prompt has no client list and no web access, so any name you write is INVENTED - and an invented client is a false claim about a real business, said on a recorded call to someone who can pick up the phone and check it. There is no version of that which is worth a booked meeting. If approved names are ever added, they will appear above under LEAD; until they do, the proof is the category and nothing else.
  "WITHOUT GOING NEAR A RECRUITMENT AGENCY" IS LOAD-BEARING and is not a swipe at anyone. It answers the question a lead asks out loud at exactly this point - Stefanie has a recording of one cutting in mid-sentence to ask whether we are an agency - and answering it before it is asked is cheaper than answering it after.

  2. THE REASON FOR THE CALL, AND IT IS THEIR INDUSTRY. 30 WORDS MAX. Open word for word: "and we're just reaching out because what we're seeing across ${industry || 'firms like yours'} at the moment..." then ONE thing that is true of that sector right now and that a person inside it would recognise.
  IT IS A CLAIM ABOUT THE SECTOR, NEVER ABOUT THIS FIRM. "Dental practices are losing reception hours to health-fund claims" is a market observation and a rep can defend it. "Your clinic is drowning in claims" is invented, and the lead knows it is invented because we have never spoken to them. Say what is true of the industry and let them apply it to themselves.
  IT NEEDS A NOUN ONLY THIS INDUSTRY WOULD USE, the thing the work is actually made of: health-fund claims, shop drawings, carrier contracts, reservation inventory, freight documentation, specimen batches, retainer scopes, variation claims. That noun is what makes the sentence land in one industry and nowhere else.
  BANNED, because every one of them is true of every industry and says nothing: "rising costs", "doing more with less", "the talent shortage", "a tight labour market", "increased competition", "margin pressure", "in today's market", "post-pandemic", "digital transformation", "growing pains", "moves the needle", "doesn't move the needle", "in your space", "firms like yours", "a ton of time getting eaten up", "time gets eaten up".
  BEAT 1 ALREADY SAID WHO WE ARE, so do not say it again. No second description of us, nothing about what we sell, no offshore, nothing about hiring. From here to the end of beat 3 the subject is them.

  3. THEIR DESK. 26 WORDS MAX. Open word for word: "and for ${plural} like you that usually lands on..." then the part of that sector pressure THIS title actually carries.
  Say the title back exactly as given, plural and unchanged. It has to be work that belongs to this exact job, not to the industry in general and not to their boss. If you could swap in a different job title and the sentence still made sense, rewrite it.
  Still nothing about us, and still nothing about offshore. Beats 2 and 3 are theirs.

  4. TWO ROLES, THEN THE ASK. Word for word: "so yeah I think a great starting point is" + an offshore role + "to" + what it takes off the work you named in beat 3, then "or a" + a second role + "to" + what that one takes off them. Then word for word: "and those come in at ${SAVINGS_CLAIM}."
  THE SAVINGS FIGURE SITS HERE, ON THE ROLES, and not on the company. It used to hang off the end of the beat that introduced us, where it was a fact about our business. Attached to the two seats just named it is a fact about theirs, which is the only version of it a lead has a reason to care about. Nothing after it except the question.
  BOTH ROLES MUST BE DOABLE FROM ANOTHER COUNTRY. The test, before you name either: could this person do the whole job on a laptop, with nobody needing them in the building? A warehouse manager, a site foreman, a front office manager, a housekeeping lead, kitchen staff, floor managers all fail it, because the job is where the work is. The back office behind them passes: claims and billing administrators, purchasing and inventory coordinators, order processing, freight and customs documentation, dispatch scheduling, bookkeeping, payroll, customer support. Where the operation is physical, the offshorable seats are the ones behind it and never the ones on it.
  Real job titles a lead would recognise on an org chart. The work each one takes has to be work beat 3 already named, not new work you invented.
  THEN ASK THEM WHICH ROLE, word for word and nothing added to it: "and aside from the roles I mentioned, what type of role do you think would also be suitable for offshore?"
  IT IS A REAL QUESTION AND THE REP STOPS TALKING AFTER IT. Put [PAUSE] on its own line straight after it. That mark is the only one in the script that is not breath: it is the rep waiting for an answer, and the beat is worthless without the wait. Everything up to here has been the rep talking, and this is the one place the lead gets to describe their own world.
  IT COMES BEFORE THE ASK AND NEVER INSTEAD OF IT. Both get said, in this order. The question earns the ask: after it, the meeting is about a role THEY named rather than the two we guessed, and what they say is the most useful thing the call produces even if they never book.
  DO NOT MERGE THE TWO QUESTIONS into one sentence, and do not put the meeting ask before it. Two questions in one breath and the lead answers only the last one.
  Then the ask, word for word, and the only thing you write in it is the hesitation:
  "I know ${plural} like you [HESITATION], but would you be opposed to carving out ${MEETING_ONE} for a coffee break style chat, just to see if this could work or not, I'm thinking ${offer}? If not maybe ${fallback}?"
  The hesitation completes "I know ${plural} like you ___", reads straight on from it, and is 10 WORDS MAX with no full stop inside it. It is the one thing that would make THIS person pause before saying yes, given their seat and their sector. Their words, not ours. Never a generic objection like being busy or not having budget.

  WE ARE NOT IN BEATS 2 AND 3. Beat 1 is our whole allowance and it is spent. The subject from there is them, their sector, or their desk. BANNED outright in beats 2 and 3: "we help", "we work with", "our partners", "our clients", "what we do is", "we provide", and any sentence whose subject is we, our or us.
  THE LOCKED OPENING WORDS OF BEAT 2 ARE THE ONE EXCEPTION, and they are written for you. "and we're just reaching out because" is the rep saying why they picked up the phone, which is not a claim about us and carries nothing to sell. It does not license a second one: every word you write yourself obeys the ban. If a sentence could be moved onto our website unchanged, it belonged in beat 1 and that moment has passed.

  VOICE: spoken, short clauses, contractions, ellipses as pacing marks but at most ONE per beat. No em dashes, no corporate filler, no feature lists, no percentages beyond the one figure above. Curiosity, not authority. Sell the meeting, not the service.

  DELIVERY MARKS. Write it the way a screenplay is written, so the rep can see the pacing.
  Put [PAUSE] on its own after beat 2, and again in beat 4 straight after the question about which role. Two, no more, and the second one is a wait for an answer rather than a breath.
  Put one direction in round brackets before the phrase it governs, one word: (slow), (deliberate), (softer). At most one across the whole script, and never inside beat 4.
  Drop in a spoken filler where a person actually would, like y'know or uh. At most one per beat, and never in beat 4.
  Marks, directions and fillers are breath, not content, and they do NOT count toward the word caps. The one exception is the [PAUSE] after the question in beat 4, which is the rep actually waiting.

  SAY IT ALOUD. A rep reads this at pace on a live call. Short, common, spoken words. Nothing anyone could trip over: not "operationalised", "consolidation", "methodologies", "infrastructure", "bandwidth", "streamline", "leverage".`
}

/* ---------------------- once they agree to the meeting ----------------------
 *
 * FIXED TEXT. The model never sees these and never writes them, which is deliberate: the
 * opener is personalised because a cold lead needs a reason to keep listening, but a lead who
 * has already said yes needs the same five answers every time. Five identical questions on
 * every call is what makes the answers comparable, and what the partner on the other end is
 * relying on. Nothing here is per-lead.
 *
 * The wording is the set that ran on the floor from 9 July to 19 August, restored on request.
 *
 * ONE THING TO KNOW ABOUT NUMBER 4. That timeline question offers two in-window options, and
 * the SP review replaced it on 19 August with an open one - "what sort of timeframe would you
 * be working to?" - on the grounds that a coached answer put soft leads in front of partners.
 * It is here because it was asked for. The note under it says to log the words they actually
 * use, which is what the analyzer credits and is the part that made the open version better.
 */
const QUALIFIERS: Array<{ n: string; label: string; ask: string; note: string }> = [
  {
    n: '1',
    label: 'Role fit',
    ask: 'Got it. So if you did add some support, what role would you want to fill first?',
    note: 'Hypothetical on purpose — "if you did add support" reads as planning rather than pressure. Whatever they name is "that role" for the rest of the call.',
  },
  {
    n: '2',
    label: 'Full-time',
    ask: "Makes sense. And I assume this'd be a full-time position, like thirty to forty hours a week, right?",
    note: 'Assume full-time. Do not plant the part-time idea. If they pull it back to part-time, handle that before moving on.',
  },
  {
    n: '3',
    label: 'Volume',
    ask: 'And how many are we talking, one to start with, or more of a small team?',
    note: 'Sizing, kept light. One is plenty to book on; a team is a bonus. It tells the partners what to prepare.',
  },
  {
    n: '4',
    label: 'Timeline',
    ask: 'And if the right person showed up, would you be looking to bring them on within a few weeks, or more like one to two months?',
    note: 'Write down the timeframe in THEIR words, whatever they answer. An honest "after the new year" with a dated callback is worth more to the partner than a coached "one to two months" that books and does not show up.',
  },
  {
    n: '5',
    label: 'Decision-maker',
    ask: "Perfect. And are you the one who'd sign off on this, or is there someone else involved in that call?",
    note: 'A collaborative answer still qualifies, as long as they are in the room. If it is somebody else entirely, get the name before you hang up.',
  },
]

/* --------------------------------- app --------------------------------- */

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px',
  border: `1px solid ${LINE}`,
  borderRadius: 4,
  fontFamily: SANS,
  fontSize: 15,
  color: NAVY,
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
}

const ghostBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.04em',
  color: '#6b7280',
  cursor: 'pointer',
  textDecoration: 'underline',
  textUnderlineOffset: 3,
}

export default function IndustryScript() {
  const [leadLine, setLeadLine] = useState('')
  const [script, setScript] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  /*
   * A SECOND COUNTER ON THE BUTTON, because "WRITING" alone is unfalsifiable.
   *
   * Measured on the live relay: Apps Script itself serves in about 1.2 seconds, five times out
   * of five, so the endpoint is healthy. The wait is the AI call behind it, and that ran to
   * roughly 20 seconds even for a sixteen-token reply. A real script is longer, and the client
   * retries once, so a normal build can legitimately sit there for most of a minute.
   *
   * None of that is visible to a rep. A frozen-looking word and no number is the difference
   * between waiting and giving up, and giving up mid-generation is how the same lead gets
   * built three times. The count does not make it faster. It makes it honest.
   */
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!loading) {
      setElapsed(0)
      return
    }
    const started = Date.now()
    const id = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 250)
    return () => clearInterval(id)
  }, [loading])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const lead = useMemo(() => parseIndustryLead(leadLine), [leadLine])
  /*
   * The industry is required here, unlike the Spiel Builder where it is optional. Beat 1 IS
   * the industry: without it the model has to guess a sector from a domain name, and a
   * confident sentence about the wrong industry is worse than no script at all.
   */
  const ready = Boolean(lead.title.trim() && lead.industry.trim())
  const intro = useMemo(() => buildIndustryIntro(), [])
  const onScreen = script.length ? [...intro, ...script] : intro

  async function generate() {
    if (!ready || loading || script.length) return
    setLoading(true)
    setError('')
    try {
      const text = await callAI({
        prompt: buildIndustryPrompt(lead),
        model: MODEL,
        maxTokens: 800,
      })
      const parts = text
        .split(/\n\s*\n/)
        .map(p =>
          p
            .replace(/^\s*\d+[.)]\s*/, '')
            .replace(/^\s*[A-E][.)]\s+/, '')
            .replace(/\s*[—–]\s*/g, ', ')
            .replace(/\s+/g, ' ')
            .trim(),
        )
        .filter(Boolean)
      if (!parts.length) throw new Error('empty')
      setScript(parts)
    } catch (e) {
      /*
       * SAY WHAT ACTUALLY WENT WRONG. This used to swallow every error and print "that did
       * not come back clean, run it again" for all of them, which is advice rather than
       * information - and it is wrong advice whenever retrying cannot help.
       *
       * lib/ai.ts already throws messages worth reading: the relay timed out at 45 seconds
       * twice, Google failed to serve the script, the reply was unreadable, or an error came
       * back from the model itself. All of those were being replaced with the same sentence,
       * so a rep retried a dead key forever and a transient blip looked identical to a
       * broken tool. Measured while chasing one of these: the relay answers the real prompt
       * in about 6 seconds, so a failure is a failure and not slowness.
       *
       * The generic line survives for the one case that has no message: the model returned
       * nothing usable, where running it again genuinely is the answer.
       */
      const msg = (e as Error | undefined)?.message || ''
      setError(!msg || msg === 'empty' ? 'That did not come back clean. Run it again.' : msg)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setLeadLine('')
    setScript([])
    setError('')
    setCopied(false)
  }

  function copy() {
    navigator.clipboard?.writeText(onScreen.join('\n\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  const readBack = [
    lead.title && `calling a ${lead.title}`,
    lead.industry && `in ${lead.industry}`,
    lead.url,
  ].filter(Boolean)

  return (
    <div
      style={{
        fontFamily: SANS,
        background: PAPER,
        minHeight: '100%',
        color: NAVY,
        paddingBottom: 48,
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '18px 24px 0' }}>
        <div style={{ background: '#fff', border: `1px solid ${LINE}`, padding: 18 }}>
          <input
            style={inputStyle}
            value={leadLine}
            onChange={e => setLeadLine(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') generate()
              if (e.key === 'Escape') reset()
            }}
            placeholder="Job title, then the website, then the industry"
          />
          <div
            style={{
              marginTop: 7,
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: '0.06em',
              color: '#b6bdc9',
            }}
          >
            JOB TITLE &nbsp;·&nbsp; WEBSITE &nbsp;·&nbsp; INDUSTRY &nbsp; &mdash; &nbsp; THE CALL OPENS ON THE INDUSTRY, SO IT IS REQUIRED
          </div>
          {leadLine.trim() && (
            <div
              style={{
                marginTop: 9,
                fontFamily: MONO,
                fontSize: 11,
                color: ready ? '#8b94a5' : MAGENTA,
                letterSpacing: '0.02em',
                lineHeight: 1.5,
              }}
            >
              {ready
                ? readBack.join('  ·  ')
                : lead.title.trim()
                  ? `Read the title as "${lead.title}" but found no industry. Add it, because the call opens on it.`
                  : 'Could not read a job title. Try commas between the parts.'}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'center',
              flexWrap: 'wrap',
              marginTop: 14,
            }}
          >
            <button
              onClick={script.length ? reset : generate}
              disabled={loading || (!ready && !script.length)}
              style={{
                background: ready || script.length ? MAGENTA : '#c9cfda',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '10px 20px',
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: '0.08em',
                cursor: ready || script.length ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? `WRITING ${elapsed}s` : script.length ? 'NEXT LEAD' : 'WRITE THE SCRIPT'}
            </button>
            {script.length > 0 && !loading && (
              <button onClick={copy} style={ghostBtn}>
                {copied ? 'Copied' : 'Copy the script'}
              </button>
            )}
            {leadLine && !script.length && !loading && (
              <button onClick={reset} style={ghostBtn}>
                Clear
              </button>
            )}
          </div>
          {error && <div style={{ marginTop: 10, fontSize: 12, color: MAGENTA }}>{error}</div>}
        </div>

        <div
          style={{
            background: '#fff',
            border: `1px solid ${LINE}`,
            borderTop: 'none',
            padding: '26px 26px 22px',
          }}
        >
          {onScreen.map((p, i) => (
            <p
              key={i}
              style={{
                margin: i ? '20px 0 0' : 0,
                fontSize: 18,
                lineHeight: 1.65,
                letterSpacing: '-0.01em',
                opacity: i < intro.length && !script.length ? 0.75 : 1,
              }}
            >
              <ScriptLine text={p} size={18} />
            </p>
          ))}

          {!script.length && (
            <p
              style={{
                marginTop: 20,
                fontFamily: MONO,
                fontSize: 11,
                color: '#b6bdc9',
                letterSpacing: '0.06em',
              }}
            >
              THE REST LANDS HERE
            </p>
          )}

          {script.length > 0 && (
            <p
              style={{
                marginTop: 22,
                paddingTop: 12,
                borderTop: `1px solid ${LINE}`,
                fontSize: 12,
                lineHeight: 1.55,
                color: '#8b94a5',
              }}
            >
              Read it before you say it. The first line is a claim about their industry, not
              about their company &mdash; if it says anything about them specifically, do not
              read it, because we have never spoken to them. Check the two roles could actually
              be done from another country, and send anything that slips through to your TL.
            </p>
          )}

          {script.length > 0 && (
            <div style={{ marginTop: 26, paddingTop: 18, borderTop: `1px solid ${LINE}` }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  color: '#6b7280',
                }}
              >
                ONCE THEY AGREE TO THE MEETING &mdash; THE FIVE MUST-KNOWS
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: '0.06em',
                  color: '#b6bdc9',
                }}
              >
                SAME FIVE ON EVERY CALL, WHOEVER THE LEAD IS
              </div>
              {QUALIFIERS.map(q => (
                <div key={q.n} style={{ marginTop: 16 }}>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: '0.08em',
                      color: MAGENTA,
                      marginBottom: 4,
                    }}
                  >
                    {q.n} &nbsp;{q.label.toUpperCase()}
                  </div>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: NAVY }}>{q.ask}</p>
                  <p
                    style={{
                      margin: '5px 0 0',
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: '#8b94a5',
                    }}
                  >
                    {q.note}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
