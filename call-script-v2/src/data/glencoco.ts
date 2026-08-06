// Glencoco SDR practices (glencoco.com, Micah Vu), as constraints on what the
// generator writes.
//
// The house exemplar already reflects a lot of this: sell the meeting not the service,
// acknowledge their time up front, no salesy language. What lives here is the rest of
// it, written as instructions a model can follow, so the spiel comes out aligned with
// the craft rather than just the format.
//
// Kept as data in one file so the writing rules and the objection playbook cannot drift
// apart from each other, and so the source of each rule stays traceable.

/**
 * Rapport and consultative rules that shape every beat.
 * Deliberately short: this rides in the prompt on every build, and a wall of
 * instructions crowds out the brief that makes the spiel specific.
 */
export const GLENCOCO_WRITING_RULES = `CRAFT RULES (Glencoco, Micah Vu). These shape the
writing, they are not extra content to add, so honouring them must not add a single word:
- Curiosity, not authority. Asking about their world, not announcing you have the answer.
- A conversation opener, not a monologue. It should sound like someone who expects to be
  interrupted and would welcome it.
- Their name once, where it lands naturally. Repeating it reads robotic.
- Their vocabulary, not ours. Nothing that could appear on a website.`

/**
 * The five objections Glencoco treats as the canonical set, with the direction the
 * response should take. Used to ground objection prep in the framework rather than
 * inventing a fresh approach per call.
 */
export const OBJECTION_PLAYBOOK: Array<{ objection: string; direction: string }> = [
  {
    objection: 'Send me an email',
    direction:
      'Agree to send it, then ask one qualifying question first so the email is worth sending and the conversation continues.',
  },
  {
    objection: 'Not interested',
    direction:
      'Do not argue. Concede it fully, then ask what they currently do about the thing you called about.',
  },
  {
    objection: 'We already have a solution',
    direction:
      'Normalise it, plenty of clients said the same, then ask what that setup actually looks like for them.',
  },
  {
    objection: 'Bad timing',
    direction:
      'Accept the timing, then ask when would be better and what is changing for them between now and then.',
  },
  {
    objection: 'Who are you / where did you get my number',
    direction:
      'Give the full name and company immediately and plainly, then the one line of context for why you called them specifically.',
  },
]

/** The response discipline every objection answer must follow. */
export const OBJECTION_FRAMEWORK = `Agree, then Inform, then Question Back.
- Agree: validate it. Never fight the objection, never counter it head on.
- Inform: one short honest line. No pitching, no feature list.
- Question Back: an open question that re-engages and pulls on something in their remit.
  It must be answerable with more than yes or no.`
