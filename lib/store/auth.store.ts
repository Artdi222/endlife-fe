import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser } from "@/lib/types";

// Cookie name Next.js middleware reads for server-side route protection.
// Plain (not httpOnly) so client JS can write it.
const COOKIE_NAME = "auth_token";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;

  // Call after a successful login or register API response
  setAuth: (token: string, user: AuthUser) => void;

  // Clears all auth state and the middleware cookie
  clearAuth: () => void;
}

// ── Cookie helpers ────────────────────────────────────────────────────────────
// Sets a short-lived (7 day) plain cookie so Next.js middleware.ts can read it
// on the server without needing httpOnly (which JS can't write).
function setCookie(token: string) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${token}; path=/; expires=${expires}; SameSite=Lax`;
}

function deleteCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        setCookie(token); // write cookie for middleware
        set({ token, user, isAuthenticated: true });
      },

      clearAuth: () => {
        deleteCookie();
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth", // localStorage key — replaces "admin_token" / "admin_role"
      storage: createJSONStorage(() => localStorage),
      // Only persist token + user; isAuthenticated is derived on rehydration
      partialize: (s) => ({ token: s.token, user: s.user }),
      // Re-derive isAuthenticated after rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!(state.token && state.user);
          // Re-sync cookie in case it expired while localStorage persisted
          if (state.token) setCookie(state.token);
        }
      },
    },
  ),
);
