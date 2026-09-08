import React from "react";
import { CreditCard, DollarSign, Users, CheckCircle2, Clock, AlertCircle, RefreshCw } from "lucide-react";
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
  const totalRegistered = tournaments.reduce((sum, t) => sum + (t.registeredTeams || 0), 0);
  const totalCapacity = tournaments.reduce((sum, t) => sum + (t.maxTeams || 16), 0);
  const totalFeesCollected = tournaments.reduce((sum, t) => sum + (t.registeredTeams * (t.entryFee || 0)), 0);
  const totalPotentialFees = tournaments.reduce((sum, t) => sum + (t.maxTeams * (t.entryFee || 0)), 0);

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
          <button onClick={onRefresh} className="admin-btn-secondary" title="Reload from Supabase">
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
      <div className="admin-data-card">
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
          Tournament Registration Breakdown
        </h2>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tournament</th>
                <th>Entry Fee</th>
                <th>Slot Progress</th>
                <th>Fee Revenue</th>
                <th>Deadline</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Roster</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t) => {
                const fillPercent = Math.min(
                  100,
                  Math.round(((t.registeredTeams || 0) / (t.maxTeams || 1)) * 100)
                );
                const revenue = (t.registeredTeams || 0) * (t.entryFee || 0);

                return (
                  <tr key={t.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>{t.name}</span>
                      <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b" }}>
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
                        <span style={{ color: "#dc2626", fontWeight: 700, fontSize: "0.8rem" }}>
                          Full
                        </span>
                      ) : (
                        <span style={{ color: "#059669", fontWeight: 600, fontSize: "0.8rem" }}>
                          Open
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => onViewTeams(t.id)}
                        className="admin-btn-secondary"
                        style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                      >
                        View Teams
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
