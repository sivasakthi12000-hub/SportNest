import React, { useState } from "react";
import { Plus, Trash2, Trophy, MapPin, Navigation, ExternalLink } from "lucide-react";
import { Sport, createTournament } from "../../services/dataService";
import { useAuth } from "../../context/AuthContext";
import { WysiwygEditor } from "../WysiwygEditor";

interface AdminCreateTournamentModalProps {
  sports: Sport[];
  onClose: () => void;
  onSuccess: () => void;
  defaultSportId?: number;
  defaultSportName?: string;
}

export const AdminCreateTournamentModal: React.FC<AdminCreateTournamentModalProps> = ({
  sports,
  onClose,
  onSuccess,
  defaultSportId,
  defaultSportName,
}) => {
  const { user } = useAuth();
  const matchedSport = defaultSportId
    ? sports.find((s) => s.id === defaultSportId)
    : defaultSportName
    ? sports.find((s) => s.name.toLowerCase() === defaultSportName.toLowerCase())
    : sports[0];

  const [name, setName] = useState("");
  const [sportId, setSportId] = useState<number>(matchedSport?.id || sports[0]?.id || 1);
  const [location, setLocation] = useState("Hyderabad");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [groundName, setGroundName] = useState(matchedSport?.groundName || "");
  const [mapUrl, setMapUrl] = useState("");
  const [state, setState] = useState("Telangana");
  const [district, setDistrict] = useState("Hyderabad");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [lastRegistrationDate, setLastRegistrationDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [entryFee, setEntryFee] = useState(1200);
  const [maxTeams, setMaxTeams] = useState(16);
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
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
        mapUrl: mapUrl.trim() || undefined,
        state: state.trim(),
        district: district.trim(),
        date,
        lastRegistrationDate,
        entryFee: Number(entryFee),
        prizeAmount: totalPrizeCalculated,
        prizeBreakdown: prizes,
        maxTeams: Number(maxTeams),
        description: description.trim() || "Sanctioned competition registered via SportsNest Admin.",
        rules: rules.trim() || undefined,
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
    <div
      className="admin-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
        overflowY: "auto",
      }}
    >
      <div
        className="admin-modal-card"
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
      >
        <div className="admin-modal-header" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
              Create Tournament
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "#64748b" }}>
              Add a new sports tournament to Supabase database.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              fontSize: "1.1rem",
              color: "#64748b",
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}>
          <div className="admin-modal-body" style={{ overflowY: "auto", padding: "1.25rem 1.5rem", flex: 1 }}>
            {errorMsg && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  marginBottom: "0.75rem",
                }}
              >
                {errorMsg}
              </div>
            )}

            <div className="admin-form-group">
              <label>Tournament Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Telangana Premier Badminton Cup 2026"
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

            {/* Venue Address & Location (Clean neutral panel) */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                padding: "0.85rem",
                borderRadius: "10px",
                marginBottom: "0.85rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.6rem" }}>
                <MapPin size={16} style={{ color: "#059669" }} />
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a" }}>
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

              <div className="admin-form-row" style={{ marginBottom: "0.5rem" }}>
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

              <div className="admin-form-row" style={{ marginBottom: "0.5rem" }}>
                <div className="admin-form-group">
                  <label>State</label>
                  <input
                    type="text"
                    placeholder="e.g. Telangana"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>District</label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
              </div>

              {/* Map URL Input (No embedded iframe during creation, small test badge instead) */}
              <div className="admin-form-group" style={{ marginTop: "0.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Navigation size={13} color="#0284c7" />
                    <span>Google Maps Venue Location URL</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const q = [groundName, address, location, pincode].filter(Boolean).join(", ");
                      if (q) setMapUrl(`https://maps.google.com/?q=${encodeURIComponent(q)}`);
                    }}
                    style={{
                      background: "#f0f9ff",
                      border: "1px solid #bae6fd",
                      color: "#0284c7",
                      borderRadius: "4px",
                      padding: "0.2rem 0.5rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Auto-generate from Address
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Paste Google Maps URL (e.g. https://maps.google.com/?q=...)"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                />

                {mapUrl && (
                  <div
                    style={{
                      marginTop: "0.45rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.45rem 0.75rem",
                      borderRadius: "6px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      fontSize: "0.8rem",
                    }}
                  >
                    <span style={{ color: "#166534", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                      <Navigation size={13} color="#16a34a" />
                      Google Maps location linked
                    </span>
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#059669",
                        fontWeight: 700,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>Open in new tab</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
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

            {/* Multi-Tier Prize Breakdown (Clean neutral panel) */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                padding: "0.85rem",
                borderRadius: "10px",
                marginBottom: "0.85rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Trophy size={16} style={{ color: "#d97706" }} />
                  <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a" }}>
                    Prize Distribution (1st to 8th & Special Awards)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addPrizeRow}
                  style={{
                    background: "#fef3c7",
                    border: "1px solid #fde68a",
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
                placeholder="Tournament format, rules overview, sanctioned details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Discipline Specifications & Rules WYSIWYG Kitchen-Sink Editor */}
            <div className="admin-form-group" style={{ marginBottom: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Discipline Specifications & Rules (Optional)
                </label>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  WYSIWYG Kitchen Sink
                </span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "0 0 6px 0" }}>
                Enter discipline rules, field dimensions, and equipment specs. Only shown on tournament page if provided here.
              </p>
              <WysiwygEditor
                value={rules}
                onChange={setRules}
                placeholder="Write specific regulations, discipline court/field specifications, eligibility, foul rules, tie-breaker format..."
                minHeight="140px"
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
