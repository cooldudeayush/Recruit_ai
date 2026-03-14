// src/utils/storage.js
import { DEFAULT_ROLES, DEFAULT_QUESTIONS } from '../data/seed.js'

const KEY = 'recruitai_v3'

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        roles: parsed.roles || DEFAULT_ROLES,
        questions: parsed.questions || DEFAULT_QUESTIONS,
        sessions: parsed.sessions || [],
        settings: {
          difficulty: 'medium',
          qcount: 3,
          threshold: 65,
          ...(parsed.settings || {})
        }
      }
    }
  } catch (e) {}
  return {
    roles: DEFAULT_ROLES,
    questions: DEFAULT_QUESTIONS,
    sessions: [],
    settings: { difficulty: 'medium', qcount: 3, threshold: 65 }
  }
}

export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) {}
}

export function clearState() {
  localStorage.removeItem(KEY)
}
