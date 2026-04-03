import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, AlertCircle, Loader2, PlayCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PlatformTests() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [errorTriggering, setErrorTriggering] = useState(false);
  const [triggeredErrors, setTriggeredErrors] = useState([]);

  const runFullTests = async () => {
    setIsRunning(true);
    setTestResults(null);
    try {
      const response = await base44.functions.invoke('runPlatformTests', {});
      setTestResults(response.data);
    } catch (error) {
      console.error('Failed to run tests:', error);
      setTestResults({
        overallStatus: 'ERROR',
        error: error.message,
        testResults: []
      });
    } finally {
      setIsRunning(false);
    }
  };

  const triggerTestError = async (severity, testType) => {
    setErrorTriggering(true);
    try {
      const response = await base44.functions.invoke('logErrorEvent', {
        message: `Test ${severity} error: ${testType}`,
        level: severity,
        category: testType
      });
      setTriggeredErrors([
        ...triggeredErrors,
        { severity, testType, status: 'SUCCESS', message: `Simulated ${severity} error logged` }
      ]);
      setTimeout(() => {
        alert(`✅ Test ${severity} error (${testType}) triggered!\n\nCheck Admin Error Logs or your email for the notification.`);
      }, 1000);
    } catch (error) {
      console.error('Failed to trigger test error:', error);
      alert(`❌ Failed to trigger error: ${error.message}`);
    } finally {
      setErrorTriggering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Platform Test Suite</h1>
          <p className="text-slate-600">Comprehensive automated testing of all platform features</p>
        </div>

        {/* Test Runner Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Full Platform Test</h2>
              <p className="text-slate-600">Run comprehensive tests across all core features</p>
            </div>
            <Button
              onClick={runFullTests}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 h-12 px-6"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" /> Run Full Platform Test
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Test Results</h3>
                <span className={`px-4 py-2 rounded-lg font-semibold text-white ${
                  testResults.overallStatus === 'PASS' ? 'bg-green-600' :
                  testResults.overallStatus === 'FAIL' ? 'bg-red-600' :
                  'bg-slate-600'
                }`}>
                  {testResults.overallStatus}
                </span>
              </div>
              <p className="text-slate-600">
                {testResults.passedTests || 0} / {testResults.totalTests || 0} tests passed
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm text-green-600 font-medium">Passed</div>
                <div className="text-3xl font-bold text-green-700">{testResults.passedTests || 0}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="text-sm text-red-600 font-medium">Failed</div>
                <div className="text-3xl font-bold text-red-700">{testResults.failedTests || 0}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-blue-600 font-medium">Total</div>
                <div className="text-3xl font-bold text-blue-700">{testResults.totalTests || 0}</div>
              </div>
            </div>

            {/* Test Details */}
            <div className="space-y-4">
              {(testResults.testResults || []).map((test, idx) => (
                <div key={idx} className={`rounded-lg p-4 border ${
                  test.status === 'PASS' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-4">
                    {test.status === 'PASS' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-semibold ${test.status === 'PASS' ? 'text-green-900' : 'text-red-900'}`}>
                          {test.testName}
                        </h4>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          test.status === 'PASS' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                        }`}>
                          {test.status}
                        </span>
                      </div>
                      <p className={`text-sm mb-2 ${test.status === 'PASS' ? 'text-green-800' : 'text-red-800'}`}>
                        {test.description}
                      </p>
                      <div className="text-xs space-y-1">
                        <div><strong>Expected:</strong> {test.expected}</div>
                        <div><strong>Actual:</strong> {test.actual}</div>
                        {test.cause && <div><strong>Cause:</strong> {test.cause}</div>}
                        {test.fix && <div><strong>Fix:</strong> {test.fix}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Trigger Testing Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Test Error Notifications</h2>
          <p className="text-slate-600 mb-6">Trigger intentional errors to test the notification system</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button
              onClick={() => triggerTestError('critical', 'payment')}
              disabled={errorTriggering}
              className="bg-red-600 hover:bg-red-700 h-12"
            >
              {errorTriggering ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              🔴 Critical: Payment Error
            </Button>
            <Button
              onClick={() => triggerTestError('high', 'form')}
              disabled={errorTriggering}
              className="bg-orange-600 hover:bg-orange-700 h-12"
            >
              {errorTriggering ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              🟠 High: Form Submission Error
            </Button>
            <Button
              onClick={() => triggerTestError('medium', 'api')}
              disabled={errorTriggering}
              className="bg-yellow-600 hover:bg-yellow-700 h-12"
            >
              {errorTriggering ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              🟡 Medium: API Error
            </Button>
          </div>

          {/* Triggered Errors Summary */}
          {triggeredErrors.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Triggered Test Errors</h3>
              <div className="space-y-2">
                {triggeredErrors.map((error, idx) => (
                  <div key={idx} className="bg-slate-50 rounded p-3 border border-slate-200 flex items-center justify-between">
                    <span className="text-sm">
                      <strong>{error.severity.toUpperCase()}</strong> - {error.testType} error
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-4">
                ✅ All errors have been logged and notifications sent to your admin email and the error log page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}