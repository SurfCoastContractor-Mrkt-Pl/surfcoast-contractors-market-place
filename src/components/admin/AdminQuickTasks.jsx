import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, Zap } from 'lucide-react';
import ComprehensiveTestPanel from './ComprehensiveTestPanel';

export default function AdminQuickTasks() {
  const [expandedTask, setExpandedTask] = useState(null);

  const tasks = [
    {
      id: 'comprehensive-test',
      label: 'Run Comprehensive Test Suite',
      description: 'Execute all possible functions as a user, test every function on user profiles, simulate communication between users and admin to identify issues, bugs, and fix varieties of problems',
      icon: Zap,
      component: ComprehensiveTestPanel,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Quick Admin Tasks
      </div>

      {tasks.map((task) => {
        const Icon = task.icon;
        const isExpanded = expandedTask === task.id;
        const TaskComponent = task.component;

        return (
          <div key={task.id}>
            <Button
              variant="outline"
              onClick={() =>
                setExpandedTask(isExpanded ? null : task.id)
              }
              className="w-full justify-between text-left h-auto p-3"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium">{task.label}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </Button>

            {isExpanded && (
              <div className="mt-2 animate-in fade-in-50 slide-in-from-top-2">
                <TaskComponent />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}