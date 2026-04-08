import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, Lightbulb } from 'lucide-react';

// X (formerly Twitter) official logo SVG
const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.26 5.632 5.904-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/>
  </svg>
);

const ORANGE = '#f97316';
const WHITE = '#ffffff';
const LIGHT = '#e2e8f0';

export default function LayoutFooter({
  setSuggestionOpen,
  handbookLink,
}) {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-10 sm:py-12 mt-auto" style={{color: WHITE}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 sm:gap-8">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex flex-col gap-1 mb-3">
              <span className="text-xl font-black tracking-tight leading-none gradient-text">SurfCoast</span>
              <span className="text-[8px] font-bold tracking-[3px] uppercase leading-none" style={{color:'#93c5fd'}}>MARKETPLACE</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed font-semibold" style={{color: LIGHT}}>
              Premium marketplace connecting exceptional professionals with discerning clients.
            </p>
          </div>

          {/* For Contractors */}
          <div>
            <h4 className="font-bold mb-3 text-sm uppercase tracking-wide" style={{color: ORANGE}}>For Contractors</h4>
            <ul className="space-y-2">
              <li><Link to="/BecomeContractor" className="text-sm font-semibold hover:text-amber-400 transition-colors" style={{color: WHITE}}>Create Profile</Link></li>
               <li><Link to="/Jobs" className="text-sm font-semibold hover:text-amber-400 transition-colors" style={{color: WHITE}}>Browse Jobs</Link></li>
               <li><Link to="/Blog" className="text-sm font-semibold hover:text-amber-400 transition-colors" style={{color: WHITE}}>Blog & Resources</Link></li>
              {handbookLink && <li><Link to={handbookLink} className="text-sm font-semibold hover:text-amber-400 transition-colors" style={{color: WHITE}}>WAVE Handbook</Link></li>}
            </ul>
          </div>

          {/* For Clients */}
          <div>
            <h4 className="font-bold mb-3 text-sm uppercase tracking-wide" style={{color: ORANGE}}>For Clients</h4>
            <ul className="space-y-2">
              <li><Link to="/SearchContractors" className="text-sm font-semibold hover:text-amber-400 transition-colors" style={{color: WHITE}}>Find Entrepreneurs</Link></li>
               <li><Link to="/PostJob" className="text-sm font-semibold hover:text-amber-400 transition-colors" style={{color: WHITE}}>Post a Job</Link></li>
               <li><Link to="/MyJobs" className="text-sm font-semibold hover:text-amber-400 transition-colors" style={{color: WHITE}}>My Job Postings</Link></li>
               <li><Link to="/Blog" className="text-sm font-semibold hover:text-amber-400 transition-colors" style={{color: WHITE}}>Blog & Resources</Link></li>
            </ul>
          </div>

          {/* Markets & Vendors */}
          <div>
            <h4 className="font-bold mb-3 text-sm uppercase tracking-wide" style={{color: ORANGE}}>Markets & Vendors</h4>
            <ul className="space-y-2">
              <li><Link to="/BoothsAndVendorsMap" className="text-sm font-semibold hover:text-amber-400 transition-colors" style={{color: WHITE}}>Booths & Vendors</Link></li>
               <li><Link to="/MarketDirectory" className="text-sm font-semibold hover:text-amber-400 transition-colors" style={{color: WHITE}}>Market Directory</Link></li>
              <li><Link to="/swap-meet-ratings" className="text-sm font-semibold hover:text-amber-400 transition-colors" style={{color: WHITE}}>Swap Meet Ratings</Link></li>
              <li><Link to="/farmers-market-ratings" className="text-sm font-semibold hover:text-amber-400 transition-colors" style={{color: WHITE}}>Farmers Market Ratings</Link></li>
            </ul>
          </div>

          {/* Consumers */}
          <div>
            <h4 className="font-bold mb-3 text-sm uppercase tracking-wide" style={{color: ORANGE}}>Consumers</h4>
            <ul className="space-y-2">
              <li><Link to="/ConsumerHub" className="text-sm font-semibold hover:text-amber-400 transition-colors" style={{color: WHITE}}>Consumer Hub</Link></li>
               <li><Link to="/ConsumerSignup" className="text-sm font-semibold hover:text-amber-400 transition-colors" style={{color: WHITE}}>Sign Up</Link></li>
               <li><Link to="/Blog" className="text-sm font-semibold hover:text-amber-400 transition-colors" style={{color: WHITE}}>Blog & Resources</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="flex flex-col items-start sm:items-center justify-start">
            <h4 className="font-bold mb-3 text-sm uppercase tracking-wide" style={{color: ORANGE}}>Connect</h4>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/surfcoastmkt_pl/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="transition-colors hover:opacity-80" style={{color:'#E1306C'}}>
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="transition-colors hover:opacity-80" style={{color:'#1877F2'}}>
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X" className="transition-colors hover:opacity-80" style={{color:'#ffffff'}}>
                <XIcon className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="transition-colors hover:opacity-80" style={{color:'#0A66C2'}}>
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t mt-6 pt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" style={{borderColor:'#475569'}}>
          <div>
            <span className="text-sm font-semibold" style={{color: LIGHT}}>© {new Date().getFullYear()} SurfCoast Marketplace. All rights reserved.</span>
            <p className="text-xs mt-1 leading-relaxed" style={{color:'#64748b'}}>
              Connection platform only. Does not employ, endorse, or guarantee any contractor, vendor, or service. All users participate at their own risk.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <Link to="/Terms" className="text-sm font-bold hover:text-amber-400 transition-colors" style={{color: WHITE}}>Terms</Link>
             <span style={{color:'#94a3b8'}}>•</span>
             <Link to="/PrivacyPolicy" className="text-sm font-bold hover:text-amber-400 transition-colors" style={{color: WHITE}}>Privacy</Link>
             <span style={{color:'#94a3b8'}}>•</span>
             <a href="mailto:privacy@surfcoastcmp.com?subject=Do Not Sell or Share My Personal Information" className="text-sm font-bold hover:text-amber-400 transition-colors" style={{color: WHITE}}>Do Not Sell My Info</a>
            <button
              onClick={() => setSuggestionOpen(true)}
              className="flex items-center gap-1 text-sm font-bold hover:text-amber-400 transition-colors min-h-[44px] px-2 py-1 active:bg-slate-700 rounded sm:min-h-auto sm:py-0"
              style={{color: WHITE}}
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