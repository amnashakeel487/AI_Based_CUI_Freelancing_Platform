import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/navigation/Sidebar'
import Topbar from '../components/navigation/Topbar'
import { freelancerNav } from '../components/navigation/navConfig'

// One shared workspace shell. Pass different `items`/`base` for client or admin later.
export default function DashboardLayout({ items = freelancerNav, roleLabel = 'Freelancer', base = '/freelancer' }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="min-h-screen">
      <Sidebar items={items} open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onMenu={() => setOpen(true)} roleLabel={roleLabel} base={base} />
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
