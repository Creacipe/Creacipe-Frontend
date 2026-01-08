// LOKASI: src/pages/SearchResultsPage/SearchResultsPage.jsx

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { menuService } from '../../services/menuService';
import RecipeCard from '../../components/recipe/RecipeCard/RecipeCard';
import { Search, X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import './SearchResultsPage.scss';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Ambil query dari URL (misal: ?search=nasi)
  const query = searchParams.get('search') || '';
  
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearchTerm, setLocalSearchTerm] = useState(query);
  const [debouncedSearch, setDebouncedSearch] = useState(query);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 12;

  // Update local input jika URL berubah
  useEffect(() => {
    setLocalSearchTerm(query);
    setDebouncedSearch(query);
    setCurrentPage(1);
  }, [query]);

  // Debounce search input (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== query) {
        // Update URL when debounced search changes
        if (localSearchTerm.trim()) {
          navigate(`/search?search=${encodeURIComponent(localSearchTerm)}`, { replace: true });
        }
      }
      setDebouncedSearch(localSearchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchTerm, query, navigate]);

  // Fetch results when search or page changes
  useEffect(() => {
    const fetchMenus = async () => {
      if (!debouncedSearch) {
        setMenus([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await menuService.getAllMenus(currentPage, limit, debouncedSearch);
        setMenus(response.data.data || []);
        setTotalPages(response.data.meta?.total_pages || 1);
        setTotal(response.data.meta?.total || 0);
      } catch (err) {
        console.error("Gagal mencari resep:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, [debouncedSearch, currentPage]);

  // Handle clear search
  const handleClearSearch = () => {
    setLocalSearchTerm("");
  };

  // Handle search submit (Enter key)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearchTerm.trim()) {
      navigate(`/search?search=${encodeURIComponent(localSearchTerm)}`);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render pagination with dots (same as AllRecipesPage)
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
    <div className="search-results-page">
      <div className="page-header">
        <Link to="/" className="back-btn">
          <ChevronLeft size={20} />
        </Link>
        <h1>Hasil Pencarian</h1>
        {debouncedSearch && !loading && (
          <p className="search-info">
            Ditemukan <strong>{total}</strong> resep untuk "<strong>{debouncedSearch}</strong>"
          </p>
        )}
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Cari resep lain..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="search-input"
          />
          {localSearchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={handleClearSearch}
              aria-label="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}
        </form>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Sedang mencari resep lezat...</p>
          </div>
        ) : menus.length === 0 ? (
          <div className="empty-state">
            <div className="illustration">🔍</div>
            <h3>Yah, resep tidak ditemukan</h3>
            <p>Coba gunakan kata kunci lain seperti "Ayam", "Sapi", atau "Goreng".</p>
          </div>
        ) : (
          <>
            <div className="recipe-grid">
              {menus.map((menu) => (
                <RecipeCard key={menu.menu_id} menu={menu} sourceFrom="search" />
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

export default SearchResultsPage;