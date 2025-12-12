// LOKASI: src/services/dashboardService.js

import api from "./api";

// Dashboard Stats
const getDashboardStats = (isAdmin = false) => {
  const endpoint = isAdmin ? "/admin/dashboard/stats" : "/editor/dashboard/stats";
  return api.get(endpoint);
};

// Moderasi Resep
const getAllRecipesForModeration = (status = "") => {
  const query = status ? `?status=${status}` : "";
  return api.get(`/editor/menus${query}`);
};

const getPendingRecipes = () => {
  return api.get("/editor/menus/pending");
};

const updateMenuStatus = (id, status, rejectionReason = "") => {
  return api.patch(`/editor/menus/${id}/status`, {
    status: status,
    rejection_reason: rejectionReason
  });
};

const deleteMenu = (id) => {
  return api.delete(`/editor/menus/${id}`);
};

// Manajemen User (Admin Only)
const getAllUsers = () => {
  return api.get("/admin/users");
};

const getUserById = (id) => {
  return api.get(`/admin/users/${id}`);
};

const createUser = (userData) => {
  return api.post("/admin/users", userData);
};

const updateUser = (id, userData) => {
  return api.put(`/admin/users/${id}`, userData);
};

const updateUserRole = (id, roleId) => {
  return api.patch(`/admin/users/${id}/role`, {
    role_id: roleId
  });
};

const deactivateUser = (id) => {
  return api.patch(`/admin/users/${id}/deactivate`);
};

const activateUser = (id) => {
  return api.patch(`/admin/users/${id}/activate`);
};

const getUserRelatedData = (id) => {
  return api.get(`/admin/users/${id}/related-data`);
};

const deleteUser = (id) => {
  return api.delete(`/admin/users/${id}`);
};

const getAllRoles = () => {
  return api.get("/admin/roles");
};

// Log Aktivitas (Admin Only)
const getActivityLogs = () => {
  return api.get("/admin/logs");
};

// Log Evaluasi Real-time (Admin Only)
const getEvaluationLogs = (limit = 50) => {
  return api.get(`/admin/evaluation/logs?limit=${limit}`);
};

export const dashboardService = {
  getDashboardStats,
  getAllRecipesForModeration,
  getPendingRecipes,
  updateMenuStatus,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  deactivateUser,
  activateUser,
  getUserRelatedData,
  deleteUser,
  getAllRoles,
  getActivityLogs,
  deleteMenu,
  getEvaluationLogs,
};