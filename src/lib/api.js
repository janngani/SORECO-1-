const API_BASE = "/api";
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("auth_token");
  const headers = {
    "Content-Type": "application/json",
    ...token ? { "Authorization": `Bearer ${token}` } : {},
    ...options.headers
  };
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    let errorMsg = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch {
      try {
        const textData = await response.text();
        if (textData) errorMsg = textData;
      } catch {
      }
    }
    throw new Error(errorMsg);
  }
  return response.json();
}
export const api = {
  auth: {
    me: () => request("/auth/me"),
    updateProfile: (data) => request("/auth/profile", { method: "PATCH", body: JSON.stringify(data) }),
    resetPassword: (email, password) => request("/auth/reset-password", { method: "POST", body: JSON.stringify({ email, password }) })
  },
  tickets: {
    list: () => request("/tickets"),
    get: (id) => request(`/tickets/${id}`),
    create: (data) => request("/tickets", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/tickets/${id}`, { method: "PATCH", body: JSON.stringify(data) })
  },
  announcements: {
    list: () => request("/announcements"),
    create: (data) => request("/announcements", { method: "POST", body: JSON.stringify(data) }),
    delete: (id) => request(`/announcements/${id}`, { method: "DELETE" })
  },
  settings: {
    get: (key) => request(`/settings/${key}`),
    set: (key, value) => request(`/settings/${key}`, { method: "POST", body: JSON.stringify({ value }) })
  },
  users: {
    list: () => request("/users"),
    create: (data) => request("/users", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id) => request(`/users/${id}`, { method: "DELETE" })
  },
  backend: {
    status: () => request("/backend-status")
  },
  inquiries: {
    list: () => request("/inquiries"),
    create: (data) => request("/inquiries", { method: "POST", body: JSON.stringify(data) })
  }
};
