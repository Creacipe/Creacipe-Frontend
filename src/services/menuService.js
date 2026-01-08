// LOKASI: src/services/menuService.js

import api from './api';

// ... (fungsi getPopularMenus, getAllMenus, getMenuById, getRecommendations tetap ada) ...
const getPopularMenus = (page = 1, limit = 20) => api.get(`/menus/popular?page=${page}&limit=${limit}`);
const getAllMenus = (page = 1, limit = 20, search = '') => {
  let url = `/menus?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  return api.get(url);
};
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
 * Mendapatkan semua resep yang dibuat oleh user yang sedang login dengan pagination.
 * Endpoint: GET /api/me/menus
 * @param {number} page - Halaman (default 1)
 * @param {number} limit - Jumlah per halaman (default 12)
 * @param {string} search - Kata kunci pencarian (optional)
 */
const getMyMenus = (page = 1, limit = 12, search = "") => {
  const params = new URLSearchParams({
    page,
    limit
  });
  if (search) params.append("search", search);
  return api.get(`/me/menus?${params.toString()}`);
};

/**
 * Mendapatkan semua resep yang di-bookmark oleh user dengan pagination.
 * Endpoint: GET /api/me/bookmarks
 * @param {number} page - Halaman (default 1)
 * @param {number} limit - Jumlah per halaman (default 12)
 * @param {string} search - Kata kunci pencarian (optional)
 */
const getMyBookmarks = (page = 1, limit = 12, search = "") => {
  const params = new URLSearchParams({
    page,
    limit
  });
  if (search) params.append("search", search);
  return api.get(`/me/bookmarks?${params.toString()}`);
};

/**
 * Mendapatkan gabungan resep milik user dan bookmark dengan pagination.
 * Endpoint: GET /api/me/collection
 * @param {number} page - Halaman (default 1)
 * @param {number} limit - Jumlah per halaman (default 12)
 * @param {string} search - Kata kunci pencarian (optional)
 */
const getMyCollection = (page = 1, limit = 12, search = "") => {
  const params = new URLSearchParams({
    page,
    limit
  });
  if (search) params.append("search", search);
  return api.get(`/me/collection?${params.toString()}`);
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
  likeMenu, // Tambahkan
  dislikeMenu, // Tambahkan
  bookmarkMenu, // Tambahkan
  unbookmarkMenu, // Tambahkan
  createMenu, // Tambahkan
  getUserInteractionStatus, // Tambahkan
  getMyMenus, // Tambahkan
  getMyBookmarks, // Tambahkan
  getMyCollection, // Tambahkan
  updateMenu, // Tambahkan
  deleteMenu, // Tambahkan
  getPersonalizedRecommendations, // Tambahkan
};