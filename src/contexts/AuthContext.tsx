import React, { createContext, useContext, useEffect, useState } from 'react'

type AuthState = { authenticated: boolean; username?: string; loading: boolean }

const AuthContext = createContext<{ state: AuthState; refresh: () => Promise<void> }>({ state: { authenticated: false, loading: true }, refresh: async () => {} })

function readPersistedAuth(): { authenticated: boolean; username?: string } {
  try {
    const a = localStorage.getItem('auth.authenticated')
    const u = localStorage.getItem('auth.username') || undefined
    return { authenticated: a === '1', username: u }
  } catch {
    return { authenticated: false }
  }
}

function persistAuth(authenticated: boolean, username?: string) {
  try {
    localStorage.setItem('auth.authenticated', authenticated ? '1' : '0')
    if (username) localStorage.setItem('auth.username', username)
    else localStorage.removeItem('auth.username')
  } catch {}
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const persisted = readPersistedAuth()
  const [state, setState] = useState<AuthState>({ authenticated: persisted.authenticated, username: persisted.username, loading: true })

  const refresh = async () => {
    try {
      const res = await fetch('/api/me', { credentials: 'include' })
      if (!res.ok) throw new Error('me failed')
      const data = await res.json()
      const next = { authenticated: !!data.authenticated, username: data.user?.username, loading: false }
      setState(next)
      persistAuth(next.authenticated, next.username)
    } catch {
      // No forzar logout en errores de red; mantener estado previo y solo quitar loading
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  useEffect(() => { void refresh() }, [])
  return <AuthContext.Provider value={{ state, refresh }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
