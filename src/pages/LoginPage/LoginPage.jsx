// LOKASI: src/pages/LoginPage/LoginPage.jsx (VERSI DIPERBARUI)

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import "./LoginPage.scss";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { login, isLoggedIn, user } = useAuth();

  // Redirect jika sudah login
  useEffect(() => {
    if (isLoggedIn && user) {
      const roleId = user.Role?.role_id;
      // role_id: 1 = Admin, 2 = Editor, 3 = Member
      if (roleId === 1 || roleId === 2) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isLoggedIn, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Login dulu (AuthContext akan set token)
      await login({ email, password });

      // Fetch profile untuk dapat role yang akurat
      const profileResponse = await userService.getMyProfile();
      const userData = profileResponse.data.data;
      const roleId = userData?.Role?.role_id || userData?.Role?.RoleID;

      // Redirect berdasarkan role_id (1 = Admin, 2 = Editor, 3 = Member)
      if (roleId === 1 || roleId === 2) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      // Tangkap error jika login gagal
      const errorMessage =
        err.response?.data?.error || "Email atau password salah.";
      setError(errorMessage);
      setIsLoading(false);
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
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Memproses..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
