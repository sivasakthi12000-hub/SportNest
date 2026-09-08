import React, { useState, useEffect } from "react";
import { Users, Search, Plus, Trash2, RefreshCw, Trophy, Shield, UserCheck } from "lucide-react";
import { Tournament, Team, getAllTeams, registerTeam, deleteTeam } from "../../services/dataService";

interface AdminTeamsViewProps {
  tournaments: Tournament[];
  initialTournamentFilter?: number | null;
  onRefreshParentCounts: () => void;
}

export const AdminTeamsView: React.FC<AdminTeamsViewProps> = ({
  tournaments,
  initialTournamentFilter,
  onRefreshParentCounts,
}) => {
  const [teams, setTeams] = useState<(Team & { tournamentName?: string; createdAt?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTourneyId, setSelectedTourneyId] = useState<string>(
    initialTournamentFilter ? String(initialTournamentFilter) : "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New team form state
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamTournamentId, setNewTeamTournamentId] = useState<number>(
    tournaments[0]?.id || 1
  );
  const [newTeamGroup, setNewTeamGroup] = useState("A");
  const [newTeamMembers, setNewTeamMembers] = useState(11);
  const [submitting, setSubmitting] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const data = await getAllTeams();
      setTeams(data);
    } catch (err) {
      console.error("Error loading teams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const showToast = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      showToast("Please enter a valid squad or team name.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await registerTeam({
        name: newTeamName.trim(),
        tournamentId: Number(newTeamTournamentId),
        group: newTeamGroup,
        members: Number(newTeamMembers),
      });

      if (res.success) {
        showToast(`Team "${newTeamName}" registered in Supabase!`, "success");
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

  const handleDeleteTeam = async (teamId: number, name: string, tourneyId: number) => {
    if (!window.confirm(`Disqualify/remove team "${name}" from tournament in Supabase?`)) {
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

  const filteredTeams = teams.filter((t) => {
    if (selectedTourneyId !== "all" && String(t.tournamentId) !== selectedTourneyId) {
      return false;
    }
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.tournamentName && t.tournamentName.toLowerCase().includes(q)) ||
      t.group.toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-view-container">
      {/* Toast */}
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
          <button onClick={() => setMessage(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="admin-view-header">
        <div className="admin-view-title-group">
          <h1>Team Rosters & Squads</h1>
          <p>
            Review all registered clubs and athlete rosters across sanctioned tournaments from Supabase.
          </p>
        </div>

        <div className="admin-view-actions">
          <div className="admin-search-input">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search team or club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="admin-status-select"
            value={selectedTourneyId}
            onChange={(e) => setSelectedTourneyId(e.target.value)}
            style={{ padding: "0.55rem 0.85rem", height: "40px", maxWidth: "260px" }}
          >
            <option value="all">All Tournaments ({tournaments.length})</option>
            {tournaments.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </select>

          <button onClick={fetchTeams} className="admin-btn-secondary" title="Reload from Supabase">
            <RefreshCw size={15} />
            <span>Reload</span>
          </button>

          <button onClick={() => setShowAddModal(true)} className="admin-btn-primary">
            <Plus size={16} />
            <span>Register Team</span>
          </button>
        </div>
      </div>

      {/* Teams Table */}
      <div className="admin-data-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Team / Club Name</th>
                <th>Tournament Registered</th>
                <th>Assigned Group</th>
                <th>Squad Count</th>
                <th>Verification</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    Loading registered teams from Supabase database...
                  </td>
                </tr>
              ) : filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    No registered teams found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => {
                  const tourney = tournaments.find((t) => t.id === team.tournamentId);
                  return (
                    <tr key={team.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "8px",
                              background: "#ecfdf5",
                              color: "#059669",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                            }}
                          >
                            🛡️
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: "#0f172a", display: "block" }}>
                              {team.name}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>ID: #{team.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <Trophy size={13} color="#d97706" />
                          <span style={{ fontWeight: 600, color: "#334155" }}>
                            {tourney?.name || team.tournamentName || `Tournament #${team.tournamentId}`}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="admin-badge-group">
                          Group {team.group || "A"}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>
                          {team.members || 11} Players
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
                            fontWeight: 600,
                          }}
                        >
                          <UserCheck size={14} />
                          <span>Sanctioned</span>
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleDeleteTeam(team.id, team.name, team.tournamentId)}
                          className="admin-btn-icon-danger"
                          title="Remove Team from Tournament"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Team Modal */}
      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Register New Team / Squad</h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
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
                    placeholder="e.g. Thunder Strikers FC"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Tournament to Enter *</label>
                  <select
                    value={newTeamTournamentId}
                    onChange={(e) => setNewTeamTournamentId(Number(e.target.value))}
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
                    <select value={newTeamGroup} onChange={(e) => setNewTeamGroup(e.target.value)}>
                      <option value="A">Group A</option>
                      <option value="B">Group B</option>
                      <option value="C">Group C</option>
                      <option value="D">Group D</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Squad Size (Players)</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={newTeamMembers}
                      onChange={(e) => setNewTeamMembers(Number(e.target.value))}
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
                  {submitting ? "Saving to Supabase..." : "Confirm Team Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
