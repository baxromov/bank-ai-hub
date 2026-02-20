const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new ApiError(response.status, error.detail || "Request failed");
  }

  return response.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// Typed API methods
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; refresh_token: string; user: any }>("/auth/login", { email, password }),
  refresh: (refresh_token: string) =>
    api.post<{ access_token: string; refresh_token: string }>("/auth/refresh", { refresh_token }),
  me: () => api.get<any>("/auth/me"),
};

export const chatApi = {
  createSession: (data: { title?: string; model?: string; agent_mode?: string }) =>
    api.post<any>("/chat/sessions", data),
  listSessions: () => api.get<any[]>("/chat/sessions"),
  getMessages: (sessionId: string) => api.get<any[]>(`/chat/sessions/${sessionId}/messages`),
  sendMessage: (sessionId: string, content: string) =>
    api.post<any>(`/chat/sessions/${sessionId}/messages`, { content }),
  getModels: () => api.get<{ models: any[] }>("/chat/models"),
};

export const coinsApi = {
  getBalance: () => api.get<{ balance: number; total_earned: number; total_spent: number }>("/coins/balance"),
  getTransactions: (skip = 0, limit = 50) =>
    api.get<any[]>(`/coins/transactions?skip=${skip}&limit=${limit}`),
  getRules: () => api.get<any[]>("/coins/rules"),
};

export const rankingsApi = {
  getCurrent: (category: string, limit = 20) =>
    api.get<any[]>(`/rankings/current?category=${category}&limit=${limit}`),
  getHighlights: () => api.get<any>("/rankings/highlights"),
  getMyRanking: () => api.get<any>("/rankings/me"),
};

export const marketplaceApi = {
  listItems: (category?: string) =>
    api.get<any[]>(`/marketplace/items${category ? `?category=${category}` : ""}`),
  purchase: (item_id: string) => api.post<any>("/marketplace/purchase", { item_id }),
  listPurchases: () => api.get<any[]>("/marketplace/purchases"),
};

export const toolsApi = {
  browse: (category?: string) =>
    api.get<any[]>(`/tools/${category ? `?category=${category}` : ""}`),
  getMyTools: () => api.get<any[]>("/tools/my"),
  submit: (data: any) => api.post<any>("/tools/", data),
  execute: (toolId: string, params: Record<string, unknown>) =>
    api.post<any>(`/tools/${toolId}/execute`, { params }),
};

export const suggestionsApi = {
  list: (status?: string) =>
    api.get<any[]>(`/suggestions/${status ? `?status=${status}` : ""}`),
  submit: (data: { title: string; description: string; department: string; impact?: string }) =>
    api.post<any>("/suggestions/", data),
  getMy: () => api.get<any[]>("/suggestions/my"),
};

export const gamesApi = {
  claimReward: (description: string, qualityScore: number) =>
    api.post<{ earned: number; balance: number; status: string; transaction_id: string }>(
      "/coins/earn",
      {
        action_type: "game_reward",
        description,
        quality_score: Math.max(0, Math.min(1, qualityScore)),
      }
    ),
};

export const notificationsApi = {
  list: (unreadOnly = false) =>
    api.get<any[]>(`/notifications/?unread_only=${unreadOnly}`),
  unreadCount: () => api.get<{ count: number }>("/notifications/unread-count"),
  markRead: (id: string) => api.patch<void>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<void>("/notifications/read-all"),
};
