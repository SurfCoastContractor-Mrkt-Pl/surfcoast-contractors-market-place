import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus, ArrowLeft } from 'lucide-react';
import ExpenseForm from '@/components/fieldops/ExpenseForm';
import ExpenseSummary from '@/components/fieldops/ExpenseSummary';

export default function JobExpenseTracker() {
  const [searchParams] = useSearchParams();
  const scopeId = searchParams.get('scopeId');
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Fetch scope
  const { data: scope, isLoading: scopeLoading } = useQuery({
    queryKey: ['scope', scopeId],
    queryFn: async () => {
      if (!scopeId) return null;
      const scopes = await base44.entities.ScopeOfWork.filter({ id: scopeId });
      return scopes?.[0] || null;
    },
    enabled: !!scopeId,
  });

  // Fetch contractor
  const { data: contractor } = useQuery({
    queryKey: ['contractor', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const contractors = await base44.entities.Contractor.filter({ email: user.email });
      return contractors?.[0];
    },
    enabled: !!user?.email,
  });

  // Fetch expenses
  const { data: expenses = [], refetch: refetchExpenses } = useQuery({
    queryKey: ['expenses', scopeId],
    queryFn: async () => {
      if (!scopeId) return [];
      return await base44.entities.JobExpense.filter({ scope_id: scopeId }, '-created_date');
    },
    enabled: !!scopeId,
  });

  if (!scopeId) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">No job selected. Please select a scope from your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  if (scopeLoading || !user || !contractor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!scope) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">Job not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const isContractor = scope.contractor_email === user?.email;

  if (!isContractor) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">Only the contractor can track expenses for this job.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/FieldOps" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Field Ops
          </a>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{scope.job_title}</h1>
          <p className="text-slate-600">Customer: {scope.customer_name}</p>
        </div>

        {/* Add Expense Button */}
        {!showForm && (
          <div className="mb-8">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-8">
            <ExpenseForm
              scope={scope}
              contractor={contractor}
              onSave={() => {
                refetchExpenses();
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Summary & List */}
        <ExpenseSummary
          expenses={expenses}
          scope={scope}
          onExpenseDeleted={refetchExpenses}
        />
      </div>
    </div>
  );
}