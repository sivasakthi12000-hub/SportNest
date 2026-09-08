import React, { useState } from "react";
import { Sport, createTournament } from "../../services/dataService";

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
  const [name, setName] = useState("");
  const [sportId, setSportId] = useState<number>(sports[0]?.id || 1);
  const [location, setLocation] = useState("");
  const [groundName, setGroundName] = useState("");
  const [state, setState] = useState("California");
  const [district, setDistrict] = useState("Los Angeles");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [lastRegistrationDate, setLastRegistrationDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [entryFee, setEntryFee] = useState(150);
  const [prizeAmount, setPrizeAmount] = useState(5000);
  const [maxTeams, setMaxTeams] = useState(16);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      setErrorMsg("Tournament name and location are required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await createTournament({
        name: name.trim(),
        sportId: Number(sportId),
        location: location.trim(),
        groundName: groundName.trim() || `${location} Stadium`,
        state: state.trim(),
        district: district.trim(),
        date,
        lastRegistrationDate,
        entryFee: Number(entryFee),
        prizeAmount: Number(prizeAmount),
        maxTeams: Number(maxTeams),
        description: description.trim() || "Sanctioned competition registered via ArenaSync Admin.",
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
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Create Tournament (Supabase Synchronized)</h3>
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
                placeholder="e.g. National Championship 2026"
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

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Location / City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Los Angeles, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Ground / Stadium Name</label>
                <input
                  type="text"
                  placeholder="e.g. Grand Arena"
                  value={groundName}
                  onChange={(e) => setGroundName(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Tournament Date</label>
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

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Prize Pool ($)</label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={prizeAmount}
                  onChange={(e) => setPrizeAmount(Number(e.target.value))}
                />
              </div>

              <div className="admin-form-group">
                <label>Entry Fee ($)</label>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={entryFee}
                  onChange={(e) => setEntryFee(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Description & Notes</label>
              <textarea
                rows={3}
                placeholder="Tournament format, eligibility, referee rules..."
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
