import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function LeadManagementDashboard({ contractorEmail }) {
  const { data: scopes = [] } = useQuery({
    queryKey: ['contractorScopes', contractorEmail],
    queryFn: () => base44.entities.ScopeOfWork.filter({ contractor_email: contractorEmail }, '-created_at'),
    enabled: !!contractorEmail
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ['contractorQuotes', contractorEmail],
    queryFn: () => base44.entities.QuoteRequest.filter({ contractor_email: contractorEmail }, '-created_at'),
    enabled: !!contractorEmail
  });

  const pipeline = useMemo(() => {
    const stages = {
      new: { label: 'New Leads', icon: Clock, color: 'bg-blue-50 border-blue-200', items: [] },
      contacted: { label: 'Contacted', icon: MessageSquare, color: 'bg-purple-50 border-purple-200', items: [] },
      quoted: { label: 'Quoted', icon: Eye, color: 'bg-amber-50 border-amber-200', items: [] },
      won: { label: 'Won', icon: CheckCircle, color: 'bg-green-50 border-green-200', items: [] },
      lost: { label: 'Lost', icon: XCircle, color: 'bg-red-50 border-red-200', items: [] }
    };

    // Add scopes to pipeline
    scopes.forEach(scope => {
      const stageKey = scope.status === 'pending_approval' ? 'new' 
                     : scope.status === 'approved' ? 'quoted' 
                     : scope.status === 'closed' ? 'won' 
                     : scope.status === 'rejected' ? 'lost' 
                     : 'new';
      
      if (stages[stageKey]) {
        stages[stageKey].items.push({
          id: scope.id,
          title: scope.job_title,
          name: scope.customer_name,
          email: scope.customer_email,
          amount: scope.cost_amount,
          type: 'scope',
          date: scope.created_at,
          status: scope.status
        });
      }
    });

    return stages;
  }, [scopes]);

  const stats = {
    total: scopes.length + quotes.length,
    new: pipeline.new.items.length,
    quoted: pipeline.quoted.items.length,
    won: pipeline.won.items.length,
    conversion: scopes.length > 0 ? Math.round((pipeline.won.items.length / scopes.length) * 100) : 0
  };

  const StageColumn = ({ stage }) => {
    const Icon = stage.icon;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-5 h-5" />
          <h3 className="font-semibold text-slate-900">{stage.label}</h3>
          <Badge variant="outline" className="ml-auto">{stage.items.length}</Badge>
        </div>
        <div className="space-y-2">
          {stage.items.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No leads</p>
          ) : (
            stage.items.map(item => (
              <Card key={item.id} className={`p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 ${
                stage.color.includes('blue') ? 'border-l-blue-400' :
                stage.color.includes('purple') ? 'border-l-purple-400' :
                stage.color.includes('amber') ? 'border-l-amber-400' :
                stage.color.includes('green') ? 'border-l-green-400' :
                'border-l-red-400'
              }`}>
                <p className="font-medium text-sm text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-600">{item.name}</p>
                {item.amount && (
                  <p className="text-sm font-semibold text-slate-900 mt-2">${item.amount}</p>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <p className="text-xs text-slate-600 mt-1">Total Opportunities</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          <p className="text-xs text-slate-600 mt-1">New Leads</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.quoted}</div>
          <p className="text-xs text-slate-600 mt-1">Awaiting Decision</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.won}</div>
          <p className="text-xs text-slate-600 mt-1">Closed</p>
        </Card>
      </div>

      {/* Pipeline View */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.values(pipeline).map((stage, idx) => (
            <StageColumn key={idx} stage={stage} />
          ))}
        </div>
      </Card>

      {/* Conversion Rate */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Conversion Rate</p>
            <p className="text-3xl font-bold text-slate-900">{stats.conversion}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">{pipeline.won.items.length} of {stats.total} Closed</p>
          </div>
        </div>
      </Card>
    </div>
  );
}