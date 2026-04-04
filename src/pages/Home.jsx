import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Briefcase, Users, Zap } from "lucide-react";

export default function Home() {
  const [spotsRemaining] = useState(77);

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

        {/* ==================== 4 LARGE CIRCLES IN ROW + 3 SMALL CIRCLES UNDERNEATH ==================== */}
        <div className="relative max-w-6xl mx-auto">
          {/* Container for circles */}
          <div className="relative h-[400px] flex items-center justify-center">

            {/* Top row: 4 large circles */}

            {/* Circle 1: Entrepreneurs */}
            <div className="absolute top-0 left-[18%] -translate-x-1/2 w-40 h-40 rounded-full bg-slate-400 border-2 border-slate-500 flex items-center justify-center hover:shadow-2xl transition-all group cursor-pointer z-40">
              <Link to="/BecomeContractor" className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 group-hover:scale-105 transition-transform">
                <Briefcase className="w-8 h-8 text-black mb-2" />
                <span className="font-bold text-black text-lg" style={{fontFamily: "'BankGothic MD BT', 'Courier Prime', monospace"}}>Entrepreneurs</span>
                <span className="text-sm text-black" style={{fontFamily: "'BankGothic MD BT', 'Courier Prime', monospace"}}>Enter →</span>
              </Link>
            </div>

            {/* Circle 2: Clients & Consumers */}
            <div className="absolute top-0 left-[40%] -translate-x-1/2 w-40 h-40 rounded-full bg-slate-400 border-2 border-slate-500 flex items-center justify-center hover:shadow-2xl transition-all group cursor-pointer z-30">
              <Link to="/CustomerSignup" className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 group-hover:scale-105 transition-transform">
                <Users className="w-8 h-8 text-black mb-2" />
                <span className="font-bold text-black text-lg" style={{fontFamily: "'BankGothic MD BT', 'Courier Prime', monospace"}}>Clients &<br />Consumers</span>
                <span className="text-sm text-black" style={{fontFamily: "'BankGothic MD BT', 'Courier Prime', monospace"}}>Enter →</span>
              </Link>
            </div>

            {/* Circle 3: Mission Statement */}
            <div className="absolute top-0 left-[60%] -translate-x-1/2 w-40 h-40 rounded-full bg-slate-400 border-2 border-slate-500 flex items-center justify-center hover:shadow-2xl transition-all group cursor-pointer z-20">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 group-hover:scale-105 transition-transform">
                <span className="font-bold text-black text-lg mb-2" style={{fontFamily: "'BankGothic MD BT', 'Courier Prime', monospace"}}>Mission</span>
                <span className="text-sm text-black leading-tight" style={{fontFamily: "'BankGothic MD BT', 'Courier Prime', monospace"}}>Empowering independent workers</span>
              </div>
            </div>

            {/* Circle 4: WAVE OS */}
            <div className="absolute top-0 left-[82%] -translate-x-1/2 w-40 h-40 rounded-full bg-slate-400 border-2 border-slate-500 flex items-center justify-center hover:shadow-2xl transition-all group cursor-pointer z-10">
              <Link to="/wave-os-details" className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 group-hover:scale-105 transition-transform">
                <Zap className="w-8 h-8 text-black mb-2" />
                <span className="font-bold text-black text-lg" style={{fontFamily: "'BankGothic MD BT', 'Courier Prime', monospace"}}>WAVE OS</span>
                <span className="text-sm text-black" style={{fontFamily: "'BankGothic MD BT', 'Courier Prime', monospace"}}>Learn More →</span>
              </Link>
            </div>

            {/* Bottom row: 3 small circles (centered under gaps) */}

            {/* Small Circle 1: Why SurfCoast (under gap 1-2) */}
            <div className="absolute bottom-16 left-[29%] -translate-x-1/2 w-28 h-28 rounded-full bg-slate-400 border-2 border-slate-500 flex items-center justify-center hover:shadow-lg transition-all group cursor-pointer z-40">
              <Link to="/why-surfcoast" className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 group-hover:scale-105 transition-transform">
                <span className="font-bold text-black text-sm" style={{fontFamily: "'BankGothic MD BT', 'Courier Prime', monospace"}}>Why SurfCoast</span>
                <span className="text-xs text-black" style={{fontFamily: "'BankGothic MD BT', 'Courier Prime', monospace"}}>Learn →</span>
              </Link>
            </div>

            {/* Small Circle 2: Solo/Startup (under gap 2-3) */}
            <div className="absolute bottom-16 left-[50%] -translate-x-1/2 w-28 h-28 rounded-full bg-slate-400 border-2 border-slate-500 flex items-center justify-center hover:shadow-lg transition-all group cursor-pointer z-30">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 group-hover:scale-105 transition-transform">
                <span className="font-bold text-black text-sm" style={{fontFamily: "'BankGothic MD BT', 'Courier Prime', monospace"}}>Solo/Startup</span>
                <span className="text-xs text-black" style={{fontFamily: "'BankGothic MD BT', 'Courier Prime', monospace"}}>For you →</span>
              </div>
            </div>

            {/* Small Circle 3: About Us (under gap 3-4) */}
            <div className="absolute bottom-16 left-[71%] -translate-x-1/2 w-28 h-28 rounded-full bg-slate-400 border-2 border-slate-500 flex items-center justify-center hover:shadow-lg transition-all group cursor-pointer z-20">
              <Link to="/About" className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 group-hover:scale-105 transition-transform">
                <span className="font-bold text-black text-sm" style={{fontFamily: "'BankGothic MD BT', 'Courier Prime', monospace"}}>About Us</span>
                <span className="text-xs text-black" style={{fontFamily: "'BankGothic MD BT', 'Courier Prime', monospace"}}>Our story →</span>
              </Link>
            </div>
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