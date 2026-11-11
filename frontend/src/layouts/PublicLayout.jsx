import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button, Logo } from '../components/ui'

const links = [
  { to: '/', label: 'Home' }, { to: '/#projects', label: 'Explore Projects' },
  { to: '/#freelancers', label: 'Find Freelancers' }, { to: '/#how', label: 'How It Works' }, { to: '/#about', label: 'About' },
]
export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
            {links.map((l) => <a key={l.label} href={l.to} className="text-sm font-medium text-navy hover:text-brand">{l.label}</a>)}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" to="/login">Log In</Button><Button to="/role">Get Started</Button>
          </div>
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <div className="space-y-1 border-t border-line px-4 py-3 lg:hidden">
            {links.map((l) => <a key={l.label} href={l.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-pale">{l.label}</a>)}
            <div className="flex gap-2 pt-2"><Button variant="outline" to="/login" className="flex-1">Log In</Button><Button to="/role" className="flex-1">Get Started</Button></div>
          </div>
        )}
      </header>
      <Outlet />
      <footer className="bg-navy text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div><Logo light /><p className="mt-3 text-sm">A freelancing platform for the COMSATS University Islamabad community.</p></div>
          <div><h4 className="mb-3 font-bold text-white">Platform</h4><ul className="space-y-2 text-sm"><li><a href="/#how">How it works</a></li><li><a href="/#features">Features</a></li><li><a href="/#faq">FAQs</a></li></ul></div>
          <div><h4 className="mb-3 font-bold text-white">Account</h4><ul className="space-y-2 text-sm"><li><Link to="/login">Log in</Link></li><li><Link to="/role">Get started</Link></li></ul></div>
          <div><h4 className="mb-3 font-bold text-white">Contact</h4><p className="text-sm">support@your-domain.example<br />[Placeholder: contact details]</p></div>
        </div>
        <p className="border-t border-white/10 py-4 text-center text-xs">© CUI Freelance · Prototype</p>
      </footer>
    </div>
  )
}
