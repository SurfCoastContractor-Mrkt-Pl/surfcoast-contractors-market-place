import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

const CATEGORIES = ['Materials', 'Labor', 'Equipment', 'Transportation', 'Other'];

export default function ExpenseLogger({ scopeId, expenses = [], onExpenseAdded }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Materials');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (expenseData) => {
      // Would create expense record in database
      // For now, calling onExpenseAdded callback
      return expenseData;
    },
    onSuccess: (newExpense) => {
      onExpenseAdded?.(newExpense);
      setDescription('');
      setAmount('');
      setCategory('Materials');
      setDate(new Date().toISOString().split('T')[0]);
    },
  });

  const handleAddExpense = async () => {
    if (!description || !amount) {
      alert('Please fill in all fields');
      return;
    }

    createMutation.mutate({
      scope_id: scopeId,
      description,
      amount: parseFloat(amount),
      category,
      date,
      created_at: new Date().toISOString(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Expense</CardTitle>
        <CardDescription>Track project costs and spending</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Fields */}
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={createMutation.isPending}
            className="w-full"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder="Amount ($)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={createMutation.isPending}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
              disabled={createMutation.isPending}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={createMutation.isPending}
          />

          <Button
            onClick={handleAddExpense}
            disabled={!description || !amount || createMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Add Expense
          </Button>
        </div>

        {/* Expenses List */}
        {expenses.length > 0 && (
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Recent Expenses</h4>
            {expenses.slice(-5).map((expense, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {expense.description}
                  </p>
                  <p className="text-xs text-slate-500">
                    {expense.category} • {format(new Date(expense.date || expense.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-900 ml-2 flex-shrink-0">
                  ${parseFloat(expense.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}