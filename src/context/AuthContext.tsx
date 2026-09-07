import React, { createContext, useContext, useState, useEffect } from "react";

export interface AuthUser {
  username: string;
  name: string;
  role: string;
  loggedInAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "arenasync_auth_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to persist auth state:", e);
    }
  }, [user]);

  const login = (usernameInput: string, passwordInput: string) => {
    const trimmedUser = usernameInput.trim();
    const trimmedPass = passwordInput.trim();

    // Required credentials: userName: admin123, password: admin123
    if (
      (trimmedUser === "admin123" || trimmedUser.toLowerCase() === "admin123") &&
      trimmedPass === "admin123"
    ) {
      const authenticatedUser: AuthUser = {
        username: "admin123",
        name: "Admin User",
        role: "Administrator",
        loggedInAt: new Date().toISOString(),
      };
      setUser(authenticatedUser);
      return { success: true };
    }

    return {
      success: false,
      error: "Invalid credentials. Use userName: admin123 and password: admin123",
    };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to remove auth item:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        logout,
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
