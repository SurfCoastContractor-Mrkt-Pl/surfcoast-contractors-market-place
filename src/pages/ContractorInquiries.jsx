import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Zap } from "lucide-react";
import InquiryPipelineView from "@/components/contractor/InquiryPipelineView";

export default function ContractorInquiries() {
  const [contractor, setContractor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContractor = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          window.location.href = '/';
          return;
        }

        const contractors = await base44.entities.Contractor.filter({ email: user.email });
        if (contractors && contractors.length > 0) {
          setContractor(contractors[0]);
        }
      } catch (err) {
        console.error("Error loading contractor:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadContractor();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a1628" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1d6fa4", animation: "pulse 1.5s infinite" }} />
      </div>
    );
  }

  if (!contractor) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", background: "#0a1628", minHeight: "100vh" }}>
        <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>Please complete your contractor profile to view inquiries.</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#0a1628", minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <MessageSquare size={28} style={{ color: "#1d6fa4" }} />
            <h1 style={{ margin: "0", fontSize: "28px", fontWeight: "800", color: "#ffffff" }}>
              Job Inquiries
            </h1>
          </div>
          <p style={{ margin: "0", color: "rgba(255, 255, 255, 0.6)" }}>
            Track and manage incoming job requests from customers
          </p>
        </div>

        {/* Info Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ padding: "16px", background: "rgba(29, 111, 164, 0.1)", border: "1px solid rgba(29, 111, 164, 0.2)", borderRadius: "8px" }}>
            <p style={{ margin: "0 0 8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", fontWeight: "600" }}>
              💡 TIP
            </p>
            <p style={{ margin: "0", fontSize: "13px", color: "rgba(255, 255, 255, 0.8)" }}>
              Review and respond to inquiries promptly to increase your chances of winning jobs.
            </p>
          </div>
        </div>

        {/* Pipeline */}
        <InquiryPipelineView contractorEmail={contractor.email} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}