import React, { useState } from 'react';
import { Bell, Menu, Search, User, Settings, LogOut } from 'lucide-react';

const Topbar = ({ onMenuToggle }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: 'New project match found', time: '2 minutes ago', unread: true },
    { id: 2, text: 'Proposal accepted', time: '1 hour ago', unread: true },
    { id: 3, text: 'Payment received', time: '3 hours ago', unread: false },
  ];

  return (
    <header className="bg-white border-b border-border-color px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Menu and Search */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md text-muted-text hover:text-primary-text hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-text" />
              <input
                type="text"
                placeholder="Search projects, messages..."
                className="pl-10 pr-4 py-2 w-80 border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Right side - Notifications and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-md text-muted-text hover:text-primary-text hover:bg-gray-100 relative"
            >
              <Bell className="h-5 w-5" />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-border-color z-50">
                <div className="p-4 border-b border-border-color">
                  <h3 className="text-sm font-semibold text-primary-text">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-3 border-b border-border-color hover:bg-gray-50 ${notification.unread ? 'bg-blue-50' : ''}`}
                    >
                      <p className="text-sm text-primary-text">{notification.text}</p>
                      <p className="text-xs text-muted-text mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border-color">
                  <button className="text-sm text-primary-blue hover:text-blue-600 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-md text-muted-text hover:text-primary-text hover:bg-gray-100"
            >
              <div className="h-8 w-8 bg-primary-blue rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-primary-text">
                John Doe
              </span>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-border-color z-50">
                <div className="p-3 border-b border-border-color">
                  <p className="text-sm font-medium text-primary-text">John Doe</p>
                  <p className="text-xs text-muted-text">john.doe@comsats.edu.pk</p>
                </div>
                
                <div className="py-1">
                  <a 
                    href="/freelancer/profile" 
                    className="flex items-center px-3 py-2 text-sm text-muted-text hover:text-primary-text hover:bg-gray-50"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </a>
                  <a 
                    href="/freelancer/settings" 
                    className="flex items-center px-3 py-2 text-sm text-muted-text hover:text-primary-text hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </a>
                  <hr className="my-1 border-border-color" />
                  <button className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;