import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'
import { User, AuthSession, LoginFormData, RegisterFormData } from '@/lib/types'
import { hashPassword, verifyPassword, createSession, isSessionValid } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  session: AuthSession | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginFormData) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterFormData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useKV<User[]>('users', [])
  const [session, setSession] = useKV<AuthSession | null>('session', null)
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const initAuth = async () => {
      if (session && isSessionValid(session) && users) {
        const currentUser = users.find(u => u.id === session.userId)
        if (currentUser) {
          setUser(currentUser)
        } else {
          setSession(null)
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [session, users])

  const login = async (data: LoginFormData): Promise<{ success: boolean; error?: string }> => {
    if (!users) {
      return { success: false, error: 'System error. Please try again.' }
    }
    
    const foundUser = users.find(u => u.email === data.email.toLowerCase())
    
    if (!foundUser) {
      return { success: false, error: 'No account found with this email' }
    }
    
    const isValid = await verifyPassword(data.password, foundUser.passwordHash)
    
    if (!isValid) {
      return { success: false, error: 'Incorrect password' }
    }
    
    const newSession = createSession(foundUser.id, data.rememberMe)
    setSession(newSession)
    setUser(foundUser)
    
    return { success: true }
  }

  const register = async (data: RegisterFormData): Promise<{ success: boolean; error?: string }> => {
    if (!users) {
      return { success: false, error: 'System error. Please try again.' }
    }
    
    const existingUser = users.find(u => u.email === data.email.toLowerCase())
    
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' }
    }
    
    if (data.phone) {
      const existingPhone = users.find(u => u.phone === data.phone)
      if (existingPhone) {
        return { success: false, error: 'An account with this phone number already exists' }
      }
    }
    
    const passwordHash = await hashPassword(data.password)
    
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      role: data.role,
      createdAt: new Date().toISOString(),
      passwordHash,
      profile: data.profile as any
    }
    
    setUsers(currentUsers => [...(currentUsers || []), newUser])
    
    const newSession = createSession(newUser.id, true)
    setSession(newSession)
    setUser(newUser)
    
    return { success: true }
  }

  const logout = () => {
    setSession(null)
    setUser(null)
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user || !users) return
    
    const updatedUser = { ...user, ...updates }
    setUsers(currentUsers => 
      (currentUsers || []).map(u => u.id === user.id ? updatedUser : u)
    )
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session: session || null,
        isAuthenticated: !!user && !!session && isSessionValid(session),
        isLoading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
