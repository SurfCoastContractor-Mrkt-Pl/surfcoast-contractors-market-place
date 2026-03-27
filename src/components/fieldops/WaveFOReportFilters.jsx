import React, { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function WaveFOReportFilters({ onFilterChange, loading }) {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [categorizeBy, setCategorizeBy] = useState('customer');

  const handleFilter = () => {
    onFilterChange({ startDate, endDate, categorizeBy });
  };

  return (
    <Card className="p-6 mb-6 bg-white border border-slate-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900">
        <Filter className="w-5 h-5" />
        Report Filters
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Categorization */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Categorize By
          </label>
          <select
            value={categorizeBy}
            onChange={(e) => setCategorizeBy(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="customer">Customer</option>
            <option value="wave">Wave Tier</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleFilter}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>
    </Card>
  );
}