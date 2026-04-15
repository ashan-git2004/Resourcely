const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

async function request(method, path, { payload, token } = {}) {
  const headers = {};
  if (payload !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: payload !== undefined ? JSON.stringify(payload) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
}

// 4. Notifications
export function getNotifications(token) {
  return request("GET", "/api/notifications", { token });
}

export function markAsRead(notificationId, token) {
  return request("PATCH", `/api/notifications/${notificationId}/read`, { token });
}

export function markAllAsRead(token) {
  return request("PATCH", "/api/notifications/read-all", { token });
}
