"use client";

import { useQueryClient } from "@tanstack/react-query";
import { apiFetch, applySession, logoutRequest } from "@/lib/api/client";
import type { TokenOut, User } from "@/lib/api/types";
import { useAuth } from "@/stores/auth";

const channel = () => (typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("coofix-auth") : null);

export function broadcastAuth(type: "login" | "logout") {
  const ch = channel();
  ch?.postMessage(type);
  ch?.close();
}

export interface RegisterInput {
  email: string;
  password: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
}

/** Imperative auth actions. Guest cart/favorites are merged by SessionProvider on sign-in. */
export function useSessionActions() {
  const qc = useQueryClient();

  const finish = (session: TokenOut) => {
    applySession(session);
    broadcastAuth("login");
    return session.user;
  };

  return {
    login: async (email: string, password: string): Promise<User> =>
      finish(await apiFetch<TokenOut>("/auth/login", { method: "POST", body: { email, password } })),
    register: async (data: RegisterInput): Promise<User> =>
      finish(await apiFetch<TokenOut>("/auth/register", { method: "POST", body: data })),
    logout: async () => {
      await logoutRequest();
      broadcastAuth("logout");
      qc.removeQueries({ queryKey: ["cart"] });
      qc.removeQueries({ queryKey: ["favorites"] });
      qc.removeQueries({ queryKey: ["orders"] });
      qc.removeQueries({ queryKey: ["order"] });
    },
    setUser: (user: User) => useAuth.setState({ user }),
  };
}
