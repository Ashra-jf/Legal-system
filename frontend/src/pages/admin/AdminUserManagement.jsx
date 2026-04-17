import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';
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
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                          className="border-[#0A2342] text-[#0A2342]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
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
    </div>
  );
}
