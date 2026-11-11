import { Link } from 'react-router-dom'
import { Briefcase, FileText, MessageSquare, Search, Star, Wallet } from 'lucide-react'
import { Card, EmptyState, PageHeader, Button } from '../../components/ui'
import { Logo } from '../../components/ui'

// Intentionally minimal. The full client module is the next phase.
export default function ClientDashboard() {
  const planned = [[FileText, 'Post projects'], [Search, 'Find freelancers'], [Briefcase, 'Hire and manage work'], [MessageSquare, 'Messages'], [Star, 'Reviews'], [Wallet, 'Payments']]
  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
      <div className="mb-8 flex items-center justify-between"><Logo to="/client/dashboard" /><Button variant="outline" size="sm" to="/login">Log out</Button></div>
      <PageHeader title="Welcome to CUI Freelance" subtitle="Your client account is ready." />
      <Card className="border-brand/30 bg-brand-pale p-5 text-sm"><strong>The full client module is coming in the next phase.</strong> Project posting, hiring, freelancer recommendations, messaging, reviews and payments will appear here.</Card>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {planned.map(([Icon, t]) => <Card key={t} className="flex items-center gap-3 p-4 opacity-70"><Icon className="h-5 w-5 text-brand" /><span className="font-semibold">{t}</span><span className="ml-auto text-xs text-muted">Soon</span></Card>)}
      </div>
    </div>
  )
}
