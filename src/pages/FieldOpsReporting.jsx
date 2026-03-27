import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart3 } from 'lucide-react';
import WaveFOReportFilters from '@/components/fieldops/FieldOpsReportFilters';
import WaveFOReportDisplay from '@/components/fieldops/FieldOpsReportDisplay';

export default function WaveFOReporting() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateReport = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const result = await base44.functions.invoke('generateWaveFOReport', {
        startDate: filters.startDate,
        endDate: filters.endDate,
        categorizeBy: filters.categorizeBy,
        format: 'json'
      });
      setReport({ ...result.data, startDate: filters.startDate, endDate: filters.endDate });
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      if (!report) return;

      // Determine categorization from grouped data keys
      const groupedKeys = Object.keys(report.grouped || {});
      const waveKeys = ['Ripple', 'Swell', 'Breaker', 'Pipeline', 'Residential Wave'];
      const categorizeBy = groupedKeys.some(k => waveKeys.includes(k)) ? 'wave' : 'customer';

      const csvResult = await base44.functions.invoke('generateWaveFOReport', {
        startDate: report.startDate,
        endDate: report.endDate,
        categorizeBy,
        format: 'csv'
      });

      // Create and download CSV file
      const csvContent = csvResult.data.csv;
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
      element.setAttribute('download', `wave-fo-report-${new Date().toISOString().split('T')[0]}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError('Failed to export CSV. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Wave FO Reports</h1>
          </div>
          <p className="text-slate-600">Analyze your completed jobs with detailed metrics and breakdowns</p>
        </div>

        {/* Filters */}
        <WaveFOReportFilters onFilterChange={handleGenerateReport} loading={loading} />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Report Display */}
        <WaveFOReportDisplay
          report={report}
          onExport={handleExportCSV}
          exporting={exporting}
        />
      </div>
    </div>
  );
}