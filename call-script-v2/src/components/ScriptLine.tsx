/*
 * One line of a generated script, with the stage marks rendered rather than spoken.
 *
 * A rep reads these aloud off the screen, so anything that is a direction and not a word
 * has to look unlike the words. [pause] becomes a chip, (softer) goes small and grey, and
 * the rest stays plain text at reading size.
 *
 * Moved out of components/SpielBuilder.tsx when that screen was removed on 2026-09-09. Both
 * remaining generators render through it, so it is its own file now instead of an export
 * from a screen that could be deleted from under them.
 */

const NAVY = '#0f1729'
const MAGENTA = '#d6006e'
const PINK = '#ff5fa8'

const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'

/* Pauses and directions read as stage marks, not as words to say. */
const MARK_RE =
  /(\[[^\]]{2,20}\]|\((?:slow|slower|slowly|deliberate|softer|soft|warm|warmer|faster|beat|smile|pause|lighter|drop)\))/gi
const IS_PAUSE = /^(pause|beat|silence|long pause)$/i

export function ScriptLine({ text, size = 18, dim = NAVY }: { text: string; size?: number; dim?: string }) {
  return (
    <>
      {text.split(MARK_RE).map((part, i) => {
        if (!part) return null
        if (/^\[/.test(part)) {
          const inner = part.slice(1, -1).trim()
          if (IS_PAUSE.test(inner))
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  margin: '0 4px',
                  padding: '1px 7px',
                  borderRadius: 3,
                  background: '#fce7f0',
                  color: MAGENTA,
                  fontFamily: MONO,
                  fontSize: size * 0.6,
                  letterSpacing: '0.1em',
                  verticalAlign: 'middle',
                }}
              >
                {inner.toUpperCase()}
              </span>
            )
          return (
            <span
              key={i}
              style={{ color: MAGENTA, fontWeight: 600, borderBottom: `1px dashed ${PINK}` }}
            >
              {part}
            </span>
          )
        }
        if (/^\(/.test(part))
          return (
            <span key={i} style={{ color: '#9aa3b2', fontStyle: 'italic', fontSize: size * 0.8 }}>
              {part}{' '}
            </span>
          )
        return (
          <span key={i} style={{ color: dim }}>
            {part}
          </span>
        )
      })}
    </>
  )
}

export default ScriptLine
