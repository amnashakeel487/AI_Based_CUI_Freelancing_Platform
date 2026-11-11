import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { Button, useToast } from '../../components/ui'
import { completeRegistration } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function EmailVerification() {
  const { state } = useLocation()
  const nav = useNavigate()
  const toast = useToast()
  const { reloadUser } = useAuth()
  const [status, setStatus] = useState('waiting') // waiting | verifying | done | error
  const [errorMsg, setErrorMsg] = useState('')
  const target = state?.role === 'client' ? '/onboarding/client' : '/onboarding/freelancer'

  // Handle magic link callback: Supabase redirects back to the app with
  // a session in the URL hash (#access_token=...) after the user clicks the link.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
          setStatus('verifying')
          try {
            // Create profile rows in the database
            await completeRegistration({
              role: state?.role || 'freelancer',
              full_name: state?.full_name || session.user?.user_metadata?.full_name || '',
              phone: state?.phone || session.user?.user_metadata?.phone || null,
            })
            await reloadUser()
            toast('Email verified successfully!')
            setStatus('done')
            nav(target)
          } catch (err) {
            setStatus('error')
            setErrorMsg(err.message || 'Verification failed. Please try again.')
          }
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [nav, target, state, reloadUser, toast])

  return (
    <div className="space-y-6 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-pale text-brand">
        <MailCheck className="h-7 w-7" />
      </span>

      <div>
        <h1 className="text-2xl font-extrabold">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          We sent a verification link to{' '}
          <strong className="text-navy">{state?.email || 'your email'}</strong>.
        </p>
      </div>

      {status === 'waiting' && (
        <div className="rounded-lg border border-line bg-page p-4 text-sm text-muted">
          <p className="font-semibold text-navy">What to do:</p>
          <ol className="mt-2 space-y-1 text-left list-decimal pl-4">
            <li>Open your email inbox</li>
            <li>Find the email from <strong>Supabase</strong> or <strong>CUI Freelance</strong></li>
            <li>Click the <strong>"Confirm your email"</strong> link</li>
            <li>You'll be automatically redirected back here</li>
          </ol>
        </div>
      )}

      {status === 'verifying' && (
        <div className="rounded-lg border border-brand/30 bg-brand-pale p-4 text-sm text-brand font-semibold">
          Verifying your email…
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-bad">
          {errorMsg}
          <br />
          <button
            className="mt-2 font-semibold underline"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      )}

      <p className="text-xs text-muted">
        Didn't receive the email? Check your spam folder.
      </p>

      <p className="text-sm">
        <Link to="/role" className="text-muted hover:underline">
          Use a different account
        </Link>
      </p>
    </div>
  )
}
