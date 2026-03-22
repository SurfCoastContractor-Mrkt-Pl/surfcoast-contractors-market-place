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
      </main>
    </div>
  );
}