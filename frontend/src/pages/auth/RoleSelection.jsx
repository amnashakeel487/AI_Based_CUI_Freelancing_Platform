import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, CheckCircle2, Code2 } from 'lucide-react'
import { Button, cn } from '../../components/ui'

const roles = [
  {
    id: 'freelancer',
    icon: Code2,
    title: "I'm a Freelancer",
    cta: 'Continue as Freelancer',
    to: '/register/freelancer',
    desc: 'Showcase your skills, discover suitable projects, submit proposals, and grow your professional reputation.',
    items: [
      'Build a profile and portfolio',
      'Get AI-matched project suggestions',
      'Send proposals and track work',
    ],
  },
  {
    id: 'client',
    icon: Briefcase,
    title: "I'm a Client",
    cta: 'Continue as Client',
    to: '/register/client',
    desc: 'Publish your project requirements, discover suitable freelancers, hire talent, and manage project progress.',
    items: [
      'Post project requirements',
      'Find freelancers who fit',
      'Manage progress and give feedback',
    ],
  },
]

export default function RoleSelection() {
  const [role, setRole] = useState(null)
  const nav = useNavigate()
  const go = (r) => { nav(r.to) }

  return (
    <div className="w-full py-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy">
          Choose your role
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Pick how you want to use CUI Freelance. You can read about each option before continuing.
        </p>
      </div>

      {/* Cards */}
      <div
        role="radiogroup"
        aria-label="Role"
        className="grid gap-6 md:grid-cols-2"
      >
        {roles.map((r) => (
          <div
            key={r.id}
            role="radio"
            aria-checked={role === r.id}
            tabIndex={0}
            onClick={() => setRole(r.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setRole(r.id)
              }
            }}
            className={cn(
              'flex cursor-pointer flex-col rounded-2xl border-2 bg-white p-8 shadow-card transition-all duration-200',
              'hover:-translate-y-1 hover:shadow-lg',
              role === r.id
                ? 'border-brand ring-4 ring-brand/10 -translate-y-1 shadow-lg'
                : 'border-line hover:border-brand/50'
            )}
          >
            {/* Icon */}
            <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-pale text-brand">
              <r.icon className="h-7 w-7" />
            </span>

            {/* Title */}
            <h2 className="text-2xl font-extrabold text-navy">{r.title}</h2>

            {/* Description */}
            <p className="mt-3 text-sm leading-relaxed text-muted">{r.desc}</p>

            {/* Feature list */}
            <ul className="my-6 space-y-3 flex-1">
              {r.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-navy">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button
              size="lg"
              className="mt-2 w-full"
              variant={role === r.id ? 'primary' : 'outline'}
              onClick={(e) => { e.stopPropagation(); go(r) }}
            >
              {r.cta}
            </Button>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{' '}
        <a href="/login" className="font-semibold text-brand hover:underline">
          Log in
        </a>
      </p>
    </div>
  )
}
