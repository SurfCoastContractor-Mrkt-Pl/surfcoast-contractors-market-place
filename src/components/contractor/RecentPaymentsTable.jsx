import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const statusConfig = {
  confirmed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Paid' },
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
  failed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Failed' }
};

export default function RecentPaymentsTable({ payments }) {
  if (payments.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Payouts</h3>
        <div className="text-center py-8">
          <p className="text-slate-500">No payment records yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 overflow-hidden">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Payouts</h3>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200">
              <TableHead className="text-sm font-semibold text-slate-900">Date</TableHead>
              <TableHead className="text-sm font-semibold text-slate-900">Job</TableHead>
              <TableHead className="text-sm font-semibold text-slate-900">Amount</TableHead>
              <TableHead className="text-sm font-semibold text-slate-900">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.slice(0, 10).map(payment => {
              const config = statusConfig[payment.status] || statusConfig.pending;
              const Icon = config.icon;

              return (
                <TableRow key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <TableCell className="text-sm text-slate-700">
                    {new Date(payment.created_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">
                    {payment.purpose || 'Job Payment'}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-slate-900">
                    ${payment.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1 w-fit ${config.color}`}
                    >
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {payments.length > 10 && (
        <p className="text-xs text-slate-500 mt-4">
          Showing 10 of {payments.length} payouts
        </p>
      )}
    </Card>
  );
}