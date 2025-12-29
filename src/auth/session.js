const STORAGE_KEY = 'boardify.session'

export const loadSession = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const saveSession = (session) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export const clearSession = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

