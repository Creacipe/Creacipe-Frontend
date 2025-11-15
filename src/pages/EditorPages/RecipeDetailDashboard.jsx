// LOKASI: src/pages/EditorPages/RecipeDetailDashboard.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { menuService } from "../../services/menuService";
// import { useAuth } from "../../context/AuthContext";
import "./RecipeDetailDashboard.scss";

const safeParseJSON = (data) => {
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [parsed.toString()];
  } catch {
    return [data];
  }
};

const RecipeDetailDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // const { user } = useAuth();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await menuService.getMenuById(id);
        const menuData = response.data.data;

        // Editor/Admin bisa melihat semua status resep
        menuData.parsedIngredients = safeParseJSON(menuData.ingredients);
        menuData.parsedInstructions = safeParseJSON(menuData.instructions);

        setMenu(menuData);
      } catch (err) {
        const errorMessage =
          err.response?.data?.error || "Gagal mengambil detail resep.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuDetail();
  }, [id]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: "PENDING", class: "status-pending" },
      approved: { text: "APPROVED", class: "status-approved" },
      rejected: { text: "REJECTED", class: "status-rejected" },
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="recipe-detail-dashboard-container">
        <div style={{ padding: "2rem" }}>Loading detail resep...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipe-detail-dashboard-container">
        <div style={{ padding: "2rem", color: "red" }}>{error}</div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="recipe-detail-dashboard-container">
        <div style={{ padding: "2rem" }}>Resep tidak ditemukan.</div>
      </div>
    );
  }

  const badge = getStatusBadge(menu.status);

  return (
    <div className="recipe-detail-dashboard-container">
      {/* Tombol "Kembali" */}
      <button onClick={() => navigate(-1)} className="back-button">
        &lt;
      </button>

      {/* Status Badge */}
      <div className="status-badge-container">
        <span className={`status-badge ${badge.class}`}>{badge.text}</span>
      </div>

      {/* Judul Resep */}
      <h2 className="recipe-title">{menu.title}</h2>

      {/* Info Pembuat */}
      <div className="recipe-author">Oleh: {menu.User?.name || "Unknown"}</div>

      {/* Gambar Resep */}
      <div className="recipe-detail-image">
        <img
          src={
            menu.image_url || "https://via.placeholder.com/600x400?text=Resep"
          }
          alt={menu.title}
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/600x400?text=Image+Not+Found";
          }}
        />
      </div>

      {/* Deskripsi */}
      <p className="recipe-detail-description">{menu.description}</p>

      {/* Tags */}
      {menu.tags && menu.tags.length > 0 && (
        <div className="tags-container">
          {menu.tags.map((tag) => (
            <span key={tag.tag_id} className="tag-badge">
              {tag.tag_name}
            </span>
          ))}
        </div>
      )}

      {/* Info Meta - Tanggal Dibuat */}
      <div className="meta-info-section">
        <div className="meta-item">
          <strong>Dibuat:</strong>
          <span>{new Date(menu.created_at).toLocaleDateString("id-ID")}</span>
        </div>
      </div>

      {/* Alasan Penolakan (jika rejected) */}
      {menu.status === "rejected" && menu.rejection_reason && (
        <div className="rejection-info">
          <strong>⚠️ Alasan Penolakan:</strong>
          <p>{menu.rejection_reason}</p>
        </div>
      )}

      {/* Layout 2 Kolom: Bahan & Instruksi */}
      <div className="detail-layout-grid">
        {/* Kolom Kiri: Bahan-bahan */}
        <div className="ingredients-section">
          <h3>Bahan-bahan</h3>
          <ul>
            {menu.parsedIngredients.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Kolom Kanan: Instruksi */}
        <div className="instructions-section">
          <h3>Instruksi</h3>
          <ol>
            {menu.parsedInstructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailDashboard;
