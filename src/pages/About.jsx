import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import ShareAboutButton from '@/components/about/ShareAboutButton';

const tags = ['10+ Years Plumbing', 'Computer Systems', 'Gracie Jiu-Jitsu Purple Belt', 'Business Owner', 'Platform Developer'];

const missionParagraphs = [
  `From young hustlers picking up their first job to seasoned professionals running their own operation, we believe "contractor" isn't a title—it's a mindset. It's anyone willing to put in the work, deliver value, and stand behind what they do.`,
  `Our mission is simple: create a space where everyday skilled individuals—freelancers, tradespeople, creatives, and self-starters—can connect with real opportunities, grow their reputation, and build something of their own.`,
  `We don't believe in gatekeeping. You don't need a massive company, years of credentials, or a polished brand to get started. If you've got skill, discipline, and the drive to improve, you belong here.`,
  `This platform was built by someone living that same path—a father, husband, and entrepreneur who understands what it means to start from the ground up, master a craft, and keep learning. With a background in the trades, business ownership, and years of discipline through martial arts, this platform reflects those same values: accountability, growth, and respect for the work.`,
  `This isn't just a marketplace—it's a foundation for people who are serious about building something real.`,
];

const founderBio = [
  `Hector A. Navarrete isn't your typical platform builder—and that's exactly the point.`,
  `Born and raised in San Diego, his early years were anything but easy. School didn't come naturally, and life threw its share of hard lessons. At one point, he faced over a decade of homelessness. But quitting was never part of the plan. Through persistence and grit, he fought his way back and earned his high school diploma—proving early on that resilience beats circumstance.`,
  `From there, Hector took a hands-on path. He studied Computer Systems, stepped into the trades, and built a career in plumbing that now spans over a decade. Today, as the owner of SurfCoast Plumbing, he understands firsthand what it means to work hard, build trust, and earn every opportunity.`,
  `As a husband and father, Hector is driven by something bigger than business—creating opportunities for others willing to put in the work. SurfCoast Contractor Marketplace is an extension of that belief: a place where everyday people can build skills, create income, and take ownership of their future.`,
  `Outside of work, he's a lifelong learner, avid reader, and dedicated martial artist—holding a purple belt in Gracie Jiu-Jitsu under Professor Omar in Hemet, with additional training in Taekwondo and Krav Maga. Disciplines that mirror his mindset: stay sharp, stay humble, keep showing up.`,
];

export default function About() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}>

      {/* Hero / Mission Section */}
      <div style={{ background: 'linear-gradient(165deg, #e8e0d8 0%, #f0e8df 25%, #f5ede4 50%, #C0390A 72%, #8B1A00 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">

          {/* Back Nav */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-10 font-bold tracking-widest uppercase text-xs opacity-80 hover:opacity-100 transition-opacity"
            style={{ color: '#5a3a2a' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>

          {/* Title */}
          <div className="mb-10">
            <h1
              className="font-black uppercase mb-4 leading-tight"
              style={{
                fontSize: 'clamp(2rem, 5.5vw, 3.2rem)',
                color: '#1a1a1a',
                letterSpacing: '0.06em',
              }}
            >
              About SurfCoast Marketplace
            </h1>
            <div style={{ width: '64px', height: '3px', background: '#C0390A', borderRadius: '2px', marginBottom: '24px' }} />
            <ShareAboutButton />
          </div>

          {/* Manifesto Statement */}
          <div className="mb-10">
            <p
              className="font-black leading-none mb-6"
              style={{
                fontSize: 'clamp(2.6rem, 7vw, 5rem)',
                color: '#1a1a1a',
                letterSpacing: '-0.02em',
              }}
            >
              Being a contractor isn't a job title.
              <br />
              <span style={{ color: '#C0390A' }}>It's a mindset.</span>
            </p>

            <p
              className="font-semibold leading-relaxed mb-10"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#4a3a30', maxWidth: '600px' }}
            >
              It belongs to anyone willing to put in the work, deliver real value, and stand behind what they do — no matter where they started.
            </p>

            {/* Divider */}
            <div style={{ width: '48px', height: '3px', background: '#C0390A', borderRadius: '2px', marginBottom: '36px' }} />
          </div>

          {/* Mission Body */}
          <div className="space-y-5" style={{ maxWidth: '640px' }}>
            {missionParagraphs.map((text, i) => (
              <p key={i} className="text-base leading-relaxed" style={{ fontWeight: 500, color: '#3a2a22' }}>
                {text}
              </p>
            ))}

            <p
              className="font-black italic pt-4"
              style={{ fontSize: 'clamp(1rem, 2.2vw, 1.25rem)', color: '#8B1A00' }}
            >
              "We're here for the builders, the learners, and the ones who refuse to sit still."
            </p>
          </div>
        </div>
      </div>

      {/* Founder Section */}
      <section style={{ background: 'linear-gradient(160deg, #0d2a4a 0%, #0d1f3a 40%, #0a1628 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

          <div className="flex items-center gap-4 mb-12">
            <div style={{ width: '36px', height: '2px', background: '#F97316', flexShrink: 0 }} />
            <p className="font-black uppercase tracking-widest text-xs" style={{ color: '#F97316', letterSpacing: '0.2em' }}>
              Meet the Founder
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-10 lg:gap-14 items-start">

            {/* Left: Photo + Info */}
            <div className="md:col-span-2 space-y-5">
              <img
                src="https://media.base44.com/images/public/69a61a047827463e7cdbc1eb/93f3cfcd7_IMG_3860.jpg"
                alt="Hector A. Navarrete"
                className="rounded-2xl w-full"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)', border: '1px solid rgba(249,115,22,0.2)' }}
              />

              <div className="pl-1">
                <h3 className="font-black uppercase tracking-wide" style={{ fontSize: '1.1rem', color: '#ffffff', letterSpacing: '0.05em' }}>
                  Hector A. Navarrete
                </h3>
                <div style={{ width: '28px', height: '2px', background: '#F97316', margin: '8px 0 10px' }} />
                <p className="uppercase tracking-widest font-semibold" style={{ fontSize: '0.62rem', color: '#94a3b8', letterSpacing: '0.13em', lineHeight: 1.9 }}>
                  Owner — SurfCoast Plumbing<br />
                  Developer / Admin<br />
                  SurfCoast Contractor Marketplace
                </p>
              </div>

              <div
                className="px-4 py-3 rounded-xl"
                style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)' }}
              >
                <p className="uppercase tracking-widest font-bold" style={{ fontSize: '0.58rem', color: '#F97316', letterSpacing: '0.15em', marginBottom: '4px' }}>
                  Facebook Group
                </p>
                <p className="font-semibold" style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  Entrepreneur Local / SurfCoast Market
                </p>
              </div>
            </div>

            {/* Right: Bio */}
            <div className="md:col-span-3 space-y-5">
              <h2
                className="font-black uppercase tracking-wide leading-tight"
                style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)', color: '#ffffff', letterSpacing: '0.03em' }}
              >
                Built From<br />
                <span style={{ color: '#F97316' }}>Experience.</span>
              </h2>

              <div className="space-y-4" style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.93rem', lineHeight: 1.85 }}>
                {founderBio.map((p, i) => <p key={i}>{p}</p>)}
              </div>

              {/* Quote */}
              <div
                className="px-6 py-5 rounded-xl mt-2"
                style={{ background: 'rgba(249,115,22,0.07)', borderLeft: '3px solid #F97316' }}
              >
                <p className="font-black italic" style={{ fontSize: '1.05rem', color: '#ffffff' }}>
                  "If you're here, you're in the right place."
                </p>
                <p className="mt-2 uppercase tracking-widest font-bold" style={{ fontSize: '0.58rem', color: '#F97316' }}>
                  — Hector A. Navarrete
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="uppercase tracking-wider font-bold"
                    style={{
                      fontSize: '0.58rem',
                      color: '#94a3b8',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: '999px',
                      padding: '5px 13px',
                      letterSpacing: '0.11em',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="pt-2">
                <ShareAboutButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings Section */}
      <section style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0d2240 50%, #112d52 100%)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

          <div className="flex items-center gap-4 mb-4">
            <div style={{ width: '36px', height: '2px', background: '#F97316', flexShrink: 0 }} />
            <p className="font-black uppercase tracking-widest text-xs" style={{ color: '#F97316', letterSpacing: '0.2em' }}>
              Our Offerings
            </p>
          </div>

          <h2 className="font-extrabold mb-10" style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)', color: '#ffffff', letterSpacing: '-0.01em' }}>
            What We Offer
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* WAVE FO Plans */}
            <div
              className="flex flex-col rounded-2xl p-7 text-center"
              style={{ background: 'rgba(217,119,6,0.07)', border: '1.5px solid rgba(217,119,6,0.25)', backdropFilter: 'blur(16px)' }}
            >
              <h3 className="font-bold mb-2" style={{ fontSize: '17px', color: '#ffffff' }}>WAVE FO Plans</h3>
              <p className="mb-5" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>For contractors and solo professionals</p>
              <div className="mb-6">
                <span className="font-black" style={{ fontSize: '34px', color: '#d97706' }}>From $19</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>/month</span>
              </div>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 w-full font-bold rounded-lg transition-all hover:opacity-90 active:scale-95"
                style={{ padding: '11px 16px', background: '#d97706', color: '#fff', fontSize: '13px', textDecoration: 'none' }}
              >
                View All Plans <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* WAVEShop Vendor */}
            <div
              className="flex flex-col rounded-2xl p-7 text-center"
              style={{ background: 'rgba(157,122,84,0.07)', border: '1.5px solid rgba(157,122,84,0.25)', backdropFilter: 'blur(16px)' }}
            >
              <h3 className="font-bold mb-2" style={{ fontSize: '17px', color: '#ffffff' }}>WAVEShop Vendor</h3>
              <p className="mb-5" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>For farmers market & swap meet booths</p>
              <div className="mb-6">
                <span className="font-black" style={{ fontSize: '34px', color: '#9d7a54' }}>$35</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>/month</span>
              </div>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 w-full font-bold rounded-lg transition-all hover:opacity-90 active:scale-95"
                style={{ padding: '11px 16px', background: '#9d7a54', color: '#fff', fontSize: '13px', textDecoration: 'none' }}
              >
                View All Plans <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}