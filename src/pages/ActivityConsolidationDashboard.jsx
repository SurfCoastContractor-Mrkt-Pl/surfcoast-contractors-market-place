import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Trash2, RefreshCw, Filter } from 'lucide-react';

export default function ActivityConsolidationDashboard() {
  const [activities, setActivities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterEmail, setFilterEmail] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const marketShops = await base44.entities.MarketShop.list();
      const jobs = await base44.entities.Job.list();
      
      // Consolidate by email
      const consolidated = {};
      
      marketShops.forEach(shop => {
        const email = shop.email;
        if (!consolidated[email]) consolidated[email] = { email, marketShops: [], jobs: [], other: [] };
        consolidated[email].marketShops.push(shop);
      });
      
      jobs.forEach(job => {
        const email = job.poster_email;
        if (!consolidated[email]) consolidated[email] = { email, marketShops: [], jobs: [], other: [] };
        consolidated[email].jobs.push(job);
      });
      
      setActivities(consolidated);
      setError(null);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMarketShop = async (shopId) => {
    if (!confirm('Delete this market shop?')) return;
    try {
      await base44.entities.MarketShop.delete(shopId);
      await loadActivities();
    } catch (err) {
      setError('Failed to delete market shop');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Delete this job?')) return;
    try {
      await base44.entities.Job.delete(jobId);
      await loadActivities();
    } catch (err) {
      setError('Failed to delete job');
    }
  };

  const filteredActivities = Object.values(activities).filter(account => 
    !filterEmail || account.email.includes(filterEmail)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Activity Consolidation Dashboard</h1>
            <p className="text-slate-600 mt-2">
              View and manage all user activities consolidated by email account.
            </p>
          </div>
          <Button onClick={loadActivities} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {/* Error banner */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </CardContent>
          </Card>
        )}

        {/* Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Filter by email..."
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              {filterEmail && (
                <Button onClick={() => setFilterEmail('')} variant="ghost" size="sm">
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activities by account */}
        <div className="space-y-6">
          {filteredActivities.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-slate-600">No activities found.</p>
              </CardContent>
            </Card>
          ) : (
            filteredActivities.map((account) => (
              <Card key={account.email}>
                <CardHeader className="bg-slate-50 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{account.email}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        {account.marketShops.length} market shops, {account.jobs.length} jobs
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {/* Market Shops */}
                  {account.marketShops.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Market Shops ({account.marketShops.length})</h3>
                      <div className="space-y-2">
                        {account.marketShops.map((shop) => (
                          <div key={shop.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                            <div>
                              <p className="font-medium text-slate-900">{shop.data.shop_name}</p>
                              <p className="text-sm text-slate-600">
                                Status: <span className={`font-semibold ${shop.data.status === 'suspended' ? 'text-red-600' : 'text-yellow-600'}`}>
                                  {shop.data.status}
                                </span> • {shop.data.shop_type}
                              </p>
                            </div>
                            <Button
                              onClick={() => handleDeleteMarketShop(shop.id)}
                              variant="destructive"
                              size="sm"
                              className="gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Jobs */}
                  {account.jobs.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Jobs ({account.jobs.length})</h3>
                      <div className="space-y-2">
                        {account.jobs.map((job) => (
                          <div key={job.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                            <div>
                              <p className="font-medium text-slate-900">{job.data.title}</p>
                              <p className="text-sm text-slate-600">
                                Location: {job.data.location} • Status: {job.data.status}
                              </p>
                            </div>
                            <Button
                              onClick={() => handleDeleteJob(job.id)}
                              variant="destructive"
                              size="sm"
                              className="gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}