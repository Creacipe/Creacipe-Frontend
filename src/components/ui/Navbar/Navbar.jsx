// LOKASI: src/components/ui/Navbar/Navbar.jsx (VERSI DIPERBARUI)

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
// 1. Ubah import ini
import Profile from '../Profile/Profile'; // <-- Path dan nama komponen diubah
import './Navbar.scss';

const Navbar = () => {
  const { isLoggedIn, loading } = useAuth();


  const renderAuthSection = () => {
    if (loading) {
      return null;
    }

    // 2. Gunakan komponen 'Profile' di sini
    if (isLoggedIn) {
      return <Profile />; // <-- Gunakan nama baru
    }

    return (
      <Link to="/login" className="navbar-login-button">
        LOGIN
      </Link>
    );
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-logo">
        <Link to="/">CREACIPE</Link> 
      </div>
      
      <div className="navbar-links">
        {/* (Nanti) Link ke "Semua Resep" */}
      </div>

      <div className="navbar-auth">
        {renderAuthSection()}
      </div>
    </nav>
  );
};

export default Navbar;