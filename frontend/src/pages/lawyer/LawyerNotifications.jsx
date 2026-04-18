import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Bell, Calendar, FileText, User, Trash2, CheckCheck } from 'lucide-react';
import { notificationService } from '../../api/notificationService';
import { toast } from 'sonner@2.0.3';

export default function LawyerNotifications({ lawyerId, onRefresh }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (lawyerId) {
      loadNotifications();
    }
  }, [lawyerId]);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications({ user_id: lawyerId });
      setNotifications(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load notifications');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'case':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'feedback':
        return <User className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      if (onRefresh) onRefresh();
    } catch (e) {
      toast.error('Failed to mark read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // In a robust system, we would have a backend bulk update route. 
      // For now, we update frontend state, though ideally we'd trigger multiple markAsRead.
      // Here doing it optimistically just for UI.
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      await Promise.all(unreadIds.map(id => notificationService.markAsRead(id)));
      
      setNotifications(
        notifications.map((notif) => ({ ...notif, is_read: true }))
      );
      if (onRefresh) onRefresh();
      toast.success('All marked as read');
    } catch (e) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = (id) => {
    toast.error('Deletion of notifications is not yet configured for compliance.');
    // Keep it in UI or implement a delete backend method later
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[#0A2342] mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with appointments and case alerts</p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            className="border-[#0A2342] text-[#0A2342]"
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All
          </Button>
        )}
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Notifications</p>
                <p className="text-[#0A2342]">{notifications.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Unread Notifications</p>
                <p className="text-[#0A2342]">{unreadCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#0A2342]">All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${notification.read
                    ? 'bg-white border-gray-200'
                    : 'bg-[#E5F1FB] border-[#0A2342]/20'
                    }`}
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[#0A2342] font-semibold text-sm mb-0.5">{notification.title}</p>
                    <p className="text-gray-900 mb-1">{notification.message}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-sm">{new Date(notification.created_at).toLocaleDateString()}</span>
                      {!notification.is_read && (
                        <Badge className="bg-[#0A2342] text-white">Unread</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.is_read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="border-[#0A2342] text-[#0A2342]"
                      >
                        Mark
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(notification.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
