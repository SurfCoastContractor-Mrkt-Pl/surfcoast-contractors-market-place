import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus, Briefcase } from 'lucide-react';
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <CustomerJobsManager userEmail={userEmail} />
        </Card>
      </div>
    </div>
  );
}