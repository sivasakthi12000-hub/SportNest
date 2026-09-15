import React, { createContext, useContext, useState, useEffect } from "react";

export interface AuthUser {
  username: string;
  name: string;
  role: string;
  email?: string;
  token: string;
  tokenType: string;
  loggedInAt: string;
  expiresAt: string;
}

export interface LoginResponse {
  success: boolean;
  error?: string;
  token?: string;
  user?: AuthUser;
  json?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  registerAdmin: (username: string, password: string, email?: string, name?: string) => Promise<LoginResponse>;
  logout: () => void;
  getUserJSON: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "sportsnest_auth_user";
const TOKEN_KEY = "sportsnest_auth_token";
const ADMIN_ACCOUNTS_KEY = "sportsnest_registered_admins_v2";

interface StoredAdminAccount {
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
}

const DEFAULT_ADMIN_ACCOUNTS: StoredAdminAccount[] = [
  {
    username: "admin123",
    password: "admin123",
    name: "Sivasakthi (Super Admin)",
    email: "sivasakthi12000@gmail.com",
    role: "superadmin",
  },
  {
    username: "sakthi01",
    password: "Sakthi@53",
    name: "sakthi01 (Tournament Organizer)",
    email: "sakthi01@sportsnest.app",
    role: "admin",
  },
];

function getStoredAccounts(): StoredAdminAccount[] {
  try {
    const raw = localStorage.getItem(ADMIN_ACCOUNTS_KEY);
    if (!raw) return DEFAULT_ADMIN_ACCOUNTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const usernames = new Set(parsed.map((a: any) => String(a.username).toLowerCase()));
      const merged = [...parsed];
      for (const def of DEFAULT_ADMIN_ACCOUNTS) {
        if (!usernames.has(def.username.toLowerCase())) {
          merged.push(def);
        }
      }
      return merged;
    }
  } catch (e) {
    console.warn("Failed to parse stored admin accounts:", e);
  }
  return DEFAULT_ADMIN_ACCOUNTS;
}

function saveStoredAccount(account: StoredAdminAccount) {
  try {
    const existing = getStoredAccounts();
    const filtered = existing.filter(
      (a) => a.username.toLowerCase() !== account.username.toLowerCase()
    );
    filtered.push(account);
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn("Failed to persist stored admin account:", e);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("arenasync_auth_user");
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user && user.token) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(TOKEN_KEY, user.token);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.error("Failed to persist auth state:", e);
    }
  }, [user]);

  /**
   * Login: calls backend API /api/auth/login to generate the token on the backend,
   * with guaranteed fallback and synchronization for tournament organizers and admins.
   */
  const login = async (usernameInput: string, passwordInput: string): Promise<LoginResponse> => {
    const trimmedUser = usernameInput.trim();
    const trimmedPass = passwordInput.trim();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedUser, password: trimmedPass }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        const authenticatedUser: AuthUser = data.user;
        setUser(authenticatedUser);

        const sessionJSON = JSON.stringify(authenticatedUser, null, 2);
        try {
          localStorage.setItem(STORAGE_KEY, sessionJSON);
          localStorage.setItem(TOKEN_KEY, data.token);
          saveStoredAccount({
            username: authenticatedUser.username,
            password: trimmedPass,
            name: authenticatedUser.name,
            email: authenticatedUser.email || `${authenticatedUser.username}@sportsnest.app`,
            role: authenticatedUser.role,
          });
        } catch (e) {
          console.error("Failed to save to localStorage:", e);
        }

        return {
          success: true,
          token: data.token,
          user: authenticatedUser,
          json: sessionJSON,
        };
      }
    } catch (error: any) {
      console.warn("Backend API login request error, checking local organizer credentials:", error);
    }

    // 2. Resilient fallback check: check stored accounts (including sakthi01 and admin123)
    const storedAccounts = getStoredAccounts();
    const matchedAccount = storedAccounts.find(
      (a) =>
        a.username.toLowerCase() === trimmedUser.toLowerCase() &&
        a.password === trimmedPass
    );

    if (matchedAccount) {
      const fallbackToken = `ast_${matchedAccount.username}_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
      const now = new Date();
      const expiresDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const authenticatedUser: AuthUser = {
        username: matchedAccount.username,
        name: matchedAccount.name || matchedAccount.username,
        role: matchedAccount.role,
        email: matchedAccount.email || `${matchedAccount.username}@sportsnest.app`,
        token: fallbackToken,
        tokenType: "Bearer",
        loggedInAt: now.toISOString(),
        expiresAt: expiresDate.toISOString(),
      };

      setUser(authenticatedUser);
      const sessionJSON = JSON.stringify(authenticatedUser, null, 2);
      try {
        localStorage.setItem(STORAGE_KEY, sessionJSON);
        localStorage.setItem(TOKEN_KEY, fallbackToken);
      } catch (e) {
        console.error("Failed to save session to localStorage:", e);
      }

      // Re-sync with backend in case backend restarted
      fetch("/api/auth/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: matchedAccount.username,
          password: matchedAccount.password,
          email: matchedAccount.email,
          name: matchedAccount.name,
        }),
      }).catch((e) => console.warn("Background auth re-sync notice:", e));

      return {
        success: true,
        token: fallbackToken,
        user: authenticatedUser,
        json: sessionJSON,
      };
    }

    return {
      success: false,
      error: "Invalid credentials. If you are superadmin use admin123 / admin123, or use your tournament organizer credentials.",
    };
  };

  /**
   * Register Organizer Admin: registers user credentials with backend /api/auth/register-admin,
   * sets role to "admin", generates backend session token, and saves session JSON.
   */
  const registerAdmin = async (
    usernameInput: string,
    passwordInput: string,
    emailInput?: string,
    nameInput?: string
  ): Promise<LoginResponse> => {
    const trimmedUser = usernameInput.trim();
    const trimmedPass = passwordInput.trim();
    const isSuperAdmin = trimmedUser.toLowerCase() === "admin123" || emailInput === "sivasakthi12000@gmail.com";
    const role = isSuperAdmin ? "superadmin" : "admin";
    const userEmail = emailInput || `${trimmedUser}@sportsnest.app`;
    const displayName = nameInput || trimmedUser;

    // Cache locally immediately
    saveStoredAccount({
      username: trimmedUser,
      password: trimmedPass,
      email: userEmail,
      name: displayName,
      role,
    });

    try {
      const response = await fetch("/api/auth/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: trimmedUser,
          password: trimmedPass,
          email: userEmail,
          name: displayName,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        const authenticatedUser: AuthUser = data.user;
        setUser(authenticatedUser);

        const sessionJSON = JSON.stringify(authenticatedUser, null, 2);
        try {
          localStorage.setItem(STORAGE_KEY, sessionJSON);
          localStorage.setItem(TOKEN_KEY, data.token);
        } catch (e) {
          console.error("Failed to save to localStorage:", e);
        }

        return {
          success: true,
          token: data.token,
          user: authenticatedUser,
          json: sessionJSON,
        };
      }

      return {
        success: false,
        error: data.error || "Failed to register organizer admin account.",
      };
    } catch (error: any) {
      console.warn("Backend register admin error, using resilient fallback:", error);
      const fallbackToken = `ast_${trimmedUser}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const now = new Date();
      const expiresDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const authenticatedUser: AuthUser = {
        username: trimmedUser,
        name: displayName,
        role,
        email: userEmail,
        token: fallbackToken,
        tokenType: "Bearer",
        loggedInAt: now.toISOString(),
        expiresAt: expiresDate.toISOString(),
      };

      setUser(authenticatedUser);
      const sessionJSON = JSON.stringify(authenticatedUser, null, 2);
      localStorage.setItem(STORAGE_KEY, sessionJSON);
      localStorage.setItem(TOKEN_KEY, fallbackToken);

      return {
        success: true,
        token: fallbackToken,
        user: authenticatedUser,
        json: sessionJSON,
      };
    }
  };

  /**
   * Logout: calls real backend API /api/auth/logout to delete the token from
   * the backend session JSON store, and removes token/user from local storage.
   */
  const logout = () => {
    const currentToken = user?.token || localStorage.getItem(TOKEN_KEY);

    if (currentToken) {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ token: currentToken }),
      }).catch((err) => {
        console.warn("Backend logout notification failed:", err);
      });
    }

    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error("Failed to remove auth items:", e);
    }
  };

  const getUserJSON = (): string | null => {
    if (!user) return null;
    return JSON.stringify(user, null, 2);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: user?.token || null,
        isAuthenticated: Boolean(user && user.token),
        login,
        registerAdmin,
        logout,
        getUserJSON,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

