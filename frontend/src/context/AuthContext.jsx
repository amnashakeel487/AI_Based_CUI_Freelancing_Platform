import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

/** Fetch /auth/me. Returns null (never throws) so loading is never stuck. */
async function fetchProfile(accessToken) {
  try {
    const controller = new AbortController()
    const tid = setTimeout(() => controller.abort(), 5000)
    const resp = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    })
    clearTimeout(tid)
    if (resp.ok) return await resp.json()
    console.warn(`/auth/me returned ${resp.status}`)
    return null
  } catch (e) {
    console.warn('/auth/me failed:', e.message)
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null)
  const [user,    setUser]      = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    // Hydrate on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.access_token) {
        const profile = await fetchProfile(session.access_token)
        setUser(profile)
      }
      setLoading(false)   // ALWAYS release, even if profile is null
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session?.access_token) {
          const profile = await fetchProfile(session.access_token)
          setUser(profile)
        } else {
          setUser(null)
        }
        setLoading(false)  // ALWAYS release
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
  }, [])

  const reloadUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      const profile = await fetchProfile(session.access_token)
      setUser(profile)
    }
  }, [])

  const value = {
    session,
    user,
    loading,
    signOut,
    reloadUser,
    isAuthenticated:      !!session,
    role:                 user?.role ?? null,
    approvalStatus:       user?.approval_status ?? null,
    onboardingComplete:   user?.onboarding_complete ?? false,
    isApprovedFreelancer: user?.role === 'freelancer' && user?.approval_status === 'approved',
    isPendingFreelancer:  user?.role === 'freelancer' && user?.approval_status === 'pending',
    isRejectedFreelancer: user?.role === 'freelancer' && user?.approval_status === 'rejected',
    isClient:             user?.role === 'client',
    isAdmin:              user?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
