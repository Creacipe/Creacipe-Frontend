// LOKASI: src/pages/LoginPage/LoginPage.jsx (VERSI DIPERBARUI)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // 1. Impor useAuth
import "./LoginPage.scss";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { login } = useAuth(); // 2. Ambil fungsi login dari context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    
    try {
      // 3. Gunakan fungsi login dari context
      await login({ email, password });

      

      navigate("/");
    } catch (err) {
      // 4. 'login' context akan 'melempar' error jika gagal
      
      const errorMessage =
        err.response?.data?.error || "Email atau password salah.";
      setError(errorMessage);
    }
  };

  return (
    // JSX Form tidak perlu diubah sama sekali
    <div className="form-page-container">
      <h2>Login ke Creacipe</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
