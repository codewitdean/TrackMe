import type { AdminAnalytics, DashboardStats, Habit, HabitLog, ParsedEntry, User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "trackme_token";

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

export class ApiError extends Error {
  status: number;
  errors?: Array<{ path: string; message: string }>;

  constructor(message: string, status: number, errors?: Array<{ path: string; message: string }>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message ?? "Request failed", response.status, data.errors);
  }

  return data as T;
}

export const api = {
  auth: {
    register(input: {
      name: string;
      email: string;
      password: string;
      role?: "user" | "admin";
      adminCode?: string;
    }) {
      return request<{ user: User; token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
        auth: false
      });
    },
    login(input: { email: string; password: string }) {
      return request<{ user: User; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
        auth: false
      });
    },
    me() {
      return request<{ user: User }>("/auth/me");
    }
  },
  habits: {
    list() {
      return request<{ habits: Habit[] }>("/habits");
    },
    create(input: Partial<Habit>) {
      return request<{ habit: Habit }>("/habits", {
        method: "POST",
        body: JSON.stringify(input)
      });
    },
    get(id: string) {
      return request<{ habit: Habit }>(`/habits/${id}`);
    },
    update(id: string, input: Partial<Habit>) {
      return request<{ habit: Habit }>(`/habits/${id}`, {
        method: "PUT",
        body: JSON.stringify(input)
      });
    },
    remove(id: string) {
      return request<void>(`/habits/${id}`, {
        method: "DELETE"
      });
    }
  },
  logs: {
    list() {
      return request<{ logs: HabitLog[] }>("/logs");
    },
    create(input: {
      habitId?: string;
      rawText: string;
      parsedHabitName: string;
      quantity: number;
      unit: string;
      date: string;
      category: string;
    }) {
      return request<{ log: HabitLog }>("/logs", {
        method: "POST",
        body: JSON.stringify(input)
      });
    },
    stats() {
      return request<{ stats: DashboardStats }>("/logs/stats");
    },
    recent() {
      return request<{ logs: HabitLog[] }>("/logs/recent");
    }
  },
  nlp: {
    parse(text: string) {
      return request<{ parsed: ParsedEntry }>("/nlp/parse", {
        method: "POST",
        body: JSON.stringify({ text })
      });
    }
  },
  admin: {
    analytics() {
      return request<{ analytics: AdminAnalytics }>("/admin/analytics");
    }
  }
};
