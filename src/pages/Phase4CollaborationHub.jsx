import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, FileText, CheckSquare, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectChatPanel from '@/components/phase4/ProjectChatPanel';
import ProjectMilestonesTracker from '@/components/phase4/ProjectMilestonesTracker';
import ProjectFileManager from '@/components/phase4/ProjectFileManager';

const TABS = [
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'milestones', label: 'Milestones', icon: CheckSquare },
  { id: 'files', label: 'Files', icon: FileText },
];

export default function Phase4CollaborationHub() {
  const [user, setUser] = useState(null);
  const [isContractor, setIsContractor] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [scopeId, setScopeId] = useState(null);
  const [scope, setScope] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get scope ID from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('scope_id');
    setScopeId(id);
  }, []);

  // Fetch user and scope data
  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);

        if (scopeId) {
          const scopes = await base44.entities.ScopeOfWork.filter(
            { id: scopeId }
          );
          if (scopes?.length) {
            setScope(scopes[0]);
            setIsContractor(me.email === scopes[0].contractor_email);
          }
        }
      } catch {
        setIsContractor(false);
      }
      setIsLoading(false);
    };
    init();
  }, [scopeId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user || !scope) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Project Not Found</h1>
          <p className="text-slate-600">The project you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{scope.job_title}</h1>
              <p className="text-sm text-slate-600 mt-1">
                {isContractor ? `Client: ${scope.client_name}` : `Contractor: ${scope.contractor_name}`}
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-900">
                {scope.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="chat" className="mt-0">
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden" style={{ height: '600px' }}>
              <ProjectChatPanel
                scopeId={scope.id}
                userEmail={user.email}
                userType={isContractor ? 'contractor' : 'client'}
              />
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="mt-0">
            <ProjectMilestonesTracker
              scopeId={scope.id}
              contractorEmail={scope.contractor_email}
              isContractor={isContractor}
            />
          </TabsContent>

          <TabsContent value="files" className="mt-0">
            <ProjectFileManager scopeId={scope.id} userEmail={user.email} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}