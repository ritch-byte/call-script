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

  // ── OPENING ──────────────────────────────────────────────────────────────

  opening: {
    id: 'opening',
    title: 'Opening',
    script: "Hey {leadName}? (Pause)\n\nOh hey uhh, {leadName}, it's {yourName} here over at Outsource Accelerator. I know I called you out of the blue here, mind if I grab half a minute? Then you can let me know if it's relevant or not? (pause)\n\nAppreciate that, yeah remind me uhh, have you heard of Outsource Accelerator just by the off chance?",
    tip: "Fanatical Prospecting: the first 7 seconds determine the call. Stay upbeat and confident — not apologetic. 'I know I called you out of the blue' disarms the reflex rejection before it fires. Pause briefly after 'relevant or not' — let them say yes.",
    options: [
      { label: "No — haven't heard of OA", next: 'pitch_q1', type: 'positive' },
      { label: 'Yes — familiar with OA', next: 'pitch_q1', type: 'positive' },
      { label: 'Got cut off / not interested', next: 'obj_cutoff_opening', type: 'objection' },
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
    title: 'Value Pitch + Discovery Q1',
    script: "No? Oh okay, feel free to cut me off if it's not in your wheelhouse.\n\nSo yeah, we are just trying to reach out to all businesses across different industries mainly because salaries for specialized local talent is really getting expensive. Right?\n\nSo I work with a team that focuses on helping leaders like you handle their growth without increasing their expenses. Usually by connecting leaders like you with global talent networks that provide world-class talent at 80% less than local hiring.\n\nSo just out of curiosity... for any of your hiring, do you do it in-house, or do you work with external partners for anything?",
    waitForAnswer: true,
    tip: "The 'feel free to cut me off' line (Schiffman) disarms resistance before it forms — it signals confidence, not desperation. Lead with the industry pain (rising local talent costs) before introducing OA. The discovery question at the end is binary — don't stack more questions on top of it.",
    options: [
      { label: 'They answer (in-house / external / mix)', next: 'discovery_q2', type: 'positive' },
      { label: "Not interested / not hiring / budget concern", next: 'obj_not_hiring', type: 'objection' },
    ],
  },

  // ── DISCOVERY Q2 ─────────────────────────────────────────────────────────

  discovery_q2: {
    id: 'discovery_q2',
    title: 'Discovery Q2: Hiring Friction',
    script: "Awesome, and how is your team doing so far in terms of finding great talents?",
    waitForAnswer: true,
    tip: "SPIN — Implication: if they share any friction, multiply it before moving on. Try: 'When a key role sits open longer than expected, what does that cost you in practice — project delays, the team absorbing extra load, or lost revenue?' Get them to say the cost out loud. A gap they can quantify is a gap worth closing.",
    options: [
      { label: 'They share friction / challenges', next: 'discovery_q3', type: 'positive' },
      { label: 'Team is doing fine / no real issues', next: 'discovery_q3', type: 'positive' },
    ],
  },

  // ── DISCOVERY Q3 ─────────────────────────────────────────────────────────

  discovery_q3: {
    id: 'discovery_q3',
    title: 'Discovery Q3: Role + Need-Payoff',
    script: "Makes sense. And what types of roles does your team prioritise most when you're hiring?",
    waitForAnswer: true,
    tip: "SPIN — Need-Payoff: after they name a role, use this bridge before moving to the pitch: 'So if you could bring on a great [role they named] at 70 to 80 percent less cost — dedicated full-time, not a freelancer — is that a conversation worth having?' Get the yes before you pitch. It pre-commits them to the value.",
    options: [
      { label: 'They share a role or answer', next: 'role_qualify', type: 'positive' },
      { label: "Can't give a role / not interested", next: 'obj_no_role', type: 'objection' },
    ],
  },

  // ── NO ROLE — VALUE PITCH + RESEARCH ─────────────────────────────────────

  obj_no_role: {
    id: 'obj_no_role',
    title: "No Role — Value Pitch + Research",
    isObjection: true,
    script: "Okay, no worries!\n\nThe reason I asked you is because we help business leaders like you cut salary costs by up to 80% using world-class global talent. And before calling you, I actually did some research...\n\n{geminiResearch}",
    tip: "Gap Selling: even without a named role, lead with the cost problem — 'salary costs by up to 80%' creates instant curiosity. The research insert lets you surface a role for them. Once they're engaged, run them through qualification (full-time, 1–2 month timeline, offshore) so the call qualifies and isn't flagged.",
    options: [
      { label: 'Lead is engaged / curious', next: 'role_qualify', type: 'positive' },
      { label: 'Already outsourcing / need to think', next: 'obj_already_outsourcing', type: 'objection' },
      { label: 'Not interested', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── QUALIFICATION — CORE GATE 1: FULL-TIME & DEDICATED ───────────────────

  role_qualify: {
    id: 'role_qualify',
    title: 'Qualify ① Full-Time & Dedicated',
    script: "Perfect, and this'd be a full-time, dedicated seat right?",
    waitForAnswer: true,
    tip: "Core Gate 1 — full-time & dedicated. We only place full-time, dedicated talent, so frame it as a full-time seat — don't plant the part-time idea. If they push back to part-time/project, handle it; don't just roll on.",
    options: [
      { label: 'Yes — full-time & dedicated', next: 'qualify_experience', type: 'positive' },
      { label: 'Part-time / project', next: 'obj_parttime', type: 'objection' },
      { label: "Can't give a specific role", next: 'value_prop', type: 'positive' },
      { label: 'Not interested', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── QUALIFICATION — PART-TIME REBUTTAL (WE PLACE FULL-TIME ONLY) ──────────

  obj_parttime: {
    id: 'obj_parttime',
    title: 'Qualify: Part-Time Rebuttal',
    isObjection: true,
    script: "Got it — and most leaders are surprised here: at offshore rates a full-time, dedicated person often costs less than part-time help locally, and you get someone fully embedded in your team instead of splitting their attention. Worth looking at it as a full-time seat?",
    waitForAnswer: true,
    tip: "We only place full-time, dedicated talent — part-time/project reads as a non-dedicated (disqualified) lead. Don't accept it: reframe on cost (offshore full-time ≈ local part-time) and on focus (dedicated beats shared). Convert to a full-time yes, then keep qualifying.",
    options: [
      { label: 'Open to a full-time seat', next: 'qualify_experience', type: 'positive' },
      { label: 'Still only wants part-time', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── QUALIFICATION — VALUE BRIDGE + EXPERIENCE LEVEL ──────────────────────

  qualify_experience: {
    id: 'qualify_experience',
    title: 'Qualify: Value Bridge + Experience',
    script: "Perfect — I actually work with a couple of source partners who place that exact role. They'll show you curated CVs and a pricing breakdown so you can see how we save businesses like yours up to 80% on salary.\n\nAnd so they pull the right people for you, do you have a specific experience level in mind for that role?",
    waitForAnswer: true,
    tip: "Full-time's confirmed — now bridge to value before you ask anything else. Naming the source partners + curated CVs + 80% savings frames the experience question as 'so they can pull the right person for you,' not interrogation. Capture the experience level; it personalises the rest of the call. Any answer moves you forward to the timeline gate.",
    options: [
      { label: 'Gives an experience level', next: 'qualify_timeline', type: 'positive' },
      { label: 'Not sure / open to any', next: 'qualify_timeline', type: 'positive' },
      { label: 'Not interested', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── QUALIFICATION — CORE GATE 2: IMMEDIATE HIRING NEED ───────────────────

  qualify_timeline: {
    id: 'qualify_timeline',
    title: 'Qualify ② Timeline / Immediate Need',
    script: "And you're looking to get someone in fairly soon — within the next month or two, is that about right?",
    waitForAnswer: true,
    tip: "Core Gate 2 — immediate need. Get an explicit timeframe; never accept 'eventually.' If it's far out, don't bail — reframe and keep driving to the book.",
    options: [
      { label: 'Within ~2 months', next: 'qualify_offshore', type: 'positive' },
      { label: '3+ months / no firm date', next: 'obj_timeline_far', type: 'objection' },
      { label: 'Not interested', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── QUALIFICATION — CORE GATE 3: OPEN TO OFFSHORE ────────────────────────

  qualify_offshore: {
    id: 'qualify_offshore',
    title: 'Qualify ③ Open to Offshore',
    script: "And you're open to an offshore setup for this type of talent, typically based in the Philippines? Right?",
    waitForAnswer: true,
    tip: "Core Gate 3 — open to offshore, the most-skipped one. Ask it directly. A clear yes = qualified. If they lean on-site, don't fold — handle it, don't end the call.",
    options: [
      { label: 'Yes — open to offshore', next: 'booking', type: 'positive' },
      { label: 'Hesitant / prefers on-site', next: 'obj_need_inoffice', type: 'objection' },
      { label: 'Not interested', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── QUALIFICATION — PULL TIMELINE INTO THE 1–2 MONTH WINDOW ──────────────

  obj_timeline_far: {
    id: 'obj_timeline_far',
    title: 'Qualify: Bring Timeline Forward',
    isObjection: true,
    script: "Totally get it — most leaders think it's months out, but once they see the talent and pricing sitting ready, they usually move within weeks. If the right person was in front of you, would you be open to bringing them on in the next month or two?",
    waitForAnswer: true,
    tip: "Goal: pull the timeline into the ~2-month window so the QC qualifies instead of getting flagged — don't settle for a 'later' booking. Paint it: the talent's ready now, no lead time, no scramble later. Get them to say they'd move sooner; a strong DC then seals it. Never accept a flat 3+ months as the end of the road.",
    options: [
      { label: 'Yes — open to 1–2 months', next: 'qualify_offshore', type: 'positive' },
      { label: 'Maybe, if the fit is right', next: 'qualify_offshore', type: 'positive' },
      { label: 'Not interested', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── VALUE PROP ───────────────────────────────────────────────────────────

  value_prop: {
    id: 'value_prop',
    title: 'Value Prop + Research',
    script: "Perfect — and that's exactly the scenario we help with every day.\n\nHere's what most business leaders don't realize: the roles they're hiring locally are available at world-class quality offshore — dedicated, full-time staff — at 50 to 80 percent of the cost. Not freelancers, not shared resources. One person, fully committed to your business, your hours, your systems.\n\nAnd before I called, I did some research on your company specifically...\n\n{geminiResearch}",
    tip: "Gap Selling: tie this directly to what they just shared. 'You mentioned hiring [role] takes time and costs are high — here's exactly what that looks like differently.' Then make savings concrete: 'If you're paying $60K locally for that role, offshore that's typically $12–18K. Three of those roles? You're saving over $100K a year.' Numbers they can picture beat percentages every time.",
    options: [
      { label: 'Lead is engaged / curious', next: 'role_qualify', type: 'positive' },
      { label: 'Already outsourcing / need to think', next: 'obj_already_outsourcing', type: 'objection' },
      { label: 'Not interested / budget', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── BOOKING ──────────────────────────────────────────────────────────────

  booking: {
    id: 'booking',
    title: 'Booking',
    script: "Perfect! Let's grab you a time while it's fresh. What does your calendar look like over the next couple of days?\n\n(they give a day/time)\n\nAwesome, I'll send the invite right over. The moment you accept it, a $10 Amazon voucher is on its way as a thank-you, and the remaining $50 lands right after we meet. Can I count on you to be there, {leadName}?",
    waitForAnswer: true,
    tip: "Schiffman: stay silent after the CTA — the next person to speak loses. If they ask 'morning or afternoon?', that's a yes. Pin down a specific date and time before hanging up. Reference the exact role and experience level they gave you earlier to make the ask feel personal.",
    options: [
      { label: 'Books a slot', next: 'booking_recap', type: 'positive' },
      { label: 'Not sure / need to think', next: 'obj_think_about_it', type: 'objection' },
      { label: 'Not interested', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── BOOKING RECAP ─────────────────────────────────────────────────────────

  booking_recap: {
    id: 'booking_recap',
    title: 'Confirm Decision-Maker',
    script: "\"And just to confirm — you're one of the decision-makers who'd be involved in moving forward once you've seen the talent and pricing?\"\n\n(if 'maybe' / 'it depends': \"No problem — who else would be part of that call? Let's get them on the invite too so nothing stalls.\")",
    tip: "Booking already locked the time, invite, voucher and attendance — authority is the one gap left. Confirm they can actually move it forward; if not, get the name of who can and add them to the invite. A booked call with no decision-maker is a polite dead end.",
    options: [
      { label: 'Decision-maker confirmed', next: 'end_booked', type: 'positive' },
    ],
  },

  // ── END STATES ───────────────────────────────────────────────────────────

  end_booked: {
    id: 'end_booked',
    title: 'Booked!',
    script: "Invite sent! Speak soon, {leadName}.",
    isEnd: true,
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
    script: "No worries at all — I only need 30 seconds, and if it's not relevant I won't waste another minute of your time.\n\nI'm {yourName} from Outsource Accelerator — we help businesses cut their hiring costs by 50 to 80 percent using world-class offshore talent. Is that even something on your radar right now?",
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
    script: "That's completely fair — and I appreciate you being straight with me.\n\nCan I ask — is it more that you're already happy with how you hire, or is it just not a priority right now?\n\nThe reason I ask: most leaders say the same thing at first, until they realize how much they're overspending on talent without knowing it. I'm not asking you to change anything — just 30 seconds to see if the numbers even make sense for your situation.",
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
    script: "That makes total sense — and honestly, that's often the best time to look at this. When you're not under pressure to fill a role is exactly when you can evaluate properly, rather than scrambling and overpaying.\n\nJust out of curiosity — what roles do you typically bring on when business picks back up?",
    isObjection: true,
    tip: "New Sales Simplified: future-pace the pipeline. They're not a dead lead — they're a future one. Get the role name, then route to discovery. The goal is a callback with a specific trigger: 'When you do go to hire for [role], that's when we'd save you the most.'",
    options: [
      { label: 'They share a role / future plan', next: 'discovery_q2', type: 'positive' },
      { label: 'Nothing planned / not relevant', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_budget: {
    id: 'obj_budget',
    title: 'Objection: Budget / Cost',
    script: "I hear you — and that's actually exactly why I'm calling, because we're not adding to your costs, we're cutting them.\n\nLet me make it concrete: what's your biggest role right now in terms of salary spend? Because if you're paying $60K locally, the same role offshore typically runs $12 to 18K. If you've got two or three of those, you're looking at over $100K a year back in your business.\n\nWould it be worth 15 minutes just to see what the numbers look like for your specific roles?",
    isObjection: true,
    tip: "Gap Selling: budget objections die when you quantify the gap. Don't say '80% savings' — say '$100K a year back in your business.' Get them to name their highest-cost role, then do the math out loud with them. A number they can picture is worth ten percentages.",
    options: [
      { label: "They're open to hearing the numbers", next: 'discovery_q2', type: 'positive' },
      { label: 'Still not interested', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_doing_fine: {
    id: 'obj_doing_fine',
    title: "Objection: Team is Doing Fine",
    script: "That's great to hear — and I'm not suggesting anything is broken.\n\nBut here's what surprises most leaders: 'doing fine' on hiring and 'doing it at the optimal cost' are often two very different things. Most teams are running well — they're just spending 60 to 80 percent more than they need to on the same quality of talent.\n\nJust out of curiosity — when a key role opens up, what's the bigger headache: the time it takes, the cost, or finding the right skill set?",
    isObjection: true,
    tip: "Challenger Sale: don't validate the status quo — challenge it gently. 'Doing fine' is not the same as 'doing it optimally.' Reframe the conversation from 'is anything broken?' to 'are you leaving savings on the table?' Then get them to name their hiring friction point.",
    options: [
      { label: 'They mention a challenge (time / cost / skill)', next: 'discovery_q3', type: 'positive' },
      { label: 'Genuinely no challenges', next: 'obj_no_challenges', type: 'objection' },
    ],
  },

  obj_no_challenges: {
    id: 'obj_no_challenges',
    title: 'Objection: No Hiring Challenges',
    script: "That's impressive — sounds like you've built a solid team and process.\n\nI'd still love to show you what we do, purely as a benchmarking exercise. Even if you're not looking to change anything, seeing the real cost comparison for your specific roles takes 15 minutes and gives you useful data either way.\n\nNo commitment at all — and we'll send a $60 Amazon voucher just for your time. Worth a quick look?",
    isObjection: true,
    tip: "Reciprocity (Psychology of Selling): frame the consultation as giving them something useful regardless of outcome — real salary benchmarking data. Lower the stakes completely: 'even if you don't change anything, you'll know your number.' The voucher is social proof of zero risk.",
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
    tip: "Gap Selling: the objection 'we don't hire externally' is a current state, not a final answer. The hypothetical — 'if the quality was the same at 80% less cost' — is a Need-Payoff question that opens the door. Get them to name a role they'd consider. That's the gap.",
    options: [
      { label: 'They mention a role to consider', next: 'value_prop', type: 'positive' },
      { label: 'Not open to it', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_already_outsourcing: {
    id: 'obj_already_outsourcing',
    title: 'Objection: Already Outsourcing / Need to Think',
    script: "That's great — you already know the model works. Can I ask: are you happy with both the quality and the cost of your current setup, or is there room for improvement on either?\n\nThe reason I ask is most clients who come to us were already outsourcing — they just found our partners offered better talent at a lower cost. It's a quick benchmarking call, no commitment, and you'll know in 15 minutes whether there's an upgrade on the table.\n\nPlus a $60 Amazon voucher just for showing up.",
    isObjection: true,
    tip: "Smart Calling: they're already sold on the concept — that's the hard part done. Your only job here is to make them curious about whether their current setup is optimal. 'Are you happy with both quality AND cost?' is a double-gate question — most people are happy with one but not both.",
    options: [
      { label: "They're open to a comparison call", next: 'booking', type: 'positive' },
      { label: 'Happy with current setup / not interested', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_not_interested_late: {
    id: 'obj_not_interested_late',
    title: 'Objection: Not Interested (Late Stage)',
    script: "That's completely fair — I appreciate you giving me your time.\n\nIs it more that the timing isn't right, or is it that this just genuinely isn't something you'd consider?\n\nI only ask because if it's timing, I'd rather call you back when it makes more sense than waste both our time now.",
    isObjection: true,
    tip: "Separate timing from a hard no — they have very different follow-up paths. A timing issue is a future pipeline entry. A hard no is a closed door. Don't chase a hard no. Do lock in a specific callback date if it's timing: 'When would be the right time to circle back — Q3, end of year?'",
    options: [
      { label: 'Timing issue — set a callback', next: 'end_callback', type: 'positive' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_think_about_it: {
    id: 'obj_think_about_it',
    title: 'Objection: Need to Think About It',
    script: "Of course — and I completely respect that. Can I ask what specifically you'd need to think through? Is it the timing, whether it's the right fit, or something else?\n\nThe reason I ask: our sourcing partners actually answer most of those questions in the consultation itself — they'll show you real CVs and real pricing for your specific roles. It's 15 minutes of data, not a sales pitch. And you walk away with useful benchmarking whether you move forward or not.\n\nDoes [Tuesday] or [Thursday] this week work to at least get that information in front of you?",
    isObjection: true,
    tip: "Schiffman + SPIN: diagnose what they're thinking about before re-pitching. Then reframe the consultation as information-gathering, not a sales meeting — 'it answers the questions you're thinking through.' Offer two specific days again. The voucher is the safety net — mention it if they're still hesitant.",
    options: [
      { label: 'Yes, books a time', next: 'booking_recap', type: 'positive' },
      { label: 'Wants a follow-up / not ready yet', next: 'end_callback', type: 'positive' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  // ── OFFSHORE-SPECIFIC OBJECTION HANDLERS ─────────────────────────────────

  obj_quality: {
    id: 'obj_quality',
    title: "Objection: Quality Won't Be as Good",
    script: "That's the most common concern I hear — and it's a fair one to raise.\n\nOur partners go through a rigorous vetting process: English proficiency, skill testing, infrastructure checks, and track record review. We only work with partners who have proven quality placements across multiple clients.\n\nCan I ask — what does 'quality' mean for your specific role? Is it technical skill, communication, reliability, or output speed? Because once I know your standard, I can tell you directly whether we can match it — and if we can't, I'll say so.",
    isObjection: true,
    tip: "SPIN — Problem Question: 'What does quality mean for this role?' gets them to define their own standard. Once they define it, you can address it specifically — or agree it's not a fit. Vague objections can't be answered; specific standards can. Ask the question, then listen.",
    options: [
      { label: 'They define their standard — sounds achievable', next: 'booking', type: 'positive' },
      { label: 'Still unconvinced / hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_language: {
    id: 'obj_language',
    title: 'Objection: Language / Communication Barrier',
    script: "That's a very common assumption — and it surprises most people when they see the reality.\n\nThe Philippines is the third-largest English-speaking country in the world. Our partners specifically hire for strong English communication, and most professionals have been educated in English from primary school through university.\n\nCan I ask — is your concern about internal team communication, or is this for a customer-facing role? Because if it's customer-facing, we'd focus your search specifically on partners who specialise in that and have proven track records.",
    isObjection: true,
    tip: "Smart Calling: answer with a fact that surprises — 'third-largest English-speaking country' lands because they didn't expect it. Then narrow the concern: internal vs. customer-facing are different problems with different solutions. Don't defend generically; get specific.",
    options: [
      { label: "They're reassured / want to explore", next: 'booking', type: 'positive' },
      { label: 'Still a concern — not convinced', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_timezone: {
    id: 'obj_timezone',
    title: 'Objection: Time Zone Issues',
    script: "Time zones are a real consideration — you're right to flag it.\n\nA few things that work well in practice: most of our partner staff in the Philippines work US business hours by choice — they're used to it and many prefer it. And for roles that are more process-based, a lot of clients find async actually increases output because there's less interruption during their own day.\n\nWhat does collaboration look like day-to-day for this role — is it constant real-time communication, or is it more task and output based?",
    isObjection: true,
    tip: "Diagnose before defending. Real-time vs. async are completely different scenarios. Task-based roles (finance, admin, design, development) work excellently async. High-communication roles need a different conversation about US-hours partners. Ask first.",
    options: [
      { label: "Mostly task-based / they're open to it", next: 'booking', type: 'positive' },
      { label: 'Needs constant real-time — not open', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_tried_before: {
    id: 'obj_tried_before',
    title: 'Objection: Tried Outsourcing Before',
    script: "I'm really glad you told me that — it actually changes how I'd approach this.\n\nCan I ask what went wrong? Was it the quality of the talent, the communication with the agency, management overhead, or something else?\n\n[Listen, then:] What you're describing is almost always a vetting problem — unvetted agencies placing whoever's available, not who's right. Our entire model is built around solving that. Our partners are assessed specifically to avoid the failure modes you experienced.\n\nWould it be worth a 15-minute call where our sourcing team walks you through exactly how we'd approach your situation differently — and you can decide from there?",
    isObjection: true,
    tip: "Sales Development Playbook: 'tried before' is your best lead — they've already validated the concept, they just had a bad experience. Your job is to diagnose what broke, then differentiate OA's vetting model as the specific fix. Listen more than you talk in this one.",
    options: [
      { label: "They're open to trying again", next: 'booking', type: 'positive' },
      { label: 'Not willing to try again', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_confidential: {
    id: 'obj_confidential',
    title: 'Objection: Work Too Sensitive / Confidential',
    script: "Completely understandable — and it's one we take seriously.\n\nAll of our partners operate with strict NDAs and data security protocols. The talent works on your systems, under your processes, with your security policies applied. In practice, they function as a dedicated employee — they're just employed through the partner entity locally.\n\nWhat specifically is the sensitive aspect — is it customer data, proprietary IP, or financial information? Because depending on the answer, there are partners in our network who specialise in exactly that compliance requirement.",
    isObjection: true,
    tip: "Narrow the concern — 'confidential' means different things. Customer data (SOC2 partners), IP (NDA-first workflows), financial data (finance-specialist partners) all have different solutions. The specific answer tells you which partner to match them with. Don't defend generically.",
    options: [
      { label: "They're reassured / want to explore", next: 'booking', type: 'positive' },
      { label: 'Needs more info — set a follow-up', next: 'end_callback', type: 'positive' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_need_inoffice: {
    id: 'obj_need_inoffice',
    title: 'Objection: Need Someone In-Office',
    script: "That's fair — can I ask what specifically needs to happen in-office? Is it a physical task, a management preference, or is there a genuine on-site requirement?\n\nA lot of our clients felt the same before they tried it. The honest answer is: remote management is different — it needs clear SOPs and communication rhythms. Our partners actually help set that up in the first 30 days.\n\nWould it change your view if there was structured onboarding support specifically for managing the role remotely?",
    isObjection: true,
    tip: "SPIN — Situation Question: 'What specifically needs to happen in-office?' often reveals it's a management preference, not a genuine physical requirement. Most roles that 'need' to be in-office don't actually need to be. Get them to describe the actual task — then test it.",
    options: [
      { label: "It's a preference — they're open to exploring", next: 'booking', type: 'positive' },
      { label: 'Genuinely requires physical presence', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_how_manage: {
    id: 'obj_how_manage',
    title: 'Objection: How Do I Manage Someone Overseas?',
    script: "That's one of the most common questions — and it's one our sourcing partners address directly in the consultation.\n\nThey walk you through the full setup: onboarding process, communication tools, performance management, and what happens if there are issues. Most clients say it's much simpler than they expected — once the first 30 days are set up, it runs like managing any remote employee.\n\nHave you managed a remote team before, even locally?",
    isObjection: true,
    tip: "Psychology of Selling: fear of the unknown is the real objection. Reduce it by making the process visible and simple. If they've managed remote workers before — even locally — draw the parallel. The consultation is where this fear actually dissolves, so get them there.",
    options: [
      { label: "Yes / they're reassured — open to a call", next: 'booking', type: 'positive' },
      { label: 'No remote experience / still unsure', next: 'end_callback', type: 'positive' },
    ],
  },

  obj_legal: {
    id: 'obj_legal',
    title: 'Objection: Is This Even Legal?',
    script: "Great question — and the short answer is yes, completely legal and very common.\n\nThe way it works: the talent is employed by our local partner in their country, not directly by you. You're entering a service contract with a registered business entity. There's no payroll tax complexity on your end, no visa issues, no local employment law complications — all of that is handled by the partner.\n\nDoes that help clarify it, or is there a specific legal area you'd want your team to look at before moving forward?",
    isObjection: true,
    tip: "Answer directly and confidently — hesitation on legal questions destroys trust. The structure is simple: service contract, not employment. If they have a legal team to consult, offer to send information for review and set a follow-up. That's not a no — it's a slower yes.",
    options: [
      { label: "They're reassured — open to a call", next: 'booking', type: 'positive' },
      { label: 'Need legal review first — set follow-up', next: 'end_callback', type: 'positive' },
    ],
  },
}

export const QUICK_OBJECTIONS: FlowOption[] = [
  { label: 'Not interested', next: 'obj_not_interested_opening', type: 'objection' },
  { label: 'Not a good time / who are you?', next: 'obj_timing', type: 'objection' },
  { label: 'Budget concern', next: 'obj_budget', type: 'objection' },
  { label: 'Already outsourcing', next: 'obj_already_outsourcing', type: 'objection' },
  { label: 'Not hiring right now', next: 'obj_not_hiring', type: 'objection' },
  { label: 'Team is doing fine', next: 'obj_doing_fine', type: 'objection' },
  { label: 'Tried outsourcing before', next: 'obj_tried_before', type: 'objection' },
]

export const DEEP_OBJECTIONS: FlowOption[] = [
  { label: '"Quality won\'t be as good"', next: 'obj_quality', type: 'objection' },
  { label: '"Language / communication issues"', next: 'obj_language', type: 'objection' },
  { label: '"Time zone difference is a problem"', next: 'obj_timezone', type: 'objection' },
  { label: '"We tried outsourcing before"', next: 'obj_tried_before', type: 'objection' },
  { label: '"Our work is too sensitive"', next: 'obj_confidential', type: 'objection' },
  { label: '"I need someone in the office"', next: 'obj_need_inoffice', type: 'objection' },
  { label: '"How do I manage someone overseas?"', next: 'obj_how_manage', type: 'objection' },
  { label: '"Is this even legal?"', next: 'obj_legal', type: 'objection' },
]