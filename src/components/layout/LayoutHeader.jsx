import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, UserCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

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
      <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8 gap-4">
        {/* Desktop Nav - Left */}
        {currentPageName !== 'Home' && (
          <div className="hidden lg:flex items-center gap-1 flex-shrink">
            {getNavLinks(isContractor).map(link => {
              const Icon = link.icon;
              return (
                <Link key={link.page} to={link.page === '/' ? '/' : createPageUrl(link.page)}>
                  <Button
                    variant="ghost"
                    className={`text-sm relative ${currentPageName === link.page ? 'bg-blue-50' : 'text-slate-600 hover:text-slate-900'}`}
                    style={currentPageName === link.page ? { color: '#1E5A96' } : {}}
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
        )}

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
          <div className="relative lg:hidden" ref={accountMenuRef}>
            <button
              className="p-2 flex-shrink-0"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              aria-label="Account menu"
            >
              <UserCircle className="w-6 h-6 text-slate-900" />
            </button>
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
                isMobile
              />
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 flex-shrink-0 ml-auto"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
  return (
    <div className={`${isMobile ? 'absolute right-0 top-full mt-1' : 'absolute right-0 top-full mt-1'} w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50`}>
      <div className="px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50/80">
        {isContractor ? 'CONTRACTOR' : 'CLIENT'}
      </div>
      <Link to={createPageUrl('Dashboard')} onClick={() => setAccountMenuOpen(false)}>
        <div className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">My Dashboard</div>
      </Link>
      <Link to={createPageUrl('ConsumerHub')} onClick={() => setAccountMenuOpen(false)}>
        <div className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">Consumer Dashboard</div>
      </Link>
      <Link to="/About" onClick={() => setAccountMenuOpen(false)}>
        <div className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">About Us</div>
      </Link>
      {(isContractor ? contractorLinks : customerLinks).map(link => (
        <Link key={link.page} to={createPageUrl(link.page)} onClick={() => setAccountMenuOpen(false)}>
          <div className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">{link.name}</div>
        </Link>
      ))}
      <div className="border-t border-slate-200">
        <div className="px-4 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Switch Profile</div>
        <Link to={createPageUrl('Dashboard')} onClick={() => setAccountMenuOpen(false)}>
          <div className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
            <span>{isContractor ? '🔧' : '🏠'}</span>
            <span>{isContractor ? 'Contractor' : 'Client'}</span>
          </div>
        </Link>
        {hasCustomerProfile && (
          <Link to={createPageUrl('ConsumerHub')} onClick={() => setAccountMenuOpen(false)}>
            <div className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
              <span>🛒</span>
              <span>Consumer Dashboard</span>
            </div>
          </Link>
        )}
        {hasMarketShop ? (
          <Link to={createPageUrl('MarketShopDashboard')} onClick={() => setAccountMenuOpen(false)}>
            <div className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
              <span>🛍️</span>
              <span>MarketShop</span>
            </div>
          </Link>
        ) : (
          <Link to={createPageUrl('MarketShopSignup')} onClick={() => setAccountMenuOpen(false)}>
            <div className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2">
              <span>🛍️</span>
              <span>+ Add MarketShop</span>
            </div>
          </Link>
        )}
      </div>
      <Link to={createPageUrl('MarketDirectory')} onClick={() => setAccountMenuOpen(false)}>
        <div className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 border-t border-slate-200">
          Browse Markets & Vendors
        </div>
      </Link>
      <button
        onClick={onLogout}
        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-slate-200 rounded-b-xl font-semibold"
      >
        Logout
      </button>
    </div>
  );
}