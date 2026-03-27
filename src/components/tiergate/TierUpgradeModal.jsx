import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Zap, Crown } from 'lucide-react';

export default function TierUpgradeModal({ open, onClose, feature, currentTier, requiredTier }) {
  const tierInfo = {
    standard: { label: 'Standard', color: 'bg-slate-100', icon: '📊' },
    licensed: { label: 'Licensed', color: 'bg-blue-100', icon: '⭐' },
    premium: { label: 'Premium', color: 'bg-purple-100', icon: '👑' },
  };

  const featureNames = {
    maxServicePackages: 'Service Packages',
    emailTracking: 'Email Analytics',
    emailCustomization: 'Custom Email Templates',
    advancedAnalytics: 'Advanced Analytics',
    pdfTemplates: 'Premium PDF Templates',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            Upgrade Required
          </DialogTitle>
          <DialogDescription>
            This feature is only available in our {tierInfo[requiredTier]?.label} plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-700 mb-2">
              {featureNames[feature] || feature}
            </p>
            <div className="flex gap-2">
              <Badge variant="outline">{tierInfo[currentTier]?.label} Plan</Badge>
              <span className="text-slate-400">→</span>
              <Badge className={tierInfo[requiredTier]?.color}>
                {tierInfo[requiredTier]?.label} Plan
              </Badge>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 flex gap-2">
            <Zap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Upgrade your plan to unlock this feature and access more powerful tools for managing your services.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={() => {
              // Route to upgrade/billing page
              window.location.href = '/ContractorAccount?tab=billing';
            }} className="flex-1 gap-2">
              <Crown className="w-4 h-4" />
              Upgrade Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}