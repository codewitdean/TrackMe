"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearToken, getToken, setToken } from "@/services/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    role?: "user" | "admin";
    adminCode?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCurrentUser() {
      if (!getToken()) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.auth.me();
        if (active) setUser(response.user);
      } catch {
        clearToken();
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await api.auth.login({ email, password });
      setToken(response.token);
      setUser(response.user);
      router.push("/dashboard");
    },
    [router]
  );

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      role?: "user" | "admin";
      adminCode?: string;
    }) => {
      const response = await api.auth.register(input);
      setToken(response.token);
      setUser(response.user);
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout
    }),
    [isLoading, login, logout, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
