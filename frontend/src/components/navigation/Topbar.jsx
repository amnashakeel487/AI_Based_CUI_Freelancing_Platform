import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu, Search, Settings, User } from 'lucide-react'
import { Avatar, Badge, Dropdown, MenuItem } from '../ui'
import { useAuth } from '../../context/AuthContext'

export default function Topbar({ onMenu, roleLabel = 'Freelancer', base = '/freelancer' }) {
  const nav = useNavigate()
  const { user, signOut } = useAuth()
  const displayName = user?.full_name || user?.email || 'User'

  const handleLogout = async () => {
    await signOut()
    nav('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur lg:px-8">
      <button onClick={onMenu} className="rounded-lg p-2 hover:bg-brand-pale lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      <form role="search" className="relative hidden max-w-md flex-1 sm:block"
        onSubmit={(e) => { e.preventDefault(); nav(`${base}/projects?q=${encodeURIComponent(new FormData(e.target).get('q') || '')}`) }}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input name="q" aria-label="Search projects" placeholder="Search projects"
          className="h-10 w-full rounded-lg border border-line bg-page pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
      </form>
      <div className="ml-auto flex items-center gap-2">
        <Badge tone="blue" className="hidden sm:inline-flex">{roleLabel}</Badge>
        <button onClick={() => nav(`${base}/notifications`)} className="relative rounded-lg p-2 hover:bg-brand-pale" aria-label="Notifications">
          <Bell className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-bad" />
        </button>
        <Dropdown trigger={<span className="flex items-center gap-2 rounded-lg p-1 hover:bg-brand-pale"><Avatar name={displayName} size="sm" /><span className="hidden text-sm font-semibold md:block">{displayName}</span></span>}>
          <MenuItem to={`${base}/profile`} icon={User}>My profile</MenuItem>
          <MenuItem to={`${base}/settings`} icon={Settings}>Settings</MenuItem>
          <MenuItem onClick={handleLogout} icon={LogOut} danger>Log out</MenuItem>
        </Dropdown>
      </div>
    </header>
  )
}
