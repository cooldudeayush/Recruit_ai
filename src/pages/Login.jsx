import { useApp } from '../AppContext.jsx'

const ROLES = [
  {
    id: 'admin',
    icon: '01',
    title: 'Admin',
    accent: 'Platform Control',
    desc: 'Manage job roles, benchmark profiles, question bank, and platform settings',
    color: '#4F6EF7'
  },
  {
    id: 'interviewer',
    icon: '02',
    title: 'Interviewer',
    accent: 'Live Session Desk',
    desc: 'Launch sessions with custom candidates, monitor progress, and review full evaluation reports',
    color: '#8B5CF6'
  },
  {
    id: 'candidate',
    icon: '03',
    title: 'Candidate',
    accent: 'Guided Experience',
    desc: 'Complete a structured interview and receive AI-powered scoring, feedback, and benchmark comparison',
    color: '#10B981'
  }
]

export default function Login() {
  const { setScreen } = useApp()

  const nextScreen = (roleId) => {
    if (roleId === 'candidate') return 'cand-setup'
    if (roleId === 'admin') return 'admin-gate'
    return roleId
  }

  return (
    <div className="login-shell">
      <header className="login-header">
        <div className="login-brand">
          <span className="login-brand-word">Recruit</span>
          <span className="login-brand-tag">AI</span>
        </div>
        <div className="login-header-badge">Prototype Experience</div>
      </header>

      <main className="login-main">
        <div className="login-hero">
          <div className="login-eyebrow">Interactive Hiring Workflow</div>

          <div className="login-title-wrap">
            <div className="login-orb login-orb-left" />
            <div className="login-orb login-orb-right" />
            <h1 className="login-title">
              Intelligent Interview
              <br />
              Simulation
            </h1>
          </div>

          <p className="login-subtitle">
            AI-powered structured interviews with real-time scoring, benchmark
            comparison, and hiring recommendations.
          </p>

          <div className="login-metrics">
            <div className="login-metric-card">
              <span className="login-metric-value">3</span>
              <span className="login-metric-label">Role Modes</span>
            </div>
            <div className="login-metric-card">
              <span className="login-metric-value">Live</span>
              <span className="login-metric-label">Evaluation Flow</span>
            </div>
            <div className="login-metric-card">
              <span className="login-metric-value">360</span>
              <span className="login-metric-label">Report View</span>
            </div>
          </div>

          <div className="login-role-list">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => setScreen(nextScreen(role.id))}
                className="login-role-card"
                style={{ '--role-color': role.color }}
              >
                <div className="login-role-glow" />
                <div className="login-role-index">{role.icon}</div>
                <div className="login-role-copy">
                  <div className="login-role-topline">{role.accent}</div>
                  <div className="login-role-title">{role.title}</div>
                  <div className="login-role-desc">{role.desc}</div>
                </div>
                <div className="login-role-arrow">→</div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
