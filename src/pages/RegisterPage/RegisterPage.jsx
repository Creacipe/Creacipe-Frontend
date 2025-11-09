// LOKASI: src/pages/RegisterPage/RegisterPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './RegisterPage.scss'; // Impor SCSS

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const userData = { name, email, password };

    try {
      const response = await authService.register(userData);
      setSuccess(response.data.message || 'Registrasi berhasil! Silakan login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Registrasi gagal. Coba lagi.";
      setError(errorMessage);
    }
  };

  return (
    // Gunakan class dari shared-styles.scss
    <div className="form-page-container"> 
      <h2>Buat Akun Creacipe Baru</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="name">Nama Lengkap</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength="6"
            required
          />
        </div>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}

        <button type="submit">
          Daftar
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;