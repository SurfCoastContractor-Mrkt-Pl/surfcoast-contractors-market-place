import { useState, useEffect } from 'react';
import { Sparkles, Users, Wrench, Copy, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getAppBaseUrl } from '@/lib/env';

export default function ReferralSignup() {
  const [step, setStep] = useState('role'); // 'role' or 'share'
  const [selectedRole, setSelectedRole] = useState(null);
  const [referralCode, setReferralCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const generateReferralCode = async () => {
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateReferralCode', { email });
      if (response.data?.code) {
        setReferralCode(response.data.code);
        setStep('share');
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
      alert('Failed to generate referral code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const referralLink = referralCode ? `${getAppBaseUrl()}/join?ref=${referralCode}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #1a2f4a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        padding: '40px',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Sparkles size={32} style={{ color: '#d97706' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px' }}>
            Grow Your Network
          </h1>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            Share your referral link and extend your free trial with every friend who joins
          </p>
        </div>

        {step === 'role' ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px',
              }}>
                What's your email?
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>
                Which describes you best?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => setSelectedRole('pro')}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: selectedRole === 'pro' ? '2px solid #1d6fa4' : '1px solid #ddd',
                    background: selectedRole === 'pro' ? 'rgba(29, 111, 164, 0.05)' : '#f9f9f9',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedRole !== 'pro') {
                      e.currentTarget.style.borderColor = '#1d6fa4';
                      e.currentTarget.style.background = 'rgba(29, 111, 164, 0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedRole !== 'pro') {
                      e.currentTarget.style.borderColor = '#ddd';
                      e.currentTarget.style.background = '#f9f9f9';
                    }
                  }}
                >
                  <Wrench size={20} style={{ color: '#d97706' }} />
                  <span>I'm a Pro (Contractor)</span>
                </button>

                <button
                  onClick={() => setSelectedRole('customer')}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: selectedRole === 'customer' ? '2px solid #1d6fa4' : '1px solid #ddd',
                    background: selectedRole === 'customer' ? 'rgba(29, 111, 164, 0.05)' : '#f9f9f9',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedRole !== 'customer') {
                      e.currentTarget.style.borderColor = '#1d6fa4';
                      e.currentTarget.style.background = 'rgba(29, 111, 164, 0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedRole !== 'customer') {
                      e.currentTarget.style.borderColor = '#ddd';
                      e.currentTarget.style.background = '#f9f9f9';
                    }
                  }}
                >
                  <Users size={20} style={{ color: '#1d6fa4' }} />
                  <span>I Need a Pro (Customer)</span>
                </button>
              </div>
            </div>

            <button
              onClick={generateReferralCode}
              disabled={!selectedRole || !email.trim() || loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: selectedRole && email.trim() ? '#1d6fa4' : '#ccc',
                color: '#fff',
                fontSize: '15px',
                fontWeight: '700',
                cursor: selectedRole && email.trim() && !loading ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (selectedRole && email.trim() && !loading) {
                  e.currentTarget.style.background = '#153d69';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedRole && email.trim() && !loading) {
                  e.currentTarget.style.background = '#1d6fa4';
                }
              }}
            >
              {loading ? 'Generating...' : 'Get My Referral Link'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              padding: '20px',
              borderRadius: '8px',
              background: '#f0f9ff',
              marginBottom: '24px',
              border: '1px solid #bfdbfe',
            }}>
              <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px', fontWeight: '600' }}>
                Your Referral Code
              </p>
              <p style={{ fontSize: '18px', fontWeight: '800', color: '#1d6fa4', margin: '0 0 12px' }}>
                {referralCode}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '12px',
                    color: '#666',
                    fontFamily: 'monospace',
                  }}
                />
                <button
                  onClick={copyToClipboard}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: copied ? '#10b981' : '#1d6fa4',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? (
                    <>
                      <Check size={16} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#333', marginBottom: '12px' }}>
                How it works:
              </h3>
              <ol style={{ fontSize: '13px', color: '#666', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
                <li>Share your referral link with friends</li>
                <li>They click and sign up using your code</li>
                <li>You both get 1 day trial extension per successful referral</li>
              </ol>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setStep('role');
                  setSelectedRole(null);
                  setReferralCode(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  background: '#f9f9f9',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                onClick={() => {
                  const baseUrl = getAppBaseUrl();
                  const fromUrl = encodeURIComponent(`${baseUrl}/Referrals`);
                  window.location.href = `${baseUrl}/login?from_url=${fromUrl}&ref=${referralCode}`;
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#1d6fa4',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#153d69'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1d6fa4'}
              >
                Continue to Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}