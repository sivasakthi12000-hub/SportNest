import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  MapPin,
  Layers,
  Trash2,
  Trophy,
  ExternalLink,
  Edit3,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle2,
  Tag,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Table as TableIcon,
  LayoutGrid,
  BookOpen,
} from "lucide-react";
import {
  Sport,
  Tournament,
  createSport,
  deleteSport,
  updateSport,
} from "../../services/dataService";
import { WysiwygEditor } from "../WysiwygEditor";

interface AdminSportsViewProps {
  sports: Sport[];
  tournaments?: Tournament[];
  onRefresh: () => void;
  userRole?: string;
  relevantSportIds?: Set<number>;
  onOpenCreateTournament?: (defaultSportName?: string) => void;
  onViewTournament?: (tournamentId: number) => void;
}

export const AdminSportsView: React.FC<AdminSportsViewProps> = ({
  sports,
  tournaments = [],
  onRefresh,
  userRole,
  relevantSportIds,
  onOpenCreateTournament,
  onViewTournament,
}) => {
  // Local reactive copy of sports for instantaneous UI feedback
  const [localSports, setLocalSports] = useState<Sport[]>(sports);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [sportToDelete, setSportToDelete] = useState<Sport | null>(null);
  const [activeTab, setActiveTab] = useState<"tournaments" | "details">("tournaments");
  const [newlyAddedSportId, setNewlyAddedSportId] = useState<number | null>(null);

  const [displayMode, setDisplayMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const hasMySports = !!(relevantSportIds && relevantSportIds.size > 0);
  const isOrganizer = userRole !== "superadmin";
  const [filterMode, setFilterMode] = useState<"my" | "all">(
    isOrganizer && hasMySports ? "my" : "all"
  );

  // Sync prop changes with local state
  useEffect(() => {
    setLocalSports(sports);
  }, [sports]);

  // New sport form state
  const [name, setName] = useState("");
  const [groundName, setGroundName] = useState("");
  const [surface, setSurface] = useState("");
  const [format, setFormat] = useState("");
  const [category, setCategory] = useState("");
  const [rules, setRules] = useState("");
  const [description, setDescription] = useState("");
  const [accentColor, setAccentColor] = useState("#10b981");
  const [submitting, setSubmitting] = useState(false);

  // Edit sport form state
  const [editGroundName, setEditGroundName] = useState("");
  const [editSurface, setEditSurface] = useState("");
  const [editFormat, setEditFormat] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editRules, setEditRules] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAccentColor, setEditAccentColor] = useState("#10b981");
  const [updatingSport, setUpdatingSport] = useState(false);

  const showToast = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Open sport details modal
  const handleOpenSportDetails = (sport: Sport, initialTab: "tournaments" | "details" = "tournaments") => {
    setSelectedSport(sport);
    setActiveTab(initialTab);
    setEditGroundName(sport.groundName || "");
    setEditSurface(sport.surface || "");
    setEditFormat(sport.format || "");
    setEditCategory(sport.category || "");
    setEditRules(sport.rules || "");
    setEditDescription(sport.description || "");
    setEditAccentColor(sport.accentColor || "#10b981");
  };

  // Handle Create Sport
  const handleCreateSport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Sport name is required", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createSport({
        name: name.trim(),
        groundName: groundName.trim() || undefined,
        surface: surface.trim() || undefined,
        format: format.trim() || undefined,
        rules: rules.trim() || undefined,
        description: description.trim() || undefined,
        accentColor: accentColor || "#10b981",
      });

      if (res.success && res.data) {
        const addedSport = res.data;
        // Optimistically prepend to local sports so user sees it instantly
        setLocalSports((prev) => {
          const exists = prev.some((s) => s.id === addedSport.id || s.name.toLowerCase() === addedSport.name.toLowerCase());
          if (exists) {
            return prev.map((s) => (s.id === addedSport.id || s.name.toLowerCase() === addedSport.name.toLowerCase() ? addedSport : s));
          }
          return [addedSport, ...prev];
        });
        setNewlyAddedSportId(addedSport.id);
        setTimeout(() => setNewlyAddedSportId(null), 6000);

        showToast(`Sport "${name.trim()}" successfully added to system!`, "success");
        setName("");
        setGroundName("");
        setSurface("");
        setFormat("");
        setRules("");
        setDescription("");
        setShowAddModal(false);
        onRefresh();
      } else {
        showToast(res.error || "Failed to create sport", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Create error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Update Sport Details
  const handleSaveSportDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSport) return;
    setUpdatingSport(true);

    try {
      const updates = {
        groundName: editGroundName.trim() || undefined,
        surface: editSurface.trim() || undefined,
        format: editFormat.trim() || undefined,
        rules: editRules.trim() || undefined,
        description: editDescription.trim() || undefined,
        accentColor: editAccentColor || "#10b981",
      };

      const res = await updateSport(selectedSport.id, updates);
      if (res.success) {
        const updated = { ...selectedSport, ...updates };
        setSelectedSport(updated);
        setLocalSports((prev) => prev.map((s) => (s.id === selectedSport.id ? updated : s)));
        showToast(`Specifications updated for ${selectedSport.name}!`, "success");
        onRefresh();
      } else {
        showToast(res.error || "Failed to update specifications", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Error updating sport", "error");
    } finally {
      setUpdatingSport(false);
    }
  };

  // Handle Delete Sport
  const confirmDeleteSport = async () => {
    if (!sportToDelete) return;
    const target = sportToDelete;
    setSportToDelete(null);

    // Optimistically remove from view
    setLocalSports((prev) =>
      prev.filter((s) => s.id !== target.id && s.name.toLowerCase() !== target.name.toLowerCase())
    );

    try {
      const res = await deleteSport(target.id, target.name);
      if (res.success) {
        showToast(`Sport "${target.name}" removed from system.`, "success");
        if (selectedSport && selectedSport.id === target.id) {
          setSelectedSport(null);
        }
        onRefresh();
      } else {
        showToast(res.error || "Failed to remove sport", "error");
        // Revert by re-fetching
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || "Error deleting sport", "error");
      onRefresh();
    }
  };

  // Filter sports
  const filtered = localSports.filter((s) => {
    if (filterMode === "my" && relevantSportIds && relevantSportIds.size > 0) {
      if (!relevantSportIds.has(s.id)) return false;
    }
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.groundName && s.groundName.toLowerCase().includes(q)) ||
      (s.format && s.format.toLowerCase().includes(q))
    );
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filtered.length);
  const paginatedSports = filtered.slice(startIndex, endIndex);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (val: number) => {
    setPageSize(val);
    setCurrentPage(1);
  };

  // Tournaments for currently selected sport
  const getSportTournaments = (sport: Sport) => {
    return tournaments.filter(
      (t) =>
        (t.sport && t.sport.toLowerCase() === sport.name.toLowerCase()) ||
        t.sportId === sport.id
    );
  };

  return (
    <div className="admin-view-container" style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
      {/* Notifications */}
      {message && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: "10px",
            background: message.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: message.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${message.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            fontWeight: 600,
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {message.type === "success" ? <CheckCircle2 size={18} color="#059669" /> : <AlertCircle size={18} color="#dc2626" />}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#64748b" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div
        className="admin-view-header"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div className="admin-view-title-group" style={{ maxWidth: "600px" }}>
          <h1 style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.65rem)", margin: "0 0 0.35rem 0", fontWeight: 800 }}>
            Sports & Facilities Directory
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", lineHeight: 1.4 }}>
            Manage sanctioned disciplines, facilities, and competition rules. Click any sport to view tournaments or configure details.
          </p>
        </div>

        <div
          className="admin-view-actions"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "0.6rem",
            width: "auto",
          }}
        >
          <div
            className="admin-search-input"
            style={{
              display: "flex",
              alignItems: "center",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "0.45rem 0.75rem",
              minWidth: "200px",
              flex: "1 1 200px",
            }}
          >
            <Search size={16} color="#94a3b8" style={{ marginRight: "0.45rem", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search sports or grounds..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: "0.85rem",
                width: "100%",
                background: "transparent",
              }}
            />
          </div>

          <div style={{ display: "inline-flex", background: "#f1f5f9", borderRadius: "8px", padding: "3px" }}>
            <button
              type="button"
              onClick={() => setDisplayMode("table")}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "none",
                background: displayMode === "table" ? "#ffffff" : "transparent",
                color: displayMode === "table" ? "#0f172a" : "#64748b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.82rem",
                fontWeight: 700,
                boxShadow: displayMode === "table" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
            >
              <TableIcon size={14} />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode("grid")}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "none",
                background: displayMode === "grid" ? "#ffffff" : "transparent",
                color: displayMode === "grid" ? "#0f172a" : "#64748b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.82rem",
                fontWeight: 700,
                boxShadow: displayMode === "grid" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
            >
              <LayoutGrid size={14} />
              <span>Grid</span>
            </button>
          </div>

          <button
            onClick={onRefresh}
            className="admin-btn-secondary"
            title="Synchronize from Cloud Database"
            style={{ minHeight: "40px", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <RefreshCw size={15} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="admin-btn-primary"
            style={{
              minHeight: "40px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={16} />
            <span>Add Sport</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs for Organizer */}
      {hasMySports && isOrganizer && (
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setFilterMode("my")}
            className={`admin-filter-pill ${filterMode === "my" ? "active" : ""}`}
            style={{ minHeight: "36px", padding: "0.4rem 0.85rem", borderRadius: "9999px", fontSize: "0.82rem" }}
          >
            Assigned Disciplines ({relevantSportIds.size})
          </button>
          <button
            onClick={() => setFilterMode("all")}
            className={`admin-filter-pill ${filterMode === "all" ? "active" : ""}`}
            style={{ minHeight: "36px", padding: "0.4rem 0.85rem", borderRadius: "9999px", fontSize: "0.82rem" }}
          >
            All Sports Directory ({localSports.length})
          </button>
        </div>
      )}

      {/* Sports Grid */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "3rem 1.5rem",
            textAlign: "center",
            border: "1px dashed #cbd5e1",
          }}
        >
          <Trophy size={42} color="#94a3b8" style={{ margin: "0 auto 1rem auto" }} />
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#1e293b", fontSize: "1.15rem" }}>
            No sports disciplines match "{searchTerm}"
          </h3>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
            Add this sport discipline to make it available for sanctioned tournaments.
          </p>
          <button
            onClick={() => {
              setName(searchTerm);
              setShowAddModal(true);
            }}
            className="admin-btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} />
            <span>Add "{searchTerm}" Sport</span>
          </button>
        </div>
      ) : displayMode === "table" ? (
        <div className="admin-data-card" style={{ padding: 0, overflow: "hidden", border: "1px solid #e2e8f0" }}>
          <div className="admin-table-wrapper" style={{ overflowX: "auto" }}>
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "12px 14px", textAlign: "left", minWidth: "190px" }}>Discipline & Category</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", minWidth: "160px" }}>Default Arena / Ground</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", minWidth: "150px" }}>Surface & Format</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", minWidth: "220px" }}>Specifications & Rules</th>
                  <th style={{ padding: "12px 14px", textAlign: "center", minWidth: "110px" }}>Tournaments</th>
                  <th style={{ padding: "12px 14px", textAlign: "right", minWidth: "140px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSports.map((s) => {
                  const sportTourneys = getSportTournaments(s);
                  const isJustAdded = newlyAddedSportId === s.id;
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9", background: isJustAdded ? "#f0fdf4" : undefined }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <span
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              background: s.accentColor || "#10b981",
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem", display: "block" }}>
                              {s.name}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                              {s.category || "Arena Sport"} • ID #{s.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "0.85rem", color: "#334155", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <MapPin size={12} color="#059669" />
                          {s.groundName || "Official Arena"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "0.82rem", color: "#475569" }}>
                          <div style={{ fontWeight: 600, color: "#1e293b" }}>{s.format || "Standard Match"}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{s.surface || "Natural / Synthetic"}</div>
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#64748b",
                            maxHeight: "2.8em",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                          dangerouslySetInnerHTML={{ __html: s.rules || s.description || "Official regulations apply." }}
                        />
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            background: sportTourneys.length > 0 ? "#ecfdf5" : "#f1f5f9",
                            color: sportTourneys.length > 0 ? "#065f46" : "#64748b",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                          }}
                        >
                          {sportTourneys.length} Active
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                          <button
                            type="button"
                            onClick={() => handleOpenSportDetails(s, "details")}
                            className="admin-btn-icon"
                            title="Edit Discipline Specifications"
                            style={{
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              color: "#15803d",
                              padding: "6px",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            <Edit3 size={14} />
                          </button>

                          {onOpenCreateTournament && (
                            <button
                              type="button"
                              onClick={() => onOpenCreateTournament(s.name)}
                              className="admin-btn-icon"
                              title={`Host Tournament for ${s.name}`}
                              style={{
                                background: "#eff6ff",
                                border: "1px solid #bfdbfe",
                                color: "#1d4ed8",
                                padding: "6px",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              <Plus size={14} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSportToDelete(s)}
                            className="admin-btn-icon"
                            title="Delete Sport Discipline"
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
                })}
              </tbody>
            </table>
          </div>

          {/* Server-Side Pagination Footer for Table */}
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
                </select>
              </div>

              <div>
                Showing{" "}
                <strong>
                  {filtered.length === 0 ? 0 : startIndex + 1}–{endIndex}
                </strong>{" "}
                of <strong>{filtered.length}</strong> disciplines
              </div>
            </div>

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
                <span style={{ padding: "0 0.5rem", fontWeight: 700, color: "#0f172a" }}>
                  Page {safeCurrentPage} of {totalPages}
                </span>
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
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.15rem",
          }}
        >
          {filtered.map((s) => {
            const sportTourneys = getSportTournaments(s);
            const isJustAdded = newlyAddedSportId === s.id;

            return (
              <div
                key={s.id}
                className="admin-data-card"
                onClick={() => handleOpenSportDetails(s, "tournaments")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: isJustAdded
                    ? "2px solid #10b981"
                    : "1px solid #e2e8f0",
                  boxShadow: isJustAdded
                    ? "0 4px 16px rgba(16, 185, 129, 0.25)"
                    : "0 2px 6px rgba(0, 0, 0, 0.04)",
                  position: "relative",
                  borderRadius: "14px",
                  padding: "1.15rem",
                  background: "#fff",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = isJustAdded
                    ? "0 4px 16px rgba(16, 185, 129, 0.25)"
                    : "0 2px 6px rgba(0, 0, 0, 0.04)";
                }}
              >
                {/* Just added badge */}
                {isJustAdded && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-10px",
                      right: "12px",
                      background: "#10b981",
                      color: "#fff",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      padding: "0.2rem 0.6rem",
                      borderRadius: "9999px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Saved to Database</span>
                  </div>
                )}

                <div>
                  {/* Card Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "0.85rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "10px",
                          background: s.accentColor ? `${s.accentColor}18` : "#ecfdf5",
                          color: s.accentColor || "#059669",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "1.25rem",
                          flexShrink: 0,
                        }}
                      >
                        🏆
                      </div>
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "1.1rem",
                            fontWeight: 800,
                            color: "#0f172a",
                            lineHeight: 1.25,
                          }}
                        >
                          {s.name}
                        </h3>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          ID #{s.id}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span
                        style={{
                          padding: "0.2rem 0.55rem",
                          borderRadius: "9999px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          background: "#f1f5f9",
                          color: "#334155",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.format || "Standard"}
                      </span>

                      {/* Delete Button */}
                      <button
                        type="button"
                        title={`Delete ${s.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSportToDelete(s);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#94a3b8",
                          padding: "0.35rem",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "color 0.15s, background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#dc2626";
                          e.currentTarget.style.background = "#fee2e2";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#94a3b8";
                          e.currentTarget.style.background = "none";
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Card Meta */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.45rem",
                      fontSize: "0.82rem",
                      color: "#475569",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <MapPin size={14} color="#059669" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        Ground: <strong>{s.groundName || "Olympic Grade Arena"}</strong>
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Layers size={14} color="#0284c7" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        Surface: <strong>{s.surface || "Natural Turf / Synthetic"}</strong>
                      </span>
                    </div>

                    {s.rules && (
                      <p
                        style={{
                          margin: "0.35rem 0 0 0",
                          fontSize: "0.78rem",
                          color: "#64748b",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        "{s.rules}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Footer & Tournaments Count */}
                <div
                  style={{
                    marginTop: "1rem",
                    paddingTop: "0.85rem",
                    borderTop: "1px solid #f1f5f9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: sportTourneys.length > 0 ? "#2563eb" : "#94a3b8",
                      background: sportTourneys.length > 0 ? "#eff6ff" : "#f8fafc",
                      padding: "0.2rem 0.55rem",
                      borderRadius: "6px",
                    }}
                  >
                    <Trophy size={13} />
                    <span>
                      {sportTourneys.length === 0
                        ? "0 Tournaments"
                        : `${sportTourneys.length} Tournament${sportTourneys.length > 1 ? "s" : ""}`}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "#059669",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <span>View & Edit</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SPORT DETAILS & TOURNAMENTS MODAL (DOES NOT CLOSE ON OUTSIDE CLICK)       */}
      {/* ========================================================================= */}
      {selectedSport && (
        <div className="admin-modal-backdrop" onClick={(e) => e.stopPropagation()}>
          <div
            className="admin-modal-card"
            style={{
              maxWidth: "750px",
              width: "95vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              padding: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: selectedSport.accentColor ? `${selectedSport.accentColor}20` : "#ecfdf5",
                    color: selectedSport.accentColor || "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "1.35rem",
                  }}
                >
                  🏆
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
                      {selectedSport.name}
                    </h2>
                    <span
                      style={{
                        padding: "0.15rem 0.5rem",
                        borderRadius: "9999px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: "#e2e8f0",
                        color: "#475569",
                      }}
                    >
                      ID #{selectedSport.id}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    Format: {selectedSport.format || "Official Standard"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setSelectedSport(null)}
                  style={{
                    background: "#e2e8f0",
                    border: "none",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    cursor: "pointer",
                    color: "#475569",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Sub Tabs */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #e2e8f0",
                background: "#fff",
                padding: "0 1.5rem",
                gap: "1.5rem",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("tournaments")}
                style={{
                  padding: "0.85rem 0",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === "tournaments" ? "2px solid #059669" : "2px solid transparent",
                  color: activeTab === "tournaments" ? "#059669" : "#64748b",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <Trophy size={16} />
                <span>Tournaments ({getSportTournaments(selectedSport).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("details")}
                style={{
                  padding: "0.85rem 0",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === "details" ? "2px solid #059669" : "2px solid transparent",
                  color: activeTab === "details" ? "#059669" : "#64748b",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <Edit3 size={16} />
                <span>Discipline Specifications & Rules</span>
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: "1.5rem",
                overflowY: "auto",
                flex: 1,
              }}
            >
              {/* TAB 1: TOURNAMENTS */}
              {activeTab === "tournaments" && (
                <div>
                  {getSportTournaments(selectedSport).length > 0 ? (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "1rem",
                        }}
                      >
                        <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>
                          {getSportTournaments(selectedSport).length} tournament(s) registered under {selectedSport.name}:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenCreateTournament) {
                              onOpenCreateTournament(selectedSport.name);
                              setSelectedSport(null);
                            }
                          }}
                          className="admin-btn-primary"
                          style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem", gap: "0.3rem" }}
                        >
                          <Plus size={14} />
                          <span>Host Another Tournament</span>
                        </button>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                        {getSportTournaments(selectedSport).map((t) => (
                          <div
                            key={t.id}
                            style={{
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "10px",
                              padding: "1rem",
                              display: "flex",
                              flexWrap: "wrap",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "0.75rem",
                            }}
                          >
                            <div style={{ minWidth: "220px", flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                                  {t.name}
                                </h4>
                                <span
                                  style={{
                                    fontSize: "0.68rem",
                                    fontWeight: 700,
                                    padding: "0.15rem 0.45rem",
                                    borderRadius: "9999px",
                                    background: t.status === "Open" ? "#ecfdf5" : "#f1f5f9",
                                    color: t.status === "Open" ? "#065f46" : "#475569",
                                  }}
                                >
                                  {t.status || "Scheduled"}
                                </span>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "0.85rem",
                                  marginTop: "0.45rem",
                                  fontSize: "0.8rem",
                                  color: "#64748b",
                                }}
                              >
                                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                  <Calendar size={13} color="#059669" />
                                  Kickoff: {t.date}
                                </span>
                                {t.lastRegistrationDate && (
                                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                    <Clock size={13} color="#d97706" />
                                    Deadline: {t.lastRegistrationDate}
                                  </span>
                                )}
                                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                  <MapPin size={13} color="#0284c7" />
                                  {t.groundName || t.location}
                                </span>
                                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                  <Users size={13} color="#8b5cf6" />
                                  {t.registeredTeams || 0} / {t.maxTeams || 16} Squads
                                </span>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                              {onViewTournament && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onViewTournament(t.id);
                                    setSelectedSport(null);
                                  }}
                                  className="admin-btn-secondary"
                                  style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem", gap: "0.3rem" }}
                                >
                                  <span>Manage</span>
                                  <ArrowRight size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Empty Tournaments State */
                    <div
                      style={{
                        padding: "2.5rem 1.5rem",
                        textAlign: "center",
                        background: "#f8fafc",
                        borderRadius: "12px",
                        border: "1px dashed #cbd5e1",
                      }}
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          background: "#e0f2fe",
                          color: "#0284c7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 1rem auto",
                        }}
                      >
                        <Trophy size={28} />
                      </div>
                      <h3 style={{ margin: "0 0 0.5rem 0", color: "#0f172a", fontSize: "1.1rem" }}>
                        No Tournaments Hosted for {selectedSport.name} Yet
                      </h3>
                      <p
                        style={{
                          margin: "0 auto 1.25rem auto",
                          fontSize: "0.85rem",
                          color: "#64748b",
                          maxWidth: "460px",
                          lineHeight: 1.45,
                        }}
                      >
                        There are currently no active or upcoming competitions created under this discipline. You can organize the inaugural tournament for {selectedSport.name} right now.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenCreateTournament) {
                            onOpenCreateTournament(selectedSport.name);
                            setSelectedSport(null);
                          }
                        }}
                        className="admin-btn-primary"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.45rem",
                          padding: "0.6rem 1.25rem",
                          fontSize: "0.9rem",
                        }}
                      >
                        <Plus size={16} />
                        <span>Create Tournament for {selectedSport.name}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SPECIFICATIONS & FACILITY DETAILS */}
              {activeTab === "details" && (
                <form onSubmit={handleSaveSportDetails}>
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "8px",
                      padding: "0.75rem 1rem",
                      marginBottom: "1.25rem",
                      fontSize: "0.82rem",
                      color: "#166534",
                      lineHeight: 1.4,
                    }}
                  >
                    💡 <strong>Field & Rules Specification:</strong> Update official regulations, default arenas, and surface properties. These specifications are synchronized with tournament registrations.
                  </div>

                  <div className="admin-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="admin-form-group">
                      <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                        Default Ground / Stadium Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Gachibowli Stadium, Central Arena"
                        value={editGroundName}
                        onChange={(e) => setEditGroundName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.55rem 0.75rem",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                        }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                        Surface Type
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hardwood / Natural Turf / Clay"
                        value={editSurface}
                        onChange={(e) => setEditSurface(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.55rem 0.75rem",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                    <div className="admin-form-group">
                      <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                        Competition Format
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5v5, 11-a-side, Singles, Round-Robin"
                        value={editFormat}
                        onChange={(e) => setEditFormat(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.55rem 0.75rem",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                        }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                        Discipline Category
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Field Sports / Racquet / Team"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.55rem 0.75rem",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group" style={{ marginTop: "1rem" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                      Discipline Description & Field Dimensions
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Standard pitch dimensions 105m x 68m with natural grass turf..."
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginTop: "1rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                      <BookOpen size={14} color="#059669" />
                      <span>Discipline Specifications & Rules (WYSIWYG Kitchen Sink)</span>
                    </label>
                    <WysiwygEditor
                      id="edit-sport-rules"
                      value={editRules}
                      onChange={setEditRules}
                      placeholder="Official sanctioned rules, timing, field dimensions, gear, and penalty criteria..."
                      minHeight="140px"
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "0.75rem",
                      marginTop: "1.5rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid #e2e8f0",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedSport(null)}
                      className="admin-btn-secondary"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={updatingSport}
                      className="admin-btn-primary"
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                    >
                      {updatingSport ? "Saving Specifications..." : "Save Discipline Details"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD SPORT MODAL (DOES NOT CLOSE ON OUTSIDE CLICK)                          */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={(e) => e.stopPropagation()}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: "620px", width: "95vw", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Add New Sport Discipline</h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Add to Sports Directory and Database
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSport}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                    Sport Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Volleyball, Rugby, Table Tennis, Pickleball"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.75rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div className="admin-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                  <div className="admin-form-group">
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                      Default Ground / Stadium Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Central Indoor Arena"
                      value={groundName}
                      onChange={(e) => setGroundName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                      Playing Surface
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hardwood / Clay / Turf"
                      value={surface}
                      onChange={(e) => setSurface(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                </div>

                <div className="admin-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                  <div className="admin-form-group">
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                      Format
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5v5, 11-a-side, Singles"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                      Discipline Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Field Sports / Racquet / Team"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                </div>

                <div className="admin-form-group" style={{ marginTop: "1rem" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                    Description & Specifications
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the sport..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.55rem 0.75rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>

                <div className="admin-form-group" style={{ marginTop: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    <BookOpen size={14} color="#059669" />
                    <span>Discipline Specifications & Rules (WYSIWYG Kitchen Sink)</span>
                  </label>
                  <WysiwygEditor
                    id="add-sport-rules"
                    value={rules}
                    onChange={setRules}
                    placeholder="Official sanctioned rules, timing, field dimensions, gear, and penalty criteria..."
                    minHeight="140px"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                >
                  {submitting ? "Saving to Database..." : "Save Sport Discipline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL (DOES NOT CLOSE ON OUTSIDE CLICK)                */}
      {/* ========================================================================= */}
      {sportToDelete && (
        <div className="admin-modal-backdrop" onClick={(e) => e.stopPropagation()}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: "460px", width: "92vw", padding: "1.5rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#fee2e2",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                  Delete {sportToDelete.name}?
                </h3>
                <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Discipline Removal Confirmation
                </span>
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.5, margin: "0 0 1.25rem 0" }}>
              Are you sure you want to remove <strong>"{sportToDelete.name}"</strong> from the sports directory? This will remove it from the admin lists and tournament creation options.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.65rem" }}>
              <button
                type="button"
                onClick={() => setSportToDelete(null)}
                className="admin-btn-secondary"
                style={{ minHeight: "40px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteSport}
                style={{
                  minHeight: "40px",
                  padding: "0.5rem 1.15rem",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                Yes, Delete Sport
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
