import React, { useMemo } from 'react';
import { TrendingUp, Target, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinancialForecasting({ scope, expenses = [], milestones = [] }) {
  const forecastData = useMemo(() => {
    if (!scope?.cost_amount) return [];
    
    const totalBudget = scope.cost_amount;
    const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const projectedDays = scope.estimated_hours ? Math.ceil(scope.estimated_hours / 8) : 30;
    const elapsedDays = milestones.filter(m => m.status === 'completed').length || 1;
    
    const burnRate = totalSpent / Math.max(elapsedDays, 1);
    const projectedTotal = burnRate * projectedDays;
    const daysRemaining = Math.max(projectedDays - elapsedDays, 0);
    
    // Generate forecast line
    const forecast = [];
    for (let i = 0; i <= projectedDays; i++) {
      const spent = i <= elapsedDays ? expenses.slice(0, i).reduce((sum, e) => sum + (e.amount || 0), 0) : totalSpent + (burnRate * (i - elapsedDays));
      forecast.push({
        day: i,
        actual: i <= elapsedDays ? spent : null,
        projected: i >= elapsedDays ? spent : null,
        budget: (totalBudget / projectedDays) * i,
      });
    }
    
    return {
      data: forecast,
      burnRate: burnRate.toFixed(2),
      projectedTotal: projectedTotal.toFixed(2),
      remaining: Math.max(totalBudget - projectedTotal, 0).toFixed(2),
      onTrack: projectedTotal <= totalBudget,
      daysRemaining,
    };
  }, [scope, expenses, milestones]);

  if (!forecastData.data || forecastData.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Financial Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Insufficient data for forecasting</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Budget Projection
          </CardTitle>
          <CardDescription>Actual spend vs. projected spend over project timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottomRight', offset: -5 }} />
              <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `$${value?.toFixed(2) || 0}`} />
              <Line type="monotone" dataKey="budget" stroke="#94a3b8" name="Budget Line" />
              <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2} name="Actual" />
              <Line type="monotone" dataKey="projected" stroke="#f97316" strokeDasharray="5 5" name="Projection" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Forecast Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Daily Burn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">${forecastData.burnRate}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Projected Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">${forecastData.projectedTotal}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Remaining Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${parseFloat(forecastData.remaining) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${forecastData.remaining}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Days Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{forecastData.daysRemaining}</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Alert */}
      {!forecastData.onTrack && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Budget Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700">
              Project is projected to exceed budget by ${Math.abs(parseFloat(forecastData.remaining)).toFixed(2)}. Review expenses or adjust scope.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}