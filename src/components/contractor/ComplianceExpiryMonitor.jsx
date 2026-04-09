import React, { useMemo } from 'react';
import { AlertTriangle, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { differenceInDays, parseISO, isValid } from 'date-fns';

function ExpiryItem({ label, expiryDate, urgencyDays = 30 }) {
  if (!expiryDate) return null;

  const parsed = parseISO(expiryDate);
  if (!isValid(parsed)) return null;

  const daysLeft = differenceInDays(parsed, new Date());
  const isExpired = daysLeft < 0;
  const isUrgent = daysLeft >= 0 && daysLeft <= urgencyDays;
  const isWarning = daysLeft > urgencyDays && daysLeft <= 60;

  const color = isExpired
    ? 'bg-red-50 border-red-300 text-red-700'
    : isUrgent
    ? 'bg-amber-50 border-amber-300 text-amber-700'
    : isWarning
    ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
    : 'bg-green-50 border-green-200 text-green-700';

  const Icon = isExpired || isUrgent ? AlertTriangle : isWarning ? Clock : CheckCircle2;

  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${color}`}>
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-xs font-bold">
        {isExpired
          ? `Expired ${Math.abs(daysLeft)}d ago`
          : `${daysLeft}d left`
        }
      </span>
    </div>
  );
}

export default function ComplianceExpiryMonitor({ contractor }) {
  const items = useMemo(() => [
    { label: 'Insurance Policy', date: contractor?.insurance_expiry },
    { label: 'Contractor License', date: contractor?.license_expiry },
    { label: 'Bond', date: contractor?.bond_expiry },
    { label: 'HIS License', date: contractor?.his_license_status === 'expired' ? null : contractor?.his_license_state ? null : null },
    ...(contractor?.additional_certifications || []).map(c => ({
      label: c.name || 'Certification',
      date: c.expiry
    })),
  ].filter(item => item.date), [contractor]);

  const hasIssues = items.some(item => {
    if (!item.date) return false;
    const parsed = parseISO(item.date);
    if (!isValid(parsed)) return false;
    return differenceInDays(parsed, new Date()) <= 60;
  });

  if (items.length === 0) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className={`w-5 h-5 ${hasIssues ? 'text-amber-500' : 'text-green-500'}`} />
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Compliance Expiry Monitor</h3>
          <p className="text-xs text-slate-500">Proactive alerts for expiring documents</p>
        </div>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <ExpiryItem key={i} label={item.label} expiryDate={item.date} />
        ))}
      </div>
      {!hasIssues && (
        <p className="text-xs text-green-600 mt-3 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          All documents are current — no action needed.
        </p>
      )}
    </Card>
  );
}