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
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(t)
  }, [startTime])

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const pushMsg = useCallback((type, content, extra = {}) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), type, content, ...extra }])
    setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 50)
  }, [])

  const getStageQs = useCallback((stg) => {
    const diff = currentSession.difficulty || 'medium'
    let qs = state.questions.filter((q) => q.roleId === currentSession.role.id && q.stage === stg)

    if (diff === 'hard') qs = qs.filter((q) => q.difficulty !== 'easy') || qs
    else if (diff === 'easy') qs = qs.filter((q) => q.difficulty !== 'hard') || qs

    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[qs[i], qs[j]] = [qs[j], qs[i]]
    }

    return qs.slice(0, state.settings.qcount || 3)
  }, [state, currentSession])

  const askQuestion = useCallback((q) => {
    setCurrentQ(q)
    setQAsked((n) => n + 1)
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
        technical: 'Moving into technical depth. Expect more role-specific questions from here.',
        behavioral: 'Final stretch. We are now exploring collaboration, ownership, and decision-making.'
      }

      pushMsg('sys', msgs[next] || '')
      const nextQs = getStageQs(next)
      setQQueue(nextQs.slice(1))
      if (nextQs.length) setTimeout(() => askQuestion(nextQs[0]), 700)
    } else {
      setFinished(true)
      pushMsg('sys', 'Interview complete. Generating your final evaluation report now.')
      finishInterview(log)
    }
  }, [getStageQs, askQuestion, pushMsg])

  const finishInterview = useCallback(async (log) => {
    const role = currentSession.role
    const bm = role.benchmark || {}

    let summary = null
    try {
      summary = await generateSessionSummary(log, role, bm)
    } catch {}

    const dimAvg = (dim) => (log.length
      ? Math.round((log.reduce((a, q) => a + (q[dim] || 0), 0) / log.length) * 10)
      : 0)

    const dims = {
      relevance: dimAvg('relevance'),
      depth: dimAvg('depth'),
      clarity: dimAvg('clarity'),
      correctness: dimAvg('correctness')
    }
    const overall = Math.round(Object.values(dims).reduce((a, b) => a + b, 0) / 4)

    const stageScores = {}
    STAGES.forEach((st) => {
      const sq = log.filter((q) => q.stage === st)
      if (sq.length) {
        stageScores[st] = Math.round(
          (sq.reduce((a, q) => a + (q.relevance + q.depth + q.clarity + q.correctness) / 4, 0) / sq.length) * 10
        )
      }
    })

    const sess = {
      id: 's' + Date.now(),
      candidateName: currentSession.name,
      candidateEmail: currentSession.email || '-',
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

  useEffect(() => {
    if (hasInitializedRef.current) return
    hasInitializedRef.current = true

    pushMsg('sys', `Session started for ${currentSession.role.title} at ${currentSession.difficulty} difficulty.`)
    const qs = getStageQs('intro')
    setQQueue(qs.slice(1))

    if (qs.length) {
      setTimeout(() => askQuestion(qs[0]), 500)
    } else {
      pushMsg('sys', 'No questions found for this role and stage. Add questions in Admin to continue.')
    }
  }, [askQuestion, currentSession, getStageQs, pushMsg])

  const submit = useCallback(async () => {
    const text = answer.trim()
    if (!text || loading || finished) return

    setAnswer('')
    pushMsg('user', text)

    if (!currentQ) {
      advanceStage(stageRef.current, qaLogRef.current)
      return
    }

    setLoading(true)
    setCurrentQ(null)

    try {
      const scores = await scoreAnswer(currentQ, text, currentSession.role)
      const entry = { ...scores, question: currentQ.text, answer: text, stage: stageRef.current, modelAnswer: currentQ.answer }
      const newLog = [...qaLogRef.current, entry]
      qaLogRef.current = newLog
      setQaLog(newLog)
      pushMsg('eval', '', { scores })

      const stageQsDone = newLog.filter((q) => q.stage === stageRef.current).length
      const stageTotal = state.settings.qcount || 3

      if (stageQsDone >= stageTotal) {
        setTimeout(() => advanceStage(stageRef.current, newLog), 1400)
      } else if (qQueue.length > 0) {
        const next = qQueue[0]
        setQQueue((prev) => prev.slice(1))
        setTimeout(() => askQuestion(next), 1400)
      } else {
        setTimeout(() => advanceStage(stageRef.current, newLog), 1400)
      }
    } catch (e) {
      const message = e?.message || 'Unknown scoring error.'
      pushMsg('sys', `Scoring error: ${message}`)
    }

    setLoading(false)
  }, [answer, loading, finished, currentQ, qQueue, pushMsg, advanceStage, askQuestion, currentSession, state])

  const stageIdx = STAGES.indexOf(stage)
  const totalQ = (state.settings.qcount || 3) * 3
  const progress = totalQ ? (qAsked / totalQ) * 100 : 0

  return (
    <div className="interview-shell">
      <header className="interview-topbar">
        <div>
          <div className="interview-session-label">Live Interview Session</div>
          <div className="interview-session-title">{currentSession.name}</div>
          <div className="interview-session-meta">{currentSession.role.title} · {currentSession.difficulty} difficulty</div>
        </div>

        <div className="interview-status-row">
          <div className="interview-status-pill">Question {qAsked}</div>
          <div className="interview-status-pill">{fmt(elapsed)}</div>
        </div>
      </header>

      <div className="interview-content">
        <aside className="interview-sidebar">
          <div className="card interview-panel">
            <div className="interview-panel-label">Session Progress</div>
            <div className="interview-progress-track">
              <div className="interview-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="interview-progress-meta">{qAsked} of {totalQ} questions explored</div>

            <div className="interview-stage-list">
              {STAGES.map((s, i) => (
                <div key={s} className={`interview-stage-item ${i < stageIdx ? 'done' : i === stageIdx ? 'active' : ''}`}>
                  <div className="interview-stage-index">{i < stageIdx ? '✓' : i + 1}</div>
                  <div>
                    <div className="interview-stage-name">{STAGE_LABELS[s]}</div>
                    <div className="interview-stage-note">
                      {i < stageIdx ? 'Completed' : i === stageIdx ? 'In progress' : 'Upcoming'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card interview-panel">
            <div className="interview-panel-label">Response Guidance</div>
            <div className="interview-guidance-list">
              <div className="interview-guidance-item">Answer with concrete examples when possible.</div>
              <div className="interview-guidance-item">Keep each response clear, structured, and direct.</div>
              <div className="interview-guidance-item">Use Ctrl+Enter to submit quickly.</div>
            </div>
          </div>
        </aside>

        <main className="interview-main">
          <div className="card interview-chat-card">
            <div className="interview-chat-header">
              <div>
                <div className="interview-panel-label">Conversation</div>
                <div className="interview-chat-subtitle">Structured prompts and live answer evaluation</div>
              </div>
            </div>

            <div ref={chatRef} className="interview-chat-stream">
              {messages.map((m) => <Message key={m.id} msg={m} />)}
              {loading && (
                <div className="interview-loading-row">
                  <Spinner size={14} />
                  <span>Analyzing your response...</span>
                </div>
              )}
            </div>

            <div className="interview-input-shell">
              <div className="interview-input-label">Your Response</div>
              <div className="interview-input-row">
                <textarea
                  ref={inputRef}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => { if (e.ctrlKey && e.key === 'Enter') submit() }}
                  disabled={loading || finished}
                  rows={3}
                  placeholder={finished ? 'Interview complete. Report is being prepared...' : 'Type your answer here...'}
                  style={{ flex: 1, resize: 'none' }}
                />
                <button
                  className="btn btn-primary"
                  onClick={submit}
                  disabled={loading || finished || !answer.trim()}
                  style={{ height: 54, padding: '0 22px', alignSelf: 'flex-end' }}
                >
                  {loading ? <Spinner size={14} /> : 'Send'}
                </button>
              </div>
              <div className="interview-input-note">Ctrl+Enter to submit your answer.</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function Message({ msg }) {
  if (msg.type === 'sys') return <div className="msg msg-sys animate-fade">{msg.content}</div>
  if (msg.type === 'ai') return <div className="msg msg-ai animate-fade">{msg.content}</div>
  if (msg.type === 'user') return <div className="msg msg-user animate-fade">{msg.content}</div>
  if (msg.type === 'eval') {
    return (
      <div className="msg-eval animate-fade">
        <EvalCard scores={msg.scores} />
      </div>
    )
  }
  return null
}

function EvalCard({ scores }) {
  const overall = Math.round((scores.overall || 5) * 10)
  const col = overall >= 70 ? 'var(--c-green-text)' : overall >= 50 ? 'var(--c-amber-text)' : 'var(--c-red-text)'

  return (
    <div>
      <div className="eval-card-header">
        <span className="eval-card-title">AI Evaluation</span>
        <span className="eval-card-score" style={{ color: col }}>{overall}%</span>
      </div>
      {['relevance', 'depth', 'clarity', 'correctness'].map((k) => (
        <ScoreBar key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={Math.round((scores[k] || 0) * 10)} />
      ))}
      <div className="eval-card-copy">
        <div style={{ marginBottom: 4 }}>{scores.feedback}</div>
        <div style={{ color: 'var(--c-green-text)' }}>Strength: {scores.strengths}</div>
        <div style={{ color: 'var(--c-red-text)' }}>Improve: {scores.improvements}</div>
      </div>
    </div>
  )
}
