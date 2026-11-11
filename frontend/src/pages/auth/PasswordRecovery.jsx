import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, useToast } from '../../components/ui'
import { isEmail, passwordIssues } from '../../utils/validate'
import { resetPasswordRequest, updatePassword } from '../../services/authService'

export function ForgotPassword() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  
  const submit = async (e) => {
    e.preventDefault()
    if (!isEmail(email)) return setErr('Enter a valid email address.')
    setBusy(true)
    try {
      await resetPasswordRequest(email)
      setSent(true)
    } catch (error) {
      setErr(error.message || 'Failed to send reset email.')
    } finally {
      setBusy(false)
    }
  }
  
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <h1 className="text-2xl font-extrabold">Forgot your password?</h1>
      <p className="text-sm text-muted">Enter your email and we will send reset instructions.</p>
      {sent ? <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">A reset link has been sent to {email}. Check your inbox and click the link to reset your password.</p> : <>
        <Input label="Email" name="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr('') }} error={err} />
        <Button type="submit" size="lg" className="w-full" loading={busy}>Send reset instructions</Button></>}
      <p className="text-center text-sm"><Link to="/login" className="font-semibold text-brand hover:underline">Back to log in</Link>{sent && <> · <button type="button" className="font-semibold text-brand hover:underline" onClick={() => nav('/reset-password')}>I've clicked the link</button></>}</p>
    </form>
  )
}

export function ResetPassword() {
  const nav = useNavigate()
  const toast = useToast()
  const [v, setV] = useState({ password: '', confirm: '' })
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)
  
  const submit = async (e) => {
    e.preventDefault()
    const errors = {}
    const pw = passwordIssues(v.password)
    if (pw) errors.password = pw
    if (v.confirm !== v.password) errors.confirm = 'Passwords do not match.'
    setErr(errors)
    if (Object.keys(errors).length) return
    
    setBusy(true)
    try {
      await updatePassword(v.password)
      toast('Password updated successfully!')
      nav('/login')
    } catch (error) {
      setErr({ general: error.message || 'Failed to update password.' })
    } finally {
      setBusy(false)
    }
  }
  
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <h1 className="text-2xl font-extrabold">Set a new password</h1>
      {err.general && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-bad">{err.general}</div>}
      <Input label="New password" name="password" type="password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} error={err.password} hint="At least 8 characters with a letter and a number." />
      <Input label="Confirm new password" name="confirm" type="password" value={v.confirm} onChange={(e) => setV({ ...v, confirm: e.target.value })} error={err.confirm} />
      <Button type="submit" size="lg" className="w-full" loading={busy}>Update password</Button>
    </form>
  )
}
