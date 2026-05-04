export interface FlowNode {
  id: string
  title: string
  script: string
  waitForAnswer?: boolean
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

export const flow: Record<string, FlowNode> = {

  // ── OPENING ──────────────────────────────────────────────────────────────

  opening: {
    id: 'opening',
    title: 'Opening',
    script: "Hey {leadName}? Oh hey, {leadName}, it's {yourName} over at Outsource Accelerator. I know I called you out of the blue here, mind if I grab half a minute? Then you can let me know if it's relevant or not?",
    options: [
      { label: 'Yes, go ahead', next: 'pitch_q1', type: 'positive' },
      { label: 'Not a good time / who are you?', next: 'obj_timing', type: 'objection' },
      { label: 'Not interested', next: 'obj_not_interested_opening', type: 'objection' },
    ],
  },

  // ── PITCH + DISCOVERY Q1 ─────────────────────────────────────────────────

  pitch_q1: {
    id: 'pitch_q1',
    title: 'Pitch + Discovery Q1',
    script: "Appreciate that {leadName}, yeah I'm just reaching out because the salary costs for specialized talents in your industry have been increasing and I work with a team that focuses on helping leaders like you handle their growth without increasing their expenses — usually by connecting you with global talent networks that provide world-class talent at 80% less than local hiring.\n\nSo just out of curiosity... regarding your hiring setup right now, do you do it full in-house, or do you ever work with external partners for anything?",
    waitForAnswer: true,
    options: [
      { label: 'They answer (in-house / external / mix)', next: 'discovery_q2', type: 'positive' },
      { label: 'Not interested / budget concern', next: 'obj_not_interested_pitch', type: 'objection' },
      { label: "We're not hiring right now", next: 'obj_not_hiring', type: 'objection' },
    ],
  },

  // ── DISCOVERY Q2 ─────────────────────────────────────────────────────────

  discovery_q2: {
    id: 'discovery_q2',
    title: 'Discovery Q2: Finding Talents',
    script: "Awesome! And how is your team doing so far in terms of finding great talents?",
    waitForAnswer: true,
    options: [
      { label: "It's challenging / could be better", next: 'discovery_q3', type: 'positive' },
      { label: "It's going well / no issues", next: 'obj_doing_fine', type: 'objection' },
    ],
  },

  // ── DISCOVERY Q3 ─────────────────────────────────────────────────────────

  discovery_q3: {
    id: 'discovery_q3',
    title: 'Discovery Q3: Talent Type',
    script: "I see, and what type of talents does your team prioritize most?",
    waitForAnswer: true,
    options: [
      { label: 'They share a role or answer', next: 'value_prop', type: 'positive' },
      { label: "We don't really hire externally", next: 'obj_no_external', type: 'objection' },
    ],
  },

  // ── VALUE PROP ───────────────────────────────────────────────────────────

  value_prop: {
    id: 'value_prop',
    title: 'Value Prop + Research',
    script: "The reason I asked you is because we help business leaders like you cut salary costs by up to 80% using world-class global talent. And before calling you, I actually did some research...\n\n{geminiResearch}",
    options: [
      { label: 'Lead is engaged / curious', next: 'booking', type: 'positive' },
      { label: 'Already outsourcing / need to think', next: 'obj_already_outsourcing', type: 'objection' },
      { label: 'Not interested / budget', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── BOOKING ──────────────────────────────────────────────────────────────

  booking: {
    id: 'booking',
    title: 'Booking',
    script: "That's perfect! We can dive deeper with our sourcing partners for a brief consultation — they'll show you curated CVs and a pricing breakdown so you can see how we save businesses like yours 80% on salary costs. Plus, as a thank you for your time, we'll send you a $100 Amazon voucher right after the call.\n\nHow's your calendar look in the next 3 days?",
    options: [
      { label: 'Books a slot', next: 'end_booked', type: 'positive' },
      { label: 'Not sure / need to think', next: 'obj_think_about_it', type: 'objection' },
      { label: 'Not interested', next: 'obj_not_interested_late', type: 'objection' },
    ],
  },

  // ── END STATES ───────────────────────────────────────────────────────────

  end_booked: {
    id: 'end_booked',
    title: 'Booked!',
    script: "Fantastic! I'll send you a calendar invite right away. Talk soon, {leadName}!",
    isEnd: true,
    options: [],
  },
  end_callback: {
    id: 'end_callback',
    title: 'Callback Scheduled',
    script: "Perfect! I'll reach out then. Have a great day, {leadName}!",
    isEnd: true,
    options: [],
  },
  end_not_interested: {
    id: 'end_not_interested',
    title: 'Call Ended',
    script: "Totally understood! I appreciate your time, {leadName}. If things ever change, feel free to reach out. Have a great day!",
    isEnd: true,
    options: [],
  },

  // ── OBJECTION HANDLERS ───────────────────────────────────────────────────

  obj_timing: {
    id: 'obj_timing',
    title: 'Objection: Timing / Who Are You',
    script: "No worries at all — I only need 30 seconds and if it's not relevant, I won't bother you again.\n\nI'm {yourName} from Outsource Accelerator — we help businesses cut hiring costs by up to 80% with world-class offshore talent. Does that sound like something that could be relevant to you?",
    isObjection: true,
    options: [
      { label: 'Yes, tell me more / give me a better time', next: 'pitch_q1', type: 'positive' },
      { label: 'Not interested', next: 'obj_not_interested_opening', type: 'objection' },
    ],
  },

  obj_not_interested_opening: {
    id: 'obj_not_interested_opening',
    title: 'Objection: Not Interested (Opening)',
    script: "That's completely fair! Can I ask — is it because you're already happy with how you hire, or is it more of a timing thing?\n\nMost leaders I speak with say the same thing at first — until they realize how much they're overspending on talent.",
    isObjection: true,
    options: [
      { label: "They're curious / it's just timing", next: 'pitch_q1', type: 'positive' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_not_interested_pitch: {
    id: 'obj_not_interested_pitch',
    title: 'Objection: Not Interested (After Pitch)',
    script: "Totally understand! Can I ask — is your concern more about the cost, the process, or have you tried offshore talent before and it didn't work out?\n\nI ask because depending on your situation, we might approach this differently — and I'd hate to waste your time if we're not the right fit.",
    isObjection: true,
    options: [
      { label: 'Cost concern / tried before', next: 'obj_budget', type: 'objection' },
      { label: "They're open again", next: 'discovery_q2', type: 'positive' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_not_hiring: {
    id: 'obj_not_hiring',
    title: "Objection: Not Hiring Right Now",
    script: "That makes total sense! Actually, that's often the best time to explore this — so when you do need to hire, you're not scrambling and overpaying.\n\nJust out of curiosity, what roles do you typically hire for when business picks up?",
    isObjection: true,
    options: [
      { label: 'They share a role', next: 'discovery_q2', type: 'positive' },
      { label: 'Not relevant', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_budget: {
    id: 'obj_budget',
    title: 'Objection: Budget / Cost',
    script: "I hear you — and honestly, that's exactly why I'm calling. We're not adding to your costs, we're cutting them by up to 80%.\n\nWhat's your biggest role that you're currently spending the most on salary-wise? It might be worth just comparing numbers.",
    isObjection: true,
    options: [
      { label: "They're open to hearing more", next: 'discovery_q2', type: 'positive' },
      { label: 'Still not interested', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_doing_fine: {
    id: 'obj_doing_fine',
    title: "Objection: Team is Doing Fine",
    script: "That's great to hear! Most of our clients were in the same position — things were working, but they didn't realize how much they could save until they saw the numbers.\n\nJust out of curiosity, what's your biggest challenge when a key role opens up — is it more about speed, cost, or finding the right skill set?",
    isObjection: true,
    options: [
      { label: 'They mention a challenge', next: 'discovery_q3', type: 'positive' },
      { label: 'No real challenges', next: 'obj_no_challenges', type: 'objection' },
    ],
  },

  obj_no_challenges: {
    id: 'obj_no_challenges',
    title: 'Objection: No Hiring Challenges',
    script: "That's amazing — you've clearly built a great team! I'd still love to show you what we do, just so you have it as an option when the time comes.\n\nWould you be open to just a 15-minute benchmarking call? No commitment — and we'll send you a $100 Amazon voucher just for your time.",
    isObjection: true,
    options: [
      { label: "They're open to it", next: 'booking', type: 'positive' },
      { label: 'Not relevant', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_no_external: {
    id: 'obj_no_external',
    title: "Objection: Don't Hire Externally",
    script: "Totally makes sense — a lot of leaders feel that way at first. But if the quality was the same or better and the cost was 80% lower, would that change the conversation at all?\n\nWhat kind of roles would you consider if the savings were significant enough?",
    isObjection: true,
    options: [
      { label: 'They mention a role', next: 'value_prop', type: 'positive' },
      { label: 'Not open to it', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_already_outsourcing: {
    id: 'obj_already_outsourcing',
    title: 'Objection: Already Outsourcing / Need to Think',
    script: "That's great — you already know the value! Can I ask, are you happy with both the quality and the cost of your current setup?\n\nMost clients who come to us were already outsourcing but found we could offer better talent at a significantly lower cost. Would you be open to a quick 15-minute benchmarking call — no commitment, plus a $100 Amazon voucher just for your time?",
    isObjection: true,
    options: [
      { label: "They're open to a call", next: 'booking', type: 'positive' },
      { label: 'Not interested', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_not_interested_late: {
    id: 'obj_not_interested_late',
    title: 'Objection: Not Interested (Late Stage)',
    script: "That's completely fair — I appreciate you giving me your time! Is it more that the timing isn't right, or is it that this just isn't something you'd ever consider?\n\nI only ask so I know whether it's worth a follow-up down the road.",
    isObjection: true,
    options: [
      { label: 'Timing issue — follow up later', next: 'end_callback', type: 'positive' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end' },
    ],
  },

  obj_think_about_it: {
    id: 'obj_think_about_it',
    title: 'Objection: Need to Think About It',
    script: "Of course — I totally respect that! I'd just hate for you to miss out on the Amazon voucher, and honestly the consultation is zero commitment.\n\nOur sourcing partners will just walk you through real CVs and pricing for your specific roles — you'll have all the info you need to decide. Does 15 minutes this week or next work for you?",
    isObjection: true,
    options: [
      { label: 'Yes, books a time', next: 'end_booked', type: 'positive' },
      { label: 'Wants a follow-up / not ready', next: 'end_callback', type: 'positive' },
      { label: 'Hard no', next: 'end_not_interested', type: 'end' },
    ],
  },
}

export const QUICK_OBJECTIONS: FlowOption[] = [
  { label: 'Not interested', next: 'obj_not_interested_opening', type: 'objection' },
  { label: 'Not a good time / who are you?', next: 'obj_timing', type: 'objection' },
  { label: 'Budget concern', next: 'obj_budget', type: 'objection' },
  { label: 'Already outsourcing', next: 'obj_already_outsourcing', type: 'objection' },
  { label: 'Not hiring right now', next: 'obj_not_hiring', type: 'objection' },
]
