import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Users,
  Trophy,
  Phone,
  Mail,
  AlertCircle,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  getPendingApprovals,
  approveRegistration,
  rejectRegistration,
  PendingRegistration,
} from "../../services/approvalsService";

interface AdminApprovalsViewProps {
  onApprovalChanged?: () => void;
}

export const AdminApprovalsView: React.FC<AdminApprovalsViewProps> = ({
  onApprovalChanged,
}) => {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await getPendingApprovals();
      setRegistrations(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string, teamName: string) => {
    setActionLoadingId(id);
    try {
      const res = await approveRegistration(id);
      if (res.success) {
        setToastMessage(`✅ Team "${teamName}" approved successfully and added to tournament roster!`);
        await loadData();
        if (onApprovalChanged) onApprovalChanged();
      }
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleReject = async (id: string, teamName: string) => {
    const reason = window.prompt(`Enter rejection reason for "${teamName}" (e.g. Incomplete roster, payment issue):`, "Incomplete squad documentation");
    if (reason === null) return; // User cancelled

    setActionLoadingId(id);
    try {
      const res = await rejectRegistration(id, reason);
      if (res.success) {
        setToastMessage(`⚠️ Team "${teamName}" registration was rejected.`);
        await loadData();
        if (onApprovalChanged) onApprovalChanged();
      }
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const filtered = registrations.filter((r) => {
    const matchesSearch =
      r.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tournamentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.captainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sportName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" ? true : r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = registrations.filter((r) => r.status === "pending").length;

  return (
    <div className="admin-view-container">
      {/* View Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h1>Team Registration Approvals</h1>
            <span
              style={{
                background: pendingCount > 0 ? "#ef4444" : "#10b981",
                color: "#ffffff",
                fontSize: "0.8rem",
                fontWeight: 800,
                padding: "0.2rem 0.65rem",
                borderRadius: "999px",
              }}
            >
              {pendingCount} Pending Review
            </span>
          </div>
          <p>
            Verify incoming squad applications, validate player count requirements, and approve or reject entries into live tournaments.
          </p>
        </div>

        <button
          onClick={loadData}
          className="admin-btn-secondary"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          title="Refresh Registrations"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {toastMessage && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#15803d",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            fontSize: "0.9rem",
            fontWeight: 600,
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar" style={{ marginBottom: "1.25rem" }}>
        <div className="admin-search-box">
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search squad, captain, or tournament..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`dash-filter-tab ${statusFilter === "pending" ? "active" : ""}`}
            style={{
              padding: "0.4rem 0.85rem",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid",
              borderColor: statusFilter === "pending" ? "#dc2626" : "#e2e8f0",
              background: statusFilter === "pending" ? "#fef2f2" : "#ffffff",
              color: statusFilter === "pending" ? "#dc2626" : "#475569",
            }}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`dash-filter-tab ${statusFilter === "approved" ? "active" : ""}`}
            style={{
              padding: "0.4rem 0.85rem",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid",
              borderColor: statusFilter === "approved" ? "#059669" : "#e2e8f0",
              background: statusFilter === "approved" ? "#ecfdf5" : "#ffffff",
              color: statusFilter === "approved" ? "#059669" : "#475569",
            }}
          >
            Approved ({registrations.filter((r) => r.status === "approved").length})
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`dash-filter-tab ${statusFilter === "rejected" ? "active" : ""}`}
            style={{
              padding: "0.4rem 0.85rem",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid",
              borderColor: statusFilter === "rejected" ? "#64748b" : "#e2e8f0",
              background: statusFilter === "rejected" ? "#f8fafc" : "#ffffff",
              color: statusFilter === "rejected" ? "#0f172a" : "#475569",
            }}
          >
            Rejected ({registrations.filter((r) => r.status === "rejected").length})
          </button>
          <button
            onClick={() => setStatusFilter("all")}
            className={`dash-filter-tab ${statusFilter === "all" ? "active" : ""}`}
            style={{
              padding: "0.4rem 0.85rem",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid",
              borderColor: statusFilter === "all" ? "#0284c7" : "#e2e8f0",
              background: statusFilter === "all" ? "#f0f9ff" : "#ffffff",
              color: statusFilter === "all" ? "#0284c7" : "#475569",
            }}
          >
            All Records ({registrations.length})
          </button>
        </div>
      </div>

      {/* Registrations List */}
      <div className="admin-data-card" style={{ padding: "0" }}>
        <div className="dash-table-wrap">
          <table className="dash-trans-table">
            <thead>
              <tr>
                <th>Squad / Team</th>
                <th>Tournament & Sport</th>
                <th>Captain Contact</th>
                <th>Roster & Fee</th>
                <th>Application Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6}>
                        <div className="dash-skeleton-pulse" style={{ height: "45px", width: "100%" }} />
                      </td>
                    </tr>
                  ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    No registrations found matching this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isPending = item.status === "pending";
                  const isApproved = item.status === "approved";
                  const isRejected = item.status === "rejected";

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                          <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                            {item.teamName}
                          </span>
                          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                            ID: {item.id} &bull; Applied {new Date(item.appliedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                          <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.9rem" }}>
                            {item.tournamentName}
                          </span>
                          <span style={{ fontSize: "0.78rem", color: "#059669", fontWeight: 600 }}>
                            {item.sportName}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", fontSize: "0.82rem" }}>
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>{item.captainName}</span>
                          <span style={{ color: "#64748b" }}>{item.contactPhone}</span>
                          <span style={{ color: "#64748b" }}>{item.email}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                          <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.85rem" }}>
                            👥 {item.memberCount} Players
                          </span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: item.paymentStatus.includes("Verified") ? "#15803d" : "#b45309",
                            }}
                          >
                            ₹{item.entryFee} ({item.paymentStatus})
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`dash-status-pill ${
                            isPending ? "upcoming" : isApproved ? "success" : "live"
                          }`}
                          style={{
                            background: isPending ? "#fef2f2" : isApproved ? "#ecfdf5" : "#f1f5f9",
                            color: isPending ? "#dc2626" : isApproved ? "#059669" : "#475569",
                            borderColor: isPending ? "#fecaca" : isApproved ? "#a7f3d0" : "#cbd5e1",
                          }}
                        >
                          {isPending ? "⏳ Pending Review" : isApproved ? "✔ Approved" : "✖ Rejected"}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        {isPending ? (
                          <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                            <button
                              disabled={actionLoadingId === item.id}
                              onClick={() => handleApprove(item.id, item.teamName)}
                              style={{
                                padding: "0.45rem 0.85rem",
                                background: "#059669",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                              }}
                              title="Approve registration and register team in tournament"
                            >
                              <CheckCircle2 size={15} />
                              <span>Approve</span>
                            </button>

                            <button
                              disabled={actionLoadingId === item.id}
                              onClick={() => handleReject(item.id, item.teamName)}
                              style={{
                                padding: "0.45rem 0.75rem",
                                background: "#ffffff",
                                color: "#dc2626",
                                border: "1px solid #fca5a5",
                                borderRadius: "6px",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                              }}
                              title="Reject registration"
                            >
                              <XCircle size={15} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                            {isApproved ? "Registered" : "Closed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
