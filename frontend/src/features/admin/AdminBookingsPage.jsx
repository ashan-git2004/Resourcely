import { useEffect, useMemo, useState } from "react";
import {
  adminCancelBooking,
  approveBooking,
  checkConflicts,
  getAllBookings,
  getBookingsByStatus,
  rejectBooking,
} from "./bookingService";
import { getResourceById } from "./resourceService";
import { useAuth } from "../../context/AuthContext";
import {
  AlertMessage,
  Badge,
  buttonClasses,
  EmptyState,
  formatDateTime,
  getBadgeTone,
  inputClasses,
  ModalShell,
  FullBleedShell,
  PageHeader,
  Panel,
  SectionHeading,
  StatCard,
  TableShell,
  textareaClasses,
} from "./AdminUi";

const bookingStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

export default function AdminBookingsPage() {
  const { auth } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [busyBookingId, setBusyBookingId] = useState("");
  const [actionModal, setActionModal] = useState(null);
  const [checkedConflicts, setCheckedConflicts] = useState(false);

  const [resourceNameMap, setResourceNameMap] = useState({});

  async function loadBookings() {
    setLoading(true);
    setError("");
    try {
      const data =
        filterStatus === "ALL"
          ? await getAllBookings(auth?.token)
          : await getBookingsByStatus(filterStatus, auth?.token);
      setBookings(data || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const stats = useMemo(() => {
    return {
      pending: bookings.filter((booking) => booking.status === "PENDING").length,
      approved: bookings.filter((booking) => booking.status === "APPROVED").length,
      rejected: bookings.filter((booking) => booking.status === "REJECTED").length,
    };
  }, [bookings]);

  const missingResourceIds = useMemo(() => {
    const ids = [...new Set(bookings.map((booking) => booking.resourceId).filter(Boolean))];
    return ids.filter((id) => !resourceNameMap[id]);
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
      booking.resourceName ||
      resourceNameMap[booking.resourceId] ||
      `Resource #${booking.resourceId}`
    );
  }

  async function handleApprove(bookingId, reason) {
    setBusyBookingId(bookingId);
    setError("");
    setSuccessMessage("");
    try {
      await approveBooking(bookingId, reason, auth?.token);
      setSuccessMessage("Booking approved successfully.");
      setActionModal(null);
      setTimeout(() => loadBookings(), 400);
    } catch (approveError) {
      setError(approveError.message);
    } finally {
      setBusyBookingId("");
    }
  }

  async function handleReject(bookingId, reason) {
    setBusyBookingId(bookingId);
    setError("");
    setSuccessMessage("");
    try {
      await rejectBooking(bookingId, reason, auth?.token);
      setSuccessMessage("Booking rejected successfully.");
      setActionModal(null);
      setTimeout(() => loadBookings(), 400);
    } catch (rejectError) {
      setError(rejectError.message);
    } finally {
      setBusyBookingId("");
    }
  }

  async function handleCancel(bookingId, reason) {
    setBusyBookingId(bookingId);
    setError("");
    setSuccessMessage("");
    try {
      await adminCancelBooking(bookingId, reason, auth?.token);
      setSuccessMessage("Booking cancelled successfully.");
      setActionModal(null);
      setTimeout(() => loadBookings(), 400);
    } catch (cancelError) {
      setError(cancelError.message);
    } finally {
      setBusyBookingId("");
    }
  }

  function openActionModal(bookingId, action) {
    const booking = bookings.find((entry) => entry.id === bookingId);
    setActionModal({ bookingId, action, reason: "", conflicts: [] });
    setCheckedConflicts(false);

    if (action === "approve" && booking) {
      setBusyBookingId(bookingId);
      checkConflicts(booking.resourceId, booking.startTime, booking.endTime, auth?.token)
        .then((conflicts) => {
          setActionModal((previous) => ({ ...previous, conflicts: conflicts || [] }));
          setCheckedConflicts(true);
        })
        .catch(() => {
          setCheckedConflicts(true);
        })
        .finally(() => setBusyBookingId(""));
    }
  }

  const activeBooking = bookings.find((booking) => booking.id === actionModal?.bookingId);

  return (
    <FullBleedShell>
      <div className="space-y-6">
        <PageHeader
          // eyebrow="Admin workspace"
          title="Booking management"
          description="Review booking requests, check for scheduling conflicts, and keep approvals consistent."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Pending" value={String(stats.pending).padStart(2, "0")} helper="Awaiting review" icon="⏳" />
          <StatCard label="Approved" value={String(stats.approved).padStart(2, "0")} helper="Confirmed reservations" icon="✅" />
          <StatCard label="Rejected" value={String(stats.rejected).padStart(2, "0")} helper="Need follow-up" icon="🚫" />
        </div>

        {error ? <AlertMessage type="error">{error}</AlertMessage> : null}
        {successMessage ? <AlertMessage type="success">{successMessage}</AlertMessage> : null}

        <Panel className="space-y-6">
          <SectionHeading title="Review queue" description="Filter bookings by workflow state and act on requests directly from the table." />

          <div className="max-w-xs space-y-2">
            <label htmlFor="statusFilter" className="text-sm font-medium text-foreground">Filter by status</label>
            <select id="statusFilter" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className={inputClasses()}>
              <option value="ALL">All bookings</option>
              {bookingStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-border bg-background px-4 py-10 text-center text-sm text-muted-foreground">
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <EmptyState title="No bookings found" description="There are no bookings for the selected filter right now." />
          ) : (
            <TableShell>
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/30 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  <tr>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Resource</th>
                    <th className="px-4 py-3 font-semibold">Schedule</th>
                    <th className="px-4 py-3 font-semibold">Purpose</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card/20">
                  {bookings.map((booking) => {
                    const isBusy = busyBookingId === booking.id;
                    return (
                      <tr key={booking.id} className="group transition-colors hover:bg-muted/50">
                        <td className="px-4 py-3 align-top">
                          <div className="text-sm font-medium text-foreground">{booking.userName}</div>
                          <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                            {booking.userId?.slice(0, 8)}...
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          {/* <div className="text-sm font-medium text-foreground">{booking.resourceName}</div> */}
                          <div className="text-sm font-medium text-foreground">
                            {getResolvedResourceName(booking)}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 align-top">
                          <div className="text-sm text-foreground">{formatDateTime(booking.startTime)}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            to {formatDateTime(booking.endTime)}
                          </div>
                        </td>
                        <td className="max-w-[200px] px-4 py-3 align-top">
                          <span className="block truncate text-muted-foreground">
                            {booking.purpose || "—"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 align-top">
                          <Badge tone={getBadgeTone("booking", booking.status)}>{booking.status}</Badge>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {booking.status === "PENDING" && (
                              <>
                                {/* Approve Button - Soft Emerald */}
                                <button
                                  type="button"
                                  onClick={() => openActionModal(booking.id, "approve")}
                                  disabled={busyBookingId !== ""}
                                  className="inline-flex h-7 items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 text-[11px] font-bold text-emerald-700 transition-all hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                                >
                                  {isBusy ? "Checking..." : "✓ Approve"}
                                </button>
                                {/* Reject Button - Soft Red */}
                                <button
                                  type="button"
                                  onClick={() => openActionModal(booking.id, "reject")}
                                  disabled={busyBookingId !== ""}
                                  className="inline-flex h-7 items-center rounded-md border border-red-200 bg-red-50 px-2 text-[11px] font-bold text-red-700 transition-all hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                                >
                                  ✕ Reject
                                </button>
                              </>
                            )}

                            {booking.status === "APPROVED" && (
                              <button
                                type="button"
                                onClick={() => openActionModal(booking.id, "cancel")}
                                disabled={busyBookingId !== ""}
                                className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] font-bold text-slate-700 transition-all hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/20 dark:text-slate-300"
                              >
                                Cancel Booking
                              </button>
                            )}
                          </div>
                          {booking.adminReason && (
                            <p className="mt-2 rounded bg-muted/50 p-2 text-[11px] leading-relaxed text-muted-foreground">
                              <span className="font-bold text-foreground">Reason:</span> {booking.adminReason}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableShell>
          )}
        </Panel>

        {actionModal ? (
          <ModalShell onClose={() => setActionModal(null)}>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {actionModal.action === "approve" ? "Approve booking" : null}
                  {actionModal.action === "reject" ? "Reject booking" : null}
                  {actionModal.action === "cancel" ? "Cancel booking" : null}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {/* {activeBooking ? `${activeBooking.resourceName} · ${formatDateTime(activeBooking.startTime)}` : "Confirm the action below."} */}
                  {activeBooking
                    ? `${getResolvedResourceName(activeBooking)} · ${formatDateTime(activeBooking.startTime)}`
                    : "Confirm the action below."}
                </p>
              </div>

              {actionModal.action === "approve" && checkedConflicts && actionModal.conflicts?.length > 0 ? (
                <AlertMessage type="error">
                  <div className="space-y-2">
                    <p className="font-semibold">Conflict warning</p>
                    <p>This booking conflicts with {actionModal.conflicts.length} approved booking(s).</p>
                    <ul className="list-disc space-y-1 pl-5">
                      {actionModal.conflicts.map((conflict) => (
                        <li key={conflict.id}>
                          {conflict.resourceName} · {formatDateTime(conflict.startTime)} to {formatDateTime(conflict.endTime)}
                        </li>
                      ))}
                    </ul>
                    <p>Reject or reschedule this request instead of approving it.</p>
                  </div>
                </AlertMessage>
              ) : null}

              {actionModal.action === "approve" && checkedConflicts && (!actionModal.conflicts || actionModal.conflicts.length === 0) ? (
                <AlertMessage type="success">No conflicts detected. This booking is safe to approve.</AlertMessage>
              ) : null}

              {actionModal.action === "approve" && !checkedConflicts ? (
                <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                  Checking for conflicts...
                </div>
              ) : null}

              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (actionModal.action === "approve") {
                    handleApprove(actionModal.bookingId, actionModal.reason);
                  } else if (actionModal.action === "reject") {
                    handleReject(actionModal.bookingId, actionModal.reason);
                  } else {
                    handleCancel(actionModal.bookingId, actionModal.reason);
                  }
                }}
              >
                <div className="space-y-2">
                  <label htmlFor="reason" className="text-sm font-medium text-foreground">
                    {actionModal.action === "reject" ? "Rejection reason" : "Reason / note"}
                  </label>
                  <textarea
                    id="reason"
                    value={actionModal.reason}
                    onChange={(event) => setActionModal({ ...actionModal, reason: event.target.value })}
                    placeholder={
                      actionModal.action === "reject"
                        ? "Explain why this booking is being rejected..."
                        : "Add an internal note for this action..."
                    }
                    className={textareaClasses()}
                    required={actionModal.action === "reject"}
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setActionModal(null)} className={buttonClasses("secondary")} disabled={busyBookingId !== ""}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={buttonClasses(actionModal.action === "reject" ? "danger" : "primary")}
                    disabled={busyBookingId !== "" || (actionModal.action === "approve" && !checkedConflicts) || (actionModal.action === "approve" && actionModal.conflicts?.length > 0)}
                  >
                    {busyBookingId ? "Processing..." : "Confirm"}
                  </button>
                </div>
              </form>
            </div>
          </ModalShell>
        ) : null}
      </div>
    </FullBleedShell>
  );
}
