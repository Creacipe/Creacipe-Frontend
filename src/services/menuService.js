// LOKASI: src/services/menuService.js

import api from './api';

// ... (fungsi getPopularMenus, getAllMenus, getMenuById, getRecommendations tetap ada) ...
const getPopularMenus = () => api.get('/menus/popular');
const getAllMenus = () => api.get('/menus');
const getMenuById = (id) => api.get(`/menus/${id}`);
const getRecommendations = (id) => api.get(`/menus/${id}/recommendations`);

// --- TAMBAHKAN FUNGSI-FUNGSI BARU INI ---

/**
 * Mengirim 'like' ke resep.
 * Endpoint: POST /api/menus/:id/like
 */
const likeMenu = (id) => {
  return api.post(`/menus/${id}/like`);
};

/**
 * Mengirim 'dislike' ke resep.
 * Endpoint: POST /api/menus/:id/dislike
 */
const dislikeMenu = (id) => {
  return api.post(`/menus/${id}/dislike`);
};

/**
 * Menambahkan resep ke bookmark.
 * Endpoint: POST /api/menus/:id/bookmark
 */
const bookmarkMenu = (id) => {
  return api.post(`/menus/${id}/bookmark`);
};

/**
 * Menghapus resep dari bookmark.
 * Endpoint: DELETE /api/menus/:id/bookmark
 */
const unbookmarkMenu = (id) => {
  return api.delete(`/menus/${id}/bookmark`);
};

// --- GANTI FUNGSI INI ---
/**
 * Mengirim resep baru ke backend.
 * Endpoint: POST /api/menus
 * @param {FormData} formData - Data resep (termasuk file jika ada)
 */
const createMenu = (formData) => {
  // Axios akan otomatis mengatur Content-Type: multipart/form-data
  // saat kita mengirim FormData
  return api.post('/menus', formData);
};
// ---------------------------------
// --- PERBARUI EKSPOR DI BAGIAN BAWAH ---
export const menuService = {
  getPopularMenus,
  getAllMenus,
  getMenuById,
  getRecommendations,
  likeMenu,       // Tambahkan
  dislikeMenu,    // Tambahkan
  bookmarkMenu,   // Tambahkan
  unbookmarkMenu, // Tambahkan
  createMenu,     // Tambahkan
};