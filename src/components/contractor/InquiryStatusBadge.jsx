export default function InquiryStatusBadge({ status }) {
  const statusConfig = {
    pending: { bg: "rgba(249, 115, 22, 0.15)", color: "#f97316", label: "Pending Review" },
    view_approved: { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", label: "Approved to Quote" },
    view_denied: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444", label: "Declined" },
    quoted: { bg: "rgba(34, 197, 94, 0.15)", color: "#22c55e", label: "Quoted" },
    accepted: { bg: "rgba(34, 197, 94, 0.15)", color: "#22c55e", label: "Accepted" },
    rejected: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444", label: "Rejected" }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span style={{
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: "6px",
      background: config.bg,
      color: config.color,
      fontSize: "12px",
      fontWeight: "600"
    }}>
      {config.label}
    </span>
  );
}