// src/pages/Admin.jsx
import { useState } from 'react'
import { useApp } from '../AppContext.jsx'
import Topbar, { Page } from '../components/Topbar.jsx'
import { Badge, Divider, EmptyState, Modal, StageBadge, DiffBadge, Tabs } from '../components/UI.jsx'
import { clearState } from '../utils/storage.js'
import { DEFAULT_ROLES, DEFAULT_QUESTIONS } from '../data/seed.js'

export default function Admin() {
  const { state, update, setScreen } = useApp()
  const [tab, setTab] = useState('roles')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Topbar title="Admin" actions={
        <button className="btn btn-sm btn-ghost" onClick={() => setScreen('login')}>← Exit</button>
      } />
      <Page>
        <Tabs
          tabs={[
            { id: 'roles', label: 'Job Roles' },
            { id: 'benchmarks', label: 'Benchmarks' },
            { id: 'questions', label: 'Question Bank' },
            { id: 'settings', label: 'Settings' }
          ]}
          active={tab} onChange={setTab}
        />
        {tab === 'roles' && <RolesTab />}
        {tab === 'benchmarks' && <BenchmarksTab />}
        {tab === 'questions' && <QuestionsTab />}
        {tab === 'settings' && <SettingsTab />}
      </Page>
    </div>
  )
}

// ─── ROLES TAB ───────────────────────────────────────
function RolesTab() {
  const { state, update } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', department: '', jd: '', areas: '' })

  const save = () => {
    if (!form.title || !form.jd) return alert('Title and job description are required')
    update(s => ({
      ...s,
      roles: [...s.roles, {
        id: 'r' + Date.now(),
        title: form.title, department: form.department || 'General',
        jd: form.jd, areas: form.areas,
        benchmark: { relevance: 72, depth: 72, clarity: 72, correctness: 72 },
        color: '#4F6EF7'
      }]
    }))
    setForm({ title: '', department: '', jd: '', areas: '' })
    setShowForm(false)
  }

  const del = (id) => {
    if (!confirm('Delete this role? This will not delete existing sessions.')) return
    update(s => ({ ...s, roles: s.roles.filter(r => r.id !== id) }))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>Job Roles</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Add Role</button>
      </div>

      {showForm && (
        <div className="card animate-slide" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 16 }}>New Role</h3>
          <div className="grid-2">
            <div className="form-group"><label>Role Title</label><input placeholder="e.g. Senior Data Scientist" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="form-group"><label>Department</label><input placeholder="e.g. Engineering" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label>Job Description</label><textarea rows={3} placeholder="Describe the role, responsibilities, and requirements..." value={form.jd} onChange={e => setForm(f => ({ ...f, jd: e.target.value }))} /></div>
          <div className="form-group"><label>Expertise Areas (comma-separated)</label><input placeholder="Python, Machine Learning, SQL" value={form.areas} onChange={e => setForm(f => ({ ...f, areas: e.target.value }))} /></div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={save}>Save Role</button>
          </div>
        </div>
      )}

      {!state.roles.length ? <EmptyState icon="📋" text="No roles yet. Add one above." /> :
        state.roles.map(role => (
          <div key={role.id} className="card card-sm animate-fade" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{role.title}</div>
                  <Badge color="blue">{role.department}</Badge>
                </div>
                <div style={{ fontSize: 13, color: 'var(--c-ink-3)', marginBottom: 8, lineHeight: 1.6, maxWidth: 640 }}>{role.jd}</div>
                <div>{(role.areas || '').split(',').map(a => <span key={a} style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 99, fontSize: 11, background: 'var(--c-bg-2)', color: 'var(--c-ink-3)', margin: 2, fontWeight: 500 }}>{a.trim()}</span>)}</div>
              </div>
              <button className="btn btn-sm btn-danger" onClick={() => del(role.id)}>Delete</button>
            </div>
          </div>
        ))
      }
    </div>
  )
}

// ─── BENCHMARKS TAB ──────────────────────────────────
function BenchmarksTab() {
  const { state, update } = useApp()

  const updateBM = (roleId, dim, val) => {
    update(s => ({
      ...s,
      roles: s.roles.map(r => r.id === roleId
        ? { ...r, benchmark: { ...r.benchmark, [dim]: parseInt(val) } }
        : r
      )
    }))
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 4 }}>Benchmark Profiles</h3>
        <p style={{ fontSize: 13, color: 'var(--c-ink-3)', lineHeight: 1.6 }}>
          Set expected minimum performance scores for each role. These are shown as overlay reference lines on the radar chart in candidate reports, and used for gap analysis.
        </p>
      </div>

      {!state.roles.length ? <EmptyState icon="📊" text="No roles defined yet. Create roles first." /> :
        state.roles.map(role => {
          const bm = role.benchmark || { relevance: 70, depth: 70, clarity: 70, correctness: 70 }
          return (
            <div key={role.id} className="card" style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{role.title}</div>
              <div style={{ fontSize: 12, color: 'var(--c-ink-3)', marginBottom: 16 }}>{role.department}</div>
              <div className="grid-2" style={{ gap: 20 }}>
                {['relevance', 'depth', 'clarity', 'correctness'].map(dim => (
                  <div key={dim}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                      <label style={{ margin: 0, textTransform: 'capitalize', fontSize: 13, color: 'var(--c-ink)', fontWeight: 500 }}>{dim}</label>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--c-primary)' }}>{bm[dim]}%</span>
                    </div>
                    <input type="range" min={0} max={100} step={5} value={bm[dim]}
                      onChange={e => updateBM(role.id, dim, e.target.value)}
                      style={{ width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--c-ink-4)', marginTop: 2 }}>
                      <span>Minimum bar</span><span>High bar</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

// ─── QUESTIONS TAB ────────────────────────────────────
function QuestionsTab() {
  const { state, update } = useApp()
  const [filterRole, setFilterRole] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ roleId: '', stage: 'intro', difficulty: 'medium', text: '', answer: '' })

  const filtered = state.questions.filter(q =>
    (!filterRole || q.roleId === filterRole) &&
    (!filterStage || q.stage === filterStage)
  )

  const save = () => {
    if (!form.roleId || !form.text) return alert('Role and question text required')
    update(s => ({ ...s, questions: [...s.questions, { id: 'q' + Date.now(), ...form }] }))
    setForm({ roleId: '', stage: 'intro', difficulty: 'medium', text: '', answer: '' })
    setShowForm(false)
  }

  const del = id => update(s => ({ ...s, questions: s.questions.filter(q => q.id !== id) }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <h3>Question Bank <span style={{ fontSize: 13, color: 'var(--c-ink-3)', fontWeight: 400 }}>({filtered.length} questions)</span></h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ width: 190 }}>
            <option value="">All roles</option>
            {state.roles.map(r => <option key={r.id} value={r.id}>{r.title.split('(')[0].trim()}</option>)}
          </select>
          <select value={filterStage} onChange={e => setFilterStage(e.target.value)} style={{ width: 140 }}>
            <option value="">All stages</option>
            <option value="intro">Intro</option>
            <option value="technical">Technical</option>
            <option value="behavioral">Behavioral</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Question</button>
        </div>
      </div>

      {showForm && (
        <div className="card animate-slide" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 16 }}>Add Question</h3>
          <div className="grid-2">
            <div className="form-group"><label>Role</label>
              <select value={form.roleId} onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}>
                <option value="">Select role...</option>
                {state.roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Stage</label>
              <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                <option value="intro">Intro</option>
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>Difficulty</label>
            <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="form-group"><label>Question Text</label><textarea rows={3} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="Enter the interview question..." /></div>
          <div className="form-group"><label>Model Answer (key points expected)</label><textarea rows={3} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="Core concepts, key terms, expected structure..." /></div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead><tr><th>Role</th><th>Stage</th><th>Diff</th><th style={{ minWidth: 280 }}>Question</th><th></th></tr></thead>
          <tbody>
            {filtered.map(q => {
              const role = state.roles.find(r => r.id === q.roleId)
              return (
                <tr key={q.id}>
                  <td style={{ fontSize: 12 }}>{role ? role.title.split('(')[0].trim() : '?'}</td>
                  <td><StageBadge stage={q.stage} /></td>
                  <td><DiffBadge difficulty={q.difficulty} /></td>
                  <td style={{ fontSize: 13, lineHeight: 1.6 }}>{q.text}</td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => del(q.id)}>✕</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── SETTINGS TAB ────────────────────────────────────
function SettingsTab() {
  const { state, update, setScreen } = useApp()
  const s = state.settings

  const set = (k, v) => update(prev => ({ ...prev, settings: { ...prev.settings, [k]: v } }))

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = 'recruitai_export.json'; a.click()
  }

  const reset = () => {
    if (!confirm('This will delete ALL data including sessions. Are you sure?')) return
    clearState()
    window.location.reload()
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="card" style={{ marginBottom: 14 }}>
        <h3 style={{ marginBottom: 16 }}>Session Defaults</h3>
        <div className="grid-2">
          <div className="form-group">
            <label>Default Difficulty</label>
            <select value={s.difficulty} onChange={e => set('difficulty', e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="form-group">
            <label>Questions Per Stage</label>
            <select value={s.qcount} onChange={e => set('qcount', parseInt(e.target.value))}>
              <option value={2}>2 questions</option>
              <option value={3}>3 questions</option>
              <option value={4}>4 questions</option>
              <option value={5}>5 questions</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Hire Recommendation Threshold (%)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <input type="range" min={0} max={100} step={5} value={s.threshold}
              onChange={e => set('threshold', parseInt(e.target.value))}
              style={{ flex: 1 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--c-primary)', fontSize: 15, minWidth: 40 }}>{s.threshold}%</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--c-ink-3)', marginTop: 4 }}>Candidates scoring above this threshold receive a "Recommend: Hire" verdict</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 4 }}>Data Management</h3>
        <div style={{ fontSize: 13, color: 'var(--c-ink-3)', marginBottom: 14 }}>
          {state.sessions.length} session{state.sessions.length !== 1 ? 's' : ''} stored · {state.questions.length} questions in bank · {state.roles.length} roles defined
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm" onClick={exportData}>Export JSON</button>
          <button className="btn btn-sm btn-danger" onClick={reset}>Reset All Data</button>
        </div>
      </div>
    </div>
  )
}
