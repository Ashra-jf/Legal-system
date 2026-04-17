import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Bell, Send, Calendar } from 'lucide-react';
import { notificationService } from '../../api/notificationService';
import { toast } from 'sonner@2.0.3';

export default function AdminNotifications() {
  const [showDialog, setShowDialog] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    recipient: '',
    subject: '',
    message: '',
    scheduleDate: '',
  });

  const [sentNotifications, setSentNotifications] = useState([]);

  const handleSendNotification = async () => {
    if (!notificationForm.recipient || !notificationForm.subject || !notificationForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (notificationForm.scheduleDate) {
      toast.error('Scheduling is not supported in the active backend yet. Sent immediately.');
    }

    try {
      const result = await notificationService.broadcastNotification({
        target: notificationForm.recipient,
        title: notificationForm.subject,
        message: notificationForm.message,
        type: 'system'
      });
      
      toast.success(result.message || 'Notification broadcasted successfully!');

      setSentNotifications([{
        id: Date.now(),
        recipient: notificationForm.recipient,
        subject: notificationForm.subject,
        message: notificationForm.message,
        date: new Date().toLocaleString(),
        status: 'Sent'
      }, ...sentNotifications]);

      setShowDialog(false);
      setNotificationForm({
        recipient: '',
        subject: '',
        message: '',
        scheduleDate: '',
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to broadcast notification.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[#0A2342] mb-2">Notifications Management</h1>
          <p className="text-gray-600">Send and schedule system notifications</p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-[#0A2342] text-white hover:bg-[#0A2342]/90"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Notification
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Sent</p>
                <p className="text-[#0A2342]">{sentNotifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Scheduled</p>
                <p className="text-[#0A2342]">0</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">This Week</p>
                <p className="text-[#0A2342]">2</p>
              </div>
              <Send className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#0A2342]">Quick Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start border-[#0A2342] hover:bg-[#E5F1FB]"
              onClick={() => {
                setNotificationForm({
                  recipient: 'clients',
                  subject: 'Appointment Reminder',
                  message: '',
                  scheduleDate: '',
                });
                setShowDialog(true);
              }}
            >
              <div className="text-[#0A2342]">Appointment Reminder</div>
              <div className="text-gray-600 text-sm mt-1">Send to all clients</div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start border-[#0A2342] hover:bg-[#E5F1FB]"
              onClick={() => {
                setNotificationForm({
                  recipient: 'lawyers',
                  subject: 'Case Update Request',
                  message: '',
                  scheduleDate: '',
                });
                setShowDialog(true);
              }}
            >
              <div className="text-[#0A2342]">Case Update Request</div>
              <div className="text-gray-600 text-sm mt-1">Send to all lawyers</div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start border-[#0A2342] hover:bg-[#E5F1FB]"
              onClick={() => {
                setNotificationForm({
                  recipient: 'all',
                  subject: 'System Announcement',
                  message: '',
                  scheduleDate: '',
                });
                setShowDialog(true);
              }}
            >
              <div className="text-[#0A2342]">System Announcement</div>
              <div className="text-gray-600 text-sm mt-1">Send to all users</div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start border-[#0A2342] hover:bg-[#E5F1FB]"
              onClick={() => {
                setNotificationForm({
                  recipient: 'clients',
                  subject: 'Payment Reminder',
                  message: '',
                  scheduleDate: '',
                });
                setShowDialog(true);
              }}
            >
              <div className="text-[#0A2342]">Payment Reminder</div>
              <div className="text-gray-600 text-sm mt-1">Send to clients with pending payments</div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sent Notifications History */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#0A2342]">Notification History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sentNotifications.map((notification) => (
              <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-[#0A2342]">{notification.subject}</h3>
                    <p className="text-gray-600 text-sm">To: {notification.recipient}</p>
                  </div>
                  <span className="text-gray-500 text-sm">{notification.date}</span>
                </div>
                <p className="text-gray-700 mb-2">{notification.message}</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    {notification.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Send Notification Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Create and send or schedule a notification to users
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Recipient Group</Label>
              <Select
                value={notificationForm.recipient}
                onValueChange={(value) =>
                  setNotificationForm({ ...notificationForm, recipient: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="clients">All Clients</SelectItem>
                  <SelectItem value="lawyers">All Lawyers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Subject</Label>
              <Input
                value={notificationForm.subject}
                onChange={(e) =>
                  setNotificationForm({ ...notificationForm, subject: e.target.value })
                }
                placeholder="Enter notification subject"
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                value={notificationForm.message}
                onChange={(e) =>
                  setNotificationForm({ ...notificationForm, message: e.target.value })
                }
                placeholder="Enter notification message"
                className="min-h-[120px]"
              />
            </div>

            <div>
              <Label>Schedule Date (Optional)</Label>
              <Input
                type="date"
                value={notificationForm.scheduleDate}
                onChange={(e) =>
                  setNotificationForm({ ...notificationForm, scheduleDate: e.target.value })
                }
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to send immediately
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendNotification}
              className="bg-[#0A2342] text-white hover:bg-[#0A2342]/90"
            >
              <Send className="w-4 h-4 mr-2" />
              {notificationForm.scheduleDate ? 'Schedule' : 'Send Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
