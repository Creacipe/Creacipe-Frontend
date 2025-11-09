// LOKASI: src/services/authService.js

import api from './api'; // Impor instance axios yang baru saja kita buat

/**
 * Mengirim permintaan login ke backend.
 * @param {object} credentials - Objek berisi email dan password
 * @returns {Promise} Respons dari axios (termasuk token jika berhasil)
 */
const login = (credentials) => {
  // data 'credentials' akan berisi: { email: "...", password: "..." }
  // Ini akan mengirim POST request ke: http://localhost:8080/api/login
  return api.post('/login', credentials);
};

/**
 * Mengirim permintaan registrasi ke backend.
 * @param {object} userData - Objek berisi name, email, dan password
 * @returns {Promise} Respons dari axios
 */
const register = (userData) => {
  // data 'userData' akan berisi: { name: "...", email: "...", password: "..." }
  // Ini akan mengirim POST request ke: http://localhost:8080/api/register
  return api.post('/register', userData);
};

// Kita ekspor fungsi-fungsi ini agar bisa digunakan di halaman Login/Register kita nanti
export const authService = {
  login,
  register,
};