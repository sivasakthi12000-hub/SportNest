import React, { useState, useEffect, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getPendingApprovals();
      setRegistrations(res.registrations || []);
    } catch (e) {
      console.warn("Error fetching approvals:", e);
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
    const reason = window.prompt(
      `Enter rejection reason for "${teamName}" (e.g. Incomplete roster, payment issue):`,
      "Incomplete squad documentation"
    );
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

  const handleDeleteEntry = async (id: string, teamName: string) => {
    if (!window.confirm(`Delete approval record for "${teamName}"?`)) return;
    try {
      await fetch(`/api/approvals/${id}`, { method: "DELETE" });
      setToastMessage(`🗑️ Record for "${teamName}" removed.`);
      await loadData();
      if (onApprovalChanged) onApprovalChanged();
    } catch (err: any) {
      console.warn("Delete approval record notice:", err);
    }
  };

  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      const matchesSearch =
        !searchQuery.trim() ||
        r.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tournamentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.captainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.sportName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" ? true : r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [registrations, searchQuery, statusFilter]);

  // Pagination calculations
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginated = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, safeCurrentPage, pageSize]);

  const handlePageChange = (p: number) => {
    setCurrentPage(Math.min(Math.max(1, p), totalPages));
  };

  const pendingCount = registrations.filter((r) => r.status === "pending").length;

  return (
    <div className="admin-view-container">
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            padding: "0.75rem 1.25rem",
            borderRadius: "10px",
            background: "#ecfdf5",
            color: "#065f46",
            border: "1px solid #a7f3d0",
            fontWeight: 600,
            fontSize: "0.88rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
          >
            ✕
          </button>
        </div>
      )}

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

      {/* Filter and Search Bar */}
      <div className="admin-view-actions" style={{ marginBottom: "1rem" }}>
        <div className="admin-search-input">
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by team, tournament, or captain..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          className="admin-status-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as any);
            setCurrentPage(1);
          }}
          style={{ padding: "0.55rem 0.85rem", height: "40px" }}
        >
          <option value="pending">⏳ Pending Review Only ({pendingCount})</option>
          <option value="approved">✔ Approved Teams</option>
          <option value="rejected">✖ Rejected Entries</option>
          <option value="all">All Registrations ({registrations.length})</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="admin-data-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: "180px" }}>Team & Sport</th>
                <th style={{ minWidth: "200px" }}>Target Tournament</th>
                <th style={{ minWidth: "180px" }}>Captain & Contact</th>
                <th>Roster & Fee</th>
                <th>Status</th>
                <th style={{ textAlign: "right", minWidth: "140px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Loading registration applications...</span>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    No registrations found matching the selected filter.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => {
                  const isPending = item.status === "pending";
                  const isApproved = item.status === "approved";

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <span style={{ fontSize: "1.2rem" }}>🏆</span>
                          <div>
                            <span style={{ fontWeight: 700, color: "#0f172a", display: "block" }}>
                              {item.teamName}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                              {item.sportName} &bull; Reg: {item.appliedAt ? new Date(item.appliedAt).toLocaleDateString() : "Recent"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <Trophy size={13} color="#d97706" />
                          <span style={{ fontWeight: 600, color: "#334155" }}>
                            {item.tournamentName}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: "flex", flexDirection: "column", fontSize: "0.82rem" }}>
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
                        <div style={{ display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
                          {isPending ? (
                            <>
                              <button
                                disabled={actionLoadingId === item.id}
                                onClick={() => handleApprove(item.id, item.teamName)}
                                style={{
                                  padding: "0.45rem 0.75rem",
                                  background: "#059669",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontSize: "0.8rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                }}
                                title="Approve registration"
                              >
                                <CheckCircle2 size={14} />
                                <span>Approve</span>
                              </button>

                              <button
                                disabled={actionLoadingId === item.id}
                                onClick={() => handleReject(item.id, item.teamName)}
                                style={{
                                  padding: "0.45rem 0.65rem",
                                  background: "#ffffff",
                                  color: "#dc2626",
                                  border: "1px solid #fca5a5",
                                  borderRadius: "6px",
                                  fontSize: "0.8rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                }}
                                title="Reject registration"
                              >
                                <XCircle size={14} />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleDeleteEntry(item.id, item.teamName)}
                              style={{
                                padding: "0.4rem 0.6rem",
                                background: "#fef2f2",
                                color: "#b91c1c",
                                border: "1px solid #fecaca",
                                borderRadius: "6px",
                                fontSize: "0.78rem",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                              title="Delete record"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            padding: "1rem 1.25rem",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            fontSize: "0.85rem",
            color: "#475569",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#0f172a",
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <span style={{ color: "#64748b" }}>
              Showing{" "}
              <strong style={{ color: "#0f172a" }}>
                {totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
              </strong>{" "}
              -{" "}
              <strong style={{ color: "#0f172a" }}>
                {Math.min(safeCurrentPage * pageSize, totalItems)}
              </strong>{" "}
              of <strong style={{ color: "#0f172a" }}>{totalItems}</strong> entries
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <button
              onClick={() => handlePageChange(1)}
              disabled={safeCurrentPage === 1}
              style={{
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                background: safeCurrentPage === 1 ? "#f1f5f9" : "#ffffff",
                color: safeCurrentPage === 1 ? "#94a3b8" : "#334155",
                cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
              }}
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              style={{
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                background: safeCurrentPage === 1 ? "#f1f5f9" : "#ffffff",
                color: safeCurrentPage === 1 ? "#94a3b8" : "#334155",
                cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
              }}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ padding: "4px 10px", fontWeight: 600, color: "#0f172a" }}>
              Page {safeCurrentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              style={{
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                background: safeCurrentPage === totalPages ? "#f1f5f9" : "#ffffff",
                color: safeCurrentPage === totalPages ? "#94a3b8" : "#334155",
                cursor: safeCurrentPage === totalPages ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
              }}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={safeCurrentPage === totalPages}
              style={{
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                background: safeCurrentPage === totalPages ? "#f1f5f9" : "#ffffff",
                color: safeCurrentPage === totalPages ? "#94a3b8" : "#334155",
                cursor: safeCurrentPage === totalPages ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
              }}
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
