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

// User Booking API calls
/**
 * Create a new booking request.
 * Automatically checks for scheduling conflicts.
 * @throws Will throw error if conflicts exist or validation fails
 */
export function createBooking(booking, token) {
  return request("POST", "/api/user/bookings", {
    payload: booking,
    token,
  });
}

/**
 * Get all bookings for the current user.
 */
export function getUserBookings(token) {
  return request("GET", "/api/user/bookings", { token });
}

/**
 * Get a specific booking (user must own it).
 */
export function getUserBooking(bookingId, token) {
  return request("GET", `/api/user/bookings/${bookingId}`, { token });
}

/**
 * Cancel an approved booking.
 * Only users can cancel their own approved bookings.
 */
export function cancelUserBooking(bookingId, token) {
  return request("PATCH", `/api/user/bookings/${bookingId}/cancel`, { token });
}

/**
 * Check for booking conflicts for a resource during a specific time period.
 * Useful for users to check availability before creating a booking.
 */
export function checkBookingConflicts(resourceId, startTime, endTime, token) {
  return request("GET", 
    `/api/user/bookings/check-conflicts?resourceId=${resourceId}&startTime=${startTime}&endTime=${endTime}`, 
    { token }
  );
}
