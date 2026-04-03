import React from 'react';
import { DollarSign, UserCheck, Users } from 'lucide-react';

const differentiators = [
  {
    icon: DollarSign,
    title: 'Fair, Transparent Pricing',
    body: 'We don\'t take a commission on your work. SurfCoast operates on straightforward membership tiers — you keep what you earn. No hidden fees, no surprise cuts, no middleman gouging. You know exactly what you\'re paying for before you sign up.',
    accent: '#F97316',
  },
  {
    icon: UserCheck,
    title: 'Authentic Profiles, Real People',
    body: 'When a contractor submits their information — identity, credentials, background — it\'s to confirm that profile truly belongs to them and isn\'t impersonating someone else. Clients are responsible for their own due diligence, but they can be confident they\'re looking at a real person who owns what they\'re presenting.',
    accent: '#38bdf8',
  },
  {
    icon: Users,
    title: 'A Community, Not Just a Platform',
    body: 'SurfCoast was built by someone who has lived the grind. That means we understand what tradespeople, freelancers, and self-starters actually need — tools that respect your time, support your growth, and don\'t get in the way. We\'re building alongside you, not above you.',
    accent: '#a78bfa',
  },
];

export default function WhatMakesUsDifferent() {
  return (
    <section style={{ background: 'linear-gradient(160deg, #0a1e38 0%, #0d2a4a 60%, #0f3060 100%)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="flex items-center gap-4 mb-4">
          <div style={{ width: '36px', height: '2px', background: '#F97316', flexShrink: 0 }} />
          <p className="font-black uppercase tracking-widest text-xs" style={{ color: '#F97316', letterSpacing: '0.2em' }}>
            Why We're Different
          </p>
        </div>

        <h2
          className="font-black uppercase leading-tight mb-12"
          style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', color: '#ffffff', letterSpacing: '0.02em' }}
        >
          What Sets SurfCoast<br />
          <span style={{ color: '#F97316' }}>Apart.</span>
        </h2>

        <div className="grid sm:grid-cols-3 gap-6">
          {differentiators.map(({ icon: Icon, title, body, accent }) => (
            <div
              key={title}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
              >
                <Icon className="w-5 h-5" style={{ color: accent }} />
              </div>
              <h3 className="font-black uppercase tracking-wide" style={{ fontSize: '0.85rem', color: '#ffffff', letterSpacing: '0.06em' }}>
                {title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.8, fontWeight: 500 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}