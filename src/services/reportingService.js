// src/services/reportingService.js
import api from './api';

export const reportingService = {
  getRecipeStats: () => {
    return api.get('/admin/reporting/recipe-stats');
  },

  getGrowthStats: () => {
    return api.get('/admin/reporting/growth-stats');
  },

  getTopTags: () => {
    return api.get('/admin/reporting/top-tags');
  },

  getActivityLogStats: () => {
    return api.get('/admin/reporting/activity-log-stats');
  },

  getTopLikedRecipes: () => {
    return api.get('/admin/reporting/top-liked-recipes');
  },

  getTopBookmarkedRecipes: () => {
    return api.get('/admin/reporting/top-bookmarked-recipes');
  },
};
