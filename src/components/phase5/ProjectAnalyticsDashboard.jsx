import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ProjectAnalyticsDashboard({ scope, milestones = [], expenses = [] }) {
  // Calculate financial metrics
  const financials = useMemo(() => {
    const costAmount = scope?.cost_amount || 0;
    const platformFee = costAmount * (scope?.platform_fee_percentage || 18) / 100;
    const contractorPayout = costAmount - platformFee;
    
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const profitMargin = costAmount > 0 ? ((costAmount - totalExpenses - platformFee) / costAmount * 100).toFixed(1) : 0;

    return {
      projectValue: costAmount,
      platformFee,
      contractorPayout,
      totalExpenses,
      profitMargin,
      profitAmount: costAmount - totalExpenses - platformFee,
    };
  }, [scope, expenses]);

  // Calculate milestone progress
  const milestoneStats = useMemo(() => {
    const completed = milestones.filter(m => m.status === 'completed').length;
    const total = milestones.length || 1;
    const progressPercent = Math.round((completed / total) * 100);
    
    return { completed, total, progressPercent };
  }, [milestones]);

  // Cost breakdown by category
  const costBreakdown = useMemo(() => {
    const categories = {};
    expenses.forEach(exp => {
      const cat = exp.category || 'Other';
      categories[cat] = (categories[cat] || 0) + (exp.amount || 0);
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  }, [expenses]);

  // Timeline data
  const timelineData = useMemo(() => {
    return milestones.map((m, i) => ({
      name: `${i + 1}. ${m.milestone_name?.substring(0, 12)}...`,
      status: m.status === 'completed' ? 100 : 50,
    }));
  }, [milestones]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Project Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">
              ${financials.projectValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Profit Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${financials.profitMargin >= 20 ? 'text-green-600' : 'text-yellow-600'}`}>
              {financials.profitMargin}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">
              {milestoneStats.progressPercent}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {milestoneStats.completed} of {milestoneStats.total} milestones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">
              ${financials.totalExpenses.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            {costBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-slate-500">No expenses recorded</div>
            )}
          </CardContent>
        </Card>

        {/* Milestone Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Milestone Progress</CardTitle>
            <CardDescription>Project completion timeline</CardDescription>
          </CardHeader>
          <CardContent>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="status" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-slate-500">No milestones created</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-600">Project Value</span>
              <span className="font-semibold">${financials.projectValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-600">Total Expenses</span>
              <span className="font-semibold text-red-600">-${financials.totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-600">Platform Fee (18%)</span>
              <span className="font-semibold text-red-600">-${financials.platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t-2 border-slate-300">
              <span className="text-slate-900 font-semibold">Net Profit</span>
              <span className={`text-lg font-bold ${financials.profitAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${financials.profitAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}