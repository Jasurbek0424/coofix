import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { login as apiLogin, logout as apiLogout, onSessionChange, refreshSession } from "@/api/client";
import type { User } from "@/api/types";
import { can, type Permission } from "./permissions";

type Status = "loading" | "authenticated" | "anonymous";

interface AuthState {
  status: Status;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (p: Permission) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const off = onSessionChange((u) => {
      setUser(u);
      setStatus(u ? "authenticated" : "anonymous");
      if (!u) qc.clear();
    });
    // Silent refresh on load: the httpOnly cookie restores the session.
    void refreshSession().then((tok) => {
      if (!tok) setStatus("anonymous");
    });
    return () => {
      off();
    };
  }, [qc]);

  const login = useCallback(async (email: string, password: string) => {
    await apiLogin(email, password);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
  }, []);

  const value = useMemo<AuthState>(
    () => ({ status, user, login, logout, can: (p) => can(user?.role, p) }),
    [status, user, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthState {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
