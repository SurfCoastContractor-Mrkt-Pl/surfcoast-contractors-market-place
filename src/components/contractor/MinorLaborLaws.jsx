import React from 'react';
import { AlertTriangle, Scale } from 'lucide-react';

// Detect state from a location string like "San Diego, CA" or "Portland, OR"
export function detectState(location = '') {
  if (!location) return null;
  const upper = location.toUpperCase();

  // Match common state abbreviations at end or after comma
  const stateAbbrevMap = {
    'CA': 'CA', 'CALIFORNIA': 'CA',
    'OR': 'OR', 'OREGON': 'OR',
    'WA': 'WA', 'WASHINGTON': 'WA',
    'TX': 'TX', 'TEXAS': 'TX',
    'NY': 'NY', 'NEW YORK': 'NY',
    'FL': 'FL', 'FLORIDA': 'FL',
    'AZ': 'AZ', 'ARIZONA': 'AZ',
    'NV': 'NV', 'NEVADA': 'NV',
    'CO': 'CO', 'COLORADO': 'CO',
    'IL': 'IL', 'ILLINOIS': 'IL',
    'OH': 'OH', 'OHIO': 'OH',
    'PA': 'PA', 'PENNSYLVANIA': 'PA',
    'GA': 'GA', 'GEORGIA': 'GA',
    'NC': 'NC', 'NORTH CAROLINA': 'NC',
    'MI': 'MI', 'MICHIGAN': 'MI',
    'MA': 'MA', 'MASSACHUSETTS': 'MA',
    'VA': 'VA', 'VIRGINIA': 'VA',
    'MN': 'MN', 'MINNESOTA': 'MN',
    'WI': 'WI', 'WISCONSIN': 'WI',
    'MO': 'MO', 'MISSOURI': 'MO',
    'TN': 'TN', 'TENNESSEE': 'TN',
    'IN': 'IN', 'INDIANA': 'IN',
    'MD': 'MD', 'MARYLAND': 'MD',
    'CT': 'CT', 'CONNECTICUT': 'CT',
    'NJ': 'NJ', 'NEW JERSEY': 'NJ',
    'UT': 'UT', 'UTAH': 'UT',
    'ID': 'ID', 'IDAHO': 'ID',
    'MT': 'MT', 'MONTANA': 'MT',
    'WY': 'WY', 'WYOMING': 'WY',
    'ND': 'ND', 'NORTH DAKOTA': 'ND',
    'SD': 'SD', 'SOUTH DAKOTA': 'SD',
    'NE': 'NE', 'NEBRASKA': 'NE',
    'KS': 'KS', 'KANSAS': 'KS',
    'OK': 'OK', 'OKLAHOMA': 'OK',
    'NM': 'NM', 'NEW MEXICO': 'NM',
    'HI': 'HI', 'HAWAII': 'HI',
    'AK': 'AK', 'ALASKA': 'AK',
    'LA': 'LA', 'LOUISIANA': 'LA',
    'MS': 'MS', 'MISSISSIPPI': 'MS',
    'AL': 'AL', 'ALABAMA': 'AL',
    'SC': 'SC', 'SOUTH CAROLINA': 'SC',
    'KY': 'KY', 'KENTUCKY': 'KY',
    'AR': 'AR', 'ARKANSAS': 'AR',
    'WV': 'WV', 'WEST VIRGINIA': 'WV',
    'NH': 'NH', 'NEW HAMPSHIRE': 'NH',
    'ME': 'ME', 'MAINE': 'ME',
    'RI': 'RI', 'RHODE ISLAND': 'RI',
    'VT': 'VT', 'VERMONT': 'VT',
    'DE': 'DE', 'DELAWARE': 'DE',
  };

  // Try to match state after comma (e.g. "San Diego, CA")
  const afterComma = upper.split(',').pop()?.trim();
  if (afterComma && stateAbbrevMap[afterComma]) return stateAbbrevMap[afterComma];

  // Try matching full state name or abbreviation anywhere in the string
  for (const [key, val] of Object.entries(stateAbbrevMap)) {
    const regex = new RegExp(`\\b${key}\\b`);
    if (regex.test(upper)) return val;
  }
  return null;
}

const STATE_LAWS = {
  CA: {
    stateName: 'California',
    minAge: 14,
    permitRequired: true,
    permitNote: 'A California Entertainment Work Permit (or work permit issued by the minor\'s school) is required before work begins. Permits must be renewed annually.',
    maxHoursSchoolWeek: 18,
    maxHoursNonSchoolWeek: 40,
    platformLimit: 20,
    maxHoursSchoolDay: 3,
    maxHoursNonSchoolDay: 8,
    ageRestrictions: [
      'Ages 14–15: Max 3 hours on school days, 8 hours on non-school days, 18 hours/week during school, 40 hours/week during non-school weeks.',
      'Ages 16–17: Max 4 hours on school days, 8 hours on non-school days, 48 hours/week (platform cap is 20 hrs/week regardless).',
      'No work between 10:00 PM and 5:00 AM on nights before school days (16–17); 10:00 PM and 5:00 AM for 14–15.',
    ],
    additionalRules: [
      'California requires a Coogan Law Trust Account: 15% of all gross earnings must be set aside in a blocked trust account.',
      'Parent or guardian must be present on set/job site at all times for minors under 16.',
      'All wages must be paid directly to the minor, not the parent/guardian.',
      'Minors may not work in hazardous occupations as defined by the California Labor Code.',
    ],
    legalRef: 'California Labor Code §§ 1290–1308; Education Code § 49110 et seq.; IWC Wage Orders.',
    permitUrl: 'https://www.dir.ca.gov/dlse/DLSE-CL.htm',
  },
  OR: {
    stateName: 'Oregon',
    minAge: 14,
    permitRequired: true,
    permitNote: 'An Oregon Employment Certificate is required for minors under 18, issued by the minor\'s school or the Oregon Bureau of Labor and Industries (BOLI).',
    maxHoursSchoolWeek: 18,
    maxHoursNonSchoolWeek: 40,
    platformLimit: 20,
    ageRestrictions: [
      'Ages 14–15: Max 3 hours/day on school days, 8 hours/day on non-school days, 18 hours/week during school sessions.',
      'Ages 16–17: Max 44 hours/week (platform cap is 20 hrs/week).',
      'No work before 7:00 AM or after 7:00 PM during school weeks (extends to 9:00 PM in summer for 16–17).',
    ],
    additionalRules: [
      'Hazardous work is prohibited for all minors under 18.',
      'Parent or guardian must sign work permit application.',
    ],
    legalRef: 'Oregon Revised Statutes § 653.305–653.450; OAR 839-021.',
    permitUrl: 'https://www.oregon.gov/boli/workers/Pages/child-labor.aspx',
  },
  WA: {
    stateName: 'Washington',
    minAge: 14,
    permitRequired: true,
    permitNote: 'A Washington State Work Permit (Minor Work Permit) is required. Issued through the Washington State Department of Labor & Industries.',
    maxHoursSchoolWeek: 16,
    maxHoursNonSchoolWeek: 40,
    platformLimit: 20,
    ageRestrictions: [
      'Ages 14–15: Max 3 hours/day on school days, 8 hours/day on non-school days, 16 hours/week during school.',
      'Ages 16–17: Max 4 hours on school days, 8 hours on non-school days, 48 hours/week (platform cap is 20 hrs/week).',
      'No work before 7:00 AM or after 10:00 PM.',
    ],
    additionalRules: [
      'Hazardous occupations are strictly prohibited for minors.',
      'Employers must keep records of all minor workers\' permits on file.',
    ],
    legalRef: 'Washington Administrative Code (WAC) 296-125; RCW 49.12.',
    permitUrl: 'https://lni.wa.gov/workers-rights/youth-employment/',
  },
  TX: {
    stateName: 'Texas',
    minAge: 14,
    permitRequired: false,
    permitNote: 'Texas does not require a formal work permit for minors, but parental consent is required and must be on file.',
    maxHoursSchoolWeek: 18,
    maxHoursNonSchoolWeek: 40,
    platformLimit: 20,
    ageRestrictions: [
      'Ages 14–15: Max 3 hours/day on school days, 8 hours/day on non-school days, 18 hours/week during school.',
      'No work before 7:00 AM or after 7:00 PM during the school year (9:00 PM in summer).',
      'Ages 16–17: No state-imposed hour limits, but platform cap of 20 hrs/week applies.',
    ],
    additionalRules: [
      'Minors may not engage in hazardous occupations.',
      'Parental consent form is required and must be retained.',
    ],
    legalRef: 'Texas Labor Code §§ 51.001–51.117; 40 TAC § 817.',
    permitUrl: 'https://www.twc.texas.gov/businesses/child-labor-law',
  },
  NY: {
    stateName: 'New York',
    minAge: 14,
    permitRequired: true,
    permitNote: 'A New York State Employment Certificate (working papers) is required, issued through the minor\'s school district.',
    maxHoursSchoolWeek: 18,
    maxHoursNonSchoolWeek: 40,
    platformLimit: 20,
    ageRestrictions: [
      'Ages 14–15: Max 3 hours/day on school days, 8 hours/day non-school days, 18 hours/week during school.',
      'No work before 7:00 AM or after 7:00 PM (9:00 PM non-school days in summer).',
      'Ages 16–17: Max 4 hours on school days, 8 hours non-school days, 48 hours/week (platform cap is 20 hrs/week).',
    ],
    additionalRules: [
      'Employment certificate must be on file before work begins.',
      'Hazardous work prohibited for all minors under 18.',
    ],
    legalRef: 'New York Labor Law §§ 130–141; 12 NYCRR Part 11.',
    permitUrl: 'https://dol.ny.gov/working-minors',
  },
  FL: {
    stateName: 'Florida',
    minAge: 14,
    permitRequired: true,
    permitNote: 'A Florida Work Permit is required for minors under 16, issued by the minor\'s school principal.',
    maxHoursSchoolWeek: 15,
    maxHoursNonSchoolWeek: 40,
    platformLimit: 20,
    ageRestrictions: [
      'Ages 14–15: Max 3 hours/day on school days, 8 hours/day non-school days, 15 hours/week during school.',
      'No work before 7:00 AM or after 7:00 PM during the school year; 9:00 PM in summer.',
      'Ages 16–17: No state hour limits (platform cap of 20 hrs/week applies).',
    ],
    additionalRules: [
      'Work permit required for minors under 16; 16–17 year olds need only parental consent.',
      'Hazardous occupations prohibited for all minors.',
    ],
    legalRef: 'Florida Statutes §§ 450.021–450.151.',
    permitUrl: 'https://www.floridajobs.org/business-growth-and-partnerships/for-employers/display/child-labor-laws',
  },
};

const FEDERAL_DEFAULT = {
  stateName: 'Federal (FLSA)',
  minAge: 14,
  platformLimit: 20,
  ageRestrictions: [
    'Ages 14–15 (Federal FLSA): Max 3 hours/day on school days, 8 hours/day on non-school days, 18 hours/week during school, 40 hours/week during non-school weeks.',
    'No work before 7:00 AM or after 7:00 PM during the school year (9:00 PM in summer).',
    'Ages 16–17: No federal hour limits apply, but platform cap of 20 hrs/week is enforced.',
  ],
  additionalRules: [
    'Hazardous occupations are prohibited for minors under 18 under federal law.',
    'State laws may impose additional and stricter restrictions in your area. Check with your local Department of Labor.',
  ],
  legalRef: 'Fair Labor Standards Act (FLSA), 29 U.S.C. §§ 212–213; 29 CFR Part 570.',
  permitUrl: 'https://www.dol.gov/agencies/whd/child-labor',
};

export default function MinorLaborLaws({ location = '', age = null }) {
  const state = detectState(location);
  const laws = (state && STATE_LAWS[state]) ? STATE_LAWS[state] : null;
  const isCA = state === 'CA';

  return (
    <div className="bg-white rounded-xl border-2 border-blue-200 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Scale className="w-5 h-5 text-blue-600 shrink-0" />
        <div>
          <h4 className="font-bold text-blue-900 text-sm">
            {laws ? `${laws.stateName} Minor Labor Laws` : 'Minor Labor Laws — Federal & Local'}
          </h4>
          <p className="text-xs text-blue-600">
            {laws
              ? `Rules specific to ${laws.stateName} apply to this profile based on location: "${location}"`
              : location
                ? `No state-specific rules found for "${location}" — federal minimums apply. Check with your local labor authority for additional local rules.`
                : 'Enter your location above to see location-specific labor law requirements.'
            }
          </p>
        </div>
      </div>

      {(laws || !location) && (
        <div className="space-y-3 text-sm text-slate-700">

          {/* Permit requirement */}
          {laws?.permitRequired && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">Work Permit Required</p>
                <p className="text-xs text-yellow-700 mt-0.5">{laws.permitNote}</p>
                <a href={laws.permitUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline mt-1 inline-block">
                  Learn more →
                </a>
              </div>
            </div>
          )}
          {laws && !laws.permitRequired && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              <strong>Work Permit:</strong> {laws.permitNote}
            </div>
          )}

          {/* Platform limit callout */}
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-xs text-orange-800">
              <strong>Platform Limit: 20 hours/week maximum</strong> — regardless of what state law allows, SurfCoast enforces a hard 20-hour weekly cap for all minor contractors. The account is automatically locked when this limit is reached.
            </p>
          </div>

          {/* Age restrictions */}
          <div>
            <p className="font-semibold text-slate-800 mb-1.5">Hour & Age Restrictions</p>
            <ul className="space-y-1.5">
              {(laws?.ageRestrictions || FEDERAL_DEFAULT.ageRestrictions).map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="text-blue-500 font-bold shrink-0">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Additional rules */}
          {(laws?.additionalRules || FEDERAL_DEFAULT.additionalRules).length > 0 && (
            <div>
              <p className="font-semibold text-slate-800 mb-1.5">Additional Requirements</p>
              <ul className="space-y-1.5">
                {(laws?.additionalRules || FEDERAL_DEFAULT.additionalRules).map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="text-blue-500 font-bold shrink-0">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal reference */}
          <p className="text-xs text-slate-400 italic border-t border-slate-100 pt-2">
            Legal reference: {laws?.legalRef || FEDERAL_DEFAULT.legalRef} {' '}
            <a href={laws?.permitUrl || FEDERAL_DEFAULT.permitUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline not-italic">
              Official resource →
            </a>
          </p>

          {/* California special notice */}
          {isCA && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
              <strong>⚠ California Coogan Law:</strong> 15% of all gross earnings for minors must be deposited into a blocked trust account (Coogan Trust Account) before paying the minor. This is a legal requirement in California.
            </div>
          )}
        </div>
      )}

      {!laws && location && (
        <div className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-xs text-orange-800">
              <strong>Platform Limit: 20 hours/week maximum</strong> — SurfCoast enforces a hard 20-hour weekly cap for all minor contractors.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-800 mb-1.5">Federal FLSA Minimums (all states)</p>
            <ul className="space-y-1.5">
              {FEDERAL_DEFAULT.ageRestrictions.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="text-blue-500 font-bold shrink-0">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
          <ul className="space-y-1.5">
            {FEDERAL_DEFAULT.additionalRules.map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-blue-500 font-bold shrink-0">•</span>
                {rule}
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-400 italic border-t border-slate-100 pt-2">
            Legal reference: {FEDERAL_DEFAULT.legalRef} {' '}
            <a href={FEDERAL_DEFAULT.permitUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline not-italic">
              Official resource →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}