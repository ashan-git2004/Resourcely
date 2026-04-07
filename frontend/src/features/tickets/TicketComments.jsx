import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { addComment, deleteComment, getTicketComments, updateComment } from "./ticketService";

export default function TicketComments({ ticketId }) {
  const { auth } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [ticketId]);

  async function loadComments() {
    try {
      setLoading(true);
      const data = await getTicketComments(ticketId, auth.token);
      setComments(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    try {
      setSubmitting(true);
      setError("");
      await addComment(ticketId, newComment, auth.token);
      setNewComment("");
      loadComments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateComment() {
    if (!editingContent.trim()) return;
    try {
      setSubmitting(true);
      setError("");
      await updateComment(ticketId, editingCommentId, editingContent, auth.token);
      setEditingCommentId(null);
      setEditingContent("");
      loadComments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm("Delete this comment?")) return;
    try {
      setError("");
      await deleteComment(ticketId, commentId, auth.token);
      loadComments();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="card">
      <h2 style={{ marginTop: 0 }}>Comments</h2>
      {error && <div className="alert" style={{ marginBottom: "0.8rem" }}>{error}</div>}

      <div className="form-grid" style={{ marginBottom: "1rem" }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment or progress note"
          disabled={submitting}
          rows={3}
        />
        <button onClick={handleAddComment} disabled={submitting || !newComment.trim()} className="primary-btn">
          {submitting ? "Posting..." : "Post comment"}
        </button>
      </div>

      <div className="comments-list">
        {loading ? (
          <p className="muted">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="muted">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`comment-item ${comment.author?.email === auth?.email ? "comment-mine" : ""}`}
            >
              <div className="comment-header">
                <span className="comment-author">
                  {comment.author?.email} {comment.author?.email === auth?.email && "(You)"}
                </span>
                <span className="comment-date">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>

              {editingCommentId === comment.id ? (
                <div className="form-grid">
                  <textarea
                    autoFocus
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={3}
                  />
                  <div className="comment-actions">
                    <button onClick={handleUpdateComment} className="action-link" disabled={submitting}>
                      Save
                    </button>
                    <button onClick={() => setEditingCommentId(null)} className="action-link" disabled={submitting}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>{comment.content}</div>
                  {comment.author?.email === auth?.email && (
                    <div className="comment-actions">
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditingContent(comment.content);
                        }}
                        className="action-link"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDeleteComment(comment.id)} className="action-link action-link-danger">
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
