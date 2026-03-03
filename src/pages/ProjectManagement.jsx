import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';

export default function ProjectManagement() {
  const [userType, setUserType] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['user-projects', userType],
    queryFn: async () => {
      if (!userType) return [];
      
      if (userType === 'contractor') {
        return base44.entities.ScopeOfWork.filter({ status: 'approved' }, '-created_date');
      } else {
        return base44.entities.ScopeOfWork.filter({ status: 'approved' }, '-created_date');
      }
    },
    enabled: !!userType
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'closed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'closed': return <CheckCircle2 className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (!userType) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Project Management</h1>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:border-amber-500 transition-colors" onClick={() => setUserType('contractor')}>
            <CardHeader>
              <CardTitle>🔧 Contractor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Manage your active projects and track milestones</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-amber-500 transition-colors" onClick={() => setUserType('customer')}>
            <CardHeader>
              <CardTitle>👤 Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Monitor contractor progress and share feedback</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          {userType === 'contractor' ? 'My Projects' : 'Hired Projects'}
        </h1>
        <Button variant="outline" onClick={() => setUserType(null)}>
          Switch Role
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-slate-500">Loading projects...</p>
        </div>
      ) : projects && projects.length > 0 ? (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {projects
              .filter(p => p.status !== 'closed')
              .map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={setSelectedProject}
                  userType={userType}
                />
              ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {projects
              .filter(p => p.status === 'closed')
              .map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={setSelectedProject}
                  userType={userType}
                />
              ))}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={setSelectedProject}
                userType={userType}
              />
            ))}
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            <p>No projects yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProjectCard({ project, onSelect, userType }) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelect(project)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{project.job_title}</CardTitle>
            <p className="text-sm text-slate-600 mt-1">{project.scope_summary}</p>
          </div>
          <Badge className={getStatusColor(project.status)}>
            {project.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-600">Cost</p>
            <p className="font-semibold">${project.cost_amount}</p>
          </div>
          <div>
            <p className="text-slate-600">Start Date</p>
            <p className="font-semibold">{format(new Date(project.agreed_work_date), 'MMM d')}</p>
          </div>
          <div>
            <p className="text-slate-600">{userType === 'contractor' ? 'Customer' : 'Contractor'}</p>
            <p className="font-semibold truncate">{userType === 'contractor' ? project.customer_name : project.contractor_name}</p>
          </div>
          <div>
            <p className="text-slate-600">Type</p>
            <p className="font-semibold">{project.cost_type}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}