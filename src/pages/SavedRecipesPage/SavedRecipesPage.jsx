import React, { useState, useEffect } from "react";
import { menuService } from "../../services/menuService";
import RecipeCard from "../../components/recipe/RecipeCard/RecipeCard";
import "./SavedRecipesPage.scss";

const SavedRecipesPage = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await menuService.getMyBookmarks();
      setMenus(response.data.data || []);
    } catch (err) {
      setError("Gagal memuat resep. Silakan coba lagi.");
      console.error("Error fetching menus:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnBookmark = (menuId) => {
    // Hapus menu yang di-unbookmark dari state
    setMenus((prevMenus) => prevMenus.filter((menu) => menu.menu_id !== menuId));
  }

  useEffect(() => {
    fetchMenus();
  }, []);

  return (
    <div className="saved-recipes-page">
      <div className="page-header">
        <h1>Tersimpan</h1>
        <p>Resep yang Anda bookmark</p>
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
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <h3>Belum ada resep</h3>
            <p>
              Anda belum menyimpan resep. Jelajahi dan bookmark resep favorit!
            </p>
          </div>
        ) : (
          <div className="recipe-grid">
            {menus.map((menu) => (
              <RecipeCard key={menu.menu_id} menu={menu} onUnbookmark={handleUnBookmark}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedRecipesPage;
