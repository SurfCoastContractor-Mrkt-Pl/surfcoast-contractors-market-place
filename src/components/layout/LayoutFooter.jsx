import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Linkedin, Lightbulb } from 'lucide-react';

export default function LayoutFooter({
  createPageUrl,
  setSuggestionOpen,
}) {
  return (
    <footer className="bg-slate-800 text-slate-50 py-6 sm:py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex flex-col gap-1 mb-2">
              <span className="text-xl font-black text-white tracking-tight leading-none">SurfCoast</span>
              <span className="text-[9px] font-bold tracking-[3px] text-slate-400 uppercase leading-none ml-0.5">MARKETPLACE</span>
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

          <div>
            <h4 className="font-semibold mb-3">For Clients</h4>
            <ul className="space-y-1 text-slate-400">
              <li className="text-xs"><Link to={createPageUrl('FindContractors')} className="hover:text-white">Find Contractors</Link></li>
              <li className="text-xs"><Link to={createPageUrl('PostJob')} className="hover:text-white">Post a Job</Link></li>
              <li className="text-xs"><Link to={createPageUrl('MyJobs')} className="hover:text-white">My Job Postings</Link></li>
              <li className="text-xs"><Link to={createPageUrl('Blog')} className="hover:text-white">Blog & Resources</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Markets & Vendors</h4>
            <ul className="space-y-1 text-slate-400">
              <li className="text-xs"><Link to={createPageUrl('BoothsAndVendorsMap')} className="hover:text-white">Booths & Vendors</Link></li>
              <li className="text-xs"><Link to={createPageUrl('MarketDirectory')} className="hover:text-white">Market Directory</Link></li>
              <li className="text-xs"><Link to={createPageUrl('SwapMeetRatings')} className="hover:text-white">Swap Meet Ratings</Link></li>
              <li className="text-xs"><Link to={createPageUrl('FarmersMarketRatings')} className="hover:text-white">Farmers Market Ratings</Link></li>
            </ul>
          </div>

          <div className="flex flex-col items-center justify-start">
            <h4 className="font-semibold mb-3 text-sm text-center">Connect</h4>
            <div className="flex items-center gap-4 sm:gap-3">
              <a href="https://www.instagram.com/surfcoastmkt_pl/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 transition-colors" aria-label="LinkedIn">
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
            <Link to={createPageUrl('Terms')} className="text-slate-400 hover:text-white transition-colors text-xs">Terms</Link>
            <span className="text-slate-500">•</span>
            <Link to={createPageUrl('PrivacyPolicy')} className="text-slate-400 hover:text-white transition-colors text-xs">Privacy</Link>
            <button
              onClick={() => setSuggestionOpen(true)}
              className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors text-xs min-h-[44px] px-2 py-1 active:bg-slate-700 rounded sm:min-h-auto sm:py-0"
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