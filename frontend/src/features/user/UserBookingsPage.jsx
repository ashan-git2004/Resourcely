import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  cancelBooking,
  createBooking,
  deleteBooking,
  getUserBookings,
  updateBooking,
} from "./bookingService";
import {
  Alert,
  Badge,
  buttonStyles,
  DataTable,
  EmptyState,
  fieldClass,
  FullBleedShell,
  InfoList,
  Modal,
  PageHeader,
  SectionCard,
  StatGrid,
  textAreaClass,
  cx,
} from "./UserUi";

import { getSelectableResources, getResourceById } from "./resourceLookupService";

const BOOKING_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

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

const emptyCreateForm = {
  resourceId: "",
  startTime: "",
  endTime: "",
  purpose: "",
  expectedAttendees: "",
};

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function toDateTimeLocalValue(value) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function normalizeDateTime(value) {
  return value ? new Date(value).toISOString() : "";
}

function bookingTone(status) {
  switch (status) {
    case "PENDING":
      return "pending";
    case "APPROVED":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "CANCELLED":
      return "cancelled";
    default:
      return "neutral";
  }
}

function canEdit(status) {
  return status === "PENDING";
}

function canViewQr(status) {
  return status === "APPROVED";
}

function buildEditState(booking) {
  return {
    bookingId: booking.id,
    purpose: booking.purpose || "",
    startTime: toDateTimeLocalValue(booking.startTime),
    endTime: toDateTimeLocalValue(booking.endTime),
    expectedAttendees: booking.expectedAttendees ?? "",
  };
}

export default function UserBookingsPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [createModal, setCreateModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourceLoadError, setResourceLoadError] = useState("");

  const [resourceNameMap, setResourceNameMap] = useState({});

  const loadResources = useCallback(async () => {
    if (!auth?.token) return;

    setResourcesLoading(true);
    setResourceLoadError("");

    try {
      const data = await getSelectableResources(auth.token);
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setResourceLoadError(err.message || "Failed to load resources.");
    } finally {
      setResourcesLoading(false);
    }
  }, [auth?.token]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const filters = {
        resourceType: filterType === "ALL" ? null : filterType,
        location: filterLocation.trim() || null,
      };
      const data = await getUserBookings(filters, auth?.token);
      setBookings(data || []);
    } catch (err) {
      setError(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [auth?.token, filterLocation, filterType]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const displayBookings = useMemo(() => {
    let result = [...bookings];

    if (filterStatus !== "ALL") {
      result = result.filter((booking) => booking.status === filterStatus);
    }

    if (filterStartDate) {
      result = result.filter((booking) => {
        const localDate = new Date(booking.startTime).toLocaleDateString("sv");
        return localDate >= filterStartDate;
      });
    }

    if (filterEndDate) {
      result = result.filter((booking) => {
        const localDate = new Date(booking.startTime).toLocaleDateString("sv");
        return localDate <= filterEndDate;
      });
    }

    return result.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }, [bookings, filterEndDate, filterStartDate, filterStatus]);

  const stats = useMemo(() => {
    const pending = bookings.filter((booking) => booking.status === "PENDING").length;
    const approved = bookings.filter((booking) => booking.status === "APPROVED").length;
    const cancelled = bookings.filter((booking) => booking.status === "CANCELLED").length;

    return [
      { label: "Total bookings", value: bookings.length, helper: "All requests", icon: "📚" },
      { label: "Pending", value: pending, helper: "Awaiting approval", icon: "⏳" },
      { label: "Approved", value: approved, helper: "QR available", icon: "✅" },
      { label: "Cancelled", value: cancelled, helper: "Closed requests", icon: "🧾" },
    ];
  }, [bookings]);

  const missingResourceIds = useMemo(() => {
    const uniqueIds = [...new Set(bookings.map((booking) => booking.resourceId).filter(Boolean))];

    return uniqueIds.filter((id) => !resourceNameMap[id]);
  }, [bookings, resourceNameMap]);

  useEffect(() => {
    if (!auth?.token || missingResourceIds.length === 0) return;

    let cancelled = false;

    async function loadResourceNames() {
      const results = await Promise.all(
        missingResourceIds.map(async (id) => {
          try {
            const resource = await getResourceById(id, auth.token);
            return [id, resource?.name || `Resource #${id}`];
          } catch {
            return [id, `Resource #${id}`];
          }
        })
      );

      if (cancelled) return;

      setResourceNameMap((prev) => {
        const next = { ...prev };
        for (const [id, name] of results) {
          next[id] = name;
        }
        return next;
      });
    }

    loadResourceNames();

    return () => {
      cancelled = true;
    };
  }, [auth?.token, missingResourceIds]);

  function getResolvedResourceName(booking) {
    return (
      resourceNameMap[booking.resourceId] ||
      booking.resourceName ||
      `Resource #${booking.resourceId}`
    );
  }

  function showSuccess(message) {
    setSuccessMessage(message);
    window.clearTimeout(showSuccess.timeoutId);
    showSuccess.timeoutId = window.setTimeout(() => setSuccessMessage(""), 4000);
  }

  async function handleCreateBooking() {
    if (!createModal) return;
    setBusyId("create");
    setError("");

    try {
      await createBooking(
        {
          resourceId: createModal.resourceId.trim(),
          // resourceId: Number(createModal.resourceId),
          startTime: normalizeDateTime(createModal.startTime),
          endTime: normalizeDateTime(createModal.endTime),
          purpose: createModal.purpose.trim(),
          expectedAttendees: createModal.expectedAttendees ? Number(createModal.expectedAttendees) : null,
        },
        auth?.token
      );

      showSuccess("Booking request created successfully.");
      setCreateModal(null);
      await loadBookings();
    } catch (err) {
      setError(err.message || "Failed to create booking.");
    } finally {
      setBusyId("");
    }
  }

  async function handleUpdateBooking() {
    if (!editModal) return;
    setBusyId(editModal.bookingId);
    setError("");

    try {
      await updateBooking(
        editModal.bookingId,
        {
          purpose: editModal.purpose.trim() || undefined,
          startTime: editModal.startTime ? normalizeDateTime(editModal.startTime) : undefined,
          endTime: editModal.endTime ? normalizeDateTime(editModal.endTime) : undefined,
          expectedAttendees: editModal.expectedAttendees ? Number(editModal.expectedAttendees) : undefined,
        },
        auth?.token
      );

      showSuccess("Booking updated successfully.");
      setEditModal(null);
      if (selectedBooking?.id === editModal.bookingId) setSelectedBooking(null);
      await loadBookings();
    } catch (err) {
      setError(err.message || "Failed to update booking.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDeleteBooking(bookingId) {
    if (!window.confirm("Delete this booking? This cannot be undone.")) return;

    setBusyId(bookingId);
    setError("");
    try {
      await deleteBooking(bookingId, auth?.token);
      if (selectedBooking?.id === bookingId) setSelectedBooking(null);
      showSuccess("Booking deleted.");
      await loadBookings();
    } catch (err) {
      setError(err.message || "Failed to delete booking.");
    } finally {
      setBusyId("");
    }
  }

  async function handleCancelBooking(bookingId) {
    if (!window.confirm("Cancel this approved booking?")) return;

    setBusyId(bookingId);
    setError("");
    try {
      await cancelBooking(bookingId, auth?.token);
      if (selectedBooking?.id === bookingId) setSelectedBooking(null);
      showSuccess("Booking cancelled.");
      await loadBookings();
    } catch (err) {
      setError(err.message || "Failed to cancel booking.");
    } finally {
      setBusyId("");
    }
  }

  function clearFilters() {
    setFilterStatus("ALL");
    setFilterType("ALL");
    setFilterLocation("");
    setFilterStartDate("");
    setFilterEndDate("");
  }

  return (
    <FullBleedShell>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Student workspace"
          title="My bookings"
          description="Create resource requests, track approval status, and open QR-ready bookings when they have been approved."
          actions={
            <>
              <button className={buttonStyles.primary} onClick={() => setCreateModal({ ...emptyCreateForm })}>
                + New booking
              </button>
              <button className={buttonStyles.secondary} onClick={loadBookings}>
                Refresh
              </button>
            </>
          }
          aside={
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">What you can do here</p>
              <ul className="space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                <li>• Submit a new booking request with a purpose and expected attendees.</li>
                <li>• Update or delete pending requests before review.</li>
                <li>• Open approved bookings to access their QR code for check-in.</li>
              </ul>
            </div>
          }
        />

        {error ? <Alert tone="error">{error}</Alert> : null}
        {successMessage ? <Alert tone="success">{successMessage}</Alert> : null}

        <StatGrid items={stats} />

        <SectionCard
          title="Filter bookings"
          description="Use status, resource type, location, or date range to narrow the list. Server-side filtering is used for resource details, and quick status/date filtering stays local."
          actions={
            <>
              {/* <button className={buttonStyles.secondary} onClick={loadBookings}>
                Apply filters
              </button> */}
              <button className={buttonStyles.ghost} onClick={clearFilters}>
                Clear filters
              </button>
            </>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
              <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className={fieldClass}>
                <option value="ALL">All statuses</option>
                {BOOKING_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Resource type</label>
              <select value={filterType} onChange={(event) => setFilterType(event.target.value)} className={fieldClass}>
                <option value="ALL">All types</option>
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Location</label>
              <input
                type="text"
                value={filterLocation}
                onChange={(event) => setFilterLocation(event.target.value)}
                placeholder="e.g. Building A"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Start date</label>
              <input type="date" value={filterStartDate} onChange={(event) => setFilterStartDate(event.target.value)} className={fieldClass} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">End date</label>
              <input type="date" value={filterEndDate} onChange={(event) => setFilterEndDate(event.target.value)} className={fieldClass} />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Booking requests"
          description="Review the latest status of your requests and open the booking details drawer for a complete timeline."
        >
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800" />
              ))}
            </div>
          ) : displayBookings.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No bookings found"
              description="Try adjusting the filters or create your first booking request."
              action={
                <button className={buttonStyles.primary} onClick={() => setCreateModal({ ...emptyCreateForm })}>
                  Create booking
                </button>
              }
            />
          ) : (
            <DataTable columns={["Resource", "Date & time", "Purpose", "Attendees", "Status", "Actions"]}>
              {displayBookings.map((booking) => {
                const busy = busyId === booking.id;
                return (
                  <tr key={booking.id} className="align-top">
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(booking)}
                        className="text-left text-sm font-semibold text-sky-700 transition hover:text-sky-600 dark:text-sky-300"
                      >
                        {/* {booking.resourceName || booking.resourceId} */}
                        {getResolvedResourceName(booking)}
                      </button>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">ID: {booking.id}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                      <div>{formatDateTime(booking.startTime)}</div>
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">to {formatDateTime(booking.endTime)}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                      <p className="max-w-xs whitespace-pre-wrap">{booking.purpose || "—"}</p>
                      {booking.adminReason ? (
                        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Admin note: {booking.adminReason}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-sm text-zinc-600 dark:text-zinc-300">{booking.expectedAttendees || "—"}</td>
                    <td className="px-4 py-4">
                      <Badge tone={bookingTone(booking.status)}>{booking.status}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {canEdit(booking.status) ? (
                          <>
                            <button className={buttonStyles.secondary} disabled={busy || !!busyId} onClick={() => setEditModal(buildEditState(booking))}>
                              Edit
                            </button>
                            <button className={buttonStyles.danger} disabled={busy || !!busyId} onClick={() => handleDeleteBooking(booking.id)}>
                              Delete
                            </button>
                          </>
                        ) : null}
                        {canViewQr(booking.status) ? (
                          <>
                            <button className={buttonStyles.primary} onClick={() => navigate(`/bookings/${booking.id}`)}>
                              View QR
                            </button>
                            <button className={buttonStyles.danger} disabled={busy || !!busyId} onClick={() => handleCancelBooking(booking.id)}>
                              Cancel
                            </button>
                          </>
                        ) : null}
                        {!canEdit(booking.status) && !canViewQr(booking.status) ? (
                          <button className={buttonStyles.ghost} onClick={() => setSelectedBooking(booking)}>
                            View details
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          )}
        </SectionCard>
      </div>

      <Modal
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        // title={selectedBooking ? selectedBooking.resourceName || selectedBooking.resourceId : "Booking details"}
        title={selectedBooking ? getResolvedResourceName(selectedBooking) : "Booking details"}
        description="Review the booking lifecycle, schedule, and any notes from admins."
        width="max-w-4xl"
      >
        {selectedBooking ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={bookingTone(selectedBooking.status)}>{selectedBooking.status}</Badge>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Booking #{selectedBooking.id}</span>
            </div>

            <InfoList
              items={[
                { label: "Purpose", value: selectedBooking.purpose || "—" },
                { label: "Start time", value: formatDateTime(selectedBooking.startTime) },
                { label: "End time", value: formatDateTime(selectedBooking.endTime) },
                { label: "Expected attendees", value: selectedBooking.expectedAttendees || "—" },
                { label: "Created", value: formatDateTime(selectedBooking.createdAt) },
                { label: "Approved", value: selectedBooking.approvedAt ? formatDateTime(selectedBooking.approvedAt) : "—" },
                { label: "Admin reason", value: selectedBooking.adminReason || "—" },
              ]}
            />

            <div className="flex flex-wrap gap-3">
              {selectedBooking.status === "PENDING" ? (
                <>
                  <button
                    className={buttonStyles.secondary}
                    onClick={() => {
                      setSelectedBooking(null);
                      setEditModal(buildEditState(selectedBooking));
                    }}
                  >
                    Edit booking
                  </button>
                  <button
                    className={buttonStyles.danger}
                    onClick={() => {
                      const id = selectedBooking.id;
                      setSelectedBooking(null);
                      handleDeleteBooking(id);
                    }}
                  >
                    Delete booking
                  </button>
                </>
              ) : null}

              {selectedBooking.status === "APPROVED" ? (
                <>
                  <button className={buttonStyles.primary} onClick={() => navigate(`/bookings/${selectedBooking.id}`)}>
                    Open QR view
                  </button>
                  <button
                    className={buttonStyles.danger}
                    onClick={() => {
                      const id = selectedBooking.id;
                      setSelectedBooking(null);
                      handleCancelBooking(id);
                    }}
                  >
                    Cancel booking
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={!!createModal}
        onClose={() => setCreateModal(null)}
        title="Create booking"
        description="Submit a new request for a campus resource."
      >
        {createModal ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">

              {/* <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Resource ID</label>
                <input
                  className={fieldClass}
                  placeholder="Enter resource ID"
                  value={createModal.resourceId}
                  onChange={(event) => setCreateModal((prev) => ({ ...prev, resourceId: event.target.value }))}
                />
              </div> */}

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Resource
                </label>

                <select
                  className={fieldClass}
                  value={createModal.resourceId}
                  onChange={(event) =>
                    setCreateModal((prev) => ({ ...prev, resourceId: event.target.value }))
                  }
                  disabled={resourcesLoading}
                >
                  <option value="">
                    {resourcesLoading ? "Loading resources..." : "Select a resource"}
                  </option>

                  {resources.map((resource) => (
                    <option key={resource.id} value={String(resource.id)}>
                      {resource.name}
                    </option>
                  ))}
                </select>

                {resourceLoadError ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {resourceLoadError}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Expected attendees</label>
                <input
                  type="number"
                  min="1"
                  className={fieldClass}
                  placeholder="Optional"
                  value={createModal.expectedAttendees}
                  onChange={(event) => setCreateModal((prev) => ({ ...prev, expectedAttendees: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Start time</label>
                <input
                  type="datetime-local"
                  className={fieldClass}
                  value={createModal.startTime}
                  onChange={(event) => setCreateModal((prev) => ({ ...prev, startTime: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">End time</label>
                <input
                  type="datetime-local"
                  className={fieldClass}
                  value={createModal.endTime}
                  onChange={(event) => setCreateModal((prev) => ({ ...prev, endTime: event.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Purpose</label>
              <textarea
                className={textAreaClass}
                placeholder="Describe why you need this booking"
                value={createModal.purpose}
                onChange={(event) => setCreateModal((prev) => ({ ...prev, purpose: event.target.value }))}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button className={buttonStyles.ghost} onClick={() => setCreateModal(null)}>
                Cancel
              </button>
              <button className={buttonStyles.primary} disabled={busyId === "create"} onClick={handleCreateBooking}>
                {busyId === "create" ? "Creating…" : "Create booking"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title="Edit booking"
        description="You can update pending requests before they are reviewed."
      >
        {editModal ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Start time</label>
                <input
                  type="datetime-local"
                  className={fieldClass}
                  value={editModal.startTime}
                  onChange={(event) => setEditModal((prev) => ({ ...prev, startTime: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">End time</label>
                <input
                  type="datetime-local"
                  className={fieldClass}
                  value={editModal.endTime}
                  onChange={(event) => setEditModal((prev) => ({ ...prev, endTime: event.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Expected attendees</label>
              <input
                type="number"
                min="1"
                className={fieldClass}
                value={editModal.expectedAttendees}
                onChange={(event) => setEditModal((prev) => ({ ...prev, expectedAttendees: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Purpose</label>
              <textarea
                className={textAreaClass}
                value={editModal.purpose}
                onChange={(event) => setEditModal((prev) => ({ ...prev, purpose: event.target.value }))}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button className={buttonStyles.ghost} onClick={() => setEditModal(null)}>
                Cancel
              </button>
              <button className={buttonStyles.primary} disabled={busyId === editModal.bookingId} onClick={handleUpdateBooking}>
                {busyId === editModal.bookingId ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </FullBleedShell>
  );
}
