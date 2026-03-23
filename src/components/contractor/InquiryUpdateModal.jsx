import { useState } from "react";
import { X } from "lucide-react";
import InquiryStatusBadge from "./InquiryStatusBadge";

export default function InquiryUpdateModal({ isOpen, inquiry, onClose, onStatusUpdate }) {
  const [selectedStatus, setSelectedStatus] = useState(inquiry?.status || "pending");
  const [quoteAmount, setQuoteAmount] = useState(inquiry?.quote_amount || "");
  const [quoteMessage, setQuoteMessage] = useState(inquiry?.quote_message || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !inquiry) return null;

  const statusOptions = [
    { value: "view_approved", label: "Approve & Ready to Quote" },
    { value: "view_denied", label: "Decline Request" },
    { value: "quoted", label: "Submit Quote" },
    { value: "accepted", label: "Mark as Accepted" },
    { value: "rejected", label: "Mark as Rejected" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData = { status: selectedStatus };
      if (selectedStatus === "quoted" && quoteAmount) {
        updateData.quote_amount = parseFloat(quoteAmount);
      }
      if (quoteMessage) {
        updateData.quote_message = quoteMessage;
      }

      await onStatusUpdate(inquiry.id, selectedStatus, quoteMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100
    }} onClick={onClose}>
      <div
        style={{
          background: "rgba(10, 22, 40, 0.95)",
          border: "1px solid rgba(29, 111, 164, 0.3)",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
          <div>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "700", color: "#ffffff" }}>
              {inquiry.job_title}
            </h3>
            <p style={{ margin: "0", fontSize: "13px", color: "rgba(255, 255, 255, 0.6)" }}>
              From: {inquiry.customer_name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "rgba(255, 255, 255, 0.5)",
              padding: "4px"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Inquiry Details */}
        <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "14px", borderRadius: "6px", marginBottom: "20px" }}>
          <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "600", color: "rgba(255, 255, 255, 0.7)" }}>
            WORK DESCRIPTION
          </p>
          <p style={{ margin: "0", fontSize: "13px", color: "rgba(255, 255, 255, 0.8)", lineHeight: "1.5" }}>
            {inquiry.work_description}
          </p>
        </div>

        {/* Current Status */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "600", color: "rgba(255, 255, 255, 0.7)" }}>
            CURRENT STATUS
          </p>
          <InquiryStatusBadge status={inquiry.status} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Status Update */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "rgba(255, 255, 255, 0.7)", marginBottom: "6px" }}>
              UPDATE STATUS
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                fontSize: "13px",
                outline: "none"
              }}
            >
              <option value={inquiry.status}>No Change</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Quote Amount (if submitting quote) */}
          {selectedStatus === "quoted" && (
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "rgba(255, 255, 255, 0.7)", marginBottom: "6px" }}>
                QUOTE AMOUNT ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter your quote amount"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#ffffff",
                  fontSize: "13px",
                  outline: "none"
                }}
              />
            </div>
          )}

          {/* Message */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "rgba(255, 255, 255, 0.7)", marginBottom: "6px" }}>
              MESSAGE (OPTIONAL)
            </label>
            <textarea
              placeholder="Add notes or message to customer..."
              value={quoteMessage}
              onChange={(e) => setQuoteMessage(e.target.value)}
              maxLength={500}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                fontSize: "13px",
                outline: "none",
                fontFamily: "inherit",
                resize: "vertical",
                minHeight: "80px"
              }}
            />
            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "rgba(255, 255, 255, 0.4)" }}>
              {quoteMessage.length}/500
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "transparent",
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "6px",
                border: "none",
                background: "#1d6fa4",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "600",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.background = "#1e5a96")}
              onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.background = "#1d6fa4")}
            >
              {isSubmitting ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}