import { useEffect, useState } from "react";
import { buttonClasses, inputClasses, selectClasses, textareaClasses } from "./AdminUi";

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

function Field({ label, required = false, error, children, hint }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
    </div>
  );
}

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
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Name is required.";
    if (!formData.type) nextErrors.type = "Type is required.";
    if (!formData.location.trim()) nextErrors.location = "Location is required.";

    if (formData.capacity && (Number.isNaN(Number(formData.capacity)) || Number(formData.capacity) < 1)) {
      nextErrors.capacity = "Capacity must be greater than 0.";
    }

    formData.availabilityWindows.forEach((window, index) => {
      if (window.startTime >= window.endTime) {
        nextErrors[`availability-${index}`] = "End time must be later than start time.";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function handleAddAvailabilityWindow() {
    setFormData((prev) => ({
      ...prev,
      availabilityWindows: [
        ...prev.availabilityWindows,
        { dayOfWeek: "MONDAY", startTime: "09:00:00", endTime: "17:00:00" },
      ],
    }));
  }

  function handleRemoveAvailabilityWindow(index) {
    setFormData((prev) => ({
      ...prev,
      availabilityWindows: prev.availabilityWindows.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function handleAvailabilityWindowChange(index, field, value) {
    setFormData((prev) => ({
      ...prev,
      availabilityWindows: prev.availabilityWindows.map((window, itemIndex) =>
        itemIndex === index ? { ...window, [field]: value } : window
      ),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: formData.type,
      location: formData.location.trim(),
      status: formData.status,
      availabilityWindows: formData.availabilityWindows.length ? formData.availabilityWindows : null,
    };

    if (formData.capacity) {
      payload.capacity = parseInt(formData.capacity, 10);
    }

    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 ">
      <div className="grid gap-6 lg:grid-cols-2">
        <Field label="Resource name" required error={errors.name}>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Lecture Hall A101"
            className={inputClasses()}
          />
        </Field>

        <Field label="Location" required error={errors.location}>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Building A, Floor 1"
            className={inputClasses()}
          />
        </Field>
      </div>

      <Field label="Description" hint="Optional context for admins and users browsing this resource.">
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Main lecture hall with projector, fixed seating, and audio support"
          className={textareaClasses()}
          rows={4}
        />
      </Field>

      <div className="grid gap-6 lg:grid-cols-3">
        <Field label="Resource type" required error={errors.type}>
          <select id="type" name="type" value={formData.type} onChange={handleInputChange} className={selectClasses()}>
            {RESOURCE_TYPES.map((resourceType) => (
              <option key={resourceType} value={resourceType}>
                {resourceType.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Capacity" error={errors.capacity} hint="Leave blank if capacity does not apply.">
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            placeholder="150"
            min="1"
            className={inputClasses()}
          />
        </Field>

        <Field label="Status">
          <select id="status" name="status" value={formData.status} onChange={handleInputChange} className={selectClasses()}>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </Field>
      </div>

      <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Availability windows</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Define the regular times this resource should be available for booking.
            </p>
          </div>
          <button type="button" onClick={handleAddAvailabilityWindow} className={buttonClasses("secondary")}>
            + Add window
          </button>
        </div>

        {formData.availabilityWindows.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No availability windows added yet.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {formData.availabilityWindows.map((window, index) => (
              <div key={`${window.dayOfWeek}-${index}`} className="rounded-2xl border border-border bg-card p-4">
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
                  <Field label="Day">
                    <select
                      value={window.dayOfWeek}
                      onChange={(event) => handleAvailabilityWindowChange(index, "dayOfWeek", event.target.value)}
                      className={selectClasses()}
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Start time">
                    <input
                      type="time"
                      value={window.startTime.slice(0, 5)}
                      onChange={(event) =>
                        handleAvailabilityWindowChange(index, "startTime", `${event.target.value}:00`)
                      }
                      className={inputClasses()}
                    />
                  </Field>

                  <Field label="End time" error={errors[`availability-${index}`]}>
                    <input
                      type="time"
                      value={window.endTime.slice(0, 5)}
                      onChange={(event) =>
                        handleAvailabilityWindowChange(index, "endTime", `${event.target.value}:00`)
                      }
                      className={inputClasses()}
                    />
                  </Field>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveAvailabilityWindow(index)}
                      className={buttonClasses("ghost")}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className={buttonClasses("secondary")}>
          Cancel
        </button>
        <button type="submit" className={buttonClasses("primary")}>
          {resource ? "Update resource" : "Create resource"}
        </button>
      </div>
    </form>
  );
}
