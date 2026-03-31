import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function LayoutMobileMenu({
  mobileMenuOpen,
  setMobileMenuOpen,
  isLoggedIn,
  isContractor,
  currentPageName,
  getNavLinks,
  createPageUrl,
}) {
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
        className="lg:hidden fixed inset-0 bg-black/40 z-40"
        onClick={() => setMobileMenuOpen(false)}
      />
      {/* Drawer */}
      <div className="lg:hidden fixed top-14 left-0 right-0 bottom-0 bg-white z-50 overflow-y-auto" id="mobile-menu">
        <div className="px-4 py-4 space-y-2">
          {getNavLinks(isContractor).map(link => {
            const Icon = link.icon;
            return (
              <Link
                key={link.page}
                to={link.page === '/' ? '/' : createPageUrl(link.page)}
                onClick={handleNavClick}
              >
                <div className={`flex items-center gap-3 p-3 rounded-lg relative ${currentPageName === link.page ? 'bg-amber-50 text-amber-600' : 'text-slate-600'}`}>
                  <Icon className="w-5 h-5" />
                  {link.name}
                  {link.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {link.badge > 99 ? '99+' : link.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
          {!isLoggedIn && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link to="/pricing" onClick={handleNavClick}>
                <div className="flex items-center gap-3 p-3 rounded-lg text-slate-600">
                  Pricing
                </div>
              </Link>
              <Link to="/why-surfcoast" onClick={handleNavClick}>
                <div className="flex items-center gap-3 p-3 rounded-lg text-slate-600">
                  Why SurfCoast
                </div>
              </Link>
              <Link to="/About" onClick={handleNavClick}>
                <div className="flex items-center gap-3 p-3 rounded-lg text-slate-600">
                  About Us
                </div>
              </Link>
            </div>
          )}
          {isLoggedIn && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link to="/About" onClick={handleNavClick}>
                <div className="flex items-center gap-3 p-3 rounded-lg text-slate-600">
                  About Us
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-3 rounded-lg text-red-600 border-t border-slate-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}