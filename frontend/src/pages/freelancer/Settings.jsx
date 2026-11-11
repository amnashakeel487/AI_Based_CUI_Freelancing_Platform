import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import {
  Badge, Button, Card, Checkbox, ConfirmDialog, Input, PageHeader,
  Select, Tabs, useToast,
} from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { passwordIssues } from '../../utils/validate'
import { updatePassword as supabaseUpdatePassword } from '../../services/authService'
import { put } from '../../services/api'
import { supabase } from '../../lib/supabase'

export default function Settings() {
  const [tab, setTab] = useState('account')
  const toast = useToast()
  const nav = useNavigate()
  const { user, signOut } = useAuth()

  const [pw, setPw] = useState({ cur: '', next: '', confirm: '' })
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)
  const [out, setOut] = useState(false)

  // Notification preferences (local state — persisted via backend)
  const [n, setN] = useState({
    proposals: true, messages: true, projects: true, news: false,
  })

  const changePw = async (e) => {
    e.preventDefault()
    const x = {}
    if (!pw.cur) x.cur = 'Enter your current password.'
    const i = passwordIssues(pw.next)
    if (i) x.next = i
    if (pw.confirm !== pw.next) x.confirm = 'Passwords do not match.'
    setErr(x)
    if (Object.keys(x).length) return

    setBusy(true)
    try {
      await supabaseUpdatePassword(pw.next)
      toast('Password updated successfully.')
      setPw({ cur: '', next: '', confirm: '' })
    } catch (err) {
      toast(err.message || 'Failed to update password.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const saveSettings = async () => {
    try {
      await put('/account/settings', {
        notify_proposals: n.proposals,
        notify_messages: n.messages,
        notify_projects: n.projects,
        notify_news: n.news,
      })
      toast('Settings saved.')
    } catch (err) {
      toast(err.message || 'Failed to save settings.', 'error')
    }
  }

  const handleLogout = async () => {
    await signOut()
    nav('/login')
  }

  return (
    <>
      <PageHeader title="Settings" />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'account', label: 'Account' },
          { value: 'privacy', label: 'Visibility' },
          { value: 'notifications', label: 'Notifications' },
          { value: 'security', label: 'Security' },
          { value: 'premium', label: 'AI Tools' },
        ]}
      />

      <Card className="mt-6 max-w-2xl space-y-4 p-6">
        {tab === 'account' && (
          <>
            <Input
              label="Email"
              value={user?.email || ''}
              readOnly
              hint="Email changes are handled through Supabase Auth."
            />
            <Button onClick={saveSettings}>Save changes</Button>
          </>
        )}

        {tab === 'privacy' && (
          <>
            <Select
              label="Profile visibility"
              defaultValue="public"
              options={[
                { value: 'public', label: 'Visible to all CUI members' },
                { value: 'clients', label: 'Visible to clients I apply to' },
                { value: 'private', label: 'Hidden' },
              ]}
            />
            <Button onClick={async () => {
              try {
                await put('/account/settings', { visibility: 'public' })
                toast('Visibility saved.')
              } catch (err) {
                toast(err.message || 'Failed to save.', 'error')
              }
            }}>Save</Button>
          </>
        )}

        {tab === 'notifications' && (
          <>
            <Checkbox label="Proposal updates" checked={n.proposals}
              onChange={(e) => setN({ ...n, proposals: e.target.checked })} />
            <Checkbox label="New messages" checked={n.messages}
              onChange={(e) => setN({ ...n, messages: e.target.checked })} />
            <Checkbox label="Project deadlines" checked={n.projects}
              onChange={(e) => setN({ ...n, projects: e.target.checked })} />
            <Checkbox label="Platform news" checked={n.news}
              onChange={(e) => setN({ ...n, news: e.target.checked })} />
            <Button onClick={saveSettings}>Save preferences</Button>
          </>
        )}

        {tab === 'security' && (
          <form onSubmit={changePw} noValidate className="space-y-4">
            <Input
              label="Current password"
              type="password"
              value={pw.cur}
              onChange={(e) => setPw({ ...pw, cur: e.target.value })}
              error={err.cur}
              hint="Enter your current password to confirm the change."
            />
            <Input
              label="New password"
              type="password"
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
              error={err.next}
              hint="At least 8 characters with a letter and a number."
            />
            <Input
              label="Confirm new password"
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              error={err.confirm}
            />
            <Button type="submit" loading={busy}>Change password</Button>
          </form>
        )}

        {tab === 'premium' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-pale text-brand">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-navy">Premium AI Tools</p>
                <Badge tone="warning">Coming soon</Badge>
              </div>
            </div>
            <p className="text-sm text-muted">
              Premium AI tools include AI-powered proposal writing, smart project
              recommendations, and automated milestone tracking. This feature is
              not yet available.
            </p>
            <div className="rounded-lg border border-dashed border-line p-4 text-center text-sm text-muted">
              <p className="font-semibold">You are on the free plan</p>
              <p className="mt-1 text-xs">Premium features will be unlocked when this feature launches.</p>
            </div>
            <Button disabled variant="outline" className="w-full">Upgrade to Premium</Button>
          </div>
        )}
      </Card>

      <div className="mt-6">
        <Button variant="danger" onClick={() => setOut(true)}>Log out</Button>
      </div>

      <ConfirmDialog
        open={out}
        title="Log out?"
        text="You will return to the login page."
        confirmLabel="Log out"
        onClose={() => setOut(false)}
        onConfirm={handleLogout}
      />
    </>
  )
}
