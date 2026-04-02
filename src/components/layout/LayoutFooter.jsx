import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Linkedin, Lightbulb } from 'lucide-react';

export default function LayoutFooter({
  createPageUrl,
  setSuggestionOpen,
}) {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-10 sm:py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex flex-col gap-1 mb-3">
              <span className="text-xl font-black tracking-tight leading-none" style={{backgroundImage:'linear-gradient(90deg,#f97316,#fb923c)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>SurfCoast</span>
              <span className="text-[8px] font-bold tracking-[3px] text-blue-300 uppercase leading-none">MARKETPLACE</span>
            </div>
            <p className="text-slate-300 max-w-sm text-sm leading-relaxed font-medium">
              Premium marketplace connecting exceptional professionals with discerning clients.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-white text-sm uppercase tracking-wide">For Contractors</h4>
            <ul className="space-y-2 text-slate-200">
              <li className="text-sm font-medium"><Link to={createPageUrl('BecomeContractor')} className="hover:text-amber-400 transition-colors">Create Profile</Link></li>
              <li className="text-sm font-medium"><Link to={createPageUrl('Jobs')} className="hover:text-amber-400 transition-colors">Browse Jobs</Link></li>
              <li className="text-sm font-medium"><Link to={createPageUrl('Blog')} className="hover:text-amber-400 transition-colors">Blog & Resources</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-white text-sm uppercase tracking-wide">For Clients</h4>
            <ul className="space-y-2 text-slate-200">
              <li className="text-sm font-medium"><Link to={createPageUrl('FindContractors')} className="hover:text-amber-400 transition-colors">Find Contractors</Link></li>
              <li className="text-sm font-medium"><Link to={createPageUrl('PostJob')} className="hover:text-amber-400 transition-colors">Post a Job</Link></li>
              <li className="text-sm font-medium"><Link to={createPageUrl('MyJobs')} className="hover:text-amber-400 transition-colors">My Job Postings</Link></li>
              <li className="text-sm font-medium"><Link to={createPageUrl('Blog')} className="hover:text-amber-400 transition-colors">Blog & Resources</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-white text-sm uppercase tracking-wide">Markets & Vendors</h4>
            <ul className="space-y-2 text-slate-200">
              <li className="text-sm font-medium"><Link to={createPageUrl('BoothsAndVendorsMap')} className="hover:text-amber-400 transition-colors">Booths & Vendors</Link></li>
              <li className="text-sm font-medium"><Link to={createPageUrl('MarketDirectory')} className="hover:text-amber-400 transition-colors">Market Directory</Link></li>
              <li className="text-sm font-medium"><Link to={createPageUrl('SwapMeetRatings')} className="hover:text-amber-400 transition-colors">Swap Meet Ratings</Link></li>
              <li className="text-sm font-medium"><Link to={createPageUrl('FarmersMarketRatings')} className="hover:text-amber-400 transition-colors">Farmers Market Ratings</Link></li>
            </ul>
          </div>

          <div className="flex flex-col items-center justify-start">
            <h4 className="font-bold mb-3 text-sm text-center text-white uppercase tracking-wide">Connect</h4>
            <div className="flex items-center gap-4 sm:gap-3">
              <a href="https://www.instagram.com/surfcoastmkt_pl/" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-amber-400 transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-amber-400 transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-amber-400 transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-amber-400 transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Global Disclaimer */}
        <div className="border-t border-slate-600 mt-6 pt-6">
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            <span className="font-bold text-white">Legal Disclaimer:</span> SurfCoast Marketplace is a connection platform only and does not employ, endorse, or guarantee any contractor, vendor, product, or service. All users participate at their own risk. By using this platform, all parties waive any and all claims against SurfCoast Marketplace, its administrators, partners, and affiliates for any damages, injuries, illness, sickness, or death. Users are solely responsible for vetting and researching all parties and services.{' '}
            <Link to={createPageUrl('Terms')} className="text-amber-400 underline hover:text-white transition-colors font-semibold">Terms of Service</Link>
            {' | '}
            <Link to={createPageUrl('PrivacyPolicy')} className="text-amber-400 underline hover:text-white transition-colors font-semibold">Privacy Policy</Link>
          </p>
        </div>

        <div className="border-t border-slate-600 mt-4 sm:mt-6 pt-4 sm:pt-6 flex flex-col gap-3 sm:gap-2 sm:flex-row sm:items-center sm:justify-between text-sm">
          <span className="text-slate-300 font-medium">© {new Date().getFullYear()} SurfCoast Marketplace. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-3 sm:gap-3">
            <Link to={createPageUrl('Terms')} className="text-slate-200 hover:text-amber-400 transition-colors text-sm font-semibold">Terms</Link>
            <span className="text-slate-500">•</span>
            <Link to={createPageUrl('PrivacyPolicy')} className="text-slate-200 hover:text-amber-400 transition-colors text-sm font-semibold">Privacy</Link>
            <button
              onClick={() => setSuggestionOpen(true)}
              className="flex items-center gap-1 text-slate-200 hover:text-amber-400 transition-colors text-sm font-semibold min-h-[44px] px-2 py-1 active:bg-slate-700 rounded sm:min-h-auto sm:py-0"
              aria-label="Send feedback"
            >
              <Lightbulb className="w-3 h-3" />
              Feedback
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}