/*
 * Hiring Script generator.
 *
 * A different call from the one the Spiel Builder writes. There, the rep is cold and has to
 * discover whether a role exists at all. Here the role is already open and advertised, so the
 * rep leads with it and the whole discovery half of the call is already done. That is why this
 * is its own generator rather than a mode on the other one: nearly every beat is different.
 *
 * The rep pastes four things, in this order:
 *   Job Title, Industry, Hiring Position, Website URL
 * Commas optional. Reps paste straight off the job ad, so a bare line reads too: the seat is
 * taken off the back, where a capitalised run ends as soon as lower case begins, and the
 * title off the front. "Executive Chairman civil engineering SENIOR PROJECT MANAGER" splits
 * on exactly that.
 * Job Title is the person being called. Hiring Position is the seat they have advertised. The
 * company name is deliberately not an input, because the script says "your company" and never
 * names it. The URL is only there for the kind of firm it signals and to read the line back.
 *
 * THE NUMBERS ARE NOT WRITTEN HERE. The savings figure and the meeting length are imported
 * from data/flow, the same constants the live call script reads. A second generator quoting
 * its own numbers is exactly how the script ended up saying two different savings figures in
 * the first place, so this one cannot: change SAVINGS_PCT once and this moves with it.
 *
 * THE ONE THING THIS PROMPT GUARDS HARDEST. The rep knows the role is open because it was
 * advertised, and that is the entire extent of what is known. Everything else about that ad
 * is invented if the model writes it: the pay, the seniority, how long it has been open, where
 * it was posted, how many they want, whether they are struggling to fill it. A lead who hears
 * a detail we could not possibly have hangs up, and worse, tells the partner about it later.
 *
 * THE COMPARISON IS ALWAYS THE SAME SEAT. What this role costs here, against what this role
 * costs offshore. That is the whole of beat 3 and there is no second path.
 *
 * There used to be one, and it was my mistake rather than a requirement. The Spiel Builder had
 * a real offshorability problem - two reps ran leads through it and got back a warehouse
 * manager, a hotel's front office lead, kitchen staff - so I carried the same guard over here
 * as a route that sorted the advertised seat and, when it judged the seat physical, swapped in
 * the back office behind it instead. Two things were wrong with that.
 *
 * The guard does not transfer. On the Spiel Builder the model INVENTS the roles, so it needs
 * telling which ones are impossible. Here the rep supplies the seat off a live advertisement.
 * There is nothing to guard against, and a test with nothing to catch catches the wrong
 * things: a Utilities Technical Sales Specialist, which is a desk job, came back routed as on
 * site.
 *
 * And even when it routed correctly it answered a question nobody asked. The lead advertised
 * one seat. Pricing a different one, and explaining that theirs has to stay on site, is a
 * refusal dressed as a pitch. Beat 3 now says do not swap the job, do not offer the admin
 * behind it, and do not raise whether the seat can be done offshore at all.
 *
 * Where the honest limit lives now: the note under the script, addressed to the rep rather
 * than performed at the lead. If the advertised seat genuinely cannot be done from another
 * country, a driver, a nurse, kitchen or floor staff, that is not a lead for this script.
 * That is a decision the rep makes before dialling, not a beat the script argues on the call.
 *
 * FOUR RULES CAME ACROSS FROM THE SPIEL BUILDER after the first live run, a civil engineering
 * firm hiring a site-based project manager. Each had already been learned there, and the
 * output failed all four.
 *
 *   Beat 1 said the seat was "managing schedules, budgets, and site coordination". True of
 *   every project manager anywhere, which is the exact failure reps reported on the Spiel
 *   Builder's homework beat. Beat 1 now carries the same fix: a noun only this industry would
 *   use, the job-ad test and the swap test, and a ban list of the phrases that pass for true
 *   and say nothing.
 *
 *   Beat 3 opened "A Senior Project Manager isn't a seat our partners fill offshore." Two
 *   faults in one line. It opens on a no, to someone who has just told you they are hiring,
 *   and its subject is our partners. The Spiel Builder bans that whole shape with WE ARE NOT
 *   IN THIS BEAT, so that rule is here now, with this sentence quoted as the thing not to do.
 *
 *   Route B was ordered backwards. It said what cannot be done, then what can. Reversed: the
 *   two back office seats come first and "that seat stays on site" is one clause at the end.
 *
 *   The beat had no opener, so the turn read as a correction. It now opens on the Spiel
 *   Builder's fixed line, "And here's where it gets interesting..."
 *
 * Beat 4 also stopped saying "the role". On route B the advertised role is not the one going
 * offshore, so "what the role actually costs offshore" pointed at the wrong seat.
 *
 * BEAT 2 WAS A MONOLOGUE, and two separate sources said so. It read "And the reason that's
 * relevant is we're an outsourcing marketplace, we don't supply the staff ourselves, we match
 * you to the vetted BPO partners that already do this work." Every clause is about us, and
 * the lead has not yet heard a problem of their own. Weinberg's New Sales Simplified calls
 * that the blunt weapon, a company-features monologue, and its rule is to lead with the
 * customer's problem rather than the product. Stefanie's script review reached the same place
 * from a recording: cold calls die in monologues, and her proposed hook was a problem line,
 * "companies come to us when hiring locally is getting too slow, too expensive, or the quality
 * isn't there".
 *
 * So the beat is inverted rather than reworded. One short sentence on what a firm like theirs
 * runs into filling this seat, in their words and from their side, and only then the
 * marketplace line, which is kept word for word because PJ signed that framing off in full and
 * it is what stops a lead asking whether we are a recruitment agency. The opening words are
 * banned from being we, our, us or I, and the test is the same one Weinberg gives: if the
 * first sentence could sit on our website unchanged, it is the monologue.
 *
 * "WE DON'T SUPPLY THE STAFF OURSELVES" WAS TAKEN OUT of the marketplace line here, by
 * request. Worth knowing what it was doing, because it is not decoration. It is the clause
 * that answers "so you're a recruitment agency?" before the lead asks it, and Stefanie has a
 * recording of a lead cutting in mid-sentence to ask exactly that. PJ's change order replaced
 * "global talent network" with the marketplace framing "in full", and this clause was part of
 * that framing. The line now leans on "we match you to" to carry the same distinction in
 * fewer words, which is lighter to say and does less work. It is still intact in the call
 * script's own pitch beat in data/flow, so the two now differ on purpose rather than by drift.
 *
 * BEAT 3 NOW QUOTES TWO SALARY FIGURES, and that is a decision taken with the conflict on the
 * table rather than around it. PJ's change order retired the local-to-offshore conversion by
 * name - "60K locally is typically 12 to 18K offshore" is on the retired list - on the
 * grounds that quoting price does the partner's discovery for them with numbers we cannot
 * stand behind. These figures are the same shape. They will show up in the weekly phrase
 * count, and PJ should hear it from us rather than from the query.
 *
 * Three things make the version here as defensible as it can be:
 *   The offshore figure is not a second guess. It is the local figure less the approved
 *   savings percentage, so the two numbers cannot imply a saving the script does not claim,
 *   and they move together if that percentage ever changes.
 *   The currency comes from the website's country code, because quoting US dollars at an
 *   Australian construction firm is worse than quoting nothing.
 *   Both are said as approximations and as market figures for that KIND of seat. The
 *   invention guard above keeps its teeth on the part that matters: the writer still may not
 *   imply it knows what THIS company pays or what the advertisement offered.
 *
 * ROUTE B NEEDED A WORD-FOR-WORD LOCK, not a better rule. The previous attempt told it to put
 * the back office seats first and the on-site clause last, and named the bad sentence, and it
 * came back anyway with "A Senior Project Manager isn't a seat our partners fill offshore" -
 * negative first, us as the subject. Ordering instructions and ban lists get graded
 * generously. Every rule that has actually held in this tool is a locked phrase, so route B
 * now opens on a locked line carrying the local figure, and the seat staying on site is a
 * subordinate clause in the middle rather than the headline.
 *
 * BEAT 1 IS ASSUMPTIVE NOW, not descriptive. It was coming back as "handling the
 * reconciliation and GL entries that keep the books accurate", which explains the lead's own
 * job back to them. They wrote the advertisement. The beat now states the tension they are
 * already holding - someone genuinely good in that chair while the number stays where it has
 * to - as a given rather than a question, which is the thing the rest of the call answers.
 * The industry-noun rule went with the old shape, because the beat no longer describes duties;
 * what replaced it is a requirement that one concrete thing from their world be in the
 * tension, so it is this seat and not any seat, plus a ban list of the nine phrases that are
 * true of every hire ever advertised.
 *
 * "A ACCOUNTING SPECIALIST" is why article() exists. Three locked lines hardcoded "a" in
 * front of an interpolated job title. Vowel letters are the easy half; the other half is
 * acronyms, where what matters is how the letter is said, so HR takes "an" and GL takes "a".
 * A rep reading at pace trips on both, and SAY IT ALOUD is the one rule this whole prompt
 * exists to serve.
 *
 * THE CLOSE IS THE FLOOR'S OWN, restored. It reads "I know [HESITATION], but would you be
 * opposed to carving out 15 minutes for a coffee break style chat, just to see if this could
 * work or not, I'm thinking..." That is the wording from the standalone builder, tuned on
 * live calls, and the hesitation now completes "I know ___" rather than trailing a fixed
 * "I know people hiring right now", which was doing nothing except forcing a relative clause.
 * The two day names stay: without them the beat asks permission but never asks for the
 * meeting, and the floor's version has always carried them.
 *
 * The fifteen minutes is derived from MEETING_LENGTH by stripping "each", not typed. One
 * number, two grammars: "15 minutes each" is right where two partners are on the table and
 * wrong in "carving out 15 minutes each for a chat".
 *
 * WHAT-THE-CALL-IS IS GONE, by request, and the script is four beats now. It had become
 * half redundant the moment beat 3 started quoting figures: "what those seats actually cost
 * offshore" repeats the number the rep has just said. What went with it is not redundant
 * though, and is worth knowing was lost: how the team gets managed day to day, and who owns
 * performance and retention. That is Stefanie's reframe of what the meeting is and the thing
 * PJ built the change order around, and this generator no longer says it anywhere. If it
 * should come back it belongs as one clause inside the ask, not as its own beat.
 *
 * WHAT WAS NOT TAKEN from that framework: proof. Weinberg wants customer names, outcomes and
 * numbers in the story. The only number here we can stand behind is the partner count, and it
 * already lives in the call script's own offer beat. Inventing social proof is precisely the
 * class of claim the SP change order spent a week removing, so this beat carries none.
 */

import { useState, useMemo } from 'react'
import { callAI } from '../lib/ai'
import { SAVINGS_CLAIM, MEETING_LENGTH } from '../data/flow'
import { ScriptLine, offerWindow } from './SpielBuilder'

/** Same model and the same one-call-per-click shape as the Spiel Builder. */
const MODEL = 'claude-haiku-4-5-20251001'

const NAVY = '#0f1729'
const MAGENTA = '#d6006e'
const PAPER = '#f7f8fb'
const LINE = '#dfe3ec'
const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
const SANS = '"Helvetica Neue", Helvetica, Arial, system-ui, -apple-system, sans-serif'

const URL_RE =
  /^(https?:\/\/|www\.)|\.(com|net|org|io|co|ai|ph|au|uk|us|ca|nz|sg|de|fr|es|it|nl|se|dk|in|jp|biz|info|dev|app|xyz|group|build)\b/i

const TITLE_WORD =
  /^(chief|head|vp|svp|evp|president|vice|director|manager|managing|officer|founder|co-?founder|owner|proprietor|principal|partner|lead|supervisor|coordinator|specialist|executive|chairman|chairwoman|chair|superintendent|estimator|controller|comptroller|treasurer|counsel|attorney|foreman|buyer|planner|scheduler|dispatcher|recruiter|analyst|engineer|architect|surveyor|producer|editor|admin|c[eftmoi]o|cmo|cro|cpo|chro|cco|gm|md)$/i

export interface HiringLead {
  jobTitle: string
  industry: string
  hiringPosition: string
  url: string
}

/*
 * The four fields arrive in a fixed order, so this is positional rather than the fuzzy
 * classifier the Spiel Builder needs. Two tolerances, because reps paste from anywhere:
 * a URL is recognised wherever it lands and pulled out first, and "Hiring: Bookkeeper"
 * style labels are stripped. Everything left keeps its order.
 */
export function parseHiringLead(line: string): HiringLead {
  const out: HiringLead = { jobTitle: '', industry: '', hiringPosition: '', url: '' }
  const parts = line
    .split(/[,\t|;\n]+/)
    .map(s => s.trim())
    .filter(Boolean)

  const rest: string[] = []
  for (const part of parts) {
    const tokens = part.split(/\s+/)
    const at = tokens.findIndex(t => !/\s/.test(t) && URL_RE.test(t))
    if (at !== -1 && !out.url) {
      out.url = tokens.splice(at, 1)[0]
      const left = tokens.join(' ').trim()
      if (left) rest.push(left)
      continue
    }
    rest.push(part)
  }

  const strip = (s: string) =>
    s.replace(/^(job\s*title|title|role|position|industry|sector|hiring(\s*(for|position|role))?|they'?re hiring)\s*[:=-]\s*/i, '').trim()

  const fields = rest.map(strip).filter(Boolean)

  /* Pasted straight off a job ad, with no commas anywhere. Work it out from the words. */
  if (fields.length === 1 && /\s/.test(fields[0])) {
    const ff = splitFreeform(fields[0])
    if (ff.jobTitle && ff.hiringPosition) {
      out.jobTitle = ff.jobTitle
      out.industry = ff.industry
      out.hiringPosition = ff.hiringPosition
      return out
    }
  }

  const [a = '', b = '', c = ''] = fields
  out.jobTitle = a
  out.industry = b
  out.hiringPosition = c
  /* Three fields with no industry given: treat the third as the seat, not the sector. */
  if (!c && b) {
    out.hiringPosition = b
    out.industry = ''
  }
  return out
}

/*
 * One line, no commas: "Executive Chairman civil engineering SENIOR PROJECT MANAGER".
 *
 * Two things make this readable without punctuation. The lead's own title comes first and
 * contains a title word, and the advertised seat comes last and is capitalised, because it
 * was copied out of a job ad. So take the title off the front, take the capitalised run off
 * the back, and whatever is left in the middle is the industry. Lower case is the signal
 * that the industry has started: "civil engineering" stops the backward scan dead.
 */
function splitFreeform(text: string) {
  const toks = text.split(/\s+/).filter(Boolean)
  const isCapped = (t: string) => /^[A-Z0-9&]/.test(t)
  const empty = { jobTitle: '', industry: '', hiringPosition: '' }
  if (toks.length < 2) return empty

  /*
   * Take the seat off the back FIRST. Doing the title first breaks on "Executive Chairman",
   * where the second word is itself a title word and the forward scan has no way to know
   * whether it belongs to the title or starts the advertised seat. From the back there is no
   * such question: the run ends where lower case begins.
   */
  let seatAt = toks.length
  while (seatAt > 1 && isCapped(toks[seatAt - 1]) && toks.length - seatAt < 4) seatAt--
  if (seatAt === toks.length) return empty
  const head = toks.slice(0, seatAt)

  /* then the title off the front of what is left */
  let first = -1
  for (let i = 0; i < head.length; i++) {
    if (TITLE_WORD.test(head[i])) {
      first = i
      break
    }
  }
  if (first === -1) return empty
  let start = first
  while (start > 0 && isCapped(head[start - 1])) start--
  let end = first
  while (end + 1 < head.length && isCapped(head[end + 1])) end++
  /* "Head of Partnerships" keeps its joiner */
  while (end + 2 < head.length && /^(of|for|at)$/i.test(head[end + 1]) && isCapped(head[end + 2]))
    end += 2

  return {
    jobTitle: head.slice(start, end + 1).join(' '),
    industry: head.slice(end + 1).join(' '),
    hiringPosition: toks.slice(seatAt).join(' '),
  }
}

/*
 * "a" or "an" for a job title. Vowel letters are the easy half. The other half is acronyms,
 * where what matters is how the letter is SAID: HR is "aitch", so it takes "an", while GL is
 * "jee" and takes "a". Without this the locked lines produce "a Accounting Specialist" and
 * "a HR Officer", and a rep reading at pace trips on both.
 *
 * The acronym branch is capped at three letters. Reps paste straight off the advertisement,
 * which is often in capitals, and an unbounded rule reads SENIOR as an acronym and returns
 * "an SENIOR PROJECT MANAGER". No acronym anyone puts in a job title is longer than three.
 */
const SOUNDS_VOWEL = /^[AEFHILMNORSX]+$/
/* Written with a vowel, said with a "y": utilities, user, union, European. These take "a". */
const SOUNDS_LIKE_YOU = /^(uni|use|usu|uti|utl|ubi|euro?|eu)/i
export function article(title: string): string {
  const first = (title || '').trim().split(/\s+/)[0] || ''
  /* Two or three letters, because job ads arrive in caps and SENIOR is not an acronym. */
  if (/^[A-Z]{2,3}$/.test(first)) return SOUNDS_VOWEL.test(first[0]) ? 'an' : 'a'
  if (SOUNDS_LIKE_YOU.test(first)) return 'a'
  return /^[aeiou]/i.test(first) ? 'an' : 'a'
}

/*
 * The opener asks who owns the function, so it needs the FUNCTION, not the job title.
 * "Customer Support Specialist" has to become "customer support": nobody is in charge of a
 * Customer Support Specialist. Strip the seniority off the front and the role noun off the
 * back, and what is left is what that person runs.
 *
 * Three shapes come out of that, because one phrasing does not fit every title:
 *   two or more words left  -> say it bare.            "customer support", "accounts payable"
 *   one word left           -> "the X side".           "the payroll side", "the project side"
 *   nothing stripped        -> name the hire instead.  "the Bookkeeper hire"
 * The third is the honest fallback. A title that is one indivisible word gives us no function
 * to ask about, and guessing one ("bookkeeping" from "Bookkeeper") is how you end up asking
 * who runs a department that does not exist.
 */
const SENIORITY = /^(senior|snr|sr|junior|jnr|jr|lead|head of|chief|principal|assistant|associate|trainee|graduate|entry level|experienced)\s+/i
const ROLE_NOUN = /\s+(specialist|manager|officer|coordinator|administrator|admin|assistant|clerk|analyst|executive|associate|lead|director|engineer|technician|agent|representative|rep|consultant|advisor|adviser|supervisor|controller|receptionist|accountant|bookkeeper|developer|designer|planner|scheduler|dispatcher|buyer|estimator)s?$/i

export function hiringFunction(title: string): string {
  const raw = (title || '').trim()
  if (!raw) return 'that hire'
  let t = raw
  let stripped = false
  const before = t
  t = t.replace(SENIORITY, '')
  if (t !== before) stripped = true
  const beforeNoun = t
  t = t.replace(ROLE_NOUN, '')
  if (t !== beforeNoun) stripped = true
  t = t.trim()
  if (!stripped || !t) return `the ${raw} hire`
  /* Said mid-sentence, not printed as a heading, so it is lower case either way. Job ads
     arrive in capitals and a title-cased department reads as a proper noun it is not. */
  const said = t.toLowerCase()
  return said.includes(' ') ? said : `the ${said} side`
}

/** The opener is fixed and local. It is never sent to the model, so it cannot get reworded. */
export function buildHiringIntro(hiringPosition: string): string[] {
  return [
    `Hi [Lead Name], it's [Your Name] here. (pause) Just curious, who's in charge of ${hiringFunction(hiringPosition)} over there?`,
  ]
}

/* ------------------------------- the prompt ------------------------------- */

export function buildHiringPrompt({ jobTitle, industry, hiringPosition, url }: HiringLead): string {
  const { offer, fallback } = offerWindow()
  /* "15 minutes each" was written for the two-partner line and is wrong in the ask. Strip the "each" rather than
     typing 15 a second time, so changing MEETING_LENGTH still moves both. */
  const perPartner = MEETING_LENGTH.replace(/\s+each$/i, '')
  const a = article(hiringPosition)
  return `Write a cold call script for an SDR at Outsource Accelerator, the world's leading outsourcing marketplace, calling someone who is currently hiring.

  WHO IS BEING CALLED: ${jobTitle}${industry ? `, in ${industry}` : ''}${url ? `, ${url}` : ''}
  THE SEAT THEY HAVE ADVERTISED: ${hiringPosition}

  WHAT YOU KNOW, AND IT IS ONLY THIS. The role above is open, because they advertised it. Nothing else. You have no research and no web access. Do not write where the ad was posted, how long it has been open, how many they want, how senior it is, whether they are struggling to fill it, or anything at all about this company's size, clients, funding or offices. If it is not in the two lines above, you do not know it, and a lead who hears a detail we could not possibly have will end the call.
  ONE EXCEPTION, and only this one. Beat 3 gives an approximate market salary for that KIND of seat, said as an approximation. That is a general market figure. You still do not know, and must never imply you know, what THIS company pays, what the advertisement offered, or what their budget is.
  The website address is there for the kind of firm it signals, nothing more. Never say the company's name: the rep says "your company".

  4 short paragraphs, one blank line between each. No labels, numbering, JSON or preamble. Keep every phrase marked word for word exactly as written, and fill the rest with this person's world. One or two short sentences per beat, never three.

  THE REP HAS ALREADY SAID ONE LINE, and it is this: "Hi [name], it's [rep], just curious, who's in charge of ${hiringFunction(hiringPosition)} over there?" The lead has answered it. So do not greet, do not introduce yourself, do not ask who is in charge, and do not ask for permission or for time. Start cold on the reason for the call.
  That opener does NOT name the company, so beat 2 is the first time the lead hears who we are. Write it as an introduction rather than a reminder.

  It is one continuous read. Beats 1 to 3 carry no ask and no meeting request. The ask lives in beat 4 and nowhere else.

  1. THE REASON FOR THE CALL, AND IT IS ASSUMPTIVE. 34 WORDS MAX.
  Word for word: "So the reason for my call is I saw your company is looking for ${a} ${hiringPosition}..." then word for word: "and I know how important it is to" + the thing this person is already weighing over that hire.
  THE TENSION, NOT THE DUTIES. They wrote the advertisement, so telling them what the seat does teaches them nothing and reads as filler. Say instead the thing they are already holding in their head: getting someone genuinely good in that chair while the number stays where it has to sit. State it as something you assume is true of them, never as a question, and they are agreeing with you before they have decided to.
  MAKE IT THIS SEAT, NOT ANY SEAT. One concrete thing from their world has to be in it, the thing that makes this particular hire hard: the scale of what they are running, the standard the work has to meet, or what goes wrong if the person turns out not to be right.
  BANNED, because every one of them is true of every hire and says nothing: "finding the right person", "getting the right fit", "hiring the right talent", "keeping costs down", "managing the budget", "balancing cost and quality", "in today's market", "it's a competitive market", "attracting top talent".
  Say the advertised seat exactly as written above. Not why they should outsource it, no compliment about the company, and no adjectives about them.

  2. THE PROBLEM FIRST, THEN US. 42 WORDS MAX, and the order is the whole point of the beat.
  FIRST, one short sentence on what a firm like theirs actually runs into filling this seat. Their side of it, never ours: what it costs them, how long it sits open, or the two bad options they are stuck choosing between, paying a premium locally or taking whoever is available. Concrete and in their world. Do not describe anything we do, do not name a benefit, and do not use the word offshore yet.
  THEN, word for word: "...and that's where we come in. We're the world's leading outsourcing marketplace, we match you to the vetted BPO partners that already do this work." Then stop. Nothing after it.
  WHY THIS ORDER, because it is the difference between a story and a monologue. Opening on what we are asks the lead to care about our business model before they have heard a single problem of their own. The problem is what earns the sentence that follows it, and a cold call that opens on the caller is the one that gets ended.
  BANNED AS THE OPENING WORDS of this beat: we, our, us, I, "the reason that's relevant is", and any description of what we are or what we do. If your first sentence could be moved onto our website unchanged, you have written the monologue.

  3. THE TURN, AND THE TWO NUMBERS. Open word for word, always this exact line, never a variation of it: "And here's where it gets interesting..." It comes straight off the marketplace line so it lands as a turn in the conversation, not as a correction to something they said.
  38 WORDS MAX. Then word for word: "${a} ${hiringPosition} here is going to run you somewhere around" + THE LOCAL FIGURE. Then that the same seat, filled through one of these firms, is "more like" + THE OFFSHORE FIGURE. Then that it is full-time and dedicated, on their hours.

  THE SAME SEAT IS ON BOTH SIDES OF THE COMPARISON, and this is the whole beat. What this role costs here, against what this role costs offshore. Do not swap in a different job. Do not offer the admin, the coordination or the back office behind it. Do not say the seat has to stay on site, and do not raise whether it can be done offshore at all. They advertised this role, so this role is the one being priced, and anything else answers a question they did not ask.

  THE TWO NUMBERS, and they are approximate market figures, not quotes.
  SAY THEM AS APPROXIMATE, always: "somewhere around", "roughly", "more like". Never a precise number, never a rate per hour, never a price from a partner, never a total saving.
  THE LOCAL FIGURE is what that KIND of seat typically pays in this lead's market, as a round annual number.
  CURRENCY comes from the website address: .com.au is Australian dollars, .co.nz or .nz New Zealand dollars, .co.uk or .uk pounds, .ie euros, .ca Canadian dollars, .sg Singapore dollars, .ph pesos. Anything else, or no website, US dollars. Say the currency once, on the first figure only, and never name the country.
  THE OFFSHORE FIGURE IS NOT A SECOND GUESS. It is the local figure less ${SAVINGS_CLAIM}, worked out and rounded, given as a range from low to high. A figure implying any other saving than that is wrong even if it sounds right.

  WE ARE NOT IN THIS BEAT. The subject is them, the seat, or the money. Never us, never what we do or do not do. BANNED outright: "our partners fill", "we place", "we provide", "we can give you", "we work with", "we help", "what we do is", "our clients", and any sentence at all whose subject is we, our or us.
  No promises about quality, no pitching us, and no third number.

  4. THE ASK. Word for word, and the only thing you write is the hesitation:
  "I know [HESITATION], but I think it would make sense for you to have an offshore option for this role. So would you be opposed to carving out ${perPartner} for a coffee break style chat, just to see if this could work or not, I'm thinking ${offer}? If not maybe ${fallback}?"
  THE HESITATION COMPLETES "I know ___", so it has to read straight on from those two words with no joining word in front of it and no full stop after it. What follows it is fixed: the recommendation, then the ask. You do not write either. 10 WORDS MAX, one short clause. It is the one thing that would make THIS person pause before saying yes, given the seat they are filling and the industry they are in: what they are protecting, what they think this call is going to be, what went wrong last time. Their words, not ours, and specific to this hire. Never a generic objection like being busy, not having budget, or wanting someone who stays.
  Change nothing else in that beat. No filler, no stage directions inside it, no recap, no thanks, nothing after it.

  VOICE: spoken, short clauses, contractions, ellipses as pacing marks but at most ONE per beat. No em dashes, no corporate filler, no feature lists. Curiosity, not authority. Sell the meeting, not the service.

  DELIVERY MARKS. Write it the way a screenplay is written, so the rep can see the pacing.
  Put [PAUSE] on its own after beat 1 and again before the ask in beat 4. Two, no more.
  Put one direction in round brackets before the phrase it governs, one word: (slow), (deliberate), (softer). At most one across the whole script, and never inside beat 4.
  Drop in a spoken filler where a person actually would, like y'know or uh. At most one per beat, and never in beat 4.
  Marks, directions and fillers are breath, not content. They do NOT count toward the word caps.

  SAY IT ALOUD. A rep reads this at pace on a live call. Short, common, spoken words. Nothing anyone could trip over: not "operationalised", "consolidation", "methodologies", "infrastructure", "bandwidth", "streamline", "leverage".`
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

export default function HiringScript() {
  const [leadLine, setLeadLine] = useState('')
  const [script, setScript] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const lead = useMemo(() => parseHiringLead(leadLine), [leadLine])
  const ready = Boolean(lead.jobTitle.trim() && lead.hiringPosition.trim())
  const intro = useMemo(() => buildHiringIntro(lead.hiringPosition), [lead.hiringPosition])
  const onScreen = script.length ? [...intro, ...script] : intro

  async function generate() {
    if (!ready || loading || script.length) return
    setLoading(true)
    setError('')
    try {
      const text = await callAI({
        prompt: buildHiringPrompt(lead),
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
    } catch {
      setError('That did not come back clean. Run it again.')
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
    lead.jobTitle && `calling a ${lead.jobTitle}`,
    lead.industry && lead.industry,
    lead.hiringPosition && `hiring a ${lead.hiringPosition}`,
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
            placeholder="Job title, industry, hiring position, website. Commas optional."
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
            THEIR JOB TITLE &nbsp;·&nbsp; INDUSTRY &nbsp;·&nbsp; THE SEAT THEY ARE HIRING FOR &nbsp;·&nbsp; WEBSITE
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
                : 'Could not tell which is their job title and which is the seat they are hiring for. Try commas between them.'}
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
              {loading ? 'WRITING' : script.length ? 'NEXT LEAD' : 'WRITE THE SCRIPT'}
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
              Read it before you say it. Both figures are approximations for that kind of
              seat, not quotes, and the partners price against the real spec on the call. If
              the seat they advertised genuinely cannot be done from another country, a driver,
              a nurse, kitchen or floor staff, this is not the lead for this script.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
