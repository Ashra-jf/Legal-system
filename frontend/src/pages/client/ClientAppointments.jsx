import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Calendar, Clock, User, DollarSign, Edit, X, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { appointmentService } from '../../api/appointmentService';
import { serviceService } from '../../api/serviceService';
import { profileService } from '../../api/profileService';

export default function ClientAppointments({ userId }) {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [servicesOptions, setServicesOptions] = useState([]);
  const [lawyersOptions, setLawyersOptions] = useState([]);
  
  const [newAppointment, setNewAppointment] = useState({
    service: '',
    service_id: '',
    lawyer_name: '',
    lawyer_id: '',
    date: '',
    time: '',
    fee: 0
  });

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM',
  ];

  useEffect(() => {
    loadAppointments();
  }, [userId]);

  const loadAppointments = async () => {
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
      
      const [srvs, lwrs] = await Promise.all([
        serviceService.getServices(),
        profileService.getLawyers()
      ]);
      setServicesOptions(srvs);
      setLawyersOptions(lwrs);
    } catch (error) {
      console.error('Failed to load appointments or options:', error);
      toast.error('Failed to load data');
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


  const handleCancelAppointment = async () => {
    try {
      await appointmentService.updateStatus(selectedAppointment.id, 'cancelled');
      toast.success('Appointment cancelled successfully');
      setShowCancelDialog(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const handleBookAppointment = async () => {
    if (!newAppointment.service || !newAppointment.lawyer_name || !newAppointment.date || !newAppointment.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Mocking the client name as "Current Client" since we don't fetch user profile here
      const payload = {
        ...newAppointment,
        client_id: userId,
        client_name: 'Current Client'
      };
      await appointmentService.create(payload);
      toast.success('Appointment booked successfully!');
      setShowBookDialog(false);

      // reset form
      setNewAppointment({
        service: '',
        service_id: '',
        lawyer_name: '',
        lawyer_id: '',
        date: '',
        time: '',
        fee: 0
      });
      loadAppointments();
    } catch (error) {
      console.error('Failed to book appointment:', error);
      toast.error('Failed to book appointment');
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-[#0A2342] mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage your scheduled appointments</p>
        </div>
        <Button onClick={() => setShowBookDialog(true)} className="bg-[#0A2342] text-white hover:bg-[#0A2342]/90 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#0A2342]">Upcoming & Past Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No appointments found</p>
              <p className="text-gray-500">Book a service to schedule your first appointment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Lawyer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.service_name || appointment.service}</TableCell>
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
                          Rs. {Number(appointment.fee).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-2 py-4">
              <p><strong>Service:</strong> {selectedAppointment.service}</p>
              <p><strong>Lawyer:</strong> {selectedAppointment.lawyer_name || selectedAppointment.lawyer}</p>
              <p><strong>Date:</strong> {selectedAppointment.date}</p>
              <p><strong>Time:</strong> {selectedAppointment.time}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Appointment
            </Button>
            <Button
              onClick={handleCancelAppointment}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Book Appointment Dialog */}
      <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book a New Appointment</DialogTitle>
            <DialogDescription>
              Schedule a consultation with one of our legal experts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">

            <div className="space-y-2">
              <Label>Legal Service</Label>
              <Select
                value={newAppointment.service}
                onValueChange={(val) => {
                  const srv = servicesOptions.find(s => s.name === val);
                  setNewAppointment({ ...newAppointment, service: val, service_id: srv ? srv.id : null, fee: srv ? Number(srv.base_fee) : 0 });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {servicesOptions.map(srv => (
                    <SelectItem key={srv.id} value={srv.name}>{srv.name} - Rs. {Number(srv.base_fee).toLocaleString()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Lawyer</Label>
              <Select
                value={newAppointment.lawyer_id ? newAppointment.lawyer_id.toString() : ''}
                onValueChange={(val) => {
                  const lwr = lawyersOptions.find(l => l.id.toString() === val);
                  setNewAppointment({ ...newAppointment, lawyer_name: lwr ? lwr.name : '', lawyer_id: val });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Available Lawyers" />
                </SelectTrigger>
                <SelectContent>
                  {lawyersOptions.map(lwr => (
                     <SelectItem key={lwr.id} value={lwr.id.toString()}>{lwr.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Select
                  value={newAppointment.time}
                  onValueChange={(val) => setNewAppointment({ ...newAppointment, time: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBookAppointment}
              className="bg-[#0A2342] text-white hover:bg-[#0A2342]/90"
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
