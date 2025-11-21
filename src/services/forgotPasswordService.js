// forgotPasswordService.js - Service untuk forgot password
import api from "./api";

export const forgotPasswordService = {
  // Request OTP untuk reset password
  requestOTP: async (email) => {
    return await api.post("/forgot-password", { email });
  },

  // Verify OTP dan reset password
  verifyAndReset: async (email, verificationCode, newPassword) => {
    return await api.post("/forgot-password/verify", {
      email,
      verification_code: verificationCode,
      new_password: newPassword,
    });
  },
};

export default forgotPasswordService;
