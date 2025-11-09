// LOKASI: src/components/recipe/RecipeCard/RecipeCard.jsx (VERSI DIPERBARUI)

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { menuService } from "../../../services/menuService";
import { useAuth } from "../../../context/AuthContext";
import StatusBadge from "../../StatusBadge/StatusBadge";
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            <span>{likeCount}</span>
          </button>

          <button
            className={`action-btn dislike-btn ${isDisliked ? "active" : ""}`}
            onClick={handleDislike}
            title="Dislike">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isDisliked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
            </svg>
            <span>{dislikeCount}</span>
          </button>

          <button
            className={`action-btn bookmark-btn ${
              isBookmarked ? "active" : ""
            }`}
            onClick={handleBookmark}
            title="Bookmark">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isBookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
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
