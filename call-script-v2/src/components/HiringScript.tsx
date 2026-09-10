/*
 * Hiring Script generator.
 *
 * A different call from the one the Spiel Builder writes. There, the rep is cold and has to
 * discover whether a role exists at all. Here the role is already open and advertised, so the
 * rep leads with it and the whole discovery half of the call is already done. That is why this
 * is its own generator rather than a mode on the other one: nearly every beat is different.
 *
 * The rep pastes four things, in this order:
 *   Job Title, Website URL, Industry, Hiring Positions
 * That is the column order of the sheet reps actually work from, so a row copied out of it
 * pastes straight in with nothing to rearrange. A copied spreadsheet row arrives tab
 * separated, which is why the field split treats a tab like a comma.
 * The OLD order still reads, and so does any order: the website is found by its shape
 * wherever it sits, and what is left is sorted by what it looks like rather than by position.
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

import { useEffect, useState, useMemo } from 'react'
import { callAI } from '../lib/ai'
import { SAVINGS_CLAIM, SAVINGS_PCT, MEETING_LENGTH } from '../data/flow'
import { ScriptLine } from './ScriptLine'
import { offerWindow } from '../lib/leadText'
import {
  article,
  hiringFunction,
  hiringLeadIssue,
  parseHiringLead,
  seatOwnership,
  seatWarning,
  type HiringLead,
} from '../lib/hiringLead'

/** Same model and the same one-call-per-click shape as the Spiel Builder. */
const MODEL = 'claude-haiku-4-5-20251001'

const NAVY = '#0f1729'
const MAGENTA = '#d6006e'
const PAPER = '#f7f8fb'
const LINE = '#dfe3ec'
const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
const SANS = '"Helvetica Neue", Helvetica, Arial, system-ui, -apple-system, sans-serif'

/** The opener is fixed and local. It is never sent to the model, so it cannot get reworded. */
/*
 * v2 asks who owns the function BEFORE the script starts, so unlike v1 it never has to
 * assert that the advertised seat is theirs. What it was missing is the other half: a written
 * line for when the answer is somebody else. Four reps reported that exact moment, and an
 * opener that asks a routing question without a routing line puts the rep on the spot for
 * having asked it.
 */
export function buildHiringIntro(hiringPosition: string): string[] {
  return [
    `Hi [Lead Name], it's [Your Name] here. (pause) Just curious, who's in charge of ${hiringFunction(hiringPosition)} over there?`,
    `[IF IT IS NOT THEM] Ah got it, who would that be? (pause) Any chance you could point me their way, or is there a better time to catch them?`,
  ]
}

/* ------------------------------- the prompt ------------------------------- */

export function buildHiringPrompt(
  { jobTitle, industry, url }: HiringLead,
  hiringPosition: string,
): string {
  const { offer, fallback } = offerWindow()
  /* "15 minutes each" was written for the two-partner line and is wrong in the ask. Strip the "each" rather than
     typing 15 a second time, so changing MEETING_LENGTH still moves both. */
  const perPartner = MEETING_LENGTH.replace(/\s+each$/i, '')
  const a = article(hiringPosition)
  /*
   * THE PRICED BAND, DERIVED FROM SAVINGS_PCT SO IT CANNOT DRIFT FROM THE HEADLINE CLAIM.
   *
   * The rule used to read "the local figure less 50 to 70%, worked out and rounded". On a
   * local figure of 80,000 that is 24 to 40,000, and the model wrote "30 to 35,000" - a 56 to
   * 62% saving. It was not doing the arithmetic, it was picking a band that sounded like the
   * right shape. Same lesson as everywhere else on this tool: a word-for-word lock binds and
   * a rule to be applied gets graded generously.
   *
   * So the prompt no longer asks for a subtraction. It gets multipliers and a worked example
   * on this lead's own currency, both computed here.
   *
   * The band sits in the DEEP half of the claim: from the top figure down to the midpoint,
   * so 60 to 70% off rather than 50 to 70% off. Two reasons. It is what the Rates panel
   * already shows per role, 65 to 80%, so the shallow end of the claim was the outlier and
   * not this. And a range quoted low-to-high is heard at its top: "24 to 40,000" lets the
   * lead hear 40 and the comparison stops doing any work.
   */
  const bounds = (SAVINGS_PCT.match(/\d+/g) || ['50', '70']).map(Number)
  const deepest = Math.max(...bounds)
  const shallowest = Math.min(...bounds)
  const midpoint = Math.round((deepest + shallowest) / 2)
  /* What the lead PAYS, as a share of local: 100 minus the saving. */
  const payLow = (100 - deepest) / 100
  const payHigh = (100 - midpoint) / 100
  const example = (local: number) =>
    `${Math.round((local * payLow) / 1000)} to ${Math.round((local * payHigh) / 1000)},000`
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

  1. THE REASON FOR THE CALL, AND IT IS ASSUMPTIVE. 30 WORDS MAX.
  Word for word: "so yeah I'm just reaching out because I saw your company is looking for ${a} ${hiringPosition}..." then word for word: "and I know how important it is to" + the thing this person is already weighing over that hire.
  THE TENSION IS WHAT THE SEAT IS FOR, NOT WHAT IT COSTS. They wrote the advertisement, so telling them what the seat does teaches them nothing. And this person is senior: what they own is a number, a deadline or a delivery, never a hiring process. So say what the empty chair is holding up - the work that is not shipping, the accounts nobody is covering, the reporting that lands late - in the language of ${industry || 'their industry'}.
  BUDGET IS NOT THE TENSION. "While the budget holds", "without blowing the budget", "at the right cost" are all about our pitch and not their problem, and to someone running a P&L they read as small. The money arrives in beat 3 and lands far harder when beat 1 was about output.
  State it as something you assume is true of them, never as a question, and they are agreeing with you before they have decided to.
  MAKE IT THIS SEAT IN THIS INDUSTRY. It needs one noun only ${industry || 'this industry'} would use, the thing the work is actually made of: settlement files, shop drawings, carrier contracts, claims batches, pipeline reviews, freight documentation, retainer scopes. That noun is what makes the sentence land on this person and nowhere else. A sentence that would read the same for a different industry has not been written yet.
  BANNED, because every one is true of every hire and says nothing: "finding the right person", "getting the right fit", "hiring the right talent", "keeping costs down", "managing the budget", "balancing cost and quality", "while the budget holds", "in today's market", "it's a competitive market", "attracting top talent", "in your space", "firms like yours", "moves the needle", "scale your team".
  Say the advertised seat exactly as written above. Not why they should outsource it, no compliment about the company, and no adjectives about them.

  2. THE PROBLEM FIRST, THEN US. 46 WORDS MAX, and the order is the whole point of the beat. The problem sentence stays ONE short clause; the extra words belong to the specialism and the result, not to a longer problem.
  FIRST, ONE short sentence, and it names ${industry || 'their industry'} or the work that industry runs on. What happens to the OUTPUT while this seat is empty: the thing that slips, the queue that builds, the revenue that waits. One clause, their side of it, never ours.
  DO NOT HAND THEM A CHOICE BETWEEN TWO BAD OPTIONS. "Choosing between paying a premium locally or taking whoever's available" is a sentence this beat produced on a live lead, and it is ours rather than theirs: it is the setup for our pitch, dressed as their problem, and it is true of every company in every industry. If the sentence would survive swapping the industry for any other, delete it and write the one that would not.
  Do not describe anything we do, do not name a benefit, and do not use the word offshore yet.
  THEN, word for word up to the two blanks: "...and that's where we come in. We're the world's leading outsourcing marketplace, and we can connect you to our vetted outsourcing partners, highly specialised in" + THE WORK + ", so" + THE RESULT + "." Then stop. Nothing after the result.
  THE WORK IS THE TASK, NOT THE JOB TITLE. It is the thing the ${hiringPosition} seat actually does all day, named the way that industry names it: pipeline reporting, settlement reconciliation, shop drawings, freight documentation, claims processing, payroll runs. Never "this work", never "that role", never the job title again, and never something so broad it would fit any seat. If beat 2's first sentence named the work that is slipping, this is that same work.
  THE RESULT IS WHAT CHANGES FOR THE THING BEAT 2 JUST SAID WAS SLIPPING. Not a benefit of using us, not a promise about quality, and never a number. Say what the empty chair was holding up, now moving: "so those reviews clear while you're still hiring", "so month end closes on time", "so the drawings stop waiting on one person".
  BANNED AS THE RESULT, because every one of them is the sound of a result without being one: "so you can focus on what matters", "so you can focus on growth", "so you can scale", "so you can grow", "freeing you up to", "so you can concentrate on the bigger picture", "peace of mind", "hit the ground running", "so you can do more with less", "taking it off your plate".
  THE TEST: could the result sentence be swapped onto a completely different seat in a different industry and still read? Then it is not a result, it is filler, and the beat is not written yet.
  WHY THIS ORDER, because it is the difference between a story and a monologue. Opening on what we are asks the lead to care about our business model before they have heard a single problem of their own. The problem is what earns the sentence that follows it, and a cold call that opens on the caller is the one that gets ended.
  BANNED AS THE OPENING WORDS of this beat: we, our, us, I, "the reason that's relevant is", and any description of what we are or what we do. If your first sentence could be moved onto our website unchanged, you have written the monologue.

  3. THE TURN, AND THE TWO NUMBERS. Open word for word, always this exact line, never a variation of it: "And here's where it gets interesting..." It comes straight off the marketplace line so it lands as a turn in the conversation, not as a correction to something they said.
  46 WORDS MAX. Then word for word: "${a} ${hiringPosition} over there is going to run you somewhere around" + THE LOCAL FIGURE. Then word for word: "but with one of our partners, they can give you an exceptional ${hiringPosition} for only" + THE OFFSHORE FIGURE. Then word for word: "full-time, dedicated, on your hours."
  THE SEAT IS NAMED TWICE AND THAT IS DELIBERATE, once on each side of the comparison. It is the thing they already want, so saying it again next to the smaller number is the whole point of the sentence. Do not shorten the second one to "one", "someone" or "that role".

  THE SAME SEAT IS ON BOTH SIDES OF THE COMPARISON, and this is the whole beat. What this role costs here, against what this role costs offshore. Do not swap in a different job. Do not offer the admin, the coordination or the back office behind it. Do not say the seat has to stay on site, and do not raise whether it can be done offshore at all. They advertised this role, so this role is the one being priced, and anything else answers a question they did not ask.

  THE TWO NUMBERS, and they are approximate market figures, not quotes.
  SAY THEM AS APPROXIMATE. The local figure carries "somewhere around" in its own locked words. The offshore figure is a RANGE, and the range is what keeps it approximate, so "for only 29 to 38,000" is right and "for only 33,000" is not. Never a single precise number on either side, never a rate per hour, never a total saving, and never a named partner or a quote attributed to one.
  THE LOCAL FIGURE is what that KIND of seat typically pays in this lead's own market, as a round annual number. It is their market, not ours, which is why the line says over there and not here.
  CURRENCY comes from the website address: .com.au is Australian dollars, .co.nz or .nz New Zealand dollars, .co.uk or .uk pounds, .ie euros, .ca Canadian dollars, .sg Singapore dollars, .ph pesos. Anything else, or no website, US dollars. Say the currency once, on the first figure only, and never name the country.
  THE OFFSHORE FIGURE IS ARITHMETIC, NOT A SECOND GUESS. Do not estimate it, and do not subtract a percentage in your head. Multiply.
  Low end = the local figure times ${payLow}. High end = the local figure times ${payHigh}. Round both to the nearest thousand and say them low to high. That is a saving of ${midpoint} to ${deepest}%, which sits inside ${SAVINGS_CLAIM}.
  WORKED, SO THERE IS NOTHING TO INTERPRET. Local 80,000 gives "for only ${example(80000)}". Local 60,000 gives "for only ${example(60000)}". Local 120,000 gives "for only ${example(120000)}".
  "30 to 35,000" against a local 80,000 is WRONG. It is a saving of 56 to 62%, it is the number this beat kept producing, and it is shallower than every figure we publish. If your offshore range is more than ${payHigh} of your local figure, you have guessed instead of multiplying.

  WE ARE BARELY IN THIS BEAT, and only in the four locked words "with one of our partners". Past those the subject is them, the seat, or the money. Never us, never what we do or do not do. BANNED outright: "our partners fill", "we place", "we provide", "we can give you", "we work with", "we help", "what we do is", "our clients", and any sentence at all whose subject is we, our or us.
  THE LOCKED LINE IS THE ONE EXCEPTION AND IT IS WRITTEN FOR YOU, so do not treat the list above as a reason to reword it. It says "our partners" and it says "they can give you", which are a hair away from two of the banned phrases, and the difference is the whole point: the subject is THEY, the partner who would fill this seat, and never we. It does not license a second mention. Every word you write yourself obeys the list.
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

  const lead = useMemo(() => parseHiringLead(leadLine), [leadLine])
  /*
   * A paste can advertise several seats. The rep picks which one the call is about, and the
   * pick resets whenever the line changes, because seat 2 of the last lead is not seat 2 of
   * this one. Defaulting to the first would be one keystroke cheaper and a wrong seat is the
   * one mistake this tool cannot recover from, so it starts unpicked when there is a choice.
   */
  const [picked, setPicked] = useState('')
  const seat = lead.seats.includes(picked) ? picked : lead.seats.length === 1 ? lead.seats[0] : ''
  const issue = useMemo(() => hiringLeadIssue(lead, seat), [lead, seat])
  const ready = Boolean(seat) && !issue
  /*
   * Whether the advertised seat plausibly belongs to this person, shown BEFORE the rep dials.
   * Four reps reported leads saying the advertised role has nothing to do with them, which is
   * the lead list rather than the script: it pairs whoever was findable with whatever the
   * company posted. A warning costs nothing, and a rep who expects the correction handles it.
   */
  const owns = useMemo(() => seatOwnership(lead.jobTitle, seat), [lead.jobTitle, seat])
  /* Non-blocking: says the seat looks odd without stopping the rep. See seatWarning. */
  const warn = useMemo(() => seatWarning(seat), [seat])
  const intro = useMemo(() => buildHiringIntro(seat), [seat])
  const onScreen = script.length ? [...intro, ...script] : intro

  async function generate() {
    if (!ready || loading || script.length) return
    setLoading(true)
    setError('')
    try {
      const text = await callAI({
        prompt: buildHiringPrompt(lead, seat),
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
    setPicked('')
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
    seat && `hiring ${article(seat)} ${seat}`,
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
            placeholder="Job title, website, industry, the seats they are hiring for"
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
            THEIR JOB TITLE &nbsp;·&nbsp; WEBSITE &nbsp;·&nbsp; INDUSTRY &nbsp;·&nbsp; THE SEATS THEY ARE HIRING FOR
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
                : issue ||
                  'Could not tell which is their job title and which is the seat they are hiring for. Try commas between them.'}
            </div>
          )}
          {lead.seats.length > 1 && !script.length && (
            <div style={{ marginTop: 13 }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  color: '#6b7280',
                  marginBottom: 7,
                }}
              >
                {lead.seats.length} SEATS IN THAT PASTE &mdash; WHICH ONE IS THIS CALL ABOUT?
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {lead.seats.map(s => (
                  <button
                    key={s}
                    onClick={() => setPicked(s)}
                    style={{
                      background: seat === s ? MAGENTA : '#fff',
                      color: seat === s ? '#fff' : NAVY,
                      border: `1px solid ${seat === s ? MAGENTA : LINE}`,
                      borderRadius: 4,
                      padding: '7px 13px',
                      fontFamily: SANS,
                      fontSize: 13,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {ready && warn && (
            <div
              style={{
                marginTop: 10,
                padding: '9px 12px',
                borderLeft: `2px solid #c98a00`,
                background: PAPER,
                fontFamily: SANS,
                fontSize: 12.5,
                lineHeight: 1.5,
                color: '#4b5563',
              }}
            >
              <span
                style={{
                  display: 'block',
                  marginBottom: 3,
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  color: '#6b7280',
                }}
              >
                WORTH A SECOND LOOK
              </span>
              {warn}
            </div>
          )}
          {ready && owns.note && (
            <div
              style={{
                marginTop: 12,
                padding: '9px 12px',
                borderLeft: `2px solid ${
                  owns.verdict === 'unlikely'
                    ? MAGENTA
                    : owns.verdict === 'exec'
                      ? '#c98a00'
                      : '#3f9c5a'
                }`,
                background: PAPER,
                fontFamily: SANS,
                fontSize: 12.5,
                lineHeight: 1.5,
                color: '#4b5563',
              }}
            >
              <span
                style={{
                  display: 'block',
                  marginBottom: 3,
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  color: '#6b7280',
                }}
              >
                {owns.verdict === 'unlikely' || owns.verdict === 'exec'
                  ? 'BEFORE YOU DIAL'
                  : 'SAFE TO OPEN ASSUMPTIVELY'}
              </span>
              {owns.note}
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
