import React from 'react';
import { Check, X } from 'lucide-react';

export default function WhySurfCoast() {
  const competitors = [
    { name: 'SurfCoast', logo: 'SC' },
    { name: 'ServiceTitan', logo: 'ST' },
    { name: 'Housecall Pro', logo: 'HCP' },
    { name: 'Jobber', logo: 'JB' },
    { name: 'Service Fusion', logo: 'SF' }
  ];

  const features = [
    { name: 'Transparent pricing', surfcoast: true, servicetitan: false, housecall: false, jobber: true, servicefusion: false },
    { name: 'Mobile-first design', surfcoast: true, servicetitan: false, housecall: true, jobber: true, servicefusion: false },
    { name: 'Job marketplace', surfcoast: true, servicetitan: false, housecall: false, jobber: true, servicefusion: false },
    { name: 'No long-term contracts', surfcoast: true, servicetitan: false, housecall: true, jobber: true, servicefusion: false },
    { name: 'Vendor integration', surfcoast: true, servicetitan: false, housecall: false, jobber: false, servicefusion: false },
    { name: 'Team collaboration', surfcoast: true, servicetitan: true, housecall: true, jobber: true, servicefusion: true },
    { name: 'Customer portal', surfcoast: true, servicetitan: true, housecall: true, jobber: true, servicefusion: true },
    { name: 'Automated invoicing', surfcoast: true, servicetitan: true, housecall: true, jobber: true, servicefusion: true }
  ];

  const workerTypes = [
    { type: 'Solo Contractors', description: 'One-person operations who need simple, affordable tools to land jobs and manage schedules.' },
    { type: 'Small Teams (2-5)', description: 'Growing teams that want easy collaboration without enterprise overhead or pricing.' },
    { type: 'Trade Specialists', description: 'Electricians, plumbers, carpenters, and other licensed trades looking for specialized tools.' },
    { type: 'Market Vendors', description: 'Farmers market and swap meet sellers who need inventory and booth management.' },
    { type: 'Job Seekers', description: 'Professionals looking for a transparent way to find and bid on projects.' }
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Inter','Segoe UI',sans-serif", background: '#0a1628' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.72)', zIndex: 0 }} />

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(10,22,40,0.5)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: '44px' }}>
        <button onClick={() => window.history.back()} style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 12px' }}>
          ← Back
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
          <h1 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px', lineHeight: 1, margin: 0 }}>Why SurfCoast</h1>
        </div>
        <div style={{ width: '60px' }} />
      </header>

      <main style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px', width: '100%', flex: 1 }}>
        
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '680px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: '800', color: '#ffffff', margin: '0 0 12px', lineHeight: 1.1, letterSpacing: '-1.5px' }}>
            Built Different
          </h2>
          <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6 }}>
            We designed SurfCoast for real professionals—transparent, simple, and built to grow with you.
          </p>
        </section>

        {/* Comparison Table */}
        <section style={{ width: '100%', maxWidth: '1000px', marginBottom: '48px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: '0 0 24px', textAlign: 'center' }}>
            How We Compare
          </h3>
          <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(18px)', background: 'rgba(10,22,40,0.5)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#ffffff', fontWeight: '700', background: 'rgba(255,255,255,0.05)' }}>Feature</th>
                  {competitors.map(comp => (
                    <th key={comp.name} style={{ padding: '16px', textAlign: 'center', color: '#ffffff', fontWeight: '700', background: 'rgba(255,255,255,0.05)', minWidth: '100px' }}>
                      {comp.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.85)' }}>
                      {feature.name}
                    </td>
                    {[
                      feature.surfcoast,
                      feature.servicetitan,
                      feature.housecall,
                      feature.jobber,
                      feature.servicefusion
                    ].map((has, i) => (
                      <td key={i} style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {has ? (
                          <Check size={18} style={{ color: '#22c55e', margin: '0 auto' }} strokeWidth={2.5} aria-hidden="true" />
                        ) : (
                          <X size={18} style={{ color: 'rgba(255,255,255,0.2)', margin: '0 auto' }} strokeWidth={2.5} aria-hidden="true" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Plain English Competitor Breakdown */}
        <section style={{ width: '100%', maxWidth: '900px', marginBottom: '48px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: '0 0 24px', textAlign: 'center' }}>
            The Breakdown
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              {
                name: 'ServiceTitan',
                description: 'Built for larger service companies. Powerful but complex, with enterprise-level pricing. Overkill if you\'re flying solo.'
              },
              {
                name: 'Housecall Pro',
                description: 'Good for plumbers and HVAC specialists. Solid but focused on one niche. We\'re built for all trades.'
              },
              {
                name: 'Jobber',
                description: 'Reliable job management. Bit dated UI compared to modern platforms. Limited marketplace features.'
              },
              {
                name: 'Service Fusion',
                description: 'Affordable CRM option. Light on features. Not ideal if you need advanced job management or team tools.'
              }
            ].map((comp, idx) => (
              <article
                key={idx}
                style={{
                  borderRadius: '14px',
                  padding: '20px',
                  backdropFilter: 'blur(18px)',
                  background: 'rgba(10,22,40,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                }}
              >
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', margin: '0 0 8px' }}>
                  {comp.name}
                </h4>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6 }}>
                  {comp.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Who Is This For? */}
        <section style={{ width: '100%', maxWidth: '900px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: '0 0 24px', textAlign: 'center' }}>
            Who Is This For?
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {workerTypes.map((worker, idx) => (
              <article
                key={idx}
                style={{
                  borderRadius: '14px',
                  padding: '20px',
                  backdropFilter: 'blur(18px)',
                  background: 'rgba(10,22,40,0.5)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                }}
              >
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#22c55e', margin: '0 0 8px' }}>
                  {worker.type}
                </h4>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6 }}>
                  {worker.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ position: 'relative', zIndex: 2, padding: '24px 16px', background: 'rgba(10,22,40,0.75)', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>
          Ready to get started? <a href="/pricing" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>View pricing</a>
        </p>
      </footer>
    </div>
  );
}