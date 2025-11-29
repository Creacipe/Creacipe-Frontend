// LOKASI: src/components/recipe/RecipeCard/RecipeCard.jsx (VERSI DIPERBARUI)

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { menuService } from "../../../services/menuService";
import { useAuth } from "../../../context/AuthContext";
import StatusBadge from "../../StatusBadge/StatusBadge";
import { ThumbsUp, ThumbsDown, Bookmark, MoreVertical, Edit2, Trash2 } from "lucide-react";
import "./RecipeCard.scss";

const RecipeCard = ({ menu, showStatus = false, sourceFrom = null, onUnbookmark, showActions = false, onEdit, onDelete }) => {
  const { user } = useAuth();

  const [showDropdown, setShowDropdown] = useState(false);

  // --- PERBAIKAN ---
  // Handle snake_case (dari /menus/popular) AND PascalCase (dari /recommendations)
  const menuId = menu.menu_id || menu.MenuID;
  const title = menu.title || menu.Title;
  const imageUrl =
    menu.image_url ||
    menu.ImageURL ||
    "https://via.placeholder.com/300x200?text=Resep";

  // Handle tags dari berbagai format response
  const tags = menu.tags || menu.Tags || [];

  // Handle vote scores (struktur baru: likes dan dislikes terpisah)
  const initialLikes = menu.total_likes || 0;
  const initialDislikes = menu.total_dislikes || 0;
  const initialBookmarks = menu.total_bookmarks || 0;
  // -----------------

  // State untuk like, dislike, dan bookmark
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [dislikeCount, setDislikeCount] = useState(initialDislikes);
  const [bookmarkCount, setBookmarkCount] = useState(initialBookmarks);

  // Fetch status interaksi user saat component mount
  useEffect(() => {
    const fetchInteractionStatus = async () => {
      // Hanya fetch jika user sudah login
      if (user && menuId) {
        try {
          const response = await menuService.getUserInteractionStatus(menuId);
          setIsLiked(response.data.is_liked);
          setIsDisliked(response.data.is_disliked);
          setIsBookmarked(response.data.is_bookmarked);
        } catch (error) {
          // Jika error (misal token expired), abaikan
          console.error("Error fetching interaction status:", error);
        }
      }
    };

    fetchInteractionStatus();
  }, [menuId, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (event) => {
      if (!event.target.closest(".more-actions-container")) {
        setShowDropdown(false);
      }
    };

    setTimeout(() => { document.addEventListener('click', handleClickOutside); }, 0); // To avoid immediate trigger on the same click
    
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  // Handler untuk like
  const handleLike = async (e) => {
    e.preventDefault(); // Prevent navigation

    // Jika user belum login, arahkan ke login
    if (!user) {
      alert("Silakan login terlebih dahulu untuk memberikan like");
      return;
    }

    try {
      const response = await menuService.likeMenu(menuId);

      // Update state berdasarkan response dari backend
      const newIsLiked = response.data.is_liked;
      const newIsDisliked = response.data.is_disliked;

      // Update UI
      if (newIsLiked && !isLiked) {
        // User baru like
        setLikeCount(likeCount + 1);
        if (isDisliked) {
          // Jika sebelumnya dislike, kurangi dislike count
          setDislikeCount(dislikeCount - 1);
        }
      } else if (!newIsLiked && isLiked) {
        // User unlike
        setLikeCount(likeCount - 1);
      }

      setIsLiked(newIsLiked);
      setIsDisliked(newIsDisliked);
    } catch (error) {
      console.error("Error liking menu:", error);
      alert("Gagal memberikan like. Silakan coba lagi.");
    }
  };

  // Handler untuk dislike
  const handleDislike = async (e) => {
    e.preventDefault(); // Prevent navigation

    // Jika user belum login, arahkan ke login
    if (!user) {
      alert("Silakan login terlebih dahulu untuk memberikan dislike");
      return;
    }

    try {
      const response = await menuService.dislikeMenu(menuId);

      // Update state berdasarkan response dari backend
      const newIsLiked = response.data.is_liked;
      const newIsDisliked = response.data.is_disliked;

      // Update UI
      if (newIsDisliked && !isDisliked) {
        // User baru dislike
        setDislikeCount(dislikeCount + 1);
        if (isLiked) {
          // Jika sebelumnya like, kurangi like count
          setLikeCount(likeCount - 1);
        }
      } else if (!newIsDisliked && isDisliked) {
        // User un-dislike
        setDislikeCount(dislikeCount - 1);
      }

      setIsLiked(newIsLiked);
      setIsDisliked(newIsDisliked);
    } catch (error) {
      console.error("Error disliking menu:", error);
      alert("Gagal memberikan dislike. Silakan coba lagi.");
    }
  };

  // Handler untuk bookmark
  const handleBookmark = async (e) => {
    e.preventDefault(); // Prevent navigation

    // Jika user belum login, arahkan ke login
    if (!user) {
      alert("Silakan login terlebih dahulu untuk bookmark");
      return;
    }

    try {
      if (isBookmarked) {
        // Unbookmark
        await menuService.unbookmarkMenu(menuId);
        setIsBookmarked(false);
        setBookmarkCount(bookmarkCount - 1);

        // Panggil callback jika disediakan (untuk update di parent)
        if (onUnbookmark) {
          onUnbookmark(menuId);
        }
      } else {
        // Bookmark
        await menuService.bookmarkMenu(menuId);
        setIsBookmarked(true);
        setBookmarkCount(bookmarkCount + 1);
      }
    } catch (error) {
      console.error("Error bookmarking menu:", error);
      alert("Gagal menyimpan bookmark. Silakan coba lagi.");
    }
  };

  return (
    menuId ? (
      <div className="recipe-card-modern">
        <div className="card-image-wrapper">
          <Link to={`/menu/${menuId}`} state={sourceFrom ? { from: sourceFrom } : undefined}>
            <img src={imageUrl} alt={title} loading="lazy" />
            <div className="hover-overlay"></div>
          </Link>

          {/* Floating Status Badge (Top Left) */}
          {showStatus && menu.status && (
            <div className="status-badge-float">
              <StatusBadge status={menu.status} />
            </div>
          )}

          {/* Floating Bookmark Button (Top Right) - Signature Style */}
          <button
            className={`float-action-btn ${isBookmarked ? "active" : ""}`}
            onClick={handleBookmark}
            title="Simpan Resep">
            <Bookmark size={20} fill={isBookmarked ? "#FF6B6B" : "none"} stroke={isBookmarked ? "#FF6B6B" : "currentColor"} />
          </button>
        </div>

        <div className="card-content">
          {/* Title */}
          <Link to={`/menu/${menuId}`} className="card-title-link" state={sourceFrom ? { from: sourceFrom } : undefined}>
            <h3>{title}</h3>
          </Link>

          {/* Tags (Optional: Bisa disembunyikan jika ingin sangat minimalis) */}
          {tags && tags.length > 0 && (
            <div className="card-tags">
              {tags.slice(0, 2).map((tag) => ( // Tampilkan max 2 tags agar tidak penuh
                <span key={tag.tag_id} className="mini-tag">{tag.tag_name}</span>
              ))}
            </div>
          )}

          {/* Footer: Like/Dislike & More Actions */}
          <div className="card-footer">
            <div className="social-actions">
              <button className={`icon-btn ${isLiked ? "liked" : ""}`} onClick={handleLike}>
                <ThumbsUp size={16} />
                <span>{likeCount}</span>
              </button>
              <button className={`icon-btn ${isDisliked ? "disliked" : ""}`} onClick={handleDislike}>
                <ThumbsDown size={16} />
              </button>
            </div>

            {/* Admin/User Actions (Edit/Delete) */}
            {showActions && (
              <div className="more-actions-container">
                <button
                  className="icon-btn more-btn"
                  onClick={(e) => { e.preventDefault(); setShowDropdown(!showDropdown); }}>
                  <MoreVertical size={18} />
                </button>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <button onClick={(e) => { 
                        e.preventDefault(); setShowDropdown(false); if (onEdit) onEdit(menuId); 
                      }}>
                      <Edit2 size={14} /> Edit
                    </button>
                    <button className="delete" onClick={(e) => { 
                        e.preventDefault(); setShowDropdown(false); if (onDelete) onDelete(menuId, title); 
                      }}>
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    ) : null
  );
};

export default RecipeCard;