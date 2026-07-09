export interface FlowNode {
  id: string
  title: string
  script: string
  waitForAnswer?: boolean
  tip?: string
  options: FlowOption[]
  isObjection?: boolean
  isEnd?: boolean
}

export interface FlowOption {
  label: string
  next: string
  capture?: Record<string, string>
  type?: 'positive' | 'objection' | 'end'
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

export const flow: Record<string, FlowNode> = {

  // ── OPENING (unchanged — intro stays intact) ─────────────────────────────

  opening: {
    id: 'opening',
    title: 'Opening',
    script: "Hey {leadName}? (Pause)\n\nOh hey uhh, {leadName}, it's {yourName} here over at Outsource Accelerator. I know I called you out of the blue here, mind if I grab half a minute? Then you can let me know if it's relevant or not? (pause)\n\nAppreciate that, yeah remind me uhh, have you heard of Outsource Accelerator just by the off chance?",
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
      { label: 'They answer — back in the conversation', next: 'discovery_q2', type: 'positive' },
      { label: 'Hard no / hung up', next: 'end_not_interested', type: 'end' },
    ],
  },

  // ── PITCH + DISCOVERY Q1 ─────────────────────────────────────────────────

  pitch_q1: {
    id: 'pitch_q1',
    title: 'Value Hook + Discovery Q1',
    script: "No? Oh okay, feel free to cut me off if it's not in your wheelhouse.\n\nSo the reason I'm reaching out — salaries for specialized talent keep climbing, and I work with a team that helps leaders grow their headcount WITHOUT growing the expense. Usually by connecting them with world-class global talent at up to 80% less than local hiring.\n\nJust out of curiosity — for your hiring right now, do you keep everything in-house, or do you ever work with external partners for anything?",
    waitForAnswer: true,
    tip: "The 'feel free to cut me off' line (Schiffman) disarms resistance before it forms. Lead with the industry pain — rising local talent costs — before introducing OA. 'Grow headcount without growing the expense' is the v5 hook. Keep the discovery question binary; don't stack more on top of it.",
    options: [
      { label: 'They answer (in-house / external / mix)', next: 'discovery_q2', type: 'positive' },
      { label: "Not interested / not hiring / budget concern", next: 'obj_not_hiring', type: 'objection' },
    ],
  },

  // ── DISCOVERY Q2 — HIRING FRICTION ───────────────────────────────────────

  discovery_q2: {
    id: 'discovery_q2',
    title: 'Discovery Q2: Hiring Friction',
    script: "Awesome — and how's that working out for you so far, in terms of finding great talents?",
    waitForAnswer: true,
    tip: "SPIN — Implication: if they share any friction, multiply it before moving on. Try: 'When a key role sits open longer than expected, what does that cost you — project delays, the team absorbing extra load, or lost revenue?' Get them to say the cost out loud. A gap they can quantify is a gap worth closing.",
    options: [
      { label: 'They share friction / challenges', next: 'discovery_priority', type: 'positive' },
      { label: 'Team is doing fine / no real issues', next: 'discovery_priority', type: 'positive' },
    ],
  },

  // ── DISCOVERY BRIDGE — WHAT THEY PRIORITIZE (Move 3) ─────────────────────

  discovery_priority: {
    id: 'discovery_priority',
    title: 'Discovery: What They Prioritize',
    script: "Thanks for sharing that. And what type of talent do you usually prioritize when you're bringing people on?",
    waitForAnswer: true,
    tip: "Move 3 bridge question — keep it open and curious, you're just getting them talking about their world. Whatever they name here is the thread you pull into the five must-knows.",
    options: [
      { label: 'They open up about their hiring', next: 'qualify_role', type: 'positive' },
      { label: 'Not really hiring / no priorities', next: 'obj_not_hiring', type: 'objection' },
    ],
  },

  // ── QUALIFY — THE FIVE MUST-KNOWS (Move 4) ───────────────────────────────

  qualify_role: {
    id: 'qualify_role',
    title: 'Qualify ① Role Fit',
    script: "Got it. So if you did add some support, what role would you want to fill first?",
    waitForAnswer: true,
    tip: "Must-Know 1 of 5 (role fit). Frame it hypothetically — 'if you did add support' — so it feels like planning, not pressure. Whatever they name becomes 'that role' for the rest of the call. If they can't name one, pivot to the value pitch with your research.",
    options: [
      { label: 'They name a role', next: 'qualify_fulltime', type: 'positive' },
      { label: "Can't name a role", next: 'obj_no_role', type: 'objection' },
    ],
  },

  qualify_fulltime: {
    id: 'qualify_fulltime',
    title: 'Qualify ② Full-Time',
    script: "Makes sense. And I assume this'd be a full-time position, like thirty to forty hours a week, right?",
    waitForAnswer: true,
    tip: "Must-Know 2 of 5 (full-time). Frame it assumptively as full-time (thirty to forty hours) — don't plant the part-time idea. If they push back to part-time, handle it; don't just roll on.",
    options: [
      { label: 'Full-time / dedicated', next: 'qualify_volume', type: 'positive' },
      { label: 'Part-time / project', next: 'obj_parttime', type: 'objection' },
    ],
  },

  qualify_volume: {
    id: 'qualify_volume',
    title: 'Qualify ③ Volume',
    script: "And how many are we talking, one to start with, or more of a small team?",
    waitForAnswer: true,
    tip: "Must-Know 3 of 5 (volume). A quick sizing question — it tells the partners what to prep and hints at deal size. One is plenty to book; a team is a bonus. Keep it light.",
    options: [
      { label: 'One to start', next: 'qualify_timeline', type: 'positive' },
      { label: 'A small team / a few', next: 'qualify_timeline', type: 'positive' },
    ],
  },

  qualify_timeline: {
    id: 'qualify_timeline',
    title: 'Qualify ④ Timeline',
    script: "And if the right person showed up, would you be looking to bring them on within a few weeks, or more like one to two months?",
    waitForAnswer: true,
    tip: "Must-Know 4 of 5 (timeline). Give them a choice between two in-window options — a few weeks or one to two months — so either answer keeps them inside the qualifying window. If they push further out than that, don't gate it here; you'll firm it up in the recap.",
    options: [
      { label: 'Within a few weeks', next: 'qualify_dm', type: 'positive' },
      { label: 'One to two months', next: 'qualify_dm', type: 'positive' },
      { label: 'More than 2 months / further out', next: 'obj_timeline_disco', type: 'objection' },
    ],
  },

  // ── QUALIFY — TIMELINE PUSHBACK (bring it into the window) ────────────────

  obj_timeline_disco: {
    id: 'obj_timeline_disco',
    title: 'Qualify: Timeline Further Out',
    isObjection: true,
    script: "That's totally okay, I'm not trying to rush you into anything. Honestly, even a couple months out this is really just planning, so you'd have options and names ready for when you actually need them. That said, if someone genuinely great landed in front of you, would you be open to moving in the next month or two rather than sitting on it?",
    waitForAnswer: true,
    tip: "Pull the timeline into the ~1-2 month window so the call qualifies. Approved line (Vince / Kaito): 'Even if it's two months, it's planning.' Don't argue, reframe it as 'options ready when you are.' HARD STOP: if they're firmly 4+ months with no flexibility, they don't qualify — note it and let them go rather than manufacture a false yes.",
    options: [
      { label: 'Open to the next month or two after all', next: 'qualify_dm', type: 'positive' },
      { label: 'Maybe, if the fit is right', next: 'qualify_dm', type: 'positive' },
      { label: 'Firmly 3+ months, no flexibility', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  qualify_dm: {
    id: 'qualify_dm',
    title: 'Qualify ⑤ Decision-Maker',
    script: "Perfect. And are you the one who'd sign off on this, or is there someone else involved in that call?",
    waitForAnswer: true,
    tip: "Must-Know 5 of 5 (decision-maker). 'Are you the one who'd sign off, or is someone else involved?' is clean and doesn't read as interrogation. A collaborative answer still qualifies as long as they're in the room. If it's entirely someone else, get a name.",
    options: [
      { label: 'They sign off / involved in it', next: 'value_offer', type: 'positive' },
      { label: 'Someone else entirely decides', next: 'obj_wrong_person', type: 'objection' },
    ],
  },

  obj_wrong_person: {
    id: 'obj_wrong_person',
    title: "Objection: Not the Decision-Maker",
    isObjection: true,
    script: "No worries at all, and thanks for being upfront. Who's usually the one who'd own something like this over there? I'd just hate for the right person to miss it. Happy to reach out myself, or if it's easier you can point me their way and I'll mention we spoke.\n\n(if they'd still be in on the decision: honestly, then it's still worth your while, we can just get both of you on the same call.)",
    tip: "Always get a name before you hang up — a warm referral converts far faster than a cold dial. If they'll still be in the room when the decision is made, you can carry on; just get the other decision-maker onto the same invite.",
    options: [
      { label: 'Gives a name / warm intro', next: 'end_callback', type: 'positive' },
      { label: "They're still in the room for the decision", next: 'value_offer', type: 'positive' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  // ── NO ROLE — VALUE PITCH + RESEARCH ─────────────────────────────────────

  obj_no_role: {
    id: 'obj_no_role',
    title: "No Role — Value Pitch + Research",
    isObjection: true,
    script: "No worries at all!\n\nThe only reason I ask is we help leaders like you bring down salary costs by up to 80% with really strong global talent, and I actually did a bit of homework on you before I called...\n\n{geminiResearch}",
    tip: "Gap Selling: even without a named role, lead with the cost problem — 'salary costs by up to 80%' creates instant curiosity. The research insert lets you surface a role for them. A general direction is enough to keep going into the value and offer.",
    options: [
      { label: 'Lead is engaged / curious', next: 'value_offer', type: 'positive' },
      { label: 'Already outsourcing / need to think', next: 'obj_already_outsourcing', type: 'objection' },
      { label: 'Not interested', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── VALUE & OFFER — PRE-EMPT PRICE + OFFSHORE (v5 FIX #5) ─────────────────

  value_offer: {
    id: 'value_offer',
    title: 'Value & Offer (Pre-empt Price + Offshore)',
    script: "Perfect, that's honestly the kind of role we place all the time. I work with a couple of partners who specialise in exactly that, and on the call they'll put real CVs and a full pricing breakdown in front of you so you can see the savings for yourself.\n\nAnd just so it's out in the open early, talent in the Philippines usually runs $3 to $9 an hour depending on the role and experience, and the exact number gets pinned down on the call. Quick thing to know, we're a marketplace, not a recruiter, the biggest one in the world for offshore staffing actually, backed by Forbes and Harvard Business Review, with over 4,000 vetted partners. They bring the CVs and the pricing, you just decide.\n\nSo they can line up the right people for you, do you have a particular experience level in mind for that role?",
    waitForAnswer: true,
    tip: "FIX #5 — pre-empt the two universal objections here (price came up on 100% of calls, offshore on 93%) so they never derail the close. The '$3 to $9 an hour' range and 'Forbes and Harvard Business Review, 4,000+ partners' are approved, QA-gold lines — the exact wording that flipped skeptical leads. Capture the experience level to personalise the rest of the call; any answer moves you forward.",
    options: [
      { label: 'Gives an experience level', next: 'two_meeting', type: 'positive' },
      { label: 'Not sure / open to any', next: 'two_meeting', type: 'positive' },
      { label: 'Pushes back on price', next: 'obj_budget', type: 'objection' },
      { label: 'Hesitant on offshore', next: 'obj_offshore', type: 'objection' },
      { label: 'Not interested', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  obj_offshore: {
    id: 'obj_offshore',
    title: 'Objection: Prefers Local / Unsure on Offshore',
    isObjection: true,
    script: "Totally fair, honestly most people feel that way until they actually see it. Every partner we work with is already vetted, and you'd get to look through real profiles before committing to anyone, so you're never going in blind. And on the language side, English is an official business language in the Philippines, and a lot of these partners work almost entirely with US, UK and Aussie companies, so it's genuinely built for your market. Would it be worth just seeing a few profiles and the pricing side by side before you make any call on it?",
    waitForAnswer: true,
    tip: "Offshore is raised on 93% of calls — handle it as a normal step, not a crisis. Lead with the profile preview (they're not hiring blind) and the English / market-fit proof. Your goal is just to get a yes to SEE the comparison.",
    options: [
      { label: 'Open to seeing it', next: 'two_meeting', type: 'positive' },
      { label: 'Genuinely needs someone on-site', next: 'obj_need_inoffice', type: 'objection' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  // ── TWO-MEETING EXPLAINER (say before the calendar ask, every call) ───────

  two_meeting: {
    id: 'two_meeting',
    title: 'Two-Meeting Explainer',
    script: "So here's how it'll work, I'll set you up with two quick back-to-back sessions, each with a different partner, slightly different pricing and approach, so you get a proper apples-to-apples comparison in one 30-minute block instead of having to chase it all down yourself.",
    tip: "Say the two-meeting explainer BEFORE the calendar ask, every call — it pre-empts the 'why two meetings?' objection that hit 5 of 18 scripts. 'Apples to apples, one 30-minute block' is the cleanest framing. Then go straight into the trial close.",
    options: [
      { label: 'Makes sense', next: 'trial_close', type: 'positive' },
      { label: '"Why two meetings? / just one?"', next: 'obj_two_meetings', type: 'objection' },
    ],
  },

  obj_two_meetings: {
    id: 'obj_two_meetings',
    title: 'Objection: Why Two Meetings?',
    isObjection: true,
    script: "Yeah, good question. So we're a marketplace, not just one agency, so I line you up with two partners back to back. Each one shows you their pricing and a few sample CVs, and they go about it a little differently, so you basically get an apples-to-apples comparison in one 30-minute sitting instead of chasing it all down yourself. It's meant to save you time, not eat more of it.",
    tip: "Approved pattern (Mickey / Jamar, Seashell Group): 'Oh, for comparison — that makes sense.' Frame the second partner as more choice, not more work. Don't lose the booking over it — if they insist on one, accommodate and keep moving.",
    options: [
      { label: 'Understood — open to it', next: 'trial_close', type: 'positive' },
      { label: 'Still only wants one', next: 'trial_close', type: 'positive' },
    ],
  },

  // ── TRIAL CLOSE — MANDATORY (v5 FIX #1) ──────────────────────────────────

  trial_close: {
    id: 'trial_close',
    title: 'Trial Close (Mandatory)',
    script: "Honestly, from everything you've told me, this really does sound worth 30 minutes of your time, fair to say?",
    waitForAnswer: true,
    tip: "FIX #1 — the step reps skip. Only 37% of non-booking calls ever attempt next-steps. DO NOT end discovery without this line. Wait for a yes or soft-yes, then book. If they hesitate, handle the ONE objection and re-ask — never skip to goodbye.",
    options: [
      { label: 'Yes / soft yes', next: 'booking', type: 'positive' },
      { label: 'Hesitation / "need to think"', next: 'obj_think_about_it', type: 'objection' },
      { label: 'Not interested', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── BOOKING ──────────────────────────────────────────────────────────────

  booking: {
    id: 'booking',
    title: 'Booking',
    script: "Perfect — let's grab you a time while it's fresh. How does your calendar look over the next couple of days — are you more a morning or an afternoon person?\n\n(they give a day/time — lock a specific 30-minute block and confirm the timezone)\n\nAwesome, I'll get that set up with our sourcing partners.",
    waitForAnswer: true,
    tip: "Schiffman: after the CTA, whoever speaks first loses — stay silent. 'Morning or afternoon?' assumes the yes. Pin a specific date, time AND timezone before you move on. Hold the voucher — it comes at the very end, framed as thanks.",
    options: [
      { label: 'Books a slot', next: 'close_recap', type: 'positive' },
      { label: 'Not sure / need to think', next: 'obj_think_about_it', type: 'objection' },
      { label: 'Not interested', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── TIMELINE CAPTURE & CLOSE — CAPTURE ALL 4 CRITERIA (v5 FIX #3) ─────────

  close_recap: {
    id: 'close_recap',
    title: 'Timeline Capture & Close (4 Criteria)',
    script: "Quick recap so we're on the same page: we've got the discovery call locked in with our sourcing partners, for a full-time, dedicated, offshore hire built right into your team.\n\nAnd realistically, if the talent and the pricing make sense, what's your window for actually bringing someone on?\n\n(let THEM say the number, then repeat their exact words back)\n\nPerfect, so [their exact timeline]. And since you're one of the people who'd make that call, can I count on you to be there on [Day]?",
    waitForAnswer: true,
    tip: "FIX #3 + the Clean-Pass Checklist. Capture all 4 core criteria HERE, in their words, no re-qualifying: (1) open to offshore, (2) full-time dedicated, (3) 1-2 month window, (4) decision-maker in the room. Say 'within the next 1 to 2 months' — NEVER '30-60 days' or '1-3 months.' Let them state the timeline, then mirror it verbatim. If any criterion is fuzzy, tighten it before you hang up — that is what eliminates the QA callback.",
    options: [
      { label: 'Clean — 1-2 months, full-time, offshore, in the room', next: 'end_booked', type: 'positive' },
      { label: 'Timeline is 3+ months / no firm date', next: 'obj_timeline_far', type: 'objection' },
      { label: 'Needs to check with a partner / boss', next: 'obj_authority_late', type: 'objection' },
    ],
  },

  // ── QUALIFY — PART-TIME REBUTTAL (WE PLACE FULL-TIME ONLY) ────────────────

  obj_parttime: {
    id: 'obj_parttime',
    title: 'Qualify: Part-Time Rebuttal',
    isObjection: true,
    script: "Yeah, I get wanting to dip a toe in first. Here's the thing though, because the rates are up to 80% lower, a lot of folks end up getting a dedicated full-time person for what they'd have spent on part-time help locally. It's a full 40-hour week over there, so you're getting all eight hours a day and still saving. If the numbers actually stacked up, would you be open to just keeping it as a full-time seat?",
    waitForAnswer: true,
    tip: "We only place full-time, dedicated talent — part-time/project reads as a non-dedicated (disqualified) lead. Approved reframe (Summer / Jimmy): 'eight hours paid anyway, you still save.' Convert to a full-time yes; if they'll only ever do part-time, they don't qualify.",
    options: [
      { label: 'Open to a full-time seat', next: 'qualify_volume', type: 'positive' },
      { label: 'Still only wants part-time', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── QUALIFY — PULL TIMELINE INTO THE 1–2 MONTH WINDOW ────────────────────

  obj_timeline_far: {
    id: 'obj_timeline_far',
    title: 'Timeline 3+ Months (AQPC)',
    isObjection: true,
    script: "I completely understand, you've got your standards, and honestly I'm right there with you.\n\nCan I ask, is it the skills, the experience, the culture fit, or the pricing?\n\nWhatever it is, that's exactly what gets expounded and explained on the discovery call, and that's the whole reason we're setting up this free consultative meeting for you.\n\n(processing the invitation now...) So can I count on you to attend our meeting?",
    waitForAnswer: true,
    tip: "AQPC: Acknowledge their standards, Question to surface the real concern (skills, experience, culture fit, or pricing), Pivot to the discovery call as where it all gets answered, then Close for attendance. A '3+ months' stall is usually a smokescreen for one of those four — surface it, then drive straight back to the meeting.",
    options: [
      { label: "Yes — I'll be there", next: 'end_booked', type: 'positive' },
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
      { label: "They'll bring the other decision-maker", next: 'end_booked', type: 'positive' },
      { label: "They're in the room anyway", next: 'end_booked', type: 'positive' },
      { label: 'Not a decider / hard stall', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── VALUE PROP (used by objection recoveries) ────────────────────────────

  value_prop: {
    id: 'value_prop',
    title: 'Value Prop + Research',
    script: "Perfect — and that's exactly the scenario we help with every day.\n\nHere's what most business leaders don't realize: the roles they're hiring locally are available at world-class quality offshore — dedicated, full-time staff — at 50 to 80 percent of the cost. Not freelancers, not shared resources. One person, fully committed to your business, your hours, your systems.\n\nAnd before I called, I did some research on your company specifically...\n\n{geminiResearch}",
    tip: "Gap Selling: tie this to what they shared. 'You mentioned hiring [role] takes time and costs are high — here's what that looks like differently.' Make savings concrete: '$60K locally is typically $12–18K offshore; three of those is over $100K a year saved.' Numbers they can picture beat percentages. Then go to the offer.",
    options: [
      { label: 'Lead is engaged / curious', next: 'two_meeting', type: 'positive' },
      { label: 'Already outsourcing / need to think', next: 'obj_already_outsourcing', type: 'objection' },
      { label: 'Not interested / budget', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── END STATES ───────────────────────────────────────────────────────────

  end_booked: {
    id: 'end_booked',
    title: 'Booked!',
    script: "Done — sending the invite now. Once you accept, a $10 Amazon voucher lands as a thank-you for confirming, and the $100 comes right after the call. Looking forward to it, {leadName} — talk soon!",
    isEnd: true,
    tip: "VOUCHER DISCIPLINE (FIX #6): mention it last, framed as thanks — never as the hook. With a skeptical or experienced offshore buyer, drop it entirely. $10 on accept, $100 after the call.",
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
    title: 'Objection: Timing / Who Are You',
    script: "No worries at all, give me 30 seconds and if it's not relevant I'll happily let you go.\n\nSo I'm {yourName} over at Outsource Accelerator, we basically help businesses cut their hiring costs by 50 to 80 percent using really strong offshore talent. Is that even on your radar at the moment?",
    isObjection: true,
    tip: "Smart Calling: answer the 'who are you' cleanly and fast — name, company, one-line value prop. Then re-qualify with a soft question. Don't re-pitch. If they give you 30 seconds, move straight to pitch_q1.",
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
      { label: "They're open again / other", next: 'discovery_q2', type: 'positive' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_not_hiring: {
    id: 'obj_not_hiring',
    title: "Objection: Not Hiring Right Now",
    script: "Totally fair, you might not be hiring right now and that's completely fine. Honestly I'd just love to be on your radar for when you are. In about 30 minutes we'd show you a side-by-side on pricing for any role you might need down the line, so when the time comes you're not starting from zero, you've already got CVs and a cost breakdown in hand.\n\nJust out of curiosity, what kind of roles do you usually bring on when things pick back up? Even on the sales side?",
    isObjection: true,
    tip: "Approved (Ben / Mark, Frame Homes): 'we would love to be part of your hiring evaluation for the near future.' Always probe for a specific role after this — Ben's 'even in sales side?' probe is what flipped Mark from 'no point' to a booking. Once they name a role, go straight into the must-knows (you'll pick up at the full-time question).",
    options: [
      { label: 'They share a role / future plan', next: 'qualify_fulltime', type: 'positive' },
      { label: 'Nothing planned / not relevant', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_budget: {
    id: 'obj_budget',
    title: 'Objection: Budget / Cost / Rates',
    script: "I hear you, and honestly that's the whole reason I'm calling, we're not adding to your costs, we're cutting them.\n\nFor talent in the Philippines you're usually looking at $3 to $9 an hour depending on the role and experience, and for what you mentioned you'd land somewhere in the middle. The exact number we nail down on the call. But to make it real, if you're paying around $60K locally, that same role offshore is often $12 to 18K. Have two or three of those and that's over $100K a year back in your pocket.\n\nWorth 30 minutes just to see the actual numbers for your roles?",
    isObjection: true,
    tip: "The $3-$9/hr range is a verbatim approved line (Vince / Paul, 465 Office) — use it, convert for UK/EU (£2.25–£7.65). Never fully deflect pricing. Then quantify the gap in dollars, not percentages: '$100K a year back' beats '80% savings.'",
    options: [
      { label: "They're open to hearing the numbers", next: 'two_meeting', type: 'positive' },
      { label: 'Still not interested', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_doing_fine: {
    id: 'obj_doing_fine',
    title: "Objection: Team is Doing Fine",
    script: "Good to hear, and I'm not calling to change anything you've got going. I'd honestly just like to be a resource for you on the salary-cost side, since most of our partners come in up to 80% under local hiring. It's all laid out on a free call, pricing and a few CVs, so it's worth 30 minutes just to have that number on file.\n\nQuick one though, when a key role opens up, what's the bigger headache for you, the time it takes, the cost, or actually finding the right skill set?",
    isObjection: true,
    tip: "Approved reframe (Carl / David, UBC Digital): 'strategic resource, not replacement' — the single most effective line in the approved set, use it verbatim. Challenge the status quo gently: 'doing fine' is not the same as 'doing it optimally.' Then get them to name their friction point.",
    options: [
      { label: 'They mention a challenge (time / cost / skill)', next: 'discovery_priority', type: 'positive' },
      { label: 'Genuinely no challenges', next: 'obj_no_challenges', type: 'objection' },
    ],
  },

  obj_no_challenges: {
    id: 'obj_no_challenges',
    title: 'Objection: No Hiring Challenges',
    script: "That's genuinely impressive, sounds like you've built a really solid team and setup.\n\nI'd still love to show you what we do, even just as a benchmarking thing. Whether or not you ever change anything, seeing a real cost comparison for your roles takes about 30 minutes and you walk away with useful data either way.\n\nZero commitment. Worth a quick look?",
    isObjection: true,
    tip: "Reciprocity: frame the consultation as giving them something useful regardless of outcome — real salary benchmarking data. Lower the stakes: 'even if you don't change anything, you'll know your number.' Hold the voucher unless they're wavering — it comes at the end.",
    options: [
      { label: "They're open to it", next: 'booking', type: 'positive' },
      { label: 'Not relevant / hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_no_external: {
    id: 'obj_no_external',
    title: "Objection: Don't Hire Externally",
    script: "Totally makes sense — a lot of leaders feel the same way initially.\n\nLet me ask it differently: if the quality was identical or better, and the cost was 70 to 80 percent lower than what you're paying now — would that change the conversation at all?\n\nBecause that's the actual scenario for most of the roles we place. What kind of role would you consider if the savings were significant enough to make it worth looking at?",
    isObjection: true,
    tip: "Gap Selling: 'we don't hire externally' is a current state, not a final answer. The hypothetical — 'if quality was the same at 80% less' — is a Need-Payoff question that opens the door. Get them to name a role they'd consider. That's the gap.",
    options: [
      { label: 'They mention a role to consider', next: 'value_prop', type: 'positive' },
      { label: 'Not open to it', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_already_outsourcing: {
    id: 'obj_already_outsourcing',
    title: 'Objection: Already Outsourcing / Need to Think',
    script: "Oh nice, so you already know the model works, that's half the battle. Can I ask though, are you actually happy with both the quality AND the cost right now, or is there a bit of room on either one?\n\nHonestly most people who come to us were already outsourcing, they just found our partners had better talent for less. It's a quick benchmarking call, no strings, and in 30 minutes you'll know if there's an upgrade worth having. Is there a role that's been tougher to fill or pricier than you'd like?",
    isObjection: true,
    tip: "Smart Calling: they're already sold on the concept — the hard part's done. Make them curious whether their setup is optimal. 'Happy with both quality AND cost?' is a double-gate — most people are happy with one but not both. This is a warm prospect, not a dead one.",
    options: [
      { label: "They're open to a comparison call", next: 'booking', type: 'positive' },
      { label: 'Happy with current setup / not interested', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_not_interested_late: {
    id: 'obj_not_interested_late',
    title: 'Objection: Not Interested (Late Stage)',
    script: "That's completely fair, and I appreciate you giving me the time.\n\nCan I just ask, is it more that the timing's off right now, or is it genuinely not something you'd ever look at?\n\nOnly reason I ask, if it's timing, I'd much rather circle back when it actually suits you than push it now.",
    isObjection: true,
    tip: "Separate timing from a hard no — they have very different follow-up paths. A timing issue is a future pipeline entry; a hard no is a closed door. Don't chase a hard no. Do lock a specific callback date if it's timing: 'When would be the right time — Q3, end of year?'",
    options: [
      { label: 'Timing issue — set a callback', next: 'end_callback', type: 'positive' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_think_about_it: {
    id: 'obj_think_about_it',
    title: 'Objection: Need to Think About It',
    script: "Of course, totally respect that. Can I ask what specifically you'd want to chew on? Is it the timing, whether it's the right fit, or something else?\n\nReason I ask is the partners actually answer most of that on the call itself, they'll put real CVs and real pricing for your roles right in front of you. It's 30 minutes of straight info, not a pitch, and you walk away with something useful whether you go ahead or not.\n\nWould [Tuesday] or [Thursday] this week work just to get that in front of you?",
    isObjection: true,
    tip: "Schiffman + SPIN: diagnose what they're thinking about before re-pitching. Then reframe the consultation as information-gathering, not a sales meeting — 'it answers the questions you're thinking through.' Offer two specific days. Then capture the 4 criteria at the close.",
    options: [
      { label: 'Yes, books a time', next: 'close_recap', type: 'positive' },
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
      { label: 'They define their standard — sounds achievable', next: 'booking', type: 'positive' },
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
      { label: "They're reassured / want to explore", next: 'booking', type: 'positive' },
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
      { label: "Mostly task-based / they're open to it", next: 'booking', type: 'positive' },
      { label: 'Needs constant real-time — not open', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_tried_before: {
    id: 'obj_tried_before',
    title: 'Objection: Tried Outsourcing Before',
    script: "I'm actually really glad you told me that, it genuinely changes how I'd go about this with you.\n\nCan I ask what went sideways? Was it the talent itself, the communication with the agency, the management overhead, or something else?\n\n[Listen, then:] Yeah, what you're describing is nearly always a sourcing problem, unvetted agencies just handing you whoever's free instead of whoever's right. We vet every partner up front and you compare two of them side by side before you commit to anything. Would it be worth 30 minutes to see how we'd handle your situation differently, and you take it from there?",
    isObjection: true,
    tip: "'Tried before' is your best lead — they've validated the concept, they just had a bad experience. Diagnose what broke, then differentiate OA's vetting model as the specific fix. Listen more than you talk in this one.",
    options: [
      { label: "They're open to trying again", next: 'booking', type: 'positive' },
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
      { label: "They're reassured / want to explore", next: 'booking', type: 'positive' },
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
      { label: "Yes / they're reassured — open to a call", next: 'booking', type: 'positive' },
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
      { label: "They're reassured — open to a call", next: 'booking', type: 'positive' },
      { label: 'Need legal review first — set follow-up', next: 'end_callback', type: 'positive' },
    ],
  },
}

export const QUICK_OBJECTIONS: FlowOption[] = [
  { label: 'Not interested', next: 'obj_not_interested_opening', type: 'objection' },
  { label: 'Not a good time / who are you?', next: 'obj_timing', type: 'objection' },
  { label: 'Budget / what are your rates?', next: 'obj_budget', type: 'objection' },
  { label: 'Already outsourcing', next: 'obj_already_outsourcing', type: 'objection' },
  { label: 'Not hiring right now', next: 'obj_not_hiring', type: 'objection' },
  { label: 'Team is doing fine', next: 'obj_doing_fine', type: 'objection' },
  { label: 'Why two meetings?', next: 'obj_two_meetings', type: 'objection' },
  { label: 'Tried outsourcing before', next: 'obj_tried_before', type: 'objection' },
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
