// LOKASI: src/services/api.js (DIPERBAIKI)

import axios from "axios";
// 1. Impor semua helper
import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
  removeTokens,
} from "../utils/authUtils";

// 2. Tentukan baseURL
const API_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
  // JANGAN set Content-Type default, biarkan axios yang atur
  // Content-Type akan otomatis jadi 'application/json' untuk object biasa
  // dan 'multipart/form-data' untuk FormData
});

// 3. Interceptor REQUEST
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Set Content-Type hanya jika belum di-set dan bukan FormData
    if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. --- INTERCEPTOR RESPONSE (DIPERBAIKI - TANPA AUTO REDIRECT) ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Jika respons sukses, langsung kembalikan
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // PERBAIKAN: Tambahkan pengecekan yang lebih ketat
    if (!error.response) {
      return Promise.reject(error);
    }


    // Cek jika error 401 (Unauthorized) dan BUKAN permintaan refresh itu sendiri
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      

      // Jika sedang dalam proses refresh, tambahkan request ke antrian
      if (isRefreshing) {
        
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        removeTokens();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        saveAccessToken(data.access_token);
        originalRequest.headers[
          "Authorization"
        ] = `Bearer ${data.access_token}`;

        processQueue(null, data.access_token);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        removeTokens();
        return Promise.reject(refreshError);
      }
    }

    // Untuk error lain, langsung lemparkan
    return Promise.reject(error);
  }
);

export default api;
