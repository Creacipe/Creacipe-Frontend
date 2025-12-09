// LOKASI: src/pages/AdminPages/UserManagementPage.jsx

import React, { useState, useEffect } from "react";
import { dashboardService } from "../../services/dashboardService";
import {
  UserPlus,
  Edit,
  Key,
  Lock,
  Unlock,
  Trash2,
  Search,
} from "lucide-react";
import Toast from "../../components/ui/Toast/Toast";
import "./UserManagementPage.scss";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [relatedData, setRelatedData] = useState(null); // Data terkait user yang akan dihapus
  const [userToToggle, setUserToToggle] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // 'create', 'edit', or 'role'
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        dashboardService.getAllUsers(),
        dashboardService.getAllRoles(),
      ]);
      setUsers(usersRes.data.data || []);
      setRoles(rolesRes.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);

    if (mode === "edit" && user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role_id: user.role_id,
      });
    } else if (mode === "role" && user) {
      setFormData({ ...formData, role_id: user.role_id });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role_id: roles.find((r) => r.role_name === "user")?.role_id || "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({ name: "", email: "", password: "", role_id: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === "create") {
        if (!formData.password) {
          setToast({
            type: "error",
            message: "Password wajib diisi untuk user baru!",
          });
          return;
        }
        // Convert role_id to number before sending
        const createData = {
          ...formData,
          role_id: parseInt(formData.role_id, 10),
        };
        await dashboardService.createUser(createData);
        setToast({ type: "success", message: "User berhasil dibuat!" });
      } else if (modalMode === "edit") {
        const updateData = {
          name: formData.name,
          email: formData.email,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await dashboardService.updateUser(selectedUser.user_id, updateData);
        setToast({ type: "success", message: "User berhasil diperbarui!" });
      } else if (modalMode === "role") {
        // Convert role_id to number before sending
        await dashboardService.updateUserRole(
          selectedUser.user_id,
          parseInt(formData.role_id, 10)
        );
        setToast({ type: "success", message: "Role user berhasil diubah!" });
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      setToast({
        type: "error",
        message: "Gagal menyimpan user. Silakan coba lagi.",
      });
      console.error(err);
    }
  };

  const handleToggleStatus = async (user) => {
    setUserToToggle(user);
    setShowStatusModal(true);
  };

  const handleToggleStatusConfirm = async () => {
    if (!userToToggle) return;

    // Normalize status - handle both snake_case and PascalCase
    const currentStatus =
      userToToggle.status_user || userToToggle.StatusUser || "active";
    const isActive = currentStatus === "active";

    try {
      if (isActive) {
        await dashboardService.deactivateUser(userToToggle.user_id);
        setToast({ type: "success", message: "User berhasil dinonaktifkan!" });
      } else {
        await dashboardService.activateUser(userToToggle.user_id);
        setToast({ type: "success", message: "User berhasil diaktifkan!" });
      }
      setShowStatusModal(false);
      setUserToToggle(null);
      fetchData();
    } catch (err) {
      setToast({
        type: "error",
        message: "Gagal mengubah status user. Silakan coba lagi.",
      });
      console.error(err);
    }
  };

  const handleDeleteClick = async (user) => {
    setUserToDelete(user);
    setRelatedData(null); // Reset related data
    setShowDeleteModal(true);

    // Fetch data terkait user
    try {
      const response = await dashboardService.getUserRelatedData(user.user_id);
      setRelatedData(response.data.data);
    } catch (err) {
      console.error("Error fetching related data:", err);
      // Jika gagal, tetap tampilkan modal tanpa info data terkait
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await dashboardService.deleteUser(userToDelete.user_id);
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchData();
      setToast({ type: "success", message: "User berhasil dihapus!" });
    } catch (err) {
      // Tutup modal terlebih dahulu
      setShowDeleteModal(false);
      setUserToDelete(null);

      // Ambil pesan error dari berbagai kemungkinan struktur response
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Gagal menghapus user. User mungkin memiliki data terkait (resep, komentar, dll).";

      setToast({
        type: "error",
        message: errorMessage,
      });
      console.error("Delete user error:", err);
    }
  };

  const getRoleBadge = (roleName) => {
    const badges = {
      admin: { text: "Admin", class: "role-admin" },
      editor: { text: "Editor", class: "role-editor" },
      user: { text: "User", class: "role-user" },
      member: { text: "Member", class: "role-user" },
    };
    return badges[roleName] || { text: roleName, class: "role-default" };
  };

  // Normalize status - handle both snake_case and PascalCase
  const getUserStatus = (user) => {
    const status = user.status_user || user.StatusUser || "active";
    return status === "active";
  };

  // Filter berdasarkan search query
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.Role?.role_name?.toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="user-management-page">
      <div className="page-header">
        <div>
          <h2>Manajemen Pengguna</h2>
          <p>Kelola akun pengguna, role, dan status</p>
        </div>
        <button
          className="btn-create"
          onClick={() => handleOpenModal("create")}>
          <UserPlus size={20} />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Cari nama, email, atau role..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset ke halaman pertama saat search
            }}
          />
        </div>
        <div className="search-info">
          Menampilkan {currentUsers.length} dari {filteredUsers.length} user
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Memuat data pengguna...</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Terdaftar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => {
                const roleBadge = getRoleBadge(user.Role?.role_name);
                const isActive = getUserStatus(user);
                const rowNumber = indexOfFirstItem + index + 1;

                return (
                  <tr key={user.user_id}>
                    <td>{rowNumber}</td>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${roleBadge.class}`}>
                        {roleBadge.text}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${isActive ? "active" : "inactive"
                          }`}>
                        {isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td>
                      {new Date(user.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td>
                      {(() => {
                        // Cek apakah user ini adalah admin
                        const isAdmin = user.Role?.role_name === "admin";

                        return (
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-edit"
                              onClick={() => handleOpenModal("edit", user)}
                              title={isAdmin ? "Tidak dapat mengedit admin" : "Edit"}
                              disabled={isAdmin}>
                              <Edit size={18} />
                            </button>
                            <button
                              className="btn-action btn-role"
                              onClick={() => handleOpenModal("role", user)}
                              title={isAdmin ? "Tidak dapat mengubah role admin" : "Ubah Role"}
                              disabled={isAdmin}>
                              <Key size={18} />
                            </button>
                            <button
                              className={`btn-action ${isActive ? "btn-deactivate" : "btn-activate"
                                }`}
                              onClick={() => handleToggleStatus(user)}
                              title={isAdmin ? "Tidak dapat mengubah status admin" : (isActive ? "Nonaktifkan" : "Aktifkan")}
                              disabled={isAdmin}>
                              {isActive ? <Lock size={18} /> : <Unlock size={18} />}
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteClick(user)}
                              title={isAdmin ? "Tidak dapat menghapus admin" : "Hapus"}
                              disabled={isAdmin}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredUsers.length > 0 && (
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
                className={`pagination-btn ${currentPage === pageNumber ? "active" : ""
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {modalMode === "create" && "Tambah User Baru"}
              {modalMode === "edit" && "Edit User"}
              {modalMode === "role" && "Ubah Role User"}
            </h3>

            <form onSubmit={handleSubmit}>
              {modalMode === "role" ? (
                <div className="form-group">
                  <label htmlFor="role_id">Role</label>
                  <select
                    id="role_id"
                    value={formData.role_id}
                    onChange={(e) =>
                      setFormData({ ...formData, role_id: e.target.value })
                    }
                    required>
                    {roles.map((role) => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.role_name.charAt(0).toUpperCase() +
                          role.role_name.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="name">Nama Lengkap</label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="user@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">
                      Password{" "}
                      {modalMode === "edit" && "(kosongkan jika tidak diubah)"}
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Minimal 6 karakter"
                      required={modalMode === "create"}
                    />
                  </div>

                  {/* Role Selector - Hanya muncul saat Create User */}
                  {modalMode === "create" && (
                    <div className="form-group">
                      <label htmlFor="role_id">Role</label>
                      <select
                        id="role_id"
                        value={formData.role_id}
                        onChange={(e) =>
                          setFormData({ ...formData, role_id: e.target.value })
                        }
                        required>
                        {roles.map((role) => (
                          <option key={role.role_id} value={role.role_id}>
                            {role.role_name.charAt(0).toUpperCase() +
                              role.role_name.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                </>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn-submit">
                  {modalMode === "create" ? "Tambah User" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Hapus User</h3>
            <p>
              Apakah Anda yakin ingin menghapus user{" "}
              <strong>"{userToDelete?.name}"</strong>?
            </p>

            {/* Tampilkan peringatan data terkait */}
            {relatedData && relatedData.has_related_data && (
              <div className="related-data-warning">
                <p><strong>⚠️ User ini memiliki data berikut yang akan ikut terhapus:</strong></p>
                <ul>
                  {relatedData.menus_count > 0 && (
                    <li>🍳 {relatedData.menus_count} resep</li>
                  )}
                  {relatedData.comments_count > 0 && (
                    <li>💬 {relatedData.comments_count} komentar</li>
                  )}
                  {relatedData.votes_count > 0 && (
                    <li>👍 {relatedData.votes_count} like/dislike</li>
                  )}
                  {relatedData.bookmarks_count > 0 && (
                    <li>🔖 {relatedData.bookmarks_count} bookmark</li>
                  )}
                </ul>
              </div>
            )}

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
                Hapus User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Confirmation Modal */}
      {showStatusModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Ubah Status User</h3>
            <p>
              Apakah Anda yakin ingin{" "}
              <strong>
                {getUserStatus(userToToggle) ? "menonaktifkan" : "mengaktifkan"}
              </strong>{" "}
              user <strong>"{userToToggle?.name}"</strong>?
            </p>
            {getUserStatus(userToToggle) && (
              <p className="modal-warning">
                User yang dinonaktifkan tidak dapat login ke sistem.
              </p>
            )}
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowStatusModal(false)}>
                Batal
              </button>
              <button
                className={
                  getUserStatus(userToToggle)
                    ? "btn-confirm-delete"
                    : "btn-submit"
                }
                onClick={handleToggleStatusConfirm}>
                {getUserStatus(userToToggle) ? "Nonaktifkan" : "Aktifkan"}
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

export default UserManagementPage;
