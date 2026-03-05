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
          <PolicySection icon={Eye} title="Mandatory Supervision Requirements" color="border-orange-400 bg-orange-50 text-orange-900">
            <ul className="space-y-2 text-sm text-orange-900">
              <li className="flex items-start gap-2">
                <span className="font-black shrink-0">1.</span>
                The parent or legal guardian must be <strong>physically present at all times</strong> while the minor is performing any work, traveling to or from a job, or communicating with a client.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black shrink-0">2.</span>
                The minor must <strong>never be left alone</strong> with any client, homeowner, or third party encountered through this platform, regardless of how trusted they may appear.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black shrink-0">3.</span>
                The parent or guardian must <strong>personally supervise all work activities</strong>, tools used, and interactions on the job site.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black shrink-0">4.</span>
                The parent or guardian is solely responsible for <strong>all safety decisions</strong> made during any job engagement.
              </li>
            </ul>
            <CheckItem
              id="supervision"
              label="I understand and agree that I (the parent/guardian) must be physically present and actively supervising the minor at all times during any job, travel, or client interaction — without exception."
            />
          </PolicySection>

          {/* Section 2: Job Vetting */}
          <PolicySection icon={ClipboardCheck} title="Job Vetting & Pre-Screening Obligations" color="border-yellow-400 bg-yellow-50 text-yellow-900">
            <ul className="space-y-2 text-sm text-yellow-900">
              <li className="flex items-start gap-2">
                <span className="font-black shrink-0">1.</span>
                The parent or guardian must <strong>thoroughly vet every job offer</strong> before allowing the minor to accept or perform any work. This includes reviewing the job type, location, client identity, and work environment.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black shrink-0">2.</span>
                The parent or guardian must <strong>independently verify the client's identity</strong> and confirm the legitimacy of the job prior to any site visit.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black shrink-0">3.</span>
                The parent or guardian must confirm that the <strong>work environment is safe</strong>, appropriate, and free from any hazardous conditions or unsafe persons before the minor begins any work.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black shrink-0">4.</span>
                Minors must not be exposed to jobs involving heavy machinery, electrical systems, roofing, excavation, hazardous chemicals, or any occupation classified as hazardous under applicable labor laws.
              </li>
            </ul>
            <CheckItem
              id="vetting"
              label="I understand and agree to personally vet every job, verify the client's identity, inspect the work area for safety, and ensure the minor is never placed in a hazardous or inappropriate work situation."
            />
          </PolicySection>

          {/* Section 3: Presence & Contact */}
          <PolicySection icon={UserCheck} title="Presence During Client & Workplace Contact" color="border-blue-400 bg-blue-50 text-blue-900">
            <ul className="space-y-2 text-sm text-blue-900">
              <li className="flex items-start gap-2">
                <span className="font-black shrink-0">1.</span>
                The parent or guardian must be <strong>present for all in-person contact</strong> between the minor and any client or third party, including initial meetings, on-site visits, and job closeouts.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black shrink-0">2.</span>
                All <strong>significant communication decisions</strong> — including accepting jobs, negotiating terms, and signing scope agreements — must be made by the parent or guardian, not the minor.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black shrink-0">3.</span>
                The parent or guardian must <strong>escort the minor</strong> to and from all job sites and remain on-site for the duration of the work.
              </li>
            </ul>
            <CheckItem
              id="presence"
              label="I understand and agree that I must be present for all client meetings, on-site visits, and job-related interactions involving the minor, and that I will escort the minor to and from every job."
            />
          </PolicySection>

          {/* Section 4: Safety */}
          <PolicySection icon={Ban} title="Safety, Prohibited Work & Emergency Protocol" color="border-purple-400 bg-purple-50 text-purple-900">
            <ul className="space-y-2 text-sm text-purple-900">
              <li className="flex items-start gap-2">
                <span className="font-black shrink-0">1.</span>
                If at any point the parent or guardian feels the minor's <strong>safety is at risk</strong>, they must immediately remove the minor from the job site and report the incident through the platform.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black shrink-0">2.</span>
                Minors may not work in any job that involves <strong>physical danger, exposure to harmful substances, or tasks that exceed their physical or cognitive capacity</strong>.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black shrink-0">3.</span>
                The parent or guardian must have an <strong>emergency contact plan</strong> in place at all times and keep a charged mobile phone accessible throughout every job.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black shrink-0">4.</span>
                Any <strong>suspected illegal, unsafe, or inappropriate behavior</strong> by a client must be reported to the platform immediately and to local law enforcement if necessary.
              </li>
            </ul>
            <CheckItem
              id="safety"
              label="I understand and agree to maintain an emergency plan, immediately remove the minor from any unsafe situation, and report any inappropriate or illegal conduct by a client."
            />
          </PolicySection>

          {/* Section 5: Liability */}
          <PolicySection icon={Scale} title="Liability, Legal Responsibility & Platform Disclaimer" color="border-slate-400 bg-slate-50 text-slate-800">
            <div className="text-sm text-slate-700 space-y-2">
              <p>
                <strong>SurfCoast Contractor Marketplace is a platform only.</strong> It does not employ contractors, does not supervise work, and does not verify the safety of any job site or client. By allowing a minor to register and work through this platform, the parent or legal guardian expressly agrees that:
              </p>
              <ul className="space-y-1.5 ml-2">
                <li className="flex items-start gap-2">
                  <span className="font-black shrink-0">•</span>
                  SurfCoast bears <strong>no liability whatsoever</strong> for any injury, loss, damage, or harm to the minor arising from any job, client interaction, or work activity on or off the platform.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black shrink-0">•</span>
                  The parent or guardian accepts <strong>full and sole legal responsibility</strong> for the minor's participation on this platform and in all jobs undertaken.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black shrink-0">•</span>
                  This disclaimer does not limit any rights the minor may have under applicable state or federal law.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black shrink-0">•</span>
                  Applicable labor laws (federal FLSA and state-specific laws) <strong>remain in full effect</strong> and compliance is the parent/guardian's responsibility.
                </li>
              </ul>
            </div>
            <CheckItem
              id="liability"
              label="I understand and accept that SurfCoast Contractor Marketplace bears no liability for the minor's safety or conduct, and that I, as parent/guardian, assume full legal responsibility for all aspects of the minor's participation on this platform."
            />
          </PolicySection>

          {/* Final Terms Agreement */}
          <div className="rounded-xl border-2 border-red-400 bg-white p-4 space-y-3">
            <p className="font-bold text-red-800 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Final Agreement — Required to Proceed
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              By checking the box below, you (the parent or legal guardian) confirm that you have read, fully understand, and agree to all of the above disclaimers, policies, responsibilities, and terms. You acknowledge that failure to comply with these requirements may result in the minor's account being suspended or permanently removed from the platform.
            </p>
            <CheckItem
              id="terms"
              label="I have read and fully agree to all terms, disclaimers, responsibilities, and policies set out above. I confirm that I am the legal parent or guardian of the minor named in this application, and I accept full responsibility for their participation on SurfCoast Contractor Marketplace."
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