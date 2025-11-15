// LOKASI: src/pages/Dashboard/UserManagementPage.jsx

import React, { useState, useEffect } from "react";
import { dashboardService } from "../../services/dashboardService";
import "./UserManagementPage.scss";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create', 'edit', or 'role'
  const [selectedUser, setSelectedUser] = useState(null);
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
          alert("Password wajib diisi untuk user baru!");
          return;
        }
        await dashboardService.createUser(formData);
      } else if (modalMode === "edit") {
        const updateData = {
          name: formData.name,
          email: formData.email,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await dashboardService.updateUser(selectedUser.user_id, updateData);
      } else if (modalMode === "role") {
        await dashboardService.updateUserRole(selectedUser.user_id, formData.role_id);
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      alert("Gagal menyimpan user");
      console.error(err);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      if (user.is_active) {
        await dashboardService.deactivateUser(user.user_id);
      } else {
        await dashboardService.activateUser(user.user_id);
      }
      fetchData();
    } catch (err) {
      alert("Gagal mengubah status user");
      console.error(err);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Hapus user "${user.name}"? Tindakan ini tidak dapat dibatalkan!`)) {
      return;
    }

    try {
      await dashboardService.deleteUser(user.user_id);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus user");
      console.error(err);
    }
  };

  const getRoleBadge = (roleName) => {
    const badges = {
      admin: { text: "Admin", class: "role-admin" },
      editor: { text: "Editor", class: "role-editor" },
      user: { text: "User", class: "role-user" },
    };
    return badges[roleName] || { text: roleName, class: "role-default" };
  };

  return (
    <div className="user-management-page">
      <div className="page-header">
        <div>
          <h2>Manajemen Pengguna</h2>
          <p>Kelola akun pengguna, role, dan status</p>
        </div>
        <button className="btn-create" onClick={() => handleOpenModal("create")}>
          ➕ Tambah User Baru
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Memuat data pengguna...</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Terdaftar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const roleBadge = getRoleBadge(user.Role?.role_name);
                return (
                  <tr key={user.user_id}>
                    <td>{user.user_id}</td>
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
                      <span className={`status-badge ${user.is_active ? "active" : "inactive"}`}>
                        {user.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString("id-ID")}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleOpenModal("edit", user)}
                          title="Edit">
                          ✏️
                        </button>
                        <button
                          className="btn-action btn-role"
                          onClick={() => handleOpenModal("role", user)}
                          title="Ubah Role">
                          🔑
                        </button>
                        <button
                          className={`btn-action ${user.is_active ? "btn-deactivate" : "btn-activate"}`}
                          onClick={() => handleToggleStatus(user)}
                          title={user.is_active ? "Nonaktifkan" : "Aktifkan"}>
                          {user.is_active ? "🔒" : "🔓"}
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(user)}
                          title="Hapus">
                          🗑️
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
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                    required>
                    {roles.map((role) => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1)}
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
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="user@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">
                      Password {modalMode === "edit" && "(kosongkan jika tidak diubah)"}
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimal 6 karakter"
                      required={modalMode === "create"}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="role_id">Role</label>
                    <select
                      id="role_id"
                      value={formData.role_id}
                      onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                      required>
                      {roles.map((role) => (
                        <option key={role.role_id} value={role.role_id}>
                          {role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
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
    </div>
  );
};

export default UserManagementPage;
