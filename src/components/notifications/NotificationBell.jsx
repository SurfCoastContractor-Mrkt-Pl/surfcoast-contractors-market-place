import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUserData } from '@/hooks/useUserData';

export default function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useUserData();

  const { data } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => base44.functions.invoke('getUnreadNotifications', {}).then(res => res.data),
    enabled: !!user,             // only poll when logged in
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    retry: false,                // don't retry on network errors
  });

  const unreadCount = data?.unreadCount || 0;
  const notifications = data?.notifications || [];

  const handleMarkRead = async (notificationId) => {
    await base44.functions.invoke('markNotificationRead', { notificationId });
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                No new notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => {
                    if (notif.action_url) window.location.href = notif.action_url;
                    handleMarkRead(notif.id);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{notif.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{notif.description}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-2 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}