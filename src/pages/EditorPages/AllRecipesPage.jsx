// LOKASI: src/pages/EditorPages/AllRecipesPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { dashboardService } from "../../services/dashboardService";
import "./AllRecipesPage.scss";
import {
  Eye, Trash,
} from "lucide-react";

const AllRecipesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.get("status") || ""
  );
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
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  const handleDelete = async (recipe) => {
    if (
      !window.confirm(
        `Hapus resep "${recipe.title}"? Tindakan ini tidak dapat dibatalkan.`
      )
    )
      return;

    try {
      await dashboardService.deleteMenu(recipe.menu_id);
      fetchRecipes();
    } catch (err) {
      alert("Gagal menghapus resep");
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: "Pending", class: "status-pending" },
      approved: { text: "Approved", class: "status-approved" },
      rejected: { text: "Rejected", class: "status-rejected" },
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="all-recipes-page">
      <div className="page-header">
        <h2>Semua Resep</h2>
        <p>Kelola dan moderasi semua resep dari pengguna</p>
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
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <p>Tidak ada resep ditemukan</p>
        </div>
      ) : (
        <div className="recipes-table-container">
          <table className="recipes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Gambar</th>
                <th>Judul</th>
                <th>Pembuat</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => {
                const badge = getStatusBadge(recipe.status);
                return (
                  <tr key={recipe.menu_id}>
                    <td>{recipe.menu_id}</td>
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
                      {new Date(recipe.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          onClick={() => navigate(`/menu/${recipe.menu_id}`)}
                          title="Lihat Detail">
                          <Eye className="Icon"/>
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(recipe)}
                          title="Hapus">
                          <Trash className="Icon"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllRecipesPage;
