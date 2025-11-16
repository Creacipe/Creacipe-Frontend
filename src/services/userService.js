// LOKASI: src/services/userService.js

import api from './api';

/**
 * Mengambil profil pengguna yang sedang login (berdasarkan token JWT).
 * Endpoint: GET /api/me
 */
const getMyProfile = () => {
  return api.get('/me');
};
/**
 * Memperbarui profil pengguna yang sedang login.
 * Endpoint: PUT /api/me
 * Support FormData untuk upload file
 */
const updateMyProfile = (data) => {
  // Jika data adalah FormData, set header yang sesuai
  const config =
    data instanceof FormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};

  return api.put("/me", data, config);
};
export const userService = {
  getMyProfile,
  updateMyProfile,
};