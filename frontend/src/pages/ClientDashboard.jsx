import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { LayoutDashboard, ShoppingBag, Calendar, FileText, CreditCard, MessageSquare, Bell } from 'lucide-react';
import ClientOverview from './client/ClientOverview';
import ClientServiceCatalog from './client/ClientServiceCatalog';
import ClientAppointments from './client/ClientAppointments';
import ClientCaseStatus from './client/ClientCaseStatus';
import ClientPayments from './client/ClientPayments';
import ClientFeedback from './client/ClientFeedback';
import ClientNotifications from './client/ClientNotifications';
import { useNotifications } from '../hooks/useNotifications';

export default function ClientDashboard({ user, onLogout, onNavigate }) {
  const [currentView, setCurrentView] = useState('overview');
  const { unreadCount, refresh } = useNotifications(user.id);

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'services', label: 'Service Catalog', icon: ShoppingBag },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'cases', label: 'Case Status', icon: FileText },
    { id: 'payments', label: 'Payments & Invoices', icon: CreditCard },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return <ClientOverview onNavigate={setCurrentView} userId={user.id} />;
      case 'services':
        return <ClientServiceCatalog userId={user.id} />;
      case 'appointments':
        return <ClientAppointments userId={user.id} />;
      case 'cases':
        return <ClientCaseStatus userId={user.id} />;
      case 'payments':
        return <ClientPayments userId={user.id} />;
      case 'feedback':
        return <ClientFeedback userId={user.id} />;
      case 'notifications':
        return <ClientNotifications userId={user.id} onRefresh={refresh} />;
      default:
        return <ClientOverview onNavigate={setCurrentView} userId={user.id} />;
    }
  };

  const sidebar = (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
              ${isActive
                ? 'bg-[#0A2342] text-white'
                : 'text-gray-700 hover:bg-[#E5F1FB]'
              }
            `}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      onNavigate={onNavigate}
      sidebar={sidebar}
      onNotificationClick={() => setCurrentView('notifications')}
      notificationCount={unreadCount}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
