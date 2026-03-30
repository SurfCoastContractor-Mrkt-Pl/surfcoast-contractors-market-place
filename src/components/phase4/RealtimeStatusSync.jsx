import React, { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function RealtimeStatusSync({ scopeId, onStatusChange }) {
  const [currentStatus, setCurrentStatus] = useState(null);
  const queryClient = useQueryClient();

  // Poll for status changes every 15 seconds (optimized)
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const scopes = await base44.entities.ScopeOfWork.filter({ id: scopeId });
        if (scopes?.length) {
          const newStatus = scopes[0].status;
          if (newStatus !== currentStatus) {
            setCurrentStatus(newStatus);
            onStatusChange?.(newStatus);
            queryClient.invalidateQueries({ queryKey: ['scope', scopeId] });
          }
        }
      } catch (error) {
        console.error('Status sync error:', error);
      }
    };

    // Initial poll immediately, then every 15 seconds
    pollStatus();
    const interval = setInterval(pollStatus, 15000);
    return () => clearInterval(interval);
  }, [scopeId, currentStatus, onStatusChange, queryClient]);

  // Also subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = base44.entities.ScopeOfWork.subscribe((event) => {
      if (event.id === scopeId && event.type === 'update') {
        setCurrentStatus(event.data.status);
        onStatusChange?.(event.data.status);
        queryClient.invalidateQueries({ queryKey: ['scope', scopeId] });
      }
    });

    return () => unsubscribe?.();
  }, [scopeId, onStatusChange, queryClient]);

  return null; // This component only manages state, doesn't render
}