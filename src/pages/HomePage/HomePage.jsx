// LOKASI: src/pages/HomePage/HomePage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menuService } from "../../services/menuService";
import RecipeCard from "../../components/recipe/RecipeCard/RecipeCard";
import { useAuth } from "../../context/AuthContext";
import "./HomePage.scss";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [popularMenus, setPopularMenus] = useState([]);
  const [recommendedMenus, setRecommendedMenus] = useState([]);
  const [latestMenus, setLatestMenus] = useState([]);
  
  const [popularLoading, setPopularLoading] = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [latestLoading, setLatestLoading] = useState(true);
  
  const [popularError, setPopularError] = useState(null);
  const [latestError, setLatestError] = useState(null);

  // Fetch Popular Menus
  useEffect(() => {
    const fetchPopularMenus = async () => {
      try {
        setPopularLoading(true);
        setPopularError(null);
        const response = await menuService.getPopularMenus();
        setPopularMenus(response.data.data.slice(0, 5));
      } catch (err) {
        setPopularError(err.response?.data?.error || "Gagal mengambil resep populer.");
      } finally {
        setPopularLoading(false);
      }
    };

    fetchPopularMenus();
  }, []);

  // Fetch Personalized Recommendations (only if user logged in)
  useEffect(() => {
    if (!user) return;

    const fetchRecommendations = async () => {
      try {
        setRecommendedLoading(true);
        const response = await menuService.getPersonalizedRecommendations();
        setRecommendedMenus(response.data.data.slice(0, 5));
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        // Don't show error, just skip this section
      } finally {
        setRecommendedLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  // Fetch Latest Menus
  useEffect(() => {
    const fetchLatestMenus = async () => {
      try {
        setLatestLoading(true);
        setLatestError(null);
        const response = await menuService.getAllMenus();
        // Filter approved and sort by created_at desc
        const approved = response.data.data
          .filter(menu => menu.status === 'approved')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setLatestMenus(approved);
      } catch (err) {
        setLatestError(err.response?.data?.error || "Gagal mengambil resep terbaru.");
      } finally {
        setLatestLoading(false);
      }
    };

    fetchLatestMenus();
  }, []);

  const renderRecipeGrid = (menus) => (
    <div className="recipe-grid">
      {menus.map((menu) => (
        <RecipeCard key={menu.menu_id} menu={menu} sourceFrom="home" />
      ))}
    </div>
  );

  return (
    <div className="home-page-container">
      {/* Search Bar */}
      <div className="search-bar-container">
        <input type="text" placeholder="Cari resep..." />
      </div>

      {/* Resep Populer */}
      <section className="popular-section">
        <h2>Resep Populer</h2>
        {popularLoading ? (
          <div className="loading">Loading resep populer...</div>
        ) : popularError ? (
          <div className="error">{popularError}</div>
        ) : popularMenus.length === 0 ? (
          <div className="no-data">Belum ada resep populer.</div>
        ) : (
          <>
            {renderRecipeGrid(popularMenus)}
            <div className="view-more-container">
              <button
                className="view-more-btn"
                onClick={() => navigate("/popular-recipes")}
              >
                Lihat Lebih Banyak
              </button>
            </div>
          </>
        )}
      </section>

      {/* Rekomendasi Untuk Kamu (only if logged in) */}
      {user && (
        <section className="recommended-section">
          <h2>Rekomendasi Untuk Kamu</h2>
          {recommendedLoading ? (
            <div className="loading">Memuat rekomendasi...</div>
          ) : recommendedMenus.length === 0 ? (
            <div className="no-data">
              Belum ada rekomendasi. Mulai like resep favoritmu!
            </div>
          ) : (
            <>
              {renderRecipeGrid(recommendedMenus)}
              <div className="view-more-container">
                <button
                  className="view-more-btn"
                  onClick={() => navigate("/recommended-recipes")}
                >
                  Lihat Lebih Banyak
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* Resep Terbaru */}
      <section className="latest-section">
        <h2>Resep Terbaru</h2>
        {latestLoading ? (
          <div className="loading">Loading resep terbaru...</div>
        ) : latestError ? (
          <div className="error">{latestError}</div>
        ) : latestMenus.length === 0 ? (
          <div className="no-data">Belum ada resep terbaru.</div>
        ) : (
          <>
            {renderRecipeGrid(latestMenus)}
            <div className="view-more-container">
              <button
                className="view-more-btn"
                onClick={() => navigate("/latest-recipes")}
              >
                Lihat Lebih Banyak
              </button>
            </div>
          </>
        )}
      </section>

      {/* Tentang Kami */}
      <section className="about-section">
        <h2>Tentang Kami</h2>
        <p>
          Creacipe hadir untuk membuat aktivitas memasak menjadi lebih mudah dan
          menyenangkan. Kami menyediakan ruang bagi siapa pun untuk berbagi
          resep, menemukan inspirasi, dan belajar dari sesama pecinta kuliner.
          Di sini, setiap masakan adalah hasil dari kreativitas dan cinta untuk
          rasa.
        </p>
      </section>
    </div>
  );
};

export default HomePage;

