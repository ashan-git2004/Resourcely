import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteResource,
  getResourceById,
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
  Field,
  formatDateTime,
  formatEnum,
  getBadgeTone,
  FullBleedShell,
  PageHeader,
  Panel,
  SectionHeading,
} from "./AdminUi";

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
      setSuccessMessage(`Resource \"${payload.name}\" updated successfully.`);
      setIsEditMode(false);
      setTimeout(() => loadResource(), 400);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusToggle() {
    if (!resource) return;
    const nextStatus = resource.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
    setBusy(true);
    setError("");
    setSuccessMessage("");
    try {
      await updateResourceStatus(id, nextStatus, auth?.token);
      setSuccessMessage(`Resource status changed to ${formatEnum(nextStatus)}.`);
      setTimeout(() => loadResource(), 400);
    } catch (statusError) {
      setError(statusError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteResource() {
    if (!window.confirm(`Archive \"${resource.name}\"?`)) return;
    setBusy(true);
    setError("");
    try {
      await deleteResource(id, auth?.token);
      setSuccessMessage(`Resource \"${resource.name}\" archived.`);
      setTimeout(() => navigate("/admin/resources"), 800);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRestoreResource() {
    if (!window.confirm(`Restore \"${resource.name}\"?`)) return;
    setBusy(true);
    setError("");
    try {
      await restoreResource(id, auth?.token);
      setSuccessMessage(`Resource \"${resource.name}\" restored.`);
      setTimeout(() => loadResource(), 400);
    } catch (restoreError) {
      setError(restoreError.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <FullBleedShell>
        <Panel>
          <div className="rounded-2xl border border-border bg-background px-4 py-10 text-center text-sm text-muted-foreground">
            Loading resource details...
          </div>
        </Panel>
      </FullBleedShell>
    );
  }

  if (error && !resource) {
    return (
      <FullBleedShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Admin workspace"
            title="Resource details"
            description="The selected resource could not be loaded."
            actions={<Link to="/admin/resources" className={buttonClasses("secondary")}>Back to resources</Link>}
          />
          <AlertMessage type="error">{error}</AlertMessage>
        </div>
      </FullBleedShell>
    );
  }

  if (!resource) {
    return (
      <FullBleedShell>
        <EmptyState
          title="Resource not found"
          description="The resource you were looking for does not exist or is no longer available."
          action={<Link to="/admin/resources" className={buttonClasses("secondary")}>Back to resources</Link>}
        />
      </FullBleedShell>
    );
  }

  if (isEditMode) {
    return (
      <FullBleedShell>
        <div className="space-y-6">
          <PageHeader
            // eyebrow="Admin workspace"
            title={`Edit ${resource.name}`}
            description="Update the resource profile, availability windows, and booking status."
            actions={<button type="button" onClick={() => setIsEditMode(false)} className={buttonClasses("secondary")}>Cancel edit</button>}
          />
          {error ? <AlertMessage type="error">{error}</AlertMessage> : null}
          <Panel>
            <ResourceForm resource={resource} onSubmit={handleUpdateResource} onCancel={() => setIsEditMode(false)} />
          </Panel>
        </div>
      </FullBleedShell>
    );
  }

  return (
    <FullBleedShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin workspace"
          title={resource.name}
          description="Review the full resource profile, then make status or lifecycle changes from the actions on the right."
          actions={
            <>
              <Link to="/admin/resources" className={buttonClasses("secondary")}>Back to resources</Link>
              {!resource.archived ? (
                <>
                  <button type="button" onClick={() => setIsEditMode(true)} className={buttonClasses("primary")} disabled={busy}>
                    Edit resource
                  </button>
                  <button type="button" onClick={handleStatusToggle} className={buttonClasses("secondary")} disabled={busy}>
                    {resource.status === "ACTIVE" ? "Disable" : "Enable"}
                  </button>
                  <button type="button" onClick={handleDeleteResource} className={buttonClasses("danger")} disabled={busy}>
                    Archive
                  </button>
                </>
              ) : (
                <button type="button" onClick={handleRestoreResource} className={buttonClasses("primary")} disabled={busy}>
                  Restore
                </button>
              )}
            </>
          }
        />

        {error ? <AlertMessage type="error">{error}</AlertMessage> : null}
        {successMessage ? <AlertMessage type="success">{successMessage}</AlertMessage> : null}

        <Panel className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Badge tone={getBadgeTone("resource", resource.status)}>{formatEnum(resource.status)}</Badge>
            <Badge tone="border-border bg-muted text-muted-foreground">{formatEnum(resource.type)}</Badge>
            {resource.archived ? <Badge tone="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300">Archived</Badge> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Location" value={resource.location} />
            <Field label="Capacity" value={resource.capacity ? String(resource.capacity) : "Not specified"} />
            <Field label="Created" value={formatDateTime(resource.createdAt)} />
            <Field label="Updated" value={formatDateTime(resource.updatedAt)} />
          </div>

          {resource.description ? <Field label="Description" value={resource.description} multiline /> : null}
        </Panel>

        <Panel className="space-y-6">
          <SectionHeading
            title="Availability windows"
            description="The regular availability schedule that users see when making bookings."
          />

          {!resource.availabilityWindows || resource.availabilityWindows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No availability windows are configured for this resource.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resource.availabilityWindows.map((window, index) => (
                <div key={`${window.dayOfWeek}-${window.startTime}-${index}`} className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{formatEnum(window.dayOfWeek)}</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {window.startTime?.slice(0, 5)} – {window.endTime?.slice(0, 5)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </FullBleedShell>
  );
}
