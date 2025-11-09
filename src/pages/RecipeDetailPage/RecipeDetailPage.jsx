// LOKASI: src/pages/RecipeDetailPage/RecipeDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { menuService } from '../../services/menuService';
import RecipeCard from '../../components/recipe/RecipeCard/RecipeCard';
import { useAuth } from '../../context/AuthContext'; // Impor useAuth
import './RecipeDetailPage.scss';

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
  const location = useLocation();
  const [menu, setMenu] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnRecipe, setIsOwnRecipe] = useState(false);

   // Cek apakah datang dari homepage/beranda
  // Hanya tampilkan rekomendasi jika datang dari home
  const showRecommendations = location.state?.from === "home";

  // Ambil status login DAN data user lengkap
  const { isLoggedIn, user } = useAuth();

  // --- STATE BARU UNTUK TOMBOL ---
  // 0 = No Vote, 1 = Like, -1 = Dislike
  const [voteStatus, setVoteStatus] = useState(0); 
  const [isBookmarked, setIsBookmarked] = useState(false);
  // ------------------------------

  // Efek untuk mengambil DETAIL RESEP UTAMA
  useEffect(() => {
    const fetchMenuDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await menuService.getMenuById(id);
        const menuData = response.data.data; // Ini PascalCase


        // Cek apakah resep sudah approved atau milik user sendiri
        const isOwner = user && menuData.user_id === user.user_id;
        const isApproved = menuData.status === "approved";

        // Set state untuk track ownership
        setIsOwnRecipe(isOwner);
        
        // Jika bukan pemilik dan belum approved, redirect atau error
        if (!isOwner && !isApproved) {
          setError('Resep belum disetujui dan tidak dapat ditampilkan.');
          setLoading(false);
          return;
        }

        menuData.parsedIngredients = safeParseJSON(menuData.ingredients);
        menuData.parsedInstructions = safeParseJSON(menuData.instructions);

        setMenu(menuData);
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Gagal mengambil detail resep.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuDetail();
  }, [id, user]); // Jalan lagi jika ID di URL berubah

  // Efek untuk mengambil REKOMENDASI RESEP
  useEffect(() => {
    if (!showRecommendations) {
      return; // Lewati jika tidak perlu rekomendasi
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
  }, [id, showRecommendations]); // Jalan lagi jika ID resep berubah

  // --- EFEK BARU: Mengatur status tombol saat user atau menu dimuat ---
  useEffect(() => {
    // Cek hanya jika user sudah login dan data user sudah ter-load
    if (isLoggedIn && user && menu) {
      // Cek status vote
      const userVote = user.Votes?.find(v => v.MenuID === menuId);
      if (userVote) {
        setVoteStatus(userVote.VoteType); // 1 atau -1
      } else {
        setVoteStatus(0);
      }

      // Cek status bookmark
      const userBookmark = user.Bookmarks?.find(b => b.MenuID === menuId);
      setIsBookmarked(!!userBookmark); // true atau false
    }
  }, [user, menu, isLoggedIn, menuId]);
  // -----------------------------------------------------------------

  
  // --- HANDLER BARU (TANPA ALERT) ---
  const handleLike = async () => {
    if (!isLoggedIn) return navigate('/login'); // Arahkan ke login jika belum
    try {
      await menuService.likeMenu(id);
      // Toggle: jika sudah 1 jadi 0, selain itu jadi 1
      setVoteStatus(prev => (prev === 1 ? 0 : 1)); 
    } catch (err) {
      console.error("Gagal like:", err);
    }
  };

  const handleDislike = async () => {
    if (!isLoggedIn) return navigate('/login');
    try {
      await menuService.dislikeMenu(id);
      // Toggle: jika sudah -1 jadi 0, selain itu jadi -1
      setVoteStatus(prev => (prev === -1 ? 0 : -1));
    } catch (err) {
      console.error("Gagal dislike:", err);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isLoggedIn) return navigate('/login');
    try {
      if (isBookmarked) {
        // Jika sudah di-bookmark, panggil unbookmark
        await menuService.unbookmarkMenu(id);
        setIsBookmarked(false);
      } else {
        // Jika belum, panggil bookmark
        await menuService.bookmarkMenu(id);
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error("Gagal toggle bookmark:", err);
    }
  };

  // --- Render Konten ---
  if (loading) return <div style={{ padding: '2rem' }}>Loading detail resep...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  if (!menu) return <div style={{ padding: '2rem' }}>Resep tidak ditemukan.</div>;

  return (
    <div className="recipe-detail-container">
      {/* Tombol "Kembali" */}
      <button onClick={() => navigate(-1)} className="back-button">
        &lt;
      </button>

      {/* Judul Resep */}
      <h2 className="recipe-title">{menu.title}</h2> 
      
      {/* Link Penulis Resep*/}
      {menu.user && (
        <Link to={`/user/${menu.user.user_id}`} className="recipe-author">
          Oleh: {menu.user.name}
        </Link>
      )}

      {/* Tombol Aksi (Like/Bookmark) - Hanya Tampil Jika Login */}
      {isLoggedIn && (
        <div className="action-buttons-container">
          <button 
            onClick={handleLike} 
            className={`action-button ${voteStatus === 1 ? 'active-like' : ''}`}
          >
            👍 Like
          </button>
          <button 
            onClick={handleDislike} 
            className={`action-button ${voteStatus === -1 ? 'active-dislike' : ''}`}
          >
            👎 Dislike
          </button>
          <button 
            onClick={handleBookmarkToggle} 
            className={`action-button ${isBookmarked ? 'active-bookmark' : ''}`}
          >
            {isBookmarked ? '🔖 Tersimpan' : '🔖 Bookmark'}
          </button>
        </div>
      )}

      {/* Gambar Resep */}
      <div className="recipe-detail-image">
        <img
          src={menu.image_url || "https://via.placeholder.com/600x400?text=Resep"}
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

      {/* Layout 2 Kolom */}
      <div className="detail-layout-grid">
        {/* Kolom Kiri: Bahan-bahan */}
        <div className="ingredients-section">
          <h3>Bahan-bahan</h3>
          <ul>
            {menu.parsedIngredients.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        {/* Kolom Kanan: Instruksi */}
        <div className="instructions-section">
          <h3>Instruksi</h3>
          <ol>
            {menu.parsedInstructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* BAGIAN KOMENTAR - Hide jika resep milik user sendiri */}
      {!isOwnRecipe && (
        <div className="comment-section">
          <h3>Komentar</h3>
          <form className="comment-form">
            <input
              type="text"
              placeholder="Fitur komentar belum tersedia"
              readOnly
            />
            <button type="submit" disabled>
              Kirim
            </button>
          </form>
        </div>
      )}

      {/* BAGIAN REKOMENDASI */}
      {showRecommendations &&recommendations.length > 0 && (
        <div className="recommendation-section">
          <h3>Resep Serupa</h3>
          <div className="recipe-grid">
            {recommendations.map((recMenu, index) => (
              <RecipeCard key={`rec-${recMenu.menu_id || index}`} menu={recMenu} /> 
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetailPage;