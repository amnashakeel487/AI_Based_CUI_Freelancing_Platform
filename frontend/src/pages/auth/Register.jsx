import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button, Checkbox, Input, Select } from '../../components/ui'
import { validateAccount } from '../../utils/validate'
import { signUp } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const clientTypes = ['Individual', 'Student project team', 'Organization']
function RegisterForm({ role }) {
  const client = role === 'client'
  const nav = useNavigate()
  const { isAuthenticated } = useAuth()
  const [v, setV] = useState({ name: '', email: '', phone: '', org: '', clientType: 'Individual', password: '', confirm: '', terms: false })
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setV({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  
  const submit = async (e) => {
    e.preventDefault()
    const errors = validateAccount(v, { client })
    setErr(errors)
    if (Object.keys(errors).length) return

    setBusy(true)
    try {
      await signUp({
        email: v.email,
        password: v.password,
        full_name: v.name,
        phone: v.phone,
        role,
      })

      // If email confirmation is OFF, Supabase returns a session immediately.
      // Check if we already have a session and can skip the verify-email screen.
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        // Session already active — create profile rows and go straight to onboarding
        try {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/register-complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ role, full_name: v.name, phone: v.phone || null }),
          })
        } catch { /* ignore — profile creation errors handled at login */ }

        nav(role === 'client' ? '/onboarding/client' : '/onboarding/freelancer')
      } else {
        // Email confirmation is ON — show verify-email screen
        nav('/verify-email', { state: { email: v.email, role, full_name: v.name, phone: v.phone } })
      }
    } catch (error) {
      setErr({ general: error.message || 'Registration failed. Please try again.' })
    } finally {
      setBusy(false)
    }
  }
  
  // If already authenticated, redirect
  if (isAuthenticated) {
    return <Navigate to={role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'} replace />
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div><h1 className="text-2xl font-extrabold">{client ? 'Create your client account' : 'Create your freelancer account'}</h1>
        <p className="mt-1 text-sm text-muted">Step 1 of 3 · Account details. <Link to="/role" className="font-semibold text-brand hover:underline">Change role</Link></p></div>
      {err.general && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-bad">{err.general}</div>}
      <Input label="Full name" name="name" required value={v.name} onChange={set('name')} error={err.name} autoComplete="name" />
      <Input label="COMSATS email" name="email" type="email" required value={v.email} onChange={set('email')} error={err.email} autoComplete="email" placeholder="name@cuilahore.edu.pk" />
      <Input label="Phone number" name="phone" type="tel" required value={v.phone} onChange={set('phone')} error={err.phone} autoComplete="tel" placeholder="+92 300 0000000" />
      {client && <>
        <Select label="Client type" name="clientType" value={v.clientType} onChange={set('clientType')} options={clientTypes} />
        <Input label={v.clientType === 'Organization' ? 'Organization name' : 'Organization name (optional)'} name="org" required={v.clientType === 'Organization'} value={v.org} onChange={set('org')} error={err.org} />
      </>}
      <Input label="Password" name="password" type="password" required value={v.password} onChange={set('password')} error={err.password} hint="At least 8 characters with a letter and a number." autoComplete="new-password" />
      <Input label="Confirm password" name="confirm" type="password" required value={v.confirm} onChange={set('confirm')} error={err.confirm} autoComplete="new-password" />
      <Checkbox checked={v.terms} onChange={set('terms')} error={err.terms} label={<>I agree to the <a href="#terms" className="font-semibold text-brand">Terms</a> and <a href="#privacy" className="font-semibold text-brand">Privacy Policy</a>.</>} />
      <Button type="submit" size="lg" className="w-full" loading={busy}>Create account</Button>
      <p className="text-center text-sm text-muted">Already registered? <Link to="/login" className="font-semibold text-brand hover:underline">Log in</Link></p>
    </form>
  )
}
export const FreelancerRegister = () => <RegisterForm role="freelancer" />
export const ClientRegister = () => <RegisterForm role="client" />
