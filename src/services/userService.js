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
 */
const updateMyProfile = (data) => {
  return api.put("/me", data);
};
export const userService = {
  getMyProfile,
  updateMyProfile,
};