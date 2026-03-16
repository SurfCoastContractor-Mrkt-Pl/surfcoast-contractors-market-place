import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Plus, MapPin, DollarSign, Users, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import CustomerJobsManager from '@/components/customer/CustomerJobsManager';

export default function MyJobs() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);
  const [isContractor, setIsContractor] = useState(null);

  // Check if user is contractor
  useEffect(() => {
    const checkUserType = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }
        setUserEmail(user.email);
        const contractors = await base44.entities.Contractor.filter({ email: user.email });
        setIsContractor(contractors && contractors.length > 0);
      } catch (error) {
        console.error('Error checking user type:', error);
      }
    };
    checkUserType();
  }, []);

  // Fetch posted jobs
  const { data: postedJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['my-jobs', userEmail],
    queryFn: () => userEmail ? base44.entities.Job.filter({ poster_email: userEmail }, '-created_date') : Promise.resolve([]),
    enabled: !!userEmail && !isContractor,
  });

  const activeJobs = useMemo(() => 
    postedJobs?.filter(j => j.status === 'open') || [], 
    [postedJobs]
  );

  const closedJobs = useMemo(() => 
    postedJobs?.filter(j => j.status !== 'open') || [], 
    [postedJobs]
  );

  if (isContractor === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (isContractor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Customers Only</h2>
          <p className="text-slate-600 mb-6">This section is for customers who post jobs. Contractors can browse jobs from the Jobs page.</p>
          <Button onClick={() => navigate(createPageUrl('Jobs'))} className="bg-amber-500 hover:bg-amber-600">
            Browse Jobs
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Job Postings</h1>
              <p className="text-lg text-slate-300">Manage and track your posted jobs</p>
            </div>
            <Button onClick={() => navigate(createPageUrl('PostJob'))} size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Plus className="w-5 h-5 mr-2" />
              Post New Job
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {jobsLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (postedJobs?.length || 0) === 0 ? (
          <Card className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Jobs Posted Yet</h3>
            <p className="text-slate-600 mb-6">Start by posting your first job to connect with contractors</p>
            <Button onClick={() => navigate(createPageUrl('PostJob'))} className="bg-amber-500 hover:bg-amber-600">
              Post Your First Job
            </Button>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="active">
                Active Jobs ({activeJobs.length})
              </TabsTrigger>
              <TabsTrigger value="closed">
                Closed ({closedJobs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeJobs.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-slate-600">No active jobs</p>
                </Card>
              ) : (
                activeJobs.map(job => (
                  <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{job.title}</h3>
                        <p className="text-slate-600 line-clamp-2 mb-3">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-3 mb-4 text-sm">
                          <div className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1 text-slate-600">
                            <DollarSign className="w-4 h-4" />
                            ${job.budget_min?.toLocaleString()} - ${job.budget_max?.toLocaleString()}
                          </div>
                        </div>

                        <Badge variant="secondary">{job.urgency} urgency</Badge>
                      </div>

                      <Button 
                        onClick={() => navigate(createPageUrl(`JobDetails?id=${job.id}`))}
                        variant="outline"
                        className="text-amber-600 border-amber-600 hover:bg-amber-50"
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="closed" className="space-y-4">
              {closedJobs.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-slate-600">No closed jobs</p>
                </Card>
              ) : (
                closedJobs.map(job => (
                  <Card key={job.id} className="p-6 opacity-75">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{job.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{job.status}</Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}