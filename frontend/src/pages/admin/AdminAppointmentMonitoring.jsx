import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Calendar, User, Clock, DollarSign, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { appointmentService } from '../../api/appointmentService';
import { toast } from 'sonner@2.0.3';

export default function AdminAppointmentMonitoring() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lawyerFilter, setLawyerFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'

  React.useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch(e) {
      console.error(e);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-800 border-green-200' },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
      completed: { label: 'Completed', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const uniqueLawyers = [...new Set(appointments.map(a => a.lawyer_name || a.lawyer))].filter(Boolean);

  const filteredAppointments = appointments.filter(appointment => {
    const clientName = appointment.client_name || '';
    const matchesSearch = clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const targetLawyer = appointment.lawyer_name || appointment.lawyer;
    const matchesLawyer = lawyerFilter === 'all' || targetLawyer === lawyerFilter;
    return matchesSearch && matchesStatus && matchesLawyer;
  });

  const stats = {
    total: filteredAppointments.length,
    pending: filteredAppointments.filter(a => a.status === 'pending').length,
    confirmed: filteredAppointments.filter(a => a.status === 'confirmed').length,
    completed: filteredAppointments.filter(a => a.status === 'completed').length,
    cancelled: filteredAppointments.filter(a => a.status === 'cancelled').length,
    totalRevenue: filteredAppointments.reduce((sum, a) => sum + (Number(a.fee) || 0), 0),
  };

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
        <h1 className="text-[#0A2342] mb-2">Appointment Monitoring</h1>
        <p className="text-gray-600">Overview of all appointments across the platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <p className="text-2xl font-semibold text-[#0A2342]">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-sm text-gray-600">Confirmed</p>
            </div>
            <p className="text-2xl font-semibold text-green-600">{stats.confirmed}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-500" />
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <p className="text-2xl font-semibold text-blue-600">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
            <p className="text-2xl font-semibold text-red-600">{stats.cancelled}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-[#0A2342]" />
              <p className="text-sm text-gray-600">Revenue</p>
            </div>
            <p className="text-2xl font-semibold text-[#0A2342]">Rs. {(stats.totalRevenue / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Data */}
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-[#0A2342]">All Appointments</CardTitle>
            
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('list')} 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-[#0A2342]' : 'text-gray-500 hover:text-gray-900'}`}
              >
                List
              </button>
              <button 
                onClick={() => setViewMode('calendar')} 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white shadow text-[#0A2342]' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Calendar
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-4 pt-2 border-t border-gray-100">
             <input 
               type="text" 
               placeholder="Search by client name..." 
               value={searchQuery} 
               onChange={(e) => setSearchQuery(e.target.value)} 
               className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full md:w-64 outline-none focus:border-blue-500" 
             />
             <select 
               value={statusFilter} 
               onChange={(e) => setStatusFilter(e.target.value)} 
               className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full md:w-48 outline-none focus:border-blue-500 bg-white"
             >
               <option value="all">All Statuses</option>
               <option value="pending">Pending</option>
               <option value="confirmed">Confirmed</option>
               <option value="completed">Completed</option>
               <option value="cancelled">Cancelled</option>
             </select>
             <select 
               value={lawyerFilter} 
               onChange={(e) => setLawyerFilter(e.target.value)} 
               className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full md:w-48 outline-none focus:border-blue-500 bg-white"
             >
               <option value="all">All Lawyers</option>
               {uniqueLawyers.map(l => <option key={l} value={l}>{l}</option>)}
             </select>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No appointments found matching your filters</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Lawyer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.service_name || appointment.service}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-500" />
                          <span className="font-medium text-gray-900">{appointment.client_name || 'Unknown Client'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          {appointment.lawyer_name || appointment.lawyer}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : appointment.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {appointment.start_time || appointment.time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          Rs. {Number(appointment.fee || 0).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAppointments.map(appointment => (
                 <div 
                   key={appointment.id} 
                   className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col gap-3 border-l-4 hover:shadow-md transition-shadow"
                   style={{
                     borderLeftColor: appointment.status === 'confirmed' ? '#22c55e' : 
                                      appointment.status === 'pending' ? '#eab308' : 
                                      appointment.status === 'completed' ? '#3b82f6' : '#ef4444'
                   }}
                 >
                   <div className="flex justify-between items-start">
                     <span className="font-semibold text-[#0A2342] truncate mr-2" title={appointment.service_name || appointment.service}>
                       {appointment.service_name || appointment.service}
                     </span>
                     {getStatusBadge(appointment.status)}
                   </div>
                   
                   <div className="flex flex-col gap-1.5 mt-1 border-t border-gray-50 pt-2">
                     <div className="flex items-center gap-2 text-sm text-gray-800">
                       <User className="w-4 h-4 text-purple-500" />
                       <span className="font-medium">{appointment.client_name || 'Unknown Client'}</span>
                     </div>
                     <div className="flex items-center gap-2 text-sm text-gray-600">
                       <User className="w-4 h-4 text-gray-400" />
                       {appointment.lawyer_name || appointment.lawyer}
                     </div>
                   </div>

                   <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md mt-auto">
                     <div className="flex items-center gap-1.5">
                       <Calendar className="w-3.5 h-3.5 text-gray-500" />
                       {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : appointment.date}
                     </div>
                     <div className="flex items-center gap-1.5 font-medium">
                       <Clock className="w-3.5 h-3.5 text-blue-600" />
                       <span className="text-blue-700">{appointment.start_time || appointment.time}</span>
                     </div>
                   </div>
                 </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
