import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AboutNavLinks from './AboutNavLinks';

const mono = { fontFamily: 'monospace', fontWeight: 700, fontStyle: 'italic' };

const exploreGroups = [
  {
    label: 'For Entrepreneurs',
    items: [
      { name: 'Become an Entrepreneur', path: '/BecomeContractor' },
      { name: 'Browse Jobs', path: '/Jobs' },
      { name: 'Why SurfCoast', path: '/WhySurfCoast' },
    ],
  },
  {
    label: 'For Clients',
    items: [
      { name: 'Find Entrepreneurs', path: '/SearchContractors' },
      { name: 'Post a Job', path: '/PostJob' },
    ],
  },
  {
    label: 'Markets & Vendors',
    items: [
      { name: 'Market Directory', path: '/MarketDirectory' },
      { name: 'Booths & Vendors Map', path: '/BoothsAndVendorsMap' },
      { name: 'Swap Meet Ratings', path: '/swap-meet-ratings' },
    ],
  },
];

export default function LayoutMobileMenu({
  mobileMenuOpen,
  setMobileMenuOpen,
  isLoggedIn,
  isContractor,
  currentPageName,
  getNavLinks,
  createPageUrl,
}) {
  const [exploreOpen, setExploreOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  if (!mobileMenuOpen) return null;

  const handleLogout = () => {
    setMobileMenuOpen(false);
    base44.auth.logout();
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="lg:hidden fixed inset-0 z-40"
        style={{ background: 'rgba(26,26,27,0.6)' }}
        onClick={() => setMobileMenuOpen(false)}
      />
      {/* Drawer */}
      <div
        className="lg:hidden fixed top-12 left-0 right-0 bottom-0 z-50 overflow-y-auto"
        style={{ background: '#EBEBEC' }}
        id="mobile-menu"
      >
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Core nav links */}
          {getNavLinks(isContractor).map(link => {
            const Icon = link.icon;
            const isActive = currentPageName === link.page;
            return (
              <Link
                key={link.page}
                to={link.page === '/' ? '/' : createPageUrl(link.page)}
                onClick={handleNavClick}
                style={{ textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: isActive ? '#FBF5EC' : 'transparent', border: isActive ? '0.5px solid #D9B88A' : '0.5px solid transparent', color: isActive ? '#5C3500' : '#1A1A1B', ...mono, transition: 'background 0.15s', cursor: 'pointer' }}
                  onMouseEnter={e => !isActive && (e.currentTarget.style.background = '#FBF5EC')}
                  onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}
                >
                  {Icon && <Icon style={{ width: 14, height: 14, color: isActive ? '#5C3500' : '#555' }} />}
                  {link.name}
                  {link.badge && (
                    <span style={{ marginLeft: 'auto', background: '#5C3500', color: '#F0E0C0', fontSize: 10, fontWeight: 700, borderRadius: 9999, padding: '1px 6px' }}>
                      {link.badge > 99 ? '99+' : link.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Divider */}
          <div style={{ height: 1, background: '#D0D0D2', margin: '8px 0' }} />

          {/* About accordion */}
          <button
            onClick={() => setAboutOpen(!aboutOpen)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', ...mono, fontSize: 13, color: '#1A1A1B' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FBF5EC'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span>About SurfCoast</span>
            <ChevronDown style={{ width: 14, height: 14, color: '#5C3500', transform: aboutOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {aboutOpen && (
            <div style={{ paddingLeft: 8 }}>
              <AboutNavLinks onLinkClick={handleNavClick} isMobile />
            </div>
          )}

          {/* Explore accordion (logged-out only) */}
          {!isLoggedIn && (
            <>
              <div style={{ height: 1, background: '#D0D0D2', margin: '8px 0' }} />
              <button
                onClick={() => setExploreOpen(!exploreOpen)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', ...mono, fontSize: 13, color: '#1A1A1B' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FBF5EC'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span>Explore</span>
                <ChevronDown style={{ width: 14, height: 14, color: '#5C3500', transform: exploreOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {exploreOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 8px 4px' }}>
                  {exploreGroups.map(group => (
                    <div key={group.label}>
                      <p style={{ ...mono, fontSize: 10, color: '#5C3500', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6, padding: '0 6px' }}>{group.label}</p>
                      {group.items.map(item => (
                        <Link key={item.path} to={item.path} onClick={handleNavClick} style={{ textDecoration: 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, fontSize: 13, color: '#1A1A1B', ...mono, transition: 'background 0.15s', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#FBF5EC'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <ChevronRight style={{ width: 12, height: 12, color: '#5C3500' }} />
                            {item.name}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0 4px' }}>
                <button
                  onClick={() => { handleNavClick(); base44.auth.redirectToLogin(); }}
                  style={{ width: '100%', padding: '11px', borderRadius: 8, border: '0.5px solid #D0D0D2', background: '#fff', color: '#1A1A1B', cursor: 'pointer', ...mono, fontSize: 13 }}
                >
                  Log in
                </button>
                <button
                  onClick={() => { handleNavClick(); base44.auth.redirectToLogin(); }}
                  style={{ width: '100%', padding: '11px', borderRadius: 8, border: '0.5px solid #D9B88A', background: '#F0E0C0', color: '#5C3500', cursor: 'pointer', ...mono, fontSize: 13, boxShadow: '3px 3px 0px #5C3500' }}
                >
                  Get Started
                </button>
              </div>
            </>
          )}

          {isLoggedIn && (
            <>
              <div style={{ height: 1, background: '#D0D0D2', margin: '8px 0' }} />
              <button
                onClick={handleLogout}
                style={{ width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', ...mono, fontSize: 13, color: '#b91c1c' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}