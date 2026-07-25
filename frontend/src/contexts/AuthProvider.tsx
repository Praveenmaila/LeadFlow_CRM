import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import api, { clearStoredSession, getStoredSession, setStoredSession, UNAUTHORIZED_EVENT } from '../services/api'
import type { AuthSession, User } from '../types'

type AuthContextType = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

const hydrateSession = (): AuthSession | null => {
  const session = getStoredSession()
  if (!session?.accessToken || !session.user) {
    return null
  }

  return {
    accessToken: session.accessToken,
    user: session.user as User
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initialSession = hydrateSession()
  if (initialSession?.accessToken) {
    api.defaults.headers.common.Authorization = `Bearer ${initialSession.accessToken}`
  }
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
  const [token, setToken] = useState<string | null>(initialSession?.accessToken ?? null)
  const [isLoading, setIsLoading] = useState(Boolean(initialSession?.accessToken))

  const applySession = (session: AuthSession) => {
    setUser(session.user)
    setToken(session.accessToken)
    setStoredSession(session)
    api.defaults.headers.common.Authorization = `Bearer ${session.accessToken}`
  }

  const login = async (email: string, password: string) => {
    const response = await api.post<AuthSession>('/auth/login', { email, password })
    applySession(response.data)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    clearStoredSession()
    delete api.defaults.headers.common.Authorization
  }

  const refreshSession = async () => {
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await api.get<{ user: User }>('/auth/me')
      setUser(response.data.user)
      setStoredSession({ accessToken: token, user: response.data.user })
    } catch {
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`
      void refreshSession()
    } else {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      logout()
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      logout,
      refreshSession
    }),
    [isLoading, token, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
