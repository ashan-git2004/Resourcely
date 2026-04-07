import { useEffect, useState } from "react";
import {
  getAllResources,
  getResourcesByType,
  getResourcesByLocation,
  getResourcesByStatus,
  createResource,
  updateResource,
  deleteResource,
  restoreResource,
  updateResourceStatus,
} from "./resourceService";
import { useAuth } from "../../context/AuthContext";
import ResourceForm from "./ResourceForm";

export default function AdminResourcesPage() {
  const { auth } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [busyResourceId, setBusyResourceId] = useState("");

  // Filter states
  const [filterType, setFilterType] = useState("ALL");
  const [filterLocation, setFilterLocation] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCapacity, setFilterCapacity] = useState("");

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

  const resourceStatuses = ["ACTIVE", "OUT_OF_SERVICE"];

  async function loadResources() {
    setLoading(true);
    setError("");
    try {
      let data = [];

      // Apply filters based on priority
      if (filterType !== "ALL") {
        data = await getResourcesByType(filterType, auth?.token);
      } else if (filterLocation !== "ALL") {
        data = await getResourcesByLocation(filterLocation, auth?.token);
      } else if (filterStatus !== "ALL") {
        data = await getResourcesByStatus(filterStatus, auth?.token);
      } else {
        data = await getAllResources(auth?.token);
      }

      // Apply capacity filter (client-side)
      if (filterCapacity && data.length > 0) {
        const minCapacity = parseInt(filterCapacity);
        data = data.filter((resource) => resource.capacity && resource.capacity >= minCapacity);
      }

      setResources(data || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterLocation, filterStatus, filterCapacity]);

  // Get unique locations from all resources for filter dropdown
  const getUniqueLocations = () => {
    return [...new Set(resources.map((r) => r.location))].filter(Boolean).sort();
  };

  async function handleCreateResource(payload) {
    setBusyResourceId("create");
    setError("");
    setSuccessMessage("");
    try {
      await createResource(payload, auth?.token);
      setSuccessMessage(`✓ Resource "${payload.name}" created successfully`);
      setShowForm(false);
      setTimeout(() => loadResources(), 800);
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
      setSuccessMessage(`✓ Resource "${payload.name}" updated successfully`);
      setEditingResource(null);
      setShowForm(false);
      setTimeout(() => loadResources(), 800);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusyResourceId("");
    }
  }

  async function handleDeleteResource(resource) {
    if (!window.confirm(`Delete "${resource.name}"? This action will archive the resource.`)) {
      return;
    }

    setBusyResourceId(resource.id);
    setError("");
    setSuccessMessage("");
    try {
      await deleteResource(resource.id, auth?.token);
      setSuccessMessage(`✓ Resource "${resource.name}" archived`);
      setTimeout(() => loadResources(), 800);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusyResourceId("");
    }
  }

  async function handleRestoreResource(resource) {
    if (!window.confirm(`Restore "${resource.name}"?`)) {
      return;
    }

    setBusyResourceId(resource.id);
    setError("");
    setSuccessMessage("");
    try {
      await restoreResource(resource.id, auth?.token);
      setSuccessMessage(`✓ Resource "${resource.name}" restored`);
      setTimeout(() => loadResources(), 800);
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
      setSuccessMessage(
        `✓ Resource "${resource.name}" status changed to ${newStatus.replace(/_/g, " ")}`
      );
      setTimeout(() => loadResources(), 800);
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
        <h1>{editingResource ? "Edit Resource" : "Create New Resource"}</h1>
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
      <h1>Resource Management</h1>
      <p className="muted">Create and manage bookable campus resources</p>

      {error && <p className="alert">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <div className="resource-controls">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="typeFilter">Type:</label>
            <select
              id="typeFilter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-input"
            >
              <option value="ALL">All Types</option>
              {resourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="locationFilter">Location:</label>
            <select
              id="locationFilter"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="form-input"
            >
              <option value="ALL">All Locations</option>
              {getUniqueLocations().map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="statusFilter">Status:</label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input"
            >
              <option value="ALL">All Statuses</option>
              {resourceStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="capacityFilter">Min Capacity:</label>
            <input
              id="capacityFilter"
              type="number"
              min="1"
              value={filterCapacity}
              onChange={(e) => setFilterCapacity(e.target.value)}
              placeholder="e.g., 50"
              className="form-input"
            />
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="primary-btn"
          disabled={busyResourceId !== ""}
        >
          + Create Resource
        </button>
      </div>

      {loading && <p className="muted">Loading resources...</p>}

      {!loading && resources.length === 0 && (
        <p className="success">✓ No resources found. Create your first resource to get started.</p>
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
                <tr key={resource.id} className={resource.archived ? "archived-row" : ""}>
                  <td>
                    <strong>{resource.name}</strong>
                    {resource.description && (
                      <div className="muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                        {resource.description}
                      </div>
                    )}
                  </td>
                  <td>{resource.type.replace(/_/g, " ")}</td>
                  <td>{resource.location}</td>
                  <td>{resource.capacity || "—"}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
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
                      {resource.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {!resource.archived ? (
                      <>
                        <button
                          onClick={() => handleEditResource(resource)}
                          className="secondary-btn"
                          disabled={busyResourceId === resource.id}
                        >
                          {busyResourceId === resource.id ? "..." : "Edit"}
                        </button>

                        <button
                          onClick={() => handleStatusToggle(resource)}
                          className="ghost-btn"
                          disabled={busyResourceId === resource.id}
                          title={
                            resource.status === "ACTIVE"
                              ? "Mark as Out of Service"
                              : "Mark as Active"
                          }
                        >
                          {resource.status === "ACTIVE" ? "Disable" : "Enable"}
                        </button>

                        <button
                          onClick={() => handleDeleteResource(resource)}
                          className="danger-btn"
                          disabled={busyResourceId === resource.id}
                        >
                          Delete
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

      <style>{`
        .resource-controls {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.8rem;
          flex: 1;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .filter-group label {
          font-weight: 500;
          margin: 0;
          font-size: 0.9rem;
        }

        .filter-group select,
        .filter-group input {
          width: 100%;
        }

        .availability-list {
          margin: 1rem 0;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1rem;
        }

        .availability-window {
          padding: 1rem;
          margin-bottom: 1rem;
          background-color: #f8f9fa;
          border-radius: 4px;
          border-left: 3px solid #0066cc;
        }

        .availability-window:last-child {
          margin-bottom: 0;
        }

        .form-section {
          margin: 2rem 0;
          padding: 1rem 0;
          border-top: 1px solid #e0e0e0;
        }

        .form-section h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }

        .archived-row {
          opacity: 0.6;
          background-color: #f5f5f5;
        }

        .danger-btn {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          padding: 0.5rem 1rem;
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
