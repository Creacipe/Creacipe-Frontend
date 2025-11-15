// LOKASI: src/pages/Dashboard/CategoryManagementPage.jsx

import React, { useState, useEffect } from "react";
import { categoryService } from "../../services/categoryService";
import { tagService } from "../../services/tagService";
import "./CategoryManagementPage.scss";

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [formData, setFormData] = useState({
    category_id: null,
    category_name: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        categoryService.getAllCategories(),
        tagService.getAllTags(),
      ]);
      setCategories(categoriesRes.data.data || []);
      setTags(tagsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, category = null) => {
    setModalMode(mode);
    if (mode === "edit" && category) {
      setFormData({
        category_id: category.CategoryID,
        category_name: category.CategoryName,
        description: category.Description || "",
      });
    } else {
      setFormData({
        category_id: null,
        category_name: "",
        description: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ category_id: null, category_name: "", description: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_name.trim()) {
      alert("Nama kategori wajib diisi!");
      return;
    }

    try {
      if (modalMode === "create") {
        await categoryService.createCategory({
          category_name: formData.category_name,
          description: formData.description,
        });
      } else {
        await categoryService.updateCategory(formData.category_id, {
          category_name: formData.category_name,
          description: formData.description,
        });
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      alert("Gagal menyimpan kategori");
      console.error(err);
    }
  };

  const handleDelete = async (category) => {
    const tagCount = tags.filter(
      (tag) => tag.CategoryID === category.CategoryID
    ).length;

    let confirmMessage = `Hapus kategori "${category.CategoryName}"?`;
    if (tagCount > 0) {
      confirmMessage += `\n\nPeringatan: Kategori ini memiliki ${tagCount} tag. Semua tag akan ikut terhapus!`;
    }

    if (!window.confirm(confirmMessage)) return;

    try {
      await categoryService.deleteCategory(category.CategoryID);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus kategori");
      console.error(err);
    }
  };

  // Get tag count per category
  const getCategoryTagCount = (categoryId) => {
    return tags.filter((tag) => tag.CategoryID === categoryId).length;
  };

  return (
    <div className="category-management-page">
      <div className="page-header">
        <div>
          <h2>Manajemen Kategori</h2>
          <p>Kelola kategori utama untuk klasifikasi tag resep</p>
        </div>
        <button className="btn-create" onClick={() => handleOpenModal("create")}>
          ➕ Tambah Kategori Baru
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Memuat kategori...</div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => {
            const tagCount = getCategoryTagCount(category.CategoryID);
            return (
              <div key={category.CategoryID} className="category-card">
                <div className="card-header">
                  <div className="card-icon">📁</div>
                  <div className="card-title">
                    <h3>{category.CategoryName}</h3>
                    <span className="tag-count">{tagCount} tag</span>
                  </div>
                </div>

                {category.Description && (
                  <p className="card-description">{category.Description}</p>
                )}

                <div className="card-tags">
                  {tagCount > 0 ? (
                    tags
                      .filter((tag) => tag.CategoryID === category.CategoryID)
                      .slice(0, 5)
                      .map((tag) => (
                        <span key={tag.TagID} className="mini-tag">
                          {tag.TagName}
                        </span>
                      ))
                  ) : (
                    <span className="no-tags">Belum ada tag</span>
                  )}
                  {tagCount > 5 && (
                    <span className="mini-tag more">+{tagCount - 5} lagi</span>
                  )}
                </div>

                <div className="card-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleOpenModal("edit", category)}>
                    ✏️ Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(category)}>
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {modalMode === "create" ? "Tambah Kategori Baru" : "Edit Kategori"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="category_name">Nama Kategori</label>
                <input
                  type="text"
                  id="category_name"
                  value={formData.category_name}
                  onChange={(e) =>
                    setFormData({ ...formData, category_name: e.target.value })
                  }
                  placeholder="Contoh: Jenis Bahan Utama, Metode Memasak"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Deskripsi (opsional)</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Jelaskan tujuan kategori ini..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn-submit">
                  {modalMode === "create" ? "Tambah" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagementPage;
