import { LayoutDashboard, User, Wrench, FolderKanban, Search, Sparkles, FileText, Briefcase, MessageSquare, Bell, Star, Wallet, Receipt, Settings, HelpCircle } from 'lucide-react'

export const freelancerNav = [
  { to: '/freelancer/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/freelancer/profile', label: 'Profile', icon: User },
  { to: '/freelancer/skills', label: 'Skills', icon: Wrench },
  { to: '/freelancer/portfolio', label: 'Portfolio', icon: FolderKanban },
  { to: '/freelancer/projects', label: 'Browse Projects', icon: Search },
  { to: '/freelancer/recommendations', label: 'AI Recommendations', icon: Sparkles },
  { to: '/freelancer/proposals', label: 'My Proposals', icon: FileText },
  { to: '/freelancer/active', label: 'Active Projects', icon: Briefcase },
  { to: '/freelancer/messages', label: 'Messages', icon: MessageSquare },
  { to: '/freelancer/notifications', label: 'Notifications', icon: Bell },
  { to: '/freelancer/reviews', label: 'Reviews', icon: Star },
  { to: '/freelancer/earnings', label: 'Earnings', icon: Wallet },
  { to: '/freelancer/transactions', label: 'Transactions', icon: Receipt },
  { to: '/freelancer/settings', label: 'Settings', icon: Settings },
  { to: '/freelancer/help', label: 'Help', icon: HelpCircle },
]
// Add clientNav / adminNav here later and pass them to DashboardLayout.
