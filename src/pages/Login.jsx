// src/pages/Login.jsx
import { useApp } from '../AppContext.jsx'

const ROLES = [
  {
    id: 'admin', icon: '⚙️', title: 'Admin',
    desc: 'Manage job roles, benchmark profiles, question bank, and platform settings',
    color: '#4F6EF7'
  },
  {
    id: 'interviewer', icon: '🧑‍💼', title: 'Interviewer',
    desc: 'Launch sessions with custom candidates, monitor progress, and review full evaluation reports',
    color: '#8B5CF6'
  },
  {
    id: 'candidate', icon: '🎯', title: 'Candidate',
    desc: 'Complete a structured interview and receive AI-powered scoring, feedback, and benchmark comparison',
    color: '#10B981'
  }
]

export default function Login() {
  const { setScreen } = useApp()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '16px 32px', borderBottom: 'var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--c-surface)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, color: 'var(--c-primary)' }}>Recruit</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500,
            background: 'var(--c-primary)', color: '#fff', padding: '3px 7px', borderRadius: 4
          }}>AI</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--c-ink-3)', fontWeight: 500 }}>Enterprise Interview Simulation Platform</div>
      </header>

      {/* Hero */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px'
      }}>
        <div style={{ maxWidth: 520, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontSize: '2.2rem', marginBottom: 10, lineHeight: 1.2 }}>
              Intelligent Interview<br />Simulation
            </h1>
            <p style={{ color: 'var(--c-ink-3)', fontSize: 15, lineHeight: 1.7 }}>
              AI-powered structured interviews with real-time scoring,
              benchmark comparison, and hiring recommendations.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => setScreen(role.id === 'candidate' ? 'cand-setup' : role.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 20px', borderRadius: 'var(--radius-lg)',
                  border: 'var(--border-2)', background: 'var(--c-surface)',
                  cursor: 'pointer', transition: 'all .15s', textAlign: 'left',
                  fontFamily: 'var(--font-body)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = role.color
                  e.currentTarget.style.background = '#fafbff'
                  e.currentTarget.style.boxShadow = `0 4px 16px ${role.color}22`
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,.14)'
                  e.currentTarget.style.background = 'var(--c-surface)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: role.color + '18', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  flexShrink: 0
                }}>{role.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3, color: 'var(--c-ink)' }}>{role.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--c-ink-3)', lineHeight: 1.5 }}>{role.desc}</div>
                </div>
                <div style={{ color: role.color, fontSize: 18, opacity: .6 }}>›</div>
              </button>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--c-ink-4)', marginTop: 24 }}>
            All data stored locally in your browser · Powered by Ollama
          </p>
        </div>
      </div>
    </div>
  )
}


