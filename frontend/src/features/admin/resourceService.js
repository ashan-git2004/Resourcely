const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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

// Resource Management API calls
export function createResource(payload, token) {
  return request("POST", "/api/admin/resources", { payload, token });
}

export function getAllResources(token) {
  return request("GET", "/api/admin/resources", { token });
}

export function getResourceById(resourceId, token) {
  return request("GET", `/api/admin/resources/${resourceId}`, { token });
}

export function getResourcesByType(type, token) {
  return request("GET", `/api/admin/resources/type/${encodeURIComponent(type)}`, { token });
}

export function getResourcesByLocation(location, token) {
  return request("GET", `/api/admin/resources/location/${encodeURIComponent(location)}`, { token });
}

export function getResourcesByStatus(status, token) {
  return request("GET", `/api/admin/resources/status/${status}`, { token });
}

export function updateResource(resourceId, payload, token) {
  return request("PUT", `/api/admin/resources/${resourceId}`, { payload, token });
}

export function updateResourceStatus(resourceId, status, token) {
  return request("PATCH", `/api/admin/resources/${resourceId}/status?status=${status}`, { token });
}

export function deleteResource(resourceId, token) {
  return request("DELETE", `/api/admin/resources/${resourceId}`, { token });
}

export function restoreResource(resourceId, token) {
  return request("PATCH", `/api/admin/resources/${resourceId}/restore`, { token });
}
