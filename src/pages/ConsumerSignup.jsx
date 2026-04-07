import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, ShoppingBag, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const T = {
  bg: "#EBEBEC",
  card: "#fff",
  dark: "#1A1A1B",
  muted: "#333",
  border: "#D0D0D2",
  amber: "#5C3500",
  amberBg: "#F0E0C0",
  amberTint: "#FBF5EC",
  shadow: "3px 3px 0px #5C3500",
  goldGlow: "3px 3px 0px #5C3500, 0 0 18px 4px rgba(255, 180, 0, 0.35)",
};

const cardStyle = {
  background: T.card,
  border: `0.5px solid ${T.border}`,
  borderRadius: 10,
  boxShadow: T.shadow,
};

const hoverGlow = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = T.goldGlow; },
  onMouseLeave: (e) => { e.currentTarget.style.boxShadow = T.shadow; },
};

const mono = { fontFamily: "monospace", fontWeight: 700, fontStyle: "italic" };

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: `0.5px solid ${T.border}`,
  borderRadius: 6,
  fontSize: 13,
  color: T.dark,
  background: "#fafafa",
  outline: "none",
  fontFamily: "inherit",
};

export default function ConsumerSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    base44.analytics.track({ eventName: 'consumer_signup_submitted' });

    try {
      if (!formData.full_name.trim()) throw new Error('Full name is required');
      if (!formData.email.trim()) throw new Error('Email is required');
      if (!formData.password.trim()) throw new Error('Password is required');
      if (formData.password.length < 6) throw new Error('Password must be at least 6 characters');
      if (!formData.phone.trim()) throw new Error('Phone number is required');
      if (!formData.location.trim()) throw new Error('City/Zip is required');

      const consumerTier = await base44.entities.ConsumerTier.create({
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        location: formData.location,
        tier_level: 'bronze',
      });

      if (!consumerTier) throw new Error('Failed to create consumer profile');

      const earlyAdopterRes = await base44.functions.invoke('grantEarlyAdopterWaiver', {
        email: formData.email,
        full_name: formData.full_name,
        signup_type: 'consumer',
      });

      base44.analytics.track({
        eventName: 'consumer_signup_success',
        properties: {
          location: formData.location,
          early_adopter: earlyAdopterRes?.data?.qualified ?? false,
        },
      });

      navigate(createPageUrl('ConsumerHub'));
    } catch (err) {
      base44.analytics.track({ eventName: 'consumer_signup_failed', properties: { reason: err.message } });
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh", background: T.bg }}>
      {/* Ticker */}
      <div style={{ background: T.dark, padding: "6px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <span style={{ ...mono, fontSize: 11, color: "#e0e0e0" }}>// CONSUMER SIGNUP · SHOP LOCAL MARKETS</span>
        <span style={{ ...mono, fontSize: 11, color: "#ffffff" }}>California · Nationwide</span>
      </div>

      {/* Header */}
      <div style={{ background: T.bg, padding: "32px 16px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 14, letterSpacing: "0.06em" }}>// GET STARTED</div>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 800, color: T.dark, marginBottom: 8, fontStyle: "italic" }}>
            Shop at Local Markets
          </h1>
          <p style={{ fontSize: 14, color: T.dark, lineHeight: 1.65, fontWeight: 700, fontStyle: "italic" }}>
            Create your account to browse booths and vendors at farmers markets and swap meets near you.
          </p>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 16px" }}>
        <div style={{ ...cardStyle, padding: 28 }} {...hoverGlow}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: T.amberTint, border: `0.5px solid #D9B88A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBag style={{ width: 22, height: 22, color: T.amber }} />
            </div>
            <div>
              <div style={{ ...mono, fontSize: 12, color: T.amber }}>CONSUMER ACCOUNT</div>
              <div style={{ fontSize: 12, color: T.muted, fontStyle: "italic" }}>Browse vendors · Earn badges · Track orders</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {error && (
              <div style={{ padding: "10px 14px", borderRadius: 6, background: "#fff5f5", border: "0.5px solid #fca5a5", color: "#991b1b", fontSize: 13, fontStyle: "italic" }}>
                {error}
              </div>
            )}

            {[
              { label: "Full Name *", field: "full_name", type: "text", placeholder: "Your full name" },
              { label: "Email *", field: "email", type: "email", placeholder: "your@email.com" },
              { label: "Password *", field: "password", type: "password", placeholder: "Min 6 characters" },
              { label: "Phone Number *", field: "phone", type: "tel", placeholder: "(555) 123-4567" },
              { label: "City / Zip Code *", field: "location", type: "text", placeholder: "City, State or Zip Code" },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field}>
                <label style={{ fontSize: 12, fontWeight: 700, color: T.dark, display: "block", marginBottom: 6, fontStyle: "italic" }}>{label}</label>
                <input
                  type={type}
                  value={formData[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={placeholder}
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = T.amber; e.target.style.boxShadow = `0 0 0 2px rgba(92,53,0,0.15)`; }}
                  onBlur={(e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "11px 18px", borderRadius: 8, background: T.dark, color: T.amberBg, border: "none", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, ...mono, boxShadow: T.shadow, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = T.goldGlow; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.shadow; }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
                  Creating Account...
                </>
              ) : (
                <>Create Account <ArrowRight style={{ width: 16, height: 16 }} /></>
              )}
            </button>

            <p style={{ textAlign: "center", fontSize: 12, color: T.muted, marginTop: 4, fontStyle: "italic" }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => base44.auth.redirectToLogin()}
                style={{ ...mono, fontSize: 12, background: "none", border: "none", color: T.amber, cursor: "pointer", textDecoration: "underline" }}
              >
                Login here
              </button>
            </p>
          </form>
        </div>

        {/* Info strip */}
        <div style={{ display: "flex", gap: 0, marginTop: 16, ...cardStyle, overflow: "hidden" }}>
          {[
            { amount: "$0", label: "To browse" },
            { amount: "5%", label: "On purchases" },
            { amount: "Free", label: "Badge rewards" },
          ].map(({ amount, label }, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: "12px 4px", borderRight: i < 2 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ ...mono, fontSize: 18, fontWeight: 700, color: i === 1 ? T.amber : T.dark }}>{amount}</div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}