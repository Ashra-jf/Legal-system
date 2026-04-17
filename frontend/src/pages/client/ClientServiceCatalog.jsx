import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Globe, Scale, FileText, CheckCircle, Shield, Users, Star, Home } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';
import { appointmentService } from '../../api/appointmentService';
import { serviceService } from '../../api/serviceService';
import { profileService } from '../../api/profileService';
import { Loader2 } from 'lucide-react';

export default function ClientServiceCatalog({ userId }) {
  const [selectedService, setSelectedService] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState('');
  const [selectedDate, setSelectedDate] = useState();
  const [selectedTime, setSelectedTime] = useState('');
  
  const [services, setServices] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [servicesData, lawyersData] = await Promise.all([
          serviceService.getServices(),
          profileService.getLawyers()
        ]);
        
        // Map icons dynamically or fallback
        const iconMap = {
          'Property Law': Home,
          'Legal Consultation': Scale,
          'Contract Drafting': FileText,
          'Document Verification': Shield,
          'Corporate Law Services': Users,
          'Family Law Consultation': Star,
        };

        const mappedServices = servicesData.map(s => ({
          ...s,
          id: s.id.toString(),
          name: s.name,
          fee: Number(s.base_fee),
          description: s.description || 'No description provided.',
          duration: 'Contact for duration',
          icon: iconMap[s.name] || FileText
        }));

        setServices(mappedServices);
        setLawyers(lawyersData.map(l => ({ id: l.id.toString(), name: l.name })));
      } catch (e) {
        console.error('Failed to load catalog data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM',
  ];


  const handleBookAppointment = (service) => {
    setSelectedService(service);
    setShowBooking(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedLawyer || !selectedDate || !selectedTime) {
      toast.error('Please fill in all booking details');
      return;
    }

    try {
      const selectedLawyerObj = lawyers.find(l => l.id === selectedLawyer);

      await appointmentService.create({
        client_id: userId,
        lawyer_id: parseInt(selectedLawyer),
        client_name: JSON.parse(localStorage.getItem('user'))?.name || 'Client',
        lawyer_name: selectedLawyerObj?.name,
        service: selectedService.name,
        service_id: parseInt(selectedService.id),
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        fee: selectedService.fee,
      });

      toast.success('Appointment booked successfully!');
      setShowBooking(false);
      setSelectedService(null);
      setSelectedLawyer('');
      setSelectedDate(undefined);
      setSelectedTime('');
    } catch (err) {
      toast.error(err.error || 'Failed to book appointment');
    }
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
        <h1 className="text-[#0A2342] mb-2">Service Catalog</h1>
        <p className="text-gray-600">Browse our comprehensive legal services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Card key={service.id} className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-[#E5F1FB] rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#0A2342]" />
                </div>
                <CardTitle className="text-[#0A2342]">{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee:</span>
                    <span className="text-[#0A2342]">Rs. {service.fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="text-gray-900">{service.duration}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleBookAppointment(service)}
                  className="w-full bg-[#0A2342] text-white hover:bg-[#0A2342]/90"
                >
                  Book Appointment
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              {selectedService?.name} - Rs. {selectedService?.fee.toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Select Lawyer</Label>
              <Select value={selectedLawyer} onValueChange={setSelectedLawyer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a lawyer" />
                </SelectTrigger>
                <SelectContent>
                  {lawyers.map((lawyer) => (
                    <SelectItem key={lawyer.id} value={lawyer.id}>
                      {lawyer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Select Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBooking(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBooking}
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
