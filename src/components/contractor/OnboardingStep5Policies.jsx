import React from 'react';
import { HardHat } from 'lucide-react';

export default function OnboardingStep5Policies() {
  return (
    <div style={{ background:"rgba(10,22,40,0.55)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px", padding:"28px", marginBottom:"16px" }}>
      <h2 style={{ fontSize:"16px", fontWeight:"700", color:"#ffffff", marginBottom:"20px", paddingBottom:"12px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>Policies & Acknowledgment</h2>
      
      <div className="space-y-6">
        {/* Platform Fee Disclosure */}
         <div className="p-5 rounded-xl border-2 border-amber-200 bg-amber-50 space-y-3">
           <div>
             <h3 className="font-bold text-amber-900 mb-2">Sliding-Scale Facilitation Fees</h3>
             <p className="text-sm text-amber-800 leading-relaxed mb-3">
               SurfCoast charges a facilitation fee based on your annual earnings tier. Your tier automatically updates each calendar year, rewarding growth and activity:
             </p>
             <ul className="text-sm text-amber-800 space-y-2 ml-4 list-disc">
               <li><strong>Bronze</strong> ($0–$15,000): 2% fee</li>
               <li><strong>Silver</strong> ($15,000–$50,000): 10% fee</li>
               <li><strong>Gold</strong> ($50,000+): 15% fee</li>
             </ul>
             <p className="text-sm text-amber-700 mt-3 italic">Example: In your first year (Bronze tier), a $1,000 job pays out $980. As you earn more, move up tiers and save on fees. All terms are outlined in the <a href="/Terms" style={{color:"#92400e", fontWeight:600}}>Terms of Service</a>.</p>
           </div>
         </div>

        {/* Single-Person Policy */}
        <div className="p-5 rounded-xl border-2 border-red-200 bg-red-50 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <HardHat className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-900">Single-Person Freelancer Policy</h3>
              <p className="text-sm text-red-700 mt-1 leading-relaxed">
                By registering on SurfCoast Marketplace, you confirm that you are a single individual freelancer. 
                Companies, businesses, partnerships, crews, or any group of two or more persons are <strong>strictly prohibited</strong>. 
                Any contractor found operating with workers, subcontractors, or associates will be <strong>permanently banned</strong> from the platform without notice.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white border border-red-200 rounded-lg p-3">
            <input
              type="checkbox"
              id="solo_confirm"
              required
              className="mt-0.5 w-4 h-4 accent-red-600"
            />
            <label htmlFor="solo_confirm" className="text-sm text-red-800 cursor-pointer leading-relaxed">
              I confirm that I am a single individual and not a company, crew, partnership, or multi-person entity. I understand that violation of this policy will result in a permanent ban from SurfCoast Contractor Market Place.
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}