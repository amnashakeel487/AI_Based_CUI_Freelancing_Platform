import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Select, Textarea, cn } from '../../components/ui'

// Static categories — client onboarding is not in scope for backend wiring yet
const categories = ['Web Development', 'Mobile Apps', 'UI/UX Design', 'Data & AI', 'Writing', 'Multimedia']

export default function ClientOnboarding() {
  const nav = useNavigate()
  const [d, setD] = useState({ name: '', phone: '', type: 'Individual', org: '', about: '', cats: [] })
  const [err, setErr] = useState({})
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    const x = {}
    if (!d.name.trim()) x.name = 'Enter your name.'
    if (d.type === 'Organization' && !d.org.trim()) x.org = 'Enter the organization name.'
    setErr(x); if (Object.keys(x).length) return
    // TODO(Supabase): upsert client profile, set onboarding_complete = true
    nav('/client/dashboard')
  }
  return (
    <form onSubmit={submit} noValidate>
      <h1 className="text-2xl font-extrabold">Set up your client profile</h1>
      <p className="mt-1 text-sm text-muted">Tell freelancers who you are. This takes about a minute.</p>
      <Card className="mt-5 space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2"><Input label="Name" required value={d.name} onChange={set('name')} error={err.name} /><Input label="Contact phone" value={d.phone} onChange={set('phone')} /></div>
        <Select label="Client type" value={d.type} onChange={set('type')} options={['Individual', 'Student project team', 'Organization']} />
        {d.type === 'Organization' && <Input label="Organization name" required value={d.org} onChange={set('org')} error={err.org} />}
        <Textarea label="Short description" rows={3} value={d.about} onChange={set('about')} hint="What do you usually need help with?" />
        <fieldset><legend className="mb-2 text-sm font-semibold">Project categories of interest</legend>
          <div className="flex flex-wrap gap-2">{categories.map((c) => { const on = d.cats.includes(c); return <button type="button" key={c} aria-pressed={on} onClick={() => setD({ ...d, cats: on ? d.cats.filter((x) => x !== c) : [...d.cats, c] })} className={cn('rounded-full border px-3 py-1.5 text-sm font-medium', on ? 'border-brand bg-brand-pale text-brand' : 'border-line hover:bg-page')}>{c}</button> })}</div></fieldset>
      </Card>
      <div className="mt-5 flex justify-end"><Button type="submit">Finish setup</Button></div>
    </form>
  )
}
