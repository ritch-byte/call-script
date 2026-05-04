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
}

export const flow: Record<string, FlowNode> = {
  opening: {
    id: 'opening',
    title: 'Opening',
    script: "Hey {leadName}? Oh hey, {leadName}, It's {yourName} over at Outsource Accelerator. I know I called you out of the blue here, mind if I grab half a minute? Then you can let me know if it's relevant or not?",
    options: [
      { label: 'Yes, go ahead', next: 'pitch' },
      { label: 'Not a good time', next: 'obj_timing' },
      { label: 'Not interested', next: 'obj_not_interested' },
      { label: 'Who are you?', next: 'obj_who_are_you' },
    ],
  },
  pitch: {
    id: 'pitch',
    title: 'Pitch',
    script: "Appreciate that {leadName}, yeah I'm just reaching out because the salary costs for specialized talents in your industry have been increasing and I work with a team that focuses on helping leaders like you handle their growth without increasing their expenses. Usually by connecting you with global talent networks that provide world-class talent at 80% less than local hiring.",
    options: [
      { label: 'Continue', next: 'discovery_q1' },
      { label: 'Not interested', next: 'obj_not_interested' },
      { label: 'Budget concern', next: 'obj_budget' },
    ],
  },
  discovery_q1: {
    id: 'discovery_q1',
    title: 'Discovery: Hiring Setup',
    script: "So just out of curiosity... regarding your hiring setup right now, do you do it full in-house, or do you ever work with external partners for anything?",
    waitForAnswer: true,
    options: [
      { label: 'Full in-house', next: 'discovery_q2', capture: { hiringSetup: 'in-house team' } },
      { label: 'External partners', next: 'discovery_q2', capture: { hiringSetup: 'external partners' } },
      { label: 'Mix of both', next: 'discovery_q2', capture: { hiringSetup: 'team' } },
    ],
  },
  discovery_q2: {
    id: 'discovery_q2',
    title: 'Discovery: How Is It Working?',
    script: "Awesome! Thank you so much for sharing that, and how is that setup working out for you so far?",
    waitForAnswer: true,
    options: [
      { label: 'Continue', next: 'discovery_q3' },
    ],
  },
  discovery_q3: {
    id: 'discovery_q3',
    title: 'Discovery: Talent Type',
    script: "I see, and what type of talents does your {hiringSetup} prioritize?",
    waitForAnswer: true,
    options: [
      { label: 'Mentioned a specific role', next: 'value_prop', capture: { mentionedRole: 'yes' } },
      { label: 'No specific role mentioned', next: 'value_prop', capture: { mentionedRole: 'no' } },
    ],
  },
  value_prop: {
    id: 'value_prop',
    title: 'Value Prop + Research',
    script: "The reason I asked you is because we help business leaders like you cut salary costs by up to 80% using world-class global talent. And before calling you, I actually did some research...\n\n{geminiResearch}",
    options: [
      { label: 'Lead is engaged', next: 'booking' },
      { label: 'Lead is hesitant', next: 'obj_not_interested' },
    ],
  },
  booking: {
    id: 'booking',
    title: 'Booking',
    script: "That's perfect, especially since you're looking for that specific role. We can dive this deeper with our sourcing partners for a brief consultation. They'll show you curated CVs and a pricing breakdown so you can see how we save businesses like yours 80% on salary costs. Plus, as a thank you for your time, we'll send you a $100 Amazon voucher right after the call. How's your calendar look in the next 3 days?",
    options: [
      { label: 'Books a slot', next: 'end_booked' },
      { label: 'Not sure / maybe later', next: 'obj_follow_up' },
      { label: 'Not interested', next: 'obj_not_interested' },
    ],
  },

  // End states
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

  // Objection handlers
  obj_timing: {
    id: 'obj_timing',
    title: 'Objection: Not a Good Time',
    script: "No worries at all! I totally understand. Quick question though — when would be a better time to connect? I promise it'll only take 2 minutes.",
    isObjection: true,
    options: [
      { label: 'They give a time', next: 'end_callback' },
      { label: 'Still not interested', next: 'obj_not_interested' },
    ],
  },
  obj_not_interested: {
    id: 'obj_not_interested',
    title: 'Objection: Not Interested',
    script: "That's completely fair! Out of curiosity, is it because you're already set on your current setup, or is it more of a timing thing?",
    isObjection: true,
    options: [
      { label: 'Already have a solution', next: 'obj_already_have' },
      { label: 'Timing issue', next: 'obj_timing' },
      { label: 'Hard no', next: 'end_not_interested' },
    ],
  },
  obj_who_are_you: {
    id: 'obj_who_are_you',
    title: 'Objection: Who Are You?',
    script: "Of course! I'm {yourName} from Outsource Accelerator — we're a global staffing advisory firm that helps businesses reduce hiring costs by connecting them with top-tier offshore talent at a fraction of local rates.",
    isObjection: true,
    options: [
      { label: 'Open to hearing more', next: 'pitch' },
      { label: 'Not interested', next: 'obj_not_interested' },
    ],
  },
  obj_budget: {
    id: 'obj_budget',
    title: 'Objection: Budget',
    script: "I hear you — and that's actually exactly why I'm calling. We're not adding to your costs, we're cutting them by up to 80%. Most of our clients see the savings within the first month.",
    isObjection: true,
    options: [
      { label: "They're curious", next: 'discovery_q1' },
      { label: 'Still not interested', next: 'obj_not_interested' },
    ],
  },
  obj_already_have: {
    id: 'obj_already_have',
    title: 'Objection: Already Have a Solution',
    script: "That's great to hear! A lot of our best clients came to us the same way. We're not here to replace what's working — but we do love showing people how much they could be saving. Would you be open to just seeing the numbers?",
    isObjection: true,
    options: [
      { label: 'Open to it', next: 'discovery_q1' },
      { label: 'Hard no', next: 'end_not_interested' },
    ],
  },
  obj_follow_up: {
    id: 'obj_follow_up',
    title: 'Objection: Not Sure',
    script: "No problem at all! I can follow up with some information. What's the best email to send that to? And just so I time this right — is next week better for a quick call?",
    isObjection: true,
    options: [
      { label: 'Agrees to follow up', next: 'end_callback' },
      { label: 'Not interested', next: 'end_not_interested' },
    ],
  },
}

export const QUICK_OBJECTIONS: FlowOption[] = [
  { label: 'Not interested', next: 'obj_not_interested' },
  { label: 'Not a good time', next: 'obj_timing' },
  { label: 'Who are you?', next: 'obj_who_are_you' },
  { label: 'Budget concern', next: 'obj_budget' },
  { label: 'Already have a solution', next: 'obj_already_have' },
]
