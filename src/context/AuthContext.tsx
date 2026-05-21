import { createContext, useContext, useState, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import type { AuthUser } from '../types'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  businessName: string | null
}

interface AuthContextValue extends AuthState {
  signIn: (accessToken: string, refreshToken: string, businessName: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getInitialState(): AuthState {
  const token = localStorage.getItem('accessToken')
  const businessName = localStorage.getItem('businessName')
  if (!token) return { user: null, accessToken: null, businessName: null }
  try {
    return { user: jwtDecode<AuthUser>(token), accessToken: token, businessName }
  } catch {
    return { user: null, accessToken: null, businessName: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialState)

  const signIn = (accessToken: string, refreshToken: string, businessName: string) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('businessName', businessName)
    setState({ user: jwtDecode<AuthUser>(accessToken), accessToken, businessName })
  }

  const signOut = () => {
    localStorage.clear()
    setState({ user: null, accessToken: null, businessName: null })
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
