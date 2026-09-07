import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Award,
  Layers,
  Repeat,
  CreditCard,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  Mail,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  MoreVertical,
  Plus,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  DollarSign,
  Filter,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getTournaments,
  getSports,
  getTotalTeamsCount,
  Tournament,
  Sport,
} from "../services/dataService";
import "../styles/admin-dashboard.css";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Currency converters & formatters
const CURRENCIES = {
  USD: { symbol: "$", rate: 1, label: "USD" },
  INR: { symbol: "₹", rate: 83.5, label: "INR" },
  EUR: { symbol: "€", rate: 0.92, label: "EUR" },
  GBP: { symbol: "£", rate: 0.78, label: "GBP" },
};

type CurrencyKey = keyof typeof CURRENCIES;

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Supabase Data State
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [totalTeamsExact, setTotalTeamsExact] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyKey>("USD");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [chartYear, setChartYear] = useState("2026");
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [activeBarIndex, setActiveBarIndex] = useState<number>(7); // Default to August (index 7) as in the reference image

  // Protect Dashboard: only accessible when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch live Supabase data
  useEffect(() => {
    let isMounted = true;
    async function fetchSupabaseData() {
      setLoading(true);
      setError(null);
      try {
        const [tourneysList, sportsList, exactTeams] = await Promise.all([
          getTournaments(),
          getSports(),
          getTotalTeamsCount(),
        ]);
        if (isMounted) {
          setTournaments(tourneysList);
          setSports(sportsList);
          setTotalTeamsExact(exactTeams);
        }
      } catch (err: any) {
        console.error("Failed to fetch live data from Supabase:", err);
        if (isMounted) {
          setError(err?.message || "Failed to load database records.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSupabaseData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Format money based on selected currency
  const formatMoney = (amountInUSD: number) => {
    const curr = CURRENCIES[selectedCurrency];
    const converted = amountInUSD * curr.rate;
    return (
      curr.symbol +
      converted.toLocaleString("en-US", {
        maximumFractionDigits: converted > 1000 ? 0 : 2,
        minimumFractionDigits: 0,
      })
    );
  };

  // Aggregated live calculations from Supabase
  const stats = useMemo(() => {
    const totalTourneys = tournaments.length;
    const totalPrizeUSD = tournaments.reduce((acc, t) => acc + (t.prizeAmount || 0), 0);
    const totalFeesUSD = tournaments.reduce(
      (acc, t) => acc + (t.entryFee || 0) * (t.registeredTeams || 0),
      0
    );
    const registeredTeamsSum = tournaments.reduce((acc, t) => acc + (t.registeredTeams || 0), 0);
    const maxTeamsSum = tournaments.reduce((acc, t) => acc + (t.maxTeams || 0), 0) || 1;

    // Unique venues
    const uniqueVenues = new Set(tournaments.map((t) => t.groundName).filter(Boolean));

    return {
      totalTourneys,
      totalPrizeUSD,
      totalFeesUSD,
      registeredTeamsSum,
      maxTeamsSum,
      capacityPercent: Math.min(100, Math.round((registeredTeamsSum / maxTeamsSum) * 100)),
      uniqueVenuesCount: uniqueVenues.size,
    };
  }, [tournaments]);

  // Calculate 12-month data from Supabase tournament dates
  const monthlyChartData = useMemo(() => {
    const monthlySums = Array(12).fill(0);
    const monthlyCounts = Array(12).fill(0);

    tournaments.forEach((t) => {
      if (t.date) {
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) {
          const m = d.getMonth();
          monthlySums[m] += t.prizeAmount || 0;
          monthlyCounts[m] += 1;
        }
      }
    });

    const maxVal = Math.max(...monthlySums, 1);

    return MONTH_NAMES.map((name, idx) => {
      const val = monthlySums[idx];
      const count = monthlyCounts[idx];
      // Normalize height to percentage between 15% and 95%
      const heightPercent = val > 0 ? Math.max(18, Math.round((val / maxVal) * 95)) : 20;
      return {
        month: name,
        index: idx,
        val,
        count,
        heightPercent,
      };
    });
  }, [tournaments]);

  // Top 4 sports cards with real counts from Supabase
  const topSportsCards = useMemo(() => {
    const sportIconMap: Record<string, string> = {
      Soccer: "⚽",
      Football: "⚽",
      Basketball: "🏀",
      Tennis: "🎾",
      Cricket: "🏏",
      Badminton: "🏸",
      Volleyball: "🏐",
      Baseball: "⚾",
      Kabaddi: "🤼",
    };

    return sports.slice(0, 4).map((s) => {
      const sportTourneys = tournaments.filter((t) => t.sportId === s.id);
      const totalPrize = sportTourneys.reduce((sum, t) => sum + (t.prizeAmount || 0), 0);
      return {
        id: s.id,
        name: s.name,
        icon: sportIconMap[s.name] || "🏆",
        tournamentsCount: sportTourneys.length,
        totalPrize,
        status: "Active",
      };
    });
  }, [sports, tournaments]);

  // Filtered recent tournaments
  const filteredTournaments = useMemo(() => {
    return tournaments
      .filter((t) => {
        if (statusFilter !== "all" && t.status !== statusFilter) return false;
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const sportName = sports.find((s) => s.id === t.sportId)?.name || "";
          return (
            t.name.toLowerCase().includes(q) ||
            t.location.toLowerCase().includes(q) ||
            sportName.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .slice(0, 6);
  }, [tournaments, sports, statusFilter, searchQuery]);

  // Export Supabase data as CSV
  const handleExportCSV = () => {
    if (tournaments.length === 0) return;
    const headers = "ID,Name,SportID,Location,Date,EntryFee,PrizeAmount,MaxTeams,RegisteredTeams,Status\n";
    const rows = tournaments
      .map(
        (t) =>
          `"${t.id}","${t.name.replace(/"/g, '""')}","${t.sportId}","${t.location}","${t.date}","${t.entryFee}","${t.prizeAmount}","${t.maxTeams}","${t.registeredTeams}","${t.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ArenaSync_Tournaments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="dash-outer-wrapper">
      <div className="dash-shell">
        {/* =========================================================
            LEFT SIDEBAR
            ========================================================= */}
        <aside className={`dash-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
          <div className="dash-sidebar-header">
            <Link to="/" className="dash-logo-block">
              <div className="dash-logo-icon">
                <span>⚡</span>
              </div>
              {!sidebarCollapsed && <span className="dash-logo-title">ArenaSync</span>}
            </Link>

            <button
              className="dash-collapse-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label="Toggle sidebar"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* MAIN MENU */}
          <div className="dash-nav-section">
            {!sidebarCollapsed && <div className="dash-nav-heading">MAIN MENU</div>}
            <ul className="dash-nav-list">
              <li>
                <button
                  className={`dash-nav-item ${selectedMenu === "dashboard" ? "active" : ""}`}
                  onClick={() => setSelectedMenu("dashboard")}
                >
                  <div className="dash-nav-left-part">
                    <LayoutDashboard size={18} />
                    {!sidebarCollapsed && <span>Dashboard</span>}
                  </div>
                </button>
              </li>

              <li>
                <Link
                  to="/tournaments"
                  className={`dash-nav-item ${selectedMenu === "tournaments" ? "active" : ""}`}
                  onClick={() => setSelectedMenu("tournaments")}
                >
                  <div className="dash-nav-left-part">
                    <Trophy size={18} />
                    {!sidebarCollapsed && <span>Tournaments</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="dash-nav-badge">{tournaments.length || "..."}</span>
                  )}
                </Link>
              </li>

              <li>
                <Link
                  to="/tournaments"
                  className={`dash-nav-item ${selectedMenu === "teams" ? "active" : ""}`}
                  onClick={() => setSelectedMenu("teams")}
                >
                  <div className="dash-nav-left-part">
                    <Users size={18} />
                    {!sidebarCollapsed && <span>Teams</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="dash-nav-badge">
                      {totalTeamsExact ? totalTeamsExact.toLocaleString() : stats.registeredTeamsSum}
                    </span>
                  )}
                </Link>
              </li>

              <li>
                <Link
                  to="/sports"
                  className={`dash-nav-item ${selectedMenu === "sports" ? "active" : ""}`}
                  onClick={() => setSelectedMenu("sports")}
                >
                  <div className="dash-nav-left-part">
                    <Award size={18} />
                    {!sidebarCollapsed && <span>Sports</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="dash-nav-badge">{sports.length || "11"}</span>
                  )}
                </Link>
              </li>
            </ul>
          </div>

          {/* FEATURES */}
          <div className="dash-nav-section">
            {!sidebarCollapsed && <div className="dash-nav-heading">FEATURES</div>}
            <ul className="dash-nav-list">
              <li>
                <Link to="/tournaments" className="dash-nav-item">
                  <div className="dash-nav-left-part">
                    <Repeat size={18} />
                    {!sidebarCollapsed && <span>Brackets</span>}
                  </div>
                  {!sidebarCollapsed && <span className="dash-nav-badge">16</span>}
                </Link>
              </li>

              <li>
                <Link to="/tournaments" className="dash-nav-item">
                  <div className="dash-nav-left-part">
                    <CreditCard size={18} />
                    {!sidebarCollapsed && <span>Registrations</span>}
                  </div>
                </Link>
              </li>

              <li>
                <Link to="/sports" className="dash-nav-item">
                  <div className="dash-nav-left-part">
                    <MessageSquare size={18} />
                    {!sidebarCollapsed && <span>Leaderboard</span>}
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          {/* GENERAL */}
          <div className="dash-nav-section">
            {!sidebarCollapsed && <div className="dash-nav-heading">GENERAL</div>}
            <ul className="dash-nav-list">
              <li>
                <Link to="/" className="dash-nav-item" title="Return to Main Website">
                  <div className="dash-nav-left-part">
                    <ExternalLink size={18} />
                    {!sidebarCollapsed && <span>Main Website</span>}
                  </div>
                </Link>
              </li>

              <li>
                <button className="dash-nav-item">
                  <div className="dash-nav-left-part">
                    <Settings size={18} />
                    {!sidebarCollapsed && <span>Settings</span>}
                  </div>
                </button>
              </li>

              <li>
                <button className="dash-nav-item">
                  <div className="dash-nav-left-part">
                    <HelpCircle size={18} />
                    {!sidebarCollapsed && <span>Help Desk</span>}
                  </div>
                </button>
              </li>

              <li>
                <button
                  className="dash-nav-item"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  title="Logout session"
                >
                  <div className="dash-nav-left-part" style={{ color: "#ef4444" }}>
                    <LogOut size={18} />
                    {!sidebarCollapsed && <span>Log out</span>}
                  </div>
                </button>
              </li>
            </ul>
          </div>

          {/* Bottom Upgrade Pro Banner */}
          {!sidebarCollapsed && (
            <div className="dash-upgrade-banner">
              <div className="dash-upgrade-title">
                <span>Upgrade Pro!</span>
                <span>👑</span>
              </div>
              <p className="dash-upgrade-desc">
                Higher productivity with better organization & automated brackets
              </p>
              <Link to="/add-tournament" className="dash-upgrade-btn">
                <span>👑 Add Tournament</span>
              </Link>
            </div>
          )}
        </aside>

        {/* =========================================================
            MAIN CONTENT AREA
            ========================================================= */}
        <main className="dash-main">
          {/* Top Header Row */}
          <div className="dash-top-header">
            <div className="dash-search-container">
              <Search size={18} className="dash-search-icon" />
              <input
                type="text"
                className="dash-search-input"
                placeholder="Search tournaments, sports, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="dash-search-kbd">⌘ K</span>
            </div>

            <div className="dash-header-actions">
              <button className="dash-icon-btn" title="Help & Documentation">
                <HelpCircle size={18} />
              </button>

              <button className="dash-icon-btn" title="Messages">
                <Mail size={18} />
                <span className="dash-icon-badge" />
              </button>

              <button className="dash-icon-btn" title="Notifications">
                <Bell size={18} />
                <span className="dash-icon-badge" />
              </button>

              <div
                className="dash-user-profile"
                onClick={() => navigate("/dashboard")}
                title="Active Account: admin123"
              >
                <div className="dash-avatar">
                  <span>A</span>
                </div>
                <div className="dash-user-meta">
                  <span className="dash-user-name">{user?.username || "admin123"}</span>
                </div>
                <ChevronDown size={14} color="#94a3b8" />
              </div>
            </div>
          </div>

          {/* Subheader: Welcome Message & Export Button */}
          <div className="dash-welcome-row">
            <div>
              <h1 className="dash-welcome-title">
                Welcome back {user?.name || "Sajibur Rahman" /* Or admin123 */}
              </h1>
              <p className="dash-welcome-sub">
                Monitor and control what happens with your tournaments and prize pools from Supabase.
              </p>
            </div>

            <div className="dash-welcome-right">
              <div className="dash-date-pill">
                <Calendar size={15} color="#059669" />
                <span>{todayFormatted}</span>
              </div>

              <button onClick={handleExportCSV} className="dash-export-btn" title="Export Supabase Tournaments to CSV">
                <Download size={15} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* =========================================================
              TOP 3 METRIC CARDS
              ========================================================= */}
          <div className="dash-top-metrics-grid">
            {/* CARD 1: Account Balance / Total Prize Pool */}
            <div className="dash-metric-card" style={{ background: "#ffffff" }}>
              <div>
                <div className="dash-metric-card-header">
                  <div className="dash-metric-title-group">
                    <div className="dash-metric-icon-box">
                      <DollarSign size={18} />
                    </div>
                    <span className="dash-metric-label">Total Prize Pool</span>
                  </div>

                  {/* Currency selector matching the UI */}
                  <select
                    className="dash-currency-badge"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value as CurrencyKey)}
                    title="Change Currency"
                  >
                    <option value="USD">🇺🇸 USD</option>
                    <option value="INR">🇮🇳 INR</option>
                    <option value="EUR">🇪🇺 EUR</option>
                    <option value="GBP">🇬🇧 GBP</option>
                  </select>
                </div>

                <div className="dash-metric-big-number">
                  {loading ? (
                    <div className="dash-skeleton-pulse" style={{ height: "40px", width: "200px" }} />
                  ) : (
                    formatMoney(stats.totalPrizeUSD)
                  )}
                </div>

                <div className="dash-trend-pill positive">
                  <span>+14.8% ↑ from last season</span>
                </div>
              </div>

              {/* Two Action buttons matching the image: Send Money & Request Money style */}
              <div className="dash-card-actions-row">
                <Link to="/add-tournament" className="dash-btn-primary-pill">
                  <ArrowUpRight size={16} />
                  <span>Create Tournament</span>
                </Link>

                <Link to="/tournaments" className="dash-btn-secondary-pill">
                  <ArrowDownLeft size={16} />
                  <span>Register Team</span>
                </Link>
              </div>
            </div>

            {/* CARD 2: Total Expenses / Entry Fees Collected */}
            <div className="dash-metric-card">
              <div>
                <div className="dash-metric-card-header">
                  <div className="dash-metric-title-group">
                    <div className="dash-metric-icon-box">
                      <TrendingUp size={18} />
                    </div>
                    <span className="dash-metric-label">Total Entry Fees</span>
                  </div>
                  <button className="dash-three-dots" title="Options">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="dash-metric-big-number">
                  {loading ? (
                    <div className="dash-skeleton-pulse" style={{ height: "40px", width: "160px" }} />
                  ) : (
                    formatMoney(stats.totalFeesUSD)
                  )}
                </div>

                <div className="dash-trend-pill negative">
                  <span>-2.1% ↓ from last month</span>
                </div>
              </div>
            </div>

            {/* CARD 3: Total Savings / Registered Teams */}
            <div className="dash-metric-card">
              <div>
                <div className="dash-metric-card-header">
                  <div className="dash-metric-title-group">
                    <div className="dash-metric-icon-box">
                      <Users size={18} />
                    </div>
                    <span className="dash-metric-label">Registered Teams</span>
                  </div>
                  <button className="dash-three-dots" title="Options">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="dash-metric-big-number">
                  {loading ? (
                    <div className="dash-skeleton-pulse" style={{ height: "40px", width: "140px" }} />
                  ) : (
                    stats.registeredTeamsSum.toLocaleString()
                  )}
                </div>

                <div className="dash-trend-pill positive">
                  <span>+4.5% ↑ from last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
              MIDDLE ROW: Top Sports (My Wallet style) & Overview Bar Chart
              ========================================================= */}
          <div className="dash-mid-grid">
            {/* LEFT: Top Sports (2x2 Grid styled like My Wallet) */}
            <div className="dash-panel-card">
              <div className="dash-panel-header">
                <h2 className="dash-panel-title">Tournaments by Sport</h2>
                <Link to="/sports" className="dash-add-btn">
                  <Plus size={14} />
                  <span>View All</span>
                </Link>
              </div>

              <div className="dash-wallet-grid">
                {loading ? (
                  Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="dash-wallet-card dash-skeleton-pulse"
                        style={{ height: "105px" }}
                      />
                    ))
                ) : topSportsCards.length > 0 ? (
                  topSportsCards.map((sport) => (
                    <div key={sport.id} className="dash-wallet-card">
                      <div className="dash-wallet-top">
                        <div className="dash-sport-badge">
                          <span className="dash-sport-icon">{sport.icon}</span>
                          <span>{sport.name}</span>
                        </div>
                        <button className="dash-three-dots" title="More">
                          <MoreVertical size={14} />
                        </button>
                      </div>
                      <div>
                        <p className="dash-wallet-val">
                          {sport.tournamentsCount} <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#64748b" }}>Tournaments</span>
                        </p>
                        <p className="dash-wallet-status">● {formatMoney(sport.totalPrize)} Prize Pool</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#64748b", fontSize: "0.9rem" }}>No sports registered yet.</p>
                )}
              </div>
            </div>

            {/* RIGHT: Overview Bar Chart */}
            <div className="dash-panel-card">
              <div className="dash-panel-header">
                <h2 className="dash-panel-title">Overview</h2>

                <div className="dash-chart-legend-group">
                  <div className="dash-legend-item">
                    <span className="dash-legend-dot" />
                    <span>Prize Pool</span>
                  </div>

                  <select
                    className="dash-chart-dropdown"
                    value={chartYear}
                    onChange={(e) => setChartYear(e.target.value)}
                  >
                    <option value="2026">This Year (2026)</option>
                    <option value="2025">Last Year (2025)</option>
                  </select>

                  <button className="dash-three-dots" title="More">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* 12-Month Bar Chart with Highlight and Tooltip */}
              <div className="dash-bars-canvas">
                {monthlyChartData.map((item, idx) => {
                  const isHighlighted = activeBarIndex === idx;
                  return (
                    <div
                      key={item.month}
                      className={`dash-bar-col ${isHighlighted ? "highlight" : ""}`}
                      onClick={() => setActiveBarIndex(idx)}
                    >
                      {/* Floating tooltip badge matching image on highlight */}
                      {isHighlighted && (
                        <div className="dash-bar-tooltip">
                          <span style={{ color: "#059669", marginRight: "4px" }}>●</span>
                          <span>
                            {item.month}: {formatMoney(item.val)}
                          </span>
                        </div>
                      )}

                      <div
                        className="dash-bar-tube"
                        style={{ height: `${item.heightPercent}%` }}
                        title={`${item.month}: ${item.count} tournaments, ${formatMoney(item.val)}`}
                      />
                      <span className="dash-bar-month">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =========================================================
              BOTTOM ROW: Capacity Goals (My Savings Plan) & Recent Tournaments
              ========================================================= */}
          <div className="dash-bottom-grid">
            {/* LEFT: Capacity & Targets (My Savings Plan style) */}
            <div className="dash-panel-card">
              <div className="dash-panel-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Sparkles size={18} color="#059669" />
                  <h2 className="dash-panel-title">Capacity & Targets</h2>
                </div>
                <button className="dash-three-dots" title="More">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="dash-goal-list">
                {/* Goal 1: Team Registration Capacity */}
                <div className="dash-goal-item">
                  <div className="dash-goal-header">
                    <div className="dash-goal-title-group">
                      <div className="dash-goal-icon-circle">
                        <Users size={16} />
                      </div>
                      <span className="dash-goal-name">Team Registration Goal</span>
                    </div>
                    <span className="dash-goal-percent">{stats.capacityPercent}%</span>
                  </div>
                  <div className="dash-goal-numbers">
                    {stats.registeredTeamsSum.toLocaleString()} / {stats.maxTeamsSum.toLocaleString()} Teams
                  </div>
                  <div className="dash-progress-track">
                    <div
                      className="dash-progress-fill"
                      style={{ width: `${stats.capacityPercent}%` }}
                    />
                  </div>
                </div>

                {/* Goal 2: Prize Pool Funding */}
                <div className="dash-goal-item">
                  <div className="dash-goal-header">
                    <div className="dash-goal-title-group">
                      <div className="dash-goal-icon-circle" style={{ background: "#fef3c7", color: "#d97706" }}>
                        <DollarSign size={16} />
                      </div>
                      <span className="dash-goal-name">Prize Pool Allocation</span>
                    </div>
                    <span className="dash-goal-percent">
                      {Math.min(100, Math.round((stats.totalFeesUSD / (stats.totalPrizeUSD || 1)) * 100))}%
                    </span>
                  </div>
                  <div className="dash-goal-numbers">
                    {formatMoney(stats.totalFeesUSD)} / {formatMoney(stats.totalPrizeUSD)} Collected
                  </div>
                  <div className="dash-progress-track">
                    <div
                      className="dash-progress-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((stats.totalFeesUSD / (stats.totalPrizeUSD || 1)) * 100)
                        )}%`,
                        background: "#d97706",
                      }}
                    />
                  </div>
                </div>

                {/* Goal 3: Venues & Stadiums */}
                <div className="dash-goal-item">
                  <div className="dash-goal-header">
                    <div className="dash-goal-title-group">
                      <div className="dash-goal-icon-circle" style={{ background: "#ede9fe", color: "#7c3aed" }}>
                        <Target size={16} />
                      </div>
                      <span className="dash-goal-name">Confirmed Stadium Venues</span>
                    </div>
                    <span className="dash-goal-percent">95%</span>
                  </div>
                  <div className="dash-goal-numbers">
                    {stats.uniqueVenuesCount} Active Stadiums Allocated
                  </div>
                  <div className="dash-progress-track">
                    <div
                      className="dash-progress-fill"
                      style={{ width: "95%", background: "#7c3aed" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Recent Tournaments (Recent Transactions style table) */}
            <div className="dash-panel-card">
              <div className="dash-panel-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Repeat size={18} color="#059669" />
                  <h2 className="dash-panel-title">Recent Tournaments</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <select
                    className="dash-chart-dropdown"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Filter: All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="post">Post/Completed</option>
                  </select>
                </div>
              </div>

              <div className="dash-table-wrap">
                <table className="dash-trans-table">
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>Date</th>
                      <th>Prize</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <tr key={i}>
                            <td colSpan={5}>
                              <div className="dash-skeleton-pulse" style={{ height: "35px", width: "100%" }} />
                            </td>
                          </tr>
                        ))
                    ) : filteredTournaments.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                          No tournaments match your search or filter.
                        </td>
                      </tr>
                    ) : (
                      filteredTournaments.map((t) => {
                        const sport = sports.find((s) => s.id === t.sportId);
                        const sportColors: Record<number, { bg: string; color: string; letter: string }> = {
                          1: { bg: "#e0f2fe", color: "#0284c7", letter: "⚽" },
                          2: { bg: "#fef3c7", color: "#d97706", letter: "🏀" },
                          3: { bg: "#dcfce7", color: "#16a34a", letter: "🎾" },
                          4: { bg: "#fee2e2", color: "#dc2626", letter: "🏏" },
                        };
                        const fallbackColor = sportColors[t.sportId] || {
                          bg: "#f1f5f9",
                          color: "#475569",
                          letter: "🏆",
                        };

                        return (
                          <tr key={t.id}>
                            <td>
                              <div className="dash-activity-col">
                                <div
                                  className="dash-activity-icon"
                                  style={{ background: fallbackColor.bg, color: fallbackColor.color }}
                                >
                                  {fallbackColor.letter}
                                </div>
                                <div className="dash-activity-text">
                                  <span className="dash-activity-title">{t.name}</span>
                                  <span className="dash-activity-sub">
                                    {sport?.name || "Tournament"} &bull; {t.location}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td style={{ color: "#64748b", whiteSpace: "nowrap" }}>
                              {t.date || "TBD"}
                            </td>
                            <td style={{ fontWeight: 700, color: "#0f172a" }}>
                              {formatMoney(t.prizeAmount)}
                            </td>
                            <td>
                              <span
                                className={`dash-status-pill ${
                                  t.status === "upcoming"
                                    ? "upcoming"
                                    : t.status === "live"
                                    ? "live"
                                    : "success"
                                }`}
                              >
                                {t.status === "post" || t.status === "completed"
                                  ? "✔ Success"
                                  : t.status === "live"
                                  ? "● Live"
                                  : "● Upcoming"}
                              </span>
                            </td>
                            <td>
                              <Link
                                to={`/tournament/${t.id}`}
                                className="dash-three-dots"
                                title="View Tournament Details"
                              >
                                <ExternalLink size={14} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
