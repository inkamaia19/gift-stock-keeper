import React, { createContext, useContext, useEffect, useState } from 'react'

type AuthState = { authenticated: boolean, username?: string }

const AuthContext = createContext<{ state: AuthState, refresh: () => Promise<void> }>({ state: { authenticated: false }, refresh: async () => {} })

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({ authenticated: false })
  const refresh = async () => {
    try {
      const res = await fetch('/api/me')
      const data = await res.json()
      setState({ authenticated: !!data.authenticated, username: data.user?.username })
    } catch { setState({ authenticated: false }) }
  }
  useEffect(() => { void refresh() }, [])
  return <AuthContext.Provider value={{ state, refresh }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

