import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Plus, Edit, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { serviceService } from '../../api/serviceService';

export default function AdminServiceManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fee: '',
    duration: '',
  });

  React.useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getServices();
      setServices(data.map(s => ({
        id: s.id.toString(),
        name: s.name,
        description: s.description || '',
        fee: Number(s.base_fee),
        duration: s.duration_estimate || 'N/A'
      })));
    } catch(e) {
      console.error(e);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setFormData({ name: '', description: '', fee: '', duration: '' });
    setShowDialog(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      fee: service.fee.toString(),
      duration: service.duration,
    });
    setShowDialog(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await serviceService.deleteService(serviceId);
        toast.success('Service deleted successfully');
        loadServices();
      } catch(e) {
        toast.error('Failed to delete service');
      }
    }
  };

  const handleSaveService = async () => {
    if (!formData.name || !formData.description || !formData.fee || !formData.duration) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        base_fee: parseFloat(formData.fee),
        duration_estimate: formData.duration,
      };

      if (editingService) {
        await serviceService.updateService(editingService.id, payload);
        toast.success('Service updated successfully');
      } else {
        await serviceService.createService(payload);
        toast.success('Service added successfully');
      }

      setShowDialog(false);
      loadServices();
    } catch(e) {
       console.error(e);
       toast.error('Failed to save service');
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[#0A2342] mb-2">Service Management</h1>
          <p className="text-gray-600">Manage available legal services</p>
        </div>
        <Button
          onClick={handleAddService}
          className="bg-[#0A2342] text-white hover:bg-[#0A2342]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Service Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Services</p>
                <p className="text-[#0A2342]">{services.length}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Avg. Service Fee</p>
                <p className="text-[#0A2342]">
                  Rs. {Math.round(services.reduce((sum, s) => sum + s.fee, 0) / services.length).toLocaleString()}
                </p>
              </div>
              <ShoppingBag className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Revenue Potential</p>
                <p className="text-[#0A2342]">
                  Rs. {(services.reduce((sum, s) => sum + s.fee, 0) * 10).toLocaleString()}
                </p>
              </div>
              <ShoppingBag className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="border-gray-200">
            <CardHeader>
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
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleEditService(service)}
                className="flex-1 border-[#0A2342] text-[#0A2342] hover:bg-[#0A2342] hover:text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeleteService(service.id)}
                className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Add/Edit Service Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {editingService ? 'Update service details' : 'Create a new service offering'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Service Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Corporate Law Services"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter service description"
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label>Fee (Rs.)</Label>
              <Input
                type="number"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                placeholder="e.g., 35000"
              />
            </div>

            <div>
              <Label>Duration</Label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 4-6 weeks"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveService}
              className="bg-[#0A2342] text-white hover:bg-[#0A2342]/90"
            >
              {editingService ? 'Update Service' : 'Add Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
