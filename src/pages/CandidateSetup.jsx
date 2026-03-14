// src/pages/CandidateSetup.jsx
import { useState } from 'react'
import { useApp } from '../AppContext.jsx'
import Topbar, { Page } from '../components/Topbar.jsx'
import { ProgressSteps } from '../components/UI.jsx'

export default function CandidateSetup() {
  const { state, setScreen, setCurrentSession } = useApp()
  const [form, setForm] = useState({ name: '', email: '', roleId: '', experience: '2-3', intro: '' })

  const start = () => {
    if (!form.name || !form.roleId) return alert('Please enter your name and select a role')
    const role = state.roles.find(r => r.id === form.roleId)
    setCurrentSession({ ...form, role, difficulty: state.settings.difficulty, sessionSource: 'candidate' })
    setScreen('interview')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Topbar actions={
        <button className="btn btn-sm btn-ghost" onClick={() => setScreen('login')}>← Back</button>
      } />
      <Page>
        <div style={{ maxWidth: 560, margin: '20px auto' }}>
          <ProgressSteps steps={['Profile', 'Interview', 'Report']} current={0} />
          <div className="card">
            <h2 style={{ marginBottom: 4 }}>Your Profile</h2>
            <p style={{ color: 'var(--c-ink-3)', fontSize: 13, marginBottom: 20 }}>Fill in your details to begin the structured interview session.</p>

            <div className="grid-2">
              <div className="form-group"><label>Full Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" /></div>
              <div className="form-group"><label>Email Address</label><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@email.com" /></div>
            </div>

            <div className="form-group">
              <label>Position Applying For *</label>
              <select value={form.roleId} onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}>
                <option value="">Select a position...</option>
                {state.roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Years of Experience</label>
              <select value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}>
                <option value="0-1">0–1 years (Fresher / Junior)</option>
                <option value="2-3">2–3 years</option>
                <option value="4-6">4–6 years (Mid-level)</option>
                <option value="7+">7+ years (Senior / Lead)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Brief Introduction (optional)</label>
              <textarea rows={3} value={form.intro} onChange={e => setForm(f => ({ ...f, intro: e.target.value }))} placeholder="Tell us a bit about yourself, your background, and what excites you about this role..." />
            </div>

            {form.roleId && (
              <div style={{ background: 'var(--c-bg-2)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 16, fontSize: 13, color: 'var(--c-ink-3)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--c-ink)' }}>Interview format: </strong>
                3 stages — Introduction ({state.settings.qcount} questions) → Technical Deep-Dive ({state.settings.qcount} questions) → Behavioral ({state.settings.qcount} questions).
                Each answer is scored in real time by AI on Relevance, Depth, Clarity, and Correctness.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-lg" onClick={start}>Start Interview →</button>
            </div>
          </div>
        </div>
      </Page>
    </div>
  )
}
