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
