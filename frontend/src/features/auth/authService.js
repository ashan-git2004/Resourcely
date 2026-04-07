async function request(method, path, { payload, token } = {}) {
  const headers = {};
  if (payload !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Use relative path for Vite proxy to work
  const response = await fetch(path, {
    method,
    headers,
    body: payload !== undefined ? JSON.stringify(payload) : undefined,
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(readErrorMessage(data));
  }

  return data;
}

async function parseJson(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function readErrorMessage(data) {
  if (!data) {
    return "Request failed.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.message) {
    return data.message;
  }

  if (data.error) {
    return data.error;
  }

  return "Request failed.";
}

export function register(payload) {
  return request("POST", "/api/auth/register", { payload });
}

export function login(payload) {
  return request("POST", "/api/auth/login", { payload });
}

export function getPendingUsers(token) {
  return request("GET", "/api/admin/users/pending", { token });
}

export function approveUser(userId, role, token) {
  return request("PATCH", `/api/admin/users/${userId}/approve`, {
    payload: { role },
    token,
  });
}

export function rejectUser(userId, token) {
  return request("PATCH", `/api/admin/users/${userId}/reject`, { token });
}

export function buildGoogleLoginUrl() {
  return "/oauth2/authorization/google";
}

export function decodeRolesFromToken(token) {
  if (!token) {
    return [];
  }

  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    if (Array.isArray(decoded.roles)) {
      return decoded.roles.map(String);
    }
    return [];
  } catch {
    return [];
  }
}
