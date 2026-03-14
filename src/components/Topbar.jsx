// src/components/Topbar.jsx
import { useApp } from '../AppContext.jsx'

export default function Topbar({ title, subtitle, actions }) {
  const { setScreen } = useApp()
  return (
    <header style={{
      background: 'var(--c-surface)', borderBottom: 'var(--border-2)',
      padding: '0 24px', height: 54, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100,
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setScreen('login')}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 600, color: 'var(--c-primary)' }}>Recruit</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
            background: 'var(--c-primary)', color: '#fff',
            padding: '2px 6px', borderRadius: 4
          }}>AI</span>
        </div>
        {title && (
          <>
            <span style={{ color: 'var(--c-bg-3)', fontSize: 18 }}>›</span>
            <span style={{ fontSize: 13, color: 'var(--c-ink-3)', fontWeight: 500 }}>{title}</span>
            {subtitle && <span style={{ fontSize: 12, color: 'var(--c-ink-4)' }}>— {subtitle}</span>}
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>
    </header>
  )
}

export function Page({ children, maxWidth = 1100 }) {
  return (
    <div style={{
      padding: '20px 24px', maxWidth, margin: '0 auto',
      width: '100%', flex: 1
    }}>
      {children}
    </div>
  )
}
