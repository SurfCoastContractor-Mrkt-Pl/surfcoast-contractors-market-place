import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, FileText, CheckSquare } from 'lucide-react';
import ProjectMessagePanel from '@/components/projects/ProjectMessagePanel';
import ProjectFileManager from '@/components/projects/ProjectFileManager';
import ProjectMilestoneTracker from '@/components/projects/ProjectMilestoneTracker';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';

/**
 * Phase 4 Collaboration Panel
 * Integrates messaging, file sharing, and milestone tracking for Wave FO projects
 * Tier-gated behind $50/month Communication subscription
 */
export default function Phase4CollaborationPanel({ scopeId, currentUserType }) {
  const { hasSubscription, loading } = useSubscriptionGate();
  const [activeTab, setActiveTab] = useState('messages');

  if (loading) {
    return (
      <div className="p-4 text-center text-slate-500">
        <p className="text-sm">Loading collaboration features...</p>
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
          <ProjectMessagePanel
            scopeId={scopeId}
            hasSubscription={hasSubscription}
            currentUserType={currentUserType}
          />
        </TabsContent>

        <TabsContent value="files">
          <ProjectFileManager
            scopeId={scopeId}
            hasSubscription={hasSubscription}
            isContractor={currentUserType === 'contractor'}
          />
        </TabsContent>

        <TabsContent value="milestones">
          <ProjectMilestoneTracker
            scopeId={scopeId}
            hasSubscription={hasSubscription}
            isContractor={currentUserType === 'contractor'}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}