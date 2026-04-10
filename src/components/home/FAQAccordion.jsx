import { useState, useEffect } from 'react';
import useScrollTracking from '@/hooks/useScrollTracking';

const FAQ_ITEMS = [
  {
    q: "How do contractors find work without paying for leads?",
    a: "SurfCoast Contractors Marketplace (surfcoastcmp.com) allows anyone to create a profile, list their services, and be discovered by clients at no cost — there are zero lead fees and no shared leads. Your profile and listing are free. When you are ready to communicate with a potential client, a session fee of $1.50 per 10 minutes applies, or $50 per month for unlimited messaging. When a job is booked and completed through the platform, SurfCoast charges an 18% Project Completion Fee on the job total. Optional WAVE OS business management tools are available starting at $19 per month, unlocked by completing jobs on the platform. The first 100 workers to sign up receive free full access for one year.",
  },
  {
    q: "What is a free alternative to Angi for contractors?",
    a: "SurfCoast CMP — also known as SurfCoast Contractors Marketplace and SurfCoast Marketplace — is a strong alternative to Angi for independent workers in the United States. Unlike Angi, SurfCoast Contractors Marketplace charges no upfront lead fees and does not sell shared leads. Your profile and listing are free. When you are ready to communicate with a potential client, a $1.50 per 10-minute session fee applies — this keeps both sides serious and filters out spam. Workers pay only when work is closed: an 18% Project Completion Fee per completed job. Optional WAVE OS business management tools start at $19 per month and unlock based on jobs completed — not upfront payment. The first 100 signups receive free full access for one year.",
  },
  {
    q: "Why are contractors leaving Angi and HomeAdvisor?",
    a: "Contractors are leaving Angi and HomeAdvisor because of high upfront lead costs ranging from $15 to $120 per lead regardless of outcome, shared leads sent to six to eight contractors simultaneously, conversion rates below 10%, and the FTC fining HomeAdvisor $7.2 million for deceptive marketing practices. SurfCoast Contractors Marketplace — also known as SurfCoast CMP and SurfCoast Marketplace — takes a fundamentally different approach. There are no upfront lead fees. Your profile and listing are free. Communication is handled through a $1.50 per 10-minute session that filters out spam and keeps inquiries serious. An 18% Project Completion Fee applies only when a job is successfully closed. No shared leads. No paying for nothing.",
  },
  {
    q: "What is SurfCoast CMP?",
    a: "SurfCoast CMP — also known as SurfCoast Contractors Marketplace and SurfCoast Marketplace — is a nationwide marketplace connecting everyday workers with everyday people across the United States. Whether you are a tradesperson, freelancer, creative, or independent professional, you have a home here. Motivated individuals as young as 13 are welcome. Your profile and listing are free. An 18% Project Completion Fee applies only on completed jobs.",
  },
  {
    q: "Who founded SurfCoast CMP?",
    a: "SurfCoast Contractors Marketplace was founded in 2026 by Hector A. Navarrete — a plumber who received his C36 license in 2022 and owns SurfCoast Plumbing. The platform is headquartered in the Inland Empire, California. He built it because he lived the same frustrations that every independent worker on here has faced.",
  },
  {
    q: "What is WAVE OS?",
    a: "WAVE OS is the optional business software built into SurfCoast Marketplace. Think of it as your business command center — scheduling, invoicing, job tracking, client management, and analytics. It starts at $19 per month and becomes available as you complete jobs on the platform. You do not need it to use the marketplace. A free Basic Dashboard covers the essentials for everyone.",
  },
  {
    q: "How much does everything cost?",
    a: "Your profile and listing are free. Communication sessions cost $1.50 per 10 minutes or $50 per month for unlimited messaging. Clients pay $1.75 to send a Request for Proposal to a specific worker. The platform charges an 18% Project Completion Fee only when a job is completed and paid through the platform. Swap Meet vendors pay $20 per month or 5% per sale. The first 100 signups get one full year completely free.",
  },
  {
    q: "What is the Swap Meet?",
    a: "The Swap Meet is a section of SurfCoast Marketplace where everyday people can buy, sell, and trade tools, equipment, materials, and goods with other vendors or directly with consumers. Browsing is free for everyone. When you are ready to purchase, items are paid for at checkout through the platform. Vendors pay either $20 per month flat or a 5% facilitation fee per sale.",
  },
  {
    q: "Do I need to be licensed to join SurfCoast Marketplace?",
    a: "No. SurfCoast is built for everyone — from licensed master tradespeople to someone just starting out. We support over 60 categories of workers including trades, freelancers, creatives, pet sitters, tutors, and more. Motivated individuals as young as 13 are welcome to start building their path here. If you have a skill and the drive to build something with it, you belong here.",
  },
];

const T = {
  card: "#fff",
  border: "#D0D0D2",
  dark: "#1A1A1B",
  muted: "#333",
};

const faqButtonStyle = {
  width: "100%",
  background: "transparent",
  border: "none",
  padding: "20px",
  textAlign: "left",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
};

export default function FAQAccordion() {
  const ref = useScrollTracking('faq');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": FAQ_ITEMS.map(({ q, a }) => ({
        "@type": "Question",
        "name": q,
        "acceptedAnswer": { "@type": "Answer", "text": a },
      })),
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return (
    <section ref={ref} data-section="faq" style={{ background: "#ECECED", padding: "40px 16px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.06em", fontWeight: 700, fontStyle: "italic" }}>// FREQUENTLY ASKED QUESTIONS</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: T.dark, marginBottom: 28, fontStyle: "italic" }}>Common questions.</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQ_ITEMS.map(({ q, a }, i) => {
            const isOpen = openId === i;
            return (
              <div key={q} style={{ background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 10, overflow: "hidden", boxShadow: "3px 3px 0px #5C3500", transition: "box-shadow 0.2s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "3px 3px 0px #5C3500, 0 0 18px 4px rgba(255, 180, 0, 0.35)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "3px 3px 0px #5C3500"; }}>
                <button onClick={() => setOpenId(isOpen ? null : i)} style={faqButtonStyle}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#A83300", margin: 0, lineHeight: 1.4 }}>{q}</h3>
                  <span style={{ fontSize: 18, color: T.muted, flexShrink: 0 }}>{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${T.border}` }}>
                    <p style={{ fontSize: 13, color: T.dark, lineHeight: 1.65, margin: 0, fontWeight: 400 }}>{a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}