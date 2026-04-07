import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus, ArrowLeft } from 'lucide-react';
import ExpenseForm from '@/components/fieldops/ExpenseForm';
import ExpenseSummary from '@/components/fieldops/ExpenseSummary';
import LowStockNotifications from '@/components/contractor/LowStockNotifications';

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

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  if (!scopeId) {
    return (
      <div style={{ minHeight: "100vh", padding: 24, background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 8, background: "#FFEBEE", border: "0.5px solid #EF5350" }}>
            <AlertCircle style={{ width: 20, height: 20, color: "#d32f2f", flexShrink: 0 }} />
            <p style={{ color: "#c62828", fontStyle: "italic" }}>No job selected. Please select a scope from your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  if (scopeLoading || !user || !contractor) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #D0D0D2", borderTop: "3px solid " + T.dark, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!scope) {
    return (
      <div style={{ minHeight: "100vh", padding: 24, background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 8, background: "#FFEBEE", border: "0.5px solid #EF5350" }}>
            <AlertCircle style={{ width: 20, height: 20, color: "#d32f2f", flexShrink: 0 }} />
            <p style={{ color: "#c62828", fontStyle: "italic" }}>Job not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const isContractor = scope.contractor_email === user?.email;

  if (!isContractor) {
    return (
      <div style={{ minHeight: "100vh", padding: 24, background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 8, background: "#FFEBEE", border: "0.5px solid #EF5350" }}>
            <AlertCircle style={{ width: 20, height: 20, color: "#d32f2f", flexShrink: 0 }} />
            <p style={{ color: "#c62828", fontStyle: "italic" }}>Only the contractor can track expenses for this job.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: 24, background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <LowStockNotifications contractorEmail={user?.email} />
      <div style={{ maxWidth: 896, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <a href="/FieldOps" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: T.amber, textDecoration: "none", marginBottom: 16, fontStyle: "italic" }}>
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Back to Field Ops
          </a>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.4rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>{scope.job_title}</h1>
          <p style={{ color: T.muted, fontStyle: "italic" }}>Customer: {scope.customer_name}</p>
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