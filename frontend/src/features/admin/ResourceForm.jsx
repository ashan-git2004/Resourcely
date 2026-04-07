import { useState, useEffect } from "react";

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const RESOURCE_TYPES = [
  "LECTURE_HALL",
  "LAB",
  "MEETING_ROOM",
  "EQUIPMENT",
  "LIBRARY",
  "COMPUTER_LAB",
  "AUDITORIUM",
  "SEMINAR_ROOM",
  "PARKING",
  "SPORTS_FACILITY",
];

export default function ResourceForm({ resource = null, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "LECTURE_HALL",
    capacity: "",
    location: "",
    status: "ACTIVE",
    availabilityWindows: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name || "",
        description: resource.description || "",
        type: resource.type || "LECTURE_HALL",
        capacity: resource.capacity || "",
        location: resource.location || "",
        status: resource.status || "ACTIVE",
        availabilityWindows: resource.availabilityWindows || [],
      });
    }
  }, [resource]);

  function validateForm() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.type) {
      newErrors.type = "Type is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (formData.capacity && (isNaN(formData.capacity) || parseInt(formData.capacity) < 1)) {
      newErrors.capacity = "Capacity must be a number greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  }

  function handleAddAvailabilityWindow() {
    setFormData((prev) => ({
      ...prev,
      availabilityWindows: [
        ...prev.availabilityWindows,
        {
          dayOfWeek: "MONDAY",
          startTime: "09:00:00",
          endTime: "17:00:00",
        },
      ],
    }));
  }

  function handleRemoveAvailabilityWindow(index) {
    setFormData((prev) => ({
      ...prev,
      availabilityWindows: prev.availabilityWindows.filter((_, i) => i !== index),
    }));
  }

  function handleAvailabilityWindowChange(index, field, value) {
    setFormData((prev) => ({
      ...prev,
      availabilityWindows: prev.availabilityWindows.map((window, i) =>
        i === index ? { ...window, [field]: value } : window
      ),
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: formData.type,
      location: formData.location.trim(),
      status: formData.status,
      availabilityWindows:
        formData.availabilityWindows.length > 0 ? formData.availabilityWindows : null,
    };

    if (formData.capacity) {
      payload.capacity = parseInt(formData.capacity);
    }

    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label htmlFor="name">Resource Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g., Lecture Hall A101"
          className="form-input"
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="e.g., Main lecture hall with 150 seats"
          className="form-input"
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="type">Resource Type *</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="form-input"
          >
            {RESOURCE_TYPES.map((resourceType) => (
              <option key={resourceType} value={resourceType}>
                {resourceType.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          {errors.type && <span className="error">{errors.type}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="capacity">Capacity (Optional)</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            placeholder="e.g., 150"
            min="1"
            className="form-input"
          />
          {errors.capacity && <span className="error">{errors.capacity}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="location">Location *</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="e.g., Building A, Floor 1"
          className="form-input"
        />
        {errors.location && <span className="error">{errors.location}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className="form-input"
        >
          <option value="ACTIVE">Active</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>
      </div>

      {/* Availability Windows */}
      <div className="form-section">
        <h3>Availability Windows</h3>
        <p className="muted">Define when this resource is available for booking</p>

        {formData.availabilityWindows.length > 0 && (
          <div className="availability-list">
            {formData.availabilityWindows.map((window, index) => (
              <div key={index} className="availability-window">
                <div className="form-row">
                  <div className="form-group">
                    <label>Day of Week</label>
                    <select
                      value={window.dayOfWeek}
                      onChange={(e) =>
                        handleAvailabilityWindowChange(index, "dayOfWeek", e.target.value)
                      }
                      className="form-input"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={window.startTime.substring(0, 5)}
                      onChange={(e) =>
                        handleAvailabilityWindowChange(index, "startTime", e.target.value + ":00")
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={window.endTime.substring(0, 5)}
                      onChange={(e) =>
                        handleAvailabilityWindowChange(index, "endTime", e.target.value + ":00")
                      }
                      className="form-input"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveAvailabilityWindow(index)}
                    className="ghost-btn"
                    style={{ alignSelf: "flex-end" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddAvailabilityWindow}
          className="secondary-btn"
        >
          + Add Availability Window
        </button>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button type="submit" className="primary-btn">
          {resource ? "Update Resource" : "Create Resource"}
        </button>
        <button type="button" onClick={onCancel} className="ghost-btn">
          Cancel
        </button>
      </div>
    </form>
  );
}
