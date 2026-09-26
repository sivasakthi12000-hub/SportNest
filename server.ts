import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

interface UserSession {
  username: string;
  name: string;
  role: string;
  email: string;
  token: string;
  tokenType: string;
  loggedInAt: string;
  expiresAt: string;
}

// Backend in-memory session registry (mapping token -> user session JSON)
const activeSessionsJSON: Record<string, UserSession> = {};

interface AdminAccount {
  password: string;
  name: string;
  email: string;
  role: string;
  status?: string;
}

const ADMINS_FILE = path.join(process.cwd(), "data", "registered_admins.json");

// Registered admin accounts store (username -> { password, name, email, role })
let registeredAdminsStore: Record<string, AdminAccount> = {
  admin123: {
    password: "admin123",
    name: "Sivasakthi (Super Admin)",
    email: "sivasakthi12000@gmail.com",
    role: "superadmin",
    status: "active",
  },
  sakthi01: {
    password: "Sakthi@53",
    name: "sakthi01 (Tournament Organizer)",
    email: "sakthi01@sportsnest.app",
    role: "admin",
    status: "active",
  },
};

interface TrackedOrganizer {
  username: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  tournamentCount?: number;
}

let trackedOrganizersStore: TrackedOrganizer[] = [
  {
    username: "admin123",
    name: "Sivasakthi (Super Admin)",
    email: "sivasakthi12000@gmail.com",
    role: "superadmin",
    createdAt: "2026-09-01T00:00:00.000Z",
    tournamentCount: 50,
  },
  {
    username: "sakthi01",
    name: "sakthi01 (Tournament Organizer)",
    email: "sakthi01@sportsnest.app",
    role: "admin",
    createdAt: "2026-09-15T00:00:00.000Z",
    tournamentCount: 1,
  },
];

function loadAdminsFromDisk() {
  try {
    if (fs.existsSync(ADMINS_FILE)) {
      const content = fs.readFileSync(ADMINS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed.admins && typeof parsed.admins === "object") {
        registeredAdminsStore = { ...registeredAdminsStore, ...parsed.admins };
      }
      if (Array.isArray(parsed.organizers)) {
        const existingUsers = new Set(trackedOrganizersStore.map((o) => o.username.toLowerCase()));
        for (const org of parsed.organizers) {
          if (!existingUsers.has(org.username.toLowerCase())) {
            trackedOrganizersStore.push(org);
            existingUsers.add(org.username.toLowerCase());
          }
        }
      }
    }
  } catch (err) {
    console.warn("Failed to load registered admins from disk:", err);
  }
}

function saveAdminsToDisk() {
  try {
    const dir = path.dirname(ADMINS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      ADMINS_FILE,
      JSON.stringify(
        {
          admins: registeredAdminsStore,
          organizers: trackedOrganizersStore,
        },
        null,
        2
      ),
      "utf-8"
    );
  } catch (err) {
    console.warn("Failed to persist registered admins to disk:", err);
  }
}

// Initial load on server initialization
loadAdminsFromDisk();
saveAdminsToDisk();

function cleanSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  let url = rawUrl.trim();
  url = url.replace(/^["']|["']$/g, "");
  url = url.replace(/\/rest\/v1\/?$/i, "");
  url = url.replace(/\/+$/, "");
  return url;
}

function cleanSupabaseKey(rawKey: string): string {
  if (!rawKey) return "";
  let key = rawKey.trim();
  key = key.replace(/^["']|["']$/g, "");
  return key;
}

function generateBackendToken(username: string): string {
  const randomBytes = crypto.randomBytes(24).toString("hex");
  const timestamp = Date.now();
  return `ast_${username}_${timestamp}_${randomBytes}`;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check API
  app.get("/api/health", (_req, res) => {
    const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const cleanUrl = cleanSupabaseUrl(rawUrl);
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      supabaseConfigured: Boolean(cleanUrl),
    });
  });

  // Runtime environment config API for frontend clients
  app.get("/api/config", (_req, res) => {
    const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const rawKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
    res.json({
      supabaseUrl: cleanSupabaseUrl(rawUrl),
      supabaseAnonKey: cleanSupabaseKey(rawKey),
    });
  });

  // 1. Backend Login API:
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body || {};
    const trimmedUser = String(username || "").trim();
    const trimmedPass = String(password || "").trim();

    // Reload from persistent disk store
    loadAdminsFromDisk();

    // Case-insensitive username match
    const normalizedUser = trimmedUser.toLowerCase();
    const matchedKey = Object.keys(registeredAdminsStore).find(
      (k) => k.toLowerCase() === normalizedUser
    );
    const account = matchedKey ? registeredAdminsStore[matchedKey] : null;

    if (account && account.password === trimmedPass) {
      const finalUsername = matchedKey || trimmedUser;
      const token = generateBackendToken(finalUsername);
      const now = new Date();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const session: UserSession = {
        username: finalUsername,
        name: account.name || finalUsername,
        role: account.role || "admin",
        email: account.email || `${finalUsername}@sportsnest.app`,
        token,
        tokenType: "Bearer",
        loggedInAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      activeSessionsJSON[token] = session;

      console.log(
        `[Backend Auth] Login: user "${session.username}" (role: ${session.role}) generated token: ${token.substring(0, 20)}...`
      );

      return res.json({
        success: true,
        token,
        tokenType: "Bearer",
        user: session,
        message: "Authenticated successfully. Admin session JSON generated.",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Invalid credentials. If you are superadmin use admin123 / admin123, or use your tournament organizer credentials.",
    });
  });

  // 1b. Backend Register Admin API (called upon tournament creation with password):
  app.post("/api/auth/register-admin", (req, res) => {
    const { username, password, email, name } = req.body || {};
    const trimmedUser = String(username || "").trim();
    const trimmedPass = String(password || "").trim();

    if (!trimmedUser || !trimmedPass) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required to create an organizer admin account.",
      });
    }

    loadAdminsFromDisk();

    // Role flag: "superadmin" only for sivasakthi / admin123, otherwise "admin"
    const isSuperAdmin = trimmedUser.toLowerCase() === "admin123" || email === "sivasakthi12000@gmail.com";
    const role = isSuperAdmin ? "superadmin" : "admin";
    const userEmail = email || `${trimmedUser}@sportsnest.app`;
    const displayName = name || trimmedUser;

    // Register or update account in store
    registeredAdminsStore[trimmedUser] = {
      password: trimmedPass,
      name: displayName,
      email: userEmail,
      role,
      status: "active",
    };

    // Track newly registered organizer
    const existingTrackedIdx = trackedOrganizersStore.findIndex(
      (o) => o.username.toLowerCase() === trimmedUser.toLowerCase()
    );
    if (existingTrackedIdx >= 0) {
      trackedOrganizersStore[existingTrackedIdx] = {
        ...trackedOrganizersStore[existingTrackedIdx],
        name: displayName,
        email: userEmail,
        role,
      };
    } else {
      trackedOrganizersStore.push({
        username: trimmedUser,
        name: displayName,
        email: userEmail,
        role,
        createdAt: new Date().toISOString(),
        tournamentCount: 1,
      });
    }

    // Persist immediately to disk
    saveAdminsToDisk();

    // Immediately generate token & active session
    const token = generateBackendToken(trimmedUser);
    const now = new Date();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session: UserSession = {
      username: trimmedUser,
      name: displayName,
      role,
      email: userEmail,
      token,
      tokenType: "Bearer",
      loggedInAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    activeSessionsJSON[token] = session;

    console.log(
      `[Backend Auth] Registered and tracked Organizer: "${trimmedUser}" with role: "${role}". Total admins tracked: ${trackedOrganizersStore.length}`
    );

    return res.json({
      success: true,
      token,
      tokenType: "Bearer",
      user: session,
      message: `Organizer admin account created with role: ${role}`,
    });
  });

  // Tracked organizers telemetry endpoint
  // Tracked organizers telemetry endpoint
  app.get("/api/admin/organizers", (_req, res) => {
    res.json({
      success: true,
      totalTracked: trackedOrganizersStore.length,
      organizers: trackedOrganizersStore,
    });
  });

  // =======================================================
  // AUDIT LOGS PERSISTENCE & TELEMETRY
  // =======================================================
  const AUDIT_LOGS_FILE = path.join(process.cwd(), "data", "audit_logs.json");
  interface AuditLogEntry {
    id: string;
    actor: string;
    action: string;
    target: string;
    timestamp: string;
    status: "success" | "warning" | "error";
    ipAddress: string;
  }
  let auditLogsStore: AuditLogEntry[] = [];

  function loadAuditLogs() {
    try {
      if (fs.existsSync(AUDIT_LOGS_FILE)) {
        const raw = fs.readFileSync(AUDIT_LOGS_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) auditLogsStore = parsed;
      }
    } catch (e) {
      console.warn("Notice loading audit logs:", e);
    }
  }

  function saveAuditLogs() {
    try {
      const dataDir = path.dirname(AUDIT_LOGS_FILE);
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify(auditLogsStore, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save audit logs:", e);
    }
  }

  function recordAuditLog(
    actor: string,
    action: string,
    target: string,
    status: "success" | "warning" | "error" = "success",
    ip = "127.0.0.1"
  ) {
    loadAuditLogs();
    const entry: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-5)}`,
      actor: actor || "admin",
      action,
      target,
      timestamp: new Date().toISOString(),
      status,
      ipAddress: ip || "127.0.0.1",
    };
    auditLogsStore.unshift(entry);
    if (auditLogsStore.length > 500) auditLogsStore = auditLogsStore.slice(0, 500);
    saveAuditLogs();
    return entry;
  }

  loadAuditLogs();

  // Audit Logs API with server-side pagination & filtering
  app.get("/api/admin/audit-logs", (req, res) => {
    loadAuditLogs();
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.max(1, Number(req.query.pageSize) || 10);
    const search = String(req.query.search || "").toLowerCase().trim();
    const status = String(req.query.status || "all").toLowerCase().trim();

    let filtered = auditLogsStore;
    if (search) {
      filtered = filtered.filter(
        (l) =>
          l.actor.toLowerCase().includes(search) ||
          l.action.toLowerCase().includes(search) ||
          l.target.toLowerCase().includes(search) ||
          l.id.toLowerCase().includes(search)
      );
    }
    if (status !== "all") {
      filtered = filtered.filter((l) => l.status.toLowerCase() === status);
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    res.json({
      success: true,
      logs: paginated,
      total,
      page,
      pageSize,
      totalPages,
    });
  });

  app.post("/api/admin/audit-logs", (req, res) => {
    const { actor, action, target, status } = req.body || {};
    if (!action) return res.status(400).json({ success: false, error: "Action is required" });
    const entry = recordAuditLog(actor || "admin", action, target || "System", status || "success", req.ip || "127.0.0.1");
    res.json({ success: true, log: entry });
  });

  app.delete("/api/admin/audit-logs/:id", (req, res) => {
    const id = req.params.id;
    loadAuditLogs();
    const initialLen = auditLogsStore.length;
    auditLogsStore = auditLogsStore.filter((l) => l.id !== id);
    saveAuditLogs();
    res.json({ success: true, removed: initialLen - auditLogsStore.length });
  });

  app.delete("/api/admin/audit-logs", (_req, res) => {
    loadAuditLogs();
    auditLogsStore = [];
    saveAuditLogs();
    recordAuditLog("admin123", "Cleared Audit Logs", "All historical audit events wiped", "warning");
    res.json({ success: true, message: "Audit logs cleared successfully." });
  });

  // =======================================================
  // ADMIN USERS & ORGANIZERS API (Server-Side Pagination)
  // =======================================================
  app.get("/api/admin/users", (req, res) => {
    loadAdminsFromDisk();
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);
    const search = String(req.query.search || "").toLowerCase().trim();
    const roleFilter = String(req.query.role || "all").toLowerCase().trim();

    let list = Object.entries(registeredAdminsStore).map(([uname, data]) => {
      const tracked = trackedOrganizersStore.find((t) => t.username.toLowerCase() === uname.toLowerCase());
      return {
        username: uname,
        name: data.name,
        email: data.email,
        role: data.role,
        status: (data as any).status || "active",
        createdAt: tracked?.createdAt || new Date().toISOString(),
        tournamentCount: tracked?.tournamentCount || 0,
      };
    });

    if (search) {
      list = list.filter(
        (u) =>
          u.username.toLowerCase().includes(search) ||
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }
    if (roleFilter !== "all") {
      list = list.filter((u) => u.role.toLowerCase() === roleFilter);
    }

    const total = list.length;
    if (page && pageSize) {
      const safePage = Math.max(1, page);
      const safePageSize = Math.max(1, pageSize);
      const totalPages = Math.max(1, Math.ceil(total / safePageSize));
      const startIndex = (safePage - 1) * safePageSize;
      const paginated = list.slice(startIndex, startIndex + safePageSize);
      return res.json({ success: true, users: paginated, total, page: safePage, pageSize: safePageSize, totalPages });
    }

    res.json({ success: true, users: list, total });
  });

  app.post("/api/admin/users", (req, res) => {
    const { username, password, name, email, role } = req.body || {};
    const trimmedUser = String(username || "").trim();
    if (!trimmedUser || !password) {
      return res.status(400).json({ success: false, error: "Username and password required" });
    }
    if (registeredAdminsStore[trimmedUser]) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }
    const cleanRole = String(role || "admin").toLowerCase() === "superadmin" ? "superadmin" : "admin";
    registeredAdminsStore[trimmedUser] = {
      password: String(password).trim(),
      name: String(name || trimmedUser).trim(),
      email: String(email || `${trimmedUser}@sportsnest.org`).trim(),
      role: cleanRole,
      ...( { status: "active" } as any),
    };
    trackedOrganizersStore.push({
      username: trimmedUser,
      name: String(name || trimmedUser).trim(),
      email: String(email || `${trimmedUser}@sportsnest.org`).trim(),
      role: cleanRole,
      createdAt: new Date().toISOString(),
      tournamentCount: 0,
    });
    saveAdminsToDisk();
    recordAuditLog("superadmin", "Created User Account", `${trimmedUser} (${cleanRole})`, "success", req.ip);
    res.json({ success: true, message: `Account created for ${trimmedUser}` });
  });

  app.put("/api/admin/users/:username", (req, res) => {
    const username = req.params.username;
    const { name, email, role, status, password } = req.body || {};
    const user = registeredAdminsStore[username];
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role.toLowerCase() === "superadmin" ? "superadmin" : "admin";
    if (status) (user as any).status = status;
    if (password) user.password = String(password).trim();

    const tracked = trackedOrganizersStore.find((t) => t.username.toLowerCase() === username.toLowerCase());
    if (tracked) {
      if (name) tracked.name = name;
      if (email) tracked.email = email;
      if (role) tracked.role = user.role;
    }
    saveAdminsToDisk();
    recordAuditLog("superadmin", "Updated User Profile", `${username} (role: ${user.role}, status: ${(user as any).status})`, "success", req.ip);
    res.json({ success: true, message: `Updated user ${username}`, user });
  });

  app.delete("/api/admin/users/:username", (req, res) => {
    const username = req.params.username;
    if (username === "admin123") {
      return res.status(400).json({ success: false, error: "Cannot deactivate root superadmin account" });
    }
    const user = registeredAdminsStore[username];
    if (user) {
      (user as any).status = (user as any).status === "inactive" ? "active" : "inactive";
      saveAdminsToDisk();
      recordAuditLog("superadmin", "Changed User Status", `${username} -> ${(user as any).status}`, "warning", req.ip);
      return res.json({ success: true, message: `User status updated to ${(user as any).status}` });
    }
    res.status(404).json({ success: false, error: "User not found" });
  });

  // =======================================================
  // PENDING APPROVALS & REGISTRATIONS WORKFLOW API
  // =======================================================
  const APPROVALS_FILE = path.join(process.cwd(), "data", "pending_approvals.json");
  interface PendingRegistration {
    id: string;
    teamName: string;
    tournamentId: number;
    tournamentName: string;
    sportName: string;
    captainName: string;
    contactPhone: string;
    email: string;
    memberCount: number;
    entryFee: number;
    paymentStatus: string;
    status: "pending" | "approved" | "rejected";
    appliedAt: string;
    notes?: string;
  }
  let pendingApprovalsStore: PendingRegistration[] = [];

  function loadApprovals() {
    try {
      if (fs.existsSync(APPROVALS_FILE)) {
        const raw = fs.readFileSync(APPROVALS_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) pendingApprovalsStore = parsed;
      } else {
        pendingApprovalsStore = [];
        saveApprovals();
      }
    } catch (e) {
      console.warn("Notice loading approvals:", e);
    }
  }

  function saveApprovals() {
    try {
      const dataDir = path.dirname(APPROVALS_FILE);
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(APPROVALS_FILE, JSON.stringify(pendingApprovalsStore, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save approvals:", e);
    }
  }
  loadApprovals();

  app.get("/api/approvals", (req, res) => {
    loadApprovals();
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);
    const search = String(req.query.search || "").toLowerCase().trim();
    const status = String(req.query.status || "all").toLowerCase().trim();

    let filtered = pendingApprovalsStore;
    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.teamName.toLowerCase().includes(search) ||
          r.tournamentName.toLowerCase().includes(search) ||
          r.captainName.toLowerCase().includes(search) ||
          r.sportName.toLowerCase().includes(search) ||
          r.id.toLowerCase().includes(search)
      );
    }
    if (status !== "all") {
      filtered = filtered.filter((r) => r.status.toLowerCase() === status);
    }

    const total = filtered.length;
    if (page && pageSize) {
      const safePage = Math.max(1, page);
      const safePageSize = Math.max(1, pageSize);
      const totalPages = Math.max(1, Math.ceil(total / safePageSize));
      const startIndex = (safePage - 1) * safePageSize;
      const paginated = filtered.slice(startIndex, startIndex + safePageSize);
      return res.json({
        success: true,
        registrations: paginated,
        total,
        page: safePage,
        pageSize: safePageSize,
        totalPages,
      });
    }

    res.json({ success: true, registrations: filtered, total });
  });

  app.post("/api/approvals", (req, res) => {
    const data = req.body || {};
    if (!data.teamName || !data.tournamentId) {
      return res.status(400).json({ success: false, error: "Team name and tournament ID are required" });
    }
    loadApprovals();
    const id = `APP-${Date.now().toString().slice(-4)}`;
    const newReg: PendingRegistration = {
      id,
      teamName: String(data.teamName).trim(),
      tournamentId: Number(data.tournamentId),
      tournamentName: String(data.tournamentName || `Tournament #${data.tournamentId}`).trim(),
      sportName: String(data.sportName || "Athletics").trim(),
      captainName: String(data.captainName || "Team Captain").trim(),
      contactPhone: String(data.contactPhone || "+91 90000 00000").trim(),
      email: String(data.email || "team@sportsnest.app").trim(),
      memberCount: Number(data.memberCount || 11),
      entryFee: Number(data.entryFee || 0),
      paymentStatus: String(data.paymentStatus || "Verified Paid"),
      status: "pending",
      appliedAt: new Date().toISOString(),
      notes: data.notes ? String(data.notes).trim() : undefined,
    };
    pendingApprovalsStore.unshift(newReg);
    saveApprovals();
    recordAuditLog("public_registrant", "Submitted Squad Application", `${newReg.teamName} for ${newReg.tournamentName}`, "success");
    res.json({ success: true, registration: newReg });
  });

  app.patch("/api/approvals/:id", (req, res) => {
    const id = req.params.id;
    loadApprovals();
    const index = pendingApprovalsStore.findIndex((r) => r.id === id);
    if (index === -1) return res.status(404).json({ success: false, error: "Registration not found" });

    const updates = req.body || {};
    pendingApprovalsStore[index] = {
      ...pendingApprovalsStore[index],
      ...(updates.teamName ? { teamName: String(updates.teamName).trim() } : {}),
      ...(updates.captainName ? { captainName: String(updates.captainName).trim() } : {}),
      ...(updates.contactPhone ? { contactPhone: String(updates.contactPhone).trim() } : {}),
      ...(updates.email ? { email: String(updates.email).trim() } : {}),
      ...(updates.memberCount ? { memberCount: Number(updates.memberCount) } : {}),
      ...(updates.notes !== undefined ? { notes: String(updates.notes).trim() } : {}),
      ...(updates.status ? { status: updates.status } : {}),
    };
    saveApprovals();
    recordAuditLog("admin", "Updated Application", `${pendingApprovalsStore[index].teamName}`, "success");
    res.json({ success: true, registration: pendingApprovalsStore[index] });
  });

  app.post("/api/approvals/:id/approve", (req, res) => {
    const id = req.params.id;
    loadApprovals();
    const index = pendingApprovalsStore.findIndex((r) => r.id === id);
    if (index === -1) return res.status(404).json({ success: false, error: "Registration not found" });

    pendingApprovalsStore[index].status = "approved";
    saveApprovals();

    // Also add to teams store if not already added
    loadTeams();
    const reg = pendingApprovalsStore[index];
    const teamExists = teamsRegistryStore.some((t) => t.name.toLowerCase() === reg.teamName.toLowerCase() && t.tournamentId === reg.tournamentId);
    if (!teamExists) {
      teamsRegistryStore.unshift({
        id: Date.now() % 1000000,
        name: reg.teamName,
        tournamentId: reg.tournamentId,
        tournamentName: reg.tournamentName,
        group: "A",
        members: reg.memberCount,
        createdAt: new Date().toISOString(),
      });
      saveTeams();
    }

    recordAuditLog("admin", "Approved Squad Registration", `${reg.teamName} for ${reg.tournamentName}`, "success", req.ip);
    res.json({ success: true, message: `Registration approved for ${reg.teamName}` });
  });

  app.post("/api/approvals/:id/reject", (req, res) => {
    const id = req.params.id;
    const { reason } = req.body || {};
    loadApprovals();
    const index = pendingApprovalsStore.findIndex((r) => r.id === id);
    if (index === -1) return res.status(404).json({ success: false, error: "Registration not found" });

    pendingApprovalsStore[index].status = "rejected";
    if (reason) pendingApprovalsStore[index].notes = `Rejected: ${reason}`;
    saveApprovals();

    recordAuditLog("admin", "Rejected Squad Registration", `${pendingApprovalsStore[index].teamName}: ${reason || "No reason given"}`, "warning", req.ip);
    res.json({ success: true, message: `Registration rejected for ${pendingApprovalsStore[index].teamName}` });
  });

  app.delete("/api/approvals/:id", (req, res) => {
    const id = req.params.id;
    loadApprovals();
    const beforeLen = pendingApprovalsStore.length;
    pendingApprovalsStore = pendingApprovalsStore.filter((r) => r.id !== id);
    saveApprovals();
    recordAuditLog("admin", "Deleted Registration Entry", id, "warning", req.ip);
    res.json({ success: true, removedCount: beforeLen - pendingApprovalsStore.length });
  });

  // =======================================================
  // TEAMS REGISTRY API (Server-Side Pagination & CRUD)
  // =======================================================
  const TEAMS_FILE = path.join(process.cwd(), "data", "teams_registry.json");
  interface TeamRecord {
    id: number;
    name: string;
    tournamentId: number;
    tournamentName?: string;
    group: string;
    members: number;
    createdAt?: string;
  }
  let teamsRegistryStore: TeamRecord[] = [];

  function loadTeams() {
    try {
      if (fs.existsSync(TEAMS_FILE)) {
        const raw = fs.readFileSync(TEAMS_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) teamsRegistryStore = parsed;
      } else {
        teamsRegistryStore = [];
        saveTeams();
      }
    } catch (e) {
      console.warn("Notice loading teams registry:", e);
    }
  }

  function saveTeams() {
    try {
      const dataDir = path.dirname(TEAMS_FILE);
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(TEAMS_FILE, JSON.stringify(teamsRegistryStore, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save teams registry:", e);
    }
  }
  loadTeams();

  app.get("/api/teams", (req, res) => {
    loadTeams();
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);
    const search = String(req.query.search || "").toLowerCase().trim();
    const tournamentId = req.query.tournamentId;

    let filtered = teamsRegistryStore;
    if (tournamentId && tournamentId !== "all") {
      filtered = filtered.filter((t) => String(t.tournamentId) === String(tournamentId));
    }
    if (search) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          (t.tournamentName && t.tournamentName.toLowerCase().includes(search)) ||
          t.group.toLowerCase().includes(search)
      );
    }

    const total = filtered.length;
    if (page && pageSize) {
      const safePage = Math.max(1, page);
      const safePageSize = Math.max(1, pageSize);
      const totalPages = Math.max(1, Math.ceil(total / safePageSize));
      const startIndex = (safePage - 1) * safePageSize;
      const paginated = filtered.slice(startIndex, startIndex + safePageSize);
      return res.json({
        success: true,
        teams: paginated,
        total,
        page: safePage,
        pageSize: safePageSize,
        totalPages,
      });
    }

    res.json({ success: true, teams: filtered, total });
  });

  app.post("/api/teams", (req, res) => {
    const { name, tournamentId, tournamentName, group, members } = req.body || {};
    if (!name || !tournamentId) {
      return res.status(400).json({ success: false, error: "Team name and tournament ID required" });
    }
    loadTeams();
    const newTeam: TeamRecord = {
      id: Date.now() % 1000000,
      name: String(name).trim(),
      tournamentId: Number(tournamentId),
      tournamentName: tournamentName ? String(tournamentName).trim() : `Tournament #${tournamentId}`,
      group: String(group || "A").trim().toUpperCase(),
      members: Number(members || 11),
      createdAt: new Date().toISOString(),
    };
    teamsRegistryStore.unshift(newTeam);
    saveTeams();
    recordAuditLog("admin", "Added Team", `${newTeam.name} to ${newTeam.tournamentName}`, "success", req.ip);
    res.json({ success: true, team: newTeam });
  });

  app.put("/api/teams/:id", (req, res) => {
    const id = Number(req.params.id);
    loadTeams();
    const index = teamsRegistryStore.findIndex((t) => t.id === id);
    if (index === -1) return res.status(404).json({ success: false, error: "Team not found" });

    const { name, group, members, tournamentId, tournamentName } = req.body || {};
    teamsRegistryStore[index] = {
      ...teamsRegistryStore[index],
      ...(name ? { name: String(name).trim() } : {}),
      ...(group ? { group: String(group).trim().toUpperCase() } : {}),
      ...(members !== undefined ? { members: Number(members) } : {}),
      ...(tournamentId ? { tournamentId: Number(tournamentId) } : {}),
      ...(tournamentName ? { tournamentName: String(tournamentName).trim() } : {}),
    };
    saveTeams();
    recordAuditLog("admin", "Edited Team Roster", `${teamsRegistryStore[index].name}`, "success", req.ip);
    res.json({ success: true, team: teamsRegistryStore[index] });
  });

  app.delete("/api/teams/:id", (req, res) => {
    const id = Number(req.params.id);
    loadTeams();
    const existing = teamsRegistryStore.find((t) => t.id === id);
    const beforeLen = teamsRegistryStore.length;
    teamsRegistryStore = teamsRegistryStore.filter((t) => t.id !== id);
    saveTeams();
    if (existing) {
      recordAuditLog("admin", "Disqualified/Removed Team", `${existing.name}`, "warning", req.ip);
    }
    res.json({ success: true, removedCount: beforeLen - teamsRegistryStore.length });
  });

  // =======================================================
  // CUSTOM SPORTS PERSISTENCE API
  // =======================================================
  const CUSTOM_SPORTS_FILE = path.join(process.cwd(), "data", "custom_sports.json");
  const DELETED_SPORTS_FILE = path.join(process.cwd(), "data", "deleted_sports.json");
  let customSportsStore: any[] = [];
  let deletedSportsStore: string[] = [];

  function loadCustomSportsFromDisk() {
    try {
      if (fs.existsSync(CUSTOM_SPORTS_FILE)) {
        const raw = fs.readFileSync(CUSTOM_SPORTS_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          customSportsStore = parsed;
        }
      }
      if (fs.existsSync(DELETED_SPORTS_FILE)) {
        const rawDel = fs.readFileSync(DELETED_SPORTS_FILE, "utf-8");
        const parsedDel = JSON.parse(rawDel);
        if (Array.isArray(parsedDel)) {
          deletedSportsStore = parsedDel;
        }
      }
    } catch (e) {
      console.warn("Notice loading custom sports from disk:", e);
    }
  }

  function saveCustomSportsToDisk() {
    try {
      const dataDir = path.dirname(CUSTOM_SPORTS_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(CUSTOM_SPORTS_FILE, JSON.stringify(customSportsStore, null, 2), "utf-8");
      fs.writeFileSync(DELETED_SPORTS_FILE, JSON.stringify(deletedSportsStore, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save custom sports to disk:", e);
    }
  }

  loadCustomSportsFromDisk();

  app.get("/api/sports", (req, res) => {
    loadCustomSportsFromDisk();
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);
    const search = String(req.query.search || "").toLowerCase().trim();
    const category = String(req.query.category || "all").toLowerCase().trim();

    let list = customSportsStore.filter(
      (s) => !deletedSportsStore.some((d) => d.toLowerCase() === s.name.toLowerCase() || d === String(s.id))
    );

    if (search) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          (s.groundName && s.groundName.toLowerCase().includes(search)) ||
          (s.format && s.format.toLowerCase().includes(search)) ||
          (s.category && s.category.toLowerCase().includes(search))
      );
    }
    if (category !== "all") {
      list = list.filter((s) => s.category && s.category.toLowerCase() === category);
    }

    const total = list.length;
    if (page && pageSize) {
      const safePage = Math.max(1, page);
      const safePageSize = Math.max(1, pageSize);
      const totalPages = Math.max(1, Math.ceil(total / safePageSize));
      const startIndex = (safePage - 1) * safePageSize;
      const paginated = list.slice(startIndex, startIndex + safePageSize);
      return res.json({
        success: true,
        sports: paginated,
        total,
        page: safePage,
        pageSize: safePageSize,
        totalPages,
        deleted: deletedSportsStore,
      });
    }

    res.json({ success: true, sports: customSportsStore, deleted: deletedSportsStore, total });
  });

  app.post("/api/sports", (req, res) => {
    const { name, groundName, surface, format, rules, description, accentColor, category } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: "Sport name is required." });
    }

    loadCustomSportsFromDisk();

    const cleanName = name.trim();
    // If it was in deletedSportsStore, un-delete it
    deletedSportsStore = deletedSportsStore.filter((d) => d.toLowerCase() !== cleanName.toLowerCase());

    // Check if already exists
    const existing = customSportsStore.find((s) => s.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      saveCustomSportsToDisk();
      return res.json({ success: true, data: existing, message: "Sport already exists" });
    }

    const nextId = 100 + customSportsStore.length + 1;
    const newSport = {
      id: nextId,
      name: cleanName,
      groundName: (groundName || "").trim() || `${cleanName} Arena`,
      surface: (surface || "").trim() || "Natural / Synthetic",
      format: (format || "").trim() || "Standard Competition",
      category: (category || "Arena").trim(),
      rules: (rules || "").trim() || "Standard Official Rules",
      description: (description || "").trim() || `Official competition discipline for ${cleanName}.`,
      accentColor: accentColor || "#10b981",
      image: `${cleanName.toLowerCase().replace(/\s+/g, "")}.jpg`,
      createdAt: new Date().toISOString(),
    };

    customSportsStore.push(newSport);
    saveCustomSportsToDisk();
    recordAuditLog("admin", "Created Sport Discipline", `${cleanName} (ID: ${nextId})`, "success", req.ip);

    console.log(`[Backend Sports] New sport added: ${cleanName} (ID: ${nextId})`);
    res.json({ success: true, data: newSport, message: `Sport "${cleanName}" saved successfully.` });
  });

  // Update sport details
  app.patch("/api/sports/:id", (req, res) => {
    const target = req.params.id;
    const { groundName, surface, format, rules, description, accentColor, name, category } = req.body || {};
    loadCustomSportsFromDisk();

    const index = customSportsStore.findIndex(
      (s) => String(s.id) === String(target) || s.name.toLowerCase() === String(target).toLowerCase()
    );

    if (index >= 0) {
      const existing = customSportsStore[index];
      customSportsStore[index] = {
        ...existing,
        name: name?.trim() || existing.name,
        groundName: groundName !== undefined ? groundName.trim() : existing.groundName,
        surface: surface !== undefined ? surface.trim() : existing.surface,
        format: format !== undefined ? format.trim() : existing.format,
        category: category !== undefined ? category.trim() : existing.category,
        rules: rules !== undefined ? rules.trim() : existing.rules,
        description: description !== undefined ? description.trim() : existing.description,
        accentColor: accentColor || existing.accentColor,
        updatedAt: new Date().toISOString(),
      };
      saveCustomSportsToDisk();
      recordAuditLog("admin", "Updated Sport Discipline", `${customSportsStore[index].name}`, "success", req.ip);
      return res.json({ success: true, data: customSportsStore[index] });
    } else {
      // If it was a base sport, add it to customSportsStore with the customized details!
      const nextId = Number(target) || 100 + customSportsStore.length + 1;
      const cleanName = (name || target).trim();
      const newOverride = {
        id: nextId,
        name: cleanName,
        groundName: groundName?.trim() || `${cleanName} Arena`,
        surface: surface?.trim() || "Natural / Synthetic",
        format: format?.trim() || "Standard Competition",
        category: category?.trim() || "Arena",
        rules: rules?.trim() || "Standard Official Rules",
        description: description?.trim() || `Sanctioned competition discipline for ${cleanName}.`,
        accentColor: accentColor || "#10b981",
        updatedAt: new Date().toISOString(),
      };
      customSportsStore.push(newOverride);
      saveCustomSportsToDisk();
      recordAuditLog("admin", "Updated Sport Discipline", `${cleanName}`, "success", req.ip);
      return res.json({ success: true, data: newOverride });
    }
  });

  // Delete sport endpoint
  app.delete("/api/sports/:id", (req, res) => {
    const target = req.params.id;
    const targetName = (req.query.name as string) || "";
    loadCustomSportsFromDisk();

    const beforeLen = customSportsStore.length;
    customSportsStore = customSportsStore.filter((s) => {
      const matchId = String(s.id) === String(target);
      const matchName =
        s.name.toLowerCase() === String(target).toLowerCase() ||
        (targetName && s.name.toLowerCase() === targetName.toLowerCase());
      return !matchId && !matchName;
    });

    // Mark as deleted in tombstone store
    const tombstoneEntries = [String(target)];
    if (targetName) tombstoneEntries.push(targetName.toLowerCase());
    tombstoneEntries.forEach((entry) => {
      if (!deletedSportsStore.some((d) => d.toLowerCase() === entry.toLowerCase())) {
        deletedSportsStore.push(entry);
      }
    });

    saveCustomSportsToDisk();
    recordAuditLog("admin", "Deleted Sport Discipline", `${targetName || target}`, "warning", req.ip);
    console.log(`[Backend Sports] Sport removed: ${target} / ${targetName}. Store size: ${customSportsStore.length}`);
    res.json({ success: true, removedCount: beforeLen - customSportsStore.length });
  });

  // =======================================================
  // TOURNAMENT DATE & DEADLINE MANAGEMENT API
  // =======================================================
  const TOURNAMENT_OVERRIDES_FILE = path.join(process.cwd(), "data", "tournament_overrides.json");
  let tournamentOverrides: Record<string, any> = {};

  function loadTournamentOverrides() {
    try {
      if (fs.existsSync(TOURNAMENT_OVERRIDES_FILE)) {
        const raw = fs.readFileSync(TOURNAMENT_OVERRIDES_FILE, "utf-8");
        tournamentOverrides = JSON.parse(raw) || {};
      }
    } catch (e) {
      console.warn("Notice loading tournament overrides:", e);
    }
  }

  function saveTournamentOverrides() {
    try {
      const dataDir = path.dirname(TOURNAMENT_OVERRIDES_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(TOURNAMENT_OVERRIDES_FILE, JSON.stringify(tournamentOverrides, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save tournament overrides:", e);
    }
  }

  loadTournamentOverrides();

  app.get("/api/tournaments/overrides", (req, res) => {
    loadTournamentOverrides();
    res.json({ success: true, overrides: tournamentOverrides });
  });

  app.patch("/api/tournaments/:id/dates", (req, res) => {
    const id = req.params.id;
    const { lastRegistrationDate, date } = req.body || {};

    if (!lastRegistrationDate && !date) {
      return res.status(400).json({ success: false, error: "Must provide lastRegistrationDate or date" });
    }

    loadTournamentOverrides();
    tournamentOverrides[id] = {
      ...(tournamentOverrides[id] || {}),
      ...(lastRegistrationDate ? { lastRegistrationDate } : {}),
      ...(date ? { date } : {}),
      updatedAt: new Date().toISOString(),
    };
    saveTournamentOverrides();

    console.log(`[Tournament Dates] Updated dates for tournament ${id}:`, tournamentOverrides[id]);
    res.json({ success: true, id, dates: tournamentOverrides[id], message: "Tournament dates updated successfully." });
  });

  // 2. Backend Logout API:
  // Receives token, removes it from backend sessions JSON store.
  app.post("/api/auth/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    let token = req.body?.token;

    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (token && activeSessionsJSON[token]) {
      const username = activeSessionsJSON[token].username;
      delete activeSessionsJSON[token];
      console.log(
        `[Backend Auth] Logout: removed token for "${username}" from backend sessions JSON. Remaining active: ${
          Object.keys(activeSessionsJSON).length
        }`
      );
      return res.json({
        success: true,
        message: "Token successfully removed from backend session JSON.",
      });
    }

    // Token wasn't found or already removed
    if (token) {
      delete activeSessionsJSON[token];
    }

    return res.json({
      success: true,
      message: "Logged out and token cleared.",
    });
  });

  // 3. Verify Session API:
  // Checks if token exists in backend sessions JSON.
  app.get("/api/auth/session", (req, res) => {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.query.token) {
      token = String(req.query.token);
    }

    if (!token || !activeSessionsJSON[token]) {
      return res.status(401).json({ authenticated: false, message: "No active token found in backend JSON" });
    }

    return res.json({
      authenticated: true,
      user: activeSessionsJSON[token],
    });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    // Serve static assets, excluding index.html which we customize with runtime env injection
    app.use(express.static(distPath, { index: false }));

    app.get("*", (_req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, "utf8");
        const runtimeEnv = {
          VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
          VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
        };
        const scriptInjection = `<script>window.__ENV__ = ${JSON.stringify(runtimeEnv)};</script>`;
        html = html.replace("<head>", `<head>${scriptInjection}`);
        res.setHeader("Content-Type", "text/html");
        res.send(html);
      } else {
        res.status(404).send("Build output not found. Please run npm run build.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
