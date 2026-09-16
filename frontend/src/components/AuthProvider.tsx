"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";

interface AuthContextValue {
  user: api.User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: api.RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<api.User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    if (!api.getAccessToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setUser(await api.getMe());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    (async () => {
      if (!api.getAccessToken()) {
        if (!ignore) setLoading(false);
        return;
      }
      try {
        const me = await api.getMe();
        if (!ignore) setUser(me);
      } catch {
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    function handleSessionExpired() {
      setUser(null);
      router.push("/login");
    }

    window.addEventListener("tms:session-expired", handleSessionExpired);
    return () => {
      ignore = true;
      window.removeEventListener("tms:session-expired", handleSessionExpired);
    };
  }, [router]);

  async function login(username: string, password: string) {
    await api.loginUser({ username, password });
    await loadUser();
  }

  async function register(payload: api.RegisterInput) {
    const data = await api.registerUser(payload);
    api.setTokens({ access: data.access, refresh: data.refresh });
    setUser(data.user);
  }

  async function logout() {
    await api.logoutUser();
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
