import React, { useState, useEffect } from "react";
import { menuService } from "../../services/menuService";
import RecipeCard from "../../components/recipe/RecipeCard/RecipeCard";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import "./SavedRecipesPage.scss";

const SavedRecipesPage = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 12;

  // Debounce search input (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch recipes when page or search changes
  useEffect(() => {
    const fetchMenus = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await menuService.getMyBookmarks(currentPage, limit, debouncedSearch);
        setMenus(response.data.data || []);
        setTotalPages(response.data.total_pages || 0);
        setTotal(response.data.total || 0);
      } catch (err) {
        setError("Gagal memuat resep. Silakan coba lagi.");
        console.error("Error fetching menus:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, [currentPage, debouncedSearch]);

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUnBookmark = (menuId) => {
    // Remove from local state immediately for better UX
    setMenus(prev => prev.filter(m => m.menu_id !== menuId));
    setTotal(prev => prev - 1);
  };

  // Render pagination with dots
  const renderPagination = () => {
    return [...Array(totalPages)].map((_, index) => {
      const pageNumber = index + 1;
      if (
        pageNumber === 1 ||
        pageNumber === totalPages ||
        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
      ) {
        return (
          <button
            key={pageNumber}
            className={`pagination-btn ${currentPage === pageNumber ? "active" : ""}`}
            onClick={() => handlePageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        );
      } else if (
        pageNumber === currentPage - 2 ||
        pageNumber === currentPage + 2
      ) {
        return (
          <span key={pageNumber} className="pagination-dots">
            ...
          </span>
        );
      }
      return null;
    });
  };

  return (
    <div className="saved-recipes-page">
      <div className="page-header">
        <h1>Tersimpan</h1>
        <p>Resep yang Anda bookmark</p>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Cari resep..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={handleClearSearch}
              aria-label="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {debouncedSearch && !loading && (
          <p className="search-results-count">
            Ditemukan {total} resep untuk "{debouncedSearch}"
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
            <button onClick={() => setDebouncedSearch(searchTerm)} className="retry-btn">
              Coba Lagi
            </button>
          </div>
        ) : menus.length === 0 && !debouncedSearch ? (
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
        ) : menus.length === 0 && debouncedSearch ? (
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
            <p>Tidak ada resep yang sesuai dengan pencarian "{debouncedSearch}"</p>
          </div>
        ) : (
          <>
            <div className="recipe-grid">
              {menus.map((menu) => (
                <RecipeCard key={menu.menu_id} menu={menu} onUnbookmark={handleUnBookmark}/>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={20} />
                </button>
                
                {renderPagination()}
                
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SavedRecipesPage;
