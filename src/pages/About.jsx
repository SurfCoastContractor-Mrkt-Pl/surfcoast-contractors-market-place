import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function About() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(160deg, #7B1E00 0%, #C0390A 18%, #E8621A 35%, #F97316 52%, #FBBF24 70%, #FDE68A 88%, #FFF8DC 100%)',
        fontFamily: "'Montserrat', 'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-8 font-bold tracking-wider uppercase text-xs"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Page Title */}
        <div className="mb-12">
          <h1
            className="font-black uppercase tracking-widest mb-3"
            style={{
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              color: '#fff',
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
              letterSpacing: '0.08em',
            }}
          >
            About SurfCoast Marketplace
          </h1>
          <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px' }} />
        </div>

        {/* Mission Copy */}
        <div className="space-y-6" style={{ color: 'rgba(255,255,255,0.95)' }}>
          <p
            className="font-black uppercase tracking-wider"
            style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)', textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}
          >
            We built this platform for the people who actually get things done.
          </p>

          <p className="text-base leading-relaxed" style={{ fontWeight: 500 }}>
            From young hustlers picking up their first job to seasoned professionals running their own operation, we believe "contractor" isn't a title—it's a mindset. It's anyone willing to put in the work, deliver value, and stand behind what they do.
          </p>

          <p className="text-base leading-relaxed" style={{ fontWeight: 500 }}>
            Our mission is simple: create a space where everyday skilled individuals—freelancers, tradespeople, creatives, and self-starters—can connect with real opportunities, grow their reputation, and build something of their own.
          </p>

          <p className="text-base leading-relaxed" style={{ fontWeight: 500 }}>
            We don't believe in gatekeeping. You don't need a massive company, years of credentials, or a polished brand to get started. If you've got skill, discipline, and the drive to improve, you belong here.
          </p>

          <p className="text-base leading-relaxed" style={{ fontWeight: 500 }}>
            This platform was built by someone living that same path—a father, husband, and entrepreneur who understands what it means to start from the ground up, master a craft, and keep learning. With a background in the trades, business ownership, and years of discipline through martial arts, this platform reflects those same values: accountability, growth, and respect for the work.
          </p>

          <p className="text-base leading-relaxed" style={{ fontWeight: 500 }}>
            This isn't just a marketplace—it's a foundation for people who are serious about building something real.
          </p>

          <p
            className="font-black uppercase tracking-wider pt-4"
            style={{ fontSize: 'clamp(1rem, 2.2vw, 1.25rem)', textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}
          >
            We're here for the builders, the learners, and the ones who refuse to sit still.
          </p>
        </div>

        {/* Founder Section */}
        <div
          className="mt-16 pt-16"
          style={{ borderTop: '1px solid rgba(255,255,255,0.3)' }}
        >
          <h2
            className="font-black uppercase tracking-widest mb-12"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.25)', letterSpacing: '0.1em' }}
          >
            Meet the Founder
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://media.base44.com/images/public/69a61a047827463e7cdbc1eb/93f3cfcd7_IMG_3860.jpg"
                alt="Hector A. Navarrete"
                className="rounded-2xl w-full"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.35)', border: '3px solid rgba(255,255,255,0.25)' }}
              />
            </div>

            <div className="space-y-6">
              <div>
                <h3
                  className="font-black uppercase tracking-wide mb-2"
                  style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                >
                  Hector A. Navarrete
                </h3>
                <p
                  className="font-bold uppercase tracking-widest mb-4"
                  style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.15em' }}
                >
                  Owner: SurfCoast Plumbing<br />
                  Developer / Admin: SurfCoast Contractor Market Place
                </p>
              </div>

              <div className="space-y-4 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 500 }}>
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
                  But this platform wasn't built from theory—it was built from experience.
                </p>
                <p>
                  As a husband and father, Hector is driven by something bigger than business. He believes in creating opportunities not just for himself, but for others willing to put in the work. SurfCoast Contractor Marketplace is an extension of that belief—a place where everyday people can build skills, create income, and take ownership of their future.
                </p>
                <p>
                  Outside of work, Hector is a lifelong learner, an avid reader, and someone who's always asking questions (sometimes the kind that come with a "tin foil hat" and a late-night episode of The Why Files). He's a dedicated martial artist, holding a purple belt in Gracie Jiu-Jitsu under Professor Omar in Hemet, with additional training in Taekwondo and Krav Maga—disciplines that reflect his mindset: stay sharp, stay humble, and keep showing up.
                </p>
                <p>
                  This platform is built on those same principles—resilience, growth, and respect for the grind.
                </p>

                <p
                  className="italic font-bold pt-2"
                  style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem' }}
                >
                  "If you're here, you're in the right place."
                </p>
              </div>

              <div className="pt-4">
                <p
                  className="font-bold uppercase tracking-widest"
                  style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.18em' }}
                >
                  Facebook Group: Entrepreneur Local / SurfCoast Market
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}