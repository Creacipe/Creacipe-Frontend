// LOKASI: src/pages/Dashboard/ProfilePage.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import "./ProfilePage.scss";

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    profile_picture_url: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.Profile?.bio || "",
        profile_picture_url: user.Profile?.profile_picture_url || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await userService.updateMyProfile(formData);

      // Update user di context
      const updatedProfile = await userService.getMyProfile();
      setUser(updatedProfile.data.data);

      setMessage("Profil berhasil diperbarui!");
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || "Gagal memperbarui profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || "",
      bio: user.Profile?.bio || "",
      profile_picture_url: user.Profile?.profile_picture_url || "",
    });
    setError(null);
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h2>👤 Profil Saya</h2>
        {!isEditing && (
          <button className="btn-edit" onClick={() => setIsEditing(true)}>
            ✏️ Edit Profil
          </button>
        )}
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {formData.profile_picture_url ? (
              <img src={formData.profile_picture_url} alt={formData.name} />
            ) : (
              <div className="avatar-placeholder">
                {formData.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h3>{user?.name}</h3>
            <p className="role-badge">
              {user?.Role?.role_id === 1 ? "👑 Admin" : "✏️ Editor"}
            </p>
            <p className="email">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Nama Lengkap</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              rows="4"
              placeholder="Ceritakan tentang diri Anda..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile_picture_url">URL Foto Profil</label>
            <input
              type="url"
              id="profile_picture_url"
              name="profile_picture_url"
              value={formData.profile_picture_url}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          {isEditing && (
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
                disabled={isLoading}>
                Batal
              </button>
              <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="profile-stats">
        <h3>Informasi Akun</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="label">Status:</span>
            <span className="value">
              {user?.status_user === "active" ? "✅ Aktif" : "❌ Tidak Aktif"}
            </span>
          </div>
          <div className="stat-item">
            <span className="label">Bergabung:</span>
            <span className="value">
              {new Date(user?.created_at).toLocaleDateString("id-ID")}
            </span>
          </div>
          <div className="stat-item">
            <span className="label">Terakhir Update:</span>
            <span className="value">
              {new Date(user?.updated_at).toLocaleDateString("id-ID")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
