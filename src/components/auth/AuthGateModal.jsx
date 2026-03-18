import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LogIn, UserPlus, Shield } from 'lucide-react';

/**
 * Shows a login/signup prompt when a guest tries to use an action that requires auth.
 * Usage: <AuthGateModal open={open} onClose={() => setOpen(false)} action="request a quote" />
 */
export default function AuthGateModal({ open, onClose, action = 'continue' }) {
  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(30,90,150,0.1)' }}>
              <Shield className="w-6 h-6" style={{ color: '#1E5A96' }} />
            </div>
          </div>
          <DialogTitle className="text-center text-lg">Sign in to {action}</DialogTitle>
          <DialogDescription className="text-center text-slate-500 text-sm">
            Create a free account or log in to get started. It only takes a minute.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <Button
            className="w-full text-white font-semibold gap-2"
            style={{ backgroundColor: '#1E5A96' }}
            onClick={handleLogin}
          >
            <LogIn className="w-4 h-4" />
            Log In
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Link to={createPageUrl('CustomerSignup')} onClick={onClose}>
              <Button variant="outline" className="w-full text-sm gap-1.5" style={{ borderColor: '#1E5A96', color: '#1E5A96' }}>
                <UserPlus className="w-3.5 h-3.5" />
                As Customer
              </Button>
            </Link>
            <Link to={createPageUrl('ContractorSignup')} onClick={onClose}>
              <Button variant="outline" className="w-full text-sm gap-1.5">
                <UserPlus className="w-3.5 h-3.5" />
                As Contractor
              </Button>
            </Link>
          </div>

          <button onClick={onClose} className="w-full text-xs text-slate-400 hover:text-slate-600 py-1">
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}