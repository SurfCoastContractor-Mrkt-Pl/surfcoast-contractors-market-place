import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const BG_IMAGE = 'https://media.base44.com/images/public/69b5d136d5baa9e2c5f01224/a4e716013_istockphoto-515071286-1024x1024.jpg';
const OVERLAY = 'linear-gradient(to bottom, rgba(4,14,28,0.72) 0%, rgba(4,14,28,0.55) 40%, rgba(4,14,28,0.78) 100%)';

const cardBase = {
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  background: 'rgba(5,20,40,0.62)',
  border: '1px solid rgba(255,255,255,0.2)',
};

function RoleCard({ icon, title, description, bullets, buttonLabel, buttonColor, hoverColor, onClick }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className="cursor-pointer rounded-2xl p-8 flex flex-col gap-5 transition-all duration-300 w-full"
      style={{
        ...cardBase,
        background: hovered ? hoverColor : 'rgba(5,20,40,0.62)',
        transform: hovered ? 'translateY(-6px)' : 'none',
        boxShadow: hovered ? '0 24px 60px rgba(0,0,0,0.45)' : '0 8px 30px rgba(0,0,0,0.3)',
        border: hovered ? `1px solid ${buttonColor}55` : '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <div className="text-5xl">{icon}</div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-white/70 text-sm leading-relaxed">{description}</p>
      </div>
      <ul className="space-y-1.5">
        {bullets.map(b => (
          <li key={b} className="flex items-center gap-2 text-white/80 text-sm">
            <span className="text-green-400 font-bold">✓</span> {b}
          </li>
        ))}
      </ul>
      <button
        className="mt-auto w-full font-semibold py-3 rounded-xl text-white transition-all duration-200 hover:opacity-90 active:scale-95 text-base"
        style={{ background: buttonColor }}
        onClick={onClick}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundImage: `${OVERLAY}, url(${BG_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Header */}
      <header className="flex items-center px-6 py-5">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', textShadow: '0 1px 8px rgba(0,0,0,0.5)', lineHeight: 1 }}>SurfCoast</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '2.5px', textTransform: 'uppercase', lineHeight: 1 }}>Marketplace</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero text */}
        <div className="text-center mb-12 max-w-2xl">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}
          >
            The Trades Marketplace
          </h1>
          <p className="text-white/70 text-lg sm:text-xl leading-relaxed max-w-xl mx-auto">
            Connect with licensed, verified tradespeople across the country — or grow your business and land your next job.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col md:flex-row items-stretch gap-0 w-full max-w-2xl">
          <RoleCard
            icon="🏠"
            title="I Need a Contractor"
            description="Post a job, get quotes, and hire vetted tradespeople in your area. Free to join."
            bullets={[
              'Verified & licensed pros only',
              'Free 2-week trial',
              'Secure payments',
            ]}
            buttonLabel="Find a Pro →"
            buttonColor="#0ea5e9"
            hoverColor="rgba(14,165,233,0.28)"
            onClick={() => navigate('/CustomerDashboard')}
          />

          {/* OR divider */}
          <div className="flex md:flex-col items-center justify-center px-4 py-4 md:py-0">
            <div className="hidden md:block w-px h-full bg-white/20" />
            <div className="md:hidden w-full h-px bg-white/20" />
            <span
              className="mx-3 md:my-3 text-white/40 text-xs font-semibold uppercase tracking-widest shrink-0"
              style={{ textShadow: 'none' }}
            >
              or
            </span>
            <div className="hidden md:block w-px h-full bg-white/20" />
            <div className="md:hidden w-full h-px bg-white/20" />
          </div>

          <RoleCard
            icon="🔧"
            title="I'm a Contractor"
            description="Grow your business, get discovered, and manage jobs — all in one place."
            bullets={[
              'Free 2-week trial',
              'Get paid securely via Stripe',
              'Build your reputation',
            ]}
            buttonLabel="Join as a Pro →"
            buttonColor="#f59e0b"
            hoverColor="rgba(245,158,11,0.25)"
            onClick={() => navigate('/ContractorDashboard')}
          />
        </div>

        {/* Trust bar */}
        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-white/45 text-xs text-center">
          <span>🔒 Secure payments</span>
          <span>✅ Identity verified pros</span>
          <span>📋 Licensed &amp; insured</span>
          <span>🤝 Built in San Diego</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-5 text-white/30 text-xs">
        © 2026 SurfCoast Marketplace ·{' '}
        <Link to="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
        {' · '}
        <Link to="/Terms" className="hover:text-white/60 transition-colors">Terms</Link>
      </footer>
    </div>
  );
}