import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import DisputeDetailModal from '@/components/disputes/DisputeDetailModal';

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  under_mediation: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-slate-100 text-slate-800',
  escalated: 'bg-red-100 text-red-800'
};

const severityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

export default function DisputeCenter() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Fetch disputes where user is initiator or respondent
        const userDisputes = await base44.entities.Dispute.filter({
          $or: [
            { initiator_email: currentUser.email },
            { respondent_email: currentUser.email }
          ]
        });

        setDisputes(userDisputes || []);
      } catch (error) {
        console.error('Error fetching disputes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredDisputes = disputes.filter(dispute => {
    if (filter === 'all') return true;
    return dispute.status === filter;
  });

  const handleSelectDispute = (dispute) => {
    setSelectedDispute(dispute);
    setShowDetail(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dispute Center</h1>
          <p className="text-slate-600">Track and manage all your disputes in one place</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'open', 'in_review', 'under_mediation', 'resolved', 'closed'].map(status => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="whitespace-nowrap"
            >
              {status === 'all' ? 'All Disputes' : status.replace(/_/g, ' ').toUpperCase()}
            </Button>
          ))}
        </div>

        {/* Disputes List */}
        {filteredDisputes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">
                {filter === 'all' 
                  ? 'You have no disputes yet' 
                  : `No disputes with status "${filter.replace(/_/g, ' ')}"`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDisputes.map(dispute => {
              const isInitiator = dispute.initiator_email === user?.email;
              const otherParty = isInitiator ? dispute.respondent_name : dispute.initiator_name;

              return (
                <Card 
                  key={dispute.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleSelectDispute(dispute)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">{dispute.title}</h3>
                          <Badge className={statusColors[dispute.status]}>
                            {dispute.status.replace(/_/g, ' ')}
                          </Badge>
                          <Badge className={severityColors[dispute.severity]}>
                            {dispute.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{dispute.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          <span>
                            <span className="font-medium">Category:</span> {dispute.category.replace(/_/g, ' ')}
                          </span>
                          <span>
                            <span className="font-medium">Other Party:</span> {otherParty}
                          </span>
                          {dispute.job_title && (
                            <span>
                              <span className="font-medium">Job:</span> {dispute.job_title}
                            </span>
                          )}
                          <span>
                            <span className="font-medium">Filed:</span> {new Date(dispute.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDispute && (
        <DisputeDetailModal
          dispute={selectedDispute}
          open={showDetail}
          onClose={() => setShowDetail(false)}
          currentUser={user}
          onDisputeUpdated={(updated) => {
            setDisputes(disputes.map(d => d.id === updated.id ? updated : d));
            setSelectedDispute(updated);
          }}
        />
      )}
    </div>
  );
}