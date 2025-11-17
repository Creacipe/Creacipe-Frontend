// LOKASI: src/services/verificationService.js

import api from "./api";

export const verificationService = {
  // Request kode verifikasi untuk reset password
  requestPasswordReset: (currentPassword) => {
    return api.post("/me/request-password-reset", {
      current_password: currentPassword,
    });
  },

  // Verifikasi kode dan reset password
  verifyAndResetPassword: (verificationCode, newPassword) => {
    return api.post("/me/verify-reset-password", {
      verification_code: verificationCode,
      new_password: newPassword,
    });
  },

  // Request kode verifikasi untuk ubah email
  requestEmailChange: (newEmail) => {
    return api.post("/me/request-email-change", {
      new_email: newEmail,
    });
  },

  // Verifikasi kode dan ubah email
  verifyAndChangeEmail: (verificationCode) => {
    return api.post("/me/verify-email-change", {
      verification_code: verificationCode,
    });
  },
};
