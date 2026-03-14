// src/pages/Interview.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '../AppContext.jsx'
import { scoreAnswer, generateSessionSummary } from '../utils/ai.js'
import { ScoreBar, Spinner } from '../components/UI.jsx'

const STAGES = ['intro', 'technical', 'behavioral']
const STAGE_LABELS = { intro: 'Introduction', technical: 'Technical', behavioral: 'Behavioral' }

export default function Interview() {
  const { state, currentSession, addSession, setViewingReport, setScreen } = useApp()

  const [messages, setMessages] = useState([])
  const [qaLog, setQaLog] = useState([])
  const [stage, setStage] = useState('intro')
  const [stageComplete, setStageComplete] = useState({ intro: false, technical: false, behavioral: false })
  const [qQueue, setQQueue] = useState([])
  const [currentQ, setCurrentQ] = useState(null)
  const [qAsked, setQAsked] = useState(0)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)

  const chatRef = useRef(null)
  const inputRef = useRef(null)
  const qaLogRef = useRef([])
  const stageRef = useRef('intro')

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(t)
  }, [startTime])

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const pushMsg = useCallback((type, content, extra = {}) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), type, content, ...extra }])
    setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 50)
  }, [])

  const getStageQs = useCallback((stg) => {
    const diff = currentSession.difficulty || 'medium'
    let qs = state.questions.filter(q => q.roleId === currentSession.role.id && q.stage === stg)
    if (diff === 'hard') qs = qs.filter(q => q.difficulty !== 'easy') || qs
    else if (diff === 'easy') qs = qs.filter(q => q.difficulty !== 'hard') || qs
    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qs[i], qs[j]] = [qs[j], qs[i]]
    }
    return qs.slice(0, state.settings.qcount || 3)
  }, [state, currentSession])

  const askQuestion = useCallback((q) => {
    setCurrentQ(q)
    setQAsked(n => n + 1)
    pushMsg('ai', q.text)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [pushMsg])

  const advanceStage = useCallback((currentStage, log) => {
    const idx = STAGES.indexOf(currentStage)
    if (idx < STAGES.length - 1) {
      const next = STAGES[idx + 1]
      stageRef.current = next
      setStage(next)
      const msgs = {
        technical: '🔧 Moving to Technical questions — now let\'s explore your domain expertise in depth.',
        behavioral: '🧠 Final stage — Behavioral questions to understand how you collaborate and handle challenges.'
      }
      pushMsg('sys', msgs[next] || '')
      const nextQs = getStageQs(next)
      setQQueue(nextQs.slice(1))
      if (nextQs.length) setTimeout(() => askQuestion(nextQs[0]), 700)
    } else {
      setFinished(true)
      pushMsg('sys', '✅ Interview complete — generating your personalized evaluation report...')
      finishInterview(log)
    }
  }, [getStageQs, askQuestion, pushMsg])

  const finishInterview = useCallback(async (log) => {
    const role = currentSession.role
    const bm = role.benchmark || {}

    let summary = null
    try { summary = await generateSessionSummary(log, role, bm) } catch (e) {}

    const dimAvg = dim => log.length
      ? Math.round(log.reduce((a, q) => a + (q[dim] || 0), 0) / log.length * 10)
      : 0
    const dims = { relevance: dimAvg('relevance'), depth: dimAvg('depth'), clarity: dimAvg('clarity'), correctness: dimAvg('correctness') }
    const overall = Math.round(Object.values(dims).reduce((a, b) => a + b, 0) / 4)

    const stageScores = {}
    STAGES.forEach(st => {
      const sq = log.filter(q => q.stage === st)
      if (sq.length) {
        stageScores[st] = Math.round(sq.reduce((a, q) => a + (q.relevance + q.depth + q.clarity + q.correctness) / 4, 0) / sq.length * 10)
      }
    })

    const sess = {
      id: 's' + Date.now(),
      candidateName: currentSession.name,
      candidateEmail: currentSession.email || '—',
      role: role.title,
      roleId: role.id,
      difficulty: currentSession.difficulty,
      date: new Date().toISOString(),
      overallScore: overall,
      threshold: state.settings.threshold,
      stageScores,
      dimensions: dims,
      benchmark: bm,
      qaLog: log,
      summary,
      duration: Math.floor((Date.now() - startTime) / 1000)
    }
    addSession(sess)
    setViewingReport(sess)
    setScreen('report')
  }, [currentSession, state, startTime, addSession, setViewingReport, setScreen])

  // Init
  useEffect(() => {
    pushMsg('sys', `Session started — ${currentSession.role.title} · ${currentSession.difficulty} difficulty`)
    const qs = getStageQs('intro')
    setQQueue(qs.slice(1))
    if (qs.length) setTimeout(() => askQuestion(qs[0]), 500)
    else pushMsg('sys', '⚠️ No questions found for this role/stage. Please add questions in Admin.')
  }, [])

  const submit = useCallback(async () => {
    const text = answer.trim()
    if (!text || loading || finished) return
    setAnswer('')
    pushMsg('user', text)
    if (!currentQ) { advanceStage(stageRef.current, qaLogRef.current); return }

    setLoading(true)
    setCurrentQ(null)

    try {
      const scores = await scoreAnswer(currentQ, text, currentSession.role)
      const entry = { ...scores, question: currentQ.text, answer: text, stage: stageRef.current, modelAnswer: currentQ.answer }
      const newLog = [...qaLogRef.current, entry]
      qaLogRef.current = newLog
      setQaLog(newLog)
      pushMsg('eval', '', { scores })

      const stageQsDone = newLog.filter(q => q.stage === stageRef.current).length
      const stageTotal = state.settings.qcount || 3

      if (stageQsDone >= stageTotal) {
        setTimeout(() => advanceStage(stageRef.current, newLog), 1400)
      } else if (qQueue.length > 0) {
        const next = qQueue[0]
        setQQueue(prev => prev.slice(1))
        setTimeout(() => askQuestion(next), 1400)
      } else {
        setTimeout(() => advanceStage(stageRef.current, newLog), 1400)
      }
    } catch (e) {
      const message = e?.message || 'Unknown scoring error.'
      pushMsg('sys', `⚠️ Scoring error: ${message}`)
    }
    setLoading(false)
  }, [answer, loading, finished, currentQ, qQueue, pushMsg, advanceStage, askQuestion, currentSession, state])

  const stageIdx = STAGES.indexOf(stage)
  const totalQ = (state.settings.qcount || 3) * 3

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Topbar */}
      <header style={{
        background: 'var(--c-surface)', borderBottom: 'var(--border-2)',
        padding: '0 20px', height: 52, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: 'var(--c-primary)' }}>RecruitAI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--c-ink-3)' }}>{currentSession.name} · {currentSession.role.title}</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
            background: 'var(--c-blue-bg)', color: 'var(--c-primary)',
            padding: '3px 9px', borderRadius: 99
          }}>Q {qAsked}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--c-ink-3)' }}>{fmt(elapsed)}</span>
        </div>
      </header>

      {/* Stage bar */}
      <div style={{
        background: 'var(--c-surface)', borderBottom: 'var(--border)',
        padding: '8px 20px', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0
      }}>
        {STAGES.map((s, i) => (
          <div key={s} className={`stage-pill ${i < stageIdx ? 'done' : i === stageIdx ? 'active' : ''}`}>
            {i < stageIdx ? '✓ ' : `${i + 1}. `}{STAGE_LABELS[s]}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 12, color: 'var(--c-ink-3)' }}>{qAsked} / {totalQ} questions</div>
        {/* Progress bar */}
        <div style={{ width: 80, height: 4, background: 'var(--c-bg-3)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(qAsked / totalQ) * 100}%`, background: 'var(--c-primary)', borderRadius: 99, transition: 'width .4s' }} />
        </div>
      </div>

      {/* Chat */}
      <div ref={chatRef} style={{
        flex: 1, overflowY: 'auto', padding: '20px',
        display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0
      }}>
        {messages.map(m => <Message key={m.id} msg={m} />)}
        {loading && (
          <div style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--c-ink-3)' }}>
            <Spinner size={14} /> Analyzing your response…
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        background: 'var(--c-surface)', borderTop: 'var(--border-2)',
        padding: '14px 20px', flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <textarea
            ref={inputRef}
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') submit() }}
            disabled={loading || finished}
            rows={2}
            placeholder={finished ? 'Interview complete — generating your report…' : 'Type your answer here…'}
            style={{ flex: 1, resize: 'none' }}
          />
          <button className="btn btn-primary" onClick={submit} disabled={loading || finished || !answer.trim()}
            style={{ height: 48, padding: '0 20px', alignSelf: 'flex-end' }}>
            {loading ? <Spinner size={14} /> : 'Send'}
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--c-ink-4)', marginTop: 5 }}>Ctrl+Enter to submit · Responses scored by AI in real time</div>
      </div>
    </div>
  )
}

function Message({ msg }) {
  if (msg.type === 'sys') return (
    <div className="msg msg-sys animate-fade">{msg.content}</div>
  )
  if (msg.type === 'ai') return (
    <div className="msg msg-ai animate-fade">{msg.content}</div>
  )
  if (msg.type === 'user') return (
    <div className="msg msg-user animate-fade">{msg.content}</div>
  )
  if (msg.type === 'eval') return (
    <div className="msg-eval animate-fade">
      <EvalCard scores={msg.scores} />
    </div>
  )
  return null
}

function EvalCard({ scores }) {
  const overall = Math.round((scores.overall || 5) * 10)
  const col = overall >= 70 ? 'var(--c-green-text)' : overall >= 50 ? 'var(--c-amber-text)' : 'var(--c-red-text)'
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>AI Evaluation</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: col }}>{overall}%</span>
      </div>
      {['relevance', 'depth', 'clarity', 'correctness'].map(k => (
        <ScoreBar key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={Math.round((scores[k] || 0) * 10)} />
      ))}
      <div style={{ marginTop: 10, fontSize: 12, color: 'var(--c-ink-3)', lineHeight: 1.65 }}>
        <div style={{ marginBottom: 4 }}>{scores.feedback}</div>
        <div style={{ color: 'var(--c-green-text)' }}>✓ {scores.strengths}</div>
        <div style={{ color: 'var(--c-red-text)' }}>↑ {scores.improvements}</div>
      </div>
    </div>
  )
}
