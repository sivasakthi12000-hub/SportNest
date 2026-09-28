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
  const [chartType, setChartType] = useState<"bar" | "area">("bar");
  const [nowTick, setNowTick] = useState<number>(Date.now());
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [activeBarIndex, setActiveBarIndex] = useState<number>(7);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [preselectedSportName, setPreselectedSportName] = useState<string>("");
  const [teamTournamentFilter, setTeamTournamentFilter] = useState<number | null>(null);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(4);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(true);
  const [roleNotice, setRoleNotice] = useState<string | null>(null);
  const [matchesQueueFilter, setMatchesQueueFilter] = useState<"all" | "live" | "today" | "upcoming">("all");

  const isSuperAdmin = Boolean(
    user?.role === "superadmin" ||
    user?.username?.toLowerCase() === "admin123" ||
    user?.email?.toLowerCase() === "sivasakthi12000@gmail.com"
  );

  // Preserve active admin page on reload
  useEffect(() => {
    try {
      localStorage.setItem("sportsnest_active_admin_session", "true");
      sessionStorage.removeItem("sportsnest_deliberate_home");
    } catch {}
  }, []);

  // Update timer tick every second for live kickoff and registration countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Role-restricted tournaments: Super Admin sees all; Tournament Organizer sees their own tournaments only
  const visibleTournaments = useMemo(() => {
    if (isSuperAdmin) return tournaments;
    const username = (user?.username || "").toLowerCase().trim();
    const email = (user?.email || "").toLowerCase().trim();
    return tournaments.filter((t) => {
      const creator = (t.createdBy || "").toLowerCase().trim();
      return (
        creator === username ||
        creator === email ||
        (username && creator.includes(username)) ||
        (email && creator.includes(email))
      );
    });
  }, [isSuperAdmin, tournaments, user]);

  const relevantSportIds = useMemo(() => {
    return new Set(visibleTournaments.map((t) => t.sportId).filter(Boolean));
  }, [visibleTournaments]);

  // Today's matches generated from scoped tournament schedules
  const todayMatches: LiveMatch[] = useMemo(() => {
    return generateTodayMatches(visibleTournaments);
  }, [visibleTournaments]);

  // Realtime countdown helper for deadlines and tournament kickoffs
  const getRemainingCountdown = (dateStr?: string) => {
    if (!dateStr) return { text: "Not Scheduled", urgent: false, expired: true, days: 0 };
    const target = new Date(dateStr).getTime();
    const diff = target - nowTick;
    if (diff <= 0) return { text: "Closed / Started", urgent: false, expired: true, days: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const urgent = days < 3;
    if (days > 0) {
      return { text: `${days}d ${hours}h ${minutes}m`, urgent, expired: false, days, hours, minutes, seconds };
    }
    return { text: `${hours}h ${minutes}m ${seconds}s`, urgent: true, expired: false, days, hours, minutes, seconds };
  };

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

  // Organizer specific team sum across their hosted tournaments
  const organizerTeamsCount = useMemo(() => {
    return visibleTournaments.reduce((acc, t) => acc + (Number(t.registeredTeams) || 0), 0);
  }, [visibleTournaments]);

  // Aggregated live calculations scoped to user role (all tournaments for Super Admin, hosted tournaments for Organizer)
  const stats = useMemo(() => {
    const list = isSuperAdmin ? tournaments : visibleTournaments;
    const totalTourneys = list.length;
    const totalPrizeRaw = list.reduce((acc, t) => acc + (Number(t.prizeAmount) || 0), 0);
    const totalFeesRaw = list.reduce(
      (acc, t) => acc + (Number(t.entryFee) || 0) * (Number(t.registeredTeams) || 0),
      0
    );
    const registeredTeamsSum = isSuperAdmin
      ? list.reduce((acc, t) => acc + (Number(t.registeredTeams) || 0), 0)
      : organizerTeamsCount;
    const maxTeamsSum = list.reduce((acc, t) => acc + (Number(t.maxTeams) || 0), 0) || 1;

    // Unique venues in visible tournaments
    const uniqueVenues = new Set(list.map((t) => t.groundName).filter(Boolean));

    const prizePoolAllocationPercent =
      totalPrizeRaw > 0 && !isNaN(totalFeesRaw) && !isNaN(totalPrizeRaw)
        ? Math.min(100, Math.max(0, Math.round((totalFeesRaw / totalPrizeRaw) * 100)))
        : 0;

    return {
      totalTourneys,
      totalPrizeRaw: isNaN(totalPrizeRaw) ? 0 : totalPrizeRaw,
      totalFeesRaw: isNaN(totalFeesRaw) ? 0 : totalFeesRaw,
      registeredTeamsSum: isNaN(registeredTeamsSum) ? 0 : registeredTeamsSum,
      maxTeamsSum: isNaN(maxTeamsSum) ? 1 : maxTeamsSum,
      capacityPercent: Math.min(100, Math.round((registeredTeamsSum / maxTeamsSum) * 100)),
      prizePoolAllocationPercent: isNaN(prizePoolAllocationPercent) ? 0 : prizePoolAllocationPercent,
      uniqueVenuesCount: uniqueVenues.size,
    };
  }, [isSuperAdmin, tournaments, visibleTournaments, organizerTeamsCount]);

  // Calculate 12-month data scoped to visibleTournaments
  const monthlyChartData = useMemo(() => {
    const monthlySums = Array(12).fill(0);
    const monthlyCounts = Array(12).fill(0);
    const monthlyFees = Array(12).fill(0);

    visibleTournaments.forEach((t) => {
      if (t.date) {
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) {
          const m = d.getMonth();
          monthlySums[m] += t.prizeAmount || 0;
          monthlyCounts[m] += 1;
          monthlyFees[m] += (Number(t.entryFee) || 0) * (Number(t.registeredTeams) || 0);
        }
      }
    });

    const maxVal = Math.max(...monthlySums, 1);

    return MONTH_NAMES.map((name, idx) => {
      const val = monthlySums[idx];
      const count = monthlyCounts[idx];
      const fees = monthlyFees[idx];
      const heightPercent = val > 0 ? Math.max(18, Math.round((val / maxVal) * 95)) : 15;
      return {
        month: name,
        index: idx,
        val,
        count,
        fees,
        heightPercent,
      };
    });
  }, [visibleTournaments]);

  // Top sports cards scoped to visibleTournaments
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

    const countsMap: Record<number, { count: number; prize: number }> = {};
    visibleTournaments.forEach((t) => {
      const sId = t.sportId || 1;
      if (!countsMap[sId]) countsMap[sId] = { count: 0, prize: 0 };
      countsMap[sId].count += 1;
      countsMap[sId].prize += Number(t.prizeAmount) || 0;
    });

    // If organizer has tournaments, show their sports; otherwise show available sports catalog
    const sportsWithTourneys = sports.filter((s) => (countsMap[s.id]?.count || 0) > 0);
    const sportsList = sportsWithTourneys.length > 0 ? sportsWithTourneys : sports.slice(0, 4);

    return sportsList.slice(0, 4).map((s) => {
      return {
        id: s.id,
        name: s.name,
        icon: s.icon || sportIconMap[s.name] || "🏆",
        tournamentsCount: countsMap[s.id]?.count || 0,
        totalPrize: countsMap[s.id]?.prize || 0,
        status: "Active",
      };
    });
  }, [sports, visibleTournaments]);

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
                      {isSuperAdmin
                        ? (totalTeamsExact || stats.registeredTeamsSum).toLocaleString()
                        : organizerTeamsCount.toLocaleString()}
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

          {/* SUPER ADMIN RESTRICTED SECTION - ONLY RENDER IF LOGGED IN AS SUPER ADMIN */}
          {isSuperAdmin && (
            <div className="dash-nav-section" style={{ marginTop: "0.5rem" }} id="superadmin-only-nav-section">
              {!sidebarCollapsed && (
                <div
                  className="dash-nav-heading"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "#64748b",
                  }}
                >
                  <span>SUPER ADMIN</span>
                  <span style={{ fontSize: "0.65rem", background: "rgba(245, 158, 11, 0.15)", color: "#d97706", padding: "0.1rem 0.4rem", borderRadius: "4px", fontWeight: 700 }}>
                    SUPER
                  </span>
                </div>
              )}

              <ul className="dash-nav-list">
                {/* User & Role Management */}
                <li>
                  <button
                    className={`dash-nav-item ${selectedMenu === "users" ? "active" : ""}`}
                    onClick={() => {
                      setSelectedMenu("users");
                      setMobileMenuOpen(false);
                      setRoleNotice(null);
                    }}
                    id="admin-nav-users"
                    title="Manage admin users & permissions"
                  >
                    <div className="dash-nav-left-part">
                      <Users size={18} />
                      {!sidebarCollapsed && <span>User & Role Management</span>}
                    </div>
                  </button>
                </li>

                {/* Audit Logs */}
                <li>
                  <button
                    className={`dash-nav-item ${selectedMenu === "audit" ? "active" : ""}`}
                    onClick={() => {
                      setSelectedMenu("audit");
                      setMobileMenuOpen(false);
                      setRoleNotice(null);
                    }}
                    id="admin-nav-audit"
                    title="View system security & activity logs"
                  >
                    <div className="dash-nav-left-part">
                      <FileText size={18} />
                      {!sidebarCollapsed && <span>Audit Logs</span>}
                    </div>
                  </button>
                </li>

                {/* System Settings & Telemetry */}
                <li>
                  <button
                    className={`dash-nav-item ${selectedMenu === "settings" ? "active" : ""}`}
                    onClick={() => {
                      setSelectedMenu("settings");
                      setMobileMenuOpen(false);
                      setRoleNotice(null);
                    }}
                    id="admin-nav-settings"
                    title="Database and system settings"
                  >
                    <div className="dash-nav-left-part">
                      <Settings size={18} />
                      {!sidebarCollapsed && <span>System Settings</span>}
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Logout Section */}
          <div className="dash-nav-section" style={{ marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9" }}>
            <ul className="dash-nav-list">
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
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.65rem" }}
                onClick={() => setSelectedMenu("profile")}
                title="View Admin Profile & Permissions"
              >
                <div
                  className="dash-avatar"
                  style={{
                    background: isSuperAdmin ? "#f59e0b" : "#059669",
                  }}
                >
                  <span>{user?.username?.charAt(0).toUpperCase() || "A"}</span>
                </div>
                <div className="dash-user-meta" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="dash-user-name" style={{ fontWeight: 700 }}>
                    {user?.name || user?.username || "admin"}
                  </span>
                  {/* Role indicator badge next to user avatar */}
                  <span
                    id="user-role-indicator-badge"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "0.15rem 0.6rem",
                      borderRadius: "9999px",
                      background: isSuperAdmin ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                      color: isSuperAdmin ? "#b45309" : "#065f46",
                      border: `1px solid ${isSuperAdmin ? "rgba(245, 158, 11, 0.4)" : "rgba(16, 185, 129, 0.4)"}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isSuperAdmin ? "👑 Super Admin" : "🛡️ Admin"}
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
              tournaments={isSuperAdmin ? tournaments : visibleTournaments}
              isSuperAdmin={isSuperAdmin}
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
              tournaments={tournaments}
              onRefresh={fetchSupabaseData}
              userRole={user?.role}
              relevantSportIds={relevantSportIds}
              onOpenCreateTournament={(sportName) => {
                setPreselectedSportName(sportName || "");
                setShowCreateModal(true);
              }}
              onViewTournament={() => {
                setSelectedMenu("tournaments");
              }}
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
                            background: isSuperAdmin ? "#fef3c7" : "#d1fae5",
                            color: isSuperAdmin ? "#b45309" : "#065f46",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "6px",
                            fontSize: "0.82rem",
                            fontWeight: 800,
                          }}
                        >
                          {isSuperAdmin ? "👑 SUPERADMIN" : "🛡️ ADMIN"}
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
                        {visibleTournaments.length} Tournaments | {isSuperAdmin ? sports.length : relevantSportIds.size} Sports | {isSuperAdmin ? (totalTeamsExact || stats.registeredTeamsSum) : organizerTeamsCount} Teams
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
            {/* CARD 1: Total Prize Pool */}
            <div
              className="dash-metric-card"
              style={{
                background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: "linear-gradient(90deg, #10b981, #059669)",
                }}
              />
              <div>
                <div className="dash-metric-card-header">
                  <div className="dash-metric-title-group">
                    <div
                      className="dash-metric-icon-box"
                      style={{
                        background: "rgba(16, 185, 129, 0.12)",
                        color: "#059669",
                        borderRadius: "10px",
                      }}
                    >
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <span className="dash-metric-label" style={{ fontWeight: 800, color: "#1e293b", fontSize: "0.95rem" }}>
                        Total Prize Pool
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.72rem",
                          color: isSuperAdmin ? "#b45309" : "#047857",
                          fontWeight: 700,
                        }}
                      >
                        {isSuperAdmin ? "👑 All Database Tournaments" : "🛡️ Your Hosted Tournaments"}
                      </span>
                    </div>
                  </div>

                  {/* Currency selector with INR as primary */}
                  <select
                    className="dash-currency-badge"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value as CurrencyKey)}
                    title="Change Currency"
                    style={{
                      fontWeight: 700,
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      padding: "4px 8px",
                      background: "#ffffff",
                    }}
                  >
                    <option value="INR">🇮🇳 INR (₹)</option>
                    <option value="USD">🇺🇸 USD ($)</option>
                    <option value="EUR">🇪🇺 EUR (€)</option>
                    <option value="GBP">🇬🇧 GBP (£)</option>
                  </select>
                </div>

                <div
                  className="dash-metric-big-number"
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "-0.5px",
                    margin: "0.6rem 0 0.35rem 0",
                  }}
                >
                  {loading ? (
                    <div className="dash-skeleton-pulse" style={{ height: "40px", width: "200px" }} />
                  ) : (
                    formatMoney(stats.totalPrizeRaw)
                  )}
                </div>

                <div className="dash-trend-pill positive" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                  <span style={{ fontWeight: 600 }}>
                    {isSuperAdmin ? "Live Supabase Database Sync" : `${visibleTournaments.length} Active Events Hosted`}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="dash-card-actions-row" style={{ marginTop: "1rem" }}>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="dash-btn-primary-pill"
                  style={{
                    border: "none",
                    cursor: "pointer",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#ffffff",
                    fontWeight: 700,
                  }}
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
                  style={{
                    border: "1px solid #cbd5e1",
                    cursor: "pointer",
                    background: "#ffffff",
                    color: "#334155",
                    fontWeight: 700,
                  }}
                >
                  <ArrowDownLeft size={16} />
                  <span>Register Team</span>
                </button>
              </div>
            </div>

            {/* CARD 2: Total Entry Fees Collected */}
            <div
              className="dash-metric-card"
              style={{
                background: "linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)",
                border: "1px solid #bbf7d0",
                boxShadow: "0 4px 20px -2px rgba(16, 185, 129, 0.08)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: "linear-gradient(90deg, #059669, #34d399)",
                }}
              />
              <div>
                <div className="dash-metric-card-header">
                  <div className="dash-metric-title-group">
                    <div
                      className="dash-metric-icon-box"
                      style={{
                        background: "#dcfce7",
                        color: "#16a34a",
                        borderRadius: "10px",
                      }}
                    >
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <span className="dash-metric-label" style={{ fontWeight: 800, color: "#1e293b", fontSize: "0.95rem" }}>
                        Total Entry Fees
                      </span>
                      <span style={{ display: "block", fontSize: "0.72rem", color: "#15803d", fontWeight: 700 }}>
                        {isSuperAdmin ? "Gross Database Inflow" : "Your Event Collections"}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#15803d",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                    }}
                  >
                    100% Verified
                  </span>
                </div>

                <div
                  className="dash-metric-big-number"
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "-0.5px",
                    margin: "0.6rem 0 0.35rem 0",
                  }}
                >
                  {loading ? (
                    <div className="dash-skeleton-pulse" style={{ height: "40px", width: "160px" }} />
                  ) : (
                    formatMoney(stats.totalFeesRaw)
                  )}
                </div>

                <div className="dash-trend-pill positive" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a", display: "inline-block" }}></span>
                  <span style={{ fontWeight: 600 }}>
                    Collected from {stats.registeredTeamsSum} squads
                  </span>
                </div>
              </div>

              {/* Progress bar showing fee collection against prize commitment */}
              <div style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", marginBottom: "4px" }}>
                  <span>Fee to Prize Ratio</span>
                  <span style={{ fontWeight: 700, color: "#16a34a" }}>{stats.prizePoolAllocationPercent}% Funded</span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.min(100, stats.prizePoolAllocationPercent)}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #10b981, #059669)",
                      borderRadius: "999px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* CARD 3: Registered Teams */}
            <div
              className="dash-metric-card"
              style={{
                background: "linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%)",
                border: "1px solid #bae6fd",
                boxShadow: "0 4px 20px -2px rgba(2, 132, 199, 0.08)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: "linear-gradient(90deg, #0284c7, #38bdf8)",
                }}
              />
              <div>
                <div className="dash-metric-card-header">
                  <div className="dash-metric-title-group">
                    <div
                      className="dash-metric-icon-box"
                      style={{
                        background: "#e0f2fe",
                        color: "#0284c7",
                        borderRadius: "10px",
                      }}
                    >
                      <Users size={20} />
                    </div>
                    <div>
                      <span className="dash-metric-label" style={{ fontWeight: 800, color: "#1e293b", fontSize: "0.95rem" }}>
                        Registered Teams
                      </span>
                      <span style={{ display: "block", fontSize: "0.72rem", color: "#0369a1", fontWeight: 700 }}>
                        {isSuperAdmin ? "Live Database Squads" : "Your Tournament Squads"}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      background: "#e0f2fe",
                      color: "#0369a1",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                    }}
                  >
                    Active Rosters
                  </span>
                </div>

                <div
                  className="dash-metric-big-number"
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "-0.5px",
                    margin: "0.6rem 0 0.35rem 0",
                  }}
                >
                  {loading ? (
                    <div className="dash-skeleton-pulse" style={{ height: "40px", width: "140px" }} />
                  ) : (
                    stats.registeredTeamsSum.toLocaleString()
                  )}
                </div>

                <div className="dash-trend-pill positive" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0284c7", display: "inline-block" }}></span>
                  <span style={{ fontWeight: 600 }}>
                    Across {stats.totalTourneys} sanctioned tournaments
                  </span>
                </div>
              </div>

              {/* Slot capacity fill */}
              <div style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", marginBottom: "4px" }}>
                  <span>Tournament Quota Fill</span>
                  <span style={{ fontWeight: 700, color: "#0284c7" }}>
                    {stats.registeredTeamsSum} / {stats.maxTeamsSum} Slots ({stats.capacityPercent}%)
                  </span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.min(100, stats.capacityPercent)}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #0284c7, #38bdf8)",
                      borderRadius: "999px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* CARD 4: Live / Today's Matches */}
            <div
              className="dash-metric-card"
              style={{
                cursor: "pointer",
                background: "linear-gradient(180deg, #ffffff 0%, #fff1f2 100%)",
                border: "1px solid #fecdd3",
                boxShadow: "0 4px 20px -2px rgba(225, 29, 72, 0.08)",
                position: "relative",
                overflow: "hidden",
              }}
              onClick={() => setSelectedMenu("matches")}
              title="Click to view live and today's schedule"
              id="dash-card-live-matches"
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: "linear-gradient(90deg, #e11d48, #f43f5e)",
                }}
              />
              <div>
                <div className="dash-metric-card-header">
                  <div className="dash-metric-title-group">
                    <div
                      className="dash-metric-icon-box"
                      style={{
                        background: "#ffe4e6",
                        color: "#e11d48",
                        borderRadius: "10px",
                      }}
                    >
                      <Radio size={20} />
                    </div>
                    <div>
                      <span className="dash-metric-label" style={{ fontWeight: 800, color: "#1e293b", fontSize: "0.95rem" }}>
                        Today's Matches
                      </span>
                      <span style={{ display: "block", fontSize: "0.72rem", color: "#be123c", fontWeight: 700 }}>
                        Real-Time Match Queue
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#e11d48" />
                </div>

                <div
                  className="dash-metric-big-number"
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.5rem",
                    margin: "0.6rem 0 0.35rem 0",
                  }}
                >
                  {loading ? (
                    <div className="dash-skeleton-pulse" style={{ height: "40px", width: "120px" }} />
                  ) : (
                    <>
                      <span
                        style={{
                          fontSize: "2rem",
                          fontWeight: 800,
                          color: todayMatches.filter((m) => m.status === "live").length > 0 ? "#e11d48" : "#0f172a",
                        }}
                      >
                        {todayMatches.filter((m) => m.status === "live").length}
                      </span>
                      <span style={{ fontSize: "1rem", color: "#64748b", fontWeight: 700 }}>
                        Live / {todayMatches.length} Scheduled Today
                      </span>
                    </>
                  )}
                </div>

                <div
                  className="dash-trend-pill"
                  style={{
                    background: todayMatches.filter((m) => m.status === "live").length > 0 ? "#ffe4e6" : "#f1f5f9",
                    color: todayMatches.filter((m) => m.status === "live").length > 0 ? "#be123c" : "#475569",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: todayMatches.filter((m) => m.status === "live").length > 0 ? "#e11d48" : "#64748b",
                      display: "inline-block",
                      boxShadow: todayMatches.filter((m) => m.status === "live").length > 0 ? "0 0 6px #e11d48" : "none",
                    }}
                  />
                  <span style={{ fontWeight: 700 }}>
                    {todayMatches.filter((m) => m.status === "live").length > 0
                      ? `${todayMatches.filter((m) => m.status === "live").length} currently in action`
                      : "Open Match Center →"}
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
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <h2 className="dash-panel-title" style={{ margin: 0 }}>Overview</h2>

                  {/* 2-Type Chart Toggle Button */}
                  <div
                    style={{
                      display: "inline-flex",
                      background: "#f1f5f9",
                      padding: "2px",
                      borderRadius: "8px",
                      gap: "2px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setChartType("bar")}
                      style={{
                        padding: "3px 9px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        background: chartType === "bar" ? "#ffffff" : "transparent",
                        color: chartType === "bar" ? "#0f172a" : "#64748b",
                        boxShadow: chartType === "bar" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>📊</span>
                      <span>Bar Chart</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChartType("area")}
                      style={{
                        padding: "3px 9px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        background: chartType === "area" ? "#ffffff" : "transparent",
                        color: chartType === "area" ? "#0f172a" : "#64748b",
                        boxShadow: chartType === "area" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>📈</span>
                      <span>Area Trend</span>
                    </button>
                  </div>
                </div>

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

              {/* Chart Views */}
              {chartType === "bar" ? (
                /* TYPE 1: 12-Month Bar Chart with Highlight and Tooltip */
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
              ) : (
                /* TYPE 2: SVG Area / Spline Trend Curve */
                <div style={{ padding: "0.5rem 0", position: "relative" }}>
                  <svg
                    viewBox="0 0 520 180"
                    style={{ width: "100%", height: "180px", overflow: "visible" }}
                  >
                    <defs>
                      <linearGradient id="areaTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Background grid lines */}
                    <line x1="20" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="20" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="20" y1="130" x2="500" y2="130" stroke="#e2e8f0" strokeWidth="1.5" />

                    {(() => {
                      const maxVal = Math.max(...monthlyChartData.map((d) => d.val), 1);
                      const pts = monthlyChartData.map((d, i) => ({
                        x: 25 + (i * 470) / 11,
                        y: 130 - (d.val / maxVal) * 105,
                        ...d,
                      }));

                      const areaPath =
                        `M ${pts[0].x} 130 ` +
                        pts.map((p) => `L ${p.x} ${p.y}`).join(" ") +
                        ` L ${pts[pts.length - 1].x} 130 Z`;
                      const linePath =
                        `M ${pts[0].x} ${pts[0].y} ` +
                        pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");

                      return (
                        <>
                          <path d={areaPath} fill="url(#areaTrendGrad)" />
                          <path
                            d={linePath}
                            fill="none"
                            stroke="#059669"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {pts.map((p, idx) => {
                            const isSelected = activeBarIndex === idx;
                            return (
                              <g
                                key={p.month}
                                onClick={() => setActiveBarIndex(idx)}
                                style={{ cursor: "pointer" }}
                              >
                                <circle
                                  cx={p.x}
                                  cy={p.y}
                                  r={isSelected ? 6 : 4}
                                  fill={isSelected ? "#059669" : "#ffffff"}
                                  stroke="#059669"
                                  strokeWidth="2.5"
                                />
                                <text
                                  x={p.x}
                                  y={150}
                                  textAnchor="middle"
                                  fontSize="11"
                                  fontWeight={isSelected ? "800" : "500"}
                                  fill={isSelected ? "#0f172a" : "#64748b"}
                                >
                                  {p.month}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>

                  {/* Active Month Detail Strip */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "8px",
                      padding: "0.4rem 0.85rem",
                      marginTop: "0.35rem",
                      fontSize: "0.82rem",
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "#166534" }}>
                      ● {monthlyChartData[activeBarIndex]?.month || "Month"} Trend Metric:
                    </span>
                    <span style={{ color: "#334155" }}>
                      <strong>{formatMoney(monthlyChartData[activeBarIndex]?.val || 0)}</strong> Prize Pool &bull;{" "}
                      <strong>{monthlyChartData[activeBarIndex]?.count || 0}</strong> Events Scheduled
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* =========================================================
              LIVE & TODAY'S MATCHES SECTION WITH DATE-BASED QUEUE
              ========================================================= */}
          <div className="dash-panel-card" style={{ marginBottom: "1.5rem" }} id="dash-section-live-matches">
            <div className="dash-panel-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Radio size={20} color="#dc2626" />
                <div>
                  <h2 className="dash-panel-title" style={{ margin: 0 }}>Live & Today's Matches</h2>
                  <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    Real-time match queue and schedule for live tournament grounds
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

            {/* Date-Based Queue Filter Buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexWrap: "wrap",
                marginTop: "0.75rem",
                paddingBottom: "0.5rem",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <button
                type="button"
                onClick={() => setMatchesQueueFilter("all")}
                style={{
                  padding: "0.35rem 0.8rem",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: matchesQueueFilter === "all" ? "1px solid #059669" : "1px solid #e2e8f0",
                  background: matchesQueueFilter === "all" ? "#ecfdf5" : "#ffffff",
                  color: matchesQueueFilter === "all" ? "#065f46" : "#475569",
                  transition: "all 0.2s",
                }}
              >
                All Matches ({todayMatches.length})
              </button>

              <button
                type="button"
                onClick={() => setMatchesQueueFilter("live")}
                style={{
                  padding: "0.35rem 0.8rem",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: matchesQueueFilter === "live" ? "1px solid #ef4444" : "1px solid #e2e8f0",
                  background: matchesQueueFilter === "live" ? "#fef2f2" : "#ffffff",
                  color: matchesQueueFilter === "live" ? "#dc2626" : "#475569",
                  transition: "all 0.2s",
                }}
              >
                🔴 Live Now ({todayMatches.filter((m) => m.status === "live").length})
              </button>

              <button
                type="button"
                onClick={() => setMatchesQueueFilter("today")}
                style={{
                  padding: "0.35rem 0.8rem",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: matchesQueueFilter === "today" ? "1px solid #0284c7" : "1px solid #e2e8f0",
                  background: matchesQueueFilter === "today" ? "#eff6ff" : "#ffffff",
                  color: matchesQueueFilter === "today" ? "#1e40af" : "#475569",
                  transition: "all 0.2s",
                }}
              >
                📅 Today's Queue ({todayMatches.filter((m) => m.status === "today").length})
              </button>

              <button
                type="button"
                onClick={() => setMatchesQueueFilter("upcoming")}
                style={{
                  padding: "0.35rem 0.8rem",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: matchesQueueFilter === "upcoming" ? "1px solid #d97706" : "1px solid #e2e8f0",
                  background: matchesQueueFilter === "upcoming" ? "#fffbeb" : "#ffffff",
                  color: matchesQueueFilter === "upcoming" ? "#b45309" : "#475569",
                  transition: "all 0.2s",
                }}
              >
                ⏳ Upcoming Queue ({todayMatches.filter((m) => m.status === "upcoming").length})
              </button>
            </div>

            {/* List of matches in progress and scheduled */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
              {(() => {
                const filteredMatches = todayMatches.filter((m) => {
                  if (matchesQueueFilter === "live") return m.status === "live";
                  if (matchesQueueFilter === "today") return m.status === "today" || m.status === "live";
                  if (matchesQueueFilter === "upcoming") return m.status === "upcoming";
                  return true;
                });

                if (filteredMatches.length === 0) {
                  return (
                    <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", gridColumn: "1 / -1" }}>
                      No matches found in this queue category.
                    </div>
                  );
                }

                return filteredMatches.slice(0, 3).map((match) => (
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
                      boxShadow: match.status === "live" ? "0 4px 12px rgba(239, 68, 68, 0.1)" : "none",
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
                ));
              })()}
            </div>
          </div>

          {/* =========================================================
              BOTTOM ROW: Upcoming Tournaments & Registration Deadlines
              ========================================================= */}
          <div className="dash-bottom-grid">
            {/* LEFT: UPCOMING TOURNAMENTS WITH TIMERS & DEADLINES */}
            <div className="dash-panel-card">
              <div className="dash-panel-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Clock size={18} color="#059669" />
                  <div>
                    <h2 className="dash-panel-title" style={{ margin: 0 }}>Upcoming Tournaments & Deadlines</h2>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      Live countdown timers to last registration date & tournament kickoffs
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMenu("tournaments")}
                  className="dash-add-btn"
                  style={{ border: "none", cursor: "pointer" }}
                >
                  <Plus size={14} />
                  <span>View All</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.75rem" }}>
                {(() => {
                  const upcomingList = (isSuperAdmin ? tournaments : visibleTournaments)
                    .filter((t) => t.status === "upcoming" || !t.status || t.status === "active")
                    .slice(0, 3);

                  if (upcomingList.length === 0) {
                    return (
                      <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                        <p style={{ margin: "0 0 0.5rem 0" }}>No upcoming tournaments scheduled yet.</p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="admin-btn-primary"
                          style={{ margin: "0 auto" }}
                        >
                          Create Tournament
                        </button>
                      </div>
                    );
                  }

                  return upcomingList.map((t) => {
                    const sport = sports.find((s) => s.id === t.sportId);
                    const regCountdown = getRemainingCountdown(t.lastRegistrationDate || t.date);
                    const kickoffCountdown = getRemainingCountdown(t.date);
                    const fillPercent = Math.min(
                      100,
                      Math.round(((t.registeredTeams || 0) / (t.maxTeams || 16)) * 100)
                    );

                    return (
                      <div
                        key={t.id}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          padding: "1rem",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.75rem",
                        }}
                      >
                        {/* Header: Title and Location */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                          <div>
                            <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem", display: "block" }}>
                              {sport?.icon || "🏆"} {t.name}
                            </span>
                            <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                              📍 {t.groundName ? `${t.groundName}, ` : ""}{t.location}
                            </span>
                          </div>
                          <span
                            style={{
                              background: fillPercent >= 100 ? "#fee2e2" : "#ecfdf5",
                              color: fillPercent >= 100 ? "#b91c1c" : "#047857",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              padding: "0.15rem 0.5rem",
                              borderRadius: "999px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fillPercent >= 100 ? "Quota Full" : "Registration Open"}
                          </span>
                        </div>

                        {/* Dual Timers: Registration Deadline + Tournament Start */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "0.5rem",
                            background: "#f8fafc",
                            padding: "0.6rem 0.75rem",
                            borderRadius: "8px",
                            border: "1px solid #f1f5f9",
                          }}
                        >
                          <div>
                            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, display: "block" }}>
                              Last Registration Date
                            </span>
                            <span
                              style={{
                                fontSize: "0.82rem",
                                fontWeight: 800,
                                color: regCountdown.urgent ? "#dc2626" : "#0f172a",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                marginTop: "2px",
                              }}
                            >
                              <Clock size={13} color={regCountdown.urgent ? "#dc2626" : "#059669"} />
                              <span>{regCountdown.text}</span>
                            </span>
                          </div>

                          <div>
                            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, display: "block" }}>
                              Tournament Kickoff
                            </span>
                            <span
                              style={{
                                fontSize: "0.82rem",
                                fontWeight: 800,
                                color: "#0369a1",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                marginTop: "2px",
                              }}
                            >
                              <Calendar size={13} color="#0284c7" />
                              <span>Starts in {kickoffCountdown.text}</span>
                            </span>
                          </div>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", marginBottom: "4px" }}>
                            <span>Squads Enrolled: <strong>{t.registeredTeams || 0} / {t.maxTeams || 16}</strong></span>
                            <span style={{ fontWeight: 700, color: fillPercent >= 100 ? "#dc2626" : "#059669" }}>
                              {fillPercent}% Quota
                            </span>
                          </div>
                          <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${fillPercent}%`,
                                height: "100%",
                                background: fillPercent >= 100 ? "#ef4444" : "linear-gradient(90deg, #10b981, #059669)",
                                borderRadius: "999px",
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                        </div>

                        {/* Bottom Action Footer */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.35rem" }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#059669" }}>
                            Prize: {formatMoney(t.prizeAmount)}
                          </span>
                          <button
                            onClick={() => {
                              setTeamTournamentFilter(t.id);
                              setSelectedMenu("teams");
                            }}
                            className="dash-btn-secondary-pill"
                            style={{ padding: "0.25rem 0.65rem", fontSize: "0.75rem", cursor: "pointer" }}
                          >
                            Manage Teams &rarr;
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
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
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1e293b" }}>{t.date || "TBD"}</span>
                                {(() => {
                                  const countdown = getRemainingCountdown(t.date);
                                  if (t.status === "upcoming" || (!t.status && !countdown.expired)) {
                                    return (
                                      <span
                                        style={{
                                          fontSize: "0.72rem",
                                          color: countdown.urgent ? "#dc2626" : "#0284c7",
                                          fontWeight: 700,
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "3px",
                                        }}
                                        title="Preparation countdown until tournament kickoff"
                                      >
                                        <Clock size={11} color={countdown.urgent ? "#dc2626" : "#0284c7"} />
                                        <span>Starts in {countdown.text}</span>
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
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
        defaultSportName={preselectedSportName}
        onClose={() => {
          setShowCreateModal(false);
          setPreselectedSportName("");
        }}
        onSuccess={() => {
          fetchSupabaseData();
          setShowCreateModal(false);
          setPreselectedSportName("");
        }}
      />
    )}
  </div>
  );
};

export default Dashboard;
