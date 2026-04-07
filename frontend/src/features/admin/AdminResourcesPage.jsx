import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ResourceForm from "./ResourceForm";
import {
  createResource,
  deleteResource,
  getAllResources,
  getResourcesByType,
  restoreResource,
  updateResource,
  updateResourceStatus,
} from "./resourceService";

export default function AdminResourcesPage() {
  const { auth } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [filterType, setFilterType] = useState("ALL");
  const [busyResourceId, setBusyResourceId] = useState("");

  const resourceTypes = [
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

  async function loadResources() {
    setLoading(true);
    setError("");
    try {
      const data =
        filterType === "ALL"
          ? await getAllResources(auth?.token)
          : await getResourcesByType(filterType, auth?.token);
      setResources(data || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResources();
  }, [filterType]);

  async function handleCreateResource(payload) {
    setBusyResourceId("create");
    setError("");
    setSuccessMessage("");
    try {
      await createResource(payload, auth?.token);
      setSuccessMessage(`Resource "${payload.name}" created successfully.`);
      setShowForm(false);
      setTimeout(() => loadResources(), 600);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusyResourceId("");
    }
  }

  async function handleUpdateResource(payload) {
    setBusyResourceId(editingResource.id);
    setError("");
    setSuccessMessage("");
    try {
      await updateResource(editingResource.id, payload, auth?.token);
      setSuccessMessage(`Resource "${payload.name}" updated successfully.`);
      setEditingResource(null);
      setShowForm(false);
      setTimeout(() => loadResources(), 600);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusyResourceId("");
    }
  }

  async function handleDeleteResource(resource) {
    if (!window.confirm(`Archive "${resource.name}"?`)) return;

    setBusyResourceId(resource.id);
    setError("");
    setSuccessMessage("");
    try {
      await deleteResource(resource.id, auth?.token);
      setSuccessMessage(`Resource "${resource.name}" archived.`);
      setTimeout(() => loadResources(), 600);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusyResourceId("");
    }
  }

  async function handleRestoreResource(resource) {
    if (!window.confirm(`Restore "${resource.name}"?`)) return;

    setBusyResourceId(resource.id);
    setError("");
    setSuccessMessage("");
    try {
      await restoreResource(resource.id, auth?.token);
      setSuccessMessage(`Resource "${resource.name}" restored.`);
      setTimeout(() => loadResources(), 600);
    } catch (restoreError) {
      setError(restoreError.message);
    } finally {
      setBusyResourceId("");
    }
  }

  async function handleStatusToggle(resource) {
    const newStatus = resource.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
    setBusyResourceId(resource.id);
    setError("");
    setSuccessMessage("");
    try {
      await updateResourceStatus(resource.id, newStatus, auth?.token);
      setSuccessMessage(`Status changed to ${newStatus.replace(/_/g, " ")}.`);
      setTimeout(() => loadResources(), 600);
    } catch (statusError) {
      setError(statusError.message);
    } finally {
      setBusyResourceId("");
    }
  }

  function handleEditResource(resource) {
    setEditingResource(resource);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingResource(null);
    setError("");
  }

  if (showForm) {
    return (
      <section className="card">
        <h1>{editingResource ? "Edit Resource" : "Create Resource"}</h1>
        {error && <p className="alert">{error}</p>}
        <ResourceForm
          resource={editingResource}
          onSubmit={editingResource ? handleUpdateResource : handleCreateResource}
          onCancel={handleCloseForm}
        />
      </section>
    );
  }

  return (
    <section className="card">
      <div className="page-header">
        <div>
          <h1>Resource Management</h1>
          <p className="muted">Configure and maintain bookable university facilities and equipment.</p>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <div className="filter-controls" style={{ marginBottom: "1rem" }}>
        <select
          id="typeFilter"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
          style={{ minWidth: "210px" }}
        >
          <option value="ALL">All resource types</option>
          {resourceTypes.map((type) => (
            <option key={type} value={type}>
              {type.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <button onClick={() => setShowForm(true)} className="primary-btn" disabled={busyResourceId !== ""}>
          Create resource
        </button>
      </div>

      {loading && <p className="muted">Loading resources...</p>}

      {!loading && resources.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">No resources found</span>
          <p className="muted" style={{ margin: 0 }}>Create your first resource to get started.</p>
        </div>
      )}

      {!loading && resources.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id} style={resource.archived ? { opacity: 0.65 } : {}}>
                  <td>
                    <strong>{resource.name}</strong>
                    {resource.description && (
                      <div className="muted" style={{ fontSize: "0.82rem", marginTop: "0.25rem" }}>
                        {resource.description}
                      </div>
                    )}
                  </td>
                  <td>{resource.type.replace(/_/g, " ")}</td>
                  <td>{resource.location}</td>
                  <td>{resource.capacity || "-"}</td>
                  <td>
                    <span className={`status-pill status-${resource.status}`}>{resource.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="actions-cell">
                    {!resource.archived ? (
                      <>
                        <button
                          onClick={() => handleEditResource(resource)}
                          className="secondary-btn"
                          disabled={busyResourceId === resource.id}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleStatusToggle(resource)}
                          className="ghost-btn"
                          disabled={busyResourceId === resource.id}
                        >
                          {resource.status === "ACTIVE" ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleDeleteResource(resource)}
                          className="danger-btn"
                          disabled={busyResourceId === resource.id}
                        >
                          Archive
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRestoreResource(resource)}
                        className="secondary-btn"
                        disabled={busyResourceId === resource.id}
                      >
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
