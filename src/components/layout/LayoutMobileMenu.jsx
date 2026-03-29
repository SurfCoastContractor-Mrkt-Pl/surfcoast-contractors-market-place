import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserCircle, Briefcase } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LayoutMobileMenu({
  mobileMenuOpen,
  setMobileMenuOpen,
  isLoggedIn,
  isContractor,
  getNavLinks,
  contractorLinks,
  customerLinks,
  hasMarketShop,
  hasCustomerProfile,
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
              <div className={`flex items-center gap-3 p-3 rounded-lg relative ${isContractor === link.page ? 'bg-amber-50 text-amber-600' : 'text-slate-600'}`}>
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
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="border-t border-slate-100 pt-2 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-slate-500">
              ACCOUNT
            </div>
            {isLoggedIn && (
              <>
                <Link to={createPageUrl('Dashboard')} onClick={handleNavClick}>
                  <div className="flex items-center gap-3 p-3 rounded-lg text-slate-600">
                    <ArrowLeft className="w-4 h-4" />
                    My Dashboard
                  </div>
                </Link>
                <Link to={createPageUrl('ConsumerHub')} onClick={handleNavClick}>
                  <div className="flex items-center gap-3 p-3 rounded-lg text-slate-600 border-t border-slate-100 pt-3 mt-1">
                    🎖️ Consumer Dashboard
                  </div>
                </Link>
              </>
            )}
            {(isContractor ? contractorLinks : customerLinks).map(link => (
              <Link key={link.page} to={createPageUrl(link.page)} onClick={handleNavClick}>
                <div className="flex items-center gap-3 p-3 rounded-lg text-slate-600">
                  <UserCircle className="w-5 h-5" />
                  {link.name}
                </div>
              </Link>
            ))}

            <Link to={createPageUrl('MarketDirectory')} onClick={handleNavClick}>
              <div className="flex items-center gap-3 p-3 rounded-lg text-slate-600 border-t border-slate-100">
                Browse Markets & Vendors
              </div>
            </Link>
            <Link to="/About" onClick={handleNavClick}>
              <div className="flex items-center gap-3 p-3 rounded-lg text-slate-600 border-t border-slate-100">
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
        </div>
      </div>
      </div>
    </>
  );
}