import React, { useMemo } from 'react';
import { AlertCircle, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function BudgetTracker({ budgetAmount = 0, expenses = [] }) {
  const calculations = useMemo(() => {
    const spent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const remaining = budgetAmount - spent;
    const percentUsed = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
    const isOverBudget = spent > budgetAmount;
    
    return {
      spent,
      remaining,
      percentUsed: Math.round(percentUsed),
      isOverBudget,
      overageAmount: isOverBudget ? spent - budgetAmount : 0,
    };
  }, [budgetAmount, expenses]);

  const getStatusColor = () => {
    if (calculations.isOverBudget) return 'text-red-600';
    if (calculations.percentUsed > 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (calculations.isOverBudget) return 'bg-red-600';
    if (calculations.percentUsed > 80) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" /> Budget Tracking
        </CardTitle>
        <CardDescription>Monitor project spending</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Overview */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Budget Usage</span>
            <span className={`text-sm font-semibold ${getStatusColor()}`}>
              {calculations.percentUsed}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} transition-all duration-300`}
              style={{ width: `${Math.min(calculations.percentUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Budget Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center p-3 rounded-lg bg-slate-50">
            <p className="text-xs sm:text-sm text-slate-600 mb-1">Budget</p>
            <p className="text-base sm:text-lg font-bold text-slate-900">
              ${budgetAmount.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-50">
            <p className="text-xs sm:text-sm text-slate-600 mb-1">Spent</p>
            <p className="text-base sm:text-lg font-bold text-red-600">
              ${calculations.spent.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-50">
            <p className="text-xs sm:text-sm text-slate-600 mb-1">Remaining</p>
            <p className={`text-base sm:text-lg font-bold ${calculations.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              ${Math.max(calculations.remaining, 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Alerts */}
        {calculations.isOverBudget && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">Budget Exceeded</p>
              <p className="text-xs text-red-700 mt-1">
                Over by ${calculations.overageAmount.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {calculations.percentUsed > 80 && calculations.percentUsed <= 100 && (
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-900">Budget Alert</p>
              <p className="text-xs text-yellow-700 mt-1">
                {calculations.percentUsed}% of budget used
              </p>
            </div>
          </div>
        )}

        {/* Expense Categories */}
        {expenses.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Expense Categories</h4>
            <div className="space-y-2">
              {Object.entries(
                expenses.reduce((acc, exp) => {
                  const cat = exp.category || 'Uncategorized';
                  acc[cat] = (acc[cat] || 0) + (exp.amount || 0);
                  return acc;
                }, {})
              ).map(([category, amount]) => (
                <div key={category} className="flex justify-between text-sm">
                  <span className="text-slate-600">{category}</span>
                  <span className="font-medium text-slate-900">${amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}