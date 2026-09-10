import React, { useState } from "react";
import { Plus, Trash2, Trophy, MapPin } from "lucide-react";
import { Sport, createTournament } from "../../services/dataService";
import { useAuth } from "../../context/AuthContext";

interface AdminCreateTournamentModalProps {
  sports: Sport[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminCreateTournamentModal: React.FC<AdminCreateTournamentModalProps> = ({
  sports,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [sportId, setSportId] = useState<number>(sports[0]?.id || 1);
  const [location, setLocation] = useState("Hyderabad");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [groundName, setGroundName] = useState("");
  const [state, setState] = useState("Telangana");
  const [district, setDistrict] = useState("Hyderabad");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [lastRegistrationDate, setLastRegistrationDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [entryFee, setEntryFee] = useState(1200);
  const [maxTeams, setMaxTeams] = useState(16);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Multi-tier prize distribution
  const [prizes, setPrizes] = useState([
    { position: "1st Prize 🥇", amount: 25000 },
    { position: "2nd Prize 🥈", amount: 12000 },
    { position: "3rd Prize 🥉", amount: 5000 },
  ]);

  const totalPrizeCalculated = prizes.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const handlePrizeChange = (index: number, field: "position" | "amount", val: any) => {
    setPrizes((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: field === "amount" ? Number(val) || 0 : val,
      };
      return copy;
    });
  };

  const addPrizeRow = () => {
    const nextIdx = prizes.length + 1;
    const label = nextIdx <= 8 ? `${nextIdx}th Prize` : `Special Prize #${nextIdx - 8}`;
    setPrizes((prev) => [...prev, { position: label, amount: 2000 }]);
  };

  const removePrizeRow = (index: number) => {
    if (prizes.length <= 1) return;
    setPrizes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      setErrorMsg("Tournament name and location are required.");
      return;
    }
    if (!address.trim() || !pincode.trim()) {
      setErrorMsg("Venue address and 6-digit pincode are required for map & filtering.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await createTournament({
        name: name.trim(),
        sportId: Number(sportId),
        location: location.trim(),
        address: address.trim(),
        pincode: pincode.trim(),
        groundName: groundName.trim() || `${location} Stadium`,
        state: state.trim(),
        district: district.trim(),
        date,
        lastRegistrationDate,
        entryFee: Number(entryFee),
        prizeAmount: totalPrizeCalculated,
        prizeBreakdown: prizes,
        maxTeams: Number(maxTeams),
        description: description.trim() || "Sanctioned competition registered via SportsNest Admin.",
        createdBy: user?.username || "admin",
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error || "Failed to create tournament.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error creating tournament.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal-card"
        style={{ maxWidth: "680px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div>
            <h3 style={{ margin: 0 }}>Create Tournament</h3>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              SportsNest Supabase Synchronized Registry
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            {errorMsg && (
              <div
                style={{
                  padding: "0.65rem 1rem",
                  background: "#fef2f2",
                  color: "#b91c1c",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  border: "1px solid #fecaca",
                }}
              >
                {errorMsg}
              </div>
            )}

            <div className="admin-form-group">
              <label>Tournament Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Telangana Champions Premier Cup"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Sport Discipline *</label>
                <select
                  value={sportId}
                  onChange={(e) => setSportId(Number(e.target.value))}
                >
                  {sports.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Max Teams Quota</label>
                <input
                  type="number"
                  min={2}
                  max={64}
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Address & Pincode */}
            <div
              style={{
                background: "rgba(16, 185, 129, 0.05)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                padding: "0.8rem",
                borderRadius: "8px",
                marginBottom: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.5rem" }}>
                <MapPin size={16} style={{ color: "#10b981" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                  Venue Address & Pincode
                </span>
              </div>
              <div className="admin-form-row" style={{ marginBottom: "0.5rem" }}>
                <div className="admin-form-group" style={{ flex: "2" }}>
                  <label>Street Address / Venue Road *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gachibowli Stadium Road"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="admin-form-group" style={{ flex: "1" }}>
                  <label>Pincode (6 digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 500032"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-row" style={{ marginBottom: 0 }}>
                <div className="admin-form-group">
                  <label>Ground / Stadium Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajiv Gandhi Arena"
                    value={groundName}
                    onChange={(e) => setGroundName(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>City / Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Tournament Match Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Registration Deadline</label>
                <input
                  type="date"
                  value={lastRegistrationDate}
                  onChange={(e) => setLastRegistrationDate(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Entry Fee (₹)</label>
              <input
                type="number"
                min={0}
                step={50}
                value={entryFee}
                onChange={(e) => setEntryFee(Number(e.target.value))}
              />
            </div>

            {/* Multi-Tier Prize Breakdown */}
            <div
              style={{
                background: "rgba(245, 158, 11, 0.05)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                padding: "0.8rem",
                borderRadius: "8px",
                marginBottom: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Trophy size={16} style={{ color: "#d97706" }} />
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                    Prize Distribution (1st to 8th & Special Awards)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addPrizeRow}
                  style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    border: "none",
                    color: "#b45309",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Plus size={13} /> Add Prize
                </button>
              </div>

              {prizes.map((p, idx) => (
                <div key={idx} style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                  <input
                    type="text"
                    value={p.position}
                    onChange={(e) => handlePrizeChange(idx, "position", e.target.value)}
                    placeholder="Position / Title"
                    style={{ flex: 2, padding: "6px 8px", fontSize: "0.85rem" }}
                  />
                  <input
                    type="number"
                    value={p.amount}
                    onChange={(e) => handlePrizeChange(idx, "amount", e.target.value)}
                    placeholder="₹ Amount"
                    style={{ flex: 1.5, padding: "6px 8px", fontSize: "0.85rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => removePrizeRow(idx)}
                    disabled={prizes.length <= 1}
                    style={{
                      background: "#fee2e2",
                      border: "none",
                      color: "#dc2626",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      cursor: prizes.length <= 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <div style={{ textAlign: "right", fontSize: "0.85rem", color: "#b45309", fontWeight: 700 }}>
                Total Prize Pool: ₹{totalPrizeCalculated.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="admin-form-group">
              <label>Description & Notes</label>
              <textarea
                rows={2}
                placeholder="Tournament format, rules, sanctioned details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" onClick={onClose} className="admin-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="admin-btn-primary">
              {submitting ? "Publishing to Supabase..." : "Publish Tournament"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateTournamentModal;
