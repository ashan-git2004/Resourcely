import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ResourceForm from "./ResourceForm";
import {
  deleteResource,
  getResourceById,
  restoreResource,
  updateResource,
  updateResourceStatus,
} from "./resourceService";

export default function ResourceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [busy, setBusy] = useState(false);

  async function loadResource() {
    setLoading(true);
    setError("");
    try {
      const data = await getResourceById(id, auth?.token);
      setResource(data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResource();
  }, [id]);

  async function handleUpdateResource(payload) {
    setBusy(true);
    setError("");
    setSuccessMessage("");
    try {
      await updateResource(id, payload, auth?.token);
      setSuccessMessage(`Resource "${payload.name}" updated successfully.`);
      setIsEditMode(false);
      setTimeout(() => loadResource(), 600);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusToggle() {
    if (!resource) return;
    const newStatus = resource.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";

    setBusy(true);
    setError("");
    setSuccessMessage("");
    try {
      await updateResourceStatus(id, newStatus, auth?.token);
      setSuccessMessage(`Resource status changed to ${newStatus.replace(/_/g, " ")}.`);
      setTimeout(() => loadResource(), 600);
    } catch (statusError) {
      setError(statusError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteResource() {
    if (!window.confirm(`Archive "${resource.name}"?`)) return;

    setBusy(true);
    setError("");
    try {
      await deleteResource(id, auth?.token);
      setSuccessMessage(`Resource "${resource.name}" archived.`);
      setTimeout(() => navigate("/admin/resources"), 900);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRestoreResource() {
    if (!window.confirm(`Restore "${resource.name}"?`)) return;

    setBusy(true);
    setError("");
    try {
      await restoreResource(id, auth?.token);
      setSuccessMessage(`Resource "${resource.name}" restored.`);
      setTimeout(() => loadResource(), 600);
    } catch (restoreError) {
      setError(restoreError.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <section className="card">
        <p className="muted">Loading resource details...</p>
      </section>
    );
  }

  if (error && !resource) {
    return (
      <section className="card">
        <h1>Resource Details</h1>
        <p className="alert">{error}</p>
        <button onClick={() => navigate("/admin/resources")} className="secondary-btn">
          Back to resources
        </button>
      </section>
    );
  }

  if (!resource) {
    return (
      <section className="card">
        <h1>Resource Not Found</h1>
        <p className="muted">The requested resource could not be found.</p>
        <button onClick={() => navigate("/admin/resources")} className="secondary-btn">
          Back to resources
        </button>
      </section>
    );
  }

  if (isEditMode) {
    return (
      <section className="card">
        <h1>Edit Resource: {resource.name}</h1>
        {error && <p className="alert">{error}</p>}
        <ResourceForm resource={resource} onSubmit={handleUpdateResource} onCancel={() => setIsEditMode(false)} />
      </section>
    );
  }

  return (
    <section className="card">
      <button onClick={() => navigate("/admin/resources")} className="ghost-btn" style={{ marginBottom: "0.7rem" }}>
        Back to resources
      </button>

      <h1 style={{ marginTop: 0 }}>{resource.name}</h1>
      {resource.archived && <span className="status-pill status-rejected">Archived</span>}

      {error && <p className="alert">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <div className="resource-details-grid">
        <div className="info-row">
          <label>Type</label>
          <strong>{resource.type.replace(/_/g, " ")}</strong>
        </div>
        <div className="info-row">
          <label>Location</label>
          <strong>{resource.location}</strong>
        </div>
        <div className="info-row">
          <label>Capacity</label>
          <strong>{resource.capacity || "Not specified"}</strong>
        </div>
        <div className="info-row">
          <label>Status</label>
          <span className={`status-pill status-${resource.status}`}>{resource.status.replace(/_/g, " ")}</span>
        </div>
        {resource.description && (
          <div className="info-row">
            <label>Description</label>
            <span>{resource.description}</span>
          </div>
        )}
      </div>

      {resource.availabilityWindows?.length > 0 && (
        <div className="form-section">
          <h3 style={{ marginTop: 0 }}>Availability Windows</h3>
          <div className="availability-list">
            {resource.availabilityWindows.map((window, idx) => (
              <div key={idx} className="availability-window">
                <strong>{window.dayOfWeek}</strong>
                <span className="muted" style={{ marginLeft: "0.5rem" }}>
                  {window.startTime} - {window.endTime}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {resource.createdAt && (
        <div className="metadata">
          <span className="muted">Created: {new Date(resource.createdAt).toLocaleString()}</span>
          {resource.updatedAt && (
            <span className="muted">Updated: {new Date(resource.updatedAt).toLocaleString()}</span>
          )}
        </div>
      )}

      <div className="action-buttons" style={{ marginTop: "1rem" }}>
        {!resource.archived ? (
          <>
            <button onClick={() => setIsEditMode(true)} className="primary-btn" disabled={busy}>
              Edit resource
            </button>
            <button onClick={handleStatusToggle} className="secondary-btn" disabled={busy}>
              {resource.status === "ACTIVE" ? "Disable" : "Enable"}
            </button>
            <button onClick={handleDeleteResource} className="danger-btn" disabled={busy}>
              Archive
            </button>
          </>
        ) : (
          <button onClick={handleRestoreResource} className="primary-btn" disabled={busy}>
            Restore
          </button>
        )}
      </div>
    </section>
  );
}
