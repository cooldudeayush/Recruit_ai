// src/pages/Report.jsx
import { useApp } from '../AppContext.jsx'
import Topbar, { Page } from '../components/Topbar.jsx'
import RadarChart from '../components/RadarChart.jsx'
import { ScoreBar, Badge, StageBadge, StatCard, Divider } from '../components/UI.jsx'
import { exportReportPDF } from '../utils/pdf.js'

const DIM_KEYS = ['relevance', 'depth', 'clarity', 'correctness']

export default function Report() {
  const { viewingReport: s, setScreen } = useApp()
  if (!s) return null

  const hire = s.overallScore >= (s.threshold || 65)
  const dims = s.dimensions || {}
  const bm = s.benchmark || {}
  const duration = s.duration
    ? `${Math.floor(s.duration / 60)}m ${s.duration % 60}s`
    : '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Topbar
        title="Session Report"
        subtitle={s.candidateName}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm" onClick={() => exportReportPDF(s)}>
              ↓ PDF Report
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => setScreen('login')}>
              Home
            </button>
          </div>
        }
      />
      <Page>
        {/* ── HEADER ROW ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: '1.7rem', marginBottom: 4 }}>{s.candidateName}</h1>
            <div style={{ fontSize: 14, color: 'var(--c-ink-3)' }}>{s.role}</div>
            <div style={{ fontSize: 12, color: 'var(--c-ink-4)', marginTop: 4 }}>
              {s.candidateEmail} · {s.difficulty} difficulty · {new Date(s.date).toLocaleDateString()} · {duration}
            </div>
          </div>
          <div className={hire ? 'verdict-hire' : 'verdict-nohire'} style={{ minWidth: 200 }}>
            <div style={{ fontSize: 30, marginBottom: 4 }}>{hire ? '✅' : '❌'}</div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>
              {hire ? 'Recommended: Hire' : 'Recommended: No Hire'}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700,
              color: hire ? 'var(--c-green-text)' : 'var(--c-red-text)', margin: '6px 0'
            }}>
              {Math.round(s.overallScore)}%
            </div>
            <div style={{ fontSize: 12, color: hire ? 'var(--c-green-text)' : 'var(--c-red-text)', opacity: .75 }}>
              Threshold: {s.threshold}%
            </div>
          </div>
        </div>

        {/* ── EXECUTIVE SUMMARY ── */}
        {s.summary && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10 }}>Executive Summary</div>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--c-ink-3)' }}>
              {s.summary.executiveSummary}
            </p>
            <Divider />
            <div className="grid-3">
              {[
                { label: 'Technical', val: s.summary.technicalStrength },
                { label: 'Communication', val: s.summary.communicationStrength },
                { label: 'Growth Areas', val: s.summary.areasForGrowth }
              ].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink-4)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>{label}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6 }}>{val || '—'}</div>
                </div>
              ))}
            </div>
            {s.summary.hiringSuggestion && (
              <>
                <Divider />
                <div style={{
                  background: hire ? 'var(--c-green-bg)' : 'var(--c-red-bg)',
                  borderRadius: 'var(--radius-md)', padding: '10px 14px',
                  fontSize: 13, lineHeight: 1.65,
                  color: hire ? 'var(--c-green-text)' : 'var(--c-red-text)',
                  fontStyle: 'italic'
                }}>
                  {s.summary.hiringSuggestion}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── CHARTS ROW ── */}
        <div className="grid-2" style={{ marginBottom: 16 }}>
          {/* Radar */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Skill Radar — Candidate vs Benchmark</div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--c-ink-3)', marginBottom: 14 }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#4F6EF7', marginRight: 5, verticalAlign: 'middle' }} />Candidate</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'rgba(79,110,247,.2)', border: '1.5px dashed #4F6EF7', marginRight: 5, verticalAlign: 'middle' }} />Benchmark</span>
            </div>
            <RadarChart candidate={dims} benchmark={bm} size={240} />
          </div>

          {/* Stage + Dimension */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.keys(s.stageScores || {}).length > 0 && (
              <div className="card">
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Score by Stage</div>
                <div className="grid-3" style={{ gap: 8 }}>
                  {Object.entries(s.stageScores).map(([stage, score]) => (
                    <StatCard key={stage}
                      label={stage.charAt(0).toUpperCase() + stage.slice(1)}
                      value={`${score}%`}
                      color={score >= 70 ? 'var(--c-green-text)' : score >= 50 ? 'var(--c-amber-text)' : 'var(--c-red-text)'}
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Dimension Breakdown</div>
              {DIM_KEYS.map(dim => (
                <ScoreBar key={dim}
                  label={dim.charAt(0).toUpperCase() + dim.slice(1)}
                  value={dims[dim] || 0}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── BENCHMARK COMPARISON ── */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Benchmark Comparison</div>
          <div style={{ fontSize: 13, color: 'var(--c-ink-3)', marginBottom: 14 }}>
            Expected minimum performance for <strong>{s.role}</strong>. The progress bar shows candidate score (blue) against the benchmark threshold (dashed line).
          </div>

          {s.summary?.benchmarkAnalysis && (
            <div style={{
              background: 'var(--c-bg-2)', borderRadius: 'var(--radius-md)',
              padding: '12px 14px', fontSize: 13, lineHeight: 1.7,
              color: 'var(--c-ink-3)', marginBottom: 16
            }}>
              {s.summary.benchmarkAnalysis}
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th style={{ textAlign: 'center' }}>Candidate</th>
                  <th style={{ textAlign: 'center' }}>Benchmark</th>
                  <th style={{ textAlign: 'center' }}>Gap</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ minWidth: 160 }}>Visual</th>
                </tr>
              </thead>
              <tbody>
                {DIM_KEYS.map(dim => {
                  const cVal = dims[dim] || 0
                  const bVal = bm[dim] || 70
                  const gap = cVal - bVal
                  const meets = cVal >= bVal
                  return (
                    <tr key={dim}>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{dim.charAt(0).toUpperCase() + dim.slice(1)}</td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{cVal}%</td>
                      <td style={{ textAlign: 'center', color: 'var(--c-ink-3)', fontFamily: 'var(--font-mono)' }}>{bVal}%</td>
                      <td style={{
                        textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700,
                        color: gap >= 0 ? 'var(--c-green-text)' : 'var(--c-red-text)'
                      }}>
                        {gap >= 0 ? `+${gap}` : gap}%
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Badge color={meets ? 'green' : 'red'}>{meets ? 'Meets' : 'Below'}</Badge>
                      </td>
                      <td>
                        <GapBar cVal={cVal} bVal={bVal} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── PER-QUESTION TABLE ── */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Per-Question Evaluation</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 30 }}>#</th>
                  <th style={{ width: 100 }}>Stage</th>
                  <th style={{ minWidth: 220 }}>Question</th>
                  <th style={{ minWidth: 180 }}>Candidate Response</th>
                  <th style={{ width: 80, textAlign: 'center' }}>Score</th>
                  <th style={{ width: 60, textAlign: 'center' }}>Rel</th>
                  <th style={{ width: 60, textAlign: 'center' }}>Dep</th>
                  <th style={{ width: 60, textAlign: 'center' }}>Cla</th>
                  <th style={{ width: 60, textAlign: 'center' }}>Cor</th>
                  <th style={{ minWidth: 200 }}>AI Feedback</th>
                </tr>
              </thead>
              <tbody>
                {(s.qaLog || []).map((q, i) => {
                  const avg = Math.round((q.relevance + q.depth + q.clarity + q.correctness) / 4 * 10)
                  const col = avg >= 70 ? 'var(--c-green-text)' : avg >= 50 ? 'var(--c-amber-text)' : 'var(--c-red-text)'
                  return (
                    <tr key={i}>
                      <td style={{ color: 'var(--c-ink-3)', fontFamily: 'var(--font-mono)' }}>{i + 1}</td>
                      <td><StageBadge stage={q.stage} /></td>
                      <td style={{ fontSize: 13, lineHeight: 1.5 }}>{q.question}</td>
                      <td style={{ fontSize: 12, color: 'var(--c-ink-3)', lineHeight: 1.5 }}>
                        {(q.answer || '').substring(0, 120)}{(q.answer || '').length > 120 ? '…' : ''}
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, color: col }}>{avg}%</td>
                      {['relevance', 'depth', 'clarity', 'correctness'].map(d => (
                        <td key={d} style={{
                          textAlign: 'center', fontSize: 12,
                          fontFamily: 'var(--font-mono)', fontWeight: 500,
                          color: Math.round((q[d] || 0) * 10) >= 70
                            ? 'var(--c-green-text)'
                            : Math.round((q[d] || 0) * 10) >= 50
                              ? 'var(--c-amber-text)'
                              : 'var(--c-red-text)'
                        }}>
                          {Math.round((q[d] || 0) * 10)}
                        </td>
                      ))}
                      <td style={{ fontSize: 12, color: 'var(--c-ink-3)', lineHeight: 1.5 }}>{q.feedback || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Page>
    </div>
  )
}

function GapBar({ cVal, bVal }) {
  return (
    <div style={{ position: 'relative', height: 8, background: 'var(--c-bg-3)', borderRadius: 99, overflow: 'visible' }}>
      {/* benchmark fill (light) */}
      <div style={{
        position: 'absolute', left: 0, top: 0, height: '100%',
        width: `${bVal}%`, background: 'rgba(79,110,247,.15)', borderRadius: 99
      }} />
      {/* candidate fill */}
      <div style={{
        position: 'absolute', left: 0, top: 0, height: '100%',
        width: `${cVal}%`, background: cVal >= bVal ? '#4F6EF7' : '#EF4444',
        borderRadius: 99, transition: 'width 1s ease'
      }} />
      {/* benchmark tick */}
      <div style={{
        position: 'absolute', top: -3, left: `${bVal}%`,
        width: 2, height: 14, background: '#AFA9EC',
        borderRadius: 1, transform: 'translateX(-50%)'
      }} />
    </div>
  )
}
