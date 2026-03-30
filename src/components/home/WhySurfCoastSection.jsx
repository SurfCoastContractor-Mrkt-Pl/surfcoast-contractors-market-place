import React, { useState } from 'react';
import { Wrench, Store, Users } from 'lucide-react';

export default function WhySurfCoastSection() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const cards = [
    {
      id: 'contractors',
      icon: Wrench,
      title: 'For Contractors',
      description: 'Land jobs, manage projects, and get paid—all in one place.',
      color: '#d97706'
    },
    {
      id: 'vendors',
      icon: Store,
      title: 'For WAVEShop Vendors',
      description: 'Sell at markets, manage inventory, and grow your business.',
      color: '#9d7a54'
    },
    {
      id: 'everyone',
      icon: Users,
      title: 'For Everyone Else',
      description: 'Connect with trusted professionals or shop local vendors.',
      color: '#22c55e'
    }
  ];

  return (
    <section style={{ width: '100%', maxWidth: '900px', marginBottom: '32px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: '800', color: '#ffffff', margin: '0 0 12px', lineHeight: 1.1, letterSpacing: '-1px' }}>
          Why SurfCoast?
        </h2>
        <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5 }}>
          Built for professionals who value simplicity, security, and results.
        </p>
      </div>

      {/* Three-Column Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <article
              key={card.id}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                padding: '24px 20px',
                backdropFilter: 'blur(18px)',
                transition: 'all 0.22s ease',
                cursor: 'default',
                background: 'rgba(10,22,40,0.5)',
                border: `1px solid rgba(${card.color === '#d97706' ? '217,119,6' : card.color === '#9d7a54' ? '157,122,84' : '34,197,94'},0.4)`,
                transform: hoveredCard === card.id ? 'translateY(-2px)' : 'none',
                boxShadow: hoveredCard === card.id
                  ? `0 0 24px ${card.color}33, 0 8px 24px ${card.color}22`
                  : '0 4px 16px rgba(0,0,0,0.3)'
              }}
            >
              <Icon size={28} style={{ marginBottom: '16px', color: card.color }} strokeWidth={1.5} aria-hidden="true" />
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 12px', color: '#fff' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6 }}>
                {card.description}
              </p>
            </article>
          );
        })}
      </div>

      {/* Pricing Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {/* WAVE FO Card */}
        <article
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '14px',
            padding: '24px 20px',
            backdropFilter: 'blur(18px)',
            background: 'rgba(10,22,40,0.5)',
            border: '1px solid rgba(217,119,6,0.4)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px', color: '#fff' }}>
            WAVE FO
          </h3>
          <p style={{ fontSize: '32px', fontWeight: '800', color: '#d97706', margin: '0 0 4px' }}>
            $19<span style={{ fontSize: '16px', fontWeight: '600', color: 'rgba(255,255,255,0.6)' }}>/mo</span>
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: '0 0 16px', lineHeight: 1.5 }}>
            Starting price for contractors
          </p>
          <button
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minHeight: '40px',
              background: '#d97706',
              color: '#fff'
            }}
            onClick={() => window.location.href = '/pricing'}
          >
            View Plans →
          </button>
        </article>

        {/* WAVEShop Card */}
        <article
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '14px',
            padding: '24px 20px',
            backdropFilter: 'blur(18px)',
            background: 'rgba(10,22,40,0.5)',
            border: '1px solid rgba(157,122,84,0.4)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px', color: '#fff' }}>
            WAVEShop
          </h3>
          <p style={{ fontSize: '32px', fontWeight: '800', color: '#9d7a54', margin: '0 0 4px' }}>
            $35<span style={{ fontSize: '16px', fontWeight: '600', color: 'rgba(255,255,255,0.6)' }}>/mo</span>
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: '0 0 16px', lineHeight: 1.5 }}>
            For market vendors
          </p>
          <button
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minHeight: '40px',
              background: '#9d7a54',
              color: '#fff'
            }}
            onClick={() => window.location.href = '/pricing'}
          >
            View Plans →
          </button>
        </article>
      </div>
    </section>
  );
}