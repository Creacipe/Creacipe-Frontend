// LOKASI: src/services/userService.js

import api from './api';

/**
 * Mengambil profil pengguna yang sedang login (berdasarkan token JWT).
 * Endpoint: GET /api/me
 */
const getMyProfile = () => {
  return api.get('/me');
};

export const userService = {
  getMyProfile,
};