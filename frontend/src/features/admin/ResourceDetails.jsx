import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getResourceById,
  updateResource,
  updateResourceStatus,
  deleteResource,
  restoreResource,
} from "./resourceService";
import { useAuth } from "../../context/AuthContext";
import ResourceForm from "./ResourceForm";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleUpdateResource(payload) {
    setBusy(true);
    setError("");
    setSuccessMessage("");
    try {
      await updateResource(id, payload, auth?.token);
      setSuccessMessage(`✓ Resource "${payload.name}" updated successfully`);
      setIsEditMode(false);
      setTimeout(() => loadResource(), 800);
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
      setSuccessMessage(
        `✓ Resource status changed to ${newStatus.replace(/_/g, " ")}`
      );
      setTimeout(() => loadResource(), 800);
    } catch (statusError) {
      setError(statusError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteResource() {
    if (!window.confirm(`Delete "${resource.name}"? This action will archive the resource.`)) {
      return;
    }

    setBusy(true);
    setError("");
    try {
      await deleteResource(id, auth?.token);
      setSuccessMessage(`✓ Resource "${resource.name}" archived`);
      setTimeout(() => navigate("/admin/resources"), 1200);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRestoreResource() {
    if (!window.confirm(`Restore "${resource.name}"?`)) {
      return;
    }

    setBusy(true);
    setError("");
    try {
      await restoreResource(id, auth?.token);
      setSuccessMessage(`✓ Resource "${resource.name}" restored`);
      setTimeout(() => loadResource(), 800);
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
          ← Back to Resources
        </button>
      </section>
    );
  }

  if (!resource) {
    return (
      <section className="card">
        <h1>Resource Not Found</h1>
        <p className="muted">The resource you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/admin/resources")} className="secondary-btn">
          ← Back to Resources
        </button>
      </section>
    );
  }

  if (isEditMode) {
    return (
      <section className="card">
        <h1>Edit Resource: {resource.name}</h1>
        {error && <p className="alert">{error}</p>}
        <ResourceForm
          resource={resource}
          onSubmit={handleUpdateResource}
          onCancel={() => setIsEditMode(false)}
        />
      </section>
    );
  }

  return (
    <section className="card">
      <div className="resource-header">
        <button
          onClick={() => navigate("/admin/resources")}
          className="ghost-btn"
          style={{ marginBottom: "1rem" }}
        >
          ← Back to Resources
        </button>
        <h1>{resource.name}</h1>
        {resource.archived && (
          <span
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              backgroundColor: "#f8f5f0",
              color: "#856404",
              border: "1px solid #ffeaa7",
              borderRadius: "4px",
              marginTop: "0.5rem",
            }}
          >
            Archived
          </span>
        )}
      </div>

      {error && <p className="alert">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <div className="resource-info">
        <div className="info-row">
          <label>Type:</label>
          <strong>{resource.type.replace(/_/g, " ")}</strong>
        </div>

        <div className="info-row">
          <label>Location:</label>
          <strong>{resource.location}</strong>
        </div>

        <div className="info-row">
          <label>Capacity:</label>
          <strong>{resource.capacity || "Not specified"}</strong>
        </div>

        <div className="info-row">
          <label>Status:</label>
          <span
            style={{
              display: "inline-block",
              padding: "0.25rem 0.75rem",
              borderRadius: "4px",
              backgroundColor:
                resource.status === "ACTIVE"
                  ? "#d4edda"
                  : resource.status === "OUT_OF_SERVICE"
                    ? "#fff3cd"
                    : "#f8f9fa",
              color:
                resource.status === "ACTIVE"
                  ? "#155724"
                  : resource.status === "OUT_OF_SERVICE"
                    ? "#856404"
                    : "#495057",
            }}
          >
            <strong>{resource.status.replace(/_/g, " ")}</strong>
          </span>
        </div>

        {resource.description && (
          <div className="info-row">
            <label>Description:</label>
            <p style={{ margin: "0.5rem 0 0 0" }}>{resource.description}</p>
          </div>
        )}
      </div>

      {resource.availabilityWindows && resource.availabilityWindows.length > 0 && (
        <div className="availability-section">
          <h3>Availability Windows</h3>
          <div className="availability-list">
            {resource.availabilityWindows.map((window, idx) => (
              <div key={idx} className="availability-window">
                <span className="day-label">{window.dayOfWeek}</span>
                <span className="time-range">
                  {window.startTime} — {window.endTime}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {resource.createdAt && (
        <div className="metadata">
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            Created: {new Date(resource.createdAt).toLocaleString()}
          </span>
          {resource.updatedAt && (
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              Updated: {new Date(resource.updatedAt).toLocaleString()}
            </span>
          )}
        </div>
      )}

      <div className="action-buttons">
        {!resource.archived ? (
          <>
            <button
              onClick={() => setIsEditMode(true)}
              className="primary-btn"
              disabled={busy}
            >
              {busy ? "..." : "Edit Resource"}
            </button>

            <button
              onClick={handleStatusToggle}
              className="secondary-btn"
              disabled={busy}
              title={
                resource.status === "ACTIVE"
                  ? "Mark as Out of Service"
                  : "Mark as Active"
              }
            >
              {resource.status === "ACTIVE" ? "Disable" : "Enable"}
            </button>

            <button
              onClick={handleDeleteResource}
              className="danger-btn"
              disabled={busy}
            >
              Archive
            </button>
          </>
        ) : (
          <button
            onClick={handleRestoreResource}
            className="primary-btn"
            disabled={busy}
          >
            Restore
          </button>
        )}
      </div>

      <style>{`
        .resource-header {
          margin-bottom: 2rem;
        }

        .resource-header h1 {
          margin: 0.5rem 0 0 0;
        }

        .resource-info {
          margin: 2rem 0;
          padding: 1.5rem;
          background-color: #f8f9fa;
          border-radius: 8px;
        }

        .info-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          align-items: flex-start;
        }

        .info-row:last-child {
          margin-bottom: 0;
        }

        .info-row label {
          font-weight: 600;
          min-width: 120px;
          color: #495057;
        }

        .availability-section {
          margin: 2rem 0;
          padding-top: 1.5rem;
          border-top: 1px solid #e0e0e0;
        }

        .availability-section h3 {
          margin-top: 0;
          margin-bottom: 1rem;
        }

        .availability-list {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1rem;
          background-color: #f8f9fa;
        }

        .availability-window {
          display: flex;
          gap: 1rem;
          align-items: center;
          padding: 1rem;
          margin-bottom: 0.5rem;
          background-color: white;
          border-radius: 4px;
          border-left: 3px solid #0066cc;
        }

        .availability-window:last-child {
          margin-bottom: 0;
        }

        .day-label {
          font-weight: 600;
          min-width: 100px;
          color: #0066cc;
        }

        .time-range {
          color: #495057;
        }

        .metadata {
          margin: 2rem 0;
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          flex-wrap: wrap;
        }

        .danger-btn {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .danger-btn:hover:not(:disabled) {
          background-color: #f5c6cb;
        }

        .danger-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </section>
  );
}
