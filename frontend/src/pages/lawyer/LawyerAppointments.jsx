import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Calendar, User, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { appointmentService } from '../../api/appointmentService';

export default function LawyerAppointments({ lawyerId, lawyerName }) {
  const [appointments, setAppointments] = useState([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedApptId, setSelectedApptId] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, [lawyerId, lawyerName]);

  const loadAppointments = async () => {
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      toast.error('Failed to load appointments');
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    if (newStatus === 'cancelled') {
        setSelectedApptId(appointmentId);
        setCancelReason('');
        setShowCancelDialog(true);
        return;
    }

    try {
      await appointmentService.updateStatus(appointmentId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      loadAppointments();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      await appointmentService.updateStatus(selectedApptId, 'cancelled', cancelReason);
      toast.success('Appointment cancelled successfully');
      setShowCancelDialog(false);
      loadAppointments();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast.error('Failed to cancel appointment');
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


  const stats = [
    {
      label: 'Total Appointments',
      value: appointments.length,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Pending',
      value: appointments.filter((a) => a.status === 'pending').length,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Confirmed',
      value: appointments.filter((a) => a.status === 'confirmed').length,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Completed',
      value: appointments.filter((a) => a.status === 'completed').length,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#0A2342] mb-2">My Appointments</h1>
        <p className="text-gray-600">Manage your scheduled client appointments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-[#0A2342]">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <Calendar className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Appointments Table */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#0A2342]">Appointment Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No appointments assigned yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          {appointment.client_name || 'Client'}
                        </div>
                      </TableCell>
                      <TableCell>{appointment.service_name || appointment.service || 'No service assigned'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : 'Not set'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {appointment.start_time && appointment.end_time
                            ? `${appointment.start_time} - ${appointment.end_time}`
                            : appointment.start_time || 'Not set'}
                        </div>
                      </TableCell>
                      <TableCell>
                        Rs. {Number(appointment.fee).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={appointment.status}
                          onValueChange={(value) => handleStatusChange(appointment.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Appointment Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
                Please provide a reason for cancelling this appointment. This reason will be sent to the client.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Cancellation</Label>
              <textarea
                className="w-full min-h-[100px] p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your reason here..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Back
            </Button>
            <Button onClick={handleConfirmCancel} className="bg-red-600 hover:bg-red-700 text-white">
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
