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
  RefreshCw,
  Menu,
  X,
  Code,
  Copy,
  Check,
  Activity,
  Shield,
  ShieldAlert,
  Lock,
  UserCheck,
  AlertTriangle,
  Radio,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getTournaments,
  getSports,
  getTotalTeamsCount,
  Tournament,
  Sport,
} from "../services/dataService";
import { AdminTournamentsView } from "../components/admin/AdminTournamentsView";
import { AdminTeamsView } from "../components/admin/AdminTeamsView";
import { AdminSportsView } from "../components/admin/AdminSportsView";
import { AdminBracketsView } from "../components/admin/AdminBracketsView";
import { AdminRegistrationsView } from "../components/admin/AdminRegistrationsView";
import { AdminLeaderboardView } from "../components/admin/AdminLeaderboardView";
import { AdminCreateTournamentModal } from "../components/admin/AdminCreateTournamentModal";
import { AdminApprovalsView } from "../components/admin/AdminApprovalsView";
import { AdminLiveMatchesView } from "../components/admin/AdminLiveMatchesView";
import { AdminUsersView } from "../components/admin/AdminUsersView";
import { AdminProfileView } from "../components/admin/AdminProfileView";
import { AdminAuditLogView } from "../components/admin/AdminAuditLogView";
import { getPendingApprovalsCount } from "../services/approvalsService";
import { generateTodayMatches, LiveMatch } from "../services/matchesService";
import { TournamentCountdownWidget } from "../components/admin/TournamentCountdownWidget";
import { TournamentOverviewChart } from "../components/admin/TournamentOverviewChart";
import { BroadcastMatchCard } from "../components/admin/BroadcastMatchCard";
import { TournamentPosterStudio } from "../components/admin/TournamentPosterStudio";
import "../styles/admin-dashboard.css";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Currency converters & formatters (Default INR, with faithful 1:1 Supabase values)
const CURRENCIES = {
  INR: { symbol: "₹", rate: 1, label: "INR" },
  USD: { symbol: "$", rate: 0.012, label: "USD" },
  EUR: { symbol: "€", rate: 0.011, label: "EUR" },
  GBP: { symbol: "£", rate: 0.0094, label: "GBP" },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyKey>("INR");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [chartYear, setChartYear] = useState("2026");
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [activeBarIndex, setActiveBarIndex] = useState<number>(7);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamTournamentFilter, setTeamTournamentFilter] = useState<number | null>(null);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(4);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(true);
  const [roleNotice, setRoleNotice] = useState<string | null>(null);

  const isSuperAdmin = user?.role === "superadmin";

  // Protect Dashboard: only accessible when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch live Supabase data
  const fetchSupabaseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tourneysList, sportsList, exactTeams, pendingCount] = await Promise.all([
        getTournaments(),
        getSports(),
        getTotalTeamsCount(),
        getPendingApprovalsCount(),
      ]);
      setTournaments(tourneysList);
      setSports(sportsList);
      setTotalTeamsExact(exactTeams);
      setPendingApprovalsCount(pendingCount);
    } catch (err: any) {
      console.warn("Notice fetching live data from Supabase:", err);
      setError(err?.message || "Failed to load database records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupabaseData();
  }, []);

  // Today's matches generated from tournament schedules
  const todayMatches: LiveMatch[] = useMemo(() => {
    return generateTodayMatches(tournaments);
  }, [tournaments]);

  // Format money based on selected currency using real Supabase figures
  const formatMoney = (amount: number) => {
    const num = Number(amount) || 0;
    const curr = CURRENCIES[selectedCurrency] || CURRENCIES.INR;
    const converted = num * curr.rate;
    if (selectedCurrency === "INR") {
      return `₹${Math.round(converted).toLocaleString("en-IN")}`;
    }
    return (
      curr.symbol +
      converted.toLocaleString("en-US", {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      })
    );
  };

  // Aggregated live calculations from Supabase
  const stats = useMemo(() => {
    const totalTourneys = tournaments.length;
    const totalPrizeRaw = tournaments.reduce((acc, t) => acc + (t.prizeAmount || 0), 0);
    const totalFeesRaw = tournaments.reduce(
      (acc, t) => acc + (t.entryFee || 0) * (t.registeredTeams || 0),
      0
    );
    const registeredTeamsSum = tournaments.reduce((acc, t) => acc + (t.registeredTeams || 0), 0);
    const maxTeamsSum = tournaments.reduce((acc, t) => acc + (t.maxTeams || 0), 0) || 1;

    // Unique venues
    const uniqueVenues = new Set(tournaments.map((t) => t.groundName).filter(Boolean));

    // Prize pool allocation: (Total Entry Fees Collected / Total Prize Pool) * 100
    const prizePoolAllocationPercent =
      totalPrizeRaw > 0 ? Math.min(100, Math.round((totalFeesRaw / totalPrizeRaw) * 100)) : 0;

    return {
      totalTourneys,
      totalPrizeRaw,
      totalFeesRaw,
      registeredTeamsSum,
      maxTeamsSum,
      capacityPercent: Math.min(100, Math.round((registeredTeamsSum / maxTeamsSum) * 100)),
      prizePoolAllocationPercent,
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

  // Role-restricted tournaments: Super Admin sees all; Admin sees assigned tournaments only
  const visibleTournaments = useMemo(() => {
    if (isSuperAdmin) return tournaments;
    const username = (user?.username || "").toLowerCase();
    const email = (user?.email || "").toLowerCase();
    const assigned = tournaments.filter((t) => {
      const creator = (t.createdBy || "").toLowerCase();
      return (
        creator === username ||
        creator === email ||
        (username && creator.includes(username)) ||
        (email && creator.includes(email))
      );
    });
    return assigned.length > 0 ? assigned : tournaments.slice(0, 4);
  }, [isSuperAdmin, tournaments, user]);

  // Filtered recent tournaments supporting all statuses: upcoming, live, pending_approval, disputed, completed
  const filteredTournaments = useMemo(() => {
    return visibleTournaments
      .filter((t) => {
        if (statusFilter !== "all") {
          const s = (t.status || "").toLowerCase();
          if (statusFilter === "completed" || statusFilter === "success") {
            if (s !== "completed" && s !== "post" && s !== "success") return false;
          } else if (statusFilter === "pending_approval" || statusFilter === "pending") {
            if (s !== "pending_approval" && s !== "pending") return false;
          } else if (statusFilter === "disputed") {
            if (s !== "disputed") return false;
          } else if (s !== statusFilter) {
            return false;
          }
        }
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const sportName = sports.find((s) => s.id === t.sportId)?.name || "";
          return (
            t.name.toLowerCase().includes(q) ||
            t.location.toLowerCase().includes(q) ||
            (t.groundName && t.groundName.toLowerCase().includes(q)) ||
            (t.pincode && t.pincode.toLowerCase().includes(q)) ||
            sportName.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .slice(0, 8);
  }, [visibleTournaments, sports, statusFilter, searchQuery]);

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
    link.setAttribute("download", `SportsNest_Tournaments_${new Date().toISOString().slice(0, 10)}.csv`);
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
        {/* Mobile Drawer Overlay */}
        {mobileMenuOpen && (
          <div
            className="dash-mobile-overlay"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* =========================================================
            LEFT SIDEBAR
            ========================================================= */}
        <aside
          className={`dash-sidebar ${sidebarCollapsed ? "collapsed" : ""} ${
            mobileMenuOpen ? "mobile-open" : ""
          }`}
        >
          <div className="dash-sidebar-header">
            <button
              onClick={() => {
                setSelectedMenu("dashboard");
                setTeamTournamentFilter(null);
                setMobileMenuOpen(false);
              }}
              className="dash-logo-block"
              style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
              title="Dashboard Home"
            >
              <div className="dash-logo-icon">
                <span>⚡</span>
              </div>
              {!sidebarCollapsed && <span className="dash-logo-title">SportsNest</span>}
            </button>

            <button
              className="dash-collapse-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label="Toggle sidebar"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* ADMIN MENU */}
          <div className="dash-nav-section">
            {!sidebarCollapsed && <div className="dash-nav-heading">ADMIN MENU</div>}
            <ul className="dash-nav-list">
              <li>
                <button
                  className={`dash-nav-item ${selectedMenu === "dashboard" ? "active" : ""}`}
                  onClick={() => {
                    setSelectedMenu("dashboard");
                    setTeamTournamentFilter(null);
                    setMobileMenuOpen(false);
                  }}
                  id="admin-nav-dashboard"
                >
                  <div className="dash-nav-left-part">
                    <LayoutDashboard size={18} />
                    {!sidebarCollapsed && <span>Dashboard</span>}
                  </div>
                </button>
              </li>

              <li>
                <button
                  className={`dash-nav-item ${selectedMenu === "tournaments" ? "active" : ""}`}
                  onClick={() => {
                    setSelectedMenu("tournaments");
                    setTeamTournamentFilter(null);
                    setMobileMenuOpen(false);
                  }}
                  id="admin-nav-tournaments"
                  title={isSuperAdmin ? "Manage all tournaments" : "View and manage assigned tournaments"}
                >
                  <div className="dash-nav-left-part">
                    <Trophy size={18} />
                    {!sidebarCollapsed && <span>{isSuperAdmin ? "Tournaments" : "Tournaments (Assigned)"}</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="dash-nav-badge">
                      {isSuperAdmin ? tournaments.length : visibleTournaments.length}
                    </span>
                  )}
                </button>
              </li>

              <li>
                <button
                  className={`dash-nav-item ${selectedMenu === "teams" ? "active" : ""}`}
                  onClick={() => {
                    setSelectedMenu("teams");
                    setTeamTournamentFilter(null);
                    setMobileMenuOpen(false);
                  }}
                  id="admin-nav-teams"
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
                </button>
              </li>

              {/* NEW: Approvals Navigation Item (between Teams and Sports) with Red Count Badge */}
              <li>
                <button
                  className={`dash-nav-item ${selectedMenu === "approvals" ? "active" : ""}`}
                  onClick={() => {
                    setSelectedMenu("approvals");
                    setTeamTournamentFilter(null);
                    setMobileMenuOpen(false);
                  }}
                  id="admin-nav-approvals"
                  title="Review pending team registrations"
                >
                  <div className="dash-nav-left-part">
                    <UserCheck size={18} style={{ color: selectedMenu === "approvals" ? "#10b981" : "#f59e0b" }} />
                    {!sidebarCollapsed && <span>Approvals</span>}
                  </div>
                  {!sidebarCollapsed && pendingApprovalsCount > 0 && (
                    <span
                      style={{
                        background: "#ef4444",
                        color: "#ffffff",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "9999px",
                        lineHeight: 1,
                        animation: "pulse 2s infinite",
                      }}
                    >
                      {pendingApprovalsCount}
                    </span>
                  )}
                </button>
              </li>

              <li>
                <button
                  className={`dash-nav-item ${selectedMenu === "sports" ? "active" : ""}`}
                  onClick={() => {
                    setSelectedMenu("sports");
                    setTeamTournamentFilter(null);
                    setMobileMenuOpen(false);
                  }}
                  id="admin-nav-sports"
                >
                  <div className="dash-nav-left-part">
                    <Award size={18} />
                    {!sidebarCollapsed && <span>Sports</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="dash-nav-badge">{sports.length || "11"}</span>
                  )}
                </button>
              </li>

              {/* Live/Today's Matches Item */}
              <li>
                <button
                  className={`dash-nav-item ${selectedMenu === "matches" ? "active" : ""}`}
                  onClick={() => {
                    setSelectedMenu("matches");
                    setTeamTournamentFilter(null);
                    setMobileMenuOpen(false);
                  }}
                  id="admin-nav-matches"
                  title="View live and scheduled matches for today"
                >
                  <div className="dash-nav-left-part">
                    <Radio size={18} style={{ color: "#ef4444" }} />
                    {!sidebarCollapsed && <span>Live Matches</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span
                      style={{
                        background: "#fee2e2",
                        color: "#b91c1c",
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        padding: "0.15rem 0.45rem",
                        borderRadius: "4px",
                      }}
                    >
                      {todayMatches.filter((m) => m.status === "live").length} LIVE
                    </span>
                  )}
                </button>
              </li>

              {/* My Profile (Accessible to both Admin & Super Admin) */}
              <li>
                <button
                  className={`dash-nav-item ${selectedMenu === "profile" ? "active" : ""}`}
                  onClick={() => {
                    setSelectedMenu("profile");
                    setMobileMenuOpen(false);
                  }}
                  id="admin-nav-profile"
                >
                  <div className="dash-nav-left-part">
                    <Shield size={18} />
                    {!sidebarCollapsed && <span>My Profile</span>}
                  </div>
                </button>
              </li>
            </ul>
          </div>

          {/* SUPER ADMIN RESTRICTED SECTION */}
          <div className="dash-nav-section" style={{ marginTop: "0.5rem" }}>
            {!sidebarCollapsed && (
              <div
                className="dash-nav-heading"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: isSuperAdmin ? "#64748b" : "#94a3b8",
                }}
              >
                <span>SUPER ADMIN</span>
                {!isSuperAdmin && (
                  <span style={{ fontSize: "0.65rem", background: "#f1f5f9", padding: "0.1rem 0.35rem", borderRadius: "3px" }}>
                    LOCKED
                  </span>
                )}
              </div>
            )}

            <ul className="dash-nav-list">
              {/* User & Role Management */}
              <li>
                <button
                  className={`dash-nav-item ${selectedMenu === "users" ? "active" : ""}`}
                  onClick={() => {
                    if (isSuperAdmin) {
                      setSelectedMenu("users");
                      setMobileMenuOpen(false);
                      setRoleNotice(null);
                    } else {
                      setRoleNotice("User Management is restricted to Super Admin accounts.");
                      setTimeout(() => setRoleNotice(null), 4000);
                    }
                  }}
                  id="admin-nav-users"
                  style={{
                    opacity: isSuperAdmin ? 1 : 0.45,
                    cursor: isSuperAdmin ? "pointer" : "not-allowed",
                  }}
                  title={isSuperAdmin ? "Manage admin users & permissions" : "Super Admin Only"}
                >
                  <div className="dash-nav-left-part">
                    <Users size={18} />
                    {!sidebarCollapsed && <span>User Management</span>}
                  </div>
                  {!sidebarCollapsed && !isSuperAdmin && <Lock size={13} color="#94a3b8" />}
                </button>
              </li>

              {/* Audit Logs */}
              <li>
                <button
                  className={`dash-nav-item ${selectedMenu === "audit" ? "active" : ""}`}
                  onClick={() => {
                    if (isSuperAdmin) {
                      setSelectedMenu("audit");
                      setMobileMenuOpen(false);
                      setRoleNotice(null);
                    } else {
                      setRoleNotice("Audit Logs are restricted to Super Admin accounts.");
                      setTimeout(() => setRoleNotice(null), 4000);
                    }
                  }}
                  id="admin-nav-audit"
                  style={{
                    opacity: isSuperAdmin ? 1 : 0.45,
                    cursor: isSuperAdmin ? "pointer" : "not-allowed",
                  }}
                  title={isSuperAdmin ? "View system security & activity logs" : "Super Admin Only"}
                >
                  <div className="dash-nav-left-part">
                    <FileText size={18} />
                    {!sidebarCollapsed && <span>Audit Logs</span>}
                  </div>
                  {!sidebarCollapsed && !isSuperAdmin && <Lock size={13} color="#94a3b8" />}
                </button>
              </li>

              {/* System Settings & Telemetry */}
              <li>
                <button
                  className={`dash-nav-item ${selectedMenu === "settings" ? "active" : ""}`}
                  onClick={() => {
                    if (isSuperAdmin) {
                      setSelectedMenu("settings");
                      setMobileMenuOpen(false);
                      setRoleNotice(null);
                    } else {
                      setRoleNotice("Full system settings are restricted to Super Admin accounts.");
                      setTimeout(() => setRoleNotice(null), 4000);
                    }
                  }}
                  id="admin-nav-settings"
                  style={{
                    opacity: isSuperAdmin ? 1 : 0.45,
                    cursor: isSuperAdmin ? "pointer" : "not-allowed",
                  }}
                  title={isSuperAdmin ? "Database and system settings" : "Super Admin Only"}
                >
                  <div className="dash-nav-left-part">
                    <Settings size={18} />
                    {!sidebarCollapsed && <span>System Settings</span>}
                  </div>
                  {!sidebarCollapsed && !isSuperAdmin && <Lock size={13} color="#94a3b8" />}
                </button>
              </li>

              <li>
                <button
                  className="dash-nav-item"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  title="Logout and remove session token"
                  id="admin-nav-logout"
                >
                  <div className="dash-nav-left-part" style={{ color: "#ef4444" }}>
                    <LogOut size={18} />
                    {!sidebarCollapsed && <span style={{ color: "#ef4444", fontWeight: 600 }}>Logout</span>}
                  </div>
                </button>
              </li>
            </ul>
          </div>
        </aside>

        {/* =========================================================
            MAIN CONTENT AREA
            ========================================================= */}
        <main className="dash-main">
          {/* Top Header Row */}
          <div className="dash-top-header">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              className="dash-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              title="Open Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

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
              {/* Role Indicator Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: user?.role === "superadmin" ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.12)",
                  border: `1px solid ${user?.role === "superadmin" ? "rgba(245, 158, 11, 0.35)" : "rgba(16, 185, 129, 0.35)"}`,
                  color: user?.role === "superadmin" ? "#d97706" : "#059669",
                  padding: "0.45rem 0.8rem",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
                id="header-user-role-badge"
              >
                <span>{user?.role === "superadmin" ? "👑 Super Admin" : "🛡️ Admin"}</span>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="admin-btn-primary"
                style={{
                  padding: "0.45rem 0.9rem",
                  fontSize: "0.82rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <Plus size={15} />
                <span>+ Create Tournament</span>
              </button>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn-secondary"
                style={{
                  padding: "0.45rem 0.85rem",
                  fontSize: "0.82rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  borderRadius: "8px",
                  textDecoration: "none",
                }}
                title="Preview public customer site in new tab"
              >
                <ExternalLink size={14} />
                <span>Public Site ↗</span>
              </a>

              <button
                className="dash-icon-btn"
                onClick={() => fetchSupabaseData()}
                title="Refresh Supabase Database"
              >
                <RefreshCw size={18} />
              </button>

              {/* Notification Bell with unread dot and recent events dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  className="dash-icon-btn"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setHasUnreadNotifs(false);
                  }}
                  title="Notifications & System Alerts"
                  id="dash-notifications-bell"
                  style={{ position: "relative" }}
                >
                  <Bell size={18} />
                  {hasUnreadNotifs && (
                    <span
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#ef4444",
                        boxShadow: "0 0 0 2px #ffffff",
                      }}
                    />
                  )}
                </button>

                {showNotifications && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      width: "320px",
                      background: "#ffffff",
                      borderRadius: "10px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e2e8f0",
                      padding: "0.85rem",
                      zIndex: 100,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.75rem",
                        borderBottom: "1px solid #f1f5f9",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#0f172a" }}>
                        Recent Alerts & Events
                      </span>
                      <button
                        onClick={() => setShowNotifications(false)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 0 }}
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {/* 1. New Registration */}
                      <div
                        onClick={() => {
                          setSelectedMenu("teams");
                          setShowNotifications(false);
                        }}
                        style={{
                          padding: "0.5rem",
                          borderRadius: "6px",
                          background: "#eff6ff",
                          cursor: "pointer",
                          display: "flex",
                          gap: "0.5rem",
                        }}
                        id="notif-item-new-reg"
                      >
                        <Users size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <div>
                          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e40af" }}>
                            New Registration
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "#1d4ed8" }}>
                            Adyar United FC registered for Chennai Super Cup
                          </div>
                        </div>
                      </div>

                      {/* 2. Approval Needed */}
                      <div
                        onClick={() => {
                          setSelectedMenu("approvals");
                          setShowNotifications(false);
                        }}
                        style={{
                          padding: "0.5rem",
                          borderRadius: "6px",
                          background: "#fef3c7",
                          cursor: "pointer",
                          display: "flex",
                          gap: "0.5rem",
                        }}
                        id="notif-item-approval"
                      >
                        <UserCheck size={16} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <div>
                          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#92400e" }}>
                            Approval Needed
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "#b45309" }}>
                            {pendingApprovalsCount} team registrations awaiting sanction
                          </div>
                        </div>
                      </div>

                      {/* 3. Match Dispute */}
                      <div
                        onClick={() => {
                          setSelectedMenu("matches");
                          setShowNotifications(false);
                        }}
                        style={{
                          padding: "0.5rem",
                          borderRadius: "6px",
                          background: "#fff7ed",
                          cursor: "pointer",
                          display: "flex",
                          gap: "0.5rem",
                        }}
                        id="notif-item-dispute"
                      >
                        <AlertTriangle size={16} color="#ea580c" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <div>
                          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#9a3412" }}>
                            Match Dispute
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "#c2410c" }}>
                            Player eligibility protest filed in Cricket Semi-Final #4
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar with Role Indicator Badge */}
              <div
                className="dash-user-profile"
                id="right-corner-admin-profile"
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.6rem" }}
                onClick={() => setSelectedMenu("profile")}
                title="View Admin Profile & Permissions"
              >
                <div
                  className="dash-avatar"
                  style={{
                    background: user?.role === "superadmin" ? "#f59e0b" : "#059669",
                  }}
                >
                  <span>{user?.username?.charAt(0).toUpperCase() || "A"}</span>
                </div>
                <div className="dash-user-meta" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span className="dash-user-name">{user?.name || user?.username || "admin"}</span>
                  {/* Role indicator badge next to user avatar */}
                  <span
                    id="user-role-indicator-badge"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      padding: "0.1rem 0.5rem",
                      borderRadius: "9999px",
                      background: isSuperAdmin ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                      color: isSuperAdmin ? "#b45309" : "#065f46",
                      border: `1px solid ${isSuperAdmin ? "rgba(245, 158, 11, 0.4)" : "rgba(16, 185, 129, 0.4)"}`,
                    }}
                  >
                    {isSuperAdmin ? "Super Admin" : "Admin"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                id="right-corner-logout-btn"
                className="dash-logout-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.5rem 0.9rem",
                  borderRadius: "8px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                title="Logout and end admin session"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Role Restriction Notice Banner */}
          {roleNotice && (
            <div
              style={{
                padding: "0.75rem 1.25rem",
                background: "#fef3c7",
                borderBottom: "1px solid #fde68a",
                color: "#92400e",
                fontSize: "0.85rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Lock size={15} />
                <span>{roleNotice}</span>
              </div>
              <button
                onClick={() => setRoleNotice(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#92400e" }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* =========================================================
              DEDICATED SUB-VIEW SWITCHER
              Keeps admin inside the dedicated dashboard context!
              ========================================================= */}
          {selectedMenu === "tournaments" && (
            <AdminTournamentsView
              tournaments={visibleTournaments}
              sports={sports}
              formatMoney={formatMoney}
              onRefresh={fetchSupabaseData}
              onOpenCreate={() => setShowCreateModal(true)}
              onViewTeams={(tourneyId) => {
                setTeamTournamentFilter(tourneyId);
                setSelectedMenu("teams");
              }}
            />
          )}

          {selectedMenu === "teams" && (
            <AdminTeamsView
              tournaments={tournaments}
              initialTournamentFilter={teamTournamentFilter}
              onRefreshParentCounts={fetchSupabaseData}
            />
          )}

          {/* Approvals View (Review pending team registrations) */}
          {selectedMenu === "approvals" && (
            <AdminApprovalsView
              onApprovalChanged={() => {
                fetchSupabaseData();
              }}
            />
          )}

          {/* Live & Today's Matches View */}
          {selectedMenu === "matches" && (
            <AdminLiveMatchesView matches={todayMatches} />
          )}

          {/* Admin Profile View (Accessible to both Admin and Super Admin) */}
          {selectedMenu === "profile" && (
            <AdminProfileView />
          )}

          {/* User & Role Management View (Super Admin Only) */}
          {selectedMenu === "users" && (
            isSuperAdmin ? (
              <AdminUsersView />
            ) : (
              <div className="admin-view-container">
                <div className="admin-data-card" style={{ textAlign: "center", padding: "3rem" }}>
                  <Lock size={44} color="#d97706" style={{ margin: "0 auto 1rem auto" }} />
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>Access Restricted</h2>
                  <p style={{ color: "#64748b", margin: "0.5rem 0 1rem 0" }}>
                    User & Role Management is restricted to Super Admin accounts only.
                  </p>
                  <button onClick={() => setSelectedMenu("profile")} className="admin-btn-primary" style={{ margin: "0 auto" }}>
                    Go to My Profile
                  </button>
                </div>
              </div>
            )
          )}

          {/* Audit Logs View (Super Admin Only) */}
          {selectedMenu === "audit" && (
            isSuperAdmin ? (
              <AdminAuditLogView />
            ) : (
              <div className="admin-view-container">
                <div className="admin-data-card" style={{ textAlign: "center", padding: "3rem" }}>
                  <Lock size={44} color="#d97706" style={{ margin: "0 auto 1rem auto" }} />
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>Access Restricted</h2>
                  <p style={{ color: "#64748b", margin: "0.5rem 0 1rem 0" }}>
                    Audit Logs are restricted to Super Admin accounts only.
                  </p>
                  <button onClick={() => setSelectedMenu("dashboard")} className="admin-btn-primary" style={{ margin: "0 auto" }}>
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )
          )}

          {selectedMenu === "sports" && (
            <AdminSportsView
              sports={sports}
              onRefresh={fetchSupabaseData}
            />
          )}

          {selectedMenu === "brackets" && (
            <AdminBracketsView
              tournaments={tournaments}
            />
          )}

          {selectedMenu === "registrations" && (
            <AdminRegistrationsView
              tournaments={tournaments}
              formatMoney={formatMoney}
              onRefresh={fetchSupabaseData}
              onViewTeams={(tourneyId) => {
                setTeamTournamentFilter(tourneyId);
                setSelectedMenu("teams");
              }}
            />
          )}

          {selectedMenu === "leaderboard" && (
            <AdminLeaderboardView
              tournaments={tournaments}
            />
          )}

          {selectedMenu === "settings" && (
            <div className="admin-view-container">
              <div className="admin-view-header">
                <div className="admin-view-title-group">
                  <h1>Administrator Settings & Database Health</h1>
                  <p>Manage system preferences, database sync status, and currency configurations.</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
                <div className="admin-data-card">
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem" }}>
                    Active Organizer Session
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div>
                      <label style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Username</label>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>{user?.username || "admin"}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Display Name</label>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>{user?.name || user?.username || "Admin"}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>System Role Flag</label>
                      <div>
                        <span
                          style={{
                            display: "inline-block",
                            background: user?.role === "superadmin" ? "#fef3c7" : "#d1fae5",
                            color: user?.role === "superadmin" ? "#b45309" : "#065f46",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "6px",
                            fontSize: "0.82rem",
                            fontWeight: 800,
                          }}
                        >
                          {user?.role === "superadmin" ? "👑 SUPERADMIN" : "🛡️ ADMIN"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-data-card">
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem" }}>
                    Supabase Database Telemetry
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                      <span style={{ fontWeight: 700, color: "#059669" }}>Supabase Live Connected</span>
                    </div>
                    <div>
                      <label style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Database Type</label>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>PostgreSQL Cloud via @supabase/supabase-js</div>
                    </div>
                    <div>
                      <label style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Current Records</label>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>
                        {tournaments.length} Tournaments | {sports.length} Sports | {totalTeamsExact || stats.registeredTeamsSum} Teams
                      </div>
                    </div>
                    <button
                      onClick={() => fetchSupabaseData()}
                      className="admin-btn-secondary"
                      style={{ marginTop: "0.5rem", width: "fit-content" }}
                    >
                      <RefreshCw size={14} />
                      <span>Test Connection & Sync</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedMenu === "help" && (
            <div className="admin-view-container">
              <div className="admin-view-header">
                <div className="admin-view-title-group">
                  <h1>Admin Operations & System Guide</h1>
                  <p>Operational instructions for managing tournaments, teams, and Supabase data.</p>
                </div>
              </div>

              <div className="admin-data-card">
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <h4 style={{ color: "#059669", fontWeight: 800, margin: "0 0 0.25rem 0" }}>
                      1. Direct Supabase Data Source
                    </h4>
                    <p style={{ color: "#475569", margin: 0, fontSize: "0.9rem" }}>
                      All operations executed in the Admin Dashboard (creating tournaments, updating statuses, adding teams, generating brackets) query and commit mutations directly to the Supabase database.
                    </p>
                  </div>

                  <div>
                    <h4 style={{ color: "#059669", fontWeight: 800, margin: "0 0 0.25rem 0" }}>
                      2. Dedicated Administrative Sub-System
                    </h4>
                    <p style={{ color: "#475569", margin: 0, fontSize: "0.9rem" }}>
                      The sidebar navigation preserves your administrative session context without bouncing back to public user pages. You can manage Tournaments, Squads/Teams, Sports Disciplines, Brackets, and Audit Registrations in one place.
                    </p>
                  </div>

                  <div>
                    <h4 style={{ color: "#059669", fontWeight: 800, margin: "0 0 0.25rem 0" }}>
                      3. Public Website Link
                    </h4>
                    <p style={{ color: "#475569", margin: 0, fontSize: "0.9rem" }}>
                      To inspect how the public customer home page looks, click <strong>"Public Website ↗"</strong> in the sidebar or top bar to open it in a new tab without losing your admin dashboard workspace.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MAIN DASHBOARD OVERVIEW */}
          {selectedMenu === "dashboard" && (
            <>
              {/* Subheader: Welcome Message & Export Button */}
              <div className="dash-welcome-row">
                <div>
                  <h1 className="dash-welcome-title">
                    Welcome back {user?.name || user?.username || "Admin"}
                  </h1>
                  <p className="dash-welcome-sub">
                    Live tournament, team, and prize pool telemetry powered directly by Supabase.
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

                  {/* Currency selector with INR as primary */}
                  <select
                    className="dash-currency-badge"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value as CurrencyKey)}
                    title="Change Currency"
                  >
                    <option value="INR">🇮🇳 INR (₹)</option>
                    <option value="USD">🇺🇸 USD ($)</option>
                    <option value="EUR">🇪🇺 EUR (€)</option>
                    <option value="GBP">🇬🇧 GBP (£)</option>
                  </select>
                </div>

                <div className="dash-metric-big-number">
                  {loading ? (
                    <div className="dash-skeleton-pulse" style={{ height: "40px", width: "200px" }} />
                  ) : (
                    formatMoney(stats.totalPrizeRaw)
                  )}
                </div>

                <div className="dash-trend-pill positive">
                  <span>● Live Supabase synced database</span>
                </div>
              </div>

              {/* Two Action buttons */}
              <div className="dash-card-actions-row">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="dash-btn-primary-pill"
                  style={{ border: "none", cursor: "pointer" }}
                >
                  <ArrowUpRight size={16} />
                  <span>Create Tournament</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedMenu("teams");
                    setTeamTournamentFilter(null);
                  }}
                  className="dash-btn-secondary-pill"
                  style={{ border: "none", cursor: "pointer" }}
                >
                  <ArrowDownLeft size={16} />
                  <span>Register Team</span>
                </button>
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
                    formatMoney(stats.totalFeesRaw)
                  )}
                </div>

                <div className="dash-trend-pill positive">
                  <span>● Collected from {stats.registeredTeamsSum} teams</span>
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
                  <span>● Across {stats.totalTourneys} tournaments</span>
                </div>
              </div>
            </div>

            {/* CARD 4: Live / Today's Matches Stat Card */}
            <div
              className="dash-metric-card"
              style={{ cursor: "pointer", position: "relative" }}
              onClick={() => setSelectedMenu("matches")}
              title="Click to view live and today's schedule"
              id="dash-card-live-matches"
            >
              <div>
                <div className="dash-metric-card-header">
                  <div className="dash-metric-title-group">
                    <div className="dash-metric-icon-box" style={{ background: "#fee2e2", color: "#dc2626" }}>
                      <Radio size={18} />
                    </div>
                    <span className="dash-metric-label">Today's Matches</span>
                  </div>
                  <button className="dash-three-dots" title="View all matches">
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="dash-metric-big-number" style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                  {loading ? (
                    <div className="dash-skeleton-pulse" style={{ height: "40px", width: "120px" }} />
                  ) : (
                    <>
                      <span style={{ color: todayMatches.filter((m) => m.status === "live").length > 0 ? "#dc2626" : "#0f172a" }}>
                        {todayMatches.filter((m) => m.status === "live").length}
                      </span>
                      <span style={{ fontSize: "1rem", color: "#64748b", fontWeight: 600 }}>
                        Live / {todayMatches.length} Today
                      </span>
                    </>
                  )}
                </div>

                <div
                  className="dash-trend-pill"
                  style={{
                    background: todayMatches.filter((m) => m.status === "live").length > 0 ? "#fee2e2" : "#f1f5f9",
                    color: todayMatches.filter((m) => m.status === "live").length > 0 ? "#b91c1c" : "#475569",
                  }}
                >
                  <span>
                    ● {todayMatches.filter((m) => m.status === "live").length > 0
                      ? `${todayMatches.filter((m) => m.status === "live").length} currently in action`
                      : "Matches scheduled for today"}
                  </span>
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
                <button
                  onClick={() => setSelectedMenu("sports")}
                  className="dash-add-btn"
                  style={{ border: "none", cursor: "pointer" }}
                >
                  <Plus size={14} />
                  <span>View All</span>
                </button>
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
              LIVE & TODAY'S MATCHES SECTION
              ========================================================= */}
          <div className="dash-panel-card" style={{ marginBottom: "1.5rem" }} id="dash-section-live-matches">
            <div className="dash-panel-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Radio size={20} color="#dc2626" />
                <div>
                  <h2 className="dash-panel-title" style={{ margin: 0 }}>Live & Today's Matches</h2>
                  <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    Matches currently in progress and scheduled for today
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span
                  style={{
                    background: todayMatches.filter((m) => m.status === "live").length > 0 ? "#fee2e2" : "#f1f5f9",
                    color: todayMatches.filter((m) => m.status === "live").length > 0 ? "#b91c1c" : "#475569",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    padding: "0.25rem 0.65rem",
                    borderRadius: "9999px",
                  }}
                >
                  {todayMatches.filter((m) => m.status === "live").length} LIVE NOW
                </span>
                <button
                  onClick={() => setSelectedMenu("matches")}
                  className="dash-btn-secondary-pill"
                  style={{ padding: "0.35rem 0.85rem", fontSize: "0.8rem", cursor: "pointer" }}
                >
                  Open Match Control Room &rarr;
                </button>
              </div>
            </div>

            {/* List of matches in progress and scheduled today */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
              {todayMatches.slice(0, 3).map((match) => (
                <div
                  key={match.id}
                  style={{
                    background: match.status === "live" ? "#fff5f5" : "#f8fafc",
                    border: `1px solid ${match.status === "live" ? "#fecaca" : "#e2e8f0"}`,
                    borderRadius: "12px",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b" }}>
                      {match.sportIcon} {match.tournamentName} &bull; {match.round}
                    </span>
                    <span
                      className={`dash-status-pill ${
                        match.status === "live"
                          ? "live"
                          : match.status === "completed"
                          ? "success"
                          : match.status === "disputed"
                          ? "disputed"
                          : "upcoming"
                      }`}
                    >
                      {match.status === "live"
                        ? `● ${match.statusLabel || "Live"}`
                        : match.status === "completed"
                        ? "✔ Completed"
                        : match.status === "disputed"
                        ? "⚠️ Disputed"
                        : `⏰ ${match.timeDisplay || "Today"}`}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.5rem 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0f172a" }}>{match.teamA.name}</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "1.1rem", color: match.status === "live" ? "#dc2626" : "#475569" }}>
                      {match.status === "today" ? "vs" : `${match.teamA.score} - ${match.teamB.score}`}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0f172a" }}>{match.teamB.name}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px dashed rgba(0,0,0,0.08)", fontSize: "0.75rem", color: "#64748b" }}>
                    <span>📍 {match.groundName}, {match.location}</span>
                    <button
                      onClick={() => setSelectedMenu("matches")}
                      style={{ background: "none", border: "none", color: "#059669", fontWeight: 700, cursor: "pointer", padding: 0 }}
                    >
                      Match Details &rarr;
                    </button>
                  </div>
                </div>
              ))}
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

                {/* Goal 2: Prize Pool Allocation */}
                <div className="dash-goal-item">
                  <div className="dash-goal-header">
                    <div className="dash-goal-title-group">
                      <div className="dash-goal-icon-circle" style={{ background: "#fef3c7", color: "#d97706" }}>
                        <DollarSign size={16} />
                      </div>
                      <span className="dash-goal-name">Prize Pool Allocation</span>
                    </div>
                    <span className="dash-goal-percent">
                      {stats.prizePoolAllocationPercent}%
                    </span>
                  </div>
                  <div className="dash-goal-numbers">
                    {formatMoney(stats.totalFeesRaw)} / {formatMoney(stats.totalPrizeRaw)} Collected
                  </div>
                  <div className="dash-progress-track">
                    <div
                      className="dash-progress-fill"
                      style={{
                        width: `${Math.min(100, stats.prizePoolAllocationPercent)}%`,
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
                    <option value="pending_approval">Pending Approval</option>
                    <option value="disputed">Disputed</option>
                    <option value="completed">Completed / Success</option>
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
                                    : t.status === "disputed"
                                    ? "disputed"
                                    : t.status === "pending_approval" || t.status === "pending"
                                    ? "pending"
                                    : "success"
                                }`}
                              >
                                {t.status === "post" || t.status === "completed"
                                  ? "✔ Success"
                                  : t.status === "live"
                                  ? "● Live"
                                  : t.status === "disputed"
                                  ? "⚠️ Disputed"
                                  : t.status === "pending_approval" || t.status === "pending"
                                  ? "⏳ Pending"
                                  : "● Upcoming"}
                              </span>
                            </td>
                            <td>
                              <a
                                href={`/tournament/${t.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="dash-three-dots"
                                title="Preview Tournament Page in New Tab"
                              >
                                <ExternalLink size={14} />
                              </a>
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
        </>
      )}
    </main>
  </div>

  {/* Supabase Connected Create Tournament Modal */}
  {showCreateModal && (
    <AdminCreateTournamentModal
      sports={sports}
      onClose={() => setShowCreateModal(false)}
      onSuccess={() => {
        fetchSupabaseData();
      }}
    />
  )}

  {/* Active Session & Role JSON Inspection Modal */}
  {showSessionModal && (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={() => setShowSessionModal(false)}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          maxWidth: "580px",
          width: "100%",
          padding: "1.75rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          border: "1px solid #e2e8f0",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Code size={20} color="#059669" />
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
              Authentication & Role Session JSON
            </h3>
          </div>
          <button
            onClick={() => setShowSessionModal(false)}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "8px",
              padding: "0.4rem",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", color: "#64748b" }}>
          Live authenticated JSON payload stored in the session. Tournament creators are assigned the <strong>admin</strong> role, while root platform administrators possess the <strong>superadmin</strong> flag.
        </p>

        <div
          style={{
            background: "#0f172a",
            color: "#38bdf8",
            padding: "1rem",
            borderRadius: "10px",
            fontFamily: "monospace",
            fontSize: "0.82rem",
            overflowX: "auto",
            maxHeight: "320px",
          }}
        >
          <pre style={{ margin: 0 }}>
            {JSON.stringify(
              {
                status: "authenticated",
                user: {
                  id: user?.id || "usr_" + (user?.username || "admin"),
                  username: user?.username || "admin",
                  name: user?.name || user?.username || "Tournament Admin",
                  email: user?.email || `${user?.username || "admin"}@sportsnest.app`,
                  role: user?.role || "admin",
                  isSuperAdmin: user?.role === "superadmin",
                  systemScope: user?.role === "superadmin" ? "PLATFORM_ROOT" : "TOURNAMENT_ORGANIZER",
                  permissions:
                    user?.role === "superadmin"
                      ? ["*"]
                      : [
                          "tournaments:create",
                          "tournaments:update",
                          "teams:register",
                          "brackets:generate",
                          "scores:record",
                        ],
                },
                session: {
                  tokenType: "Bearer",
                  token: localStorage.getItem("sportsnest_auth_token") || "jwt_demo_token_sportsnest_admin",
                  storedKey: "sportsnest_auth_user",
                  databaseBackend: "Supabase PostgreSQL",
                },
              },
              null,
              2
            )}
          </pre>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem" }}>
          <button
            onClick={() => {
              const jsonStr = JSON.stringify(
                {
                  status: "authenticated",
                  user: {
                    username: user?.username || "admin",
                    name: user?.name || "Tournament Admin",
                    role: user?.role || "admin",
                    isSuperAdmin: user?.role === "superadmin",
                  },
                  token: localStorage.getItem("sportsnest_auth_token"),
                },
                null,
                2
              );
              navigator.clipboard.writeText(jsonStr);
              setCopiedJson(true);
              setTimeout(() => setCopiedJson(false), 2000);
            }}
            className="admin-btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            {copiedJson ? <Check size={14} color="#059669" /> : <Copy size={14} />}
            <span>{copiedJson ? "Copied JSON!" : "Copy JSON"}</span>
          </button>

          <button
            onClick={() => setShowSessionModal(false)}
            className="admin-btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )}
</div>
  );
};

export default Dashboard;
