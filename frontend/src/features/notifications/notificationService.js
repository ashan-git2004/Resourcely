const BASE = '/api/user/notifications';

async function req(method, path, token, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : null;
}

const notificationService = {
  getNotifications:       (token)              => req('GET',    '',                token),
  getUnreadNotifications: (token)              => req('GET',    '/unread',         token),
  getUnreadCount:         (token)              => req('GET',    '/unread/count',   token),
  markAsRead:             (id, token)          => req('PUT',    `/${id}/read`,     token, {}),
  markAllAsRead:          (token)              => req('PUT',    '/read-all',       token, {}),
  deleteNotification:     (id, token)          => req('DELETE', `/${id}`,          token),
  getPreferences:         (token)              => req('GET',    '/preferences',    token),
  updatePreferences:      (prefs, token)       => req('PUT',    '/preferences',    token, prefs),
};

export default notificationService;
