// LOKASI: src/pages/Dashboard/TagManagementPage.jsx

import React, { useState, useEffect } from "react";
import { tagService } from "../../services/tagService";
import { categoryService } from "../../services/categoryService";
import { Plus, Edit2, Trash2, Tag, Folder } from "lucide-react";
import Toast from "../../components/ui/Toast/Toast";
import "./TagManagementPage.scss";

const TagManagementPage = () => {
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [formData, setFormData] = useState({
    tag_id: null,
    tag_name: "",
    category_id: "",
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tagsRes, categoriesRes] = await Promise.all([
        tagService.getAllTags(),
        categoryService.getAllCategories(),
      ]);

      console.log("Tags response:", tagsRes.data);
      console.log("Categories response:", categoriesRes.data);

      setTags(tagsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setToast({
        type: "error",
        message: "Gagal memuat data tag dan kategori",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, tag = null) => {
    setModalMode(mode);
    if (mode === "edit" && tag) {
      setFormData({
        tag_id: tag.tag_id || tag.TagID,
        tag_name: tag.tag_name || tag.TagName,
        category_id: tag.category_id || tag.CategoryID,
      });
    } else {
      setFormData({
        tag_id: null,
        tag_name: "",
        category_id:
          categories[0]?.category_id || categories[0]?.CategoryID || "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ tag_id: null, tag_name: "", category_id: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tag_name.trim()) {
      setToast({ type: "warning", message: "Nama tag wajib diisi!" });
      return;
    }

    try {
      if (modalMode === "create") {
        await tagService.createTag({
          tag_name: formData.tag_name,
          category_id: parseInt(formData.category_id),
        });
        setToast({ type: "success", message: "Tag berhasil ditambahkan!" });
      } else {
        await tagService.updateTag(formData.tag_id, {
          tag_name: formData.tag_name,
          category_id: parseInt(formData.category_id),
        });
        setToast({ type: "success", message: "Tag berhasil diperbarui!" });
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      setToast({
        type: "error",
        message: "Gagal menyimpan tag. Silakan coba lagi.",
      });
      console.error(err);
    }
  };

  const handleDeleteClick = (tag) => {
    setTagToDelete(tag);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tagToDelete) return;

    try {
      const tagId = tagToDelete.tag_id || tagToDelete.TagID;
      await tagService.deleteTag(tagId);
      setShowDeleteModal(false);
      setTagToDelete(null);
      fetchData();
      setToast({ type: "success", message: "Tag berhasil dihapus!" });
    } catch (err) {
      setToast({
        type: "error",
        message: "Gagal menghapus tag. Silakan coba lagi.",
      });
      console.error(err);
    }
  };

  // Group tags by category
  const tagsByCategory = categories.map((category) => ({
    category,
    // Support both snake_case and PascalCase from backend
    categoryId: category.category_id || category.CategoryID,
    categoryName: category.category_name || category.CategoryName,
    tags: tags.filter((tag) => {
      const tagCategoryId = tag.category_id || tag.CategoryID;
      const categoryId = category.category_id || category.CategoryID;
      return tagCategoryId === categoryId;
    }),
  }));

  return (
    <div className="tag-management-page">
      <div className="page-header">
        <div>
          <h1>Manajemen Tag</h1>
          <p>Kelola tag resep berdasarkan kategori</p>
          <h3>Semua Tag ({tags.length})</h3>
        </div>
        <button
          className="btn-create"
          onClick={() => handleOpenModal("create")}>
          <Plus size={20} />
          Tambah Tag Baru
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Memuat tag...</div>
      ) : tagsByCategory.length === 0 ? (
        <div className="empty-state">
          <Tag size={48} />
          <h3>Belum Ada Kategori</h3>
          <p>Silakan buat kategori terlebih dahulu untuk menambahkan tag</p>
        </div>
      ) : (
        <div className="tags-container">
          {tagsByCategory.map(
            ({ categoryId, categoryName, tags: categoryTags }) => (
              <div key={categoryId} className="category-section">
                <h3 className="category-title">
                  <Folder className="category-icon" />
                  {categoryName}
                  <span className="category-count">
                    ({categoryTags.length})
                  </span>
                </h3>

                {categoryTags.length === 0 ? (
                  <div className="empty-category">
                    <p>Belum ada tag di kategori ini</p>
                  </div>
                ) : (
                  <div className="tags-grid">
                    {categoryTags.map((tag) => {
                      const tagId = tag.tag_id || tag.TagID;
                      const tagName = tag.tag_name || tag.TagName;
                      return (
                        <div key={tagId} className="tag-item">
                          <span className="tag-name">{tagName}</span>
                          <div className="tag-actions">
                            <button
                              className="btn-edit"
                              onClick={() => handleOpenModal("edit", tag)}
                              title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDeleteClick(tag)}
                              title="Hapus">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{modalMode === "create" ? "Tambah Tag Baru" : "Edit Tag"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="tag_name">Nama Tag</label>
                <input
                  type="text"
                  id="tag_name"
                  value={formData.tag_name}
                  onChange={(e) =>
                    setFormData({ ...formData, tag_name: e.target.value })
                  }
                  placeholder="Contoh: Ayam, Pedas, Goreng"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category_id">Kategori</label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  required>
                  {categories.map((cat) => {
                    const catId = cat.category_id || cat.CategoryID;
                    const catName = cat.category_name || cat.CategoryName;
                    return (
                      <option key={catId} value={catId}>
                        {catName}
                      </option>
                    );
                  })}
                </select>
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
            <h3>Hapus Tag</h3>
            <p>
              Apakah Anda yakin ingin menghapus tag{" "}
              <strong>"{tagToDelete?.tag_name || tagToDelete?.TagName}"</strong>
              ?
            </p>
            <p className="modal-warning">
              Tindakan ini tidak dapat dibatalkan. Tag akan dihapus dari semua
              resep.
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
                Hapus Tag
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

export default TagManagementPage;
