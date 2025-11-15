// LOKASI: src/services/tagService.js

import api from "./api";

/**
 * Mengambil semua tag dari backend.
 * Endpoint: GET /api/tags
 */
const getAllTags = () => {
  return api.get("/tags");
};

/**
 * Membuat tag baru (Editor/Admin only)
 * Endpoint: POST /api/editor/tags
 */
const createTag = (tagData) => {
  return api.post("/editor/tags", tagData);
};

/**
 * Update tag (Editor/Admin only)
 * Endpoint: PUT /api/editor/tags/:id
 */
const updateTag = (id, tagData) => {
  return api.put(`/editor/tags/${id}`, tagData);
};

/**
 * Delete tag (Editor/Admin only)
 * Endpoint: DELETE /api/editor/tags/:id
 */
const deleteTag = (id) => {
  return api.delete(`/editor/tags/${id}`);
};

export const tagService = {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
};
