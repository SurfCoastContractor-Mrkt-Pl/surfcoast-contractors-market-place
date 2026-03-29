import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, UserCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

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
  contractorLinks,
  customerLinks,
  hasMarketShop,
  hasCustomerProfile,
  createPageUrl,
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setAccountMenuOpen(false);
    base44.auth.logout();
  };

  return (
    <nav className="z-50 bg-white border-b border-slate-200">
      {/* Main nav bar */}
      <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8 gap-4 relative">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 font-semibold text-slate-900 hover:text-slate-700 transition-colors">
          <img src="https://media.base44.com/images/public/69a61a047827463e7cdbc1eb/2570592e3_homebutton.png" alt="SurfCoast" className="h-8 w-auto" />
        </Link>

        {/* Desktop Nav - Left */}
        <div className="hidden lg:flex items-center gap-1 flex-shrink">
          {getNavLinks(isContractor).map(link => {
            const Icon = link.icon;
            return (
              <Link key={link.page} to={link.page === '/' ? '/' : createPageUrl(link.page)}>
                <Button
                  variant="ghost"
                  className={`text-sm relative ${currentPageName === link.page ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {Icon && <Icon className="w-4 h-4 mr-1" />}
                  {link.name}
                  {link.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {link.badge > 99 ? '99+' : link.badge}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Desktop Nav - Right */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0 ml-auto">
          {!isLoggedIn && (
            <>
              <Link to="/About">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 text-sm">About Us</Button>
              </Link>
              <button
                onClick={() => base44.auth.redirectToLogin()}
                className="text-slate-600 hover:text-slate-900 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                aria-label="Login to your account"
              >
                Login
              </button>
            </>
          )}
          {isLoggedIn && (
            <div className="relative" ref={accountMenuRef}>
              <Button 
                variant="ghost" 
                className="text-slate-600 hover:text-slate-900 text-sm"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
              >
                <UserCircle className="w-5 h-5 mr-1" />
                Account
              </Button>
              {accountMenuOpen && (
                <AccountDropdown
                  isContractor={isContractor}
                  hasCustomerProfile={hasCustomerProfile}
                  hasMarketShop={hasMarketShop}
                  createPageUrl={createPageUrl}
                  contractorLinks={contractorLinks}
                  customerLinks={customerLinks}
                  onLogout={handleLogout}
                  setAccountMenuOpen={setAccountMenuOpen}
                />
              )}
            </div>
          )}
        </div>

        {/* Mobile Account Button */}
        {isLoggedIn && (
          <div className="lg:hidden" ref={accountMenuRef}>
            <button
              className="p-2 flex-shrink-0"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              aria-label="Account menu"
            >
              <UserCircle className="w-6 h-6 text-slate-900" />
            </button>
            {accountMenuOpen && (
              <div className="fixed left-0 right-0 top-14 z-50 px-4">
                <AccountDropdown
                  isContractor={isContractor}
                  hasCustomerProfile={hasCustomerProfile}
                  hasMarketShop={hasMarketShop}
                  createPageUrl={createPageUrl}
                  contractorLinks={contractorLinks}
                  customerLinks={customerLinks}
                  onLogout={handleLogout}
                  setAccountMenuOpen={setAccountMenuOpen}
                  isMobile
                />
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 flex-shrink-0 ml-auto"
          onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setAccountMenuOpen(false); }}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-controls="mobile-menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-slate-900" />
          ) : (
            <Menu className="w-6 h-6 text-slate-900" />
          )}
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
  contractorLinks,
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

  const Item = ({ path, children, className }) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); go(path); }}
      className={cn("w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50", className)}
    >
      {children}
    </button>
  );

  return (
    <div className={cn("bg-white border border-slate-200 rounded-xl shadow-lg z-50 w-full", !isMobile && "absolute right-0 top-full mt-1 w-52")}>
    <div className="px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50/80">
      MY PROFILES
    </div>
    <Item path={createPageUrl('Dashboard')}>Client Account</Item>
    {isContractor ? (
      <Item path={createPageUrl('ContractorFinancialDashboard')}>Contractor Account</Item>
    ) : (
      <Item path={createPageUrl('BecomeContractor')} className="text-primary hover:bg-primary/5">+ Become a Contractor</Item>
    )}
    {hasCustomerProfile ? (
      <Item path={createPageUrl('ConsumerHub')}>Consumer Account</Item>
    ) : (
      <Item path={createPageUrl('ConsumerSignup')} className="text-primary hover:bg-primary/5">+ Become a Consumer</Item>
    )}
    {hasMarketShop ? (
      <Item path={createPageUrl('MarketShopDashboard')}>MarketShop Account</Item>
    ) : (
      <Item path={createPageUrl('MarketShopSignup')} className="text-primary hover:bg-primary/5">+ Add MarketShop</Item>
    )}
    <div className="border-t border-slate-200">
      <Item path="/About">About Us</Item>
      <Item path={createPageUrl('MarketDirectory')}>Browse Markets & Vendors</Item>
    </div>
      <button
        onMouseDown={(e) => { e.preventDefault(); onLogout(); }}
        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-slate-200 rounded-b-xl font-semibold"
      >
        Logout
      </button>
    </div>
  );
}