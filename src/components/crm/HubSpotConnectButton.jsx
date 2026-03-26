import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader, CheckCircle, Link as LinkIcon } from 'lucide-react';

export default function HubSpotConnectButton({ connectorName = "-build as needed", onConnected }) {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const url = await base44.connectors.connectAppUser(connectorName);
      const popup = window.open(url, '_blank', 'width=600,height=700');
      
      // Poll for completion
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          setConnected(true);
          setLoading(false);
          onConnected?.();
        }
      }, 500);

      setTimeout(() => clearInterval(timer), 600000); // 10 min timeout
    } catch (error) {
      console.error('HubSpot connection failed:', error);
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await base44.connectors.disconnectAppUser(connectorName);
      setConnected(false);
    } catch (error) {
      console.error('HubSpot disconnection failed:', error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {connected ? (
        <>
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">Connected to HubSpot</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="text-red-600 hover:text-red-700 ml-auto"
          >
            Disconnect
          </Button>
        </>
      ) : (
        <Button
          onClick={handleConnect}
          disabled={loading}
          className="gap-2"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
          {loading ? 'Connecting...' : 'Connect HubSpot'}
        </Button>
      )}
    </div>
  );
}