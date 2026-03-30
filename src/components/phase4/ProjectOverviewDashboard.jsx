import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DollarSign, FileText, MessageSquare, CheckCircle2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProjectOverviewDashboard({ scope }) {
  // Fetch milestones
  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones', scope.id],
    queryFn: () => base44.entities.ProjectMilestone.filter({ scope_id: scope.id }),
  });

  // Fetch files
  const { data: files = [] } = useQuery({
    queryKey: ['files', scope.id],
    queryFn: () => base44.entities.ProjectFile.filter({ scope_id: scope.id }),
  });

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', scope.id],
    queryFn: () => base44.entities.ProjectMessage.filter({ scope_id: scope.id }),
  });

  // Calculate stats
  const stats = useMemo(() => {
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const completionPercent = milestones.length > 0 
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 0;
    
    return {
      completedMilestones,
      totalMilestones: milestones.length,
      completionPercent,
      filesCount: files.length,
      messagesCount: messages.length,
    };
  }, [milestones, files, messages]);

  const totalCost = scope.cost_type === 'fixed' 
    ? scope.cost_amount 
    : (scope.estimated_hours || 0) * (scope.cost_amount || 0);

  return (
    <div className="space-y-6">
      {/* Cost & Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Project Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">
              {scope.cost_type === 'fixed' ? 'Fixed Price' : `${scope.estimated_hours}h @ $${scope.cost_amount}/h`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Work Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {scope.agreed_work_date 
                ? new Date(scope.agreed_work_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'Not Set'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900">
              {scope.status.replace('_', ' ').toUpperCase()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress & Activity Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl font-bold text-slate-900">{stats.completedMilestones}/{stats.totalMilestones}</div>
              <span className="text-sm font-semibold text-slate-600">{stats.completionPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all" 
                style={{ width: `${stats.completionPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.filesCount}</div>
            <p className="text-xs text-slate-500 mt-1">documents & photos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.messagesCount}</div>
            <p className="text-xs text-slate-500 mt-1">total exchanges</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}