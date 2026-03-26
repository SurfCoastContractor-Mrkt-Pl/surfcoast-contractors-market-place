import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, CheckCircle2, Clock, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ComplianceStatusWidget({ contractor, onAppealClick }) {
  const [pendingAppeals, setPendingAppeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingAppeals = async () => {
      try {
        const appeals = await base44.entities.ComplianceAppeal.filter({
          contractor_email: contractor.email,
          status: 'pending',
        });
        setPendingAppeals(appeals || []);
      } catch (error) {
        console.error('Failed to fetch appeals:', error);
      } finally {
        setLoading(false);
      }
    };

    if (contractor?.email) {
      fetchPendingAppeals();
    }
  }, [contractor?.email]);

  if (loading) {
    return null;
  }

  const isCompliant =
    contractor?.payment_compliant &&
    !contractor?.minor_hours_locked &&
    !contractor?.account_locked;

  if (isCompliant && pendingAppeals.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-900">Compliance Status: Good Standing</p>
            <p className="text-sm text-green-800">Your account is in full compliance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          Compliance Alert
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!contractor?.payment_compliant && (
          <div className="p-3 bg-white rounded border border-red-200">
            <p className="text-sm font-semibold text-red-900">Off-Platform Payment Detected</p>
            <p className="text-xs text-red-800 mt-1">
              You have 14 days to process all payments through SurfCoast. Grace period until{' '}
              {contractor?.payment_lock_grace_until
                ? new Date(contractor.payment_lock_grace_until).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        )}

        {contractor?.minor_hours_locked && (
          <div className="p-3 bg-white rounded border border-orange-200">
            <p className="text-sm font-semibold text-orange-900">Weekly Hours Limit Exceeded</p>
            <p className="text-xs text-orange-800 mt-1">
              Your account is locked until{' '}
              {contractor?.minor_hours_lock_until
                ? new Date(contractor.minor_hours_lock_until).toLocaleDateString()
                : 'N/A'}
              . Account will automatically unlock after 1 week.
            </p>
          </div>
        )}

        {contractor?.account_locked && !contractor?.minor_hours_locked && (
          <div className="p-3 bg-white rounded border border-amber-200">
            <p className="text-sm font-semibold text-amber-900">After-Photo Deadline Missed</p>
            <p className="text-xs text-amber-800 mt-1">
              Your account is locked. Submit an appeal with the missing photos to unlock.
            </p>
          </div>
        )}

        {pendingAppeals.length > 0 && (
          <div className="p-3 bg-white rounded border border-blue-200">
            <p className="text-sm font-semibold text-blue-900">
              <Clock className="w-4 h-4 inline mr-1" />
              {pendingAppeals.length} Pending Appeal(s)
            </p>
            <p className="text-xs text-blue-800 mt-1">
              Admins will review within 2-3 business days
            </p>
          </div>
        )}

        <Button
          onClick={() => onAppealClick?.()}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          Submit or View Appeal
        </Button>
      </CardContent>
    </Card>
  );
}