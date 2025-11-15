// LOKASI: src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
// 1. Impor helper baru untuk refresh token
import { getAccessToken, saveTokens, removeTokens } from "../utils/authUtils";

// 2. Buat Context-nya
const AuthContext = createContext(null);

// 3. Buat "Provider" (Komponen Pembungkus)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Menyimpan data user (null = belum login)
  const [loading, setLoading] = useState(true); // Status loading awal

  // 4. Efek ini berjalan sekali saat aplikasi dimuat
  useEffect(() => {
    const validateToken = async () => {
      // Cek access token (jangka pendek)
      const token = getAccessToken();
      if (token) {
        try {
          // Token ada, validasi ke backend
          const response = await userService.getMyProfile();
          setUser(response.data.data); // Simpan data user ke state
        } catch {
          // <-- PERBAIKAN: (error) dihapus
          // Token tidak valid (misal: kadaluarsa)
          // Interceptor di api.js akan mencoba me-refresh.
          // Jika refresh juga gagal, interceptor akan hapus token.
          // Di sini kita anggap saja gagal.
          removeTokens();
          setUser(null);
        }
      }
      setLoading(false); // Selesai loading
    };

    validateToken();
  }, []);

  // 5. Fungsi login (DENGAN FETCH PROFIL - Set user langsung)
  const login = async (credentials) => {
    // Panggil API login
    const response = await authService.login(credentials);

    // Backend mengirim 'access_token' dan 'refresh_token'
    if (response.data.access_token && response.data.refresh_token) {
      // Simpan kedua token ke localStorage
      saveTokens(response.data.access_token, response.data.refresh_token);

      // Delay kecil untuk memastikan localStorage sudah update
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        const profileResponse = await userService.getMyProfile();
        setUser(profileResponse.data.data);
      } catch {
        // Jika gagal fetch profil, set user dummy agar isLoggedIn = true
        // User akan di-fetch ulang saat refresh halaman
        setUser({ temp: true });
      }
    }
    return response;
  };

  // 6. Buat fungsi logout
  const logout = () => {
    removeTokens(); // Hapus kedua token
    setUser(null); // Set user jadi null
    // Redirect ke halaman utama
    window.location.href = "/";
  };

  // 7. Nilai yang akan dibagikan ke seluruh aplikasi
  const value = {
    user,
    setUser, // Data user (atau null)
    isLoggedIn: !!user, // boolean (true jika user ada, false jika null)
    loading, // Status loading (berguna untuk loading awal)
    login, // Fungsi login
    logout, // Fungsi logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 8. Buat Hook kustom (agar mudah digunakan)
// (Peringatan 'Fast Refresh' di baris ini boleh diabaikan)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
};
