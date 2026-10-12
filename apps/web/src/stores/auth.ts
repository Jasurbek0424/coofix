"use client";

import { create } from "zustand";
import type { User } from "@/lib/api/types";

export type AuthStatus = "loading" | "authenticated" | "guest";

interface AuthState {
  status: AuthStatus;
  user: User | null;
}

/** Session state only — the access token itself stays inside lib/api/client.ts. */
export const useAuth = create<AuthState>(() => ({ status: "loading", user: null }));
