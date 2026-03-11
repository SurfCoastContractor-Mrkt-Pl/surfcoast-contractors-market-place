import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function AccountRecovery() {
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestRecovery = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('requestAccountRecovery', { email });
      setSuccess(response.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send recovery email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('verifyRecoveryCode', { email, code });
      setRecoveryToken(response.data.recoveryToken);
      setSuccess(response.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRecovery = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('completeAccountRecovery', { recoveryToken });
      setSuccess(response.data.message);
      setTimeout(() => {
        window.location.href = '/'; // Redirect to home
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete recovery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Lock className="w-12 h-12 text-amber-600" />
          </div>
          <CardTitle>Account Recovery</CardTitle>
          <CardDescription>Regain access to your account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button 
                onClick={handleRequestRecovery} 
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Send Recovery Code
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Enter the 6-digit code sent to your email
              </p>
              <div>
                <label className="block text-sm font-medium mb-2">Verification Code</label>
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <Button 
                onClick={handleVerifyCode} 
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Verify Code
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setCode('');
                  setError('');
                }}
              >
                Back
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-slate-600">
                Code verified! Check your email for the next steps to reset your password.
              </p>
              <Button 
                onClick={handleCompleteRecovery} 
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Complete Recovery
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}