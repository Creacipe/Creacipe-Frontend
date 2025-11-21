// LOKASI: src/pages/RecipeDetailPage/RecipeDetailPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { menuService } from "../../services/menuService";
import { commentService } from "../../services/commentService";
import RecipeCard from "../../components/recipe/RecipeCard/RecipeCard";
import { useAuth } from "../../context/AuthContext";
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  MessageCircle,
  User,
} from "lucide-react";
import "./RecipeDetailPage.scss";

// --- FUNGSI HELPER UNTUK PARSING YANG LEBIH AMAN ---
const safeParseJSON = (data) => {
  if (!data) {
    return []; // Kembalikan array kosong jika data null atau ""
  }
  try {
    const parsed = JSON.parse(data);
    // Pastikan hasilnya adalah array
    return Array.isArray(parsed) ? parsed : [parsed.toString()];
  } catch {
    // Fallback jika datanya string biasa (bukan JSON)
    return [data];
  }
};
// ----------------------------------------------------

const RecipeDetailPage = () => {
  const { id } = useParams(); // Mengambil 'id' dari URL
  const menuId = parseInt(id, 10); // Ubah ID jadi angka untuk perbandingan
  const navigate = useNavigate(); // Hook untuk tombol "Kembali"
  const location = useLocation(); // Untuk mendapatkan state dari navigasi
  const [menu, setMenu] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnRecipe, setIsOwnRecipe] = useState(false); // Track apakah resep milik user

  // Cek apakah datang dari homepage/beranda
  // Hanya tampilkan rekomendasi jika datang dari home
  const showRecommendations = location.state?.from === "home";

  // Ambil status login DAN data user lengkap
  const { isLoggedIn, user } = useAuth();

  // --- STATE BARU UNTUK TOMBOL ---
  // 0 = No Vote, 1 = Like, -1 = Dislike
  const [voteStatus, setVoteStatus] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);

  // State untuk count (like RecipeCard)
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  // ------------------------------

  // Efek untuk mengambil DETAIL RESEP UTAMA
  useEffect(() => {
    const fetchMenuDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await menuService.getMenuById(id);
        const menuData = response.data.data;

        // Cek apakah resep sudah approved atau milik user sendiri
        const isOwner = user && menuData.user_id === user.user_id;
        const isApproved = menuData.status === "approved";

        // Set state untuk track ownership
        setIsOwnRecipe(isOwner);

        // Jika bukan pemilik dan belum approved, redirect atau error
        if (!isOwner && !isApproved) {
          setError("Resep belum disetujui dan tidak dapat ditampilkan.");
          setLoading(false);
          return;
        }

        menuData.parsedIngredients = safeParseJSON(menuData.ingredients);
        menuData.parsedInstructions = safeParseJSON(menuData.instructions);

        setMenu(menuData);

        // Set initial counts
        setLikeCount(menuData.total_likes || 0);
        setDislikeCount(menuData.total_dislikes || 0);
        setBookmarkCount(menuData.total_bookmarks || 0);
      } catch (err) {
        const errorMessage =
          err.response?.data?.error || "Gagal mengambil detail resep.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuDetail();
  }, [id, user]); // Jalan lagi jika ID di URL berubah atau user berubah

  // Efek untuk mengambil REKOMENDASI RESEP
  // Hanya fetch jika showRecommendations true (datang dari home)
  useEffect(() => {
    // Skip fetch jika tidak perlu menampilkan rekomendasi
    if (!showRecommendations) {
      return;
    }

    const fetchRecommendations = async () => {
      try {
        const response = await menuService.getRecommendations(id);
        setRecommendations(response.data.data || []);
      } catch (err) {
        // Gagal mengambil rekomendasi bukan masalah besar
        console.error("Gagal mengambil rekomendasi:", err);
      }
    };

    fetchRecommendations();
  }, [id, showRecommendations]); // Tambahkan showRecommendations sebagai dependency

  // Fetch preview comments (3 terbaru)
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await commentService.getCommentsByMenu(id);
        const allComments = response.data.data || [];
        setCommentCount(allComments.length);
        setComments(allComments.slice(0, 3)); // Ambil 3 terbaru saja
      } catch (err) {
        console.error("Gagal mengambil komentar:", err);
      }
    };
    fetchComments();
  }, [id]);

  // --- EFEK BARU: Mengatur status tombol saat user atau menu dimuat ---
  useEffect(() => {
    // Cek hanya jika user sudah login dan data user sudah ter-load
    if (isLoggedIn && user && menu) {
      // Cek status vote
      const userVote = user.Votes?.find((v) => v.MenuID === menuId);
      if (userVote) {
        setVoteStatus(userVote.VoteType); // 1 atau -1
      } else {
        setVoteStatus(0);
      }

      // Cek status bookmark
      const userBookmark = user.Bookmarks?.find((b) => b.MenuID === menuId);
      setIsBookmarked(!!userBookmark); // true atau false
    }
  }, [user, menu, isLoggedIn, menuId]);
  // -----------------------------------------------------------------

  // --- HANDLER BARU (TANPA ALERT) ---
  const handleLike = async () => {
    if (!isLoggedIn) return navigate("/login"); // Arahkan ke login jika belum
    try {
      const response = await menuService.likeMenu(id);
      const newIsLiked = response.data.is_liked;

      // Update count seperti RecipeCard
      if (newIsLiked && voteStatus !== 1) {
        setLikeCount(likeCount + 1);
        if (voteStatus === -1) {
          setDislikeCount(dislikeCount - 1);
        }
      } else if (!newIsLiked && voteStatus === 1) {
        setLikeCount(likeCount - 1);
      }

      setVoteStatus(newIsLiked ? 1 : 0);
    } catch (err) {
      console.error("Gagal like:", err);
    }
  };

  const handleDislike = async () => {
    if (!isLoggedIn) return navigate("/login");
    try {
      const response = await menuService.dislikeMenu(id);
      const newIsDisliked = response.data.is_disliked;

      // Update count seperti RecipeCard
      if (newIsDisliked && voteStatus !== -1) {
        setDislikeCount(dislikeCount + 1);
        if (voteStatus === 1) {
          setLikeCount(likeCount - 1);
        }
      } else if (!newIsDisliked && voteStatus === -1) {
        setDislikeCount(dislikeCount - 1);
      }

      setVoteStatus(newIsDisliked ? -1 : 0);
    } catch (err) {
      console.error("Gagal dislike:", err);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isLoggedIn) return navigate("/login");
    try {
      if (isBookmarked) {
        // Jika sudah di-bookmark, panggil unbookmark
        await menuService.unbookmarkMenu(id);
        setIsBookmarked(false);
        setBookmarkCount(bookmarkCount - 1);
      } else {
        // Jika belum, panggil bookmark
        await menuService.bookmarkMenu(id);
        setIsBookmarked(true);
        setBookmarkCount(bookmarkCount + 1);
      }
    } catch (err) {
      console.error("Gagal toggle bookmark:", err);
    }
  };

  // --- Render Konten ---
  if (loading)
    return <div style={{ padding: "2rem" }}>Loading detail resep...</div>;
  if (error)
    return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;
  if (!menu)
    return <div style={{ padding: "2rem" }}>Resep tidak ditemukan.</div>;

  return (
    <div className="recipe-detail-container">
      {/* Tombol "Kembali" */}
      <button onClick={() => navigate(-1)} className="back-button">
        &lt;
      </button>

      {/* Header: Judul + Author */}
      <div className="recipe-header">
        <h1 className="recipe-title">{menu.title}</h1>
        {(menu.user || menu.User) && (
          <p className="recipe-author">
            oleh <strong>{menu.user?.name || menu.User?.name}</strong>
          </p>
        )}
      </div>

      {/* Tags/Badges */}
      {menu.tags && menu.tags.length > 0 && (
        <div className="recipe-tags">
          {menu.tags.map((tag) => (
            <span key={tag.tag_id} className="tag-badge">
              {tag.tag_name}
            </span>
          ))}
        </div>
      )}

      {/* Gambar Resep */}
      <div className="recipe-detail-image">
        <img
          src={
            menu.image_url || "https://via.placeholder.com/600x400?text=Resep"
          }
          alt={menu.title}
          onError={(e) => {
            console.error("Error loading image:", menu.image_url);
            e.target.src =
              "https://via.placeholder.com/600x400?text=Image+Not+Found";
          }}
        />
      </div>

      {/* Deskripsi */}
      <p className="recipe-detail-description">{menu.description}</p>

      {/* Layout 2 Kolom: Bahan & Instruksi */}
      <div className="detail-layout-grid">
        <div className="ingredients-section">
          <h3>Bahan-bahan</h3>
          <ul>
            {menu.parsedIngredients.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="instructions-section">
          <h3>Instruksi</h3>
          <ol>
            {menu.parsedInstructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* Tombol Aksi (Like/Dislike/Bookmark) - SETELAH Instruksi */}
      {isLoggedIn && (
        <div className="action-buttons-container">
          <button
            onClick={handleLike}
            className={`action-button ${
              voteStatus === 1 ? "active-like" : ""
            }`}>
            <ThumbsUp size={20} />
            <span>{likeCount}</span>
          </button>
          <button
            onClick={handleDislike}
            className={`action-button ${
              voteStatus === -1 ? "active-dislike" : ""
            }`}>
            <ThumbsDown size={20} />
            <span>{dislikeCount}</span>
          </button>
          <button
            onClick={handleBookmarkToggle}
            className={`action-button ${
              isBookmarked ? "active-bookmark" : ""
            }`}>
            <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
            <span>{bookmarkCount}</span>
          </button>
        </div>
      )}

      {/* Preview Komentar - Hide jika resep milik user sendiri */}
      {!isOwnRecipe && (
        <div className="comment-preview-section">
          <div className="comment-header">
            <h3>
              <MessageCircle size={24} />
              Komentar ({commentCount})
            </h3>
          </div>

          {comments.length === 0 ? (
            <div className="no-comments">
              <MessageCircle size={48} />
              <p>Belum ada komentar</p>
              <span>Jadilah yang pertama berkomentar!</span>
            </div>
          ) : (
            <div className="comments-preview-list">
              {comments.map((comment) => (
                <div key={comment.comment_id} className="comment-preview-item">
                  <div className="comment-avatar">
                    {comment.user_avatar ? (
                      <img
                        src={`http://localhost:8080${comment.user_avatar}`}
                        alt={comment.user_name}
                      />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div className="comment-content">
                    <strong>{comment.user_name}</strong>
                    <p>{comment.comment_text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link to={`/menu/${id}/comments`} className="view-all-comments-btn">
            <MessageCircle size={18} />
            {commentCount > 0
              ? "Lihat Semua Komentar & Beri Komentar"
              : "Beri Komentar"}
          </Link>
        </div>
      )}

      {/* BAGIAN REKOMENDASI */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="recommendation-section">
          <h3>Resep Serupa</h3>
          <div className="recipe-grid">
            {recommendations.map((recMenu, index) => (
              <RecipeCard
                key={`rec-${recMenu.menu_id || index}`}
                menu={recMenu}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetailPage;
