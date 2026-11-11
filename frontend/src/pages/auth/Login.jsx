import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button, Checkbox, Input } from '../../components/ui'
import { isEmail } from '../../utils/validate'
import { supabase } from '../../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

function routeAfterLogin(profile, nav, from) {
  const role       = profile?.role
  const approval   = profile?.approval_status
  const onboarded  = profile?.onboarding_complete

  if (!role) {
    // Profile not available — go to onboarding as safest default
    nav('/onboarding/freelancer', { replace: true })
    return
  }
  if (role === 'client')  { nav(from || '/client/dashboard',       { replace: true }); return }
  if (role === 'admin')   { nav('/admin/dashboard',                 { replace: true }); return }

  // freelancer
  if (approval === 'pending' || approval === 'rejected') {
    nav('/pending-approval', { replace: true })
  } else if (!onboarded) {
    nav('/onboarding/freelancer', { replace: true })
  } else {
    nav(from || '/freelancer/dashboard', { replace: true })
  }
}

export default function Login() {
  const nav      = useNavigate()
  const location = useLocation()
  const [v, setV]       = useState({ email: '', password: '', remember: false })
  const [err, setErr]   = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setV({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!isEmail(v.email))   errors.email    = 'Enter a valid email address.'
    if (!v.password)         errors.password = 'Enter your password.'
    setErr(errors)
    if (Object.keys(errors).length) return

    setBusy(true)
    setErr({})

    try {
      // 1. Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: v.email,
        password: v.password,
      })

      if (error) {
        setErr({ general: error.message || 'Invalid email or password.' })
        setBusy(false)
        return
      }

      const token = data.session?.access_token
      if (!token) {
        setErr({ general: 'Login failed — no session returned.' })
        setBusy(false)
        return
      }

      // 2. Load profile from backend (8s timeout)
      let profile = null
      try {
        const controller = new AbortController()
        const tid = setTimeout(() => controller.abort(), 8000)
        const resp = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        clearTimeout(tid)
        if (resp.ok) profile = await resp.json()
      } catch {
        // Backend unreachable — route by Supabase metadata
        const meta = data.session?.user?.user_metadata
        profile = meta ? { role: meta.role } : null
      }

      // 3. Route
      routeAfterLogin(profile, nav, location.state?.from?.pathname)

    } catch (err) {
      setErr({ general: err.message || 'Login failed. Please try again.' })
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold">Log in</h1>
        <p className="mt-1 text-sm text-muted">Welcome back to CUI Freelance.</p>
      </div>
      {err.general && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-bad">
          {err.general}
        </div>
      )}
      <Input label="Email" name="email" type="email" value={v.email}
        onChange={set('email')} error={err.email} autoComplete="email" />
      <Input label="Password" name="password" type="password" value={v.password}
        onChange={set('password')} error={err.password} autoComplete="current-password" />
      <div className="flex items-center justify-between">
        <Checkbox label="Remember me" checked={v.remember} onChange={set('remember')} />
        <Link to="/forgot-password" className="text-sm font-semibold text-brand hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" size="lg" className="w-full" loading={busy}>Log in</Button>
      <p className="text-center text-sm text-muted">
        New here?{' '}
        <Link to="/role" className="font-semibold text-brand hover:underline">Create an account</Link>
      </p>
    </form>
  )
}
