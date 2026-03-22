import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-8">About SurfCoast Marketplace</h1>
        </div>

        <div className="prose prose-lg max-w-none text-slate-700 space-y-6">
          <p className="text-xl font-semibold text-slate-900">
            We built this platform for the people who actually get things done.
          </p>

          <p>
            From young hustlers picking up their first job to seasoned professionals running their own operation, we believe "contractor" isn't a title—it's a mindset. It's anyone willing to put in the work, deliver value, and stand behind what they do.
          </p>

          <p>
            Our mission is simple: create a space where everyday skilled individuals—freelancers, tradespeople, creatives, and self-starters—can connect with real opportunities, grow their reputation, and build something of their own.
          </p>

          <p>
            We don't believe in gatekeeping. You don't need a massive company, years of credentials, or a polished brand to get started. If you've got skill, discipline, and the drive to improve, you belong here.
          </p>

          <p>
            This platform was built by someone living that same path—a father, husband, and entrepreneur who understands what it means to start from the ground up, master a craft, and keep learning. With a background in the trades, business ownership, and years of discipline through martial arts, this platform reflects those same values: accountability, growth, and respect for the work.
          </p>

          <p>
            This isn't just a marketplace—it's a foundation for people who are serious about building something real.
          </p>

          <p className="text-xl font-semibold text-slate-900 pt-4">
            We're here for the builders, the learners, and the ones who refuse to sit still.
          </p>
        </div>

        {/* Founder Section */}
        <div className="mt-16 pt-16 border-t border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Meet the Founder</h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://media.base44.com/images/public/69a61a047827463e7cdbc1eb/93f3cfcd7_IMG_3860.jpg" 
                alt="Hector A. Navarrete" 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Hector A. Navarrete</h3>
                <p className="text-slate-600 font-semibold mb-4">
                  Owner: SurfCoast Plumbing<br />
                  Developer/Admin: SurfCoast Contractor Market Place
                </p>
              </div>

              <div className="space-y-4 text-slate-700">
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

                <p className="text-base italic text-slate-600 pt-2">
                  "If you're here, you're in the right place."
                </p>
              </div>

              <div className="pt-4">
                <p className="text-sm text-slate-500 font-semibold">
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