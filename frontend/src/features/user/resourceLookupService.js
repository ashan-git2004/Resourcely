// const API_BASE = "/api/resources";

// async function parseJson(response) {
//   if (!response.ok) {
//     const text = await response.text();
//     throw new Error(text || "Failed to load resources");
//   }
//   return response.json();
// }

// export async function getSelectableResources(token) {
//   const response = await fetch(API_BASE, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   const data = await parseJson(response);

//   return Array.isArray(data)
//     ? data
//         .filter((r) => !r.archived && r.status !== "MAINTENANCE")
//         .sort((a, b) => a.name.localeCompare(b.name))
//     : [];
// }

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


export function getSelectableResources(token) {
  return request("GET", "/api/user/resources", { token });
}

export function getResourceById(id, token) {
  return request("GET", `/api/user/resources/${id}`, { token });
}