import { useState } from 'react'
import { useApp } from '../AppContext.jsx'

const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'admin123'

export default function AdminGate() {
  const { unlockAdmin, setScreen } = useApp()
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()

    if (passcode.trim() !== ADMIN_PASSCODE) {
      setError('Incorrect passcode. Try again.')
      return
    }

    setError('')
    unlockAdmin()
    setScreen('admin')
  }

  return (
    <div className="login-shell">
      <header className="login-header">
        <div className="login-brand">
          <span className="login-brand-word">Recruit</span>
          <span className="login-brand-tag">AI</span>
        </div>
        <button className="btn btn-sm btn-ghost" onClick={() => setScreen('login')}>Back</button>
      </header>

      <main className="login-main">
        <div className="admin-gate-card">
          <div className="screen-eyebrow">Admin Access</div>
          <h1 className="screen-title" style={{ marginBottom: 10 }}>Enter admin passcode</h1>
          <p className="screen-subtitle" style={{ marginBottom: 20 }}>
            This lightweight gate protects the configuration workspace during demos.
          </p>

          <form onSubmit={submit}>
            <div className="form-group">
              <label>Passcode</label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Enter admin passcode"
                autoFocus
              />
            </div>

            {error && <div className="admin-gate-error">{error}</div>}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-sm" onClick={() => setScreen('login')}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">Unlock Admin</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
