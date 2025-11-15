// LOKASI: src/pages/Dashboard/TagManagementPage.jsx

import React, { useState, useEffect } from "react";
import { tagService } from "../../services/tagService";
import { categoryService } from "../../services/categoryService";
import "./TagManagementPage.scss";

const TagManagementPage = () => {
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [formData, setFormData] = useState({
    tag_id: null,
    tag_name: "",
    category_id: "",
  });

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
      setTags(tagsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, tag = null) => {
    setModalMode(mode);
    if (mode === "edit" && tag) {
      setFormData({
        tag_id: tag.TagID,
        tag_name: tag.TagName,
        category_id: tag.CategoryID,
      });
    } else {
      setFormData({
        tag_id: null,
        tag_name: "",
        category_id: categories[0]?.CategoryID || "",
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
      alert("Nama tag wajib diisi!");
      return;
    }

    try {
      if (modalMode === "create") {
        await tagService.createTag({
          tag_name: formData.tag_name,
          category_id: parseInt(formData.category_id),
        });
      } else {
        await tagService.updateTag(formData.tag_id, {
          tag_name: formData.tag_name,
          category_id: parseInt(formData.category_id),
        });
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      alert("Gagal menyimpan tag");
      console.error(err);
    }
  };

  const handleDelete = async (tag) => {
    if (!window.confirm(`Hapus tag "${tag.TagName}"?`)) return;

    try {
      await tagService.deleteTag(tag.TagID);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus tag");
      console.error(err);
    }
  };

  // Group tags by category
  const tagsByCategory = categories.map((category) => ({
    category,
    tags: tags.filter((tag) => tag.CategoryID === category.CategoryID),
  }));

  return (
    <div className="tag-management-page">
      <div className="page-header">
        <div>
          <h2>Manajemen Tag</h2>
          <p>Kelola tag resep berdasarkan kategori</p>
        </div>
        <button className="btn-create" onClick={() => handleOpenModal("create")}>
          ➕ Tambah Tag Baru
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Memuat tag...</div>
      ) : (
        <div className="tags-container">
          {tagsByCategory.map(({ category, tags: categoryTags }) => (
            <div key={category.CategoryID} className="category-section">
              <h3 className="category-title">
                <span className="category-icon">📁</span>
                {category.CategoryName}
                <span className="category-count">({categoryTags.length})</span>
              </h3>

              {categoryTags.length === 0 ? (
                <div className="empty-category">
                  <p>Belum ada tag di kategori ini</p>
                </div>
              ) : (
                <div className="tags-grid">
                  {categoryTags.map((tag) => (
                    <div key={tag.TagID} className="tag-item">
                      <span className="tag-name">{tag.TagName}</span>
                      <div className="tag-actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleOpenModal("edit", tag)}
                          title="Edit">
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(tag)}
                          title="Hapus">
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
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
                  {categories.map((cat) => (
                    <option key={cat.CategoryID} value={cat.CategoryID}>
                      {cat.CategoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
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

export default TagManagementPage;
