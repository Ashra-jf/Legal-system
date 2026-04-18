import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { authService } from '../api/authService';
import { profileService } from '../api/profileService';
import DashboardLayout from './DashboardLayout';
import { Lock, User, Mail, Calendar, MapPin, CreditCard, ChevronRight, Save } from 'lucide-react';

export default function ProfilePage({ user, onLogout, onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: '',
    alternate_phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    date_of_birth: '',
    id_number: '',
    gender: '',
    marital_status: '',
    occupation: '',
    company_name: ''
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      let data;
      if (user.role === 'client') {
        data = await profileService.getClientProfile();
      } else if (user.role === 'lawyer') {
        data = await profileService.getLawyerProfile();
      }
      
      if (data) {
        setProfileData({
          ...profileData,
          ...data,
          name: data.name || user.name,
          email: data.email || user.email,
          date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (user.role === 'client') {
        await profileService.updateClientProfile(user.id, profileData);
      } else if (user.role === 'lawyer') {
        await profileService.updateLawyerProfile(user.id, profileData);
      }
      toast.success('Profile updated successfully');
      
      // Update local storage user name if it changed
      const currentUser = authService.getCurrentUser();
      if (currentUser.name !== profileData.name) {
        localStorage.setItem('user', JSON.stringify({ ...currentUser, name: profileData.name }));
        // Brief timeout before redirect to ensure name update is noticed
        setTimeout(() => {
          const dashRoute = user.role === 'admin' ? 'admin-dashboard' : (user.role === 'lawyer' ? 'lawyer-dashboard' : 'client-dashboard');
          onNavigate(dashRoute);
        }, 1000);
      } else {
        const dashRoute = user.role === 'admin' ? 'admin-dashboard' : (user.role === 'lawyer' ? 'lawyer-dashboard' : 'client-dashboard');
        onNavigate(dashRoute);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      toast.error(error.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout user={user} onLogout={onLogout} onNavigate={onNavigate}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0A2342]">My Profile</h1>
          <p className="text-gray-500 mt-2">Manage your account settings and personal information</p>
        </div>

        {/* Change Password Container */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Change Password</CardTitle>
                <CardDescription>Update your login credentials</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 bg-white/50">
            <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                <Label className="text-right hidden md:block">Current Password:</Label>
                <div className="md:col-span-2 relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input 
                    type="password" 
                    placeholder="Current password" 
                    className="pl-10"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                <Label className="text-right hidden md:block">New Password:</Label>
                <div className="md:col-span-2 relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input 
                    type="password" 
                    placeholder="New password" 
                    className="pl-10"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                <Label className="text-right hidden md:block">Confirm New Password:</Label>
                <div className="md:col-span-2 relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input 
                    type="password" 
                    placeholder="Confirm new password" 
                    className="pl-10"
                    value={passwords.confirmNewPassword}
                    onChange={(e) => setPasswords({...passwords, confirmNewPassword: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="bg-[#5B9BD5] hover:bg-[#4A8AC4] text-white px-8">
                  Update
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Personal Information Container */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 bg-white/50">
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input 
                      className="pl-10"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input 
                      disabled 
                      className="pl-10 bg-gray-50"
                      value={profileData.email}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input 
                      type="date"
                      className="pl-10"
                      value={profileData.date_of_birth}
                      onChange={(e) => setProfileData({...profileData, date_of_birth: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>National ID / Passport</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="Enter ID or Passport number"
                      className="pl-10"
                      value={profileData.id_number || ''}
                      onChange={(e) => setProfileData({...profileData, id_number: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select 
                    value={profileData.gender || ''} 
                    onValueChange={(val) => setProfileData({...profileData, gender: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <Select 
                    value={profileData.marital_status || ''} 
                    onValueChange={(val) => setProfileData({...profileData, marital_status: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input 
                    placeholder="e.g. +1 234 567 890"
                    value={profileData.phone || ''}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Alternate Contact Number</Label>
                  <Input 
                    placeholder="e.g. +1 098 765 432"
                    value={profileData.alternate_phone || ''}
                    onChange={(e) => setProfileData({...profileData, alternate_phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Full street address"
                    className="pl-10"
                    value={profileData.address || ''}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input 
                    value={profileData.city || ''}
                    onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input 
                    value={profileData.state || ''}
                    onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input 
                    value={profileData.postal_code || ''}
                    onChange={(e) => setProfileData({...profileData, postal_code: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-100">
                <Button type="submit" disabled={loading} className="bg-[#0A2342] hover:bg-[#143255] text-white px-8">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
