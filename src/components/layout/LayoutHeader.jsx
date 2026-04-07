import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, UserCircle, ChevronDown, Briefcase, Users, Home, MessageCircle, ShoppingBag, Store, BarChart2, Info, DollarSign, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import NotificationBell from '@/components/notifications/NotificationBell';

const exploreGroups = [
  {
    label: 'For Entrepreneurs',
    items: [
      { name: 'Become an Entrepreneur', path: '/BecomeContractor', icon: Briefcase },
      { name: 'Browse Jobs', path: '/Jobs', icon: BarChart2 },
      { name: 'Why SurfCoast', path: '/WhySurfCoast', icon: BarChart2 },
    ],
  },
  {
    label: 'For Clients',
    items: [
      { name: 'Find Entrepreneurs', path: '/SearchContractors', icon: Users },
      { name: 'Post a Job', path: '/PostJob', icon: Briefcase },
    ],
  },
  {
    label: 'Markets & Vendors',
    items: [
      { name: 'Market Directory', path: '/MarketDirectory', icon: Store },
      { name: 'Booths & Vendors Map', path: '/BoothsAndVendorsMap', icon: Store },
      { name: 'Swap Meet Ratings', path: '/swap-meet-ratings', icon: BarChart2 },
    ],
  },
];

const mono = { fontFamily: 'monospace', fontWeight: 700, fontStyle: 'italic' };

export default function LayoutHeader({
  mobileMenuOpen,
  setMobileMenuOpen,
  accountMenuOpen,
  setAccountMenuOpen,
  isLoggedIn,
  isContractor,
  currentPageName,
  getNavLinks,
  accountMenuRef,
  entrepreneurLinks,
  customerLinks,
  hasMarketShop,
  hasCustomerProfile,
  unreadCount,
}) {
  const navigate = useNavigate();
  const [exploreOpen, setExploreOpen] = useState(false);
  const navLinks = useMemo(() => getNavLinks(isContractor), [isContractor, getNavLinks]);

  const handleLogout = () => {
    setAccountMenuOpen(false);
    base44.auth.logout();
  };

  return (
    <nav style={{ background: '#1A1A1B', borderBottom: '1px solid #333', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="flex items-center h-12 px-4 sm:px-6 lg:px-8 gap-3 max-w-7xl mx-auto w-full">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0 mr-2" style={{ textDecoration: 'none' }}>
          <div className="flex flex-col gap-[2px]">
            <span style={{ ...mono, fontSize: 16, color: '#F0E0C0', lineHeight: 1 }}>SurfCoast</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 7, color: '#5C3500', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1, background: '#F0E0C0', padding: '1px 4px', borderRadius: 2 }}>MARKETPLACE</span>
          </div>
        </Link>

        {/* Desktop: Explore dropdown (logged-out) */}
        <div className="hidden lg:flex items-center gap-1 flex-1">
          {!isLoggedIn && (
            <div className="relative" onMouseEnter={() => setExploreOpen(true)} onMouseLeave={() => setExploreOpen(false)}>
              <button style={{ ...mono, fontSize: 12, color: exploreOpen ? '#F0E0C0' : '#ccc', background: exploreOpen ? 'rgba(240,224,192,0.1)' : 'transparent', border: 'none', padding: '6px 12px', borderRadius: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.15s' }}>
                Explore
                <ChevronDown style={{ width: 12, height: 12, transform: exploreOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>

              {exploreOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, width: 500, background: '#EBEBEC', border: '0.5px solid #D0D0D2', borderRadius: 10, boxShadow: '3px 3px 0px #5C3500', zIndex: 60, padding: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    {exploreGroups.map(group => (
                      <div key={group.label}>
                        <p style={{ ...mono, fontSize: 10, color: '#5C3500', letterSpacing: '0.06em', marginBottom: 10, textTransform: 'uppercase' }}>{group.label}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {group.items.map(item => (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setExploreOpen(false)}
                              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, fontSize: 12, color: '#1A1A1B', textDecoration: 'none', fontWeight: 700, fontStyle: 'italic', transition: 'background 0.15s', background: 'transparent' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#FBF5EC'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <span style={{ width: 18, height: 18, background: '#FBF5EC', border: '0.5px solid #D9B88A', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <item.icon style={{ width: 10, height: 10, color: '#5C3500' }} />
                              </span>
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop right actions */}
        <div className="hidden lg:flex items-center gap-3 ml-auto flex-shrink-0">
          {!isLoggedIn && (
            <>
              <div className="flex items-center gap-3">
                <Link to="/BecomeContractor" style={{ ...mono, fontSize: 12, color: '#ccc', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#F0E0C0'} onMouseLeave={e => e.currentTarget.style.color = '#ccc'}>For Entrepreneurs</Link>
                <span style={{ color: '#444' }}>/</span>
                <Link to="/CustomerSignup" style={{ ...mono, fontSize: 12, color: '#ccc', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#F0E0C0'} onMouseLeave={e => e.currentTarget.style.color = '#ccc'}>For Clients</Link>
                <span style={{ color: '#444' }}>/</span>
                <Link to="/pricing" style={{ ...mono, fontSize: 12, color: '#ccc', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#F0E0C0'} onMouseLeave={e => e.currentTarget.style.color = '#ccc'}>Pricing</Link>
              </div>
              <div style={{ width: 1, height: 20, background: '#333' }} />
              <button
                onClick={() => base44.auth.redirectToLogin()}
                style={{ ...mono, fontSize: 12, color: '#F0E0C0', background: 'transparent', border: '0.5px solid #555', borderRadius: 5, padding: '6px 14px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#D9B88A'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#555'}
              >
                Log in
              </button>
              <button
                onClick={() => base44.auth.redirectToLogin()}
                style={{ ...mono, fontSize: 12, color: '#5C3500', background: '#F0E0C0', border: '0.5px solid #D9B88A', borderRadius: 5, padding: '6px 14px', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 10px 2px rgba(255,180,0,0.3)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                Get Started
              </button>
            </>
          )}

          {isLoggedIn && <NotificationBell />}

          {isLoggedIn && (
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                style={{ ...mono, fontSize: 12, color: accountMenuOpen ? '#F0E0C0' : '#ccc', background: accountMenuOpen ? 'rgba(240,224,192,0.1)' : 'transparent', border: `0.5px solid ${accountMenuOpen ? '#D9B88A' : '#555'}`, borderRadius: 5, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
              >
                <UserCircle style={{ width: 14, height: 14 }} />
                Account
                <ChevronDown style={{ width: 12, height: 12, transform: accountMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>
              {accountMenuOpen && (
                <AccountDropdown
                  isContractor={isContractor}
                  hasCustomerProfile={hasCustomerProfile}
                  hasMarketShop={hasMarketShop}
                  onLogout={handleLogout}
                  setAccountMenuOpen={setAccountMenuOpen}
                  unreadCount={unreadCount}
                />
              )}
            </div>
          )}
        </div>

        {/* Mobile: account icon */}
        {isLoggedIn && (
          <div className="lg:hidden ml-auto" ref={accountMenuRef}>
            <button
              style={{ padding: 8, borderRadius: 5, border: 'none', background: accountMenuOpen ? 'rgba(240,224,192,0.15)' : 'transparent', cursor: 'pointer' }}
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              aria-label="Account menu"
            >
              <UserCircle style={{ width: 22, height: 22, color: '#F0E0C0' }} />
            </button>
            {accountMenuOpen && (
              <div style={{ position: 'fixed', left: 0, right: 0, top: 48, zIndex: 50, padding: '0 16px' }}>
                <AccountDropdown
                  isContractor={isContractor}
                  hasCustomerProfile={hasCustomerProfile}
                  hasMarketShop={hasMarketShop}
                  onLogout={handleLogout}
                  setAccountMenuOpen={setAccountMenuOpen}
                  unreadCount={unreadCount}
                  isMobile
                />
              </div>
            )}
          </div>
        )}

        {/* Mobile: Get Started (logged-out) */}
        {!isLoggedIn && (
          <button
            onClick={() => base44.auth.redirectToLogin()}
            style={{ ...mono, fontSize: 11, color: '#5C3500', background: '#F0E0C0', border: '0.5px solid #D9B88A', borderRadius: 5, padding: '5px 12px', cursor: 'pointer', flexShrink: 0, marginLeft: 'auto', marginRight: 8 }}
            className="lg:hidden"
          >
            Get Started
          </button>
        )}

        {/* Hamburger */}
        <button
          style={{ padding: 8, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', flexShrink: 0 }}
          className="lg:hidden"
          onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setAccountMenuOpen(false); }}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen
            ? <X style={{ width: 20, height: 20, color: '#F0E0C0' }} />
            : <Menu style={{ width: 20, height: 20, color: '#ccc' }} />
          }
        </button>
      </div>
    </nav>
  );
}

function AccountDropdown({ isContractor, hasCustomerProfile, hasMarketShop, onLogout, setAccountMenuOpen, isMobile, unreadCount }) {
  const navigate = useNavigate();

  const go = (path) => {
    setAccountMenuOpen(false);
    navigate(path);
  };

  const Item = ({ path, children, icon: Icon, highlight }) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); go(path); }}
      style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, fontStyle: 'italic', fontFamily: 'monospace', color: highlight ? '#5C3500' : '#1A1A1B', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#FBF5EC'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {Icon && <Icon style={{ width: 14, height: 14, color: '#5C3500', flexShrink: 0 }} />}
      {children}
    </button>
  );

  const SectionLabel = ({ children }) => (
    <div style={{ padding: '10px 16px 4px', fontFamily: 'monospace', fontWeight: 700, fontStyle: 'italic', fontSize: 10, color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{children}</div>
  );

  const Divider = () => <div style={{ height: 1, background: '#D0D0D2', margin: '4px 0' }} />;

  return (
    <div style={{ background: '#EBEBEC', border: '0.5px solid #D0D0D2', borderRadius: 10, boxShadow: '3px 3px 0px #5C3500', zIndex: 60, display: 'flex', flexDirection: 'column', ...(isMobile ? { width: '100%', maxHeight: '80vh' } : { position: 'absolute', right: 0, top: '100%', marginTop: 6, width: 240, maxHeight: '80vh' }) }}>

      <div style={{ padding: '10px 16px', borderBottom: '0.5px solid #D9B88A', background: '#FBF5EC', borderRadius: '10px 10px 0 0', flexShrink: 0 }}>
        <p style={{ fontFamily: 'monospace', fontWeight: 700, fontStyle: 'italic', fontSize: 11, color: '#5C3500' }}>// SIGNED IN</p>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        <SectionLabel>Navigate</SectionLabel>
        <Item path="/" icon={Home}>Home</Item>
        {isContractor
          ? <Item path="/Jobs" icon={Briefcase}>Browse Jobs</Item>
          : <Item path="/SearchContractors" icon={Users}>Find Entrepreneurs</Item>
        }
        <Item path={isContractor ? "/ContractorInquiries" : "/Messaging"} icon={MessageCircle}>
          Messages{unreadCount > 0 && <span style={{ marginLeft: 'auto', background: '#5C3500', color: '#F0E0C0', fontSize: 10, fontWeight: 700, borderRadius: 9999, padding: '1px 6px' }}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </Item>
        <Item path="/BoothsAndVendorsMap" icon={Store}>Markets</Item>

        <Divider />
        <SectionLabel>My Accounts</SectionLabel>
        <Item path="/Dashboard" icon={UserCircle}>Dashboard</Item>
        {isContractor && <Item path="/ContractorAccount" icon={Briefcase}>Entrepreneur Portal</Item>}
        {hasCustomerProfile && <Item path="/ConsumerHub" icon={ShoppingBag}>Consumer</Item>}
        {hasMarketShop && <Item path="/MarketShopDashboard" icon={Store}>Market Booth</Item>}

        <Divider />
        <SectionLabel>Join As</SectionLabel>
        {!isContractor && <Item path="/BecomeContractor" icon={Briefcase} highlight>+ Entrepreneur</Item>}
        <Item path="/CustomerSignup" icon={Users} highlight>+ Client</Item>
        {!hasCustomerProfile && <Item path="/ConsumerSignup" icon={ShoppingBag} highlight>+ Consumer</Item>}
        {!hasMarketShop && <Item path="/MarketShopSignup" icon={Store} highlight>+ Market Booth</Item>}

        <Divider />
        <SectionLabel>Info</SectionLabel>
        <Item path="/About" icon={Info}>About</Item>
        <Item path="/WhySurfCoast" icon={BarChart2}>Why SurfCoast</Item>
        <Item path="/pricing" icon={DollarSign}>Pricing</Item>
        <Item path="/wave-os-details" icon={Zap}>WAVE OS</Item>
        <Divider />
      </div>

      <div style={{ flexShrink: 0, borderTop: '0.5px solid #D0D0D2' }}>
        <button
          onMouseDown={(e) => { e.preventDefault(); onLogout(); }}
          style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, fontFamily: 'monospace', fontWeight: 700, fontStyle: 'italic', color: '#b91c1c', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '0 0 10px 10px', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          Log out
        </button>
      </div>
    </div>
  );
}