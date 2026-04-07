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

// Booking API calls
export function getAllBookings(token) {
  return request("GET", "/api/admin/bookings", { token });
}

export function getBookingsByStatus(status, token) {
  return request("GET", `/api/admin/bookings?status=${status}`, { token });
}

export function getBookingsByResource(resourceId, token) {
  return request("GET", `/api/admin/bookings?resourceId=${resourceId}`, { token });
}

export function getBookingsByDateRange(startDate, endDate, token) {
  const start = startDate.toISOString();
  const end = endDate.toISOString();
  return request("GET", `/api/admin/bookings/range?startDate=${start}&endDate=${end}`, { token });
}

export function getBooking(bookingId, token) {
  return request("GET", `/api/admin/bookings/${bookingId}`, { token });
}

export function getPendingBookings(token) {
  return request("GET", "/api/admin/bookings/status/pending", { token });
}

export function approveBooking(bookingId, reason, token) {
  return request("PATCH", `/api/admin/bookings/${bookingId}/approve`, {
    payload: { reason },
    token,
  });
}

export function rejectBooking(bookingId, reason, token) {
  return request("PATCH", `/api/admin/bookings/${bookingId}/reject`, {
    payload: { reason },
    token,
  });
}

export function adminCancelBooking(bookingId, reason, token) {
  return request("PATCH", `/api/admin/bookings/${bookingId}/cancel`, {
    payload: { reason },
    token,
  });
}

export function checkConflicts(resourceId, startTime, endTime, token) {
  return request("GET", 
    `/api/admin/bookings/conflicts?resourceId=${resourceId}&startTime=${startTime}&endTime=${endTime}`, 
    { token }
  );
}
