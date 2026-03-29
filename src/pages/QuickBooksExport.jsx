import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, AlertCircle, CheckCircle } from 'lucide-react';

export default function QuickBooksExport() {
  const [user, setUser] = useState(null);
  const [qbCustomerId, setQbCustomerId] = useState('');
  const [exportStatus, setExportStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('exportToQuickBooksCSV', {});
      
      if (response?.data) {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quickbooks-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setExportStatus('success');
      }
    } catch (error) {
      setExportStatus('error');
      console.error('Export failed:', error);
    }
    setLoading(false);
  };

  const handleSyncQuickBooks = async () => {
    if (!qbCustomerId) return;
    setLoading(true);
    try {
      const response = await base44.functions.invoke('quickBooksSync', {
        contractor_email: user.email,
        qb_customer_id: qbCustomerId
      });
      setExportStatus('synced');
    } catch (error) {
      setExportStatus('error');
    }
    setLoading(false);
  };

  if (!user) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">QuickBooks Export</h1>
          <p className="text-slate-600 mt-2">Sync your completed jobs to QuickBooks for accounting</p>
        </div>

        <div className="space-y-6">
          {/* CSV Export */}
          <Card>
            <CardHeader>
              <CardTitle>CSV Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 text-sm">Download all closed jobs as CSV for manual import to QuickBooks, Sage, or any spreadsheet</p>
              <Button onClick={handleExportCSV} disabled={loading} className="w-full gap-2">
                <Download className="w-4 h-4" />
                {loading ? 'Exporting...' : 'Export as CSV'}
              </Button>
              {exportStatus === 'success' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">CSV downloaded successfully</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* QB Direct Sync */}
          <Card>
            <CardHeader>
              <CardTitle>QuickBooks Direct Sync (Wave Max+)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 text-sm">Connect to your QuickBooks account for automatic invoice syncing</p>
              <Input
                placeholder="QuickBooks Customer ID"
                value={qbCustomerId}
                onChange={(e) => setQbCustomerId(e.target.value)}
              />
              <Button 
                onClick={handleSyncQuickBooks} 
                disabled={loading || !qbCustomerId}
                className="w-full gap-2"
              >
                {loading ? 'Syncing...' : 'Preview Sync'}
              </Button>
              {exportStatus === 'synced' && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">Ready for QB sync. Use QB API with preview data</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {exportStatus === 'error' && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">Export failed. Please try again.</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}