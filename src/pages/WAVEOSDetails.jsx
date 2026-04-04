import { ArrowLeft, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function WAVEOSDetails() {
  const tiers = [
    { name: "Starter", price: "$19", jobs: "5+", features: ["5 active jobs", "Basic messaging", "Job scheduling", "Mobile app access"] },
    { name: "Pro", price: "$39", jobs: "32+", features: ["Unlimited jobs", "CRM tools", "Invoice generation", "Priority placement"] },
    { name: "Max", price: "$59", jobs: "64+", features: ["Everything in Pro", "GPS tracking", "Field ops suite", "Document hub"] },
    { name: "Premium", price: "$100", jobs: "100+", features: ["Everything in Max", "AI scheduling", "HubSpot sync", "Advanced tools"] },
    { name: "Residential Bundle", price: "$125", jobs: "100+", features: ["Everything in Premium", "Unlimited messaging", "Residential Wave tools", "No additional fees"] },
  ];

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-background py-20 lg:py-32 px-4 lg:px-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-muted hover:bg-border transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Back to Home</span>
          </Link>

          <div className="mb-16 max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-blue-100/20 border border-blue-400/40">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-600 uppercase tracking-wide">Field Operations Software</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight">
              WAVE OS<br />
              <span className="text-blue-600">For Independent Contractors</span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              Professional field operations software designed for solo entrepreneurs. Manage jobs, track finances, schedule efficiently, and grow your business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/BecomeContractor"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all text-lg"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all text-lg"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 px-4 lg:px-8 bg-muted border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-4">WAVE OS Tiers</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Start free. Unlock tiers as you complete jobs. Licensed professionals get instant access to all tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {tiers.map((tier, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 text-center hover:shadow-lg hover:border-primary transition-all">
                <h3 className="font-bold text-foreground text-sm mb-2">{tier.name}</h3>
                <div className="text-3xl font-extrabold text-primary mb-1">{tier.price}</div>
                <p className="text-xs text-muted-foreground mb-4">/month</p>
                <div className="bg-muted rounded px-3 py-2 mb-6 text-xs font-semibold text-foreground">
                  {tier.jobs} jobs to unlock
                </div>
                <ul className="space-y-2 mb-6 text-left">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-card border-2 border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground mb-6 text-lg">
              <strong className="text-foreground">Licensed Professionals:</strong> Have a C-36, H.I.S. License, or equivalent? Get instant access to all tiers. Choose your subscription level and start immediately.
            </p>
            <Link
              to="/Pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all text-lg"
            >
              View Full Pricing Details <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 lg:px-8 bg-background border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-foreground text-center mb-16">What's Included</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {[
              { title: "Job Management", desc: "Post jobs, receive bids, manage scopes of work, and track progress in real time." },
              { title: "Field Operations", desc: "GPS tracking, photo documentation, digital signatures, and mobile-first interface." },
              { title: "Financial Tools", desc: "Invoice generation, payment tracking, QuickBooks export, and payout management." },
              { title: "Client Communication", desc: "Secure messaging, progress updates, and project collaboration tools." },
              { title: "Scheduling", desc: "Calendar management, availability tracking, and AI-powered scheduling assistant." },
              { title: "Growth Tools", desc: "Performance analytics, referral tracking, and professional reputation building." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 lg:px-8 bg-muted border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-foreground mb-6">Ready to scale your business?</h2>
          <p className="text-muted-foreground text-lg mb-10">Start with a free profile. Unlock tiers as you grow. No credit card required.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/BecomeContractor"
              className="px-8 py-4 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all text-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/"
              className="px-8 py-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all text-lg"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-10 px-4 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 lg:flex-row lg:gap-0 lg:items-center lg:justify-between">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SurfCoast. All rights reserved.
          </div>
          <div className="flex gap-6">
            {[
              { label: "Home", to: "/" },
              { label: "About", to: "/About" },
              { label: "Privacy", to: "/PrivacyPolicy" },
            ].map(({ label, to }) => (
              <Link key={label} to={to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}