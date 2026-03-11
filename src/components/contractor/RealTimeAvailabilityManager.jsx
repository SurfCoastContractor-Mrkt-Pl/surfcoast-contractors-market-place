import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, AlertCircle, Wifi, WifiOff } from 'lucide-react';

export default function RealTimeAvailabilityManager({ contractor }) {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateAvailabilityMutation = useMutation({
    mutationFn: async (status) => {
      return base44.entities.Contractor.update(contractor.id, {
        availability_status: status,
        available: status === 'available'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-contractor'] });
      setStatusMessage('Availability updated');
      setTimeout(() => setStatusMessage(''), 2000);
    },
  });

  const statusConfig = {
    available: {
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      label: 'Available',
      description: 'Ready to accept new jobs'
    },
    booked: {
      color: 'bg-blue-100 text-blue-800',
      icon: Clock,
      label: 'Booked',
      description: 'Currently working on a job'
    },
    on_vacation: {
      color: 'bg-amber-100 text-amber-800',
      icon: AlertCircle,
      label: 'On Vacation',
      description: 'Not available for work'
    }
  };

  const current = statusConfig[contractor?.availability_status] || statusConfig.available;
  const CurrentIcon = current.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`} />
          Availability Status
        </CardTitle>
        <CardDescription>Update your status in real-time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status Display */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <CurrentIcon className="w-6 h-6 text-slate-700" />
            <div>
              <p className="font-semibold text-slate-900">{current.label}</p>
              <p className="text-xs text-slate-500">{current.description}</p>
            </div>
          </div>
          <Badge className={current.color}>{current.label}</Badge>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-green-700">Connected — Changes sync in real-time</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Offline — Changes will sync when reconnected</span>
            </>
          )}
        </div>

        {/* Status Change Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(statusConfig).map(([status, config]) => {
            const StatusIcon = config.icon;
            const isActive = contractor?.availability_status === status;
            return (
              <Button
                key={status}
                variant={isActive ? 'default' : 'outline'}
                className={`gap-2 h-auto py-3 flex-col ${isActive ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                onClick={() => updateAvailabilityMutation.mutate(status)}
                disabled={updateAvailabilityMutation.isPending}
              >
                <StatusIcon className="w-5 h-5" />
                <span className="text-xs font-medium text-center">{config.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Success Message */}
        {statusMessage && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">{statusMessage}</AlertDescription>
          </Alert>
        )}

        {/* Info */}
        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
          <p className="font-semibold mb-1">💡 Pro Tip</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Set to "Available" to receive new job inquiries</li>
            <li>Mark "Booked" when working to manage expectations</li>
            <li>Use "On Vacation" when you need time off</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}