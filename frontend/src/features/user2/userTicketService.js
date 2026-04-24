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

export function createTicket(payload, token) {
  return request("POST", "/api/user/tickets", { payload, token });
}

export function getMyTickets(token) {
  return request("GET", "/api/user/tickets", { token });
}

export function getTicket(ticketId, token) {
  return request("GET", `/api/user/tickets/${ticketId}`, { token });
}

export function updateTicket(ticketId, payload, token) {
  return request("PATCH", `/api/user/tickets/${ticketId}`, { payload, token });
}

export function deleteTicket(ticketId, token) {
  return request("DELETE", `/api/user/tickets/${ticketId}`, { token });
}

export function listAttachments(ticketId, token) {
  return request("GET", `/api/user/tickets/${ticketId}/attachments`, { token });
}

export function uploadAttachment(ticketId, file, token) {
  const form = new FormData();
  form.append("file", file);
  return fetch(`/api/user/tickets/${ticketId}/attachments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  }).then(async (res) => {
    const data = await parseJson(res);
    if (!res.ok) throw new Error(readErrorMessage(data));
    return data;
  });
}

export function deleteAttachment(ticketId, attachmentId, token) {
  return request("DELETE", `/api/user/tickets/${ticketId}/attachments/${attachmentId}`, { token });
}

export function getAttachmentUrl(ticketId, attachmentId) {
  return `/api/user/tickets/${ticketId}/attachments/${attachmentId}`;
}
