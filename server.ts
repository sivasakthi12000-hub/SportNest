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
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      supabaseConfigured: Boolean(
        process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
      ),
    });
  });

  // Runtime environment config API for frontend clients
  app.get("/api/config", (_req, res) => {
    res.json({
      supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
    });
  });

  // 1. Backend Login API:
  // Receives username & password, validates, generates token on backend,
  // references the session in backend sessions JSON, and returns JSON with token.
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body || {};
    const trimmedUser = String(username || "").trim();
    const trimmedPass = String(password || "").trim();

    if (
      (trimmedUser === "admin123" || trimmedUser.toLowerCase() === "admin123") &&
      trimmedPass === "admin123"
    ) {
      const token = generateBackendToken("admin123");
      const now = new Date();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const session: UserSession = {
        username: "admin123",
        name: "Admin User",
        role: "Administrator",
        email: "sivasakthi12000@gmail.com",
        token,
        tokenType: "Bearer",
        loggedInAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      // Store in backend active sessions JSON
      activeSessionsJSON[token] = session;

      console.log(
        `[Backend Auth] Login: user "${session.username}" generated token: ${token.substring(
          0,
          20
        )}... Total active sessions: ${Object.keys(activeSessionsJSON).length}`
      );

      return res.json({
        success: true,
        token,
        tokenType: "Bearer",
        user: session,
        message: "Token generated in backend and stored in session JSON",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Invalid credentials. Use userName: admin123 and password: admin123",
    });
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
