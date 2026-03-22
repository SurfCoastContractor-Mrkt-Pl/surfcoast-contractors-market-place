import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Zap, Brain, MessageSquare, Clock, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const AUTOMATION_TOOLS = [
  {
    id: 'auto-quote',
    name: 'Auto-Quote Generator',
    description: 'Automatically generate quote responses based on job description',
    icon: Sparkles,
    enabled: false,
    status: 'beta',
  },
  {
    id: 'smart-match',
    name: 'Smart Job Matching',
    description: 'AI matches you with jobs based on specialty and location',
    icon: Brain,
    enabled: false,
    status: 'active',
  },
  {
    id: 'auto-follow',
    name: 'Auto Follow-up',
    description: 'Send automatic follow-up messages to pending quotes',
    icon: MessageSquare,
    enabled: false,
    status: 'active',
  },
  {
    id: 'schedule-opt',
    name: 'Schedule Optimizer',
    description: 'AI suggests optimal times to accept jobs based on availability',
    icon: Clock,
    enabled: false,
    status: 'active',
  },
];

export default function AutomationAndSmartTools({ contractorId, contractorEmail }) {
  const [selectedTool, setSelectedTool] = useState(null);
  const [automationSettings, setAutomationSettings] = useState({});
  const queryClient = useQueryClient();

  const { data: contractor } = useQuery({
    queryKey: ['contractor-automation', contractorId],
    queryFn: () => base44.entities.Contractor.filter({ email: contractorEmail }),
    enabled: !!contractorId && !!contractorEmail,
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Contractor.update(contractorId, {
        automation_settings: { ...automationSettings, ...data },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-automation', contractorId] });
    },
  });

  const handleToggle = (toolId) => {
    const newSettings = {
      ...automationSettings,
      [toolId]: !automationSettings[toolId],
    };
    setAutomationSettings(newSettings);
    updateMutation.mutate({ [toolId]: newSettings[toolId] });
  };

  const generateQuoteAI = async (jobDescription) => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `As a professional ${contractor?.[0]?.line_of_work || 'contractor'}, generate a professional quote response for this job: "${jobDescription}". Include scope summary, timeline, and pricing framework.`,
        add_context_from_internet: false,
      });
      return response;
    } catch (error) {
      console.error('Quote generation failed:', error);
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Automation Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {AUTOMATION_TOOLS.map(tool => {
          const Icon = tool.icon;
          const isEnabled = automationSettings[tool.id] || tool.enabled;

          return (
            <Card key={tool.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{tool.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{tool.description}</p>
                  </div>
                </div>
                <Badge className={isEnabled ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                  {isEnabled ? 'On' : 'Off'}
                </Badge>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  {tool.status === 'beta' && <Badge variant="outline" className="text-xs">Beta</Badge>}
                  {tool.status === 'active' && <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>}
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => handleToggle(tool.id)}
                  disabled={updateMutation.isPending}
                />
              </div>

              {tool.id === 'auto-quote' && isEnabled && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mt-3 text-xs">
                      Preview AI Quote
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>AI Quote Preview</DialogTitle>
                      <DialogDescription>See how AI generates your quotes</DialogDescription>
                    </DialogHeader>
                    <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 space-y-2">
                      <p><strong>Sample Job:</strong> Kitchen remodeling with new cabinets and countertops</p>
                      <p><strong>AI Generated Quote:</strong></p>
                      <div className="p-3 bg-white rounded border border-slate-200 text-xs">
                        <p>Thank you for the opportunity! Based on the scope described (full kitchen remodeling with new cabinets and countertops), here's my professional assessment:</p>
                        <p className="mt-2"><strong>Scope:</strong> Cabinet replacement, countertop installation, finishing work</p>
                        <p className="mt-2"><strong>Timeline:</strong> 2-3 weeks depending on material availability</p>
                        <p className="mt-2"><strong>Pricing:</strong> Quote varies by specifications — I'll provide detailed estimate after site visit</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </Card>
          );
        })}
      </div>

      {/* Smart Tools Explainer */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex gap-4">
          <Zap className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">What are Smart Tools?</h3>
            <p className="text-sm text-slate-700 mb-3">
              Smart Tools use artificial intelligence to streamline your workflow and help you manage more jobs efficiently.
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>✅ <strong>Auto-Quote Generator:</strong> AI drafts professional quotes for incoming jobs — you review and send</li>
              <li>✅ <strong>Smart Job Matching:</strong> Get notified of jobs that match your specialty before others</li>
              <li>✅ <strong>Auto Follow-up:</strong> Automatically send friendly reminders on quotes awaiting response</li>
              <li>✅ <strong>Schedule Optimizer:</strong> Suggestions for best times to take on new work</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Activity Log */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Recent Automation Activity</h3>
        <div className="space-y-3">
          {[
            { time: '2 hours ago', action: 'Auto-Quote generated for Kitchen Remodeling job', status: 'sent' },
            { time: '5 hours ago', action: 'Smart Match: New electrical work job recommended', status: 'pending' },
            { time: '1 day ago', action: 'Auto Follow-up sent to pending Bathroom Renovation quote', status: 'sent' },
          ].map((log, idx) => (
            <div key={idx} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-900">{log.action}</p>
                <p className="text-xs text-slate-500 mt-1">{log.time}</p>
              </div>
              <Badge className={log.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                {log.status === 'sent' ? 'Sent' : 'Pending'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Settings Info */}
      <Card className="p-4 bg-green-50 border border-green-200">
        <p className="text-xs text-green-800">
          <strong>💡 Tip:</strong> Enable multiple automation tools to work together — they're designed to complement each other and save you time.
        </p>
      </Card>
    </div>
  );
}