import { useApp } from '../AppContext.jsx'

export default function Topbar({ title, subtitle, actions }) {
  const { setScreen } = useApp()

  return (
    <header className="app-topbar">
      <div className="app-topbar-left">
        <button className="app-brand" onClick={() => setScreen('login')}>
          <span className="app-brand-word">Recruit</span>
          <span className="app-brand-tag">AI</span>
        </button>

        {title && (
          <div className="app-crumbs">
            <span className="app-crumb-sep">/</span>
            <span className="app-crumb-title">{title}</span>
            {subtitle && <span className="app-crumb-subtitle">{subtitle}</span>}
          </div>
        )}
      </div>

      <div className="app-topbar-actions">{actions}</div>
    </header>
  )
}

export function Page({ children, maxWidth = 1100 }) {
  return (
    <div className="app-page-shell">
      <div
        className="app-page"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>
  )
}
