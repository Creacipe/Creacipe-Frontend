// LOKASI: src/services/tagService.js

import api from './api';

/**
 * Mengambil semua tag dari backend.
 * Endpoint: GET /api/tags
 */
const getAllTags = () => {
  return api.get('/tags');
};

export const tagService = {
  getAllTags,
};