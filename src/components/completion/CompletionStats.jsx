import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Users, TrendingUp } from 'lucide-react';

export default function CompletionStats({ contractor, customer }) {
  const isContractor = !!contractor;
  const data = contractor || customer;

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Completed Projects */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Completed Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">
            {data.completed_jobs_count || 0}
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Verified completed projects
          </p>
        </CardContent>
      </Card>

      {/* Unique Customers (Contractor Only) */}
      {isContractor && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
              <Users className="w-4 h-4 text-blue-600" />
              Unique Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {contractor.unique_customers_count || 0}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Different customers worked with
            </p>
          </CardContent>
        </Card>
      )}

      {/* Completion Rate (if applicable) */}
      {isContractor && contractor.reviews_count > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {Math.round((contractor.completed_jobs_count / (contractor.reviews_count || 1)) * 100)}%
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Projects with verified reviews
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}