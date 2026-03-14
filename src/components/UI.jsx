// src/components/UI.jsx
import { useState } from 'react'

export function ScoreBar({ label, value, showNum = true }) {
  const cls = value >= 70 ? 'score-bar-hi' : value >= 50 ? 'score-bar-mid' : 'score-bar-lo'
  const col = value >= 70 ? 'var(--c-green-text)' : value >= 50 ? 'var(--c-amber-text)' : 'var(--c-red-text)'
  return (
    <div className="score-row">
      <span className="score-label">{label}</span>
      <div className="score-bar-track">
        <div className={`score-bar-fill ${cls}`} style={{ width: `${value}%` }} />
      </div>
      {showNum && <span className="score-num" style={{ color: col }}>{value}</span>}
    </div>
  )
}

export function Badge({ children, color = 'blue' }) {
  return <span className={`badge badge-${color}`}>{children}</span>
}

export function Spinner({ size = 16 }) {
  return <div className="spinner" style={{ width: size, height: size }} />
}

export function Divider() { return <div className="divider" /> }

export function EmptyState({ icon = '📋', text }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div>{text}</div>
    </div>
  )
}

export function StageBadge({ stage }) {
  const map = { intro: ['blue', 'Intro'], technical: ['purple', 'Technical'], behavioral: ['teal', 'Behavioral'] }
  const [color, label] = map[stage] || ['blue', stage]
  return <Badge color={color}>{label}</Badge>
}

export function DiffBadge({ difficulty }) {
  const map = { easy: 'green', medium: 'amber', hard: 'red' }
  return <Badge color={map[difficulty] || 'blue'}>{difficulty}</Badge>
}

export function Modal({ open, onClose, title, children, width = 560 }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div onClick={e => e.stopPropagation()} className="card animate-slide" style={{
        width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto', margin: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>{title}</h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ProgressSteps({ steps, current }) {
  return (
    <div className="progress-steps">
      {steps.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : ''
        return (
          <div key={step} className={`progress-step ${state}`}>
            <div className="progress-step-dot">
              {i < current ? '✓' : i + 1}
            </div>
            <div>{step}</div>
          </div>
        )
      })}
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >{tab.label}</button>
      ))}
    </div>
  )
}

export function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--c-bg-2)', borderRadius: 'var(--radius-md)',
      padding: '12px 14px', textAlign: 'center'
    }}>
      <div style={{ fontSize: 11, color: 'var(--c-ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-mono)', color: color || 'var(--c-ink)' }}>{value}</div>
    </div>
  )
}
