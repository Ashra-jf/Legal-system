import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { Users, ShoppingBag, Calendar, CreditCard, MessageSquare, Bell, BarChart } from 'lucide-react';
import AdminUserManagement from './admin/AdminUserManagement';
import AdminServiceManagement from './admin/AdminServiceManagement';
import AdminAppointmentMonitoring from './admin/AdminAppointmentMonitoring';
import AdminPaymentMonitoring from './admin/AdminPaymentMonitoring';
import AdminFeedbackReview from './admin/AdminFeedbackReview';
import AdminNotifications from './admin/AdminNotifications';
import AdminAnalytics from './admin/AdminAnalytics';

export default function AdminDashboard({ user, onLogout, onNavigate }) {
  const [currentView, setCurrentView] = useState('analytics');

  const menuItems = [
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'services', label: 'Service Management', icon: ShoppingBag },
    { id: 'appointments', label: 'Appointment Monitoring', icon: Calendar },
    { id: 'payments', label: 'Payment Monitoring', icon: CreditCard },
    { id: 'feedback', label: 'Feedback Review', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'users':
        return <AdminUserManagement />;
      case 'services':
        return <AdminServiceManagement />;
      case 'appointments':
        return <AdminAppointmentMonitoring />;
      case 'payments':
        return <AdminPaymentMonitoring />;
      case 'feedback':
        return <AdminFeedbackReview />;
      case 'notifications':
        return <AdminNotifications />;
      case 'analytics':
        return <AdminAnalytics />;
      default:
        return <AdminAnalytics />;
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
              w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-colors text-left
              ${isActive
                ? 'bg-[#0A2342] text-white'
                : 'text-gray-700 hover:bg-[#E5F1FB]'
              }
            `}
          >
            <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="leading-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      sidebar={sidebar}
      onNotificationClick={() => setCurrentView('notifications')}
      notificationCount={5}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
