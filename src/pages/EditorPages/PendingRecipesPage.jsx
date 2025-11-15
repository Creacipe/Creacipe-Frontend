// LOKASI: src/pages/Dashboard/PendingRecipesPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "../../services/dashboardService";
import { Eye, CircleCheck, CircleX } from "lucide-react";
import Toast from "../../components/ui/Toast/Toast";
import "./PendingRecipesPage.scss";

const PendingRecipesPage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchPendingRecipes();
  }, []);

  const fetchPendingRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getPendingRecipes();
      setRecipes(response.data.data || []);
    } catch (err) {
      setError("Gagal memuat antrian moderasi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (recipe) => {
    setSelectedRecipe(recipe);
    setShowApproveModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedRecipe) return;

    try {
      await dashboardService.updateMenuStatus(
        selectedRecipe.menu_id,
        "approved"
      );
      setShowApproveModal(false);
      setSelectedRecipe(null);
      // Remove from list
      setRecipes((prev) =>
        prev.filter((r) => r.menu_id !== selectedRecipe.menu_id)
      );
      setToast({ type: 'success', message: 'Resep berhasil disetujui!' });
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal menyetujui resep. Silakan coba lagi.' });
      console.error(err);
    }
  };

  const handleRejectClick = (recipe) => {
    setSelectedRecipe(recipe);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      alert("Alasan penolakan wajib diisi!");
      return;
    }

    try {
      await dashboardService.updateMenuStatus(
        selectedRecipe.menu_id,
        "rejected",
        rejectionReason
      );
      setShowRejectModal(false);
      setSelectedRecipe(null);
      setRejectionReason("");
      // Remove from list
      setRecipes((prev) =>
        prev.filter((r) => r.menu_id !== selectedRecipe.menu_id)
      );
      setToast({ type: 'success', message: 'Resep berhasil ditolak!' });
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal menolak resep. Silakan coba lagi.' });
      console.error(err);
    }
  };

  return (
    <div className="pending-recipes-page">
      <div className="page-header">
        <h2>Antrian Moderasi</h2>
        <p>Resep yang menunggu persetujuan Anda</p>
      </div>

      {loading ? (
        <div className="loading-state">Memuat antrian...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>Tidak Ada Antrian</h3>
          <p>Semua resep sudah disetujui!</p>
        </div>
      ) : (
        <>
          <div className="queue-info">
            <span className="queue-count">{recipes.length}</span>
            <span>resep menunggu persetujuan</span>
          </div>

          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <div key={recipe.menu_id} className="recipe-card">
                <div className="card-image">
                  <img src={recipe.image_url} alt={recipe.title} />
                  <div className="card-badge">PENDING</div>
                </div>

                <div className="card-content">
                  <h3>{recipe.title}</h3>
                  <p className="description">{recipe.description}</p>

                  <div className="card-meta">
                    <div className="meta-item">
                      <span className="icon">👤</span>
                      <span>{recipe.User?.name || "Unknown"}</span>
                    </div>
                    <div className="meta-item">
                      <span className="icon">📅</span>
                      <span>
                        {new Date(recipe.created_at).toLocaleDateString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                  </div>

                  {recipe.Tags && recipe.Tags.length > 0 && (
                    <div className="card-tags">
                      {recipe.Tags.map((tag) => (
                        <span key={tag.TagID} className="tag">
                          {tag.TagName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button
                    className="btn-view"
                    onClick={() =>
                      navigate(`/dashboard/recipes/${recipe.menu_id}`)
                    }>
                    <Eye className="icon" />
                    Lihat Detail
                  </button>
                  <div className="action-group">
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(recipe)}>
                      <CircleCheck className="icon" /> Setujui
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleRejectClick(recipe)}>
                      <CircleX className="icon" /> Tolak
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowApproveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Setujui Resep</h3>
            <p>
              Apakah Anda yakin ingin menyetujui resep{" "}
              <strong>"{selectedRecipe?.title}"</strong>?
            </p>
            <p className="modal-success">
              Resep yang disetujui akan dipublikasikan dan dapat dilihat oleh
              semua pengguna.
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowApproveModal(false)}>
                Batal
              </button>
              <button
                className="btn-confirm-approve"
                onClick={handleApproveConfirm}>
                Setujui Resep
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Tolak Resep</h3>
            <p>
              Resep: <strong>{selectedRecipe?.title}</strong>
            </p>
            <p className="modal-note">
              Alasan penolakan akan dikirimkan ke pembuat resep sebagai
              feedback.
            </p>
            <textarea
              placeholder="Tuliskan alasan penolakan (misal: gambar tidak sesuai, konten duplikat, dll)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows="5"
            />
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowRejectModal(false)}>
                Batal
              </button>
              <button className="btn-confirm" onClick={handleRejectConfirm}>
                Tolak Resep
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

export default PendingRecipesPage;
