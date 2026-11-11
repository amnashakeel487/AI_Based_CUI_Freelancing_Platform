import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Eye, Github, Globe, Linkedin, Pencil } from 'lucide-react'
import {
  Avatar, Badge, Button, Card, ErrorState, Input, LoadingState,
  PageHeader, Select, Tabs, Textarea, useToast,
} from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { getProfile, updateProfile } from '../../services/profileService'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

// ─── Overview (shared by Profile and Public Preview tabs) ────────────────────

function Overview({ profile, preview }) {
  const skills    = profile.skills    || []
  const portfolio = profile.portfolio || []
  const experience = profile.experience_items || []

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Sidebar card */}
      <Card className="p-6 text-center lg:col-span-1">
        {profile.avatar_url
          ? <img src={profile.avatar_url} alt={profile.full_name} className="mx-auto h-20 w-20 rounded-full object-cover" />
          : <Avatar name={profile.full_name || '?'} size="lg" className="mx-auto" />
        }
        <h2 className="mt-3 text-xl font-extrabold">{profile.full_name}</h2>
        <p className="text-sm text-muted">{profile.headline}</p>
        {!preview && <p className="mt-1 text-xs text-muted">{profile.email}</p>}
        {profile.experience_level && (
          <div className="mt-3"><Badge tone="blue">{profile.experience_level}</Badge></div>
        )}
        {/* External links */}
        <div className="mt-4 flex justify-center gap-3 text-muted">
          {profile.github_url   && <a href={profile.github_url}   target="_blank" rel="noreferrer" aria-label="GitHub">   <Github    className="h-5 w-5 hover:text-navy" /></a>}
          {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin  className="h-5 w-5 hover:text-navy" /></a>}
          {profile.site_url     && <a href={profile.site_url}     target="_blank" rel="noreferrer" aria-label="Website"> <Globe     className="h-5 w-5 hover:text-navy" /></a>}
        </div>
      </Card>

      {/* Main column */}
      <div className="space-y-6 lg:col-span-2">
        <Card className="p-6">
          <h3 className="font-bold">About</h3>
          <p className="mt-2 text-sm text-muted">{profile.bio || 'No bio added yet.'}</p>
          {(profile.program || profile.department) && (
            <p className="mt-3 text-sm">
              <strong>{profile.program}</strong>
              {profile.department && ` · ${profile.department}`}
              {profile.campus     && `, ${profile.campus} campus`}
              {profile.semester   && ` · ${profile.semester} semester`}
            </p>
          )}
        </Card>

        {skills.length > 0 && (
          <Card className="p-6">
            <h3 className="mb-3 font-bold">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge key={s.skill_id ?? s.name} tone="blue">{s.name} · {s.level}</Badge>
              ))}
            </div>
          </Card>
        )}

        {portfolio.length > 0 && (
          <Card className="p-6">
            <h3 className="mb-3 font-bold">Portfolio</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {portfolio.map((p) => (
                <div key={p.id} className="rounded-lg border border-line p-3">
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-xs text-muted">{(p.technologies || []).join(', ')}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {experience.length > 0 && (
          <Card className="p-6">
            <h3 className="mb-3 font-bold">Experience</h3>
            {experience.map((e) => (
              <p key={e.id} className="text-sm">
                <strong>{e.role}</strong>, {e.organization}{' '}
                <span className="text-muted">({e.period})</span>
              </p>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}

// ─── Profile (view) ───────────────────────────────────────────────────────────

export function Profile() {
  const [tab, setTab] = useState('overview')
  const { data: profile, loading, error, reload } = useAsync(getProfile)

  if (loading) return <LoadingState label="Loading profile…" />
  if (error)   return <ErrorState title="Could not load profile" text={error.message} onRetry={reload} />

  return (
    <>
      <PageHeader
        title="My profile"
        actions={<Button to="/freelancer/profile/edit"><Pencil className="h-4 w-4" />Edit profile</Button>}
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[{ value: 'overview', label: 'Overview' }, { value: 'public', label: 'Public preview' }]}
      />
      <div className="mt-6">
        {tab === 'public' && (
          <p className="mb-4 flex items-center gap-2 text-sm text-muted">
            <Eye className="h-4 w-4" />This is how clients see your profile.
          </p>
        )}
        <Overview profile={profile} preview={tab === 'public'} />
      </div>
    </>
  )
}

// ─── EditProfile ──────────────────────────────────────────────────────────────

export function EditProfile() {
  const nav = useNavigate()
  const toast = useToast()
  const { reloadUser } = useAuth()

  const { data: saved, loading, error, reload } = useAsync(getProfile)

  // Local form state seeded once the profile loads
  const [form, setForm] = useState(null)
  const [err, setErr]   = useState({})
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)

  // Seed form from fetched profile (only once)
  if (saved && !form) {
    setForm({
      full_name:        saved.full_name        || '',
      headline:         saved.headline         || '',
      phone:            saved.phone            || '',
      city:             saved.city             || '',
      program:          saved.program          || '',
      department:       saved.department       || '',
      campus:           saved.campus           || '',
      semester:         saved.semester         || '',
      experience_level: saved.experience_level || '',
      bio:              saved.bio              || '',
      github_url:       saved.github_url       || '',
      linkedin_url:     saved.linkedin_url     || '',
      site_url:         saved.site_url         || '',
    })
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
    if (!ALLOWED.includes(file.type)) return toast('Only JPEG, PNG, or WebP images.', 'error')
    if (file.size > 5 * 1024 * 1024) return toast('Image must be under 5 MB.', 'error')

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const path = `${user.id}/avatar.${file.name.split('.').pop()}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await updateProfile({ avatar_url: publicUrl })
      toast('Avatar updated.')
      reload()
    } catch (err) {
      toast(err.message || 'Upload failed.', 'error')
    } finally {
      setUploading(false)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    const x = {}
    if (!form.full_name.trim()) x.full_name = 'Enter your name.'
    if (!form.headline.trim())  x.headline  = 'Add a headline.'
    if (form.bio && form.bio.length < 20) x.bio = 'Write at least 20 characters, or leave it empty.'
    for (const k of ['github_url', 'linkedin_url', 'site_url']) {
      if (form[k] && !/^https?:\/\//.test(form[k])) x[k] = 'Start with http:// or https://'
    }
    setErr(x)
    if (Object.keys(x).length) return

    setSaving(true)
    try {
      await updateProfile(form)
      await reloadUser()
      toast('Profile saved.')
      nav('/freelancer/profile')
    } catch (err) {
      toast(err.message || 'Failed to save profile.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState label="Loading profile…" />
  if (error)   return <ErrorState title="Could not load profile" text={error.message} onRetry={reload} />
  if (!form)   return null

  return (
    <>
      <PageHeader title="Edit profile" back="/freelancer/profile" />
      <form onSubmit={save} noValidate className="space-y-6">

        {/* Avatar */}
        <Card className="flex items-center gap-5 p-6">
          {saved?.avatar_url
            ? <img src={saved.avatar_url} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
            : <Avatar name={form.full_name || '?'} size="lg" />
          }
          <div>
            <label className="cursor-pointer">
              <Button type="button" variant="outline" size="sm" loading={uploading} asChild>
                <span><Camera className="h-4 w-4" />{uploading ? 'Uploading…' : 'Change photo'}</span>
              </Button>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
            <p className="mt-1 text-xs text-muted">JPEG, PNG, or WebP · max 5 MB</p>
          </div>
        </Card>

        {/* Personal */}
        <Card className="space-y-4 p-6">
          <h3 className="font-bold text-navy">Personal</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name"  required value={form.full_name}  onChange={set('full_name')}  error={err.full_name} />
            <Input label="Headline"   required value={form.headline}   onChange={set('headline')}   error={err.headline} placeholder="Full-stack developer · React & Python" />
            <Input label="Phone"               value={form.phone}      onChange={set('phone')} />
            <Input label="City"                value={form.city}       onChange={set('city')} />
          </div>
          <Textarea label="Bio" value={form.bio} onChange={set('bio')} error={err.bio} rows={4} hint="Shown on your public profile and used for AI matching." />
        </Card>

        {/* Academic */}
        <Card className="space-y-4 p-6">
          <h3 className="font-bold text-navy">Academic</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Degree / program"  value={form.program}    onChange={set('program')}    placeholder="BS Software Engineering" />
            <Input label="Department"        value={form.department} onChange={set('department')} />
            <Input label="Campus"            value={form.campus}     onChange={set('campus')} />
            <Select
              label="Semester"
              value={form.semester}
              onChange={set('semester')}
              placeholder="Select"
              options={['1st','2nd','3rd','4th','5th','6th','7th','8th','Graduated']}
            />
            <Select
              label="Experience level"
              value={form.experience_level}
              onChange={set('experience_level')}
              placeholder="Select"
              options={['Beginner','Intermediate','Advanced']}
            />
          </div>
        </Card>

        {/* Links */}
        <Card className="space-y-4 p-6">
          <h3 className="font-bold text-navy">Links</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="GitHub"    value={form.github_url}   onChange={set('github_url')}   error={err.github_url}   placeholder="https://github.com/you" />
            <Input label="LinkedIn"  value={form.linkedin_url} onChange={set('linkedin_url')} error={err.linkedin_url} placeholder="https://linkedin.com/in/you" />
            <Input label="Portfolio site" value={form.site_url} onChange={set('site_url')}   error={err.site_url}     placeholder="https://yoursite.com" />
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => nav('/freelancer/profile')}>Cancel</Button>
          <Button type="submit" loading={saving}>Save changes</Button>
        </div>
      </form>
    </>
  )
}
