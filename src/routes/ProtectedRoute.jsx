// LOKASI: src/routes/ProtectedRoute.jsx

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isLoggedIn, loading, user } = useAuth();

  // 1. Jika masih loading (memvalidasi token), tampilkan loading
  if (loading) {
    return <div>Loading...</div>; // Atau tampilkan spinner
  }

  // 2. Jika tidak login, "lempar" kembali ke halaman /login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 3. Jika ada role requirement, check role user berdasarkan role_id
  if (allowedRoles.length > 0 && user) {
    const roleId = user.Role?.role_id;

    // Konversi allowed roles (string) ke role_id (number)
    const allowedRoleIds = allowedRoles
      .map((role) => {
        if (role === "admin") return 1;
        if (role === "editor") return 2;
        if (role === "member") return 3;
        return null;
      })
      .filter((id) => id !== null);

    if (!allowedRoleIds.includes(roleId)) {
      // User tidak punya akses, redirect ke home
      return <Navigate to="/" replace />;
    }
  }

  // 4. Jika sudah login dan role sesuai, izinkan akses ke halaman (via <Outlet />)
  return <Outlet />;
};

export default ProtectedRoute;
