import React, { useState } from "react";
import { Plus, Search, RefreshCw, Award, MapPin, Shield, Layers } from "lucide-react";
import { Sport, createSport } from "../../services/dataService";

interface AdminSportsViewProps {
  sports: Sport[];
  onRefresh: () => void;
}

export const AdminSportsView: React.FC<AdminSportsViewProps> = ({ sports, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New sport form
  const [name, setName] = useState("");
  const [groundName, setGroundName] = useState("");
  const [surface, setSurface] = useState("");
  const [format, setFormat] = useState("");
  const [rules, setRules] = useState("");
  const [accentColor, setAccentColor] = useState("#10b981");
  const [submitting, setSubmitting] = useState(false);

  const showToast = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

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
        accentColor: accentColor || "#10b981",
      });

      if (res.success) {
        showToast(`Sport "${name}" successfully added to Supabase!`, "success");
        setName("");
        setGroundName("");
        setSurface("");
        setFormat("");
        setRules("");
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

  const filtered = sports.filter((s) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.groundName && s.groundName.toLowerCase().includes(q)) ||
      (s.format && s.format.toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-view-container">
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
          <h1>Sports & Facilities Directory</h1>
          <p>
            Configure sports categories, official field dimensions, and competition rules stored in Supabase.
          </p>
        </div>

        <div className="admin-view-actions">
          <div className="admin-search-input">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search sports disciplines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button onClick={onRefresh} className="admin-btn-secondary" title="Refresh from Supabase">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          <button onClick={() => setShowAddModal(true)} className="admin-btn-primary">
            <Plus size={16} />
            <span>Add Sport</span>
          </button>
        </div>
      </div>

      {/* Sports Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
        {filtered.map((s) => (
          <div key={s.id} className="admin-data-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: s.accentColor ? `${s.accentColor}20` : "#ecfdf5",
                      color: s.accentColor || "#059669",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "1.2rem",
                    }}
                  >
                    🏆
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                      {s.name}
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Sport ID: #{s.id}</span>
                  </div>
                </div>

                <span
                  style={{
                    padding: "0.25rem 0.6rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background: "#f1f5f9",
                    color: "#334155",
                  }}
                >
                  {s.format || "Standard Format"}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.85rem", color: "#475569" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <MapPin size={14} color="#059669" />
                  <span>Ground: <strong>{s.groundName || "Olympic Grade Arena"}</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Layers size={14} color="#0284c7" />
                  <span>Surface: <strong>{s.surface || "Natural Turf / Synthetic"}</strong></span>
                </div>
                {s.rules && (
                  <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#64748b", fontStyle: "italic", lineHeight: 1.4 }}>
                    "{s.rules.slice(0, 100)}{s.rules.length > 100 ? "..." : ""}"
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginTop: "1rem", paddingTop: "0.85rem", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", color: "#10b981", fontWeight: 700 }}>● Active in System</span>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Supabase Synchronized</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Sport Modal */}
      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Add New Sport Discipline</h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSport}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Sport Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Volleyball, Rugby, Table Tennis"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Default Ground / Stadium Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Central Indoor Arena"
                      value={groundName}
                      onChange={(e) => setGroundName(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Surface Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Hardwood / Clay / Turf"
                      value={surface}
                      onChange={(e) => setSurface(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Format</label>
                    <input
                      type="text"
                      placeholder="e.g. 5v5, 11-a-side, Singles"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Accent Brand Color</label>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      style={{ height: "42px", padding: "0.2rem", cursor: "pointer" }}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Key Rules or Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Key regulation summaries..."
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
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
                >
                  {submitting ? "Saving to Supabase..." : "Add to Supabase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
