import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, FileText, CheckSquare, AlertCircle } from 'lucide-react';
import ProjectMessagePanel from '@/components/projects/ProjectMessagePanel';
import ProjectFileManager from '@/components/projects/ProjectFileManager';
import ProjectMilestoneTracker from '@/components/projects/ProjectMilestoneTracker';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import Phase4ErrorBoundary from './Phase4ErrorBoundary';

/**
 * Phase 4 Collaboration Panel
 * Integrates messaging, file sharing, and milestone tracking for Wave FO projects
 * Tier-gated behind $50/month Communication subscription
 */
export default function Phase4CollaborationPanel({ scopeId, currentUserType }) {
  const { hasSubscription, loading, error } = useSubscriptionGate();
  const [activeTab, setActiveTab] = useState('messages');

  if (loading) {
    return (
      <div className="p-4 text-center text-slate-500">
        <div className="inline-block w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mb-2" />
        <p className="text-sm">Loading collaboration features...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Messages</span>
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Files</span>
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Milestones</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <Phase4ErrorBoundary>
            <ProjectMessagePanel
              scopeId={scopeId}
              hasSubscription={hasSubscription}
              currentUserType={currentUserType}
            />
          </Phase4ErrorBoundary>
        </TabsContent>

        <TabsContent value="files">
          <Phase4ErrorBoundary>
            <ProjectFileManager
              scopeId={scopeId}
              hasSubscription={hasSubscription}
              isContractor={currentUserType === 'contractor'}
            />
          </Phase4ErrorBoundary>
        </TabsContent>

        <TabsContent value="milestones">
          <Phase4ErrorBoundary>
            <ProjectMilestoneTracker
              scopeId={scopeId}
              hasSubscription={hasSubscription}
              isContractor={currentUserType === 'contractor'}
            />
          </Phase4ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}