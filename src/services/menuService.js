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

/**
 * Mendapatkan status interaksi user (like/dislike/bookmark) untuk sebuah menu.
 * Endpoint: GET /api/menus/:id/interaction-status
 */
const getUserInteractionStatus = (id) => {
  return api.get(`/menus/${id}/interaction-status`);
};

/**
 * Mendapatkan semua resep yang dibuat oleh user yang sedang login.
 * Endpoint: GET /api/me/menus
 */
const getMyMenus = () => {
  return api.get("/me/menus");
};

/**
 * Mendapatkan semua resep yang di-bookmark oleh user.
 * Endpoint: GET /api/me/bookmarks
 */
const getMyBookmarks = () => {
  return api.get("/me/bookmarks");
};

/**
 * Mendapatkan gabungan resep milik user dan bookmark.
 * Endpoint: GET /api/me/collection
 */
const getMyCollection = () => {
  return api.get("/me/collection");
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

/**
 * Mengupdate resep yang sudah ada.
 * Endpoint: PUT /api/menus/:id
 * @param {number} id - ID resep
 * @param {FormData} formData - Data resep yang diupdate
 */
const updateMenu = (id, formData) => {
  return api.put(`/menus/${id}`, formData);
};

/**
 * Menghapus resep.
 * Endpoint: DELETE /api/menus/:id
 * @param {number} id - ID resep yang akan dihapus
 */
const deleteMenu = (id) => {
  return api.delete(`/menus/${id}`);
};

/**
 * Mendapatkan rekomendasi personalisasi berdasarkan resep yang di-like user.
 * Endpoint: GET /api/recommendations/profile
 */
const getPersonalizedRecommendations = () => {
  return api.get("/me/recommendations");
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
  getUserInteractionStatus, // Tambahkan
  getMyMenus,            // Tambahkan
  getMyBookmarks,        // Tambahkan
  getMyCollection,      // Tambahkan
  updateMenu,      // Tambahkan
  deleteMenu,       // Tambahkan
  getPersonalizedRecommendations, // Tambahkan
};