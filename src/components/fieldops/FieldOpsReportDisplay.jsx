import React, { useState } from 'react';
import { TrendingUp, Users, Clock, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FieldOpsReportDisplay({ report, onExport, exporting }) {
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  if (!report) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-lg">Select filters and generate a report to view results</p>
      </div>
    );
  }

  const { metrics, grouped, details } = report;

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-700 font-semibold">Total Jobs</p>
          </div>
          <p className="text-4xl font-bold text-blue-900">{metrics.totalJobs}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700 font-semibold">Total Earnings</p>
          </div>
          <p className="text-4xl font-bold text-green-900">${metrics.totalEarnings}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <p className="text-sm text-purple-700 font-semibold">Avg Job Time</p>
          </div>
          <p className="text-4xl font-bold text-purple-900">{metrics.averageJobTime} hrs</p>
        </Card>
      </div>

      {/* Grouped Breakdown */}
      <Card className="p-6 border border-slate-200">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Breakdown
        </h3>

        {Object.entries(grouped).length === 0 ? (
          <p className="text-slate-500 text-center py-8">No data to display</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(grouped).map(([category, data]) => (
              <div
                key={category}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{category}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      {data.jobs} job{data.jobs !== 1 ? 's' : ''} • ${data.earnings.toFixed(2)} earned
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">${data.earnings.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 mt-1">{(data.hours / data.jobs).toFixed(1)} hrs/job avg</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Detailed Job List */}
      {details.length > 0 && (
        <Card className="p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Job Details</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Job Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Customer</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Earnings</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Hours</th>
                </tr>
              </thead>
              <tbody>
                {details.map((detail, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-700">
                      {new Date(detail.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">{detail.jobTitle}</td>
                    <td className="py-3 px-4 text-slate-700">{detail.customer}</td>
                    <td className="py-3 px-4 text-right text-green-600 font-semibold">
                      ${detail.earnings.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">{detail.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={onExport}
          disabled={exporting}
          className="bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export to CSV'}
        </Button>
      </div>
    </div>
  );
}