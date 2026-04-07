import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Briefcase, Loader2, CheckCircle, Users, ArrowRight, X } from 'lucide-react';
import BeforePhotosUpload from '@/components/photos/BeforePhotosUpload';

// Theme configuration matching Home and Jobs pages
const T = {
  bg: "#EBEBEC",
  card: "#fff",
  dark: "#1A1A1B",
  sub: "#1A1A1B",
  muted: "#333",
  border: "#D0D0D2",
  orange: "#FF8C00",
  orangeBg: "#FFF5E6",
  orangeTint: "#FFE8CC",
  peachy: "#FFA341",
  orangeBorder: "#FFB366",
  amber: "#FF8C00",
  shadow: "3px 3px 0px #FF8C00",
  goldGlow: "3px 3px 0px #FF8C00, 0 0 18px 4px rgba(255, 140, 0, 0.35)",
};

const cardStyle = {
  background: T.card,
  border: `0.5px solid ${T.border}`,
  borderRadius: 10,
  boxShadow: T.shadow,
  transition: "box-shadow 0.2s ease",
};

const hoverGlow = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = T.goldGlow; },
  onMouseLeave: (e) => { e.currentTarget.style.boxShadow = T.shadow; },
};

const mono = { fontFamily: "monospace", fontWeight: 700, fontStyle: "italic" };

const trades = [
  { id: 'electrician', name: 'Electrician' },
  { id: 'plumber', name: 'Plumber' },
  { id: 'carpenter', name: 'Carpenter' },
  { id: 'hvac', name: 'HVAC Technician' },
  { id: 'mason', name: 'Mason' },
  { id: 'roofer', name: 'Roofer' },
  { id: 'painter', name: 'Painter' },
  { id: 'welder', name: 'Welder' },
  { id: 'tiler', name: 'Tiler' },
  { id: 'landscaper', name: 'Landscaper' },
  { id: 'other', name: 'Other' },
];

export default function PostJob() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [isContractor, setIsContractor] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contractor_type_needed: '',
    trade_needed: '',
    location: '',
    budget_min: '',
    budget_max: '',
    budget_type: 'negotiable',
    start_date: '',
    duration: '',
    poster_name: '',
    poster_email: '',
    poster_phone: '',
    urgency: 'medium',
    status: 'open'
  });
  const [beforePhotos, setBeforePhotos] = useState([]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Ensure CustomerProfile exists before creating job
      try {
        const user = await base44.auth.me();
        if (user) {
          const existing = await base44.entities.CustomerProfile.filter({ email: user.email });
          if (!existing || existing.length === 0) {
            await base44.entities.CustomerProfile.create({
              email: user.email,
              full_name: user.full_name || data.poster_name,
              phone: data.poster_phone || ''
            });
          }
        }
      } catch (err) {
        console.error('CustomerProfile creation failed:', err);
      }
      return base44.entities.Job.create(data);
    },
    onSuccess: () => {
      setSuccess(true);
    },
  });

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }
        const contractors = await base44.entities.Contractor.filter({ email: user.email });
        if (contractors && contractors.length > 0) {
          setIsContractor(true);
        } else {
          setIsContractor(false);
        }
      } catch {
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };
    checkUserType();
  }, []);

  if (isContractor === true) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ ...cardStyle, maxWidth: 420, width: "100%", padding: 32, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.orangeBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Users style={{ width: 32, height: 32, color: T.orange }} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: T.dark, marginBottom: 8 }}>Customers Only</h2>
          <p style={{ color: T.muted, marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>Only customers can post jobs. If you're a contractor, you can browse and respond to job postings instead.</p>
          <button onClick={() => navigate(createPageUrl('Jobs'))} style={{ width: "100%", padding: "11px 18px", borderRadius: 8, background: T.peachy, color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontStyle: "italic", ...mono, boxShadow: T.shadow }} {...hoverGlow}>
            Browse Jobs for Contractors
          </button>
        </div>
      </div>
    );
  }

  if (isContractor === null) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: T.muted }}>Loading...</div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (beforePhotos.length < 5) {
      alert('Please upload at least 5 before photos of the work area before submitting.');
      return;
    }
    if (formData.budget_type === 'fixed' || formData.budget_type === 'hourly') {
      if (!formData.budget_min && !formData.budget_max) {
        alert('Please provide at least a minimum or maximum budget.');
        return;
      }
    }
    // Validate email
    if (!formData.poster_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.poster_email)) {
      alert('Please provide a valid email address.');
      return;
    }
    const data = {
      ...formData,
      budget_min: formData.budget_min ? Number(formData.budget_min) : null,
      budget_max: formData.budget_max ? Number(formData.budget_max) : null,
      before_photo_urls: beforePhotos,
    };
    mutation.mutate(data);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg }}>
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}>
          <div style={{ ...cardStyle, maxWidth: 420, width: "100%", padding: 32, background: T.card, border: `2px solid ${T.orange}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.orangeBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CheckCircle style={{ width: 28, height: 28, color: T.orange }} />
              </div>
              <button
                onClick={() => setSuccess(false)}
                style={{ padding: 4, borderRadius: 6, background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 20, lineHeight: 1, flexShrink: 0 }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: T.dark, marginBottom: 8, fontStyle: "italic" }}>Job Posted Successfully! ✓</h2>
            <p style={{ fontSize: 14, color: T.dark, marginBottom: 4, fontStyle: "italic" }}>Your job has been successfully posted.</p>
            <p style={{ fontSize: 14, color: T.muted, marginBottom: 24, fontStyle: "italic" }}>Contractors can now see and respond to your job posting.</p>
            <button
              onClick={() => navigate(createPageUrl('MyJobs'))}
              style={{ width: "100%", padding: "11px 18px", borderRadius: 8, background: T.peachy, color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontStyle: "italic", ...mono, boxShadow: T.shadow, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              {...hoverGlow}
            >
              View My Jobs <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh", background: T.bg }}>
      {/* Header */}
      <div style={{ background: T.bg, padding: "32px 16px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Link to={createPageUrl('Home')} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: T.muted, textDecoration: "none", marginBottom: 16, fontSize: 14, fontWeight: 600 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Back
          </Link>
          <div>
            <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.75rem)", fontWeight: 800, color: T.dark, marginBottom: 8, fontStyle: "italic" }}>
              Post a <span style={{ color: T.amber }}>Job</span>
            </h1>
            <p style={{ fontSize: 15, color: T.dark, lineHeight: 1.65, fontWeight: 700, fontStyle: "italic" }}>
              Find the right contractor for your project. Free to post, only pay when you close a job.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 20, paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.dark, fontWeight: 600 }}>
              <CheckCircle style={{ width: 16, height: 16, color: T.orange }} aria-hidden="true" />
              Free to post
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.dark, fontWeight: 600 }}>
              <CheckCircle style={{ width: 16, height: 16, color: T.orange }} aria-hidden="true" />
              Contractors reach out to you
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.dark, fontWeight: 600 }}>
              <CheckCircle style={{ width: 16, height: 16, color: T.orange }} aria-hidden="true" />
              All professionals verified
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
        <form onSubmit={handleSubmit}>
           <div style={{ ...cardStyle, padding: 24, marginBottom: 24 }} {...hoverGlow}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.dark, marginBottom: 24, fontStyle: "italic" }}>Job Details</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: T.dark, display: "block", marginBottom: 8, fontStyle: "italic" }} htmlFor="title">Job Title *</label>
                <input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Kitchen Renovation, Electrical Rewiring"
                  required
                  style={{ width: "100%", padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: T.dark, display: "block", marginBottom: 8, fontStyle: "italic" }} htmlFor="description">Detailed Description of the Work *</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe the job in detail. Include: What work needs to be done, specific issues you've noticed, what's visible in the photos, any damage or problem areas, desired outcome, and any materials or preferences you have."
                  required
                  rows={6}
                  style={{ width: "100%", padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa", fontFamily: "inherit", resize: "vertical" }}
                />
                <p style={{ fontSize: 12, color: T.muted, marginTop: 8, fontStyle: "italic" }}>The more detail you provide, the better contractors can assess the job and provide accurate quotes.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 700, color: T.dark, display: "block", marginBottom: 8, fontStyle: "italic" }}>Contractor Type Needed</label>
                  <select value={formData.contractor_type_needed} onChange={(e) => handleChange('contractor_type_needed', e.target.value)} style={{ width: "100%", padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa", cursor: "pointer" }}>
                    <option value="">Select type</option>
                    <option value="trade_specific">Trade Specific</option>
                    <option value="general">General Contractor</option>
                    <option value="either">Either</option>
                  </select>
                </div>

                {formData.contractor_type_needed === 'trade_specific' && (
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 700, color: T.dark, display: "block", marginBottom: 8, fontStyle: "italic" }}>Trade Specialty</label>
                    <select value={formData.trade_needed} onChange={(e) => handleChange('trade_needed', e.target.value)} style={{ width: "100%", padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa", cursor: "pointer" }}>
                      <option value="">Select trade</option>
                      {trades.map(trade => (
                        <option key={trade.id} value={trade.id}>{trade.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: T.dark, display: "block", marginBottom: 8, fontStyle: "italic" }} htmlFor="location">Location *</label>
                <input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="City, State"
                  required
                  style={{ width: "100%", padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 700, color: T.dark, display: "block", marginBottom: 8, fontStyle: "italic" }} htmlFor="budget_min">Budget Min ($)</label>
                  <input
                    id="budget_min"
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => handleChange('budget_min', e.target.value)}
                    placeholder="0"
                    style={{ width: "100%", padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 700, color: T.dark, display: "block", marginBottom: 8, fontStyle: "italic" }} htmlFor="budget_max">Budget Max ($)</label>
                  <input
                    id="budget_max"
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => handleChange('budget_max', e.target.value)}
                    placeholder="0"
                    style={{ width: "100%", padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 700, color: T.dark, display: "block", marginBottom: 8, fontStyle: "italic" }}>Budget Type</label>
                  <select value={formData.budget_type} onChange={(e) => handleChange('budget_type', e.target.value)} style={{ width: "100%", padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa", cursor: "pointer" }}>
                    <option value="hourly">Hourly</option>
                    <option value="fixed">Fixed Price</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 700, color: T.dark, display: "block", marginBottom: 8, fontStyle: "italic" }} htmlFor="start_date">Expected Start Date</label>
                  <input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 700, color: T.dark, display: "block", marginBottom: 8, fontStyle: "italic" }} htmlFor="duration">Estimated Duration</label>
                  <input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    placeholder="e.g., 2 weeks, 1 month"
                    style={{ width: "100%", padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: T.dark, display: "block", marginBottom: 8, fontStyle: "italic" }}>Urgency Level</label>
                <select value={formData.urgency} onChange={(e) => handleChange('urgency', e.target.value)} style={{ width: "100%", padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa", cursor: "pointer" }}>
                  <option value="low">Low - Flexible timeline</option>
                  <option value="medium">Medium - Within a month</option>
                  <option value="high">High - Within 2 weeks</option>
                  <option value="urgent">🔥 Urgent - ASAP</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: 24, marginBottom: 24 }} {...hoverGlow}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.dark, marginBottom: 24, fontStyle: "italic" }}>Your Contact Info</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: T.dark, display: "block", marginBottom: 8, fontStyle: "italic" }} htmlFor="poster_name">Your Name *</label>
                <input
                  id="poster_name"
                  value={formData.poster_name}
                  onChange={(e) => handleChange('poster_name', e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 700, color: T.dark, display: "block", marginBottom: 8, fontStyle: "italic" }} htmlFor="poster_email">Email *</label>
                  <input
                    id="poster_email"
                    type="email"
                    value={formData.poster_email}
                    onChange={(e) => handleChange('poster_email', e.target.value)}
                    required
                    style={{ width: "100%", padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 700, color: T.dark, display: "block", marginBottom: 8, fontStyle: "italic" }} htmlFor="poster_phone">Phone</label>
                  <input
                    id="poster_phone"
                    type="tel"
                    value={formData.poster_phone}
                    onChange={(e) => handleChange('poster_phone', e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", border: `0.5px solid ${T.border}`, borderRadius: 6, fontSize: 13, color: T.dark, background: "#fafafa" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: 24, marginBottom: 24, border: `2px solid ${T.orangeBorder}`, background: T.orangeTint }} {...hoverGlow}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.dark, marginBottom: 4, fontStyle: "italic" }}>Before Photos <span style={{ color: "#d32f2f" }}>*</span></h2>
            <p style={{ fontSize: 13, color: T.dark, marginBottom: 16, fontWeight: 600, fontStyle: "italic" }}>Show contractors exactly what they're working with</p>
            <p style={{ fontSize: 13, color: T.dark, marginBottom: 16, lineHeight: 1.6, fontStyle: "italic" }}>
              Upload at least 5 photos showing different angles and areas of the work space. Include:
              <ul style={{ marginTop: 8, marginLeft: 16, display: "flex", flexDirection: "column", gap: 4, color: T.dark }}>
                <li>• Overview shots of the entire area</li>
                <li>• Close-ups of problem areas or damage</li>
                <li>• Different angles and lighting conditions</li>
                <li>• Any specific issues you want contractors to see</li>
              </ul>
            </p>
            <BeforePhotosUpload photos={beforePhotos} onChange={setBeforePhotos} />
          </div>

          <button 
            type="submit"
            style={{ width: "100%", padding: "11px 18px", borderRadius: 8, background: T.peachy, color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontStyle: "italic", ...mono, boxShadow: T.shadow, opacity: mutation.isPending || beforePhotos.length < 5 ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            disabled={mutation.isPending || beforePhotos.length < 5}
            {...hoverGlow}
          >
            {mutation.isPending ? (
              <>
                <Loader2 style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} />
                Posting...
              </>
            ) : (
              'Post Job'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}