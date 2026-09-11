import React, { useState, useRef } from "react";
import { Download, Sparkles, Trophy, Calendar, MapPin, Award, CheckCircle, Plus, Shield, Users } from "lucide-react";
import { Tournament } from "../../services/dataService";
import { Sponsor, getSponsorsByTournamentId, addSponsor } from "../../services/sponsorsService";

interface TournamentPosterStudioProps {
  tournaments: Tournament[];
  selectedTournamentId?: number;
  onClose?: () => void;
}

export const TournamentPosterStudio: React.FC<TournamentPosterStudioProps> = ({
  tournaments,
  selectedTournamentId,
  onClose,
}) => {
  const [activeTourneyId, setActiveTourneyId] = useState<number>(
    selectedTournamentId || tournaments[0]?.id || 1
  );
  const [activeTemplate, setActiveTemplate] = useState<1 | 2 | 3>(1);
  const [showAddSponsorModal, setShowAddSponsorModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // New sponsor state
  const [newSponsorName, setNewSponsorName] = useState("");
  const [newSponsorTier, setNewSponsorTier] = useState<Sponsor["tier"]>("Title Sponsor");
  const [newSponsorContribution, setNewSponsorContribution] = useState("");
  const [newSponsorTagline, setNewSponsorTagline] = useState("");

  const currentTourney =
    tournaments.find((t) => t.id === activeTourneyId) || tournaments[0] || {
      id: 1,
      name: "SportsNest Championship Trophy",
      sportName: "Soccer",
      location: "Chennai",
      groundName: "Jawaharlal Nehru Stadium",
      date: "2026-03-25",
      lastRegistrationDate: "2026-03-20",
      entryFee: 1500,
      prizeAmount: 75000,
      maxTeams: 16,
      registeredTeams: 12,
    };

  const [sponsorsList, setSponsorsList] = useState<Sponsor[]>(() =>
    getSponsorsByTournamentId(currentTourney.id)
  );

  const handleTournamentChange = (id: number) => {
    setActiveTourneyId(id);
    setSponsorsList(getSponsorsByTournamentId(id));
  };

  const handleCreateSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSponsorName.trim()) return;

    const brandColors = ["#0284c7", "#dc2626", "#ea580c", "#059669", "#7c3aed"];
    const created = addSponsor({
      tournamentId: currentTourney.id,
      tournamentName: currentTourney.name,
      name: newSponsorName.trim(),
      tier: newSponsorTier,
      contribution: newSponsorContribution.trim() || "Sponsored Category Trophy & Kits",
      brandColor: brandColors[Math.floor(Math.random() * brandColors.length)],
      logoIcon: "🏆",
      tagline: newSponsorTagline.trim() || "Official Event Partner",
    });

    setSponsorsList((prev) => [created, ...prev]);
    setNewSponsorName("");
    setNewSponsorContribution("");
    setNewSponsorTagline("");
    setShowAddSponsorModal(false);
  };

  // High-Resolution HTML5 Canvas Poster Renderer
  const downloadPoster = async (templateId: 1 | 2 | 3) => {
    setIsDownloading(true);
    setDownloadSuccess(null);

    try {
      const width = 1080;
      const height = 1350;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const tourneyName = currentTourney.name || "Sports Championship";
      const ground = currentTourney.groundName || `${currentTourney.location} Arena`;
      const dateStr = currentTourney.date ? new Date(currentTourney.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "March 2026";
      const prizeFormatted = `₹${(currentTourney.prizeAmount || 50000).toLocaleString()}`;
      const entryFeeFormatted = `₹${(currentTourney.entryFee || 1000).toLocaleString()}`;

      if (templateId === 1) {
        // TEMPLATE 1: Championship Broadcast Stadium (Deep Navy & Gold)
        const bgGrad = ctx.createRadialGradient(width / 2, height / 3, 50, width / 2, height / 2, 700);
        bgGrad.addColorStop(0, "#172554");
        bgGrad.addColorStop(0.6, "#090d1a");
        bgGrad.addColorStop(1, "#02040a");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Gold border frame
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 14;
        ctx.strokeRect(30, 30, width - 60, height - 60);

        // Inner subtle border
        ctx.strokeStyle = "rgba(251, 191, 36, 0.35)";
        ctx.lineWidth = 2;
        ctx.strokeRect(45, 45, width - 90, height - 90);

        // Header Tag
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 28px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("★ OFFICIAL STATE SANCTIONED TOURNAMENT ★", width / 2, 100);

        // Tournament Title
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 52px 'Inter', sans-serif";
        wrapText(ctx, tourneyName.toUpperCase(), width / 2, 180, width - 180, 60);

        // Sport & Location Pill
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        roundRect(ctx, width / 2 - 250, 300, 500, 56, 28, true, false);
        ctx.fillStyle = "#93c5fd";
        ctx.font = "bold 26px 'Inter', sans-serif";
        ctx.fillText(`🏆 ${currentTourney.sportName || "Sports"} • 📍 ${currentTourney.location}`, width / 2, 338);

        // Giant Prize Pool Box
        const prizeBoxGrad = ctx.createLinearGradient(120, 390, width - 120, 580);
        prizeBoxGrad.addColorStop(0, "rgba(245, 158, 11, 0.2)");
        prizeBoxGrad.addColorStop(1, "rgba(217, 119, 6, 0.05)");
        ctx.fillStyle = prizeBoxGrad;
        roundRect(ctx, 100, 390, width - 200, 200, 24, true, false);
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 4;
        roundRect(ctx, 100, 390, width - 200, 200, 24, false, true);

        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 32px 'Inter', sans-serif";
        ctx.fillText("TOTAL GRAND PRIZE POOL", width / 2, 445);

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 84px 'Inter', sans-serif";
        ctx.fillText(prizeFormatted, width / 2, 545);

        // Match Day & Ground details
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 34px 'Inter', sans-serif";
        ctx.fillText(`📅 MATCH DAY: ${dateStr.toUpperCase()}`, width / 2, 650);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "500 28px 'Inter', sans-serif";
        ctx.fillText(`📍 Arena: ${ground}`, width / 2, 700);

        // Registration & Slot details
        ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
        roundRect(ctx, 150, 750, width - 300, 90, 16, true, false);
        ctx.fillStyle = "#34d399";
        ctx.font = "bold 30px 'Inter', sans-serif";
        ctx.fillText(`TEAM ENTRY FEE: ${entryFeeFormatted} • SLOTS: ${currentTourney.maxTeams || 16} TEAMS ONLY`, width / 2, 805);

        // SPONSORS MENTIONS SECTION
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 26px 'Inter', sans-serif";
        ctx.fillText("OFFICIAL EVENT SPONSORS & PARTNERS", width / 2, 895);

        // Draw sponsors
        const activeSponsors = sponsorsList.slice(0, 3);
        const colWidth = (width - 160) / Math.max(1, activeSponsors.length);
        activeSponsors.forEach((sp, i) => {
          const x = 80 + i * colWidth + colWidth / 2;
          ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
          roundRect(ctx, 80 + i * colWidth + 10, 925, colWidth - 20, 140, 14, true, false);

          ctx.fillStyle = "#fbbf24";
          ctx.font = "bold 20px 'Inter', sans-serif";
          ctx.fillText(sp.tier.toUpperCase(), x, 960);

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 24px 'Inter', sans-serif";
          ctx.fillText(sp.name, x, 995);

          ctx.fillStyle = "#94a3b8";
          ctx.font = "500 17px 'Inter', sans-serif";
          ctx.fillText(sp.contribution.slice(0, 28), x, 1030);
        });

        // Footer Registration Deadline Call-to-Action
        ctx.fillStyle = "#ef4444";
        roundRect(ctx, 100, 1110, width - 200, 110, 20, true, false);
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 36px 'Inter', sans-serif";
        ctx.fillText("REGISTER ONLINE AT SPORTSNEST", width / 2, 1165);
        ctx.font = "bold 22px 'Inter', sans-serif";
        ctx.fillText(`Last Date to Register: ${currentTourney.lastRegistrationDate || "Hurry!"}`, width / 2, 1200);

      } else if (templateId === 2) {
        // TEMPLATE 2: Modern Dynamic Arena / VS Showdown (Crimson & Cyan Neon)
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, "#090d16");
        bgGrad.addColorStop(0.5, "#0b132b");
        bgGrad.addColorStop(1, "#1c0a24");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Neon border
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 8;
        ctx.strokeRect(35, 35, width - 70, height - 70);

        ctx.fillStyle = "#f43f5e";
        ctx.font = "900 30px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("⚡ SPORTSNEST ARENA SHOWDOWN ⚡", width / 2, 105);

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 56px 'Inter', sans-serif";
        wrapText(ctx, tourneyName.toUpperCase(), width / 2, 180, width - 180, 62);

        // Confrontation VS Graphic Banner
        const vsGrad = ctx.createLinearGradient(100, 280, width - 100, 480);
        vsGrad.addColorStop(0, "#e11d48");
        vsGrad.addColorStop(1, "#2563eb");
        ctx.fillStyle = vsGrad;
        roundRect(ctx, 80, 280, width - 160, 200, 24, true, false);

        ctx.fillStyle = "#ffffff";
        ctx.font = "italic 900 90px 'Inter', sans-serif";
        ctx.fillText("VS", width / 2, 405);

        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 28px 'Inter', sans-serif";
        ctx.fillText("TOP SQUADS COMPETING FOR GLORY", width / 2, 455);

        // Prize & Date Cards Row
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        roundRect(ctx, 80, 520, 440, 160, 20, true, false);
        roundRect(ctx, 560, 520, 440, 160, 20, true, false);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 24px 'Inter', sans-serif";
        ctx.fillText("GRAND PRIZE POOL", 300, 565);
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 54px 'Inter', sans-serif";
        ctx.fillText(prizeFormatted, 300, 640);

        ctx.fillStyle = "#f43f5e";
        ctx.font = "bold 24px 'Inter', sans-serif";
        ctx.fillText("MATCH DATE", 780, 565);
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 40px 'Inter', sans-serif";
        ctx.fillText(dateStr, 780, 635);

        // Arena & Entry
        ctx.fillStyle = "#f1f5f9";
        ctx.font = "bold 30px 'Inter', sans-serif";
        ctx.fillText(`📍 ${ground}, ${currentTourney.location}`, width / 2, 730);

        ctx.fillStyle = "#10b981";
        ctx.font = "bold 28px 'Inter', sans-serif";
        ctx.fillText(`Entry Fee: ${entryFeeFormatted} per team • Max ${currentTourney.maxTeams} Teams`, width / 2, 775);

        // Sponsors
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 24px 'Inter', sans-serif";
        ctx.fillText("OFFICIALLY POWERED & SPONSORED BY", width / 2, 850);

        sponsorsList.slice(0, 2).forEach((sp, idx) => {
          const y = 880 + idx * 95;
          ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
          roundRect(ctx, 120, y, width - 240, 75, 14, true, false);
          ctx.fillStyle = "#fbbf24";
          ctx.font = "bold 22px 'Inter', sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(`🏅 ${sp.tier}: ${sp.name}`, 150, y + 45);
          ctx.fillStyle = "#38bdf8";
          ctx.textAlign = "right";
          ctx.font = "500 20px 'Inter', sans-serif";
          ctx.fillText(sp.contribution.slice(0, 30), width - 150, y + 45);
          ctx.textAlign = "center";
        });

        // Call to action button
        ctx.fillStyle = "#2563eb";
        roundRect(ctx, 100, 1100, width - 200, 120, 24, true, false);
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 38px 'Inter', sans-serif";
        ctx.fillText("SCAN OR VISIT TO REGISTER TEAM", width / 2, 1160);
        ctx.fillStyle = "#93c5fd";
        ctx.font = "500 22px 'Inter', sans-serif";
        ctx.fillText(`Registration Deadline: ${currentTourney.lastRegistrationDate || "Immediate"}`, width / 2, 1195);

      } else {
        // TEMPLATE 3: Official Tournament Sanction Notice (Clean High-Contrast White & Navy)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // Elegant official dark navy border
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 12;
        ctx.strokeRect(35, 35, width - 70, height - 70);

        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.strokeRect(48, 48, width - 96, height - 96);

        // Header Crest / Authority
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 26px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SPORTSNEST FEDERATION SANCTION NOTICE", width / 2, 100);

        ctx.font = "900 48px 'Inter', sans-serif";
        wrapText(ctx, tourneyName, width / 2, 175, width - 200, 58);

        ctx.fillStyle = "#059669";
        ctx.font = "bold 26px 'Inter', sans-serif";
        ctx.fillText(`Official ${currentTourney.sportName || "Sports"} Championship • ${currentTourney.location}`, width / 2, 280);

        // Table Box for Tournament Facts
        ctx.fillStyle = "#f8fafc";
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2;
        roundRect(ctx, 80, 320, width - 160, 420, 16, true, true);

        const rows = [
          ["Venue Ground:", ground],
          ["Full Address:", `${currentTourney.address || ground}, ${currentTourney.district || currentTourney.location}, PIN: ${currentTourney.pincode || "600001"}`],
          ["Match Date:", dateStr],
          ["Registration Closes:", currentTourney.lastRegistrationDate || "2 Days Prior"],
          ["Grand Prize Pool:", prizeFormatted],
          ["Entry Fee per Team:", entryFeeFormatted],
          ["Tournament Draw:", `${currentTourney.maxTeams || 16} Knockout / Group Stages`],
        ];

        rows.forEach((r, i) => {
          const y = 370 + i * 54;
          ctx.fillStyle = "#475569";
          ctx.font = "bold 22px 'Inter', sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(r[0], 120, y);

          ctx.fillStyle = "#0f172a";
          ctx.font = "600 22px 'Inter', sans-serif";
          ctx.fillText(r[1].slice(0, 48), 380, y);
        });

        ctx.textAlign = "center";

        // Sponsored Prizes breakdown table
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 26px 'Inter', sans-serif";
        ctx.fillText("OFFICIAL SPONSORS & PRIZE CONTRIBUTORS", width / 2, 800);

        sponsorsList.slice(0, 3).forEach((sp, idx) => {
          const y = 835 + idx * 80;
          ctx.fillStyle = "#f1f5f9";
          roundRect(ctx, 80, y, width - 160, 68, 12, true, false);

          ctx.fillStyle = "#0f172a";
          ctx.font = "bold 22px 'Inter', sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(`★ ${sp.tier}: ${sp.name}`, 110, y + 42);

          ctx.fillStyle = "#059669";
          ctx.font = "bold 20px 'Inter', sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(sp.contribution.slice(0, 35), width - 110, y + 42);
          ctx.textAlign = "center";
        });

        // Bottom Certification Seal
        ctx.fillStyle = "#0f172a";
        roundRect(ctx, 80, 1110, width - 160, 110, 16, true, false);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 28px 'Inter', sans-serif";
        ctx.fillText("FOR TEAM REGISTRATIONS & FIXTURES", width / 2, 1158);
        ctx.font = "500 20px 'Inter', sans-serif";
        ctx.fillText("Visit sportsnest.app/tournaments or contact Tournament Admin", width / 2, 1192);
      }

      // Trigger high-res file download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const safeName = tourneyName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      link.download = `${safeName}_poster_template_${templateId}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(`Poster template #${templateId} downloaded successfully!`);
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (err) {
      console.warn("Poster generation error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Canvas helper functions
  function wrapText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(" ");
    let line = "";
    let curY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, curY);
        line = words[n] + " ";
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, curY);
  }

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: boolean,
    stroke: boolean
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  return (
    <div className="dash-panel-card" style={{ marginBottom: "1.5rem" }} id="tournament-poster-studio">
      {/* Studio Header */}
      <div className="dash-panel-header" style={{ flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={20} color="#f59e0b" />
            <h2 className="dash-panel-title" style={{ margin: 0 }}>
              Tournament Poster Studio & Sponsors
            </h2>
          </div>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
            Generate & download high-res posters with sponsored prizes to share on social media, WhatsApp, and grounds.
          </p>
        </div>

        {/* Tournament Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <select
            value={activeTourneyId}
            onChange={(e) => handleTournamentChange(Number(e.target.value))}
            style={{
              padding: "0.5rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
              fontWeight: 600,
              background: "#ffffff",
              color: "#0f172a",
              maxWidth: "260px",
            }}
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddSponsorModal(true)}
            className="dash-btn-secondary-pill"
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.82rem", cursor: "pointer" }}
          >
            <Plus size={14} />
            <span>Add Sponsor</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #6ee7b7",
            color: "#065f46",
            padding: "0.6rem 1rem",
            borderRadius: "8px",
            fontSize: "0.85rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CheckCircle size={16} color="#059669" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Sponsors Mentions Table */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Official Event Sponsors & Sponsored Prizes
          </span>
          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
            {sponsorsList.length} Partner{sponsorsList.length !== 1 ? "s" : ""} Attached
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.75rem" }}>
          {sponsorsList.map((sp) => (
            <div
              key={sp.id}
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "8px",
                  background: `${sp.brandColor}15`,
                  border: `1px solid ${sp.brandColor}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  flexShrink: 0,
                }}
              >
                {sp.logoIcon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#0f172a" }}>{sp.name}</span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      background: "#e0f2fe",
                      color: "#0369a1",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "4px",
                    }}
                  >
                    {sp.tier}
                  </span>
                </div>
                <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.78rem", color: "#059669", fontWeight: 600 }}>
                  🎁 {sp.contribution}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 POSTER TEMPLATES GALLERY */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Select Poster Design Example to Download
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {([1, 2, 3] as const).map((tNum) => (
              <button
                key={tNum}
                onClick={() => setActiveTemplate(tNum)}
                style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: activeTemplate === tNum ? "1px solid #059669" : "1px solid #cbd5e1",
                  background: activeTemplate === tNum ? "#059669" : "#ffffff",
                  color: activeTemplate === tNum ? "#ffffff" : "#475569",
                }}
              >
                Example #{tNum}
              </button>
            ))}
          </div>
        </div>

        {/* Poster Previews Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {/* TEMPLATE 1 CARD */}
          <div
            style={{
              border: activeTemplate === 1 ? "2px solid #059669" : "1px solid #e2e8f0",
              borderRadius: "14px",
              overflow: "hidden",
              background: "#ffffff",
              boxShadow: activeTemplate === 1 ? "0 8px 20px rgba(5, 150, 105, 0.15)" : "none",
            }}
          >
            {/* Visual Poster Mockup 1 */}
            <div
              style={{
                background: "radial-gradient(circle at 50% 30%, #172554, #090d1a, #02040a)",
                color: "#ffffff",
                padding: "1.5rem",
                textAlign: "center",
                borderBottom: "1px solid #334155",
                position: "relative",
              }}
            >
              <div style={{ border: "2px solid #fbbf24", padding: "1.25rem", borderRadius: "10px" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#fbbf24", letterSpacing: "0.08em" }}>
                  ★ CHAMPIONSHIP BROADCAST POSTER ★
                </span>
                <h3 style={{ margin: "0.6rem 0", fontSize: "1.1rem", fontWeight: 900, color: "#ffffff" }}>
                  {currentTourney.name}
                </h3>
                <div
                  style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    border: "1px solid #f59e0b",
                    borderRadius: "8px",
                    padding: "0.5rem",
                    margin: "0.75rem 0",
                  }}
                >
                  <span style={{ fontSize: "0.72rem", color: "#fbbf24", fontWeight: 700 }}>GRAND PRIZE POOL</span>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#ffffff" }}>
                    ₹{(currentTourney.prizeAmount || 50000).toLocaleString()}
                  </div>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#93c5fd" }}>
                  📅 {currentTourney.date || "March 2026"} &bull; 📍 {currentTourney.groundName || currentTourney.location}
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.68rem", color: "#cbd5e1" }}>
                  Entry: ₹{currentTourney.entryFee} &bull; Slots: {currentTourney.maxTeams} Teams
                </div>
                <div style={{ marginTop: "0.75rem", borderTop: "1px dashed rgba(255,255,255,0.2)", paddingTop: "0.5rem", fontSize: "0.68rem", color: "#fbbf24" }}>
                  Sponsors: {sponsorsList.map((s) => s.name).slice(0, 2).join(", ")}
                </div>
              </div>
            </div>
            <div style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>Template 1: Championship Stadium</span>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Gold borders & stadium glow</p>
              </div>
              <button
                onClick={() => downloadPoster(1)}
                disabled={isDownloading}
                className="dash-btn-primary-pill"
                style={{ border: "none", cursor: "pointer", padding: "0.45rem 0.9rem", fontSize: "0.8rem" }}
              >
                <Download size={14} />
                <span>Download PNG</span>
              </button>
            </div>
          </div>

          {/* TEMPLATE 2 CARD */}
          <div
            style={{
              border: activeTemplate === 2 ? "2px solid #059669" : "1px solid #e2e8f0",
              borderRadius: "14px",
              overflow: "hidden",
              background: "#ffffff",
              boxShadow: activeTemplate === 2 ? "0 8px 20px rgba(5, 150, 105, 0.15)" : "none",
            }}
          >
            {/* Visual Poster Mockup 2 */}
            <div
              style={{
                background: "linear-gradient(135deg, #090d16 0%, #0b132b 50%, #1c0a24 100%)",
                color: "#ffffff",
                padding: "1.5rem",
                textAlign: "center",
                borderBottom: "1px solid #334155",
                position: "relative",
              }}
            >
              <div style={{ border: "2px solid #38bdf8", padding: "1.25rem", borderRadius: "10px" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 900, color: "#f43f5e", letterSpacing: "0.08em" }}>
                  ⚡ ARENA FIXTURE & SHOWDOWN ⚡
                </span>
                <h3 style={{ margin: "0.6rem 0", fontSize: "1.1rem", fontWeight: 900, color: "#ffffff" }}>
                  {currentTourney.name}
                </h3>
                <div
                  style={{
                    background: "linear-gradient(90deg, #e11d48, #2563eb)",
                    borderRadius: "8px",
                    padding: "0.4rem",
                    margin: "0.75rem 0",
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    fontStyle: "italic",
                  }}
                >
                  VS SHOWDOWN
                </div>
                <div style={{ display: "flex", justifyContent: "space-around", fontSize: "0.75rem", margin: "0.5rem 0" }}>
                  <div>
                    <span style={{ color: "#38bdf8", fontWeight: 700 }}>PRIZE</span>
                    <p style={{ margin: 0, fontWeight: 900 }}>₹{(currentTourney.prizeAmount || 50000).toLocaleString()}</p>
                  </div>
                  <div>
                    <span style={{ color: "#f43f5e", fontWeight: 700 }}>DATE</span>
                    <p style={{ margin: 0, fontWeight: 900 }}>{currentTourney.date || "Upcoming"}</p>
                  </div>
                </div>
                <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                  📍 {currentTourney.groundName || currentTourney.location}
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.68rem", color: "#38bdf8" }}>
                  Sponsored by {sponsorsList[0]?.name || "Decathlon & Red Bull"}
                </div>
              </div>
            </div>
            <div style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>Template 2: Modern Arena Fixture</span>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Neon VS showdown & modern typography</p>
              </div>
              <button
                onClick={() => downloadPoster(2)}
                disabled={isDownloading}
                className="dash-btn-primary-pill"
                style={{ border: "none", cursor: "pointer", padding: "0.45rem 0.9rem", fontSize: "0.8rem" }}
              >
                <Download size={14} />
                <span>Download PNG</span>
              </button>
            </div>
          </div>

          {/* TEMPLATE 3 CARD */}
          <div
            style={{
              border: activeTemplate === 3 ? "2px solid #059669" : "1px solid #e2e8f0",
              borderRadius: "14px",
              overflow: "hidden",
              background: "#ffffff",
              boxShadow: activeTemplate === 3 ? "0 8px 20px rgba(5, 150, 105, 0.15)" : "none",
            }}
          >
            {/* Visual Poster Mockup 3 */}
            <div
              style={{
                background: "#ffffff",
                color: "#0f172a",
                padding: "1.5rem",
                textAlign: "center",
                borderBottom: "1px solid #e2e8f0",
                position: "relative",
              }}
            >
              <div style={{ border: "2px solid #0f172a", padding: "1.25rem", borderRadius: "10px", background: "#f8fafc" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#059669", letterSpacing: "0.08em" }}>
                  OFFICIAL SANCTION NOTICE
                </span>
                <h3 style={{ margin: "0.6rem 0", fontSize: "1.1rem", fontWeight: 900, color: "#0f172a" }}>
                  {currentTourney.name}
                </h3>
                <div style={{ textAlign: "left", fontSize: "0.72rem", color: "#475569", margin: "0.75rem 0", lineHeight: 1.6 }}>
                  <div><strong>Venue:</strong> {currentTourney.groundName || currentTourney.location}</div>
                  <div><strong>Match Date:</strong> {currentTourney.date || "TBA"}</div>
                  <div><strong>Prize Pool:</strong> ₹{(currentTourney.prizeAmount || 50000).toLocaleString()}</div>
                  <div><strong>Entry Fee:</strong> ₹{currentTourney.entryFee}</div>
                </div>
                <div style={{ borderTop: "1px solid #cbd5e1", paddingTop: "0.4rem", fontSize: "0.68rem", color: "#059669", fontWeight: 700 }}>
                  Sponsored by {sponsorsList.map((s) => s.name).slice(0, 2).join(", ")}
                </div>
              </div>
            </div>
            <div style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>Template 3: Official Sanction</span>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Clean editorial circular sanction style</p>
              </div>
              <button
                onClick={() => downloadPoster(3)}
                disabled={isDownloading}
                className="dash-btn-primary-pill"
                style={{ border: "none", cursor: "pointer", padding: "0.45rem 0.9rem", fontSize: "0.8rem" }}
              >
                <Download size={14} />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Sponsor Modal */}
      {showAddSponsorModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.75rem",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
              Add Tournament Sponsor & Prize Mention
            </h3>

            <form onSubmit={handleCreateSponsor}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>
                  Sponsor / Brand Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Red Bull Energy / Decathlon Sports"
                  value={newSponsorName}
                  onChange={(e) => setNewSponsorName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>
                  Sponsor Tier
                </label>
                <select
                  value={newSponsorTier}
                  onChange={(e) => setNewSponsorTier(e.target.value as Sponsor["tier"])}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                  }}
                >
                  <option value="Title Sponsor">Title Sponsor 🥇</option>
                  <option value="Powered By">Powered By ⚡</option>
                  <option value="Kit Partner">Official Kit Partner 🎽</option>
                  <option value="Beverage Partner">Beverage / Hydration Partner 🥤</option>
                  <option value="Official Trophy Partner">Official Trophy Partner 🏆</option>
                </select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>
                  Sponsored Prize / Contribution *
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹50,000 Cash Prize + Trophy, Playing Kits for Finalists"
                  value={newSponsorContribution}
                  onChange={(e) => setNewSponsorContribution(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>
                  Tagline / Brand Slogan
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gives You Wings / Sports For All"
                  value={newSponsorTagline}
                  onChange={(e) => setNewSponsorTagline(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setShowAddSponsorModal(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dash-btn-primary-pill"
                  style={{ border: "none", cursor: "pointer", padding: "0.5rem 1.25rem" }}
                >
                  Save & Attach to Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
