import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Calendar, FileText, CreditCard, Clock, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { caseService } from '../../api/caseService';
import { appointmentService } from '../../api/appointmentService';
import { paymentService } from '../../api/paymentService';
import { notificationService } from '../../api/notificationService';

export default function ClientOverview({ onNavigate, userId }) {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    activeCases: 0,
    upcomingAppointments: 0,
    pendingPaymentsAmount: 0,
    completedServices: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cases, appointments, payments, notifications] = await Promise.all([
        caseService.getCases().catch(() => []),
        appointmentService.getAll().catch(() => []),
        paymentService.getPayments().catch(() => []),
        notificationService.getNotifications({ user_id: userId }).catch(() => [])
      ]);

      const activeCasesCount = cases.filter(c => c.status !== 'closed' && c.status !== 'completed').length;
      
      const upcomingAppts = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length;
      const completedAppts = appointments.filter(a => a.status === 'completed').length;

      const pendingPayAmount = payments
        .filter(p => !['verified', 'rejected'].includes(p.status?.toLowerCase()))
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      setDashboardData({
        activeCases: activeCasesCount,
        upcomingAppointments: upcomingAppts,
        pendingPaymentsAmount: pendingPayAmount,
        completedServices: completedAppts
      });

      // Format recent activities from notifications
      const formattedActivities = notifications.slice(0, 4).map(n => ({
        title: n.title || 'Notification',
        description: n.message || 'System update',
        time: n.created_at ? new Date(n.created_at).toLocaleString() : 'Recently'
      }));

      if (formattedActivities.length === 0) {
        setRecentActivities([
          { title: 'Welcome', description: 'Your dashboard is ready to use.', time: 'Just now' }
        ]);
      } else {
        setRecentActivities(formattedActivities);
      }
    } catch (e) {
      console.error('Error loading client dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Active Cases', value: dashboardData.activeCases.toString(), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Upcoming Appointments', value: dashboardData.upcomingAppointments.toString(), icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Payments', value: `Rs. ${dashboardData.pendingPaymentsAmount.toLocaleString()}`, icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Completed Services', value: dashboardData.completedServices.toString(), icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A2342]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#0A2342] mb-2">Welcome to Your Dashboard</h1>
        <p className="text-gray-600">Here's an overview of your legal services and activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-[#0A2342] font-semibold text-2xl">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#0A2342]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => onNavigate('services')}
              className="bg-[#0A2342] text-white hover:bg-[#0A2342]/90"
            >
              Browse Services
            </Button>
            <Button
              onClick={() => onNavigate('appointments')}
              variant="outline"
              className="border-[#0A2342] text-[#0A2342] hover:bg-[#0A2342] hover:text-white"
            >
              Book Appointment
            </Button>
            <Button
              onClick={() => onNavigate('payments')}
              variant="outline"
              className="border-[#0A2342] text-[#0A2342] hover:bg-[#0A2342] hover:text-white"
            >
              Upload Payment Receipt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#0A2342]">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-2 h-2 bg-[#0A2342] rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{activity.title}</p>
                  <p className="text-gray-600 text-sm mt-0.5">{activity.description}</p>
                  <p className="text-gray-400 text-xs mt-1.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
