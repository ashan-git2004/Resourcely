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

// 1. Technician Ticket Handling
export function getAssignedTickets(token, filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.priority) params.append("priority", filters.priority);
  
  const query = params.toString() ? `?${params.toString()}` : "";
  return request("GET", `/api/technician/tickets${query}`, { token });
}

export function getTicketDetail(ticketId, token) {
  return request("GET", `/api/technician/tickets/${ticketId}`, { token });
}

export function updateTicketStatus(ticketId, status, token) {
  return request("PATCH", `/api/technician/tickets/${ticketId}/status`, {
    payload: { status },
    token,
  });
}

export function updateResolutionNotes(ticketId, resolutionNotes, token) {
  return request("PATCH", `/api/technician/tickets/${ticketId}/resolution`, {
    payload: { resolutionNotes },
    token,
  });
}

// 2. Staff / Technician Comments
export function getTicketComments(ticketId, token) {
  return request("GET", `/api/tickets/${ticketId}/comments`, { token });
}

export function addComment(ticketId, content, token) {
  return request("POST", `/api/tickets/${ticketId}/comments`, {
    payload: { content },
    token,
  });
}

export function updateComment(ticketId, commentId, content, token) {
  return request("PUT", `/api/tickets/${ticketId}/comments/${commentId}`, {
    payload: { content },
    token,
  });
}

export function deleteComment(ticketId, commentId, token) {
  return request("DELETE", `/api/tickets/${ticketId}/comments/${commentId}`, { token });
}
