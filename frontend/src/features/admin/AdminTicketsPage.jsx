import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  assignTechnician,
  deleteTicket,
  getAllTickets,
  getTechnicians,
  updateTicketStatus,
} from "./ticketService";
import {
  AlertMessage,
  Badge,
  buttonClasses,
  EmptyState,
  Field,
  formatDateTime,
  formatEnum,
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

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const CATEGORIES = ["HARDWARE", "SOFTWARE", "FACILITY", "NETWORK", "OTHER"];

const STATUS_TRANSITIONS = {
  OPEN: ["IN_PROGRESS", "REJECTED", "CLOSED"],
  IN_PROGRESS: ["RESOLVED", "REJECTED", "CLOSED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  REJECTED: ["OPEN"],
  CLOSED: [],
};

export default function AdminTicketsPage() {
  const { auth } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterTech, setFilterTech] = useState("ALL");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [assignModal, setAssignModal] = useState(null);

  async function loadTickets() {
    setLoading(true);
    setError("");
    try {
      const filters = {
        status: filterStatus === "ALL" ? null : filterStatus,
        priority: filterPriority === "ALL" ? null : filterPriority,
        category: filterCategory === "ALL" ? null : filterCategory,
        assignedTechnicianId: filterTech === "ALL" ? null : filterTech,
      };
      const data = await getAllTickets(filters, auth?.token);
      setTickets(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadTechnicians() {
    try {
      const data = await getTechnicians(auth?.token);
      setTechnicians(data || []);
    } catch {
      // Non-fatal for the page
    }
  }

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterPriority, filterCategory, filterTech]);

  useEffect(() => {
    loadTechnicians();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showSuccess(message) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3500);
  }

  async function handleStatusChange() {
    if (!statusModal) return;
    setBusyId(statusModal.ticketId);
    setError("");
    try {
      await updateTicketStatus(statusModal.ticketId, statusModal.newStatus, statusModal.reason, auth?.token);
      showSuccess(`Ticket status updated to ${formatEnum(statusModal.newStatus)}.`);
      setStatusModal(null);
      if (selectedTicket?.id === statusModal.ticketId) setSelectedTicket(null);
      setTimeout(() => loadTickets(), 400);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  async function handleAssign() {
    if (!assignModal) return;
    setBusyId(assignModal.ticketId);
    setError("");
    try {
      await assignTechnician(assignModal.ticketId, assignModal.technicianId || null, auth?.token);
      showSuccess("Technician assignment saved.");
      setAssignModal(null);
      if (selectedTicket?.id === assignModal.ticketId) setSelectedTicket(null);
      setTimeout(() => loadTickets(), 400);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  async function handleDelete(ticketId) {
    if (!window.confirm("Delete this ticket? This cannot be undone.")) return;
    setBusyId(ticketId);
    setError("");
    try {
      await deleteTicket(ticketId, auth?.token);
      showSuccess("Ticket deleted.");
      if (selectedTicket?.id === ticketId) setSelectedTicket(null);
      setTimeout(() => loadTickets(), 400);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  function openStatusModal(ticket, newStatus) {
    setStatusModal({ ticketId: ticket.id, newStatus, reason: "" });
  }

  function openAssignModal(ticket) {
    setAssignModal({ ticketId: ticket.id, technicianId: ticket.assignedTechnicianId || "" });
  }

  function resetFilters() {
    setFilterStatus("ALL");
    setFilterPriority("ALL");
    setFilterCategory("ALL");
    setFilterTech("ALL");
  }

  const STATUS_COLORS = {
    // Transitions
    IN_PROGRESS: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
    REJECTED: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    CANCELLED: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800",
    // Default/Others
    DEFAULT: "border-border bg-background text-foreground hover:bg-muted"
  };

  const stats = useMemo(() => {
    return {
      open: tickets.filter((ticket) => ticket.status === "OPEN").length,
      urgent: tickets.filter((ticket) => ticket.priority === "URGENT").length,
      unassigned: tickets.filter((ticket) => !ticket.assignedTechnicianId).length,
    };
  }, [tickets]);

  return (
    <FullBleedShell>
      <div className="space-y-6">
        <PageHeader
          // eyebrow="Admin workspace"
          title="Ticket management"
          description="Manage support tickets, assign technicians, and move requests through the workflow without losing context."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Open tickets" value={String(stats.open).padStart(2, "0")} helper="Need triage" icon="🎫" />
          <StatCard label="Urgent" value={String(stats.urgent).padStart(2, "0")} helper="Highest priority" icon="🚨" />
          <StatCard label="Unassigned" value={String(stats.unassigned).padStart(2, "0")} helper="Awaiting owner" icon="👷" />
        </div>

        {error ? <AlertMessage type="error">{error}</AlertMessage> : null}
        {successMessage ? <AlertMessage type="success">{successMessage}</AlertMessage> : null}

        <Panel className="space-y-6">
          <SectionHeading
            title="Queue filters"
            description="Slice the workload by status, priority, category, or assigned technician."
            action={<button type="button" className={buttonClasses("ghost")} onClick={resetFilters}>Reset filters</button>}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="statusFilter">Status</label>
              <select id="statusFilter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputClasses()}>
                <option value="ALL">All statuses</option>
                {STATUSES.map((status) => <option key={status} value={status}>{formatEnum(status)}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="priorityFilter">Priority</label>
              <select id="priorityFilter" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={inputClasses()}>
                <option value="ALL">All priorities</option>
                {PRIORITIES.map((priority) => <option key={priority} value={priority}>{formatEnum(priority)}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="categoryFilter">Category</label>
              <select id="categoryFilter" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={inputClasses()}>
                <option value="ALL">All categories</option>
                {CATEGORIES.map((category) => <option key={category} value={category}>{formatEnum(category)}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="techFilter">Technician</label>
              <select id="techFilter" value={filterTech} onChange={(e) => setFilterTech(e.target.value)} className={inputClasses()}>
                <option value="ALL">All technicians</option>
                <option value="unassigned">Unassigned</option>
                {technicians.map((tech) => <option key={tech.id} value={tech.id}>{tech.email}</option>)}
              </select>
            </div>
          </div>
        </Panel>

        <Panel className="space-y-6">
          <SectionHeading
            title="Support queue"
            description="Open the title to inspect full details, then assign or transition without leaving the table."
          />

          {loading ? (
            <div className="rounded-2xl border border-border bg-background px-4 py-10 text-center text-sm text-muted-foreground">
              Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <EmptyState title="No tickets found" description="No tickets match the selected filters right now." />
          ) : (
            <TableShell>
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/30 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Reporter</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    {/* Added whitespace-nowrap here */}
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Assigned</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card/20">
                  {tickets.map((ticket) => {
                    const isBusy = busyId === ticket.id;
                    const allowedNext = STATUS_TRANSITIONS[ticket.status] || [];
                    return (
                      <tr key={ticket.id} className="group transition-colors hover:bg-muted/50">
                        <td className="max-w-[200px] px-4 py-3 align-top">
                          <button
                            type="button"
                            className="block truncate text-sm font-medium text-foreground hover:text-primary hover:underline underline-offset-4"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            {ticket.title}
                          </button>
                          {ticket.location && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                              <span className="opacity-70">📍</span> {ticket.location}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top text-muted-foreground">
                          <span className="text-foreground">{ticket.reporterId?.slice(0, 8) || "—"}</span>
                        </td>
                        <td className="px-4 py-3 align-top text-muted-foreground">
                          {formatEnum(ticket.category)}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Badge tone={getBadgeTone("priority", ticket.priority)}>
                            {formatEnum(ticket.priority)}
                          </Badge>
                        </td>
                        {/* The Fix: whitespace-nowrap prevents the tag from breaking */}
                        <td className="whitespace-nowrap px-4 py-3 align-top">
                          <Badge tone={getBadgeTone("ticketStatus", ticket.status)}>
                            {formatEnum(ticket.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 align-top">
                          {ticket.assignedTechnicianName ? (
                            <span className="text-foreground">{ticket.assignedTechnicianName}</span>
                          ) : (
                            <span className="italic text-muted-foreground/60">Unassigned</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 align-top text-muted-foreground">
                          {formatDateTime(ticket.createdAt)}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {allowedNext.map((next) => {
                              // Get color class based on the 'next' status, fallback to default
                              const colorClass = STATUS_COLORS[next] || STATUS_COLORS.DEFAULT;
                              
                              return (
                                <button
                                  key={next}
                                  type="button"
                                  onClick={() => openStatusModal(ticket, next)}
                                  disabled={isBusy || busyId !== ""}
                                  className={`inline-flex h-7 items-center rounded-md border px-2 text-[11px] font-bold transition-all disabled:opacity-50 ${colorClass}`}
                                >
                                  → {formatEnum(next)}
                                </button>
                              );
                            })}

                            {/* Assign Button - Ghost Style */}
                            <button
                              type="button"
                              onClick={() => openAssignModal(ticket)}
                              className="inline-flex h-7 items-center rounded-md border border-transparent px-2 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              {ticket.assignedTechnicianId ? "Reassign" : "Assign"}
                            </button>

                            {/* Delete Button - Subtle Red Text */}
                            <button
                              type="button"
                              onClick={() => handleDelete(ticket.id)}
                              className="inline-flex h-7 items-center rounded-md border border-transparent px-2 text-[11px] font-medium text-red-600/70 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                            >
                              Delete
                            </button>
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

        {selectedTicket ? (
          <ModalShell onClose={() => setSelectedTicket(null)}>
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">{selectedTicket.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Inspect the full ticket context before taking the next action.</p>
                </div>
                <button type="button" className={buttonClasses("ghost")} onClick={() => setSelectedTicket(null)}>
                  Close
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge tone={getBadgeTone("ticketStatus", selectedTicket.status)}>{formatEnum(selectedTicket.status)}</Badge>
                <Badge tone={getBadgeTone("priority", selectedTicket.priority)}>{formatEnum(selectedTicket.priority)}</Badge>
                <Badge tone="border-border bg-muted text-muted-foreground">{formatEnum(selectedTicket.category)}</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Reporter" value={selectedTicket.reporterName || selectedTicket.reporterId} />
                <Field label="Assigned to" value={selectedTicket.assignedTechnicianName || "Unassigned"} />
                <Field label="Resource" value={selectedTicket.resourceName} />
                <Field label="Location" value={selectedTicket.location} />
                <Field label="Created" value={formatDateTime(selectedTicket.createdAt)} />
                <Field label="Resolved" value={formatDateTime(selectedTicket.resolvedAt)} />
              </div>

              {selectedTicket.adminReason ? <Field label="Admin note" value={selectedTicket.adminReason} multiline /> : null}
              <Field label="Description" value={selectedTicket.description} multiline />

              <div className="flex flex-wrap gap-2">
                {(STATUS_TRANSITIONS[selectedTicket.status] || []).map((next) => (
                  <button
                    key={next}
                    type="button"
                    onClick={() => {
                      setSelectedTicket(null);
                      openStatusModal(selectedTicket, next);
                    }}
                    className={buttonClasses(next === "REJECTED" ? "danger" : "secondary")}
                  >
                    → {formatEnum(next)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTicket(null);
                    openAssignModal(selectedTicket);
                  }}
                  className={buttonClasses("ghost")}
                >
                  {selectedTicket.assignedTechnicianId ? "Reassign" : "Assign"}
                </button>
              </div>
            </div>
          </ModalShell>
        ) : null}

        {statusModal ? (
          <ModalShell onClose={() => setStatusModal(null)}>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Set status: {formatEnum(statusModal.newStatus)}</h2>
                <p className="mt-2 text-sm text-muted-foreground">Add a note for context, especially when rejecting a ticket.</p>
              </div>

              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleStatusChange();
                }}
              >
                <div className="space-y-2">
                  <label htmlFor="statusReason" className="text-sm font-medium text-foreground">
                    {statusModal.newStatus === "REJECTED" ? "Rejection reason" : "Note"}
                  </label>
                  <textarea
                    id="statusReason"
                    value={statusModal.reason}
                    onChange={(event) => setStatusModal({ ...statusModal, reason: event.target.value })}
                    placeholder={
                      statusModal.newStatus === "REJECTED"
                        ? "Explain why this ticket is being rejected..."
                        : "Add a note about this status change..."
                    }
                    className={textareaClasses()}
                    required={statusModal.newStatus === "REJECTED"}
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setStatusModal(null)} className={buttonClasses("secondary")} disabled={busyId !== ""}>
                    Cancel
                  </button>
                  <button type="submit" className={buttonClasses(statusModal.newStatus === "REJECTED" ? "danger" : "primary")} disabled={busyId !== ""}>
                    {busyId ? "Updating..." : "Confirm"}
                  </button>
                </div>
              </form>
            </div>
          </ModalShell>
        ) : null}

        {assignModal ? (
          <ModalShell onClose={() => setAssignModal(null)}>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Assign technician</h2>
                <p className="mt-2 text-sm text-muted-foreground">Choose an owner for this ticket or leave it unassigned.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="techSelect" className="text-sm font-medium text-foreground">Technician</label>
                <select
                  id="techSelect"
                  value={assignModal.technicianId || ""}
                  onChange={(event) => setAssignModal({ ...assignModal, technicianId: event.target.value })}
                  className={inputClasses()}
                >
                  <option value="">— Unassign —</option>
                  {technicians.map((technician) => (
                    <option key={technician.id} value={technician.id}>{technician.email}</option>
                  ))}
                </select>
              </div>

              {technicians.length === 0 ? (
                <AlertMessage type="info">No technicians found yet. Approve technician users first.</AlertMessage>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setAssignModal(null)} className={buttonClasses("secondary")} disabled={busyId !== ""}>
                  Cancel
                </button>
                <button type="button" onClick={handleAssign} className={buttonClasses("primary")} disabled={busyId !== ""}>
                  {busyId ? "Saving..." : "Confirm"}
                </button>
              </div>
            </div>
          </ModalShell>
        ) : null}
      </div>
    </FullBleedShell>
  );
}
