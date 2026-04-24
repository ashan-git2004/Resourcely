import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  addComment,
  deleteComment,
  getComments,
  updateComment,
} from "./commentService";
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

const CATEGORIES = ["HARDWARE", "SOFTWARE", "FACILITY", "NETWORK", "OTHER"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const STATUS_COLORS = {
  OPEN: { background: "#daf4ee", color: "#084b41" },
  IN_PROGRESS: { background: "#fff3cd", color: "#7a5700" },
  RESOLVED: { background: "#d1ecf1", color: "#0c5460" },
  CLOSED: { background: "#e2e3e5", color: "#383d41" },
  REJECTED: { background: "#ffd7d7", color: "#6f1313" },
};

const PRIORITY_COLORS = {
  LOW: { background: "#e2e3e5", color: "#383d41" },
  MEDIUM: { background: "#fff3cd", color: "#7a5700" },
  HIGH: { background: "#ffd7d7", color: "#6f1313" },
  URGENT: { background: "#c41e3a22", color: "#c41e3a" },
};

function Badge({ label, colorMap }) {
  const style = colorMap[label] || { background: "#eee", color: "#333" };
  return (
    <span style={{
      ...style,
      padding: "0.2rem 0.5rem",
      borderRadius: "999px",
      fontSize: "0.75rem",
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

function AttachmentRow({ ticketId, att, canDelete, token, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${att.fileName}"?`)) return;
    setDeleting(true);
    try {
      await deleteAttachment(ticketId, att.id, token);
      onDeleted(att.id);
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0", borderBottom: "1px solid var(--border)" }}>
      <a
        href={getAttachmentUrl(ticketId, att.id)}
        target="_blank"
        rel="noreferrer"
        style={{ flex: 1, color: "var(--accent)", fontSize: "0.85rem", wordBreak: "break-all" }}
      >
        {att.fileName}
      </a>
      <span style={{ fontSize: "0.75rem", color: "#888", whiteSpace: "nowrap" }}>
        {(att.fileSize / 1024).toFixed(1)} KB
      </span>
      {canDelete && (
        <button className="danger-btn" onClick={handleDelete} disabled={deleting}
          style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem" }}>
          {deleting ? "…" : "Delete"}
        </button>
      )}
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

  // detail panel attachments
  const [attachments, setAttachments] = useState([]);
  const [attLoading, setAttLoading] = useState(false);
  const [attError, setAttError] = useState("");
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // comments
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingComment, setEditingComment] = useState(null); // { id, content }
  const [savingEdit, setSavingEdit] = useState(false);

  // filter
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => { fetchTickets(); }, []);

  async function fetchTickets() {
    setLoading(true);
    setError("");
    try {
      const data = await getMyTickets(token);
      setTickets(data);
    } catch (e) {
      setError(e.message);
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
      const [atts, cmts] = await Promise.all([
        listAttachments(ticket.id, token),
        getComments(ticket.id, token),
      ]);
      setAttachments(atts);
      setComments(cmts);
    } catch (e) {
      setAttError(e.message);
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
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setSubmittingComment(true);
    try {
      const c = await addComment(selectedTicket.id, commentInput.trim(), token);
      setComments((prev) => [...prev, c]);
      setCommentInput("");
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleSaveEdit() {
    if (!editingComment || !editingComment.content.trim()) return;
    setSavingEdit(true);
    try {
      const updated = await updateComment(selectedTicket.id, editingComment.id, editingComment.content.trim(), token);
      setComments((prev) => prev.map((c) => c.id === updated.id ? updated : c));
      setEditingComment(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(selectedTicket.id, commentId, token);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDelete(ticketId) {
    if (!confirm("Delete this ticket? This cannot be undone.")) return;
    try {
      await deleteTicket(ticketId, token);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      if (selectedTicket?.id === ticketId) closeDetail();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const meta = await uploadAttachment(selectedTicket.id, file, token);
      setAttachments((prev) => [...prev, meta]);
    } catch (e) {
      alert(e.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const displayed = filterStatus === "ALL"
    ? tickets
    : tickets.filter((t) => t.status === filterStatus);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0 }}>My Tickets</h1>
        <button className="primary-btn" onClick={() => setShowCreate(true)}>+ New Ticket</button>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "0.4rem 0.6rem", borderRadius: "8px", border: "1px solid var(--border)", font: "inherit" }}>
          <option value="ALL">All Statuses</option>
          {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <p className="alert">{error}</p>}
      {loading && <p className="muted">Loading…</p>}

      {!loading && displayed.length === 0 && (
        <p className="muted">No tickets found.</p>
      )}

      {/* Ticket list */}
      {displayed.map((t) => (
        <div key={t.id} className="card" style={{ marginBottom: "0.75rem", cursor: "pointer" }}
          onClick={() => openDetail(t)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{t.title}</div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                <Badge label={t.status} colorMap={STATUS_COLORS} />
                <Badge label={t.priority} colorMap={PRIORITY_COLORS} />
                <span style={{ fontSize: "0.78rem", color: "#888" }}>{t.category}</span>
              </div>
              {t.location && <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.25rem" }}>{t.location}</div>}
            </div>
            <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
              {t.status === "OPEN" && (
                <>
                  <button className="ghost-btn" style={{ padding: "0.3rem 0.5rem", fontSize: "0.8rem" }}
                    onClick={() => { setSelectedTicket(t); setShowEdit(true); }}>Edit</button>
                  <button className="danger-btn" style={{ padding: "0.3rem 0.5rem", fontSize: "0.8rem" }}
                    onClick={() => handleDelete(t.id)}>Delete</button>
                </>
              )}
            </div>
          </div>
          <div style={{ fontSize: "0.78rem", color: "#888", marginTop: "0.4rem" }}>
            {new Date(t.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}

      {/* Detail panel */}
      {selectedTicket && !showEdit && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
        }} onClick={closeDetail}>
          <div className="card" style={{ width: "min(560px, 95vw)", maxHeight: "85vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{selectedTicket.title}</h2>
              <button className="ghost-btn" style={{ padding: "0.2rem 0.5rem" }} onClick={closeDetail}>✕</button>
            </div>

            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
              <Badge label={selectedTicket.status} colorMap={STATUS_COLORS} />
              <Badge label={selectedTicket.priority} colorMap={PRIORITY_COLORS} />
              <span style={{ fontSize: "0.78rem", color: "#888", alignSelf: "center" }}>{selectedTicket.category}</span>
            </div>

            <div className="info-stack" style={{ fontSize: "0.9rem" }}>
              {selectedTicket.location && <div><strong>Location:</strong> {selectedTicket.location}</div>}
              {selectedTicket.resourceName && <div><strong>Resource:</strong> {selectedTicket.resourceName}</div>}
              {selectedTicket.preferredContact && <div><strong>Contact:</strong> {selectedTicket.preferredContact}</div>}
              <div><strong>Description:</strong>
                <p style={{ margin: "0.25rem 0 0", whiteSpace: "pre-wrap" }}>{selectedTicket.description}</p>
              </div>
              {selectedTicket.adminReason && (
                <div className="alert" style={{ marginTop: "0.5rem" }}>
                  <strong>Admin note:</strong> {selectedTicket.adminReason}
                </div>
              )}
              <div style={{ color: "#888", fontSize: "0.8rem" }}>
                Created: {new Date(selectedTicket.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Attachments */}
            <div style={{ marginTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <strong style={{ fontSize: "0.9rem" }}>Attachments ({attachments.length}/3)</strong>
                {selectedTicket.status === "OPEN" && attachments.length < 3 && (
                  <>
                    <button className="ghost-btn" style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }}
                      onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? "Uploading…" : "+ Add Image"}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={handleUpload} />
                  </>
                )}
              </div>
              {attLoading && <p className="muted" style={{ fontSize: "0.85rem" }}>Loading attachments…</p>}
              {attError && <p className="alert" style={{ fontSize: "0.85rem" }}>{attError}</p>}
              {attachments.length === 0 && !attLoading && (
                <p className="muted" style={{ fontSize: "0.85rem" }}>No attachments.</p>
              )}
              {attachments.map((att) => (
                <AttachmentRow key={att.id} ticketId={selectedTicket.id} att={att}
                  canDelete={selectedTicket.status === "OPEN"} token={token}
                  onDeleted={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))} />
              ))}
            </div>

            {/* Comments */}
            <div style={{ marginTop: "1.25rem" }}>
              <strong style={{ fontSize: "0.9rem" }}>Comments ({comments.length})</strong>
              {commentsLoading && <p className="muted" style={{ fontSize: "0.85rem" }}>Loading…</p>}
              {commentsError && <p className="alert" style={{ fontSize: "0.85rem" }}>{commentsError}</p>}

              <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {comments.map((c) => (
                  <div key={c.id} style={{ background: "#f9f7ee", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.6rem" }}>
                    {editingComment?.id === c.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <textarea value={editingComment.content}
                          onChange={(e) => setEditingComment((prev) => ({ ...prev, content: e.target.value }))}
                          rows={2} style={{ width: "100%", padding: "0.4rem", borderRadius: "7px", border: "1px solid #baa97e", font: "inherit", resize: "vertical" }} />
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button className="primary-btn" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}
                            onClick={handleSaveEdit} disabled={savingEdit}>
                            {savingEdit ? "Saving…" : "Save"}
                          </button>
                          <button className="ghost-btn" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}
                            onClick={() => setEditingComment(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: "0.85rem", whiteSpace: "pre-wrap", marginBottom: "0.3rem" }}>{c.content}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.75rem", color: "#888" }}>
                            {c.authorName} · {new Date(c.createdAt).toLocaleString()}
                            {c.edited && <span style={{ marginLeft: "0.3rem", fontStyle: "italic" }}>(edited)</span>}
                          </span>
                          {c.authorName === auth?.email && selectedTicket.status !== "CLOSED" && (
                            <div style={{ display: "flex", gap: "0.3rem" }}>
                              <button className="ghost-btn" style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem" }}
                                onClick={() => setEditingComment({ id: c.id, content: c.content })}>Edit</button>
                              <button className="danger-btn" style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem" }}
                                onClick={() => handleDeleteComment(c.id)}>Delete</button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {comments.length === 0 && !commentsLoading && (
                  <p className="muted" style={{ fontSize: "0.85rem" }}>No comments yet.</p>
                )}
              </div>

              {selectedTicket.status !== "CLOSED" && (
                <form onSubmit={handleAddComment} style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                  <input value={commentInput} onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Write a comment…" style={{ flex: 1, padding: "0.5rem 0.7rem", borderRadius: "8px", border: "1px solid #baa97e", font: "inherit" }} />
                  <button type="submit" className="primary-btn" style={{ padding: "0.5rem 0.9rem", whiteSpace: "nowrap" }}
                    disabled={submittingComment || !commentInput.trim()}>
                    {submittingComment ? "…" : "Post"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateTicketModal token={token}
          onCreated={(t) => { setTickets((prev) => [t, ...prev]); setShowCreate(false); }}
          onClose={() => setShowCreate(false)} />
      )}

      {/* Edit modal */}
      {showEdit && selectedTicket && (
        <EditTicketModal token={token} ticket={selectedTicket}
          onSaved={(updated) => {
            setTickets((prev) => prev.map((t) => t.id === updated.id ? updated : t));
            setSelectedTicket(updated);
            setShowEdit(false);
          }}
          onClose={() => setShowEdit(false)} />
      )}
    </div>
  );
}

function CreateTicketModal({ token, onCreated, onClose }) {
  const [form, setForm] = useState({
    title: "", category: "HARDWARE", description: "",
    priority: "MEDIUM", location: "", resourceId: "", preferredContact: "",
  });
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleFileChange(e) {
    const selected = Array.from(e.target.files).slice(0, 3);
    setFiles(selected);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const ticket = await createTicket({
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        priority: form.priority,
        location: form.location.trim() || null,
        resourceId: form.resourceId.trim() || null,
        preferredContact: form.preferredContact.trim() || null,
      }, token);

      // upload attachments
      for (const file of files) {
        try {
          await uploadAttachment(ticket.id, file, token);
        } catch {
          // non-fatal: ticket created, attachment failed
        }
      }

      onCreated(ticket);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
    }}>
      <div className="card" style={{ width: "min(520px, 95vw)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h2 style={{ margin: 0 }}>New Ticket</h2>
          <button className="ghost-btn" style={{ padding: "0.2rem 0.5rem" }} onClick={onClose}>✕</button>
        </div>

        {error && <p className="alert">{error}</p>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Title *
            <input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Brief summary of the issue" />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
            <label>Category *
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                style={{ width: "100%", padding: "0.62rem 0.7rem", border: "1px solid #baa97e", borderRadius: "9px", font: "inherit" }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>Priority
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)}
                style={{ width: "100%", padding: "0.62rem 0.7rem", border: "1px solid #baa97e", borderRadius: "9px", font: "inherit" }}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>

          <label>Description *
            <textarea required value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={4} placeholder="Describe the issue in detail"
              style={{ width: "100%", padding: "0.62rem 0.7rem", border: "1px solid #baa97e", borderRadius: "9px", font: "inherit", resize: "vertical" }} />
          </label>

          <label>Location
            <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Lab A, Room 201" />
          </label>

          <label>Resource ID <span className="muted" style={{ fontSize: "0.8rem" }}>(optional)</span>
            <input value={form.resourceId} onChange={(e) => set("resourceId", e.target.value)} placeholder="Leave blank if not applicable" />
          </label>

          <label>Preferred Contact
            <input value={form.preferredContact} onChange={(e) => set("preferredContact", e.target.value)}
              placeholder="e.g. email or phone number" />
          </label>

          <label>Attachments <span className="muted" style={{ fontSize: "0.8rem" }}>(up to 3 images)</span>
            <input type="file" accept="image/*" multiple onChange={handleFileChange}
              style={{ padding: "0.3rem 0" }} />
            {files.length > 0 && (
              <span className="muted" style={{ fontSize: "0.8rem" }}>{files.length} file(s) selected</span>
            )}
          </label>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
            <button type="submit" className="primary-btn" disabled={busy} style={{ flex: 1 }}>
              {busy ? "Submitting…" : "Submit Ticket"}
            </button>
            <button type="button" className="ghost-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditTicketModal({ token, ticket, onSaved, onClose }) {
  const [form, setForm] = useState({
    description: ticket.description || "",
    preferredContact: ticket.preferredContact || "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const updated = await updateTicket(ticket.id, {
        description: form.description.trim(),
        preferredContact: form.preferredContact.trim() || null,
      }, token);
      onSaved(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
    }}>
      <div className="card" style={{ width: "min(480px, 95vw)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h2 style={{ margin: 0 }}>Edit Ticket</h2>
          <button className="ghost-btn" style={{ padding: "0.2rem 0.5rem" }} onClick={onClose}>✕</button>
        </div>
        <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0 }}>Only description and contact can be updated while OPEN.</p>

        {error && <p className="alert">{error}</p>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Description *
            <textarea required value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={4}
              style={{ width: "100%", padding: "0.62rem 0.7rem", border: "1px solid #baa97e", borderRadius: "9px", font: "inherit", resize: "vertical" }} />
          </label>

          <label>Preferred Contact
            <input value={form.preferredContact} onChange={(e) => set("preferredContact", e.target.value)}
              placeholder="e.g. email or phone number" />
          </label>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
            <button type="submit" className="primary-btn" disabled={busy} style={{ flex: 1 }}>
              {busy ? "Saving…" : "Save Changes"}
            </button>
            <button type="button" className="ghost-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
