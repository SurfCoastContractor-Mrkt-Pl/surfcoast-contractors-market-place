import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Briefcase, Users, Zap } from "lucide-react";

export default function Home() {
  const [spotsRemaining] = useState(77);

  const waveOSTiers = [
    { name: "Starter", price: "$19", jobs: "5+" },
    { name: "Pro", price: "$39", jobs: "32+" },
    { name: "Max", price: "$59", jobs: "64+" },
    { name: "Premium", price: "$100", jobs: "100+" },
    { name: "Residential Bundle", price: "$125", jobs: "100+" },
  ];

  return (
    <div className="w-full bg-background min-h-screen">

      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden bg-background py-16 lg:py-28 px-4 lg:px-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500 rounded-full opacity-10 translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight">
            Built for the <span className="logo-gradient-text">Solo Journey</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            SurfCoast connects independent entrepreneurs, solo professionals, and consumers in one ecosystem. Free to join. Verified. Community-first.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-8">
            <Zap className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-bold text-orange-700 uppercase tracking-wide">{100 - spotsRemaining} Founding Members — {spotsRemaining} Spots Left</span>
          </div>
        </div>

        {/* ==================== 4 LARGE CIRCLES + SMALLER CIRCLES IN GAPS ==================== */}
        <div className="relative max-w-6xl mx-auto">
          {/* Container for circles */}
          <div className="relative h-[600px] flex items-center justify-center">

            {/* Circle 1: Entrepreneurs (Top-Left) */}
            <div className="absolute top-0 left-1/4 -translate-x-1/2 w-40 h-40 rounded-full bg-secondary/20 border-2 border-secondary flex items-center justify-center hover:shadow-2xl transition-all group cursor-pointer">
              <Link to="/BecomeContractor" className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 group-hover:scale-105 transition-transform">
                <Briefcase className="w-8 h-8 text-secondary mb-2" />
                <span className="font-bold text-foreground text-sm">Entrepreneurs</span>
                <span className="text-xs text-muted-foreground">Enter →</span>
              </Link>
            </div>

            {/* Circle 2: Clients & Consumers (Top-Right) */}
            <div className="absolute top-0 right-1/4 translate-x-1/2 w-40 h-40 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center hover:shadow-2xl transition-all group cursor-pointer">
              <Link to="/CustomerSignup" className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 group-hover:scale-105 transition-transform">
                <Users className="w-8 h-8 text-primary mb-2" />
                <span className="font-bold text-foreground text-sm">Clients & Consumers</span>
                <span className="text-xs text-muted-foreground">Enter →</span>
              </Link>
            </div>

            {/* Circle 3: Mission Statement (Bottom-Left) */}
            <div className="absolute bottom-0 left-1/4 -translate-x-1/2 w-40 h-40 rounded-full bg-muted border-2 border-border flex items-center justify-center hover:shadow-2xl transition-all group cursor-pointer">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 group-hover:scale-105 transition-transform">
                <span className="font-bold text-foreground text-sm mb-2">Mission</span>
                <span className="text-xs text-muted-foreground leading-tight">Empowering independent workers to own their path</span>
              </div>
            </div>

            {/* Circle 4: WAVE OS (Bottom-Right) */}
            <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-40 h-40 rounded-full bg-blue-100/30 border-2 border-blue-400 flex items-center justify-center hover:shadow-2xl transition-all group cursor-pointer">
              <Link to="/pricing" className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 group-hover:scale-105 transition-transform">
                <Zap className="w-8 h-8 text-blue-600 mb-2" />
                <span className="font-bold text-foreground text-sm">WAVE OS</span>
                <span className="text-xs text-muted-foreground">Tiers & Pricing →</span>
              </Link>
            </div>

            {/* Small Circle 1: Why SurfCoast (Gap between Entrepreneurs & Clients) */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-300 flex items-center justify-center hover:shadow-lg transition-all group cursor-pointer">
              <Link to="/why-surfcoast" className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 group-hover:scale-105 transition-transform">
                <span className="font-bold text-foreground text-xs">Why SurfCoast</span>
                <span className="text-[10px] text-muted-foreground">Learn →</span>
              </Link>
            </div>

            {/* Small Circle 2: Solo/Startup (Gap between Entrepreneurs & Mission) */}
            <div className="absolute bottom-1/3 left-1/3 -translate-x-1/2 w-28 h-28 rounded-full bg-gradient-to-br from-secondary-100 to-secondary-50 border-2 border-secondary/40 flex items-center justify-center hover:shadow-lg transition-all group cursor-pointer">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 group-hover:scale-105 transition-transform">
                <span className="font-bold text-foreground text-xs">Solo/Startup</span>
                <span className="text-[10px] text-muted-foreground">For you →</span>
              </div>
            </div>

            {/* Small Circle 3: About Us (Gap between Clients & WAVE OS) */}
            <div className="absolute bottom-1/3 right-1/3 translate-x-1/2 w-28 h-28 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-slate-300 flex items-center justify-center hover:shadow-lg transition-all group cursor-pointer">
              <Link to="/About" className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 group-hover:scale-105 transition-transform">
                <span className="font-bold text-foreground text-xs">About Us</span>
                <span className="text-[10px] text-muted-foreground">Our story →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== WAVE OS PRICING SECTION ==================== */}
      <section className="py-20 px-4 lg:px-8 bg-muted border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-4">WAVE OS Tiers</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Optional software for contractors. Start free. Unlock tiers as you complete jobs. Licensed pros get instant access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {waveOSTiers.map((tier, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 text-center hover:shadow-lg hover:border-primary transition-all">
                <h3 className="font-bold text-foreground text-sm mb-2">{tier.name}</h3>
                <div className="text-3xl font-extrabold text-primary mb-1">{tier.price}</div>
                <p className="text-xs text-muted-foreground mb-4">/month</p>
                <div className="bg-muted rounded px-3 py-2 mb-4 text-xs font-semibold text-foreground">
                  {tier.jobs} jobs to unlock
                </div>
                <Link
                  to="/pricing"
                  className="text-xs font-bold text-primary hover:opacity-70 transition-opacity flex items-center justify-center gap-1"
                >
                  View details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              <strong>For Licensed Professionals:</strong> Have a C-36, H.I.S. License, or equivalent credentials? Gain instant access to all WAVE OS tiers. Choose which to subscribe to and start immediately.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all text-lg"
            >
              Explore All Plans <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className="py-20 px-4 lg:px-8 bg-background border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-foreground text-center mb-16">What You Get</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { title: "Free Profile", desc: "Create a verified profile at no cost. Build your reputation from day one." },
              { title: "Community First", desc: "Connect with verified professionals and clients in a supportive ecosystem." },
              { title: "Secure Payments", desc: "All transactions protected by Stripe. Get paid fast, keep your trust intact." },
              { title: "Mobile Ready", desc: "Full access from any device. Manage your business on the go." },
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

      {/* ==================== CTA ==================== */}
      <section className="py-20 px-4 lg:px-8 bg-muted border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-foreground mb-6">Ready to start?</h2>
          <p className="text-muted-foreground text-lg mb-10">Join SurfCoast today. No credit card. No commitment. Just you, your skills, and real opportunities.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/BecomeContractor"
              className="px-8 py-4 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all text-lg"
            >
              Join as Entrepreneur
            </Link>
            <Link
              to="/CustomerSignup"
              className="px-8 py-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all text-lg"
            >
              Find a Professional
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-card py-10 px-4 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 lg:flex-row lg:gap-0 lg:items-center lg:justify-between">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SurfCoast. All rights reserved.
          </div>
          <div className="flex gap-6">
            {[
              { label: "About", to: "/About" },
              { label: "Why SurfCoast", to: "/why-surfcoast" },
              { label: "Pricing", to: "/pricing" },
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