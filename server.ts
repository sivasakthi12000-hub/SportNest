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

// Registered admin accounts store (username -> { password, name, email, role })
const registeredAdminsStore: Record<string, { password: string; name: string; email: string; role: string }> = {
  admin123: {
    password: "admin123",
    name: "Sivasakthi (Owner)",
    email: "sivasakthi12000@gmail.com",
    role: "superadmin",
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

const trackedOrganizersStore: TrackedOrganizer[] = [
  {
    username: "admin123",
    name: "Sivasakthi (Owner)",
    email: "sivasakthi12000@gmail.com",
    role: "superadmin",
    createdAt: new Date().toISOString(),
    tournamentCount: 50,
  },
];

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

    // Check against registered accounts store
    const account = registeredAdminsStore[trimmedUser] || registeredAdminsStore[trimmedUser.toLowerCase()];

    if (account && account.password === trimmedPass) {
      const token = generateBackendToken(trimmedUser);
      const now = new Date();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const session: UserSession = {
        username: trimmedUser,
        name: account.name || trimmedUser,
        role: account.role || "admin",
        email: account.email || `${trimmedUser}@sportsnest.app`,
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
      return res.json({ success: true, message: `User status updated to ${(user as any).status}` });
    }
    res.status(404).json({ success: false, error: "User not found" });
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
