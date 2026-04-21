// Minimal client-side auth helper used by UI components.
// This is intentionally lightweight: it exposes a useAuth() hook
// with a setAuth(token, user) method that stores the token/user
// in localStorage/sessionStorage. Replace with your real auth
// context/provider when available.

import { useSession } from "next-auth/react";

export type AuthUser = Record<string, unknown> | null;

export function useAuth() {
  const { data: session, status } = useSession();

  // Persist token and user in localStorage for dev convenience.
  const setAuth = async (token: string | null, user: AuthUser) => {
    // Only run on client side
    if (typeof window === "undefined") return;
    
    try {
      if (token) {
        localStorage.setItem("authToken", String(token));
      } else {
        localStorage.removeItem("authToken");
      }

      if (user) {
        localStorage.setItem("authUser", JSON.stringify(user));
      } else {
        localStorage.removeItem("authUser");
      }

      // You may want to broadcast state changes (storage event, custom event)
      // or call a global state manager here. For now this is a simple setter.
    } catch (err) {
      // swallow storage errors in constrained environments
      console.warn("setAuth failed", err);
    }
  };

  const clearAuth = async () => setAuth(null, null);

  // Check if user is authenticated via NextAuth or custom auth
  const isAuthenticated = status === "authenticated" || (typeof window !== "undefined" && !!localStorage.getItem("authToken"));

  // Get user data from NextAuth session or localStorage
  const currentUser = session?.user || (() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("authUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  return {
    setAuth,
    clearAuth,
    isAuthenticated,
    user: currentUser,
    session,
    sessionStatus: status
  } as const;
}

export default useAuth;
