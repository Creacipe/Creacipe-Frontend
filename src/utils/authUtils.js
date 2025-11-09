// LOKASI: src/utils/authUtils.js

const ACCESS_TOKEN_KEY = 'creacipe_access_token';
const REFRESH_TOKEN_KEY = 'creacipe_refresh_token';

/**
 * Menyimpan kedua token ke localStorage.
 */
export const saveTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

/**
 * Menyimpan HANYA access token (berguna saat refresh).
 */
export const saveAccessToken = (accessToken) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};


/**
 * Mengambil Access Token dari localStorage.
 */
export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Mengambil Refresh Token dari localStorage.
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Menghapus semua token (untuk logout).
 */
export const removeTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};