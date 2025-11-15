// LOKASI: src/services/categoryService.js

import api from './api';

/**
 * Mengambil semua kategori
 * Endpoint: GET /api/categories
 */
const getAllCategories = () => {
  return api.get('/categories');
};

/**
 * Membuat kategori baru (Editor/Admin only)
 * Endpoint: POST /api/editor/categories
 */
const createCategory = (categoryData) => {
  return api.post('/editor/categories', categoryData);
};

/**
 * Update kategori (Editor/Admin only)
 * Endpoint: PUT /api/editor/categories/:id
 */
const updateCategory = (id, categoryData) => {
  return api.put(`/editor/categories/${id}`, categoryData);
};

/**
 * Delete kategori (Editor/Admin only)
 * Endpoint: DELETE /api/editor/categories/:id
 */
const deleteCategory = (id) => {
  return api.delete(`/editor/categories/${id}`);
};

export const categoryService = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
