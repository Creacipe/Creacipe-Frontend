// LOKASI: src/routes/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isLoggedIn, loading } = useAuth();

  // 1. Jika masih loading (memvalidasi token), tampilkan apa-apa
  if (loading) {
    return <div>Loading...</div>; // Atau tampilkan spinner
  }

  // 2. Jika sudah login, izinkan akses ke halaman (via <Outlet />)
  if (isLoggedIn) {
    return <Outlet />;
  }

  // 3. Jika tidak login, "lempar" kembali ke halaman /login
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;