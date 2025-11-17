// LOKASI: src/components/ui/Profile/Profile.jsx (VERSI DIPERBARUI)

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./Profile.scss";

const Profile = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const dropdownRef = useRef(null);

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsCollectionOpen(false);
      }
    };

    // Only add click outside listener on desktop
    if (!isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  const closeMenu = () => {
    setIsOpen(false);
    setIsCollectionOpen(false);
  };

  if (!user) return null;

  // Fallback jika user data tidak lengkap (misalnya saat fetch profil gagal)
  const displayName = user.Name || user.name || "User";
  const displayEmail = user.Email || user.email || "";

  // Ambil foto profil dari user data
  const profilePicture = user.Profile?.profile_picture_url
    ? `http://localhost:8080${user.Profile.profile_picture_url}`
    : null;

  // Cek apakah user adalah admin atau editor
  const userRole = user.role || user.Role?.role_name;
  const isAdminOrEditor = userRole === "admin" || userRole === "editor";

  // Di mobile, menu selalu terbuka (tidak pakai dropdown)
  const showMenu = isMobile ? true : isOpen;

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      {/* Toggle button hanya muncul di desktop */}
      {!isMobile && (
        <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={displayName}
              className="dropdown-avatar"
            />
          ) : (
            <div className="dropdown-avatar-placeholder">👤</div>
          )}
          <span>▼</span>
        </button>
      )}

      {/* Di mobile, langsung tampilkan menu tanpa toggle */}
      {showMenu && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={displayName}
                className="dropdown-header-avatar"
              />
            ) : (
              <div className="dropdown-header-avatar-placeholder">👤</div>
            )}
            <div className="dropdown-header-text">
              <strong>{displayName}</strong>
              {displayEmail && <small>{displayEmail}</small>}
            </div>
          </div>

          <Link to="/profile" className="dropdown-item" onClick={closeMenu}>
            Profil Saya
          </Link>

          {/* Menu Dashboard - hanya untuk Admin/Editor */}
          {isAdminOrEditor && (
            <Link to="/dashboard" className="dropdown-item" onClick={closeMenu}>
              Dashboard
            </Link>
          )}

          <Link to="/menu/create" className="dropdown-item" onClick={closeMenu}>
            Buat Resep
          </Link>

          {/* Sub-menu Koleksi Resep */}
          <div className="dropdown-item-wrapper">
            <div
              className="dropdown-item sub-menu-toggle"
              onClick={() => setIsCollectionOpen(!isCollectionOpen)}>
              Koleksi Resep
              <span className="arrow">{isCollectionOpen ? "▲" : "▼"}</span>
            </div>

            {isCollectionOpen && (
              <div className="sub-dropdown-menu">
                <Link
                  to="/collection/all"
                  className="dropdown-item sub-item"
                  onClick={closeMenu}>
                  Semua Resep
                </Link>
                <Link
                  to="/collection/my-recipes"
                  className="dropdown-item sub-item"
                  onClick={closeMenu}>
                  Resepmu
                </Link>
                <Link
                  to="/collection/saved"
                  className="dropdown-item sub-item"
                  onClick={closeMenu}>
                  Tersimpan
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="dropdown-item dropdown-item-logout">
            Keluar
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
