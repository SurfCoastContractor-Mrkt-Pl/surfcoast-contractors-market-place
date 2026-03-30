import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageCircle, FileUp, CheckCircle2, Edit3, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ACTIVITY_ICONS = {
  message: MessageCircle,
  file: FileUp,
  milestone: CheckCircle2,
  status: Edit3,
  delete: Trash2,
};

export default function ProjectActivityFeed({ scopeId }) {
  // Fetch all activity data
  const { data: messages = [] } = useQuery({
    queryKey: ['activity-messages', scopeId],
    queryFn: () => base44.entities.ProjectMessage.filter({ scope_id: scopeId }, '-created_date', 100),
  });

  const { data: files = [] } = useQuery({
    queryKey: ['activity-files', scopeId],
    queryFn: () => base44.entities.ProjectFile.filter({ scope_id: scopeId }, '-created_date', 100),
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['activity-milestones', scopeId],
    queryFn: () => base44.entities.ProjectMilestone.filter({ scope_id: scopeId }, '-created_date', 100),
  });

  // Combine and sort all activities
  const activities = useMemo(() => {
    const combined = [
      ...messages.map(m => ({
        id: m.id,
        type: 'message',
        timestamp: m.created_date,
        actor: m.sender_name,
        description: `Sent a message: "${m.message.substring(0, 50)}${m.message.length > 50 ? '...' : ''}"`,
        detail: m.sender_type,
      })),
      ...files.map(f => ({
        id: f.id,
        type: 'file',
        timestamp: f.created_date || f.uploaded_at,
        actor: f.uploaded_by,
        description: `Uploaded ${f.file_type === 'blueprint' ? 'blueprint' : f.file_type}: ${f.file_name}`,
        detail: f.file_type,
      })),
      ...milestones.map(m => ({
        id: m.id,
        type: 'milestone',
        timestamp: m.completed_at || m.created_date,
        actor: 'System',
        description: `${m.status === 'completed' ? 'Completed' : 'Added'} milestone: ${m.milestone_name}`,
        detail: m.status,
      })),
    ];

    return combined.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }, [messages, files, milestones]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Project Activity</h3>
      
      {activities.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">No activity yet</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => {
            const Icon = ACTIVITY_ICONS[activity.type] || MessageCircle;
            const isLast = index === activities.length - 1;

            return (
              <div key={activity.id} className="flex gap-4">
                {/* Timeline dot and line */}
                <div className="flex flex-col items-center pt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  {!isLast && <div className="w-0.5 h-12 bg-slate-200 mt-2" />}
                </div>

                {/* Activity content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {activity.actor}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
                      {activity.detail}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}