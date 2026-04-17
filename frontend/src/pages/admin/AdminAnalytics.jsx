import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, CreditCard, Star, TrendingUp, Loader2 } from 'lucide-react';
import { dashboardService } from '../../api/dashboardService';
import { appointmentService } from '../../api/appointmentService';
import { paymentService } from '../../api/paymentService';
import { feedbackService } from '../../api/feedbackService';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState({
     totalUsers: 0,
     totalLawyers: 0,
     totalClients: 0,
     totalAppointments: 0,
     activeCases: 0,
     totalRevenue: 0
  });
  
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [appointmentsByService, setAppointmentsByService] = useState([]);
  const [clientSatisfaction, setClientSatisfaction] = useState([
    { rating: '5 Stars', count: 0 },
    { rating: '4 Stars', count: 0 },
    { rating: '3 Stars', count: 0 },
    { rating: '2 Stars', count: 0 },
    { rating: '1 Star', count: 0 },
  ]);

  const [apptStatusCounts, setApptStatusCounts] = useState({ pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [paymentStatusCounts, setPaymentStatusCounts] = useState({ verified: 0, pending: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, appointmentsData, paymentsData, feedbackData] = await Promise.all([
        dashboardService.getAdminStats(),
        appointmentService.getAll(),
        paymentService.getPayments(),
        feedbackService.getFeedback().catch(() => []) 
      ]);
      
      const realTotalRevenue = paymentsData
        .filter(p => p.status === 'verified' || p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      setAdminStats({
        totalClients: statsData.total_clients || 0,
        totalLawyers: statsData.total_lawyers || 0,
        totalUsers: (statsData.total_clients || 0) + (statsData.total_lawyers || 0) + 1,
        activeCases: statsData.total_cases || 0,
        totalAppointments: appointmentsData.length,
        totalRevenue: realTotalRevenue || statsData.total_revenue || 0
      });

      // Compute Appointments by Service
      const serviceCounts = {};
      appointmentsData.forEach(app => {
        serviceCounts[app.service] = (serviceCounts[app.service] || 0) + 1;
      });
      const pieData = Object.keys(serviceCounts).map(key => ({ name: key || 'Unknown', value: serviceCounts[key] }));
      setAppointmentsByService(pieData);

      // Compute Monthly Revenue from verified payments
      const monthly = {};
      paymentsData.filter(p => p.status === 'verified').forEach(p => {
        if (!p.payment_date) return;
        const month = new Date(p.payment_date).toLocaleString('default', { month: 'short' });
        monthly[month] = (monthly[month] || 0) + Number(p.amount);
      });
      const lineData = Object.keys(monthly).map(key => ({ month: key, revenue: monthly[key] }));
      setMonthlyRevenue(lineData.length ? lineData : [{ month: 'Current', revenue: realTotalRevenue || statsData.total_revenue || 0 }]);

      // Compute Feedback Satisfaction
      const feedbackCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      if (feedbackData && feedbackData.length > 0) {
        feedbackData.forEach(fb => {
          if (fb.rating) feedbackCounts[fb.rating] = (feedbackCounts[fb.rating] || 0) + 1;
        });
        setClientSatisfaction([
          { rating: '5 Stars', count: feedbackCounts[5] },
          { rating: '4 Stars', count: feedbackCounts[4] },
          { rating: '3 Stars', count: feedbackCounts[3] },
          { rating: '2 Stars', count: feedbackCounts[2] },
          { rating: '1 Star', count: feedbackCounts[1] },
        ]);
      }

      // Compute Appointment Statuses
      const apptCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
      appointmentsData.forEach(app => {
        const status = app.status ? app.status.toLowerCase() : 'pending';
        apptCounts[status] = (apptCounts[status] || 0) + 1;
      });
      setApptStatusCounts(apptCounts);

      // Compute Payment Statuses
      const payCounts = { verified: 0, pending: 0 };
      paymentsData.forEach(p => {
        if (p.status && p.status.toLowerCase() === 'verified') payCounts.verified += 1;
        else payCounts.pending += 1;
      });
      setPaymentStatusCounts(payCounts);

    } catch(e) {
      console.error('Error loading admin analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Users', value: adminStats.totalUsers, change: '+0%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Appointments', value: adminStats.totalAppointments, change: '+0%', icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Revenue', value: `Rs. ${(adminStats.totalRevenue || 0).toLocaleString()}`, change: '+0%', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Cases', value: adminStats.activeCases, change: '+0', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  const COLORS = ['#0A2342', '#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD'];

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
        <h1 className="text-[#0A2342] mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Comprehensive overview of platform performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">{stat.change}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                <p className="text-3xl font-semibold text-[#0A2342]">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-[#0A2342]">Monthly Revenue (Rs.)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#0A2342" strokeWidth={2} name="Total Received" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointments by Service */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-[#0A2342]">Appointments by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentsByService}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentsByService.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#0A2342]">Real Client Satisfaction</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clientSatisfaction}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0A2342" name="Number of Reviews" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-[#0A2342]">User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Clients</span>
                <span className="text-[#0A2342] font-semibold">{adminStats.totalClients}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lawyers</span>
                <span className="text-[#0A2342] font-semibold">{adminStats.totalLawyers}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-2 mt-2">
                <span className="text-gray-900 font-medium">Total Active</span>
                <span className="text-[#0A2342] font-bold">{adminStats.totalUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-[#0A2342]">Payment Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-green-600">Verified</span>
                <span className="text-green-700 font-semibold">{paymentStatusCounts.verified}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-600">Pending Verification</span>
                <span className="text-yellow-700 font-semibold">{paymentStatusCounts.pending}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-2 mt-2">
                <span className="text-gray-900 font-medium">Total Revenue</span>
                <span className="text-purple-600 font-bold">Rs. {(adminStats.totalRevenue || 0).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-[#0A2342]">Appointment Statuses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-yellow-600">Pending</span>
                <span className="text-yellow-700 font-semibold">{apptStatusCounts.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-600">Confirmed</span>
                <span className="text-green-700 font-semibold">{apptStatusCounts.confirmed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-600">Completed</span>
                <span className="text-blue-700 font-semibold">{apptStatusCounts.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600">Cancelled</span>
                <span className="text-red-700 font-semibold">{apptStatusCounts.cancelled}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-2 mt-2">
                <span className="text-gray-900 font-medium">Total Appointments</span>
                <span className="text-[#0A2342] font-bold">{adminStats.totalAppointments}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
