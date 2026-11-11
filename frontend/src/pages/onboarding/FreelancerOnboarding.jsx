import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Camera } from 'lucide-react'
import { Button, Card, Input, Progress, Select, Textarea, cn, useToast } from '../../components/ui'
import SkillPicker from '../../components/SkillPicker'
import { completeOnboarding } from '../../services/profileService'
import { useAuth } from '../../context/AuthContext'

// Static fallback — also loaded from API in background
const CATEGORIES = ['Web Development', 'Mobile Apps', 'UI/UX Design', 'Data & AI', 'Writing', 'Multimedia']

const steps = ['Personal', 'Academic', 'Skills', 'Portfolio', 'Preferences', 'Review']
const empty = {
  name: '', phone: '', city: '', headline: '', program: '', department: '', campus: '', semester: '', bio: '', experience: '',
  skills: [], github: '', linkedin: '', site: '', proj: { title: '', description: '', tech: '', link: '' },
  categories: [], tech: '', availability: '', budget: '', mode: '',
}
const pct = (d) => {
  const f = [d.name, d.headline, d.program, d.bio, d.skills.length, d.github || d.linkedin || d.site, d.proj.title, d.categories.length, d.availability]
  return Math.round((f.filter(Boolean).length / f.length) * 100)
}

const FALLBACK_CATEGORIES = ['Web Development', 'Mobile Apps', 'UI/UX Design', 'Data & AI', 'Writing', 'Multimedia']

export default function FreelancerOnboarding() {
  const nav = useNavigate(); const toast = useToast()
  const { reloadUser } = useAuth()
  const categories = FALLBACK_CATEGORIES
  const [step, setStep] = useState(0)
  const [d, setD] = useState(() => { try { return { ...empty, ...JSON.parse(sessionStorage.getItem('fl_onboarding') || '{}') } } catch { return empty } })
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value })
  const setProj = (k) => (e) => setD({ ...d, proj: { ...d.proj, [k]: e.target.value } })
  const persist = () => { try { sessionStorage.setItem('fl_onboarding', JSON.stringify(d)) } catch { /* ignore */ } } // TODO: save draft to Supabase profile
  const validate = () => {
    const e = {}
    if (step === 0) { if (!d.name.trim()) e.name = 'Enter your name.'; if (!d.headline.trim()) e.headline = 'Add a short headline.' }
    if (step === 1 && d.bio && d.bio.length < 20) e.bio = 'Write at least 20 characters, or leave it empty.'
    if (step === 3) for (const k of ['github', 'linkedin', 'site']) if (d[k] && !/^https?:\/\//.test(d[k])) e[k] = 'Start with http:// or https://'
    setErr(e); return !Object.keys(e).length
  }
  const next = () => { if (!validate()) return; persist(); setStep(step + 1) }
  const finish = async () => {
    setBusy(true)
    try {
      await completeOnboarding({
        full_name: d.name,
        phone: d.phone,
        city: d.city,
        headline: d.headline,
        bio: d.bio,
        program: d.program,
        department: d.department,
        campus: d.campus,
        semester: d.semester,
        experience_level: d.experience,
        skills: d.skills,
        github_url: d.github || null,
        linkedin_url: d.linkedin || null,
        site_url: d.site || null,
        portfolio_title: d.proj.title || null,
        portfolio_description: d.proj.description || null,
        portfolio_tech: d.proj.tech || null,
        portfolio_link: d.proj.link || null,
        preferred_categories: d.categories,
        tech_pref: d.tech || null,
        availability: d.availability || null,
        budget_pref: d.budget || null,
        work_mode: d.mode || null,
      })
      sessionStorage.removeItem('fl_onboarding')
      await reloadUser()
      toast('Profile saved successfully!')
      nav('/freelancer/dashboard')
    } catch (error) {
      toast(error.message || 'Failed to save profile.', 'error')
    } finally {
      setBusy(false)
    }
  }
  const toggleCat = (c) => setD({ ...d, categories: d.categories.includes(c) ? d.categories.filter((x) => x !== c) : [...d.categories, c] })

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Set up your freelancer profile</h1>
      <p className="mt-1 text-sm text-muted">Step {step + 1} of {steps.length}: {steps[step]}. Only a few fields are required.</p>
      <ol className="my-5 flex gap-1.5" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s} className="flex-1" aria-current={i === step ? 'step' : undefined}>
            <div className={cn('h-1.5 rounded-full', i <= step ? 'bg-brand' : 'bg-line')} />
            <span className={cn('mt-1.5 hidden items-center gap-1 text-xs font-medium sm:flex', i === step ? 'text-brand' : 'text-muted')}>{i < step && <Check className="h-3 w-3" />}{s}</span>
          </li>
        ))}
      </ol>
      <Card className="space-y-4 p-6">
        {step === 0 && <>
          <div className="flex items-center gap-4"><span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-line text-muted"><Camera className="h-6 w-6" /></span>
            <div><Button type="button" variant="outline" size="sm" disabled>Upload photo</Button><p className="mt-1 text-xs text-muted">Photo upload needs file storage, which is not connected yet.</p></div></div>
          <Input label="Full name" required value={d.name} onChange={set('name')} error={err.name} />
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Phone" value={d.phone} onChange={set('phone')} /><Input label="City" value={d.city} onChange={set('city')} /></div>
          <Input label="Professional headline" required value={d.headline} onChange={set('headline')} error={err.headline} placeholder="Full-stack developer · React & Python" hint="Shown under your name on proposals." />
        </>}
        {step === 1 && <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Degree / program" value={d.program} onChange={set('program')} placeholder="BS Software Engineering" />
            <Input label="Department" value={d.department} onChange={set('department')} />
            <Input label="Campus" value={d.campus} onChange={set('campus')} />
            <Select label="Semester" value={d.semester} onChange={set('semester')} placeholder="Select" options={['1st','2nd','3rd','4th','5th','6th','7th','8th','Graduated']} hint="Helps clients gauge your experience." />
          </div>
          <Select label="Experience level" value={d.experience} onChange={set('experience')} placeholder="Select" options={['Beginner', 'Intermediate', 'Advanced']} />
          <Textarea label="Professional bio" value={d.bio} onChange={set('bio')} error={err.bio} hint="Used for your public profile and AI matching." />
        </>}
        {step === 2 && <SkillPicker value={d.skills} onChange={(skills) => setD({ ...d, skills })} />}
        {step === 3 && <>
          <p className="text-sm text-muted">No projects yet? You can skip this step.</p>
          <div className="grid gap-4 sm:grid-cols-3"><Input label="GitHub" value={d.github} onChange={set('github')} error={err.github} /><Input label="LinkedIn" value={d.linkedin} onChange={set('linkedin')} error={err.linkedin} /><Input label="Portfolio site" value={d.site} onChange={set('site')} error={err.site} /></div>
          <Input label="Project title" value={d.proj.title} onChange={setProj('title')} />
          <Textarea label="Description" rows={3} value={d.proj.description} onChange={setProj('description')} />
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Technologies used" value={d.proj.tech} onChange={setProj('tech')} placeholder="React, FastAPI" /><Input label="Project link" value={d.proj.link} onChange={setProj('link')} /></div>
          <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-line text-sm text-muted">Project thumbnail (upload not connected yet)</div>
        </>}
        {step === 4 && <>
          <fieldset><legend className="mb-2 text-sm font-semibold">Preferred project categories</legend>
            <div className="flex flex-wrap gap-2">{categories.map((c) => <button type="button" key={c} aria-pressed={d.categories.includes(c)} onClick={() => toggleCat(c)} className={cn('rounded-full border px-3 py-1.5 text-sm font-medium', d.categories.includes(c) ? 'border-brand bg-brand-pale text-brand' : 'border-line hover:bg-page')}>{c}</button>)}</div></fieldset>
          <Input label="Preferred technologies" value={d.tech} onChange={set('tech')} placeholder="React, Python" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Availability" value={d.availability} onChange={set('availability')} placeholder="Select" options={['Part-time (10 hrs/week)', 'Part-time (20 hrs/week)', 'Full-time']} />
            <Select label="Budget preference" value={d.budget} onChange={set('budget')} placeholder="Any" options={['Under PKR 10,000', 'PKR 10,000–30,000', 'Above PKR 30,000']} />
            <Select label="Work mode" value={d.mode} onChange={set('mode')} placeholder="Any" options={['Remote', 'On campus', 'Hybrid']} />
          </div>
        </>}
        {step === 5 && <>
          <Progress value={pct(d)} label="Profile completion" />
          {[['Personal', 0, [d.name, d.headline, d.city].filter(Boolean).join(' · ')], ['Academic', 1, [d.program, d.department, d.experience].filter(Boolean).join(' · ')],
            ['Skills', 2, d.skills.map((s) => s.name).join(', ')], ['Portfolio', 3, d.proj.title || d.github], ['Preferences', 4, [d.categories.join(', '), d.availability].filter(Boolean).join(' · ')]].map(([t, i, v]) => (
            <div key={t} className="flex items-start justify-between gap-3 border-b border-line pb-3 last:border-0">
              <div><p className="text-sm font-semibold">{t}</p><p className="text-sm text-muted">{v || 'Not provided yet'}</p></div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setStep(i)}>Edit</Button>
            </div>))}
        </>}
      </Card>
      <div className="mt-5 flex items-center justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
        <div className="flex gap-2">
          {step === 3 && <Button variant="ghost" onClick={() => setStep(4)}>Skip for now</Button>}
          {step < 5 ? <Button onClick={next}>Save and continue</Button> : <Button onClick={finish} loading={busy}>Complete Profile</Button>}
        </div>
      </div>
    </div>
  )
}
