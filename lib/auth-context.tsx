"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { User, UserRole } from "./types"

interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<AuthUser>
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || "Login failed")
    }
    const data = await res.json()
    setUser(data.user)
    return data.user
  }, [])

  const signup = useCallback(
    async (name: string, email: string, password: string, role: UserRole) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Signup failed")
      }
    },
    []
  )

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
