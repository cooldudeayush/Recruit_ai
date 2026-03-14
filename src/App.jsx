// src/App.jsx
import { useApp } from './AppContext.jsx'
import Login from './pages/Login.jsx'
import Admin from './pages/Admin.jsx'
import Interviewer from './pages/Interviewer.jsx'
import CandidateSetup from './pages/CandidateSetup.jsx'
import Interview from './pages/Interview.jsx'
import Report from './pages/Report.jsx'

export default function App() {
  const { screen } = useApp()

  const screens = {
    login: <Login />,
    admin: <Admin />,
    interviewer: <Interviewer />,
    'cand-setup': <CandidateSetup />,
    interview: <Interview />,
    report: <Report />
  }

  return screens[screen] || <Login />
}
