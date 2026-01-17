import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as loginAPI, logout as logoutAPI, getProfile, loginWithGoogle as loginWithGoogleAPI } from "@/api/auth";
import type { User, AuthResponse } from "@/types/user";

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean; // Hydration state

  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useUser = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginAPI({ email, password });
          const data = response as AuthResponse;

          // Backend accessToken yoki token field'ini tekshirish
          const token = data.accessToken || data.token;

          if (data.success && data.user && token) {
            set({
              user: data.user,
              token: token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else if (data.user && token) {
            // success flag bo'lmasa ham user va token bo'lsa
            set({
              user: data.user,
              token: token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              error: data.message || "Login failed. Please check your credentials.",
            });
            throw new Error(data.message || "Login failed");
          }
        } catch (error) {
          console.error("Login error in store:", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "An error occurred during login",
          });
          throw error;
        }
      },

      loginWithGoogle: async (idToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginWithGoogleAPI({ idToken });
          const data = response as AuthResponse;

          // Backend accessToken yoki token field'ini tekshirish
          const token = data.accessToken || data.token;

          if (data.success && data.user && token) {
            set({
              user: data.user,
              token: token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else if (data.user && token) {
            // success flag bo'lmasa ham user va token bo'lsa
            set({
              user: data.user,
              token: token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              error: data.message || "Google login failed",
            });
            throw new Error(data.message || "Google login failed");
          }
        } catch (error) {
          console.error("Google login error in store:", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "An error occurred during Google login",
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await logoutAPI();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchProfile: async () => {
        const { token } = get();
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await getProfile();
          const data = response as { success: boolean; user?: User };

          if (data.success && data.user) {
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch profile",
          });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setToken: (token: string | null) => {
        set({ token });
      },

      clearError: () => {
        set({ error: null });
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // _hasHydrated persist qilinmaydi
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("Failed to rehydrate user storage:", error);
            return;
          }
          // Reload qilinganda token va isAuthenticated'ni to'g'ri restore qilish
          if (state?.token) {
            // Token bo'lsa, isAuthenticated'ni true qilish
            state.isAuthenticated = true;
          } else {
            // Token bo'lmasa, isAuthenticated'ni false qilish
            if (state) {
              state.isAuthenticated = false;
              state.user = null;
            }
          }
          // Hydration tugaganligini belgilash
          if (state) {
            state._hasHydrated = true;
          }
        };
      },
    }
  )
);
