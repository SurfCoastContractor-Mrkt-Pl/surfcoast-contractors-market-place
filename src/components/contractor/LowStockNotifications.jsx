import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LowStockNotifications({ contractorEmail }) {
  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['lowStockNotifications', contractorEmail],
    queryFn: async () => {
      if (!contractorEmail) return [];
      return await base44.entities.LowStockNotification.filter(
        { contractor_email: contractorEmail, read: false },
        '-created_date'
      );
    },
    enabled: !!contractorEmail,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const handleMarkAsRead = async (notificationId) => {
    try {
      await base44.entities.LowStockNotification.update(notificationId, {
        read: true,
        read_at: new Date().toISOString(),
      });
      refetch();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 max-w-md space-y-2 z-50">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start shadow-lg"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-red-900 text-sm">Low Stock Alert</p>
            <p className="text-red-700 text-sm">
              {notification.material_name} is now at {notification.current_quantity} units
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleMarkAsRead(notification.id)}
            className="text-red-600 hover:text-red-800 flex-shrink-0"
          >
            <Check className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}