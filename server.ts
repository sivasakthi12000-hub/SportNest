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
  app.get("/api/admin/organizers", (_req, res) => {
    res.json({
      success: true,
      totalTracked: trackedOrganizersStore.length,
      organizers: trackedOrganizersStore,
    });
  });

  // Admin User & Role Management endpoints (Super Admin only)
  app.get("/api/admin/users", (_req, res) => {
    const list = Object.entries(registeredAdminsStore).map(([uname, data]) => {
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
    res.json({ success: true, users: list });
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

    // Update tracked
    const tracked = trackedOrganizersStore.find((t) => t.username.toLowerCase() === username.toLowerCase());
    if (tracked) {
      if (name) tracked.name = name;
      if (email) tracked.email = email;
      if (role) tracked.role = user.role;
    }
    saveAdminsToDisk();
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
      return res.json({ success: true, message: `User status updated to ${(user as any).status}` });
    }
    res.status(404).json({ success: false, error: "User not found" });
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
    res.json({ success: true, sports: customSportsStore, deleted: deletedSportsStore });
  });

  app.post("/api/sports", (req, res) => {
    const { name, groundName, surface, format, rules, description, accentColor } = req.body || {};
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
      rules: (rules || "").trim() || "Standard Official Rules",
      description: (description || "").trim() || `Official competition discipline for ${cleanName}.`,
      accentColor: accentColor || "#10b981",
      image: `${cleanName.toLowerCase().replace(/\s+/g, "")}.jpg`,
      createdAt: new Date().toISOString(),
    };

    customSportsStore.push(newSport);
    saveCustomSportsToDisk();

    console.log(`[Backend Sports] New sport added: ${cleanName} (ID: ${nextId})`);
    res.json({ success: true, data: newSport, message: `Sport "${cleanName}" saved successfully.` });
  });

  // Update sport details
  app.patch("/api/sports/:id", (req, res) => {
    const target = req.params.id;
    const { groundName, surface, format, rules, description, accentColor, name } = req.body || {};
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
        rules: rules !== undefined ? rules.trim() : existing.rules,
        description: description !== undefined ? description.trim() : existing.description,
        accentColor: accentColor || existing.accentColor,
        updatedAt: new Date().toISOString(),
      };
      saveCustomSportsToDisk();
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
        rules: rules?.trim() || "Standard Official Rules",
        description: description?.trim() || `Sanctioned competition discipline for ${cleanName}.`,
        accentColor: accentColor || "#10b981",
        updatedAt: new Date().toISOString(),
      };
      customSportsStore.push(newOverride);
      saveCustomSportsToDisk();
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
