import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Trophy,
  Trash2,
  Lock,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  Navigation,
  ExternalLink,
  Globe,
} from "lucide-react";
import { createTournament, getSports } from "../services/dataService";
import {
  getIndianLocationsFromSupabase,
  getAvailableStates,
  getDistrictsForState,
} from "../utils/locationService";
import { useAuth } from "../context/AuthContext";
import "../styles/forms.css";

/**
 * Universal parser to convert user-entered Google Maps URL or place link
 * into a valid pinned Google Maps embed URL
 */
function parseGoogleMapsEmbedUrl(mapUrl, fallbackQuery) {
  if (!mapUrl || !mapUrl.trim()) return null;
  const str = mapUrl.trim();

  // If user pasted full iframe html tag
  const iframeMatch = str.match(/src=["']([^"']+)["']/i);
  if (iframeMatch) return iframeMatch[1];

  // If already an embed url
  if (str.includes("/maps/embed")) return str;

  // Check for place name in URL: /place/PlaceName
  const placeMatch = str.match(/\/place\/([^/@?]+)/i);
  if (placeMatch) {
    const place = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // Check for coordinates @lat,lng in URL
  const atCoords = str.match(/@([0-9.-]+),([0-9.-]+)/);
  if (atCoords) {
    return `https://maps.google.com/maps?q=${atCoords[1]},${atCoords[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // Check for query parameter q=
  const qMatch = str.match(/[?&]q=([^&]+)/i);
  if (qMatch) {
    const q = decodeURIComponent(qMatch[1].replace(/\+/g, " "));
    return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // Check for /search/Query
  const searchMatch = str.match(/\/search\/([^/@?]+)/i);
  if (searchMatch) {
    const sq = decodeURIComponent(searchMatch[1].replace(/\+/g, " "));
    return `https://maps.google.com/maps?q=${encodeURIComponent(sq)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // Check for raw coordinates e.g. "13.0827, 80.2707"
  const rawCoords = str.match(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/);
  if (rawCoords) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(str)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // For short links (e.g. maps.app.goo.gl or goo.gl/maps) or text
  const query = fallbackQuery || str;
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

function getMapLocationLabel(mapUrl, fallback) {
  if (!mapUrl) return fallback || "";
  const str = mapUrl.trim();
  const placeMatch = str.match(/\/place\/([^/@?]+)/i);
  if (placeMatch) return decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
  const atCoords = str.match(/@([0-9.-]+),([0-9.-]+)/);
  if (atCoords) return `Coordinates: ${atCoords[1]}, ${atCoords[2]}`;
  const qMatch = str.match(/[?&]q=([^&]+)/i);
  if (qMatch) return decodeURIComponent(qMatch[1].replace(/\+/g, " "));
  return fallback || "Venue Location";
}

// Default template presets
const PRESET_TOP_3 = [
  { position: "1st Prize 🥇", amount: 25000 },
  { position: "2nd Prize 🥈", amount: 12000 },
  { position: "3rd Prize 🥉", amount: 5000 },
];

const PRESET_TOP_4 = [
  { position: "1st Prize 🥇", amount: 35000 },
  { position: "2nd Prize 🥈", amount: 18000 },
  { position: "3rd Prize 🥉", amount: 8000 },
  { position: "4th Place 🎖️", amount: 4000 },
];

const PRESET_TOP_8 = [
  { position: "1st Prize 🥇", amount: 50000 },
  { position: "2nd Prize 🥈", amount: 25000 },
  { position: "3rd Prize 🥉", amount: 12000 },
  { position: "4th Prize", amount: 6000 },
  { position: "5th Prize", amount: 3000 },
  { position: "6th Prize", amount: 2000 },
  { position: "7th Prize", amount: 1000 },
  { position: "8th Prize", amount: 1000 },
];

const PRESET_SPECIAL = [
  { position: "1st Championship Trophy 🏆", amount: 30000 },
  { position: "Runner-Up Cup 🥈", amount: 15000 },
  { position: "Best Player of Tournament ⭐", amount: 5000 },
  { position: "Fair Play Team Award 🎖️", amount: 3000 },
];

const AddTournament = () => {
  const navigate = useNavigate();
  const { user, registerAdmin, login } = useAuth();

  const [sports, setSports] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Indian States & Districts loaded dynamically from Supabase
  const [allLocations, setAllLocations] = useState({});
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);

  // Tournament Basic Info
  const [formData, setFormData] = useState({
    name: "",
    sportId: "",
    location: "Chennai",
    address: "",
    pincode: "600003",
    state: "Tamil Nadu",
    district: "Chennai",
    groundName: "",
    mapUrl: "",
    date: "",
    lastRegistrationDate: "",
    entryFee: "1000",
    maxTeams: "16",
    description: "",
  });

  // Google Map Pinned Location Preview
  const fallbackAddressQuery = useMemo(() => {
    return [formData.groundName, formData.address, formData.location, formData.district, formData.state]
      .filter(Boolean)
      .join(", ");
  }, [formData.groundName, formData.address, formData.location, formData.district, formData.state]);

  const embedMapSrc = useMemo(() => {
    if (!formData.mapUrl || !formData.mapUrl.trim()) return null;
    return parseGoogleMapsEmbedUrl(formData.mapUrl, fallbackAddressQuery);
  }, [formData.mapUrl, fallbackAddressQuery]);

  const detectedLocationLabel = useMemo(() => {
    return getMapLocationLabel(formData.mapUrl, formData.groundName || formData.location);
  }, [formData.mapUrl, formData.groundName, formData.location]);

  const handleAutoFillMapFromAddress = () => {
    const venueQuery = [formData.groundName, formData.address, formData.location, formData.district, formData.state]
      .filter(Boolean)
      .join(", ");
    if (!venueQuery.trim()) {
      alert("Please enter Ground Name, Address, or City first to auto-pin from your venue address.");
      return;
    }
    const generatedUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueQuery)}`;
    setFormData((prev) => ({ ...prev, mapUrl: generatedUrl }));
  };

  // Prize Distribution
  // customPrizeValues preserves user custom edits when toggling presets or returning
  const [activePreset, setActivePreset] = useState("top3");
  const [customPrizeValues, setCustomPrizeValues] = useState({});
  const [prizes, setPrizes] = useState(PRESET_TOP_3);

  // Organizer Admin Account
  const [organizerUsername, setOrganizerUsername] = useState(
    user?.username && user.username !== "admin" ? user.username : ""
  );
  const [organizerPassword, setOrganizerPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 1. Fetch Sports and Indian Locations from Supabase
  useEffect(() => {
    let isMounted = true;

    // Load sports from Supabase
    getSports().then((data) => {
      if (isMounted && data && data.length > 0) {
        setSports(data);
        setFormData((prev) => ({
          ...prev,
          sportId: prev.sportId || String(data[0].id),
        }));
      }
    });

    // Load States and Districts from Supabase table / live tournament database
    getIndianLocationsFromSupabase().then((locs) => {
      if (!isMounted) return;
      setAllLocations(locs);
      const states = getAvailableStates();
      setStatesList(states);
      setLocationsLoading(false);

      // Default state & district (Tamil Nadu -> Chennai)
      const defaultState = "Tamil Nadu";
      const dists = locs[defaultState] || getDistrictsForState(defaultState);
      setDistrictsList(dists);

      setFormData((prev) => ({
        ...prev,
        state: prev.state || defaultState,
        district: prev.district || (dists.length > 0 ? dists[0] : "Chennai"),
        location: prev.location || "Chennai",
      }));
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle State selection change -> dynamically loads district dropdown
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    const dists = allLocations[selectedState] || getDistrictsForState(selectedState);
    setDistrictsList(dists);

    const defaultDist = dists.length > 0 ? dists[0] : "";
    setFormData((prev) => ({
      ...prev,
      state: selectedState,
      district: defaultDist,
      location: defaultDist ? defaultDist.split(" ")[0] : prev.location,
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // =========================================================================
  // PRIZE DISTRIBUTION LOGIC (PRESERVES EDITS ACROSS PRESET TOGGLES)
  // =========================================================================
  const handlePrizeChange = (index, field, value) => {
    setPrizes((prev) => {
      const updated = [...prev];
      const tier = { ...updated[index] };

      if (field === "amount") {
        const numVal = Math.max(0, Number(value) || 0);
        tier.amount = numVal;
        // Cache user custom edit for this prize tier position so it's never lost!
        setCustomPrizeValues((cache) => ({
          ...cache,
          [tier.position]: numVal,
        }));
      } else {
        tier.position = value;
      }

      updated[index] = tier;
      return updated;
    });
  };

  const handleRemovePrize = (index) => {
    if (prizes.length <= 1) return;
    setPrizes((prev) => prev.filter((_, i) => i !== index));
  };

  // Applies preset while strictly preserving any user-customized amounts
  const applyPrizePreset = (type) => {
    setActivePreset(type);
    let baseList = PRESET_TOP_3;
    if (type === "top4") baseList = PRESET_TOP_4;
    if (type === "top8") baseList = PRESET_TOP_8;
    if (type === "special") baseList = PRESET_SPECIAL;

    // Merge template with user's customized values
    const merged = baseList.map((tier) => {
      const savedCustomAmount = customPrizeValues[tier.position];
      return {
        position: tier.position,
        amount: typeof savedCustomAmount === "number" ? savedCustomAmount : tier.amount,
      };
    });

    setPrizes(merged);
  };

  const totalPrizeCalculated = prizes.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  // =========================================================================
  // PASSWORD STRENGTH & VALIDATION LOGIC
  // =========================================================================
  const passwordCriteria = useMemo(() => {
    const pass = organizerPassword;
    return {
      minLength: pass.length >= 8,
      hasUpper: /[A-Z]/.test(pass),
      hasLower: /[a-z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass),
    };
  }, [organizerPassword]);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.minLength) score += 1;
    if (passwordCriteria.hasUpper) score += 1;
    if (passwordCriteria.hasLower) score += 1;
    if (passwordCriteria.hasNumber) score += 1;
    if (passwordCriteria.hasSpecial) score += 1;
    return score;
  }, [passwordCriteria]);

  const passwordStrengthMeta = useMemo(() => {
    if (!organizerPassword) {
      return { label: "Required", color: "#64748b", percent: 0, badge: "neutral" };
    }
    if (passwordScore <= 2) {
      return { label: "Weak", color: "#ef4444", percent: 25, badge: "weak" };
    }
    if (passwordScore === 3) {
      return { label: "Fair", color: "#f97316", percent: 55, badge: "fair" };
    }
    if (passwordScore === 4) {
      return { label: "Good", color: "#f59e0b", percent: 80, badge: "good" };
    }
    return { label: "Strong", color: "#10b981", percent: 100, badge: "strong" };
  }, [organizerPassword, passwordScore]);

  const passwordsMatch = Boolean(
    confirmPassword && organizerPassword && confirmPassword === organizerPassword
  );
  const passwordsMismatch = Boolean(
    confirmPassword && organizerPassword && confirmPassword !== organizerPassword
  );

  // =========================================================================
  // SUBMISSION HANDLER WITH RIGID VALIDATION & SUPABASE PERSISTENCE
  // =========================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Validate required fields
    if (!formData.name.trim()) {
      setError("Please enter the tournament name.");
      setLoading(false);
      return;
    }
    if (!formData.address.trim() || !formData.pincode.trim()) {
      setError("Please provide complete venue address and 6-digit area pincode.");
      setLoading(false);
      return;
    }
    if (!formData.state || !formData.district) {
      setError("Please select both State and District from the dropdowns.");
      setLoading(false);
      return;
    }
    if (!formData.date || !formData.lastRegistrationDate) {
      setError("Please select tournament match date and registration deadline.");
      setLoading(false);
      return;
    }

    // 2. RIGID ORGANIZER ADMIN ACCOUNT VALIDATION
    const finalUsername = organizerUsername.trim() || user?.username || "admin";
    if (!finalUsername) {
      setError("Please specify an organizer username for admin dashboard access.");
      setLoading(false);
      return;
    }

    // Check if password fields are provided or required
    if (organizerPassword || confirmPassword || !user) {
      if (!organizerPassword) {
        setError("Create Admin Password is required to secure your tournament.");
        setLoading(false);
        return;
      }

      if (organizerPassword.length < 8) {
        setError("Admin password must be at least 8 characters long for security.");
        setLoading(false);
        return;
      }

      if (passwordScore < 3) {
        setError(
          "Password is too weak. Please include a combination of uppercase letters, numbers, and special symbols."
        );
        setLoading(false);
        return;
      }

      if (!confirmPassword) {
        setError("Please re-type your password in Confirm Password.");
        setLoading(false);
        return;
      }

      if (organizerPassword !== confirmPassword) {
        setError("Passwords do not match. Please ensure both password fields match exactly.");
        setLoading(false);
        return;
      }

      // Register new tournament admin with backend session
      const authRes = await registerAdmin(
        finalUsername,
        organizerPassword.trim(),
        `${finalUsername}@sportsnest.app`,
        finalUsername
      );

      if (!authRes.success) {
        console.warn("Auth register notice:", authRes.error);
      }

      // Track new organizer persistently in localStorage registry
      try {
        const trackedKey = "sportsnest_tracked_organizers";
        const existing = JSON.parse(localStorage.getItem(trackedKey) || "[]");
        const newRecord = {
          username: finalUsername,
          role: "admin",
          tournamentName: formData.name.trim(),
          state: formData.state,
          district: formData.district,
          registeredAt: new Date().toISOString(),
          passwordStrength: passwordStrengthMeta.label,
        };
        const filtered = existing.filter((item) => item.username !== finalUsername);
        filtered.unshift(newRecord);
        localStorage.setItem(trackedKey, JSON.stringify(filtered));
      } catch (err) {
        console.warn("Notice: Organizer tracked in active session:", err);
      }
    }

    // 3. Prepare payload and insert into Supabase tournaments table
    const payload = {
      name: formData.name.trim(),
      sportId: Number(formData.sportId || 1),
      location: formData.location.trim() || formData.district,
      address: formData.address.trim(),
      pincode: formData.pincode.trim(),
      state: formData.state.trim(),
      district: formData.district.trim(),
      groundName: formData.groundName.trim() || `${formData.location} Arena`,
      mapUrl: formData.mapUrl?.trim() || undefined,
      date: formData.date,
      lastRegistrationDate: formData.lastRegistrationDate,
      entryFee: Number(formData.entryFee || 0),
      prizeAmount: totalPrizeCalculated,
      prizeBreakdown: prizes,
      maxTeams: Number(formData.maxTeams || 16),
      description: formData.description?.trim() || "Sanctioned sports tournament on SportsNest.",
      createdBy: finalUsername,
    };

    const res = await createTournament(payload);
    setLoading(false);

    if (res.success) {
      // Auto login organizer credentials if password provided
      if (organizerPassword) {
        try {
          await login(finalUsername, organizerPassword.trim());
        } catch (authErr) {
          console.warn("Direct login notice:", authErr);
        }
      }

      // Immediately navigate directly to the Admin Dashboard (Admin role)
      navigate("/admin", {
        replace: true,
        state: {
          createdTournamentName: formData.name.trim(),
          newlyCreated: true,
          adminUsername: finalUsername,
          tournamentId: res.data?.id,
        },
      });
      return;
    } else {
      setError(res.error || "Failed to create tournament in Supabase. Please try again.");
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (submitted && createdResult) {
    const successMapSrc = createdResult.mapUrl
      ? parseGoogleMapsEmbedUrl(
          createdResult.mapUrl,
          `${createdResult.groundName}, ${createdResult.district}, ${createdResult.state}`
        )
      : null;

    return (
      <div className="form-container" style={{ maxWidth: "680px", margin: "2rem auto" }}>
        <div
          className="success-message"
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            borderRadius: "16px",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.2)",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              fontSize: "2rem",
            }}
          >
            ✓
          </div>
          <h2 style={{ color: "#f8fafc", fontSize: "1.6rem", marginBottom: "0.5rem" }}>
            Tournament Created & Saved to Supabase!
          </h2>
          <p style={{ color: "#34d399", fontSize: "1.15rem", fontWeight: 700, margin: "0.25rem 0" }}>
            {createdResult.name}
          </p>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: "0.5rem 0 1.5rem" }}>
            📍 {createdResult.groundName}, {createdResult.district}, {createdResult.state} (PIN: {createdResult.pincode})
          </p>

          {/* Pinned Map Confirmation if provided */}
          {createdResult.mapUrl && successMapSrc && (
            <div
              style={{
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "12px",
                overflow: "hidden",
                marginBottom: "1.5rem",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  fontSize: "0.82rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Navigation size={14} style={{ color: "#38bdf8" }} />
                  <strong style={{ color: "#f8fafc" }}>Pinned Venue Location</strong>
                </div>
                <a
                  href={createdResult.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#38bdf8",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    textDecoration: "none",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  }}
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <div style={{ width: "100%", height: "200px" }}>
                <iframe
                  title="Confirmed Venue Map Pin"
                  src={successMapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: "block" }}
                  loading="lazy"
                  allowFullScreen=""
                />
              </div>
            </div>
          )}

          {/* Admin Credentials Notification */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "1.25rem",
              textAlign: "left",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <ShieldCheck size={18} style={{ color: "#10b981" }} />
              <strong style={{ color: "#f8fafc", fontSize: "0.95rem" }}>
                Organizer Admin Account Activated & Tracked
              </strong>
            </div>
            <div style={{ fontSize: "0.88rem", color: "#cbd5e1", lineHeight: 1.7 }}>
              <div>• <strong>Organizer Username:</strong> {createdResult.adminUsername}</div>
              <div>• <strong>Admin Privileges:</strong> Full bracket control, team approval & live scoring</div>
              <div>• <strong>Location Registered:</strong> {createdResult.district}, {createdResult.state}</div>
              <div>• <strong>Prize Tiers Saved:</strong> {createdResult.prizeBreakdown?.length || 0} award tiers (Total ₹{createdResult.prizeAmount.toLocaleString("en-IN")})</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/admin")}
              className="btn btn-primary"
              id="goto-admin-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#10b981",
                padding: "12px 24px",
                fontWeight: 700,
                cursor: "pointer",
                borderRadius: "10px",
                border: "none",
                color: "#ffffff",
              }}
            >
              <span>Go to Admin Dashboard</span>
              <ArrowRight size={18} />
            </button>
            <Link
              to="/tournaments"
              className="btn btn-secondary"
              style={{
                padding: "12px 20px",
                borderRadius: "10px",
                textDecoration: "none",
                color: "#f8fafc",
                background: "rgba(255, 255, 255, 0.08)",
              }}
            >
              View in Tournaments Arena
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container" style={{ maxWidth: "820px", margin: "2rem auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.75rem", color: "#f8fafc", margin: 0, fontWeight: 800 }}>
          Create & Host New Tournament
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginTop: "4px" }}>
          Publish your tournament, select from all Indian states & districts, customize prize tiers, and set up your admin credentials.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            color: "#fca5a5",
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, color: "#f87171" }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="tournament-form">
        {/* =====================================================================
            SECTION 1: TOURNAMENT IDENTITY & SPORT
            ===================================================================== */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Tournament Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g. Tamil Nadu Champions Trophy 2026"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="sportId">Sport Discipline *</label>
            <select
              id="sportId"
              name="sportId"
              value={formData.sportId}
              onChange={handleFormChange}
              required
            >
              {sports.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* =====================================================================
            SECTION 2: VENUE LOCATION & PINCODE FILTER FIELDS (Dynamic State & District Dropdowns)
            ===================================================================== */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            padding: "1.25rem",
            margin: "0.5rem 0 1.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
            <MapPin size={18} style={{ color: "#10b981" }} />
            <span style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.95rem" }}>
              Venue Location & Pincode Filter Fields
            </span>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: "2" }}>
              <label htmlFor="address">Detailed Street Address / Venue Road *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                placeholder="e.g. Jawaharlal Nehru Stadium Road, Periamet"
                required
              />
            </div>
            <div className="form-group" style={{ flex: "1" }}>
              <label htmlFor="pincode">Area Pincode (6 digits) *</label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleFormChange}
                placeholder="e.g. 600003"
                maxLength={6}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="groundName">Ground / Stadium Arena Name *</label>
              <input
                type="text"
                id="groundName"
                name="groundName"
                value={formData.groundName}
                onChange={handleFormChange}
                placeholder="e.g. Jawaharlal Nehru International Stadium"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">City / Town *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleFormChange}
                placeholder="e.g. Chennai"
                required
              />
            </div>
          </div>

          {/* DYNAMIC STATE & DISTRICT DROPDOWNS (Loaded from Supabase) */}
          <div className="form-row" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label htmlFor="state" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>State *</span>
                <span style={{ fontSize: "0.75rem", color: "#10b981" }}>India (All States)</span>
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleStateChange}
                disabled={locationsLoading}
                required
                style={{
                  width: "100%",
                  background: "rgba(10, 15, 29, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  color: "#f8fafc",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              >
                <option value="">-- Select State --</option>
                {statesList.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="district" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>District *</span>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  {districtsList.length} districts available
                </span>
              </label>
              <select
                id="district"
                name="district"
                value={formData.district}
                onChange={handleFormChange}
                disabled={!formData.state || districtsList.length === 0}
                required
                style={{
                  width: "100%",
                  background: "rgba(10, 15, 29, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  color: "#f8fafc",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              >
                <option value="">
                  {formData.state ? "-- Select District --" : "First choose a state"}
                </option>
                {districtsList.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* =====================================================================
              GOOGLE MAPS VENUE LOCATION URL & PINNED INTERACTIVE MAP PREVIEW
              ===================================================================== */}
          <div
            style={{
              marginTop: "1.25rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="form-group" style={{ marginBottom: "0.75rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "6px",
                }}
              >
                <label
                  htmlFor="mapUrl"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: 600,
                    color: "#f8fafc",
                    fontSize: "0.92rem",
                    margin: 0,
                  }}
                >
                  <Navigation size={16} style={{ color: "#38bdf8" }} />
                  <span>Google Maps Venue Location URL (Share Link or Place Link)</span>
                </label>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={handleAutoFillMapFromAddress}
                    style={{
                      background: "rgba(56, 189, 248, 0.12)",
                      border: "1px solid rgba(56, 189, 248, 0.35)",
                      color: "#38bdf8",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    title="Auto-generate Google Map query from current address"
                  >
                    <Sparkles size={12} />
                    <span>Auto-pin from Address</span>
                  </button>

                  {formData.mapUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, mapUrl: "" }))}
                      style={{
                        background: "rgba(239, 68, 68, 0.12)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#fca5a5",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      Clear URL
                    </button>
                  )}
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  id="mapUrl"
                  name="mapUrl"
                  value={formData.mapUrl}
                  onChange={handleFormChange}
                  placeholder="Paste Google Maps link (e.g. https://maps.app.goo.gl/... or https://www.google.com/maps/place/...)"
                  style={{
                    width: "100%",
                    background: "rgba(10, 15, 29, 0.8)",
                    border: formData.mapUrl
                      ? "1px solid rgba(56, 189, 248, 0.5)"
                      : "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    padding: "10px 12px 10px 38px",
                    color: "#f8fafc",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
                <MapPin
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: formData.mapUrl ? "#38bdf8" : "#94a3b8",
                  }}
                />
              </div>

              <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: "6px 0 0 2px" }}>
                Enter or paste any Google Maps share URL, place link, or coordinates. The interactive map below will instantly update and pin your exact stadium or ground entrance.
              </p>
            </div>

            {/* DOWN: SHOW THAT GOOGLE MAP LOCATION PINNED IF USER GIVES THE URL */}
            {formData.mapUrl && embedMapSrc ? (
              <div
                style={{
                  marginTop: "0.85rem",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid rgba(56, 189, 248, 0.4)",
                  background: "rgba(10, 15, 29, 0.95)",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.45)",
                }}
              >
                {/* Header status bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 14px",
                    background: "rgba(15, 23, 42, 0.95)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    fontSize: "0.82rem",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "9px",
                        height: "9px",
                        borderRadius: "50%",
                        background: "#10b981",
                        display: "inline-block",
                        boxShadow: "0 0 8px #10b981",
                      }}
                    />
                    <strong style={{ color: "#38bdf8" }}>Venue Location Pinned on Google Map</strong>
                    {detectedLocationLabel && (
                      <span
                        style={{
                          background: "rgba(56, 189, 248, 0.15)",
                          color: "#bae6fd",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                        }}
                      >
                        {detectedLocationLabel}
                      </span>
                    )}
                  </div>

                  <a
                    href={formData.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#38bdf8",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: "0.78rem",
                    }}
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                {/* Google Map iframe */}
                <div style={{ width: "100%", height: "270px", position: "relative", background: "#0b0f19" }}>
                  <iframe
                    title="Venue Google Map Pinned Location"
                    src={embedMapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0, display: "block" }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <div
                  style={{
                    padding: "6px 12px",
                    background: "rgba(15, 23, 42, 0.7)",
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <MapPin size={13} style={{ color: "#10b981" }} />
                  <span>
                    Location successfully pinned. Participants will be able to navigate directly to this ground.
                  </span>
                </div>
              </div>
            ) : (
              /* Helpful Empty state */
              <div
                style={{
                  marginTop: "0.85rem",
                  padding: "1.25rem 1rem",
                  borderRadius: "10px",
                  border: "1px dashed rgba(255, 255, 255, 0.15)",
                  background: "rgba(255, 255, 255, 0.02)",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(56, 189, 248, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#38bdf8",
                    marginBottom: "2px",
                  }}
                >
                  <MapPin size={20} />
                </div>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#e2e8f0" }}>
                  Interactive Google Map Preview
                </div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8", maxWidth: "460px" }}>
                  Paste a Google Maps URL above to show your venue location pinned on an interactive Google Map, or click <strong>Auto-pin from Address</strong> to generate one.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================================
            SECTION 3: SCHEDULE & ENTRY FEE
            ===================================================================== */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Tournament Match Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastRegistrationDate">Last Registration Date *</label>
            <input
              type="date"
              id="lastRegistrationDate"
              name="lastRegistrationDate"
              value={formData.lastRegistrationDate}
              onChange={handleFormChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="entryFee">Team Entry Fee (₹)</label>
            <input
              type="number"
              id="entryFee"
              name="entryFee"
              value={formData.entryFee}
              onChange={handleFormChange}
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="maxTeams">Maximum Teams Allowed</label>
            <input
              type="number"
              id="maxTeams"
              name="maxTeams"
              value={formData.maxTeams}
              onChange={handleFormChange}
              min="2"
              max="64"
              required
            />
          </div>
        </div>

        {/* =====================================================================
            SECTION 4: PRIZE DISTRIBUTION (1st to 8th & Special Awards)
            Total Prize Money removed from bottom, Add Another Tier button removed,
            and custom edited amounts are strictly preserved!
            ===================================================================== */}
        <div
          style={{
            background: "rgba(251, 191, 36, 0.04)",
            border: "1px solid rgba(251, 191, 36, 0.25)",
            borderRadius: "12px",
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Trophy size={18} style={{ color: "#fbbf24" }} />
              <span style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.95rem" }}>
                Prize Distribution (1st to 8th & Special Awards)
              </span>
            </div>

            {/* Presets with active indicators */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => applyPrizePreset("top3")}
                style={{
                  background:
                    activePreset === "top3"
                      ? "rgba(251, 191, 36, 0.25)"
                      : "rgba(255, 255, 255, 0.08)",
                  border: `1px solid ${
                    activePreset === "top3" ? "#fbbf24" : "rgba(255, 255, 255, 0.1)"
                  }`,
                  color: activePreset === "top3" ? "#fbbf24" : "#cbd5e1",
                  padding: "5px 11px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  fontWeight: activePreset === "top3" ? 700 : 500,
                  transition: "all 0.15s ease",
                }}
              >
                Top 3
              </button>
              <button
                type="button"
                onClick={() => applyPrizePreset("top4")}
                style={{
                  background:
                    activePreset === "top4"
                      ? "rgba(251, 191, 36, 0.25)"
                      : "rgba(255, 255, 255, 0.08)",
                  border: `1px solid ${
                    activePreset === "top4" ? "#fbbf24" : "rgba(255, 255, 255, 0.1)"
                  }`,
                  color: activePreset === "top4" ? "#fbbf24" : "#cbd5e1",
                  padding: "5px 11px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  fontWeight: activePreset === "top4" ? 700 : 500,
                  transition: "all 0.15s ease",
                }}
              >
                Top 4
              </button>
              <button
                type="button"
                onClick={() => applyPrizePreset("top8")}
                style={{
                  background:
                    activePreset === "top8"
                      ? "rgba(251, 191, 36, 0.25)"
                      : "rgba(255, 255, 255, 0.08)",
                  border: `1px solid ${
                    activePreset === "top8" ? "#fbbf24" : "rgba(255, 255, 255, 0.1)"
                  }`,
                  color: activePreset === "top8" ? "#fbbf24" : "#cbd5e1",
                  padding: "5px 11px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  fontWeight: activePreset === "top8" ? 700 : 500,
                  transition: "all 0.15s ease",
                }}
              >
                1st to 8th Places
              </button>
              <button
                type="button"
                onClick={() => applyPrizePreset("special")}
                style={{
                  background:
                    activePreset === "special"
                      ? "rgba(251, 191, 36, 0.25)"
                      : "rgba(255, 255, 255, 0.08)",
                  border: `1px solid ${
                    activePreset === "special" ? "#fbbf24" : "rgba(255, 255, 255, 0.1)"
                  }`,
                  color: activePreset === "special" ? "#fbbf24" : "#cbd5e1",
                  padding: "5px 11px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  fontWeight: activePreset === "special" ? 700 : 500,
                  transition: "all 0.15s ease",
                }}
              >
                + Special Awards
              </button>
            </div>
          </div>

          {/* Dynamic Prize Rows - edits preserved in customPrizeValues state */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {prizes.map((p, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="text"
                  value={p.position}
                  onChange={(e) => handlePrizeChange(idx, "position", e.target.value)}
                  placeholder="e.g. 1st Prize or Best Player"
                  style={{
                    flex: "2",
                    background: "rgba(10, 15, 29, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    color: "#f8fafc",
                    fontSize: "0.9rem",
                  }}
                  required
                />
                <div style={{ position: "relative", flex: "1.5" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#fbbf24",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    value={p.amount}
                    onChange={(e) => handlePrizeChange(idx, "amount", e.target.value)}
                    placeholder="Amount"
                    min="0"
                    style={{
                      width: "100%",
                      background: "rgba(10, 15, 29, 0.7)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "8px",
                      padding: "8px 12px 8px 24px",
                      color: "#f8fafc",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePrize(idx)}
                  disabled={prizes.length <= 1}
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "none",
                    color: prizes.length <= 1 ? "#64748b" : "#f87171",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    cursor: prizes.length <= 1 ? "not-allowed" : "pointer",
                  }}
                  title="Remove prize tier"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* =====================================================================
            SECTION 5: ORGANIZER ADMIN ACCOUNT (RIGID VALIDATION & ANIMATED STRENGTH)
            ===================================================================== */}
        <div
          style={{
            background: "rgba(56, 189, 248, 0.04)",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            borderRadius: "12px",
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
            <Lock size={18} style={{ color: "#38bdf8" }} />
            <span style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.95rem" }}>
              Organizer Admin Account
            </span>
          </div>

          <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1rem" }}>
            When you create this tournament, your account will be granted <strong>admin</strong> role
            to manage fixtures, teams, and tournament scoring in the Admin Dashboard.
          </p>

          <div className="form-row">
            <div className="form-group" style={{ flex: "1" }}>
              <label htmlFor="organizerUsername">Organizer Username *</label>
              <input
                type="text"
                id="organizerUsername"
                value={organizerUsername}
                onChange={(e) => setOrganizerUsername(e.target.value)}
                placeholder="e.g. tournament_director_1"
                required
              />
            </div>
          </div>

          {/* PASSWORD CREATION & CONFIRMATION FIELDS */}
          <div className="form-row" style={{ alignItems: "flex-start" }}>
            {/* Create Admin Password Field */}
            <div className="form-group" style={{ flex: "1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label htmlFor="organizerPassword">Create Admin Password *</label>
                {organizerPassword && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: passwordStrengthMeta.color,
                    }}
                  >
                    {passwordStrengthMeta.label}
                  </span>
                )}
              </div>

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="organizerPassword"
                  value={organizerPassword}
                  onChange={(e) => setOrganizerPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  style={{
                    width: "100%",
                    paddingRight: "40px",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Animated Password Strength Bar */}
              {organizerPassword && (
                <div style={{ marginTop: "6px" }}>
                  <div
                    style={{
                      width: "100%",
                      height: "5px",
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${passwordStrengthMeta.percent}%`,
                        backgroundColor: passwordStrengthMeta.color,
                        transition: "width 0.3s ease, background-color 0.3s ease",
                        boxShadow: `0 0 8px ${passwordStrengthMeta.color}88`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Requirement Checklist Badges */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px 8px",
                  marginTop: "8px",
                  fontSize: "0.72rem",
                }}
              >
                <span
                  style={{
                    color: passwordCriteria.minLength ? "#34d399" : "#94a3b8",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  {passwordCriteria.minLength ? "✓" : "○"} 8+ chars
                </span>
                <span
                  style={{
                    color: passwordCriteria.hasUpper ? "#34d399" : "#94a3b8",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  {passwordCriteria.hasUpper ? "✓" : "○"} Uppercase
                </span>
                <span
                  style={{
                    color: passwordCriteria.hasLower ? "#34d399" : "#94a3b8",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  {passwordCriteria.hasLower ? "✓" : "○"} Lowercase
                </span>
                <span
                  style={{
                    color: passwordCriteria.hasNumber ? "#34d399" : "#94a3b8",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  {passwordCriteria.hasNumber ? "✓" : "○"} Number
                </span>
                <span
                  style={{
                    color: passwordCriteria.hasSpecial ? "#34d399" : "#94a3b8",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  {passwordCriteria.hasSpecial ? "✓" : "○"} Symbol
                </span>
              </div>
            </div>

            {/* Confirm Password Field with Live Match Indicator */}
            <div className="form-group" style={{ flex: "1" }}>
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  required
                  style={{
                    width: "100%",
                    paddingRight: "40px",
                    boxSizing: "border-box",
                    borderColor: passwordsMismatch
                      ? "#ef4444"
                      : passwordsMatch
                      ? "#10b981"
                      : undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Match Status Feedback */}
              <div style={{ marginTop: "6px", minHeight: "20px" }}>
                {passwordsMatch && (
                  <span
                    style={{
                      color: "#34d399",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Check size={14} /> Passwords match
                  </span>
                )}
                {passwordsMismatch && (
                  <span
                    style={{
                      color: "#f87171",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <X size={14} /> Passwords do not match
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          id="create-tournament-submit-btn"
          style={{
            width: "100%",
            padding: "14px",
            fontSize: "1.05rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#ffffff",
            borderRadius: "10px",
            border: "none",
            cursor: loading ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
            transition: "all 0.2s ease",
          }}
        >
          {loading ? (
            <span>Publishing Tournament & Configuring Admin Access...</span>
          ) : (
            <>
              <span>Create Tournament & Continue to Admin</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddTournament;
