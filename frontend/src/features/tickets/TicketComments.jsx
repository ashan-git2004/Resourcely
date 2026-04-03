import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getTicketComments, addComment, updateComment, deleteComment } from "./ticketService";

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
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      setError("");
      await deleteComment(ticketId, commentId, auth.token);
      loadComments();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="card" style={{ padding: "1.5rem" }}>
      <h2>Comments</h2>
      {error && <div className="alert" style={{ marginBottom: "1rem" }}>{error}</div>}

      <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <textarea 
          style={{ 
            width: "100%", 
            minHeight: "80px", 
            padding: "0.75rem", 
            border: "1px solid #baa97e", 
            borderRadius: "8px", 
            font: "inherit" 
          }}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment or update note..."
          disabled={submitting}
        />
        <button 
          onClick={handleAddComment} 
          disabled={submitting || !newComment.trim()} 
          className="primary-btn"
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </div>

      <div className="comments-list">
        {loading ? (
          <p>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="muted">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={`comment-item ${comment.author?.email === auth?.email ? "comment-mine" : ""}`}>
              <div className="comment-header">
                <span className="comment-author">
                  {comment.author?.email} {comment.author?.email === auth?.email && "(You)"}
                </span>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>

              {editingCommentId === comment.id ? (
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <textarea 
                    autoFocus
                    style={{ 
                      width: "100%", 
                      padding: "0.5rem", 
                      border: "1px solid var(--accent)", 
                      borderRadius: "6px", 
                      font: "inherit" 
                    }}
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                  />
                  <div className="comment-actions">
                    <button onClick={handleUpdateComment} className="action-link" disabled={submitting}>Save</button>
                    <button onClick={() => setEditingCommentId(null)} className="action-link" disabled={submitting}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="comment-content">{comment.content}</div>
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
                      <button 
                        onClick={() => handleDeleteComment(comment.id)} 
                        className="action-link action-link-danger"
                      >
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
