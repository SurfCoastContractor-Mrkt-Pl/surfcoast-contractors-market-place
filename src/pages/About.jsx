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
                  Hector's path wasn't easy, and that's exactly the point. Born and raised in San Diego, California, his early years were marked by struggle—rough times in school led to homelessness for 11 years. But instead of accepting that narrative, he fought back. He earned his High School diploma, went to trade school for Computer Systems, and has spent over a decade mastering the plumbing trade.
                </p>

                <p>
                  Today, he's a Purple Belt in Gracie Jiu-Jitsu under Professor Omar in Hemet, CA—a discipline that shaped his philosophy: show up, put in the work, never quit. He's an avid reader, a self-described conspiracy theory enthusiast (yes, he wears his tinfoil hat when watching The Why Files), and a devoted husband and father.
                </p>

                <p>
                  But here's what really drives him: he sees your fight. Whether you're just starting out or scaling something real, Hector understands that the real metric of success isn't credentials or connections—it's the heart you bring to the table. That's what this platform is built on.
                </p>

                <p className="text-base italic text-slate-600 pt-2">
                  "In the end, what matters most is your fight."
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