import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, X, CheckCircle2, AlertCircle, MessageSquare, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

const NOTIFICATION_TYPES = {
  message: {
    icon: MessageSquare,
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-900',
    title: 'New Message',
  },
  file: {
    icon: FileUp,
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-900',
    title: 'File Uploaded',
  },
  milestone: {
    icon: CheckCircle2,
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-900',
    title: 'Milestone Update',
  },
  status: {
    icon: AlertCircle,
    color: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-900',
    title: 'Status Changed',
  },
};

export default function ProjectNotificationCenter({ scopeId, userEmail, userType }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastRead, setLastRead] = useState(new Date());

  // Fetch unread messages
  const { data: messages = [] } = useQuery({
    queryKey: ['unread-messages', scopeId],
    queryFn: () => base44.entities.ProjectMessage.filter(
      { scope_id: scopeId, read: false },
      '-created_date'
    ),
    refetchInterval: 5000,
  });

  // Fetch recent files
  const { data: files = [] } = useQuery({
    queryKey: ['recent-files', scopeId],
    queryFn: () => base44.entities.ProjectFile.filter(
      { scope_id: scopeId },
      '-created_date',
      10
    ),
    refetchInterval: 5000,
  });

  // Fetch milestone updates
  const { data: milestones = [] } = useQuery({
    queryKey: ['milestone-updates', scopeId],
    queryFn: () => base44.entities.ProjectMilestone.filter(
      { scope_id: scopeId },
      '-created_date',
      10
    ),
    refetchInterval: 5000,
  });

  // Generate notifications
  useEffect(() => {
    const generated = [];

    // Message notifications
    messages.forEach(msg => {
      if (msg.sender_email !== userEmail && new Date(msg.created_date) > lastRead) {
        generated.push({
          id: `msg-${msg.id}`,
          type: 'message',
          title: `${msg.sender_name} sent a message`,
          description: msg.message.substring(0, 60),
          timestamp: msg.created_date,
          unread: !msg.read,
        });
      }
    });

    // File notifications
    files.forEach(file => {
      if (file.uploaded_by !== userEmail && new Date(file.created_date || file.uploaded_at) > lastRead) {
        generated.push({
          id: `file-${file.id}`,
          type: 'file',
          title: `${file.file_name} uploaded`,
          description: `Type: ${file.file_type}`,
          timestamp: file.created_date || file.uploaded_at,
          unread: true,
        });
      }
    });

    // Milestone notifications
    milestones.forEach(milestone => {
      if (new Date(milestone.created_date) > lastRead) {
        generated.push({
          id: `milestone-${milestone.id}`,
          type: 'milestone',
          title: `${milestone.milestone_name} ${milestone.status}`,
          description: milestone.description || 'Milestone updated',
          timestamp: milestone.created_date,
          unread: true,
        });
      }
    });

    setNotifications(generated.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    ));
  }, [messages, files, milestones, userEmail, lastRead]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAsRead = useCallback(async (notificationId) => {
    const msgId = notificationId.replace('msg-', '');
    const message = messages.find(m => m.id === msgId);
    if (message) {
      await base44.entities.ProjectMessage.update(msgId, { read: true });
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, unread: false } : n
      ));
    }
  }, [messages]);

  const handleDismiss = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg border border-slate-200 shadow-lg z-50">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No new notifications
              </div>
            ) : (
              notifications.map(notification => {
                const config = NOTIFICATION_TYPES[notification.type];
                const Icon = config.icon;

                return (
                  <div
                    key={notification.id}
                    className={`border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors ${
                      notification.unread ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.badge}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-slate-600 mt-0.5 truncate">
                          {notification.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDismiss(notification.id)}
                        className="flex-shrink-0 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {notification.type === 'message' && notification.unread && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="mt-2 w-full text-xs"
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}