import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';

export default function ClientPortal() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accessData, setAccessData] = useState(null);
  const [scopes, setScopes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const result = await base44.functions.invoke('verifyClientPortalToken', { token });
        const { access, scopes: fetchedScopes } = result.data;
        setAccessData(access);
        setScopes(fetchedScopes || []);
        setLoading(false);
      } catch (err) {
        console.error('Error verifying access:', err);
        setError('Invalid or expired portal access');
        setLoading(false);
      }
    };

    verifyAccess();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'closed': return 'bg-green-100 text-green-700';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      case 'approved': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Your Project Dashboard</h1>
          <p className="text-slate-600">View all your current and past projects at a glance</p>
        </div>

        {scopes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-slate-500">No projects found yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {scopes.map((scope) => (
              <Card key={scope.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{scope.job_title}</CardTitle>
                      <p className="text-sm text-slate-500 mt-1">With {scope.contractor_name}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(scope.status)}`}>
                      {getStatusIcon(scope.status)}
                      {scope.status.replace(/_/g, ' ')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Cost</p>
                      <p className="text-xl font-semibold text-slate-900 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {scope.cost_amount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Expected Completion</p>
                      <p className="text-slate-900">{new Date(scope.expected_completion_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {scope.scope_summary && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Scope Details</p>
                      <p className="text-slate-700">{scope.scope_summary}</p>
                    </div>
                  )}

                  {scope.after_photo_urls && scope.after_photo_urls.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Project Photos</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {scope.after_photo_urls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Project photo ${idx + 1}`}
                            className="w-full h-24 object-cover rounded border border-slate-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      window.location.href = `mailto:${scope.contractor_email}?subject=Question about ${scope.job_title}`;
                    }}
                    className="w-full mt-2"
                  >
                    Contact {scope.contractor_name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}