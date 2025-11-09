// LOKASI: src/components/ui/Profile/Profile.jsx (VERSI DIPERBARUI)

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./Profile.scss";

const Profile = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false); // State baru
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsCollectionOpen(false); // Tutup sub-menu juga
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
    setIsCollectionOpen(false);
  };

  if (!user) return null;

  // Fallback jika user data tidak lengkap (misalnya saat fetch profil gagal)
  const displayName = user.Name || user.name || "User";
  const displayEmail = user.Email || user.email || "";

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
        {displayName}
        <span>▼</span>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <strong>{displayName}</strong>
            {displayEmail && <small>{displayEmail}</small>}
          </div>

          <Link to="/profile" className="dropdown-item" onClick={closeMenu}>
            Profil Saya
          </Link>

          <Link to="/menu/create" className="dropdown-item" onClick={closeMenu}>
            Buat Resep
          </Link>

          {/* --- SUB-MENU BARU --- */}
          <div
            className="dropdown-item sub-menu-toggle"
            onClick={() => setIsCollectionOpen(!isCollectionOpen)}>
            Koleksi Resep
            <span>{isCollectionOpen ? "▲" : "▼"}</span>
          </div>

          {isCollectionOpen && (
            <div className="sub-dropdown-menu">
              <Link
                to="/koleksi/semua"
                className="dropdown-item sub-item"
                onClick={closeMenu}>
                Semua Resep
              </Link>
              <Link
                to="/koleksi/resep-mu"
                className="dropdown-item sub-item"
                onClick={closeMenu}>
                Resep Mu
              </Link>
              <Link
                to="/koleksi/tersimpan"
                className="dropdown-item sub-item"
                onClick={closeMenu}>
                Tersimpan
              </Link>
            </div>
          )}
          {/* -------------------- */}

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
