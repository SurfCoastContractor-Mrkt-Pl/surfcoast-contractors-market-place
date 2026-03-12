import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Eye, UserCheck, ClipboardCheck, Ban, Scale, ChevronDown, ChevronUp } from 'lucide-react';

const RedAlert = ({ children }) => (
  <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-400 rounded-xl">
    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
    <div className="text-sm text-red-900 font-semibold leading-relaxed">{children}</div>
  </div>
);

const PolicySection = ({ icon: Icon, title, color, children }) => (
  <div className={`rounded-xl border-2 ${color} p-4 space-y-3`}>
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 shrink-0" />
      <h4 className="font-bold text-sm uppercase tracking-wide">{title}</h4>
    </div>
    {children}
  </div>
);

export default function MinorGuardianDisclaimer({ onAllAgreed }) {
  const [expanded, setExpanded] = useState(true);
  const [checks, setChecks] = useState({
    supervision: false,
    vetting: false,
    presence: false,
    safety: false,
    liability: false,
    terms: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  const toggle = (key) => {
    const updated = { ...checks, [key]: !checks[key] };
    setChecks(updated);
    if (Object.values(updated).every(Boolean) && onAllAgreed) {
      onAllAgreed(true);
    } else if (onAllAgreed) {
      onAllAgreed(false);
    }
  };

  const CheckItem = ({ id, label }) => (
    <div className="flex items-start gap-3 p-3 bg-white border border-red-200 rounded-lg mt-2">
      <input
        type="checkbox"
        id={id}
        checked={checks[id]}
        onChange={() => toggle(id)}
        className="mt-0.5 w-4 h-4 accent-red-600 shrink-0"
      />
      <label htmlFor={id} className="text-sm text-slate-800 cursor-pointer leading-relaxed">
        {label}
      </label>
    </div>
  );

  return (
    <div className="rounded-2xl border-4 border-red-500 bg-red-50 overflow-hidden shadow-lg">
      {/* Top Banner */}
      <div className="bg-red-600 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-7 h-7 text-white shrink-0" />
          <div>
            <p className="text-white font-black text-base uppercase tracking-wider">⚠ Important Legal Notice</p>
            <p className="text-red-100 text-xs mt-0.5">Parent / Guardian Disclaimer, Policy & Terms for Minor Contractors</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white hover:text-red-200 transition-colors"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="p-5 space-y-5">

          {/* Critical Red Alerts */}
          <RedAlert>
            NEVER leave the minor unattended at a job site, with a client, or with any person encountered through this platform. The parent or guardian MUST be physically present at all times during any work engagement.
          </RedAlert>
          <RedAlert>
            ALL RESPONSIBILITY for the minor's safety, conduct, and wellbeing during any job falls entirely on the parent or legal guardian. SurfCoast Contractor Marketplace bears no liability for any incident, injury, or harm involving the minor while working.
          </RedAlert>

          {/* Section 1: Supervision */}
          <PolicySection icon={Eye} title="Mandatory Supervision" color="border-orange-400 bg-orange-50 text-orange-900">
            <p className="text-sm text-orange-900">You must be <strong>physically present at all times</strong> — during work, travel, and any client interaction. The minor must never be left alone with a client or third party.</p>
            <CheckItem
              id="supervision"
              label="I will be physically present and supervising the minor at all times during any job, travel, or client interaction — without exception."
            />
          </PolicySection>

          {/* Section 2: Job Vetting */}
          <PolicySection icon={ClipboardCheck} title="Job Vetting Obligations" color="border-yellow-400 bg-yellow-50 text-yellow-900">
            <p className="text-sm text-yellow-900">You must <strong>vet every job</strong> before the minor accepts it — verify the client's identity, inspect the work environment, and confirm it is safe and appropriate. No hazardous work (machinery, electrical, roofing, chemicals, etc.).</p>
            <CheckItem
              id="vetting"
              label="I will personally vet every job, verify the client, and ensure the minor is never placed in a hazardous or inappropriate work situation."
            />
          </PolicySection>

          {/* Section 3: Presence & Contact */}
          <PolicySection icon={UserCheck} title="Presence & Client Contact" color="border-blue-400 bg-blue-50 text-blue-900">
            <p className="text-sm text-blue-900">You must be present for all in-person meetings, on-site visits, and job closeouts. All major decisions (accepting jobs, signing scopes) must be made by you, not the minor. You must escort the minor to and from every job.</p>
            <CheckItem
              id="presence"
              label="I will be present for all client meetings and on-site visits, and will escort the minor to and from every job."
            />
          </PolicySection>

          {/* Section 4: Safety */}
          <PolicySection icon={Ban} title="Safety & Emergency Protocol" color="border-purple-400 bg-purple-50 text-purple-900">
            <p className="text-sm text-purple-900">If the minor's safety is at risk, remove them immediately and report via the platform. Minors may not work in physically dangerous conditions. Have an emergency plan and a charged phone at all times.</p>
            <CheckItem
              id="safety"
              label="I will maintain an emergency plan, immediately remove the minor from any unsafe situation, and report any inappropriate conduct."
            />
          </PolicySection>

          {/* Section 5: Liability */}
          <PolicySection icon={Scale} title="Liability & Platform Disclaimer" color="border-slate-400 bg-slate-50 text-slate-800">
            <p className="text-sm text-slate-700">SurfCoast is a platform only — it bears <strong>no liability</strong> for the minor's safety, conduct, or any harm arising from jobs. You, as parent/guardian, accept <strong>full legal responsibility</strong>. Federal FLSA and all applicable state labor laws remain in effect.</p>
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 underline hover:text-amber-700">Read full Terms & Acknowledgements →</a>
            <CheckItem
              id="liability"
              label="I accept that SurfCoast bears no liability for the minor, and I assume full legal responsibility for all aspects of their participation on this platform."
            />
          </PolicySection>

          {/* Final Terms Agreement */}
          <div className="rounded-xl border-2 border-red-400 bg-white p-4 space-y-3">
            <p className="font-bold text-red-800 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Final Agreement — Required to Proceed
            </p>
            <CheckItem
              id="terms"
              label="I have read and fully agree to all terms above. I confirm I am the legal parent or guardian and accept full responsibility for the minor's participation on SurfCoast."
            />
          </div>

          {/* Status Banner */}
          {allChecked ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border-2 border-green-400 rounded-xl text-sm text-green-800 font-semibold">
              <UserCheck className="w-5 h-5 shrink-0 text-green-600" />
              All disclaimers acknowledged. You may proceed to upload required documents.
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-300 rounded-xl text-sm text-red-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {Object.values(checks).filter(Boolean).length} of {Object.keys(checks).length} acknowledgements completed — all are required before submitting.
            </div>
          )}
        </div>
      )}
    </div>
  );
}