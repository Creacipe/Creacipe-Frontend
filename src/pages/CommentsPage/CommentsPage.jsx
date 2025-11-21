// LOKASI: src/pages/CommentsPage/CommentsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MessageCircle, Send, Trash2, ArrowLeft, User } from "lucide-react";
import { commentService } from "../../services/commentService";
import { menuService } from "../../services/menuService";
import { useAuth } from "../../context/AuthContext";
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
      await commentService.createComment(id, newComment);
      setNewComment("");
      await fetchMenuAndComments();
      
      // Trigger refresh badge
      window.dispatchEvent(new Event('notification-read'));
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Gagal mengirim komentar";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Hapus komentar ini?")) return;

    try {
      await commentService.deleteComment(commentId);
      await fetchMenuAndComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Gagal menghapus komentar");
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
        <div className="loading">Memuat...</div>
      </div>
    );
  }

  const isOwnRecipe = menu && user && menu.user_id === user.UserID;

  return (
    <div className="comments-page">
      <div className="comments-header">
        <button onClick={() => navigate(`/menu/${id}`)} className="back-btn">
          <ArrowLeft size={20} />
          <span>Kembali ke Resep</span>
        </button>
        
        {menu && (
          <div className="recipe-info">
            <h2>{menu.title}</h2>
            <p className="recipe-author">oleh {menu.user?.name || "Unknown"}</p>
          </div>
        )}
      </div>

      <div className="comments-container">
        <div className="comments-title">
          <MessageCircle size={24} />
          <h3>Komentar ({comments.length})</h3>
        </div>

        {/* Form Add Comment - Hide if own recipe */}
        {user && !isOwnRecipe && (
          <form onSubmit={handleSubmitComment} className="comment-form">
            <div className="form-header">
              <div className="user-avatar">
                {user.Profile?.profile_picture_url ? (
                  <img
                    src={`http://localhost:8080${user.Profile.profile_picture_url}`}
                    alt={user.Name}
                  />
                ) : (
                  <User size={24} />
                )}
              </div>
              <span className="user-name">{user.Name}</span>
            </div>
            
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar Anda..."
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

        {isOwnRecipe && (
          <div className="info-box">
            <p>Anda adalah pemilik resep ini. Hanya pengguna lain yang dapat berkomentar.</p>
          </div>
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
              <div key={comment.comment_id} className="comment-item">
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
                    <span className="comment-author">{comment.user_name}</span>
                    <span className="comment-time">{formatDate(comment.created_at)}</span>
                  </div>
                  
                  <p className="comment-text">{comment.comment_text}</p>
                  
                  {user && comment.user_id === user.UserID && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteComment(comment.comment_id)}
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsPage;
