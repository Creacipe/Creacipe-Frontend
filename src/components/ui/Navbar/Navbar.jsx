// LOKASI: src/components/ui/Navbar/Navbar.jsx (VERSI DIPERBARUI)

import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
// 1. Ubah import ini
import Profile from '../Profile/Profile'; // <-- Path dan nama komponen diubah
import './Navbar.scss';

const Navbar = () => {
  const { isLoggedIn, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };


  const renderAuthSection = () => {
    if (loading) {
      return null;
    }

    // 2. Gunakan komponen 'Profile' di sini
    if (isLoggedIn) {
      return <Profile />; // <-- Gunakan nama baru
    }

    return (
      <Link to="/login" className="navbar-login-button" onClick={closeMobileMenu}>
        LOGIN
      </Link>
    );
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-logo">
        <Link to="/" onClick={closeMobileMenu}>CREACIPE</Link> 
      </div>
      
      {/* Hamburger Icon */}
      <button
        className={`navbar-hamburger ${isMobileMenuOpen ? "active" : ""}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile & Desktop Menu */}
      <div className={`navbar-menu ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="navbar-links">
        </div>
        <div className="navbar-auth">{renderAuthSection()}</div>
      </div>

      {/* Overlay untuk mobile */}
      {isMobileMenuOpen && (
        <div className="navbar-overlay" onClick={closeMobileMenu}></div>
      )}
    </nav>
  );
};

export default Navbar;