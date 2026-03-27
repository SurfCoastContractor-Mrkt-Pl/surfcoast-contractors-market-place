import React from 'react';
import { Card } from '@/components/ui/card';
import { DollarSign, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ExpenseSummary({ expenses, scope, onExpenseDeleted }) {
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const scopePayout = scope.contractor_payout_amount || 0;
  const netProfit = scopePayout - totalExpenses;

  const handleDelete = async (expenseId) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await base44.entities.JobExpense.delete(expenseId);
      onExpenseDeleted();
    } catch (error) {
      alert('Failed to delete expense');
    }
  };

  const expenseTypeLabels = {
    materials: '🛠️ Materials',
    travel: '🚗 Travel',
    equipment_rental: '🏗️ Equipment Rental',
    subcontractor: '👷 Subcontractor',
    other: '📋 Other',
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-slate-600 mb-1">Job Payout</p>
          <p className="text-3xl font-bold text-blue-900">${scopePayout.toFixed(2)}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100">
          <p className="text-sm text-slate-600 mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-red-900">${totalExpenses.toFixed(2)}</p>
        </Card>
        <Card className={`p-4 bg-gradient-to-br ${netProfit >= 0 ? 'from-green-50 to-green-100' : 'from-orange-50 to-orange-100'}`}>
          <p className="text-sm text-slate-600 mb-1">Net Profit</p>
          <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-900' : 'text-orange-900'}`}>
            ${netProfit.toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Expense List */}
      {expenses.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Description</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Amount</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">Receipt</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">{expenseTypeLabels[expense.expense_type]}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{expense.description}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-slate-900">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {expense.receipt_url ? (
                        <a
                          href={expense.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500">No expenses logged yet</p>
        </Card>
      )}
    </div>
  );
}