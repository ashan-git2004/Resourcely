async function request(method, path, { payload, token } = {}) {
  const headers = {};
  if (payload !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(path, {
    method,
    headers,
    body: payload !== undefined ? JSON.stringify(payload) : undefined,
  });

  const data = await parseJson(response);
  if (!response.ok) throw new Error(readErrorMessage(data));
  return data;
}

async function parseJson(response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { message: text }; }
}

function readErrorMessage(data) {
  if (!data) return "Request failed.";
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  if (data.error) return data.error;
  return "Request failed.";
}

export function getComments(ticketId, token) {
  return request("GET", `/api/user/tickets/${ticketId}/comments`, { token });
}

export function addComment(ticketId, content, token) {
  return request("POST", `/api/user/tickets/${ticketId}/comments`, { payload: { content }, token });
}

export function updateComment(ticketId, commentId, content, token) {
  return request("PATCH", `/api/user/tickets/${ticketId}/comments/${commentId}`, { payload: { content }, token });
}

export function deleteComment(ticketId, commentId, token) {
  return request("DELETE", `/api/user/tickets/${ticketId}/comments/${commentId}`, { token });
}
