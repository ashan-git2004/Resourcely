import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import notificationService from './notificationService';
import './NotificationPreferences.css';

const NotificationPreferences = ({ onClose }) => {
  const { auth } = useAuth();
  const [preferences, setPreferences] = useState({
    bookingNotifications: true,
    ticketNotifications: true,
    commentNotifications: true
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
        ticketNotifications: data.ticketNotifications,
        commentNotifications: data.commentNotifications
      });
      setError('');
    } catch (error) {
      console.error('Failed to fetch preferences', error);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key]
    });
  };

  const handleSave = async () => {
    if (!auth?.token) return;
    setSaving(true);
    setMessage('');
    setError('');
    
    try {
      await notificationService.updatePreferences(preferences, auth.token);
      setMessage('Preferences saved successfully!');
      setTimeout(() => {
        setMessage('');
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to save preferences', error);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="preferences-container"><p>Loading preferences...</p></div>;
  }

  return (
    <div className="preferences-modal">
      <div className="preferences-container">
        <div className="preferences-header">
          <h2>Notification Preferences</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="preferences-content">
          <div className="preference-item">
            <div className="preference-info">
              <h3>📅 Booking Notifications</h3>
              <p>Get notified when your bookings are approved or rejected</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.bookingNotifications}
                onChange={() => handleToggle('bookingNotifications')}
                disabled={saving}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <h3>🎫 Ticket Status Notifications</h3>
              <p>Get notified when your ticket status changes</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.ticketNotifications}
                onChange={() => handleToggle('ticketNotifications')}
                disabled={saving}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <h3>💬 Comment Notifications</h3>
              <p>Get notified when someone comments on your tickets</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.commentNotifications}
                onChange={() => handleToggle('commentNotifications')}
                disabled={saving}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <div className="preferences-footer">
          <button className="cancel-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
