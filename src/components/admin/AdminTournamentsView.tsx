import React, { useState } from "react";
import { Plus, Search, Filter, Trash2, ExternalLink, RefreshCw, Trophy, MapPin, Calendar, Users } from "lucide-react";
import { Tournament, Sport, updateTournament, deleteTournament } from "../../services/dataService";

interface AdminTournamentsViewProps {
  tournaments: Tournament[];
  sports: Sport[];
  formatMoney: (amount: number) => string;
  onRefresh: () => void;
  onOpenCreate: () => void;
  onViewTeams?: (tournamentId: number) => void;
}

export const AdminTournamentsView: React.FC<AdminTournamentsViewProps> = ({
  tournaments,
  sports,
  formatMoney,
  onRefresh,
  onOpenCreate,
  onViewTeams,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleStatusChange = async (tournamentId: number, newStatus: string) => {
    setUpdatingId(tournamentId);
    try {
      const res = await updateTournament(tournamentId, { status: newStatus });
      if (res.success) {
        showToast("Tournament status updated successfully in Supabase!", "success");
        onRefresh();
      } else {
        showToast(res.error || "Failed to update status", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Update error", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (tournamentId: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete tournament "${name}" from Supabase? All registered teams will also be removed.`)) {
      return;
    }
    setDeletingId(tournamentId);
    try {
      const res = await deleteTournament(tournamentId);
      if (res.success) {
        showToast(`Tournament "${name}" deleted from database.`, "success");
        onRefresh();
      } else {
        showToast(res.error || "Failed to delete tournament", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Delete error", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = tournaments.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const sportName = sports.find((s) => s.id === t.sportId)?.name || "";
    return (
      t.name.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q) ||
      t.groundName.toLowerCase().includes(q) ||
      sportName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-view-container">
      {/* Toast Alert */}
      {message && (
        <div
          style={{
            padding: "0.75rem 1.25rem",
            borderRadius: "10px",
            background: message.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: message.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${message.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            fontWeight: 600,
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Tournament Operations</h1>
          <p>
            Manage active schedules, prize pools, and live match statuses connected directly to Supabase.
          </p>
        </div>

        <div className="admin-view-actions">
          <div className="admin-search-input">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="admin-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "0.55rem 0.85rem", height: "40px" }}
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live Now</option>
            <option value="completed">Completed</option>
          </select>

          <button onClick={onRefresh} className="admin-btn-secondary" title="Refresh from Supabase">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          <button onClick={onOpenCreate} className="admin-btn-primary">
            <Plus size={16} />
            <span>New Tournament</span>
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ background: "#ffffff", padding: "0.75rem 1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
          Total Listed: <strong>{tournaments.length}</strong>
        </div>
        <div style={{ background: "#ffffff", padding: "0.75rem 1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
          Upcoming: <strong>{tournaments.filter((t) => t.status === "upcoming").length}</strong>
        </div>
        <div style={{ background: "#ffffff", padding: "0.75rem 1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
          Live Matches: <strong style={{ color: "#dc2626" }}>{tournaments.filter((t) => t.status === "live").length}</strong>
        </div>
      </div>

      {/* Tournaments Table */}
      <div className="admin-data-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tournament & Venue</th>
                <th>Sport</th>
                <th>Date & Schedule</th>
                <th>Prize / Fee</th>
                <th>Teams</th>
                <th>Status (Supabase)</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    No tournaments found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const sport = sports.find((s) => s.id === t.sportId);
                  return (
                    <tr key={t.id}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                          <span style={{ fontWeight: 700, color: "#0f172a" }}>{t.name}</span>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <MapPin size={12} color="#059669" />
                            {t.groundName ? `${t.groundName}, ` : ""}{t.location}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="admin-badge-category">
                          ⚽ {sport?.name || `Sport #${t.sportId}`}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: "0.85rem", color: "#334155", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <Calendar size={13} color="#64748b" />
                          <span>{t.date || "TBD"}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: "0.85rem" }}>
                          <span style={{ fontWeight: 700, color: "#059669" }}>
                            {formatMoney(t.prizeAmount)}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>
                            Fee: {formatMoney(t.entryFee)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <button
                          onClick={() => onViewTeams && onViewTeams(t.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            color: "#0284c7",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                          title="View registered teams in this tournament"
                        >
                          <Users size={14} />
                          <span>{t.registeredTeams} / {t.maxTeams}</span>
                        </button>
                      </td>

                      <td>
                        <select
                          className="admin-status-select"
                          value={t.status}
                          disabled={updatingId === t.id}
                          onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="live">Live Now</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                          <a
                            href={`/tournament/${t.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-btn-icon"
                            title="Preview Public Tournament Page"
                          >
                            <ExternalLink size={14} />
                          </a>

                          <button
                            onClick={() => handleDelete(t.id, t.name)}
                            disabled={deletingId === t.id}
                            className="admin-btn-icon-danger"
                            title="Delete Tournament from Database"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
