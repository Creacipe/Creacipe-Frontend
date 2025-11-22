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
    // Pastikan menuId tidak undefined sebelum membuat Link
    menuId ? (
      <div className="recipe-card">
        <Link to={`/menu/${menuId}`} className="recipe-card-link" state={sourceFrom ? { from: sourceFrom } : undefined}>
          <div className="recipe-card-image">
            <img src={imageUrl} alt={title} />
            {/* Status badge untuk resep milik user */}
            {showStatus && menu.status && (
              <div className="status-overlay">
                <StatusBadge status={menu.status} />
              </div>
            )}
          </div>
          <div className="recipe-card-content">
            <h3 className="recipe-card-title">{title}</h3>
            {/* Tags Display */}
            {tags && tags.length > 0 && (
              <div className="recipe-card-tags">
                {tags.map((tag) => (
                  <span key={tag.tag_id} className="tag-pill">
                    {tag.tag_name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>

        {/* Action buttons */}
        <div className="recipe-card-actions">
          <button
            className={`action-btn like-btn ${isLiked ? "active" : ""}`}
            onClick={handleLike}
            title="Like">
            <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
            <span>{likeCount}</span>
          </button>

          <button
            className={`action-btn dislike-btn ${isDisliked ? "active" : ""}`}
            onClick={handleDislike}
            title="Dislike">
            <ThumbsDown size={18} fill={isDisliked ? "currentColor" : "none"} />
            <span>{dislikeCount}</span>
          </button>

          <button
            className={`action-btn bookmark-btn ${
              isBookmarked ? "active" : ""
            }`}
            onClick={handleBookmark}
            title="Bookmark">
            <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
            <span>{bookmarkCount}</span>
          </button>

          {/* Dropdown More untuk Edit & Delete */}
          {showActions && (
            <div className="more-actions-container">
              <button
                className="action-btn more-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                title="More">
                <MoreVertical size={18} />
              </button>

              {showDropdown && (
                <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="dropdown-item edit-item"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowDropdown(false);
                      if (onEdit) onEdit(menuId);
                    }}>
                    <Edit2 size={16} />
                    <span>Edit</span>
                  </button>

                  <button
                    className="dropdown-item delete-item"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowDropdown(false);
                      if (onDelete) onDelete(menuId, title);
                    }}>
                    <Trash2 size={16} />
                    <span>Hapus</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    ) : null // Jangan render kartu jika tidak ada ID
  );
};

export default RecipeCard;
