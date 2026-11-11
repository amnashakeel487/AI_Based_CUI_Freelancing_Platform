import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { Logo, cn } from '../ui'

export default function Sidebar({ items, open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-navy/50 lg:hidden" onClick={onClose} />}
      <aside aria-label="Main navigation"
        className={cn('fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy text-white transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex h-16 items-center justify-between px-5">
          <Logo light />
          <button onClick={onClose} className="lg:hidden" aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-6">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-brand text-white' : 'text-slate-300 hover:bg-navy-700 hover:text-white')}>
              <Icon className="h-4 w-4" />{label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
