import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, Lightbulb } from 'lucide-react';

const XIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.26 5.632 5.904-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/>
  </svg>
);

const mono = { fontFamily: 'monospace', fontWeight: 700, fontStyle: 'italic' };

const footerSections = [
  {
    label: 'For Entrepreneurs',
    links: [
      { name: 'Create Profile', path: '/BecomeContractor' },
      { name: 'Browse Jobs', path: '/Jobs' },
      { name: 'Blog & Resources', path: '/Blog' },
      { name: 'WAVE Handbook', path: '/wave-handbook' },
    ],
  },
  {
    label: 'For Clients',
    links: [
      { name: 'Find Entrepreneurs', path: '/SearchContractors' },
      { name: 'Post a Job', path: '/PostJob' },
      { name: 'My Job Postings', path: '/MyJobs' },
    ],
  },
  {
    label: 'Markets & Vendors',
    links: [
      { name: 'Booths & Vendors', path: '/BoothsAndVendorsMap' },
      { name: 'Market Directory', path: '/MarketDirectory' },
      { name: 'Swap Meet Ratings', path: '/swap-meet-ratings' },
      { name: 'Farmers Market Ratings', path: '/farmers-market-ratings' },
    ],
  },
  {
    label: 'Consumers',
    links: [
      { name: 'Consumer Hub', path: '/ConsumerHub' },
      { name: 'Sign Up', path: '/ConsumerSignup' },
    ],
  },
];

export default function LayoutFooter({ setSuggestionOpen }) {
  return (
    <footer style={{ background: '#1A1A1B', borderTop: '0.5px solid #333', marginTop: 'auto', paddingTop: 40, paddingBottom: 28 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>

        {/* Top grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, marginBottom: 32 }}>

          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 12 }}>
              <span style={{ ...mono, fontSize: 18, color: '#F0E0C0', lineHeight: 1 }}>SurfCoast</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 7, color: '#5C3500', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1, background: '#F0E0C0', padding: '1px 4px', borderRadius: 2, display: 'inline-block', width: 'fit-content' }}>MARKETPLACE</span>
            </div>
            <p style={{ fontSize: 12, fontStyle: 'italic', fontWeight: 700, color: '#888', lineHeight: 1.65, maxWidth: 200 }}>
              Built for the worker. Not the algorithm. California-born, nationwide.
            </p>

            {/* Social */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center' }}>
              <a href="https://www.instagram.com/surfcoastmkt_pl/" target="_blank" rel="noopener noreferrer" style={{ color: '#E1306C', transition: 'opacity 0.15s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.7'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <Instagram style={{ width: 18, height: 18 }} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#1877F2', transition: 'opacity 0.15s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.7'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <Facebook style={{ width: 18, height: 18 }} />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" style={{ color: '#ccc', transition: 'opacity 0.15s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.7'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <XIcon style={{ width: 18, height: 18 }} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0A66C2', transition: 'opacity 0.15s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.7'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <Linkedin style={{ width: 18, height: 18 }} />
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {footerSections.map(section => (
            <div key={section.label}>
              <div style={{ ...mono, fontSize: 10, color: '#5C3500', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>{section.label}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.links.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      style={{ fontSize: 12, fontWeight: 700, fontStyle: 'italic', color: '#999', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#F0E0C0'}
                      onMouseLeave={e => e.currentTarget.style.color = '#999'}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '0.5px solid #333', paddingTop: 20, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ ...mono, fontSize: 11, color: '#666' }}>© {new Date().getFullYear()} SurfCoast Marketplace. All rights reserved.</span>
            <p style={{ fontSize: 11, color: '#444', fontStyle: 'italic', marginTop: 4, lineHeight: 1.5, maxWidth: 500 }}>
              Connection platform only. Does not employ, endorse, or guarantee any contractor, vendor, or service. All users participate at their own risk.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <Link to="/Terms" style={{ ...mono, fontSize: 11, color: '#888', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#F0E0C0'} onMouseLeave={e => e.currentTarget.style.color = '#888'}>Terms</Link>
            <span style={{ color: '#444' }}>•</span>
            <Link to="/PrivacyPolicy" style={{ ...mono, fontSize: 11, color: '#888', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#F0E0C0'} onMouseLeave={e => e.currentTarget.style.color = '#888'}>Privacy</Link>
            <span style={{ color: '#444' }}>•</span>
            <button
              onClick={() => setSuggestionOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, ...mono, fontSize: 11, color: '#888', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 4px', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#F0E0C0'}
              onMouseLeave={e => e.currentTarget.style.color = '#888'}
            >
              <Lightbulb style={{ width: 12, height: 12 }} />
              Feedback
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}