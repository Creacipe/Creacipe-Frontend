import React, { useState, useEffect } from "react";
import { menuService } from "../../services/menuService";
import RecipeCard from "../../components/recipe/RecipeCard/RecipeCard";
import "./AllRecipesPage.scss";

const AllRecipesPage = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await menuService.getMyCollection();
      setMenus(response.data.data || []);
    } catch (err) {
      setError("Gagal memuat resep. Silakan coba lagi.");
      console.error("Error fetching menus:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  return (
    <div className="all-recipes-page">
      <div className="page-header">
        <h1>Semua Resep</h1>
        <p>Resep yang Anda buat dan simpan</p>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-state">
            <p>Memuat resep...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchMenus} className="retry-btn">
              Coba Lagi
            </button>
          </div>
        ) : menus.length === 0 ? (
          <div className="empty-state">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <h3>Belum ada resep</h3>
            <p>Mulai buat resep atau bookmark resep favorit Anda</p>
          </div>
        ) : (
          <div className="recipe-grid">
            {menus.map((menu) => (
              <RecipeCard key={menu.menu_id} menu={menu} showStatus={false}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRecipesPage;
