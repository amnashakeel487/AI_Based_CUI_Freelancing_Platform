import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui'
import { Clock, XCircle, Mail } from 'lucide-react'

export default function PendingApproval() {
  const { user, signOut } = useAuth()

  const isPending = user?.approval_status === 'pending'
  const isRejected = user?.approval_status === 'rejected'

  if (isRejected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-4">
        <div className="w-full max-w-md animate-rise text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-bad" />
          </div>
          <h1 className="text-2xl font-extrabold text-navy">Application Not Approved</h1>
          <p className="mt-2 text-sm text-muted">
            Unfortunately, your freelancer application was not approved.
          </p>

          {user?.rejection_reason && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left">
              <p className="text-sm font-semibold text-navy">Reason:</p>
              <p className="mt-1 text-sm text-muted">{user.rejection_reason}</p>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => (window.location.href = 'mailto:support@cuifreelance.edu.pk')}
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </Button>
            <Button variant="ghost" className="w-full" onClick={signOut}>
              Log Out
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted">
            If you believe this is a mistake, please contact our support team for assistance.
          </p>
        </div>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-4">
        <div className="w-full max-w-md animate-rise text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-8 w-8 text-warn" />
          </div>
          <h1 className="text-2xl font-extrabold text-navy">Approval Pending</h1>
          <p className="mt-2 text-sm text-muted">
            Thank you for registering! Your account is currently under review.
          </p>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-navy">
              An administrator will review your application and approve it shortly. This usually takes 1-2 business days.
            </p>
          </div>

          <div className="mt-6 space-y-2 text-left text-sm text-muted">
            <p>
              <strong className="text-navy">What happens next?</strong>
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Admin reviews your registration details</li>
              <li>You'll receive an email once approved</li>
              <li>After approval, you can complete your profile and start bidding</li>
            </ul>
          </div>

          <div className="mt-8">
            <Button variant="outline" className="w-full" onClick={signOut}>
              Log Out
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted">
            You'll be notified via email at <strong>{user?.email}</strong> once your account is approved.
          </p>
        </div>
      </div>
    )
  }

  // Shouldn't reach here, but handle gracefully
  return null
}
