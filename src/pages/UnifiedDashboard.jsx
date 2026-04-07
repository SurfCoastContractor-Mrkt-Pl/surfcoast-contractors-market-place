import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, MessageSquare, TrendingUp, Clock, ArrowRight, Bell, Settings } from 'lucide-react';

const T = {
  bg: "#EBEBEC",
  card: "#fff",
  dark: "#1A1A1B",
  sub: "#1A1A1B",
  muted: "#333",
  border: "#D0D0D2",
  amber: "#5C3500",
  amberBg: "#F0E0C0",
  amberTint: "#FBF5EC",
  shadow: "3px 3px 0px #5C3500",
  goldGlow: "3px 3px 0px #5C3500, 0 0 18px 4px rgba(255, 180, 0, 0.35)",
  goldGlowSm: "0 0 14px 3px rgba(255, 180, 0, 0.3)",
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

const hoverGlowSm = {
  onMouseEnter: (e) => { e.currentTarget.style.boxShadow = T.goldGlowSm; },
  onMouseLeave: (e) => { e.currentTarget.style.boxShadow = "none"; },
};

const mono = { fontFamily: "monospace", fontWeight: 700, fontStyle: "italic" };

export default function UnifiedDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const authUser = await base44.auth.me();
        if (!authUser) {
          navigate('/RoleChoice');
          return;
        }
        setUser(authUser);

        // Determine user type
        const contractors = await base44.entities.Contractor.filter({ email: authUser.email });
        const customers = await base44.entities.CustomerProfile.filter({ email: authUser.email });

        if (contractors && contractors.length > 0) {
          setUserType('entrepreneur');
        } else if (customers && customers.length > 0) {
          setUserType('customer');
        } else {
          setUserType(null);
        }
      } catch (err) {
        console.error('Error checking user:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [navigate]);

  // Fetch relevant data based on user type
  const { data: jobsData } = useQuery({
    queryKey: ['dashboardJobs', user?.email, userType],
    queryFn: async () => {
      if (!user?.email || !userType) return null;
      if (userType === 'entrepreneur') {
        // Get jobs assigned to this contractor
        return base44.entities.ScopeOfWork.filter({ contractor_email: user.email }, '-created_date', 5);
      } else {
        // Get jobs posted by this customer
        return base44.entities.Job.filter({ poster_email: user.email }, '-created_date', 5);
      }
    },
    enabled: !!user?.email && !!userType,
  });

  const { data: messagesData } = useQuery({
    queryKey: ['dashboardMessages', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      return base44.entities.Message.filter(
        { $or: [{ sender_email: user.email }, { recipient_email: user.email }] },
        '-created_date',
        10
      );
    },
    enabled: !!user?.email,
  });

  const { data: earnings } = useQuery({
    queryKey: ['dashboardEarnings', user?.email, userType],
    queryFn: async () => {
      if (!user?.email || userType !== 'entrepreneur') return null;
      const scopes = await base44.entities.ScopeOfWork.filter({
        contractor_email: user.email,
        status: 'closed',
      });
      if (!scopes || scopes.length === 0) return { total: 0, count: 0 };
      const total = scopes.reduce((sum, scope) => sum + (scope.contractor_payout_amount || 0), 0);
      return { total, count: scopes.length };
    },
    enabled: !!user?.email && userType === 'entrepreneur',
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: T.bg }}>
        <div style={{ textAlign: 'center', color: T.muted }}>Loading dashboard...</div>
      </div>
    );
  }

  if (!user || !userType) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: T.bg }}>
        <div style={{ ...cardStyle, padding: 32, maxWidth: 420, textAlign: 'center' }}>
          <h2 style={{ ...mono, fontSize: 18, color: T.dark, marginBottom: 12 }}>Complete Your Profile</h2>
          <p style={{ color: T.muted, marginBottom: 20, fontSize: 13, fontStyle: 'italic' }}>
            Finish setting up your account to access the dashboard.
          </p>
          <button
            onClick={() => navigate(userType === 'entrepreneur' ? '/ContractorAccount' : '/CustomerSignup')}
            style={{ width: '100%', padding: '11px 18px', borderRadius: 8, background: T.peachy, color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', ...mono, boxShadow: T.shadow }}
            {...hoverGlow}
          >
            Complete Setup
          </button>
        </div>
      </div>
    );
  }

  const unreadMessages = messagesData?.filter(m => !m.read).length || 0;
  const activeJobs = jobsData?.filter(j => j.status === 'pending_approval' || j.status === 'approved').length || 0;

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: T.dark, borderBottom: `1px solid ${T.border}`, padding: '24px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ ...mono, fontSize: 11, color: '#e0e0e0', marginBottom: 8, letterSpacing: "0.06em" }}>// WELCOME BACK</div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>
              {user.full_name?.split(' ')[0]}
            </h1>
            <p style={{ color: '#aaa', margin: '6px 0 0', fontSize: 13, fontWeight: 700, fontStyle: 'italic' }}>
              {userType === 'entrepreneur' ? 'Contractor Dashboard' : 'Customer Dashboard'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ width: 40, height: 40, borderRadius: 8, border: `1px solid ${T.border}`, background: T.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Bell style={{ width: 18, height: 18, color: T.dark }} />
              {unreadMessages > 0 && <div style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: T.amber, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadMessages}</div>}
            </button>
            <button onClick={() => navigate('/ContractorAccount')} style={{ width: 40, height: 40, borderRadius: 8, border: `1px solid ${T.border}`, background: T.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings style={{ width: 18, height: 18, color: T.dark }} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ background: T.bg, padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Quick Stats */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 16, letterSpacing: "0.06em" }}>// QUICK STATS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {userType === 'entrepreneur' && (
              <>
                <div style={{ ...cardStyle, padding: 20 }} {...hoverGlow}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ color: T.muted, fontSize: 12, margin: '0 0 8px', ...mono, letterSpacing: "0.05em" }}>ACTIVE JOBS</p>
                      <h3 style={{ color: T.dark, fontSize: 28, fontWeight: 700, margin: 0 }}>{activeJobs}</h3>
                    </div>
                    <Briefcase style={{ width: 32, height: 32, color: T.amber, opacity: 0.3 }} />
                  </div>
                </div>
                <div style={{ ...cardStyle, padding: 20 }} {...hoverGlow}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ color: T.muted, fontSize: 12, margin: '0 0 8px', ...mono, letterSpacing: "0.05em" }}>TOTAL EARNINGS</p>
                      <h3 style={{ color: T.dark, fontSize: 28, fontWeight: 700, margin: 0 }}>${earnings?.total?.toFixed(0) || '0'}</h3>
                    </div>
                    <TrendingUp style={{ width: 32, height: 32, color: T.amber, opacity: 0.3 }} />
                  </div>
                </div>
              </>
            )}
            <div style={{ ...cardStyle, padding: 20 }} {...hoverGlow}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: T.muted, fontSize: 12, margin: '0 0 8px', ...mono, letterSpacing: "0.05em" }}>MESSAGES</p>
                  <h3 style={{ color: T.dark, fontSize: 28, fontWeight: 700, margin: 0 }}>{unreadMessages}</h3>
                </div>
                <MessageSquare style={{ width: 32, height: 32, color: T.amber, opacity: 0.3 }} />
              </div>
            </div>
            <div style={{ ...cardStyle, padding: 20 }} {...hoverGlow}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: T.muted, fontSize: 12, margin: '0 0 8px', ...mono, letterSpacing: "0.05em" }}>IN PROGRESS</p>
                  <h3 style={{ color: T.dark, fontSize: 28, fontWeight: 700, margin: 0 }}>{jobsData?.length || 0}</h3>
                </div>
                <Clock style={{ width: 32, height: 32, color: T.amber, opacity: 0.3 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 16, letterSpacing: "0.06em" }}>// QUICK ACTIONS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {userType === 'entrepreneur' && (
              <>
                <button
                  onClick={() => navigate('/SearchContractors')}
                  style={{ ...cardStyle, padding: 20, textAlign: 'left', border: 'none', cursor: 'pointer', ...hoverGlow }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 6, background: T.amberTint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Briefcase style={{ width: 20, height: 20, color: T.amber }} />
                    </div>
                    <h3 style={{ color: T.dark, fontSize: 14, fontWeight: 700, margin: 0, ...mono }}>Browse Jobs</h3>
                  </div>
                  <p style={{ color: T.muted, fontSize: 12, margin: '0 0 12px', fontWeight: 700, fontStyle: 'italic' }}>Find new opportunities in your area</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.amber, fontSize: 11, fontWeight: 700 }}>
                    View All <ArrowRight style={{ width: 14, height: 14 }} />
                  </div>
                </button>
                <button
                  onClick={() => navigate('/ContractorBusinessHub')}
                  style={{ ...cardStyle, padding: 20, textAlign: 'left', border: 'none', cursor: 'pointer', ...hoverGlow }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 6, background: T.amberTint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp style={{ width: 20, height: 20, color: T.amber }} />
                    </div>
                    <h3 style={{ color: T.dark, fontSize: 14, fontWeight: 700, margin: 0, ...mono }}>Business Hub</h3>
                  </div>
                  <p style={{ color: T.muted, fontSize: 12, margin: '0 0 12px', fontWeight: 700, fontStyle: 'italic' }}>Manage earnings & profile</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.amber, fontSize: 11, fontWeight: 700 }}>
                    Manage <ArrowRight style={{ width: 14, height: 14 }} />
                  </div>
                </button>
              </>
            )}
            {userType === 'customer' && (
              <button
                onClick={() => navigate('/PostJob')}
                style={{ ...cardStyle, padding: 20, textAlign: 'left', border: 'none', cursor: 'pointer', ...hoverGlow }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 6, background: T.amberTint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Briefcase style={{ width: 20, height: 20, color: T.amber }} />
                  </div>
                  <h3 style={{ color: T.dark, fontSize: 14, fontWeight: 700, margin: 0, ...mono }}>Post a Job</h3>
                </div>
                <p style={{ color: T.muted, fontSize: 12, margin: '0 0 12px', fontWeight: 700, fontStyle: 'italic' }}>Get contractors bidding on your project</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.amber, fontSize: 11, fontWeight: 700 }}>
                  Create <ArrowRight style={{ width: 14, height: 14 }} />
                </div>
              </button>
            )}
            <button
              onClick={() => navigate('/Messaging')}
              style={{ ...cardStyle, padding: 20, textAlign: 'left', border: 'none', cursor: 'pointer', ...hoverGlow }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 6, background: T.amberTint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare style={{ width: 20, height: 20, color: T.amber }} />
                </div>
                <h3 style={{ color: T.dark, fontSize: 14, fontWeight: 700, margin: 0, ...mono }}>Messages</h3>
              </div>
              <p style={{ color: T.muted, fontSize: 12, margin: '0 0 12px', fontWeight: 700, fontStyle: 'italic' }}>Communicate with your connections</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.amber, fontSize: 11, fontWeight: 700 }}>
                {unreadMessages > 0 ? `${unreadMessages} unread` : 'View All'} <ArrowRight style={{ width: 14, height: 14 }} />
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div style={{ ...mono, fontSize: 11, color: T.muted, marginBottom: 16, letterSpacing: "0.06em" }}>// RECENT ACTIVITY</div>
          <div style={{ ...cardStyle, padding: 24 }} {...hoverGlow}>
            {jobsData && jobsData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {jobsData.slice(0, 3).map((job, idx) => (
                  <div key={idx} style={{ padding: 12, background: T.bg, borderRadius: 6, borderLeft: `4px solid ${T.amber}`, transition: "box-shadow 0.2s ease" }} {...hoverGlowSm}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 4 }}>
                      <h4 style={{ color: T.dark, fontSize: 13, fontWeight: 700, margin: 0, maxWidth: '70%', fontStyle: 'italic' }}>
                        {userType === 'entrepreneur' ? job.job_title : job.title}
                      </h4>
                      <span style={{ ...mono, fontSize: 10, color: T.amber, background: T.amberTint, border: `0.5px solid #D9B88A`, padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                        {job.status}
                      </span>
                    </div>
                    <p style={{ color: T.muted, fontSize: 12, margin: 0, fontWeight: 700, fontStyle: 'italic' }}>
                      Updated {new Date(job.updated_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: T.muted, fontSize: 13, fontWeight: 700, fontStyle: 'italic', margin: 0 }}>No recent activity</p>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}