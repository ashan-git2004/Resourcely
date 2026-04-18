async function request(method, path, { payload, token } = {}) {
  const headers = {};
  if (payload !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

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
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function readErrorMessage(data) {
  if (!data) return "Request failed.";
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  if (data.error) return data.error;
  return "Request failed.";
}

function buildQuery(params) {
  const q = Object.entries(params)
    .filter(([, v]) => v != null && v !== "" && v !== "ALL")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return q ? `?${q}` : "";
}

// Admin ticket API
export function getAllTickets(filters, token) {
  return request("GET", `/api/admin/tickets${buildQuery(filters || {})}`, { token });
}

export function getTicket(ticketId, token) {
  return request("GET", `/api/admin/tickets/${ticketId}`, { token });
}

export function updateTicketStatus(ticketId, status, reason, token) {
  return request("PATCH", `/api/admin/tickets/${ticketId}/status`, {
    payload: { status, reason },
    token,
  });
}

export function assignTechnician(ticketId, technicianId, token) {
  return request("PATCH", `/api/admin/tickets/${ticketId}/assign`, {
    payload: { technicianId },
    token,
  });
}

export function updateTicket(ticketId, data, token) {
  return request("PUT", `/api/admin/tickets/${ticketId}`, {
    payload: data,
    token,
  });
}

export function deleteTicket(ticketId, token) {
  return request("DELETE", `/api/admin/tickets/${ticketId}`, { token });
}

export function getTechnicians(token) {
  return request("GET", "/api/admin/users/technicians", { token });
}

// User ticket API
export function createTicket(payload, token) {
  return request("POST", "/api/user/tickets", { payload, token });
}

export function getUserTickets(token) {
  return request("GET", "/api/user/tickets", { token });
}
