export interface FlowNode {
  id: string
  title: string
  script: string
  waitForAnswer?: boolean
  tip?: string
  options: FlowOption[]
  isObjection?: boolean
  isEnd?: boolean
  topic?: string          // scorecard: feeds conversation depth
  /**
   * Ask the rep to type what the lead actually said, into context[key].
   *
   * FlowOption.capture cannot do this: it stores a fixed string chosen by which button
   * was clicked, so it can record that an answer was in a category but never the words.
   * The partner brief and {statedTimelineVerbatim} both need the words.
   */
  recordField?: { key: string; label: string; placeholder?: string }
}

export interface FlowOption {
  label: string
  next: string
  capture?: Record<string, string>
  type?: 'positive' | 'objection' | 'end'
  // ── Live scorecard tags (all optional) ──
  banks?: string[]        // QC items this answer confirms
  refuses?: string[]      // QC items the lead ruled out (heavier penalty)
  elaborated?: boolean    // lead gave real substance (feeds engagement)
  buyingSignal?: boolean  // asked about cost/process/next steps, or accepted
  passiveRisk?: boolean   // bare "yeah" — fires the passive-agreement penalty
  vague?: boolean         // don't credit topic/objection for this answer
}

export interface SalaryRow {
  role: string
  us: string
  offshore: string
  savings: string
}

export const SALARY_TABLE: SalaryRow[] = [
  { role: 'Customer Service Rep',    us: '$40–55K', offshore: '$8–14K',  savings: '~75%' },
  { role: 'Virtual Assistant / EA',  us: '$45–60K', offshore: '$7–12K',  savings: '~80%' },
  { role: 'Bookkeeper / Accounting', us: '$50–65K', offshore: '$10–18K', savings: '~72%' },
  { role: 'Data Entry / Admin',      us: '$35–45K', offshore: '$6–10K',  savings: '~80%' },
  { role: 'Digital Marketer',        us: '$55–80K', offshore: '$12–22K', savings: '~75%' },
  { role: 'Graphic Designer',        us: '$50–70K', offshore: '$10–20K', savings: '~72%' },
  { role: 'Software Developer',      us: '$90–130K',offshore: '$20–45K', savings: '~65%' },
  { role: 'IT Support / Helpdesk',   us: '$45–65K', offshore: '$10–18K', savings: '~72%' },
  { role: 'Sales Support / SDR',     us: '$50–70K', offshore: '$10–18K', savings: '~75%' },
  { role: 'Content Writer',          us: '$45–65K', offshore: '$8–16K',  savings: '~75%' },
  { role: 'HR Coordinator',          us: '$50–65K', offshore: '$10–16K', savings: '~75%' },
  { role: 'Project Coordinator',     us: '$55–75K', offshore: '$12–20K', savings: '~72%' },
]

/**
 * The savings figure, in one place.
 *
 * It is said out loud on nearly every call, so it should be edited once rather than
 * hunted through the script. Interpolated into {SAVINGS_CLAIM} by CallScreen.
 */
export const SAVINGS_PCT = '50 to 70%'
export const SAVINGS_CLAIM = `${SAVINGS_PCT} less than local hiring`

/**
 * How long each partner call runs, in one place.
 *
 * "one 30-minute block" was read as thirty minutes per partner and booked as two
 * back-to-back half hours on a lead who had asked for fifteen. Saying the per-partner
 * length is the fix, so this carries "each" and the nodes do not have to remember to.
 */
export const MEETING_LENGTH = '30 minutes each'
/*
 * The same number, said two ways, because one grammar does not fit both sentences.
 *
 * MEETING_LENGTH belongs where the two partners are on the table: "two back-to-back
 * sessions, 30 minutes each". MEETING_ONE belongs in every line about a single call, where
 * "each" is not just clumsy but wrong: "worth a 30 minutes each look" is what one constant
 * for both produced, and it was already broken at fifteen. Derived rather than typed, so the
 * figure still changes in one place.
 */
export const MEETING_ONE = MEETING_LENGTH.replace(/\s+each$/i, '')

export const flow: Record<string, FlowNode> = {

  // ── OPENING (unchanged — intro stays intact) ─────────────────────────────

  opening: {
    id: 'opening',
    title: 'Opening',
    script: "Hey {leadName}? (Pause)\n\nOh hey, {leadName}, it's {yourName} here over at Outsource Accelerator. I know I called you out of the blue here, mind if I grab half a minute? Then you can let me know if it's relevant or not (pause)\n\nAppreciate that, yeah remind me, have you heard of Outsource Accelerator just by the off chance?",
    tip: "Fanatical Prospecting: the first 7 seconds determine the call. Stay upbeat and confident — not apologetic. 'I know I called you out of the blue' disarms the reflex rejection before it fires. Pause briefly after 'relevant or not' — let them say yes.",
    options: [
      { label: "No — haven't heard of OA", next: 'pitch_q1', type: 'positive' },
      { label: 'Yes — familiar with OA', next: 'pitch_q1', type: 'positive' },
    ],
  },

  // ── CUTOFF / NOT INTERESTED RECOVERY (OPENING) ───────────────────────────

  obj_cutoff_opening: {
    id: 'obj_cutoff_opening',
    title: 'Recovery: Got Cut Off / Not Interested',
    isObjection: true,
    script: "That's completely fair. Before I let you go though, just out of curiosity — do you handle all your hiring in-house or do you ever work with external partners for anything?",
    tip: "Schiffman's Ledge — don't fight the brush-off, acknowledge it and pivot with a single soft question. This is Discovery Q1 used as a hail mary. If they answer at all, you're back in the conversation. Stay calm and curious, not desperate.",
    options: [
      { label: 'They answer — back in the conversation', next: 'qualify_role', type: 'positive' },
      { label: 'Hard no / hung up', next: 'end_not_interested', type: 'end' },
    ],
  },

  // ── PITCH + DISCOVERY Q1 ─────────────────────────────────────────────────

  pitch_q1: {
    id: 'pitch_q1',
    topic: 'current_setup',
    title: 'Value Hook + Discovery Q1',
    script: "No? Oh okay, feel free to cut me off if it's not in your wheelhouse.\n\nSo yeah, I'm reaching out because salaries for specialised local talent keep climbing. I work with a team that helps leaders handle growth without growing the payroll, we're an outsourcing marketplace, so we don't supply the staff ourselves, we match you to the vetted firms that already do this work. Most come in {SAVINGS_CLAIM}.\n\nJust curious, for any of your hiring, do you do it in-house or do you work with external partners for anything?",
    waitForAnswer: true,
    tip: "The 'feel free to cut me off' line (Schiffman) disarms resistance before it forms. Lead with the industry pain — rising local talent costs — before introducing OA. 'we don't supply the staff ourselves' is the line that does the work: it says what we are before they guess, and a marketplace is easier to say yes to than a vendor. The closing question is deliberately NOT binary: 'in-house or external partners' cannot be answered with a flat no, and both answers route somewhere. In-house goes to the role question; already using partners goes to the benchmark play, which is the easier booking of the two. Ask it and stop talking.",
    options: [
      { label: 'All in-house', next: 'qualify_role', type: 'positive', banks: ['company'], elaborated: true },
      { label: 'They already use external partners', next: 'obj_already_outsourcing', type: 'positive', banks: ['company'], elaborated: true },
      { label: 'Not interested', next: 'obj_pitch_recover', type: 'objection' },
      { label: 'Not hiring / budget concern', next: 'obj_not_hiring', type: 'objection' },
    ],
  },

  // ── RECOVERY — NOT INTERESTED (PITCH) ────────────────────────────────────

  obj_pitch_recover: {
    id: 'obj_pitch_recover',
    title: 'Recovery: Not Interested (Pitch)',
    isObjection: true,
    script: "Yeah, no worries, I know you're not interested. Just curious though, for any of your hiring, do you keep everything in-house, or do you ever work with external partners for anything?",
    waitForAnswer: true,
    tip: "Schiffman's Ledge — don't fight the 'not interested,' acknowledge it and pivot with one soft question. If they answer at all, you're back in the conversation and into discovery. Stay calm and curious, not pushy.",
    options: [
      { label: 'They answer — back in the conversation', next: 'qualify_role', type: 'positive' },
      { label: 'Hard no / hangs up', next: 'end_not_interested', type: 'end' },
    ],
  },



  // ── QUALIFY — THE FIVE MUST-KNOWS (Move 4) ───────────────────────────────

  qualify_role: {
    id: 'qualify_role',
    title: 'Qualify ① Role Fit',
    script: "Got it, so down the road, what kind of roles are you looking to add to the team?",
    waitForAnswer: true,
    tip: "Must-Know 1 of 5 (role fit). Frame it hypothetically — 'if you did add support' — so it feels like planning, not pressure. Whatever they name becomes 'that role' for the rest of the call. If they can't name one, pivot to the value pitch with your research.",
    options: [
      { label: 'They name a role', next: 'value_offer', type: 'positive', banks: ['offshorable'] },
      { label: "Can't name a role", next: 'obj_no_role', type: 'objection' },
    ],
  },

  qualify_fulltime: {
    id: 'qualify_fulltime',
    topic: 'full_time',
    title: 'Qualify ② Full-Time',
    script: "Makes sense. And I assume this'd be a full-time position, like thirty to forty hours a week, right?",
    waitForAnswer: true,
    tip: "Must-Know 2 of 5 (full-time). Frame it assumptively as full-time (thirty to forty hours) — don't plant the part-time idea. If they push back to part-time, handle it; don't just roll on. ANALYZER: Gate 3 counts only when the buyer says 'full-time' or 'dedicated' out loud — 'part-time / project / shared / ad hoc' kills it.",
    options: [
      { label: 'Full-time / dedicated', next: 'qualify_volume', type: 'positive', banks: ['full_time'] },
      { label: 'Part-time / project', next: 'obj_parttime', type: 'objection' },
    ],
  },

  qualify_volume: {
    id: 'qualify_volume',
    topic: 'team_size',
    title: 'Qualify ③ Volume',
    script: "And how many are we talking, one to start with, or more of a small team?",
    waitForAnswer: true,
    tip: "Must-Know 3 of 5 (volume). A quick sizing question — it tells the partners what to prep and hints at deal size. One is plenty to book; a team is a bonus. Keep it light.",
    options: [
      { label: 'One to start', next: 'qualify_offshore', type: 'positive' },
      { label: 'A small team / a few', next: 'qualify_offshore', type: 'positive' },
    ],
  },

  qualify_offshore: {
    id: 'qualify_offshore',
    topic: 'offshore',
    title: 'Qualify · Open to Offshore',
    script: "And, you're open to an offshore setup, talent typically based in the Philippines, right?",
    waitForAnswer: true,
    tip: "The offshore gate (Gate 2). Ask it directly and get a spoken 'yes' — the analyzer credits it in the buyer's own voice. A clear yes qualifies. If they lean local or on-site only, handle it; don't just roll past it.",
    options: [
      { label: 'Yes — open to offshore', next: 'qualify_timeline', type: 'positive', banks: ['offshore'] },
      { label: 'Hesitant / prefers local', next: 'obj_offshore', type: 'objection' },
    ],
  },

  qualify_timeline: {
    id: 'qualify_timeline',
    topic: 'timeline',
    title: 'Qualify ④ Timeline',
    script: "And if the right person showed up, what sort of timeframe would you be working to?",
    waitForAnswer: true,
    recordField: {
      key: 'statedTimelineVerbatim',
      label: 'Their timeframe, in their words',
      placeholder: 'e.g. "probably after the new year" / "next two months"',
    },
    tip: "Must-Know 4 of 5 (timeline). OPEN question — do not offer options and do not name a window. Record the timeframe the lead gives, in their words. Beyond two months is a real answer: set a dated callback rather than converting it. Do not manufacture the phrase — an honest 'three months' logged as a callback is worth more to the partner than a coached 'one to two'. ANALYZER: timeline is the #1 flag reason and it credits the buyer's OWN words, so what they actually said is what goes on the record.",
    options: [
      { label: 'They say weeks', next: 'qualify_dm', type: 'positive', banks: ['timeline', 'hiring'] },
      { label: 'They say one to two months', next: 'qualify_dm', type: 'positive', banks: ['timeline', 'hiring'] },
      { label: 'Just a bare "yeah / yes" (no real window)', next: 'obj_timeline_disco', type: 'objection', passiveRisk: true },
      { label: 'They say longer than two months', next: 'obj_timeline_disco', type: 'objection' },
    ],
  },

  // ── QUALIFY — TIMELINE PUSHBACK (bring it into the window) ────────────────

  obj_timeline_disco: {
    id: 'obj_timeline_disco',
    title: 'Qualify: Timeline Further Out',
    isObjection: true,
    script: "That's useful, thanks. The one thing I'd say is that terms, onboarding and getting the right person actually in place usually takes a month or two on its own, so the planning tends to be worth doing early. Either way I'll note three months.\n\nWould it be more useful to see the cost picture now, or should I come back to you nearer the time?",
    waitForAnswer: true,
    tip: "Do NOT convert the timeline. This node used to end by asking them to re-state it as one to two months, which put soft leads in front of partners and is the mechanical reason only half arrived valid. The onboarding reasoning is sound and stays, because early planning is genuinely true; the ask at the end is now a choice between booking on that value and a dated callback. Log what they actually said. ANALYZER: a real 'three months' with a callback beats a coached 'one to two' — the coached one books and does not show.",
    options: [
      { label: 'Book on planning value', next: 'qualify_dm', type: 'positive' },
      { label: 'Set dated callback', next: 'end_callback', type: 'positive' },
      { label: 'Firmly 3+ months, no flexibility', next: 'obj_not_interested_late', type: 'objection', refuses: ['hiring'] },
    ],
  },

  qualify_dm: {
    id: 'qualify_dm',
    topic: 'decision',
    title: 'Qualify ⑤ Decision-Maker',
    script: "Perfect. And you're one of the decision makers for this, right?",
    waitForAnswer: true,
    tip: "Must-Know 5 of 5 (decision-maker). 'Are you the one who'd sign off, or is someone else involved?' is clean and doesn't read as interrogation. A collaborative answer still qualifies as long as they're in the room. If it's entirely someone else, get a name. ANALYZER: not being the decision-maker doesn't kill the call but it flags a reviewer — clear it by getting the actual sign-off person onto the invite.",
    options: [
      { label: 'They sign off / involved in it', next: 'qualify_budget', type: 'positive', banks: ['decision_maker', 'authority'] },
      { label: 'Someone else entirely decides', next: 'obj_wrong_person', type: 'objection' },
    ],
  },

  // ── QUALIFY · BUDGET (BANT) ──────────────────────────────────────────────

  qualify_budget: {
    id: 'qualify_budget',
    title: 'Qualify · Budget',
    script: "And do you have a budget range in mind for this specific role, or is that something you'd rather work out on the call?",
    waitForAnswer: true,
    tip: "Low-friction budget check (BANT). Either answer banks it — a range, OR 'let's work it out on the call.' Only a flat refusal to engage leaves it unclear. Don't push for a hard number; the point is just to get budget on the record.",
    options: [
      { label: 'Gives a range', next: 'two_meeting', type: 'positive', banks: ['budget'] },
      { label: "Prefers to work it out on the call", next: 'two_meeting', type: 'positive', banks: ['budget'] },
      { label: "Won't engage on budget", next: 'two_meeting', type: 'objection' },
    ],
  },

  obj_wrong_person: {
    id: 'obj_wrong_person',
    title: "Objection: Not the Decision-Maker",
    isObjection: true,
    script: "No worries at all, and thanks for being upfront. Who's usually the one who'd own something like this over there? I'd just hate for the right person to miss it. Happy to reach out myself, or if it's easier you can point me their way and I'll mention we spoke.\n\n(if they'd still be in on the decision: honestly, then it's still worth your while, we can just get both of you on the same call.)",
    tip: "Always get a name before you hang up — a warm referral converts far faster than a cold dial. If they'll still be in the room when the decision is made, you can carry on; just get the other decision-maker onto the same invite. ANALYZER: authority is a flag, not an instant kill — clear it by getting the real sign-off person onto the invite or confirmed as attending.",
    options: [
      { label: 'Gives a name / warm intro', next: 'end_callback', type: 'positive', banks: ['authority'] },
      { label: "They're still in the room for the decision", next: 'qualify_budget', type: 'positive', banks: ['decision_maker', 'authority'] },
      { label: 'Hard no', next: 'end_not_interested', type: 'end', refuses: ['decision_maker'] },
    ],
  },

  // ── NO ROLE — VALUE PITCH + RESEARCH ─────────────────────────────────────

  obj_no_role: {
    id: 'obj_no_role',
    title: "No Role — Value Pitch + Research",
    isObjection: true,
    script: "No worries at all! I actually did a bit of homework on you before I called...\n\n{geminiResearch}",
    tip: "Gap Selling: even without a named role, lead with the cost problem — 'salary costs by {SAVINGS_PCT}' creates instant curiosity. The research insert lets you surface a role for them. A general direction is enough to keep going into the value and offer.",
    options: [
      { label: 'Lead is engaged / curious', next: 'value_offer', type: 'positive' },
      { label: 'Already outsourcing / need to think', next: 'obj_already_outsourcing', type: 'objection' },
      { label: 'Not interested', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── VALUE & OFFER — PRE-EMPT PRICE + OFFSHORE (v5 FIX #5) ─────────────────

  value_offer: {
    id: 'value_offer',
    title: 'Value & Offer + CTA',
    script: "Perfect, that's exactly the kind of role they fill all the time, so I'll skip the sales pitch and get straight to it.\n\nHere's how it works. I connect you with the right BPO partners, we've got more than 80 BPO partners in our network, and based on what you've shared I'll pick the two that fit your industry and this role.\n\nOn the call they'll go through what this role actually costs offshore, how the team gets managed day to day, and who owns performance and retention. That's the part you can't get over email.\n\nIf it's not a fit, that's completely fine, no obligation either way.\n\nThe call takes about {MEETING_ONE}. If I can be honest, can we do this on Wed or Thursday if you're busy on Mondays and Tuesdays?",
    waitForAnswer: true,
    tip: "The value + offer CTA, fired right after they name the role. Skip the pitch — frame the mechanics: you pick two of 80+ BPO partners for their industry and role, and the call covers what the role costs offshore, how the team is managed day to day, and who owns performance and retention, the things email cannot answer. Zero obligation, {MEETING_LENGTH}. Then go for a specific day (offer Wed/Thu). Note any date they float and proceed into the must-knows — you'll firm up attendance at the recap. ANALYZER: capture 'yes, open to offshore' in their own voice at the offshore gate or the recap for Gate 2 to count.",
    options: [
      { label: 'Engages / floats a day', next: 'qualify_fulltime', type: 'positive', banks: ['offshorable'], buyingSignal: true },
      { label: 'Open / has questions', next: 'qualify_fulltime', type: 'positive', banks: ['offshorable'], buyingSignal: true },
      { label: 'Pushes back on price', next: 'obj_budget', type: 'objection' },
      { label: 'Not interested', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  obj_offshore: {
    id: 'obj_offshore',
    title: 'Objection: Prefers Local / Unsure on Offshore',
    isObjection: true,
    script: "Totally fair, honestly most people feel that way until they actually see it. Every partner we work with is already vetted, and you'd get to look through real profiles before committing to anyone, so you're never going in blind. And on the language side, English is an official business language in the Philippines, and a lot of these partners work almost entirely with US, UK and Aussie companies, so it's genuinely built for your market. Would it be worth just seeing a few profiles and the pricing side by side before you make any call on it?",
    waitForAnswer: true,
    tip: "Offshore is raised on 93% of calls — handle it as a normal step, not a crisis. Lead with the profile preview (they're not hiring blind) and the English / market-fit proof. Your goal is just to get a yes to SEE the comparison. ANALYZER: Gate 2 needs a spoken 'yes, open to offshore' / 'the Philippines is fine.' A hard 'must be local / on-site only' kills it — if the role is genuinely physically on-site, disqualify honestly rather than force it.",
    options: [
      { label: 'Open to seeing it', next: 'qualify_timeline', type: 'positive', banks: ['offshore'] },
      { label: 'Genuinely needs someone on-site', next: 'obj_need_inoffice', type: 'objection' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end', refuses: ['offshore'] },
    ],
  },

  // ── TWO-MEETING EXPLAINER (say before the calendar ask, every call) ───────

  two_meeting: {
    id: 'two_meeting',
    title: 'Two-Meeting Explainer',
    script: "So here's how it'll work, two quick back-to-back sessions, {MEETING_LENGTH}, with a different partner on each. Slightly different pricing and approach, so you get a proper apples-to-apples comparison in one sitting instead of chasing it all down yourself.",
    tip: "Say the two-meeting explainer BEFORE the calendar ask, every call — it pre-empts the 'why two meetings?' objection that hit 5 of 18 scripts. 'Apples to apples, {MEETING_LENGTH}' is the cleanest framing. Then go straight into the trial close.",
    options: [
      { label: 'Makes sense', next: 'close_recap', type: 'positive' },
      { label: '"Why two meetings? / just one?"', next: 'obj_two_meetings', type: 'objection' },
    ],
  },

  obj_two_meetings: {
    id: 'obj_two_meetings',
    title: 'Objection: Why Two Meetings?',
    isObjection: true,
    script: "Yeah, good question. So we're a marketplace, not just one agency, so I line you up with two partners back to back. Each one shows you their pricing approach and how they'd actually run the role, and they go about it a little differently, so you basically get an apples-to-apples comparison in one sitting instead of chasing it all down yourself. It's meant to save you time, not eat more of it.",
    tip: "Approved pattern (Mickey / Jamar, Seashell Group): 'Oh, for comparison — that makes sense.' Frame the second partner as more choice, not more work. Don't lose the booking over it — if they insist on one, accommodate and keep moving.",
    options: [
      { label: 'Understood — open to it', next: 'close_recap', type: 'positive' },
      { label: 'Still only wants one', next: 'close_recap', type: 'positive' },
    ],
  },

  // ── RECAP + COMMITMENT — CAPTURE ALL 4 CRITERIA (v5 FIX #3) ──────────────

  close_recap: {
    id: 'close_recap',
    title: 'Recap + What They Want From It',
    script: "Quick recap so we're on the same page: discovery call locked in with two of our partners, full-time dedicated offshore hire for {role}, and you said {statedTimelineVerbatim}. Okay?\n\nOut of those two calls, what's the main thing you'd want to walk away knowing?",
    waitForAnswer: true,
    recordField: {
      key: 'dcObjective',
      label: "What they want out of the call, in their words (goes to the partner brief)",
      placeholder: 'e.g. "whether we can actually get a senior dev for that money"',
    },
    tip: "THE RECAP IS THE RECORD — this is what the analyzer reads, so read their timeframe back in THEIR words, not a window you would prefer. Then ask what they want out of the call and write it down. That answer predicts attendance far better than a yes to a commitment question, which is a compliance answer anyone gives. It also goes to the partner, who can then open on the thing the lead actually came for. Wait for an audible yes on the recap; a nod is not evidence on the recording.",
    options: [
      { label: 'Confirms, and says what they want from it', next: 'close_authority', type: 'positive', elaborated: true, buyingSignal: true },
      { label: 'Confirms, but nothing specific they want', next: 'close_authority', type: 'positive', passiveRisk: true },
      { label: 'Timeline is 3+ months / no firm date', next: 'obj_timeline_far', type: 'objection' },
      { label: 'Not sure / wants to think', next: 'obj_think_about_it', type: 'objection' },
    ],
  },

  // ── QUALIFY — PART-TIME REBUTTAL (WE PLACE FULL-TIME ONLY) ────────────────

  obj_parttime: {
    id: 'obj_parttime',
    title: 'Qualify: Part-Time Rebuttal',
    isObjection: true,
    script: "Yeah, I get wanting to dip a toe in first. Here's the thing though, because the rates come in {SAVINGS_CLAIM}, a lot of folks end up getting a dedicated full-time person for what they'd have spent on part-time help locally. It's a full 40-hour week over there, so you're getting all eight hours a day and still saving. If the numbers actually stacked up, would you be open to just keeping it as a full-time seat?",
    waitForAnswer: true,
    tip: "We only place full-time, dedicated talent — part-time/project reads as a non-dedicated (disqualified) lead. Approved reframe (Summer / Jimmy): 'eight hours paid anyway, you still save.' Convert to a full-time yes; if they'll only ever do part-time, they don't qualify. ANALYZER: Gate 3 needs 'full-time, dedicated, just for me' from the buyer's mouth — 'shared / project / a few hours' kills it.",
    options: [
      { label: 'Open to a full-time seat', next: 'qualify_volume', type: 'positive', banks: ['full_time'] },
      { label: 'Still only wants part-time', next: 'obj_not_interested_late', type: 'objection', refuses: ['full_time'] },
    ],
  },

  // ── QUALIFY — PULL TIMELINE INTO THE 1–2 MONTH WINDOW ────────────────────

  obj_timeline_far: {
    id: 'obj_timeline_far',
    title: 'Timeline 3+ Months (AQPC)',
    isObjection: true,
    script: "I completely understand, you've got your standards, and honestly I'm right there with you.\n\nCan I ask, is it the skills, the experience, the culture fit, or the pricing?\n\nWhatever it is, that's exactly what gets expounded and explained on the discovery call, and that's the whole reason we're setting up this free consultative meeting for you.\n\n(processing the invitation now...) So is that {MEETING_ONE} worth having, or is offshore not really on the table right now?",
    waitForAnswer: true,
    tip: "AQPC: Acknowledge their standards, Question to surface the real concern (skills, experience, culture fit, or pricing), Pivot to the discovery call as where it all gets answered, then close by giving them permission to say no, which is what makes the yes mean anything. A '3+ months' stall is usually a smokescreen for one of those four — surface it, then drive straight back to the meeting.",
    options: [
      { label: "Yes — I'll be there", next: 'end_booked', type: 'positive', banks: ['dc_agreed'] },
      { label: 'Still not ready / firmly 3+ months', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── QUALIFY — DECISION-MAKER (BRING THEM IN) ─────────────────────────────

  obj_authority_late: {
    id: 'obj_authority_late',
    title: 'Qualify: Decision-Maker (Bring Them In)',
    isObjection: true,
    script: "Yeah, of course, a call like this usually isn't a one-person decision anyway. Easiest thing is to just have your partner or co-founder hop on with you, that way you both hear the same thing at the same time and nothing gets lost in the retelling. Want me to add them to the invite too?",
    waitForAnswer: true,
    tip: "QA accepts a collaborative decision as long as the lead confirms they're IN the final decision. Get the other decision-maker onto the SAME invite rather than losing the booking — 'when you decide together, nothing's lost in translation.'",
    options: [
      { label: "They'll bring the other decision-maker", next: 'end_booked', type: 'positive', banks: ['decision_maker', 'authority', 'dc_agreed'] },
      { label: "They're in the room anyway", next: 'end_booked', type: 'positive', banks: ['decision_maker', 'authority', 'dc_agreed'] },
      { label: 'Not a decider / hard stall', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── VALUE PROP (used by objection recoveries) ────────────────────────────

  value_prop: {
    id: 'value_prop',
    title: 'Value Prop + Research',
    script: "Perfect — and that's exactly the scenario we help with every day.\n\nHere's what most business leaders don't realize: the roles they're hiring locally are available at world-class quality offshore — dedicated, full-time staff — at {SAVINGS_CLAIM}. Not freelancers, not shared resources. One person, fully committed to your business, your hours, your systems.\n\nAnd before I called, I did some research on your company specifically...\n\n{geminiResearch}",
    tip: "Gap Selling: tie this to what they shared. 'You mentioned hiring [role] takes time and costs are high — here's what that looks like differently.' Do NOT convert their local salary into an offshore figure, and do not quote a rate. Pricing is the partner's to do against the real spec, and a number said here becomes the anchor they have to negotiate against. Our own market claim is the only figure we give. Then go to the offer.",
    options: [
      { label: 'Lead is engaged / curious', next: 'two_meeting', type: 'positive' },
      { label: 'Already outsourcing / need to think', next: 'obj_already_outsourcing', type: 'objection' },
      { label: 'Not interested / budget', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── END STATES ───────────────────────────────────────────────────────────

  close_authority: {
    id: 'close_authority',
    topic: 'decision',
    title: 'Who Signs It Off',
    script: "And is it just you signing this off, or is someone else in on the decision?",
    waitForAnswer: true,
    recordField: {
      key: 'signOffOwner',
      label: 'Who signs off (goes to the partner brief)',
      placeholder: 'e.g. "just me" / "me and my co-founder Dana"',
    },
    tip: "Asked here, before the calendar goes in, rather than discovered at the meeting. A second name is not a problem, it is a person to invite: get it now and the partner walks in knowing who is in the room. This is also the one commitment ask left in the close, so do not stack another on top of it.",
    options: [
      { label: 'Just them', next: 'end_booked', type: 'positive', banks: ['dc_agreed', 'decision_maker', 'authority'], elaborated: true },
      { label: 'Names someone else, happy to bring them', next: 'end_booked', type: 'positive', banks: ['dc_agreed', 'authority'], elaborated: true },
      { label: 'Has to check with someone first', next: 'obj_authority_late', type: 'objection' },
    ],
  },

  end_booked: {
    id: 'end_booked',
    title: 'Booked!',
    script: "Done — sending the invite now. Go ahead and accept it when it lands so your spot's locked in. Looking forward to it, {leadName} — talk soon!",
    isEnd: true,
    tip: "Close warm and specific — confirm the invite is on its way and they should accept it to lock the spot. Reference the exact role and day so it feels real. ANALYZER: a booked call is only as good as its qualification — make sure the recap captured offshore, full-time and the 1-2 month window in their own words.",
    options: [],
  },
  end_callback: {
    id: 'end_callback',
    title: 'Callback Scheduled',
    script: "Perfect — I'll reach out then. Have a great day, {leadName}!",
    isEnd: true,
    options: [],
  },
  end_not_interested: {
    id: 'end_not_interested',
    title: 'Call Ended',
    script: "Totally understood — I appreciate your time, {leadName}. If things ever change, feel free to reach out. Have a great day!",
    isEnd: true,
    options: [],
  },

  // ── COMMON OBJECTION HANDLERS ─────────────────────────────────────────────

  obj_timing: {
    id: 'obj_timing',
    title: 'Objection: Busy Right Now',
    script: "No worries at all, give me 30 seconds and if it's not relevant I'll happily let you go.\n\nSo I'm {yourName} over at Outsource Accelerator, we basically help businesses cut hiring costs by {SAVINGS_PCT} using really strong offshore talent.\n\nJust curious, for any of your hiring, do you do it in-house or do you work with external partners for anything?",
    isObjection: true,
    tip: "7.5% of all objections and one of the few that CONVERTS WELL. Offer a binary: fifteen seconds now, or a specific slot. Then confirm the callback like a real appointment, because a vague 'call me sometime' is a dead lead. Do not keep pitching after 'gotta go'. Real win: 'I'll cut to it, just one question' then one sharp value question, booked [Gabriel]. For 'who are you' use the identity handler instead, it is a different move.",
    options: [
      { label: 'Yes, go ahead / give me a better time', next: 'pitch_q1', type: 'positive' },
      { label: 'Not interested', next: 'obj_not_interested_opening', type: 'objection' },
    ],
  },

  obj_not_interested_opening: {
    id: 'obj_not_interested_opening',
    title: 'Objection: Not Interested (Opening)',
    script: "That's completely fair, and I appreciate you being straight with me.\n\nCan I ask, is it more that you're happy with how you hire already, or is it just not really a priority right now?\n\nOnly reason I ask is most people say the exact same thing at first, right up until they see how much they've been quietly overpaying on talent. I'm not asking you to change a thing, just give me 30 seconds to see if the numbers even make sense for you.",
    isObjection: true,
    tip: "Psychology of Selling — Law of Indirect Effort: don't push harder, pull back. 'I'm not asking you to change anything' removes the threat. Curiosity is your goal — not persuasion. If they're still a hard no after this, let them go with grace.",
    options: [
      { label: "They're curious / it's timing", next: 'pitch_q1', type: 'positive' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_not_interested_pitch: {
    id: 'obj_not_interested_pitch',
    title: 'Objection: Not Interested (After Pitch)',
    script: "Totally understand — and I'd rather find out now than waste your time.\n\nCan I ask what's driving that — is it more about the cost, the process, or have you tried offshore talent before and it didn't go the way you hoped?\n\nDepending on your situation, we might approach this completely differently — and I'd hate to lose you if we're actually the right fit.",
    isObjection: true,
    tip: "Diagnose before you defend. The three paths are different conversations: budget concern → obj_budget, tried before → obj_tried_before, just not a priority → find out when it would be and set a callback. Don't defend OA until you know what you're defending against.",
    options: [
      { label: 'Cost / budget concern', next: 'obj_budget', type: 'objection' },
      { label: 'Tried offshore before', next: 'obj_tried_before', type: 'objection' },
      { label: "They're open again / other", next: 'qualify_role', type: 'positive' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_not_hiring: {
    id: 'obj_not_hiring',
    title: "Objection: Not Hiring Right Now",
    script: "Totally fair, you might not be hiring this exact minute and that's completely fine, I'm not trying to fill a seat this week. Honestly I'd just love to be a resource for you.\n\nJust out of curiosity, what kind of roles do you usually bring on when you do add people? Even on the sales side?\n\n(once they name one) And if the right person was ready to go, could you see bringing them on in the next month or two?",
    isObjection: true,
    tip: "Approved (Ben / Mark, Frame Homes): probe for a specific role — Ben's 'even in sales side?' probe is what flipped Mark from 'no point' to a booking. Then nudge toward the next month or two so you're not anchoring them far out. ANALYZER: 'not hiring' is almost never a true no — read it as 'not right now.' The win is a named role plus an explicit 'one to two months' in their words; don't book on 'sometime,' and don't manufacture a role that isn't there.",
    options: [
      { label: 'They share a role / plan', next: 'qualify_fulltime', type: 'positive', banks: ['offshorable'] },
      { label: 'Not sure / nothing obvious yet', next: 'obj_not_hiring_probe', type: 'objection' },
      { label: 'Genuinely nothing planned', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_not_hiring_probe: {
    id: 'obj_not_hiring_probe',
    title: 'Not Hiring — Rescue Probe',
    isObjection: true,
    script: "No worries at all. Let me ask it a different way — when things do get busy, where does the squeeze usually hit first? Admin piling up, sales follow-ups slipping, support backing up?",
    waitForAnswer: true,
    tip: "The rescue probe — 'not hiring' is almost never a true never. Surface the task that keeps slipping; that's the role hiding in plain sight, and it gives you a real, near-term reason. If something lands, run it into the must-knows. If it's genuinely nothing, let them go clean — never force a role that isn't there (a manufactured lead flags and no-shows).",
    options: [
      { label: 'They name a pain / task', next: 'qualify_fulltime', type: 'positive', banks: ['offshorable'] },
      { label: 'Genuinely nothing', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_budget: {
    id: 'obj_budget',
    title: 'Objection: Budget / Cost / Rates',
    script: "I hear you, and honestly that's the whole reason I'm calling, we're not adding to your costs, we're cutting them.\n\nHonest answer, I'm not going to quote you a rate, because the partners price against your actual spec and I'd rather you got a real number than a wrong one from me. What I can tell you is they typically come in {SAVINGS_CLAIM}. Getting the exact figure for your role is the main thing that call is for. Fair enough?",
    isObjection: true,
    tip: "The $3-$9/hr range is a verbatim approved line (Vince / Paul, 465 Office) — use it, convert for UK/EU (£2.25–£7.65). Never fully deflect pricing. Then quantify the gap in dollars, not percentages: '$100K a year back' beats '{SAVINGS_PCT} savings.'",
    options: [
      { label: "They're open to hearing the numbers", next: 'two_meeting', type: 'positive' },
      { label: 'Still not interested', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_doing_fine: {
    id: 'obj_doing_fine',
    title: "Objection: Team is Doing Fine",
    script: "Good to hear, and I'm not calling to change anything you've got going. I'd honestly just like to be a resource for you on the salary-cost side, since most of our partners come in {SAVINGS_CLAIM}. It's all laid out on a free call, how the model actually works and what the real cost comparison looks like for your roles, so it's worth {MEETING_ONE} just to have that number on file.\n\nQuick one though, when a key role opens up, what's the bigger headache for you, the time it takes, the cost, or actually finding the right skill set?",
    isObjection: true,
    tip: "Approved reframe (Carl / David, UBC Digital): 'strategic resource, not replacement' — the single most effective line in the approved set, use it verbatim. Challenge the status quo gently: 'doing fine' is not the same as 'doing it optimally.' Then get them to name their friction point.",
    options: [
      { label: 'They mention a challenge (time / cost / skill)', next: 'qualify_role', type: 'positive' },
      { label: 'Genuinely no challenges', next: 'obj_no_challenges', type: 'objection' },
    ],
  },

  obj_no_challenges: {
    id: 'obj_no_challenges',
    title: 'Objection: No Hiring Challenges',
    script: "That's genuinely impressive, sounds like you've built a really solid team and setup.\n\nI'd still love to show you what we do, even just as a benchmarking thing. Whether or not you ever change anything, seeing a real cost comparison for your roles takes {MEETING_ONE} and you walk away with useful data either way.\n\nZero commitment. Worth a quick look?",
    isObjection: true,
    tip: "Reciprocity: frame the consultation as giving them something useful regardless of outcome — real salary benchmarking data. Lower the stakes: 'even if you don't change anything, you'll know your number.'",
    options: [
      { label: "They're open to it", next: 'close_recap', type: 'positive' },
      { label: 'Not relevant / hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_no_external: {
    id: 'obj_no_external',
    title: "Objection: Don't Hire Externally",
    script: "Totally makes sense — a lot of leaders feel the same way initially.\n\nLet me ask it differently: if the quality was identical or better, and the cost was {SAVINGS_PCT} lower than what you're paying now — would that change the conversation at all?\n\nBecause that's the actual scenario for most of the roles we place. What kind of role would you consider if the savings were significant enough to make it worth looking at?",
    isObjection: true,
    tip: "Gap Selling: 'we don't hire externally' is a current state, not a final answer. The hypothetical — 'if quality was the same at {SAVINGS_PCT} less' — is a Need-Payoff question that opens the door. Get them to name a role they'd consider. That's the gap.",
    options: [
      { label: 'They mention a role to consider', next: 'value_prop', type: 'positive' },
      { label: 'Not open to it', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_already_outsourcing: {
    id: 'obj_already_outsourcing',
    title: 'Objection: Already Outsourcing / Need to Think',
    script: "Oh nice, so you already know the model works, that's half the battle. Can I ask though, are you actually happy with both the quality AND the cost right now, or is there a bit of room on either one?\n\nHonestly most people who come to us were already outsourcing, they just found our partners had better talent for less. It's a quick benchmarking call, no strings, and in {MEETING_ONE} you'll know if there's an upgrade worth having. Is there a role that's been tougher to fill or pricier than you'd like?",
    isObjection: true,
    tip: "Smart Calling: they're already sold on the concept — the hard part's done. Make them curious whether their setup is optimal. 'Happy with both quality AND cost?' is a double-gate — most people are happy with one but not both. This is a warm prospect, not a dead one.",
    options: [
      { label: "They're open to a comparison call", next: 'close_recap', type: 'positive' },
      { label: 'Happy with current setup / not interested', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_not_interested_late: {
    id: 'obj_not_interested_late',
    title: 'Objection: Not Interested (Late Stage)',
    script: "That's completely fair, and I appreciate you giving me the time.\n\nCan I just ask, is it more that the timing's off right now, or is it genuinely not something you'd ever look at?\n\nOnly reason I ask, if it's timing, I'd much rather circle back when it actually suits you than push it now.",
    isObjection: true,
    tip: "Separate timing from a hard no — they have very different follow-up paths. A timing issue is a future pipeline entry; a hard no is a closed door. Don't chase a hard no. Do lock a specific callback date if it's timing: 'When would be the right time — Q3, end of year?' ANALYZER: if a lead genuinely fails a gate, that's an honest disqualification — set a callback, don't manufacture a yes or lean on an override. A faked pass becomes a no-show and flags anyway.",
    options: [
      { label: 'Timing issue — set a callback', next: 'end_callback', type: 'positive' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_think_about_it: {
    id: 'obj_think_about_it',
    title: 'Objection: Need to Think About It',
    script: "Of course, totally respect that. Can I ask what specifically you'd want to chew on? Is it the timing, whether it's the right fit, or something else?\n\nReason I ask is the partners actually answer most of that on the call itself, what the role really costs offshore, how the team gets managed, who owns performance. It's {MEETING_ONE} of straight info, not a pitch, and you walk away with something useful whether you go ahead or not.\n\nWould [Tuesday] or [Thursday] this week work just to get that in front of you?",
    isObjection: true,
    tip: "Schiffman + SPIN: diagnose what they're thinking about before re-pitching. Then reframe the consultation as information-gathering, not a sales meeting — 'it answers the questions you're thinking through.' Offer two specific days. Then capture the 4 criteria at the close. ANALYZER: 'I'll do my best / I'll try' is a show-up flag — pin a specific day and time and get a clean 'yes, I'll be on.'",
    options: [
      { label: 'Yes, books a time', next: 'close_recap', type: 'positive', banks: ['dc_agreed'] },
      { label: 'Wants a follow-up / not ready yet', next: 'end_callback', type: 'positive' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  // ── OFFSHORE-SPECIFIC OBJECTION HANDLERS ─────────────────────────────────

  obj_quality: {
    id: 'obj_quality',
    title: "Objection: Quality Won't Be as Good",
    script: "Yeah, that's easily the most common thing I hear, and it's a fair one to raise.\n\nEvery partner gets vetted properly, skills testing, client references, compliance checks, the lot. And you get to look through real profiles before you agree to anyone, so you're never hiring blind. If you're not confident once you've seen them, you simply don't move forward.\n\nCan I ask though, what does 'quality' actually mean for your role? Is it the technical skill, the communication, reliability, speed? Once I know what you're measuring against, I'll tell you straight whether we can hit it, and if we can't, I'll say so.",
    isObjection: true,
    tip: "The profile preview is your strongest quality proof point — lead with it (you're not hiring blind). SPIN — Problem Question: 'What does quality mean for this role?' gets them to define their own standard, which you can then address specifically or agree it's not a fit.",
    options: [
      { label: 'They define their standard — sounds achievable', next: 'close_recap', type: 'positive' },
      { label: 'Still unconvinced / hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_language: {
    id: 'obj_language',
    title: 'Objection: Language / Communication Barrier',
    script: "Yeah, really common assumption, and honestly it surprises most people once they see it firsthand.\n\nWe only put forward people who've already passed language and communication screening. The Philippines is actually the third-largest English-speaking country in the world, it's an official business language there, used every day, and a lot of our partners work almost exclusively with US, UK and Aussie clients.\n\nIs the worry more about internal team chat, or is this a customer-facing role? If it's customer-facing, we'd point you at partners who specialise in exactly that and have the track record to back it.",
    isObjection: true,
    tip: "Answer with a fact that surprises — 'third-largest English-speaking country' lands because they didn't expect it. Pair it with a specific example: 'a lot of clients say their offshore team communicates better in writing than some local hires.' Then narrow the concern: internal vs customer-facing.",
    options: [
      { label: "They're reassured / want to explore", next: 'close_recap', type: 'positive' },
      { label: 'Still a concern — not convinced', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_timezone: {
    id: 'obj_timezone',
    title: 'Objection: Time Zone Issues',
    script: "Time zones are a real thing, you're right to bring it up.\n\nCouple of things that tend to work in practice though: most of the staff over there actually choose to work US hours, they're used to it and a lot of them prefer it. And for the more process-driven roles, plenty of clients find the async gap actually boosts output, fewer interruptions during their own day.\n\nWhat does the day-to-day look like for this role, is it constant back-and-forth, or more task and output based?",
    isObjection: true,
    tip: "Diagnose before defending. Real-time vs async are completely different scenarios. Task-based roles (finance, admin, design, dev) work excellently async. High-communication roles need a different conversation about US-hours partners. Ask first.",
    options: [
      { label: "Mostly task-based / they're open to it", next: 'close_recap', type: 'positive' },
      { label: 'Needs constant real-time — not open', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_tried_before: {
    id: 'obj_tried_before',
    title: 'Objection: Tried Outsourcing Before',
    script: "I'm actually really glad you told me that, it genuinely changes how I'd go about this with you.\n\nCan I ask what went sideways? Was it the talent itself, the communication with the agency, the management overhead, or something else?\n\n[Listen, then:] Yeah, what you're describing is nearly always a sourcing problem, unvetted agencies just handing you whoever's free instead of whoever's right. We vet every partner up front and you compare two of them side by side before you commit to anything. Would it be worth {MEETING_ONE} to see how we'd handle your situation differently, and you take it from there?",
    isObjection: true,
    tip: "'Tried before' is your best lead — they've validated the concept, they just had a bad experience. Diagnose what broke, then differentiate OA's vetting model as the specific fix. Listen more than you talk in this one.",
    options: [
      { label: "They're open to trying again", next: 'close_recap', type: 'positive' },
      { label: 'Not willing to try again', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_confidential: {
    id: 'obj_confidential',
    title: 'Objection: Work Too Sensitive / Confidential',
    script: "Completely understandable, and it's something we take seriously too.\n\nEvery partner works under strict NDAs and proper data-security protocols. The person works on your systems, follows your processes, under your security policies, so in practice they're basically a dedicated employee, they just happen to be employed through the local partner.\n\nWhat's the sensitive bit specifically, is it customer data, your IP, financial info? Depending on which, there are partners who specialise in exactly that kind of compliance.",
    isObjection: true,
    tip: "Narrow the concern — 'confidential' means different things. Customer data (SOC2 partners), IP (NDA-first workflows), financial data (finance-specialist partners) all have different solutions. The specific answer tells you which partner to match them with.",
    options: [
      { label: "They're reassured / want to explore", next: 'close_recap', type: 'positive' },
      { label: 'Needs more info — set a follow-up', next: 'end_callback', type: 'positive' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_need_inoffice: {
    id: 'obj_need_inoffice',
    title: 'Objection: Need Someone In-Office',
    script: "That's fair, can I ask what actually needs to happen in the office? Is it a hands-on physical task, more of a management preference, or a genuine on-site requirement?\n\nA lot of clients felt exactly the same before they tried it. Managing someone remote is a different muscle, it needs clear SOPs and a bit of rhythm, and our partners actually help you set all that up in the first 30 days.\n\nWould it shift things for you if you had proper onboarding support built specifically around managing the role remotely?",
    isObjection: true,
    tip: "SPIN — Situation Question: 'What specifically needs to happen in-office?' often reveals it's a management preference, not a genuine physical requirement. Most roles that 'need' to be in-office don't. Get them to describe the actual task — then test it.",
    options: [
      { label: "It's a preference — they're open to exploring", next: 'two_meeting', type: 'positive' },
      { label: 'Genuinely requires physical presence', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_how_manage: {
    id: 'obj_how_manage',
    title: 'Objection: How Do I Manage Someone Overseas?',
    script: "Yeah, that's one of the most common questions, and it's exactly the kind of thing the partners walk you through on the call.\n\nThey take you through the whole setup, onboarding, what tools to use, how performance gets managed, and what happens if something goes wrong. Most people say it's way simpler than they expected, once the first 30 days are sorted it honestly runs like managing any remote employee.\n\nHave you managed anyone remote before, even locally?",
    isObjection: true,
    tip: "Fear of the unknown is the real objection. Reduce it by making the process visible and simple. If they've managed remote workers before — even locally — draw the parallel. The consultation is where this fear dissolves, so get them there.",
    options: [
      { label: "Yes / they're reassured — open to a call", next: 'close_recap', type: 'positive' },
      { label: 'No remote experience / still unsure', next: 'end_callback', type: 'positive' },
    ],
  },

  obj_legal: {
    id: 'obj_legal',
    title: 'Objection: Is This Even Legal?',
    script: "Great question, and the short answer is yes, it's completely legal and honestly really common.\n\nHere's how it works: the person is employed by our local partner in their country, not directly by you. You're just entering a service contract with a registered business. So no payroll-tax headaches on your side, no visas, no local employment-law tangles, the partner takes care of all of that.\n\nDoes that clear it up, or is there a specific legal angle you'd want your team to look at first?",
    isObjection: true,
    tip: "Answer directly and confidently — hesitation on legal questions destroys trust. The structure is simple: service contract, not employment. If they have a legal team to consult, offer to send information and set a follow-up. That's a slower yes, not a no.",
    options: [
      { label: "They're reassured — open to a call", next: 'close_recap', type: 'positive' },
      { label: 'Need legal review first — set follow-up', next: 'end_callback', type: 'positive' },
    ],
  },
  /*
   * The seven handlers below come from the corpus catalogue: 166,694 outbound calls, 115,526
   * carrying a coded objection. Four are codes the classifier does not separate at all yet
   * (not-relevant, anti-cold-call, solo-operator, replaced-by-AI); the rest were in the data
   * with no handler on the floor. Frequency and the real win sit in each tip.
   *
   * They all end on the same ask, because that is what the catalogue found the winners do:
   * acknowledge, reframe, then ask for the two free calls.
   */

  obj_who_are_you: {
    id: 'obj_who_are_you',
    title: 'Objection: Who Are You? / Why Are You Calling?',
    script: "Fair question. I'm {yourName} at Outsource Accelerator, we're an outsourcing marketplace.\n\nReason I called: I line up two free calls with hand-picked offshore teams so you can compare what roles actually cost, usually {SAVINGS_PCT} less than local.\n\nCan I ask you one quick question?",
    isObjection: true,
    tip: "8.2% of all objections. Name, reason for calling, one question, all in one breath, then stop. Do NOT recite company history and do not get defensive about where the number came from. Real win: the lead asked 'in plain English, what do you do?' and the answer was 'world's leading marketplace for offshore staffing, think recruitment, but offshore' — booked [Marc Anos]. If they genuinely cannot follow you, that is the line or the accent and not an objection: slow down and re-introduce.",
    options: [
      { label: 'Satisfied / asks a question back', next: 'pitch_q1', type: 'positive' },
      { label: "Couldn't understand me — slow down and re-introduce", next: 'pitch_q1', type: 'positive' },
      { label: 'Not interested', next: 'obj_not_interested_opening', type: 'objection' },
    ],
  },

  obj_not_relevant: {
    id: 'obj_not_relevant',
    title: 'Objection: Not Relevant / Not a Fit',
    script: "Fair, and I might be wrong.\n\nQuick check so I'm not wasting your time: who handles your admin or back-office today?\n\nOften people say it's not a fit, and then one role turns out to be the obvious one. Two free calls, and if it's genuinely not relevant you'll know in {MEETING_ONE}.",
    isObjection: true,
    tip: "A REASONED dismissal rather than a flat no, which makes it softer and far more workable. It is currently buried inside 'not interested' in the data. The whole move is one diagnostic question BEFORE you concede: you cannot know it is not a fit until you know what they do. Do not take a reasoned no at face value.",
    options: [
      { label: 'They name who handles admin / back-office', next: 'qualify_role', type: 'positive', banks: ['company'], elaborated: true },
      { label: 'Still not relevant after the question', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_anti_cold_call: {
    id: 'obj_anti_cold_call',
    title: "Objection: I Don't Take Cold Calls / What Are You Selling?",
    script: "You're right, this is a cold call, and I'll respect that.\n\nI'm not selling anything on this call, I book two free intro calls with vetted teams.\n\nGive me one line and you decide if it's worth {MEETING_ONE}, sound fair?",
    isObjection: true,
    tip: "An objection to the CHANNEL, not to the offer, which makes it completely different from 'not interested' and means it needs honesty rather than a rebuttal. Own that it is a cold call and promise brevity. Never pretend it is not outreach: they already know, and pretending proves the brush-off right.",
    options: [
      { label: 'Go on then / one line', next: 'pitch_q1', type: 'positive' },
      { label: 'Take me off your list', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_send_email: {
    id: 'obj_send_email',
    title: 'Objection: Just Send Me an Email',
    script: "Happy to, and I'll keep it short so it's not another ignored email.\n\nSo I send the right thing: the roles owners like you outsource, or the cost savings?\n\nI'll send it today and hold a tentative slot for the two calls, one click to cancel.",
    isObjection: true,
    tip: "2.4% of objections and the easiest one to lose. Say YES to the email and attach a specific time in the same breath, because just saying 'sure' and hanging up is a dead lead. The question about what to send does double duty: it gets you one qualifying answer before you go. Real win: 'emails get lost, let me send it AND pair it with a ten-minute call so I can show the exact talent and pricing' — booked [Julius Sarmiento].",
    options: [
      { label: 'Gives an answer / accepts the held slot', next: 'qualify_role', type: 'positive' },
      { label: 'Just send it, no slot', next: 'end_callback', type: 'positive' },
    ],
  },

  obj_too_small: {
    id: 'obj_too_small',
    title: "Objection: We're Too Small",
    script: "Actually it's often the opposite. Smaller teams get the most out of it, because one good offshore hire frees you from the admin eating your day.\n\nEven one part-time role counts, and there are no minimums to find out.\n\n{MEETING_ONE}, free, worth a look?",
    isObjection: true,
    tip: "Reframe small as ideal rather than as a disqualifier, and make it clear one part-time seat is enough. Never imply they need to be bigger. Real win: 'how many staff now?' — thirty — 'that's a fit, do you use external partners or all in-house?' — booked [Jezza Jaraula]. If they have literally no staff, that is the solo-operator handler and a different play.",
    options: [
      { label: 'Open to a look', next: 'qualify_role', type: 'positive' },
      { label: 'Genuinely a business of one', next: 'obj_solo_operator', type: 'objection' },
      { label: 'Still no', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_solo_operator: {
    id: 'obj_solo_operator',
    title: "Objection: I'm a One-Man Band / No Staff",
    script: "Totally get it. Most solo owners aren't hiring a team, they get one part-time offshore admin to take the busywork off their plate for a few hundred a month.\n\nWorth {MEETING_ONE} of your time, or genuinely not for you?",
    isObjection: true,
    tip: "A business of ONE is structurally different from a small team and from not-hiring: usually unqualifiable, but a part-time VA genuinely helps a solo owner. Make the single-assistant offer ONCE, and if the answer is still no, thank them and move on. Do not force a team pitch on a business of one, which is why the question gives them the exit.",
    options: [
      { label: 'Curious about the one-VA angle', next: 'qualify_role', type: 'positive' },
      { label: 'Genuinely no need — exit politely', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_replaced_ai: {
    id: 'obj_replaced_ai',
    title: 'Objection: We Use AI Now',
    script: "Smart move, honestly.\n\nAnd most clients pairing AI still keep a human to check the edge cases and handle the relationships, at {SAVINGS_PCT} less.\n\nWorth seeing how others combine both?",
    isObjection: true,
    tip: "New and emerging: small volume today, but it goes straight at what we sell, so flag every one you hear. Yes-AND the AI, never argue against it. Position offshore talent as the human layer AI still needs, and note our people are skilled in AI tools. Real win: 'most of our clients use AI too, they still need a human layer for data verification and relationships; we provide talent skilled in AI tools' — booked [Marc Anos].",
    options: [
      { label: 'Curious about the human + AI mix', next: 'qualify_role', type: 'positive' },
      { label: 'Not interested', next: 'end_not_interested', type: 'end' },
    ],
  },
}

/*
 * Ordered by how often the corpus actually hears them, not for tidiness. The catalogue's
 * headline is that FIVE objections are 62% of everything — not interested, not my decision,
 * who are you, busy, send me an email — and those five plus the opener are where calls are
 * won or lost. So they come first.
 */
export const QUICK_OBJECTIONS: FlowOption[] = [
  { label: 'Not interested', next: 'obj_not_interested_opening', type: 'objection' },
  { label: 'Not my decision / wrong person', next: 'obj_wrong_person', type: 'objection' },
  { label: 'Who are you? / why are you calling?', next: 'obj_who_are_you', type: 'objection' },
  { label: "I'm busy right now", next: 'obj_timing', type: 'objection' },
  { label: 'Just send me an email', next: 'obj_send_email', type: 'objection' },
  { label: 'Not relevant / not a fit', next: 'obj_not_relevant', type: 'objection' },
  { label: "Don't take cold calls / what are you selling?", next: 'obj_anti_cold_call', type: 'objection' },
  { label: 'Budget / what are your rates?', next: 'obj_budget', type: 'objection' },
  { label: 'Already outsourcing', next: 'obj_already_outsourcing', type: 'objection' },
  { label: 'Not hiring right now', next: 'obj_not_hiring', type: 'objection' },
  { label: 'Team is doing fine', next: 'obj_doing_fine', type: 'objection' },
  { label: 'Why two meetings?', next: 'obj_two_meetings', type: 'objection' },
  { label: 'Tried outsourcing before', next: 'obj_tried_before', type: 'objection' },
  { label: "We're too small", next: 'obj_too_small', type: 'objection' },
  { label: 'One-man band / no staff', next: 'obj_solo_operator', type: 'objection' },
  { label: 'We use AI now', next: 'obj_replaced_ai', type: 'objection' },
]

/*
 * FAMILY B. These are not objections and must never be rebutted.
 *
 * This is the catalogue's highest-value finding, and it is a scoring problem before it is a
 * script problem. OBJ_OTHER turns out to be ~92% NOT a sales objection: do-not-call is about
 * half of it, wrong party another 15%, then legal threats, language, defunct businesses,
 * duplicate calls and bad audio. Sitting inside the objection codes, they inflate the
 * "objection-handling failure" rate, which is currently the floor's number one recorded
 * failure cause. A rep cannot rebut a wrong number and must never rebut a DNC.
 *
 * Deliberately NOT flow nodes. A flow node is something you say next; each of these ends the
 * call and triggers an action on the record instead.
 */
export interface Disposition {
  trigger: string
  say: string
  action: string
  /** Share of OBJ_OTHER, where the corpus could measure it. */
  share?: string
}

export const DISPOSITIONS: Disposition[] = [
  {
    trigger: 'Take me off your list',
    say: "Of course, I'll remove you right now. Apologies for the interruption.",
    action: 'Suppress the record. No rebuttal, not even a short one.',
    share: '~49% of OBJ_OTHER',
  },
  {
    trigger: "This is illegal / I'm on the Do Not Call register",
    say: "I'm sorry, I'll make sure you're removed permanently. Apologies again.",
    action: 'Confirm immediate and permanent suppression, then log it for compliance. Never argue about where the number came from.',
    share: '~8%',
  },
  {
    trigger: "Wrong number / wrong person / they've left",
    say: "Sorry to trouble you, I'll get that corrected on our side.",
    action: 'List hygiene: correct or suppress the record. Ask once for the right contact, only if it feels natural.',
    share: '~15%',
  },
  {
    trigger: 'Business closed / owner retired',
    say: 'Thanks for letting me know, I appreciate it.',
    action: 'Suppress the record.',
    share: '~4%',
  },
  {
    trigger: "Can't speak English",
    say: 'No problem at all, let me see if a colleague can call you.',
    action: 'Route to a language-matched rep if there is one, otherwise skip. This is not a rejection.',
    share: '~7%',
  },
  {
    trigger: "You've called before / duplicate call",
    say: "Sorry about that, I'll get the record fixed so it doesn't happen again.",
    action: 'Dialer cadence or dedup fix. Repeat calls are what drive DNC requests and complaints in the first place.',
    share: '~4%',
  },
  {
    trigger: "Voicemail / can't hear you / bad line",
    say: '(nothing to rebut)',
    action: 'A disposition, not an objection: redial per cadence, or flag the line for quality. Most voicemails never reach the objection phase at all.',
    share: '~6%',
  },
]

export const DEEP_OBJECTIONS: FlowOption[] = [
  { label: '"Quality won\'t be as good"', next: 'obj_quality', type: 'objection' },
  { label: '"Language / communication issues"', next: 'obj_language', type: 'objection' },
  { label: '"Time zone difference is a problem"', next: 'obj_timezone', type: 'objection' },
  { label: '"We tried outsourcing before"', next: 'obj_tried_before', type: 'objection' },
  { label: '"Our work is too sensitive"', next: 'obj_confidential', type: 'objection' },
  { label: '"I need someone in the office"', next: 'obj_need_inoffice', type: 'objection' },
  { label: '"Prefer local / unsure on offshore"', next: 'obj_offshore', type: 'objection' },
  { label: '"How do I manage someone overseas?"', next: 'obj_how_manage', type: 'objection' },
  { label: '"Is this even legal?"', next: 'obj_legal', type: 'objection' },
]
