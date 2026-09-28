import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  Trophy,
  Shield,
  UserCheck,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Save,
  CheckCircle,
  Filter,
} from "lucide-react";
import {
  Tournament,
  Team,
  getAllTeams,
  registerTeam,
  updateTeam,
  deleteTeam,
} from "../../services/dataService";

interface AdminTeamsViewProps {
  tournaments: Tournament[];
  isSuperAdmin?: boolean;
  initialTournamentFilter?: number | null;
  onRefreshParentCounts: () => void;
}

export const AdminTeamsView: React.FC<AdminTeamsViewProps> = ({
  tournaments,
  isSuperAdmin = false,
  initialTournamentFilter,
  onRefreshParentCounts,
}) => {
  const [allTeams, setAllTeams] = useState<
    (Team & { tournamentName?: string; createdAt?: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedTourneyId, setSelectedTourneyId] = useState<string>(
    initialTournamentFilter ? String(initialTournamentFilter) : "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // New team form state
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamTournamentId, setNewTeamTournamentId] = useState<number>(
    tournaments[0]?.id || 1
  );
  const [newTeamGroup, setNewTeamGroup] = useState("A");
  const [newTeamMembers, setNewTeamMembers] = useState(11);
  const [submitting, setSubmitting] = useState(false);

  // Edit team form state
  const [editingTeam, setEditingTeam] = useState<
    (Team & { tournamentName?: string }) | null
  >(null);
  const [editName, setEditName] = useState("");
  const [editTournamentId, setEditTournamentId] = useState<number>(1);
  const [editGroup, setEditGroup] = useState("A");
  const [editMembers, setEditMembers] = useState(11);
  const [savingEdit, setSavingEdit] = useState(false);

  const showToast = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const data = await getAllTeams();
      setAllTeams(data);
    } catch (err: any) {
      console.error("Error loading teams:", err);
      showToast("Notice fetching teams from database.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Filter teams based on user role and selections
  const filteredTeams = useMemo(() => {
    const validTourneyIds = new Set(tournaments.map((t) => t.id));

    return allTeams.filter((t) => {
      // For tournament organizer, only show teams in their tournaments
      if (!isSuperAdmin && !validTourneyIds.has(t.tournamentId)) {
        return false;
      }

      // Tournament filter dropdown
      if (selectedTourneyId !== "all" && String(t.tournamentId) !== selectedTourneyId) {
        return false;
      }

      // Search term filter
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        (t.tournamentName && t.tournamentName.toLowerCase().includes(q)) ||
        t.group.toLowerCase().includes(q) ||
        String(t.id).includes(q)
      );
    });
  }, [allTeams, tournaments, isSuperAdmin, selectedTourneyId, searchTerm]);

  // Pagination calculations
  const totalItems = filteredTeams.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedTeams = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredTeams.slice(startIndex, startIndex + pageSize);
  }, [filteredTeams, safeCurrentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Register New Team
  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      showToast("Please enter a valid squad or team name.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const selectedTourney = tournaments.find(
        (t) => t.id === Number(newTeamTournamentId)
      );
      const res = await registerTeam({
        name: newTeamName.trim(),
        tournamentId: Number(newTeamTournamentId),
        tournamentName: selectedTourney?.name,
        group: newTeamGroup,
        members: Number(newTeamMembers),
      });

      if (res.success) {
        showToast(`Team "${newTeamName}" registered in database!`, "success");
        setNewTeamName("");
        setShowAddModal(false);
        fetchTeams();
        onRefreshParentCounts();
      } else {
        showToast(res.error || "Failed to register team.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Registration error.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (t: Team & { tournamentName?: string }) => {
    setEditingTeam(t);
    setEditName(t.name);
    setEditTournamentId(t.tournamentId);
    setEditGroup(t.group || "A");
    setEditMembers(t.members || 11);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    if (!editName.trim()) {
      showToast("Team name cannot be empty.", "error");
      return;
    }

    setSavingEdit(true);
    try {
      const selectedTourney = tournaments.find(
        (t) => t.id === Number(editTournamentId)
      );
      const res = await updateTeam(editingTeam.id, {
        name: editName.trim(),
        tournamentId: Number(editTournamentId),
        tournamentName: selectedTourney?.name,
        group: editGroup,
        members: Number(editMembers),
      });

      if (res.success) {
        showToast(`Team "${editName}" updated successfully!`, "success");
        setEditingTeam(null);
        fetchTeams();
        onRefreshParentCounts();
      } else {
        showToast(res.error || "Failed to update team.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Update error.", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Team
  const handleDeleteTeam = async (teamId: number, name: string, tourneyId: number) => {
    if (
      !window.confirm(
        `Are you sure you want to remove team "${name}" from the tournament roster?`
      )
    ) {
      return;
    }
    try {
      const res = await deleteTeam(teamId, tourneyId);
      if (res.success) {
        showToast(`Team "${name}" removed from database.`, "success");
        fetchTeams();
        onRefreshParentCounts();
      } else {
        showToast(res.error || "Failed to delete team.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Delete error.", "error");
    }
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
            border: `1px solid ${
              message.type === "success" ? "#a7f3d0" : "#fecaca"
            }`,
            fontWeight: 600,
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.1rem",
              color: "inherit",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Team Rosters & Squads</h1>
          <p>
            {isSuperAdmin
              ? "Review and manage all registered clubs, athlete squads, and rosters across all sanctioned tournaments."
              : "Review and manage teams registered for your hosted tournaments."}
          </p>
        </div>

        <div className="admin-view-actions">
          <div className="admin-search-input">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search team, club, or group..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="admin-status-select"
            value={selectedTourneyId}
            onChange={(e) => {
              setSelectedTourneyId(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "0.55rem 0.85rem",
              height: "40px",
              maxWidth: "260px",
            }}
          >
            <option value="all">
              All Tournaments ({tournaments.length})
            </option>
            {tournaments.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            onClick={fetchTeams}
            className="admin-btn-secondary"
            title="Reload from database"
          >
            <RefreshCw size={15} />
            <span>Reload</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="admin-btn-primary"
          >
            <Plus size={16} />
            <span>Register Team</span>
          </button>
        </div>
      </div>

      {/* Teams Table */}
      <div className="admin-data-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: "220px" }}>Team / Club Name</th>
                <th style={{ minWidth: "220px" }}>Tournament Registered</th>
                <th>Assigned Group</th>
                <th>Squad Count</th>
                <th>Status</th>
                <th style={{ textAlign: "right", minWidth: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "#64748b",
                    }}
                  >
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Loading registered teams from database...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTeams.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "#64748b",
                    }}
                  >
                    No registered teams found matching the active filter.
                  </td>
                </tr>
              ) : (
                paginatedTeams.map((team) => {
                  const tourney = tournaments.find(
                    (t) => t.id === team.tournamentId
                  );
                  return (
                    <tr key={team.id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.6rem",
                          }}
                        >
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "8px",
                              background: "#ecfdf5",
                              color: "#059669",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "1.1rem",
                              flexShrink: 0,
                            }}
                          >
                            🛡️
                          </div>
                          <div>
                            <span
                              style={{
                                fontWeight: 700,
                                color: "#0f172a",
                                display: "block",
                                fontSize: "0.92rem",
                              }}
                            >
                              {team.name}
                            </span>
                            <span
                              style={{ fontSize: "0.75rem", color: "#64748b" }}
                            >
                              ID: #{team.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                          }}
                        >
                          <Trophy size={14} color="#d97706" style={{ flexShrink: 0 }} />
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#334155",
                              fontSize: "0.88rem",
                            }}
                          >
                            {tourney?.name ||
                              team.tournamentName ||
                              `Tournament #${team.tournamentId}`}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            border: "1px solid #bfdbfe",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "6px",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                          }}
                        >
                          Group {team.group || "A"}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>
                          👥 {team.members || 11} Athletes
                        </span>
                      </td>

                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            fontSize: "0.78rem",
                            color: "#059669",
                            background: "#ecfdf5",
                            padding: "0.2rem 0.55rem",
                            borderRadius: "999px",
                            fontWeight: 700,
                          }}
                        >
                          <UserCheck size={13} />
                          <span>Sanctioned</span>
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                          }}
                        >
                          <button
                            onClick={() => handleOpenEdit(team)}
                            className="admin-btn-icon"
                            title="Edit Team Roster"
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

                          <button
                            onClick={() =>
                              handleDeleteTeam(
                                team.id,
                                team.name,
                                team.tournamentId
                              )
                            }
                            className="admin-btn-icon"
                            title="Remove Team from Roster"
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) =>
                  handlePageSizeChange(Number(e.target.value))
                }
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  cursor: "pointer",
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
                {totalItems === 0
                  ? 0
                  : (safeCurrentPage - 1) * pageSize + 1}
              </strong>{" "}
              -{" "}
              <strong style={{ color: "#0f172a" }}>
                {Math.min(safeCurrentPage * pageSize, totalItems)}
              </strong>{" "}
              of <strong style={{ color: "#0f172a" }}>{totalItems}</strong> teams
            </span>
          </div>

          {/* Page controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
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

            <span
              style={{
                padding: "4px 10px",
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              Page {safeCurrentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              style={{
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                background:
                  safeCurrentPage === totalPages ? "#f1f5f9" : "#ffffff",
                color: safeCurrentPage === totalPages ? "#94a3b8" : "#334155",
                cursor:
                  safeCurrentPage === totalPages ? "not-allowed" : "pointer",
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
                background:
                  safeCurrentPage === totalPages ? "#f1f5f9" : "#ffffff",
                color: safeCurrentPage === totalPages ? "#94a3b8" : "#334155",
                cursor:
                  safeCurrentPage === totalPages ? "not-allowed" : "pointer",
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

      {/* Register Team Modal */}
      {showAddModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>Register New Team / Squad</h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterTeam}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Team or Club Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kovai Strikers FC"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Tournament to Enter *</label>
                  <select
                    value={newTeamTournamentId}
                    onChange={(e) =>
                      setNewTeamTournamentId(Number(e.target.value))
                    }
                  >
                    {tournaments.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.registeredTeams}/{t.maxTeams} teams)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Assigned Group</label>
                    <select
                      value={newTeamGroup}
                      onChange={(e) => setNewTeamGroup(e.target.value)}
                    >
                      <option value="A">Group A</option>
                      <option value="B">Group B</option>
                      <option value="C">Group C</option>
                      <option value="D">Group D</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Squad Size (Athletes)</label>
                    <input
                      type="number"
                      min={1}
                      max={35}
                      value={newTeamMembers}
                      onChange={(e) =>
                        setNewTeamMembers(Number(e.target.value))
                      }
                    />
                  </div>
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
                >
                  {submitting
                    ? "Saving to Database..."
                    : "Confirm Team Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>Edit Squad Details (#{editingTeam.id})</h3>
              <button
                onClick={() => setEditingTeam(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Team or Club Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Tournament *</label>
                  <select
                    value={editTournamentId}
                    onChange={(e) =>
                      setEditTournamentId(Number(e.target.value))
                    }
                  >
                    {tournaments.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Assigned Group</label>
                    <select
                      value={editGroup}
                      onChange={(e) => setEditGroup(e.target.value)}
                    >
                      <option value="A">Group A</option>
                      <option value="B">Group B</option>
                      <option value="C">Group C</option>
                      <option value="D">Group D</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Squad Members</label>
                    <input
                      type="number"
                      min={1}
                      max={35}
                      value={editMembers}
                      onChange={(e) =>
                        setEditMembers(Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="admin-btn-primary"
                >
                  {savingEdit ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
