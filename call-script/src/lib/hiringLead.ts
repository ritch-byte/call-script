/*
 * Reading the line a rep pastes into the Hiring Script.
 *
 * This lives in lib rather than in the component because the two versions of the Hiring
 * Script have deliberately different spiels but must read a lead identically. Held in the
 * component it got duplicated, and the copy in v1 sat two fixes behind the copy in v2 without
 * anything saying so. The divergence is meant to hold a spiel apart, not a parser.
 *
 * REPS PASTE WHOLE JOB-BOARD LISTINGS. That is the thing this went through three rounds to
 * learn. A lead usually has several openings, and the four fixed slots quietly folded them
 * into each other: a second role parked in the industry slot, a third with the industry stuck
 * on the end. Refusing that was better than pricing the wrong seat, but refusing is the wrong
 * answer to the common case, and a rep told to paste three times per lead stops using the
 * tool.
 *
 * So a lead has a LIST of seats, and the rep picks the one they are calling about. Where the
 * split is ambiguous the read-back shows it, which is the point: a visible wrong guess costs
 * one re-paste, an invisible one costs a call.
 */

export const URL_RE =
  /^(https?:\/\/|www\.)|\.(com|net|org|io|co|ai|ph|au|uk|us|ca|nz|sg|de|fr|es|it|nl|se|dk|in|jp|biz|info|dev|app|xyz|group|build)\b/i

/** A word that makes a phrase read as somebody's job rather than a company or a sector. */
export const TITLE_WORD =
  /^(chief|head|vp|svp|evp|president|vice|director|manager|managing|officer|founder|co-?founder|owner|proprietor|principal|partner|lead|supervisor|coordinator|specialist|executive|chairman|chairwoman|chair|superintendent|estimator|controller|comptroller|treasurer|counsel|attorney|foreman|buyer|planner|scheduler|dispatcher|recruiter|analyst|engineer|architect|surveyor|producer|editor|admin|c[eftmoi]o|cmo|cro|cpo|chro|cco|gm|md)$/i

export const ROLE_NOUN =
  /\s+(specialist|manager|officer|coordinator|administrator|administrative|administration|admin|assistant|clerk|analyst|executive|associate|lead|director|engineer|technician|agent|representative|rep|consultant|advisor|adviser|supervisor|controller|receptionist|accountant|bookkeeper|developer|designer|planner|scheduler|dispatcher|buyer|estimator|telephonist|nurse|driver|chef|cleaner|writer|paralegal|surveyor|architect|recruiter|auditor|underwriter|broker|teller|cashier)s?$/i

const SENIORITY =
  /^(senior|snr|sr|junior|jnr|jr|lead|head of|chief|principal|assistant|associate|trainee|graduate|entry level|experienced)\s+/i

/*
 * A phrase that OPENS on one of these is somebody's job whatever follows it, because the word
 * describes a person and not a thing: "Apprentice For Credit Control Department" is a real
 * advertised seat that ends in "Department" and contains no title word, so the two tests
 * below both miss it and it was refused as not reading like a job.
 *
 * Deliberately NOT folded into SENIORITY, which looks almost identical. SENIORITY is used to
 * STRIP words off the front when building the v2 opener's "who's in charge of ___", and
 * stripping "Apprentice" off this one leaves "for credit control department", which the rep
 * would read aloud. One list decides what a job is, the other decides what to remove, and
 * they only look like the same list.
 */
const ENTRY_ROLE = /^(apprentice|trainee|graduate|intern|cadet|deputy)\b/i

/** A phrase reads as a job if it ends in a role noun, opens on a title word, or is an entry seat. */
export function looksLikeARole(s: string): boolean {
  const t = (s || '').trim()
  if (!t) return false
  return (
    ROLE_NOUN.test(' ' + t) ||
    ENTRY_ROLE.test(t) ||
    t.split(/\s+/).some(w => TITLE_WORD.test(w))
  )
}

export interface HiringLead {
  jobTitle: string
  industry: string
  /** Every seat the paste appears to advertise, in the order they appeared. */
  seats: string[]
  url: string
  /**
   * How many leads the paste appears to hold, counted as lines carrying a website.
   *
   * Reps work off a spreadsheet with a row per lead, and selecting several rows is one drag.
   * A multi-row paste used to read as ONE lead: the second row's title, website and industry
   * landed in the seat list of the first, so the picker offered "financial services" and a
   * URL as seats to price, and the currency came from row one while the rep might be calling
   * row two. Nothing on screen said so. That is the invisible wrong guess this whole file is
   * written to avoid, so it is counted here and refused in hiringLeadIssue.
   */
  pastedRows: number
}

const LABEL =
  /^(job\s*title|title|role|position|industry|sector|hiring(\s*(for|position|role))?|they'?re hiring|open roles?|vacancies)\s*[:=-]\s*/i

export function parseHiringLead(line: string): HiringLead {
  const out: HiringLead = { jobTitle: '', industry: '', seats: [], url: '', pastedRows: 0 }

  /* Count the leads before anything is merged. A row without a website is a wrapped line of
     the row above it, not a lead, so only lines carrying one are counted. */
  out.pastedRows = (line || '')
    .split(/[\n\r]+/)
    .filter(l => l.split(/[\s,\t|;]+/).some(t => URL_RE.test(t))).length

  const rest: string[] = []
  for (const part of (line || '').split(/[,\t|;\n]+/).map(s => s.trim()).filter(Boolean)) {
    const tokens = part.split(/\s+/)
    const at = tokens.findIndex(t => URL_RE.test(t))
    if (at !== -1 && !out.url) {
      out.url = tokens.splice(at, 1)[0]
      const left = tokens.join(' ').trim()
      if (left) rest.push(left)
      continue
    }
    rest.push(part)
  }

  const fields = rest.map(s => s.replace(LABEL, '').trim()).filter(Boolean)
  if (!fields.length) return out

  /*
   * The first field carries the lead's own title, and often the industry and the first seat
   * along with it, because that is how a listing reads: "Practice Manager hospital & health
   * care Business Support Officer". splitFreeform pulls the three apart on capitalisation.
   */
  const ff = splitFreeform(fields[0])
  if (ff.jobTitle && ff.hiringPosition) {
    out.jobTitle = ff.jobTitle
    out.industry = ff.industry
    out.seats.push(ff.hiringPosition)
  } else {
    out.jobTitle = fields[0]
  }

  for (const field of fields.slice(1)) {
    if (looksLikeARole(field)) {
      /* "Account Executive market research" is a seat with the sector stuck on the end. */
      const split = splitTrailingSector(field)
      if (split && !out.industry) {
        out.seats.push(split.seat)
        out.industry = split.sector
      } else {
        out.seats.push(field)
      }
    } else if (!out.industry) {
      out.industry = field
    } else {
      out.seats.push(field)
    }
  }
  return out
}

/**
 * A capitalised head and a lower-case tail in one field: the head is the seat, the tail is
 * the sector. Only useful while no industry has been found, which the caller checks.
 */
function splitTrailingSector(field: string): { seat: string; sector: string } | null {
  const toks = field.split(/\s+/)
  if (toks.length < 3) return null
  let i = toks.length
  while (i > 1 && !/^[A-Z0-9&]/.test(toks[i - 1])) i--
  if (i === toks.length || i < 2) return null
  const seat = toks.slice(0, i).join(' ')
  const sector = toks.slice(i).join(' ')
  return looksLikeARole(seat) ? { seat, sector } : null
}

/*
 * One field, no commas: "Executive Chairman civil engineering SENIOR PROJECT MANAGER".
 *
 * The lead's own title comes first and contains a title word. The seat comes last and is
 * capitalised, because it was copied out of an advertisement. So take the seat off the BACK
 * first: doing the title first breaks on "Executive Chairman", where the second word is
 * itself a title word and a forward scan cannot tell whether it belongs to the title or
 * starts the seat. From the back that question never arises, because the run ends where lower
 * case begins.
 */
const JOINER = /^(of|for|at|the|a|an|and|&|in|on|to|with|from|de|du)$/i

function splitFreeform(text: string) {
  const toks = (text || '').split(/\s+/).filter(Boolean)
  const isCapped = (t: string) => /^[A-Z0-9&]/.test(t)
  const empty = { jobTitle: '', industry: '', hiringPosition: '' }
  if (toks.length < 3) return empty

  let seatAt = toks.length
  while (seatAt > 1 && isCapped(toks[seatAt - 1]) && toks.length - seatAt < 4) seatAt--
  /*
   * ONE MORE WORD IF IT IS A RANK, because the four-word cap cuts exactly those off.
   *
   * "Associate Partner accounting Apprentice For Credit Control Department" gave a seat of
   * "For Credit Control Department" - four words, cap reached, and "Apprentice" left behind on
   * the industry side. The seat then reads as a job that starts with "For", and the whole
   * point of the seniority is gone.
   *
   * These words only ever sit in FRONT of a seat, never at the end of a sector, so crossing
   * one costs nothing and there is no need to raise the cap generally.
   */
  if (
    seatAt > 1 &&
    isCapped(toks[seatAt - 1]) &&
    /^(apprentice|trainee|graduate|intern|cadet|deputy|senior|snr|sr|junior|jnr|jr|lead|principal)$/i.test(
      toks[seatAt - 1],
    )
  )
    seatAt--
  if (seatAt === toks.length) return empty
  const head = toks.slice(0, seatAt)

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

  /*
   * Walk the title forward, over capitalised words AND over joiner-plus-capitalised pairs,
   * alternating until neither applies.
   *
   * It used to be two loops in sequence, capitalised words first and then joiners, with the
   * joiner list "of|for|at". That gets "Head of Partnerships" right and "VP of Growth and
   * Marketing" wrong: the second loop stopped dead at "and", so the title came out as "VP of
   * Growth" and the industry as "and Marketing information technology & services", which is
   * then what the model is told the company does.
   *
   * Sequential loops cannot fix it by extending the list either, because a title alternates:
   * word, joiner, word, joiner, word. One loop that tries both moves each time handles any
   * order. "and" and "&" are in the list because a remit is routinely two things joined -
   * Growth and Marketing, Compliance & Risk.
   */
  const TITLE_JOINER = /^(of|for|at|and|&)$/i
  let end = first
  for (;;) {
    if (end + 1 < head.length && isCapped(head[end + 1])) {
      end++
      continue
    }
    if (end + 2 < head.length && TITLE_JOINER.test(head[end + 1]) && isCapped(head[end + 2])) {
      end += 2
      continue
    }
    break
  }
  /* Never finish on the joiner itself: "VP Growth &" was a title this produced. */
  while (end > first && TITLE_JOINER.test(head[end])) end--

  /*
   * Only trust this when lower case actually separated the two halves, and when what it
   * separated is a real sector rather than a joining word. "Head of Operations" otherwise
   * splits into a title of "Head", an industry of "of" and a seat of "Operations", which is
   * three wrong answers from one plausible-looking rule. A sector has at least one word that
   * is not a preposition.
   */
  const industry = head.slice(end + 1).join(' ')
  if (!industry || !industry.split(/\s+/).some(w => !JOINER.test(w))) return empty

  return { jobTitle: head.slice(start, end + 1).join(' '), industry, hiringPosition: toks.slice(seatAt).join(' ') }
}

/**
 * Why a lead cannot be used, for the rep, in their words. Empty string means it is fine.
 * Only the SEAT THEY PICKED is judged: the other chips can be noise without blocking.
 */
export function hiringLeadIssue(lead: HiringLead, seat: string): string {
  if (lead.pastedRows > 1)
    return `That paste holds ${lead.pastedRows} leads. Paste one row at a time, or the seats and the website end up coming from different companies.`
  if (!lead.jobTitle.trim())
    return 'Could not find the job title of the person being called. It goes first.'
  if (!lead.seats.length)
    return 'Could not find a seat they are hiring for. Put it after the industry.'
  const s = (seat || '').trim()
  if (!s) return 'Pick which seat you are calling about.'
  return ''
}

/*
 * "That does not read as a job title" USED TO BLOCK, and it has now refused two real seats:
 * "Apprentice For Credit Control Department" and "Brand Partnerships Administrative", both
 * straight off a live advertisement. It is a warning here instead, and the reasoning is the
 * asymmetry between the two ways it can be wrong.
 *
 * A false refusal is a hard stop. The rep has a real lead in front of them, the button is
 * dead, and nothing they can do to the paste is obviously right - so they either mangle the
 * seat until the tool relents, which puts a made-up seat into the script, or they skip the
 * lead. Both are worse than the thing the guard was protecting against.
 *
 * A false accept is now VISIBLE, which it was not when this check was written. The read-back
 * prints the seat, and the ownership note prints beside it. A rep who sees "Northwich Cheshire
 * United Kingdom" as the seat can see it in the line above the button before dialling.
 *
 * So the signal stays and the stop goes. That is the same rule the rest of this file follows:
 * a visible wrong guess costs one re-paste, an invisible one costs a call - and a wrongly
 * refused lead costs the call too.
 */
export function seatWarning(seat: string): string {
  const s = (seat || '').trim()
  if (!s) return ''
  if (s.split(/\s+/).length >= 3 && !looksLikeARole(s))
    return `"${s}" does not read like a job title. Check the company or the contact name has not ended up in the seat — if it is right, carry on.`
  return ''
}

/*
 * "a" or "an" for a job title. Vowel letters are the easy half. The other half is acronyms,
 * where what matters is how the letter is SAID: HR is "aitch" and takes "an", GL is "jee" and
 * takes "a". The acronym branch is capped at three letters, because reps paste straight off
 * the advertisement and an unbounded all-caps rule reads SENIOR as an acronym.
 */
const SOUNDS_VOWEL = /^[AEFHILMNORSX]+$/
/* Written with a vowel, said with a "y": utilities, user, union, European. These take "a". */
const SOUNDS_LIKE_YOU = /^(uni|use|usu|uti|utl|ubi|euro?|eu)/i

export function article(title: string): string {
  const first = (title || '').trim().split(/\s+/)[0] || ''
  if (/^[A-Z]{2,3}$/.test(first)) return SOUNDS_VOWEL.test(first[0]) ? 'an' : 'a'
  if (SOUNDS_LIKE_YOU.test(first)) return 'a'
  return /^[aeiou]/i.test(first) ? 'an' : 'a'
}

/* ------------------- does this seat belong to this person? -------------------
 *
 * The complaint this answers, raised by four reps: the lead says the advertised role has
 * nothing to do with them. It is not a scripting failure, it is the lead list. The list pairs
 * whoever was FINDABLE at a company with whatever that company POSTED, and the two often have
 * nothing to do with each other: a Channel Partner Success Manager called about an Office
 * Manager opening, a Chief Investment Officer called about a Paralegal.
 *
 * Scored on the thirteen title/seat pairs of one real list: four safe, five unknowable, four
 * plainly wrong. So the rep is walking into a correction on most calls with no warning, and a
 * warning is cheap. Shown before they dial, not after.
 *
 * THREE WAYS A SEAT CAN BE THEIRS, and they are different claims:
 *   1. HIRING IS THEIR JOB. An HR, People or Talent title owns the requisition for every
 *      function in the company. This is the one the first draft of this missed, and it is the
 *      only reason any pairing in that real list was safe.
 *   2. SAME FUNCTION. A payroll seat under a finance head.
 *   3. EXEC. A founder owns every hire at twenty staff and none at two thousand, and a lead
 *      list cannot see headcount, so this is its own answer rather than a yes.
 * Anything else and the opener is asserting a link nothing supports.
 */

type Fn =
  | 'finance' | 'people' | 'sales' | 'marketing' | 'ops' | 'it' | 'legal'
  | 'admin' | 'success' | 'procurement' | 'product' | 'unknown'

/*
 * EVERY SUFFIX IS SPELLED OUT, and that is not verbosity. Written the obvious way, as
 * /\b(financ|account|...)\b/, the trailing \b means a prefix can only match as a whole word:
 * "financ" never matches "Finance" and "account" never matches "Accounts", so most of this
 * table was dead and a Finance Director called about an Accounts Payable Clerk came back as
 * "probably not theirs". Two invented rows caught it; the eight real ones never touched those
 * branches. If you add a term here, spell its endings out.
 *
 * ORDER IS THE TIE-BREAK, and two orderings are load-bearing:
 *   people before finance, because payroll sits under HR as often as under finance, so an
 *     "HR & Payroll Coordinator" is an HR seat.
 *   success before finance, because "Account Manager" is a customer-facing seat and not an
 *     accounting one. Finance also requires a suffix on account (accounts, accounting,
 *     accountant) so that bare "Account" falls through to it.
 */
const FUNCTIONS: Array<[Fn, RegExp]> = [
  ['people', /\b(hr|human resources?|people|talent|recruit(ing|ment|er)?|l&d|employee relations)\b/i],
  ['success', /\b(client success|customer success|customer support|client servi(ce|ces)|customer servi(ce|ces)|account manage(r|ment))\b/i],
  ['finance', /\b(financ(e|ial)|account(s|ing|ant)|payroll|bookkeep(er|ing)?|credit control|audit(or|ing)?|treasur(y|er)|controller|comptroller|billing|invoic(e|ing))\b/i],
  ['legal', /\b(legal|paralegal|counsel|attorney|compliance|contracts?)\b/i],
  ['procurement', /\b(procure(ment)?|purchas(e|ing)|vendor|supplier|sourcing|buyer)\b/i],
  ['sales', /\b(sales|business development|bdr|sdr|revenue|commercial|channel)\b/i],
  ['marketing', /\b(marketing|brand(ing)?|growth|content|seo|advertis(ing|ement)?|communications?)\b/i],
  ['product', /\b(product|ux|designer)\b/i],
  ['it', /\b(software|developer|engineer(ing)?|data|technolog(y|ies)|systems?|devops|security)\b/i],
  ['ops', /\b(operations?|logistics|supply chain|warehouse|dispatch|project manager|scheduling|facilit(y|ies))\b/i],
  ['admin', /\b(executive assistant|office manager|administrat(or|ion)|receptionist|secretar(y|ial)|apprentice)\b/i],
]

/* Said out loud to the rep, so it has to read as English. "an it seat" does not. */
const SPOKEN: Record<Fn, string> = {
  finance: 'a finance',
  people: 'an HR',
  sales: 'a sales',
  marketing: 'a marketing',
  ops: 'an operations',
  it: 'a technical',
  legal: 'a legal',
  admin: 'an office-admin',
  success: 'a customer-facing',
  procurement: 'a purchasing',
  product: 'a product',
  unknown: '',
}

function functionOf(s: string): Fn {
  const t = ' ' + (s || '').toLowerCase() + ' '
  for (const [f, re] of FUNCTIONS) if (re.test(t)) return f
  return 'unknown'
}

/** Owns the requisition for every function, because hiring IS the function. */
const OWNS_HIRING = /\b(hr|human resource|people|talent|recruit|chro|chief people)\b/i

/*
 * True C-suite and ownership only. "Partner" is deliberately absent: in "People Partner" and
 * "HR Business Partner" it means a business partner and not an equity holder, and counting it
 * as exec swallowed every HR title on the list, which is exactly the group the opener is safe
 * for. The list is short on purpose.
 */
const EXEC_TITLE =
  /\b(chief|ceo|cfo|coo|cto|cio|cmo|cro|managing director|founder|owner|president|chairman|chairwoman)\b/i

export type Ownership = 'hires' | 'sameFunction' | 'exec' | 'unlikely'

export interface SeatOwnership {
  verdict: Ownership
  /** Said to the rep, not to the lead. One line, before they dial. */
  note: string
}

export function seatOwnership(jobTitle: string, seat: string): SeatOwnership {
  const title = (jobTitle || '').trim()
  const s = (seat || '').trim()
  if (!title || !s) return { verdict: 'unlikely', note: '' }

  if (OWNS_HIRING.test(title))
    return { verdict: 'hires', note: 'Hiring is their job, so any seat is theirs. Open assumptively.' }

  const a = functionOf(title)
  const b = functionOf(s)
  if (a === b && a !== 'unknown')
    return {
      verdict: 'sameFunction',
      note: `The seat and their own title are both on the ${SPOKEN[a].replace(/^an? /, '')} side. Open assumptively.`,
    }

  if (EXEC_TITLE.test(title))
    return {
      verdict: 'exec',
      note: 'Senior enough to own every hire at a small firm and none at a large one. Read the soft check at the end of beat 1 rather than skipping it.',
    }

  const seatSide = SPOKEN[b] ? `${SPOKEN[b]} seat` : 'a seat'
  const theirSide = SPOKEN[a] ? `, and they run ${SPOKEN[a].replace(/^an? /, '')}` : ''
  return {
    verdict: 'unlikely',
    note: `This is ${seatSide}${theirSide}, so it probably is not theirs. Expect the correction, and have the routing line ready.`,
  }
}

/*
 * The v2 opener asks who owns the function, so it needs the FUNCTION, not the job title.
 * Nobody is in charge of a Customer Support Specialist. Strip the seniority off the front and
 * the role noun off the back, and what is left is what that person runs. Three shapes come out
 * of it, because one phrasing does not fit every title:
 *   two or more words left -> say it bare        customer support, accounts payable
 *   one word left          -> "the X side"       the payroll side, the project side
 *   nothing stripped       -> name the hire      the Bookkeeper hire
 * The third is the honest fallback. A title that is one indivisible word gives no function to
 * ask about, and guessing one - bookkeeping from Bookkeeper - is how you end up asking who
 * runs a department that does not exist.
 */
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
  /* A slashed compound title leaves a dangling separator: Receptionist/Telephonist/ */
  t = t.replace(/[\s/\-&,]+$/, '').trim()
  if (!stripped || !t) return `the ${raw} hire`
  /* Said mid-sentence, not printed as a heading, so it is lower case either way. */
  const said = t.toLowerCase()
  return said.includes(' ') ? said : `the ${said} side`
}
