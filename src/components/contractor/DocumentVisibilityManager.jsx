import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Globe, Lock } from 'lucide-react';

const SECTIONS = [
  { key: 'his_license', label: 'HIS License 🏠', hasData: (c) => !!c.his_license_number },
  { key: 'bond', label: 'Bond Information 🔒', hasData: (c) => !!c.bond_company },
  { key: 'insurance', label: 'Business Insurance 🛡️', hasData: (c) => !!c.insurance_company },
  { key: 'contracts', label: 'Home Improvement Contracts 📄', hasData: (c) => c.home_improvement_contracts?.length > 0 },
  { key: 'certifications', label: 'Additional Certifications 🏆', hasData: (c) => c.additional_certifications?.length > 0 },
];

export default function DocumentVisibilityManager({ contractor }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(null);

  const visibleSections = SECTIONS.filter(s => s.hasData(contractor));
  if (visibleSections.length === 0) return null;

  const visibility = contractor?.document_visibility || {};

  const toggle = async (key) => {
    const current = visibility[key] || 'private';
    const next = current === 'public' ? 'private' : 'public';
    const updated = { ...visibility, [key]: next };
    setSaving(key);
    await base44.entities.Contractor.update(contractor.id, { document_visibility: updated });
    queryClient.invalidateQueries({ queryKey: ['my-contractor'] });
    setSaving(null);
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-slate-900 mb-1">Document Visibility</h3>
      <p className="text-xs text-slate-500 mb-4">Control which documents are visible to customers on your profile.</p>

      <div className="space-y-2">
        {visibleSections.map(({ key, label }) => {
          const isPublic = (visibility[key] || 'private') === 'public';
          return (
            <div key={key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-700">{label}</span>
              <button
                onClick={() => toggle(key)}
                disabled={saving === key}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isPublic
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {isPublic
                  ? <><Globe className="w-3 h-3" />Public</>
                  : <><Lock className="w-3 h-3" />Private</>
                }
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 mt-4 leading-relaxed">
        Public documents appear on your profile page for customers to view. Private documents are only visible to you and SurfCoast admins.
      </p>
    </Card>
  );
}