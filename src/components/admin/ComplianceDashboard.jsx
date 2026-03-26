import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Lock, CheckCircle2, X, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ComplianceDashboard() {
  const [violations, setViolations] = useState({
    payment_compliance: [],
    minor_hours_locked: [],
    after_photo_locked: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedContractor, setSelectedContractor] = useState(null);

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const contractors = await base44.asServiceRole.entities.Contractor.filter({});

        const payment = contractors.filter((c) => !c.payment_compliant);
        const minorHours = contractors.filter((c) => c.is_minor && c.minor_hours_locked);
        const photoLocked = contractors.filter((c) => c.account_locked && c.locked_scope_id);

        setViolations({
          payment_compliance: payment,
          minor_hours_locked: minorHours,
          after_photo_locked: photoLocked,
        });
      } catch (error) {
        console.error('Failed to fetch violations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchViolations();
  }, []);

  const handleUnlock = async (contractorId, violationType) => {
    try {
      const updates = {};

      if (violationType === 'minor_hours') {
        updates.minor_hours_locked = false;
        updates.minor_hours_lock_until = null;
      } else if (violationType === 'after_photo') {
        updates.account_locked = false;
        updates.locked_scope_id = null;
      }

      await base44.asServiceRole.entities.Contractor.update(contractorId, updates);

      // Refresh violations
      setViolations((prev) => ({
        ...prev,
        minor_hours_locked: prev.minor_hours_locked.filter((c) => c.id !== contractorId),
        after_photo_locked: prev.after_photo_locked.filter((c) => c.id !== contractorId),
      }));

      alert(`Contractor unlocked successfully`);
    } catch (error) {
      console.error('Failed to unlock contractor:', error);
      alert('Failed to unlock contractor');
    }
  };

  const handlePaymentCompliance = async (contractorId) => {
    try {
      await base44.asServiceRole.entities.Contractor.update(contractorId, {
        payment_compliant: true,
        last_external_payment_detected: null,
        payment_lock_grace_until: null,
      });

      setViolations((prev) => ({
        ...prev,
        payment_compliance: prev.payment_compliance.filter((c) => c.id !== contractorId),
      }));

      alert('Contractor marked as compliant');
    } catch (error) {
      console.error('Failed to update compliance:', error);
      alert('Failed to update compliance status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-500">Loading compliance data...</div>
      </div>
    );
  }

  const totalViolations =
    violations.payment_compliance.length +
    violations.minor_hours_locked.length +
    violations.after_photo_locked.length;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Compliance Dashboard</h1>
          <p className="text-slate-600">Monitor and manage contractor compliance violations</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Payment Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{violations.payment_compliance.length}</div>
              <p className="text-xs text-slate-500 mt-1">Off-platform payment detected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Minor Hours Locked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{violations.minor_hours_locked.length}</div>
              <p className="text-xs text-slate-500 mt-1">Exceeded 20-hour weekly limit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Photo Deadline Locked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{violations.after_photo_locked.length}</div>
              <p className="text-xs text-slate-500 mt-1">No photos past 72-hour deadline</p>
            </CardContent>
          </Card>
        </div>

        {/* Violations Table */}
        <div className="space-y-6">
          {/* Payment Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Off-Platform Payment Violations
              </CardTitle>
              <CardDescription>
                {violations.payment_compliance.length} contractor(s) with detected external payment keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              {violations.payment_compliance.length === 0 ? (
                <p className="text-sm text-slate-500">No violations detected</p>
              ) : (
                <div className="space-y-3">
                  {violations.payment_compliance.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-semibold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Detected: {new Date(c.last_external_payment_detected).toLocaleDateString()}
                          {c.payment_lock_grace_until && (
                            <span className="ml-2">
                              • Grace period until: {new Date(c.payment_lock_grace_until).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handlePaymentCompliance(c.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Mark Compliant
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Minor Hours Locked */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-600" />
                Minor Hours Violations
              </CardTitle>
              <CardDescription>
                {violations.minor_hours_locked.length} minor contractor(s) locked due to exceeding 20-hour weekly limit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {violations.minor_hours_locked.length === 0 ? (
                <p className="text-sm text-slate-500">No violations detected</p>
              ) : (
                <div className="space-y-3">
                  {violations.minor_hours_locked.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <p className="font-semibold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Hours used: {c.minor_weekly_hours_used}h / 20h
                          {c.minor_hours_lock_until && (
                            <span className="ml-2">
                              • Locked until: {new Date(c.minor_hours_lock_until).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleUnlock(c.id, 'minor_hours')}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Unlock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* After-Photo Deadline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                After-Photo Deadline Violations
              </CardTitle>
              <CardDescription>
                {violations.after_photo_locked.length} contractor(s) locked for missing photos past 72-hour deadline
              </CardDescription>
            </CardHeader>
            <CardContent>
              {violations.after_photo_locked.length === 0 ? (
                <p className="text-sm text-slate-500">No violations detected</p>
              ) : (
                <div className="space-y-3">
                  {violations.after_photo_locked.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div>
                        <p className="font-semibold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Locked scope: {c.locked_scope_id}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleUnlock(c.id, 'after_photo')}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Unlock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}