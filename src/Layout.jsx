import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Menu, X, Briefcase, Users, Home, UserCircle, Lightbulb, MessageCircle } from 'lucide-react';

import SuggestionForm from './components/suggestions/SuggestionForm';
import FloatingAgentWidget from './components/agent/FloatingAgentWidget';
import useGeoCheck from './components/security/useGeoCheck';


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
  const isBackNav = useRef(false);

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
          const contractors = await base44.entities.Contractor.filter({ email: user.email });
          setIsContractor(contractors && contractors.length > 0);
        } else {
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

      {/* Navigation */}
      <nav className="z-50 bg-white backdrop-blur-sm border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-0 relative flex-shrink-0">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a61a047827463e7cdbc1eb/e463c3ecd_SGN_05_15_2022_1652641626318_Original.jpeg" alt="SurfCoast" className="h-[69px] w-[69px] object-contain" />
              <div className="hidden sm:flex flex-col leading-tight">
               <span className="font-serif font-bold text-lg" style={{color: '#1E5A96'}}>
                  SurfCoast
               </span>
               <span className="text-xs font-medium tracking-widest" style={{color: '#1E5A96'}}>
                  MARKETPLACE
               </span>
              </div>
            </Link>

            {/* Desktop Nav */}
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

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">

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
              <div className="relative group">
               <Button variant="ghost" className="text-slate-600 hover:text-slate-900 text-sm">
                  <UserCircle className="w-5 h-5 mr-1" />
                  Account
                </Button>
               <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg hidden group-hover:block z-50">
                  <div className="px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50/80">
                    {isContractor ? 'CONTRACTOR' : 'CUSTOMER'}
                  </div>
                  {(isContractor ? contractorLinks : customerLinks).map(link => (
                    <Link key={link.page} to={createPageUrl(link.page)}>
                      <div className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl">
                        {link.name}
                      </div>
                    </Link>
                  ))}
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
                    onClick={() => setMobileMenuOpen(false)}
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
                  {(isContractor ? contractorLinks : customerLinks).map(link => (
                    <Link key={link.page} to={createPageUrl(link.page)} onClick={() => setMobileMenuOpen(false)}>
                      <div className="flex items-center gap-3 p-3 rounded-lg text-slate-600">
                        <UserCircle className="w-5 h-5" />
                        {link.name}
                      </div>
                    </Link>
                  ))}
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
      <footer className="bg-slate-800 text-slate-50 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a61a047827463e7cdbc1eb/e463c3ecd_SGN_05_15_2022_1652641626318_Original.jpeg" alt="SurfCoast" className="w-8 h-8 flex-shrink-0" />
                <div>
                  <span className="font-serif font-bold text-lg" style={{color: '#1E5A96'}}>SurfCoast</span><br/>
                  <span className="text-xs font-semibold text-slate-400">MARKETPLACE</span>
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
              <h4 className="font-semibold mb-2 text-sm">Connect</h4>
              <p className="text-xs text-slate-400 text-center">Follow us on social media</p>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-3 pt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-slate-500 text-xs">
            <span className="text-xs">© {new Date().getFullYear()} SurfCoast Contractor Market Place. All rights reserved.</span>
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('Terms')} className="text-slate-400 hover:text-white transition-colors text-xs">
                Terms & Policies
              </Link>
              <button
                onClick={() => setSuggestionOpen(true)}
                className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors text-xs"
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