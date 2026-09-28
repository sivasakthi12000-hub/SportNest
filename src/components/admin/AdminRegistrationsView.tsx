import React, { useState, useMemo } from "react";
import {
  CreditCard,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Tournament } from "../../services/dataService";

interface AdminRegistrationsViewProps {
  tournaments: Tournament[];
  formatMoney: (amount: number) => string;
  onRefresh: () => void;
  onViewTeams: (tournamentId: number) => void;
}

export const AdminRegistrationsView: React.FC<AdminRegistrationsViewProps> = ({
  tournaments,
  formatMoney,
  onRefresh,
  onViewTeams,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "full">("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const totalRegistered = tournaments.reduce((sum, t) => sum + (t.registeredTeams || 0), 0);
  const totalCapacity = tournaments.reduce((sum, t) => sum + (t.maxTeams || 16), 0);
  const totalFeesCollected = tournaments.reduce((sum, t) => sum + ((t.registeredTeams || 0) * (t.entryFee || 0)), 0);
  const totalPotentialFees = tournaments.reduce((sum, t) => sum + ((t.maxTeams || 16) * (t.entryFee || 0)), 0);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const fillPercent = Math.min(100, Math.round(((t.registeredTeams || 0) / (t.maxTeams || 1)) * 100));
      const isFull = fillPercent >= 100;

      if (statusFilter === "open" && isFull) return false;
      if (statusFilter === "full" && !isFull) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        (t.location && t.location.toLowerCase().includes(q))
      );
    });
  }, [tournaments, searchTerm, statusFilter]);

  const totalItems = filteredTournaments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginated = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredTournaments.slice(startIndex, startIndex + pageSize);
  }, [filteredTournaments, safeCurrentPage, pageSize]);

  const handlePageChange = (p: number) => {
    setCurrentPage(Math.min(Math.max(1, p), totalPages));
  };

  return (
    <div className="admin-view-container">
      {/* Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Registration Audits & Entry Fees</h1>
          <p>
            Track team entrance payments, team slot quotas, and registration deadlines in Supabase.
          </p>
        </div>

        <div className="admin-view-actions">
          <button onClick={onRefresh} className="admin-btn-secondary" title="Reload from database">
            <RefreshCw size={15} />
            <span>Reload Status</span>
          </button>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
        <div className="admin-data-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#ecfdf5",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Total Fees Collected</span>
            <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
              {formatMoney(totalFeesCollected)}
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#059669" }}>
              Target: {formatMoney(totalPotentialFees)}
            </span>
          </div>
        </div>

        <div className="admin-data-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#e0f2fe",
              color: "#0284c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Overall Registration Quota</span>
            <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
              {totalRegistered} / {totalCapacity} Teams
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#0284c7" }}>
              {Math.round((totalRegistered / (totalCapacity || 1)) * 100)}% Slots Filled
            </span>
          </div>
        </div>

        <div className="admin-data-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#fef3c7",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CreditCard size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Active Tournaments Open</span>
            <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
              {tournaments.filter((t) => t.status === "upcoming" || t.status === "live").length}
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#d97706" }}>Accepting Roster Submissions</span>
          </div>
        </div>
      </div>

      {/* Breakdown per Tournament */}
      <div className="admin-data-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.25rem 0.75rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Tournament Registration Breakdown
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div className="admin-search-input">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search tournament..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
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
              style={{ padding: "0.5rem 0.8rem", height: "38px" }}
            >
              <option value="all">All Quotas ({tournaments.length})</option>
              <option value="open">Open Spots Only</option>
              <option value="full">100% Full Quota</option>
            </select>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: "200px" }}>Tournament</th>
                <th>Entry Fee</th>
                <th style={{ minWidth: "180px" }}>Slot Progress</th>
                <th>Fee Revenue</th>
                <th>Deadline</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Roster</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    No tournaments match the active filter.
                  </td>
                </tr>
              ) : (
                paginated.map((t) => {
                  const fillPercent = Math.min(
                    100,
                    Math.round(((t.registeredTeams || 0) / (t.maxTeams || 1)) * 100)
                  );
                  const revenue = (t.registeredTeams || 0) * (t.entryFee || 0);

                  return (
                    <tr key={t.id}>
                      <td>
                        <span style={{ fontWeight: 700, color: "#0f172a", display: "block" }}>{t.name}</span>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {t.location}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600, color: "#334155" }}>
                          {formatMoney(t.entryFee)}
                        </span>
                      </td>

                      <td style={{ minWidth: "160px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                          <span>{t.registeredTeams} / {t.maxTeams} Teams</span>
                          <span>{fillPercent}%</span>
                        </div>
                        <div style={{ width: "100%", height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${fillPercent}%`,
                              height: "100%",
                              background: fillPercent >= 100 ? "#ef4444" : "#059669",
                              borderRadius: "999px",
                            }}
                          />
                        </div>
                      </td>

                      <td>
                        <span style={{ fontWeight: 700, color: "#059669" }}>
                          {formatMoney(revenue)}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {t.lastRegistrationDate || t.date || "Ongoing"}
                        </span>
                      </td>

                      <td>
                        {fillPercent >= 100 ? (
                          <span style={{ color: "#dc2626", background: "#fef2f2", padding: "0.2rem 0.5rem", borderRadius: "999px", fontWeight: 700, fontSize: "0.78rem" }}>
                            Full
                          </span>
                        ) : (
                          <span style={{ color: "#059669", background: "#ecfdf5", padding: "0.2rem 0.5rem", borderRadius: "999px", fontWeight: 600, fontSize: "0.78rem" }}>
                            Open
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => onViewTeams(t.id)}
                          className="admin-btn-secondary"
                          style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", cursor: "pointer" }}
                        >
                          View Teams
                        </button>
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
              of <strong style={{ color: "#0f172a" }}>{totalItems}</strong> tournaments
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
