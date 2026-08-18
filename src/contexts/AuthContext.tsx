import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: "student" | "admin" | "teacher";
  isActive: boolean;
  registrationSource?: "self-service" | "admin";
  adminReviewStatus?: "new" | "reviewed";
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ token: string; user: AuthUser }>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "najah_auth";

const readStoredAuth = () => {
  if (typeof window === "undefined") return { token: null, user: null };

  const cached = localStorage.getItem(STORAGE_KEY);
  if (!cached) return { token: null, user: null };

  try {
    const parsed = JSON.parse(cached) as { token?: string; user?: AuthUser };
    return {
      token: parsed.token ?? null,
      user: parsed.user ?? null
    };
  } catch {
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const initialAuth = readStoredAuth();
  const [token, setToken] = useState<string | null>(initialAuth.token);
  const [user, setUser] = useState<AuthUser | null>(initialAuth.user);

  useEffect(() => {
    if (initialAuth.token) {
      apiFetch<{ data: { user: AuthUser } }>("/auth/me", {
        token: initialAuth.token
      })
        .then((response) => {
          setUser(response.data.user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: initialAuth.token, user: response.data.user }));
        })
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem(STORAGE_KEY);
        });
    }
  }, [initialAuth.token]);

  const persist = (nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
  };

  const login = async (email: string, password: string) => {
    const response = await apiFetch<{
      data: { token: string; user: AuthUser };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    persist(response.data.token, response.data.user);
    return { token: response.data.token, user: response.data.user };
  };

  const register = async (fullName: string, email: string, password: string) => {
    await apiFetch("/auth/register-student", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password })
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(() => ({ token, user, login, register, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
