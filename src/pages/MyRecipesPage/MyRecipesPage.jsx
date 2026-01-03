import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { menuService } from "../../services/menuService";
import RecipeCard from "../../components/recipe/RecipeCard/RecipeCard";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import "./MyRecipesPage.scss";

const MyRecipesPage = () => {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, menuId: null, menuTitle: "" });
  const [searchQuery, setSearchQuery] = useState("");

  // Filter resep berdasarkan pencarian
  const filteredMenus = useMemo(() => {
    if (!searchQuery.trim()) return menus;
    const query = searchQuery.toLowerCase();
    return menus.filter((menu) =>
      menu.title?.toLowerCase().includes(query) ||
      menu.description?.toLowerCase().includes(query)
    );
  }, [menus, searchQuery]);

  const fetchMenus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await menuService.getMyMenus();
      setMenus(response.data.data || []);
    } catch (err) {
      setError("Gagal memuat resep. Silakan coba lagi.");
      console.error("Error fetching menus:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk edit resep
  const handleEdit = (menuId) => {
    // Navigate ke halaman edit dengan menu ID
    navigate(`/menu/edit/${menuId}`);
  };

  // Handler untuk delete resep - membuka modal
  const handleDelete = (menuId, menuTitle) => {
    setDeleteModal({
      isOpen: true,
      menuId: menuId,
      menuTitle: menuTitle,
    });
  };

    // Konfirmasi delete dari modal
  const confirmDelete = async () => {
    const { menuId } = deleteModal;

    try {
      await menuService.deleteMenu(menuId);
      // Hapus dari list lokal setelah berhasil delete
      setMenus((prevMenus) =>
        prevMenus.filter((menu) => menu.menu_id !== menuId)
      );
      setDeleteModal({ isOpen: false, menuId: null, menuTitle: "" });
    } catch (err) {
      console.error("Error deleting menu:", err);
      alert("Gagal menghapus resep. Silakan coba lagi.");
      setDeleteModal({ isOpen: false, menuId: null, menuTitle: "" });
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, menuId: null, menuTitle: "" });
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  return (
    <div className="my-recipes-page">
      <div className="page-header">
        <h1>Resepmu</h1>
        <p>Resep yang telah Anda buat</p>
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
              <path d="M3 3h18v18H3zM9 9h6v6H9z"></path>
            </svg>
            <h3>Belum ada resep</h3>
            <p>Anda belum membuat resep. Mulai bagikan resep Anda!</p>
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
              <RecipeCard key={menu.menu_id} menu={menu} showStatus={true} showActions={true} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        message={`Apakah Anda yakin ingin menghapus resep "${deleteModal.menuTitle}"?`}
        confirmText="OK"
        cancelText="Cancel"
      />
    </div>
  );
};

export default MyRecipesPage;
