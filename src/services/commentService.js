// commentService.js - Service untuk komentar resep
import api from "./api";

export const commentService = {
  // Create comment on a menu
  createComment: async (menuId, commentText) => {
    return await api.post(`/menus/${menuId}/comments`, {
      comment_text: commentText,
    });
  },

  // Get all comments for a menu
  getCommentsByMenu: async (menuId) => {
    return await api.get(`/menus/${menuId}/comments`);
  },

  // Delete own comment
  deleteComment: async (commentId) => {
    return await api.delete(`/comments/${commentId}`);
  },
};

export default commentService;
