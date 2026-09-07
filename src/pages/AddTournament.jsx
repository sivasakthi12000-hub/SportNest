import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createTournament } from "../services/dataService";
import "../styles/forms.css";

const AddTournament = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    sportId: "1",
    location: "",
    state: "",
    district: "",
    groundName: "",
    date: "",
    lastRegistrationDate: "",
    entryFee: "",
    prizeAmount: "",
    maxTeams: "16",
    bannerUrl: "",
    posterImage: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          posterImage: file,
          bannerUrl: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const bannerTag = formData.bannerUrl ? `[banner:${formData.bannerUrl}] ` : "";
    const res = await createTournament({
      name: formData.name,
      sportId: Number(formData.sportId),
      location: formData.location,
      state: formData.state,
      district: formData.district,
      groundName: formData.groundName,
      date: formData.date,
      lastRegistrationDate: formData.lastRegistrationDate,
      entryFee: Number(formData.entryFee || 0),
      prizeAmount: Number(formData.prizeAmount || 0),
      maxTeams: Number(formData.maxTeams || 16),
      description: `${bannerTag}Tournament organized in ${formData.location || "ArenaSync"}. Venue: ${formData.groundName || "Regulation Ground"}.`,
    });
    setLoading(false);
    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || "Failed to create tournament");
    }
  };

  if (submitted) {
    return (
      <div className="form-container">
        <div className="success-message">
          <h2>✓ Tournament Created Successfully!</h2>
          <p className="team-name">{formData.name}</p>
          <p className="player-count">
            Location: {formData.location}, {formData.state} | Max Teams: {formData.maxTeams}
          </p>
          <div className="success-actions">
            <Link to="/tournaments" className="btn btn-primary">
              View All Tournaments
            </Link>
            <Link to="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2>Add New Tournament</h2>
      <form onSubmit={handleSubmit} className="tournament-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Tournament Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="sportId">Sport Type</label>
            <select
              id="sportId"
              name="sportId"
              value={formData.sportId}
              onChange={handleChange}
              required
            >
              <option value="">Select Sport</option>
              <option value="4">Cricket</option>
              <option value="1">Football</option>
              <option value="6">Volleyball</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="state">State</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="district">District</label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="groundName">Ground Name</label>
            <input
              type="text"
              id="groundName"
              name="groundName"
              value={formData.groundName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Tournament Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastRegistrationDate">Last Registration Date</label>
            <input
              type="date"
              id="lastRegistrationDate"
              name="lastRegistrationDate"
              value={formData.lastRegistrationDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="entryFee">Entry Fee (₹)</label>
            <input
              type="number"
              id="entryFee"
              name="entryFee"
              value={formData.entryFee}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="prizeAmount">Prize Amount (₹)</label>
            <input
              type="number"
              id="prizeAmount"
              name="prizeAmount"
              value={formData.prizeAmount}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="maxTeams">Maximum Teams</label>
            <input
              type="number"
              id="maxTeams"
              name="maxTeams"
              value={formData.maxTeams}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="posterImage">Upload Banner / Team Logo (Optional)</label>
            <input
              type="file"
              id="posterImage"
              name="posterImage"
              onChange={handleFileChange}
              accept="image/*"
            />
            <small style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
              Leave blank to automatically use the official playing ground background for this sport.
            </small>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="bannerUrl">Or Banner / Logo Image URL (Optional)</label>
          <input
            type="url"
            id="bannerUrl"
            name="bannerUrl"
            value={formData.bannerUrl && !formData.bannerUrl.startsWith("data:") ? formData.bannerUrl : ""}
            onChange={handleChange}
            placeholder="https://example.com/banner.jpg"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Create Tournament
        </button>
      </form>
    </div>
  );
};

export default AddTournament;