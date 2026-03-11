import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Play, CheckCircle2, AlertTriangle, Loader2, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ComprehensiveTestPanel() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleRunTests = async () => {
    setRunning(true);
    try {
      const response = await base44.functions.invoke('runComprehensiveTest', {});
      setResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Test execution error:', error);
      setResults({
        error: true,
        message: error.message || 'Failed to run tests',
      });
      setShowResults(true);
    } finally {
      setRunning(false);
    }
  };

  const downloadResults = () => {
    if (!results) return;
    const json = JSON.stringify(results, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Comprehensive Test Suite
            </h3>
            <p className="text-sm text-slate-600">
              Run automated tests across all platform functions, entities, and user workflows to identify issues.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700 uppercase">
              Tests Included:
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div>✓ Contractor operations</div>
              <div>✓ Customer profiles</div>
              <div>✓ Message system</div>
              <div>✓ Scope of work</div>
              <div>✓ Payments & progress</div>
              <div>✓ Reviews & ratings</div>
              <div>✓ Job postings</div>
              <div>✓ Content reports</div>
              <div>✓ Quote requests</div>
              <div>✓ Disputes</div>
              <div>✓ Error logging</div>
              <div>✓ Security alerts</div>
            </div>
          </div>

          <Button
            onClick={handleRunTests}
            disabled={running}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Full Test Suite
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test Results</DialogTitle>
          </DialogHeader>

          {results && !results.error ? (
            <div className="space-y-4">
              {/* Summary */}
              <Card className="p-4 bg-slate-50">
                <div className="grid sm:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 font-semibold mb-1">
                      TOTAL TESTS
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {results.summary?.total_tests}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold mb-1">
                      PASSED
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {results.summary?.passed}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold mb-1">
                      FAILED
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {results.summary?.failed}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold mb-1">
                      SUCCESS RATE
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {results.summary?.success_rate}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Issues */}
              {results.issues && results.issues.length > 0 && (
                <Card className="p-4 border-red-200 bg-red-50">
                  <div className="flex gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <h4 className="font-semibold text-red-900">Issues Found</h4>
                  </div>
                  <ul className="space-y-2">
                    {results.issues.map((issue, idx) => (
                      <li key={idx} className="text-sm text-red-700">
                        • {issue}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Test Details */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Test Details</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(results.tests).map(([key, test]) => (
                    <div key={key} className="flex items-start justify-between p-2 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-center gap-2 flex-1">
                        {test.status === 'pass' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <span className="text-sm font-medium text-slate-700 capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <Badge
                        className={
                          test.status === 'pass'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {test.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download Button */}
              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <Button variant="outline" onClick={() => setShowResults(false)} className="flex-1">
                  Close
                </Button>
                <Button
                  onClick={downloadResults}
                  className="flex-1 bg-slate-900 hover:bg-slate-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Results
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <p className="text-slate-900 font-medium">
                {results?.message || 'Test execution failed'}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}