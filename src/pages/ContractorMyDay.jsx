import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, Clock, AlertCircle, CheckCircle, MapPin, DollarSign, Zap } from 'lucide-react';
import moment from 'moment';

export default function ContractorMyDay() {
  const [todayJobs, setTodayJobs] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const contractors = await base44.entities.Contractor.filter({
          email: currentUser.email
        });
        
        if (contractors && contractors.length > 0) {
          setContractor(contractors[0]);

          // Fetch all scopes for this contractor
          const scopes = await base44.entities.ScopeOfWork.filter({
            contractor_email: currentUser.email
          });

          const today = moment().format('YYYY-MM-DD');
          
          // Filter for today's jobs
          const todaysJobs = scopes.filter(s => s.agreed_work_date === today);
          setTodayJobs(todaysJobs || []);

          // Filter for pending/incomplete tasks
          const pending = scopes.filter(s => 
            ['pending_approval', 'approved', 'pending_ratings'].includes(s.status)
          );
          setPendingTasks(pending || []);
        }
      } catch (error) {
        console.error('Failed to load my day data:', error);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const totalEarningsToday = todayJobs.reduce((sum, job) => sum + (job.cost_amount || 0), 0);
  const completedToday = todayJobs.filter(j => j.status === 'closed').length;

  return (
    <div className="min-h-screen bg-gradient-soft pb-12">
      {/* Header */}
      <div className="bg-gradient-hero text-white p-6">
        <h1 className="text-3xl font-bold mb-2">My Day</h1>
        <p className="text-blue-100">{moment().format('MMMM D, YYYY')}</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-500 uppercase">Today's Jobs</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{todayJobs.length}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-slate-500 uppercase">Completed</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{completedToday}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-500 uppercase">Potential Earnings</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">${totalEarningsToday.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-semibold text-slate-500 uppercase">Status</span>
            </div>
            <p className="text-lg font-bold text-slate-800 capitalize">{contractor?.availability_status || 'Available'}</p>
          </div>
        </div>

        {/* Today's Jobs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Today's Schedule</h2>
          {todayJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No jobs scheduled for today</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {todayJobs.map(job => (
                <div key={job.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{job.job_title}</h3>
                      <p className="text-slate-500 text-sm">{job.client_name}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      job.status === 'closed' ? 'bg-green-100 text-green-700' :
                      job.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {job.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-4">{job.scope_summary}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{moment(job.agreed_work_date).format('hh:mm A')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 font-semibold">${job.cost_amount?.toLocaleString()}</span>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Pending Tasks</h2>
          {pendingTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">All caught up!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {pendingTasks.map(task => (
                <div key={task.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{task.job_title}</p>
                    <p className="text-sm text-slate-500 capitalize">{task.status.replace(/_/g, ' ')}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {moment(task.created_date).fromNow()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}