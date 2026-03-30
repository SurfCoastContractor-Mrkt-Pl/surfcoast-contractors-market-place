import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WhySurfCoast() {
  const comparison = [
    {
      feature: 'Pricing Model',
      surfcoast: 'Month-to-month, no contracts',
      competitors: 'Annual contracts, setup fees'
    },
    {
      feature: 'Team Management',
      surfcoast: 'Available at Wave FO Premium',
      competitors: 'Available on all tier levels'
    },
    {
      feature: 'Mobile App',
      surfcoast: 'Full feature parity',
      competitors: 'Limited mobile functionality'
    },
    {
      feature: 'Inventory Tracking',
      surfcoast: 'Wave Pro and up (50+ items)',
      competitors: 'Enterprise plans only'
    },
    {
      feature: 'Job Scheduling',
      surfcoast: 'Starting at Wave Starter',
      competitors: 'Professional tier minimum'
    },
    {
      feature: 'QuickBooks Integration',
      surfcoast: 'Wave Max and up',
      competitors: 'Premium plans only'
    },
    {
      feature: 'Customer Portal',
      surfcoast: 'All plans',
      competitors: 'Professional tier+ only'
    },
    {
      feature: 'AI Scheduling',
      surfcoast: 'Wave Max ($59/mo)',
      competitors: 'Enterprise plans ($300+/mo)'
    }
  ];

  const workerTypes = [
    { title: 'Licensed Trades', description: 'Electricians, plumbers, HVAC, carpenters, roofers — full team tools at $100/mo' },
    { title: 'General Contractors', description: 'Multi-trade coordination — Wave Max with AI scheduling at $59/mo' },
    { title: 'Home Service Pros', description: 'Handymen, cleaners, organizers — Start at Wave Starter for $19/mo' },
    { title: 'Health & Wellness', description: 'Personal trainers, yoga instructors, therapists — Simple scheduling from $19/mo' },
    { title: 'Freelance Creatives', description: 'Writers, designers, photographers — Project tracking at Wave Max ($59/mo)' },
    { title: 'Pet Services', description: 'Dog walkers, groomers, sitters — Availability calendar at Wave Starter ($19/mo)' },
    { title: 'Craft Sellers', description: 'Artists, makers, artisans — WAVEShop for market booths at $35/mo' },
    { title: 'Market Vendors', description: 'Farmers, food vendors, handmade goods — WAVEShop booth management ($35/mo)' },
    { title: 'Virtual Assistants', description: 'Admin support, scheduling — Customer communication tools at Wave Pro ($39/mo)' },
    { title: 'Consultants', description: 'Business, marketing, tech advisors — Client tracking at Wave Max ($59/mo)' },
    { title: 'Educators', description: 'Tutors, coaches, trainers — Lesson scheduling & invoicing from $19/mo' },
    { title: 'Gig Workers', description: 'Task-based income — Flexible billing from Wave Starter ($19/mo)' }
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Inter','Segoe UI',sans-serif", background: '#0a1628' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.72)', zIndex: 0 }} />

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(10,22,40,0.5)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: '44px' }}>
        <button onClick={() => window.history.back()} style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 12px' }}>
          ← Back
        </button>
        <h1 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px', lineHeight: 1, margin: 0 }}>Why SurfCoast</h1>
        <div style={{ width: '60px' }} />
      </header>

      <main style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px', width: '100%', flex: 1 }}>
        {/* Hero */}
        <section style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '680px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: '800', color: '#ffffff', margin: '0 0 12px', lineHeight: 1.1, letterSpacing: '-1.5px' }}>
            Built for Every Worker
          </h2>
          <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6 }}>
            From licensed contractors to market vendors, SurfCoast has the right plan. No contracts. Month-to-month flexibility.
          </p>
        </section>

        {/* Comparison Table */}
        <section style={{ width: '100%', maxWidth: '1000px', marginBottom: '48px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: '0 0 24px', textAlign: 'center' }}>
            How We Compare
          </h3>
          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(217,119,6,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '700', color: '#d97706' }}>Feature</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '700', color: '#d97706' }}>SurfCoast</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>ServiceTitan, Housecall Pro, Jobber</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: idx % 2 === 0 ? 'rgba(10,22,40,0.3)' : 'transparent' }}>
                    <td style={{ padding: '14px 12px', fontWeight: '600', color: '#ffffff' }}>{row.feature}</td>
                    <td style={{ padding: '14px 12px', color: '#d97706' }}>✓ {row.surfcoast}</td>
                    <td style={{ padding: '14px 12px', color: 'rgba(255,255,255,0.6)' }}>{row.competitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Competitor Breakdown */}
        <section style={{ width: '100%', maxWidth: '1000px', marginBottom: '48px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: '0 0 24px', textAlign: 'center' }}>
            Why Choose SurfCoast?
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { name: 'ServiceTitan', issue: 'Enterprise pricing ($200+/mo), long contracts, steep learning curve' },
              { name: 'Housecall Pro', issue: 'Limited mobile app, feature bloat, poor interface clarity' },
              { name: 'Jobber', issue: 'High onboarding costs, integration limitations, rigid workflows' },
              { name: 'Service Fusion', issue: 'Outdated UX, slow performance, limited customization' },
              { name: 'Vagaro', issue: 'Beauty-industry focused, poor trade contractor support' },
              { name: 'Etsy', issue: 'Marketplace-only, high fees, no operational tools' }
            ].map((comp, idx) => (
              <div key={idx} style={{ background: 'rgba(10,22,40,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#d97706', margin: '0 0 8px' }}>{comp.name}</h4>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>{comp.issue}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Worker Types Grid */}
        <section style={{ width: '100%', maxWidth: '1200px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: '0 0 24px', textAlign: 'center' }}>
            Who Is This For?
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {workerTypes.map((worker, idx) => (
              <div key={idx} style={{ background: 'rgba(10,22,40,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#d97706', margin: '0 0 8px' }}>{worker.title}</h4>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6 }}>{worker.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ textAlign: 'center', marginTop: '48px', paddingBottom: '24px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: '0 0 16px' }}>Ready to simplify your operations?</p>
          <Link to="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#d97706', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', textDecoration: 'none', transition: 'all 0.2s' }}>
            View All Plans <ArrowRight size={16} />
          </Link>
        </section>
      </main>

      <footer style={{ position: 'relative', zIndex: 2, padding: '24px 16px', background: 'rgba(10,22,40,0.75)', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>
          Questions? <a href="mailto:support@surfcoast.com" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Contact support</a>
        </p>
      </footer>
    </div>
  );
}