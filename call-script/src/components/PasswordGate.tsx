import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

// NOTE: This is a lightweight client-side lock. Because the app is a static
// site, this password is present in the built JS and only keeps out casual
// users — it is not real security. For that, use a server-side login.
const PASSWORD = 'goldleads'
const STORAGE_KEY = 'oa_call_script_unlocked'

const NAVY = '#15213f'
const NAVY_DEEP = '#0f1729'
const MAGENTA = '#d6006e'
const MAGENTA_SOFT = '#ff5fa8'

export default function PasswordGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'yes'
    } catch {
      return false
    }
  })
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  const submit = () => {
    if (value.trim() === PASSWORD) {
      try {
        sessionStorage.setItem(STORAGE_KEY, 'yes')
      } catch {
        /* ignore storage errors */
      }
      setUnlocked(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  if (unlocked) return <>{children}</>

  const cardStyle: CSSProperties = {
    background: '#fff',
    borderRadius: 16,
    padding: '36px 32px',
    width: '100%',
    maxWidth: 380,
    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
    textAlign: 'center',
    boxSizing: 'border-box',
    fontFamily: 'Calibri, Arial, sans-serif',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: `linear-gradient(120deg, ${NAVY_DEEP} 0%, ${NAVY} 70%)`,
      }}
    >
      <div style={cardStyle}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 20,
            color: '#fff',
            background: `linear-gradient(135deg, ${MAGENTA} 0%, ${MAGENTA_SOFT} 100%)`,
          }}
        >
          OA
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>Live Call Script</h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>Enter the password to continue.</p>

        <input
          type="password"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          placeholder="Password"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            fontSize: 15,
            padding: '12px 14px',
            borderRadius: 10,
            border: `1px solid ${error ? '#dc2626' : '#d1d5db'}`,
            outline: 'none',
            marginBottom: error ? 8 : 16,
            fontFamily: 'inherit',
          }}
        />

        {error && (
          <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginBottom: 12, textAlign: 'left' }}>
            Incorrect password. Try again.
          </div>
        )}

        <button
          onClick={submit}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 15,
            color: '#fff',
            background: `linear-gradient(90deg, ${MAGENTA} 0%, ${MAGENTA_SOFT} 100%)`,
          }}
        >
          Unlock
        </button>
      </div>
    </div>
  )
}