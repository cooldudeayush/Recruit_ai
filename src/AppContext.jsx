// src/AppContext.jsx
import { createContext, useContext, useState, useCallback } from 'react'
import { loadState, saveState } from './utils/storage.js'

const Ctx = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(() => loadState())
  const [screen, setScreen] = useState('login') // login | admin | interviewer | cand-setup | interview | report
  const [currentSession, setCurrentSession] = useState(null)
  const [viewingReport, setViewingReport] = useState(null)

  const update = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      saveState(next)
      return next
    })
  }, [])

  const addSession = useCallback((sess) => {
    update(prev => ({ ...prev, sessions: [...prev.sessions, sess] }))
  }, [update])

  return (
    <Ctx.Provider value={{
      state, update, addSession,
      screen, setScreen,
      currentSession, setCurrentSession,
      viewingReport, setViewingReport
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useApp = () => useContext(Ctx)
