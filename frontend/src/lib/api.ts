export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export type TaskStatus = "pending" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  owner: string;
  created_at: string;
  updated_at: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_date?: string | null;
}

export type TaskOrdering = "-created_at" | "due_date_sort" | "priority_rank";

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  page?: number;
  ordering?: TaskOrdering;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface ChangePasswordInput {
  old_password: string;
  new_password: string;
  new_password2: string;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown, message?: string) {
    super(message || `Request failed with status ${status}`);
    this.status = status;
    this.data = data;
  }
}

const ACCESS_KEY = "tms_access";
const REFRESH_KEY = "tms_refresh";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens: { access: string; refresh: string }): void {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function notifySessionExpired(): void {
  clearTokens();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("tms:session-expired"));
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const res = await fetch(`${API_URL}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return null;

  const data = await res.json();
  setTokens({ access: data.access, refresh: data.refresh ?? refresh });
  return data.access as string;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  auth?: boolean;
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, body, ...rest } = options;

  const doFetch = async (token: string | null) => {
    const finalHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(headers as Record<string, string> | undefined),
    };
    if (auth && token) finalHeaders["Authorization"] = `Bearer ${token}`;

    return fetch(`${API_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch(auth ? getAccessToken() : null);

  if (auth && res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    } else {
      notifySessionExpired();
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : undefined;

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }
  return data as T;
}

// --- Auth ---

export async function registerUser(payload: RegisterInput) {
  return request<{ user: User; access: string; refresh: string }>(
    "/auth/register/",
    { method: "POST", body: payload, auth: false },
  );
}

export async function loginUser(payload: { username: string; password: string }) {
  const data = await request<{ access: string; refresh: string }>(
    "/auth/login/",
    { method: "POST", body: payload, auth: false },
  );
  setTokens(data);
  return data;
}

export function getMe() {
  return request<User>("/auth/me/");
}

export function changePassword(payload: ChangePasswordInput) {
  return request<{ detail: string }>("/auth/change-password/", {
    method: "POST",
    body: payload,
  });
}

export async function logoutUser(): Promise<void> {
  const refresh = getRefreshToken();
  try {
    if (refresh) {
      await request("/auth/logout/", { method: "POST", body: { refresh } });
    }
  } finally {
    clearTokens();
  }
}

// --- Tasks ---

export function listTasks(filters: TaskFilters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.ordering) params.set("ordering", filters.ordering);
  const qs = params.toString();
  return request<Paginated<Task>>(`/tasks/${qs ? `?${qs}` : ""}`);
}

export function createTask(input: TaskInput) {
  return request<Task>("/tasks/", { method: "POST", body: input });
}

export function updateTask(id: number, input: TaskInput) {
  return request<Task>(`/tasks/${id}/`, { method: "PUT", body: input });
}

export function patchTask(id: number, input: Partial<TaskInput>) {
  return request<Task>(`/tasks/${id}/`, { method: "PATCH", body: input });
}

export function deleteTask(id: number) {
  return request<void>(`/tasks/${id}/`, { method: "DELETE" });
}
