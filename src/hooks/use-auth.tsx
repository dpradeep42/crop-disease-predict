import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthSession, LoginFormData, RegisterFormData } from '@/lib/types'
import { isSessionValid } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  session: AuthSession | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginFormData) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterFormData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  supabaseUser: any
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
  const [user, setUser] = React.useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: supabaseSession } } = await supabase.auth.getSession()

        if (supabaseSession?.user) {
          setSupabaseUser(supabaseSession.user)
          await loadUserProfile(supabaseSession.user.id)
        }
      } catch (error) {
        console.error('Init auth error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          setSupabaseUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setSupabaseUser(null)
          setUser(null)
        }
      })()
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

      if (data) {
        const userProfile: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          role: data.role,
          createdAt: data.created_at,
          passwordHash: '',
          profile: data.profile_data
        }
        setUser(userProfile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const login = async (data: LoginFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (authData.user) {
        setSupabaseUser(authData.user)
        await loadUserProfile(authData.user.id)
        return { success: true }
      }

      return { success: false, error: 'Login failed' }
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred during login' }
    }
  }

  const register = async (data: RegisterFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name: data.name,
            phone: data.phone || '',
          }
        }
      })

      if (signUpError) {
        return { success: false, error: signUpError.message }
      }

      if (!authData.user) {
        return { success: false, error: 'Registration failed' }
      }

      const userId = authData.user.id

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: data.email.toLowerCase(),
          name: data.name,
          phone: data.phone,
          role: data.role,
          profile_data: data.profile
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)

        if (profileError.message.includes('duplicate') || profileError.code === '23505') {
          await loadUserProfile(userId)
          setSupabaseUser(authData.user)
          return { success: true }
        }

        await supabase.auth.signOut()
        return { success: false, error: 'Failed to create user profile. Please try again.' }
      }

      if (authData.session) {
        setSupabaseUser(authData.user)
        await loadUserProfile(userId)
        toast.success('Account created successfully!')
      } else {
        toast.info('Please check your email to confirm your account.')
      }

      return { success: true }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { success: false, error: error.message || 'An error occurred during registration' }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!supabaseUser) return

    try {
      const profileData: any = {
        name: updates.name,
        phone: updates.phone,
      }

      if (updates.profile) {
        profileData.profile_data = updates.profile
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', supabaseUser.id)

      if (error) {
        console.error('Error updating profile:', error)
        return
      }

      await loadUserProfile(supabaseUser.id)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const session: AuthSession | null = supabaseUser ? {
    userId: supabaseUser.id,
    token: '',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    rememberMe: false
  } : null

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user && !!supabaseUser,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        supabaseUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
