import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Zap } from "lucide-react";
import InquiryPipelineView from "@/components/contractor/InquiryPipelineView";
import ExampleBanner from "@/components/examples/ExampleBanner";
import useExampleVisibility from "@/hooks/useExampleVisibility";

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

  const completedJobs = contractor?.completed_jobs_count || 0;
  const { showExamples, toggleExamples, autoHidden } = useExampleVisibility('inquiries', completedJobs);

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

        {/* Example Entry */}
        <ExampleBanner showExamples={showExamples} onToggle={toggleExamples} autoHidden={autoHidden}>
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "16px" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Example Inquiry</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <p style={{ color: "#fff", fontWeight: "700", fontSize: "16px", margin: "0 0 4px" }}>Outdoor Deck Repair</p>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", margin: "0 0 4px" }}>Customer: David Nguyen</p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", margin: "0" }}>Budget: $400–$700 · Requested: Mar 28, 2026</p>
              </div>
              <span style={{ background: "#f59e0b", color: "#78350f", fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "999px" }}>Pending Response</span>
            </div>
          </div>
        </ExampleBanner>

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