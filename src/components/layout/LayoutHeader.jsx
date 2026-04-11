import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, UserCircle, ChevronDown, Briefcase, Users, Home, MessageCircle, ShoppingBag, Store, BarChart2, Settings, Info, DollarSign, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import AboutNavLinks from './AboutNavLinks';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useWaveOSEligibility } from '@/hooks/useWaveOSEligibility';

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
  unreadCount,
  userEmail,
}) {
  const navigate = useNavigate();
  const [exploreOpen, setExploreOpen] = useState(false);
  const navLinks = useMemo(() => getNavLinks(isContractor), [isContractor, getNavLinks]);
  const { data: waveOSInfo } = useWaveOSEligibility(userEmail);

  const handleLogout = () => {
    setAccountMenuOpen(false);
    base44.auth.logout();
  };

  return (
    <nav className="z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 sticky top-0 overflow-visible">
      <div className="flex items-center h-12 px-4 sm:px-6 gap-3 w-full">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0 mr-2 -ml-2">
          <img
            src="https://media.base44.com/files/public/69a61a047827463e7cdbc1eb/1cc8ee1a4_surfcoastlogoDesktopWallpaper.pdf"
            alt="SurfCoast Marketplace"
            className="h-8 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="flex-col gap-[2px]" style={{ display: 'none' }}>
            <span className="text-[16px] font-black tracking-tight leading-none gradient-text">SurfCoast</span>
            <span className="text-[7px] font-bold tracking-[2px] text-blue-500 uppercase leading-none">MARKETPLACE</span>
          </div>
        </Link>

        {/* Desktop Nav Pills — logged-out only shows Explore dropdown */}
        <div className="hidden lg:flex items-center gap-1 flex-1">
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
        </div>

        {/* Right side actions */}
        <div className="hidden lg:flex items-center gap-3 ml-auto flex-shrink-0 -mr-4">
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
                  onLogout={handleLogout}
                  setAccountMenuOpen={setAccountMenuOpen}
                  unreadCount={unreadCount}
                  waveOSInfo={waveOSInfo}
                />
              )}
            </div>
          )}


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
                  onLogout={handleLogout}
                  setAccountMenuOpen={setAccountMenuOpen}
                  unreadCount={unreadCount}
                  isMobile
                  waveOSInfo={waveOSInfo}
                />
              </div>
            )}
          </div>
        )}

        {/* Mobile: Get Started button (logged-out only) */}
        {!isLoggedIn && (
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="lg:hidden ml-auto mr-2 text-xs font-semibold text-white px-3 py-1.5 rounded-full gradient-brand hover:opacity-90 transition-opacity flex-shrink-0"
          >
            Get Started
          </button>
        )}

        {/* Mobile: hamburger (existing nav) */}
        <button
          className={cn(
            "lg:hidden p-2 rounded-full hover:bg-blue-50 transition-colors flex-shrink-0",
            isLoggedIn ? "" : ""
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
  onLogout,
  setAccountMenuOpen,
  isMobile,
  unreadCount,
  waveOSInfo,
}) {
  const navigate = useNavigate();

  const go = (path) => {
    setAccountMenuOpen(false);
    navigate(path);
  };

  const Item = ({ path, children, className, icon: Icon, highlight }) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); go(path); }}
      className={cn(
        "w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-150",
        highlight
          ? "text-blue-600 font-semibold hover:bg-blue-50"
          : "text-slate-700 hover:bg-blue-50 hover:text-blue-700",
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4 text-blue-400 flex-shrink-0" />}
      {children}
    </button>
  );

  const SectionLabel = ({ children }) => (
    <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{children}</div>
  );

  const Divider = () => <div className="border-t border-slate-100 my-1" />;

  return (
    <div className={cn(
      "bg-white border border-blue-100 rounded-2xl shadow-xl z-[60] flex flex-col",
      isMobile ? "w-full max-h-[80vh]" : "absolute right-0 top-full mt-2 w-64 max-h-[80vh]"
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-blue-50 bg-gradient-to-r from-blue-50 to-sky-50 flex-shrink-0 rounded-t-2xl">
        <p className="text-xs text-blue-600 font-semibold">Signed in</p>
      </div>

      {/* Scrollable body */}
      <div className="overflow-y-auto flex-1">

        {/* WAVE OS Button — Mobile Only */}
        {waveOSInfo?.eligible && (
          <>
            <Item
              path="/FieldOps"
              icon={Zap}
              className={cn(
                "font-semibold",
                waveOSInfo.color === 'amber'
                  ? "text-amber-600 hover:bg-amber-50"
                  : "text-blue-600 hover:bg-blue-50"
              )}
            >
              {waveOSInfo.label}
            </Item>
            <Divider />
          </>
        )}

        {/* Navigate */}
        <SectionLabel>Navigate</SectionLabel>
        <Item path="/" icon={Home}>Home</Item>
        {isContractor
          ? <Item path="/Jobs" icon={Briefcase}>Browse Jobs</Item>
          : <Item path="/SearchContractors" icon={Users}>Find Entrepreneurs</Item>
        }
        <Item path={isContractor ? "/ContractorInquiries" : "/Messaging"} icon={MessageCircle}>
         Messages{unreadCount > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </Item>
        <Item path="/BoothsAndVendorsMap" icon={Store}>Markets</Item>

        <Divider />

        {/* My Accounts */}
        <SectionLabel>My Accounts</SectionLabel>
        <Item path="/Dashboard" icon={UserCircle}>Dashboard</Item>
         {isContractor && (
           <Item path="/ContractorAccount" icon={Briefcase}>Entrepreneur Portal</Item>
         )}
         {hasCustomerProfile && (
           <Item path="/ConsumerHub" icon={ShoppingBag}>Consumer</Item>
         )}
         {hasMarketShop && (
           <Item path="/MarketShopDashboard" icon={Store}>Market Booth</Item>
         )}

        <Divider />

        {/* Join As */}
        <SectionLabel>Join As</SectionLabel>
        {!isContractor && (
           <Item path="/BecomeContractor" icon={Briefcase} highlight>+ Entrepreneur</Item>
         )}
         <Item path="/CustomerSignup" icon={Users} highlight>+ Client</Item>
         {!hasCustomerProfile && (
           <Item path="/ConsumerSignup" icon={ShoppingBag} highlight>+ Consumer</Item>
         )}
         {!hasMarketShop && (
           <Item path="/MarketShopSignup" icon={Store} highlight>+ Market Booth / Vendor Space</Item>
         )}

        <Divider />

        {/* Info */}
        <SectionLabel>Info</SectionLabel>
        <Item path="/About" icon={Info}>About</Item>
        <Item path="/WhySurfCoast" icon={BarChart2}>Why SurfCoast</Item>
        <Item path="/pricing" icon={DollarSign}>Pricing</Item>
        <Item path="/wave-os-details" icon={Zap}>WAVE OS</Item>

        <Divider />
      </div>

      {/* Logout — always visible at bottom */}
      <div className="flex-shrink-0 border-t border-blue-100 rounded-b-2xl">
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