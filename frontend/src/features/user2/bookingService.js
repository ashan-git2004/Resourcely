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

// User Booking API calls

export function createBooking(payload, token) {
  return request("POST", "/api/user/bookings", { payload, token });
}

export function getUserBookings(filters, token) {
  if (!filters || typeof filters === "string") {
    // backwards-compat: called as getUserBookings(token)
    return request("GET", "/api/user/bookings", { token: filters || token });
  }
  const params = Object.entries(filters)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  const url = params ? `/api/user/bookings?${params}` : "/api/user/bookings";
  return request("GET", url, { token });
}

export function getBooking(bookingId, token) {
  return request("GET", `/api/user/bookings/${bookingId}`, { token });
}

export function updateBooking(bookingId, payload, token) {
  return request("PATCH", `/api/user/bookings/${bookingId}`, { payload, token });
}

export function deleteBooking(bookingId, token) {
  return request("DELETE", `/api/user/bookings/${bookingId}`, { token });
}

export function cancelBooking(bookingId, token) {
  return request("PATCH", `/api/user/bookings/${bookingId}/cancel`, { token });
}

export function checkBookingConflicts(resourceId, startTime, endTime, token) {
  const query = new URLSearchParams({
    resourceId,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  }).toString();
  return request("GET", `/api/user/bookings/check-conflicts?${query}`, { token });
}

export function getQrCode(bookingId, token) {
  return request("GET", `/api/user/bookings/${bookingId}/qr-code`, { token });
}
