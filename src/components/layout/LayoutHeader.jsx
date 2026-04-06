import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, UserCircle, ChevronDown, Briefcase, Users, Home, MessageCircle, ShoppingBag, Store, BarChart2, Settings, Info } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import AboutNavLinks from './AboutNavLinks';
import NotificationBell from '@/components/notifications/NotificationBell';

// Grouped "Explore" mega-menu items for logged-out visitors
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
      { name: 'Find Entrepreneurs', path: '/FindContractors', icon: Users },
      { name: 'Post a Job', path: '/PostJob', icon: Briefcase },
    ],
  },
  {
    label: 'Markets & Vendors',
    items: [
      { name: 'Market Directory', path: '/MarketDirectory', icon: Store },
      { name: 'Booths & Vendors Map', path: '/BoothsAndVendorsMap', icon: Store },
      { name: 'Swap Meet Ratings', path: '/swap-meet-ratings', icon: BarChart2 },
      { name: 'Farmers Market Ratings', path: '/farmers-market-ratings', icon: BarChart2 },
    ],
  },
];

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
  createPageUrl,
}) {
  const navigate = useNavigate();
  const [exploreOpen, setExploreOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const navLinks = useMemo(() => getNavLinks(isContractor), [isContractor, getNavLinks]);

  const handleLogout = () => {
    setAccountMenuOpen(false);
    base44.auth.logout();
  };

  return (
    <nav className="z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 sticky top-0 overflow-visible">
      <div className="flex items-center h-16 px-4 sm:px-6 lg:px-8 gap-3 max-w-7xl mx-auto">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0 mr-2">
          <div className="flex flex-col gap-[2px]">
            <span className="text-[22px] font-black tracking-tight leading-none gradient-text">SurfCoast</span>
            <span className="text-[10px] font-bold tracking-[2px] text-blue-500 uppercase leading-none">MARKETPLACE</span>
          </div>
        </Link>

        {/* Desktop Nav Pills */}
        <div className="hidden lg:flex items-center gap-1 flex-1">
          {/* Core nav links */}
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = currentPageName === link.page;
            return (
              <Link key={link.page} to={link.page === '/' ? '/' : createPageUrl(link.page)}>
                <button className={cn(
                  "relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-blue-50 text-blue-700 nav-pill-active"
                    : "text-slate-700 hover:text-blue-700 hover:bg-blue-50"
                )}>
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {link.name}
                  {link.badge && (
                    <span className="ml-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {link.badge > 99 ? '99+' : link.badge}
                    </span>
                  )}
                </button>
              </Link>
            );
          })}

          {/* Explore dropdown (logged-out) or quick links (logged-in) */}
          {!isLoggedIn && (
            <div className="relative" onMouseEnter={() => setExploreOpen(true)} onMouseLeave={() => setExploreOpen(false)}>
              <button className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors duration-150",
                exploreOpen ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:text-blue-700 hover:bg-blue-50"
              )}>
                Explore
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-150", exploreOpen && "rotate-180")} />
              </button>

              {exploreOpen && (
                <div className="absolute top-full left-0 mt-1 w-[540px] bg-white border border-blue-100 rounded-2xl shadow-xl z-50 p-5">
                  <div className="grid grid-cols-3 gap-6">
                    {exploreGroups.map(group => (
                      <div key={group.label}>
                        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-3">{group.label}</p>
                        <div className="space-y-1">
                          {group.items.map(item => (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setExploreOpen(false)}
                              className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                            >
                              <span className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <item.icon className="w-3 h-3 text-blue-600" />
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

          {isLoggedIn && (
            <Link to={createPageUrl('MarketDirectory')}>
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-150">
                <Store className="w-3.5 h-3.5" />
                Markets
              </button>
            </Link>
          )}
        </div>

        {/* Right side actions */}
        <div className="hidden lg:flex items-center gap-3 ml-auto flex-shrink-0">
          {!isLoggedIn && (
            <>
              <div className="flex items-center gap-3">
                <Link to="/BecomeContractor" className="text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors duration-150">For Entrepreneurs</Link>
                <span className="text-slate-300">/</span>
                <Link to="/CustomerSignup" className="text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors duration-150">For Clients</Link>
                <span className="text-slate-300">/</span>
                <Link to="/pricing" className="text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors duration-150">Pricing</Link>
              </div>
              <div className="w-px h-5 bg-slate-200 mx-1"></div>
              <button
                onClick={() => base44.auth.redirectToLogin()}
                className="text-sm font-semibold text-slate-800 hover:text-blue-700 px-4 py-2 rounded-full border border-slate-300 hover:border-blue-300 transition-colors duration-150"
              >
                Log in
              </button>
              <button
                onClick={() => base44.auth.redirectToLogin()}
                className="text-sm font-semibold text-white px-4 py-2 rounded-full gradient-brand hover:opacity-90 transition-opacity duration-150 shadow-sm"
              >
                Get Started
              </button>
            </>
          )}

          {isLoggedIn && (
            <NotificationBell />
          )}

          {isLoggedIn && (
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors duration-150",
                  accountMenuOpen
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "border-slate-300 text-slate-800 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                )}
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
              >
                <UserCircle className="w-4 h-4" />
                Account
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-150", accountMenuOpen && "rotate-180")} />
              </button>
              {accountMenuOpen && (
                <AccountDropdown
                  isContractor={isContractor}
                  hasCustomerProfile={hasCustomerProfile}
                  hasMarketShop={hasMarketShop}
                  createPageUrl={createPageUrl}
                  entrepreneurLinks={entrepreneurLinks}
                  customerLinks={customerLinks}
                  onLogout={handleLogout}
                  setAccountMenuOpen={setAccountMenuOpen}
                />
              )}
            </div>
          )}

          {/* About Menu — always visible on desktop */}
          <div className="relative">
            <button
              onClick={() => { setAboutOpen(!aboutOpen); setAccountMenuOpen(false); }}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors duration-150",
                aboutOpen
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "border-slate-300 text-slate-800 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              )}
              aria-haspopup="menu"
              aria-expanded={aboutOpen}
            >
              <Info className="w-4 h-4" />
              About
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-150", aboutOpen && "rotate-180")} />
            </button>
            {aboutOpen && (
              <>
                {/* Click-away backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setAboutOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-blue-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-blue-50 bg-gradient-to-r from-blue-50 to-sky-50">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">About SurfCoast</p>
                  </div>
                  <AboutNavLinks onLinkClick={() => setAboutOpen(false)} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile: account icon */}
        {isLoggedIn && (
          <div className="lg:hidden ml-auto" ref={accountMenuRef}>
            <button
              className="p-2 rounded-full hover:bg-blue-50 transition-colors"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              aria-label="Account menu"
            >
              <UserCircle className="w-6 h-6 text-blue-700" />
            </button>
            {accountMenuOpen && (
              <div className="fixed left-0 right-0 top-16 z-50 px-4">
                <AccountDropdown
                  isContractor={isContractor}
                  hasCustomerProfile={hasCustomerProfile}
                  hasMarketShop={hasMarketShop}
                  createPageUrl={createPageUrl}
                  entrepreneurLinks={entrepreneurLinks}
                  customerLinks={customerLinks}
                  onLogout={handleLogout}
                  setAccountMenuOpen={setAccountMenuOpen}
                  isMobile
                />
              </div>
            )}
          </div>
        )}

        {/* Mobile: hamburger (existing nav) */}
        <button
          className={cn(
            "lg:hidden p-2 rounded-full hover:bg-blue-50 transition-colors flex-shrink-0",
            isLoggedIn ? "" : "ml-auto"
          )}
          onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setAccountMenuOpen(false); }}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-controls="mobile-menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen
            ? <X className="w-5 h-5 text-blue-700" />
            : <Menu className="w-5 h-5 text-slate-800" />
          }
        </button>
      </div>
    </nav>
  );
}

function AccountDropdown({
  isContractor,
  hasCustomerProfile,
  hasMarketShop,
  createPageUrl,
  entrepreneurLinks,
  customerLinks,
  onLogout,
  setAccountMenuOpen,
  isMobile,
}) {
  const navigate = useNavigate();

  const go = (path) => {
    setAccountMenuOpen(false);
    navigate(path);
  };

  const Item = ({ path, children, className, icon: Icon }) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); go(path); }}
      className={cn(
        "w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150",
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4 text-blue-400 flex-shrink-0" />}
      {children}
    </button>
  );

  const SectionLabel = ({ children }) => (
    <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-blue-500 uppercase tracking-widest">{children}</div>
  );

  return (
    <div className={cn(
      "bg-white border border-blue-100 rounded-2xl shadow-xl z-[60] overflow-hidden",
      isMobile ? "w-full" : "absolute right-0 top-full mt-2 w-60"
    )}>
      <div className="px-4 py-3 border-b border-blue-50 bg-gradient-to-r from-blue-50 to-sky-50">
        <p className="text-xs text-blue-600 font-medium">Signed in</p>
      </div>

      <SectionLabel>My Account</SectionLabel>
      <Item path={createPageUrl('Dashboard')} icon={UserCircle}>Client Account</Item>

      {isContractor ? (
        <>
          <SectionLabel>Entrepreneur</SectionLabel>
          <Item path={createPageUrl('ContractorAccount')} icon={Briefcase}>Entrepreneur Portal</Item>
          <Item path={createPageUrl('ContractorBusinessHub')} icon={Settings}>Business Hub</Item>
          <Item path={createPageUrl('ContractorFinancialDashboard')} icon={BarChart2}>Financial Dashboard</Item>
          <Item path="/WaveFo" icon={BarChart2}>Wave FO</Item>
        </>
      ) : (
        <Item path={createPageUrl('BecomeContractor')} className="text-blue-600 font-medium" icon={Briefcase}>
          + Become an Entrepreneur
        </Item>
      )}

      {hasCustomerProfile ? (
        <Item path={createPageUrl('ConsumerHub')} icon={ShoppingBag}>Consumer Account</Item>
      ) : (
        <Item path={createPageUrl('ConsumerSignup')} className="text-blue-600 font-medium" icon={ShoppingBag}>
          + Become a Consumer
        </Item>
      )}

      {hasMarketShop ? (
        <Item path={createPageUrl('MarketShopDashboard')} icon={Store}>MarketShop Account</Item>
      ) : (
        <Item path={createPageUrl('MarketShopSignup')} className="text-blue-600 font-medium" icon={Store}>
          + Add MarketShop
        </Item>
      )}

      <div className="border-t border-blue-50 mt-1">
        <Item path={createPageUrl('MarketDirectory')} icon={Store}>Browse Markets</Item>
      </div>

      <div className="border-t border-blue-100">
        <button
          onMouseDown={(e) => { e.preventDefault(); onLogout(); }}
          className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 font-semibold rounded-b-2xl"
        >
          Log out
        </button>
      </div>
    </div>
  );
}