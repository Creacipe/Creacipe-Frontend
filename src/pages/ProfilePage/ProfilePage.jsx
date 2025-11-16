// LOKASI: src/pages/ProfilePage/ProfilePage.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { User, Mail, Calendar, Camera, Lock, Save, X } from "lucide-react";
import Toast from "../../components/ui/Toast/Toast";
import "./ProfilePage.scss";

const ProfilePage = () => {
  const { user: authUser, setUser: setAuthUser } = useAuth();

  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    joinDate: "",
    bio: "",
    avatar: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState({ ...user });
  const [avatarFile, setAvatarFile] = useState(null); // File object untuk upload
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Load user data from auth context
  useEffect(() => {
    if (authUser) {
      const userData = {
        name: authUser.name || "",
        email: authUser.email || "",
        role: authUser.Role?.role_name || "User",
        joinDate: authUser.created_at
          ? new Date(authUser.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "",
        bio: authUser.Profile?.bio || "",
        avatar: authUser.Profile?.profile_picture_url
          ? `http://localhost:8080${authUser.Profile.profile_picture_url}`
          : null,
      };
      setUser(userData);
      setEditForm(userData);
    }
  }, [authUser]);

  // Handle Edit Form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSaveProfile = async () => {
    const newErrors = {};

    if (!editForm.name.trim()) {
      newErrors.name = "Nama tidak boleh kosong";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setToast(null);
    setErrors({});

    try {
      // Buat FormData untuk support file upload
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("email", editForm.email || "");
      formData.append("bio", editForm.bio || "");

      // Debug: cek data yang akan dikirim
      console.log("Data yang akan dikirim:");
      console.log("- Name:", editForm.name);
      console.log("- Email:", editForm.email);
      console.log("- Bio:", editForm.bio);

      // Tambahkan file gambar jika ada
      if (avatarFile) {
        formData.append("image_file", avatarFile);
        console.log("- Image file:", avatarFile.name);
      }

      // Send to API dengan FormData
      await userService.updateMyProfile(formData);

      // Reload user profile dari backend untuk mendapatkan data terbaru
      const response = await userService.getMyProfile();
      const updatedUser = response.data.data;

      console.log("=== DEBUG PROFILE UPDATE ===");
      console.log("1. Raw response dari backend:", updatedUser);
      console.log("2. Profile object:", updatedUser.Profile);
      console.log("3. Bio dari backend:", updatedUser.Profile?.bio);
      console.log(
        "4. Picture URL dari backend:",
        updatedUser.Profile?.profile_picture_url
      );

      // Update auth context dengan data terbaru
      setAuthUser(updatedUser);

      // Update local state dengan data dari backend
      const bioValue = updatedUser.Profile?.bio || "";
      const pictureUrl = updatedUser.Profile?.profile_picture_url
        ? `http://localhost:8080${updatedUser.Profile.profile_picture_url}`
        : null;

      console.log("5. Bio yang akan di-set:", bioValue);
      console.log("6. Avatar URL yang akan di-set:", pictureUrl);

      const userData = {
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        role: updatedUser.Role?.role_name || "User",
        joinDate: updatedUser.created_at
          ? new Date(updatedUser.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "",
        bio: bioValue,
        avatar: pictureUrl,
      };

      console.log("7. UserData object lengkap:", userData);
      console.log("========================");

      setUser(userData);
      setEditForm(userData);
      setAvatarFile(null);
      setIsEditing(false);
      setToast({ type: "success", message: "Profil berhasil diperbarui!" });
    } catch (err) {
      console.error("Error updating profile:", err);
      setToast({
        type: "error",
        message: err.response?.data?.error || "Gagal memperbarui profil",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({ ...user });
    setAvatarFile(null);
    setErrors({});
    setIsEditing(false);
  };

  // Handle Avatar Upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simpan file object untuk upload
      setAvatarFile(file);

      // Buat preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm((prev) => ({
          ...prev,
          avatar: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Password Change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSavePassword = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Password saat ini harus diisi";
    }
    if (!passwordForm.newPassword) {
      newErrors.newPassword = "Password baru harus diisi";
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = "Password minimal 6 karakter";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simulate password change (implement API call here)
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordModal(false);
    setErrors({});
    setToast({ type: "success", message: "Password berhasil diubah!" });
  };

  const handleCancelPassword = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setShowPasswordModal(false);
  };

  return (
    <div className="profile-page">
      {/* Page Header */}
      <div className="profile-header">
        <div>
          <h2 className="profile-title" data-testid="page-title">
            Profil Saya
          </h2>
          <p className="profile-subtitle">
            Kelola informasi profil dan pengaturan akun Anda
          </p>
        </div>
        {!isEditing && (
          <button
            className="btn btn-primary"
            onClick={() => setIsEditing(true)}
            data-testid="button-edit-profile">
            <User className="btn-icon" />
            Edit Profil
          </button>
        )}
      </div>

      <div className="profile-grid">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Informasi Profil</h3>
            </div>
            <div className="card-body">
              {/* Avatar Section */}
              <div className="avatar-section">
                <div className="avatar-wrapper">
                  {editForm.avatar || user.avatar ? (
                    <img
                      src={editForm.avatar || user.avatar}
                      alt="Avatar"
                      className="avatar-image"
                      data-testid="avatar-image"
                    />
                  ) : (
                    <div
                      className="avatar-placeholder"
                      data-testid="avatar-placeholder">
                      <User className="avatar-icon" />
                    </div>
                  )}
                  {isEditing && (
                    <label
                      className="avatar-upload-btn"
                      htmlFor="avatar-upload">
                      <Camera className="camera-icon" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="avatar-input"
                        data-testid="input-avatar"
                      />
                    </label>
                  )}
                </div>
                <div className="avatar-info">
                  <p className="avatar-name" data-testid="text-user-name">
                    {isEditing ? editForm.name : user.name}
                  </p>
                  <span className="avatar-role" data-testid="text-user-role">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Profile Info */}
              <div className="profile-info">
                {/* Name */}
                <div className="info-group">
                  <label className="info-label">
                    <User className="info-icon" />
                    Nama Lengkap
                  </label>
                  {isEditing ? (
                    <div className="input-wrapper">
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className={`input ${errors.name ? "error" : ""}`}
                        placeholder="Masukkan nama lengkap"
                        data-testid="input-name"
                      />
                      {errors.name && (
                        <span className="error-message">{errors.name}</span>
                      )}
                    </div>
                  ) : (
                    <p className="info-value" data-testid="display-name">
                      {user.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="info-group">
                  <label className="info-label">
                    <Mail className="info-icon" />
                    Email
                  </label>
                  {isEditing ? (
                    <div className="input-wrapper">
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        className={`input ${errors.email ? "error" : ""}`}
                        placeholder="email@example.com"
                        data-testid="input-email"
                      />
                      {errors.email && (
                        <span className="error-message">{errors.email}</span>
                      )}
                    </div>
                  ) : (
                    <p className="info-value" data-testid="display-email">
                      {user.email}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div className="info-group">
                  <label className="info-label">Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleEditChange}
                      className="textarea"
                      rows="3"
                      placeholder="Ceritakan tentang diri Anda..."
                      data-testid="input-bio"
                    />
                  ) : (
                    <p className="info-value" data-testid="display-bio">
                      {user.bio || "Belum ada bio"}
                    </p>
                  )}
                </div>

                {/* Join Date (Read-only) */}
                <div className="info-group">
                  <label className="info-label">
                    <Calendar className="info-icon" />
                    Bergabung Sejak
                  </label>
                  <p
                    className="info-value info-readonly"
                    data-testid="display-join-date">
                    {user.joinDate}
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div
                  className="alert alert-error"
                  style={{ marginTop: "1rem" }}>
                  {errors.submit}
                </div>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="action-buttons">
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                    data-testid="button-cancel-edit"
                    disabled={isLoading}>
                    <X className="btn-icon" />
                    Batal
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveProfile}
                    data-testid="button-save-profile"
                    disabled={isLoading}>
                    <Save className="btn-icon" />
                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="sidebar-cards">
          {/* Security Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Keamanan</h3>
            </div>
            <div className="card-body">
              <div className="security-section">
                <div className="security-info">
                  <Lock className="security-icon" />
                  <div>
                    <p className="security-title">Password</p>
                    <p className="security-desc">Pastikan akun Anda aman</p>
                  </div>
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowPasswordModal(true)}
                  data-testid="button-change-password">
                  Ubah Password
                </button>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Informasi Akun</h3>
            </div>
            <div className="card-body">
              <div className="info-list">
                <div className="info-item">
                  <span className="info-item-label">Status:</span>
                  <span className="info-item-value status-active">
                    {authUser?.status_user === "active" ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-item-label">Role:</span>
                  <span className="info-item-value">{user.role}</span>
                </div>
                <div className="info-item">
                  <span className="info-item-label">Bergabung:</span>
                  <span className="info-item-value">{user.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={handleCancelPassword}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Ubah Password</h3>
              <button
                className="modal-close"
                onClick={handleCancelPassword}
                data-testid="button-close-modal">
                <X className="close-icon" />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Password Saat Ini</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className={`input ${errors.currentPassword ? "error" : ""}`}
                  placeholder="Masukkan password saat ini"
                  data-testid="input-current-password"
                />
                {errors.currentPassword && (
                  <span className="error-message">
                    {errors.currentPassword}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Password Baru</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className={`input ${errors.newPassword ? "error" : ""}`}
                  placeholder="Masukkan password baru"
                  data-testid="input-new-password"
                />
                {errors.newPassword && (
                  <span className="error-message">{errors.newPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`input ${errors.confirmPassword ? "error" : ""}`}
                  placeholder="Konfirmasi password baru"
                  data-testid="input-confirm-password"
                />
                {errors.confirmPassword && (
                  <span className="error-message">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCancelPassword}
                data-testid="button-cancel-password">
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSavePassword}
                data-testid="button-save-password">
                Simpan Password
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

export default ProfilePage;
