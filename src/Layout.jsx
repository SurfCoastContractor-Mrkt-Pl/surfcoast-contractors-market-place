import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { HardHat, Menu, X, Briefcase, Users, Home, UserCircle, Lightbulb } from 'lucide-react';
import SuggestionForm from './components/suggestions/SuggestionForm';
import FloatingAgentWidget from './components/agent/FloatingAgentWidget';

const navLinks = [
  { name: 'Home', page: 'Home', icon: Home },
  { name: 'Find Contractors', page: 'Contractors', icon: Users },
  { name: 'Browse Jobs', page: 'Jobs', icon: Briefcase },
];

const accountLinks = [
  { name: 'My Account (Customer)', page: 'CustomerAccount' },
  { name: 'My Account (Contractor)', page: 'ContractorAccount' },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(true);

  const isHome = currentPageName === 'Home';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 ${isHome ? 'bg-transparent absolute w-full' : 'bg-white border-b border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-lg ${isHome ? 'bg-amber-500' : 'bg-slate-900'} flex items-center justify-center`}>
                <HardHat className={`w-5 h-5 ${isHome ? 'text-slate-900' : 'text-amber-400'}`} />
              </div>
              <span className={`font-bold text-xl ${isHome ? 'text-white' : 'text-slate-900'}`}>
                ContractorHub
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
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
              <Link to={createPageUrl('PostJob')}>
                <Button variant="outline" className={isHome ? "border-slate-500 text-white hover:bg-white/10" : ""}>
                  Post a Job
                </Button>
              </Link>
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
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg hidden group-hover:block z-50">
                  {accountLinks.map(link => (
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
              {navLinks.map(link => {
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
                <Link to={createPageUrl('PostJob')} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Post a Job</Button>
                </Link>
                <Link to={createPageUrl('BecomeContractor')} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900">
                    Join as Contractor
                  </Button>
                </Link>
                <div className="border-t border-slate-100 pt-2 space-y-1">
                  {accountLinks.map(link => (
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
                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                  <HardHat className="w-5 h-5 text-slate-900" />
                </div>
                <span className="font-bold text-xl">ContractorHub</span>
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
            <div>
              <h4 className="font-semibold mb-4">For Clients</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to={createPageUrl('Contractors')} className="hover:text-white">Find Contractors</Link></li>
                <li><Link to={createPageUrl('PostJob')} className="hover:text-white">Post a Job</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-sm">
            <span>© {new Date().getFullYear()} ContractorHub. All rights reserved.</span>
            <button
              onClick={() => setSuggestionOpen(true)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors text-sm"
            >
              <Lightbulb className="w-4 h-4" />
              Share a Suggestion
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}