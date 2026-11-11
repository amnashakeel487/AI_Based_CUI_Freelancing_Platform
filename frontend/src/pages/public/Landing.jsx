import { useState } from 'react'
import { BadgeCheck, Briefcase, ChevronDown, FileSearch, Lock, MessageSquare, Search, ShieldCheck, Sparkles, Star, UserCircle, Users } from 'lucide-react'
import { Badge, Button, Card, Progress, cn } from '../../components/ui'

// Static preview data for the public landing page (not auth-gated)
const previewProject = {
  title: 'Society event registration website',
  client: 'CUI Debating Society',
  match: 92,
  skills: ['React', 'Tailwind CSS', 'Supabase'],
}
const landingFaqs = [
  { q: 'Who can use CUI Freelance?', a: 'The platform is built for the CUI community. Registration uses a COMSATS email address.' },
  { q: 'How does AI matching work?', a: 'Recommendations compare project requirements with your skills and profile. The engine is rule-based, scoring by skill overlap and proficiency level.' },
  { q: 'Is payment handled on the platform?', a: 'Payment handling is planned for a later phase. Earnings screens show transaction records once escrow is connected.' },
  { q: 'Can I be both a freelancer and a client?', a: 'Each account has one role for now. Role switching can be added later.' },
]

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg animate-rise">
      <div className="rounded-2xl border border-line bg-white p-4 shadow-[0_20px_60px_rgba(16,43,82,.18)]">
        <div className="mb-3 flex items-center justify-between"><p className="text-sm font-bold">Recommended for you</p><span className="inline-flex items-center gap-1 rounded-md border border-dashed border-warn/60 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">Sample preview</span></div>
        <div className="rounded-xl border border-line p-4">
          <div className="flex items-start justify-between gap-3">
            <div><p className="font-bold">{previewProject.title}</p><p className="text-xs text-muted">{previewProject.client}</p></div>
            <span className="rounded-lg bg-brand px-2.5 py-1 text-sm font-extrabold text-white">{previewProject.match}%</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">{previewProject.skills.map((s) => <Badge key={s} tone="blue">{s}</Badge>)}</div>
          <Progress className="mt-4" value={previewProject.match} label="Skill match" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs">
          {[['Active', '2'], ['Proposals', '4'], ['Rating', '4.8']].map(([l, v]) => (
            <div key={l} className="rounded-lg bg-page py-2"><p className="text-lg font-extrabold">{v}</p><p className="text-muted">{l}</p></div>
          ))}
        </div>
      </div>
    </div>
  )
}
const Section = ({ id, title, sub, children, tint }) => (
  <section id={id} className={cn('py-16 sm:py-20', tint && 'bg-page')}>
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="mb-10 max-w-2xl"><h2 className="text-3xl font-extrabold tracking-tight">{title}</h2>{sub && <p className="mt-3 text-muted">{sub}</p>}</div>
      {children}
    </div>
  </section>
)
const steps = [
  { icon: Users, t: 'Choose your role', d: 'Join as a freelancer or a client.' },
  { icon: UserCircle, t: 'Build your profile', d: 'Add skills, experience and portfolio work.' },
  { icon: Sparkles, t: 'Get matched', d: 'Discover projects or talent that fit.' },
  { icon: Briefcase, t: 'Collaborate', d: 'Agree on scope, deliver work, leave feedback.' },
]
const features = [
  [Sparkles, 'AI matching', 'Projects and freelancers ranked by how well skills fit requirements.'],
  [FileSearch, 'Clear proposals', 'Bid, explain your approach, and attach relevant portfolio work.'],
  [MessageSquare, 'Built-in messages', 'Discuss scope and share updates in one place.'],
  [Star, 'Reviews', 'Build a reputation from completed projects.'],
]

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0)
  return (
    <>
      <section className="bg-gradient-to-b from-brand-pale to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="animate-rise">
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">Your Skills. The Right Projects. Smarter Connections.</h1>
            <p className="mt-5 max-w-lg text-lg text-muted">CUI Freelance connects students and clients inside the COMSATS community. AI-assisted matching compares project requirements with freelancer skills so the right people find each other faster.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Button size="lg" to="/role">Get Started</Button><Button size="lg" variant="outline" onClick={(e) => { e.preventDefault(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }) }}>Explore Projects</Button></div>
            <p className="mt-6 flex items-center gap-2 text-sm text-muted"><ShieldCheck className="h-4 w-4 text-brand" />Built for the CUI community. Registration uses a COMSATS email.</p>
          </div>
          <ProductPreview />
        </div>
      </section>

      <Section id="how" title="How it works">
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, t, d }, i) => (
            <li key={t}><Card className="h-full p-5"><span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-pale text-brand"><Icon className="h-5 w-5" /></span><p className="text-xs font-semibold text-brand">Step {i + 1}</p><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></Card></li>
          ))}
        </ol>
      </Section>

      <Section id="freelancers" tint title="Made for both sides of a project">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            ['For freelancers', ['Showcase skills and portfolio', 'Discover suitable projects', 'Submit proposals', 'Build a reputation']],
            ['For clients', ['Publish project requirements', 'Discover suitable freelancers', 'Track work in progress', 'Give feedback']],
            ['AI matching', ['Uses project requirements', 'Compares skills and profile details', 'Shows why a match was suggested', 'Other signals will be added over time']],
          ].map(([t, items]) => (
            <Card key={t} className="p-6"><h3 className="text-lg font-bold">{t}</h3>
              <ul className="mt-4 space-y-2.5">{items.map((i) => <li key={i} className="flex gap-2 text-sm"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{i}</li>)}</ul></Card>
          ))}
        </div>
      </Section>

      <Section id="features" title="Everything a project needs" sub="Platform features planned for the first release.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(([Icon, t, d]) => <div key={t}><Icon className="mb-3 h-6 w-6 text-brand" /><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></div>)}
        </div>
      </Section>

      <Section id="projects" tint title="Project workflow" sub="From posting to feedback in five stages.">
        <div className="grid gap-3 sm:grid-cols-5">
          {['Post', 'Match', 'Propose', 'Deliver', 'Review'].map((s, i) => (
            <div key={s} className="rounded-xl border border-line bg-white p-4 text-center font-bold">{s}{i < 4 && <span className="sr-only"> then</span>}</div>
          ))}
        </div>
      </Section>

      <Section id="about" title="Trust and safety">
        <div className="grid gap-5 sm:grid-cols-3">
          {[[ShieldCheck, 'University-based community', 'Accounts use COMSATS email addresses.'], [Lock, 'Protected accounts', 'Secure authentication is planned with Supabase Auth.'], [Star, 'Visible reputation', 'Reviews are tied to completed projects.']].map(([Icon, t, d]) => (
            <Card key={t} className="p-5"><Icon className="mb-3 h-6 w-6 text-brand" /><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></Card>
          ))}
        </div>
      </Section>

      <Section id="faq" tint title="Frequently asked questions">
        <div className="max-w-3xl space-y-3">
          {landingFaqs.map((f, i) => (
            <Card key={f.q}>
              <button className="flex w-full items-center justify-between gap-3 p-4 text-left font-semibold" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                {f.q}<ChevronDown className={cn('h-5 w-5 shrink-0 transition-transform', openFaq === i && 'rotate-180')} />
              </button>
              {openFaq === i && <p className="px-4 pb-4 text-sm text-muted">{f.a}</p>}
            </Card>
          ))}
        </div>
      </Section>

      <section className="bg-navy py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-extrabold">Ready to find your next project?</h2>
          <p className="mt-3 text-slate-300">Create an account in a few minutes.</p>
          <div className="mt-6 flex justify-center gap-3"><Button size="lg" to="/role">Get Started</Button><Button size="lg" variant="outline" to="/login">Log In</Button></div>
        </div>
      </section>
    </>
  )
}
