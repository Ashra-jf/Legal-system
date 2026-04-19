import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Users, Plus, Edit, Trash2, User, BriefcaseBusiness } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import axiosInstance from '../../api/axiosConfig';

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });
  const [viewingUser, setViewingUser] = useState(null);
  const [profileDetails, setProfileDetails] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'lawyer' });
    setShowDialog(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowDialog(true);
  };

  const handleViewDetails = async (user) => {
    setViewingUser(user);
    setProfileDetails(null);
    setShowViewDialog(true);
    setViewLoading(true);
    try {
      if (user.role === 'admin') {
        setProfileDetails(null);
        setViewLoading(false);
        return;
      }
      
      const endpoint = user.role === 'client' 
        ? `/profile/client/${user.id}` 
        : `/profile/lawyer/${user.id}`;
      const response = await axiosInstance.get(endpoint);
      setProfileDetails(response.data);
    } catch (err) {
      toast.error('Failed to load user details');
    } finally {
      setViewLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(`/admin/users/${userId}`);
        toast.success('User deleted successfully');
        loadUsers();
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        await axiosInstance.patch(`/admin/users/${editingUser.id}`, formData);
        toast.success('User updated successfully');
      } else {
        // Add new user via Admin API
        await axiosInstance.post('/admin/users', formData);
        toast.success('User added successfully');
      }

      setShowDialog(false);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save user');
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { className: 'bg-purple-100 text-purple-800 border-purple-200' },
      lawyer: { className: 'bg-blue-100 text-blue-800 border-blue-200' },
      client: { className: 'bg-green-100 text-green-800 border-green-200' },
    };

    const config = roleConfig[role] || roleConfig.client;
    return <Badge className={`${config.className} capitalize`}>{role}</Badge>;
  };

  const userStats = {
    total: users.length,
    clients: users.filter(u => u.role === 'client').length,
    lawyers: users.filter(u => u.role === 'lawyer').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[#0A2342] mb-2">User Management</h1>
          <p className="text-gray-600">Manage clients, lawyers, and administrators</p>
        </div>
        <Button
          onClick={handleAddUser}
          className="bg-[#0A2342] text-white hover:bg-[#0A2342]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Users</p>
                <p className="text-[#0A2342]">{userStats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Clients</p>
                <p className="text-[#0A2342]">{userStats.clients}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Lawyers</p>
                <p className="text-[#0A2342]">{userStats.lawyers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Admins</p>
                <p className="text-[#0A2342]">{userStats.admins}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#0A2342]">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <div className="flex gap-3 items-center">
                        {user.role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(user)}
                            className="w-16 border-gray-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            View
                          </Button>
                        )}
                        {user.role === 'admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                            className="w-16 border-[#0A2342] text-[#0A2342]"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <div className="w-px h-6 bg-gray-300"></div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id)}
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information' : 'Create a new user account'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>

            <div>
              <Label>Password {editingUser && '(leave blank to keep current)'}</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>

            <div>
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="lawyer">Lawyer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveUser}
              className="bg-[#0A2342] text-white hover:bg-[#0A2342]/90"
            >
              {editingUser ? 'Update User' : 'Add User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#0A2342]">User Profile Details</DialogTitle>
            <DialogDescription>
              Detailed information for {viewingUser?.name} ({viewingUser?.role})
            </DialogDescription>
          </DialogHeader>
          
          {viewLoading ? (
            <div className="flex justify-center p-8 text-gray-500">Loading details...</div>
          ) : viewingUser?.role === 'admin' ? (
            <div className="flex justify-center p-8 text-gray-500">Admins do not have detailed profiles.</div>
          ) : profileDetails ? (
            <div className="space-y-8 py-4">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <div className="p-1.5 bg-green-50 rounded-md">
                    <User className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-[#0A2342]">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <Label className="text-gray-500 block mb-1">Full Name</Label>
                    <p className="font-medium text-gray-900">{profileDetails.name || viewingUser?.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 block mb-1">Email Address</Label>
                    <p className="font-medium text-gray-900">{profileDetails.email || viewingUser?.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 block mb-1">Contact Number</Label>
                    <p className="font-medium text-gray-900">{profileDetails.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 block mb-1">Alternate Contact</Label>
                    <p className="font-medium text-gray-900">{profileDetails.alternate_phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 block mb-1">Date of Birth</Label>
                    <p className="font-medium text-gray-900">{profileDetails.date_of_birth ? new Date(profileDetails.date_of_birth).toLocaleDateString() : 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 block mb-1">National ID / Passport</Label>
                    <p className="font-medium text-gray-900">{profileDetails.id_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 block mb-1">Gender</Label>
                    <p className="font-medium text-gray-900 capitalize">{profileDetails.gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 block mb-1">Marital Status</Label>
                    <p className="font-medium text-gray-900 capitalize">{profileDetails.marital_status || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500 block mb-1">Full Address</Label>
                    <p className="font-medium text-gray-900">
                      {[profileDetails.address, profileDetails.city, profileDetails.state, profileDetails.postal_code].filter(Boolean).join(', ') || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Professional Information Section (Lawyer Only) */}
              {viewingUser?.role === 'lawyer' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="p-1.5 bg-blue-50 rounded-md">
                      <BriefcaseBusiness className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-[#0A2342]">Professional Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <Label className="text-gray-500 block mb-1">License Number</Label>
                      <p className="font-medium text-gray-900">{profileDetails.license_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 block mb-1">Role within Firm</Label>
                      <p className="font-medium text-gray-900">{profileDetails.firm_role || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 block mb-1">Jurisdiction</Label>
                      <p className="font-medium text-gray-900">{profileDetails.jurisdiction || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 block mb-1">Years of Experience</Label>
                      <p className="font-medium text-gray-900">{profileDetails.experience_years || 0} Years</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center p-8 text-red-500">Failed to load details.</div>
          )}
          
          <DialogFooter>
            <Button className="bg-[#0A2342] text-white hover:bg-[#143255]" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
