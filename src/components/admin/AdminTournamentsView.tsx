import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  RefreshCw,
  Trophy,
  MapPin,
  Calendar,
  Users,
  Edit2,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  BookOpen,
} from "lucide-react";
import { Tournament, Sport, updateTournament, deleteTournament } from "../../services/dataService";
import { WysiwygEditor } from "../WysiwygEditor";

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

  // Edit Modal State
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [editName, setEditName] = useState("");
  const [editSportId, setEditSportId] = useState<number>(1);
  const [editLocation, setEditLocation] = useState("");
  const [editGroundName, setEditGroundName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editLastRegDate, setEditLastRegDate] = useState("");
  const [editEntryFee, setEditEntryFee] = useState<number>(0);
  const [editPrizeAmount, setEditPrizeAmount] = useState<number>(0);
  const [editMaxTeams, setEditMaxTeams] = useState<number>(16);
  const [editRules, setEditRules] = useState<string>("");
  const [editMapUrl, setEditMapUrl] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const showToast = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleOpenEdit = (t: Tournament) => {
    setEditingTournament(t);
    setEditName(t.name || "");
    setEditSportId(t.sportId || 1);
    setEditLocation(t.location || "");
    setEditGroundName(t.groundName || "");
    setEditAddress(t.address || "");
    setEditPincode(t.pincode || "");
    setEditDate(t.date || "");
    setEditLastRegDate(t.lastRegistrationDate || "");
    setEditEntryFee(t.entryFee || 0);
    setEditPrizeAmount(t.prizeAmount || 0);
    setEditMaxTeams(t.maxTeams || 16);
    setEditRules(t.rules || "");
    setEditMapUrl(t.mapUrl || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTournament) return;
    if (!editName.trim()) {
      showToast("Tournament name is required", "error");
      return;
    }

    setSavingEdit(true);
    try {
      const res = await updateTournament(editingTournament.id, {
        name: editName.trim(),
        sportId: Number(editSportId),
        location: editLocation.trim(),
        groundName: editGroundName.trim(),
        address: editAddress.trim(),
        pincode: editPincode.trim(),
        date: editDate,
        lastRegistrationDate: editLastRegDate,
        entryFee: Number(editEntryFee),
        prizeAmount: Number(editPrizeAmount),
        maxTeams: Number(editMaxTeams),
        rules: editRules.trim(),
        mapUrl: editMapUrl.trim(),
      });

      if (res.success) {
        showToast(`Tournament "${editName}" updated successfully in Supabase!`, "success");
        setEditingTournament(null);
        onRefresh();
      } else {
        showToast(res.error || "Failed to update tournament", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Update error", "error");
    } finally {
      setSavingEdit(false);
    }
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

  const filtered = useMemo(() => {
    return tournaments.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const sportName = sports.find((s) => s.id === t.sportId)?.name || "";
      return (
        t.name.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        (t.groundName && t.groundName.toLowerCase().includes(q)) ||
        (t.address && t.address.toLowerCase().includes(q)) ||
        (t.pincode && t.pincode.toLowerCase().includes(q)) ||
        (t.createdBy && t.createdBy.toLowerCase().includes(q)) ||
        sportName.toLowerCase().includes(q)
      );
    });
  }, [tournaments, statusFilter, searchTerm, sports]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Sliced paginated tournaments
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filtered.length);
  const paginatedTournaments = filtered.slice(startIndex, endIndex);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (val: number) => {
    setPageSize(val);
    setCurrentPage(1);
  };

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
            Create, configure, schedule, and manage sanctioned tournaments directly with persistent Supabase synchronisation.
          </p>
        </div>

        <div className="admin-view-actions">
          <button
            onClick={onRefresh}
            className="admin-btn-secondary"
            title="Reload live tournaments from Supabase"
          >
            <RefreshCw size={15} />
            <span>Sync Supabase</span>
          </button>

          <button onClick={onOpenCreate} className="admin-btn-primary">
            <Plus size={16} />
            <span>Create Tournament</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="admin-filter-toolbar">
        <div className="admin-search-wrapper" style={{ flex: 1, minWidth: "260px" }}>
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by tournament name, ground, address, city, pincode, organizer..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Filter size={16} color="#64748b" />
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            style={{ minWidth: "140px" }}
          >
            <option value="all">All Statuses ({tournaments.length})</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live Now</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Summary Chips */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ background: "#ffffff", padding: "0.65rem 1.15rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
          Total Listed: <strong>{tournaments.length}</strong>
        </div>
        <div style={{ background: "#ffffff", padding: "0.65rem 1.15rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
          Filtered: <strong>{filtered.length}</strong>
        </div>
        <div style={{ background: "#ffffff", padding: "0.65rem 1.15rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
          Upcoming: <strong>{tournaments.filter((t) => t.status === "upcoming").length}</strong>
        </div>
        <div style={{ background: "#ffffff", padding: "0.65rem 1.15rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
          Live Matches: <strong style={{ color: "#dc2626" }}>{tournaments.filter((t) => t.status === "live").length}</strong>
        </div>
      </div>

      {/* Tournaments Table */}
      <div className="admin-data-card" style={{ padding: 0, overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <div className="admin-table-wrapper" style={{ overflowX: "auto" }}>
          <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", width: "32%", minWidth: "220px" }}>Tournament & Venue</th>
                <th style={{ padding: "12px 14px", textAlign: "left", width: "12%", minWidth: "120px" }}>Sport</th>
                <th style={{ padding: "12px 14px", textAlign: "left", width: "14%", minWidth: "130px" }}>Date & Schedule</th>
                <th style={{ padding: "12px 14px", textAlign: "left", width: "12%", minWidth: "110px" }}>Prize / Fee</th>
                <th style={{ padding: "12px 14px", textAlign: "left", width: "10%", minWidth: "100px" }}>Teams</th>
                <th style={{ padding: "12px 14px", textAlign: "left", width: "10%", minWidth: "110px" }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "right", width: "10%", minWidth: "120px" }}>Actions</th>
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
                paginatedTournaments.map((t) => {
                  const sport = sports.find((s) => s.id === t.sportId);
                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, color: "#0f172a" }}>{t.name}</span>
                            {t.createdBy && (
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  background: "#ecfdf5",
                                  border: "1px solid #a7f3d0",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  color: "#065f46",
                                  fontWeight: 600,
                                }}
                              >
                                by {t.createdBy}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <MapPin size={12} color="#059669" />
                            {t.groundName ? `${t.groundName}, ` : ""}
                            {t.address ? `${t.address}, ` : ""}
                            {t.location}
                            {t.pincode ? ` (${t.pincode})` : ""}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <span className="admin-badge-category">
                          ⚽ {sport?.name || `Sport #${t.sportId}`}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "0.85rem", color: "#334155", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <Calendar size={13} color="#64748b" />
                          <span>{t.date || "TBD"}</span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                          <span style={{ fontWeight: 700, color: "#059669", fontSize: "0.88rem" }}>
                            {formatMoney(t.prizeAmount)}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            Fee: {formatMoney(t.entryFee)}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <button
                          type="button"
                          onClick={() => onViewTeams && onViewTeams(t.id)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            fontSize: "0.85rem",
                            color: "#0284c7",
                            fontWeight: 600,
                          }}
                          title="Click to view & manage teams"
                        >
                          <Users size={14} />
                          <span>{t.registeredTeams} / {t.maxTeams}</span>
                        </button>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
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

                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(t)}
                            className="admin-btn-icon"
                            title="Edit Tournament Details & Specifications"
                            style={{
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              color: "#15803d",
                              padding: "6px",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            <Edit2 size={14} />
                          </button>

                          <a
                            href={`/tournament/${t.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-btn-icon"
                            title="Preview Public Tournament Page"
                            style={{
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              color: "#475569",
                              padding: "6px",
                              borderRadius: "6px",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            <ExternalLink size={14} />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDelete(t.id, t.name)}
                            disabled={deletingId === t.id}
                            className="admin-btn-icon"
                            title="Delete Tournament"
                            style={{
                              background: "#fef2f2",
                              border: "1px solid #fecaca",
                              color: "#b91c1c",
                              padding: "6px",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
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
          {/* Rows per page selector & Total Items */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div>
              Showing{" "}
              <strong>
                {filtered.length === 0 ? 0 : startIndex + 1}–{endIndex}
              </strong>{" "}
              of <strong>{filtered.length}</strong> tournaments
            </div>
          </div>

          {/* Navigation Controls */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                title="First Page"
                style={paginationBtnStyle(safeCurrentPage === 1)}
              >
                <ChevronsLeft size={16} />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safeCurrentPage === 1}
                title="Previous Page"
                style={paginationBtnStyle(safeCurrentPage === 1)}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  return (
                    p === 1 ||
                    p === totalPages ||
                    (p >= safeCurrentPage - 1 && p <= safeCurrentPage + 1)
                  );
                })
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  return (
                    <React.Fragment key={p}>
                      {prev && p - prev > 1 && (
                        <span style={{ padding: "0 4px", color: "#94a3b8" }}>...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        style={{
                          minWidth: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          border: p === safeCurrentPage ? "1px solid #059669" : "1px solid #cbd5e1",
                          background: p === safeCurrentPage ? "#059669" : "#ffffff",
                          color: p === safeCurrentPage ? "#ffffff" : "#334155",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safeCurrentPage >= totalPages}
                title="Next Page"
                style={paginationBtnStyle(safeCurrentPage >= totalPages)}
              >
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage >= totalPages}
                title="Last Page"
                style={paginationBtnStyle(safeCurrentPage >= totalPages)}
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Tournament Modal (with WYSIWYG Kitchen Sink for Discipline Rules) */}
      {editingTournament && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "850px",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
                borderTopLeftRadius: "14px",
                borderTopRightRadius: "14px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
                  Edit Tournament & Discipline Rules
                </h2>
                <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                  Updating Tournament #{editingTournament.id} ({editingTournament.name})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingTournament(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Row 1: Name & Sport */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Tournament Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={modalInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Sport Discipline
                  </label>
                  <select
                    value={editSportId}
                    onChange={(e) => setEditSportId(Number(e.target.value))}
                    style={modalInputStyle}
                  >
                    {sports.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Venue, City, Address, Pincode */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Ground / Arena Name
                  </label>
                  <input
                    type="text"
                    value={editGroundName}
                    onChange={(e) => setEditGroundName(e.target.value)}
                    style={modalInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    style={modalInputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Full Venue Address
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    style={modalInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                    style={modalInputStyle}
                  />
                </div>
              </div>

              {/* Row 3: Schedule Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Kickoff Date
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    style={modalInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Last Registration Deadline
                  </label>
                  <input
                    type="date"
                    value={editLastRegDate}
                    onChange={(e) => setEditLastRegDate(e.target.value)}
                    style={modalInputStyle}
                  />
                </div>
              </div>

              {/* Row 4: Financials & Capacity */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Prize Pool (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editPrizeAmount}
                    onChange={(e) => setEditPrizeAmount(Number(e.target.value))}
                    style={modalInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Entry Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editEntryFee}
                    onChange={(e) => setEditEntryFee(Number(e.target.value))}
                    style={modalInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Max Teams Capacity
                  </label>
                  <input
                    type="number"
                    min={2}
                    value={editMaxTeams}
                    onChange={(e) => setEditMaxTeams(Number(e.target.value))}
                    style={modalInputStyle}
                  />
                </div>
              </div>

              {/* Row 5: Map URL */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  Google Map URL
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={editMapUrl}
                  onChange={(e) => setEditMapUrl(e.target.value)}
                  style={modalInputStyle}
                />
              </div>

              {/* Row 6: WYSIWYG KITCHEN SINK EDITOR FOR DISCIPLINE RULES */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.4rem" }}>
                  <BookOpen size={16} color="#059669" />
                  <span>Discipline Specifications & Rules (WYSIWYG Kitchen Sink)</span>
                </label>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.78rem", color: "#64748b" }}>
                  Format tournament regulations, match duration, court dimensions, ball weights, equipment, and disqualification penalties with rich typography.
                </p>
                <WysiwygEditor
                  id="edit-tournament-rules"
                  value={editRules}
                  onChange={setEditRules}
                  placeholder="Enter sanctioned match rules, time limits, gear specifications, and guidelines..."
                  minHeight="180px"
                />
              </div>

              {/* Actions Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingTournament(null)}
                  style={{
                    padding: "0.55rem 1.25rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{
                    padding: "0.55rem 1.5rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "#059669",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: savingEdit ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <Save size={15} />
                  <span>{savingEdit ? "Saving in Supabase..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const modalInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: "0.88rem",
  boxSizing: "border-box",
  outline: "none",
};

const paginationBtnStyle = (disabled: boolean): React.CSSProperties => ({
  width: "32px",
  height: "32px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  background: disabled ? "#f1f5f9" : "#ffffff",
  color: disabled ? "#94a3b8" : "#334155",
  cursor: disabled ? "not-allowed" : "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.15s ease",
});

export default AdminTournamentsView;
