import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { HardHat, Menu, X, Briefcase, Users, Home, UserCircle, Lightbulb, Volume2, VolumeX } from 'lucide-react';
import SuggestionForm from './components/suggestions/SuggestionForm';
import FloatingAgentWidget from './components/agent/FloatingAgentWidget';

const getNavLinks = (isContractor) => {
  const baseLinks = [
    { name: 'Home', page: 'Home', icon: Home },
  ];
  if (isContractor === true) {
    baseLinks.push({ name: 'Browse Jobs', page: 'Jobs', icon: Briefcase });
  } else if (isContractor === false) {
    baseLinks.push({ name: 'Find Contractors', page: 'Contractors', icon: Users });
  }
  return baseLinks;
};

const customerLinks = [
  { name: 'My Account', page: 'CustomerAccount' },
  { name: 'My Job Postings', page: 'MyJobs' },
];

const contractorLinks = [
  { name: 'My Account', page: 'ContractorAccount' },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(true);
  const [isContractor, setIsContractor] = useState(null);
  const [musicPlaying, setMusicPlaying] = useState(true);
  const iframeRef = useRef(null);

  const toggleMusic = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    if (musicPlaying) {
      iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      setMusicPlaying(false);
    } else {
      iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      setMusicPlaying(true);
    }
  };

  const isHome = currentPageName === 'Home';

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
      {/* Hidden background music player — You Get What You Give by The New Radicals */}
      <iframe
        ref={iframeRef}
        src="https://www.youtube.com/embed/6AL7cVAiPdg?autoplay=1&loop=1&playlist=6AL7cVAiPdg&enablejsapi=1&controls=0&mute=0&volume=20"
        allow="autoplay"
        style={{ position: 'fixed', width: 0, height: 0, border: 'none', opacity: 0, pointerEvents: 'none' }}
        title="background-music"
      />
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 ${isHome ? 'bg-transparent absolute w-full' : 'bg-white border-b border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a61a047827463e7cdbc1eb/1984e69ad_IMG_8260.jpeg" 
                alt="SurfCoast Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="font-bold text-lg text-amber-600">
                SurfCoast<br/><span className="text-sm font-semibold">Contractor Market Place</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {getNavLinks(isContractor).map(link => (
                <Link key={link.page} to={createPageUrl(link.page)}>
                  <Button 
                    variant="ghost" 
                    className={`${
                      currentPageName === link.page 
                        ? isHome ? 'text-amber-400' : 'text-amber-600 bg-amber-50'
                        : isHome ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {link.name}
                  </Button>
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isContractor === false && (
                <Link to={createPageUrl('PostJob')}>
                  <Button variant="outline" className={isHome ? "border-slate-500 text-white hover:bg-white/10" : ""}>
                    Post a Job
                  </Button>
                </Link>
              )}
              <Link to={createPageUrl('BecomeContractor')}>
                <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                  Join as Contractor
                </Button>
              </Link>
              <div className="relative group">
               <Button variant="ghost" className={isHome ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900'}>
                 <UserCircle className="w-5 h-5 mr-1" />
                 My Account
               </Button>
               <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg hidden group-hover:block z-50">
                 <div className="px-4 py-2 border-b border-slate-100 text-xs font-semibold text-slate-500 bg-slate-50">
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
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className={`w-6 h-6 ${isHome ? 'text-white' : 'text-slate-900'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${isHome ? 'text-white' : 'text-slate-900'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
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
                  <Link to={createPageUrl('PostJob')} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Post a Job</Button>
                  </Link>
                )}
                <Link to={createPageUrl('BecomeContractor')} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900">
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
      <FloatingAgentWidget open={agentOpen} onClose={() => setAgentOpen(false)} />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a61a047827463e7cdbc1eb/1984e69ad_IMG_8260.jpeg" 
                  alt="SurfCoast Logo"
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <span className="font-bold text-xl text-amber-400">SurfCoast</span><br/>
                  <span className="text-xs font-semibold text-amber-400">Contractor Market Place</span>
                </div>
              </div>
              <p className="text-slate-400 max-w-sm">
                Connecting skilled construction professionals with clients who need quality work done right.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Contractors</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to={createPageUrl('BecomeContractor')} className="hover:text-white">Create Profile</Link></li>
                <li><Link to={createPageUrl('Jobs')} className="hover:text-white">Browse Jobs</Link></li>
              </ul>
            </div>
            {isContractor === false && (
             <div>
               <h4 className="font-semibold mb-4">For Clients</h4>
               <ul className="space-y-2 text-slate-400">
                 <li><Link to={createPageUrl('Contractors')} className="hover:text-white">Find Contractors</Link></li>
                 <li><Link to={createPageUrl('PostJob')} className="hover:text-white">Post a Job</Link></li>
                 <li><Link to={createPageUrl('MyJobs')} className="hover:text-white">My Job Postings</Link></li>
               </ul>
             </div>
            )}
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-sm">
            <span>© {new Date().getFullYear()} ContractorHub. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Terms')} className="text-slate-400 hover:text-white transition-colors">
                Terms & Policies
              </Link>
              <button
                onClick={() => setSuggestionOpen(true)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                Share a Suggestion
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}