import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import notificationService from './notificationService';

const ToggleSwitch = ({ checked, onChange, disabled }) => (
  <label className="relative inline-block w-[50px] h-[26px] ml-4 flex-shrink-0 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="opacity-0 w-0 h-0 absolute"
    />
    <span
      className="absolute inset-0 rounded-[26px] transition-colors duration-300"
      style={{ backgroundColor: checked ? '#005c53' : '#ccc', opacity: disabled ? 0.5 : 1 }}
    />
    <span
      className="absolute w-5 h-5 bg-white rounded-full bottom-[3px] transition-transform duration-300"
      style={{ left: checked ? 'calc(100% - 23px)' : '3px' }}
    />
  </label>
);

const NotificationPreferences = ({ onClose }) => {
  const { auth } = useAuth();
  const [preferences, setPreferences] = useState({
    bookingNotifications: true,
    ticketNotifications: true,
    commentNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, [auth?.token]);

  const fetchPreferences = async () => {
    if (!auth?.token) return;
    setLoading(true);
    try {
      const data = await notificationService.getPreferences(auth.token);
      setPreferences({
        bookingNotifications: data.bookingNotifications,
        ticketNotifications:  data.ticketNotifications,
        commentNotifications: data.commentNotifications,
      });
      setError('');
    } catch {
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => setPreferences(p => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    if (!auth?.token) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await notificationService.updatePreferences(preferences, auth.token);
      setMessage('Preferences saved successfully!');
      setTimeout(() => { setMessage(''); onClose?.(); }, 2000);
    } catch {
      setError('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const prefs = [
    { key: 'bookingNotifications', icon: '📅', label: 'Booking Notifications',       desc: 'Get notified when your bookings are approved or rejected' },
    { key: 'ticketNotifications',  icon: '🎫', label: 'Ticket Status Notifications',  desc: 'Get notified when your ticket status changes' },
    { key: 'commentNotifications', icon: '💬', label: 'Comment Notifications',        desc: 'Get notified when someone comments on your tickets' },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
        <div className="bg-white rounded-lg p-6"><p>Loading preferences…</p></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] w-[90%] max-w-[500px] max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[#e0e0e0]">
          <h2 className="m-0 text-xl font-semibold">Notification Preferences</h2>
          <button
            className="bg-transparent border-none text-2xl cursor-pointer text-[#666] w-8 h-8 flex items-center justify-center rounded hover:bg-[#f0f0f0] transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Preference items */}
        <div className="px-6 py-5 flex flex-col gap-3">
          {prefs.map(({ key, icon, label, desc }) => (
            <div
              key={key}
              className="flex justify-between items-center px-4 py-4 bg-[#f9f9f9] rounded-lg border border-[#e0e0e0]"
            >
              <div className="flex-1">
                <h3 className="m-0 mb-1.5 text-sm font-semibold text-[#333]">{icon} {label}</h3>
                <p className="m-0 text-xs text-[#666] leading-snug">{desc}</p>
              </div>
              <ToggleSwitch
                checked={preferences[key]}
                onChange={() => handleToggle(key)}
                disabled={saving}
              />
            </div>
          ))}
        </div>

        {error   && <div className="mx-6 mb-3 px-3 py-3 bg-[#ffe6e6] text-[#cc0000] border-l-4 border-[#cc0000] rounded text-sm">{error}</div>}
        {message && <div className="mx-6 mb-3 px-3 py-3 bg-[#e6ffe6] text-[#00aa00] border-l-4 border-[#00aa00] rounded text-sm">{message}</div>}

        {/* Footer */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-[#e0e0e0]">
          <button
            className="px-4 py-2 rounded text-sm font-medium bg-[#f0f0f0] text-[#333] cursor-pointer hover:bg-[#e0e0e0] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded text-sm font-medium bg-campus-accent text-white cursor-pointer hover:bg-[#004a43] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
