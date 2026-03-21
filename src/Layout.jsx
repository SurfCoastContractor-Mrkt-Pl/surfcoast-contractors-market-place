import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Menu, X, Briefcase, Users, Home, UserCircle, Lightbulb, MessageCircle, Instagram, Facebook, Twitter, Linkedin, ArrowLeft } from 'lucide-react';

import SuggestionForm from './components/suggestions/SuggestionForm';
import FloatingAgentWidget from './components/agent/FloatingAgentWidget';
import useGeoCheck from './components/security/useGeoCheck';
import { useConsumerMode } from '@/lib/ConsumerModeContext';
import ShoppingCart from '@/components/consumer/ShoppingCart';


const getNavLinks = (isContractor) => {
  const baseLinks = [
    { name: 'Home', page: 'Home', icon: Home },
  ];
  if (isContractor === true) {
    baseLinks.push({ name: 'Browse Jobs', page: 'Jobs', icon: Briefcase });
  } else if (isContractor === false) {
    baseLinks.push({ name: 'Find Contractors', page: 'FindContractors', icon: Users });
  }
  baseLinks.push({ name: 'Messages', page: 'Messaging', icon: MessageCircle });
  return baseLinks;
};

const customerLinks = [
  { name: 'My Account', page: 'CustomerAccount' },
  { name: 'My Job Postings', page: 'MyJobs' },
  { name: 'Earn Credits', page: 'Referrals' },
];

const contractorLinks = [
  { name: 'My Account', page: 'ContractorAccount' },
  { name: 'Earn Credits', page: 'Referrals' },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [isContractor, setIsContractor] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isBackNav = useRef(false);
  const { isConsumerMode } = useConsumerMode();

  const isHome = currentPageName === 'Home';
  useGeoCheck();

  useEffect(() => {
    const handlePopState = () => {
      isBackNav.current = true;
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!isBackNav.current) {
      window.scrollTo(0, 0);
    } else {
      isBackNav.current = false;
    }
  }, [currentPageName]);

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          setIsLoggedIn(true);
          const contractors = await base44.entities.Contractor.filter({ email: user.email });
          setIsContractor(contractors && contractors.length > 0);
        } else {
          setIsLoggedIn(false);
          setIsContractor(false);
        }
      } catch {
        setIsContractor(false);
      }
    };
    checkUserType();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">

      {/* Navigation - Unified Header */}
      <nav className="z-50 bg-white backdrop-blur-sm border-b border-slate-200/50 sticky top-0">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Logo - Flush Left */}
          <Link to="/" className="flex items-center relative flex-shrink-0 pl-4 sm:pl-6 lg:pl-8">
            <div className="flex flex-col items-center">
              <span className="font-serif font-bold text-base sunset-gradient-text">SurfCoast</span>
              <span className="text-xs font-semibold uppercase sunset-gradient-text marketplace-spacing">MARKETPLACE</span>
            </div>
          </Link>

          <div className="max-w-7xl flex-1 mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

            {/* Desktop Nav - Left Group */}
            <div className="hidden lg:flex items-center gap-1 flex-shrink">
              {getNavLinks(isContractor).map(link => (
                <Link key={link.page} to={createPageUrl(link.page)}>
                  <Button 
                  variant="ghost" 
                  className={`text-sm ${
                    currentPageName === link.page 
                      ? 'bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  style={currentPageName === link.page ? {color: '#1E5A96'} : {}}
                  >
                    {link.name}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Right Group - CTA Buttons & Account */}
             <div className="hidden lg:flex items-center gap-2 flex-shrink-0 ml-auto">

              {isContractor === false && (
                <Link to={createPageUrl('QuickJobPost')}>
                  <Button className="text-white font-medium text-sm" style={{backgroundColor: '#1E5A96'}}>
                    Post a Job
                  </Button>
                </Link>
              )}
              <Link to={createPageUrl('BecomeContractor')}>
                <Button className="text-white font-medium text-sm" style={{backgroundColor: '#1E5A96'}}>
                  Join as Contractor
                </Button>
              </Link>
              {!isLoggedIn && (
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="text-slate-600 hover:text-slate-900 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Login
                </button>
              )}
              <div className="relative group">
               <Button variant="ghost" className="text-slate-600 hover:text-slate-900 text-sm">
                  <UserCircle className="w-5 h-5 mr-1" />
                  Account
                </Button>
               <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg hidden group-hover:block z-50">
                  <div className="px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50/80">
                    {isContractor ? 'CONTRACTOR' : 'CUSTOMER'}
                  </div>
                  {isLoggedIn && (
                    <Link to={createPageUrl('Dashboard')}>
                      <div className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                        My Dashboard
                      </div>
                    </Link>
                  )}
                  {(isContractor ? contractorLinks : customerLinks).map(link => (
                    <Link key={link.page} to={createPageUrl(link.page)}>
                      <div className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                        {link.name}
                      </div>
                    </Link>
                  ))}
                  <Link to={createPageUrl('MarketDirectory')}>
                    <div className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 border-t border-slate-200">
                      Browse Markets & Vendors
                    </div>
                  </Link>
                  <button
                    onClick={() => base44.auth.logout()}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-slate-200 rounded-b-xl font-semibold"
                  >
                    Logout
                  </button>
                </div>
               </div>
              </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 flex-shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-900" />
              ) : (
                <Menu className="w-6 h-6 text-slate-900" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200">
            <div className="px-4 py-4 space-y-2">
              {getNavLinks(isContractor).map(link => {
                const Icon = link.icon;
                return (
                  <Link 
                    key={link.page} 
                    to={createPageUrl(link.page)}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${
                      currentPageName === link.page ? 'bg-amber-50 text-amber-600' : 'text-slate-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                      {link.name}
                    </div>
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                {isContractor === false && (
                  <Link to={createPageUrl('QuickJobPost')} onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full text-white font-medium" style={{backgroundColor: '#1E5A96'}}>Post a Job</Button>
                  </Link>
                )}
                <Link to={createPageUrl('BecomeContractor')} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full text-white font-medium" style={{backgroundColor: '#1E5A96'}}>
                    Join as Contractor
                  </Button>
                </Link>
                <div className="border-t border-slate-100 pt-2 space-y-1">
                   <div className="px-3 py-2 text-xs font-semibold text-slate-500">
                     {isContractor ? 'CONTRACTOR' : 'CUSTOMER'}
                   </div>
                   {isLoggedIn && (
                     <Link to={createPageUrl('Dashboard')} onClick={() => {
                       setMobileMenuOpen(false);
                       window.scrollTo(0, 0);
                     }}>
                       <div className="flex items-center gap-3 p-3 rounded-lg text-slate-600">
                         <ArrowLeft className="w-4 h-4" />
                         My Dashboard
                       </div>
                     </Link>
                   )}
                   {(isContractor ? contractorLinks : customerLinks).map(link => (
                     <Link key={link.page} to={createPageUrl(link.page)} onClick={() => {
                       setMobileMenuOpen(false);
                       window.scrollTo(0, 0);
                     }}>
                       <div className="flex items-center gap-3 p-3 rounded-lg text-slate-600">
                         <UserCircle className="w-5 h-5" />
                         {link.name}
                       </div>
                     </Link>
                   ))}
                   <Link to={createPageUrl('MarketDirectory')} onClick={() => setMobileMenuOpen(false)}>
                     <div className="flex items-center gap-3 p-3 rounded-lg text-slate-600 border-t border-slate-100">
                       Browse Markets & Vendors
                     </div>
                   </Link>
                   <button
                     onClick={() => {
                       setMobileMenuOpen(false);
                       base44.auth.logout();
                     }}
                     className="w-full text-left px-3 py-3 rounded-lg text-red-600 border-t border-slate-100"
                   >
                     Logout
                   </button>
                 </div>
              </div>
            </div>
          </div>
        )}
        </nav>

        <SuggestionForm open={suggestionOpen} onClose={() => setSuggestionOpen(false)} />
        <FloatingAgentWidget open={agentOpen} onClose={() => setAgentOpen(false)} onOpen={() => setAgentOpen(true)} />

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-slate-800 text-slate-50 py-6 sm:py-8 mt-auto">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a61a047827463e7cdbc1eb/e463c3ecd_SGN_05_15_2022_1652641626318_Original.jpeg" alt="SurfCoast" className="w-8 h-8 flex-shrink-0" />
                <div className="text-center">
                  <span className="font-serif font-bold text-lg sunset-gradient-text">SurfCoast</span><br/>
                  <span className="text-xs font-semibold uppercase sunset-gradient-text marketplace-spacing">MARKETPLACE</span>
                </div>
              </div>
              <p className="text-slate-300 max-w-sm text-xs">
                Premium marketplace connecting exceptional professionals with discerning clients.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Contractors</h4>
              <ul className="space-y-1 text-slate-400">
                <li className="text-xs"><Link to={createPageUrl('BecomeContractor')} className="hover:text-white">Create Profile</Link></li>
                <li className="text-xs"><Link to={createPageUrl('Jobs')} className="hover:text-white">Browse Jobs</Link></li>
                <li className="text-xs"><Link to={createPageUrl('Blog')} className="hover:text-white">Blog & Resources</Link></li>
              </ul>
            </div>
            {isContractor === false && (
             <div>
               <h4 className="font-semibold mb-3">For Clients</h4>
               <ul className="space-y-1 text-slate-400">
                 <li className="text-xs"><Link to={createPageUrl('FindContractors')} className="hover:text-white">Find Contractors</Link></li>
                 <li className="text-xs"><Link to={createPageUrl('PostJob')} className="hover:text-white">Post a Job</Link></li>
                 <li className="text-xs"><Link to={createPageUrl('MyJobs')} className="hover:text-white">My Job Postings</Link></li>
                 <li className="text-xs"><Link to={createPageUrl('Blog')} className="hover:text-white">Blog & Resources</Link></li>
               </ul>
             </div>
            )}
            <div className="flex flex-col items-center justify-start">
              <h4 className="font-semibold mb-3 text-sm text-center">Connect</h4>
              <div className="flex items-center gap-4 sm:gap-3">
                <a href="https://www.instagram.com/surfcoastmkt_pl/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          {/* Global Disclaimer */}
          <div className="border-t border-slate-700 mt-4 pt-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300">Legal Disclaimer:</span> SurfCoast Marketplace is a connection platform only and does not employ, endorse, or guarantee any contractor, vendor, product, or service. All users participate at their own risk. By using this platform, all parties waive any and all claims against SurfCoast Marketplace, its administrators, partners, and affiliates for any damages, injuries, illness, sickness, or death. Users are solely responsible for vetting and researching all parties and services.{' '}
              <Link to={createPageUrl('Terms')} className="text-slate-300 underline hover:text-white transition-colors">Terms of Service</Link>
              {' | '}
              <Link to={createPageUrl('PrivacyPolicy')} className="text-slate-300 underline hover:text-white transition-colors">Privacy Policy</Link>
            </p>
          </div>

          <div className="border-t border-slate-800 mt-4 sm:mt-6 pt-4 sm:pt-6 flex flex-col gap-3 sm:gap-2 sm:flex-row sm:items-center sm:justify-between text-slate-500 text-xs">
            <span className="text-xs">© {new Date().getFullYear()} SurfCoast Contractor Market Place. All rights reserved.</span>
            <div className="flex flex-wrap items-center gap-3 sm:gap-3">
              <Link to={createPageUrl('Terms')} className="text-slate-400 hover:text-white transition-colors text-xs">
                Terms
              </Link>
              <span className="text-slate-500">•</span>
              <Link to={createPageUrl('PrivacyPolicy')} className="text-slate-400 hover:text-white transition-colors text-xs">
                Privacy
              </Link>
              <button
                onClick={() => setSuggestionOpen(true)}
                className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors text-xs min-h-[44px] px-2 py-1 active:bg-slate-700 rounded sm:min-h-auto sm:py-0"
              >
                <Lightbulb className="w-3 h-3" />
                Feedback
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}