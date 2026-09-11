/*
 * offerWindow: the two days a rep can actually offer, counted from today.
 *
 * This file used to hold four things - URL_RE, pluralTitle, parseIndustryLead and this one. The
 * other three existed for the Spiel Builder and then for the Personalised Script, and both of
 * those screens have now been removed. Rather than leave them as dead code carrying comments
 * that explain screens nobody can open, they went with their last caller. Git has them.
 *
 * The rule they were here to serve still stands, and lives in tools/sync-from-v2.sh: if a
 * change is about how a lead is read or how its words are formed, it belongs in a lib and is
 * shared, because only the spiel is meant to diverge between v1 and v2.
 */

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
