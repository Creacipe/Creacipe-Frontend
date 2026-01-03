import React, { useState, useEffect, useMemo } from "react";
import { menuService } from "../../services/menuService";
import RecipeCard from "../../components/recipe/RecipeCard/RecipeCard";
import "./AllRecipesPage.scss";

const AllRecipesPage = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter resep berdasarkan pencarian
  const filteredMenus = useMemo(() => {
    if (!searchQuery.trim()) return menus;
    const query = searchQuery.toLowerCase();
    return menus.filter((menu) =>
      menu.title?.toLowerCase().includes(query) ||
      menu.description?.toLowerCase().includes(query)
    );
  }, [menus, searchQuery]);

  useEffect(() => {
    fetchMenus();
  }, []);

  return (
    <div className="all-recipes-page">
      <div className="page-header">
        <h1>Semua Resep</h1>
        <p>Resep yang Anda buat dan simpan</p>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="search-icon"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Cari resep..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Hapus pencarian"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
        {searchQuery && !loading && (
          <p className="search-results-count">
            Ditemukan {filteredMenus.length} resep
          </p>
        )}
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
        ) : filteredMenus.length === 0 ? (
          <div className="empty-state">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <h3>Tidak ditemukan</h3>
            <p>Tidak ada resep yang sesuai dengan pencarian "{searchQuery}"</p>
          </div>
        ) : (
          <div className="recipe-grid">
            {filteredMenus.map((menu) => (
              <RecipeCard key={menu.menu_id} menu={menu} showStatus={false}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRecipesPage;
