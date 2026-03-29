import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle } from 'lucide-react';

export default function NotificationCenter() {
  const [showAll, setShowAll] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => base44.auth.me()
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const results = await base44.entities.MatchNotification.filter(
        { recipient_email: user.email },
        '-created_date',
        100
      );
      return results;
    },
    enabled: !!user?.email,
    refetchInterval: 5000
  });

  // Mark as read
  const markReadMutation = useMutation({
    mutationFn: async (notifId) => {
      await base44.entities.MatchNotification.update(notifId, {
        is_read: true,
        read_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const displayNotifications = showAll ? notifications : notifications.slice(0, 3);

  const typeColors = {
    match_invitation: 'bg-blue-100 text-blue-800',
    match_accepted: 'bg-green-100 text-green-800',
    match_started: 'bg-purple-100 text-purple-800',
    match_completed: 'bg-yellow-100 text-yellow-800',
    opponent_progress: 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="relative">
      <button className="relative p-2 hover:bg-gray-100 rounded-full">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      <div className="absolute right-0 mt-2 w-96 max-h-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-y-auto z-50">
        <div className="sticky top-0 bg-white border-b p-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </h3>
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No notifications</div>
        ) : (
          <>
            <div className="space-y-0">
              {displayNotifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 border-b hover:bg-gray-50 transition cursor-pointer ${
                    notif.is_read ? 'opacity-70' : 'bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={typeColors[notif.notification_type]}>
                          {notif.notification_type.replace(/_/g, ' ')}
                        </Badge>
                        {!notif.is_read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="font-semibold text-sm">{notif.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.created_date).toLocaleTimeString()}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markReadMutation.mutate(notif.id)}
                        className="h-6 w-6"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {notifications.length > 3 && !showAll && (
              <div className="p-3 text-center border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAll(true)}
                >
                  View All Notifications
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}