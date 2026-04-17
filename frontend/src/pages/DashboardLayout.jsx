import React, { useState } from 'react';
import { Scale, Bell, User, LogOut, Menu, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';
export default function DashboardLayout({
  user,
  onLogout,
  children,
  sidebar,
  onNotificationClick,
  notificationCount = 0,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#E5F1FB]">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div className="flex items-center gap-2">
                <Scale className="w-8 h-8 text-[#0A2342]" />
                <span className="text-[#0A2342]">DNJ Legal Firm</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button
                onClick={onNotificationClick}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-700" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center">
                    {notificationCount}
                  </Badge>
                )}
              </button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#0A2342] text-white rounded-full flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block text-gray-700">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm">
                    <div>{user.name}</div>
                    <div className="text-gray-500">{user.email}</div>
                    <div className="text-xs text-[#0A2342] mt-1 capitalize">{user.role}</div>
                  </div>
                  <DropdownMenuItem onClick={onLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 
            transition-transform duration-300 z-40 w-64
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-4 overflow-y-auto h-full">
            {sidebar}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          © 2025 DNJ Legal Firm | All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
