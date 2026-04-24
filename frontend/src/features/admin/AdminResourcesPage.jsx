import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createResource,
  deleteResource,
  getAllResources,
  getResourcesByLocation,
  getResourcesByStatus,
  getResourcesByType,
  restoreResource,
  updateResource,
  updateResourceStatus,
} from "./resourceService";
import { useAuth } from "../../context/AuthContext";
import ResourceForm from "./ResourceForm";
import {
  AlertMessage,
  Badge,
  buttonClasses,
  EmptyState,
  formatEnum,
  getBadgeTone,
  inputClasses,
  FullBleedShell,
  PageHeader,
  Panel,
  SectionHeading,
  StatCard,
  TableShell,
} from "./AdminUi";

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

export default function AdminResourcesPage() {
  const { auth } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [busyResourceId, setBusyResourceId] = useState("");

  const [filterType, setFilterType] = useState("ALL");
  const [filterLocation, setFilterLocation] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCapacity, setFilterCapacity] = useState("");

  async function loadResources() {
    setLoading(true);
    setError("");
    try {
      let data = [];
      if (filterType !== "ALL") {
        data = await getResourcesByType(filterType, auth?.token);
      } else if (filterLocation !== "ALL") {
        data = await getResourcesByLocation(filterLocation, auth?.token);
      } else if (filterStatus !== "ALL") {
        data = await getResourcesByStatus(filterStatus, auth?.token);
      } else {
        data = await getAllResources(auth?.token);
      }

      if (filterCapacity) {
        const minCapacity = parseInt(filterCapacity, 10);
        data = (data || []).filter((resource) => resource.capacity && resource.capacity >= minCapacity);
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

  const uniqueLocations = useMemo(() => {
    return [...new Set(resources.map((resource) => resource.location).filter(Boolean))].sort();
  }, [resources]);

  const stats = useMemo(() => {
    const activeCount = resources.filter((resource) => resource.status === "ACTIVE" && !resource.archived).length;
    const disabledCount = resources.filter((resource) => resource.status === "OUT_OF_SERVICE" && !resource.archived).length;
    const archivedCount = resources.filter((resource) => resource.archived).length;
    return { activeCount, disabledCount, archivedCount };
  }, [resources]);

  async function handleCreateResource(payload) {
    setBusyResourceId("create");
    setError("");
    setSuccessMessage("");
    try {
      await createResource(payload, auth?.token);
      setSuccessMessage(`Resource \"${payload.name}\" created successfully.`);
      setShowForm(false);
      setTimeout(() => loadResources(), 400);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusyResourceId("");
    }
  }

  async function handleUpdateResource(payload) {
    setBusyResourceId(editingResource?.id || "");
    setError("");
    setSuccessMessage("");
    try {
      await updateResource(editingResource.id, payload, auth?.token);
      setSuccessMessage(`Resource \"${payload.name}\" updated successfully.`);
      setEditingResource(null);
      setShowForm(false);
      setTimeout(() => loadResources(), 400);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusyResourceId("");
    }
  }

  async function handleDeleteResource(resource) {
    if (!window.confirm(`Archive \"${resource.name}\"?`)) return;
    setBusyResourceId(resource.id);
    setError("");
    setSuccessMessage("");
    try {
      await deleteResource(resource.id, auth?.token);
      setSuccessMessage(`Resource \"${resource.name}\" archived.`);
      setTimeout(() => loadResources(), 400);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusyResourceId("");
    }
  }

  async function handleRestoreResource(resource) {
    if (!window.confirm(`Restore \"${resource.name}\"?`)) return;
    setBusyResourceId(resource.id);
    setError("");
    setSuccessMessage("");
    try {
      await restoreResource(resource.id, auth?.token);
      setSuccessMessage(`Resource \"${resource.name}\" restored.`);
      setTimeout(() => loadResources(), 400);
    } catch (restoreError) {
      setError(restoreError.message);
    } finally {
      setBusyResourceId("");
    }
  }

  async function handleStatusToggle(resource) {
    const nextStatus = resource.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
    setBusyResourceId(resource.id);
    setError("");
    setSuccessMessage("");
    try {
      await updateResourceStatus(resource.id, nextStatus, auth?.token);
      setSuccessMessage(`Resource \"${resource.name}\" changed to ${formatEnum(nextStatus)}.`);
      setTimeout(() => loadResources(), 400);
    } catch (statusError) {
      setError(statusError.message);
    } finally {
      setBusyResourceId("");
    }
  }

  function resetFilters() {
    setFilterType("ALL");
    setFilterLocation("ALL");
    setFilterStatus("ALL");
    setFilterCapacity("");
  }

  if (showForm) {
    return (
      <FullBleedShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Admin workspace"
            title={editingResource ? `Edit ${editingResource.name}` : "Create resource"}
            description="Add a new campus asset or update the configuration of an existing one."
            actions={
              <button type="button" onClick={() => { setShowForm(false); setEditingResource(null); }} className={buttonClasses("secondary")}>
                Back to resources
              </button>
            }
          />

          {error ? <AlertMessage type="error">{error}</AlertMessage> : null}

          <Panel>
            <ResourceForm
              resource={editingResource}
              onSubmit={editingResource ? handleUpdateResource : handleCreateResource}
              onCancel={() => {
                setShowForm(false);
                setEditingResource(null);
                setError("");
              }}
            />
          </Panel>
        </div>
      </FullBleedShell>
    );
  }

  return (
    <FullBleedShell>
      <div className="space-y-6">
        <PageHeader
          // eyebrow="Admin workspace"
          title="Resource management"
          description="Create, update, archive, and monitor bookable campus resources from one place."
          actions={
            <button type="button" onClick={() => setShowForm(true)} className={buttonClasses("primary")} disabled={busyResourceId !== ""}>
              + Create resource
            </button>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Visible resources" value={String(resources.filter((resource) => !resource.archived).length).padStart(2, "0")} helper="Current filtered set" icon="🏫" />
          <StatCard label="Active" value={String(stats.activeCount).padStart(2, "0")} helper="Bookable now" icon="🟢" />
          <StatCard label="Archived / disabled" value={String(stats.archivedCount + stats.disabledCount).padStart(2, "0")} helper="Needs attention" icon="🛠️" />
        </div>

        {error ? <AlertMessage type="error">{error}</AlertMessage> : null}
        {successMessage ? <AlertMessage type="success">{successMessage}</AlertMessage> : null}

        <Panel className="space-y-6">
          <SectionHeading
            title="Filter resources"
            description="Refine by type, location, status, or minimum capacity."
            action={
              <button type="button" className={buttonClasses("ghost")} onClick={resetFilters}>
                Reset filters
              </button>
            }
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <label htmlFor="typeFilter" className="text-sm font-medium text-foreground">Type</label>
              <select id="typeFilter" value={filterType} onChange={(event) => setFilterType(event.target.value)} className={inputClasses()}>
                <option value="ALL">All types</option>
                {resourceTypes.map((type) => (
                  <option key={type} value={type}>{formatEnum(type)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="locationFilter" className="text-sm font-medium text-foreground">Location</label>
              <select id="locationFilter" value={filterLocation} onChange={(event) => setFilterLocation(event.target.value)} className={inputClasses()}>
                <option value="ALL">All locations</option>
                {uniqueLocations.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="statusFilter" className="text-sm font-medium text-foreground">Status</label>
              <select id="statusFilter" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className={inputClasses()}>
                <option value="ALL">All statuses</option>
                {resourceStatuses.map((status) => (
                  <option key={status} value={status}>{formatEnum(status)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="capacityFilter" className="text-sm font-medium text-foreground">Minimum capacity</label>
              <input
                id="capacityFilter"
                type="number"
                min="1"
                value={filterCapacity}
                onChange={(event) => setFilterCapacity(event.target.value)}
                placeholder="e.g. 50"
                className={inputClasses()}
              />
            </div>
          </div>
        </Panel>

        <Panel className="space-y-6">
          <SectionHeading
            title="Resource inventory"
            description="Use the table for fast scanning and jump into the detail page for deeper edits."
          />

          {loading ? (
            <div className="rounded-2xl border border-border bg-background px-4 py-10 text-center text-sm text-muted-foreground">
              Loading resources...
            </div>
          ) : resources.length === 0 ? (
            <EmptyState
              title="No resources found"
              description="Try widening your filters or create the first resource for this category."
              action={
                <button type="button" onClick={() => setShowForm(true)} className={buttonClasses("primary")}>
                  Create resource
                </button>
              }
            />
          ) : (
            <TableShell>
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Resource</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {resources.map((resource) => {
                    const isBusy = busyResourceId === resource.id;
                    return (
                      <tr key={resource.id} className={resource.archived ? "bg-muted/20" : ""}>
                        <td className="px-4 py-4 align-top">
                          <div className="font-medium text-foreground">{resource.name}</div>
                          {resource.description ? (
                            <div className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">{resource.description}</div>
                          ) : null}
                          {resource.archived ? (
                            <div className="mt-2"><Badge tone="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300">Archived</Badge></div>
                          ) : null}
                        </td>
                        <td className="px-4 py-4 text-foreground">{formatEnum(resource.type)}</td>
                        <td className="px-4 py-4 text-foreground">{resource.location || "—"}</td>
                        <td className="px-4 py-4 text-foreground">{resource.capacity || "—"}</td>
                        <td className="px-4 py-4">
                          <Badge tone={getBadgeTone("resource", resource.status)}>{formatEnum(resource.status)}</Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link to={`/admin/resources/${resource.id}`} className={buttonClasses("secondary")}>View</Link>
                            {!resource.archived ? (
                              <>
                                <button type="button" onClick={() => { setEditingResource(resource); setShowForm(true); }} className={buttonClasses("secondary")} disabled={isBusy}>
                                  {isBusy ? "Working..." : "Edit"}
                                </button>
                                <button type="button" onClick={() => handleStatusToggle(resource)} className={buttonClasses("ghost")} disabled={isBusy}>
                                  {resource.status === "ACTIVE" ? "Disable" : "Enable"}
                                </button>
                                <button type="button" onClick={() => handleDeleteResource(resource)} className={buttonClasses("danger")} disabled={isBusy}>
                                  Archive
                                </button>
                              </>
                            ) : (
                              <button type="button" onClick={() => handleRestoreResource(resource)} className={buttonClasses("primary")} disabled={isBusy}>
                                Restore
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableShell>
          )}
        </Panel>
      </div>
    </FullBleedShell>
  );
}
