import React from 'react';
import { Zap, GitMerge, Smartphone, MessageSquare } from 'lucide-react';

const roadmapItems = [
  {
    icon: Zap,
    label: 'Smarter Job Matching',
    description: 'AI-assisted matching to connect clients with the right contractor faster — based on trade, location, availability, and past performance.',
    status: 'In Development',
    statusColor: '#F97316',
  },
  {
    icon: GitMerge,
    label: 'Expanded Integrations',
    description: 'Deeper connections with tools contractors already use — accounting, scheduling, and project management — to cut admin time and keep operations tight.',
    status: 'Planned',
    statusColor: '#38bdf8',
  },
  {
    icon: Smartphone,
    label: 'Mobile-First Field Ops',
    description: 'WAVE FO is already built for the field. We\'re continuing to push the mobile experience forward so every key action works seamlessly from a job site.',
    status: 'Ongoing',
    statusColor: '#a78bfa',
  },
  {
    icon: MessageSquare,
    label: 'Community & Networking Tools',
    description: 'New ways for contractors and vendors to connect, share knowledge, and refer work to one another — building a real professional network, not just a listing page.',
    status: 'Planned',
    statusColor: '#34d399',
  },
];

export default function TransparentRoadmap() {
  return (
    <section style={{ background: 'linear-gradient(160deg, #060f1e 0%, #0a1628 60%, #0d1f38 100%)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="flex items-center gap-4 mb-4">
          <div style={{ width: '36px', height: '2px', background: '#F97316', flexShrink: 0 }} />
          <p className="font-black uppercase tracking-widest text-xs" style={{ color: '#F97316', letterSpacing: '0.2em' }}>
            Where We're Headed
          </p>
        </div>

        <h2
          className="font-black uppercase leading-tight mb-4"
          style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', color: '#ffffff', letterSpacing: '0.02em' }}
        >
          Our Transparent<br />
          <span style={{ color: '#F97316' }}>Roadmap.</span>
        </h2>

        <p className="mb-12" style={{ fontSize: '0.95rem', color: '#94a3b8', maxWidth: '560px', lineHeight: 1.8, fontWeight: 500 }}>
          We're building this in the open. You deserve to know what's coming — and your feedback shapes what gets built next.
        </p>

        <div className="space-y-4">
          {roadmapItems.map(({ icon: Icon, label, description, status, statusColor }) => (
            <div
              key={label}
              className="flex gap-5 rounded-2xl p-6 items-start"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${statusColor}15`, border: `1px solid ${statusColor}28` }}
              >
                <Icon className="w-5 h-5" style={{ color: statusColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h3 className="font-black uppercase tracking-wide" style={{ fontSize: '0.82rem', color: '#ffffff', letterSpacing: '0.07em' }}>
                    {label}
                  </h3>
                  <span
                    className="uppercase tracking-widest font-bold"
                    style={{
                      fontSize: '0.55rem',
                      color: statusColor,
                      background: `${statusColor}15`,
                      border: `1px solid ${statusColor}28`,
                      borderRadius: '999px',
                      padding: '3px 10px',
                      letterSpacing: '0.12em',
                    }}
                  >
                    {status}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.8, fontWeight: 500 }}>
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Closing statement */}
        <div
          className="mt-10 px-6 py-5 rounded-xl"
          style={{ background: 'rgba(249,115,22,0.06)', borderLeft: '3px solid #F97316' }}
        >
          <p className="font-semibold" style={{ fontSize: '0.93rem', color: '#cbd5e1', lineHeight: 1.8 }}>
            Have a feature idea or a piece of feedback? Submit it through the platform — every suggestion is reviewed personally. This roadmap exists because of the people using it.
          </p>
        </div>
      </div>
    </section>
  );
}