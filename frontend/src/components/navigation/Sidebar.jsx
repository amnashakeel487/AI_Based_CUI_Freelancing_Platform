import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  FileText, 
  Settings,
  MessageSquare,
  Bell,
  Star,
  DollarSign,
  Bot,
  HelpCircle,
  FolderOpen,
  Trophy,
  Target,
  Send
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navigation = [
    { name: 'Dashboard', href: '/freelancer/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/freelancer/profile', icon: User },
    { name: 'Skills', href: '/freelancer/skills', icon: Target },
    { name: 'Portfolio', href: '/freelancer/portfolio', icon: Trophy },
    
    { type: 'divider', label: 'Projects' },
    { name: 'Available Projects', href: '/freelancer/projects', icon: Briefcase },
    { name: 'Recommendations', href: '/freelancer/recommendations', icon: Target },
    { name: 'My Proposals', href: '/freelancer/proposals', icon: FileText },
    { name: 'Active Projects', href: '/freelancer/my-projects', icon: FolderOpen },
    
    { type: 'divider', label: 'Communication' },
    { name: 'Messages', href: '/freelancer/messages', icon: MessageSquare },
    { name: 'Notifications', href: '/freelancer/notifications', icon: Bell },
    
    { type: 'divider', label: 'Performance' },
    { name: 'Reviews', href: '/freelancer/reviews', icon: Star },
    { name: 'Earnings', href: '/freelancer/earnings', icon: DollarSign },
    { name: 'Transactions', href: '/freelancer/transactions', icon: DollarSign },
    
    { type: 'divider', label: 'Tools' },
    { name: 'AI Tools', href: '/freelancer/ai-tools', icon: Bot },
    
    { type: 'divider', label: 'Support' },
    { name: 'Settings', href: '/freelancer/settings', icon: Settings },
    { name: 'Support', href: '/freelancer/support', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border-color transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-border-color">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CUI</span>
              </div>
              <span className="ml-3 text-lg font-semibold text-navy">Freelance</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item, index) => {
              if (item.type === 'divider') {
                return (
                  <div key={index} className="py-2">
                    <p className="px-3 text-xs font-semibold text-muted-text uppercase tracking-wider">
                      {item.label}
                    </p>
                  </div>
                );
              }

              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) => `
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive 
                      ? 'bg-primary-blue text-white' 
                      : 'text-muted-text hover:text-primary-text hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;