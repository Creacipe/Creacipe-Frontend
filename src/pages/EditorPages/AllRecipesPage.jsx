// LOKASI: src/pages/EditorPages/AllRecipesPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { dashboardService } from "../../services/dashboardService";
import "./AllRecipesPage.scss";
import { Eye, Trash, Search } from "lucide-react";
import Toast from "../../components/ui/Toast/Toast";

const AllRecipesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.get("status") || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const itemsPerPage = 10;

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchRecipes();
  }, [selectedStatus]);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getAllRecipesForModeration(
        selectedStatus
      );
      const fetchedRecipes = response.data.data || [];
      setRecipes(fetchedRecipes);

      // Ambil semua resep untuk hitung statistik
      const allResponse = await dashboardService.getAllRecipesForModeration("");
      const allRecipes = allResponse.data.data || [];
      const pending = allRecipes.filter((r) => r.status === "pending").length;
      const approved = allRecipes.filter((r) => r.status === "approved").length;
      const rejected = allRecipes.filter((r) => r.status === "rejected").length;

      setStats({
        total: allRecipes.length,
        pending,
        approved,
        rejected,
      });
    } catch (err) {
      setError("Gagal memuat data resep");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset ke halaman pertama
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  const handleDeleteClick = (recipe) => {
    setRecipeToDelete(recipe);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recipeToDelete) return;

    try {
      await dashboardService.deleteMenu(recipeToDelete.menu_id);
      setShowDeleteModal(false);
      setRecipeToDelete(null);
      fetchRecipes();
      setToast({ type: "success", message: "Resep berhasil dihapus!" });
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal menghapus resep. Silakan coba lagi.' });
      console.error(err);
    }
  };

  const handleViewDetail = (recipeId) => {
    // Navigasi ke detail resep dengan role editor/admin bisa lihat semua status
    navigate(`/dashboard/recipes/${recipeId}`);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: "PENDING", class: "status-pending" },
      approved: { text: "APPROVED", class: "status-approved" },
      rejected: { text: "REJECTED", class: "status-rejected" },
    };
    return badges[status] || badges.pending;
  };

  // Filter berdasarkan search query
  const filteredRecipes = recipes.filter((recipe) => {
    const query = searchQuery.toLowerCase();
    return (
      recipe.title?.toLowerCase().includes(query) ||
      recipe.description?.toLowerCase().includes(query) ||
      recipe.User?.name?.toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecipes = filteredRecipes.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="all-recipes-page">
      <div className="page-header">
        <h2>Semua Resep</h2>
        <p>Kelola dan moderasi semua resep dari pengguna</p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Cari resep..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset ke halaman pertama saat search
            }}
          />
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <button
          className={`filter-btn ${selectedStatus === "" ? "active" : ""}`}
          onClick={() => handleStatusFilter("")}>
          Semua ({stats.total})
        </button>
        <button
          className={`filter-btn pending ${
            selectedStatus === "pending" ? "active" : ""
          }`}
          onClick={() => handleStatusFilter("pending")}>
          Pending ({stats.pending})
        </button>
        <button
          className={`filter-btn approved ${
            selectedStatus === "approved" ? "active" : ""
          }`}
          onClick={() => handleStatusFilter("approved")}>
          Approved ({stats.approved})
        </button>
        <button
          className={`filter-btn rejected ${
            selectedStatus === "rejected" ? "active" : ""
          }`}
          onClick={() => handleStatusFilter("rejected")}>
          Rejected ({stats.rejected})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">Memuat resep...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : filteredRecipes.length === 0 ? (
        <div className="empty-state">
          <p>Tidak ada resep ditemukan</p>
        </div>
      ) : (
        <>
          <div className="recipes-table-container">
            <table className="recipes-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Gambar</th>
                  <th>Judul</th>
                  <th>Pembuat</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentRecipes.map((recipe, index) => {
                  const badge = getStatusBadge(recipe.status);
                  const rowNumber = indexOfFirstItem + index + 1;

                  return (
                    <tr key={recipe.menu_id}>
                      <td>{rowNumber}</td>
                      <td>
                        <img
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="recipe-thumbnail"
                        />
                      </td>
                      <td>
                        <strong>{recipe.title}</strong>
                        <br />
                        <small>{recipe.description?.substring(0, 60)}...</small>
                      </td>
                      <td>
                        {recipe.User?.Name || recipe.User?.name || "Unknown"}
                      </td>
                      <td>
                        <span className={`status-badge ${badge.class}`}>
                          {badge.text}
                        </span>
                        {recipe.status === "rejected" &&
                          recipe.rejection_reason && (
                            <div className="rejection-reason">
                              <small>💬 {recipe.rejection_reason}</small>
                            </div>
                          )}
                      </td>
                      <td>
                        {new Date(recipe.created_at).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-view"
                            onClick={() => handleViewDetail(recipe.menu_id)}
                            title="Lihat Detail">
                            <Eye className="icon" />
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteClick(recipe)}
                            title="Hapus">
                            <Trash className="icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}>
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    className={`pagination-btn ${
                      currentPage === pageNumber ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(pageNumber)}>
                    {pageNumber}
                  </button>
                );
              })}

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Hapus Resep</h3>
            <p>
              Apakah Anda yakin ingin menghapus resep{" "}
              <strong>"{recipeToDelete?.title}"</strong>?
            </p>
            <p className="modal-warning">
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}>
                Batal
              </button>
              <button
                className="btn-confirm-delete"
                onClick={handleDeleteConfirm}>
                Hapus Resep
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AllRecipesPage;
