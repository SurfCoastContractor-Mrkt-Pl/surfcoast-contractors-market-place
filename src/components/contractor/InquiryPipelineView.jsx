import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import InquiryStatusBadge from "./InquiryStatusBadge";
import InquiryUpdateModal from "./InquiryUpdateModal";

export default function InquiryPipelineView({ contractorEmail }) {
  const [inquiries, setInquiries] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInquiries();
  }, [contractorEmail]);

  const loadInquiries = async () => {
    try {
      const data = await base44.entities.QuoteRequest.filter({
        contractor_email: contractorEmail
      });
      setInquiries(data || []);
    } catch (err) {
      console.error("Error loading inquiries:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (inquiryId, newStatus, message = "") => {
    try {
      await base44.entities.QuoteRequest.update(inquiryId, {
        status: newStatus,
        quote_message: message || undefined
      });
      setInquiries(inquiries.map(q => q.id === inquiryId ? { ...q, status: newStatus, quote_message: message } : q));
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error updating inquiry:", err);
    }
  };

  const groupedInquiries = {
    pending: inquiries.filter(q => q.status === "pending"),
    view_approved: inquiries.filter(q => q.status === "view_approved"),
    quoted: inquiries.filter(q => q.status === "quoted"),
    accepted: inquiries.filter(q => q.status === "accepted"),
    rejected: inquiries.filter(q => q.status === "rejected"),
    view_denied: inquiries.filter(q => q.status === "view_denied")
  };

  const stages = [
    { key: "pending", label: "Pending Review", icon: Clock, count: groupedInquiries.pending.length },
    { key: "view_approved", label: "Ready to Quote", icon: MessageSquare, count: groupedInquiries.view_approved.length },
    { key: "quoted", label: "Quoted", icon: CheckCircle, count: groupedInquiries.quoted.length },
    { key: "accepted", label: "Accepted", icon: CheckCircle, count: groupedInquiries.accepted.length },
  ];

  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>Loading inquiries...</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Pipeline Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {stages.map(stage => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.key}
              style={{
                padding: "16px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(29, 111, 164, 0.2)",
                borderRadius: "8px",
                textAlign: "center"
              }}
            >
              <Icon size={20} style={{ color: "#1d6fa4", marginBottom: "8px" }} />
              <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", margin: "0 0 4px" }}>{stage.label}</p>
              <p style={{ fontSize: "28px", fontWeight: "700", color: "#ffffff", margin: "0" }}>{stage.count}</p>
            </div>
          );
        })}
      </div>

      {/* Inquiries by Stage */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {stages.map(stage => (
          <div key={stage.key} style={{ borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.1)", overflow: "hidden" }}>
            <div
              onClick={() => setExpandedId(expandedId === stage.key ? null : stage.key)}
              style={{
                padding: "14px 16px",
                background: "rgba(29, 111, 164, 0.1)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(29, 111, 164, 0.15)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(29, 111, 164, 0.1)"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <stage.icon size={18} style={{ color: "#1d6fa4" }} />
                <span style={{ fontWeight: "600", color: "#ffffff" }}>{stage.label}</span>
                <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>({stage.count})</span>
              </div>
              {expandedId === stage.key ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {expandedId === stage.key && (
              <div style={{ padding: "12px" }}>
                {groupedInquiries[stage.key].length > 0 ? (
                  groupedInquiries[stage.key].map(inquiry => (
                    <div
                      key={inquiry.id}
                      style={{
                        padding: "12px",
                        marginBottom: "8px",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onClick={() => {
                        setSelectedInquiry(inquiry);
                        setIsModalOpen(true);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                        e.currentTarget.style.borderColor = "rgba(29, 111, 164, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px" }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "600", color: "#ffffff" }}>
                            {inquiry.job_title}
                          </p>
                          <p style={{ margin: "0 0 6px", fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                            From: {inquiry.customer_name}
                          </p>
                          <p style={{ margin: "0", fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                            {(inquiry.work_description || '').substring(0, 60)}{inquiry.work_description?.length > 60 ? '...' : ''}
                          </p>
                        </div>
                        <InquiryStatusBadge status={inquiry.status} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "16px", textAlign: "center", color: "rgba(255, 255, 255, 0.4)" }}>
                    <p style={{ margin: "0" }}>No inquiries in this stage</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {inquiries.length === 0 && (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(255, 255, 255, 0.4)" }}>
          <MessageSquare size={32} style={{ margin: "0 auto 12px", display: "block" }} />
          <p>No inquiries yet. When customers send you job requests, they'll appear here.</p>
        </div>
      )}

      {/* Update Modal */}
      {selectedInquiry && (
        <InquiryUpdateModal
          isOpen={isModalOpen}
          inquiry={selectedInquiry}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInquiry(null);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}