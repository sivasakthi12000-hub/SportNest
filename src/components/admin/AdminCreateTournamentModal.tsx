import React, { useState, useMemo } from "react";
import { Plus, Trash2, Trophy, MapPin, Navigation, ExternalLink, AlertTriangle } from "lucide-react";
import { Sport, createTournament } from "../../services/dataService";
import { useAuth } from "../../context/AuthContext";
import { WysiwygEditor } from "../WysiwygEditor";
import { getSportPitchMeta } from "../../utils/visualTheme";
import { TournamentFeasibilityCalculator } from "../TournamentFeasibilityCalculator";
import { analyzeScheduleFeasibility, TournamentFormatType } from "../../services/scheduleFeasibilityService";

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

  // Feasibility Check state
  const [venues, setVenues] = useState(1);
  const [durationDays, setDurationDays] = useState(1);
  const [matchDurationMinutes, setMatchDurationMinutes] = useState(60);
  const [playableHoursPerDay, setPlayableHoursPerDay] = useState(9);
  const [tournamentFormat, setTournamentFormat] = useState<TournamentFormatType>("Single Elimination (Knockout)");
  const [numGroups, setNumGroups] = useState(4);
  const [advancingPerGroup, setAdvancingPerGroup] = useState(2);
  const [feasibilityWarningDialog, setFeasibilityWarningDialog] = useState(false);

  const feasibilityData = useMemo(() => {
    return analyzeScheduleFeasibility({
      teams: Math.max(2, Number(maxTeams) || 16),
      venues: Math.max(1, Number(venues) || 1),
      durationDays: Math.max(1, Number(durationDays) || 1),
      matchDurationMinutes: Math.max(15, Number(matchDurationMinutes) || 60),
      playableHoursPerDay: Math.max(1, Math.min(24, Number(playableHoursPerDay) || 9)),
      format: tournamentFormat,
      numGroups: Math.max(2, Number(numGroups) || 4),
      advancingPerGroup: Math.max(1, Number(advancingPerGroup) || 2),
    });
  }, [
    maxTeams,
    venues,
    durationDays,
    matchDurationMinutes,
    playableHoursPerDay,
    tournamentFormat,
    numGroups,
    advancingPerGroup,
  ]);

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

  const handleSubmit = async (e?: React.FormEvent, bypassFeasibility = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!name.trim() || !location.trim()) {
      setErrorMsg("Tournament name and location are required.");
      return;
    }
    if (!address.trim() || !pincode.trim()) {
      setErrorMsg("Venue address and 6-digit pincode are required for map & filtering.");
      return;
    }

    // Feasibility Confirmation Check (Requirement 3)
    if (!feasibilityData.isFeasible && !bypassFeasibility) {
      setFeasibilityWarningDialog(true);
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
        format: tournamentFormat,
        venues: Number(venues),
        durationDays: Number(durationDays),
        matchDurationMinutes: Number(matchDurationMinutes),
        playableHoursPerDay: Number(playableHoursPerDay),
        numGroups: tournamentFormat === "Group Stage + Knockout" ? Number(numGroups) : undefined,
        advancingPerGroup: tournamentFormat === "Group Stage + Knockout" ? Number(advancingPerGroup) : undefined,
        isFeasible: feasibilityData.isFeasible,
        requiredMatches: feasibilityData.requiredMatches,
        calculatedCapacity: feasibilityData.capacity,
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

            {/* Selected Sport 3D Pitch Ground Visual Banner */}
            {(() => {
              const currentSport = sports.find((s) => s.id === Number(sportId));
              const pMeta = getSportPitchMeta(currentSport?.name);
              const gImg = currentSport?.image || currentSport?.imageUrl || pMeta.groundImage;

              return (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    marginBottom: "0.85rem",
                    border: "1px solid #cbd5e1",
                    background: "#09101a",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                  }}
                >
                  <img
                    src={gImg}
                    alt={`${currentSport?.name || "Sport"} Pitch Ground`}
                    referrerPolicy="no-referrer"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center 45%",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(90deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.4) 60%, transparent 100%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "1rem",
                      transform: "translateY(-50%)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: pMeta.accentColor }}>
                      BOUNCE THAT LIFTS ARENA
                    </span>
                    <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff" }}>
                      {currentSport?.name} &bull; {pMeta.surfaceBadge}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#cbd5e1" }}>
                      {currentSport?.groundName || pMeta.groundName}
                    </span>
                  </div>
                </div>
              );
            })()}

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

            {/* Tournament Format Feasibility Check (Live Capacity Engine) */}
            <div style={{ marginBottom: "1rem" }} id="modal-feasibility-section">
              <TournamentFeasibilityCalculator
                teams={Number(maxTeams) || 16}
                onTeamsChange={(val) => setMaxTeams(val)}
                venues={venues}
                onVenuesChange={setVenues}
                durationDays={durationDays}
                onDurationDaysChange={setDurationDays}
                matchDurationMinutes={matchDurationMinutes}
                onMatchDurationMinutesChange={setMatchDurationMinutes}
                playableHoursPerDay={playableHoursPerDay}
                onPlayableHoursPerDayChange={setPlayableHoursPerDay}
                format={tournamentFormat}
                onFormatChange={setTournamentFormat}
                numGroups={numGroups}
                onNumGroupsChange={setNumGroups}
                advancingPerGroup={advancingPerGroup}
                onAdvancingPerGroupChange={setAdvancingPerGroup}
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

      {/* Confirmation Dialog if Feasibility Check Fails (Requirement 3) */}
      {feasibilityWarningDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(4px)",
            zIndex: 100000,
            display: "grid",
            placeItems: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "500px",
              width: "100%",
              padding: "1.5rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
              border: "1px solid #fee2e2",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "#fef2f2",
                  color: "#dc2626",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#991b1b" }}>
                  Schedule May Not Fit!
                </h3>
                <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Tournament Format Feasibility Warning
                </span>
              </div>
            </div>

            <p style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.5, marginBottom: "1rem" }}>
              The format <strong>"{tournamentFormat}"</strong> requires{" "}
              <strong style={{ color: "#dc2626" }}>{feasibilityData.requiredMatches} matches</strong>,
              but only <strong>{feasibilityData.capacity} matches</strong> can be played with current venue and time limits
              ({feasibilityData.deficit} match deficit).
            </p>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "0.75rem",
                marginBottom: "1.25rem",
                fontSize: "0.8rem",
                color: "#475569",
              }}
            >
              <strong style={{ color: "#0f172a", display: "block", marginBottom: "0.25rem" }}>
                Organizer Suggestions:
              </strong>
              <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                {feasibilityData.suggestions.map((s, idx) => (
                  <li key={idx} style={{ marginBottom: "0.2rem" }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => {
                  setFeasibilityWarningDialog(false);
                  const el = document.getElementById("modal-feasibility-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  padding: "0.55rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Adjust Settings
              </button>

              <button
                type="button"
                onClick={() => {
                  setFeasibilityWarningDialog(false);
                  handleSubmit(undefined, true);
                }}
                style={{
                  padding: "0.55rem 1.15rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCreateTournamentModal;
