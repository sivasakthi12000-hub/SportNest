import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  status: "success" | "warning" | "error";
  ipAddress: string;
}

export const AdminAuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [toast, setToast] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit-logs");
      if (res.ok) {
        const data = await res.json();
        if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs);
          return;
        }
      }
      setLogs([]);
    } catch (e) {
      console.warn("Notice fetching audit logs:", e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Delete audit log event #${id}?`)) return;
    try {
      const res = await fetch(`/api/admin/audit-logs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setToast(`Log entry #${id} deleted.`);
        fetchLogs();
      }
    } catch (err: any) {
      console.warn("Delete log error:", err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all historical audit logs? This action is permanent.")) {
      return;
    }
    try {
      const res = await fetch("/api/admin/audit-logs", { method: "DELETE" });
      if (res.ok) {
        setToast("All audit logs cleared.");
        fetchLogs();
      }
    } catch (err) {
      console.warn("Clear logs error:", err);
    }
  };

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        !search.trim() ||
        l.actor.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.target.toLowerCase().includes(search.toLowerCase()) ||
        l.id.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "all" ? true : l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [logs, search, statusFilter]);

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

  return (
    <div className="admin-view-container">
      {toast && (
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
          <span>{toast}</span>
          <button
            onClick={() => setToast(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h1>Administrative Audit & Event Log</h1>
            <span
              style={{
                background: "#fef3c7",
                color: "#b45309",
                fontSize: "0.8rem",
                fontWeight: 800,
                padding: "0.2rem 0.65rem",
                borderRadius: "999px",
                border: "1px solid #fde68a",
              }}
            >
              👑 Super Admin Only
            </span>
          </div>
          <p>
            Immutable chronological trace of user authorizations, squad approvals, roster mutations, and security events.
          </p>
        </div>

        <div className="admin-view-actions">
          <button onClick={fetchLogs} className="admin-btn-secondary" title="Reload audit trail">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          {logs.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                padding: "0.55rem 0.85rem",
                borderRadius: "8px",
                border: "1px solid #fecaca",
                background: "#fef2f2",
                color: "#b91c1c",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
              title="Clear all logs"
            >
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      <div className="admin-view-actions" style={{ marginBottom: "1.25rem" }}>
        <div className="admin-search-input">
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search actor, action, target, or ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          className="admin-status-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={{ padding: "0.55rem 0.85rem", height: "40px" }}
        >
          <option value="all">All Outcomes ({logs.length})</option>
          <option value="success">✔ Success Events</option>
          <option value="warning">⚠️ Warnings</option>
          <option value="error">❌ Errors</option>
        </select>
      </div>

      <div className="admin-data-card" style={{ padding: "0", overflow: "hidden" }}>
        <div className="dash-table-wrap">
          <table className="dash-trans-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Actor</th>
                <th>Action & Target</th>
                <th>Timestamp</th>
                <th>IP / Origin</th>
                <th>Outcome</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Loading audit trail...</span>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    No audit log events match your filter.
                  </td>
                </tr>
              ) : (
                paginated.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#475569" }}>
                        {log.id}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>{log.actor}</span>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, color: "#1e293b", display: "block" }}>
                          {log.action}
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          {log.target}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: "#64748b", fontSize: "0.85rem" }}>
                      {log.timestamp}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#475569" }}>
                      {log.ipAddress}
                    </td>
                    <td>
                      <span
                        className={`dash-status-pill ${
                          log.status === "success"
                            ? "success"
                            : log.status === "warning"
                            ? "disputed"
                            : "live"
                        }`}
                      >
                        {log.status === "success" ? "✔ Success" : log.status === "warning" ? "⚠️ Warning" : "❌ Error"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="admin-btn-icon"
                        title="Delete log entry"
                        style={{
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          color: "#b91c1c",
                          padding: "5px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
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
              of <strong style={{ color: "#0f172a" }}>{totalItems}</strong> events
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
