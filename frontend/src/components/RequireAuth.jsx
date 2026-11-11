import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingState } from './ui'

export default function RequireAuth({ children, requireRole, requireApproval = false }) {
  const { isAuthenticated, user, loading, session } = useAuth()
  const location = useLocation()

  // Show spinner only during initial auth hydration
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <LoadingState label="Loading…" />
      </div>
    )
  }

  // Not signed in
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Get role — prefer backend profile, fall back to Supabase user_metadata
  const meta      = session?.user?.user_metadata
  const role      = user?.role             ?? meta?.role ?? null
  const approval  = user?.approval_status  ?? null
  const onboarded = user?.onboarding_complete ?? false

  // Role check (only if we know the role)
  if (requireRole && role && role !== requireRole) {
    if (role === 'client')     return <Navigate to="/client/dashboard"      replace />
    if (role === 'freelancer') return <Navigate to="/freelancer/dashboard"  replace />
    if (role === 'admin')      return <Navigate to="/admin/dashboard"       replace />
  }

  // Approval + onboarding for freelancer dashboard
  if (requireApproval) {
    if (approval === 'pending' || approval === 'rejected')
      return <Navigate to="/pending-approval" replace />
    if (approval === 'approved' && !onboarded)
      return <Navigate to="/onboarding/freelancer" replace />
  }

  return children
}
