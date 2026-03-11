import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Eye, Trash2 } from 'lucide-react';
import ContentReportDetail from './ContentReportDetail';

const violationLabels = {
  illegal_activity: 'Illegal Activity',
  harassment: 'Harassment',
  hate_speech: 'Hate Speech',
  scam_fraud: 'Scam/Fraud',
  unsafe_services: 'Unsafe Services',
  inappropriate_content: 'Inappropriate',
  discrimination: 'Discrimination',
  spam: 'Spam',
  other: 'Other',
};

const severityColors = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const statusColors = {
  new: 'bg-slate-100 text-slate-700',
  under_review: 'bg-blue-100 text-blue-700',
  escalated: 'bg-red-100 text-red-700',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-slate-100 text-slate-500',
  actioned: 'bg-green-100 text-green-700',
};

export default function ContentReportsTable() {
  const [statusFilter, setStatusFilter] = useState('new');
  const [selectedReport, setSelectedReport] = useState(null);

  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ['content-reports', statusFilter],
    queryFn: () =>
      base44.entities.ContentReport.filter(
        { status: statusFilter },
        '-created_date',
        50
      ),
    initialData: [],
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading reports...</div>;
  }

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Content Reports</h2>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
                <SelectItem value="actioned">Actioned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No reports found for this status.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Reported User
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Violation
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Risk Score
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {report.target_user_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {report.target_user_email}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {violationLabels[report.violation_category]}
                        </div>
                        <div className="text-xs text-slate-500">
                          {report.content_type}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {report.ai_risk_score && (
                            <>
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span className="font-semibold">
                                {report.ai_risk_score}%
                              </span>
                            </>
                          )}
                          {report.severity && (
                            <Badge className={severityColors[report.severity]}>
                              {report.severity}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[report.status]}>
                          {report.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {selectedReport && (
        <ContentReportDetail
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdate={() => refetch()}
        />
      )}
    </>
  );
}