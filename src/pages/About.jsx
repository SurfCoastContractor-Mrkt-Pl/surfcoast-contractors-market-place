import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ShareAboutButton from '@/components/about/ShareAboutButton';

export default function About() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(160deg, #7B1E00 0%, #C0390A 18%, #E8621A 35%, #F97316 52%, #FBBF24 70%, #FDE68A 88%, #FFF8DC 100%)',
        fontFamily: "'Montserrat', 'Inter', sans-serif",
      }}
    >
      {/* Back Nav */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-8 font-bold tracking-wider uppercase text-xs"
          style={{ color: '#ffffff' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* Mission Content — sits on the sunset gradient */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-0 pt-4">

        {/* Page Title */}
        <div className="mb-12">
          <h1
            className="font-black uppercase tracking-widest mb-3"
            style={{
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              color: '#ffffff',
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
              letterSpacing: '0.08em',
            }}
          >
            About SurfCoast Marketplace
          </h1>
          <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px', marginBottom: '20px' }} />
          <ShareAboutButton />
        </div>

        {/* Mission Paragraphs */}
        <div className="space-y-6 mb-20">
          <p
            className="font-black uppercase tracking-wider"
            style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)', color: '#ffffff', textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}
          >
            We built this platform for the people who actually get things done.
          </p>

          {[
            `From young hustlers picking up their first job to seasoned professionals running their own operation, we believe "contractor" isn't a title—it's a mindset. It's anyone willing to put in the work, deliver value, and stand behind what they do.`,
            `Our mission is simple: create a space where everyday skilled individuals—freelancers, tradespeople, creatives, and self-starters—can connect with real opportunities, grow their reputation, and build something of their own.`,
            `We don't believe in gatekeeping. You don't need a massive company, years of credentials, or a polished brand to get started. If you've got skill, discipline, and the drive to improve, you belong here.`,
            `This platform was built by someone living that same path—a father, husband, and entrepreneur who understands what it means to start from the ground up, master a craft, and keep learning. With a background in the trades, business ownership, and years of discipline through martial arts, this platform reflects those same values: accountability, growth, and respect for the work.`,
            `This isn't just a marketplace—it's a foundation for people who are serious about building something real.`,
          ].map((text, i) => (
            <p key={i} className="text-base leading-relaxed" style={{ fontWeight: 500, color: '#f0f4ff' }}>
              {text}
            </p>
          ))}

          <p
            className="font-black uppercase tracking-wider pt-4"
            style={{ fontSize: 'clamp(1rem, 2.2vw, 1.25rem)', color: '#ffffff', textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}
          >
            We're here for the builders, the learners, and the ones who refuse to sit still.
          </p>
        </div>
      </main>

      {/* Founder Section — full-width dark navy panel, completely separate from sunset */}
      <section style={{ background: '#0d1b2a' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

          {/* Section Label */}
          <div className="flex items-center gap-4 mb-14">
            <div style={{ width: '40px', height: '2px', background: '#F97316' }} />
            <p className="font-black uppercase tracking-widest text-xs" style={{ color: '#F97316', letterSpacing: '0.2em' }}>
              Meet the Founder
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-12 items-start">

            {/* Photo column — 2/5 width */}
            <div className="md:col-span-2">
              <img
                src="https://media.base44.com/images/public/69a61a047827463e7cdbc1eb/93f3cfcd7_IMG_3860.jpg"
                alt="Hector A. Navarrete"
                className="rounded-xl w-full"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)', border: '1px solid rgba(249,115,22,0.25)' }}
              />

              {/* Name card below photo */}
              <div className="mt-6 pl-1">
                <h3
                  className="font-black uppercase tracking-wide"
                  style={{ fontSize: '1.15rem', color: '#ffffff', letterSpacing: '0.06em' }}
                >
                  Hector A. Navarrete
                </h3>
                <div style={{ width: '32px', height: '2px', background: '#F97316', margin: '8px 0' }} />
                <p className="uppercase tracking-widest font-semibold" style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.14em', lineHeight: 1.8 }}>
                  Owner — SurfCoast Plumbing<br />
                  Developer / Admin<br />
                  SurfCoast Contractor Marketplace
                </p>
              </div>

              {/* Social tag */}
              <div
                className="mt-6 px-4 py-3 rounded-lg"
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}
              >
                <p className="uppercase tracking-widest font-bold" style={{ fontSize: '0.6rem', color: '#F97316', letterSpacing: '0.16em' }}>
                  Facebook Group
                </p>
                <p className="font-semibold mt-1" style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  Entrepreneur Local / SurfCoast Market
                </p>
              </div>
            </div>

            {/* Bio column — 3/5 width */}
            <div className="md:col-span-3 space-y-5">
              <h2
                className="font-black uppercase tracking-wide"
                style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', color: '#ffffff', letterSpacing: '0.04em', lineHeight: 1.2 }}
              >
                Built From<br />
                <span style={{ color: '#F97316' }}>Experience.</span>
              </h2>

              <div className="space-y-4" style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.95rem', lineHeight: 1.8 }}>
                <p>
                  Hector A. Navarrete isn't your typical platform builder—and that's exactly the point.
                </p>
                <p>
                  Born and raised in San Diego, his early years were anything but easy. School didn't come naturally, and life threw its share of hard lessons. At one point, he faced over a decade of homelessness. But quitting was never part of the plan. Through persistence and grit, he fought his way back and earned his high school diploma—proving early on that resilience beats circumstance.
                </p>
                <p>
                  From there, Hector took a hands-on path. He studied Computer Systems, stepped into the trades, and built a career in plumbing that now spans over a decade. Today, as the owner of SurfCoast Plumbing, he understands firsthand what it means to work hard, build trust, and earn every opportunity.
                </p>
                <p>
                  As a husband and father, Hector is driven by something bigger than business—creating opportunities for others willing to put in the work. SurfCoast Contractor Marketplace is an extension of that belief: a place where everyday people can build skills, create income, and take ownership of their future.
                </p>
                <p>
                  Outside of work, he's a lifelong learner, avid reader, and dedicated martial artist—holding a purple belt in Gracie Jiu-Jitsu under Professor Omar in Hemet, with additional training in Taekwondo and Krav Maga. Disciplines that mirror his mindset: stay sharp, stay humble, keep showing up.
                </p>
              </div>

              {/* Pull quote */}
              <div
                className="mt-8 px-6 py-5 rounded-xl"
                style={{ background: 'rgba(249,115,22,0.08)', borderLeft: '3px solid #F97316' }}
              >
                <p className="font-black italic" style={{ fontSize: '1.1rem', color: '#ffffff', letterSpacing: '0.01em' }}>
                  "If you're here, you're in the right place."
                </p>
                <p className="mt-2 uppercase tracking-widest font-bold" style={{ fontSize: '0.6rem', color: '#F97316' }}>
                  — Hector A. Navarrete
                </p>
              </div>

              {/* Credential pills */}
              <div className="flex flex-wrap gap-2 pt-4">
                {['10+ Years Plumbing', 'Computer Systems', 'Gracie Jiu-Jitsu Purple Belt', 'Business Owner', 'Platform Developer'].map(tag => (
                  <span
                    key={tag}
                    className="uppercase tracking-wider font-bold"
                    style={{
                      fontSize: '0.6rem',
                      color: '#94a3b8',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '999px',
                      padding: '4px 12px',
                      letterSpacing: '0.12em',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Share */}
              <div className="pt-6">
                <ShareAboutButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section style={{ background: '#0a1628', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center gap-4 mb-14">
            <div style={{ width: '40px', height: '2px', background: '#F97316' }} />
            <p className="font-black uppercase tracking-widest text-xs" style={{ color: '#F97316', letterSpacing: '0.2em' }}>
              Our Offerings
            </p>
          </div>

          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, color: '#ffffff', marginBottom: '24px', letterSpacing: '-0.02em' }}>
            What We Offer
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            {/* Wave FO Pricing Card */}
            <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '16px', padding: '28px 24px', backdropFilter: 'blur(18px)', background: 'rgba(217,119,6,0.08)', border: '2px solid rgba(217,119,6,0.3)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: '#ffffff' }}>Wave FO Plans</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>For contractors and solo professionals</p>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#d97706' }}>From $19</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>/month</span>
              </div>
              <button
                onClick={() => window.location.href = '/pricing'}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: '#d97706',
                  color: '#fff',
                  minHeight: '40px',
                  transition: 'all 0.2s'
                }}
              >
                View All Plans
              </button>
            </div>

            {/* WAVEShop Pricing Card */}
            <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '16px', padding: '28px 24px', backdropFilter: 'blur(18px)', background: 'rgba(157,122,84,0.08)', border: '2px solid rgba(157,122,84,0.3)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: '#ffffff' }}>WAVEShop Vendor</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>For farmers market & swap meet booths</p>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#9d7a54' }}>$35</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>/month</span>
              </div>
              <button
                onClick={() => window.location.href = '/pricing'}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: '#9d7a54',
                  color: '#fff',
                  minHeight: '40px',
                  transition: 'all 0.2s'
                }}
              >
                View All Plans
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}