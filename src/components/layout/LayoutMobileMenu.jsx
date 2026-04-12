import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Briefcase, Users, Store, BarChart2, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import AboutNavLinks from './AboutNavLinks';
import { useWaveOSEligibility } from '@/hooks/useWaveOSEligibility';

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
      { name: 'Farmers Market Ratings', path: '/farmers-market-ratings' },
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
  userEmail,
}) {
  const [exploreOpen, setExploreOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const { data: waveOSInfo } = useWaveOSEligibility(userEmail);

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
        className="lg:hidden fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40"
        onClick={() => setMobileMenuOpen(false)}
      />
      {/* Drawer */}
      <div
        className="lg:hidden fixed top-16 left-0 right-0 bottom-0 bg-white z-50 overflow-y-auto"
        id="mobile-menu"
      >
        <div className="px-4 py-5 space-y-1">

          {/* Logo */}
          <div className="flex justify-center pb-3 mb-2 border-b border-slate-100">
            <Link to="/" onClick={handleNavClick}>
              <img
                src="https://media.base44.com/files/public/69a61a047827463e7cdbc1eb/1cc8ee1a4_surfcoastlogoDesktopWallpaper.pdf"
                alt="SurfCoast Marketplace"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="flex-col gap-[2px]" style={{ display: 'none' }}>
                <span className="text-[18px] font-black tracking-tight leading-none gradient-text">SurfCoast</span>
                <span className="text-[8px] font-bold tracking-[2px] text-blue-500 uppercase leading-none">MARKETPLACE</span>
              </div>
            </Link>
          </div>


          {/* WAVE OS Button — Hamburger Menu */}
          {isLoggedIn && waveOSInfo?.eligible && (
            <>
              <Link to="/FieldOps" onClick={handleNavClick}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                  waveOSInfo.color === 'amber'
                    ? "bg-amber-50 text-amber-600"
                    : "bg-blue-50 text-blue-700"
                )}>
                  <Zap className="w-4 h-4" />
                  {waveOSInfo.label}
                </div>
              </Link>
              <div className="border-t border-slate-100 my-2" />
            </>
          )}

          {/* Core nav links */}
          {getNavLinks(isContractor).map(link => {
            const Icon = link.icon;
            const isActive = currentPageName === link.page;
            return (
              <Link
                key={link.page}
                to={link.page === '/' ? '/' : createPageUrl(link.page)}
                onClick={handleNavClick}
              >
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors relative",
                  isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                )}>
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.name}
                  {link.badge && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {link.badge > 99 ? '99+' : link.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {/* About SurfCoast accordion — always visible */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setAboutOpen(!aboutOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <span className="font-semibold">About SurfCoast</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", aboutOpen && "rotate-180")} />
            </button>
            {aboutOpen && (
              <div className="mt-1 pb-1">
                <AboutNavLinks onLinkClick={handleNavClick} isMobile />
              </div>
            )}
          </div>

          {/* Explore accordion (logged-out only) */}
          {!isLoggedIn && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setExploreOpen(!exploreOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <span>Explore</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", exploreOpen && "rotate-180")} />
              </button>

              {exploreOpen && (
                <div className="mt-1 space-y-4 px-2 pb-2">
                  {exploreGroups.map(group => (
                    <div key={group.label}>
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-500">{group.label}</p>
                      {group.items.map(item => (
                        <Link key={item.path} to={item.path} onClick={handleNavClick}>
                          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                           <ChevronRight className="w-3.5 h-3.5 text-blue-300" />
                            {item.name}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* CTA buttons */}
              <div className="mt-4 flex flex-col gap-2 px-2">
                <button
                  onClick={() => { handleNavClick(); base44.auth.redirectToLogin(); }}
                  className="w-full py-3 rounded-xl border border-blue-200 text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => { handleNavClick(); base44.auth.redirectToLogin(); }}
                  className="w-full py-3 rounded-xl gradient-brand text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}

          {isLoggedIn && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}