import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { Calendar, FileText, MessageSquare, Bell } from 'lucide-react';
import LawyerAppointments from './lawyer/LawyerAppointments';
import LawyerCaseUpdates from './lawyer/LawyerCaseUpdates';
import LawyerClientFeedback from './lawyer/LawyerClientFeedback';
import LawyerNotifications from './lawyer/LawyerNotifications';
import { useNotifications } from '../hooks/useNotifications';

export default function LawyerDashboard({ user, onLogout, onNavigate }) {
  const [currentView, setCurrentView] = useState('appointments');
  const { unreadCount, refresh } = useNotifications(user.id);

  const menuItems = [
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'cases', label: 'Case Updates', icon: FileText },
    { id: 'feedback', label: 'Client Feedback', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'appointments':
        return <LawyerAppointments lawyerId={user.id} lawyerName={user.name} />;
      case 'cases':
        return <LawyerCaseUpdates lawyerId={user.id} />;
      case 'feedback':
        return <LawyerClientFeedback lawyerId={user.id} />;
      case 'notifications':
        return <LawyerNotifications lawyerId={user.id} onRefresh={refresh} />;
      default:
        return <LawyerAppointments lawyerId={user.id} lawyerName={user.name} />;
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
