// LOKASI: src/pages/CommentsPage/CommentsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MessageCircle,
  Send,
  Trash2,
  ArrowLeft,
  User,
  Reply,
} from "lucide-react";
import { commentService } from "../../services/commentService";
import { menuService } from "../../services/menuService";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/ui/Toast/Toast";
import "./CommentsPage.scss";

const CommentsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [menu, setMenu] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null); // { commentId, userName }
  const [replyText, setReplyText] = useState("");
  const [toast, setToast] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  // Fetch menu info dan comments
  const fetchMenuAndComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [menuRes, commentsRes] = await Promise.all([
        menuService.getMenuById(id),
        commentService.getCommentsByMenu(id),
      ]);

      setMenu(menuRes.data.data);
      setComments(commentsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMenuAndComments();
  }, [fetchMenuAndComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError("Komentar tidak boleh kosong");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await commentService.createComment(id, newComment, null);
      setNewComment("");
      await fetchMenuAndComments();

      // Trigger refresh badge
      window.dispatchEvent(new Event("notification-read"));
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Gagal mengirim komentar";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await commentService.createComment(id, replyText, replyingTo.commentId);
      setReplyText("");
      setReplyingTo(null);
      await fetchMenuAndComments();

      // Trigger refresh badge
      window.dispatchEvent(new Event("notification-read"));
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Gagal mengirim balasan";
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
  if (!commentToDelete) return;

  try {
    // Make the API call
    await commentService.deleteComment(commentToDelete);
    await fetchMenuAndComments();
    
    setToast({
      type: "success",
      message: "Komentar berhasil dihapus"
    });
  } catch (err) {
    console.error("Error deleting comment:", err);
    console.error("Error response:", err.response);
    
    let errorMessage = "Gagal menghapus komentar";
    if (err.response) {
      // If we got a response from the server, use its error message
      errorMessage = err.response.data?.error || errorMessage;
      console.error("Server response data:", err.response.data);
    }
    
    setToast({
      type: "error",
      message: errorMessage
    });
  } finally {
    setShowDeleteConfirm(false);
    setCommentToDelete(null);
    }
  };
 
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;

    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="comments-page">
        <div className="loading">
          <MessageCircle size={48} />
          <p>Memuat komentar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comments-page">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Kembali</button>
        </div>
      </div>
    );
  }

  const isOwnRecipe = menu && user && menu.user_id === user.user_id;

  return (
    <div className="comments-page">
      <div className="comments-header">
        <button
          onClick={() => navigate(`/menu/${id}`, { replace: true })}
          className="back-btn">
          <ArrowLeft size={20} />
          <span>Kembali ke Resep</span>
        </button>

        {menu && (
          <div className="recipe-info">
            <h2>{menu.title}</h2>
            <p className="recipe-author">
              oleh{" "}
              {menu.User?.name ||
                menu.User?.Name ||
                menu.user?.name ||
                "Unknown"}
            </p>
          </div>
        )}
      </div>

      <div className="comments-container">
        <div className="comments-title">
          <MessageCircle size={24} />
          <h3>Komentar ({comments.length})</h3>
        </div>

        {/* Form Add Comment - Tersedia untuk semua user yang login */}
        {user && (
          <form onSubmit={handleSubmitComment} className="comment-form">
            <div className="form-header">
              <div className="user-avatar">
                {user.profile?.profile_picture_url ? (
                  <img
                    src={`http://localhost:8080${user.profile.profile_picture_url}`}
                    alt={user.name}
                  />
                ) : (
                  <User size={24} />
                )}
              </div>
              <span className="user-name">{user.name}</span>
            </div>

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                isOwnRecipe
                  ? "Berikan tips atau informasi tambahan untuk resep Anda..."
                  : "Tulis komentar Anda..."
              }
              rows="4"
              disabled={isSubmitting}
            />

            {error && <p className="error-message">{error}</p>}

            <button type="submit" disabled={isSubmitting || !newComment.trim()}>
              <Send size={18} />
              {isSubmitting ? "Mengirim..." : "Kirim Komentar"}
            </button>
          </form>
        )}

        {!user && (
          <div className="info-box">
            <p>
              <Link to="/login">Login</Link> untuk berkomentar
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="empty-state">
              <MessageCircle size={48} />
              <p>Belum ada komentar</p>
              <span>Jadilah yang pertama berkomentar!</span>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.comment_id} className="comment-thread">
                {/* Main Comment */}
                <div className="comment-item">
                  <div className="comment-avatar">
                    {comment.user_avatar ? (
                      <img
                        src={`http://localhost:8080${comment.user_avatar}`}
                        alt={comment.user_name}
                      />
                    ) : (
                      <User size={32} />
                    )}
                  </div>

                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">
                        {comment.user_name}
                      </span>
                      <span className="comment-time">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>

                    <p className="comment-text">{comment.comment_text}</p>

                    <div className="comment-actions">
                      {user && comment.user_id === user.user_id && (
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCommentToDelete(comment.comment_id);
                            setShowDeleteConfirm(true);
                          }}>
                          <Trash2 size={14} />
                          Hapus
                        </button>
                      )}

                      {/* Tombol Reply - muncul untuk semua user yang login */}
                      {user && (
                        <button
                          className="reply-btn"
                          onClick={() => {
                            setReplyingTo({
                              commentId: comment.comment_id,
                              userName: comment.user_name,
                            });
                            setReplyText("");
                          }}>
                          <Reply size={14} />
                          Balas
                        </button>
                      )}
                    </div>

                    {/* Reply Form */}
                    {replyingTo?.commentId === comment.comment_id && (
                      <form onSubmit={handleSubmitReply} className="reply-form">
                        <div className="reply-to-info">
                          Membalas <strong>@{replyingTo.userName}</strong>
                        </div>
                        <div className="reply-input-group">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Balas ke ${replyingTo.userName}...`}
                            rows="3"
                            disabled={isSubmitting}
                            autoFocus
                          />
                          <div className="reply-actions">
                            <button
                              type="button"
                              className="cancel-btn"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText("");
                              }}>
                              Batal
                            </button>
                            <button
                              type="submit"
                              className="submit-btn"
                              disabled={isSubmitting || !replyText.trim()}>
                              <Send size={14} />
                              {isSubmitting ? "Mengirim..." : "Kirim"}
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="replies-container">
                    {comment.replies.map((reply) => (
                      <div
                        key={reply.comment_id}
                        className="comment-item reply-item">
                        <div className="comment-avatar">
                          {reply.user_avatar ? (
                            <img
                              src={`http://localhost:8080${reply.user_avatar}`}
                              alt={reply.user_name}
                            />
                          ) : (
                            <User size={28} />
                          )}
                        </div>

                        <div className="comment-content">
                          <div className="comment-header">
                            <span className="comment-author">
                              {reply.user_name}
                            </span>
                            <span className="comment-time">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>

                          <p className="comment-text">{reply.comment_text}</p>

                          {user && reply.user_id === user.user_id && (
                            <button
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCommentToDelete(reply.comment_id);
                                setShowDeleteConfirm(true);
                              }}>
                              <Trash2 size={14} />
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
      <div className="modal-overlay">
        <div className="modal-dialog">
          <div className="modal-content">
            <h3>Konfirmasi Hapus</h3>
            <p>Apakah Anda yakin ingin menghapus komentar ini?</p>
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCommentToDelete(null);
                }}>
                Batal
              </button>
              <button 
                className="btn-confirm"
                onClick={handleDeleteComment}>
                Hapus
              </button>
            </div>
          </div>
       </div>
      </div>
      )}

      {toast && (
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast(null)}
      />
      )}
    </div>
  );
};

export default CommentsPage;
