// LOKASI: src/pages/Dashboard/CategoryManagementPage.jsx

import React, { useState, useEffect } from "react";
import { categoryService } from "../../services/categoryService";
import { tagService } from "../../services/tagService";
import { Plus, Edit2, Trash2, Folder } from "lucide-react";
import Toast from "../../components/ui/Toast/Toast";
import "./CategoryManagementPage.scss";

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [formData, setFormData] = useState({
    category_id: null,
    category_name: "",
  });
  const [toast, setToast] = useState(null);

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

      console.log("Categories response:", categoriesRes.data);
      console.log("Tags response:", tagsRes.data);

      setCategories(categoriesRes.data.data || []);
      setTags(tagsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setToast({ type: "error", message: "Gagal memuat data kategori" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, category = null) => {
    setModalMode(mode);
    if (mode === "edit" && category) {
      setFormData({
        category_id: category.category_id || category.CategoryID,
        category_name: category.category_name || category.CategoryName,
      });
    } else {
      setFormData({
        category_id: null,
        category_name: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ category_id: null, category_name: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_name.trim()) {
      setToast({ type: "warning", message: "Nama kategori wajib diisi!" });
      return;
    }

    try {
      if (modalMode === "create") {
        await categoryService.createCategory({
          category_name: formData.category_name,
        });
        setToast({
          type: "success",
          message: "Kategori berhasil ditambahkan!",
        });
      } else {
        await categoryService.updateCategory(formData.category_id, {
          category_name: formData.category_name,
        });
        setToast({ type: "success", message: "Kategori berhasil diperbarui!" });
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      setToast({
        type: "error",
        message: "Gagal menyimpan kategori. Silakan coba lagi.",
      });
      console.error(err);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      const categoryId =
        categoryToDelete.category_id || categoryToDelete.CategoryID;
      await categoryService.deleteCategory(categoryId);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      fetchData();
      setToast({ type: "success", message: "Kategori berhasil dihapus!" });
    } catch (err) {
      setToast({
        type: "error",
        message: "Gagal menghapus kategori. Silakan coba lagi.",
      });
      console.error(err);
    }
  };

  // Get tag count per category
  const getCategoryTagCount = (categoryId) => {
    return tags.filter((tag) => {
      const tagCategoryId = tag.category_id || tag.CategoryID;
      return tagCategoryId === categoryId;
    }).length;
  };

  return (
    <div className="category-management-page">
      <div className="page-header">
        <div>
          <h1>Manajemen Kategori</h1>
          <p>Kelola kategori utama untuk klasifikasi tag resep</p>
          <h3>Semua Kategori ({categories.length})</h3>
        </div>
        <button
          className="btn-create"
          onClick={() => handleOpenModal("create")}>
          <Plus size={20} />
          Tambah Kategori Baru
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Memuat kategori...</div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => {
            const categoryId = category.category_id || category.CategoryID;
            const categoryName =
              category.category_name || category.CategoryName;
            const tagCount = getCategoryTagCount(categoryId);

            return (
              <div key={categoryId} className="category-card">
                <div className="card-header">
                  <div className="card-icon">
                    <Folder size={32} />
                  </div>
                  <div className="card-title">
                    <h3>{categoryName}</h3>
                    <span className="tag-count">{tagCount} tag</span>
                  </div>
                </div>

                <div className="card-tags">
                  {tagCount > 0 ? (
                    tags
                      .filter((tag) => {
                        const tagCategoryId = tag.category_id || tag.CategoryID;
                        return tagCategoryId === categoryId;
                      })
                      .slice(0, 5)
                      .map((tag) => {
                        const tagId = tag.tag_id || tag.TagID;
                        const tagName = tag.tag_name || tag.TagName;
                        return (
                          <span key={tagId} className="mini-tag">
                            {tagName}
                          </span>
                        );
                      })
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
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteClick(category)}>
                    <Trash2 size={16} />
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {modalMode === "create"
                ? "Tambah Kategori Baru"
                : "Edit Kategori"}
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
                  placeholder="Contoh: Bahan Utama, Metode Masak"
                  required
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Hapus Kategori</h3>
            <p>
              Apakah Anda yakin ingin menghapus kategori{" "}
              <strong>
                "
                {categoryToDelete?.category_name ||
                  categoryToDelete?.CategoryName}
                "
              </strong>
              ?
            </p>
            {(() => {
              const categoryId =
                categoryToDelete?.category_id || categoryToDelete?.CategoryID;
              const tagCount = getCategoryTagCount(categoryId);
              if (tagCount > 0) {
                return (
                  <p className="modal-warning">
                    ⚠️ Peringatan: Kategori ini memiliki {tagCount} tag. Semua
                    tag akan ikut terhapus!
                  </p>
                );
              }
              return (
                <p className="modal-warning">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              );
            })()}
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}>
                Batal
              </button>
              <button
                className="btn-confirm-delete"
                onClick={handleDeleteConfirm}>
                Hapus Kategori
              </button>
            </div>
          </div>
        </div>
      )}

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

export default CategoryManagementPage;
