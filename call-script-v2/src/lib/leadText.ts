/*
 * Reading and saying a lead: the text helpers the generators share.
 *
 * These three lived in components/SpielBuilder.tsx until the Spiel Builder was removed on
 * 2026-09-09. Both remaining generators imported them from there, which made a component
 * file load-bearing for two other screens — the same trap that put v1's lead parser two
 * fixes behind v2's before hiringLead.ts existed.
 *
 * The rule is the one in tools/sync-from-v2.sh: if a change is about how a lead is read or
 * how its words are formed, it belongs in a lib and is shared. Only the spiel diverges.
 */

/** What a pasted field has to look like to be the website. */
export const URL_RE =
  /^(https?:\/\/|www\.)|\.(com|net|org|io|co|ai|ph|au|uk|us|ca|nz|sg|de|fr|es|it|nl|se|dk|in|jp|biz|info|dev|app|xyz|group|build)\b/i

/**
 * "VP of Marketing" reads back as "VPs of Marketing".
 *
 * A comma in the title is the rank, then the remit: "VP, Growth & Performance". Pluralising
 * the whole thing gives "VP, Growth & Performances", which is what a rep would trip over
 * reading aloud. The rank alone is what people actually say back, so a comma title
 * pluralises its head and drops the rest: "and for VPs like you..."
 */
export function pluralTitle(title: string): string {
  const t = title.trim()
  if (!t) return ''
  const add = (w: string) => (/s$/i.test(w) ? w : w + 's')
  const comma = t.match(/^([^,]+),\s*.+$/)
  if (comma) return add(comma[1].trim())
  const m = t.match(/^(.*?)(\s+(?:of|for|at)\s+.*)$/i)
  return m ? add(m[1]) + m[2] : add(t)
}

/** The two days the rep can actually offer, counted from today. */
export function offerWindow(now = new Date()) {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const picks: Array<{ name: string; out: number }> = []
  for (let i = 2; i <= 10 && picks.length < 2; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    picks.push({ name: names[d.getDay()], out: i })
  }
  const toSunday = 7 - now.getDay()
  const thisWeek = (p: { out: number }) => p.out < toSunday
  const [a, b] = picks
  const taken = [a.name, b.name]
  const fallbackDay = ['Tuesday', 'Wednesday', 'Thursday'].find(d => !taken.includes(d))
  return {
    offer: `${a.name} or ${b.name}`,
    fallback:
      thisWeek(a) && thisWeek(b) ? `${fallbackDay} next week` : `${fallbackDay} the week after`,
  }
}

/* ------------------- the three-field paste, shared -------------------
 *
 * Job title, website, industry. Lived in components/IndustryScript.tsx until 2026-09-11,
 * when a second screen needed the same paste. That screen has since been removed and this
 * STAYS here anyway: IndustryScript.tsx is on the DIVERGED list, so a parser inside it is a
 * parser that can be fixed on one version and not the other. That is the trap this lib was
 * created to close when the Spiel Builder was removed and took ScriptLine with it, and it
 * does not stop being a trap because there is one caller again.
 *
 * Reading a lead is shared. Only the spiel diverges.
 */
export interface IndustryLead {
  title: string
  industry: string
  url: string
}

/*
 * THE WEBSITE IS THE SEPARATOR: job title, website, industry.
 *
 * Comma-splitting cannot read this input, and the reason is worth writing down because it is
 * not obvious. Job titles contain commas. "VP, Growth & Performance" is one title, and a
 * comma-splitter reads it as two fields, hands "VP" to the title and drops the rest into
 * whatever slot is next. That is exactly what happened: the industry came out empty and
 * "Growth & Performance retail" ended up filed as the company name.
 *
 * A URL cannot appear inside a job title or inside an industry, which makes it the only
 * unambiguous delimiter in the line. So everything before it is the title, commas and
 * ampersands and all, and everything after it is the industry.
 *
 * The old order still works. If nothing follows the website, the part in front of it is
 * comma-split the way it always was, so "Practice Manager, dental, ashfielddental.com.au"
 * reads the same as it did before.
 */
const LABEL =
  /^(job\s*)?(title|role|position|industry|sector|vertical|niche|website|site|url)\s*[:=-]\s*/i

export function parseIndustryLead(line: string): IndustryLead {
  const out: IndustryLead = { title: '', industry: '', url: '' }
  const raw = (line || '').trim()
  if (!raw) return out

  const tokens = raw.split(/\s+/)
  const at = tokens.findIndex(t => URL_RE.test(t))

  const tidy = (x: string) => x.replace(/^[\s,;|]+|[\s,;|]+$/g, '').replace(LABEL, '').trim()

  if (at !== -1) {
    out.url = tokens[at]
    const before = tidy(tokens.slice(0, at).join(' '))
    const after = tidy(tokens.slice(at + 1).join(' '))
    if (after) {
      /* job title, website, industry - the order the line is meant to be in */
      out.title = before
      out.industry = after
      return out
    }
    /* nothing after the website, so it is the older comma-separated order */
    const parts = before.split(/\s*[,;|]\s*/).map(tidy).filter(Boolean)
    out.title = parts[0] || ''
    out.industry = parts.slice(1).join(', ')
    return out
  }

  /* no website at all: first comma segment is the title, the rest is the industry */
  const parts = raw.split(/\s*[,;|]\s*/).map(tidy).filter(Boolean)
  out.title = parts[0] || ''
  out.industry = parts.slice(1).join(', ')
  return out
}
