import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { addComment, deleteComment, getComments, updateComment } from "./commentService";
import {
  createTicket,
  deleteAttachment,
  deleteTicket,
  getAttachmentUrl,
  getMyTickets,
  listAttachments,
  updateTicket,
  uploadAttachment,
} from "./userTicketService";
import {
  Alert,
  Badge,
  buttonStyles,
  DataTable,
  EmptyState,
  fieldClass,
  FullBleedShell,
  Modal,
  PageHeader,
  SectionCard,
  StatGrid,
  textAreaClass,
  cx,
} from "./UserUi";

const CATEGORIES = ["HARDWARE", "SOFTWARE", "FACILITY", "NETWORK", "OTHER"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function statusTone(status) {
  switch (status) {
    case "OPEN":
      return "approved";
    case "IN_PROGRESS":
      return "progress";
    case "RESOLVED":
      return "resolved";
    case "CLOSED":
      return "cancelled";
    case "REJECTED":
      return "rejected";
    default:
      return "neutral";
  }
}

function priorityTone(priority) {
  switch (priority) {
    case "LOW":
      return "low";
    case "MEDIUM":
      return "medium";
    case "HIGH":
      return "high";
    case "URGENT":
      return "urgent";
    default:
      return "neutral";
  }
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—";
}

function AttachmentRow({ ticketId, attachment, canDelete, token, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete \"${attachment.fileName}\"?`)) return;
    setDeleting(true);
    try {
      await deleteAttachment(ticketId, attachment.id, token);
      onDeleted(attachment.id);
    } catch (error) {
      window.alert(error.message || "Failed to delete attachment.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <a
          href={getAttachmentUrl(ticketId, attachment.id)}
          target="_blank"
          rel="noreferrer"
          className="block truncate text-sm font-medium text-sky-700 hover:text-sky-600 dark:text-sky-300"
        >
          {attachment.fileName}
        </a>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {(attachment.fileSize / 1024).toFixed(1)} KB
        </p>
      </div>
      {canDelete ? (
        <button className={buttonStyles.danger} disabled={deleting} onClick={handleDelete}>
          {deleting ? "Deleting…" : "Delete"}
        </button>
      ) : null}
    </div>
  );
}

export default function UserTicketsPage() {
  const { auth } = useAuth();
  const token = auth?.token;

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const [attachments, setAttachments] = useState([]);
  const [attLoading, setAttLoading] = useState(false);
  const [attError, setAttError] = useState("");
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    fetchTickets();
  }, [token]);

  async function fetchTickets() {
    setLoading(true);
    setError("");
    try {
      const data = await getMyTickets(token);
      setTickets(data || []);
    } catch (fetchError) {
      setError(fetchError.message || "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(ticket) {
    setSelectedTicket(ticket);
    setAttachments([]);
    setAttError("");
    setComments([]);
    setCommentsError("");
    setCommentInput("");
    setEditingComment(null);
    setAttLoading(true);
    setCommentsLoading(true);

    try {
      const [attachmentData, commentData] = await Promise.all([
        listAttachments(ticket.id, token),
        getComments(ticket.id, token),
      ]);
      setAttachments(attachmentData || []);
      setComments(commentData || []);
    } catch (detailError) {
      setAttError(detailError.message || "Failed to load ticket details.");
      setCommentsError(detailError.message || "Failed to load ticket comments.");
    } finally {
      setAttLoading(false);
      setCommentsLoading(false);
    }
  }

  function closeDetail() {
    setSelectedTicket(null);
    setAttachments([]);
    setComments([]);
    setCommentInput("");
    setEditingComment(null);
    setAttError("");
    setCommentsError("");
  }

  async function handleAddComment(event) {
    event.preventDefault();
    if (!commentInput.trim()) return;
    setSubmittingComment(true);
    try {
      const comment = await addComment(selectedTicket.id, commentInput.trim(), token);
      setComments((previous) => [...previous, comment]);
      setCommentInput("");
    } catch (commentError) {
      window.alert(commentError.message || "Failed to add comment.");
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleSaveEdit() {
    if (!editingComment || !editingComment.content.trim()) return;
    setSavingEdit(true);
    try {
      const updated = await updateComment(
        selectedTicket.id,
        editingComment.id,
        editingComment.content.trim(),
        token
      );
      setComments((previous) => previous.map((comment) => (comment.id === updated.id ? updated : comment)));
      setEditingComment(null);
    } catch (commentError) {
      window.alert(commentError.message || "Failed to update comment.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(selectedTicket.id, commentId, token);
      setComments((previous) => previous.filter((comment) => comment.id !== commentId));
    } catch (commentError) {
      window.alert(commentError.message || "Failed to delete comment.");
    }
  }

  async function handleDelete(ticketId) {
    if (!window.confirm("Delete this ticket? This cannot be undone.")) return;
    try {
      await deleteTicket(ticketId, token);
      setTickets((previous) => previous.filter((ticket) => ticket.id !== ticketId));
      if (selectedTicket?.id === ticketId) closeDetail();
    } catch (deleteError) {
      window.alert(deleteError.message || "Failed to delete ticket.");
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const metadata = await uploadAttachment(selectedTicket.id, file, token);
      setAttachments((previous) => [...previous, metadata]);
    } catch (uploadError) {
      window.alert(uploadError.message || "Failed to upload attachment.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const displayedTickets = useMemo(() => {
    const result = filterStatus === "ALL" ? tickets : tickets.filter((ticket) => ticket.status === filterStatus);
    return [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [filterStatus, tickets]);

  const stats = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === "OPEN").length;
    const inProgress = tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length;
    const urgent = tickets.filter((ticket) => ticket.priority === "URGENT").length;

    return [
      { label: "Total tickets", value: tickets.length, helper: "Your requests", icon: "🎫" },
      { label: "Open", value: open, helper: "New issues", icon: "🟢" },
      { label: "In progress", value: inProgress, helper: "Under review", icon: "🛠️" },
      { label: "Urgent", value: urgent, helper: "Highest priority", icon: "🚨" },
    ];
  }, [tickets]);

  return (
    <FullBleedShell>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Student workspace"
          title="Support tickets"
          description="Raise technical and facility issues, attach supporting images, and keep the full comment trail in one place."
          actions={
            <>
              <button className={buttonStyles.primary} onClick={() => setShowCreate(true)}>
                + New ticket
              </button>
              <button className={buttonStyles.secondary} onClick={fetchTickets}>
                Refresh
              </button>
            </>
          }
          aside={
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Ticket workflow</p>
              <ul className="space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                <li>• Create tickets with category, priority, and clear issue details.</li>
                <li>• Add up to three image attachments while the ticket is still open.</li>
                <li>• Use comments to follow up with support staff and track updates.</li>
              </ul>
            </div>
          }
        />

        {error ? <Alert tone="error">{error}</Alert> : null}
        <StatGrid items={stats} />

        <SectionCard
          title="Filter tickets"
          description="Narrow the ticket list by status while keeping the page lightweight and quick to scan."
          actions={
            filterStatus !== "ALL" ? (
              <button className={buttonStyles.ghost} onClick={() => setFilterStatus("ALL")}>
                Clear filter
              </button>
            ) : null
          }
        >
          <div className="max-w-sm space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
            <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className={fieldClass}>
              <option value="ALL">All statuses</option>
              {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"].map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </SectionCard>

        <SectionCard title="Your ticket queue" description="Open a ticket to review its attachments, conversation, and support updates.">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800" />
              ))}
            </div>
          ) : displayedTickets.length === 0 ? (
            <EmptyState
              icon="🧰"
              title="No tickets found"
              description="Create your first support request or adjust the status filter to see more results."
              action={<button className={buttonStyles.primary} onClick={() => setShowCreate(true)}>Create ticket</button>}
            />
          ) : (
            <DataTable columns={["Ticket", "Category", "Priority", "Status", "Created", "Actions"]}>
              {displayedTickets.map((ticket) => (
                <tr key={ticket.id} className="align-top">
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => openDetail(ticket)}
                      className="text-left text-sm font-semibold text-sky-700 transition hover:text-sky-600 dark:text-sky-300"
                    >
                      {ticket.title}
                    </button>
                    <p className="mt-2 max-w-sm text-xs leading-5 text-zinc-500 dark:text-zinc-400">{ticket.description}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-600 dark:text-zinc-300">{ticket.category}</td>
                  <td className="px-4 py-4"><Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge></td>
                  <td className="px-4 py-4"><Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge></td>
                  <td className="px-4 py-4 text-sm text-zinc-600 dark:text-zinc-300">{formatDate(ticket.createdAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button className={buttonStyles.secondary} onClick={() => openDetail(ticket)}>View</button>
                      {ticket.status === "OPEN" ? (
                        <button
                          className={buttonStyles.secondary}
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowEdit(true);
                          }}
                        >
                          Edit
                        </button>
                      ) : null}
                      <button className={buttonStyles.danger} onClick={() => handleDelete(ticket.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </SectionCard>
      </div>

      <Modal
        open={!!selectedTicket && !showEdit}
        onClose={closeDetail}
        title={selectedTicket?.title || "Ticket details"}
        description="Review ticket status, attached files, and the full conversation history."
        width="max-w-5xl"
      >
        {selectedTicket ? (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={statusTone(selectedTicket.status)}>{selectedTicket.status}</Badge>
              <Badge tone={priorityTone(selectedTicket.priority)}>{selectedTicket.priority}</Badge>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Ticket #{selectedTicket.id}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["Category", selectedTicket.category],
                ["Location", selectedTicket.location || "—"],
                ["Resource ID", selectedTicket.resourceId || "—"],
                ["Preferred contact", selectedTicket.preferredContact || "—"],
                ["Assigned technician", selectedTicket.technicianName || "—"],
                ["Created", formatDate(selectedTicket.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-900 dark:text-zinc-100">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Description</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-900 dark:text-zinc-100">{selectedTicket.description}</p>
              {selectedTicket.adminReason ? (
                <Alert tone="warning">
                  <strong>Admin note:</strong> {selectedTicket.adminReason}
                </Alert>
              ) : null}
            </div>

            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">Attachments</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">Upload up to three images while the ticket is still open.</p>
                </div>
                {selectedTicket.status === "OPEN" && attachments.length < 3 ? (
                  <>
                    <button className={buttonStyles.secondary} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? "Uploading…" : "+ Add image"}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  </>
                ) : null}
              </div>

              {attLoading ? <Alert tone="info">Loading attachments…</Alert> : null}
              {attError ? <Alert tone="error">{attError}</Alert> : null}
              {!attLoading && attachments.length === 0 ? (
                <EmptyState icon="🖼️" title="No attachments yet" description="Add screenshots or photos if they help explain the issue." />
              ) : (
                <div className="space-y-3">
                  {attachments.map((attachment) => (
                    <AttachmentRow
                      key={attachment.id}
                      ticketId={selectedTicket.id}
                      attachment={attachment}
                      canDelete={selectedTicket.status === "OPEN"}
                      token={token}
                      onDeleted={(id) => setAttachments((previous) => previous.filter((item) => item.id !== id))}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">Comments</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">Keep the full troubleshooting thread attached to the ticket.</p>
              </div>

              {commentsLoading ? <Alert tone="info">Loading comments…</Alert> : null}
              {commentsError ? <Alert tone="error">{commentsError}</Alert> : null}

              <div className="space-y-3">
                {comments.length === 0 && !commentsLoading ? (
                  <EmptyState icon="💬" title="No comments yet" description="Start the conversation with a quick update or clarifying detail." />
                ) : null}

                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                    {editingComment?.id === comment.id ? (
                      <div className="space-y-3">
                        <textarea
                          rows={3}
                          className={textAreaClass}
                          value={editingComment.content}
                          onChange={(event) => setEditingComment((previous) => ({ ...previous, content: event.target.value }))}
                        />
                        <div className="flex flex-wrap gap-2">
                          <button className={buttonStyles.primary} disabled={savingEdit} onClick={handleSaveEdit}>
                            {savingEdit ? "Saving…" : "Save"}
                          </button>
                          <button className={buttonStyles.ghost} onClick={() => setEditingComment(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-900 dark:text-zinc-100">{comment.content}</p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {comment.authorName} · {formatDate(comment.createdAt)} {comment.edited ? "· edited" : ""}
                          </p>
                          {comment.authorName === auth?.email && selectedTicket.status !== "CLOSED" ? (
                            <div className="flex flex-wrap gap-2">
                              <button className={buttonStyles.secondary} onClick={() => setEditingComment({ id: comment.id, content: comment.content })}>Edit</button>
                              <button className={buttonStyles.danger} onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                            </div>
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {selectedTicket.status !== "CLOSED" ? (
                <form onSubmit={handleAddComment} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      className={textAreaClass}
                      placeholder="Write a comment…"
                      value={commentInput}
                      onChange={(event) => setCommentInput(event.target.value)}
                    />
                    <div className="flex justify-end">
                      <button className={buttonStyles.primary} type="submit" disabled={submittingComment || !commentInput.trim()}>
                        {submittingComment ? "Posting…" : "Post comment"}
                      </button>
                    </div>
                  </div>
                </form>
              ) : null}
            </section>
          </div>
        ) : null}
      </Modal>

      <CreateTicketModal
        open={showCreate}
        token={token}
        onCreated={(ticket) => {
          setTickets((previous) => [ticket, ...previous]);
          setShowCreate(false);
        }}
        onClose={() => setShowCreate(false)}
      />

      <EditTicketModal
        open={showEdit}
        token={token}
        ticket={selectedTicket}
        onSaved={(updated) => {
          setTickets((previous) => previous.map((ticket) => (ticket.id === updated.id ? updated : ticket)));
          setSelectedTicket(updated);
          setShowEdit(false);
        }}
        onClose={() => setShowEdit(false)}
      />
    </FullBleedShell>
  );
}

function CreateTicketModal({ open, token, onCreated, onClose }) {
  const [form, setForm] = useState({
    title: "",
    category: "HARDWARE",
    description: "",
    priority: "MEDIUM",
    location: "",
    resourceId: "",
    preferredContact: "",
  });
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setForm({
        title: "",
        category: "HARDWARE",
        description: "",
        priority: "MEDIUM",
        location: "",
        resourceId: "",
        preferredContact: "",
      });
      setFiles([]);
      setError("");
      setBusy(false);
    }
  }, [open]);

  function setField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const ticket = await createTicket(
        {
          title: form.title.trim(),
          category: form.category,
          description: form.description.trim(),
          priority: form.priority,
          location: form.location.trim() || null,
          resourceId: form.resourceId.trim() || null,
          preferredContact: form.preferredContact.trim() || null,
        },
        token
      );

      for (const file of files) {
        try {
          await uploadAttachment(ticket.id, file, token);
        } catch {
          // Ticket is already created; attachment failures are intentionally non-fatal here.
        }
      }

      onCreated(ticket);
    } catch (submitError) {
      setError(submitError.message || "Failed to create ticket.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create ticket" description="Capture the issue clearly so support can respond faster." width="max-w-3xl">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? <Alert tone="error">{error}</Alert> : null}

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
          <input required className={fieldClass} value={form.title} onChange={(event) => setField("title", event.target.value)} placeholder="Brief summary of the issue" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
            <select className={fieldClass} value={form.category} onChange={(event) => setField("category", event.target.value)}>
              {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Priority</label>
            <select className={fieldClass} value={form.priority} onChange={(event) => setField("priority", event.target.value)}>
              {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Preferred contact</label>
            <input className={fieldClass} value={form.preferredContact} onChange={(event) => setField("preferredContact", event.target.value)} placeholder="Email or phone" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Location</label>
            <input className={fieldClass} value={form.location} onChange={(event) => setField("location", event.target.value)} placeholder="Where is the issue?" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Resource ID</label>
            <input className={fieldClass} value={form.resourceId} onChange={(event) => setField("resourceId", event.target.value)} placeholder="Optional resource reference" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
          <textarea required className={textAreaClass} value={form.description} onChange={(event) => setField("description", event.target.value)} placeholder="Describe the issue, impact, and any troubleshooting already attempted." />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Attachments</label>
          <input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 3))} className={cx(fieldClass, "h-auto py-2 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-sky-700 dark:file:bg-sky-950/50 dark:file:text-sky-300")} />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Up to 3 images. Ticket creation still succeeds even if an upload later fails.</p>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" className={buttonStyles.ghost} onClick={onClose}>Cancel</button>
          <button type="submit" className={buttonStyles.primary} disabled={busy}>{busy ? "Creating…" : "Create ticket"}</button>
        </div>
      </form>
    </Modal>
  );
}

function EditTicketModal({ open, token, ticket, onSaved, onClose }) {
  const [form, setForm] = useState({
    title: "",
    category: "HARDWARE",
    description: "",
    priority: "MEDIUM",
    location: "",
    resourceId: "",
    preferredContact: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ticket && open) {
      setForm({
        title: ticket.title || "",
        category: ticket.category || "HARDWARE",
        description: ticket.description || "",
        priority: ticket.priority || "MEDIUM",
        location: ticket.location || "",
        resourceId: ticket.resourceId || "",
        preferredContact: ticket.preferredContact || "",
      });
      setError("");
      setBusy(false);
    }
  }, [open, ticket]);

  function setField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!ticket) return;
    setError("");
    setBusy(true);
    try {
      const updated = await updateTicket(
        ticket.id,
        {
          title: form.title.trim(),
          category: form.category,
          description: form.description.trim(),
          priority: form.priority,
          location: form.location.trim() || null,
          resourceId: form.resourceId.trim() || null,
          preferredContact: form.preferredContact.trim() || null,
        },
        token
      );
      onSaved(updated);
    } catch (submitError) {
      setError(submitError.message || "Failed to update ticket.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit ticket" description="Open tickets can be updated before they are closed or rejected." width="max-w-3xl">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? <Alert tone="error">{error}</Alert> : null}

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
          <input required className={fieldClass} value={form.title} onChange={(event) => setField("title", event.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
            <select className={fieldClass} value={form.category} onChange={(event) => setField("category", event.target.value)}>
              {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Priority</label>
            <select className={fieldClass} value={form.priority} onChange={(event) => setField("priority", event.target.value)}>
              {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Preferred contact</label>
            <input className={fieldClass} value={form.preferredContact} onChange={(event) => setField("preferredContact", event.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Location</label>
            <input className={fieldClass} value={form.location} onChange={(event) => setField("location", event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Resource ID</label>
            <input className={fieldClass} value={form.resourceId} onChange={(event) => setField("resourceId", event.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
          <textarea required className={textAreaClass} value={form.description} onChange={(event) => setField("description", event.target.value)} />
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" className={buttonStyles.ghost} onClick={onClose}>Cancel</button>
          <button type="submit" className={buttonStyles.primary} disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
        </div>
      </form>
    </Modal>
  );
}
