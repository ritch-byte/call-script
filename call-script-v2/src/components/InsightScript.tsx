/*
 * Insight Script. Same paste as the Personalised Script, a different call.
 *
 * V1 ONLY. The button is rendered in CallScreen behind a check on the build's base URL, so the
 * code ships in both bundles and only v1 shows it. That is deliberate: gating one button costs
 * nothing, whereas putting CallScreen.tsx on the DIVERGED list would put the busiest file in
 * the app on the list of things that can drift silently between the two versions.
 *
 * WHERE IT COMES FROM. Ten cold-calling books, and the useful part is where they agree rather
 * than where they are clever. Schiffman, Sobczak, Rackham, Keenan, Dixon and Weinberg describe
 * the same four moves in different vocabulary:
 *
 *   1. Say who you are and what company, in the first breath. Schiffman's four things are get
 *      attention, identify yourself AND your company, give the reason, ask for the meeting. His
 *      complaint is that reps fail at the third by pitching a product instead of giving a
 *      business reason.
 *   2. Tell them something they do not already believe. Dixon's Challenger reframe: start from
 *      what they assume, introduce the angle they have not considered. Keenan's Hypothesis of
 *      Need is the same move written as a sentence you prepare before dialling.
 *   3. Ask ONE problem question and stop talking. Rackham is explicit that a cold call has no
 *      room for a full SPIN sequence and that the adaptation is a single sharp Problem question.
 *      Sobczak's opener ends the same way, on a question that hands the call over.
 *   4. Ask for a SPECIFIC day and time. Schiffman's hardest rule and the one most scripts skip:
 *      never "sometime" or "when convenient". It is the difference between a booked meeting and
 *      a pleasant conversation.
 *
 * HOW IT DIFFERS FROM THE PERSONALISED SCRIPT, which matters because two tools that do the same
 * thing are one tool and a maintenance problem:
 *
 *   That one is a monologue. Four beats of the rep talking, and the lead's first chance to speak
 *   is the question in beat 4. This one hands the call over at beat 3 and the rep stops.
 *   That one observes the lead's industry. This one CONTRADICTS an assumption in it, which is a
 *   different and riskier move that earns attention when it lands.
 *   That one closes on "would you be opposed to carving out 30 minutes... I'm thinking Monday or
 *   Tuesday?". This one names a day and an hour, per Schiffman.
 *   That one is about 270 output tokens on a 2,100-token prompt. This one is roughly a third of
 *   that, which is the "low cost" part of the brief and the reason the prompt is short rather
 *   than the reason it is worse.
 *
 * WHAT IS NOT IN IT, on purpose. No client names: this prompt has no client list and no web
 * access, so any company it named would be invented, and an invented reference is a false claim
 * about a real business said on a recorded call. Same rule as every other generator here.
 */

import { useEffect, useMemo, useState } from 'react'
import { callAI } from '../lib/ai'
import { MEETING_ONE, SAVINGS_CLAIM } from '../data/flow'
import { ScriptLine } from './ScriptLine'
import { offerWindow, parseIndustryLead, pluralTitle, type IndustryLead } from '../lib/leadText'

/** Same model as the other generators. Short prompt, short answer: this is the cheap one. */
const MODEL = 'claude-haiku-4-5-20251001'

const NAVY = '#0f1729'
const MAGENTA = '#d6006e'
const PAPER = '#f7f8fb'
const LINE = '#dfe3ec'
const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
const SANS = '"Helvetica Neue", Helvetica, Arial, system-ui, -apple-system, sans-serif'

/**
 * The greeting is NOT fixed here, unlike the other two. Schiffman's opening statement puts the
 * rep's name and the company in the same breath as the reason for the call, so splitting them
 * would break the one thing the structure is built on. Beat 1 carries all of it.
 */
export function buildInsightPrompt({ title, industry, url }: IndustryLead): string {
  const plural = pluralTitle(title)
  const { offer } = offerWindow()
  const [firstDay, secondDay] = offer.split(' or ')
  return `Write a four-line cold call script for an SDR at Outsource Accelerator, an outsourcing marketplace that matches companies to vetted offshore BPO partners.

  LEAD: ${title}${industry ? `, in ${industry}` : ''}${url ? `, ${url}` : ''}

  NO RESEARCH AND NO WEB ACCESS. Never say their company's name, never invent a fact about them, and never name any other company, client or competitor. Any name you write would be made up, and a made-up reference is a false claim about a real business said on a recorded call.

  Four short paragraphs, one blank line between each. No labels, numbering or preamble. Nothing before beat 1, nothing after beat 4. Keep every phrase marked word for word exactly as written.

  1. WHO YOU ARE AND WHY YOU CALLED. 30 WORDS MAX. Word for word: "Hi [Lead Name], [Your Name] here from Outsource Accelerator, we're an outsourcing marketplace." Then word for word: "the reason I'm calling is" + ONE thing that is true of ${industry || 'their industry'} right now.
  IT IS A BUSINESS REASON, NOT A PRODUCT. What is happening in their market, not what we sell. It needs a noun only ${industry || 'that industry'} would use - the thing the work is made of - so the sentence could not be read to a different sector unchanged.

  2. THE REFRAME. 30 WORDS MAX. Word for word: "most ${plural} I speak to reckon" + the thing they assume the problem is. Then word for word: "what we're actually seeing is" + the angle they have not considered.
  THE SECOND HALF MUST CONTRADICT THE FIRST. If both halves point the same way there is no reframe and the beat is wasted. The assumption is usually that the answer is hiring harder, paying more, or waiting for the market to turn.
  It is a claim about the SECTOR, never about this firm. We have never spoken to them, so anything about their company specifically is invented and they know it.
  BANNED IN BEATS 1 AND 2, because each is true of every industry and therefore says nothing: "rising costs", "doing more with less", "the talent shortage", "a tight labour market", "in today's market", "moves the needle", "in your space", "firms like yours", "scale your team", "free up their bench", "focus on what matters".
  THE FIRST LIVE RUN OF THIS BEAT ENDED "...free up their bench for the strategy that moves the needle", with "moves the needle" already banned lower down this prompt. It is repeated here, next to the beat that writes the words, because a ban at the bottom of a page is a ban that gets read last. If a phrase would fit a law firm and a freight company equally well, it is not the reframe, it is filler.

  3. ONE QUESTION, THEN THE REP STOPS TALKING. 20 WORDS MAX. One question about the work a ${title} actually owns, ending in a question mark, then "[PAUSE]" on its own line. Nothing after it.
  NOT A YES/NO QUESTION. "Is that something you're seeing?" can be answered with one word and ends the call. Ask what they do about something, or where it breaks down, so the answer has to be a sentence.

  4. THE ASK. Word for word, and nothing else in this beat: "worth ${MEETING_ONE} on ${firstDay}, say 2 o'clock your time? or is ${secondDay} easier?"
  A NAMED DAY AND HOUR, never "sometime" or "next week" or "when suits". The whole beat is that sentence.

  VOICE: spoken, short clauses, contractions. No em dashes, no corporate filler, no feature lists. Never mention price, savings, ${SAVINGS_CLAIM}, or specific roles - this call sells the meeting and nothing else.`
}

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

export default function InsightScript() {
  const [leadLine, setLeadLine] = useState('')
  const [script, setScript] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  /* Same second counter as the other generators: a frozen word with no number reads as broken. */
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

  const lead = useMemo(() => parseIndustryLead(leadLine), [leadLine])
  const readBack = [
    lead.title && `calling a ${lead.title}`,
    lead.industry && `in ${lead.industry}`,
    lead.url,
  ].filter(Boolean) as string[]

  /* The industry is required: beat 1's reason and beat 2's reframe are both about the sector. */
  const ready = Boolean(lead.title.trim() && lead.industry.trim())

  async function generate() {
    if (!ready || loading || script.length) return
    setLoading(true)
    setError('')
    try {
      const text = await callAI({
        prompt: buildInsightPrompt(lead),
        model: MODEL,
        maxTokens: 500,
      })
      const parts = text
        .split(/\n\s*\n/)
        .map(p =>
          p
            .replace(/^\s*\d+[.)]\s*/, '')
            .replace(/\s*[—–]\s*/g, ', ')
            .replace(/\s+/g, ' ')
            .trim(),
        )
        .filter(Boolean)
      if (!parts.length) throw new Error('empty')
      setScript(parts)
    } catch (e) {
      /* Show what actually failed. lib/ai.ts throws messages worth reading. */
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
    navigator.clipboard?.writeText(script.join('\n\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div style={{ fontFamily: SANS, color: NAVY, background: PAPER, minHeight: '100%' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '22px 20px 60px' }}>
        <div
          style={{
            background: '#fff',
            border: `1px solid ${LINE}`,
            borderRadius: '4px 4px 0 0',
            padding: '20px 22px',
          }}
        >
          <input
            style={inputStyle}
            value={leadLine}
            onChange={e => setLeadLine(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') generate()
              if (e.key === 'Escape') reset()
            }}
            placeholder="Job title, website, industry"
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
            JOB TITLE &nbsp;·&nbsp; WEBSITE &nbsp;·&nbsp; INDUSTRY &nbsp;&mdash;&nbsp; THE REFRAME
            IS BUILT ON THE INDUSTRY, SO IT IS REQUIRED
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
                : 'Need a job title and an industry. The website is what separates them.'}
            </div>
          )}
          <div
            style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}
          >
            <button
              onClick={script.length ? reset : generate}
              disabled={loading || (!ready && !script.length)}
              style={{
                background: ready || script.length ? MAGENTA : '#c9cfda',
                color: '#fff',
                border: 'none',
                borderRadius: 3,
                padding: '11px 20px',
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: '0.08em',
                cursor: ready || script.length ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? `WRITING ${elapsed}s` : script.length ? 'NEXT LEAD' : 'WRITE THE SCRIPT'}
            </button>
            {script.length > 0 && !loading && (
              <button style={ghostBtn} onClick={copy}>
                {copied ? 'Copied' : 'Copy the script'}
              </button>
            )}
            {leadLine && !script.length && !loading && (
              <button style={ghostBtn} onClick={reset}>
                Clear
              </button>
            )}
          </div>
          {error && (
            <div style={{ marginTop: 10, color: MAGENTA, fontSize: 13, lineHeight: 1.5 }}>
              {error}
            </div>
          )}
        </div>

        <div
          style={{
            background: '#fff',
            border: `1px solid ${LINE}`,
            borderTop: 'none',
            padding: '26px 26px 22px',
          }}
        >
          {script.length === 0 && (
            <p
              style={{
                margin: 0,
                fontFamily: MONO,
                fontSize: 11,
                color: '#b6bdc9',
                letterSpacing: '0.06em',
              }}
            >
              THE SCRIPT LANDS HERE
            </p>
          )}
          {script.map((p, i) => (
            <p
              key={i}
              style={{
                margin: i ? '20px 0 0' : 0,
                fontSize: 18,
                lineHeight: 1.65,
                letterSpacing: '-0.01em',
              }}
            >
              <ScriptLine text={p} size={18} />
            </p>
          ))}
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
              Stop after the question in the third paragraph and let them answer. That pause is
              the whole script &mdash; everything before it exists to earn it. Then ask for the
              day and the hour exactly as written, because "sometime next week" is how a yes
              turns into nothing.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
