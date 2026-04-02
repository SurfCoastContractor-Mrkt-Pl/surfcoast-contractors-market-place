import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, CheckCircle, AlertCircle, Loader2, Mail, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  { id: 1, label: 'Enter Email' },
  { id: 2, label: 'Verify Code' },
  { id: 3, label: 'Complete' },
];

export default function AccountRecovery() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestRecovery = async () => {
    if (!email) { setError('Please enter your email address'); return; }
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
    if (!code) { setError('Please enter the verification code'); return; }
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
      setTimeout(() => { window.location.href = '/'; }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete recovery');
    } finally {
      setLoading(false);
    }
  };

  const stepIcon = [
    <Mail className="w-6 h-6" />,
    <KeyRound className="w-6 h-6" />,
    <ShieldCheck className="w-6 h-6" />,
  ];

  const stepTitle = ['Recover Your Account', 'Enter Verification Code', 'Recovery Complete'];
  const stepDesc = [
    "We'll send a secure recovery code to your email.",
    `A 6-digit code was sent to ${email || 'your email'}.`,
    'Your identity has been verified successfully.',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-600 shadow-lg mb-4">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SurfCoast</h1>
          <p className="text-sm text-slate-500 mt-1">Marketplace</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step > s.id
                    ? 'bg-green-500 text-white'
                    : step === s.id
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-200'
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === s.id ? 'text-amber-600' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-300 ${step > s.id ? 'bg-green-400' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                {stepIcon[step - 1]}
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">{stepTitle[step - 1]}</h2>
                <p className="text-amber-100 text-sm mt-0.5">{stepDesc[step - 1]}</p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-5">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && step < 3 && (
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-green-700 font-medium">{success}</p>
              </div>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleRequestRecovery()}
                      disabled={loading}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleRequestRecovery}
                  disabled={loading}
                  className="w-full bg-amber-600 hover:bg-amber-700 h-11 text-base font-semibold"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Send Recovery Code
                </Button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">6-Digit Code</label>
                  <Input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                    disabled={loading}
                    className="text-center text-3xl tracking-[0.5em] font-mono h-14"
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 mt-2 text-center">Check your inbox — it may take a minute</p>
                </div>
                <Button
                  onClick={handleVerifyCode}
                  disabled={loading || code.length < 6}
                  className="w-full bg-amber-600 hover:bg-amber-700 h-11 text-base font-semibold"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Verify Code
                </Button>
                <button
                  onClick={() => { setStep(1); setCode(''); setError(''); setSuccess(''); }}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to email
                </button>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-5 text-center">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Identity Verified!</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Click below to complete your account recovery and regain access.
                  </p>
                </div>
                <Button
                  onClick={handleCompleteRecovery}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 h-11 text-base font-semibold"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  {loading ? 'Completing Recovery...' : 'Complete Recovery'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Remember your password?{' '}
          <Link to="/" className="text-amber-600 hover:text-amber-700 font-semibold">
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}