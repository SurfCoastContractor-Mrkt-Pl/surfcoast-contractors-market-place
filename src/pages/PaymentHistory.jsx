import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, DollarSign, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function PaymentHistory() {
  const [searchEmail, setSearchEmail] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user
  const [userError, setUserError] = React.useState(null);
  
  React.useEffect(() => {
    const getUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUserError('Failed to load user data');
      }
    };
    getUser();
  }, []);

  // Fetch payments with server-side filtering
  const { data: payments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['payment-history', searchEmail, statusFilter, sortBy],
    queryFn: async () => {
      const query = {};
      
      // Filter by email if searching
      if (searchEmail.trim()) {
        query.payer_email = searchEmail.trim();
      } else if (currentUser?.email) {
        // Show current user's payments by default
        query.payer_email = currentUser.email;
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        query.status = statusFilter;
      }

      // Fetch with server-side filter
      const filtered = await base44.entities.Payment.filter(query, sortBy === 'recent' ? '-created_date' : sortBy === 'amount-high' ? '-amount' : 'amount', 1000);
      
      return filtered || [];
    },
    enabled: !!currentUser,
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      case 'work_scheduled':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4" />;
      case 'disputed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (userError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-700 font-medium mb-4">{userError}</p>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment History</h1>
          <p className="text-slate-600">View and track all your platform payments and transactions</p>
        </div>

        {/* Filters Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Search by Email</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="payer@example.com"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="work_scheduled">Work Scheduled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
                    <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">Failed to load payments. Please try again.</p>
            </CardContent>
          </Card>
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-slate-600">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>No payments found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600 mb-1">Total Transactions</p>
                  <p className="text-2xl font-bold text-slate-900">{payments.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${payments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600 mb-1">Confirmed Payments</p>
                  <p className="text-2xl font-bold text-green-600">
                    {payments.filter(p => p.status === 'confirmed').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Payments Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Payer</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Purpose</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-900">{formatDate(payment.created_date)}</td>
                          <td className="py-3 px-4">
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                              {payment.id.substring(0, 8)}...
                            </code>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-900">{payment.payer_name}</div>
                            <div className="text-xs text-slate-500">{payment.payer_email}</div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            ${(payment.amount || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={payment.purpose}>
                            {payment.purpose}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${getStatusColor(payment.status)} flex items-center gap-1 w-fit`}>
                              {getStatusIcon(payment.status)}
                              {payment.status === 'work_scheduled' ? 'Work Scheduled' : payment.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}